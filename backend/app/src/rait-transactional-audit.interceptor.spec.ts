import type { CallHandler, ExecutionContext } from '@nestjs/common';
import { AuditInterceptor } from '@stynx-nyx/backend';
import { firstValueFrom, of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { RaitCaseCommandsController } from '@detran/inf-rait-case';

import { PecSefazController } from './pec-sefaz.controller.js';

type InterceptorConstructor = new (delegate: AuditInterceptor) => {
  intercept(context: ExecutionContext, next: CallHandler): unknown;
};

const modulePath = './rait-transactional-audit.interceptor.js';

async function subject(delegate: { intercept: ReturnType<typeof vi.fn> }) {
  const module = (await import(modulePath)) as {
    RaitTransactionalAuditInterceptor: InterceptorConstructor;
  };
  return new module.RaitTransactionalAuditInterceptor(delegate as never);
}

function executionContext(
  controller: object,
  handler: (...args: never[]) => unknown,
  url: string,
): ExecutionContext {
  return {
    getClass: () => controller,
    getHandler: () => handler,
    switchToHttp: () => ({
      getRequest: () => ({ url }),
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
      getPattern: () => undefined,
    }),
    getType: () => 'http',
  } as unknown as ExecutionContext;
}

describe('CTG-0001 §10.9 — seleção local de auditoria transacional', () => {
  it('não executa o AuditInterceptor STYNX depois de um command handler RAIT concreto', async () => {
    const delegate = { intercept: vi.fn(() => of('stynx')) };
    const interceptor = await subject(delegate);
    const next = { handle: vi.fn(() => of('domain-transaction')) };

    const result = await firstValueFrom(
      interceptor.intercept(
        executionContext(
          RaitCaseCommandsController,
          RaitCaseCommandsController.prototype.admit,
          '/v1/inf/rait/cases/case/commands/admit',
        ),
        next,
      ) as ReturnType<typeof of>,
    );

    expect(result).toBe('domain-transaction');
    expect(next.handle).toHaveBeenCalledOnce();
    expect(delegate.intercept).not.toHaveBeenCalled();
  });

  it('delega handler não RAIT mesmo quando a URL tenta simular o prefixo RAIT', async () => {
    const delegate = {
      intercept: vi.fn((_context, next: CallHandler) => next.handle()),
    };
    const interceptor = await subject(delegate);
    const next = { handle: vi.fn(() => of('preserved-stynx-audit')) };
    const context = executionContext(
      PecSefazController,
      PecSefazController.prototype.validatePayment,
      '/v1/inf/rait/cases/spoof/commands/admit',
    );

    await expect(
      firstValueFrom(
        interceptor.intercept(context, next) as ReturnType<typeof of>,
      ),
    ).resolves.toBe('preserved-stynx-audit');
    expect(delegate.intercept).toHaveBeenCalledOnce();
    expect(delegate.intercept).toHaveBeenCalledWith(context, next);
  });

  it('seleciona por identidade do handler, não por URL controlada pelo cliente', async () => {
    const delegate = { intercept: vi.fn(() => of('stynx')) };
    const interceptor = await subject(delegate);
    const next = { handle: vi.fn(() => of('domain-transaction')) };

    await expect(
      firstValueFrom(
        interceptor.intercept(
          executionContext(
            RaitCaseCommandsController,
            RaitCaseCommandsController.prototype.remit,
            '/unrelated-client-url',
          ),
          next,
        ) as ReturnType<typeof of>,
      ),
    ).resolves.toBe('domain-transaction');
    expect(delegate.intercept).not.toHaveBeenCalled();
  });
});
