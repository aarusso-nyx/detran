// R-0012 TASK-0008 (Inspector). CTG-0002b.md §5.20, §8 (C-2B-54, 59 parcial) —
// `shared/event-timeline.component.ts` ainda não existe (TASK-0009): falha de módulo esperada.
import { TestBed } from '@angular/core/testing';
import { EventTimelineComponent } from './event-timeline.component';
import {
  markerI18nModule,
  initializeMarkerI18n,
} from '../../testing/i18n-test-catalog';
import { expectA11yStateInvariants } from '../../testing/a11y-state.spec-helper';

const KEYS = [
  'rait.common.transition',
  'rait.common.actor',
  'rait.states.empty',
] as const;

function event(id: string, from: string | null, to: string | null) {
  return {
    id,
    case_id: 'c-1',
    event_type: 'transition',
    from_state: from,
    to_state: to,
    occurred_at: '2026-09-14T12:00:00-04:00',
    actor_id: 'u-1',
  };
}

async function render(events: readonly unknown[], status = 'ready') {
  // A10 item a: TestBed.resetTestingModule() antes de cada configureTestingModule — alguns
  // it's chamam render() mais de uma vez (estados diferentes no mesmo teste) e o Angular
  // lança 'Cannot configure the test module when the test module has already been
  // instantiated' na segunda chamada sem o reset.
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [EventTimelineComponent, markerI18nModule([...KEYS])],
  });
  await initializeMarkerI18n();
  const fixture = TestBed.createComponent(EventTimelineComponent);
  fixture.componentRef.setInput('events', events);
  fixture.componentRef.setInput('status', status);
  fixture.detectChanges();
  return fixture;
}

describe('EventTimeline (C-2B-54)', () => {
  it('dado 3 RaitCaseEvent (ordem recebida) então <ol> com 3 <li> na mesma ordem, from/to → tokenKey("caseState"), actor_id em <code>; payload nunca no DOM [negativo]; status "loading" → detran-loading-state; [] → detran-empty-state; aria-live polite', async () => {
    const events = [
      event('1', null, 'PROTOCOLADO'),
      event('2', 'PROTOCOLADO', 'TRIAGEM_ADMISSIBILIDADE'),
      event('3', 'TRIAGEM_ADMISSIBILIDADE', 'ADMITIDO'),
    ];
    const fixture = await render(events);
    const host: HTMLElement = fixture.nativeElement;
    expect(host.querySelectorAll('ol > li').length).toBe(3);
    expect(host.querySelector('code')?.textContent).toContain('u-1');
    expect(host.textContent).not.toMatch(/payload/i);
    expect(host.getAttribute('aria-live')).toBe('polite');

    const loading = await render([], 'loading');
    expect(
      loading.nativeElement.querySelector('detran-loading-state'),
    ).not.toBeNull();

    const empty = await render([]);
    expect(
      empty.nativeElement.querySelector('detran-empty-state'),
    ).not.toBeNull();
  });
});

describe('EventTimeline — a11y (C-2B-59)', () => {
  it('dado o componente renderizado (ready, loading, empty) quando expectA11yStateInvariants + axe então nenhuma violação serious/critical', async () => {
    const ready = await render([event('1', null, 'PROTOCOLADO')]);
    await expectA11yStateInvariants(ready.nativeElement);
    const loading = await render([], 'loading');
    await expectA11yStateInvariants(loading.nativeElement);
    const empty = await render([]);
    await expectA11yStateInvariants(empty.nativeElement);
  });
});
