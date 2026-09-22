// Sessão ao vivo (contrato CTG-0002c §4.9; `rait-web-forms.md` §10; spec §9 "Sessão ao vivo" e
// §6.6; ficha IU-RAIT-034 §6; [UC-RAIT-006]; [RN-RAIT-140]; [RN-RAIT-142]; [WF-RAIT-003]
// §Estados, §Quorum, §Votação e empate; [WF-RAIT-004] §6; catálogo §3.7). Quorum, impedimento,
// empate e presidência são fatos do servidor espelhados em `context` (§2.4).
//
// Gates (agregado: sessão) — contrato §5.1 linhas 16 a 18:
// | export                           | pré-estado               | papéis                       | pré-condições                                  | comando                   | pós-estado    | errorCodes |
// | SESSAO_AO_VIVO_GATE              | [VOTACAO]                | rait-rapporteur, rait-chair  | item em votação, não impedido (§7); impedido   | rait-session:vote         | null          | VOTE_MEMBER_IMPEDED, VOTE_ITEM_NOT_OPEN, VOTE_DUPLICATE,
// |                                  |                          |                              | não vota nem conta quorum (RN-RAIT-140)        |                           |               | SESSION_QUORUM_MISSING, SESSION_STATE_INVALID |
// | SESSAO_AO_VIVO_CASTING_VOTE_GATE | [DESEMPATE_PRESIDENTE]   | rait-chair                   | votos empatados — voto de qualidade            | rait-session:casting-vote | null          | CASTING_VOTE_NOT_TIED, CASTING_VOTE_NOT_CHAIR, SESSION_STATE_INVALID |
// | SESSAO_AO_VIVO_OPEN_GATE         | [CONVOCACAO_ENVIADA]     | rait-chair                   | quorum confirmado (§7); maioria simples com o  | rait-session:open         | SESSAO_ABERTA | SESSION_QUORUM_MISSING, BENCH_INSUFFICIENT,
// |                                  |                          |                              | presidente ou suplente (RN-RAIT-142)           |                           |               | SESSION_STATE_INVALID |
import { z } from 'zod';
import { tristate, type FormGate } from './form-gate';
import { RAIT_SESSION_STATES, RAIT_VOTE_VALUES } from '../data/models/tokens';

export const SessaoAoVivoSchema = z
  .strictObject({
    agendaItemId: z.uuid(),
    vote: z.enum(RAIT_VOTE_VALUES),
    castingVote: z.boolean(),
    context: z.strictObject({
      memberImpeded: tristate,
      itemOpen: tristate,
      alreadyVoted: tristate,
      tied: tristate,
      isChair: tristate,
      sessionState: z.enum(RAIT_SESSION_STATES).nullable(),
    }),
  })
  .superRefine((value, ctx) => {
    const { context } = value;

    // R1: voto de impedido bloqueado ([RN-RAIT-140]).
    if (context.memberImpeded === true) {
      ctx.addIssue({
        code: 'custom',
        path: ['vote'],
        message: 'rait.forms.sessao-ao-vivo.vote.impeded',
      });
    }
    // R2: item não lido ou já proclamado.
    if (context.itemOpen === false) {
      ctx.addIssue({
        code: 'custom',
        path: ['vote'],
        message: 'rait.forms.sessao-ao-vivo.vote.item_not_open',
      });
    }
    // R3: voto já registrado neste item.
    if (context.alreadyVoted === true) {
      ctx.addIssue({
        code: 'custom',
        path: ['vote'],
        message: 'rait.forms.sessao-ao-vivo.vote.duplicate',
      });
    }

    if (value.castingVote) {
      // R4: voto de qualidade só em empate ([WF-RAIT-003] §Votação e empate).
      if (context.tied === false) {
        ctx.addIssue({
          code: 'custom',
          path: ['castingVote'],
          message: 'rait.forms.sessao-ao-vivo.castingVote.not_tied',
        });
      }
      // R5: só quem preside dá o voto de qualidade.
      if (context.isChair === false) {
        ctx.addIssue({
          code: 'custom',
          path: ['castingVote'],
          message: 'rait.forms.sessao-ao-vivo.castingVote.not_chair',
        });
      }
    }

    // R9: estado espelhado fora do pré-estado dos gates de voto.
    if (
      context.sessionState !== null &&
      context.sessionState !== 'VOTACAO' &&
      context.sessionState !== 'DESEMPATE_PRESIDENTE'
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['vote'],
        message: 'rait.forms.common.state_invalid',
      });
    }
  });

export type SessaoAoVivoBody = z.infer<typeof SessaoAoVivoSchema>;

/** Abertura da sessão (comando `rait-session:open`; sem controles, só fatos do servidor). */
export const SessaoAberturaSchema = z
  .strictObject({
    context: z.strictObject({
      quorumRequired: z.number().int().positive(),
      quorumObserved: z.number().int().nonnegative(),
      chairPresent: tristate,
      // `null` na JARI; paridade é regra do CETRAN ([RN-RAIT-142]).
      parityMet: tristate,
      sessionState: z.enum(RAIT_SESSION_STATES).nullable(),
    }),
  })
  .superRefine((value, ctx) => {
    const { context } = value;

    // R6: abertura exige quorum (§9; [RN-RAIT-142]).
    if (context.quorumObserved < context.quorumRequired) {
      ctx.addIssue({
        code: 'custom',
        path: [],
        message: 'rait.forms.sessao-ao-vivo.abertura.quorum',
      });
    }
    // R7: presidente ou seu suplente.
    if (context.chairPresent === false) {
      ctx.addIssue({
        code: 'custom',
        path: [],
        message: 'rait.forms.sessao-ao-vivo.abertura.chair',
      });
    }
    // R8: paridade de representação no CETRAN.
    if (context.parityMet === false) {
      ctx.addIssue({
        code: 'custom',
        path: [],
        message: 'rait.forms.sessao-ao-vivo.abertura.parity',
      });
    }

    // R9: estado espelhado fora do pré-estado do gate de abertura.
    if (
      context.sessionState !== null &&
      context.sessionState !== 'CONVOCACAO_ENVIADA'
    ) {
      ctx.addIssue({
        code: 'custom',
        path: [],
        message: 'rait.forms.common.state_invalid',
      });
    }
  });

export type SessaoAberturaBody = z.infer<typeof SessaoAberturaSchema>;

export const SESSAO_AO_VIVO_GATE: FormGate = {
  preState: ['VOTACAO'],
  roles: ['rait-rapporteur', 'rait-chair'],
  preconditions: [
    {
      note: 'item em votação, não impedido',
      source: 'rait-web-frontend.md §7',
    },
    {
      note: 'membro impedido num item não vota nem conta para o quorum daquele item',
      source: 'RN-RAIT-140',
    },
  ],
  command: 'rait-session:vote',
  postState: null,
  errorCodes: [
    'RAIT.VOTE_MEMBER_IMPEDED',
    'RAIT.VOTE_ITEM_NOT_OPEN',
    'RAIT.VOTE_DUPLICATE',
    'RAIT.SESSION_QUORUM_MISSING',
    'RAIT.SESSION_STATE_INVALID',
  ],
};

export const SESSAO_AO_VIVO_CASTING_VOTE_GATE: FormGate = {
  preState: ['DESEMPATE_PRESIDENTE'],
  roles: ['rait-chair'],
  preconditions: [
    {
      note: 'votos empatados — voto de qualidade do presidente',
      source: 'WF-RAIT-003 §Votação e empate',
    },
  ],
  command: 'rait-session:casting-vote',
  postState: null,
  errorCodes: [
    'RAIT.CASTING_VOTE_NOT_TIED',
    'RAIT.CASTING_VOTE_NOT_CHAIR',
    'RAIT.SESSION_STATE_INVALID',
  ],
};

export const SESSAO_AO_VIVO_OPEN_GATE: FormGate = {
  preState: ['CONVOCACAO_ENVIADA'],
  roles: ['rait-chair'],
  preconditions: [
    { note: 'quorum confirmado', source: 'rait-web-frontend.md §7' },
    {
      note: 'maioria simples dos integrantes com o presidente ou seu suplente; no CETRAN, paridade',
      source: 'RN-RAIT-142',
    },
  ],
  command: 'rait-session:open',
  postState: 'SESSAO_ABERTA',
  errorCodes: [
    'RAIT.SESSION_QUORUM_MISSING',
    'RAIT.BENCH_INSUFFICIENT',
    'RAIT.SESSION_STATE_INVALID',
  ],
};
