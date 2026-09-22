// T-28 Sessões (ficha IU-RAIT-033; contrato CTG-0002b §6.1 linha 32): `SessionFacade.loadSessions(
// orgao, query)` → `sessoes` numa `<stynx-table>` do kit (scheduled_for, state →
// `tokenKey('sessionState')`, extraordinary → `rait.common.extraordinary`, quorum_required/
// observed — a lista é de sessões, fixado o primitivo); nenhuma ação; abrir → `sessoes/:id`.
// Lista sincronizada com a URL.
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
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  StynxI18nService,
  StynxIntlDatePipe,
  StynxPaginationComponent,
  StynxTableComponent,
  StynxTranslatePipe,
} from '@detran/ui';
import { provideRaitI18nFallback } from '../../../core/i18n-fallback';
import { tokenKey } from '../../../core/i18n-token-key';
import { SseService } from '../../../core/sse.service';
import { SessionFacade } from '../../../data/facades/session.facade';
import type { RaitJudgingBody, RaitSession } from '../../../data/models';
import { PageStateComponent } from '../../../shared/page-state.component';
import { screenOf } from '../../../shared/route-screen';
import { StreamStatusBannerComponent } from '../../../shared/stream-status-banner.component';
import type { TableColumn } from '../../../shared/table-column';
import { connectListToUrl } from '../../list-url-sync';
import { LOADING_KEY } from '../../page-support';
import { judgingBodyOf } from '../colegiado-route';

const TITLE_KEY = 'rait.screens.colegiado-orgao-sessoes.title';
const INTRO_KEY = 'rait.screens.colegiado-orgao-sessoes.intro';
const EMPTY_KEY = 'rait.screens.colegiado-orgao-sessoes.empty';
const EXTRAORDINARY_KEY = 'rait.common.extraordinary';
const OPEN_KEY = 'rait.action.open';
const COLEGIADO_ROUTE = '/colegiado';
const SESSIONS_ROUTE = 'sessoes';

interface SessionRow extends Record<string, unknown> {
  readonly id: string;
  readonly scheduled_for: string;
  readonly state: string;
  readonly extraordinary: string;
  readonly quorum: string;
}

const COLUMNS: readonly TableColumn<SessionRow>[] = [
  { key: 'scheduled_for', label: 'scheduled_for' },
  { key: 'state', label: 'state' },
  { key: 'extraordinary', label: 'extraordinary' },
  { key: 'quorum', label: 'quorum_required' },
];

@Component({
  selector: 'rait-sessions-page',
  imports: [
    RouterLink,
    StynxTranslatePipe,
    StynxTableComponent,
    StynxPaginationComponent,
    StreamStatusBannerComponent,
    PageStateComponent,
  ],
  providers: [...provideRaitI18nFallback(), StynxIntlDatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-screen]': 'screen',
    '[attr.data-orgao]': 'orgao',
    '[attr.data-status]': 'facade.sessoes.status()',
  },
  template: `
    <h1 #heading tabindex="-1">{{ titleKey | stynxTranslate }}</h1>
    <rait-stream-status-banner />
    <p>{{ introKey | stynxTranslate }}</p>

    <rait-page-state
      [status]="facade.sessoes.status()"
      [error]="facade.sessoes.error()"
      [loadingLabelKey]="loadingKey"
      [emptyLabelKey]="emptyKey"
      (retry)="reload()"
    />

    @if (rows().length > 0) {
      <stynx-table
        [columns]="columns"
        [rows]="rows()"
        [rowTrackBy]="trackRow"
      />
      <ul class="rait-sessions__links">
        @for (session of facade.sessoes.items(); track session.id) {
          <li>
            <a
              [routerLink]="sessionRoute(session)"
              [attr.data-session-id]="session.id"
            >
              {{ openKey | stynxTranslate }} {{ session.scheduled_for ?? '' }}
            </a>
          </li>
        }
      </ul>
    }
    @if (facade.sessoes.value(); as page) {
      <stynx-pagination
        [totalItems]="page.total"
        [page]="page.page - 1"
        [pageSizeInput]="page.pageSize"
        (pageChange)="list.onPageChange($event)"
      />
    }
  `,
})
export class SessionsPageComponent {
  readonly facade = inject(SessionFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly i18n = inject(StynxI18nService);
  private readonly datePipe = inject(StynxIntlDatePipe);
  private readonly sse = inject(SseService);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
  private focused = false;

  readonly screen = screenOf(this.route);
  readonly orgao: RaitJudgingBody = judgingBodyOf(this.route);
  readonly titleKey = TITLE_KEY;
  readonly introKey = INTRO_KEY;
  readonly emptyKey = EMPTY_KEY;
  readonly loadingKey = LOADING_KEY;
  readonly openKey = OPEN_KEY;
  readonly columns = COLUMNS as TableColumn<SessionRow>[];
  readonly trackRow = (row: SessionRow): string => row.id;

  readonly list = connectListToUrl({
    load: (query) => this.facade.loadSessions(this.orgao, query),
  });
  readonly rows = computed<SessionRow[]>(() =>
    this.facade.sessoes.items().map((session) => ({
      id: session.id,
      scheduled_for: session.scheduled_for
        ? this.datePipe.transform(session.scheduled_for)
        : '',
      state: this.i18n.translate(tokenKey('sessionState', session.state)),
      extraordinary: session.extraordinary
        ? this.i18n.translate(EXTRAORDINARY_KEY)
        : '',
      quorum: `${session.quorum_observed ?? ''}/${session.quorum_required}`,
    })),
  );

  constructor() {
    this.sse.connect();
    afterRenderEffect(() => {
      const status = this.facade.sessoes.status();
      const heading = this.heading()?.nativeElement;
      untracked(() => {
        if (!this.focused && (status === 'ready' || status === 'empty')) {
          this.focused = true;
          heading?.focus();
        }
      });
    });
  }

  sessionRoute(session: RaitSession): string[] {
    return [COLEGIADO_ROUTE, this.orgao, SESSIONS_ROUTE, session.id];
  }

  reload(): void {
    void this.facade.loadSessions(this.orgao, this.list.query());
  }
}
