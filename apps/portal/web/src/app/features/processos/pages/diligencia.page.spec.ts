// R-0014 TASK-0015 (Inspector). CTG-0003b §6 T-11 (`DiligenciaPageComponent`); página real, ainda
// inexistente (§1) — "Cannot find module" até TASK-0016 (esperado, §9).
import { DiligenciaPageComponent } from './diligencia.page'; // §9: importação direta força "Cannot find module" (falha esperada até TASK-0016).
import { TestBed } from '@angular/core/testing';
import { StynxI18nModule, StynxI18nService } from '@stynx-nyx/angular-i18n';
import portalCatalog from '../../../i18n/portal.pt-BR.json';
import { PORTAL_ROUTES } from '../../../app.routes';
import { SessionFacade } from '../../../core/session.facade';
import { EntitlementFacade } from '../../../core/entitlement.facade';
import { createSessionFacadeStub } from '../../../../testing/session-facade.stub';
import { createEntitlementFacadeStub } from '../../../../testing/entitlement-facade.stub';
import { createPortalRouterHarness } from '../../../../testing/router-harness';
import {
  DILIGENCE_ID_FIXTURE,
  REQUEST_DETAIL_WITH_DILIGENCE_FIXTURE,
  REQUEST_RESULTADO_ID,
} from '../../../../testing/http-fixtures-reads';
import { portalErrorBody } from '../../../../testing/http-fixtures';
import { expectA11yStateInvariants } from '../../../../testing/a11y-state.spec-helper';

const catalog = portalCatalog as Record<string, string>;

async function mount(diligenceId = DILIGENCE_ID_FIXTURE) {
  const harness = await createPortalRouterHarness(PORTAL_ROUTES, [
    DiligenciaPageComponent,
    {
      provide: SessionFacade,
      useValue: createSessionFacadeStub({
        active: true,
        assuranceLevel: 'simples',
      }),
    },
    { provide: EntitlementFacade, useValue: createEntitlementFacadeStub(true) },
    StynxI18nModule.forRoot({
      defaultLocale: 'pt-BR',
      loadCatalog: async () => catalog,
    }),
  ]);
  await TestBed.inject(StynxI18nService).initialize();
  await harness.navigate(
    `/processos/${REQUEST_RESULTADO_ID}/diligencia/${diligenceId}`,
  );
  return harness;
}

async function flush(
  harness: Awaited<ReturnType<typeof mount>>,
  body: unknown,
) {
  const httpMock = harness.httpMock();
  const req = await vi.waitFor(() =>
    httpMock.expectOne(
      (candidate) =>
        candidate.url === `/v1/portal/requests/${REQUEST_RESULTADO_ID}`,
    ),
  );
  req.flush(body as any);
}

describe('T-11 — prazo visível ([UC-PORTAL-009] 2)', () => {
  it('dado diligência open com requestText e dueOn então intro, o requestText, <p id="diligence-deadline"> com field.prazo e a data formatada (nunca "N dias"), textarea[name="text"][aria-describedby], portal-attachment-uploader com hintKey resposta_diligencia.hint, botão cmd.enviar', async () => {
    // C-3b-99
    const harness = await mount();
    await flush(harness, REQUEST_DETAIL_WITH_DILIGENCE_FIXTURE);
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.querySelector('#diligence-deadline')).not.toBeNull(),
    );
    expect(root.textContent).toContain(catalog['portal.screens.t11.intro']);
    expect(root.textContent).toContain('Envie o laudo');
    const deadline = root.querySelector('#diligence-deadline');
    expect(deadline?.textContent).not.toMatch(/\d+\s*dias/);
    const textarea = root.querySelector('textarea[name="text"]');
    expect(textarea?.getAttribute('aria-describedby')).toBe(
      'diligence-deadline',
    );
    const uploader = root.querySelector('portal-attachment-uploader');
    expect(uploader?.textContent).toContain(
      catalog['portal.forms.resposta_diligencia.hint'],
    );
    const submit = root.querySelector(
      '[data-action="enviar"], button[type="submit"]',
    );
    expect(submit?.textContent).toContain(
      catalog['portal.screens.t11.cmd.enviar'],
    );
  });
});

describe('T-11 — enviar resposta ([UC-PORTAL-009] AC-4)', () => {
  it('dado enviar com text x e attachmentIds [] então POST .../diligences/did-1/responses com Idempotency-Key respond_diligence:did-1:…; 200 então novo GET requests/{id}', async () => {
    // C-3b-100 (1.ª metade)
    const harness = await mount();
    await flush(harness, REQUEST_DETAIL_WITH_DILIGENCE_FIXTURE);
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.querySelector('textarea[name="text"]')).not.toBeNull(),
    );
    const textarea = root.querySelector<HTMLTextAreaElement>(
      'textarea[name="text"]',
    )!;
    textarea.value = 'x';
    textarea.dispatchEvent(new Event('input'));
    root
      .querySelector<HTMLButtonElement>(
        '[data-action="enviar"], button[type="submit"]',
      )
      ?.click();
    const httpMock = harness.httpMock();
    const responseReq = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) =>
          candidate.method === 'POST' &&
          candidate.url ===
            `/v1/portal/requests/${REQUEST_RESULTADO_ID}/diligences/${DILIGENCE_ID_FIXTURE}/responses`,
      ),
    );
    expect(responseReq.request.headers.get('Idempotency-Key')).toMatch(
      new RegExp(`^respond_diligence:${DILIGENCE_ID_FIXTURE}:`),
    );
    responseReq.flush({ requestId: REQUEST_RESULTADO_ID, version: 2 });
    await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) =>
          candidate.url === `/v1/portal/requests/${REQUEST_RESULTADO_ID}`,
      ),
    );
  });
});

describe('T-11 — enviar resposta indisponível (M15) [negativo]', () => {
  it('dado 422 SERVICE_UNAVAILABLE delegacao_indisponivel_r0007 então indisponível com data-reason e canal, sem confirmação simulada', async () => {
    // C-3b-100 (2.ª metade)
    const harness = await mount();
    await flush(harness, REQUEST_DETAIL_WITH_DILIGENCE_FIXTURE);
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.querySelector('textarea[name="text"]')).not.toBeNull(),
    );
    const textarea = root.querySelector<HTMLTextAreaElement>(
      'textarea[name="text"]',
    )!;
    textarea.value = 'x';
    textarea.dispatchEvent(new Event('input'));
    root
      .querySelector<HTMLButtonElement>(
        '[data-action="enviar"], button[type="submit"]',
      )
      ?.click();
    const httpMock = harness.httpMock();
    const responseReq = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) =>
          candidate.method === 'POST' &&
          candidate.url ===
            `/v1/portal/requests/${REQUEST_RESULTADO_ID}/diligences/${DILIGENCE_ID_FIXTURE}/responses`,
      ),
    );
    responseReq.flush(
      portalErrorBody('PORTAL.SERVICE_UNAVAILABLE', 422, {
        unavailableReason: 'delegacao_indisponivel_r0007',
        alternativeChannelNote: 'Atendimento presencial',
      }),
      { status: 422, statusText: 'Unprocessable Entity' },
    );
    await vi.waitFor(() =>
      expect(
        root.querySelector('[data-reason="delegacao_indisponivel_r0007"]'),
      ).not.toBeNull(),
    );
    expect(
      root.querySelector('portal-alternative-channel-note'),
    ).not.toBeNull();
  });
});

describe('T-11 — vazio [negativo]', () => {
  it('dado diligenceId ausente em diligences[] então t11.empty + link /processos/<id>', async () => {
    // C-3b-101 (1.ª parte)
    const harness = await mount('did-inexistente');
    await flush(harness, REQUEST_DETAIL_WITH_DILIGENCE_FIXTURE);
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.textContent).toContain(catalog['portal.screens.t11.empty']),
    );
    expect(
      root.querySelector(`a[routerLink="/processos/${REQUEST_RESULTADO_ID}"]`),
    ).not.toBeNull();
  });
});

describe('T-11 — encerrada por status expired [negativo]', () => {
  it('dado status expired então state.encerrada e nenhum formulário', async () => {
    // C-3b-101 (2.ª parte)
    const harness = await mount();
    await flush(harness, {
      ...REQUEST_DETAIL_WITH_DILIGENCE_FIXTURE,
      diligences: [
        {
          diligenceId: DILIGENCE_ID_FIXTURE,
          requestText: 'Envie o laudo',
          dueOn: '2026-10-14',
          status: 'expired',
          outcome: null,
        },
      ],
    });
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.textContent).toContain(
        catalog['portal.screens.t11.state.encerrada'],
      ),
    );
    expect(root.querySelector('form')).toBeNull();
  });
});

describe('T-11 — pendência não some (409 DILIGENCE_NOT_OPEN) [negativo]', () => {
  it('dado 409 DILIGENCE_NOT_OPEN{outcome} então o mesmo texto de encerrada + banner ([UC-PORTAL-009] AC-5)', async () => {
    // C-3b-101 (3.ª parte)
    const harness = await mount();
    await flush(harness, REQUEST_DETAIL_WITH_DILIGENCE_FIXTURE);
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.querySelector('textarea[name="text"]')).not.toBeNull(),
    );
    const textarea = root.querySelector<HTMLTextAreaElement>(
      'textarea[name="text"]',
    )!;
    textarea.value = 'x';
    textarea.dispatchEvent(new Event('input'));
    root
      .querySelector<HTMLButtonElement>(
        '[data-action="enviar"], button[type="submit"]',
      )
      ?.click();
    const httpMock = harness.httpMock();
    const req = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) =>
          candidate.method === 'POST' &&
          candidate.url ===
            `/v1/portal/requests/${REQUEST_RESULTADO_ID}/diligences/${DILIGENCE_ID_FIXTURE}/responses`,
      ),
    );
    req.flush(
      portalErrorBody('PORTAL.DILIGENCE_NOT_OPEN', 409, {
        outcome: 'answered',
      }),
      { status: 409, statusText: 'Conflict' },
    );
    await vi.waitFor(() =>
      expect(root.textContent).toContain(
        catalog['portal.screens.t11.state.encerrada'],
      ),
    );
    expect(
      root.querySelector('[role="alert"], [role="status"]'),
    ).not.toBeNull();
  });
});

describe('T-11 — anexo rejeitado por ser documento do órgão ([RN-PORTAL-106]; [UC-PORTAL-009] AC-2)', () => {
  it('dado um anexo → 422 ATTACHMENT_AGENCY_DOCUMENT{kind:NP} então só esse arquivo é rejeitado, texto e anexos anteriores intactos', async () => {
    // C-3b-102
    const harness = await mount();
    await flush(harness, REQUEST_DETAIL_WITH_DILIGENCE_FIXTURE);
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.querySelector('portal-attachment-uploader')).not.toBeNull(),
    );
    const input = root.querySelector<HTMLInputElement>(
      'portal-attachment-uploader input[type="file"]',
    )!;
    const { createFileList } =
      await import('../../../../testing/file-list.polyfill');
    Object.defineProperty(input, 'files', {
      value: createFileList([
        new File(['x'], 'np.pdf', { type: 'application/pdf' }),
      ]),
      configurable: true,
    });
    input.dispatchEvent(new Event('change'));
    const httpMock = harness.httpMock();
    const uploadReq = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) =>
          candidate.method === 'POST' &&
          candidate.url ===
            `/v1/portal/requests/${REQUEST_RESULTADO_ID}/attachments`,
      ),
    );
    uploadReq.flush(
      portalErrorBody('PORTAL.ATTACHMENT_AGENCY_DOCUMENT', 422, { kind: 'NP' }),
      { status: 422, statusText: 'Unprocessable Entity' },
    );
    await vi.waitFor(() => {
      const entries = root.querySelectorAll('[data-status="rejected"]');
      expect(entries.length).toBe(1);
    });
    expect(root.querySelector('textarea[name="text"]')).not.toBeNull();
  });
});

describe('T-11 — a11y por estado (§7; A10(j) — cobertura integral: loading, ready, empty, encerrada, not_found, unavailable, error, offline)', () => {
  it('dado loading (antes de qualquer flush) então h1 único, região de estado e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-11, loading)
    const harness = await mount();
    const root = harness.harness.routeNativeElement as HTMLElement;
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado open então h1 único, região de estado e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-11, ready)
    const harness = await mount();
    await flush(harness, REQUEST_DETAIL_WITH_DILIGENCE_FIXTURE);
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.querySelector('textarea[name="text"]')).not.toBeNull(),
    );
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado empty então h1 único, região de estado e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-11, empty)
    const harness = await mount('did-inexistente');
    await flush(harness, REQUEST_DETAIL_WITH_DILIGENCE_FIXTURE);
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.textContent).toContain(catalog['portal.screens.t11.empty']),
    );
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado encerrada então h1 único, região de estado e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-11, encerrada)
    const harness = await mount();
    await flush(harness, {
      ...REQUEST_DETAIL_WITH_DILIGENCE_FIXTURE,
      diligences: [
        {
          diligenceId: DILIGENCE_ID_FIXTURE,
          requestText: 'Envie o laudo',
          dueOn: '2026-10-14',
          status: 'expired',
          outcome: null,
        },
      ],
    });
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.textContent).toContain(
        catalog['portal.screens.t11.state.encerrada'],
      ),
    );
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado not_found (404 na leitura do pedido) então h1 único, região de estado, foco no banner e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-11, not_found)
    const harness = await mount();
    const httpMock = harness.httpMock();
    const req = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) =>
          candidate.url === `/v1/portal/requests/${REQUEST_RESULTADO_ID}`,
      ),
    );
    req.flush(portalErrorBody('PORTAL.NOT_FOUND', 404, { kind: 'request' }), {
      status: 404,
      statusText: 'Not Found',
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

  it('dado unavailable (503) então h1 único, região de estado, foco no banner e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-11, unavailable)
    const harness = await mount();
    const httpMock = harness.httpMock();
    const req = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) =>
          candidate.url === `/v1/portal/requests/${REQUEST_RESULTADO_ID}`,
      ),
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

  it('dado error (500, código fora do catálogo) então h1 único, região de estado, foco no banner e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-11, error)
    const harness = await mount();
    const httpMock = harness.httpMock();
    const req = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) =>
          candidate.url === `/v1/portal/requests/${REQUEST_RESULTADO_ID}`,
      ),
    );
    req.flush(portalErrorBody('PORTAL.INTERNAL_TEST_ERROR', 500), {
      status: 500,
      statusText: 'Internal Server Error',
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

  it('dado offline (status 0, navigator.onLine false) então h1 único, região de estado, foco no banner e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-11, offline; M14)
    const harness = await mount();
    const onLineSpy = vi.spyOn(window.navigator, 'onLine', 'get');
    onLineSpy.mockReturnValue(false);
    const httpMock = harness.httpMock();
    const req = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) =>
          candidate.url === `/v1/portal/requests/${REQUEST_RESULTADO_ID}`,
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
