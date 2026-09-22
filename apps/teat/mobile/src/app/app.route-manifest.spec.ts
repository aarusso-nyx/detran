import { expect, it } from 'vitest';
import { TEAT_ROUTES } from './app.routes';
import {
  BOAT_ROUTE_PATHS,
  D05_ROUTE_PATH,
  TEAT_ROUTE_FIXTURE,
} from '../testing/route-contract.fixture';

it('dado o manifesto móvel quando comparado ao contrato então prova as 70 rotas em ordem', () => {
  expect(TEAT_ROUTE_FIXTURE).toHaveLength(70);
  expect(TEAT_ROUTES).toHaveLength(70);
  expect(TEAT_ROUTES.map((route) => route.path)).toEqual(
    TEAT_ROUTE_FIXTURE.map((route) => route.path),
  );
});

for (const expected of TEAT_ROUTE_FIXTURE) {
  it(`dado a rota /${expected.path} quando verificada então conserva o contrato arquitetural`, () => {
    const route = TEAT_ROUTES.find(
      (candidate) => candidate.path === expected.path,
    );
    expect(route, `rota ausente: /${expected.path}`).toBeDefined();
    expect(route?.data).toMatchObject({
      uxCode: expected.uxCode,
      sourceSheet: expected.sourceSheet,
      guardPlan: expected.guards,
      allowedRoles: expected.allowedRoles,
      component: expected.component,
    });
  });
}

it('dado D-05 desligada quando o manifesto é carregado então mantém a rota indisponível sem carregar feature', () => {
  const route = TEAT_ROUTES.find(
    (candidate) => candidate.path === D05_ROUTE_PATH,
  );
  expect(route?.data).toMatchObject({ featureEnabled: false });
  expect(route?.loadComponent).toBeUndefined();
});

it('dadas as onze rotas crash quando o manifesto é carregado então preserva cada ponto de extensão BOAT', () => {
  expect(BOAT_ROUTE_PATHS).toHaveLength(11);
  for (const path of BOAT_ROUTE_PATHS) {
    const route = TEAT_ROUTES.find((candidate) => candidate.path === path);
    expect(route?.data).toMatchObject({ boatExtension: true });
  }
});
