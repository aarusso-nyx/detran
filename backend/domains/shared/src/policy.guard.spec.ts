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
});
