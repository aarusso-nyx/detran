// Registrar causa raiz (D-07; contrato CTG-0002.md §Decisões 3 "Registrar causa raiz"; §11).
import { z } from 'zod';
import type { FormGate } from './form-gate.js';

export const CausaRaizSchema = z.strictObject({
  category: z.enum(['transport', 'acceptance', 'payload']),
  description: z.string().min(1),
});

export type CausaRaizBody = z.infer<typeof CausaRaizSchema>;

export const CAUSA_RAIZ_GATE: FormGate = {
  policy: 'dashboard:alert:annotate',
  precondition: {
    state: null,
    note: 'qualquer',
    violation: 'DASH.ROOT_CAUSE_CATEGORY_INVALID',
    warning: null,
  },
  command: 'alert:annotate',
  effect: 'nota na trilha',
};
