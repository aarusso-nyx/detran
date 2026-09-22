// R-0012 TASK-0011 (Inspector). `forms/sessao-ao-vivo.schema.ts` (contrato CTG-0002c §4.9) —
// ainda não existe (TASK-0012): a importação falha com "Cannot find module" (estado esperado,
// contrato §1). Critérios C-2C-48…52 (§8). Id do item de pauta lido de
// `docs/framework/arch/fixtures/rait-fixtures.json` (`kb.ts` `FIXTURES_PATH`); quorum,
// impedimento, empate e presidência são fatos do servidor espelhados em `context`.
import { readFileSync } from 'node:fs';
import type { z } from 'zod';
import {
  SESSAO_AO_VIVO_CASTING_VOTE_GATE,
  SESSAO_AO_VIVO_GATE,
  SESSAO_AO_VIVO_OPEN_GATE,
  SessaoAberturaSchema,
  SessaoAoVivoSchema,
} from './sessao-ao-vivo.schema';
import { FIXTURES_PATH } from '../../testing/kb';
import { GATES_FIXTURE } from '../../testing/gates.fixture';

const AGENDA_ITEM_ID = (
  JSON.parse(readFileSync(FIXTURES_PATH, 'utf8')) as {
    agendaItems: readonly { readonly id: string }[];
  }
).agendaItems[0].id;

/** Corpo canônico do §8 C-2C-48. */
const VALID_VOTE = {
  agendaItemId: AGENDA_ITEM_ID,
  vote: 'provimento',
  castingVote: false,
  context: {
    memberImpeded: false,
    itemOpen: true,
    alreadyVoted: false,
    tied: null,
    isChair: null,
    sessionState: 'VOTACAO',
  },
};

/** Corpo canônico da abertura (§8 C-2C-51). */
const VALID_OPENING = {
  context: {
    quorumRequired: 3,
    quorumObserved: 3,
    chairPresent: true,
    parityMet: null,
    sessionState: 'CONVOCACAO_ENVIADA',
  },
};

function issues(result: z.ZodSafeParseResult<unknown>): {
  path: PropertyKey[];
  message: string;
}[] {
  expect(result.success).toBe(false);
  if (result.success) throw new Error('unreachable');
  return result.error.issues.map((issue) => ({
    path: [...issue.path],
    message: issue.message,
  }));
}

function voteWithContext(
  patch: Record<string, unknown>,
): Record<string, unknown> {
  return { ...VALID_VOTE, context: { ...VALID_VOTE.context, ...patch } };
}

function openingWithContext(
  patch: Record<string, unknown>,
): Record<string, unknown> {
  return { context: { ...VALID_OPENING.context, ...patch } };
}

describe('SessaoAoVivoSchema', () => {
  it('dado o corpo canônico (vote provimento, castingVote false) quando safeParse então success; vote "x" então falha (enum); vote "abstencao" então success (token do contrato)', () => {
    // C-2C-48
    expect(SessaoAoVivoSchema.safeParse(VALID_VOTE).success).toBe(true);

    const invalid = SessaoAoVivoSchema.safeParse({ ...VALID_VOTE, vote: 'x' });
    expect(issues(invalid)[0].path).toEqual(['vote']);

    expect(
      SessaoAoVivoSchema.safeParse({ ...VALID_VOTE, vote: 'abstencao' })
        .success,
    ).toBe(true);
  });

  it('dado R1 memberImpeded true então falha em [vote] vote.impeded; R2 itemOpen false então vote.item_not_open; R3 alreadyVoted true então vote.duplicate', () => {
    // C-2C-49
    expect(
      issues(
        SessaoAoVivoSchema.safeParse(voteWithContext({ memberImpeded: true })),
      ),
    ).toContainEqual({
      path: ['vote'],
      message: 'rait.forms.sessao-ao-vivo.vote.impeded',
    });

    expect(
      issues(
        SessaoAoVivoSchema.safeParse(voteWithContext({ itemOpen: false })),
      ),
    ).toContainEqual({
      path: ['vote'],
      message: 'rait.forms.sessao-ao-vivo.vote.item_not_open',
    });

    expect(
      issues(
        SessaoAoVivoSchema.safeParse(voteWithContext({ alreadyVoted: true })),
      ),
    ).toContainEqual({
      path: ['vote'],
      message: 'rait.forms.sessao-ao-vivo.vote.duplicate',
    });
  });

  it('dado R4 castingVote true com tied false então falha em [castingVote] castingVote.not_tied; R5 com isChair false então castingVote.not_chair; com tied true, isChair true e sessionState DESEMPATE_PRESIDENTE então success', () => {
    // C-2C-50
    const notTied = SessaoAoVivoSchema.safeParse({
      ...voteWithContext({
        tied: false,
        isChair: true,
        sessionState: 'DESEMPATE_PRESIDENTE',
      }),
      castingVote: true,
    });
    expect(issues(notTied)).toContainEqual({
      path: ['castingVote'],
      message: 'rait.forms.sessao-ao-vivo.castingVote.not_tied',
    });

    const notChair = SessaoAoVivoSchema.safeParse({
      ...voteWithContext({
        tied: true,
        isChair: false,
        sessionState: 'DESEMPATE_PRESIDENTE',
      }),
      castingVote: true,
    });
    expect(issues(notChair)).toContainEqual({
      path: ['castingVote'],
      message: 'rait.forms.sessao-ao-vivo.castingVote.not_chair',
    });

    const valid = SessaoAoVivoSchema.safeParse({
      ...voteWithContext({
        tied: true,
        isChair: true,
        sessionState: 'DESEMPATE_PRESIDENTE',
      }),
      castingVote: true,
    });
    expect(valid.success).toBe(true);
  });

  it('dado R6–R8 SessaoAberturaSchema com quorumObserved 2 < required 3 então falha em [] abertura.quorum; observed 3 com chairPresent false então abertura.chair; parityMet false então abertura.parity; tudo ok então success', () => {
    // C-2C-51
    expect(
      issues(
        SessaoAberturaSchema.safeParse(
          openingWithContext({ quorumObserved: 2 }),
        ),
      ),
    ).toContainEqual({
      path: [],
      message: 'rait.forms.sessao-ao-vivo.abertura.quorum',
    });

    expect(
      issues(
        SessaoAberturaSchema.safeParse(
          openingWithContext({ chairPresent: false }),
        ),
      ),
    ).toContainEqual({
      path: [],
      message: 'rait.forms.sessao-ao-vivo.abertura.chair',
    });

    expect(
      issues(
        SessaoAberturaSchema.safeParse(
          openingWithContext({ parityMet: false }),
        ),
      ),
    ).toContainEqual({
      path: [],
      message: 'rait.forms.sessao-ao-vivo.abertura.parity',
    });

    expect(SessaoAberturaSchema.safeParse(VALID_OPENING).success).toBe(true);
  });

  it('dado R9 sessionState SESSAO_ABERTA no voto então rait.forms.common.state_invalid em [vote]; SESSAO_AO_VIVO_GATE, SESSAO_AO_VIVO_CASTING_VOTE_GATE e SESSAO_AO_VIVO_OPEN_GATE toEqual às fixtures', () => {
    // C-2C-52
    expect(
      issues(
        SessaoAoVivoSchema.safeParse(
          voteWithContext({ sessionState: 'SESSAO_ABERTA' }),
        ),
      ),
    ).toContainEqual({
      path: ['vote'],
      message: 'rait.forms.common.state_invalid',
    });

    expect(SESSAO_AO_VIVO_GATE).toEqual(GATES_FIXTURE['SESSAO_AO_VIVO_GATE']);
    expect(SESSAO_AO_VIVO_CASTING_VOTE_GATE).toEqual(
      GATES_FIXTURE['SESSAO_AO_VIVO_CASTING_VOTE_GATE'],
    );
    expect(SESSAO_AO_VIVO_OPEN_GATE).toEqual(
      GATES_FIXTURE['SESSAO_AO_VIVO_OPEN_GATE'],
    );
  });
});
