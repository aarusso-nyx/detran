// CitizenShell (portal-frontends.md §1/§5.1; plan.md M7): cabeçalho com a marca do tenant
// (`BrandService`) ou neutra, navegação de 5 destinos, rodapé de 4 links, skip link,
// `<main id="conteudo">` com `router-outlet` e região `aria-live` para estados. Componente de
// apresentação: recebe a marca e o estado por `input()`; todo texto visível passa pelo
// `stynxTranslate` (chaves `portal.shell.*`, `portal.a11y.*`).
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { StynxToastContainerComponent, StynxTranslatePipe } from '@detran/ui';
import { NEUTRAL_BRAND, type BrandState } from './brand.service';

export interface ShellLink {
  readonly key: string;
  readonly route: string;
}

/** Cinco destinos (spec §5.1): Início · Autos · Processos · Atualizações · Documentos. */
export const SHELL_NAVIGATION: readonly ShellLink[] = [
  { key: 'portal.shell.nav.inicio', route: '/inicio' },
  { key: 'portal.shell.nav.autos', route: '/autos' },
  { key: 'portal.shell.nav.processos', route: '/processos' },
  { key: 'portal.shell.nav.atualizacoes', route: '/notificacoes' },
  { key: 'portal.shell.nav.documentos', route: '/documentos/cnh-digital' },
];

interface FooterLink extends ShellLink {
  readonly external?: string;
}

@Component({
  selector: 'portal-citizen-shell',
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    StynxToastContainerComponent,
    StynxTranslatePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="portal-skip-link" href="#conteudo">{{
      'portal.a11y.skip_link' | stynxTranslate
    }}</a>
    <header class="portal-header">
      <a class="portal-brand" routerLink="/">
        @if (brand().status === 'available') {
          {{ brandName() }}
        } @else {
          {{ neutralKey() | stynxTranslate }}
        }
      </a>
      <nav
        class="portal-nav"
        [attr.aria-label]="'portal.a11y.nav_main' | stynxTranslate"
      >
        @for (item of navigation; track item.key) {
          <a
            [routerLink]="item.route"
            routerLinkActive="portal-nav-active"
            ariaCurrentWhenActive="page"
            >{{ item.key | stynxTranslate }}</a
          >
        }
      </nav>
    </header>
    <div
      class="portal-status"
      role="status"
      aria-live="polite"
      [attr.aria-label]="'portal.a11y.status_region' | stynxTranslate"
    >
      @if (statusKey()) {
        {{ statusKey() | stynxTranslate }}
      }
    </div>
    <main id="conteudo" class="portal-main" tabindex="-1">
      <router-outlet />
    </main>
    <footer
      class="portal-footer"
      [attr.aria-label]="'portal.a11y.nav_footer' | stynxTranslate"
    >
      @for (item of footer(); track item.key) {
        @if (item.external) {
          <a [href]="item.external" rel="noopener">{{
            item.key | stynxTranslate
          }}</a>
        } @else {
          <a [routerLink]="item.route">{{ item.key | stynxTranslate }}</a>
        }
      }
    </footer>
    <stynx-toast-container />
  `,
  styles: `
    :host {
      display: grid;
      grid-template-rows: auto auto 1fr auto;
      min-height: 100dvh;
    }
    .portal-skip-link {
      position: absolute;
      left: -999px;
      top: 0;
      padding: 0.5rem 1rem;
      background: var(--detran-color-surface);
      color: var(--detran-color-primary-strong);
      z-index: 10;
    }
    .portal-skip-link:focus {
      left: 0;
    }
    .portal-header {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 1.25rem;
      color: #fff;
      background: var(--detran-color-primary-strong);
    }
    .portal-brand {
      color: inherit;
      font-weight: 700;
      text-decoration: none;
    }
    .portal-nav {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem;
      margin-inline-start: auto;
    }
    .portal-nav a {
      padding: 0.5rem 0.75rem;
      color: inherit;
      border-radius: var(--stynx-radius);
      text-decoration: none;
    }
    .portal-nav a.portal-nav-active,
    .portal-nav a:hover {
      background: var(--detran-color-primary);
      text-decoration: underline;
    }
    .portal-status {
      min-height: 1.5rem;
      padding: 0 1.25rem;
    }
    .portal-main {
      min-width: 0;
      padding: 1.5rem 1.25rem;
    }
    .portal-footer {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      padding: 1rem 1.25rem;
      border-top: 1px solid var(--detran-border-color);
      background: var(--detran-color-surface);
    }
  `,
})
export class CitizenShellComponent {
  readonly brand = input<BrandState>(NEUTRAL_BRAND);
  /** Chave i18n anunciada na região `aria-live` (ex.: `portal.states.loading`). */
  readonly statusKey = input<string>('');

  readonly navigation = SHELL_NAVIGATION;

  readonly brandName = computed(() => {
    const brand = this.brand();
    return brand.status === 'available' ? brand.name : '';
  });

  readonly neutralKey = computed(() => {
    const brand = this.brand();
    return brand.status === 'unavailable'
      ? brand.neutralLabelKey
      : NEUTRAL_BRAND.neutralLabelKey;
  });

  /** Rodapé (spec §5.1): Carta de Serviços, presencial, acessibilidade, privacidade. */
  readonly footer = computed<readonly FooterLink[]>(() => {
    const brand = this.brand();
    const urls = brand.status === 'available' ? brand : null;
    return [
      { key: 'portal.shell.footer.carta', route: '/carta-servicos' },
      {
        key: 'portal.shell.footer.presencial',
        route: '/carta-servicos',
        external: urls?.supportUrl,
      },
      {
        key: 'portal.shell.footer.acessibilidade',
        route: '/acessibilidade',
        external: urls?.accessibilityUrl,
      },
      {
        key: 'portal.shell.footer.privacidade',
        route: '/privacidade/meus-dados',
        external: urls?.privacyUrl,
      },
    ];
  });
}
