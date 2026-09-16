// CTG-0005 §9 adenda item 19 (C-5-25′, TASK-0012 iteração 3) — substitui a
// aproximação recusada na delivery-review (envelopes literais em
// tools/contracts/tests/schemas.test.mjs não provavam o que o código
// produz). Aqui os envelopes nascem dos helpers reais de `./events.js`
// (`shiftOpenedEvent`, `devicePostureChangedEvent` — CTG-0002 §7, ambos
// sobre `teatEnvelope` de `@detran/ops-core`). Os resultados são validados
// contra os schemas JSON correspondentes em
// `docs/framework/schemas/events/` lidos do disco, com o validador mínimo de
// `tools/contracts/tests/helpers/mini-schema-validate.mjs`. Nenhum schema é
// mockado.
//
// Ids de fixture (CTG-0005 §2.5): tenant `…a001`, agente `…b0000001`, turno
// aberto `…e3000001` (seed 26), unidade `…e2100001` (seed 26), dispositivo
// `…e4000002` (seed 25/26).
//
// `type` cobertos por este spec: `shift.changed` (via `TURNO_ABERTO`),
// `device.posture-changed` (via `DISPOSITIVO_BLOQUEADO`).
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { validate } from '../../../../../../tools/contracts/tests/helpers/mini-schema-validate.mjs';
import { devicePostureChangedEvent, shiftOpenedEvent } from './events.js';

const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
const AGENT_ID = '00000000-0000-4000-8000-0000b0000001';
const SHIFT_ID = '00000000-0000-7000-8000-0000e3000001';
const UNIT_ID = '00000000-0000-7000-8000-0000e2100001';
const DEVICE_ID = '00000000-0000-7000-8000-0000e4000002';
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

describe('C-5-25′ — ops/field events.ts produz envelopes reais validáveis (types: shift.changed, device.posture-changed)', () => {
  const scope = { tenantId: TENANT_ID, actorId: AGENT_ID, occurredAt: NOW };

  it('dado o scope e os dados de TURNO_ABERTO quando shiftOpenedEvent produz o envelope então shift.changed.schema.json o valida', () => {
    const envelope = shiftOpenedEvent(scope, {
      shiftId: SHIFT_ID,
      agentId: AGENT_ID,
      deviceId: DEVICE_ID,
      operationalUnitId: UNIT_ID,
      startedAt: NOW,
    });

    const schema = loadEventSchema('shift.changed');
    const result = validate(schema, envelope);
    expect(result.valid, result.errors.join('\n')).toBe(true);
  });

  it('dado o scope e os dados de DISPOSITIVO_BLOQUEADO quando devicePostureChangedEvent produz o envelope então device.posture-changed.schema.json o valida', () => {
    const envelope = devicePostureChangedEvent(scope, {
      deviceId: DEVICE_ID,
      agentId: AGENT_ID,
      fromStatus: 'active',
      toStatus: 'blocked',
      eventType: 'block',
    });

    const schema = loadEventSchema('device.posture-changed');
    const result = validate(schema, envelope);
    expect(result.valid, result.errors.join('\n')).toBe(true);
  });
});
