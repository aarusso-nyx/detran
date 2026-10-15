// NOT_ADMISSION: fixed CI phases only; no invocation during source preparation.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
);
const sha = (b) => createHash('sha256').update(b).digest('hex');
const requireFact = (c, m) => {
  if (!c) throw new Error('NATIVE_STYNX_PHASE_REFUSED:' + m);
};
const producer = 'tools/stynx-storage-ci-inputs.mjs';
const projector = 'tools/stynx-storage-project-published.mjs';
const validation = 'tools/stynx-storage-ci-validation.mjs';
const producerSha =
  'd0a31499148a68023785ea734e2594a0794ed8f0a22d795a4f0c1ce6f32d86d0';
const validationSha =
  'f6ce3043cf0627bcf40e8719970cd4b6b5e6fdfce937554eedcccdeb44d7379b';
const projectorSha =
  '7e84e4ab9ec6395037807b60321c215dd6e48da7db777eb4afc0da69f279dddb';
const phase = process.argv[3];
requireFact(
  process.argv.length === 4 &&
    path.resolve(process.argv[2]) === root &&
    ['producer', 'projector', 'tests'].includes(phase),
  'fixed-cli',
);
requireFact(
  process.env.GITHUB_ACTIONS === 'true' && !process.execArgv.length,
  'actual-ci',
);
const directory = path.join(root, 'scratch/r22-adoption-161/native-ci');
const proof = JSON.parse(
  fs.readFileSync(path.join(directory, 'native-node-proof.json'), 'utf8'),
);
requireFact(
  proof.native === true &&
    proof.actual.platform === 'linux' &&
    proof.actual.kernelMachine === 'x86_64' &&
    proof.actual.version === 'v24.20.0',
  'actual-node-proof',
);
const executable = fs.realpathSync(process.execPath);
requireFact(
  executable === proof.actual.executable &&
    'sha256:' + sha(fs.readFileSync(executable)) === proof.executable.sha256,
  'exact-executable',
);
for (const [file, digest] of [
  [producer, producerSha],
  [validation, validationSha],
])
  requireFact(
    sha(fs.readFileSync(path.join(root, file))) === digest,
    'input-source',
  );
const env = {
  PATH: process.env.PATH ?? '/usr/bin:/bin',
  HOME: process.env.HOME ?? '',
  LANG: 'C.UTF-8',
  TMPDIR: process.env.RUNNER_TEMP ?? '/tmp',
};
if (phase === 'producer')
  requireFact(
    typeof process.env.NODE_AUTH_TOKEN === 'string' &&
      process.env.NODE_AUTH_TOKEN !== '' &&
      (env.NODE_AUTH_TOKEN = process.env.NODE_AUTH_TOKEN),
    'package-auth',
  );
else requireFact(!process.env.NODE_AUTH_TOKEN, 'auth-outside-fetch');
let args;
if (phase === 'producer') args = [producer, root];
else if (phase === 'projector') {
  requireFact(
    projectorSha !== null &&
      sha(fs.readFileSync(path.join(root, projector))) === projectorSha,
    'reviewed-projector-unavailable',
  );
  args = [projector, root];
} else {
  const files = fs
    .readdirSync(path.join(root, 'tools/stynx-storage/tests'))
    .filter((n) => n.endsWith('.test.mjs'))
    .sort();
  requireFact(files.length > 0, 'complete-test-population');
  args = ['--test', ...files.map((n) => 'tools/stynx-storage/tests/' + n)];
}
const stdoutPath = path.join(directory, phase + '-stdout.log'),
  stderrPath = path.join(directory, phase + '-stderr.log');
const out = fs.openSync(stdoutPath, 'wx', 0o600),
  err = fs.openSync(stderrPath, 'wx', 0o600);
let result;
try {
  result = spawnSync(executable, args, {
    cwd: root,
    env,
    stdio: ['ignore', out, err],
    timeout: 60 * 60 * 1000,
    shell: false,
  });
} finally {
  fs.fsyncSync(out);
  fs.fsyncSync(err);
  fs.closeSync(out);
  fs.closeSync(err);
}
const manifest = {
  phase,
  argv: [executable, ...args],
  native: true,
  status: result.status,
  signal: result.signal,
  error: result.error?.code ?? null,
  stdout: {
    path: path.relative(root, stdoutPath),
    sha256: 'sha256:' + sha(fs.readFileSync(stdoutPath)),
  },
  stderr: {
    path: path.relative(root, stderrPath),
    bytes: fs.statSync(stderrPath).size,
    sha256: 'sha256:' + sha(fs.readFileSync(stderrPath)),
  },
  automaticRerun: false,
};
const fd = fs.openSync(
  path.join(directory, phase + '-completion.json'),
  'wx',
  0o600,
);
try {
  fs.writeFileSync(fd, JSON.stringify(manifest, null, 2) + '\n');
  fs.fsyncSync(fd);
} finally {
  fs.closeSync(fd);
}
requireFact(
  !result.error && !result.signal && result.status === 0,
  'child-stop',
);
if (phase === 'projector')
  requireFact(fs.statSync(stderrPath).size === 0, 'ordinary-empty-stderr');
process.stdout.write(fs.readFileSync(stdoutPath));
