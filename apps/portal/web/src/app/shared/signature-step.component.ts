// SignatureStep (contrato CTG-0003a §5.8; T02 §5 "passo guiado embutido"; [UC-PORTAL-019];
// [RN-PORTAL-101] c; [RN-PORTAL-104]). Suficiência = `required === 'none'` ou
// `ASSURANCE_ORDER[current] >= ASSURANCE_ORDER[required]` (mesma ordem do `assuranceGuard`; o
// nível exigido vem do servidor pelo input `required` — nenhuma tabela ato → nível aqui).
// Insuficiente → `AssuranceExplainer` + botão `portal.screens.t27.cmd.elevar` →
// `SessionFacade.requestElevation` → `elevationRequested` (quem navega ao `redirectUrl` é o
// chamador). `required === 'qualificada'` → nunca um caminho: banner
// `portal.errors.assurance_qualified_never_required`. Suficiente → `govbr` (signatureRef:
// `source_pending`, OD-P60) ou `upload` (documento assinado via `AttachmentUploader`).
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { StynxBannerComponent, StynxTranslatePipe } from '@detran/ui';
import type { ElevationStarted } from '../data/portal-command.models';
import {
  ASSURANCE_ORDER,
  SessionFacade,
  type AssuranceLevel,
  type ElevationMethod,
} from '../core/session.facade';
import { ATTACHMENT_ACCEPT, ATTACHMENT_MAX_BYTES } from '../forms/attachments';
import { AssuranceExplainerComponent } from './assurance-explainer.component';
import {
  AttachmentUploaderComponent,
  type AttachmentEntry,
} from './attachment-uploader.component';
import type { WizardResumeDraft } from './service-wizard.store';

export type SignatureMethod = 'govbr' | 'upload';

export interface SignatureChoice {
  readonly method: SignatureMethod;
  readonly signatureRef: string;
}

@Component({
  selector: 'portal-signature-step',
  imports: [
    StynxTranslatePipe,
    StynxBannerComponent,
    AssuranceExplainerComponent,
    AttachmentUploaderComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-act-key]': 'actKey()',
    '[attr.data-required]': 'required()',
  },
  template: `
    @if (required() === 'qualificada') {
      <div role="alert" data-qualified-never-required>
        <stynx-banner
          tone="error"
          [message]="
            'portal.errors.assurance_qualified_never_required' | stynxTranslate
          "
        />
      </div>
    } @else if (!sufficient()) {
      <portal-assurance-explainer
        [required]="requiredLevel()"
        [current]="current()"
        [actKey]="actKey()"
        (methodSelected)="method.set($event)"
      />
      <button
        type="button"
        data-elevar
        [disabled]="method() === null || elevating()"
        (click)="elevate()"
      >
        {{ 'portal.screens.t27.cmd.elevar' | stynxTranslate }}
      </button>
    } @else {
      <div class="portal-signature-methods" role="group">
        <button
          type="button"
          data-method="govbr"
          [disabled]="govbrSignatureRef() === null"
          (click)="signWithGovbr()"
        >
          {{ 'portal.forms.assinatura.method.govbr' | stynxTranslate }}
        </button>
        @if (uploadRequestId()) {
          <button type="button" data-method="upload" (click)="chooseUpload()">
            {{ 'portal.forms.assinatura.method.upload' | stynxTranslate }}
          </button>
        }
      </div>
      @if (uploading() && uploadRequestId(); as requestId) {
        <portal-attachment-uploader
          [requestId]="requestId"
          [accept]="accept"
          [maxBytes]="maxBytes"
          [labelKey]="'portal.forms.assinatura.method.upload'"
          [hintKey]="'portal.forms.assinatura.method.upload'"
          (attached)="signWithUpload($event)"
        />
      }
    }
  `,
})
export class SignatureStepComponent {
  private readonly session = inject(SessionFacade);

  /** `serviceKey`. */
  readonly actKey = input.required<string>();
  /** `createRequest.minimumAssurance` (servidor). */
  readonly required = input.required<'none' | AssuranceLevel>();
  readonly resumeRoute = input.required<string>();
  readonly resumeDraft = input<WizardResumeDraft | null>(null);
  /** Habilita o caminho `upload` (AttachmentUploader). */
  readonly uploadRequestId = input<string | null>(null);
  /** `source_pending`: origem do valor (OD-P60). */
  readonly govbrSignatureRef = input<string | null>(null);
  readonly signed = output<SignatureChoice>();
  readonly elevationRequested = output<ElevationStarted>();

  readonly accept = ATTACHMENT_ACCEPT;
  readonly maxBytes = ATTACHMENT_MAX_BYTES;
  readonly method = signal<ElevationMethod | null>(null);
  readonly uploading = signal(false);
  readonly elevating = signal(false);

  readonly current = computed(() => this.session.assuranceLevel());
  readonly requiredLevel = computed<AssuranceLevel>(() => {
    const required = this.required();
    return required === 'none' ? 'simples' : required;
  });
  readonly sufficient = computed(() => {
    const required = this.required();
    if (required === 'none') return true;
    const current = this.current();
    return (
      current !== null && ASSURANCE_ORDER[current] >= ASSURANCE_ORDER[required]
    );
  });

  async elevate(): Promise<void> {
    const method = this.method();
    if (!method || this.required() === 'qualificada') return;
    this.elevating.set(true);
    try {
      const started = await this.session.requestElevation({
        targetLevel: 'avancada',
        method,
        resumeRoute: this.resumeRoute(),
        draft: this.resumeDraft(),
      });
      this.elevationRequested.emit(started);
    } finally {
      this.elevating.set(false);
    }
  }

  signWithGovbr(): void {
    const signatureRef = this.govbrSignatureRef();
    if (signatureRef === null) return; // OD-P60: sem origem do valor, não assina.
    this.signed.emit({ method: 'govbr', signatureRef });
  }

  chooseUpload(): void {
    this.uploading.set(true);
  }

  signWithUpload(entry: AttachmentEntry): void {
    if (!entry.attachmentId) return;
    this.signed.emit({ method: 'upload', signatureRef: entry.attachmentId });
  }
}
