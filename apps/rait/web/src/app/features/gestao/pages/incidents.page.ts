// T-39 Incidentes (ficha IU-RAIT-044; contrato CTG-0002b §6.1 linha 42): `RadarFacade.
// loadIncidents(query)` → `incidentes` + `incidentesRelogio` (bandeira do relógio do incidente)
// numa `<stynx-table>` (incident_ref, case_id, flag do relógio, opened_at, closed_at);
// `IncidentForm` = `cause_analysis`/`outcome` somente leitura nesta CTG ("abrir incidente" sem
// comando: OD-R12-014); ação `rait-extinction:declare` (`confirm.declare-extinction`) sob
// `*stynxHasPermission` (M4) sobre o incidente selecionado → `facade.declareExtinction` (M8).
// Lista sincronizada com a URL.
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  StynxI18nService,
  StynxIntlDatePipe,
  StynxPaginationComponent,
  StynxTableComponent,
  StynxTranslatePipe,
} from '@detran/ui';
import { StynxHasPermissionDirective } from '@stynx-nyx/angular-auth';
import { StynxConfirmDialogComponent } from '@stynx-nyx/angular-ui';
import { RaitErrorBannerComponent } from '../../../core/error-boundary';
import { provideRaitI18nFallback } from '../../../core/i18n-fallback';
import { tokenKey } from '../../../core/i18n-token-key';
import { SseService } from '../../../core/sse.service';
import { RadarFacade } from '../../../data/facades/radar.facade';
import { permissionKeyOf, type RaitIncident } from '../../../data/models';
import { PageStateComponent } from '../../../shared/page-state.component';
import { screenOf } from '../../../shared/route-screen';
import { StreamStatusBannerComponent } from '../../../shared/stream-status-banner.component';
import type { TableColumn } from '../../../shared/table-column';
import { connectListToUrl } from '../../list-url-sync';
import {
  CONFIRM_TITLE_KEY,
  EMPTY_KEY,
  LOADING_KEY,
  createConfirmQueue,
} from '../../page-support';

const TITLE_KEY = 'rait.screens.gestao-incidentes.title';
const CMD_DECLARE_KEY = 'rait.screens.gestao-incidentes.cmd.declare-extinction';
const CONFIRM_DECLARE_KEY =
  'rait.screens.gestao-incidentes.confirm.declare-extinction';

interface IncidentRow extends Record<string, unknown> {
  readonly id: string;
  readonly incident_ref: string;
  readonly case_id: string;
  readonly flag: string;
  readonly opened_at: string;
  readonly closed_at: string;
}

const COLUMNS: readonly TableColumn<IncidentRow>[] = [
  { key: 'incident_ref', label: 'incident_ref' },
  { key: 'case_id', label: 'case_id' },
  { key: 'flag', label: 'flag' },
  { key: 'opened_at', label: 'opened_at' },
  { key: 'closed_at', label: 'closed_at' },
];

@Component({
  selector: 'rait-incidents-page',
  imports: [
    StynxTranslatePipe,
    StynxTableComponent,
    StynxPaginationComponent,
    StynxHasPermissionDirective,
    StynxConfirmDialogComponent,
    StreamStatusBannerComponent,
    PageStateComponent,
    RaitErrorBannerComponent,
  ],
  providers: [...provideRaitI18nFallback(), StynxIntlDatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-screen]': 'screen',
    '[attr.data-status]': 'facade.incidentes.status()',
  },
  template: `
    <h1 #heading tabindex="-1">{{ titleKey | stynxTranslate }}</h1>
    <rait-stream-status-banner />

    <rait-page-state
      [status]="facade.incidentes.status()"
      [error]="facade.incidentes.error()"
      [loadingLabelKey]="loadingKey"
      [emptyLabelKey]="emptyKey"
      (retry)="reload()"
    />

    @if (facade.command.error(); as error) {
      <rait-error-banner [error]="error" />
    }

    @if (rows().length > 0) {
      <stynx-table
        [columns]="columns"
        [rows]="rows()"
        [rowTrackBy]="trackRow"
      />
      <label for="rait-incidents-active">incident_ref</label>
      <select id="rait-incidents-active" (change)="selectIncident($event)">
        <option value=""></option>
        @for (incident of facade.incidentes.items(); track incident.id) {
          <option
            [value]="incident.id"
            [selected]="incident.id === selectedId()"
          >
            {{ incident.incident_ref }}
          </option>
        }
      </select>
    }
    @if (selected(); as incident) {
      <dl data-incident-form>
        <dt>cause_analysis</dt>
        <dd>{{ incident.cause_analysis ?? '' }}</dd>
        <dt>outcome</dt>
        <dd>{{ incident.outcome ?? '' }}</dd>
      </dl>
    }
    @if (facade.incidentes.value(); as page) {
      <stynx-pagination
        [totalItems]="page.total"
        [page]="page.page - 1"
        [pageSizeInput]="page.pageSize"
        (pageChange)="list.onPageChange($event)"
      />
    }

    <button
      *stynxHasPermission="declarePermission"
      type="button"
      data-action="declare-extinction"
      [disabled]="offline() || selected() === null"
      (click)="requestDeclare()"
    >
      {{ cmdDeclareKey | stynxTranslate }}
    </button>

    <stynx-confirm-dialog
      [open]="confirm.open()"
      [title]="confirmTitleKey | stynxTranslate"
      [message]="confirm.pending()?.confirmKey ?? '' | stynxTranslate"
      [confirmLabel]="confirm.pending()?.labelKey ?? '' | stynxTranslate"
      (confirm)="confirm.confirm()"
      (dismissed)="confirm.dismiss()"
    />
  `,
})
export class IncidentsPageComponent {
  readonly facade = inject(RadarFacade);
  private readonly i18n = inject(StynxI18nService);
  private readonly datePipe = inject(StynxIntlDatePipe);
  private readonly sse = inject(SseService);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
  private focused = false;

  readonly screen = screenOf(inject(ActivatedRoute));
  readonly titleKey = TITLE_KEY;
  readonly emptyKey = EMPTY_KEY;
  readonly loadingKey = LOADING_KEY;
  readonly cmdDeclareKey = CMD_DECLARE_KEY;
  readonly confirmTitleKey = CONFIRM_TITLE_KEY;
  readonly columns = COLUMNS as TableColumn<IncidentRow>[];
  readonly trackRow = (row: IncidentRow): string => row.id;
  readonly declarePermission = permissionKeyOf('rait-extinction:declare');
  readonly confirm = createConfirmQueue();
  readonly selectedId = signal('');

  readonly list = connectListToUrl({
    load: (query) => this.facade.loadIncidents(query),
  });
  readonly offline = computed(
    () => this.facade.incidentes.status() === 'offline',
  );
  readonly selected = computed<RaitIncident | null>(
    () =>
      this.facade.incidentes
        .items()
        .find((item) => item.id === this.selectedId()) ?? null,
  );
  readonly rows = computed<IncidentRow[]>(() => {
    const clocks = this.facade.incidentesRelogio();
    return this.facade.incidentes.items().map((incident) => {
      const clock = incident.clock_id
        ? clocks.get(incident.clock_id)
        : undefined;
      return {
        id: incident.id,
        incident_ref: incident.incident_ref,
        case_id: incident.case_id ?? '',
        flag: clock
          ? this.i18n.translate(tokenKey('riskFlag', clock.flag))
          : '',
        opened_at: this.datePipe.transform(incident.opened_at),
        closed_at: incident.closed_at
          ? this.datePipe.transform(incident.closed_at)
          : '',
      };
    });
  });

  constructor() {
    this.sse.connect();
    afterRenderEffect(() => {
      const status = this.facade.incidentes.status();
      const heading = this.heading()?.nativeElement;
      untracked(() => {
        if (!this.focused && (status === 'ready' || status === 'empty')) {
          this.focused = true;
          heading?.focus();
        }
      });
    });
  }

  selectIncident(event: Event): void {
    this.selectedId.set((event.target as HTMLSelectElement).value);
  }

  /** Confirmação `confirm.declare-extinction` → `rait-extinction:declare` no caso do incidente. */
  requestDeclare(): void {
    const caseId = this.selected()?.case_id ?? '';
    this.confirm.request({
      action: 'declare-extinction',
      confirmKey: CONFIRM_DECLARE_KEY,
      labelKey: CMD_DECLARE_KEY,
      run: () => this.facade.declareExtinction(caseId, {}),
    });
  }

  reload(): void {
    void this.facade.loadIncidents(this.list.query());
  }
}
