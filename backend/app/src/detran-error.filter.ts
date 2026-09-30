import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { Catch, HttpException, Injectable, Module } from '@nestjs/common';
import { ApplicationConfig, ModuleRef } from '@nestjs/core';
import { StynxError, StynxErrorFilter } from '@stynx-nyx/core';

import { DetranError } from '@detran/shared';

import { isPortalRoutePath } from './detran-runtime.js';

const body = (exception: DetranError) => ({
  code: exception.code,
  status: exception.status,
  message: exception.message,
  messageKey: exception.messageKey,
  ...(exception.requestId ? { requestId: exception.requestId } : {}),
  context: exception.context,
});

export const asDetranHttpException = (exception: DetranError): HttpException =>
  new HttpException(body(exception), exception.status);

@Catch(DetranError)
export class DetranErrorFilter implements ExceptionFilter<DetranError> {
  catch(exception: DetranError, host: ArgumentsHost): void {
    if (!(exception instanceof DetranError)) throw exception;
    const response = host.switchToHttp().getResponse<{
      status(code: number): { json(body: Record<string, unknown>): void };
    }>();
    response.status(exception.status).json(body(exception));
  }
}

/**
 * Conflitos de fonte de tenant publicados pela tenancy STYNX 1.5.0 em rota
 * `@PublicTenantRoute()`, traduzidos para o código DETRAN nas rotas do Portal:
 * Host × `X-Tenant-Id` (R-0022 CTG-0003 R-4; OD-S15-01, OD-R22-37/49) e Host ×
 * _claim_ autenticada (OD-R22-47) → 403 `PORTAL.SESSION_TENANT_MISMATCH`.
 */
const PORTAL_TENANT_CONFLICT_CODES: ReadonlySet<string> = new Set([
  'TENANCY:CONFLICT:host-header',
  'TENANCY:CONFLICT:host-claim',
]);

/**
 * Filtro fino ao lado de `DetranErrorFilter`: só troca o código dos conflitos
 * acima em `/v1/portal/*`; `DetranError` segue o envelope DETRAN e qualquer
 * outro `StynxError` é entregue, sem mudança, ao `StynxErrorFilter` publicado.
 */
@Catch(StynxError)
export class DetranPortalTenantConflictFilter implements ExceptionFilter<StynxError> {
  private readonly platform: StynxErrorFilter;

  constructor(moduleRef: ModuleRef) {
    this.platform = new StynxErrorFilter(moduleRef);
  }

  catch(exception: StynxError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<{
      status(code: number): { json(body: Record<string, unknown>): void };
    }>();
    if (exception instanceof DetranError) {
      response.status(exception.status).json(body(exception));
      return;
    }
    const request = host
      .switchToHttp()
      .getRequest<{ originalUrl?: string; url?: string }>();
    const path = (request.originalUrl ?? request.url ?? '').split('?', 1)[0];
    if (
      PORTAL_TENANT_CONFLICT_CODES.has(exception.code) &&
      isPortalRoutePath(path)
    ) {
      const translated = new DetranError('PORTAL.SESSION_TENANT_MISMATCH', {
        status: 403,
        context: {},
      });
      response.status(translated.status).json(body(translated));
      return;
    }
    this.platform.catch(exception, host);
  }
}

@Injectable()
class DetranErrorFilterRegistrar {
  constructor(
    applicationConfig: ApplicationConfig,
    tenantConflictFilter: DetranPortalTenantConflictFilter,
    filter: DetranErrorFilter,
  ) {
    applicationConfig.addGlobalFilter(tenantConflictFilter);
    applicationConfig.addGlobalFilter(filter);
  }
}

@Module({
  providers: [
    DetranErrorFilter,
    DetranPortalTenantConflictFilter,
    DetranErrorFilterRegistrar,
  ],
})
export class DetranErrorFilterModule {}
