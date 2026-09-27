import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { access, mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, test } from 'node:test';

const temporaryRoots = [];
const schemaBytes = Buffer.from('{"type":"object"}\n');
const schemaName = 'sample.schema.json';
const schemaHash = (bytes) => createHash('sha256').update(bytes).digest('hex');

afterEach(async () => {
  await Promise.all(
    temporaryRoots
      .splice(0)
      .map((root) => rm(root, { recursive: true, force: true })),
  );
});

async function makeFixture() {
  const root = await mkdtemp(join(tmpdir(), 'law-corpus-'));
  temporaryRoots.push(root);
  const repoRoot = join(root, 'repo');
  const packageSchemasDir = join(root, 'package-schemas');
  const odRegistryPath = join(
    repoRoot,
    'docs/meta/knowledge-base/open-decisions-rait.md',
  );

  await mkdir(join(repoRoot, 'docs/meta/knowledge-base'), { recursive: true });
  await mkdir(join(repoRoot, 'product'), { recursive: true });
  await mkdir(join(repoRoot, 'law/schemas'), { recursive: true });
  await mkdir(packageSchemasDir, { recursive: true });
  await writeFile(join(packageSchemasDir, schemaName), schemaBytes);
  await writeFile(join(repoRoot, 'law/schemas', schemaName), schemaBytes);
  await writeFile(
    join(repoRoot, 'law/schemas/manifest.json'),
    JSON.stringify({
      devai_version: '1.5.6',
      sha256: { [schemaName]: schemaHash(schemaBytes) },
    }),
  );
  await writeFile(
    odRegistryPath,
    '## R-0019 — law-corpus\n\n| ID | Questão |\n| --- | --- |\n| OD-R19-001 | Exemplo |\n',
  );
  await writeFile(join(repoRoot, 'law/README.md'), '# Law corpus\n');
  await writeFile(join(repoRoot, 'product/README.md'), '# Product corpus\n');

  return { repoRoot, packageSchemasDir, odRegistryPath };
}

async function writeInvariant(repoRoot, invariant) {
  const invariantDirectory = join(repoRoot, 'law/invariants');
  await mkdir(invariantDirectory, { recursive: true });
  await writeFile(
    join(invariantDirectory, 'INV-INF-001.json'),
    JSON.stringify({
      schemaVersion: '1.0.0',
      version: '1.0.0',
      id: 'INV-INF-001',
      domain: 'INF',
      type: 'lifecycle',
      severity: 'gate',
      statement: 'INF MUST preserve its checked process.',
      lifecycle: 'supported',
      status: 'active',
      provenance: [],
      authority_docs: { docs: [] },
      verification: {
        oracle: 'tests',
        strategy: {
          primary: 'regression',
          deterministic_check_available: true,
        },
      },
      change_policy: {
        breaking_change_requires: [
          'doc_update',
          'trace_update',
          'test_update',
          'human_approval',
        ],
        test_weakening_allowed: false,
        human_approval_required: true,
      },
      ...invariant,
    }),
  );
}

async function writeGlossarySource(repoRoot, terms) {
  const rows = terms
    .map((term) => `| ${term} | Definição de fixture | REF-FIXTURE |`)
    .join('\n');
  const path = join(repoRoot, 'docs/framework/glossary/domain.md');
  await mkdir(dirname(path), { recursive: true });
  await writeFile(
    path,
    `## Glossário de fixture\n\n| Termo | Definição curta | Fonte |\n| --- | --- | --- |\n${rows}\n`,
  );
}

async function writeGlossaryEntry(repoRoot, id, term) {
  const directory = join(repoRoot, 'law/glossary');
  await mkdir(directory, { recursive: true });
  await writeFile(
    join(directory, `${id}.json`),
    JSON.stringify({
      schemaVersion: '1.0.0',
      id,
      term,
      definition: 'Definição destilada de fixture.',
      authority: 'joint',
      status: 'draft',
      category: 'technical',
      provenance: ['docs/framework/glossary/domain.md:4'],
      related_invariants: [],
    }),
  );
}

async function writeJourneySource(repoRoot, id) {
  const directory = join(
    repoRoot,
    'docs/framework/product/domains/inf/journeys',
  );
  await mkdir(directory, { recursive: true });
  await writeFile(
    join(directory, `${id}.md`),
    `---\nid: ${id}\ntitle: Jornada ${id}\n---\n\n# Jornada ${id}\n`,
  );
}

async function writeJourney(repoRoot, id, sourceId) {
  const directory = join(repoRoot, 'product/journeys');
  await mkdir(directory, { recursive: true });
  await writeFile(
    join(directory, `${id}.json`),
    JSON.stringify({
      schemaVersion: '1.0.0',
      id,
      title: `Jornada ${sourceId}`,
      status: 'draft',
      persona: { role: 'agente' },
      preconditions: [],
      steps: [{ seq: 1, action: 'Executa a ação.' }],
      postconditions: [],
      acceptance_criteria: [{ id: 'AC-001', statement: 'source_pending' }],
      provenance: [sourceId],
      related_invariants: [],
    }),
  );
}

async function writeUseCaseSource(repoRoot, id, title) {
  const directory = join(
    repoRoot,
    'docs/framework/product/domains/inf/use-cases',
  );
  await mkdir(directory, { recursive: true });
  await writeFile(
    join(directory, `${id}.md`),
    `---\nid: ${id}\ntitle: ${title}\n---\n\n# ${title}\n`,
  );
}

async function writeUseCaseBundle(repoRoot, filename, id, title) {
  const directory = join(repoRoot, 'product/use-cases');
  await mkdir(directory, { recursive: true });
  await writeFile(
    join(directory, filename),
    JSON.stringify({
      schemaVersion: '1.0.0',
      roles: ['agente'],
      cases: [{ id, title, actors: ['agente'], mainFlow: [] }],
    }),
  );
}

function assertNoRuleViolations(result, rule) {
  assert.deepEqual(violationsFor(result.violations, rule), []);
}

function assertRuleViolationFor(result, rule, reference) {
  assert.ok(
    violationsFor(result.violations, rule).some(
      ({ path, detail }) =>
        path.includes(reference) || detail.includes(reference),
    ),
    `Expected a rule ${rule} violation tied to ${reference}.`,
  );
}

let verifierPromise;
async function verifyLawCorpus(fixture) {
  verifierPromise ??= import('../verify.mjs').then(
    (module) => module.verifyLawCorpus,
  );
  return (await verifierPromise)(fixture);
}

function violationsFor(violations, rule) {
  return violations.filter((violation) => violation.rule === rule);
}

function assertViolationCode(result, rule, code) {
  const codes = violationsFor(result.violations, rule).map(
    (violation) => violation.code,
  );
  assert.ok(
    codes.includes(code),
    `Expected ${code}; received ${codes.join(', ')}`,
  );
}

test('dado fixture temporária quando prepara os diretórios então cria os caminhos de corpus exigidos', async () => {
  const fixture = await makeFixture();

  await Promise.all([
    access(join(fixture.repoRoot, 'docs/meta/knowledge-base')),
    access(join(fixture.repoRoot, 'product')),
    access(join(fixture.repoRoot, 'law/schemas')),
  ]);
});

test('dado schema copiado e hash correspondente quando verifica a regra (a) então não há violação (a)', async () => {
  const fixture = await makeFixture();
  const result = await verifyLawCorpus(fixture);

  assert.deepEqual(violationsFor(result.violations, 'a'), []);
});

test('dado schema ausente quando verifica a regra (a) então aponta a cópia ausente', async () => {
  const fixture = await makeFixture();
  await rm(join(fixture.repoRoot, 'law/schemas', schemaName));

  const result = await verifyLawCorpus(fixture);

  assertViolationCode(result, 'a', 'SCHEMA_MISSING');
});

test('dado schema extra quando verifica a regra (a) então aponta o arquivo fora do roster', async () => {
  const fixture = await makeFixture();
  await writeFile(
    join(fixture.repoRoot, 'law/schemas/extra.schema.json'),
    schemaBytes,
  );

  const result = await verifyLawCorpus(fixture);

  assertViolationCode(result, 'a', 'SCHEMA_EXTRA');
});

test('dado schema alterado quando verifica a regra (a) então aponta bytes divergentes', async () => {
  const fixture = await makeFixture();
  await writeFile(
    join(fixture.repoRoot, 'law/schemas', schemaName),
    '{"type":"string"}\n',
  );

  const result = await verifyLawCorpus(fixture);

  assertViolationCode(result, 'a', 'SCHEMA_BYTES_DIVERGENT');
});

test('dado sha divergente no manifesto quando verifica a regra (a) então aponta o hash incorreto', async () => {
  const fixture = await makeFixture();
  await writeFile(
    join(fixture.repoRoot, 'law/schemas/manifest.json'),
    JSON.stringify({
      devai_version: '1.5.6',
      sha256: { [schemaName]: '0'.repeat(64) },
    }),
  );

  const result = await verifyLawCorpus(fixture);

  assertViolationCode(result, 'a', 'MANIFEST_HASH_DIVERGENT');
});

test('dado manifesto sem schema do roster quando verifica a regra (a) então aponta o roster divergente', async () => {
  const fixture = await makeFixture();
  await writeFile(
    join(fixture.repoRoot, 'law/schemas/manifest.json'),
    JSON.stringify({ devai_version: '1.5.6', sha256: {} }),
  );

  const result = await verifyLawCorpus(fixture);

  assertViolationCode(result, 'a', 'MANIFEST_ROSTER_DIVERGENT');
});

test('dado manifesto com schema extra quando verifica a regra (a) então aponta o roster divergente', async () => {
  const fixture = await makeFixture();
  await writeFile(
    join(fixture.repoRoot, 'law/schemas/manifest.json'),
    JSON.stringify({
      devai_version: '1.5.6',
      sha256: {
        [schemaName]: schemaHash(schemaBytes),
        'extra.schema.json': schemaHash(schemaBytes),
      },
    }),
  );

  const result = await verifyLawCorpus(fixture);

  assertViolationCode(result, 'a', 'MANIFEST_ROSTER_DIVERGENT');
});

test('dado manifesto JSON inválido quando verifica a regra (a) então aponta manifesto inválido', async () => {
  const fixture = await makeFixture();
  await writeFile(join(fixture.repoRoot, 'law/schemas/manifest.json'), '{');

  const result = await verifyLawCorpus(fixture);

  assertViolationCode(result, 'a', 'MANIFEST_INVALID');
});

test('dado OD-R19-001 registrado na seção canônica quando verifica a regra (b) então não há violação (b)', async () => {
  const fixture = await makeFixture();
  const sources = [
    [
      'docs/framework/product/domains/inf/rules/RN-INF-001.md',
      '# Regra de operação\n',
    ],
    [
      'docs/framework/product/domains/inf/workflows/WF-INF-001.md',
      '# Fluxo de operação\n',
    ],
    [
      'docs/framework/product/domains/inf/use-cases/UC-INF-001.md',
      '# Caso de uso\n',
    ],
    [
      'docs/framework/product/domains/inf/journeys/JRN-INF-001.md',
      '# Jornada de operação\n',
    ],
    [
      'docs/framework/product/domains/inf/APP.md',
      '---\nid: APP-INF\n---\n\n# Operação\n\n## Procedimento seguro\n',
    ],
    ['docs/meta/adr/ADR-0001-example.md', '# Decisão\n\n## Decisão\n'],
  ];
  for (const [path, content] of sources) {
    const sourcePath = join(fixture.repoRoot, path);
    await mkdir(dirname(sourcePath), { recursive: true });
    await writeFile(sourcePath, content);
  }
  await writeInvariant(fixture.repoRoot, {
    provenance: [
      'RN-INF-001',
      'WF-INF-001',
      'UC-INF-001',
      'JRN-INF-001',
      'APP-INF',
      'ADR-0001',
      'OD-R19-001',
    ],
    authority_docs: {
      docs: [
        {
          doc: 'docs/framework/product/domains/inf/APP.md',
          anchor: 'procedimento-seguro',
        },
        {
          doc: 'docs/meta/adr/ADR-0001-example.md',
          anchor: 'deciso',
        },
      ],
    },
  });

  const result = await verifyLawCorpus(fixture);

  assert.deepEqual(violationsFor(result.violations, 'b'), []);
});

test('dado cabeçalho Decisão quando a âncora remove o diacrítico então rejeita a aproximação', async () => {
  const fixture = await makeFixture();
  const sourcePath = join(
    fixture.repoRoot,
    'docs/meta/adr/ADR-0001-example.md',
  );
  await mkdir(dirname(sourcePath), { recursive: true });
  await writeFile(sourcePath, '# Exemplo\n\n## Decisão\n');
  await writeInvariant(fixture.repoRoot, {
    authority_docs: {
      docs: [{ doc: 'docs/meta/adr/ADR-0001-example.md', anchor: 'decisao' }],
    },
  });

  const result = await verifyLawCorpus(fixture);

  assertViolationCode(result, 'b', 'AUTHORITY_ANCHOR_UNRESOLVED');
});

test('dado OD anterior em outra seção do registro quando verifica a regra (b) então resolve a linha da tabela', async () => {
  const fixture = await makeFixture();
  await writeFile(
    fixture.odRegistryPath,
    '## R-0018 — índice de ADRs\n\n| ID | Questão |\n| --- | --- |\n| OD-R18-001 | Exemplo |\n\n## R-0019 — law-corpus\n\n| ID | Questão |\n| --- | --- |\n| OD-R19-001 | Exemplo |\n',
  );
  await writeInvariant(fixture.repoRoot, { provenance: ['OD-R18-001'] });

  const result = await verifyLawCorpus(fixture);

  assert.deepEqual(violationsFor(result.violations, 'b'), []);
});

test('dado OD-R19 fora da seção canônica quando verifica a regra (b) então rejeita a linha deslocada', async () => {
  const fixture = await makeFixture();
  await writeFile(
    fixture.odRegistryPath,
    '## R-0018 — índice de ADRs\n\n| ID | Questão |\n| --- | --- |\n| OD-R19-001 | Deslocada |\n\n## R-0019 — law-corpus\n\n| ID | Questão |\n| --- | --- |\n',
  );
  await writeInvariant(fixture.repoRoot, { provenance: ['OD-R19-001'] });

  const result = await verifyLawCorpus(fixture);

  assertViolationCode(result, 'b', 'REFERENCE_UNRESOLVED');
});

test('dado provenance sem fonte quando verifica a regra (b) então aponta o ID não resolvido', async () => {
  const fixture = await makeFixture();
  await writeInvariant(fixture.repoRoot, { provenance: ['RN-INF-999'] });

  const result = await verifyLawCorpus(fixture);

  assertViolationCode(result, 'b', 'REFERENCE_UNRESOLVED');
});

test('dado ID de cada família sem fonte quando verifica a regra (b) então aponta cada origem ausente', async (t) => {
  for (const id of [
    'WF-INF-999',
    'UC-INF-999',
    'JRN-INF-999',
    'APP-MISSING',
    'ADR-9999',
  ]) {
    await t.test(`ID ${id}`, async () => {
      const fixture = await makeFixture();
      await writeInvariant(fixture.repoRoot, { provenance: [id] });

      const result = await verifyLawCorpus(fixture);

      assertViolationCode(result, 'b', 'REFERENCE_UNRESOLVED');
    });
  }
});

test('dado âncora ausente no documento quando verifica a regra (b) então aponta a referência inválida', async () => {
  const fixture = await makeFixture();
  await mkdir(join(fixture.repoRoot, 'docs/framework/product/domains/inf'), {
    recursive: true,
  });
  await writeFile(
    join(fixture.repoRoot, 'docs/framework/product/domains/inf/APP.md'),
    '# Procedimento\n',
  );
  await writeInvariant(fixture.repoRoot, {
    authority_docs: {
      docs: [
        {
          doc: 'docs/framework/product/domains/inf/APP.md',
          anchor: 'procedimento-inexistente',
        },
      ],
    },
  });

  const result = await verifyLawCorpus(fixture);

  assertViolationCode(result, 'b', 'AUTHORITY_ANCHOR_UNRESOLVED');
});

test('dado documento de autoridade ausente quando verifica a regra (b) então aponta a fonte inexistente', async () => {
  const fixture = await makeFixture();
  await writeInvariant(fixture.repoRoot, {
    authority_docs: {
      docs: [
        {
          doc: 'docs/framework/product/domains/inf/missing.md',
          anchor: 'fonte',
        },
      ],
    },
  });

  const result = await verifyLawCorpus(fixture);

  assertViolationCode(result, 'b', 'AUTHORITY_DOCUMENT_UNRESOLVED');
});

test('dado OD não registrado quando verifica a regra (b) então aponta a decisão não resolvida', async () => {
  const fixture = await makeFixture();
  await writeInvariant(fixture.repoRoot, { provenance: ['OD-R19-999'] });

  const result = await verifyLawCorpus(fixture);

  assertViolationCode(result, 'b', 'REFERENCE_UNRESOLVED');
});

test('dado README vigente quando verifica a regra (e) então não há violação (e)', async () => {
  const fixture = await makeFixture();

  const result = await verifyLawCorpus(fixture);

  assert.deepEqual(violationsFor(result.violations, 'e'), []);
});

test('dado README-placeholder sem conteúdo autoral quando verifica a regra (e) então placeholders isolados são permitidos', async () => {
  const fixture = await makeFixture();
  await mkdir(join(fixture.repoRoot, 'law/glossary'), { recursive: true });
  await writeFile(
    join(fixture.repoRoot, 'law/glossary/README.md'),
    'Content is intentionally empty until authored.\n',
  );
  await writeFile(
    join(fixture.repoRoot, 'product/README.md'),
    'Generated by DEVAI v1.4.5.\n',
  );

  const result = await verifyLawCorpus(fixture);

  assert.deepEqual(violationsFor(result.violations, 'e'), []);
});

test('dado README com cada frase obsoleta quando verifica a regra (e) então aponta ambas', async () => {
  const fixture = await makeFixture();
  await mkdir(join(fixture.repoRoot, 'law/adr'), { recursive: true });
  await writeFile(
    join(fixture.repoRoot, 'law/adr/README.md'),
    'Content is intentionally empty until authored.\nGenerated by DEVAI v1.4.5.\n',
  );
  await writeFile(
    join(fixture.repoRoot, 'law/adr/ADR-GOV-0001-example.md'),
    '# ADR de exemplo\n\nConteúdo autoral.\n',
  );

  const result = await verifyLawCorpus(fixture);
  const obsoleteReadmeViolations = violationsFor(result.violations, 'e').filter(
    (violation) => violation.path === 'law/adr/README.md',
  );

  assert.ok(obsoleteReadmeViolations.length >= 2);
  assert.ok(
    obsoleteReadmeViolations.every(
      (violation) => violation.code === 'README_OBSOLETE_CONTENT',
    ),
    `Unexpected codes: ${obsoleteReadmeViolations.map((v) => v.code)}`,
  );
});

test('dado README de jornada obsoleto com arquivo descendente quando verifica a regra (e) então aponta a frase', async () => {
  const fixture = await makeFixture();
  await mkdir(join(fixture.repoRoot, 'product/journeys'), { recursive: true });
  await writeFile(
    join(fixture.repoRoot, 'product/journeys/README.md'),
    'Content is intentionally empty until authored.\n',
  );
  await writeFile(
    join(fixture.repoRoot, 'product/journeys/JNY-001.json'),
    '{"id":"JNY-001","title":"Jornada documentada"}\n',
  );

  const result = await verifyLawCorpus(fixture);
  const journeyReadmeViolations = violationsFor(result.violations, 'e').filter(
    (violation) => violation.path === 'product/journeys/README.md',
  );

  assert.ok(journeyReadmeViolations.length > 0);
  assert.ok(
    journeyReadmeViolations.every(
      (violation) => violation.code === 'README_OBSOLETE_CONTENT',
    ),
    `Unexpected codes: ${journeyReadmeViolations.map((v) => v.code)}`,
  );
});

test('dado README autoral que mantém frase obsoleta quando verifica a regra (e) então aponta a frase', async () => {
  const fixture = await makeFixture();
  await mkdir(join(fixture.repoRoot, 'law/register'), { recursive: true });
  await writeFile(
    join(fixture.repoRoot, 'law/register/README.md'),
    '# Registro de decisões\n\nGenerated by DEVAI v1.4.5.\n',
  );

  const result = await verifyLawCorpus(fixture);
  const authoredReadmeViolations = violationsFor(result.violations, 'e').filter(
    (violation) => violation.path === 'law/register/README.md',
  );

  assert.ok(authoredReadmeViolations.length > 0);
  assert.ok(
    authoredReadmeViolations.every(
      (violation) => violation.code === 'README_OBSOLETE_CONTENT',
    ),
    `Unexpected codes: ${authoredReadmeViolations.map((v) => v.code)}`,
  );
});

test('dado termo e GE correspondentes quando verifica a regra (c) então aceita o par', async () => {
  const fixture = await makeFixture();
  await writeGlossarySource(fixture.repoRoot, ['Termo de fixture']);
  await writeGlossaryEntry(fixture.repoRoot, 'GE-001', 'Termo de fixture');

  const result = await verifyLawCorpus(fixture);

  assertNoRuleViolations(result, 'c');
});

test('dado termo fonte sem GE quando verifica a regra (c) então aponta a ausência', async () => {
  const fixture = await makeFixture();
  await writeGlossarySource(fixture.repoRoot, ['Termo sem entrada']);

  const result = await verifyLawCorpus(fixture);

  assertRuleViolationFor(result, 'c', 'Termo sem entrada');
});

test('dado GE sem termo no domain.md quando verifica a regra (c) então aponta a entrada órfã', async () => {
  const fixture = await makeFixture();
  await writeGlossarySource(fixture.repoRoot, ['Termo de origem']);
  await writeGlossaryEntry(fixture.repoRoot, 'GE-001', 'Termo órfão');

  const result = await verifyLawCorpus(fixture);

  assertRuleViolationFor(result, 'c', 'GE-001.json');
});

test('dado JRN com JNY correspondente quando verifica a regra (d) então não marca o par como órfão', async () => {
  const fixture = await makeFixture();
  await writeJourneySource(fixture.repoRoot, 'JRN-PEC-001');
  await writeJourney(fixture.repoRoot, 'JNY-001', 'JRN-PEC-001');

  const result = await verifyLawCorpus(fixture);
  const pairViolations = violationsFor(result.violations, 'd').filter(
    (violation) =>
      violation.path.endsWith('JNY-001.json') ||
      violation.path.endsWith('JRN-PEC-001.md'),
  );

  assert.deepEqual(pairViolations, []);
});

test('dado JRN sem JNY quando verifica a regra (d) então aponta a jornada fonte sem par', async () => {
  const fixture = await makeFixture();
  await writeJourneySource(fixture.repoRoot, 'JRN-PEC-001');

  const result = await verifyLawCorpus(fixture);

  assertRuleViolationFor(result, 'd', 'JRN-PEC-001');
});

test('dado JNY sem JRN quando verifica a regra (d) então aponta a jornada DEVAI órfã', async () => {
  const fixture = await makeFixture();
  await writeJourney(fixture.repoRoot, 'JNY-001', 'JRN-PEC-001');

  const result = await verifyLawCorpus(fixture);

  assertRuleViolationFor(result, 'd', 'JNY-001.json');
});

test('dado UC com entrada no bundle correspondente quando verifica a regra (d) então não marca o caso como órfão', async () => {
  const fixture = await makeFixture();
  await writeUseCaseSource(
    fixture.repoRoot,
    'UC-INF-001',
    'Caso de uso de fixture',
  );
  await writeUseCaseBundle(
    fixture.repoRoot,
    'inf.json',
    'UC-INF-001',
    'Caso de uso de fixture',
  );

  const result = await verifyLawCorpus(fixture);
  const pairViolations = violationsFor(result.violations, 'd').filter(
    (violation) =>
      violation.path.endsWith('UC-INF-001.md') ||
      violation.path.endsWith('inf.json'),
  );

  assert.deepEqual(pairViolations, []);
});

test('dado UC sem entrada em bundle quando verifica a regra (d) então aponta o caso fonte sem par', async () => {
  const fixture = await makeFixture();
  await writeUseCaseSource(
    fixture.repoRoot,
    'UC-INF-001',
    'Caso de uso de fixture',
  );

  const result = await verifyLawCorpus(fixture);

  assertRuleViolationFor(result, 'd', 'UC-INF-001');
});

test('dado caso no bundle sem UC fonte quando verifica a regra (d) então aponta a entrada órfã', async () => {
  const fixture = await makeFixture();
  await writeUseCaseBundle(
    fixture.repoRoot,
    'inf.json',
    'UC-INF-001',
    'Caso de uso de fixture',
  );

  const result = await verifyLawCorpus(fixture);

  assertRuleViolationFor(result, 'd', 'UC-INF-001');
});

async function writeGlossaryVariant(repoRoot, id, term, overrides = {}) {
  const directory = join(repoRoot, 'law/glossary');
  await mkdir(directory, { recursive: true });
  await writeFile(
    join(directory, `${id}.json`),
    JSON.stringify({
      schemaVersion: '1.0.0',
      id,
      term,
      definition: 'Definição destilada de fixture.',
      authority: 'joint',
      status: 'draft',
      category: 'technical',
      provenance: ['docs/framework/glossary/domain.md:4'],
      related_invariants: [],
      ...overrides,
    }),
  );
}

async function writeJourneyVariant(repoRoot, id, sourceId, overrides = {}) {
  const directory = join(repoRoot, 'product/journeys');
  await mkdir(directory, { recursive: true });
  await writeFile(
    join(directory, `${id}.json`),
    JSON.stringify({
      schemaVersion: '1.0.0',
      id,
      title: `Jornada ${sourceId}`,
      status: 'draft',
      persona: { role: 'agente' },
      preconditions: [],
      steps: [{ seq: 1, action: 'Executa a ação.' }],
      postconditions: [],
      acceptance_criteria: [{ id: 'AC-001', statement: 'source_pending' }],
      provenance: [sourceId],
      related_invariants: [],
      ...overrides,
    }),
  );
}

async function writeUseCaseBundleVariant(
  repoRoot,
  filename,
  cases,
  roles = ['agente'],
) {
  const directory = join(repoRoot, 'product/use-cases');
  await mkdir(directory, { recursive: true });
  await writeFile(
    join(directory, filename),
    JSON.stringify({ schemaVersion: '1.0.0', roles, cases }),
  );
}

async function writeUseCaseSourceAt(repoRoot, directoryName, id, title) {
  const directory = join(
    repoRoot,
    `docs/framework/product/domains/${directoryName}/use-cases`,
  );
  await mkdir(directory, { recursive: true });
  await writeFile(
    join(directory, `${id}.md`),
    `---\nid: ${id}\ntitle: ${title}\n---\n\n# ${title}\n`,
  );
}

function assertTargetedViolation(result, rule, code, reference) {
  assert.ok(
    violationsFor(result.violations, rule).some(
      (violation) =>
        violation.code === code &&
        (violation.path.includes(reference) ||
          violation.detail.includes(reference)),
    ),
    `Expected ${code} for ${reference}; received ${JSON.stringify(violationsFor(result.violations, rule))}`,
  );
}

test('dado dois GE com termo repetido sem distinção de caixa então rejeita o duplicado [MUTATION:GLOSSARY_TERM_DUPLICATE]', async () => {
  const fixture = await makeFixture();
  await writeGlossarySource(fixture.repoRoot, ['AIT']);
  await writeGlossaryVariant(fixture.repoRoot, 'GE-001', 'AIT');
  await writeGlossaryVariant(fixture.repoRoot, 'GE-002', 'ait');

  const result = await verifyLawCorpus(fixture);

  assertTargetedViolation(
    result,
    'c',
    'GLOSSARY_TERM_DUPLICATE',
    'GE-002.json',
  );
});

test('dado GE fora de draft quando verifica o glossário então rejeita o status [MUTATION:GLOSSARY_STATUS_INVALID]', async () => {
  const fixture = await makeFixture();
  await writeGlossarySource(fixture.repoRoot, ['AIT']);
  await writeGlossaryVariant(fixture.repoRoot, 'GE-001', 'AIT', {
    status: 'accepted',
  });

  const result = await verifyLawCorpus(fixture);

  assertTargetedViolation(
    result,
    'c',
    'GLOSSARY_STATUS_INVALID',
    'GE-001.json',
  );
});

test('dado GE sem provenance quando verifica o glossário então rejeita a origem ausente [MUTATION:GLOSSARY_PROVENANCE_MISSING]', async () => {
  const fixture = await makeFixture();
  await writeGlossarySource(fixture.repoRoot, ['AIT']);
  await writeGlossaryVariant(fixture.repoRoot, 'GE-001', 'AIT', {
    provenance: [],
  });

  const result = await verifyLawCorpus(fixture);

  assertTargetedViolation(
    result,
    'c',
    'GLOSSARY_PROVENANCE_MISSING',
    'GE-001.json',
  );
});

test('dado GE com invariant inexistente então rejeita o vínculo não resolvido [MUTATION:GLOSSARY_INVARIANT_UNRESOLVED]', async () => {
  const fixture = await makeFixture();
  await writeGlossarySource(fixture.repoRoot, ['AIT']);
  await writeGlossaryVariant(fixture.repoRoot, 'GE-001', 'AIT', {
    related_invariants: ['INV-INF-999'],
  });

  const result = await verifyLawCorpus(fixture);

  assertTargetedViolation(
    result,
    'c',
    'GLOSSARY_INVARIANT_UNRESOLVED',
    'GE-001.json',
  );
});

test('dado JNY com ID trocado para JRN-PEC-001 então rejeita o mapa fixo [MUTATION:JOURNEY_DIVERGENT_MAPPING]', async () => {
  const fixture = await makeFixture();
  await writeJourneySource(fixture.repoRoot, 'JRN-PEC-001');
  await writeJourneyVariant(fixture.repoRoot, 'JNY-002', 'JRN-PEC-001');

  const result = await verifyLawCorpus(fixture);

  assertTargetedViolation(result, 'd', 'JOURNEY_DIVERGENT', 'JNY-002.json');
});

test('dado JNY com título divergente da fonte então rejeita a jornada [MUTATION:JOURNEY_DIVERGENT_TITLE]', async () => {
  const fixture = await makeFixture();
  await writeJourneySource(fixture.repoRoot, 'JRN-PEC-001');
  await writeJourneyVariant(fixture.repoRoot, 'JNY-001', 'JRN-PEC-001', {
    title: 'Título divergente',
  });

  const result = await verifyLawCorpus(fixture);

  assertTargetedViolation(result, 'd', 'JOURNEY_DIVERGENT', 'JNY-001.json');
});

test('dado UC com título divergente da fonte então rejeita a entrada [MUTATION:USE_CASE_DIVERGENT_TITLE]', async () => {
  const fixture = await makeFixture();
  await writeUseCaseSource(fixture.repoRoot, 'UC-INF-001', 'Título de origem');
  await writeUseCaseBundleVariant(fixture.repoRoot, 'inf.json', [
    {
      id: 'UC-INF-001',
      title: 'Título divergente',
      actors: ['agente'],
      mainFlow: [],
    },
  ]);

  const result = await verifyLawCorpus(fixture);

  assertTargetedViolation(result, 'd', 'USE_CASE_DIVERGENT', 'inf.json');
});

test('dado UC em bundle diferente da pasta fonte então rejeita o destino [MUTATION:USE_CASE_DIVERGENT_BUNDLE]', async () => {
  const fixture = await makeFixture();
  await writeUseCaseSourceAt(
    fixture.repoRoot,
    'inf',
    'UC-INF-001',
    'Caso de uso',
  );
  await writeUseCaseBundleVariant(fixture.repoRoot, 'portal.json', [
    {
      id: 'UC-INF-001',
      title: 'Caso de uso',
      actors: ['agente'],
      mainFlow: [],
    },
  ]);

  const result = await verifyLawCorpus(fixture);

  assertTargetedViolation(result, 'd', 'USE_CASE_DIVERGENT', 'portal.json');
});

test('dado ID de caso repetido em bundles então rejeita a duplicata [MUTATION:BUNDLE_ID_DUPLICATE]', async () => {
  const fixture = await makeFixture();
  const useCase = {
    id: 'UC-INF-001',
    title: 'Caso de uso',
    actors: ['agente'],
    mainFlow: [],
  };
  await writeUseCaseBundleVariant(fixture.repoRoot, 'inf.json', [useCase]);
  await writeUseCaseBundleVariant(fixture.repoRoot, 'other.json', [useCase]);

  const result = await verifyLawCorpus(fixture);

  assertTargetedViolation(result, 'd', 'BUNDLE_ID_DUPLICATE', 'other.json');
});

test('dado ator ausente da lista roles do bundle então rejeita o papel [MUTATION:USE_CASE_ROLE_UNDECLARED]', async () => {
  const fixture = await makeFixture();
  await writeUseCaseBundleVariant(fixture.repoRoot, 'inf.json', [
    {
      id: 'UC-INF-001',
      title: 'Caso de uso',
      actors: ['secretaria'],
      mainFlow: [],
    },
  ]);

  const result = await verifyLawCorpus(fixture);

  assertTargetedViolation(
    result,
    'd',
    'USE_CASE_ROLE_UNDECLARED',
    'UC-INF-001',
  );
});

test('dado UC sem atores então rejeita a entrada vazia [MUTATION:USE_CASE_DIVERGENT_EMPTY_ACTORS]', async () => {
  const fixture = await makeFixture();
  await writeUseCaseSource(fixture.repoRoot, 'UC-INF-001', 'Caso de uso');
  await writeUseCaseBundleVariant(fixture.repoRoot, 'inf.json', [
    { id: 'UC-INF-001', title: 'Caso de uso', actors: [], mainFlow: [] },
  ]);

  const result = await verifyLawCorpus(fixture);

  assertTargetedViolation(result, 'd', 'USE_CASE_DIVERGENT', 'inf.json');
});

for (const [label, overrides] of [
  ['sem steps', { steps: [] }],
  ['sem AC', { acceptance_criteria: [] }],
  ['sem persona', { persona: {} }],
  ['status não draft', { status: 'accepted' }],
]) {
  test(`dado JNY ${label} então rejeita conteúdo incompleto [MUTATION:JOURNEY_CONTENT_INCOMPLETE_${label.replaceAll(' ', '_')}]`, async () => {
    const fixture = await makeFixture();
    await writeJourneySource(fixture.repoRoot, 'JRN-PEC-001');
    await writeJourneyVariant(
      fixture.repoRoot,
      'JNY-001',
      'JRN-PEC-001',
      overrides,
    );

    const result = await verifyLawCorpus(fixture);

    assertTargetedViolation(
      result,
      'd',
      'JOURNEY_CONTENT_INCOMPLETE',
      'JNY-001.json',
    );
  });
}

const journeySourceIds = [
  ...Array.from(
    { length: 7 },
    (_, index) => `JRN-PEC-${String(index + 1).padStart(3, '0')}`,
  ),
  ...Array.from(
    { length: 5 },
    (_, index) => `JRN-BOAT-${String(index + 1).padStart(3, '0')}`,
  ),
  ...Array.from(
    { length: 4 },
    (_, index) => `JRN-RAIT-${String(index + 1).padStart(3, '0')}`,
  ),
  ...Array.from(
    { length: 6 },
    (_, index) => `JRN-TEAT-${String(index + 1).padStart(3, '0')}`,
  ),
  ...Array.from(
    { length: 7 },
    (_, index) => `JRN-DASH-${String(index + 1).padStart(3, '0')}`,
  ),
  ...Array.from(
    { length: 11 },
    (_, index) => `JRN-PORTAL-${String(index + 1).padStart(3, '0')}`,
  ),
];

test('dado 39 JRN quando verifica o total da fonte então rejeita a contagem divergente [MUTATION:JOURNEY_SOURCE_COUNT_DIVERGENT]', async () => {
  const fixture = await makeFixture();
  for (const id of journeySourceIds.slice(0, 39)) {
    await writeJourneySource(fixture.repoRoot, id);
  }

  const result = await verifyLawCorpus(fixture);

  assertTargetedViolation(
    result,
    'd',
    'JOURNEY_SOURCE_COUNT_DIVERGENT',
    'docs/framework/product',
  );
});

test('dado 40 JRN e 39 JNY quando verifica o total de saídas então rejeita a contagem divergente [MUTATION:JOURNEY_OUTPUT_COUNT_DIVERGENT]', async () => {
  const fixture = await makeFixture();
  for (const [index, id] of journeySourceIds.entries()) {
    await writeJourneySource(fixture.repoRoot, id);
    if (index < 39) {
      await writeJourneyVariant(
        fixture.repoRoot,
        `JNY-${String(index + 1).padStart(3, '0')}`,
        id,
      );
    }
  }

  const result = await verifyLawCorpus(fixture);

  assertTargetedViolation(
    result,
    'd',
    'JOURNEY_OUTPUT_COUNT_DIVERGENT',
    'product/journeys',
  );
});

async function writeUseCaseSet(repoRoot, count, bundleCount) {
  const cases = Array.from({ length: bundleCount }, (_, index) => ({
    id: `UC-INF-${String(index + 1).padStart(3, '0')}`,
    title: `Caso ${index + 1}`,
    actors: ['agente'],
    mainFlow: [],
  }));
  for (let index = 0; index < count; index += 1) {
    await writeUseCaseSource(
      repoRoot,
      `UC-INF-${String(index + 1).padStart(3, '0')}`,
      `Caso ${index + 1}`,
    );
  }
  await writeUseCaseBundleVariant(repoRoot, 'inf.json', cases);
}

test('dado 109 UC fontes e 109 bundles quando verifica total de fontes então rejeita a contagem divergente [MUTATION:USE_CASE_SOURCE_COUNT_DIVERGENT]', async () => {
  const fixture = await makeFixture();
  await writeUseCaseSet(fixture.repoRoot, 109, 109);

  const result = await verifyLawCorpus(fixture);

  assertTargetedViolation(
    result,
    'd',
    'USE_CASE_SOURCE_COUNT_DIVERGENT',
    'docs/framework/product',
  );
});

test('dado 110 UC fontes e 109 bundles quando verifica total de saídas então rejeita a contagem divergente [MUTATION:USE_CASE_OUTPUT_COUNT_DIVERGENT]', async () => {
  const fixture = await makeFixture();
  await writeUseCaseSet(fixture.repoRoot, 110, 109);

  const result = await verifyLawCorpus(fixture);

  assertTargetedViolation(
    result,
    'd',
    'USE_CASE_OUTPUT_COUNT_DIVERGENT',
    'product/use-cases',
  );
});
