// R-0016 TASK-0004 (Inspector). CTG-0002.md §13 (C-02-55; [WF-RAIT-002] §4.5). Dois filhos em
// TargetVsCeiling (roteiro do prompt TASK-0004).
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import {
  LegalCeilingComponent,
  OperationalTargetComponent,
  TargetVsCeilingComponent,
} from './target-vs-ceiling.component.js';
import { expectA11yStateInvariants } from '../../testing/a11y-state.spec-helper.js';
import {
  buildTestCatalog,
  markerI18nModule,
  initializeMarkerI18n,
} from '../../testing/i18n-test-catalog.js';
import type {
  LegalCeilingView,
  OperationalTargetView,
} from '../shared/models.js';

const KEYS = [
  'dashboard.blocks.c',
  'dashboard.blocks.a',
  'dashboard.states.unavailable',
];

const TARGET: OperationalTargetView = {
  value: 80,
  target: 90,
  freshness: {
    state: 'FRESCO',
    asOf: '2026-09-21T10:00:00-04:00',
    acceptableLatency: null,
    source: 's',
  },
};
const CEILING: LegalCeilingView = {
  value: 40,
  ceiling: 60,
  legalBasis: 'CTB art. 280',
  freshness: {
    state: 'FRESCO',
    asOf: '2026-09-21T10:00:00-04:00',
    acceptableLatency: null,
    source: 's',
  },
};

@Component({
  selector: 'dash-target-vs-ceiling-host',
  standalone: true,
  imports: [
    OperationalTargetComponent,
    LegalCeilingComponent,
    TargetVsCeilingComponent,
  ],
  template: `
    <dash-operational-target [target]="target()" />
    <dash-legal-ceiling [ceiling]="ceiling()" />
    <dash-target-vs-ceiling
      [target]="containerTarget()"
      [ceiling]="containerCeiling()"
    />
  `,
})
class HostComponent {
  readonly target = signal<OperationalTargetView>(TARGET);
  readonly ceiling = signal<LegalCeilingView>(CEILING);
  readonly containerTarget = signal<OperationalTargetView | null>(TARGET);
  readonly containerCeiling = signal<LegalCeilingView | null>(CEILING);
}

async function render() {
  TestBed.configureTestingModule({
    imports: [markerI18nModule(KEYS), HostComponent],
  });
  await initializeMarkerI18n();
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  return fixture;
}

describe('shared/target-vs-ceiling.component.ts (C-02-55)', () => {
  it('dado OperationalTargetComponent e LegalCeilingComponent quando renderizados então elementos distintos, cada valor no próprio seal', async () => {
    const catalog = buildTestCatalog(KEYS);
    const fixture = await render();
    const element = fixture.nativeElement as HTMLElement;
    const target = element.querySelector(
      'dash-operational-target[data-kind="target"]',
    );
    expect(target).not.toBeNull();
    expect(target?.textContent).toContain(catalog['dashboard.blocks.c']);
    expect(
      target?.querySelector('dash-freshness-seal[data-block="C"]'),
    ).not.toBeNull();

    const ceiling = element.querySelector(
      'dash-legal-ceiling[data-kind="ceiling"]',
    );
    expect(ceiling).not.toBeNull();
    expect(ceiling?.textContent).toContain(catalog['dashboard.blocks.a']);
    expect(
      ceiling?.querySelector('dash-freshness-seal[data-block="A"]'),
    ).not.toBeNull();
    expect(ceiling?.querySelector('dash-legal-basis-tag')).not.toBeNull();
    await expectA11yStateInvariants(element, catalog, { component: true });
  });

  it('dado TargetVsCeilingComponent com ambos então exatamente dois filhos distintos, nunca os dois valores no mesmo elemento', async () => {
    const fixture = await render();
    const element = fixture.nativeElement as HTMLElement;
    const container = element.querySelector(
      'dash-target-vs-ceiling',
    ) as HTMLElement;
    const targets = container.querySelectorAll('dash-operational-target');
    const ceilings = container.querySelectorAll('dash-legal-ceiling');
    expect(targets).toHaveLength(1);
    expect(ceilings).toHaveLength(1);
    for (const el of [...targets, ...ceilings]) {
      expect(
        el.querySelector('dash-operational-target, dash-legal-ceiling'),
      ).toBeNull();
    }
  });

  it('dado ceiling null então só o target', async () => {
    const fixture = await render();
    fixture.componentInstance.containerCeiling.set(null);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const container = element.querySelector(
      'dash-target-vs-ceiling',
    ) as HTMLElement;
    expect(container.querySelectorAll('dash-operational-target')).toHaveLength(
      1,
    );
    expect(container.querySelectorAll('dash-legal-ceiling')).toHaveLength(0);
  });
});
