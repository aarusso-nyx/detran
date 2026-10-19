import assert from 'node:assert/strict';
import test from 'node:test';
import { spawn } from 'node:child_process';
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  existsSync,
  readFileSync,
  rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const wrapper = fileURLToPath(
  new URL('../scorecard-local-task.mjs', import.meta.url),
);
test('interrupted fixture task terminates its child group and removes its disposable service', async () => {
  const root = mkdtempSync(join(tmpdir(), 'detran-fixture-cancel-'));
  mkdirSync(join(root, 'bin'));
  const executable = (name, source) =>
    writeFileSync(join(root, 'bin', name), `#!${process.execPath}\n${source}`, {
      mode: 0o755,
    });
  executable(
    'docker',
    `
    const fs = require('node:fs');
    const args = process.argv.slice(2);
    if (args[0] === 'run') fs.writeFileSync('fixture-active', 'owned');
    if (args[0] === 'logs') console.log('PostgreSQL init process complete; ready for start up.');
    if (args[0] === 'port') console.log('127.0.0.1:55432');
    if (args[0] === 'rm') fs.unlinkSync('fixture-active');
  `,
  );
  executable(
    'bash',
    `
    require('node:fs').writeFileSync('running-child', String(process.pid));
    setInterval(() => {}, 1000);
  `,
  );
  const child = spawn(process.execPath, [wrapper, 'migration'], {
    cwd: root,
    env: { ...process.env, PATH: `${join(root, 'bin')}:${process.env.PATH}` },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let diagnostic = '';
  child.stderr.on('data', (chunk) => {
    diagnostic += chunk;
  });
  child.stdout.resume();
  const closed = new Promise((resolve) =>
    child.once('close', (code, signal) => resolve({ code, signal })),
  );
  try {
    const until = Date.now() + 10000;
    while (!existsSync(join(root, 'running-child'))) {
      if (Date.now() > until || child.exitCode !== null)
        throw new Error(`Fixture did not start: ${diagnostic}`);
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
    const nestedPid = Number(readFileSync(join(root, 'running-child'), 'utf8'));
    assert.equal(existsSync(join(root, 'fixture-active')), true);
    child.kill('SIGTERM');
    const result = await Promise.race([
      closed,
      new Promise((_, reject) => {
        const timer = setTimeout(
          () => reject(new Error('Fixture cancellation did not complete')),
          5000,
        );
        timer.unref();
      }),
    ]);
    assert.notEqual(result.code, 0);
    assert.equal(existsSync(join(root, 'fixture-active')), false);
    assert.throws(() => process.kill(nestedPid, 0), { code: 'ESRCH' });
  } finally {
    if (child.exitCode === null && child.signalCode === null)
      child.kill('SIGKILL');
    await closed;
    rmSync(root, { recursive: true, force: true });
  }
});
