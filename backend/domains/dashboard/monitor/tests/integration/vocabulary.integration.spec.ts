// CTG-0001 §3, §6 C-0001-01/C-0001-02 (M3, M9 a/b) — o vocabulário global
// `19-dashboard-lifecycle-vocabulary.sql` contém exatamente os conjuntos e as
// transições transcritas em CTG-0001 §3 (dos diagramas/tabelas de
// [WF-DASH-001], [WF-DASH-002], [WF-DASH-003]), nunca por inclusão. Padrão de
// `backend/domains/portal/identity/tests/integration/portal-seed.integration.spec.ts`
// (cliente `pg` direto, `set_config('app.role','owner')`, sem depender de
// código manuscrito — roda contra o schema `dashboard` só com o DDL 19
// aplicado). `timer_ref` (M7/A7) tem 14 linhas, todas `owner = 'dashboard'`,
// e nenhuma para os deveres sem prazo (204, 205, 208 — RN-DASH-113).
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const { Client } = pg;
const client = new Client({
  connectionString:
    process.env.DETRAN_TEST_DATABASE_URL ??
    process.env.DATABASE_URL ??
    'postgresql://postgres:postgres@localhost:5432/detran_r11',
});

beforeAll(async () => {
  await client.connect();
  await client.query(`select set_config('app.role', 'owner', false)`);
});

afterAll(async () => {
  await client.end();
});

const codes = async (table: string): Promise<string[]> => {
  const result = await client.query<{ code: string }>(
    `select code from dashboard.${table} order by code`,
  );
  return result.rows.map((row) => row.code).sort();
};

describe('19-dashboard-lifecycle-vocabulary.sql — conjuntos fechados (CTG-0001 §3, C-0001-01)', () => {
  it('dado alert_state_ref quando lido então é exatamente os 10 estados de [WF-DASH-001] §Estados', async () => {
    expect(await codes('alert_state_ref')).toEqual(
      [
        'DETECTADO',
        'CLASSIFICADO',
        'NOTIFICADO',
        'RECONHECIDO',
        'EM_TRATAMENTO',
        'VERIFICADO',
        'ENCERRADO',
        'ESCALONADO',
        'CRITICO_EXTINCAO',
        'INCIDENTE_REGISTRADO',
      ].sort(),
    );
  });

  it('dado alert_state_ref quando lido então track_scope/is_terminal batem com CTG-0001 §3.1', async () => {
    const result = await client.query<{
      code: string;
      is_terminal: boolean;
      track_scope: string;
    }>(
      `select code, is_terminal, track_scope from dashboard.alert_state_ref order by sort_order`,
    );
    expect(
      result.rows.map((row) => [row.code, row.is_terminal, row.track_scope]),
    ).toEqual([
      ['DETECTADO', false, 'both'],
      ['CLASSIFICADO', false, 'both'],
      ['NOTIFICADO', false, 'both'],
      ['RECONHECIDO', false, 'both'],
      ['EM_TRATAMENTO', false, 'both'],
      ['VERIFICADO', false, 'both'],
      ['ENCERRADO', true, 'both'],
      ['ESCALONADO', false, 'both'],
      ['CRITICO_EXTINCAO', false, 'extinction'],
      ['INCIDENTE_REGISTRADO', true, 'extinction'],
    ]);
  });

  it('dado duty_state_ref quando lido então é exatamente os 8 estados de [WF-DASH-002] §Estados', async () => {
    expect(await codes('duty_state_ref')).toEqual(
      [
        'JANELA_ABERTA',
        'EM_APURACAO',
        'PREPARADO',
        'SUBMETIDO_PUBLICADO',
        'COMPROVADO',
        'ARQUIVADO',
        'ATRASADO',
        'NAO_CUMPRIDO',
      ].sort(),
    );
  });

  it('dado duty_state_ref quando lido então os terminais são ARQUIVADO e NAO_CUMPRIDO', async () => {
    const result = await client.query<{ code: string }>(
      `select code from dashboard.duty_state_ref where is_terminal order by code`,
    );
    expect(result.rows.map((row) => row.code)).toEqual(
      ['ARQUIVADO', 'NAO_CUMPRIDO'].sort(),
    );
  });

  it('dado freshness_state_ref quando lido então é exatamente os 4 estados de [WF-DASH-003] §Estados', async () => {
    expect(await codes('freshness_state_ref')).toEqual(
      ['FRESCO', 'ATRASADO', 'INDISPONIVEL', 'DESATUALIZADO_MARCADO'].sort(),
    );
  });

  it('dado severity_ref quando lido então é exatamente {N1, N2, N3, CRITICO}', async () => {
    expect(await codes('severity_ref')).toEqual(
      ['N1', 'N2', 'N3', 'CRITICO'].sort(),
    );
  });

  it('dado layer_ref quando lido então é exatamente {N0, N1, N2, N3}', async () => {
    expect(await codes('layer_ref')).toEqual(['N0', 'N1', 'N2', 'N3'].sort());
  });

  it('dado classification_ref quando lido então é exatamente {P1, P2, P3}', async () => {
    expect(await codes('classification_ref')).toEqual(
      ['P1', 'P2', 'P3'].sort(),
    );
  });

  it('dado block_ref quando lido então é exatamente {A, B, C, D} com kind de CTG-0001 §3.9', async () => {
    const result = await client.query<{ code: string; kind: string }>(
      `select code, kind from dashboard.block_ref order by code`,
    );
    expect(result.rows).toEqual([
      { code: 'A', kind: 'legal-ceiling' },
      { code: 'B', kind: 'dever-periodico' },
      { code: 'C', kind: 'sla-operacional' },
      { code: 'D', kind: 'saude-tecnica' },
    ]);
  });
});

describe('19-dashboard-lifecycle-vocabulary.sql — timer_ref (M7/A7, 14 linhas)', () => {
  it('dado timer_ref quando lido então tem 14 linhas, todas owner = dashboard', async () => {
    const result = await client.query<{ code: string; owner: string }>(
      `select code, owner from dashboard.timer_ref`,
    );
    expect(result.rows).toHaveLength(14);
    expect(result.rows.every((row) => row.owner === 'dashboard')).toBe(true);
  });

  it('dado timer_ref quando lido então não há timer para os deveres sem prazo (201/202/206/207/209 continuam vigentes; 204, 205, 208 — RN-DASH-113 — nunca)', async () => {
    const result = await client.query<{ applies_to: string }>(
      `select applies_to from dashboard.timer_ref`,
    );
    const appliesTo = result.rows.map((row) => row.applies_to).join(' | ');
    expect(appliesTo).not.toMatch(/IND-DASH-204/);
    expect(appliesTo).not.toMatch(/IND-DASH-205/);
    expect(appliesTo).not.toMatch(/IND-DASH-208/);
  });

  it('dado timer_ref quando lido então duration_unit ∈ {horas_uteis, dias_corridos, percentual, imediato, data_fixa, mensal, anual} (A7, conjunto fechado)', async () => {
    const result = await client.query<{ duration_unit: string }>(
      `select distinct duration_unit from dashboard.timer_ref`,
    );
    const allowed = new Set([
      'horas_uteis',
      'dias_corridos',
      'percentual',
      'imediato',
      'data_fixa',
      'mensal',
      'anual',
    ]);
    for (const row of result.rows) {
      expect(allowed.has(row.duration_unit)).toBe(true);
    }
  });

  it('dado timer_ref quando lido então os quatro T-DASH-ACK-* e os três T-DASH-MARCO-* de CTG-0001 §3.10 existem com o valor exato', async () => {
    const result = await client.query<{
      code: string;
      duration_value: string | null;
      duration_unit: string;
    }>(
      `select code, duration_value, duration_unit from dashboard.timer_ref where code like 'T-DASH-ACK-%' or code like 'T-DASH-MARCO-%' order by code`,
    );
    expect(
      result.rows.map((row) => [
        row.code,
        row.duration_value === null ? null : Number(row.duration_value),
        row.duration_unit,
      ]),
    ).toEqual([
      ['T-DASH-ACK-CRITICO', null, 'imediato'],
      ['T-DASH-ACK-N1', 24, 'horas_uteis'],
      ['T-DASH-ACK-N2', 8, 'horas_uteis'],
      ['T-DASH-ACK-N3', 2, 'horas_uteis'],
      ['T-DASH-MARCO-50', 50, 'percentual'],
      ['T-DASH-MARCO-75', 75, 'percentual'],
      ['T-DASH-MARCO-90', 90, 'percentual'],
    ]);
  });
});

describe('alert_transition_ref — exatamente as transições de CTG-0001 §3.2 (C-0001-02)', () => {
  const EXPECTED_ALERT_TRANSITIONS: Array<
    [string | null, string, string, string]
  > = [
    [null, 'DETECTADO', 'system', 'both'],
    ['DETECTADO', 'CLASSIFICADO', 'system', 'both'],
    ['CLASSIFICADO', 'NOTIFICADO', 'system', 'both'],
    ['CLASSIFICADO', 'CRITICO_EXTINCAO', 'system', 'extinction'],
    ['NOTIFICADO', 'RECONHECIDO', 'owner|dash-operator', 'both'],
    ['NOTIFICADO', 'ESCALONADO', 'system', 'both'],
    ['ESCALONADO', 'NOTIFICADO', 'system', 'both'],
    ['RECONHECIDO', 'EM_TRATAMENTO', 'owner', 'both'],
    ['EM_TRATAMENTO', 'VERIFICADO', 'system', 'both'],
    ['EM_TRATAMENTO', 'ESCALONADO', 'system', 'both'],
    ['VERIFICADO', 'ENCERRADO', 'dash-operator', 'irregularity'],
    ['VERIFICADO', 'ENCERRADO', 'system', 'extinction'],
    ['CRITICO_EXTINCAO', 'INCIDENTE_REGISTRADO', 'system', 'extinction'],
  ];

  it('dado o DDL 19 aplicado quando alert_transition_ref é lida então tem 13 linhas e cada uma bate exatamente com §3.2 (incluída seq 65 de A8)', async () => {
    const result = await client.query<{
      from_state: string | null;
      to_state: string;
      actor: string;
      track: string;
    }>(
      `select from_state, to_state, actor, track from dashboard.alert_transition_ref order by seq`,
    );
    expect(result.rows).toHaveLength(13);
    expect(
      result.rows.map((row) => [
        row.from_state,
        row.to_state,
        row.actor,
        row.track,
      ]),
    ).toEqual(EXPECTED_ALERT_TRANSITIONS);
  });

  it('dado alert_transition_ref quando lida então a linha ESCALONADO → NOTIFICADO (seq 65, A8) existe com rule_ref do diagrama', async () => {
    const result = await client.query<{ rule_ref: string }>(
      `select rule_ref from dashboard.alert_transition_ref where from_state = 'ESCALONADO' and to_state = 'NOTIFICADO'`,
    );
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]?.rule_ref).toBe('WF-DASH-001 §Estados (diagrama)');
  });

  it('dado alert_transition_ref quando lida então VERIFICADO → ENCERRADO está desdobrada em dash-operator/irregularity e system/extinction', async () => {
    const result = await client.query<{ actor: string; track: string }>(
      `select actor, track from dashboard.alert_transition_ref where from_state = 'VERIFICADO' and to_state = 'ENCERRADO' order by actor`,
    );
    expect(result.rows).toEqual([
      { actor: 'dash-operator', track: 'irregularity' },
      { actor: 'system', track: 'extinction' },
    ]);
  });

  it('dado alert_state_ref quando lida então track_scope = extinction só para CRITICO_EXTINCAO e INCIDENTE_REGISTRADO', async () => {
    const result = await client.query<{ code: string }>(
      `select code from dashboard.alert_state_ref where track_scope = 'extinction' order by code`,
    );
    expect(result.rows.map((row) => row.code)).toEqual(
      ['CRITICO_EXTINCAO', 'INCIDENTE_REGISTRADO'].sort(),
    );
  });
});

describe('duty_transition_ref — exatamente as transições de CTG-0001 §3.4 (C-0001-02)', () => {
  const EXPECTED_DUTY_TRANSITIONS: Array<[string | null, string, string]> = [
    [null, 'JANELA_ABERTA', 'system'],
    ['JANELA_ABERTA', 'EM_APURACAO', 'dash-duty-owner'],
    ['EM_APURACAO', 'PREPARADO', 'dash-duty-owner'],
    ['PREPARADO', 'SUBMETIDO_PUBLICADO', 'dash-duty-owner'],
    ['SUBMETIDO_PUBLICADO', 'COMPROVADO', 'dash-duty-owner|dash-operator'],
    ['COMPROVADO', 'ARQUIVADO', 'system'],
    ['JANELA_ABERTA', 'ATRASADO', 'system'],
    ['EM_APURACAO', 'ATRASADO', 'system'],
    ['PREPARADO', 'ATRASADO', 'system'],
    ['ATRASADO', 'SUBMETIDO_PUBLICADO', 'dash-duty-owner'],
    ['ATRASADO', 'NAO_CUMPRIDO', 'system'],
  ];

  it('dado o DDL 19 aplicado quando duty_transition_ref é lida então tem 11 linhas e cada uma bate exatamente com §3.4 ("* → ATRASADO" desdobrada em 3)', async () => {
    const result = await client.query<{
      from_state: string | null;
      to_state: string;
      actor: string;
    }>(
      `select from_state, to_state, actor from dashboard.duty_transition_ref order by seq`,
    );
    expect(result.rows).toHaveLength(11);
    expect(
      result.rows.map((row) => [row.from_state, row.to_state, row.actor]),
    ).toEqual(EXPECTED_DUTY_TRANSITIONS);
  });

  it('dado duty_transition_ref quando lida então (from_state, to_state) é único (nenhum par duplicado)', async () => {
    const result = await client.query<{ n: string }>(
      `select count(*)::text as n from (
         select from_state, to_state from dashboard.duty_transition_ref
         group by from_state, to_state having count(*) > 1
       ) dup`,
    );
    expect(Number(result.rows[0]?.n)).toBe(0);
  });
});
