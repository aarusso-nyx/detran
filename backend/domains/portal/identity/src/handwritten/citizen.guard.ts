// Guarda de identidade do cidadão (work/rounds/R-0009/contracts/CTG-0001.md
// §3; plan R-0009 M4 e adenda A1(f); ADR-0024 §4). Roda DEPOIS dos guards
// globais do STYNX (autenticação → tenant → política): não é política — nunca
// consulta `principal.permissions` — e `technical-admin`/`*` não a contorna.
// Ordem fixada: principal → claims (fail-closed) → papel CIDADAO → marca a
// requisição. O acessor do principal é o mesmo do `DetranPolicyGuard`
// (`getPrincipalFromRequest` de `@stynx-nyx/backend`, que lê `request.principal`).
import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
} from '@nestjs/common';
import {
  canonicalRoles,
  getPrincipalFromRequest,
  type RequestLike,
} from '@detran/shared';

import { PortalError } from './errors.js';
import {
  portalIdentityClaims,
  type PortalIdentityClaims,
} from './identity.service.js';

/** Propriedade da requisição HTTP preenchida pela guarda (§3 passo 4). */
export const PORTAL_IDENTITY_REQUEST_KEY = 'portalIdentity';

export interface PortalIdentityRequest {
  [PORTAL_IDENTITY_REQUEST_KEY]?: PortalIdentityClaims;
}

@Injectable()
export class PortalCitizenGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<RequestLike & PortalIdentityRequest>();
    const principal = getPrincipalFromRequest(request);
    if (!principal) {
      throw new PortalError('PORTAL.AUTH_REQUIRED', {
        status: 401,
        context: {},
      });
    }
    const claims = portalIdentityClaims(principal);
    if (!claims) {
      throw new PortalError('PORTAL.ASSURANCE_NOT_VERIFIED', {
        status: 403,
        context: {},
      });
    }
    if (!canonicalRoles(principal.roles ?? []).includes('CIDADAO')) {
      throw new PortalError('PORTAL.IDENTITY_NOT_CITIZEN', {
        status: 403,
        context: {},
      });
    }
    request[PORTAL_IDENTITY_REQUEST_KEY] = claims;
    return true;
  }
}

/**
 * Claims validadas pela guarda; ausência significa controlador sem
 * `@UseGuards(PortalCitizenGuard)` — defeito interno, nunca 403.
 */
export function portalIdentityOf(
  request: PortalIdentityRequest,
): PortalIdentityClaims {
  const identity = request[PORTAL_IDENTITY_REQUEST_KEY];
  if (!identity) {
    throw new PortalError('PORTAL.INTERNAL', { status: 500, context: {} });
  }
  return identity;
}
