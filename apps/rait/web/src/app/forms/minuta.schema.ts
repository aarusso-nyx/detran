// Minuta de decisão (contrato CTG-0002c §4.4; `rait-web-forms.md` §5; spec §9 "Minuta" e §6.6;
// ficha IU-RAIT-011 §6; [UC-RAIT-003]; catálogo §3.5 `DRAFT_INCOMPLETE`). "Versão salva a cada
// envio" é comportamento do servidor (`RaitDraft.version`), não regra de forma.
//
// Gate MINUTA_GATE (agregado: caso) — contrato §5.1 linha 8:
// | pré-estado     | papéis       | pré-condições                                  | comando                | pós-estado       | errorCodes |
// | [EM_INSTRUCAO] | rait-analyst | minuta com dispositivo (§7); quem instrui não  | rait-case:submit-draft | PRONTO_P_DECISAO | DRAFT_INCOMPLETE, CASE_STATE_INVALID |
// |                |              | é quem assina (ficha 011 §6)                   |                        |                  | |
import { z } from 'zod';
import { type FormGate } from './form-gate';
import { RAIT_CASE_STATES } from '../data/models/tokens';

/** Dispositivo da minuta (§9; OD-R12-029: o mapeamento ao `decision_kind` é de R-0007). */
export const MINUTA_RULINGS = ['acolher', 'indeferir'] as const;

export const MinutaSchema = z
  .strictObject({
    facts: z.string().trim().min(1),
    grounds: z.string().trim().min(1),
    ruling: z.enum(MINUTA_RULINGS),
    context: z.strictObject({
      caseState: z.enum(RAIT_CASE_STATES).nullable(),
    }),
  })
  .superRefine((value, ctx) => {
    // R2: estado espelhado fora do pré-estado do gate.
    if (
      value.context.caseState !== null &&
      value.context.caseState !== 'EM_INSTRUCAO'
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['ruling'],
        message: 'rait.forms.common.state_invalid',
      });
    }
  });

export type MinutaBody = z.infer<typeof MinutaSchema>;

export const MINUTA_GATE: FormGate = {
  preState: ['EM_INSTRUCAO'],
  roles: ['rait-analyst'],
  preconditions: [
    { note: 'minuta com dispositivo', source: 'rait-web-frontend.md §7' },
    { note: 'quem instrui não é quem assina', source: 'IU-RAIT-011 §6' },
  ],
  command: 'rait-case:submit-draft',
  postState: 'PRONTO_P_DECISAO',
  errorCodes: ['RAIT.DRAFT_INCOMPLETE', 'RAIT.CASE_STATE_INVALID'],
};
