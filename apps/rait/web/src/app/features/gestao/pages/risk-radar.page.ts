// T-37 Radar de risco (ficha IU-RAIT-039; contrato CTG-0002b §6.1 linha 38): `RadarFacade.
// loadRadar(query)` → `radar` (relógios com bandeira, ordem recebida — [RN-RAIT-141]) +
// `radarCasos` (join caso) — `ClockRadar` = `<stynx-table>` de relógios (case_id/protocolo,
// clock_code, bandeira → `tokenKey('riskFlag')`, started_on, ceiling_on, legal_basis) segmentada
// por `filtro=clock_code:B;flag:CRITICO` via URL; `sse.connect({ topics: ['clock', 'case'] })`;
// `ClocksPanel` do caso ativo. Nenhuma ação (as ações estão no drill-down `gestao/radar/:caseId`).
// Nenhum dia restante é calculado (OD-R12-022).
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  StynxI18nService,
  StynxIntlDatePipe,
  StynxPaginationComponent,
  StynxTableComponent,
  StynxTranslatePipe,
} from '@detran/ui';
import { provideRaitI18nFallback } from '../../../core/i18n-fallback';
import { tokenKey } from '../../../core/i18n-token-key';
import { ShortcutService } from '../../../core/shortcut.service';
import { SseService } from '../../../core/sse.service';
import { RadarFacade } from '../../../data/facades/radar.facade';
import type { RaitClock } from '../../../data/models';
import { ClocksPanelComponent } from '../../../shared/clocks-panel.component';
import { PageStateComponent } from '../../../shared/page-state.component';
import { screenOf } from '../../../shared/route-screen';
import { StreamStatusBannerComponent } from '../../../shared/stream-status-banner.component';
import type { TableColumn } from '../../../shared/table-column';
import { connectListToUrl } from '../../list-url-sync';
import { LOADING_KEY } from '../../page-support';

const TITLE_KEY = 'rait.screens.gestao-radar.title';
const INTRO_KEY = 'rait.screens.gestao-radar.intro';
const EMPTY_KEY = 'rait.screens.gestao-radar.empty';
const OPEN_KEY = 'rait.action.open';
const RADAR_ROUTE = '/gestao/radar';

interface ClockRow extends Record<string, unknown> {
  readonly id: string;
  readonly protocol_number: string;
  readonly clock_code: string;
  readonly flag: string;
  readonly started_on: string;
  readonly ceiling_on: string;
  readonly legal_basis: string;
}

const COLUMNS: readonly TableColumn<ClockRow>[] = [
  { key: 'protocol_number', label: 'protocol_number' },
  { key: 'clock_code', label: 'clock_code' },
  { key: 'flag', label: 'flag' },
  { key: 'started_on', label: 'started_on' },
  { key: 'ceiling_on', label: 'ceiling_on' },
  { key: 'legal_basis', label: 'legal_basis' },
];

@Component({
  selector: 'rait-risk-radar-page',
  imports: [
    StynxTranslatePipe,
    StynxTableComponent,
    StynxPaginationComponent,
    StreamStatusBannerComponent,
    PageStateComponent,
    ClocksPanelComponent,
  ],
  providers: [...provideRaitI18nFallback(), StynxIntlDatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-screen]': 'screen',
    '[attr.data-status]': 'facade.radar.status()',
  },
  template: `
    <h1 #heading tabindex="-1">{{ titleKey | stynxTranslate }}</h1>
    <rait-stream-status-banner />
    <p>{{ introKey | stynxTranslate }}</p>

    <rait-page-state
      [status]="facade.radar.status()"
      [error]="facade.radar.error()"
      [loadingLabelKey]="loadingKey"
      [emptyLabelKey]="emptyKey"
      (retry)="reload()"
    />

    @if (rows().length > 0) {
      <stynx-table
        [columns]="columns"
        [rows]="rows()"
        [rowTrackBy]="trackRow"
      />
      <label for="rait-radar-active">case_id</label>
      <select id="rait-radar-active" (change)="selectClock($event)">
        <option value=""></option>
        @for (clock of facade.radar.items(); track clock.id) {
          <option [value]="clock.id" [selected]="clock.id === activeId()">
            {{ protocolOf(clock) }}
          </option>
        }
      </select>
      <button
        type="button"
        data-open-drilldown
        [disabled]="activeClock() === null"
        (click)="openActive()"
      >
        {{ openKey | stynxTranslate }}
      </button>
    }
    @if (activeClocks().length > 0) {
      <rait-clocks-panel [clocks]="activeClocks()" />
    }
    @if (facade.radar.value(); as page) {
      <stynx-pagination
        [totalItems]="page.total"
        [page]="page.page - 1"
        [pageSizeInput]="page.pageSize"
        (pageChange)="list.onPageChange($event)"
      />
    }
  `,
})
export class RiskRadarPageComponent {
  readonly facade = inject(RadarFacade);
  private readonly router = inject(Router);
  private readonly i18n = inject(StynxI18nService);
  private readonly datePipe = inject(StynxIntlDatePipe);
  private readonly sse = inject(SseService);
  private readonly shortcuts = inject(ShortcutService);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
  private focused = false;

  readonly screen = screenOf(inject(ActivatedRoute));
  readonly titleKey = TITLE_KEY;
  readonly introKey = INTRO_KEY;
  readonly emptyKey = EMPTY_KEY;
  readonly loadingKey = LOADING_KEY;
  readonly openKey = OPEN_KEY;
  readonly columns = COLUMNS as TableColumn<ClockRow>[];
  readonly trackRow = (row: ClockRow): string => row.id;
  readonly activeId = signal('');

  readonly list = connectListToUrl({
    load: (query) => this.facade.loadRadar(query),
  });
  readonly activeClock = computed<RaitClock | null>(
    () =>
      this.facade.radar.items().find((clock) => clock.id === this.activeId()) ??
      null,
  );
  /** Relógios do caso ativo (os quatro A–D quando carregados). */
  readonly activeClocks = computed<readonly RaitClock[]>(() => {
    const active = this.activeClock();
    if (active === null) return [];
    return this.facade.radar
      .items()
      .filter((clock) => clock.case_id === active.case_id);
  });
  /** Ordem recebida; texto já traduzido (o kit renderiza só texto). */
  readonly rows = computed<ClockRow[]>(() =>
    this.facade.radar.items().map((clock) => ({
      id: clock.id,
      protocol_number: this.protocolOf(clock),
      clock_code: clock.clock_code,
      flag: this.i18n.translate(tokenKey('riskFlag', clock.flag)),
      started_on: clock.started_on
        ? this.datePipe.transform(clock.started_on)
        : '',
      ceiling_on: clock.ceiling_on
        ? this.datePipe.transform(clock.ceiling_on)
        : '',
      legal_basis: clock.legal_basis ?? '',
    })),
  );

  constructor() {
    this.sse.connect({ topics: ['clock', 'case'] });
    const destroyRef = inject(DestroyRef);
    const unregister = [
      this.shortcuts.register('list-next', () => this.move(1)),
      this.shortcuts.register('list-prev', () => this.move(-1)),
      this.shortcuts.register('open', () => this.openActive()),
    ];
    destroyRef.onDestroy(() => unregister.forEach((fn) => fn()));
    afterRenderEffect(() => {
      const status = this.facade.radar.status();
      const heading = this.heading()?.nativeElement;
      untracked(() => {
        if (!this.focused && (status === 'ready' || status === 'empty')) {
          this.focused = true;
          heading?.focus();
        }
      });
    });
  }

  protocolOf(clock: RaitClock): string {
    return (
      this.facade.radarCasos().get(clock.case_id)?.protocol_number ??
      clock.case_id
    );
  }

  selectClock(event: Event): void {
    this.activeId.set((event.target as HTMLSelectElement).value);
  }

  openActive(): void {
    const active = this.activeClock();
    if (active === null) return;
    void this.router.navigate([RADAR_ROUTE, active.case_id]);
  }

  reload(): void {
    void this.facade.loadRadar(this.list.query());
  }

  /** Linha ativa por teclado (`j`/`k`), na ordem recebida. */
  private move(step: 1 | -1): void {
    const items = this.facade.radar.items();
    if (items.length === 0) return;
    const index = items.findIndex((clock) => clock.id === this.activeId());
    const next = Math.min(Math.max(index + step, 0), items.length - 1);
    this.activeId.set(items[next].id);
  }
}
