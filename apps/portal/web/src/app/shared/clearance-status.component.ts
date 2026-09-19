// ClearanceStatus (contrato CTG-0003c §5.4; [RN-PORTAL-116]; [UC-PORTAL-012]; OD-P04/DT-027): a
// quitação do veículo ANTES da tentativa de emitir o CRLV-e — três seções distintas: débitos
// (`items[]`), restrições (`restrictions[]`) e multas sob recurso (`suspendedEnforceability[]`,
// que NUNCA bloqueiam nem aparecem entre os débitos). "Há débito a pagar" ≠ "há restrição":
// mensagens diferentes (`crlv_blocked_by_debt` com link de pagamento × `crlv_blocked_by_restriction`
// sem ele). O botão "emitir" só está habilitado com `canIssue` DO SERVIDOR e sem bloqueio; o
// cliente NÃO soma valores, não julga `blocking` nem calcula nada — cada `amount` é formatado
// tal como chegou (`Intl.NumberFormat` BRL via pipe do kit).
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  StynxIntlCurrencyPipe,
  StynxIntlDatePipe,
  StynxTranslatePipe,
} from '@detran/ui';
import type { ErrorPresentation } from '../core/error-boundary';
import type { VehicleClearance } from '../data/portal-read.models';

const AUTOS_ROUTE = '/autos';
const AIT_ROUTE_PREFIX = '/autos/';
const KIND_KEY_PREFIX = `portal.documents.clearance.kind.`;
const DEBT_CODE = 'PORTAL.CRLV_BLOCKED_BY_DEBT';
const RESTRICTION_CODE = 'PORTAL.CRLV_BLOCKED_BY_RESTRICTION';

export type IssueDisabledReason = 'debt' | 'restriction' | 'server';

@Component({
  selector: 'portal-clearance-status',
  imports: [
    RouterLink,
    StynxTranslatePipe,
    StynxIntlCurrencyPipe,
    StynxIntlDatePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-can-issue]': 'canIssue() ? "true" : "false"',
    '[attr.data-blocked]': 'blockedReason() ?? null',
  },
  template: `
    @if (clearance(); as clearance) {
      <section class="portal-clearance" data-clearance>
        @if (cachedAt(); as cachedAt) {
          <p data-consulted-at>
            {{
              'portal.documents.consulta.consultedAt'
                | stynxTranslate
                  : { consultedAt: (cachedAt | stynxIntlDate: dateTimeFormat) }
            }}
          </p>
        }

        @if (blockedReason() === 'debt') {
          <p role="status" data-blocked-by-debt>
            {{ 'portal.errors.crlv_blocked_by_debt' | stynxTranslate }}
            <a [routerLink]="payRoute" [attr.routerLink]="payRoute" data-pay>{{
              'portal.services.pagamento' | stynxTranslate
            }}</a>
          </p>
        } @else if (blockedReason() === 'restriction') {
          <p role="status" data-blocked-by-restriction>
            {{ 'portal.errors.crlv_blocked_by_restriction' | stynxTranslate }}
          </p>
        }

        <section data-debts>
          <h3>{{ 'portal.documents.clearance.debts' | stynxTranslate }}</h3>
          @if (clearance.items.length > 0) {
            <ul>
              @for (item of clearance.items; track $index) {
                <li
                  data-debt-item
                  [attr.data-token]="item.kind"
                  [attr.data-status]="item.status"
                  [attr.data-reason]="item.reason ?? null"
                  [attr.data-blocking]="item.blocking ? 'true' : 'false'"
                >
                  <span>{{ kindKey(item.kind) | stynxTranslate }}</span>
                  @if (item.amount !== null) {
                    <span data-amount>{{
                      item.amount | stynxIntlCurrency: currency
                    }}</span>
                  }
                  <span data-blocking-label>
                    <span aria-hidden="true">{{
                      item.blocking ? '⚠' : '✓'
                    }}</span>
                    {{ blockingKey(item.blocking) | stynxTranslate }}
                  </span>
                </li>
              }
            </ul>
          } @else {
            <p data-no-debts>
              {{ 'portal.documents.clearance.not_blocking' | stynxTranslate }}
            </p>
          }
        </section>

        <section data-restrictions>
          <h3>
            {{ 'portal.documents.clearance.restrictions' | stynxTranslate }}
          </h3>
          @if (clearance.restrictions.length > 0) {
            <ul>
              @for (restriction of clearance.restrictions; track $index) {
                <li
                  data-restriction
                  [attr.data-token]="restriction.kind"
                  [attr.data-blocking]="restriction.blocking ? 'true' : 'false'"
                >
                  <span aria-hidden="true">{{
                    restriction.blocking ? '⚠' : '✓'
                  }}</span>
                  {{ blockingKey(restriction.blocking) | stynxTranslate }}
                </li>
              }
            </ul>
          } @else {
            <p data-no-restrictions>
              {{ 'portal.documents.clearance.not_blocking' | stynxTranslate }}
            </p>
          }
        </section>

        <section data-suspended-section>
          <h3>{{ 'portal.documents.clearance.suspended' | stynxTranslate }}</h3>
          @if (clearance.suspendedEnforceability.length > 0) {
            <p role="status" data-suspended-notice>
              {{
                'portal.errors.crlv_suspended_enforceability_not_blocking'
                  | stynxTranslate
              }}
            </p>
            <ul>
              @for (
                suspended of clearance.suspendedEnforceability;
                track suspended.aitId
              ) {
                <li data-suspended [attr.data-ait-id]="suspended.aitId">
                  <a
                    [routerLink]="aitRoute(suspended.aitId)"
                    [attr.routerLink]="aitRoute(suspended.aitId)"
                    >{{
                      'portal.screens.t17.state.suspenso' | stynxTranslate
                    }}</a
                  >
                </li>
              }
            </ul>
          } @else {
            <p data-no-suspended>
              {{ 'portal.documents.clearance.not_blocking' | stynxTranslate }}
            </p>
          }
        </section>

        <p data-can-issue-label>{{ canIssueLabelKey() | stynxTranslate }}</p>
      </section>
    }
    <!-- O botão existe desde o início (aria-disabled, motivo 'server') e só fica habilitado com a
         quitação lida e canIssue do servidor: a quitação sempre precede a tentativa (§5.4 a). -->
    <button
      type="button"
      class="portal-clearance-issue"
      data-issue
      [attr.aria-disabled]="issueEnabled() ? null : 'true'"
      [attr.data-reason]="issueEnabled() ? null : (blockedReason() ?? 'server')"
      (click)="onIssue()"
    >
      {{ issueLabelKey() | stynxTranslate }}
    </button>
  `,
})
export class ClearanceStatusComponent {
  readonly clearance = input.required<VehicleClearance | null>();
  /** `CRLV_BLOCKED_BY_DEBT` | `CRLV_BLOCKED_BY_RESTRICTION` (context.items[] / restrictions[]). */
  readonly blocked = input<ErrorPresentation | null>(null);
  readonly cachedAt = input<string | null>(null);
  /** `clearance.canIssue` do servidor. */
  readonly canIssue = input<boolean>(false);
  readonly issueLabelKey = input<string>('portal.screens.t17.cmd.emitir');
  readonly busy = input(false);
  readonly issue = output<void>();
  /** `context.paymentRoute` (só informativo: a rota do app é `/autos`, `source_pending` por multa). */
  readonly payRequested = output<string | null>();

  readonly payRoute = AUTOS_ROUTE;
  readonly currency = 'BRL';
  readonly dateTimeFormat: Intl.DateTimeFormatOptions = {
    dateStyle: 'short',
    timeStyle: 'short',
  };

  readonly blockedReason = computed<IssueDisabledReason | null>(() => {
    const code = this.blocked()?.code ?? null;
    if (code === DEBT_CODE) return 'debt';
    if (code === RESTRICTION_CODE) return 'restriction';
    return null;
  });
  readonly issueEnabled = computed(
    () =>
      this.clearance() !== null &&
      this.canIssue() &&
      this.blockedReason() === null &&
      !this.busy(),
  );

  /** `canIssue` do servidor decide o rótulo (nunca calculado dos itens). */
  readonly canIssueLabelKey = computed(() =>
    this.canIssue()
      ? 'portal.documents.clearance.can_issue'
      : 'portal.documents.clearance.blocking',
  );

  kindKey(kind: string): string {
    return `${KIND_KEY_PREFIX}${kind}`;
  }

  blockingKey(blocking: boolean): string {
    return blocking
      ? 'portal.documents.clearance.blocking'
      : 'portal.documents.clearance.not_blocking';
  }

  aitRoute(aitId: string): string {
    return `${AIT_ROUTE_PREFIX}${aitId}`;
  }

  /** `aria-disabled` orienta; o servidor decide (M15) — o clique sempre emite (a página filtra o duplo envio). */
  onIssue(): void {
    this.issue.emit();
  }
}
