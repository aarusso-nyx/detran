// T-18 Buscar meu boletim de sinistro (contrato CTG-0003c §6; ficha IU-PORTAL-T18; [JRN-PORTAL-007];
// [DIVERGE-14]): a lista de sinistros do cidadão (`GET crashes`) com busca LOCAL por vocabulário
// livre sobre o `stateLabel` e o resumo (o OpenAPI não tem parâmetros de busca), resultado
// anunciado em `aria-live="polite"`. Cada item mostra só o rótulo de estado que o servidor manda
// (nenhum vocabulário interno em texto), o aviso de supressão de dado de terceiro quando houver e
// o link ao detalhe. Vazio → caminho pela ouvidoria; filtro sem resultado → texto próprio.
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  inject,
  untracked,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  DetranEmptyStateComponent,
  DetranLoadingStateComponent,
  StynxTranslatePipe,
} from '@detran/ui';
import { PortalErrorBannerComponent } from '../../../core/error-banner.component';
import { SinistrosFacade } from '../sinistros.facade';

const CRASH_ROUTE_PREFIX = '/sinistros/';
const OUVIDORIA_ROUTE = '/ouvidoria/nova';

@Component({
  selector: 'portal-crash-list-page',
  imports: [
    RouterLink,
    StynxTranslatePipe,
    DetranEmptyStateComponent,
    DetranLoadingStateComponent,
    PortalErrorBannerComponent,
  ],
  providers: [SinistrosFacade],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'data-screen': 'T-18',
    '[attr.data-status]': 'facade.status()',
    '[attr.aria-busy]': 'facade.status() === "loading" ? "true" : null',
  },
  template: `
    <h1 #heading tabindex="-1">
      {{ 'portal.screens.t18.title' | stynxTranslate }}
    </h1>

    <div
      role="status"
      class="portal-status-region"
      [attr.aria-label]="'portal.a11y.status_region' | stynxTranslate"
    >
      @if (facade.status() === 'loading') {
        <detran-loading-state
          [label]="'portal.states.loading' | stynxTranslate"
        />
      }
    </div>

    <form class="portal-crash-search" (submit)="onSubmit($event)">
      <label>
        <span>{{ 'portal.screens.t18.field.busca' | stynxTranslate }}</span>
        <input
          #searchInput
          type="search"
          name="search"
          [placeholder]="'portal.screens.t18.intro' | stynxTranslate"
          [value]="facade.search()"
          (input)="onSearchInput($event)"
        />
      </label>
      <button type="submit" data-search>
        {{ 'portal.screens.t18.cmd.buscar' | stynxTranslate }}
      </button>
    </form>

    <div role="alert" class="portal-alert-region">
      @if (facade.error(); as error) {
        <portal-error-banner [error]="error" (retry)="reload()" />
      }
    </div>

    @if (facade.status() === 'empty') {
      <detran-empty-state
        [title]="'portal.screens.t18.empty' | stynxTranslate"
        [message]="'portal.screens.t18.empty' | stynxTranslate"
      />
      <p>
        <a [routerLink]="ouvidoriaRoute" [attr.routerLink]="ouvidoriaRoute">{{
          'portal.common.link.ouvidoria' | stynxTranslate
        }}</a>
      </p>
    }

    <section aria-live="polite" data-crash-results>
      @if (facade.status() === 'ready' && facade.filtered().length === 0) {
        <p data-no-match>{{ 'portal.screens.t19.empty' | stynxTranslate }}</p>
      }
      @if (facade.filtered().length > 0) {
        <ol data-crash-list class="portal-crash-list">
          @for (item of facade.filtered(); track item.crashId) {
            <li
              [attr.data-crash-id]="item.crashId"
              [attr.data-token]="item.stateLabel"
              [attr.data-third-party-suppressed]="
                item.thirdPartyFieldsSuppressed ? 'true' : 'false'
              "
            >
              <p data-state-label>{{ item.stateLabel }}</p>
              @if (item.thirdPartyFieldsSuppressed) {
                <span role="status" data-suppressed>
                  {{
                    'portal.errors.crash_third_party_data_restricted'
                      | stynxTranslate
                  }}
                </span>
              }
              <a
                [routerLink]="crashRoute(item.crashId)"
                [attr.routerLink]="crashRoute(item.crashId)"
                >{{ 'portal.screens.t19.title' | stynxTranslate }}</a
              >
            </li>
          }
        </ol>
      }
    </section>
  `,
})
export class CrashListPageComponent {
  readonly facade = inject(SinistrosFacade);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
  private readonly searchInput =
    viewChild<ElementRef<HTMLInputElement>>('searchInput');
  private focused = false;

  readonly ouvidoriaRoute = OUVIDORIA_ROUTE;

  constructor() {
    void this.facade.loadList();
    afterRenderEffect(() => {
      const status = this.facade.status();
      const heading = this.heading()?.nativeElement;
      untracked(() => {
        if (!this.focused && (status === 'ready' || status === 'empty')) {
          this.focused = true;
          heading?.focus();
        }
      });
    });
  }

  crashRoute(crashId: string): string {
    return `${CRASH_ROUTE_PREFIX}${crashId}`;
  }

  onSearchInput(event: Event): void {
    this.facade.setSearch((event.target as HTMLInputElement).value);
  }

  /** Busca local ([DIVERGE-14]): nunca uma requisição nova. */
  onSubmit(event: Event): void {
    event.preventDefault();
    this.facade.setSearch(this.searchInput()?.nativeElement.value ?? '');
  }

  reload(): void {
    void this.facade.loadList();
  }
}
