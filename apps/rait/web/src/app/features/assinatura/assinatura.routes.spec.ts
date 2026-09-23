// R-0012 TASK-0014 (Inspector, iteração restrita 2). CTG-0002b.md §6/§8 — C-2B-61, C-2B-83.
// `features/assinatura/pages/*.page.ts` ainda não existem (TASK-0015): falha de módulo esperada.
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
import { SigningFacade } from '../../data/facades/signing.facade';
import { PlaceholderPageComponent } from '../../shared/placeholder-page.component';
import { SigningQueuePageComponent } from './pages/signing-queue.page';
import { SigningDecisionPageComponent } from './pages/signing-decision.page';
import { ASSINATURA_ROUTES } from './assinatura.routes';

function signingFacadeStub() {
  return stubFacade<SigningFacade>()({
    fila: listFacadeStub([]),
    caso: readSlotStub({ status: 'idle' }),
    command: commandRunnerStub(),
  });
}

async function activate(path: string, role: string) {
  const harness = await createRaitRouterHarness(
    pageProviders(role as never, [
      { provide: SigningFacade, useValue: signingFacadeStub() },
    ]),
  );
  await harness.navigateByUrl(`/${substituteRouteParams(path)}`);
  return harness;
}

describe('assinatura — C-2B-61 (presença, papel mínimo rait-signing-authority)', () => {
  it('dado "assinatura" ativada quando renderizada então SigningQueuePageComponent', async () => {
    const harness = await activate('assinatura', 'rait-signing-authority');
    expect(screenElement(harness)?.tagName.toLowerCase()).not.toBe(
      'rait-placeholder-page',
    );
    expect(harness.routeDebugElement?.componentInstance).toBeInstanceOf(
      SigningQueuePageComponent,
    );
  });

  it('dado "assinatura/:caseId" ativada quando renderizada então SigningDecisionPageComponent com data-screen "T-07"', async () => {
    const harness = await activate(
      'assinatura/:caseId',
      'rait-signing-authority',
    );
    expect(screenElement(harness)?.getAttribute('data-screen')).toBe('T-07');
    expect(harness.routeDebugElement?.componentInstance).toBeInstanceOf(
      SigningDecisionPageComponent,
    );
  });
});

describe('assinatura — C-2B-61 (ausência: papéis omitidos) [negativo]', () => {
  const omitted = RAIT_ALL_ROLES.filter(
    (role) => role !== 'rait-signing-authority',
  );
  ['assinatura', 'assinatura/:caseId'].forEach((path) => {
    it(`dado "${path}" ativada com ${omitted[0]} (omitido) quando navegada então /sem-permissao`, async () => {
      await activate(path, omitted[0]);
      const router = TestBed.inject(Router);
      expect(new URL(router.url, 'http://localhost').pathname).toBe(
        '/sem-permissao',
      );
    });
  });
});

describe('assinatura.routes — C-2B-83', () => {
  it('dado ASSINATURA_ROUTES quando lido então os componentes reais mapeados; nenhum PlaceholderPageComponent', () => {
    const byPath = new Map(
      ASSINATURA_ROUTES.map((route) => [route.path, route]),
    );
    expect(byPath.get('assinatura')?.component).toBe(SigningQueuePageComponent);
    expect(byPath.get('assinatura/:caseId')?.component).toBe(
      SigningDecisionPageComponent,
    );
    for (const route of ASSINATURA_ROUTES) {
      expect(route.component).not.toBe(PlaceholderPageComponent);
    }
  });
});
