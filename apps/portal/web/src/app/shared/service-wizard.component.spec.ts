// R-0014 TASK-0008 (Inspector). `shared/service-wizard.component.ts` +
// `shared/service-wizard.store.ts` (novos, contrato CTG-0003a §5.4) — ainda não existem
// (TASK-0009): a importação falha com "Cannot find module" (estado esperado, §9 do contrato).
// Assunção assumida (registrada no relatório de entrega, §5.4 não fixa a mecânica): a "feature"
// lê o `ServiceWizardStore` (provido no componente) via
// `fixture.debugElement.injector.get(ServiceWizardStore)` — padrão Angular idiomático para um
// token local a um componente hospedeiro (`@ViewChild(Comp, { read: Token })` no app real); os
// inputs/outputs do próprio componente (`target`, `schema`, `gate`, `resumeRoute`, `consequence`,
// `values`, `created`, …) ficam em `fixture.componentInstance`.
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { StynxI18nModule, StynxI18nService } from '@stynx-nyx/angular-i18n';
import portalCatalog from '../i18n/portal.pt-BR.json';
import { SessionFacade } from '../core/session.facade';
import { PortalClient } from '../data/portal.client';
import { ResumeService } from '../core/resume.service';
import { createSessionFacadeStub } from '../../testing/session-facade.stub';
import {
  AIT_ID,
  REQUEST_COMPOSICAO_ID,
  portalErrorBody,
} from '../../testing/http-fixtures';
import {
  ServiceWizardComponent,
  type WizardTarget,
  type WizardResumeDraft,
} from './service-wizard.component';
import { ServiceWizardStore } from './service-wizard.store';
import { expectNoSeriousA11yViolations } from '../a11y/axe.spec-helper';
import {
  DefesaPreviaSchema,
  DEFESA_PREVIA_GATE,
} from '../forms/defesa-previa.schema';

const catalog = portalCatalog as Record<string, string>;

const TARGET: WizardTarget = {
  serviceKey: 'defesa_previa',
  targetKind: 'ait',
  targetId: AIT_ID,
};

function clientStub() {
  return {
    me: vi.fn(),
    brand: vi.fn(),
    services: vi.fn(),
    entitledResource: vi.fn(),
    createRequest: vi.fn(),
    saveDraft: vi.fn(),
    submitRequest: vi.fn(),
    requestAttachmentUpload: vi.fn(),
    uploadToSignedUrl: vi.fn(),
    completeAttachment: vi.fn(),
    withdrawRequest: vi.fn(),
    respondDiligence: vi.fn(),
    elevateAssurance: vi.fn(),
    completeElevation: vi.fn(),
    downloadReceipt: vi.fn(),
  };
}

async function setup(client = clientStub()) {
  const session = createSessionFacadeStub({
    active: true,
    assuranceLevel: 'avancada',
  });
  await TestBed.configureTestingModule({
    imports: [
      ServiceWizardComponent,
      StynxI18nModule.forRoot({
        defaultLocale: 'pt-BR',
        loadCatalog: async () => catalog,
      }),
    ],
    providers: [
      { provide: PortalClient, useValue: client },
      { provide: SessionFacade, useValue: session },
      // `PortalErrorBannerComponent` usa `<a routerLink>` para nextStepRoute (§3.4) — precisa
      // de um `Router` mesmo quando o banner não é o alvo direto do teste. Rota coringa sem
      // componente, mesma técnica de `action-triplet.component.spec.ts` (B12).
      provideRouter([{ path: '**', children: [] }]),
    ],
  }).compileComponents();
  await TestBed.inject(StynxI18nService).initialize();
  const fixture = TestBed.createComponent(ServiceWizardComponent);
  fixture.componentRef.setInput('target', TARGET);
  fixture.componentRef.setInput('schema', DefesaPreviaSchema);
  fixture.componentRef.setInput('gate', DEFESA_PREVIA_GATE);
  fixture.componentRef.setInput('resumeRoute', '/autos/x/defesa/nova');
  // `ServiceWizardStore` ainda não existe (TASK-0009): `injector.get` resolveria `unknown`; o
  // cast documenta a assinatura assumida (§5.4) sem exigir o módulo agora (`any` liberado em
  // `*.spec.ts` — CODESTYLE §TypeScript).
  const store = fixture.debugElement.injector.get(ServiceWizardStore) as any;
  const resumeService = TestBed.inject(ResumeService);
  const component = fixture.componentInstance as any;
  return { fixture, component, store, client, session, resumeService };
}

describe('ServiceWizardComponent.start()', () => {
  it('dado start() e 201 então step composicao, etag, prefilled/requirements/minimumAssurance do corpo, created emitido', async () => {
    // C-3a-55
    const { fixture, component, store, client } = await setup();
    client.createRequest.mockResolvedValueOnce({
      body: {
        requestId: REQUEST_COMPOSICAO_ID,
        state: 'PEDIDO_EM_COMPOSICAO',
        prefilled: { placa: 'ABC1D23' },
        requirements: ['Conta gov.br'],
        minimumAssurance: 'avancada',
        version: 1,
      },
      etag: '"1"',
    });
    const created: unknown[] = [];
    component.created.subscribe((value: unknown) => created.push(value));
    await store.start();
    fixture.detectChanges();
    expect(store.step()).toBe('composicao');
    expect(store.etag()).toBe('"1"');
    expect(store.prefilled()).toEqual({ placa: 'ABC1D23' });
    expect(store.requirements()).toEqual(['Conta gov.br']);
    expect(store.minimumAssurance()).toBe('avancada');
    expect(created).toHaveLength(1);
  });
});

describe('ServiceWizardComponent.start() — erros', () => {
  it('dado 422 INELIGIBLE então status ineligible e evento com messageKey; 422 SERVICE_UNAVAILABLE então unavailable; 409 REQUEST_DRAFT_EXISTS então nextStepRoute /processos/<id>', async () => {
    // C-3a-56
    const { component, store, client } = await setup();
    client.createRequest.mockRejectedValueOnce({
      status: 422,
      error: portalErrorBody('PORTAL.INELIGIBLE', 422, {
        reason: 'x',
        alternative: 'y',
      }),
      name: 'HttpErrorResponse',
    });
    const ineligible: unknown[] = [];
    component.ineligible.subscribe((value: unknown) => ineligible.push(value));
    await store.start();
    expect(store.status()).toBe('ineligible');
    expect(ineligible).toHaveLength(1);

    client.createRequest.mockRejectedValueOnce({
      status: 422,
      error: portalErrorBody('PORTAL.SERVICE_UNAVAILABLE', 422, {}),
      name: 'HttpErrorResponse',
    });
    await store.start();
    expect(store.status()).toBe('unavailable');

    client.createRequest.mockRejectedValueOnce({
      status: 409,
      error: portalErrorBody('PORTAL.REQUEST_DRAFT_EXISTS', 409, {
        requestId: REQUEST_COMPOSICAO_ID,
      }),
      name: 'HttpErrorResponse',
    });
    await store.start();
    expect(store.error()?.nextStepRoute).toBe(
      `/processos/${REQUEST_COMPOSICAO_ID}`,
    );
  });
});

describe('ServiceWizardComponent.save()', () => {
  it('dado values inválidos (facts vazio) então nenhuma requisição e error().fields contém facts; dado válidos então PUT draft com If-Match e etag/draftSaved atualizados', async () => {
    // C-3a-57
    const { fixture, component, store, client } = await setup();
    client.createRequest.mockResolvedValueOnce({
      body: {
        requestId: REQUEST_COMPOSICAO_ID,
        state: 'PEDIDO_EM_COMPOSICAO',
        prefilled: {},
        requirements: [],
        minimumAssurance: 'avancada',
        version: 1,
      },
      etag: '"1"',
    });
    await store.start();

    fixture.componentRef.setInput('values', {
      facts: '',
      grounds: 'x',
      attachmentIds: [],
      requestType: 'outro',
    });
    await store.save();
    expect(client.saveDraft).not.toHaveBeenCalled();
    expect(store.error()?.fields).toContain('facts');

    client.saveDraft.mockResolvedValueOnce({
      body: {
        requestId: REQUEST_COMPOSICAO_ID,
        version: 2,
        savedAt: '2026-09-14T12:00:00-04:00',
      },
      etag: '"2"',
    });
    fixture.componentRef.setInput('values', {
      facts: 'y',
      grounds: 'x',
      attachmentIds: [],
      requestType: 'outro',
    });
    const draftSaved: unknown[] = [];
    component.draftSaved.subscribe((value: unknown) => draftSaved.push(value));
    await store.save();
    expect(client.saveDraft).toHaveBeenCalledWith(
      REQUEST_COMPOSICAO_ID,
      'defesa_previa',
      expect.objectContaining({ facts: 'y' }),
      '"1"',
    );
    expect(store.etag()).toBe('"2"');
    expect(draftSaved).toHaveLength(1);
  });
});

describe('ServiceWizardComponent.sign()', () => {
  async function started(client: ReturnType<typeof clientStub>) {
    const setupResult = await setup(client);
    client.createRequest.mockResolvedValueOnce({
      body: {
        requestId: REQUEST_COMPOSICAO_ID,
        state: 'PEDIDO_EM_COMPOSICAO',
        prefilled: {},
        requirements: [],
        minimumAssurance: 'avancada',
        version: 1,
      },
      etag: '"2"',
    });
    await setupResult.store.start();
    return setupResult;
  }

  it('dado sign sem consequence e 200 então step protocolo, status done, receipt(), submitted emitido, portal-protocol-receipt com data-protocol', async () => {
    // C-3a-58
    const client = clientStub();
    const { fixture, component, store } = await started(client);
    client.submitRequest.mockResolvedValueOnce({
      body: {
        requestId: REQUEST_COMPOSICAO_ID,
        state: 'EM_ANDAMENTO_NO_ORGAO',
        protocol: {
          number: 'AM-FIXTURES-2026-0000005',
          issuedAt: '2026-09-05T12:00:00-04:00',
          channel: 'portal',
        },
        delegation: { status: 'delegated' },
        version: 2,
      },
      etag: '"3"',
    });
    const submitted: unknown[] = [];
    component.submitted.subscribe((value: unknown) => submitted.push(value));
    await store.sign({ method: 'govbr', signatureRef: 'ref' }, null);
    fixture.detectChanges();
    expect(store.step()).toBe('protocolo');
    expect(store.status()).toBe('done');
    expect(store.receipt()).not.toBeNull();
    expect(submitted).toHaveLength(1);
    expect(
      fixture.nativeElement.querySelector(
        'portal-protocol-receipt[data-protocol]',
      ),
    ).not.toBeNull();
  });

  it('dado consequence definido então sign(choice, null) não requisita (ack é etapa própria); sign(choice, ack) então POST submit com consequenceAck (invariante 10)', async () => {
    // C-3a-59
    const client = clientStub();
    const { fixture, store } = await started(client);
    fixture.componentRef.setInput('consequence', 'consequencias_indicacao');
    await store.sign({ method: 'govbr', signatureRef: 'ref' }, null);
    expect(client.submitRequest).not.toHaveBeenCalled();

    client.submitRequest.mockResolvedValueOnce({
      body: {
        requestId: REQUEST_COMPOSICAO_ID,
        state: 'EM_ANDAMENTO_NO_ORGAO',
        protocol: {},
        delegation: {},
        version: 2,
      },
      etag: '"3"',
    });
    await store.sign(
      { method: 'govbr', signatureRef: 'ref' },
      { textVersion: 'v1', acceptedAt: '2026-09-14T12:00:00-04:00' },
    );
    expect(client.submitRequest).toHaveBeenCalledWith(
      REQUEST_COMPOSICAO_ID,
      'defesa_previa',
      AIT_ID,
      expect.objectContaining({
        consequenceAck: {
          textVersion: 'v1',
          acceptedAt: '2026-09-14T12:00:00-04:00',
        },
      }),
    );
  });

  it("dado sign e 403 ASSURANCE_INSUFFICIENT então volta ao passo assinatura com banner nextStep 'elevation', SEM elevationRequested (o SignatureStep emite quando o cidadão escolher o caminho); values() intactos ([UC-PORTAL-019] 3a/AC-4)", async () => {
    // C-3a-60 (A7(b) do plan.md — ratificação do maestro após bloqueio B8 de reports/TASK-0009.md:
    // o ServiceWizard não tem método de elevação escolhido neste ponto, então não pode emitir
    // `ElevationStarted`; só volta ao passo `assinatura` e mostra o banner. `SignatureStep`
    // (§5.8, C-3a-77) é quem chama `SessionFacade.requestElevation` e emite `elevationRequested`
    // depois que o cidadão escolhe biographic/biometric/icp.)
    const client = clientStub();
    const { fixture, component, store } = await started(client);
    const values = {
      facts: 'x',
      grounds: 'y',
      attachmentIds: [],
      requestType: 'outro',
    };
    fixture.componentRef.setInput('values', values);
    client.submitRequest.mockRejectedValueOnce({
      status: 403,
      error: portalErrorBody('PORTAL.ASSURANCE_INSUFFICIENT', 403, {}),
      name: 'HttpErrorResponse',
    });
    const elevationRequested: unknown[] = [];
    component.elevationRequested.subscribe((value: unknown) =>
      elevationRequested.push(value),
    );
    await store.sign({ method: 'govbr', signatureRef: 'ref' }, null);
    expect(store.step()).toBe('assinatura');
    expect(store.error()?.nextStep).toBe('elevation');
    expect(elevationRequested).toHaveLength(0);
    expect(component.values()).toEqual(values);
  });

  it('dado sign e 422 REQUEST_CONSEQUENCE_ACK_REQUIRED então step permanece assinatura com o banner', async () => {
    // C-3a-61
    const client = clientStub();
    const { store } = await started(client);
    client.submitRequest.mockRejectedValueOnce({
      status: 422,
      error: portalErrorBody('PORTAL.REQUEST_CONSEQUENCE_ACK_REQUIRED', 422, {
        textVersion: 'v1',
      }),
      name: 'HttpErrorResponse',
    });
    await store.sign({ method: 'govbr', signatureRef: 'ref' }, null);
    expect(store.step()).toBe('assinatura');
    expect(store.error()?.messageKey).toBe(
      'portal.errors.request_consequence_ack_required',
    );
  });

  it('dado sign e 502 DELEGATION_FAILED com protocol então step protocolo com o recibo de context.protocol e banner warning ([RN-PORTAL-111] 1)', async () => {
    // C-3a-62
    const client = clientStub();
    const { store } = await started(client);
    const protocol = {
      number: 'AM-FIXTURES-2026-0000005',
      issuedAt: '2026-09-05T12:00:00-04:00',
      channel: 'portal',
    };
    client.submitRequest.mockRejectedValueOnce({
      status: 502,
      error: portalErrorBody('PORTAL.DELEGATION_FAILED', 502, { protocol }),
      name: 'HttpErrorResponse',
    });
    await store.sign({ method: 'govbr', signatureRef: 'ref' }, null);
    expect(store.step()).toBe('protocolo');
    expect(store.error()?.severity).toBe('warning');
    expect(store.receipt()?.protocol).toEqual(protocol);
  });
});

describe('ServiceWizardComponent.resumeFrom()', () => {
  it('dado resumeFrom(point) então nenhum POST requests; step, values() e etag() restaurados', async () => {
    // C-3a-63
    const { store, client } = await setup();
    const point: WizardResumeDraft = {
      requestId: REQUEST_COMPOSICAO_ID,
      serviceKey: 'defesa_previa',
      targetKind: 'ait',
      targetId: AIT_ID,
      step: 'assinatura',
      etag: '"2"',
      values: { facts: 'x' },
    };
    store.resumeFrom(point);
    expect(client.createRequest).not.toHaveBeenCalled();
    expect(store.step()).toBe('assinatura');
    expect(store.etag()).toBe('"2"');
  });
});

describe('ServiceWizardComponent — canal alternativo, foco e checklist', () => {
  it('dado qualquer passo então portal-alternative-channel-note presente; ao mudar de passo o foco vai ao h2; em composicao todos os requirements aparecem antes de qualquer interação ([RN-PORTAL-107] regra 3)', async () => {
    // C-3a-64
    const { fixture, store, client } = await setup();
    client.createRequest.mockResolvedValueOnce({
      body: {
        requestId: REQUEST_COMPOSICAO_ID,
        state: 'PEDIDO_EM_COMPOSICAO',
        prefilled: {},
        requirements: ['Conta gov.br', 'Nível avançado'],
        minimumAssurance: 'avancada',
        version: 1,
      },
      etag: '"1"',
    });
    await store.start();
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('portal-alternative-channel-note'),
    ).not.toBeNull();
    const h2 = fixture.nativeElement.querySelector('h2[tabindex="-1"]');
    expect(document.activeElement).toBe(h2);
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Conta gov.br');
    expect(text).toContain('Nível avançado');
  });

  it('dado navigator.onLine false quando save() então status offline, texto de portal.states.offline, nenhuma requisição enfileirada', async () => {
    // C-3a-65
    const { fixture, store, client } = await setup();
    const onLineSpy = vi.spyOn(window.navigator, 'onLine', 'get');
    onLineSpy.mockReturnValue(false);
    fixture.componentRef.setInput('values', {
      facts: 'x',
      grounds: 'y',
      attachmentIds: [],
      requestType: 'outro',
    });
    await store.save();
    expect(store.status()).toBe('offline');
    expect(client.saveDraft).not.toHaveBeenCalled();
    onLineSpy.mockRestore();
  });

  it.todo('OD-P59: forma do aviso REQUEST_OUT_OF_DEADLINE no 200 de submit'); // C-3a-66
});

// R-0014 TASK-0008 (Inspector, iteração 3 — C-3a-99; delivery-review-CTG-0003a.json item 11).
// Estados de WizardStatus/WizardStep que o próprio componente expõe (§5.4/§8): idle (botão
// continuar), carregando (`store.busy()`), inelegível, indisponível, erro (banner), composição
// (checklist + ng-content vazio), assinatura (embute SignatureStep), protocolo/sucesso (embute
// ProtocolReceipt), offline.
describe('ServiceWizardComponent — a11y (C-3a-99)', () => {
  it('dado o passo elegibilidade em idle (botão continuar) então nenhuma violação axe serious/critical', async () => {
    const { fixture } = await setup();
    fixture.detectChanges();
    await expectNoSeriousA11yViolations(fixture.nativeElement);
  });

  it('dado start() em curso (status loading, carregando) então nenhuma violação axe serious/critical', async () => {
    const { fixture, store, client } = await setup();
    let resolveCreate: (value: unknown) => void = () => {};
    client.createRequest.mockImplementationOnce(
      () => new Promise((resolve) => (resolveCreate = resolve)),
    );
    const startPromise = store.start();
    fixture.detectChanges();
    expect(store.status()).toBe('loading');
    await expectNoSeriousA11yViolations(fixture.nativeElement);
    resolveCreate({
      body: {
        requestId: REQUEST_COMPOSICAO_ID,
        state: 'PEDIDO_EM_COMPOSICAO',
        prefilled: {},
        requirements: [],
        minimumAssurance: 'avancada',
        version: 1,
      },
      etag: '"1"',
    });
    await startPromise;
  });

  it('dado status ineligible então nenhuma violação axe serious/critical', async () => {
    const { fixture, store, client } = await setup();
    client.createRequest.mockRejectedValueOnce({
      status: 422,
      error: portalErrorBody('PORTAL.INELIGIBLE', 422, {
        reason: 'x',
        alternative: 'y',
      }),
      name: 'HttpErrorResponse',
    });
    await store.start();
    fixture.detectChanges();
    await expectNoSeriousA11yViolations(fixture.nativeElement);
  });

  it('dado status unavailable então nenhuma violação axe serious/critical', async () => {
    const { fixture, store, client } = await setup();
    client.createRequest.mockRejectedValueOnce({
      status: 422,
      error: portalErrorBody('PORTAL.SERVICE_UNAVAILABLE', 422, {}),
      name: 'HttpErrorResponse',
    });
    await store.start();
    fixture.detectChanges();
    await expectNoSeriousA11yViolations(fixture.nativeElement);
  });

  it('dado banner de erro (409 REQUEST_DRAFT_EXISTS) então nenhuma violação axe serious/critical', async () => {
    const { fixture, store, client } = await setup();
    client.createRequest.mockRejectedValueOnce({
      status: 409,
      error: portalErrorBody('PORTAL.REQUEST_DRAFT_EXISTS', 409, {
        requestId: REQUEST_COMPOSICAO_ID,
      }),
      name: 'HttpErrorResponse',
    });
    await store.start();
    fixture.detectChanges();
    await expectNoSeriousA11yViolations(fixture.nativeElement);
  });

  it('dado o passo composição (com requirements, sem conteúdo projetado) então nenhuma violação axe serious/critical', async () => {
    const { fixture, store, client } = await setup();
    client.createRequest.mockResolvedValueOnce({
      body: {
        requestId: REQUEST_COMPOSICAO_ID,
        state: 'PEDIDO_EM_COMPOSICAO',
        prefilled: {},
        requirements: ['Conta gov.br'],
        minimumAssurance: 'avancada',
        version: 1,
      },
      etag: '"1"',
    });
    await store.start();
    fixture.detectChanges();
    await expectNoSeriousA11yViolations(fixture.nativeElement);
  });

  it('dado o passo assinatura (SignatureStep embutido, sem escolher upload) então nenhuma violação axe serious/critical', async () => {
    const { fixture, store, client } = await setup();
    client.createRequest.mockResolvedValueOnce({
      body: {
        requestId: REQUEST_COMPOSICAO_ID,
        state: 'PEDIDO_EM_COMPOSICAO',
        prefilled: {},
        requirements: [],
        minimumAssurance: 'avancada',
        version: 1,
      },
      etag: '"1"',
    });
    await store.start();
    store.goTo('assinatura');
    fixture.detectChanges();
    await expectNoSeriousA11yViolations(fixture.nativeElement);
  });

  it('dado o passo protocolo (ProtocolReceipt embutido, sucesso) então nenhuma violação axe serious/critical', async () => {
    const { fixture, store, client } = await setup();
    client.createRequest.mockResolvedValueOnce({
      body: {
        requestId: REQUEST_COMPOSICAO_ID,
        state: 'PEDIDO_EM_COMPOSICAO',
        prefilled: {},
        requirements: [],
        minimumAssurance: 'avancada',
        version: 1,
      },
      etag: '"2"',
    });
    await store.start();
    client.submitRequest.mockResolvedValueOnce({
      body: {
        requestId: REQUEST_COMPOSICAO_ID,
        state: 'EM_ANDAMENTO_NO_ORGAO',
        protocol: {
          number: 'AM-FIXTURES-2026-0000005',
          issuedAt: '2026-09-05T12:00:00-04:00',
          channel: 'portal',
        },
        delegation: { status: 'delegated' },
        version: 2,
      },
      etag: '"3"',
    });
    await store.sign({ method: 'govbr', signatureRef: 'ref' }, null);
    fixture.detectChanges();
    await expectNoSeriousA11yViolations(fixture.nativeElement);
  });

  it('dado navigator.onLine false (status offline) então nenhuma violação axe serious/critical', async () => {
    const { fixture, store } = await setup();
    const onLineSpy = vi.spyOn(window.navigator, 'onLine', 'get');
    onLineSpy.mockReturnValue(false);
    fixture.componentRef.setInput('values', {
      facts: 'x',
      grounds: 'y',
      attachmentIds: [],
      requestType: 'outro',
    });
    await store.save();
    fixture.detectChanges();
    await expectNoSeriousA11yViolations(fixture.nativeElement);
    onLineSpy.mockRestore();
  });
});
