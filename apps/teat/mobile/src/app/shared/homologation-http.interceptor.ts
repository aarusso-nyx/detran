import type { HttpInterceptorFn } from '@angular/common/http';
import { throwError } from 'rxjs';

/** The homologation build cannot contact any backend or remote resource. */
export const homologationHttpBlockInterceptor: HttpInterceptorFn = (
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
          /^[A-Za-z0-9._-]+$/.test(segment) &&
          segment !== '.' &&
          segment !== '..',
      );
  if (request.method === 'GET' && localAsset) {
    return next(request);
  }
  return throwError(() => new Error('homologation-network-disabled'));
};
