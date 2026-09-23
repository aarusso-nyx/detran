// D-03 Radar de prescrição RAIT (IU-DASH-D-03; CTG-0002.md §9). L0 — sobe a L2 quando
// `radar.client.ts` (gerado de BP-DASH-MONITOR-001) existir. Bloco A: número sem selo não é
// renderizado e, em leitura indisponível/desatualizada, o valor é ocultado. O identificador do
// objeto só aparece com finalidade declarada (C-01-09); nenhum comando nesta tela.
import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { StynxTranslatePipe } from '@detran/ui';
import { ScreenFrameComponent } from '../../../core/screen-frame.component';
import { ClassificationBadgeComponent } from '../../../shared/classification-badge.component';
import { ClockGovernorBadgeComponent } from '../../../shared/clock-governor-badge.component';
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

type RadarState = Exclude<
  ScreenState<readonly AlertView[]>,
  { kind: 'blocked_by_decision' }
>;

@Component({
  selector: 'dash-radar-rait-page',
  imports: [
    ScreenFrameComponent,
    ClassificationBadgeComponent,
    ClockGovernorBadgeComponent,
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
      [slug]="'radar-rait'"
      [screen]="'P-02'"
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
        @for (alert of alerts(); track alert.id) {
          <li>
            <dash-severity-chip [severity]="alert.severity" />
            <dash-legal-basis-tag [legalBasis]="alert.legalBasis" />
            @if (alert.clock; as clock) {
              <dash-clock-governor-badge [clock]="clock" />
            }
            <dash-freshness-seal
              [freshness]="alert.freshness"
              [block]="alert.block"
            >
              <span data-field="remaining">{{ alert.remaining }}</span>
            </dash-freshness-seal>
            <dash-classification-badge
              [classification]="alert.classification"
            />
            @if (purposeDeclared() && alert.object) {
              <span data-field="object">{{ alert.object.reference }}</span>
            }
            @if (alert.originRef; as href) {
              <dash-deep-link-button [app]="alert.app" [href]="href" />
            }
          </li>
        }
      </ul>
    </dash-screen-frame>
  `,
})
export class RaitRadarPageComponent {
  readonly state = mutableAccessor<RadarState>(UNAVAILABLE_IN_VERSION);
  readonly purposeDeclared = mutableAccessor(false);
  readonly gateOpen = mutableAccessor(false);

  protected readonly alerts = computed<readonly AlertView[]>(() => {
    const state = this.state();
    return state.kind === 'ready' ? state.data : [];
  });
}
