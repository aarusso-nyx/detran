// R-0016 TASK-0004 (Inspector). CTG-0002.md §13 (C-02-51; §2 invariante 2; A4).
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { SeverityChipComponent } from './severity-chip.component.js';
import { expectA11yStateInvariants } from '../../testing/a11y-state.spec-helper.js';
import {
  buildTestCatalog,
  markerI18nModule,
} from '../../testing/i18n-test-catalog.js';
import { readFileSync } from 'node:fs';
import { listAppSourceFiles } from '../../testing/kb.js';
import type { SeverityLevel } from '../shared/models.js';

const LEVELS: readonly SeverityLevel[] = [
  'N1',
  'N2',
  'N3',
  'CRITICO',
  'CRITICO_EXTINCAO',
];
const SHAPES: Readonly<Record<SeverityLevel, string>> = {
  N1: 'circle',
  N2: 'square',
  N3: 'triangle',
  CRITICO: 'diamond',
  CRITICO_EXTINCAO: 'octagon',
};

const KEYS = LEVELS.flatMap((level) => [
  `dashboard.severity.${level.toLowerCase()}`,
  `dashboard.a11y.severity.${level.toLowerCase()}`,
]);

@Component({
  selector: 'dash-severity-chip-host',
  standalone: true,
  imports: [SeverityChipComponent],
  template: `<dash-severity-chip [severity]="severity()" />`,
})
class HostComponent {
  readonly severity = signal<SeverityLevel>('N1');
}

describe('shared/severity-chip.component.ts (C-02-51)', () => {
  it.each(LEVELS)(
    'dado SeverityChipComponent com severity %s então data-shape/svg/rótulo/sr-only batem',
    async (level) => {
      const catalog = buildTestCatalog(KEYS);
      TestBed.configureTestingModule({
        imports: [markerI18nModule(KEYS), HostComponent],
      });
      const fixture = TestBed.createComponent(HostComponent);
      fixture.componentInstance.severity.set(level);
      fixture.detectChanges();
      const element = fixture.nativeElement as HTMLElement;
      const chip = element.querySelector('[data-severity]') as HTMLElement;
      expect(chip.getAttribute('data-severity')).toBe(level);
      expect(chip.getAttribute('data-shape')).toBe(SHAPES[level]);
      const svg = element.querySelector('svg[aria-hidden="true"]');
      expect(svg).not.toBeNull();
      expect(element.textContent).toContain(
        catalog[`dashboard.severity.${level.toLowerCase()}`],
      );
      const srOnly = element.querySelector(
        '.visually-hidden, [class*="sr-only"]',
      );
      expect(srOnly?.textContent).toContain(
        catalog[`dashboard.a11y.severity.${level.toLowerCase()}`],
      );
      if (level === 'CRITICO_EXTINCAO') {
        expect(chip.getAttribute('data-track')).toBe('extincao');
      }
      await expectA11yStateInvariants(element, catalog, { component: true });
    },
  );

  it('dado as 5 formas quando comparadas então distintas entre si', () => {
    expect(new Set(Object.values(SHAPES)).size).toBe(5);
  });

  it('dado listAppSourceFiles() quando varridos então nenhum literal dashboard.severity.shape (A4)', () => {
    // A busca é montada por concatenação para não aparecer verbatim neste próprio arquivo
    // (senão este spec falharia contra si mesmo ao ser incluído em listAppSourceFiles()).
    const forbidden = ['dashboard', 'severity', 'shape'].join('.');
    for (const file of listAppSourceFiles()) {
      if (file.endsWith('shared/severity-chip.component.spec.ts')) continue;
      const text = readFileSync(file, 'utf8');
      expect(text, file).not.toContain(forbidden);
    }
  });
});
