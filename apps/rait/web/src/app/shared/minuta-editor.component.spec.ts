// R-0012 TASK-0008 (Inspector). CTG-0002b.md §5.10, §8 (C-2B-43, 59 parcial) —
// `shared/minuta-editor.component.ts` ainda não existe (TASK-0009): falha de módulo esperada.
import { TestBed } from '@angular/core/testing';
import { MinutaEditorComponent } from './minuta-editor.component';
import {
  markerI18nModule,
  initializeMarkerI18n,
} from '../../testing/i18n-test-catalog';
import { expectA11yStateInvariants } from '../../testing/a11y-state.spec-helper';

const KEYS = [
  'rait.common.facts',
  'rait.common.grounds',
  'rait.common.ruling',
  'rait.common.author',
  'rait.common.draft_rascunho',
  'rait.common.draft_submetida',
] as const;

function draft(version: number, status: string) {
  return {
    id: `d-${version}`,
    version,
    status,
    submitted_at: null,
    case_id: 'c-1',
  };
}

async function render(versions: readonly unknown[] = []) {
  TestBed.configureTestingModule({
    imports: [MinutaEditorComponent, markerI18nModule([...KEYS])],
  });
  await initializeMarkerI18n();
  const fixture = TestBed.createComponent(MinutaEditorComponent);
  fixture.componentRef.setInput('versions', versions);
  fixture.detectChanges();
  return fixture;
}

describe('MinutaEditor (C-2B-43)', () => {
  it('dado versions [fixtureDraft ×2] então <ol> com 2 versões e status por "rait.common.draft_" + status; nenhum botão/texto de "rait.action.sign" [negativo]; submit com ruling null não emite; com facts/grounds/ruling emite MinutaContent', async () => {
    const fixture = await render([draft(1, 'rascunho'), draft(2, 'submetida')]);
    const host: HTMLElement = fixture.nativeElement;
    expect(host.querySelectorAll('ol > li').length).toBe(2);
    expect(host.textContent).not.toMatch(/sign/i);

    let submitted: unknown;
    fixture.componentInstance.submit.subscribe((value: unknown) => {
      submitted = value;
    });
    host
      .querySelector('button[type="submit"]')
      ?.dispatchEvent(new Event('click'));
    expect(submitted).toBeUndefined();

    const facts = host.querySelector<HTMLTextAreaElement>(
      'textarea[name="facts"]',
    );
    if (facts) facts.value = 'fatos';
    const grounds = host.querySelector<HTMLTextAreaElement>(
      'textarea[name="grounds"]',
    );
    if (grounds) grounds.value = 'fundamentos';
    const ruling = host.querySelector<HTMLSelectElement>(
      'select[name="ruling"]',
    );
    if (ruling) ruling.value = 'acolher';
    fixture.componentInstance.content.set({
      facts: 'fatos',
      grounds: 'fundamentos',
      ruling: 'acolher',
    });
    fixture.detectChanges();
    host
      .querySelector('button[type="submit"]')
      ?.dispatchEvent(new Event('click'));
    expect(submitted).toEqual({
      facts: 'fatos',
      grounds: 'fundamentos',
      ruling: 'acolher',
    });
  });
});

describe('MinutaEditor — a11y (C-2B-59)', () => {
  it('dado o componente renderizado (ready, único estado) quando expectA11yStateInvariants + axe então nenhuma violação serious/critical', async () => {
    const fixture = await render();
    await expectA11yStateInvariants(fixture.nativeElement);
  });
});
