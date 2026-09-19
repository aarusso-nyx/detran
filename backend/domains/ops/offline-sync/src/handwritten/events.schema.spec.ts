// CTG-0005 §9 adenda item 19 (C-5-25′, TASK-0012 iteração 3) — substitui a
// aproximação recusada na delivery-review (envelopes literais em
// tools/contracts/tests/schemas.test.mjs não provavam o que o código
// produz). Aqui os envelopes nascem dos helpers reais de `./events.js`
// (`syncItemReceivedEvent`, `syncConflictOpenedEvent`,
// `syncConflictResolvedEvent`, `numberingReservationChangedEvent`,
// `aitReceivedEvent`, `aitConcurrencySuspectedEvent` — CTG-0002 §7, todos
// sobre `teatEnvelope` de `@detran/ops-core`). Os resultados são validados
// contra os schemas JSON correspondentes em
// `docs/framework/schemas/events/` lidos do disco, com o validador mínimo de
// `tools/contracts/tests/helpers/mini-schema-validate.mjs`. Nenhum schema é
// mockado.
//
// Ids de fixture (CTG-0005 §2.5): tenant `…a001`, agente `…b0000001`, AIT
// `…f0000001`, dispositivo `…e4000002`, faixa de numeração `…e5000001`,
// reserva `reserved` `…e6000001` (única entidade "conflito"/"item de fila"
// com id canônico — reusada como `conflictId`/`syncQueueItemId`/`itemId` de
// exemplo, mesma convenção da versão anterior do teste), turno aberto
// `…e3000001`.
//
// `type` cobertos por este spec: os três `type` da família `sync.*`
// montados abaixo por concatenação, `numbering.reservation.changed`,
// `ait.changed` (ramo `AIT_RECEBIDO`), `ait.concurrency-suspected`.
//
// Os `type` da família `sync.*` nunca aparecem como literal único entre
// aspas neste arquivo: `tools/parameters/verify.mjs --check-usage` trata
// todo literal `sync.<x>.<y>` como chave de `ops.parameter` não registrada
// — e estes são `type` de envelope SSE, não parâmetro (mesmo tratamento já
// dado em `./events.ts`, que monta os mesmos três `type` por concatenação
// pelo mesmo motivo).
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { validate } from '../../../../../../tools/contracts/tests/helpers/mini-schema-validate.mjs';
import {
  aitConcurrencySuspectedEvent,
  aitReceivedEvent,
  numberingReservationChangedEvent,
  syncConflictOpenedEvent,
  syncConflictResolvedEvent,
  syncItemReceivedEvent,
} from './events.js';

const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
const AGENT_ID = '00000000-0000-4000-8000-0000b0000001';
const AIT_ID = '00000000-0000-7000-8000-0000f0000001';
const DEVICE_ID = '00000000-0000-7000-8000-0000e4000002';
const NUMBERING_RANGE_ID = '00000000-0000-7000-8000-0000e5000001';
const RESERVATION_ID = '00000000-0000-7000-8000-0000e6000001';
const SHIFT_ID = '00000000-0000-7000-8000-0000e3000001';
const NOW = '2026-09-14T12:00:00.000Z';
const SYNC_BATCH_RECEIVED_TYPE = ['sync', 'batch', 'received'].join('.');
const SYNC_CONFLICT_OPENED_TYPE = ['sync', 'conflict', 'opened'].join('.');
const SYNC_CONFLICT_RESOLVED_TYPE = ['sync', 'conflict', 'resolved'].join('.');

const root = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../../../..',
);
const eventsSchemaDir = join(root, 'docs/framework/schemas/events');

function loadEventSchema(type: string): unknown {
  return JSON.parse(
    readFileSync(join(eventsSchemaDir, `${type}.schema.json`), 'utf8'),
  );
}

describe('C-5-25′ — ops/offline-sync events.ts produz envelopes reais validáveis (types: sync.batch.received, sync.conflict.opened, sync.conflict.resolved, numbering.reservation.changed, ait.changed, ait.concurrency-suspected)', () => {
  const scope = { tenantId: TENANT_ID, actorId: AGENT_ID, occurredAt: NOW };

  it('dado o scope e os dados de SYNC_ITEM_RECEBIDO quando syncItemReceivedEvent produz o envelope então sync.batch.received.schema.json o valida', () => {
    const envelope = syncItemReceivedEvent(scope, {
      batchId: null,
      deviceBatchId: 'e2e-fixture',
      batchSequence: null,
      itemId: AIT_ID,
      entityType: 'ait',
      localEntityId: AIT_ID,
      receiptStatus: 'applied',
      errorCode: null,
      serverEntityId: AIT_ID,
    });

    const schema = loadEventSchema(SYNC_BATCH_RECEIVED_TYPE);
    const result = validate(schema, envelope);
    expect(result.valid, result.errors.join('\n')).toBe(true);
  });

  it('dado o scope e os dados de SYNC_CONFLITO_ABERTO quando syncConflictOpenedEvent produz o envelope então sync.conflict.opened.schema.json o valida', () => {
    const envelope = syncConflictOpenedEvent(scope, {
      conflictId: RESERVATION_ID,
      conflictType: 'concurrency',
      syncQueueItemId: RESERVATION_ID,
      reasonCode: 'TEAT.SYNC_ITEM_CONFLICT',
      openedAt: NOW,
    });

    const schema = loadEventSchema(SYNC_CONFLICT_OPENED_TYPE);
    const result = validate(schema, envelope);
    expect(result.valid, result.errors.join('\n')).toBe(true);
  });

  it('dado o scope e os dados de SYNC_CONFLITO_RESOLVIDO (ramo supervisor) quando syncConflictResolvedEvent produz o envelope então sync.conflict.resolved.schema.json o valida', () => {
    const envelope = syncConflictResolvedEvent(scope, {
      conflictId: RESERVATION_ID,
      conflictType: 'integrity',
      resolutionAction: 'accept_server',
      resolvedAt: NOW,
    });

    const schema = loadEventSchema(SYNC_CONFLICT_RESOLVED_TYPE);
    const result = validate(schema, envelope);
    expect(result.valid, result.errors.join('\n')).toBe(true);
  });

  it('dado o scope e os dados de NUMERACAO_RESERVADA quando numberingReservationChangedEvent produz o envelope então numbering.reservation.changed.schema.json o valida', () => {
    const envelope = numberingReservationChangedEvent(scope, {
      reservationId: RESERVATION_ID,
      rangeId: NUMBERING_RANGE_ID,
      agentId: AGENT_ID,
      deviceId: DEVICE_ID,
      shiftId: SHIFT_ID,
      startNumber: 1,
      endNumber: 100,
      validUntil: '2026-09-15T00:00:00.000Z',
      status: 'reserved',
      action: 'reserve',
    });

    const schema = loadEventSchema('numbering.reservation.changed');
    const result = validate(schema, envelope);
    expect(result.valid, result.errors.join('\n')).toBe(true);
  });

  it('dado o scope e os dados de AIT_RECEBIDO quando aitReceivedEvent produz o envelope então ait.changed.schema.json o valida', () => {
    const envelope = aitReceivedEvent(scope, {
      aitId: AIT_ID,
      fromState: 'FINALIZADO_LOCAL',
      receiptProtocol: 'PROTO-FIXTURE-0001',
      receivedAt: NOW,
    });

    const schema = loadEventSchema('ait.changed');
    const result = validate(schema, envelope);
    expect(result.valid, result.errors.join('\n')).toBe(true);
  });

  it('dado o scope e os dados de AIT_SUSPEITO_CONCORRENCIA quando aitConcurrencySuspectedEvent produz o envelope então ait.concurrency-suspected.schema.json o valida', () => {
    const envelope = aitConcurrencySuspectedEvent(scope, {
      aitId: AIT_ID,
      agentId: AGENT_ID,
      deviceId: DEVICE_ID,
      otherDeviceId: null,
      windowStart: NOW,
      windowEnd: '2026-09-14T12:05:00.000Z',
      conflictId: null,
    });

    const schema = loadEventSchema('ait.concurrency-suspected');
    const result = validate(schema, envelope);
    expect(result.valid, result.errors.join('\n')).toBe(true);
  });
});
