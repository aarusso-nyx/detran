// Ato de suspensão (contrato CTG-0002c §4.14; `rait-web-forms.md` §15; spec §9 "Ato de
// suspensão"; ficha IU-RAIT-064 §6; [UC-RAIT-022]; [RN-RAIT-105]; [RN-RAIT-005];
// [WF-RAIT-001] §Relógios de extinção; catálogo §3.9). A suspensão nunca é automática: é ato
// motivado, com prova, e os prazos legais de extinção não são selecionáveis.
//
// Gate ATO_SUSPENSAO_GATE (agregado: ato de suspensão) — contrato §5.1 linha 23:
// | pré-estado | papéis                                | pré-condições                            | comando                    | pós-estado | errorCodes |
// | null       | rait-signing-authority, rait-chair    | prova de força maior (§7); nunca         | rait-suspension-act:create | vigente    | SUSPENSION_LEGAL_TIMER, SUSPENSION_EVIDENCE_REQUIRED,
// |            |                                       | automática, ato motivado e auditado      |                            |            | DEADLINE_LEGAL_READONLY, IDEMPOTENCY_REPLAY |
// |            |                                       | (ficha 064 §6; RN-RAIT-105)              |                            |            | |
import { z } from 'zod';
import {
  isoDate,
  periodValid,
  type FieldMask,
  type FormGate,
} from './form-gate';
import { RAIT_TIMER_CODES } from '../data/models/tokens';
import type { RaitTimerCode } from '../data/models/case.models';

/** Relógios de extinção de punibilidade ([WF-RAIT-001]): nunca suspensos ([RN-RAIT-105]). O
 * catálogo §3.9 escreve `T-PRESC-5A`, token inexistente em `RAIT_TIMER_CODES` (OD-R12-049). */
export const EXTINCTION_TIMER_CODES = [
  'T-DEC',
  'T-JUL-24M',
  'T-PAR-3A',
] as const satisfies readonly RaitTimerCode[];

export const AtoSuspensaoSchema = z
  .strictObject({
    // Sem transporte no DTO até R-0007 (OD-R12-046).
    caseIds: z.array(z.uuid()).min(1),
    startsOn: isoDate,
    endsOn: isoDate,
    reason: z.string().trim().min(1),
    legalBasis: z.string().trim().nullable(),
    timerCodes: z.array(z.enum(RAIT_TIMER_CODES)).min(1),
    evidenceDocumentId: z.uuid(),
  })
  .superRefine((value, ctx) => {
    // R1: prazos legais de extinção não são selecionáveis (SUSPENSION_LEGAL_TIMER).
    const legal = value.timerCodes.some((code) =>
      (EXTINCTION_TIMER_CODES as readonly string[]).includes(code),
    );
    if (legal) {
      ctx.addIssue({
        code: 'custom',
        path: ['timerCodes'],
        message: 'rait.forms.ato-suspensao.timerCodes.legal',
      });
    }

    // R2: fim da suspensão não é anterior ao início.
    if (!periodValid(value.startsOn, value.endsOn)) {
      ctx.addIssue({
        code: 'custom',
        path: ['endsOn'],
        message: 'rait.forms.common.period_invalid',
      });
    }
  });

export type AtoSuspensaoBody = z.infer<typeof AtoSuspensaoSchema>;

export const ATO_SUSPENSAO_MASKS: Readonly<Record<string, FieldMask>> = {
  startsOn: 'date',
  endsOn: 'date',
};

export const ATO_SUSPENSAO_GATE: FormGate = {
  preState: null,
  roles: ['rait-signing-authority', 'rait-chair'],
  preconditions: [
    { note: 'prova de força maior', source: 'rait-web-frontend.md §7' },
    {
      note: 'nunca automática; a suspensão é ato motivado e auditado',
      source: 'IU-RAIT-064 §6; RN-RAIT-105',
    },
  ],
  command: 'rait-suspension-act:create',
  postState: 'vigente',
  errorCodes: [
    'RAIT.SUSPENSION_LEGAL_TIMER',
    'RAIT.SUSPENSION_EVIDENCE_REQUIRED',
    'RAIT.DEADLINE_LEGAL_READONLY',
    'RAIT.IDEMPOTENCY_REPLAY',
  ],
};
