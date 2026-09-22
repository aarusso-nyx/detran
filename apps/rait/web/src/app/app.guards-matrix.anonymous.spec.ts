// R-0012 TASK-0005 (Inspector). C-2A-14 — anônimo: um `it` por rota, todas as 74 do manifesto
// menos `auth/callback` (73), sessão inativa → URL final = LOGIN_ROUTE. `auth/callback` é
// testado à parte: ativa sem redirecionar (é a única rota pública, A2). Falha esperada nesta
// entrega: módulos de produção ainda não existem.
import { Router } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { RAIT_ROUTE_MANIFEST_FIXTURE } from '../testing/route-manifest.fixture';
import {
  createRaitRouterHarness,
  screenElement,
  substituteRouteParams,
} from '../testing/router-harness';
import { createSessionStub, SESSION_PRESETS } from '../testing/session.stub';

const LOGIN_ROUTE = '/auth/callback';

const ANONYMOUS_ROWS = RAIT_ROUTE_MANIFEST_FIXTURE.filter(
  (entry) => entry.path !== 'auth/callback',
);

describe('C-2A-14 — cobertura da matriz anônima', () => {
  it('dado o manifesto (74) quando excluída auth/callback então restam 73 rotas', () => {
    expect(ANONYMOUS_ROWS).toHaveLength(73);
  });
});

ANONYMOUS_ROWS.forEach((entry) => {
  const label = entry.path === '' ? '/' : `/${entry.path}`;

  it(`dado sessão inativa quando navegada a rota ${label} então URL final = ${LOGIN_ROUTE} (roleGuard nunca avaliado)`, async () => {
    // roles: [] junto de active: false prova que, mesmo sem nenhum papel, a sessão inativa nunca
    // produz '/sem-permissao' — só o guard de autenticação decide (raitAuthGuard roda antes de
    // roleGuard, §4).
    const session = createSessionStub(SESSION_PRESETS.anonymous);
    const { RaitSessionFacade } = await import('./core/session.facade');
    const harness = await createRaitRouterHarness([
      { provide: RaitSessionFacade, useValue: session },
    ]);
    const url = `/${substituteRouteParams(entry.path)}`;
    await harness.navigateByUrl(url);
    const router = TestBed.inject(Router);
    expect(router.url).toBe(LOGIN_ROUTE);
    expect(router.url).not.toContain('sem-permissao');
  });
});

it('dado sessão inativa quando navegada "auth/callback" então ativa sem redirecionar (A2, rota pública)', async () => {
  const session = createSessionStub(SESSION_PRESETS.anonymous);
  const { RaitSessionFacade } = await import('./core/session.facade');
  const harness = await createRaitRouterHarness([
    { provide: RaitSessionFacade, useValue: session },
  ]);
  await harness.navigateByUrl('/auth/callback');
  const router = TestBed.inject(Router);
  expect(router.url).toBe('/auth/callback');
  expect(screenElement(harness)).not.toBeNull();
});
