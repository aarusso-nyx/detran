// Junta médica ou psicológica (contrato CTG-0003a §6.2; schema JSON `junta_medica`; OD-P19: fora
// do catálogo desta rodada). Código do timer: source_pending.
import { z } from 'zod';
import type { FormGate } from './form-gate';

export const JuntaMedicaSchema = z.strictObject({
  examId: z.uuid(),
  reason: z.string().min(1),
  attachmentIds: z.array(z.uuid()),
});

export type JuntaMedicaBody = z.infer<typeof JuntaMedicaSchema>;

export const JUNTA_MEDICA_GATE: FormGate = {
  serviceKey: 'junta_medica',
  actKey: 'junta_medica',
  minimumAssurance: 'avancada',
  precondition: {
    state: null,
    timer: null,
    note: '30 dias do conhecimento',
    violation: 'PORTAL.BOARD_REQUEST_WINDOW_CLOSED',
    warning: null,
  },
  command: 'submit',
  effect: 'delegação PEC (ch:...:request-board)',
};
