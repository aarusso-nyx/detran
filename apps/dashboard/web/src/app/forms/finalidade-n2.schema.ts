// Finalidade N2 (`LayerGate`; contrato CTG-0002.md §Decisões 3 "Finalidade N2"; §11). Sem
// comando: registra a consulta pelo cabeçalho `X-Purpose` ([RN-DASH-171]).
import { z } from 'zod';
import type { FormGate } from './form-gate.js';
import { PURPOSE_TOKENS } from './form-gate.js';
import type { PurposeToken } from './form-gate.js';

// OD-D16-008: os 6 tokens vivem em `form-gate.ts` (a folha comum) porque `exportar.schema.ts`
// também os usa e nenhum schema pode importar outro (§14.2 regra 1, C-02-83); reexportados
// aqui porque o contrato §11 e o critério C-02-88 os endereçam por `finalidade-n2`.
export { PURPOSE_TOKENS };
export type { PurposeToken };

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
