// Sessão do console (plan.md M4; contrato CTG-0002a §4): papéis do principal = união das claims
// `cognito:groups` e `roles` de `StynxSessionService.state().claims` — a mesma fonte do backend
// (`backend/app/src/detran-runtime.ts` `roleClaims`, default `cognito:groups,roles`); permissões
// = `state().permissions` (chaves `inf:rait-<recurso>:<ação>` de `policy.ts`, sem tabela paralela).
// `RaitSessionFacade` é o token de injeção (classe abstrata, substituível por `useValue` nos
// testes); `StynxRaitSessionFacade` é a implementação, sem `HttpClient`.
import { Injectable, type Signal, computed, inject } from '@angular/core';
import { StynxSessionService } from '@stynx-nyx/angular-auth';
import {
  RAIT_ALL_ROLES,
  RAIT_ROLE_PRECEDENCE,
  type RaitRoleCode,
} from '../app.route-manifest';

const GROUPS_CLAIM = 'cognito:groups';
const ROLES_CLAIM = 'roles';

function stringItems(value: unknown): readonly string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

/**
 * União, nesta ordem e sem repetição, de `claims['cognito:groups']` e `claims['roles']` quando
 * cada um é array de strings (itens não-string descartados); qualquer outro formato contribui `[]`.
 */
export function rolesFromClaims(
  claims: Record<string, unknown> | null | undefined,
): readonly string[] {
  if (!claims) return [];
  const union = new Set<string>([
    ...stringItems(claims[GROUPS_CLAIM]),
    ...stringItems(claims[ROLES_CLAIM]),
  ]);
  return [...union];
}

const CANONICAL: ReadonlySet<string> = new Set(RAIT_ALL_ROLES);

/** `roles ∩ RAIT_ALL_ROLES`, na ordem de `RAIT_ROLE_PRECEDENCE`. */
export function canonicalRolesOf(
  roles: readonly string[],
): readonly RaitRoleCode[] {
  const present = new Set(roles.filter((role) => CANONICAL.has(role)));
  return RAIT_ROLE_PRECEDENCE.filter((role) => present.has(role));
}

@Injectable({
  providedIn: 'root',
  useFactory: () => inject(StynxRaitSessionFacade),
})
export abstract class RaitSessionFacade {
  abstract readonly active: Signal<boolean>;
  abstract readonly roles: Signal<readonly string[]>;
  /** `state().permissions` — chaves `inf:rait-<recurso>:<ação>`. */
  abstract readonly permissions: Signal<readonly string[]>;
  /** `roles() ∩ RAIT_ALL_ROLES`, ordem de `RAIT_ROLE_PRECEDENCE`. */
  abstract readonly canonicalRoles: Signal<readonly RaitRoleCode[]>;
  /** Algum de `codes` ∈ `roles()`. */
  abstract hasRole(...codes: readonly string[]): boolean;
  /** `permission` ∈ `permissions()` (fail-closed). */
  abstract can(permission: string): boolean;
  abstract login(): void;
  abstract logout(): Promise<void>;
}

@Injectable({ providedIn: 'root' })
export class StynxRaitSessionFacade extends RaitSessionFacade {
  private readonly stynx = inject(StynxSessionService);

  readonly active = computed(() => this.stynx.active());
  readonly roles = computed(() => rolesFromClaims(this.stynx.state().claims));
  readonly permissions = computed<readonly string[]>(
    () => this.stynx.state().permissions ?? [],
  );
  readonly canonicalRoles = computed(() => canonicalRolesOf(this.roles()));

  hasRole(...codes: readonly string[]): boolean {
    const roles = this.roles();
    return codes.some((code) => roles.includes(code));
  }

  can(permission: string): boolean {
    return this.permissions().includes(permission);
  }

  login(): void {
    this.stynx.login();
  }

  logout(): Promise<void> {
    return this.stynx.logout();
  }
}
