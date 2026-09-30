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
 * R-0022 CTG-0003 §5 (TASK-0024) — critérios de plataforma da tenancy
 * (C-03-04…C-03-10, C-03-12, C-03-15, C-03-16), escritos pelo Inspector
 * ANTES de TASK-0006 (remoção do _monkey-patch_ e composição
 * `StynxTenancyModule.forRoot({ publicTenant })` + `@PublicTenantRoute`).
 * Tríade com vermelho verificável: os casos que só a troca torna verdadeiros
 * ficam vermelhos agora, sem `it.fails` e sem `skip`; a lista exata está em
 * `work/rounds/R-0022/reports/TASK-0024.expected-red.txt`.
 *
 * Decisões do Owner aplicadas (Adenda B12): OD-R22-47 (principal verificado
 * com _claim_ ≠ tenant do Host em `POST /v1/portal/manifestations` → 403
 * `PORTAL.SESSION_TENANT_MISMATCH`), OD-R22-48 (`X-Tenant-Id` não UUID em P1 →
 * 403 da cadeia DETRAN), OD-R22-49 (perfil local sem
 * `DETRAN_PORTAL_HOST_RESOLUTION`: rota pública com `X-Tenant-Id` ≠
 * `LOCAL_TENANT_ID` é conflito → 403 por R-4). OD-R22-37: 403
 * `PORTAL.SESSION_TENANT_MISMATCH` e 421 `PORTAL.TENANT_UNRESOLVED` mantidos.
 *
 * Fixtures (CTG-0001 §0.6, sem tenant nem persona nova): tenants/atores de
 * `tools/check-rls-smoke.ts` (A `…101`, B `…102`, ator A `…201`, ator B
 * `…202`, _membership_ só no próprio tenant) e o tenant/Host/persona do
 * _harness_ do Portal (`portal-e2e.support.ts`: tenant `…0001` = "Host A",
 * Host `portal.local-e2e.invalid`, ator `…0002`, CPF fixture prata).
 *
 * T-14 (CTG-0001 §1.1): no perfil `test` a _claim_ do principal local é
 * `DETRAN_LOCAL_TENANT_ID`, lido no carregamento de `detran-runtime.ts`; cada
 * instância com outra _claim_ é montada num grafo de módulos novo
 * (`vi.resetModules()` + `import` dinâmico). Ator e papéis são lidos do
 * ambiente a cada requisição.
 *
 * RLS real (CTG-0001 §4.2): a operação sob teste passa pelo `Database` do app;
 * o controle de papel (`role_app_backend`, tenant e ator do contexto) roda em
 * cada instância usada por negativo de RLS. O cliente owner só prepara,
 * lê auditoria e limpa.
 */

type ArmOrder = 'core-antes-do-tenancy' | 'core-depois-do-tenancy';

interface Arm {
  order: ArmOrder;
  app: INestApplication;
  trace: string[];
  registered: string[];
  production: ArmOrder;
}

interface ClaimApp {
  app: INestApplication;
  port: number;
}

const client = newOwnerClient();
const openRequests: http.ClientRequest[] = [];
const arms: Arm[] = [];
const createdManifestations: string[] = [];
const createdServiceCatalogIds: string[] = [];
const subjectsBefore = new Set<string>();
const previousEnv: Record<string, string | undefined> = {};
/** Mesmo marcador de `tenancy-context.e2e.spec.ts` para as linhas de B. */
const B_SERVICE_MARKER = '(fixture e2e R-0022 tenant B)';
const PORTAL_BRAND_A = 'Local E2E Portal (fixture)';
/** Texto de finalidade das suítes BOAT (`policy-routes.e2e.spec.ts`). */
const BOAT_PURPOSE = 'consulta de vitimas do sinistro';
const SESSION_TENANT_MISMATCH = 'PORTAL.SESSION_TENANT_MISMATCH';
const TENANT_UNRESOLVED = 'PORTAL.TENANT_UNRESOLVED';

let plain: INestApplication;
let plainPort = 0;
let claimA: ClaimApp;
let claimB: ClaimApp;

function isCoreContext(interceptor: object): boolean {
  return interceptor.constructor.name === 'RequestContextInterceptor';
}

function isTenancy(interceptor: object): boolean {
  return interceptor instanceof TenantContextInterceptor;
}

function globalInterceptors(app: INestApplication): object[] {
  return (
    app as unknown as { config: { getGlobalInterceptors(): object[] } }
  ).config.getGlobalInterceptors();
}

function registeredOrder(app: INestApplication): ArmOrder {
  const interceptors = globalInterceptors(app);
  const core = interceptors.findIndex(isCoreContext);
  const tenancy = interceptors.findIndex(isTenancy);
  expect(core, 'RequestContextInterceptor global').toBeGreaterThanOrEqual(0);
  expect(tenancy, 'TenantContextInterceptor global').toBeGreaterThanOrEqual(0);
  return core < tenancy ? 'core-antes-do-tenancy' : 'core-depois-do-tenancy';
}

/**
 * Mesma forma de prova do A/B de C-01-01 (CTG-0003 C-03-04): a ordem de
 * registro é forçada só no módulo de teste e cada instância é instrumentada
 * para registrar a ordem efetiva, requisição a requisição.
 */
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
  interceptors.splice(
    0,
    interceptors.length,
    ...rest.slice(0, firstIndex),
    ...block,
    ...rest.slice(firstIndex),
  );
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
  return { order, app, trace, registered, production };
}

/** Instância com outra _claim_ (T-14): env antes do `import` de um grafo novo. */
async function bootWithClaim(claimTenantId: string): Promise<ClaimApp> {
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
    return { app, port: portOf(app) };
  } finally {
    if (previous === undefined) delete process.env.DETRAN_LOCAL_TENANT_ID;
    else process.env.DETRAN_LOCAL_TENANT_ID = previous;
  }
}

function portOf(app: INestApplication): number {
  const address = app.getHttpServer().address();
  return typeof address === 'object' && address ? address.port : 0;
}

function onHostA(extra: Record<string, string> = {}): Record<string, string> {
  return { host: LOCAL_HOSTNAME, ...extra };
}

function withHostResolution(on: boolean): void {
  if (on) process.env.DETRAN_PORTAL_HOST_RESOLUTION = 'on';
  else delete process.env.DETRAN_PORTAL_HOST_RESOLUTION;
}

/** Código do envelope de erro DETRAN (`{ code }`), para mensagem e asserção. */
function codeOf(body: unknown): unknown {
  return (body as { code?: unknown } | undefined)?.code;
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

async function manifestationCount(tenantId: string): Promise<number> {
  await asOwnerRole(client);
  const result = await client.query<{ count: string }>(
    `select count(*)::text as count from portal.manifestation where tenant_id = $1`,
    [tenantId],
  );
  return Number(result.rows[0]?.count ?? 0);
}

async function trackManifestation(id: unknown): Promise<void> {
  if (typeof id === 'string') createdManifestations.push(id);
}

async function dbNow(): Promise<string> {
  await asOwnerRole(client);
  return (
    await client.query<{ now: string }>(`select clock_timestamp()::text as now`)
  ).rows[0]!.now;
}

interface AuditRow {
  tenant_id: string;
  actor_id: string | null;
}

/** Leitura de `audit.events` pelo owner, com espera curta pela gravação. */
async function auditRowsSince(
  since: string,
  filter: { entity?: string; action?: string; tenantId?: string },
  expectAtLeast = 1,
): Promise<AuditRow[]> {
  let rows: AuditRow[] = [];
  for (let attempt = 0; attempt < 40; attempt += 1) {
    await asOwnerRole(client);
    rows = (
      await client.query<AuditRow>(
        `select tenant_id::text as tenant_id, actor_id::text as actor_id
           from audit.events
          where occurred_at >= $1::timestamptz
            and ($2::text is null or entity = $2)
            and ($3::text is null or action = $3)
            and ($4::uuid is null or tenant_id = $4)
          order by event_id`,
        [
          since,
          filter.entity ?? null,
          filter.action ?? null,
          filter.tenantId ?? null,
        ],
      )
    ).rows;
    if (rows.length >= expectAtLeast) break;
    await settle(50);
  }
  return rows;
}

beforeAll(async () => {
  for (const key of [
    'DETRAN_RUNTIME_PROFILE',
    'DETRAN_LOCAL_TENANT_ID',
    'DETRAN_LOCAL_ACTOR_ID',
    'DETRAN_LOCAL_ROLES',
    'DETRAN_PORTAL_HOST_RESOLUTION',
    'DETRAN_LOCAL_CPF',
    'DETRAN_LOCAL_ASSURANCE_LEVEL',
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

  // Linhas de `service_catalog` de B (owner; só preparação), mesmas chaves do
  // harness e título marcado, como em `tenancy-context.e2e.spec.ts`.
  await asOwnerIn(client, TENANT_B);
  for (const row of SERVICE_CATALOG_ROWS.slice(0, 3)) {
    const inserted = await client.query<{ id: string }>(
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
       on conflict (tenant_id, service_key) do nothing
       returning id::text as id`,
      [
        randomUUID(),
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
    for (const insertedRow of inserted.rows)
      createdServiceCatalogIds.push(insertedRow.id);
  }

  // Grafo estático primeiro (braços do A/B e app de produção), depois os
  // grafos novos por _claim_ (padrão de `tenancy-context.e2e.spec.ts`).
  arms.push(await bootArm('core-antes-do-tenancy'));
  arms.push(await bootArm('core-depois-do-tenancy'));
  plain = await createPortalApp();
  await plain.listen(0);
  plainPort = portOf(plain);
  claimA = await bootWithClaim(TENANT_A);
  claimB = await bootWithClaim(TENANT_B);
}, 180_000);

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
  await plain?.close();
  await claimA?.app.close();
  await claimB?.app.close();
  await asOwnerRole(client);
  if (createdManifestations.length > 0) {
    await client.query(
      `delete from portal.idempotency_record
        where response_json->>'manifestationId' = any($1::text[])`,
      [createdManifestations],
    );
    await client.query(
      `delete from integration.outbox where aggregate_id = any($1::text[])`,
      [createdManifestations],
    );
    await client.query(
      `delete from portal.manifestation where id = any($1::uuid[])`,
      [createdManifestations],
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

describe('C-03-04 — P2 nas duas ordens forçadas (A/B de C-01-01)', () => {
  it.each(['core-antes-do-tenancy', 'core-depois-do-tenancy'] as const)(
    'C-03-04 — dado o braço %s, consulta ao Host ligada e Host A mapeado quando GET /v1/portal/brand então 200 com a marca de A, ordem efetiva demonstrada e nenhum RequestContextMissingError',
    async (order) => {
      const arm = arms.find((candidate) => candidate.order === order)!;
      const firstCore = arm.registered.indexOf('core');
      const tenancy = arm.registered.indexOf('tenancy');
      if (order === 'core-antes-do-tenancy')
        expect(firstCore).toBeLessThan(tenancy);
      else expect(tenancy).toBeLessThan(firstCore);

      withHostResolution(true);
      arm.trace.length = 0;
      const brand = await request(arm.app.getHttpServer())
        .get('/v1/portal/brand')
        .set(onHostA());
      const core = arm.trace.indexOf('core');
      const tenant = arm.trace.indexOf('tenancy');
      expect(core, JSON.stringify(arm.trace)).toBeGreaterThanOrEqual(0);
      expect(tenant, JSON.stringify(arm.trace)).toBeGreaterThanOrEqual(0);
      if (order === 'core-antes-do-tenancy')
        expect(core, JSON.stringify(arm.trace)).toBeLessThan(tenant);
      else expect(tenant, JSON.stringify(arm.trace)).toBeLessThan(core);
      expect(JSON.stringify(brand.body)).not.toMatch(/RequestContextMissing/);
      expect(brand.status, JSON.stringify(brand.body)).toBe(200);
      expect(JSON.stringify(brand.body)).toContain(PORTAL_BRAND_A);
    },
  );
});

describe('C-03-05 — Host A × X-Tenant-Id/claim divergentes em P2 e P3 (OD-S15-01, OD-R22-37/47/49)', () => {
  const api = () => request(plain.getHttpServer());

  it('C-03-05 — dado Host A mapeado, consulta ligada e X-Tenant-Id: B quando P2 GET brand/services e P3 POST manifestations (anônimo e com Authorization) então 403 PORTAL.SESSION_TENANT_MISMATCH e nenhuma linha de B lida nem gravada; sem o cabeçalho (controle positivo) então 200/201 em A', async () => {
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
    withHostResolution(true);
    const manifestationsB = await manifestationCount(TENANT_B);
    const manifestationsA = await manifestationCount(PORTAL_TENANT_ID);

    for (const path of ['/v1/portal/brand', '/v1/portal/services']) {
      const crossed = await api()
        .get(path)
        .set(onHostA({ 'x-tenant-id': TENANT_B }));
      expect(crossed.status, `${path} ${JSON.stringify(crossed.body)}`).toBe(
        403,
      );
      expect(codeOf(crossed.body), JSON.stringify(crossed.body)).toBe(
        SESSION_TENANT_MISMATCH,
      );
      expect(JSON.stringify(crossed.body)).not.toContain(B_SERVICE_MARKER);
      expect(JSON.stringify(crossed.body)).not.toContain(PORTAL_BRAND_A);
    }

    const anonymous = await api()
      .post('/v1/portal/manifestations')
      .set(
        onHostA({ 'x-tenant-id': TENANT_B, 'idempotency-key': randomUUID() }),
      )
      .send({ kind: 'reclamacao', text: 'C-03-05 anonima' });
    await trackManifestation(anonymous.body?.manifestationId);
    expect(anonymous.status, JSON.stringify(anonymous.body)).toBe(403);
    expect(codeOf(anonymous.body)).toBe(SESSION_TENANT_MISMATCH);

    setCitizen({ cpf: CPF.prata, level: 'avancada' });
    const authenticated = await api()
      .post('/v1/portal/manifestations')
      .set(
        onHostA({
          authorization: 'Bearer local',
          'x-tenant-id': TENANT_B,
          'idempotency-key': randomUUID(),
        }),
      )
      .send({ kind: 'reclamacao', text: 'C-03-05 autenticada' });
    await trackManifestation(authenticated.body?.manifestationId);
    expect(authenticated.status, JSON.stringify(authenticated.body)).toBe(403);
    expect(codeOf(authenticated.body)).toBe(SESSION_TENANT_MISMATCH);
    expect(await manifestationCount(TENANT_B)).toBe(manifestationsB);
    expect(await manifestationCount(PORTAL_TENANT_ID)).toBe(manifestationsA);

    // Controle positivo: sem o cabeçalho, A responde.
    clearCitizenEnv();
    withHostResolution(true);
    const brand = await api().get('/v1/portal/brand').set(onHostA());
    expect(brand.status, JSON.stringify(brand.body)).toBe(200);
    expect(JSON.stringify(brand.body)).toContain(PORTAL_BRAND_A);
    const services = await api().get('/v1/portal/services').set(onHostA());
    expect(services.status, JSON.stringify(services.body)).toBe(200);
    expect(JSON.stringify(services.body)).not.toContain(B_SERVICE_MARKER);
    for (const row of SERVICE_CATALOG_ROWS.slice(0, 3))
      expect(JSON.stringify(services.body)).toContain(
        `${row.serviceKey} (fixture e2e)`,
      );
    const created = await api()
      .post('/v1/portal/manifestations')
      .set(onHostA({ 'idempotency-key': randomUUID() }))
      .send({ kind: 'reclamacao', text: 'C-03-05 controle' });
    await trackManifestation(created.body?.manifestationId);
    expect(created.status, JSON.stringify(created.body)).toBe(201);
    expect(created.body.anonymous).toBe(true);
    expect(await manifestationCount(TENANT_B)).toBe(manifestationsB);
    expect(await manifestationCount(PORTAL_TENANT_ID)).toBe(
      manifestationsA + 1,
    );
  });

  it('C-03-05 (OD-R22-47) — dado principal verificado CIDADAO com claim A e membership em A, Host do tenant do Portal mapeado e sem X-Tenant-Id quando POST /v1/portal/manifestations então 403 PORTAL.SESSION_TENANT_MISMATCH e nenhuma manifestação gravada; sem Authorization (controle positivo) então 201 anônima no tenant do Host', async () => {
    withHostResolution(true);
    const manifestationsA = await manifestationCount(TENANT_A);
    const manifestationsHost = await manifestationCount(PORTAL_TENANT_ID);
    setCitizen({ cpf: CPF.prata, level: 'avancada' });
    process.env.DETRAN_LOCAL_ACTOR_ID = ACTOR_A;
    const crossed = await request(claimA.app.getHttpServer())
      .post('/v1/portal/manifestations')
      .set(
        onHostA({
          authorization: 'Bearer local',
          'idempotency-key': randomUUID(),
        }),
      )
      .send({ kind: 'sugestao', text: 'C-03-05 claim divergente' });
    await trackManifestation(crossed.body?.manifestationId);
    expect(crossed.status, JSON.stringify(crossed.body)).toBe(403);
    expect(codeOf(crossed.body), JSON.stringify(crossed.body)).toBe(
      SESSION_TENANT_MISMATCH,
    );
    expect(await manifestationCount(TENANT_A)).toBe(manifestationsA);
    expect(await manifestationCount(PORTAL_TENANT_ID)).toBe(manifestationsHost);

    clearCitizenEnv();
    withHostResolution(true);
    const anonymous = await request(claimA.app.getHttpServer())
      .post('/v1/portal/manifestations')
      .set(onHostA({ 'idempotency-key': randomUUID() }))
      .send({ kind: 'sugestao', text: 'C-03-05 claim controle' });
    await trackManifestation(anonymous.body?.manifestationId);
    expect(anonymous.status, JSON.stringify(anonymous.body)).toBe(201);
    expect(anonymous.body.anonymous).toBe(true);
    expect(await manifestationCount(PORTAL_TENANT_ID)).toBe(
      manifestationsHost + 1,
    );
  });

  it('C-03-05 (OD-R22-49) — dado perfil local sem DETRAN_PORTAL_HOST_RESOLUTION quando P2 GET /v1/portal/services com X-Tenant-Id: B (≠ LOCAL_TENANT_ID) então 403 PORTAL.SESSION_TENANT_MISMATCH sem linhas de B; com X-Tenant-Id = LOCAL_TENANT_ID ou sem cabeçalho (controle positivo) então 200 só com linhas do tenant local', async () => {
    withHostResolution(false);
    const crossed = await api()
      .get('/v1/portal/services')
      .set({ 'x-tenant-id': TENANT_B });
    expect(crossed.status, JSON.stringify(crossed.body)).toBe(403);
    expect(codeOf(crossed.body)).toBe(SESSION_TENANT_MISMATCH);
    expect(JSON.stringify(crossed.body)).not.toContain(B_SERVICE_MARKER);

    for (const extra of [{ 'x-tenant-id': PORTAL_TENANT_ID }, {}]) {
      withHostResolution(false);
      const local = await api().get('/v1/portal/services').set(extra);
      expect(local.status, JSON.stringify(local.body)).toBe(200);
      expect(JSON.stringify(local.body)).not.toContain(B_SERVICE_MARKER);
      for (const row of SERVICE_CATALOG_ROWS.slice(0, 3))
        expect(JSON.stringify(local.body)).toContain(
          `${row.serviceKey} (fixture e2e)`,
        );
    }
  });
});

describe('C-03-06 — Host não mapeado com consulta ligada (OD-R22-37)', () => {
  it('C-03-06 — dado consulta ao Host ligada, Host não mapeado e sem X-Tenant-Id quando P2 GET /v1/portal/services e GET /v1/portal/brand então 421 PORTAL.TENANT_UNRESOLVED, nunca 200 com o tenant local nem com outro; Host A mapeado (controle positivo) então 200', async () => {
    withHostResolution(true);
    for (const path of ['/v1/portal/services', '/v1/portal/brand']) {
      // supertest envia `Host: 127.0.0.1:<porta>`, ausente de
      // `portal.public_hostname`.
      const unresolved = await request(plain.getHttpServer()).get(path);
      expect(
        unresolved.status,
        `${path} ${JSON.stringify(unresolved.body)}`,
      ).toBe(421);
      expect(codeOf(unresolved.body)).toBe(TENANT_UNRESOLVED);
      expect(JSON.stringify(unresolved.body)).not.toContain(PORTAL_BRAND_A);
      expect(JSON.stringify(unresolved.body)).not.toContain(B_SERVICE_MARKER);
      expect(JSON.stringify(unresolved.body)).not.toContain('(fixture e2e)');

      const mapped = await request(plain.getHttpServer())
        .get(path)
        .set(onHostA());
      expect(mapped.status, `${path} ${JSON.stringify(mapped.body)}`).toBe(200);
    }
  });
});

describe('C-03-07 — P3 com Authorization que não é Bearer (UPS-TEN-03)', () => {
  it('C-03-07 — dado Host A mapeado e CIDADAO com claims gov.br no ambiente quando POST /v1/portal/manifestations com Authorization: Basic x então 201 anonymous true (nunca 401/403) e o evento de auditoria tem ator nulo (OD-P27); com Bearer (controle positivo) então 201 anonymous false', async () => {
    withHostResolution(true);
    setCitizen({ cpf: CPF.prata, level: 'avancada' });
    process.env.DETRAN_LOCAL_ACTOR_ID = PORTAL_ACTOR_ID;
    const since = await dbNow();
    const basic = await request(plain.getHttpServer())
      .post('/v1/portal/manifestations')
      .set(
        onHostA({ authorization: 'Basic x', 'idempotency-key': randomUUID() }),
      )
      .send({ kind: 'reclamacao', text: 'C-03-07 basic' });
    await trackManifestation(basic.body?.manifestationId);
    expect(basic.status, JSON.stringify(basic.body)).not.toBe(401);
    expect(basic.status, JSON.stringify(basic.body)).not.toBe(403);
    expect(basic.status, JSON.stringify(basic.body)).toBe(201);
    expect(basic.body.anonymous, JSON.stringify(basic.body)).toBe(true);
    const audit = await auditRowsSince(since, {
      entity: 'portal.manifestation',
    });
    expect(audit).toHaveLength(1);
    expect(audit[0]!.tenant_id).toBe(PORTAL_TENANT_ID);
    expect(audit[0]!.actor_id).toBeNull();

    // Controle positivo: a mesma persona com Bearer é identificada.
    setCitizen({ cpf: CPF.prata, level: 'avancada' });
    withHostResolution(true);
    const bearer = await request(plain.getHttpServer())
      .post('/v1/portal/manifestations')
      .set(
        onHostA({
          authorization: 'Bearer local',
          'x-tenant-id': PORTAL_TENANT_ID,
          'idempotency-key': randomUUID(),
        }),
      )
      .send({ kind: 'reclamacao', text: 'C-03-07 bearer' });
    await trackManifestation(bearer.body?.manifestationId);
    expect(bearer.status, JSON.stringify(bearer.body)).toBe(201);
    expect(bearer.body.anonymous).toBe(false);
  });
});

describe('C-03-08 — P2 nunca verifica membership', () => {
  it('C-03-08 — dado principal sem membership no tenant do Host A (ator B, claim = tenant do Host A) quando GET /v1/portal/services pelo Host A com Authorization então 200 só com linhas de A e resposta idêntica à anônima; o mesmo principal em rota P1 do tenant do Host A (controle positivo) então 403', async () => {
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

    // Controle positivo: o principal realmente não tem membership em A.
    process.env.DETRAN_LOCAL_ACTOR_ID = ACTOR_B;
    process.env.DETRAN_LOCAL_ROLES = 'field-agent';
    const denied = openStream(
      plainPort,
      '/v1/ops/stream',
      {
        authorization: 'Bearer local',
        'x-tenant-id': PORTAL_TENANT_ID,
        accept: 'text/event-stream',
      },
      openRequests,
    );
    await denied.opened;
    await denied.ended;
    expect(denied.status(), denied.body()).toBe(403);
    expect(denied.body()).not.toContain(': connected');

    withHostResolution(true);
    const anonymous = await request(plain.getHttpServer())
      .get('/v1/portal/services')
      .set(onHostA());
    expect(anonymous.status, JSON.stringify(anonymous.body)).toBe(200);

    process.env.DETRAN_LOCAL_ACTOR_ID = ACTOR_B;
    process.env.DETRAN_LOCAL_ROLES = 'field-agent';
    const withPrincipal = await request(plain.getHttpServer())
      .get('/v1/portal/services')
      .set(onHostA({ authorization: 'Bearer local' }));
    expect(withPrincipal.status, JSON.stringify(withPrincipal.body)).toBe(200);
    expect(withPrincipal.body).toEqual(anonymous.body);
    const body = JSON.stringify(withPrincipal.body);
    expect(body).not.toContain(B_SERVICE_MARKER);
    expect(body).not.toContain(TENANT_B);
    for (const row of SERVICE_CATALOG_ROWS.slice(0, 3))
      expect(body).toContain(`${row.serviceKey} (fixture e2e)`);
  });
});

describe('C-03-09 — auditoria de finalidade BOAT depois da validação de tenancy (R-8)', () => {
  it('C-03-09 — dado claim = B e ator A (sem membership em B) quando GET /v1/est/crash/victims?purpose=… então 403 e nenhuma linha EST_CRASH_VICTIM_READ em B; com ator e membership em A então 200 e exatamente uma linha com o tenant e o ator do contexto; sem purpose então 400 BOAT.VICTIM_PURPOSE_REQUIRED', async () => {
    for (const [app, tenantId, actorId] of [
      [claimA.app, TENANT_A, ACTOR_A],
      [claimB.app, TENANT_B, ACTOR_A],
    ] as const) {
      expect(await appRoleControl(app, tenantId, actorId)).toEqual({
        current_user: 'role_app_backend',
        tenant_id: tenantId,
        actor_id: actorId,
      });
    }

    process.env.DETRAN_LOCAL_ROLES = 'field-agent';
    process.env.DETRAN_LOCAL_ACTOR_ID = ACTOR_A;
    const sinceCrossed = await dbNow();
    const crossed = await request(claimB.app.getHttpServer())
      .get('/v1/est/crash/victims')
      .query({ purpose: BOAT_PURPOSE })
      .set({ authorization: 'Bearer local', 'x-tenant-id': TENANT_B });
    expect(crossed.status, JSON.stringify(crossed.body)).toBe(403);
    await settle(200);
    const leaked = await auditRowsSince(
      sinceCrossed,
      { action: 'EST_CRASH_VICTIM_READ', tenantId: TENANT_B },
      Number.POSITIVE_INFINITY,
    );
    expect(leaked, JSON.stringify(leaked)).toHaveLength(0);

    // Controle positivo: ator A com membership em A.
    process.env.DETRAN_LOCAL_ROLES = 'field-agent';
    process.env.DETRAN_LOCAL_ACTOR_ID = ACTOR_A;
    const sinceAllowed = await dbNow();
    const allowed = await request(claimA.app.getHttpServer())
      .get('/v1/est/crash/victims')
      .query({ purpose: BOAT_PURPOSE })
      .set({ authorization: 'Bearer local', 'x-tenant-id': TENANT_A });
    expect(allowed.status, JSON.stringify(allowed.body)).toBe(200);
    const audited = await auditRowsSince(sinceAllowed, {
      action: 'EST_CRASH_VICTIM_READ',
    });
    expect(audited, JSON.stringify(audited)).toHaveLength(1);
    expect(audited[0]!.tenant_id).toBe(TENANT_A);
    expect(audited[0]!.actor_id).toBe(ACTOR_A);

    const withoutPurpose = await request(claimA.app.getHttpServer())
      .get('/v1/est/crash/victims')
      .set({ authorization: 'Bearer local', 'x-tenant-id': TENANT_A });
    expect(withoutPurpose.status, JSON.stringify(withoutPurpose.body)).toBe(
      400,
    );
    expect(codeOf(withoutPurpose.body)).toBe('BOAT.VICTIM_PURPOSE_REQUIRED');
  });
});

describe('C-03-12 — X-Tenant-Id não UUID em P1 (OD-R22-48)', () => {
  it('C-03-12 — dado claim = A e ator A quando P1 GET /v1/ops/stream com X-Tenant-Id que não é UUID então 403 da cadeia DETRAN, sem corpo SSE; com X-Tenant-Id = A (controle positivo) então 200', async () => {
    process.env.DETRAN_LOCAL_ACTOR_ID = ACTOR_A;
    process.env.DETRAN_LOCAL_ROLES = 'field-agent';
    const invalid = openStream(
      claimA.port,
      '/v1/ops/stream',
      {
        authorization: 'Bearer local',
        'x-tenant-id': 'nao-uuid',
        accept: 'text/event-stream',
      },
      openRequests,
    );
    await invalid.opened;
    await invalid.ended;
    expect(invalid.status(), invalid.body()).toBe(403);
    expect(invalid.body()).not.toContain(': connected');
    expect(String(invalid.headers()['content-type'])).not.toContain(
      'text/event-stream',
    );

    const valid = openStream(
      claimA.port,
      '/v1/ops/stream',
      {
        authorization: 'Bearer local',
        'x-tenant-id': TENANT_A,
        accept: 'text/event-stream',
      },
      openRequests,
    );
    await valid.opened;
    expect(valid.status(), valid.body()).toBe(200);
    valid.close();
  });
});

describe('C-03-15 — P4 sem tenant e webhook PEC fora de /v1/portal/', () => {
  it('C-03-15 — dado Host A mapeado, consulta ligada e X-Tenant-Id: B quando GET /healthz, /readyz, /metrics então 200 sem tenant e GET /info então a mesma resposta com e sem os cabeçalhos de tenant; POST dos webhooks PEC @Public() então a recusa do próprio guard do webhook (401), nunca 403 PORTAL.SESSION_TENANT_MISMATCH nem 421 PORTAL.TENANT_UNRESOLVED; a mesma combinação em GET /v1/portal/brand (controle positivo) então 403 PORTAL.SESSION_TENANT_MISMATCH', async () => {
    withHostResolution(true);
    for (const path of ['/healthz', '/readyz', '/metrics']) {
      for (const extra of [{}, onHostA({ 'x-tenant-id': TENANT_B })]) {
        const response = await request(plain.getHttpServer())
          .get(path)
          .set(extra);
        expect(response.status, `${path} ${response.text}`).toBe(200);
      }
    }
    // `/info`: no perfil `test` o endpoint responde 403 "Platform info
    // endpoint is disabled" (configuração do módulo de saúde, não tenancy);
    // o "200" de CTG-0003 C-03-15 para `/info` vai ao relatório como
    // contradição (adenda do Architect). Aqui só a parte de tenancy: a
    // resposta não muda com Host mapeado e X-Tenant-Id divergente.
    const infoPlain = await request(plain.getHttpServer()).get('/info');
    const infoCrossed = await request(plain.getHttpServer())
      .get('/info')
      .set(onHostA({ 'x-tenant-id': TENANT_B }));
    expect(infoCrossed.status, infoCrossed.text).toBe(infoPlain.status);
    expect(infoCrossed.body).toEqual(infoPlain.body);
    expect(infoCrossed.text).not.toContain(SESSION_TENANT_MISMATCH);
    expect(infoCrossed.text).not.toContain(TENANT_UNRESOLVED);
    expect(infoCrossed.text).not.toContain('TENANCY:');

    for (const path of [
      '/v1/ch/transmissions/callbacks/renach',
      '/v1/ch/transmissions/callbacks/toxicology',
    ]) {
      for (const extra of [onHostA({ 'x-tenant-id': TENANT_B }), {}]) {
        const response = await request(plain.getHttpServer())
          .post(path)
          .set({ 'content-type': 'application/json', ...extra })
          .send({});
        expect(response.status, `${path} ${response.text}`).toBe(401);
        expect(response.text).not.toContain(SESSION_TENANT_MISMATCH);
        expect(response.text).not.toContain(TENANT_UNRESOLVED);
        expect(response.text).not.toContain('TENANCY:');
      }
    }

    const portal = await request(plain.getHttpServer())
      .get('/v1/portal/brand')
      .set(onHostA({ 'x-tenant-id': TENANT_B }));
    expect(portal.status, JSON.stringify(portal.body)).toBe(403);
    expect(codeOf(portal.body)).toBe(SESSION_TENANT_MISMATCH);
    const unmapped = await request(plain.getHttpServer()).get(
      '/v1/portal/brand',
    );
    expect(unmapped.status, JSON.stringify(unmapped.body)).toBe(421);
    expect(codeOf(unmapped.body)).toBe(TENANT_UNRESOLVED);
  });
});

describe('C-03-16 — P1 com Host mapeado divergente do X-Tenant-Id (T-10 regra 1)', () => {
  it('C-03-16 — dado claim = B, ator B com membership em B, consulta ligada e Host A mapeado quando P1 GET /v1/ops/stream com X-Tenant-Id: B então 403 PORTAL.SESSION_TENANT_MISMATCH sem corpo SSE; sem Host mapeado (controle positivo) então 200', async () => {
    withHostResolution(true);
    process.env.DETRAN_LOCAL_ACTOR_ID = ACTOR_B;
    process.env.DETRAN_LOCAL_ROLES = 'field-agent';
    const crossed = openStream(
      claimB.port,
      '/v1/ops/stream',
      onHostA({
        authorization: 'Bearer local',
        'x-tenant-id': TENANT_B,
        accept: 'text/event-stream',
      }),
      openRequests,
    );
    await crossed.opened;
    await crossed.ended;
    expect(crossed.status(), crossed.body()).toBe(403);
    expect(crossed.body()).not.toContain(': connected');
    expect(codeOf(parseJson(crossed.body())), crossed.body()).toBe(
      SESSION_TENANT_MISMATCH,
    );

    withHostResolution(true);
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
});

interface RateLimitWindow {
  bucket_key: string;
  window_start: string;
  hits: number;
}

/** Janelas de `integration.rate_limit_windows` de um tenant, lidas pelo owner. */
async function rateLimitWindows(tenantId: string): Promise<RateLimitWindow[]> {
  await asOwnerRole(client);
  return (
    await client.query<RateLimitWindow>(
      `select bucket_key, window_start::text as window_start, hits
         from integration.rate_limit_windows
        where tenant_id = $1
        order by bucket_key, window_start`,
      [tenantId],
    )
  ).rows;
}

const windowKey = (row: RateLimitWindow): string =>
  `${row.bucket_key}|${row.window_start}`;

const totalHits = (rows: RateLimitWindow[]): number =>
  rows.reduce((sum, row) => sum + row.hits, 0);

describe('C-03-18 — rate limit de rota pública no tenant do Host (Adenda B15, OD-R22-62/63)', () => {
  it('C-03-18 — dado Host A mapeado, consulta ligada e o tenant do Host sem janela própria do caso quando POST /v1/portal/manifestations anônimo, com Authorization: Basic e com Bearer então 201 (nunca 503) e a janela de rate limit gravada em integration.rate_limit_windows no tenant do Host; controle P1: principal sem membership em B com X-Tenant-Id: B em POST start de sinistro então 403 e nenhuma janela gravada em B', async () => {
    const hostBefore = await rateLimitWindows(PORTAL_TENANT_ID);
    const hostBeforeByKey = new Map(
      hostBefore.map((row) => [windowKey(row), row.hits]),
    );
    const bBefore = await rateLimitWindows(TENANT_B);
    try {
      expect(
        await appRoleControl(claimB.app, TENANT_B, ACTOR_A),
        'controle de papel da instância de B',
      ).toEqual({
        current_user: 'role_app_backend',
        tenant_id: TENANT_B,
        actor_id: ACTOR_A,
      });

      const post = (headers: Record<string, string>, text: string) =>
        request(plain.getHttpServer())
          .post('/v1/portal/manifestations')
          .set(onHostA({ 'idempotency-key': randomUUID(), ...headers }))
          .send({ kind: 'reclamacao', text });

      withHostResolution(true);
      const anonymous = await post({}, 'C-03-18 anonima');
      await trackManifestation(anonymous.body?.manifestationId);
      expect(anonymous.status, JSON.stringify(anonymous.body)).not.toBe(503);
      expect(anonymous.status, JSON.stringify(anonymous.body)).toBe(201);
      expect(anonymous.body.anonymous).toBe(true);

      withHostResolution(true);
      setCitizen({ cpf: CPF.prata, level: 'avancada' });
      process.env.DETRAN_LOCAL_ACTOR_ID = PORTAL_ACTOR_ID;
      const basic = await post({ authorization: 'Basic x' }, 'C-03-18 basic');
      await trackManifestation(basic.body?.manifestationId);
      expect(basic.status, JSON.stringify(basic.body)).not.toBe(503);
      expect(basic.status, JSON.stringify(basic.body)).toBe(201);
      expect(basic.body.anonymous).toBe(true);

      withHostResolution(true);
      setCitizen({ cpf: CPF.prata, level: 'avancada' });
      process.env.DETRAN_LOCAL_ACTOR_ID = PORTAL_ACTOR_ID;
      const bearer = await post(
        { authorization: 'Bearer local' },
        'C-03-18 bearer',
      );
      await trackManifestation(bearer.body?.manifestationId);
      expect(bearer.status, JSON.stringify(bearer.body)).not.toBe(503);
      expect(bearer.status, JSON.stringify(bearer.body)).toBe(201);
      expect(bearer.body.anonymous).toBe(false);

      // A janela é gravada no tenant do Host: uma decisão por requisição.
      const hostAfter = await rateLimitWindows(PORTAL_TENANT_ID);
      expect(
        totalHits(hostAfter) - totalHits(hostBefore),
        JSON.stringify(hostAfter),
      ).toBe(3);
      expect(
        hostAfter.some(
          (row) => row.hits > (hostBeforeByKey.get(windowKey(row)) ?? 0),
        ),
        JSON.stringify(hostAfter),
      ).toBe(true);
      // Nenhuma janela nasce em outro tenant por causa dessas requisições.
      expect(await rateLimitWindows(TENANT_B)).toEqual(bBefore);

      // Controle P1: sem membership em B, a janela não é gravada em B.
      process.env.DETRAN_LOCAL_ROLES = 'field-agent';
      process.env.DETRAN_LOCAL_ACTOR_ID = ACTOR_A;
      const crossed = await request(claimB.app.getHttpServer())
        .post(`/v1/est/crash/records/${randomUUID()}/start`)
        .set({
          authorization: 'Bearer local',
          'x-tenant-id': TENANT_B,
          'if-match': '1',
          'idempotency-key': `c-03-18-${randomUUID()}`,
        })
        .send({});
      expect(crossed.status, JSON.stringify(crossed.body)).toBe(403);
      await settle(200);
      expect(await rateLimitWindows(TENANT_B)).toEqual(bBefore);
    } finally {
      // Limpeza: remove as janelas criadas pelo caso e devolve as contagens
      // das janelas que já existiam.
      await asOwnerRole(client);
      for (const row of await rateLimitWindows(PORTAL_TENANT_ID)) {
        const previous = hostBeforeByKey.get(windowKey(row));
        if (previous === undefined)
          await client.query(
            `delete from integration.rate_limit_windows
              where tenant_id = $1 and bucket_key = $2 and window_start = $3::timestamptz`,
            [PORTAL_TENANT_ID, row.bucket_key, row.window_start],
          );
        else if (previous !== row.hits)
          await client.query(
            `update integration.rate_limit_windows set hits = $4
              where tenant_id = $1 and bucket_key = $2 and window_start = $3::timestamptz`,
            [PORTAL_TENANT_ID, row.bucket_key, row.window_start, previous],
          );
      }
    }
  });
});

describe('C-03-19 — P3 com Bearer, sem Host mapeado e sem consulta ao Host (Adenda TASK-0028; sucessor dos casos do mecanismo oportunista removido)', () => {
  const postBearer = async (extra: Record<string, string>, text: string) => {
    withHostResolution(false);
    setCitizen({ cpf: CPF.prata, level: 'avancada' });
    process.env.DETRAN_LOCAL_ACTOR_ID = PORTAL_ACTOR_ID;
    const response = await request(plain.getHttpServer())
      .post('/v1/portal/manifestations')
      .set({
        authorization: 'Bearer citizen-of-a',
        'idempotency-key': randomUUID(),
        ...extra,
      })
      .send({ kind: 'reclamacao', text });
    await trackManifestation(response.body?.manifestationId);
    return response;
  };

  it('C-03-19a — dado perfil local sem DETRAN_PORTAL_HOST_RESOLUTION e sem Host mapeado quando P3 POST /v1/portal/manifestations com Authorization: Bearer e X-Tenant-Id: B (≠ LOCAL_TENANT_ID) então 403 PORTAL.SESSION_TENANT_MISMATCH e nenhuma manifestação gravada em B nem no tenant local', async () => {
    const manifestationsB = await manifestationCount(TENANT_B);
    const manifestationsLocal = await manifestationCount(PORTAL_TENANT_ID);
    const crossed = await postBearer(
      { 'x-tenant-id': TENANT_B },
      'C-03-19a divergente',
    );
    expect(crossed.status, JSON.stringify(crossed.body)).toBe(403);
    expect(codeOf(crossed.body), JSON.stringify(crossed.body)).toBe(
      SESSION_TENANT_MISMATCH,
    );
    expect(await manifestationCount(TENANT_B)).toBe(manifestationsB);
    expect(await manifestationCount(PORTAL_TENANT_ID)).toBe(
      manifestationsLocal,
    );
  });

  it('C-03-19b — dado perfil local sem DETRAN_PORTAL_HOST_RESOLUTION e sem Host mapeado quando P3 POST /v1/portal/manifestations com Authorization: Bearer e X-Tenant-Id = LOCAL_TENANT_ID então 201 anonymous false gravada no tenant local', async () => {
    const manifestationsB = await manifestationCount(TENANT_B);
    const manifestationsLocal = await manifestationCount(PORTAL_TENANT_ID);
    const created = await postBearer(
      { 'x-tenant-id': PORTAL_TENANT_ID },
      'C-03-19b local',
    );
    expect(created.status, JSON.stringify(created.body)).toBe(201);
    expect(created.body.anonymous).toBe(false);
    expect(await manifestationCount(PORTAL_TENANT_ID)).toBe(
      manifestationsLocal + 1,
    );
    expect(await manifestationCount(TENANT_B)).toBe(manifestationsB);
  });

  it('C-03-19c — dado perfil local sem DETRAN_PORTAL_HOST_RESOLUTION e sem Host mapeado quando P3 POST /v1/portal/manifestations com Authorization: Bearer e sem X-Tenant-Id então 201 anonymous false gravada no tenant local', async () => {
    const manifestationsB = await manifestationCount(TENANT_B);
    const manifestationsLocal = await manifestationCount(PORTAL_TENANT_ID);
    const created = await postBearer({}, 'C-03-19c sem cabecalho');
    expect(created.status, JSON.stringify(created.body)).toBe(201);
    expect(created.body.anonymous).toBe(false);
    expect(await manifestationCount(PORTAL_TENANT_ID)).toBe(
      manifestationsLocal + 1,
    );
    expect(await manifestationCount(TENANT_B)).toBe(manifestationsB);
  });
});
