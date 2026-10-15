// Builtin-only process rendezvous. No self-proc, package roots, SDK, SQL or writes.
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const SCRIPT = '/repo/scratch/r22-adoption-161/public-installer-preparation/populated-history-target-linux-resolution-03/verify_external_live_process.mjs';
const NODE = '/usr/local/bin/node';
const NODE_SHA = '89af8424dd53e560b1933f87ba650d8bf57c83ca5a04600eefb31f416aabbae7';
const LOADERS = Object.freeze({
  'internal/modules/cjs/loader': 'a3e3ee095d409597bf224522411607aa7d2f4747cf42b5329179bf3b4b5528ed',
  'internal/modules/customization_hooks': '02cf07c29fd2c4701ccc19395d5d0b11968aee34a9aefb37b5684f7248c457f7',
  'internal/modules/helpers': '3d6d6d7c7257610dcee83c76f29d6314ba56af5560faf50650a025fd9a56bbb3',
});
const sha = raw => createHash('sha256').update(raw).digest('hex');
const digest = raw => 'sha256:' + sha(raw);
function demand(ok, code) { if (!ok) throw Error('EXTERNAL_PROCESS_REFUSED:' + code); }
const hex = /^[0-9a-f]{64}$/;
const prefixed = value => typeof value === 'string' && value.startsWith('sha256:') && hex.test(value.slice(7));
const keys = (value, expected) => value !== null && typeof value === 'object' && !Array.isArray(value) &&
  JSON.stringify(Object.keys(value).sort()) === JSON.stringify([...expected].sort());
export function pid(value) {
  demand(typeof value === 'number' && Number.isSafeInteger(value) && value > 1 && value <= 2147483647, 'pid');
  return value;
}
export function ticks(value) {
  demand(typeof value === 'number' && Number.isSafeInteger(value) && value > 0, 'start-ticks');
  return value;
}
export function nonce(value) { demand(typeof value === 'string' && hex.test(value), 'nonce'); return value; }
export function parseInputFrame(raw, expectedKind, expectedNonce, expectedPid, expectedTicks = null) {
  demand(Buffer.isBuffer(raw) && raw.length > 1 && raw.length <= 16384 && raw.at(-1) === 10 &&
    raw.subarray(0, -1).indexOf(10) === -1, 'input-frame-bound');
  const body = raw.subarray(0, -1).toString('utf8');
  demand(Buffer.from(body, 'utf8').equals(raw.subarray(0, -1)), 'input-utf8');
  let value;
  try { value = JSON.parse(body); } catch { demand(false, 'input-json'); }
  demand(JSON.stringify(value) === body, 'input-canonical-or-duplicate');
  const expected = expectedKind === 'EXTERNAL_PROCESS_START' ?
    ['kind', 'nonce', 'pid', 'startTicks', 'readySha256', 'attestationSha256'] :
    ['kind', 'nonce', 'pid', 'startTicks', 'resultSha256', 'attestationSha256'];
  demand(keys(value, expected) && value.kind === expectedKind && value.nonce === expectedNonce &&
    value.pid === expectedPid, 'input-shape-identity');
  ticks(value.startTicks);
  if (expectedTicks !== null) demand(value.startTicks === expectedTicks, 'input-ticks');
  for (const key of expected.slice(4)) demand(prefixed(value[key]), 'input-digest:' + key);
  return value;
}
export function readyRuntime(processView, sourceBytes, embedded) {
  const { argv, execArgv, env, platform, arch, version, execPath, uid, euid, gid, egid, ownPid } = processView;
  demand(Array.isArray(argv) && argv.length === 3 && argv[0] === NODE && argv[1] === SCRIPT &&
    nonce(argv[2]) && Array.isArray(execArgv) && execArgv.length === 0 &&
    platform === 'linux' && arch === 'x64' && version === 'v24.20.0' && execPath === NODE &&
    [uid, euid, gid, egid].every(value => typeof value === 'number' && Number.isInteger(value) && value === 999),
    'official-runtime');
  pid(ownPid);
  demand(keys(env, ['LANG', 'LC_ALL', 'TZ']) && env.LANG === 'C.UTF-8' &&
    env.LC_ALL === 'C.UTF-8' && env.TZ === 'UTC', 'closed-env');
  demand(Buffer.isBuffer(sourceBytes) && sourceBytes.length > 0 && sourceBytes.length <= 262144,
    'source-bytes');
  demand(keys(embedded, Object.keys(LOADERS)) &&
    Object.entries(LOADERS).every(([name, expected]) => embedded[name] === 'sha256:' + expected),
    'loader-bytes');
  return { kind: 'EXTERNAL_PROCESS_READY', protocolVersion: 1, nonce: argv[2], pid: ownPid,
    node: { version, platform, arch, path: execPath, sha256: 'sha256:' + NODE_SHA,
      execArgv: [], uid, euid, gid, egid }, logicalArgv: [...argv],
    processEnv: { LANG: env.LANG, LC_ALL: env.LC_ALL, TZ: env.TZ },
    embeddedLoaders: embedded, scriptSha256: digest(sourceBytes) };
}
export function frame(value, bound) {
  const raw = Buffer.from(JSON.stringify(value) + '\n');
  demand(raw.length <= bound, 'output-frame-bound');
  return raw;
}
export function runtimeFenceRaw(ready) {
  demand(keys(ready, ['kind', 'protocolVersion', 'nonce', 'pid', 'node', 'logicalArgv',
    'processEnv', 'embeddedLoaders', 'scriptSha256']), 'fence-ready-shape');
  // UTF-8 bytes of this ordered, compact JSON object; no LF or other fields.
  return Buffer.from(JSON.stringify({ node: ready.node, logicalArgv: ready.logicalArgv,
    processEnv: ready.processEnv, embeddedLoaders: ready.embeddedLoaders,
    scriptSha256: ready.scriptSha256 }), 'utf8');
}

async function main() {
  const deadline = setTimeout(() => { process.stderr.write('EXTERNAL_PROCESS_REFUSED:deadline\n'); process.exit(2); }, 900000);
  deadline.unref();
  demand(process.argv.length === 3 && process.argv[1] === SCRIPT && fileURLToPath(import.meta.url) === SCRIPT &&
    process.cwd() === '/repo', 'fixed-invocation');
  const source = fs.readFileSync(SCRIPT);
  demand(fs.realpathSync(SCRIPT) === SCRIPT && sha(fs.readFileSync(NODE)) === NODE_SHA, 'source-or-node-bytes');
  const natives = process.binding('natives');
  const embedded = Object.fromEntries(Object.entries(LOADERS).map(([name, expected]) => {
    demand(typeof natives[name] === 'string' && sha(Buffer.from(natives[name], 'utf8')) === expected, 'loader:' + name);
    return [name, 'sha256:' + expected];
  }));
  const ready = readyRuntime({ argv: process.argv, execArgv: process.execArgv, env: process.env,
    platform: process.platform, arch: process.arch, version: process.version, execPath: process.execPath,
    uid: process.getuid(), euid: process.geteuid(), gid: process.getgid(), egid: process.getegid(),
    ownPid: process.pid }, source, embedded);
  const readyRaw = frame(ready, 65536);
  process.stdout.write(readyRaw);
  let phase = 'AWAIT_START';
  let buffer = Buffer.alloc(0);
  let resultRaw = null;
  let consumedStart = null;
  for await (const chunk of process.stdin) {
    demand(Buffer.isBuffer(chunk) && chunk.length > 0 && buffer.length + chunk.length <= 16384,
      'input-buffer-bound');
    buffer = Buffer.concat([buffer, chunk]);
    const lf = buffer.indexOf(10);
    if (lf < 0) continue;
    const one = buffer.subarray(0, lf + 1);
    buffer = buffer.subarray(lf + 1);
    demand(buffer.length === 0, 'early-extra-frame');
    if (phase === 'AWAIT_START') {
      const start = parseInputFrame(one, 'EXTERNAL_PROCESS_START', ready.nonce, ready.pid);
      demand(start.readySha256 === digest(readyRaw), 'ready-raw-digest');
      consumedStart = { frame: one, value: start };
      const runtimeRaw = runtimeFenceRaw(ready);
      resultRaw = frame({ kind: 'EXTERNAL_PROCESS_RESULT', nonce: ready.nonce, pid: ready.pid,
        startTicks: start.startTicks, readySha256: digest(readyRaw), startFrameSha256: digest(one),
        preAttestationSha256: start.attestationSha256, runtimeFenceSha256: digest(runtimeRaw),
        scope: 'PROCESS_ONLY_NO_GRAPH_SDK_SQL' }, 65536);
      phase = 'AWAIT_EXIT';
      process.stdout.write(resultRaw);
    } else if (phase === 'AWAIT_EXIT') {
      const exit = parseInputFrame(one, 'EXTERNAL_PROCESS_EXIT', ready.nonce, ready.pid,
        consumedStart.value.startTicks);
      demand(exit.resultSha256 === digest(resultRaw), 'result-raw-digest');
      phase = 'AWAIT_EOF';
    } else demand(false, 'extra-phase-frame');
  }
  demand(phase === 'AWAIT_EOF' && buffer.length === 0, 'early-eof-or-trailing-bytes');
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(error => { process.stderr.write(String(error.message) + '\n'); process.exitCode = 2; });
}
