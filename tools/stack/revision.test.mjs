import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const stackScript = join(root, 'tools/detran-stack.sh');
const applyScript = join(root, 'backend/database/apply.sh');
const stackSource = readFileSync(stackScript, 'utf8');
const applySource = readFileSync(applyScript, 'utf8');
const ciSource = readFileSync(join(root, '.github/workflows/ci.yml'), 'utf8');
const proxy = JSON.parse(
  readFileSync(join(root, 'tools/detran-stack.proxy.json'), 'utf8'),
);
const newDatabase = ['detran', 'local', 'stack'].join('_');
const fullAuthorization = 'DETRAN_LOCAL_STACK_FULL_AUTHORIZED';

function makeStub(bin, name, body) {
  const path = join(bin, name);
  writeFileSync(
    path,
    `#!/usr/bin/env bash\nset -euo pipefail\nprintf '${name} %s\\n' "$*" >> "$DETRAN_TEST_STUB_CALLS"\n${body}\n`,
    { mode: 0o755 },
  );
}

function run(command, args, env = {}, stubs = {}) {
  const stateDir = mkdtempSync(join(tmpdir(), 'detran-stack-revision-state-'));
  const bin = mkdtempSync(join(tmpdir(), 'detran-stack-revision-stubs-'));
  const callsPath = join(stateDir, 'stub-calls.log');
  const defaults = {
    docker: `case "${'${1:-}'}" in
  info) exit 0 ;;
  inspect) exit 1 ;;
  compose) [[ "$*" == *' ps'* ]] && exit 0 ;;
esac
exit 97`,
    pnpm: 'exit 97',
    psql: 'exit 97',
    curl: 'exit 97',
    tail: 'exit 97',
    sleep: 'exit 0',
  };
  writeFileSync(callsPath, '');
  for (const [name, body] of Object.entries({ ...defaults, ...stubs })) {
    makeStub(bin, name, body);
  }
  const { PATH: requestedPath, ...restEnv } = env;
  try {
    const result = spawnSync(command, args, {
      cwd: root,
      encoding: 'utf8',
      env: {
        ...process.env,
        DETRAN_STACK_STATE_DIR: stateDir,
        DETRAN_TEST_STUB_CALLS: callsPath,
        PATH: `${bin}:${requestedPath ?? ''}:${process.env.PATH ?? ''}`,
        ...restEnv,
      },
    });
    return { ...result, calls: readFileSync(callsPath, 'utf8') };
  } finally {
    rmSync(stateDir, { recursive: true, force: true });
    rmSync(bin, { recursive: true, force: true });
  }
}

function runStack(args, env, stubs) {
  return run('bash', [stackScript, ...args], env, stubs);
}

function createStackHarness(stubs = {}) {
  const stateDir = mkdtempSync(
    join(tmpdir(), 'detran-stack-persistent-state-'),
  );
  const bin = mkdtempSync(join(tmpdir(), 'detran-stack-persistent-stubs-'));
  const callsPath = join(stateDir, 'stub-calls.log');
  const backendEnvironment = join(stateDir, 'backend-environment.log');
  const startedPids = join(stateDir, 'started-pids.log');
  writeFileSync(callsPath, '');
  writeFileSync(startedPids, '');
  const defaults = {
    docker: `case "${'${1:-}'}" in
  info) exit 0 ;;
  inspect)
    [[ "$*" == *--format* ]] && { printf '%s\\n' true; exit 0; }
    exit 0
    ;;
  exec) exit 0 ;;
  volume) exit 0 ;;
  compose)
    if [[ "$*" == *'version --short'* ]]; then
      printf '%s\\n' "${'${DETRAN_TEST_COMPOSE_VERSION:-2.24.4}'}"
    fi
    exit 0
    ;;
esac
exit 0`,
    pnpm: `if [[ "$*" == *'--filter @detran/app start'* ]]; then
  env | LC_ALL=C sort > "${backendEnvironment}"
fi
if [[ "$*" == *'--filter @detran/app start'* || "$*" == *'exec ng serve'* ]]; then
  printf '%s\\n' "$$" >> "${startedPids}"
  trap 'exit 0' TERM INT
  while :; do read -r -t 60 || :; done
fi
exit 0`,
    psql: 'exit 0',
    curl: 'exit 0',
    tail: 'exit 0',
    sleep: 'exit 0',
  };
  for (const [name, body] of Object.entries({ ...defaults, ...stubs })) {
    makeStub(bin, name, body);
  }

  function invoke(args, env = {}) {
    const { PATH: requestedPath, ...restEnv } = env;
    const result = spawnSync('bash', [stackScript, ...args], {
      cwd: root,
      encoding: 'utf8',
      env: {
        DETRAN_STACK_STATE_DIR: stateDir,
        DETRAN_TEST_STUB_CALLS: callsPath,
        HOME: process.env.HOME ?? '/tmp',
        PATH: `${bin}:${requestedPath ?? ''}:${process.env.PATH ?? ''}`,
        ...restEnv,
      },
    });
    return { ...result, calls: readFileSync(callsPath, 'utf8') };
  }

  function dispose() {
    for (const pid of readFileSync(startedPids, 'utf8')
      .split('\n')
      .filter(Boolean)) {
      try {
        process.kill(Number(pid), 'SIGTERM');
      } catch {
        // The process may already have been cleaned up by the stack.
      }
    }
    rmSync(stateDir, { recursive: true, force: true });
    rmSync(bin, { recursive: true, force: true });
  }

  return { backendEnvironment, callsPath, dispose, invoke, startedPids };
}

function assertRecordedProcessesStopped(path) {
  const pids = readFileSync(path, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map(Number);
  assert.ok(pids.length > 0, 'the controlled start created local processes');
  for (const pid of pids) {
    let running = true;
    try {
      process.kill(pid, 0);
    } catch {
      running = false;
    }
    assert.equal(running, false, `process ${pid} was left running`);
  }
}

function readConfig() {
  const secrets = [
    'fake-password-for-config',
    'fake-token-for-config',
    'fake-secret-for-config',
    'fake-key-for-config',
    'fake-cert-for-config',
    'fake-cognito-secret-for-config',
    'fake-clinical-token-for-config',
  ];
  const result = runStack(['config'], {
    DB_PASSWORD: secrets[0],
    EXTERNAL_CLINICAL_TOKEN: secrets[6],
    INTEGRATION_CERT: secrets[4],
    PADES_KEY: secrets[3],
    PROVIDER_SECRET: secrets[2],
    VENDOR_TOKEN: secrets[1],
    COGNITO_CLIENT_SECRET: secrets[5],
    PATH: '/intentionally-untrusted-path',
  });
  assert.equal(result.status, 0, result.stderr);
  assert.doesNotMatch(result.calls, /^(?:docker|pnpm|psql) /m);
  for (const secret of secrets) {
    assert.doesNotMatch(result.stdout, new RegExp(secret));
  }
  assert.doesNotMatch(result.stdout, /:\/\/[^/\s:@]+:[^@\s]+@/);
  return JSON.parse(result.stdout);
}

function frontendByName(config, name) {
  assert.ok(Array.isArray(config.services.frontends));
  const frontend = config.services.frontends.find(
    (candidate) => candidate.name === name,
  );
  assert.ok(frontend, `frontend ${name} is present`);
  return frontend;
}

test('C-01-05 dado o banco próprio quando apply full não recebe autorização então recusa antes de conectar', () => {
  const result = run('bash', [applyScript, '--full'], {
    DB_NAME: newDatabase,
    PATH: '/intentionally-untrusted-path',
  });
  assert.equal(result.status, 2);
  assert.match(
    `${result.stdout}${result.stderr}`,
    /requires explicit.*local.*stack|local.*stack.*authorization/i,
  );
  assert.doesNotMatch(result.calls, /^psql /m);
});

test('C-01-05 dado o banco próprio quando apply full recebe a autorização própria então chega à conexão stubbed', () => {
  const result = run(
    'bash',
    [applyScript, '--full'],
    {
      DB_NAME: newDatabase,
      [fullAuthorization]: '1',
      PATH: '/intentionally-untrusted-path',
    },
    { psql: 'printf "%s\\n" psql-called' },
  );
  assert.equal(result.status, 0, `${result.stdout}${result.stderr}`);
  assert.match(result.stdout, /psql-called/);
  assert.match(result.calls, /^psql /m);
  assert.match(applySource, new RegExp(fullAuthorization));
});

test('C-01-06 dado o CI quando a imagem PostGIS é comparada então o digest e a plataforma são iguais', () => {
  const match = ciSource.match(/image:\s*(postgis\/postgis@sha256:[^\s]+)/);
  assert.ok(match);
  assert.match(
    stackSource,
    new RegExp(match[1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
  );
  assert.match(stackSource, /--platform linux\/amd64/);
});

test('C-01-07 dado stack config quando é executado então retorna o JSON fechado sem segredos', () => {
  const config = readConfig();
  assert.deepEqual(Object.keys(config).sort(), [
    'database',
    'providers',
    'schema',
    'seed',
    'services',
    'state_dir',
    'timeouts',
  ]);
  assert.equal(config.schema, 'detran-stack-config/v1');
  assert.deepEqual(config.database, {
    container: 'detran-local-stack-postgres',
    volume: 'detran-local-stack-postgres',
    host: '127.0.0.1',
    port: 5432,
    user: 'postgres',
    name: newDatabase,
    image:
      'postgis/postgis@sha256:44126d872ac91993766c341e369c539e8196614321765d36a6f1bab0419a5fa5',
    platform: 'linux/amd64',
  });
  assert.deepEqual(config.seed, { profile: 'fresh' });
  assert.deepEqual(config.timeouts, { health_seconds: 120 });
  assert.deepEqual(config.services.backend, {
    state: 'active',
    host: '127.0.0.1',
    port: 3001,
    health: ['/healthz', '/readyz'],
  });
  assert.deepEqual(config.services.senatran_mock, {
    state: 'active',
    host: '127.0.0.1',
    port: 3000,
    health: ['/health'],
  });
  assert.deepEqual(config.providers, {
    senatran: { provider: 'mock', state: 'adapter_only' },
    sefaz: { state: 'pending', decision: 'OD-R17-001' },
    pades: { state: 'proposed_off', decision: 'OD-R17-002' },
    biometrics: { state: 'proposed_off', decision: 'OD-R17-002' },
    council: { state: 'proposed_off', decision: 'OD-R17-002' },
    bank: { provider: 'createMockBankPort', state: 'in_process' },
    normative_signer: { provider: 'local-unsigned', state: 'in_process' },
    authentication: {
      provider: 'DetranLocalTokenVerifier',
      state: 'in_process',
    },
    vapid: { state: 'source_pending', decision: 'OD-P88' },
    sne: { provider: 'mock', state: 'adapter_only' },
  });
});

test('C-01-08 dado a configuração resolvida quando RAIT é lido então usa rait-web e seu build target', () => {
  const rait = frontendByName(readConfig(), 'rait');
  assert.equal(rait.project, 'rait-web');
  assert.match(rait.command, /--build-target rait-web:build:development/);
});

test('C-01-07 dado a configuração resolvida quando os serviços são lidos então as portas e os frontends são a tabela contratada', () => {
  const config = readConfig();
  const expected = [
    ['portal', 'portal-web', 4200, 'active'],
    ['rait', 'rait-web', 4201, 'active'],
    ['dashboard', 'dashboard-web', 4202, 'active'],
    ['teat', 'teat-web', 4203, 'active'],
    ['pec', 'pec-web', 4204, 'not_built_r0031'],
  ];
  assert.equal(config.services.backend.port, 3001);
  assert.equal(config.services.senatran_mock.port, 3000);
  assert.equal(config.services.frontends.length, expected.length);
  for (const [name, project, port, state] of expected) {
    const frontend = frontendByName(config, name);
    const expectedFrontend = {
      name,
      directory: `apps/${name}/web`,
      port,
      project,
      state,
    };
    if (state === 'active') {
      assert.deepEqual(Object.keys(frontend).sort(), [
        'command',
        'directory',
        'name',
        'port',
        'project',
        'state',
      ]);
      assert.match(frontend.command, /--configuration development/);
      assert.match(frontend.command, /--host 127\.0\.0\.1/);
      assert.match(frontend.command, new RegExp(`--port ${port}`));
    } else {
      assert.deepEqual(Object.keys(frontend).sort(), [
        'directory',
        'name',
        'port',
        'project',
        'state',
      ]);
    }
    assert.deepEqual(
      Object.fromEntries(
        Object.entries(frontend).filter(([key]) => key !== 'command'),
      ),
      expectedFrontend,
    );
  }
});

for (const [variable, value] of [
  ['DETRAN_DB_IMAGE', 'registry.invalid/postgis:latest'],
  ['DB_HOST', '198.51.100.42'],
  ['DB_PORT', '6543'],
  ['DB_USER', 'unsafe-user'],
  ['DETRAN_BACKEND_PORT', '3999'],
]) {
  test(`C-01-07 dado ${variable} quando tenta sobrepor a superfície fixa então recusa antes de backend ou container`, () => {
    const result = runStack(['start', '--no-mock'], {
      [variable]: value,
      PATH: '/intentionally-untrusted-path',
    });
    assert.notEqual(result.status, 0);
    assert.doesNotMatch(result.calls, /^(?:docker|pnpm|psql) /m);
  });
}

for (const [variable, value] of [
  ['DETRAN_RUNTIME_PROFILE', 'production'],
  ['SENATRAN_PROVIDER', 'external'],
  ['SENATRAN_MOCK_BASE_URL', 'http://198.51.100.42:3000'],
  ['SENATRAN_MOCK_BASE_URL', 'http://user:password@127.0.0.1:3000'],
]) {
  test(`C-01-07 dado ${variable} inválida quando config é solicitado então recusa sem alcançar runtime`, () => {
    const result = runStack(['config'], {
      [variable]: value,
      PATH: '/intentionally-untrusted-path',
    });
    assert.notEqual(result.status, 0);
    assert.doesNotMatch(result.calls, /^(?:docker|pnpm|psql) /m);
  });
}

test('C-01-09 dado status quando o slot PEC não possui angular.json então grava a linha UTF-8 contratada', () => {
  const result = runStack(['status'], {
    PATH: '/intentionally-untrusted-path',
  });
  assert.equal(result.status, 0, result.stderr);
  assert.ok(
    Buffer.from(result.stdout, 'utf8').includes(
      Buffer.from('pec: não construído (R-0031)\n', 'utf8'),
    ),
  );
  assert.doesNotMatch(result.calls, /pec/);
});

test('C-01-10 dado o mock SENATRAN quando Compose resolve a configuração então o override publica somente loopback', () => {
  const override = join(root, 'tools/stack/senatran-mock.compose.yml');
  assert.ok(existsSync(override), 'the stack-owned Compose override exists');
  const result = spawnSync(
    'docker',
    [
      'compose',
      '-f',
      'senatran-mock/docker-compose.yml',
      '-f',
      override,
      'config',
      '--format',
      'json',
    ],
    { cwd: root, encoding: 'utf8' },
  );
  assert.equal(
    result.status,
    0,
    result.stderr || 'Compose CLI is unavailable for offline config validation',
  );
  const ports = JSON.parse(result.stdout).services.app.ports;
  assert.equal(ports.length, 1);
  const port = ports[0];
  if (typeof port === 'string') {
    assert.equal(port, '127.0.0.1:3000:3000');
  } else {
    assert.equal(port.host_ip, '127.0.0.1');
    assert.equal(String(port.published), '3000');
    assert.equal(String(port.target), '3000');
  }
  assert.match(stackSource, /2\.24\.4/);
});

for (const [version, shouldStart] of [
  ['2.24.3', false],
  ['2.24.4', true],
]) {
  test(`C-01-10 dado Docker Compose ${version} quando start prepara o mock então valida a versão antes de up`, () => {
    const harness = createStackHarness({
      curl: 'exit 22',
    });
    try {
      const result = harness.invoke(['start'], {
        DETRAN_STACK_HEALTH_TIMEOUT_SECONDS: '1',
        DETRAN_TEST_COMPOSE_VERSION: version,
        PATH: '/intentionally-untrusted-path',
      });
      if (shouldStart) {
        assert.match(result.calls, /^docker compose .* up /m);
      } else {
        assert.notEqual(result.status, 0);
        assert.match(`${result.stdout}${result.stderr}`, /Compose >= 2\.24\.4/);
        assert.doesNotMatch(result.calls, /^docker compose .* up /m);
      }
    } finally {
      harness.dispose();
    }
  });
}

test('C-01-07 dado start --no-mock quando falha de forma controlada então config persiste mock desabilitado e stop limpa o modo', () => {
  const harness = createStackHarness({
    curl: '[[ "$*" == *":4200/"* ]] && exit 22 || exit 0',
  });
  try {
    const started = harness.invoke(['start', '--no-mock'], {
      DETRAN_STACK_HEALTH_TIMEOUT_SECONDS: '1',
      PATH: '/intentionally-untrusted-path',
    });
    assert.notEqual(started.status, 0);
    const disabled = harness.invoke(['config']);
    assert.equal(disabled.status, 0, disabled.stderr);
    assert.equal(
      JSON.parse(disabled.stdout).services.senatran_mock.state,
      'disabled',
    );
    const stopped = harness.invoke(['stop']);
    assert.equal(stopped.status, 0, stopped.stderr);
    const enabled = harness.invoke(['config']);
    assert.equal(enabled.status, 0, enabled.stderr);
    assert.equal(
      JSON.parse(enabled.stdout).services.senatran_mock.state,
      'active',
    );
  } finally {
    harness.dispose();
  }
});

test('C-01-07 dado start --no-mock quando health é chamado depois então não sonda o mock desabilitado', () => {
  const harness = createStackHarness({
    curl: '[[ "$*" == *":4200/"* ]] && exit 22 || exit 0',
  });
  try {
    const started = harness.invoke(['start', '--no-mock'], {
      DETRAN_STACK_HEALTH_TIMEOUT_SECONDS: '1',
      PATH: '/intentionally-untrusted-path',
    });
    assert.notEqual(started.status, 0);
    writeFileSync(harness.callsPath, '');
    const health = harness.invoke(['health'], {
      DETRAN_STACK_HEALTH_TIMEOUT_SECONDS: '1',
      PATH: '/intentionally-untrusted-path',
    });
    assert.notEqual(health.status, 0);
    assert.doesNotMatch(health.calls, /:3000\/health/);
  } finally {
    harness.dispose();
  }
});

test('C-01-07 dado variáveis sensíveis quando backend inicia então elas não atravessam o ambiente explicitamente permitido', () => {
  const secrets = [
    'fake-token-for-backend',
    'fake-secret-for-backend',
    'fake-key-for-backend',
    'fake-cert-for-backend',
    'fake-cognito-secret-for-backend',
    'fake-clinical-token-for-backend',
  ];
  const harness = createStackHarness({ curl: 'exit 22' });
  try {
    const result = harness.invoke(['start', '--no-mock'], {
      DETRAN_STACK_HEALTH_TIMEOUT_SECONDS: '1',
      VENDOR_TOKEN: secrets[0],
      PROVIDER_SECRET: secrets[1],
      PADES_KEY: secrets[2],
      INTEGRATION_CERT: secrets[3],
      COGNITO_CLIENT_SECRET: secrets[4],
      EXTERNAL_CLINICAL_TOKEN: secrets[5],
      PATH: '/intentionally-untrusted-path',
    });
    assert.notEqual(result.status, 0);
    const backendEnvironment = existsSync(harness.backendEnvironment)
      ? readFileSync(harness.backendEnvironment, 'utf8')
      : '';
    for (const secret of secrets) {
      assert.doesNotMatch(backendEnvironment, new RegExp(secret));
    }
    for (const variable of [
      'DETRAN_LOCAL_ACTOR_ID',
      'DETRAN_LOCAL_CPF',
      'DETRAN_LOCAL_ASSURANCE_LEVEL',
      'SENATRAN_MOCK_CPF_USUARIO',
      'SENATRAN_MOCK_CLIENT_CERT_CN',
    ]) {
      assert.doesNotMatch(backendEnvironment, new RegExp(`^${variable}=`, 'm'));
    }
  } finally {
    harness.dispose();
  }
});

test('C-01-11 dado start quando a saúde do backend expira então informa timeout e não deixa PID ou processo local', () => {
  const harness = createStackHarness({
    curl: 'exit 22',
    tail: 'printf "%s\\n" backend-last-eighty-lines',
  });
  try {
    const result = harness.invoke(['start', '--no-mock'], {
      DETRAN_STACK_HEALTH_TIMEOUT_SECONDS: '1',
      PATH: '/intentionally-untrusted-path',
    });
    assert.notEqual(result.status, 0);
    assert.match(
      `${result.stdout}${result.stderr}`,
      /health timeout: backend/i,
    );
    assert.match(
      `${result.stdout}${result.stderr}`,
      /backend-last-eighty-lines/,
    );
    assert.match(result.calls, /^tail .*80/m);
    assertRecordedProcessesStopped(harness.startedPids);
    for (const service of ['backend', 'portal', 'rait', 'dashboard', 'teat']) {
      assert.equal(
        existsSync(
          join(dirname(harness.startedPids), 'pids', `${service}.pid`),
        ),
        false,
      );
    }
  } finally {
    harness.dispose();
  }
});

test('C-01-11 dado start quando somente a saúde do mock expira então pede os logs Compose do serviço app', () => {
  const harness = createStackHarness({
    curl: '[[ "$*" == *":3000/health"* ]] && exit 22 || exit 0',
  });
  try {
    const result = harness.invoke(['start'], {
      DETRAN_STACK_HEALTH_TIMEOUT_SECONDS: '1',
      PATH: '/intentionally-untrusted-path',
    });
    assert.notEqual(result.status, 0);
    assert.match(`${result.stdout}${result.stderr}`, /senatran-mock/i);
    assert.match(result.calls, /^docker compose .* logs --tail=80 app$/m);
  } finally {
    harness.dispose();
  }
});

test('C-01-11 dado health com respondentes locais quando todos respondem então sonda somente os endpoints ativos', () => {
  const result = runStack(
    ['health'],
    {
      DETRAN_STACK_HEALTH_TIMEOUT_SECONDS: '1',
      PATH: '/intentionally-untrusted-path',
    },
    { curl: 'exit 0' },
  );
  assert.equal(result.status, 0, result.stderr);
  for (const endpoint of [
    'http://127.0.0.1:3001/healthz',
    'http://127.0.0.1:3001/readyz',
    'http://127.0.0.1:3000/health',
    'http://127.0.0.1:4200/',
    'http://127.0.0.1:4201/',
    'http://127.0.0.1:4202/',
    'http://127.0.0.1:4203/',
  ]) {
    assert.match(
      result.calls,
      new RegExp(endpoint.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
    );
  }
  assert.doesNotMatch(result.calls, /sefaz/i);
});

test('C-01-11 dado health quando backend não responde então respeita o timeout e diagnostica o culpado', () => {
  const result = runStack(
    ['health'],
    {
      DETRAN_STACK_HEALTH_TIMEOUT_SECONDS: '1',
      PATH: '/intentionally-untrusted-path',
    },
    { curl: 'exit 22', tail: 'printf "%s\\n" last-eighty-lines' },
  );
  assert.notEqual(result.status, 0);
  assert.match(`${result.stdout}${result.stderr}`, /backend/i);
  assert.match(result.calls, /^curl .*healthz/m);
  assert.match(result.calls, /^tail .*80/m);
  assert.match(`${result.stdout}${result.stderr}`, /last-eighty-lines/);
});

test('C-01-12 dado os papéis locais padrão quando a stack os declara então pertencem ao catálogo composto', () => {
  const rolesSource = readFileSync(
    join(root, 'backend/domains/shared/src/roles.ts'),
    'utf8',
  );
  const defaults =
    stackSource.match(/DETRAN_LOCAL_ROLES:-([^"}]+)/)?.[1]?.split(',') ?? [];
  assert.deepEqual(defaults, [
    'technical-admin',
    'agency-admin',
    'field-agent',
    'rait-coordinator',
    'dash-operator',
  ]);
  const arrays = new Map(
    [
      ...rolesSource.matchAll(/export const (\w+) = \[([\s\S]*?)\] as const;/g),
    ].map(([, name, source]) => [
      name,
      [...source.matchAll(/'([^']+)'/g)].map(([, role]) => role),
    ]),
  );
  const detranSource = rolesSource.match(
    /export const DETRAN_ROLES = \[([\s\S]*?)\] as const;/,
  )?.[1];
  assert.ok(detranSource, 'DETRAN_ROLES is declared as a closed catalog');
  const catalog = new Set(
    [
      ...detranSource.matchAll(/'([^']+)'/g),
      ...detranSource.matchAll(/\.\.\.(\w+)/g),
    ].flatMap((match) => arrays.get(match[1]) ?? [match[1]]),
  );
  for (const role of defaults) {
    assert.ok(catalog.has(role), `${role} belongs to DETRAN_ROLES`);
  }
});

test('C-01-13 dado db-reset quando o volume é gerenciado então preserva volumes e usa somente a autorização própria', () => {
  assert.doesNotMatch(
    stackSource,
    /docker\s+volume\s+rm|docker\s+volume\s+prune/,
  );
  assert.match(stackSource, /volumes preserved|never removes Docker volumes/i);
  assert.match(stackSource, new RegExp(fullAuthorization));
  assert.match(stackSource, new RegExp(newDatabase));
});

test('C-01-04 dado os serviços ativos quando proxy e backend são comparados então usam a mesma porta contratada', () => {
  assert.equal(proxy['/v1'].target, 'http://127.0.0.1:3001');
});
