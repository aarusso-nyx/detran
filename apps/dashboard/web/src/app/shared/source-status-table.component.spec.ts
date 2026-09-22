// R-0016 TASK-0004 (Inspector). CTG-0002.md §13 (C-02-63).
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { SourceStatusTableComponent } from './source-status-table.component.js';
import { expectA11yStateInvariants } from '../../testing/a11y-state.spec-helper.js';
import {
  buildTestCatalog,
  markerI18nModule,
} from '../../testing/i18n-test-catalog.js';
import type { SourceStatusView } from '../shared/models.js';

const KEYS = [
  'dashboard.freshness.fresco',
  'dashboard.freshness.indisponivel',
  'dashboard.states.unavailable',
  'dashboard.common.as_of',
  'dashboard.forms.configurar_indicador.acceptable_latency',
  'dashboard.a11y.live_region',
];

const SOURCES: readonly SourceStatusView[] = [
  {
    source: 'prescription_risk',
    freshness: {
      state: 'FRESCO',
      asOf: '2026-09-21T10:00:00-04:00',
      acceptableLatency: 'PT15M',
      source: 'prescription_risk',
    },
    acceptableLatency: 'PT15M',
    lastHeartbeatAt: '2026-09-21T10:00:00-04:00',
  },
  {
    source: 'pec_deadlines',
    freshness: {
      state: 'INDISPONIVEL',
      asOf: null,
      acceptableLatency: null,
      source: 'pec_deadlines',
    },
    acceptableLatency: null,
    lastHeartbeatAt: null,
  },
];

@Component({
  selector: 'dash-source-status-table-host',
  standalone: true,
  imports: [SourceStatusTableComponent],
  template: `<dash-source-status-table
    [sources]="sources()"
    (select)="selected.set($event)"
  />`,
})
class HostComponent {
  readonly sources = signal<readonly SourceStatusView[]>(SOURCES);
  readonly selected = signal<SourceStatusView | null>(null);
}

describe('shared/source-status-table.component.ts (C-02-63)', () => {
  it('dado 2 SourceStatusView (FRESCO e INDISPONIVEL) então 2 itens com code/seal/latência/heartbeat/aria-live', async () => {
    const catalog = buildTestCatalog(KEYS);
    TestBed.configureTestingModule({
      imports: [markerI18nModule(KEYS), HostComponent],
    });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const codes = element.querySelectorAll('code[data-source]');
    expect(codes).toHaveLength(2);
    expect(
      element.querySelectorAll('dash-freshness-seal[data-block="D"]'),
    ).toHaveLength(2);
    expect(element.textContent).toContain(
      catalog['dashboard.forms.configurar_indicador.acceptable_latency'],
    );
    expect(
      element.querySelectorAll('time[data-field="heartbeat"]').length,
    ).toBeGreaterThan(0);
    const live = element.querySelector(
      `[role="status"][aria-live="polite"][aria-label="${catalog['dashboard.a11y.live_region']}"]`,
    );
    expect(live).not.toBeNull();
    await expectA11yStateInvariants(element, catalog, { component: true });
  });

  it('dado clique num item então select emite o item', () => {
    TestBed.configureTestingModule({
      imports: [markerI18nModule(KEYS), HostComponent],
    });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const item = element
      .querySelector('[data-source]')
      ?.closest('li, button, [role="button"]') as HTMLElement | null;
    item?.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selected()?.source).toBe(
      'prescription_risk',
    );
  });
});
