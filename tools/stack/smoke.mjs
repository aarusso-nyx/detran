import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { existsSync, realpathSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const evidenceDir =
  process.env.DETRAN_STACK_STATE_DIR ??
  join(process.env.TMPDIR ?? '/tmp', 'detran-stack');
const tenantId = '00000000-0000-7000-8000-00000000a001';
const fixtureActorId = '00000000-0000-4000-8000-0000b0000002';
const defaultRoles =
  'technical-admin,agency-admin,field-agent,rait-coordinator,dash-operator';
const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '../..');
const pecBuilt = existsSync(join(repoRoot, 'apps/pec/web/angular.json'));
const authHeaders = {
  authorization: 'Bearer local',
  'x-tenant-id': tenantId,
};

function evidenceRow(row) {
  // IDs, roles and routes are evidence, not credentials. Keep them verbatim.
  return row;
}

async function jsonRequest(fetchImpl, url, init = {}, expectJson = true) {
  try {
    const response = await fetchImpl(url, init);
    if (!expectJson) return { response };
    const contentType = response.headers.get('content-type') ?? '';
    let body;
    try {
      body = await response.json();
    } catch {
      return { response, reason: 'invalid_json' };
    }
    return { response, body, contentType };
  } catch {
    return { reason: 'backend_unreachable' };
  }
}

function nonEmpty(value) {
  if (Array.isArray(value)) return value.length > 0;
  return (
    value &&
    typeof value === 'object' &&
    Object.keys(value).length > 0 &&
    (!Array.isArray(value.items) || value.items.length > 0)
  );
}

function itemsOf(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.data)) return value.data;
  return [];
}

function hasTenantMismatch(value, expectedTenant) {
  if (!expectedTenant) return false;
  return [value, ...itemsOf(value)].some((item) => {
    if (!item || typeof item !== 'object') return false;
    const itemTenant = item.tenantId ?? item.tenant_id;
    return itemTenant !== undefined && itemTenant !== expectedTenant;
  });
}

function containsFixtureId(value, expectedId) {
  if (!expectedId) return true;
  return itemsOf(value).some((item) => {
    if (!item || typeof item !== 'object') return false;
    return Object.values(item).some((field) => field === expectedId);
  });
}

function matchesLayer(value, expectedLayer) {
  if (!expectedLayer) return true;
  const items = itemsOf(value);
  return (
    items.length > 0 &&
    items.every(
      (item) =>
        item?.object?.layer === expectedLayer && item.object.ref === null,
    )
  );
}

async function writeReport(report, suffix = '') {
  await mkdir(evidenceDir, { recursive: true });
  const safe = { ...report, rows: report.rows.map(evidenceRow) };
  const stem = suffix ? `smoke-report-${suffix}` : 'smoke-report';
  await writeFile(
    join(evidenceDir, `${stem}.json`),
    `${JSON.stringify(safe, null, 2)}\n`,
  );
  await writeFile(
    join(evidenceDir, `${stem}.txt`),
    safe.rows
      .map(
        (row) => `${row.target}\t${row.result}\t${row.reason}\t${row.status}`,
      )
      .join('\n') + '\n',
  );
}

export async function runSmoke({ targets, fetchImpl = fetch, evidenceSuffix }) {
  const rows = [];
  const add = (row) => rows.push(row);
  const check = async (
    target,
    url,
    expected = 200,
    init,
    expectJson = true,
  ) => {
    const result = await jsonRequest(fetchImpl, url, init, expectJson);
    if (!result.response)
      return add({
        target,
        result: 'failed',
        reason: result.reason,
        status: 0,
        url,
      });
    if (result.response.status !== expected)
      return add({
        target,
        result: 'failed',
        reason:
          result.response.status === 401
            ? 'unauthorized'
            : result.response.status === 403
              ? 'forbidden'
              : `unexpected_status_${result.response.status}`,
        status: result.response.status,
        url,
      });
    if (result.reason)
      return add({
        target,
        result: 'failed',
        reason: result.reason,
        status: result.response.status,
        url,
      });
    return add({
      target,
      result: 'passed',
      reason: 'ok',
      status: result.response.status,
      url,
      body: result.body,
    });
  };

  for (const path of targets.backend.health)
    await check(`backend.${path.slice(1)}`, `${targets.backend.url}${path}`);
  for (const service of [targets.senatran, targets.sefaz])
    for (const path of service.health)
      await check(
        service === targets.sefaz ? 'sefaz.health' : 'senatran.health',
        `${service.url}${path}`,
      );
  for (const frontend of targets.frontends) {
    await check(
      `frontend.${frontend.name}.root`,
      `${frontend.rootUrl}/`,
      200,
      undefined,
      false,
    );
    const result = await jsonRequest(
      fetchImpl,
      `${frontend.proxyUrl}${frontend.readPath}`,
      { headers: authHeaders },
    );
    const row = {
      target: `frontend.${frontend.name}.proxy`,
      persona: frontend.persona,
      fixture: frontend.fixture,
      route: frontend.readPath,
      policy: frontend.policy,
      expectedId: frontend.expectedId,
      url: `${frontend.proxyUrl}${frontend.readPath}`,
    };
    if (!result.response)
      add({
        ...row,
        result: 'failed',
        reason: 'backend_unreachable',
        status: 0,
      });
    else if (result.response.status !== 200)
      add({
        ...row,
        result: 'failed',
        reason:
          result.response.status === 401
            ? 'unauthorized'
            : result.response.status === 403
              ? 'forbidden'
              : `unexpected_status_${result.response.status}`,
        status: result.response.status,
      });
    else if (result.reason)
      add({ ...row, result: 'failed', reason: result.reason, status: 200 });
    else if (!nonEmpty(result.body))
      add({ ...row, result: 'failed', reason: 'empty_json', status: 200 });
    else if (hasTenantMismatch(result.body, frontend.expectedTenant))
      add({ ...row, result: 'failed', reason: 'tenant_mismatch', status: 200 });
    else if (!containsFixtureId(result.body, frontend.expectedId))
      add({
        ...row,
        result: 'failed',
        reason: 'fixture_id_missing',
        status: 200,
      });
    else if (!matchesLayer(result.body, frontend.expectedLayer))
      add({ ...row, result: 'failed', reason: 'layer_mismatch', status: 200 });
    else add({ ...row, result: 'passed', reason: 'ok', status: 200 });
  }
  const pec = { state: targets.pec?.state ?? 'not_built_r0031' };
  if (pec.state === 'active')
    await check(
      'frontend.pec.root',
      targets.pec.rootUrl,
      200,
      undefined,
      false,
    );
  for (const probe of targets.ch ?? []) {
    const result = await jsonRequest(
      fetchImpl,
      `${probe.proxyUrl ?? targets.frontends[0].proxyUrl}${probe.path}`,
      {
        method: 'POST',
        headers: {
          ...authHeaders,
          'content-type': 'application/json',
          'idempotency-key': randomUUID(),
        },
        body: JSON.stringify(probe.body ?? {}),
      },
    );
    const row = {
      target: `ch.${probe.name}`,
      persona: probe.persona,
      fixture: probe.fixture,
      route: probe.path,
      policy: probe.policy,
      precondition: 'not_observed',
      url: `${probe.proxyUrl ?? targets.frontends[0].proxyUrl}${probe.path}`,
    };
    if (!result.response)
      add({
        ...row,
        result: 'blocked_before_adapter',
        reason: 'backend_unreachable',
        status: 0,
      });
    else if (result.response.status !== 503)
      add({
        ...row,
        result: 'blocked_before_adapter',
        reason: `unexpected_status_${result.response.status}`,
        status: result.response.status,
      });
    else if (result.reason)
      add({
        ...row,
        result: 'blocked_before_adapter',
        reason: result.reason,
        status: 503,
      });
    else if (probe.message && result.body?.message !== probe.message)
      add({
        ...row,
        result: 'blocked_before_adapter',
        reason: 'adapter_message_mismatch',
        status: 503,
        adapterMessage: result.body?.message,
      });
    else
      add({
        ...row,
        result: 'passed',
        reason: 'adapter_unconfigured',
        status: 503,
        adapterMessage: result.body?.message,
        precondition: `inferred_from_adapter_message: ${result.body?.message}`,
      });
  }
  const complete = rows.every((row) => row.result === 'passed');
  const report = {
    complete,
    pec,
    rows: rows.map(({ body: _body, ...row }) => row),
  };
  await writeReport(report, evidenceSuffix);
  return report;
}

const defaultTargets = {
  frontends: [
    [
      'portal',
      4200,
      '/v1/portal/complaints/records',
      'AUDITOR',
      '00000000-0000-7000-8000-0000c2050001',
      'portal:complaint:read',
    ],
    [
      'rait',
      4201,
      '/v1/inf/rait/cases',
      'rait-coordinator',
      'RAIT-FRESH-2026-000001',
      'inf:rait-case:read',
    ],
    [
      'dashboard',
      4202,
      '/v1/dashboard/alerts?layer=N1&app=portal',
      'dash-operator',
      '00000000-0000-7000-8000-000081000102',
      'dashboard:alert:read',
      'N1',
    ],
    [
      'teat',
      4203,
      '/v1/ops/field/operations',
      'field-agent',
      '00000000-0000-7000-8000-0000e2600001',
      'ops:field-operation:read',
    ],
  ].map(
    ([name, port, readPath, persona, expectedId, policy, expectedLayer]) => ({
      name,
      rootUrl: `http://127.0.0.1:${port}`,
      proxyUrl: `http://127.0.0.1:${port}`,
      readPath,
      persona,
      fixture: expectedId,
      expectedId,
      expectedLayer,
      expectedTenant: tenantId,
      policy,
    }),
  ),
  backend: { url: 'http://127.0.0.1:3001', health: ['/healthz', '/readyz'] },
  senatran: { url: 'http://127.0.0.1:3000', health: ['/health'] },
  sefaz: { url: 'http://127.0.0.1:3999', health: ['/health'] },
  pec: pecBuilt
    ? { state: 'active', rootUrl: 'http://127.0.0.1:4204' }
    : { state: 'not_built_r0031' },
  ch: [
    {
      name: 'pades',
      path: '/v1/ch/reports',
      proxyUrl: 'http://127.0.0.1:4200',
      persona: 'MEDICO',
      actorId: fixtureActorId,
      fixture:
        '00000000-0000-7000-8000-0000c2040006,00000000-0000-7000-8000-0000c2040002',
      policy: 'ch:report:create',
      precondition:
        'medical_exam_APTO+professional_biometric_passed+actor_professional',
      body: {
        encounterId: '00000000-0000-7000-8000-0000c2040006',
        kind: 'MEDICAL',
        templateVersion: 'ch-smoke-204',
      },
      message:
        'Clinical PAdES signing service is not configured; trust readiness is unavailable',
    },
    {
      name: 'biometrics',
      path: '/v1/ch/biometrics/checks',
      proxyUrl: 'http://127.0.0.1:4200',
      persona: 'RECEPCAO',
      fixture:
        '00000000-0000-7000-8000-0000c2040005,00000000-0000-7000-8000-0000c2040004,00000000-0000-7000-8000-0000c2040003',
      policy: 'ch:biometric:capture',
      precondition: 'scheduled_appointment+active_clinic_station+patient_scope',
      body: {
        appointmentId: '00000000-0000-7000-8000-0000c2040005',
        stationId: '00000000-0000-7000-8000-0000c2040004',
        subjectPatientId: '00000000-0000-7000-8000-0000c2040003',
        kind: 'CHECKIN',
        modality: 'FINGERPRINT',
        captureReference: 'ch-smoke-204-capture',
      },
      message:
        'Biometric verification provider and processor contract are not configured',
    },
    {
      name: 'council',
      path: '/v1/ch/clinical-network/professionals',
      proxyUrl: 'http://127.0.0.1:4200',
      persona: 'ADMIN_CLINICA',
      fixture: '00000000-0000-7000-8000-0000c2040001',
      policy: 'ch:professional:create',
      precondition: 'active_clinic+uncached_CRM_identity',
      body: {
        clinic_id: '00000000-0000-7000-8000-0000c2040001',
        person_name: 'Conselho Smoke Teste',
        document_cpf: '00000000205',
        professional_kind: 'MEDICO',
        council_type: 'CRM',
        council_number: 'TEST-205',
        council_state: 'AM',
        is_active: true,
      },
      message: 'Professional council verification service is not configured',
    },
  ],
};

function command(command, args, env = {}) {
  return spawnSync(command, args, {
    cwd: process.cwd(),
    encoding: 'utf8',
    env: { ...process.env, DETRAN_STACK_STATE_DIR: evidenceDir, ...env },
  });
}

function restartEnvironment(roles, actorId) {
  const withoutLocalOverrides = Object.fromEntries(
    Object.entries(process.env).filter(
      ([key]) => !key.startsWith('DETRAN_LOCAL_'),
    ),
  );
  return {
    ...withoutLocalOverrides,
    DETRAN_STACK_STATE_DIR: evidenceDir,
    DETRAN_LOCAL_ROLES: roles,
    ...(actorId ? { DETRAN_LOCAL_ACTOR_ID: actorId } : {}),
  };
}

function phaseTargets(frontends = [], ch = []) {
  return { ...defaultTargets, frontends, ch };
}

async function backendPreflight() {
  const result = await jsonRequest(
    fetch,
    `${defaultTargets.backend.url}/healthz`,
  );
  return result.response?.status === 200;
}

async function restartFor(role, actorId) {
  const result = spawnSync(
    'bash',
    ['tools/detran-stack.sh', 'backend-restart'],
    {
      cwd: process.cwd(),
      encoding: 'utf8',
      env: restartEnvironment(role, actorId),
    },
  );
  return result.status === 0;
}

async function runCli() {
  const rows = [];
  const preflight = await backendPreflight();
  if (!preflight) {
    const report = {
      complete: false,
      pec: { state: defaultTargets.pec.state },
      rows: [
        {
          target: 'backend.healthz',
          result: 'failed',
          reason: 'backend_unreachable',
          status: 0,
        },
      ],
    };
    await writeReport(report, 'preflight');
    return report;
  }

  let restartAttempted = false;
  const restore = async () => {
    if (!restartAttempted) return true;
    return restartFor(defaultRoles);
  };
  const onSignal = () => {
    void restore().finally(() => process.exit(1));
  };
  process.once('SIGINT', onSignal);
  process.once('SIGTERM', onSignal);
  try {
    const portalGuard = command(
      'bash',
      ['tools/detran-stack.sh', 'fixture-portal'],
      {
        DB_NAME: 'not_detran_local_stack',
      },
    );
    rows.push({
      target: 'fixture.portal.database_guard',
      result:
        portalGuard.status !== 0 &&
        portalGuard.stderr.includes(
          'stack database is restricted to DB_NAME=detran_local_stack',
        )
          ? 'passed'
          : 'failed',
      reason: 'db_name_rejected',
      status: portalGuard.status ?? 1,
      command:
        'DB_NAME=not_detran_local_stack tools/detran-stack.sh fixture-portal',
      message: portalGuard.stderr.trim(),
    });
    const portalFixture = command('bash', [
      'tools/detran-stack.sh',
      'fixture-portal',
    ]);
    rows.push({
      target: 'fixture.portal',
      result: portalFixture.status === 0 ? 'passed' : 'failed',
      reason: portalFixture.status === 0 ? 'applied' : 'fixture_apply_failed',
      status: portalFixture.status ?? 1,
    });
    for (const frontend of defaultTargets.frontends) {
      restartAttempted = true;
      if (!(await restartFor(frontend.persona))) {
        rows.push({
          target: `persona.${frontend.persona}`,
          result: 'failed',
          reason: 'backend_restart_failed',
          status: 0,
        });
        continue;
      }
      const report = await runSmoke({
        targets: phaseTargets([frontend]),
        evidenceSuffix: frontend.name,
      });
      rows.push(...report.rows);
    }

    const guard = command('bash', ['tools/detran-stack.sh', 'fixture-ch'], {
      DB_NAME: 'not_detran_local_stack',
    });
    rows.push({
      target: 'fixture.database_guard',
      result:
        guard.status !== 0 &&
        guard.stderr.includes(
          'stack database is restricted to DB_NAME=detran_local_stack',
        )
          ? 'passed'
          : 'failed',
      reason: 'db_name_rejected',
      status: guard.status ?? 1,
      command:
        'DB_NAME=not_detran_local_stack tools/detran-stack.sh fixture-ch',
      message: guard.stderr.trim(),
    });
    const fixture = command('bash', ['tools/detran-stack.sh', 'fixture-ch']);
    if (fixture.status !== 0) {
      rows.push({
        target: 'fixture.ch',
        result: 'failed',
        reason: 'fixture_apply_failed',
        status: fixture.status ?? 1,
      });
    } else {
      for (const probe of defaultTargets.ch) {
        restartAttempted = true;
        if (!(await restartFor(probe.persona, probe.actorId))) {
          rows.push({
            target: `persona.${probe.persona}`,
            result: 'failed',
            reason: 'backend_restart_failed',
            status: 0,
          });
          continue;
        }
        const report = await runSmoke({
          targets: phaseTargets([], [probe]),
          evidenceSuffix: `ch-${probe.name}`,
        });
        rows.push(...report.rows);
      }
    }
  } finally {
    if (!(await restore())) {
      rows.push({
        target: 'persona.restore_defaults',
        result: 'failed',
        reason: 'backend_restart_failed',
        status: 0,
      });
    }
    process.removeListener('SIGINT', onSignal);
    process.removeListener('SIGTERM', onSignal);
  }
  const report = {
    complete: rows.every((row) => row.result === 'passed'),
    pec: { state: defaultTargets.pec.state },
    rows,
  };
  await writeReport(report);
  return report;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href
) {
  const report = await runCli();
  process.exitCode = report.complete ? 0 : 1;
}
