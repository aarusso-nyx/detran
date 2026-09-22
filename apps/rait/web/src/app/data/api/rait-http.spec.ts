// R-0012 TASK-0008 (Inspector). CTG-0002b.md §3.2, §8 — `data/api/rait-http.ts` e
// `data/api/etag-store.ts` ainda não existem (TASK-0009): falha de módulo esperada.
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { RaitHttp } from './rait-http';
import { EtagStore } from './etag-store';
import {
  fixtureCase,
  expectGetList,
  raitErrorBody,
  CASE_IDS,
} from '../../../testing/http-fixtures';
import { classifyError } from '../../core/error-boundary';

function setup() {
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting()],
  });
  return {
    http: TestBed.inject(RaitHttp),
    etagStore: TestBed.inject(EtagStore),
    httpMock: TestBed.inject(HttpTestingController),
  };
}

afterEach(() => {
  TestBed.inject(HttpTestingController).verify();
});

describe('RaitHttp.getOne (C-2B-06/07)', () => {
  it('dado getOne("/v1/inf/rait/cases", "cases", CASE_IDS.ADMITIDO) quando 200 com ETag \'"1"\' então GET /v1/inf/rait/cases/<id> sem query, o corpo é devolvido e EtagStore.get("cases", id) === \'"1"\'', async () => {
    const { http, etagStore, httpMock } = setup();
    const id = CASE_IDS.ADMITIDO;
    const body = fixtureCase(id);
    const promise = http.getOne('/v1/inf/rait/cases', 'cases', id);
    const req = await vi.waitFor(() =>
      httpMock.expectOne(`/v1/inf/rait/cases/${id}`),
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.params.keys().length).toBe(0);
    req.flush(body, { headers: { ETag: '"1"' } });
    expect(await promise).toEqual(body);
    expect(etagStore.get('cases', id)).toBe('"1"');
  });

  it('dado getOne sem cabeçalho ETag então EtagStore.get(...) === null (nunca inventado) [negativo]', async () => {
    const { http, etagStore, httpMock } = setup();
    const id = CASE_IDS.PROTOCOLADO;
    const promise = http.getOne('/v1/inf/rait/cases', 'cases', id);
    const req = await vi.waitFor(() =>
      httpMock.expectOne(`/v1/inf/rait/cases/${id}`),
    );
    req.flush(fixtureCase(id));
    await promise;
    expect(etagStore.get('cases', id)).toBeNull();
  });
});

describe('RaitHttp.getList (C-2B-08)', () => {
  it('dado getList("/v1/inf/rait/cases", { filtro: { state: "PROTOCOLADO" } }, spec) quando 200 com [fixtureCase(PROTOCOLADO), fixtureCase(ADMITIDO)] então a requisição NÃO tem query string e o resultado é ListPage com 1 item PROTOCOLADO, total 1', async () => {
    const { http, httpMock } = setup();
    const promise = http.getList(
      '/v1/inf/rait/cases',
      { filtro: { state: 'PROTOCOLADO' } },
      { q: [], filtro: ['state'] },
    );
    await vi.waitFor(() =>
      expectGetList(httpMock, '/v1/inf/rait/cases', [
        fixtureCase(CASE_IDS.PROTOCOLADO),
        fixtureCase(CASE_IDS.ADMITIDO),
      ]),
    );
    const result = await promise;
    expect(result.items).toHaveLength(1);
    expect(result.items[0].state).toBe('PROTOCOLADO');
    expect(result.total).toBe(1);
  });
});

describe('RaitHttp.getOne — erro (C-2B-09)', () => {
  it('dado getOne com 404 raitErrorBody("RAIT.TENANT_MISMATCH", 404) então a promessa rejeita com o HttpErrorResponse original (sem captura no cliente) e classifyError dele tem kind "not_found"', async () => {
    const { http, httpMock } = setup();
    const id = CASE_IDS.PROTOCOLADO;
    const promise = http.getOne('/v1/inf/rait/cases', 'cases', id);
    const req = await vi.waitFor(() =>
      httpMock.expectOne(`/v1/inf/rait/cases/${id}`),
    );
    req.flush(raitErrorBody('RAIT.TENANT_MISMATCH', 404), {
      status: 404,
      statusText: 'Not Found',
    });
    await expect(promise).rejects.toMatchObject({ status: 404 });
    try {
      await promise;
    } catch (error) {
      expect(classifyError(error).kind).toBe('not_found');
    }
  });
});
