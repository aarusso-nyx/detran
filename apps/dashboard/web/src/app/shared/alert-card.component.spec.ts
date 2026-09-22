// R-0016 TASK-0004 (Inspector). CTG-0002.md §13 (C-02-52; C-01-09; invariantes 3, 4).
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { AlertCardComponent } from './alert-card.component.js';
import { expectA11yStateInvariants } from '../../testing/a11y-state.spec-helper.js';
import {
  buildTestCatalog,
  initializeMarkerI18n,
  markerI18nModule,
} from '../../testing/i18n-test-catalog.js';
import type { AlertView } from '../shared/models.js';

const KEYS = [
  'dashboard.indicators.ind_dash_101',
  'dashboard.alert_states.notificado',
  'dashboard.alert_states.critico_extincao',
  'dashboard.severity.n3',
  'dashboard.severity.critico_extincao',
  'dashboard.a11y.severity.n3',
  'dashboard.a11y.severity.critico_extincao',
  'dashboard.clocks.b',
  'dashboard.layers.n2',
  'dashboard.common.deep_link',
  'dashboard.common.fixed.see_incident_inquiry',
  'dashboard.forms.encerrar_alerta.submit',
  'dashboard.states.unavailable',
  'dashboard.freshness.fresco',
  'dashboard.common.as_of',
];

function baseAlert(overrides: Partial<AlertView> = {}): AlertView {
  return {
    id: '00000000-0000-7000-8000-0000000000aa',
    indicatorCode: 'IND-DASH-101',
    block: 'A',
    severity: 'N3',
    state: 'NOTIFICADO',
    track: 'irregularidade',
    legalBasis: 'CTB art. 280',
    owner: 'dash-operator',
    remaining: 'PT2H',
    clock: 'B',
    nextMilestoneAt: '2026-09-22T10:00:00-04:00',
    app: 'RAIT',
    originRef: 'https://rait.example/casos/1',
    object: { reference: 'AM-1', app: 'RAIT' },
    classification: 'P2',
    freshness: {
      state: 'FRESCO',
      asOf: '2026-09-21T10:00:00-04:00',
      acceptableLatency: null,
      source: 's',
    },
    version: 1,
    ...overrides,
  };
}

@Component({
  selector: 'dash-alert-card-host',
  standalone: true,
  imports: [AlertCardComponent],
  template: `<dash-alert-card
    [alert]="alert()"
    [purposeDeclared]="purposeDeclared()"
    (openObject)="opened.set(true)"
  />`,
})
class HostComponent {
  readonly alert = signal<AlertView>(baseAlert());
  readonly purposeDeclared = signal(false);
  readonly opened = signal(false);
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

describe('shared/alert-card.component.ts (C-02-52)', () => {
  it('dado purposeDeclared false então AM-1 ausente e botão dashboard.layers.n2 emite openObject', async () => {
    const catalog = buildTestCatalog(KEYS);
    const fixture = await render();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).not.toContain('AM-1');
    const button = [...element.querySelectorAll('button')].find((btn) =>
      btn.textContent?.includes(catalog['dashboard.layers.n2']),
    );
    expect(button).toBeDefined();
    button!.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.opened()).toBe(true);
    await expectA11yStateInvariants(element, catalog, { component: true });
  });

  it('dado purposeDeclared true então AM-1 presente e os demais dados/filhos batem', async () => {
    const catalog = buildTestCatalog(KEYS);
    const fixture = await render();
    fixture.componentInstance.purposeDeclared.set(true);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('AM-1');
    expect(element.textContent).toContain(
      catalog['dashboard.indicators.ind_dash_101'],
    );
    expect(element.textContent).toContain(
      catalog['dashboard.alert_states.notificado'],
    );
    expect(
      element.querySelector('dash-severity-chip[data-shape="triangle"]'),
    ).not.toBeNull();
    const clockBadge = element.querySelector(
      'dash-clock-governor-badge[data-clock="B"]',
    );
    expect(clockBadge?.textContent).toContain(catalog['dashboard.clocks.b']);
    expect(
      element.querySelector('dash-legal-basis-tag')?.textContent,
    ).toContain('CTB art. 280');
    expect(
      element.querySelector('dash-freshness-seal[data-block="A"]'),
    ).not.toBeNull();
    expect(
      element.querySelector('dash-deep-link-button[data-app="RAIT"]'),
    ).not.toBeNull();
    expect(element.querySelector('dash-classification-badge')).not.toBeNull();
  });

  it('dado track extincao (CRITICO_EXTINCAO) então data-track extincao, see_incident_inquiry presente e encerrar_alerta.submit ausente', async () => {
    const catalog = buildTestCatalog(KEYS);
    const fixture = await render();
    fixture.componentInstance.alert.set(
      baseAlert({
        severity: 'CRITICO_EXTINCAO',
        state: 'CRITICO_EXTINCAO',
        track: 'extincao',
      }),
    );
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const card = element.querySelector('[data-track]') as HTMLElement;
    expect(card.getAttribute('data-track')).toBe('extincao');
    expect(element.textContent).toContain(
      catalog['dashboard.common.fixed.see_incident_inquiry'],
    );
    expect(element.textContent).not.toContain(
      catalog['dashboard.forms.encerrar_alerta.submit'],
    );
  });
});
