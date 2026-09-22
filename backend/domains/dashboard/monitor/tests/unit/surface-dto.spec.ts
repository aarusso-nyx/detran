// CTG-0002 §3 (payloads zod `.strict()` das rotas de superfície), §6.3
// (`Threshold`, OD-D42), §9.2 (`ExportScope`/`ReportType`, OD-D48) e §10
// (queries) — C-0002-88, C-0002-93, C-0002-94, C-0002-95, C-0002-96 e
// C-0002-99 na camada `unit` (TASK-0014). Contrato de §14.2: `surface/dto.ts`
// exporta os schemas zod `CreateExportDto`, `ApproveExportDto`,
// `PatchIndicatorConfigDto`, `ThresholdSchema`, `BiPanelDto`,
// `RequestReportDto`, `CompleteReportDto`, `FailReportDto`,
// `TransparencyAuditDto`, `ComparisonsQuery`, `AuditTrailQuery`, `KpisQuery`.
// Só `safeParse` (nunca `parse` com throw) — a tradução para 400
// `DASH.VALIDATION_FAILED`/`DASH.ENUM_INVALID` é do controller (e2e). Fica
// vermelho (Cannot find module) até TASK-0013 criar
// `src/handwritten/surface/dto.ts`.
import { describe, expect, it } from 'vitest';

import {
  ApproveExportDto,
  AuditTrailQuery,
  BiPanelDto,
  CompleteReportDto,
  ComparisonsQuery,
  CreateExportDto,
  FailReportDto,
  KpisQuery,
  PatchIndicatorConfigDto,
  RequestReportDto,
  ThresholdSchema,
  TransparencyAuditDto,
} from '../../src/handwritten/surface/dto.js';

const SHA256 = 'a'.repeat(64);

/** §9.2 — conjunto fechado de recortes (OD-D48); `ReportType` = o mesmo conjunto. */
const SCOPES = [
  'alerts',
  'duties',
  'indicators',
  'sources',
  'comparisons',
  'kpis',
  'audit-trail',
] as const;

function ok(
  schema: { safeParse: (v: unknown) => { success: boolean } },
  value: unknown,
): boolean {
  return schema.safeParse(value).success;
}

describe('CTG-0002 §3.5/§9.2 — CreateExportDto e ApproveExportDto (C-0002-88 [unit])', () => {
  it('C-0002-88 — dado { scope, format } com cada recorte de §9.2 então aceito; filters default {}; rows ≥ 0 opcional; purpose opcional', () => {
    for (const scope of SCOPES) {
      const parsed = CreateExportDto.safeParse({ scope, format: 'csv' });
      expect(parsed.success, scope).toBe(true);
      if (parsed.success)
        expect((parsed.data as { filters: unknown }).filters).toEqual({});
    }
    expect(
      ok(CreateExportDto, { scope: 'alerts', format: 'json', rows: 0 }),
    ).toBe(true);
    expect(
      ok(CreateExportDto, {
        scope: 'alerts',
        format: 'json',
        purpose: 'supervisao',
      }),
    ).toBe(true);
  });

  it('C-0002-88 — dado scope fora de §9.2, rows negativo/decimal ou chave desconhecida (.strict()) então rejeitado', () => {
    expect(ok(CreateExportDto, { scope: 'crashes', format: 'csv' })).toBe(
      false,
    );
    expect(
      ok(CreateExportDto, { scope: 'alerts', format: 'csv', rows: -1 }),
    ).toBe(false);
    expect(
      ok(CreateExportDto, { scope: 'alerts', format: 'csv', rows: 1.5 }),
    ).toBe(false);
    expect(
      ok(CreateExportDto, { scope: 'alerts', format: 'csv', caseState: 'x' }),
    ).toBe(false);
    expect(ok(CreateExportDto, { scope: 'alerts' })).toBe(false);
  });

  it('C-0002-88 — dado format proprietário (xlsx) então o zod ACEITA a string (a regra 1 de §9.1 responde DASH.EXPORT_FORMAT_NOT_OPEN, não o enum)', () => {
    expect(ok(CreateExportDto, { scope: 'alerts', format: 'xlsx' })).toBe(true);
  });

  it('C-0002-90 — dado ApproveExportDto então justification obrigatória (1..2000) e nada mais', () => {
    expect(
      ok(ApproveExportDto, { justification: 'auditoria trimestral' }),
    ).toBe(true);
    expect(ok(ApproveExportDto, {})).toBe(false);
    expect(ok(ApproveExportDto, { justification: '' })).toBe(false);
    expect(ok(ApproveExportDto, { justification: 'x'.repeat(2001) })).toBe(
      false,
    );
    expect(
      ok(ApproveExportDto, { justification: 'ok', approvedBy: 'alguem' }),
    ).toBe(false);
  });
});

describe('CTG-0002 §6.3 — ThresholdSchema e PatchIndicatorConfigDto (C-0002-95 [unit])', () => {
  const threshold = {
    kind: 'target',
    metric: 'metric_value',
    direction: 'above',
    levels: { n1: 15 },
  };

  it('C-0002-95 — dado Threshold { kind target|ceiling, metric, direction above|below, levels { n1?, n2?, n3?, critical? } } então aceito; fora do conjunto então rejeitado', () => {
    expect(ok(ThresholdSchema, threshold)).toBe(true);
    expect(ok(ThresholdSchema, { ...threshold, kind: 'ceiling' })).toBe(true);
    expect(ok(ThresholdSchema, { ...threshold, direction: 'below' })).toBe(
      true,
    );
    expect(
      ok(ThresholdSchema, {
        ...threshold,
        levels: { n1: 1, n2: 2, n3: 3, critical: 4 },
      }),
    ).toBe(true);
    expect(ok(ThresholdSchema, { ...threshold, kind: 'meta' })).toBe(false);
    expect(ok(ThresholdSchema, { ...threshold, direction: 'sideways' })).toBe(
      false,
    );
    expect(ok(ThresholdSchema, { ...threshold, levels: { n4: 1 } })).toBe(
      false,
    );
    expect(ok(ThresholdSchema, { ...threshold, metric: 1 })).toBe(false);
  });

  it('C-0002-95 — dado PATCH com ≥ 1 campo (name, description, formula, granularity, thresholdJson|null, acceptableLatencyMinutes int > 0|null) então aceito; vazio ou latência 0/decimal ou chave desconhecida então rejeitado', () => {
    expect(ok(PatchIndicatorConfigDto, { name: 'x' })).toBe(true);
    expect(ok(PatchIndicatorConfigDto, { thresholdJson: threshold })).toBe(
      true,
    );
    expect(ok(PatchIndicatorConfigDto, { thresholdJson: null })).toBe(true);
    expect(ok(PatchIndicatorConfigDto, { acceptableLatencyMinutes: 60 })).toBe(
      true,
    );
    expect(
      ok(PatchIndicatorConfigDto, { acceptableLatencyMinutes: null }),
    ).toBe(true);
    expect(ok(PatchIndicatorConfigDto, {})).toBe(false);
    expect(ok(PatchIndicatorConfigDto, { acceptableLatencyMinutes: 1.5 })).toBe(
      false,
    );
    expect(ok(PatchIndicatorConfigDto, { status: 'published' })).toBe(false);
    expect(ok(PatchIndicatorConfigDto, { indicatorCode: 'IND-DASH-999' })).toBe(
      false,
    );
  });

  // `acceptableLatencyMinutes: 0` é rejeitado ANTES do serviço? Não: §3.3
  // manda 400 `DASH.INDICATOR_LATENCY_INVALID` com `context.block/range`, o que
  // exige conhecer o bloco do indicador — logo o zod aceita inteiros ≥ 0 e a
  // regra do serviço responde (e2e C-0002-95). Só o decimal/negativo cai aqui.
  it('C-0002-95 — dado acceptableLatencyMinutes negativo então rejeitado pelo zod', () => {
    expect(ok(PatchIndicatorConfigDto, { acceptableLatencyMinutes: -1 })).toBe(
      false,
    );
  });
});

describe('CTG-0002 §3.3 — BiPanelDto (C-0002-96 [unit])', () => {
  it('C-0002-96 — dado { name 1..160, description?, visibilityProfile N0|N1|N2, configJson object } então aceito; N3 no enum, nome vazio, configJson não-objeto ou chave desconhecida então rejeitado', () => {
    expect(
      ok(BiPanelDto, {
        name: 'painel',
        visibilityProfile: 'N1',
        configJson: {},
      }),
    ).toBe(true);
    expect(
      ok(BiPanelDto, {
        name: 'painel',
        description: 'd',
        visibilityProfile: 'N2',
        configJson: { widgets: [] },
      }),
    ).toBe(true);
    // N3 é recusado antes do enum pelo gate (403 LAYER_N3_NEVER); no zod
    // também não é um valor válido.
    expect(
      ok(BiPanelDto, {
        name: 'painel',
        visibilityProfile: 'N3',
        configJson: {},
      }),
    ).toBe(false);
    expect(
      ok(BiPanelDto, { name: '', visibilityProfile: 'N1', configJson: {} }),
    ).toBe(false);
    expect(
      ok(BiPanelDto, {
        name: 'x'.repeat(161),
        visibilityProfile: 'N1',
        configJson: {},
      }),
    ).toBe(false);
    expect(
      ok(BiPanelDto, {
        name: 'painel',
        visibilityProfile: 'N1',
        configJson: [],
      }),
    ).toBe(false);
    expect(
      ok(BiPanelDto, {
        name: 'painel',
        visibilityProfile: 'N1',
        configJson: {},
        status: 'published',
      }),
    ).toBe(false);
  });
});

describe('CTG-0002 §3.3/§10.7 — RequestReportDto, CompleteReportDto, FailReportDto (C-0002-94 [unit])', () => {
  it('C-0002-94 — dado { reportType ∈ ReportType, filters?, layer N0|N1|N2, purpose? } então aceito; reportType fora, layer N3, chave desconhecida então rejeitado', () => {
    for (const reportType of SCOPES)
      expect(
        ok(RequestReportDto, { reportType, layer: 'N0' }),
        reportType,
      ).toBe(true);
    expect(
      ok(RequestReportDto, {
        reportType: 'alerts',
        layer: 'N2',
        purpose: 'supervisao',
        filters: { state: 'NOTIFICADO' },
      }),
    ).toBe(true);
    expect(ok(RequestReportDto, { reportType: 'x', layer: 'N0' })).toBe(false);
    expect(ok(RequestReportDto, { reportType: 'alerts' })).toBe(false);
    expect(
      ok(RequestReportDto, {
        reportType: 'alerts',
        layer: 'N0',
        caseState: 'x',
      }),
    ).toBe(false);
  });

  it('C-0002-94 — dado CompleteReportDto { fileUri url, fileHash string } então aceito; fileUri não-url ou ausente então rejeitado (o hash ≠ sha256 é 422 do serviço, não do zod)', () => {
    expect(
      ok(CompleteReportDto, {
        fileUri: 'https://fixtures.detran-am.invalid/r.csv',
        fileHash: SHA256,
      }),
    ).toBe(true);
    expect(
      ok(CompleteReportDto, { fileUri: 'nao-e-url', fileHash: SHA256 }),
    ).toBe(false);
    expect(ok(CompleteReportDto, { fileHash: SHA256 })).toBe(false);
    expect(
      ok(CompleteReportDto, {
        fileUri: 'https://fixtures.detran-am.invalid/r.csv',
      }),
    ).toBe(false);
  });

  it('C-0002-94 — dado FailReportDto { failureCode 1..80 } então aceito; vazio, > 80 ou chave extra então rejeitado', () => {
    expect(ok(FailReportDto, { failureCode: 'gerador-indisponivel' })).toBe(
      true,
    );
    expect(ok(FailReportDto, { failureCode: '' })).toBe(false);
    expect(ok(FailReportDto, { failureCode: 'x'.repeat(81) })).toBe(false);
    expect(ok(FailReportDto, { failureCode: 'x', note: 'y' })).toBe(false);
  });
});

describe('CTG-0002 §3.6/§10.4 — TransparencyAuditDto (C-0002-99 [unit])', () => {
  it('C-0002-99 — dado { period YYYY-MM, checklist object, result 1..40, notes? } então aceito; period 2026-9, result vazio, checklist ausente então rejeitado', () => {
    expect(
      ok(TransparencyAuditDto, {
        period: '2026-08',
        checklist: {},
        result: 'conforme',
      }),
    ).toBe(true);
    expect(
      ok(TransparencyAuditDto, {
        period: '2026-08',
        checklist: { datasets: [] },
        result: 'conforme',
        notes: 'n',
      }),
    ).toBe(true);
    expect(
      ok(TransparencyAuditDto, {
        period: '2026-9',
        checklist: {},
        result: 'conforme',
      }),
    ).toBe(false);
    expect(
      ok(TransparencyAuditDto, {
        period: '2026-08',
        checklist: {},
        result: '',
      }),
    ).toBe(false);
    expect(
      ok(TransparencyAuditDto, { period: '2026-08', result: 'conforme' }),
    ).toBe(false);
    expect(
      ok(TransparencyAuditDto, {
        period: '2026-08',
        checklist: {},
        result: 'x'.repeat(41),
      }),
    ).toBe(false);
  });
});

describe('CTG-0002 §3.6/§10.2–§10.5 — ComparisonsQuery, AuditTrailQuery, KpisQuery (C-0002-98/99 [unit])', () => {
  it('C-0002-98 — dado ComparisonsQuery { dimension pool|circuit|unit|clinic, from?, to?, orderBy? count|label, person? } então aceito; dimension ausente/fora ou orderBy fora então rejeitado', () => {
    for (const dimension of ['pool', 'circuit', 'unit', 'clinic'])
      expect(ok(ComparisonsQuery, { dimension }), dimension).toBe(true);
    expect(ok(ComparisonsQuery, { dimension: 'pool', orderBy: 'count' })).toBe(
      true,
    );
    expect(ok(ComparisonsQuery, { dimension: 'pool', orderBy: 'label' })).toBe(
      true,
    );
    expect(ok(ComparisonsQuery, {})).toBe(false);
    expect(ok(ComparisonsQuery, { dimension: 'pessoa' })).toBe(false);
    expect(ok(ComparisonsQuery, { dimension: 'pool', orderBy: 'name' })).toBe(
      false,
    );
  });

  it('C-0002-98 — dado AuditTrailQuery { object?, indicator?, app?, from?, to?, kind? access|alert, page?, pageSize ≤ 200 } então aceito; kind fora ou pageSize 201 então rejeitado', () => {
    expect(ok(AuditTrailQuery, {})).toBe(true);
    expect(ok(AuditTrailQuery, { kind: 'access' })).toBe(true);
    expect(
      ok(AuditTrailQuery, { kind: 'alert', indicator: 'IND-DASH-101' }),
    ).toBe(true);
    expect(ok(AuditTrailQuery, { kind: 'export' })).toBe(false);
    expect(ok(AuditTrailQuery, { pageSize: 201 })).toBe(false);
    expect(ok(AuditTrailQuery, { pageSize: 200 })).toBe(true);
  });

  it('C-0002-99 — dado KpisQuery { from?, to? } então aceito; from 2026-13 então rejeitado', () => {
    expect(ok(KpisQuery, {})).toBe(true);
    expect(ok(KpisQuery, { from: '2026-09-01', to: '2026-09-30' })).toBe(true);
    expect(ok(KpisQuery, { from: '2026-13' })).toBe(false);
    expect(ok(KpisQuery, { period: 'x' })).toBe(false);
  });
});
