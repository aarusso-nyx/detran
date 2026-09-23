// R-0012 TASK-0014 (Inspector, iteração restrita 3). CTG-0002b.md §6/§8 — C-2B-61 (3 L2),
// C-2B-83. `features/arquivo/pages/*.page.ts` ainda não existem (TASK-0015): falha de módulo
// esperada.
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { describe, expect, it } from 'vitest';
import {
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
import { ArchiveFacade } from '../../data/facades/archive.facade';
import { PlaceholderPageComponent } from '../../shared/placeholder-page.component';
import { ArchiveSearchPageComponent } from './pages/archive-search.page';
import { SealedDossierPageComponent } from './pages/sealed-dossier.page';
import { RetentionQueuePageComponent } from './pages/retention-queue.page';
import { ARQUIVO_ROUTES } from './arquivo.routes';

function archiveFacadeStub() {
  return stubFacade<ArchiveFacade>()({
    busca: listFacadeStub([]),
    dossie: readSlotStub({ status: 'idle' }),
    retencao: listFacadeStub([]),
  });
}

async function activate(path: string, role: string) {
  const harness = await createRaitRouterHarness(
    pageProviders(role as never, [
      { provide: ArchiveFacade, useValue: archiveFacadeStub() },
    ]),
  );
  await harness.navigateByUrl(`/${substituteRouteParams(path)}`);
  return harness;
}

const PAGES: readonly { path: string; roles: string[]; component: unknown }[] =
  [
    {
      path: 'arquivo/busca',
      roles: ['rait-secretary', 'AUDITOR'],
      component: ArchiveSearchPageComponent,
    },
    {
      path: 'arquivo/casos/:id',
      roles: ['rait-secretary', 'AUDITOR'],
      component: SealedDossierPageComponent,
    },
    {
      path: 'arquivo/retencao',
      roles: ['rait-secretary'],
      component: RetentionQueuePageComponent,
    },
  ];

describe('arquivo — C-2B-61 (presença + ausência)', () => {
  PAGES.forEach(({ path, roles, component }) => {
    it(`dado "${path}" ativada com ${roles[0]} quando renderizada então o componente real e nenhum rait-placeholder-page`, async () => {
      const harness = await activate(path, roles[0]);
      const element = screenElement(harness);
      expect(element?.tagName.toLowerCase()).not.toBe('rait-placeholder-page');
      expect(harness.routeDebugElement?.componentInstance).toBeInstanceOf(
        component as never,
      );
    });

    const omitted = RAIT_ALL_ROLES.filter((role) => !roles.includes(role));
    it(`dado "${path}" ativada com ${omitted[0]} (omitido) quando navegada então /sem-permissao [negativo]`, async () => {
      await activate(path, omitted[0]);
      const router = TestBed.inject(Router);
      expect(new URL(router.url, 'http://localhost').pathname).toBe(
        '/sem-permissao',
      );
    });
  });
});

describe('arquivo.routes — C-2B-83', () => {
  it('dado ARQUIVO_ROUTES quando lido então os 3 paths mapeiam para os componentes reais; nenhum PlaceholderPageComponent', () => {
    const byPath = new Map(ARQUIVO_ROUTES.map((route) => [route.path, route]));
    for (const { path, component } of PAGES) {
      expect(byPath.get(path)?.component).toBe(component);
    }
    // A raiz de grupo `arquivo` (redirect) usa `PlaceholderPageComponent` por desenho
    // (`manifestRoute`, `core/manifest-routes.ts`) — só as 3 páginas L2 são checadas acima.
    for (const { path } of PAGES) {
      expect(byPath.get(path)?.component).not.toBe(PlaceholderPageComponent);
    }
  });
});
