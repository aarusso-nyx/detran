#!/usr/bin/env node
// Uso: node tools/orchestra/expect-red.mjs <lista-vermelhos.txt> -- <comando vitest ...>
//
// Gate de "vermelho esperado" da tríade Inspector → Engineer. Roda o comando vitest acrescentando um
// reporter JSON e sai 0 somente se:
//   - pelo menos um teste foi coletado e nenhum arquivo falhou ao carregar;
//   - nenhum teste ficou skipped, todo ou pending;
//   - o conjunto de testes que falharam (fullName) é exatamente o das linhas não vazias da lista
//     (linhas iniciadas por `#` são comentário; lista vazia = tudo verde).
// Um `it.fails` que passa a passar conta como falha, como no vitest.
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const argv = process.argv.slice(2);
const separator = argv.indexOf('--');
if (separator !== 1 || argv.length < 3) {
  console.error(
    'uso: expect-red.mjs <lista-vermelhos.txt> -- <comando vitest ...>',
  );
  process.exit(2);
}
const expected = new Set(
  readFileSync(argv[0], 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#')),
);
const [command, ...args] = argv.slice(2);
const dir = mkdtempSync(join(tmpdir(), 'expect-red-'));
const output = join(dir, 'vitest.json');
const run = spawnSync(
  command,
  [
    ...args,
    '--reporter=default',
    '--reporter=json',
    `--outputFile.json=${output}`,
  ],
  { stdio: 'inherit' },
);

let report;
try {
  report = JSON.parse(readFileSync(output, 'utf8'));
} catch {
  console.error(
    `expect-red: o comando não produziu relatório JSON (exit ${run.status})`,
  );
  process.exit(1);
} finally {
  rmSync(dir, { recursive: true, force: true });
}

const problems = [];
const failed = new Set();
let collected = 0;
for (const file of report.testResults ?? []) {
  const assertions = file.assertionResults ?? [];
  if (file.status === 'failed' && assertions.length === 0)
    problems.push(
      `arquivo não carregou: ${file.name}: ${file.message ?? ''}`.trim(),
    );
  for (const test of assertions) {
    collected += 1;
    if (test.status === 'failed') failed.add(test.fullName);
    else if (test.status !== 'passed')
      problems.push(`${test.status}: ${test.fullName}`);
  }
}
if (collected === 0) problems.push('nenhum teste coletado');
for (const name of failed)
  if (!expected.has(name)) problems.push(`falha não esperada: ${name}`);
for (const name of expected)
  if (!failed.has(name))
    problems.push(`vermelho esperado não falhou (ou não existe): ${name}`);

if (problems.length > 0) {
  for (const problem of problems) console.error(`expect-red: ${problem}`);
  process.exit(1);
}
console.log(
  `expect-red: OK (${collected} coletados, ${failed.size} vermelhos esperados, ${collected - failed.size} verdes)`,
);
