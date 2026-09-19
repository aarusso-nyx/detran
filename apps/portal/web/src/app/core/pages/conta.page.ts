// /conta (contrato CTG-0003c §6/§3.10; [RN-PORTAL-118]; OD-P48; [DIVERGE-29]): a conta do cidadão
// pelo `SessionFacade` — nome e CPF SEM máscara (titular), nível de identidade traduzido
// (`portal.situation.assurance.<nível>`), data da verificação gov.br e as representações em lista
// (sem seleção nem `POST representations` até OD-P48: `representation()` é `null`). Links de
// privacidade, preferências e SNE; "sair" encerra a sessão STYNX (`StynxSessionService.logout()`)
// e o `effect` da `PortalSessionFacade` limpa conta e cache offline. Sem facade própria.
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  DetranLoadingStateComponent,
  StynxIntlDatePipe,
  StynxTranslatePipe,
} from '@detran/ui';
import { StynxSessionService } from '@stynx-nyx/angular-auth';
import { PortalErrorBannerComponent } from '../error-banner.component';
import { presentError, type ErrorPresentation } from '../error-boundary';
import { SessionFacade } from '../session.facade';

const PRIVACY_ROUTE = '/privacidade/meus-dados';
const PREFERENCES_ROUTE = '/notificacoes/preferencias';
const SNE_ROUTE = '/sne';
const ASSURANCE_KEY_PREFIX = `portal.situation.assurance.`;

@Component({
  selector: 'portal-conta-page',
  imports: [
    RouterLink,
    StynxTranslatePipe,
    StynxIntlDatePipe,
    DetranLoadingStateComponent,
    PortalErrorBannerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'data-screen': '',
    '[attr.aria-busy]': 'session.loading() ? "true" : null',
  },
  template: `
    <h1 tabindex="-1">{{ 'portal.shell.title.conta' | stynxTranslate }}</h1>

    <div
      role="status"
      class="portal-status-region"
      [attr.aria-label]="'portal.a11y.status_region' | stynxTranslate"
    >
      @if (session.loading()) {
        <detran-loading-state
          [label]="'portal.states.loading' | stynxTranslate"
        />
      }
    </div>

    <div role="alert" class="portal-alert-region">
      @if (loadError(); as error) {
        <portal-error-banner [error]="error" (retry)="reload()" />
      }
    </div>

    @if (session.account(); as account) {
      <dl data-account>
        <dt>{{ 'portal.shell.conta.name' | stynxTranslate }}</dt>
        <dd data-name>{{ account.name ?? '' }}</dd>
        <dt>{{ 'portal.shell.conta.cpf' | stynxTranslate }}</dt>
        <dd data-cpf>{{ account.cpf }}</dd>
        <dt>{{ 'portal.shell.conta.level' | stynxTranslate }}</dt>
        <dd data-level [attr.data-token]="session.assuranceLevel()">
          @if (session.assuranceLevel(); as level) {
            {{ assuranceKey(level) | stynxTranslate }}
          }
          @if (account.govbrLevelObservedAt; as observedAt) {
            <time [attr.datetime]="observedAt">{{
              'portal.shell.conta.observed_at'
                | stynxTranslate
                  : { observedAt: (observedAt | stynxIntlDate: dateTimeFormat) }
            }}</time>
          }
        </dd>
      </dl>
    }

    <section aria-labelledby="portal-conta-representations-title">
      <h2 id="portal-conta-representations-title">
        {{ 'portal.shell.conta.representations' | stynxTranslate }}
      </h2>
      @if (session.representations().length > 0) {
        <ul data-representations>
          @for (representation of session.representations(); track $index) {
            <li
              [attr.data-id]="representation.id ?? null"
              [attr.data-token]="representation.scope ?? null"
            >
              <span data-label>{{ representation.label }}</span>
              @if (representation.validUntil; as validUntil) {
                <time [attr.datetime]="validUntil">{{
                  validUntil | stynxIntlDate
                }}</time>
              }
            </li>
          }
        </ul>
      } @else {
        <p data-no-representations>
          {{ 'portal.shell.conta.no_representations' | stynxTranslate }}
        </p>
      }
    </section>

    <nav [attr.aria-label]="'portal.shell.conta.links' | stynxTranslate">
      <ul>
        <li>
          <a [routerLink]="privacyRoute" [attr.routerLink]="privacyRoute">{{
            'portal.screens.t24.title' | stynxTranslate
          }}</a>
        </li>
        <li>
          <a
            [routerLink]="preferencesRoute"
            [attr.routerLink]="preferencesRoute"
            >{{ 'portal.notifications.preferences.title' | stynxTranslate }}</a
          >
        </li>
        <li>
          <a [routerLink]="sneRoute" [attr.routerLink]="sneRoute">{{
            'portal.screens.t09.title' | stynxTranslate
          }}</a>
        </li>
      </ul>
    </nav>

    <p>
      <button type="button" data-logout (click)="logout()">
        {{ 'portal.common.action.logout' | stynxTranslate }}
      </button>
    </p>
  `,
})
export class ContaPageComponent {
  readonly session = inject(SessionFacade);
  /** Opcional: fora de `provideDetranAuthenticatedApp` (harness de rotas) não há sessão STYNX. */
  private readonly stynx = inject(StynxSessionService, { optional: true });

  readonly privacyRoute = PRIVACY_ROUTE;
  readonly preferencesRoute = PREFERENCES_ROUTE;
  readonly sneRoute = SNE_ROUTE;
  readonly dateTimeFormat: Intl.DateTimeFormatOptions = {
    dateStyle: 'short',
    timeStyle: 'short',
  };

  /** `SessionFacade.loadError()` (classificado) → apresentação do banner. */
  readonly loadError = computed<ErrorPresentation | null>(() => {
    const classified = this.session.loadError();
    if (!classified) return null;
    return presentError({
      status: classified.status,
      error: classified.code
        ? {
            code: classified.code,
            status: classified.status,
            message: classified.code,
            context: classified.context,
          }
        : undefined,
    });
  });

  assuranceKey(level: string): string {
    return `${ASSURANCE_KEY_PREFIX}${level}`;
  }

  /** Encerramento da sessão STYNX ([DIVERGE-29]: `StynxSessionService.logout()`). */
  logout(): void {
    void this.stynx?.logout();
  }

  reload(): void {
    void this.session.load();
  }
}
