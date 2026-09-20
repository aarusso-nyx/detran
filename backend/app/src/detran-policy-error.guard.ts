import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { getPrincipalFromRequest, type RequestLike } from '@stynx-nyx/backend';

import {
  DETRAN_ACTION_METADATA_KEY,
  DETRAN_RESOURCE_METADATA_KEY,
  DetranError,
  DetranPolicyGuard,
} from '@detran/shared';

import { asDetranHttpException } from './detran-error.filter.js';

@Injectable()
export class DetranPolicyErrorGuard implements CanActivate {
  constructor(
    private readonly delegate: DetranPolicyGuard,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    try {
      return this.delegate.canActivate(context);
    } catch (error) {
      if (error instanceof ForbiddenException) {
        const resource = this.reflector.getAllAndOverride<string | undefined>(
          DETRAN_RESOURCE_METADATA_KEY,
          [context.getHandler(), context.getClass()],
        );
        const action = this.reflector.get<string | undefined>(
          DETRAN_ACTION_METADATA_KEY,
          context.getHandler(),
        );
        const principal = getPrincipalFromRequest(
          context.switchToHttp().getRequest<RequestLike>(),
        );
        if (resource?.startsWith('inf:rait-') && action && principal)
          throw asDetranHttpException(
            new DetranError('RAIT.FORBIDDEN_ACTION', {
              status: 403,
              messageKey: 'rait.errors.forbidden_action',
              message: 'Ação não permitida para o papel autenticado.',
              context: { resource, action, roles: principal.roles },
            }),
          );
      }
      throw error;
    }
  }
}
