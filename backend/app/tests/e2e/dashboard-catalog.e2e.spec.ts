import { createHash } from 'node:crypto';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  ACTOR_ID,
  LOCAL_PREFIX,
  TENANT_ID,
  TOPICS,
  createDashboardApp,
  dbNow,
  headers,
  insertBiPanel,
  insertIndicatorConfig,
  newClient,
  outboxRows,
  insertSuiteSources,
  resetDashboardE2eRows,
  restoreEnv,
} from './dashboard-e2e.support.js';

/**
 * R-0011 CTG-0002 §3.3, §10.1 e §10.7 — relatórios (request/complete/fail),
 * configurações de indicador (patch/publish), painéis (N3 recusado, camada) e
 * catálogo (404, 42 itens, P-09 bloqueado) — C-0002-94…97 (TASK-0014). Fica
 * vermelho até TASK-0013 montar `DashboardCatalogController`/`DashboardReportService`/
 * `DashboardCatalogService`.
 */
const client = newClient();
let app: INestApplication;
let since = '';
let configNoLevelsId = '';
let configCalibratedId = '';

/** SHA-256 hex de um conteúdo fixo (forma `^[0-9a-f]{64}$`, §3.3). */
const FILE_HASH = createHash('sha256')
  .update('relatorio e2e TASK-0014')
  .digest('hex');
const FILE_URI = 'https://fixtures.detran-am.invalid/reports/e2e-0084.csv';

function api() {
  return request(app.getHttpServer());
}

async function etagOf(path: string, role: string): Promise<string> {
  const response = await api().get(path).set(headers(role));
  expect(response.status, JSON.stringify(response.body)).toBe(200);
  return response.headers.etag as string;
}

beforeAll(async () => {
  await client.connect();
  since = await dbNow(client);
  await resetDashboardE2eRows(client, since);
  await insertSuiteSources(client);
  // IND-DASH-401 (bloco D, saúde técnica): sem `levels` (não calibrada) e
  // calibrada com `kind: target` (§6.3).
  configNoLevelsId = await insertIndicatorConfig(client, '21', 'IND-DASH-401', {
    thresholdJson: null,
  });
  configCalibratedId = await insertIndicatorConfig(
    client,
    '22',
    'IND-DASH-401',
    {
      thresholdJson: {
        kind: 'target',
        metric: 'metric_value',
        direction: 'above',
        levels: { n1: 15 },
      },
    },
  );
  await insertBiPanel(client, '21', 'N2', 'published');
  app = await createDashboardApp();
}, 60_000);

afterAll(async () => {
  await app?.close();
  await resetDashboardE2eRows(client, since);
  await client.end();
  restoreEnv();
});

describe('CTG-0002 §10.7 — generated-reports request/complete/fail (C-0002-94)', () => {
  let reportId = '';

  it('C-0002-94 — dado bi-analyst quando POST generated-reports { reportType: x } então 400 DASH.REPORT_TYPE_INVALID com allowed[]', async () => {
    const response = await api()
      .post('/v1/dashboard/generated-reports')
      .set(headers('bi-analyst'))
      .send({ reportType: 'x', layer: 'N0' });
    expect(response.status, JSON.stringify(response.body)).toBe(400);
    expect(response.body.code).toBe('DASH.REPORT_TYPE_INVALID');
    expect([...response.body.context.allowed].sort()).toEqual(
      [
        'alerts',
        'duties',
        'indicators',
        'sources',
        'comparisons',
        'kpis',
        'audit-trail',
      ].sort(),
    );
  });

  it('C-0002-94 — dado bi-analyst (N1) quando POST generated-reports { reportType: alerts, layer: N2 } então 403 DASH.EXPORT_LAYER_EXCEEDED', async () => {
    const response = await api()
      .post('/v1/dashboard/generated-reports')
      .set(headers('bi-analyst'))
      .send({ reportType: 'alerts', layer: 'N2', purpose: 'estatistica' });
    expect(response.status, JSON.stringify(response.body)).toBe(403);
    expect(response.body.code).toBe('DASH.EXPORT_LAYER_EXCEEDED');
    expect(response.body.context.requiredLayer).toBe('N2');
  });

  it('C-0002-94 — dado agency-admin (N2) quando POST generated-reports layer N2 sem purpose então 400 DASH.EXPORT_PURPOSE_REQUIRED', async () => {
    const response = await api()
      .post('/v1/dashboard/generated-reports')
      .set(headers('agency-admin'))
      .send({ reportType: 'alerts', layer: 'N2' });
    expect(response.status, JSON.stringify(response.body)).toBe(400);
    expect(response.body.code).toBe('DASH.EXPORT_PURPOSE_REQUIRED');
  });

  it('C-0002-94 — dado pedido válido quando POST generated-reports então 201 processing, ETag "1" e ReportRequested na outbox', async () => {
    const response = await api()
      .post('/v1/dashboard/generated-reports')
      .set(headers('bi-analyst'))
      .send({ reportType: 'alerts', layer: 'N1', filters: {} });
    expect(response.status, JSON.stringify(response.body)).toBe(201);
    expect(response.body.status).toBe('processing');
    expect(response.headers.etag).toBe('"1"');
    reportId = response.body.id as string;

    const events = await outboxRows(client, TOPICS.reportChanged, reportId);
    expect(events.map((row) => row.payload.domainEvent)).toEqual([
      'ReportRequested',
    ]);
    expect(events[0]!.payload.data).toMatchObject({
      reportId,
      reportType: 'alerts',
      layer: 'N1',
      status: 'processing',
    });
  });

  it('C-0002-94 — dado relatório processing quando complete com fileHash inválido então 422 DASH.REPORT_FILE_HASH_MISMATCH; válido então completed com watermark e ReportGenerated; complete de novo então 409 DASH.REPORT_STATE_INVALID; fail idem', async () => {
    const path = `/v1/dashboard/generated-reports/${reportId}`;
    const invalid = await api()
      .post(`${path}/complete`)
      .set(headers('bi-analyst', { 'if-match': '"1"' }))
      .send({ fileUri: FILE_URI, fileHash: 'nao-e-sha256' });
    expect(invalid.status, JSON.stringify(invalid.body)).toBe(422);
    expect(invalid.body.code).toBe('DASH.REPORT_FILE_HASH_MISMATCH');

    const completed = await api()
      .post(`${path}/complete`)
      .set(headers('bi-analyst', { 'if-match': '"1"' }))
      .send({ fileUri: FILE_URI, fileHash: FILE_HASH });
    expect(completed.status, JSON.stringify(completed.body)).toBe(200);
    expect(completed.body.status).toBe('completed');
    expect(completed.body.fileHash).toBe(FILE_HASH);
    expect(completed.body.watermark).toMatch(
      new RegExp(
        `^DETRAN-AM \\| camada N1 \\| usuario ${ACTOR_ID} \\(bi-analyst\\) \\| \\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z \\| recorte alerts \\{\\} \\| `,
      ),
    );
    expect(completed.headers.etag).toBe('"2"');

    const stored = await client.query<{
      status: string;
      file_hash: string | null;
      watermark: string | null;
    }>(
      `select status, file_hash, watermark from dashboard.generated_report where id = $1`,
      [reportId],
    );
    expect(stored.rows[0]).toEqual({
      status: 'completed',
      file_hash: FILE_HASH,
      watermark: completed.body.watermark,
    });

    const events = await outboxRows(client, TOPICS.reportChanged, reportId);
    expect(events.map((row) => row.payload.domainEvent)).toEqual([
      'ReportRequested',
      'ReportGenerated',
    ]);
    expect(events[1]!.payload.data).toMatchObject({
      reportId,
      status: 'completed',
      fileHash: FILE_HASH,
    });

    const again = await api()
      .post(`${path}/complete`)
      .set(headers('bi-analyst', { 'if-match': '"2"' }))
      .send({ fileUri: FILE_URI, fileHash: FILE_HASH });
    expect(again.status, JSON.stringify(again.body)).toBe(409);
    expect(again.body.code).toBe('DASH.REPORT_STATE_INVALID');
    expect(again.body.context.currentState).toBe('completed');

    const fail = await api()
      .post(`${path}/fail`)
      .set(headers('technical-admin', { 'if-match': '"2"' }))
      .send({ failureCode: 'gerador-indisponivel' });
    expect(fail.status, JSON.stringify(fail.body)).toBe(409);
    expect(fail.body.code).toBe('DASH.REPORT_STATE_INVALID');
  });

  it('C-0002-94 — dado outro relatório processing quando fail então failed com failure_code e ReportFailed (token proposto, OD-D33) na outbox', async () => {
    const requested = await api()
      .post('/v1/dashboard/generated-reports')
      .set(headers('technical-admin'))
      .send({ reportType: 'duties', layer: 'N0' });
    expect(requested.status, JSON.stringify(requested.body)).toBe(201);
    const id = requested.body.id as string;
    const failed = await api()
      .post(`/v1/dashboard/generated-reports/${id}/fail`)
      .set(headers('technical-admin', { 'if-match': '"1"' }))
      .send({ failureCode: 'gerador-indisponivel' });
    expect(failed.status, JSON.stringify(failed.body)).toBe(200);
    expect(failed.body.status).toBe('failed');
    expect(failed.body.failureCode).toBe('gerador-indisponivel');
    const events = await outboxRows(client, TOPICS.reportChanged, id);
    expect(events.map((row) => row.payload.domainEvent)).toEqual([
      'ReportRequested',
      'ReportFailed',
    ]);
  });
});

describe('CTG-0002 §3.3 — indicator-configs patch/publish (C-0002-95)', () => {
  it('C-0002-95 — dado config de IND-DASH-401 quando PATCH { acceptableLatencyMinutes: 0 } então 400 DASH.INDICATOR_LATENCY_INVALID com context.block D e range', async () => {
    const response = await api()
      .patch(`/v1/dashboard/indicator-configs/${configNoLevelsId}`)
      .set(headers('bi-analyst', { 'if-match': '"1"' }))
      .send({ acceptableLatencyMinutes: 0 });
    expect(response.status, JSON.stringify(response.body)).toBe(400);
    expect(response.body.code).toBe('DASH.INDICATOR_LATENCY_INVALID');
    expect(response.body.context.block).toBe('D');
    expect(response.body.context).toHaveProperty('range');
  });

  it('C-0002-95 — dado config de IND-DASH-401 (bloco D) quando PATCH thresholdJson kind ceiling então 422 DASH.INDICATOR_TARGET_AND_CEILING_MIXED', async () => {
    const response = await api()
      .patch(`/v1/dashboard/indicator-configs/${configNoLevelsId}`)
      .set(headers('bi-analyst', { 'if-match': '"1"' }))
      .send({
        thresholdJson: {
          kind: 'ceiling',
          metric: 'metric_value',
          direction: 'above',
          levels: { n1: 15 },
        },
      });
    expect(response.status, JSON.stringify(response.body)).toBe(422);
    expect(response.body.code).toBe('DASH.INDICATOR_TARGET_AND_CEILING_MIXED');
  });

  it('C-0002-95 — dado config de IND-DASH-401 sem levels quando publish então 422 DASH.INDICATOR_THRESHOLD_NOT_CALIBRATED com context.code', async () => {
    const response = await api()
      .post(`/v1/dashboard/indicator-configs/${configNoLevelsId}/publish`)
      .set(headers('bi-analyst', { 'if-match': '"1"' }))
      .send({});
    expect(response.status, JSON.stringify(response.body)).toBe(422);
    expect(response.body.code).toBe('DASH.INDICATOR_THRESHOLD_NOT_CALIBRATED');
    expect(response.body.context.code).toBe('IND-DASH-401');
  });

  it('C-0002-95 — dado config calibrada quando publish então published com published_at/by e IndicatorConfigChanged; publish de novo então 400 DASH.VALIDATION_FAILED (currentState published); PATCH depois então volta a draft', async () => {
    const path = `/v1/dashboard/indicator-configs/${configCalibratedId}`;
    const published = await api()
      .post(`${path}/publish`)
      .set(headers('agency-admin', { 'if-match': '"1"' }))
      .send({});
    expect(published.status, JSON.stringify(published.body)).toBe(200);
    expect(published.body.status).toBe('published');
    expect(published.headers.etag).toBe('"2"');
    const stored = await client.query<{
      status: string;
      published_by: string | null;
      published_at: string | null;
    }>(
      `select status, published_by, published_at::text from dashboard.indicator_config where id = $1`,
      [configCalibratedId],
    );
    expect(stored.rows[0]!.status).toBe('published');
    expect(stored.rows[0]!.published_by).toBe(ACTOR_ID);
    expect(stored.rows[0]!.published_at).not.toBeNull();

    const events = await outboxRows(
      client,
      TOPICS.indicatorConfigChanged,
      configCalibratedId,
    );
    expect(events.map((row) => row.payload.domainEvent)).toEqual([
      'IndicatorConfigChanged',
    ]);
    expect(events[0]!.payload.data).toMatchObject({
      indicatorConfigId: configCalibratedId,
      indicatorCode: 'IND-DASH-401',
      status: 'published',
      publishedBy: ACTOR_ID,
      hasThreshold: true,
    });

    const again = await api()
      .post(`${path}/publish`)
      .set(headers('agency-admin', { 'if-match': '"2"' }))
      .send({});
    expect(again.status, JSON.stringify(again.body)).toBe(400);
    expect(again.body.code).toBe('DASH.VALIDATION_FAILED');
    expect(again.body.context.currentState).toBe('published');

    const patched = await api()
      .patch(path)
      .set(headers('bi-analyst', { 'if-match': '"2"' }))
      .send({ description: 'reaberta pelo e2e' });
    expect(patched.status, JSON.stringify(patched.body)).toBe(200);
    expect(patched.body.status).toBe('draft');
    expect(patched.headers.etag).toBe('"3"');
    const reopened = await client.query<{
      status: string;
      published_by: string | null;
      published_at: string | null;
    }>(
      `select status, published_by, published_at::text from dashboard.indicator_config where id = $1`,
      [configCalibratedId],
    );
    expect(reopened.rows[0]).toEqual({
      status: 'draft',
      published_by: null,
      published_at: null,
    });
  });

  it('C-0002-95 — dado PATCH sem nenhum campo então 400 DASH.VALIDATION_FAILED', async () => {
    const response = await api()
      .patch(`/v1/dashboard/indicator-configs/${configNoLevelsId}`)
      .set(headers('bi-analyst', { 'if-match': '"1"' }))
      .send({});
    expect(response.status, JSON.stringify(response.body)).toBe(400);
    expect(response.body.code).toBe('DASH.VALIDATION_FAILED');
  });
});

describe('CTG-0002 §10.7 — bi-panels (C-0002-96)', () => {
  it('C-0002-96 — dado POST bi-panels { visibilityProfile: N3 } então 403 DASH.LAYER_N3_NEVER; { configJson: { layer: N3 } } idem', async () => {
    const profile = await api()
      .post('/v1/dashboard/bi-panels')
      .set(headers('bi-analyst'))
      .send({
        name: `${LOCAL_PREFIX}n3-profile`,
        visibilityProfile: 'N3',
        configJson: {},
      });
    expect(profile.status, JSON.stringify(profile.body)).toBe(403);
    expect(profile.body.code).toBe('DASH.LAYER_N3_NEVER');

    const config = await api()
      .post('/v1/dashboard/bi-panels')
      .set(headers('bi-analyst'))
      .send({
        name: `${LOCAL_PREFIX}n3-config`,
        visibilityProfile: 'N1',
        configJson: { widgets: [{ layer: 'N3' }] },
      });
    expect(config.status, JSON.stringify(config.body)).toBe(403);
    expect(config.body.code).toBe('DASH.LAYER_N3_NEVER');
  });

  it('C-0002-96 — dado POST bi-panels válido então 201 draft com Location e ETag; publish então published; GET bi-panels por bi-analyst (N1) omite o painel N2 e o detalhe N2 responde 403', async () => {
    const created = await api()
      .post('/v1/dashboard/bi-panels')
      .set(headers('bi-analyst'))
      .send({
        name: `${LOCAL_PREFIX}painel-n1`,
        visibilityProfile: 'N1',
        configJson: { widgets: [] },
      });
    expect(created.status, JSON.stringify(created.body)).toBe(201);
    expect(created.body.status).toBe('draft');
    expect(created.headers.etag).toBe('"1"');
    expect(String(created.headers.location)).toContain(
      `/v1/dashboard/bi-panels/${created.body.id}`,
    );
    const id = created.body.id as string;

    const published = await api()
      .post(`/v1/dashboard/bi-panels/${id}/publish`)
      .set(headers('bi-analyst', { 'if-match': '"1"' }))
      .send({});
    expect(published.status, JSON.stringify(published.body)).toBe(200);
    expect(published.body.status).toBe('published');

    const list = await api()
      .get('/v1/dashboard/bi-panels')
      .set(headers('bi-analyst'));
    expect(list.status, JSON.stringify(list.body)).toBe(200);
    const items = list.body.items as Array<{
      id: string;
      visibilityProfile: string;
    }>;
    expect(items.map((item) => item.id)).toContain(id);
    expect(items.every((item) => item.visibilityProfile !== 'N2')).toBe(true);

    const n2 = await client.query<{ id: string }>(
      `select id from dashboard.bi_panel where tenant_id = $1 and name like $2 and visibility_profile = 'N2'`,
      [TENANT_ID, `${LOCAL_PREFIX}%`],
    );
    expect(n2.rows).toHaveLength(1);
    expect(items.map((item) => item.id)).not.toContain(n2.rows[0]!.id);
    const detail = await api()
      .get(`/v1/dashboard/bi-panels/${n2.rows[0]!.id}`)
      .set(headers('bi-analyst'));
    expect(detail.status, JSON.stringify(detail.body)).toBe(403);
    expect(detail.body.code).toBe('DASH.LAYER_FORBIDDEN');

    const asAdmin = await api()
      .get('/v1/dashboard/bi-panels')
      .set(headers('agency-admin'));
    expect(asAdmin.status).toBe(200);
    expect(
      (asAdmin.body.items as Array<{ id: string }>).map((item) => item.id),
    ).toContain(n2.rows[0]!.id);
  });

  it('C-0002-96 — dado nome duplicado no tenant quando POST bi-panels então 400 DASH.VALIDATION_FAILED', async () => {
    const response = await api()
      .post('/v1/dashboard/bi-panels')
      .set(headers('bi-analyst'))
      .send({
        name: `${LOCAL_PREFIX}painel-n1`,
        visibilityProfile: 'N1',
        configJson: {},
      });
    expect(response.status, JSON.stringify(response.body)).toBe(400);
    expect(response.body.code).toBe('DASH.VALIDATION_FAILED');
  });
});

describe('CTG-0002 §10.1 — catálogo (C-0002-97)', () => {
  it('C-0002-97 — dado GET indicators/IND-DASH-999 então 404 DASH.INDICATOR_NOT_IN_CATALOG com context.code', async () => {
    const response = await api()
      .get('/v1/dashboard/indicators/IND-DASH-999')
      .set(headers('dash-operator'));
    expect(response.status, JSON.stringify(response.body)).toBe(404);
    expect(response.body.code).toBe('DASH.INDICATOR_NOT_IN_CATALOG');
    expect(response.body.context.code).toBe('IND-DASH-999');
  });

  it('C-0002-97 — dado GET indicators então 42 itens sem value (N0) com bloco, fonte, classificação e connected', async () => {
    const response = await api()
      .get('/v1/dashboard/indicators?pageSize=200')
      .set(headers('dash-operator'));
    expect(response.status, JSON.stringify(response.body)).toBe(200);
    expect(response.body.total).toBe(42);
    const items = response.body.items as Array<Record<string, unknown>>;
    expect(items).toHaveLength(42);
    for (const item of items) {
      expect(item).not.toHaveProperty('value');
      expect(item).toMatchObject({
        code: expect.stringMatching(/^IND-DASH-\d{3}$/),
        block: expect.stringMatching(/^[A-D]$/),
        classification: expect.stringMatching(/^P[123]$/),
        connected: expect.any(Boolean),
      });
    }
  });

  it('C-0002-97 — dado GET indicators/IND-DASH-203 (dashboard.crashes, P-09) então 423 DASH.PANEL_BLOCKED_BY_DECISION { panel: P-09, decision: DT-029 } enquanto readInternal de R-0010 responder blocked', async () => {
    const response = await api()
      .get('/v1/dashboard/indicators/IND-DASH-203')
      .set(headers('dash-operator'));
    expect(response.status, JSON.stringify(response.body)).toBe(423);
    expect(response.body.code).toBe('DASH.PANEL_BLOCKED_BY_DECISION');
    expect(response.body.context).toMatchObject({
      panel: 'P-09',
      decision: 'DT-029',
    });
  });

  it('C-0002-97 — dado IND-DASH-101 (connected = false no seed 80) quando GET indicators/IND-DASH-101 então value: null, meta.freshness.state INDISPONIVEL (fonte desconectada, §10.1) com source rait.outbox e alerts abertos por severidade', async () => {
    const response = await api()
      .get('/v1/dashboard/indicators/IND-DASH-101')
      .set(headers('dash-operator'));
    expect(response.status, JSON.stringify(response.body)).toBe(200);
    expect(response.body.code).toBe('IND-DASH-101');
    expect(response.body.value).toBeNull();
    expect(response.body.meta.freshness.state).toBe('INDISPONIVEL');
    expect(response.body.meta.freshness.source).toBe('rait.outbox');
    expect(response.body).toHaveProperty('alerts');
  });

  it('C-0002-97 — dado IND-DASH-304 (production, connected = true) quando GET indicators/IND-DASH-304 então value não nulo (contagens por state, §10.1) e meta.freshness.source rait.outbox', async () => {
    const response = await api()
      .get('/v1/dashboard/indicators/IND-DASH-304')
      .set(headers('dash-operator'));
    expect(response.status, JSON.stringify(response.body)).toBe(200);
    expect(response.body.code).toBe('IND-DASH-304');
    expect(response.body.value).not.toBeNull();
    expect(typeof response.body.value).toBe('object');
    expect(response.body.meta.freshness.source).toBe('rait.outbox');
  });

  // `etagOf` fica disponível para a leitura versionada de configuração (§3.3).
  it('C-0002-97 — dado GET indicator-configs/{id} então ETag "<version>"', async () => {
    const etag = await etagOf(
      `/v1/dashboard/indicator-configs/${configNoLevelsId}`,
      'bi-analyst',
    );
    expect(etag).toBe('"1"');
  });
});
