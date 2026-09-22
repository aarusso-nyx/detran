// D-01 Triagem do turno (IU-DASH-D-01; CTG-0002.md §9). L0 — sobe a L2 quando
// `triage.client.ts` (gerado de BP-DASH-MONITOR-001) existir. A fila chega ordenada do backend
// (severidade combinada): a página não ordena, não calcula prazo e não dispara comando.
import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StynxTranslatePipe } from '@detran/ui';
import { ScreenFrameComponent } from '../../../core/screen-frame.component';
import { AlertCardComponent } from '../../../shared/alert-card.component';
import type { AlertView } from '../../../shared/models';
import {
  mutableAccessor,
  UNAVAILABLE_IN_VERSION,
  type ScreenState,
} from '../../../shared/screen-state';

type TriageData = readonly AlertView[];
/** A ficha §5 não prevê "bloqueado por decisão" nesta tela. */
type TriageState = Exclude<
  ScreenState<TriageData>,
  { kind: 'blocked_by_decision' }
>;

@Component({
  selector: 'dash-triagem-page',
  imports: [
    ScreenFrameComponent,
    AlertCardComponent,
    RouterLink,
    StynxTranslatePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dash-screen-frame
      [slug]="'triagem'"
      [screen]="'P-01'"
      [block]="'A'"
      [state]="state()"
    >
      <ul>
        @for (alert of alerts(); track alert.id) {
          <li>
            <dash-alert-card [alert]="alert" />
            <a [routerLink]="['/monitoramento/alertas', alert.id]">{{
              'dashboard.common.action.view' | stynxTranslate
            }}</a>
          </li>
        }
      </ul>
    </dash-screen-frame>
  `,
})
export class ShiftTriagePageComponent {
  readonly state = mutableAccessor<TriageState>(UNAVAILABLE_IN_VERSION);

  protected readonly alerts = computed<TriageData>(() => {
    const state = this.state();
    return state.kind === 'ready' ? state.data : [];
  });
}
