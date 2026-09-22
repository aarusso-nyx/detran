// R-0016 TASK-0004 (Inspector). CTG-0002.md §13 (C-02-62).
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { ExportDialogComponent } from './export-dialog.component.js';
import { expectA11yStateInvariants } from '../../testing/a11y-state.spec-helper.js';
import {
  buildTestCatalog,
  markerI18nModule,
} from '../../testing/i18n-test-catalog.js';
import type {
  Classification,
  DashboardLayer,
  ExportRequest,
} from '../shared/models.js';

const KEYS = [
  'dashboard.forms.exportar.scope',
  'dashboard.forms.exportar.filters',
  'dashboard.forms.exportar.format',
  'dashboard.forms.exportar.purpose',
  'dashboard.forms.exportar.rows',
  'dashboard.forms.exportar.volume_justification',
  'dashboard.forms.exportar.submit',
  'dashboard.forms.exportar.gate',
  'dashboard.common.action.export',
  'dashboard.common.action.cancel',
  'dashboard.layers.n0',
  'dashboard.layers.n1',
  'dashboard.layers.n2',
  'dashboard.layers.n3',
  'dashboard.classification.p1',
  'dashboard.classification.p2',
  'dashboard.classification.p3',
  'dashboard.errors.export_format_not_open',
  'dashboard.errors.classification_missing',
];

@Component({
  selector: 'dash-export-dialog-host',
  standalone: true,
  imports: [ExportDialogComponent],
  template: `<dash-export-dialog
    [open]="true"
    [classification]="classification()"
    [layer]="layer()"
    scope="D-10"
    [filters]="{}"
    [rows]="rows()"
    [approvalRows]="approvalRows()"
    [formats]="formats()"
    (requested)="requested.set($event)"
    (cancelled)="cancelled.set(true)"
  />`,
})
class HostComponent {
  readonly classification = signal<Classification | null>('P2');
  readonly layer = signal<DashboardLayer>('N2');
  readonly rows = signal<number | null>(6000);
  readonly approvalRows = signal<number | null>(5000);
  readonly formats = signal<readonly string[]>(['csv']);
  readonly requested = signal<ExportRequest | null>(null);
  readonly cancelled = signal(false);
}

function render() {
  TestBed.configureTestingModule({
    imports: [markerI18nModule(KEYS), HostComponent],
  });
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  return fixture;
}

function submitButton(element: HTMLElement): HTMLButtonElement {
  return [...element.querySelectorAll('button')].find(
    (btn) =>
      btn.textContent?.includes('submit') || btn.type === 'submit' || btn.form,
  ) as HTMLButtonElement;
}

describe('shared/export-dialog.component.ts (C-02-62)', () => {
  it('dado layer N2, classification P2, rows 6000, approvalRows 5000, formats [csv] então badge P2, layers.n2, campos, purpose+volume obrigatórios (submit desabilitado)', async () => {
    const catalog = buildTestCatalog(KEYS);
    const fixture = render();
    const element = fixture.nativeElement as HTMLElement;
    expect(
      element.querySelector('dash-classification-badge')?.textContent,
    ).toContain(catalog['dashboard.classification.p2']);
    expect(element.textContent).toContain(catalog['dashboard.layers.n2']);
    for (const field of [
      'scope',
      'filters',
      'format',
      'purpose',
      'rows',
      'volume_justification',
    ]) {
      expect(element.textContent).toContain(
        catalog[`dashboard.forms.exportar.${field}`],
      );
    }
    expect(submitButton(element).disabled).toBe(true);
    await expectA11yStateInvariants(element, catalog, { component: true });
  });

  it('dado layer N1 rows 10 então purpose opcional (submit não bloqueado só por purpose)', () => {
    const fixture = render();
    fixture.componentInstance.layer.set('N1');
    fixture.componentInstance.rows.set(10);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(
      element.querySelector('[name="purpose"]')?.hasAttribute('required'),
    ).toBe(false);
  });

  it('dado formats [] então select desabilitado e export_format_not_open', () => {
    const catalog = buildTestCatalog(KEYS);
    const fixture = render();
    fixture.componentInstance.formats.set([]);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const select = element.querySelector(
      'select[name="format"]',
    ) as HTMLSelectElement;
    expect(select.disabled).toBe(true);
    expect(element.textContent).toContain(
      catalog['dashboard.errors.export_format_not_open'],
    );
  });

  it('dado classification null então submit desabilitado e classification_missing', () => {
    const catalog = buildTestCatalog(KEYS);
    const fixture = render();
    fixture.componentInstance.classification.set(null);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(submitButton(element).disabled).toBe(true);
    expect(element.textContent).toContain(
      catalog['dashboard.errors.classification_missing'],
    );
  });

  it('dado submit válido então requested emite ExportRequest', () => {
    const fixture = render();
    fixture.componentInstance.rows.set(10);
    fixture.componentInstance.layer.set('N1');
    fixture.componentInstance.approvalRows.set(5000);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const formatSelect = element.querySelector(
      'select[name="format"]',
    ) as HTMLSelectElement;
    formatSelect.value = 'csv';
    formatSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    submitButton(element).click();
    fixture.detectChanges();
    expect(fixture.componentInstance.requested()).not.toBeNull();
  });
});
