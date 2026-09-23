// D-16 Relatórios (IU-DASH-D-16; CTG-0002.md §9). L0 — sobe a L2 quando `reports.client.ts`
// (gerado de BP-DASH-MONITOR-001) existir; o acompanhamento do pedido (OD-D16-010) também
// depende de R-0011. O status do relatório não tem chave na semente: vai em `<code data-status>`
// (OD-D16-012). Mesma página serve a rota-filha `/relatorios/:id` (ficha única).
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { StynxIntlDatePipe, StynxTranslatePipe } from '@detran/ui';
import { DashCanDirective } from '../../../core/can.directive';
import { createCommandNotice } from '../../../core/command-notice';
import { DashErrorBannerComponent } from '../../../core/error-banner.component';
import { ScreenFrameComponent } from '../../../core/screen-frame.component';
import { ClassificationBadgeComponent } from '../../../shared/classification-badge.component';
import { DeepLinkButtonComponent } from '../../../shared/deep-link-button.component';
import { ExportDialogComponent } from '../../../shared/export-dialog.component';
import { FreshnessSealComponent } from '../../../shared/freshness-seal.component';
import type { ReportView } from '../../../shared/models';
import {
  mutableAccessor,
  UNAVAILABLE_IN_VERSION,
  type ScreenState,
} from '../../../shared/screen-state';

type ReportsState = Exclude<
  ScreenState<readonly ReportView[]>,
  { kind: 'blocked_by_decision' }
>;

const REQUEST_COMMAND = 'dashboard:generated-report:request';
const EXPORT_COMMAND = 'dashboard:export:create';
const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  dateStyle: 'medium',
  timeStyle: 'short',
};

@Component({
  selector: 'dash-relatorios-page',
  imports: [
    ScreenFrameComponent,
    ClassificationBadgeComponent,
    DashCanDirective,
    DashErrorBannerComponent,
    DeepLinkButtonComponent,
    ExportDialogComponent,
    FreshnessSealComponent,
    StynxTranslatePipe,
    StynxIntlDatePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dash-screen-frame [slug]="'relatorios'" [block]="'A'" [state]="state()">
      <ul>
        @for (report of reports(); track report.id) {
          <li [attr.data-focus]="report.id === id() ? 'true' : null">
            <code data-field="type">{{ report.reportType }}</code>
            <code data-status>{{ report.status }}</code>
            <time [attr.datetime]="report.requestedAt">{{
              report.requestedAt | stynxIntlDate: DATE_FORMAT
            }}</time>
            <dash-classification-badge [classification]="null" />
            <dash-freshness-seal [freshness]="null" [block]="'A'" />
            <dash-deep-link-button [app]="null" [href]="report.fileUri ?? ''" />
          </li>
        }
      </ul>
      <button
        *dashCan="REQUEST_COMMAND"
        type="button"
        data-command="dashboard:generated-report:request"
        (click)="notice.unavailable(REQUEST_COMMAND)"
      >
        {{ 'dashboard.forms.solicitar_relatorio.submit' | stynxTranslate }}
      </button>
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
        [layer]="'N1'"
        [scope]="'D-16'"
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
    </dash-screen-frame>
  `,
})
export class GeneratedReportsPageComponent {
  /** Parâmetro da rota-filha §B (`withComponentInputBinding`). */
  readonly id = input('');

  readonly state = mutableAccessor<ReportsState>(UNAVAILABLE_IN_VERSION);
  readonly exportOpen = mutableAccessor(false);
  protected readonly notice = createCommandNotice();

  protected readonly REQUEST_COMMAND = REQUEST_COMMAND;
  protected readonly EXPORT_COMMAND = EXPORT_COMMAND;
  protected readonly DATE_FORMAT = DATE_FORMAT;
  protected readonly EMPTY_FILTERS: Readonly<Record<string, string>> = {};
  protected readonly EMPTY_FORMATS: readonly string[] = [];

  protected readonly reports = computed<readonly ReportView[]>(() => {
    const state = this.state();
    return state.kind === 'ready' ? state.data : [];
  });
}
