// R-0016 TASK-0004 (Inspector). CTG-0002.md §13 (C-02-60; [RN-DASH-161]; catálogo §7).
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { SuppressedCellComponent } from './suppressed-cell.component.js';
import { expectA11yStateInvariants } from '../../testing/a11y-state.spec-helper.js';
import {
  buildTestCatalog,
  markerI18nModule,
  initializeMarkerI18n,
} from '../../testing/i18n-test-catalog.js';

const KEYS = [
  'dashboard.errors.cell_suppressed',
  'dashboard.errors.cell_threshold_undefined',
];

@Component({
  selector: 'dash-suppressed-cell-host',
  standalone: true,
  imports: [SuppressedCellComponent],
  template: `<dash-suppressed-cell
    [threshold]="threshold()"
    [footnoteId]="footnoteId()"
  />`,
})
class HostComponent {
  readonly threshold = signal<number | null>(10);
  readonly footnoteId = signal<string | null>(null);
}

describe('shared/suppressed-cell.component.ts (C-02-60)', () => {
  it('dado threshold 10 então texto cell_suppressed com 10, data-suppressed true, sem 0 nem — isolados', async () => {
    const catalog = buildTestCatalog(KEYS);
    TestBed.configureTestingModule({
      imports: [markerI18nModule(KEYS), HostComponent],
    });
    await initializeMarkerI18n();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain(
      catalog['dashboard.errors.cell_suppressed'],
    );
    expect(element.textContent).toContain('10');
    expect(element.querySelector('[data-suppressed="true"]')).not.toBeNull();
    expect(element.textContent?.trim()).not.toBe('0');
    expect(element.textContent?.trim()).not.toBe('—');
    await expectA11yStateInvariants(element, catalog, { component: true });
  });

  it('dado threshold null então cell_threshold_undefined', async () => {
    const catalog = buildTestCatalog(KEYS);
    TestBed.configureTestingModule({
      imports: [markerI18nModule(KEYS), HostComponent],
    });
    await initializeMarkerI18n();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.threshold.set(null);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain(
      catalog['dashboard.errors.cell_threshold_undefined'],
    );
  });

  it('dado footnoteId f1 então aria-describedby f1', async () => {
    TestBed.configureTestingModule({
      imports: [markerI18nModule(KEYS), HostComponent],
    });
    await initializeMarkerI18n();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.footnoteId.set('f1');
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('[aria-describedby="f1"]')).not.toBeNull();
  });
});
