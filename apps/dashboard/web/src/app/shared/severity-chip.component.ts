// SeverityChip (CTG-0002.md §8 item 2; §2 invariante 2): forma + rótulo + cor, nunca só cor. As
// cinco formas têm número de vértices crescente para que a ordem de severidade seja perceptível
// sem cor (OD-D16-009, provisório — a prova é por `data-shape`, não por chave i18n). A extinção
// de direito tem forma e cor próprias, nunca a paleta do CRÍTICO de irregularidade.
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { StynxTranslatePipe } from '@detran/ui';
import { tokenKey } from '../core/i18n-token-key';
import type { SeverityLevel } from './models';

type SeverityShape = 'circle' | 'square' | 'triangle' | 'diamond' | 'octagon';

const SEVERITY_SHAPES: Readonly<Record<SeverityLevel, SeverityShape>> = {
  N1: 'circle',
  N2: 'square',
  N3: 'triangle',
  CRITICO: 'diamond',
  CRITICO_EXTINCAO: 'octagon',
};

const SHAPE_POINTS: Readonly<Record<SeverityShape, string>> = {
  circle: '',
  square: '4,4 20,4 20,20 4,20',
  triangle: '12,3 21,20 3,20',
  diamond: '12,2 22,12 12,22 2,12',
  octagon: '8,2 16,2 22,8 22,16 16,22 8,22 2,16 2,8',
};

@Component({
  selector: 'dash-severity-chip',
  imports: [StynxTranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-severity]': 'severity()',
    '[attr.data-shape]': 'shape()',
    '[attr.data-track]': 'track()',
  },
  template: `
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      width="16"
      height="16"
      class="dash-severity-shape"
    >
      @if (shape() === 'circle') {
        <circle cx="12" cy="12" r="9" />
      } @else {
        <polygon [attr.points]="points()" />
      }
    </svg>
    <span class="dash-severity-label">{{ labelKey() | stynxTranslate }}</span>
    <span class="visually-hidden">{{ a11yKey() | stynxTranslate }}</span>
  `,
  styles: `
    .visually-hidden {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }
    .dash-severity-shape {
      fill: var(--detran-primary, currentColor);
    }
    :host([data-track='extincao']) .dash-severity-shape {
      fill: var(--detran-danger, currentColor);
    }
  `,
})
export class SeverityChipComponent {
  readonly severity = input.required<SeverityLevel>();

  protected readonly shape = computed(() => SEVERITY_SHAPES[this.severity()]);
  protected readonly points = computed(() => SHAPE_POINTS[this.shape()]);
  protected readonly labelKey = computed(() =>
    tokenKey('severity', this.severity()),
  );
  protected readonly a11yKey = computed(
    () => `dashboard.a11y.severity.${this.severity().toLowerCase()}`,
  );
  protected readonly track = computed(() =>
    this.severity() === 'CRITICO_EXTINCAO' ? 'extincao' : null,
  );
}
