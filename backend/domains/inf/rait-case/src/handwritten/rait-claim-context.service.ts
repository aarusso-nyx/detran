import { createHmac, randomBytes } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { DetranError } from '@detran/shared';
import type { RaitRiskSnapshot } from '@detran/inf-deadlines';
import {
  RaitCaseScopeService,
  type RaitScopePrincipal,
} from './rait-case-scope.service.js';
import { RaitCaseRiskService } from './rait-case-risk.service.js';
import { RaitLegacyQualificationService } from './rait-legacy-qualification.service.js';
import {
  raitCanonical,
  raitLockRiskRelations,
  raitLockRiskParents,
  raitRevision,
  type RaitRiskTx,
  type RaitOperationClockSnapshot,
} from './rait-risk.port.js';
type Row = Record<string, unknown>;
export type RaitClaimCandidate = Row & {
  id: string;
  version: number;
  state: string;
  instance: string;
  tenant_id: string;
  risk: RaitRiskSnapshot;
  sourceVersions: readonly string[];
};
const invalid = (): never => {
  throw new DetranError('RAIT.VALIDATION_FAILED', { status: 400 });
};
const missing = (): never => {
  throw new DetranError('RAIT.TENANT_MISMATCH', { status: 404 });
};
const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;
const severity = [
  'SEM_RISCO',
  'ALERTA_N1',
  'ALERTA_N2',
  'ALERTA_N3',
  'CRITICO',
  'PRESCRITO_OPERACIONAL',
];
@Injectable()
export class RaitClaimContextService {
  private readonly cursorKey = randomBytes(32);
  constructor(
    private readonly scope: RaitCaseScopeService,
    private readonly risk: RaitCaseRiskService,
    private readonly legacy: RaitLegacyQualificationService,
  ) {}
  async pools(
    tx: RaitRiskTx,
    principal: RaitScopePrincipal | undefined,
    captured?: RaitOperationClockSnapshot,
  ) {
    const who = await this.scope.authenticate(tx, principal);
    if (!principal?.roles.includes('rait-analyst'))
      throw new DetranError('RAIT.FORBIDDEN_ACTION', { status: 403 });
    const operation = captured ?? (await this.risk.operation(tx, who.tenantId));
    const rows = (
      await tx.query<Row>(
        `select p.id,p.name,p.instance,p.unit_id from inf.rait_pool p where p.tenant_id=$1 and p.active and p.strategy='pull' and p.instance='defesa_previa' and exists(select 1 from inf.rait_pool_member m where m.tenant_id=p.tenant_id and m.pool_id=p.id and m.person_id=$2 and m.member_role='analista' and m.status='ATIVO' and (m.mandate_starts_on is null or m.mandate_starts_on<=$3::date) and (m.mandate_ends_on is null or m.mandate_ends_on>=$3::date)) order by p.id`,
        [who.tenantId, who.actorId, operation.today(operation.tenantTz)],
      )
    ).rows;
    return { who, rows, operation };
  }
  private async universe(
    tx: RaitRiskTx,
    tenantId: string,
    actorId: string,
    poolId: string,
    operation: RaitOperationClockSnapshot,
    lockInitial: boolean,
  ) {
    // One READ COMMITTED statement snapshot for the whole selector, including
    // actual routing inventories. The final fence never takes new parent locks.
    const result = (
      await tx.query<{
        pools: Row[];
        members: Row[];
        cases: (Row & {
          id: string;
          version: number;
          state: string;
          instance: string;
          tenant_id: string;
        })[];
      }>(
        `with eligible_pool as materialized (
        select p.* from inf.rait_pool p
        where p.tenant_id=$1 and p.id=$3 and p.active and p.strategy='pull' and p.instance='defesa_previa'
      ), eligible_member as materialized (
        select m.* from inf.rait_pool_member m join eligible_pool p on p.id=m.pool_id
        where m.tenant_id=$1 and m.person_id=$2 and m.member_role='analista' and m.status='ATIVO'
          and (m.mandate_starts_on is null or m.mandate_starts_on<=$4::date)
          and (m.mandate_ends_on is null or m.mandate_ends_on>=$4::date)
      ), potential as materialized (
        select c.*,to_char(c.protocolled_at at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"') as selector_protocolled_at
        from inf.rait_case c join eligible_pool p on c.instance=p.instance and c.unit_id is not distinct from p.unit_id
        where c.tenant_id=$1 and c.state in ('ADMITIDO','DISTRIBUIDO') and c.legal_priority is not null
          and exists(select 1 from eligible_member)
          and not exists(select 1 from inf.rait_assignment a where a.tenant_id=c.tenant_id and a.case_id=c.id and a.active)
          and not exists(select 1 from inf.rait_impediment i join eligible_member m on i.member_id=m.id where i.tenant_id=c.tenant_id and i.case_id=c.id)
        order by c.id ${lockInitial ? 'for update of c' : ''}
      )
      select
        coalesce((select jsonb_agg(to_jsonb(p) order by p.id) from eligible_pool p),'[]'::jsonb) as pools,
        coalesce((select jsonb_agg(to_jsonb(m) order by m.id) from eligible_member m),'[]'::jsonb) as members,
        coalesce((select jsonb_agg(
          (to_jsonb(c)-'selector_protocolled_at') || jsonb_build_object(
            'protocolled_at',c.selector_protocolled_at,
            'selector_routes',coalesce((select jsonb_agg(to_jsonb(s) order by s.id) from inf.rait_case_pool_scope s where s.tenant_id=$1 and s.case_id=c.id and s.active and btrim(s.authorization_ref)<>'' and btrim(s.source_ref)<>''),'[]'::jsonb),
            'selector_batches',coalesce((select jsonb_agg(jsonb_build_object('item',to_jsonb(i),'batch',to_jsonb(b)) order by b.id,i.id) from inf.rait_batch_item i join inf.rait_batch b on b.tenant_id=i.tenant_id and b.id=i.batch_id where i.tenant_id=$1 and i.case_id=c.id and b.state='LOTE_ACEITO'),'[]'::jsonb)
          ) order by c.id) from potential c),'[]'::jsonb) as cases`,
        [tenantId, actorId, poolId, operation.today(operation.tenantTz)],
      )
    ).rows[0];
    if (!result)
      throw new DetranError('RAIT.RISK_SOURCE_UNAVAILABLE', { status: 503 });
    return result;
  }
  async candidates(
    tx: RaitRiskTx,
    tenantId: string,
    actorId: string,
    poolId: string,
    operation: RaitOperationClockSnapshot,
    _lock = false,
  ): Promise<RaitClaimCandidate[]> {
    const frozen = await this.universe(
      tx,
      tenantId,
      actorId,
      poolId,
      operation,
      true,
    );
    if (frozen.pools.length !== 1 || frozen.members.length !== 1)
      return missing();
    const potential = frozen.cases;
    await raitLockRiskParents(
      tx,
      tenantId,
      potential.map((item) => item.id),
    );
    const qualified: RaitClaimCandidate[] = [];
    for (const item of potential) {
      const routes = (
        await tx.query<Row>(
          "select id,pool_id from inf.rait_case_pool_scope where tenant_id=$1 and case_id=$2 and active and btrim(authorization_ref)<>'' and btrim(source_ref)<>'' order by id for share",
          [tenantId, item.id],
        )
      ).rows;
      const batches = (
        await tx.query<Row>(
          "select b.pool_id from inf.rait_batch_item i join inf.rait_batch b on b.tenant_id=i.tenant_id and b.id=i.batch_id where i.tenant_id=$1 and i.case_id=$2 and b.state='LOTE_ACEITO' order by b.id,i.id for share of b,i",
          [tenantId, item.id],
        )
      ).rows;
      const poolIds = new Set(
        [...routes, ...batches].map((r) => String(r.pool_id)),
      );
      if (poolIds.size !== 1)
        throw new DetranError('RAIT.CASE_POOL_UNRESOLVED', { status: 409 });
      if (!poolIds.has(poolId)) continue;
      let legacyVersions: readonly string[] = [];
      if (item.state === 'DISTRIBUIDO') {
        const legacy = await this.legacy.resolve(tx, tenantId, item, poolId);
        if (legacy.classification !== 'qualified_unassigned') continue;
        legacyVersions = legacy.sourceVersions;
      }
      const risk = await this.risk.snapshot(tx, tenantId, item.id, operation);
      if (risk.worstFlag === null)
        throw new DetranError('RAIT.RISK_SOURCE_UNAVAILABLE', { status: 503 });
      qualified.push({
        ...item,
        risk,
        sourceVersions: [
          ...new Set([...legacyVersions, ...risk.sourceVersions]),
        ].sort(),
      });
    }
    const current = await this.universe(
      tx,
      tenantId,
      actorId,
      poolId,
      operation,
      false,
    );
    if (raitCanonical(current) !== raitCanonical(frozen)) {
      throw new DetranError('RAIT.RISK_SOURCE_UNAVAILABLE', { status: 503 });
    }
    return qualified.sort(
      (a, b) =>
        severity.indexOf(b.risk.worstFlag!) -
          severity.indexOf(a.risk.worstFlag!) ||
        ({ level_2: 2, level_1: 1 }[String(b.legal_priority)] ?? 0) -
          ({ level_2: 2, level_1: 1 }[String(a.legal_priority)] ?? 0) ||
        (a.protocolled_at === null
          ? b.protocolled_at === null
            ? 0
            : 1
          : b.protocolled_at === null
            ? -1
            : String(a.protocolled_at) < String(b.protocolled_at)
              ? -1
              : String(a.protocolled_at) > String(b.protocolled_at)
                ? 1
                : 0) ||
        (a.id < b.id ? -1 : a.id > b.id ? 1 : 0),
    );
  }
  private page<T>(items: T[], limit: number, cursor: unknown, binding: string) {
    let offset = 0;
    if (cursor !== undefined) {
      if (typeof cursor !== 'string') return invalid();
      try {
        const parts = cursor.split('.');
        if (parts.length !== 2) return invalid();
        const [body, signature] = parts;
        if (
          !body ||
          !signature ||
          createHmac('sha256', this.cursorKey).update(body).digest('hex') !==
            signature
        )
          return invalid();
        const parsed = JSON.parse(
          Buffer.from(body, 'base64url').toString(),
        ) as { binding: string; offset: number };
        if (
          parsed.binding !== binding ||
          !Number.isSafeInteger(parsed.offset) ||
          parsed.offset < 0
        )
          return invalid();
        offset = parsed.offset;
      } catch {
        return invalid();
      }
    }
    const end = offset + limit;
    const body = Buffer.from(raitCanonical({ binding, offset: end })).toString(
      'base64url',
    );
    return {
      items: items.slice(offset, end),
      nextCursor:
        end < items.length
          ? body +
            '.' +
            createHmac('sha256', this.cursorKey).update(body).digest('hex')
          : null,
    };
  }
  async read(query: Row, principal: RaitScopePrincipal | undefined) {
    if (
      Object.keys(query).some(
        (k) => !['pool_id', 'pool_cursor', 'queue_cursor', 'limit'].includes(k),
      )
    )
      return invalid();
    const limit =
      query.limit === undefined
        ? 50
        : typeof query.limit === 'string' && /^\d+$/.test(query.limit)
          ? Number(query.limit)
          : NaN;
    if (!Number.isInteger(limit) || limit < 1 || limit > 50) return invalid();
    if (
      query.pool_id !== undefined &&
      (typeof query.pool_id !== 'string' || !UUID.test(query.pool_id))
    )
      return invalid();
    return this.scope.transaction(async (tx) => {
      await raitLockRiskRelations(tx);
      const { who, rows, operation } = await this.pools(tx, principal);
      const selected =
        query.pool_id === undefined
          ? rows.length === 1
            ? String(rows[0]!.id)
            : null
          : String(query.pool_id);
      if (selected && !rows.some((p) => p.id === selected)) return missing();
      if (!selected && query.queue_cursor !== undefined) return invalid();
      const candidates = selected
        ? await this.candidates(
            tx,
            who.tenantId,
            who.actorId,
            selected,
            operation,
          )
        : [];
      const finalScope = await this.pools(tx, principal, operation);
      if (raitCanonical(finalScope.rows) !== raitCanonical(rows))
        return missing();
      const binding = raitRevision({
        tenant: who.tenantId,
        actor: who.actorId,
        pool: selected,
        pools: rows,
      });
      return {
        data: {
          eligiblePoolCount: rows.length,
          selection:
            rows.length === 0
              ? 'none'
              : rows.length === 1
                ? 'single'
                : 'choice',
          selectedPoolId: selected,
          reason: null,
          pools: this.page(rows, limit, query.pool_cursor, binding + ':pool'),
          queue: this.page(
            candidates.map((c) => ({
              id: c.id,
              protocol_number: c.protocol_number,
              instance: c.instance,
              state: c.state,
              protocolled_at:
                c.protocolled_at instanceof Date
                  ? c.protocolled_at.toISOString()
                  : c.protocolled_at,
              unit_id: c.unit_id,
            })),
            limit,
            query.queue_cursor,
            binding +
              ':queue:' +
              raitRevision(
                candidates.map((c) => ({
                  id: c.id,
                  version: c.version,
                  state: c.state,
                  legalPriority: c.legal_priority,
                  protocolledAt: c.protocolled_at,
                  worstFlag: c.risk.worstFlag,
                  today: operation.today(operation.tenantTz),
                  sourceVersions: c.sourceVersions,
                })),
              ),
          ),
        },
      };
    });
  }
}
