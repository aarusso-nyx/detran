import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const POLICY_ROOT = new URL(
  '../../../node_modules/@aarusso-nyx/devai/dist/',
  import.meta.url,
);
const REGISTRY_URL = new URL('law/policy/sensor-registry.json', POLICY_ROOT);
const PRESETS_URL = new URL('law/policy/sense-presets.json', POLICY_ROOT);
const SCHEMA_URL = new URL(
  'runtime/index/schemas/sensor-reading.schema.json',
  POLICY_ROOT,
);
const VERIFIER_URL = new URL('../verify-sensor-policy.mjs', import.meta.url);
const CLI_PATH = new URL('../verify-sensor-policy.mjs', import.meta.url)
  .pathname;

const MISSING_SCHEMA_KINDS = [
  'decision_record_integrity',
  'decision_citation_resolution',
  'archive_immutability',
  'round_record_integrity',
];

async function installedFixtures() {
  const [registry, presets, schema] = await Promise.all(
    [REGISTRY_URL, PRESETS_URL, SCHEMA_URL].map(async (url) =>
      JSON.parse(await readFile(url, 'utf8')),
    ),
  );
  return { registry, presets, schema };
}

function clone(value) {
  return structuredClone(value);
}

function schemaEnum(schema) {
  return schema.properties.sensor.properties.kind.enum;
}

function coherentFixture(source) {
  const fixture = clone(source);
  const kinds = schemaEnum(fixture.schema);
  for (const kind of MISSING_SCHEMA_KINDS) {
    if (!kinds.includes(kind)) {
      kinds.push(kind);
    }
  }
  return fixture;
}

function frozenIncompleteEnum(source) {
  const fixture = clone(source);
  fixture.schema.properties.sensor.properties.kind.enum = schemaEnum(
    fixture.schema,
  ).filter((kind) => !MISSING_SCHEMA_KINDS.includes(kind));
  return fixture;
}

async function verify(fixture) {
  const { verifySensorPolicy } = await import(
    `${VERIFIER_URL.href}?case=${encodeURIComponent(crypto.randomUUID())}`
  );
  assert.equal(typeof verifySensorPolicy, 'function');
  return verifySensorPolicy(fixture);
}

function errorsByCode(result, code) {
  return result.errors.filter((error) => error.code === code);
}

function assertFailure(result) {
  assert.equal(result.ok, false);
  assert.ok(Array.isArray(result.errors));
  assert.ok(result.errors.length > 0);
}

async function withCopiedFixtures(fixture, run) {
  const directory = await mkdtemp(join(tmpdir(), 'detran-sensor-policy-'));
  const paths = {
    registry: join(directory, 'sensor-registry.json'),
    presets: join(directory, 'sense-presets.json'),
    schema: join(directory, 'sensor-reading.schema.json'),
  };

  try {
    await Promise.all(
      Object.entries(paths).map(([name, path]) =>
        writeFile(path, `${JSON.stringify(fixture[name])}\n`, 'utf8'),
      ),
    );
    return await run(paths);
  } finally {
    await rm(directory, { force: true, recursive: true });
  }
}

test('dado fixture coerente quando a política é verificada então passa com populações 4 12 20 e 49', async () => {
  const result = await verify(coherentFixture(await installedFixtures()));

  assert.deepEqual(result, {
    ok: true,
    errors: [],
    counts: {
      baseline: 4,
      structural: 12,
      governed: 20,
      sweep: 49,
    },
  });
});

test('dado enum congelado incompleto quando a política é verificada então relata os quatro kinds ausentes na ordem do registry', async () => {
  const result = await verify(frozenIncompleteEnum(await installedFixtures()));

  assertFailure(result);
  assert.deepEqual(
    errorsByCode(result, 'SENSOR_KIND_NOT_IN_SCHEMA').map(
      (error) => error.kind,
    ),
    MISSING_SCHEMA_KINDS,
  );
});

test('dado kind selecionado sem enum quando a política é verificada então relata SENSOR_KIND_NOT_IN_SCHEMA', async () => {
  const fixture = coherentFixture(await installedFixtures());
  schemaEnum(fixture.schema).splice(
    schemaEnum(fixture.schema).indexOf('lint'),
    1,
  );

  const result = await verify(fixture);

  assertFailure(result);
  assert.deepEqual(
    errorsByCode(result, 'SENSOR_KIND_NOT_IN_SCHEMA').map(
      (error) => error.kind,
    ),
    ['lint'],
  );
});

test('dado membro de preset omitido quando a política é verificada então falha fechada', async () => {
  const fixture = coherentFixture(await installedFixtures());
  fixture.presets.presets.find(({ name }) => name === 'governed').members.pop();

  assertFailure(await verify(fixture));
});

test('dado sweep com ordem trocada quando a política é verificada então falha fechada', async () => {
  const fixture = coherentFixture(await installedFixtures());
  const sweep = fixture.presets.presets.find(({ name }) => name === 'sweep');
  [sweep.members[0], sweep.members[1]] = [sweep.members[1], sweep.members[0]];

  assertFailure(await verify(fixture));
});

test('dado kind duplicado no preset quando a política é verificada então falha fechada', async () => {
  const fixture = coherentFixture(await installedFixtures());
  const baseline = fixture.presets.presets.find(
    ({ name }) => name === 'baseline',
  );
  baseline.members.push(baseline.members[0]);

  assertFailure(await verify(fixture));
});

test('dado kind duplicado no enum quando a política é verificada então falha fechada', async () => {
  const fixture = coherentFixture(await installedFixtures());
  schemaEnum(fixture.schema).push('lint');

  assertFailure(await verify(fixture));
});

test('dado exclusão de sweep errada quando a política é verificada então falha fechada', async () => {
  const fixture = coherentFixture(await installedFixtures());
  const sweep = fixture.presets.presets.find(({ name }) => name === 'sweep');
  sweep.excluded.pop();

  assertFailure(await verify(fixture));
});

test('dado fonte ausente ou malformada quando a política é verificada então falha fechada', async () => {
  const source = coherentFixture(await installedFixtures());

  for (const fixture of [
    { ...source, registry: null },
    { ...source, presets: { presets: 'malformed' } },
    { ...source, schema: { properties: {} } },
  ]) {
    assertFailure(await verify(fixture));
  }
});

test('dado população baseline incompatível quando a política é verificada então falha fechada', async () => {
  const fixture = coherentFixture(await installedFixtures());
  fixture.presets.presets
    .find(({ name }) => name === 'baseline')
    .members.splice(0, 1);

  assertFailure(await verify(fixture));
});

test('dado população structural incompatível quando a política é verificada então falha fechada', async () => {
  const fixture = coherentFixture(await installedFixtures());
  fixture.presets.presets
    .find(({ name }) => name === 'structural')
    .members.splice(0, 1);

  assertFailure(await verify(fixture));
});

test('dado população governed incompatível quando a política é verificada então falha fechada', async () => {
  const fixture = coherentFixture(await installedFixtures());
  fixture.presets.presets
    .find(({ name }) => name === 'governed')
    .members.splice(0, 1);

  assertFailure(await verify(fixture));
});

test('dado cópias coerentes das fontes quando a CLI é executada então imprime JSON PASS sem escrever nas fontes', async () => {
  const fixture = coherentFixture(await installedFixtures());
  await verify(fixture);

  await withCopiedFixtures(fixture, async (paths) => {
    const result = spawnSync(
      process.execPath,
      [
        CLI_PATH,
        '--registry',
        paths.registry,
        '--presets',
        paths.presets,
        '--schema',
        paths.schema,
      ],
      { encoding: 'utf8' },
    );

    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(JSON.parse(result.stdout), {
      ok: true,
      errors: [],
      counts: {
        baseline: 4,
        structural: 12,
        governed: 20,
        sweep: 49,
      },
    });
  });
});

test('dado cópias com enum congelado incompleto quando a CLI é executada então imprime diagnóstico e sai 1', async () => {
  const fixture = frozenIncompleteEnum(await installedFixtures());
  await verify(fixture);

  await withCopiedFixtures(fixture, async (paths) => {
    const result = spawnSync(
      process.execPath,
      [
        CLI_PATH,
        '--registry',
        paths.registry,
        '--presets',
        paths.presets,
        '--schema',
        paths.schema,
      ],
      { encoding: 'utf8' },
    );

    assert.equal(result.status, 1, result.stderr);
    assert.deepEqual(
      JSON.parse(result.stdout)
        .errors.filter(({ code }) => code === 'SENSOR_KIND_NOT_IN_SCHEMA')
        .map(({ kind }) => kind),
      MISSING_SCHEMA_KINDS,
    );
  });
});
