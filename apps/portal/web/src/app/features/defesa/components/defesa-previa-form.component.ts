// DefesaPreviaForm (contrato CTG-0003b §6 T-02; [RN-PORTAL-106]; [RN-PORTAL-107]): o passo 2
// projetado no `ServiceWizard` — o que o órgão já tem (`PrefilledSummary`, somente leitura), os
// fatos, os fundamentos, o tipo do pedido e os anexos (`AttachmentUploader` com o checklist
// `requirements[]` do servidor, nunca lista do cliente). Os valores sobem pelo `model` `values`
// (forma de `DefesaPreviaSchema`); erros de campo (`fields[]`) marcam os controles pela diretiva.
// "Salvar rascunho" é pedido à página (`draftRequested`), que chama o `ServiceWizardStore`.
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

/** `DefesaPreviaSchema.requestType` (contrato §5.1); rótulos OD-P70. */
const REQUEST_TYPES = ['cancelamento', 'outro'] as const;
type RequestType = (typeof REQUEST_TYPES)[number];

export interface DefesaPreviaValues {
  readonly facts: string;
  readonly grounds: string;
  readonly attachmentIds: readonly string[];
  readonly requestType: RequestType;
}

const EMPTY_VALUES: DefesaPreviaValues = {
  facts: '',
  grounds: '',
  attachmentIds: [],
  requestType: REQUEST_TYPES[0],
};

function asValues(value: Record<string, unknown> | null): DefesaPreviaValues {
  return { ...EMPTY_VALUES, ...(value ?? {}) } as DefesaPreviaValues;
}

@Component({
  selector: 'portal-defesa-previa-form',
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
      class="portal-defesa-form"
      [portalFieldErrors]="fields()"
      (submit)="$event.preventDefault()"
    >
      <label>
        <span>{{ 'portal.screens.t02.field.facts' | stynxTranslate }}</span>
        <textarea
          name="facts"
          rows="6"
          [value]="current().facts"
          [disabled]="disabled()"
          (input)="patch('facts', $event)"
        ></textarea>
      </label>
      <label>
        <span>{{ 'portal.screens.t02.field.grounds' | stynxTranslate }}</span>
        <textarea
          name="grounds"
          rows="6"
          [value]="current().grounds"
          [disabled]="disabled()"
          (input)="patch('grounds', $event)"
        ></textarea>
      </label>
      <label>
        <span>{{ 'portal.forms.defesa_previa.tipo' | stynxTranslate }}</span>
        <select
          name="requestType"
          [value]="current().requestType"
          [disabled]="disabled()"
          (change)="patch('requestType', $event)"
        >
          @for (type of requestTypes; track type) {
            <option [value]="type">{{ typeKey(type) | stynxTranslate }}</option>
          }
        </select>
      </label>
      @if (requestId(); as requestId) {
        <portal-attachment-uploader
          [requestId]="requestId"
          [accept]="accept"
          [maxBytes]="maxBytes"
          [checklist]="requirements()"
          hintKey="portal.forms.defesa_previa.anexos_hint"
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
        {{ 'portal.screens.t02.cmd.draft' | stynxTranslate }}
      </button>
    </form>
  `,
})
export class DefesaPreviaFormComponent {
  /** `ServiceWizardStore.prefilled()`. */
  readonly prefilled = input<Readonly<Record<string, unknown>>>({});
  /** `ServiceWizardStore.requirements()` → checklist do uploader. */
  readonly requirements = input<readonly string[]>([]);
  /** `ServiceWizardStore.requestId()` (anexos só com pedido criado). */
  readonly requestId = input<string | null>(null);
  /** `fields[]` do erro 400/422 → diretiva. */
  readonly fields = input<readonly string[]>([]);
  readonly disabled = input(false);
  /** `ServiceWizardComponent.values` (duas vias). */
  readonly values = model<Record<string, unknown> | null>(null);
  readonly draftRequested = output<void>();

  readonly requestTypes = REQUEST_TYPES;
  readonly accept = ATTACHMENT_ACCEPT;
  readonly maxBytes = ATTACHMENT_MAX_BYTES;
  readonly current = computed(() => asValues(this.values()));

  typeKey(type: RequestType): string {
    return `portal.forms.defesa_previa.tipo.${type}`;
  }

  patch(field: 'facts' | 'grounds' | 'requestType', event: Event): void {
    const value = (event.target as HTMLInputElement | HTMLSelectElement).value;
    this.values.set({ ...this.current(), [field]: value });
  }

  setAttachments(attachmentIds: readonly string[]): void {
    this.values.set({ ...this.current(), attachmentIds: [...attachmentIds] });
  }
}
