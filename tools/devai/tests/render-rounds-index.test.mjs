// R-0017 CTG-SEAL (Inspector, Art. 7). Contrato CTG-SEAL, invariante 3:
// exercita o renderizador local de índice de closures em uma árvore temporária.
// A suíte não lê nem escreve os registros reais do repositório.
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const exec = promisify(execFile);
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const renderer = join(repoRoot, 'tools/devai/render-rounds-index.mjs');

function mkRoot() {
  return mkdtempSync(join(tmpdir(), 'render-rounds-index-'));
}

function writeClosure(root, fileName, closure) {
  const directory = join(root, 'record/proofs/compliance/closures');
  writeFileSync(join(directory, fileName), JSON.stringify(closure, null, 2));
}

function buildRoot(closures) {
  const root = mkRoot();
  const directory = join(root, 'record/proofs/compliance/closures');
  mkdirSync(directory, { recursive: true });
  for (const [fileName, closure] of closures) {
    writeClosure(root, fileName, closure);
  }
  return root;
}

async function run(root, mode, executable = renderer) {
  try {
    const result = await exec(
      process.execPath,
      [executable, '--repo-root', root, mode],
      { cwd: repoRoot },
    );
    return { status: 0, stdout: result.stdout, stderr: result.stderr };
  } catch (error) {
    return {
      status: typeof error.code === 'number' ? error.code : 1,
      stdout: error.stdout ?? '',
      stderr: error.stderr ?? String(error),
    };
  }
}

async function withRoot(closures, runTest) {
  const root = buildRoot(closures);
  try {
    await runTest(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function output(result) {
  return `${result.stdout}\n${result.stderr}`;
}

const BASE_CLOSURES = [
  [
    'PC-0010.json',
    {
      id: 'PC-0010',
      round_id: 'R-0017',
      supersedes: 'PC-0002',
      merged_as: '1111111111111111111111111111111111111111',
    },
  ],
  [
    'PC-0001.json',
    {
      id: 'PC-0001',
      round_id: 'R-0003',
      merged_as: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    },
  ],
  [
    'PC-0002.json',
    {
      id: 'PC-0002',
      round_id: 'R-0017',
      merged_as: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    },
  ],
];

test('dadas closures válidas quando --write e --check rodam então o índice é ordenado, completo e idempotente', async () => {
  await withRoot(BASE_CLOSURES, async (root) => {
    const written = await run(root, '--write');
    assert.equal(written.status, 0, output(written));

    const indexPath = join(root, 'record/derived/indexes/rounds.md');
    const firstBytes = readFileSync(indexPath, 'utf8');
    assert.match(firstBytes, /PC-0001.*R-0003.*—.*a{40}/);
    assert.match(firstBytes, /PC-0002.*R-0017.*—.*b{40}/);
    assert.match(firstBytes, /PC-0010.*R-0017.*PC-0002.*1{40}/);
    assert.ok(
      firstBytes.indexOf('PC-0001') < firstBytes.indexOf('PC-0002') &&
        firstBytes.indexOf('PC-0002') < firstBytes.indexOf('PC-0010'),
      firstBytes,
    );

    const checked = await run(root, '--check');
    assert.equal(checked.status, 0, output(checked));
    assert.equal(readFileSync(indexPath, 'utf8'), firstBytes);
  });
});

test('dado PC cujo nome de arquivo diverge do id quando o renderer roda então recusa a entrada', async () => {
  await withRoot(
    [
      [
        'PC-0001.json',
        {
          id: 'PC-0002',
          round_id: 'R-0003',
          merged_as: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        },
      ],
    ],
    async (root) => {
      const result = await run(root, '--write');
      assert.notEqual(result.status, 0);
      assert.match(output(result), /nome.*arquivo.*id|PC-0001.*PC-0002/i);
    },
  );
});

test('dadas duas closures no mesmo ciclo de supersessão quando o renderer roda então recusa o ciclo', async () => {
  await withRoot(
    [
      [
        'PC-0001.json',
        {
          id: 'PC-0001',
          round_id: 'R-0003',
          supersedes: 'PC-0002',
          merged_as: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        },
      ],
      [
        'PC-0002.json',
        {
          id: 'PC-0002',
          round_id: 'R-0003',
          supersedes: 'PC-0001',
          merged_as: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        },
      ],
    ],
    async (root) => {
      const result = await run(root, '--write');
      assert.notEqual(result.status, 0);
      assert.match(output(result), /ciclo.*supersessão|supersessão.*ciclo/i);
    },
  );
});

test('dado índice alterado ou ausente quando --check roda então o gate falha', async () => {
  await withRoot(BASE_CLOSURES, async (root) => {
    assert.equal((await run(root, '--write')).status, 0);
    const indexPath = join(root, 'record/derived/indexes/rounds.md');
    writeFileSync(indexPath, `${readFileSync(indexPath, 'utf8')}drift\n`);
    const stale = await run(root, '--check');
    assert.notEqual(stale.status, 0);
    assert.match(output(stale), /stale/);

    unlinkSync(indexPath);
    const missing = await run(root, '--check');
    assert.notEqual(missing.status, 0);
    assert.match(output(missing), /missing or unreadable/);
  });
});

test('dado caminho de entrada simbólico com caracteres reservados quando --check roda então executa o gate', async () => {
  await withRoot(BASE_CLOSURES, async (root) => {
    const link = join(root, 'renderer#?%.mjs');
    symlinkSync(renderer, link);
    const result = await run(root, '--check', link);
    assert.notEqual(result.status, 0);
    assert.match(output(result), /missing or unreadable/);
  });
});

for (const [name, closures, message] of [
  [
    'predecessor ausente',
    [
      [
        'PC-0001.json',
        { id: 'PC-0001', round_id: 'R-0003', supersedes: 'PC-9999' },
      ],
    ],
    /missing PC/,
  ],
  [
    'ligação entre rodadas',
    [
      ['PC-0001.json', { id: 'PC-0001', round_id: 'R-0003' }],
      [
        'PC-0002.json',
        { id: 'PC-0002', round_id: 'R-0017', supersedes: 'PC-0001' },
      ],
    ],
    /across rounds/,
  ],
  [
    'dois terminais',
    [
      ['PC-0001.json', { id: 'PC-0001', round_id: 'R-0003' }],
      ['PC-0002.json', { id: 'PC-0002', round_id: 'R-0003' }],
    ],
    /2 terminal PC heads/,
  ],
]) {
  test(`dado ${name} quando o renderer roda então recusa a entrada`, async () => {
    await withRoot(closures, async (root) => {
      const result = await run(root, '--write');
      assert.notEqual(result.status, 0);
      assert.match(output(result), message);
    });
  });
}

test('dado JSON ilegível quando o renderer roda então recusa a entrada', async () => {
  await withRoot([], async (root) => {
    const file = join(root, 'record/proofs/compliance/closures/PC-0001.json');
    writeFileSync(file, '{invalid');
    const result = await run(root, '--write');
    assert.notEqual(result.status, 0);
    assert.match(output(result), /Unreadable JSON/);
  });
});
