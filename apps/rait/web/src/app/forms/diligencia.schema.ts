// Diligência (contrato CTG-0002c §4.3; `rait-web-forms.md` §4; spec §9 "Diligência" e §6.6;
// ficha IU-RAIT-010 §6; [UC-RAIT-003]; [RN-RAIT-003]; [RN-RAIT-004]; [RN-RAIT-005]; catálogo
// §3.5). O prazo padrão da diligência (parâmetro T-DIL do catálogo de parâmetros) é lido
// pelo servidor: `dueOn` em branco não vira número no cliente e nenhuma contagem de dias
// acontece aqui.
//
// Gates (agregado: caso) — contrato §5.1 linhas 5 a 7:
// | export                 | pré-estado      | papéis                          | pré-condições                                        | comando                | pós-estado   | errorCodes |
// | DILIGENCIA_GATE        | [EM_INSTRUCAO]  | rait-analyst, rait-rapporteur   | EM_INSTRUCAO / DILIGENCIA (§7); destinatário          | rait-case:open-inquiry | DILIGENCIA   | INQUIRY_ADDRESSEE_FORBIDDEN,
// |                        |                 |                                 | "requerente" bloqueado (§9); sem prazo nunca (ficha)  |                        |              | CASE_OFFICIAL_DOCUMENT_REQUIRED, CASE_STATE_INVALID |
// | DILIGENCIA_ANSWER_GATE | [DILIGENCIA]    | rait-analyst, rait-rapporteur   | resposta tempestiva anexada (WF-RAIT-001)            | rait-case:answer       | EM_INSTRUCAO | INQUIRY_ALREADY_CLOSED, CASE_STATE_INVALID |
// | DILIGENCIA_EXTEND_GATE | [DILIGENCIA]    | rait-analyst, rait-rapporteur   | prorrogação 1x (§9); nova prorrogação exige ato      | rait-case:extend       | DILIGENCIA   | INQUIRY_EXTENSION_LIMIT, INQUIRY_ALREADY_CLOSED,
// |                        |                 |                                 | motivado (ficha 010)                                  |                        |              | CASE_STATE_INVALID |
//
// As chaves reais de política de `answer`/`extend` são `inf:rait-case:answer-inquiry` e
// `inf:rait-case:extend-inquiry` (contrato §3 #9/#10, OD-R12-026): bloqueio conhecido, não
// corrigido aqui.
import { z } from 'zod';
import { isoDate, type FieldMask, type FormGate } from './form-gate';
import {
  RAIT_CASE_STATES,
  RAIT_INQUIRY_ADDRESSEES,
} from '../data/models/tokens';
import type { RaitInquiryOutcome } from '../data/models/case.models';

/** Desfechos de `RaitInquiry.outcome` (fato do servidor espelhado em `context`). */
export const INQUIRY_OUTCOMES = [
  'respondida',
  'expirada',
] as const satisfies readonly RaitInquiryOutcome[];

export const DiligenciaSchema = z
  .strictObject({
    addressee: z.enum(RAIT_INQUIRY_ADDRESSEES),
    subject: z.string().trim().min(1),
    // `null` = prazo padrão do servidor ([RN-RAIT-005]).
    dueOn: isoDate.nullable(),
    // Controle proposto para tornar verificável a regra do §9 (OD-R12-042).
    officialDocument: z.boolean(),
    context: z.strictObject({
      today: isoDate,
      caseState: z.enum(RAIT_CASE_STATES).nullable(),
    }),
  })
  .superRefine((value, ctx) => {
    // R1: documento do próprio órgão não se exige do requerente ([RN-RAIT-003]).
    if (value.addressee === 'requerente' && value.officialDocument) {
      ctx.addIssue({
        code: 'custom',
        path: ['addressee'],
        message: 'rait.forms.diligencia.addressee.official_document',
      });
    }

    // R2: prazo no passado; o servidor prorroga ao 1º dia útil ([RN-RAIT-005]).
    if (value.dueOn !== null && value.dueOn <= value.context.today) {
      ctx.addIssue({
        code: 'custom',
        path: ['dueOn'],
        message: 'rait.forms.common.date_past',
      });
    }

    // R5: estado espelhado fora do pré-estado do gate.
    if (
      value.context.caseState !== null &&
      value.context.caseState !== 'EM_INSTRUCAO'
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['subject'],
        message: 'rait.forms.common.state_invalid',
      });
    }
  });

export type DiligenciaBody = z.infer<typeof DiligenciaSchema>;

/** Prorrogação (comando `rait-case:extend`; corpo `CommandBody`). */
export const DiligenciaProrrogacaoSchema = z
  .strictObject({
    reason: z.string().trim().min(1).optional(),
    context: z.strictObject({
      extensionCount: z.number().int().nonnegative(),
      outcome: z.enum(INQUIRY_OUTCOMES).nullable(),
    }),
  })
  .superRefine((value, ctx) => {
    // R3: prorrogação única (§9; ficha 010; catálogo INQUIRY_EXTENSION_LIMIT).
    if (value.context.extensionCount >= 1) {
      ctx.addIssue({
        code: 'custom',
        path: [],
        message: 'rait.forms.diligencia.extension.limit',
      });
    }
    // R4: diligência já respondida ou expirada (INQUIRY_ALREADY_CLOSED).
    if (value.context.outcome !== null) {
      ctx.addIssue({
        code: 'custom',
        path: [],
        message: 'rait.forms.diligencia.extension.closed',
      });
    }
  });

export type DiligenciaProrrogacaoBody = z.infer<
  typeof DiligenciaProrrogacaoSchema
>;

export const DILIGENCIA_MASKS: Readonly<Record<string, FieldMask>> = {
  dueOn: 'date',
};

export const DILIGENCIA_GATE: FormGate = {
  preState: ['EM_INSTRUCAO'],
  roles: ['rait-analyst', 'rait-rapporteur'],
  preconditions: [
    { note: 'EM_INSTRUCAO / DILIGENCIA', source: 'rait-web-frontend.md §7' },
    {
      note: 'destinatário "requerente" bloqueado para documento do órgão',
      source: 'rait-web-frontend.md §9',
    },
    {
      note: 'diligência sem prazo nunca é permitida',
      source: 'IU-RAIT-010 §6; RN-RAIT-004',
    },
  ],
  command: 'rait-case:open-inquiry',
  postState: 'DILIGENCIA',
  errorCodes: [
    'RAIT.INQUIRY_ADDRESSEE_FORBIDDEN',
    'RAIT.CASE_OFFICIAL_DOCUMENT_REQUIRED',
    'RAIT.CASE_STATE_INVALID',
  ],
};

export const DILIGENCIA_ANSWER_GATE: FormGate = {
  preState: ['DILIGENCIA'],
  roles: ['rait-analyst', 'rait-rapporteur'],
  preconditions: [
    { note: 'resposta tempestiva anexada', source: 'WF-RAIT-001 §Transições' },
  ],
  command: 'rait-case:answer',
  postState: 'EM_INSTRUCAO',
  errorCodes: ['RAIT.INQUIRY_ALREADY_CLOSED', 'RAIT.CASE_STATE_INVALID'],
};

export const DILIGENCIA_EXTEND_GATE: FormGate = {
  preState: ['DILIGENCIA'],
  roles: ['rait-analyst', 'rait-rapporteur'],
  preconditions: [
    { note: 'prorrogação 1x', source: 'rait-web-frontend.md §9' },
    {
      note: 'Prorrogação única; nova prorrogação exige ato motivado',
      source: 'IU-RAIT-010 §6',
    },
  ],
  command: 'rait-case:extend',
  postState: 'DILIGENCIA',
  errorCodes: [
    'RAIT.INQUIRY_EXTENSION_LIMIT',
    'RAIT.INQUIRY_ALREADY_CLOSED',
    'RAIT.CASE_STATE_INVALID',
  ],
};
