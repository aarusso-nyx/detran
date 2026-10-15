// NOT_ADMISSION: source draft; never invoked by current CI before review.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
const proofPath =
  'tools/stynx-storage/fixtures/toolchain/node-linux-x64-proof.json';
const proofSha =
  '850f9028501f925da8c50057091e3259125c574691673a9097fa170a024f1ea8';
const executableSha =
  '89af8424dd53e560b1933f87ba650d8bf57c83ca5a04600eefb31f416aabbae7';
const inventoryPath =
  'tools/stynx-storage/fixtures/historical-fixture-inventory.json';
const inventorySha =
  'e81f89ca4154a4f5a75179019b688519cb075e54c147133cdcc40577be24fc87';
const hash = (b) => createHash('sha256').update(b).digest('hex');
const requireFact = (c, m) => {
  if (!c) throw new Error('NATIVE_STYNX_NODE_REFUSED:' + m);
};
function regular(root, relative) {
  requireFact(
    typeof relative === 'string' &&
      !path.isAbsolute(relative) &&
      !relative.includes('\\') &&
      relative.split('/').every((p) => p !== '' && p !== '.' && p !== '..'),
    'path',
  );
  let p = root;
  for (const part of relative.split('/')) {
    p = path.join(p, part);
    requireFact(!fs.lstatSync(p).isSymbolicLink(), 'link');
  }
  requireFact(
    fs.lstatSync(p).isFile() && fs.realpathSync(p).startsWith(root + path.sep),
    'regular',
  );
  return p;
}
function ref(root, relative) {
  const b = fs.readFileSync(regular(root, relative));
  return { path: relative, bytes: b.length, sha256: 'sha256:' + hash(b) };
}
function bound(root, record) {
  const actual = ref(root, record.path);
  requireFact(
    actual.bytes === record.bytes && actual.sha256 === record.sha256,
    'fixture-byte-identity',
  );
  return actual;
}
function main(root) {
  requireFact(
    process.platform === 'linux' &&
      process.arch === 'x64' &&
      os.machine() === 'x86_64' &&
      process.version === 'v24.20.0',
    'native-platform',
  );
  requireFact(process.execArgv.length === 0, 'arguments');
  requireFact(
    !Object.entries(process.env).some(
      ([k, v]) =>
        v &&
        /^(?:NODE_OPTIONS|NODE_PATH|NODE_PG_FORCE_NATIVE|DYLD_.*|LD_.*|QEMU_.*|DETRAN_STYNX_PROJECTOR_EXECUTION_SHA)$/u.test(
          k,
        ),
    ),
    'ambient-or-emulated-profile',
  );
  const executable = fs.realpathSync(process.execPath);
  requireFact(
    hash(fs.readFileSync(executable)) === executableSha,
    'executable',
  );
  const proofBytes = fs.readFileSync(regular(root, proofPath));
  requireFact(hash(proofBytes) === proofSha, 'official-proof');
  const proof = JSON.parse(proofBytes);
  const natives = process.binding('natives');
  const loaders = proof.loaders.map((r) => {
    requireFact(typeof natives[r.id] === 'string', 'loader-missing');
    const b = Buffer.from(natives[r.id]);
    requireFact(
      b.length === r.bytes && 'sha256:' + hash(b) === r.sha256,
      'embedded-loader',
    );
    return { id: r.id, bytes: b.length, sha256: r.sha256 };
  });
  requireFact(loaders.length === 3, 'loader-population');
  const inventoryBytes = fs.readFileSync(regular(root, inventoryPath));
  requireFact(hash(inventoryBytes) === inventorySha, 'fixture-inventory');
  const inventory = JSON.parse(inventoryBytes);
  const records = inventory.files;
  requireFact(
    Array.isArray(inventory.links) && inventory.links.length === 0,
    'unexpected-fixture-link',
  );
  requireFact(
    Array.isArray(records) && records.length === 441,
    'fixture-population',
  );
  const git = spawnSync(
    '/usr/bin/git',
    ['ls-files', '-z', '--', ...records.map((r) => r.path)],
    {
      cwd: root,
      encoding: 'utf8',
      env: { PATH: '/usr/bin:/bin', HOME: process.env.HOME ?? '' },
      maxBuffer: 4 * 1024 * 1024,
    },
  );
  requireFact(
    git.status === 0 && !git.signal && !git.error,
    'git-fixture-custody',
  );
  const tracked = new Set(git.stdout.split('\0').filter(Boolean));
  requireFact(
    tracked.size === 441 && records.every((r) => tracked.has(r.path)),
    'all-fixtures-git-tracked',
  );
  for (const record of records) bound(root, record);
  requireFact(
    !fs.existsSync(
      path.join(root, 'scratch/r22-adoption-161/portable-ci/retention-03'),
    ),
    'fresh-output-required',
  );
  const output = path.join(root, 'scratch/r22-adoption-161/native-ci');
  fs.mkdirSync(output, { recursive: true, mode: 0o700 });
  const file = path.join(output, 'native-node-proof.json');
  const bytes = Buffer.from(
    JSON.stringify(
      {
        formatVersion: 1,
        kind: 'actual-native-ci-node-proof',
        native: true,
        actual: {
          version: process.version,
          platform: process.platform,
          arch: process.arch,
          kernelMachine: os.machine(),
          pid: process.pid,
          executable,
        },
        executable: {
          bytes: fs.statSync(executable).size,
          sha256: 'sha256:' + executableSha,
        },
        loaders,
        proof: ref(root, proofPath),
        fixtureInventory: ref(root, inventoryPath),
        fixturesVerified: 441,
        fixturesGitTracked: 441,
        sdkExecuted: false,
        databaseAccessed: false,
      },
      null,
      2,
    ) + '\n',
  );
  const fd = fs.openSync(file, 'wx', 0o600);
  try {
    fs.writeFileSync(fd, bytes);
    fs.fsyncSync(fd);
  } finally {
    fs.closeSync(fd);
  }
  process.stdout.write(executable + '\n');
}
const sourceRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
);
// Production layout is tools/ci; draft is intentionally not invocable as installed code.
if (process.argv.length !== 3 || path.resolve(process.argv[2]) !== sourceRoot)
  throw new Error('NATIVE_STYNX_NODE_REFUSED:root-only');
main(fs.realpathSync(path.resolve(process.argv[2])));
