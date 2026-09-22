// R-0012 TASK-0005 (Inspector). Critérios C-2A-61/62 do contrato `CTG-0002a.md` §11: a
// allowlist i18n `rait.*` (M5/A1) sobre `tools/parameters/verify.mjs` — padrão de
// `tools/parameters/tests/verify-usage.test.mjs`. Nunca edita `docs/framework/arch/
// parameter-catalogue.md`: cópias temporárias em `mkdtemp`, removidas ao final de cada teste.
// Lock `MOD-tools-parameters-tests` (novo arquivo; os existentes em `tools/parameters/tests/`
// não são tocados).
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

async function temporaryCatalogue(text) {
  const directory = await mkdtemp('/tmp/detran-allowlist-rait-');
  const path = join(directory, 'parameter-catalogue.md');
  await writeFile(path, text, 'utf8');
  return { directory, path };
}

async function temporarySourceFile(content) {
  const directory = await mkdtemp('/tmp/detran-allowlist-rait-usage-');
  const source = join(directory, 'candidate.ts');
  await writeFile(source, content, 'utf8');
  return { directory, source };
}

function insertNamespaceRow(catalogueText, row) {
  const marker = '## Namespaces i18n (allowlist do verificador)';
  const index = catalogueText.indexOf(marker);
  assert.ok(index >= 0, 'catálogo real sem a seção Namespaces i18n');
  // A tabela começa duas linhas de cabeçalho depois do heading; insere a nova linha logo após a
  // linha de separação `| --- | --- | --- | --- |` seguinte ao heading.
  const afterHeading = catalogueText.slice(index);
  const separatorMatch = /\| ?-{2,} ?\|[^\n]*\n/.exec(afterHeading);
  assert.ok(separatorMatch, 'separador da tabela de namespaces não encontrado');
  const insertAt = index + separatorMatch.index + separatorMatch[0].length;
  return (
    catalogueText.slice(0, insertAt) +
    row +
    '\n' +
    catalogueText.slice(insertAt)
  );
}

test('dado a tabela real (sem os 9 namespaces de token do RAIT) quando verify.mjs roda então OK', async () => {
  const result = await run(['--catalogue', realCatalogue]);
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.match(`${result.stdout}`, /verify:parameter-catalogue: OK/);
});

test('[pode falhar até TASK-0006] dado a tabela real quando parseada então já contém as 14 linhas rait.* de apps/rait/web', async () => {
  const model = await parseCatalogue(realCatalogue);
  const raitRows = model.i18nNamespaces.filter((entry) =>
    entry.namespace.startsWith('rait.'),
  );
  assert.equal(
    raitRows.length,
    14,
    'TASK-0006 ainda não acrescentou as 14 linhas rait.* (M5) — falha esperada nesta entrega',
  );
});

test('dado a tabela real com a linha `rait.timer` acrescentada (cópia temporária) quando verify.mjs roda então falha por colisão com rait.timer.*', async () => {
  const original = await readFile(realCatalogue, 'utf8');
  const withRow = insertNamespaceRow(
    original,
    '| `rait.timer` | apps/rait/web | src/app/i18n/rait.pt-BR.json | OD-P46 |',
  );
  const temporary = await temporaryCatalogue(withRow);
  try {
    const result = await run(['--catalogue', temporary.path]);
    assert.notEqual(result.status, 0);
    assert.match(`${result.stdout}\n${result.stderr}`, /rait\.timer/);
    assert.match(
      `${result.stdout}\n${result.stderr}`,
      /collides with parameter key/,
    );
  } finally {
    await rm(temporary.directory, { recursive: true, force: true });
  }
});

test('dado a linha `rait.caseState` (cópia temporária) quando parseada então rejeitada pela gramática [a-z][a-z0-9_]*', async () => {
  const original = await readFile(realCatalogue, 'utf8');
  const withRow = insertNamespaceRow(
    original,
    '| `rait.caseState` | apps/rait/web | src/app/i18n/rait.pt-BR.json | OD-P46 |',
  );
  const temporary = await temporaryCatalogue(withRow);
  try {
    const result = await run(['--catalogue', temporary.path]);
    assert.notEqual(result.status, 0);
    assert.match(
      `${result.stdout}\n${result.stderr}`,
      /invalid i18n namespace rait\.caseState/,
    );
  } finally {
    await rm(temporary.directory, { recursive: true, force: true });
  }
});

test('dado um arquivo .ts com o literal "rait.caseState.ADMITIDO" quando verify.mjs --check-usage roda então falha (candidato desconhecido)', async () => {
  const temporary = await temporarySourceFile(
    "const key = 'rait.caseState.ADMITIDO';\n",
  );
  try {
    const result = await run([
      '--check-usage',
      '--source',
      temporary.source,
      '--catalogue',
      realCatalogue,
    ]);
    assert.notEqual(result.status, 0);
    assert.match(
      `${result.stdout}\n${result.stderr}`,
      /unknown parameter literal rait\.caseState\.ADMITIDO/,
    );
  } finally {
    await rm(temporary.directory, { recursive: true, force: true });
  }
});

test("dado um arquivo .ts com \"'rait.' + 'caseState' + '.ADMITIDO'\" (composição) quando verify.mjs --check-usage roda então OK", async () => {
  const temporary = await temporarySourceFile(
    "const key = 'rait.' + 'caseState' + '.ADMITIDO';\n",
  );
  try {
    const result = await run([
      '--check-usage',
      '--source',
      temporary.source,
      '--catalogue',
      realCatalogue,
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

test('dado um arquivo .ts com "rait.screens.painel.title" e a tabela real (já allowlista rait.screens, TASK-0006) quando verify.mjs --check-usage roda então OK', async () => {
  // A7(h): a tabela real de `parameter-catalogue.md` já contém a linha `rait.screens` (uma das
  // 14 `rait.*` acrescentadas por TASK-0006) — o caso positivo usa a tabela real diretamente;
  // inserir uma segunda linha `rait.screens` via `insertNamespaceRow` duplicaria o namespace e
  // faria `verify.mjs` falhar por "duplicate i18n namespace".
  const temporarySource = await temporarySourceFile(
    "const key = 'rait.screens.painel.title';\n",
  );
  try {
    const result = await run([
      '--check-usage',
      '--source',
      temporarySource.source,
      '--catalogue',
      realCatalogue,
    ]);
    assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
    assert.doesNotMatch(
      `${result.stdout}\n${result.stderr}`,
      /unknown parameter literal/,
    );
  } finally {
    await rm(temporarySource.directory, { recursive: true, force: true });
  }
});
