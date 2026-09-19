// RecursoJariForm (contrato CTG-0003b §6 T-03; [UC-PORTAL-002]): passo 2 do recurso à JARI — os
// fundamentos e as provas (`AttachmentUploader`, `portal.forms.recurso_jari.provas`). Nenhuma
// sugestão de pagar antes ([RN-PORTAL-127]): a tela não mostra valores nem link ao pagamento.
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  output,
} from '@angular/core';
import { StynxTranslatePipe } from '@detran/ui';
import { PortalFieldErrorsDirective } from '../../../core/field-errors.directive';
import {
  ATTACHMENT_ACCEPT,
  ATTACHMENT_MAX_BYTES,
} from '../../../forms/attachments';
import { AttachmentUploaderComponent } from '../../../shared/attachment-uploader.component';
import { PrefilledSummaryComponent } from '../../../shared/prefilled-summary.component';

export interface RecursoJariValues {
  readonly grounds: string;
  readonly attachmentIds: readonly string[];
}

const EMPTY_VALUES: RecursoJariValues = { grounds: '', attachmentIds: [] };

function asValues(value: Record<string, unknown> | null): RecursoJariValues {
  return { ...EMPTY_VALUES, ...(value ?? {}) } as RecursoJariValues;
}

@Component({
  selector: 'portal-recurso-jari-form',
  imports: [
    StynxTranslatePipe,
    PortalFieldErrorsDirective,
    AttachmentUploaderComponent,
    PrefilledSummaryComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.data-request-id]': 'requestId()' },
  template: `
    <portal-prefilled-summary [prefilled]="prefilled()" />
    <form
      class="portal-recurso-form"
      [portalFieldErrors]="fields()"
      (submit)="$event.preventDefault()"
    >
      <label>
        <span>{{ 'portal.screens.t03.field.grounds' | stynxTranslate }}</span>
        <textarea
          name="grounds"
          rows="6"
          [value]="current().grounds"
          [disabled]="disabled()"
          (input)="patchGrounds($event)"
        ></textarea>
      </label>
      @if (requestId(); as requestId) {
        <portal-attachment-uploader
          [requestId]="requestId"
          [accept]="accept"
          [maxBytes]="maxBytes"
          [checklist]="requirements()"
          hintKey="portal.forms.recurso_jari.provas"
          [disabled]="disabled()"
          [attachmentIds]="current().attachmentIds"
          (attachmentIdsChange)="setAttachments($event)"
        />
      }
      <button
        type="button"
        data-draft
        [disabled]="disabled()"
        (click)="draftRequested.emit()"
      >
        {{ 'portal.screens.t03.cmd.draft' | stynxTranslate }}
      </button>
    </form>
  `,
})
export class RecursoJariFormComponent {
  readonly prefilled = input<Readonly<Record<string, unknown>>>({});
  readonly requirements = input<readonly string[]>([]);
  readonly requestId = input<string | null>(null);
  readonly fields = input<readonly string[]>([]);
  readonly disabled = input(false);
  readonly values = model<Record<string, unknown> | null>(null);
  readonly draftRequested = output<void>();

  readonly accept = ATTACHMENT_ACCEPT;
  readonly maxBytes = ATTACHMENT_MAX_BYTES;
  readonly current = computed(() => asValues(this.values()));

  patchGrounds(event: Event): void {
    const grounds = (event.target as HTMLTextAreaElement).value;
    this.values.set({ ...this.current(), grounds });
  }

  setAttachments(attachmentIds: readonly string[]): void {
    this.values.set({ ...this.current(), attachmentIds: [...attachmentIds] });
  }
}
