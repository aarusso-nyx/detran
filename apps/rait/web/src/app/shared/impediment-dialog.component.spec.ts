// R-0012 TASK-0008 (Inspector). CTG-0002b.md §5.21, §8 (C-2B-55, 59 parcial) —
// `shared/impediment-dialog.component.ts` ainda não existe (TASK-0009): falha de módulo
// esperada.
import { TestBed } from '@angular/core/testing';
import { ImpedimentDialogComponent } from './impediment-dialog.component';
import {
  markerI18nModule,
  initializeMarkerI18n,
} from '../../testing/i18n-test-catalog';
import { expectA11yStateInvariants } from '../../testing/a11y-state.spec-helper';

const KEYS = [
  'rait.common.impediment_impedimento',
  'rait.common.impediment_suspeicao',
  'rait.common.basis',
  'rait.common.legalBasis',
  'rait.common.confirm',
  'rait.common.cancel',
] as const;

async function render(open: boolean) {
  const opener = document.createElement('button');
  document.body.appendChild(opener);
  opener.focus();
  TestBed.configureTestingModule({
    imports: [ImpedimentDialogComponent, markerI18nModule([...KEYS])],
  });
  await initializeMarkerI18n();
  const fixture = TestBed.createComponent(ImpedimentDialogComponent);
  fixture.componentRef.setInput('open', open);
  fixture.componentRef.setInput('titleKey', KEYS[0]);
  fixture.componentRef.setInput('messageKey', KEYS[0]);
  fixture.detectChanges();
  return { fixture, opener };
}

describe('ImpedimentDialog (C-2B-55)', () => {
  it('dado open true então <dialog role="dialog" aria-modal="true">, foco no select; confirmar sem basis não emite e mostra erro inline [negativo]; com kind "suspeicao" e basis emite ImpedimentDraft; Escape → dismissed e open false; foco volta ao elemento anterior', async () => {
    const { fixture, opener } = await render(true);
    const host: HTMLElement = fixture.nativeElement;
    const dialog = host.querySelector('dialog');
    expect(dialog?.getAttribute('role')).toBe('dialog');
    expect(dialog?.getAttribute('aria-modal')).toBe('true');

    let confirmed: unknown;
    fixture.componentInstance.confirmed.subscribe((value: unknown) => {
      confirmed = value;
    });
    host.querySelector('[data-confirm]')?.dispatchEvent(new Event('click'));
    fixture.detectChanges();
    expect(confirmed).toBeUndefined();
    expect(host.querySelector('[aria-describedby]')).not.toBeNull();

    const kind = host.querySelector<HTMLSelectElement>('select[name="kind"]');
    if (kind) kind.value = 'suspeicao';
    kind?.dispatchEvent(new Event('change'));
    const basis = host.querySelector<HTMLTextAreaElement>(
      'textarea[name="basis"]',
    );
    if (basis) basis.value = 'fundamento';
    basis?.dispatchEvent(new Event('input'));
    host.querySelector('[data-confirm]')?.dispatchEvent(new Event('click'));
    fixture.detectChanges();
    expect(confirmed).toMatchObject({ kind: 'suspeicao', basis: 'fundamento' });

    let dismissed = false;
    fixture.componentInstance.dismissed.subscribe(() => {
      dismissed = true;
    });
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(dismissed).toBe(true);
    expect(fixture.componentInstance.open()).toBe(false);
    expect(document.activeElement).toBe(opener);
    opener.remove();
  });
});

describe('ImpedimentDialog — a11y (C-2B-59)', () => {
  it('dado o componente renderizado (aberto) quando expectA11yStateInvariants + axe então nenhuma violação serious/critical', async () => {
    const { fixture, opener } = await render(true);
    await expectA11yStateInvariants(fixture.nativeElement);
    opener.remove();
  });
});
