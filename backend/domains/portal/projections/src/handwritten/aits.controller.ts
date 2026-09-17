// `/v1/portal/aits`, `/v1/portal/aits/{aitId}[/points]` e `/v1/portal/points-summary`
// — autuações pela projeção (work/rounds/R-0009/contracts/CTG-0002.md §2.2;
// plan R-0009 M10, M16, M19; ADR-0020). Leituras de dado próprio (sem
// `@Audit`, M20): a lista é por `cpf_hash` (o sujeito e os representados com
// procuração VALIDADA vigente, scope `ait|all`); o detalhe exige
// `portal.entitlement` (M10: ausência e inexistência respondem o mesmo 404).
// Nenhum token de `inf` sai (RN-PORTAL-112): `situation` é o vocabulário
// cidadão de M16.
import {
  Controller,
  Get,
  Optional,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database, type Transaction } from '@stynx-nyx/data';
import {
  Action,
  Resource,
  withTenantContext,
  type RequestLike,
} from '@detran/shared';
import {
  PortalCitizenGuard,
  PortalClock,
  PortalError,
  PortalIdentityService,
  cpfHashOf,
  parsePage,
  portalIdentityOf,
  type PortalClockLike,
  type PortalIdentityClaims,
  type PortalIdentityRequest,
  type PortalPagedResponse,
  type PortalSqlTransaction,
  type PortalSubjectRecord,
} from '@detran/portal-identity';

import {
  INFRACTION_SITUATIONS,
  type InfractionActionEntry,
  type InfractionNoticeEntry,
  type PointsStatus,
  type Situation,
} from './infraction-view.projection.js';
import { asArray, asObject } from './projection-contract.js';

type CitizenRequest = RequestLike & PortalIdentityRequest;
type PortalQuery = Record<string, string | string[] | undefined>;

export interface AitListItem {
  aitId: string;
  aitNumber: string;
  plate: string;
  occurredAt: string;
  framingLabel: string;
  amount: number | null;
  situation: Situation;
  deadlines: unknown[];
  pointsStatus: PointsStatus;
  actions: InfractionActionEntry[];
}

export interface AitPayment {
  tiers: unknown[];
  paid: boolean;
  paidTier: string | null;
  [key: string]: unknown;
}

export interface AitDetailResponse extends AitListItem {
  notices: InfractionNoticeEntry[];
  payment: AitPayment;
  openRequestId: string | null;
  /** Evidências do AIT vivem em ops/evidence; sem projeção nesta rodada (OD-P41). */
  evidenceAvailable: false;
}

export interface AitPointsResponse {
  aitId: string;
  pointsStatus: PointsStatus;
  /** A projeção não guarda pontos por AIT (OD-P34). */
  points: null;
}

export interface PointsSummaryResponse {
  definitivePoints: number;
  disputedPoints: number;
  byVehicle: unknown[];
  last12Months: unknown[];
  cachedAt: string | null;
}

const VIEW_COLUMNS = `ait_id, ait_number, plate, occurred_at, framing_label, amount, situation,
          deadlines_json, points_status, actions_json, notices_json, payment_json`;

const REPRESENTED_HASHES_SQL = `select represented_cpf_hash
     from portal.representation
    where representative_subject_id = $1
      and state = 'PROCURACAO_VALIDADA'
      and scope in ('ait', 'all')
      and (valid_until is null or valid_until >= $2::date)`;

const VIEW_SQL = `select ${VIEW_COLUMNS}
     from portal.infraction_view
    where ait_id = $1
    limit 1`;

const OPEN_REQUEST_SQL = `select id
     from portal.request
    where subject_id = $1 and target_kind = 'ait' and target_id = $2
      and state not in ('CONCLUIDO', 'DESISTIDO', 'INELEGIVEL')
    order by created_at desc
    limit 1`;

const POINTS_SQL = `select definitive_points, disputed_points, by_vehicle_json, last_12_months_json, cached_at
     from portal.points_view
    where subject_cpf_hash = $1
    limit 1`;

interface ViewRow extends Record<string, unknown> {
  ait_id: string;
  ait_number: string;
  plate: string;
  occurred_at: Date | string;
  framing_label: string;
  amount: number | string | null;
  situation: Situation;
  deadlines_json: unknown;
  points_status: PointsStatus;
  actions_json: unknown;
  notices_json: unknown;
  payment_json: unknown;
}

interface PointsRow extends Record<string, unknown> {
  definitive_points: number | string;
  disputed_points: number | string;
  by_vehicle_json: unknown;
  last_12_months_json: unknown;
  cached_at: Date | string | null;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function iso(value: Date | string): string {
  return value instanceof Date
    ? value.toISOString()
    : new Date(value).toISOString();
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function notFound(kind: string): PortalError {
  return new PortalError('PORTAL.NOT_FOUND', {
    status: 404,
    context: { kind },
  });
}

function listItemOf(row: ViewRow): AitListItem {
  return {
    aitId: row.ait_id,
    aitNumber: row.ait_number,
    plate: row.plate,
    occurredAt: iso(row.occurred_at),
    framingLabel: row.framing_label,
    amount: row.amount === null ? null : Number(row.amount),
    situation: row.situation,
    deadlines: asArray(row.deadlines_json),
    pointsStatus: row.points_status,
    actions: asArray<InfractionActionEntry>(row.actions_json),
  };
}

/** `payment_json ?? { tiers: [], paid: false, paidTier: null }` (fixtures `{}` → o default). */
function paymentOf(value: unknown): AitPayment {
  return {
    tiers: [],
    paid: false,
    paidTier: null,
    ...asObject(value),
  } as AitPayment;
}

@Controller('v1/portal')
@UseGuards(PortalCitizenGuard)
@Resource('portal:ait')
export class PortalAitsController {
  private readonly clock: PortalClockLike;

  constructor(
    private readonly identity: PortalIdentityService,
    private readonly database: Database,
    private readonly requestContext: RequestContext,
    @Optional() clock?: PortalClock,
  ) {
    this.clock = clock ?? new PortalClock();
  }

  @Get('aits')
  @Action('read')
  list(
    @Req() request: CitizenRequest,
    @Query() query: PortalQuery,
  ): Promise<PortalPagedResponse<AitListItem>> {
    const identity = portalIdentityOf(request);
    const status = first(query?.status);
    if (
      status !== undefined &&
      !(INFRACTION_SITUATIONS as readonly string[]).includes(status)
    ) {
      throw new PortalError('PORTAL.ENUM_INVALID', {
        status: 400,
        context: { field: 'status', allowed: [...INFRACTION_SITUATIONS] },
      });
    }
    const vehicle = first(query?.vehicle);
    const page = parsePage(query ?? {});
    return this.withSubject(identity, async (tx, subject) => {
      const represented = await tx.query<{ represented_cpf_hash: string }>(
        REPRESENTED_HASHES_SQL,
        [subject.subjectId, this.clock.today()],
      );
      const hashes = [
        cpfHashOf(identity.cpf),
        ...represented.rows.map((row) => row.represented_cpf_hash),
      ];
      const conditions = ['subject_cpf_hash = any($1)'];
      const values: unknown[] = [hashes];
      if (vehicle !== undefined) {
        values.push(vehicle);
        conditions.push(`plate = $${values.length}`);
      }
      if (status !== undefined) {
        values.push(status);
        conditions.push(`situation = $${values.length}`);
      }
      const where = conditions.join(' and ');
      const total = await tx.query<{ total: string | number }>(
        `select count(*) as total from portal.infraction_view where ${where}`,
        values,
      );
      values.push(page.limit, page.offset);
      const rows = await tx.query<ViewRow>(
        `select ${VIEW_COLUMNS}
           from portal.infraction_view
          where ${where}
          order by occurred_at desc, ait_id asc
          limit $${values.length - 1} offset $${values.length}`,
        values,
      );
      return {
        items: rows.rows.map(listItemOf),
        total: Number(total.rows[0]?.total ?? 0),
        page: page.page,
        pageSize: page.pageSize,
      };
    });
  }

  @Get('aits/:aitId')
  @Action('read')
  get(
    @Req() request: CitizenRequest,
    @Param('aitId') aitId: string,
  ): Promise<AitDetailResponse> {
    const identity = portalIdentityOf(request);
    assertUuid(aitId, 'aitId');
    return this.withSubject(identity, async (tx, subject) => {
      await this.identity.assertEntitled(tx, subject.subjectId, 'ait', aitId);
      const row = (await tx.query<ViewRow>(VIEW_SQL, [aitId])).rows[0];
      if (!row) throw notFound('ait');
      const open = (
        await tx.query<{ id: string }>(OPEN_REQUEST_SQL, [
          subject.subjectId,
          aitId,
        ])
      ).rows[0];
      return {
        ...listItemOf(row),
        notices: asArray<InfractionNoticeEntry>(row.notices_json),
        payment: paymentOf(row.payment_json),
        openRequestId: open?.id ?? null,
        evidenceAvailable: false,
      };
    });
  }

  @Get('aits/:aitId/points')
  @Action('read')
  points(
    @Req() request: CitizenRequest,
    @Param('aitId') aitId: string,
  ): Promise<AitPointsResponse> {
    const identity = portalIdentityOf(request);
    assertUuid(aitId, 'aitId');
    return this.withSubject(identity, async (tx, subject) => {
      await this.identity.assertEntitled(tx, subject.subjectId, 'ait', aitId);
      const row = (await tx.query<ViewRow>(VIEW_SQL, [aitId])).rows[0];
      if (!row) throw notFound('ait');
      return { aitId, pointsStatus: row.points_status, points: null };
    });
  }

  @Get('points-summary')
  @Action('read')
  pointsSummary(
    @Req() request: CitizenRequest,
  ): Promise<PointsSummaryResponse> {
    const identity = portalIdentityOf(request);
    return this.withSubject(identity, async (tx) => {
      const row = (
        await tx.query<PointsRow>(POINTS_SQL, [cpfHashOf(identity.cpf)])
      ).rows[0];
      if (!row) {
        return {
          definitivePoints: 0,
          disputedPoints: 0,
          byVehicle: [],
          last12Months: [],
          cachedAt: null,
        };
      }
      return {
        definitivePoints: Number(row.definitive_points),
        disputedPoints: Number(row.disputed_points),
        byVehicle: asArray(row.by_vehicle_json),
        last12Months: asArray(row.last_12_months_json),
        cachedAt: row.cached_at === null ? null : iso(row.cached_at),
      };
    });
  }

  /** Transação única de tenant por leitura (§0) com o sujeito garantido. */
  private withSubject<T>(
    identity: PortalIdentityClaims,
    work: (
      tx: PortalSqlTransaction,
      subject: PortalSubjectRecord,
    ) => Promise<T>,
  ): Promise<T> {
    return withTenantContext(
      this.database,
      this.requestContext,
      async (tx: Transaction) =>
        work(tx, await this.identity.upsertSubject(tx, identity, null)),
    );
  }
}

function assertUuid(value: string, field: string): void {
  if (!UUID_RE.test(value)) {
    throw new PortalError('PORTAL.VALIDATION_FAILED', {
      status: 400,
      context: { fields: [field] },
    });
  }
}
