import { randomUUID } from 'node:crypto';
import type http from 'node:http';
import type {
  CallHandler,
  ExecutionContext,
  INestApplication,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PortalClock } from '@detran/portal-identity';
import { TenantContextInterceptor } from '@stynx-nyx/tenancy';
import request from 'supertest';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { AppModule } from '../../src/app.module.js';
import {
  ACTOR_ID as PORTAL_ACTOR_ID,
  CPF,
  E2eFixedClock,
  LOCAL_HOSTNAME,
  SERVICE_CATALOG_ROWS,
  TENANT_ID as PORTAL_TENANT_ID,
  clearCitizenEnv,
  cpfHash,
  createPortalApp,
  seedLocalParameters,
  seedLocalTenant,
  setCitizen,
} from './portal-e2e.support.js';
import {
  ACTOR_A,
  ACTOR_B,
  TENANT_A,
  TENANT_B,
  appRoleControl,
  asOwnerIn,
  asOwnerRole,
  newOwnerClient,
  openStream,
  seedIsolationTenants,
  settle,
} from './r22-sse-tenancy.support.js';

/**
 * R-0022 CTG-0001 §5 (TASK-0002) — C-01-01…C-01-11: caracterização da costura
 * de tenancy do backend sobre STYNX 1.4.0 (com o _shim_ de `app.module.ts`),
 * válida sem edição depois do pin 1.5.0 e das remoções de CTG-0003/CTG-0004
 * (CTG-0001 §0.1): só rotas, cabeçalhos, status, corpo e banco; nenhum
 * `it.fails`.
 *
 * Perfis (CTG-0001 §2): P1 autenticado com _membership_; P2 rota pública com
 * Host; P3 autenticação oportunista (`POST /v1/portal/manifestations`); P4 sem
 * tenant. Tenants/atores de isolamento: os de `tools/check-rls-smoke.ts`
 * (A `…101`, B `…102`, ator A `…201`, ator B `…202`); tenant, Host e persona
 * do Portal: os do _harness_ `portal-e2e.support.ts` (tenant `…0001`, Host
 * `portal.local-e2e.invalid`, ator `…0002`, CPF fixture prata).
 *
 * T-14 (CTG-0001 §1.1): no perfil `test` o verificador local autentica um
 * principal com `tenants: [LOCAL_TENANT_ID]`, lido no carregamento de
 * `detran-runtime.ts`. A _claim_ de cada caso P1 é, portanto, fixada por
 * instância do app: cada instância com outra _claim_ é montada depois de
 * `vi.resetModules()` com `DETRAN_LOCAL_TENANT_ID` no ambiente, antes do
 * `import` dinâmico do `AppModule` (padrão de env antes do import).
 *
 * A/B de C-01-01: a ordem de registro entre o contexto do core
 * (`RequestContextInterceptor`) e o `TenantContextInterceptor` é forçada só no
 * módulo de teste (a lista de interceptores globais do app compilado,
 * reordenada antes de `app.init()`), sem _flag_ de produção; a ordem efetiva
 * de cada braço é demonstrada em execução, requisição a requisição. Os casos
 * C-01-05…C-01-10 rodam no app com a ordem de registro de produção (sem
 * reordenação), montado pelo _harness_ do Portal.
 *
 * C-01-11 não é caso deste arquivo: é o comando `pnpm backend:rls-smoke`
 * (`tools/check-rls-smoke.ts`), com a saída repetida no relatório de TASK-0002.
 */

type ArmOrder = 'core-antes-do-tenancy' | 'core-depois-do-tenancy';

interface Arm {
  order: ArmOrder;
  app: INestApplication;
  port: number;
  trace: string[];
  registered: string[];
  /** Ordem de registro do app compilado antes da reordenação (produção). */
  production: ArmOrder;
}

const client = newOwnerClient();
const openRequests: http.ClientRequest[] = [];
const arms: Arm[] = [];
const createdManifestations: Array<{ id: string; tenantId: string }> = [];
const createdServiceCatalogIds: string[] = [];
const subjectsBefore = new Set<string>();
const previousEnv: Record<string, string | undefined> = {};
const B_SERVICE_MARKER = '(fixture e2e R-0022 tenant B)';
const PORTAL_BRAND_A = 'Local E2E Portal (fixture)';

function isCoreContext(interceptor: object): boolean {
  return interceptor.constructor.name === 'RequestContextInterceptor';
}

function isTenancy(interceptor: object): boolean {
  return interceptor instanceof TenantContextInterceptor;
}

/** Interceptores globais do app compilado (instrumentação só do teste). */
function globalInterceptors(app: INestApplication): object[] {
  return (
    app as unknown as { config: { getGlobalInterceptors(): object[] } }
  ).config.getGlobalInterceptors();
}

/** Ordem de registro de produção: a do app compilado, antes de qualquer reordenação. */
function registeredOrder(app: INestApplication): ArmOrder {
  const interceptors = globalInterceptors(app);
  const core = interceptors.findIndex(isCoreContext);
  const tenancy = interceptors.findIndex(isTenancy);
  expect(core, 'RequestContextInterceptor global').toBeGreaterThanOrEqual(0);
  expect(tenancy, 'TenantContextInterceptor global').toBeGreaterThanOrEqual(0);
  return core < tenancy ? 'core-antes-do-tenancy' : 'core-depois-do-tenancy';
}

/** Força a ordem do braço e instrumenta as instâncias para registrar a ordem efetiva. */
function forceOrder(
  app: INestApplication,
  order: ArmOrder,
  trace: string[],
): string[] {
  const interceptors = globalInterceptors(app);
  const core = interceptors.filter(isCoreContext);
  const tenancy = interceptors.filter(isTenancy);
  expect(core.length, 'RequestContextInterceptor global').toBeGreaterThan(0);
  expect(tenancy.length, 'TenantContextInterceptor global').toBe(1);
  const firstIndex = interceptors.findIndex(
    (interceptor) => isCoreContext(interceptor) || isTenancy(interceptor),
  );
  const rest = interceptors.filter(
    (interceptor) => !isCoreContext(interceptor) && !isTenancy(interceptor),
  );
  const block =
    order === 'core-antes-do-tenancy'
      ? [...core, ...tenancy]
      : [...tenancy, ...core];
  const reordered = [
    ...rest.slice(0, firstIndex),
    ...block,
    ...rest.slice(firstIndex),
  ];
  interceptors.splice(0, interceptors.length, ...reordered);
  for (const interceptor of [...core, ...tenancy]) {
    const label = isTenancy(interceptor) ? 'tenancy' : 'core';
    const target = interceptor as {
      intercept(context: ExecutionContext, next: CallHandler): unknown;
    };
    const original = target.intercept.bind(target);
    target.intercept = (context, next) => {
      trace.push(label);
      return original(context, next);
    };
  }
  return globalInterceptors(app).map((interceptor) =>
    isTenancy(interceptor)
      ? 'tenancy'
      : isCoreContext(interceptor)
        ? 'core'
        : 'outro',
  );
}

async function bootArm(order: ArmOrder): Promise<Arm> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule.forRoot()],
  })
    .overrideProvider(PortalClock)
    .useValue(new E2eFixedClock())
    .compile();
  const app = moduleRef.createNestApplication({
    logger: false,
    abortOnError: false,
  });
  const trace: string[] = [];
  const production = registeredOrder(app);
  const registered = forceOrder(app, order, trace);
  await app.init();
  await app.listen(0);
  const address = app.getHttpServer().address();
  return {
    order,
    app,
    port: typeof address === 'object' && address ? address.port : 0,
    trace,
    registered,
    production,
  };
}

/**
 * Instância do app com outra _claim_ (T-14): `DETRAN_LOCAL_TENANT_ID` antes
 * do `import` dinâmico de um grafo de módulos novo.
 */
async function bootWithClaim(
  claimTenantId: string,
): Promise<{ app: INestApplication; port: number }> {
  const previous = process.env.DETRAN_LOCAL_TENANT_ID;
  process.env.DETRAN_LOCAL_TENANT_ID = claimTenantId;
  vi.resetModules();
  try {
    const { Test: FreshTest } = await import('@nestjs/testing');
    const { AppModule: FreshAppModule } =
      await import('../../src/app.module.js');
    const moduleRef = await FreshTest.createTestingModule({
      imports: [FreshAppModule.forRoot()],
    }).compile();
    const app = moduleRef.createNestApplication({
      logger: false,
      abortOnError: false,
    });
    await app.init();
    await app.listen(0);
    const address = app.getHttpServer().address();
    return {
      app,
      port: typeof address === 'object' && address ? address.port : 0,
    };
  } finally {
    if (previous === undefined) delete process.env.DETRAN_LOCAL_TENANT_ID;
    else process.env.DETRAN_LOCAL_TENANT_ID = previous;
  }
}

function portalOnHostA(
  extra: Record<string, string> = {},
): Record<string, string> {
  return { host: LOCAL_HOSTNAME, ...extra };
}

async function subjectRows(tenantId: string, cpf: string): Promise<number> {
  await asOwnerRole(client);
  const result = await client.query<{ count: string }>(
    `select count(*)::text as count from portal.subject where tenant_id = $1 and cpf_hash = $2`,
    [tenantId, cpfHash(cpf)],
  );
  return Number(result.rows[0]?.count ?? 0);
}

async function manifestationCount(tenantId: string): Promise<number> {
  await asOwnerRole(client);
  const result = await client.query<{ count: string }>(
    `select count(*)::text as count from portal.manifestation where tenant_id = $1`,
    [tenantId],
  );
  return Number(result.rows[0]?.count ?? 0);
}

function idempotencyKey(): string {
  return randomUUID();
}

async function trackManifestation(id: unknown): Promise<void> {
  if (typeof id !== 'string') return;
  await asOwnerRole(client);
  const result = await client.query<{ tenant_id: string }>(
    `select tenant_id from portal.manifestation where id = $1`,
    [id],
  );
  const tenantId = result.rows[0]?.tenant_id;
  if (tenantId) createdManifestations.push({ id, tenantId });
}

beforeAll(async () => {
  for (const key of [
    'DETRAN_RUNTIME_PROFILE',
    'DETRAN_LOCAL_TENANT_ID',
    'DETRAN_LOCAL_ACTOR_ID',
    'DETRAN_LOCAL_ROLES',
    'DETRAN_PORTAL_HOST_RESOLUTION',
  ]) {
    previousEnv[key] = process.env[key];
  }
  process.env.DETRAN_RUNTIME_PROFILE = 'test';
  process.env.DETRAN_LOCAL_ACTOR_ID = PORTAL_ACTOR_ID;
  process.env.DETRAN_LOCAL_ROLES = 'field-agent';

  await client.connect();
  await seedIsolationTenants(client);
  await seedLocalTenant(client);
  await seedLocalParameters(client);
  await asOwnerRole(client);
  for (const row of (
    await client.query<{ id: string }>(
      `select id::text as id from portal.subject where tenant_id = any($1::uuid[])`,
      [[TENANT_A, TENANT_B, PORTAL_TENANT_ID]],
    )
  ).rows)
    subjectsBefore.add(row.id);

  // Linhas de `service_catalog` de B (owner; só preparação), com as chaves do
  // harness e título marcado para reconhecê-las em qualquer resposta.
  await asOwnerIn(client, TENANT_B);
  for (const row of SERVICE_CATALOG_ROWS.slice(0, 3)) {
    const id = randomUUID();
    await client.query(
      `insert into portal.service_catalog (
         id, tenant_id, service_key, route, category, title, summary, requirements_json,
         delivery_channel, legal_deadline, cost, accessibility_note, responsible_party,
         normative_reference, availability, unavailable_reason, alternative_channel_note,
         minimum_assurance, version, effective_from
       ) values (
         $1, $2, $3, $4, $5, $6, $6, '["Conta gov.br"]'::jsonb, 'portal', $7,
         'gratuito', 'Conforme declaração de acessibilidade (RN-PORTAL-113)', 'RLS B',
         'fixture e2e', $8, null, null, $9, 1, '2026-01-01'
       )
       on conflict (tenant_id, service_key) do nothing`,
      [
        id,
        TENANT_B,
        row.serviceKey,
        `/servicos/${row.serviceKey.replaceAll('_', '-')}`,
        row.category,
        `${row.serviceKey} ${B_SERVICE_MARKER}`,
        row.legalDeadline,
        row.availability,
        row.minimum,
      ],
    );
    createdServiceCatalogIds.push(id);
  }

  arms.push(await bootArm('core-antes-do-tenancy'));
  arms.push(await bootArm('core-depois-do-tenancy'));
}, 120_000);

afterEach(async () => {
  for (const req of openRequests.splice(0)) req.destroy();
  clearCitizenEnv();
  process.env.DETRAN_LOCAL_ROLES = 'field-agent';
  process.env.DETRAN_LOCAL_ACTOR_ID = PORTAL_ACTOR_ID;
  for (const arm of arms) arm.trace.length = 0;
  await settle(50);
});

afterAll(async () => {
  for (const arm of arms) await arm.app.close();
  await asOwnerRole(client);
  const manifestationIds = createdManifestations.map((row) => row.id);
  if (manifestationIds.length > 0) {
    await client.query(
      `delete from portal.idempotency_record
        where response_json->>'manifestationId' = any($1::text[])`,
      [manifestationIds],
    );
    await client.query(
      `delete from integration.outbox where aggregate_id = any($1::text[])`,
      [manifestationIds],
    );
    await client.query(
      `delete from portal.manifestation where id = any($1::uuid[])`,
      [manifestationIds],
    );
  }
  const createdSubjects = (
    await client.query<{ id: string }>(
      `select id::text as id from portal.subject where tenant_id = any($1::uuid[])`,
      [[TENANT_A, TENANT_B, PORTAL_TENANT_ID]],
    )
  ).rows
    .map((row) => row.id)
    .filter((id) => !subjectsBefore.has(id));
  if (createdSubjects.length > 0) {
    await client.query(
      `delete from portal.idempotency_record where subject_id = any($1::uuid[])`,
      [createdSubjects],
    );
    await client.query(
      `delete from portal.subject where id = any($1::uuid[])`,
      [createdSubjects],
    );
  }
  if (createdServiceCatalogIds.length > 0) {
    await client.query(
      `delete from portal.service_catalog where id = any($1::uuid[])`,
      [createdServiceCatalogIds],
    );
  }
  await client.end();
  for (const [key, value] of Object.entries(previousEnv)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

describe('C-01-01 — A/B da ordem entre o contexto do core e o TenantContextInterceptor', () => {
  it.each(['core-antes-do-tenancy', 'core-depois-do-tenancy'] as const)(
    'C-01-01 — dado o braço %s quando P1 GET /v1/ops/stream, P4 GET /healthz e P2 GET /v1/portal/brand pelo Host A então P1 e P4 200, P2 200 na ordem de produção (CTG-0001 A2), ordem efetiva demonstrada e nenhum RequestContextMissingError nem 500',
    async (order) => {
      const arm = arms.find((candidate) => candidate.order === order)!;
      const firstCore = arm.registered.indexOf('core');
      const tenancy = arm.registered.indexOf('tenancy');
      if (order === 'core-antes-do-tenancy')
        expect(firstCore).toBeLessThan(tenancy);
      else expect(tenancy).toBeLessThan(firstCore);

      const effectiveOrder = (): void => {
        const core = arm.trace.indexOf('core');
        const tenant = arm.trace.indexOf('tenancy');
        expect(core, JSON.stringify(arm.trace)).toBeGreaterThanOrEqual(0);
        expect(tenant, JSON.stringify(arm.trace)).toBeGreaterThanOrEqual(0);
        if (order === 'core-antes-do-tenancy')
          expect(core, JSON.stringify(arm.trace)).toBeLessThan(tenant);
        else expect(tenant, JSON.stringify(arm.trace)).toBeLessThan(core);
      };

      // P1 — rota de leitura já verde em e2e (teat-stream.e2e.spec.ts).
      arm.trace.length = 0;
      process.env.DETRAN_LOCAL_ROLES = 'field-agent';
      const p1 = openStream(
        arm.port,
        '/v1/ops/stream',
        {
          authorization: 'Bearer local',
          'x-tenant-id': PORTAL_TENANT_ID,
          accept: 'text/event-stream',
        },
        openRequests,
      );
      await p1.opened;
      expect(p1.status(), p1.body()).toBe(200);
      expect(p1.comments).toContain(': connected');
      p1.close();
      effectiveOrder();

      // P2 — rota pública do Portal, tenant pelo Host A mapeado. CTG-0001 A2:
      // 200 é propriedade só da ordem de produção nas duas fases; no outro
      // braço, 200 (com a marca de A) ou rejeição, nunca 5xx nem
      // RequestContextMissingError ("P2 → 200 nas duas ordens" é C-03).
      arm.trace.length = 0;
      process.env.DETRAN_PORTAL_HOST_RESOLUTION = 'on';
      const p2 = await request(arm.app.getHttpServer())
        .get('/v1/portal/brand')
        .set(portalOnHostA());
      expect(JSON.stringify(p2.body)).not.toMatch(/RequestContextMissing/);
      expect(p2.status, JSON.stringify(p2.body)).toBeLessThan(500);
      if (order === arm.production)
        expect(p2.status, JSON.stringify(p2.body)).toBe(200);
      if (p2.status === 200)
        expect(JSON.stringify(p2.body)).toContain(PORTAL_BRAND_A);
      effectiveOrder();

      // P4 — sem tenant.
      arm.trace.length = 0;
      const p4 = await request(arm.app.getHttpServer()).get('/healthz');
      expect(p4.status, JSON.stringify(p4.body)).toBe(200);
      expect(JSON.stringify(p4.body)).not.toMatch(/RequestContextMissing/);
      effectiveOrder();
    },
  );
});

describe('C-01-02…C-01-04 — P1 negativos (claim, cabeçalho e membership)', () => {
  let claimB: { app: INestApplication; port: number };
  let claimA: { app: INestApplication; port: number };

  beforeAll(async () => {
    claimB = await bootWithClaim(TENANT_B);
    claimA = await bootWithClaim(TENANT_A);
  }, 120_000);

  afterAll(async () => {
    await claimB?.app.close();
    await claimA?.app.close();
  });

  it('C-01-02 — dado claim = B, X-Tenant-Id = B e ator A (membership só em A) quando P1 GET /v1/ops/stream e GET /v1/portal/identity/me então 403 sem corpo SSE e nenhuma linha escrita em B; ator B no mesmo tenant (controle positivo) então 200; a conexão do app é role_app_backend no tenant do contexto', async () => {
    const control = await appRoleControl(claimB.app, TENANT_B, ACTOR_A);
    expect(control).toEqual({
      current_user: 'role_app_backend',
      tenant_id: TENANT_B,
      actor_id: ACTOR_A,
    });

    const before = await subjectRows(TENANT_B, CPF.prata);
    process.env.DETRAN_LOCAL_ACTOR_ID = ACTOR_A;
    process.env.DETRAN_LOCAL_ROLES = 'field-agent';
    const stream = openStream(
      claimB.port,
      '/v1/ops/stream',
      {
        authorization: 'Bearer local',
        'x-tenant-id': TENANT_B,
        accept: 'text/event-stream',
      },
      openRequests,
    );
    await stream.opened;
    await stream.ended;
    expect(stream.status(), stream.body()).toBe(403);
    expect(stream.body()).not.toContain(': connected');
    expect(String(stream.headers()['content-type'])).not.toContain(
      'text/event-stream',
    );

    setCitizen({ cpf: CPF.prata, level: 'avancada' });
    process.env.DETRAN_LOCAL_ACTOR_ID = ACTOR_A;
    const me = await request(claimB.app.getHttpServer())
      .get('/v1/portal/identity/me')
      .set({ authorization: 'Bearer local', 'x-tenant-id': TENANT_B });
    expect(me.status, JSON.stringify(me.body)).toBe(403);
    expect(me.body).not.toHaveProperty('subjectId');
    expect(await subjectRows(TENANT_B, CPF.prata)).toBe(before);

    // Controle positivo: ator B tem membership em B.
    clearCitizenEnv();
    process.env.DETRAN_LOCAL_ACTOR_ID = ACTOR_B;
    process.env.DETRAN_LOCAL_ROLES = 'field-agent';
    const allowed = openStream(
      claimB.port,
      '/v1/ops/stream',
      {
        authorization: 'Bearer local',
        'x-tenant-id': TENANT_B,
        accept: 'text/event-stream',
      },
      openRequests,
    );
    await allowed.opened;
    expect(allowed.status(), allowed.body()).toBe(200);
    allowed.close();
  });

  it('C-01-03 — dado claim = A e X-Tenant-Id = B (ator A) quando P1 GET /v1/ops/stream e GET /v1/portal/identity/me então 403, nunca dados de A nem de B; X-Tenant-Id = A (controle positivo) então 200; a conexão do app é role_app_backend no tenant do contexto', async () => {
    const control = await appRoleControl(claimA.app, TENANT_A, ACTOR_A);
    expect(control).toEqual({
      current_user: 'role_app_backend',
      tenant_id: TENANT_A,
      actor_id: ACTOR_A,
    });

    const beforeA = await subjectRows(TENANT_A, CPF.prata);
    const beforeB = await subjectRows(TENANT_B, CPF.prata);
    process.env.DETRAN_LOCAL_ACTOR_ID = ACTOR_A;
    process.env.DETRAN_LOCAL_ROLES = 'field-agent';
    const stream = openStream(
      claimA.port,
      '/v1/ops/stream',
      {
        authorization: 'Bearer local',
        'x-tenant-id': TENANT_B,
        accept: 'text/event-stream',
      },
      openRequests,
    );
    await stream.opened;
    await stream.ended;
    expect(stream.status(), stream.body()).toBe(403);
    expect(stream.body()).not.toContain(': connected');
    expect(stream.body()).not.toContain(TENANT_A);

    setCitizen({ cpf: CPF.prata, level: 'avancada' });
    process.env.DETRAN_LOCAL_ACTOR_ID = ACTOR_A;
    const me = await request(claimA.app.getHttpServer())
      .get('/v1/portal/identity/me')
      .set({ authorization: 'Bearer local', 'x-tenant-id': TENANT_B });
    expect(me.status, JSON.stringify(me.body)).toBe(403);
    expect(me.body).not.toHaveProperty('subjectId');
    expect(await subjectRows(TENANT_A, CPF.prata)).toBe(beforeA);
    expect(await subjectRows(TENANT_B, CPF.prata)).toBe(beforeB);

    clearCitizenEnv();
    process.env.DETRAN_LOCAL_ACTOR_ID = ACTOR_A;
    process.env.DETRAN_LOCAL_ROLES = 'field-agent';
    const allowed = openStream(
      claimA.port,
      '/v1/ops/stream',
      {
        authorization: 'Bearer local',
        'x-tenant-id': TENANT_A,
        accept: 'text/event-stream',
      },
      openRequests,
    );
    await allowed.opened;
    expect(allowed.status(), allowed.body()).toBe(200);
    allowed.close();
  });

  it('C-01-04 — dado X-Tenant-Id que não é UUID quando P1 GET /v1/ops/stream e GET /v1/portal/identity/me então rejeição 4xx, nunca 2xx, sem efeito (CTG-0001 A2)', async () => {
    const beforeA = await subjectRows(TENANT_A, CPF.prata);
    const beforeB = await subjectRows(TENANT_B, CPF.prata);
    process.env.DETRAN_LOCAL_ACTOR_ID = ACTOR_A;
    process.env.DETRAN_LOCAL_ROLES = 'field-agent';
    const stream = openStream(
      claimA.port,
      '/v1/ops/stream',
      {
        authorization: 'Bearer local',
        'x-tenant-id': 'nao-uuid',
        accept: 'text/event-stream',
      },
      openRequests,
    );
    await stream.opened;
    await stream.ended;
    expect(stream.status(), stream.body()).toBeGreaterThanOrEqual(400);
    expect(stream.status(), stream.body()).toBeLessThan(500);
    expect(stream.body()).not.toContain(': connected');
    expect(String(stream.headers()['content-type'])).not.toContain(
      'text/event-stream',
    );

    setCitizen({ cpf: CPF.prata, level: 'avancada' });
    process.env.DETRAN_LOCAL_ACTOR_ID = ACTOR_A;
    const me = await request(claimA.app.getHttpServer())
      .get('/v1/portal/identity/me')
      .set({ authorization: 'Bearer local', 'x-tenant-id': 'nao-uuid' });
    expect(me.status, JSON.stringify(me.body)).toBeGreaterThanOrEqual(400);
    expect(me.status, JSON.stringify(me.body)).toBeLessThan(500);
    expect(me.body).not.toHaveProperty('subjectId');
    expect(await subjectRows(TENANT_A, CPF.prata)).toBe(beforeA);
    expect(await subjectRows(TENANT_B, CPF.prata)).toBe(beforeB);
  });
});

describe('C-01-05…C-01-10 — P2/P3 no app com a ordem de registro de produção', () => {
  let plain: INestApplication;
  const api = () => request(plain.getHttpServer());

  beforeAll(async () => {
    plain = await createPortalApp();
  }, 120_000);

  afterAll(async () => {
    await plain?.close();
  });

  it('C-01-05 — dado consulta ao Host ligada, Host A e sem X-Tenant-Id quando GET /v1/portal/services e GET /v1/portal/brand então 200 só com linhas e marca de A; linhas de service_catalog de B nunca aparecem; a conexão do app é role_app_backend no tenant do contexto', async () => {
    const control = await appRoleControl(
      plain,
      PORTAL_TENANT_ID,
      PORTAL_ACTOR_ID,
    );
    expect(control).toEqual({
      current_user: 'role_app_backend',
      tenant_id: PORTAL_TENANT_ID,
      actor_id: PORTAL_ACTOR_ID,
    });

    process.env.DETRAN_PORTAL_HOST_RESOLUTION = 'on';
    const services = await api()
      .get('/v1/portal/services')
      .set(portalOnHostA());
    expect(services.status, JSON.stringify(services.body)).toBe(200);
    const body = JSON.stringify(services.body);
    expect(body).not.toContain(B_SERVICE_MARKER);
    expect(body).not.toContain(TENANT_B);
    for (const row of SERVICE_CATALOG_ROWS.slice(0, 3))
      expect(body).toContain(`${row.serviceKey} (fixture e2e)`);

    const brand = await api().get('/v1/portal/brand').set(portalOnHostA());
    expect(brand.status, JSON.stringify(brand.body)).toBe(200);
    expect(JSON.stringify(brand.body)).toContain(PORTAL_BRAND_A);
  });

  it('C-01-06 — dado Host A mapeado e X-Tenant-Id: B quando P2 GET brand/services e P3 POST manifestations (anônimo e com Authorization) então rejeição 4xx, nunca 200/201 com contexto B nem dados de B', async () => {
    process.env.DETRAN_PORTAL_HOST_RESOLUTION = 'on';
    const manifestationsB = await manifestationCount(TENANT_B);
    const manifestationsA = await manifestationCount(PORTAL_TENANT_ID);
    for (const path of ['/v1/portal/brand', '/v1/portal/services']) {
      const response = await api()
        .get(path)
        .set(portalOnHostA({ 'x-tenant-id': TENANT_B }));
      expect(
        response.status,
        `${path} ${JSON.stringify(response.body)}`,
      ).toBeGreaterThanOrEqual(400);
      expect(response.status).toBeLessThan(500);
      expect(JSON.stringify(response.body)).not.toContain(B_SERVICE_MARKER);
      expect(JSON.stringify(response.body)).not.toContain(PORTAL_BRAND_A);
    }
    const anonymous = await api()
      .post('/v1/portal/manifestations')
      .set(
        portalOnHostA({
          'x-tenant-id': TENANT_B,
          'idempotency-key': idempotencyKey(),
        }),
      )
      .send({ kind: 'reclamacao', text: 'x' });
    await trackManifestation(anonymous.body?.manifestationId);
    expect(
      anonymous.status,
      JSON.stringify(anonymous.body),
    ).toBeGreaterThanOrEqual(400);
    expect(anonymous.status).toBeLessThan(500);

    setCitizen({ cpf: CPF.prata, level: 'avancada' });
    const authenticated = await api()
      .post('/v1/portal/manifestations')
      .set(
        portalOnHostA({
          authorization: 'Bearer local',
          'x-tenant-id': TENANT_B,
          'idempotency-key': idempotencyKey(),
        }),
      )
      .send({ kind: 'reclamacao', text: 'x' });
    await trackManifestation(authenticated.body?.manifestationId);
    expect(
      authenticated.status,
      JSON.stringify(authenticated.body),
    ).toBeGreaterThanOrEqual(400);
    expect(authenticated.status).toBeLessThan(500);
    expect(await manifestationCount(TENANT_B)).toBe(manifestationsB);
    expect(await manifestationCount(PORTAL_TENANT_ID)).toBe(manifestationsA);
  });

  it('C-01-07 — dado consulta ao Host ligada, Host não mapeado e sem X-Tenant-Id quando GET /v1/portal/services e GET /v1/portal/brand então rejeição 4xx, nunca 200', async () => {
    process.env.DETRAN_PORTAL_HOST_RESOLUTION = 'on';
    for (const path of ['/v1/portal/services', '/v1/portal/brand']) {
      const response = await api().get(path);
      expect(
        response.status,
        `${path} ${JSON.stringify(response.body)}`,
      ).toBeGreaterThanOrEqual(400);
      expect(response.status).toBeLessThan(500);
      expect(JSON.stringify(response.body)).not.toContain(PORTAL_BRAND_A);
      expect(JSON.stringify(response.body)).not.toContain(B_SERVICE_MARKER);
    }
  });

  it('C-01-08 — dado Host A mapeado quando POST /v1/portal/manifestations sem Authorization, com CIDADAO e claims gov.br, e com CIDADAO sem claims gov.br (sessão P1: X-Tenant-Id = claim) então 201 com anonymous true, false e true, nunca 401/403', async () => {
    process.env.DETRAN_PORTAL_HOST_RESOLUTION = 'on';
    const anonymous = await api()
      .post('/v1/portal/manifestations')
      .set(portalOnHostA({ 'idempotency-key': idempotencyKey() }))
      .send({ kind: 'reclamacao', text: 'x' });
    await trackManifestation(anonymous.body?.manifestationId);
    expect(anonymous.status, JSON.stringify(anonymous.body)).toBe(201);
    expect(anonymous.body.anonymous).toBe(true);

    setCitizen({ cpf: CPF.prata, level: 'avancada' });
    process.env.DETRAN_PORTAL_HOST_RESOLUTION = 'on';
    const identified = await api()
      .post('/v1/portal/manifestations')
      .set(
        portalOnHostA({
          authorization: 'Bearer local',
          'x-tenant-id': PORTAL_TENANT_ID,
          'idempotency-key': idempotencyKey(),
        }),
      )
      .send({ kind: 'sugestao', text: 'y' });
    await trackManifestation(identified.body?.manifestationId);
    expect(identified.status, JSON.stringify(identified.body)).toBe(201);
    expect(identified.body.anonymous).toBe(false);

    clearCitizenEnv();
    process.env.DETRAN_PORTAL_HOST_RESOLUTION = 'on';
    process.env.DETRAN_LOCAL_ROLES = 'CIDADAO';
    const withoutClaims = await api()
      .post('/v1/portal/manifestations')
      .set(
        portalOnHostA({
          authorization: 'Bearer local',
          'x-tenant-id': PORTAL_TENANT_ID,
          'idempotency-key': idempotencyKey(),
        }),
      )
      .send({ kind: 'elogio', text: 'z' });
    await trackManifestation(withoutClaims.body?.manifestationId);
    expect(withoutClaims.status, JSON.stringify(withoutClaims.body)).toBe(201);
    expect(withoutClaims.body.anonymous).toBe(true);
  });

  it('C-01-09 — dado CIDADAO com claim A e X-Tenant-Id: B, sem Host mapeado, quando POST /v1/portal/manifestations então nunca anonymous false; se 201, a manifestação não aparece na lista do cidadão em A nem carrega o sujeito de A', async () => {
    setCitizen({ cpf: CPF.prata, level: 'avancada' });
    const crossed = await api()
      .post('/v1/portal/manifestations')
      .set({
        authorization: 'Bearer local',
        'x-tenant-id': TENANT_B,
        'idempotency-key': idempotencyKey(),
      })
      .send({ kind: 'sugestao', text: 'cruzada' });
    await trackManifestation(crossed.body?.manifestationId);
    expect(crossed.status, JSON.stringify(crossed.body)).not.toBe(500);
    expect(crossed.body?.anonymous, JSON.stringify(crossed.body)).not.toBe(
      false,
    );
    if (crossed.status === 201) {
      const id = crossed.body.manifestationId as string;
      const list = await api().get('/v1/portal/manifestations').set({
        authorization: 'Bearer local',
        'x-tenant-id': PORTAL_TENANT_ID,
      });
      expect(list.status, JSON.stringify(list.body)).toBe(200);
      expect(JSON.stringify(list.body)).not.toContain(id);
      await asOwnerRole(client);
      const row = await client.query<{
        tenant_id: string;
        subject_id: string | null;
      }>(
        `select tenant_id::text as tenant_id, subject_id::text as subject_id
           from portal.manifestation where id = $1`,
        [id],
      );
      const subjectsA = await client.query<{ id: string }>(
        `select id::text as id from portal.subject where tenant_id = $1 and cpf_hash = $2`,
        [PORTAL_TENANT_ID, cpfHash(CPF.prata)],
      );
      expect(row.rows[0]?.tenant_id).not.toBe(PORTAL_TENANT_ID);
      const subjectId = row.rows[0]?.subject_id;
      if (subjectId)
        expect(subjectsA.rows.map((subject) => subject.id)).not.toContain(
          subjectId,
        );
    }
  });

  it('C-01-10 — dado POST /v1/portal/manifestations anônimo pelo Host A (P2) então o evento de auditoria do tenant resolvido tem ator nulo, nunca DETRAN_LOCAL_ACTOR_ID', async () => {
    process.env.DETRAN_PORTAL_HOST_RESOLUTION = 'on';
    process.env.DETRAN_LOCAL_ACTOR_ID = PORTAL_ACTOR_ID;
    await asOwnerRole(client);
    const since = (
      await client.query<{ now: string }>(
        `select clock_timestamp()::text as now`,
      )
    ).rows[0]!.now;
    const created = await api()
      .post('/v1/portal/manifestations')
      .set(portalOnHostA({ 'idempotency-key': idempotencyKey() }))
      .send({ kind: 'reclamacao', text: 'auditoria' });
    await trackManifestation(created.body?.manifestationId);
    expect(created.status, JSON.stringify(created.body)).toBe(201);
    expect(created.body.anonymous).toBe(true);
    let rows: Array<{ tenant_id: string; actor_id: string | null }> = [];
    for (let attempt = 0; attempt < 40 && rows.length === 0; attempt += 1) {
      await asOwnerRole(client);
      rows = (
        await client.query<{ tenant_id: string; actor_id: string | null }>(
          `select tenant_id::text as tenant_id, actor_id::text as actor_id
             from audit.events
            where entity = 'portal.manifestation'
              and occurred_at >= $1::timestamptz
            order by event_id`,
          [since],
        )
      ).rows;
      if (rows.length === 0) await settle(50);
    }
    expect(rows).toHaveLength(1);
    expect(rows[0]!.tenant_id).toBe(PORTAL_TENANT_ID);
    expect(rows[0]!.actor_id).toBeNull();
    expect(rows[0]!.actor_id).not.toBe(PORTAL_ACTOR_ID);
  });
});
