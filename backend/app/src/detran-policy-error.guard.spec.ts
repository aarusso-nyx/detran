import type { ExecutionContext } from '@nestjs/common';
import { ForbiddenException, HttpException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Action, DetranPolicyGuard, Resource } from '@detran/shared';
import { describe, expect, it, vi } from 'vitest';

type GuardConstructor = new (
  delegate: DetranPolicyGuard,
  reflector: Reflector,
) => { canActivate(context: ExecutionContext): boolean };

const modulePath = './detran-policy-error.guard.js';

@Resource('inf:rait-case')
class RaitController {
  @Action('admit')
  admit(): void {}
}

@Resource('inf:ait')
class OtherController {
  @Action('finalize')
  finalize(): void {}
}

async function subject(delegate: { canActivate: ReturnType<typeof vi.fn> }) {
  const module = (await import(modulePath)) as {
    DetranPolicyErrorGuard: GuardConstructor;
  };
  return new module.DetranPolicyErrorGuard(
    delegate as unknown as DetranPolicyGuard,
    new Reflector(),
  );
}

function context(
  controller: object,
  handler: (...args: never[]) => unknown,
  withPrincipal = true,
): ExecutionContext {
  return {
    getClass: () => controller,
    getHandler: () => handler,
    switchToHttp: () => ({
      getRequest: () => ({
        ...(withPrincipal
          ? {
              principal: {
                id: '00000000-0000-4000-8000-0000b0000001',
                roles: ['rait-secretary'],
                permissions: [],
              },
            }
          : {}),
      }),
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

describe('CTG-0001 §10.10 — adaptação local de negação da política RAIT', () => {
  it('dado papel negado em RAIT quando a guarda adapta então preserva 403 e envelope estável', async () => {
    const delegate = {
      canActivate: vi.fn(() => {
        throw new ForbiddenException('Access denied');
      }),
    };
    const guard = await subject(delegate);

    let thrown: unknown;
    try {
      guard.canActivate(
        context(RaitController, RaitController.prototype.admit),
      );
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(HttpException);
    expect((thrown as HttpException).getStatus()).toBe(403);
    expect((thrown as HttpException).getResponse()).toMatchObject({
      code: 'RAIT.FORBIDDEN_ACTION',
      status: 403,
      messageKey: 'rait.errors.forbidden_action',
      context: {
        resource: 'inf:rait-case',
        action: 'admit',
        roles: ['rait-secretary'],
      },
    });
  });

  it('dado papel permitido quando a guarda delegada autoriza então preserva true', async () => {
    const delegate = { canActivate: vi.fn(() => true) };
    const guard = await subject(delegate);
    const execution = context(RaitController, RaitController.prototype.admit);

    expect(guard.canActivate(execution)).toBe(true);
    expect(delegate.canActivate).toHaveBeenCalledWith(execution);
  });

  it('dado recurso não RAIT negado quando a guarda adapta então preserva a exceção original', async () => {
    const denial = new ForbiddenException('Access denied outside RAIT');
    const delegate = {
      canActivate: vi.fn(() => {
        throw denial;
      }),
    };
    const guard = await subject(delegate);

    expect(() =>
      guard.canActivate(
        context(OtherController, OtherController.prototype.finalize),
      ),
    ).toThrow(denial);
  });

  it('dado exceção alheia quando a guarda delegada falha então preserva a mesma exceção', async () => {
    const failure = new Error('foreign-policy-failure');
    const delegate = {
      canActivate: vi.fn(() => {
        throw failure;
      }),
    };
    const guard = await subject(delegate);

    expect(() =>
      guard.canActivate(
        context(RaitController, RaitController.prototype.admit),
      ),
    ).toThrow(failure);
  });

  it('dado principal ausente quando RAIT é protegido então a negação continua fechada', async () => {
    const denial = new ForbiddenException(
      'Missing authenticated DETRAN principal',
    );
    const delegate = {
      canActivate: vi.fn(() => {
        throw denial;
      }),
    };
    const guard = await subject(delegate);

    expect(() =>
      guard.canActivate(
        context(RaitController, RaitController.prototype.admit, false),
      ),
    ).toThrow(denial);
  });
});
