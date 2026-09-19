import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';

/** C-2-13/C-2-14 — contrato do gate: só um `*.projection.ts` que exporte
 * uma lista literal e não vazia de eventos pode ler integration.outbox. */
async function scenario(files) {
  const root = await mkdtemp(join(tmpdir(), 'detran-domain-boundaries-'));
  await Promise.all(
    Object.entries(files).map(async ([path, content]) => {
      const target = join(root, path);
      await mkdir(dirname(target), { recursive: true });
      await writeFile(target, content, 'utf8');
    }),
  );
  return root;
}

function verify(root) {
  try {
    return {
      status: 0,
      output: execFileSync(
        'node',
        ['tools/domain-boundaries/verify.mjs', root],
        { encoding: 'utf8' },
      ),
    };
  } catch (error) {
    return {
      status: error.status ?? 1,
      output: `${error.stdout ?? ''}${error.stderr ?? ''}`,
    };
  }
}

test('dado service com SQL em est.crash_record quando verify:domain-boundaries roda então C-2-13 rejeita a leitura cruzada', async () => {
  const root = await scenario({
    'backend/domains/dashboard/crashes/src/service.ts':
      "export const sql = 'select * from est.crash_record';\n",
  });
  try {
    const result = verify(root);
    assert.equal(result.status, 1, result.output);
    assert.match(result.output, /cross-domain|boundary|est\.crash_record/i);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('dado projetor com consumedEvents literal quando lê integration.outbox então C-2-13 aceita a exceção estrita', async () => {
  const root = await scenario({
    'backend/domains/dashboard/crashes/src/handwritten/dashboard-crashes.projection.ts':
      "export const consumedEvents = ['SINISTRO_FECHADO'] as const;\nexport const sql = 'select * from integration.outbox';\n",
  });
  try {
    const result = verify(root);
    assert.equal(result.status, 0, result.output);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('dado projetor sem lista literal exportada quando lê integration.outbox então C-2-14 rejeita a exceção', async () => {
  const root = await scenario({
    'backend/domains/dashboard/crashes/src/handwritten/dashboard-crashes.projection.ts':
      "const consumedEvents = [];\nexport const sql = 'select * from integration.outbox';\n",
  });
  try {
    const result = verify(root);
    assert.equal(result.status, 1, result.output);
    assert.match(result.output, /consumedEvents|literal|projection/i);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
