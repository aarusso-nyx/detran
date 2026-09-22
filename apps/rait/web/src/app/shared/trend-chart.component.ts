// TrendChart (contrato CTG-0002b §5.19; UC-RAIT-040): `<figure aria-labelledby>` com `<svg
// aria-hidden="true">` (polyline sobre ÍNDICES — nenhuma aritmética de datas; escala = min/max
// dos valores) e uma `<table>` visualmente oculta com as mesmas linhas (a11y: dados sempre em
// texto). Série vazia → `detran-empty-state`.
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import {
  DetranEmptyStateComponent,
  StynxIntlDatePipe,
  StynxIntlNumberPipe,
  StynxTranslatePipe,
} from '@detran/ui';

export interface TrendPoint {
  readonly on: string;
  readonly value: number;
}

const EMPTY_KEY = 'rait.states.empty';
const WIDTH = 100;
const HEIGHT = 40;
let nextId = 0;

@Component({
  selector: 'rait-trend-chart',
  imports: [
    StynxTranslatePipe,
    StynxIntlDatePipe,
    StynxIntlNumberPipe,
    DetranEmptyStateComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'rait-trend-chart', '[attr.data-count]': 'series().length' },
  template: `
    @if (series().length === 0) {
      <detran-empty-state
        [title]="emptyKey | stynxTranslate"
        [message]="emptyKey | stynxTranslate"
      />
    } @else {
      <figure [attr.aria-labelledby]="captionId">
        <figcaption [id]="captionId">
          {{ labelKey() | stynxTranslate }}
        </figcaption>
        <svg
          aria-hidden="true"
          [attr.viewBox]="'0 0 ' + width + ' ' + height"
          preserveAspectRatio="none"
          class="rait-trend-chart__svg"
        >
          <polyline
            fill="none"
            stroke="currentColor"
            [attr.points]="points()"
          />
        </svg>
        <table class="rait-trend-chart__data">
          <thead>
            <tr>
              <th scope="col">on</th>
              <th scope="col">value</th>
            </tr>
          </thead>
          <tbody>
            @for (point of series(); track $index) {
              <tr>
                <td>
                  <time [attr.datetime]="point.on">{{
                    point.on | stynxIntlDate
                  }}</time>
                </td>
                <td>{{ point.value | stynxIntlNumber }}</td>
              </tr>
            }
          </tbody>
        </table>
      </figure>
    }
  `,
  styles: `
    .rait-trend-chart__data {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0 0 0 0);
      white-space: nowrap;
    }
  `,
})
export class TrendChartComponent {
  readonly labelKey = input.required<string>();
  readonly series = input.required<readonly TrendPoint[]>();

  readonly emptyKey = EMPTY_KEY;
  readonly width = WIDTH;
  readonly height = HEIGHT;
  readonly captionId = `rait-trend-chart-${(nextId += 1)}`;

  /** Polyline sobre índices (x) e valores normalizados (y); sem aritmética de datas. */
  readonly points = computed(() => {
    const series = this.series();
    if (series.length === 0) return '';
    const values = series.map((point) => point.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min || 1;
    const step = series.length > 1 ? WIDTH / (series.length - 1) : 0;
    return series
      .map((point, index) => {
        const x = series.length > 1 ? index * step : WIDTH / 2;
        const y = HEIGHT - ((point.value - min) / span) * HEIGHT;
        return `${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(' ');
  });
}
