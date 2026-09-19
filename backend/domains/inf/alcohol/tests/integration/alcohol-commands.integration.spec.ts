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
  seedTriagemProcedure,
  verifyRepositories,
} from './harness.js';

/**
 * CTG-0004 §5 e §11 (R-0008, TASK-0008) — C-0004-32, C-0004-33 e
 * C-0004-34: transação única + outbox dos comandos de alcoolemia (M16) e
 * rollback atômico. Tenant isolado (rait-test-strategy.md §6): os
 * procedimentos criados nascem só para este arquivo.
 */

const TEST_EXPORTS = ['RecordTestCommand'];
const REFUSAL_EXPORTS = ['RecordRefusalCommand'];
const COMMAND_METHODS = ['execute', 'handle', 'run'];

const client: pg.Client = newClient();
let tenantId: string;
let actorId: string;
let startedAt: string;

function outboxAppend(targetTenantId: string) {
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
        targetTenantId,
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

beforeAll(async () => {
  await client.connect();
  const isolated = await isolatedTenant(client, 'inf-alcohol-commands');
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

describe('CTG-0004 §5.2 — record-test: transação única e outbox (C-0004-32)', () => {
  it('C-0004-32 — dado record-test então sai ALCOOLEMIA_TESTE_REGISTRADO com resultMgL, maxErrorMgL e consideredMgL', async () => {
    const seeded = await seedTriagemProcedure(
      client,
      tenantId,
      FIXTURES.agencyId,
      FIXTURES.actorId,
      FIXTURES.shiftId,
    );
    const dependencies = commandDeps(client, tenantId, actorId, {
      outbox: { append: outboxAppend(tenantId) },
    });
    await runCommand(
      () => importModule('../../src/handwritten/record-test.command.js'),
      'inf/alcohol/src/handwritten/record-test.command.ts',
      TEST_EXPORTS,
      COMMAND_METHODS,
      dependencies,
      seeded.procedureId,
      {
        breathalyzer_id: seeded.breathalyzerId,
        result_mg_l: 0.3,
        tested_at: '2026-09-14T10:00:00-04:00',
      },
    );
    const envelopes = await outboxEnvelopes(client, tenantId, startedAt);
    const registered = envelopes.find(
      (envelope) => envelope.domainEvent === 'ALCOOLEMIA_TESTE_REGISTRADO',
    );
    expect(registered).toBeTruthy();
    const data = registered?.data as Record<string, unknown>;
    expect(data.resultMgL).toBeCloseTo(0.3, 5);
    expect(typeof data.maxErrorMgL).toBe('number');
    expect(typeof data.consideredMgL).toBe('number');
  });
});

describe('§16.4 (adenda pós delivery-review ciclo 1) — record-test: tabela ativa exige catálogo ativo', () => {
  // Achado do maestro (gates completos, banco reaplicado do zero): o
  // negativo precisa de um tenant só seu. No tenant compartilhado do
  // arquivo, `seedTriagemProcedure` dos outros casos (C-0004-32/33/34 e o
  // positivo abaixo, todos com catalogStatus='active' default) já grava
  // outra tabela normative_metrological_table status='active' de um
  // catálogo status='active' — e o comando aceita **qualquer** tabela
  // ativa de catálogo vigente do órgão (§5.2/§16.4), não só a da fixture
  // deste caso. Isolando o tenant, nenhuma outra tabela existe para
  // encontrar, e o 422 fica determinístico.
  it('dada tabela metrológica active de um normative_catalog status=retired então 422 TEAT.ALCOHOL_METROLOGICAL_TABLE_MISSING', async () => {
    const isolated = await isolatedTenant(
      client,
      'inf-alcohol-metrological-negative',
    );
    try {
      const seeded = await seedTriagemProcedure(
        client,
        isolated.tenantId,
        FIXTURES.agencyId,
        isolated.actorId,
        FIXTURES.shiftId,
        'retired',
      );
      const dependencies = commandDeps(
        client,
        isolated.tenantId,
        isolated.actorId,
      );
      await expect(
        runCommand(
          () => importModule('../../src/handwritten/record-test.command.js'),
          'inf/alcohol/src/handwritten/record-test.command.ts',
          TEST_EXPORTS,
          COMMAND_METHODS,
          dependencies,
          seeded.procedureId,
          {
            breathalyzer_id: seeded.breathalyzerId,
            result_mg_l: 0.3,
            tested_at: '2026-09-14T10:00:00-04:00',
          },
        ),
      ).rejects.toMatchObject({
        code: 'TEAT.ALCOHOL_METROLOGICAL_TABLE_MISSING',
        status: 422,
      });
    } finally {
      await dropTenant(client, isolated.tenantId);
    }
  });

  it('dada tabela metrológica active de um normative_catalog status=active (baseline positivo) então record-test é aceito', async () => {
    const seeded = await seedTriagemProcedure(
      client,
      tenantId,
      FIXTURES.agencyId,
      FIXTURES.actorId,
      FIXTURES.shiftId,
      'active',
    );
    const dependencies = commandDeps(client, tenantId, actorId, {
      outbox: { append: outboxAppend(tenantId) },
    });
    await expect(
      runCommand(
        () => importModule('../../src/handwritten/record-test.command.js'),
        'inf/alcohol/src/handwritten/record-test.command.ts',
        TEST_EXPORTS,
        COMMAND_METHODS,
        dependencies,
        seeded.procedureId,
        {
          breathalyzer_id: seeded.breathalyzerId,
          result_mg_l: 0.3,
          tested_at: '2026-09-14T10:00:00-04:00',
        },
      ),
    ).resolves.toBeTruthy();
  });
});

describe('CTG-0004 §5.3 — record-refusal: transação única e outbox (C-0004-33)', () => {
  it('C-0004-33 — dado record-refusal então sai ALCOOLEMIA_RECUSA_REGISTRADA com kind', async () => {
    const seeded = await seedTriagemProcedure(
      client,
      tenantId,
      FIXTURES.agencyId,
      FIXTURES.actorId,
      FIXTURES.shiftId,
    );
    const dependencies = commandDeps(client, tenantId, actorId, {
      outbox: { append: outboxAppend(tenantId) },
    });
    await runCommand(
      () => importModule('../../src/handwritten/record-refusal.command.js'),
      'inf/alcohol/src/handwritten/record-refusal.command.ts',
      REFUSAL_EXPORTS,
      COMMAND_METHODS,
      dependencies,
      seeded.procedureId,
      {
        kind: 'refusal',
        refusal_description: 'Fixture — condutor se recusou (integração)',
      },
    );
    const envelopes = await outboxEnvelopes(client, tenantId, startedAt);
    const registered = envelopes.find(
      (envelope) => envelope.domainEvent === 'ALCOOLEMIA_RECUSA_REGISTRADA',
    );
    expect(registered).toBeTruthy();
    expect((registered?.data as Record<string, unknown>).kind).toBe('refusal');
  });
});

describe('CTG-0004 §5.2 — record-test: rollback atômico (C-0004-34)', () => {
  it('C-0004-34 — dado um rollback forçado (outbox.append falha) então nem a linha de alcohol_test nem o envelope existem', async () => {
    const seeded = await seedTriagemProcedure(
      client,
      tenantId,
      FIXTURES.agencyId,
      FIXTURES.actorId,
      FIXTURES.shiftId,
    );
    const dependencies = commandDeps(client, tenantId, actorId, {
      outbox: {
        append: async () => {
          throw new Error('forced rollback (C-0004-34)');
        },
      },
    });
    await expect(
      runCommand(
        () => importModule('../../src/handwritten/record-test.command.js'),
        'inf/alcohol/src/handwritten/record-test.command.ts',
        TEST_EXPORTS,
        COMMAND_METHODS,
        dependencies,
        seeded.procedureId,
        {
          breathalyzer_id: seeded.breathalyzerId,
          result_mg_l: 0.3,
          tested_at: '2026-09-14T10:00:00-04:00',
        },
      ),
    ).rejects.toThrow();
    const tests = await verifyRepositories(
      client,
      tenantId,
      actorId,
    ).tests.findByProcedure(seeded.procedureId);
    expect(tests).toEqual([]);
    // OD-T63: restrito ao agregado do próprio caso — outros testes deste
    // arquivo (C-0004-32/33) publicam ALCOOLEMIA_TESTE_REGISTRADO/
    // ALCOOLEMIA_RECUSA_REGISTRADA no mesmo tenant desde `startedAt`; sem o
    // filtro por `aggregate.id`, um envelope de outro caso poderia mascarar
    // o rollback deste.
    const envelopes = (
      await outboxEnvelopes(client, tenantId, startedAt)
    ).filter(
      (envelope) =>
        (envelope.aggregate as { id?: string } | undefined)?.id ===
        seeded.procedureId,
    );
    expect(
      envelopes.some(
        (envelope) => envelope.domainEvent === 'ALCOOLEMIA_TESTE_REGISTRADO',
      ),
    ).toBe(false);
  });
});
