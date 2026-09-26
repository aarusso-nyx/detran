// R-0018 TASK-0002 (Inspector, Art. 6). CTG-0001 §3, §5, §6.2, §6.3 e §7.6 (C-01-28…C-01-35):
// testes de `tools/docs/adr/renumber.mjs` via linha de comando, sobre árvores construídas em
// diretório temporário por `fixture.mjs`. `--write` só roda sobre esses diretórios temporários,
// nunca sobre a árvore real do repositório.
//
// Estes testes falham hoje (antes de TASK-0003) porque `node tools/docs/adr/renumber.mjs` não
// existe: o processo filho termina com "Cannot find module" (equivalente a ERR_MODULE_NOT_FOUND)
// e as asserções de exit code/stdout/conteúdo não batem. Isso é esperado nesta entrega.
import assert from 'node:assert/strict';
import test from 'node:test';
import { execFile } from 'node:child_process';
import { rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import {
  FROM_PATH,
  HISTORICAL_PATH,
  KEPT_PATH,
  LIVEPATH_LINE_KEPT,
  LIVE_PATH,
  OUT_OF_LOCK_PATH,
  TO_PATH,
  baseRenumberConfig,
  buildBaseTree,
  cleanupRoot,
  existsRel,
  expectedStubContent,
  expectedToContent,
  mkTempRoot,
  readFile,
  readFileBuffer,
  snapshotTree,
  writeFile,
} from './fixture.mjs';

const exec = promisify(execFile);
const repoRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../..',
);
const renumberScript = join(repoRoot, 'tools/docs/adr/renumber.mjs');

async function runRenumber(root, extraArgs = []) {
  try {
    const result = await exec(
      process.execPath,
      [renumberScript, '--root', root, ...extraArgs],
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

async function withRoot(build, run) {
  const root = mkTempRoot();
  try {
    build(root);
    await run(root);
  } finally {
    cleanupRoot(root);
  }
}

function lastLine(text) {
  const lines = text.trim().split('\n');
  return lines[lines.length - 1];
}

test('C-01-28 dado dry-run (sem --write) quando o renumerador roda então nenhum byte é escrito (hash igual antes/depois) e imprime "3 pending, 2 review"', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
    },
    async (root) => {
      const before = snapshotTree(root);
      const result = await runRenumber(root);
      const after = snapshotTree(root);
      assert.deepEqual(
        after,
        before,
        'dry-run não deve alterar nenhum arquivo',
      );
      assert.match(
        result.stdout,
        new RegExp(
          `MOVE ${escapeRegExp(FROM_PATH)} -> ${escapeRegExp(TO_PATH)}`,
        ),
      );
      assert.match(result.stdout, /STUB .* -> ADR-0036/);
      assert.match(
        result.stdout,
        /REWRITE .*docs\/some\/livepath\.md:1 ADR-0006 -> ADR-0036/,
      );
      assert.match(
        result.stdout,
        /REVIEW .*docs\/some\/livepath\.md:2 ADR-0006 sem slug/,
      );
      assert.equal(
        lastLine(result.stdout),
        'adr:renumber dry-run: 3 pending, 2 review',
      );
    },
  );
});

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

test('C-01-29 dado --write quando o renumerador roda então "to" = header (§3.2) + bytes originais e "from" = texto do stub (§3.3), byte a byte', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
    },
    async (root) => {
      const result = await runRenumber(root, ['--write']);
      assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
      const toBuffer = readFileBuffer(root, TO_PATH);
      const fromBuffer = readFileBuffer(root, FROM_PATH);
      assert.ok(
        toBuffer.equals(Buffer.from(expectedToContent(), 'utf8')),
        'conteúdo de "to" não bate byte a byte',
      );
      assert.ok(
        fromBuffer.equals(Buffer.from(expectedStubContent(), 'utf8')),
        'conteúdo de "from" (stub) não bate byte a byte',
      );
    },
  );
});

test('C-01-30 dado uma citação com o slug do renumerado num livePath quando --write roda então o texto do link e o caminho são reescritos', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
    },
    async (root) => {
      await runRenumber(root, ['--write']);
      const livePathText = readFile(root, LIVE_PATH);
      const lines = livePathText.split('\n');
      assert.match(
        lines[0],
        /\[ADR-0036\]\(\.\.\/adr\/ADR-0036-ops-field-fixture\.md\)/,
      );
      assert.ok(!lines[0].includes('ADR-0006'));
    },
  );
});

test('C-01-31 dado uma citação com o slug do arquivo que conserva o número quando --write roda então permanece intocada', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
    },
    async (root) => {
      await runRenumber(root, ['--write']);
      const livePathText = readFile(root, LIVE_PATH);
      const lines = livePathText.split('\n');
      assert.equal(lines[2], LIVEPATH_LINE_KEPT);
      assert.ok(existsRel(root, KEPT_PATH));
      assert.equal(
        readFile(root, KEPT_PATH),
        '# ADR-0006: Kept Fixture\n\n## Status\n\nAccepted on 2026-08-24.\n',
      );
    },
  );
});

test('C-01-32 dado citações sem slug de um número duplicado (inclusive um identificador persistido tipo ADR-0006-2026-08-24) quando --write roda então permanecem intocadas e geram uma linha REVIEW por ocorrência', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
    },
    async (root) => {
      const result = await runRenumber(root, ['--write']);
      const livePathText = readFile(root, LIVE_PATH);
      const lines = livePathText.split('\n');
      assert.equal(
        lines[1],
        'Também citado como ADR-0006 sem link em outro trecho da fixture.',
      );
      assert.equal(
        lines[3],
        'O identificador persistido ADR-0006-2026-08-24 não é uma citação.',
      );
      const reviewMatches = [...result.stdout.matchAll(/^REVIEW /gm)];
      assert.equal(reviewMatches.length, 2);
    },
  );
});

test('C-01-33 dado arquivos históricos e fora de livePaths quando --write roda então permanecem intocados', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
    },
    async (root) => {
      const historicalBefore = readFile(root, HISTORICAL_PATH);
      const outOfLockBefore = readFile(root, OUT_OF_LOCK_PATH);
      await runRenumber(root, ['--write']);
      assert.equal(readFile(root, HISTORICAL_PATH), historicalBefore);
      assert.equal(readFile(root, OUT_OF_LOCK_PATH), outOfLockBefore);
    },
  );
});

test('C-01-33 dado um livePath sob um prefixo do §5.5 (historicalPrefixes/outOfLockPrefixes) quando o renumerador roda então erro de configuração, exit 2', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root, {
        config: baseRenumberConfig({ livePaths: ['record/x.md'] }),
      });
    },
    async (root) => {
      const result = await runRenumber(root);
      assert.equal(result.status, 2);
      assert.match(result.stderr, /^adr:renumber: erro:/);
    },
  );
});

test('C-01-34 dado uma 2ª execução (dry-run) depois de --write quando o renumerador roda então "0 pending" e linhas SKIP para as entradas já aplicadas', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
    },
    async (root) => {
      const first = await runRenumber(root, ['--write']);
      assert.equal(first.status, 0, `${first.stdout}\n${first.stderr}`);
      const beforeSecond = snapshotTree(root);
      const second = await runRenumber(root);
      const afterSecond = snapshotTree(root);
      assert.deepEqual(
        afterSecond,
        beforeSecond,
        'a 2ª execução (dry-run) não deve escrever nada',
      );
      assert.match(
        second.stdout,
        new RegExp(`SKIP ${escapeRegExp(FROM_PATH)} -> ADR-0036`),
      );
      assert.equal(
        lastLine(second.stdout),
        'adr:renumber dry-run: 0 pending, 2 review',
      );
    },
  );
});

test('C-01-35 dado "to" preexistente com conteúdo diferente do já aplicado quando --write roda então exit 2 sem escrever nada', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
      writeFile(root, TO_PATH, 'conteúdo alheio, não gerado pelo script');
    },
    async (root) => {
      const before = snapshotTree(root);
      const result = await runRenumber(root, ['--write']);
      const after = snapshotTree(root);
      assert.equal(result.status, 2);
      assert.match(result.stderr, /^adr:renumber: erro:/);
      assert.deepEqual(
        after,
        before,
        'estado inconsistente não deve escrever nenhum byte',
      );
    },
  );
});

test('C-01-35 dado "from" ausente quando --write roda então exit 2 sem escrever nada', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
      rmSync(join(root, FROM_PATH));
    },
    async (root) => {
      const before = snapshotTree(root);
      const result = await runRenumber(root, ['--write']);
      const after = snapshotTree(root);
      assert.equal(result.status, 2);
      assert.match(result.stderr, /^adr:renumber: erro:/);
      assert.deepEqual(after, before);
    },
  );
});

test('C-01-35 dado duas entradas em que a 2ª é inválida quando --write roda então nenhuma escrita ocorre, nem a da 1ª entrada válida (validação antes da 1ª escrita)', async () => {
  const SECOND_FROM = 'docs/meta/adr/ADR-0024-second-fixture.md';
  const SECOND_TO = 'docs/meta/adr/ADR-0037-second-fixture.md';
  await withRoot(
    (root) => {
      buildBaseTree(root, {
        config: baseRenumberConfig({
          entries: [
            {
              from: FROM_PATH,
              to: TO_PATH,
              reason: 'Primeira entrada, válida.',
            },
            {
              from: SECOND_FROM,
              to: SECOND_TO,
              reason: 'Segunda entrada, inválida (from ausente).',
            },
          ],
        }),
      });
      // SECOND_FROM não é criado: entrada inválida por "from" ausente.
    },
    async (root) => {
      const before = snapshotTree(root);
      const result = await runRenumber(root, ['--write']);
      const after = snapshotTree(root);
      assert.equal(result.status, 2);
      assert.deepEqual(
        after,
        before,
        'nenhuma entrada deve ser aplicada quando outra é inválida',
      );
      assert.ok(
        !existsRel(root, TO_PATH),
        'a 1ª entrada (válida) não deve ter sido escrita',
      );
    },
  );
});
