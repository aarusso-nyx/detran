// Avaliação do atendimento (contrato CTG-0003a §6.2; `RequestEvaluateDto`). Escala das notas:
// source_pending (OD-P65) — só inteiros aqui.
import { z } from 'zod';
import type { FormGate } from './form-gate';

export const AvaliacaoSchema = z.strictObject({
  scores: z.strictObject({
    satisfaction: z.number().int(),
    quality: z.number().int(),
    deadline: z.number().int(),
    clarity: z.number().int(),
    channel: z.number().int(),
  }),
  comment: z.string().optional(),
});

export type AvaliacaoBody = z.infer<typeof AvaliacaoSchema>;

export const AVALIACAO_GATE: FormGate = {
  serviceKey: 'avaliar',
  actKey: 'avaliar',
  minimumAssurance: 'simples',
  precondition: {
    state: 'RESULTADO_DISPONIVEL | ENCERRADA',
    timer: null,
    note: 'após RESULTADO_DISPONIVEL/ENCERRADA',
    violation: 'PORTAL.EVALUATION_NOT_OFFERED',
    warning: null,
  },
  command: 'evaluate',
  effect: 'AVALIADA; alimenta citizen-service',
};
