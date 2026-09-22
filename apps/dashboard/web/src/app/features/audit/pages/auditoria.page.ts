// D-11 Trilha de auditoria (IU-DASH-D-11; CTG-0002.md §9). L0 — sobe a L2 quando
// `audit.client.ts` (gerado de BP-DASH-MONITOR-001) existir. O `LayerGate` é na ENTRADA: sem
// finalidade declarada nada do conteúdo aparece (C-01-09). Lacuna é exibida como lacuna.
import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { StynxIntlDatePipe, StynxTranslatePipe } from '@detran/ui';
import { DashCanDirective } from '../../../core/can.directive';
import { createCommandNotice } from '../../../core/command-notice';
import { DashErrorBannerComponent } from '../../../core/error-banner.component';
import { ScreenFrameComponent } from '../../../core/screen-frame.component';
import { ClassificationBadgeComponent } from '../../../shared/classification-badge.component';
import { DeepLinkButtonComponent } from '../../../shared/deep-link-button.component';
import { ExportDialogComponent } from '../../../shared/export-dialog.component';
import { FreshnessSealComponent } from '../../../shared/freshness-seal.component';
import { LayerGateComponent } from '../../../shared/layer-gate.component';
import {
  mutableAccessor,
  UNAVAILABLE_IN_VERSION,
  type ScreenState,
} from '../../../shared/screen-state';

interface AuditEntryView {
  readonly at: string;
  readonly kind: 'alert' | 'duty' | 'freshness' | 'access' | 'gap';
  readonly ref: string;
  readonly state: string | null;
  readonly recipient: string | null;
}

type AuditState = Exclude<
  ScreenState<readonly AuditEntryView[]>,
  { kind: 'blocked_by_decision' }
>;

const EXPORT_COMMAND = 'dashboard:export:create';
const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  dateStyle: 'medium',
  timeStyle: 'short',
};

@Component({
  selector: 'dash-auditoria-page',
  imports: [
    ScreenFrameComponent,
    ClassificationBadgeComponent,
    DashCanDirective,
    DashErrorBannerComponent,
    DeepLinkButtonComponent,
    ExportDialogComponent,
    FreshnessSealComponent,
    LayerGateComponent,
    StynxTranslatePipe,
    StynxIntlDatePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dash-screen-frame
      [slug]="'auditoria'"
      [screen]="'P-07'"
      [block]="'A'"
      [state]="state()"
    >
      <dash-layer-gate
        [open]="!purposeDeclared()"
        (declared)="purposeDeclared(true)"
        (cancelled)="purposeDeclared(false)"
      />
      @if (purposeDeclared()) {
        <ul>
          @for (entry of entries(); track entry.ref) {
            <li [attr.data-kind]="entry.kind">
              @if (entry.kind === 'gap') {
                <span data-field="gap">{{
                  'dashboard.states.empty' | stynxTranslate
                }}</span>
              } @else {
                <code data-field="ref">{{ entry.ref }}</code>
                <time [attr.datetime]="entry.at">{{
                  entry.at | stynxIntlDate: DATE_FORMAT
                }}</time>
                @if (entry.state; as state) {
                  <span data-field="state">{{ state }}</span>
                }
                @if (entry.recipient; as recipient) {
                  <span data-field="recipient">{{ recipient }}</span>
                }
              }
            </li>
          }
        </ul>
        <dash-classification-badge [classification]="null" />
        <dash-freshness-seal [freshness]="null" [block]="'A'" />
        <!-- L0: o deep-link do objeto auditado só existe com R-0011. -->
        <dash-deep-link-button [app]="null" [href]="''" />
        <button
          *dashCan="EXPORT_COMMAND"
          type="button"
          data-command="dashboard:export:create"
          (click)="exportOpen(true)"
        >
          {{ 'dashboard.common.action.export' | stynxTranslate }}
        </button>
        <dash-export-dialog
          [open]="exportOpen()"
          [classification]="null"
          [layer]="'N2'"
          [scope]="'D-11'"
          [filters]="EMPTY_FILTERS"
          [rows]="null"
          [approvalRows]="null"
          [formats]="EMPTY_FORMATS"
          (requested)="notice.unavailable(EXPORT_COMMAND)"
          (cancelled)="exportOpen(false)"
        />
        @if (notice.error(); as error) {
          <dash-error-banner [error]="error" />
        }
      }
    </dash-screen-frame>
  `,
})
export class AuditTrailPageComponent {
  readonly state = mutableAccessor<AuditState>(UNAVAILABLE_IN_VERSION);
  readonly purposeDeclared = mutableAccessor(false);
  readonly exportOpen = mutableAccessor(false);
  protected readonly notice = createCommandNotice();

  protected readonly EXPORT_COMMAND = EXPORT_COMMAND;
  protected readonly DATE_FORMAT = DATE_FORMAT;
  protected readonly EMPTY_FILTERS: Readonly<Record<string, string>> = {};
  protected readonly EMPTY_FORMATS: readonly string[] = [];

  protected readonly entries = computed<readonly AuditEntryView[]>(() => {
    const state = this.state();
    return state.kind === 'ready' ? state.data : [];
  });
}
