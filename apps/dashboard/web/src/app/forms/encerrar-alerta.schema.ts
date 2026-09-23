// Encerrar alerta (D-02; contrato CTG-0002.md §Decisões 3 "Encerrar alerta"; §11). Extinção
// fecha sozinha — este comando nunca se aplica à trilha `extincao` (botão inexistente na tela).
import { z } from 'zod';
import type { FormGate } from './form-gate.js';

export const EncerrarAlertaSchema = z.strictObject({
  confirmation: z.literal(true),
  note: z.string().optional(),
});

export type EncerrarAlertaBody = z.infer<typeof EncerrarAlertaSchema>;

export const ENCERRAR_ALERTA_GATE: FormGate = {
  policy: 'dashboard:alert:close',
  precondition: {
    state: 'VERIFICADO',
    note: 'só com evidência de origem (servidor)',
    violation: 'DASH.ALERT_CLOSE_WITHOUT_VERIFICATION',
    warning: null,
  },
  command: 'alert:close',
  effect: 'ENCERRADO (trilha irregularidade); extinção fecha sozinha',
};
