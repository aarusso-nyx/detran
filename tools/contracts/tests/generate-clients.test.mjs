// Testes de `tools/contracts/generate-clients.mjs` (TASK-0012, WP-T3, CTG-0005 §4 e §7).
//
// `generateClients` já existe (C-5-17…C-5-21 abaixo passam). `checkClients`
// (adenda §9.16 item 15: `export async function checkClients({ contractsDir,
// outDir }) → Promise<{ ok, problems }>`, com `problems[].kind ∈
// 'stale-client' | 'missing-client' | 'orphan-client'`, sem escrever em
// `outDir`) ainda não existe — TASK-0010 (Engineer) o implementa em paralelo
// a esta tarefa. Por isso os testes de C-5-22 e das quatro variações de
// `checkClients` (em sincronia, stale-client, orphan-client, missing-client)
// falham hoje só por `checkClients is not a function` (o módulo importa sem
// erro; o nome só não está exportado ainda) — é o vermelho esperado. Qualquer
// outra falha, depois que `checkClients` existir, é defeito do gerador ou do
// teste.
//
// Fixtures em tools/contracts/tests/fixtures/generate-clients/ (nunca os contratos reais):
// um `*.openapi.json` (imita o gerado) e um `*.commands.openapi.json` (imita o manuscrito),
// ambos mínimos e válidos para `openapi-typescript` (já presente no workspace, 7.13.0 — a
// instalação é ato do maestro, nunca deste teste).
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { promisify } from 'node:util';
import test from 'node:test';
// Namespace import (não `import { checkClients, generateClients } from …`):
// `checkClients` ainda não é um export nomeado do módulo (TASK-0010 em
// paralelo) e um `import { checkClients }` estático quebraria o
// carregamento do arquivo inteiro com um SyntaxError de "export ausente" —
// inclusive os testes de `generateClients` que já passam hoje. Com o
// namespace, `generateClientsModule.checkClients` é apenas `undefined` até
// existir, e cada teste que o chama falha isoladamente (TypeError "is not a
// function"), não o arquivo inteiro.
import * as generateClientsModule from '../generate-clients.mjs';

const { generateClients } = generateClientsModule;

const exec = promisify(execFile);
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const fixturesDir = join(
  root,
  'tools/contracts/tests/fixtures/generate-clients',
);
const cli = join(root, 'tools/contracts/generate-clients.mjs');

async function readFixture(name) {
  return readFile(join(fixturesDir, name), 'utf8');
}

async function scenario(files = {}) {
  const dir = await mkdtemp(join(tmpdir(), 'detran-generate-clients-'));
  const contractsDir = join(dir, 'contracts');
  const outDir = join(dir, 'generated');
  await mkdir(contractsDir, { recursive: true });
  for (const [name, content] of Object.entries(files)) {
    await writeFile(
      join(contractsDir, name),
      content ?? (await readFixture(name)),
      'utf8',
    );
  }
  return { dir, contractsDir, outDir };
}

async function cleanup(s) {
  await rm(s.dir, { recursive: true, force: true });
}

// A CLI de generate-clients.mjs não tem opções de diretório (CTG-0005 §4.2, diferente de
// check-commands.mjs em §3.4): contractsDir/outDir só têm default relativo a `process.cwd()`
// (mesma convenção de tools/contracts/generate-openapi.mjs, `const root = process.cwd()`).
// Por isso a fixture de CLI monta uma raiz temporária própria — nunca `--contracts-dir`
// nem `--out-dir`, que o contrato não define — e roda o processo com `cwd` nela, para nunca
// tocar docs/framework/contracts/ nem packages/api-clients/src/generated/ reais.
async function cliScenario(files = {}) {
  const fakeRoot = await mkdtemp(
    join(tmpdir(), 'detran-generate-clients-cli-'),
  );
  const contractsDir = join(fakeRoot, 'docs/framework/contracts');
  const outDir = join(fakeRoot, 'packages/api-clients/src/generated');
  await mkdir(contractsDir, { recursive: true });
  for (const [name, content] of Object.entries(files)) {
    await writeFile(
      join(contractsDir, name),
      content ?? (await readFixture(name)),
      'utf8',
    );
  }
  return { fakeRoot, contractsDir, outDir };
}

async function cleanupCli(s) {
  await rm(s.fakeRoot, { recursive: true, force: true });
}

async function runCli(fakeRoot) {
  try {
    const result = await exec(process.execPath, [cli], { cwd: fakeRoot });
    return { status: 0, stdout: result.stdout, stderr: result.stderr };
  } catch (error) {
    return {
      status: typeof error.code === 'number' ? error.code : 1,
      stdout: error.stdout ?? '',
      stderr: error.stderr ?? String(error),
    };
  }
}

test('dado um contrato gerado e um contrato de comando quando generateClients então escreve um .ts por arquivo com export interface paths', async () => {
  const s = await scenario({
    'BP-DEMO-001.openapi.json': null,
    'BP-DEMO-001.commands.openapi.json': null,
  });
  try {
    const result = await generateClients({
      contractsDir: s.contractsDir,
      outDir: s.outDir,
    });
    assert.equal(result.written.length, 2);
    const generated = await readFile(join(s.outDir, 'BP-DEMO-001.ts'), 'utf8');
    const commands = await readFile(
      join(s.outDir, 'BP-DEMO-001.commands.ts'),
      'utf8',
    );
    // CTG-0005 §4.2: "cabeçalho primeira linha de todo arquivo gerado: `// Generated
    // from docs/framework/contracts/<arquivo>. Do not edit.`" — o `<arquivo>` aqui é o
    // nome real dentro do contractsDir da fixture, não o caminho canônico do repositório
    // (que só existe quando contractsDir é o default); por isso o teste casa o nome do
    // arquivo de origem e o sufixo fixo, sem fixar o diretório.
    assert.match(
      generated,
      /^\/\/ Generated from .*BP-DEMO-001\.openapi\.json\. Do not edit\.\n/,
    );
    assert.match(generated, /export interface paths/);
    assert.match(commands, /export interface paths/);
  } finally {
    await cleanup(s);
  }
});

// `X.commands.openapi.json` → `X.commands.ts`: o sufixo `.commands` sobrevive no nome do
// módulo (CTG-0005 §4.2), nunca é confundido com o `.openapi.json` gerado homônimo.
test('dado BP-DEMO-001.commands.openapi.json quando generateClients então a saída é BP-DEMO-001.commands.ts', async () => {
  const s = await scenario({ 'BP-DEMO-001.commands.openapi.json': null });
  try {
    const result = await generateClients({
      contractsDir: s.contractsDir,
      outDir: s.outDir,
    });
    assert.deepEqual(
      result.written.map((entry) => entry.split('/').pop()),
      ['BP-DEMO-001.commands.ts'],
    );
    await assert.doesNotReject(
      readFile(join(s.outDir, 'BP-DEMO-001.commands.ts'), 'utf8'),
    );
  } finally {
    await cleanup(s);
  }
});

test('dada a mesma entrada quando gerar duas vezes então os bytes de saída são idênticos (idempotência)', async () => {
  const s = await scenario({
    'BP-DEMO-001.openapi.json': null,
    'BP-DEMO-001.commands.openapi.json': null,
  });
  try {
    const first = await generateClients({
      contractsDir: s.contractsDir,
      outDir: s.outDir,
    });
    const beforeGenerated = await readFile(
      join(s.outDir, 'BP-DEMO-001.ts'),
      'utf8',
    );
    const beforeCommands = await readFile(
      join(s.outDir, 'BP-DEMO-001.commands.ts'),
      'utf8',
    );
    const second = await generateClients({
      contractsDir: s.contractsDir,
      outDir: s.outDir,
    });
    const afterGenerated = await readFile(
      join(s.outDir, 'BP-DEMO-001.ts'),
      'utf8',
    );
    const afterCommands = await readFile(
      join(s.outDir, 'BP-DEMO-001.commands.ts'),
      'utf8',
    );
    assert.equal(afterGenerated, beforeGenerated);
    assert.equal(afterCommands, beforeCommands);
    assert.deepEqual(
      first.written.slice().sort(),
      second.written.slice().sort(),
    );
  } finally {
    await cleanup(s);
  }
});

test('dado um .ts órfão em outDir quando generateClients então é removido e não aparece em written', async () => {
  const s = await scenario({ 'BP-DEMO-001.openapi.json': null });
  try {
    await mkdir(s.outDir, { recursive: true });
    const orphan = join(s.outDir, 'BP-GHOST-001.ts');
    await writeFile(orphan, '// órfão de propósito\n', 'utf8');
    const result = await generateClients({
      contractsDir: s.contractsDir,
      outDir: s.outDir,
    });
    await assert.rejects(readFile(orphan, 'utf8'));
    assert.ok(!result.written.some((entry) => entry.includes('BP-GHOST-001')));
    const remaining = await readdir(s.outDir);
    assert.deepEqual(remaining, ['BP-DEMO-001.ts']);
  } finally {
    await cleanup(s);
  }
});

test('dado contrato com JSON inválido quando rodar a CLI então exit 1 e o arquivo de saída anterior não é truncado', async () => {
  const s = await cliScenario({ 'BP-DEMO-001.openapi.json': null });
  try {
    const first = await runCli(s.fakeRoot);
    assert.equal(first.status, 0, first.stderr);
    const before = await readFile(join(s.outDir, 'BP-DEMO-001.ts'), 'utf8');
    assert.ok(before.length > 0);

    await writeFile(
      join(s.contractsDir, 'BP-BROKEN-001.openapi.json'),
      '{ "openapi": "3.1.0", "info": { ',
      'utf8',
    );
    const second = await runCli(s.fakeRoot);
    assert.equal(second.status, 1);
    assert.match(second.stderr, /BP-BROKEN-001\.openapi\.json/);

    const after = await readFile(join(s.outDir, 'BP-DEMO-001.ts'), 'utf8');
    assert.equal(after, before);
  } finally {
    await cleanupCli(s);
  }
});

test('dado o conjunto fixture sem erros quando rodar a CLI então stdout "clients written: 2"', async () => {
  const s = await cliScenario({
    'BP-DEMO-001.openapi.json': null,
    'BP-DEMO-001.commands.openapi.json': null,
  });
  try {
    const result = await runCli(s.fakeRoot);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout, 'clients written: 2\n');
  } finally {
    await cleanupCli(s);
  }
});

// ---------------------------------------------------------------------------
// Iteração 2 (delivery-review ciclo 1, adenda §9.16 item 15): `checkClients`
// — em sincronia, stale-client, orphan-client, missing-client — e C-5-22
// (repositório real). `checkClients` não tem ids C-5-nn próprios em
// CTG-0005 §7 (nasceu na adenda, depois da numeração original); os quatro
// nomes de teste abaixo usam o nome da função como prefixo, no lugar de um
// id C-5-nn inexistente.
// ---------------------------------------------------------------------------

test('checkClients — em sincronia (outDir gerado a partir do mesmo contractsDir) então ok=true e problems=[]', async () => {
  const s = await scenario({
    'BP-DEMO-001.openapi.json': null,
    'BP-DEMO-001.commands.openapi.json': null,
  });
  try {
    await generateClients({ contractsDir: s.contractsDir, outDir: s.outDir });
    const result = await generateClientsModule.checkClients({
      contractsDir: s.contractsDir,
      outDir: s.outDir,
    });
    assert.equal(result.ok, true, JSON.stringify(result.problems));
    assert.deepEqual(result.problems, []);
  } finally {
    await cleanup(s);
  }
});

test('checkClients — stale-client (arquivo em outDir diverge do que generateClients produziria) então um stale-client citando o arquivo, sem corrigi-lo', async () => {
  const s = await scenario({ 'BP-DEMO-001.openapi.json': null });
  try {
    await generateClients({ contractsDir: s.contractsDir, outDir: s.outDir });
    const filePath = join(s.outDir, 'BP-DEMO-001.ts');
    const original = await readFile(filePath, 'utf8');
    const divergent = `${original}\n// alterado à mão, propositalmente divergente\n`;
    await writeFile(filePath, divergent, 'utf8');

    const result = await generateClientsModule.checkClients({
      contractsDir: s.contractsDir,
      outDir: s.outDir,
    });
    assert.equal(result.ok, false);
    assert.equal(result.problems.length, 1, JSON.stringify(result.problems));
    assert.equal(result.problems[0].kind, 'stale-client');
    assert.match(result.problems[0].file, /BP-DEMO-001\.ts/);

    // "sem escrever em outDir" (CTG-0005 adenda §9.16 item 15): o arquivo
    // continua divergente depois de checkClients.
    const stillDivergent = await readFile(filePath, 'utf8');
    assert.equal(stillDivergent, divergent);
  } finally {
    await cleanup(s);
  }
});

test('checkClients — orphan-client (.ts em outDir sem *.openapi.json correspondente) então um orphan-client citando o arquivo, sem removê-lo', async () => {
  const s = await scenario({ 'BP-DEMO-001.openapi.json': null });
  try {
    await generateClients({ contractsDir: s.contractsDir, outDir: s.outDir });
    const orphanPath = join(s.outDir, 'BP-GHOST-001.ts');
    await writeFile(orphanPath, '// órfão de propósito\n', 'utf8');

    const result = await generateClientsModule.checkClients({
      contractsDir: s.contractsDir,
      outDir: s.outDir,
    });
    assert.equal(result.ok, false);
    const orphan = result.problems.filter(
      (problem) => problem.kind === 'orphan-client',
    );
    assert.equal(orphan.length, 1, JSON.stringify(result.problems));
    assert.match(orphan[0].file, /BP-GHOST-001\.ts/);

    // "sem escrever em outDir": diferente de `generateClients`, `checkClients`
    // nunca remove o órfão.
    await assert.doesNotReject(readFile(orphanPath, 'utf8'));
  } finally {
    await cleanup(s);
  }
});

test('checkClients — missing-client (*.openapi.json sem .ts correspondente em outDir) então um missing-client citando o arquivo esperado', async () => {
  const s = await scenario({
    'BP-DEMO-001.openapi.json': null,
    'BP-DEMO-001.commands.openapi.json': null,
  });
  try {
    await generateClients({ contractsDir: s.contractsDir, outDir: s.outDir });
    await rm(join(s.outDir, 'BP-DEMO-001.commands.ts'));

    const result = await generateClientsModule.checkClients({
      contractsDir: s.contractsDir,
      outDir: s.outDir,
    });
    assert.equal(result.ok, false);
    const missing = result.problems.filter(
      (problem) => problem.kind === 'missing-client',
    );
    assert.equal(missing.length, 1, JSON.stringify(result.problems));
    assert.match(missing[0].file, /BP-DEMO-001\.commands\.ts/);
  } finally {
    await cleanup(s);
  }
});

test('checkClients — CLI --check: exit 0 "clients in sync: <n>" quando em sincronia; exit 1 com stderr quando divergente', async () => {
  const s = await cliScenario({
    'BP-DEMO-001.openapi.json': null,
    'BP-DEMO-001.commands.openapi.json': null,
  });
  try {
    const generated = await runCli(s.fakeRoot);
    assert.equal(generated.status, 0, generated.stderr);

    const inSync = await exec(process.execPath, [cli, '--check'], {
      cwd: s.fakeRoot,
    }).then(
      (result) => ({ status: 0, stdout: result.stdout, stderr: result.stderr }),
      (error) => ({
        status: typeof error.code === 'number' ? error.code : 1,
        stdout: error.stdout ?? '',
        stderr: error.stderr ?? String(error),
      }),
    );
    assert.equal(inSync.status, 0, inSync.stderr);
    assert.match(inSync.stdout, /^clients in sync: 2\n?$/);

    await writeFile(
      join(s.outDir, 'BP-DEMO-001.ts'),
      '// divergente de propósito\n',
      'utf8',
    );
    const outOfSync = await exec(process.execPath, [cli, '--check'], {
      cwd: s.fakeRoot,
    }).then(
      (result) => ({ status: 0, stdout: result.stdout, stderr: result.stderr }),
      (error) => ({
        status: typeof error.code === 'number' ? error.code : 1,
        stdout: error.stdout ?? '',
        stderr: error.stderr ?? String(error),
      }),
    );
    assert.equal(outOfSync.status, 1);
    assert.match(outOfSync.stderr, /stale-client/);
  } finally {
    await cleanupCli(s);
  }
});

test('C-5-22 — dado o repositório real (sem flags) quando checkClients então ok=true', async () => {
  const result = await generateClientsModule.checkClients();
  assert.equal(result.ok, true, JSON.stringify(result.problems, null, 2));
});
