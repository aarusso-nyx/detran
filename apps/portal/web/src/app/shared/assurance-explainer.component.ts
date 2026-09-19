// AssuranceExplainer (contrato CTG-0003a §5.11; [UC-PORTAL-019] fluxo 3; spec §2 invariante 8):
// explica qual nível falta (`required` × `current`) e oferece os três caminhos de verificação
// como rádios sob a legenda `portal.forms.elevacao.caminho`. Nunca "acesso negado". Os níveis
// exigido/atual são tokens do servidor: ficam em `data-required`/`data-current` e são traduzidos
// por `portal.situation.assurance.<nível>`.
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { StynxTranslatePipe } from '@detran/ui';
import type { AssuranceLevel, ElevationMethod } from '../core/session.facade';

export const ELEVATION_METHODS: readonly ElevationMethod[] = [
  'biographic',
  'biometric',
  'icp',
];

@Component({
  selector: 'portal-assurance-explainer',
  imports: [StynxTranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-required]': 'required()',
    '[attr.data-current]': 'current()',
    '[attr.data-act-key]': 'actKey()',
  },
  template: `
    <section
      class="portal-assurance-explainer"
      role="region"
      [attr.aria-labelledby]="titleId()"
    >
      <h3 [id]="titleId()" tabindex="-1">
        {{ 'portal.states.permission_missing' | stynxTranslate }}
      </h3>
      <p>{{ 'portal.screens.t27.intro' | stynxTranslate }}</p>
      <p>
        <span>{{
          'portal.screens.t27.field.nivel_faltante' | stynxTranslate
        }}</span>
        <strong data-required-level>{{
          requiredLabelKey() | stynxTranslate
        }}</strong>
        @if (currentLabelKey(); as key) {
          <span data-current-level>{{ key | stynxTranslate }}</span>
        }
      </p>
      @if (methods().length > 0) {
        <fieldset>
          <legend>
            {{ 'portal.forms.elevacao.caminho' | stynxTranslate }}
          </legend>
          @for (method of methods(); track method) {
            <label>
              <input
                type="radio"
                [name]="groupName()"
                [value]="method"
                (change)="methodSelected.emit(method)"
              />
              {{ methodLabelKey(method) | stynxTranslate }}
            </label>
          }
        </fieldset>
      } @else {
        <p role="status">
          {{ 'portal.screens.t27.state.sem_elegibilidade' | stynxTranslate }}
        </p>
      }
    </section>
  `,
})
export class AssuranceExplainerComponent {
  readonly required = input.required<AssuranceLevel>();
  readonly current = input.required<AssuranceLevel | null>();
  readonly actKey = input.required<string>();
  /** `context.elevationMethods[]` quando o erro os traz. */
  readonly methods = input<readonly ElevationMethod[]>(ELEVATION_METHODS);
  readonly methodSelected = output<ElevationMethod>();

  readonly titleId = computed(
    () => `portal-assurance-explainer-${this.actKey()}-title`,
  );
  readonly groupName = computed(() => `elevation-method-${this.actKey()}`);
  readonly requiredLabelKey = computed(
    () => `portal.situation.assurance.${this.required()}`,
  );
  readonly currentLabelKey = computed(() => {
    const current = this.current();
    return current ? `portal.situation.assurance.${current}` : null;
  });

  methodLabelKey(method: ElevationMethod): string {
    return `portal.forms.elevacao.caminho.${method}`;
  }
}
