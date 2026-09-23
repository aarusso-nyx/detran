// Reatribuição de caso (contrato CTG-0002c §4.13; `rait-web-forms.md` §14; spec §9
// "Reatribuição" e §6.6; ficha IU-RAIT-040 §6; [UC-RAIT-011]; [RN-RAIT-141]; [RN-RAIT-140];
// catálogo §3.4). O "novo responsável (calculado)" é proposta do servidor exibida como valor
// inicial: o cliente não ordena candidatos ([RN-RAIT-141]).
//
// Gate REATRIBUICAO_GATE (agregado: caso/atribuição) — contrato §5.1 linha 22:
// | pré-estado                              | papéis                                     | pré-condições             | comando                  | pós-estado | errorCodes |
// | [DISTRIBUIDO, EM_INSTRUCAO, DILIGENCIA] | rait-coordinator, rait-manager, rait-chair | motivo tipado (§7); nunca | rait-assignment:reassign | null       | REASSIGN_REASON_REQUIRED, REASSIGN_TO_SAME_MEMBER,
// |                                         |                                            | ao impedido (§9)          |                          |            | MEMBER_IMPEDED, MEMBER_NOT_AVAILABLE, CASE_STATE_INVALID |
import { z } from 'zod';
import { type FormGate } from './form-gate';
import { RAIT_CASE_STATES } from '../data/models/tokens';
import type { RaitCaseState } from '../data/models/case.models';
import type { RaitReleaseReason } from '../data/models/worklist.models';

/** [RN-RAIT-141] §Verificação; `concluido` é liberação, não reatribuição. */
export const REASSIGN_REASONS = [
  'impedimento',
  'afastamento',
  'rebalanceamento',
  'risco_prescricao',
] as const satisfies readonly RaitReleaseReason[];

/** Estados em que a atribuição pode mudar de responsável (§6.6). */
export const REASSIGNABLE_STATES = [
  'DISTRIBUIDO',
  'EM_INSTRUCAO',
  'DILIGENCIA',
] as const satisfies readonly RaitCaseState[];

export const ReatribuicaoSchema = z
  .strictObject({
    memberId: z.uuid(),
    releaseReason: z.enum(REASSIGN_REASONS),
    context: z.strictObject({
      currentMemberId: z.uuid().nullable(),
      impededMemberIds: z.array(z.uuid()),
      unavailableMemberIds: z.array(z.uuid()),
      caseState: z.enum(RAIT_CASE_STATES).nullable(),
    }),
  })
  .superRefine((value, ctx) => {
    const { context } = value;

    // R1: o novo responsável não é o atual (REASSIGN_TO_SAME_MEMBER).
    if (value.memberId === context.currentMemberId) {
      ctx.addIssue({
        code: 'custom',
        path: ['memberId'],
        message: 'rait.forms.reatribuicao.memberId.same',
      });
    }

    // R2: nunca ao impedido ([RN-RAIT-140]; MEMBER_IMPEDED).
    if (context.impededMemberIds.includes(value.memberId)) {
      ctx.addIssue({
        code: 'custom',
        path: ['memberId'],
        message: 'rait.forms.reatribuicao.memberId.impeded',
      });
    }

    // R3: membro fora da escala ([WF-RAIT-004] §3; MEMBER_NOT_AVAILABLE).
    if (context.unavailableMemberIds.includes(value.memberId)) {
      ctx.addIssue({
        code: 'custom',
        path: ['memberId'],
        message: 'rait.forms.reatribuicao.memberId.unavailable',
      });
    }

    // R4: estado espelhado fora do pré-estado do gate.
    if (
      context.caseState !== null &&
      !(REASSIGNABLE_STATES as readonly string[]).includes(context.caseState)
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['memberId'],
        message: 'rait.forms.common.state_invalid',
      });
    }
  });

export type ReatribuicaoBody = z.infer<typeof ReatribuicaoSchema>;

export const REATRIBUICAO_GATE: FormGate = {
  preState: REASSIGNABLE_STATES,
  roles: ['rait-coordinator', 'rait-manager', 'rait-chair'],
  preconditions: [
    { note: 'motivo tipado', source: 'rait-web-frontend.md §7' },
    { note: 'nunca ao impedido', source: 'rait-web-frontend.md §9' },
  ],
  command: 'rait-assignment:reassign',
  postState: null,
  errorCodes: [
    'RAIT.REASSIGN_REASON_REQUIRED',
    'RAIT.REASSIGN_TO_SAME_MEMBER',
    'RAIT.MEMBER_IMPEDED',
    'RAIT.MEMBER_NOT_AVAILABLE',
    'RAIT.CASE_STATE_INVALID',
  ],
};
