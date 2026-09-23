// T-12 Partes (ficha IU-RAIT-014; contrato CTG-0002b §6.1 linha 14; LGPD §10.6 / OD-R12-033):
// `CaseFacade.loadParties(id)` → `partes` numa `<stynx-table>` do kit (role → `rait.common.party_`
// + role, person_name, document_number — rota já restrita a secretaria/analista —,
// legitimacy_basis, representation_verified); `contact_email` nunca. Nenhuma ação.
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  untracked,
  viewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  StynxI18nService,
  StynxTableComponent,
  StynxTranslatePipe,
} from '@detran/ui';
import { provideRaitI18nFallback } from '../../../core/i18n-fallback';
import { CaseFacade } from '../../../data/facades/case.facade';
import { PageStateComponent } from '../../../shared/page-state.component';
import { screenOf } from '../../../shared/route-screen';
import { StreamStatusBannerComponent } from '../../../shared/stream-status-banner.component';
import type { TableColumn } from '../../../shared/table-column';
import { EMPTY_KEY, LOADING_KEY, combineStatus } from '../../page-support';
import { caseIdOf } from '../case-route';

const TITLE_KEY = 'rait.screens.casos-id-partes.title';
const INTRO_KEY = 'rait.screens.casos-id-partes.intro';
const PARTY_ROLE_PREFIX = 'rait.common.party_';
const YES_KEY = 'rait.common.yes';
const NO_KEY = 'rait.common.no';

interface PartyRow extends Record<string, unknown> {
  readonly id: string;
  readonly role: string;
  readonly person_name: string;
  readonly document_number: string;
  readonly legitimacy_basis: string;
  readonly representation_verified: string;
}

/** Cabeçalhos = nomes dos campos do contrato (OD-R12-028, precedente do par 1). */
const COLUMNS: readonly TableColumn<PartyRow>[] = [
  { key: 'role', label: 'role' },
  { key: 'person_name', label: 'person_name' },
  { key: 'document_number', label: 'document_number' },
  { key: 'legitimacy_basis', label: 'legitimacy_basis' },
  { key: 'representation_verified', label: 'representation_verified' },
];

@Component({
  selector: 'rait-parties-page',
  imports: [
    StynxTranslatePipe,
    StynxTableComponent,
    StreamStatusBannerComponent,
    PageStateComponent,
  ],
  providers: provideRaitI18nFallback(),
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-screen]': 'screen',
    '[attr.data-status]': 'status()',
  },
  template: `
    <h1 #heading tabindex="-1">{{ titleKey | stynxTranslate }}</h1>
    <rait-stream-status-banner />
    <p>{{ introKey | stynxTranslate }}</p>

    <rait-page-state
      [status]="status()"
      [error]="facade.caso.error() ?? facade.partes.error()"
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
    }
  `,
})
export class PartiesPageComponent {
  readonly facade = inject(CaseFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly i18n = inject(StynxI18nService);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
  private focused = false;

  readonly screen = screenOf(this.route);
  readonly caseId = caseIdOf(this.route);
  readonly titleKey = TITLE_KEY;
  readonly introKey = INTRO_KEY;
  readonly emptyKey = EMPTY_KEY;
  readonly loadingKey = LOADING_KEY;
  readonly columns = COLUMNS as TableColumn<PartyRow>[];
  readonly trackRow = (row: PartyRow): string => row.id;

  readonly status = computed(() =>
    combineStatus(this.facade.caso.status(), this.facade.partes.status()),
  );

  /** Ordem recebida; texto já traduzido (o kit renderiza só texto). */
  readonly rows = computed<PartyRow[]>(() =>
    this.facade.partes.items().map((party) => ({
      id: party.id,
      role: this.i18n.translate(`${PARTY_ROLE_PREFIX}${party.role}`),
      person_name: party.person_name,
      document_number: party.document_number ?? '',
      legitimacy_basis: party.legitimacy_basis ?? '',
      representation_verified: this.i18n.translate(
        party.representation_verified ? YES_KEY : NO_KEY,
      ),
    })),
  );

  constructor() {
    void this.facade.loadCaseBundle(this.caseId);
    afterRenderEffect(() => {
      const status = this.status();
      const heading = this.heading()?.nativeElement;
      untracked(() => {
        if (!this.focused && (status === 'ready' || status === 'empty')) {
          this.focused = true;
          heading?.focus();
        }
      });
    });
  }

  reload(): void {
    void this.facade.loadCaseBundle(this.caseId);
  }
}
