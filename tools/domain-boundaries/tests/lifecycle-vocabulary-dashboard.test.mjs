// R-0011 TASK-0011 (Inspector) — cobre a extensão DASHBOARD de
// `tools/check-lifecycle-vocabulary.ts` (M9 a; CTG-0001.md §3, §7). O
// verificador lê todos os seus caminhos a partir de `process.cwd()`
// (`const root = process.cwd()`), então o único jeito de testá-lo sem tocar
// nos arquivos reais do repositório é copiar o script + DDL + workflows para
// um diretório temporário e rodar `tsx` com `cwd` nesse diretório —
// exatamente como pedido pelo prompt (§Critérios de aceitação). Este
// arquivo mora em `tools/domain-boundaries/tests/` por exigência literal do
// mesmo critério, embora exercite `check-lifecycle-vocabulary.ts` (não o
// gate de fronteiras de domínio).
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const tsxBin = join(repoRoot, 'node_modules', '.bin', 'tsx');

// Todo caminho que `tools/check-lifecycle-vocabulary.ts` lê a partir de
// `process.cwd()` (INF, EST e DASHBOARD) — precisa da árvore inteira para
// que o script rode sem `ENOENT`, mesmo quando o teste só mexe no DDL 19 do
// DASHBOARD.
const RELATIVE_PATHS = [
  'tools/check-lifecycle-vocabulary.ts',
  'backend/database/ddl/14-inf-lifecycle-vocabulary.sql',
  'backend/database/ddl/19-est-lifecycle-vocabulary.sql',
  'backend/database/ddl/19-dashboard-lifecycle-vocabulary.sql',
  'docs/framework/product/shared/workflows/WF-INF-003.md',
  'docs/framework/product/shared/workflows/WF-INF-002.md',
  'docs/framework/product/domains/inf/teat/workflows/WF-TEAT-001.md',
  'docs/framework/product/domains/est/boat/workflows/WF-BOAT-001.md',
  'docs/framework/product/domains/est/boat/workflows/WF-BOAT-003.md',
  'docs/framework/product/transversal/dashboard/workflows/WF-DASH-001.md',
  'docs/framework/product/transversal/dashboard/workflows/WF-DASH-002.md',
  'docs/framework/product/transversal/dashboard/workflows/WF-DASH-003.md',
];

async function stagedCopy() {
  const tmpRoot = await mkdtemp(
    join(tmpdir(), 'detran-lifecycle-vocabulary-dashboard-'),
  );
  await Promise.all(
    RELATIVE_PATHS.map(async (relativePath) => {
      const content = await readFile(join(repoRoot, relativePath), 'utf8');
      const target = join(tmpRoot, relativePath);
      await mkdir(dirname(target), { recursive: true });
      await writeFile(target, content, 'utf8');
    }),
  );
  return tmpRoot;
}

function run(tmpRoot) {
  try {
    return {
      status: 0,
      stdout: execFileSync(
        tsxBin,
        [join(tmpRoot, 'tools/check-lifecycle-vocabulary.ts')],
        { cwd: tmpRoot, encoding: 'utf8' },
      ),
      stderr: '',
    };
  } catch (error) {
    return {
      status: error.status ?? 1,
      stdout: error.stdout ?? '',
      stderr: error.stderr ?? '',
    };
  }
}

test('dado a árvore copiada intacta (DDL 19-dashboard-lifecycle-vocabulary.sql sem mutação) quando check-lifecycle-vocabulary roda no diretório temporário então passa (linha de base da mutação abaixo)', async () => {
  const tmpRoot = await stagedCopy();
  try {
    const result = run(tmpRoot);
    assert.equal(result.status, 0, result.stdout + result.stderr);
  } finally {
    await rm(tmpRoot, { recursive: true, force: true });
  }
});

test('dado DDL 19-dashboard-lifecycle-vocabulary.sql mutilado (linha ENCERRADO removida de dashboard.alert_state_ref) quando check-lifecycle-vocabulary roda no diretório temporário então falha com "dashboard alert_state_ref"', async () => {
  const tmpRoot = await stagedCopy();
  try {
    const ddlPath = join(
      tmpRoot,
      'backend/database/ddl/19-dashboard-lifecycle-vocabulary.sql',
    );
    const original = await readFile(ddlPath, 'utf8');
    const mutated = original.replace(
      /\s*\('ENCERRADO', 70, true, 'both'[^\n]*\n/,
      '\n',
    );
    assert.notEqual(
      mutated,
      original,
      'a fixture precisa realmente remover a linha ENCERRADO — se este assert falhar, o DDL real mudou de forma e a mutação parou de casar',
    );
    await writeFile(ddlPath, mutated, 'utf8');

    const result = run(tmpRoot);
    assert.notEqual(result.status, 0, result.stdout + result.stderr);
    assert.match(result.stderr, /dashboard alert_state_ref/);
  } finally {
    await rm(tmpRoot, { recursive: true, force: true });
  }
});
