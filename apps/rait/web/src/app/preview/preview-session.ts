// Sessão sintética da prévia (R-0033 TASK-0003; `frontend-preview-mode.md` §1 item 6, §2, D-03,
// D-14; P-23). Um papel por documento (`PreviewStateService.role()`, D-01/D-02); as guardas do app
// (`raitAuthGuard` → `roleGuard` → `caseAccessGuard`) continuam ATIVAS e decidem sobre esta sessão.
//
// - `PreviewSessionFacade` substitui `RaitSessionFacade` (ativa; `roles` = `[papel]`;
//   `permissions` = `PREVIEW_ROLE_PERMISSIONS[papel]`; `canonicalRoles` por `canonicalRolesOf`).
// - `PreviewStynxSessionService` substitui `StynxSessionService` por `useClass` — a diretiva
//   `*stynxHasPermission`, o `raitAuthGuard` e o `AuthInterceptor` do kit leem o serviço do kit, não
//   a facade. Implementa TODO membro público do `.d.ts` de `@stynx-nyx/angular-auth` 1.4.0
//   (`Pick<StynxSessionService, keyof StynxSessionService>`, verificado pelo `typecheck`), na forma
//   de `src/testing/stynx-session.stub.ts`: `state`, `active`, `active$`, `snapshot`,
//   `hasAllPermissions`, `hasAnyPermissions`; `login`, `loginRedirect`, `logout`, `completeLogin`,
//   `switchTenant`, `onAuthFailure` são no-op que NUNCA navegam nem disparam OIDC;
//   `getAccessToken`/`refresh` resolvem `null` (sem token). `claims` só com `cognito:groups` e
//   `roles` — sem `sub`/`name`/`email` (D-03); `tenantId` = tenant das fixtures.
import {
  Injectable,
  computed,
  effect,
  inject,
  signal,
  type Signal,
} from '@angular/core';
import type {
  StynxSessionService,
  StynxSessionState,
} from '@stynx-nyx/angular-auth';
import { BehaviorSubject, type Observable } from 'rxjs';
import type { RaitRoleCode } from '../app.route-manifest';
import { RaitSessionFacade, canonicalRolesOf } from '../core/session.facade';
import { PREVIEW_TENANT_ID } from './preview-fixtures';
import { PREVIEW_ROLE_PERMISSIONS } from './preview-permissions';
import { PreviewStateService } from './preview-state.service';

const GROUPS_CLAIM = 'cognito:groups';
const ROLES_CLAIM = 'roles';

function sessionStateOf(role: RaitRoleCode): StynxSessionState {
  return {
    active: true,
    accessToken: null,
    refreshToken: null,
    sid: null,
    permissions: [...PREVIEW_ROLE_PERMISSIONS[role]],
    tenantId: PREVIEW_TENANT_ID,
    claims: { [GROUPS_CLAIM]: [role], [ROLES_CLAIM]: [role] },
  };
}

@Injectable()
export class PreviewSessionFacade extends RaitSessionFacade {
  private readonly preview = inject(PreviewStateService);

  readonly active: Signal<boolean> = signal(true).asReadonly();
  readonly roles = computed<readonly string[]>(() => [this.preview.role()]);
  readonly permissions = computed<readonly string[]>(
    () => PREVIEW_ROLE_PERMISSIONS[this.preview.role()],
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
    // Prévia: sessão sintética sempre ativa; nunca inicia OIDC.
  }

  logout(): Promise<void> {
    // Prévia: a sessão não termina; nenhuma navegação.
    return Promise.resolve();
  }
}

@Injectable()
export class PreviewStynxSessionService implements Pick<
  StynxSessionService,
  keyof StynxSessionService
> {
  private readonly preview = inject(PreviewStateService);

  readonly state: Signal<StynxSessionState> = computed(() =>
    sessionStateOf(this.preview.role()),
  );
  readonly active: Signal<boolean> = computed(() => this.state().active);

  private readonly states = new BehaviorSubject<StynxSessionState>(
    this.state(),
  );

  /** `@deprecated` no kit, mas assinado pelo construtor de `StynxHasPermissionDirective`. */
  readonly active$: Observable<StynxSessionState> = this.states.asObservable();

  constructor() {
    // Emite a cada troca de papel (a diretiva reavalia ao receber o novo estado).
    effect(() => {
      const next = this.state();
      if (next !== this.states.value) this.states.next(next);
    });
  }

  snapshot(): StynxSessionState {
    return this.state();
  }

  hasAllPermissions(required: string[]): boolean {
    const granted = this.state().permissions;
    return required.every((permission) => granted.includes(permission));
  }

  hasAnyPermissions(required: string[]): boolean {
    const granted = this.state().permissions;
    return required.some((permission) => granted.includes(permission));
  }

  login(): void {
    // Prévia: nunca redireciona para o provedor OIDC.
  }

  loginRedirect(): void {
    // Prévia: nunca redireciona para o provedor OIDC.
  }

  completeLogin(_url?: string): Promise<StynxSessionState> {
    return Promise.resolve(this.state());
  }

  logout(): Promise<void> {
    return Promise.resolve();
  }

  getAccessToken(): Promise<string | null> {
    return Promise.resolve(null);
  }

  refresh(): Promise<string | null> {
    return Promise.resolve(null);
  }

  onAuthFailure(): Promise<void> {
    return Promise.resolve();
  }

  switchTenant(_tenantId: string): Promise<StynxSessionState> {
    return Promise.resolve(this.state());
  }
}
