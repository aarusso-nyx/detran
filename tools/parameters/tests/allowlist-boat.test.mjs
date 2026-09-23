// R-0015 TASK-0004 (Inspector, Art. 6). CTG-0001 §2 e M11: a exceção `boat.*` é
// exclusivamente uma allowlist de namespaces i18n; parâmetros da superfície BOAT
// continuam usando `est.*`. As cópias de catálogo e fontes são temporárias.
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

function insertNamespaceRow(catalogueText, row) {
  const marker = '## Namespaces i18n (allowlist do verificador)';
  const index = catalogueText.indexOf(marker);
  assert.ok(index >= 0, 'catálogo sem a seção Namespaces i18n');
  const afterHeading = catalogueText.slice(index);
  const separatorMatch = /\| ?-{2,} ?\|[^\n]*\n/.exec(afterHeading);
  assert.ok(separatorMatch, 'separador da tabela de namespaces ausente');
  const insertAt = index + separatorMatch.index + separatorMatch[0].length;
  return (
    catalogueText.slice(0, insertAt) +
    row +
    '\n' +
    catalogueText.slice(insertAt)
  );
}

async function temporaryCatalogue(text) {
  return temporaryFile('boat-catalogue', 'parameter-catalogue.md', text);
}

test('dado o catálogo com os cinco namespaces boat quando parseado então a allowlist é aceita na ordem do contrato', async () => {
  const model = await parseCatalogue(realCatalogue);
  assert.deepEqual(
    model.i18nNamespaces
      .filter(({ namespace }) => namespace.startsWith('boat.'))
      .map(({ namespace }) => namespace),
    ['boat.screens', 'boat.forms', 'boat.states', 'boat.errors', 'boat.legal'],
  );
});

test('dado um arquivo com boat.screens e boat.states quando verify:parameter-catalogue --check-usage roda então os literais são aceitos', async () => {
  const source = await temporaryFile(
    'boat-usage',
    'candidate.ts',
    "const screen = 'boat.screens.crash_start.title';\nconst state = 'boat.states.REGISTRADO';\n",
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

test('dado uma chave boat.* na tabela BOAT quando o catálogo é validado então ela é rejeitada e os parâmetros permanecem est.*', async () => {
  const original = await readFile(realCatalogue, 'utf8');
  const invalid = original.replace(
    '| `est.catalog.crash_type`',
    '| `boat.catalog.crash_type`',
  );
  const catalogue = await temporaryCatalogue(invalid);
  try {
    const result = await run(['--catalogue', catalogue.path]);
    assert.notEqual(result.status, 0);
    assert.match(
      `${result.stdout}\n${result.stderr}`,
      /incompatible prefix for boat\.catalog\.crash_type/,
    );
  } finally {
    await rm(catalogue.directory, { recursive: true, force: true });
  }
});

test('dado um arquivo varrido com boat.experimental.title quando verify:parameter-catalogue roda então falha por namespace fora da allowlist', async () => {
  const source = await temporaryFile(
    'boat-unknown',
    'candidate.ts',
    "const key = 'boat.experimental.title';\n",
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
      /unknown parameter literal boat\.experimental\.title/,
    );
  } finally {
    await rm(source.directory, { recursive: true, force: true });
  }
});

test('dado um namespace estranho quando o catálogo é parseado então ele é rejeitado fail-closed', async () => {
  const original = await readFile(realCatalogue, 'utf8');
  const catalogue = await temporaryCatalogue(
    insertNamespaceRow(
      original,
      '| `strange.screens` | apps/boat/mobile | apps/boat/mobile/src/lib/i18n/boat.pt-BR.json | OD-P46 |',
    ),
  );
  try {
    const result = await run(['--catalogue', catalogue.path]);
    assert.notEqual(result.status, 0);
    assert.match(
      `${result.stdout}\n${result.stderr}`,
      /invalid i18n namespace strange\.screens/,
    );
  } finally {
    await rm(catalogue.directory, { recursive: true, force: true });
  }
});

test('dado uma colisão entre namespace e chave de parâmetro quando o catálogo é validado então falha fail-closed', async () => {
  const original = await readFile(realCatalogue, 'utf8');
  const invalid = original.replace(
    '| `est.catalog.crash_type`',
    '| `est.crash.x`',
  );
  const catalogue = await temporaryCatalogue(invalid);
  try {
    const result = await run(['--catalogue', catalogue.path]);
    assert.notEqual(result.status, 0);
    assert.match(
      `${result.stdout}\n${result.stderr}`,
      /collides with parameter key/,
    );
  } finally {
    await rm(catalogue.directory, { recursive: true, force: true });
  }
});

for (const namespace of ['boat.caseState', 'boat.screens.extra']) {
  test(`dado o namespace literal ${namespace} quando o catálogo é parseado então a gramática rejeita camelCase ou terceiro segmento`, async () => {
    const original = await readFile(realCatalogue, 'utf8');
    const catalogue = await temporaryCatalogue(
      insertNamespaceRow(
        original,
        `| \`${namespace}\` | apps/boat/mobile | apps/boat/mobile/src/lib/i18n/boat.pt-BR.json | OD-P46 |`,
      ),
    );
    try {
      const result = await run(['--catalogue', catalogue.path]);
      assert.notEqual(result.status, 0);
      assert.match(
        `${result.stdout}\n${result.stderr}`,
        new RegExp(`invalid i18n namespace ${namespace.replace('.', '\\.')}`),
      );
    } finally {
      await rm(catalogue.directory, { recursive: true, force: true });
    }
  });
}
