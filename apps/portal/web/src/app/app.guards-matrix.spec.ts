// R-0014 TASK-0002 (Inspector). Matriz de presença × ausência dos guardas para as 38 rotas
// do manifesto (route-manifest.md), sobre `PORTAL_ROUTES` real (M7/M8 do plan.md), com
// `provideRouter` + `RouterTestingHarness` e os stubs de `src/testing/`. Id fixo
// `00000000-0000-7000-8000-0000000000aa` para todo parâmetro dinâmico (prompt §B.3).
import { PORTAL_ROUTES } from './app.routes';
import { SessionFacade } from './core/session.facade';
import { EntitlementFacade } from './core/entitlement.facade';
import { ServiceCatalogFacade } from './core/service-catalog.facade';
import {
  SESSION_FACADE_PRESETS,
  type SessionFacadeStub,
} from '../testing/session-facade.stub';
import { createEntitlementFacadeStub } from '../testing/entitlement-facade.stub';
import {
  createServiceCatalogFacadeStub,
  DELEGACAO_INDISPONIVEL_R0007,
} from '../testing/service-catalog-facade.stub';
import { PORTAL_ROUTE_MANIFEST_FIXTURE } from '../testing/route-manifest.fixture';
import {
  createPortalRouterHarness,
  screenElement,
  substituteRouteParams,
  FIXED_ENTITY_ID,
} from '../testing/router-harness';

function providersFor(options: {
  session: SessionFacadeStub;
  entitlementOk?: boolean;
  availability?: 'available' | 'partially_available' | 'unavailable';
}) {
  return [
    { provide: SessionFacade, useValue: options.session },
    {
      provide: EntitlementFacade,
      useValue: createEntitlementFacadeStub(options.entitlementOk ?? true),
    },
    {
      provide: ServiceCatalogFacade,
      useValue: createServiceCatalogFacadeStub(
        options.availability && options.availability !== 'available'
          ? {
              status: options.availability,
              reason:
                options.availability === 'unavailable'
                  ? DELEGACAO_INDISPONIVEL_R0007
                  : undefined,
            }
          : { status: 'available' },
      ),
    },
  ];
}

describe('matriz de guardas por rota (route-manifest.md × plan.md M8)', () => {
  for (const entry of PORTAL_ROUTE_MANIFEST_FIXTURE) {
    const url = `/${substituteRouteParams(entry.path)}`;
    const label = entry.path === '' ? '(home)' : entry.path;

    describe(`rota ${label} [access=${entry.access}]`, () => {
      it('dado persona anônima (active=false) quando navega então presença se anonimo/nenhum_ou_simples, senão retomar', async () => {
        const { harness, currentUrl } = await createPortalRouterHarness(
          PORTAL_ROUTES,
          providersFor({ session: SESSION_FACADE_PRESETS.anonimo() }),
        );
        await harness.navigateByUrl(url);
        if (
          entry.access === 'anonimo' ||
          entry.access === 'nenhum_ou_simples'
        ) {
          expect(screenElement(harness)).not.toBeNull();
        } else {
          expect(currentUrl()).toBe(`/?retomar=${encodeURIComponent(url)}`);
        }
      });

      it('dado persona simples ativa quando navega então presença exceto access=avancada (elevação)', async () => {
        const { harness, currentUrl } = await createPortalRouterHarness(
          PORTAL_ROUTES,
          providersFor({ session: SESSION_FACADE_PRESETS.simples() }),
        );
        await harness.navigateByUrl(url);
        if (entry.access === 'avancada') {
          expect(currentUrl()).toBe(
            `/assinatura/elevacao?retomar=${encodeURIComponent(url)}`,
          );
        } else {
          expect(screenElement(harness)).not.toBeNull();
        }
      });

      it('dado persona avancada quando navega então sempre renderiza', async () => {
        const { harness } = await createPortalRouterHarness(
          PORTAL_ROUTES,
          providersFor({ session: SESSION_FACADE_PRESETS.avancada() }),
        );
        await harness.navigateByUrl(url);
        expect(screenElement(harness)).not.toBeNull();
      });

      it('dado persona qualificada quando navega então sempre renderiza (nunca bloqueada, RN-PORTAL-101)', async () => {
        const { harness } = await createPortalRouterHarness(
          PORTAL_ROUTES,
          providersFor({ session: SESSION_FACADE_PRESETS.qualificada() }),
        );
        await harness.navigateByUrl(url);
        expect(screenElement(harness)).not.toBeNull();
      });

      if (entry.serviceKey) {
        it(`dado serviceKey ${entry.serviceKey} indisponível quando navega então redireciona para /servico-indisponivel/${entry.serviceKey}`, async () => {
          const { harness, currentUrl } = await createPortalRouterHarness(
            PORTAL_ROUTES,
            providersFor({
              session: SESSION_FACADE_PRESETS.avancada(),
              availability: 'unavailable',
            }),
          );
          await harness.navigateByUrl(url);
          expect(currentUrl()).toBe(
            `/servico-indisponivel/${entry.serviceKey}`,
          );
        });

        it(`dado serviceKey ${entry.serviceKey} parcialmente disponível quando navega então renderiza`, async () => {
          const { harness } = await createPortalRouterHarness(
            PORTAL_ROUTES,
            providersFor({
              session: SESSION_FACADE_PRESETS.avancada(),
              availability: 'partially_available',
            }),
          );
          await harness.navigateByUrl(url);
          expect(screenElement(harness)).not.toBeNull();
        });
      }

      const entitlement = entry.entitlement;
      if (entitlement) {
        it(`dado vínculo (${entitlement.kind}) negado quando navega então redireciona para /vinculo/por-que-nao-vejo`, async () => {
          const { harness, currentUrl } = await createPortalRouterHarness(
            PORTAL_ROUTES,
            providersFor({
              session: SESSION_FACADE_PRESETS.avancada(),
              entitlementOk: false,
            }),
          );
          await harness.navigateByUrl(url);
          expect(currentUrl()).toBe(
            `/vinculo/por-que-nao-vejo?recurso=${entitlement.kind}&id=${FIXED_ENTITY_ID}`,
          );
        });

        it(`dado vínculo (${entitlement.kind}) confirmado quando navega então renderiza`, async () => {
          const { harness } = await createPortalRouterHarness(
            PORTAL_ROUTES,
            providersFor({
              session: SESSION_FACADE_PRESETS.avancada(),
              entitlementOk: true,
            }),
          );
          await harness.navigateByUrl(url);
          expect(screenElement(harness)).not.toBeNull();
        });
      }
    });
  }

  it('dado rota simples com serviceKey indisponível quando persona anônima navega então auth vence availability (retomar, nunca servico-indisponivel)', async () => {
    const entry = PORTAL_ROUTE_MANIFEST_FIXTURE.find(
      (candidate) => candidate.path === 'autos',
    );
    if (!entry) throw new Error('fixture sem a rota autos');
    const url = `/${entry.path}`;
    const { harness, currentUrl } = await createPortalRouterHarness(
      PORTAL_ROUTES,
      providersFor({
        session: SESSION_FACADE_PRESETS.anonimo(),
        availability: 'unavailable',
      }),
    );
    await harness.navigateByUrl(url);
    expect(currentUrl()).toBe(`/?retomar=${encodeURIComponent(url)}`);
  });
});
