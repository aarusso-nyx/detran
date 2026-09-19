// Home pública `/` (portal-frontends.md §4: "home pública → catálogo + entrada gov.br"; §3
// anônimo; contrato CTG-0003c §3.10/§6; [RN-PORTAL-113] 3; OD-P50): entrada gov.br (retomando
// `?retomar=<rota>` do `portalAuthGuard`), o símbolo/link de acessibilidade em destaque e o
// catálogo real (`GET /v1/portal/services` pelo cache do par 1) em lista semântica — nome do
// serviço pela chave `portal.services.<serviceKey>` (ausente → só `data-service-key`),
// disponibilidade como `data-availability` + rótulo, nota do canal alternativo quando indisponível,
// link à rota funcional (`core/functional-route.ts`, regra §3.9 — A12(e)) só para
// `available`/`partially_available`; indisponível ou sem rota funcional → o detalhe na Carta de
// Serviços. A falha do catálogo mostra `portal.states.error` + tentar de novo sem esconder a
// entrada gov.br.
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  DetranLoadingStateComponent,
  StynxI18nService,
  StynxTranslatePipe,
} from '@detran/ui';
import { map } from 'rxjs';
import type { ServiceCatalogItem } from '../../data/portal.client';
import { readStatusFor, type ReadStatus } from '../../data/read-status';
import { AuthFlowService } from '../auth-flow.service';
import { functionalRouteFor } from '../functional-route';
import { PortalErrorBannerComponent } from '../error-banner.component';
import {
  GENERIC_ERROR_KEY,
  OFFLINE_KEY,
  presentError,
  type ErrorPresentation,
} from '../error-boundary';
import { RESUME_QUERY_PARAM } from '../guards/auth.guard';
import { PortalServiceCatalogFacade } from '../service-catalog.facade';

const ACCESSIBILITY_ROUTE = '/acessibilidade';
const CHARTER_ROUTE = '/carta-servicos';
const SERVICES_KEY_PREFIX = `portal.services.`;
const AVAILABILITY_KEY_PREFIX = `portal.situation.availability.`;

@Component({
  selector: 'portal-home-page',
  imports: [
    RouterLink,
    StynxTranslatePipe,
    DetranLoadingStateComponent,
    PortalErrorBannerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'data-screen': '', '[attr.data-status]': 'status()' },
  template: `
    <h1>{{ 'portal.shell.title.home' | stynxTranslate }}</h1>
    <p>
      <button type="button" class="portal-primary" (click)="login()">
        {{ 'portal.common.action.login' | stynxTranslate }}
      </button>
    </p>
    <p>
      <a
        [routerLink]="accessibilityRoute"
        [attr.routerLink]="accessibilityRoute"
        [attr.aria-label]="
          'portal.shell.footer.acessibilidade' | stynxTranslate
        "
        data-accessibility
      >
        <span aria-hidden="true">♿</span>
        {{ 'portal.shell.footer.acessibilidade' | stynxTranslate }}
      </a>
    </p>
    <p>
      <a [routerLink]="charterRoute" [attr.routerLink]="charterRoute">{{
        'portal.common.link.carta' | stynxTranslate
      }}</a>
    </p>

    <section aria-labelledby="portal-home-catalog-title">
      <h2 id="portal-home-catalog-title">
        {{ 'portal.screens.t25.title' | stynxTranslate }}
      </h2>
      <div
        role="status"
        class="portal-status-region"
        [attr.aria-label]="'portal.a11y.status_region' | stynxTranslate"
      >
        @if (status() === 'loading') {
          <detran-loading-state
            [label]="'portal.states.loading' | stynxTranslate"
          />
        }
      </div>
      <div role="alert" class="portal-alert-region">
        @if (stateTextKey(); as key) {
          <p data-state-text>{{ key | stynxTranslate }}</p>
        }
        @if (error(); as error) {
          <portal-error-banner [error]="error" (retry)="loadCatalog()" />
        }
      </div>
      @if (items().length > 0) {
        <ol data-catalog class="portal-catalog">
          @for (item of items(); track item.serviceKey) {
            <li
              [attr.data-service-key]="item.serviceKey"
              [attr.data-availability]="item.availability ?? null"
              [attr.data-token]="item.unavailableReason ?? null"
            >
              <a
                [routerLink]="routeFor(item)"
                [attr.routerLink]="routeFor(item)"
                [attr.data-functional]="isFunctional(item) ? 'true' : 'false'"
              >
                @if (serviceLabelKey(item); as key) {
                  {{ key | stynxTranslate }}
                } @else {
                  {{ 'portal.screens.t25.title' | stynxTranslate }}
                }
              </a>
              @if (item.availability; as availability) {
                <span data-availability-label>{{
                  availabilityKey(availability) | stynxTranslate
                }}</span>
              }
              @if (
                item.availability === 'unavailable' &&
                  item.alternativeChannelNote;
                as note
              ) {
                <p data-note>{{ note }}</p>
              }
            </li>
          }
        </ol>
      }
    </section>
  `,
})
export class HomePageComponent {
  private readonly auth = inject(AuthFlowService);
  private readonly route = inject(ActivatedRoute);
  private readonly catalog = inject(PortalServiceCatalogFacade);
  private readonly i18n = inject(StynxI18nService);
  private readonly statusState = signal<ReadStatus>('idle');
  private readonly errorState = signal<ErrorPresentation | null>(null);
  private readonly itemsState = signal<readonly ServiceCatalogItem[]>([]);
  private sequence = 0;

  readonly accessibilityRoute = ACCESSIBILITY_ROUTE;
  readonly charterRoute = CHARTER_ROUTE;
  readonly status = this.statusState.asReadonly();
  readonly error = this.errorState.asReadonly();
  /** Ordem do servidor (cache do par 1). */
  readonly items = this.itemsState.asReadonly();

  readonly retomar = toSignal(
    this.route.queryParamMap.pipe(
      map((params) => params.get(RESUME_QUERY_PARAM)),
    ),
    { initialValue: null },
  );

  constructor() {
    void this.loadCatalog();
  }

  login(): void {
    this.auth.login(this.retomar());
  }

  /** `GET services` (cache); a falha nunca esconde a entrada gov.br (OD-P50). */
  async loadCatalog(): Promise<void> {
    this.statusState.set('loading');
    this.errorState.set(null);
    const sequence = ++this.sequence;
    try {
      const items = Array.from((await this.catalog.items()).values());
      if (sequence !== this.sequence) return;
      this.itemsState.set(items);
      this.statusState.set(items.length === 0 ? 'empty' : 'ready');
    } catch (error: unknown) {
      if (sequence !== this.sequence) return;
      const presentation = presentError(error);
      this.errorState.set(presentation);
      this.statusState.set(readStatusFor(presentation));
    }
  }

  /** Falha do catálogo: `portal.states.error` (ou offline) + tentar de novo (OD-P50). */
  stateTextKey(): string | null {
    switch (this.statusState()) {
      case 'offline':
        return OFFLINE_KEY;
      case 'error':
      case 'unavailable':
      case 'not_found':
        return GENERIC_ERROR_KEY;
      default:
        return null;
    }
  }

  /** `portal.services.<key>` quando existe no catálogo; ausente → só `data-service-key`. */
  serviceLabelKey(item: ServiceCatalogItem): string | null {
    const key = item.serviceKey
      ? `${SERVICES_KEY_PREFIX}${item.serviceKey}`
      : null;
    return key && key in this.i18n.catalog() ? key : null;
  }

  availabilityKey(availability: string): string {
    return `${AVAILABILITY_KEY_PREFIX}${availability}`;
  }

  /** Rota funcional (§3.9) para `available`/`partially_available`; senão → Carta de Serviços. */
  isFunctional(item: ServiceCatalogItem): boolean {
    return (
      item.availability !== 'unavailable' &&
      !!item.serviceKey &&
      functionalRouteFor(item.serviceKey) !== null
    );
  }

  routeFor(item: ServiceCatalogItem): string {
    const serviceKey = item.serviceKey ?? '';
    if (this.isFunctional(item)) return functionalRouteFor(serviceKey) ?? '';
    return `${CHARTER_ROUTE}/${serviceKey}`;
  }
}
