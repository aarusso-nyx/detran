// R-0012 TASK-0014 (Inspector). CTG-0002b.md §6/§8 — C-2B-61 (10 abas planas, presença +
// ausência), C-2B-64 (layout), C-2B-68 (atalhos triage/inquiry), C-2B-83 (routes.ts × manifesto).
// `features/caso/pages/*.page.ts` ainda não existem (TASK-0015): falha de módulo esperada.
import { By } from '@angular/platform-browser';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { describe, expect, it } from 'vitest';
import {
  commandRunnerStub,
  listFacadeStub,
  pageProviders,
  readSlotStub,
  stubFacade,
} from '../../../testing/facade.stub';
import { CASE_IDS, fixtureCase } from '../../../testing/http-fixtures';
import {
  createRaitRouterHarness,
  screenElement,
  substituteRouteParams,
  FIXED_ENTITY_ID,
} from '../../../testing/router-harness';
import { RAIT_ALL_ROLES } from '../../../testing/route-manifest.fixture';
import { ShortcutService } from '../../core/shortcut.service';
import { CaseFacade } from '../../data/facades/case.facade';
import { PlaceholderPageComponent } from '../../shared/placeholder-page.component';
import { CaseLayoutPageComponent } from './pages/case-layout.page';
import { CaseSummaryPageComponent } from './pages/case-summary.page';
import { TriagePageComponent } from './pages/triage.page';
import { DossierPageComponent } from './pages/dossier.page';
import { InquiriesPageComponent } from './pages/inquiries.page';
import { DraftPageComponent } from './pages/draft.page';
import { CaseDecisionPageComponent } from './pages/case-decision.page';
import { DeadlinesPageComponent } from './pages/deadlines.page';
import { PartiesPageComponent } from './pages/parties.page';
import { CommunicationsPageComponent } from './pages/communications.page';
import { ImpedimentsPageComponent } from './pages/impediments.page';
import { HistoryPageComponent } from './pages/history.page';
import { CASO_ROUTES } from './caso.routes';

function caseFacadeStub() {
  return stubFacade<CaseFacade>()({
    caso: readSlotStub({
      status: 'ready',
      value: fixtureCase(CASE_IDS.EM_INSTRUCAO),
    }),
    partes: listFacadeStub([]),
    prazos: listFacadeStub([]),
    relogios: listFacadeStub([]),
    documentos: listFacadeStub([]),
    diligencias: listFacadeStub([]),
    minutas: listFacadeStub([]),
    admissibilidade: listFacadeStub([]),
    comunicacoes: listFacadeStub([]),
    eventos: listFacadeStub([]),
    impedimentos: listFacadeStub([]),
    decisao: listFacadeStub([]),
    provimentos: listFacadeStub([]),
    provimentosDecisao: (() => new Map()) as never,
    provimentosPrazo: (() => new Map()) as never,
    command: commandRunnerStub(),
  });
}

async function activate(path: string, role: string) {
  const harness = await createRaitRouterHarness(
    pageProviders(role as never, [
      { provide: CaseFacade, useValue: caseFacadeStub() },
    ]),
  );
  await harness.navigateByUrl(`/${substituteRouteParams(path)}`);
  return harness;
}

const FLAT_TABS: readonly {
  path: string;
  roles: string[];
  component: unknown;
}[] = [
  {
    path: 'casos/:id/resumo',
    roles: [...RAIT_ALL_ROLES],
    component: CaseSummaryPageComponent,
  },
  {
    path: 'casos/:id/triagem',
    roles: ['rait-analyst', 'rait-secretary'],
    component: TriagePageComponent,
  },
  {
    path: 'casos/:id/dossie',
    roles: [...RAIT_ALL_ROLES],
    component: DossierPageComponent,
  },
  {
    path: 'casos/:id/diligencias',
    roles: ['rait-analyst', 'rait-rapporteur'],
    component: InquiriesPageComponent,
  },
  {
    path: 'casos/:id/minuta',
    roles: ['rait-analyst'],
    component: DraftPageComponent,
  },
  {
    path: 'casos/:id/decisao',
    roles: ['rait-signing-authority'],
    component: CaseDecisionPageComponent,
  },
  {
    path: 'casos/:id/prazos',
    roles: [...RAIT_ALL_ROLES],
    component: DeadlinesPageComponent,
  },
  {
    path: 'casos/:id/partes',
    roles: ['rait-secretary', 'rait-analyst'],
    component: PartiesPageComponent,
  },
  {
    path: 'casos/:id/comunicacoes',
    roles: ['rait-secretary'],
    component: CommunicationsPageComponent,
  },
  {
    path: 'casos/:id/impedimentos',
    roles: ['rait-rapporteur', 'rait-chair'],
    component: ImpedimentsPageComponent,
  },
  {
    path: 'casos/:id/historico',
    roles: [...RAIT_ALL_ROLES],
    component: HistoryPageComponent,
  },
];

describe('caso — abas planas (C-2B-61)', () => {
  FLAT_TABS.forEach(({ path, roles, component }) => {
    it(`dado "${path}" ativada com ${roles[0]} quando renderizada então o componente da tabela §6.1 e nenhum rait-placeholder-page`, async () => {
      const harness = await activate(path, roles[0]);
      const element = harness.fixture.debugElement.query(
        By.directive(component as never),
      );
      expect(element).not.toBeNull();
      expect(
        harness.fixture.debugElement.query(By.css('rait-placeholder-page')),
      ).toBeNull();
    });

    const omitted = RAIT_ALL_ROLES.filter((role) => !roles.includes(role));
    if (omitted.length > 0) {
      it(`dado "${path}" ativada com ${omitted[0]} (omitido) quando navegada então /sem-permissao [negativo]`, async () => {
        await activate(path, omitted[0]);
        const router = TestBed.inject(Router);
        expect(new URL(router.url, 'http://localhost').pathname).toBe(
          '/sem-permissao',
        );
      });
    }
  });
});

describe('caso — layout (C-2B-64)', () => {
  it(`dado /casos/${FIXED_ENTITY_ID} com rait-analyst quando ativada então CaseLayoutPageComponent com rait-case-header, <nav aria-label="rait.nav.casos"> com 11 links, router-outlet, redireciona a .../triagem, e a aba renderiza TriagePageComponent com data-screen "T-03"; o layout não tem data-screen [negativo]`, async () => {
    const harness = await activate('casos/:id', 'rait-analyst');
    const layout = harness.fixture.debugElement.query(
      By.directive(CaseLayoutPageComponent),
    );
    expect(layout).not.toBeNull();
    expect(layout.nativeElement.hasAttribute('data-screen')).toBe(false);
    expect(
      layout.nativeElement.querySelector('rait-case-header'),
    ).not.toBeNull();
    const links = layout.nativeElement.querySelectorAll(
      'nav[aria-label="rait.nav.casos"] a',
    );
    expect(links).toHaveLength(11);

    const router = TestBed.inject(Router);
    expect(router.url).toBe(`/casos/${FIXED_ENTITY_ID}/triagem`);

    const tab = harness.fixture.debugElement.query(
      By.directive(TriagePageComponent),
    );
    expect(tab).not.toBeNull();
    expect(screenElement(harness)?.getAttribute('data-screen')).toBe('T-03');
  });
});

describe('caso — C-2B-68 (atalhos triage/inquiry no layout)', () => {
  it('dado o layout criado quando montado então "triage" e "inquiry" registrados; ao destruir, desregistrados [presença + ausência]', async () => {
    const harness = await activate('casos/:id', 'rait-analyst');
    const shortcuts = TestBed.inject(ShortcutService) as unknown as {
      handlers: Map<string, () => void>;
    };
    expect(shortcuts.handlers.has('triage')).toBe(true);
    expect(shortcuts.handlers.has('inquiry')).toBe(true);
    harness.fixture.destroy();
    expect(shortcuts.handlers.has('triage')).toBe(false);
    expect(shortcuts.handlers.has('inquiry')).toBe(false);
  });
});

describe('caso.routes — C-2B-83', () => {
  it('dado CASO_ROUTES quando lido então "casos/:id" → CaseLayoutPageComponent e as 11 abas → componentes reais; nenhum PlaceholderPageComponent nas abas', () => {
    const layout = CASO_ROUTES.find((route) => route.path === 'casos/:id');
    expect(layout?.component).toBe(CaseLayoutPageComponent);
    const tabs = layout?.children?.filter((child) => child.path !== '') ?? [];
    expect(tabs).toHaveLength(11);
    for (const tab of tabs) {
      expect(tab.component).not.toBe(PlaceholderPageComponent);
    }
  });
});
