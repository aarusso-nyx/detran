import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  ACTOR_ID,
  LOCAL,
  TENANT_ID,
  TENANT_SHORT_NAME,
  TOPICS,
  accessLogRows,
  asOwner,
  collectNodes,
  createDashboardApp,
  dashboardParameter,
  dbNow,
  headers,
  insertPrescriptionRiskCells,
  newClient,
  numericParameter,
  outboxRows,
  insertSuiteSources,
  resetDashboardE2eRows,
  restoreEnv,
} from './dashboard-e2e.support.js';

/**
 * R-0011 CTG-0002 §9 (exportação: cinco regras de [RN-DASH-172], recortes,
 * fluxo 201/202/approve, marca d'água, supressão primária e secundária de
 * [RN-DASH-161]) — C-0002-88…92 (TASK-0014). Parâmetros
 * (`…cell_threshold`, `…export.approval_rows`) lidos de `ops.parameter` pelo
 * sufixo, nunca literal (regra 8). O limiar é tornado ilegível só durante
 * C-0002-92 e restaurado logo depois (e no `afterAll`). Fica vermelho até
 * TASK-0013 montar `DashboardExportService`/`DashboardExportsController`.
 */
const client = newClient();
let app: INestApplication;
let since = '';
let approvalRowsLimit = 0;
let cellThreshold = 0;
let cellThresholdKey = '';
let cellThresholdOriginal: unknown;

const POOL_A = LOCAL.pool('01');
const POOL_B = LOCAL.pool('02');

function api() {
  return request(app.getHttpServer());
}

async function setCellThreshold(value: unknown): Promise<void> {
  await asOwner(client);
  await client.query(
    `update ops.parameter set value_json = $3::jsonb
      where tenant_id = $1 and surface = 'dashboard' and key = $2`,
    [TENANT_ID, cellThresholdKey, JSON.stringify(value)],
  );
}

beforeAll(async () => {
  await client.connect();
  since = await dbNow(client);
  await resetDashboardE2eRows(client, since);
  await insertSuiteSources(client);
  const approval = await dashboardParameter(client, 'approval_rows');
  approvalRowsLimit = numericParameter(approval.value);
  const threshold = await dashboardParameter(client, 'cell_threshold');
  cellThresholdKey = threshold.key;
  cellThresholdOriginal = threshold.value;
  cellThreshold = numericParameter(threshold.value);
  // Células de comparisons?dimension=pool (§10.2): pool A com uma célula
  // abaixo do limiar (primária) e duas acima (a menor, T+2, vira secundária);
  // pool B só acima do limiar e sempre maior que T+2, para que a secundária
  // seja a mesma célula quer o grupo de §9.5 seja o pool, quer seja a
  // dimensão inteira × período.
  await insertPrescriptionRiskCells(client, [
    { pool: POOL_A, flag: 'n1', count: Math.max(1, cellThreshold - 7) },
    { pool: POOL_A, flag: 'n2', count: cellThreshold + 2 },
    { pool: POOL_A, flag: 'critico', count: cellThreshold + 5 },
    { pool: POOL_B, flag: 'n1', count: cellThreshold + 6 },
    { pool: POOL_B, flag: 'n2', count: cellThreshold + 8 },
  ]);
  app = await createDashboardApp();
}, 120_000);

afterAll(async () => {
  await app?.close();
  if (cellThresholdKey) await setCellThreshold(cellThresholdOriginal);
  await resetDashboardE2eRows(client, since);
  await client.end();
  restoreEnv();
});

describe('CTG-0002 §9.1 — as cinco regras como pré-condições (C-0002-88)', () => {
  it('C-0002-88 — dado dash-operator quando POST exports { scope: alerts, format: xlsx } então 400 DASH.EXPORT_FORMAT_NOT_OPEN com allowed [csv, json]', async () => {
    const response = await api()
      .post('/v1/dashboard/exports')
      .set(headers('dash-operator'))
      .send({ scope: 'alerts', filters: {}, format: 'xlsx' });
    expect(response.status, JSON.stringify(response.body)).toBe(400);
    expect(response.body.code).toBe('DASH.EXPORT_FORMAT_NOT_OPEN');
    expect([...response.body.context.allowed].sort()).toEqual(['csv', 'json']);
  });

  it('C-0002-88 — dado dash-operator (N1) quando POST exports alerts com filters.includeObject então 403 DASH.EXPORT_LAYER_EXCEEDED com requiredLayer N2', async () => {
    const response = await api()
      .post('/v1/dashboard/exports')
      .set(headers('dash-operator'))
      .send({
        scope: 'alerts',
        filters: { includeObject: true },
        format: 'csv',
      });
    expect(response.status, JSON.stringify(response.body)).toBe(403);
    expect(response.body.code).toBe('DASH.EXPORT_LAYER_EXCEEDED');
    expect(response.body.context.requiredLayer).toBe('N2');
  });

  it('C-0002-88 — dado rait-manager (N2) quando POST exports alerts com includeObject sem purpose então 400 DASH.EXPORT_PURPOSE_REQUIRED', async () => {
    const response = await api()
      .post('/v1/dashboard/exports')
      .set(headers('rait-manager'))
      .send({
        scope: 'alerts',
        filters: { includeObject: true },
        format: 'csv',
      });
    expect(response.status, JSON.stringify(response.body)).toBe(400);
    expect(response.body.code).toBe('DASH.EXPORT_PURPOSE_REQUIRED');
  });

  it('C-0002-88 — dado rait-manager quando POST exports alerts com includeObject e purpose fora do catálogo então 400 DASH.PURPOSE_INVALID', async () => {
    const response = await api()
      .post('/v1/dashboard/exports')
      .set(headers('rait-manager'))
      .send({
        scope: 'alerts',
        filters: { includeObject: true },
        format: 'csv',
        purpose: 'outra',
      });
    expect(response.status, JSON.stringify(response.body)).toBe(400);
    expect(response.body.code).toBe('DASH.PURPOSE_INVALID');
  });

  it('C-0002-88 — dado qualquer papel quando POST exports com filters.includeHealth (chave reservada N3) então 403 DASH.EXPORT_N3_FORBIDDEN antes do .strict()', async () => {
    const response = await api()
      .post('/v1/dashboard/exports')
      .set(headers('agency-admin'))
      .send({
        scope: 'alerts',
        filters: { includeHealth: true },
        format: 'xlsx',
        campoDesconhecido: true,
      });
    expect(response.status, JSON.stringify(response.body)).toBe(403);
    expect(response.body.code).toBe('DASH.EXPORT_N3_FORBIDDEN');
  });

  it('C-0002-88 — dado traffic-authority (escopo teat) quando exporta alerts N2 (includeObject, purpose válida) então 403 DASH.DOMAIN_SCOPE_MISMATCH para o recorte rait', async () => {
    const response = await api()
      .post('/v1/dashboard/exports')
      .set(headers('traffic-authority'))
      .send({
        scope: 'alerts',
        filters: { includeObject: true, app: 'rait' },
        format: 'csv',
        purpose: 'supervisao',
      });
    expect(response.status, JSON.stringify(response.body)).toBe(403);
    expect(response.body.code).toBe('DASH.DOMAIN_SCOPE_MISMATCH');
  });
});

describe('CTG-0002 §9.5 — supressão primária e secundária (C-0002-89)', () => {
  it('C-0002-89 — dado células de prescription_risk abaixo do limiar quando POST exports { scope: comparisons, filters: { dimension: pool }, format: json } então count:null com suppression primary e secondary, total:null, warnings[0] DASH.CELL_SUPPRESSED e export_log.suppressed_cells gravado', async () => {
    const response = await api()
      .post('/v1/dashboard/exports')
      .set(headers('agency-admin'))
      .send({
        scope: 'comparisons',
        filters: { dimension: 'pool' },
        format: 'json',
      });
    expect(response.status, JSON.stringify(response.body)).toBe(201);
    expect(response.body.status).toBe('registered');
    expect(response.body.warnings[0].code).toBe('DASH.CELL_SUPPRESSED');
    expect(response.body.warnings[0].context).toMatchObject({
      suppressedCells: 2,
      threshold: cellThreshold,
    });
    expect(response.body.suppressedCells).toBe(2);

    const cells = collectNodes(
      response.body.content,
      (node) => 'suppression' in node || typeof node.count === 'number',
    );
    const primary = cells.filter((cell) => cell.suppression === 'primary');
    const secondary = cells.filter((cell) => cell.suppression === 'secondary');
    expect(primary).toHaveLength(1);
    expect(secondary).toHaveLength(1);
    for (const cell of [...primary, ...secondary])
      expect(cell.count).toBeNull();
    // A secundária é a MENOR célula publicável do grupo (cellThreshold + 2).
    const published = cells
      .filter((cell) => typeof cell.count === 'number')
      .map((cell) => cell.count as number);
    expect(published).not.toContain(cellThreshold + 2);
    expect(published).toContain(cellThreshold + 5);
    expect(published).not.toContain(0);
    // Total do grupo suprimido: total:null + totalSuppressed:true.
    const suppressedTotals = collectNodes(
      response.body.content,
      (node) => node.totalSuppressed === true,
    );
    expect(suppressedTotals.length).toBeGreaterThanOrEqual(1);
    for (const group of suppressedTotals) expect(group.total).toBeNull();

    const stored = await client.query<{ suppressed_cells: number }>(
      `select suppressed_cells from dashboard.export_log where id = $1`,
      [response.body.id],
    );
    expect(stored.rows[0]!.suppressed_cells).toBe(2);
  });

  it('C-0002-89 — dado as mesmas células quando GET comparisons?dimension=pool então as mesmas células suprimidas (count:null) e nunca 0', async () => {
    const response = await api()
      .get('/v1/dashboard/comparisons?dimension=pool')
      .set(headers('bi-analyst'));
    expect(response.status, JSON.stringify(response.body)).toBe(200);
    const cells = collectNodes(
      response.body.items,
      (node) => 'suppression' in node || typeof node.count === 'number',
    );
    expect(cells.filter((cell) => cell.suppression === 'primary')).toHaveLength(
      1,
    );
    expect(
      cells.filter((cell) => cell.suppression === 'secondary'),
    ).toHaveLength(1);
    for (const cell of cells) {
      if (cell.suppression) expect(cell.count).toBeNull();
      expect(cell.count).not.toBe(0);
    }
  });
});

describe('CTG-0002 §9.3 — 202 pending-approval e approve (C-0002-90)', () => {
  let exportId = '';

  it('C-0002-90 — dado rows acima de …export.approval_rows (lido do catálogo) quando POST exports então 202 DASH.EXPORT_VOLUME_APPROVAL_REQUIRED { rows, limit, exportId }, export_log pending-approval e sem content', async () => {
    const rows = approvalRowsLimit + 1;
    const response = await api()
      .post('/v1/dashboard/exports')
      .set(headers('dash-operator'))
      .send({ scope: 'alerts', filters: {}, format: 'csv', rows });
    expect(response.status, JSON.stringify(response.body)).toBe(202);
    expect(response.body.code).toBe('DASH.EXPORT_VOLUME_APPROVAL_REQUIRED');
    expect(response.body.context).toMatchObject({
      rows,
      limit: approvalRowsLimit,
    });
    expect(typeof response.body.context.exportId).toBe('string');
    expect(response.body.content).toBeUndefined();
    exportId = response.body.context.exportId as string;

    const stored = await client.query<{
      status: string;
      watermark: string | null;
      row_count: number;
    }>(
      `select status, watermark, row_count from dashboard.export_log where id = $1`,
      [exportId],
    );
    expect(stored.rows[0]).toMatchObject({
      status: 'pending-approval',
      watermark: null,
    });
    expect(stored.rows[0]!.row_count).toBeGreaterThan(approvalRowsLimit);
  });

  it('C-0002-90 — dado export pending-approval quando dash-operator chama approve então 403 (política); quando agency-admin aprova com justification então 200 approved com approved_by, watermark, content e evento data.status = approved; aprovar de novo então 400 DASH.VALIDATION_FAILED com currentState', async () => {
    const denied = await api()
      .post(`/v1/dashboard/exports/${exportId}/approve`)
      .set(headers('dash-operator'))
      .send({ justification: 'auditoria trimestral (e2e)' });
    expect(denied.status, JSON.stringify(denied.body)).toBe(403);
    expect(denied.body.code ?? '').not.toMatch(/^DASH\./);

    const approved = await api()
      .post(`/v1/dashboard/exports/${exportId}/approve`)
      .set(headers('agency-admin'))
      .send({ justification: 'auditoria trimestral (e2e)' });
    expect(approved.status, JSON.stringify(approved.body)).toBe(200);
    expect(approved.body.status).toBe('approved');
    expect(typeof approved.body.watermark).toBe('string');
    expect(approved.body.content).toBeDefined();

    const stored = await client.query<{
      status: string;
      approved_by: string | null;
      watermark: string | null;
      justification: string | null;
    }>(
      `select status, approved_by, watermark, justification from dashboard.export_log where id = $1`,
      [exportId],
    );
    expect(stored.rows[0]).toMatchObject({
      status: 'approved',
      approved_by: ACTOR_ID,
      justification: 'auditoria trimestral (e2e)',
    });
    expect(stored.rows[0]!.watermark).toBe(approved.body.watermark);

    const events = await outboxRows(client, TOPICS.exportRegistered, exportId);
    expect(
      events.map((row) => (row.payload.data as { status: string }).status),
    ).toEqual(['pending-approval', 'approved']);
    for (const row of events)
      expect(row.payload.domainEvent).toBe('EXPORTACAO_REGISTRADA');

    const again = await api()
      .post(`/v1/dashboard/exports/${exportId}/approve`)
      .set(headers('agency-admin'))
      .send({ justification: 'de novo' });
    expect(again.status, JSON.stringify(again.body)).toBe(400);
    expect(again.body.code).toBe('DASH.VALIDATION_FAILED');
    expect(again.body.context.currentState).toBe('approved');
  });
});

describe("CTG-0002 §9.4 — marca d'água e formatos (C-0002-91)", () => {
  it('C-0002-91 — dado dash-operator quando POST exports alerts csv então 201 com content começando por "# DETRAN-AM | camada N1 | usuario <id> (dash-operator) | <iso> | recorte alerts {…} | export <id>", export_log.watermark igual à linha e access_log com export_id', async () => {
    const before = await dbNow(client);
    const response = await api()
      .post('/v1/dashboard/exports')
      .set(headers('dash-operator'))
      .send({
        scope: 'alerts',
        filters: { state: 'NOTIFICADO' },
        format: 'csv',
      });
    expect(response.status, JSON.stringify(response.body)).toBe(201);
    const id = response.body.id as string;
    const content = response.body.content as string;
    const firstLine = content.split('\n')[0]!;
    const expectedPrefix = `# ${TENANT_SHORT_NAME} | camada N1 | usuario ${ACTOR_ID} (dash-operator) | `;
    expect(firstLine.startsWith(expectedPrefix), firstLine).toBe(true);
    expect(firstLine).toMatch(
      new RegExp(
        `^# ${TENANT_SHORT_NAME} \\| camada N1 \\| usuario ${ACTOR_ID} \\(dash-operator\\) \\| \\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z \\| recorte alerts \\{"state":"NOTIFICADO"\\} \\| export ${id}$`,
      ),
    );
    expect(response.body.watermark).toBe(firstLine.slice(2));
    // Segunda linha = cabeçalho de colunas do CSV.
    expect(content.split('\n')[1]!.length).toBeGreaterThan(0);

    const stored = await client.query<{ watermark: string | null }>(
      `select watermark from dashboard.export_log where id = $1`,
      [id],
    );
    expect(stored.rows[0]!.watermark).toBe(firstLine.slice(2));

    const access = await accessLogRows(client, before, { exportId: id });
    expect(access).toHaveLength(1);
    expect(access[0]).toMatchObject({
      user_ref: ACTOR_ID,
      user_role: 'dash-operator',
      layer: 'N1',
      export_id: id,
    });
    expect(access[0]!.row_count).toBe(response.body.rowCount);
  });

  it("C-0002-91 — dado format json então content = { watermark, classification: N1, rows } com a mesma marca d'água de export_log", async () => {
    const response = await api()
      .post('/v1/dashboard/exports')
      .set(headers('dash-operator'))
      .send({
        scope: 'alerts',
        filters: { state: 'NOTIFICADO' },
        format: 'json',
      });
    expect(response.status, JSON.stringify(response.body)).toBe(201);
    const content = response.body.content as {
      watermark: string;
      classification: string;
      rows: unknown[];
    };
    expect(Object.keys(content).sort()).toEqual([
      'classification',
      'rows',
      'watermark',
    ]);
    expect(content.classification).toBe('N1');
    expect(Array.isArray(content.rows)).toBe(true);
    expect(content.watermark).toBe(response.body.watermark);
    const stored = await client.query<{ watermark: string | null }>(
      `select watermark from dashboard.export_log where id = $1`,
      [response.body.id],
    );
    expect(stored.rows[0]!.watermark).toBe(content.watermark);
    // Recorte N1: nunca object_ref nas linhas exportadas.
    expect(JSON.stringify(content.rows)).not.toContain(
      '00000000-0000-7000-8000-000010000002',
    );
  });
});

describe('CTG-0002 §1.3.7 — limiar de célula ilegível (C-0002-92)', () => {
  it('C-0002-92 — dado …cell_threshold com value_json ilegível quando POST exports comparisons então 422 DASH.CELL_THRESHOLD_UNDEFINED com context.parameterKey = a chave do catálogo; restaurado em seguida', async () => {
    await setCellThreshold('indefinido (sem número inicial)');
    try {
      const response = await api()
        .post('/v1/dashboard/exports')
        .set(headers('agency-admin'))
        .send({
          scope: 'comparisons',
          filters: { dimension: 'pool' },
          format: 'json',
        });
      expect(response.status, JSON.stringify(response.body)).toBe(422);
      expect(response.body.code).toBe('DASH.CELL_THRESHOLD_UNDEFINED');
      expect(response.body.context.parameterKey).toBe(cellThresholdKey);
    } finally {
      await setCellThreshold(cellThresholdOriginal);
    }
    const restored = await dashboardParameter(client, 'cell_threshold');
    expect(restored.value).toEqual(cellThresholdOriginal);
  });
});
