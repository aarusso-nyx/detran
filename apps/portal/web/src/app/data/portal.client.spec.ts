// R-0014 TASK-0008 (Inspector, iteração 2 — B2/B3 de reports/TASK-0009.md, A7 do plan.md).
// `data/portal.client.ts` já implementa os 11 comandos do contrato CTG-0003a §2.4 (TASK-0009,
// Engineer). O cast `as unknown as PortalCommandClient` (`src/testing/contract-types.ts`) é
// mantido inofensivamente (a instância agora é real). B2: `idempotencyKey()` calcula o
// SHA-256 do corpo via `crypto.subtle` — assíncrono — antes de o `HttpClient` emitir a
// requisição; `httpMock.expectOne` chamado sincronamente logo após o comando encontrava "found
// none" e deixava a promessa do comando pendente (rejeitada só no teardown, sem handler). Todo
// `expectOne` que segue um comando passa por `vi.waitFor(() => httpMock.expectOne(...))`. B3:
// `downloadReceipt` usa `responseType: 'blob'` — o `flush()` de erro precisa de um corpo
// Blob-compatível (`Automatic conversion to Blob is not supported` do `HttpTestingController`
// caso contrário); usa-se `new Blob([JSON.stringify(body)], { type: 'application/json' })`,
// forma real de um erro entregue a uma requisição `blob` (o body chega cru, não pré-parseado).
// `presentError`/`classifyError` estendido (§3) vêm de `core/error-boundary.ts` pelo mesmo
// mecanismo (namespace import + cast), usado só nos casos C-3a-09/11/17 que dependem dos campos
// novos.
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { classifyError } from '../core/error-boundary';
import * as ErrorBoundaryModule from '../core/error-boundary';
import { PortalClient } from './portal.client';
import type {
  PortalCommandClient,
  PortalErrorBoundaryContract,
} from '../../testing/contract-types';
import {
  AIT_ID,
  REQUEST_COMPOSICAO_ID,
  REQUEST_DESISTIDO_ID,
  REQUEST_SUBMITTED_FIXTURE,
  REQUEST_CREATED_FIXTURE,
  REQUEST_WITHDRAWN_FIXTURE,
  SUBJECT_PRATA_ID,
  portalErrorBody,
} from '../../testing/http-fixtures';

const errorBoundary =
  ErrorBoundaryModule as unknown as PortalErrorBoundaryContract;

const IDEM_KEY_RE = (act: string, target: string): RegExp =>
  new RegExp(`^${act}:${target}:[0-9a-f]{64}$`);

function setup() {
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting()],
  });
  return {
    client: TestBed.inject(PortalClient) as unknown as PortalCommandClient,
    httpMock: TestBed.inject(HttpTestingController),
  };
}

afterEach(() => {
  try {
    TestBed.inject(HttpTestingController).verify();
  } catch {
    // teste que não chamou setup() (ex.: classificação de erro isolada, sem HttpClientTesting).
  }
  vi.unstubAllGlobals();
});

describe('PortalClient — createRequest (POST /v1/portal/requests)', () => {
  it('dado createRequest com targetKind ait quando 201 ETag "1" então POST com Idempotency-Key <serviceKey>:<targetId>:<fp> e result tipado', async () => {
    // C-3a-05
    const { client, httpMock } = setup();
    const promise = client.createRequest({
      serviceKey: 'defesa_previa',
      targetKind: 'ait',
      targetId: AIT_ID,
      channel: 'portal',
    });
    const req = await vi.waitFor(() =>
      httpMock.expectOne('/v1/portal/requests'),
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Idempotency-Key')).toMatch(
      IDEM_KEY_RE('defesa_previa', AIT_ID),
    );
    req.flush(REQUEST_CREATED_FIXTURE, { headers: { ETag: '"1"' } });
    const result = await promise;
    expect(result.etag).toBe('"1"');
    expect(result.body.state).toBe('PEDIDO_EM_COMPOSICAO');
  });

  it("dado createRequest com targetKind 'none' sem targetId então Idempotency-Key '<serviceKey>:none:<fp>'", async () => {
    // C-3a-06 ([DIVERGE-5])
    const { client, httpMock } = setup();
    const promise = client.createRequest({
      serviceKey: 'adesao_sne',
      targetKind: 'none',
      channel: 'portal',
    });
    const req = await vi.waitFor(() =>
      httpMock.expectOne('/v1/portal/requests'),
    );
    expect(req.request.headers.get('Idempotency-Key')).toMatch(
      IDEM_KEY_RE('adesao_sne', 'none'),
    );
    req.flush(REQUEST_CREATED_FIXTURE, { headers: { ETag: '"1"' } });
    await promise;
  });
});

describe('PortalClient — saveDraft (PUT .../draft)', () => {
  it('dado saveDraft com If-Match "1" quando 200 ETag "2" então PUT com If-Match e Idempotency-Key defesa_previa:<requestId>:<fp>; etag atualizado', async () => {
    // C-3a-07
    const { client, httpMock } = setup();
    const promise = client.saveDraft(
      REQUEST_COMPOSICAO_ID,
      'defesa_previa',
      { facts: 'x', grounds: 'y', attachmentIds: [], requestType: 'outro' },
      '"1"',
    );
    const req = await vi.waitFor(() =>
      httpMock.expectOne(`/v1/portal/requests/${REQUEST_COMPOSICAO_ID}/draft`),
    );
    expect(req.request.method).toBe('PUT');
    expect(req.request.headers.get('If-Match')).toBe('"1"');
    expect(req.request.headers.get('Idempotency-Key')).toMatch(
      IDEM_KEY_RE('defesa_previa', REQUEST_COMPOSICAO_ID),
    );
    req.flush(
      {
        requestId: REQUEST_COMPOSICAO_ID,
        version: 2,
        savedAt: '2026-09-14T12:00:00-04:00',
      },
      { headers: { ETag: '"2"' } },
    );
    const result = await promise;
    expect(result.etag).toBe('"2"');
  });

  it('dado saveDraft(…, null) quando servidor 428 IF_MATCH_REQUIRED então a requisição NÃO tem If-Match e classifyError classifica 428 [negativo]', async () => {
    // C-3a-08
    const { client, httpMock } = setup();
    const promise = client.saveDraft(
      REQUEST_COMPOSICAO_ID,
      'defesa_previa',
      {},
      null,
    );
    const req = await vi.waitFor(() =>
      httpMock.expectOne(`/v1/portal/requests/${REQUEST_COMPOSICAO_ID}/draft`),
    );
    expect(req.request.headers.has('If-Match')).toBe(false);
    req.flush(portalErrorBody('PORTAL.IF_MATCH_REQUIRED', 428), {
      status: 428,
      statusText: 'Precondition Required',
    });
    await expect(promise).rejects.toBeTruthy();
    const classified = await promise.catch((error: unknown) =>
      classifyError(error),
    );
    expect(classified).toMatchObject({
      code: 'PORTAL.IF_MATCH_REQUIRED',
      status: 428,
      messageKey: 'portal.errors.if_match_required',
    });
  });

  it('dado saveDraft com If-Match "1" e servidor 412 VERSION_CONFLICT então presentError → nextStep reload, messageKey version_conflict', async () => {
    // C-3a-09
    const { client, httpMock } = setup();
    const promise = client.saveDraft(
      REQUEST_COMPOSICAO_ID,
      'defesa_previa',
      {},
      '"1"',
    );
    const req = await vi.waitFor(() =>
      httpMock.expectOne(`/v1/portal/requests/${REQUEST_COMPOSICAO_ID}/draft`),
    );
    req.flush(portalErrorBody('PORTAL.VERSION_CONFLICT', 412), {
      status: 412,
      statusText: 'Precondition Failed',
    });
    const error = await promise.catch((rejection: unknown) => rejection);
    const presentation = errorBoundary.presentError(error);
    expect(presentation.nextStep).toBe('reload');
    expect(presentation.messageKey).toBe('portal.errors.version_conflict');
  });
});

describe('PortalClient — submitRequest (POST .../submit)', () => {
  it('dado submitRequest(requestId, defesa_previa, aitId, signature govbr) quando 200 então POST com Idempotency-Key defesa_previa:<aitId>:<fp> e protocol.number presente; targetId null → alvo = requestId', async () => {
    // C-3a-10
    const { client, httpMock } = setup();
    const promiseWithTarget = client.submitRequest(
      REQUEST_COMPOSICAO_ID,
      'defesa_previa',
      AIT_ID,
      { signature: { method: 'govbr', signatureRef: 'x' } },
    );
    const reqWithTarget = await vi.waitFor(() =>
      httpMock.expectOne(`/v1/portal/requests/${REQUEST_COMPOSICAO_ID}/submit`),
    );
    expect(reqWithTarget.request.headers.get('Idempotency-Key')).toMatch(
      IDEM_KEY_RE('defesa_previa', AIT_ID),
    );
    reqWithTarget.flush(REQUEST_SUBMITTED_FIXTURE, {
      headers: { ETag: '"2"' },
    });
    const result = await promiseWithTarget;
    expect(result.body.protocol.number).toBeTruthy();

    const promiseNullTarget = client.submitRequest(
      REQUEST_COMPOSICAO_ID,
      'defesa_previa',
      null,
      { signature: { method: 'govbr', signatureRef: 'x' } },
    );
    const reqNullTarget = await vi.waitFor(() =>
      httpMock.expectOne(`/v1/portal/requests/${REQUEST_COMPOSICAO_ID}/submit`),
    );
    expect(reqNullTarget.request.headers.get('Idempotency-Key')).toMatch(
      IDEM_KEY_RE('defesa_previa', REQUEST_COMPOSICAO_ID),
    );
    reqNullTarget.flush(REQUEST_SUBMITTED_FIXTURE, {
      headers: { ETag: '"2"' },
    });
    await promiseNullTarget;
  });

  it('dado submit com a mesma chave e corpo diferente quando 409 IDEMPOTENT_KEY_REUSE_DIFFERENT_BODY então presentError → reload, error [negativo]', async () => {
    // C-3a-11
    const { client, httpMock } = setup();
    const promise = client.submitRequest(
      REQUEST_COMPOSICAO_ID,
      'defesa_previa',
      AIT_ID,
      { signature: { method: 'govbr', signatureRef: 'x' } },
    );
    const req = await vi.waitFor(() =>
      httpMock.expectOne(`/v1/portal/requests/${REQUEST_COMPOSICAO_ID}/submit`),
    );
    req.flush(
      portalErrorBody('PORTAL.IDEMPOTENT_KEY_REUSE_DIFFERENT_BODY', 409, {
        key: 'defesa_previa:x:fingerprint',
      }),
      { status: 409, statusText: 'Conflict' },
    );
    const error = await promise.catch((rejection: unknown) => rejection);
    const presentation = errorBoundary.presentError(error);
    expect(presentation.messageKey).toBe(
      'portal.errors.idempotent_key_reuse_different_body',
    );
    expect(presentation.nextStep).toBe('reload');
    expect(presentation.severity).toBe('error');
  });
});

describe('PortalClient — withdrawRequest (POST .../withdraw)', () => {
  it('dado withdrawRequest(requestId, { confirm: true }, "1") quando 200 então POST com If-Match e Idempotency-Key withdraw:<requestId>:<fp>; body.state DESISTIDO', async () => {
    // C-3a-12
    const { client, httpMock } = setup();
    const promise = client.withdrawRequest(
      REQUEST_DESISTIDO_ID,
      { confirm: true },
      '"1"',
    );
    const req = await vi.waitFor(() =>
      httpMock.expectOne(
        `/v1/portal/requests/${REQUEST_DESISTIDO_ID}/withdraw`,
      ),
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('If-Match')).toBe('"1"');
    expect(req.request.headers.get('Idempotency-Key')).toMatch(
      IDEM_KEY_RE('withdraw', REQUEST_DESISTIDO_ID),
    );
    req.flush(REQUEST_WITHDRAWN_FIXTURE, { headers: { ETag: '"2"' } });
    const result = await promise;
    expect(result.body.state).toBe('DESISTIDO');
  });
});

describe('PortalClient — respondDiligence (POST .../diligences/{did}/responses)', () => {
  it('dado respondDiligence(rid, did, { text, attachmentIds: [] }) então POST com Idempotency-Key respond_diligence:<did>:<fp>', async () => {
    // C-3a-13
    const { client, httpMock } = setup();
    const diligenceId = '00000000-0000-7000-8000-0000dd000001';
    const promise = client.respondDiligence(
      REQUEST_COMPOSICAO_ID,
      diligenceId,
      {
        text: 'resposta',
        attachmentIds: [],
      },
    );
    const req = await vi.waitFor(() =>
      httpMock.expectOne(
        `/v1/portal/requests/${REQUEST_COMPOSICAO_ID}/diligences/${diligenceId}/responses`,
      ),
    );
    expect(req.request.headers.get('Idempotency-Key')).toMatch(
      IDEM_KEY_RE('respond_diligence', diligenceId),
    );
    req.flush({ requestId: REQUEST_COMPOSICAO_ID, version: 2 });
    await promise;
  });
});

describe('PortalClient — anexos (POST .../attachments, .../complete)', () => {
  it('dado requestAttachmentUpload então POST .../attachments com Idempotency-Key attachment:<rid>:<fp> e o corpo; dado completeAttachment então POST .../complete com attachment_complete:<aid>:<fp({})> e sem corpo', async () => {
    // C-3a-14
    const { client, httpMock } = setup();
    const sha256 = 'a'.repeat(64);
    const attachmentIntent = client.requestAttachmentUpload(
      REQUEST_COMPOSICAO_ID,
      {
        filename: 'documento.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 102400,
        sha256,
      },
    );
    const uploadReq = await vi.waitFor(() =>
      httpMock.expectOne(
        `/v1/portal/requests/${REQUEST_COMPOSICAO_ID}/attachments`,
      ),
    );
    expect(uploadReq.request.headers.get('Idempotency-Key')).toMatch(
      IDEM_KEY_RE('attachment', REQUEST_COMPOSICAO_ID),
    );
    expect(uploadReq.request.body).toMatchObject({
      filename: 'documento.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 102400,
      sha256,
    });
    const attachmentId = '00000000-0000-7000-8000-0000aa000001';
    uploadReq.flush({
      attachmentId,
      uploadUrl: 'https://storage.invalid/x',
      method: 'PUT',
      headers: {},
      expiresAt: null,
    });
    await attachmentIntent;

    const completePromise = client.completeAttachment(
      REQUEST_COMPOSICAO_ID,
      attachmentId,
    );
    const completeReq = await vi.waitFor(() =>
      httpMock.expectOne(
        `/v1/portal/requests/${REQUEST_COMPOSICAO_ID}/attachments/${attachmentId}/complete`,
      ),
    );
    expect(completeReq.request.headers.get('Idempotency-Key')).toMatch(
      IDEM_KEY_RE('attachment_complete', attachmentId),
    );
    expect(completeReq.request.body).toEqual({});
    completeReq.flush({ attachmentId, sha256 });
    await completePromise;
  });
});

describe('PortalClient — elevação (POST .../elevations, .../elevations/{id}/complete)', () => {
  it('dado elevateAssurance(subjectId, body) então POST /v1/portal/identity/assurance/elevations com elevation:<subjectId>:<fp>; completeElevation(eid, body) então POST .../complete com elevation_complete:<eid>:<fp>', async () => {
    // C-3a-15
    const { client, httpMock } = setup();
    const elevatePromise = client.elevateAssurance(SUBJECT_PRATA_ID, {
      targetLevel: 'avancada',
      method: 'biographic',
      resumeRoute: '/autos/x/defesa/nova',
    });
    const elevateReq = await vi.waitFor(() =>
      httpMock.expectOne('/v1/portal/identity/assurance/elevations'),
    );
    expect(elevateReq.request.headers.get('Idempotency-Key')).toMatch(
      IDEM_KEY_RE('elevation', SUBJECT_PRATA_ID),
    );
    const elevationId = '00000000-0000-7000-8000-0000ee000001';
    elevateReq.flush({
      redirectUrl: 'https://sso.gov.br/authorize?fixture=1',
      resumeToken: 'resume-token-fixture',
      elevationId,
    });
    await elevatePromise;

    const completePromise = client.completeElevation(elevationId, {
      resumeToken: 'resume-token-fixture',
    });
    const completeReq = await vi.waitFor(() =>
      httpMock.expectOne(
        `/v1/portal/identity/assurance/elevations/${elevationId}/complete`,
      ),
    );
    expect(completeReq.request.headers.get('Idempotency-Key')).toMatch(
      IDEM_KEY_RE('elevation_complete', elevationId),
    );
    completeReq.flush({ assuranceLevel: 'avancada' });
    await completePromise;
  });
});

describe('PortalClient — downloadReceipt (GET .../receipt)', () => {
  it('dado downloadReceipt(rid) então GET .../receipt com responseType blob; dado 422 SERVICE_UNAVAILABLE então rejeita com esse código (nenhum PDF simulado, M15)', async () => {
    // C-3a-16
    const { client, httpMock } = setup();
    const promise = client.downloadReceipt(REQUEST_COMPOSICAO_ID);
    const req = httpMock.expectOne(
      `/v1/portal/requests/${REQUEST_COMPOSICAO_ID}/receipt`,
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.responseType).toBe('blob');
    // B3: requisição `responseType: 'blob'` — o corpo de erro chega como Blob (como no browser
    // real: o XHR entrega o body no tipo pedido mesmo em erro), nunca pré-parseado como objeto.
    const errorBlob = new Blob(
      [
        JSON.stringify(
          portalErrorBody('PORTAL.SERVICE_UNAVAILABLE', 422, {
            unavailableReason: 'documento_assinado_pendente_r0014',
          }),
        ),
      ],
      { type: 'application/json' },
    );
    req.flush(errorBlob, { status: 422, statusText: 'Unprocessable Entity' });
    const error = await promise.catch((rejection: unknown) => rejection);
    const classified = classifyError(error);
    expect(classified.code).toBe('PORTAL.SERVICE_UNAVAILABLE');
  });
});

describe('classificação de erro fora dos comandos (§3.1)', () => {
  it('dado 503 NATIONAL_READ_UNAVAILABLE { retryAfter: 30, cachedAt } então classifyError.retryAfter = 30 e presentError → retry, alternativeChannel true', () => {
    // C-3a-17
    const error = {
      status: 503,
      error: portalErrorBody('PORTAL.NATIONAL_READ_UNAVAILABLE', 503, {
        retryAfter: 30,
        cachedAt: '2026-09-14T11:00:00-04:00',
      }),
      name: 'HttpErrorResponse',
    };
    const classified = errorBoundary.classifyError(error);
    expect(classified.retryAfter).toBe(30);
    const presentation = errorBoundary.presentError(error);
    expect(presentation.nextStep).toBe('retry');
    expect(presentation.alternativeChannel).toBe(true);
    expect(presentation.messageKey).toBe(
      'portal.errors.national_read_unavailable',
    );
  });
});

describe('PortalClient — uploadToSignedUrl (exceção [DIVERGE-17]: fetch puro, fora de /v1/portal/*)', () => {
  it('dado uploadToSignedUrl(intent, blob) então fetch é chamado com method PUT, sem Authorization e credentials omit; nada passa pelo HttpClient', async () => {
    // C-3a-18
    const { client, httpMock } = setup();
    const fetchMock = vi.fn<typeof fetch>(
      async () => new Response(null, { status: 200 }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const blob = new Blob(['conteudo'], { type: 'application/pdf' });
    await client.uploadToSignedUrl(
      {
        attachmentId: '00000000-0000-7000-8000-0000aa000001',
        uploadUrl: 'https://storage.invalid/x',
        method: 'PUT',
        headers: { 'Content-Type': 'application/pdf' },
        expiresAt: null,
      },
      blob,
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://storage.invalid/x');
    expect(init.method).toBe('PUT');
    expect(init.credentials).toBe('omit');
    const headers = new Headers(init.headers);
    expect(headers.has('Authorization')).toBe(false);
    httpMock.expectNone(() => true);
  });
});
