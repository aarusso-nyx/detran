import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  ACTOR_ID,
  DATASET_KEYS,
  LOCAL,
  SEED,
  TENANT_ID,
  accessLogRows,
  asOwner,
  collectNodes,
  createDashboardApp,
  dashboardParameter,
  dbNow,
  headers,
  insertDataset,
  insertPrescriptionRiskCells,
  newClient,
  numericParameter,
  insertSuiteSources,
  resetDashboardE2eRows,
  restoreEnv,
} from './dashboard-e2e.support.js';

/**
 * R-0011 CTG-0002 §10.2–§10.6 — trilha (`audit-trail`), comparativos
 * (`RANKING_OF_PERSONS_FORBIDDEN`, `OD-D38`), dados abertos (filtro livre,
 * 404, publicado com supressão), datasets, transparência (checklist/audits)
 * e KPIs — C-0002-98 e C-0002-99 (TASK-0014). Fica vermelho até TASK-0013
 * montar `DashboardAuditController`/`DashboardOpenDataController`.
 */
const client = newClient();
let app: INestApplication;
let since = '';
let cellThreshold = 0;
/** Período mensal sem auditoria no seed (nenhuma `transparency_audit` semeada). */
const AUDIT_PERIOD = '2026-08';

function api() {
  return request(app.getHttpServer());
}

beforeAll(async () => {
  await client.connect();
  since = await dbNow(client);
  await resetDashboardE2eRows(client, since);
  await insertSuiteSources(client);
  cellThreshold = numericParameter(
    (await dashboardParameter(client, 'cell_threshold')).value,
  );
  await insertDataset(client, '31', DATASET_KEYS.alertsBySeverityMonth, true);
  await insertDataset(client, '32', DATASET_KEYS.dutiesComplianceYear, false);
  // Uma célula abaixo do limiar para provar a supressão nas rows abertas.
  await insertPrescriptionRiskCells(client, [
    {
      pool: LOCAL.pool('31'),
      flag: 'n1',
      count: Math.max(1, cellThreshold - 8),
    },
    { pool: LOCAL.pool('31'), flag: 'n2', count: cellThreshold + 1 },
    { pool: LOCAL.pool('31'), flag: 'critico', count: cellThreshold + 4 },
  ]);
  await asOwner(client);
  await client.query(
    `delete from dashboard.transparency_audit where tenant_id = $1 and period = $2`,
    [TENANT_ID, AUDIT_PERIOD],
  );
  app = await createDashboardApp();
}, 60_000);

afterAll(async () => {
  await app?.close();
  await asOwner(client);
  await client.query(
    `delete from dashboard.transparency_audit where tenant_id = $1 and period = $2`,
    [TENANT_ID, AUDIT_PERIOD],
  );
  await resetDashboardE2eRows(client, since);
  await client.end();
  restoreEnv();
});

describe('CTG-0002 §10.3 — GET audit-trail (C-0002-98)', () => {
  it('C-0002-98 — dado AUDITOR sem object/app quando GET audit-trail então 200 N1 com itens kind ∈ {access, alert}, sem objectRef nem note, e o próprio acesso gravado em access_log (resource GET audit-trail, layer N1)', async () => {
    const before = await dbNow(client);
    // Um acesso anterior garante ao menos um item `access` na trilha.
    const warm = await api()
      .get('/v1/dashboard/alerts')
      .set(headers('AUDITOR'));
    expect(warm.status).toBe(200);

    const response = await api()
      .get('/v1/dashboard/audit-trail?pageSize=200')
      .set(headers('AUDITOR'));
    expect(response.status, JSON.stringify(response.body)).toBe(200);
    const items = response.body.items as Array<Record<string, unknown>>;
    expect(items.length).toBeGreaterThan(0);
    const kinds = new Set(items.map((item) => item.kind));
    for (const kind of kinds) expect(['access', 'alert']).toContain(kind);
    expect(kinds.has('access')).toBe(true);
    expect(kinds.has('alert')).toBe(true);
    for (const item of items) {
      expect(item.objectRef ?? null).toBeNull();
      expect(item.note ?? null).toBeNull();
      expect(JSON.stringify(item)).not.toContain(SEED.raitCaseRef);
    }
    const own = await accessLogRows(client, before, {
      resource: 'GET audit-trail',
    });
    expect(own).toHaveLength(1);
    expect(own[0]).toMatchObject({
      user_ref: ACTOR_ID,
      user_role: 'AUDITOR',
      layer: 'N1',
      purpose: null,
      row_count: items.length,
    });
  });

  it('C-0002-98 — dado AUDITOR com ?object=<ref> e X-Purpose quando GET audit-trail então 200 N2 e a própria consulta em access_log com layer N2 e purpose', async () => {
    const before = await dbNow(client);
    const response = await api()
      .get(`/v1/dashboard/audit-trail?object=${SEED.raitCaseRef}`)
      .set(headers('AUDITOR', { 'x-purpose': 'auditoria' }));
    expect(response.status, JSON.stringify(response.body)).toBe(200);
    const own = await accessLogRows(client, before, {
      resource: 'GET audit-trail',
    });
    expect(own).toHaveLength(1);
    expect(own[0]).toMatchObject({
      layer: 'N2',
      purpose: 'auditoria',
      user_role: 'AUDITOR',
    });
    expect(own[0]!.filters_json).toMatchObject({ object: SEED.raitCaseRef });
  });

  it('C-0002-98 — dado rait-manager com ?object=<ref> sem X-Purpose quando GET audit-trail então 400 DASH.PURPOSE_REQUIRED; com ?app=pec e X-Purpose então 403 DASH.DOMAIN_SCOPE_MISMATCH', async () => {
    const noPurpose = await api()
      .get(`/v1/dashboard/audit-trail?object=${SEED.raitCaseRef}`)
      .set(headers('rait-manager'));
    expect(noPurpose.status, JSON.stringify(noPurpose.body)).toBe(400);
    expect(noPurpose.body.code).toBe('DASH.PURPOSE_REQUIRED');

    const foreign = await api()
      .get('/v1/dashboard/audit-trail?app=pec')
      .set(headers('rait-manager', { 'x-purpose': 'supervisao' }));
    expect(foreign.status, JSON.stringify(foreign.body)).toBe(403);
    expect(foreign.body.code).toBe('DASH.DOMAIN_SCOPE_MISMATCH');
    expect(foreign.body.context.domain).toBe('pec');
  });
});

describe('CTG-0002 §10.2 — GET comparisons (C-0002-98)', () => {
  it('C-0002-98 — dado GET comparisons?dimension=pool&person=true então 403 DASH.RANKING_OF_PERSONS_FORBIDDEN', async () => {
    const response = await api()
      .get('/v1/dashboard/comparisons?dimension=pool&person=true')
      .set(headers('agency-admin'));
    expect(response.status, JSON.stringify(response.body)).toBe(403);
    expect(response.body.code).toBe('DASH.RANKING_OF_PERSONS_FORBIDDEN');
  });

  it('C-0002-98 — dado GET comparisons?dimension=unit então items: [] e meta.sourcePending = OD-D38', async () => {
    const response = await api()
      .get('/v1/dashboard/comparisons?dimension=unit')
      .set(headers('bi-analyst'));
    expect(response.status, JSON.stringify(response.body)).toBe(200);
    expect(response.body.items).toEqual([]);
    expect(response.body.meta.sourcePending).toBe('OD-D38');
  });

  it('C-0002-98 — dado GET comparisons sem dimension ou com dimension fora do conjunto então 400 DASH.ENUM_INVALID', async () => {
    const missing = await api()
      .get('/v1/dashboard/comparisons')
      .set(headers('bi-analyst'));
    expect(missing.status, JSON.stringify(missing.body)).toBe(400);
    const invalid = await api()
      .get('/v1/dashboard/comparisons?dimension=pessoa')
      .set(headers('bi-analyst'));
    expect(invalid.status, JSON.stringify(invalid.body)).toBe(400);
    expect(invalid.body.code).toBe('DASH.ENUM_INVALID');
    expect([...invalid.body.context.allowed].sort()).toEqual([
      'circuit',
      'clinic',
      'pool',
      'unit',
    ]);
  });
});

describe('CTG-0002 §10.6 — datasets e open-data (C-0002-99)', () => {
  it('C-0002-99 — dado GET open-data/alerts-by-severity-month?from=2026-01 então 400 DASH.OPEN_DATA_PARAMETERIZED_FORBIDDEN', async () => {
    const response = await api()
      .get(
        `/v1/dashboard/open-data/${DATASET_KEYS.alertsBySeverityMonth}?from=2026-01`,
      )
      .set(headers('dash-operator'));
    expect(response.status, JSON.stringify(response.body)).toBe(400);
    expect(response.body.code).toBe('DASH.OPEN_DATA_PARAMETERIZED_FORBIDDEN');
  });

  it('C-0002-99 — dado dataset não publicado (published_at nulo) então 404 DASH.TENANT_MISMATCH; dataset_key fora dos três declarados idem', async () => {
    const unpublished = await api()
      .get(`/v1/dashboard/open-data/${DATASET_KEYS.dutiesComplianceYear}`)
      .set(headers('dash-operator'));
    expect(unpublished.status, JSON.stringify(unpublished.body)).toBe(404);
    expect(unpublished.body.code).toBe('DASH.TENANT_MISMATCH');

    const unknown = await api()
      .get('/v1/dashboard/open-data/inexistente')
      .set(headers('dash-operator'));
    expect(unknown.status, JSON.stringify(unknown.body)).toBe(404);
    expect(unknown.body.code).toBe('DASH.TENANT_MISMATCH');
  });

  it('C-0002-99 — dado dataset publicado (P2, sete req_*, suppression_applied) então 200 { dataset, dictionary, generatedAt, watermark, rows, changelog } com rows suprimidas por §9.5 (nunca 0) e Content-Type application/json', async () => {
    const response = await api()
      .get(`/v1/dashboard/open-data/${DATASET_KEYS.alertsBySeverityMonth}`)
      .set(headers('dash-operator'));
    expect(response.status, JSON.stringify(response.body)).toBe(200);
    expect(String(response.headers['content-type'])).toContain(
      'application/json',
    );
    for (const key of [
      'dataset',
      'dictionary',
      'generatedAt',
      'watermark',
      'rows',
      'changelog',
    ])
      expect(response.body, key).toHaveProperty(key);
    expect(response.body.dataset).toBe(DATASET_KEYS.alertsBySeverityMonth);
    expect(Array.isArray(response.body.dictionary)).toBe(true);
    for (const entry of response.body.dictionary as Array<
      Record<string, unknown>
    >)
      expect(Object.keys(entry).sort()).toEqual([
        'description',
        'field',
        'type',
      ]);
    expect(typeof response.body.watermark).toBe('string');
    expect(Array.isArray(response.body.rows)).toBe(true);
    const cells = collectNodes(
      response.body.rows,
      (node) => 'suppression' in node || typeof node.count === 'number',
    );
    for (const cell of cells) {
      expect(cell.count).not.toBe(0);
      if (typeof cell.count === 'number')
        expect(cell.count).toBeGreaterThanOrEqual(cellThreshold);
    }
  });

  it('C-0002-99 — dado GET datasets então metadados com os sete requisitos, license, periodicity, changelog e publishedAt', async () => {
    const response = await api()
      .get('/v1/dashboard/datasets')
      .set(headers('dash-operator'));
    expect(response.status, JSON.stringify(response.body)).toBe(200);
    const items = response.body.items as Array<Record<string, unknown>>;
    const published = items.find(
      (item) => item.datasetKey === DATASET_KEYS.alertsBySeverityMonth,
    );
    expect(published).toBeDefined();
    expect(published).toMatchObject({
      classification: 'P2',
      reqOpenFormat: true,
      reqMachineReadable: true,
      reqDataDictionary: true,
      reqPeriodicUpdateHistory: true,
      reqAuthenticityIntegrity: true,
      reqSearchable: true,
      reqAccessible: true,
      license: 'CC-BY-4.0',
      periodicity: 'monthly',
    });
    expect(published).toHaveProperty('changelog');
    expect(published!.publishedAt).not.toBeNull();
  });
});

describe('CTG-0002 §10.4 — transparência (C-0002-99)', () => {
  it('C-0002-99 — dado POST transparency/audits { period: 2026-9 } então 400 DASH.DUTY_PERIOD_INVALID com periodicity monthly', async () => {
    const response = await api()
      .post('/v1/dashboard/transparency/audits')
      .set(headers('technical-admin'))
      .send({ period: '2026-9', checklist: {}, result: 'conforme' });
    expect(response.status, JSON.stringify(response.body)).toBe(400);
    expect(response.body.code).toBe('DASH.DUTY_PERIOD_INVALID');
    expect(response.body.context.periodicity).toBe('monthly');
  });

  it('C-0002-99 — dado período válido quando POST transparency/audits então 201 com audited_by/at; GET transparency/checklist?period= mostra lastAudit; repetido então 400 DASH.VALIDATION_FAILED com context.period', async () => {
    const created = await api()
      .post('/v1/dashboard/transparency/audits')
      .set(headers('technical-admin'))
      .send({
        period: AUDIT_PERIOD,
        checklist: { datasets: [] },
        result: 'conforme',
        notes: 'auditoria e2e TASK-0014',
      });
    expect(created.status, JSON.stringify(created.body)).toBe(201);
    expect(created.body.period).toBe(AUDIT_PERIOD);
    expect(created.body.auditedBy).toBe(ACTOR_ID);
    expect(typeof created.body.auditedAt).toBe('string');

    const stored = await client.query<{ audited_by: string; result: string }>(
      `select audited_by, result from dashboard.transparency_audit where tenant_id = $1 and period = $2`,
      [TENANT_ID, AUDIT_PERIOD],
    );
    expect(stored.rows[0]).toEqual({
      audited_by: ACTOR_ID,
      result: 'conforme',
    });

    const checklist = await api()
      .get(`/v1/dashboard/transparency/checklist?period=${AUDIT_PERIOD}`)
      .set(headers('AUDITOR'));
    expect(checklist.status, JSON.stringify(checklist.body)).toBe(200);
    expect(checklist.body.lastAudit).toMatchObject({
      period: AUDIT_PERIOD,
      result: 'conforme',
    });
    expect(Array.isArray(checklist.body.items)).toBe(true);
    for (const item of checklist.body.items as Array<Record<string, unknown>>) {
      expect(['P1', 'P2']).toContain(item.classification);
      expect(Array.isArray(item.missing)).toBe(true);
    }

    const repeated = await api()
      .post('/v1/dashboard/transparency/audits')
      .set(headers('agency-admin'))
      .send({ period: AUDIT_PERIOD, checklist: {}, result: 'conforme' });
    expect(repeated.status, JSON.stringify(repeated.body)).toBe(400);
    expect(repeated.body.code).toBe('DASH.VALIDATION_FAILED');
    expect(repeated.body.context.period).toBe(AUDIT_PERIOD);
  });

  it('C-0002-99 — dado GET transparency/checklist?period=2026-9 (malformado) então 400 DASH.VALIDATION_FAILED', async () => {
    const response = await api()
      .get('/v1/dashboard/transparency/checklist?period=2026-9')
      .set(headers('technical-admin'));
    expect(response.status, JSON.stringify(response.body)).toBe(400);
    expect(response.body.code).toBe('DASH.VALIDATION_FAILED');
  });
});

describe('CTG-0002 §10.5 — GET kpis (C-0002-99)', () => {
  it('C-0002-99 — dado dash-operator quando GET kpis então { coverage, mtta, mttr, dutiesOnTime, freshnessAverage, openAlerts } com meta.freshness de estado próprio', async () => {
    const response = await api()
      .get('/v1/dashboard/kpis')
      .set(headers('dash-operator'));
    expect(response.status, JSON.stringify(response.body)).toBe(200);
    for (const key of [
      'coverage',
      'mtta',
      'mttr',
      'dutiesOnTime',
      'freshnessAverage',
      'openAlerts',
    ])
      expect(response.body, key).toHaveProperty(key);
    // Todos calculados das tabelas próprias (§10.5): a resposta é de estado
    // próprio (§5.5) — a forma interna de cada KPI é OD-D52.
    expect(response.body.coverage).not.toBeNull();
    expect(response.body.openAlerts).not.toBeNull();
    expect(response.body.meta.freshness.source).toBe('dashboard');
  });

  it('C-0002-99 — dado GET kpis?from=2026-13 então 400 DASH.VALIDATION_FAILED', async () => {
    const response = await api()
      .get('/v1/dashboard/kpis?from=2026-13')
      .set(headers('agency-admin'));
    expect(response.status, JSON.stringify(response.body)).toBe(400);
    expect(response.body.code).toBe('DASH.VALIDATION_FAILED');
  });
});
