// Decisão da autoridade (contrato CTG-0002c §4.5; `rait-web-forms.md` §6; spec §9 "Decisão da
// autoridade" e §6.6; fichas IU-RAIT-012 e IU-RAIT-026 §6; [UC-RAIT-016]; [RN-RAIT-143];
// [RN-RAIT-140]; catálogo §3.5 e §3.6). Circunscrição, escala do dia, autoria da minuta e
// disponibilidade da assinatura são fatos do servidor espelhados em `context` (§2.4).
//
// Gates (agregado: caso) — contrato §5.1 linhas 9 e 10:
// | export                         | pré-estado         | papéis                  | pré-condições                                      | comando                    | pós-estado          | errorCodes |
// | DECISAO_AUTORIDADE_GATE        | [PRONTO_P_DECISAO] | rait-signing-authority  | PRONTO_P_DECISAO, circunscrição, escala (§7);      | rait-decision:sign         | DECIDIDO_AUTORIDADE | DECISION_JURISDICTION, DECISION_NOT_ON_DUTY,
// |                                |                    |                         | circunscrição = do AIT, escala do dia (§9);        |                            |                     | DECISION_GROUNDS_REQUIRED, DECISION_KIND_INVALID_FOR_INSTANCE,
// |                                |                    |                         | assinatura pessoal e territorial (ficha 012)       |                            |                     | DRAFT_AUTHOR_CANNOT_SIGN, SIGNATURE_FAILED, SIGNATURE_CERT_MISMATCH,
// |                                |                    |                         |                                                     |                            |                     | DECISION_ALREADY_SIGNED, EXTINCTION_DECISION_LATE,
// |                                |                    |                         |                                                     |                            |                     | FORBIDDEN_CASE_SCOPE, CASE_STATE_INVALID |
// | DECISAO_AUTORIDADE_RETURN_GATE | [PRONTO_P_DECISAO] | rait-signing-authority  | 1ª devolução (§7)                                   | rait-decision:return-draft | PRONTO_P_DECISAO    | DRAFT_RETURN_LIMIT, CASE_STATE_INVALID |
//
// O pós-estado da devolução segue a ficha 012 e o blueprint (a ficha 026 diz EM_INSTRUCAO →
// OD-R12-044).
import { z } from 'zod';
import { tristate, type FormGate } from './form-gate';
import { RAIT_CASE_STATES, RAIT_INSTANCES } from '../data/models/tokens';

/** Dispositivo da defesa prévia (`CreateRaitDecisionDto.decision_kind`). */
export const DECISAO_AUTORIDADE_KINDS = ['acolhida', 'indeferida'] as const;

export const DecisaoAutoridadeSchema = z
  .strictObject({
    kind: z.enum(DECISAO_AUTORIDADE_KINDS),
    grounds: z.string().trim().min(1),
    signature: z
      .strictObject({ kind: z.string().min(1), ref: z.string().min(1) })
      .nullable(),
    context: z.strictObject({
      jurisdictionMatches: tristate,
      onDuty: tristate,
      isDraftAuthor: tristate,
      // Enquanto o kernel PAdES não existir a página passa `false` (OD-R12-043).
      signatureAvailable: z.boolean(),
      instance: z.enum(RAIT_INSTANCES).nullable(),
      caseState: z.enum(RAIT_CASE_STATES).nullable(),
    }),
  })
  .superRefine((value, ctx) => {
    const { context } = value;

    // R1: circunscrição do AIT ([RN-RAIT-143]; catálogo DECISION_JURISDICTION).
    if (context.jurisdictionMatches === false) {
      ctx.addIssue({
        code: 'custom',
        path: ['kind'],
        message: 'rait.forms.decisao-autoridade.context.jurisdiction',
      });
    }

    // R2: escala do dia e autoria da minuta (DECISION_NOT_ON_DUTY, DRAFT_AUTHOR_CANNOT_SIGN).
    if (context.onDuty === false) {
      ctx.addIssue({
        code: 'custom',
        path: ['kind'],
        message: 'rait.forms.decisao-autoridade.context.not_on_duty',
      });
    }
    if (context.isDraftAuthor === true) {
      ctx.addIssue({
        code: 'custom',
        path: ['kind'],
        message: 'rait.forms.decisao-autoridade.context.draft_author',
      });
    }

    // R3: assinatura obrigatória quando o kernel está disponível (§9).
    if (context.signatureAvailable === true && value.signature === null) {
      ctx.addIssue({
        code: 'custom',
        path: ['signature'],
        message: 'rait.forms.decisao-autoridade.signature.required',
      });
    }

    // R4: acolher/indeferir só na defesa prévia (DECISION_KIND_INVALID_FOR_INSTANCE).
    if (context.instance !== null && context.instance !== 'defesa_previa') {
      ctx.addIssue({
        code: 'custom',
        path: ['kind'],
        message: 'rait.forms.decisao-autoridade.context.instance',
      });
    }

    // R5: estado espelhado fora do pré-estado do gate.
    if (
      context.caseState !== null &&
      context.caseState !== 'PRONTO_P_DECISAO'
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['kind'],
        message: 'rait.forms.common.state_invalid',
      });
    }
  });

export type DecisaoAutoridadeBody = z.infer<typeof DecisaoAutoridadeSchema>;

/** Devolução da minuta (comando `rait-decision:return-draft`). */
export const DecisaoDevolucaoSchema = z
  .strictObject({
    returnGuidance: z.string().trim().min(1),
    context: z.strictObject({
      returnCount: z.number().int().nonnegative(),
    }),
  })
  .superRefine((value, ctx) => {
    // R6: devolução única (§7 "1ª devolução"; ficha 012; catálogo DRAFT_RETURN_LIMIT).
    if (value.context.returnCount >= 1) {
      ctx.addIssue({
        code: 'custom',
        path: [],
        message: 'rait.forms.decisao-autoridade.returnGuidance.limit',
      });
    }
  });

export type DecisaoDevolucaoBody = z.infer<typeof DecisaoDevolucaoSchema>;

export const DECISAO_AUTORIDADE_GATE: FormGate = {
  preState: ['PRONTO_P_DECISAO'],
  roles: ['rait-signing-authority'],
  preconditions: [
    {
      note: 'PRONTO_P_DECISAO, circunscrição, escala',
      source: 'rait-web-frontend.md §7',
    },
    {
      note: 'circunscrição = do AIT; escala do dia',
      source: 'rait-web-frontend.md §9',
    },
    {
      note: 'a assinatura é pessoal e territorial',
      source: 'IU-RAIT-012 §6; RN-RAIT-143',
    },
  ],
  command: 'rait-decision:sign',
  postState: 'DECIDIDO_AUTORIDADE',
  errorCodes: [
    'RAIT.DECISION_JURISDICTION',
    'RAIT.DECISION_NOT_ON_DUTY',
    'RAIT.DECISION_GROUNDS_REQUIRED',
    'RAIT.DECISION_KIND_INVALID_FOR_INSTANCE',
    'RAIT.DRAFT_AUTHOR_CANNOT_SIGN',
    'RAIT.SIGNATURE_FAILED',
    'RAIT.SIGNATURE_CERT_MISMATCH',
    'RAIT.DECISION_ALREADY_SIGNED',
    'RAIT.EXTINCTION_DECISION_LATE',
    'RAIT.FORBIDDEN_CASE_SCOPE',
    'RAIT.CASE_STATE_INVALID',
  ],
};

export const DECISAO_AUTORIDADE_RETURN_GATE: FormGate = {
  preState: ['PRONTO_P_DECISAO'],
  roles: ['rait-signing-authority'],
  preconditions: [{ note: '1ª devolução', source: 'rait-web-frontend.md §7' }],
  command: 'rait-decision:return-draft',
  postState: 'PRONTO_P_DECISAO',
  errorCodes: ['RAIT.DRAFT_RETURN_LIMIT', 'RAIT.CASE_STATE_INVALID'],
};
