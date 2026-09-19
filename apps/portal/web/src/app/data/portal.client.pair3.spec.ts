// R-0014 TASK-0017 (Inspector). CTG-0003c §2 — leituras e comandos novos do par 3 sobre o
// `PortalClient` existente (§1: "altera"; nunca "Cannot find module" — os métodos ainda não
// existem em disco, então o cast documenta a assinatura assumida, como
// `data/portal.client.spec.ts` fez para o par 1 antes de TASK-0009). `Idempotency-Key` e
// `If-Match` conforme §2.2/§2.3; `downloadCnhDocument` decodifica erro de blob como
// `downloadReceipt` do par 1 (mesmo defeito documentado em TASK-0008-iteração-2 — aqui o corpo de
// erro já chega como `Blob` real).
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { classifyError } from '../core/error-boundary';
import { PortalClient } from './portal.client';
import type { PortalCommandClientPair3 } from '../../testing/contract-types-pair3';
import {
  AIT_SNE_ID,
  MANIFESTATION_ACKNOWLEDGED_FIXTURE,
  MANIFESTATION_CIENCIA_ID,
  REQUEST_ADESAO_SNE_ID,
  VEHICLE_ID,
  portalErrorBody,
} from '../../testing/http-fixtures-pair3';

const IDEM_KEY_RE = (act: string, target: string): RegExp =>
  new RegExp(`^${act}:${target}:[0-9a-f]{64}$`);

function setup() {
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting()],
  });
  return {
    client: TestBed.inject(PortalClient) as unknown as PortalCommandClientPair3,
    httpMock: TestBed.inject(HttpTestingController),
  };
}

afterEach(() => {
  try {
    TestBed.inject(HttpTestingController).verify();
  } catch {
    // nada pendente nos casos que não chamaram setup().
  }
});

describe('PortalClient — listInbox (GET /v1/portal/inbox)', () => {
  it('dado listInbox({ kind, read, page }) então GET com a query serializada e sem Idempotency-Key/If-Match', async () => {
    // C-3c-01
    const { client, httpMock } = setup();
    const promise = client.listInbox({
      kind: 'acao_necessaria',
      read: 'false',
      page: 2,
    });
    const req = await vi.waitFor(() =>
      httpMock.expectOne((candidate) => candidate.url === '/v1/portal/inbox'),
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('kind')).toBe('acao_necessaria');
    expect(req.request.params.get('read')).toBe('false');
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.headers.has('Idempotency-Key')).toBe(false);
    expect(req.request.headers.has('If-Match')).toBe(false);
    req.flush({ items: [], total: 0, page: 2, pageSize: 20 });
    await promise;
  });
});

describe('PortalClient — markInboxRead (POST inbox/{id}/read)', () => {
  it('dado markInboxRead(id) então POST com Idempotency-Key inbox_read:<id>:<fp({})> e o 200 vira CommandResult.body', async () => {
    // C-3c-02
    const { client, httpMock } = setup();
    const promise = client.markInboxRead(AIT_SNE_ID);
    const req = await vi.waitFor(() =>
      httpMock.expectOne(`/v1/portal/inbox/${AIT_SNE_ID}/read`),
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Idempotency-Key')).toMatch(
      IDEM_KEY_RE('inbox_read', AIT_SNE_ID),
    );
    req.flush({
      id: AIT_SNE_ID,
      readOn: '2026-09-14',
      acknowledgementEvidence: null,
    });
    const result = await promise;
    expect(result.body.id).toBe(AIT_SNE_ID);
  });
});

describe('PortalClient — enrollSne (POST sne/enrollment)', () => {
  it('dado enrollSne(body) então Idempotency-Key adesao_sne:none:<fp>; corpo idêntico repete a chave, corpo diferente muda a chave', async () => {
    // C-3c-03
    const { client, httpMock } = setup();
    const body = {
      email: 'a@fixtures.invalid',
      phone: '92999990000',
      channel: 'email' as const,
      consent: {
        textVersion: 'v1',
        effectsAck: [
          'ciencia_ficta',
          'canal_exclusivo',
          'desconto_60',
          'cancelamento',
        ] as const,
      },
    };
    const promise1 = client.enrollSne(body);
    const req1 = await vi.waitFor(() =>
      httpMock.expectOne('/v1/portal/sne/enrollment'),
    );
    expect(req1.request.method).toBe('POST');
    const key1 = req1.request.headers.get('Idempotency-Key');
    expect(key1).toMatch(IDEM_KEY_RE('adesao_sne', 'none'));
    req1.flush({
      enrolled: true,
      since: '2026-09-14',
      channel: 'email',
      cancelable: true,
    });
    await promise1;

    const promise1b = client.enrollSne(body);
    const req1b = await vi.waitFor(() =>
      httpMock.expectOne('/v1/portal/sne/enrollment'),
    );
    expect(req1b.request.headers.get('Idempotency-Key')).toBe(key1);
    req1b.flush({
      enrolled: true,
      since: '2026-09-14',
      channel: 'email',
      cancelable: true,
    });
    await promise1b;

    const promise2 = client.enrollSne({ ...body, phone: '92999990001' });
    const req2 = await vi.waitFor(() =>
      httpMock.expectOne('/v1/portal/sne/enrollment'),
    );
    expect(req2.request.headers.get('Idempotency-Key')).not.toBe(key1);
    req2.flush({
      enrolled: true,
      since: '2026-09-14',
      channel: 'email',
      cancelable: true,
    });
    await promise2;
  });
});

describe('PortalClient — cancelSne (DELETE sne/enrollment)', () => {
  it('dado cancelSne() sem corpo então o corpo enviado é {} e a chave é cancelamento_sne:none:<fp({})>', async () => {
    // C-3c-04
    const { client, httpMock } = setup();
    const promise = client.cancelSne();
    const req = await vi.waitFor(() =>
      httpMock.expectOne('/v1/portal/sne/enrollment'),
    );
    expect(req.request.method).toBe('DELETE');
    expect(req.request.body).toEqual({});
    expect(req.request.headers.get('Idempotency-Key')).toMatch(
      IDEM_KEY_RE('cancelamento_sne', 'none'),
    );
    req.flush({
      enrolled: false,
      since: null,
      channel: 'email',
      cancelable: false,
      cancelledAt: '2026-09-14',
    });
    await promise;
  });
});

describe('PortalClient — updatePreferences (PUT identity/preferences; §2.3/OD-P87)', () => {
  it('dado updatePreferences(body, null) então PUT SEM If-Match e o 428 IF_MATCH_REQUIRED rejeita com o HttpErrorResponse original [negativo]', async () => {
    // C-3c-05
    const { client, httpMock } = setup();
    const promise = client.updatePreferences({ channel: 'email' }, null);
    const req = await vi.waitFor(() =>
      httpMock.expectOne('/v1/portal/identity/preferences'),
    );
    expect(req.request.method).toBe('PUT');
    expect(req.request.headers.has('If-Match')).toBe(false);
    req.flush(portalErrorBody('PORTAL.IF_MATCH_REQUIRED', 428), {
      status: 428,
      statusText: 'Precondition Required',
    });
    await expect(promise).rejects.toMatchObject({ status: 428 });
  });

  it('dado updatePreferences(body, \'"3"\') então o cabeçalho If-Match é "3" e um 422 SERVICE_UNAVAILABLE{unavailableReason} sobe intacto', async () => {
    // C-3c-06
    const { client, httpMock } = setup();
    const promise = client.updatePreferences({ channel: 'email' }, '"3"');
    const req = await vi.waitFor(() =>
      httpMock.expectOne('/v1/portal/identity/preferences'),
    );
    expect(req.request.headers.get('If-Match')).toBe('"3"');
    req.flush(
      portalErrorBody('PORTAL.SERVICE_UNAVAILABLE', 422, {
        unavailableReason: 'preferences_substrato_pendente',
      }),
      { status: 422, statusText: 'Unprocessable Entity' },
    );
    let caught: unknown;
    try {
      await promise;
    } catch (error: unknown) {
      caught = error;
    }
    expect(classifyError(caught).code).toBe('PORTAL.SERVICE_UNAVAILABLE');
    expect(classifyError(caught).context['unavailableReason']).toBe(
      'preferences_substrato_pendente',
    );
  });
});

describe('PortalClient — createPushSubscription (POST push-subscriptions)', () => {
  it('dado createPushSubscription({ endpoint, keys }) então POST com Idempotency-Key push_subscription:none:<fp> e o 201 é devolvido', async () => {
    // C-3c-07
    const { client, httpMock } = setup();
    const promise = client.createPushSubscription({
      endpoint: 'https://push.invalid/x',
      keys: { p256dh: 'p', auth: 'a' },
    });
    const req = await vi.waitFor(() =>
      httpMock.expectOne('/v1/portal/push-subscriptions'),
    );
    expect(req.request.headers.get('Idempotency-Key')).toMatch(
      IDEM_KEY_RE('push_subscription', 'none'),
    );
    req.flush({
      id: 'p1',
      endpoint: 'https://push.invalid/x',
      createdAt: '2026-09-14',
    });
    const result = await promise;
    expect(result.body.id).toBe('p1');
  });
});

describe('PortalClient — getCnh (GET documents/cnh)', () => {
  it('dado getCnh() então GET sem query e o corpo é devolvido tal qual', async () => {
    // C-3c-08
    const { client, httpMock } = setup();
    const promise = client.getCnh();
    const req = await vi.waitFor(() =>
      httpMock.expectOne('/v1/portal/documents/cnh'),
    );
    expect(req.request.method).toBe('GET');
    const body = {
      license: {
        status: 'valida',
        validUntil: null,
        categories: [],
        restrictions: [],
      },
      qrVerification: null,
      documentBytes: null,
      category: 'C',
      cachedAt: '2026-09-14',
    };
    req.flush(body);
    await expect(promise).resolves.toEqual(body);
  });
});

describe('PortalClient — downloadCnhDocument (GET documents/cnh?documentBytes=true; blob)', () => {
  it('dado 422 (blob application/json) então o erro classificado tem code SERVICE_UNAVAILABLE e context.unavailableReason documento_assinado_pendente_r0014', async () => {
    // C-3c-09
    const { client, httpMock } = setup();
    const promise = client.downloadCnhDocument();
    const req = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) =>
          candidate.url === '/v1/portal/documents/cnh' &&
          candidate.params.get('documentBytes') === 'true',
      ),
    );
    const errorBody = portalErrorBody('PORTAL.SERVICE_UNAVAILABLE', 422, {
      unavailableReason: 'documento_assinado_pendente_r0014',
    });
    req.flush(
      new Blob([JSON.stringify(errorBody)], { type: 'application/json' }),
      { status: 422, statusText: 'Unprocessable Entity' },
    );
    let caught: unknown;
    try {
      await promise;
    } catch (error: unknown) {
      caught = error;
    }
    expect(classifyError(caught).code).toBe('PORTAL.SERVICE_UNAVAILABLE');
    expect(classifyError(caught).context['unavailableReason']).toBe(
      'documento_assinado_pendente_r0014',
    );
  });
});

describe('PortalClient — issueCrlv (POST vehicles/{id}/crlv-e)', () => {
  it('dado issueCrlv(vehicleId) então POST com Idempotency-Key emissao_crlv:<vehicleId>:<fp({})>; 422 sobe intacto', async () => {
    // C-3c-10
    const { client, httpMock } = setup();
    const promise = client.issueCrlv(VEHICLE_ID);
    const req = await vi.waitFor(() =>
      httpMock.expectOne(`/v1/portal/vehicles/${VEHICLE_ID}/crlv-e`),
    );
    expect(req.request.headers.get('Idempotency-Key')).toMatch(
      IDEM_KEY_RE('emissao_crlv', VEHICLE_ID),
    );
    req.flush(
      portalErrorBody('PORTAL.SERVICE_UNAVAILABLE', 422, {
        unavailableReason: 'documento_assinado_pendente_r0014',
      }),
      { status: 422, statusText: 'Unprocessable Entity' },
    );
    await expect(promise).rejects.toMatchObject({ status: 422 });
  });
});

describe('PortalClient — getVehicleClearance (GET vehicles/{id}/clearance; §2.6)', () => {
  it('dado 503 NATIONAL_READ_UNAVAILABLE{cachedAt,retryAfter} então o erro classificado preserva cachedAt/retryAfter no context', async () => {
    // C-3c-11
    const { client, httpMock } = setup();
    const promise = client.getVehicleClearance(VEHICLE_ID);
    const req = await vi.waitFor(() =>
      httpMock.expectOne(`/v1/portal/vehicles/${VEHICLE_ID}/clearance`),
    );
    req.flush(
      portalErrorBody('PORTAL.NATIONAL_READ_UNAVAILABLE', 503, {
        cachedAt: '2026-09-13',
        retryAfter: 30,
      }),
      { status: 503, statusText: 'Service Unavailable' },
    );
    let caught: unknown;
    try {
      await promise;
    } catch (error: unknown) {
      caught = error;
    }
    const classified = classifyError(caught);
    expect(classified.code).toBe('PORTAL.NATIONAL_READ_UNAVAILABLE');
    expect(classified.context['cachedAt']).toBe('2026-09-13');
    expect(classified.retryAfter).toBe(30);
  });
});

describe('PortalClient — createManifestation (POST manifestations; sem sessão)', () => {
  it('dado createManifestation(body) SEM sessão então POST com Idempotency-Key manifestar:none:<fp> sem exigir Authorization no teste [negativo: nenhum 401 tratado como bloqueio]', async () => {
    // C-3c-12
    const { client, httpMock } = setup();
    const promise = client.createManifestation({
      kind: 'reclamacao',
      text: 'x',
      anonymous: true,
      attachmentIds: [],
    });
    const req = await vi.waitFor(() =>
      httpMock.expectOne('/v1/portal/manifestations'),
    );
    expect(req.request.headers.get('Idempotency-Key')).toMatch(
      IDEM_KEY_RE('manifestar', 'none'),
    );
    req.flush({
      manifestationId: 'm-1',
      protocol: 'AM-1',
      receivedAt: '2026-09-14',
      state: 'COMPROVANTE_EMITIDO',
      agencyDueOn: '2026-10-14',
      anonymous: true,
    });
    const result = await promise;
    expect(result.body.anonymous).toBe(true);
  });
});

describe('PortalClient — acknowledgeManifestation (POST …/acknowledge; §2.3 ETag)', () => {
  it('dado acknowledgeManifestation(id) então POST com Idempotency-Key acknowledge:<id>:<fp({})> e o ETag "2" vira CommandResult.etag', async () => {
    // C-3c-13
    const { client, httpMock } = setup();
    const promise = client.acknowledgeManifestation(MANIFESTATION_CIENCIA_ID);
    const req = await vi.waitFor(() =>
      httpMock.expectOne(
        `/v1/portal/manifestations/${MANIFESTATION_CIENCIA_ID}/acknowledge`,
      ),
    );
    expect(req.request.headers.get('Idempotency-Key')).toMatch(
      IDEM_KEY_RE('acknowledge', MANIFESTATION_CIENCIA_ID),
    );
    req.flush(MANIFESTATION_ACKNOWLEDGED_FIXTURE, { headers: { ETag: '"2"' } });
    const result = await promise;
    expect(result.etag).toBe('"2"');
  });
});

describe('PortalClient — createEvaluation (POST evaluations; [DIVERGE-18])', () => {
  it('dado createEvaluation({ subjectKind:request, subjectId, scores }) então POST /v1/portal/evaluations (negativo: nunca /requests/{id}/evaluation) com chave avaliar:<subjectId>:<fp>', async () => {
    // C-3c-14
    const { client, httpMock } = setup();
    const promise = client.createEvaluation({
      subjectKind: 'request',
      subjectId: REQUEST_ADESAO_SNE_ID,
      scores: {
        satisfaction: 5,
        quality: 5,
        deadline: 5,
        clarity: 5,
        channel: 5,
      },
    });
    const req = await vi.waitFor(() =>
      httpMock.expectOne('/v1/portal/evaluations'),
    );
    expect(req.request.headers.get('Idempotency-Key')).toMatch(
      IDEM_KEY_RE('avaliar', REQUEST_ADESAO_SNE_ID),
    );
    httpMock.expectNone(
      (candidate) =>
        candidate.url.includes('/evaluation') &&
        candidate.url.includes('/requests/'),
    );
    req.flush({
      evaluationId: 'e-1',
      subjectKind: 'request',
      subjectId: REQUEST_ADESAO_SNE_ID,
      state: 'AVALIADA',
      submittedAt: '2026-09-14',
      publicNotice: 'portal.evaluations.publicIndicator',
    });
    await promise;
  });
});

describe('PortalClient — getService (GET services/{key}; §2.6)', () => {
  it('dado getService(xyz) com 404 NOT_FOUND{kind:service} então o erro classificado tem code NOT_FOUND e context.kind service', async () => {
    // C-3c-15
    const { client, httpMock } = setup();
    const promise = client.getService('xyz');
    const req = await vi.waitFor(() =>
      httpMock.expectOne('/v1/portal/services/xyz'),
    );
    req.flush(portalErrorBody('PORTAL.NOT_FOUND', 404, { kind: 'service' }), {
      status: 404,
      statusText: 'Not Found',
    });
    let caught: unknown;
    try {
      await promise;
    } catch (error: unknown) {
      caught = error;
    }
    const classified = classifyError(caught);
    expect(classified.code).toBe('PORTAL.NOT_FOUND');
    expect(classified.context['kind']).toBe('service');
  });
});

describe('PortalClient — leituras offline (§2.6)', () => {
  it('dado qualquer leitura do §2.4 com status 0 e navigator.onLine false então classifyError().status é 0 [readStatusFor(...) === offline é provado pela facade]', async () => {
    // C-3c-16
    const { client, httpMock } = setup();
    const onLineSpy = vi.spyOn(window.navigator, 'onLine', 'get');
    onLineSpy.mockReturnValue(false);
    const promise = client.getCnh();
    const req = await vi.waitFor(() =>
      httpMock.expectOne('/v1/portal/documents/cnh'),
    );
    req.error(new ProgressEvent('error'), {
      status: 0,
      statusText: 'Unknown Error',
    });
    let caught: unknown;
    try {
      await promise;
    } catch (error: unknown) {
      caught = error;
    }
    expect(classifyError(caught).status).toBe(0);
    onLineSpy.mockRestore();
  });
});
