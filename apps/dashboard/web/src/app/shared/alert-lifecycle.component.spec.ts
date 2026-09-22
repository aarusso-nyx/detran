// R-0016 TASK-0004 (Inspector). CTG-0002.md §13 (C-02-53; invariante 5).
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { AlertLifecycleComponent } from './alert-lifecycle.component.js';
import { expectA11yStateInvariants } from '../../testing/a11y-state.spec-helper.js';
import {
  buildTestCatalog,
  markerI18nModule,
  initializeMarkerI18n,
} from '../../testing/i18n-test-catalog.js';
import { ALERT_STATES, type AlertLifecycleView } from '../shared/models.js';

const KEYS = [
  ...ALERT_STATES.map(
    (state) => `dashboard.alert_states.${state.toLowerCase()}`,
  ),
  'dashboard.common.manual',
  'dashboard.common.fixed.manual_acknowledgement',
];

const LIFECYCLE: AlertLifecycleView = {
  current: 'RECONHECIDO',
  track: 'irregularidade',
  transitions: [
    {
      state: 'DETECTADO',
      at: '2026-09-21T08:00:00-04:00',
      recipient: null,
      manual: false,
    },
    {
      state: 'NOTIFICADO',
      at: '2026-09-21T08:05:00-04:00',
      recipient: 'dash-operator',
      manual: false,
    },
    {
      state: 'RECONHECIDO',
      at: '2026-09-21T08:10:00-04:00',
      recipient: 'dash-operator',
      manual: true,
    },
  ],
};

@Component({
  selector: 'dash-alert-lifecycle-host',
  standalone: true,
  imports: [AlertLifecycleComponent],
  template: `<dash-alert-lifecycle [lifecycle]="lifecycle()" />`,
})
class HostComponent {
  readonly lifecycle = signal<AlertLifecycleView>(LIFECYCLE);
}

describe('shared/alert-lifecycle.component.ts (C-02-53)', () => {
  it('dado lifecycle com current RECONHECIDO e transição manual então 10 <li data-state>, aria-current no atual, data-reached nos alcançados, manual marcado', async () => {
    const catalog = buildTestCatalog(KEYS);
    TestBed.configureTestingModule({
      imports: [markerI18nModule(KEYS), HostComponent],
    });
    await initializeMarkerI18n();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const items = element.querySelectorAll('li[data-state]');
    expect(items).toHaveLength(10);
    expect([...items].map((item) => item.getAttribute('data-state'))).toEqual([
      ...ALERT_STATES,
    ]);
    const current = element.querySelector('li[aria-current="step"]');
    expect(current?.getAttribute('data-state')).toBe('RECONHECIDO');
    const reached = element.querySelectorAll('li[data-reached]');
    expect(reached).toHaveLength(3);
    expect(element.textContent).toContain(catalog['dashboard.common.manual']);
    const manualItem = element.querySelector('li[data-state="RECONHECIDO"]');
    expect(manualItem?.getAttribute('title')).toContain(
      catalog['dashboard.common.fixed.manual_acknowledgement'],
    );
    await expectA11yStateInvariants(element, catalog, { component: true });
  });

  it('dado track extincao então host data-track e os passos CRITICO_EXTINCAO/INCIDENTE_REGISTRADO com data-track', async () => {
    TestBed.configureTestingModule({
      imports: [markerI18nModule(KEYS), HostComponent],
    });
    await initializeMarkerI18n();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.lifecycle.set({
      current: 'CRITICO_EXTINCAO',
      track: 'extincao',
      transitions: [
        {
          state: 'CRITICO_EXTINCAO',
          at: '2026-09-21T09:00:00-04:00',
          recipient: null,
          manual: false,
        },
      ],
    });
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('[data-track="extincao"]')).not.toBeNull();
    const criticalStep = element.querySelector(
      'li[data-state="CRITICO_EXTINCAO"]',
    );
    expect(criticalStep?.getAttribute('data-track')).toBe('extincao');
  });
});
