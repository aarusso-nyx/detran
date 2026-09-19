import type {
  AuditEventEnvelope,
  AuditSink,
  AuthVerificationResult,
  PermissionRequirement,
  PolicyEvaluationContext,
  PolicyEvaluator,
  Principal,
  RoleRequirement,
  TenantEntitlementContext,
  TenantEntitlementPolicy,
  TenantResolver,
  TenantResolverContext,
  TokenVerifier,
} from '@stynx-nyx/contracts';
import { CognitoTokenVerifier } from '@stynx-nyx/auth';
import {
  generateRequestId,
  RequestContext,
  RequestContextMutator,
} from '@stynx-nyx/core';
import {
  Database,
  type StynxDataModuleOptions,
  type Transaction,
} from '@stynx-nyx/data';
import type { StynxHealthModuleOptions } from '@stynx-nyx/health';
import type {
  SessionJwtSigningService,
  SessionStore,
  StynxSessionsModuleOptions,
} from '@stynx-nyx/sessions';
import {
  PgIdempotencyStore,
  type IdempotencyBackend,
  type IdempotencyDecisionContext,
  type IdempotencyStoredEntry,
  type IdempotencySqlExecutor,
  type IdempotencyStore,
} from '@stynx-nyx/idempotency';
import {
  PgRateLimitStore,
  type RateLimitDecision,
  type RateLimitDecisionContext,
  type RateLimitMetadata,
  type RateLimitPolicyResolver,
  type ResolvedRateLimitPolicy,
  type RateLimitSqlExecutor,
  type RateLimitStore,
} from '@stynx-nyx/ratelimit';
import type { StynxStorageModuleOptions } from '@stynx-nyx/storage';

import { isDetranActionAllowed, permissionsForRoles } from '@detran/shared';
import {
  InMemoryFeatureFlagProvider,
  type FlagSet,
} from '@stynx-nyx/feature-flags';
import { PARAMETER_FLAGS } from './generated/parameter-flags.js';

export type DetranRuntimeProfile =
  'local-sandbox' | 'test' | 'staging-like' | 'production';

const LOCAL_TENANT_ID =
  process.env.DETRAN_LOCAL_TENANT_ID ?? '00000000-0000-7000-8000-000000000001';

export function detranRuntimeProfile(): DetranRuntimeProfile {
  const raw =
    process.env.DETRAN_RUNTIME_PROFILE ??
    (process.env.NODE_ENV === 'test' ? 'test' : 'local-sandbox');
  if (
    raw === 'local-sandbox' ||
    raw === 'test' ||
    raw === 'staging-like' ||
    raw === 'production'
  ) {
    return raw;
  }
  throw new Error(`Unsupported DETRAN_RUNTIME_PROFILE: ${raw}`);
}

export function isLocalRuntimeProfile(profile: DetranRuntimeProfile): boolean {
  return profile === 'local-sandbox' || profile === 'test';
}

function defaultDatabaseUrl(): string {
  return (
    process.env.DATABASE_URL ??
    'postgresql://postgres:postgres@localhost:5432/detran'
  );
}

function requireNonLocalConnection(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required outside local-sandbox/test`);
  return value;
}

function requireNonLocalHttpsUrl(name: string): string {
  const value = requireNonLocalConnection(name);
  const parsed = new URL(value);
  if (parsed.protocol !== 'https:') {
    throw new Error(`${name} must use HTTPS outside local-sandbox/test`);
  }
  return value;
}

function requireNonLocalRedisUrl(name: string): string {
  const value = requireNonLocalConnection(name);
  const parsed = new URL(value);
  if (parsed.protocol !== 'rediss:') {
    throw new Error(
      `${name} must use TLS (rediss:) outside local-sandbox/test`,
    );
  }
  return value;
}

export function detranSessionsOptions(): StynxSessionsModuleOptions {
  const profile = detranRuntimeProfile();
  if (isLocalRuntimeProfile(profile)) {
    throw new Error(
      'STYNX Redis sessions are only composed in non-local profiles',
    );
  }
  const issuer = requireNonLocalHttpsUrl('STYNX_SESSION_ISSUER');
  const redisUrl = requireNonLocalRedisUrl('STYNX_REDIS_URL');
  const secretId = requireNonLocalConnection('STYNX_SESSION_SIGNING_SECRET_ID');
  if (process.env.STYNX_SESSION_SIGNING_KEY_SET) {
    throw new Error(
      'Inline STYNX session signing keys are forbidden outside local/test',
    );
  }
  return {
    issuer,
    ...(process.env.STYNX_SESSION_AUDIENCE
      ? { audience: process.env.STYNX_SESSION_AUDIENCE }
      : {}),
    redis: {
      url: redisUrl,
      keyPrefix: process.env.STYNX_SESSION_KEY_PREFIX ?? 'detran:sessions',
      invalidateChannel:
        process.env.STYNX_SESSION_INVALIDATE_CHANNEL ??
        'detran:sessions:invalidate',
    },
    jwt: { secretId },
  };
}

export function detranFullAuthOptions() {
  const profile = detranRuntimeProfile();
  if (isLocalRuntimeProfile(profile)) {
    throw new Error('Full STYNX auth is only composed in non-local profiles');
  }
  const issuer = requireNonLocalHttpsUrl('STYNX_COGNITO_ISSUER');
  const stynxIssuer = requireNonLocalHttpsUrl('STYNX_SESSION_ISSUER');
  return {
    cognito: {
      issuer,
      ...(process.env.STYNX_COGNITO_AUDIENCE
        ? { audience: process.env.STYNX_COGNITO_AUDIENCE }
        : {}),
      ...(process.env.STYNX_COGNITO_JWKS_URI
        ? { jwksUri: requireNonLocalHttpsUrl('STYNX_COGNITO_JWKS_URI') }
        : {}),
    },
    stynx: {
      issuer: stynxIssuer,
      ...(process.env.STYNX_SESSION_AUDIENCE
        ? { audience: process.env.STYNX_SESSION_AUDIENCE }
        : {}),
      jwksUri: process.env.STYNX_SESSION_JWKS_URI
        ? requireNonLocalHttpsUrl('STYNX_SESSION_JWKS_URI')
        : `${stynxIssuer.replace(/\/$/u, '')}/sessions/jwks.json`,
    },
    redis: {
      url: requireNonLocalRedisUrl('STYNX_REDIS_URL'),
      keyPrefix:
        process.env.STYNX_PERMISSION_KEY_PREFIX ?? 'detran:permissions',
      invalidateChannel:
        process.env.STYNX_PERMISSION_INVALIDATE_CHANNEL ??
        'detran:permissions:invalidate',
    },
    permissions: { dbFallbackOnRedisDown: false },
  };
}

export class DetranSessionReadiness {
  private store: SessionStore | undefined;
  private signing: SessionJwtSigningService | undefined;

  bind(store: SessionStore, signing: SessionJwtSigningService): void {
    this.store = store;
    this.signing = signing;
  }

  async checkRedis(): Promise<void> {
    if (isLocalRuntimeProfile(detranRuntimeProfile())) return;
    if (!this.store)
      throw new Error('STYNX session Redis readiness is not bound');
    await this.store.listSessionIdsByTenant(
      '00000000-0000-4000-8000-000000000000',
    );
  }

  async checkJwks(): Promise<void> {
    if (isLocalRuntimeProfile(detranRuntimeProfile())) return;
    if (!this.signing)
      throw new Error('STYNX session signing readiness is not bound');
    const jwks = await this.signing.getJwks();
    if (!Array.isArray(jwks.keys) || jwks.keys.length === 0) {
      throw new Error('STYNX session signing secret exposed no public keys');
    }
  }
}

export function detranDataOptions(): StynxDataModuleOptions {
  const profile = detranRuntimeProfile();
  const local = isLocalRuntimeProfile(profile);
  const fallback = defaultDatabaseUrl();
  const owner = local
    ? (process.env.STYNX_OWNER_DATABASE_URL ?? fallback)
    : requireNonLocalConnection('STYNX_OWNER_DATABASE_URL');
  const app = local
    ? (process.env.STYNX_APP_DATABASE_URL ?? fallback)
    : requireNonLocalConnection('STYNX_APP_DATABASE_URL');
  const reader = local
    ? (process.env.STYNX_READER_DATABASE_URL ?? app)
    : requireNonLocalConnection('STYNX_READER_DATABASE_URL');

  if (!local) {
    const usernames = [owner, app, reader].map(
      (value) => new URL(value).username,
    );
    if (new Set(usernames).size !== 3 || usernames[1] === 'postgres') {
      throw new Error(
        'Non-local database URLs require distinct owner/app/reader principals and a non-owner app principal',
      );
    }
  }

  return {
    connections: {
      owner: {
        connectionString: owner,
        applicationName: 'detran-backend-owner',
      },
      app: { connectionString: app, applicationName: 'detran-backend-app' },
      reader: {
        connectionString: reader,
        applicationName: 'detran-backend-reader',
      },
    },
  };
}

export function detranStorageOptions(): StynxStorageModuleOptions {
  const environment = process.env.STYNX_ENVIRONMENT ?? 'local';
  const region = process.env.STYNX_STORAGE_REGION ?? 'sa-east-1';
  return {
    environment,
    region,
    kmsAlias: process.env.STYNX_KMS_ALIAS ?? 'stynx-local',
    // Published storage 1.0.3 validates this platform-owned naming contract.
    bucketName:
      process.env.STYNX_STORAGE_BUCKET ?? `stynx-docs-${environment}-${region}`,
    collections: {
      evidence: {
        mimeAllowlist: [
          'image/jpeg',
          'image/png',
          'application/pdf',
          'video/mp4',
        ],
        maxBytes: 50 * 1024 * 1024,
        classificationDefault: 'restricted',
      },
      'signed-documents': {
        mimeAllowlist: ['application/pdf'],
        maxBytes: 50 * 1024 * 1024,
        classificationDefault: 'confidential',
      },
      exports: {
        mimeAllowlist: [
          'application/pdf',
          'application/zip',
          'application/json',
        ],
        maxBytes: 250 * 1024 * 1024,
        classificationDefault: 'confidential',
      },
    },
  };
}

export class DetranLocalTokenVerifier implements TokenVerifier {
  async verifyAuthorizationHeader(
    value: string | string[] | undefined,
  ): Promise<AuthVerificationResult> {
    const profile = detranRuntimeProfile();
    if (!isLocalRuntimeProfile(profile)) {
      throw new Error(
        `Local DETRAN token verification is not allowed in ${profile} profile`,
      );
    }
    const raw = Array.isArray(value) ? value[0] : value;
    const token = raw?.startsWith('Bearer ')
      ? raw.slice('Bearer '.length)
      : (raw ?? 'local');
    const defaultRoles = profile === 'test' ? 'technical-admin' : 'field-agent';
    const roles = (process.env.DETRAN_LOCAL_ROLES ?? defaultRoles)
      .split(',')
      .map((role) => role.trim())
      .filter(Boolean);
    const principal: Principal = {
      id:
        process.env.DETRAN_LOCAL_ACTOR_ID ??
        '00000000-0000-4000-8000-000000000002',
      username: 'detran-local',
      roles,
      permissions: permissionsForRoles(roles),
      tenants: [LOCAL_TENANT_ID],
      claims: { local: true },
    };
    return { principal, token };
  }
}

export function detranTokenVerifier(): TokenVerifier {
  const profile = detranRuntimeProfile();
  const issuer = process.env.STYNX_COGNITO_ISSUER;
  const useCognito =
    process.env.DETRAN_AUTH_MODE === 'cognito' || Boolean(issuer);
  if (!isLocalRuntimeProfile(profile) && !useCognito) {
    throw new Error(
      `${profile} profile requires DETRAN_AUTH_MODE=cognito or STYNX_COGNITO_ISSUER`,
    );
  }
  if (!useCognito) return new DetranLocalTokenVerifier();
  if (!issuer) {
    throw new Error(
      'STYNX_COGNITO_ISSUER is required when DETRAN_AUTH_MODE=cognito',
    );
  }
  return new CognitoTokenVerifier({
    issuer,
    audience: process.env.STYNX_COGNITO_AUDIENCE,
    jwksUri: process.env.STYNX_COGNITO_JWKS_URI,
    enforceTokenUse:
      process.env.STYNX_COGNITO_TOKEN_USE === 'id' ? 'id' : 'access',
    roleClaims: (
      process.env.STYNX_COGNITO_ROLE_CLAIMS ?? 'cognito:groups,roles'
    )
      .split(',')
      .map((claim) => claim.trim())
      .filter(Boolean),
    permissionClaims: (
      process.env.STYNX_COGNITO_PERMISSION_CLAIMS ?? 'permissions'
    )
      .split(',')
      .map((claim) => claim.trim())
      .filter(Boolean),
    tenantClaims: (
      process.env.STYNX_COGNITO_TENANT_CLAIMS ??
      'tenants,custom:tenant_id,https://stynx.dev/tenant'
    )
      .split(',')
      .map((claim) => claim.trim())
      .filter(Boolean),
  });
}

export class DetranTenantResolver implements TenantResolver {
  resolve(context: TenantResolverContext): string {
    const tenantId = context.headerTenantId ?? context.principal.tenants[0];
    if (tenantId) return tenantId;
    const profile = detranRuntimeProfile();
    if (isLocalRuntimeProfile(profile)) return LOCAL_TENANT_ID;
    throw new Error(`Tenant context is required in ${profile} profile`);
  }
}

export class DetranTenantEntitlementPolicy implements TenantEntitlementPolicy {
  isEntitled(context: TenantEntitlementContext): boolean {
    return context.principal.tenants.includes(context.tenantId);
  }
}

export class DetranPolicyEvaluator implements PolicyEvaluator {
  evaluate(context: PolicyEvaluationContext): boolean {
    if (context.principal.permissions.includes('*')) return true;
    if (!this.matchesRoles(context.principal.roles, context.requirements.roles))
      return false;
    if (
      !this.matchesPermissions(
        context.principal.permissions,
        context.requirements.permissions,
      )
    ) {
      return false;
    }
    return context.resource?.includes(':') && context.action
      ? isDetranActionAllowed(
          context.principal,
          context.resource,
          context.action,
        )
      : true;
  }

  private matchesRoles(
    actual: string[],
    requirement?: RoleRequirement,
  ): boolean {
    if (!requirement) return true;
    return requirement.mode === 'any'
      ? requirement.roles.some((role) => actual.includes(role))
      : requirement.roles.every((role) => actual.includes(role));
  }

  private matchesPermissions(
    actual: string[],
    requirement?: PermissionRequirement,
  ): boolean {
    if (!requirement) return true;
    return requirement.mode === 'any'
      ? requirement.permissions.some((permission) =>
          actual.includes(permission),
        )
      : requirement.permissions.every((permission) =>
          actual.includes(permission),
        );
  }
}

type AuditDatabase = Pick<Database, 'tx'>;

export class DetranPersistedAuditSink implements AuditSink {
  private database: AuditDatabase | undefined;

  bindDatabase(database: AuditDatabase): void {
    this.database = database;
  }

  async write(event: AuditEventEnvelope): Promise<void> {
    if (!this.database)
      throw new Error('DETRAN audit sink requires the Database provider');
    if (!event.tenantId)
      throw new Error('DETRAN audit events require tenantId');
    const details = {
      ...(event.requestId ? { requestId: event.requestId } : {}),
      ...(event.pk ? { pk: event.pk } : {}),
      ...(event.oldData ? { oldData: event.oldData } : {}),
      ...(event.newData ? { newData: event.newData } : {}),
      ...(event.metadata ? { metadata: event.metadata } : {}),
    };
    await this.database.tx(async (transaction: Transaction) => {
      await transaction.query(
        `select audit.write(
           $1::uuid, $2::uuid, $3, $4, $5, $6::uuid,
           $7::jsonb, $8::inet, null::uuid, $9::uuid
         )`,
        [
          event.tenantId,
          uuidOrNull(event.actorId),
          event.actorRole ?? null,
          event.action,
          event.entity,
          uuidOrNull(event.entityId),
          JSON.stringify(details),
          event.ipAddress ?? null,
          uuidOrNull(event.correlationId),
        ],
      );
    });
  }
}

function uuidOrNull(value: string | undefined): string | null {
  return value &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    )
    ? value
    : null;
}

export class DetranPostgresReadiness {
  private database: Database | undefined;

  bindDatabase(database: Database): void {
    this.database = database;
  }

  async check(): Promise<void> {
    if (!this.database)
      throw new Error('DETRAN database readiness is not bound');
    await this.database.withSystemContext(
      'DETRAN postgres readiness',
      async () =>
        this.database!.tx(
          async (transaction) => void (await transaction.query('select 1')),
          {
            role: 'owner',
            readonly: true,
            retry: false,
            deadlineMs: 1_500,
          },
        ),
    );
  }
}

type PipelineDatabase = Pick<Database, 'tx'>;

/** Runs STYNX pipeline persistence through the request-bound app connection. */
export class DetranPipelineSqlExecutor
  implements IdempotencySqlExecutor, RateLimitSqlExecutor
{
  private database: PipelineDatabase | undefined;

  bindDatabase(database: PipelineDatabase): void {
    this.database = database;
  }

  async query<T = Record<string, unknown>>(
    sql: string,
    params?: ReadonlyArray<unknown>,
  ): Promise<{ rows: T[]; rowCount?: number }> {
    if (!this.database) {
      throw new Error(
        'DETRAN pipeline persistence requires the Database provider',
      );
    }
    return this.database.tx(
      async (transaction) => {
        const result = await transaction.query(
          sql,
          params ? [...params] : undefined,
        );
        return {
          rows: result.rows as T[],
          ...(result.rowCount === null ? {} : { rowCount: result.rowCount }),
        };
      },
      { role: 'app' },
    );
  }
}

export class DetranPersistentPipelineStore
  implements IdempotencyStore, RateLimitStore
{
  private requestContext: RequestContext | undefined;
  private requestContextMutator: RequestContextMutator | undefined;
  private readonly idempotency: PgIdempotencyStore;
  private readonly rateLimit: PgRateLimitStore;

  constructor(executor: DetranPipelineSqlExecutor) {
    this.idempotency = new PgIdempotencyStore({ executor });
    this.rateLimit = new PgRateLimitStore({ executor });
  }

  bindRequestContext(
    requestContext: RequestContext,
    requestContextMutator: RequestContextMutator,
  ): void {
    this.requestContext = requestContext;
    this.requestContextMutator = requestContextMutator;
  }

  lookup(context: IdempotencyDecisionContext) {
    return this.runBound(context, () => this.idempotency.lookup(context));
  }

  reserve(context: IdempotencyDecisionContext) {
    return this.runBound(context, () => this.idempotency.reserve(context));
  }

  persistResponse(
    context: IdempotencyDecisionContext,
    statusCode: number,
    body: unknown,
    headers?: Record<string, string>,
  ) {
    return this.runBound(context, () =>
      this.idempotency.persistResponse(context, statusCode, body, headers),
    );
  }

  clearReservation(context: IdempotencyDecisionContext) {
    return this.runBound(context, () =>
      this.idempotency.clearReservation(context),
    );
  }

  consume(context: RateLimitDecisionContext): Promise<RateLimitDecision> {
    return this.runBound(context, () => this.rateLimit.consume(context));
  }

  private runBound<T>(
    context: Pick<IdempotencyDecisionContext, 'tenantId' | 'userId'>,
    work: () => Promise<T>,
  ): Promise<T> {
    if (!this.requestContext || !this.requestContextMutator) {
      throw new Error('DETRAN pipeline request context is not bound');
    }
    if (this.requestContext.hasActiveContext()) return work();
    if (!context.tenantId || !context.userId) {
      throw new Error(
        'DETRAN durable pipeline requires tenant and actor context',
      );
    }
    return Promise.resolve(
      this.requestContextMutator.runWithRequestContext(
        {
          requestId: generateRequestId(),
          tenantId: context.tenantId,
          actorId: context.userId,
          startedAt: new Date(),
        },
        work,
      ),
    );
  }
}

/**
 * Lets the PostgreSQL unique reservation be the cross-instance lock. Cache
 * operations deliberately do nothing; durable storage is authoritative.
 */
export class DetranDurableIdempotencyBackend implements IdempotencyBackend {
  async get(
    _context: IdempotencyDecisionContext,
  ): Promise<IdempotencyStoredEntry | null> {
    return null;
  }

  async set(
    _context: IdempotencyDecisionContext,
    _entry: IdempotencyStoredEntry,
  ): Promise<void> {}

  async acquireLock(
    _context: IdempotencyDecisionContext,
    _token: string,
  ): Promise<boolean> {
    return true;
  }

  async releaseLock(
    _context: IdempotencyDecisionContext,
    _token: string,
  ): Promise<void> {}

  async isLocked(_context: IdempotencyDecisionContext): Promise<boolean> {
    return false;
  }
}

export class DetranRateLimitPolicyResolver implements RateLimitPolicyResolver {
  async resolve(
    _request: unknown,
    metadata: RateLimitMetadata,
  ): Promise<ResolvedRateLimitPolicy> {
    return {
      ...metadata,
      cost: metadata.cost ?? 1,
      limit:
        metadata.limit ?? Number(process.env.STYNX_RATE_LIMIT_DEFAULT ?? 120),
      windowSeconds:
        metadata.windowSeconds ??
        Number(process.env.STYNX_RATE_LIMIT_WINDOW_SECONDS ?? 60),
    };
  }
}

export const detranPipelineSqlExecutor = new DetranPipelineSqlExecutor();
export const detranPersistentPipelineStore = new DetranPersistentPipelineStore(
  detranPipelineSqlExecutor,
);
export const detranIdempotencyBackend = new DetranDurableIdempotencyBackend();
export const detranRateLimitPolicyResolver =
  new DetranRateLimitPolicyResolver();

export function detranHealthOptions(
  readiness: DetranPostgresReadiness,
  sessions?: DetranSessionReadiness,
): StynxHealthModuleOptions {
  return {
    appInfo: { name: 'detran-backend', stack: 'nestjs-postgresql-postgis' },
    pgCheck: () => readiness.check(),
    ...(sessions
      ? {
          redisCheck: () => sessions.checkRedis(),
          jwksCheck: () => sessions.checkJwks(),
        }
      : {}),
  };
}

export function detranPipelineOptions() {
  return {
    rateLimit: {
      defaultLimit: Number(process.env.STYNX_RATE_LIMIT_DEFAULT ?? 120),
      defaultWindowSeconds: Number(
        process.env.STYNX_RATE_LIMIT_WINDOW_SECONDS ?? 60,
      ),
      healthCheckPathPrefixes: [
        '/healthz',
        '/readyz',
        '/v1/healthz',
        '/v1/readyz',
      ],
      distributedStrict: true,
      store: detranPersistentPipelineStore,
      policyResolver: detranRateLimitPolicyResolver,
    },
    idempotency: {
      ttlMs: Number(
        process.env.STYNX_IDEMPOTENCY_TTL_MS ?? 24 * 60 * 60 * 1_000,
      ),
      durableStrict: true,
      store: detranPersistentPipelineStore,
      backend: detranIdempotencyBackend,
    },
  };
}

/**
 * Static feature-flag set of the backend (ADR-0021, `@stynx-nyx/feature-flags`
 * contract). Boolean switches decided by the Owner default to the catalogue
 * value (`docs/framework/arch/parameter-catalogue.md`) and can be turned on per
 * environment with `DETRAN_FEATURE_<NAME>=on`.
 */
export function detranFeatureFlagSet(): FlagSet {
  const on = (key: string, fallback: boolean): boolean => {
    const canonical = detranFeatureEnvironmentName(key);
    const legacy =
      key === 'teat.speed_meters'
        ? process.env.DETRAN_FEATURE_SPEED_METERS
        : undefined;
    const raw = process.env[canonical] ?? legacy;
    if (raw === undefined || raw === '') return fallback;
    return raw === 'on' || raw === 'true' || raw === '1';
  };
  return {
    flags: Object.fromEntries(
      Object.entries(PARAMETER_FLAGS).map(([key, fallback]) => [
        key,
        {
          default: on(key, fallback),
          description: `Parameter catalogue flag ${key}`,
          owner: key.split('.')[0],
        },
      ]),
    ),
  } as FlagSet;
}

export function detranFeatureEnvironmentName(key: string): string {
  return `DETRAN_FEATURE_${key.replace(/[^A-Za-z0-9]+/g, '_').toUpperCase()}`;
}

export function detranFeatureFlagProvider(): InMemoryFeatureFlagProvider {
  return new InMemoryFeatureFlagProvider(detranFeatureFlagSet());
}
