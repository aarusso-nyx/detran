import type { HttpInterceptorFn } from '@angular/common/http';
import { InjectionToken } from '@angular/core';
import { throwError } from 'rxjs';

/** Absent from the common entry; only the explicit UI/workflow build enables it. */
export const TEAT_WEB_HOMOLOGATION = new InjectionToken<boolean>(
  'TEAT_WEB_HOMOLOGATION',
);

export const webHomologationHttpBlockInterceptor: HttpInterceptorFn = (
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
  if (request.method === 'GET' && localAsset) return next(request);
  return throwError(() => new Error('web-homologation-network-disabled'));
};
