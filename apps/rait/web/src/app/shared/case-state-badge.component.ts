// CaseStateBadge (contrato CTG-0002b §5.1; glossário §2.1; spec §5.2): rótulo do estado do caso
// por `tokenKey('caseState', state)` (A1) e da instância por `'rait.instance.' + instance`; o
// token cru fica só em `title`/`data-token`/`data-instance`, nunca como texto.
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { StynxTranslatePipe } from '@detran/ui';
import { tokenKey } from '../core/i18n-token-key';
import type { RaitCaseState, RaitInstance } from '../data/models';

const INSTANCE_KEY_PREFIX = 'rait.instance.';

@Component({
  selector: 'rait-case-state-badge',
  imports: [StynxTranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'rait-case-state-badge',
    '[attr.title]': 'state()',
    '[attr.data-token]': 'state()',
    '[attr.data-instance]': 'instance()',
  },
  template: `
    <span class="rait-case-state-badge__state">{{
      stateKey() | stynxTranslate
    }}</span>
    @if (instanceKey(); as key) {
      <span class="rait-case-state-badge__instance">{{
        key | stynxTranslate
      }}</span>
    }
  `,
})
export class CaseStateBadgeComponent {
  readonly state = input.required<RaitCaseState>();
  readonly instance = input<RaitInstance | null>(null);

  readonly stateKey = computed(() => tokenKey('caseState', this.state()));
  readonly instanceKey = computed(() => {
    const instance = this.instance();
    return instance === null ? null : `${INSTANCE_KEY_PREFIX}${instance}`;
  });
}
