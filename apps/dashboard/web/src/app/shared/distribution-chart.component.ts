// DistributionChart (CTG-0002.md §Decisões 2 e §8 item 11; §2 invariante 8): SVG inline, sem
// biblioteca de gráficos. Escala ÚNICA por gráfico (um eixo, um domínio, rótulo visível); as
// barras saem na ORDEM RECEBIDA — o painel abre em distribuição, nunca em ranking (ordenação
// nominal é decisão N2 do backend, com finalidade declarada). Não soma, não normaliza, não
// ordena e não suprime: célula suprimida vem marcada e é dita como suprimida, nunca "0".
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import {
  StynxI18nService,
  StynxIntlNumberPipe,
  StynxTranslatePipe,
} from '@detran/ui';
import type { DashboardBlock } from '../app.route-manifest';
import { FreshnessSealComponent } from './freshness-seal.component';
import { SuppressedCellComponent } from './suppressed-cell.component';
import { tokenKey } from '../core/i18n-token-key';
import type { DistributionBar, DistributionSeries } from './models';

const SUPPRESSED_KEY = 'dashboard.errors.cell_suppressed';
const BAR_HEIGHT = 24;
const BAR_GAP = 8;
const CHART_WIDTH = 240;

interface ChartBar {
  readonly bar: DistributionBar;
  readonly y: number;
  readonly width: number;
  /** Texto acessível da barra: rótulo + valor (ou marca de supressão) + frescor. */
  readonly title: string;
}

@Component({
  selector: 'dash-distribution-chart',
  imports: [
    FreshnessSealComponent,
    SuppressedCellComponent,
    StynxTranslatePipe,
    StynxIntlNumberPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'img',
    '[attr.aria-label]': 'axisLabel()',
    '[attr.data-dimension]': 'series().dimension',
    '[attr.data-scale-max]': 'series().scale.max',
  },
  template: `
    <svg
      [attr.viewBox]="'0 0 ' + CHART_WIDTH + ' ' + height()"
      [attr.width]="CHART_WIDTH"
      [attr.height]="height()"
      aria-hidden="true"
      focusable="false"
    >
      @for (item of bars(); track item.bar.key) {
        <rect
          class="dash-bar"
          x="0"
          [attr.y]="item.y"
          [attr.height]="BAR_HEIGHT"
          [attr.width]="item.width"
          [attr.data-bar]="item.bar.key"
        >
          <title>{{ item.title }}</title>
        </rect>
      }
    </svg>
    <p class="dash-axis" data-field="scale">
      <span>{{ series().scale.labelKey | stynxTranslate }}</span>
      <span data-field="scale-max">{{
        series().scale.max | stynxIntlNumber
      }}</span>
    </p>
    <ul>
      @for (item of bars(); track item.bar.key) {
        <li [attr.data-bar]="item.bar.key">
          <span data-field="label">{{ item.bar.label }}</span>
          @if (item.bar.suppressed) {
            <dash-suppressed-cell [threshold]="item.bar.threshold" />
          } @else if (item.bar.value === null) {
            <dash-freshness-seal
              [freshness]="item.bar.freshness"
              [block]="block()"
            />
          } @else {
            <span data-field="value">{{
              item.bar.value | stynxIntlNumber
            }}</span>
          }
        </li>
      }
    </ul>
  `,
  styles: `
    .dash-bar {
      fill: var(--detran-primary, currentColor);
    }
  `,
})
export class DistributionChartComponent {
  readonly series = input.required<DistributionSeries>();
  /** Bloco da página (o selo de frescor das barras sem leitura). */
  readonly block = input<DashboardBlock>('C');

  protected readonly CHART_WIDTH = CHART_WIDTH;
  protected readonly BAR_HEIGHT = BAR_HEIGHT;

  private readonly i18n = inject(StynxI18nService);

  /** Rótulo acessível do gráfico: o texto do eixo (host binding não aceita pipe). */
  protected readonly axisLabel = computed(() =>
    this.i18n.translate(this.series().scale.labelKey),
  );

  protected readonly height = computed(
    () => this.series().bars.length * (BAR_HEIGHT + BAR_GAP) + BAR_GAP,
  );

  protected readonly bars = computed<readonly ChartBar[]>(() => {
    const series = this.series();
    const max = series.scale.max;
    return series.bars.map((bar, index) => ({
      bar,
      y: index * (BAR_HEIGHT + BAR_GAP) + BAR_GAP,
      width:
        bar.value === null || max <= 0
          ? 0
          : Math.round((bar.value / max) * CHART_WIDTH),
      title: this.titleOf(bar),
    }));
  });

  /** Texto acessível da barra (o `<title>` do SVG não aceita blocos de controle). */
  private titleOf(bar: DistributionBar): string {
    const parts: string[] = [bar.label];
    if (bar.suppressed) parts.push(this.i18n.translate(SUPPRESSED_KEY));
    else if (bar.value !== null) parts.push(String(bar.value));
    if (bar.freshness) {
      parts.push(
        this.i18n.translate(tokenKey('freshness', bar.freshness.state)),
      );
    }
    return parts.join(' ');
  }
}
