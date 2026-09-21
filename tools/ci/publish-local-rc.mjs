import { execFileSync } from 'node:child_process';
import { existsSync, realpathSync } from 'node:fs';
import { homedir } from 'node:os';
import { isAbsolute, join, relative, resolve } from 'node:path';
import process from 'node:process';

const root = process.cwd();
function assertOutsideRepository(path, label) {
  const candidate = existsSync(path) ? realpathSync(path) : resolve(path);
  const relation = relative(realpathSync(root), candidate);
  if (relation === '' || (!relation.startsWith('..') && !isAbsolute(relation)))
    throw new Error(`BLOCKED: ${label} must remain outside the repository`);
}

function exec(command, args, options = {}) {
  return execFileSync(command, args, {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    ...options,
  }).trim();
}

if (exec('git', ['status', '--porcelain=v1', '--untracked-files=all']) !== '')
  throw new Error(
    'BLOCKED: publishing local RC evidence requires a clean worktree',
  );
const head = exec('git', ['rev-parse', 'HEAD']);
const tree = exec('git', ['rev-parse', 'HEAD^{tree}']);
const upstream = exec('git', ['rev-parse', '@{upstream}']);
if (head !== upstream)
  throw new Error(
    'BLOCKED: evidence candidate must equal the published upstream',
  );
const branch = exec('git', ['branch', '--show-current']);
if (branch === '')
  throw new Error('BLOCKED: evidence publication requires a named branch');
const published = exec('git', [
  'ls-remote',
  '--heads',
  'origin',
  `refs/heads/${branch}`,
]).split(/\s/u)[0];
if (published !== head)
  throw new Error(
    'BLOCKED: evidence candidate is not the current remote branch head',
  );
const evidenceRoot =
  process.env.DEVAI_RC_EVIDENCE_ROOT ??
  join(homedir(), '.config/devai/evidence/detran');
assertOutsideRepository(evidenceRoot, 'evidence root');
const bundle = resolve(evidenceRoot, tree);
if (!existsSync(bundle))
  throw new Error(`BLOCKED: missing evidence bundle: ${bundle}`);
const publisher = join(
  root,
  'node_modules/@aarusso-nyx/devai/dist/runtime/evidence-verification/src/publish-cli.js',
);
const result = exec('node', [
  publisher,
  '--repo',
  root,
  '--bundle',
  bundle,
  '--trust',
  join(root, 'law/policy/devai-local-rc-trust-store.json'),
  '--default-branch',
  'main',
  '--remote',
  'origin',
  '--tag-prefix',
  'devai-local-evidence/',
  '--workflow',
  'devai-local-rc-verify.yml',
]);
process.stdout.write(`${result}\n`);
