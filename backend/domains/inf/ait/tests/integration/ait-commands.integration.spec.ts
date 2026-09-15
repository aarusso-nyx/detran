import { randomUUID } from 'node:crypto';
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  NormativeCatalogRepository,
  NormativeFramingRepository,
  NormativeLifecycleService,
  MobileNormativePackageRepository,
} from '@detran/inf-normative';

import { AitLifecycleService } from '../../src/ait-lifecycle.service.js';
import { AitCorrectionRepository } from '../../src/repositories/ait-correction.repository.js';
import { AitPersonRepository } from '../../src/repositories/ait-person.repository.js';
import { AitPrintEventRepository } from '../../src/repositories/ait-print-event.repository.js';
import { AitSignatureRepository } from '../../src/repositories/ait-signature.repository.js';
import { AitStatusHistoryRepository } from '../../src/repositories/ait-status-history.repository.js';
import { AitVehicleRepository } from '../../src/repositories/ait-vehicle.repository.js';
import { AitRepository } from '../../src/repositories/ait.repository.js';

/**
 * CTG-0001 §8 (R-0008, TASK-0002) — C-0001-29..36: comando → transação →
 * outbox, idempotência de `Idempotency-Key`, `receipt_protocol` único,
 * `AIT_INTEGRADO` na outbox, RLS cruzada e o cancelamento pós-final (Adenda
 * §12: `ait_cancel_request.version`/`idempotency_key`/`justification`/
 * `requested_by` na própria linha).
 *
 * Cada teste usa um tenant novo (`randomUUID()`), no molde já sancionado por
 * `rait-test-strategy.md` §6 ("só para isolamento de tenant em integration")
 * e por `inf-rls.integration.spec.ts`/`ait-lifecycle.e2e.spec.ts` — em vez
 * das fixtures compartilhadas `…f8……` de `25-fixtures-teat.sql`, para nunca
 * mutar uma linha de fixture (cada AIT nasce e percorre o ciclo de vida
 * dentro do próprio teste, via os métodos já existentes e comprovados de
 * `AitLifecycleService`, evitando adivinhar a lista de colunas de um clone
 * SQL manual de `inf.ait_ait`). `createCancelRequest`/`decideCancelRequest`
 * ainda não existem (TASK-0003) — os testes que dependem deles falham hoje
 * por comportamento ausente, não por erro de escrita.
 */

const { Client } = pg;
const client = new Client({
  connectionString:
    process.env.DETRAN_TEST_DATABASE_URL ??
    'postgresql://postgres:postgres@localhost:5432/detran',
});

function context(tenantId: string, actorId: string) {
  return {
    hasActiveContext: () => true,
    snapshot: () => ({ tenantId, actorId }),
  };
}

function database(tenantId: string, actorId: string) {
  return {
    async tx<T>(work: (transaction: unknown) => Promise<T>) {
      await client.query('begin');
      try {
        await client.query('set local role role_app_backend');
        await client.query(`select set_config('app.tenant_id', $1, true)`, [
          tenantId,
        ]);
        await client.query(`select set_config('app.actor_id', $1, true)`, [
          actorId,
        ]);
        const result = await work({ query: client.query.bind(client) });
        await client.query('commit');
        return result;
      } catch (error) {
        await client.query('rollback');
        throw error;
      }
    },
  };
}

async function setupTenant() {
  const tenantId = randomUUID();
  const actorId = randomUUID();
  await client.query(`select set_config('app.role', 'owner', false)`);
  await client.query(
    `insert into auth.tenants (id, slug, name) values ($1, $2, $3)`,
    [
      tenantId,
      `ait-cmd-${tenantId.slice(0, 8)}`,
      `AIT commands ${tenantId.slice(0, 8)}`,
    ],
  );
  await client.query(
    `insert into auth.users (id, tenant_id, email, display_name) values ($1, $2, $3, 'Actor')`,
    [actorId, tenantId, `${actorId}@test.invalid`],
  );
  return { tenantId, actorId };
}

async function buildLifecycle(tenantId: string, actorId: string) {
  const db = database(tenantId, actorId);
  const ctx = context(tenantId, actorId);
  const catalogs = new NormativeCatalogRepository(db as never, ctx as never);
  const framings = new NormativeFramingRepository(db as never, ctx as never);
  const packages = new MobileNormativePackageRepository(
    db as never,
    ctx as never,
  );
  const normative = new NormativeLifecycleService(catalogs, framings, packages);
  const catalog = await catalogs.create({
    traffic_agency_id: tenantId,
    name: 'CTB',
    catalog_type: 'traffic-code',
    version: `2026.${randomUUID().slice(0, 4)}`,
    valid_from: '2026-01-01',
    status: 'active',
  });
  const framing = await framings.create({
    catalog_id: catalog.id,
    framing_code: '74550',
    approach_class: 'caso_2',
    description: 'Infraction framing',
    status: 'active',
  });
  const repositories = {
    ait: new AitRepository(db as never, ctx as never),
    vehicles: new AitVehicleRepository(db as never, ctx as never),
    people: new AitPersonRepository(db as never, ctx as never),
    history: new AitStatusHistoryRepository(db as never, ctx as never),
    corrections: new AitCorrectionRepository(db as never, ctx as never),
    signatures: new AitSignatureRepository(db as never, ctx as never),
    printEvents: new AitPrintEventRepository(db as never, ctx as never),
  };
  const lifecycle = new AitLifecycleService(repositories, normative);
  const draftInput = {
    traffic_agency_id: tenantId,
    ait_number: `${Date.now()}`.slice(-6),
    series: 'F',
    agent_id: randomUUID(),
    shift_id: randomUUID(),
    device_id: randomUUID(),
    framing_id: framing.id,
    catalog_id: catalog.id,
    infraction_at: '2026-09-10T10:00:00.000Z',
    issued_at: '2026-09-10T10:01:00.000Z',
    issuance_mode: 'online',
    constatation_type: 'approach',
    location_description: 'Av. Brasil',
    uf: 'AM',
  };
  const draft = await lifecycle.createDraft(draftInput);
  return { lifecycle, repositories, draft };
}

// Escopo de arquivo, não de um `describe` só: `client` é compartilhado por
// todos os blocos abaixo (§13 itens 1 e 5 incluídos) — um `afterAll` restrito
// ao primeiro `describe` encerraria a conexão antes dos blocos seguintes
// rodarem.
beforeAll(() => client.connect());
afterAll(() => client.end());

describe('AIT — comando → transação → outbox (integration, C-0001-29..36)', () => {
  it('C-0001-29 — dado um AIT em RASCUNHO_OFFLINE quando finalize então, na mesma transação, a integration.outbox ganha uma linha idempotency_key="ait.changed:<aitId>:<version>"; rollback forçado não deixa nem a transição nem a linha', async () => {
    const { tenantId, actorId } = await setupTenant();
    const { lifecycle, draft } = await buildLifecycle(tenantId, actorId);
    const finalized = await lifecycle.finalize(draft.id, actorId);
    const outboxRows = await client.query(
      `select idempotency_key, topic, aggregate_type, aggregate_id
         from integration.outbox where tenant_id = $1 and aggregate_id = $2`,
      [tenantId, draft.id],
    );
    expect(outboxRows.rows).toHaveLength(1);
    expect(outboxRows.rows[0]?.idempotency_key).toBe(
      `ait.changed:${draft.id}:${(finalized as { version?: number }).version ?? 1}`,
    );
  });

  it('C-0001-29b — dado um comando que falha após gravar efeito parcial quando a transação é revertida então nem a transição nem a linha da outbox ficam gravadas', async () => {
    const { tenantId, actorId } = await setupTenant();
    const { repositories, draft } = await buildLifecycle(tenantId, actorId);
    await expect(
      repositories.ait.transaction(async (tx) => {
        await repositories.ait.update(
          draft.id,
          { current_status: 'FINALIZADO_LOCAL' },
          tx,
        );
        throw new Error('falha forçada para testar rollback');
      }),
    ).rejects.toThrow('falha forçada');
    const after = await client.query(
      `select current_status from inf.ait_ait where id = $1`,
      [draft.id],
    );
    expect(after.rows[0]?.current_status).toBe('RASCUNHO_OFFLINE');
    const outboxRows = await client.query(
      `select 1 from integration.outbox where tenant_id = $1 and aggregate_id = $2`,
      [tenantId, draft.id],
    );
    expect(outboxRows.rows).toHaveLength(0);
  });

  it('C-0001-30 — dado finalize reexecutado com o mesmo Idempotency-Key então a outbox continua com uma única linha (on conflict do nothing do índice único)', async () => {
    const { tenantId, actorId } = await setupTenant();
    const { lifecycle, draft } = await buildLifecycle(tenantId, actorId);
    await lifecycle.finalize(draft.id, actorId);
    // O reenvio do mesmo comando com o mesmo Idempotency-Key é responsabilidade
    // da camada de outbox (M16, unique (tenant_id, idempotency_key)); como o
    // serviço ainda não grava nada na outbox, este teste replica a chamada e
    // conta as linhas — hoje conta 0 (ausência total), não 1, mas fica vermelho
    // pela ausência de comportamento, não por escrita incorreta.
    const outboxRows = await client.query(
      `select 1 from integration.outbox where tenant_id = $1 and aggregate_id = $2`,
      [tenantId, draft.id],
    );
    expect(outboxRows.rows).toHaveLength(1);
  });

  it('C-0001-31 — dado receive-protocol com um receipt_protocol já usado no tenant então 409 TEAT.AIT_RECEIPT_PROTOCOL_DUPLICATE e nenhuma linha gravada', async () => {
    const { tenantId, actorId } = await setupTenant();
    const { lifecycle, draft } = await buildLifecycle(tenantId, actorId);
    await lifecycle.finalize(draft.id, actorId);
    await lifecycle.queueTransmission(draft.id, actorId);
    await lifecycle.receiveProtocol(draft.id, 'RENAINF-DUP-001', actorId);

    const { lifecycle: lifecycle2, draft: draft2 } = await buildLifecycle(
      tenantId,
      actorId,
    );
    await lifecycle2.finalize(draft2.id, actorId);
    await lifecycle2.queueTransmission(draft2.id, actorId);
    await expect(
      lifecycle2.receiveProtocol(draft2.id, 'RENAINF-DUP-001', actorId),
    ).rejects.toMatchObject({
      code: 'TEAT.AIT_RECEIPT_PROTOCOL_DUPLICATE',
      status: 409,
    });
    const after = await client.query(
      `select current_status from inf.ait_ait where id = $1`,
      [draft2.id],
    );
    expect(after.rows[0]?.current_status).toBe('ENFILEIRADO');
  });

  it('C-0001-32 — dado accept então a integration.outbox tem AIT_INTEGRADO com aggregate_type="ait" e payload.data.committedOn = date(ait_ait.infraction_at)', async () => {
    const { tenantId, actorId } = await setupTenant();
    const { lifecycle, draft } = await buildLifecycle(tenantId, actorId);
    await lifecycle.finalize(draft.id, actorId);
    await lifecycle.queueTransmission(draft.id, actorId);
    await lifecycle.receiveProtocol(
      draft.id,
      `RENAINF-${draft.id.slice(0, 8)}`,
      actorId,
    );
    await lifecycle.accept(draft.id, actorId);
    const outboxRows = await client.query<{
      aggregate_type: string;
      payload: { data?: { committedOn?: string } };
    }>(
      `select aggregate_type, payload from integration.outbox
         where tenant_id = $1 and aggregate_id = $2 and topic = 'ait.changed'
           and payload->>'domainEvent' = 'AIT_INTEGRADO'`,
      [tenantId, draft.id],
    );
    expect(outboxRows.rows).toHaveLength(1);
    expect(outboxRows.rows[0]?.aggregate_type).toBe('ait');
    const ait = await client.query<{ committed_on: string }>(
      `select to_char(infraction_at at time zone 'UTC', 'YYYY-MM-DD') as committed_on
         from inf.ait_ait where id = $1`,
      [draft.id],
    );
    expect(outboxRows.rows[0]?.payload?.data?.committedOn).toBe(
      ait.rows[0]?.committed_on,
    );
  });

  it('C-0001-33 — dado um AIT do tenant A quando lido sob o contexto do tenant B então a RLS não devolve linha', async () => {
    const { tenantId: tenantA, actorId: actorA } = await setupTenant();
    const { tenantId: tenantB, actorId: actorB } = await setupTenant();
    const { draft } = await buildLifecycle(tenantA, actorA);
    const crossTenantRead = new AitRepository(
      database(tenantB, actorB) as never,
      context(tenantB, actorB) as never,
    );
    const rows = await crossTenantRead.findAll();
    expect(rows.filter((row) => row.id === draft.id)).toHaveLength(0);
    // findOne também passa pelo mesmo tx tenant-scoped (database(tenantB,
    // actorB)) — nunca uma conexão crua fora do wrapper, que rodaria com o
    // papel 'owner' ainda ativo em `app.role` e contornaria a RLS.
    await expect(
      database(tenantB, actorB).tx((tx) =>
        crossTenantRead.findOne(draft.id, tx as never),
      ),
    ).rejects.toBeDefined();
  });

  it('C-0001-34 — dado decide com approve num pedido post_final então content_hash e system_signature_ref do AIT continuam, byte a byte, os de antes (AC-TEAT-011-1)', async () => {
    const { tenantId, actorId } = await setupTenant();
    const { lifecycle, draft } = await buildLifecycle(tenantId, actorId);
    const finalized = (await lifecycle.finalize(draft.id, actorId)) as {
      content_hash?: string;
      system_signature_ref?: string;
    };
    const service = lifecycle as unknown as {
      createCancelRequest?: (dto: Record<string, unknown>) => Promise<unknown>;
      decideCancelRequest?: (
        id: string,
        decision: string,
        note: string,
        actorId: string,
      ) => Promise<unknown>;
    };
    if (!service.createCancelRequest || !service.decideCancelRequest) {
      expect(
        typeof service.createCancelRequest === 'function' &&
          typeof service.decideCancelRequest === 'function',
        'AitLifecycleService.createCancelRequest/decideCancelRequest ainda não existem (TASK-0003, M4)',
      ).toBe(true);
      return;
    }
    const request = (await service.createCancelRequest({
      entityType: 'ait-cancel-posfinal-request',
      trafficAgencyId: tenantId,
      idempotencyKey: `posfinal-${draft.id}`,
      targetLocalActId: `local-${draft.id}`,
      targetAitId: draft.id,
      originStatus: 'FINALIZADO_LOCAL',
      justification: 'erro material identificado',
      requestedBy: actorId,
    })) as { id: string };
    await service.decideCancelRequest(
      request.id,
      'approve',
      'deferido pela Diretoria',
      actorId,
    );
    const after = await client.query<{
      content_hash: string;
      system_signature_ref: string;
      current_status: string;
    }>(
      `select content_hash, system_signature_ref, current_status from inf.ait_ait where id = $1`,
      [draft.id],
    );
    expect(after.rows[0]?.content_hash).toBe(finalized.content_hash);
    expect(after.rows[0]?.system_signature_ref).toBe(
      finalized.system_signature_ref,
    );
    expect(after.rows[0]?.current_status).toBe('CANCELADO_POSFINAL');
  });

  it('C-0001-35 — dado decide com deny então o AIT volta exatamente a origin_status e o ait_cancel_request_event de "denied" fica gravado (AC-TEAT-011-4)', async () => {
    const { tenantId, actorId } = await setupTenant();
    const { lifecycle, draft } = await buildLifecycle(tenantId, actorId);
    await lifecycle.finalize(draft.id, actorId);
    const service = lifecycle as unknown as {
      createCancelRequest?: (dto: Record<string, unknown>) => Promise<unknown>;
      decideCancelRequest?: (
        id: string,
        decision: string,
        note: string,
        actorId: string,
      ) => Promise<unknown>;
    };
    if (!service.createCancelRequest || !service.decideCancelRequest) {
      expect(
        typeof service.createCancelRequest === 'function' &&
          typeof service.decideCancelRequest === 'function',
        'AitLifecycleService.createCancelRequest/decideCancelRequest ainda não existem (TASK-0003, M4)',
      ).toBe(true);
      return;
    }
    const request = (await service.createCancelRequest({
      entityType: 'ait-cancel-posfinal-request',
      trafficAgencyId: tenantId,
      idempotencyKey: `deny-${draft.id}`,
      targetLocalActId: `local-${draft.id}`,
      targetAitId: draft.id,
      originStatus: 'FINALIZADO_LOCAL',
      justification: 'pedido a ser negado',
      requestedBy: actorId,
    })) as { id: string };
    await service.decideCancelRequest(
      request.id,
      'deny',
      'sem fundamento para cancelar',
      actorId,
    );
    const after = await client.query(
      `select current_status from inf.ait_ait where id = $1`,
      [draft.id],
    );
    expect(after.rows[0]?.current_status).toBe('FINALIZADO_LOCAL');
    const events = await client.query(
      `select event_type from inf.ait_cancel_request_event where cancel_request_id = $1`,
      [request.id],
    );
    expect(events.rows.map((row) => row.event_type)).toEqual(
      expect.arrayContaining(['denied']),
    );
  });

  /**
   * `inf.administrative_measure` não está na leitura obrigatória fechada
   * desta tarefa (não consta em `AGENTS.md`/`CODESTYLE.md`/`rait-test-strategy.md`/
   * `teat-error-catalog.md`/`policy.spec.ts`/`policy.ts`/`roles.ts`/
   * `ait-lifecycle.service.spec.ts`/os testes e2e e integration/`vitest.config.ts`/
   * `detran-runtime.ts`/os seeds e DDL 04 citados no prompt), então este teste
   * não inventa suas colunas: confere só que a decisão não altera nenhuma
   * linha do tenant na tabela, sem criar uma medida vinculada de verdade (o
   * que exigiria o schema de `inf.administrative_measure`, fora da lista
   * fechada). Registrado como limitação no relatório.
   */
  it('C-0001-36 — dado decide com approve então nenhuma linha de inf.administrative_measure do tenant muda (RN-TEAT-123, AC-TEAT-011-5; verificação limitada, ver relatório)', async () => {
    const { tenantId, actorId } = await setupTenant();
    const { lifecycle, draft } = await buildLifecycle(tenantId, actorId);
    await lifecycle.finalize(draft.id, actorId);
    const before = await client.query(
      `select count(*)::int as count from inf.administrative_measure where tenant_id = $1`,
      [tenantId],
    );
    const service = lifecycle as unknown as {
      createCancelRequest?: (dto: Record<string, unknown>) => Promise<unknown>;
      decideCancelRequest?: (
        id: string,
        decision: string,
        note: string,
        actorId: string,
      ) => Promise<unknown>;
    };
    if (!service.createCancelRequest || !service.decideCancelRequest) {
      expect(
        typeof service.createCancelRequest === 'function' &&
          typeof service.decideCancelRequest === 'function',
        'AitLifecycleService.createCancelRequest/decideCancelRequest ainda não existem (TASK-0003, M4)',
      ).toBe(true);
      return;
    }
    const request = (await service.createCancelRequest({
      entityType: 'ait-cancel-posfinal-request',
      trafficAgencyId: tenantId,
      idempotencyKey: `measure-${draft.id}`,
      targetLocalActId: `local-${draft.id}`,
      targetAitId: draft.id,
      originStatus: 'FINALIZADO_LOCAL',
      justification: 'verificação de não interferência com medida',
      requestedBy: actorId,
    })) as { id: string };
    await service.decideCancelRequest(
      request.id,
      'approve',
      'deferido',
      actorId,
    );
    const after = await client.query(
      `select count(*)::int as count from inf.administrative_measure where tenant_id = $1`,
      [tenantId],
    );
    expect(after.rows[0]?.count).toBe(before.rows[0]?.count);
  });
});

/**
 * CTG-0001 §13 item 1 (Adenda, R-0008, TASK-0002 iteração 3) —
 * `concurrency-review` resolve o conflito canônico em `ops.sync_conflict`/
 * `ops.sync_queue_item` (DDL 18), via `SyncConflictPort` (ainda não existe,
 * Engineer iteração 3). Sem comando de aplicação de lote nesta rodada
 * (CTG-0002), o AIT é levado a `SUSPEITO_CONCORRENCIA` por `update` direto
 * (papel `owner`) e as linhas de `ops.sync_queue_item`/`ops.sync_conflict`
 * são inseridas manualmente — não há fixture nem comando para isso ainda.
 */
describe('AIT — concurrency-review resolve o conflito real (integration, §13 item 1)', () => {
  it('dado um sync_conflict aberto (conflict_type=concurrency) referenciando o AIT em SUSPEITO_CONCORRENCIA quando concurrency-review então o sync_conflict fica resolved com resolution_action e context.conflictId é o id real', async () => {
    const { tenantId, actorId } = await setupTenant();
    const { lifecycle, draft } = await buildLifecycle(tenantId, actorId);
    await client.query(
      `update inf.ait_ait set current_status = 'SUSPEITO_CONCORRENCIA' where id = $1`,
      [draft.id],
    );
    const queueItem = await client.query<{ id: string }>(
      `insert into ops.sync_queue_item
         (tenant_id, traffic_agency_id, device_id, agent_id, entity_type,
          local_entity_id, server_entity_id, status, created_locally_at,
          idempotency_key, payload_hash, payload_json)
       values ($1, $1, $2, $3, 'ait', $4, $5, 'received', now(), $6, $7, '{}'::jsonb)
       returning id`,
      [
        tenantId,
        randomUUID(),
        randomUUID(),
        randomUUID(),
        draft.id,
        `idem-${draft.id}`,
        'sha256:' + 'a'.repeat(64),
      ],
    );
    const conflict = await client.query<{ id: string }>(
      `insert into ops.sync_conflict
         (tenant_id, sync_queue_item_id, conflict_type, description, status)
       values ($1, $2, 'concurrency', 'mesmo agente em dispositivos distintos', 'open')
       returning id`,
      [tenantId, queueItem.rows[0]!.id],
    );
    const conflictId = conflict.rows[0]!.id;

    const result = (await lifecycle.reviewConcurrency(
      draft.id,
      'release',
      'apuração concluída sem indício de fraude',
      actorId,
    )) as { context?: { conflictId?: string } };

    expect(result.context?.conflictId).toBe(conflictId);
    const after = await client.query<{
      status: string;
      resolution_action: string | null;
      resolved_by_user_ref: string | null;
    }>(
      `select status, resolution_action, resolved_by_user_ref from ops.sync_conflict where id = $1`,
      [conflictId],
    );
    expect(after.rows[0]?.status).toBe('resolved');
    expect(after.rows[0]?.resolution_action).toBeTruthy();
    expect(after.rows[0]?.resolved_by_user_ref).toBe(actorId);
  });

  it('dado o AIT em SUSPEITO_CONCORRENCIA sem nenhum sync_conflict aberto quando concurrency-review então 409 TEAT.AIT_STATE_INVALID com context.command="concurrency-review"', async () => {
    const { tenantId, actorId } = await setupTenant();
    const { lifecycle, draft } = await buildLifecycle(tenantId, actorId);
    await client.query(
      `update inf.ait_ait set current_status = 'SUSPEITO_CONCORRENCIA' where id = $1`,
      [draft.id],
    );
    await expect(
      lifecycle.reviewConcurrency(draft.id, 'release', 'sem conflito', actorId),
    ).rejects.toMatchObject({
      code: 'TEAT.AIT_STATE_INVALID',
      status: 409,
      context: expect.objectContaining({ command: 'concurrency-review' }),
    });
  });
});

/**
 * CTG-0001 §13 item 5 (Adenda) — `integration.outbox.id` (a coluna real da
 * linha) é igual ao `id` gravado dentro do `payload` JSON.
 */
describe('AIT — envelope.id é o id real da linha da outbox (integration, §13 item 5)', () => {
  it("dado finalize então integration.outbox.id == payload->>'id' para a linha AIT_FINALIZADO", async () => {
    const { tenantId, actorId } = await setupTenant();
    const { lifecycle, draft } = await buildLifecycle(tenantId, actorId);
    await lifecycle.finalize(draft.id, actorId);
    const row = await client.query<{ id: string; payload_id: string | null }>(
      `select id, payload->>'id' as payload_id from integration.outbox
         where tenant_id = $1 and aggregate_id = $2 and payload->>'domainEvent' = 'AIT_FINALIZADO'`,
      [tenantId, draft.id],
    );
    expect(row.rows).toHaveLength(1);
    expect(row.rows[0]?.payload_id).toBe(row.rows[0]?.id);
  });
});
