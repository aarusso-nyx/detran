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
  AuthContextGuard as LegacyAuthContextGuard,
  StynxAuditModule,
  StynxAuthModule as LegacyStynxAuthModule,
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
import {
  StynxAuthGuard,
  StynxAuthModule as FullStynxAuthModule,
} from '@stynx-nyx/auth';
import { StynxSessionsModule } from '@stynx-nyx/sessions';
import { Observable } from 'rxjs';
import { createSenatranAdapter } from '@detran/senatran-adapter';
import { SefazHttpAdapter } from '@detran/sefaz-adapter';
import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';

import { DETRAN_PUBLIC_METADATA_KEY, DetranPolicyGuard } from '@detran/shared';
import { BiometricsModule } from '@detran/ch-biometrics';
import { BillingModule } from '@detran/ch-billing';
import { ClinicalControlsModule } from '@detran/ch-clinical-controls';
import { ClinicalNetworkModule } from '@detran/ch-clinical-network';
import {
  ClinicalReportsModule,
  PadesSigningHttpAdapter,
} from '@detran/ch-clinical-reports';
import { EncountersModule } from '@detran/ch-encounters';
import { ExamsModule } from '@detran/ch-exams';
import { InconsistenciesModule } from '@detran/ch-inconsistencies';
import { JuntasModule } from '@detran/ch-juntas';
import { OperationalControlsModule } from '@detran/ch-operational-controls';
import { PatientsModule } from '@detran/ch-patients';
import { ProcessBlocksModule } from '@detran/ch-process-blocks';
import { RestrictionsModule } from '@detran/ch-restrictions';
import { RetentionModule } from '@detran/ch-retention';
import { SchedulingModule } from '@detran/ch-scheduling';
import { TelehealthModule } from '@detran/ch-telehealth';
import { ToxicologyModule } from '@detran/ch-toxicology';
import { ComplaintsModule } from '@detran/portal-complaints';
import { AitModule } from '@detran/inf-ait';
import { AlcoholModule } from '@detran/inf-alcohol';
import { MeasuresModule } from '@detran/inf-measures';
import { NormativeModule } from '@detran/inf-normative';
import { RaitCaseModule } from '@detran/inf-rait-case';
import { RaitSessionModule } from '@detran/inf-rait-session';
import { RaitWorklistModule } from '@detran/inf-rait-worklist';
import { SpeedModule } from '@detran/inf-speed';
import { AgencyModule } from '@detran/ops-agency';
import { EvidenceModule } from '@detran/ops-evidence';
import { FieldModule } from '@detran/ops-field';
import { OfflineSyncModule } from '@detran/ops-offline-sync';
import { ParameterModule } from '@detran/ops-parameter';
import { SnapshotsModule } from '@detran/ops-snapshots';

import {
  DetranPersistedAuditSink,
  DetranPolicyEvaluator,
  DetranPostgresReadiness,
  DetranSessionReadiness,
  DetranTenantEntitlementPolicy,
  DetranTenantResolver,
  detranDataOptions,
  detranHealthOptions,
  detranFullAuthOptions,
  detranPipelineSqlExecutor,
  detranPipelineOptions,
  detranPersistentPipelineStore,
  detranStorageOptions,
  detranSessionsOptions,
  detranTokenVerifier,
  detranRuntimeProfile,
  detranFeatureFlagSet,
  isLocalRuntimeProfile,
} from './detran-runtime.js';
import {
  DetranSessionReadinessBinder,
  DetranSessionStrongFactorGuard,
  DetranSingleSessionInterceptor,
} from './detran-session-policy.js';
import {
  DetranClinicalTrustReadiness,
  DetranClinicalTrustReadinessBinder,
} from './detran-clinical-trust.js';
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
import { PecToxicologyInboundController } from './pec-toxicology-inbound.controller.js';
import { PecToxicologyInboundService } from './pec-toxicology-inbound.service.js';
import { PecSefazController } from './pec-sefaz.controller.js';
import { PEC_SEFAZ_PORT, PecSefazService } from './pec-sefaz.service.js';
import { PecAuditQueryController } from './pec-audit-query.controller.js';
import { PecAuditQueryService } from './pec-audit-query.service.js';
import { PecUserAdminController } from './pec-user-admin.controller.js';
import { PecUserAdminService } from './pec-user-admin.service.js';
import { PecCognitoAdminController } from './pec-cognito-admin.controller.js';
import { PecCognitoAdminService } from './pec-cognito-admin.service.js';

patchTenantContextInterceptorOrdering();

/**
 * Compatibility for @stynx-nyx/tenancy 1.1.1: its global interceptor may be
 * ordered before the core request-context interceptor. Seed only the missing
 * outer scope, then delegate to the published implementation unchanged.
 * Retain until a later STYNX release proves the platform-level ordering fix.
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
export const detranSessionReadiness = new DetranSessionReadiness();
export const detranClinicalTrustReadiness = new DetranClinicalTrustReadiness();

@Injectable()
export class DetranLegacyAuthContextGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly inner: LegacyAuthContextGuard,
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
export class DetranStynxAuthContextGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly inner: StynxAuthGuard,
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
    const local = isLocalRuntimeProfile(detranRuntimeProfile());
    const authImports = local
      ? [
          LegacyStynxAuthModule.forRoot({
            tokenVerifier: detranTokenVerifier(),
            tenantResolver: new DetranTenantResolver(),
            tenantEntitlementPolicy: new DetranTenantEntitlementPolicy(),
          }),
        ]
      : [
          StynxSessionsModule.forRoot(detranSessionsOptions()),
          FullStynxAuthModule.forRoot(detranFullAuthOptions()),
        ];
    const authProviders = local
      ? [
          DetranLegacyAuthContextGuard,
          {
            provide: APP_GUARD,
            useExisting: DetranLegacyAuthContextGuard,
          },
        ]
      : [
          DetranStynxAuthContextGuard,
          DetranSessionStrongFactorGuard,
          DetranSingleSessionInterceptor,
          DetranSessionReadinessBinder,
          DetranClinicalTrustReadinessBinder,
          PadesSigningHttpAdapter,
          {
            provide: DetranSessionReadiness,
            useValue: detranSessionReadiness,
          },
          {
            provide: DetranClinicalTrustReadiness,
            useValue: detranClinicalTrustReadiness,
          },
          {
            provide: APP_GUARD,
            useExisting: DetranStynxAuthContextGuard,
          },
          {
            provide: APP_GUARD,
            useExisting: DetranSessionStrongFactorGuard,
          },
          {
            provide: APP_INTERCEPTOR,
            useExisting: DetranSingleSessionInterceptor,
          },
        ];
    return {
      module: AppModule,
      imports: [
        StynxLoggingModule.forRoot({
          level: process.env.LOG_LEVEL ?? 'info',
          redactPaths: ['authorization', 'cookie', 'set-cookie'],
        }),
        StynxDataModule.forRoot(detranDataOptions()),
        ...authImports,
        StynxAuthorizationModule.forRoot({
          policyEvaluator: new DetranPolicyEvaluator(),
        }),
        StynxTenancyModule.forRoot({}),
        StynxAuditModule.forRoot({ sink: detranAuditSink }),
        StynxStorageModule.forRoot(detranStorageOptions()),
        StynxPlatformPipelineModule.forRoot(detranPipelineOptions()),
        StynxHealthModule.forRoot(
          detranHealthOptions(
            detranPostgresReadiness,
            local ? undefined : detranSessionReadiness,
          ),
          local ? [] : [detranClinicalTrustReadiness],
        ),
        ClinicalNetworkModule,
        PatientsModule,
        EncountersModule,
        BiometricsModule,
        BillingModule,
        ExamsModule,
        ClinicalControlsModule,
        InconsistenciesModule,
        JuntasModule,
        OperationalControlsModule,
        ClinicalReportsModule,
        ProcessBlocksModule,
        TelehealthModule,
        ToxicologyModule,
        SchedulingModule,
        RestrictionsModule,
        RetentionModule,
        ComplaintsModule,
        // Infractions scope (TEAT/RAIT): generated CRUD modules plus the
        // handwritten AIT lifecycle commands (WP-T0).
        NormativeModule,
        ParameterModule,
        AitModule,
        MeasuresModule,
        AlcoholModule,
        RaitCaseModule,
        RaitWorklistModule,
        RaitSessionModule,
        AgencyModule,
        FieldModule,
        SnapshotsModule,
        EvidenceModule,
        OfflineSyncModule,
        // Speed meters stay behind the `teat.speed_meters` flag (steering H.54:
        // the agency does not operate meters today).
        ...(detranFeatureFlagSet().flags['teat.speed_meters']?.default === true
          ? [SpeedModule]
          : []),
      ],
      controllers: [
        PecProcessParametersController,
        PecRenachProcessController,
        PecRenachTransmissionController,
        PecToxicologyInboundController,
        PecSefazController,
        PecAuditQueryController,
        PecUserAdminController,
        PecCognitoAdminController,
      ],
      providers: [
        DetranDatabaseBinder,
        ...authProviders,
        DetranPolicyGuard,
        PecProcessParametersService,
        PecRenachProcessService,
        PecRenachTransmissionService,
        PecToxicologyInboundService,
        PecSefazService,
        PecAuditQueryService,
        PecUserAdminService,
        RenachWebhookGuard,
        {
          provide: PEC_RENACH_PORT,
          useFactory: () => createSenatranAdapter().ports.renach,
        },
        {
          provide: PEC_SEFAZ_PORT,
          useFactory: () => {
            const provider =
              process.env.DETRAN_SEFAZ_PROVIDER ?? (local ? 'mock' : 'real');
            if (provider !== 'mock' && provider !== 'real') {
              throw new Error('DETRAN_SEFAZ_PROVIDER must be mock or real');
            }
            const baseUrl =
              provider === 'mock'
                ? (process.env.DETRAN_SEFAZ_MOCK_BASE_URL ??
                  'http://localhost:3999')
                : process.env.DETRAN_SEFAZ_REAL_BASE_URL;
            if (!baseUrl) {
              throw new Error(
                'DETRAN_SEFAZ_REAL_BASE_URL is required for the real provider',
              );
            }
            return new SefazHttpAdapter({
              baseUrl,
              pathPrefix: provider === 'mock' ? '/mock' : '',
              timeoutMs: Number(process.env.DETRAN_SEFAZ_TIMEOUT_MS ?? '10000'),
            });
          },
        },
        {
          provide: PecCognitoAdminService,
          useFactory: () =>
            new PecCognitoAdminService(
              new CognitoIdentityProviderClient({
                region: process.env.DETRAN_COGNITO_REGION ?? 'sa-east-1',
              }),
              process.env.DETRAN_COGNITO_USER_POOL_ID ?? '',
            ),
        },
        { provide: DetranPersistedAuditSink, useValue: detranAuditSink },
        { provide: DetranPostgresReadiness, useValue: detranPostgresReadiness },
        { provide: APP_GUARD, useExisting: DetranPolicyGuard },
        { provide: APP_INTERCEPTOR, useExisting: AuditInterceptor },
      ],
    };
  }
}
