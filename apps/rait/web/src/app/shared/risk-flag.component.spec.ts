// R-0012 TASK-0008 (Inspector). CTG-0002b.md §5.3, §8 (C-2B-36, 59 parcial) —
// `shared/risk-flag.component.ts` ainda não existe (TASK-0009): falha de módulo esperada.
import { TestBed } from '@angular/core/testing';
import { RiskFlagComponent } from './risk-flag.component';
import { tokenKey } from '../core/i18n-token-key';
import { RAIT_RISK_FLAGS } from '../data/models/tokens';
import { readAppCatalog } from '../../testing/kb';
import {
  buildTestCatalog,
  markerI18nModule,
  initializeMarkerI18n,
} from '../../testing/i18n-test-catalog';
import { expectA11yStateInvariants } from '../../testing/a11y-state.spec-helper';

const KEYS = [
  tokenKey('riskFlag', 'CRITICO'),
  'rait.common.clock',
  'rait.common.daysRemaining',
  'rait.common.ceilingOn',
] as const;

async function render(inputs: {
  flag: string;
  clockCode?: string | null;
  daysRemaining?: number | null;
  ceilingOn?: string | null;
}) {
  TestBed.configureTestingModule({
    imports: [RiskFlagComponent, markerI18nModule([...KEYS])],
  });
  await initializeMarkerI18n();
  const fixture = TestBed.createComponent(RiskFlagComponent);
  fixture.componentRef.setInput('flag', inputs.flag);
  fixture.componentRef.setInput('clockCode', inputs.clockCode ?? null);
  fixture.componentRef.setInput('daysRemaining', inputs.daysRemaining ?? null);
  fixture.componentRef.setInput('ceilingOn', inputs.ceilingOn ?? null);
  fixture.detectChanges();
  return fixture;
}

describe('RiskFlag (C-2B-36)', () => {
  it('dado { flag: "CRITICO", clockCode: "B", daysRemaining: 12 } então o texto contém tokenKey("riskFlag","CRITICO") E "rait.common.daysRemaining"{12} (nunca só cor), data-token "CRITICO", data-clock "B"', async () => {
    const fixture = await render({
      flag: 'CRITICO',
      clockCode: 'B',
      daysRemaining: 12,
    });
    const host: HTMLElement = fixture.nativeElement;
    const markers = buildTestCatalog([...KEYS]);
    expect(host.textContent).toContain(
      markers[tokenKey('riskFlag', 'CRITICO')],
    );
    expect(host.textContent).toContain(markers['rait.common.daysRemaining']);
    expect(host.getAttribute('data-token')).toBe('CRITICO');
    expect(host.getAttribute('data-clock')).toBe('B');
  });

  it('dado daysRemaining null e ceilingOn "2026-10-30" então "rait.common.ceilingOn" com a data', async () => {
    const fixture = await render({
      flag: 'ALERTA_N2',
      ceilingOn: '2026-10-30',
    });
    const markers = buildTestCatalog([...KEYS]);
    expect(fixture.nativeElement.textContent).toContain(
      markers['rait.common.ceilingOn'],
    );
  });

  it('dado cada um dos 6 RAIT_RISK_FLAGS quando renderizado então o texto do rótulo existe no catálogo', () => {
    const catalog = readAppCatalog();
    for (const flag of RAIT_RISK_FLAGS) {
      expect(catalog[tokenKey('riskFlag', flag)]).toBeTruthy();
    }
  });
});

describe('RiskFlag — a11y (C-2B-59)', () => {
  it('dado o componente renderizado (ready) quando expectA11yStateInvariants + axe então nenhuma violação serious/critical', async () => {
    const fixture = await render({ flag: 'SEM_RISCO' });
    await expectA11yStateInvariants(fixture.nativeElement);
  });
});
