// Recurso ao CETRAN (contrato CTG-0003a §6.2; schema JSON `recurso_cetran`). Só orienta (M12).
import { z } from 'zod';
import type { FormGate } from './form-gate';

export const RecursoCetranSchema = z.strictObject({
  additionalText: z.string().optional(),
  attachmentIds: z.array(z.uuid()),
});

export type RecursoCetranBody = z.infer<typeof RecursoCetranSchema>;

export const RECURSO_CETRAN_GATE: FormGate = {
  serviceKey: 'recurso_cetran',
  actKey: 'recurso_cetran',
  minimumAssurance: 'avancada',
  precondition: {
    state: null,
    timer: 'T-R2',
    note: 'T-R2 aberto (vencido bloqueia com explicação)',
    violation: 'PORTAL.APPEAL_CETRAN_WINDOW_CLOSED',
    warning: null,
  },
  command: 'submit',
  effect: 'PROTOCOLADO → inf:rait-case:protocol (instance=cetran)',
};
