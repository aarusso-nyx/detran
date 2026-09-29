import 'reflect-metadata';
import { randomUUID } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
import { RequestMethod, type CanActivate, type Type } from '@nestjs/common';
import { GUARDS_METADATA } from '@nestjs/common/constants.js';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host.js';
import { ModulesContainer, NestFactory } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import pg from 'pg';
import request from 'supertest';
import {
  CognitoJwtValidator,
  RedisPermissionCacheBackend,
  StynxJwtValidator,
} from '@stynx-nyx/auth';
import {
  RedisSessionStore,
  SessionJwtSigningService,
  STYNX_SESSION_STORE,
} from '@stynx-nyx/sessions';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { DETRAN_POLICY_MATRIX, DETRAN_ROLES } from '@detran/shared';

import { AppModule } from '../../src/app.module.js';
import {
  CPF,
  LOCAL_HOSTNAME,
  asOwner,
  cpfHash,
  headers as portalHeaders,
  seedLocalTenant,
  setCitizen,
} from './portal-e2e.support.js';

const PATH_METADATA = 'path';
const METHOD_METADATA = 'method';
const HTTP_METHODS: Record<number, string> = {
  [RequestMethod.GET]: 'GET',
  [RequestMethod.POST]: 'POST',
  [RequestMethod.PUT]: 'PUT',
  [RequestMethod.PATCH]: 'PATCH',
  [RequestMethod.DELETE]: 'DELETE',
  [RequestMethod.ALL]: 'ALL',
  [RequestMethod.OPTIONS]: 'OPTIONS',
  [RequestMethod.HEAD]: 'HEAD',
};

type Route = {
  method: string;
  path: string;
  controller: string;
  handler: string;
  resource: string | null;
  action: string | null;
  public: boolean;
};

type RuntimeRoute = Route & {
  classRef: Type<unknown>;
  handlerRef: Function;
};

type ObservedRow = Route & {
  principal: string;
  profile: 'local' | 'complete';
  status: number;
  code: string | null;
  layer: string;
  handlerEvaluated?: boolean;
};

type InventoryRow = Route & {
  profile: 'local' | 'complete';
  mounts: Array<'default' | 'speed-meters-on'>;
  globalGuards: string[];
  classGuards: string[];
  methodGuards: string[];
};

const observedRows: ObservedRow[] = [];
const observedInventory: InventoryRow[] = [];
const handlerProofs = new Set<string>();

function proofKey(route: Route, principal: string): string {
  return [
    route.method,
    route.path,
    route.controller,
    route.handler,
    principal,
  ].join('\u0000');
}

function paths(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  return value === undefined ? [''] : [String(value)];
}

function joinPath(left: string, right: string): string {
  const joined = `/${left}/${right}`.replaceAll(/\/{2,}/g, '/');
  return joined === '/' ? joined : joined.replace(/\/$/u, '');
}

function mountedRoutes(container: ModulesContainer): RuntimeRoute[] {
  const routes: RuntimeRoute[] = [];
  for (const module of container.values()) {
    for (const wrapper of module.controllers.values()) {
      const controller = wrapper.metatype as
        (Function & { prototype: Record<string, unknown> }) | undefined;
      if (!controller) continue;
      const classPaths = paths(Reflect.getMetadata(PATH_METADATA, controller));
      for (const handler of Object.getOwnPropertyNames(controller.prototype)) {
        if (handler === 'constructor') continue;
        const target = controller.prototype[handler];
        if (typeof target !== 'function') continue;
        const requestMethod = Reflect.getMetadata(METHOD_METADATA, target) as
          RequestMethod | undefined;
        if (requestMethod === undefined) continue;
        const methodPaths = paths(Reflect.getMetadata(PATH_METADATA, target));
        for (const classPath of classPaths) {
          for (const methodPath of methodPaths) {
            routes.push({
              method: HTTP_METHODS[requestMethod] ?? String(requestMethod),
              path: joinPath(classPath, methodPath),
              controller: controller.name,
              handler,
              resource:
                (Reflect.getMetadata('detran:resource', target) as
                  string | undefined) ??
                (Reflect.getMetadata('detran:resource', controller) as
                  string | undefined) ??
                null,
              action:
                (Reflect.getMetadata('detran:action', target) as
                  string | undefined) ?? null,
              public: Boolean(
                Reflect.getMetadata('detran:public', target) ??
                Reflect.getMetadata('detran:public', controller),
              ),
              classRef: controller as Type<unknown>,
              handlerRef: target,
            });
          }
        }
      }
    }
  }
  return routes.sort((left, right) =>
    [left.method, left.path, left.controller, left.handler]
      .join('\u0000')
      .localeCompare(
        [right.method, right.path, right.controller, right.handler].join(
          '\u0000',
        ),
      ),
  );
}

function unionMountedRoutes(
  normal: Awaited<ReturnType<typeof NestFactory.create>>,
  speed: Awaited<ReturnType<typeof NestFactory.create>>,
): Map<
  string,
  {
    app: Awaited<ReturnType<typeof NestFactory.create>>;
    route: RuntimeRoute;
    mounts: Array<'default' | 'speed-meters-on'>;
  }
> {
  const union = new Map<
    string,
    {
      app: Awaited<ReturnType<typeof NestFactory.create>>;
      route: RuntimeRoute;
      mounts: Array<'default' | 'speed-meters-on'>;
    }
  >();
  for (const [mount, app, routes] of [
    ['default', normal, mountedRoutes(normal.get(ModulesContainer))],
    ['speed-meters-on', speed, mountedRoutes(speed.get(ModulesContainer))],
  ] as const) {
    for (const route of routes) {
      const key = [
        route.method,
        route.path,
        route.controller,
        route.handler,
      ].join('\u0000');
      const existing = union.get(key);
      if (existing) {
        expect([
          existing.route.resource,
          existing.route.action,
          existing.route.public,
          guardNames(existing.route.classRef),
          guardNames(existing.route.handlerRef),
          globalGuards(existing.app).map((guard) => guard.constructor.name),
        ]).toEqual([
          route.resource,
          route.action,
          route.public,
          guardNames(route.classRef),
          guardNames(route.handlerRef),
          globalGuards(app).map((guard) => guard.constructor.name),
        ]);
        existing.mounts.push(mount);
      } else union.set(key, { app, route, mounts: [mount] });
    }
  }
  return union;
}

function guardNames(target: object): string[] {
  const guards =
    (Reflect.getMetadata(GUARDS_METADATA, target) as
      | Array<CanActivate | (new (...args: never[]) => CanActivate)>
      | undefined) ?? [];
  return guards.map((guard) =>
    typeof guard === 'function' ? guard.name : guard.constructor.name,
  );
}

function inventoryRows(
  union: ReturnType<typeof unionMountedRoutes>,
  profile: 'local' | 'complete',
): InventoryRow[] {
  return [...union.values()].map(({ app, route, mounts }) => ({
    method: route.method,
    path: route.path,
    controller: route.controller,
    handler: route.handler,
    resource: route.resource,
    action: route.action,
    public: route.public,
    profile,
    mounts,
    globalGuards: globalGuards(app).map((guard) => guard.constructor.name),
    classGuards: guardNames(route.classRef),
    methodGuards: guardNames(route.handlerRef),
  }));
}

function ambiguousHttpPaths(
  union: ReturnType<typeof unionMountedRoutes>,
): Set<string> {
  const counts = new Map<string, number>();
  for (const { route } of union.values()) {
    const key = `${route.method} ${route.path}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return new Set(
    [...counts].filter(([, count]) => count > 1).map(([key]) => key),
  );
}

function globalGuards(
  app: Awaited<ReturnType<typeof NestFactory.create>>,
): CanActivate[] {
  return (
    app as unknown as { config: { getGlobalGuards: () => CanActivate[] } }
  ).config.getGlobalGuards();
}

function decisionLayer(guard: CanActivate, route: RuntimeRoute): string {
  if (guard.constructor.name !== 'ProvisioningPolicyGuard')
    return guard.constructor.name;
  const provisioningResources = new Set([
    'ops:provisioning',
    'ops:device-key',
    'ops:grant',
    'ops:package',
    'ops:receipt',
    'ops:device-revocation',
  ]);
  return provisioningResources.has(route.resource ?? '')
    ? 'ProvisioningPolicyGuard'
    : 'DetranPolicyGuard';
}

async function probeGuardChain(
  app: Awaited<ReturnType<typeof NestFactory.create>>,
  route: RuntimeRoute,
  authorization?: string,
): Promise<{ status: number; layer: string; code: string | null }> {
  const headers: Record<string, string> = {
    'x-tenant-id': '00000000-0000-7000-8000-000000000001',
    host: 'unmapped.fixture.test',
    'if-match': '"1"',
  };
  if (authorization) headers.authorization = authorization;
  const req = {
    method: route.method,
    path: route.path,
    url: route.path,
    headers,
    ip: '127.0.0.1',
    params: {},
    query: {},
    body: {},
    res: { setHeader: () => undefined },
  };
  const context = new ExecutionContextHost(
    [req, req.res, () => undefined],
    route.classRef,
    route.handlerRef,
  );
  context.setType('http');
  const attached = [route.classRef, route.handlerRef].flatMap(
    (target) =>
      (Reflect.getMetadata(GUARDS_METADATA, target) as
        | Array<CanActivate | (new (...args: never[]) => CanActivate)>
        | undefined) ?? [],
  );
  const guards = [
    ...globalGuards(app),
    ...attached.map((guard) =>
      typeof guard === 'function' ? app.get(guard, { strict: false }) : guard,
    ),
  ];
  for (const guard of guards) {
    try {
      const allowed = await guard.canActivate(context);
      if (!allowed)
        return { status: 403, layer: decisionLayer(guard, route), code: null };
    } catch (error) {
      const response =
        typeof error === 'object' && error && 'getResponse' in error
          ? (error as { getResponse: () => unknown }).getResponse()
          : null;
      const status =
        typeof error === 'object' && error && 'getStatus' in error
          ? (error as { getStatus: () => number }).getStatus()
          : typeof error === 'object' && error && 'status' in error
            ? Number(error.status)
            : 500;
      const code =
        typeof error === 'object' &&
        error &&
        'code' in error &&
        typeof error.code === 'string'
          ? error.code
          : typeof response === 'object' &&
              response &&
              'code' in response &&
              typeof response.code === 'string'
            ? response.code
            : null;
      return { status, layer: decisionLayer(guard, route), code };
    }
  }
  return { status: 200, layer: 'guards-passed', code: null };
}

let defaultApp: Awaited<ReturnType<typeof NestFactory.create>>;
let speedApp: Awaited<ReturnType<typeof NestFactory.create>>;
const savedSpeedFlag = process.env.DETRAN_FEATURE_TEAT_SPEED_METERS;
const completeKeys = [
  'DETRAN_AUTH_MODE',
  'DETRAN_CLINICAL_SIGNING_HEALTH_URL',
  'DETRAN_CLINICAL_SIGNING_TOKEN',
  'DETRAN_CLINICAL_SIGNING_URL',
  'DETRAN_RUNTIME_PROFILE',
  'DETRAN_SEFAZ_REAL_BASE_URL',
  'STYNX_APP_DATABASE_URL',
  'STYNX_COGNITO_ISSUER',
  'STYNX_OWNER_DATABASE_URL',
  'STYNX_READER_DATABASE_URL',
  'STYNX_REDIS_URL',
  'STYNX_SESSION_ISSUER',
  'STYNX_SESSION_SIGNING_SECRET_ID',
] as const;

function configureCompleteProfile(
  databaseUrls: readonly [string, string, string],
): Record<string, string | undefined> {
  const saved = Object.fromEntries(
    completeKeys.map((key) => [key, process.env[key]]),
  );
  process.env.DETRAN_RUNTIME_PROFILE = 'staging-like';
  process.env.DETRAN_AUTH_MODE = 'cognito';
  process.env.STYNX_COGNITO_ISSUER = 'https://cognito.fixture.test/pool';
  process.env.STYNX_SESSION_ISSUER = 'https://sessions.fixture.test';
  process.env.STYNX_REDIS_URL = 'rediss://redis.fixture.test:6380';
  process.env.STYNX_SESSION_SIGNING_SECRET_ID = 'fixture/session-key';
  process.env.STYNX_OWNER_DATABASE_URL = databaseUrls[0];
  process.env.STYNX_APP_DATABASE_URL = databaseUrls[1];
  process.env.STYNX_READER_DATABASE_URL = databaseUrls[2];
  process.env.DETRAN_CLINICAL_SIGNING_URL = 'https://trust.fixture.test/sign';
  process.env.DETRAN_CLINICAL_SIGNING_HEALTH_URL =
    'https://trust.fixture.test/health';
  process.env.DETRAN_CLINICAL_SIGNING_TOKEN = 'fixture-trust-token';
  process.env.DETRAN_SEFAZ_REAL_BASE_URL = 'https://sefaz.fixture.test';
  return saved;
}

async function provisionCompleteProfileDatabase(): Promise<{
  urls: readonly [string, string, string];
  resetRateLimits: () => Promise<void>;
  grantPermission: (
    key: string,
    actorId: string,
    tenantId: string,
  ) => Promise<void>;
  close: () => Promise<void>;
}> {
  const raw = process.env.DETRAN_TEST_DATABASE_URL ?? process.env.DATABASE_URL;
  if (!raw) throw new Error('DETRAN_TEST_DATABASE_URL is required');
  const adminUrl = new URL(raw);
  const admin = new pg.Client({ connectionString: raw });
  await admin.connect();
  const names = [
    `authz_matrix_owner_${process.pid}`,
    `authz_matrix_app_${process.pid}`,
    `authz_matrix_reader_${process.pid}`,
  ] as const;
  const created: string[] = [];
  const grants: string[] = [];
  const permissions: string[] = [];
  async function close(): Promise<void> {
    try {
      for (const id of grants)
        await admin.query('DELETE FROM auth.direct_perms WHERE id = $1', [id]);
      for (const id of permissions)
        await admin.query('DELETE FROM auth.perms WHERE id = $1', [id]);
      for (const name of created) {
        await admin.query(`DROP OWNED BY ${name}`);
        await admin.query(`DROP ROLE ${name}`);
      }
    } finally {
      await admin.end();
    }
  }
  try {
    for (const name of names) {
      const command = await admin.query<{ ddl: string }>(
        "SELECT format('CREATE ROLE %I LOGIN PASSWORD %L', $1::text, $2::text) AS ddl",
        [name, decodeURIComponent(adminUrl.password)],
      );
      await admin.query(command.rows[0]!.ddl);
      created.push(name);
    }
    await admin.query(`GRANT role_app_backend TO ${names[1]}, ${names[2]}`);
    await admin.query(`GRANT USAGE ON SCHEMA portal TO ${names[0]}`);
    await admin.query(`GRANT SELECT ON portal.public_hostname TO ${names[0]}`);
    const urls = names.map((name) => {
      const url = new URL(raw);
      url.username = name;
      return url.toString();
    }) as unknown as readonly [string, string, string];
    return {
      urls,
      resetRateLimits: async () => {
        await admin.query('DELETE FROM integration.rate_limit_windows');
      },
      grantPermission: async (key, actorId, tenantId) => {
        const membership = await admin.query<{ id: string }>(
          `SELECT id FROM auth.memberships
           WHERE user_id = $1 AND tenant_id = $2 AND is_active = true`,
          [actorId, tenantId],
        );
        if (membership.rows.length !== 1)
          throw new Error('Canonical membership is unavailable');
        const permission = await admin.query<{ id: string }>(
          'INSERT INTO auth.perms (key) VALUES ($1) ON CONFLICT (key) DO NOTHING RETURNING id',
          [key],
        );
        if (permission.rows[0]) permissions.push(permission.rows[0].id);
        const existing = permission.rows[0]
          ? permission.rows[0].id
          : (
              await admin.query<{ id: string }>(
                'SELECT id FROM auth.perms WHERE key = $1',
                [key],
              )
            ).rows[0]?.id;
        if (!existing) throw new Error(`Permission ${key} is unavailable`);
        const grant = await admin.query<{ id: string }>(
          `INSERT INTO auth.direct_perms (membership_id, perm_id, effect)
           VALUES ($1, $2, 'allow')
           ON CONFLICT DO NOTHING RETURNING id`,
          [membership.rows[0].id, existing],
        );
        if (grant.rows[0]) grants.push(grant.rows[0].id);
      },
      close,
    };
  } catch (error) {
    await close();
    throw error;
  }
}

function restoreCompleteProfile(
  saved: Record<string, string | undefined>,
): void {
  for (const [key, value] of Object.entries(saved)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}

beforeAll(async () => {
  process.env.DETRAN_RUNTIME_PROFILE = 'test';
  const databaseUrl =
    process.env.DETRAN_TEST_DATABASE_URL ?? process.env.DATABASE_URL;
  const client = new pg.Client({ connectionString: databaseUrl });
  await client.connect();
  try {
    await seedLocalTenant(client);
  } finally {
    await client.end();
  }
  defaultApp = await NestFactory.create(AppModule.forRoot(), { logger: false });
  await defaultApp.init();
  process.env.DETRAN_FEATURE_TEAT_SPEED_METERS = 'on';
  speedApp = await NestFactory.create(AppModule.forRoot(), { logger: false });
  await speedApp.init();
}, 60_000);

afterAll(async () => {
  await defaultApp?.close();
  await speedApp?.close();
  if (savedSpeedFlag === undefined)
    delete process.env.DETRAN_FEATURE_TEAT_SPEED_METERS;
  else process.env.DETRAN_FEATURE_TEAT_SPEED_METERS = savedSpeedFlag;
});

describe('R-0023 — inventário de rotas para a matriz de autorização', () => {
  it('dado AppModule real nas duas montagens quando descobre rotas então conserva metadata inclusive pública e sem Action', () => {
    const defaultRoutes = mountedRoutes(defaultApp.get(ModulesContainer));
    const speedRoutes = mountedRoutes(speedApp.get(ModulesContainer));
    const routes = [...defaultRoutes, ...speedRoutes];
    expect(routes.length).toBeGreaterThan(0);
    expect(routes.some((route) => route.public)).toBe(true);
    expect(routes.some((route) => route.action === null)).toBe(true);
    expect(routes.some((route) => route.path.includes('speed'))).toBe(true);
    expect(globalGuards(defaultApp).length).toBeGreaterThan(2);
    expect(
      ambiguousHttpPaths(unionMountedRoutes(defaultApp, speedApp)).size,
    ).toBe(22);
  });

  it('dado token ausente no perfil local quando executa APP_GUARDs reais então observa a identidade implícita', async () => {
    const route = mountedRoutes(defaultApp.get(ModulesContainer)).find(
      (candidate) =>
        candidate.method === 'GET' &&
        candidate.path === '/v1/portal/identity/me',
    );
    expect(route).toBeDefined();
    const result = await probeGuardChain(defaultApp, route!);
    expect(result).toEqual({
      status: 403,
      layer: 'PortalCitizenGuard',
      code: 'PORTAL.ASSURANCE_NOT_VERIFIED',
    });
  });

  it('dada rota clínica gerada quando compara guarda e HTTP então preserva allow e deny por papel', async () => {
    const previous = process.env.DETRAN_LOCAL_ROLES;
    const route = mountedRoutes(defaultApp.get(ModulesContainer)).find(
      (candidate) =>
        candidate.method === 'GET' && candidate.path === '/v1/ch/patients',
    );
    expect(route).toBeDefined();
    try {
      for (const [role, status] of [
        ['ADMIN', 200],
        ['field-agent', 403],
      ] as const) {
        process.env.DETRAN_LOCAL_ROLES = role;
        const guard = await probeGuardChain(defaultApp, route!, 'Bearer local');
        expect(guard.status).toBe(status);
        const response = await request(defaultApp.getHttpServer())
          .get('/v1/ch/patients')
          .set('Authorization', 'Bearer local')
          .set('X-Tenant-Id', '00000000-0000-7000-8000-000000000001');
        expect(response.status, JSON.stringify(response.body)).toBe(status);
        if (status === 200) handlerProofs.add(proofKey(route!, `role:${role}`));
      }
    } finally {
      if (previous === undefined) delete process.env.DETRAN_LOCAL_ROLES;
      else process.env.DETRAN_LOCAL_ROLES = previous;
    }
  });

  it('dadas ilhas Portal, provisionamento e webhook quando compara guarda e HTTP então conserva primeiro ponto de negação', async () => {
    const previousRole = process.env.DETRAN_LOCAL_ROLES;
    const routes = mountedRoutes(defaultApp.get(ModulesContainer));
    try {
      for (const sample of [
        { method: 'GET', path: '/v1/portal/identity/me', role: 'ADMIN' },
        {
          method: 'GET',
          path: '/v1/ops/provisioning/device-keys',
          role: 'ADMIN',
        },
        {
          method: 'POST',
          path: '/v1/ch/transmissions/callbacks/renach',
          role: 'ADMIN',
        },
      ]) {
        const route = routes.find(
          (candidate) =>
            candidate.method === sample.method &&
            candidate.path === sample.path,
        );
        expect(route).toBeDefined();
        process.env.DETRAN_LOCAL_ROLES = sample.role;
        const guard = await probeGuardChain(defaultApp, route!, 'Bearer local');
        const call =
          sample.method === 'POST'
            ? request(defaultApp.getHttpServer()).post(sample.path)
            : request(defaultApp.getHttpServer()).get(sample.path);
        const response = await call
          .set('Authorization', 'Bearer local')
          .set('X-Tenant-Id', '00000000-0000-7000-8000-000000000001')
          .set('If-Match', '"1"');
        expect(response.status, JSON.stringify(response.body)).toBe(
          guard.status,
        );
        expect(response.body.code ?? null).toBe(guard.code);
      }
    } finally {
      if (previousRole === undefined) delete process.env.DETRAN_LOCAL_ROLES;
      else process.env.DETRAN_LOCAL_ROLES = previousRole;
    }
  });

  it('dado Host do tenant A e X-Tenant-Id do B quando cria manifestação oportunista então conserva a linha de base #159', async () => {
    const tenantB = '00000000-0000-7000-8000-000000000102';
    const databaseUrl =
      process.env.DETRAN_TEST_DATABASE_URL ?? process.env.DATABASE_URL;
    const client = new pg.Client({ connectionString: databaseUrl });
    const saved = Object.fromEntries(
      [
        'DETRAN_LOCAL_ROLES',
        'DETRAN_LOCAL_CPF',
        'DETRAN_LOCAL_ASSURANCE_LEVEL',
      ].map((key) => [key, process.env[key]]),
    );
    const key = randomUUID();
    let manifestationId: string | undefined;
    await client.connect();
    try {
      await seedLocalTenant(client);
      await asOwner(client);
      await client.query(
        `insert into auth.tenants (id, slug, name)
         values ($1, 'sp', 'DETRAN SP') on conflict (id) do nothing`,
        [tenantB],
      );
      setCitizen({ cpf: CPF.prata, level: 'avancada' });
      const common = portalHeaders({
        host: LOCAL_HOSTNAME,
        'x-tenant-id': tenantB,
        'idempotency-key': key,
      });
      const me = await request(defaultApp.getHttpServer())
        .get('/v1/portal/identity/me')
        .set(common);
      expect(me.status, JSON.stringify(me.body)).toBe(403);
      const response = await request(defaultApp.getHttpServer())
        .post('/v1/portal/manifestations')
        .set(common)
        .send({ kind: 'reclamacao', text: 'R-0023 matriz antes #159' });
      expect(response.status, JSON.stringify(response.body)).toBe(201);
      expect(response.body.anonymous).toBe(true);
      manifestationId = response.body.manifestationId as string;
      await asOwner(client);
      await client.query("select set_config('app.tenant_id', $1, false)", [
        tenantB,
      ]);
      const row = await client.query<{
        tenant_id: string;
        anonymous: boolean;
        subject_id: string | null;
      }>(
        'select tenant_id, anonymous, subject_id from portal.manifestation where id = $1',
        [manifestationId],
      );
      expect(row.rows[0]).toEqual({
        tenant_id: tenantB,
        anonymous: true,
        subject_id: null,
      });
      const leaked = await client.query(
        'select id from portal.subject where tenant_id = $1 and cpf_hash = $2',
        [tenantB, cpfHash(CPF.prata)],
      );
      expect(leaked.rows).toEqual([]);
    } finally {
      await asOwner(client);
      await client.query("select set_config('app.tenant_id', $1, false)", [
        tenantB,
      ]);
      await client.query(
        'delete from portal.idempotency_record where tenant_id = $1 and key like $2',
        [tenantB, `%:${key}`],
      );
      if (manifestationId) {
        await client.query(
          'delete from integration.outbox where tenant_id = $1 and aggregate_id = $2',
          [tenantB, manifestationId],
        );
        await client.query(
          'delete from portal.manifestation where tenant_id = $1 and id = $2',
          [tenantB, manifestationId],
        );
      }
      await client.end();
      for (const [key, value] of Object.entries(saved)) {
        if (value === undefined) delete process.env[key];
        else process.env[key] = value;
      }
    }
  });

  it('dados os 36 papéis isolados no perfil local quando percorrem as rotas montadas então as guardas só decidem allow/401/403', async () => {
    const previous = process.env.DETRAN_LOCAL_ROLES;
    const previousDecisionBody = process.env.DETRAN_LOCAL_DECISION_BODY;
    try {
      const union = unionMountedRoutes(defaultApp, speedApp);
      observedInventory.push(...inventoryRows(union, 'local'));
      const failures: string[] = [];
      const admin = new pg.Client({
        connectionString:
          process.env.DETRAN_TEST_DATABASE_URL ?? process.env.DATABASE_URL,
      });
      await admin.connect();
      try {
        const variants = [
          ...DETRAN_ROLES.map((role) => ({
            id: `role:${role}`,
            role,
            decisionBody: undefined as string | undefined,
            authorization: 'Bearer local' as string | undefined,
          })),
          {
            id: 'none',
            role: undefined,
            decisionBody: undefined,
            authorization: undefined,
          },
          {
            id: 'role:traffic-authority;decision_body=absent',
            role: 'traffic-authority',
            decisionBody: undefined,
            authorization: 'Bearer local',
          },
          {
            id: 'role:traffic-authority;decision_body=diretoria-fiscalizacao',
            role: 'traffic-authority',
            decisionBody: 'diretoria-fiscalizacao',
            authorization: 'Bearer local',
          },
        ];
        for (const variant of variants) {
          if (variant.role === undefined) delete process.env.DETRAN_LOCAL_ROLES;
          else process.env.DETRAN_LOCAL_ROLES = variant.role;
          if (variant.decisionBody === undefined)
            delete process.env.DETRAN_LOCAL_DECISION_BODY;
          else process.env.DETRAN_LOCAL_DECISION_BODY = variant.decisionBody;
          for (const { app, route } of union.values()) {
            await admin.query('DELETE FROM integration.rate_limit_windows');
            const result = await probeGuardChain(
              app,
              route,
              variant.authorization,
            );
            observedRows.push({
              method: route.method,
              path: route.path,
              controller: route.controller,
              handler: route.handler,
              resource: route.resource,
              action: route.action,
              public: route.public,
              principal: variant.id,
              profile: 'local',
              status: result.status,
              code: result.code,
              layer: result.layer,
              ...(result.status === 200 &&
              handlerProofs.has(proofKey(route, variant.id))
                ? { handlerEvaluated: true }
                : {}),
            });
            if (![200, 401, 403].includes(result.status))
              failures.push(
                `${variant.id} ${route.method} ${route.path} ${result.layer} ${result.status}`,
              );
          }
        }
      } finally {
        await admin.end();
      }
      expect(failures.slice(0, 25), `${failures.length} failures`).toEqual([]);
      expect(union.size).toBe(1036);
    } finally {
      if (previous === undefined) delete process.env.DETRAN_LOCAL_ROLES;
      else process.env.DETRAN_LOCAL_ROLES = previous;
      if (previousDecisionBody === undefined)
        delete process.env.DETRAN_LOCAL_DECISION_BODY;
      else process.env.DETRAN_LOCAL_DECISION_BODY = previousDecisionBody;
    }
  }, 120_000);

  it('dado staging-like com portas externas dubladas quando AppModule inicia então conserva StynxAuthGuard e alcança a prontidão real do banco', async () => {
    const database = await provisionCompleteProfileDatabase();
    const saved = configureCompleteProfile(database.urls);
    const previousSpeedFlag = process.env.DETRAN_FEATURE_TEAT_SPEED_METERS;
    const apps: Array<Awaited<ReturnType<typeof NestFactory.create>>> = [];
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          pades: true,
          tsa: true,
          lta: true,
          certificateValidation: ['OCSP'],
        }),
      }),
    );
    const tenantId = '00000000-0000-7000-8000-00000000a001';
    const actorId = '00000000-0000-4000-8000-0000b0000001';
    const validate = vi.fn(async () => ({
      sub: actorId,
      sid: 'authz-staging-session',
      tenantId,
      claims: {},
    }));
    const store = {
      getSession: vi.fn(async (sid: string) => ({
        sid,
        userId: actorId,
        tenantId,
        status: 'active',
        expiresAt: '2099-01-01T00:00:00.000Z',
        idleExpiresAt: '2099-01-01T00:00:00.000Z',
      })),
      listSessionIdsByTenant: async () => [],
      listSessionIdsByUser: async () => [],
    };
    const permissionCacheBackend = {
      get: async () => null,
      set: async () => undefined,
      delete: async () => undefined,
      invalidateScope: async () => undefined,
      subscribe: async () => undefined,
      publish: async () => undefined,
      close: async () => undefined,
    };
    const signing = { getJwks: async () => ({ keys: [{ kid: 'fixture' }] }) };
    try {
      async function createCompleteApp(speed: boolean) {
        if (speed) process.env.DETRAN_FEATURE_TEAT_SPEED_METERS = 'on';
        else delete process.env.DETRAN_FEATURE_TEAT_SPEED_METERS;
        const module = await Test.createTestingModule({
          imports: [AppModule.forRoot()],
        })
          .overrideProvider(StynxJwtValidator)
          .useValue({ validate })
          .overrideProvider(CognitoJwtValidator)
          .useValue({ validateAccessToken: async () => ({ claims: {} }) })
          .overrideProvider(RedisPermissionCacheBackend)
          .useValue(permissionCacheBackend)
          .overrideProvider(STYNX_SESSION_STORE)
          .useValue(store)
          .overrideProvider(RedisSessionStore)
          .useValue(store)
          .overrideProvider(SessionJwtSigningService)
          .useValue(signing)
          .compile();
        const app = module.createNestApplication({ logger: false });
        apps.push(app);
        await app.init();
        return app;
      }
      const completeDefault = await createCompleteApp(false);
      const completeSpeed = await createCompleteApp(true);
      expect(completeDefault.get(StynxJwtValidator)).toBeDefined();
      expect(mountedRoutes(completeDefault.get(ModulesContainer)).length).toBe(
        1026,
      );
      expect(mountedRoutes(completeSpeed.get(ModulesContainer)).length).toBe(
        1042,
      );
      const union = unionMountedRoutes(completeDefault, completeSpeed);
      observedInventory.push(...inventoryRows(union, 'complete'));
      const failures: string[] = [];
      for (const { app, route } of union.values()) {
        await database.resetRateLimits();
        const result = await probeGuardChain(app, route);
        observedRows.push({
          method: route.method,
          path: route.path,
          controller: route.controller,
          handler: route.handler,
          resource: route.resource,
          action: route.action,
          public: route.public,
          principal: 'none',
          profile: 'complete',
          status: result.status,
          code: result.code,
          layer: result.layer,
        });
        if (![200, 401, 403].includes(result.status))
          failures.push(
            `${route.method} ${route.path} ${result.layer} ${result.status}`,
          );
      }
      expect(failures.slice(0, 25), `${failures.length} failures`).toEqual([]);
      await database.grantPermission('*', actorId, tenantId);
      const wildcardResponse = await request(completeDefault.getHttpServer())
        .get('/v1/ch/patients')
        .set('Authorization', 'Bearer authz-matrix-fixture')
        .set('X-Tenant-Id', tenantId);
      expect(
        wildcardResponse.status,
        JSON.stringify(wildcardResponse.body),
      ).toBe(500);
      expect(wildcardResponse.body.code).toBe(
        'REQUEST_CONTEXT_MUTATION_FORBIDDEN',
      );
      expect(validate).toHaveBeenCalledWith('authz-matrix-fixture');
      expect(store.getSession).toHaveBeenCalledWith('authz-staging-session');
      if (process.env.DETRAN_AUTHZ_MATRIX_OUTPUT) {
        const policyResources = [
          ...new Set([
            ...Object.keys(DETRAN_POLICY_MATRIX).map((key) =>
              key.split(':').slice(0, 2).join(':'),
            ),
            'ops:provisioning',
            'inf:rait-case',
            'inf:rait-oral-argument',
            'ch:retention',
            'ops:parameter',
          ]),
        ].sort();
        await writeFile(
          process.env.DETRAN_AUTHZ_MATRIX_OUTPUT,
          JSON.stringify({
            rows: observedRows,
            inventory: observedInventory,
            policyResources,
          }),
          'utf8',
        );
      }
    } finally {
      for (const app of apps.reverse()) await app.close();
      vi.unstubAllGlobals();
      restoreCompleteProfile(saved);
      if (previousSpeedFlag === undefined)
        delete process.env.DETRAN_FEATURE_TEAT_SPEED_METERS;
      else process.env.DETRAN_FEATURE_TEAT_SPEED_METERS = previousSpeedFlag;
      await database.close();
    }
  }, 60_000);
});
