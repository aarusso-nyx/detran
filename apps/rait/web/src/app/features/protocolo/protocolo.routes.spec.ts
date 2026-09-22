// R-0012 TASK-0014 (Inspector, iteração restrita 2). CTG-0002b.md §6/§8 — C-2B-61 (L2 presença +
// ausência), C-2B-83 (routes.ts × manifesto). `features/protocolo/pages/*.page.ts` ainda não
// existem (TASK-0015): falha de módulo esperada.
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
import { ProtocolFacade } from '../../data/facades/protocol.facade';
import { PlaceholderPageComponent } from '../../shared/placeholder-page.component';
import { IntakeListPageComponent } from './pages/intake-list.page';
import { IntakeNewPageComponent } from './pages/intake-new.page';
import { PendingContentPageComponent } from './pages/pending-content.page';
import { RemittancesPageComponent } from './pages/remittances.page';
import { RedirectsPageComponent } from './pages/redirects.page';
import { WithdrawalsPageComponent } from './pages/withdrawals.page';
import { PROTOCOLO_ROUTES } from './protocolo.routes';

function protocolFacadeStub() {
  return stubFacade<ProtocolFacade>()({
    intake: listFacadeStub([]),
    pendencias: listFacadeStub([]),
    remessas: listFacadeStub([]),
    redirecionamentos: listFacadeStub([]),
    desistenciaCaso: readSlotStub({ status: 'idle' }),
    pendenciasCaso: (() => new Map()) as never,
    remessasPrazo: (() => new Map()) as never,
    command: commandRunnerStub(),
  });
}

async function activate(path: string, role: string) {
  const harness = await createRaitRouterHarness(
    pageProviders(role as never, [
      { provide: ProtocolFacade, useValue: protocolFacadeStub() },
    ]),
  );
  await harness.navigateByUrl(`/${substituteRouteParams(path)}`);
  return harness;
}

const PAGES: readonly { path: string; screen: string; component: unknown }[] = [
  { path: 'protocolo', screen: 'T-08', component: IntakeListPageComponent },
  {
    path: 'protocolo/novo',
    screen: 'T-08',
    component: IntakeNewPageComponent,
  },
  {
    path: 'protocolo/pendencias',
    screen: '',
    component: PendingContentPageComponent,
  },
  {
    path: 'protocolo/remessas',
    screen: '',
    component: RemittancesPageComponent,
  },
  {
    path: 'protocolo/redirecionamentos',
    screen: '',
    component: RedirectsPageComponent,
  },
  {
    path: 'protocolo/desistencias',
    screen: 'T-17',
    component: WithdrawalsPageComponent,
  },
];

describe('protocolo — C-2B-61 (presença, papel mínimo rait-secretary)', () => {
  PAGES.forEach(({ path, screen, component }) => {
    it(`dado "${path}" ativada com rait-secretary quando renderizada então o componente da tabela §6.1 com data-screen "${screen}" e nenhum rait-placeholder-page`, async () => {
      const harness = await activate(path, 'rait-secretary');
      const element = screenElement(harness);
      expect(element?.tagName.toLowerCase()).not.toBe('rait-placeholder-page');
      expect(element?.getAttribute('data-screen')).toBe(screen);
      expect(harness.routeDebugElement?.componentInstance).toBeInstanceOf(
        component as never,
      );
    });
  });
});

describe('protocolo — C-2B-61 (ausência: papéis omitidos)', () => {
  const omitted = RAIT_ALL_ROLES.filter((role) => role !== 'rait-secretary');
  PAGES.forEach(({ path }) => {
    it(`dado "${path}" ativada com ${omitted[0]} (omitido) quando navegada então /sem-permissao [negativo]`, async () => {
      await activate(path, omitted[0]);
      const router = TestBed.inject(Router);
      expect(new URL(router.url, 'http://localhost').pathname).toBe(
        '/sem-permissao',
      );
    });
  });
});

describe('protocolo.routes — C-2B-83', () => {
  it('dado PROTOCOLO_ROUTES quando lido então os 6 paths mapeiam para os componentes reais; nenhum PlaceholderPageComponent', () => {
    const byPath = new Map(
      PROTOCOLO_ROUTES.map((route) => [route.path, route]),
    );
    for (const { path, component } of PAGES) {
      expect(byPath.get(path)?.component).toBe(component);
    }
    for (const route of PROTOCOLO_ROUTES) {
      expect(route.component).not.toBe(PlaceholderPageComponent);
    }
  });
});
