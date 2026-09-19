// JuntaMedicaForm (contrato CTG-0003c §6 junta; [UC-PORTAL-014]): o passo 2 projetado no
// `ServiceWizard` — motivo do pedido (com o hint da ficha) e os anexos que o sustentam
// (`AttachmentUploader` com o checklist `requirements[]` do servidor). Os valores sobem pelo
// `model` `values` (forma de `JuntaMedicaSchema`: `examId`, `reason`, `attachmentIds`); erros de
// campo (`fields[]`) marcam os controles pela diretiva. Nenhum prazo é calculado aqui — a janela é
// do servidor (`BOARD_REQUEST_WINDOW_CLOSED`).
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
} from '@angular/core';
import { StynxTranslatePipe } from '@detran/ui';
import { PortalFieldErrorsDirective } from '../../../core/field-errors.directive';
import {
  ATTACHMENT_ACCEPT,
  ATTACHMENT_MAX_BYTES,
} from '../../../forms/attachments';
import { AttachmentUploaderComponent } from '../../../shared/attachment-uploader.component';

export interface JuntaMedicaValues {
  readonly examId?: string;
  readonly reason: string;
  readonly attachmentIds: readonly string[];
}

@Component({
  selector: 'portal-junta-medica-form',
  imports: [
    StynxTranslatePipe,
    PortalFieldErrorsDirective,
    AttachmentUploaderComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.data-request-id]': 'requestId()' },
  template: `
    <form
      class="portal-junta-form"
      [portalFieldErrors]="fields()"
      (submit)="$event.preventDefault()"
    >
      <label>
        <span>{{ 'portal.forms.junta_medica.motivo' | stynxTranslate }}</span>
        <textarea
          name="reason"
          rows="6"
          [value]="current().reason"
          [disabled]="disabled()"
          (input)="patchReason($event)"
        ></textarea>
      </label>
      <p data-hint>{{ 'portal.forms.junta_medica.hint' | stynxTranslate }}</p>
      <p id="reason-error" data-field-error>
        @if (fields().includes('reason')) {
          {{ 'portal.errors.validation_failed' | stynxTranslate }}
        }
      </p>
      @if (requestId(); as requestId) {
        <portal-attachment-uploader
          [requestId]="requestId"
          [accept]="accept"
          [maxBytes]="maxBytes"
          [checklist]="requirements()"
          hintKey="portal.forms.junta_medica.anexos"
          [disabled]="disabled()"
          [attachmentIds]="current().attachmentIds"
          (attachmentIdsChange)="setAttachments($event)"
        />
      }
    </form>
  `,
})
export class JuntaMedicaFormComponent {
  /** `targetId` do alvo (`examId`), fixado pela página; entra nos valores quando presente. */
  readonly examId = input<string | null>(null);
  /** `ServiceWizardStore.requirements()` → checklist do uploader. */
  readonly requirements = input<readonly string[]>([]);
  /** `ServiceWizardStore.requestId()` (anexos só com pedido criado). */
  readonly requestId = input<string | null>(null);
  /** `fields[]` do erro 400/422 → diretiva. */
  readonly fields = input<readonly string[]>([]);
  readonly disabled = input(false);
  /** `ServiceWizardComponent.values` (duas vias). */
  readonly values = model<Record<string, unknown> | null>(null);

  readonly accept = ATTACHMENT_ACCEPT;
  readonly maxBytes = ATTACHMENT_MAX_BYTES;
  readonly current = computed<JuntaMedicaValues>(() => {
    const examId = this.examId();
    return {
      ...(examId ? { examId } : {}),
      reason: '',
      attachmentIds: [],
      ...(this.values() ?? {}),
    };
  });

  patchReason(event: Event): void {
    const reason = (event.target as HTMLTextAreaElement).value;
    this.values.set({ ...this.current(), reason });
  }

  setAttachments(attachmentIds: readonly string[]): void {
    this.values.set({ ...this.current(), attachmentIds: [...attachmentIds] });
  }
}
