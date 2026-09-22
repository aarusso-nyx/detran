// D-04 Escada de prazos PEC (IU-DASH-D-04; CTG-0002.md §9). L0 — sobe a L2 quando
// `radar.client.ts` (gerado de BP-DASH-MONITOR-001) existir. §2 invariante 7: prazo do candidato
// é preclusivo e o console não oferece ação nenhuma sobre ele — nem botão, nem deep-link; a marca
// vem do backend ([JRN-DASH-007] passo 2).
import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { StynxTranslatePipe } from '@detran/ui';
import { ScreenFrameComponent } from '../../../core/screen-frame.component';
import { ClassificationBadgeComponent } from '../../../shared/classification-badge.component';
import { DeepLinkButtonComponent } from '../../../shared/deep-link-button.component';
import { FreshnessSealComponent } from '../../../shared/freshness-seal.component';
import { LayerGateComponent } from '../../../shared/layer-gate.component';
import { LegalBasisTagComponent } from '../../../shared/legal-basis-tag.component';
import { SeverityChipComponent } from '../../../shared/severity-chip.component';
import type { AlertView } from '../../../shared/models';
import {
  mutableAccessor,
  UNAVAILABLE_IN_VERSION,
  type ScreenState,
} from '../../../shared/screen-state';

interface PecDeadlineRow {
  readonly alert: AlertView;
  /** Marca do backend (`source_pending`, OD-D16-017): prazo do candidato × do órgão. */
  readonly candidateDeadline: boolean;
}

type PecRadarState = Exclude<
  ScreenState<readonly PecDeadlineRow[]>,
  { kind: 'blocked_by_decision' }
>;

@Component({
  selector: 'dash-radar-pec-page',
  imports: [
    ScreenFrameComponent,
    ClassificationBadgeComponent,
    DeepLinkButtonComponent,
    FreshnessSealComponent,
    LayerGateComponent,
    LegalBasisTagComponent,
    SeverityChipComponent,
    StynxTranslatePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dash-screen-frame
      [slug]="'radar-pec'"
      [screen]="'P-03'"
      [block]="'A'"
      [state]="state()"
    >
      <button type="button" (click)="gateOpen(true)">
        {{ 'dashboard.layers.n2' | stynxTranslate }}
      </button>
      <dash-layer-gate
        [open]="gateOpen()"
        (declared)="purposeDeclared(true); gateOpen(false)"
        (cancelled)="gateOpen(false)"
      />
      <ul>
        @for (row of rows(); track row.alert.id) {
          <li
            [attr.data-deadline-kind]="
              row.candidateDeadline ? 'candidate' : 'organ'
            "
          >
            <dash-severity-chip [severity]="row.alert.severity" />
            <dash-legal-basis-tag [legalBasis]="row.alert.legalBasis" />
            <dash-freshness-seal
              [freshness]="row.alert.freshness"
              [block]="row.alert.block"
            >
              <span data-field="remaining">{{ row.alert.remaining }}</span>
            </dash-freshness-seal>
            <dash-classification-badge
              [classification]="row.alert.classification"
            />
            @if (purposeDeclared() && row.alert.object) {
              <span data-field="object">{{ row.alert.object.reference }}</span>
            }
            @if (row.candidateDeadline) {
              <span data-field="deadline">{{
                'dashboard.common.fixed.candidate_deadline_preclusive'
                  | stynxTranslate
              }}</span>
            } @else if (row.alert.originRef; as href) {
              <dash-deep-link-button [app]="row.alert.app" [href]="href" />
            }
          </li>
        }
      </ul>
    </dash-screen-frame>
  `,
})
export class PecRadarPageComponent {
  readonly state = mutableAccessor<PecRadarState>(UNAVAILABLE_IN_VERSION);
  readonly purposeDeclared = mutableAccessor(false);
  readonly gateOpen = mutableAccessor(false);

  protected readonly rows = computed<readonly PecDeadlineRow[]>(() => {
    const state = this.state();
    return state.kind === 'ready' ? state.data : [];
  });
}
