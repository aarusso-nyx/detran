// Meus dados / LGPD (contrato CTG-0003a §6.2; schema JSON `lgpd_declaracao`). Escopos avançados
// têm actKey próprio (`lgpd_declaracao:declaracao_completa` etc.) via `canPerform`.
import { z } from 'zod';
import type { FormGate } from './form-gate';

export const MeusDadosSchema = z.strictObject({
  scope: z.enum([
    'confirmacao',
    'declaracao_completa',
    'correcao',
    'eliminacao',
  ]),
  fields: z.array(z.string()).optional(),
});

export type MeusDadosBody = z.infer<typeof MeusDadosSchema>;

export const MEUS_DADOS_GATE: FormGate = {
  serviceKey: 'lgpd_declaracao',
  actKey: 'lgpd_declaracao',
  minimumAssurance: 'simples',
  precondition: {
    state: null,
    timer: null,
    note: 'declaração completa exige avançada',
    violation: 'PORTAL.PRIVACY_SCOPE_REQUIRES_ASSURANCE',
    warning: null,
  },
  command: 'submit',
  effect: '@stynx-nyx/privacy (/privacy/exports)',
};
