// D-17 Exportações (IU-DASH-D-17; CTG-0002.md §9). L0 — sobe a L2 quando `reports.client.ts`
// (gerado de BP-DASH-MONITOR-001) existir. O registro é só leitura: o diálogo de exportação não
// abre aqui. "Aguardando aprovação nominal" é dito com a chave do catálogo de erros
// (`EXPORT_VOLUME_APPROVAL_REQUIRED`, 202) e o botão de aprovação usa rótulo provisório
// (OD-D16-012).
import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { StynxIntlDatePipe, StynxTranslatePipe } from '@detran/ui';
import { DashCanDirective } from '../../../core/can.directive';
import { createCommandNotice } from '../../../core/command-notice';
import { DashErrorBannerComponent } from '../../../core/error-banner.component';
import { ScreenFrameComponent } from '../../../core/screen-frame.component';
import { ClassificationBadgeComponent } from '../../../shared/classification-badge.component';
import { ExportDialogComponent } from '../../../shared/export-dialog.component';
import { FreshnessSealComponent } from '../../../shared/freshness-seal.component';
import type { ExportRecordView } from '../../../shared/models';
import {
  mutableAccessor,
  UNAVAILABLE_IN_VERSION,
  type ScreenState,
} from '../../../shared/screen-state';

type ExportRegistryState = Exclude<
  ScreenState<readonly ExportRecordView[]>,
  { kind: 'blocked_by_decision' }
>;

const APPROVE_COMMAND = 'dashboard:export:approve';
const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  dateStyle: 'medium',
  timeStyle: 'short',
};

@Component({
  selector: 'dash-exportacoes-page',
  imports: [
    ScreenFrameComponent,
    ClassificationBadgeComponent,
    DashCanDirective,
    DashErrorBannerComponent,
    ExportDialogComponent,
    FreshnessSealComponent,
    StynxTranslatePipe,
    StynxIntlDatePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dash-screen-frame [slug]="'exportacoes'" [block]="'A'" [state]="state()">
      <ul>
        @for (record of records(); track record.id) {
          <li [attr.data-pending]="record.pendingApproval ? 'true' : null">
            <span data-field="who">{{ record.who }}</span>
            <time [attr.datetime]="record.at">{{
              record.at | stynxIntlDate: DATE_FORMAT
            }}</time>
            <code data-field="format">{{ record.format }}</code>
            <span data-field="rows">{{ record.rows }}</span>
            <dash-classification-badge [classification]="null" />
            <dash-freshness-seal [freshness]="null" [block]="'A'" />
            @if (record.pendingApproval) {
              <span data-field="pending">{{
                'dashboard.errors.export_volume_approval_required'
                  | stynxTranslate
              }}</span>
              <button
                *dashCan="APPROVE_COMMAND"
                type="button"
                data-command="dashboard:export:approve"
                (click)="notice.unavailable(APPROVE_COMMAND)"
              >
                {{ 'dashboard.forms.exportar.submit' | stynxTranslate }}
              </button>
            }
          </li>
        }
      </ul>
      <!-- Só leitura do registro: o diálogo não abre nesta tela (ficha §6). -->
      <dash-export-dialog
        [open]="false"
        [classification]="null"
        [layer]="'N1'"
        [scope]="'D-17'"
        [filters]="EMPTY_FILTERS"
        [rows]="null"
        [approvalRows]="null"
        [formats]="EMPTY_FORMATS"
      />
      @if (notice.error(); as error) {
        <dash-error-banner [error]="error" />
      }
    </dash-screen-frame>
  `,
})
export class ExportRegistryPageComponent {
  readonly state = mutableAccessor<ExportRegistryState>(UNAVAILABLE_IN_VERSION);
  protected readonly notice = createCommandNotice();

  protected readonly APPROVE_COMMAND = APPROVE_COMMAND;
  protected readonly DATE_FORMAT = DATE_FORMAT;
  protected readonly EMPTY_FILTERS: Readonly<Record<string, string>> = {};
  protected readonly EMPTY_FORMATS: readonly string[] = [];

  protected readonly records = computed<readonly ExportRecordView[]>(() => {
    const state = this.state();
    return state.kind === 'ready' ? state.data : [];
  });
}
