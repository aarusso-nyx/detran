// PortalFieldErrorsDirective (contrato CTG-0003a §3.4; catálogo §8 "400 com fields[]"): na tag
// `<form>`, marca cada controle `[name]` cujo nome está em `fields[]` com `aria-invalid="true"` e
// `aria-describedby="<name>-error"` (o elemento `id="<name>-error"` é do template do formulário e
// mostra `portal.errors.validation_failed` até existirem mensagens por campo — OD-P62); remove os
// atributos quando o campo sai da lista; ao passar de vazio para não vazio, foca o PRIMEIRO campo
// inválido na ordem do DOM. Nomes de campo em inglês, como no corpo do ato (`driver.cpf`).
import {
  Directive,
  ElementRef,
  afterRenderEffect,
  inject,
  input,
  untracked,
} from '@angular/core';

@Directive({ selector: 'form[portalFieldErrors]' })
export class PortalFieldErrorsDirective {
  private readonly form = inject<ElementRef<HTMLFormElement>>(ElementRef);
  private previousFields: readonly string[] = [];

  /** `fields[]` do erro 400/422 (nomes dos campos como no corpo do ato). */
  readonly portalFieldErrors = input.required<readonly string[]>();

  constructor() {
    afterRenderEffect(() => {
      const fields = this.portalFieldErrors();
      untracked(() => this.apply(fields));
    });
  }

  private apply(fields: readonly string[]): void {
    const invalid = new Set(fields);
    const controls = Array.from(
      this.form.nativeElement.querySelectorAll<HTMLElement>('[name]'),
    );
    let first: HTMLElement | null = null;
    for (const control of controls) {
      const name = control.getAttribute('name') ?? '';
      if (invalid.has(name)) {
        control.setAttribute('aria-invalid', 'true');
        control.setAttribute('aria-describedby', `${name}-error`);
        first ??= control;
      } else {
        control.removeAttribute('aria-invalid');
        control.removeAttribute('aria-describedby');
      }
    }
    if (this.previousFields.length === 0 && fields.length > 0) first?.focus();
    this.previousFields = fields;
  }
}
