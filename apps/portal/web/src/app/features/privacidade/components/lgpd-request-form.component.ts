// LgpdRequestForm (contrato CTG-0003c §6 T-24; [RN-PORTAL-120/121]): o passo 2 projetado no
// `ServiceWizard` — o escopo do pedido (rádios de `MeusDadosSchema.scope`) e os campos a corrigir
// (`fields[]`, preenchidos pela página a partir do botão "corrigir" ao lado do dado). Os valores
// sobem pelo `model` `values`; erros de campo (`fields[]`) marcam os controles pela diretiva.
// Nenhum prazo é exibido aqui: o que o servidor devolver é o único prazo (RN-120).
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
} from '@angular/core';
import { StynxTranslatePipe } from '@detran/ui';
import { PortalFieldErrorsDirective } from '../../../core/field-errors.directive';
import type { MeusDadosBody } from '../../../forms/meus-dados.schema';

export type LgpdScope = MeusDadosBody['scope'];

/** `MeusDadosSchema.scope`, na ordem do schema. */
export const LGPD_SCOPES: readonly LgpdScope[] = [
  'confirmacao',
  'declaracao_completa',
  'correcao',
  'eliminacao',
];

/** Rótulos por escopo: chaves existentes da ficha T-24 (`cmd.*`) e do formulário. */
const SCOPE_LABEL_KEY: Readonly<Record<LgpdScope, string>> = {
  confirmacao: 'portal.screens.t24.cmd.confirmar',
  declaracao_completa: 'portal.screens.t24.cmd.declaracao_completa',
  correcao: 'portal.screens.t24.cmd.corrigir',
  eliminacao: 'portal.common.action.remove',
};

interface LgpdValues {
  readonly scope: LgpdScope | null;
  readonly fields: readonly string[];
}

@Component({
  selector: 'portal-lgpd-request-form',
  imports: [StynxTranslatePipe, PortalFieldErrorsDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.data-scope]': 'current().scope' },
  template: `
    <form
      class="portal-lgpd-form"
      [portalFieldErrors]="fields()"
      (submit)="$event.preventDefault()"
    >
      <fieldset>
        <legend>{{ 'portal.forms.meus_dados.escopo' | stynxTranslate }}</legend>
        @for (scope of scopes; track scope) {
          <label>
            <input
              type="radio"
              name="scope"
              [value]="scope"
              [checked]="current().scope === scope"
              [disabled]="disabled()"
              (change)="setScope(scope)"
            />
            <span>{{ scopeLabelKey(scope) | stynxTranslate }}</span>
          </label>
        }
      </fieldset>
      <p data-hint>
        {{
          'portal.forms.meus_dados.hint_declaracao_completa' | stynxTranslate
        }}
      </p>
      <p id="scope-error" data-field-error>
        @if (fields().includes('scope')) {
          {{ 'portal.errors.validation_failed' | stynxTranslate }}
        }
      </p>
      @if (current().fields.length > 0) {
        <ul data-correction-fields>
          @for (field of current().fields; track field) {
            <li [attr.data-field]="field">{{ field }}</li>
          }
        </ul>
      }
    </form>
  `,
})
export class LgpdRequestFormComponent {
  /** `fields[]` do erro 400/422 → diretiva. */
  readonly fields = input<readonly string[]>([]);
  readonly disabled = input(false);
  /** `ServiceWizardComponent.values` (duas vias): `{ scope, fields? }`. */
  readonly values = model<Record<string, unknown> | null>(null);

  readonly scopes = LGPD_SCOPES;
  readonly current = computed<LgpdValues>(() => {
    const values = this.values() ?? {};
    const scope = values['scope'];
    const fields = values['fields'];
    return {
      scope: (LGPD_SCOPES as readonly unknown[]).includes(scope)
        ? (scope as LgpdScope)
        : null,
      fields: Array.isArray(fields)
        ? fields.filter((item): item is string => typeof item === 'string')
        : [],
    };
  });

  scopeLabelKey(scope: LgpdScope): string {
    return SCOPE_LABEL_KEY[scope];
  }

  setScope(scope: LgpdScope): void {
    const current = this.current();
    this.values.set({
      scope,
      ...(current.fields.length > 0 ? { fields: [...current.fields] } : {}),
    });
  }
}
