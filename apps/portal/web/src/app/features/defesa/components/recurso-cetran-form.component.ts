// RecursoCetranForm (contrato CTG-0003b §6 T-04; [UC-PORTAL-003] AC-1; [RN-PORTAL-106]): passo 2
// do recurso ao CETRAN — o parecer e a conclusão da JARI já estão anexados: chegam em
// `prefilled{}` e só aparecem SOMENTE LEITURA pelo `PrefilledSummary` (mapa fechado, vazio até
// OD-P82 — nunca nome cru de chave), nunca como campo editável nem exigido. O cidadão só acrescenta
// argumentos adicionais (opcional) e provas.
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

export interface RecursoCetranValues {
  readonly additionalText?: string;
  readonly attachmentIds: readonly string[];
}

const EMPTY_VALUES: RecursoCetranValues = { attachmentIds: [] };

function asValues(value: Record<string, unknown> | null): RecursoCetranValues {
  return { ...EMPTY_VALUES, ...(value ?? {}) } as RecursoCetranValues;
}

@Component({
  selector: 'portal-recurso-cetran-form',
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
      <p data-hint>{{ 'portal.forms.recurso_cetran.hint' | stynxTranslate }}</p>
      <label>
        <span>{{
          'portal.screens.t04.field.additionalText' | stynxTranslate
        }}</span>
        <textarea
          name="additionalText"
          rows="6"
          [value]="current().additionalText ?? ''"
          [disabled]="disabled()"
          (input)="patchAdditionalText($event)"
        ></textarea>
      </label>
      @if (requestId(); as requestId) {
        <portal-attachment-uploader
          [requestId]="requestId"
          [accept]="accept"
          [maxBytes]="maxBytes"
          [checklist]="requirements()"
          hintKey="portal.forms.recurso_cetran.hint"
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
        {{ 'portal.screens.t04.cmd.draft' | stynxTranslate }}
      </button>
    </form>
  `,
})
export class RecursoCetranFormComponent {
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

  /** Opcional: texto vazio não entra no corpo (`additionalText?`). */
  patchAdditionalText(event: Event): void {
    const text = (event.target as HTMLTextAreaElement).value;
    const { additionalText: _previous, ...rest } = this.current();
    this.values.set(text.length > 0 ? { ...rest, additionalText: text } : rest);
  }

  setAttachments(attachmentIds: readonly string[]): void {
    this.values.set({ ...this.current(), attachmentIds: [...attachmentIds] });
  }
}
