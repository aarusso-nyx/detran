// CTG-0005 §9 adenda item 19 (C-5-25′, TASK-0012 iteração 3) — substitui a
// aproximação recusada na delivery-review (envelopes literais em
// tools/contracts/tests/schemas.test.mjs não provavam o que o código
// produz). Aqui o envelope nasce do helper real de `./events.js`
// (`alcoholTestRegisteredEvent`, que fecha sobre `alcoholEnvelope` de
// `alcohol-runtime.ts` — CTG-0004 §9). O resultado é validado contra o
// schema JSON de `docs/framework/schemas/events/alcohol.changed.schema.json`
// lido do disco, com o validador mínimo de
// `tools/contracts/tests/helpers/mini-schema-validate.mjs`. Nenhum schema é
// mockado.
//
// Ids de fixture (CTG-0005 §2.5): tenant `…a001`, agente `…b0000001`,
// procedimento de alcoolemia `…ee000001` (seed 28). `outcome`/`toState`:
// tokens reais de `classification.ts` (`classifyConsidered`, usado por
// `record-test.command.ts`) — `RESULTADO_ABAIXO_LIMITE`, o mesmo token da
// linha de timeline `…ee000005` do seed 28. `testId` não tem fixture
// canônica (`inf.alcohol_test` nasce em runtime, sem seed dedicado — só o
// procedimento pai tem id de seed); literal identificado como tal.
//
// `type` coberto por este spec: `alcohol.changed` (via
// `ALCOOLEMIA_TESTE_REGISTRADO`).
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { validate } from '../../../../../../tools/contracts/tests/helpers/mini-schema-validate.mjs';
import { alcoholTestRegisteredEvent } from './events.js';

const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
const AGENT_ID = '00000000-0000-4000-8000-0000b0000001';
const PROCEDURE_ID = '00000000-0000-7000-8000-0000ee000001';
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

describe('C-5-25′ — inf/alcohol events.ts produz envelopes reais validáveis (type: alcohol.changed)', () => {
  it('dado o scope e os dados de ALCOOLEMIA_TESTE_REGISTRADO quando alcoholTestRegisteredEvent produz o envelope então alcohol.changed.schema.json o valida', () => {
    const envelope = alcoholTestRegisteredEvent(
      { tenantId: TENANT_ID, actorId: AGENT_ID, occurredAt: NOW },
      {
        procedureId: PROCEDURE_ID,
        testId: 'alcohol-test-fixture-0001',
        breathalyzerId: null,
        testedAt: NOW,
        resultMgL: 0.05,
        maxErrorMgL: 0.005,
        consideredMgL: 0.045,
        outcome: 'RESULTADO_ABAIXO_LIMITE',
        toState: 'RESULTADO_ABAIXO_LIMITE',
      },
    );

    const schema = loadEventSchema('alcohol.changed');
    const result = validate(schema, envelope);
    expect(result.valid, result.errors.join('\n')).toBe(true);
  });
});
