// /inicio (contrato CTG-0003c §6; spec §4; [UC-PORTAL-019] 3a; OD-P99): a entrada do cidadão
// autenticado — saudação, o lembrete "Falta 1 passo" (ponto de retomada do `ResumeService`), a
// lista semântica de pendências (`InicioFacade.pending`, ordenada SÓ pelo `dueOn` recebido, com
// `DeadlineCard` quando há prazo), os contadores (não lidas, autos com ação, pedidos com você)
// com links às telas e os atalhos aos documentos. Cada leitura tem o seu banner de erro — a falha
// de uma não esconde as outras. O tempo real (`RealtimeService`) é iniciado aqui e qualquer
// evento do fio releitura tudo. Nenhum "N dias", nenhuma medida grave inventada.
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterRenderEffect,
  inject,
  untracked,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  DetranLoadingStateComponent,
  StynxBannerComponent,
  StynxTranslatePipe,
} from '@detran/ui';
import { DeadlineCardComponent } from '../../shared/deadline-card.component';
import { PortalErrorBannerComponent } from '../error-banner.component';
import { RealtimeService } from '../realtime.service';
import { InicioFacade, type PendingAction } from './inicio.facade';

const INBOX_ROUTE = '/notificacoes';
const AUTOS_ROUTE = '/autos';
const PROCESSES_ROUTE = '/processos';
const CNH_ROUTE = '/documentos/cnh-digital';
const VEHICLES_ROUTE = '/veiculos';

@Component({
  selector: 'portal-inicio-page',
  imports: [
    RouterLink,
    StynxTranslatePipe,
    StynxBannerComponent,
    DetranLoadingStateComponent,
    PortalErrorBannerComponent,
    DeadlineCardComponent,
  ],
  providers: [InicioFacade],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'data-screen': '',
    '[attr.data-status]': 'facade.status()',
    '[attr.aria-busy]': 'facade.status() === "loading" ? "true" : null',
  },
  template: `
    <h1 #heading tabindex="-1">
      @if (facade.account()?.name; as name) {
        {{ 'portal.shell.inicio.greeting' | stynxTranslate: { name } }}
      } @else {
        {{ 'portal.shell.title.inicio' | stynxTranslate }}
      }
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
      @if (facade.resumePoint(); as resumePoint) {
        <div data-resume [attr.data-resume-route]="resumePoint.route">
          <stynx-banner
            tone="info"
            [message]="'portal.shell.inicio.resume' | stynxTranslate"
          />
          <a
            [routerLink]="resumePoint.route"
            [attr.routerLink]="resumePoint.route"
            >{{ 'portal.common.action.continue' | stynxTranslate }}</a
          >
        </div>
      }
    </div>

    <div role="alert" class="portal-alert-region">
      @for (error of facade.errors(); track $index) {
        <portal-error-banner [error]="error" (retry)="reload()" />
      }
    </div>

    <section aria-labelledby="portal-inicio-pending-title">
      <h2 id="portal-inicio-pending-title">
        {{ 'portal.shell.inicio.title_pending' | stynxTranslate }}
      </h2>
      @if (facade.status() === 'ready' && facade.pending().length === 0) {
        <p data-empty-pending>
          {{ 'portal.shell.inicio.empty_pending' | stynxTranslate }}
        </p>
      }
      @if (facade.pending().length > 0) {
        <ol data-pending class="portal-pending-list">
          @for (action of facade.pending(); track trackAction(action)) {
            <li
              [attr.data-kind]="action.kind"
              [attr.data-id]="action.id"
              [attr.data-owned-by]="action.ownedBy"
            >
              <a [routerLink]="action.route" [attr.routerLink]="action.route">{{
                action.labelKey | stynxTranslate
              }}</a>
              @if (action.dueOn; as dueOn) {
                <portal-deadline-card
                  [dueOn]="dueOn"
                  [ownedBy]="action.ownedBy ?? 'citizen'"
                  [labelKey]="action.labelKey"
                />
              }
            </li>
          }
        </ol>
      }
    </section>

    <section aria-labelledby="portal-inicio-counters-title">
      <h2 id="portal-inicio-counters-title">
        {{ 'portal.shell.nav.atualizacoes' | stynxTranslate }}
      </h2>
      <ul class="portal-counters" data-counters>
        <li data-counter="unread" [attr.data-count]="facade.unread().length">
          <a [routerLink]="inboxRoute" [attr.routerLink]="inboxRoute">
            {{ 'portal.shell.inicio.unread' | stynxTranslate }}
            <span data-count>{{ facade.unread().length }}</span>
          </a>
        </li>
        <li
          data-counter="aits"
          [attr.data-count]="facade.aitsWithAction().length"
        >
          <a [routerLink]="autosRoute" [attr.routerLink]="autosRoute">
            {{ 'portal.shell.inicio.aits_with_action' | stynxTranslate }}
            <span data-count>{{ facade.aitsWithAction().length }}</span>
          </a>
        </li>
        <li
          data-counter="requests"
          [attr.data-count]="facade.pendingRequests().length"
        >
          <a [routerLink]="processesRoute" [attr.routerLink]="processesRoute">
            {{ 'portal.shell.inicio.requests_with_you' | stynxTranslate }}
            <span data-count>{{ facade.pendingRequests().length }}</span>
          </a>
        </li>
      </ul>
    </section>

    <section aria-labelledby="portal-inicio-documents-title">
      <h2 id="portal-inicio-documents-title">
        {{ 'portal.shell.nav.documentos' | stynxTranslate }}
      </h2>
      <ul class="portal-document-links">
        <li>
          <a [routerLink]="cnhRoute" [attr.routerLink]="cnhRoute">{{
            'portal.documents.cnh.title' | stynxTranslate
          }}</a>
        </li>
        <li>
          <a [routerLink]="vehiclesRoute" [attr.routerLink]="vehiclesRoute">{{
            'portal.documents.vehicles.title' | stynxTranslate
          }}</a>
        </li>
      </ul>
    </section>
  `,
})
export class InicioPageComponent {
  readonly facade = inject(InicioFacade);
  private readonly realtime = inject(RealtimeService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
  private focused = false;

  readonly inboxRoute = INBOX_ROUTE;
  readonly autosRoute = AUTOS_ROUTE;
  readonly processesRoute = PROCESSES_ROUTE;
  readonly cnhRoute = CNH_ROUTE;
  readonly vehiclesRoute = VEHICLES_ROUTE;

  constructor() {
    void this.facade.load();
    // Qualquer evento do fio (caixa, pedido, decisão, pagamento) → releitura (§3.10).
    const subscription = this.realtime.events.subscribe(() => {
      void this.facade.load();
    });
    this.destroyRef.onDestroy(() => subscription.unsubscribe());
    this.realtime.start();
    afterRenderEffect(() => {
      const status = this.facade.status();
      const heading = this.heading()?.nativeElement;
      untracked(() => {
        if (!this.focused && status === 'ready') {
          this.focused = true;
          heading?.focus();
        }
      });
    });
  }

  trackAction(action: PendingAction): string {
    return `${action.kind}:${action.id}`;
  }

  reload(): void {
    void this.facade.load();
  }
}
