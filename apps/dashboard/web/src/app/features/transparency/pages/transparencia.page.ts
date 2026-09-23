// D-12 Transparência ativa (IU-DASH-D-12; CTG-0002.md §9). L0 — sobe a L2 quando
// `transparency.client.ts` (gerado de BP-DASH-MONITOR-001) existir. O bloqueio por decisão é
// SÓ por item (a tela nunca bloqueia inteira): o item bloqueado é dito com a decisão citada e
// os demais seguem ativos.
import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { StynxTranslatePipe } from '@detran/ui';
import { DashCanDirective } from '../../../core/can.directive';
import { createCommandNotice } from '../../../core/command-notice';
import { DashErrorBannerComponent } from '../../../core/error-banner.component';
import { ScreenFrameComponent } from '../../../core/screen-frame.component';
import { ClassificationBadgeComponent } from '../../../shared/classification-badge.component';
import { DeepLinkButtonComponent } from '../../../shared/deep-link-button.component';
import { EvidenceAttachComponent } from '../../../shared/evidence-attach.component';
import { FreshnessSealComponent } from '../../../shared/freshness-seal.component';
import type { ChecklistItemView } from '../../../shared/models';
import {
  mutableAccessor,
  UNAVAILABLE_IN_VERSION,
  type ScreenState,
} from '../../../shared/screen-state';

interface TransparencyData {
  readonly items: readonly ChecklistItemView[];
  readonly period: string;
}

type TransparencyState = Exclude<
  ScreenState<TransparencyData>,
  { kind: 'blocked_by_decision' }
>;

const AUDIT_COMMAND = 'dashboard:transparency-audit:audit';
const BLOCKED_KEY = 'dashboard.states.blocked_by_decision';

@Component({
  selector: 'dash-transparencia-page',
  imports: [
    ScreenFrameComponent,
    ClassificationBadgeComponent,
    DashCanDirective,
    DashErrorBannerComponent,
    DeepLinkButtonComponent,
    EvidenceAttachComponent,
    FreshnessSealComponent,
    StynxTranslatePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dash-screen-frame
      [slug]="'transparencia'"
      [screen]="'P-08'"
      [block]="'B'"
      [state]="state()"
    >
      @if (data(); as data) {
        <p data-field="period">{{ data.period }}</p>
        <ul>
          @for (item of data.items; track item.id) {
            <li [attr.data-blocked]="item.blockedByDecision">
              <span data-field="label">{{ item.label }}</span>
              @if (item.blockedByDecision; as decision) {
                <span data-field="blocked">{{
                  BLOCKED_KEY | stynxTranslate: { decision: decision }
                }}</span>
                <code data-decision>{{ decision }}</code>
              } @else {
                <span data-field="checked">{{ item.checked }}</span>
              }
            </li>
          }
        </ul>
        <dash-classification-badge [classification]="null" />
        <dash-freshness-seal [freshness]="null" [block]="'B'" />
        <dash-evidence-attach (evidence)="notice.unavailable(AUDIT_COMMAND)" />
        <!-- L0: o deep-link do conjunto de dados só existe com R-0011. -->
        <dash-deep-link-button [app]="null" [href]="''" />
        <button
          *dashCan="AUDIT_COMMAND"
          type="button"
          data-command="dashboard:transparency-audit:audit"
          (click)="notice.unavailable(AUDIT_COMMAND)"
        >
          {{
            'dashboard.forms.auditoria_transparencia.submit' | stynxTranslate
          }}
        </button>
        @if (notice.error(); as error) {
          <dash-error-banner [error]="error" />
        }
      }
    </dash-screen-frame>
  `,
})
export class TransparencyAuditPageComponent {
  readonly state = mutableAccessor<TransparencyState>(UNAVAILABLE_IN_VERSION);
  protected readonly notice = createCommandNotice();

  protected readonly AUDIT_COMMAND = AUDIT_COMMAND;
  protected readonly BLOCKED_KEY = BLOCKED_KEY;

  protected readonly data = computed<TransparencyData | null>(() => {
    const state = this.state();
    return state.kind === 'ready' ? state.data : null;
  });
}
