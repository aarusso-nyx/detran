// Camadas e finalidade (CTG-0002 §5 — [RN-DASH-170], [RN-DASH-171]; plan M17):
// teto por papel (`dashboardLayerFor`/`dashboardLayerAllows` de
// `@detran/shared`), N3 nunca, `X-Purpose` em toda leitura servida em N2
// (catálogo `dashboard.purposes_n2` via `OpsParameterService`, fallback
// H.54/OD-D08 — OD-D30), escopo de domínio (`domainScopeOf`, §5.3) e o
// registro de acesso em `dashboard.access_log` na mesma transação da leitura
// (§5.4.2 — consulta não registrada é inauditável). `open` é a primeira
// chamada de toda leitura; `record` a última.
import { Inject, Injectable } from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import {
  DETRAN_POLICY_MATRIX,
  DetranError,
  canonicalRoles,
  dashboardLayerAllows,
  dashboardLayerFor,
  getPrincipalFromRequest,
  type DashboardLayer,
  type RequestLike,
} from '@detran/shared';
import { OpsParameterService } from '@detran/ops-parameter';
import type { Clock } from '@detran/inf-deadlines';

import {
  DASHBOARD_CLOCK,
  dashboardParameterKey,
  type CycleContext,
} from '../cycle/index.js';
import type { DashboardSqlTransaction } from '../projection-contract.js';
import { cellThresholdOf } from './suppression.js';

/** Seis finalidades de H.54/OD-D08 (§5.4.1) — fallback enquanto o catálogo traz prosa (OD-D30). */
export const DASHBOARD_PURPOSES_N2_H54 = [
  'supervisao',
  'auditoria',
  'apuracao',
  'resposta-ao-titular',
  'estatistica',
  'suporte',
] as const;

export type DomainScope = 'all' | ReadonlySet<string>;

const LAYER_RANK: Readonly<Record<DashboardLayer, number>> = {
  N0: 0,
  N1: 1,
  N2: 2,
};

/** Escopo de domínio por papel (§5.3, transcrito). */
const DOMAIN_BY_ROLE: Readonly<Record<string, string>> = {
  'rait-manager': 'rait',
  'rait-coordinator': 'rait',
  'rait-chair': 'rait',
  'traffic-authority': 'teat',
  GESTOR: 'pec',
};
const TRANSVERSAL_ROLES: ReadonlySet<string> = new Set([
  'agency-admin',
  'GESTOR_DETRAN',
  'AUDITOR',
  'DPO',
]);

/** Dimensão de `comparisons` → app do recorte (§5.3). */
export const DOMAIN_BY_DIMENSION: Readonly<Record<string, string>> = {
  pool: 'rait',
  circuit: 'rait',
  clinic: 'pec',
  unit: 'teat',
};

/**
 * `domainScopeOf(roles)`: união dos escopos dos papéis canônicos
 * (semântica de união, ADR-0005); qualquer papel transversal ⇒ `'all'`;
 * papéis fora da tabela ⇒ conjunto vazio (nunca chegam a N2).
 */
export function domainScopeOf(roles: readonly string[]): DomainScope {
  const scope = new Set<string>();
  for (const role of canonicalRoles(roles)) {
    if (TRANSVERSAL_ROLES.has(role)) return 'all';
    const domain = DOMAIN_BY_ROLE[role];
    if (domain) scope.add(domain);
  }
  return scope;
}

export function domainAllowed(scope: DomainScope, app: string): boolean {
  return scope === 'all' || scope.has(app);
}

export function minLayer(a: DashboardLayer, b: DashboardLayer): DashboardLayer {
  return LAYER_RANK[a] <= LAYER_RANK[b] ? a : b;
}

export function layerAtLeast(
  layer: DashboardLayer,
  required: DashboardLayer,
): boolean {
  return LAYER_RANK[layer] >= LAYER_RANK[required];
}

/**
 * Procura `'N3'` em qualquer chave `layer`/`visibilityProfile` (em qualquer
 * profundidade) — a intenção N3 é recusada antes do enum (§5.4.3, §3.3).
 */
export function mentionsN3(value: unknown): boolean {
  if (value === 'N3') return true;
  if (Array.isArray(value)) return value.some(mentionsN3);
  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).some(
      ([key, child]) =>
        ((key === 'layer' || key === 'visibilityProfile') && child === 'N3') ||
        (typeof child === 'object' && child !== null && mentionsN3(child)),
    );
  }
  return false;
}

export function assertNotN3(value: unknown): void {
  if (mentionsN3(value)) {
    throw new DetranError('DASH.LAYER_N3_NEVER', { status: 403 });
  }
}

export interface LayerGateSpec {
  /** `<método> <rota sem prefixo>` (§2.2 `access_log.resource`), ex. `GET alerts`. */
  route: string;
  /** Chave de política da rota (`dashboard:<recurso>:<ação>`) — define o papel efetivo. */
  policy?: string;
  /** Camada mínima da rota/recorte (§5.2); abaixo → 403 `DASH.LAYER_FORBIDDEN`. */
  requiredLayer: DashboardLayer;
  /** Camada pedida explicitamente (`?layer=`); `'N3'` ou qualquer outro valor fora de N0–N2 é recusado. */
  requestedLayer?: string | undefined;
  /** Teto do recurso (ex. `alert.object_layer`): servida = `min(camada do papel, ceiling)`. */
  ceiling?: DashboardLayer | undefined;
  /** App do recorte — escopo de domínio quando servido em N2 (§5.3). */
  app?: string | undefined;
  /** Sufixo `#<código do indicador>` do recurso registrado. */
  indicator?: string | undefined;
  /** Filtros efetivos (`access_log.filters_json`), chaves ordenadas. */
  filters?: Record<string, unknown> | undefined;
  /** Finalidade já validada pelo chamador (corpo de `POST exports`/`generated-reports`) em vez do cabeçalho. */
  purpose?: string | null | undefined;
  /** Resposta de comando (§5.2: "na camada do papel"; "comando não é leitura N2"): sem `X-Purpose` nem escopo. */
  command?: boolean | undefined;
}

export interface LayerContext {
  route: string;
  servedLayer: DashboardLayer;
  roleLayer: DashboardLayer;
  purpose: string | null;
  domains: DomainScope;
  roles: readonly string[];
  userRef: string;
  userRole: string;
  filters: Record<string, unknown>;
  origin: string | null;
}

function headerOf(req: RequestLike, name: string): string | undefined {
  const value = req.headers?.[name];
  if (Array.isArray(value))
    return typeof value[0] === 'string' ? value[0] : undefined;
  return typeof value === 'string' ? value : undefined;
}

/** `X-Forwarded-For`/`remoteAddress` + `User-Agent`, truncado a 120 (§2.2 `origin`). */
function originOf(req: RequestLike): string | null {
  const forwarded = headerOf(req, 'x-forwarded-for');
  const address = forwarded?.split(',')[0]?.trim() || req.ip || '';
  const agent = headerOf(req, 'user-agent') ?? '';
  const origin = [address, agent].filter((part) => part.length > 0).join(' ');
  return origin.length > 0 ? origin.slice(0, 120) : null;
}

function sortedFilters(
  filters: Record<string, unknown> | undefined,
): Record<string, unknown> {
  if (!filters) return {};
  return Object.fromEntries(
    Object.keys(filters)
      .filter((key) => filters[key] !== undefined)
      .sort()
      .map((key) => [key, filters[key]]),
  );
}

@Injectable()
export class DashboardLayerGate {
  constructor(
    private readonly parameters: OpsParameterService,
    private readonly requestContext: RequestContext,
    @Inject(DASHBOARD_CLOCK) private readonly clock: Clock,
  ) {}

  /** Principal autenticado (STYNX) — sem principal não há leitura. */
  principalOf(req: RequestLike): { id: string; roles: readonly string[] } {
    const principal = getPrincipalFromRequest(req);
    if (!principal) {
      throw new DetranError('DASH.AUTH_REQUIRED', { status: 401 });
    }
    return { id: String(principal.id), roles: principal.roles ?? [] };
  }

  roleLayerOf(req: RequestLike): DashboardLayer {
    return dashboardLayerFor(this.principalOf(req).roles);
  }

  /**
   * Catálogo de finalidades (§5.4.1): `dashboard.purposes_n2` quando
   * `value_json` é um array de strings não vazias; senão os seis tokens H.54.
   */
  async purposes(): Promise<readonly string[]> {
    try {
      const parameter = await this.parameters.get(
        dashboardParameterKey('purposes_n2'),
      );
      const value: unknown = parameter.value_json;
      if (
        Array.isArray(value) &&
        value.length > 0 &&
        value.every((item) => typeof item === 'string' && item.length > 0)
      ) {
        return value as string[];
      }
    } catch {
      // parâmetro ausente: o fallback declarado (OD-D30)
    }
    return DASHBOARD_PURPOSES_N2_H54;
  }

  /**
   * §5.4.4 — ordem: N3 nunca → camada pedida ≤ teto do papel → camada servida
   * ≥ mínima da rota → (N2) `X-Purpose` do catálogo → (N2) escopo de domínio.
   */
  async open(
    _tx: DashboardSqlTransaction,
    req: RequestLike,
    spec: LayerGateSpec,
  ): Promise<LayerContext> {
    const principal = this.principalOf(req);
    const roles = principal.roles;
    const roleLayer = dashboardLayerFor(roles);
    let served: DashboardLayer;
    if (spec.requestedLayer !== undefined) {
      const requested = spec.requestedLayer;
      if (requested === 'N3') {
        throw new DetranError('DASH.LAYER_N3_NEVER', { status: 403 });
      }
      if (!isLayer(requested)) {
        throw new DetranError('DASH.ENUM_INVALID', {
          status: 400,
          context: { field: 'layer', allowed: ['N1', 'N2'] },
        });
      }
      if (!dashboardLayerAllows(roles, requested)) {
        throw new DetranError('DASH.LAYER_FORBIDDEN', {
          status: 403,
          context: { requiredLayer: requested, roles: canonicalRoles(roles) },
        });
      }
      served = requested;
    } else {
      served = minLayer(roleLayer, spec.ceiling ?? spec.requiredLayer);
    }
    if (!layerAtLeast(roleLayer, spec.requiredLayer)) {
      throw new DetranError('DASH.LAYER_FORBIDDEN', {
        status: 403,
        context: {
          requiredLayer: spec.requiredLayer,
          roles: canonicalRoles(roles),
        },
      });
    }
    if (!layerAtLeast(served, spec.requiredLayer)) served = spec.requiredLayer;

    let purpose: string | null = null;
    const domains = domainScopeOf(roles);
    if (served === 'N2' && !spec.command) {
      purpose = spec.purpose
        ? await this.validatePurpose(spec.purpose)
        : await this.purposeOf(req);
      if (spec.app !== undefined && !domainAllowed(domains, spec.app)) {
        throw new DetranError('DASH.DOMAIN_SCOPE_MISMATCH', {
          status: 403,
          context: { domain: spec.app },
        });
      }
    }
    return {
      route: spec.indicator ? `${spec.route}#${spec.indicator}` : spec.route,
      servedLayer: served,
      roleLayer,
      purpose,
      domains,
      roles,
      userRef: principal.id,
      userRole: effectiveRole(roles, spec.policy),
      filters: sortedFilters(spec.filters),
      origin: originOf(req),
    };
  }

  /**
   * Contexto do ciclo (§14.1 `CycleContext`) de uma requisição: tenant e
   * fuso (`auth.tenants`), ator `user` com o papel efetivo da rota, `now` do
   * relógio injetado e `requestId` como `correlationId`.
   */
  async context(
    tx: DashboardSqlTransaction,
    req: RequestLike,
    policy?: string,
  ): Promise<CycleContext> {
    const principal = this.principalOf(req);
    const snapshot = this.requestContext.snapshot();
    const tenantId = snapshot.tenantId ?? '';
    const tenant = await tenantInfoOf(tx, tenantId);
    return {
      tenantId,
      tz: tenant.timezone,
      actor: {
        kind: 'user',
        id: principal.id,
        role: effectiveRole(principal.roles, policy),
        roles: principal.roles,
      },
      now: this.clock.now(),
      requestId: snapshot.requestId,
    };
  }

  tenantId(): string {
    return this.requestContext.snapshot().tenantId ?? '';
  }

  now(): Date {
    return this.clock.now();
  }

  /** `X-Purpose` obrigatória e do catálogo (§5.4.1) — também usada pelo stream e pela exportação. */
  async purposeOf(req: RequestLike): Promise<string> {
    return this.validatePurpose(headerOf(req, 'x-purpose'));
  }

  async validatePurpose(raw: string | undefined): Promise<string> {
    const allowed = await this.purposes();
    const purpose = raw?.trim().toLowerCase();
    if (!purpose) {
      throw new DetranError('DASH.PURPOSE_REQUIRED', {
        status: 400,
        context: { allowed: [...allowed] },
      });
    }
    if (!allowed.includes(purpose)) {
      throw new DetranError('DASH.PURPOSE_INVALID', {
        status: 400,
        context: { allowed: [...allowed] },
      });
    }
    return purpose;
  }

  /**
   * §5.4.2 — uma linha em `dashboard.access_log` na mesma transação da
   * resposta; falha ⇒ 500 `DASH.INTERNAL` (a leitura não pode ser servida sem
   * registro). N3 nunca chega aqui (o check do banco também recusa).
   */
  async record(
    tx: DashboardSqlTransaction,
    ctx: LayerContext,
    rowCount: number,
    exportId?: string,
  ): Promise<void> {
    const tenantId = this.requestContext.snapshot().tenantId;
    try {
      await tx.query(
        `insert into dashboard.access_log
           (tenant_id, user_ref, user_role, at, resource, filters_json, layer, row_count, origin, purpose, export_id)
         values ($1, $2, $3, $4, $5, $6::jsonb, $7, $8, $9, $10, $11)`,
        [
          tenantId,
          ctx.userRef,
          ctx.userRole,
          this.clock.now().toISOString(),
          ctx.route,
          JSON.stringify(ctx.filters),
          ctx.servedLayer,
          Math.max(0, rowCount),
          ctx.origin,
          ctx.servedLayer === 'N2' ? ctx.purpose : (ctx.purpose ?? null),
          exportId ?? null,
        ],
      );
    } catch (error) {
      throw new DetranError('DASH.INTERNAL', {
        status: 500,
        context: { reason: 'access_log', route: ctx.route },
        cause: error,
      });
    }
  }
}

function isLayer(value: string): value is DashboardLayer {
  return value === 'N0' || value === 'N1' || value === 'N2';
}

/**
 * Papel efetivo (§2.2 `user_role`): entre os papéis canônicos, o que
 * concedeu a ação (presente na linha de `DETRAN_POLICY_MATRIX`) e, entre
 * esses, o de maior camada; sem política conhecida, o de maior camada.
 */
function effectiveRole(roles: readonly string[], policy?: string): string {
  const canonical = canonicalRoles(roles);
  const granting =
    policy && policy in DETRAN_POLICY_MATRIX
      ? canonical.filter((role) =>
          (
            DETRAN_POLICY_MATRIX[policy as keyof typeof DETRAN_POLICY_MATRIX] ??
            []
          ).includes(role),
        )
      : [];
  const candidates = granting.length > 0 ? granting : canonical;
  let chosen = candidates[0];
  if (!chosen) {
    throw new DetranError('DASH.FORBIDDEN_ACTION', {
      status: 403,
      context: { reason: 'no_canonical_role' },
    });
  }
  for (const role of candidates) {
    if (
      LAYER_RANK[dashboardLayerFor([role])] >
      LAYER_RANK[dashboardLayerFor([chosen])]
    ) {
      chosen = role;
    }
  }
  return chosen;
}

// ---------------------------------------------------------------------------
// helpers comuns da superfície (leituras de §3; §5.5; §9.4; §12)
// ---------------------------------------------------------------------------

/** Forma exata de `meta.freshness` (§5.5, route contract §1.3). */
export interface DashboardFreshnessMeta {
  state: 'FRESCO' | 'ATRASADO' | 'INDISPONIVEL' | 'DESATUALIZADO_MARCADO';
  asOf: string | null;
  acceptableLatency: number | null;
  source: string;
}

/** Resposta só de estado próprio (§5.5): `FRESCO`, `asOf = Clock.now()`, fonte `dashboard`. */
export function ownStateFreshness(now: Date): DashboardFreshnessMeta {
  return {
    state: 'FRESCO',
    asOf: now.toISOString(),
    acceptableLatency: null,
    source: 'dashboard',
  };
}

const FRESHNESS_ORDER: Readonly<
  Record<DashboardFreshnessMeta['state'], number>
> = { FRESCO: 0, ATRASADO: 1, DESATUALIZADO_MARCADO: 2, INDISPONIVEL: 3 };

/** Resposta que cruza várias fontes (§5.5): a pior; `asOf`/`acceptableLatency` mínimos; `source` da pior. */
export function worstFreshness(
  metas: readonly DashboardFreshnessMeta[],
  fallback: DashboardFreshnessMeta,
): DashboardFreshnessMeta {
  if (metas.length === 0) return fallback;
  let worst = metas[0]!;
  let asOf: string | null = worst.asOf;
  let latency: number | null = worst.acceptableLatency;
  for (const meta of metas.slice(1)) {
    if (FRESHNESS_ORDER[meta.state] > FRESHNESS_ORDER[worst.state])
      worst = meta;
    if (meta.asOf !== null && (asOf === null || meta.asOf < asOf))
      asOf = meta.asOf;
    if (
      meta.acceptableLatency !== null &&
      (latency === null || meta.acceptableLatency < latency)
    ) {
      latency = meta.acceptableLatency;
    }
  }
  return {
    state: worst.state,
    asOf,
    acceptableLatency: latency,
    source: worst.source,
  };
}

export interface TenantInfo {
  id: string;
  /** `short_name`, senão `name` (§9.4). */
  agency: string;
  timezone: string;
}

interface TenantRow extends Record<string, unknown> {
  id: string;
  name: string;
  short_name: string | null;
  timezone: string | null;
}

/** Órgão e fuso do tenant (`auth.tenants`; §9.4, §7.1). */
export async function tenantInfoOf(
  tx: DashboardSqlTransaction,
  tenantId: string,
): Promise<TenantInfo> {
  const result = await tx.query<TenantRow>(
    `select id, name, short_name, timezone from auth.tenants where id = $1`,
    [tenantId],
  );
  const row = result.rows[0];
  if (!row) {
    throw new DetranError('DASH.TENANT_MISMATCH', {
      status: 404,
      context: { tenantId },
    });
  }
  return {
    id: row.id,
    agency: row.short_name ?? row.name,
    timezone: row.timezone ?? 'UTC',
  };
}

/** `dashboard.cell_threshold` (§1.3.7) → 422 `DASH.CELL_THRESHOLD_UNDEFINED` (`parameterKey`). */
export async function readCellThreshold(
  parameters: OpsParameterService,
): Promise<number> {
  const key = dashboardParameterKey('cell_threshold');
  let parameter: { key: string; value_json?: unknown };
  try {
    parameter = await parameters.get(key);
  } catch (error) {
    throw new DetranError('DASH.CELL_THRESHOLD_UNDEFINED', {
      status: 422,
      context: { parameterKey: key },
      cause: error,
    });
  }
  return cellThresholdOf({ key, value_json: parameter.value_json });
}

/** Paginação em memória de uma lista já filtrada (`page`, `pageSize ≤ 200`, `total`). */
export function paginate<T>(
  items: readonly T[],
  page: { page: number; pageSize: number; offset: number },
): { items: T[]; page: number; pageSize: number; total: number } {
  return {
    items: items.slice(page.offset, page.offset + page.pageSize),
    page: page.page,
    pageSize: page.pageSize,
    total: items.length,
  };
}

/** `Record<string, unknown>` → só valores primitivos (`data` de evento, §12). */
export function isoOrNull(value: unknown): string | null {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string' && value.length > 0) {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? value : parsed.toISOString();
  }
  return null;
}

export function dateOnlyOrNull(value: unknown): string | null {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === 'string' && value.length >= 10)
    return value.slice(0, 10);
  return null;
}

// ---------------------------------------------------------------------------
// parse zod → erros do catálogo (§3: `.strict()` → VALIDATION_FAILED; enum → ENUM_INVALID)
// ---------------------------------------------------------------------------

export interface FieldErrorRule {
  code: string;
  status: number;
  context?: Record<string, unknown>;
}

interface ZodIssueLike {
  code: string;
  path: readonly PropertyKey[];
  values?: readonly unknown[];
  keys?: readonly string[];
  message?: string;
}

interface ZodSchemaLike<T> {
  safeParse(
    input: unknown,
  ):
    | { success: true; data: T }
    | { success: false; error: { issues: ZodIssueLike[] } };
}

/**
 * `safeParse` com tradução: chave desconhecida ou forma → 400
 * `DASH.VALIDATION_FAILED` (`field`); enum fora do conjunto → 400
 * `DASH.ENUM_INVALID` (`field`, `allowed[]`); `fieldRules` sobrepõe o código
 * de um campo (ex. `reportType` → `DASH.REPORT_TYPE_INVALID`).
 */
export function parseWith<T>(
  schema: ZodSchemaLike<T>,
  input: unknown,
  fieldRules: Readonly<Record<string, FieldErrorRule>> = {},
): T {
  const result = schema.safeParse(input ?? {});
  if (result.success) return result.data;
  const issue = result.error.issues[0];
  const field = issue ? issue.path.map(String).join('.') : '';
  const rule = fieldRules[field];
  if (rule) {
    throw new DetranError(rule.code, {
      status: rule.status,
      context: { field, ...(rule.context ?? {}) },
    });
  }
  if (issue?.code === 'invalid_value' && Array.isArray(issue.values)) {
    throw new DetranError('DASH.ENUM_INVALID', {
      status: 400,
      context: { field, allowed: [...issue.values] },
    });
  }
  throw new DetranError('DASH.VALIDATION_FAILED', {
    status: 400,
    context: {
      field:
        issue?.code === 'unrecognized_keys'
          ? (issue.keys ?? []).join(',')
          : field,
      reason: issue?.code ?? 'invalid',
    },
  });
}

/** Forma mínima da resposta para status e cabeçalhos (padrão `manifestations.controller.ts`). */
export interface ResponseLike {
  setHeader(name: string, value: string): unknown;
  status(code: number): unknown;
}

export function headerValue(
  value: string | string[] | undefined,
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
