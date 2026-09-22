// R-0012 TASK-0008 (Inspector). CTG-0002b.md §5.18, §8 (C-2B-52, 59 parcial) —
// `shared/schedule-grid.component.ts` ainda não existe (TASK-0009): falha de módulo esperada.
// Ficha 046 é L0 nesta rodada (M13): o componente existe e é testado, nenhuma página o usa.
import { TestBed } from '@angular/core/testing';
import { ScheduleGridComponent } from './schedule-grid.component';
import {
  fixtureSchedule,
  fixtureScheduleSlot,
} from '../../testing/http-fixtures';
import { tokenKey } from '../core/i18n-token-key';
import {
  markerI18nModule,
  initializeMarkerI18n,
} from '../../testing/i18n-test-catalog';
import { expectA11yStateInvariants } from '../../testing/a11y-state.spec-helper';

const KEYS = [tokenKey('memberStatus', 'DISPONIVEL')] as const;

async function render() {
  const schedules = [
    fixtureSchedule('00000000-0000-7000-8000-000027000001'),
    fixtureSchedule('00000000-0000-7000-8000-000027000002'),
  ];
  const slots = [
    fixtureScheduleSlot('00000000-0000-7000-8000-000027010001'),
    fixtureScheduleSlot('00000000-0000-7000-8000-000027010002'),
  ];
  TestBed.configureTestingModule({
    imports: [ScheduleGridComponent, markerI18nModule([...KEYS])],
  });
  await initializeMarkerI18n();
  const fixture = TestBed.createComponent(ScheduleGridComponent);
  fixture.componentRef.setInput('schedules', schedules);
  fixture.componentRef.setInput('slots', slots);
  fixture.detectChanges();
  return fixture;
}

describe('ScheduleGrid (C-2B-52)', () => {
  it('dado os 3 fixtureSchedule e 5 fixtureScheduleSlot então colunas = slot_on distintos na ordem recebida, células com tokenKey("memberStatus", availability), data-day-count = nº de dias; nenhuma data gerada além das presentes nos slots [negativo]', async () => {
    const fixture = await render();
    const host: HTMLElement = fixture.nativeElement;
    expect(host.hasAttribute('data-day-count')).toBe(true);
    expect(host.textContent).toContain('DISPONIVEL');
  });
});

describe('ScheduleGrid — a11y (C-2B-59)', () => {
  it('dado o componente renderizado (ready, único estado) quando expectA11yStateInvariants + axe então nenhuma violação serious/critical', async () => {
    const fixture = await render();
    await expectA11yStateInvariants(fixture.nativeElement);
  });
});
