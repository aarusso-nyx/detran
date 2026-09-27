import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const script = join(root, 'tools/detran-stack.sh');
const proxy = join(root, 'tools/detran-stack.proxy.json');
const packageJson = JSON.parse(
  readFileSync(join(root, 'package.json'), 'utf8'),
);

const stackScripts = [
  'stack',
  'stack:start',
  'stack:stop',
  'stack:restart',
  'stack:status',
  'stack:logs',
  'stack:build',
  'stack:db-init',
  'stack:db-reset',
];

function makeStub(bin, name, body) {
  const path = join(bin, name);
  writeFileSync(path, `#!/usr/bin/env bash\nset -euo pipefail\n${body}\n`, {
    mode: 0o755,
  });
  return path;
}

function runStack(args, env = {}) {
  const stateDir = mkdtempSync(
    join(tmpdir(), 'detran-stack-characterization-'),
  );
  const bin = mkdtempSync(join(tmpdir(), 'detran-stack-stubs-'));
  const calls = join(stateDir, 'stub-calls.log');
  writeFileSync(calls, '');
  makeStub(
    bin,
    'docker',
    'printf "docker %s\\n" "$*" >> "$DETRAN_TEST_STUB_CALLS"\nif [[ "${1:-}" == info ]]; then exit 0; fi\nexit 97',
  );
  makeStub(
    bin,
    'pnpm',
    'printf "pnpm %s\\n" "$*" >> "$DETRAN_TEST_STUB_CALLS"\nexit 97',
  );
  makeStub(
    bin,
    'psql',
    'printf "psql %s\\n" "$*" >> "$DETRAN_TEST_STUB_CALLS"\nexit 97',
  );
  const { PATH: requestedPath, ...restEnv } = env;
  try {
    const result = spawnSync('bash', [script, ...args], {
      cwd: root,
      encoding: 'utf8',
      env: {
        ...process.env,
        DETRAN_STACK_STATE_DIR: stateDir,
        DETRAN_TEST_STUB_CALLS: calls,
        PATH: `${bin}:${requestedPath ?? ''}:${process.env.PATH ?? ''}`,
        ...restEnv,
      },
    });
    return {
      ...result,
      calls: readFileSync(calls, 'utf8'),
    };
  } finally {
    rmSync(stateDir, { recursive: true, force: true });
    rmSync(bin, { recursive: true, force: true });
  }
}

test('dado o package.json adotado quando a superfície stack é enumerada então as nove entradas originais permanecem verbatim', () => {
  const expected = {
    stack: 'bash tools/detran-stack.sh',
    'stack:start': 'bash tools/detran-stack.sh start',
    'stack:stop': 'bash tools/detran-stack.sh stop',
    'stack:restart': 'bash tools/detran-stack.sh restart',
    'stack:status': 'bash tools/detran-stack.sh status',
    'stack:logs': 'bash tools/detran-stack.sh logs',
    'stack:build': 'bash tools/detran-stack.sh build',
    'stack:db-init': 'bash tools/detran-stack.sh db-init',
    'stack:db-reset': 'bash tools/detran-stack.sh db-reset',
  };
  assert.deepEqual(
    Object.fromEntries(
      stackScripts.map((name) => [name, packageJson.scripts[name]]),
    ),
    expected,
  );
});

test('dado help quando o comando é solicitado então termina com sucesso', () => {
  const result = runStack(['help']);
  assert.equal(result.status, 0, result.stderr);
});

test('dado um comando desconhecido quando a stack é invocada então termina com erro', () => {
  const result = runStack(['unknown-command']);
  assert.notEqual(result.status, 0);
});

for (const command of ['stop', 'status', 'build', 'db-init', 'db-reset']) {
  test(`dado ${command} quando recebe uma opção então recusa a opção`, () => {
    const result = runStack([command, '--unexpected-option']);
    assert.notEqual(result.status, 0);
  });
}

test('dado start quando recebe apenas --no-mock então não há erro de argumento desconhecido antes do runtime', () => {
  const accepted = runStack(['start', '--no-mock'], {
    PATH: '/intentionally-untrusted-path',
  });
  assert.notEqual(accepted.status, 0);
  assert.doesNotMatch(
    `${accepted.stdout}${accepted.stderr}`,
    /unknown start option/i,
  );
  assert.match(accepted.calls, /^docker /m);
  assert.doesNotMatch(accepted.calls, /^(?:pnpm|psql) /m);

  const result = runStack(['start', '--unexpected-option']);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stdout}${result.stderr}`, /unknown start option/);
});

test('dado db-reset quando o banco não autorizado é informado então recusa antes de DDL', () => {
  const result = runStack(['db-reset'], { DB_NAME: 'unsafe_db' });
  assert.notEqual(result.status, 0);
  assert.match(`${result.stdout}${result.stderr}`, /restricted/);
  assert.doesNotMatch(
    `${result.stdout}${result.stderr}`,
    /applying|resetting|psql/,
  );
  assert.doesNotMatch(result.calls, /^(?:pnpm|psql) /m);
  assert.doesNotMatch(result.calls, /^docker (?!info(?:\s|$))/m);
});

test('dado o proxy versionado quando ele é lido então v1 aponta para o backend loopback', () => {
  const value = JSON.parse(readFileSync(proxy, 'utf8'));
  assert.equal(value['/v1'].target, 'http://127.0.0.1:3001');
});

test('dado os quatro manifests Angular quando a superfície é lida então portas e projetos são os adotados', () => {
  const expected = [
    ['portal', 'portal-web'],
    ['rait', 'rait-web'],
    ['dashboard', 'dashboard-web'],
    ['teat', 'teat-web'],
  ];
  for (const [name, project] of expected) {
    const manifest = JSON.parse(
      readFileSync(join(root, `apps/${name}/web/angular.json`), 'utf8'),
    );
    assert.ok(manifest.projects[project]);
    assert.equal(Object.keys(manifest.projects).length, 1);
    const serve = manifest.projects[project].architect.serve;
    assert.equal(serve.builder, '@angular/build:dev-server');
    assert.ok(serve);
  }
});

test('dado apply full quando recebe os bancos de ensaio sem autorização então recusa antes de conectar', () => {
  const oldNames = [
    ['detran', 'r7', 'ctg1', 'a2'].join('_'),
    ['detran', 'r13'].join('_'),
  ];
  for (const name of [...oldNames, 'unsafe_db']) {
    const stateDir = mkdtempSync(
      join(tmpdir(), 'detran-apply-characterization-'),
    );
    const bin = mkdtempSync(join(tmpdir(), 'detran-apply-stubs-'));
    makeStub(bin, 'docker', 'exit 97');
    makeStub(bin, 'pnpm', 'exit 97');
    makeStub(bin, 'psql', 'exit 97');
    let result;
    try {
      result = spawnSync(
        'bash',
        [join(root, 'backend/database/apply.sh'), '--full'],
        {
          cwd: root,
          encoding: 'utf8',
          env: {
            ...process.env,
            DB_NAME: name,
            DETRAN_STACK_STATE_DIR: stateDir,
            PATH: `${bin}:${process.env.PATH}`,
          },
        },
      );
    } finally {
      rmSync(stateDir, { recursive: true, force: true });
      rmSync(bin, { recursive: true, force: true });
    }
    assert.equal(result.status, 2, `${name}: ${result.stderr}`);
    assert.doesNotMatch(`${result.stdout}${result.stderr}`, /psql|connect/i);
  }
});
