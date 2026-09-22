// R-0016 TASK-0004 (Inspector). CTG-0002.md §13 (C-02-59; §Decisões 2; invariante 8).
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { DistributionChartComponent } from './distribution-chart.component.js';
import { expectA11yStateInvariants } from '../../testing/a11y-state.spec-helper.js';
import {
  buildTestCatalog,
  markerI18nModule,
  initializeMarkerI18n,
} from '../../testing/i18n-test-catalog.js';
import type { DistributionSeries } from '../shared/models.js';

const KEYS = [
  'dashboard.blocks.c',
  'dashboard.errors.cell_suppressed',
  'dashboard.states.unavailable',
];

const SERIES: DistributionSeries = {
  dimension: 'unit',
  scale: { max: 100, labelKey: 'dashboard.blocks.c' },
  bars: [
    {
      key: 'b',
      label: 'Unidade B',
      value: 30,
      suppressed: false,
      threshold: null,
      freshness: null,
    },
    {
      key: 'a',
      label: 'Unidade A',
      value: 80,
      suppressed: false,
      threshold: null,
      freshness: null,
    },
    {
      key: 'c',
      label: 'Unidade C',
      value: null,
      suppressed: true,
      threshold: 10,
      freshness: null,
    },
  ],
};

@Component({
  selector: 'dash-distribution-chart-host',
  standalone: true,
  imports: [DistributionChartComponent],
  template: `<dash-distribution-chart [series]="series()" />`,
})
class HostComponent {
  readonly series = signal<DistributionSeries>(SERIES);
}

describe('shared/distribution-chart.component.ts (C-02-59)', () => {
  it('dado 3 barras [b,a,c] com uma suprimida então role=img, eixo único 100, ordem recebida, título por barra, suprimida sem 0', async () => {
    const catalog = buildTestCatalog(KEYS);
    TestBed.configureTestingModule({
      imports: [markerI18nModule(KEYS), HostComponent],
    });
    await initializeMarkerI18n();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const chart = element.querySelector('[role="img"]') as HTMLElement;
    expect(chart).not.toBeNull();
    expect(chart.getAttribute('aria-label')).toContain(
      catalog['dashboard.blocks.c'],
    );
    expect(element.textContent).toContain('100');
    const titles = element.querySelectorAll('title');
    expect(titles.length).toBeGreaterThanOrEqual(3);
    expect(titles[0].textContent).toContain('Unidade B');
    expect(titles[1].textContent).toContain('Unidade A');
    expect(titles[2].textContent).toContain('Unidade C');
    expect(element.querySelector('dash-suppressed-cell')).not.toBeNull();
    expect(element.textContent).not.toMatch(/(^|[^0-9])0([^0-9]|$)/);
    expect(chart.getAttribute('data-dimension')).toBe('unit');
    expect(chart.getAttribute('data-scale-max')).toBe('100');
    await expectA11yStateInvariants(element, catalog, { component: true });
  });

  it('dado uma barra com value null não suprimida então selo INDISPONIVEL', async () => {
    TestBed.configureTestingModule({
      imports: [markerI18nModule(KEYS), HostComponent],
    });
    await initializeMarkerI18n();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.series.set({
      ...SERIES,
      bars: [
        {
          key: 'x',
          label: 'X',
          value: null,
          suppressed: false,
          threshold: null,
          freshness: null,
        },
      ],
    });
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('dash-freshness-seal')).not.toBeNull();
  });
});
