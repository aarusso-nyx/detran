// Desistência (contrato CTG-0002c §4.10; `rait-web-forms.md` §11; spec §9 "Desistência" e §6.6;
// ficha IU-RAIT-024 §6; [UC-RAIT-012]; [RN-RAIT-004]; [WF-RAIT-001] §Transições; catálogo
// §3.3). A busca por protocolo é controle da página (resolve o `caseId` fora do schema).
//
// Gate DESISTENCIA_GATE (agregado: caso) — contrato §5.1 linha 19:
// | pré-estado                            | papéis         | pré-condições                                  | comando            | pós-estado             | errorCodes |
// | WITHDRAWAL_PRE_DECISION_STATES (8)    | rait-secretary | pré-decisão, termo assinado (§7); o requerente | rait-case:withdraw | ENCERRADO_DESISTENCIA  | WITHDRAWAL_AFTER_DECISION, WITHDRAWAL_LEGITIMACY,
// |                                       |                | pode desistir por escrito até o julgamento     |                    |                        | CASE_STATE_INVALID |
// |                                       |                | (RN-RAIT-004)                                  |                    |                        | |
import { z } from 'zod';
import { tristate, type FormGate } from './form-gate';
import { RAIT_CASE_STATES } from '../data/models/tokens';
import type { RaitCaseState } from '../data/models/case.models';

/** As oito origens de `→ ENCERRADO_DESISTENCIA` no diagrama de [WF-RAIT-001] (`ADMITIDO` não
 * consta do diagrama → OD-R12-047; não acrescentado). */
export const WITHDRAWAL_PRE_DECISION_STATES = [
  'PROTOCOLADO',
  'TRIAGEM_ADMISSIBILIDADE',
  'AGUARDANDO_REMESSA_JARI',
  'DISTRIBUIDO',
  'EM_INSTRUCAO',
  'DILIGENCIA',
  'PRONTO_P_DECISAO',
  'PAUTADO',
] as const satisfies readonly RaitCaseState[];

export const DesistenciaSchema = z
  .strictObject({
    caseId: z.uuid(),
    termDocumentId: z.uuid(),
    signerPartyId: z.uuid(),
    legitimacyConfirmed: z.literal(true),
    context: z.strictObject({
      caseState: z.enum(RAIT_CASE_STATES).nullable(),
      signerLegitimate: tristate,
    }),
  })
  .superRefine((value, ctx) => {
    const { context } = value;

    // R1: só pré-decisão (§9; catálogo WITHDRAWAL_AFTER_DECISION).
    if (
      context.caseState !== null &&
      !(WITHDRAWAL_PRE_DECISION_STATES as readonly string[]).includes(
        context.caseState,
      )
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['caseId'],
        message: 'rait.forms.desistencia.caseId.after_decision',
      });
    }

    // R2: signatário legítimo (catálogo WITHDRAWAL_LEGITIMACY).
    if (context.signerLegitimate === false) {
      ctx.addIssue({
        code: 'custom',
        path: ['signerPartyId'],
        message: 'rait.forms.desistencia.signerPartyId.illegitimate',
      });
    }
  });

export type DesistenciaBody = z.infer<typeof DesistenciaSchema>;

export const DESISTENCIA_GATE: FormGate = {
  preState: WITHDRAWAL_PRE_DECISION_STATES,
  roles: ['rait-secretary'],
  preconditions: [
    { note: 'pré-decisão, termo assinado', source: 'rait-web-frontend.md §7' },
    {
      note: 'O requerente pode desistir por escrito até o julgamento',
      source: 'RN-RAIT-004',
    },
  ],
  command: 'rait-case:withdraw',
  postState: 'ENCERRADO_DESISTENCIA',
  errorCodes: [
    'RAIT.WITHDRAWAL_AFTER_DECISION',
    'RAIT.WITHDRAWAL_LEGITIMACY',
    'RAIT.CASE_STATE_INVALID',
  ],
};
