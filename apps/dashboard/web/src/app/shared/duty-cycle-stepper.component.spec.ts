// R-0016 TASK-0004 (Inspector). CTG-0002.md §13 (C-02-57).
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { DutyCycleStepperComponent } from './duty-cycle-stepper.component.js';
import { expectA11yStateInvariants } from '../../testing/a11y-state.spec-helper.js';
import {
  buildTestCatalog,
  markerI18nModule,
  initializeMarkerI18n,
} from '../../testing/i18n-test-catalog.js';
import { DUTY_STATES, type DutyCycleView } from '../shared/models.js';

const KEYS = [
  ...DUTY_STATES.map((state) => `dashboard.duty_states.${state.toLowerCase()}`),
  'dashboard.common.fixed.no_deadline_defined',
  'dashboard.forms.avancar_ciclo.hash',
];

const CYCLE: DutyCycleView = {
  dutyId: 'd1',
  period: '2026-09',
  state: 'SUBMETIDO_PUBLICADO',
  deadlineAt: null,
  transitions: [
    { state: 'JANELA_ABERTA', at: '2026-09-01T00:00:00-04:00', evidence: null },
    { state: 'EM_APURACAO', at: '2026-09-05T00:00:00-04:00', evidence: null },
    { state: 'PREPARADO', at: '2026-09-10T00:00:00-04:00', evidence: null },
    {
      state: 'SUBMETIDO_PUBLICADO',
      at: '2026-09-15T00:00:00-04:00',
      evidence: null,
    },
  ],
  lateHistory: [],
  version: 1,
};

@Component({
  selector: 'dash-duty-cycle-stepper-host',
  standalone: true,
  imports: [DutyCycleStepperComponent],
  template: `<dash-duty-cycle-stepper [cycle]="cycle()" />`,
})
class HostComponent {
  readonly cycle = signal<DutyCycleView>(CYCLE);
}

describe('shared/duty-cycle-stepper.component.ts (C-02-57)', () => {
  it('dado cycle SUBMETIDO_PUBLICADO com deadlineAt null então 8 estágios, aria-current no atual, data-branch late em ATRASADO/NAO_CUMPRIDO, no_deadline_defined', async () => {
    const catalog = buildTestCatalog(KEYS);
    TestBed.configureTestingModule({
      imports: [markerI18nModule(KEYS), HostComponent],
    });
    await initializeMarkerI18n();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const items = element.querySelectorAll('li');
    expect(items).toHaveLength(8);
    const current = element.querySelector('[aria-current="step"]');
    expect(current?.textContent).toContain(
      catalog['dashboard.duty_states.submetido_publicado'],
    );
    const late = element.querySelectorAll('[data-branch="late"]');
    expect(late).toHaveLength(2);
    expect(element.textContent).toContain(
      catalog['dashboard.common.fixed.no_deadline_defined'],
    );
    await expectA11yStateInvariants(element, catalog, { component: true });
  });

  it('dado transição com evidence hash então <code> com o hash e rótulo forms.avancar_ciclo.hash', async () => {
    const catalog = buildTestCatalog(KEYS);
    TestBed.configureTestingModule({
      imports: [markerI18nModule(KEYS), HostComponent],
    });
    await initializeMarkerI18n();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.cycle.set({
      ...CYCLE,
      transitions: [
        ...CYCLE.transitions,
        {
          state: 'COMPROVADO',
          at: '2026-09-20T00:00:00-04:00',
          evidence: { hash: 'a'.repeat(64) },
        },
      ],
    });
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const code = element.querySelector('code');
    expect(code?.textContent).toContain('a'.repeat(64));
    expect(element.textContent).toContain(
      catalog['dashboard.forms.avancar_ciclo.hash'],
    );
  });
});
