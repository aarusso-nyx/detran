// T-43 Dossiê selado (ficha IU-RAIT-058; contrato CTG-0002b §6.1 linha 56; [RN-RAIT-137]):
// `ArchiveFacade.loadSealedDossier(id)` → `dossie` (caso, documentos, decisões, comunicações,
// eventos); `SealedDossierViewer` = `DossierViewer` (hash por documento em `<code>`; a supressão
// de terceiros é do servidor) + `EventTimeline`; `cmd.copy` só vira link de download quando
// `documentUrlOf` devolver URL — hoje null (OD-R12-023): sem link, nenhum comando M8.
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  inject,
  untracked,
  viewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StynxTranslatePipe } from '@detran/ui';
import { provideRaitI18nFallback } from '../../../core/i18n-fallback';
import { SseService } from '../../../core/sse.service';
import { ArchiveFacade } from '../../../data/facades/archive.facade';
import type { RaitDocument } from '../../../data/models';
import { CaseStateBadgeComponent } from '../../../shared/case-state-badge.component';
import { DossierViewerComponent } from '../../../shared/dossier-viewer.component';
import { EventTimelineComponent } from '../../../shared/event-timeline.component';
import { PageStateComponent } from '../../../shared/page-state.component';
import { screenOf } from '../../../shared/route-screen';
import { StreamStatusBannerComponent } from '../../../shared/stream-status-banner.component';
import { EMPTY_KEY, LOADING_KEY } from '../../page-support';
import { routeParam } from '../../route-params';

const TITLE_KEY = 'rait.screens.arquivo-casos-id.title';
/** Só vira `<a download>` com URL do storage (OD-R12-023); hoje `documentUrlOf` é null. */
const CMD_COPY_KEY = 'rait.screens.arquivo-casos-id.cmd.copy';
const CASE_ID_PARAM = 'id';
/** Sem endpoint de URL assinada (spec §11; OD-R12-023). */
const DOCUMENT_URL_OF: ((document: RaitDocument) => string | null) | null =
  null;

@Component({
  selector: 'rait-sealed-dossier-page',
  imports: [
    StynxTranslatePipe,
    StreamStatusBannerComponent,
    PageStateComponent,
    CaseStateBadgeComponent,
    DossierViewerComponent,
    EventTimelineComponent,
  ],
  providers: provideRaitI18nFallback(),
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-screen]': 'screen',
    '[attr.data-case-id]': 'caseId',
    '[attr.data-status]': 'facade.dossie.status()',
  },
  template: `
    <h1 #heading tabindex="-1">{{ titleKey | stynxTranslate }}</h1>
    <rait-stream-status-banner />

    <rait-page-state
      [status]="facade.dossie.status()"
      [error]="facade.dossie.error()"
      [loadingLabelKey]="loadingKey"
      [emptyLabelKey]="emptyKey"
      (retry)="reload()"
    />

    @if (facade.dossie.value(); as dossier) {
      <p data-case [attr.data-case-id]="dossier.case.id">
        <span>{{ dossier.case.protocol_number }}</span>
        <rait-case-state-badge
          [state]="dossier.case.state"
          [instance]="dossier.case.instance"
        />
      </p>
      <rait-dossier-viewer
        [documents]="dossier.documents"
        [documentUrlOf]="documentUrlOf"
      />
      @if (documentUrlOf !== null) {
        <p>{{ cmdCopyKey | stynxTranslate }}</p>
      }
      <rait-event-timeline [events]="dossier.events" />
    }
  `,
})
export class SealedDossierPageComponent {
  readonly facade = inject(ArchiveFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly sse = inject(SseService);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
  private focused = false;

  readonly screen = screenOf(this.route);
  readonly caseId = routeParam(this.route, CASE_ID_PARAM);
  readonly titleKey = TITLE_KEY;
  readonly cmdCopyKey = CMD_COPY_KEY;
  readonly emptyKey = EMPTY_KEY;
  readonly loadingKey = LOADING_KEY;
  readonly documentUrlOf = DOCUMENT_URL_OF;

  constructor() {
    this.sse.connect({ caseId: this.caseId });
    void this.facade.loadSealedDossier(this.caseId);
    afterRenderEffect(() => {
      const status = this.facade.dossie.status();
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
    void this.facade.loadSealedDossier(this.caseId);
  }
}
