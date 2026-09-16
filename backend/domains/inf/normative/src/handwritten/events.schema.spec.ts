// CTG-0005 §9 adenda item 19 (C-5-25′, TASK-0012 iteração 3) — substitui a
// aproximação recusada na delivery-review (envelopes literais em
// tools/contracts/tests/schemas.test.mjs não provavam o que o código
// produz). Aqui os envelopes nascem dos helpers reais de `./events.js`
// (`catalogPublishedEvent`, `packagePublishedEvent` — CTG-0003 §8). Os
// resultados são validados contra os schemas JSON de
// `docs/framework/schemas/events/{catalog.published,package.published}.schema.json`
// lidos do disco, com o validador mínimo de
// `tools/contracts/tests/helpers/mini-schema-validate.mjs`. Nenhum schema é
// mockado.
//
// Ids de fixture (CTG-0005 §2.5): tenant `…a001`, agente `…b0000001`,
// catálogo normativo `…e0000001` (seed 10), pacote mobile (draft)
// `…e7000002` (seed 27).
//
// `type` cobertos por este spec: `catalog.published`, `package.published`.
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { validate } from '../../../../../../tools/contracts/tests/helpers/mini-schema-validate.mjs';
import { catalogPublishedEvent, packagePublishedEvent } from './events.js';

const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
const AGENT_ID = '00000000-0000-4000-8000-0000b0000001';
const CATALOG_ID = '00000000-0000-7000-8000-0000e0000001';
const PACKAGE_ID = '00000000-0000-7000-8000-0000e7000002';
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

describe('C-5-25′ — inf/normative events.ts produz envelopes reais validáveis (types: catalog.published, package.published)', () => {
  it('dado o scope e os dados de CATALOGO_PUBLICADO quando catalogPublishedEvent produz o envelope então catalog.published.schema.json o valida', () => {
    const envelope = catalogPublishedEvent(
      { tenantId: TENANT_ID, actorId: AGENT_ID, occurredAt: NOW },
      {
        catalogId: CATALOG_ID,
        name: 'Catálogo fixture',
        version: '2026.1',
        publishedAt: '2026-09-14',
        validFrom: '2026-09-14',
      },
    );

    const schema = loadEventSchema('catalog.published');
    const result = validate(schema, envelope);
    expect(result.valid, result.errors.join('\n')).toBe(true);
  });

  it('dado o scope e os dados de PACOTE_MOBILE_PUBLICADO quando packagePublishedEvent produz o envelope então package.published.schema.json o valida', () => {
    const envelope = packagePublishedEvent(
      { tenantId: TENANT_ID, actorId: AGENT_ID, occurredAt: NOW },
      {
        packageId: PACKAGE_ID,
        catalogId: CATALOG_ID,
        packageVersion: '1',
        manifestHash: 'sha256:fixture-manifest',
        publishedAt: NOW,
        validUntil: '2026-12-14',
      },
    );

    const schema = loadEventSchema('package.published');
    const result = validate(schema, envelope);
    expect(result.valid, result.errors.join('\n')).toBe(true);
  });
});
