import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const repositoryRoot = path.resolve(import.meta.dirname, '../../..');
const verifier = path.join(
  repositoryRoot,
  'tools/devai/verify-proof-anchors.mjs',
);

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function proofLine(roundId, sequence, payload = {}) {
  return JSON.stringify({
    schemaVersion: '1.0.0',
    line_type: 'record',
    round_id: roundId,
    kind: 'generic',
    sequence,
    payload,
  });
}

function anchor(roundId, sequence, payload = {}) {
  return {
    schemaVersion: '1.0.0',
    id: `EV-${roundId}-${sequence}-${Math.random().toString(16).slice(2)}`,
    action: 'evidence.record.generic',
    payload,
    notes: [`round_id=${roundId}`, `proof_sequence=${sequence}`],
  };
}

async function createFixture({
  lines,
  records = [],
  baseline = { proofs: { lines: [], orphans: [] } },
  authorization,
  exceptions,
}) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'detran-proof-anchors-'));
  const genericDirectory = path.join(root, 'record/proofs/work/generic');
  await mkdir(genericDirectory, { recursive: true });

  const linesByRound = new Map();
  for (const line of lines) {
    const entries = linesByRound.get(line.roundId) ?? [];
    entries.push(line);
    linesByRound.set(line.roundId, entries);
  }

  for (const [roundId, entries] of linesByRound) {
    await writeFile(
      path.join(genericDirectory, `${roundId}.jsonl`),
      `${entries.map((entry) => entry.value).join('\n')}\n`,
      'utf8',
    );
  }

  await writeFile(
    path.join(root, 'record/proofs/chain.json'),
    `${JSON.stringify({ head: 'fixture-head', records }, null, 2)}\n`,
    'utf8',
  );
  await mkdir(path.join(root, 'work/rounds/R-0020'), { recursive: true });
  await writeFile(
    path.join(root, 'work/rounds/R-0020/baseline.json'),
    `${JSON.stringify(baseline, null, 2)}\n`,
    'utf8',
  );
  if (authorization !== undefined) {
    await writeFile(
      path.join(root, 'work/rounds/R-0020/AUTHORIZATION-A2-2026-09-28.md'),
      authorization,
    );
  }
  if (exceptions !== undefined) {
    await mkdir(path.join(root, 'work/rounds/R-0020/contracts'), {
      recursive: true,
    });
    await writeFile(
      path.join(root, 'work/rounds/R-0020/contracts/CTG-0002-exceptions.jsonl'),
      exceptions,
    );
  }

  return root;
}

async function withFixture(fixture, run) {
  const root = await createFixture(fixture);
  try {
    return await run(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

function verify(root) {
  return spawnSync(process.execPath, [verifier, '--repo-root', root], {
    cwd: repositoryRoot,
    encoding: 'utf8',
  });
}

function expectPass(result) {
  assert.equal(result.error, undefined, result.error?.message);
  assert.equal(result.status, 0, result.stderr || result.stdout);
}

function expectFailure(result, roundId, sequence, reason) {
  assert.equal(result.error, undefined, result.error?.message);
  assert.notEqual(result.status, 0, result.stdout);
  if (roundId !== null) {
    assert.match(
      `${result.stdout}\n${result.stderr}`,
      new RegExp(`${roundId}[\\s\\S]*${sequence}`),
      'a failure must identify the affected round and sequence',
    );
  }
  assert.match(
    `${result.stdout}\n${result.stderr}`,
    reason,
    'a failure must state its cause',
  );
}

async function canonicalBaseline() {
  return JSON.parse(
    await readFile(
      path.join(repositoryRoot, 'work/rounds/R-0020/baseline.json'),
      'utf8',
    ),
  );
}

async function canonicalHistoricalFixture() {
  const values = (
    await readFile(
      path.join(repositoryRoot, 'record/proofs/work/generic/R-0005.jsonl'),
      'utf8',
    )
  )
    .trimEnd()
    .split(/\r?\n/)
    .slice(0, 9);
  const lines = values.map((value, index) => ({
    roundId: 'R-0005',
    sequence: index + 1,
    value,
  }));
  return {
    baseline: await canonicalBaseline(),
    lines,
    orphan: lines.at(-1),
    records: lines
      .slice(0, -1)
      .map((line) => anchor(line.roundId, line.sequence)),
  };
}

async function canonicalA2Fixture() {
  const roundId = 'R-0021';
  const proofPath = 'record/proofs/work/generic/R-0021.jsonl';
  const values = (await readFile(path.join(repositoryRoot, proofPath), 'utf8'))
    .trimEnd()
    .split(/\r?\n/)
    .slice(0, 2);
  const exceptionPath =
    'work/rounds/R-0020/contracts/CTG-0002-exceptions.jsonl';
  const exceptions = await readFile(
    path.join(repositoryRoot, exceptionPath),
    'utf8',
  );
  const exception = JSON.parse(exceptions.trim());
  assert.equal(values.length, 2);
  assert.equal(sha256(values[1]), exception.orphan_lines[0].sha256);
  const declaration = proofLine(roundId, 3, {
    action: 'declare_historical_orphan_lines',
    round: roundId,
    orphan_lines: [exception.orphan_lines[0]],
    cause: 'source_pending',
    trace:
      'Após PR #151, sequência 2 sem âncora direta; sequência 3 regravada após merge de main',
  });
  return {
    authorization: await readFile(
      path.join(repositoryRoot, exception.decision_ref),
    ),
    baseline: await canonicalBaseline(),
    exception,
    exceptions,
    lines: [
      ...values.map((value, index) => ({
        roundId,
        sequence: index + 1,
        value,
      })),
      { roundId, sequence: 3, value: declaration },
    ],
    records: [anchor(roundId, 1), anchor(roundId, 3)],
  };
}

test('dado linha órfã histórica quando não há declaração então falha', async () => {
  const { baseline, lines, orphan, records } =
    await canonicalHistoricalFixture();

  await withFixture({ lines, records, baseline }, async (root) => {
    expectFailure(verify(root), 'R-0005', 9, /undeclared orphan/);
  });
});

test('dado linha órfã histórica quando prova declaratória ancorada a cita então passa', async () => {
  const { baseline, lines, orphan, records } =
    await canonicalHistoricalFixture();
  const declaration = proofLine('R-0005', 10, {
    action: 'declare_historical_orphan_lines',
    round: 'R-0005',
    orphan_lines: [
      {
        path: 'record/proofs/work/generic/R-0005.jsonl',
        sequence: 9,
        sha256: sha256(orphan.value),
      },
    ],
    cause: 'source_pending',
  });

  await withFixture(
    {
      lines: [
        ...lines,
        { roundId: 'R-0005', sequence: 10, value: declaration },
      ],
      records: [...records, anchor('R-0005', 10)],
      baseline,
    },
    async (root) => {
      expectPass(verify(root));
    },
  );
});

test('dado declaração com hash ou sequência divergente quando verifica então falha', async () => {
  const { baseline, lines, orphan, records } =
    await canonicalHistoricalFixture();
  const declaration = proofLine('R-0005', 10, {
    action: 'declare_historical_orphan_lines',
    round: 'R-0005',
    orphan_lines: [
      {
        path: 'record/proofs/work/generic/R-0005.jsonl',
        sequence: 9,
        sha256: '0'.repeat(64),
      },
    ],
    cause: 'source_pending',
  });

  await withFixture(
    {
      lines: [
        ...lines,
        { roundId: 'R-0005', sequence: 10, value: declaration },
      ],
      records: [...records, anchor('R-0005', 10)],
      baseline,
    },
    async (root) => {
      expectFailure(verify(root), 'R-0005', 9, /hash mismatch/);
    },
  );
});

test('dado duas declarações da mesma linha quando verifica então falha', async () => {
  const { baseline, lines, orphan, records } =
    await canonicalHistoricalFixture();
  const orphanReference = {
    path: 'record/proofs/work/generic/R-0005.jsonl',
    sequence: 9,
    sha256: sha256(orphan.value),
  };
  const firstDeclaration = proofLine('R-0005', 10, {
    action: 'declare_historical_orphan_lines',
    round: 'R-0005',
    orphan_lines: [orphanReference],
    cause: 'source_pending',
  });
  const secondDeclaration = proofLine('R-0005', 11, {
    action: 'declare_historical_orphan_lines',
    round: 'R-0005',
    orphan_lines: [orphanReference],
    cause: 'source_pending',
  });

  await withFixture(
    {
      lines: [
        ...lines,
        { roundId: 'R-0005', sequence: 10, value: firstDeclaration },
        { roundId: 'R-0005', sequence: 11, value: secondDeclaration },
      ],
      records: [...records, anchor('R-0005', 10), anchor('R-0005', 11)],
      baseline,
    },
    async (root) => {
      expectFailure(verify(root), 'R-0005', 9, /duplicate declaration/);
    },
  );
});

test('dado declaração append-only de linha nova quando tem hash correto então falha', async () => {
  const newLine = proofLine('R-0020', 1, { action: 'new_proof' });
  const declaration = proofLine('R-0020', 2, {
    action: 'declare_historical_orphan_lines',
    round: 'R-0020',
    orphan_lines: [
      {
        path: 'record/proofs/work/generic/R-0020.jsonl',
        sequence: 1,
        sha256: sha256(newLine),
      },
    ],
    cause: 'source_pending',
  });

  await withFixture(
    {
      lines: [
        { roundId: 'R-0020', sequence: 1, value: newLine },
        { roundId: 'R-0020', sequence: 2, value: declaration },
      ],
      records: [anchor('R-0020', 2)],
      baseline: await canonicalBaseline(),
    },
    async (root) => {
      expectFailure(
        verify(root),
        'R-0020',
        1,
        /not an allowed historical orphan/,
      );
    },
  );
});

for (const [name, mutate, reason] of [
  [
    'somente orphans',
    (baseline) => baseline.proofs.orphans.pop(),
    /historical orphan allowlist mismatch/,
  ],
  [
    'somente lines',
    (baseline) => {
      baseline.proofs.lines.find((line) => !line.anchored).anchored = true;
    },
    /invalid historical orphan count/,
  ],
  [
    'listas congruentes com trio falso',
    (baseline) => {
      const line = baseline.proofs.lines.find((item) => !item.anchored);
      line.sha256 = '0'.repeat(64);
      baseline.proofs.orphans.find(
        (item) => item.path === line.path && item.sequence === line.sequence,
      ).sha256 = line.sha256;
    },
    /historical orphan allowlist mismatch/,
  ],
  [
    'head sha adulterado',
    (baseline) => {
      baseline.head_sha = '0'.repeat(40);
    },
    /invalid historical orphan metadata/,
  ],
]) {
  test(`dado baseline histórica alterada em ${name} quando verifica então falha`, async () => {
    const baseline = await canonicalBaseline();
    mutate(baseline);
    await withFixture({ lines: [], baseline }, async (root) => {
      expectFailure(verify(root), null, null, reason);
    });
  });
}

test('dado duas âncoras para a mesma linha quando verifica então falha', async () => {
  const line = {
    roundId: 'R-0020',
    sequence: 1,
    value: proofLine('R-0020', 1),
  };

  await withFixture(
    {
      lines: [line],
      records: [anchor('R-0020', 1), anchor('R-0020', 1)],
      baseline: await canonicalBaseline(),
    },
    async (root) => {
      expectFailure(verify(root), 'R-0020', 1, /duplicate anchor/);
    },
  );
});

test('dado linha nova sem âncora quando verifica então falha', async () => {
  const {
    baseline,
    lines,
    orphan: historical,
    records,
  } = await canonicalHistoricalFixture();
  const declaration = proofLine('R-0005', 10, {
    action: 'declare_historical_orphan_lines',
    round: 'R-0005',
    orphan_lines: [
      {
        path: 'record/proofs/work/generic/R-0005.jsonl',
        sequence: 9,
        sha256: sha256(historical.value),
      },
    ],
    cause: 'source_pending',
  });
  const newLine = proofLine('R-0005', 11, { action: 'new_proof' });

  await withFixture(
    {
      lines: [
        ...lines,
        { roundId: 'R-0005', sequence: 10, value: declaration },
        { roundId: 'R-0005', sequence: 11, value: newLine },
      ],
      records: [...records, anchor('R-0005', 10)],
      baseline,
    },
    async (root) => {
      expectFailure(verify(root), 'R-0005', 11, /undeclared orphan/);
    },
  );
});

test('dado referência da cadeia sem linha quando verifica então falha', async () => {
  await withFixture(
    {
      lines: [],
      records: [anchor('R-0020', 1)],
      baseline: await canonicalBaseline(),
    },
    async (root) => {
      expectFailure(verify(root), 'R-0020', 1, /invalid anchor reference/);
    },
  );
});

test('dado sequência física divergente quando verifica então falha', async () => {
  const { baseline, lines, records } = await canonicalHistoricalFixture();
  lines[1] = { roundId: 'R-0005', sequence: 2, value: proofLine('R-0005', 3) };
  await withFixture({ lines, records, baseline }, async (root) => {
    expectFailure(verify(root), 'R-0005', 3, /sequence/);
  });
});

test('dado declaração sem âncora quando verifica então falha', async () => {
  const { baseline, lines, orphan, records } =
    await canonicalHistoricalFixture();
  const declaration = proofLine('R-0005', 10, {
    action: 'declare_historical_orphan_lines',
    round: 'R-0005',
    orphan_lines: [
      {
        path: 'record/proofs/work/generic/R-0005.jsonl',
        sequence: 9,
        sha256: sha256(orphan.value),
      },
    ],
    cause: 'source_pending',
  });
  await withFixture(
    {
      lines: [
        ...lines,
        { roundId: 'R-0005', sequence: 10, value: declaration },
      ],
      records,
      baseline,
    },
    async (root) => {
      expectFailure(
        verify(root),
        'R-0005',
        9,
        /orphan declaration requires one direct anchor/,
      );
    },
  );
});

test('dado declaração de linha já ancorada quando verifica então falha', async () => {
  const { baseline, lines, orphan, records } =
    await canonicalHistoricalFixture();
  const declaration = proofLine('R-0005', 10, {
    action: 'declare_historical_orphan_lines',
    round: 'R-0005',
    orphan_lines: [
      {
        path: 'record/proofs/work/generic/R-0005.jsonl',
        sequence: 9,
        sha256: sha256(orphan.value),
      },
    ],
    cause: 'source_pending',
  });
  await withFixture(
    {
      lines: [
        ...lines,
        { roundId: 'R-0005', sequence: 10, value: declaration },
      ],
      records: [...records, anchor('R-0005', 9), anchor('R-0005', 10)],
      baseline,
    },
    async (root) => {
      expectFailure(verify(root), 'R-0005', 9, /already has a direct anchor/);
    },
  );
});

test('dado declaração de caminho inexistente quando verifica então falha', async () => {
  const { baseline, lines, records } = await canonicalHistoricalFixture();
  const declaration = proofLine('R-0005', 10, {
    action: 'declare_historical_orphan_lines',
    round: 'R-0005',
    orphan_lines: [
      {
        path: 'record/proofs/work/generic/R-0099.jsonl',
        sequence: 1,
        sha256: '0'.repeat(64),
      },
    ],
    cause: 'source_pending',
  });
  await withFixture(
    {
      lines: [
        ...lines,
        { roundId: 'R-0005', sequence: 10, value: declaration },
      ],
      records: [...records, anchor('R-0005', 10)],
      baseline,
    },
    async (root) => {
      expectFailure(verify(root), 'R-0099', 1, /invalid orphan reference/);
    },
  );
});

test('dado nota generic malformada quando verifica então falha', async () => {
  const baseline = await canonicalBaseline();
  const line = {
    roundId: 'R-0020',
    sequence: 1,
    value: proofLine('R-0020', 1),
  };
  const malformed = anchor('R-0020', 1);
  malformed.notes = ['round_id=R-0020'];
  await withFixture(
    { lines: [line], records: [malformed], baseline },
    async (root) => {
      expectFailure(verify(root), 'R-0020', 1, /invalid anchor notes/);
    },
  );
});

test('dado payload round divergente quando verifica então falha', async () => {
  const { baseline, lines, orphan, records } =
    await canonicalHistoricalFixture();
  const declaration = proofLine('R-0005', 10, {
    action: 'declare_historical_orphan_lines',
    round: 'R-0020',
    orphan_lines: [
      {
        path: 'record/proofs/work/generic/R-0005.jsonl',
        sequence: 9,
        sha256: sha256(orphan.value),
      },
    ],
    cause: 'source_pending',
  });
  await withFixture(
    {
      lines: [
        ...lines,
        { roundId: 'R-0005', sequence: 10, value: declaration },
      ],
      records: [...records, anchor('R-0005', 10)],
      baseline,
    },
    async (root) => {
      expectFailure(verify(root), 'R-0005', 10, /invalid orphan declaration/);
    },
  );
});

test('dado declaração da sequência oito com hash da nove quando verifica então falha', async () => {
  const { baseline, lines, records } = await canonicalHistoricalFixture();
  const declaration = proofLine('R-0005', 10, {
    action: 'declare_historical_orphan_lines',
    round: 'R-0005',
    orphan_lines: [
      {
        path: 'record/proofs/work/generic/R-0005.jsonl',
        sequence: 8,
        sha256: sha256(lines[8].value),
      },
    ],
    cause: 'source_pending',
  });
  await withFixture(
    {
      lines: [
        ...lines,
        { roundId: 'R-0005', sequence: 10, value: declaration },
      ],
      records: [...records, anchor('R-0005', 10)],
      baseline,
    },
    async (root) => {
      expectFailure(verify(root), 'R-0005', 8, /hash mismatch/);
    },
  );
});

test('dado somente contagem de órfãs adulterada quando verifica então falha', async () => {
  const baseline = await canonicalBaseline();
  baseline.proofs.counts.orphans = 51;
  await withFixture({ lines: [], baseline }, async (root) => {
    expectFailure(
      verify(root),
      null,
      null,
      /invalid historical orphan metadata/,
    );
  });
});

test('dado R-0021 seq. 2 sem arquivo excepcional quando declaração ancorada a cita então falha', async () => {
  const { authorization, baseline, lines, records } =
    await canonicalA2Fixture();
  await withFixture(
    { authorization, baseline, lines, records },
    async (root) => {
      expectFailure(verify(root), 'R-0021', 2, /orphan|exception/i);
    },
  );
});

test('dado autorização A2 e exceção exatas quando declaração ancorada cita R-0021 seq. 2 então passa', async () => {
  const { authorization, baseline, exceptions, lines, records } =
    await canonicalA2Fixture();
  await withFixture(
    { authorization, baseline, exceptions, lines, records },
    async (root) => {
      expectPass(verify(root));
    },
  );
});

test('dado exceção A2 sem prova declaratória quando verifica R-0021 seq. 2 então falha', async () => {
  const { authorization, baseline, exceptions, lines, records } =
    await canonicalA2Fixture();
  await withFixture(
    {
      authorization,
      baseline,
      exceptions,
      lines: lines.slice(0, 2),
      records: records.slice(0, 1),
    },
    async (root) => {
      expectFailure(verify(root), 'R-0021', 2, /undeclared orphan/);
    },
  );
});

test('dado hash da decisão A2 errado quando declaração ancorada cita R-0021 seq. 2 então falha', async () => {
  const { authorization, baseline, exception, lines, records } =
    await canonicalA2Fixture();
  exception.decision_sha256 = '0'.repeat(64);
  await withFixture(
    {
      authorization,
      baseline,
      exceptions: `${JSON.stringify(exception)}\n`,
      lines,
      records,
    },
    async (root) => {
      expectFailure(verify(root), 'R-0021', 2, /orphan|exception|decision/i);
    },
  );
});

test('dado outro trio com digest canônico coerente quando declaração ancorada cita R-0021 seq. 2 então falha', async () => {
  const { authorization, baseline, exception, lines, records } =
    await canonicalA2Fixture();
  const other = {
    path: 'record/proofs/work/generic/R-0021.jsonl',
    sequence: 1,
    sha256: sha256(lines[0].value),
  };
  exception.orphan_lines = [other];
  exception.canonical_digest_sha256 = sha256(
    `${other.path}\t${other.sequence}\t${other.sha256}\n`,
  );
  await withFixture(
    {
      authorization,
      baseline,
      exceptions: `${JSON.stringify(exception)}\n`,
      lines,
      records,
    },
    async (root) => {
      expectFailure(verify(root), 'R-0021', 2, /orphan|exception/i);
    },
  );
});

for (const [name, append] of [
  ['linha extra', '{}\n'],
  ['linha duplicada', null],
]) {
  test(`dado ${name} no JSONL excepcional quando declaração ancorada cita R-0021 seq. 2 então falha`, async () => {
    const { authorization, baseline, exceptions, lines, records } =
      await canonicalA2Fixture();
    await withFixture(
      {
        authorization,
        baseline,
        exceptions: exceptions + (append ?? exceptions),
        lines,
        records,
      },
      async (root) => {
        expectFailure(verify(root), 'R-0021', 2, /orphan|exception/i);
      },
    );
  });
}

test('dado A2 válida quando nova linha R-0020 é declarada então essa linha falha', async () => {
  const { authorization, baseline, exceptions, lines, records } =
    await canonicalA2Fixture();
  const newLine = proofLine('R-0020', 1, { action: 'new_proof' });
  const declaration = proofLine('R-0020', 2, {
    action: 'declare_historical_orphan_lines',
    round: 'R-0020',
    orphan_lines: [
      {
        path: 'record/proofs/work/generic/R-0020.jsonl',
        sequence: 1,
        sha256: sha256(newLine),
      },
    ],
    cause: 'source_pending',
  });
  await withFixture(
    {
      authorization,
      baseline,
      exceptions,
      lines: [
        ...lines,
        { roundId: 'R-0020', sequence: 1, value: newLine },
        { roundId: 'R-0020', sequence: 2, value: declaration },
      ],
      records: [...records, anchor('R-0020', 2)],
    },
    async (root) => {
      expectFailure(
        verify(root),
        'R-0020',
        1,
        /not an allowed historical orphan|undeclared orphan/,
      );
    },
  );
});
