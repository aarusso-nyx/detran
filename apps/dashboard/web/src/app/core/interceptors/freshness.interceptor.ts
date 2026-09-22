// freshnessInterceptor (CTG-0002.md §6): em toda leitura `GET /v1/dashboard/*` (exceto o
// stream), publica `body.meta.freshness` no `FreshnessStore` e registra violação de contrato
// quando a resposta 2xx vem sem selo (§2 invariante 1). Não altera corpo, não calcula
// `ATRASADO` (o estado vem do backend) e não sintetiza selo. O 503 `DASH.SOURCE_UNAVAILABLE`
// vira selo `INDISPONIVEL` e o erro segue para quem chamou (a classificação é do
// `error-boundary.ts`, único classificador — este arquivo só reconhece aquele código).
import {
  HttpErrorResponse,
  HttpResponse,
  type HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs';
import { FreshnessStore, isFreshnessMeta } from '../freshness.store';

export const DASHBOARD_API_PREFIX = '/v1/dashboard';
export const DASHBOARD_STREAM_PATH = '/v1/dashboard/stream';

const SOURCE_UNAVAILABLE_CODE = 'DASH.SOURCE_UNAVAILABLE';
const REQUEST_ID_HEADER = 'x-request-id';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Caminho da URL, tolerante a URL relativa (mesma origem: contrato §1 regra 1). */
function pathnameOf(url: string): string {
  const withoutQuery = url.split('?')[0];
  if (!withoutQuery.includes('://')) return withoutQuery;
  const afterScheme = withoutQuery.slice(withoutQuery.indexOf('://') + 3);
  const slash = afterScheme.indexOf('/');
  return slash < 0 ? '/' : afterScheme.slice(slash);
}

function freshnessOf(body: unknown): unknown {
  if (!isRecord(body)) return undefined;
  const meta = body['meta'];
  return isRecord(meta) ? meta['freshness'] : undefined;
}

export const freshnessInterceptor: HttpInterceptorFn = (request, next) => {
  const path = pathnameOf(request.url);
  const watched =
    request.method === 'GET' &&
    path.startsWith(DASHBOARD_API_PREFIX) &&
    path !== DASHBOARD_STREAM_PATH;
  if (!watched) return next(request);

  const store = inject(FreshnessStore);
  return next(request).pipe(
    tap({
      next: (event) => {
        if (!(event instanceof HttpResponse)) return;
        if (!isRecord(event.body)) return;
        const meta = freshnessOf(event.body);
        if (isFreshnessMeta(meta)) {
          store.publish(meta);
          return;
        }
        store.recordViolation({
          url: request.url,
          requestId: event.headers.get(REQUEST_ID_HEADER),
          at: new Date().toISOString(),
        });
      },
      error: (error: unknown) => {
        if (!(error instanceof HttpErrorResponse)) return;
        if (error.status !== 503) return;
        const body = isRecord(error.error) ? error.error : {};
        if (body['code'] !== SOURCE_UNAVAILABLE_CODE) return;
        const context = isRecord(body['context']) ? body['context'] : {};
        const source = context['source'];
        const lastSeenAt = context['lastSeenAt'];
        store.markUnavailable(
          typeof source === 'string' ? source : path,
          typeof lastSeenAt === 'string' ? lastSeenAt : null,
        );
      },
    }),
  );
};
