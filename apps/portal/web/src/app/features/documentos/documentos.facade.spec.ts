// R-0014 TASK-0017 (Inspector). CTG-0003c §3.3 — `DocumentosFacade`; arquivo inteiramente novo
// (§1) — "Cannot find module" até TASK-0018 (esperado, §9). `OfflineDocumentStore` REAL (par 1;
// `sessionStorage` do jsdom + `sid` via `StynxSessionService` stub, como
// `offline-document.store.spec.ts`); `PortalClock` fixo (§9 do contrato: 2026-09-14T12:00:00-04:00).
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { StynxSessionService } from '@stynx-nyx/angular-auth';
import { DocumentosFacade } from './documentos.facade'; // §9: "Cannot find module" esperado.
import { PortalClock } from '../../core/clock';
import { OfflineDocumentStore } from '../../core/offline-document.store';
import { createStynxSessionStub } from '../../../testing/stynx-session.stub';
import {
  CNH_READ_FIXTURE,
  CRLV_ISSUED_FIXTURE,
  FIXED_CLOCK_ISO,
  VEHICLE_CLEARANCE_BLOCKED_FIXTURE,
  VEHICLE_ID,
  VEHICLE_OTHER_ID,
  portalErrorBody,
} from '../../../testing/http-fixtures-pair3';

function setup(sid: string | null = 'sid-fixture') {
  TestBed.configureTestingModule({
    providers: [
      DocumentosFacade,
      provideHttpClient(),
      provideHttpClientTesting(),
      {
        provide: StynxSessionService,
        useValue: createStynxSessionStub({ sid, active: sid !== null }),
      },
      {
        provide: PortalClock,
        useValue: { now: () => new Date(FIXED_CLOCK_ISO) },
      },
    ],
  });
  return {
    // DocumentosFacade ainda não existe (§9); cast documenta a assinatura assumida (§3.3).
    facade: TestBed.inject(DocumentosFacade) as any,
    httpMock: TestBed.inject(HttpTestingController),
    offlineStore: TestBed.inject(OfflineDocumentStore),
  };
}

afterEach(() => {
  try {
    TestBed.inject(HttpTestingController).verify();
  } catch {
    // nada pendente.
  }
  // O `OfflineDocumentStore` real grava no `sessionStorage` do jsdom (par 1); sem limpeza, um
  // `put('cnh-e', …)` de um `it` vaza para o próximo `it` com o mesmo `sid-fixture` (C-3c-27 →
  // C-3c-28 encontra cache que não deveria existir). `clear()` some com a chave derivada também.
  try {
    TestBed.inject(OfflineDocumentStore).clear();
  } catch {
    // TestBed já destruído ou store não injetado neste it.
  }
  try {
    sessionStorage.clear();
  } catch {
    // sessionStorage indisponível.
  }
});

describe('DocumentosFacade — loadCnh() ([DIVERGE-8]; RN-117)', () => {
  it("dado o 200 de fixture (category 'C') então cnhStatus ready, cnhSource network e OfflineDocumentStore.put NÃO foi chamado [negativo]", async () => {
    // C-3c-26
    const { facade, httpMock, offlineStore } = setup();
    const putSpy = vi.spyOn(offlineStore, 'put');
    const promise = facade.loadCnh();
    const req = await vi.waitFor(() =>
      httpMock.expectOne('/v1/portal/documents/cnh'),
    );
    req.flush(CNH_READ_FIXTURE);
    await promise;
    expect(facade.cnhStatus()).toBe('ready');
    expect(facade.cnhSource()).toBe('network');
    expect(putSpy).not.toHaveBeenCalled();
  });

  it('dado offline (navigator.onLine false) e get(cnh-e) com documento válido (put pelo teste) então cnh() é o documento offline, cnhSource offline e o card tem data-offline=true (assinada pela facade)', async () => {
    // C-3c-27 (A12(a): offline real, não só status 0 — ErrorBoundary exige os dois)
    const { facade, httpMock, offlineStore } = setup();
    await offlineStore.put(
      'cnh-e',
      { ...CNH_READ_FIXTURE, category: 'A' },
      '2027-01-01',
    );
    const onLineSpy = vi.spyOn(window.navigator, 'onLine', 'get');
    onLineSpy.mockReturnValue(false);
    const promise = facade.loadCnh();
    const req = await vi.waitFor(() =>
      httpMock.expectOne('/v1/portal/documents/cnh'),
    );
    req.error(new ProgressEvent('error'), {
      status: 0,
      statusText: 'Unknown Error',
    });
    await promise;
    expect(facade.cnhSource()).toBe('offline');
    expect(facade.cnh()).not.toBeNull();
    onLineSpy.mockRestore();
  });

  it('dado offline (navigator.onLine false) sem cache então cnhStatus offline [negativo: nenhum documento inventado]', async () => {
    // C-3c-28 (A12(a))
    const { facade, httpMock } = setup();
    const onLineSpy = vi.spyOn(window.navigator, 'onLine', 'get');
    onLineSpy.mockReturnValue(false);
    const promise = facade.loadCnh();
    const req = await vi.waitFor(() =>
      httpMock.expectOne('/v1/portal/documents/cnh'),
    );
    req.error(new ProgressEvent('error'), {
      status: 0,
      statusText: 'Unknown Error',
    });
    await promise;
    expect(facade.cnhStatus()).toBe('offline');
    expect(facade.cnh()).toBeNull();
    onLineSpy.mockRestore();
  });

  it('dado 404 CNH_NOT_FOUND então cnhStatus empty; dado 422 CNH_CLEARANCE_PENDING{paymentRoute} então pendencia [negativo: nunca navega para o paymentRoute do servidor]', async () => {
    // C-3c-29
    const { facade, httpMock } = setup();
    const promise = facade.loadCnh();
    const req = await vi.waitFor(() =>
      httpMock.expectOne('/v1/portal/documents/cnh'),
    );
    req.flush(portalErrorBody('PORTAL.CNH_NOT_FOUND', 404), {
      status: 404,
      statusText: 'Not Found',
    });
    await promise;
    expect(facade.cnhStatus()).toBe('empty');

    const promise2 = facade.loadCnh();
    const req2 = await vi.waitFor(() =>
      httpMock.expectOne('/v1/portal/documents/cnh'),
    );
    req2.flush(
      portalErrorBody('PORTAL.CNH_CLEARANCE_PENDING', 422, {
        paymentRoute: '/x',
      }),
      { status: 422, statusText: 'Unprocessable Entity' },
    );
    await promise2;
    expect(facade.cnhError()?.code).toBe('PORTAL.CNH_CLEARANCE_PENDING');
    expect(facade.cnhError()?.nextStepRoute).not.toBe('/x');
  });
});

describe('DocumentosFacade — loadClearance()/issueCrlv() (T-17; §3.3; RN-116; UC-012)', () => {
  it('dado clearance com débito, restrição, suspenso e canIssue false então o estado é exposto ao ClearanceStatus sem cálculo (C-3c-92 na página)', async () => {
    // C-3c-30
    const { facade, httpMock } = setup();
    const promise = facade.loadClearance(VEHICLE_ID);
    const req = await vi.waitFor(() =>
      httpMock.expectOne(`/v1/portal/vehicles/${VEHICLE_ID}/clearance`),
    );
    req.flush(VEHICLE_CLEARANCE_BLOCKED_FIXTURE);
    await promise;
    expect(facade.clearance()).toEqual(VEHICLE_CLEARANCE_BLOCKED_FIXTURE);
    expect(facade.clearanceStatus()).toBe('ready');
  });

  it('dado issueCrlv com 422 CRLV_BLOCKED_BY_DEBT{items,paymentRoute} então crlvStatus error e um novo GET clearance é despachado', async () => {
    // C-3c-31
    const { facade, httpMock } = setup();
    const promise = facade.issueCrlv(VEHICLE_ID);
    const req = await vi.waitFor(() =>
      httpMock.expectOne(`/v1/portal/vehicles/${VEHICLE_ID}/crlv-e`),
    );
    req.flush(
      portalErrorBody('PORTAL.CRLV_BLOCKED_BY_DEBT', 422, {
        items: [{ kind: 'multa', amount: 195.23 }],
        paymentRoute: '/autos',
      }),
      { status: 422, statusText: 'Unprocessable Entity' },
    );
    await promise;
    expect(facade.crlvStatus()).toBe('error');
    expect(facade.crlvError()?.code).toBe('PORTAL.CRLV_BLOCKED_BY_DEBT');
    await vi.waitFor(() =>
      httpMock.expectOne(`/v1/portal/vehicles/${VEHICLE_ID}/clearance`),
    );
  });

  it('dado issueCrlv com 422 CRLV_BLOCKED_BY_RESTRICTION{restrictions} então crlvError sem link de pagamento no context.paymentRoute [negativo]', async () => {
    // C-3c-32
    const { facade, httpMock } = setup();
    const promise = facade.issueCrlv(VEHICLE_ID);
    const req = await vi.waitFor(() =>
      httpMock.expectOne(`/v1/portal/vehicles/${VEHICLE_ID}/crlv-e`),
    );
    req.flush(
      portalErrorBody('PORTAL.CRLV_BLOCKED_BY_RESTRICTION', 422, {
        restrictions: [{ kind: 'judicial' }],
      }),
      { status: 422, statusText: 'Unprocessable Entity' },
    );
    await promise;
    expect(facade.crlvError()?.context['paymentRoute']).toBeUndefined();
    await vi.waitFor(() =>
      httpMock.expectOne(`/v1/portal/vehicles/${VEHICLE_ID}/clearance`),
    );
  });

  it('dado issueCrlv com 422 SERVICE_UNAVAILABLE{documento_assinado_pendente_r0014} então crlvStatus unavailable [negativo: nenhum card de documento]', async () => {
    // C-3c-33
    const { facade, httpMock } = setup();
    const promise = facade.issueCrlv(VEHICLE_ID);
    const req = await vi.waitFor(() =>
      httpMock.expectOne(`/v1/portal/vehicles/${VEHICLE_ID}/crlv-e`),
    );
    req.flush(
      portalErrorBody('PORTAL.SERVICE_UNAVAILABLE', 422, {
        unavailableReason: 'documento_assinado_pendente_r0014',
      }),
      { status: 422, statusText: 'Unprocessable Entity' },
    );
    await promise;
    expect(facade.crlvStatus()).toBe('unavailable');
    expect(facade.crlv()).toBeNull();
    await vi.waitFor(() =>
      httpMock.expectOne(`/v1/portal/vehicles/${VEHICLE_ID}/clearance`),
    );
  });

  it("dado issueCrlv com 200 { qrVerification, issuedAt, validUntil } então put('crlv-e', { …, vehicleId }, validUntil) foi chamado", async () => {
    // C-3c-34
    const { facade, httpMock, offlineStore } = setup();
    const putSpy = vi.spyOn(offlineStore, 'put');
    const promise = facade.issueCrlv(VEHICLE_ID);
    const req = await vi.waitFor(() =>
      httpMock.expectOne(`/v1/portal/vehicles/${VEHICLE_ID}/crlv-e`),
    );
    req.flush(CRLV_ISSUED_FIXTURE);
    await promise;
    expect(putSpy).toHaveBeenCalledWith(
      'crlv-e',
      expect.objectContaining({ vehicleId: VEHICLE_ID }),
      '2027-01-01',
    );
    expect(facade.crlv()?.qrVerification).toBe('qr-fixture');
    await vi.waitFor(() =>
      httpMock.expectOne(`/v1/portal/vehicles/${VEHICLE_ID}/clearance`),
    );
  });

  it('dado offline e get(crlv-e) com document.vehicleId de outro veículo então clearanceStatus offline [negativo: documento de outro veículo não é exibido]', async () => {
    // C-3c-35 (A12(a): offline real)
    const { facade, httpMock, offlineStore } = setup();
    await offlineStore.put(
      'crlv-e',
      { ...CRLV_ISSUED_FIXTURE, vehicleId: VEHICLE_ID },
      '2027-01-01',
    );
    const onLineSpy = vi.spyOn(window.navigator, 'onLine', 'get');
    onLineSpy.mockReturnValue(false);
    const promise = facade.loadClearance(VEHICLE_OTHER_ID);
    const req = await vi.waitFor(() =>
      httpMock.expectOne(`/v1/portal/vehicles/${VEHICLE_OTHER_ID}/clearance`),
    );
    req.error(new ProgressEvent('error'), {
      status: 0,
      statusText: 'Unknown Error',
    });
    await promise;
    expect(facade.clearanceStatus()).toBe('offline');
    expect(facade.crlv()).toBeNull();
    onLineSpy.mockRestore();
  });
});
