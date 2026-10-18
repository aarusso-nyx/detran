// R-0033 TASK-0009 — prova de C-01: `ng serve --configuration preview` sobe sem backend.
// Inicia o serve em porta livre, espera até 180 s por `GET /` 200 com `portal-preview-root`,
// encerra o grupo de processos e sai com 0/1. Só faz `GET /` (nunca `/v1`).
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { fileURLToPath } from 'node:url';
const REPO_ROOT = fileURLToPath(new URL('../../../../../', import.meta.url));

const TIMEOUT_MS = 180000;

function freePort() {
  return new Promise((resolvePort, reject) => {
    const probe = createServer();
    probe.once('error', reject);
    probe.listen(0, '127.0.0.1', () => {
      const { port } = probe.address();
      probe.close(() => resolvePort(port));
    });
  });
}

const port = await freePort();
const child = spawn(
  'pnpm',
  [
    '--filter',
    '@detran/portal-web',
    'exec',
    'ng',
    'serve',
    '--configuration',
    'preview',
    '--port',
    String(port),
  ],
  { cwd: REPO_ROOT, detached: true, stdio: ['ignore', 'pipe', 'pipe'] },
);
let log = '';
child.stdout.on('data', (chunk) => (log += chunk));
child.stderr.on('data', (chunk) => (log += chunk));
let exited = false;
child.on('error', (error) => {
  log += String(error);
  exited = true;
});
child.on('exit', () => {
  exited = true;
});

function stop() {
  if (!child.pid) return;
  try {
    process.kill(-child.pid, 'SIGTERM');
  } catch {
    /* já encerrado */
  }
}
process.on('SIGINT', () => {
  stop();
  process.exit(130);
});

process.on('SIGTERM', () => {
  stop();
  process.exit(143);
});

let ok = false;
const deadline = Date.now() + TIMEOUT_MS;
while (Date.now() < deadline && !exited) {
  try {
    const response = await fetch(`http://127.0.0.1:${port}/`);
    const body = await response.text();
    if (response.status === 200 && body.includes('portal-preview-root')) {
      ok = true;
      break;
    }
  } catch {
    /* servidor ainda subindo */
  }
  await new Promise((r) => setTimeout(r, 2000));
}

stop();
await new Promise((r) => setTimeout(r, 3000));
if (child.pid) {
  try {
    process.kill(-child.pid, 'SIGKILL');
  } catch {
    /* já encerrado */
  }
}

if (ok) {
  console.log(
    `ok: ng serve --configuration preview respondeu 200 com portal-preview-root na porta ${port}`,
  );
  process.exit(0);
}
console.error(
  `FALHA: sem 200 com portal-preview-root em ${TIMEOUT_MS / 1000} s (exited=${exited}).\n${log.split('\n').slice(-30).join('\n')}`,
);
process.exit(1);
