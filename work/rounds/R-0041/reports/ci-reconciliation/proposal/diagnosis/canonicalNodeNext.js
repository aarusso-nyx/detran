"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardStreamService = exports.DASHBOARD_STREAM_POLLER = exports.MAX_FRAME_BYTES = exports.MAX_CONNECTIONS_PER_USER = exports.REPLAY_WINDOW_MS = exports.DASHBOARD_STREAM_TOPICS = exports.DASHBOARD_STREAM_EVENT_BY_TOPIC = exports.DASHBOARD_STREAM_TYPES = void 0;
exports.eventsOf = eventsOf;
exports.reshape = reshape;
exports.frameOf = frameOf;
exports.effectiveStreamRole = effectiveStreamRole;
// CTG-0002 §11 (R-0011, TASK-0013; plan M23) — leitura de `integration.outbox`
// para o SSE `GET /v1/dashboard/stream`, no padrão de `portal-stream.service.ts`.
// Sem escrita de domínio: o stream só reemite o que o ciclo/superfície já
// gravaram na mesma transação do efeito; a única escrita é o `access_log` da
// abertura em N2 com `X-Purpose` (§11, [RN-DASH-171]). O filtro por camada e
// por escopo de domínio (§5.3) é aplicado NO SQL de `listSince` — nunca em
// memória — e `data` de um evento N2 é redigido (`objectRef: null`) quando a
// camada do papel é N2 mas não houve `X-Purpose` no handshake. Os `topic`
// técnicos são montados por concatenação (§1.3.8, A14).
const common_1 = require("@nestjs/common");
const core_1 = require("@stynx-nyx/core");
const data_1 = require("@stynx-nyx/data");
const shared_1 = require("@detran/shared");
const ops_parameter_1 = require("@detran/ops-parameter");
const dashboard_monitor_1 = require("@detran/dashboard-monitor");
function asQueryable(tx) {
    return tx;
}
/** Tipos SSE do DASHBOARD (§11). */
exports.DASHBOARD_STREAM_TYPES = [
    'alert.changed',
    'alert.escalated',
    'duty.changed',
    'source.freshness',
    'integration.health',
];
/** `topic` técnico do produtor → evento SSE base (§11); `alert.escalated` e `integration.health` derivam por `data`. */
exports.DASHBOARD_STREAM_EVENT_BY_TOPIC = {
    [dashboard_monitor_1.DASHBOARD_EVENT_TYPES.alertChanged]: 'alert.changed',
    [dashboard_monitor_1.DASHBOARD_EVENT_TYPES.dutyChanged]: 'duty.changed',
    [dashboard_monitor_1.DASHBOARD_EVENT_TYPES.sourceFreshness]: 'source.freshness',
};
exports.DASHBOARD_STREAM_TOPICS = Object.keys(exports.DASHBOARD_STREAM_EVENT_BY_TOPIC);
/** `integration.health` (OD-D54): frescor de `teat`/adapter ou da fonte `teat.offline-sync`. */
const INTEGRATION_HEALTH_APPS = new Set([
    'teat',
    'senatran-adapter',
]);
const INTEGRATION_HEALTH_SOURCE_KEY = ['teat', 'offline-sync'].join('.');
/** Janela de replay do `Last-Event-ID` (§11). */
exports.REPLAY_WINDOW_MS = 24 * 60 * 60 * 1000;
/** Conexões simultâneas por usuário (§11). */
exports.MAX_CONNECTIONS_PER_USER = 5;
/** Payload máximo de um frame (§11): evento maior é omitido com `: dropped <id>`. */
exports.MAX_FRAME_BYTES = 8 * 1024;
/** Porta do poller (mesma de `teat-stream.service.ts`); token próprio do DASHBOARD (A20 a). */
exports.DASHBOARD_STREAM_POLLER = Symbol('DASHBOARD_STREAM_POLLER');
function dataOf(payload) {
    const data = payload.data;
    return typeof data === 'object' && data !== null && !Array.isArray(data)
        ? data
        : {};
}
/** Eventos SSE que uma linha produz (§11 tabela): um `topic` pode render dois frames. */
function eventsOf(row) {
    const base = exports.DASHBOARD_STREAM_EVENT_BY_TOPIC[row.topic];
    if (!base)
        return [];
    const data = dataOf(row.payload);
    if (base === 'alert.changed') {
        return row.payload.domainEvent === 'ALERTA_ESCALONADO'
            ? ['alert.escalated']
            : ['alert.changed'];
    }
    if (base === 'source.freshness') {
        const app = typeof data.app === 'string' ? data.app : '';
        const sourceKey = typeof data.sourceKey === 'string' ? data.sourceKey : '';
        return INTEGRATION_HEALTH_APPS.has(app) ||
            sourceKey === INTEGRATION_HEALTH_SOURCE_KEY
            ? ['source.freshness', 'integration.health']
            : ['source.freshness'];
    }
    return [base];
}
/**
 * `data` do frame: o `data` do envelope (§12 — só ids, tokens e datas), com
 * `objectRef` redigido quando o evento é N2 e o handshake não trouxe
 * `X-Purpose`. `tenantId` nunca sai (rait-events-sse-contract §1).
 */
function reshape(payload, scope) {
    const data = { ...dataOf(payload) };
    if ('tenantId' in data)
        delete data.tenantId;
    if (data.objectLayer === 'N2' && (scope.layer !== 'N2' || !scope.purpose)) {
        data.objectRef = null;
    }
    return data;
}
/** Frame SSE (§11 formato); `null` quando excede `MAX_FRAME_BYTES`. */
function frameOf(row, event, scope) {
    const body = JSON.stringify({
        aggregate: row.payload.aggregate,
        domainEvent: row.payload.domainEvent,
        data: reshape(row.payload, scope),
    });
    if (Buffer.byteLength(body, 'utf8') > exports.MAX_FRAME_BYTES)
        return null;
    return [`id: ${row.id}`, `event: ${event}`, `data: ${body}`, '', ''].join('\n');
}
/** Papel efetivo do handshake (§2.2): o canônico que concede `dashboard:alert:read` com a maior camada. */
function effectiveStreamRole(roles) {
    const key = 'dashboard:alert:read';
    const granting = (0, shared_1.canonicalRoles)(roles).filter((role) => (shared_1.DETRAN_POLICY_MATRIX[key] ?? []).includes(role));
    const candidates = granting.length > 0 ? granting : (0, shared_1.canonicalRoles)(roles);
    const rank = {
        N0: 0,
        N1: 1,
        N2: 2,
    };
    let chosen = candidates[0] ?? roles[0] ?? '';
    for (const role of candidates) {
        if (rank[(0, shared_1.dashboardLayerFor)([role])] > rank[(0, shared_1.dashboardLayerFor)([chosen])]) {
            chosen = role;
        }
    }
    return chosen;
}
let DashboardStreamService = class DashboardStreamService {
    database;
    requestContext;
    parameters;
    clock;
    connections = new Map();
    constructor(database, requestContext, parameters, clock) {
        this.database = database;
        this.requestContext = requestContext;
        this.parameters = parameters;
        this.clock = clock;
    }
    /** Limite de conexões por usuário (§11): contagem em memória, liberada no `close`. */
    acquire(principalId) {
        const current = this.connections.get(principalId) ?? 0;
        if (current >= exports.MAX_CONNECTIONS_PER_USER)
            return false;
        this.connections.set(principalId, current + 1);
        return true;
    }
    release(principalId) {
        const current = this.connections.get(principalId) ?? 0;
        if (current <= 1)
            this.connections.delete(principalId);
        else
            this.connections.set(principalId, current - 1);
    }
    /** Catálogo de finalidades (§5.4.1) — o mesmo fallback do `DashboardLayerGate` (OD-D30). */
    async purposes() {
        try {
            const parameter = await this.parameters.get((0, dashboard_monitor_1.dashboardParameterKey)('purposes_n2'));
            const value = parameter.value_json;
            if (Array.isArray(value) &&
                value.length > 0 &&
                value.every((item) => typeof item === 'string' && item.length > 0)) {
                return value;
            }
        }
        catch {
            // parâmetro ausente: fallback declarado
        }
        return dashboard_monitor_1.DASHBOARD_PURPOSES_N2_H54;
    }
    async validatePurpose(raw) {
        const allowed = await this.purposes();
        const purpose = raw?.trim().toLowerCase();
        if (!purpose) {
            throw new shared_1.DetranError('DASH.PURPOSE_REQUIRED', {
                status: 400,
                context: { allowed: [...allowed] },
            });
        }
        if (!allowed.includes(purpose)) {
            throw new shared_1.DetranError('DASH.PURPOSE_INVALID', {
                status: 400,
                context: { allowed: [...allowed] },
            });
        }
        return purpose;
    }
    /** `access_log` da abertura em N2 com finalidade (§11): `resource = 'GET stream'`, `row_count = 0`. */
    async recordHandshake(input) {
        await (0, shared_1.withTenantContext)(this.database, this.requestContext, async (tx) => {
            await asQueryable(tx).query(`insert into dashboard.access_log
           (tenant_id, user_ref, user_role, at, resource, filters_json, layer, row_count, origin, purpose)
         values ($1, $2, $3, $8, $4, $5::jsonb, 'N2', 0, $6, $7)`, [
                this.requestContext.snapshot().tenantId,
                input.userRef,
                input.userRole,
                'GET stream',
                JSON.stringify({ topics: [...input.topics].sort() }),
                input.origin,
                input.purpose,
                this.clock.now().toISOString(),
            ]);
        });
    }
    /** `now()` do servidor de banco — marco inicial de uma conexão sem `Last-Event-ID`. */
    async now() {
        return (0, shared_1.withTenantContext)(this.database, this.requestContext, async (tx) => {
            const result = await asQueryable(tx).query('select now()::text as now');
            return result.rows[0].now;
        });
    }
    /** Linha do `Last-Event-ID` com a idade medida pelo relógio do banco (nunca o do processo). */
    async findById(id) {
        return (0, shared_1.withTenantContext)(this.database, this.requestContext, async (tx) => {
            const result = await asQueryable(tx).query(`select id, created_at::text as created_at, topic, payload,
                (extract(epoch from (now() - created_at)) * 1000)::text as age_ms
           from integration.outbox
          where id = $1::uuid`, [id]);
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
        return (0, shared_1.withTenantContext)(this.database, this.requestContext, async (tx) => {
            const tenantId = this.requestContext.snapshot().tenantId;
            const cursorClause = cursor.id
                ? '(o.created_at, o.id) > ($3::timestamptz, $4::uuid)'
                : 'o.created_at > $3::timestamptz';
            const values = [
                tenantId,
                exports.DASHBOARD_STREAM_TOPICS,
                cursor.createdAt,
            ];
            if (cursor.id)
                values.push(cursor.id);
            const layerIndex = values.push(scope.layer);
            const allIndex = values.push(scope.domains === 'all' ? 'all' : 'scoped');
            const appsIndex = values.push(scope.domains === 'all' ? [] : [...scope.domains]);
            const limitIndex = values.push(limit);
            const result = await asQueryable(tx).query(`select o.id, o.created_at::text as created_at, o.topic, o.payload
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
          limit $${limitIndex}`, values);
            return result.rows;
        });
    }
};
exports.DashboardStreamService = DashboardStreamService;
exports.DashboardStreamService = DashboardStreamService = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, common_1.Inject)(dashboard_monitor_1.DASHBOARD_CLOCK)),
    __metadata("design:paramtypes", [typeof (_a = typeof data_1.Database !== "undefined" && data_1.Database) === "function" ? _a : Object, typeof (_b = typeof core_1.RequestContext !== "undefined" && core_1.RequestContext) === "function" ? _b : Object, typeof (_c = typeof ops_parameter_1.OpsParameterService !== "undefined" && ops_parameter_1.OpsParameterService) === "function" ? _c : Object, Object])
], DashboardStreamService);
//# sourceMappingURL=dashboard-stream.service.js.map