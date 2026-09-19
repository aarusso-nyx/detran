// CTG-0005 §9 adenda item 19 (C-5-25′, TASK-0012 iteração 3) — substitui a
// aproximação recusada na delivery-review (envelopes literais em
// tools/contracts/tests/schemas.test.mjs não provavam o que o código
// produz). Aqui o envelope nasce do helper real de `./events.js`
// (`measureStartedEvent`, que fecha sobre `measureEnvelope` de
// `measure-runtime.ts` — CTG-0004 §9): nenhum campo do envelope é montado à
// mão fora da função exportada; só o `scope`/`data` de entrada usam ids de
// fixture. O resultado é validado contra o schema JSON de
// `docs/framework/schemas/events/measure.changed.schema.json` lido do disco,
// com o validador mínimo de
// `tools/contracts/tests/helpers/mini-schema-validate.mjs`. Nenhum schema é
// mockado.
//
// Ids de fixture (CTG-0005 §2.5): tenant `…a001`, agente `…b0000001`, medida
// `…ed000001` (estado `RETIDO`, seed 28), tipo de medida `…ec000001`
// (`retencao`, seed 28), AIT `…f0000001`. `currentStatus: 'RETIDO'` é o
// token de destino de `start` na matriz 8×12 (CTG-0004 §1).
//
// `type` coberto por este spec: `measure.changed` (via `MEDIDA_INICIADA`).
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { validate } from '../../../../../../tools/contracts/tests/helpers/mini-schema-validate.mjs';
import { measureStartedEvent } from './events.js';

const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
const AGENT_ID = '00000000-0000-4000-8000-0000b0000001';
const MEASURE_ID = '00000000-0000-7000-8000-0000ed000001';
const MEASURE_TYPE_ID = '00000000-0000-7000-8000-0000ec000001';
const AIT_ID = '00000000-0000-7000-8000-0000f0000001';
const NOW = '2026-09-14T12:00:00.000Z';

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

describe('C-5-25′ — inf/measures events.ts produz envelopes reais validáveis (type: measure.changed)', () => {
  it('dado o scope e os dados de MEDIDA_INICIADA quando measureStartedEvent produz o envelope então measure.changed.schema.json o valida', () => {
    const envelope = measureStartedEvent(
      { tenantId: TENANT_ID, actorId: AGENT_ID, occurredAt: NOW },
      {
        measureId: MEASURE_ID,
        measureTypeId: MEASURE_TYPE_ID,
        aitId: AIT_ID,
        agentId: AGENT_ID,
        currentStatus: 'RETIDO',
        startedAt: NOW,
      },
    );

    const schema = loadEventSchema('measure.changed');
    const result = validate(schema, envelope);
    expect(result.valid, result.errors.join('\n')).toBe(true);
  });
});
