// T-15 Histórico (ficha IU-RAIT-017; contrato CTG-0002b §6.1 linha 17; [UC-RAIT-042]):
// `CaseFacade.loadEvents(id)` → `eventos` no `EventTimeline` (ordem recebida, payload nunca
// renderizado — [RN-RAIT-134]); `caso.archived` → `state.anonymized`. Nenhuma ação.
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
import { ActivatedRoute } from '@angular/router';
import { StynxTranslatePipe } from '@detran/ui';
import { provideRaitI18nFallback } from '../../../core/i18n-fallback';
import { CaseFacade } from '../../../data/facades/case.facade';
import { EventTimelineComponent } from '../../../shared/event-timeline.component';
import { PageStateComponent } from '../../../shared/page-state.component';
import { screenOf } from '../../../shared/route-screen';
import { StreamStatusBannerComponent } from '../../../shared/stream-status-banner.component';
import {
  EMPTY_KEY,
  LOADING_KEY,
  combineStatus,
  errorsOnly,
} from '../../page-support';
import { caseIdOf } from '../case-route';

const TITLE_KEY = 'rait.screens.casos-id-historico.title';
const INTRO_KEY = 'rait.screens.casos-id-historico.intro';
const ANONYMIZED_KEY = 'rait.screens.casos-id-historico.state.anonymized';

@Component({
  selector: 'rait-history-page',
  imports: [
    StynxTranslatePipe,
    StreamStatusBannerComponent,
    PageStateComponent,
    EventTimelineComponent,
  ],
  providers: provideRaitI18nFallback(),
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-screen]': 'screen',
    '[attr.data-status]': 'status()',
  },
  template: `
    <h1 #heading tabindex="-1">{{ titleKey | stynxTranslate }}</h1>
    <rait-stream-status-banner />
    <p>{{ introKey | stynxTranslate }}</p>

    <rait-page-state
      [status]="pageStatus()"
      [error]="facade.caso.error() ?? facade.eventos.error()"
      [loadingLabelKey]="loadingKey"
      [emptyLabelKey]="emptyKey"
      (retry)="reload()"
    />

    @if (facade.caso.value()?.archived) {
      <p role="status" data-state="anonymized">
        {{ anonymizedKey | stynxTranslate }}
      </p>
    }
    <rait-event-timeline
      [events]="facade.eventos.items()"
      [status]="facade.eventos.status()"
    />
  `,
})
export class HistoryPageComponent {
  readonly facade = inject(CaseFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
  private focused = false;

  readonly screen = screenOf(this.route);
  readonly caseId = caseIdOf(this.route);
  readonly titleKey = TITLE_KEY;
  readonly introKey = INTRO_KEY;
  readonly emptyKey = EMPTY_KEY;
  readonly loadingKey = LOADING_KEY;
  readonly anonymizedKey = ANONYMIZED_KEY;

  readonly status = computed(() =>
    combineStatus(this.facade.caso.status(), this.facade.eventos.status()),
  );
  /** O `EventTimeline` apresenta `loading`/vazio da linha do tempo; aqui o caso e os erros. */
  readonly pageStatus = computed(() =>
    combineStatus(
      this.facade.caso.status(),
      errorsOnly(this.facade.eventos.status()),
    ),
  );

  constructor() {
    void this.facade.loadCaseBundle(this.caseId);
    void this.facade.loadEvents(this.caseId);
    afterRenderEffect(() => {
      const status = this.status();
      const heading = this.heading()?.nativeElement;
      untracked(() => {
        if (!this.focused && (status === 'ready' || status === 'empty')) {
          this.focused = true;
          heading?.focus();
        }
      });
    });
  }

  reload(): void {
    void this.facade.loadCaseBundle(this.caseId);
    void this.facade.loadEvents(this.caseId);
  }
}
