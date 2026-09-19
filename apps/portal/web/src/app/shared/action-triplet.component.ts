// ActionTriplet (contrato CTG-0003a §5.3; T-01; [RN-PORTAL-127]): SEMPRE as três ações
// (defender · indicar · pagar), nesta ordem e com o mesmo peso visual. Ação ausente de `actions[]`
// ou `available: false` → `aria-disabled="true"`, sem navegação, `data-reason=<token>` (rótulo:
// OD-P63). O nível insuficiente NÃO é decidido aqui: o clique navega e o `assuranceGuard` da rota
// leva a T-27. `appeal_*` não são deste componente (T-07, par 2).
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { StynxTranslatePipe } from '@detran/ui';

export type AitActionKey =
  'defend' | 'indicate_driver' | 'pay' | 'appeal_jari' | 'appeal_cetran';

export interface AitAction {
  readonly key: AitActionKey;
  readonly available: boolean;
  /** Token do servidor → `data-reason` (rótulo: OD-P63). */
  readonly reason?: string;
  readonly minimumAssurance: 'none' | 'simples' | 'avancada' | 'qualificada';
}

/** As três ações de T-01, na ordem: chave i18n e rota do manifesto (#10, #11, #12). */
const TRIPLET: readonly {
  readonly key: 'defend' | 'indicate_driver' | 'pay';
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

interface TripletItem {
  readonly key: 'defend' | 'indicate_driver' | 'pay';
  readonly labelKey: string;
  readonly route: string;
  readonly available: boolean;
  readonly reason: string;
}

@Component({
  selector: 'portal-action-triplet',
  imports: [RouterLink, StynxTranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.data-ait-id]': 'aitId()' },
  template: `
    <nav class="portal-action-triplet">
      <ul>
        @for (item of items(); track item.key) {
          <li>
            @if (item.available) {
              <a
                [routerLink]="item.route"
                [attr.data-action]="item.key"
                (click)="selected.emit(item.key)"
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
    </nav>
  `,
})
export class ActionTripletComponent {
  readonly aitId = input.required<string>();
  readonly actions = input.required<readonly AitAction[]>();
  readonly selected = output<AitActionKey>();

  readonly items = computed<readonly TripletItem[]>(() => {
    const aitId = this.aitId();
    const actions = this.actions();
    return TRIPLET.map((entry) => {
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
}
