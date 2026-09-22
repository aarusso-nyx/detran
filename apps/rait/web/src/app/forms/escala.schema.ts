// Escala e plantão (contrato CTG-0002c §4.11; `rait-web-forms.md` §12; spec §9 "Escala"; ficha
// IU-RAIT-046 §6; [UC-RAIT-013]; [WF-RAIT-004] §3 e §9; catálogo §3.4). Os dias úteis do
// período são calculados pelo servidor com o calendário de feriados e chegam em
// `context.businessDays` ([RN-RAIT-005]); `wipLimit` em branco = parâmetro `rait.wip.limit`.
//
// Gate ESCALA_GATE (agregado: escala) — contrato §5.1 linha 20 (sem token de rascunho no
// contrato → pré-estado e pós-estado `null`, OD-R12-048):
// | pré-estado | papéis                        | pré-condições                                  | comando               | pós-estado | errorCodes |
// | null       | rait-coordinator, rait-chair  | plantonista por dia (§7); plantonista por dia  | rait-schedule:publish | null       | SCHEDULE_NO_DUTY_MEMBER, SCHEDULE_PERIOD_LOCKED,
// |            |                               | útil (§9); só DISPONIVEL puxa casos            |                       |            | IDEMPOTENCY_REPLAY |
// |            |                               | (WF-RAIT-004 §3)                               |                       |            | |
import { z } from 'zod';
import {
  isoDate,
  periodValid,
  tristate,
  type FieldMask,
  type FormGate,
} from './form-gate';
import { RAIT_AVAILABILITIES } from '../data/models/tokens';
import type {
  RaitAbsenceReason,
  RaitScheduleKind,
} from '../data/models/worklist.models';

/** `RaitSchedule.kind` ainda sem lista em `tokens.ts` (OD-R12-045). */
export const ESCALA_KINDS = [
  'escala_semanal',
  'plantao_risco',
  'escala_assinatura',
  'escala_balcao',
] as const satisfies readonly RaitScheduleKind[];

/** `RaitSchedule.absence_reason` (OD-R12-045). */
export const ABSENCE_REASONS = [
  'ferias',
  'licenca',
  'curso',
  'sessao_externa',
] as const satisfies readonly RaitAbsenceReason[];

export const EscalaSlotSchema = z.strictObject({
  slotOn: isoDate,
  availability: z.enum(RAIT_AVAILABILITIES),
  absenceReason: z.enum(ABSENCE_REASONS).nullable(),
});

export const EscalaEntrySchema = z.strictObject({
  memberId: z.uuid(),
  // `null` = parâmetro `rait.wip.limit` do servidor.
  wipLimit: z.number().int().nonnegative().nullable(),
  slots: z.array(EscalaSlotSchema).min(1),
});

export const EscalaSchema = z
  .strictObject({
    poolId: z.uuid(),
    kind: z.enum(ESCALA_KINDS),
    periodStart: isoDate,
    periodEnd: isoDate,
    entries: z.array(EscalaEntrySchema).min(1),
    context: z.strictObject({
      businessDays: z.array(isoDate).nullable(),
      periodLocked: tristate,
    }),
  })
  .superRefine((value, ctx) => {
    const { entries, context } = value;

    const seen = new Set<string>();
    entries.forEach((entry, entryIndex) => {
      // R2: membros únicos na escala.
      if (seen.has(entry.memberId)) {
        ctx.addIssue({
          code: 'custom',
          path: ['entries', entryIndex, 'memberId'],
          message: 'rait.forms.escala.entries.duplicate',
        });
      }
      seen.add(entry.memberId);

      entry.slots.forEach((slot, slotIndex) => {
        const slotPath = ['entries', entryIndex, 'slots', slotIndex] as const;
        // R3: ausência programada exige motivo; qualquer outra disponibilidade o proíbe (sem
        // chave própria no §7 para o excesso → `rait.forms.common.invalid`).
        if (
          slot.availability === 'AUSENTE_PROGRAMADO' &&
          slot.absenceReason === null
        ) {
          ctx.addIssue({
            code: 'custom',
            path: [...slotPath, 'absenceReason'],
            message: 'rait.forms.escala.slots.absenceReason.required',
          });
        }
        if (
          slot.availability !== 'AUSENTE_PROGRAMADO' &&
          slot.absenceReason !== null
        ) {
          ctx.addIssue({
            code: 'custom',
            path: [...slotPath, 'absenceReason'],
            message: 'rait.forms.common.invalid',
          });
        }
        // R6: dia dentro do período da escala.
        if (slot.slotOn < value.periodStart || slot.slotOn > value.periodEnd) {
          ctx.addIssue({
            code: 'custom',
            path: [...slotPath, 'slotOn'],
            message: 'rait.forms.escala.slots.slotOn.outside_period',
          });
        }
      });
    });

    // R1: todo dia útil do servidor tem plantonista (ficha 046; SCHEDULE_NO_DUTY_MEMBER).
    if (context.businessDays !== null) {
      for (const day of context.businessDays) {
        const covered = entries.some((entry) =>
          entry.slots.some(
            (slot) => slot.slotOn === day && slot.availability === 'EM_PLANTAO',
          ),
        );
        if (!covered) {
          ctx.addIssue({
            code: 'custom',
            path: [],
            message: 'rait.forms.escala.entries.duty_missing',
            params: { date: day },
          });
        }
      }
    }

    // R4: período já iniciado (SCHEDULE_PERIOD_LOCKED).
    if (context.periodLocked === true) {
      ctx.addIssue({
        code: 'custom',
        path: ['periodStart'],
        message: 'rait.forms.escala.periodStart.locked',
      });
    }

    // R5: fim do período não é anterior ao início.
    if (!periodValid(value.periodStart, value.periodEnd)) {
      ctx.addIssue({
        code: 'custom',
        path: ['periodEnd'],
        message: 'rait.forms.common.period_invalid',
      });
    }
  });

export type EscalaBody = z.infer<typeof EscalaSchema>;

export const ESCALA_MASKS: Readonly<Record<string, FieldMask>> = {
  periodStart: 'date',
  periodEnd: 'date',
  'entries.slots.slotOn': 'date',
};

export const ESCALA_GATE: FormGate = {
  preState: null,
  roles: ['rait-coordinator', 'rait-chair'],
  preconditions: [
    { note: 'plantonista por dia', source: 'rait-web-frontend.md §7' },
    { note: 'plantonista por dia útil', source: 'rait-web-frontend.md §9' },
    {
      note: 'só membros DISPONIVEL puxam casos; ausência programada rebaixa WIP a zero',
      source: 'WF-RAIT-004 §3',
    },
  ],
  command: 'rait-schedule:publish',
  postState: null,
  errorCodes: [
    'RAIT.SCHEDULE_NO_DUTY_MEMBER',
    'RAIT.SCHEDULE_PERIOD_LOCKED',
    'RAIT.IDEMPOTENCY_REPLAY',
  ],
};
