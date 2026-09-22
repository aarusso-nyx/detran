// R-0012 TASK-0005 (Inspector). C-2A-12 — presença: um `it` por rota das 72 de `route-manifest.md`
// §4 (as duas auxiliares de A2 ficam fora da matriz), sessão ativa com só o papel mínimo da rota
// (primeiro de `roles`; `rait-analyst` para `'all'`). Valor esperado de cada `it` é computado a
// partir das fixtures (nunca do comportamento do guard sob teste) antes de gerar o teste — não é
// uma asserção por conjunto de status, é o valor literal daquela linha. Falha esperada nesta
// entrega: `app.routes.ts`/`core/*` de produção ainda não existem.
import { Router } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import {
  RAIT_ROUTE_MANIFEST_FIXTURE,
  ROLE_HOME_FIXTURE,
  GROUP_REDIRECT_FIXTURE,
  CASE_INITIAL_TAB_FIXTURE,
  type RaitRoleCode,
  type RouteManifestFixtureEntry,
} from '../testing/route-manifest.fixture';
import {
  createRaitRouterHarness,
  screenElement,
  substituteRouteParams,
  FIXED_ENTITY_ID,
} from '../testing/router-harness';
import { createSessionStub } from '../testing/session.stub';

const MATRIX_ROWS = RAIT_ROUTE_MANIFEST_FIXTURE.filter(
  (entry) => entry.path !== 'sem-permissao' && entry.path !== 'auth/callback',
);

function minimalRoleOf(entry: RouteManifestFixtureEntry): RaitRoleCode {
  return entry.roles === 'all' ? 'rait-analyst' : entry.roles[0];
}

type Outcome =
  | { readonly kind: 'screen'; readonly screen: string }
  | { readonly kind: 'url'; readonly url: string };

function expectedOutcomeOf(entry: RouteManifestFixtureEntry): Outcome {
  const role = minimalRoleOf(entry);
  if (entry.path === '') {
    return { kind: 'url', url: ROLE_HOME_FIXTURE[role] };
  }
  if (entry.kind === 'redirect') {
    const row = GROUP_REDIRECT_FIXTURE.find(
      (candidate) => candidate.path === entry.path && candidate.role === role,
    );
    if (!row) {
      throw new Error(
        `sem linha em GROUP_REDIRECT_FIXTURE para ${entry.path} × ${role}`,
      );
    }
    return { kind: 'url', url: row.target };
  }
  if (entry.path === 'casos/:id') {
    const row = CASE_INITIAL_TAB_FIXTURE.find((candidate) =>
      candidate.roles.includes(role),
    );
    if (!row) throw new Error(`sem aba inicial para ${role}`);
    return { kind: 'url', url: `/casos/${FIXED_ENTITY_ID}/${row.tab}` };
  }
  return { kind: 'screen', screen: entry.screen ?? '' };
}

MATRIX_ROWS.forEach((entry) => {
  const role = minimalRoleOf(entry);
  const outcome = expectedOutcomeOf(entry);
  const label = entry.path === '' ? '/' : `/${entry.path}`;

  it(`dado a rota ${label} com sessão só ${role} quando navegada então ${outcome.kind === 'url' ? `URL final ${outcome.url}` : `screenElement.dataset.screen = "${outcome.screen}"`}`, async () => {
    const session = createSessionStub({ active: true, roles: [role] });
    const { RaitSessionFacade } = await import('./core/session.facade');
    const harness = await createRaitRouterHarness([
      { provide: RaitSessionFacade, useValue: session },
    ]);
    const url = `/${substituteRouteParams(entry.path)}`;
    await harness.navigateByUrl(url);
    const router = TestBed.inject(Router);

    if (outcome.kind === 'url') {
      expect(router.url).toBe(outcome.url);
    } else {
      const element = screenElement(harness) as HTMLElement | null;
      expect(element).not.toBeNull();
      expect(element?.dataset['screen']).toBe(outcome.screen);
    }
  });
});

describe('C-2A-12 — cobertura da matriz de presença', () => {
  it('dado route-manifest.md §4 quando contadas as linhas então 72 na matriz (auxiliares de A2 fora)', () => {
    expect(MATRIX_ROWS).toHaveLength(72);
  });
});
