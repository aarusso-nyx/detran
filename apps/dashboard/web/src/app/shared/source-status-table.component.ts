// SourceStatusTable (CTG-0002.md §8 item 15): estado das fontes por selo de frescor. É lista, e
// não a tabela do kit, porque os cabeçalhos "fonte", "última leitura" e "heartbeat" não têm
// chave na semente (OD-D16-012) — vira `StynxTableComponent` quando as chaves existirem.
// Não calcula latência, heartbeat nem estado: tudo chega pronto.
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { StynxIntlDatePipe, StynxTranslatePipe } from '@detran/ui';
import { tokenKey } from '../core/i18n-token-key';
import { FreshnessSealComponent } from './freshness-seal.component';
import type { SourceStatusView } from './models';

const LIVE_REGION_KEY = 'dashboard.a11y.live_region';
const LATENCY_KEY = 'dashboard.forms.configurar_indicador.acceptable_latency';
const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  dateStyle: 'medium',
  timeStyle: 'short',
};

@Component({
  selector: 'dash-source-status-table',
  imports: [FreshnessSealComponent, StynxTranslatePipe, StynxIntlDatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      role="status"
      aria-live="polite"
      [attr.aria-label]="LIVE_REGION_KEY | stynxTranslate"
    >
      @for (entry of countsByState(); track entry.state) {
        <span [attr.data-state-count]="entry.state"
          >{{ entry.labelKey | stynxTranslate }} {{ entry.count }}</span
        >
      }
    </div>
    <ul>
      @for (item of sources(); track item.source) {
        <li>
          <button type="button" (click)="select.emit(item)">
            <code data-source>{{ item.source }}</code>
            <dash-freshness-seal [freshness]="item.freshness" block="D">
              <span data-field="source">{{ item.source }}</span>
            </dash-freshness-seal>
            @if (item.acceptableLatency; as latency) {
              <span>{{ LATENCY_KEY | stynxTranslate }}</span>
              <code data-field="acceptable_latency">{{ latency }}</code>
            }
            @if (item.lastHeartbeatAt; as heartbeat) {
              <time data-field="heartbeat" [attr.datetime]="heartbeat">{{
                heartbeat | stynxIntlDate: DATE_FORMAT
              }}</time>
            }
          </button>
        </li>
      }
    </ul>
  `,
})
export class SourceStatusTableComponent {
  readonly sources = input.required<readonly SourceStatusView[]>();
  // O nome do output é fixado pelo contrato (CTG-0002.md §8) e usado pelos specs do
  // Inspector; a regra do angular-eslint desaconselha nomes de evento nativo.
  // eslint-disable-next-line @angular-eslint/no-output-native
  readonly select = output<SourceStatusView>();

  protected readonly LIVE_REGION_KEY = LIVE_REGION_KEY;
  protected readonly LATENCY_KEY = LATENCY_KEY;
  protected readonly DATE_FORMAT = DATE_FORMAT;

  protected readonly countsByState = computed(() => {
    const counts = new Map<string, number>();
    for (const item of this.sources()) {
      counts.set(
        item.freshness.state,
        (counts.get(item.freshness.state) ?? 0) + 1,
      );
    }
    return [...counts.entries()].map(([state, count]) => ({
      state,
      labelKey: tokenKey('freshness', state),
      count,
    }));
  });
}
