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
import { ForbiddenException } from '@nestjs/common';
import { CognitoTokenVerifier } from '@stynx-nyx/auth';
import { headerToString } from '@stynx-nyx/contracts';
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

import {
  DetranError,
  isDetranActionAllowed,
  permissionsForRoles,
} from '@detran/shared';
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
      claims: {
        local: true,
        // M3/H.39/OD-T01, CTG-0001 §5: the real IdP's attribute mapping for
        // `decision_body` is deployment configuration (source_pending,
        // OD-T18); the local profile only lets tests opt into it.
        ...(process.env.DETRAN_LOCAL_DECISION_BODY
          ? { decision_body: process.env.DETRAN_LOCAL_DECISION_BODY }
          : {}),
        // R-0009 CTG-0001 §2.3 (M3; ADR-0024 §6): o IdP gov.br é simulado —
        // os valores são copiados literalmente e NÃO validados aqui; quem
        // falha em valor inválido é a `PortalCitizenGuard` (fail-closed).
        // Ausência da variável = ausência da claim.
        ...(process.env.DETRAN_LOCAL_ASSURANCE_LEVEL
          ? { assurance_level: process.env.DETRAN_LOCAL_ASSURANCE_LEVEL }
          : {}),
        ...(process.env.DETRAN_LOCAL_CPF
          ? { cpf: process.env.DETRAN_LOCAL_CPF }
          : {}),
        ...(process.env.DETRAN_LOCAL_GOVBR_LEVEL
          ? { govbr_level: process.env.DETRAN_LOCAL_GOVBR_LEVEL }
          : {}),
      },
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

type HostnameDirectoryDatabase = Pick<Database, 'tx' | 'withSystemContext'>;

/**
 * Host público → tenant (R-0009 CTG-0001 §9; plan M11): mapa em memória de
 * `portal.public_hostname` (`enabled = true`, sem RLS por desenho — DDL 19),
 * carregado no bootstrap do app (`DetranDatabaseBinder`) fora do caminho da
 * requisição. `TenantResolver.resolve` é síncrono no STYNX 1.3.1, por isso o
 * diretório não consulta o banco por requisição. Recarga por intervalo:
 * valor sem fonte (source_pending, OD-P22) — só `reload()` explícito.
 */
export class PortalHostnameDirectory {
  private database: HostnameDirectoryDatabase | undefined;
  private entries = new Map<string, string>();

  bindDatabase(database: HostnameDirectoryDatabase): void {
    this.database = database;
  }

  async reload(): Promise<void> {
    const database = this.database;
    if (!database) {
      throw new Error(
        'DETRAN portal hostname directory requires the Database provider',
      );
    }
    const rows = await database.withSystemContext(
      'DETRAN portal hostname directory',
      () =>
        database.tx(
          async (transaction) =>
            (
              await transaction.query<{ hostname: string; tenant_id: string }>(
                `select hostname, tenant_id
                   from portal.public_hostname
                  where enabled = true`,
              )
            ).rows,
          { role: 'owner', readonly: true, retry: false },
        ),
    );
    this.entries = new Map(
      rows.map((row) => [row.hostname.toLowerCase(), row.tenant_id]),
    );
  }

  tenantIdFor(host: string | undefined): string | undefined {
    return host ? this.entries.get(host) : undefined;
  }
}

export const detranPortalHostnameDirectory = new PortalHostnameDirectory();

/** Cabeçalho `Host` normalizado (minúsculo, sem porta) — CTG-0001 §9. */
export function portalHostOf(
  headers: Record<string, unknown>,
): string | undefined {
  const raw = headerToString(headers['host'])?.trim().toLowerCase();
  if (!raw) return undefined;
  const withoutPort = raw.replace(/:\d+$/u, '');
  return withoutPort || undefined;
}

export interface PortalTenantResolutionInput {
  /** `X-Tenant-Id` ou `principal.tenants[0]` (comportamento atual). */
  sessionTenantId?: string;
  /** `Host` normalizado por `portalHostOf`. */
  host?: string;
}

/**
 * R-0009 CTG-0001 §9 (M11): regras, nesta ordem —
 * 1. sessão e Host mapeado divergem → 403 `PORTAL.SESSION_TENANT_MISMATCH`;
 * 2. sessão → sessão; 3. Host mapeado → tenant do Host; 4/5. consulta ao Host
 * ligada e nada mapeado → 421 `PORTAL.TENANT_UNRESOLVED`, senão perfil local
 * → `LOCAL_TENANT_ID` (inalterado); 6. (inalcançável fora do local) erro.
 * A consulta ao Host só existe fora do perfil local ou com
 * `DETRAN_PORTAL_HOST_RESOLUTION=on`: sem a flag, o perfil local é idêntico
 * ao de antes (nenhuma consulta a `public_hostname`).
 */
export class DetranTenantResolver implements TenantResolver {
  constructor(
    private readonly directory: PortalHostnameDirectory = detranPortalHostnameDirectory,
  ) {}

  /**
   * R-0022 CTG-0003 R-6: o Host vem de `TenantResolverContext.host` (cabeçalho
   * cru, preenchido pelo `AuthContextGuard` publicado nos perfis locais),
   * normalizado pela mesma regra de `portalHostOf`.
   */
  resolve(context: TenantResolverContext): string {
    return this.resolveTenant({
      sessionTenantId: context.headerTenantId ?? context.principal.tenants[0],
      host: portalHostOf({ host: context.host }),
    });
  }

  private hostLookupEnabled(): boolean {
    return (
      process.env.DETRAN_PORTAL_HOST_RESOLUTION === 'on' ||
      !isLocalRuntimeProfile(detranRuntimeProfile())
    );
  }

  private mappedTenantFor(host: string | undefined): string | undefined {
    return this.hostLookupEnabled()
      ? this.directory.tenantIdFor(host)
      : undefined;
  }

  resolveTenant(input: PortalTenantResolutionInput): string {
    const profile = detranRuntimeProfile();
    const hostLookup = this.hostLookupEnabled();
    const session = input.sessionTenantId || undefined;
    const mapped = this.mappedTenantFor(input.host);
    if (session && mapped && session !== mapped) {
      throw new DetranError('PORTAL.SESSION_TENANT_MISMATCH', {
        status: 403,
        context: {},
      });
    }
    if (session) return session;
    if (mapped) return mapped;
    // Com a consulta ao Host ligada (perfil não local ou flag), um Host não
    // mapeado é 421 mesmo no perfil local — é a única forma de o e2e provar o
    // caminho 5 (§9, C-0001-48); o padrão local (`LOCAL_TENANT_ID`) só vale
    // com a flag desligada (C-0001-50, comportamento atual).
    if (hostLookup) {
      throw new DetranError('PORTAL.TENANT_UNRESOLVED', {
        status: 421,
        context: {},
      });
    }
    if (isLocalRuntimeProfile(profile)) return LOCAL_TENANT_ID;
    throw new Error(`Tenant context is required in ${profile} profile`);
  }
}

/** Prefixo das rotas do Portal (portal-route-contract.md §1.1). */
export const PORTAL_ROUTE_PREFIX = '/v1/portal/';

/**
 * Ator nominal das rotas públicas de `/v1/portal/*` (CTG-0001 §8: "não há
 * actorId em rota pública"). `Database.tx({ role: 'app' })` exige `tenantId`
 * E `actorId` no `RequestContext`, logo a leitura pública precisa de um ator no
 * contexto. OD-R22-62 (a) (Owner, AUTHORIZATION.md Adenda B15): UUIDv7 fixo e
 * documentado — a `@stynx-nyx/tenancy` 1.5.0 recusa o UUID nulo em
 * `publicTenant.actorId`. Preserva OD-P27 ("nenhum ator"): o sink de auditoria
 * o grava como ator nulo (`auditActorOrNull`) e nenhuma tabela o referencia.
 */
export const PORTAL_PUBLIC_ACTOR_ID = '01a0f0bb-6b7e-74ab-bd54-f1b2761276a2';

export function isPortalRoutePath(path: string): boolean {
  return path.startsWith(PORTAL_ROUTE_PREFIX);
}

/**
 * `resolveHost` de `StynxTenancyModule.forRoot({ publicTenant })` (R-0022
 * CTG-0003 R-3): tenant das rotas `@PublicTenantRoute()` de `/v1/portal/*` só
 * pelo Host (OD-S15-01; OD-R22-49) — o cabeçalho `X-Tenant-Id` nunca escolhe o
 * tenant, só gera conflito na plataforma (traduzido em
 * `detran-error.filter.ts`, OD-R22-37). Caminho fora do Portal → `undefined`
 * (a plataforma recusa); Host mapeado com a consulta ligada → tenant do Host;
 * consulta ligada sem mapeamento → 421 `PORTAL.TENANT_UNRESOLVED`; consulta
 * desligada no perfil local → `LOCAL_TENANT_ID`; fora disso, o erro de
 * `DetranTenantResolver.resolveTenant`. Sem estado novo: o diretório continua
 * carregado só no bootstrap (OD-P22).
 */
export type PublicTenantHostResolver = (context: {
  host?: string;
  path: string;
}) => string | undefined;

export function detranPortalPublicTenantHost(
  resolver: DetranTenantResolver = new DetranTenantResolver(),
): PublicTenantHostResolver {
  return ({ host, path }) =>
    isPortalRoutePath(path)
      ? resolver.resolveTenant({ host: portalHostOf({ host }) })
      : undefined;
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
          auditActorOrNull(event.actorId),
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

/** OD-R22-62: o ator nominal das rotas públicas é gravado como ator nulo. */
function auditActorOrNull(value: string | undefined): string | null {
  return value === PORTAL_PUBLIC_ACTOR_ID ? null : uuidOrNull(value);
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

/**
 * Predicado de _membership_ ativa de `TenantContextInterceptor` (STYNX
 * `@stynx-nyx/tenancy` 1.4.0, `hasActiveMembership`), transcrito sem mudança:
 * mesma fonte (`auth.memberships` + `tenancy.tenants`), mesmas condições.
 */
const ACTIVE_MEMBERSHIP_SQL = `select exists (
    select 1
      from auth.memberships membership
      join tenancy.tenants tenant
        on tenant.id = membership.tenant_id
     where membership.user_id = $1::uuid
       and membership.tenant_id = $2::uuid
       and membership.is_active = true
       and tenant.is_active = true
       and coalesce(tenant.state, 'active') = 'active'
  ) as allowed`;

/**
 * R-0022 B6 (hotfix, AUTHORIZATION.md Adenda B13, OD-R22-58 (a)): gravações
 * DETRAN que rodam ANTES do `TenantContextInterceptor` (guards globais e
 * interceptores registrados fora dele) só escrevem no tenant pedido depois de
 * confirmar a _membership_ ativa do ator nele. A consulta roda pelo executor
 * vinculado à requisição (papel `app`, RLS) no contexto do próprio tenant
 * pedido — o mesmo em que a gravação ocorreria —, nunca em contexto de
 * sistema. Sem _membership_ → a mesma recusa da tenancy
 * (`403 TENANT_ACCESS_DENIED`) e nenhuma gravação.
 */
export class DetranTenantMembershipVerifier {
  constructor(
    private readonly executor: Pick<DetranPipelineSqlExecutor, 'query'>,
  ) {}

  /** Exige contexto de requisição ativo com `tenantId` = `tenantId`. */
  async isActiveMember(tenantId: string, actorId: string): Promise<boolean> {
    const result = await this.executor.query<{ allowed: boolean }>(
      ACTIVE_MEMBERSHIP_SQL,
      [actorId, tenantId],
    );
    return result.rows[0]?.allowed === true;
  }

  async assertActiveMember(
    tenantId: string,
    actorId: string | undefined,
  ): Promise<void> {
    if (!actorId || !(await this.isActiveMember(tenantId, actorId)))
      throw new ForbiddenException('TENANT_ACCESS_DENIED');
  }
}

/**
 * Rota `@PublicTenantRoute()` reconhecida pelo metadado publicado: o guard de
 * autenticação STYNX 1.5.0 (`AuthContextGuard`/`StynxAuthGuard`) lê
 * `STYNX_PUBLIC_TENANT_ROUTE` do handler/classe e marca
 * `request.publicTenantRoute = true` antes dos demais guards.
 */
function isPublicTenantRouteRequest(request: unknown): boolean {
  return (
    typeof request === 'object' &&
    request !== null &&
    (request as { publicTenantRoute?: unknown }).publicTenantRoute === true
  );
}

function missingPipelineContext(): Error {
  return new Error('DETRAN durable pipeline requires tenant and actor context');
}

export class DetranPersistentPipelineStore
  implements IdempotencyStore, RateLimitStore
{
  private requestContext: RequestContext | undefined;
  private requestContextMutator: RequestContextMutator | undefined;
  private readonly idempotency: PgIdempotencyStore;
  private readonly rateLimit: PgRateLimitStore;
  private readonly membership: DetranTenantMembershipVerifier;

  constructor(
    executor: DetranPipelineSqlExecutor,
    private readonly publicTenantHost: PublicTenantHostResolver = detranPortalPublicTenantHost(),
  ) {
    this.idempotency = new PgIdempotencyStore({ executor });
    this.rateLimit = new PgRateLimitStore({ executor });
    this.membership = new DetranTenantMembershipVerifier(executor);
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
    // OD-R22-63: a janela é contada no tenant efetivo do escopo (o do Host,
    // com o ator nominal, em rota `@PublicTenantRoute` sem tenant na decisão).
    return this.runBound(context, (scope) =>
      this.rateLimit.consume({ ...context, ...scope }),
    );
  }

  /**
   * Sem contexto ativo, a chamada vem de antes da tenancy (o `RateLimitGuard`
   * é guard global): o tenant da decisão (claim/cabeçalho) ainda não teve a
   * _membership_ validada. R-0022 B6: valida-a antes de gravar; sem ela, a
   * mesma recusa da tenancy e nenhuma janela no tenant pedido.
   */
  private runBound<T>(
    context: Pick<IdempotencyDecisionContext, 'tenantId' | 'userId'> & {
      request?: unknown;
    },
    work: (scope: { tenantId?: string; userId?: string }) => Promise<T>,
  ): Promise<T> {
    if (!this.requestContext || !this.requestContextMutator) {
      throw new Error('DETRAN pipeline request context is not bound');
    }
    // STYNX 1.5.0 (UPS-TEN-01 (b)): o core abre o `RequestContext` num
    // middleware antes dos guards, com tenant/ator ainda ausentes. Só um
    // contexto com tenant e ator é utilizável; sem eles vale o caminho
    // "sem contexto" (escopo aberto a partir da decisão), como em 1.4.0.
    if (this.hasUsableRequestContext()) return work({});
    const mutator = this.requestContextMutator;
    const publicTenantRoute = isPublicTenantRouteRequest(context.request);
    // R-0022 OD-R22-63 (c), CTG-0003 Adenda B15 (i): rota
    // `@PublicTenantRoute` sem tenant na decisão → tenant pelo Host com o
    // mesmo `resolveHost` da composição `publicTenant`, ator nominal, sem
    // _membership_ (rota pública por desenho); Host não resolvido → a mesma
    // recusa de sempre (fail-closed).
    if (publicTenantRoute && !context.tenantId) {
      return Promise.resolve()
        .then(() => this.publicTenantOf(context.request))
        .then((tenantId) => {
          if (!tenantId) throw missingPipelineContext();
          return mutator.runWithRequestContext(
            {
              requestId: generateRequestId(),
              tenantId,
              actorId: PORTAL_PUBLIC_ACTOR_ID,
              startedAt: new Date(),
            },
            () => work({ tenantId, userId: PORTAL_PUBLIC_ACTOR_ID }),
          );
        });
    }
    const { tenantId, userId } = context;
    if (!tenantId || !userId) throw missingPipelineContext();
    // Adenda B15 (ii) / hotfix B6: demais casos só gravam no tenant pedido
    // depois de confirmar a _membership_ ativa do ator nele.
    return Promise.resolve(
      mutator.runWithRequestContext(
        {
          requestId: generateRequestId(),
          tenantId,
          actorId: userId,
          startedAt: new Date(),
        },
        async () => {
          await this.membership.assertActiveMember(tenantId, userId);
          return work({});
        },
      ),
    );
  }

  private publicTenantOf(request: unknown): Promise<string | undefined> {
    const { headers, originalUrl, url } = (request ?? {}) as {
      headers?: Record<string, unknown>;
      originalUrl?: string;
      url?: string;
    };
    const host = headerToString(headers?.['host']);
    const path = (originalUrl ?? url ?? '/').split('?', 1)[0] || '/';
    return Promise.resolve(
      this.publicTenantHost({ ...(host ? { host } : {}), path }),
    );
  }

  private hasUsableRequestContext(): boolean {
    if (!this.requestContext?.hasActiveContext()) return false;
    const { tenantId, actorId } = this.requestContext.snapshot();
    return Boolean(tenantId && actorId);
  }
}

/**
 * Coordinates concurrent requests in this process while PostgreSQL remains
 * the durable, cross-instance authority. The STYNX interceptor waits when a
 * local owner already holds the key, then replays the completed durable row.
 */
export class DetranDurableIdempotencyBackend implements IdempotencyBackend {
  private static readonly MAX_ENTRIES = 10_000;
  private readonly locks = new Map<string, string>();
  private readonly entries = new Map<string, IdempotencyStoredEntry>();

  private cached(context: IdempotencyDecisionContext) {
    const entry = this.entries.get(context.compositeKey);
    if (entry && entry.expiresAt > Date.now()) return entry;
    this.entries.delete(context.compositeKey);
    return null;
  }

  async get(
    context: IdempotencyDecisionContext,
  ): Promise<IdempotencyStoredEntry | null> {
    return this.cached(context);
  }

  async set(
    context: IdempotencyDecisionContext,
    entry: IdempotencyStoredEntry,
  ): Promise<void> {
    if (
      !this.entries.has(context.compositeKey) &&
      this.entries.size >= DetranDurableIdempotencyBackend.MAX_ENTRIES
    ) {
      const oldest = this.entries.keys().next().value;
      if (oldest) this.entries.delete(oldest);
    }
    this.entries.set(context.compositeKey, entry);
  }

  async acquireLock(
    context: IdempotencyDecisionContext,
    token: string,
  ): Promise<boolean> {
    if (this.cached(context)) return false;
    if (this.locks.has(context.compositeKey)) return false;
    this.locks.set(context.compositeKey, token);
    return true;
  }

  async releaseLock(
    context: IdempotencyDecisionContext,
    token: string,
  ): Promise<void> {
    if (this.locks.get(context.compositeKey) === token)
      this.locks.delete(context.compositeKey);
  }

  async isLocked(context: IdempotencyDecisionContext): Promise<boolean> {
    return this.locks.has(context.compositeKey);
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
export const detranTenantMembershipVerifier =
  new DetranTenantMembershipVerifier(detranPipelineSqlExecutor);
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
      // A concurrent replay waits for the durable owner to publish its result.
      // Keep the wait bounded, but allow for slower database-backed CI runs.
      waitAttempts: 100,
      waitIntervalMs: 50,
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
