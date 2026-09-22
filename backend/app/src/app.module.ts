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
  getPrincipalFromRequest,
  type RequestLike,
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
import { defer, from, mergeMap, Observable } from 'rxjs';
import { createSenatranAdapter } from '@detran/senatran-adapter';
import { SefazHttpAdapter } from '@detran/sefaz-adapter';
import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import {
  DETRAN_ACTION_METADATA_KEY,
  DETRAN_PUBLIC_METADATA_KEY,
  DETRAN_RESOURCE_METADATA_KEY,
  DetranError,
  DetranPolicyGuard,
} from '@detran/shared';
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
import { IdentityModule } from '@detran/portal-identity';
import { RequestsModule } from '@detran/portal-requests';
import { InboxModule } from '@detran/portal-inbox';
import { CitizenServiceModule } from '@detran/portal-citizen-service';
import { ProjectionsModule } from '@detran/portal-projections';
import { CrashesModule } from '@detran/dashboard-crashes';
import { MonitorModule } from '@detran/dashboard-monitor';
import { RenaestMirrorModule } from '@detran/integration-renaest-mirror';
import { AitModule } from '@detran/inf-ait';
import { AlcoholModule } from '@detran/inf-alcohol';
import { MeasuresModule } from '@detran/inf-measures';
import { NormativeModule } from '@detran/inf-normative';
import { RaitCaseModule } from '@detran/inf-rait-case';
import { RaitSessionModule } from '@detran/inf-rait-session';
import { RaitWorklistModule } from '@detran/inf-rait-worklist';
import { InfractionModule } from '@detran/inf-infraction';
import { NotificationModule } from '@detran/inf-notification';
import { RaitOrgModule } from '@detran/inf-rait-org';
import { CollectionModule } from '@detran/inf-collection';
import { RaitIntegrationModule } from '@detran/inf-rait-integration';
import { SpeedModule } from '@detran/inf-speed';
import { CrashModule } from '@detran/est-crash';
import { AgencyModule } from '@detran/ops-agency';
import { EvidenceModule } from '@detran/ops-evidence';
import { FieldModule } from '@detran/ops-field';
import { OfflineSyncModule } from '@detran/ops-offline-sync';
import { ParameterModule } from '@detran/ops-parameter';
import { ProvisioningModule } from '@detran/ops-provisioning';
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
  detranPortalHostnameDirectory,
  isLocalRuntimeProfile,
  portalHostOf,
  portalRequestHostStorage,
  seedPortalPublicRequest,
  type PortalPublicRequestLike,
} from './detran-runtime.js';
import { PortalDelegationTargetsModule } from './portal-delegation.providers.js';
import { BoatDocumentsRuntimeModule } from './boat-documents.js';
import { PortalNationalReadPortsModule } from './portal-national-read.providers.js';
import { PortalStreamController } from './portal-stream.controller.js';
// R-0011 CTG-0002 §11/§13.3 (TASK-0013): SSE do DASHBOARD e wiring do sweeper.
import { DashboardStreamController } from './dashboard-stream.controller.js';
import {
  DASHBOARD_STREAM_POLLER,
  DashboardStreamService,
} from './dashboard-stream.service.js';
import { DashboardSweepModule } from './dashboard-sweep.providers.js';
import {
  PORTAL_STREAM_POLLER,
  PortalStreamService,
} from './portal-stream.service.js';
import { TeatSyncModule } from './teat-sync.providers.js';
import { TeatEvidencePortsModule } from './teat-evidence.providers.js';
import { TeatSnapshotPortsModule } from './teat-snapshots.providers.js';
import { TeatMeasuresPortsModule } from './teat-measures.providers.js';
import { TeatStreamController } from './teat-stream.controller.js';
import {
  createDefaultTeatStreamPoller,
  TEAT_STREAM_POLLER,
  TeatStreamService,
} from './teat-stream.service.js';
import { RaitStreamController } from './handwritten/rait/rait-stream.controller.js';
import {
  RAIT_STREAM_POLLER,
  RaitStreamService,
} from './handwritten/rait/rait-stream.service.js';
import { TeatIntegrationsController } from './teat-integrations.controller.js';
import { TeatIntegrationsService } from './teat-integrations.service.js';
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
import {
  BOAT_RENAEST_PORT,
  BoatRenaestTransmissionService,
} from './boat-renaest-transmission.service.js';
import {
  BOAT_RENAEST_MONTHLY_LEDGER,
  BOAT_RENAEST_TENANT_DISCOVERY,
  SqlBoatRenaestMonthlyLedger,
  SqlBoatRenaestTenantDiscovery,
  createBoatRenaestJobService,
} from './boat-renaest-job.providers.js';
import { BoatRenaestJobService } from './boat-renaest-job.service.js';
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
import { DetranErrorFilterModule } from './detran-error.filter.js';
import { DetranPolicyErrorGuard } from './detran-policy-error.guard.js';
import { RaitTransactionalAuditInterceptor } from './rait-transactional-audit.interceptor.js';

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
      portalPublic?: { tenantId: string; actorId: string };
    }>();
    if (request.portalPublic) {
      // Rotas `@Public()` de `/v1/portal/*` (R-0009 CTG-0001 §8/§9, M11): sem
      // sessão nem membership, o tenant já foi resolvido pelo Host/X-Tenant-Id
      // em `seedPortalPublicRequest` (guard de autenticação do app). O
      // interceptor de tenancy do STYNX exige X-Tenant-Id + ator com
      // membership ativa — inaplicável a uma leitura pública —, por isso o
      // contexto é semeado aqui com o ator nominal (OD-P27) e o interceptor
      // publicado não é chamado para essas rotas.
      const { tenantId, actorId } = request.portalPublic;
      return new Observable((subscriber) => {
        let subscription: { unsubscribe(): void } | undefined;
        this.requestContextMutator.runWithRequestContext(
          {
            requestId: generateRequestId(),
            startedAt: new Date(),
            tenantId,
            actorId,
          },
          () => {
            subscription = next.handle().subscribe({
              next: (value) => subscriber.next(value),
              error: (error) => subscriber.error(error),
              complete: () => subscriber.complete(),
            });
          },
        );
        return () => subscription?.unsubscribe();
      });
    }
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

/** BOAT victim health data requires a declared purpose and a dedicated audit. */
@Injectable()
export class BoatVictimPurposeInterceptor {
  constructor(
    private readonly requestContext: RequestContext,
    private readonly requestContextMutator: RequestContextMutator,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<{
      method?: string;
      originalUrl?: string;
      params?: Record<string, string | undefined>;
      query?: Record<string, string | undefined>;
      user?: { id?: string; roles?: string[] };
      principal?: { id?: string };
      tenantId?: string;
      headers?: Record<string, string | undefined>;
    }>();
    const path = (request.originalUrl ?? '').split('?', 1)[0];
    if (
      request.method !== 'GET' ||
      !/^\/v1\/est\/crash\/victims(?:\/[^/]+)?$/.test(path)
    )
      return next.handle();
    const purpose = request.query?.purpose?.trim();
    if (!purpose)
      throw new DetranError('BOAT.VICTIM_PURPOSE_REQUIRED', {
        status: 400,
        context: {},
      });
    const work = () =>
      defer(() => {
        const snapshot = this.requestContext.snapshot();
        if (!snapshot.tenantId)
          throw new DetranError('BOAT.TENANT_MISMATCH', {
            status: 404,
            context: {},
          });
        return from(
          detranAuditSink.write({
            occurredAt: new Date().toISOString(),
            tenantId: snapshot.tenantId,
            actorId: snapshot.actorId,
            actorRole: request.user?.roles?.[0],
            action: 'EST_CRASH_VICTIM_READ',
            entity: 'est.crash_victim',
            entityId: request.params?.id,
            metadata: { purpose },
          }),
        ).pipe(mergeMap(() => next.handle()));
      });
    if (this.requestContext.hasActiveContext()) return work();
    return new Observable((subscriber) => {
      let subscription: { unsubscribe(): void } | undefined;
      this.requestContextMutator.runWithRequestContext(
        {
          requestId: generateRequestId(),
          startedAt: new Date(),
          tenantId: request.tenantId ?? request.headers?.['x-tenant-id'],
          actorId: request.principal?.id ?? request.user?.id,
        },
        () => {
          subscription = work().subscribe({
            next: (value) => subscriber.next(value),
            error: (error) => subscriber.error(error),
            complete: () => subscriber.complete(),
          });
        },
      );
      return () => subscription?.unsubscribe();
    });
  }
}

/**
 * R-0009 CTG-0002 §2.8 (adenda A4(b), OD-P30): a única rota `@Public()` com
 * autenticação OPORTUNISTA é `POST /v1/portal/manifestations` (H.51 "anônimo
 * para manifestar, simples para acompanhar"). Quando o cabeçalho
 * `Authorization` está presente, o guard interno tenta autenticar (principal e
 * tenancy STYNX normais); qualquer falha → segue anônimo
 * (`seedPortalPublicRequest`). Nunca 401/403 nessa rota.
 */
export function isPortalOptionalAuthPath(
  path: string,
  method: string | undefined,
): boolean {
  return (
    (method ?? '').toUpperCase() === 'POST' &&
    path.split('?', 1)[0] === '/v1/portal/manifestations'
  );
}

type PortalPublicRequest = PortalPublicRequestLike & {
  method?: string;
  originalUrl?: string;
};

async function activatePublicPortalRoute(
  request: PortalPublicRequest,
  authenticate: () => boolean | Promise<boolean>,
): Promise<boolean> {
  const path = request.path ?? request.originalUrl ?? request.url ?? '';
  const authorization = request.headers?.authorization;
  const hasAuthorization =
    typeof authorization === 'string' && authorization.trim().length > 0;
  if (isPortalOptionalAuthPath(path, request.method) && hasAuthorization) {
    try {
      const authenticated = await portalRequestHostStorage.run(
        portalHostOf(request.headers),
        () => authenticate(),
      );
      if (authenticated) return true;
    } catch {
      // credencial inválida/expirada: a manifestação segue anônima (§2.8)
    }
  }
  // R-0009 CTG-0001 §9: tenant das rotas públicas do Portal pelo Host.
  seedPortalPublicRequest(request);
  return true;
}

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
    const request = context.switchToHttp().getRequest<PortalPublicRequest>();
    if (isPublic) {
      return activatePublicPortalRoute(request, () =>
        this.inner.canActivate(context),
      );
    }
    const path = request.path ?? request.url ?? '';
    if (/^\/(healthz|readyz|metrics|info)(\?|$)/.test(path)) return true;
    // R-0009 CTG-0001 §9: `TenantResolverContext` não expõe o Host; o guard
    // interno (e `DetranTenantResolver.resolve`) roda dentro deste escopo.
    return portalRequestHostStorage.run(portalHostOf(request.headers), () =>
      this.inner.canActivate(context),
    );
  }
}

@Injectable()
export class DetranStynxAuthContextGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly inner: StynxAuthGuard,
    private readonly database: Database,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean | undefined>(
      DETRAN_PUBLIC_METADATA_KEY,
      [context.getHandler(), context.getClass()],
    );
    const request = context.switchToHttp().getRequest<
      PortalPublicRequest &
        RequestLike & {
          path?: string;
          url?: string;
          tenantId?: string;
          actor?: { id?: string };
        }
    >();
    if (isPublic) {
      return activatePublicPortalRoute(request, () =>
        this.inner.canActivate(context),
      );
    }
    const path = request.path ?? request.url ?? '';
    if (/^\/(healthz|readyz|metrics|info)(\?|$)/.test(path)) return true;
    // R-0009 CTG-0001 §9: `TenantResolverContext` não expõe o Host; o guard
    // interno (e `DetranTenantResolver.resolve`) roda dentro deste escopo.
    return portalRequestHostStorage.run(
      portalHostOf(request.headers ?? {}),
      async () => {
        if (!(await this.inner.canActivate(context))) return false;
        const resource = this.reflector.getAllAndOverride<string | undefined>(
          DETRAN_RESOURCE_METADATA_KEY,
          [context.getHandler(), context.getClass()],
        );
        const action = this.reflector.getAllAndOverride<string | undefined>(
          DETRAN_ACTION_METADATA_KEY,
          [context.getHandler(), context.getClass()],
        );
        if (resource !== 'inf:rait-case' || action !== 'protocol') return true;
        const principal = getPrincipalFromRequest(request);
        const tenantId = request.tenantId;
        if (
          !principal ||
          !tenantId ||
          !principal.id ||
          !principal.tenants.includes(tenantId) ||
          (request.actor?.id !== undefined && request.actor.id !== principal.id)
        )
          return false;
        try {
          const roles = await this.database.withRequestContext(
            { tenantId, actorId: principal.id },
            async () =>
              this.database.tx(
                async (transaction) => {
                  const result = await transaction.query<{
                    role: string;
                    tenant_id?: string;
                  }>(
                    `select distinct role
                       from (
                         select r.key as role
                           from auth.memberships m
                           join auth.users u on u.id = m.user_id
                           join auth.membership_roles mr on mr.membership_id = m.id
                           join auth.roles r on r.id = mr.role_id
                          where m.tenant_id = $1
                            and m.user_id = $2
                            and m.is_active
                            and u.is_active
                            and r.tenant_id = m.tenant_id
                            and r.key = 'rait-secretary'
                         union
                         select r.key as role
                           from auth.memberships m
                           join auth.users u on u.id = m.user_id
                           join auth.group_memberships gm on gm.membership_id = m.id
                           join auth.groups g on g.id = gm.group_id
                           join auth.group_roles gr on gr.group_id = g.id
                           join auth.roles r on r.id = gr.role_id
                          where m.tenant_id = $1
                            and m.user_id = $2
                            and m.is_active
                            and u.is_active
                            and g.tenant_id = m.tenant_id
                            and r.tenant_id = m.tenant_id
                            and r.key = 'rait-secretary'
                       ) resolved_roles`,
                    [tenantId, principal.id],
                  );
                  const values = result.rows
                    .filter(
                      (row) =>
                        row.tenant_id === undefined ||
                        row.tenant_id === tenantId,
                    )
                    .map((row) => row.role);
                  return values.length === 1 && values[0] === 'rait-secretary'
                    ? values
                    : [];
                },
                { role: 'app', readonly: true },
              ),
          );
          if (roles.length !== 1 || roles[0] !== 'rait-secretary') return false;
          principal.roles = roles;
          return true;
        } catch {
          return false;
        }
      },
    );
  }
}

@Injectable()
class DetranDatabaseBinder implements OnModuleInit {
  constructor(
    private readonly database: Database,
    private readonly requestContext: RequestContext,
    private readonly requestContextMutator: RequestContextMutator,
  ) {}

  async onModuleInit(): Promise<void> {
    detranAuditSink.bindDatabase(this.database);
    detranPostgresReadiness.bindDatabase(this.database);
    detranPipelineSqlExecutor.bindDatabase(this.database);
    detranPersistentPipelineStore.bindRequestContext(
      this.requestContext,
      this.requestContextMutator,
    );
    // R-0009 CTG-0001 §9 (M11): diretório Host → tenant carregado no
    // bootstrap, fora do caminho da requisição.
    detranPortalHostnameDirectory.bindDatabase(this.database);
    await detranPortalHostnameDirectory.reload();
  }
}

/**
 * ADR-0028 makes command preconditions observable before any tenant or policy
 * decision.  In particular, callers learn that an optimistic-concurrency
 * token is required (428) rather than receiving an authorization oracle.
 */
@Injectable()
class ProvisioningIfMatchGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{
      method?: string;
      path?: string;
      url?: string;
      headers?: Record<string, string | undefined>;
    }>();
    const path = request.path ?? request.url ?? '';
    if (
      request.method === 'POST' &&
      path.startsWith('/v1/ops/provisioning/') &&
      !request.headers?.['if-match']?.trim()
    ) {
      throw new DetranError('TEAT.IF_MATCH_REQUIRED', { status: 428 });
    }
    return true;
  }
}

/** The final resource binding is rechecked under the command transaction lock. */
@Injectable()
class ProvisioningPolicyGuard implements CanActivate {
  constructor(
    private readonly delegate: DetranPolicyErrorGuard,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const resource = this.reflector.getAllAndOverride<string>(
      DETRAN_RESOURCE_METADATA_KEY,
      [context.getHandler(), context.getClass()],
    );
    const action = this.reflector.get<string>(
      DETRAN_ACTION_METADATA_KEY,
      context.getHandler(),
    );
    const readTables: Record<string, string> = {
      'ops:device-key': 'device_key',
      'ops:grant': 'offline_authorization_grant',
      'ops:package': 'provisioning_package',
      'ops:receipt': 'provisioning_receipt',
      'ops:device-revocation': 'device_revocation',
    };
    if (resource !== 'ops:provisioning' && !(resource in readTables))
      return this.delegate.canActivate(context);
    const request = context
      .switchToHttp()
      .getRequest<
        RequestLike & { tenantId?: string; params?: { id?: string } }
      >();
    const principal = getPrincipalFromRequest(request);
    if (
      !principal ||
      !request.tenantId ||
      !principal.tenants.includes(request.tenantId)
    )
      throw new DetranError('TEAT.AUTH_REQUIRED', { status: 401 });
    const roles = principal.roles,
      claims = principal.claims ?? {};
    const technical = roles.includes('technical-admin'),
      agency = roles.includes('agency-admin');
    if (resource === 'ops:provisioning') {
      const permitted =
        action === 'create-key-challenge' || action === 'revoke-offline-grant'
          ? technical || agency
          : action === 'issue-provisioning-package'
            ? agency || roles.includes('field-supervisor')
            : action === 'readiness'
              ? technical || agency || typeof claims.agent_id === 'string'
              : action === 'register-device-key' ||
                  action === 'download-provisioning-package'
                ? !!principal.id
                : action === 'record-provisioning-receipt' ||
                    action === 'reconcile-offline-grant'
                  ? typeof claims.device_id === 'string'
                  : false;
      if (!permitted)
        throw new DetranError('TEAT.FORBIDDEN_ACTION', { status: 403 });
      return true;
    }
    if (action !== 'read')
      throw new DetranError('TEAT.FORBIDDEN_ACTION', { status: 403 });
    // A5 grants agency administrators specific commands, not generic CRUD.
    // Generated readers remain tenant-scoped and need no pre-read agency TOCTOU.
    if (!technical)
      throw new DetranError('TEAT.FORBIDDEN_ACTION', { status: 403 });
    return true;
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
        BoatDocumentsRuntimeModule,
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
        // Portal do cidadão (R-0009 CTG-0001, plan M1/M24): `identity` traz
        // as rotas manuscritas deste grupo; os outros quatro são montados
        // como módulos puramente gerados (sem rotas) até CTG-0002.
        // CTG-0002 §3.2/§14 (TASK-0007): o mapa `PORTAL_DELEGATION_TARGETS`
        // (global) é composto antes dos módulos que o consomem.
        // CTG-0002 §8/§14 (TASK-0008): portas nacionais, leitor de parâmetros e
        // poller das projeções (global) antes de `ProjectionsModule`.
        PortalNationalReadPortsModule,
        PortalDelegationTargetsModule,
        IdentityModule,
        RequestsModule,
        InboxModule,
        CitizenServiceModule,
        ProjectionsModule,
        CrashesModule,
        // R-0011 CTG-0002 §13.3/§14.2 (TASK-0013): relógio, calendário,
        // discovery e `deps` do sweeper (global) antes de `MonitorModule`, que
        // os injeta pelos tokens de `cycle/tokens.ts`; reexporta
        // `OpsParameterService` para o módulo gerado (§1.3.7).
        DashboardSweepModule,
        MonitorModule,
        RenaestMirrorModule,
        // Infractions scope (TEAT/RAIT): generated CRUD modules plus the
        // handwritten AIT lifecycle commands (WP-T0).
        // Portas do protocolo de sincronização (CTG-0002 §4.8) antes dos
        // módulos que as consomem.
        TeatSyncModule,
        TeatEvidencePortsModule,
        TeatSnapshotPortsModule,
        TeatMeasuresPortsModule,
        NormativeModule,
        ParameterModule,
        AitModule,
        MeasuresModule,
        AlcoholModule,
        CrashModule,
        RaitCaseModule,
        RaitWorklistModule,
        RaitSessionModule,
        InfractionModule,
        NotificationModule,
        RaitOrgModule,
        CollectionModule,
        RaitIntegrationModule,
        AgencyModule,
        FieldModule,
        SnapshotsModule,
        EvidenceModule,
        OfflineSyncModule,
        ProvisioningModule,
        DetranErrorFilterModule,
        // Speed meters stay behind the `teat.speed_meters` flag (steering H.54:
        // the agency does not operate meters today).
        ...(detranFeatureFlagSet().flags['teat.speed_meters']?.default === true
          ? [SpeedModule]
          : []),
      ],
      controllers: [
        TeatStreamController,
        // CTG-0002 §9 (TASK-0008): SSE do cidadão.
        PortalStreamController,
        // R-0011 CTG-0002 §11 (TASK-0013): SSE do DASHBOARD (`dashboard:alert:read`).
        DashboardStreamController,
        RaitStreamController,
        TeatIntegrationsController,
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
        ProvisioningIfMatchGuard,
        {
          provide: APP_GUARD,
          useExisting: ProvisioningIfMatchGuard,
        },
        DetranDatabaseBinder,
        ...authProviders,
        BoatVictimPurposeInterceptor,
        {
          provide: APP_INTERCEPTOR,
          useExisting: BoatVictimPurposeInterceptor,
        },
        DetranPolicyGuard,
        TeatStreamService,
        // CTG-0004 §16.3 (adenda, iteração 3): porta do poller do SSE — a
        // fábrica é a única chamadora de `setInterval` em produção
        // (`teat-stream.service.ts`); testes injetam outra implementação.
        {
          provide: TEAT_STREAM_POLLER,
          useFactory: () => createDefaultTeatStreamPoller(),
        },
        // CTG-0002 §9 (M18, TASK-0008): SSE do Portal e a porta do seu poller —
        // mesma fábrica do TEAT (única chamadora de `setInterval`).
        PortalStreamService,
        {
          provide: PORTAL_STREAM_POLLER,
          useFactory: () => createDefaultTeatStreamPoller(),
        },
        // R-0011 CTG-0002 §11 (M23, TASK-0013): SSE do DASHBOARD e a porta do
        // seu poller — mesma fábrica do TEAT (única chamadora de `setInterval`).
        DashboardStreamService,
        {
          provide: DASHBOARD_STREAM_POLLER,
          useFactory: () => createDefaultTeatStreamPoller(),
        },
        RaitStreamService,
        {
          provide: RAIT_STREAM_POLLER,
          useFactory: () => createDefaultTeatStreamPoller(),
        },
        TeatIntegrationsService,
        PecProcessParametersService,
        PecRenachProcessService,
        PecRenachTransmissionService,
        BoatRenaestTransmissionService,
        {
          provide: BOAT_RENAEST_TENANT_DISCOVERY,
          useFactory: (database: Database) =>
            new SqlBoatRenaestTenantDiscovery(database),
          inject: [Database],
        },
        {
          provide: BOAT_RENAEST_MONTHLY_LEDGER,
          useFactory: (
            database: Database,
            requestContext: RequestContextMutator,
          ) => new SqlBoatRenaestMonthlyLedger(database, requestContext),
          inject: [Database, RequestContextMutator],
        },
        {
          provide: BoatRenaestJobService,
          useFactory: createBoatRenaestJobService,
          inject: [
            BOAT_RENAEST_TENANT_DISCOVERY,
            BOAT_RENAEST_MONTHLY_LEDGER,
            BoatRenaestTransmissionService,
            RequestContextMutator,
          ],
        },
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
          provide: BOAT_RENAEST_PORT,
          useFactory: () => createSenatranAdapter().ports.renaest,
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
        DetranPolicyErrorGuard,
        ProvisioningPolicyGuard,
        { provide: APP_GUARD, useExisting: ProvisioningPolicyGuard },
        RaitTransactionalAuditInterceptor,
        {
          provide: APP_INTERCEPTOR,
          useExisting: RaitTransactionalAuditInterceptor,
        },
      ],
    };
  }
}
