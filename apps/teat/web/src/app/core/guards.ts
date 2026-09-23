import {
  inject,
  Injectable,
  InjectionToken,
  signal,
  type Signal,
} from '@angular/core';
import type { CanActivateFn, CanMatchFn, UrlSegment } from '@angular/router';
import { StynxSessionService } from '@stynx-nyx/angular-auth';
import { TenantContextService } from '@stynx-nyx/angular-tenancy';
import { catchError, firstValueFrom, map, of } from 'rxjs';

import { WebClientRegistry } from '../data/web-client.registry.js';
import type { TeatWebRole } from './roles.js';

export interface TeatWebSession {
  readonly authenticated: boolean;
  readonly role?: string;
}

export interface TeatWebTenant {
  readonly tenantId?: string;
}

export interface TeatWebRouteContext {
  readonly available: boolean;
}

export interface TeatWebRouteContextResolution {
  readonly resource?: string;
  readonly tenantId?: string;
  readonly resolved: boolean;
  readonly available: boolean;
}

export interface TeatWebRouteContextResolver {
  readonly state: Signal<TeatWebRouteContextResolution>;
  resolve(resource: string, tenantId: string, available: boolean): void;
}

@Injectable({ providedIn: 'root' })
export class DefaultTeatWebRouteContextResolver implements TeatWebRouteContextResolver {
  readonly state = signal<TeatWebRouteContextResolution>({
    resolved: false,
    available: false,
  });

  resolve(resource: string, tenantId: string, available: boolean): void {
    this.state.set({ resource, tenantId, resolved: true, available });
  }
}

export const TEAT_WEB_SESSION = new InjectionToken<TeatWebSession>(
  'TEAT_WEB_SESSION',
);
export const TEAT_WEB_TENANT = new InjectionToken<TeatWebTenant>(
  'TEAT_WEB_TENANT',
);
export const TEAT_WEB_ROUTE_CONTEXT = new InjectionToken<TeatWebRouteContext>(
  'TEAT_WEB_ROUTE_CONTEXT',
);
export const TEAT_WEB_ROUTE_CONTEXT_RESOLVER =
  new InjectionToken<TeatWebRouteContextResolver>(
    'TEAT_WEB_ROUTE_CONTEXT_RESOLVER',
  );

function isLoginRoute(path: string | undefined): boolean {
  return path === 'login';
}

export const authGuard: CanMatchFn = (route) => {
  return isLoginRoute(route.path) || inject(StynxSessionService).active();
};

export const tenantGuard: CanMatchFn = (route) => {
  if (isLoginRoute(route.path)) return true;
  const tenantId = inject(TenantContextService).tenantId();
  return typeof tenantId === 'string' && tenantId.length > 0;
};

export const roleGuard: CanMatchFn = (route) => {
  if (isLoginRoute(route.path)) return true;
  const session = inject(StynxSessionService);
  const allowedRoles = (route.data?.['allowedRoles'] ??
    []) as readonly TeatWebRole[];
  return sessionHasAnyRole(session, allowedRoles);
};

export const contextGuard: CanMatchFn = (route) => {
  const session = inject(StynxSessionService);
  const tenantId = inject(TenantContextService).tenantId();
  const resolver = inject(TEAT_WEB_ROUTE_CONTEXT_RESOLVER, { optional: true });
  const routeContext = inject(TEAT_WEB_ROUTE_CONTEXT, { optional: true });
  const endpoint = route.data?.['endpoint'];
  const runtimeClient = route.data?.['runtimeClient'];
  const allowedRoles = (route.data?.['allowedRoles'] ??
    []) as readonly TeatWebRole[];
  if (resolver === null) {
    return (
      session.active() &&
      typeof tenantId === 'string' &&
      tenantId.length > 0 &&
      sessionHasAnyRole(session, allowedRoles) &&
      routeContext?.available === true
    );
  }
  if (
    !session.active() ||
    typeof tenantId !== 'string' ||
    tenantId.length === 0 ||
    !sessionHasAnyRole(session, allowedRoles) ||
    typeof endpoint !== 'string' ||
    typeof runtimeClient !== 'string'
  ) {
    return false;
  }
  const clients = inject(WebClientRegistry);
  return resolveRouteContext(
    resolver,
    clients,
    { endpoint, runtimeClient },
    tenantId,
  );
};

function resolveRouteContext(
  resolver: TeatWebRouteContextResolver,
  clients: WebClientRegistry,
  resource: Readonly<{ endpoint: string; runtimeClient: string }>,
  tenantId: string,
): Promise<boolean> {
  resolver.resolve(resource.endpoint, tenantId, false);
  return firstValueFrom(
    clients.query(resource.runtimeClient, resource.endpoint).pipe(
      map((value) => {
        const available =
          Array.isArray(value) &&
          value.some(
            (record) =>
              typeof record === 'object' &&
              record !== null &&
              'id' in record &&
              typeof record.id === 'string' &&
              record.id.length > 0 &&
              'tenant_id' in record &&
              record.tenant_id === tenantId,
          );
        resolver.resolve(resource.endpoint, tenantId, available);
        return available;
      }),
      catchError(() => {
        resolver.resolve(resource.endpoint, tenantId, false);
        return of(false);
      }),
    ),
  );
}

export const auth: CanMatchFn = (route) =>
  isLoginRoute(route.path) || inject(StynxSessionService).active();
export const tenant: CanMatchFn = (route, segments) => {
  if (isLoginRoute(route.path)) return true;
  if (route.path === '**' && segments[0]?.path === 'ux') return false;
  const tenantId = inject(TenantContextService).tenantId();
  return typeof tenantId === 'string' && tenantId.length > 0;
};
export const role: CanMatchFn = (route) => {
  if (isLoginRoute(route.path)) return true;
  const session = inject(StynxSessionService);
  const allowedRoles = (route.data?.['allowedRoles'] ??
    []) as readonly TeatWebRole[];
  return sessionHasAnyRole(session, allowedRoles);
};

function sessionHasAnyRole(
  session: StynxSessionService,
  allowedRoles: readonly TeatWebRole[],
): boolean {
  const roleAware = session as unknown as Readonly<{
    hasAnyRole?: (roles: readonly string[]) => boolean;
    roles?: () => readonly string[];
  }>;
  if (roleAware.hasAnyRole !== undefined) {
    return roleAware.hasAnyRole(allowedRoles);
  }
  const directRoles = roleAware.roles?.() ?? [];
  if (
    directRoles.some((candidate) =>
      allowedRoles.includes(candidate as TeatWebRole),
    )
  ) {
    return true;
  }
  const claims = session.state().claims;
  const claimRoles = [claims?.['roles'], claims?.['cognito:groups']]
    .filter(Array.isArray)
    .flat() as unknown[];
  return claimRoles.some(
    (candidate) =>
      typeof candidate === 'string' &&
      allowedRoles.includes(candidate as TeatWebRole),
  );
}

export const PRODUCT_GUARDS = [authGuard, tenantGuard, roleGuard] as const;
export const CONTEXTUAL_PRODUCT_GUARDS = [
  authGuard,
  tenantGuard,
  roleGuard,
  contextGuard,
] as const;
export const EXPLICIT_PRODUCT_GUARDS = [auth, tenant, role] as const;
export const EXPLICIT_OPERATIONAL_GUARDS = [auth, tenant] as const;

export function deniedNavigationMatcher(
  segments: UrlSegment[],
): Readonly<{ consumed: UrlSegment[] }> | null {
  return segments.length === 0 ? null : { consumed: segments };
}

export const denyNavigation: CanActivateFn = () => false;
