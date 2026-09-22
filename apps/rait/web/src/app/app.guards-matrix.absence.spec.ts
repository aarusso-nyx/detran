// R-0012 TASK-0005 (Inspector). C-2A-13 — ausência: um `it` por rota × papel canônico omitido
// (72 rotas de route-manifest.md §4; as auxiliares de A2 ficam fora), mais um `it` por rota
// `roles: 'all'` com `SESSION_PRESETS['no-canonical-role']`, mais um `it` (geral, não repetido
// por rota — a frase do contrato não repete "a rota R" nesse item) para sessão ativa com
// `roles: []`. Falha esperada nesta entrega: módulos de produção ainda não existem.
import { Router } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import {
  RAIT_ROUTE_MANIFEST_FIXTURE,
  RAIT_ALL_ROLES,
  type RouteManifestFixtureEntry,
} from '../testing/route-manifest.fixture';
import {
  createRaitRouterHarness,
  screenElement,
  substituteRouteParams,
} from '../testing/router-harness';
import { createSessionStub, SESSION_PRESETS } from '../testing/session.stub';

const MATRIX_ROWS = RAIT_ROUTE_MANIFEST_FIXTURE.filter(
  (entry) => entry.path !== 'sem-permissao' && entry.path !== 'auth/callback',
);

function url_(entry: RouteManifestFixtureEntry): string {
  return `/${substituteRouteParams(entry.path)}`;
}

async function expectForbidden(
  entry: RouteManifestFixtureEntry,
  roles: readonly string[],
): Promise<void> {
  const session = createSessionStub({ active: true, roles });
  const { RaitSessionFacade } = await import('./core/session.facade');
  const harness = await createRaitRouterHarness([
    { provide: RaitSessionFacade, useValue: session },
  ]);
  const url = url_(entry);
  await harness.navigateByUrl(url);
  const router = TestBed.inject(Router);
  expect(router.url).toBe(`/sem-permissao?de=${encodeURIComponent(url)}`);
  expect(screenElement(harness)).toBeNull();
}

let generated = 0;

MATRIX_ROWS.forEach((entry) => {
  const label = entry.path === '' ? '/' : `/${entry.path}`;

  if (entry.roles === 'all') {
    generated += 1;
    it(`dado a rota ${label} (roles: 'all') com sessão SESSION_PRESETS['no-canonical-role'] quando navegada então /sem-permissao?de=${encodeURIComponent(url_(entry))}`, async () => {
      await expectForbidden(
        entry,
        SESSION_PRESETS['no-canonical-role'].roles ?? [],
      );
    });
  } else {
    const omitted = RAIT_ALL_ROLES.filter(
      (role) => !entry.roles.includes(role),
    );
    omitted.forEach((role) => {
      generated += 1;
      it(`dado a rota ${label} (roles: ${JSON.stringify(entry.roles)}) com sessão só ${role} quando navegada então /sem-permissao?de=${encodeURIComponent(url_(entry))}`, async () => {
        await expectForbidden(entry, [role]);
      });
    });
  }
});

describe('C-2A-13 — cobertura da matriz de ausência', () => {
  it('dado route-manifest.md §4 quando geradas as linhas então cada rota × papel canônico omitido tem um it', () => {
    const expectedOmittedTotal = MATRIX_ROWS.reduce((sum, entry) => {
      if (entry.roles === 'all') return sum + 1; // no-canonical-role
      return sum + (RAIT_ALL_ROLES.length - entry.roles.length);
    }, 0);
    expect(generated).toBe(expectedOmittedTotal);
  });

  it('dado uma rota representativa ("painel") com sessão ativa e roles: [] quando navegada então /sem-permissao?de=/painel (idem ao papel omitido)', async () => {
    const entry = MATRIX_ROWS.find((candidate) => candidate.path === 'painel');
    if (!entry) throw new Error('fixture sem a rota painel');
    await expectForbidden(entry, []);
  });
});
