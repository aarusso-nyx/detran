// Desistência (contrato CTG-0003a §6.2; `RequestWithdrawDto`). Nível `simples` pelo manifesto
// #17 (OD-P52).
import { z } from 'zod';
import type { FormGate } from './form-gate';

export const DesistenciaSchema = z.strictObject({
  confirm: z.literal(true),
  reason: z.string().optional(),
});

export type DesistenciaBody = z.infer<typeof DesistenciaSchema>;

export const DESISTENCIA_GATE: FormGate = {
  serviceKey: null,
  actKey: null,
  minimumAssurance: 'simples',
  precondition: {
    state: null,
    timer: null,
    note: 'forma escrita · antes do julgamento (pautado hoje bloqueia)',
    violation: 'PORTAL.WITHDRAWAL_AFTER_JUDGMENT',
    warning: null,
  },
  command: 'withdraw',
  effect:
    'DESISTIDO (antes do protocolo) | inf:rait-case:withdraw → ENCERRADO_DESISTENCIA',
};
