// R-0012 TASK-0014 (Inspector, iteração restrita 2). CTG-0002b.md §6/§8 — C-2B-61, C-2B-83.
// `features/autoridade/pages/provided-appeals.page.ts` ainda não existe (TASK-0015): falha de
// módulo esperada.
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { describe, expect, it } from 'vitest';
import {
  commandRunnerStub,
  listFacadeStub,
  pageProviders,
  stubFacade,
} from '../../../testing/facade.stub';
import {
  createRaitRouterHarness,
  screenElement,
  substituteRouteParams,
} from '../../../testing/router-harness';
import { RAIT_ALL_ROLES } from '../../../testing/route-manifest.fixture';
import { CaseFacade } from '../../data/facades/case.facade';
import { PlaceholderPageComponent } from '../../shared/placeholder-page.component';
import { ProvidedAppealsPageComponent } from './pages/provided-appeals.page';
import { AUTORIDADE_ROUTES } from './autoridade.routes';

function caseFacadeStub() {
  return stubFacade<CaseFacade>()({
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

async function activate(role: string) {
  const harness = await createRaitRouterHarness(
    pageProviders(role as never, [
      { provide: CaseFacade, useValue: caseFacadeStub() },
    ]),
  );
  await harness.navigateByUrl(
    `/${substituteRouteParams('autoridade/provimentos')}`,
  );
  return harness;
}

describe('autoridade/provimentos — C-2B-61 (presença + ausência)', () => {
  it('dado ativada com rait-central-authority quando renderizada então ProvidedAppealsPageComponent com data-screen "T-16"', async () => {
    const harness = await activate('rait-central-authority');
    expect(screenElement(harness)?.getAttribute('data-screen')).toBe('T-16');
    expect(harness.routeDebugElement?.componentInstance).toBeInstanceOf(
      ProvidedAppealsPageComponent,
    );
  });

  const omitted = RAIT_ALL_ROLES.filter(
    (role) => role !== 'rait-central-authority',
  );
  it(`dado ativada com ${omitted[0]} (omitido) quando navegada então /sem-permissao [negativo]`, async () => {
    await activate(omitted[0]);
    const router = TestBed.inject(Router);
    expect(new URL(router.url, 'http://localhost').pathname).toBe(
      '/sem-permissao',
    );
  });
});

describe('autoridade.routes — C-2B-83', () => {
  it('dado AUTORIDADE_ROUTES quando lido então o componente real mapeado; nenhum PlaceholderPageComponent', () => {
    const byPath = new Map(
      AUTORIDADE_ROUTES.map((route) => [route.path, route]),
    );
    expect(byPath.get('autoridade/provimentos')?.component).toBe(
      ProvidedAppealsPageComponent,
    );
    for (const route of AUTORIDADE_ROUTES) {
      expect(route.component).not.toBe(PlaceholderPageComponent);
    }
  });
});
