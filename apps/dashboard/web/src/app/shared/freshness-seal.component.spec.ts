// R-0016 TASK-0004 (Inspector). CTG-0002.md §13 "shared/<componente>.component.spec.ts" (C-02-50).
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { FreshnessSealComponent } from './freshness-seal.component.js';
import { expectA11yStateInvariants } from '../../testing/a11y-state.spec-helper.js';
import {
  buildTestCatalog,
  markerI18nModule,
} from '../../testing/i18n-test-catalog.js';
import type { FreshnessMeta } from '../core/freshness.store.js';

const KEYS = [
  'dashboard.states.unavailable',
  'dashboard.freshness.indisponivel',
  'dashboard.states.stale',
  'dashboard.freshness.atrasado',
  'dashboard.common.as_of',
  'dashboard.freshness.fresco',
] as const;

@Component({
  selector: 'dash-freshness-seal-host',
  standalone: true,
  imports: [FreshnessSealComponent],
  template: `<dash-freshness-seal [freshness]="freshness()" [block]="block()"
    >42</dash-freshness-seal
  >`,
})
class HostComponent {
  readonly freshness = signal<FreshnessMeta | null>(null);
  readonly block = signal<'A' | 'B' | 'C' | 'D'>('A');
}

function render() {
  TestBed.configureTestingModule({
    imports: [markerI18nModule([...KEYS]), HostComponent],
  });
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  return fixture;
}

const AS_OF = '2026-09-21T10:00:00-04:00';

describe('shared/freshness-seal.component.ts (C-02-50)', () => {
  it('dado freshness null quando renderizado então 42 ausente e dashboard.states.unavailable, data-value-hidden true', async () => {
    const catalog = buildTestCatalog([...KEYS]);
    const fixture = render();
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).not.toContain('42');
    expect(element.textContent).toContain(
      catalog['dashboard.states.unavailable'],
    );
    const seal = element.querySelector('[data-freshness]') as HTMLElement;
    expect(seal.getAttribute('data-value-hidden')).toBe('true');
    await expectA11yStateInvariants(element, catalog, { component: true });
  });

  it('dado INDISPONIVEL + block A quando renderizado então 42 ausente + freshness.indisponivel + states.unavailable', () => {
    const catalog = buildTestCatalog([...KEYS]);
    const fixture = render();
    fixture.componentInstance.freshness.set({
      state: 'INDISPONIVEL',
      asOf: null,
      acceptableLatency: null,
      source: 's',
    });
    fixture.componentInstance.block.set('A');
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).not.toContain('42');
    expect(element.textContent).toContain(
      catalog['dashboard.freshness.indisponivel'],
    );
    expect(element.textContent).toContain(
      catalog['dashboard.states.unavailable'],
    );
  });

  it.each(['B', 'C', 'D'] as const)(
    'dado INDISPONIVEL + block %s quando renderizado então 42 presente + freshness.indisponivel, data-value-hidden false',
    (block) => {
      const catalog = buildTestCatalog([...KEYS]);
      const fixture = render();
      fixture.componentInstance.freshness.set({
        state: 'INDISPONIVEL',
        asOf: null,
        acceptableLatency: null,
        source: 's',
      });
      fixture.componentInstance.block.set(block);
      fixture.detectChanges();
      const element = fixture.nativeElement as HTMLElement;
      expect(element.textContent).toContain('42');
      expect(element.textContent).toContain(
        catalog['dashboard.freshness.indisponivel'],
      );
      const seal = element.querySelector('[data-freshness]') as HTMLElement;
      expect(seal.getAttribute('data-value-hidden')).toBe('false');
    },
  );

  it('dado DESATUALIZADO_MARCADO + block A quando renderizado então 42 ausente + states.stale com as_of', () => {
    const catalog = buildTestCatalog([...KEYS]);
    const fixture = render();
    fixture.componentInstance.freshness.set({
      state: 'DESATUALIZADO_MARCADO',
      asOf: AS_OF,
      acceptableLatency: null,
      source: 's',
    });
    fixture.componentInstance.block.set('A');
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).not.toContain('42');
    expect(element.textContent).toContain(catalog['dashboard.states.stale']);
  });

  it('dado DESATUALIZADO_MARCADO + block B quando renderizado então 42 presente + states.stale', () => {
    const catalog = buildTestCatalog([...KEYS]);
    const fixture = render();
    fixture.componentInstance.freshness.set({
      state: 'DESATUALIZADO_MARCADO',
      asOf: AS_OF,
      acceptableLatency: null,
      source: 's',
    });
    fixture.componentInstance.block.set('B');
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('42');
    expect(element.textContent).toContain(catalog['dashboard.states.stale']);
  });

  it('dado ATRASADO quando renderizado então 42 + freshness.atrasado + common.as_of', () => {
    const catalog = buildTestCatalog([...KEYS]);
    const fixture = render();
    fixture.componentInstance.freshness.set({
      state: 'ATRASADO',
      asOf: AS_OF,
      acceptableLatency: null,
      source: 's',
    });
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('42');
    expect(element.textContent).toContain(
      catalog['dashboard.freshness.atrasado'],
    );
    expect(element.textContent).toContain(catalog['dashboard.common.as_of']);
    const time = element.querySelector('time');
    expect(time?.getAttribute('datetime')).toBe(AS_OF);
  });

  it('dado FRESCO quando renderizado então 42 + freshness.fresco + common.as_of; data-freshness = state', () => {
    const catalog = buildTestCatalog([...KEYS]);
    const fixture = render();
    fixture.componentInstance.freshness.set({
      state: 'FRESCO',
      asOf: AS_OF,
      acceptableLatency: null,
      source: 's',
    });
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('42');
    expect(element.textContent).toContain(
      catalog['dashboard.freshness.fresco'],
    );
    const seal = element.querySelector('[data-freshness]') as HTMLElement;
    expect(seal.getAttribute('data-freshness')).toBe('FRESCO');
    expect(seal.getAttribute('data-block')).toBe('A');
  });
});
