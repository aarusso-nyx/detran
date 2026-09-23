// Avançar ciclo do dever (D-09; contrato CTG-0002.md §Decisões 3 "Avançar ciclo do dever";
// §11). OD-D16-011 ([UC-DASH-003] AC-DASH-003-1): em `COMPROVADO`, ao menos um de
// `protocol`/`captureUri`/`hash` (três casos isolados, todos válidos); `hash`, quando presente,
// sha-256 hex em qualquer `targetState`.
import { z } from 'zod';
import type { FormGate } from './form-gate.js';
import { SHA256_HEX } from './form-gate.js';

export const DUTY_TARGET_STATES = [
  'JANELA_ABERTA',
  'EM_APURACAO',
  'PREPARADO',
  'SUBMETIDO_PUBLICADO',
  'COMPROVADO',
  'ARQUIVADO',
  'ATRASADO',
  'NAO_CUMPRIDO',
] as const; // [WF-DASH-002] §Estados (8)

export type DutyTargetState = (typeof DUTY_TARGET_STATES)[number];

export const DutyEvidenceSchema = z.strictObject({
  protocol: z.string().min(1).optional(),
  captureUri: z.string().min(1).optional(),
  hash: z.string().regex(SHA256_HEX).optional(),
});

export type DutyEvidenceBody = z.infer<typeof DutyEvidenceSchema>;

export const AvancarCicloSchema = z
  .strictObject({
    targetState: z.enum(DUTY_TARGET_STATES),
    draftRef: z.string().optional(),
    submittedAt: z.iso.datetime({ offset: true }).optional(),
    protocol: z.string().optional(),
    evidence: DutyEvidenceSchema.optional(),
  })
  .refine(
    (body) =>
      body.targetState !== 'COMPROVADO' ||
      Boolean(
        body.evidence &&
        (body.evidence.protocol ||
          body.evidence.captureUri ||
          body.evidence.hash),
      ),
    { path: ['evidence'], message: 'DASH.DUTY_EVIDENCE_REQUIRED' },
  );

export type AvancarCicloBody = z.infer<typeof AvancarCicloSchema>;

export const AVANCAR_CICLO_GATES: Readonly<Record<DutyTargetState, FormGate>> =
  {
    JANELA_ABERTA: {
      policy: null,
      precondition: {
        state: null,
        note: 'transição de sistema (contrato §3) — sem comando',
        violation: 'DASH.DUTY_STATE_INVALID',
        warning: null,
      },
      command: null,
      effect: 'transição de sistema (contrato §3) — sem comando',
    },
    EM_APURACAO: {
      policy: 'dashboard:duty-cycle:start',
      precondition: {
        state: 'JANELA_ABERTA',
        note: 'JANELA_ABERTA → EM_APURACAO',
        violation: 'DASH.DUTY_STATE_INVALID',
        warning: null,
      },
      command: 'duty-cycle:start',
      effect: 'JANELA_ABERTA → EM_APURACAO',
    },
    PREPARADO: {
      policy: 'dashboard:duty-cycle:prepare',
      precondition: {
        state: 'EM_APURACAO',
        note: 'EM_APURACAO → PREPARADO',
        violation: 'DASH.DUTY_STATE_INVALID',
        warning: null,
      },
      command: 'duty-cycle:prepare',
      effect: 'EM_APURACAO → PREPARADO',
    },
    SUBMETIDO_PUBLICADO: {
      policy: 'dashboard:duty-cycle:submit',
      precondition: {
        state: 'PREPARADO | ATRASADO',
        note: 'PREPARADO | ATRASADO → SUBMETIDO_PUBLICADO',
        violation: 'DASH.DUTY_STATE_INVALID',
        warning: null,
      },
      command: 'duty-cycle:submit',
      effect: 'PREPARADO | ATRASADO → SUBMETIDO_PUBLICADO',
    },
    COMPROVADO: {
      policy: 'dashboard:duty-cycle:prove',
      precondition: {
        state: 'SUBMETIDO_PUBLICADO',
        note: 'SUBMETIDO_PUBLICADO → COMPROVADO (evidência obrigatória — protocolo, captura ou hash)',
        violation: 'DASH.DUTY_EVIDENCE_REQUIRED',
        warning: null,
      },
      command: 'duty-cycle:prove',
      effect: 'SUBMETIDO_PUBLICADO → COMPROVADO',
    },
    ARQUIVADO: {
      policy: 'dashboard:duty-cycle:archive',
      precondition: {
        state: 'COMPROVADO',
        note: 'COMPROVADO → ARQUIVADO',
        violation: 'DASH.DUTY_ALREADY_ARCHIVED',
        warning: null,
      },
      command: 'duty-cycle:archive',
      effect: 'COMPROVADO → ARQUIVADO',
    },
    ATRASADO: {
      policy: null,
      precondition: {
        state: null,
        note: 'transição de sistema (contrato §3) — sem comando',
        violation: 'DASH.DUTY_STATE_INVALID',
        warning: null,
      },
      command: null,
      effect: 'transição de sistema (contrato §3) — sem comando',
    },
    NAO_CUMPRIDO: {
      policy: null,
      precondition: {
        state: null,
        note: 'transição de sistema (contrato §3) — sem comando',
        violation: 'DASH.DUTY_STATE_INVALID',
        warning: null,
      },
      command: null,
      effect: 'transição de sistema (contrato §3) — sem comando',
    },
  };
