// Parecer e voto do relator (contrato CTG-0002c §4.6; `rait-web-forms.md` §7; spec §9
// "Parecer/voto" e §6.6; ficha IU-RAIT-031 §6; [UC-RAIT-004]; [RN-RAIT-140]; catálogo §3.5 e
// §3.6). `abstencao` é token de `RaitVote`, não de parecer (R1).
//
// Gate PARECER_VOTO_GATE (agregado: caso) — contrato §5.1 linha 11:
// | pré-estado     | papéis          | pré-condições                          | comando               | pós-estado       | errorCodes |
// | [EM_INSTRUCAO] | rait-rapporteur | EM_INSTRUCAO (§7); voto obrigatório(§9)| rait-opinion:register | PRONTO_P_DECISAO | DRAFT_INCOMPLETE, DECISION_GROUNDS_REQUIRED,
// |                |                 |                                        |                       |                  | CASE_STATE_INVALID, MEMBER_IMPEDED |
import { z } from 'zod';
import { tristate, type FormGate } from './form-gate';
import { RAIT_CASE_STATES, RAIT_OPINION_VOTES } from '../data/models/tokens';

export const ParecerVotoSchema = z
  .strictObject({
    summary: z.string().trim().min(1),
    analysis: z.string().trim().min(1),
    vote: z.enum(RAIT_OPINION_VOTES),
    context: z.strictObject({
      memberImpeded: tristate,
      caseState: z.enum(RAIT_CASE_STATES).nullable(),
    }),
  })
  .superRefine((value, ctx) => {
    // R2: impedido não relata ([RN-RAIT-140]; catálogo MEMBER_IMPEDED).
    if (value.context.memberImpeded === true) {
      ctx.addIssue({
        code: 'custom',
        path: ['vote'],
        message: 'rait.forms.parecer-voto.vote.impeded',
      });
    }

    // R3: estado espelhado fora do pré-estado do gate.
    if (
      value.context.caseState !== null &&
      value.context.caseState !== 'EM_INSTRUCAO'
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['vote'],
        message: 'rait.forms.common.state_invalid',
      });
    }
  });

export type ParecerVotoBody = z.infer<typeof ParecerVotoSchema>;

export const PARECER_VOTO_GATE: FormGate = {
  preState: ['EM_INSTRUCAO'],
  roles: ['rait-rapporteur'],
  preconditions: [
    { note: 'EM_INSTRUCAO', source: 'rait-web-frontend.md §7' },
    { note: 'voto obrigatório', source: 'rait-web-frontend.md §9' },
  ],
  command: 'rait-opinion:register',
  postState: 'PRONTO_P_DECISAO',
  errorCodes: [
    'RAIT.DRAFT_INCOMPLETE',
    'RAIT.DECISION_GROUNDS_REQUIRED',
    'RAIT.CASE_STATE_INVALID',
    'RAIT.MEMBER_IMPEDED',
  ],
};
