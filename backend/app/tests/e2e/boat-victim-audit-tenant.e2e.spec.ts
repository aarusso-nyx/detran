import 'reflect-metadata';
import { randomUUID } from 'node:crypto';
import type { INestApplication } from '@nestjs/common';
import pg from 'pg';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

/**
 * R-0022 B6 — hotfix autorizado (AUTHORIZATION.md Adenda B13, OD-R22-58 (a);
 * política B9: tríade Inspector → Engineer, vermelho antes da correção).
 *
 * Defeito: `BoatVictimPurposeInterceptor` (`backend/app/src/app.module.ts`)
 * grava a auditoria `EST_CRASH_VICTIM_READ` com o tenant de
 * `request.tenantId ?? X-Tenant-Id` ANTES da validação de _membership_ do
 * `TenantContextInterceptor` do STYNX. Um principal com _claim_ = B, mas cujo
 * ator só tem _membership_ em A, recebe 403 e deixa em B uma linha com o ator
 * de A e o texto livre de `purpose`. Mesma forma de C-03-09 de R-0022 CTG-0003
 * (`r22-tenancy-platform.e2e.spec.ts`), aqui sobre STYNX 1.4.0.
 *
 * Fixtures (sem tenant nem persona nova):
 * - tenants/atores de `tools/check-rls-smoke.ts:11-14` (A `…101`, B `…102`,
 *   ator A `…201`, ator B `…202`, _membership_ só no próprio tenant),
 *   preparados com o mesmo `on conflict … do update` do script;
 * - para o detalhe com 200, a vítima de fixture BOAT `…a3000001`, o tenant
 *   `…a001` e o ator `…b0000001` de `policy-routes.e2e.spec.ts` ("acesso BOAT
 *   a vítima"): não há vítima de fixture nos tenants de isolamento.
 * - texto de finalidade das suítes BOAT (`policy-routes.e2e.spec.ts`).
 *
 * T-14: no perfil `test` a _claim_ do principal local é
 * `DETRAN_LOCAL_TENANT_ID`, lido no carregamento de `detran-runtime.ts`; cada
 * _claim_ tem um grafo de módulos novo (`vi.resetModules()` + `import`
 * dinâmico). Ator e papéis são lidos do ambiente a cada requisição.
 *
 * A auditoria é lida pelo cliente owner só para a verificação. Os filtros
 * (instante do banco, ação, tenant, ator e finalidade) isolam as linhas deste
 * arquivo das suítes BOAT que rodam em paralelo.
 */

const TENANT_A = '00000000-0000-7000-8000-000000000101';
const TENANT_B = '00000000-0000-7000-8000-000000000102';
const ACTOR_A = '00000000-0000-4000-8000-000000000201';
const ACTOR_B = '00000000-0000-4000-8000-000000000202';
const BOAT_TENANT = '00000000-0000-7000-8000-00000000a001';
const BOAT_ACTOR = '00000000-0000-4000-8000-0000b0000001';
const BOAT_VICTIM = '00000000-0000-7000-8000-0000a3000001';
/** Sinistro RASCUNHO de fixture (`boat-crash-commands.e2e.spec.ts`), tenant `…a001`. */
const BOAT_DRAFT = '00000000-0000-7000-8000-0000a1000001';
const BOAT_PURPOSE = 'consulta de vitimas do sinistro';
const VICTIM_READ = 'EST_CRASH_VICTIM_READ';

const { Client } = pg;
const client = new Client({
  connectionString:
    process.env.DETRAN_TEST_DATABASE_URL ??
    process.env.DATABASE_URL ??
    `postgresql://${process.env.DB_USER ?? 'postgres'}:${process.env.DB_PASSWORD ?? 'postgres'}@${process.env.DB_HOST ?? 'localhost'}:${process.env.DB_PORT ?? '5432'}/${process.env.DB_NAME ?? 'detran_r10'}`,
});

const previousEnv: Record<string, string | undefined> = {};
let claimA: INestApplication;
let claimB: INestApplication;
let claimBoat: INestApplication;

/** Instância com outra _claim_ (T-14): env antes do `import` de um grafo novo. */
async function bootWithClaim(claimTenantId: string): Promise<INestApplication> {
  process.env.DETRAN_LOCAL_TENANT_ID = claimTenantId;
  vi.resetModules();
  const { NestFactory } = await import('@nestjs/core');
  const { AppModule } = await import('../../src/app.module.js');
  const app = await NestFactory.create(AppModule.forRoot(), {
    logger: false,
    abortOnError: false,
  });
  await app.init();
  return app;
}

async function asOwner(): Promise<void> {
  await client.query(`select set_config('app.role', 'owner', false)`);
}

/** Mesmas linhas e o mesmo `on conflict … do update` de `tools/check-rls-smoke.ts`. */
async function seedIsolationTenants(): Promise<void> {
  await asOwner();
  await client.query(
    `insert into auth.tenants (id, slug, name) values
       ($1, 'rr', 'DETRAN RR'), ($2, 'sp', 'DETRAN SP')
     on conflict (id) do update set name = excluded.name`,
    [TENANT_A, TENANT_B],
  );
  await client.query(
    `insert into auth.users (id, tenant_id, email, display_name) values
       ($1, $3, 'rls-a@detran.invalid', 'RLS A'),
       ($2, $4, 'rls-b@detran.invalid', 'RLS B')
     on conflict (id) do update set tenant_id = excluded.tenant_id`,
    [ACTOR_A, ACTOR_B, TENANT_A, TENANT_B],
  );
  await client.query(
    `insert into auth.memberships (tenant_id, user_id) values ($1, $2), ($3, $4)
     on conflict (tenant_id, user_id) do update set is_active = true`,
    [TENANT_A, ACTOR_A, TENANT_B, ACTOR_B],
  );
}

async function dbNow(): Promise<string> {
  await asOwner();
  return (
    await client.query<{ now: string }>(`select clock_timestamp()::text as now`)
  ).rows[0]!.now;
}

interface AuditRow {
  tenant_id: string;
  actor_id: string | null;
  entity_id: string | null;
  purpose: string | null;
}

/** `EST_CRASH_VICTIM_READ` gravadas desde `since`, lidas pelo owner. */
async function victimReadsSince(
  since: string,
  filter: { tenantId?: string; actorId?: string } = {},
): Promise<AuditRow[]> {
  await asOwner();
  return (
    await client.query<AuditRow>(
      `select tenant_id::text as tenant_id,
              actor_id::text as actor_id,
              entity_id::text as entity_id,
              details->'metadata'->>'purpose' as purpose
         from audit.events
        where occurred_at >= $1::timestamptz
          and action = $2
          and details->'metadata'->>'purpose' = $3
          and ($4::uuid is null or tenant_id = $4)
          and ($5::uuid is null or actor_id = $5)
        order by event_id`,
      [
        since,
        VICTIM_READ,
        BOAT_PURPOSE,
        filter.tenantId ?? null,
        filter.actorId ?? null,
      ],
    )
  ).rows;
}

/** A gravação indevida (se houver) termina antes da resposta; margem curta. */
const settle = (ms = 200): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

function asActor(actorId: string, tenantId: string): Record<string, string> {
  process.env.DETRAN_LOCAL_ROLES = 'field-agent';
  process.env.DETRAN_LOCAL_ACTOR_ID = actorId;
  return { authorization: 'Bearer local', 'x-tenant-id': tenantId };
}

function codeOf(body: unknown): unknown {
  return (body as { code?: unknown } | undefined)?.code;
}

beforeAll(async () => {
  for (const key of [
    'DETRAN_RUNTIME_PROFILE',
    'DETRAN_LOCAL_TENANT_ID',
    'DETRAN_LOCAL_ACTOR_ID',
    'DETRAN_LOCAL_ROLES',
  ]) {
    previousEnv[key] = process.env[key];
  }
  process.env.DETRAN_RUNTIME_PROFILE = 'test';
  process.env.DETRAN_LOCAL_ROLES = 'field-agent';
  await client.connect();
  await seedIsolationTenants();
  claimA = await bootWithClaim(TENANT_A);
  claimB = await bootWithClaim(TENANT_B);
  claimBoat = await bootWithClaim(BOAT_TENANT);
}, 60_000);

afterAll(async () => {
  await claimA?.close();
  await claimB?.close();
  await claimBoat?.close();
  await client.end();
  for (const [key, value] of Object.entries(previousEnv)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

describe('R-0022 B6 — auditoria de finalidade BOAT só depois da validação de membership', () => {
  for (const [label, path] of [
    ['lista', '/v1/est/crash/victims'],
    ['detalhe', `/v1/est/crash/victims/${BOAT_VICTIM}`],
  ] as const) {
    it(`dado claim = B e ator A (sem membership em B) quando GET ${label} de vítimas com X-Tenant-Id = B e purpose então 403 e nenhuma linha ${VICTIM_READ} em B nem em A`, async () => {
      const since = await dbNow();
      const crossed = await request(claimB.getHttpServer())
        .get(path)
        .query({ purpose: BOAT_PURPOSE })
        .set(asActor(ACTOR_A, TENANT_B));
      expect(crossed.status, JSON.stringify(crossed.body)).toBe(403);
      await settle();
      const leakedInB = await victimReadsSince(since, { tenantId: TENANT_B });
      expect(leakedInB, JSON.stringify(leakedInB)).toEqual([]);
      const leakedInA = await victimReadsSince(since, { tenantId: TENANT_A });
      expect(leakedInA, JSON.stringify(leakedInA)).toEqual([]);
      const byActorA = await victimReadsSince(since, { actorId: ACTOR_A });
      expect(byActorA, JSON.stringify(byActorA)).toEqual([]);
    });

    it(`dado claim = A e ator A quando GET ${label} de vítimas com X-Tenant-Id = B e purpose então 403 e nenhuma linha ${VICTIM_READ} em B nem em A`, async () => {
      const since = await dbNow();
      const crossed = await request(claimA.getHttpServer())
        .get(path)
        .query({ purpose: BOAT_PURPOSE })
        .set(asActor(ACTOR_A, TENANT_B));
      expect(crossed.status, JSON.stringify(crossed.body)).toBe(403);
      await settle();
      const leakedInB = await victimReadsSince(since, { tenantId: TENANT_B });
      expect(leakedInB, JSON.stringify(leakedInB)).toEqual([]);
      const byActorA = await victimReadsSince(since, { actorId: ACTOR_A });
      expect(byActorA, JSON.stringify(byActorA)).toEqual([]);
    });

    it(`dado claim = A e ator A quando GET ${label} de vítimas sem purpose então 400 BOAT.VICTIM_PURPOSE_REQUIRED e nenhuma linha ${VICTIM_READ}`, async () => {
      const since = await dbNow();
      const withoutPurpose = await request(claimA.getHttpServer())
        .get(path)
        .set(asActor(ACTOR_A, TENANT_A));
      expect(withoutPurpose.status, JSON.stringify(withoutPurpose.body)).toBe(
        400,
      );
      expect(codeOf(withoutPurpose.body)).toBe('BOAT.VICTIM_PURPOSE_REQUIRED');
      await settle();
      await asOwner();
      const rows = await client.query<{ count: string }>(
        `select count(*)::text as count
           from audit.events
          where occurred_at >= $1::timestamptz
            and action = $2
            and actor_id = $3`,
        [since, VICTIM_READ, ACTOR_A],
      );
      expect(rows.rows[0]?.count).toBe('0');
    });
  }

  it(`dado claim = A e ator A (membership em A) quando GET lista de vítimas com X-Tenant-Id = A e purpose então 200 e exatamente uma linha ${VICTIM_READ} com o tenant e o ator do contexto`, async () => {
    const since = await dbNow();
    const allowed = await request(claimA.getHttpServer())
      .get('/v1/est/crash/victims')
      .query({ purpose: BOAT_PURPOSE })
      .set(asActor(ACTOR_A, TENANT_A));
    expect(allowed.status, JSON.stringify(allowed.body)).toBe(200);
    await settle();
    const audited = await victimReadsSince(since, { actorId: ACTOR_A });
    expect(audited, JSON.stringify(audited)).toEqual([
      {
        tenant_id: TENANT_A,
        actor_id: ACTOR_A,
        entity_id: null,
        purpose: BOAT_PURPOSE,
      },
    ]);
  });

  it(`dada a vítima de fixture BOAT e ator com membership no tenant dela quando GET detalhe com purpose então 200 e exatamente uma linha ${VICTIM_READ} com o tenant, o ator e a vítima do contexto`, async () => {
    const since = await dbNow();
    const allowed = await request(claimBoat.getHttpServer())
      .get(`/v1/est/crash/victims/${BOAT_VICTIM}`)
      .query({ purpose: BOAT_PURPOSE })
      .set(asActor(BOAT_ACTOR, BOAT_TENANT));
    expect(allowed.status, JSON.stringify(allowed.body)).toBe(200);
    await settle();
    const audited = (
      await victimReadsSince(since, {
        tenantId: BOAT_TENANT,
        actorId: BOAT_ACTOR,
      })
    ).filter((row) => row.entity_id === BOAT_VICTIM);
    expect(audited, JSON.stringify(audited)).toEqual([
      {
        tenant_id: BOAT_TENANT,
        actor_id: BOAT_ACTOR,
        entity_id: BOAT_VICTIM,
        purpose: BOAT_PURPOSE,
      },
    ]);
  });
});

/**
 * Varredura (item 3 do hotfix B6): o mesmo padrão fora da auditoria BOAT.
 * Todo `@Action` de mutação (`backend/domains/shared/src/decorators.ts`) leva
 * `RateLimit({ bucket: 'tenant' })`; o `RateLimitGuard` do STYNX é guard
 * global, logo roda ANTES do `TenantContextInterceptor`, e consome
 * `DetranPersistentPipelineStore` (`detran-runtime.ts`), cujo `runBound`
 * semeia `runWithRequestContext` com o tenant da requisição (claim/cabeçalho)
 * e grava `integration.rate_limit_windows` nesse tenant.
 */
async function rateLimitHits(tenantId: string): Promise<number> {
  await asOwner();
  const result = await client.query<{ hits: string }>(
    `select coalesce(sum(hits), 0)::text as hits
       from integration.rate_limit_windows
      where tenant_id = $1`,
    [tenantId],
  );
  return Number(result.rows[0]?.hits ?? 0);
}

describe('R-0022 B6 (varredura) — janela de rate limit só depois da validação de membership', () => {
  it('dado claim = B e ator A (sem membership em B) quando POST start de sinistro com X-Tenant-Id = B então 403 e nenhuma gravação em integration.rate_limit_windows de B', async () => {
    const before = await rateLimitHits(TENANT_B);
    const crossed = await request(claimB.getHttpServer())
      .post(`/v1/est/crash/records/${BOAT_DRAFT}/start`)
      .set({
        ...asActor(ACTOR_A, TENANT_B),
        'if-match': '1',
        'idempotency-key': `boat-victim-audit-tenant-${randomUUID()}`,
      })
      .send({});
    expect(crossed.status, JSON.stringify(crossed.body)).toBe(403);
    await settle();
    expect(await rateLimitHits(TENANT_B)).toBe(before);
  });

  it('dado claim = A e ator A (membership em A) quando POST start de sinistro com X-Tenant-Id = A então a janela de rate limit de A é gravada (controle do observador)', async () => {
    const before = await rateLimitHits(TENANT_A);
    const allowed = await request(claimA.getHttpServer())
      .post(`/v1/est/crash/records/${BOAT_DRAFT}/start`)
      .set({
        ...asActor(ACTOR_A, TENANT_A),
        'if-match': '1',
        'idempotency-key': `boat-victim-audit-tenant-${randomUUID()}`,
      })
      .send({});
    expect(allowed.status, JSON.stringify(allowed.body)).not.toBe(403);
    await settle();
    expect(await rateLimitHits(TENANT_A)).toBeGreaterThan(before);
  });
});
