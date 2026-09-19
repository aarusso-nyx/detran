// AitRowActions (contrato CTG-0003b §6 T-14; [UC-PORTAL-010] AC-2; [RN-PORTAL-127] a): as três
// ações de cada linha — defender · indicar · pagar — na mesma ordem e peso do `ActionTriplet`
// (T-01), com as rotas do manifesto (#10/#11/#12). Ação disponível → link; indisponível ou ausente
// de `actions[]` → `aria-disabled` + `data-reason=<token>` (rótulo: OD-P63); nenhuma disponível →
// `portal.screens.t01.state.empty` (nunca linha morta). O nível insuficiente NÃO é decidido aqui:
// o `assuranceGuard` da rota destino leva a T-27. Os links carregam o atributo `routerLink`
// (espelho da rota) para localização por atributo.
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { StynxTranslatePipe } from '@detran/ui';
import type { AitAction } from '../../../shared/action-triplet.component';

type RowActionKey = 'defend' | 'indicate_driver' | 'pay';

/** Chave i18n e rota do manifesto por ação (mesma tabela do `ActionTriplet`, CTG-0003a §5.3). */
const ROW_ACTIONS: readonly {
  readonly key: RowActionKey;
  readonly labelKey: string;
  readonly route: (aitId: string) => string;
}[] = [
  {
    key: 'defend',
    labelKey: 'portal.screens.t01.cmd.defend',
    route: (aitId) => `/autos/${aitId}/defesa/nova`,
  },
  {
    key: 'indicate_driver',
    labelKey: 'portal.screens.t01.cmd.indicate',
    route: (aitId) => `/autos/${aitId}/condutor/nova`,
  },
  {
    key: 'pay',
    labelKey: 'portal.screens.t01.cmd.pay',
    route: (aitId) => `/autos/${aitId}/pagamento`,
  },
];

interface RowActionView {
  readonly key: RowActionKey;
  readonly labelKey: string;
  readonly route: string;
  readonly available: boolean;
  readonly reason: string;
}

@Component({
  selector: 'portal-ait-row-actions',
  imports: [RouterLink, StynxTranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-ait-id]': 'aitId()',
    '[attr.data-available-count]': 'availableCount()',
  },
  template: `
    <ul class="portal-ait-row-actions">
      @for (item of items(); track item.key) {
        <li>
          @if (item.available) {
            <a
              [routerLink]="item.route"
              [attr.routerLink]="item.route"
              [attr.data-action]="item.key"
              >{{ item.labelKey | stynxTranslate }}</a
            >
          } @else {
            <a
              role="link"
              tabindex="0"
              aria-disabled="true"
              [attr.data-action]="item.key"
              [attr.data-reason]="item.reason"
              >{{ item.labelKey | stynxTranslate }}</a
            >
          }
        </li>
      }
    </ul>
    @if (availableCount() === 0) {
      <p data-no-actions>
        {{ 'portal.screens.t01.state.empty' | stynxTranslate }}
      </p>
    }
  `,
})
export class AitRowActionsComponent {
  readonly aitId = input.required<string>();
  readonly actions = input.required<readonly AitAction[]>();

  readonly items = computed<readonly RowActionView[]>(() => {
    const aitId = this.aitId();
    const actions = this.actions();
    return ROW_ACTIONS.map((entry) => {
      const action = actions.find((candidate) => candidate.key === entry.key);
      return {
        key: entry.key,
        labelKey: entry.labelKey,
        route: entry.route(aitId),
        available: action?.available === true,
        reason: action?.reason ?? '',
      };
    });
  });

  readonly availableCount = computed(
    () => this.items().filter((item) => item.available).length,
  );
}
