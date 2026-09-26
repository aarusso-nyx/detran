// R-0018 TASK-0002 (Inspector, Art. 6). CTG-0001 §6.2, §6.5 e §7 (C-01-01…C-01-27): testes do
// gate `verify:state-index` (`../check.mjs`) via linha de comando, sobre árvores construídas em
// diretório temporário por `fixture.mjs`. Nunca lê nem escreve a árvore real do repositório.
//
// Convenção: para os casos negativos, o teste verifica que o achado esperado aparece nas linhas
// de saída (`findingIds`); para os positivos, que ele está ausente. Isso isola cada critério sem
// exigir que toda fixture mutada permaneça 100% coerente nos demais critérios (só a fixture base
// intocada, usada em C-01-24, precisa de zero achados).
//
// Estes testes falham hoje (antes de TASK-0003) porque `node tools/docs/state-index/check.mjs`
// não existe: o processo filho termina com "Cannot find module" (equivalente a
// ERR_MODULE_NOT_FOUND) e as asserções de exit code/stdout não batem. Isso é esperado.
import assert from 'node:assert/strict';
import test from 'node:test';
import { execFile } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import {
  ADR_README_TEXT,
  CONFIG_PATH,
  DESIGN_DECISIONS_TEXT,
  LAW_ADR_README_MIGRATED_TEXT,
  ROUNDS_README_TEXT,
  baseConfig,
  buildBaseTree,
  cleanupRoot,
  findingIds,
  mkDir,
  mkTempRoot,
  writeFile,
} from './fixture.mjs';

const exec = promisify(execFile);
const repoRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../..',
);
const checkScript = join(repoRoot, 'tools/docs/state-index/check.mjs');

async function runGate(root, extraArgs = []) {
  try {
    const result = await exec(
      process.execPath,
      [checkScript, '--root', root, ...extraArgs],
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

function combined(result) {
  return `${result.stdout}\n${result.stderr}`;
}

// ---------------------------------------------------------------------------
// 7.1 Gate — (a) duplicatas e redirecionamentos
// ---------------------------------------------------------------------------

test('C-01-01 dado um número com dois arquivos não-stub em docs/meta/adr quando o gate roda então acusa duplicata', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
      writeFile(
        root,
        'docs/meta/adr/ADR-0010-first.md',
        '# ADR-0010: First\n\n## Status\n\nAccepted on 2026-02-01.\n',
      );
      writeFile(
        root,
        'docs/meta/adr/ADR-0010-second.md',
        '# ADR-0010: Second\n\n## Status\n\nAccepted on 2026-02-02.\n',
      );
    },
    async (root) => {
      const result = await runGate(root);
      assert.ok(findingIds(combined(result)).has('C-01-01'));
    },
  );
});

test('C-01-01 dado um número duplicado com redirecionamento válido para outro número existente quando o gate roda então não acusa duplicata', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
      writeFile(
        root,
        'docs/meta/adr/ADR-0011-new-name.md',
        '# ADR-0011: New Name\n\n> **Proveniência.** Renumerada de `docs/meta/adr/ADR-0010-old.md` em R-0018 (CTG-0001), pela política.\n\n---\n\n# ADR-0010: Old\n',
      );
      writeFile(
        root,
        'docs/meta/adr/ADR-0010-kept.md',
        '# ADR-0010: Kept\n\n## Status\n\nAccepted on 2026-02-01.\n',
      );
      writeFile(
        root,
        'docs/meta/adr/ADR-0010-old.md',
        '# ADR-0010: Old\n\n## Status\n\nRenumerada para [ADR-0011](ADR-0011-new-name.md).\n\nRedirecionamento sem conteúdo normativo.\n',
      );
    },
    async (root) => {
      const result = await runGate(root);
      assert.ok(!findingIds(combined(result)).has('C-01-01'));
    },
  );
});

test('C-01-02 dado um stub cujo alvo não existe quando o gate roda então acusa stub inválido', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
      writeFile(
        root,
        'docs/meta/adr/ADR-0012-broken.md',
        '# ADR-0012: Broken\n\n## Status\n\nRenumerada para [ADR-0099](ADR-0099-missing.md).\n\nRedirecionamento sem conteúdo normativo.\n',
      );
    },
    async (root) => {
      const result = await runGate(root);
      assert.ok(findingIds(combined(result)).has('C-01-02'));
    },
  );
});

test('C-01-02 dado um stub cujo alvo é outro stub quando o gate roda então acusa stub inválido', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
      writeFile(
        root,
        'docs/meta/adr/ADR-0013-a.md',
        '# ADR-0013: A\n\n## Status\n\nRenumerada para [ADR-0014](ADR-0014-b.md).\n\nRedirecionamento sem conteúdo normativo.\n',
      );
      writeFile(
        root,
        'docs/meta/adr/ADR-0014-b.md',
        '# ADR-0014: B\n\n## Status\n\nRenumerada para [ADR-0015](ADR-0015-c.md).\n\nRedirecionamento sem conteúdo normativo.\n',
      );
      writeFile(
        root,
        'docs/meta/adr/ADR-0015-c.md',
        '# ADR-0015: C\n\n## Status\n\nAccepted on 2026-02-01.\n',
      );
    },
    async (root) => {
      const result = await runGate(root);
      assert.ok(findingIds(combined(result)).has('C-01-02'));
    },
  );
});

test('C-01-02 dado um stub válido apontando para arquivo existente, não-stub, de outro número quando o gate roda então não acusa stub inválido', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
      writeFile(
        root,
        'docs/meta/adr/ADR-0011-new-name.md',
        '# ADR-0011: New Name\n\n## Status\n\nAccepted on 2026-02-01.\n',
      );
      writeFile(
        root,
        'docs/meta/adr/ADR-0010-old.md',
        '# ADR-0010: Old\n\n## Status\n\nRenumerada para [ADR-0011](ADR-0011-new-name.md).\n\nRedirecionamento sem conteúdo normativo.\n',
      );
    },
    async (root) => {
      const result = await runGate(root);
      assert.ok(!findingIds(combined(result)).has('C-01-02'));
    },
  );
});

test('C-01-03 dado um stub com título além do H1 e de "## Status" quando o gate roda então acusa conteúdo normativo', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
      writeFile(
        root,
        'docs/meta/adr/ADR-0011-new-name.md',
        '# ADR-0011: New Name\n\n## Status\n\nAccepted on 2026-02-01.\n',
      );
      writeFile(
        root,
        'docs/meta/adr/ADR-0010-old.md',
        '# ADR-0010: Old\n\n## Status\n\nRenumerada para [ADR-0011](ADR-0011-new-name.md).\n\n## Decision\n\nTexto normativo que não deveria estar aqui.\n',
      );
    },
    async (root) => {
      const result = await runGate(root);
      assert.ok(findingIds(combined(result)).has('C-01-03'));
    },
  );
});

test('C-01-03 dado um stub só com H1 e "## Status" quando o gate roda então não acusa conteúdo normativo', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
      writeFile(
        root,
        'docs/meta/adr/ADR-0011-new-name.md',
        '# ADR-0011: New Name\n\n## Status\n\nAccepted on 2026-02-01.\n',
      );
      writeFile(
        root,
        'docs/meta/adr/ADR-0010-old.md',
        '# ADR-0010: Old\n\n## Status\n\nRenumerada para [ADR-0011](ADR-0011-new-name.md).\n\nRedirecionamento sem conteúdo normativo.\n',
      );
    },
    async (root) => {
      const result = await runGate(root);
      assert.ok(!findingIds(combined(result)).has('C-01-03'));
    },
  );
});

test('C-01-04 dado um arquivo novo apontado por stub sem a nota de proveniência na 3ª linha quando o gate roda então acusa proveniência ausente', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
      writeFile(
        root,
        'docs/meta/adr/ADR-0011-new-name.md',
        '# ADR-0011: New Name\n\n## Status\n\nAccepted on 2026-02-01.\n',
      );
      writeFile(
        root,
        'docs/meta/adr/ADR-0010-old.md',
        '# ADR-0010: Old\n\n## Status\n\nRenumerada para [ADR-0011](ADR-0011-new-name.md).\n\nRedirecionamento sem conteúdo normativo.\n',
      );
    },
    async (root) => {
      const result = await runGate(root);
      assert.ok(findingIds(combined(result)).has('C-01-04'));
    },
  );
});

test('C-01-04 dado o arquivo novo gerado pelo §3.2, com a nota de proveniência na 3ª linha quando o gate roda então não acusa proveniência ausente', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
      writeFile(
        root,
        'docs/meta/adr/ADR-0011-new-name.md',
        '# ADR-0011: New Name\n\n> **Proveniência.** Renumerada de `docs/meta/adr/ADR-0010-old.md` em R-0018 (CTG-0001), pela política da\n> [ADR-0035](ADR-0035-adr-numbering-policy.md).\n> Motivo fixture.\n> O texto abaixo da linha horizontal é o original, byte a byte, inclusive o título com o número\n> antigo.\n\n---\n\n# ADR-0010: Old\n',
      );
      writeFile(
        root,
        'docs/meta/adr/ADR-0010-old.md',
        '# ADR-0010: Old\n\n## Status\n\nRenumerada para [ADR-0011](ADR-0011-new-name.md).\n\nRedirecionamento sem conteúdo normativo.\n',
      );
    },
    async (root) => {
      const result = await runGate(root);
      assert.ok(!findingIds(combined(result)).has('C-01-04'));
    },
  );
});

test('C-01-05 dado um stub sem linha correspondente em §Aliases quando o gate roda então acusa alias ausente', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
      writeFile(
        root,
        'docs/meta/adr/ADR-0011-new-name.md',
        '# ADR-0011: New Name\n\n## Status\n\nAccepted on 2026-02-01.\n',
      );
      writeFile(
        root,
        'docs/meta/adr/ADR-0010-old.md',
        '# ADR-0010: Old\n\n## Status\n\nRenumerada para [ADR-0011](ADR-0011-new-name.md).\n\nRedirecionamento sem conteúdo normativo.\n',
      );
    },
    async (root) => {
      const result = await runGate(root);
      assert.ok(findingIds(combined(result)).has('C-01-05'));
    },
  );
});

test('C-01-05 dado uma linha de §Aliases cujo alvo (col. 4) difere do alvo real do stub quando o gate roda então acusa alias divergente', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
      writeFile(
        root,
        'docs/meta/adr/ADR-0011-new-name.md',
        '# ADR-0011: New Name\n\n## Status\n\nAccepted on 2026-02-01.\n',
      );
      writeFile(
        root,
        'docs/meta/adr/ADR-0099-other.md',
        '# ADR-0099: Other\n\n## Status\n\nAccepted on 2026-02-01.\n',
      );
      writeFile(
        root,
        'docs/meta/adr/ADR-0010-old.md',
        '# ADR-0010: Old\n\n## Status\n\nRenumerada para [ADR-0011](ADR-0011-new-name.md).\n\nRedirecionamento sem conteúdo normativo.\n',
      );
      writeFile(
        root,
        'docs/meta/adr/README.md',
        `${ADR_README_TEXT}| ADR-0010 | [ADR-0010-old.md](ADR-0010-old.md) | ADR-0011 | [ADR-0099-other.md](ADR-0099-other.md) |\n`,
      );
    },
    async (root) => {
      const result = await runGate(root);
      assert.ok(findingIds(combined(result)).has('C-01-05'));
    },
  );
});

test('C-01-05 dado um stub com a linha correta em §Aliases quando o gate roda então não acusa alias ausente/divergente', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
      writeFile(
        root,
        'docs/meta/adr/ADR-0011-new-name.md',
        '# ADR-0011: New Name\n\n## Status\n\nAccepted on 2026-02-01.\n',
      );
      writeFile(
        root,
        'docs/meta/adr/ADR-0010-old.md',
        '# ADR-0010: Old\n\n## Status\n\nRenumerada para [ADR-0011](ADR-0011-new-name.md).\n\nRedirecionamento sem conteúdo normativo.\n',
      );
      writeFile(
        root,
        'docs/meta/adr/README.md',
        `${ADR_README_TEXT}| ADR-0010 | [ADR-0010-old.md](ADR-0010-old.md) | ADR-0011 | [ADR-0011-new-name.md](ADR-0011-new-name.md) |\n`,
      );
    },
    async (root) => {
      const result = await runGate(root);
      assert.ok(!findingIds(combined(result)).has('C-01-05'));
    },
  );
});

// Iteração 2 (delivery-review-CTG-0001.json, achado 1, item file:l.434): CTG-0001 §3.4 diz que a
// coluna 1 (Número antigo) e a coluna 3 (Número novo) de §Aliases são ids que precisam bater com
// o stub e com o alvo; o gate hoje só confere as colunas 2 e 4. Os três casos abaixo documentam a
// lacuna: id trocado na coluna 1, id trocado na coluna 3 e uma linha obsoleta (sem stub
// correspondente em docs/meta/adr/).
test('C-01-05 dado uma linha de §Aliases com o id trocado na coluna 1 (Número antigo) quando o gate roda então acusa alias inconsistente', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
      writeFile(
        root,
        'docs/meta/adr/ADR-0011-new-name.md',
        '# ADR-0011: New Name\n\n## Status\n\nAccepted on 2026-02-01.\n',
      );
      writeFile(
        root,
        'docs/meta/adr/ADR-0010-old.md',
        '# ADR-0010: Old\n\n## Status\n\nRenumerada para [ADR-0011](ADR-0011-new-name.md).\n\nRedirecionamento sem conteúdo normativo.\n',
      );
      writeFile(
        root,
        'docs/meta/adr/README.md',
        // Coluna 1 diz ADR-0099 mas o stub citado na coluna 2 é ADR-0010-old.md.
        `${ADR_README_TEXT}| ADR-0099 | [ADR-0010-old.md](ADR-0010-old.md) | ADR-0011 | [ADR-0011-new-name.md](ADR-0011-new-name.md) |\n`,
      );
    },
    async (root) => {
      const result = await runGate(root);
      assert.ok(findingIds(combined(result)).has('C-01-05'));
    },
  );
});

test('C-01-05 dado uma linha de §Aliases com o id trocado na coluna 3 (Número novo) quando o gate roda então acusa alias inconsistente', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
      writeFile(
        root,
        'docs/meta/adr/ADR-0011-new-name.md',
        '# ADR-0011: New Name\n\n## Status\n\nAccepted on 2026-02-01.\n',
      );
      writeFile(
        root,
        'docs/meta/adr/ADR-0010-old.md',
        '# ADR-0010: Old\n\n## Status\n\nRenumerada para [ADR-0011](ADR-0011-new-name.md).\n\nRedirecionamento sem conteúdo normativo.\n',
      );
      writeFile(
        root,
        'docs/meta/adr/README.md',
        // Coluna 3 diz ADR-0099 mas a coluna 4 continua citando o alvo real (ADR-0011).
        `${ADR_README_TEXT}| ADR-0010 | [ADR-0010-old.md](ADR-0010-old.md) | ADR-0099 | [ADR-0011-new-name.md](ADR-0011-new-name.md) |\n`,
      );
    },
    async (root) => {
      const result = await runGate(root);
      assert.ok(findingIds(combined(result)).has('C-01-05'));
    },
  );
});

test('C-01-05 dado uma linha de §Aliases obsoleta (alias sem stub correspondente em docs/meta/adr) quando o gate roda então acusa alias inválido', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
      // Nenhum ADR-0020-old.md nem ADR-0041-new.md existe: a linha é pura sobra de §Aliases.
      writeFile(
        root,
        'docs/meta/adr/README.md',
        `${ADR_README_TEXT}| ADR-0020 | [ADR-0020-old.md](ADR-0020-old.md) | ADR-0041 | [ADR-0041-new.md](ADR-0041-new.md) |\n`,
      );
    },
    async (root) => {
      const result = await runGate(root);
      assert.ok(findingIds(combined(result)).has('C-01-05'));
    },
  );
});

// Iteração 3 (delivery-review-CTG-0001-2.json, achado 7,
// tools/docs/state-index/check.mjs:469): a checagem de §Aliases usa apenas a primeira linha
// encontrada para cada stub (`aliasRows.find(...)`); uma segunda linha para o mesmo stub não é
// vista pelo gate. O contrato (§3.4) diz "uma linha por stub", então uma segunda linha — idêntica
// ou com id/alvo divergente — é sempre uma duplicata que o gate deveria acusar.
test('C-01-05 dado uma segunda linha idêntica em §Aliases para o mesmo stub quando o gate roda então acusa duplicata', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
      writeFile(
        root,
        'docs/meta/adr/ADR-0011-new-name.md',
        '# ADR-0011: New Name\n\n## Status\n\nAccepted on 2026-02-01.\n',
      );
      writeFile(
        root,
        'docs/meta/adr/ADR-0010-old.md',
        '# ADR-0010: Old\n\n## Status\n\nRenumerada para [ADR-0011](ADR-0011-new-name.md).\n\nRedirecionamento sem conteúdo normativo.\n',
      );
      const aliasLine =
        '| ADR-0010 | [ADR-0010-old.md](ADR-0010-old.md) | ADR-0011 | [ADR-0011-new-name.md](ADR-0011-new-name.md) |\n';
      writeFile(
        root,
        'docs/meta/adr/README.md',
        `${ADR_README_TEXT}${aliasLine}${aliasLine}`,
      );
    },
    async (root) => {
      const result = await runGate(root);
      assert.ok(findingIds(combined(result)).has('C-01-05'));
    },
  );
});

test('C-01-05 dado uma segunda linha em §Aliases para o mesmo stub com alvo divergente quando o gate roda então acusa duplicata', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
      writeFile(
        root,
        'docs/meta/adr/ADR-0011-new-name.md',
        '# ADR-0011: New Name\n\n## Status\n\nAccepted on 2026-02-01.\n',
      );
      writeFile(
        root,
        'docs/meta/adr/ADR-0099-other.md',
        '# ADR-0099: Other\n\n## Status\n\nAccepted on 2026-02-01.\n',
      );
      writeFile(
        root,
        'docs/meta/adr/ADR-0010-old.md',
        '# ADR-0010: Old\n\n## Status\n\nRenumerada para [ADR-0011](ADR-0011-new-name.md).\n\nRedirecionamento sem conteúdo normativo.\n',
      );
      writeFile(
        root,
        'docs/meta/adr/README.md',
        `${ADR_README_TEXT}` +
          '| ADR-0010 | [ADR-0010-old.md](ADR-0010-old.md) | ADR-0011 | [ADR-0011-new-name.md](ADR-0011-new-name.md) |\n' +
          '| ADR-0010 | [ADR-0010-old.md](ADR-0010-old.md) | ADR-0099 | [ADR-0099-other.md](ADR-0099-other.md) |\n',
      );
    },
    async (root) => {
      const result = await runGate(root);
      assert.ok(findingIds(combined(result)).has('C-01-05'));
    },
  );
});

test('C-01-06 dado um nome de arquivo fora de ^ADR-\\d{4}-[a-z0-9][a-z0-9-]*\\.md$ quando o gate roda então acusa nome inválido', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
      writeFile(
        root,
        'docs/meta/adr/ADR-36-x.md',
        '# ADR-36: X\n\n## Status\n\nAccepted on 2026-02-01.\n',
      );
    },
    async (root) => {
      const result = await runGate(root);
      assert.ok(findingIds(combined(result)).has('C-01-06'));
    },
  );
});

test('C-01-06 dado um nome de arquivo conforme o padrão quando o gate roda então não acusa nome inválido', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
      writeFile(
        root,
        'docs/meta/adr/ADR-0036-ops-field-operations-port.md',
        '# ADR-0036\n\n## Status\n\nAccepted on 2026-02-01.\n',
      );
    },
    async (root) => {
      const result = await runGate(root);
      assert.ok(!findingIds(combined(result)).has('C-01-06'));
    },
  );
});

// ---------------------------------------------------------------------------
// 7.2 Gate — (b) presença nos índices
// ---------------------------------------------------------------------------

test('C-01-07 dado um ADR não-stub ausente de DESIGN-DECISIONS.md quando o gate roda então acusa ausência', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
      writeFile(
        root,
        'docs/meta/adr/ADR-0005-extra.md',
        '# ADR-0005: Extra\n\n## Status\n\nAccepted on 2026-02-01.\n',
      );
      writeFile(
        root,
        'docs/meta/adr/README.md',
        ADR_README_TEXT.replace(
          '## Aliases',
          '| [ADR-0005](ADR-0005-extra.md) | Extra fixture. | Accepted | — |\n\n## Aliases',
        ),
      );
    },
    async (root) => {
      const result = await runGate(root);
      assert.ok(findingIds(combined(result)).has('C-01-07'));
    },
  );
});

test('C-01-07 dado o mesmo ADR presente em DESIGN-DECISIONS.md quando o gate roda então não acusa ausência', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
      writeFile(
        root,
        'docs/meta/adr/ADR-0005-extra.md',
        '# ADR-0005: Extra\n\n## Status\n\nAccepted on 2026-02-01.\n',
      );
      writeFile(
        root,
        'docs/meta/adr/README.md',
        ADR_README_TEXT.replace(
          '## Aliases',
          '| [ADR-0005](ADR-0005-extra.md) | Extra fixture. | Accepted | — |\n\n## Aliases',
        ),
      );
      writeFile(
        root,
        'DESIGN-DECISIONS.md',
        `${DESIGN_DECISIONS_TEXT}| [ADR-0005](docs/meta/adr/ADR-0005-extra.md) | Extra fixture. | Accepted | — |\n`,
      );
    },
    async (root) => {
      const result = await runGate(root);
      assert.ok(!findingIds(combined(result)).has('C-01-07'));
    },
  );
});

test('C-01-08 dado um ADR não-stub ausente de docs/meta/adr/README.md quando o gate roda então acusa ausência', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
      writeFile(
        root,
        'docs/meta/adr/ADR-0005-extra.md',
        '# ADR-0005: Extra\n\n## Status\n\nAccepted on 2026-02-01.\n',
      );
      writeFile(
        root,
        'DESIGN-DECISIONS.md',
        `${DESIGN_DECISIONS_TEXT}| [ADR-0005](docs/meta/adr/ADR-0005-extra.md) | Extra fixture. | Accepted | — |\n`,
      );
    },
    async (root) => {
      const result = await runGate(root);
      assert.ok(findingIds(combined(result)).has('C-01-08'));
    },
  );
});

test('C-01-08 dado o mesmo ADR presente em docs/meta/adr/README.md quando o gate roda então não acusa ausência', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
      writeFile(
        root,
        'docs/meta/adr/ADR-0005-extra.md',
        '# ADR-0005: Extra\n\n## Status\n\nAccepted on 2026-02-01.\n',
      );
      writeFile(
        root,
        'docs/meta/adr/README.md',
        ADR_README_TEXT.replace(
          '## Aliases',
          '| [ADR-0005](ADR-0005-extra.md) | Extra fixture. | Accepted | — |\n\n## Aliases',
        ),
      );
      writeFile(
        root,
        'DESIGN-DECISIONS.md',
        `${DESIGN_DECISIONS_TEXT}| [ADR-0005](docs/meta/adr/ADR-0005-extra.md) | Extra fixture. | Accepted | — |\n`,
      );
    },
    async (root) => {
      const result = await runGate(root);
      assert.ok(!findingIds(combined(result)).has('C-01-08'));
    },
  );
});

test('C-01-09 dado uma linha de índice citando um arquivo inexistente quando o gate roda então acusa link para arquivo inexistente', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
      writeFile(
        root,
        'DESIGN-DECISIONS.md',
        `${DESIGN_DECISIONS_TEXT}| [ADR-0099](docs/meta/adr/ADR-0099-missing.md) | Fixture. | Accepted | — |\n`,
      );
    },
    async (root) => {
      const result = await runGate(root);
      assert.ok(findingIds(combined(result)).has('C-01-09'));
    },
  );
});

test('C-01-09 dado uma linha de índice cujo id exibido difere do número do arquivo citado quando o gate roda então acusa id divergente', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
      writeFile(
        root,
        'DESIGN-DECISIONS.md',
        DESIGN_DECISIONS_TEXT.replace(
          '[ADR-0002](docs/meta/adr/ADR-0002-beta-decision.md)',
          '[ADR-0003](docs/meta/adr/ADR-0002-beta-decision.md)',
        ),
      );
    },
    async (root) => {
      const result = await runGate(root);
      assert.ok(findingIds(combined(result)).has('C-01-09'));
    },
  );
});

test('C-01-09 dado uma linha de índice principal citando um stub quando o gate roda então acusa stub na tabela principal', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
      writeFile(
        root,
        'docs/meta/adr/ADR-0011-new-name.md',
        '# ADR-0011: New Name\n\n## Status\n\nAccepted on 2026-02-01.\n',
      );
      writeFile(
        root,
        'docs/meta/adr/ADR-0010-old.md',
        '# ADR-0010: Old\n\n## Status\n\nRenumerada para [ADR-0011](ADR-0011-new-name.md).\n\nRedirecionamento sem conteúdo normativo.\n',
      );
      writeFile(
        root,
        'DESIGN-DECISIONS.md',
        `${DESIGN_DECISIONS_TEXT}| [ADR-0010](docs/meta/adr/ADR-0010-old.md) | Fixture stub na principal. | Renumbered | — |\n`,
      );
    },
    async (root) => {
      const result = await runGate(root);
      assert.ok(findingIds(combined(result)).has('C-01-09'));
    },
  );
});

test('C-01-09 dado um link correto para um não-stub existente quando o gate roda então não acusa', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
    },
    async (root) => {
      const result = await runGate(root);
      assert.ok(!findingIds(combined(result)).has('C-01-09'));
    },
  );
});

test('C-01-10 dado o mesmo arquivo citado em duas linhas do mesmo índice quando o gate roda então acusa duplicata de linha', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
      writeFile(
        root,
        'DESIGN-DECISIONS.md',
        `${DESIGN_DECISIONS_TEXT}| [ADR-0001](docs/meta/adr/ADR-0001-alpha-decision.md) | Repetida. | Accepted | — |\n`,
      );
    },
    async (root) => {
      const result = await runGate(root);
      assert.ok(findingIds(combined(result)).has('C-01-10'));
    },
  );
});

test('C-01-10 dado cada arquivo citado em uma única linha do índice quando o gate roda então não acusa duplicata de linha', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
    },
    async (root) => {
      const result = await runGate(root);
      assert.ok(!findingIds(combined(result)).has('C-01-10'));
    },
  );
});

test('C-01-11 dado lawAdrMode pending com um ADR de law/adr citado nos dois índices quando o gate roda então não acusa a série law/adr', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
      writeFile(
        root,
        'law/adr/ADR-0001-devai-example.md',
        '# ADR-0001: DEVAI Example\n\n## Status\n\nAccepted on 2026-01-01.\n',
      );
      writeFile(
        root,
        'docs/meta/adr/README.md',
        ADR_README_TEXT.replace(
          '## Aliases',
          '| [LAW-ADR-0001](../../law/adr/ADR-0001-devai-example.md) | DEVAI fixture. | Accepted | — |\n\n## Aliases',
        ),
      );
      writeFile(
        root,
        'DESIGN-DECISIONS.md',
        `${DESIGN_DECISIONS_TEXT}| [LAW-ADR-0001](law/adr/ADR-0001-devai-example.md) | DEVAI fixture. | Accepted | — |\n`,
      );
    },
    async (root) => {
      const result = await runGate(root);
      assert.ok(!findingIds(combined(result)).has('C-01-11'));
    },
  );
});

test('C-01-11 dado lawAdrMode pending com um ADR de law/adr ausente de DESIGN-DECISIONS.md quando o gate roda então acusa a série law/adr', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
      writeFile(
        root,
        'law/adr/ADR-0001-devai-example.md',
        '# ADR-0001: DEVAI Example\n\n## Status\n\nAccepted on 2026-01-01.\n',
      );
      writeFile(
        root,
        'docs/meta/adr/README.md',
        ADR_README_TEXT.replace(
          '## Aliases',
          '| [LAW-ADR-0001](../../law/adr/ADR-0001-devai-example.md) | DEVAI fixture. | Accepted | — |\n\n## Aliases',
        ),
      );
    },
    async (root) => {
      const result = await runGate(root);
      assert.ok(findingIds(combined(result)).has('C-01-11'));
    },
  );
});

test('C-01-11 dado lawAdrMode migrated com um arquivo de law/adr não-stub quando o gate roda então acusa a série law/adr', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root, { config: baseConfig({ lawAdrMode: 'migrated' }) });
      writeFile(root, 'law/adr/README.md', LAW_ADR_README_MIGRATED_TEXT);
      writeFile(
        root,
        'law/adr/ADR-0001-devai-example.md',
        '# ADR-0001: DEVAI Example\n\n## Status\n\nAccepted on 2026-01-01.\n',
      );
    },
    async (root) => {
      const result = await runGate(root);
      assert.ok(findingIds(combined(result)).has('C-01-11'));
    },
  );
});

// Iteração 2 (delivery-review-CTG-0001.json, achado 3, item file:l.558): CTG-0001 §7.2 (C-01-11)
// diz que, em modo migrated, cada `law/adr/ADR-*.md` precisa (i) ser stub válido, (ii) estar em
// §Aliases e (iii) que nenhum índice tenha mais linha da série. O gate hoje só confere (i).
const MIGRATED_TARGET_TEXT =
  '# ADR-0039: DEVAI Example\n\n## Status\n\nAccepted on 2026-01-01.\n';
const MIGRATED_STUB_TEXT =
  '# ADR-0001: DEVAI Example\n\n## Status\n\nRenumerada para [ADR-0039](../../docs/meta/adr/ADR-0039-devai-example.md).\n\nRedirecionamento sem conteúdo normativo.\n';

test('C-01-11 dado lawAdrMode migrated com stub válido em law/adr sem linha em §Aliases quando o gate roda então acusa a série law/adr', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root, { config: baseConfig({ lawAdrMode: 'migrated' }) });
      writeFile(root, 'law/adr/README.md', LAW_ADR_README_MIGRATED_TEXT);
      writeFile(
        root,
        'docs/meta/adr/ADR-0039-devai-example.md',
        MIGRATED_TARGET_TEXT,
      );
      writeFile(root, 'law/adr/ADR-0001-devai-example.md', MIGRATED_STUB_TEXT);
      // §Aliases de docs/meta/adr/README.md fica sem linha para este stub de law/adr.
    },
    async (root) => {
      const result = await runGate(root);
      assert.ok(findingIds(combined(result)).has('C-01-11'));
    },
  );
});

test('C-01-11 dado lawAdrMode migrated com linha remanescente da série law/adr (caminho entre crases) em DESIGN-DECISIONS.md quando o gate roda então acusa a série law/adr', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root, { config: baseConfig({ lawAdrMode: 'migrated' }) });
      writeFile(root, 'law/adr/README.md', LAW_ADR_README_MIGRATED_TEXT);
      writeFile(
        root,
        'docs/meta/adr/ADR-0039-devai-example.md',
        MIGRATED_TARGET_TEXT,
      );
      writeFile(root, 'law/adr/ADR-0001-devai-example.md', MIGRATED_STUB_TEXT);
      // §Aliases presente (isola o teste do achado "sem linha em §Aliases" acima): a linha é
      // acrescentada direto após a tabela vazia de §Aliases (mesmo padrão dos testes de C-01-05).
      writeFile(
        root,
        'docs/meta/adr/README.md',
        `${ADR_README_TEXT}| LAW-ADR-0001 | \`law/adr/ADR-0001-devai-example.md\` | ADR-0039 | [ADR-0039-devai-example.md](ADR-0039-devai-example.md) |\n`,
      );
      // Forma real da linha remanescente da série law/adr: caminho entre crases, sem link.
      writeFile(
        root,
        'DESIGN-DECISIONS.md',
        `${DESIGN_DECISIONS_TEXT}| LAW-ADR-0001 (\`law/adr/ADR-0001-devai-example.md\`) | DEVAI fixture. | Accepted | — |\n`,
      );
    },
    async (root) => {
      const result = await runGate(root);
      assert.ok(findingIds(combined(result)).has('C-01-11'));
    },
  );
});

// Iteração 3 (delivery-review-CTG-0001-2.json, achado 7,
// tools/docs/state-index/check.mjs:469): em modo migrated, o laço de law/adr (linhas 682-699 de
// check.mjs) só confere a coluna 4 (Arquivo novo) da linha de §Aliases contra o stub; as colunas 1
// (Número antigo) e 3 (Número novo) não são comparadas ao id esperado (§3.4, mesma regra aplicada
// aos stubs de docs/meta/adr em C-01-05).
test('C-01-11 dado lawAdrMode migrated com a coluna 1 (Número antigo) da linha de §Aliases divergente do stub de law/adr quando o gate roda então acusa a série law/adr', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root, { config: baseConfig({ lawAdrMode: 'migrated' }) });
      writeFile(root, 'law/adr/README.md', LAW_ADR_README_MIGRATED_TEXT);
      writeFile(
        root,
        'docs/meta/adr/ADR-0039-devai-example.md',
        MIGRATED_TARGET_TEXT,
      );
      writeFile(root, 'law/adr/ADR-0001-devai-example.md', MIGRATED_STUB_TEXT);
      writeFile(
        root,
        'docs/meta/adr/README.md',
        // Coluna 1 diz LAW-ADR-0099 mas o stub citado na coluna 2 é o ADR-0001 de law/adr.
        `${ADR_README_TEXT}| LAW-ADR-0099 | \`law/adr/ADR-0001-devai-example.md\` | ADR-0039 | [ADR-0039-devai-example.md](ADR-0039-devai-example.md) |\n`,
      );
    },
    async (root) => {
      const result = await runGate(root);
      assert.ok(findingIds(combined(result)).has('C-01-11'));
    },
  );
});

test('C-01-11 dado lawAdrMode migrated com a coluna 3 (Número novo) da linha de §Aliases divergente do alvo do stub de law/adr quando o gate roda então acusa a série law/adr', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root, { config: baseConfig({ lawAdrMode: 'migrated' }) });
      writeFile(root, 'law/adr/README.md', LAW_ADR_README_MIGRATED_TEXT);
      writeFile(
        root,
        'docs/meta/adr/ADR-0039-devai-example.md',
        MIGRATED_TARGET_TEXT,
      );
      writeFile(root, 'law/adr/ADR-0001-devai-example.md', MIGRATED_STUB_TEXT);
      writeFile(
        root,
        'docs/meta/adr/README.md',
        // Coluna 3 diz ADR-0099 mas a coluna 4 continua citando o alvo real (ADR-0039).
        `${ADR_README_TEXT}| LAW-ADR-0001 | \`law/adr/ADR-0001-devai-example.md\` | ADR-0099 | [ADR-0039-devai-example.md](ADR-0039-devai-example.md) |\n`,
      );
    },
    async (root) => {
      const result = await runGate(root);
      assert.ok(findingIds(combined(result)).has('C-01-11'));
    },
  );
});

test('C-01-12 dado law/adr/README.md com "intentionally empty" quando o gate roda então acusa a frase-marco ausente', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
      writeFile(
        root,
        'law/adr/README.md',
        '# adr\n\nThis directory is intentionally empty.\n',
      );
    },
    async (root) => {
      const result = await runGate(root);
      assert.ok(findingIds(combined(result)).has('C-01-12'));
    },
  );
});

test('C-01-12 dado law/adr/README.md com a frase-marco de outro modo (migrated) enquanto lawAdrMode=pending quando o gate roda então acusa frase de modo errado', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
      writeFile(root, 'law/adr/README.md', LAW_ADR_README_MIGRATED_TEXT);
    },
    async (root) => {
      const result = await runGate(root);
      assert.ok(findingIds(combined(result)).has('C-01-12'));
    },
  );
});

test('C-01-12 dado law/adr/README.md com a frase-marco de pending enquanto lawAdrMode=pending quando o gate roda então não acusa', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
    },
    async (root) => {
      const result = await runGate(root);
      assert.ok(!findingIds(combined(result)).has('C-01-12'));
    },
  );
});

// ---------------------------------------------------------------------------
// 7.3 Gate — (c) status
// ---------------------------------------------------------------------------

test('C-01-14 dado statusExceptions referenciando um arquivo inexistente quando o gate roda então acusa exceção obsoleta', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root, {
        config: baseConfig({
          statusExceptions: { 'docs/meta/adr/ADR-0999-missing.md': 'Accepted' },
        }),
      });
    },
    async (root) => {
      const result = await runGate(root);
      assert.ok(findingIds(combined(result)).has('C-01-14'));
    },
  );
});

test('C-01-14 dado statusExceptions referenciando um ADR classificável por palavra-chave quando o gate roda então acusa exceção obsoleta', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root, {
        config: baseConfig({
          statusExceptions: {
            'docs/meta/adr/ADR-0001-alpha-decision.md': 'Accepted',
          },
        }),
      });
    },
    async (root) => {
      const result = await runGate(root);
      assert.ok(findingIds(combined(result)).has('C-01-14'));
    },
  );
});

test('C-01-14 dado statusExceptions só para prosa não classificável quando o gate roda então não acusa exceção obsoleta', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
      writeFile(
        root,
        'docs/meta/adr/ADR-0007-prose.md',
        '# ADR-0007: Prose\n\nOwner decision on 2026-02-01 approves this ADR.\n',
      );
      writeFile(
        root,
        'docs/meta/adr/README.md',
        ADR_README_TEXT.replace(
          '## Aliases',
          '| [ADR-0007](ADR-0007-prose.md) | Prose fixture. | Accepted | — |\n\n## Aliases',
        ),
      );
      writeFile(
        root,
        'DESIGN-DECISIONS.md',
        `${DESIGN_DECISIONS_TEXT}| [ADR-0007](docs/meta/adr/ADR-0007-prose.md) | Prose fixture. | Accepted | — |\n`,
      );
      writeFile(
        root,
        CONFIG_PATH,
        baseConfig({
          statusExceptions: { 'docs/meta/adr/ADR-0007-prose.md': 'Accepted' },
        }),
      );
    },
    async (root) => {
      const result = await runGate(root);
      assert.ok(!findingIds(combined(result)).has('C-01-14'));
    },
  );
});

test('C-01-15 dado a célula Status de DESIGN-DECISIONS.md diferente da classe do arquivo quando o gate roda então acusa divergência', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
      writeFile(
        root,
        'docs/meta/adr/ADR-0007-proposed.md',
        '# ADR-0007: Proposed\n\n## Status\n\nProposed on 2026-02-01.\n',
      );
      writeFile(
        root,
        'docs/meta/adr/README.md',
        ADR_README_TEXT.replace(
          '## Aliases',
          '| [ADR-0007](ADR-0007-proposed.md) | Proposed fixture. | Proposed | — |\n\n## Aliases',
        ),
      );
      writeFile(
        root,
        'DESIGN-DECISIONS.md',
        `${DESIGN_DECISIONS_TEXT}| [ADR-0007](docs/meta/adr/ADR-0007-proposed.md) | Proposed fixture. | Accepted | — |\n`,
      );
    },
    async (root) => {
      const result = await runGate(root);
      assert.ok(findingIds(combined(result)).has('C-01-15'));
    },
  );
});

test('C-01-15 dado a célula Status de DESIGN-DECISIONS.md igual à classe do arquivo quando o gate roda então não acusa divergência', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
      writeFile(
        root,
        'docs/meta/adr/ADR-0007-proposed.md',
        '# ADR-0007: Proposed\n\n## Status\n\nProposed on 2026-02-01.\n',
      );
      writeFile(
        root,
        'docs/meta/adr/README.md',
        ADR_README_TEXT.replace(
          '## Aliases',
          '| [ADR-0007](ADR-0007-proposed.md) | Proposed fixture. | Proposed | — |\n\n## Aliases',
        ),
      );
      writeFile(
        root,
        'DESIGN-DECISIONS.md',
        `${DESIGN_DECISIONS_TEXT}| [ADR-0007](docs/meta/adr/ADR-0007-proposed.md) | Proposed fixture. | Proposed | — |\n`,
      );
    },
    async (root) => {
      const result = await runGate(root);
      assert.ok(!findingIds(combined(result)).has('C-01-15'));
    },
  );
});

test('C-01-16 dado a célula Status de docs/meta/adr/README.md diferente da classe do arquivo (Accepted para Proposed) quando o gate roda então acusa divergência', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
      writeFile(
        root,
        'docs/meta/adr/ADR-0007-proposed.md',
        '# ADR-0007: Proposed\n\n## Status\n\nProposed on 2026-02-01.\n',
      );
      writeFile(
        root,
        'docs/meta/adr/README.md',
        ADR_README_TEXT.replace(
          '## Aliases',
          '| [ADR-0007](ADR-0007-proposed.md) | Proposed fixture. | Accepted | — |\n\n## Aliases',
        ),
      );
      writeFile(
        root,
        'DESIGN-DECISIONS.md',
        `${DESIGN_DECISIONS_TEXT}| [ADR-0007](docs/meta/adr/ADR-0007-proposed.md) | Proposed fixture. | Proposed | — |\n`,
      );
    },
    async (root) => {
      const result = await runGate(root);
      assert.ok(findingIds(combined(result)).has('C-01-16'));
    },
  );
});

test('C-01-16 dado a célula Status de docs/meta/adr/README.md igual à classe do arquivo quando o gate roda então não acusa divergência', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
    },
    async (root) => {
      const result = await runGate(root);
      assert.ok(!findingIds(combined(result)).has('C-01-16'));
    },
  );
});

// Iteração 2 (delivery-review-CTG-0001.json, achado 2, item file:l.646): as linhas reais da série
// `law/adr` em `DESIGN-DECISIONS.md`/`docs/meta/adr/README.md` citam o arquivo por caminho entre
// crases dentro da célula "ADR" (sem link Markdown), forma exigida por CTG-0001 §3.4/§6.5 e usada
// hoje em `main` (`DESIGN-DECISIONS.md:58`, `docs/meta/adr/README.md:63`). `checkStatusColumn` só
// lê `extractFirstLink`, então uma linha nessa forma nunca é comparada.
const LAW_ADR_BACKTICK_FILE_TEXT =
  '# ADR-0001: DEVAI Example\n\n## Status\n\nAccepted on 2026-01-01.\n';

test('C-01-15 dado a linha real da série law/adr (caminho entre crases, sem link) com status divergente em DESIGN-DECISIONS.md quando o gate roda então acusa divergência', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
      writeFile(
        root,
        'law/adr/ADR-0001-devai-example.md',
        LAW_ADR_BACKTICK_FILE_TEXT,
      );
      writeFile(
        root,
        'docs/meta/adr/README.md',
        `${ADR_README_TEXT}| LAW-ADR-0001 (\`law/adr/ADR-0001-devai-example.md\`) | DEVAI fixture. | Accepted | — |\n`,
      );
      writeFile(
        root,
        'DESIGN-DECISIONS.md',
        // Arquivo é Accepted; a célula Status da linha real diz Proposed.
        `${DESIGN_DECISIONS_TEXT}| LAW-ADR-0001 (\`law/adr/ADR-0001-devai-example.md\`) | DEVAI fixture. | Proposed | — |\n`,
      );
    },
    async (root) => {
      const result = await runGate(root);
      assert.ok(findingIds(combined(result)).has('C-01-15'));
    },
  );
});

test('C-01-16 dado a linha real da série law/adr (caminho entre crases, sem link) com status divergente em docs/meta/adr/README.md quando o gate roda então acusa divergência', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
      writeFile(
        root,
        'law/adr/ADR-0001-devai-example.md',
        LAW_ADR_BACKTICK_FILE_TEXT,
      );
      writeFile(
        root,
        'docs/meta/adr/README.md',
        // Arquivo é Accepted; a célula Status da linha real diz Proposed.
        `${ADR_README_TEXT}| LAW-ADR-0001 (\`law/adr/ADR-0001-devai-example.md\`) | DEVAI fixture. | Proposed | — |\n`,
      );
      writeFile(
        root,
        'DESIGN-DECISIONS.md',
        `${DESIGN_DECISIONS_TEXT}| LAW-ADR-0001 (\`law/adr/ADR-0001-devai-example.md\`) | DEVAI fixture. | Accepted | — |\n`,
      );
    },
    async (root) => {
      const result = await runGate(root);
      assert.ok(findingIds(combined(result)).has('C-01-16'));
    },
  );
});

// Id exibido divergente numa linha real da série law/adr (LAW-ADR-0002 citando o arquivo
// ADR-0001-…). CTG-0001 §6.5 define "id exibido ≠ número do arquivo citado" como parte de
// C-01-09; a tabela §7.2 só ilustra esse critério com citações em link Markdown. Como
// `checkIndexRows` também só lê `extractFirstLink`, uma linha da série law/adr com o mesmo defeito
// (caminho entre crases) nunca é comparada — mesma lacuna do achado 2. O prompt da iteração 2
// agrupa este caso sob o cabeçalho "C-01-15 / C-01-16"; a rotulagem C-01-09 (leitura literal de
// CTG-0001 §6.5/§7.2) foi confirmada pelo maestro (Architect) no relatório
// `work/rounds/R-0018/reports/TASK-0002-it2.md`.
test('C-01-09 dado uma linha real da série law/adr com o id exibido divergente do arquivo citado (caminho entre crases) quando o gate roda então acusa id divergente', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
      writeFile(
        root,
        'law/adr/ADR-0001-devai-example.md',
        LAW_ADR_BACKTICK_FILE_TEXT,
      );
      writeFile(
        root,
        'docs/meta/adr/README.md',
        `${ADR_README_TEXT}| LAW-ADR-0001 (\`law/adr/ADR-0001-devai-example.md\`) | DEVAI fixture. | Accepted | — |\n`,
      );
      writeFile(
        root,
        'DESIGN-DECISIONS.md',
        // Id exibido LAW-ADR-0002, mas o caminho entre crases continua citando ADR-0001.
        `${DESIGN_DECISIONS_TEXT}| LAW-ADR-0002 (\`law/adr/ADR-0001-devai-example.md\`) | DEVAI fixture. | Accepted | — |\n`,
      );
    },
    async (root) => {
      const result = await runGate(root);
      assert.ok(findingIds(combined(result)).has('C-01-09'));
    },
  );
});

// ---------------------------------------------------------------------------
// 7.4 Gate — (d) rodadas × closures
// ---------------------------------------------------------------------------

test('C-01-17 dado um PC-*.json cujo round_id não tem linha em work/rounds/README.md quando o gate roda então acusa PC sem linha', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
      writeFile(
        root,
        'record/proofs/compliance/closures/PC-0099.json',
        JSON.stringify({ id: 'PC-0099', round_id: 'R-0099' }, null, 2),
      );
    },
    async (root) => {
      const result = await runGate(root);
      assert.ok(findingIds(combined(result)).has('C-01-17'));
    },
  );
});

test('C-01-17 dado o PC-0001 com round_id R-0003 presente na tabela quando o gate roda então não acusa PC sem linha', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
    },
    async (root) => {
      const result = await runGate(root);
      assert.ok(!findingIds(combined(result)).has('C-01-17'));
    },
  );
});

test('C-01-18 dado a linha do round_id do PC com Estado diferente de fechada quando o gate roda então acusa', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
      writeFile(
        root,
        'work/rounds/README.md',
        ROUNDS_README_TEXT.replace(
          '| R-0003 | fixture fechada | fechada | #1 | PC-0001 | Fixture |',
          '| R-0003 | fixture fechada | aberta | #1 | PC-0001 | Fixture |',
        ),
      );
    },
    async (root) => {
      const result = await runGate(root);
      assert.ok(findingIds(combined(result)).has('C-01-18'));
    },
  );
});

test('C-01-18 dado a linha do round_id do PC com a coluna PC diferente do id do PC quando o gate roda então acusa', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
      writeFile(
        root,
        'work/rounds/README.md',
        ROUNDS_README_TEXT.replace(
          '| R-0003 | fixture fechada | fechada | #1 | PC-0001 | Fixture |',
          '| R-0003 | fixture fechada | fechada | #1 | PC-0002 | Fixture |',
        ),
      );
    },
    async (root) => {
      const result = await runGate(root);
      assert.ok(findingIds(combined(result)).has('C-01-18'));
    },
  );
});

test('C-01-19 dado uma linha fechada com PC "—" quando o gate roda então acusa PC ausente', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
      writeFile(
        root,
        'work/rounds/README.md',
        `${ROUNDS_README_TEXT}| R-0004 | fixture sem PC | fechada | — | — | — |\n`,
      );
    },
    async (root) => {
      const result = await runGate(root);
      assert.ok(findingIds(combined(result)).has('C-01-19'));
    },
  );
});

test('C-01-19 dado uma linha fechada com PC inexistente quando o gate roda então acusa PC inexistente', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
      writeFile(
        root,
        'work/rounds/README.md',
        `${ROUNDS_README_TEXT}| R-0004 | fixture PC inexistente | fechada | — | PC-0055 | — |\n`,
      );
    },
    async (root) => {
      const result = await runGate(root);
      assert.ok(findingIds(combined(result)).has('C-01-19'));
    },
  );
});

test('C-01-19 dado uma linha fechada com PC existente e round_id igual à rodada quando o gate roda então não acusa', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
    },
    async (root) => {
      const result = await runGate(root);
      assert.ok(!findingIds(combined(result)).has('C-01-19'));
    },
  );
});

test('C-01-20 dado uma rodada fora de preMethodRounds marcada pré-método quando o gate roda então acusa', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
      writeFile(
        root,
        'work/rounds/README.md',
        ROUNDS_README_TEXT.replace(
          '| R-0003 | fixture fechada | fechada | #1 | PC-0001 | Fixture |',
          '| R-0003 | fixture fechada | pré-método | #1 | PC-0001 | Fixture |',
        ),
      );
    },
    async (root) => {
      const result = await runGate(root);
      assert.ok(findingIds(combined(result)).has('C-01-20'));
    },
  );
});

test('C-01-20 dado uma rodada de preMethodRounds com PC diferente de "—" quando o gate roda então acusa', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
      writeFile(
        root,
        'work/rounds/README.md',
        ROUNDS_README_TEXT.replace(
          '| R-0001 | fixture pré-método | pré-método | — | — | — |',
          '| R-0001 | fixture pré-método | pré-método | — | PC-0001 | — |',
        ),
      );
    },
    async (root) => {
      const result = await runGate(root);
      assert.ok(findingIds(combined(result)).has('C-01-20'));
    },
  );
});

test('C-01-20 dado preMethodRounds citando R-0002 sem linha na tabela quando o gate roda então acusa', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root, {
        config: baseConfig({ preMethodRounds: ['R-0001', 'R-0002'] }),
      });
    },
    async (root) => {
      const result = await runGate(root);
      assert.ok(findingIds(combined(result)).has('C-01-20'));
    },
  );
});

test('C-01-20 dado R-0001 e R-0002 em preMethodRounds, ambos na tabela com pré-método e PC "—" quando o gate roda então não acusa', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root, {
        config: baseConfig({ preMethodRounds: ['R-0001', 'R-0002'] }),
      });
      writeFile(
        root,
        'work/rounds/README.md',
        `${ROUNDS_README_TEXT}| R-0002 | fixture pré-método sem pasta | pré-método | — | — | — |\n`,
      );
    },
    async (root) => {
      const result = await runGate(root);
      assert.ok(!findingIds(combined(result)).has('C-01-20'));
    },
  );
});

test('C-01-21 dado um diretório work/rounds/R-0017 sem linha na tabela quando o gate roda então acusa', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
      mkDir(root, 'work/rounds/R-0017');
    },
    async (root) => {
      const result = await runGate(root);
      assert.ok(findingIds(combined(result)).has('C-01-21'));
    },
  );
});

test('C-01-21 dado R-0002 com linha e sem diretório quando o gate roda então não acusa (linha sem diretório é permitida)', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root, {
        config: baseConfig({ preMethodRounds: ['R-0001', 'R-0002'] }),
      });
      writeFile(
        root,
        'work/rounds/README.md',
        `${ROUNDS_README_TEXT}| R-0002 | fixture pré-método sem pasta | pré-método | — | — | — |\n`,
      );
    },
    async (root) => {
      const result = await runGate(root);
      assert.ok(!findingIds(combined(result)).has('C-01-21'));
    },
  );
});

test('C-01-22 dado uma linha de rodada fora de ^R-\\d{4}$/^S-\\d+\\.\\d+$ (R-18) quando o gate roda então acusa', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
      writeFile(
        root,
        'work/rounds/README.md',
        `${ROUNDS_README_TEXT}| R-18 | fixture id malformado | aberta | — | — | — |\n`,
      );
    },
    async (root) => {
      const result = await runGate(root);
      assert.ok(findingIds(combined(result)).has('C-01-22'));
    },
  );
});

test('C-01-22 dado um id de rodada repetido na tabela quando o gate roda então acusa', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
      writeFile(
        root,
        'work/rounds/README.md',
        `${ROUNDS_README_TEXT}| R-0003 | fixture repetida | fechada | #1 | PC-0001 | Fixture |\n`,
      );
    },
    async (root) => {
      const result = await runGate(root);
      assert.ok(findingIds(combined(result)).has('C-01-22'));
    },
  );
});

test('C-01-22 dado Estado fora do vocabulário (planned) quando o gate roda então acusa', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
      writeFile(
        root,
        'work/rounds/README.md',
        `${ROUNDS_README_TEXT}| R-0004 | fixture estado inválido | planned | — | — | — |\n`,
      );
    },
    async (root) => {
      const result = await runGate(root);
      assert.ok(findingIds(combined(result)).has('C-01-22'));
    },
  );
});

test('C-01-22 dado uma linha S-… com Estado diferente de "proposta (C-0002)" quando o gate roda então acusa', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
      writeFile(
        root,
        'work/rounds/README.md',
        `${ROUNDS_README_TEXT}| S-1.5 | fixture stynx | fechada | — | — | — |\n`,
      );
    },
    async (root) => {
      const result = await runGate(root);
      assert.ok(findingIds(combined(result)).has('C-01-22'));
    },
  );
});

test('C-01-22 dado uma linha S-… com "proposta (C-0002)" e PC "—" quando o gate roda então não acusa', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
      writeFile(
        root,
        'work/rounds/README.md',
        `${ROUNDS_README_TEXT}| S-1.5 | fixture stynx | proposta (C-0002) | — | — | — |\n`,
      );
    },
    async (root) => {
      const result = await runGate(root);
      assert.ok(!findingIds(combined(result)).has('C-01-22'));
    },
  );
});

test('C-01-23 dado uma ocorrência de "DEVAI 1.4.5" em work/rounds/README.md com package.json pinado em 1.5.6 quando o gate roda então acusa versão divergente', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
      writeFile(
        root,
        'work/rounds/README.md',
        ROUNDS_README_TEXT.replace('DEVAI 1.5.6', 'DEVAI 1.4.5'),
      );
    },
    async (root) => {
      const result = await runGate(root);
      assert.ok(findingIds(combined(result)).has('C-01-23'));
    },
  );
});

test('C-01-23 dado "DEVAI 1.5.6" em work/rounds/README.md com o mesmo pin em package.json quando o gate roda então não acusa', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
    },
    async (root) => {
      const result = await runGate(root);
      assert.ok(!findingIds(combined(result)).has('C-01-23'));
    },
  );
});

// ---------------------------------------------------------------------------
// 7.5 Gate — CLI
// ---------------------------------------------------------------------------

test('C-01-24 dado a fixture íntegra quando o gate roda então stdout começa com "verify:state-index OK:" e exit 0', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
    },
    async (root) => {
      const result = await runGate(root);
      assert.equal(result.status, 0, combined(result));
      assert.match(result.stdout, /^verify:state-index OK:/);
    },
  );
});

test('C-01-25 dado uma fixture com dois achados quando o gate roda então stderr traz o cabeçalho "verify:state-index: <n> achado(s)", uma linha por achado, ordenadas, e exit 1', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
      writeFile(
        root,
        'docs/meta/adr/ADR-36-x.md',
        '# ADR-36: X\n\n## Status\n\nAccepted on 2026-02-01.\n',
      );
      writeFile(
        root,
        'record/proofs/compliance/closures/PC-0099.json',
        JSON.stringify({ id: 'PC-0099', round_id: 'R-0099' }, null, 2),
      );
    },
    async (root) => {
      const result = await runGate(root);
      assert.equal(result.status, 1);
      assert.match(result.stderr, /^verify:state-index: \d+ achado\(s\)/);
      const ids = [...findingIds(combined(result))].sort();
      assert.ok(ids.includes('C-01-06'));
      assert.ok(ids.includes('C-01-17'));
      const orderedIds = parseFindingOrder(result.stderr);
      assert.deepEqual(orderedIds, [...orderedIds].sort());
    },
  );
});

function parseFindingOrder(text) {
  return text
    .split('\n')
    .map((line) => /^(C-01-\d{2})\s/.exec(line.trim()))
    .filter(Boolean)
    .map((m) => m[1]);
}

test('C-01-26 dado uma fixture com achados quando o gate roda com --report então as mesmas linhas saem em stdout, a última é "verify:state-index report: <n> achado(s)" e exit 0', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
      writeFile(
        root,
        'docs/meta/adr/ADR-36-x.md',
        '# ADR-36: X\n\n## Status\n\nAccepted on 2026-02-01.\n',
      );
    },
    async (root) => {
      const result = await runGate(root, ['--report']);
      assert.equal(result.status, 0, combined(result));
      const lines = result.stdout.trim().split('\n');
      assert.match(
        lines[lines.length - 1],
        /^verify:state-index report: \d+ achado\(s\)$/,
      );
      assert.ok(findingIds(result.stdout).has('C-01-06'));
    },
  );
});

test('C-01-27 dado um argumento desconhecido (--xyz) quando o gate roda então exit 2', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
    },
    async (root) => {
      const result = await runGate(root, ['--xyz']);
      assert.equal(result.status, 2);
      assert.match(result.stderr, /^verify:state-index: erro:/);
    },
  );
});

test('C-01-27 dado um config.json sem lawAdrMode quando o gate roda então exit 2', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
      writeFile(
        root,
        CONFIG_PATH,
        JSON.stringify(
          {
            schemaVersion: 1,
            statusExceptions: {},
            preMethodRounds: ['R-0001'],
          },
          null,
          2,
        ),
      );
    },
    async (root) => {
      const result = await runGate(root);
      assert.equal(result.status, 2);
      assert.match(result.stderr, /^verify:state-index: erro:/);
    },
  );
});

test('C-01-27 dado uma raiz sem work/rounds/README.md quando o gate roda então exit 2', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
    },
    async (root) => {
      const fs = await import('node:fs');
      fs.rmSync(join(root, 'work/rounds/README.md'));
      const result = await runGate(root);
      assert.equal(result.status, 2);
      assert.match(result.stderr, /^verify:state-index: erro:/);
    },
  );
});

// ---------------------------------------------------------------------------
// Adenda A2 — C-01-36: `\|` em célula de título não separa colunas (§6.5)
// ---------------------------------------------------------------------------

// Célula de título com o escape Markdown válido (`\|`) do §9.1/Adenda A2: o `\`
// antes do `|` não deve separar colunas.
const TITLE_CELL_ESCAPED = '`a\\|b`';
// Mesma célula sem o escape: o `|` cru é um separador de coluna a mais.
const TITLE_CELL_RAW = '`a|b`';

test('C-01-36 dado um índice cuja célula de título contém `a\\|b` (escapado) quando o gate roda então lê as quatro colunas corretas e a fixture íntegra continua sem achados', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
      writeFile(
        root,
        'docs/meta/adr/ADR-0007-title-pipe.md',
        '# ADR-0007: Title pipe\n\n## Status\n\nAccepted on 2026-02-01.\n',
      );
      writeFile(
        root,
        'docs/meta/adr/README.md',
        ADR_README_TEXT.replace(
          '## Aliases',
          `| [ADR-0007](ADR-0007-title-pipe.md) | ${TITLE_CELL_ESCAPED} | Accepted | — |\n\n## Aliases`,
        ),
      );
      writeFile(
        root,
        'DESIGN-DECISIONS.md',
        `${DESIGN_DECISIONS_TEXT}| [ADR-0007](docs/meta/adr/ADR-0007-title-pipe.md) | ${TITLE_CELL_ESCAPED} | Accepted | — |\n`,
      );
    },
    async (root) => {
      const result = await runGate(root);
      assert.equal(
        findingIds(combined(result)).size,
        0,
        `esperado 0 achados (célula escapada não desloca colunas); saída:\n${combined(result)}`,
      );
    },
  );
});

test('C-01-36 dado a mesma linha com `a|b` cru (sem escape) quando o gate roda então desloca as colunas e acusa C-01-15', async () => {
  await withRoot(
    (root) => {
      buildBaseTree(root);
      writeFile(
        root,
        'docs/meta/adr/ADR-0007-title-pipe.md',
        '# ADR-0007: Title pipe\n\n## Status\n\nAccepted on 2026-02-01.\n',
      );
      // docs/meta/adr/README.md fica correto (sem pipe) para isolar o deslocamento em
      // DESIGN-DECISIONS.md e evitar C-01-08/C-01-16 por um motivo diferente do testado.
      writeFile(
        root,
        'docs/meta/adr/README.md',
        ADR_README_TEXT.replace(
          '## Aliases',
          '| [ADR-0007](ADR-0007-title-pipe.md) | Title pipe fixture. | Accepted | — |\n\n## Aliases',
        ),
      );
      writeFile(
        root,
        'DESIGN-DECISIONS.md',
        `${DESIGN_DECISIONS_TEXT}| [ADR-0007](docs/meta/adr/ADR-0007-title-pipe.md) | ${TITLE_CELL_RAW} | Accepted | — |\n`,
      );
    },
    async (root) => {
      const result = await runGate(root);
      assert.ok(
        findingIds(combined(result)).has('C-01-15'),
        `esperado C-01-15 (coluna Status deslocada por '|' cru); saída:\n${combined(result)}`,
      );
    },
  );
});
