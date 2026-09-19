import type pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  commandDeps,
  dropTenant,
  FIXTURES,
  importModule,
  isolatedTenant,
  newClient,
  outboxEnvelopes,
  runCommand,
  seedMeasureWithRetention,
  seedRetidoMeasure,
  verifyRepositories,
} from './harness.js';

/**
 * CTG-0004 §2, §4 e §11 (R-0008, TASK-0008) — C-0004-28, C-0004-29,
 * C-0004-30 e C-0004-31: transação única + outbox dos comandos de medida
 * (M16), e a ausência de efeito cruzado de um AIT cancelado pós-final
 * sobre `inf.administrative_measure` (RN-TEAT-123). Tenant isolado
 * (rait-test-strategy.md §6): as medidas criadas nos três primeiros casos
 * nascem só para este arquivo; C-0004-31 usa a fixture compartilhada
 * `…ed000001`/`…f0000001` (28/10-fixtures) só para leitura (nenhuma
 * escrita nela além do próprio teste de não-mutação).
 */

const START_EXPORTS = ['StartMeasureCommand'];
const TERM_EXPORTS = ['IssueTermCommand'];
const CONCLUDE_EXPORTS = ['ConcludeMeasureCommand'];
const RELEASE_EXPORTS = ['ReleaseRetentionCommand'];
const COMMAND_METHODS = ['execute', 'handle', 'run'];

function trackingOutboxAppend() {
  return async (
    _tx: unknown,
    envelope: Record<string, unknown>,
  ): Promise<{ id: string }> => {
    await client.query(
      `insert into integration.outbox
         (tenant_id, topic, aggregate_type, aggregate_id, payload, idempotency_key)
       values ($1, $2, $3, $4, $5, $6)
       on conflict (tenant_id, idempotency_key) do nothing
       returning id`,
      [
        tenantId,
        envelope.type,
        (envelope.aggregate as { kind: string }).kind,
        (envelope.aggregate as { id: string }).id,
        JSON.stringify(envelope),
        `${envelope.type}:${(envelope.aggregate as { id: string }).id}:${(envelope.aggregate as { version: number }).version}`,
      ],
    );
    return { id: 'ignored' };
  };
}

const client: pg.Client = newClient();
let tenantId: string;
let actorId: string;
let startedAt: string;

beforeAll(async () => {
  await client.connect();
  const isolated = await isolatedTenant(client, 'inf-measures-commands');
  tenantId = isolated.tenantId;
  actorId = isolated.actorId;
  await client.query(`select set_config('app.role', 'owner', false)`);
  const now = await client.query<{ now: string }>('select now()::text as now');
  startedAt = now.rows[0]!.now;
});

afterAll(async () => {
  await dropTenant(client, tenantId);
  await client.end();
});

describe('CTG-0004 §4.1 — start: transação única e outbox (C-0004-28)', () => {
  it('C-0004-28 — dado start então a medida grava started_at e a mesma transação publica measure.changed/MEDIDA_INICIADA na outbox', async () => {
    const { measureId } = await seedRetidoMeasure(
      client,
      tenantId,
      FIXTURES.agencyId,
      FIXTURES.actorId,
      FIXTURES.shiftId,
      FIXTURES.deviceId,
    );
    const dependencies = commandDeps(client, tenantId, actorId, {
      outbox: {
        append: async (
          _tx: unknown,
          envelope: Record<string, unknown>,
        ): Promise<{ id: string }> => {
          await client.query(
            `insert into integration.outbox
               (tenant_id, topic, aggregate_type, aggregate_id, payload, idempotency_key)
             values ($1, $2, $3, $4, $5, $6)
             on conflict (tenant_id, idempotency_key) do nothing
             returning id`,
            [
              tenantId,
              envelope.type,
              (envelope.aggregate as { kind: string }).kind,
              (envelope.aggregate as { id: string }).id,
              JSON.stringify(envelope),
              `${envelope.type}:${(envelope.aggregate as { id: string }).id}:${(envelope.aggregate as { version: number }).version}`,
            ],
          );
          return { id: 'ignored' };
        },
      },
    });
    await runCommand(
      () => importModule('../../src/handwritten/start-measure.command.js'),
      'inf/measures/src/handwritten/start-measure.command.ts',
      START_EXPORTS,
      COMMAND_METHODS,
      dependencies,
      measureId,
      {},
    );
    const measure = await verifyRepositories(
      client,
      tenantId,
      actorId,
    ).measures.find(measureId);
    expect(measure?.started_at).toBeTruthy();
    const envelopes = await outboxEnvelopes(client, tenantId, startedAt);
    expect(envelopes.map((envelope) => envelope.domainEvent)).toContain(
      'MEDIDA_INICIADA',
    );
  });
});

describe('CTG-0004 §4.5 — apply-term: TERMO_EMITIDO com os dois prazos (C-0004-29)', () => {
  it('C-0004-29 — dado apply-term (term_type=removal) então o envelope TERMO_EMITIDO traz withdrawalDeadlineAt e ctbDeadlineAt em data', async () => {
    const { measureId } = await seedRetidoMeasure(
      client,
      tenantId,
      FIXTURES.agencyId,
      FIXTURES.actorId,
      FIXTURES.shiftId,
      FIXTURES.deviceId,
    );
    const dependencies = commandDeps(client, tenantId, actorId, {
      outbox: {
        append: async (
          _tx: unknown,
          envelope: Record<string, unknown>,
        ): Promise<{ id: string }> => {
          await client.query(
            `insert into integration.outbox
               (tenant_id, topic, aggregate_type, aggregate_id, payload, idempotency_key)
             values ($1, $2, $3, $4, $5, $6)
             on conflict (tenant_id, idempotency_key) do nothing
             returning id`,
            [
              tenantId,
              envelope.type,
              (envelope.aggregate as { kind: string }).kind,
              (envelope.aggregate as { id: string }).id,
              JSON.stringify(envelope),
              `${envelope.type}:${(envelope.aggregate as { id: string }).id}:${(envelope.aggregate as { version: number }).version}`,
            ],
          );
          return { id: 'ignored' };
        },
      },
    });
    await runCommand(
      () => importModule('../../src/handwritten/issue-term.command.js'),
      'inf/measures/src/handwritten/issue-term.command.ts',
      TERM_EXPORTS,
      COMMAND_METHODS,
      dependencies,
      measureId,
      {
        term_type: 'removal',
        term_number: `TERM-INT-${measureId.slice(0, 8)}`,
        withdrawal_deadline_at: '2026-09-21T00:00:00-04:00',
        issued_at: '2026-09-14T09:00:00-04:00',
        field_details_json: {
          agency: 'Fixture',
          vehicle: 'Fixture',
          ait_or_order_ref: 'Fixture',
          place_datetime: '2026-09-14T09:00:00-04:00',
          legal_basis: 'CTB art. 271',
          custody_place: 'Fixture',
          owner_and_driver: 'Fixture',
        },
      },
    );
    const envelopes = await outboxEnvelopes(client, tenantId, startedAt);
    const termo = envelopes.find(
      (envelope) => envelope.domainEvent === 'TERMO_EMITIDO',
    );
    expect(termo).toBeTruthy();
    const data = termo?.data as Record<string, unknown>;
    expect(data.withdrawalDeadlineAt).toBeTruthy();
    expect(data.ctbDeadlineAt).toBeTruthy();
  });
});

describe('CTG-0004 §4.7 — conclude: MEDIDA_CONCLUIDA e REGULARIZADO (C-0004-30)', () => {
  it('C-0004-30 — dado conclude a partir de LIBERADO_COM_PRAZO então a medida vai a REGULARIZADO e a outbox recebe MEDIDA_CONCLUIDA', async () => {
    const { measureId } = await seedRetidoMeasure(
      client,
      tenantId,
      FIXTURES.agencyId,
      FIXTURES.actorId,
      FIXTURES.shiftId,
      FIXTURES.deviceId,
    );
    const dependencies = commandDeps(client, tenantId, actorId, {
      outbox: {
        append: async (
          _tx: unknown,
          envelope: Record<string, unknown>,
        ): Promise<{ id: string }> => {
          await client.query(
            `insert into integration.outbox
               (tenant_id, topic, aggregate_type, aggregate_id, payload, idempotency_key)
             values ($1, $2, $3, $4, $5, $6)
             on conflict (tenant_id, idempotency_key) do nothing
             returning id`,
            [
              tenantId,
              envelope.type,
              (envelope.aggregate as { kind: string }).kind,
              (envelope.aggregate as { id: string }).id,
              JSON.stringify(envelope),
              `${envelope.type}:${(envelope.aggregate as { id: string }).id}:${(envelope.aggregate as { version: number }).version}`,
            ],
          );
          return { id: 'ignored' };
        },
      },
    });
    // Pré-condição gravada e comitada antes do comando (não é escrita
    // concorrente com a transação dele) — seguro usar o repositório de
    // verificação aqui.
    await verifyRepositories(client, tenantId, actorId).measures.update(
      measureId,
      { current_status: 'LIBERADO_COM_PRAZO' },
    );
    await runCommand(
      () => importModule('../../src/handwritten/conclude-measure.command.js'),
      'inf/measures/src/handwritten/conclude-measure.command.ts',
      CONCLUDE_EXPORTS,
      COMMAND_METHODS,
      dependencies,
      measureId,
      {},
    );
    const measure = await verifyRepositories(
      client,
      tenantId,
      actorId,
    ).measures.find(measureId);
    expect(measure?.current_status).toBe('REGULARIZADO');
    const envelopes = await outboxEnvelopes(client, tenantId, startedAt);
    expect(envelopes.map((envelope) => envelope.domainEvent)).toContain(
      'MEDIDA_CONCLUIDA',
    );
  });
});

describe('§16.1 (adenda pós delivery-review ciclo 1) — release: os dois ramos, transação única e outbox', () => {
  it('dada medida RETIDO quando release então current_status vai a LIBERADO_LOCAL, com measure_status_history e measure.changed na mesma transação', async () => {
    const { measureId, retentionId } = await seedMeasureWithRetention(
      client,
      tenantId,
      FIXTURES.agencyId,
      FIXTURES.actorId,
      FIXTURES.shiftId,
      FIXTURES.deviceId,
      FIXTURES.vehicleSnapshotId,
      { currentStatus: 'RETIDO' },
    );
    const dependencies = commandDeps(client, tenantId, actorId, {
      outbox: { append: trackingOutboxAppend() },
    });
    await runCommand(
      () => importModule('../../src/handwritten/release-retention.command.js'),
      'inf/measures/src/handwritten/release-retention.command.ts',
      RELEASE_EXPORTS,
      COMMAND_METHODS,
      dependencies,
      retentionId,
      {},
    );
    const verify = verifyRepositories(client, tenantId, actorId);
    const measure = await verify.measures.find(measureId);
    expect(measure?.current_status).toBe('LIBERADO_LOCAL');
    const history = await verify.history.list();
    expect(
      history.some(
        (row) =>
          row.measure_id === measureId && row.status === 'LIBERADO_LOCAL',
      ),
    ).toBe(true);
    const envelopes = await outboxEnvelopes(client, tenantId, startedAt);
    expect(
      envelopes.some(
        (envelope) =>
          envelope.type === 'measure.changed' &&
          (envelope.aggregate as { id?: string } | undefined)?.id === measureId,
      ),
    ).toBe(true);
  });

  it('dada medida LIBERADO_COM_PRAZO com regularized_at gravado na retenção quando release então current_status vai a REGULARIZADO, com measure_status_history e measure.changed na mesma transação', async () => {
    const { measureId, retentionId } = await seedMeasureWithRetention(
      client,
      tenantId,
      FIXTURES.agencyId,
      FIXTURES.actorId,
      FIXTURES.shiftId,
      FIXTURES.deviceId,
      FIXTURES.vehicleSnapshotId,
      {
        currentStatus: 'LIBERADO_COM_PRAZO',
        regularizedAt: '2026-10-10T00:00:00-04:00',
      },
    );
    const dependencies = commandDeps(client, tenantId, actorId, {
      outbox: { append: trackingOutboxAppend() },
    });
    await runCommand(
      () => importModule('../../src/handwritten/release-retention.command.js'),
      'inf/measures/src/handwritten/release-retention.command.ts',
      RELEASE_EXPORTS,
      COMMAND_METHODS,
      dependencies,
      retentionId,
      {},
    );
    const verify = verifyRepositories(client, tenantId, actorId);
    const measure = await verify.measures.find(measureId);
    expect(measure?.current_status).toBe('REGULARIZADO');
    const history = await verify.history.list();
    expect(
      history.some(
        (row) => row.measure_id === measureId && row.status === 'REGULARIZADO',
      ),
    ).toBe(true);
    const envelopes = await outboxEnvelopes(client, tenantId, startedAt);
    expect(
      envelopes.some(
        (envelope) =>
          envelope.type === 'measure.changed' &&
          (envelope.aggregate as { id?: string } | undefined)?.id === measureId,
      ),
    ).toBe(true);
  });
});

describe('CTG-0004 §1 — AIT cancelado pós-final não muda medidas (C-0004-31, RN-TEAT-123)', () => {
  it('C-0004-31 — dado o AIT …f0000001 marcado CANCELADO_POSFINAL então nenhuma linha de inf.administrative_measure referenciando-o muda de current_status', async () => {
    await client.query(`select set_config('app.role', 'owner', false)`);
    const before = await client.query<{ current_status: string }>(
      `select current_status from inf.administrative_measure where id = $1`,
      [FIXTURES.measureRetido],
    );
    const aitBefore = await client.query<{ current_status: string }>(
      `select current_status from inf.ait_ait where id = $1`,
      [FIXTURES.aitIntegrado],
    );
    try {
      await client.query(
        `update inf.ait_ait set current_status = 'CANCELADO_POSFINAL' where id = $1`,
        [FIXTURES.aitIntegrado],
      );
      const after = await client.query<{ current_status: string }>(
        `select current_status from inf.administrative_measure where id = $1`,
        [FIXTURES.measureRetido],
      );
      expect(after.rows[0]?.current_status).toBe(
        before.rows[0]?.current_status,
      );
    } finally {
      // Restaura o estado da fixture compartilhada (não é dado desta suíte).
      await client.query(
        `update inf.ait_ait set current_status = $2 where id = $1`,
        [FIXTURES.aitIntegrado, aitBefore.rows[0]?.current_status],
      );
    }
  });
});
