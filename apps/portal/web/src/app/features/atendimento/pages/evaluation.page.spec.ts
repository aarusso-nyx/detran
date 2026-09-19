// R-0014 TASK-0017 (Inspector). CTG-0003c §6 T-26 (`EvaluationPageComponent`); página real,
// ainda inexistente (§1) — "Cannot find module" até TASK-0018 (esperado, §9). Rota com
// `entitlementGuard('request')` (route-manifest.fixture #33).
import { EvaluationPageComponent } from './evaluation.page'; // §9.
import { TestBed } from '@angular/core/testing';
import { StynxI18nModule, StynxI18nService } from '@stynx-nyx/angular-i18n';
import portalCatalog from '../../../i18n/portal.pt-BR.json';
import { PORTAL_ROUTES } from '../../../app.routes';
import { SessionFacade } from '../../../core/session.facade';
import { EntitlementFacade } from '../../../core/entitlement.facade';
import { ServiceCatalogFacade } from '../../../core/service-catalog.facade';
import { createSessionFacadeStub } from '../../../../testing/session-facade.stub';
import { createEntitlementFacadeStub } from '../../../../testing/entitlement-facade.stub';
import { createServiceCatalogFacadeStub } from '../../../../testing/service-catalog-facade.stub';
import { createPortalRouterHarness } from '../../../../testing/router-harness';
import { expectA11yStateInvariants } from '../../../../testing/a11y-state.spec-helper';
import {
  REQUEST_ADESAO_SNE_ID,
  portalErrorBody,
} from '../../../../testing/http-fixtures-pair3';

const catalog = portalCatalog as Record<string, string>;

const REQUEST_DETAIL_RESULTADO_FIXTURE = {
  request: {
    requestId: REQUEST_ADESAO_SNE_ID,
    state: 'RESULTADO_DISPONIVEL',
    serviceKey: 'adesao_sne',
    targetKind: 'none',
    targetId: null,
    channel: 'portal',
    minimumAssurance: 'avancada',
    delegation: {
      status: 'delegated',
      domain: null,
      command: null,
      externalId: null,
      error: null,
    },
    protocol: {
      number: 'AM-1',
      issuedAt: '2026-09-02',
      channel: 'portal',
      receiptHash: '0'.repeat(64),
    },
    draft: null,
    withdrawnAt: null,
    createdAt: '2026-09-02',
    updatedAt: '2026-09-02',
    version: 1,
  },
  timeline: [],
  deadlines: [],
  documents: [],
  diligences: [],
  decision: null,
  actions: {
    canRespondDiligence: false,
    canWithdraw: false,
    withdrawalBlockedReason: null,
    canAppeal: false,
    nextInstanceServiceKey: null,
  },
};

async function mount() {
  const harness = await createPortalRouterHarness(PORTAL_ROUTES, [
    EvaluationPageComponent,
    {
      provide: SessionFacade,
      useValue: createSessionFacadeStub({
        active: true,
        assuranceLevel: 'simples',
      }),
    },
    { provide: EntitlementFacade, useValue: createEntitlementFacadeStub(true) },
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
  await harness.navigate(`/avaliacao/${REQUEST_ADESAO_SNE_ID}`);
  return harness;
}

async function flush(
  harness: Awaited<ReturnType<typeof mount>>,
  body: unknown,
  options?: { status: number; statusText: string },
) {
  const httpMock = harness.httpMock();
  const req = await vi.waitFor(() =>
    httpMock.expectOne(
      (candidate) =>
        candidate.url === `/v1/portal/requests/${REQUEST_ADESAO_SNE_ID}`,
    ),
  );
  if (options) {
    req.flush(body as any, options);
  } else {
    req.flush(body as any);
  }
}

function submitEvaluation(root: HTMLElement): void {
  for (const dimension of [
    'satisfaction',
    'quality',
    'deadline',
    'clarity',
    'channel',
  ]) {
    const input = root.querySelector<HTMLInputElement>(
      `input[name="scores.${dimension}"]`,
    )!;
    input.value = '5';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }
  const form = root.querySelector('form')!;
  form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
}

describe('T-26 — data-screen (§1 inv.; M8)', () => {
  it('dado a rota /avaliacao/<id> então host [data-screen]="T-26"', async () => {
    // C-3c-100 (T-26)
    const harness = await mount();
    await flush(harness, REQUEST_DETAIL_RESULTADO_FIXTURE);
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.getAttribute('data-screen')).toBe('T-26'),
    );
  });
});

describe('T-26 — a11y por estado (§6/§7.3 — cobertura integral: carregando, ready, sem_permissao, indisponivel, sem_elegibilidade, erro_recuperavel, sucesso)', () => {
  it('dado carregando (antes do flush) então axe sem violação serious/critical', async () => {
    const harness = await mount();
    const root = harness.harness.routeNativeElement as HTMLElement;
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado o pedido elegível (ready) então axe sem violação serious/critical', async () => {
    const harness = await mount();
    await flush(harness, REQUEST_DETAIL_RESULTADO_FIXTURE);
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.getAttribute('data-screen')).toBe('T-26'),
    );
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado sem_permissao (404 NOT_FOUND) então axe sem violação serious/critical', async () => {
    const harness = await mount();
    await flush(
      harness,
      portalErrorBody('PORTAL.NOT_FOUND', 404, { kind: 'request' }),
      { status: 404, statusText: 'Not Found' },
    );
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.textContent).toContain(
        catalog['portal.screens.t26.state.sem_permissao'],
      ),
    );
    await expectA11yStateInvariants(root, catalog, {
      errorBannerFocused: true,
    });
  });

  it('dado indisponivel (500) então axe sem violação serious/critical', async () => {
    const harness = await mount();
    await flush(harness, portalErrorBody('PORTAL.INTERNAL', 500), {
      status: 500,
      statusText: 'Internal Server Error',
    });
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.textContent).toContain(
        catalog['portal.screens.t26.state.indisponivel'],
      ),
    );
    await expectA11yStateInvariants(root, catalog, {
      errorBannerFocused: true,
    });
  });

  it('dado sem_elegibilidade (409 EVALUATION_NOT_OFFERED) então axe sem violação serious/critical', async () => {
    const harness = await mount();
    await flush(harness, REQUEST_DETAIL_RESULTADO_FIXTURE);
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.getAttribute('data-screen')).toBe('T-26'),
    );
    submitEvaluation(root);
    const httpMock = harness.httpMock();
    const req = await vi.waitFor(() =>
      httpMock.expectOne('/v1/portal/evaluations'),
    );
    req.flush(portalErrorBody('PORTAL.EVALUATION_NOT_OFFERED', 409), {
      status: 409,
      statusText: 'Conflict',
    });
    await vi.waitFor(() =>
      expect(root.textContent).toContain(
        catalog['portal.screens.t26.state.sem_elegibilidade'],
      ),
    );
    await expectA11yStateInvariants(root, catalog, {
      errorBannerFocused: true,
    });
  });

  it('dado erro_recuperavel (409 EVALUATION_ALREADY_SUBMITTED) então axe sem violação serious/critical', async () => {
    const harness = await mount();
    await flush(harness, REQUEST_DETAIL_RESULTADO_FIXTURE);
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.getAttribute('data-screen')).toBe('T-26'),
    );
    submitEvaluation(root);
    const httpMock = harness.httpMock();
    const req = await vi.waitFor(() =>
      httpMock.expectOne('/v1/portal/evaluations'),
    );
    req.flush(portalErrorBody('PORTAL.EVALUATION_ALREADY_SUBMITTED', 409), {
      status: 409,
      statusText: 'Conflict',
    });
    await vi.waitFor(() =>
      expect(root.textContent).toContain(
        catalog['portal.screens.t26.state.erro_recuperavel'],
      ),
    );
    await expectA11yStateInvariants(root, catalog, {
      errorBannerFocused: true,
    });
  });

  it('dado sucesso (201) então axe sem violação serious/critical', async () => {
    const harness = await mount();
    await flush(harness, REQUEST_DETAIL_RESULTADO_FIXTURE);
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.getAttribute('data-screen')).toBe('T-26'),
    );
    submitEvaluation(root);
    const httpMock = harness.httpMock();
    const req = await vi.waitFor(() =>
      httpMock.expectOne('/v1/portal/evaluations'),
    );
    req.flush({
      evaluationId: 'e-1',
      subjectKind: 'request',
      subjectId: REQUEST_ADESAO_SNE_ID,
      state: 'AVALIADA',
      submittedAt: '2026-09-14',
      publicNotice: 'portal.evaluations.publicIndicator',
    });
    await vi.waitFor(() =>
      expect(root.textContent).toContain(
        catalog['portal.evaluations.publicIndicator'],
      ),
    );
    await expectA11yStateInvariants(root, catalog);
  });
});
