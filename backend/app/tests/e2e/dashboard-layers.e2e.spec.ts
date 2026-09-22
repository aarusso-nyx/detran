import { randomUUID } from 'node:crypto';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  ACTOR_ID,
  FRESHNESS_KEYS,
  FRESHNESS_STATES,
  LOCAL,
  PURPOSES_N2_H54,
  SEED,
  DATASET_KEYS,
  accessLogRows,
  copyAlertFixture,
  createDashboardApp,
  dbNow,
  headers,
  headersWithoutIdempotencyKey,
  insertBiPanel,
  insertDataset,
  insertGeneratedReport,
  insertIndicatorConfig,
  newClient,
  insertSuiteSources,
  resetDashboardE2eRows,
  restoreEnv,
} from './dashboard-e2e.support.js';

/**
 * R-0011 CTG-0002 §5 (camadas, `X-Purpose`, escopo de domínio, N3), §5.5
 * (`meta.freshness`) e §1.3.5/§1.3.6 (`If-Match`, `Idempotency-Key`) —
 * C-0002-83…87 (TASK-0014). App real (A18), fixtures do seed 81 e cópias no
 * namespace 0084 para o comando que muta (`ack`). Fica vermelho até TASK-0013
 * montar `DashboardLayerGate` e os controllers de §14.2.
 */
const client = newClient();
let app: INestApplication;
let since = '';
let ackAlertId = '';
const CONFIG_ID = LOCAL.indicatorConfig('11');
const PANEL_ID = LOCAL.biPanel('11');
const REPORT_ID = LOCAL.generatedReport('11');

function api() {
  return request(app.getHttpServer());
}

beforeAll(async () => {
  await client.connect();
  since = await dbNow(client);
  await resetDashboardE2eRows(client, since);
  await insertSuiteSources(client);
  ackAlertId = await copyAlertFixture(
    client,
    SEED.alert.notificadoIrregularity,
    '11',
  );
  await insertIndicatorConfig(client, '11', 'IND-DASH-401');
  await insertBiPanel(client, '11', 'N0');
  await insertGeneratedReport(client, '11', { layer: 'N0' });
  await insertDataset(client, '11', DATASET_KEYS.alertsBySeverityMonth, true);
  app = await createDashboardApp();
}, 60_000);

afterAll(async () => {
  await app?.close();
  await resetDashboardE2eRows(client, since);
  await client.end();
  restoreEnv();
});

describe('CTG-0002 §5.2/§5.4 — GET alerts?layer=N2 (C-0002-83)', () => {
  it('C-0002-83 — dado dash-operator (N1) quando GET alerts?layer=N2 então 403 DASH.LAYER_FORBIDDEN', async () => {
    const response = await api()
      .get('/v1/dashboard/alerts?layer=N2')
      .set(headers('dash-operator'));
    expect(response.status, JSON.stringify(response.body)).toBe(403);
    expect(response.body.code).toBe('DASH.LAYER_FORBIDDEN');
  });

  it('C-0002-83 — dado rait-manager sem X-Purpose quando GET alerts?layer=N2 então 400 DASH.PURPOSE_REQUIRED com allowed = os seis tokens de H.54', async () => {
    const response = await api()
      .get('/v1/dashboard/alerts?layer=N2')
      .set(headers('rait-manager'));
    expect(response.status, JSON.stringify(response.body)).toBe(400);
    expect(response.body.code).toBe('DASH.PURPOSE_REQUIRED');
    expect([...response.body.context.allowed].sort()).toEqual(
      [...PURPOSES_N2_H54].sort(),
    );
  });

  it('C-0002-83 — dado rait-manager com X-Purpose fora do catálogo quando GET alerts?layer=N2 então 400 DASH.PURPOSE_INVALID', async () => {
    const response = await api()
      .get('/v1/dashboard/alerts?layer=N2')
      .set(headers('rait-manager', { 'x-purpose': 'outra' }));
    expect(response.status, JSON.stringify(response.body)).toBe(400);
    expect(response.body.code).toBe('DASH.PURPOSE_INVALID');
    expect([...response.body.context.allowed].sort()).toEqual(
      [...PURPOSES_N2_H54].sort(),
    );
  });

  it('C-0002-83 — dado rait-manager com X-Purpose: supervisao quando GET alerts?layer=N2 então 200 com object.ref só nos alertas rait e redigido nos demais, e access_log com layer N2, purpose e row_count', async () => {
    const before = await dbNow(client);
    const response = await api()
      .get('/v1/dashboard/alerts?layer=N2&pageSize=200')
      .set(headers('rait-manager', { 'x-purpose': 'supervisao' }));
    expect(response.status, JSON.stringify(response.body)).toBe(200);
    const items = response.body.items as Array<{
      sourceApp: string;
      object: { ref: string | null };
    }>;
    expect(items.length).toBeGreaterThan(0);
    const rait = items.filter((item) => item.sourceApp === 'rait');
    const others = items.filter((item) => item.sourceApp !== 'rait');
    expect(rait.length).toBeGreaterThan(0);
    expect(others.length).toBeGreaterThan(0);
    for (const item of rait) expect(item.object.ref).toBe(SEED.raitCaseRef);
    for (const item of others) expect(item.object.ref).toBeNull();

    const rows = await accessLogRows(client, before, {
      resource: 'GET alerts',
    });
    expect(rows.length).toBe(1);
    expect(rows[0]).toMatchObject({
      user_ref: ACTOR_ID,
      user_role: 'rait-manager',
      layer: 'N2',
      purpose: 'supervisao',
      row_count: items.length,
    });
  });
});

describe('CTG-0002 §5.3 — escopo de domínio em GET alerts/{id} (C-0002-84)', () => {
  it('C-0002-84 — dado alerta rait (object_layer N2) quando rait-manager lê com X-Purpose então 200 em N2 com object.ref; quando traffic-authority (teat) lê então 403 DASH.DOMAIN_SCOPE_MISMATCH com context.domain = rait', async () => {
    const own = await api()
      .get(`/v1/dashboard/alerts/${SEED.alert.notificadoExtinction}`)
      .set(headers('rait-manager', { 'x-purpose': 'supervisao' }));
    expect(own.status, JSON.stringify(own.body)).toBe(200);
    expect(own.body.object.ref).toBe(SEED.raitCaseRef);
    expect(own.body.object.layer).toBe('N2');

    const foreign = await api()
      .get(`/v1/dashboard/alerts/${SEED.alert.notificadoExtinction}`)
      .set(headers('traffic-authority', { 'x-purpose': 'supervisao' }));
    expect(foreign.status, JSON.stringify(foreign.body)).toBe(403);
    expect(foreign.body.code).toBe('DASH.DOMAIN_SCOPE_MISMATCH');
    expect(foreign.body.context.domain).toBe('rait');
  });

  it('C-0002-84 — dado o mesmo alerta N2 quando AUDITOR (transversal) lê com X-Purpose então 200 N2; quando technical-admin (N1) lê sem X-Purpose então 200 redigido (object.ref nulo)', async () => {
    const auditor = await api()
      .get(`/v1/dashboard/alerts/${SEED.alert.notificadoExtinction}`)
      .set(headers('AUDITOR', { 'x-purpose': 'auditoria' }));
    expect(auditor.status, JSON.stringify(auditor.body)).toBe(200);
    expect(auditor.body.object.ref).toBe(SEED.raitCaseRef);

    const tech = await api()
      .get(`/v1/dashboard/alerts/${SEED.alert.notificadoExtinction}`)
      .set(headers('technical-admin'));
    expect(tech.status, JSON.stringify(tech.body)).toBe(200);
    expect(tech.body.object.ref).toBeNull();
    expect(tech.body.object.kind).toBe('case');
    expect(tech.body.object.layer).toBe('N2');
  });
});

describe('CTG-0002 §5.4.3 — N3 nunca (C-0002-85)', () => {
  const N3_ROLES = ['agency-admin', 'AUDITOR', 'GESTOR_DETRAN'] as const;

  for (const role of N3_ROLES) {
    it(`C-0002-85 — dado ${role} quando GET alerts?layer=N3 então 403 DASH.LAYER_N3_NEVER`, async () => {
      const response = await api()
        .get('/v1/dashboard/alerts?layer=N3')
        .set(headers(role, { 'x-purpose': 'supervisao' }));
      expect(response.status, JSON.stringify(response.body)).toBe(403);
      expect(response.body.code).toBe('DASH.LAYER_N3_NEVER');
    });
  }

  it('C-0002-85 — dado agency-admin quando POST bi-panels com visibilityProfile N3 então 403 DASH.LAYER_N3_NEVER (antes do enum)', async () => {
    const response = await api()
      .post('/v1/dashboard/bi-panels')
      .set(headers('agency-admin'))
      .send({
        name: 'e2e-0084-n3',
        visibilityProfile: 'N3',
        configJson: {},
      });
    expect(response.status, JSON.stringify(response.body)).toBe(403);
    expect(response.body.code).toBe('DASH.LAYER_N3_NEVER');
  });

  it('C-0002-85 — dado agency-admin quando POST exports com recorte só-N3 (filters.includeHealth) então 403 DASH.EXPORT_N3_FORBIDDEN', async () => {
    const response = await api()
      .post('/v1/dashboard/exports')
      .set(headers('agency-admin', { 'x-purpose': 'supervisao' }))
      .send({
        scope: 'alerts',
        filters: { includeHealth: true },
        format: 'csv',
        purpose: 'supervisao',
      });
    expect(response.status, JSON.stringify(response.body)).toBe(403);
    expect(response.body.code).toBe('DASH.EXPORT_N3_FORBIDDEN');
  });

  it('C-0002-85 — dado agency-admin quando POST generated-reports com layer N3 então 403 DASH.EXPORT_N3_FORBIDDEN (antes do enum)', async () => {
    const response = await api()
      .post('/v1/dashboard/generated-reports')
      .set(headers('agency-admin'))
      .send({ reportType: 'alerts', layer: 'N3', purpose: 'supervisao' });
    expect(response.status, JSON.stringify(response.body)).toBe(403);
    expect(response.body.code).toBe('DASH.EXPORT_N3_FORBIDDEN');
  });
});

describe('CTG-0002 §5.5 — meta.freshness em toda leitura (C-0002-86)', () => {
  /** Toda leitura de §3 (uma por rota), com um papel permitido e a camada mínima. */
  const READS: Array<{ path: string; role: string; purpose?: string }> = [
    { path: '/v1/dashboard/alerts', role: 'dash-operator' },
    {
      path: `/v1/dashboard/alerts/${SEED.alert.detectadoIrregularity}`,
      role: 'dash-operator',
    },
    {
      path: `/v1/dashboard/alerts/${SEED.alert.incidenteExtinction}/incident`,
      role: 'AUDITOR',
      purpose: 'auditoria',
    },
    { path: '/v1/dashboard/duties', role: 'dash-duty-owner' },
    {
      path: `/v1/dashboard/duties/${SEED.duty.duty01}/cycles`,
      role: 'dash-duty-owner',
    },
    {
      path: `/v1/dashboard/duties/${SEED.duty.duty01}/cycles/2026-09`,
      role: 'dash-duty-owner',
    },
    { path: '/v1/dashboard/indicators', role: 'dash-operator' },
    { path: '/v1/dashboard/indicators/IND-DASH-101', role: 'dash-operator' },
    { path: '/v1/dashboard/indicator-configs', role: 'bi-analyst' },
    {
      path: `/v1/dashboard/indicator-configs/${CONFIG_ID}`,
      role: 'bi-analyst',
    },
    { path: '/v1/dashboard/bi-panels', role: 'bi-analyst' },
    { path: `/v1/dashboard/bi-panels/${PANEL_ID}`, role: 'bi-analyst' },
    { path: '/v1/dashboard/generated-reports', role: 'bi-analyst' },
    {
      path: `/v1/dashboard/generated-reports/${REPORT_ID}`,
      role: 'bi-analyst',
    },
    { path: '/v1/dashboard/sources', role: 'technical-admin' },
    {
      path: `/v1/dashboard/sources/${SEED.source.raitOutbox}`,
      role: 'technical-admin',
    },
    { path: '/v1/dashboard/audit-trail', role: 'AUDITOR' },
    { path: '/v1/dashboard/comparisons?dimension=pool', role: 'bi-analyst' },
    { path: '/v1/dashboard/transparency/checklist', role: 'technical-admin' },
    { path: '/v1/dashboard/kpis', role: 'dash-operator' },
    { path: '/v1/dashboard/datasets', role: 'dash-operator' },
    {
      path: `/v1/dashboard/open-data/${DATASET_KEYS.alertsBySeverityMonth}`,
      role: 'dash-operator',
    },
  ];

  for (const read of READS) {
    it(`C-0002-86 — dado ${read.role} quando GET ${read.path} então o corpo traz meta.freshness exatamente { state, asOf, acceptableLatency, source }`, async () => {
      const response = await api()
        .get(read.path)
        .set(
          headers(read.role, read.purpose ? { 'x-purpose': read.purpose } : {}),
        );
      expect(response.status, JSON.stringify(response.body)).toBe(200);
      const freshness = response.body.meta?.freshness;
      expect(freshness, 'meta.freshness').toBeDefined();
      expect(Object.keys(freshness).sort()).toEqual([...FRESHNESS_KEYS]);
      expect(FRESHNESS_STATES).toContain(freshness.state);
      expect(typeof freshness.source).toBe('string');
      expect(
        freshness.asOf === null || typeof freshness.asOf === 'string',
      ).toBe(true);
      expect(
        freshness.acceptableLatency === null ||
          typeof freshness.acceptableLatency === 'number',
      ).toBe(true);
    });
  }

  it('C-0002-86 — dado IND-DASH-106 (bloco A, fonte pec.deadlines INDISPONIVEL e oculta) quando GET indicators/IND-DASH-106 então value: null e meta.freshness.state = INDISPONIVEL com source = pec.deadlines', async () => {
    const response = await api()
      .get('/v1/dashboard/indicators/IND-DASH-106')
      .set(headers('dash-operator'));
    expect(response.status, JSON.stringify(response.body)).toBe(200);
    expect(response.body.value).toBeNull();
    expect(response.body.meta.freshness.state).toBe('INDISPONIVEL');
    expect(response.body.meta.freshness.source).toBe('pec.deadlines');
  });

  it('C-0002-86 — dado leitura só de estado próprio (GET duties) então meta.freshness = { state: FRESCO, acceptableLatency: null, source: dashboard } e asOf ISO', async () => {
    const response = await api()
      .get('/v1/dashboard/duties')
      .set(headers('dash-duty-owner'));
    expect(response.status, JSON.stringify(response.body)).toBe(200);
    expect(response.body.meta.freshness).toMatchObject({
      state: 'FRESCO',
      acceptableLatency: null,
      source: 'dashboard',
    });
    expect(response.body.meta.freshness.asOf).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
    );
  });
});

describe('CTG-0002 §1.3.5/§1.3.6 — If-Match, Idempotency-Key e ETag em POST alerts/{id}/ack (C-0002-87)', () => {
  it('C-0002-87 — dado dash-operator quando POST ack sem Idempotency-Key então 400 da plataforma', async () => {
    const response = await api()
      .post(`/v1/dashboard/alerts/${ackAlertId}/ack`)
      .set(headersWithoutIdempotencyKey('dash-operator', { 'if-match': '"1"' }))
      .send({ channel: 'origin' });
    expect(response.status, JSON.stringify(response.body)).toBe(400);
  });

  it('C-0002-87 — dado dash-operator quando POST ack sem If-Match então 428 DASH.IF_MATCH_REQUIRED', async () => {
    const response = await api()
      .post(`/v1/dashboard/alerts/${ackAlertId}/ack`)
      .set(headers('dash-operator'))
      .send({ channel: 'origin' });
    expect(response.status, JSON.stringify(response.body)).toBe(428);
    expect(response.body.code).toBe('DASH.IF_MATCH_REQUIRED');
  });

  it('C-0002-87 — dado alerta NOTIFICADO (version 1) quando POST ack com If-Match "1" então 200 RECONHECIDO com ETag "2"; mesma chave e mesmo corpo então replay com Idempotency-Replayed: true e a mesma resposta; If-Match "1" de novo (stale) então 412 DASH.VERSION_CONFLICT; mesma chave com corpo diferente então 422', async () => {
    const idempotencyKey = randomUUID();
    const body = { channel: 'origin' };
    const first = await api()
      .post(`/v1/dashboard/alerts/${ackAlertId}/ack`)
      .set(
        headers('dash-operator', {
          'idempotency-key': idempotencyKey,
          'if-match': '"1"',
        }),
      )
      .send(body);
    expect(first.status, JSON.stringify(first.body)).toBe(200);
    expect(first.body.state).toBe('RECONHECIDO');
    expect(first.headers.etag).toBe('"2"');

    const replay = await api()
      .post(`/v1/dashboard/alerts/${ackAlertId}/ack`)
      .set(
        headers('dash-operator', {
          'idempotency-key': idempotencyKey,
          'if-match': '"1"',
        }),
      )
      .send(body);
    expect(replay.status, JSON.stringify(replay.body)).toBe(200);
    expect(replay.headers['idempotency-replayed']).toBe('true');
    expect(replay.body).toEqual(first.body);

    const stale = await api()
      .post(`/v1/dashboard/alerts/${ackAlertId}/ack`)
      .set(headers('dash-operator', { 'if-match': '"1"' }))
      .send(body);
    expect(stale.status, JSON.stringify(stale.body)).toBe(412);
    expect(stale.body.code).toBe('DASH.VERSION_CONFLICT');

    const divergent = await api()
      .post(`/v1/dashboard/alerts/${ackAlertId}/ack`)
      .set(
        headers('dash-operator', {
          'idempotency-key': idempotencyKey,
          'if-match': '"2"',
        }),
      )
      .send({ channel: 'manual', note: 'corpo divergente' });
    expect(divergent.status, JSON.stringify(divergent.body)).toBe(422);

    const stored = await client.query<{ state: string; version: number }>(
      `select state, version from dashboard.alert where id = $1`,
      [ackAlertId],
    );
    expect(stored.rows[0]).toEqual({ state: 'RECONHECIDO', version: 2 });
  });

  it('C-0002-87 — dado GET alerts/{id} então a resposta versionada traz ETag = "<version>"', async () => {
    const response = await api()
      .get(`/v1/dashboard/alerts/${SEED.alert.detectadoIrregularity}`)
      .set(headers('dash-operator'));
    expect(response.status, JSON.stringify(response.body)).toBe(200);
    expect(response.headers.etag).toBe('"1"');
  });
});
