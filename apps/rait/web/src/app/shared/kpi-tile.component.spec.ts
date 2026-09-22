// R-0012 TASK-0008 (Inspector). CTG-0002b.md §5.19, §8 (C-2B-53, 59 parcial) —
// `shared/kpi-tile.component.ts` ainda não existe (TASK-0009): falha de módulo esperada.
import { TestBed } from '@angular/core/testing';
import { KpiTileComponent } from './kpi-tile.component';
import {
  markerI18nModule,
  initializeMarkerI18n,
} from '../../testing/i18n-test-catalog';
import { expectA11yStateInvariants } from '../../testing/a11y-state.spec-helper';

const KEYS = [
  'rait.screens.gestao-producao.kpi.loaded',
  'rait.common.operationalTarget',
  'rait.common.legalDeadline',
  'rait.common.pendingSource',
] as const;

async function render(inputs: {
  value: number | null;
  target?: number | null;
  ceiling?: number | null;
}) {
  // A10 item a: TestBed.resetTestingModule() antes de cada configureTestingModule — alguns
  // it's chamam render() mais de uma vez (estados diferentes no mesmo teste) e o Angular
  // lança 'Cannot configure the test module when the test module has already been
  // instantiated' na segunda chamada sem o reset.
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [KpiTileComponent, markerI18nModule([...KEYS])],
  });
  await initializeMarkerI18n();
  const fixture = TestBed.createComponent(KpiTileComponent);
  fixture.componentRef.setInput('labelKey', KEYS[0]);
  fixture.componentRef.setInput('value', inputs.value);
  fixture.componentRef.setInput('target', inputs.target ?? null);
  fixture.componentRef.setInput('ceiling', inputs.ceiling ?? null);
  fixture.detectChanges();
  return fixture;
}

describe('KpiTile (C-2B-53)', () => {
  it('dado { value: 12, target: 30, ceiling: 24 } então três elementos distintos (valor, data-role="target" com "rait.common.operationalTarget", data-role="ceiling" com "rait.common.legalDeadline"); value null → "—" + "rait.common.pendingSource"', async () => {
    const fixture = await render({ value: 12, target: 30, ceiling: 24 });
    const host: HTMLElement = fixture.nativeElement;
    expect(host.textContent).toContain('12');
    const target = host.querySelector('[data-role="target"]');
    const ceiling = host.querySelector('[data-role="ceiling"]');
    expect(target?.textContent).toContain('operationalTarget');
    expect(ceiling?.textContent).toContain('legalDeadline');
    expect(target).not.toBe(ceiling);

    const empty = await render({ value: null });
    expect(empty.nativeElement.textContent).toContain('—');
    expect(empty.nativeElement.textContent).toContain('pendingSource');
  });
});

describe('KpiTile — a11y (C-2B-59)', () => {
  it('dado o componente renderizado (ready, único estado) quando expectA11yStateInvariants + axe então nenhuma violação serious/critical', async () => {
    const fixture = await render({ value: 12 });
    await expectA11yStateInvariants(fixture.nativeElement);
  });
});
