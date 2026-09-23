// Shell do console (CTG-0002.md §5): marca, navegação por camada de decisão (Ação › Vigilância
// › Contexto › Técnico, `route-manifest.md` §I), atalho para o conteúdo, saída da sessão e a
// região viva onde o fallback de polling do stream é anunciado. O item de menu só aparece
// quando as MESMAS regras das guardas passam — nenhuma tabela paralela.
//
// OD-D16-014: `DetranNavItem` (kit) não tem grupo; o shell passa `navigation: []` e renderiza a
// navegação agrupada no slot `[detran-sidenav-footer]` até o kit ganhar `group` por ADR.
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DetranAppShellComponent, StynxTranslatePipe } from '@detran/ui';
import {
  DASHBOARD_ROUTE_MANIFEST,
  i18nSegmentOf,
  type DashboardScreenId,
} from '../app.route-manifest';
import { dashboardLayerAllows } from './layer-table';
import { DashboardSessionFacade, permissionAllows } from './session.facade';
import { SseService } from './sse/sse.service';

export type DashboardNavGroupKey =
  'acao' | 'vigilancia' | 'contexto' | 'tecnico';

/** Ordem fixa das camadas de decisão (§I). */
export const NAV_GROUP_ORDER: readonly DashboardNavGroupKey[] = [
  'acao',
  'vigilancia',
  'contexto',
  'tecnico',
];

/** §I, literal. D-02, D-07, D-09 e as filhas de §B ficam fora do menu. */
export const NAV_GROUP_OF: Readonly<
  Record<DashboardScreenId, DashboardNavGroupKey>
> = {
  'D-01': 'acao',
  'D-03': 'acao',
  'D-04': 'acao',
  'D-05': 'acao',
  'D-06': 'acao',
  'D-08': 'acao',
  'D-10': 'vigilancia',
  'D-12': 'vigilancia',
  'D-11': 'contexto',
  'D-13': 'contexto',
  'D-14': 'contexto',
  'D-16': 'contexto',
  'D-17': 'contexto',
  'D-18': 'contexto',
  'D-15': 'tecnico',
};

export interface DashboardNavItem {
  readonly id: DashboardScreenId;
  readonly link: string;
  readonly labelKey: string;
}

export interface DashboardNavGroup {
  readonly key: DashboardNavGroupKey;
  readonly labelKey: string;
  readonly items: readonly DashboardNavItem[];
}

const BRAND_KEY = 'dashboard.shell.brand';
const SKIP_KEY = 'dashboard.a11y.skip_to_content';
const NAV_MAIN_KEY = 'dashboard.a11y.nav_main';
const LIVE_REGION_KEY = 'dashboard.a11y.live_region';
const LOGOUT_KEY = 'dashboard.common.action.logout';
const UNAVAILABLE_KEY = 'dashboard.states.unavailable';
const HOME_LINK = '/monitoramento';
const CONTENT_ID = 'conteudo';

/**
 * Pura: o item entra só quando `permissionAllows(permissions, policy)` e
 * `dashboardLayerAllows(roles, access)` — a mesma regra de `permissionGuard`/`layerGuard`.
 * Grupos na ordem de `NAV_GROUP_ORDER`; grupo sem item é omitido.
 */
export function navigationFor(session: {
  roles: readonly string[];
  permissions: readonly string[];
}): readonly DashboardNavGroup[] {
  const groups: DashboardNavGroup[] = [];
  for (const key of NAV_GROUP_ORDER) {
    const items: DashboardNavItem[] = [];
    for (const entry of DASHBOARD_ROUTE_MANIFEST) {
      if (entry.id === null || entry.parent !== null) continue;
      if (NAV_GROUP_OF[entry.id] !== key) continue;
      if (entry.policy === null || entry.access === null) continue;
      if (!permissionAllows(session.permissions, entry.policy)) continue;
      if (!dashboardLayerAllows(session.roles, entry.access)) continue;
      items.push({
        id: entry.id,
        link: entry.path,
        labelKey: `dashboard.shell.title.${i18nSegmentOf(entry.slug)}`,
      });
    }
    if (items.length > 0) {
      groups.push({ key, labelKey: `dashboard.shell.nav.${key}`, items });
    }
  }
  return groups;
}

@Component({
  selector: 'dash-shell',
  imports: [
    DetranAppShellComponent,
    RouterLink,
    RouterLinkActive,
    StynxTranslatePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="dash-skip-link" [attr.href]="'#' + CONTENT_ID">{{
      SKIP_KEY | stynxTranslate
    }}</a>
    <detran-app-shell
      [applicationName]="BRAND_KEY | stynxTranslate"
      [homeLink]="HOME_LINK"
      [navigation]="EMPTY_NAVIGATION"
    >
      <div detran-topbar-actions>
        @if (active()) {
          <button type="button" (click)="logout()">
            {{ LOGOUT_KEY | stynxTranslate }}
          </button>
        }
      </div>
      <div detran-sidenav-footer>
        <nav [attr.aria-label]="NAV_MAIN_KEY | stynxTranslate">
          @for (group of groups(); track group.key) {
            <section [attr.data-nav-group]="group.key">
              <h2>{{ group.labelKey | stynxTranslate }}</h2>
              <ul>
                @for (item of group.items; track item.id) {
                  <li>
                    <a
                      [routerLink]="item.link"
                      routerLinkActive="dash-nav-active"
                      ariaCurrentWhenActive="page"
                      [attr.data-nav-item]="item.id"
                      >{{ item.labelKey | stynxTranslate }}</a
                    >
                  </li>
                }
              </ul>
            </section>
          }
        </nav>
      </div>
      <h1 class="dash-brand-heading">{{ BRAND_KEY | stynxTranslate }}</h1>
      <div
        role="status"
        aria-live="polite"
        [attr.aria-label]="LIVE_REGION_KEY | stynxTranslate"
      >
        @if (sse.polling()) {
          {{ UNAVAILABLE_KEY | stynxTranslate }}
        }
      </div>
      <div [attr.id]="CONTENT_ID"></div>
    </detran-app-shell>
  `,
})
export class DashboardShellComponent {
  private readonly session = inject(DashboardSessionFacade);
  protected readonly sse = inject(SseService);

  protected readonly BRAND_KEY = BRAND_KEY;
  protected readonly SKIP_KEY = SKIP_KEY;
  protected readonly NAV_MAIN_KEY = NAV_MAIN_KEY;
  protected readonly LIVE_REGION_KEY = LIVE_REGION_KEY;
  protected readonly LOGOUT_KEY = LOGOUT_KEY;
  protected readonly UNAVAILABLE_KEY = UNAVAILABLE_KEY;
  protected readonly HOME_LINK = HOME_LINK;
  protected readonly CONTENT_ID = CONTENT_ID;
  /** O kit ainda não agrupa (OD-D16-014): a navegação agrupada é renderizada no slot. */
  protected readonly EMPTY_NAVIGATION = [];

  protected readonly active = this.session.active;

  protected readonly groups = computed(() =>
    navigationFor({
      roles: this.session.roles(),
      permissions: this.session.permissions(),
    }),
  );

  constructor() {
    effect(() => {
      if (this.session.active()) this.sse.connect();
      else this.sse.disconnect();
    });
  }

  protected async logout(): Promise<void> {
    this.sse.disconnect();
    await this.session.logout();
  }
}
