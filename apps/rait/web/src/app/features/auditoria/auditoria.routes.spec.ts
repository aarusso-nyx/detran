// R-0012 TASK-0014 (Inspector, iteração restrita 3). CTG-0002b.md §6/§8 — C-2B-61 (trilha, L2),
// C-2B-83 (exportacoes é L0 — já coberta por C-2B-63). `AuditTrailPageComponent` (IU-RAIT-060)
// ainda não existe (TASK-0015): falha de módulo esperada.
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
import { AuditFacade } from '../../data/facades/audit.facade';
import { PlaceholderPageComponent } from '../../shared/placeholder-page.component';
import { AuditTrailPageComponent } from './pages/audit-trail.page';
import { AUDITORIA_ROUTES } from './auditoria.routes';

function auditFacadeStub() {
  return stubFacade<AuditFacade>()({
    trilha: listFacadeStub([]),
    command: commandRunnerStub(),
  });
}

async function activate(role: string) {
  const harness = await createRaitRouterHarness(
    pageProviders(role as never, [
      { provide: AuditFacade, useValue: auditFacadeStub() },
    ]),
  );
  await harness.navigateByUrl(`/${substituteRouteParams('auditoria/trilha')}`);
  return harness;
}

describe('auditoria/trilha — C-2B-61 (presença + ausência)', () => {
  it('dado ativada com AUDITOR quando renderizada então AuditTrailPageComponent', async () => {
    const harness = await activate('AUDITOR');
    expect(screenElement(harness)?.tagName.toLowerCase()).not.toBe(
      'rait-placeholder-page',
    );
    expect(harness.routeDebugElement?.componentInstance).toBeInstanceOf(
      AuditTrailPageComponent,
    );
  });

  const omitted = RAIT_ALL_ROLES.filter((role) => role !== 'AUDITOR');
  it(`dado ativada com ${omitted[0]} (omitido) quando navegada então /sem-permissao [negativo]`, async () => {
    await activate(omitted[0]);
    const router = TestBed.inject(Router);
    expect(new URL(router.url, 'http://localhost').pathname).toBe(
      '/sem-permissao',
    );
  });
});

describe('auditoria.routes — C-2B-83', () => {
  it('dado AUDITORIA_ROUTES quando lido então trilha → componente real; exportacoes → PlaceholderPageComponent (L0)', () => {
    const byPath = new Map(
      AUDITORIA_ROUTES.map((route) => [route.path, route]),
    );
    expect(byPath.get('auditoria/trilha')?.component).toBe(
      AuditTrailPageComponent,
    );
    expect(byPath.get('auditoria/exportacoes')?.component).toBe(
      PlaceholderPageComponent,
    );
  });
});
