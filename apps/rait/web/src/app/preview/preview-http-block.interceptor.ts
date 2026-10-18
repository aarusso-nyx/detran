// Bloqueio de rede do modo prévia (R-0033 TASK-0003; `frontend-preview-mode.md` §1 item 2, §2,
// D-16): a mesma regra de `webHomologationHttpBlockInterceptor`
// (`apps/teat/web/src/app/shared/homologation-http.interceptor.ts`, ADR-0033) — só `GET` de
// `assets/<segmentos [A-Za-z0-9._-]+>` (sem `.`/`..`, com ou sem `/` inicial) segue; qualquer
// outra requisição (inclusive `/v1/**` e URL absoluta) é rejeitada sem chegar ao próximo handler.
// `preview.providers.ts` o registra em `withInterceptors` ANTES de `withInterceptorsFromDi`, de modo
// que o bloqueio acontece antes dos interceptors do kit (request-id, bearer, tenant, erro).
import type { HttpInterceptorFn } from '@angular/common/http';
import { throwError } from 'rxjs';

export const PREVIEW_NETWORK_DISABLED = 'rait-preview-network-disabled';

const ASSET_SEGMENT = /^[A-Za-z0-9._-]+$/;

export const previewHttpBlockInterceptor: HttpInterceptorFn = (
  request,
  next,
) => {
  const path = request.url.startsWith('/') ? request.url.slice(1) : request.url;
  const segments = path.split('/');
  const localAsset =
    segments[0] === 'assets' &&
    segments.length > 1 &&
    segments
      .slice(1)
      .every(
        (segment) =>
          ASSET_SEGMENT.test(segment) && segment !== '.' && segment !== '..',
      );
  if (request.method === 'GET' && localAsset) return next(request);
  return throwError(() => new Error(PREVIEW_NETWORK_DISABLED));
};
