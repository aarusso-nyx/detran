import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import test from 'node:test';

const exec = promisify(execFile);
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const fixture = join(root, 'tools/parameters/fixtures/minimal-catalogue.txt');
const generator = join(root, 'tools/parameters/generate-seed.mjs');
const verifier = join(root, 'tools/parameters/verify.mjs');

async function run(script, args = []) {
  try {
    const result = await exec(process.execPath, [script, ...args], {
      cwd: root,
      env: { ...process.env, NODE_ENV: 'test' },
    });
    return { status: 0, stdout: result.stdout, stderr: result.stderr };
  } catch (error) {
    return {
      status: typeof error.code === 'number' ? error.code : 1,
      stdout: error.stdout ?? '',
      stderr: error.stderr ?? String(error),
    };
  }
}

async function temporarySource(mutator = (value) => value) {
  const directory = await mkdtemp('/tmp/detran-parameter-');
  const source = join(directory, 'catalogue.md');
  const original = await readFile(fixture, 'utf8');
  await writeFile(source, mutator(original), 'utf8');
  return { directory, source };
}

test('dado catálogo mínimo válido quando gerar então produz os três artefatos tipados', async () => {
  const temporary = await temporarySource();
  const output = join(temporary.directory, 'out');
  try {
    const result = await run(generator, [
      '--source',
      temporary.source,
      '--out-dir',
      output,
    ]);
    assert.equal(result.status, 0, result.stderr);
    const seed = await readFile(join(output, '05-parameters.sql'), 'utf8');
    const catalogue = await readFile(
      join(output, 'parameter-catalogue.ts'),
      'utf8',
    );
    const flags = await readFile(join(output, 'parameter-flags.ts'), 'utf8');
    assert.match(seed, /rait\.pool\.limit/);
    assert.match(seed, /source_pending/);
    assert.match(seed, /'rait\.legal\.deadline'.*false, true, 'DT-110'/);
    assert.match(seed, /ARCH-PARAMETER-CATALOGUE/);
    assert.match(catalogue, /value_json/);
    assert.match(catalogue, /sha256/i);
    assert.match(flags, /teat\.speed_meters/);
    assert.doesNotMatch(flags, /rait\.pool\.limit|deadline\.T-VOTO/);
    assert.match(catalogue, /rait\.pool\.limit|teat\.speed_meters/);
    assert.match(
      catalogue,
      /source_pending|legal_readonly|decision_ref|value_type|sha256/i,
    );
    assert.match(
      catalogue,
      /key: 'rait\.legal\.deadline'[\s\S]*legal_readonly: true/,
    );
    const verified = await run(verifier, [
      '--check-generated',
      '--source',
      temporary.source,
      '--generated-root',
      output,
    ]);
    assert.equal(verified.status, 0, verified.stderr);
  } finally {
    await rm(temporary.directory, { recursive: true, force: true });
  }
});

test('dado pipe escapado em célula quando gerar então remove a barra sem criar coluna', async () => {
  const temporary = await temporarySource((value) =>
    value.replace('| worklist |', '| worklist \\| queue |'),
  );
  const output = join(temporary.directory, 'out');
  try {
    const result = await run(generator, [
      '--source',
      temporary.source,
      '--out-dir',
      output,
    ]);
    assert.equal(result.status, 0, result.stderr);
    assert.match(
      await readFile(join(output, 'parameter-catalogue.ts'), 'utf8'),
      /consumer: 'worklist \| queue'/,
    );
  } finally {
    await rm(temporary.directory, { recursive: true, force: true });
  }
});

test('dado parâmetro legal booleano quando gerar então não o expõe como flag editável', async () => {
  const temporary = await temporarySource((value) =>
    value.replace(
      '| `rait.legal.deadline` | N | 30 |',
      '| `rait.legal.deadline` | F | true |',
    ),
  );
  const output = join(temporary.directory, 'out');
  try {
    const result = await run(generator, [
      '--source',
      temporary.source,
      '--out-dir',
      output,
    ]);
    assert.equal(result.status, 0, result.stderr);
    assert.doesNotMatch(
      await readFile(join(output, 'parameter-flags.ts'), 'utf8'),
      /rait\.legal\.deadline/,
    );
  } finally {
    await rm(temporary.directory, { recursive: true, force: true });
  }
});

test('dado a mesma fonte quando gerar duas vezes então as saídas são byte a byte iguais', async () => {
  const temporary = await temporarySource();
  const first = join(temporary.directory, 'first');
  const second = join(temporary.directory, 'second');
  try {
    const firstResult = await run(generator, [
      '--source',
      temporary.source,
      '--out-dir',
      first,
    ]);
    const secondResult = await run(generator, [
      '--source',
      temporary.source,
      '--out-dir',
      second,
    ]);
    assert.equal(firstResult.status, 0, firstResult.stderr);
    assert.equal(secondResult.status, 0, secondResult.stderr);
    for (const file of [
      '05-parameters.sql',
      'parameter-catalogue.ts',
      'parameter-flags.ts',
    ]) {
      assert.deepEqual(
        await readFile(join(first, file)),
        await readFile(join(second, file)),
      );
    }
  } finally {
    await rm(temporary.directory, { recursive: true, force: true });
  }
});

test('dado fonte alterada quando gerar então muda o hash e somente a linha afetada', async () => {
  const baseline = await temporarySource();
  const changed = await temporarySource((value) =>
    value.replace('| 12 |', '| 13 |'),
  );
  const baselineOutput = join(baseline.directory, 'out');
  const changedOutput = join(changed.directory, 'out');
  try {
    const baselineResult = await run(generator, [
      '--source',
      baseline.source,
      '--out-dir',
      baselineOutput,
    ]);
    const changedResult = await run(generator, [
      '--source',
      changed.source,
      '--out-dir',
      changedOutput,
    ]);
    assert.equal(baselineResult.status, 0, baselineResult.stderr);
    assert.equal(changedResult.status, 0, changedResult.stderr);
    const before = await readFile(
      join(baselineOutput, '05-parameters.sql'),
      'utf8',
    );
    const after = await readFile(
      join(changedOutput, '05-parameters.sql'),
      'utf8',
    );
    const beforeHeader = before.split('\n').slice(0, 3).join('\n');
    const afterHeader = after.split('\n').slice(0, 3).join('\n');
    assert.notEqual(afterHeader, beforeHeader);
    const beforeRows = before
      .split('\n')
      .filter((line) => line.includes('rait.pool.limit'));
    const afterRows = after
      .split('\n')
      .filter((line) => line.includes('rait.pool.limit'));
    assert.notDeepEqual(afterRows, beforeRows);
    assert.equal(
      after.split('\n').filter((line) => line.includes('teat.speed_meters'))
        .length,
      before.split('\n').filter((line) => line.includes('teat.speed_meters'))
        .length,
    );
  } finally {
    await rm(baseline.directory, { recursive: true, force: true });
    await rm(changed.directory, { recursive: true, force: true });
  }
});

const invalidCases = [
  ['header incorreto', (value) => value.replace('Chave | Tipo', 'Key | Tipo')],
  [
    'célula ausente',
    (value) => value.replace('| 12 | vigente |', '|  | vigente |'),
  ],
  [
    'chave duplicada',
    (value) => value.replace('`teat.speed_meters`', '`rait.pool.limit`'),
  ],
  [
    'status inválido',
    (value) => value.replace('| vigente | não |', '| invalid | não |'),
  ],
  [
    'pend typo no',
    (value) => value.replace('| proposta | sim |', '| proposta | no |'),
  ],
  [
    'flag não booleana',
    (value) => value.replace('| false | vigente |', '| enabled | vigente |'),
  ],
  [
    'travessão sem pending',
    (value) => value.replace('| 12 | vigente |', '| — | vigente |'),
  ],
  ['decision ref órfã', (value) => value.replace('| OD-001 |', '| IND-001 |')],
  [
    'prefixo incompatível',
    (value) => value.replace('`teat.speed_meters`', '`portal.speed_meters`'),
  ],
];

for (const [name, mutator] of invalidCases) {
  test(`dado ${name} quando gerar então termina com exit 1 e diagnóstico`, async () => {
    const temporary = await temporarySource(mutator);
    try {
      const result = await run(generator, [
        '--source',
        temporary.source,
        '--out-dir',
        join(temporary.directory, 'out'),
      ]);
      assert.equal(result.status, 1);
      assert.match(
        `${result.stdout}\n${result.stderr}`,
        /catalogue\.md|linha|line|Chave|key|duplicate|duplicad|status|prefix/i,
      );
    } finally {
      await rm(temporary.directory, { recursive: true, force: true });
    }
  });
}

test('dado artefato gerado stale quando verificar então falha fechado', async () => {
  const temporary = await temporarySource();
  const generatedRoot = join(temporary.directory, 'generated');
  const stalePath = join(generatedRoot, 'parameter-flags.ts');
  try {
    const generated = await run(generator, [
      '--source',
      temporary.source,
      '--out-dir',
      generatedRoot,
    ]);
    assert.equal(generated.status, 0, generated.stderr);
    await writeFile(
      stalePath,
      `${await readFile(stalePath, 'utf8')}\n// deliberately stale\n`,
      'utf8',
    );

    const result = await run(verifier, [
      '--check-generated',
      '--source',
      temporary.source,
      '--generated-root',
      generatedRoot,
    ]);
    const diagnostic = `${result.stdout}\n${result.stderr}`;
    assert.equal(result.status, 1, diagnostic);
    assert.match(diagnostic, /generated stale/i);
    assert.ok(
      diagnostic.includes(stalePath),
      `expected stale diagnostic for ${stalePath}; received:\n${diagnostic}`,
    );
  } finally {
    await rm(temporary.directory, { recursive: true, force: true });
  }
});

test('dado chave literal conhecida e desconhecida quando verificar uso então aplica regra de pontos', async () => {
  const known = await temporarySource(
    () => "const key = 'teat.speed_meters';\n",
  );
  const unknown = await temporarySource(
    () => "const key = 'teat.unknown.threshold';\n",
  );
  try {
    const knownResult = await run(verifier, [
      '--check-usage',
      '--source',
      known.source,
    ]);
    assert.equal(knownResult.status, 0, knownResult.stderr);
    assert.equal(
      (await run(verifier, ['--check-usage', '--source', unknown.source]))
        .status,
      1,
    );
  } finally {
    await rm(known.directory, { recursive: true, force: true });
    await rm(unknown.directory, { recursive: true, force: true });
  }
});

test('dado literais em tests, dist e node_modules quando verificar uso então são ignorados', async () => {
  const directory = await mkdtemp('/tmp/detran-parameter-usage-');
  try {
    await writeFile(
      join(directory, 'normal.ts'),
      "const key = 'teat.unknown.threshold';\n",
    );
    for (const ignored of ['tests', 'dist', 'node_modules']) {
      await mkdir(join(directory, ignored));
      await writeFile(
        join(directory, ignored, 'ignored.ts'),
        "const key = 'teat.unknown.threshold';\n",
      );
    }
    const result = await run(verifier, [
      '--check-usage',
      '--source',
      directory,
    ]);
    assert.equal(result.status, 1);
    assert.match(
      `${result.stdout}\n${result.stderr}`,
      /normal\.ts|teat\.unknown\.threshold/,
    );
    assert.doesNotMatch(`${result.stdout}\n${result.stderr}`, /ignored\.ts/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
