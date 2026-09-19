// PrefilledSummary (contrato CTG-0003b §3.4 f; [RN-PORTAL-106]; [RN-PORTAL-107] regra 2): o que o
// órgão já tem sobre o ato, somente leitura — um `PrefilledField` por chave de `prefilled{}`
// presente em `PREFILLED_LABEL_KEYS`. O mapa é FECHADO e fica vazio até OD-P82 fixar os nomes das
// chaves de `prefilled` por `serviceKey` e suas chaves i18n: chave fora do mapa não é renderizada
// (nunca um nome cru de campo no DOM), e nada aqui vira `<input>` editável.
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { PrefilledFieldComponent } from './prefilled-field.component';

/**
 * chave de `prefilled{}` → chave i18n do rótulo. Vazio até OD-P82 (nenhuma fonte fixa os nomes
 * das chaves por `serviceKey`); acrescentar entradas SÓ com fonte por chave.
 */
export const PREFILLED_LABEL_KEYS: Readonly<Record<string, string>> = {};

export interface PrefilledSummaryField {
  readonly name: string;
  readonly labelKey: string;
  readonly value: string | null;
}

function displayValue(value: unknown): string | null {
  if (typeof value === 'string') return value.length > 0 ? value : null;
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return null;
}

@Component({
  selector: 'portal-prefilled-summary',
  imports: [PrefilledFieldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.data-field-count]': 'fields().length' },
  template: `
    @if (fields().length > 0) {
      <div class="portal-prefilled-summary" data-prefilled-summary>
        @for (field of fields(); track field.name) {
          <portal-prefilled-field
            [name]="field.name"
            [labelKey]="field.labelKey"
            [value]="field.value"
          />
        }
      </div>
    }
  `,
})
export class PrefilledSummaryComponent {
  /** `prefilled{}` do `createRequest` (`ServiceWizardStore.prefilled`). */
  readonly prefilled = input.required<Readonly<Record<string, unknown>>>();
  /** Mapa fechado nome → chave i18n; padrão `PREFILLED_LABEL_KEYS`. */
  readonly labelKeys =
    input<Readonly<Record<string, string>>>(PREFILLED_LABEL_KEYS);

  readonly fields = computed<readonly PrefilledSummaryField[]>(() => {
    const prefilled = this.prefilled();
    const labels = this.labelKeys();
    return Object.keys(labels)
      .filter((name) => name in prefilled)
      .map((name) => ({
        name,
        labelKey: labels[name],
        value: displayValue(prefilled[name]),
      }));
  });
}
