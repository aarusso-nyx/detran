// R-0031 TASK-0011 (Inspector, Art. 7). OD-PW-004: `pec.*` é exclusivamente uma
// allowlist de namespaces i18n provisória; não representa uma superfície nem autoriza
// chaves de parâmetro. As cópias de catálogo e fontes são temporárias.
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import test from 'node:test';
import { parseCatalogue } from '../parser.mjs';

const exec = promisify(execFile);
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const verifier = join(root, 'tools/parameters/verify.mjs');
const realCatalogue = join(root, 'docs/framework/arch/parameter-catalogue.md');

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

async function temporaryFile(prefix, name, content) {
  const directory = await mkdtemp(`/tmp/detran-allowlist-${prefix}-`);
  const path = join(directory, name);
  await writeFile(path, content, 'utf8');
  return { directory, path };
}

async function temporaryCatalogue(text) {
  return temporaryFile('pec-catalogue', 'parameter-catalogue.md', text);
}

test('dado o catálogo com os cinco namespaces pec quando parseado então a allowlist i18n é aceita na ordem do contrato', async () => {
  const model = await parseCatalogue(realCatalogue);
  assert.deepEqual(
    model.i18nNamespaces
      .filter(({ namespace }) => namespace.startsWith('pec.'))
      .map(({ namespace }) => namespace),
    ['pec.screens', 'pec.forms', 'pec.states', 'pec.errors', 'pec.legal'],
  );
});

test('dado um arquivo com pec.screens e pec.states quando verify:parameter-catalogue --check-usage roda então os literais i18n são aceitos', async () => {
  const source = await temporaryFile(
    'pec-usage',
    'candidate.ts',
    "const screen = 'pec.screens.agenda.title';\nconst state = 'pec.states.AGENDADO';\n",
  );
  try {
    const result = await run([
      '--check-usage',
      '--source',
      source.path,
      '--catalogue',
      realCatalogue,
    ]);
    assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
    assert.match(result.stdout, /verify:parameter-catalogue: OK/);
  } finally {
    await rm(source.directory, { recursive: true, force: true });
  }
});

test('dado uma chave pec.* na tabela BOAT quando o catálogo é validado então ela é rejeitada e pec permanece exclusivo de namespace i18n', async () => {
  const original = await readFile(realCatalogue, 'utf8');
  const invalid = original.replace(
    '| `est.catalog.crash_type`',
    '| `pec.catalog.crash_type`',
  );
  const catalogue = await temporaryCatalogue(invalid);
  try {
    const result = await run(['--catalogue', catalogue.path]);
    assert.notEqual(result.status, 0);
    assert.match(
      `${result.stdout}\n${result.stderr}`,
      /incompatible prefix for pec\.catalog\.crash_type/,
    );
  } finally {
    await rm(catalogue.directory, { recursive: true, force: true });
  }
});

test('dado um arquivo varrido com pec.experimental.title quando verify:parameter-catalogue roda então falha por namespace fora da allowlist', async () => {
  const source = await temporaryFile(
    'pec-unknown',
    'candidate.ts',
    "const key = 'pec.experimental.title';\n",
  );
  try {
    const result = await run([
      '--check-usage',
      '--source',
      source.path,
      '--catalogue',
      realCatalogue,
    ]);
    assert.notEqual(result.status, 0);
    assert.match(
      `${result.stdout}\n${result.stderr}`,
      /unknown parameter literal pec\.experimental\.title/,
    );
  } finally {
    await rm(source.directory, { recursive: true, force: true });
  }
});
