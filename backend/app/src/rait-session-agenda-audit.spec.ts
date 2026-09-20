import type { CallHandler, ExecutionContext } from '@nestjs/common';
import { AuditInterceptor } from '@stynx-nyx/backend';
import { firstValueFrom, of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { RaitTransactionalAuditInterceptor } from './rait-transactional-audit.interceptor.js';

const HANDLERS = [
  'closeAgenda',
  'open',
  'adjourn',
  'conveneExtraordinary',
  'read',
  'view',
  'withdraw',
] as const;

type Handler = (...args: never[]) => unknown;
type SessionController = { prototype: Record<string, Handler> };

async function controller(): Promise<SessionController> {
  const module = (await import(
    new URL(
      '../../domains/inf/rait-session/src/handwritten/rait-session-commands.controller.js',
      import.meta.url,
    ).href
  )) as { RaitSessionCommandsController: SessionController };
  return module.RaitSessionCommandsController;
}

function context(
  sessionController: SessionController,
  handler: Handler,
): ExecutionContext {
  return {
    getClass: () => sessionController,
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

describe('TASK-0047 — auditoria única de sessão e pauta', () => {
  it.each(HANDLERS)(
    'dado o handler %s quando passa pelo interceptor então não cria auditoria HTTP duplicada',
    async (handlerName) => {
      const RaitSessionCommandsController = await controller();
      const handler = RaitSessionCommandsController.prototype[handlerName];
      expect(handler).toBeTypeOf('function');
      const delegate = { intercept: vi.fn(() => of('duplicated-audit')) };
      const interceptor = new RaitTransactionalAuditInterceptor(
        delegate as unknown as AuditInterceptor,
      );
      const next = { handle: vi.fn(() => of('single-transaction-audit')) };

      await expect(
        firstValueFrom(
          interceptor.intercept(
            context(RaitSessionCommandsController, handler),
            next as unknown as CallHandler,
          ) as ReturnType<typeof of>,
        ),
      ).resolves.toBe('single-transaction-audit');
      expect(next.handle).toHaveBeenCalledOnce();
      expect(delegate.intercept).not.toHaveBeenCalled();
    },
  );
});
