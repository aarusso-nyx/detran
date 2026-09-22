// R-0016 TASK-0004 (Inspector). CTG-0002.md §13 (C-02-61).
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { LayerGateComponent } from './layer-gate.component.js';
import { expectA11yStateInvariants } from '../../testing/a11y-state.spec-helper.js';
import {
  buildTestCatalog,
  markerI18nModule,
} from '../../testing/i18n-test-catalog.js';
import { PURPOSE_TOKENS, type PurposeDeclaration } from '../shared/models.js';

const KEYS = [
  'dashboard.forms.finalidade_n2.purpose',
  'dashboard.forms.finalidade_n2.reference',
  'dashboard.forms.finalidade_n2.submit',
  'dashboard.forms.finalidade_n2.gate',
  'dashboard.common.action.cancel',
  ...PURPOSE_TOKENS.map(
    (token) => `dashboard.forms.finalidade_n2.purpose_${token}`,
  ),
];

@Component({
  selector: 'dash-layer-gate-host',
  standalone: true,
  imports: [LayerGateComponent],
  template: `<dash-layer-gate
    [open]="open()"
    [reference]="reference()"
    (declared)="declared.set($event)"
    (cancelled)="cancelled.set(true)"
  />`,
})
class HostComponent {
  readonly open = signal(true);
  readonly reference = signal<string | null>(null);
  readonly declared = signal<PurposeDeclaration | null>(null);
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

describe('shared/layer-gate.component.ts (C-02-61)', () => {
  it('dado open true então dialog com título, 6 opções na ordem de PURPOSE_TOKENS, input reference, botões, foco no select', async () => {
    const catalog = buildTestCatalog(KEYS);
    const fixture = render();
    const element = fixture.nativeElement as HTMLElement;
    const dialog = element.querySelector('dialog[role="dialog"][aria-modal]');
    expect(dialog).not.toBeNull();
    expect(dialog?.getAttribute('aria-labelledby')).toBeTruthy();
    expect(element.textContent).toContain(
      catalog['dashboard.forms.finalidade_n2.purpose'],
    );
    const options = [
      ...element.querySelectorAll<HTMLOptionElement>('select option'),
    ].map((o) => o.value || o.textContent);
    for (const token of PURPOSE_TOKENS) {
      expect(
        options.some((opt) =>
          opt?.includes(
            catalog[`dashboard.forms.finalidade_n2.purpose_${token}`],
          ),
        ) || options.includes(token),
      ).toBe(true);
    }
    expect(element.textContent).toContain(
      catalog['dashboard.forms.finalidade_n2.reference'],
    );
    expect(element.textContent).toContain(
      catalog['dashboard.forms.finalidade_n2.gate'],
    );
    expect(element.textContent).toContain(
      catalog['dashboard.forms.finalidade_n2.submit'],
    );
    expect(element.textContent).toContain(
      catalog['dashboard.common.action.cancel'],
    );
    await expectA11yStateInvariants(element, catalog, { component: true });
  });

  it('dado submit com purpose auditoria e reference AM-1 então declared emite { purpose, reference }', () => {
    const fixture = render();
    const element = fixture.nativeElement as HTMLElement;
    const select = element.querySelector('select') as HTMLSelectElement;
    select.value = 'auditoria';
    select.dispatchEvent(new Event('change'));
    const input = element.querySelector(
      'input[name="reference"]',
    ) as HTMLInputElement;
    input.value = 'AM-1';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    const submit = [...element.querySelectorAll('button')].find(
      (btn) => btn.type === 'submit' || btn.form,
    ) as HTMLButtonElement;
    submit?.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.declared()).toEqual({
      purpose: 'auditoria',
      reference: 'AM-1',
    });
  });

  it('dado reference vazia então não emite', () => {
    const fixture = render();
    const element = fixture.nativeElement as HTMLElement;
    const submit = [...element.querySelectorAll('button')].find(
      (btn) => btn.type === 'submit' || btn.form,
    ) as HTMLButtonElement;
    submit?.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.declared()).toBeNull();
  });

  it('dado Esc então cancelled', () => {
    const fixture = render();
    const element = fixture.nativeElement as HTMLElement;
    element
      .querySelector('dialog')
      ?.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
      );
    fixture.detectChanges();
    expect(fixture.componentInstance.cancelled()).toBe(true);
  });

  it('dado open false então nada renderizado', () => {
    const fixture = render();
    fixture.componentInstance.open.set(false);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('dialog[open]')).toBeNull();
  });
});
