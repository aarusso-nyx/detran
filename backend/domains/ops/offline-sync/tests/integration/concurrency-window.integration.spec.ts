import { createHash, randomUUID } from 'node:crypto';
import type pg from 'pg';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import {
  FIXTURES,
  commandDeps,
  importModule,
  newClient,
  outboxEnvelopes,
  runCommand,
} from './harness.js';

/**
 * CTG-0002 §4.7 (M6, RN-TEAT-111, AC-TEAT-012-2/4/5) — a janela de
 * concorrência lida do **ParameterService real**, no tenant canônico
 * `…a001`, em vez de um stub: é a prova de AC-TEAT-012-5 ("a janela é
 * configuração declarada e auditável, não constante escondida").
 *
 * `05-parameters.sql` semeia `sync.concurrency_window_minutes` como
 * `proposta`/`source_pending` com `value_json` nulo — com essa linha a
 * detecção fica **desligada** e o lote responde
 * `warnings: ['SYNC_CONCURRENCY_WINDOW_SOURCE_PENDING']`. Para o caso ligado,
 * o teste grava uma **nova versão** da linha (o `ParameterService` escolhe por
 * `effective_from desc, version desc`) e a apaga no fim, devolvendo o
 * parâmetro ao estado semeado.
 *
 * O comando nasce em TASK-0005 (CTG-0002 §11).
 */

const client: pg.Client = newClient();

/** Chave real do `parameter-catalogue.md` §TEAT. */
const WINDOW_KEY = 'sync.concurrency_window_minutes';
const WINDOW_MINUTES = 10;
/** Persona `agency-admin` de `00-fixtures-core.sql`, a que assina parâmetros. */
const PARAMETER_CHANGED_BY = '00000000-0000-4000-8000-0000b0000016';

let createdParameterIds: string[] = [];
let createdItemIds: string[] = [];
let startedAt: string;

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, item]) => item !== undefined)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableJson(item)}`);
    return `{${entries.join(',')}}`;
  }
  return JSON.stringify(value) ?? 'null';
}

function canonicalHash(payload: unknown): string {
  return `sha256:${createHash('sha256').update(stableJson(payload)).digest('hex')}`;
}

function aitPayload(number: string): Record<string, unknown> {
  return {
    ait: {
      traffic_agency_id: FIXTURES.agencyId,
      ait_number: number,
      series: 'F',
      agent_id: FIXTURES.agentId,
      shift_id: FIXTURES.shiftOpen,
      device_id: FIXTURES.deviceAuthorized,
      framing_id: FIXTURES.framingId,
      catalog_id: FIXTURES.catalogId,
      infraction_at: '2026-09-14T13:00:00.000Z',
      issued_at: '2026-09-14T13:05:00.000Z',
      issuance_mode: 'eletronico',
      constatation_type: 'abordagem',
      had_approach: true,
      location_description: 'Av. Djalma Batista, 1000 — Manaus/AM',
      uf: 'AM',
      content_hash: `sha256:canonical-${number}`,
    },
    vehicles: [],
    people: [],
    signatures: [],
    print_events: [],
  };
}

function submitBatch(
  dependencies: unknown,
  input: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  return runCommand(
    () => importModule('../../src/handwritten/submit-batch.command.js'),
    'ops/offline-sync/src/handwritten/submit-batch.command.ts',
    ['SubmitSyncBatchCommand', 'SubmitBatchCommand', 'SyncBatchSubmitCommand'],
    ['execute', 'submit', 'submitBatch', 'handle'],
    dependencies,
    input,
  );
}

/**
 * O `ParameterService` real é o de `@detran/ops-parameter`; aqui basta a mesma
 * leitura que ele faz (`key` + `surface`, versão vigente mais recente), porque
 * o que está sob teste é o **efeito** da janela, não o serviço.
 */
function liveParameters() {
  return {
    async get(key: string) {
      await client.query(`select set_config('app.role', 'owner', false)`);
      const result = await client.query<{
        value_json: unknown;
        source_pending: boolean;
      }>(
        `select value_json, source_pending from ops.parameter
          where tenant_id = $1 and key = $2
            and effective_from <= current_date
            and (effective_to is null or effective_to >= current_date)
          order by effective_from desc, version desc limit 1`,
        [FIXTURES.tenantId, key],
      );
      if (!result.rows[0]) throw new Error(`Parameter ${key} not found`);
      return result.rows[0];
    },
  };
}

async function writeWindow(minutes: number): Promise<void> {
  await client.query(`select set_config('app.role', 'owner', false)`);
  await client.query(`select set_config('app.tenant_id', $1, false)`, [
    FIXTURES.tenantId,
  ]);
  // ux_parameter_… é único por (tenant, agência, surface, key, effective_from):
  // limpa um resto de execução anterior do mesmo dia antes de inserir.
  await client.query(
    `delete from ops.parameter
      where tenant_id = $1 and key = $2 and effective_from = current_date`,
    [FIXTURES.tenantId, WINDOW_KEY],
  );
  const inserted = await client.query<{ id: string }>(
    `insert into ops.parameter
       (tenant_id, traffic_agency_id, scope, surface, key, value_json,
        value_type, status, source_pending, legal_readonly, decision_ref,
        reason, version, effective_from, changed_by)
     values ($1, null, 'tenant', 'teat', $2, $3::jsonb, 'int', 'vigente',
             false, false, 'OD-T03', 'TASK-0004 concurrency window test', 2,
             current_date, $4)
     returning id`,
    [FIXTURES.tenantId, WINDOW_KEY, String(minutes), PARAMETER_CHANGED_BY],
  );
  createdParameterIds.push(inserted.rows[0]!.id);
}

/** Item `ait` do mesmo agente em `deviceId`, já na fila como `received`. */
async function seedQueueItem(
  deviceId: string,
  createdLocallyAt: string,
): Promise<string> {
  const id = randomUUID();
  await client.query(`select set_config('app.role', 'owner', false)`);
  await client.query(`select set_config('app.tenant_id', $1, false)`, [
    FIXTURES.tenantId,
  ]);
  await client.query(
    `insert into ops.sync_queue_item
       (id, tenant_id, traffic_agency_id, device_id, agent_id, entity_type,
        local_entity_id, status, created_locally_at, idempotency_key,
        payload_hash, payload_json)
     values ($1, $2, $3, $4, $5, 'ait', $6, 'received', $7, $8, $9, $10)`,
    [
      id,
      FIXTURES.tenantId,
      FIXTURES.agencyId,
      deviceId,
      FIXTURES.agentId,
      randomUUID(),
      createdLocallyAt,
      `window-${id.slice(0, 8)}`,
      canonicalHash(aitPayload('2026000700')),
      JSON.stringify(aitPayload('2026000700')),
    ],
  );
  createdItemIds.push(id);
  return id;
}

function batchInput(
  createdLocallyAt: string,
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  const payload = aitPayload('2026000701');
  return {
    traffic_agency_id: FIXTURES.agencyId,
    device_id: FIXTURES.deviceAuthorized,
    agent_id: FIXTURES.agentId,
    device_batch_id: `window-${randomUUID().slice(0, 8)}`,
    items: [
      {
        entity_type: 'ait',
        local_entity_id: randomUUID(),
        idempotency_key: `window-item-${randomUUID().slice(0, 8)}`,
        created_locally_at: createdLocallyAt,
        payload_json: payload,
        payload_hash: canonicalHash(payload),
      },
    ],
    ...overrides,
  };
}

beforeAll(async () => {
  await client.connect();
  await client.query(`select set_config('app.role', 'owner', false)`);
  const now = await client.query<{ now: string }>('select now()::text as now');
  startedAt = now.rows[0]!.now;
});

afterEach(async () => {
  await client.query(`select set_config('app.role', 'owner', false)`);
  // Restaura o parâmetro: apaga só as versões inseridas por este arquivo, de
  // modo que a linha `proposta`/`source_pending` de `05-parameters.sql` volte a
  // ser a vigente.
  for (const id of createdParameterIds) {
    await client.query('delete from ops.parameter where id = $1', [id]);
  }
  createdParameterIds = [];
});

afterAll(async () => {
  await client.query(`select set_config('app.role', 'owner', false)`);
  await client.query(
    `delete from ops.sync_conflict where tenant_id = $1 and created_at > $2`,
    [FIXTURES.tenantId, startedAt],
  );
  await client.query(
    `delete from ops.sync_receipt where tenant_id = $1 and created_at > $2`,
    [FIXTURES.tenantId, startedAt],
  );
  await client.query(
    `delete from ops.sync_queue_item where tenant_id = $1 and created_at > $2`,
    [FIXTURES.tenantId, startedAt],
  );
  await client.query(
    `delete from ops.sync_batch where tenant_id = $1 and created_at > $2`,
    [FIXTURES.tenantId, startedAt],
  );
  await client.query(
    `delete from ops.numbering_consumption where tenant_id = $1 and created_at > $2`,
    [FIXTURES.tenantId, startedAt],
  );
  await client.query(
    `delete from inf.ait_status_history where tenant_id = $1 and created_at > $2`,
    [FIXTURES.tenantId, startedAt],
  );
  await client.query(
    `delete from inf.ait_ait where tenant_id = $1 and created_at > $2`,
    [FIXTURES.tenantId, startedAt],
  );
  await client.query(
    `delete from integration.outbox where tenant_id = $1 and created_at > $2`,
    [FIXTURES.tenantId, startedAt],
  );
  for (const id of createdParameterIds) {
    await client.query('delete from ops.parameter where id = $1', [id]);
  }
  createdItemIds = [];
  await client.end();
});

describe('CTG-0002 §4.7 — janela de concorrência lida do parâmetro real (M6/AC-TEAT-012-5)', () => {
  it('dado sync.concurrency_window_minutes como 05-parameters.sql o semeia (source_pending, valor nulo) quando o lote chega então warnings traz SYNC_CONCURRENCY_WINDOW_SOURCE_PENDING e nenhum conflito é aberto', async () => {
    const deps = commandDeps(client, FIXTURES.tenantId, FIXTURES.agentId, {
      parameters: liveParameters(),
    });
    const response = await submitBatch(
      deps,
      batchInput('2026-09-14T13:05:00.000Z'),
    );
    expect(response.warnings).toEqual([
      'SYNC_CONCURRENCY_WINDOW_SOURCE_PENDING',
    ]);
    const conflicts = await client.query<{ count: string }>(
      `select count(*)::text as count from ops.sync_conflict
        where tenant_id = $1 and created_at > $2`,
      [FIXTURES.tenantId, startedAt],
    );
    expect(Number(conflicts.rows[0]!.count)).toBe(0);
  });

  it('dada uma versão nova do parâmetro com 10 minutos e dois itens ait do mesmo agente em devices distintos a 5 minutos, sem handoff, então ambos ficam conflict TEAT.SYNC_CONCURRENCY_SUSPECT, abre sync_conflict(concurrency) e sai AIT_SUSPEITO_CONCORRENCIA', async () => {
    await writeWindow(WINDOW_MINUTES);
    const other = await seedQueueItem(
      FIXTURES.deviceBlocked,
      '2026-09-14T13:00:00.000Z',
    );
    const deps = commandDeps(client, FIXTURES.tenantId, FIXTURES.agentId, {
      parameters: liveParameters(),
    });
    const response = await submitBatch(
      deps,
      batchInput('2026-09-14T13:05:00.000Z'),
    );
    expect(response.warnings).toEqual([]);
    const receipt = (
      response.receipts as { status: string; error_code: string }[]
    )[0];
    expect(receipt?.status).toBe('conflict');
    expect(receipt?.error_code).toBe('TEAT.SYNC_CONCURRENCY_SUSPECT');
    const marked = await client.query<{ status: string }>(
      'select status from ops.sync_queue_item where id = $1',
      [other],
    );
    expect(marked.rows[0]?.status).toBe('conflict');
    const conflicts = await client.query<{
      conflict_type: string;
      allowed_resolution_actions: string[];
      status: string;
    }>(
      `select conflict_type, allowed_resolution_actions, status
         from ops.sync_conflict where tenant_id = $1 and created_at > $2`,
      [FIXTURES.tenantId, startedAt],
    );
    expect(conflicts.rows).toHaveLength(2);
    for (const conflict of conflicts.rows) {
      expect(conflict.conflict_type).toBe('concurrency');
      expect(conflict.allowed_resolution_actions).toEqual(['manual_review']);
      expect(conflict.status).toBe('open');
    }
    expect(await outboxEnvelopes(client, FIXTURES.tenantId)).toContainEqual(
      expect.objectContaining({ domainEvent: 'AIT_SUSPEITO_CONCORRENCIA' }),
    );
  });

  it('dados os mesmos dois itens com ops_session_handoff …e3100001 cobrindo o intervalo então nenhum é marcado (AC-TEAT-012-4)', async () => {
    await writeWindow(WINDOW_MINUTES);
    // O handoff das fixtures é 2026-09-14T12:00:00-04:00 (= 16:00Z); os itens
    // ficam dentro de [handed_off_at − janela, handed_off_at + janela].
    const other = await seedQueueItem(
      FIXTURES.deviceBlocked,
      '2026-09-14T15:55:00.000Z',
    );
    const deps = commandDeps(client, FIXTURES.tenantId, FIXTURES.agentId, {
      parameters: liveParameters(),
    });
    const response = await submitBatch(
      deps,
      batchInput('2026-09-14T16:00:00.000Z'),
    );
    expect(response.warnings).toEqual([]);
    const receipt = (response.receipts as { status: string }[])[0];
    expect(receipt?.status).not.toBe('conflict');
    const marked = await client.query<{ status: string }>(
      'select status from ops.sync_queue_item where id = $1',
      [other],
    );
    expect(marked.rows[0]?.status).toBe('received');
  });
});
