// Indicação de condutor (contrato CTG-0003a §6.2; schema JSON `indicacao_condutor`). O CPF passa
// pela validação pública de dígitos verificadores (módulo 11) — forma que só orienta; o servidor
// decide (`PORTAL.INDICATION_DRIVER_INVALID { fields[] }`, T05 §5).
import { z } from 'zod';
import { ConsequenceAckSchema, type FormGate } from './form-gate';

/** Dígitos verificadores do CPF (módulo 11); sequências de um só dígito são inválidas. */
export function cpfCheckDigits(cpf: string): boolean {
  if (!/^\d{11}$/.test(cpf) || /^(\d)\1{10}$/.test(cpf)) return false;
  const digits = Array.from(cpf, Number);
  const verifier = (length: number): number => {
    const sum = digits
      .slice(0, length)
      .reduce((acc, digit, index) => acc + digit * (length + 1 - index), 0);
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };
  return verifier(9) === digits[9] && verifier(10) === digits[10];
}

export const IndicacaoCondutorSchema = z.strictObject({
  driver: z.strictObject({
    cpf: z
      .string()
      .regex(/^\d{11}$/)
      .refine(cpfCheckDigits),
    cnhNumber: z.string().min(1),
    cnhUf: z.string().length(2),
    category: z.string().min(1),
    name: z.string().min(1),
  }),
  signatures: z.strictObject({
    owner: z.enum(['govbr', 'upload']),
    driver: z.enum(['govbr', 'upload', 'pending']),
  }),
  consequenceAck: ConsequenceAckSchema,
});

export type IndicacaoCondutorBody = z.infer<typeof IndicacaoCondutorSchema>;

export const INDICACAO_CONDUTOR_GATE: FormGate = {
  serviceKey: 'indicacao_condutor',
  actKey: 'indicacao_condutor',
  minimumAssurance: 'avancada',
  precondition: {
    state: null,
    timer: 'T-IND',
    note: 'T-IND aberto',
    violation: 'PORTAL.INDICATION_WINDOW_CLOSED',
    warning: null,
  },
  command: 'submit',
  effect: 'PROTOCOLADO → inf:infraction:indicate-driver',
};
