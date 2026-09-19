import type { ExecutionContext } from '@nestjs/common';
import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { describe, expect, it } from 'vitest';

import { Action, Public, Resource } from './decorators.js';
import { DetranPolicyGuard } from './policy.guard.js';

@Resource('inf:ait')
class ProtectedController {
  @Action('finalize')
  finalize(): void {}
}

class PublicController {
  @Public()
  callback(): void {}
}

@Resource('inf:rait-case')
class RaitController {
  @Action('admit')
  admit(): void {}
}

function executionContext(
  classRef: new () => object,
  handler: (...args: never[]) => unknown,
  principal?: { roles: string[]; permissions: string[] },
): ExecutionContext {
  return {
    getClass: () => classRef,
    getHandler: () => handler,
    switchToHttp: () => ({
      getRequest: () => ({ headers: {}, ...(principal ? { principal } : {}) }),
      getResponse: () => undefined,
      getNext: () => undefined,
    }),
  } as unknown as ExecutionContext;
}

describe('DetranPolicyGuard', () => {
  const guard = new DetranPolicyGuard(new Reflector());

  it('allows a mapped role', () => {
    expect(
      guard.canActivate(
        executionContext(
          ProtectedController,
          ProtectedController.prototype.finalize,
          {
            roles: ['field-agent'],
            permissions: [],
          },
        ),
      ),
    ).toBe(true);
  });

  it('denies an unmapped role', () => {
    expect(() =>
      guard.canActivate(
        executionContext(
          ProtectedController,
          ProtectedController.prototype.finalize,
          {
            roles: ['CIDADAO'],
            permissions: [],
          },
        ),
      ),
    ).toThrow(ForbiddenException);
  });

  it('denies a protected route with no principal', () => {
    expect(() =>
      guard.canActivate(
        executionContext(
          ProtectedController,
          ProtectedController.prototype.finalize,
        ),
      ),
    ).toThrow('Missing authenticated DETRAN principal');
  });

  it('allows explicitly public routes', () => {
    expect(
      guard.canActivate(
        executionContext(PublicController, PublicController.prototype.callback),
      ),
    ).toBe(true);
  });

  it('dado papel negado em recurso inf:rait-* quando o guard compartilhado avalia então preserva ForbiddenException', () => {
    let thrown: unknown;
    try {
      guard.canActivate(
        executionContext(RaitController, RaitController.prototype.admit, {
          roles: ['rait-secretary'],
          permissions: [],
        }),
      );
    } catch (error) {
      thrown = error;
    }
    expect(thrown).toBeInstanceOf(ForbiddenException);
    expect(thrown).toMatchObject({ status: 403 });
    expect(JSON.stringify(thrown)).not.toContain('RAIT.');
  });

  it('dado papel negado fora de inf:rait-* quando o guard avalia então preserva ForbiddenException sem prefixo RAIT', () => {
    let thrown: unknown;
    try {
      guard.canActivate(
        executionContext(
          ProtectedController,
          ProtectedController.prototype.finalize,
          { roles: ['CIDADAO'], permissions: [] },
        ),
      );
    } catch (error) {
      thrown = error;
    }
    expect(thrown).toBeInstanceOf(ForbiddenException);
    expect(JSON.stringify(thrown)).not.toContain('RAIT.');
  });

  it('dado ausência de principal em recurso inf:rait-* quando o guard avalia então preserva a falha de autenticação vigente', () => {
    let thrown: unknown;
    try {
      guard.canActivate(
        executionContext(RaitController, RaitController.prototype.admit),
      );
    } catch (error) {
      thrown = error;
    }
    expect(thrown).toBeInstanceOf(ForbiddenException);
    expect(thrown).toMatchObject({
      message: 'Missing authenticated DETRAN principal',
    });
  });
});
