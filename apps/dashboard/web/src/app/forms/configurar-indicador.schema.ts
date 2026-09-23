// Configurar indicador (D-14; contrato CTG-0002.md §Decisões 3 "Configurar indicador"; §11).
// Dois gates: `update` (rascunho) e `publish` (vigente; evento `IndicatorConfigChanged`).
import { z } from 'zod';
import type { FormGate } from './form-gate.js';

export const ConfigurarIndicadorSchema = z.strictObject({
  threshold: z.string().min(1), // source_pending: calibração (OD-D16-017)
  owner: z.string().min(1),
  acceptableLatency: z.string().min(1), // source_pending: formato (OD-D16-017)
  classification: z.enum(['P1', 'P2', 'P3']),
  staleStrategy: z.enum(['hide', 'mark']),
});

export type ConfigurarIndicadorBody = z.infer<typeof ConfigurarIndicadorSchema>;

export const CONFIGURAR_INDICADOR_GATES: Readonly<{
  update: FormGate;
  publish: FormGate;
}> = {
  update: {
    policy: 'dashboard:indicator-config:update',
    precondition: {
      state: null,
      note: 'classificação obrigatória',
      violation: null,
      warning: null,
    },
    command: 'indicator-config:update',
    effect: 'rascunho',
  },
  publish: {
    policy: 'dashboard:indicator-config:publish',
    precondition: {
      state: null,
      note: 'classificação obrigatória',
      violation: 'DASH.CLASSIFICATION_MISSING',
      warning: null,
    },
    command: 'indicator-config:publish',
    effect: 'vigente; IndicatorConfigChanged',
  },
};
