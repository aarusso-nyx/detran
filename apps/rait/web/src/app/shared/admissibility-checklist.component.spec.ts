// R-0012 TASK-0008 (Inspector). CTG-0002b.md §5.8, §8 (C-2B-41, 59 parcial) —
// `shared/admissibility-checklist.component.ts` ainda não existe (TASK-0009): falha de módulo
// esperada.
import { TestBed } from '@angular/core/testing';
import { AdmissibilityChecklistComponent } from './admissibility-checklist.component';
import { RAIT_ADMISSIBILITY_CRITERIA } from '../data/models/tokens';
import {
  markerI18nModule,
  initializeMarkerI18n,
} from '../../testing/i18n-test-catalog';
import { expectA11yStateInvariants } from '../../testing/a11y-state.spec-helper';

const KEYS = [
  'rait.screens.casos-id-triagem.field.tempestividade',
  'rait.screens.casos-id-triagem.field.legitimidade',
  'rait.screens.casos-id-triagem.field.assinatura',
  'rait.screens.casos-id-triagem.field.pedido',
  'rait.common.pendingSource',
  'rait.common.yes',
  'rait.common.no',
] as const;

async function render(recorded: readonly unknown[] = []) {
  TestBed.configureTestingModule({
    imports: [AdmissibilityChecklistComponent, markerI18nModule([...KEYS])],
  });
  await initializeMarkerI18n();
  const fixture = TestBed.createComponent(AdmissibilityChecklistComponent);
  fixture.componentRef.setInput('recorded', recorded);
  fixture.componentRef.setInput('fieldLabelKeys', {
    tempestividade: KEYS[0],
    legitimidade: KEYS[1],
    assinatura: KEYS[2],
    pedido_compativel: KEYS[3],
  });
  fixture.detectChanges();
  return fixture;
}

describe('AdmissibilityChecklist (C-2B-41)', () => {
  it('dado recorded [tempestividade verdict false] então a linha tempestividade é somente leitura (sem input) com o veredito; as outras 3 têm radios + textarea; marcar "não" sem fundamento mantém data-complete false; preencher os 3 vereditos → model atualizado e data-complete true; ordem das 4 linhas = RAIT_ADMISSIBILITY_CRITERIA', async () => {
    const fixture = await render([
      {
        criterion: 'tempestividade',
        verdict: false,
        reason: null,
        evaluated_at: '2026-09-14T00:00:00-04:00',
      },
    ]);
    const host: HTMLElement = fixture.nativeElement;
    const rows = host.querySelectorAll('[data-criterion]');
    expect(
      Array.from(rows).map((row) => row.getAttribute('data-criterion')),
    ).toEqual([...RAIT_ADMISSIBILITY_CRITERIA]);

    const tempestividadeRow = host.querySelector(
      '[data-criterion="tempestividade"]',
    );
    expect(
      tempestividadeRow?.querySelector('input, textarea, select'),
    ).toBeNull();

    const legitimidadeRow = host.querySelector(
      '[data-criterion="legitimidade"]',
    );
    expect(
      legitimidadeRow?.querySelectorAll('input[type="radio"]').length,
    ).toBe(2);
    expect(legitimidadeRow?.querySelector('textarea')).not.toBeNull();

    expect(host.getAttribute('data-complete')).toBe('false');
  });
});

describe('AdmissibilityChecklist — a11y (C-2B-59)', () => {
  it('dado o componente renderizado (ready, único estado) quando expectA11yStateInvariants + axe então nenhuma violação serious/critical', async () => {
    const fixture = await render();
    await expectA11yStateInvariants(fixture.nativeElement);
  });
});
