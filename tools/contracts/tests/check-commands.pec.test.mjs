import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import {
  CONTROLLER_ROOTS,
  ERROR_CATALOG_PATHS,
  parseErrorCatalog,
} from '../check-commands.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');

const CH_COMMAND_MODULES = [
  'billing',
  'biometrics',
  'clinical-controls',
  'clinical-network',
  'clinical-reports',
  'encounters',
  'exams',
  'inconsistencies',
  'juntas',
  'operational-controls',
  'process-blocks',
  'restrictions',
  'retention',
  'scheduling',
  'telehealth',
];

test('dadas as 15 especificações BP-CH de comandos quando o checker é configurado então varre as raízes manuscritas ch e os controladores pec de composição', async () => {
  const contracts = await Promise.all(
    (await readFile(join(root, 'work/rounds/R-0031/route-manifest.md'), 'utf8'))
      .match(/BP-CH-[A-Z-]+-001\.commands\.openapi\.json/gu)
      ?.map((name) =>
        readFile(join(root, 'docs/framework/contracts', name), 'utf8'),
      ) ?? [],
  );

  assert.equal(contracts.length, 15);
  for (const module of CH_COMMAND_MODULES) {
    assert.ok(
      CONTROLLER_ROOTS.includes(`backend/domains/ch/${module}/src`),
      `raiz ch ausente do checker: ${module}`,
    );
  }
  assert.ok(
    CONTROLLER_ROOTS.includes('backend/app/src'),
    'a raiz de composição backend/app/src deve permanecer varrida',
  );
});

test('dado contrato PEC com código catalogado quando o checker valida catálogos então PEC é lido de pec-error-catalog.md', () => {
  const catalog = 'docs/framework/arch/pec-error-catalog.md';
  assert.ok(
    ERROR_CATALOG_PATHS.includes(catalog),
    'pec-error-catalog.md deve integrar ERROR_CATALOG_PATHS',
  );
  const codes = parseErrorCatalog(join(root, catalog), 'PEC');
  assert.ok(codes.has('PEC.FORBIDDEN_ACTION'));
  assert.ok(codes.has('PEC.NOT_FOUND'));
});
