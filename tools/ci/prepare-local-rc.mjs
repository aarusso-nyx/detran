import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, realpathSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { isAbsolute, join, relative, resolve } from 'node:path';
import process from 'node:process';

const root = process.cwd();
const privateKey =
  process.env.DEVAI_RC_PRIVATE_KEY ??
  join(homedir(), '.config/devai/keys/detran-owner-ed25519.pem');
const publicKey =
  process.env.DEVAI_RC_PUBLIC_KEY ??
  join(homedir(), '.config/devai/keys/detran-owner-ed25519.pub.pem');

function exec(command, args, options = {}) {
  return execFileSync(command, args, {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    ...options,
  }).trim();
}

function findReceipt(value) {
  if (!value || typeof value !== 'object') return undefined;
  if (value.receipt && typeof value.receipt.path === 'string')
    return value.receipt.path;
  for (const child of Object.values(value)) {
    const found = findReceipt(child);
    if (found) return found;
  }
  return undefined;
}

function assertOutsideRepository(path, label) {
  const candidate = existsSync(path) ? realpathSync(path) : resolve(path);
  const relation = relative(realpathSync(root), candidate);
  if (relation === '' || (!relation.startsWith('..') && !isAbsolute(relation)))
    throw new Error(`BLOCKED: ${label} must remain outside the repository`);
}

for (const key of [privateKey, publicKey]) {
  if (!existsSync(key)) throw new Error(`BLOCKED: missing signing key: ${key}`);
}
assertOutsideRepository(privateKey, 'private signing key');
if ((statSync(privateKey).mode & 0o777) !== 0o600)
  throw new Error('BLOCKED: private signing key permissions must be 0600');
const status = exec('git', [
  'status',
  '--porcelain=v1',
  '--untracked-files=all',
]);
if (status !== '')
  throw new Error('BLOCKED: local RC requires a clean worktree');
const head = exec('git', ['rev-parse', 'HEAD']);
const tree = exec('git', ['rev-parse', 'HEAD^{tree}']);
let upstream;
try {
  upstream = exec('git', ['rev-parse', '@{upstream}']);
} catch {
  throw new Error('BLOCKED: local RC requires a published upstream branch');
}
if (head !== upstream)
  throw new Error('BLOCKED: local RC HEAD must equal the published upstream');
const branch = exec('git', ['branch', '--show-current']);
if (branch === '')
  throw new Error('BLOCKED: local RC requires a named published branch');
const published = exec('git', [
  'ls-remote',
  '--heads',
  'origin',
  `refs/heads/${branch}`,
]).split(/\s/u)[0];
if (published !== head)
  throw new Error(
    'BLOCKED: local RC HEAD is not the current remote branch head',
  );
if (process.version !== 'v24.15.0')
  throw new Error(`BLOCKED: expected Node v24.15.0, got ${process.version}`);
if (exec('pnpm', ['--version']) !== '9.15.0')
  throw new Error('BLOCKED: expected pnpm 9.15.0');

const checkOutput = exec(
  'pnpm',
  [
    'exec',
    'devai',
    'check',
    '--rc',
    '--run',
    '--task-timeout-ms',
    '3600000',
    '--as-role',
    'inspector',
    '--write',
    '--format',
    'json',
  ],
  {
    env: {
      ...process.env,
      DEVAI_DB_TESTS: '1',
      DETRAN_RC_CONTAINER_RUNTIME: 'docker',
      DETRAN_RC_POSTGIS_IMAGE:
        'postgis/postgis@sha256:44126d872ac91993766c341e369c539e8196614321765d36a6f1bab0419a5fa5',
      DETRAN_RC_POSTGRES_MAJOR: '16',
      DETRAN_RC_POSTGIS_VERSION: '3.4',
    },
    stdio: ['ignore', 'pipe', 'inherit'],
  },
);
const receipt = findReceipt(JSON.parse(checkOutput));
if (!receipt)
  throw new Error('BLOCKED: DEVAI did not return an attestable receipt');

const evidenceRoot =
  process.env.DEVAI_RC_EVIDENCE_ROOT ??
  join(homedir(), '.config/devai/evidence/detran');
assertOutsideRepository(evidenceRoot, 'evidence root');
mkdirSync(evidenceRoot, { recursive: true, mode: 0o700 });
assertOutsideRepository(evidenceRoot, 'evidence root');
const bundle = resolve(evidenceRoot, tree);
if (existsSync(bundle))
  throw new Error(
    `BLOCKED: immutable evidence bundle already exists: ${bundle}`,
  );
const controls = resolve(evidenceRoot, `${tree}.controls`);
mkdirSync(controls, { recursive: false, mode: 0o700 });
const toolchain = join(controls, 'toolchain.json');
const environment = join(controls, 'environment.json');
cpSync(join(root, 'law/policy/devai-local-rc-toolchain.json'), toolchain);
cpSync(join(root, 'law/policy/devai-local-rc-environment.json'), environment);

const exporter = join(
  root,
  'node_modules/@aarusso-nyx/devai/dist/runtime/evidence-verification/src/export-cli.js',
);
const result = exec('node', [
  exporter,
  '--repo',
  root,
  '--receipt',
  resolve(root, receipt),
  '--results-dir',
  join(root, '.devai/state/check-cache/v1/results'),
  '--profile',
  'rc',
  '--commit',
  head,
  '--tree',
  tree,
  '--toolchain',
  toolchain,
  '--environment',
  environment,
  '--private-key',
  privateKey,
  '--public-key',
  publicKey,
  '--signer-id',
  'owner-aarusso-nyx',
  '--output-dir',
  bundle,
]);
process.stdout.write(`${result}\n`);
process.stdout.write(`bundle=${bundle}\n`);
