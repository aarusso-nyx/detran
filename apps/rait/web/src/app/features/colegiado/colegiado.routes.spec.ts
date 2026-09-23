// R-0012 TASK-0014 (Inspector, iteração restrita 2). CTG-0002b.md §6/§8 — C-2B-61 (11 páginas
// planas do colegiado, presença + ausência), C-2B-83. `features/colegiado/pages/*.page.ts` ainda
// não existem (TASK-0015): falha de módulo esperada.
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
import {
  createRaitRouterHarness,
  screenElement,
  substituteRouteParams,
} from '../../../testing/router-harness';
import { RAIT_ALL_ROLES } from '../../../testing/route-manifest.fixture';
import { SessionFacade } from '../../data/facades/session.facade';
import { BatchesPageComponent } from './pages/batches.page';
import { BatchDetailPageComponent } from './pages/batch-detail.page';
import { RapporteurCasesPageComponent } from './pages/rapporteur-cases.page';
import { OpinionPageComponent } from './pages/opinion.page';
import { AgendaBuilderPageComponent } from './pages/agenda-builder.page';
import { SessionsPageComponent } from './pages/sessions.page';
import { LiveSessionPageComponent } from './pages/live-session.page';
import { BenchPageComponent } from './pages/bench.page';
import { MinutesPageComponent } from './pages/minutes.page';
import { ViewsPageComponent } from './pages/views.page';
import { ExtraordinaryPageComponent } from './pages/extraordinary.page';
import { COLEGIADO_ROUTES } from './colegiado.routes';

function sessionFacadeStub() {
  return stubFacade<SessionFacade>()({
    sessoes: listFacadeStub([]),
    sessao: readSlotStub({ status: 'idle' }),
    lotes: listFacadeStub([]),
    lote: readSlotStub({ status: 'idle' }),
    relatoria: listFacadeStub([]),
    pautaCandidatos: listFacadeStub([]),
    vistas: listFacadeStub([]),
    extraordinaria: listFacadeStub([]),
    semRelator: listFacadeStub([]),
    itemDoCaso: readSlotStub({ status: 'idle' }),
    suplentes: listFacadeStub([]),
    pautaCandidatosRelogios: (() => new Map()) as never,
    extraordinariaCasos: (() => new Map()) as never,
    command: commandRunnerStub(),
  });
}

async function activate(path: string, role: string) {
  const harness = await createRaitRouterHarness(
    pageProviders(role as never, [
      { provide: SessionFacade, useValue: sessionFacadeStub() },
    ]),
  );
  await harness.navigateByUrl(`/${substituteRouteParams(path)}`);
  return harness;
}

const PAGES: readonly {
  path: string;
  screen: string;
  roles: string[];
  component: unknown;
}[] = [
  {
    path: 'colegiado/:orgao/distribuicao',
    screen: 'T-09',
    roles: ['rait-chair', 'rait-secretary'],
    component: BatchesPageComponent,
  },
  {
    path: 'colegiado/:orgao/distribuicao/:loteId',
    screen: '',
    roles: ['rait-chair', 'rait-secretary'],
    component: BatchDetailPageComponent,
  },
  {
    path: 'colegiado/:orgao/relatoria',
    screen: 'T-10',
    roles: ['rait-rapporteur'],
    component: RapporteurCasesPageComponent,
  },
  {
    path: 'colegiado/:orgao/relatoria/:caseId/voto',
    screen: 'T-10',
    roles: ['rait-rapporteur'],
    component: OpinionPageComponent,
  },
  {
    path: 'colegiado/:orgao/pauta',
    screen: 'T-11',
    roles: ['rait-chair'],
    component: AgendaBuilderPageComponent,
  },
  {
    path: 'colegiado/:orgao/sessoes',
    screen: '',
    roles: ['rait-chair', 'rait-secretary', 'rait-rapporteur'],
    component: SessionsPageComponent,
  },
  {
    path: 'colegiado/:orgao/sessoes/:id',
    screen: 'T-12',
    roles: ['rait-rapporteur', 'rait-chair', 'rait-secretary'],
    component: LiveSessionPageComponent,
  },
  {
    path: 'colegiado/:orgao/sessoes/:id/banca',
    screen: '',
    roles: ['rait-secretary', 'rait-chair'],
    component: BenchPageComponent,
  },
  {
    path: 'colegiado/:orgao/sessoes/:id/ata',
    screen: 'T-13',
    roles: ['rait-secretary', 'rait-chair'],
    component: MinutesPageComponent,
  },
  {
    path: 'colegiado/:orgao/vistas',
    screen: '',
    roles: ['rait-chair', 'rait-rapporteur'],
    component: ViewsPageComponent,
  },
  {
    path: 'colegiado/:orgao/extraordinaria',
    screen: '',
    roles: ['rait-chair'],
    component: ExtraordinaryPageComponent,
  },
];

describe('colegiado — C-2B-61 (presença, papel mínimo)', () => {
  PAGES.forEach(({ path, screen, roles, component }) => {
    it(`dado "${path}" ativada com ${roles[0]} quando renderizada então o componente da tabela §6.1 com data-screen "${screen}"`, async () => {
      const harness = await activate(path, roles[0]);
      const element = screenElement(harness);
      expect(element?.tagName.toLowerCase()).not.toBe('rait-placeholder-page');
      expect(element?.getAttribute('data-screen')).toBe(screen);
      expect(harness.routeDebugElement?.componentInstance).toBeInstanceOf(
        component as never,
      );
    });
  });
});

describe('colegiado — C-2B-61 (ausência: papel canônico omitido) [negativo]', () => {
  PAGES.forEach(({ path, roles }) => {
    const omitted = RAIT_ALL_ROLES.filter((role) => !roles.includes(role));
    it(`dado "${path}" ativada com ${omitted[0]} (omitido) quando navegada então /sem-permissao`, async () => {
      await activate(path, omitted[0]);
      const router = TestBed.inject(Router);
      expect(new URL(router.url, 'http://localhost').pathname).toBe(
        '/sem-permissao',
      );
    });
  });
});

describe('colegiado.routes — C-2B-83', () => {
  it('dado COLEGIADO_ROUTES quando lido então os 11 paths mapeiam para os componentes reais; nenhum PlaceholderPageComponent nos L2', () => {
    const byPath = new Map(
      COLEGIADO_ROUTES.map((route) => [route.path, route]),
    );
    for (const { path, component } of PAGES) {
      expect(byPath.get(path)?.component).toBe(component);
    }
  });
});
