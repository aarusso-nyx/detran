// CTG-0001 §6 C-0001-04 (M9 d) — depois de `apply.sh` + `seed.sh` (duas
// vezes; M8/A5), o tenant de fixtures `00000000-0000-7000-8000-00000000a001`
// tem exatamente os 42 `indicator` de CTG-0001 §5.1 (todos `classification =
// 'P3'`, `connected`/`projection`/`clock_code` = §4.2 linha a linha, 12
// `true`), as 15 `duty` de A4/§5.2 e as fixtures de estado de §5.3
// (`81-fixtures-dashboard-state.sql`, TASK-0002): 18 `alert` (uma por
// (estado, trilha) admitida), 8 `duty_cycle` (um por estado), 4 `source`
// (um por estado de frescor), 1 `export_log` `pending-approval`.
//
// DEPENDÊNCIA (não é falha desta spec): `80-fixtures-dashboard-catalog.sql`
// (indicator + duty) é TASK-0003 (Engineer) e ainda NÃO existe nesta
// entrega — as asserções de `indicator`/`duty` ficam vermelhas até TASK-0003
// e o wiring de `seed.sh` (M10) landarem; `81-fixtures-dashboard-state.sql`
// (este arquivo, criado por esta tarefa) também depende de `80` estar
// carregado antes (códigos de indicador/dever existentes no catálogo).
// Padrão de
// `backend/domains/portal/identity/tests/integration/portal-seed.integration.spec.ts`
// (`set_config('app.role','owner')`, cliente `pg` direto, sem código
// manuscrito).
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const { Client } = pg;
const client = new Client({
  connectionString:
    process.env.DETRAN_TEST_DATABASE_URL ??
    process.env.DATABASE_URL ??
    'postgresql://postgres:postgres@localhost:5432/detran_r11',
});

const CANONICAL_TENANT = '00000000-0000-7000-8000-00000000a001';

beforeAll(async () => {
  await client.connect();
  await client.query(`select set_config('app.role', 'owner', false)`);
  await client.query(`select set_config('app.tenant_id', $1, false)`, [
    CANONICAL_TENANT,
  ]);
});

afterAll(async () => {
  await client.end();
});

const count = async (sql: string, params: unknown[] = []): Promise<number> => {
  const result = await client.query<{ n: string }>(sql, params);
  return Number(result.rows[0]?.n ?? -1);
};

/** Os 42 códigos de [APP-DASHBOARD] §Catálogo, transcritos de CTG-0001 §5.1
 * (blocos A-D) com `connected`/`projection`/`clock_code` de CTG-0001 §4.2 —
 * literal no spec (regra 1: nenhum valor inventado). */
const EXPECTED_INDICATORS: Array<{
  code: string;
  connected: boolean;
  projection: string | null;
  clockCode: string | null;
}> = [
  // Bloco A — legal-ceiling (11)
  {
    code: 'IND-DASH-101',
    connected: false,
    projection: 'dashboard.prescription_risk',
    clockCode: 'A',
  },
  {
    code: 'IND-DASH-102',
    connected: false,
    projection: 'dashboard.prescription_risk',
    clockCode: 'B',
  },
  {
    code: 'IND-DASH-103',
    connected: false,
    projection: 'dashboard.prescription_risk',
    clockCode: 'B',
  },
  {
    code: 'IND-DASH-104',
    connected: false,
    projection: 'dashboard.prescription_risk',
    clockCode: 'C',
  },
  {
    code: 'IND-DASH-105',
    connected: false,
    projection: 'dashboard.prescription_risk',
    clockCode: 'D',
  },
  {
    code: 'IND-DASH-106',
    connected: false,
    projection: 'dashboard.pec_deadlines',
    clockCode: null,
  },
  {
    code: 'IND-DASH-107',
    connected: false,
    projection: 'dashboard.pec_deadlines',
    clockCode: null,
  },
  {
    code: 'IND-DASH-108',
    connected: true,
    projection: 'dashboard.teat_measures',
    clockCode: null,
  },
  {
    code: 'IND-DASH-109',
    connected: true,
    projection: 'dashboard.teat_measures',
    clockCode: null,
  },
  {
    code: 'IND-DASH-110',
    connected: false,
    projection: 'dashboard.teat_measures',
    clockCode: null,
  },
  {
    code: 'IND-DASH-111',
    connected: false,
    projection: 'dashboard.teat_measures',
    clockCode: null,
  },
  // Bloco B — dever-periodico (9)
  {
    code: 'IND-DASH-201',
    connected: false,
    projection: 'dashboard.duty_evidence',
    clockCode: null,
  },
  {
    code: 'IND-DASH-202',
    connected: false,
    projection: 'dashboard.duty_evidence',
    clockCode: null,
  },
  {
    code: 'IND-DASH-203',
    connected: false,
    projection: 'dashboard.crashes',
    clockCode: null,
  },
  {
    code: 'IND-DASH-204',
    connected: false,
    projection: 'dashboard.crashes',
    clockCode: null,
  },
  {
    code: 'IND-DASH-205',
    connected: false,
    projection: 'dashboard.duty_evidence',
    clockCode: null,
  },
  {
    code: 'IND-DASH-206',
    connected: false,
    projection: 'dashboard.portal_service_metrics',
    clockCode: null,
  },
  {
    code: 'IND-DASH-207',
    connected: true,
    projection: 'dashboard.portal_service_metrics',
    clockCode: null,
  },
  {
    code: 'IND-DASH-208',
    connected: false,
    projection: 'dashboard.portal_service_metrics',
    clockCode: null,
  },
  { code: 'IND-DASH-209', connected: false, projection: null, clockCode: null },
  // Bloco C — sla-operacional (14)
  {
    code: 'IND-DASH-301',
    connected: true,
    projection: 'dashboard.portal_service_metrics',
    clockCode: null,
  },
  {
    code: 'IND-DASH-302',
    connected: false,
    projection: 'dashboard.portal_service_metrics',
    clockCode: null,
  },
  {
    code: 'IND-DASH-303',
    connected: false,
    projection: 'dashboard.portal_service_metrics',
    clockCode: null,
  },
  {
    code: 'IND-DASH-304',
    connected: true,
    projection: 'dashboard.production',
    clockCode: null,
  },
  {
    code: 'IND-DASH-305',
    connected: true,
    projection: 'dashboard.production',
    clockCode: null,
  },
  {
    code: 'IND-DASH-306',
    connected: false,
    projection: 'dashboard.pec_deadlines',
    clockCode: null,
  },
  {
    code: 'IND-DASH-307',
    connected: false,
    projection: 'dashboard.pec_deadlines',
    clockCode: null,
  },
  {
    code: 'IND-DASH-308',
    connected: false,
    projection: 'dashboard.pec_deadlines',
    clockCode: null,
  },
  {
    code: 'IND-DASH-309',
    connected: false,
    projection: 'dashboard.pec_deadlines',
    clockCode: null,
  },
  {
    code: 'IND-DASH-310',
    connected: true,
    projection: 'dashboard.crashes',
    clockCode: null,
  },
  {
    code: 'IND-DASH-311',
    connected: true,
    projection: 'dashboard.teat_measures',
    clockCode: null,
  },
  {
    code: 'IND-DASH-312',
    connected: true,
    projection: 'dashboard.teat_measures',
    clockCode: null,
  },
  {
    code: 'IND-DASH-313',
    connected: true,
    projection: 'dashboard.teat_measures',
    clockCode: null,
  },
  {
    code: 'IND-DASH-314',
    connected: true,
    projection: 'dashboard.teat_measures',
    clockCode: null,
  },
  // Bloco D — saude-tecnica (8)
  {
    code: 'IND-DASH-401',
    connected: false,
    projection: 'dashboard.integration_health',
    clockCode: null,
  },
  {
    code: 'IND-DASH-402',
    connected: false,
    projection: 'dashboard.integration_health',
    clockCode: null,
  },
  {
    code: 'IND-DASH-403',
    connected: false,
    projection: 'dashboard.integration_health',
    clockCode: null,
  },
  {
    code: 'IND-DASH-404',
    connected: true,
    projection: 'dashboard.teat_measures',
    clockCode: null,
  },
  {
    code: 'IND-DASH-405',
    connected: false,
    projection: 'dashboard.teat_measures',
    clockCode: null,
  },
  {
    code: 'IND-DASH-406',
    connected: false,
    projection: 'dashboard.teat_measures',
    clockCode: null,
  },
  {
    code: 'IND-DASH-407',
    connected: false,
    projection: 'dashboard.teat_measures',
    clockCode: null,
  },
  {
    code: 'IND-DASH-408',
    connected: false,
    projection: 'dashboard.source_freshness',
    clockCode: null,
  },
];

describe('80-fixtures-dashboard-catalog.sql — 42 indicator (CTG-0001 §5.1/§4.2, C-0001-04)', () => {
  it('dado o seed rodado (duas vezes) quando dashboard.indicator é lida para o tenant de fixtures então tem exatamente 42 linhas, todas classification = P3', async () => {
    expect(
      await count(
        `select count(*)::text as n from dashboard.indicator where tenant_id = $1`,
        [CANONICAL_TENANT],
      ),
    ).toBe(42);
    expect(
      await count(
        `select count(*)::text as n from dashboard.indicator where tenant_id = $1 and classification = 'P3'`,
        [CANONICAL_TENANT],
      ),
    ).toBe(42);
  });

  it.each(EXPECTED_INDICATORS)(
    'dado o seed rodado quando $code é lido então connected/projection/clock_code batem com CTG-0001 §4.2',
    async ({ code, connected, projection, clockCode }) => {
      const result = await client.query<{
        connected: boolean;
        projection: string | null;
        clock_code: string | null;
      }>(
        `select connected, projection, clock_code from dashboard.indicator where tenant_id = $1 and code = $2`,
        [CANONICAL_TENANT, code],
      );
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0]).toEqual({
        connected,
        projection,
        clock_code: clockCode,
      });
    },
  );

  it('dado dashboard.indicator quando lida então acceptable_latency_minutes é nulo em todas (M13, latência source_pending)', async () => {
    expect(
      await count(
        `select count(*)::text as n from dashboard.indicator where tenant_id = $1 and acceptable_latency_minutes is not null`,
        [CANONICAL_TENANT],
      ),
    ).toBe(0);
  });

  it('dado dashboard.indicator quando o total é somado então 12 connected = true e 30 connected = false (CTG-0001 §4.2 "Totais")', async () => {
    expect(EXPECTED_INDICATORS.filter((row) => row.connected)).toHaveLength(12);
    expect(EXPECTED_INDICATORS.filter((row) => !row.connected)).toHaveLength(
      30,
    );
    expect(
      await count(
        `select count(*)::text as n from dashboard.indicator where tenant_id = $1 and connected`,
        [CANONICAL_TENANT],
      ),
    ).toBe(12);
  });
});

describe('80-fixtures-dashboard-catalog.sql — 15 duty (RN-DASH-120, A4/OD-D14, C-0001-04)', () => {
  it('dado o seed rodado quando dashboard.duty é lida então tem exatamente 15 linhas (14 numeradas + DUTY-PNATRANS)', async () => {
    expect(
      await count(
        `select count(*)::text as n from dashboard.duty where tenant_id = $1`,
        [CANONICAL_TENANT],
      ),
    ).toBe(15);
  });

  it('dado dashboard.duty quando lida então mvp = true exatamente nas linhas 1, 2, 8, 9, 10, 11, 13, 14 ([RN-DASH-120] §Verificação 3)', async () => {
    const result = await client.query<{ line_no: number }>(
      `select line_no from dashboard.duty where tenant_id = $1 and mvp order by line_no`,
      [CANONICAL_TENANT],
    );
    expect(result.rows.map((row) => row.line_no)).toEqual([
      1, 2, 8, 9, 10, 11, 13, 14,
    ]);
  });

  it('dado dashboard.duty quando lida então owner_role = dash-duty-owner em todas (H.38)', async () => {
    expect(
      await count(
        `select count(*)::text as n from dashboard.duty where tenant_id = $1 and owner_role <> 'dash-duty-owner'`,
        [CANONICAL_TENANT],
      ),
    ).toBe(0);
  });

  it('dado dashboard.duty quando lida então DUTY-PNATRANS existe com line_no nulo e scope federal (A4)', async () => {
    const result = await client.query<{
      line_no: number | null;
      scope: string;
    }>(
      `select line_no, scope from dashboard.duty where tenant_id = $1 and code = 'DUTY-PNATRANS'`,
      [CANONICAL_TENANT],
    );
    expect(result.rows).toEqual([{ line_no: null, scope: 'federal' }]);
  });
});

describe('81-fixtures-dashboard-state.sql — estado (CTG-0001 §5.3, TASK-0002, C-0001-04)', () => {
  it('dado o seed rodado (duas vezes) quando dashboard.alert é lida então tem exatamente 18 linhas (10 estados × extinction + 8 estados × irregularity)', async () => {
    expect(
      await count(
        `select count(*)::text as n from dashboard.alert where tenant_id = $1`,
        [CANONICAL_TENANT],
      ),
    ).toBe(18);
  });

  it('dado dashboard.alert quando lida então nenhuma linha irregularity está em CRITICO_EXTINCAO/INCIDENTE_REGISTRADO (ck_dashboard_alert_extinction_states)', async () => {
    expect(
      await count(
        `select count(*)::text as n from dashboard.alert where tenant_id = $1 and track = 'irregularity' and state in ('CRITICO_EXTINCAO', 'INCIDENTE_REGISTRADO')`,
        [CANONICAL_TENANT],
      ),
    ).toBe(0);
  });

  it('dado dashboard.alert_trail quando lida então cada alert de estado ≠ DETECTADO tem pelo menos 2 linhas (seq 1 = DETECTADO, última = estado do alerta)', async () => {
    const result = await client.query<{
      state: string;
      last_to_state: string;
      trail_count: string;
    }>(
      `select a.state, a.tenant_id,
              (select t.to_state from dashboard.alert_trail t
                where t.alert_id = a.id order by t.seq desc limit 1) as last_to_state,
              (select count(*)::text from dashboard.alert_trail t where t.alert_id = a.id) as trail_count
         from dashboard.alert a where a.tenant_id = $1`,
      [CANONICAL_TENANT],
    );
    for (const row of result.rows) {
      expect(row.last_to_state).toBe(row.state);
      expect(Number(row.trail_count)).toBeGreaterThanOrEqual(1);
    }
  });

  it('dado dashboard.duty_cycle quando lida então tem exatamente 8 linhas (uma por duty_state_ref)', async () => {
    expect(
      await count(
        `select count(*)::text as n from dashboard.duty_cycle where tenant_id = $1`,
        [CANONICAL_TENANT],
      ),
    ).toBe(8);
    const result = await client.query<{ state: string }>(
      `select distinct state from dashboard.duty_cycle where tenant_id = $1 order by state`,
      [CANONICAL_TENANT],
    );
    expect(result.rows.map((row) => row.state)).toEqual(
      [
        'ARQUIVADO',
        'ATRASADO',
        'COMPROVADO',
        'EM_APURACAO',
        'JANELA_ABERTA',
        'NAO_CUMPRIDO',
        'PREPARADO',
        'SUBMETIDO_PUBLICADO',
      ].sort(),
    );
  });

  it('dado dashboard.duty_cycle quando o estado é COMPROVADO ou ARQUIVADO então evidence_hash não é nulo (ck_dashboard_duty_cycle_evidence)', async () => {
    expect(
      await count(
        `select count(*)::text as n from dashboard.duty_cycle where tenant_id = $1 and state in ('COMPROVADO', 'ARQUIVADO') and evidence_hash is null`,
        [CANONICAL_TENANT],
      ),
    ).toBe(0);
  });

  it('dado dashboard.source quando lida então tem exatamente 4 linhas, uma por freshness_state_ref, acceptable_latency_minutes nulo em todas (M13)', async () => {
    expect(
      await count(
        `select count(*)::text as n from dashboard.source where tenant_id = $1`,
        [CANONICAL_TENANT],
      ),
    ).toBe(4);
    const result = await client.query<{ state: string }>(
      `select distinct state from dashboard.source where tenant_id = $1 order by state`,
      [CANONICAL_TENANT],
    );
    expect(result.rows.map((row) => row.state)).toEqual(
      ['ATRASADO', 'DESATUALIZADO_MARCADO', 'FRESCO', 'INDISPONIVEL'].sort(),
    );
    expect(
      await count(
        `select count(*)::text as n from dashboard.source where tenant_id = $1 and acceptable_latency_minutes is not null`,
        [CANONICAL_TENANT],
      ),
    ).toBe(0);
  });

  it('dado dashboard.export_log quando lida então tem exatamente 1 linha pending-approval', async () => {
    expect(
      await count(
        `select count(*)::text as n from dashboard.export_log where tenant_id = $1 and status = 'pending-approval'`,
        [CANONICAL_TENANT],
      ),
    ).toBe(1);
  });

  it('dado dashboard.monitor_projection_applied_event e as tabelas de projeção quando lidas então estão vazias (§5.3: preenchidas só pelos testes de replay)', async () => {
    for (const table of [
      'monitor_projection_applied_event',
      'prescription_risk',
      'production',
      'integration_health',
      'pec_deadlines',
      'teat_measures',
      'portal_service_metrics',
      'duty_evidence',
    ]) {
      expect(
        await count(
          `select count(*)::text as n from dashboard.${table} where tenant_id = $1`,
          [CANONICAL_TENANT],
        ),
      ).toBe(0);
    }
  });
});
