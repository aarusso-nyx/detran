#!/usr/bin/env node
// Generates TypeScript types for every `docs/framework/contracts/*.openapi.json`
// contract — generated CRUD and hand-written `.commands` alike — into
// `packages/api-clients/src/generated/` (CTG-0005 §4). Molde:
// `packages/senatran-adapter/scripts/generate-contracts.ts`.
import {
  readFile,
  readdir,
  mkdir,
  mkdtemp,
  rm,
  writeFile,
} from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';

import openapiTS, { astToString } from 'openapi-typescript';
import { format } from 'prettier';

const root = process.cwd();

function relFromRoot(absolute) {
  return relative(root, absolute).split('\\').join('/');
}

/**
 * @param {{ contractsDir?: string, outDir?: string }} [options]
 * @returns {Promise<{ written: string[] }>}
 */
export async function generateClients({
  contractsDir = resolve(root, 'docs/framework/contracts'),
  outDir = resolve(root, 'packages/api-clients/src/generated'),
} = {}) {
  const names = (await readdir(contractsDir))
    .filter((name) => name.endsWith('.openapi.json'))
    .sort();

  await mkdir(outDir, { recursive: true });

  const written = [];
  const expectedBasenames = new Set();
  for (const name of names) {
    const inputPath = join(contractsDir, name);
    const outputName = `${name.slice(0, -'.openapi.json'.length)}.ts`;
    expectedBasenames.add(outputName);
    const outputPath = join(outDir, outputName);

    const generated = astToString(await openapiTS(pathToFileURL(inputPath)));
    const relativeInput = `docs/framework/contracts/${name}`;
    const content = await format(
      `// Generated from ${relativeInput}. Do not edit.\n${generated}`,
      { parser: 'typescript', singleQuote: true },
    );

    const existing = await readFile(outputPath, 'utf8').catch(() => null);
    if (existing !== content) {
      await writeFile(outputPath, content, 'utf8');
    }
    written.push(join(outDir, outputName).split('\\').join('/'));
  }

  const existingFiles = await readdir(outDir).catch(() => []);
  for (const name of existingFiles) {
    if (!name.endsWith('.ts')) continue;
    if (expectedBasenames.has(name)) continue;
    await rm(join(outDir, name));
  }

  return { written: written.sort() };
}

/**
 * Gera os clientes de `contractsDir` num diretório temporário (reaproveitando
 * `generateClients`) e compara byte a byte com `outDir`, sem nunca escrever
 * em `outDir`. Devolve também `expectedCount` (nº de arquivos esperados,
 * para o `<n>` da CLI) além de `ok`/`problems` — uso interno; `checkClients`
 * expõe só a forma pública de CTG-0005 §9 item 15.
 *
 * @param {{ contractsDir: string, outDir: string }} options
 * @returns {Promise<{ ok: boolean, problems: Array<{ kind: string, file: string, detail: string }>, expectedCount: number }>}
 */
async function diffClients({ contractsDir, outDir }) {
  const problems = [];
  const tempDir = await mkdtemp(join(tmpdir(), 'detran-check-clients-'));
  try {
    const { written } = await generateClients({
      contractsDir,
      outDir: tempDir,
    });
    const expectedNames = written.map((entry) => entry.split('/').pop()).sort();

    for (const name of expectedNames) {
      const expectedContent = await readFile(join(tempDir, name), 'utf8');
      const actualPath = join(outDir, name);
      const actualContent = await readFile(actualPath, 'utf8').catch(
        () => null,
      );
      if (actualContent === null) {
        problems.push({
          kind: 'missing-client',
          file: relFromRoot(actualPath),
          detail: `${name} não existe em ${relFromRoot(outDir)}; rode pnpm contracts:clients`,
        });
        continue;
      }
      if (actualContent !== expectedContent) {
        problems.push({
          kind: 'stale-client',
          file: relFromRoot(actualPath),
          detail: `${name} está fora de sincronia com ${relFromRoot(contractsDir)}; rode pnpm contracts:clients`,
        });
      }
    }

    const expectedSet = new Set(expectedNames);
    const existingFiles = await readdir(outDir).catch(() => []);
    for (const name of existingFiles) {
      if (!name.endsWith('.ts')) continue;
      if (expectedSet.has(name)) continue;
      problems.push({
        kind: 'orphan-client',
        file: relFromRoot(join(outDir, name)),
        detail: `${name} não corresponde a nenhum contrato em ${relFromRoot(contractsDir)}`,
      });
    }

    return {
      ok: problems.length === 0,
      problems,
      expectedCount: expectedNames.length,
    };
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

/**
 * @param {{ contractsDir?: string, outDir?: string }} [options]
 * @returns {Promise<{ ok: boolean, problems: Array<{ kind: 'stale-client' | 'missing-client' | 'orphan-client', file: string, detail: string }> }>}
 */
export async function checkClients({
  contractsDir = resolve(root, 'docs/framework/contracts'),
  outDir = resolve(root, 'packages/api-clients/src/generated'),
} = {}) {
  const { ok, problems } = await diffClients({ contractsDir, outDir });
  return { ok, problems };
}

async function runCli() {
  const checkMode = process.argv.includes('--check');
  if (checkMode) {
    try {
      const { ok, problems, expectedCount } = await diffClients({
        contractsDir: resolve(root, 'docs/framework/contracts'),
        outDir: resolve(root, 'packages/api-clients/src/generated'),
      });
      if (ok) {
        process.stdout.write(`clients in sync: ${expectedCount}\n`);
        return;
      }
      for (const problem of problems) {
        process.stderr.write(
          `${problem.kind}: ${problem.file} — ${problem.detail}\n`,
        );
      }
      process.exitCode = 1;
    } catch (error) {
      process.stderr.write(
        `${error instanceof Error ? error.message : String(error)}\n`,
      );
      process.exitCode = 1;
    }
    return;
  }
  try {
    const result = await generateClients({});
    process.stdout.write(`clients written: ${result.written.length}\n`);
  } catch (error) {
    process.stderr.write(
      `${error instanceof Error ? error.message : String(error)}\n`,
    );
    process.exitCode = 1;
  }
}

const isMain =
  process.argv[1] !== undefined &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) await runCli();
