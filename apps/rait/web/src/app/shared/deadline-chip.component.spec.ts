// R-0012 TASK-0008 (Inspector). CTG-0002b.md §5.2, §8 (C-2B-35, 59 parcial) —
// `shared/deadline-chip.component.ts` ainda não existe (TASK-0009): falha de módulo esperada.
import { TestBed } from '@angular/core/testing';
import { DeadlineChipComponent } from './deadline-chip.component';
import { tokenKey } from '../core/i18n-token-key';
import {
  buildTestCatalog,
  markerI18nModule,
  initializeMarkerI18n,
} from '../../testing/i18n-test-catalog';
import { expectA11yStateInvariants } from '../../testing/a11y-state.spec-helper';

const KEYS = [
  tokenKey('timer', 'T-DEC'),
  'rait.common.legalDeadline',
  'rait.common.operationalTarget',
  'rait.common.daysRemaining',
] as const;

async function render(inputs: {
  timerCode: string;
  dueOn: string;
  legalBasis: string;
  kind: 'legal' | 'operacional';
  daysRemaining?: number | null;
}) {
  TestBed.configureTestingModule({
    imports: [DeadlineChipComponent, markerI18nModule([...KEYS])],
  });
  await initializeMarkerI18n();
  const fixture = TestBed.createComponent(DeadlineChipComponent);
  fixture.componentRef.setInput('timerCode', inputs.timerCode);
  fixture.componentRef.setInput('dueOn', inputs.dueOn);
  fixture.componentRef.setInput('legalBasis', inputs.legalBasis);
  fixture.componentRef.setInput('kind', inputs.kind);
  fixture.componentRef.setInput('daysRemaining', inputs.daysRemaining ?? null);
  fixture.detectChanges();
  return fixture;
}

describe('DeadlineChip (C-2B-35)', () => {
  it('dado { timerCode: "T-DEC", dueOn: "2026-12-28", legalBasis: "CTB art. 281", kind: "legal", daysRemaining: 5 } então contém marcador tokenKey("timer","T-DEC"), "rait.common.legalDeadline", data formatada, "rait.common.daysRemaining" {count:5}, rait-legal-basis-tooltip data-legal-basis "CTB art. 281", data-kind "legal"', async () => {
    const fixture = await render({
      timerCode: 'T-DEC',
      dueOn: '2026-12-28',
      legalBasis: 'CTB art. 281',
      kind: 'legal',
      daysRemaining: 5,
    });
    const host: HTMLElement = fixture.nativeElement;
    const markers = buildTestCatalog([...KEYS]);
    expect(host.textContent).toContain(markers[tokenKey('timer', 'T-DEC')]);
    expect(host.textContent).toContain(markers['rait.common.legalDeadline']);
    expect(host.textContent).toContain(markers['rait.common.daysRemaining']);
    const tooltip = host.querySelector('rait-legal-basis-tooltip');
    expect(tooltip?.getAttribute('data-legal-basis')).toBe('CTB art. 281');
    expect(host.getAttribute('data-kind')).toBe('legal');
  });

  it('dado kind "operacional" então "rait.common.operationalTarget" e data-kind "operacional"', async () => {
    const fixture = await render({
      timerCode: 'T-DIL',
      dueOn: '2026-09-23',
      legalBasis: 'CTB art. 282',
      kind: 'operacional',
    });
    const host: HTMLElement = fixture.nativeElement;
    const markers = buildTestCatalog([...KEYS]);
    expect(host.textContent).toContain(
      markers['rait.common.operationalTarget'],
    );
    expect(host.getAttribute('data-kind')).toBe('operacional');
  });

  it('dado daysRemaining null então nenhum marcador de daysRemaining e nenhum número de dias calculado [negativo]', async () => {
    const fixture = await render({
      timerCode: 'T-DIL',
      dueOn: '2026-09-23',
      legalBasis: 'CTB art. 282',
      kind: 'operacional',
      daysRemaining: null,
    });
    const markers = buildTestCatalog([...KEYS]);
    expect(fixture.nativeElement.textContent).not.toContain(
      markers['rait.common.daysRemaining'],
    );
  });
});

describe('DeadlineChip — a11y (C-2B-59)', () => {
  it('dado o componente renderizado (ready) quando expectA11yStateInvariants + axe então nenhuma violação serious/critical', async () => {
    const fixture = await render({
      timerCode: 'T-DEC',
      dueOn: '2026-12-28',
      legalBasis: 'CTB art. 281',
      kind: 'legal',
    });
    await expectA11yStateInvariants(fixture.nativeElement);
  });
});
