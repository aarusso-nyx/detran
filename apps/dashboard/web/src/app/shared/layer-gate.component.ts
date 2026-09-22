// LayerGate (CTG-0002.md §8 item 13): diálogo de finalidade para o conteúdo N2. Não é guarda de
// rota (§Decisões 4) e não envia o cabeçalho `X-Purpose` — isso é da facade em L2. Sem
// finalidade declarada, o identificador do objeto não aparece (C-01-09).
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  output,
  viewChild,
  type ElementRef,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { StynxTranslatePipe } from '@detran/ui';
import {
  PURPOSE_TOKENS,
  type PurposeDeclaration,
  type PurposeToken,
} from './models';

const PURPOSE_KEY = 'dashboard.forms.finalidade_n2.purpose';
const REFERENCE_KEY = 'dashboard.forms.finalidade_n2.reference';
const SUBMIT_KEY = 'dashboard.forms.finalidade_n2.submit';
const GATE_KEY = 'dashboard.forms.finalidade_n2.gate';
const CANCEL_KEY = 'dashboard.common.action.cancel';
const TITLE_ID = 'dash-layer-gate-title';

@Component({
  selector: 'dash-layer-gate',
  imports: [ReactiveFormsModule, StynxTranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open()) {
      <dialog
        open
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="TITLE_ID"
        (keydown.escape)="cancelled.emit()"
      >
        <h2 [attr.id]="TITLE_ID">{{ PURPOSE_KEY | stynxTranslate }}</h2>
        <form [formGroup]="form" (ngSubmit)="declare()">
          <p>
            <label for="dash-layer-gate-purpose">{{
              PURPOSE_KEY | stynxTranslate
            }}</label>
            <select
              #purposeSelect
              id="dash-layer-gate-purpose"
              name="purpose"
              formControlName="purpose"
            >
              @for (token of PURPOSE_TOKENS; track token) {
                <option [value]="token">
                  {{ purposeKey(token) | stynxTranslate }}
                </option>
              }
            </select>
          </p>
          <p>
            <label for="dash-layer-gate-reference">{{
              REFERENCE_KEY | stynxTranslate
            }}</label>
            <input
              id="dash-layer-gate-reference"
              name="reference"
              type="text"
              formControlName="reference"
            />
          </p>
          <p>{{ GATE_KEY | stynxTranslate }}</p>
          <button type="submit">{{ SUBMIT_KEY | stynxTranslate }}</button>
          <button type="button" (click)="cancelled.emit()">
            {{ CANCEL_KEY | stynxTranslate }}
          </button>
        </form>
      </dialog>
    }
  `,
})
export class LayerGateComponent {
  readonly open = input.required<boolean>();
  readonly reference = input<string | null>(null);

  readonly declared = output<PurposeDeclaration>();
  readonly cancelled = output<void>();

  protected readonly PURPOSE_KEY = PURPOSE_KEY;
  protected readonly REFERENCE_KEY = REFERENCE_KEY;
  protected readonly SUBMIT_KEY = SUBMIT_KEY;
  protected readonly GATE_KEY = GATE_KEY;
  protected readonly CANCEL_KEY = CANCEL_KEY;
  protected readonly TITLE_ID = TITLE_ID;
  protected readonly PURPOSE_TOKENS = PURPOSE_TOKENS;

  protected readonly form = new FormGroup({
    purpose: new FormControl<PurposeToken>(PURPOSE_TOKENS[0], {
      nonNullable: true,
    }),
    reference: new FormControl('', { nonNullable: true }),
  });

  private readonly purposeSelect =
    viewChild<ElementRef<HTMLSelectElement>>('purposeSelect');

  constructor() {
    effect(() => {
      const reference = this.reference();
      if (reference !== null) this.form.controls.reference.setValue(reference);
    });
    effect(() => {
      if (this.open()) this.purposeSelect()?.nativeElement.focus();
    });
  }

  protected purposeKey(token: PurposeToken): string {
    return `dashboard.forms.finalidade_n2.purpose_${token}`;
  }

  protected declare(): void {
    const { purpose, reference } = this.form.getRawValue();
    if (!reference || !PURPOSE_TOKENS.includes(purpose)) return;
    this.declared.emit({ purpose, reference });
  }
}
