// R-0014 CTG-0001 / TASK-0002 (Inspector). Fixa o contrato de `--catalogue <path>` para
// `verify.mjs --check-usage` (M10 de work/rounds/R-0014/plan.md): literal com ≥ 2 pontos cujos
// dois primeiros segmentos formem um namespace declarado na tabela "## Namespaces i18n
// (allowlist do verificador)" do catálogo não é candidato a `unknown parameter literal`.
// `--catalogue` ainda não existe em tools/parameters/verify.mjs (TASK-0003 a implementa com
// esse nome exato) — até lá, os casos 1–5 e 8 abaixo falham porque o verificador continua
// resolvendo sempre docs/framework/arch/parameter-catalogue.md e mantém a exclusão de
// diretório de R-0009 (A7). Os casos 6 e 7 exercitam comportamento já existente hoje.
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import test from 'node:test';

const exec = promisify(execFile);
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const verifier = join(root, 'tools/parameters/verify.mjs');
const fixtures = join(root, 'tools/parameters/fixtures');
const catalogueAllow = join(fixtures, 'namespaces-allow.txt');
const catalogueCollision = join(fixtures, 'namespaces-collision.txt');
const catalogueBadPrefix = join(fixtures, 'namespaces-bad-prefix.txt');
const catalogueMalformed = join(fixtures, 'namespaces-malformed.txt');
const catalogueNoNamespaces = join(fixtures, 'minimal-catalogue.txt');
const realCatalogue = join(root, 'docs/framework/arch/parameter-catalogue.md');
const realUsageTarget = join(root, 'packages/api-clients/src/generated');

async function run(args) {
  try {
    const result = await exec(process.execPath, [verifier, ...args], {
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

async function temporarySourceFile(content) {
  const directory = await mkdtemp('/tmp/detran-parameter-usage-');
  const source = join(directory, 'candidate.ts');
  await writeFile(source, content, 'utf8');
  return { directory, source };
}

test('dado allowlist com portal.errors quando arquivo usa portal.errors.not_found então exit 0 sem literal desconhecido', async () => {
  const temporary = await temporarySourceFile(
    "const key = 'portal.errors.not_found';\n",
  );
  try {
    const result = await run([
      '--check-usage',
      '--source',
      temporary.source,
      '--catalogue',
      catalogueAllow,
    ]);
    assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
    assert.doesNotMatch(
      `${result.stdout}\n${result.stderr}`,
      /unknown parameter literal/,
    );
  } finally {
    await rm(temporary.directory, { recursive: true, force: true });
  }
});

test('dado allowlist com portal.errors quando arquivo usa portal.foo.bar então exit 1 com literal desconhecido', async () => {
  const temporary = await temporarySourceFile(
    "const key = 'portal.foo.bar';\n",
  );
  try {
    const result = await run([
      '--check-usage',
      '--source',
      temporary.source,
      '--catalogue',
      catalogueAllow,
    ]);
    assert.notEqual(result.status, 0);
    assert.match(
      `${result.stdout}\n${result.stderr}`,
      /unknown parameter literal portal\.foo\.bar/,
    );
  } finally {
    await rm(temporary.directory, { recursive: true, force: true });
  }
});

test('dado namespace rait.timer em colisão com a chave rait.timer.T-DEF quando verificar então exit ≠ 0 citando a colisão', async () => {
  const temporary = await temporarySourceFile(
    "const key = 'rait.timer.forced';\n",
  );
  try {
    const result = await run([
      '--check-usage',
      '--source',
      temporary.source,
      '--catalogue',
      catalogueCollision,
    ]);
    assert.notEqual(result.status, 0);
    assert.match(`${result.stdout}\n${result.stderr}`, /rait\.timer/);
  } finally {
    await rm(temporary.directory, { recursive: true, force: true });
  }
});

test('dado namespace foo.bar fora dos prefixos de superfície quando verificar então exit ≠ 0 com diagnóstico', async () => {
  const temporary = await temporarySourceFile("const key = 'foo.bar.baz';\n");
  try {
    const result = await run([
      '--check-usage',
      '--source',
      temporary.source,
      '--catalogue',
      catalogueBadPrefix,
    ]);
    assert.notEqual(result.status, 0);
    assert.match(`${result.stdout}\n${result.stderr}`, /foo\.bar/);
  } finally {
    await rm(temporary.directory, { recursive: true, force: true });
  }
});

test('dado tabela de namespaces malformada (três colunas) quando verificar então exit ≠ 0 com arquivo e linha', async () => {
  const temporary = await temporarySourceFile(
    "const key = 'portal.errors.not_found';\n",
  );
  try {
    const result = await run([
      '--check-usage',
      '--source',
      temporary.source,
      '--catalogue',
      catalogueMalformed,
    ]);
    assert.notEqual(result.status, 0);
    const diagnostic = `${result.stdout}\n${result.stderr}`;
    assert.match(diagnostic, /namespaces-malformed\.txt/);
    assert.match(diagnostic, /:\d+/);
  } finally {
    await rm(temporary.directory, { recursive: true, force: true });
  }
});

test('dado catálogo sem seção de namespaces quando arquivo usa portal.errors.not_found então comportamento atual (candidato, exit 1)', async () => {
  const temporary = await temporarySourceFile(
    "const key = 'portal.errors.not_found';\n",
  );
  try {
    const result = await run([
      '--check-usage',
      '--source',
      temporary.source,
      '--catalogue',
      catalogueNoNamespaces,
    ]);
    assert.equal(result.status, 1);
    assert.match(
      `${result.stdout}\n${result.stderr}`,
      /unknown parameter literal portal\.errors\.not_found/,
    );
  } finally {
    await rm(temporary.directory, { recursive: true, force: true });
  }
});

test('dado literal de um ponto (portal.complaint) quando verificar então nunca é candidato, com ou sem allowlist', async () => {
  const temporary = await temporarySourceFile(
    "const key = 'portal.complaint';\n",
  );
  try {
    const withAllowlist = await run([
      '--check-usage',
      '--source',
      temporary.source,
      '--catalogue',
      catalogueAllow,
    ]);
    assert.equal(
      withAllowlist.status,
      0,
      `${withAllowlist.stdout}\n${withAllowlist.stderr}`,
    );
    assert.doesNotMatch(
      `${withAllowlist.stdout}\n${withAllowlist.stderr}`,
      /portal\.complaint/,
    );
    const withoutAllowlist = await run([
      '--check-usage',
      '--source',
      temporary.source,
      '--catalogue',
      catalogueNoNamespaces,
    ]);
    assert.equal(
      withoutAllowlist.status,
      0,
      `${withoutAllowlist.stdout}\n${withoutAllowlist.stderr}`,
    );
    assert.doesNotMatch(
      `${withoutAllowlist.stdout}\n${withoutAllowlist.stderr}`,
      /portal\.complaint/,
    );
  } finally {
    await rm(temporary.directory, { recursive: true, force: true });
  }
});

test('dado catálogo real quando a varredura cobre packages/api-clients/src/generated então exit 0 (exclusão de diretório saiu)', async () => {
  const result = await run([
    '--check-usage',
    '--source',
    realUsageTarget,
    '--catalogue',
    realCatalogue,
  ]);
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.doesNotMatch(
    `${result.stdout}\n${result.stderr}`,
    /unknown parameter literal/,
  );
});
