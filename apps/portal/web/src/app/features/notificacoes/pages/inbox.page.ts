// T-12 Suas notificações (contrato CTG-0003c §6; ficha IU-PORTAL-T12; [RN-PORTAL-124]): a caixa do
// cidadão com filtros por tipo e leitura (vão ao servidor), a lista semântica
// (`NotificationList`), paginação do kit (0-based ↔ 1-based, A9(b)) e a contagem de não lidas da
// página em `aria-live`. O tempo real (`RealtimeService`) é iniciado ao montar; degradado
// (`polling`/erro) vira um aviso `role="status"` na região de estado e a lista permanece — nunca
// um erro bloqueante. Ciência (`markRead`) para itens SNE é a mesma ação; nada distingue além do
// `data-source`. Prazos são `DeadlineCard`; a ciência ficta é a data recebida; tokens só em `data-*`.
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  untracked,
  viewChild,
} from '@angular/core';
import {
  DetranEmptyStateComponent,
  DetranLoadingStateComponent,
  StynxBannerComponent,
  StynxPaginationComponent,
  StynxTranslatePipe,
} from '@detran/ui';
import { PortalErrorBannerComponent } from '../../../core/error-banner.component';
import { RealtimeService } from '../../../core/realtime.service';
import type { InboxKind } from '../../../data/portal-read.models';
import { NotificationListComponent } from '../../../shared/notification-list.component';
import { NotificacoesFacade } from '../notificacoes.facade';

const KINDS: readonly InboxKind[] = ['acao_necessaria', 'informativo'];
/** Filtro de leitura: "todas" ou só as não lidas (`read=false`). O rótulo da opção `read=true`
 *  ("só as lidas") não consta do catálogo nem de OD-P89 — a opção fica fora até a chave existir. */
const UNREAD_FILTER = 'false';
const KIND_KEY_PREFIX = `portal.notifications.kind.`;
const ALL_OPTION = '';

@Component({
  selector: 'portal-inbox-page',
  imports: [
    StynxTranslatePipe,
    StynxBannerComponent,
    StynxPaginationComponent,
    DetranEmptyStateComponent,
    DetranLoadingStateComponent,
    PortalErrorBannerComponent,
    NotificationListComponent,
  ],
  providers: [NotificacoesFacade],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'data-screen': 'T-12',
    '[attr.data-status]': 'facade.status()',
    '[attr.data-realtime]': 'facade.realtime()',
    '[attr.aria-busy]': 'facade.status() === "loading" ? "true" : null',
  },
  template: `
    <h1 #heading tabindex="-1">
      {{ 'portal.screens.t12.title' | stynxTranslate }}
    </h1>

    <div
      role="status"
      class="portal-status-region"
      [attr.aria-label]="'portal.a11y.status_region' | stynxTranslate"
    >
      @if (realtimeDegraded()) {
        <stynx-banner
          tone="warning"
          [message]="'portal.screens.t12.state.sem_tempo_real' | stynxTranslate"
        />
      }
      @if (facade.status() === 'loading') {
        <detran-loading-state
          [label]="'portal.states.loading' | stynxTranslate"
        />
      }
    </div>

    <form class="portal-inbox-filters" (submit)="$event.preventDefault()">
      <label>
        <span>{{
          'portal.screens.t12.cmd.filtrar_tipo' | stynxTranslate
        }}</span>
        <select name="kind" (change)="onKindChange($event)">
          <option [value]="allOption" [selected]="!facade.query().kind">
            {{ 'portal.screens.t12.cmd.todos' | stynxTranslate }}
          </option>
          @for (kind of kinds; track kind) {
            <option [value]="kind" [selected]="facade.query().kind === kind">
              {{ kindKey(kind) | stynxTranslate }}
            </option>
          }
        </select>
      </label>
      <label>
        <span>{{
          'portal.screens.t12.cmd.filtrar_lidas' | stynxTranslate
        }}</span>
        <select name="read" (change)="onReadChange($event)">
          <option [value]="allOption" [selected]="!facade.query().read">
            {{ 'portal.screens.t12.cmd.todos' | stynxTranslate }}
          </option>
          <option
            [value]="unreadFilter"
            [selected]="facade.query().read === unreadFilter"
          >
            {{
              'portal.screens.t12.field.nao_lidas'
                | stynxTranslate: { count: facade.unreadCount() }
            }}
          </option>
        </select>
      </label>
    </form>

    <div role="alert" class="portal-alert-region">
      @if (facade.error(); as error) {
        <portal-error-banner [error]="error" (retry)="reload()" />
      }
      @if (facade.readError(); as error) {
        <portal-error-banner [error]="error" (retry)="reload()" />
      }
    </div>

    <p aria-live="polite" data-unread>
      {{
        'portal.screens.t12.field.nao_lidas'
          | stynxTranslate: { count: facade.unreadCount() }
      }}
    </p>

    @if (facade.status() === 'empty') {
      <detran-empty-state
        [title]="'portal.screens.t12.empty' | stynxTranslate"
        [message]="'portal.screens.t12.empty' | stynxTranslate"
      />
    }

    @if (facade.items().length > 0) {
      <portal-notification-list
        [items]="facade.items()"
        [busy]="facade.readStatus() === 'submitting'"
        (read)="onRead($event)"
      />
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
export class InboxPageComponent {
  readonly facade = inject(NotificacoesFacade);
  private readonly realtime = inject(RealtimeService);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
  private focused = false;

  readonly kinds = KINDS;
  readonly unreadFilter = UNREAD_FILTER;
  readonly allOption = ALL_OPTION;

  /** Tempo real degradado (`polling`) ou com erro classificado: aviso, nunca bloqueio. */
  readonly realtimeDegraded = computed(
    () =>
      this.facade.realtime() === 'polling' ||
      this.facade.realtimeError() !== null,
  );

  constructor() {
    void this.facade.loadList();
    this.realtime.start();
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

  kindKey(kind: string): string {
    return `${KIND_KEY_PREFIX}${kind}`;
  }

  onKindChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    void this.facade.setQuery({
      kind: value.length > 0 ? (value as InboxKind) : undefined,
    });
  }

  onReadChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    void this.facade.setQuery({
      read: value === UNREAD_FILTER ? UNREAD_FILTER : undefined,
    });
  }

  onRead(inboxItemId: string): void {
    void this.facade.markRead(inboxItemId);
  }

  onPageChange(page: number): void {
    void this.facade.setQuery({ page });
  }

  reload(): void {
    void this.facade.loadList();
  }
}
