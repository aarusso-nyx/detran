// CTG-0005 §9 adenda item 19 (C-5-25′, TASK-0012 iteração 3) — substitui a
// aproximação recusada na delivery-review (envelopes literais em
// tools/contracts/tests/schemas.test.mjs não provavam o que o código
// produz). Aqui os envelopes nascem dos helpers reais de `./events.js`
// (`evidenceCapturedEvent`, `custodyRecordedEvent`, `accessDeliveredEvent`,
// `probativePackageGeneratedEvent` — CTG-0003 §8, todos sobre `teatEnvelope`
// de `@detran/ops-core`). Os resultados são validados contra os schemas JSON
// correspondentes em `docs/framework/schemas/events/` lidos do disco, com o
// validador mínimo de `tools/contracts/tests/helpers/mini-schema-validate.mjs`.
// Nenhum schema é mockado.
//
// Ids de fixture (CTG-0005 §2.5): tenant `…a001`, agente `…b0000001`,
// evidência bodycam `…ef000001` (seed 27), AIT `…f0000001`, evento de
// custódia `…ef300001` (seed 27), pedido de acesso a evidência `…ef400001`
// (seed 27). `eventType`/`requesterRole` usam os enums reais exportados por
// `evidence-runtime.ts` (`CUSTODY_EVENT_TYPES`, `uploaded`;
// `EVIDENCE_ACCESS_REQUESTER_ROLES`, `autoridade-policial`).
//
// `type` cobertos por este spec: `evidence.changed`, `custody.event`,
// `evidence.access-request.changed`, `probative-package.generated`.
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { validate } from '../../../../../../tools/contracts/tests/helpers/mini-schema-validate.mjs';
import {
  accessDeliveredEvent,
  custodyRecordedEvent,
  evidenceCapturedEvent,
  probativePackageGeneratedEvent,
} from './events.js';

const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
const AGENT_ID = '00000000-0000-4000-8000-0000b0000001';
const EVIDENCE_ID = '00000000-0000-7000-8000-0000ef000001';
const AIT_ID = '00000000-0000-7000-8000-0000f0000001';
const CUSTODY_EVENT_ID = '00000000-0000-7000-8000-0000ef300001';
const ACCESS_REQUEST_ID = '00000000-0000-7000-8000-0000ef400001';
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

describe('C-5-25′ — ops/evidence events.ts produz envelopes reais validáveis (types: evidence.changed, custody.event, evidence.access-request.changed, probative-package.generated)', () => {
  const scope = { tenantId: TENANT_ID, actorId: AGENT_ID, occurredAt: NOW };

  it('dado o scope e os dados de EVIDENCIA_CAPTURADA quando evidenceCapturedEvent produz o envelope então evidence.changed.schema.json o valida', () => {
    const envelope = evidenceCapturedEvent(scope, {
      evidenceId: EVIDENCE_ID,
      entityType: 'ait',
      entityId: AIT_ID,
      evidenceType: 'bodycam',
      hashValue: 'sha256:fixture-evidence',
      capturedAt: '2026-09-14T12:00:00-04:00',
      uploadedAt: NOW,
    });

    const schema = loadEventSchema('evidence.changed');
    const result = validate(schema, envelope);
    expect(result.valid, result.errors.join('\n')).toBe(true);
  });

  it('dado o scope e os dados de CUSTODIA_EVENTO quando custodyRecordedEvent produz o envelope então custody.event.schema.json o valida', () => {
    const envelope = custodyRecordedEvent(scope, {
      evidenceId: EVIDENCE_ID,
      custodyEventId: CUSTODY_EVENT_ID,
      eventType: 'uploaded',
      eventAt: NOW,
    });

    const schema = loadEventSchema('custody.event');
    const result = validate(schema, envelope);
    expect(result.valid, result.errors.join('\n')).toBe(true);
  });

  it('dado o scope e os dados de acesso entregue quando accessDeliveredEvent produz o envelope então evidence.access-request.changed.schema.json o valida', () => {
    const envelope = accessDeliveredEvent(scope, {
      evidenceId: EVIDENCE_ID,
      accessRequestId: ACCESS_REQUEST_ID,
      custodyEventId: CUSTODY_EVENT_ID,
      eventType: 'access_delivered',
      requesterRole: 'autoridade-policial',
      eventAt: NOW,
    });

    const schema = loadEventSchema('evidence.access-request.changed');
    const result = validate(schema, envelope);
    expect(result.valid, result.errors.join('\n')).toBe(true);
  });

  it('dado o scope e os dados de PACOTE_PROBATORIO_GERADO quando probativePackageGeneratedEvent produz o envelope então probative-package.generated.schema.json o valida', () => {
    const envelope = probativePackageGeneratedEvent(scope, {
      packageId: EVIDENCE_ID,
      entityType: 'ait',
      entityId: AIT_ID,
      purpose: 'processo-administrativo',
      manifestHash: 'sha256:fixture-probative',
      itemCount: 1,
    });

    const schema = loadEventSchema('probative-package.generated');
    const result = validate(schema, envelope);
    expect(result.valid, result.errors.join('\n')).toBe(true);
  });
});
