import {
  CallHandler,
  CanActivate,
  DynamicModule,
  ExecutionContext,
  Injectable,
  Module,
  OnModuleInit,
} from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR, Reflector } from '@nestjs/core';
import {
  AuditInterceptor,
  AuthContextGuard,
  StynxAuditModule,
  StynxAuthModule,
  StynxAuthorizationModule,
  StynxPlatformPipelineModule,
} from '@stynx-nyx/backend';
import {
  generateRequestId,
  RequestContext,
  RequestContextMutator,
} from '@stynx-nyx/core';
import { Database, StynxDataModule } from '@stynx-nyx/data';
import { StynxHealthModule } from '@stynx-nyx/health';
import { StynxLoggingModule } from '@stynx-nyx/logging';
import { StynxStorageModule } from '@stynx-nyx/storage';
import {
  StynxTenancyModule,
  TenantContextInterceptor,
} from '@stynx-nyx/tenancy';
import { Observable } from 'rxjs';
import { createSenatranAdapter } from '@detran/senatran-adapter';

import { DETRAN_PUBLIC_METADATA_KEY, DetranPolicyGuard } from '@detran/shared';
import { BiometricsModule } from '@detran/ch-biometrics';
import { BillingModule } from '@detran/ch-billing';
import { ClinicalControlsModule } from '@detran/ch-clinical-controls';
import { ClinicalNetworkModule } from '@detran/ch-clinical-network';
import { ClinicalReportsModule } from '@detran/ch-clinical-reports';
import { EncountersModule } from '@detran/ch-encounters';
import { ExamsModule } from '@detran/ch-exams';
import { InconsistenciesModule } from '@detran/ch-inconsistencies';
import { OperationalControlsModule } from '@detran/ch-operational-controls';
import { PatientsModule } from '@detran/ch-patients';
import { ProcessBlocksModule } from '@detran/ch-process-blocks';
import { RestrictionsModule } from '@detran/ch-restrictions';
import { RetentionModule } from '@detran/ch-retention';
import { SchedulingModule } from '@detran/ch-scheduling';
import { TelehealthModule } from '@detran/ch-telehealth';

import {
  DetranPersistedAuditSink,
  DetranPolicyEvaluator,
  DetranPostgresReadiness,
  DetranTenantEntitlementPolicy,
  DetranTenantResolver,
  detranDataOptions,
  detranHealthOptions,
  detranPipelineSqlExecutor,
  detranPipelineOptions,
  detranPersistentPipelineStore,
  detranStorageOptions,
  detranTokenVerifier,
} from './detran-runtime.js';
import { PecRenachTransmissionController } from './pec-renach-transmission.controller.js';
import { PecProcessParametersController } from './pec-process-parameters.controller.js';
import { PecProcessParametersService } from './pec-process-parameters.service.js';
import { PecRenachProcessController } from './pec-renach-process.controller.js';
import { PecRenachProcessService } from './pec-renach-process.service.js';
import {
  PEC_RENACH_PORT,
  PecRenachTransmissionService,
} from './pec-renach-transmission.service.js';
import { RenachWebhookGuard } from './renach-webhook.guard.js';

patchTenantContextInterceptorOrdering();

/**
 * Compatibility for @stynx-nyx/tenancy 1.0.3: its global interceptor may be
 * ordered before the core request-context interceptor. Seed only the missing
 * outer scope, then delegate to the published implementation unchanged.
 * Remove when W1.6 publishes the platform-level ordering fix.
 */
function patchTenantContextInterceptorOrdering(): void {
  type Internals = {
    requestContext: { hasActiveContext(): boolean };
    requestContextMutator: {
      runWithRequestContext<T>(seed: object, work: () => T): T;
    };
  };
  type Intercept = (
    this: Internals,
    context: ExecutionContext,
    next: CallHandler,
  ) => Observable<unknown>;
  const prototype = TenantContextInterceptor.prototype as unknown as {
    intercept: Intercept;
  };
  if (prototype.intercept.name === 'detranOrderedTenantContext') return;
  const original = prototype.intercept;
  prototype.intercept = function detranOrderedTenantContext(context, next) {
    if (this.requestContext.hasActiveContext()) {
      return original.call(this, context, next);
    }
    const request = context.switchToHttp().getRequest<{
      principal?: { id?: string };
      actor?: { id?: string };
      user?: { id?: string };
      tenantId?: string;
    }>();
    return new Observable((subscriber) => {
      let subscription: { unsubscribe(): void } | undefined;
      const actorId =
        request.principal?.id ?? request.actor?.id ?? request.user?.id;
      this.requestContextMutator.runWithRequestContext(
        {
          requestId: generateRequestId(),
          startedAt: new Date(),
          ...(request.tenantId ? { tenantId: request.tenantId } : {}),
          ...(actorId ? { actorId } : {}),
        },
        () => {
          subscription = original.call(this, context, next).subscribe({
            next: (value) => subscriber.next(value),
            error: (error) => subscriber.error(error),
            complete: () => subscriber.complete(),
          });
        },
      );
      return () => subscription?.unsubscribe();
    });
  };
}

export const detranAuditSink = new DetranPersistedAuditSink();
export const detranPostgresReadiness = new DetranPostgresReadiness();

@Injectable()
export class DetranAuthContextGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly inner: AuthContextGuard,
  ) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean | undefined>(
      DETRAN_PUBLIC_METADATA_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (isPublic) return true;
    const request = context
      .switchToHttp()
      .getRequest<{ path?: string; url?: string }>();
    const path = request.path ?? request.url ?? '';
    if (/^\/(healthz|readyz|metrics|info)(\?|$)/.test(path)) return true;
    return this.inner.canActivate(context);
  }
}

@Injectable()
class DetranDatabaseBinder implements OnModuleInit {
  constructor(
    private readonly database: Database,
    private readonly requestContext: RequestContext,
    private readonly requestContextMutator: RequestContextMutator,
  ) {}

  onModuleInit(): void {
    detranAuditSink.bindDatabase(this.database);
    detranPostgresReadiness.bindDatabase(this.database);
    detranPipelineSqlExecutor.bindDatabase(this.database);
    detranPersistentPipelineStore.bindRequestContext(
      this.requestContext,
      this.requestContextMutator,
    );
  }
}

@Module({})
export class AppModule {
  static forRoot(): DynamicModule {
    const tokenVerifier = detranTokenVerifier();
    return {
      module: AppModule,
      imports: [
        StynxLoggingModule.forRoot({
          level: process.env.LOG_LEVEL ?? 'info',
          redactPaths: ['authorization', 'cookie', 'set-cookie'],
        }),
        StynxDataModule.forRoot(detranDataOptions()),
        StynxAuthModule.forRoot({
          tokenVerifier,
          tenantResolver: new DetranTenantResolver(),
          tenantEntitlementPolicy: new DetranTenantEntitlementPolicy(),
        }),
        StynxAuthorizationModule.forRoot({
          policyEvaluator: new DetranPolicyEvaluator(),
        }),
        StynxTenancyModule.forRoot({}),
        StynxAuditModule.forRoot({ sink: detranAuditSink }),
        StynxStorageModule.forRoot(detranStorageOptions()),
        StynxPlatformPipelineModule.forRoot(detranPipelineOptions()),
        StynxHealthModule.forRoot(detranHealthOptions(detranPostgresReadiness)),
        ClinicalNetworkModule,
        PatientsModule,
        EncountersModule,
        BiometricsModule,
        BillingModule,
        ExamsModule,
        ClinicalControlsModule,
        InconsistenciesModule,
        OperationalControlsModule,
        ClinicalReportsModule,
        ProcessBlocksModule,
        TelehealthModule,
        SchedulingModule,
        RestrictionsModule,
        RetentionModule,
      ],
      controllers: [
        PecProcessParametersController,
        PecRenachProcessController,
        PecRenachTransmissionController,
      ],
      providers: [
        DetranDatabaseBinder,
        DetranAuthContextGuard,
        DetranPolicyGuard,
        PecProcessParametersService,
        PecRenachProcessService,
        PecRenachTransmissionService,
        RenachWebhookGuard,
        {
          provide: PEC_RENACH_PORT,
          useFactory: () => createSenatranAdapter().ports.renach,
        },
        { provide: DetranPersistedAuditSink, useValue: detranAuditSink },
        { provide: DetranPostgresReadiness, useValue: detranPostgresReadiness },
        { provide: APP_GUARD, useExisting: DetranAuthContextGuard },
        { provide: APP_GUARD, useExisting: DetranPolicyGuard },
        { provide: APP_INTERCEPTOR, useExisting: AuditInterceptor },
      ],
    };
  }
}
