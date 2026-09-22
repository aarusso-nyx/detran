// R-0016 TASK-0004 (Inspector). CTG-0002.md §13 (C-02-56; invariante 9; M4 dois conjuntos).
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { DutyCalendarComponent } from './duty-calendar.component.js';
import { expectA11yStateInvariants } from '../../testing/a11y-state.spec-helper.js';
import {
  buildTestCatalog,
  markerI18nModule,
} from '../../testing/i18n-test-catalog.js';
import type { DutyView } from '../shared/models.js';

const KEYS = [
  'dashboard.blocks.b',
  'dashboard.screens.deveres.title',
  'dashboard.duty_states.janela_aberta',
  'dashboard.duty_states.em_apuracao',
  'dashboard.common.fixed.no_deadline_defined',
  'dashboard.indicators.ind_dash_202',
  'dashboard.a11y.live_region',
];

const DUTIES: readonly DutyView[] = [
  {
    id: 'd1',
    indicatorCode: 'IND-DASH-202',
    label: null,
    cycleState: 'EM_APURACAO',
    period: '2026-09',
    deadlineAt: '2026-10-01T00:00:00-04:00',
    sanctioned: true,
    own: true,
    classification: 'P2',
    freshness: {
      state: 'FRESCO',
      asOf: '2026-09-21T10:00:00-04:00',
      acceptableLatency: null,
      source: 's',
    },
  },
  {
    id: 'd2',
    indicatorCode: null,
    label: 'Linha 3 da tabela-mestra',
    cycleState: 'JANELA_ABERTA',
    period: '2026-09',
    deadlineAt: '2026-10-05T00:00:00-04:00',
    sanctioned: false,
    own: false,
    classification: 'P3',
    freshness: {
      state: 'FRESCO',
      asOf: '2026-09-21T10:00:00-04:00',
      acceptableLatency: null,
      source: 's',
    },
  },
  {
    id: 'd3',
    indicatorCode: null,
    label: 'Linha 5 da tabela-mestra',
    cycleState: 'JANELA_ABERTA',
    period: '2026-09',
    deadlineAt: null,
    sanctioned: false,
    own: true,
    classification: null,
    freshness: {
      state: 'FRESCO',
      asOf: '2026-09-21T10:00:00-04:00',
      acceptableLatency: null,
      source: 's',
    },
  },
];

@Component({
  selector: 'dash-duty-calendar-host',
  standalone: true,
  imports: [DutyCalendarComponent],
  template: `<dash-duty-calendar
    [duties]="duties()"
    (select)="selected.set($event)"
  />`,
})
class HostComponent {
  readonly duties = signal<readonly DutyView[]>(DUTIES);
  readonly selected = signal<DutyView | null>(null);
}

describe('shared/duty-calendar.component.ts (C-02-56)', () => {
  it('dado 3 DutyView então duas seções, item 202 sanctioned, item sem prazo em seção separada, estados/badges/selos por item, aria-live', async () => {
    const catalog = buildTestCatalog(KEYS);
    TestBed.configureTestingModule({
      imports: [markerI18nModule(KEYS), HostComponent],
    });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    const headings = [...element.querySelectorAll('h2')].map(
      (h) => h.textContent,
    );
    expect(
      headings.some((text) => text?.includes(catalog['dashboard.blocks.b'])),
    ).toBe(true);
    expect(
      headings.some((text) =>
        text?.includes(catalog['dashboard.screens.deveres.title']),
      ),
    ).toBe(true);

    const sanctioned = element.querySelector('[data-sanctioned="true"]');
    expect(sanctioned).not.toBeNull();
    expect(sanctioned?.textContent).toContain(
      catalog['dashboard.indicators.ind_dash_202'],
    );

    expect(element.textContent).toContain(
      catalog['dashboard.common.fixed.no_deadline_defined'],
    );

    expect(
      element.querySelectorAll('dash-classification-badge').length,
    ).toBeGreaterThan(0);
    expect(
      element.querySelectorAll('dash-freshness-seal[data-block="B"]').length,
    ).toBe(3);

    const live = element.querySelector(
      `[role="status"][aria-live="polite"][aria-label="${catalog['dashboard.a11y.live_region']}"]`,
    );
    expect(live).not.toBeNull();

    await expectA11yStateInvariants(element, catalog, { component: true });
  });

  it('dado clique num item então select emite o DutyView', () => {
    TestBed.configureTestingModule({
      imports: [markerI18nModule(KEYS), HostComponent],
    });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const item = element.querySelector(
      '[data-sanctioned="true"]',
    ) as HTMLElement;
    (
      item.closest('li, button, [role="button"]') as HTMLElement | null
    )?.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selected()?.id).toBe('d1');
  });
});
