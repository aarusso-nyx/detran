// CitizenStatusBadge (contrato CTG-0003a §5.1; [RN-PORTAL-112]; M9): tradução única do estado do
// pedido — o token cru fica só em `data-token`; o texto é `portal.situation.badge.<situation>`.
// `badgeOf` é a ÚNICA relação estado → badge e lê a subárvore `portal.situation.badge_of.<STATE>`
// do catálogo importado; estado sem linha → `null` (OD-P56; [DIVERGE-18]) e o chamador mostra
// `portal.situation.request.<STATE>` sem badge.
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { StynxTranslatePipe } from '@detran/ui';
import portalCatalog from '../i18n/portal.pt-BR.json';

export type BadgeSituation =
  | 'em_analise'
  | 'aguardando_decisao'
  | 'em_diligencia'
  | 'decidido'
  | 'encerrado';

export const BADGE_SITUATIONS: readonly BadgeSituation[] = [
  'em_analise',
  'aguardando_decisao',
  'em_diligencia',
  'decidido',
  'encerrado',
];

const catalog = portalCatalog as Record<string, string>;

function isBadgeSituation(value: unknown): value is BadgeSituation {
  return (BADGE_SITUATIONS as readonly unknown[]).includes(value);
}

/** Lê `portal.situation.badge_of.<STATE>` do catálogo (M9); ausente → `null` (OD-P56). */
export function badgeOf(state: string): BadgeSituation | null {
  const situation = catalog[`portal.situation.badge_of.${state}`];
  return isBadgeSituation(situation) ? situation : null;
}

@Component({
  selector: 'portal-citizen-status-badge',
  imports: [StynxTranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-token]': 'token()',
    '[attr.data-situation]': 'situation()',
  },
  template: `<span class="portal-badge">{{
    labelKey() | stynxTranslate
  }}</span>`,
})
export class CitizenStatusBadgeComponent {
  readonly situation = input.required<BadgeSituation>();
  /** Estado interno cru (REQUEST_TRANSITIONS/RAIT), nunca visível. */
  readonly token = input.required<string>();

  readonly labelKey = computed(
    () => `portal.situation.badge.${this.situation()}`,
  );
}
