// R-0012 TASK-0008 (Inspector). CTG-0002b.md §5.7, §8 (C-2B-40, 59 parcial) —
// `shared/document-uploader.component.ts` ainda não existe (TASK-0009): falha de módulo
// esperada.
import { TestBed } from '@angular/core/testing';
import { DocumentUploaderComponent } from './document-uploader.component';
import {
  markerI18nModule,
  initializeMarkerI18n,
} from '../../testing/i18n-test-catalog';
import { expectA11yStateInvariants } from '../../testing/a11y-state.spec-helper';

const KEYS = [
  'rait.common.documentKind',
  'rait.common.file',
  'rait.common.digitised',
  'rait.common.attach',
] as const;

async function render() {
  TestBed.configureTestingModule({
    imports: [DocumentUploaderComponent, markerI18nModule([...KEYS])],
  });
  await initializeMarkerI18n();
  const fixture = TestBed.createComponent(DocumentUploaderComponent);
  fixture.componentRef.setInput('origin', 'oficio');
  fixture.componentRef.setInput('kinds', ['ait', 'na']);
  fixture.detectChanges();
  return fixture;
}

describe('DocumentUploader (C-2B-40)', () => {
  it('dado origin "oficio" kinds ["ait","na"] quando enviado sem arquivo então erro inline com aria-describedby e nenhum submitted [negativo]; com arquivo então submitted = { kind, origin: "oficio", digitisedFromPaper, file }; nenhum kind tem atributo required (RN-RAIT-003) [negativo]', async () => {
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

    const fileInput =
      host.querySelector<HTMLInputElement>('input[type="file"]');
    expect(fileInput?.hasAttribute('required')).toBe(false);
    const kindSelect = host.querySelector<HTMLSelectElement>(
      'select[name="kind"]',
    );
    expect(kindSelect?.hasAttribute('required')).toBe(false);

    const file = new File(['x'], 'a.pdf', { type: 'application/pdf' });
    Object.defineProperty(fileInput, 'files', { value: [file] });
    fileInput?.dispatchEvent(new Event('change'));
    host.querySelector('form')?.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    expect(submitted).toMatchObject({ origin: 'oficio', file });
  });
});

describe('DocumentUploader — a11y (C-2B-59)', () => {
  it('dado o componente renderizado (ready, único estado) quando expectA11yStateInvariants + axe então nenhuma violação serious/critical', async () => {
    const fixture = await render();
    await expectA11yStateInvariants(fixture.nativeElement);
  });
});
