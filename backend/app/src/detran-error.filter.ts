import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import {
  Catch,
  HttpException,
  Injectable,
  Module,
  type NestModule,
} from '@nestjs/common';
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
 * acima em `/v1/portal/*`; qualquer outro `StynxError` (inclusive
 * `DetranError`) é entregue, sem mudança, ao `StynxErrorFilter` publicado —
 * o mesmo que hoje responde por eles.
 */
@Catch(StynxError)
export class DetranPortalTenantConflictFilter implements ExceptionFilter<StynxError> {
  private readonly platform: StynxErrorFilter;

  constructor(moduleRef: ModuleRef) {
    this.platform = new StynxErrorFilter(moduleRef);
  }

  catch(exception: StynxError, host: ArgumentsHost): void {
    const request = host
      .switchToHttp()
      .getRequest<{ originalUrl?: string; url?: string }>();
    const path = (request.originalUrl ?? request.url ?? '').split('?', 1)[0];
    if (
      PORTAL_TENANT_CONFLICT_CODES.has(exception.code) &&
      isPortalRoutePath(path)
    ) {
      // Mesmo envelope dos demais `PORTAL.SESSION_TENANT_MISMATCH` (T-10).
      this.platform.catch(
        new DetranError('PORTAL.SESSION_TENANT_MISMATCH', {
          status: 403,
          context: {},
        }),
        host,
      );
      return;
    }
    this.platform.catch(exception, host);
  }
}

@Injectable()
class DetranErrorFilterRegistrar {
  constructor(applicationConfig: ApplicationConfig, filter: DetranErrorFilter) {
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
export class DetranErrorFilterModule implements NestModule {
  constructor(
    private readonly applicationConfig: ApplicationConfig,
    private readonly tenantConflictFilter: DetranPortalTenantConflictFilter,
  ) {}

  /**
   * O Nest consulta primeiro o último filtro global registrado, e o
   * `StynxErrorFilter` publicado (captura tudo) entra por `APP_FILTER` depois
   * de qualquer provider deste módulo. `configure` roda depois dos
   * `APP_FILTER` e antes do registro das rotas (`NestApplication.init`), então
   * o tradutor de conflitos fica à frente dele; o que ele não traduz volta ao
   * `StynxErrorFilter` sem mudança.
   */
  configure(): void {
    this.applicationConfig.addGlobalFilter(this.tenantConflictFilter);
  }
}
