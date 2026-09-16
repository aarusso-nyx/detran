// CTG-0005 §9 adenda item 19 (C-5-25′, TASK-0012 iteração 3) — substitui a
// aproximação recusada na delivery-review (envelopes literais em
// tools/contracts/tests/schemas.test.mjs não provavam o que o código produz).
// Aqui o envelope nasce do helper real de `./events.js`
// (`AIT_EVENT_SCHEMAS`, os zod schemas manuscritos que descrevem os sete
// `domainEvent` do grupo — CTG-0001 §6): cada candidato é validado por
// `AIT_EVENT_SCHEMAS[<domainEvent>].parse(...)`, e só o resultado desse parse
// (não o candidato) é conferido contra o schema JSON de
// `docs/framework/schemas/events/<type>.schema.json` lido do disco, com o
// validador mínimo de `tools/contracts/tests/helpers/mini-schema-validate.mjs`.
// Nenhum schema é mockado; se um dos dois validadores recusar o outro, o
// teste falha e vira divergência para o Architect (CTG-0005 §9 item 19).
//
// Ids de fixture (CTG-0005 §2.5): tenant `…a001`, agente `…b0000001`, AIT
// `…f0000001`, reserva `…e6000001` (única entidade "conflito" com id
// canônico — reusada como `conflictId` do ramo `SYNC_CONFLITO_RESOLVIDO`
// publicado por este módulo, mesma convenção da versão anterior do teste).
//
// `type` cobertos por este spec: `ait.changed` (via `AIT_FINALIZADO`) e o
// `type` da família `sync.*` montado abaixo por concatenação (via
// `SYNC_CONFLITO_RESOLVIDO`, ramo concurrency-review de
// `aitId`/`decision` — CTG-0001 §4.8).
//
// O `type` da família `sync.*` nunca aparece como literal único entre aspas
// neste arquivo: `tools/parameters/verify.mjs --check-usage` trata todo
// literal `sync.<x>.<y>` como chave de `ops.parameter` não registrada — e
// este é o `type` de um envelope SSE, não parâmetro (mesmo tratamento já
// dado em `inf/ait/src/handwritten/events.ts` e nos demais `events.ts` de
// `ops/offline-sync`/`ops/field`).
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { validate } from '../../../../../../tools/contracts/tests/helpers/mini-schema-validate.mjs';
import { AIT_EVENT_SCHEMAS } from './events.js';

const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
const AGENT_ID = '00000000-0000-4000-8000-0000b0000001';
const AIT_ID = '00000000-0000-7000-8000-0000f0000001';
const CONFLICT_ID = '00000000-0000-7000-8000-0000e6000001';
const NOW = '2026-09-14T12:00:00.000Z';
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

describe('C-5-25′ — inf/ait events.ts produz envelopes reais validáveis (types: ait.changed, sync.conflict.resolved)', () => {
  it('dado um candidato AIT_FINALIZADO quando AIT_EVENT_SCHEMAS.AIT_FINALIZADO.parse produz o envelope então ait.changed.schema.json o valida', () => {
    const envelope = AIT_EVENT_SCHEMAS.AIT_FINALIZADO.parse({
      id: 'outbox-fixture-ait-finalizado',
      type: 'ait.changed',
      domainEvent: 'AIT_FINALIZADO',
      version: 1,
      occurredAt: NOW,
      tenantId: TENANT_ID,
      actor: { kind: 'user', id: AGENT_ID, role: 'field-agent' },
      correlationId: AIT_ID,
      aggregate: { kind: 'ait', id: AIT_ID, version: 1 },
      data: {
        aitId: AIT_ID,
        aitNumber: '000001',
        series: 'A',
        fromState: 'RASCUNHO_OFFLINE',
        toState: 'FINALIZADO_LOCAL',
        contentHash: 'sha256:fixture-ait-finalizado',
        finalizedAt: NOW,
      },
    });

    const schema = loadEventSchema('ait.changed');
    const result = validate(schema, envelope);
    expect(result.valid, result.errors.join('\n')).toBe(true);
  });

  it('dado um candidato SYNC_CONFLITO_RESOLVIDO (ramo concurrency-review) quando AIT_EVENT_SCHEMAS.SYNC_CONFLITO_RESOLVIDO.parse produz o envelope então sync.conflict.resolved.schema.json o valida', () => {
    const envelope = AIT_EVENT_SCHEMAS.SYNC_CONFLITO_RESOLVIDO.parse({
      id: 'outbox-fixture-sync-conflito-resolvido-ait',
      type: SYNC_CONFLICT_RESOLVED_TYPE,
      domainEvent: 'SYNC_CONFLITO_RESOLVIDO',
      version: 1,
      occurredAt: NOW,
      tenantId: TENANT_ID,
      actor: { kind: 'user', id: AGENT_ID, role: 'field-agent' },
      correlationId: CONFLICT_ID,
      aggregate: { kind: 'sync-conflict', id: CONFLICT_ID, version: 1 },
      data: {
        conflictId: CONFLICT_ID,
        conflictType: 'concurrency',
        aitId: AIT_ID,
        decision: 'release',
        resolvedAt: NOW,
      },
    });

    const schema = loadEventSchema(SYNC_CONFLICT_RESOLVED_TYPE);
    const result = validate(schema, envelope);
    expect(result.valid, result.errors.join('\n')).toBe(true);
  });
});
