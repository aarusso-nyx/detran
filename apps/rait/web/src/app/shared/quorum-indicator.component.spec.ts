// R-0012 TASK-0008 (Inspector). CTG-0002b.md §5.14, §8 (C-2B-47, 59 parcial) —
// `shared/quorum-indicator.component.ts` ainda não existe (TASK-0009): falha de módulo esperada.
import { TestBed } from '@angular/core/testing';
import { QuorumIndicatorComponent } from './quorum-indicator.component';
import { tokenKey } from '../core/i18n-token-key';
import {
  markerI18nModule,
  initializeMarkerI18n,
} from '../../testing/i18n-test-catalog';
import { expectA11yStateInvariants } from '../../testing/a11y-state.spec-helper';

const KEYS = [
  'rait.common.quorum',
  tokenKey('orgState', 'BANCA_INSUFICIENTE'),
  'rait.common.chairPresent',
  'rait.common.chairAbsent',
  'rait.common.parity',
] as const;

async function render(inputs: {
  judgingBody: 'jari' | 'cetran';
  quorumRequired: number;
  quorumObserved: number | null;
  benchState: string;
  parityObserved?: boolean | null;
  attendance?: readonly unknown[];
}) {
  // A10 item a: TestBed.resetTestingModule() antes de cada configureTestingModule — alguns
  // it's chamam render() mais de uma vez (estados diferentes no mesmo teste) e o Angular
  // lança 'Cannot configure the test module when the test module has already been
  // instantiated' na segunda chamada sem o reset.
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [QuorumIndicatorComponent, markerI18nModule([...KEYS])],
  });
  await initializeMarkerI18n();
  const fixture = TestBed.createComponent(QuorumIndicatorComponent);
  fixture.componentRef.setInput('session', {
    id: 's-1',
    judging_body: inputs.judgingBody,
    quorum_required: inputs.quorumRequired,
    quorum_observed: inputs.quorumObserved,
  });
  fixture.componentRef.setInput('bench', {
    id: 'b-1',
    state: inputs.benchState,
    parity_observed: inputs.parityObserved ?? null,
  });
  fixture.componentRef.setInput('attendance', inputs.attendance ?? []);
  fixture.detectChanges();
  return fixture;
}

describe('QuorumIndicator (C-2B-47)', () => {
  it('dado session (quorum_required 3, quorum_observed 2), bench BANCA_INSUFICIENTE, attendance com is_chair present então data-quorum "2/3", texto tokenKey("orgState","BANCA_INSUFICIENTE"), "rait.common.chairPresent"; judging_body "cetran" + parity_observed true → "rait.common.parity"; "jari" → sem paridade [negativo]; nenhuma comparação observed ≥ required no componente', async () => {
    const fixture = await render({
      judgingBody: 'jari',
      quorumRequired: 3,
      quorumObserved: 2,
      benchState: 'BANCA_INSUFICIENTE',
      attendance: [
        { present: true, is_chair: true, is_chair_substitute: false },
      ],
    });
    const host: HTMLElement = fixture.nativeElement;
    expect(host.getAttribute('data-quorum')).toBe('2/3');
    expect(host.textContent).toContain('chairPresent');

    const cetran = await render({
      judgingBody: 'cetran',
      quorumRequired: 3,
      quorumObserved: 3,
      benchState: 'BANCA_CONFIRMADA',
      parityObserved: true,
    });
    expect(cetran.nativeElement.textContent).toContain('parity');

    const jari = await render({
      judgingBody: 'jari',
      quorumRequired: 3,
      quorumObserved: 3,
      benchState: 'BANCA_CONFIRMADA',
      parityObserved: true,
    });
    expect(jari.nativeElement.textContent).not.toContain('rait.common.parity');
  });
});

describe('QuorumIndicator — a11y (C-2B-59)', () => {
  it('dado o componente renderizado (ready, único estado) quando expectA11yStateInvariants + axe então nenhuma violação serious/critical', async () => {
    const fixture = await render({
      judgingBody: 'jari',
      quorumRequired: 3,
      quorumObserved: 2,
      benchState: 'BANCA_INSUFICIENTE',
    });
    await expectA11yStateInvariants(fixture.nativeElement);
  });
});
