// Recurso à JARI (contrato CTG-0003a §6.2; schema JSON `recurso_jari`). Só orienta (M12).
import { z } from 'zod';
import type { FormGate } from './form-gate';

export const RecursoJariSchema = z.strictObject({
  grounds: z.string().min(1),
  attachmentIds: z.array(z.uuid()),
});

export type RecursoJariBody = z.infer<typeof RecursoJariSchema>;

export const RECURSO_JARI_GATE: FormGate = {
  serviceKey: 'recurso_jari',
  actKey: 'recurso_jari',
  minimumAssurance: 'avancada',
  precondition: {
    state: null,
    timer: 'T-NP-VENC',
    note: 'NP com T-NP-VENC aberto (intempestivo: avisa sem efeito suspensivo)',
    violation: null,
    warning: 'PORTAL.REQUEST_OUT_OF_DEADLINE',
  },
  command: 'submit',
  effect: 'PROTOCOLADO → inf:rait-case:protocol (instance=jari)',
};
