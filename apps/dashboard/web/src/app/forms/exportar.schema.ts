// Exportar (D-10/D-11/D-16; contrato CTG-0002.md §Decisões 3 "Exportar"; §11). `format` fica
// `z.string()` — formatos abertos são `source_pending` até `BP-DASH-MONITOR-001` (R-0011) fixar
// a lista; o servidor decide (`DASH.EXPORT_FORMAT_NOT_OPEN`).
import { z } from 'zod';
import type { FormGate } from './form-gate.js';
import { PURPOSE_TOKENS } from './finalidade-n2.schema.js';

export const ExportarSchema = z.strictObject({
  scope: z.string().min(1),
  filters: z.record(z.string(), z.string()),
  format: z.string().min(1), // source_pending: formatos abertos de exportação, R-0011
  purpose: z.enum(PURPOSE_TOKENS).optional(),
  rows: z.number().int().nonnegative(),
  volumeJustification: z.string().optional(),
});

export type ExportarBody = z.infer<typeof ExportarSchema>;

export const EXPORTAR_GATE: FormGate = {
  policy: 'dashboard:export:create',
  precondition: {
    state: null,
    note: 'N3 vedado (servidor); acima de dashboard.export.approval_rows exige justificativa + aprovador',
    violation: 'DASH.EXPORT_LAYER_EXCEEDED',
    warning: 'DASH.EXPORT_VOLUME_APPROVAL_REQUIRED',
  },
  command: 'export:create',
  effect:
    'registro, marca d’água, supressão; acima do limite → pending-approval (D-17)',
};
