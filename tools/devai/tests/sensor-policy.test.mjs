import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
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

function assertErrorCode(result, code) {
  assert.ok(
    errorsByCode(result, code).length > 0,
    `Expected ${code}, received ${result.errors.map(({ code: value }) => value).join(', ')}.`,
  );
}

function assertMissingSchemaKinds(result, fixture, expectedKinds) {
  const missing = errorsByCode(result, 'SENSOR_KIND_NOT_IN_SCHEMA');
  const registry = expectedKinds.map(
    (kind) =>
      `registry.entries[${fixture.registry.entries.findIndex((entry) => entry.kind === kind)}]`,
  );

  assert.deepEqual(
    missing.map(({ kind }) => kind),
    expectedKinds,
  );
  for (const [index, error] of missing.entries()) {
    assert.equal(error.path, 'schema.properties.sensor.properties.kind.enum');
    assert.equal(error.registryPath, registry[index]);
    assert.deepEqual(error.presets, ['sweep']);
  }
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

function runCli(args, path = CLI_PATH) {
  return spawnSync(process.execPath, [path, ...args], { encoding: 'utf8' });
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
  const fixture = frozenIncompleteEnum(await installedFixtures());
  const result = await verify(fixture);

  assertFailure(result);
  assertMissingSchemaKinds(result, fixture, MISSING_SCHEMA_KINDS);
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
  const missing = errorsByCode(result, 'SENSOR_KIND_NOT_IN_SCHEMA')[0];
  assert.equal(missing.registryPath, 'registry.entries[1]');
  assert.deepEqual(missing.presets, [
    'baseline',
    'structural',
    'governed',
    'sweep',
  ]);
});

test('dado membro de preset omitido quando a política é verificada então relata contagem e população inválidas', async () => {
  const fixture = coherentFixture(await installedFixtures());
  fixture.presets.presets.find(({ name }) => name === 'governed').members.pop();

  const result = await verify(fixture);
  assertFailure(result);
  assertErrorCode(result, 'SENSOR_PRESET_COUNT_INVALID');
  assertErrorCode(result, 'SENSOR_PRESET_MEMBERS_INVALID');
});

test('dado sweep com ordem trocada quando a política é verificada então relata SENSOR_SWEEP_MEMBERS_INVALID', async () => {
  const fixture = coherentFixture(await installedFixtures());
  const sweep = fixture.presets.presets.find(({ name }) => name === 'sweep');
  [sweep.members[0], sweep.members[1]] = [sweep.members[1], sweep.members[0]];

  const result = await verify(fixture);
  assertFailure(result);
  assertErrorCode(result, 'SENSOR_SWEEP_MEMBERS_INVALID');
});

test('dado kind duplicado no preset quando a política é verificada então relata SENSOR_PRESET_MEMBER_DUPLICATE', async () => {
  const fixture = coherentFixture(await installedFixtures());
  const baseline = fixture.presets.presets.find(
    ({ name }) => name === 'baseline',
  );
  baseline.members.push(baseline.members[0]);

  const result = await verify(fixture);
  assertFailure(result);
  assertErrorCode(result, 'SENSOR_PRESET_MEMBER_DUPLICATE');
});

test('dado kind duplicado no enum quando a política é verificada então relata SENSOR_SCHEMA_KIND_DUPLICATE', async () => {
  const fixture = coherentFixture(await installedFixtures());
  schemaEnum(fixture.schema).push('lint');

  const result = await verify(fixture);
  assertFailure(result);
  assertErrorCode(result, 'SENSOR_SCHEMA_KIND_DUPLICATE');
});

test('dado exclusão de sweep errada quando a política é verificada então relata população e sequência inválidas', async () => {
  const fixture = coherentFixture(await installedFixtures());
  const sweep = fixture.presets.presets.find(({ name }) => name === 'sweep');
  sweep.excluded.pop();

  const result = await verify(fixture);
  assertFailure(result);
  assertErrorCode(result, 'SENSOR_SWEEP_EXCLUDED_COUNT_INVALID');
  assertErrorCode(result, 'SENSOR_SWEEP_EXCLUDED_INVALID');
});

test('dado fonte ausente ou malformada quando a política é verificada então relata SENSOR_POLICY_SOURCE_MALFORMED', async () => {
  const source = coherentFixture(await installedFixtures());

  for (const [fixture, path] of [
    [{ ...source, registry: null }, 'registry.entries'],
    [{ ...source, presets: { presets: 'malformed' } }, 'presets.presets'],
    [
      { ...source, schema: { properties: {} } },
      'schema.properties.sensor.properties.kind.enum',
    ],
  ]) {
    const result = await verify(fixture);
    assertFailure(result);
    assert.deepEqual(errorsByCode(result, 'SENSOR_POLICY_SOURCE_MALFORMED'), [
      {
        code: 'SENSOR_POLICY_SOURCE_MALFORMED',
        path,
        message:
          path === 'registry.entries'
            ? 'Registry must contain an entries array.'
            : path === 'presets.presets'
              ? 'Presets must contain a presets array.'
              : 'Schema must contain a string enum for SensorReading.sensor.kind.',
      },
    ]);
  }
});

test('dado população baseline incompatível quando a política é verificada então relata códigos de contagem e tier', async () => {
  const fixture = coherentFixture(await installedFixtures());
  fixture.presets.presets
    .find(({ name }) => name === 'baseline')
    .members.splice(0, 1);

  const result = await verify(fixture);
  assertFailure(result);
  assertErrorCode(result, 'SENSOR_PRESET_COUNT_INVALID');
  assertErrorCode(result, 'SENSOR_PRESET_MEMBERS_INVALID');
});

test('dado população structural incompatível quando a política é verificada então relata códigos de contagem e tier', async () => {
  const fixture = coherentFixture(await installedFixtures());
  fixture.presets.presets
    .find(({ name }) => name === 'structural')
    .members.splice(0, 1);

  const result = await verify(fixture);
  assertFailure(result);
  assertErrorCode(result, 'SENSOR_PRESET_COUNT_INVALID');
  assertErrorCode(result, 'SENSOR_PRESET_MEMBERS_INVALID');
});

test('dado população governed incompatível quando a política é verificada então relata códigos de contagem e tier', async () => {
  const fixture = coherentFixture(await installedFixtures());
  fixture.presets.presets
    .find(({ name }) => name === 'governed')
    .members.splice(0, 1);

  const result = await verify(fixture);
  assertFailure(result);
  assertErrorCode(result, 'SENSOR_PRESET_COUNT_INVALID');
  assertErrorCode(result, 'SENSOR_PRESET_MEMBERS_INVALID');
});

test('dado kind duplicado no registry quando a política é verificada então relata SENSOR_REGISTRY_KIND_DUPLICATE', async () => {
  const fixture = coherentFixture(await installedFixtures());
  fixture.registry.entries.push(clone(fixture.registry.entries[0]));

  const result = await verify(fixture);
  assertFailure(result);
  assertErrorCode(result, 'SENSOR_REGISTRY_KIND_DUPLICATE');
});

test('dado preset obrigatório ausente quando a política é verificada então relata SENSOR_PRESET_POPULATION_INVALID', async () => {
  const fixture = coherentFixture(await installedFixtures());
  fixture.presets.presets = fixture.presets.presets.filter(
    ({ name }) => name !== 'governed',
  );

  const result = await verify(fixture);
  assertFailure(result);
  assertErrorCode(result, 'SENSOR_PRESET_POPULATION_INVALID');
});

test('dado preset extra quando a política é verificada então relata SENSOR_PRESET_POPULATION_INVALID', async () => {
  const fixture = coherentFixture(await installedFixtures());
  fixture.presets.presets.push({
    name: 'future',
    members: [],
    excluded: [],
  });

  const result = await verify(fixture);
  assertFailure(result);
  assertErrorCode(result, 'SENSOR_PRESET_POPULATION_INVALID');
});

test('dado kind de preset fora do registry quando a política é verificada então relata SENSOR_PRESET_KIND_NOT_IN_REGISTRY', async () => {
  const fixture = coherentFixture(await installedFixtures());
  fixture.presets.presets
    .find(({ name }) => name === 'baseline')
    .members.push('not_registered');

  const result = await verify(fixture);
  assertFailure(result);
  assertErrorCode(result, 'SENSOR_PRESET_KIND_NOT_IN_REGISTRY');
});

test('dado sweep sem round obrigatório quando a política é verificada então relata SENSOR_SWEEP_ROUND_REQUIRED_INVALID', async () => {
  const fixture = coherentFixture(await installedFixtures());
  fixture.presets.presets.find(({ name }) => name === 'sweep').round_required =
    false;

  const result = await verify(fixture);
  assertFailure(result);
  assertErrorCode(result, 'SENSOR_SWEEP_ROUND_REQUIRED_INVALID');
});

test('dado registry e presets que crescem juntos quando a política é verificada então preserva as contagens contratuais fixas', async () => {
  const fixture = coherentFixture(await installedFixtures());
  const added = clone(fixture.registry.entries[0]);
  added.id = 'future_tier2_read';
  added.kind = 'future_tier2_read';
  added.effect = 'read';
  added.tiers = ['TIER2', 'SWEEP'];
  fixture.registry.entries.push(added);
  schemaEnum(fixture.schema).push(added.kind);
  for (const name of ['structural', 'governed', 'sweep']) {
    fixture.presets.presets
      .find((preset) => preset.name === name)
      .members.push(added.kind);
  }

  const result = await verify(fixture);
  assertFailure(result);
  assert.deepEqual(
    errorsByCode(result, 'SENSOR_PRESET_COUNT_INVALID').map(({ path }) => path),
    [
      'presets.structural.members',
      'presets.governed.members',
      'presets.sweep.members',
    ],
  );
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
    for (const error of JSON.parse(result.stdout).errors.filter(
      ({ code }) => code === 'SENSOR_KIND_NOT_IN_SCHEMA',
    )) {
      assert.match(error.registryPath, /^registry\.entries\[\d+\]$/);
      assert.deepEqual(error.presets, ['sweep']);
    }
  });
});

test('dado CLI invocada por symlink com fixture coerente quando executa o preflight então imprime PASS', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'detran-sensor-policy-link-'));
  const linkedCli = join(directory, 'verify-sensor-policy.mjs');
  const fixture = coherentFixture(await installedFixtures());

  try {
    await symlink(CLI_PATH, linkedCli);
    await withCopiedFixtures(fixture, async (paths) => {
      const result = runCli(
        [
          '--registry',
          paths.registry,
          '--presets',
          paths.presets,
          '--schema',
          paths.schema,
        ],
        linkedCli,
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
  } finally {
    await rm(directory, { force: true, recursive: true });
  }
});

test('dado overrides parciais quando a CLI é executada então sai 1 com SENSOR_POLICY_ARGUMENTS_INVALID', async () => {
  const fixture = coherentFixture(await installedFixtures());

  await withCopiedFixtures(fixture, async (paths) => {
    const result = runCli(['--schema', paths.schema]);

    assert.equal(result.status, 1, result.stderr);
    assert.deepEqual(JSON.parse(result.stdout).errors, [
      {
        code: 'SENSOR_POLICY_ARGUMENTS_INVALID',
        path: 'argv',
        message: 'Use --registry <path> --presets <path> --schema <path>.',
      },
    ]);
  });
});

test('dado nomes de override sem prefixo -- quando a CLI é executada então sai 1 com SENSOR_POLICY_ARGUMENTS_INVALID', async () => {
  const fixture = coherentFixture(await installedFixtures());

  await withCopiedFixtures(fixture, async (paths) => {
    const result = runCli([
      'xxregistry',
      paths.registry,
      'xxpresets',
      paths.presets,
      'xxschema',
      paths.schema,
    ]);

    assert.equal(result.status, 1, result.stderr);
    assert.deepEqual(JSON.parse(result.stdout).errors, [
      {
        code: 'SENSOR_POLICY_ARGUMENTS_INVALID',
        path: 'argv',
        message: 'Use --registry <path> --presets <path> --schema <path>.',
      },
    ]);
  });
});
