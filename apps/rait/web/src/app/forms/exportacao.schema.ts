// Exportação de dados (contrato CTG-0002c §4.16; `rait-web-forms.md` §17; spec §9 "Exportação"
// e §10.6 (LGPD); ficha IU-RAIT-061 §6; [UC-RAIT-042]; catálogo §3.11). A contagem estimada de
// linhas e o limiar do DPO (`rait.export.dpo_threshold_rows`) vêm do servidor: o cliente só
// espelha os dois números e pede a confirmação.
//
// Gate EXPORTACAO_GATE (agregado: exportação) — contrato §5.1 linha 25:
// | pré-estado | papéis   | pré-condições                                  | comando            | pós-estado | errorCodes |
// | null       | AUDITOR  | finalidade (§7); finalidade obrigatória e      | rait-export:create | solicitada | EXPORT_PURPOSE_REQUIRED, EXPORT_DPO_APPROVAL_REQUIRED,
// |            |          | nominal em massa exige aprovação do DPO (§9)   |                    |            | IDEMPOTENCY_REPLAY |
//
// `RaitExport.status` é `aguardando_dpo` quando a regra R1 se aplica.
import { z } from 'zod';
import {
  isoDate,
  periodValid,
  type FieldMask,
  type FormGate,
} from './form-gate';

export const ExportacaoSchema = z
  .strictObject({
    purpose: z.string().trim().min(1),
    // Forma do jsonb `RaitExport.scope` sem contrato (OD-R12-050).
    scope: z.strictObject({
      periodStart: isoDate,
      periodEnd: isoDate,
      nominal: z.boolean(),
    }),
    dpoApprovalRequested: z.boolean(),
    context: z.strictObject({
      estimatedRowCount: z.number().int().nonnegative().nullable(),
      dpoThresholdRows: z.number().int().positive().nullable(),
    }),
  })
  .superRefine((value, ctx) => {
    const { context } = value;

    // R1: exportação nominal em massa exige aprovação do DPO (§9; §10.6).
    if (
      value.scope.nominal &&
      context.estimatedRowCount !== null &&
      context.dpoThresholdRows !== null &&
      context.estimatedRowCount >= context.dpoThresholdRows &&
      !value.dpoApprovalRequested
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['dpoApprovalRequested'],
        message: 'rait.forms.exportacao.dpoApprovalRequested.required',
      });
    }

    // R2: fim do período não é anterior ao início.
    if (!periodValid(value.scope.periodStart, value.scope.periodEnd)) {
      ctx.addIssue({
        code: 'custom',
        path: ['scope', 'periodEnd'],
        message: 'rait.forms.common.period_invalid',
      });
    }
  });

export type ExportacaoBody = z.infer<typeof ExportacaoSchema>;

export const EXPORTACAO_MASKS: Readonly<Record<string, FieldMask>> = {
  'scope.periodStart': 'date',
  'scope.periodEnd': 'date',
};

export const EXPORTACAO_GATE: FormGate = {
  preState: null,
  roles: ['AUDITOR'],
  preconditions: [
    { note: 'finalidade', source: 'rait-web-frontend.md §7' },
    {
      note: 'finalidade obrigatória; nominal em massa exige aprovação do DPO',
      source: 'rait-web-frontend.md §9',
    },
  ],
  command: 'rait-export:create',
  postState: 'solicitada',
  errorCodes: [
    'RAIT.EXPORT_PURPOSE_REQUIRED',
    'RAIT.EXPORT_DPO_APPROVAL_REQUIRED',
    'RAIT.IDEMPOTENCY_REPLAY',
  ],
};
