// R-0014 TASK-0002 (Inspector). `PORTAL_ROUTE_MANIFEST` (M7 do plan.md) comparado, entrada a
// entrada, contra a transcrição independente de route-manifest.md em
// `src/testing/route-manifest.fixture.ts` (a fixture não é importada pela produção — cada
// lado é escrito e mantido separadamente, como pede o prompt §B.1).
import { PORTAL_ROUTE_MANIFEST } from './app.route-manifest';
import {
  PORTAL_ROUTE_MANIFEST_FIXTURE,
  PORTAL_SERVICE_KEYS,
} from '../testing/route-manifest.fixture';

describe('PORTAL_ROUTE_MANIFEST', () => {
  it('dado o manifesto de produção quando comparado ao route-manifest.md então tem exatamente as 38 entradas, path a path', () => {
    expect(PORTAL_ROUTE_MANIFEST.length).toBe(38);
    expect(PORTAL_ROUTE_MANIFEST.length).toBe(
      PORTAL_ROUTE_MANIFEST_FIXTURE.length,
    );
    const actualPaths = PORTAL_ROUTE_MANIFEST.map((entry) => entry.path);
    const expectedPaths = PORTAL_ROUTE_MANIFEST_FIXTURE.map(
      (entry) => entry.path,
    );
    expect(actualPaths).toEqual(expectedPaths);
  });

  it('dado cada rota do manifesto quando comparada à fixture então screen/sheet/module/access/entitlement/serviceKey coincidem', () => {
    const byPath = new Map(
      PORTAL_ROUTE_MANIFEST.map((entry) => [entry.path, entry]),
    );
    for (const expected of PORTAL_ROUTE_MANIFEST_FIXTURE) {
      const actual = byPath.get(expected.path);
      expect(
        actual,
        `rota ausente no manifesto de produção: ${expected.path}`,
      ).toBeDefined();
      expect(actual?.screen).toBe(expected.screen);
      expect(actual?.sheet).toBe(expected.sheet);
      expect(actual?.module).toBe(expected.module);
      expect(actual?.access).toBe(expected.access);
      expect(actual?.entitlement).toEqual(expected.entitlement);
      expect(actual?.serviceKey).toEqual(expected.serviceKey);
      expect(actual?.journeys).toEqual(expected.journeys);
    }
  });

  it('dado o manifesto quando contadas as telas distintas então há exatamente 27 (T-01…T-27)', () => {
    const screens = new Set(
      PORTAL_ROUTE_MANIFEST.map((entry) => entry.screen).filter(
        (screen): screen is `T-${string}` => screen !== null,
      ),
    );
    expect(screens.size).toBe(27);
    for (let index = 1; index <= 27; index += 1) {
      const code = `T-${String(index).padStart(2, '0')}`;
      expect(screens.has(code as `T-${string}`), `tela ausente: ${code}`).toBe(
        true,
      );
    }
  });

  it('dado o manifesto quando verificado então nenhuma entrada tem access "qualificada" ([RN-PORTAL-101])', () => {
    for (const entry of PORTAL_ROUTE_MANIFEST) {
      expect(entry.access).not.toBe('qualificada');
    }
  });

  it('dado o manifesto quando contados os módulos distintos então há exatamente 14', () => {
    const modules = new Set(PORTAL_ROUTE_MANIFEST.map((entry) => entry.module));
    expect(modules.size).toBe(14);
  });

  it('dado toda rota com parâmetro de vínculo (:aitId|:requestId|:vehicleId|:crashId|:examId|:manifestationId) quando verificada então tem entitlement', () => {
    const entitlementParams = [
      'aitId',
      'requestId',
      'vehicleId',
      'crashId',
      'examId',
      'manifestationId',
    ];
    for (const entry of PORTAL_ROUTE_MANIFEST) {
      const hasBindingParam = entry.path
        .split('/')
        .some(
          (segment) =>
            segment.startsWith(':') &&
            entitlementParams.includes(segment.slice(1)),
        );
      if (hasBindingParam) {
        expect(
          entry.entitlement,
          `rota sem entitlement: ${entry.path}`,
        ).toBeDefined();
      }
    }
  });

  it('dado toda rota com serviceKey quando verificada então serviceKey pertence ao catálogo fechado de serviços', () => {
    for (const entry of PORTAL_ROUTE_MANIFEST) {
      if (entry.serviceKey) {
        expect(
          (PORTAL_SERVICE_KEYS as readonly string[]).includes(entry.serviceKey),
          `serviceKey fora do catálogo: ${entry.serviceKey}`,
        ).toBe(true);
      }
    }
  });
});
