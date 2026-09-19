// R-0014 TASK-0008 (Inspector). `core/field-errors.directive.ts` (novo, contrato CTG-0003a
// §3.4) — `PortalFieldErrorsDirective` ainda não existe (TASK-0009): a importação falha com
// "Cannot find module" (estado esperado, §9 do contrato). Host de teste com um `<form
// portalFieldErrors>` e dois campos nomeados (`facts`, `grounds`), template inline (M3).
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PortalFieldErrorsDirective } from './field-errors.directive';

@Component({
  selector: 'portal-field-errors-host',
  standalone: true,
  imports: [PortalFieldErrorsDirective],
  template: `
    <form [portalFieldErrors]="fields()">
      <input name="facts" id="facts" />
      <span id="facts-error">erro de facts</span>
      <input name="grounds" id="grounds" />
      <span id="grounds-error">erro de grounds</span>
    </form>
  `,
})
class FieldErrorsHostComponent {
  readonly fields = signal<readonly string[]>([]);
}

function setup() {
  TestBed.configureTestingModule({ imports: [FieldErrorsHostComponent] });
  const fixture = TestBed.createComponent(FieldErrorsHostComponent);
  fixture.detectChanges();
  return fixture;
}

describe('PortalFieldErrorsDirective', () => {
  it("dado ['grounds'] então grounds tem aria-invalid e aria-describedby=grounds-error e recebe o foco; facts sem atributos; dado [] então atributos removidos", () => {
    // C-3a-36
    const fixture = setup();
    fixture.componentInstance.fields.set(['grounds']);
    fixture.detectChanges();
    const grounds: HTMLInputElement =
      fixture.nativeElement.querySelector('[name="grounds"]');
    const facts: HTMLInputElement =
      fixture.nativeElement.querySelector('[name="facts"]');
    expect(grounds.getAttribute('aria-invalid')).toBe('true');
    expect(grounds.getAttribute('aria-describedby')).toBe('grounds-error');
    expect(document.activeElement).toBe(grounds);
    expect(facts.hasAttribute('aria-invalid')).toBe(false);
    expect(facts.hasAttribute('aria-describedby')).toBe(false);

    fixture.componentInstance.fields.set([]);
    fixture.detectChanges();
    expect(grounds.hasAttribute('aria-invalid')).toBe(false);
    expect(grounds.hasAttribute('aria-describedby')).toBe(false);
  });

  it("dado ['grounds','facts'] então o foco vai a facts (primeiro na ordem do DOM)", () => {
    // C-3a-37
    const fixture = setup();
    fixture.componentInstance.fields.set(['grounds', 'facts']);
    fixture.detectChanges();
    const facts: HTMLInputElement =
      fixture.nativeElement.querySelector('[name="facts"]');
    expect(document.activeElement).toBe(facts);
  });
});
