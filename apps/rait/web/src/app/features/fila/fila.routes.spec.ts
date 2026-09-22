// R-0012 TASK-0014 (Inspector). CTG-0002b.md §6/§8 — C-2B-61 (L2), C-2B-68 (atalhos),
// C-2B-83 (routes.ts × manifesto). `features/fila/pages/*.page.ts` ainda não existem
// (TASK-0015): falha de módulo esperada.
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
import { ShortcutService } from '../../core/shortcut.service';
import { QueueFacade } from '../../data/facades/queue.facade';
import { PlaceholderPageComponent } from '../../shared/placeholder-page.component';
import { DefensePoolQueuePageComponent } from './pages/defense-pool-queue.page';
import { RapporteurQueuePageComponent } from './pages/rapporteur-queue.page';
import { FILA_ROUTES } from './fila.routes';

function queueFacadeStub() {
  return stubFacade<QueueFacade>()({
    casosDaFila: (() => new Map()) as never,
    filaDefesa: listFacadeStub([]),
    filaRelator: listFacadeStub([]),
    retomar: listFacadeStub([]),
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

describe('fila/defesa — C-2B-61 (presença + ausência)', () => {
  it('dado "fila/defesa" ativada com rait-analyst quando renderizada então DefensePoolQueuePageComponent com data-screen "T-02"', async () => {
    const harness = await activate('fila/defesa', 'rait-analyst');
    expect(screenElement(harness)?.getAttribute('data-screen')).toBe('T-02');
    expect(harness.routeDebugElement?.componentInstance).toBeInstanceOf(
      DefensePoolQueuePageComponent,
    );
  });

  RAIT_ALL_ROLES.filter((role) => role !== 'rait-analyst').forEach((role) => {
    it(`dado "fila/defesa" ativada com ${role} (omitido) quando navegada então /sem-permissao [negativo]`, async () => {
      await activate('fila/defesa', role);
      const router = TestBed.inject(Router);
      expect(new URL(router.url, 'http://localhost').pathname).toBe(
        '/sem-permissao',
      );
    });
  });
});

describe('fila/recurso/:orgao — C-2B-61', () => {
  it('dado "fila/recurso/:orgao" ativada com rait-rapporteur quando renderizada então RapporteurQueuePageComponent com data-screen "T-02"', async () => {
    const harness = await activate('fila/recurso/:orgao', 'rait-rapporteur');
    expect(screenElement(harness)?.getAttribute('data-screen')).toBe('T-02');
    expect(harness.routeDebugElement?.componentInstance).toBeInstanceOf(
      RapporteurQueuePageComponent,
    );
  });
});

describe('fila/defesa — C-2B-68 (atalhos: claim-next, list-*, open)', () => {
  it('dado a página criada quando montada então claim-next/list-next/list-prev/open registrados; ao destruir, desregistrados [presença + ausência]', async () => {
    const harness = await activate('fila/defesa', 'rait-analyst');
    const shortcuts = TestBed.inject(ShortcutService) as unknown as {
      handlers: Map<string, () => void>;
    };
    for (const key of ['claim-next', 'list-next', 'list-prev', 'open']) {
      expect(shortcuts.handlers.has(key)).toBe(true);
    }
    harness.fixture.destroy();
    for (const key of ['claim-next', 'list-next', 'list-prev', 'open']) {
      expect(shortcuts.handlers.has(key)).toBe(false);
    }
  });
});

describe('fila.routes — C-2B-83', () => {
  it('dado FILA_ROUTES quando lido então componentes reais e nenhum PlaceholderPageComponent', () => {
    const byPath = new Map(FILA_ROUTES.map((route) => [route.path, route]));
    expect(byPath.get('fila/defesa')?.component).toBe(
      DefensePoolQueuePageComponent,
    );
    expect(byPath.get('fila/recurso/:orgao')?.component).toBe(
      RapporteurQueuePageComponent,
    );
    for (const route of FILA_ROUTES) {
      expect(route.component).not.toBe(PlaceholderPageComponent);
    }
  });
});
