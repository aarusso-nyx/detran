// Solicitar relatório (D-16; contrato CTG-0002.md §Decisões 3 "Solicitar relatório"; §11).
// `reportType` fica `z.string()` — o catálogo de tipos é `source_pending` até R-0011.
import { z } from 'zod';
import type { FormGate } from './form-gate.js';

export const SolicitarRelatorioSchema = z.strictObject({
  reportType: z.string().min(1), // source_pending: catálogo de tipos, R-0011
  filters: z.record(z.string(), z.string()),
});

export type SolicitarRelatorioBody = z.infer<typeof SolicitarRelatorioSchema>;

export const SOLICITAR_RELATORIO_GATE: FormGate = {
  policy: 'dashboard:generated-report:request',
  precondition: {
    state: null,
    note: 'tipo de catálogo',
    violation: 'DASH.REPORT_TYPE_INVALID',
    warning: null,
  },
  command: 'generated-report:request',
  effect: 'processing; ReportRequested',
};
