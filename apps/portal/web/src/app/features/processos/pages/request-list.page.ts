// T-06 Meus processos (contrato CTG-0003b §6; ficha IU-PORTAL-T06; [UC-PORTAL-005]): a lista dos
// pedidos ordenável por urgência SÓ pelo `dueOn` recebido (ou por atualização), filtro por estado
// que vai ao servidor, e por item: protocolo, serviço, situação traduzida (badge ou texto; token só
// em `data-*`), "com você"/"com o órgão", o rótulo do próximo passo que o servidor manda (só se for
// uma chave `portal.requests.nextAction.*` do catálogo — nunca chave estranha como texto), prazo
// como DeadlineCard só quando há `dueOn`, e a última atualização. Cada item é lido inteiro por
// leitor de tela e inteiro é link para o processo. Regiões de estado/alerta existem desde o início.
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
  StynxI18nService,
  StynxIntlDatePipe,
  StynxPaginationComponent,
  StynxTranslatePipe,
} from '@detran/ui';
import { PortalErrorBannerComponent } from '../../../core/error-banner.component';
import type {
  RequestState,
  RequestSummary,
} from '../../../data/portal-read.models';
import {
  CitizenStatusBadgeComponent,
  badgeOf,
} from '../../../shared/citizen-status-badge.component';
import { DeadlineCardComponent } from '../../../shared/deadline-card.component';
import {
  ProcessosFacade,
  REQUEST_STATES,
  type RequestSort,
} from '../processos.facade';

const PROCESS_ROUTE_PREFIX = '/processos/';
const AUTOS_ROUTE = '/autos';
const NEXT_ACTION_PREFIX = `portal.requests.nextAction.`;
const SERVICES_PREFIX = `portal.services.`;
const SORTS: readonly {
  readonly sort: RequestSort;
  readonly labelKey: string;
}[] = [
  { sort: 'urgencia', labelKey: 'portal.screens.t06.cmd.ordenar_urgencia' },
  {
    sort: 'atualizacao',
    labelKey: 'portal.screens.t06.cmd.ordenar_atualizacao',
  },
];

const STATE_KEYS = {
  loading: 'portal.screens.t06.state.loading',
  error: 'portal.screens.t06.state.error_recoverable',
  unavailable: 'portal.screens.t06.state.unavailable',
} as const;

@Component({
  selector: 'portal-request-list-page',
  imports: [
    RouterLink,
    StynxTranslatePipe,
    StynxIntlDatePipe,
    StynxPaginationComponent,
    DetranEmptyStateComponent,
    DetranLoadingStateComponent,
    PortalErrorBannerComponent,
    CitizenStatusBadgeComponent,
    DeadlineCardComponent,
  ],
  providers: [ProcessosFacade],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'data-screen': 'T-06',
    '[attr.data-status]': 'facade.status()',
    '[attr.data-sort]': 'facade.sort()',
    '[attr.aria-busy]': 'facade.status() === "loading" ? "true" : null',
  },
  template: `
    <h1 #heading tabindex="-1">
      {{ 'portal.screens.t06.title' | stynxTranslate }}
    </h1>

    <div
      role="status"
      class="portal-status-region"
      [attr.aria-label]="'portal.a11y.status_region' | stynxTranslate"
    >
      @if (facade.status() === 'loading') {
        <detran-loading-state [label]="stateKeys.loading | stynxTranslate" />
      }
    </div>

    <form class="portal-request-controls" (submit)="$event.preventDefault()">
      <div role="group" class="portal-request-sort">
        @for (option of sorts; track option.sort) {
          <button
            type="button"
            [attr.data-sort]="option.sort"
            [attr.aria-pressed]="
              facade.sort() === option.sort ? 'true' : 'false'
            "
            (click)="facade.setSort(option.sort)"
          >
            {{ option.labelKey | stynxTranslate }}
          </button>
        }
      </div>
      <label>
        <span>{{
          'portal.screens.t06.cmd.filtrar_estado' | stynxTranslate
        }}</span>
        <!-- Sem filtro, nenhuma opção fica selecionada (OD-P84: opção "todas" pendente; A10 h). -->
        <select #stateSelect name="state" (change)="onStateChange($event)">
          @for (state of states; track state) {
            <option [value]="state" [selected]="facade.query().state === state">
              {{ stateKey(state) | stynxTranslate }}
            </option>
          }
        </select>
      </label>
    </form>

    <div role="alert" class="portal-alert-region">
      @if (stateTextKey(); as key) {
        <p data-state-text>{{ key | stynxTranslate }}</p>
      }
      @if (facade.error(); as error) {
        <portal-error-banner [error]="error" (retry)="reload()" />
      }
    </div>

    @if (facade.status() === 'empty') {
      <detran-empty-state
        [title]="'portal.screens.t06.state.empty' | stynxTranslate"
        [message]="'portal.screens.t06.state.empty' | stynxTranslate"
      />
      <p>
        <a [routerLink]="autosRoute" [attr.routerLink]="autosRoute">{{
          'portal.shell.nav.autos' | stynxTranslate
        }}</a>
      </p>
    }

    <section class="portal-request-list" aria-live="polite" data-request-list>
      @if (facade.sorted().length > 0) {
        <ol>
          @for (item of facade.sorted(); track item.requestId ?? $index) {
            <li
              class="portal-request-row"
              [attr.data-request-id]="item.requestId"
              [attr.data-token]="item.situation"
              [attr.data-service-key]="item.serviceKey"
            >
              <h2>
                <span>{{
                  'portal.common.receipt.number' | stynxTranslate
                }}</span>
                <a
                  [routerLink]="processRoute(item)"
                  [attr.routerLink]="processRoute(item)"
                  >{{ item.protocol ?? item.requestId }}</a
                >
              </h2>
              @if (serviceKeyFor(item); as key) {
                <p data-service>{{ key | stynxTranslate }}</p>
              }
              @if (item.targetLabel; as targetLabel) {
                <p data-target>{{ targetLabel }}</p>
              }
              @if (item.situation; as situation) {
                @if (badgeFor(situation); as badge) {
                  <portal-citizen-status-badge
                    [situation]="badge"
                    [token]="situation"
                  />
                } @else {
                  <p data-situation [attr.data-token]="situation">
                    {{ requestStateKey(situation) | stynxTranslate }}
                  </p>
                }
              }
              @if (item.nextAction; as nextAction) {
                <p
                  data-next-action
                  [attr.data-next-action-by]="nextAction.by"
                  [attr.data-next-action-label]="nextAction.label"
                >
                  @if (nextAction.by; as by) {
                    <span>{{ nextActionByKey(by) | stynxTranslate }}</span>
                  }
                  @if (nextActionLabelKey(nextAction.label); as labelKey) {
                    <span>{{ labelKey | stynxTranslate }}</span>
                  }
                </p>
                @if (nextAction.dueOn; as dueOn) {
                  <portal-deadline-card
                    [dueOn]="dueOn"
                    [ownedBy]="ownerFor(nextAction.by)"
                    [labelKey]="
                      nextActionLabelKey(nextAction.label) ??
                      nextActionByKey(nextAction.by)
                    "
                  />
                }
              }
              @if (item.updatedAt; as updatedAt) {
                <p data-updated-at>
                  <span>{{
                    'portal.screens.t06.field.atualizado_em' | stynxTranslate
                  }}</span>
                  <time [attr.datetime]="updatedAt">{{
                    updatedAt | stynxIntlDate: dateFormat
                  }}</time>
                </p>
              }
            </li>
          }
        </ol>
        @if (facade.page(); as page) {
          <stynx-pagination
            [totalItems]="page.total"
            [page]="page.page - 1"
            [pageSizeInput]="page.pageSize"
            (pageChange)="onPageChange($event.pageIndex + 1)"
          />
        }
      }
    </section>
  `,
})
export class RequestListPageComponent {
  readonly facade = inject(ProcessosFacade);
  private readonly i18n = inject(StynxI18nService);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
  private readonly stateSelect =
    viewChild<ElementRef<HTMLSelectElement>>('stateSelect');
  private focused = false;

  readonly states = REQUEST_STATES;
  readonly sorts = SORTS;
  readonly stateKeys = STATE_KEYS;
  readonly autosRoute = AUTOS_ROUTE;
  readonly dateFormat: Intl.DateTimeFormatOptions = {
    dateStyle: 'short',
    timeStyle: 'short',
  };

  constructor() {
    void this.facade.loadList();
    // Sem filtro na query, o <select> não mostra opção alguma como escolhida (A10 h; até OD-P84
    // não há opção "todas" — o navegador escolheria a primeira sozinho).
    afterRenderEffect(() => {
      const filter = this.facade.query().state;
      const select = this.stateSelect()?.nativeElement;
      untracked(() => {
        if (select && !filter) select.selectedIndex = -1;
      });
    });
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

  stateTextKey(): string | null {
    switch (this.facade.status()) {
      case 'unavailable':
        return STATE_KEYS.unavailable;
      case 'error':
        return STATE_KEYS.error;
      default:
        return null;
    }
  }

  stateKey(state: RequestState): string {
    return `portal.situation.request.${state}`;
  }

  requestStateKey(state: string): string {
    return `portal.situation.request.${state}`;
  }

  badgeFor(state: string) {
    return badgeOf(state);
  }

  nextActionByKey(by: string): string {
    return `portal.situation.next_action.${by}`;
  }

  /** Só chaves `portal.requests.nextAction.*` presentes no catálogo viram texto (T06; par 1). */
  nextActionLabelKey(label: string | undefined): string | null {
    if (!label || !label.startsWith(NEXT_ACTION_PREFIX)) return null;
    return label in this.i18n.catalog() ? label : null;
  }

  /** `portal.services.<key>` quando existe no catálogo; ausente → só `data-service-key`. */
  serviceKeyFor(item: RequestSummary): string | null {
    const key = item.serviceKey ? `${SERVICES_PREFIX}${item.serviceKey}` : null;
    return key && key in this.i18n.catalog() ? key : null;
  }

  ownerFor(by: string | undefined): 'citizen' | 'agency' {
    return by === 'citizen' ? 'citizen' : 'agency';
  }

  processRoute(item: RequestSummary): string {
    return `${PROCESS_ROUTE_PREFIX}${item.requestId ?? ''}`;
  }

  onStateChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    void this.facade.setQuery({ state: value.length > 0 ? value : undefined });
  }

  onPageChange(page: number): void {
    void this.facade.setQuery({ page });
  }

  reload(): void {
    void this.facade.loadList();
  }
}
