// R-0012 TASK-0014 (Inspector). CTG-0002b.md §6/§8 — C-2B-61 (L2 presença, papel mínimo e cada
// papel omitido), C-2B-68 (atalhos de `painel/retomar`), C-2B-83 (`painel.routes.ts` × manifesto).
// `features/painel/pages/*.page.ts` ainda não existem (TASK-0015): falha de módulo esperada.
import { TestBed } from '@angular/core/testing';
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
import { ShortcutService } from '../../core/shortcut.service';
import type { ShiftSummary } from '../../data/facades/bundles';
import { QueueFacade } from '../../data/facades/queue.facade';
import { ResumeTrayPageComponent } from './pages/resume-tray.page';
import { ShiftDashboardPageComponent } from './pages/shift-dashboard.page';
import { PAINEL_ROUTES } from './painel.routes';
import { PlaceholderPageComponent } from '../../shared/placeholder-page.component';

const READY_SUMMARY: ShiftSummary = {
  queued: 0,
  inInquiry: 0,
  resumable: 0,
  openAlerts: 0,
};

function queueFacadeStub() {
  return stubFacade<QueueFacade>()({
    casosDaFila: (() => new Map()) as never,
    painel: readSlotStub<ShiftSummary>({
      status: 'ready',
      value: READY_SUMMARY,
    }),
    retomar: listFacadeStub([]),
    filaDefesa: listFacadeStub([]),
    filaRelator: listFacadeStub([]),
    command: commandRunnerStub(),
  });
}

async function activate(path: string, role: string) {
  const harness = await createRaitRouterHarness(
    pageProviders(role as never, [
      { provide: QueueFacade, useValue: queueFacadeStub() },
    ]),
  );
  await harness.navigateByUrl(`/${substituteRouteParams(path)}`);
  return harness;
}

describe('painel/painel — C-2B-61 (L2, todos os papéis)', () => {
  RAIT_ALL_ROLES.forEach((role) => {
    it(`dado "painel" ativada com ${role} quando renderizada então ShiftDashboardPageComponent com data-screen "T-01"`, async () => {
      const harness = await activate('painel', role);
      const element = screenElement(harness);
      expect(element?.tagName.toLowerCase()).not.toBe('rait-placeholder-page');
      expect(element?.getAttribute('data-screen')).toBe('T-01');
      expect(harness.routeDebugElement?.componentInstance).toBeInstanceOf(
        ShiftDashboardPageComponent,
      );
    });
  });
});

describe('painel/painel-retomar — C-2B-61 (papel mínimo e omitidos)', () => {
  it('dado "painel/retomar" ativada com rait-analyst quando renderizada então ResumeTrayPageComponent com data-screen "T-06"', async () => {
    const harness = await activate('painel/retomar', 'rait-analyst');
    const element = screenElement(harness);
    expect(element?.getAttribute('data-screen')).toBe('T-06');
    expect(harness.routeDebugElement?.componentInstance).toBeInstanceOf(
      ResumeTrayPageComponent,
    );
  });

  it('dado "painel/retomar" ativada com rait-rapporteur quando renderizada então ResumeTrayPageComponent', async () => {
    const harness = await activate('painel/retomar', 'rait-rapporteur');
    expect(harness.routeDebugElement?.componentInstance).toBeInstanceOf(
      ResumeTrayPageComponent,
    );
  });

  const omitted = RAIT_ALL_ROLES.filter(
    (role) => role !== 'rait-analyst' && role !== 'rait-rapporteur',
  );
  omitted.forEach((role) => {
    it(`dado "painel/retomar" ativada com ${role} (omitido) quando navegada então redireciona a /sem-permissao [negativo]`, async () => {
      const harness = await activate('painel/retomar', role);
      void harness;
      const router = TestBed.inject((await import('@angular/router')).Router);
      const url = new URL(router.url, 'http://localhost');
      expect(url.pathname).toBe('/sem-permissao');
    });
  });
});

describe('painel/painel-retomar — C-2B-68 (atalhos)', () => {
  it('dado a página criada quando montada então list-next/list-prev/open registrados; ao destruir, desregistrados [presença + ausência]', async () => {
    const harness = await activate('painel/retomar', 'rait-analyst');
    const shortcuts = TestBed.inject(ShortcutService) as unknown as {
      handlers: Map<string, () => void>;
    };
    expect(shortcuts.handlers.has('list-next')).toBe(true);
    expect(shortcuts.handlers.has('list-prev')).toBe(true);
    expect(shortcuts.handlers.has('open')).toBe(true);
    harness.fixture.destroy();
    expect(shortcuts.handlers.has('list-next')).toBe(false);
    expect(shortcuts.handlers.has('list-prev')).toBe(false);
    expect(shortcuts.handlers.has('open')).toBe(false);
  });
});

describe('painel.routes — C-2B-83 (routes.ts × manifesto)', () => {
  it('dado PAINEL_ROUTES quando lido então "painel" → ShiftDashboardPageComponent e "painel/retomar" → ResumeTrayPageComponent (nenhum PlaceholderPageComponent)', () => {
    const byPath = new Map(PAINEL_ROUTES.map((route) => [route.path, route]));
    expect(byPath.get('painel')?.component).toBe(ShiftDashboardPageComponent);
    expect(byPath.get('painel/retomar')?.component).toBe(
      ResumeTrayPageComponent,
    );
    for (const route of PAINEL_ROUTES) {
      expect(route.component).not.toBe(PlaceholderPageComponent);
    }
  });
});
