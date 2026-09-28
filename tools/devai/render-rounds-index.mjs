#!/usr/bin/env node

import { realpathSync } from 'node:fs';
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { basename, dirname, join, relative } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const CLOSURES_DIRECTORY = join('record', 'proofs', 'compliance', 'closures');
const OUTPUT_PATH = join('record', 'derived', 'indexes', 'rounds.md');
const PC_ID = /^PC-\d+$/;
const ROUND_ID = /^R-\d{4}$/;

function fail(message) {
  throw new Error(message);
}

function displayPath(repoRoot, path) {
  return relative(repoRoot, path) || '.';
}

async function findClosureFiles(directory) {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    fail(`Cannot read closures directory ${directory}: ${error.message}`);
  }

  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await findClosureFiles(path)));
    } else if (entry.isFile() && /^PC-.*\.json$/.test(entry.name)) {
      files.push(path);
    }
  }

  return files.sort();
}

function parseClosure(path, source, repoRoot) {
  let closure;
  try {
    closure = JSON.parse(source);
  } catch (error) {
    fail(`Unreadable JSON in ${displayPath(repoRoot, path)}: ${error.message}`);
  }

  if (
    closure === null ||
    Array.isArray(closure) ||
    typeof closure !== 'object'
  ) {
    fail(`Invalid closure object in ${displayPath(repoRoot, path)}`);
  }

  if (typeof closure.id !== 'string' || !PC_ID.test(closure.id)) {
    fail(`Invalid PC id in ${displayPath(repoRoot, path)}`);
  }

  const fileName = basename(path);
  if (fileName !== `${closure.id}.json`) {
    fail(
      `Filename/id mismatch in ${displayPath(repoRoot, path)}: ` +
        `${fileName} does not match ${closure.id}.json`,
    );
  }

  if (
    typeof closure.round_id !== 'string' ||
    !ROUND_ID.test(closure.round_id)
  ) {
    fail(`Invalid round_id in ${displayPath(repoRoot, path)}`);
  }

  if (
    closure.supersedes !== undefined &&
    (typeof closure.supersedes !== 'string' || !PC_ID.test(closure.supersedes))
  ) {
    fail(`Invalid supersedes in ${displayPath(repoRoot, path)}`);
  }

  return closure;
}

function validateSupersession(closures) {
  const byId = new Map();
  for (const closure of closures) {
    if (byId.has(closure.id)) {
      fail(`Duplicate PC id: ${closure.id}`);
    }
    byId.set(closure.id, closure);
  }

  const successors = new Map(closures.map((closure) => [closure.id, []]));
  for (const closure of closures) {
    if (closure.supersedes === undefined) {
      continue;
    }

    const superseded = byId.get(closure.supersedes);
    if (superseded === undefined) {
      fail(`${closure.id} supersedes missing PC ${closure.supersedes}`);
    }
    if (superseded.round_id !== closure.round_id) {
      fail(
        `${closure.id} supersedes ${closure.supersedes} across rounds ` +
          `(${closure.round_id} and ${superseded.round_id})`,
      );
    }
    successors.get(closure.supersedes).push(closure.id);
  }

  const visiting = new Set();
  const visited = new Set();
  function visit(id) {
    if (visiting.has(id)) {
      fail(`Ciclo de supersessão detectado em ${id}`);
    }
    if (visited.has(id)) {
      return;
    }
    visiting.add(id);
    const supersedes = byId.get(id).supersedes;
    if (supersedes !== undefined) {
      visit(supersedes);
    }
    visiting.delete(id);
    visited.add(id);
  }
  for (const closure of closures) {
    visit(closure.id);
  }

  const byRound = new Map();
  for (const closure of closures) {
    const roundClosures = byRound.get(closure.round_id) ?? [];
    roundClosures.push(closure);
    byRound.set(closure.round_id, roundClosures);
  }
  for (const [roundId, roundClosures] of byRound) {
    const terminals = roundClosures.filter(
      (closure) => successors.get(closure.id).length === 0,
    );
    if (terminals.length !== 1) {
      fail(
        `Round ${roundId} has ${terminals.length} terminal PC heads: ` +
          terminals.map((closure) => closure.id).join(', '),
      );
    }
  }
}

function escapeMarkdownCell(value) {
  return String(value)
    .replaceAll('\\', '\\\\')
    .replaceAll('|', '\\|')
    .replaceAll('\n', ' ');
}

export function renderRoundsIndex(closures) {
  const sorted = [...closures].sort((left, right) => {
    const leftNumber = BigInt(left.id.slice(3));
    const rightNumber = BigInt(right.id.slice(3));
    if (leftNumber < rightNumber) {
      return -1;
    }
    if (leftNumber > rightNumber) {
      return 1;
    }
    return left.id.localeCompare(right.id);
  });
  const lines = [
    '# Índice de rodadas',
    '',
    '| PC | Rodada | Supersedes | merged_as |',
    '| --- | --- | --- | --- |',
  ];
  for (const closure of sorted) {
    lines.push(
      `| ${escapeMarkdownCell(closure.id)} | ` +
        `${escapeMarkdownCell(closure.round_id)} | ` +
        `${escapeMarkdownCell(closure.supersedes ?? '—')} | ` +
        `${escapeMarkdownCell(closure.merged_as ?? '—')} |`,
    );
  }
  return `${lines.join('\n')}\n`;
}

export async function loadClosures(repoRoot) {
  const closuresDirectory = join(repoRoot, CLOSURES_DIRECTORY);
  const files = await findClosureFiles(closuresDirectory);
  const closures = await Promise.all(
    files.map(async (path) => {
      let source;
      try {
        source = await readFile(path, 'utf8');
      } catch (error) {
        fail(`Cannot read ${displayPath(repoRoot, path)}: ${error.message}`);
      }
      return parseClosure(path, source, repoRoot);
    }),
  );
  validateSupersession(closures);
  return closures;
}

function parseArguments(argumentsList) {
  let repoRoot = process.cwd();
  let mode;
  for (let index = 0; index < argumentsList.length; index += 1) {
    const argument = argumentsList[index];
    if (argument === '--repo-root') {
      const value = argumentsList[index + 1];
      if (value === undefined || value.startsWith('--')) {
        fail('--repo-root requires a path');
      }
      repoRoot = value;
      index += 1;
    } else if (argument === '--write' || argument === '--check') {
      if (mode !== undefined) {
        fail('Use exactly one of --write or --check');
      }
      mode = argument;
    } else {
      fail(`Unknown argument: ${argument}`);
    }
  }
  if (mode === undefined) {
    fail('Use exactly one of --write or --check');
  }
  return { mode, repoRoot };
}

export async function main(argumentsList = process.argv.slice(2)) {
  const { mode, repoRoot } = parseArguments(argumentsList);
  const closures = await loadClosures(repoRoot);
  const expected = renderRoundsIndex(closures);
  const output = join(repoRoot, OUTPUT_PATH);

  if (mode === '--write') {
    await mkdir(dirname(output), { recursive: true });
    await writeFile(output, expected, 'utf8');
    return;
  }

  let actual;
  try {
    actual = await readFile(output, 'utf8');
  } catch (error) {
    fail(
      `Rounds index is missing or unreadable at ${displayPath(repoRoot, output)}: ` +
        error.message,
    );
  }
  if (actual !== expected) {
    fail(`Rounds index is stale: ${displayPath(repoRoot, output)}`);
  }
}

const invokedPath = process.argv[1];
if (
  invokedPath !== undefined &&
  realpathSync(invokedPath) === realpathSync(fileURLToPath(import.meta.url))
) {
  main().catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}
