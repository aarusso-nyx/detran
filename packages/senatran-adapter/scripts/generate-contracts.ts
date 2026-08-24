import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import openapiTS, { astToString } from 'openapi-typescript';
import { format } from 'prettier';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = resolve(packageRoot, '../..');
const check = process.argv.includes('--check');

const contracts = [
  {
    input: resolve(
      repoRoot,
      'senatran-mock/docs/framework/contracts/openapi.yaml',
    ),
    output: resolve(packageRoot, 'src/generated/read.ts'),
    expectedOperations: 57,
  },
  {
    input: resolve(
      repoRoot,
      'senatran-mock/docs/framework/contracts/openapi-transactional.yaml',
    ),
    output: resolve(packageRoot, 'src/generated/transactional.ts'),
    expectedOperations: 57,
  },
] as const;

let drifted = false;
for (const contract of contracts) {
  const source = await readFile(contract.input, 'utf8');
  const operationCount = source.match(/^\s+operationId:/gmu)?.length ?? 0;
  if (operationCount !== contract.expectedOperations) {
    throw new Error(
      `${contract.input} contains ${operationCount} operations; expected ${contract.expectedOperations}`,
    );
  }
  const generated = astToString(await openapiTS(pathToFileURL(contract.input)));
  const content = await format(
    '// Generated from the in-repo SENATRAN mock contract. Do not edit.\n' +
      generated,
    { parser: 'typescript', singleQuote: true },
  );
  if (check) {
    const existing = await readFile(contract.output, 'utf8').catch(() => '');
    if (existing !== content) {
      drifted = true;
      console.error(`Generated contract drift: ${contract.output}`);
    }
  } else {
    await writeFile(contract.output, content, 'utf8');
    console.log(`Generated ${contract.output}`);
  }
}

if (drifted) process.exitCode = 1;
