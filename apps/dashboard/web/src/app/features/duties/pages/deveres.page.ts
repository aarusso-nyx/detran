// D-08 Deveres periódicos (IU-DASH-D-08; CTG-0002.md §9). L0 — sobe a L2 quando
// `duties.client.ts` (gerado de BP-DASH-MONITOR-001) existir. §2 invariante 9: prazo ausente é
// dito ("sem prazo definido"). Sem comando: o ciclo é rota própria.
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { Router } from '@angular/router';
import { ScreenFrameComponent } from '../../../core/screen-frame.component';
import { ClassificationBadgeComponent } from '../../../shared/classification-badge.component';
import { DeepLinkButtonComponent } from '../../../shared/deep-link-button.component';
import { DutyCalendarComponent } from '../../../shared/duty-calendar.component';
import { FreshnessSealComponent } from '../../../shared/freshness-seal.component';
import { SeverityChipComponent } from '../../../shared/severity-chip.component';
import { SEVERITY_LEVELS, type DutyView } from '../../../shared/models';
import {
  mutableAccessor,
  UNAVAILABLE_IN_VERSION,
  type ScreenState,
} from '../../../shared/screen-state';

type DutyCalendarState = Exclude<
  ScreenState<readonly DutyView[]>,
  { kind: 'blocked_by_decision' }
>;

@Component({
  selector: 'dash-deveres-page',
  imports: [
    ScreenFrameComponent,
    ClassificationBadgeComponent,
    DeepLinkButtonComponent,
    DutyCalendarComponent,
    FreshnessSealComponent,
    SeverityChipComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dash-screen-frame
      [slug]="'deveres'"
      [screen]="'P-05'"
      [block]="'B'"
      [state]="state()"
    >
      <dash-duty-calendar [duties]="duties()" (select)="open($event)" />
      <!-- L0: o app de origem do dever só é conhecido com R-0011. -->
      <dash-deep-link-button [app]="null" [href]="''" />
      <ul data-field="severity_legend">
        @for (level of SEVERITY_LEVELS; track level) {
          <li><dash-severity-chip [severity]="level" /></li>
        }
      </ul>
      @for (duty of duties(); track duty.id) {
        <dash-classification-badge [classification]="duty.classification" />
        <dash-freshness-seal [freshness]="duty.freshness" [block]="'B'">
          <span data-field="period">{{ duty.period }}</span>
        </dash-freshness-seal>
      }
    </dash-screen-frame>
  `,
})
export class DutyCalendarPageComponent {
  private readonly router = inject(Router);

  readonly state = mutableAccessor<DutyCalendarState>(UNAVAILABLE_IN_VERSION);

  protected readonly SEVERITY_LEVELS = SEVERITY_LEVELS;

  protected readonly duties = computed<readonly DutyView[]>(() => {
    const state = this.state();
    return state.kind === 'ready' ? state.data : [];
  });

  protected open(duty: DutyView): void {
    void this.router.navigate([
      '/monitoramento/deveres',
      duty.id,
      'ciclos',
      duty.period,
    ]);
  }
}
