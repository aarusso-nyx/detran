// ImpedimentDialog (contrato CTG-0002b §5.21; [RN-RAIT-140]; fichas 012/016/026/028/029/030/034):
// `<dialog role="dialog" aria-modal="true" aria-labelledby>` nativo (o kit não tem diálogo com
// formulário; padrão CTG-0002a §7 ShortcutHelp) com `<select kind>` (`'rait.common.impediment_' +
// kind`), `<textarea basis>` (`rait.common.basis`, obrigatório — forma), `<input legalBasis>`
// (`rait.common.legalBasis`), botões `rait.common.confirm`/`cancel`; Esc e cancelar → `dismissed`;
// foco vai ao primeiro campo ao abrir e volta ao elemento que abriu ao fechar. Emite
// `ImpedimentDraft`; o comando é M8 (`rait-impediment:declare`).
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { StynxTranslatePipe } from '@detran/ui';
import { RAIT_IMPEDIMENT_KINDS, type RaitImpedimentKind } from '../data/models';

export interface ImpedimentDraft {
  readonly kind: RaitImpedimentKind;
  readonly basis: string;
  readonly legalBasis: string | null;
}

const KIND_KEY_PREFIX = 'rait.common.impediment_';
const BASIS_KEY = 'rait.common.basis';
const LEGAL_BASIS_KEY = 'rait.common.legalBasis';
const CONFIRM_KEY = 'rait.common.confirm';
const CANCEL_KEY = 'rait.common.cancel';
const KIND_SELECTOR = 'select[name="kind"]';
let nextId = 0;

@Component({
  selector: 'rait-impediment-dialog',
  imports: [StynxTranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'rait-impediment-dialog',
    '[attr.data-open]': 'open()',
    '(document:keydown.escape)': 'onEscape()',
  },
  template: `
    @if (open()) {
      <dialog
        open
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="ids.title"
        [attr.aria-describedby]="ids.message"
      >
        <h2 [id]="ids.title">{{ titleKey() | stynxTranslate }}</h2>
        <p [id]="ids.message">{{ messageKey() | stynxTranslate }}</p>
        <form (submit)="onConfirm($event)" novalidate>
          <div class="rait-impediment-dialog__field">
            <select
              [id]="ids.kind"
              name="kind"
              [attr.aria-labelledby]="ids.title"
              (change)="onKindChange($event)"
            >
              @for (option of kinds(); track option) {
                <option [value]="option" [selected]="option === kind()">
                  {{ kindKeyPrefix + option | stynxTranslate }}
                </option>
              }
            </select>
          </div>
          <div class="rait-impediment-dialog__field">
            <label [for]="ids.basis">{{ basisKey | stynxTranslate }}</label>
            <textarea
              [id]="ids.basis"
              name="basis"
              [value]="basis()"
              [attr.aria-invalid]="basisMissing() ? 'true' : null"
              [attr.aria-describedby]="basisMissing() ? ids.basisError : null"
              (input)="onBasisInput($event)"
            ></textarea>
            @if (basisMissing()) {
              <p
                [id]="ids.basisError"
                class="rait-impediment-dialog__error"
                role="alert"
              >
                {{ basisKey | stynxTranslate }}
              </p>
            }
          </div>
          <div class="rait-impediment-dialog__field">
            <label [for]="ids.legalBasis">{{
              legalBasisKey | stynxTranslate
            }}</label>
            <input
              [id]="ids.legalBasis"
              type="text"
              name="legalBasis"
              [value]="legalBasis()"
              (input)="onLegalBasisInput($event)"
            />
          </div>
          <div class="rait-impediment-dialog__actions">
            <button type="button" data-cancel (click)="dismiss()">
              {{ cancelKey | stynxTranslate }}
            </button>
            <button type="submit" data-confirm (click)="onConfirm($event)">
              {{ confirmKey | stynxTranslate }}
            </button>
          </div>
        </form>
      </dialog>
    }
  `,
})
export class ImpedimentDialogComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly open = model(false);
  readonly kinds = input<readonly RaitImpedimentKind[]>(RAIT_IMPEDIMENT_KINDS);
  readonly titleKey = input.required<string>();
  readonly messageKey = input.required<string>();
  readonly confirmed = output<ImpedimentDraft>();
  readonly dismissed = output<void>();

  readonly kindKeyPrefix = KIND_KEY_PREFIX;
  readonly basisKey = BASIS_KEY;
  readonly legalBasisKey = LEGAL_BASIS_KEY;
  readonly confirmKey = CONFIRM_KEY;
  readonly cancelKey = CANCEL_KEY;

  private readonly instance = (nextId += 1);
  readonly ids = {
    title: `rait-impediment-dialog-${this.instance}-title`,
    message: `rait-impediment-dialog-${this.instance}-message`,
    kind: `rait-impediment-dialog-${this.instance}-kind`,
    basis: `rait-impediment-dialog-${this.instance}-basis`,
    basisError: `rait-impediment-dialog-${this.instance}-basis-error`,
    legalBasis: `rait-impediment-dialog-${this.instance}-legal-basis`,
  };

  private readonly selectedKind = signal<RaitImpedimentKind | null>(null);
  readonly basis = signal('');
  readonly legalBasis = signal('');
  private readonly attempted = signal(false);
  private opener: HTMLElement | null = null;
  private focused = false;

  readonly kind = computed(
    () => this.selectedKind() ?? this.kinds()[0] ?? null,
  );
  readonly basisMissing = computed(
    () => this.attempted() && this.basis().trim().length === 0,
  );

  constructor() {
    // Foco no primeiro campo ao abrir; o elemento que abriu é lembrado para o retorno.
    afterRenderEffect(() => {
      if (!this.open()) {
        this.focused = false;
        return;
      }
      if (this.focused) return;
      const active = document.activeElement;
      this.opener =
        active instanceof HTMLElement &&
        !this.host.nativeElement.contains(active)
          ? active
          : this.opener;
      this.host.nativeElement
        .querySelector<HTMLElement>(KIND_SELECTOR)
        ?.focus();
      this.focused = true;
    });
  }

  onKindChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedKind.set(
      (this.kinds() as readonly string[]).includes(value)
        ? (value as RaitImpedimentKind)
        : null,
    );
  }

  onBasisInput(event: Event): void {
    this.basis.set((event.target as HTMLTextAreaElement).value);
  }

  onLegalBasisInput(event: Event): void {
    this.legalBasis.set((event.target as HTMLInputElement).value);
  }

  onConfirm(event: Event): void {
    event.preventDefault();
    this.attempted.set(true);
    const kind = this.kind();
    const basis = this.basis().trim();
    if (kind === null || basis.length === 0) return;
    const legalBasis = this.legalBasis().trim();
    this.confirmed.emit({
      kind,
      basis,
      legalBasis: legalBasis.length > 0 ? legalBasis : null,
    });
    // O fechamento após confirmar é da página (model `open` bidirecional), depois do comando.
  }

  onEscape(): void {
    if (this.open()) this.dismiss();
  }

  dismiss(): void {
    this.dismissed.emit();
    this.close();
  }

  private close(): void {
    this.open.set(false);
    this.attempted.set(false);
    const opener = this.opener;
    this.opener = null;
    opener?.focus();
  }
}
