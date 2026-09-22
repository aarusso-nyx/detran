// R-0016 TASK-0004 (Inspector). CTG-0002.md §13 (C-02-65; invariante 10).
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { ClassificationBadgeComponent } from './classification-badge.component.js';
import { expectA11yStateInvariants } from '../../testing/a11y-state.spec-helper.js';
import {
  buildTestCatalog,
  markerI18nModule,
  initializeMarkerI18n,
} from '../../testing/i18n-test-catalog.js';
import type { Classification } from '../shared/models.js';

const KEYS = [
  'dashboard.classification.p1',
  'dashboard.classification.p2',
  'dashboard.classification.p3',
  'dashboard.errors.classification_missing',
];

@Component({
  selector: 'dash-classification-badge-host',
  standalone: true,
  imports: [ClassificationBadgeComponent],
  template: `<dash-classification-badge [classification]="classification()" />`,
})
class HostComponent {
  readonly classification = signal<Classification | null>('P1');
}

describe('shared/classification-badge.component.ts (C-02-65)', () => {
  it.each(['P1', 'P2', 'P3'] as const)(
    'dado classification %s então dashboard.classification.<p> e data-classification',
    async (classification) => {
      const catalog = buildTestCatalog(KEYS);
      TestBed.configureTestingModule({
        imports: [markerI18nModule(KEYS), HostComponent],
      });
      await initializeMarkerI18n();
      const fixture = TestBed.createComponent(HostComponent);
      fixture.componentInstance.classification.set(classification);
      fixture.detectChanges();
      const element = fixture.nativeElement as HTMLElement;
      expect(element.textContent).toContain(
        catalog[`dashboard.classification.${classification.toLowerCase()}`],
      );
      const badge = element.querySelector('[data-classification]');
      expect(badge?.getAttribute('data-classification')).toBe(classification);
      await expectA11yStateInvariants(element, catalog, { component: true });
    },
  );

  it('dado null então classification_missing e data-classification missing', async () => {
    const catalog = buildTestCatalog(KEYS);
    TestBed.configureTestingModule({
      imports: [markerI18nModule(KEYS), HostComponent],
    });
    await initializeMarkerI18n();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.classification.set(null);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain(
      catalog['dashboard.errors.classification_missing'],
    );
    expect(
      element.querySelector('[data-classification="missing"]'),
    ).not.toBeNull();
  });
});
