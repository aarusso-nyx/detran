// R-0014 TASK-0017 (Inspector). CTG-0003c §6 T-20 (`ExamListPageComponent`); página real, ainda
// inexistente (§1) — "Cannot find module" até TASK-0018 (esperado, §9). C-3c-39/40 (DOM):
// texto legal exibido tal qual e link à junta só com `boardDueOn`.
import { ExamListPageComponent } from './exam-list.page'; // §9: "Cannot find module" esperado.
import { TestBed } from '@angular/core/testing';
import { StynxI18nModule, StynxI18nService } from '@stynx-nyx/angular-i18n';
import portalCatalog from '../../../i18n/portal.pt-BR.json';
import { PORTAL_ROUTES } from '../../../app.routes';
import { SessionFacade } from '../../../core/session.facade';
import { ServiceCatalogFacade } from '../../../core/service-catalog.facade';
import { createSessionFacadeStub } from '../../../../testing/session-facade.stub';
import { createServiceCatalogFacadeStub } from '../../../../testing/service-catalog-facade.stub';
import { createPortalRouterHarness } from '../../../../testing/router-harness';
import { expectA11yStateInvariants } from '../../../../testing/a11y-state.spec-helper';
import {
  EXAM_ID,
  portalErrorBody,
} from '../../../../testing/http-fixtures-pair3';

const catalog = portalCatalog as Record<string, string>;

async function mount() {
  const harness = await createPortalRouterHarness(PORTAL_ROUTES, [
    ExamListPageComponent,
    {
      provide: SessionFacade,
      useValue: createSessionFacadeStub({
        active: true,
        assuranceLevel: 'simples',
      }),
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
  await harness.navigate('/exames');
  return harness;
}

async function flush(
  harness: Awaited<ReturnType<typeof mount>>,
  body: unknown,
) {
  const httpMock = harness.httpMock();
  const req = await vi.waitFor(() =>
    httpMock.expectOne((candidate) => candidate.url === '/v1/portal/exams'),
  );
  req.flush(body as any);
}

describe('T-20 — data-screen e legalLabel tal qual, sem link quando boardDueOn null (§1 inv.; RN-PEC-105; UC-014 4a) [negativo]', () => {
  it("dado item { legalLabel:'apto com restrições', boardDueOn:null } então o texto aparece tal qual e não há link para junta", async () => {
    // C-3c-100/C-3c-39 (T-20, DOM)
    const harness = await mount();
    await flush(harness, {
      items: [
        {
          examId: EXAM_ID,
          legalLabel: 'apto com restrições',
          validUntil: '2031-05-01',
          boardDueOn: null,
        },
      ],
      total: 1,
      page: 1,
      pageSize: 20,
    });
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.getAttribute('data-screen')).toBe('T-20'),
    );
    await vi.waitFor(() => {
      const row = root.querySelector(`[data-exam-id="${EXAM_ID}"]`);
      expect(row?.textContent).toContain('apto com restrições');
    });
    const row = root.querySelector(`[data-exam-id="${EXAM_ID}"]`);
    expect(
      row?.querySelector(`a[routerLink="/exames/${EXAM_ID}/junta/nova"]`),
    ).toBeNull();
  });
});

describe('T-20 — link à junta com boardDueOn (§3.5; UC-014 AC-4)', () => {
  it("dado item { legalLabel:'inapto', boardDueOn:'2026-10-14' } então DeadlineCard ownedBy citizen e link /exames/<id>/junta/nova presentes", async () => {
    // C-3c-40 (T-20, DOM)
    const harness = await mount();
    await flush(harness, {
      items: [
        {
          examId: EXAM_ID,
          legalLabel: 'inapto',
          validUntil: null,
          boardDueOn: '2026-10-14',
        },
      ],
      total: 1,
      page: 1,
      pageSize: 20,
    });
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.getAttribute('data-screen')).toBe('T-20'),
    );
    const row = root.querySelector(`[data-exam-id="${EXAM_ID}"]`);
    expect(row?.querySelector('portal-deadline-card')).not.toBeNull();
    expect(
      row?.querySelector(`a[routerLink="/exames/${EXAM_ID}/junta/nova"]`),
    ).not.toBeNull();
  });
});

describe('T-20 — a11y por estado (§6/§7.3 — cobertura integral: carregando, ready, vazio, erro_recuperavel, indisponivel, offline)', () => {
  it('dado carregando (antes do flush) então axe sem violação serious/critical', async () => {
    const harness = await mount();
    const root = harness.harness.routeNativeElement as HTMLElement;
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado com itens (ready) então axe sem violação serious/critical', async () => {
    const harness = await mount();
    await flush(harness, {
      items: [
        {
          examId: EXAM_ID,
          legalLabel: 'apto',
          validUntil: '2031-05-01',
          boardDueOn: null,
        },
      ],
      total: 1,
      page: 1,
      pageSize: 20,
    });
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.getAttribute('data-screen')).toBe('T-20'),
    );
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado vazio então axe sem violação serious/critical', async () => {
    const harness = await mount();
    await flush(harness, { items: [], total: 0, page: 1, pageSize: 20 });
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.textContent).toContain(
        catalog['portal.screens.t20.state.vazio'],
      ),
    );
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado erro_recuperavel (EXAM_PROCESSING{expectedBy}) então axe sem violação serious/critical', async () => {
    const harness = await mount();
    const httpMock = harness.httpMock();
    const req = await vi.waitFor(() =>
      httpMock.expectOne((candidate) => candidate.url === '/v1/portal/exams'),
    );
    req.flush(
      portalErrorBody('PORTAL.EXAM_PROCESSING', 422, {
        expectedBy: '2026-10-01',
      }),
      { status: 422, statusText: 'Unprocessable Entity' },
    );
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.textContent).toContain(
        catalog['portal.screens.t20.state.erro_recuperavel'],
      ),
    );
    // EXAM_PROCESSING é severidade 'info' (ERROR_PRESENTATION) — role="status", sem foco forçado.
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado indisponivel (503) então axe sem violação serious/critical', async () => {
    const harness = await mount();
    const httpMock = harness.httpMock();
    const req = await vi.waitFor(() =>
      httpMock.expectOne((candidate) => candidate.url === '/v1/portal/exams'),
    );
    req.flush(portalErrorBody('PORTAL.NATIONAL_READ_UNAVAILABLE', 503), {
      status: 503,
      statusText: 'Service Unavailable',
    });
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() => {
      const found = root.querySelector('[role="alert"]');
      expect(found?.textContent?.trim()).toBeTruthy();
    });
    await expectA11yStateInvariants(root, catalog, {
      errorBannerFocused: true,
    });
  });

  it('dado offline (navigator.onLine false) então axe sem violação serious/critical', async () => {
    // A12(a): offline real — o ErrorBoundary só classifica offline com status 0 E onLine false.
    const onLineSpy = vi.spyOn(window.navigator, 'onLine', 'get');
    onLineSpy.mockReturnValue(false);
    const harness = await mount();
    const httpMock = harness.httpMock();
    const req = await vi.waitFor(() =>
      httpMock.expectOne((candidate) => candidate.url === '/v1/portal/exams'),
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
