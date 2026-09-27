import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import test from 'node:test';

const root = resolve(new URL('../..', import.meta.url).pathname);
const mockPath = join(root, 'tools/stack/mocks/sefaz-mock.mjs');
const smokePath = join(root, 'tools/stack/smoke.mjs');
const portalFixturePath = join(root, 'tools/stack/portal-fixture.sh');

function createPortalCommandStubs() {
  const bin = mkdtempSync(join(tmpdir(), 'detran-portal-fixture-stubs-'));
  const callsPath = join(bin, 'calls.log');
  const sqlPath = join(bin, 'stdin.sql');
  writeFileSync(callsPath, '');
  for (const [name, body] of Object.entries({
    docker: `#!/bin/sh
set -eu
printf 'docker\\t%s\\n' "$*" >> "$DETRAN_TEST_PORTAL_CALLS"
if [ "${'${1:-}'}" = exec ]; then cat > "$DETRAN_TEST_PORTAL_SQL"; fi
`,
    psql: `#!/bin/sh
set -eu
printf 'psql\\t%s\\n' "$*" >> "$DETRAN_TEST_PORTAL_CALLS"
`,
  })) {
    writeFileSync(join(bin, name), body, { mode: 0o755 });
  }
  return { bin, callsPath, sqlPath };
}

test('C-02-05 A6 dado outro banco quando a fixture Portal e invocada entao recusa antes de SQL', () => {
  assert.ok(existsSync(portalFixturePath));
  const stubs = createPortalCommandStubs();
  try {
    const result = spawnSync('/bin/bash', [portalFixturePath], {
      cwd: root,
      encoding: 'utf8',
      env: {
        DB_NAME: 'not_detran_local_stack',
        DETRAN_TEST_PORTAL_CALLS: stubs.callsPath,
        DETRAN_TEST_PORTAL_SQL: stubs.sqlPath,
        PATH: `${stubs.bin}:/usr/bin:/bin`,
      },
    });
    assert.notEqual(result.status, 0);
    assert.match(
      result.stderr,
      /stack database is restricted to DB_NAME=detran_local_stack/,
    );
    assert.equal(result.stdout, '');
    assert.equal(
      readFileSync(stubs.callsPath, 'utf8'),
      '',
      'the rejection must not resolve docker or psql outside the test stubs',
    );
  } finally {
    rmSync(stubs.bin, { recursive: true, force: true });
  }
});

test('C-02-05 A6 dado o banco descartável quando a fixture Portal e invocada então envia SQL ao container e ID concretos', () => {
  const stubs = createPortalCommandStubs();
  try {
    const result = spawnSync('/bin/bash', [portalFixturePath], {
      cwd: root,
      encoding: 'utf8',
      env: {
        DB_NAME: 'detran_local_stack',
        DETRAN_TEST_PORTAL_CALLS: stubs.callsPath,
        DETRAN_TEST_PORTAL_SQL: stubs.sqlPath,
        PATH: `${stubs.bin}:/usr/bin:/bin`,
      },
    });
    assert.equal(result.status, 0, result.stderr);
    assert.match(
      readFileSync(stubs.callsPath, 'utf8'),
      /docker\texec -i detran-local-stack-postgres psql .* -d detran_local_stack/m,
    );
    assert.doesNotMatch(readFileSync(stubs.callsPath, 'utf8'), /^psql\t/m);
    const sql = readFileSync(stubs.sqlPath, 'utf8');
    assert.match(sql, /insert into auth\.users/i);
    assert.match(sql, /00000000-0000-4000-8000-000000000002/);
    assert.match(sql, /local-stack-default-actor@detran-am\.invalid/);
    assert.match(sql, /on conflict \(id\) do update set is_active = true/i);
    assert.match(sql, /insert into auth\.memberships/i);
    assert.match(sql, /00000000-0000-7000-8000-0000d2050001/);
    assert.match(
      sql,
      /on conflict \(tenant_id, user_id\) do update set is_active = true/i,
    );
    assert.doesNotMatch(sql, /insert into auth\.(?:roles|groups)\b/i);
    assert.match(sql, /insert into portal\.complaint/i);
    assert.match(sql, /00000000-0000-7000-8000-0000c2050001/);
    assert.match(sql, /00000000-0000-7000-8000-00000000a001/);
  } finally {
    rmSync(stubs.bin, { recursive: true, force: true });
  }
});

test('C-02-02 dado o mock SEFAZ quando a interface é inspecionada então exporta factory e CLI fixa loopback:3999', async () => {
  assert.ok(existsSync(mockPath), 'TASK-0007 must provide the SEFAZ mock');
  const source = readFileSync(mockPath, 'utf8');
  assert.match(
    source,
    /export\s+(?:async\s+)?function\s+createSefazMockServer/,
  );
  assert.match(source, /127\.0\.0\.1/);
  assert.match(source, /3999/);
  for (const route of [
    '/mock/sefaz/payments/lookup',
    '/mock/sefaz/guides',
    '/mock/sefaz/payments/',
    '/mock/sefaz/rectifications',
    '/mock/sefaz/refunds',
    '/mock/sefaz/refunds/',
  ]) {
    assert.match(source, new RegExp(route.replaceAll('/', '\\/')));
  }
  for (const category of ['BUSINESS_ERROR', 'NOT_FOUND']) {
    assert.match(source, new RegExp(category));
  }

  const result = spawnSync(
    process.execPath,
    ['--input-type=module', '-e', `import(${JSON.stringify(mockPath)})`],
    { cwd: root, encoding: 'utf8' },
  );
  assert.equal(result.status, 0, result.stderr);
});

test('C-02-02 dado o adapter SEFAZ quando o mock recebe as seis operações então o sensor usa tsx e o adapter real', () => {
  assert.ok(
    existsSync(mockPath),
    'SEFAZ mock is required before adapter parity',
  );
  const script = `
    import { createSefazMockServer } from ${JSON.stringify(mockPath)};
    import { SefazAdapterError, SefazHttpAdapter } from './packages/sefaz-adapter/src/index.ts';
    // Interface fixada para TASK-0007: createSefazMockServer({ host, port })
    // resolve { address(): { address, family, port }, close(): Promise<void> }.
    // port=0 é obrigatório para o sensor; a CLI continua reservada a 3999.
    const mock = await createSefazMockServer({ host: '127.0.0.1', port: 0 });
    const address = mock.address();
    if (!address || typeof address !== 'object') throw new Error('address() must return an object');
    if (address.address !== '127.0.0.1' || address.family !== 'IPv4') {
      throw new Error('mock must listen on IPv4 loopback');
    }
    if (!Number.isInteger(address.port) || address.port <= 0) throw new Error('port=0 was not resolved');
    const adapter = new SefazHttpAdapter({
      baseUrl: 'http://localhost:' + address.port,
      pathPrefix: '/mock',
      retryDelayMs: 0,
    });
    const debt = await adapter.lookupDebt({ requestId: 'test-request-001' });
    const guide = await adapter.issueGuide({ debtId: 'test-debt-001', requestId: 'test-guide-request-001' });
    const payment = await adapter.getPaymentStatus('TEST-REF-001');
    const rectification = await adapter.submitRectification({
      referenceNumber: 'TEST-REF-001',
      reason: 'fixture',
      originalPayment: { amount: 123.45, paidAt: '2026-09-01T00:00:00Z' },
      requestId: 'test-rectification-request-001',
    });
    const refund = await adapter.submitRefundRequest({
      referenceNumber: 'TEST-REF-001',
      requestId: 'test-refund-request-001',
    });
    const refundStatus = await adapter.getRefundStatus('test-refund-001');
    const isString = (value) => typeof value === 'string' && value.length > 0;
    if (!Array.isArray(debt.debts) || typeof debt.inActiveDebt !== 'boolean' || !isString(debt.requestId)) throw new Error('DebtLookupOutput required fields');
    if (!isString(debt.debts[0]?.debtId) || typeof debt.debts[0]?.amount !== 'number' || !isString(debt.debts[0]?.status)) throw new Error('DebtItem required fields');
    if (!isString(guide.guideId) || !isString(guide.referenceNumber) || typeof guide.amount !== 'number' || !isString(guide.expiresAt) || !isString(guide.status) || guide.requestId !== 'test-guide-request-001') throw new Error('IssueGuideOutput required fields/echo');
    if (!isString(payment.referenceNumber) || !isString(payment.status) || !isString(payment.requestId)) throw new Error('PaymentStatusOutput required fields');
    if (!isString(rectification.rectificationId) || !isString(rectification.status) || rectification.requestId !== 'test-rectification-request-001') throw new Error('RectificationOutput required fields/echo');
    if (!isString(refund.refundId) || !isString(refund.status) || refund.requestId !== 'test-refund-request-001') throw new Error('RefundOutput required fields/echo');
    if (!isString(refundStatus.refundId) || !isString(refundStatus.status) || !isString(refundStatus.requestId)) throw new Error('RefundStatusOutput required fields');
    if (debt.requestId !== 'test-request-001') throw new Error('lookup requestId echo was not preserved');
    const generatedGetAgain = await adapter.getPaymentStatus('TEST-REF-001');
    const generatedRefund = await adapter.submitRefundRequest({ referenceNumber: 'TEST-REF-001' });
    const generatedRefundAgain = await adapter.submitRefundRequest({ referenceNumber: 'TEST-REF-001' });
    for (const generated of [payment, refundStatus, generatedGetAgain, generatedRefund, generatedRefundAgain]) {
      if (!/^test-[a-z0-9-]+$/u.test(generated.requestId) || /secret|token|password|bearer/i.test(generated.requestId)) throw new Error('generated requestId is not deterministic test data');
    }
    if (payment.requestId !== generatedGetAgain.requestId || generatedRefund.requestId !== generatedRefundAgain.requestId) throw new Error('generated requestId is not deterministic for identical calls');
    try {
      await adapter.getPaymentStatus('unknown-reference');
      throw new Error('unknown reference must fail');
    } catch (error) {
      if (!(error instanceof SefazAdapterError) || error.name !== 'SefazAdapterError' || error.category !== 'NOT_FOUND' || error.retryable !== false || error.providerStatus !== 404) throw error;
    }
    try {
      await adapter.lookupDebt({});
      throw new Error('invalid body must fail through SefazHttpAdapter');
    } catch (error) {
      if (!(error instanceof SefazAdapterError) || error.name !== 'SefazAdapterError' || error.category !== 'BUSINESS_ERROR' || error.retryable !== false || error.providerStatus !== 400) throw error;
    }
    const assertEnvelope = async (response, expectedStatus, expectedCategory) => {
      if (response.status !== expectedStatus) throw new Error('expected status ' + expectedStatus);
      const payload = await response.json();
      const error = payload.error;
      if (!/^test-[a-z0-9-]+$/u.test(payload.requestId ?? '') || !error || error.category !== expectedCategory || typeof error.code !== 'string' || error.code.length === 0 || typeof error.message !== 'string' || error.message.length === 0 || error.retryable !== false || error.providerStatus !== expectedStatus) throw new Error('invalid error envelope for ' + expectedStatus);
    };
    const invalid = await fetch('http://localhost:' + address.port + '/mock/sefaz/payments/lookup', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{}',
    });
    await assertEnvelope(invalid, 400, 'BUSINESS_ERROR');
    const missing = await fetch('http://localhost:' + address.port + '/mock/sefaz/payments/unknown-reference');
    await assertEnvelope(missing, 404, 'NOT_FOUND');
    const wrongVerb = await fetch('http://localhost:' + address.port + '/mock/sefaz/guides', {
      method: 'GET',
    });
    if (wrongVerb.headers.get('allow') !== 'POST') throw new Error('405/Allow required');
    await assertEnvelope(wrongVerb, 405, 'BUSINESS_ERROR');
    await mock.close();
  `;
  const result = spawnSync(
    process.execPath,
    ['--import', 'tsx', '--input-type=module', '-e', script],
    { cwd: root, encoding: 'utf8' },
  );
  assert.equal(result.status, 0, result.stderr || result.stdout);
});

const smokeFixture = {
  frontends: ['portal', 'rait', 'dashboard', 'teat'].map((name, index) => ({
    name,
    rootUrl: `http://127.0.0.1:${4200 + index}`,
    proxyUrl: `http://127.0.0.1:${4200 + index}`,
    readPath: `/v1/${name}/fixture-read`,
    expectedTenant: '00000000-0000-7000-8000-00000000a001',
    persona: `${name}-fixture-persona`,
    fixture: `${name}-fixture-001`,
  })),
  backend: { url: 'http://127.0.0.1:3001', health: ['/healthz', '/readyz'] },
  senatran: { url: 'http://127.0.0.1:3000', health: ['/health'] },
  sefaz: { url: 'http://127.0.0.1:3999', health: ['/health'] },
  pec: { url: 'http://127.0.0.1:4204', state: 'not_built_r0031' },
  ch: [
    {
      name: 'pades',
      path: '/v1/ch/reports',
      message:
        'Clinical PAdES signing service is not configured; trust readiness is unavailable',
    },
    {
      name: 'biometrics',
      path: '/v1/ch/biometrics/checks',
      message:
        'Biometric verification provider and processor contract are not configured',
    },
    {
      name: 'council',
      path: '/v1/ch/clinical-network/professionals',
      message: 'Professional council verification service is not configured',
    },
  ],
};

function runSmokeChild(source, env = {}) {
  return spawnSync(process.execPath, ['--input-type=module', '-e', source], {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, ...env },
  });
}

function smokeScenarioSource(injection, assertion) {
  return `
    import { runSmoke } from ${JSON.stringify(smokePath)};
    const targets = ${JSON.stringify(smokeFixture)};
    const response = (body, status = 200, headers = { 'content-type': 'application/json' }) => new Response(typeof body === 'string' ? body : JSON.stringify(body), { status, headers });
    const healthyResponse = (value) => {
      const ch = targets.ch.find(({ path }) => value.endsWith(path));
      if (ch) return response({ statusCode: 503, message: ch.message, error: 'Service Unavailable' }, 503);
      if (value.includes('/v1/')) return response({ tenantId: targets.frontends[0].expectedTenant, items: [{ id: 'fixture-001' }], layer: 'N1' });
      return response({ status: 'ok', message: 'healthy' });
    };
    const fetchImpl = async (url, init = {}) => {
      const value = String(url);
      ${injection}
      return healthyResponse(value, init);
    };
    const report = await runSmoke({ targets, fetchImpl });
    ${assertion}
  `;
}

test('C-02-05/06 dado targets estruturados quando smoke é executado então percorre root, proxy, health, PEC e CH off sem vazar segredo', () => {
  assert.ok(existsSync(smokePath), 'TASK-0007 must provide smoke.mjs');
  assert.match(
    readFileSync(smokePath, 'utf8'),
    /export\s+(?:async\s+)?function\s+runSmoke/,
  );
  const stateDir = mkdtempSync(join(tmpdir(), 'detran-smoke-contract-'));
  try {
    const source = `
      import { readFileSync, readdirSync } from 'node:fs';
      import { runSmoke } from ${JSON.stringify(smokePath)};
      const targets = ${JSON.stringify(smokeFixture)};
      const calls = [];
      const response = (body, status = 200, headers = { 'content-type': 'application/json' }) => new Response(typeof body === 'string' ? body : JSON.stringify(body), { status, headers });
      const fetchImpl = async (url, init = {}) => {
        const value = String(url);
        calls.push({ url: value, method: init.method ?? 'GET', headers: Object.fromEntries(new Headers(init.headers).entries()) });
        const ch = targets.ch.find(({ path }) => value.endsWith(path));
        if (ch) return response({ statusCode: 503, message: ch.message, error: 'Service Unavailable' }, 503);
        if (value.includes('/v1/')) return response({ tenantId: targets.frontends[0].expectedTenant, items: [{ id: 'fixture-001' }], layer: 'N1' });
        return response({ status: 'ok', message: 'healthy' });
      };
      const report = await runSmoke({ targets, fetchImpl });
      if (report.complete !== true || !Array.isArray(report.rows)) throw new Error('complete smoke report with rows required');
      for (const frontend of targets.frontends) {
        if (!calls.some(({ url }) => url === frontend.rootUrl + '/')) throw new Error(frontend.name + ' root not checked');
        const proxyUrl = frontend.proxyUrl + frontend.readPath;
        const proxyCall = calls.find(({ url }) => url === proxyUrl);
        if (!proxyCall || proxyCall.headers.authorization !== 'Bearer local') throw new Error(frontend.name + ' proxy bearer required');
        if (!report.rows.some((row) => row.target === 'frontend.' + frontend.name + '.root' && row.result === 'passed')) throw new Error(frontend.name + ' root row missing');
        if (!report.rows.some((row) => row.target === 'frontend.' + frontend.name + '.proxy' && row.result === 'passed')) throw new Error(frontend.name + ' proxy row missing');
      }
      const v1Calls = calls.filter(({ url }) => new URL(url).pathname.startsWith('/v1/'));
      if (v1Calls.some(({ url }) => new URL(url).port === '3001')) throw new Error('a /v1 read bypassed the frontend proxy');
      if (calls.some(({ url }) => new URL(url).port === '4204')) throw new Error('PEC must not be called while not_built_r0031');
      for (const path of targets.backend.health) {
        const target = 'backend.' + path.slice(1);
        if (!calls.some(({ url }) => url === targets.backend.url + path)) throw new Error(path + ' not checked');
        if (!report.rows.some((row) => row.target === target && row.result === 'passed')) throw new Error(target + ' row missing');
      }
      for (const service of [targets.senatran, targets.sefaz]) {
        if (!calls.some(({ url }) => url === service.url + '/health')) throw new Error(service.url + ' health not checked');
      }
      if (report.pec?.state !== 'not_built_r0031') throw new Error('PEC state must be recorded');
      for (const ch of targets.ch) {
        if (!report.rows.some((row) => row.target === 'ch.' + ch.name && row.status === 503 && row.result === 'passed' && row.adapterMessage === ch.message)) throw new Error(ch.name + ' adapter 503/message row missing');
        const call = calls.find(({ url }) => url.endsWith(ch.path));
        if (call?.method !== 'POST' || !/^[0-9a-f-]{36}$/u.test(call.headers['idempotency-key'] ?? '')) throw new Error(ch.name + ' POST/idempotency key missing');
      }
      const files = readdirSync(${JSON.stringify(stateDir)});
      if (!files.some((file) => file.endsWith('.json')) || !files.some((file) => !file.endsWith('.json'))) throw new Error('smoke table and JSON evidence are required');
      for (const file of files) {
        const text = readFileSync(${JSON.stringify(stateDir)} + '/' + file, 'utf8');
        if (new RegExp('token|bearer|password|secret|://[^/:@ ]+:[^@ ]+@', 'i').test(text)) throw new Error('secret in smoke evidence');
      }
    `;
    const result = runSmokeChild(source, { DETRAN_STACK_STATE_DIR: stateDir });
    assert.equal(result.status, 0, result.stderr || result.stdout);
  } finally {
    rmSync(stateDir, { recursive: true, force: true });
  }
});

test('C-02-05 A6 dado ID Portal ausente quando o proxy responde entao smoke falha', () => {
  const stateDir = mkdtempSync(join(tmpdir(), 'detran-smoke-portal-id-'));
  try {
    const source = smokeScenarioSource(
      `targets.frontends[0].expectedId = '00000000-0000-7000-8000-0000c2050001';
       if (value === targets.frontends[0].proxyUrl + targets.frontends[0].readPath) {
         if (new Headers(init.headers).get('x-tenant-id') !== targets.frontends[0].expectedTenant) throw new Error('tenant header missing');
         return response([{ id: 'wrong-id' }]);
       }`,
      `if (report.complete !== false || !report.rows.some((row) => row.target === 'frontend.portal.proxy' && row.reason === 'fixture_id_missing')) throw new Error('Portal fixture ID must be required');`,
    );
    const result = runSmokeChild(source, { DETRAN_STACK_STATE_DIR: stateDir });
    assert.equal(result.status, 0, result.stderr || result.stdout);
  } finally {
    rmSync(stateDir, { recursive: true, force: true });
  }
});

test('C-02-05/06 dado falhas de backend ou leitura proxy quando smoke é executado então registra target, resultado e motivo específicos', () => {
  assert.ok(existsSync(smokePath), 'TASK-0007 must provide smoke.mjs');
  const scenarios = [
    {
      name: 'backend parado',
      injection:
        "if (value === targets.backend.url + '/healthz') throw new TypeError('fetch failed');",
      target: 'backend.healthz',
      reason: 'backend_unreachable',
    },
    {
      name: 'HTML no proxy',
      injection:
        "if (value === targets.frontends[0].proxyUrl + targets.frontends[0].readPath) return response('<html>login</html>', 200, { 'content-type': 'text/html' });",
      target: 'frontend.portal.proxy',
      reason: 'invalid_json',
    },
    {
      name: 'JSON vazio no proxy',
      injection:
        'if (value === targets.frontends[0].proxyUrl + targets.frontends[0].readPath) return response({}, 200);',
      target: 'frontend.portal.proxy',
      reason: 'empty_json',
    },
    {
      name: 'tenant errado no proxy',
      injection:
        "if (value === targets.frontends[0].proxyUrl + targets.frontends[0].readPath) return response({ tenantId: 'wrong-tenant', items: [{ id: 'x' }] }, 200);",
      target: 'frontend.portal.proxy',
      reason: 'tenant_mismatch',
    },
    {
      name: '401 no proxy',
      injection:
        "if (value === targets.frontends[0].proxyUrl + targets.frontends[0].readPath) return response({ error: 'unauthorized' }, 401);",
      target: 'frontend.portal.proxy',
      reason: 'unauthorized',
    },
    {
      name: '403 no proxy',
      injection:
        "if (value === targets.frontends[0].proxyUrl + targets.frontends[0].readPath) return response({ error: 'forbidden' }, 403);",
      target: 'frontend.portal.proxy',
      reason: 'forbidden',
    },
  ];
  for (const scenario of scenarios) {
    const stateDir = mkdtempSync(join(tmpdir(), 'detran-smoke-negative-'));
    try {
      const assertion = `
        if (report.complete !== false || !Array.isArray(report.rows)) throw new Error('incomplete row report required');
        if (!report.rows.some((row) => row.target === ${JSON.stringify(scenario.target)} && row.result === 'failed' && row.reason === ${JSON.stringify(scenario.reason)})) throw new Error('missing ${scenario.target}/${scenario.reason} row');
      `;
      const result = runSmokeChild(
        smokeScenarioSource(scenario.injection, assertion),
        { DETRAN_STACK_STATE_DIR: stateDir },
      );
      assert.equal(
        result.status,
        0,
        `${scenario.name}: ${result.stderr || result.stdout}`,
      );
    } finally {
      rmSync(stateDir, { recursive: true, force: true });
    }
  }
});

test('C-02-04 dado 403 ou 503 CH fora do adapter quando smoke é executado então bloqueia a linha do adapter', () => {
  assert.ok(existsSync(smokePath), 'TASK-0007 must provide smoke.mjs');
  const scenarios = [
    {
      name: '403 de guard',
      injection:
        "if (value.endsWith('/v1/ch/reports')) return response({ statusCode: 403, message: 'guard rejected before adapter', error: 'Forbidden' }, 403);",
      reason: 'unexpected_status_403',
    },
    {
      name: '503 com mensagem errada',
      injection:
        "if (value.endsWith('/v1/ch/reports')) return response({ statusCode: 503, message: 'wrong adapter message', error: 'Service Unavailable' }, 503);",
      reason: 'adapter_message_mismatch',
    },
  ];
  for (const scenario of scenarios) {
    const stateDir = mkdtempSync(join(tmpdir(), 'detran-smoke-ch-'));
    try {
      const assertion = `
        if (report.complete !== false || !Array.isArray(report.rows)) throw new Error('blocked report with rows required');
        if (!report.rows.some((row) => row.target === 'ch.pades' && row.result === 'blocked_before_adapter' && row.reason === ${JSON.stringify(scenario.reason)})) throw new Error('missing blocked ch.pades/${scenario.reason} row');
      `;
      const result = runSmokeChild(
        smokeScenarioSource(scenario.injection, assertion),
        { DETRAN_STACK_STATE_DIR: stateDir },
      );
      assert.equal(
        result.status,
        0,
        `${scenario.name}: ${result.stderr || result.stdout}`,
      );
    } finally {
      rmSync(stateDir, { recursive: true, force: true });
    }
  }
});

test('C-02-05 dado item de array com tenant divergente quando o proxy responde então smoke registra tenant_mismatch', () => {
  for (const tenantField of ['tenantId', 'tenant_id']) {
    const stateDir = mkdtempSync(join(tmpdir(), 'detran-smoke-tenant-array-'));
    try {
      const source = smokeScenarioSource(
        `if (value === targets.frontends[0].proxyUrl + targets.frontends[0].readPath) {
           return response([{ id: 'fixture-001', ${tenantField}: 'wrong-tenant' }]);
         }`,
        `if (report.complete !== false || !report.rows.some((row) => row.target === 'frontend.portal.proxy' && row.result === 'failed' && row.reason === 'tenant_mismatch')) throw new Error('array ${tenantField} mismatch must fail');`,
      );
      const result = runSmokeChild(source, {
        DETRAN_STACK_STATE_DIR: stateDir,
      });
      assert.equal(
        result.status,
        0,
        `${tenantField}: ${result.stderr || result.stdout}`,
      );
    } finally {
      rmSync(stateDir, { recursive: true, force: true });
    }
  }
});

test('C-02-05/06 dado as fases CLI quando smoke reinicia o backend então prepara Portal após preflight, restaura os cinco papéis e não herda overrides locais', () => {
  const stateDir = mkdtempSync(join(tmpdir(), 'detran-smoke-cli-state-'));
  const bin = mkdtempSync(join(tmpdir(), 'detran-smoke-cli-stubs-'));
  const callsPath = join(stateDir, 'backend-restarts.log');
  const sequencePath = join(stateDir, 'sequence.log');
  const preloadPath = join(stateDir, 'fetch-preload.mjs');
  writeFileSync(callsPath, '');
  writeFileSync(sequencePath, '');
  writeFileSync(
    join(bin, 'bash'),
    `#!/bin/sh
set -eu
printf 'bash:%s\\n' "${'${2:-}'}" >> "$DETRAN_TEST_SEQUENCE"
if [ "${'${2:-}'}" = backend-restart ]; then
  if [ "${'${DETRAN_LOCAL_ACTOR_ID+x}'}" = x ]; then
    actor_state=present
    actor_value=${'${DETRAN_LOCAL_ACTOR_ID}'}
  else
    actor_state=absent
    actor_value=''
  fi
  local_values=$(env | LC_ALL=C sort | sed -n 's/^\\(DETRAN_LOCAL_[^=]*\\)=\\(.*\\)$/\\1=\\2/p' | paste -sd, -)
  printf '%s\\t%s\\t%s\\t%s\\n' "${'${DETRAN_LOCAL_ROLES:-}'}" "$local_values" "$actor_state" "$actor_value" >> "$DETRAN_TEST_RESTARTS"
fi
case "${'${2:-}'}" in
  fixture-portal|fixture-ch)
    if [ "${'${DB_NAME:-detran_local_stack}'}" != detran_local_stack ]; then
      printf '%s\\n' 'detran-stack: stack database is restricted to DB_NAME=detran_local_stack' >&2
      exit 1
    fi
    ;;
esac
exit 0
`,
    { mode: 0o755 },
  );
  writeFileSync(
    preloadPath,
    `import { appendFileSync } from 'node:fs';
const response = (body, status = 200, headers = { 'content-type': 'application/json' }) => new Response(typeof body === 'string' ? body : JSON.stringify(body), { status, headers });
const messages = {
  '/v1/ch/reports': 'Clinical PAdES signing service is not configured; trust readiness is unavailable',
  '/v1/ch/biometrics/checks': 'Biometric verification provider and processor contract are not configured',
  '/v1/ch/clinical-network/professionals': 'Professional council verification service is not configured',
};
globalThis.fetch = async (input) => {
  const url = String(input);
  if (url.endsWith('/healthz')) appendFileSync(process.env.DETRAN_TEST_SEQUENCE, 'fetch:/healthz\\n');
  for (const [path, message] of Object.entries(messages)) {
    if (url.endsWith(path)) return response({ statusCode: 503, message }, 503);
  }
  if (url.endsWith('/')) return response('', 200, { 'content-type': 'text/html' });
  if (url.includes('/portal/complaints/records')) return response([{ id: '00000000-0000-7000-8000-0000c2050001', tenantId: '00000000-0000-7000-8000-00000000a001' }]);
  if (url.includes('/inf/rait/cases')) return response([{ number: 'RAIT-FRESH-2026-000001', tenantId: '00000000-0000-7000-8000-00000000a001' }]);
  if (url.includes('/dashboard/alerts')) return response([{ id: '00000000-0000-7000-8000-000081000102', tenantId: '00000000-0000-7000-8000-00000000a001', object: { layer: 'N1', ref: null } }]);
  if (url.includes('/ops/field/operations')) return response([{ id: '00000000-0000-7000-8000-0000e2600001', tenantId: '00000000-0000-7000-8000-00000000a001' }]);
  return response({ status: 'ok' });
};
`,
  );
  try {
    for (const inheritedActor of ['poison', '']) {
      writeFileSync(callsPath, '');
      writeFileSync(sequencePath, '');
      const result = spawnSync(
        process.execPath,
        ['--import', preloadPath, smokePath],
        {
          cwd: root,
          encoding: 'utf8',
          env: {
            DETRAN_STACK_STATE_DIR: stateDir,
            DETRAN_TEST_RESTARTS: callsPath,
            DETRAN_TEST_SEQUENCE: sequencePath,
            DETRAN_LOCAL_ACTOR_ID: inheritedActor,
            DETRAN_LOCAL_TENANT_ID: 'poison-tenant',
            DETRAN_LOCAL_CPF: 'poison-cpf',
            DETRAN_LOCAL_ASSURANCE_LEVEL: 'poison-assurance',
            PATH: `${bin}:/usr/bin:/bin`,
          },
        },
      );
      assert.equal(result.status, 0, result.stderr || result.stdout);
      const sequence = readFileSync(sequencePath, 'utf8')
        .split('\n')
        .filter(Boolean);
      assert.equal(sequence[0], 'fetch:/healthz');
      assert.ok(sequence.indexOf('bash:fixture-portal') > 0);
      assert.ok(
        sequence.indexOf('bash:fixture-portal') <
          sequence.indexOf('bash:backend-restart'),
        'Portal fixture must precede the first frontend persona restart',
      );
      assert.deepEqual(
        sequence.filter((entry) => entry.startsWith('bash:')),
        [
          'bash:fixture-portal',
          'bash:fixture-portal',
          'bash:backend-restart',
          'bash:backend-restart',
          'bash:backend-restart',
          'bash:backend-restart',
          'bash:fixture-ch',
          'bash:fixture-ch',
          'bash:backend-restart',
          'bash:backend-restart',
          'bash:backend-restart',
          'bash:backend-restart',
        ],
        'every CLI subcommand remains ordered in the shared preflight log',
      );
      const restarts = readFileSync(callsPath, 'utf8')
        .split('\n')
        .filter(Boolean)
        .map((line) => {
          const [roles, localValues, actorState, actorValue] = line.split('\t');
          return { roles, localValues, actorState, actorValue };
        });
      assert.deepEqual(
        restarts.map(({ roles }) => roles),
        [
          'AUDITOR',
          'rait-coordinator',
          'dash-operator',
          'field-agent',
          'MEDICO',
          'RECEPCAO',
          'ADMIN_CLINICA',
          'technical-admin,agency-admin,field-agent,rait-coordinator,dash-operator',
        ],
      );
      for (const restart of restarts.filter(
        ({ roles }) => roles !== 'MEDICO',
      )) {
        assert.equal(
          restart.actorState,
          'absent',
          `${restart.roles} must not send DETRAN_LOCAL_ACTOR_ID (including empty)`,
        );
        assert.equal(restart.actorValue, '');
        assert.equal(
          restart.localValues,
          `DETRAN_LOCAL_ROLES=${restart.roles}`,
          `${restart.roles} must receive only its explicit roles override`,
        );
      }
      assert.deepEqual(restarts[4], {
        roles: 'MEDICO',
        localValues:
          'DETRAN_LOCAL_ACTOR_ID=00000000-0000-4000-8000-0000b0000002,DETRAN_LOCAL_ROLES=MEDICO',
        actorState: 'present',
        actorValue: '00000000-0000-4000-8000-0000b0000002',
      });
    }
  } finally {
    rmSync(stateDir, { recursive: true, force: true });
    rmSync(bin, { recursive: true, force: true });
  }
});

test('C-02-02 dado o comando literal do adapter SEFAZ quando executado então confirma operações e erros observáveis', () => {
  const result = spawnSync('node', ['tools/stack/sefaz-adapter-smoke.mjs'], {
    cwd: root,
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  for (const marker of [
    'lookupDebt',
    'issueGuide',
    'getPaymentStatus',
    'submitRectification',
    'submitRefundRequest',
    'getRefundStatus',
    'NOT_FOUND',
    'invalid_body',
    'method_405',
  ]) {
    assert.match(result.stdout, new RegExp(`\\b${marker}\\b`));
  }
  assert.match(result.stdout, /SEFAZ adapter smoke passed/);
});

test('C-02-05/06 dado o preflight falho quando a CLI smoke é iniciada então não chama bash e preserva seu relatório separado', () => {
  const stateDir = mkdtempSync(join(tmpdir(), 'detran-smoke-preflight-'));
  const bin = mkdtempSync(join(tmpdir(), 'detran-smoke-preflight-stubs-'));
  const callsPath = join(stateDir, 'bash.log');
  const preloadPath = join(stateDir, 'fetch-preload.mjs');
  writeFileSync(callsPath, '');
  writeFileSync(
    join(bin, 'bash'),
    `#!/bin/sh
printf 'bash:%s\\n' "${'${2:-}'}" >> "$DETRAN_TEST_BASH_CALLS"
exit 97
`,
    { mode: 0o755 },
  );
  writeFileSync(
    preloadPath,
    `globalThis.fetch = async () => { throw new TypeError('offline preflight'); };\n`,
  );
  try {
    const result = spawnSync(
      process.execPath,
      ['--import', preloadPath, smokePath],
      {
        cwd: root,
        encoding: 'utf8',
        env: {
          DETRAN_STACK_STATE_DIR: stateDir,
          DETRAN_TEST_BASH_CALLS: callsPath,
          PATH: `${bin}:/usr/bin:/bin`,
        },
      },
    );
    assert.notEqual(result.status, 0);
    assert.equal(readFileSync(callsPath, 'utf8'), '');
    assert.ok(existsSync(join(stateDir, 'smoke-report-preflight.json')));
    assert.ok(existsSync(join(stateDir, 'smoke-report-preflight.txt')));
  } finally {
    rmSync(stateDir, { recursive: true, force: true });
    rmSync(bin, { recursive: true, force: true });
  }
});

test('C-02-05 dado PEC construído e entrypoint em caminho com espaços e symlink quando a CLI smoke roda então mede a porta 4204', () => {
  const tree = mkdtempSync(join(tmpdir(), 'detran smoke entrypoint '));
  const bin = mkdtempSync(join(tmpdir(), 'detran-smoke-entrypoint-stubs-'));
  const callsPath = join(tree, 'fetches.log');
  const preloadPath = join(tree, 'fetch-preload.mjs');
  const copiedSmoke = join(tree, 'tools/stack/smoke.mjs');
  const linkedSmoke = join(tree, 'smoke link.mjs');
  try {
    mkdirSync(join(tree, 'tools/stack'), { recursive: true });
    mkdirSync(join(tree, 'apps/pec/web'), { recursive: true });
    cpSync(smokePath, copiedSmoke);
    writeFileSync(join(tree, 'apps/pec/web/angular.json'), '{}\\n');
    symlinkSync(copiedSmoke, linkedSmoke);
    writeFileSync(
      join(bin, 'bash'),
      `#!/bin/sh
if [ "${'${2:-}'}" = fixture-portal ] || [ "${'${2:-}'}" = fixture-ch ]; then
  if [ "${'${DB_NAME:-detran_local_stack}'}" != detran_local_stack ]; then
    printf '%s\\n' 'detran-stack: stack database is restricted to DB_NAME=detran_local_stack' >&2
    exit 1
  fi
fi
exit 0
`,
      { mode: 0o755 },
    );
    writeFileSync(
      preloadPath,
      `import { appendFileSync } from 'node:fs';\nconst response = (body, status = 200, headers = { 'content-type': 'application/json' }) => new Response(typeof body === 'string' ? body : JSON.stringify(body), { status, headers });\nglobalThis.fetch = async (input) => { const url = String(input); appendFileSync(process.env.DETRAN_TEST_FETCHES, url + '\\n'); if (url.endsWith('/')) return response('', 200, { 'content-type': 'text/html' }); if (url.endsWith('/v1/ch/reports')) return response({ statusCode: 503, message: 'Clinical PAdES signing service is not configured; trust readiness is unavailable' }, 503); if (url.endsWith('/v1/ch/biometrics/checks')) return response({ statusCode: 503, message: 'Biometric verification provider and processor contract are not configured' }, 503); if (url.endsWith('/v1/ch/clinical-network/professionals')) return response({ statusCode: 503, message: 'Professional council verification service is not configured' }, 503); if (url.includes('/portal/complaints/records')) return response([{ id: '00000000-0000-7000-8000-0000c2050001', tenantId: '00000000-0000-7000-8000-00000000a001' }]); if (url.includes('/inf/rait/cases')) return response([{ number: 'RAIT-FRESH-2026-000001', tenantId: '00000000-0000-7000-8000-00000000a001' }]); if (url.includes('/dashboard/alerts')) return response([{ id: '00000000-0000-7000-8000-000081000102', tenantId: '00000000-0000-7000-8000-00000000a001', object: { layer: 'N1', ref: null } }]); if (url.includes('/ops/field/operations')) return response([{ id: '00000000-0000-7000-8000-0000e2600001', tenantId: '00000000-0000-7000-8000-00000000a001' }]); return response({ status: 'ok' }); };\n`,
    );
    const result = spawnSync(
      process.execPath,
      ['--import', preloadPath, linkedSmoke],
      {
        cwd: tree,
        encoding: 'utf8',
        env: {
          DETRAN_STACK_STATE_DIR: join(tree, 'state'),
          DETRAN_TEST_FETCHES: callsPath,
          PATH: `${bin}:/usr/bin:/bin`,
        },
      },
    );
    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.match(
      readFileSync(callsPath, 'utf8'),
      /^http:\/\/127\.0\.0\.1:4204$/m,
    );
  } finally {
    rmSync(tree, { recursive: true, force: true });
    rmSync(bin, { recursive: true, force: true });
  }
});
