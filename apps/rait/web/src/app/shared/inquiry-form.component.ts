// InquiryForm (contrato CTG-0002b §5.9; [RN-RAIT-004]; UC-RAIT-003; ficha 010; spec §9
// Diligência): `<select name="addressee">` (opções `RAIT_INQUIRY_ADDRESSEES` →
// `'rait.common.addressee_' + token`), `<input name="subject">`, `<input type="date" name="dueOn">`
// opcional — vazio = prazo default do backend (15 du; ficha 010 "nunca digitado manualmente");
// botão `rait.action.open-inquiry`. Forma mínima: `addressee` e `subject` obrigatórios (erro
// inline com `aria-describedby`). Emite `InquiryDraft`; o comando é M8 (`rait-case:open-inquiry`).
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { StynxTranslatePipe } from '@detran/ui';
import {
  RAIT_INQUIRY_ADDRESSEES,
  type RaitInquiryAddressee,
} from '../data/models';

export interface InquiryDraft {
  readonly addressee: RaitInquiryAddressee;
  readonly subject: string;
  /** ISO date ou `null` = prazo default do backend. */
  readonly dueOn: string | null;
}

const ADDRESSEE_KEY = 'rait.common.addressee';
const ADDRESSEE_KEY_PREFIX = 'rait.common.addressee_';
const SUBJECT_KEY = 'rait.common.subject';
const DUE_ON_KEY = 'rait.common.dueOn';
const SUBMIT_KEY = 'rait.action.open-inquiry';
let nextId = 0;

@Component({
  selector: 'rait-inquiry-form',
  imports: [StynxTranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'rait-inquiry-form' },
  template: `
    <form (submit)="onSubmit($event)" novalidate>
      <div class="rait-inquiry-form__field">
        <label [for]="ids.addressee">{{ addresseeKey | stynxTranslate }}</label>
        <select
          [id]="ids.addressee"
          name="addressee"
          [disabled]="disabled()"
          [attr.aria-invalid]="addresseeMissing() ? 'true' : null"
          [attr.aria-describedby]="
            addresseeMissing() ? ids.addresseeError : null
          "
          (change)="onAddresseeChange($event)"
        >
          <option value="" [selected]="addressee() === null"></option>
          @for (option of addressees; track option) {
            <option [value]="option" [selected]="option === addressee()">
              {{ addresseeKeyPrefix + option | stynxTranslate }}
            </option>
          }
        </select>
        @if (addresseeMissing()) {
          <p
            [id]="ids.addresseeError"
            class="rait-inquiry-form__error"
            role="alert"
          >
            {{ addresseeKey | stynxTranslate }}
          </p>
        }
      </div>
      <div class="rait-inquiry-form__field">
        <label [for]="ids.subject">{{ subjectKey | stynxTranslate }}</label>
        <input
          [id]="ids.subject"
          type="text"
          name="subject"
          [value]="subject()"
          [disabled]="disabled()"
          [attr.aria-invalid]="subjectMissing() ? 'true' : null"
          [attr.aria-describedby]="subjectMissing() ? ids.subjectError : null"
          (input)="onSubjectInput($event)"
        />
        @if (subjectMissing()) {
          <p
            [id]="ids.subjectError"
            class="rait-inquiry-form__error"
            role="alert"
          >
            {{ subjectKey | stynxTranslate }}
          </p>
        }
      </div>
      <div class="rait-inquiry-form__field">
        <label [for]="ids.dueOn">{{ dueOnKey | stynxTranslate }}</label>
        <input
          [id]="ids.dueOn"
          type="date"
          name="dueOn"
          [value]="dueOn() ?? ''"
          [disabled]="disabled()"
          (input)="onDueOnInput($event)"
        />
      </div>
      <button type="submit" [disabled]="disabled()">
        {{ submitKey | stynxTranslate }}
      </button>
    </form>
  `,
})
export class InquiryFormComponent {
  readonly disabled = input(false);
  readonly submitted = output<InquiryDraft>();

  readonly addressees = RAIT_INQUIRY_ADDRESSEES;
  readonly addresseeKey = ADDRESSEE_KEY;
  readonly addresseeKeyPrefix = ADDRESSEE_KEY_PREFIX;
  readonly subjectKey = SUBJECT_KEY;
  readonly dueOnKey = DUE_ON_KEY;
  readonly submitKey = SUBMIT_KEY;

  private readonly instance = (nextId += 1);
  readonly ids = {
    addressee: `rait-inquiry-form-${this.instance}-addressee`,
    addresseeError: `rait-inquiry-form-${this.instance}-addressee-error`,
    subject: `rait-inquiry-form-${this.instance}-subject`,
    subjectError: `rait-inquiry-form-${this.instance}-subject-error`,
    dueOn: `rait-inquiry-form-${this.instance}-due-on`,
  };

  readonly addressee = signal<RaitInquiryAddressee | null>(null);
  readonly subject = signal('');
  readonly dueOn = signal<string | null>(null);
  private readonly attempted = signal(false);

  readonly addresseeMissing = computed(
    () => this.attempted() && this.addressee() === null,
  );
  readonly subjectMissing = computed(
    () => this.attempted() && this.subject().trim().length === 0,
  );

  onAddresseeChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.addressee.set(
      (RAIT_INQUIRY_ADDRESSEES as readonly string[]).includes(value)
        ? (value as RaitInquiryAddressee)
        : null,
    );
  }

  onSubjectInput(event: Event): void {
    this.subject.set((event.target as HTMLInputElement).value);
  }

  onDueOnInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.dueOn.set(value.length > 0 ? value : null);
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.attempted.set(true);
    const addressee = this.addressee();
    const subject = this.subject().trim();
    if (addressee === null || subject.length === 0 || this.disabled()) return;
    this.submitted.emit({ addressee, subject, dueOn: this.dueOn() });
  }
}
