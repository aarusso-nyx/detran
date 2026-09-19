// R-0014 TASK-0015 (Inspector). CTG-0003b §6 T-01 (`AitDetailPageComponent`); página real, ainda
// inexistente (§1) — "Cannot find module" até TASK-0016 (esperado, §9).
import { fileURLToPath } from 'node:url';
import { AitDetailPageComponent } from './ait-detail.page'; // §9: importação direta força "Cannot find module" (falha esperada até TASK-0016).
import { TestBed } from '@angular/core/testing';
import { StynxI18nModule, StynxI18nService } from '@stynx-nyx/angular-i18n';
import portalCatalog from '../../../i18n/portal.pt-BR.json';
import { PORTAL_ROUTES } from '../../../app.routes';
import { SessionFacade } from '../../../core/session.facade';
import { EntitlementFacade } from '../../../core/entitlement.facade';
import { ServiceCatalogFacade } from '../../../core/service-catalog.facade';
import { SESSION_FACADE_PRESETS } from '../../../../testing/session-facade.stub';
import { createEntitlementFacadeStub } from '../../../../testing/entitlement-facade.stub';
import { createServiceCatalogFacadeStub } from '../../../../testing/service-catalog-facade.stub';
import { createPortalRouterHarness } from '../../../../testing/router-harness';
import {
  AIT_DETAIL_FIXTURE,
  AIT_ID,
} from '../../../../testing/http-fixtures-reads';
import { portalErrorBody } from '../../../../testing/http-fixtures';
import { expectA11yStateInvariants } from '../../../../testing/a11y-state.spec-helper';

const catalog = portalCatalog as Record<string, string>;

async function mount(entitlementOk = true) {
  const harness = await createPortalRouterHarness(PORTAL_ROUTES, [
    AitDetailPageComponent,
    { provide: SessionFacade, useValue: SESSION_FACADE_PRESETS.avancada() },
    {
      provide: EntitlementFacade,
      useValue: createEntitlementFacadeStub(entitlementOk),
    },
    {
      provide: ServiceCatalogFacade,
      useValue: createServiceCatalogFacadeStub({ status: 'available' }),
    },
    StynxI18nModule.forRoot({
      defaultLocale: 'pt-BR',
      loadCatalog: async () => catalog,
    }),
  ]);
  await TestBed.inject(StynxI18nService).initialize();
  await harness.navigate(`/autos/${AIT_ID}`);
  return harness;
}

async function flushAit(
  harness: Awaited<ReturnType<typeof mount>>,
  body: unknown,
  status = 200,
) {
  const httpMock = harness.httpMock();
  const req = await vi.waitFor(() =>
    httpMock.expectOne(
      (candidate) => candidate.url === `/v1/portal/aits/${AIT_ID}`,
    ),
  );
  if (status === 200) {
    req.flush(body as any);
  } else {
    req.flush(body as any, { status, statusText: 'Error' });
  }
  const pointsReq = await vi
    .waitFor(
      () =>
        httpMock.expectOne(
          (candidate) => candidate.url === `/v1/portal/aits/${AIT_ID}/points`,
        ),
      { timeout: 200 },
    )
    .catch(() => null);
  pointsReq?.flush({ aitId: AIT_ID, pointsStatus: 'none', points: null });
}

describe('T-01 — três ações sempre juntas ([RN-PORTAL-127] a; T01 §9)', () => {
  it('dado actions [defend, indicate_driver, pay] available então portal-action-triplet com as três ações e foco no h1 após carregar', async () => {
    // C-3b-62
    const harness = await mount();
    await flushAit(harness, {
      ...AIT_DETAIL_FIXTURE,
      actions: [
        { key: 'defend', available: true, minimumAssurance: 'avancada' },
        {
          key: 'indicate_driver',
          available: true,
          minimumAssurance: 'avancada',
        },
        { key: 'pay', available: true, minimumAssurance: 'simples' },
      ],
    });
    const root = harness.harness.routeNativeElement as HTMLElement;
    const triplet = root.querySelector('portal-action-triplet');
    expect(triplet).not.toBeNull();
    expect(triplet?.querySelectorAll('[data-action]').length).toBe(3);
    const h1 = root.querySelector('h1[tabindex="-1"]');
    await vi.waitFor(() => expect(document.activeElement).toBe(h1));
  });
});

describe('T-01 — vazio (todas as ações indisponíveis)', () => {
  it('dado actions todas available false com reason então as três continuam renderizadas com aria-disabled e data-reason, e o texto de t01.state.empty aparece com alternative-channel-note', async () => {
    // C-3b-63
    const harness = await mount();
    await flushAit(harness, {
      ...AIT_DETAIL_FIXTURE,
      actions: [
        {
          key: 'defend',
          available: false,
          reason: 'r1',
          minimumAssurance: 'avancada',
        },
        {
          key: 'indicate_driver',
          available: false,
          reason: 'r2',
          minimumAssurance: 'avancada',
        },
        {
          key: 'pay',
          available: false,
          reason: 'r3',
          minimumAssurance: 'simples',
        },
      ],
    });
    const root = harness.harness.routeNativeElement as HTMLElement;
    expect(
      root.querySelectorAll('[data-action][aria-disabled="true"]').length,
    ).toBe(3);
    expect(root.textContent).toContain(
      catalog['portal.screens.t01.state.empty'],
    );
    expect(
      root.querySelector('portal-alternative-channel-note'),
    ).not.toBeNull();
  });
});

describe('T-01 — prazos (spec §2 inv. 2)', () => {
  it('dado deadlines [{ kind: T-DEF, dueOn, ownedBy: citizen }] então portal-deadline-card com data-owned-by citizen e data-token T-DEF; a página não contém new Date/Date.now/getTime', async () => {
    // C-3b-64
    const harness = await mount();
    await flushAit(harness, {
      ...AIT_DETAIL_FIXTURE,
      deadlines: [{ kind: 'T-DEF', dueOn: '2026-10-14', ownedBy: 'citizen' }],
    });
    const root = harness.harness.routeNativeElement as HTMLElement;
    const card = root.querySelector(
      'portal-deadline-card[data-owned-by="citizen"]',
    );
    expect(card?.getAttribute('data-token')).toBe('T-DEF');

    const fs = await import('node:fs/promises');
    let source = '';
    try {
      source = await fs.readFile(
        fileURLToPath(new URL('ait-detail.page.ts', import.meta.url)),
        'utf8',
      );
    } catch {
      return; // §9
    }
    expect(/new Date\(|Date\.now|\.getTime\(/.test(source)).toBe(false);
  });
});

describe('T-01 — openRequestId e pagamento já feito', () => {
  it('dado openRequestId então <a routerLink> com requests.nextAction.PROTOCOLADO; dado payment.paid true então texto de errors.payment_already_paid em role=status (não alert)', async () => {
    // C-3b-65
    const harness = await mount();
    await flushAit(harness, {
      ...AIT_DETAIL_FIXTURE,
      openRequestId: '00000000-0000-7000-8000-000070400009',
      payment: { tiers: [], paid: true, paidTier: 'desconto_80' },
    });
    const root = harness.harness.routeNativeElement as HTMLElement;
    const link = root.querySelector(
      'a[routerLink="/processos/00000000-0000-7000-8000-000070400009"]',
    );
    expect(link?.textContent).toContain(
      catalog['portal.requests.nextAction.PROTOCOLADO'],
    );
    const status = root.querySelector('[role="status"]');
    expect(status?.textContent).toContain(
      catalog['portal.errors.payment_already_paid'],
    );
    expect(root.querySelector('[role="alert"]')?.textContent).not.toContain(
      catalog['portal.errors.payment_already_paid'],
    );
  });
});

describe('T-01 — notificações', () => {
  it('dado notices [{ kind: NP, channel: sne, fictitious: true }] então data-token NP, texto de notifications.origin.sne e de notifications.ciencia_ficta; nenhum texto NP cru fora de data-*', async () => {
    // C-3b-66
    const harness = await mount();
    await flushAit(harness, {
      ...AIT_DETAIL_FIXTURE,
      notices: [
        {
          kind: 'NP',
          channel: 'sne',
          dispatchedOn: '2026-05-10',
          effectiveOn: '2026-06-10',
          fictitious: true,
          printedDeadline: null,
        },
      ],
    });
    const root = harness.harness.routeNativeElement as HTMLElement;
    const notice = root.querySelector('[data-token="NP"]');
    expect(notice).not.toBeNull();
    expect(root.textContent).toContain(
      catalog['portal.notifications.origin.sne'],
    );
    expect(root.textContent).toContain(
      catalog['portal.notifications.ciencia_ficta'],
    );
  });
});

describe('T-01 — erros de leitura', () => {
  it('dado 404 NOT_FOUND{kind:ait} então t01.state.ineligible e link por-que-nao-vejo (nunca tela vazia) [negativo]', async () => {
    // C-3b-67 (1.ª metade)
    const harness = await mount();
    await flushAit(
      harness,
      portalErrorBody('PORTAL.NOT_FOUND', 404, { kind: 'ait' }),
      404,
    );
    const root = harness.harness.routeNativeElement as HTMLElement;
    expect(root.textContent).toContain(
      catalog['portal.screens.t01.state.ineligible'],
    );
    expect(
      root.querySelector(
        'a[href*="por-que-nao-vejo"], a[routerLink*="por-que-nao-vejo"]',
      ),
    ).not.toBeNull();
  });

  it('dado 503 então t01.state.unavailable + retry', async () => {
    // C-3b-67 (2.ª metade)
    const harness = await mount();
    await flushAit(
      harness,
      portalErrorBody('PORTAL.NATIONAL_READ_UNAVAILABLE', 503),
      503,
    );
    const root = harness.harness.routeNativeElement as HTMLElement;
    expect(root.textContent).toContain(
      catalog['portal.screens.t01.state.unavailable'],
    );
    expect(root.querySelector('[data-next-step="retry"]')).not.toBeNull();
  });
});

describe('T-01 — a11y por estado (§7; A10(j) — cobertura integral: loading, ready, empty, not_found, error, unavailable, offline)', () => {
  it('dado loading (antes de qualquer flush) então h1 único, região de estado e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-01, loading)
    const harness = await mount();
    const root = harness.harness.routeNativeElement as HTMLElement;
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado ready então h1 único, região de estado e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-01, ready)
    const harness = await mount();
    await flushAit(harness, {
      ...AIT_DETAIL_FIXTURE,
      actions: [
        { key: 'defend', available: true, minimumAssurance: 'avancada' },
        {
          key: 'indicate_driver',
          available: true,
          minimumAssurance: 'avancada',
        },
        { key: 'pay', available: true, minimumAssurance: 'simples' },
      ],
    });
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.querySelector('portal-action-triplet')).not.toBeNull(),
    );
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado empty (todas as ações indisponíveis) então h1 único, região de estado e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-01, empty)
    const harness = await mount();
    await flushAit(harness, {
      ...AIT_DETAIL_FIXTURE,
      actions: [
        {
          key: 'defend',
          available: false,
          reason: 'r1',
          minimumAssurance: 'avancada',
        },
        {
          key: 'indicate_driver',
          available: false,
          reason: 'r2',
          minimumAssurance: 'avancada',
        },
        {
          key: 'pay',
          available: false,
          reason: 'r3',
          minimumAssurance: 'simples',
        },
      ],
    });
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.textContent).toContain(
        catalog['portal.screens.t01.state.empty'],
      ),
    );
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado not_found (404) então h1 único, região de estado, foco no banner e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-01, not_found)
    const harness = await mount();
    await flushAit(
      harness,
      portalErrorBody('PORTAL.NOT_FOUND', 404, { kind: 'ait' }),
      404,
    );
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.textContent).toContain(
        catalog['portal.screens.t01.state.ineligible'],
      ),
    );
    await expectA11yStateInvariants(root, catalog, {
      errorBannerFocused: true,
    });
  });

  it('dado error (500, código fora do catálogo) então h1 único, região de estado, foco no banner e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-01, error)
    const harness = await mount();
    await flushAit(
      harness,
      portalErrorBody('PORTAL.INTERNAL_TEST_ERROR', 500),
      500,
    );
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() => {
      const found = root.querySelector('[role="alert"]');
      expect(found?.textContent?.trim()).toBeTruthy();
    });
    await expectA11yStateInvariants(root, catalog, {
      errorBannerFocused: true,
    });
  });

  it('dado unavailable (503) então h1 único, região de estado, foco no banner e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-01, unavailable)
    const harness = await mount();
    await flushAit(
      harness,
      portalErrorBody('PORTAL.NATIONAL_READ_UNAVAILABLE', 503),
      503,
    );
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.textContent).toContain(
        catalog['portal.screens.t01.state.unavailable'],
      ),
    );
    await expectA11yStateInvariants(root, catalog, {
      errorBannerFocused: true,
    });
  });

  it('dado offline (status 0, navigator.onLine false) então h1 único, região de estado, foco no banner e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-01, offline; M14)
    const harness = await mount();
    const onLineSpy = vi.spyOn(window.navigator, 'onLine', 'get');
    onLineSpy.mockReturnValue(false);
    const httpMock = harness.httpMock();
    const req = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) => candidate.url === `/v1/portal/aits/${AIT_ID}`,
      ),
    );
    req.error(new ProgressEvent('error'), {
      status: 0,
      statusText: 'Unknown Error',
    });
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.textContent).toContain(catalog['portal.states.offline']),
    );
    await expectA11yStateInvariants(root, catalog, {
      errorBannerFocused: true,
    });
    onLineSpy.mockRestore();
  });
});
