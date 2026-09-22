// R-0012 TASK-0008 (Inspector). CTG-0002b.md §5.22, §8 (C-2B-56, 59 parcial) —
// `shared/legal-basis-tooltip.component.ts` ainda não existe (TASK-0009): falha de módulo
// esperada.
import { TestBed } from '@angular/core/testing';
import { LegalBasisTooltipComponent } from './legal-basis-tooltip.component';
import {
  markerI18nModule,
  initializeMarkerI18n,
} from '../../testing/i18n-test-catalog';
import { expectA11yStateInvariants } from '../../testing/a11y-state.spec-helper';

const KEYS = ['rait.common.legalBasis'] as const;

async function render(legalBasis: string) {
  // A10 item a: TestBed.resetTestingModule() antes de cada configureTestingModule — alguns
  // it's chamam render() mais de uma vez (estados diferentes no mesmo teste) e o Angular
  // lança 'Cannot configure the test module when the test module has already been
  // instantiated' na segunda chamada sem o reset.
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [LegalBasisTooltipComponent, markerI18nModule([...KEYS])],
  });
  await initializeMarkerI18n();
  const fixture = TestBed.createComponent(LegalBasisTooltipComponent);
  fixture.componentRef.setInput('legalBasis', legalBasis);
  fixture.detectChanges();
  return fixture;
}

describe('LegalBasisTooltip (C-2B-56)', () => {
  it('dado legalBasis "CTB art. 285 §6º" então botão com aria-describedby apontando ao role="tooltip" cujo texto é exatamente "CTB art. 285 §6º"; foco mostra, Escape oculta; data-legal-basis igual', async () => {
    const fixture = await render('CTB art. 285 §6º');
    const host: HTMLElement = fixture.nativeElement;
    const button = host.querySelector('button');
    const describedBy = button?.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    const tooltip = host.querySelector(`#${describedBy}`);
    expect(tooltip?.getAttribute('role')).toBe('tooltip');
    expect(tooltip?.textContent).toBe('CTB art. 285 §6º');
    expect(host.getAttribute('data-legal-basis')).toBe('CTB art. 285 §6º');

    button?.dispatchEvent(new Event('focus'));
    fixture.detectChanges();
    expect(tooltip?.classList.contains('hidden')).toBeFalsy();
    button?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
  });
});

describe('LegalBasisTooltip — a11y (C-2B-59)', () => {
  it('dado o componente renderizado (ready, único estado) quando expectA11yStateInvariants + axe então nenhuma violação serious/critical', async () => {
    const fixture = await render('CTB art. 285 §6º');
    await expectA11yStateInvariants(fixture.nativeElement);
  });
});
