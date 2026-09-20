import { describe, expect, it } from 'vitest';

const COMMANDS = [
  'create-schedule',
  'publish-schedule',
  'create-batch',
  'approve-batch',
  'accept-batch-item',
  'declare-batch-item-impediment',
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

const TENANT = '00000000-0000-7000-8000-00000000a001';
const ACTOR = '00000000-0000-4000-8000-0000b0000005';
const TARGET = '00000000-0000-7000-8000-000028000001';

async function subject(): Promise<ProductionService> {
  const { RaitWorklistCommandService } =
    await import('../../src/handwritten/rait-worklist-command.service.js');
  return new RaitWorklistCommandService(
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

describe('TASK-0060 — despacho produtivo dos comandos worklist', () => {
  it.each(COMMANDS)(
    'dado contexto autenticado e transação RLS quando %s é despachado então alcança a guarda de domínio e não cai em RAIT.VALIDATION_FAILED',
    async (command) => {
      const service = await subject();

      const outcome = await observe(
        service.execute({
          command,
          targetId: TARGET,
          payload: {},
          headers: {
            'Idempotency-Key': `task-0060-${command}`,
            ...(command === 'create-schedule' || command === 'create-batch'
              ? {}
              : { 'If-Match': '"1"' }),
          },
        }),
      );

      expect(outcome.kind === 'rejected' ? outcome.code : undefined).not.toBe(
        'RAIT.VALIDATION_FAILED',
      );
    },
  );
});
