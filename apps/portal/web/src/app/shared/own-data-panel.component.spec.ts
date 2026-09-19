// R-0014 TASK-0017 (Inspector). CTG-0003c §5.5 — `OwnDataPanelComponent`; arquivo inteiramente
// novo (§1) — "Cannot find module" até TASK-0018 (esperado, §9).
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { StynxI18nModule, StynxI18nService } from '@stynx-nyx/angular-i18n';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import portalCatalog from '../i18n/portal.pt-BR.json';
import { OwnDataPanelComponent } from './own-data-panel.component'; // §9.
import { expectNoSeriousA11yViolations } from '../a11y/axe.spec-helper';

const catalog = portalCatalog as Record<string, string>;

const SECTIONS_FIXTURE = [
  {
    key: 'cadastro',
    titleKey: 'portal.shell.nav.autos',
    route: '/autos',
    fields: [
      {
        name: 'cpf',
        labelKey: 'portal.forms.meus_dados.campo.cpf',
        value: '12345678901',
        category: 'consulta' as const,
        source: 'RENACH',
        correctable: true,
      },
    ],
  },
];

async function setup(sections: readonly unknown[] = SECTIONS_FIXTURE) {
  await TestBed.configureTestingModule({
    imports: [
      OwnDataPanelComponent,
      StynxI18nModule.forRoot({
        defaultLocale: 'pt-BR',
        loadCatalog: async () => catalog,
      }),
    ],
    providers: [provideRouter([{ path: '**', children: [] }])],
  }).compileComponents();
  await TestBed.inject(StynxI18nService).initialize();
  const fixture = TestBed.createComponent(OwnDataPanelComponent);
  fixture.componentRef.setInput('sections', sections);
  fixture.detectChanges();
  return { fixture, element: fixture.nativeElement as HTMLElement };
}

describe('OwnDataPanelComponent — dado sem máscara (§5.5; RN-118; RN-121 1)', () => {
  it('dado campo cpf correctable então o <dd> contém exatamente 12345678901 [negativo: nenhum *] e o botão corrigir ao lado emite { section, field }', async () => {
    // C-3c-94 (1.ª parte)
    const { fixture, element } = await setup();
    const dd = element.querySelector('dd[data-field="cpf"]');
    expect(dd?.textContent?.trim()).toBe('12345678901');
    expect(dd?.textContent).not.toContain('*');
    const captured: unknown[] = [];
    (fixture.componentInstance as any).correctRequested.subscribe(
      (value: unknown) => captured.push(value),
    );
    const correctButton = element.querySelector<HTMLButtonElement>(
      '[data-correct][data-field="cpf"]',
    );
    expect(correctButton).not.toBeNull();
    correctButton!.dispatchEvent(new Event('click', { bubbles: true }));
    expect(captured).toEqual([{ section: 'cadastro', field: 'cpf' }]);
  });

  it('dado suppressedNoticeKey então o texto do motivo é visível', async () => {
    // C-3c-94 (2.ª parte)
    const { element: suppressed } = await setup([
      {
        ...SECTIONS_FIXTURE[0],
        suppressedNoticeKey: 'portal.errors.crash_third_party_data_restricted',
      },
    ]);
    expect(suppressed.textContent).toContain(
      catalog['portal.errors.crash_third_party_data_restricted'],
    );
  });
});

describe('OwnDataPanelComponent — análise estática (§5.5; RN-121) [negativo]', () => {
  it('dado o código de own-data-panel.component.ts então não contém portabilidade nem replace(/\\d/…)/***', async () => {
    // C-3c-95
    const dir = dirname(fileURLToPath(import.meta.url));
    let source = '';
    try {
      source = await readFile(join(dir, 'own-data-panel.component.ts'), 'utf8');
    } catch {
      return; // arquivo ainda não existe (§9).
    }
    expect(/portabilidade/i.test(source)).toBe(false);
    expect(source.includes('***')).toBe(false);
    expect(/replace\(\s*\/\\d/.test(source)).toBe(false);
  });
});

describe('OwnDataPanelComponent — a11y por estado (§5.5/§7.3 — cobertura integral)', () => {
  it('dado uma seção com dado correctable então axe sem violação serious/critical', async () => {
    const { element } = await setup();
    await expectNoSeriousA11yViolations(element);
  });

  it('dado seções vazias então axe sem violação serious/critical', async () => {
    const { element } = await setup([]);
    await expectNoSeriousA11yViolations(element);
  });

  it('dado suppressedNoticeKey (supressão anunciada) então axe sem violação serious/critical', async () => {
    const { element } = await setup([
      {
        ...SECTIONS_FIXTURE[0],
        suppressedNoticeKey: 'portal.errors.crash_third_party_data_restricted',
      },
    ]);
    await expectNoSeriousA11yViolations(element);
  });
});
