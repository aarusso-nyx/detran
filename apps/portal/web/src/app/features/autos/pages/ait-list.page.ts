// T-14 Minhas multas e pontuação (contrato CTG-0003b §6; ficha IU-PORTAL-T14; [UC-PORTAL-010];
// [RN-PORTAL-103]; [RN-RAIT-131]): resposta direta ANTES da lista (resumo de pontos), filtros por
// veículo e situação que vão ao servidor ([DIVERGE-7]), uma linha por AIT com situação traduzida
// (token só em `data-token`), prazos como data rotulada com dono (nunca "N dias") e as três ações
// da linha. Nenhum campo de identificação além do CPF autenticado; pontos e lista independentes.
// As regiões de estado (`role="status"`) e de alerta (`role="alert"`) existem desde o carregamento.
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
  StynxIntlCurrencyPipe,
  StynxIntlDatePipe,
  StynxPaginationComponent,
  StynxTranslatePipe,
} from '@detran/ui';
import { PortalErrorBannerComponent } from '../../../core/error-banner.component';
import type {
  InfractionSituation,
  PointsStatus,
} from '../../../data/portal-read.models';
import { DeadlineCardComponent } from '../../../shared/deadline-card.component';
import { AutosFacade, INFRACTION_SITUATIONS } from '../autos.facade';
import { AitRowActionsComponent } from '../components/ait-row-actions.component';
import { PointsSummaryComponent } from '../components/points-summary.component';

/** Rota da ouvidoria (manifesto: `ouvidoria/nova`), caminho seguinte da lista vazia ([UC-010] 2b). */
const OUVIDORIA_ROUTE = '/ouvidoria/nova';
const AIT_ROUTE_PREFIX = '/autos/';
const DISPUTED: PointsStatus = 'em_disputa';

@Component({
  selector: 'portal-ait-list-page',
  imports: [
    RouterLink,
    StynxTranslatePipe,
    StynxIntlDatePipe,
    StynxIntlCurrencyPipe,
    StynxPaginationComponent,
    DetranEmptyStateComponent,
    DetranLoadingStateComponent,
    PortalErrorBannerComponent,
    DeadlineCardComponent,
    PointsSummaryComponent,
    AitRowActionsComponent,
  ],
  providers: [AutosFacade],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'data-screen': 'T-14',
    '[attr.data-status]': 'facade.status()',
    '[attr.aria-busy]': 'facade.status() === "loading" ? "true" : null',
  },
  template: `
    <h1 #heading tabindex="-1">
      {{ 'portal.screens.t14.title' | stynxTranslate }}
    </h1>
    <p>{{ 'portal.screens.t14.intro' | stynxTranslate }}</p>

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

    @if (facade.points(); as points) {
      <portal-points-summary [summary]="points" />
    } @else if (facade.pointsError(); as pointsError) {
      <portal-error-banner
        [error]="pointsError"
        (retry)="facade.loadPointsSummary()"
      />
    }

    <form class="portal-ait-filters" (submit)="$event.preventDefault()">
      <label>
        <span>{{
          'portal.screens.t14.cmd.filtrar_veiculo' | stynxTranslate
        }}</span>
        <input
          type="text"
          name="vehicle"
          autocomplete="off"
          [value]="facade.query().vehicle ?? ''"
          (change)="onVehicleChange($event)"
        />
      </label>
      <label>
        <span>{{
          'portal.screens.t14.cmd.filtrar_status' | stynxTranslate
        }}</span>
        <!-- Sem filtro, nenhuma opção fica selecionada (OD-P84: opção "todas" pendente; A10 h). -->
        <select #statusSelect name="status" (change)="onStatusChange($event)">
          @for (situation of situations; track situation) {
            <option
              [value]="situation"
              [selected]="facade.query().status === situation"
            >
              {{ situationKey(situation) | stynxTranslate }}
            </option>
          }
        </select>
      </label>
    </form>

    <div role="alert" class="portal-alert-region">
      @if (facade.error(); as error) {
        <portal-error-banner [error]="error" (retry)="reloadList()" />
      }
    </div>

    @if (facade.status() === 'empty') {
      <detran-empty-state
        [title]="'portal.screens.t14.empty' | stynxTranslate"
        [message]="'portal.screens.t14.empty' | stynxTranslate"
      />
      <p>
        <a [routerLink]="ouvidoriaRoute" [attr.routerLink]="ouvidoriaRoute">{{
          'portal.common.link.ouvidoria' | stynxTranslate
        }}</a>
      </p>
    }

    @if (facade.items().length > 0) {
      <ol class="portal-ait-list" data-ait-list>
        @for (item of facade.items(); track item.aitId ?? $index) {
          <li
            class="portal-ait-row"
            [attr.data-ait-id]="item.aitId"
            [attr.data-points-status]="item.pointsStatus"
          >
            <h2>
              <span>{{
                'portal.screens.t01.field.numero' | stynxTranslate
              }}</span>
              <a
                [routerLink]="aitRoute(item.aitId)"
                [attr.routerLink]="aitRoute(item.aitId)"
                >{{ item.aitNumber ?? item.aitId }}</a
              >
            </h2>
            <p data-situation [attr.data-token]="item.situation">
              @if (item.situation; as situation) {
                {{ situationKey(situation) | stynxTranslate }}
              }
            </p>
            <dl>
              @if (item.plate; as plate) {
                <dt>{{ 'portal.screens.t01.field.placa' | stynxTranslate }}</dt>
                <dd>{{ plate }}</dd>
              }
              @if (item.occurredAt; as occurredAt) {
                <dt>{{ 'portal.screens.t01.field.data' | stynxTranslate }}</dt>
                <dd>
                  <time [attr.datetime]="occurredAt">{{
                    occurredAt | stynxIntlDate
                  }}</time>
                </dd>
              }
              @if (item.amount !== null && item.amount !== undefined) {
                <dt>{{ 'portal.screens.t01.field.valor' | stynxTranslate }}</dt>
                <dd>{{ item.amount | stynxIntlCurrency: 'BRL' }}</dd>
              }
            </dl>
            @if (item.pointsStatus; as pointsStatus) {
              <p data-points [attr.data-points-status]="pointsStatus">
                <span>{{
                  pointsStatusKey(pointsStatus) | stynxTranslate
                }}</span>
                @if (pointsStatus === disputed) {
                  <span>{{
                    'portal.screens.t14.field.pontos_disputa' | stynxTranslate
                  }}</span>
                }
              </p>
            }
            @for (deadline of item.deadlines; track $index) {
              <portal-deadline-card
                [dueOn]="deadline.dueOn"
                [ownedBy]="deadline.ownedBy"
                [kind]="deadline.kind"
                [labelKey]="nextActionKey(deadline.ownedBy)"
              />
            }
            <portal-ait-row-actions
              [aitId]="item.aitId ?? ''"
              [actions]="item.actions"
            />
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
  `,
})
export class AitListPageComponent {
  readonly facade = inject(AutosFacade);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
  private readonly statusSelect =
    viewChild<ElementRef<HTMLSelectElement>>('statusSelect');
  private focused = false;

  readonly situations = INFRACTION_SITUATIONS;
  readonly ouvidoriaRoute = OUVIDORIA_ROUTE;
  readonly disputed = DISPUTED;

  constructor() {
    void this.facade.loadPointsSummary();
    void this.facade.loadList();
    // Foco no <h1> ao concluir o carregamento (T01 §9; spec §1) — uma vez, nunca durante.
    // Sem filtro na query, o <select> não mostra opção alguma como escolhida (A10 h; até OD-P84
    // não há opção "todas" — o navegador escolheria a primeira sozinho).
    afterRenderEffect(() => {
      const filter = this.facade.query().status;
      const select = this.statusSelect()?.nativeElement;
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

  situationKey(situation: InfractionSituation): string {
    return `portal.situation.infraction.${situation}`;
  }

  pointsStatusKey(status: PointsStatus): string {
    return `portal.situation.points_status.${status}`;
  }

  nextActionKey(ownedBy: 'citizen' | 'agency'): string {
    return `portal.situation.next_action.${ownedBy}`;
  }

  aitRoute(aitId: string | undefined): string {
    return `${AIT_ROUTE_PREFIX}${aitId ?? ''}`;
  }

  onVehicleChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value.trim();
    void this.facade.setQuery({
      vehicle: value.length > 0 ? value : undefined,
    });
  }

  onStatusChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    void this.facade.setQuery({ status: value.length > 0 ? value : undefined });
  }

  onPageChange(page: number): void {
    void this.facade.setQuery({ page });
  }

  reloadList(): void {
    void this.facade.loadList();
  }
}
