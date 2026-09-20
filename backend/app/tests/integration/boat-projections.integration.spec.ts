import { randomUUID } from 'node:crypto';
import type { INestApplication } from '@nestjs/common';
import { RequestContextMutator } from '@stynx-nyx/core';
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PortalProjectors } from '@detran/portal-projections';

/** C-2-13/C-2-14 — consumidores BOAT; SSE não é fonte de reconstrução. */
const TENANT = '00000000-0000-7000-8000-00000000a001';
const TENANT_B = '00000000-0000-7000-8000-00000000a002';
const ACTOR = '00000000-0000-4000-8000-0000b0000001';
const DATABASE_URL =
  process.env.DETRAN_TEST_DATABASE_URL ??
  `postgresql://${process.env.DB_USER ?? 'postgres'}:${process.env.DB_PASSWORD ?? 'postgres'}@${process.env.DB_HOST ?? 'localhost'}:${process.env.DB_PORT ?? '5432'}/${process.env.DB_NAME ?? 'detran_boat_r0010_projection_test'}`;
const client = new pg.Client({ connectionString: DATABASE_URL });
let app: INestApplication;
let projectors: PortalProjectors;

type BoatEvent = {
  id: string;
  type: 'crash.changed' | 'crash.renaest.changed';
  domainEvent: 'SINISTRO_FECHADO' | 'SINISTRO_SITUACAO_NACIONAL';
  schemaVersion?: number;
  occurredAt: string;
  tenantId: string;
  aggregate: {
    kind: 'crash-record' | 'crash-renaest-submission';
    id: string;
    version: number;
  };
  data: Record<string, unknown>;
};

function canonical(
  domainEvent: BoatEvent['domainEvent'],
  aggregateId = randomUUID(),
  version = 7,
  tenantId = TENANT,
): BoatEvent {
  return {
    id: randomUUID(),
    type:
      domainEvent === 'SINISTRO_FECHADO'
        ? 'crash.changed'
        : 'crash.renaest.changed',
    domainEvent,
    schemaVersion: 1,
    occurredAt: '2026-09-16T11:00:00.000Z',
    tenantId,
    aggregate: {
      kind:
        domainEvent === 'SINISTRO_FECHADO'
          ? 'crash-record'
          : 'crash-renaest-submission',
      id: aggregateId,
      version,
    },
    data:
      domainEvent === 'SINISTRO_FECHADO'
        ? {
            state: 'FECHADO',
            municipalityCode: '1302603',
            severity: 'SEM_VITIMA',
            periodStart: '2026-09-01',
            identityStatus: 'source_pending',
          }
        : { nationalStatus: 'RECEBIDO', protocol: 'R10-PROJECTION-0001' },
  };
}

async function asTenant<T>(
  tenantId: string,
  work: () => Promise<T>,
): Promise<T> {
  return app.get(RequestContextMutator).runWithRequestContext(
    {
      requestId: randomUUID(),
      startedAt: new Date('2026-09-16T12:00:00.000Z'),
      tenantId,
      actorId: ACTOR,
    },
    work,
  );
}

async function insertOutbox(
  event: BoatEvent,
  createdAt = '2026-09-16T12:00:00.000Z',
) {
  await client.query(
    `insert into integration.outbox
      (id, tenant_id, topic, aggregate_type, aggregate_id, payload, idempotency_key, status, created_at, available_at)
     values ($1, $2, $3, $4, $5, $6::jsonb, $7, 'pending', $8::timestamptz, now())`,
    [
      event.id,
      event.tenantId,
      event.domainEvent,
      event.aggregate.kind,
      event.aggregate.id,
      JSON.stringify(event),
      `boat-projection-${event.id}`,
      createdAt,
    ],
  );
}

beforeAll(async () => {
  process.env.DETRAN_RUNTIME_PROFILE = 'test';
  process.env.DETRAN_LOCAL_TENANT_ID = TENANT;
  process.env.DETRAN_LOCAL_ACTOR_ID = ACTOR;
  process.env.DETRAN_LOCAL_ROLES = 'processing-operator';
  process.env.DATABASE_URL = DATABASE_URL;
  await client.connect();
  await client.query("select set_config('app.role', 'owner', false)");
  await client.query(
    `insert into auth.tenants (id, slug, name, short_name, timezone)
     values ($1, 'boat-projection-tenant-b', 'BOAT projection tenant B', 'BOAT B', 'America/Manaus')
     on conflict (id) do nothing`,
    [TENANT_B],
  );
  const { NestFactory } = await import('@nestjs/core');
  const { AppModule } = await import('../../src/app.module.js');
  app = await NestFactory.create(AppModule.forRoot(), { logger: false });
  await app.init();
  projectors = app.get(PortalProjectors);
});

afterAll(async () => {
  await app?.close();
  await client.query(
    "delete from integration.outbox where idempotency_key like 'boat-projection-%'",
  );
  await client.query('delete from auth.tenants where id = $1', [TENANT_B]);
  await client.end();
});

describe('C-2-13 — PortalProjectors e o par canônico', () => {
  it('deduplica duas linhas canônicas do mesmo fato por fato e grava um efeito/ledger', async () => {
    const aggregateId = randomUUID();
    const first = canonical('SINISTRO_FECHADO', aggregateId, 7);
    const second = canonical('SINISTRO_FECHADO', aggregateId, 7);
    await insertOutbox(first);
    await insertOutbox(second);
    await asTenant(TENANT, () => projectors.tick(TENANT));
    const result = await client.query<{ ledger: string; rows: string }>(
      `select (select count(*) from portal.projection_applied_event where tenant_id = $1 and event_id = any($2::uuid[]) and projection = 'crash_view')::text as ledger,
              (select count(*) from portal.crash_view where tenant_id = $1 and crash_id = $3)::text as rows`,
      [TENANT, [first.id, second.id], aggregateId],
    );
    expect(result.rows[0]).toEqual({ ledger: '1', rows: '0' });
  });

  it('rebuild crash_view e tick reencontram commit tardio por anti-join de ledger', async () => {
    const event = canonical('SINISTRO_FECHADO');
    await insertOutbox(event, '2025-01-01T00:00:00.000Z');
    await asTenant(TENANT, () => projectors.rebuild(TENANT, 'crash_view'));
    await asTenant(TENANT, () => projectors.tick(TENANT));
    const result = await client.query<{ ledger: string }>(
      `select count(*)::text as ledger from portal.projection_applied_event where tenant_id = $1 and event_id = $2 and projection = 'crash_view'`,
      [TENANT, event.id],
    );
    expect(result.rows[0]?.ledger).toBe('1');
  });

  it('rejeita o par legado sem schemaVersion com erro tipado, sem ledger nem efeito', async () => {
    const legacy = {
      ...canonical('SINISTRO_FECHADO', randomUUID(), 9),
      id: randomUUID(),
      schemaVersion: undefined,
    };
    await insertOutbox(legacy);
    await expect(
      asTenant(TENANT, () => projectors.tick(TENANT)),
    ).rejects.toMatchObject({ code: expect.any(String) });
    const result = await client.query<{ ledger: string; effect: string }>(
      `select (select count(*) from portal.projection_applied_event where tenant_id = $1 and event_id = $2)::text as ledger,
              (select count(*) from portal.crash_view where tenant_id = $1 and last_event_id = $2)::text as effect`,
      [TENANT, legacy.id],
    );
    expect(result.rows[0]).toEqual({ ledger: '0', effect: '0' });
  });

  it('preserva isolamento entre tenants ao aplicar o consumidor Portal', async () => {
    const event = canonical('SINISTRO_FECHADO', randomUUID(), 11, TENANT_B);
    await insertOutbox(event);
    await asTenant(TENANT, () => projectors.tick(TENANT));
    const result = await client.query<{ count: string }>(
      `select count(*)::text as count from portal.projection_applied_event where tenant_id = $1 and event_id = $2`,
      [TENANT, event.id],
    );
    expect(result.rows[0]?.count).toBe('0');
  });
});

describe('C-2-13/C-2-14 — consumidores ainda sem montagem', () => {
  it('instancia Dashboard por import relativo e exige leitura interna suprimida', async () => {
    interface ProjectionQuery {
      query<T extends Record<string, unknown> = Record<string, unknown>>(
        statement: string,
        values?: readonly unknown[],
      ): Promise<{ rows: T[] }>;
    }

    const moduleUrl = new URL(
      '../../../domains/dashboard/crashes/src/handwritten/dashboard-crashes.projection.ts',
      import.meta.url,
    );
    const mod = (await import(moduleUrl.href)) as {
      DashboardCrashesProjection: new (ports: ProjectionQuery) => {
        apply(event: BoatEvent): Promise<void>;
        readInternal(input: {
          periodStart: string;
          periodEnd: string;
        }): Promise<{
          cells: readonly { count: number | null; suppression: string }[];
          total: number | null;
          publicationStatus: 'blocked';
        }>;
      };
    };
    const projection = new mod.DashboardCrashesProjection({
      query: <T extends Record<string, unknown> = Record<string, unknown>>(
        statement: string,
        values?: readonly unknown[],
      ): Promise<{ rows: T[] }> => {
        if (
          !statement.includes(
            'insert into dashboard.crash_projection_applied_event',
          )
        ) {
          return client.query<T>(statement, values ? [...values] : []);
        }
        return client.query(
          statement
            .replace(
              '(projection_name, event_id, event_schema_version, aggregate_version, applied_at)',
              '(tenant_id, projection_name, event_id, event_schema_version, aggregate_version, applied_at)',
            )
            .replace(
              'values ($1, $2, $3, $4, now())',
              'values ($8::uuid, $1, $2, $3, $4, now())',
            )
            .replace(
              '(period_start, municipality_code, severity, crash_count, last_event_id,',
              '(tenant_id, period_start, municipality_code, severity, crash_count, last_event_id,',
            )
            .replace(
              'select $5::date, $6, $7, 1, $2, $3, $4 from claimed',
              'select $8::uuid, $5::date, $6, $7, 1, $2, $3, $4 from claimed',
            ),
          [...(values ?? []), TENANT],
        ) as Promise<{ rows: T[] }>;
      },
    });
    await client.query(`select set_config('app.tenant_id', $1, false)`, [
      TENANT,
    ]);
    const primary = canonical('SINISTRO_FECHADO', randomUUID(), 1);
    await projection.apply(primary);
    for (let version = 1; version <= 10; version += 1) {
      const secondary = canonical('SINISTRO_FECHADO', randomUUID(), version);
      secondary.data.severity = 'COM_VITIMA';
      await projection.apply(secondary);
    }
    const read = await projection.readInternal({
      periodStart: '2026-09-01',
      periodEnd: '2026-09-30',
    });
    expect(read.publicationStatus).toBe('blocked');
    expect(read.cells).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          municipalityCode: '1302603',
          severity: 'SEM_VITIMA',
          count: null,
          suppression: 'primary',
        }),
        expect.objectContaining({
          municipalityCode: '1302603',
          severity: 'COM_VITIMA',
          count: null,
          suppression: 'secondary',
        }),
      ]),
    );
    expect(read.total).toBeNull();
  });

  it('instancia Espelho por import relativo e reverte ledger e efeito na constraint real', async () => {
    const moduleUrl = new URL(
      '../../../domains/integration/renaest-mirror/src/handwritten/renaest-mirror.projection.ts',
      import.meta.url,
    );
    const mod = (await import(moduleUrl.href)) as {
      RenaestMirrorProjection: new (ports: { query: typeof client.query }) => {
        apply(event: BoatEvent): Promise<void>;
      };
    };
    const event = canonical('SINISTRO_SITUACAO_NACIONAL');
    event.data.nationalStatus = 'INVALIDO';
    const projection = new mod.RenaestMirrorProjection({
      query: client.query.bind(client),
    });
    await expect(projection.apply(event)).rejects.toThrow(/constraint|status/i);
    const result = await client.query<{ ledger: string; effect: string }>(
      `select (select count(*) from integration.renaest_mirror_applied_event where tenant_id = $1 and event_id = $2)::text as ledger,
              (select count(*) from integration.renaest_mirror where tenant_id = $1 and last_event_id = $2)::text as effect`,
      [TENANT, event.id],
    );
    expect(result.rows[0]).toEqual({ ledger: '0', effect: '0' });
  });
});
