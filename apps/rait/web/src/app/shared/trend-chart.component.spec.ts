// R-0012 TASK-0008 (Inspector). CTG-0002b.md §5.19, §8 (C-2B-53, 59 parcial) —
// `shared/trend-chart.component.ts` ainda não existe (TASK-0009): falha de módulo esperada.
import { TestBed } from '@angular/core/testing';
import { TrendChartComponent } from './trend-chart.component';
import {
  markerI18nModule,
  initializeMarkerI18n,
} from '../../testing/i18n-test-catalog';
import { expectA11yStateInvariants } from '../../testing/a11y-state.spec-helper';

const KEYS = [
  'rait.screens.gestao-producao.kpi.loaded',
  'rait.states.empty',
] as const;

async function render(series: readonly { on: string; value: number }[]) {
  // A10 item a: TestBed.resetTestingModule() antes de cada configureTestingModule — alguns
  // it's chamam render() mais de uma vez (estados diferentes no mesmo teste) e o Angular
  // lança 'Cannot configure the test module when the test module has already been
  // instantiated' na segunda chamada sem o reset.
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [TrendChartComponent, markerI18nModule([...KEYS])],
  });
  await initializeMarkerI18n();
  const fixture = TestBed.createComponent(TrendChartComponent);
  fixture.componentRef.setInput('labelKey', KEYS[0]);
  fixture.componentRef.setInput('series', series);
  fixture.detectChanges();
  return fixture;
}

describe('TrendChart (C-2B-53)', () => {
  it('dado 3 pontos então <figure> com svg aria-hidden e <table> com 3 linhas; série vazia → detran-empty-state', async () => {
    const fixture = await render([
      { on: '2026-09-01', value: 1 },
      { on: '2026-09-08', value: 2 },
      { on: '2026-09-14', value: 3 },
    ]);
    const host: HTMLElement = fixture.nativeElement;
    expect(host.querySelector('figure')).not.toBeNull();
    expect(host.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
    expect(host.querySelectorAll('table tbody tr').length).toBe(3);

    const empty = await render([]);
    expect(
      empty.nativeElement.querySelector('detran-empty-state'),
    ).not.toBeNull();
  });
});

describe('TrendChart — a11y (C-2B-59)', () => {
  it('dado o componente renderizado (ready, empty) quando expectA11yStateInvariants + axe então nenhuma violação serious/critical', async () => {
    const ready = await render([{ on: '2026-09-01', value: 1 }]);
    await expectA11yStateInvariants(ready.nativeElement);
    const empty = await render([]);
    await expectA11yStateInvariants(empty.nativeElement);
  });
});
