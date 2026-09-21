// RaitShell (spec §5.1; §3 módulos visíveis; §10.4 e §10.7; contrato CTG-0002a §5; adenda A5):
// envolve o `DetranAppShellComponent` do kit com a navegação calculada dos papéis
// (`navigationFor`) e as ações de topo — busca por protocolo/AIT (`RaitShellSearch`), tema
// (`setDetranTheme` + `localStorage['rait.theme']`), conta (`/conta` + papéis ativos) e ajuda
// de atalhos (`?`). O link "pular para o conteúdo" é o primeiro elemento focável e aponta para
// `#detran-content` (o `<main>` do kit — A5 a). Registra `go-dashboard`, `go-queue` e `help`
// no `ShortcutService`. Todo texto visível sai do catálogo (`rait.shell.*`, `rait.nav.*`,
// `rait.instance.*`, `rait.role.*`, `rait.states.*`, `rait.a11y.*`).
import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  DetranAppShellComponent,
  StynxBannerComponent,
  StynxI18nService,
  StynxTranslatePipe,
  setDetranTheme,
  type DetranNavItem,
  type DetranTheme,
} from '@detran/ui';
import type { RaitModule, RaitRoleCode } from '../app.route-manifest';
import { provideRaitI18nFallback } from './i18n-fallback';
import { RaitSessionFacade } from './session.facade';
import { RaitShellSearch, type RaitShellSearchResult } from './shell-search';
import { ShortcutHelpComponent } from './shortcut-help.component';
import { ShortcutService } from './shortcut.service';

export interface RaitNavEntry {
  readonly module: RaitModule;
  readonly link: string;
}

/** Chave de persistência do tema (spec §10.7). */
export const THEME_STORAGE_KEY = 'rait.theme';

const APP_NAME_KEY = 'rait.shell.app_name';
const SEARCH_KEY = 'rait.shell.search';
const SEARCH_PLACEHOLDER_KEY = 'rait.shell.search_placeholder';
const THEME_TOGGLE_KEY = 'rait.shell.theme_toggle';
const SHORTCUTS_TITLE_KEY = 'rait.shell.shortcuts_title';
const SKIP_TO_CONTENT_KEY = 'rait.a11y.skip_to_content';
const UNAVAILABLE_KEY = 'rait.states.unavailable_in_version';
const NOT_FOUND_KEY = 'rait.states.not_found';
const ACCOUNT_NAV_KEY = 'rait.nav.conta';
const NAV_KEY_PREFIX = 'rait.nav.';
const INSTANCE_KEY_PREFIX = 'rait.instance.';
const ROLE_KEY_PREFIX = 'rait.role.';
const CONTENT_ANCHOR = '#detran-content';
const HOME_LINK = '/';
const ACCOUNT_LINK = '/conta';
const CASES_LINK = '/casos';
const DASHBOARD_LINK = '/painel';
const DEFENSE_QUEUE_LINK = '/fila/defesa';
const ANALYST_ROLE: RaitRoleCode = 'rait-analyst';
const THEMES: readonly DetranTheme[] = ['light', 'dark'];
const ORGAOS: readonly string[] = ['jari', 'cetran'];
const LABEL_SEPARATOR = ' — ';

/**
 * Itens de navegação por papel (contrato §5 "Resultado por papel", tabela verificável de
 * C-2A-25): módulos da spec §3 "Módulos visíveis" cuja rota de entrada aceita o papel, na
 * ordem dos módulos da §2; `caso` não tem item (deep-link/busca); itens com `:orgao`
 * resolvidos em `jari`/`cetran` (OD-R12-002). Divergências §3 × §4 × D7 em OD-R12-003.
 */
const NAVIGATION_BY_ROLE: Readonly<
  Record<RaitRoleCode, readonly RaitNavEntry[]>
> = {
  'rait-analyst': [
    { module: 'painel', link: '/painel' },
    { module: 'fila', link: '/fila/defesa' },
  ],
  'rait-coordinator': [
    { module: 'painel', link: '/painel' },
    { module: 'gestao', link: '/gestao' },
    { module: 'organizacao', link: '/organizacao' },
  ],
  'rait-secretary': [
    { module: 'protocolo', link: '/protocolo' },
    { module: 'colegiado', link: '/colegiado/jari' },
    { module: 'colegiado', link: '/colegiado/cetran' },
    { module: 'organizacao', link: '/organizacao' },
    { module: 'arquivo', link: '/arquivo' },
  ],
  'rait-signing-authority': [{ module: 'assinatura', link: '/assinatura' }],
  'rait-central-authority': [
    { module: 'autoridade', link: '/autoridade/provimentos' },
  ],
  'rait-rapporteur': [
    { module: 'painel', link: '/painel' },
    { module: 'fila', link: '/fila/recurso/jari' },
    { module: 'fila', link: '/fila/recurso/cetran' },
    { module: 'colegiado', link: '/colegiado/jari' },
    { module: 'colegiado', link: '/colegiado/cetran' },
  ],
  'rait-chair': [
    { module: 'painel', link: '/painel' },
    { module: 'colegiado', link: '/colegiado/jari' },
    { module: 'colegiado', link: '/colegiado/cetran' },
  ],
  'rait-manager': [
    { module: 'gestao', link: '/gestao' },
    { module: 'organizacao', link: '/organizacao' },
    { module: 'integracoes', link: '/integracoes' },
  ],
  'rait-hr': [{ module: 'organizacao', link: '/organizacao' }],
  'rait-finance': [{ module: 'financeiro', link: '/financeiro' }],
  'integration-operator': [{ module: 'integracoes', link: '/integracoes' }],
  AUDITOR: [{ module: 'auditoria', link: '/auditoria' }],
  'agency-admin': [{ module: 'admin', link: '/admin' }],
};

/** Ordem dos módulos da spec §2 (para a união de papéis). */
const MODULE_ORDER: readonly RaitModule[] = [
  'painel',
  'fila',
  'caso',
  'protocolo',
  'assinatura',
  'autoridade',
  'colegiado',
  'gestao',
  'organizacao',
  'integracoes',
  'financeiro',
  'arquivo',
  'auditoria',
  'admin',
  'conta',
];

function isRoleCode(role: string): role is RaitRoleCode {
  return Object.prototype.hasOwnProperty.call(NAVIGATION_BY_ROLE, role);
}

/** Puro: união dos itens dos papéis, sem repetição, na ordem da §2 (papéis fora do RAIT → nada). */
export function navigationFor(
  roles: readonly string[],
): readonly RaitNavEntry[] {
  const seen = new Set<string>();
  const items: RaitNavEntry[] = [];
  for (const role of roles) {
    if (!isRoleCode(role)) continue;
    for (const item of NAVIGATION_BY_ROLE[role]) {
      if (seen.has(item.link)) continue;
      seen.add(item.link);
      items.push(item);
    }
  }
  return items.sort(
    (a, b) => MODULE_ORDER.indexOf(a.module) - MODULE_ORDER.indexOf(b.module),
  );
}

function orgaoOf(link: string): string | null {
  return link.split('/').find((segment) => ORGAOS.includes(segment)) ?? null;
}

function readStoredTheme(storage: Storage | null): DetranTheme | null {
  const value = storage?.getItem(THEME_STORAGE_KEY);
  return THEMES.find((theme) => theme === value) ?? null;
}

@Component({
  selector: 'rait-shell',
  imports: [
    DetranAppShellComponent,
    RouterLink,
    ShortcutHelpComponent,
    StynxBannerComponent,
    StynxTranslatePipe,
  ],
  providers: provideRaitI18nFallback(),
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="rait-skip-link" [href]="contentAnchor">{{
      skipKey | stynxTranslate
    }}</a>
    <detran-app-shell
      [applicationName]="appNameKey | stynxTranslate"
      [homeLink]="homeLink"
      [navigation]="navigation()"
    >
      <div detran-topbar-actions class="rait-topbar-actions">
        <form role="search" class="rait-search" (submit)="onSearch($event)">
          <input
            type="search"
            name="q"
            autocomplete="off"
            [attr.aria-label]="searchKey | stynxTranslate"
            [attr.placeholder]="searchPlaceholderKey | stynxTranslate"
            [value]="query()"
            (input)="onQueryInput($event)"
          />
          <button type="submit">{{ searchKey | stynxTranslate }}</button>
        </form>
        <button
          type="button"
          class="rait-theme-toggle"
          [attr.aria-label]="themeToggleKey | stynxTranslate"
          [attr.aria-pressed]="theme() === 'dark'"
          (click)="toggleTheme()"
        >
          <span aria-hidden="true">◐</span>
        </button>
        <a
          class="rait-account"
          [routerLink]="accountLink"
          [attr.aria-label]="accountKey | stynxTranslate"
          [attr.title]="rolesLabel()"
        >
          <span aria-hidden="true">●</span>
        </a>
        <button
          type="button"
          class="rait-shortcuts-toggle"
          [attr.aria-label]="shortcutsTitleKey | stynxTranslate"
          [attr.aria-expanded]="helpOpen()"
          (click)="helpOpen.set(!helpOpen())"
        >
          <span aria-hidden="true">?</span>
        </button>
      </div>
      @if (searchResult(); as result) {
        @if (result.kind === 'unavailable') {
          <stynx-banner
            tone="warning"
            [message]="unavailableKey | stynxTranslate"
          />
        } @else if (result.kind === 'none') {
          <stynx-banner tone="info" [message]="notFoundKey | stynxTranslate" />
        }
      }
    </detran-app-shell>
    @if (helpOpen()) {
      <rait-shortcut-help (closed)="helpOpen.set(false)" />
    }
  `,
  styles: `
    .rait-skip-link {
      position: absolute;
      left: -999px;
      top: 0;
      padding: 0.5rem 1rem;
      background: var(--detran-color-surface, #fff);
      color: var(--detran-color-primary-strong, #003f73);
      z-index: 10;
    }
    .rait-skip-link:focus {
      left: 0;
    }
    .rait-topbar-actions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem;
      margin-inline-start: auto;
    }
    .rait-search {
      display: flex;
      gap: 0.25rem;
    }
  `,
})
export class RaitShellComponent {
  private readonly session = inject(RaitSessionFacade);
  private readonly router = inject(Router);
  private readonly i18n = inject(StynxI18nService);
  private readonly search = inject(RaitShellSearch);
  private readonly shortcuts = inject(ShortcutService);
  private readonly document = inject(DOCUMENT);

  readonly contentAnchor = CONTENT_ANCHOR;
  readonly homeLink = HOME_LINK;
  readonly accountLink = ACCOUNT_LINK;
  readonly appNameKey = APP_NAME_KEY;
  readonly searchKey = SEARCH_KEY;
  readonly searchPlaceholderKey = SEARCH_PLACEHOLDER_KEY;
  readonly themeToggleKey = THEME_TOGGLE_KEY;
  readonly shortcutsTitleKey = SHORTCUTS_TITLE_KEY;
  readonly skipKey = SKIP_TO_CONTENT_KEY;
  readonly accountKey = ACCOUNT_NAV_KEY;
  readonly unavailableKey = UNAVAILABLE_KEY;
  readonly notFoundKey = NOT_FOUND_KEY;

  readonly query = signal('');
  readonly searchResult = signal<RaitShellSearchResult | null>(null);
  readonly helpOpen = signal(false);
  readonly theme = signal<DetranTheme>('light');

  /** Itens do kit: rótulo traduzido (`rait.nav.<módulo>` + ` — rait.instance.<orgao>`). */
  readonly navigation = computed<readonly DetranNavItem[]>(() => {
    // Lê o catálogo para recalcular quando o locale/catálogo muda.
    this.i18n.catalog();
    return navigationFor(this.session.roles()).map((item) => {
      const orgao = orgaoOf(item.link);
      const label = this.i18n.translate(`${NAV_KEY_PREFIX}${item.module}`);
      return {
        label: orgao
          ? `${label}${LABEL_SEPARATOR}${this.i18n.translate(`${INSTANCE_KEY_PREFIX}${orgao}`)}`
          : label,
        link: item.link,
      };
    });
  });

  /** Papéis ativos traduzidos (`rait.role.<code>`), para o link da conta. */
  readonly rolesLabel = computed(() => {
    this.i18n.catalog();
    return this.session
      .canonicalRoles()
      .map((role) => this.i18n.translate(`${ROLE_KEY_PREFIX}${role}`))
      .join(', ');
  });

  constructor() {
    const stored = readStoredTheme(this.storage());
    if (stored) this.applyTheme(stored);
    const destroyRef = inject(DestroyRef);
    const unregister = [
      this.shortcuts.register('go-dashboard', () => {
        void this.router.navigateByUrl(DASHBOARD_LINK);
      }),
      this.shortcuts.register('go-queue', () => {
        // Relator: a fila exige `:orgao` sem fonte (OD-R12-002) → painel.
        const target = this.session.hasRole(ANALYST_ROLE)
          ? DEFENSE_QUEUE_LINK
          : DASHBOARD_LINK;
        void this.router.navigateByUrl(target);
      }),
      this.shortcuts.register('help', () =>
        this.helpOpen.set(!this.helpOpen()),
      ),
    ];
    destroyRef.onDestroy(() => unregister.forEach((fn) => fn()));
  }

  onQueryInput(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  toggleTheme(): void {
    this.applyTheme(this.theme() === 'dark' ? 'light' : 'dark');
    this.storage()?.setItem(THEME_STORAGE_KEY, this.theme());
  }

  async onSearch(event: Event): Promise<void> {
    event.preventDefault();
    const result = await this.search.search(this.query().trim());
    if (result.kind === 'case') {
      this.searchResult.set(null);
      await this.router.navigate([CASES_LINK, result.caseId]);
      return;
    }
    this.searchResult.set(result);
  }

  private applyTheme(theme: DetranTheme): void {
    this.theme.set(theme);
    setDetranTheme(theme, this.document);
  }

  private storage(): Storage | null {
    try {
      return this.document.defaultView?.localStorage ?? null;
    } catch {
      return null;
    }
  }
}
