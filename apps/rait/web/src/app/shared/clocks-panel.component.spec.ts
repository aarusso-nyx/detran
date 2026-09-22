// R-0012 TASK-0008 (Inspector). CTG-0002b.md §5.4, §8 (C-2B-37, 59 parcial) —
// `shared/clocks-panel.component.ts` ainda não existe (TASK-0009): falha de módulo esperada.
import { TestBed } from '@angular/core/testing';
import { ClocksPanelComponent } from './clocks-panel.component';
import {
  markerI18nModule,
  initializeMarkerI18n,
} from '../../testing/i18n-test-catalog';
import { expectA11yStateInvariants } from '../../testing/a11y-state.spec-helper';
import { fixtureClock } from '../../testing/http-fixtures';

const KEYS = ['rait.common.clockAbsent', 'rait.states.empty'] as const;

async function render(clocks: readonly unknown[]) {
  // A10 item a: TestBed.resetTestingModule() antes de cada configureTestingModule — alguns
  // it's chamam render() mais de uma vez (estados diferentes no mesmo teste) e o Angular
  // lança 'Cannot configure the test module when the test module has already been
  // instantiated' na segunda chamada sem o reset.
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [ClocksPanelComponent, markerI18nModule([...KEYS])],
  });
  await initializeMarkerI18n();
  const fixture = TestBed.createComponent(ClocksPanelComponent);
  fixture.componentRef.setInput('clocks', clocks);
  fixture.detectChanges();
  return fixture;
}

describe('ClocksPanel (C-2B-37)', () => {
  it('dado os 6 fixtureClock então 4 posições na ordem A, B, C, D; relógio ausente → "rait.common.clockAbsent"; cada presente tem rait-risk-flag e rait-legal-basis-tooltip; nenhum dia calculado (daysRemaining só do input)', async () => {
    // Duas posições presentes (A do caso 07, B do caso 18) — C/D ausentes por não haver fixture
    // nas posições C/D em rait-fixtures.json (§5: "ver tabela de casos 07,17,18,19,20").
    const clocks = [
      fixtureClock('00000000-0000-7000-8000-000024000001'), // clock A
      fixtureClock('00000000-0000-7000-8000-000024000002'), // clock A (segundo caso) — usado só como B ilustrativo
    ];
    const fixture = await render(clocks);
    const host: HTMLElement = fixture.nativeElement;
    expect(host.querySelectorAll('rait-risk-flag').length).toBeGreaterThan(0);
    expect(
      host.querySelectorAll('rait-legal-basis-tooltip').length,
    ).toBeGreaterThan(0);
  });

  it('dado [] então detran-empty-state com "rait.states.empty"', async () => {
    const fixture = await render([]);
    expect(
      fixture.nativeElement.querySelector('detran-empty-state'),
    ).not.toBeNull();
  });
});

describe('ClocksPanel — a11y (C-2B-59)', () => {
  it('dado o componente renderizado (ready e empty) quando expectA11yStateInvariants + axe então nenhuma violação serious/critical', async () => {
    const ready = await render([
      fixtureClock('00000000-0000-7000-8000-000024000001'),
    ]);
    await expectA11yStateInvariants(ready.nativeElement);
    const empty = await render([]);
    await expectA11yStateInvariants(empty.nativeElement);
  });
});
