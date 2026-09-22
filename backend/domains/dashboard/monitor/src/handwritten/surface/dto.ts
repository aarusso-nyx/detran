// DTOs zod da superfície do DASHBOARD (CTG-0002 §3 — payloads `.strict()`;
// §6.3 `Threshold` (OD-D42); §9.2 `ExportScope`/`ReportType` (OD-D48); §10
// queries). Só a forma: a tradução de um `safeParse` falho para
// `DASH.VALIDATION_FAILED` / `DASH.ENUM_INVALID` (e para os códigos
// específicos que §3 cita por campo) é do controller. Os DTOs dos comandos
// do ciclo (`AckAlertDto`, …) vivem em `cycle/dto.ts` (§14.1) e não são
// duplicados aqui.
import { z } from 'zod';

export const DASHBOARD_LAYERS = ['N0', 'N1', 'N2'] as const;
export const LayerSchema = z.enum(DASHBOARD_LAYERS);

/** §9.2 — conjunto fechado de recortes (OD-D48); `ReportType` = o mesmo conjunto. */
export const EXPORT_SCOPES = [
  'alerts',
  'duties',
  'indicators',
  'sources',
  'comparisons',
  'kpis',
  'audit-trail',
] as const;
export type ExportScope = (typeof EXPORT_SCOPES)[number];
export const REPORT_TYPES = EXPORT_SCOPES;
export type ReportType = ExportScope;

/** Formatos abertos ([RN-DASH-151] req. 1; §9.1 regra "formato aberto"). */
export const OPEN_EXPORT_FORMATS = ['csv', 'json'] as const;
export type OpenExportFormat = (typeof OPEN_EXPORT_FORMATS)[number];

/** Chaves de recorte reservadas a N3 (§9.1 regra 4 — examinadas no corpo bruto). */
export const N3_RESERVED_FILTER_KEYS = [
  'includeHealth',
  'includeSensitive',
  'includeBiometrics',
  'includeEvidence',
] as const;

const INDICATOR_CODE = /^IND-DASH-\d{3}$/;
const PERIOD_MONTH = /^\d{4}-\d{2}$/;
const ISO_DATE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

const JsonObject = z.record(z.string(), z.unknown());

const pageSchema = z.coerce.number().int().min(1).optional();
const pageSizeSchema = z.coerce.number().int().min(1).max(200).optional();

/** `?flag=true|false` (query string) ou booleano (corpo). */
const QueryBoolean = z.union([
  z.boolean(),
  z.enum(['true', 'false']).transform((value): boolean => value === 'true'),
]);

// ---------------------------------------------------------------------------
// queries de leitura (§3.1–§3.7)
// ---------------------------------------------------------------------------

export const AlertsQuery = z
  .object({
    state: z.string().min(1).optional(),
    severity: z.string().min(1).optional(),
    block: z.enum(['A', 'B', 'C', 'D']).optional(),
    indicator: z.string().regex(INDICATOR_CODE).optional(),
    app: z.string().min(1).optional(),
    owner: z.string().min(1).optional(),
    unit: z.string().min(1).optional(),
    pool: z.uuid().optional(),
    layer: z.enum(['N1', 'N2']).optional(),
    page: pageSchema,
    pageSize: pageSizeSchema,
  })
  .strict();
export type AlertsQueryInput = z.infer<typeof AlertsQuery>;

export const DutiesQuery = z
  .object({
    scope: z.string().min(1).optional(),
    mvp: QueryBoolean.optional(),
  })
  .strict();

export const DutyCyclesQuery = z
  .object({
    state: z.string().min(1).optional(),
    page: pageSchema,
    pageSize: pageSizeSchema,
  })
  .strict();

export const IndicatorsQuery = z
  .object({
    block: z.enum(['A', 'B', 'C', 'D']).optional(),
    app: z.string().min(1).optional(),
    connected: QueryBoolean.optional(),
    classification: z.enum(['P1', 'P2', 'P3']).optional(),
    page: pageSchema,
    pageSize: pageSizeSchema,
  })
  .strict();

export const IndicatorConfigsQuery = z
  .object({
    indicator: z.string().regex(INDICATOR_CODE).optional(),
    status: z.enum(['draft', 'published']).optional(),
    page: pageSchema,
    pageSize: pageSizeSchema,
  })
  .strict();

export const BiPanelsQuery = z
  .object({
    status: z.enum(['draft', 'published']).optional(),
    visibilityProfile: z.string().min(1).optional(),
    page: pageSchema,
    pageSize: pageSizeSchema,
  })
  .strict();

export const ReportsQuery = z
  .object({
    status: z.enum(['processing', 'completed', 'failed']).optional(),
    reportType: z.string().min(1).optional(),
    page: pageSchema,
    pageSize: pageSizeSchema,
  })
  .strict();

export const SourcesQuery = z
  .object({
    app: z.string().min(1).optional(),
    state: z.string().min(1).optional(),
    hidden: QueryBoolean.optional(),
    page: pageSchema,
    pageSize: pageSizeSchema,
  })
  .strict();

export const TransparencyChecklistQuery = z
  .object({ period: z.string().regex(PERIOD_MONTH).optional() })
  .strict();

// ---------------------------------------------------------------------------
// exportação (§3.5, §9)
// ---------------------------------------------------------------------------

export const CreateExportDto = z
  .object({
    scope: z.enum(EXPORT_SCOPES),
    filters: JsonObject.default({}),
    /** Validado pela regra 1 de §9.1 (`DASH.EXPORT_FORMAT_NOT_OPEN`), não por enum. */
    format: z.string().min(1),
    purpose: z.string().min(1).optional(),
    rows: z.number().int().min(0).optional(),
  })
  .strict();
export type CreateExportInput = z.infer<typeof CreateExportDto>;

export const ApproveExportDto = z
  .object({ justification: z.string().min(1).max(2000) })
  .strict();
export type ApproveExportInput = z.infer<typeof ApproveExportDto>;

// ---------------------------------------------------------------------------
// catálogo: configuração de indicador e painéis (§3.3, §6.3)
// ---------------------------------------------------------------------------

export const ThresholdSchema = z
  .object({
    kind: z.enum(['target', 'ceiling']),
    metric: z.string().min(1),
    direction: z.enum(['above', 'below']),
    levels: z
      .object({
        n1: z.number().optional(),
        n2: z.number().optional(),
        n3: z.number().optional(),
        critical: z.number().optional(),
      })
      .strict(),
  })
  .strict();
export type Threshold = z.infer<typeof ThresholdSchema>;

const atLeastOneField = (value: Record<string, unknown>): boolean =>
  Object.values(value).some((field) => field !== undefined);

export const PatchIndicatorConfigDto = z
  .object({
    name: z.string().min(1).max(160).optional(),
    description: z.string().optional(),
    formula: z.string().min(1).optional(),
    granularity: z.string().min(1).max(60).optional(),
    thresholdJson: ThresholdSchema.nullable().optional(),
    /** `0` passa aqui e cai em `DASH.INDICATOR_LATENCY_INVALID` no serviço (§3.3). */
    acceptableLatencyMinutes: z.number().int().min(0).nullable().optional(),
  })
  .strict()
  .refine(atLeastOneField, { message: 'ao menos um campo' });
export type PatchIndicatorConfigInput = z.infer<typeof PatchIndicatorConfigDto>;

export const BiPanelDto = z
  .object({
    name: z.string().min(1).max(160),
    description: z.string().optional(),
    visibilityProfile: LayerSchema,
    configJson: JsonObject,
  })
  .strict();
export type BiPanelInput = z.infer<typeof BiPanelDto>;

export const PatchBiPanelDto = z
  .object({
    name: z.string().min(1).max(160).optional(),
    description: z.string().optional(),
    visibilityProfile: LayerSchema.optional(),
    configJson: JsonObject.optional(),
  })
  .strict()
  .refine(atLeastOneField, { message: 'ao menos um campo' });
export type PatchBiPanelInput = z.infer<typeof PatchBiPanelDto>;

// ---------------------------------------------------------------------------
// relatórios (§3.3, §10.7)
// ---------------------------------------------------------------------------

export const RequestReportDto = z
  .object({
    reportType: z.enum(REPORT_TYPES),
    filters: JsonObject.optional(),
    layer: LayerSchema,
    purpose: z.string().min(1).optional(),
  })
  .strict();
export type RequestReportInput = z.infer<typeof RequestReportDto>;

export const CompleteReportDto = z
  .object({
    fileUri: z.url(),
    /** `^[0-9a-f]{64}$` é 422 `DASH.REPORT_FILE_HASH_MISMATCH` do serviço, não do zod. */
    fileHash: z.string().min(1),
  })
  .strict();
export type CompleteReportInput = z.infer<typeof CompleteReportDto>;

export const FailReportDto = z
  .object({ failureCode: z.string().min(1).max(80) })
  .strict();
export type FailReportInput = z.infer<typeof FailReportDto>;

// ---------------------------------------------------------------------------
// auditoria, comparativos, transparência, kpis (§3.6, §10.2–§10.5)
// ---------------------------------------------------------------------------

export const TransparencyAuditDto = z
  .object({
    period: z.string().regex(PERIOD_MONTH),
    checklist: JsonObject,
    result: z.string().min(1).max(40),
    notes: z.string().optional(),
  })
  .strict();
export type TransparencyAuditInput = z.infer<typeof TransparencyAuditDto>;

export const COMPARISON_DIMENSIONS = [
  'pool',
  'circuit',
  'unit',
  'clinic',
] as const;
export type ComparisonDimension = (typeof COMPARISON_DIMENSIONS)[number];

export const ComparisonsQuery = z
  .object({
    dimension: z.enum(COMPARISON_DIMENSIONS),
    from: z.string().min(1).optional(),
    to: z.string().min(1).optional(),
    orderBy: z.enum(['count', 'label']).optional(),
    person: QueryBoolean.optional(),
  })
  .strict();
export type ComparisonsQueryInput = z.infer<typeof ComparisonsQuery>;

export const AuditTrailQuery = z
  .object({
    object: z.string().min(1).optional(),
    indicator: z.string().regex(INDICATOR_CODE).optional(),
    app: z.string().min(1).optional(),
    from: z.string().min(1).optional(),
    to: z.string().min(1).optional(),
    kind: z.enum(['access', 'alert']).optional(),
    page: pageSchema,
    pageSize: pageSizeSchema,
  })
  .strict();
export type AuditTrailQueryInput = z.infer<typeof AuditTrailQuery>;

export const KpisQuery = z
  .object({
    from: z.string().regex(ISO_DATE).optional(),
    to: z.string().regex(ISO_DATE).optional(),
  })
  .strict();
export type KpisQueryInput = z.infer<typeof KpisQuery>;

/** Paginação comum das listas (§3: `page`, `pageSize ≤ 200`). */
export const DEFAULT_PAGE_SIZE = 50;
export function pageOf(query: { page?: number; pageSize?: number }): {
  page: number;
  pageSize: number;
  offset: number;
} {
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? DEFAULT_PAGE_SIZE;
  return { page, pageSize, offset: (page - 1) * pageSize };
}
