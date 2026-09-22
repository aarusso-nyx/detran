// T-11 Prazos e relógios (ficha IU-RAIT-013; contrato CTG-0002b §6.1 linha 13; [RN-RAIT-005]):
// somente leitura — `prazos` (um `DeadlineChip` por prazo, `legal` × `operacional` pela
// classificação da ficha/§9) e `relogios` (`ClocksPanel`), ambos carregados pelo layout
// (`loadCaseBundle`). Nenhuma ação; nenhum cálculo de dias (só o que o servidor manda).
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
import { EMPTY_KEY, LOADING_KEY, combineStatus } from '../../page-support';
import { caseIdOf } from '../case-route';
import { deadlineKindOf } from '../deadline-kind';

const TITLE_KEY = 'rait.screens.casos-id-prazos.title';
const INTRO_KEY = 'rait.screens.casos-id-prazos.intro';

@Component({
  selector: 'rait-deadlines-page',
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
      [error]="facade.caso.error() ?? facade.prazos.error()"
      [loadingLabelKey]="loadingKey"
      [emptyLabelKey]="emptyKey"
      (retry)="reload()"
    />

    @if (facade.caso.value()) {
      <ul class="rait-deadlines__list">
        @for (deadline of facade.prazos.items(); track $index) {
          <li [attr.data-timer]="deadline.timer_code">
            <rait-deadline-chip
              [timerCode]="deadline.timer_code"
              [dueOn]="deadline.due_on"
              [legalBasis]="deadline.legal_basis"
              [kind]="kindOf(deadline.timer_code)"
            />
          </li>
        }
      </ul>
      <rait-clocks-panel [clocks]="facade.relogios.items()" />
    }
  `,
})
export class DeadlinesPageComponent {
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

  readonly status = computed(() =>
    combineStatus(this.facade.caso.status(), this.facade.prazos.status()),
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
