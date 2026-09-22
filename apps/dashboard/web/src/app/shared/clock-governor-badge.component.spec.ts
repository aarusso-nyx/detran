// R-0016 TASK-0004 (Inspector). CTG-0002.md §13 (C-02-54; OD-D16-007).
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ClockGovernorBadgeComponent } from './clock-governor-badge.component.js';
import { expectA11yStateInvariants } from '../../testing/a11y-state.spec-helper.js';
import {
  buildTestCatalog,
  markerI18nModule,
  initializeMarkerI18n,
} from '../../testing/i18n-test-catalog.js';
import { listAppSourceFiles } from '../../testing/kb.js';
import type { ClockCode } from '../shared/models.js';

const KEYS = ['dashboard.clocks.b', 'dashboard.clocks.c'];

@Component({
  selector: 'dash-clock-governor-badge-host',
  standalone: true,
  imports: [ClockGovernorBadgeComponent],
  template: `<dash-clock-governor-badge [clock]="clock()" />`,
})
class HostComponent {
  readonly clock = signal<ClockCode>('A');
}

describe('shared/clock-governor-badge.component.ts (C-02-54)', () => {
  it.each(['A', 'B', 'C', 'D'] as const)(
    'dado clock %s então a letra sempre visível; rótulo só em B/C',
    async (clock) => {
      const catalog = buildTestCatalog(KEYS);
      TestBed.configureTestingModule({
        imports: [markerI18nModule(KEYS), HostComponent],
      });
      await initializeMarkerI18n();
      const fixture = TestBed.createComponent(HostComponent);
      fixture.componentInstance.clock.set(clock);
      fixture.detectChanges();
      const element = fixture.nativeElement as HTMLElement;
      expect(element.textContent).toContain(clock);
      if (clock === 'B')
        expect(element.textContent).toContain(catalog['dashboard.clocks.b']);
      if (clock === 'C')
        expect(element.textContent).toContain(catalog['dashboard.clocks.c']);
      if (clock === 'A' || clock === 'D') {
        expect(element.textContent?.trim()).toBe(clock);
      }
      const badge = element.querySelector('[data-clock]');
      expect(badge?.getAttribute('data-clock')).toBe(clock);
      await expectA11yStateInvariants(element, catalog, { component: true });
    },
  );

  it('dado listAppSourceFiles() quando varridos então nenhum literal dashboard.clocks.a nem dashboard.clocks.d', () => {
    const forbiddenA = ['dashboard', 'clocks', 'a'].join('.');
    const forbiddenD = ['dashboard', 'clocks', 'd'].join('.');
    for (const file of listAppSourceFiles()) {
      if (file.endsWith('shared/clock-governor-badge.component.spec.ts'))
        continue;
      const text = readFileSync(file, 'utf8');
      expect(text, file).not.toContain(forbiddenA);
      expect(text, file).not.toContain(forbiddenD);
    }
  });
});
