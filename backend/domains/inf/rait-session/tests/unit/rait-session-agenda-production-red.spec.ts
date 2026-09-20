import { describe, expect, it } from 'vitest';

import { RaitSessionCommandService } from '../../src/handwritten/rait-session-command.service.js';

const TENANT = '00000000-0000-7000-8000-00000000a001';
const ACTOR = '00000000-0000-4000-8000-0000b0000005';
const SESSION = '00000000-0000-7000-8000-000030000003';
const AGENDA_ITEM = '00000000-0000-7000-8000-000031000002';

const COMMANDS = [
  ['close-agenda', SESSION],
  ['adjourn', SESSION],
  ['convene-extraordinary', SESSION],
  ['read', AGENDA_ITEM],
  ['view', AGENDA_ITEM],
  ['withdraw', AGENDA_ITEM],
] as const;

type CommandResult = {
  readonly data: Record<string, unknown>;
  readonly events: readonly { readonly type: string }[];
  readonly etag: string;
};
type ProductionService = {
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

function subject(): ProductionService {
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
  ) as unknown as ProductionService;
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

describe('TASK-0047 — despacho produtivo de pauta e sessão', () => {
  it.each(COMMANDS)(
    'dado contexto autenticado e lock transacional quando %s é despachado então alcança a guarda de domínio e não cai em RAIT.VALIDATION_FAILED',
    async (command, targetId) => {
      const outcome = await observe(
        subject().execute({
          command,
          targetId,
          payload: {},
          headers: {
            'Idempotency-Key': `task-0047-${command}`,
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
    'dado %s sem If-Match do agregado pai quando é solicitado então RAIT.IF_MATCH_REQUIRED precede qualquer efeito',
    async (command, targetId) => {
      const outcome = await observe(
        subject().execute({
          command,
          targetId,
          payload: {},
          headers: { 'Idempotency-Key': `task-0047-missing-${command}` },
        }),
      );

      expect(outcome).toEqual({
        kind: 'rejected',
        code: 'RAIT.IF_MATCH_REQUIRED',
      });
    },
  );

  it.each(COMMANDS)(
    'dado %s com tenant, ator, papel, versão ou sustentação oral no payload quando é solicitado então rejeita antes da transação',
    async (command, targetId) => {
      const outcome = await observe(
        subject().execute({
          command,
          targetId,
          payload: {
            tenant_id: TENANT,
            actor_id: ACTOR,
            roles: ['rait-chair'],
            version: 999,
            oral_argument: true,
          },
          headers: {
            'Idempotency-Key': `task-0047-forged-${command}`,
            'If-Match': 'W/"aggregate-version"',
          },
        }),
      );

      expect(outcome).toEqual({
        kind: 'rejected',
        code: 'RAIT.VALIDATION_FAILED',
      });
    },
  );
});
