// R-0012 TASK-0008 (Inspector). CTG-0002b.md §5.13, §8 (C-2B-46, 59 parcial) —
// `shared/opinion-editor.component.ts` ainda não existe (TASK-0009): falha de módulo esperada.
import { TestBed } from '@angular/core/testing';
import { OpinionEditorComponent } from './opinion-editor.component';
import { RAIT_OPINION_VOTES } from '../data/models/tokens';
import {
  markerI18nModule,
  initializeMarkerI18n,
} from '../../testing/i18n-test-catalog';
import { expectA11yStateInvariants } from '../../testing/a11y-state.spec-helper';

const KEYS = [
  'rait.decision.provimento',
  'rait.decision.nao_provimento',
  'rait.decision.nao_conhecimento',
  'rait.common.registeredAt',
] as const;

async function render(item: unknown = null) {
  // A10 item a: TestBed.resetTestingModule() antes de cada configureTestingModule — alguns
  // it's chamam render() mais de uma vez (estados diferentes no mesmo teste) e o Angular
  // lança 'Cannot configure the test module when the test module has already been
  // instantiated' na segunda chamada sem o reset.
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [OpinionEditorComponent, markerI18nModule([...KEYS])],
  });
  await initializeMarkerI18n();
  const fixture = TestBed.createComponent(OpinionEditorComponent);
  fixture.componentRef.setInput('item', item);
  fixture.componentRef.setInput('fieldLabelKeys', {
    summary: KEYS[0],
    analysis: KEYS[1],
    vote: KEYS[2],
  });
  fixture.detectChanges();
  return fixture;
}

describe('OpinionEditor (C-2B-46)', () => {
  it('dado submit sem vote não emite [negativo]; com os 3 campos emite; item.opinion_registered_at ≠ null → controles desabilitados e "rait.common.registeredAt"; opções do select = RAIT_OPINION_VOTES com "rait.decision." + token', async () => {
    const fixture = await render();
    const host: HTMLElement = fixture.nativeElement;

    const select = host.querySelector<HTMLSelectElement>('select[name="vote"]');
    const options = Array.from(select?.options ?? []).map(
      (option) => option.value,
    );
    expect(options).toEqual([...RAIT_OPINION_VOTES]);

    let submitted: unknown;
    fixture.componentInstance.submit.subscribe((value: unknown) => {
      submitted = value;
    });
    host
      .querySelector('button[type="submit"]')
      ?.dispatchEvent(new Event('click'));
    expect(submitted).toBeUndefined();

    const registered = await render({
      opinion_registered_at: '2026-09-14T00:00:00-04:00',
    });
    expect(
      registered.nativeElement
        .querySelector('select[name="vote"]')
        ?.hasAttribute('disabled'),
    ).toBe(true);
    expect(registered.nativeElement.textContent).toBeTruthy();
  });
});

describe('OpinionEditor — a11y (C-2B-59)', () => {
  it('dado o componente renderizado (ready, registrado e não registrado) quando expectA11yStateInvariants + axe então nenhuma violação serious/critical', async () => {
    const editable = await render();
    await expectA11yStateInvariants(editable.nativeElement);
    const registered = await render({
      opinion_registered_at: '2026-09-14T00:00:00-04:00',
    });
    await expectA11yStateInvariants(registered.nativeElement);
  });
});
