// R-0033 TASK-0002 (Inspector). C-02 / P-05 / D-16 (`frontend-preview-mode.md` §1 item 2, §2,
// §7): `previewHttpBlockInterceptor` deixa passar só `GET` de `assets/<segmentos
// [A-Za-z0-9._-]+>` (sem `.`/`..`) — a mesma regra de `webHomologationHttpBlockInterceptor`
// (`apps/teat/web/src/app/shared/homologation-http.interceptor.ts`) — e rejeita o resto com
// `Error('rait-preview-network-disabled')`; e é o interceptor efetivo do `HttpClient` injetado sob
// `providePreviewMode()` completo. Produção (TASK-0003): ainda não existe — falha de módulo
// esperada nesta entrega.
import {
  HttpClient,
  HttpRequest,
  HttpResponse,
  type HttpEvent,
  type HttpHandlerFn,
} from '@angular/common/http';
import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, type Observable } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { previewHttpBlockInterceptor } from './preview-http-block.interceptor';
import {
  configurePreview,
  previewSpecContext,
  resetPreviewDocument,
  setPreviewDocument,
} from './preview.spec-helper';

const NETWORK_DISABLED = 'rait-preview-network-disabled';

/** Prompt TASK-0002 item 1 + contrato P-05: caminhos locais de `assets/` que passam. */
const ALLOWED: readonly string[] = [
  'assets/preview/rait-fixtures.json',
  'assets/a.json',
  '/assets/preview/rait-fixtures.json',
];

/** Prompt TASK-0002 item 1 + contrato P-05: requisições que o interceptor rejeita. */
const BLOCKED: readonly { readonly method: string; readonly url: string }[] = [
  { method: 'GET', url: '/v1/inf/rait/cases' },
  { method: 'POST', url: 'assets/x' },
  { method: 'POST', url: 'assets/x.json' },
  { method: 'GET', url: 'assets/../x' },
  { method: 'GET', url: 'http://host/assets/x' },
  { method: 'GET', url: 'https://host/assets/x' },
];

function nextSpy() {
  return vi.fn<HttpHandlerFn>((): Observable<HttpEvent<unknown>> =>
    of(new HttpResponse<unknown>({ status: 200, body: {} })),
  );
}

function intercept(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  return TestBed.runInInjectionContext(() =>
    previewHttpBlockInterceptor(request, next),
  );
}

function requestOf(method: string, url: string): HttpRequest<unknown> {
  return method === 'GET'
    ? new HttpRequest<unknown>('GET', url)
    : new HttpRequest<unknown>(method, url, null);
}

describe('previewHttpBlockInterceptor — regra isolada (P-05)', () => {
  ALLOWED.forEach((url) => {
    it(`dado GET ${url} quando interceptado então segue para o próximo handler sem alteração`, async () => {
      const next = nextSpy();
      const request = new HttpRequest<unknown>('GET', url);
      const event = await firstValueFrom(intercept(request, next));
      expect(next).toHaveBeenCalledTimes(1);
      expect(next.mock.calls[0]?.[0]).toBe(request);
      expect(event).toBeInstanceOf(HttpResponse);
    });
  });

  BLOCKED.forEach(({ method, url }) => {
    it(`dado ${method} ${url} quando interceptado então rejeita com Error('${NETWORK_DISABLED}') e não chama o próximo handler [negativo]`, async () => {
      const next = nextSpy();
      const outcome = firstValueFrom(intercept(requestOf(method, url), next));
      await expect(outcome).rejects.toBeInstanceOf(Error);
      await expect(outcome).rejects.toThrow(NETWORK_DISABLED);
      expect(next).not.toHaveBeenCalled();
    });
  });
});

describe('previewHttpBlockInterceptor — efetivo sob providePreviewMode() completo (P-05, D-16)', () => {
  afterEach(() => resetPreviewDocument());

  async function setup() {
    setPreviewDocument('/painel', 'rait-analyst', 'loaded');
    const context = previewSpecContext();
    await configurePreview(context.providers);
    return {
      http: TestBed.inject(HttpClient),
      controller: TestBed.inject(HttpTestingController),
    };
  }

  it('dado providePreviewMode() quando HttpClient.get(/v1/inf/rait/cases) então rejeita rait-preview-network-disabled e nenhuma requisição chega ao backend [negativo]', async () => {
    const { http, controller } = await setup();
    const outcome = firstValueFrom(http.get('/v1/inf/rait/cases'));
    await expect(outcome).rejects.toThrow(NETWORK_DISABLED);
    controller.expectNone('/v1/inf/rait/cases');
    controller.verify();
  });

  it('dado providePreviewMode() quando HttpClient.post(assets/x.json) então rejeita rait-preview-network-disabled e nenhuma requisição chega ao backend [negativo]', async () => {
    const { http, controller } = await setup();
    const outcome = firstValueFrom(http.post('assets/x.json', {}));
    await expect(outcome).rejects.toThrow(NETWORK_DISABLED);
    controller.expectNone('assets/x.json');
    controller.verify();
  });

  it('dado providePreviewMode() quando HttpClient.get(assets/preview/rait-fixtures.json) então a requisição chega ao backend de teste (única rede permitida)', async () => {
    const { http, controller } = await setup();
    const outcome = firstValueFrom(
      http.get('assets/preview/rait-fixtures.json'),
    );
    const request = controller.expectOne('assets/preview/rait-fixtures.json');
    expect(request.request.method).toBe('GET');
    request.flush({});
    await expect(outcome).resolves.toEqual({});
    controller.verify();
  });
});
