// Finalidade N2 (`LayerGate`; contrato CTG-0002.md §Decisões 3 "Finalidade N2"; §11). Sem
// comando: registra a consulta pelo cabeçalho `X-Purpose` ([RN-DASH-171]).
import { z } from 'zod';
import type { FormGate } from './form-gate.js';

// OD-D16-008: os 6 tokens, mesma ordem de `shared/models.ts` `PURPOSE_TOKENS` — duplicado
// literalmente (fronteiras disjuntas de §14.2); igualdade provada pelo Inspector em
// `schemas-matrix.spec.ts` (C-02-93).
export const PURPOSE_TOKENS = [
  'supervisao',
  'auditoria',
  'apuracao',
  'resposta_ao_titular',
  'estatistica',
  'suporte',
] as const;

export type PurposeToken = (typeof PURPOSE_TOKENS)[number];

export const FinalidadeN2Schema = z.strictObject({
  purpose: z.enum(PURPOSE_TOKENS),
  reference: z.string().min(1),
});

export type FinalidadeN2Body = z.infer<typeof FinalidadeN2Schema>;

export const FINALIDADE_N2_GATE: FormGate = {
  policy: null,
  precondition: {
    state: null,
    note: 'obrigatório',
    violation: 'DASH.PURPOSE_REQUIRED',
    warning: null,
  },
  command: null,
  effect: 'cabeçalho X-Purpose; consulta registrada ([RN-DASH-171])',
};
