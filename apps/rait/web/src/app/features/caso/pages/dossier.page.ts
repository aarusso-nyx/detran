// T-07 Dossiê do caso (ficha IU-RAIT-009; contrato CTG-0002b §6.1 linha 9; [UC-RAIT-001]):
// `CaseFacade.loadDocuments(id)` → `documentos` no `DossierViewer` (sem visualizador: nenhum
// endpoint de URL assinada — `documentUrlOf` null, OD-R12-023); `DocumentUploader` de ofício
// (`origin: 'oficio'`) emite o pedido de anexação → `rait-document:attach-official` sob
// `*stynxHasPermission` (chave só de ficha — OD-R12-027: sem a chave em `RAIT_COMMAND_RULES` o
// botão não existe, fail-closed) → `facade.attachOfficialDocument` (M8). Os tipos de documento
// de ofício são os do formulário (CTG-0002c); até lá, o uploader recebe a lista vazia e o tipo
// digitado fica `''` (nenhum tipo é inventado; [RN-RAIT-003]: o órgão nunca exige documento seu).
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
import { StynxTranslatePipe } from '@detran/ui';
import { StynxHasPermissionDirective } from '@stynx-nyx/angular-auth';
import { RaitErrorBannerComponent } from '../../../core/error-boundary';
import { provideRaitI18nFallback } from '../../../core/i18n-fallback';
import { CaseFacade } from '../../../data/facades/case.facade';
import {
  permissionKeyOf,
  type CreateRaitDocumentDto,
} from '../../../data/models';
import {
  DocumentUploaderComponent,
  type DocumentUploadRequest,
} from '../../../shared/document-uploader.component';
import { DossierViewerComponent } from '../../../shared/dossier-viewer.component';
import { PageStateComponent } from '../../../shared/page-state.component';
import { screenOf } from '../../../shared/route-screen';
import { StreamStatusBannerComponent } from '../../../shared/stream-status-banner.component';
import {
  LOADING_KEY,
  combineStatus,
  errorsOnly,
  provisionalBody,
} from '../../page-support';
import { caseIdOf } from '../case-route';

const TITLE_KEY = 'rait.screens.casos-id-dossie.title';
const INTRO_KEY = 'rait.screens.casos-id-dossie.intro';
const EMPTY_KEY = 'rait.screens.casos-id-dossie.empty';
const CMD_ATTACH_KEY = 'rait.screens.casos-id-dossie.cmd.attach-official';
/** Tipos de documento de ofício: do formulário do CTG-0002c (nenhum inventado aqui). */
const OFFICIAL_KINDS: readonly string[] = [];

@Component({
  selector: 'rait-dossier-page',
  imports: [
    StynxTranslatePipe,
    StynxHasPermissionDirective,
    StreamStatusBannerComponent,
    PageStateComponent,
    DossierViewerComponent,
    DocumentUploaderComponent,
    RaitErrorBannerComponent,
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
      [status]="pageStatus()"
      [error]="facade.caso.error() ?? facade.documentos.error()"
      [loadingLabelKey]="loadingKey"
      [emptyLabelKey]="emptyKey"
      (retry)="reload()"
    />

    @if (facade.command.error(); as error) {
      <rait-error-banner [error]="error" />
    }

    @if (facade.caso.value()) {
      <rait-dossier-viewer
        [documents]="facade.documentos.items()"
        [status]="viewerStatus()"
      />
      <section *stynxHasPermission="attachPermission" data-attach-official>
        <h2>{{ cmdAttachKey | stynxTranslate }}</h2>
        <rait-document-uploader
          origin="oficio"
          [kinds]="officialKinds"
          [disabled]="offline()"
          (submitted)="pendingUpload.set($event)"
        />
        <button
          type="button"
          data-action="attach-official"
          [disabled]="offline() || pendingUpload() === null"
          (click)="attachOfficial()"
        >
          {{ cmdAttachKey | stynxTranslate }}
        </button>
      </section>
    }
  `,
})
export class DossierPageComponent {
  readonly facade = inject(CaseFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
  private focused = false;

  readonly screen = screenOf(this.route);
  readonly caseId = caseIdOf(this.route);
  readonly titleKey = TITLE_KEY;
  readonly introKey = INTRO_KEY;
  readonly emptyKey = EMPTY_KEY;
  readonly loadingKey = LOADING_KEY;
  readonly cmdAttachKey = CMD_ATTACH_KEY;
  readonly officialKinds = OFFICIAL_KINDS;
  readonly attachPermission = permissionKeyOf('rait-document:attach-official');
  readonly pendingUpload = signal<DocumentUploadRequest | null>(null);

  readonly status = computed(() =>
    combineStatus(this.facade.caso.status(), this.facade.documentos.status()),
  );
  /** O `DossierViewer` apresenta `loading`/vazio por si; a página trata o caso e os erros. */
  readonly viewerStatus = computed(() => this.facade.documentos.status());
  readonly pageStatus = computed(() =>
    combineStatus(
      this.facade.caso.status(),
      errorsOnly(this.facade.documentos.status()),
    ),
  );
  readonly offline = computed(
    () => this.facade.documentos.status() === 'offline',
  );

  constructor() {
    void this.facade.loadCaseBundle(this.caseId);
    void this.facade.loadDocuments(this.caseId);
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

  /** Sem efeito jurídico próprio (ficha 009 §6): sem confirmação; o upload é do storage (OD-R12-023). */
  attachOfficial(): void {
    const upload = this.pendingUpload();
    if (upload === null || this.offline()) return;
    void this.facade.attachOfficialDocument(
      this.caseId,
      provisionalBody<CreateRaitDocumentDto>({
        case_id: this.caseId,
        kind: upload.kind,
        origin: upload.origin,
        filename: upload.file.name,
        digitised_from_paper: upload.digitisedFromPaper,
      }),
    );
  }

  reload(): void {
    void this.facade.loadCaseBundle(this.caseId);
    void this.facade.loadDocuments(this.caseId);
  }
}
