// Elevação de nível (contrato CTG-0003a §6.2; `AssuranceElevationCreateDto`; T27 §6).
import { z } from 'zod';
import type { FormGate } from './form-gate';

export const ElevacaoSchema = z.strictObject({
  targetLevel: z.literal('avancada'),
  method: z.enum(['biographic', 'biometric', 'icp']),
  resumeRoute: z.string().min(1),
});

export type ElevacaoBody = z.infer<typeof ElevacaoSchema>;

export const ELEVACAO_GATE: FormGate = {
  serviceKey: null,
  actKey: null,
  minimumAssurance: 'simples',
  precondition: {
    state: null,
    timer: null,
    note: 'redirect gov.br com resume; prazo legal não pausa (AC-4a)',
    violation: null,
    warning: null,
  },
  command: 'elevate',
  effect: 'NIVEL_ASSINATURA_ELEVADO',
};
