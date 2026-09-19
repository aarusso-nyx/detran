// Resposta a diligência (contrato CTG-0003a §6.2; `RequestDiligenceRespondDto`). Nível
// `simples` pela spec §7/manifesto #16 ([DIVERGE-12], OD-P67).
import { z } from 'zod';
import type { FormGate } from './form-gate';

export const RespostaDiligenciaSchema = z.strictObject({
  text: z.string().min(1),
  attachmentIds: z.array(z.uuid()),
});

export type RespostaDiligenciaBody = z.infer<typeof RespostaDiligenciaSchema>;

export const RESPOSTA_DILIGENCIA_GATE: FormGate = {
  serviceKey: null,
  actKey: null,
  minimumAssurance: 'simples',
  precondition: {
    state: 'open',
    timer: null,
    note: 'diligência open; prazo visível; prorrogação uma vez',
    violation: 'PORTAL.DILIGENCE_NOT_OPEN',
    warning: null,
  },
  command: 'respond_diligence',
  effect: 'inf:rait-case:answer-inquiry',
};
