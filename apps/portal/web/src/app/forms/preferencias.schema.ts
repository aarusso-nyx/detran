// Preferências de notificação (contrato CTG-0003a §6.2; `PreferencesUpdateDto`). O comando
// (`PUT preferences`, If-Match) é do par 3.
import { z } from 'zod';
import type { FormGate } from './form-gate';

export const PreferenciasSchema = z.strictObject({
  channel: z.enum(['push', 'email', 'sne']),
  pushSubscription: z
    .strictObject({
      endpoint: z.url().optional(),
      keys: z
        .strictObject({
          p256dh: z.string().optional(),
          auth: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
});

export type PreferenciasBody = z.infer<typeof PreferenciasSchema>;

export const PREFERENCIAS_GATE: FormGate = {
  serviceKey: null,
  actKey: null,
  minimumAssurance: 'simples',
  precondition: {
    state: null,
    timer: null,
    note: '—',
    violation: null,
    warning: null,
  },
  command: 'update_preferences',
  effect: '@stynx-nyx/preferences (PUT preferences, If-Match)',
};
