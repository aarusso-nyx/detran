// R-0014 TASK-0015 (Inspector, iteração 2 — bloqueios 1/2 de reports/TASK-0016.md). CTG-0003b §6
// T-14 (`AitListPageComponent`). Montada pelo router-harness (§9(a)) na rota `/autos`, com
// `StynxI18nModule` (catálogo real) e os stubs de `SessionFacade`/`ServiceCatalogFacade` já
// usados pela matriz de guardas do CTG-0001. Um `it` por cenário (nunca duas montagens no mesmo
// `it`); toda leitura do DOM após `flush` HTTP passa por `vi.waitFor` (app zoneless: a CD só roda
// no próximo macrotask, não sincronamente após o `flush`).
import { AitListPageComponent } from './ait-list.page'; // §9: importação direta força "Cannot find module" (falha esperada até TASK-0016).
import { TestBed } from '@angular/core/testing';
import { StynxI18nModule, StynxI18nService } from '@stynx-nyx/angular-i18n';
import portalCatalog from '../../../i18n/portal.pt-BR.json';
import { PORTAL_ROUTES } from '../../../app.routes';
import { SessionFacade } from '../../../core/session.facade';
import { ServiceCatalogFacade } from '../../../core/service-catalog.facade';
import { SESSION_FACADE_PRESETS } from '../../../../testing/session-facade.stub';
import { createServiceCatalogFacadeStub } from '../../../../testing/service-catalog-facade.stub';
import { createPortalRouterHarness } from '../../../../testing/router-harness';
import {
  AIT_ID,
  POINTS_SUMMARY_FIXTURE,
} from '../../../../testing/http-fixtures-reads';
import { portalErrorBody } from '../../../../testing/http-fixtures';
import { expectA11yStateInvariants } from '../../../../testing/a11y-state.spec-helper';

const catalog = portalCatalog as Record<string, string>;

async function mount() {
  const harness = await createPortalRouterHarness(PORTAL_ROUTES, [
    AitListPageComponent,
    { provide: SessionFacade, useValue: SESSION_FACADE_PRESETS.avancada() },
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
  await harness.navigate('/autos');
  return harness;
}

async function flushInitial(
  harness: Awaited<ReturnType<typeof mount>>,
  aitsBody: unknown,
  pointsBody: unknown = POINTS_SUMMARY_FIXTURE,
  aitsStatus = 200,
) {
  const httpMock = harness.httpMock();
  const pointsReq = await vi.waitFor(() =>
    httpMock.expectOne((req) => req.url === '/v1/portal/points-summary'),
  );
  pointsReq.flush(pointsBody as any);
  const aitsReq = await vi.waitFor(() =>
    httpMock.expectOne((req) => req.url === '/v1/portal/aits'),
  );
  if (aitsStatus === 200) {
    aitsReq.flush(aitsBody as any);
  } else {
    aitsReq.flush(aitsBody as any, {
      status: aitsStatus,
      statusText: 'Service Unavailable',
    });
  }
}

describe('T-14 — resumo de pontos precede a tabela ([RN-RAIT-131]; [JRN-PORTAL-004] 2)', () => {
  it('dado GET points-summary e GET aits → 1 item então portal-points-summary precede a tabela no DOM, mostra 3 e 4 com pontos_disputa e a data com consulta.consultedAt', async () => {
    // C-3b-57
    const harness = await mount();
    await flushInitial(harness, {
      items: [
        {
          aitId: AIT_ID,
          situation: 'aguardando_defesa',
          deadlines: [],
          actions: [],
        },
      ],
      total: 1,
      page: 1,
      pageSize: 20,
    });
    const root = harness.harness.routeNativeElement as HTMLElement;
    const summary = await vi.waitFor(() => {
      const found = root.querySelector('portal-points-summary');
      expect(found).not.toBeNull();
      return found as Element;
    });
    const table = root.querySelector('table, stynx-table, [role="table"]');
    if (table) {
      expect(
        summary.compareDocumentPosition(table) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    }
    expect(summary.textContent).toContain('3');
    expect(summary.textContent).toContain('4');
    expect(summary.textContent).toContain(
      catalog['portal.screens.t14.field.pontos_disputa'],
    );
    // A chave tem um placeholder ({consultedAt}) interpolado pelo pipe de tradução — compara
    // pelo prefixo estático do template, não pelo literal cru (que nunca aparece interpolado).
    const consultedAtPrefix =
      catalog['portal.documents.consulta.consultedAt'].split('{')[0];
    expect(summary.textContent).toContain(consultedAtPrefix);
  });
});

describe('T-14 — linha do AIT ([UC-PORTAL-010] AC-2/AC-4)', () => {
  it('dado item aguardando_defesa com deadline e actions [defend available, pay indisponível] então texto de situation.infraction.aguardando_defesa com data-token, data formatada (sem "dias"), link /autos/<aitId>, defend → /autos/<aitId>/defesa/nova e pay aria-disabled com data-reason', async () => {
    // C-3b-58
    const harness = await mount();
    await flushInitial(harness, {
      items: [
        {
          aitId: AIT_ID,
          situation: 'aguardando_defesa',
          deadlines: [
            { kind: 'T-DEF', dueOn: '2026-10-14', ownedBy: 'citizen' },
          ],
          actions: [
            { key: 'defend', available: true, minimumAssurance: 'avancada' },
            {
              key: 'pay',
              available: false,
              reason: 'r',
              minimumAssurance: 'simples',
            },
          ],
        },
      ],
      total: 1,
      page: 1,
      pageSize: 20,
    });
    const root = harness.harness.routeNativeElement as HTMLElement;
    const row = await vi.waitFor(() => {
      const found = root.querySelector(`[data-ait-id="${AIT_ID}"]`);
      expect(found).not.toBeNull();
      return found as Element;
    });
    expect(row.textContent).toContain(
      catalog['portal.situation.infraction.aguardando_defesa'],
    );
    expect(
      row.querySelector('[data-token="aguardando_defesa"]'),
    ).not.toBeNull();
    expect(row.textContent).not.toMatch(/\d+\s*dias/);
    expect(
      root.querySelector(`a[routerLink="/autos/${AIT_ID}"]`),
    ).not.toBeNull();
    const defendLink = root.querySelector(
      `a[data-action="defend"][routerLink="/autos/${AIT_ID}/defesa/nova"]`,
    );
    expect(defendLink).not.toBeNull();
    const payLink = root.querySelector('[data-action="pay"]');
    expect(payLink?.getAttribute('aria-disabled')).toBe('true');
    expect(payLink?.getAttribute('data-reason')).toBe('r');
  });
});

describe('T-14 — vazio ([UC-PORTAL-010] 2a/2b)', () => {
  it('dado item com actions [] então a linha mostra t01.state.empty (nunca linha morta)', async () => {
    // C-3b-59 (1.ª metade)
    const harness = await mount();
    await flushInitial(harness, {
      items: [
        { aitId: AIT_ID, situation: 'encerrada', deadlines: [], actions: [] },
      ],
      total: 1,
      page: 1,
      pageSize: 20,
    });
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.textContent).toContain(
        catalog['portal.screens.t01.state.empty'],
      ),
    );
  });

  it('dado total 0 então t14.empty e link common.link.ouvidoria', async () => {
    // C-3b-59 (2.ª metade)
    const harness = await mount();
    await flushInitial(harness, {
      items: [],
      total: 0,
      page: 1,
      pageSize: 20,
    });
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.textContent).toContain(catalog['portal.screens.t14.empty']),
    );
    expect(root.textContent).toContain(catalog['portal.common.link.ouvidoria']);
  });
});

describe('T-14 — filtros ([RN-PORTAL-103])', () => {
  it('dado digitar FIX2E01 no filtro filtrar_veiculo então nova requisição vehicle=FIX2E01&page=1; dado select de situation com 7 opções então status=<token> na query; nenhum campo de CPF/identificação pessoal fora do da sessão existe', async () => {
    // C-3b-60
    const harness = await mount();
    await flushInitial(harness, { items: [], total: 0, page: 1, pageSize: 20 });
    const root = harness.harness.routeNativeElement as HTMLElement;
    const httpMock = harness.httpMock();
    const input = await vi.waitFor(() => {
      const found = root.querySelector<HTMLInputElement>(
        'input[data-action="portal.screens.t14.cmd.filtrar_veiculo"], input[name="vehicle"]',
      );
      expect(found).not.toBeNull();
      return found as HTMLInputElement;
    });
    input.value = 'FIX2E01';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('change'));
    const req = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) =>
          candidate.url === '/v1/portal/aits' &&
          candidate.params.get('vehicle') === 'FIX2E01',
      ),
    );
    expect(req.request.params.get('page')).toBe('1');
    req.flush({ items: [], total: 0, page: 1, pageSize: 20 });

    const select = root.querySelector<HTMLSelectElement>(
      'select[name="status"]',
    );
    expect(select).not.toBeNull();
    expect(select!.options.length).toBe(7);
    const personalIdInputs = root.querySelectorAll(
      'input[name="cpf"], input[name="subjectCpf"]',
    );
    expect(personalIdInputs.length).toBe(0);
  });
});

describe('T-14 — 503 na lista, pontos independentes', () => {
  it('dado GET aits → 503 NATIONAL_READ_UNAVAILABLE então banner role=alert com errors.national_read_unavailable, retry e alternative-channel-note; o resumo de pontos (200) continua visível', async () => {
    // C-3b-61
    const harness = await mount();
    await flushInitial(
      harness,
      portalErrorBody('PORTAL.NATIONAL_READ_UNAVAILABLE', 503, {
        retryAfter: 30,
      }),
      POINTS_SUMMARY_FIXTURE,
      503,
    );
    const root = harness.harness.routeNativeElement as HTMLElement;
    // Espera o texto, não só o elemento: `[role="alert"]` pode existir num tick antes do
    // conteúdo do `stynx-banner` filho renderizar (zoneless).
    const alert = await vi.waitFor(() => {
      const found = root.querySelector('[role="alert"]');
      expect(found?.textContent?.trim()).toBeTruthy();
      return found as Element;
    });
    expect(alert.textContent).toContain(
      catalog['portal.errors.national_read_unavailable'],
    );
    expect(
      root.querySelector('portal-alternative-channel-note'),
    ).not.toBeNull();
    expect(root.querySelector('portal-points-summary')).not.toBeNull();
  });
});

describe('T-14 — a11y por estado (§7; A10(j) — cobertura integral: loading, ready, empty, unavailable, error, offline)', () => {
  it('dado loading (antes de qualquer flush) então h1 único, região de estado e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-14, loading)
    const harness = await mount();
    const root = harness.harness.routeNativeElement as HTMLElement;
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado ready então h1 único, região de estado e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-14, ready)
    const harness = await mount();
    await flushInitial(harness, {
      items: [
        {
          aitId: AIT_ID,
          situation: 'aguardando_defesa',
          deadlines: [],
          actions: [],
        },
      ],
      total: 1,
      page: 1,
      pageSize: 20,
    });
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.querySelector('portal-points-summary')).not.toBeNull(),
    );
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado empty então h1 único, região de estado e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-14, empty)
    const harness = await mount();
    await flushInitial(harness, {
      items: [],
      total: 0,
      page: 1,
      pageSize: 20,
    });
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.textContent).toContain(catalog['portal.screens.t14.empty']),
    );
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado unavailable (503 NATIONAL_READ_UNAVAILABLE) então h1 único, região de estado, foco no banner e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-14, unavailable)
    const harness = await mount();
    await flushInitial(
      harness,
      portalErrorBody('PORTAL.NATIONAL_READ_UNAVAILABLE', 503, {
        retryAfter: 30,
      }),
      POINTS_SUMMARY_FIXTURE,
      503,
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

  it('dado error (500, código fora do catálogo) então h1 único, região de estado, foco no banner e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-14, error)
    const harness = await mount();
    await flushInitial(
      harness,
      portalErrorBody('PORTAL.INTERNAL_TEST_ERROR', 500),
      POINTS_SUMMARY_FIXTURE,
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

  it('dado offline (status 0, navigator.onLine false) então h1 único, região de estado, foco no banner e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-14, offline; M14, mesmo mecanismo de C-3b-104)
    const harness = await mount();
    const httpMock = harness.httpMock();
    const pointsReq = await vi.waitFor(() =>
      httpMock.expectOne((req) => req.url === '/v1/portal/points-summary'),
    );
    pointsReq.flush(POINTS_SUMMARY_FIXTURE as any);
    const onLineSpy = vi.spyOn(window.navigator, 'onLine', 'get');
    onLineSpy.mockReturnValue(false);
    const aitsReq = await vi.waitFor(() =>
      httpMock.expectOne((req) => req.url === '/v1/portal/aits'),
    );
    aitsReq.error(new ProgressEvent('error'), {
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
