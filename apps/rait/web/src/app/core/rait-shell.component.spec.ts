// R-0012 TASK-0005 (Inspector). Critérios C-2A-25…30 do contrato `CTG-0002a.md` §11 sobre
// `core/rait-shell.component.ts`, `core/shell-search.ts`, `core/title.strategy.ts`. Falha
// esperada nesta entrega: nenhum desses arquivos de produção existe ainda (TASK-0006).
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router, TitleStrategy } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NAVIGATION_FIXTURE } from '../../testing/route-manifest.fixture';
import { createSessionStub } from '../../testing/session.stub';
import {
  buildTestCatalog,
  markerI18nModule,
  initializeMarkerI18n,
  withoutMarkers,
} from '../../testing/i18n-test-catalog';
import { expectNoSeriousA11yViolations } from '../../testing/axe.spec-helper';
// Produção (TASK-0006): ainda não existe.
import { navigationFor, RaitShellComponent } from './rait-shell.component';
import { RaitShellSearch, type RaitShellSearchResult } from './shell-search';
import { RaitTitleStrategy } from './title.strategy';
import { RaitSessionFacade } from './session.facade';
// R-0012 TASK-0008 (Inspector, CTG-0002b.md §8 C-2B-84/85): substitui o `it` de C-2A-27 que
// exercitava `PendingShellSearch` — o contrato manda `CaseShellSearch` (`data/shell-search/`,
// ainda inexistente nesta entrega: TASK-0009) no lugar. `provideHttpClient`/
// `provideHttpClientTesting` porque `CaseShellSearch` faz uma requisição real via `CaseClient`.
// `CaseShellSearch` (e tudo que importa `data/list-query.ts`/`data/models`, TASK-0009) é
// carregado por `import()` DENTRO do `it` — nunca como import estático do arquivo — para que só
// esse `it` falhe enquanto o módulo não existe; um import estático aqui derrubaria a
// transformação do arquivo inteiro e quebraria C-2A-25…26/28…30, que continuam verdes hoje
// (regra "specs do CTG-0002a continuam verdes, exceto o it substituído").
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

describe('C-2A-25 — navigationFor × NAVIGATION_FIXTURE', () => {
  Object.entries(NAVIGATION_FIXTURE).forEach(([role, expected]) => {
    it(`dado navigationFor(["${role}"]) quando calculada então igual à fixture`, () => {
      expect(navigationFor([role])).toEqual(expected);
    });
  });

  it("dado navigationFor(['rait-secretary', 'rait-hr']) quando calculada então união sem repetição", () => {
    const result = navigationFor(['rait-secretary', 'rait-hr']);
    const secretary = NAVIGATION_FIXTURE['rait-secretary'];
    const hr = NAVIGATION_FIXTURE['rait-hr'];
    const expectedLinks = new Set([
      ...secretary.map((item) => item.link),
      ...hr.map((item) => item.link),
    ]);
    expect(new Set(result.map((item) => item.link))).toEqual(expectedLinks);
    expect(new Set(result.map((item) => item.link)).size).toBe(result.length);
  });

  it("dado navigationFor(['DPO']) quando calculada então []", () => {
    expect(navigationFor(['DPO'])).toEqual([]);
  });
});

const SHELL_KEYS = [
  'rait.shell.app_name',
  'rait.shell.search',
  'rait.shell.search_placeholder',
  'rait.shell.theme_toggle',
  'rait.shell.shortcuts_title',
  'rait.a11y.skip_to_content',
  'rait.nav.painel',
  'rait.nav.fila',
  'rait.instance.jari',
  'rait.instance.cetran',
  'rait.states.unavailable_in_version',
  'rait.states.not_found',
] as const;

async function renderShell(options: {
  roles: readonly string[];
  search?: RaitShellSearch;
}) {
  const session = createSessionStub({ active: true, roles: options.roles });
  TestBed.configureTestingModule({
    imports: [RaitShellComponent, markerI18nModule([...SHELL_KEYS])],
    providers: [
      provideRouter([{ path: '**', children: [] }]),
      { provide: RaitSessionFacade, useValue: session },
      ...(options.search
        ? [{ provide: RaitShellSearch, useValue: options.search }]
        : []),
    ],
  });
  await initializeMarkerI18n();
  const fixture = TestBed.createComponent(RaitShellComponent);
  fixture.detectChanges();
  return fixture;
}

describe('C-2A-26 — RaitShellComponent renderizado (rait-analyst)', () => {
  it('dado sessão rait-analyst quando renderizado então applicationName, navigation traduzidos e link de skip primeiro', async () => {
    const fixture = await renderShell({ roles: ['rait-analyst'] });
    const shell = fixture.debugElement.query(By.css('detran-app-shell'));
    expect(shell.componentInstance.applicationName).toBe(
      buildTestCatalog([...SHELL_KEYS])['rait.shell.app_name'],
    );
    const nav = shell.componentInstance.navigation as readonly {
      label: string;
      link: string;
    }[];
    expect(nav.map((item) => item.link)).toEqual(['/painel', '/fila/defesa']);

    const skipLink = fixture.nativeElement.querySelector('a');
    expect(skipLink?.textContent).toContain(
      buildTestCatalog([...SHELL_KEYS])['rait.a11y.skip_to_content'],
    );
    expect(skipLink?.getAttribute('href')).toBe('#detran-content');
  });

  it('dado sessão rait-rapporteur quando renderizado então itens de fila/colegiado com órgão têm label + rait.instance.<orgao>', async () => {
    const fixture = await renderShell({ roles: ['rait-rapporteur'] });
    const shell = fixture.debugElement.query(By.css('detran-app-shell'));
    const nav = shell.componentInstance.navigation as readonly {
      label: string;
      link: string;
    }[];
    const filaJari = nav.find((item) => item.link === '/fila/recurso/jari');
    expect(filaJari?.label).toContain(
      buildTestCatalog([...SHELL_KEYS])['rait.nav.fila'],
    );
    expect(filaJari?.label).toContain(
      buildTestCatalog([...SHELL_KEYS])['rait.instance.jari'],
    );
  });
});

describe('C-2A-27 — busca do shell', () => {
  // C-2B-84/85: substitui o `it` que exercitava `PendingShellSearch` — o shell agora recebe
  // `CaseShellSearch` (produção `data/shell-search/case-shell-search.ts`, TASK-0009), que busca
  // via `CaseClient` (`GET /v1/inf/rait/cases`). Submeter um protocolo existente navega a
  // `/casos/<id>`; o comportamento de "unavailable" (banner) deixou de existir — a busca real
  // devolve `{ kind: 'case' }` ou `{ kind: 'none' }` (C-2A-2x do shell continua verde com o novo
  // provider).
  it('dado o shell com CaseShellSearch provido quando o formulário de busca é submetido com um protocolo existente então router navega a /casos/<id>', async () => {
    // `data/shell-search/case-shell-search.ts` ainda não existe (TASK-0009) — `import()`
    // dinâmico para que só este `it` falhe (ver comentário no topo do arquivo). O caso 07
    // (`rait-fixtures.json` "cases": id `00000000-0000-7000-8000-000010000007`, protocol
    // `RAIT-2026-000007`) é citado aqui como literal, não via `http-fixtures.ts`, porque aquele
    // arquivo importa `data/list-query.ts` (também TASK-0009) e derrubaria este import dinâmico
    // junto — nenhum valor inventado: os dois campos vêm da mesma linha da fixture canônica.
    const CASE_07_ID = '00000000-0000-7000-8000-000010000007';
    // Especificador montado em runtime (nunca um literal estático no `import(...)`): o plugin
    // `vite:import-analysis` do Vitest resolve e falha na TRANSFORMAÇÃO de um `import('literal')`
    // dinâmico do mesmo jeito que um `import` estático — só um especificador não-literal escapa
    // dessa resolução antecipada e falha (como esperado) apenas quando este `it` executa.
    const caseShellSearchModulePath = [
      '..',
      'data',
      'shell-search',
      'case-shell-search',
    ].join('/');
    const { CaseShellSearch } = await import(caseShellSearchModulePath);

    const session = createSessionStub({
      active: true,
      roles: ['rait-analyst'],
    });
    TestBed.configureTestingModule({
      imports: [RaitShellComponent, markerI18nModule([...SHELL_KEYS])],
      providers: [
        provideRouter([{ path: '**', children: [] }]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: RaitSessionFacade, useValue: session },
        { provide: RaitShellSearch, useClass: CaseShellSearch },
      ],
    });
    await initializeMarkerI18n();
    const fixture = TestBed.createComponent(RaitShellComponent);
    fixture.detectChanges();

    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const httpMock = TestBed.inject(HttpTestingController);

    const input: HTMLInputElement = fixture.nativeElement.querySelector(
      'form[role="search"] input',
    );
    input.value = 'RAIT-2026-000007';
    input.dispatchEvent(new Event('input'));
    fixture.nativeElement
      .querySelector('form[role="search"]')
      .dispatchEvent(new Event('submit'));

    const req = await vi.waitFor(() =>
      httpMock.expectOne({ method: 'GET', url: '/v1/inf/rait/cases' }),
    );
    req.flush([{ id: CASE_07_ID, protocol_number: 'RAIT-2026-000007' }]);
    await fixture.whenStable();
    expect(navigateSpy).toHaveBeenCalledWith(['/casos', CASE_07_ID]);
    httpMock.verify();
  });

  it('dado stub resolvendo { kind: "case", caseId: "c1" } quando submetido então navega para /casos/c1', async () => {
    class ResolvingSearch extends RaitShellSearch {
      async search(): Promise<RaitShellSearchResult> {
        return { kind: 'case', caseId: 'c1' };
      }
    }
    const fixture = await renderShell({
      roles: ['rait-analyst'],
      search: new ResolvingSearch(),
    });
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.nativeElement
      .querySelector('form[role="search"]')
      .dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    expect(navigateSpy).toHaveBeenCalledWith(['/casos', 'c1']);
  });

  it('dado stub resolvendo { kind: "none" } quando submetido então banner "not_found"', async () => {
    class NoneSearch extends RaitShellSearch {
      async search(): Promise<RaitShellSearchResult> {
        return { kind: 'none' };
      }
    }
    const fixture = await renderShell({
      roles: ['rait-analyst'],
      search: new NoneSearch(),
    });
    fixture.nativeElement
      .querySelector('form[role="search"]')
      .dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain(
      buildTestCatalog([...SHELL_KEYS])['rait.states.not_found'],
    );
  });
});

describe('C-2A-28 — alternância de tema (localStorage rait.theme)', () => {
  beforeEach(() => {
    localStorage.removeItem('rait.theme');
    delete document.documentElement.dataset['detranTheme'];
  });

  it('dado tema atual claro quando o botão de tema é clicado então documentElement.dataset.detranTheme = "dark" e localStorage atualizado', async () => {
    const fixture = await renderShell({ roles: ['rait-analyst'] });
    const button: HTMLButtonElement | undefined = Array.from<HTMLButtonElement>(
      fixture.nativeElement.querySelectorAll('button'),
    ).find((candidate) => candidate.hasAttribute('aria-label'));
    expect(button).toBeDefined();
    button?.click();
    fixture.detectChanges();
    expect(document.documentElement.dataset['detranTheme']).toBe('dark');
    expect(localStorage.getItem('rait.theme')).toBe('dark');
  });

  it('dado localStorage["rait.theme"] = "dark" na criação quando renderizado então tema dark é aplicado', async () => {
    localStorage.setItem('rait.theme', 'dark');
    await renderShell({ roles: ['rait-analyst'] });
    expect(document.documentElement.dataset['detranTheme']).toBe('dark');
  });

  it('dado localStorage["rait.theme"] = "x" (valor inválido) quando renderizado então ignorado (sem tema forçado)', async () => {
    localStorage.setItem('rait.theme', 'x');
    await renderShell({ roles: ['rait-analyst'] });
    expect(document.documentElement.dataset['detranTheme']).not.toBe('x');
  });
});

describe('C-2A-29 — RaitTitleStrategy', () => {
  it('dado uma rota com title "rait.screens.painel.title" quando ativada então document.title = "<texto> — <sufixo>"', async () => {
    TestBed.configureTestingModule({
      imports: [
        markerI18nModule([
          'rait.screens.painel.title',
          'rait.shell.title_suffix',
        ]),
      ],
      providers: [
        provideRouter([
          { path: 'painel', title: 'rait.screens.painel.title', children: [] },
        ]),
        { provide: TitleStrategy, useClass: RaitTitleStrategy },
      ],
    });
    await initializeMarkerI18n();
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/painel');
    const catalog = buildTestCatalog([
      'rait.screens.painel.title',
      'rait.shell.title_suffix',
    ]);
    expect(document.title).toBe(
      `${catalog['rait.screens.painel.title']} — ${catalog['rait.shell.title_suffix']}`,
    );
  });

  it('dado uma rota sem title quando ativada então document.title = só o sufixo', async () => {
    TestBed.configureTestingModule({
      imports: [markerI18nModule(['rait.shell.title_suffix'])],
      providers: [
        provideRouter([{ path: 'sem-titulo', children: [] }]),
        { provide: TitleStrategy, useClass: RaitTitleStrategy },
      ],
    });
    await initializeMarkerI18n();
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/sem-titulo');
    const catalog = buildTestCatalog(['rait.shell.title_suffix']);
    expect(document.title).toBe(catalog['rait.shell.title_suffix']);
  });
});

describe('C-2A-30 — shell sem literal fora do catálogo, sem violação de a11y', () => {
  it('dado o shell renderizado com o catálogo de marcadores quando lido então withoutMarkers não contém letras, em light e dark', async () => {
    const fixture = await renderShell({ roles: ['rait-analyst'] });
    const text = fixture.nativeElement.textContent ?? '';
    const stripped = withoutMarkers(text, [...SHELL_KEYS]);
    expect(/[a-zA-ZÀ-ÿ]/.test(stripped)).toBe(false);
    await expectNoSeriousA11yViolations(fixture.nativeElement);

    document.documentElement.dataset['detranTheme'] = 'dark';
    fixture.detectChanges();
    await expectNoSeriousA11yViolations(fixture.nativeElement);
  });
});
