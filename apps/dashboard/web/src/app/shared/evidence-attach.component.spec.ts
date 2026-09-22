// R-0016 TASK-0004 (Inspector). CTG-0002.md §13 (C-02-58; OD-D16-011).
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { EvidenceAttachComponent } from './evidence-attach.component.js';
import { expectA11yStateInvariants } from '../../testing/a11y-state.spec-helper.js';
import {
  buildTestCatalog,
  markerI18nModule,
  initializeMarkerI18n,
} from '../../testing/i18n-test-catalog.js';
import type { DutyEvidence } from '../shared/models.js';

const KEYS = [
  'dashboard.forms.avancar_ciclo.protocol',
  'dashboard.forms.avancar_ciclo.capture_uri',
  'dashboard.forms.avancar_ciclo.hash',
  'dashboard.forms.avancar_ciclo.submit',
  'dashboard.errors.duty_evidence_required',
  'dashboard.errors.duty_evidence_hash_invalid',
];

@Component({
  selector: 'dash-evidence-attach-host',
  standalone: true,
  imports: [EvidenceAttachComponent],
  template: `<dash-evidence-attach (evidence)="emitted.push($event)" />`,
})
class HostComponent {
  readonly emitted: DutyEvidence[] = [];
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

function submitButton(element: HTMLElement): HTMLButtonElement {
  return [...element.querySelectorAll('button')].find(
    (btn) => btn.type !== 'reset' && btn.textContent?.trim().length,
  ) as HTMLButtonElement;
}

function setValue(input: HTMLInputElement, value: string): void {
  input.value = value;
  input.dispatchEvent(new Event('input'));
}

describe('shared/evidence-attach.component.ts (C-02-58)', () => {
  it('dado nenhum campo preenchido então botão desabilitado e duty_evidence_required visível', async () => {
    const catalog = buildTestCatalog(KEYS);
    const fixture = await render();
    const element = fixture.nativeElement as HTMLElement;
    expect(submitButton(element).disabled).toBe(true);
    expect(element.textContent).toContain(
      catalog['dashboard.errors.duty_evidence_required'],
    );
    await expectA11yStateInvariants(element, catalog, { component: true });
  });

  it('dado só protocol preenchido então habilitado e evidence emite { protocol }', async () => {
    const fixture = await render();
    const element = fixture.nativeElement as HTMLElement;
    const protocolInput = element.querySelector(
      'input[name="protocol"]',
    ) as HTMLInputElement;
    setValue(protocolInput, 'P1');
    fixture.detectChanges();
    expect(submitButton(element).disabled).toBe(false);
    submitButton(element).click();
    fixture.detectChanges();
    expect(fixture.componentInstance.emitted.at(-1)).toEqual({
      protocol: 'P1',
    });
  });

  it('dado só captureUri preenchido então evidence emite { captureUri }', async () => {
    const fixture = await render();
    const element = fixture.nativeElement as HTMLElement;
    const input = element.querySelector(
      'input[name="captureUri"]',
    ) as HTMLInputElement;
    setValue(input, 'https://x/y.png');
    fixture.detectChanges();
    submitButton(element).click();
    fixture.detectChanges();
    expect(fixture.componentInstance.emitted.at(-1)).toEqual({
      captureUri: 'https://x/y.png',
    });
  });

  it('dado hash válido (64 hex) então evidence emite { hash }', async () => {
    const fixture = await render();
    const element = fixture.nativeElement as HTMLElement;
    const input = element.querySelector(
      'input[name="hash"]',
    ) as HTMLInputElement;
    setValue(input, 'a'.repeat(64));
    fixture.detectChanges();
    expect(submitButton(element).disabled).toBe(false);
    submitButton(element).click();
    fixture.detectChanges();
    expect(fixture.componentInstance.emitted.at(-1)).toEqual({
      hash: 'a'.repeat(64),
    });
  });

  it("dado hash 'abc' então desabilitado com duty_evidence_hash_invalid e aria-describedby", async () => {
    const catalog = buildTestCatalog(KEYS);
    const fixture = await render();
    const element = fixture.nativeElement as HTMLElement;
    const input = element.querySelector(
      'input[name="hash"]',
    ) as HTMLInputElement;
    setValue(input, 'abc');
    fixture.detectChanges();
    expect(submitButton(element).disabled).toBe(true);
    expect(element.textContent).toContain(
      catalog['dashboard.errors.duty_evidence_hash_invalid'],
    );
    expect(input.getAttribute('aria-describedby')).toBeTruthy();
  });

  it('dado os três campos preenchidos então evidence emite os três', async () => {
    const fixture = await render();
    const element = fixture.nativeElement as HTMLElement;
    setValue(
      element.querySelector('input[name="protocol"]') as HTMLInputElement,
      'P1',
    );
    setValue(
      element.querySelector('input[name="captureUri"]') as HTMLInputElement,
      'https://x/y.png',
    );
    setValue(
      element.querySelector('input[name="hash"]') as HTMLInputElement,
      'a'.repeat(64),
    );
    fixture.detectChanges();
    submitButton(element).click();
    fixture.detectChanges();
    expect(fixture.componentInstance.emitted.at(-1)).toEqual({
      protocol: 'P1',
      captureUri: 'https://x/y.png',
      hash: 'a'.repeat(64),
    });
  });
});
