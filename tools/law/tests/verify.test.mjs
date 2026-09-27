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
