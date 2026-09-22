// R-0012 TASK-0008 (Inspector). CTG-0002b.md §4.1, §8 (C-2B-17…19) —
// `data/facades/read-store.ts` ainda não existe (TASK-0009): falha de módulo esperada.
import { createReadStore, readStatusFor, CACHE_TTL_MS } from './read-store';
import { classifyError } from '../../core/error-boundary';
import { createClockStub } from '../../../testing/clock.stub';
import { raitErrorBody } from '../../../testing/http-fixtures';
import { HttpErrorResponse } from '@angular/common/http';

describe('createReadStore — load/emptyWhen (C-2B-17)', () => {
  it('dado load("k", loader) quando o loader resolve então status "loading" durante e "ready" depois, value = resultado, loadedAt = clock.now(), error null; dado emptyWhen verdadeiro então "empty"', async () => {
    const clock = createClockStub();
    const store = createReadStore<{ id: string }>(clock as never);
    let resolveLoader: (value: { id: string }) => void = () => {};
    const loader = () =>
      new Promise<{ id: string }>((resolve) => {
        resolveLoader = resolve;
      });

    const promise = store.load('k', loader);
    expect(store.status()).toBe('loading');
    resolveLoader({ id: '1' });
    await promise;
    expect(store.status()).toBe('ready');
    expect(store.value()).toEqual({ id: '1' });
    expect(store.loadedAt()).toBe(clock.now());
    expect(store.error()).toBeNull();

    await store.load('k2', async () => ({ id: '2' }), {
      emptyWhen: () => true,
    });
    expect(store.status()).toBe('empty');
  });
});

describe('createReadStore — cache TTL e invalidate (C-2B-18)', () => {
  it('dado slot "ready" com chave "k" e clock avançado < CACHE_TTL_MS quando load("k", loader2) então loader2 NÃO é chamado (cache hit); dado clock avançado ≥ CACHE_TTL_MS então chamado; dado invalidate("k") então chamado mesmo dentro do TTL; dado load("k2") então chamado (chave diferente) [negativo/positivo]', async () => {
    const clock = createClockStub();
    const store = createReadStore<{ n: number }>(clock as never);
    let calls = 0;
    const loader = async () => ({ n: ++calls });

    await store.load('k', loader);
    expect(calls).toBe(1);

    clock.advance(CACHE_TTL_MS - 1);
    await store.load('k', loader);
    expect(calls).toBe(1); // cache hit

    clock.advance(2);
    await store.load('k', loader);
    expect(calls).toBe(2); // TTL expirado

    store.invalidate('k');
    await store.load('k', loader);
    expect(calls).toBe(3); // invalidado, ignora TTL

    await store.load('k2', loader);
    expect(calls).toBe(4); // chave diferente
  });
});

describe('createReadStore — classificação de erro (C-2B-19)', () => {
  it('dado loader que rejeita com HttpErrorResponse 503 raitErrorBody("RAIT.UPSTREAM_RENAINF_UNAVAILABLE", 503) então status "unavailable" e error.kind "unavailable"; 403 → "forbidden"; status 0 → "offline"; 404 → "not_found"; 500 → "error"; value anterior mantido', async () => {
    const clock = createClockStub();
    const store = createReadStore<{ id: string }>(clock as never);
    await store.load('k', async () => ({ id: '1' }));

    const cases: readonly [HttpErrorResponse, string][] = [
      [
        new HttpErrorResponse({
          status: 503,
          error: raitErrorBody('RAIT.UPSTREAM_RENAINF_UNAVAILABLE', 503),
        }),
        'unavailable',
      ],
      [
        new HttpErrorResponse({
          status: 403,
          error: raitErrorBody('RAIT.FORBIDDEN_ACTION', 403),
        }),
        'forbidden',
      ],
      [new HttpErrorResponse({ status: 0 }), 'offline'],
      [
        new HttpErrorResponse({
          status: 404,
          error: raitErrorBody('RAIT.TENANT_MISMATCH', 404),
        }),
        'not_found',
      ],
      [
        new HttpErrorResponse({
          status: 500,
          error: raitErrorBody('RAIT.INTERNAL', 500),
        }),
        'error',
      ],
    ];

    for (const [httpError, expectedStatus] of cases) {
      await store.load('k', async () => Promise.reject(httpError), {
        force: true,
      });
      expect(store.status()).toBe(expectedStatus);
      expect(store.error()?.kind).toBe(classifyError(httpError).kind);
      expect(store.value()).toEqual({ id: '1' }); // valor anterior mantido
    }
  });
});

describe('readStatusFor (mapa do catálogo §4)', () => {
  it('dado cada kind de ClassifiedError quando readStatusFor então: offline→offline, not_found→not_found, forbidden→forbidden, unavailable→unavailable, demais→error', () => {
    expect(
      readStatusFor({ kind: 'offline', messageKey: 'x', context: {} }),
    ).toBe('offline');
    expect(
      readStatusFor({ kind: 'not_found', messageKey: 'x', context: {} }),
    ).toBe('not_found');
    expect(
      readStatusFor({ kind: 'forbidden', messageKey: 'x', context: {} }),
    ).toBe('forbidden');
    expect(
      readStatusFor({ kind: 'unavailable', messageKey: 'x', context: {} }),
    ).toBe('unavailable');
    expect(
      readStatusFor({ kind: 'server', messageKey: 'x', context: {} }),
    ).toBe('error');
    expect(
      readStatusFor({ kind: 'unknown', messageKey: 'x', context: {} }),
    ).toBe('error');
  });
});

describe('createReadStore — refresh/reset', () => {
  it('dado slot carregado quando refresh() então reexecuta o último loader com force; sem chave então no-op; reset() volta a idle/null', async () => {
    const clock = createClockStub();
    const store = createReadStore<{ n: number }>(clock as never);
    let calls = 0;
    await store.load('k', async () => ({ n: ++calls }));
    expect(calls).toBe(1);
    await store.refresh();
    expect(calls).toBe(2);

    store.reset();
    expect(store.status()).toBe('idle');
    expect(store.value()).toBeNull();
    await store.refresh(); // sem chave: no-op
    expect(calls).toBe(2);
  });
});
