// Defesa prévia (contrato CTG-0003a §6.2; espelho de portal-request-draft.schema.json
// `defesa_previa` e de `RequestDraftUpdateDto`). Validação de forma só orienta (M12).
import { z } from 'zod';
import type { FormGate } from './form-gate';

export const DefesaPreviaSchema = z.strictObject({
  facts: z.string().min(1),
  grounds: z.string().min(1),
  attachmentIds: z.array(z.uuid()),
  requestType: z.enum(['cancelamento', 'outro']),
});

export type DefesaPreviaBody = z.infer<typeof DefesaPreviaSchema>;

export const DEFESA_PREVIA_GATE: FormGate = {
  serviceKey: 'defesa_previa',
  actKey: 'defesa_previa',
  minimumAssurance: 'avancada',
  precondition: {
    state: 'NOTIFICADO_AUTUACAO',
    timer: 'T-DEF',
    note: 'AIT em NOTIFICADO_AUTUACAO com T-DEF aberto (fora do prazo: protocola e avisa)',
    violation: null,
    warning: 'PORTAL.REQUEST_OUT_OF_DEADLINE',
  },
  command: 'submit',
  effect: 'PROTOCOLADO → inf:rait-case:protocol (instance=defesa_previa)',
};
