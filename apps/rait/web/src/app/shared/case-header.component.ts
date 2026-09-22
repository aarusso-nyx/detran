// CaseHeader (contrato CTG-0002b §5.5; spec §5.2 "cabeçalho fixo de /casos/:id"; guia §3.2; ficha
// 006): protocolo (texto), `<rait-case-state-badge>`, partes requerente|procurador por
// `person_name` (`document_number` NÃO aparece — LGPD §10.6, OD-R12-033), um `<rait-risk-flag>` por
// relógio (sem agregação), `suspensive_effect` → `rait.common.suspensiveEffect`, ações por item
// sob `*stynxHasPermission` (chave de `RAIT_COMMAND_RULES`, M4) emitidas como `output<RaitCommand>`;
// nunca texto livre do requerimento ([RN-RAIT-134]). `<header aria-labelledby>` no protocolo.
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { StynxTranslatePipe } from '@detran/ui';
import { StynxHasPermissionDirective } from '@stynx-nyx/angular-auth';
import {
  permissionKeyOf,
  type RaitCase,
  type RaitClock,
  type RaitCommand,
  type RaitParty,
} from '../data/models';
import { CaseStateBadgeComponent } from './case-state-badge.component';
import { RiskFlagComponent } from './risk-flag.component';

export interface CaseHeaderAction {
  readonly command: RaitCommand;
  readonly labelKey: string;
  readonly route?: string;
}

const SUSPENSIVE_EFFECT_KEY = 'rait.common.suspensiveEffect';
const PARTY_KEY_PREFIX = 'rait.common.party_';
const HEADER_PARTY_ROLES: ReadonlySet<RaitParty['role']> = new Set([
  'requerente',
  'procurador',
]);
let nextId = 0;

@Component({
  selector: 'rait-case-header',
  imports: [
    StynxTranslatePipe,
    RouterLink,
    CaseStateBadgeComponent,
    RiskFlagComponent,
    StynxHasPermissionDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'rait-case-header',
    '[attr.data-case-id]': 'case().id',
    '[attr.data-token]': 'case().state',
  },
  template: `
    <header [attr.aria-labelledby]="protocolId">
      <p class="rait-case-header__protocol" [id]="protocolId">
        {{ case().protocol_number }}
      </p>
      <rait-case-state-badge
        [state]="case().state"
        [instance]="case().instance"
      />
      @if (case().suspensive_effect) {
        <span class="rait-case-header__suspensive">{{
          suspensiveEffectKey | stynxTranslate
        }}</span>
      }
      @if (headerParties().length > 0) {
        <ul class="rait-case-header__parties">
          @for (party of headerParties(); track $index) {
            <li [attr.data-token]="party.role">
              <span class="rait-case-header__party-role">{{
                partyKeyPrefix + party.role | stynxTranslate
              }}</span>
              <span class="rait-case-header__party-name">{{
                party.person_name
              }}</span>
            </li>
          }
        </ul>
      }
      @if (clocks().length > 0) {
        <ul class="rait-case-header__clocks">
          @for (clock of clocks(); track clock.id) {
            <li>
              <rait-risk-flag
                [flag]="clock.flag"
                [clockCode]="clock.clock_code"
                [ceilingOn]="clock.ceiling_on"
              />
            </li>
          }
        </ul>
      }
      @if (actions().length > 0) {
        <ul class="rait-case-header__actions">
          @for (item of actions(); track item.command) {
            <li *stynxHasPermission="permissionKeyOf(item.command)">
              @if (item.route; as route) {
                <a [routerLink]="route" [attr.data-command]="item.command">{{
                  item.labelKey | stynxTranslate
                }}</a>
              } @else {
                <button
                  type="button"
                  [attr.data-command]="item.command"
                  (click)="action.emit(item.command)"
                >
                  {{ item.labelKey | stynxTranslate }}
                </button>
              }
            </li>
          }
        </ul>
      }
    </header>
  `,
})
export class CaseHeaderComponent {
  readonly case = input.required<RaitCase>();
  readonly parties = input<readonly RaitParty[]>([]);
  readonly clocks = input<readonly RaitClock[]>([]);
  readonly actions = input<readonly CaseHeaderAction[]>([]);
  readonly action = output<RaitCommand>();

  readonly protocolId = `rait-case-header-protocol-${(nextId += 1)}`;
  readonly suspensiveEffectKey = SUSPENSIVE_EFFECT_KEY;
  readonly partyKeyPrefix = PARTY_KEY_PREFIX;
  readonly permissionKeyOf = permissionKeyOf;

  /** Só requerente e procurador; nunca `document_number`/`contact_email` (OD-R12-033). */
  readonly headerParties = computed(() =>
    this.parties().filter((party) => HEADER_PARTY_ROLES.has(party.role)),
  );
}
