// Testes dos schemas JSON manuscritos de `docs/framework/schemas/` (TASK-0012,
// iteração 3, WP-T3, CTG-0005 §5 e §7 C-5-23/24/25/26; adenda §9.16 e §9
// item 19).
//
// `ajv` não está disponível na raiz do workspace (adenda §9.16); os testes usam
// `tools/contracts/tests/helpers/mini-schema-validate.mjs`, um validador mínimo
// local que cobre `type`/`required`/`properties`/`const`/`enum`/
// `additionalProperties`/`items`/`oneOf`/`$ref` local — o subconjunto que estes
// schemas realmente usam (nenhum deles tem `$ref` remoto, `if`/`then`/`else`
// nem `patternProperties`).
//
// C-5-25 (versão original: envelopes "copiados dos *.spec.ts dos events.ts de
// cada módulo") foi recusado na delivery-review do ciclo 2 — nenhum módulo
// TEAT tem um `events*.spec.ts` com literais completos, e os envelopes
// "aproximados" que este arquivo continha não provavam o que o código produz
// (adenda §9 item 19). Critério substituto **C-5-25′**: cada um dos oito
// módulos TEAT com `events.ts` manuscrito
// (`inf/{ait,measures,alcohol,normative}`, `ops/{evidence,field,
// offline-sync,snapshots}`) ganhou `src/handwritten/events.schema.spec.ts`
// próprio, que importa os helpers reais de `./events.js`, produz um envelope
// por `type` que o módulo emite e o valida contra o schema em disco com este
// mesmo validador — a união dos oito specs cobre os dezesseis `type` de
// §5.4. Este arquivo não afirma mais C-5-25 (produção do envelope real): só
// confere que cada um dos dezesseis schemas é carregável e declara a forma
// mínima de envelope (`properties.type.const` e `properties.data`).
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { validate } from './helpers/mini-schema-validate.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const schemasDir = join(root, 'docs/framework/schemas');
const eventsDir = join(schemasDir, 'events');

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

test('C-5-23 — todo docs/framework/schemas/*.json e schemas/events/*.json faz JSON.parse sem erro e declara $schema draft 2020-12 e $id', async () => {
  const topLevel = (await readdir(schemasDir)).filter(
    (name) => name.endsWith('.json') && name !== 'events',
  );
  const eventFiles = (await readdir(eventsDir)).filter((name) =>
    name.endsWith('.json'),
  );
  const files = [
    ...topLevel.map((name) => join(schemasDir, name)),
    ...eventFiles.map((name) => join(eventsDir, name)),
  ];
  assert.ok(
    files.length >= 19,
    `esperava ao menos 19 arquivos, achou ${files.length}`,
  );
  for (const filePath of files) {
    const raw = await readFile(filePath, 'utf8');
    let doc;
    assert.doesNotThrow(() => {
      doc = JSON.parse(raw);
    }, `${filePath} não é JSON válido`);
    assert.equal(
      doc.$schema,
      'https://json-schema.org/draft/2020-12/schema',
      `${filePath}: $schema`,
    );
    assert.ok(
      typeof doc.$id === 'string' && doc.$id.length > 0,
      `${filePath}: $id ausente ou vazio`,
    );
  }
});

// CTG-0005 §5.4 — os dezesseis arquivos e o domainEvent(s)/aggregate.kind que
// cada um cobre; não inclui os cinco `inf.infraction*`/`inf.timer*` (RAIT, de
// rodada anterior, fora de WP-T3) que também vivem em schemas/events/.
const EXPECTED_EVENT_FILES = [
  'ait.changed',
  'ait.concurrency-suspected',
  'sync.batch.received',
  'sync.conflict.opened',
  'sync.conflict.resolved',
  'numbering.reservation.changed',
  'shift.changed',
  'device.posture-changed',
  'catalog.published',
  'package.published',
  'evidence.changed',
  'custody.event',
  'evidence.access-request.changed',
  'probative-package.generated',
  'measure.changed',
  'alcohol.changed',
];

test('C-5-24 — os dezesseis events/<type>.schema.json de CTG-0005 §5.4 existem e o const de type é igual ao nome do arquivo', async () => {
  assert.equal(EXPECTED_EVENT_FILES.length, 16);
  for (const token of EXPECTED_EVENT_FILES) {
    const filePath = join(eventsDir, `${token}.schema.json`);
    const doc = await readJson(filePath);
    assert.equal(doc.properties?.type?.const, token, filePath);
  }
});

// Módulo TEAT que publica cada `type` de §5.4 (para conferência humana; a
// prova de que o helper real do módulo produz um envelope válido está no
// `events.schema.spec.ts` do próprio módulo, C-5-25′).
const EVENT_TYPE_MODULES = {
  'ait.changed': ['inf/ait', 'ops/offline-sync'],
  'ait.concurrency-suspected': ['ops/offline-sync'],
  'sync.batch.received': ['ops/offline-sync'],
  'sync.conflict.opened': ['ops/offline-sync'],
  'sync.conflict.resolved': ['ops/offline-sync', 'inf/ait'],
  'numbering.reservation.changed': ['ops/offline-sync'],
  'shift.changed': ['ops/field'],
  'device.posture-changed': ['ops/field'],
  'catalog.published': ['inf/normative'],
  'package.published': ['inf/normative'],
  'evidence.changed': ['ops/evidence'],
  'custody.event': ['ops/evidence'],
  'evidence.access-request.changed': ['ops/evidence'],
  'probative-package.generated': ['ops/evidence'],
  'measure.changed': ['inf/measures'],
  'alcohol.changed': ['inf/alcohol'],
};

test('C-5-25 — cada events/<type>.schema.json de §5.4 é carregável e declara a forma mínima de envelope (properties.type.const e properties.data); a produção real do envelope é C-5-25′ (events.schema.spec.ts de cada módulo)', async () => {
  assert.equal(
    Object.keys(EVENT_TYPE_MODULES).length,
    EXPECTED_EVENT_FILES.length,
    'um módulo de origem por arquivo de §5.4',
  );
  for (const token of EXPECTED_EVENT_FILES) {
    const doc = await readJson(join(eventsDir, `${token}.schema.json`));
    assert.equal(
      doc.properties?.type?.const,
      token,
      `${token}.schema.json: properties.type.const`,
    );
    assert.ok(
      doc.properties?.data !== undefined,
      `${token}.schema.json: properties.data ausente`,
    );
    assert.ok(
      Array.isArray(EVENT_TYPE_MODULES[token]) &&
        EVENT_TYPE_MODULES[token].length > 0,
      `${token}: sem módulo de origem em EVENT_TYPE_MODULES`,
    );
  }
});

test('C-5-26 — teat-offline-sync-batch.schema.json valida o corpo do lote usado em backend/app/tests/e2e/teat-field-sync.e2e.spec.ts e recusa um item sem payload_hash', async () => {
  const schema = await readJson(
    join(schemasDir, 'teat-offline-sync-batch.schema.json'),
  );

  // Corpo copiado literalmente de `syncBatchBody()` em
  // backend/app/tests/e2e/teat-field-sync.e2e.spec.ts:87-106 (ids fixos aqui
  // no lugar de randomUUID()/Date.now() para o teste ser determinístico; a
  // forma e os valores dos demais campos são os do arquivo).
  const crashRecordPayload = { crash: { local_protocol: 'BOAT-0001' } };
  const realE2eBody = {
    traffic_agency_id: '00000000-0000-7000-8000-0000e2000001',
    device_id: '00000000-0000-7000-8000-0000e4000002',
    agent_id: '00000000-0000-4000-8000-0000b0000001',
    device_batch_id: 'e2e-fixture01',
    items: [
      {
        entity_type: 'crash-record',
        local_entity_id: '00000000-0000-7000-8000-0000ea000001',
        idempotency_key: 'e2e-item-fixture01',
        created_locally_at: '2026-09-14T13:05:00.000Z',
        payload_json: crashRecordPayload,
        payload_hash: 'sha256:fixture-crash-record',
      },
    ],
  };

  // C-5-26 (CTG-0005 §7) pede que o schema valide o corpo real do e2e. Numa
  // primeira leitura desta iteração, `items[].entity_type.enum` (§5.1) não
  // incluía `"crash-record"` ("crash-record é do BOAT e não é aceito aqui"),
  // enquanto o próprio e2e usa `entity_type: 'crash-record'` e o comenta como
  // "reconhecido como suportado e não tem destino nesta rodada (§4.3)" — o
  // comando montado aceita e responde 200. Ou seja, o schema recusava o mesmo
  // corpo que o e2e prova válido em produção; reportado como achado e
  // corrigido em paralelo pelo Engineer (TASK-0010) — o schema agora inclui
  // `"crash-record"` com a nota "aceito na forma e rejeitado no destino". A
  // asserção abaixo é a do critério (valid === true); mantém o corpo real do
  // e2e como está para continuar provando a integração schema × e2e.
  const realBodyResult = validate(schema, realE2eBody);
  assert.equal(
    realBodyResult.valid,
    true,
    `esperado pelo e2e real (backend/app/tests/e2e/teat-field-sync.e2e.spec.ts) ` +
      `mas o schema recusa: ${realBodyResult.errors.join('; ')}`,
  );

  // Isolando o critério "recusa um item sem payload_hash" do achado acima:
  // mesma forma, com um `entity_type` que o schema aceita hoje.
  const schemaValidBody = JSON.parse(JSON.stringify(realE2eBody));
  schemaValidBody.items[0].entity_type = 'ait';
  const validResult = validate(schema, schemaValidBody);
  assert.ok(
    validResult.valid,
    `corpo com entity_type do enum deveria validar: ${validResult.errors.join('; ')}`,
  );

  delete schemaValidBody.items[0].payload_hash;
  const missingHashResult = validate(schema, schemaValidBody);
  assert.equal(missingHashResult.valid, false);
  assert.ok(
    missingHashResult.errors.some((error) => error.includes('payload_hash')),
    `esperava um erro citando payload_hash; obteve: ${missingHashResult.errors.join('; ')}`,
  );
});
