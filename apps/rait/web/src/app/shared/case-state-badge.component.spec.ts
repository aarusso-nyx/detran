// R-0012 TASK-0008 (Inspector). CTG-0002b.md §5.1, §8 (C-2B-34, 59 parcial, 60) —
// `shared/case-state-badge.component.ts` ainda não existe (TASK-0009): falha de módulo
// esperada. `markerI18nModule` (C-2A-30) prova que nenhuma letra escapa do catálogo.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { TestBed } from '@angular/core/testing';
import { CaseStateBadgeComponent } from './case-state-badge.component';
import { tokenKey } from '../core/i18n-token-key';
import { RAIT_CASE_STATES } from '../data/models/tokens';
import { readAppCatalog } from '../../testing/kb';
import {
  buildTestCatalog,
  markerI18nModule,
  initializeMarkerI18n,
  withoutMarkers,
} from '../../testing/i18n-test-catalog';
import { expectA11yStateInvariants } from '../../testing/a11y-state.spec-helper';

const KEYS = [
  tokenKey('caseState', 'PRONTO_P_DECISAO'),
  'rait.instance.jari',
] as const;

async function render(state: string, instance: string | null = null) {
  TestBed.configureTestingModule({
    imports: [CaseStateBadgeComponent, markerI18nModule([...KEYS])],
  });
  await initializeMarkerI18n();
  const fixture = TestBed.createComponent(CaseStateBadgeComponent);
  fixture.componentRef.setInput('state', state);
  fixture.componentRef.setInput('instance', instance);
  fixture.detectChanges();
  return fixture;
}

describe('CaseStateBadge (C-2B-34)', () => {
  it('dado state "PRONTO_P_DECISAO" instance "jari" então o texto é o marcador de tokenKey("caseState","PRONTO_P_DECISAO") + "rait.instance.jari", host title/data-token = "PRONTO_P_DECISAO", data-instance "jari"; o token não aparece como texto [negativo]', async () => {
    const fixture = await render('PRONTO_P_DECISAO', 'jari');
    const host: HTMLElement = fixture.nativeElement;
    const markers = buildTestCatalog([...KEYS]);
    expect(host.textContent).toContain(
      markers[tokenKey('caseState', 'PRONTO_P_DECISAO')],
    );
    expect(host.textContent).toContain(markers['rait.instance.jari']);
    expect(host.getAttribute('title')).toBe('PRONTO_P_DECISAO');
    expect(host.getAttribute('data-token')).toBe('PRONTO_P_DECISAO');
    expect(host.getAttribute('data-instance')).toBe('jari');
    expect(withoutMarkers(host.textContent ?? '', [...KEYS])).not.toMatch(
      /[a-zA-Z]/,
    );
  });

  it('dado cada um dos 16 RAIT_CASE_STATES quando tokenKey("caseState", state) então a chave existe em readAppCatalog()', () => {
    const catalog = readAppCatalog();
    for (const state of RAIT_CASE_STATES) {
      expect(catalog[tokenKey('caseState', state)]).toBeTruthy();
    }
  });
});

describe('CaseStateBadge — a11y (C-2B-59)', () => {
  it('dado o componente renderizado (ready, único estado deste componente) quando expectA11yStateInvariants + axe então nenhuma violação serious/critical', async () => {
    const fixture = await render('ADMITIDO');
    await expectA11yStateInvariants(fixture.nativeElement);
  });
});

describe('shared/*.ts — sem aritmética/ordenação nem literal de token (C-2B-60) [negativo]', () => {
  it('dado o código-fonte de shared/*.ts quando varrido então não contém ".sort(", "new Date", "Date.now" nem literal estático dos nove namespaces de token', () => {
    const dir = join(__dirname);
    // Os nove namespaces são compostos por interpolação (nunca escritos como literal
    // "'rait.<ns>." de uma só vez neste arquivo) para que este PRÓPRIO spec não vire um falso
    // positivo de `i18n.spec.ts` C-2A-55 (que varre src/** por esse mesmo padrão).
    const TOKEN_NAMESPACES = [
      'caseState',
      'sessionState',
      'infractionState',
      'infractionSubstate',
      'riskFlag',
      'memberStatus',
      'orgState',
      'closureMotive',
      'timer',
    ];
    const forbidden = [
      '.sort(',
      'new Date',
      'Date.now',
      ...TOKEN_NAMESPACES.map((namespace) => `'rait.${namespace}.`),
    ];
    const offenders: string[] = [];
    for (const file of readdirSync(dir)) {
      if (!file.endsWith('.component.ts') && file !== 'route-screen.ts')
        continue;
      const text = readFileSync(join(dir, file), 'utf8');
      for (const pattern of forbidden) {
        if (text.includes(pattern)) offenders.push(`${file}: ${pattern}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
