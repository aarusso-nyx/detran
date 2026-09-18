// Adesão ao SNE (contrato CTG-0003a §6.2; schema JSON `adesao_sne`). E-mail e celular são
// obrigatórios na submissão (spec §7; [DIVERGE-21]); `effectsAck` usa o enum do fio
// ([DIVERGE-2], OD-P61) — os textos do diálogo seguem A5.
import { z } from 'zod';
import type { FormGate } from './form-gate';

export const AdesaoSneSchema = z.strictObject({
  email: z.email(),
  phone: z.string().regex(/^\d{10,11}$/),
  consent: z.strictObject({
    textVersion: z.string().min(1),
    effectsAck: z
      .array(
        z.enum([
          'ciencia_ficta',
          'canal_exclusivo',
          'desconto_60',
          'cancelamento',
        ]),
      )
      .min(4),
  }),
});

export type AdesaoSneBody = z.infer<typeof AdesaoSneSchema>;

export const ADESAO_SNE_GATE: FormGate = {
  serviceKey: 'adesao_sne',
  actKey: 'adesao_sne',
  minimumAssurance: 'simples',
  precondition: {
    state: null,
    timer: null,
    note: 'contato obrigatório (sem e-mail/celular bloqueia)',
    violation: 'PORTAL.SNE_CONTACT_REQUIRED',
    warning: null,
  },
  command: 'submit',
  effect: 'SnePort.enrollCitizen → ADERIDO_SNE',
};
