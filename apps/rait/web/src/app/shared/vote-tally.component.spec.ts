// R-0012 TASK-0008 (Inspector). CTG-0002b.md §5.15, §8 (C-2B-48, 59 parcial) —
// `shared/vote-tally.component.ts` ainda não existe (TASK-0009): falha de módulo esperada.
import { TestBed } from '@angular/core/testing';
import { VoteTallyComponent } from './vote-tally.component';
import { tokenKey } from '../core/i18n-token-key';
import {
  markerI18nModule,
  initializeMarkerI18n,
} from '../../testing/i18n-test-catalog';
import { expectA11yStateInvariants } from '../../testing/a11y-state.spec-helper';

const KEYS = [
  'rait.decision.provimento',
  'rait.decision.nao_provimento',
  'rait.decision.abstencao',
  'rait.action.casting-vote',
  'rait.decision.provido',
  tokenKey('sessionState', 'DESEMPATE_PRESIDENTE'),
] as const;

function vote(member: string, value: string, casting = false) {
  return {
    id: `v-${member}`,
    agenda_item_id: 'a-1',
    member_id: member,
    vote: value,
    casting_vote: casting,
    cast_at: '2026-09-14T00:00:00-04:00',
  };
}

async function render(inputs: {
  outcome: string | null;
  votes: readonly unknown[];
  sessionState: string;
}) {
  // A10 item a: TestBed.resetTestingModule() antes de cada configureTestingModule — alguns
  // it's chamam render() mais de uma vez (estados diferentes no mesmo teste) e o Angular
  // lança 'Cannot configure the test module when the test module has already been
  // instantiated' na segunda chamada sem o reset.
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [VoteTallyComponent, markerI18nModule([...KEYS])],
  });
  await initializeMarkerI18n();
  const fixture = TestBed.createComponent(VoteTallyComponent);
  fixture.componentRef.setInput('item', {
    id: 'a-1',
    session_id: 's-1',
    case_id: 'c-1',
    outcome: inputs.outcome,
  });
  fixture.componentRef.setInput('votes', inputs.votes);
  fixture.componentRef.setInput('sessionState', inputs.sessionState);
  fixture.detectChanges();
  return fixture;
}

describe('VoteTally (C-2B-48)', () => {
  it('dado item (outcome "provido") + 4 votos (1 casting_vote) + sessionState "DECISAO_PROCLAMADA" então stynx-table com 4 linhas, "rait.action.casting-vote" na linha do voto de qualidade, resultado "rait.decision.provido"; sessionState "DESEMPATE_PRESIDENTE" → tokenKey visível; nenhum cálculo de maioria (sem outcome → sem resultado) [negativo]', async () => {
    const votes = [
      vote('m1', 'provimento'),
      vote('m2', 'provimento'),
      vote('m3', 'nao_provimento'),
      vote('m4', 'provimento', true),
    ];
    const fixture = await render({
      outcome: 'provido',
      votes,
      sessionState: 'DECISAO_PROCLAMADA',
    });
    const host: HTMLElement = fixture.nativeElement;
    expect(host.querySelector('stynx-table')).not.toBeNull();
    expect(host.textContent).toContain('casting-vote');
    expect(host.textContent).toContain('provido');

    const desempate = await render({
      outcome: null,
      votes,
      sessionState: 'DESEMPATE_PRESIDENTE',
    });
    expect(desempate.nativeElement.textContent).toContain(
      'DESEMPATE_PRESIDENTE',
    );
    // sem outcome → sem resultado renderizado [negativo]
    expect(desempate.nativeElement.textContent).not.toContain(
      'rait.decision.provido',
    );
  });
});

describe('VoteTally — a11y (C-2B-59)', () => {
  it('dado o componente renderizado (ready, único estado) quando expectA11yStateInvariants + axe então nenhuma violação serious/critical', async () => {
    const fixture = await render({
      outcome: 'provido',
      votes: [vote('m1', 'provimento')],
      sessionState: 'DECISAO_PROCLAMADA',
    });
    await expectA11yStateInvariants(fixture.nativeElement);
  });
});
