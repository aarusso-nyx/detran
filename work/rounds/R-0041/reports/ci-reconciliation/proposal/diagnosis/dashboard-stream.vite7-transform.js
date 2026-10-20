var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { Inject, Injectable } from "@nestjs/common";
import {
  DETRAN_POLICY_MATRIX,
  DetranError,
  canonicalRoles,
  dashboardLayerFor,
  withTenantContext
} from "@detran/shared";
import {
  DASHBOARD_CLOCK,
  DASHBOARD_EVENT_TYPES,
  DASHBOARD_PURPOSES_N2_H54,
  dashboardParameterKey
} from "@detran/dashboard-monitor";
function asQueryable(tx) {
  return tx;
}
export const DASHBOARD_STREAM_TYPES = [
  "alert.changed",
  "alert.escalated",
  "duty.changed",
  "source.freshness",
  "integration.health"
];
export const DASHBOARD_STREAM_EVENT_BY_TOPIC = {
  [DASHBOARD_EVENT_TYPES.alertChanged]: "alert.changed",
  [DASHBOARD_EVENT_TYPES.dutyChanged]: "duty.changed",
  [DASHBOARD_EVENT_TYPES.sourceFreshness]: "source.freshness"
};
export const DASHBOARD_STREAM_TOPICS = Object.keys(
  DASHBOARD_STREAM_EVENT_BY_TOPIC
);
const INTEGRATION_HEALTH_APPS = /* @__PURE__ */ new Set([
  "teat",
  "senatran-adapter"
]);
const INTEGRATION_HEALTH_SOURCE_KEY = ["teat", "offline-sync"].join(".");
export const REPLAY_WINDOW_MS = 24 * 60 * 60 * 1e3;
export const MAX_CONNECTIONS_PER_USER = 5;
export const MAX_FRAME_BYTES = 8 * 1024;
export const DASHBOARD_STREAM_POLLER = /* @__PURE__ */ Symbol("DASHBOARD_STREAM_POLLER");
function dataOf(payload) {
  const data = payload.data;
  return typeof data === "object" && data !== null && !Array.isArray(data) ? data : {};
}
export function eventsOf(row) {
  const base = DASHBOARD_STREAM_EVENT_BY_TOPIC[row.topic];
  if (!base) return [];
  const data = dataOf(row.payload);
  if (base === "alert.changed") {
    return row.payload.domainEvent === "ALERTA_ESCALONADO" ? ["alert.escalated"] : ["alert.changed"];
  }
  if (base === "source.freshness") {
    const app = typeof data.app === "string" ? data.app : "";
    const sourceKey = typeof data.sourceKey === "string" ? data.sourceKey : "";
    return INTEGRATION_HEALTH_APPS.has(app) || sourceKey === INTEGRATION_HEALTH_SOURCE_KEY ? ["source.freshness", "integration.health"] : ["source.freshness"];
  }
  return [base];
}
export function reshape(payload, scope) {
  const data = { ...dataOf(payload) };
  if ("tenantId" in data) delete data.tenantId;
  if (data.objectLayer === "N2" && (scope.layer !== "N2" || !scope.purpose)) {
    data.objectRef = null;
  }
  return data;
}
export function frameOf(row, event, scope) {
  const body = JSON.stringify({
    aggregate: row.payload.aggregate,
    domainEvent: row.payload.domainEvent,
    data: reshape(row.payload, scope)
  });
  if (Buffer.byteLength(body, "utf8") > MAX_FRAME_BYTES) return null;
  return [`id: ${row.id}`, `event: ${event}`, `data: ${body}`, "", ""].join(
    "\n"
  );
}
export function effectiveStreamRole(roles) {
  const key = "dashboard:alert:read";
  const granting = canonicalRoles(roles).filter(
    (role) => (DETRAN_POLICY_MATRIX[key] ?? []).includes(role)
  );
  const candidates = granting.length > 0 ? granting : canonicalRoles(roles);
  const rank = {
    N0: 0,
    N1: 1,
    N2: 2
  };
  let chosen = candidates[0] ?? roles[0] ?? "";
  for (const role of candidates) {
    if (rank[dashboardLayerFor([role])] > rank[dashboardLayerFor([chosen])]) {
      chosen = role;
    }
  }
  return chosen;
}
export let DashboardStreamService = class {
  constructor(database, requestContext, parameters, clock) {
    this.database = database;
    this.requestContext = requestContext;
    this.parameters = parameters;
    this.clock = clock;
  }
  database;
  requestContext;
  parameters;
  clock;
  connections = /* @__PURE__ */ new Map();
  /** Limite de conexões por usuário (§11): contagem em memória, liberada no `close`. */
  acquire(principalId) {
    const current = this.connections.get(principalId) ?? 0;
    if (current >= MAX_CONNECTIONS_PER_USER) return false;
    this.connections.set(principalId, current + 1);
    return true;
  }
  release(principalId) {
    const current = this.connections.get(principalId) ?? 0;
    if (current <= 1) this.connections.delete(principalId);
    else this.connections.set(principalId, current - 1);
  }
  /** Catálogo de finalidades (§5.4.1) — o mesmo fallback do `DashboardLayerGate` (OD-D30). */
  async purposes() {
    try {
      const parameter = await this.parameters.get(
        dashboardParameterKey("purposes_n2")
      );
      const value = parameter.value_json;
      if (Array.isArray(value) && value.length > 0 && value.every((item) => typeof item === "string" && item.length > 0)) {
        return value;
      }
    } catch {
    }
    return DASHBOARD_PURPOSES_N2_H54;
  }
  async validatePurpose(raw) {
    const allowed = await this.purposes();
    const purpose = raw?.trim().toLowerCase();
    if (!purpose) {
      throw new DetranError("DASH.PURPOSE_REQUIRED", {
        status: 400,
        context: { allowed: [...allowed] }
      });
    }
    if (!allowed.includes(purpose)) {
      throw new DetranError("DASH.PURPOSE_INVALID", {
        status: 400,
        context: { allowed: [...allowed] }
      });
    }
    return purpose;
  }
  /** `access_log` da abertura em N2 com finalidade (§11): `resource = 'GET stream'`, `row_count = 0`. */
  async recordHandshake(input) {
    await withTenantContext(this.database, this.requestContext, async (tx) => {
      await asQueryable(tx).query(
        `insert into dashboard.access_log
           (tenant_id, user_ref, user_role, at, resource, filters_json, layer, row_count, origin, purpose)
         values ($1, $2, $3, $8, $4, $5::jsonb, 'N2', 0, $6, $7)`,
        [
          this.requestContext.snapshot().tenantId,
          input.userRef,
          input.userRole,
          "GET stream",
          JSON.stringify({ topics: [...input.topics].sort() }),
          input.origin,
          input.purpose,
          this.clock.now().toISOString()
        ]
      );
    });
  }
  /** `now()` do servidor de banco — marco inicial de uma conexão sem `Last-Event-ID`. */
  async now() {
    return withTenantContext(this.database, this.requestContext, async (tx) => {
      const result = await asQueryable(tx).query(
        "select now()::text as now"
      );
      return result.rows[0].now;
    });
  }
  /** Linha do `Last-Event-ID` com a idade medida pelo relógio do banco (nunca o do processo). */
  async findById(id) {
    return withTenantContext(this.database, this.requestContext, async (tx) => {
      const result = await asQueryable(tx).query(
        `select id, created_at::text as created_at, topic, payload,
                (extract(epoch from (now() - created_at)) * 1000)::text as age_ms
           from integration.outbox
          where id = $1::uuid`,
        [id]
      );
      return result.rows[0];
    });
  }
  /**
   * Linhas do tenant posteriores a `cursor`, dos `topic` do DASHBOARD, na
   * camada do papel e no seu escopo de domínio (§11: filtro NO SQL —
   * `objectLayer` ≤ camada, e evento N2 só de `sourceApp` no escopo), em
   * ordem `(created_at, id)` — uma consulta por tick.
   */
  async listSince(cursor, scope, limit = 200) {
    return withTenantContext(this.database, this.requestContext, async (tx) => {
      const tenantId = this.requestContext.snapshot().tenantId;
      const cursorClause = cursor.id ? "(o.created_at, o.id) > ($3::timestamptz, $4::uuid)" : "o.created_at > $3::timestamptz";
      const values = [
        tenantId,
        DASHBOARD_STREAM_TOPICS,
        cursor.createdAt
      ];
      if (cursor.id) values.push(cursor.id);
      const layerIndex = values.push(scope.layer);
      const allIndex = values.push(scope.domains === "all" ? "all" : "scoped");
      const appsIndex = values.push(
        scope.domains === "all" ? [] : [...scope.domains]
      );
      const limitIndex = values.push(limit);
      const result = await asQueryable(tx).query(
        `select o.id, o.created_at::text as created_at, o.topic, o.payload
           from integration.outbox o
          where o.tenant_id = $1
            and o.topic = any($2::text[])
            and ${cursorClause}
            and (o.payload->'data'->>'objectLayer' is null
                 or o.payload->'data'->>'objectLayer' <= $${layerIndex})
            and (o.payload->'data'->>'objectLayer' is distinct from 'N2'
                 or $${allIndex} = 'all'
                 or o.payload->'data'->>'sourceApp' is null
                 or o.payload->'data'->>'sourceApp' = any($${appsIndex}::text[]))
          order by o.created_at, o.id
          limit $${limitIndex}`,
        values
      );
      return result.rows;
    });
  }
};
DashboardStreamService = __decorateClass([
  Injectable(),
  __decorateParam(3, Inject(DASHBOARD_CLOCK))
], DashboardStreamService);
