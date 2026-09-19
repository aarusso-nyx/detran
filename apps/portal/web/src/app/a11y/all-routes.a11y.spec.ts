// R-0014 TASK-0017 (Inspector). CTG-0003c §7.3/§8 — fecha o gate do WP-P5 (B1): `axe` sem
// violação `serious`/`critical` nas 38 rotas de `PORTAL_ROUTE_MANIFEST_FIXTURE`, cada uma com a
// persona adequada ao `access` da entrada (§0 do contrato TASK-0002), provando também que
// nenhuma delas rende `PlaceholderPageComponent` (C-3c-101/C-3c-111; negativo). `PortalStreamTransport`
// e `SwPush` são substituídos por stub (rotas com tempo real/push, §4); requisições HTTP
// disparadas ao montar (leituras das facades) NÃO são flushadas — como o `router-harness.ts`
// documenta, uma requisição pendente de página real não quebra o spec (o estado `loading` é um
// estado testável de acessibilidade como qualquer outro, já coberto por estado nos specs de
// página deste par).
import { TestBed } from '@angular/core/testing';
import { StynxSessionService } from '@stynx-nyx/angular-auth';
import { StynxI18nModule, StynxI18nService } from '@stynx-nyx/angular-i18n';
import { SwPush } from '@angular/service-worker';
import portalCatalog from '../i18n/portal.pt-BR.json';
import { PORTAL_ROUTES } from '../app.routes';
import {
  PORTAL_ROUTE_MANIFEST_FIXTURE,
  type PortalAccess,
} from '../../testing/route-manifest.fixture';
import {
  createPortalRouterHarness,
  substituteRouteParams,
} from '../../testing/router-harness';
import { SessionFacade } from '../core/session.facade';
import { EntitlementFacade } from '../core/entitlement.facade';
import { ServiceCatalogFacade } from '../core/service-catalog.facade';
import { PortalClock } from '../core/clock';
import { PortalStreamTransport } from '../core/realtime.service';
import { PUSH_SERVER_PUBLIC_KEY } from '../core/push.service';
import { createSessionFacadeStub } from '../../testing/session-facade.stub';
import { createEntitlementFacadeStub } from '../../testing/entitlement-facade.stub';
import { createServiceCatalogFacadeStub } from '../../testing/service-catalog-facade.stub';
import { createStynxSessionStub } from '../../testing/stynx-session.stub';
import { createPortalStreamTransportStub } from '../../testing/portal-stream-transport.stub';
import { createSwPushStub } from '../../testing/sw-push.stub';
import { FIXED_CLOCK_ISO } from '../../testing/http-fixtures-pair3';
import { expectNoSeriousA11yViolations } from './axe.spec-helper';

const catalog = portalCatalog as Record<string, string>;

const PLACEHOLDER_SELECTOR = 'portal-placeholder-page';

function sessionStubFor(access: PortalAccess) {
  switch (access) {
    case 'anonimo':
      return createSessionFacadeStub({ active: false });
    case 'nenhum_ou_simples':
      return createSessionFacadeStub({ active: false });
    case 'avancada':
      return createSessionFacadeStub({
        active: true,
        assuranceLevel: 'avancada',
        actRequirements: [
          { act: 'defesa_previa', level: 'avancada', allowed: true },
          { act: 'recurso_jari', level: 'avancada', allowed: true },
          { act: 'recurso_cetran', level: 'avancada', allowed: true },
          { act: 'indicacao_condutor', level: 'avancada', allowed: true },
          { act: 'junta_medica', level: 'avancada', allowed: true },
        ],
      });
    case 'simples':
    default:
      return createSessionFacadeStub({
        active: true,
        assuranceLevel: 'simples',
      });
  }
}

async function mountRoute(url: string, access: PortalAccess) {
  const transport = createPortalStreamTransportStub();
  const swPush = createSwPushStub({ isEnabled: true });
  const harness = await createPortalRouterHarness(PORTAL_ROUTES, [
    { provide: SessionFacade, useValue: sessionStubFor(access) },
    { provide: EntitlementFacade, useValue: createEntitlementFacadeStub(true) },
    {
      provide: ServiceCatalogFacade,
      useValue: createServiceCatalogFacadeStub({ status: 'available' }),
    },
    {
      provide: StynxSessionService,
      useValue: createStynxSessionStub({
        sid: 'sid-fixture',
        active: access !== 'anonimo',
      }),
    },
    {
      provide: PortalClock,
      useValue: { now: () => new Date(FIXED_CLOCK_ISO) },
    },
    { provide: PortalStreamTransport, useValue: { open: transport.open } },
    { provide: SwPush, useValue: swPush.instance },
    { provide: PUSH_SERVER_PUBLIC_KEY, useValue: null },
    StynxI18nModule.forRoot({
      defaultLocale: 'pt-BR',
      loadCatalog: async () => catalog,
    }),
  ]);
  await TestBed.inject(StynxI18nService).initialize();
  await harness.navigate(url);
  return harness;
}

describe('a11y (axe-core) das 38 rotas do manifesto (§7.3; B1 — gate do WP-P5)', () => {
  for (const entry of PORTAL_ROUTE_MANIFEST_FIXTURE) {
    const url = `/${substituteRouteParams(entry.path)}`;
    const label = entry.path === '' ? '(home)' : entry.path;

    it(`dado a rota ${label} (${entry.access}) quando montada com stubs verdes então rende uma página real (não Placeholder) com axe sem violação serious/critical`, async () => {
      // C-3c-101/C-3c-111
      const harness = await mountRoute(url, entry.access);
      const root = harness.harness.routeNativeElement as HTMLElement | null;
      expect(root, `rota ${label} não renderizou`).not.toBeNull();
      expect(
        root!.tagName.toLowerCase(),
        `rota ${label} rendeu PlaceholderPageComponent`,
      ).not.toBe(PLACEHOLDER_SELECTOR);
      await expectNoSeriousA11yViolations(root!);
    });
  }
});

describe('a11y — AlternativeChannelNote em toda tela de ato do par (RN-105; inv. 6)', () => {
  const ACT_SCREENS = [
    'sne',
    'documentos/cnh-digital',
    'veiculos/:vehicleId/crlv-e',
    'ouvidoria/nova',
    'ouvidoria/:manifestationId',
    'privacidade/meus-dados',
    'assinatura/elevacao',
    'exames/:examId/junta/nova',
  ];

  for (const path of ACT_SCREENS) {
    it(`dado a rota ${path} então <portal-alternative-channel-note> está presente`, async () => {
      // C-3c-112
      const entry = PORTAL_ROUTE_MANIFEST_FIXTURE.find(
        (item) => item.path === path,
      );
      expect(entry, `entrada ${path} ausente do manifesto`).toBeDefined();
      const url = `/${substituteRouteParams(path)}`;
      const harness = await mountRoute(url, entry!.access);
      const root = harness.harness.routeNativeElement as HTMLElement;
      await vi.waitFor(() =>
        expect(
          root.querySelector('portal-alternative-channel-note'),
        ).not.toBeNull(),
      );
    });
  }
});
