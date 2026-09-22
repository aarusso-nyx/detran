// ACK do alerta (D-02; contrato CTG-0002.md §Decisões 3 "ACK do alerta"; §11). Validação de
// forma só orienta (M12 de R-0014).
import { z } from 'zod';
import type { FormGate } from './form-gate.js';

export const AckAlertaSchema = z
  .strictObject({
    channel: z.enum(['origin', 'manual']),
    note: z.string().optional(),
    onBehalfOf: z.string().optional(),
  })
  .refine(
    (body) =>
      body.channel !== 'manual' || Boolean(body.note && body.note.length > 0),
    { path: ['note'], message: 'DASH.ALERT_ACK_MANUAL_NOTE_REQUIRED' },
  );

export type AckAlertaBody = z.infer<typeof AckAlertaSchema>;

export const ACK_ALERTA_GATE: FormGate = {
  policy: 'dashboard:alert:ack',
  precondition: {
    state: 'NOTIFICADO',
    note: 'NOTIFICADO → RECONHECIDO',
    violation: 'DASH.ALERT_STATE_INVALID',
    warning: null,
  },
  command: 'alert:ack',
  effect: 'RECONHECIDO (manual marcado — registro manual de ciência)',
};
