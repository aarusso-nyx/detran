// T-05 Resumo do caso (ficha IU-RAIT-007; contrato CTG-0002b §6.1 linha 7; nome OD-R12-028):
// `caso`, `relogios`, `prazos` já carregados pelo layout (`loadCaseBundle`, idempotente por TTL);
// `ClocksPanel` (quatro relógios A–D), um `DeadlineChip` por prazo (classificação §6.1 linha 13),
// `RiskFlag` já no `CaseHeader` do layout. Nenhuma ação: as "próximas ações" são as abas.
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
import { ClocksPanelComponent } from '../../../shared/clocks-panel.component';
import { DeadlineChipComponent } from '../../../shared/deadline-chip.component';
import { PageStateComponent } from '../../../shared/page-state.component';
import { screenOf } from '../../../shared/route-screen';
import { StreamStatusBannerComponent } from '../../../shared/stream-status-banner.component';
import { LOADING_KEY, combineStatus } from '../../page-support';
import { caseIdOf } from '../case-route';
import { deadlineKindOf } from '../deadline-kind';

const TITLE_KEY = 'rait.screens.casos-id-resumo.title';
const INTRO_KEY = 'rait.screens.casos-id-resumo.intro';
const EMPTY_KEY = 'rait.screens.casos-id-resumo.empty';

@Component({
  selector: 'rait-case-summary-page',
  imports: [
    StynxTranslatePipe,
    StreamStatusBannerComponent,
    PageStateComponent,
    ClocksPanelComponent,
    DeadlineChipComponent,
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
      [status]="status()"
      [error]="facade.caso.error() ?? facade.relogios.error()"
      [loadingLabelKey]="loadingKey"
      [emptyLabelKey]="emptyKey"
      (retry)="reload()"
    />

    @if (facade.caso.value()) {
      <rait-clocks-panel [clocks]="facade.relogios.items()" />
      @if (facade.prazos.items().length > 0) {
        <ul class="rait-case-summary__deadlines">
          @for (deadline of facade.prazos.items(); track deadline.id) {
            <li>
              <rait-deadline-chip
                [timerCode]="deadline.timer_code"
                [dueOn]="deadline.due_on"
                [legalBasis]="deadline.legal_basis"
                [kind]="kindOf(deadline.timer_code)"
              />
            </li>
          }
        </ul>
      }
    }
  `,
})
export class CaseSummaryPageComponent {
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
  readonly kindOf = deadlineKindOf;

  /** Caso primeiro; a lista de relógios decide `empty` (ficha 007). */
  readonly status = computed(() =>
    combineStatus(this.facade.caso.status(), this.facade.relogios.status()),
  );

  constructor() {
    void this.facade.loadCaseBundle(this.caseId);
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
  }
}
