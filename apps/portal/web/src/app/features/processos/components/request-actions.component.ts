// RequestActions (contrato CTG-0003b §6 T-07; T07 §6 "tudo navega"): as ações do processo, todas
// navegação — responder diligência (T-11), desistir (T-08), recorrer (próxima instância, T-03/T-04)
// e ver decisão (T-10). `canWithdraw false` NUNCA some sem explicação: botão `aria-disabled` com
// `data-reason=<withdrawalBlockedReason>` e o rótulo `portal.common.label.reason` (o token nunca
// vira texto). `canAppeal false` → sem botão (o servidor não dá motivo nesta leitura). Nenhuma
// requisição de escrita aqui. Links carregam o atributo `routerLink` (espelho da rota).
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { StynxTranslatePipe } from '@detran/ui';
import type {
  Diligence,
  RequestActions,
} from '../../../data/portal-read.models';

const PROCESS_ROUTE_PREFIX = '/processos/';

@Component({
  selector: 'portal-request-actions',
  imports: [RouterLink, StynxTranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.data-request-id]': 'requestId()' },
  template: `
    <nav class="portal-request-actions">
      <ul>
        @if (respondRoute(); as route) {
          <li>
            <a
              [routerLink]="route"
              [attr.routerLink]="route"
              data-action="respond"
              >{{ 'portal.screens.t07.cmd.respond' | stynxTranslate }}</a
            >
          </li>
        }
        <li>
          @if (actions().canWithdraw) {
            <a
              [routerLink]="withdrawRoute()"
              [attr.routerLink]="withdrawRoute()"
              data-action="withdraw"
              >{{ 'portal.screens.t07.cmd.withdraw' | stynxTranslate }}</a
            >
          } @else {
            <a
              role="link"
              tabindex="0"
              aria-disabled="true"
              data-action="withdraw"
              [attr.data-reason]="actions().withdrawalBlockedReason"
              >{{ 'portal.screens.t07.cmd.withdraw' | stynxTranslate }}</a
            >
            @if (actions().withdrawalBlockedReason; as reason) {
              <span
                class="portal-request-actions-reason"
                [attr.data-reason]="reason"
                >{{ 'portal.common.label.reason' | stynxTranslate }}</span
              >
            }
          }
        </li>
        @if (actions().canAppeal && appealRoute(); as route) {
          <li>
            <a
              [routerLink]="route"
              [attr.routerLink]="route"
              data-action="appeal"
              [attr.data-service-key]="actions().nextInstanceServiceKey"
              >{{ 'portal.screens.t07.cmd.appeal' | stynxTranslate }}</a
            >
          </li>
        }
        @if (hasDecision()) {
          <li>
            <a
              [routerLink]="decisionRoute()"
              [attr.routerLink]="decisionRoute()"
              data-action="decision"
              >{{ 'portal.screens.t07.cmd.decision' | stynxTranslate }}</a
            >
          </li>
        }
      </ul>
    </nav>
  `,
})
export class RequestActionsComponent {
  readonly requestId = input.required<string>();
  readonly actions = input.required<RequestActions>();
  /** Diligências do pedido: a primeira `open` é o alvo de "responder". */
  readonly diligences = input<readonly Diligence[]>([]);
  /** `ProcessosFacade.nextStepRoute(actions.nextInstanceServiceKey)`. */
  readonly appealRoute = input<string | null>(null);
  readonly hasDecision = input(false);

  readonly respondRoute = computed<string | null>(() => {
    if (!this.actions().canRespondDiligence) return null;
    const open = this.diligences().find(
      (diligence) => diligence.status === 'open',
    );
    return open
      ? `${PROCESS_ROUTE_PREFIX}${this.requestId()}/diligencia/${open.diligenceId}`
      : null;
  });
  readonly withdrawRoute = computed(
    () => `${PROCESS_ROUTE_PREFIX}${this.requestId()}/desistencia`,
  );
  readonly decisionRoute = computed(
    () => `${PROCESS_ROUTE_PREFIX}${this.requestId()}/decisao`,
  );
}
