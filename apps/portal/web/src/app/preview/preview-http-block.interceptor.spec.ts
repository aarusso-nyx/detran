// C-02: only local GET assets/**; deliberately no API URL is requested, awaited or simulated.
import {
  HttpClient,
  HttpRequest,
  HttpResponse,
  type HttpHandlerFn,
} from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { previewHttpBlockInterceptor } from './preview-http-block.interceptor';
import {
  configurePreview,
  expectNoNetwork,
  setPreviewDocument,
} from './preview.spec-helper';

describe('C-02 — network boundary', () => {
  for (const url of ['assets/a.json', '/assets/preview/portal-fixtures.json']) {
    it(`allows local GET ${url} unchanged`, async () => {
      const next = vi.fn<HttpHandlerFn>(() =>
        of(new HttpResponse({ body: {} })),
      );
      const request = new HttpRequest('GET', url);
      await firstValueFrom(
        TestBed.runInInjectionContext(() =>
          previewHttpBlockInterceptor(request, next),
        ),
      );
      expect(next).toHaveBeenCalledWith(request);
    });
  }
  for (const [method, url] of [
    ['GET', '/blocked'],
    ['POST', 'assets/a.json'],
    ['DELETE', 'assets/a.json'],
    ['GET', 'assets/../a'],
    ['GET', 'assets/./a'],
    ['GET', 'assets/%2e%2e/a'],
    ['GET', 'https://example.invalid/assets/a.json'],
    ['GET', '//example.invalid/assets/a.json'],
    ['GET', 'assets/a.json?token=x'],
    ['GET', 'assets/a.json#fragment'],
  ]) {
    it(`rejects ${method} ${url} before any handler`, async () => {
      const next = vi.fn<HttpHandlerFn>(() => of(new HttpResponse()));
      const request = new HttpRequest(method, url, null);
      const outcome = firstValueFrom(
        TestBed.runInInjectionContext(() =>
          previewHttpBlockInterceptor(request, next),
        ),
      );
      await expect(outcome).rejects.toBeInstanceOf(Error);
      expect(next).not.toHaveBeenCalled();
    });
  }
  it('the effective injected HttpClient blocks non-asset requests', async () => {
    setPreviewDocument('/autos');
    await configurePreview();
    await expect(
      firstValueFrom(TestBed.inject(HttpClient).get('/blocked')),
    ).rejects.toBeInstanceOf(Error);
    expectNoNetwork();
  });
});
