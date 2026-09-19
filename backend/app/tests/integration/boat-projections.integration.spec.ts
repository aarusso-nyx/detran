import { randomUUID } from 'node:crypto';
import type { INestApplication } from '@nestjs/common';
import { RequestContextMutator } from '@stynx-nyx/core';
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

/** C-2-13/C-2-14: REDs pelo entry point §2.1, nunca SSE. */
const TENANT = '00000000-0000-7000-8000-00000000a001';
const TENANT_B = '00000000-0000-7000-8000-00000000a002';
const DATABASE_URL =
  process.env.DETRAN_TEST_DATABASE_URL ??
  `postgresql://${process.env.DB_USER ?? 'postgres'}:${process.env.DB_PASSWORD ?? 'postgres'}@${process.env.DB_HOST ?? 'localhost'}:${process.env.DB_PORT ?? '5432'}/${process.env.DB_NAME ?? 'detran_boat_r0010_projection_test'}`;
const client = new pg.Client({ connectionString: DATABASE_URL });
let app: INestApplication;
const eventIds: string[] = [];
const previousEnv: Record<string, string | undefined> = {};
const ACTOR = '00000000-0000-4000-8000-0000b0000001';

type Result = {
  mode: 'full' | 'incremental';
  tenantId: string;
  scanned: number;
  applied: {
    portalCrashView: number;
    dashboardCrashes: number;
    renaestMirror: number;
  };
  duplicates: number;
};

async function replay(mode: 'full' | 'incremental'): Promise<Result> {
  return replayAs(TENANT, mode);
}

async function replayAs(
  tenantId: string,
  mode: 'full' | 'incremental',
): Promise<Result> {
  const path = new URL(
    '../../src/' + 'boat-projections.replay.ts',
    import.meta.url,
  ).href;
  const mod = (await import(path)) as {
    BoatProjectionsReplayService: new (...args: never[]) => unknown;
  };
  const service = app.get(mod.BoatProjectionsReplayService) as {
    replay(input: { mode: 'full' | 'incremental' }): Promise<Result>;
  };
  return app.get(RequestContextMutator).runWithRequestContext(
    {
      requestId: randomUUID(),
      startedAt: new Date('2026-09-16T12:00:00.000Z'),
      tenantId,
      actorId: ACTOR,
    },
    () => service.replay({ mode }),
  );
}

async function insert(
  domainEvent: 'SINISTRO_FECHADO' | 'SINISTRO_SITUACAO_NACIONAL',
  version: number,
  createdAt = '2026-09-16T12:00:00.000Z',
  schemaVersion = 1,
  tenantId = TENANT,
  nationalStatus = 'RECEBIDO',
): Promise<string> {
  const id = randomUUID();
  const aggregateId = randomUUID();
  const kind =
    domainEvent === 'SINISTRO_FECHADO'
      ? 'crash-record'
      : 'crash-renaest-submission';
  const payload = {
    id,
    type: 'crash.changed',
    domainEvent,
    schemaVersion,
    occurredAt: '2026-09-16T11:00:00.000Z',
    tenantId,
    aggregate: { kind, id: aggregateId, version },
    data:
      domainEvent === 'SINISTRO_FECHADO'
        ? {
            state: 'FECHADO',
            municipalityCode: '1302603',
            severity: 'SEM_VITIMA',
            periodStart: '2026-09-01',
          }
        : { nationalStatus, protocol: 'R10-PROJECTION-0001' },
  };
  await client.query(
    `insert into integration.outbox (id,tenant_id,topic,aggregate_type,aggregate_id,payload,idempotency_key,status,created_at,available_at)
     values ($1,$2,$3,$4,$5,$6::jsonb,$7,'pending',$8::timestamptz,now())`,
    [
      id,
      tenantId,
      domainEvent,
      kind,
      aggregateId,
      JSON.stringify(payload),
      `projection-red-${id}`,
      createdAt,
    ],
  );
  eventIds.push(id);
  return id;
}

beforeAll(async () => {
  for (const key of [
    'DETRAN_RUNTIME_PROFILE',
    'DETRAN_LOCAL_TENANT_ID',
    'DETRAN_LOCAL_ACTOR_ID',
    'DETRAN_LOCAL_ROLES',
    'DATABASE_URL',
    'STYNX_OWNER_DATABASE_URL',
    'STYNX_APP_DATABASE_URL',
    'STYNX_READER_DATABASE_URL',
  ])
    previousEnv[key] = process.env[key];
  process.env.DETRAN_RUNTIME_PROFILE = 'test';
  process.env.DETRAN_LOCAL_TENANT_ID = TENANT;
  process.env.DETRAN_LOCAL_ACTOR_ID = ACTOR;
  process.env.DETRAN_LOCAL_ROLES = 'processing-operator';
  process.env.DATABASE_URL = DATABASE_URL;
  process.env.STYNX_OWNER_DATABASE_URL = DATABASE_URL;
  process.env.STYNX_APP_DATABASE_URL = DATABASE_URL;
  process.env.STYNX_READER_DATABASE_URL = DATABASE_URL;
  await client.connect();
  await client.query("select set_config('app.role','owner',false)");
  const { NestFactory } = await import('@nestjs/core');
  const { AppModule } = await import('../../src/app.module.js');
  app = await NestFactory.create(AppModule.forRoot(), { logger: false });
  await app.init();
});

afterAll(async () => {
  await app?.close();
  if (eventIds.length > 0) {
    await client.query(
      'delete from portal.projection_applied_event where event_id = any($1::uuid[])',
      [eventIds],
    );
    await client.query(
      'delete from dashboard.crash_projection_applied_event where event_id = any($1::uuid[])',
      [eventIds],
    );
    await client.query(
      'delete from integration.renaest_mirror_applied_event where event_id = any($1::uuid[])',
      [eventIds],
    );
    await client.query(
      'delete from dashboard.crash_aggregate where last_event_id = any($1::uuid[])',
      [eventIds],
    );
    await client.query(
      'delete from integration.renaest_mirror where last_event_id = any($1::uuid[])',
      [eventIds],
    );
  }
  await client.query(
    "delete from integration.outbox where idempotency_key like 'projection-red-%'",
  );
  await client.end();
  for (const [key, value] of Object.entries(previousEnv)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

describe('C-2-13 — replay BOAT', () => {
  it('dado eventos Dashboard e RENAEST canônicos quando replay incremental é invocado então cria efeito e ledger atômicos', async () => {
    const dashboard = await insert('SINISTRO_FECHADO', 7);
    const mirror = await insert('SINISTRO_SITUACAO_NACIONAL', 7);
    const result = await replay('incremental');
    expect(result).toMatchObject({
      mode: 'incremental',
      tenantId: TENANT,
      applied: { dashboardCrashes: 1, renaestMirror: 1 },
    });
    const rows = await client.query<{
      dashboard: string;
      effect: string;
      mirror: string;
    }>(
      `select (select count(*) from dashboard.crash_projection_applied_event where tenant_id=$1 and event_id=$2)::text dashboard,
              (select count(*) from dashboard.crash_aggregate where tenant_id=$1 and last_event_id=$2)::text effect,
              (select count(*) from integration.renaest_mirror_applied_event where tenant_id=$1 and event_id=$3)::text mirror`,
      [TENANT, dashboard, mirror],
    );
    expect(rows.rows[0]).toEqual({ dashboard: '1', effect: '1', mirror: '1' });
  });

  it('dado evento já aplicado quando replay incremental roda de novo então C-2-13 não duplica o ledger nem o efeito', async () => {
    const id = await insert('SINISTRO_FECHADO', 8);
    await replay('incremental');
    const duplicate = await replay('incremental');
    const rows = await client.query<{ ledger: string; effect: string }>(
      `select (select count(*) from dashboard.crash_projection_applied_event where tenant_id=$1 and event_id=$2)::text ledger,
              (select count(*) from dashboard.crash_aggregate where tenant_id=$1 and last_event_id=$2)::text effect`,
      [TENANT, id],
    );
    expect(duplicate.duplicates).toBeGreaterThanOrEqual(1);
    expect(rows.rows[0]).toEqual({ ledger: '1', effect: '1' });
  });

  it('dado commit tardio com created_at anterior quando replay incremental é invocado então C-2-13 ainda aplica o evento sem cursor exclusivo', async () => {
    const id = await insert('SINISTRO_FECHADO', 9, '2025-01-01T00:00:00.000Z');
    const result = await replay('incremental');
    const ledger = await client.query<{ count: string }>(
      'select count(*)::text as count from dashboard.crash_projection_applied_event where tenant_id=$1 and event_id=$2',
      [TENANT, id],
    );
    expect(result.applied.dashboardCrashes).toBe(1);
    expect(ledger.rows[0]?.count).toBe('1');
  });

  it('dado outbox canônica quando replay full é invocado então C-2-13 reconstrói o consumidor pelo entry point explícito', async () => {
    const id = await insert('SINISTRO_FECHADO', 10);
    const result = await replay('full');
    const ledger = await client.query<{ count: string }>(
      'select count(*)::text as count from dashboard.crash_projection_applied_event where tenant_id=$1 and event_id=$2',
      [TENANT, id],
    );
    expect(result).toMatchObject({ mode: 'full', tenantId: TENANT });
    expect(ledger.rows[0]?.count).toBe('1');
  });

  it('dado schemaVersion incompatível quando replay incremental é invocado então C-2-13 falha BOAT.PROJECTIONS_SCHEMA_UNSUPPORTED sem ledger nem efeito', async () => {
    const id = await insert(
      'SINISTRO_FECHADO',
      11,
      '2026-09-16T12:00:00.000Z',
      999,
    );
    await expect(replay('incremental')).rejects.toMatchObject({
      code: 'BOAT.PROJECTIONS_SCHEMA_UNSUPPORTED',
    });
    const rows = await client.query<{ ledger: string; effect: string }>(
      `select (select count(*) from dashboard.crash_projection_applied_event where tenant_id=$1 and event_id=$2)::text ledger,
              (select count(*) from dashboard.crash_aggregate where tenant_id=$1 and last_event_id=$2)::text effect`,
      [TENANT, id],
    );
    expect(rows.rows[0]).toEqual({ ledger: '0', effect: '0' });
    await client.query('delete from integration.outbox where id = $1', [id]);
  });

  it('dado evento do tenant B quando replay roda no contexto A então RLS não cria ledger ou efeito no tenant A', async () => {
    const id = await insert('SINISTRO_FECHADO', 12, undefined, 1, TENANT_B);
    await replayAs(TENANT, 'incremental');
    const rows = await client.query<{ count: string }>(
      'select count(*)::text as count from dashboard.crash_projection_applied_event where tenant_id=$1 and event_id=$2',
      [TENANT, id],
    );
    expect(rows.rows[0]?.count).toBe('0');
  });

  it('dado status RENAEST inválido quando replay grava espelho então a constraint real reverte efeito e ledger', async () => {
    const id = await insert(
      'SINISTRO_SITUACAO_NACIONAL',
      13,
      undefined,
      1,
      TENANT,
      'INVALIDO',
    );
    await expect(replay('incremental')).rejects.toThrow(
      /ck_integration_renaest_mirror_status|constraint/i,
    );
    const rows = await client.query<{ ledger: string; effect: string }>(
      `select (select count(*) from integration.renaest_mirror_applied_event where tenant_id=$1 and event_id=$2)::text ledger, (select count(*) from integration.renaest_mirror where tenant_id=$1 and last_event_id=$2)::text effect`,
      [TENANT, id],
    );
    expect(rows.rows[0]).toEqual({ ledger: '0', effect: '0' });
    await client.query('delete from integration.outbox where id = $1', [id]);
  });
});

describe('C-2-14 — leituras internas consumidoras', () => {
  it('dadas células n menor que 10 e total dedutível quando Dashboard readInternal é chamado então aplica supressões primária/secundária e mantém publicação bloqueada', async () => {
    const eventA = randomUUID();
    const eventB = randomUUID();
    await client.query(
      `insert into dashboard.crash_aggregate (tenant_id,period_start,municipality_code,severity,crash_count,last_event_id,event_schema_version,aggregate_version)
       values ($1,'2026-09-01','1302603','SEM_VITIMA',3,$2,1,1),($1,'2026-09-01','1302603','COM_VITIMA',12,$3,1,1)`,
      [TENANT, eventA, eventB],
    );
    try {
      const path = new URL(
        '../../../domains/dashboard/crashes/src/handwritten/dashboard-crashes.projection.ts',
        import.meta.url,
      ).href;
      const mod = (await import(path)) as {
        DashboardCrashesProjection: new (...args: never[]) => unknown;
      };
      const projection = app.get(mod.DashboardCrashesProjection) as {
        readInternal(input: {
          periodStart: string;
          periodEnd: string;
        }): Promise<{
          cells: readonly { count: number | null; suppression: string }[];
          total: number | null;
          totalSuppressed: boolean;
          publicationStatus: string;
        }>;
      };
      const result = await app.get(RequestContextMutator).runWithRequestContext(
        {
          requestId: randomUUID(),
          startedAt: new Date(),
          tenantId: TENANT,
          actorId: ACTOR,
        },
        () =>
          projection.readInternal({
            periodStart: '2026-09-01',
            periodEnd: '2026-09-30',
          }),
      );
      expect(result.publicationStatus).toBe('blocked');
      expect(result.cells).toContainEqual(
        expect.objectContaining({ count: null, suppression: 'primary' }),
      );
      expect(
        result.cells.some((cell) => cell.suppression === 'secondary') ||
          result.totalSuppressed,
      ).toBe(true);
    } finally {
      await client.query(
        'delete from dashboard.crash_aggregate where last_event_id = any($1::uuid[])',
        [[eventA, eventB]],
      );
    }
  });

  it('dada crash_view interna com source_pending quando Portal readCitizen é chamado então nega acesso sem alegação de titularidade', async () => {
    const crashId = randomUUID();
    const eventId = randomUUID();
    await client.query(
      `insert into portal.crash_view (tenant_id,crash_id,subject_cpf_hash,state_label,summary_json,third_party_fields_suppressed,last_event_id)
       values ($1,$2,'fixture-source-pending','FECHADO',$3::jsonb,true,$4)`,
      [
        TENANT,
        crashId,
        JSON.stringify({ identityStatus: 'source_pending' }),
        eventId,
      ],
    );
    try {
      const path = new URL(
        '../../../domains/portal/projections/src/handwritten/boat-crash.projection.ts',
        import.meta.url,
      ).href;
      const mod = (await import(path)) as {
        PortalCrashProjection: new (...args: never[]) => unknown;
      };
      const projection = app.get(mod.PortalCrashProjection) as {
        readCitizen(id: string): Promise<{ access: string; reason?: string }>;
      };
      const result = await app.get(RequestContextMutator).runWithRequestContext(
        {
          requestId: randomUUID(),
          startedAt: new Date(),
          tenantId: TENANT,
          actorId: ACTOR,
        },
        () => projection.readCitizen(crashId),
      );
      expect(result).toEqual({ access: 'denied', reason: 'source_pending' });
    } finally {
      await client.query(
        'delete from portal.crash_view where last_event_id = $1',
        [eventId],
      );
    }
  });
});
