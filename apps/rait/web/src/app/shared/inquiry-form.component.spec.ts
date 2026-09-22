// R-0012 TASK-0008 (Inspector). CTG-0002b.md §5.9, §8 (C-2B-42, 59 parcial) —
// `shared/inquiry-form.component.ts` ainda não existe (TASK-0009): falha de módulo esperada.
import { TestBed } from '@angular/core/testing';
import { InquiryFormComponent } from './inquiry-form.component';
import {
  markerI18nModule,
  initializeMarkerI18n,
} from '../../testing/i18n-test-catalog';
import { expectA11yStateInvariants } from '../../testing/a11y-state.spec-helper';

const KEYS = [
  'rait.common.addressee',
  'rait.common.addressee_requerente',
  'rait.common.addressee_orgao_autuador',
  'rait.common.subject',
  'rait.common.dueOn',
  'rait.action.open-inquiry',
] as const;

async function render() {
  TestBed.configureTestingModule({
    imports: [InquiryFormComponent, markerI18nModule([...KEYS])],
  });
  await initializeMarkerI18n();
  const fixture = TestBed.createComponent(InquiryFormComponent);
  fixture.detectChanges();
  return fixture;
}

describe('InquiryForm (C-2B-42)', () => {
  it('dado submetido sem subject então erro inline e nenhum submitted [negativo]; com addressee "orgao_autuador" e subject então submitted { addressee, subject, dueOn: null }', async () => {
    const fixture = await render();
    const host: HTMLElement = fixture.nativeElement;
    let submitted: unknown;
    fixture.componentInstance.submitted.subscribe((value: unknown) => {
      submitted = value;
    });

    host.querySelector('form')?.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    expect(host.querySelector('[aria-describedby]')).not.toBeNull();
    expect(submitted).toBeUndefined();

    const addressee = host.querySelector<HTMLSelectElement>(
      'select[name="addressee"]',
    );
    if (addressee) addressee.value = 'orgao_autuador';
    addressee?.dispatchEvent(new Event('change'));
    const subject = host.querySelector<HTMLInputElement>(
      'input[name="subject"]',
    );
    if (subject) subject.value = 'Assunto de teste';
    subject?.dispatchEvent(new Event('input'));
    host.querySelector('form')?.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    expect(submitted).toEqual({
      addressee: 'orgao_autuador',
      subject: 'Assunto de teste',
      dueOn: null,
    });
  });
});

describe('InquiryForm — a11y (C-2B-59)', () => {
  it('dado o componente renderizado (ready, único estado) quando expectA11yStateInvariants + axe então nenhuma violação serious/critical', async () => {
    const fixture = await render();
    await expectA11yStateInvariants(fixture.nativeElement);
  });
});
