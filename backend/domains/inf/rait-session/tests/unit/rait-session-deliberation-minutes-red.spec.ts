import { describe, expect, it } from 'vitest';

import { RaitSessionCommandService } from '../../src/handwritten/rait-session-command.service.js';

const TENANT = '00000000-0000-7000-8000-00000000a001';
const ACTOR = '00000000-0000-4000-8000-0000b0000005';
const SESSION = '00000000-0000-7000-8000-000030000003';
const AGENDA_ITEM = '00000000-0000-7000-8000-000031000002';
const MINUTES = '00000000-0000-7000-8000-000034000001';

type CommandResult = {
  readonly data: Record<string, unknown>;
  readonly events: readonly { readonly type: string }[];
  readonly etag: string;
};
type Subject = {
  execute(input: {
    command: string;
    targetId: string;
    payload: Record<string, unknown>;
    headers: Record<string, string>;
  }): Promise<CommandResult>;
};
type Outcome =
  | { readonly kind: 'resolved'; readonly result: CommandResult }
  | { readonly kind: 'rejected'; readonly code: string | undefined };

function subject(): Subject {
  return new RaitSessionCommandService(
    {
      tx: async (
        work: (tx: { query(): Promise<{ rows: unknown[] }> }) => unknown,
      ) => work({ query: async () => ({ rows: [] }) }),
    } as never,
    {
      hasActiveContext: () => true,
      snapshot: () => ({ tenantId: TENANT, actorId: ACTOR }),
    } as never,
  ) as unknown as Subject;
}

async function observe(command: Promise<CommandResult>): Promise<Outcome> {
  try {
    return { kind: 'resolved', result: await command };
  } catch (error) {
    return {
      kind: 'rejected',
      code:
        error && typeof error === 'object' && 'code' in error
          ? String(error.code)
          : undefined,
    };
  }
}

const COMMANDS = [
  ['vote', AGENDA_ITEM],
  ['proclaim', AGENDA_ITEM],
  ['generate-minutes', SESSION],
  ['sign-minutes', MINUTES],
  ['publish', MINUTES],
] as const;

describe('TASK-0049 — despacho produtivo de deliberação e ata', () => {
  it.each(COMMANDS)(
    'dado contexto autenticado, lock e precondições de domínio quando %s é despachado então alcança guarda nominal em vez de RAIT.VALIDATION_FAILED',
    async (command, targetId) => {
      const outcome = await observe(
        subject().execute({
          command,
          targetId,
          payload: {},
          headers: {
            'Idempotency-Key': `task-0049-${command}`,
            'If-Match': 'W/"aggregate-version"',
          },
        }),
      );

      expect(outcome.kind === 'rejected' ? outcome.code : undefined).not.toBe(
        'RAIT.VALIDATION_FAILED',
      );
    },
  );

  it.each(COMMANDS)(
    'dado %s sem If-Match do agregado pai quando é solicitado então RAIT.IF_MATCH_REQUIRED precede escrita, recibo, outbox e auditoria',
    async (command, targetId) => {
      await expect(
        subject().execute({
          command,
          targetId,
          payload: {},
          headers: { 'Idempotency-Key': `task-0049-missing-${command}` },
        }),
      ).rejects.toMatchObject({ code: 'RAIT.IF_MATCH_REQUIRED', status: 428 });
    },
  );

  it.each(COMMANDS)(
    'dado %s com tenant, ator, resultado, documento ou signatário no payload quando é solicitado então rejeita antes da transação',
    async (command, targetId) => {
      await expect(
        subject().execute({
          command,
          targetId,
          payload: {
            tenant_id: TENANT,
            actor_id: ACTOR,
            outcome: 'provido',
            document_id: '00000000-0000-7000-8000-000012000049',
            signer_person_ids: [ACTOR],
          },
          headers: {
            'Idempotency-Key': `task-0049-forged-${command}`,
            'If-Match': 'W/"aggregate-version"',
          },
        }),
      ).rejects.toMatchObject({ code: 'RAIT.VALIDATION_FAILED', status: 400 });
    },
  );

  it('dado votação de desempate CETRAN sem empate real ou sem presidente quando é despachada então rejeita RAIT.CASTING_VOTE_NOT_TIED ou RAIT.CASTING_VOTE_NOT_CHAIR antes de efeito', async () => {
    const outcome = await observe(
      subject().execute({
        command: 'vote',
        targetId: AGENDA_ITEM,
        payload: { casting_vote: true },
        headers: {
          'Idempotency-Key': 'task-0049-illegal-casting-vote',
          'If-Match': 'W/"aggregate-version"',
        },
      }),
    );

    expect(outcome.kind === 'rejected' ? outcome.code : undefined).toMatch(
      /^RAIT\.CASTING_VOTE_NOT_(TIED|CHAIR)$/u,
    );
  });
});
