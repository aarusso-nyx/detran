// Sessão do console (CTG-0002.md §4): papéis e permissões vêm da sessão STYNX — as chaves
// `dashboard:*` são as calculadas por `permissionsForRoles` no servidor (mesma fonte, sem tabela
// paralela). `can()` repete literalmente a regra de `isDetranActionAllowed` ('*', chave literal,
// '<recurso>:*'), é fail-closed e NUNCA consulta tabela de papéis; a camada é assunto do
// `layerGuard` (`layer-table.ts`, provisório OD-D16-006).
import { Injectable, computed, inject, type Signal } from '@angular/core';
import { StynxSessionService } from '@stynx-nyx/angular-auth';
import type { DashboardPolicyKey } from '../app.route-manifest';
import {
  canonicalRoleCode,
  dashboardLayerFor,
  type DashboardLayer,
} from './layer-table';

const GROUPS_CLAIM = 'cognito:groups';
const ROLES_CLAIM = 'roles';

function stringsOf(value: unknown): readonly string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

/**
 * União, nesta ordem e sem repetição, de `claims['cognito:groups']` e `claims['roles']` quando
 * cada um é um array de strings; qualquer outro formato contribui `[]`.
 */
export function rolesFromClaims(
  claims: Record<string, unknown> | null | undefined,
): readonly string[] {
  if (!claims) return [];
  const roles: string[] = [];
  for (const role of [
    ...stringsOf(claims[GROUPS_CLAIM]),
    ...stringsOf(claims[ROLES_CLAIM]),
  ]) {
    if (!roles.includes(role)) roles.push(role);
  }
  return roles;
}

/** `'*'` | chave literal | `'<recurso>:*'`; chave malformada (≠ 3 segmentos) → `false`. */
export function permissionAllows(
  permissions: readonly string[],
  policy: string,
): boolean {
  const segments = policy.split(':');
  if (segments.length !== 3) return false;
  const resource = segments.slice(0, -1).join(':');
  return (
    permissions.includes('*') ||
    permissions.includes(policy) ||
    permissions.includes(`${resource}:*`)
  );
}

/** Token de injeção (classe abstrata, substituível nos testes — `detran-ui-guide.md` §5). */
@Injectable({
  providedIn: 'root',
  useFactory: () => inject(StynxDashboardSessionFacade),
})
export abstract class DashboardSessionFacade {
  abstract readonly active: Signal<boolean>;
  /** `rolesFromClaims(state().claims)`, cada um canonicalizado. */
  abstract readonly roles: Signal<readonly string[]>;
  /** `state().permissions` (do servidor; `['*']` para o passe global). */
  abstract readonly permissions: Signal<readonly string[]>;
  /** Provisório enquanto OD-D16-006 não fecha. */
  abstract readonly layer: Signal<DashboardLayer>;
  abstract can(policy: DashboardPolicyKey | string): boolean;
  abstract hasRole(...codes: readonly string[]): boolean;
  abstract login(): void;
  abstract logout(): Promise<void>;
}

@Injectable({ providedIn: 'root' })
export class StynxDashboardSessionFacade extends DashboardSessionFacade {
  private readonly stynx = inject(StynxSessionService);

  readonly active = this.stynx.active;

  readonly roles = computed<readonly string[]>(() =>
    rolesFromClaims(this.stynx.state().claims).map(canonicalRoleCode),
  );

  readonly permissions = computed<readonly string[]>(
    () => this.stynx.state().permissions,
  );

  readonly layer = computed<DashboardLayer>(() =>
    dashboardLayerFor(this.roles()),
  );

  can(policy: DashboardPolicyKey | string): boolean {
    return permissionAllows(this.permissions(), policy);
  }

  hasRole(...codes: readonly string[]): boolean {
    const roles = this.roles();
    return codes.some((code) => roles.includes(code));
  }

  login(): void {
    this.stynx.login();
  }

  async logout(): Promise<void> {
    await this.stynx.logout();
  }
}
