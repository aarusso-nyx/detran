// FreshnessSeal (CTG-0002.md §8 item 1; §2 invariante 1: "todo número tem selo"). Número sem
// `meta.freshness` NÃO é renderizado; em bloco A (legal-ceiling) o valor é ocultado quando a
// leitura é indisponível ou desatualizada ([WF-DASH-003] §Duas estratégias) e nos blocos B–D é
// apenas marcado. O componente não decide o estado: nunca compara `asOf` com o relógio.
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { StynxIntlDatePipe, StynxTranslatePipe } from '@detran/ui';
import type { DashboardBlock } from '../app.route-manifest';
import type { FreshnessMeta } from '../core/freshness.store';

const UNAVAILABLE_KEY = 'dashboard.states.unavailable';
const STALE_KEY = 'dashboard.states.stale';
const AS_OF_KEY = 'dashboard.common.as_of';
const INDISPONIVEL_KEY = 'dashboard.freshness.indisponivel';
const ATRASADO_KEY = 'dashboard.freshness.atrasado';
const FRESCO_KEY = 'dashboard.freshness.fresco';

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  dateStyle: 'medium',
  timeStyle: 'short',
};

@Component({
  selector: 'dash-freshness-seal',
  imports: [StynxTranslatePipe, StynxIntlDatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-freshness]': 'freshness()?.state ?? "none"',
    '[attr.data-block]': 'block()',
    '[attr.data-value-hidden]': 'valueHidden() ? "true" : "false"',
  },
  template: `
    @if (!valueHidden()) {
      <span class="dash-seal-value"><ng-content /></span>
    }
    @if (stateKey(); as key) {
      <span class="dash-seal-state">{{ key | stynxTranslate }}</span>
    }
    @if (showUnavailable()) {
      <span class="dash-seal-note">{{ UNAVAILABLE_KEY | stynxTranslate }}</span>
    }
    @if (asOfKey(); as key) {
      <span class="dash-seal-as-of">{{ key | stynxTranslate }}</span>
    }
    @if (freshness()?.asOf; as asOf) {
      <time [attr.datetime]="asOf">{{
        asOf | stynxIntlDate: DATE_FORMAT
      }}</time>
    }
  `,
})
export class FreshnessSealComponent {
  readonly freshness = input.required<FreshnessMeta | null>();
  readonly block = input.required<DashboardBlock>();

  protected readonly UNAVAILABLE_KEY = UNAVAILABLE_KEY;
  protected readonly DATE_FORMAT = DATE_FORMAT;

  /** Bloco A oculta o valor quando a leitura não vale; B–D marcam (nunca ocultam). */
  protected readonly valueHidden = computed(() => {
    const meta = this.freshness();
    if (meta === null) return true;
    if (this.block() !== 'A') return false;
    return (
      meta.state === 'INDISPONIVEL' || meta.state === 'DESATUALIZADO_MARCADO'
    );
  });

  /** Rótulo do estado do selo; `null` quando não há meta (só "sem leitura"). */
  protected readonly stateKey = computed<string | null>(() => {
    const meta = this.freshness();
    if (meta === null) return null;
    switch (meta.state) {
      case 'INDISPONIVEL':
        return INDISPONIVEL_KEY;
      case 'DESATUALIZADO_MARCADO':
        return STALE_KEY;
      case 'ATRASADO':
        return ATRASADO_KEY;
      default:
        return FRESCO_KEY;
    }
  });

  protected readonly showUnavailable = computed(() => {
    const meta = this.freshness();
    return (
      meta === null || (meta.state === 'INDISPONIVEL' && this.block() === 'A')
    );
  });

  /** `{as_of}` nunca é interpolado: o instante vai no `<time>` ao lado (tokens fora do texto). */
  protected readonly asOfKey = computed<string | null>(() => {
    const meta = this.freshness();
    if (meta === null || meta.asOf === null) return null;
    return meta.state === 'ATRASADO' || meta.state === 'FRESCO'
      ? AS_OF_KEY
      : null;
  });
}
