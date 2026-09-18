// PrefilledField (contrato CTG-0003a §5.5; [RN-PORTAL-106]; [RN-PORTAL-107] regra 2): valor que
// o órgão já tem, somente leitura em `<output aria-readonly="true">` associado ao rótulo — nunca um
// `<input>` editável (uso único). O botão "corrigir" só existe quando `correctable` e o chamador
// fornece a chave do rótulo. Valor `null` → `portal.states.empty`.
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { StynxTranslatePipe } from '@detran/ui';

@Component({
  selector: 'portal-prefilled-field',
  imports: [StynxTranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="portal-prefilled-field">
      <span class="portal-prefilled-label" [id]="labelId()">{{
        labelKey() | stynxTranslate
      }}</span>
      <output
        role="textbox"
        aria-readonly="true"
        [attr.name]="name()"
        [attr.aria-labelledby]="labelId()"
        [attr.data-name]="name()"
      >
        @if (value(); as text) {
          {{ text }}
        } @else {
          {{ 'portal.states.empty' | stynxTranslate }}
        }
      </output>
      @if (correctable() && correctLabelKey(); as key) {
        <button type="button" data-correct (click)="correct.emit()">
          {{ key | stynxTranslate }}
        </button>
      }
    </div>
  `,
})
export class PrefilledFieldComponent {
  /** Chave em `prefilled{}`. */
  readonly name = input.required<string>();
  readonly labelKey = input.required<string>();
  /** Valor do órgão. */
  readonly value = input.required<string | null>();
  /** "corrigir" quando permitido ([RN-PORTAL-106]). */
  readonly correctable = input(false);
  /** Ex.: `portal.screens.t24.cmd.corrigir`. */
  readonly correctLabelKey = input<string | null>(null);
  readonly correct = output<void>();

  readonly labelId = computed(() => `portal-prefilled-${this.name()}-label`);
}
