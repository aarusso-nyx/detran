import { createHash } from 'node:crypto';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  LOCAL_PREFIX,
  SEED,
  SqlCapture,
  TENANT_ID,
  copyAlertFixture,
  createDashboardApp,
  dashboardParameter,
  dbNow,
  headers,
  insertBiPanel,
  insertGeneratedReport,
  insertIndicatorConfig,
  newClient,
  numericParameter,
  insertSuiteSources,
  resetDashboardE2eRows,
  restoreEnv,
  writeTargets,
} from './dashboard-e2e.support.js';

/**
 * R-0011 CTG-0002 §1.3.1 e §3 ([RN-DASH-101]: "nenhuma rota altera domínio")
 * — C-0002-93 (TASK-0014). Cada comando de §3 é executado com a captura em
 * memória das instruções SQL do pool do app (`pg.Client.prototype.query`
 * interceptado; nunca `log_statement`): nenhuma escrita
 * (`insert|update|delete`) pode alcançar tabela fora de `dashboard.*` e
 * `integration.outbox`. Escritas da PLATAFORMA que todo comando do repositório
 * produz por decoradores obrigatórios (M17) — `integration.idempotency_keys`
 * (`@Idempotent()` do STYNX, §1.3.6), `integration.rate_limit_windows`
 * (`RateLimit` de `@Action`) e `audit.write(...)` (`@Audit`, chamada de
 * função, não `insert`) — são as únicas exceções, declaradas aqui (A23 b).
 * `verify:domain-boundaries` (gate) é executado fora do spec. Fica vermelho
 * até TASK-0013 montar os controllers de §14.2.
 */
const client = newClient();
let app: INestApplication;
let since = '';
let capture: SqlCapture;
let approvalRowsLimit = 0;
const ids = {
  ack: '',
  treating: '',
  close: '',
  rootCause: '',
  config: '',
  panel: '',
  report: '',
  report2: '',
};

const ALLOWED_WRITE_TARGETS = new Set(['integration.outbox']);
/** A23 (b): `@Idempotent()` e `RateLimit` de `@Action` (STYNX) — escritas da plataforma, não do domínio. */
const PLATFORM_WRITE_TARGETS = new Set([
  'integration.idempotency_keys',
  'integration.rate_limit_windows',
]);

function isAllowed(target: string): boolean {
  return (
    target.startsWith('dashboard.') ||
    ALLOWED_WRITE_TARGETS.has(target) ||
    PLATFORM_WRITE_TARGETS.has(target)
  );
}

function api() {
  return request(app.getHttpServer());
}

interface Command {
  name: string;
  method: 'post' | 'patch';
  path: () => string;
  role: string;
  ifMatch?: string;
  body: () => Record<string, unknown>;
  /** Status exato esperado (comando efetivamente executado). */
  status: number;
}

const DUTY_CYCLE_PATH = `/v1/dashboard/duties/${SEED.duty.duty01}/cycles/2026-09`;
const FILE_HASH = createHash('sha256').update('boundary e2e').digest('hex');

/** Todos os comandos de §3 (um por rota que escreve), na ordem de estado. */
const COMMANDS: Command[] = [
  {
    name: 'POST alerts/{id}/ack',
    method: 'post',
    path: () => `/v1/dashboard/alerts/${ids.ack}/ack`,
    role: 'dash-operator',
    ifMatch: '"1"',
    body: () => ({ channel: 'origin' }),
    status: 200,
  },
  {
    name: 'POST alerts/{id}/treating',
    method: 'post',
    path: () => `/v1/dashboard/alerts/${ids.treating}/treating`,
    role: 'rait-manager',
    ifMatch: '"1"',
    body: () => ({ originRef: 'e2e-0084-origem' }),
    status: 200,
  },
  {
    name: 'POST alerts/{id}/close',
    method: 'post',
    path: () => `/v1/dashboard/alerts/${ids.close}/close`,
    role: 'dash-operator',
    ifMatch: '"1"',
    body: () => ({ note: 'encerrado pelo e2e' }),
    status: 200,
  },
  {
    name: 'POST alerts/{id}/root-cause',
    method: 'post',
    path: () => `/v1/dashboard/alerts/${ids.rootCause}/root-cause`,
    role: 'technical-admin',
    ifMatch: '"1"',
    body: () => ({ category: 'transport', description: 'causa raiz e2e' }),
    status: 200,
  },
  {
    name: 'POST duties/{id}/cycles/{period}/start',
    method: 'post',
    path: () => `${DUTY_CYCLE_PATH}/start`,
    role: 'dash-duty-owner',
    ifMatch: '"1"',
    body: () => ({}),
    status: 200,
  },
  {
    name: 'POST duties/{id}/cycles/{period}/prepare',
    method: 'post',
    path: () => `${DUTY_CYCLE_PATH}/prepare`,
    role: 'dash-duty-owner',
    ifMatch: '"2"',
    body: () => ({ draftRef: 'e2e-0084-rascunho' }),
    status: 200,
  },
  {
    name: 'POST duties/{id}/cycles/{period}/submit',
    method: 'post',
    path: () => `${DUTY_CYCLE_PATH}/submit`,
    role: 'dash-duty-owner',
    ifMatch: '"3"',
    body: () => ({
      submittedAt: '2026-09-14T12:00:00.000Z',
      protocol: 'e2e-0084-protocolo',
    }),
    status: 200,
  },
  {
    name: 'POST duties/{id}/cycles/{period}/prove',
    method: 'post',
    path: () => `${DUTY_CYCLE_PATH}/prove`,
    role: 'dash-duty-owner',
    ifMatch: '"4"',
    body: () => ({ evidence: { hash: FILE_HASH } }),
    status: 200,
  },
  {
    name: 'POST duties/{id}/cycles/{period}/archive',
    method: 'post',
    path: () => `${DUTY_CYCLE_PATH}/archive`,
    role: 'dash-operator',
    ifMatch: '"5"',
    body: () => ({}),
    status: 200,
  },
  {
    name: 'PATCH indicator-configs/{id}',
    method: 'patch',
    path: () => `/v1/dashboard/indicator-configs/${ids.config}`,
    role: 'bi-analyst',
    ifMatch: '"1"',
    body: () => ({ description: 'boundary e2e' }),
    status: 200,
  },
  {
    name: 'POST indicator-configs/{id}/publish',
    method: 'post',
    path: () => `/v1/dashboard/indicator-configs/${ids.config}/publish`,
    role: 'bi-analyst',
    ifMatch: '"2"',
    body: () => ({}),
    status: 200,
  },
  {
    name: 'POST bi-panels',
    method: 'post',
    path: () => '/v1/dashboard/bi-panels',
    role: 'bi-analyst',
    body: () => ({
      name: `${LOCAL_PREFIX}boundary`,
      visibilityProfile: 'N0',
      configJson: {},
    }),
    status: 201,
  },
  {
    name: 'PATCH bi-panels/{id}',
    method: 'patch',
    path: () => `/v1/dashboard/bi-panels/${ids.panel}`,
    role: 'bi-analyst',
    ifMatch: '"1"',
    body: () => ({ description: 'boundary e2e' }),
    status: 200,
  },
  {
    name: 'POST bi-panels/{id}/publish',
    method: 'post',
    path: () => `/v1/dashboard/bi-panels/${ids.panel}/publish`,
    role: 'bi-analyst',
    ifMatch: '"2"',
    body: () => ({}),
    status: 200,
  },
  {
    name: 'POST generated-reports/{id}/complete (fixture processing)',
    method: 'post',
    path: () => `/v1/dashboard/generated-reports/${ids.report}/complete`,
    role: 'bi-analyst',
    ifMatch: '"1"',
    body: () => ({
      fileUri: 'https://fixtures.detran-am.invalid/reports/boundary.csv',
      fileHash: FILE_HASH,
    }),
    status: 200,
  },
  {
    name: 'POST generated-reports',
    method: 'post',
    path: () => '/v1/dashboard/generated-reports',
    role: 'bi-analyst',
    body: () => ({ reportType: 'duties', layer: 'N0' }),
    status: 201,
  },
  {
    name: 'POST generated-reports/{id}/fail (relatório novo)',
    method: 'post',
    path: () => `/v1/dashboard/generated-reports/${ids.report2}/fail`,
    role: 'technical-admin',
    ifMatch: '"1"',
    body: () => ({ failureCode: 'boundary-e2e' }),
    status: 200,
  },
  {
    name: 'POST exports (201)',
    method: 'post',
    path: () => '/v1/dashboard/exports',
    role: 'dash-operator',
    body: () => ({ scope: 'duties', filters: {}, format: 'json' }),
    status: 201,
  },
  {
    name: 'POST exports (202) + approve',
    method: 'post',
    path: () => '/v1/dashboard/exports',
    role: 'agency-admin',
    body: () => ({
      scope: 'duties',
      filters: {},
      format: 'csv',
      rows: approvalRowsLimit + 1,
    }),
    status: 202,
  },
  {
    name: 'POST transparency/audits',
    method: 'post',
    path: () => '/v1/dashboard/transparency/audits',
    role: 'technical-admin',
    body: () => ({ period: '2026-07', checklist: {}, result: 'conforme' }),
    status: 201,
  },
];

beforeAll(async () => {
  await client.connect();
  since = await dbNow(client);
  await resetDashboardE2eRows(client, since);
  await insertSuiteSources(client);
  await client.query(
    `delete from dashboard.transparency_audit where tenant_id = $1 and period = '2026-07'`,
    [TENANT_ID],
  );
  approvalRowsLimit = numericParameter(
    (await dashboardParameter(client, 'approval_rows')).value,
  );
  ids.ack = await copyAlertFixture(
    client,
    SEED.alert.notificadoIrregularity,
    '21',
  );
  ids.treating = await copyAlertFixture(
    client,
    SEED.alert.reconhecidoExtinction,
    '22',
  );
  ids.close = await copyAlertFixture(
    client,
    SEED.alert.verificadoIrregularity,
    '23',
  );
  ids.rootCause = await copyAlertFixture(
    client,
    SEED.alert.escalonadoExtinction,
    '24',
  );
  ids.config = await insertIndicatorConfig(client, '31', 'IND-DASH-301', {
    thresholdJson: {
      kind: 'target',
      metric: 'score',
      direction: 'below',
      levels: { n1: 3 },
    },
  });
  ids.panel = await insertBiPanel(client, '31', 'N0');
  ids.report = await insertGeneratedReport(client, '31', { layer: 'N0' });
  capture = new SqlCapture(client);
  app = await createDashboardApp();
}, 60_000);

afterAll(async () => {
  capture?.stop();
  await app?.close();
  await client.query(
    `delete from dashboard.transparency_audit where tenant_id = $1 and period = '2026-07'`,
    [TENANT_ID],
  );
  await resetDashboardE2eRows(client, since);
  // O ciclo DUTY-01/2026-09 é fixture do seed 81: devolvido ao estado semeado.
  await client.query(
    `update dashboard.duty_cycle set state = 'JANELA_ABERTA', started_at = null, prepared_at = null,
       submitted_at = null, proved_at = null, archived_at = null, draft_ref = null,
       evidence_protocol = null, evidence_capture_uri = null, evidence_hash = null, version = 1
      where id = $1`,
    [SEED.dutyCycle.duty01JanelaAberta2026_09],
  );
  await client.end();
  restoreEnv();
});

describe('CTG-0002 §1.3.1 — nenhuma rota altera domínio (C-0002-93)', () => {
  for (const command of COMMANDS) {
    it(`C-0002-93 — dado ${command.name} quando executado com captura de SQL então nenhuma escrita fora de dashboard.* e integration.outbox`, async () => {
      capture.start();
      let response;
      try {
        const agent = api();
        const req =
          command.method === 'post'
            ? agent.post(command.path())
            : agent.patch(command.path());
        response = await req
          .set(
            headers(
              command.role,
              command.ifMatch ? { 'if-match': command.ifMatch } : {},
            ),
          )
          .send(command.body());
      } finally {
        capture.pause();
      }
      expect(response.status, JSON.stringify(response.body)).toBe(
        command.status,
      );
      if (command.name === 'POST bi-panels') ids.panel = response.body.id;
      if (command.name === 'POST generated-reports')
        ids.report2 = response.body.id;

      const writes = capture.statements.flatMap((sql) =>
        writeTargets(sql).map((target) => ({ target, sql })),
      );
      expect(
        capture.statements.length,
        'a captura precisa observar o pool do app',
      ).toBeGreaterThan(0);
      expect(
        writes.some((write) => write.target.startsWith('dashboard.')),
        'todo comando escreve em dashboard.*',
      ).toBe(true);
      const outside = writes.filter((write) => !isAllowed(write.target));
      expect(
        outside,
        outside
          .map((write) => `${write.target}: ${write.sql.slice(0, 160)}`)
          .join('\n'),
      ).toEqual([]);
      for (const sql of capture.statements)
        expect(sql).not.toMatch(
          /\b(?:insert\s+into|update|delete\s+from)\s+"?(?:inf|est|ch|portal|ops|rait|teat|pec|boat)"?\s*\./i,
        );

      if (command.name === 'POST exports (202) + approve') {
        capture.start();
        const approve = await api()
          .post(
            `/v1/dashboard/exports/${response.body.context.exportId}/approve`,
          )
          .set(headers('agency-admin'))
          .send({ justification: 'boundary e2e' });
        capture.pause();
        expect(approve.status, JSON.stringify(approve.body)).toBe(200);
        const approveWrites = capture.statements.flatMap((sql) =>
          writeTargets(sql),
        );
        expect(approveWrites.filter((target) => !isAllowed(target))).toEqual(
          [],
        );
      }
    });
  }

  it('C-0002-93 — dado payload de comando com caseState (ato de negócio sobre o objeto) então 400 do .strict(); com objectRef idem', async () => {
    const withCaseState = await api()
      .post(`/v1/dashboard/alerts/${SEED.alert.notificadoExtinction}/ack`)
      .set(headers('dash-operator', { 'if-match': '"1"' }))
      .send({ channel: 'origin', caseState: 'ARQUIVADO' });
    expect(withCaseState.status, JSON.stringify(withCaseState.body)).toBe(400);
    expect(withCaseState.body.code).toBe('DASH.VALIDATION_FAILED');

    const withObjectRef = await api()
      .post(`/v1/dashboard/alerts/${SEED.alert.notificadoExtinction}/ack`)
      .set(headers('dash-operator', { 'if-match': '"1"' }))
      .send({
        channel: 'origin',
        objectRef: SEED.raitCaseRef,
        originAction: 'x',
      });
    expect(withObjectRef.status, JSON.stringify(withObjectRef.body)).toBe(400);
    expect(withObjectRef.body.code).toBe('DASH.VALIDATION_FAILED');

    // A fixture canônica permanece intocada (nenhuma escrita por 400).
    const stored = await client.query<{ state: string; version: number }>(
      `select state, version from dashboard.alert where id = $1`,
      [SEED.alert.notificadoExtinction],
    );
    expect(stored.rows[0]).toEqual({ state: 'NOTIFICADO', version: 1 });
  });

  it('C-0002-93 — dado tentativa de comando sobre o objeto de domínio (rota inexistente, §3) então 404 do Nest, nunca ato de negócio', async () => {
    for (const path of [
      `/v1/dashboard/alerts/${SEED.alert.notificadoExtinction}/object/archive`,
      `/v1/dashboard/cases/${SEED.raitCaseRef}/archive`,
      `/v1/dashboard/alerts/${SEED.alert.notificadoExtinction}/case-state`,
    ]) {
      capture.start();
      const response = await api()
        .post(path)
        .set(headers('agency-admin', { 'if-match': '"1"' }))
        .send({ state: 'ARQUIVADO' });
      capture.pause();
      expect(response.status, path).toBe(404);
      expect(
        capture.statements
          .flatMap((sql) => writeTargets(sql))
          .filter((target) => !PLATFORM_WRITE_TARGETS.has(target)),
      ).toEqual([]);
    }
  });

  // OD-D58 (proposta desta entrega): o contrato reserva
  // `DASH.ALERT_BUSINESS_ACT_FORBIDDEN` (403) "ao guard de comando que detecte
  // `object_ref` sendo alvo de mutação" sem fixar a rota, o payload ou o
  // símbolo que o exercita (§3 nota; §15.2 C-0002-93) — pelo HTTP, todo campo
  // análogo cai no `.strict()` (400). Sem fonte para a forma, o caso fica
  // pendente até o Architect fixar a assinatura do guard.
  it.todo(
    'C-0002-93 — dado guarda que receba object_ref como alvo de mutação então 403 DASH.ALERT_BUSINESS_ACT_FORBIDDEN (OD-D58: forma do guard não fixada em §14.2)',
  );
});
