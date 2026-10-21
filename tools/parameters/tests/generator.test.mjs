import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import test from 'node:test';
import { parseCatalogue } from '../parser.mjs';

const exec = promisify(execFile);
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const fixture = join(root, 'tools/parameters/fixtures/minimal-catalogue.txt');
const generator = join(root, 'tools/parameters/generate-seed.mjs');
const verifier = join(root, 'tools/parameters/verify.mjs');
const approvedCatalogue = join(
  root,
  'docs/framework/arch/parameter-catalogue.md',
);

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

test('OD-T14 seed uses its first installation date and stays idempotent on later days', async () => {
  const key = 'teat.bootstrap.snapshot_max_age_seconds';
  const model = await parseCatalogue(approvedCatalogue);
  const rows = model.entries.filter((entry) => entry.key === key);
  assert.equal(
    rows.length,
    1,
    'approved catalogue must contain exactly one OD-T14 row',
  );
  assert.deepEqual(
    {
      surface: rows[0].surface,
      value_type: rows[0].value_type,
      value_json: rows[0].value_json,
      status: rows[0].status,
      source_pending: rows[0].source_pending,
      legal_readonly: rows[0].legal_readonly,
      decision_ref: rows[0].decision_ref,
      decision_tokens: rows[0].decision_tokens,
    },
    {
      surface: 'teat',
      value_type: 'int',
      value_json: 300,
      status: 'vigente',
      source_pending: false,
      legal_readonly: false,
      decision_ref: 'OD-T14',
      decision_tokens: ['OD-T14'],
    },
  );

  const directory = await mkdtemp('/tmp/detran-od-t14-');
  try {
    const generated = await run(generator, [
      '--source',
      approvedCatalogue,
      '--out-dir',
      directory,
    ]);
    assert.equal(generated.status, 0, generated.stderr);
    const seed = await readFile(join(directory, '05-parameters.sql'), 'utf8');
    const secondDirectory = join(directory, 'second-generation');
    const repeated = await run(generator, [
      '--source',
      approvedCatalogue,
      '--out-dir',
      secondDirectory,
    ]);
    assert.equal(repeated.status, 0, repeated.stderr);
    assert.equal(
      await readFile(join(secondDirectory, '05-parameters.sql'), 'utf8'),
      seed,
      'seed generation must be deterministic',
    );

    const rowPrefix =
      "('00000000-0000-7000-8000-00000000a001', NULL, 'tenant', 'teat', " +
      "'teat.bootstrap.snapshot_max_age_seconds', '300', 'int', 'vigente', false, false, " +
      "'OD-T14', NULL, 'ARCH-PARAMETER-CATALOGUE', 1, ";
    assert.equal(
      seed.split(rowPrefix).length - 1,
      1,
      'OD-T14 must produce exactly one correctly scoped seed row',
    );
    const rowTail = seed.slice(seed.indexOf(rowPrefix) + rowPrefix.length);
    const effectiveFrom = rowTail.match(
      /^([\s\S]*?),\s*'00000000-0000-4000-8000-0000b0000016'/,
    )?.[1];
    assert.ok(
      effectiveFrom,
      'OD-T14 row must have an effective_from expression',
    );
    assert.match(
      effectiveFrom,
      /\bCURRENT_DATE\b|\bCURRENT_TIMESTAMP\s*::\s*date\b|\bnow\(\)\s*::\s*date\b/i,
      'first installation must use its execution date, not a fixed decision date',
    );
    assert.doesNotMatch(
      effectiveFrom,
      /'2026-09-(?:13|23)'/,
      'OD-T14 must not be backdated or activated on a presumed decision date',
    );

    const hasSeedIdentity = (sql) =>
      /\btenant_id\b/i.test(sql) &&
      /\btraffic_agency_id\b\s+IS\s+NULL/i.test(sql) &&
      /\bscope\b\s*=\s*'tenant'/i.test(sql) &&
      /\bsurface\b\s*=\s*'teat'/i.test(sql) &&
      /\bkey\b\s*=\s*'teat\.bootstrap\.snapshot_max_age_seconds'/i.test(sql);
    const reusesFirstDate =
      /\bCOALESCE\s*\(/i.test(effectiveFrom) &&
      /\bSELECT\s+MIN\s*\(\s*(?:\w+\.)?effective_from\s*\)/i.test(
        effectiveFrom,
      ) &&
      /\bFROM\s+ops\.parameter\b/i.test(effectiveFrom) &&
      hasSeedIdentity(effectiveFrom) &&
      /\bON\s+CONFLICT\b/i.test(seed);
    const absentIdentityGuard = seed.match(
      /\bWHERE\s+NOT\s+EXISTS\s*\(([\s\S]*?)\)\s*(?:ON\s+CONFLICT|;)/i,
    )?.[1];
    const insertsOnlyOnce =
      absentIdentityGuard &&
      hasSeedIdentity(absentIdentityGuard) &&
      !/\beffective_from\b/i.test(absentIdentityGuard);
    assert.ok(
      reusesFirstDate || insertsOnlyOnce,
      'later-day reruns must preserve the first effective_from and avoid a second row for the same tenant/scope/surface/key',
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

const legalBases = {
  schemaVersion: 1,
  policyCode: 'ADR-0024-2026-09-16',
  basisRanks: { pcd: 2, age_80_plus: 2, age_60_plus: 1 },
  noneRank: 0,
  postProtocolRevision: 'forbidden',
};

function withLegalBases(value, defaultText = JSON.stringify(legalBases)) {
  const anchor =
    '| `rait.pool.limit` | N | 12 | vigente | não | não | OD-001 | worklist |';
  assert.ok(value.includes(anchor), 'minimal catalogue fixture changed');
  return value.replace(
    anchor,
    `${anchor}\n| \`rait.priority.legal_bases\` | json | \`${defaultText}\` | vigente | não | não | OD-016 | ordering |`,
  );
}

test('dado legal_bases JSON exato quando analisar então preserva objeto tipado, schema e proveniência', async () => {
  const temporary = await temporarySource(withLegalBases);
  try {
    const model = await parseCatalogue(temporary.source);
    const row = model.entries.find(
      (entry) => entry.key === 'rait.priority.legal_bases',
    );
    assert.ok(row, 'legal_bases row must be collected');
    assert.deepEqual(row.value_json, legalBases);
    assert.equal(row.value_type, 'json');
    assert.equal(row.status, 'vigente');
    assert.equal(row.source_pending, false);
    assert.equal(row.legal_readonly, false);
    assert.equal(row.decision_ref, 'OD-016');
    assert.deepEqual(row.decision_tokens, ['OD-016']);
    assert.equal(row.surface, 'rait');
    assert.equal(row.consumer, 'ordering');
    assert.equal(
      model.sourceHash,
      createHash('sha256')
        .update(await readFile(temporary.source))
        .digest('hex'),
    );
    const output = join(temporary.directory, 'out');
    const generated = await run(generator, [
      '--source',
      temporary.source,
      '--out-dir',
      output,
    ]);
    assert.equal(generated.status, 0, generated.stderr);
    const seed = await readFile(join(output, '05-parameters.sql'), 'utf8');
    assert.ok(
      seed.includes(
        `'rait.priority.legal_bases', '${JSON.stringify(legalBases)}'`,
      ),
      'seed must contain a JSON object value rather than a JSON string',
    );
    const catalogue = await readFile(
      join(output, 'parameter-catalogue.ts'),
      'utf8',
    );
    assert.match(
      catalogue,
      /key: 'rait\.priority\.legal_bases',[\s\S]*?value_json: \{/,
    );
  } finally {
    await rm(temporary.directory, { recursive: true, force: true });
  }
});

for (const [name, defaultText] of [
  ['JSON malformado', '{"schemaVersion":1,'],
  ['array em vez de objeto', '[]'],
  ['string em vez de objeto', '"not an object"'],
  ['objeto sem campos obrigatórios', '{}'],
  [
    'rank ou política divergente',
    JSON.stringify({
      ...legalBases,
      basisRanks: { ...legalBases.basisRanks, pcd: 1 },
    }),
  ],
  [
    'campo extra não autorizado',
    JSON.stringify({ ...legalBases, allowRevision: true }),
  ],
]) {
  test(`dado legal_bases com ${name} quando analisar então rejeita a linha`, async () => {
    const temporary = await temporarySource((value) =>
      withLegalBases(value, defaultText),
    );
    try {
      await assert.rejects(
        parseCatalogue(temporary.source),
        (error) =>
          error.message.includes(temporary.source) &&
          error.message.includes('rait.priority.legal_bases'),
      );
    } finally {
      await rm(temporary.directory, { recursive: true, force: true });
    }
  });
}

test('dado legal_bases acrescentada quando gerar então defaults e metadados das demais chaves permanecem', async () => {
  const baseline = await temporarySource();
  const augmented = await temporarySource((value) =>
    withLegalBases(
      value.replace(
        '| `rait.source.pending` | S |',
        '| `rait.signing.schedule` | json | 50/75/90 % | vigente | não | não | OD-006 | radar |\n| `rait.source.pending` | S |',
      ),
    ),
  );
  try {
    const before = await parseCatalogue(baseline.source);
    const after = await parseCatalogue(augmented.source);
    for (const entry of before.entries) {
      const counterpart = after.entries.find((row) => row.key === entry.key);
      assert.ok(counterpart, `missing preserved key ${entry.key}`);
      const { line: _beforeLine, ...beforeSemantics } = entry;
      const { line: _afterLine, ...afterSemantics } = counterpart;
      assert.deepEqual(afterSemantics, beforeSemantics);
    }
    assert.equal(
      after.entries.find((entry) => entry.key === 'rait.signing.schedule')
        ?.value_json,
      '50/75/90 %',
    );
    assert.equal(
      after.entries.find((entry) => entry.key === 'rait.pool.limit')
        ?.value_json,
      12,
    );
    assert.equal(
      after.entries.find((entry) => entry.key === 'teat.speed_meters')
        ?.value_json,
      false,
    );
    assert.equal(
      after.entries.find((entry) => entry.key === 'portal.card_payment')
        ?.value_json,
      'off',
    );
    assert.equal(
      after.entries.find((entry) => entry.key === 'rait.source.pending')
        ?.value_json,
      null,
    );
    const baselineOutput = join(baseline.directory, 'out');
    const augmentedOutput = join(augmented.directory, 'out');
    for (const [source, output] of [
      [baseline.source, baselineOutput],
      [augmented.source, augmentedOutput],
    ]) {
      const result = await run(generator, [
        '--source',
        source,
        '--out-dir',
        output,
      ]);
      assert.equal(result.status, 0, result.stderr);
    }
    const beforeSeed = await readFile(
      join(baselineOutput, '05-parameters.sql'),
      'utf8',
    );
    const afterSeed = await readFile(
      join(augmentedOutput, '05-parameters.sql'),
      'utf8',
    );
    for (const entry of before.entries) {
      const beforeLine = beforeSeed
        .split('\n')
        .find((line) => line.includes(`'${entry.key}'`));
      const afterLine = afterSeed
        .split('\n')
        .find((line) => line.includes(`'${entry.key}'`));
      assert.ok(beforeLine, `missing original seed row ${entry.key}`);
      assert.equal(afterLine, beforeLine, `seed row changed for ${entry.key}`);
    }
  } finally {
    await rm(baseline.directory, { recursive: true, force: true });
    await rm(augmented.directory, { recursive: true, force: true });
  }
});

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

test('dado literais de parâmetro, evento e i18n quando verificar uso então classifica pelo contexto sintático', async () => {
  const directory = await mkdtemp('/tmp/detran-parameter-context-');
  try {
    await writeFile(
      join(directory, 'parameter.ts'),
      "const key = 'teat.unknown.threshold';\n",
    );
    await writeFile(
      join(directory, 'events.ts'),
      [
        "const event = { type: 'rait.case.changed' };",
        "if (event.type === 'rait.assignment.changed') void event;",
        "const externalEvent = { type: 'teat.case.changed' };",
        'function emit(eventType) { return eventType; }',
        "emit('rait.session.changed');",
        "class Port { transition(topic) { return topic; } call() { return this.transition('rait.case.scheduled'); } }",
        'const effects = { events: [], audits: [] };',
        "effects.events.push('rait.batch.changed', 'rait.assignment.changed');",
        "effects.audits.push('rait.minutes.published');",
        '',
      ].join('\n'),
    );
    await writeFile(
      join(directory, 'i18n.ts'),
      "const error = { messageKey: 'rait.errors.forbidden_action' };\n",
    );

    const result = await run(verifier, [
      '--check-usage',
      '--source',
      directory,
    ]);
    const diagnostic = `${result.stdout}\n${result.stderr}`;

    assert.equal(result.status, 1, diagnostic);
    assert.match(diagnostic, /parameter\.ts.*teat\.unknown\.threshold/);
    assert.doesNotMatch(
      diagnostic,
      /rait\.case\.changed|rait\.assignment\.changed|teat\.case\.changed|rait\.session\.changed|rait\.case\.scheduled|rait\.batch\.changed|rait\.minutes\.published/,
    );
    assert.doesNotMatch(diagnostic, /rait\.errors\.forbidden_action/);
  } finally {
    await rm(directory, { recursive: true, force: true });
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

// S2-R2: canonical catalogue values are typed objects; proposal is not activation.
for (const clockCode of ['A', 'B', 'C', 'D']) {
  test(`S2-R2 ladder ${clockCode} is a typed exact source object with preserved status`, async () => {
    const model = await parseCatalogue(approvedCatalogue);
    const rows = model.entries.filter(
      (row) => row.key === `rait.ladder.${clockCode}`,
    );
    assert.equal(rows.length, 1);
    const row = rows[0];
    assert.equal(typeof row.value_json, 'object');
    assert.notEqual(row.value_json, null);
    assert.deepEqual(Object.keys(row.value_json).sort(), [
      'clockCode',
      'schemaVersion',
      'sourceRef',
      'tracks',
      'unit',
    ]);
    assert.equal(row.value_json.schemaVersion, 1);
    assert.equal(row.value_json.clockCode, clockCode);
    assert.equal(
      row.status,
      ['A', 'C'].includes(clockCode) ? 'proposta' : 'vigente',
    );
    const expected = {
      A: [
        'days',
        [
          [
            180,
            [
              ['ALERTA_N1', 90],
              ['ALERTA_N2', 135],
              ['CRITICO', 162],
            ],
          ],
          [
            360,
            [
              ['ALERTA_N1', 180],
              ['ALERTA_N2', 270],
              ['CRITICO', 324],
            ],
          ],
        ],
        'WF-RAIT-002#4.3',
      ],
      B: [
        'months',
        [
          [
            24,
            [
              ['ALERTA_N1', 12],
              ['ALERTA_N2', 18],
              ['ALERTA_N3', 21],
              ['CRITICO', 23],
            ],
          ],
        ],
        'WF-RAIT-002#4.1',
      ],
      C: [
        'months',
        [
          [
            36,
            [
              ['ALERTA_N2', 24],
              ['ALERTA_N3', 30],
              ['CRITICO', 33],
            ],
          ],
        ],
        'WF-RAIT-002#4.2',
      ],
      D: [
        'months',
        [
          [
            60,
            [
              ['ALERTA_N1', 30],
              ['ALERTA_N2', 45],
              ['CRITICO', 54],
            ],
          ],
        ],
        'DT-030',
      ],
    }[clockCode];
    assert.deepEqual(row.value_json, {
      schemaVersion: 1,
      clockCode,
      unit: expected[0],
      tracks: expected[1].map(([ceiling, steps]) => ({
        ceiling,
        steps: steps.map(([flag, after]) => ({ flag, after })),
      })),
      sourceRef: expected[2],
    });
  });
}

const invalidS2Ladders = [
  ['malformed JSON', () => '{broken'],
  ['array', () => []],
  ['string payload', (value) => JSON.stringify(value)],
  ['extra field', (value) => ({ ...value, active: true })],
  ['schema version', (value) => ({ ...value, schemaVersion: 2 })],
  ['wrong clock', (value) => ({ ...value, clockCode: 'D' })],
  ['wrong unit', (value) => ({ ...value, unit: 'months' })],
  ['missing source', (value) => ({ ...value, sourceRef: '' })],
  [
    'duplicate track',
    (value) => ({ ...value, tracks: [...value.tracks, value.tracks[0]] }),
  ],
  [
    'invented A N3',
    (value) => ({
      ...value,
      tracks: [
        {
          ...value.tracks[0],
          steps: [...value.tracks[0].steps, { flag: 'ALERTA_N3', after: 150 }],
        },
        value.tracks[1],
      ],
    }),
  ],
  [
    'changed threshold',
    (value) => ({
      ...value,
      tracks: [{ ...value.tracks[0], ceiling: 181 }, value.tracks[1]],
    }),
  ],
  [
    'step extra field',
    (value) => ({
      ...value,
      tracks: [
        {
          ...value.tracks[0],
          steps: [
            { ...value.tracks[0].steps[0], guess: true },
            ...value.tracks[0].steps.slice(1),
          ],
        },
        value.tracks[1],
      ],
    }),
  ],
];
for (const [label, mutate] of invalidS2Ladders) {
  test(`S2-R2 rejects ${label} for exact ladder key`, async () => {
    const text = await readFile(approvedCatalogue, 'utf8');
    const line = text
      .split('\n')
      .find((value) => value.includes('`rait.ladder.A`'));
    assert.ok(line);
    const raw = line
      .split('|')[3]
      .trim()
      .replace(/^`|`$/g, '')
      .replaceAll('\\"', '"');
    const value = mutate(JSON.parse(raw));
    const encoded = label === 'malformed JSON' ? value : JSON.stringify(value);
    const directory = await mkdtemp('/tmp/detran-s2-ladder-');
    try {
      const source = join(directory, 'catalogue.md');
      const cells = line.split('|');
      cells[3] = ` \`${encoded}\` `;
      await writeFile(source, text.replace(line, cells.join('|')));
      await assert.rejects(parseCatalogue(source), /rait\.ladder\.A/);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
}

test('S2-R2 unrelated JSON key retains pre-S2 string semantics and other defaults are identical', async () => {
  const text = await readFile(approvedCatalogue, 'utf8');
  const directory = await mkdtemp('/tmp/detran-s2-unrelated-');
  try {
    const source = join(directory, 'catalogue.md');
    await writeFile(
      source,
      text.replace('`rait.ladder.A`', '`rait.fixture.json_default`'),
    );
    const original = await parseCatalogue(approvedCatalogue);
    const changed = await parseCatalogue(source);
    const unrelated = changed.entries.find(
      (row) => row.key === 'rait.fixture.json_default',
    );
    assert.equal(typeof unrelated.value_json, 'string');
    assert.deepEqual(JSON.parse(unrelated.value_json), {
      schemaVersion: 1,
      clockCode: 'A',
      unit: 'days',
      tracks: [
        {
          ceiling: 180,
          steps: [
            { flag: 'ALERTA_N1', after: 90 },
            { flag: 'ALERTA_N2', after: 135 },
            { flag: 'CRITICO', after: 162 },
          ],
        },
        {
          ceiling: 360,
          steps: [
            { flag: 'ALERTA_N1', after: 180 },
            { flag: 'ALERTA_N2', after: 270 },
            { flag: 'CRITICO', after: 324 },
          ],
        },
      ],
      sourceRef: 'WF-RAIT-002#4.3',
    });
    const omitFixture = (entries) =>
      entries
        .filter(
          (row) =>
            !['rait.ladder.A', 'rait.fixture.json_default'].includes(row.key),
        )
        .map(({ line: _line, source: _source, ...row }) => row);
    assert.deepEqual(
      omitFixture(changed.entries),
      omitFixture(original.entries),
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

for (const clockCode of ['B', 'C', 'D']) {
  for (const [label, mutate] of [
    ['schema version', (value) => ({ ...value, schemaVersion: 2 })],
    ['foreign clock identity', (value) => ({ ...value, clockCode: 'A' })],
    ['unknown top-level field', (value) => ({ ...value, guessed: true })],
    [
      'duplicate flags',
      (value) => ({
        ...value,
        tracks: [
          {
            ...value.tracks[0],
            steps: [...value.tracks[0].steps, value.tracks[0].steps[0]],
          },
        ],
      }),
    ],
    [
      'altered threshold',
      (value) => ({
        ...value,
        tracks: [
          {
            ...value.tracks[0],
            steps: value.tracks[0].steps.map((step, index) =>
              index === 0 ? { ...step, after: step.after + 1 } : step,
            ),
          },
        ],
      }),
    ],
  ]) {
    test(`S2-R2 ladder ${clockCode} rejects ${label}`, async () => {
      const text = await readFile(approvedCatalogue, 'utf8');
      const line = text
        .split('\n')
        .find((value) => value.includes(`\`rait.ladder.${clockCode}\``));
      assert.ok(line);
      const cells = line.split('|');
      const raw = cells[3].trim().replace(/^`|`$/g, '').replaceAll('\\"', '"');
      cells[3] = ` \`${JSON.stringify(mutate(JSON.parse(raw)))}\` `;
      const directory = await mkdtemp('/tmp/detran-s2-four-ladders-');
      try {
        const source = join(directory, 'catalogue.md');
        await writeFile(source, text.replace(line, cells.join('|')));
        await assert.rejects(
          parseCatalogue(source),
          new RegExp(`rait\\.ladder\\.${clockCode}`),
        );
      } finally {
        await rm(directory, { recursive: true, force: true });
      }
    });
  }
}
