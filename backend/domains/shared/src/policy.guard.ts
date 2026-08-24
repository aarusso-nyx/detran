import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { getPrincipalFromRequest, type RequestLike } from '@stynx-nyx/backend';

import {
  DETRAN_ACTION_METADATA_KEY,
  DETRAN_PUBLIC_METADATA_KEY,
  DETRAN_RESOURCE_METADATA_KEY,
} from './decorators.js';
import { isDetranActionAllowed } from './policy.js';

@Injectable()
export class DetranPolicyGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const handler = context.getHandler();
    const classRef = context.getClass();
    if (
      this.reflector.getAllAndOverride<boolean | undefined>(
        DETRAN_PUBLIC_METADATA_KEY,
        [handler, classRef],
      )
    ) {
      return true;
    }
    const resource = this.reflector.getAllAndOverride<string | undefined>(
      DETRAN_RESOURCE_METADATA_KEY,
      [handler, classRef],
    );
    const action = this.reflector.get<string | undefined>(
      DETRAN_ACTION_METADATA_KEY,
      handler,
    );
    if (!resource || !action) return true;
    const request = context.switchToHttp().getRequest<RequestLike>();
    const principal = getPrincipalFromRequest(request);
    if (!principal)
      throw new ForbiddenException('Missing authenticated DETRAN principal');
    if (!isDetranActionAllowed(principal, resource, action)) {
      throw new ForbiddenException(`Access denied for ${resource}:${action}`);
    }
    return true;
  }
}
