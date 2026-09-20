import type { CallHandler, ExecutionContext } from '@nestjs/common';
import { AuditInterceptor } from '@stynx-nyx/backend';
import { firstValueFrom, of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { RaitTransactionalAuditInterceptor } from './rait-transactional-audit.interceptor.js';

type Handler = (...args: never[]) => unknown;

const COMMANDS = [
  ['createSchedule', '/v1/inf/rait/schedules'],
  ['publishSchedule', '/v1/inf/rait/schedules/id/publish'],
  ['createBatch', '/v1/inf/rait/batches'],
  ['approveBatch', '/v1/inf/rait/batches/id/approve'],
  ['acceptBatchItem', '/v1/inf/rait/batches/id/items/case/accept'],
  [
    'declareBatchItemImpediment',
    '/v1/inf/rait/batches/id/items/case/impediment',
  ],
] as const;

type WorklistController = { prototype: Record<string, Handler> };

async function worklistController(): Promise<WorklistController> {
  const module = (await import(
    new URL(
      '../../domains/inf/rait-worklist/src/handwritten/rait-worklist-commands.controller.js',
      import.meta.url,
    ).href
  )) as { RaitWorklistCommandsController: WorklistController };
  return module.RaitWorklistCommandsController;
}

function context(
  controller: WorklistController,
  handler: Handler,
): ExecutionContext {
  return {
    getClass: () => controller,
    getHandler: () => handler,
    switchToHttp: () => ({
      getRequest: () => ({}),
      getResponse: () => ({}),
      getNext: () => undefined,
    }),
    getArgs: () => [],
    getArgByIndex: () => undefined,
    switchToRpc: () => ({
      getContext: () => undefined,
      getData: () => undefined,
    }),
    switchToWs: () => ({
      getClient: () => undefined,
      getData: () => undefined,
    }),
    getType: () => 'http',
  } as unknown as ExecutionContext;
}

describe('TASK-0060 — auditoria única para comandos worklist', () => {
  it.each(COMMANDS)(
    'dado o handler %s quando o comando passa pelo interceptor então a auditoria transacional do domínio não é duplicada',
    async (handlerName) => {
      const RaitWorklistCommandsController = await worklistController();
      const delegate = { intercept: vi.fn(() => of('duplicated-audit')) };
      const interceptor = new RaitTransactionalAuditInterceptor(
        delegate as unknown as AuditInterceptor,
      );
      const handler = RaitWorklistCommandsController.prototype[handlerName];
      const next = { handle: vi.fn(() => of('single-transaction-audit')) };

      await expect(
        firstValueFrom(
          interceptor.intercept(
            context(RaitWorklistCommandsController, handler),
            next as unknown as CallHandler,
          ) as ReturnType<typeof of>,
        ),
      ).resolves.toBe('single-transaction-audit');
      expect(next.handle).toHaveBeenCalledOnce();
      expect(delegate.intercept).not.toHaveBeenCalled();
    },
  );
});
