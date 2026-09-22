// Auditoria de transparência (D-12; contrato CTG-0002.md §Decisões 3 "Auditoria de
// transparência"; §11). Itens ausentes viram pendências (servidor); ciclo mensal do
// IND-DASH-209.
import { z } from 'zod';
import type { FormGate } from './form-gate.js';

export const AuditoriaTransparenciaSchema = z.strictObject({
  checklist: z
    .array(z.strictObject({ item: z.string().min(1), checked: z.boolean() }))
    .min(1),
  evidences: z.array(z.string().min(1)),
});

export type AuditoriaTransparenciaBody = z.infer<
  typeof AuditoriaTransparenciaSchema
>;

export const AUDITORIA_TRANSPARENCIA_GATE: FormGate = {
  policy: 'dashboard:transparency-audit:audit',
  precondition: {
    state: null,
    note: 'itens ausentes viram pendências',
    violation: 'DASH.DATASET_REQUIREMENTS_UNMET',
    warning: null,
  },
  command: 'transparency-audit:audit',
  effect: 'ciclo mensal do IND-DASH-209',
};
