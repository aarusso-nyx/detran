// R-0012 TASK-0014 (Inspector, iteração restrita 3). CTG-0002b.md §6/§8 — C-2B-62 (2 L1:
// membros, pools), C-2B-83. `organizacao/escala` e `organizacao/jeton` são L0 (M13) — já cobertas
// por C-2A-11/C-2B-63 no manifesto (`app.routes.spec.ts`); nenhuma página nem spec de página
// aqui. `features/organizacao/pages/{members,pools}.page.ts` ainda não existem (TASK-0015):
// falha de módulo esperada.
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { pageProviders } from '../../../testing/facade.stub';
import {
  createRaitRouterHarness,
  substituteRouteParams,
} from '../../../testing/router-harness';
import { PlaceholderPageComponent } from '../../shared/placeholder-page.component';
import { MembersPageComponent } from './pages/members.page';
import { PoolsPageComponent } from './pages/pools.page';
import { ORGANIZACAO_ROUTES } from './organizacao.routes';

const L1: readonly {
  path: string;
  url: string;
  role: string;
  component: unknown;
}[] = [
  {
    path: 'organizacao/membros',
    url: '/v1/inf/rait/pool-members',
    role: 'rait-hr',
    component: MembersPageComponent,
  },
  {
    path: 'organizacao/pools',
    url: '/v1/inf/rait/pools',
    role: 'rait-coordinator',
    component: PoolsPageComponent,
  },
];

describe('organizacao — C-2B-62 (L1: requisição HTTP, stynx-table, sem botão)', () => {
  L1.forEach(({ path, url, role, component }) => {
    it(`dado "${path}" ativada com ${role} quando o cliente responde então o componente real, GET ${url} sem query, stynx-table e nenhum botão`, async () => {
      const harness = await createRaitRouterHarness(
        pageProviders(role as never, [
          provideHttpClient(),
          provideHttpClientTesting(),
        ]),
      );
      const navigation = harness.navigateByUrl(
        `/${substituteRouteParams(path)}`,
      );
      const http = TestBed.inject(HttpTestingController);
      const req = await navigation.then(() =>
        http.expectOne({ method: 'GET', url }),
      );
      expect(req.request.params.keys()).toHaveLength(0);
      req.flush([]);
      harness.detectChanges();
      expect(harness.routeDebugElement?.componentInstance).toBeInstanceOf(
        component as never,
      );
      expect(
        harness.routeNativeElement?.querySelector('stynx-table'),
      ).not.toBeNull();
      expect(
        harness.routeNativeElement?.querySelectorAll('[data-action]'),
      ).toHaveLength(0);
      http.verify();
    });
  });
});

describe('organizacao.routes — C-2B-83', () => {
  it('dado ORGANIZACAO_ROUTES quando lido então membros/pools → componentes reais; escala/jeton → PlaceholderPageComponent (L0)', () => {
    const byPath = new Map(
      ORGANIZACAO_ROUTES.map((route) => [route.path, route]),
    );
    expect(byPath.get('organizacao/membros')?.component).toBe(
      MembersPageComponent,
    );
    expect(byPath.get('organizacao/pools')?.component).toBe(PoolsPageComponent);
    expect(byPath.get('organizacao/escala')?.component).toBe(
      PlaceholderPageComponent,
    );
    expect(byPath.get('organizacao/jeton')?.component).toBe(
      PlaceholderPageComponent,
    );
  });
});
