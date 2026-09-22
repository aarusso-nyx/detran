// `/v1/dashboard/duties` (CTG-0002 §3.2, §7; route contract §3; plan M19).
// Leituras N0 de `dashboard.duty`/`duty_cycle` (estado próprio — `meta.freshness`
// de §5.5) e os cinco comandos do ciclo de dever, resolvidos por
// `(duty.id, period)` → `duty_cycle` e delegados a `DashboardDutyService`
// (§14.1/A21: `start(tx, dutyId, period, …)`, demais `(tx, cycleId, dto, …)`).
import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Param,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database, type Transaction } from '@stynx-nyx/data';
import { z } from 'zod';
import {
  Action,
  Audit,
  DetranError,
  Resource,
  etagOf,
  withTenantContext,
  type RequestLike,
} from '@detran/shared';

import {
  ArchiveDutySchema,
  DashboardDutyService,
  PrepareDutySchema,
  SubmitDutySchema,
  type CycleContext,
  type DutyRow,
} from '../cycle/index.js';
import type { DashboardSqlTransaction } from '../projection-contract.js';
import { DutiesQuery, DutyCyclesQuery, pageOf } from './dto.js';
import {
  DashboardLayerGate,
  headerValue,
  ownStateFreshness,
  paginate,
  parseWith,
  type ResponseLike,
} from './layer-gate.js';

/** Corpos `.strict()` (§3): chave desconhecida → 400 `DASH.VALIDATION_FAILED`. */
const STRICT = {
  empty: z.object({}).strict(),
  prepare: PrepareDutySchema.strict(),
  submit: SubmitDutySchema.strict(),
  /** A forma da evidência (`hash` ausente/malformado) é código próprio do ciclo (§3.2). */
  prove: z
    .object({
      evidence: z
        .object({
          protocol: z.string().optional(),
          captureUri: z.string().optional(),
          hash: z.string().optional(),
        })
        .strict()
        .optional(),
    })
    .strict(),
  archive: ArchiveDutySchema.strict(),
};

interface DutyTableRow extends Record<string, unknown> {
  id: string;
  code: string;
  line_no: number | null;
  title: string;
  source_ref: string;
  periodicity: string;
  deadline_rule: string | null;
  deadline_kind: string;
  consequence: string;
  rule_ref: string;
  scope: string;
  owner_role: string;
  owner_actor: string | null;
  indicator_code: string | null;
  mvp: boolean;
}

interface DutyCycleTableRow extends Record<string, unknown> {
  id: string;
  duty_code: string;
  period: string;
  state: string;
  deadline_on: string | null;
  opened_at: Date;
  started_at: Date | null;
  prepared_at: Date | null;
  submitted_at: Date | null;
  proved_at: Date | null;
  archived_at: Date | null;
  late_at: Date | null;
  unfulfilled_at: Date | null;
  draft_ref: string | null;
  evidence_protocol: string | null;
  evidence_capture_uri: string | null;
  evidence_hash: string | null;
  version: number;
  total?: string;
}

const iso = (value: Date | null): string | null =>
  value ? value.toISOString() : null;

export function dutyView(row: DutyTableRow): Record<string, unknown> {
  return {
    id: row.id,
    code: row.code,
    lineNo: row.line_no,
    title: row.title,
    sourceRef: row.source_ref,
    periodicity: row.periodicity,
    deadlineRule: row.deadline_rule,
    deadlineKind: row.deadline_kind,
    consequence: row.consequence,
    ruleRef: row.rule_ref,
    scope: row.scope,
    ownerRole: row.owner_role,
    ownerActor: row.owner_actor,
    indicatorCode: row.indicator_code,
    mvp: row.mvp,
  };
}

export function dutyCycleView(row: DutyCycleTableRow): Record<string, unknown> {
  return {
    id: row.id,
    dutyCode: row.duty_code,
    period: row.period,
    state: row.state,
    deadlineOn: row.deadline_on,
    openedAt: iso(row.opened_at),
    startedAt: iso(row.started_at),
    preparedAt: iso(row.prepared_at),
    submittedAt: iso(row.submitted_at),
    provedAt: iso(row.proved_at),
    archivedAt: iso(row.archived_at),
    lateAt: iso(row.late_at),
    unfulfilledAt: iso(row.unfulfilled_at),
    draftRef: row.draft_ref,
    evidence: {
      protocol: row.evidence_protocol,
      captureUri: row.evidence_capture_uri,
      hash: row.evidence_hash,
    },
    version: row.version,
  };
}

const CYCLE_COLUMN_NAMES = [
  'id',
  'duty_code',
  'period',
  'state',
  'deadline_on::text as deadline_on',
  'opened_at',
  'started_at',
  'prepared_at',
  'submitted_at',
  'proved_at',
  'archived_at',
  'late_at',
  'unfulfilled_at',
  'draft_ref',
  'evidence_protocol',
  'evidence_capture_uri',
  'evidence_hash',
  'version',
] as const;
const CYCLE_COLUMNS = CYCLE_COLUMN_NAMES.join(', ');
const CYCLE_COLUMNS_C = CYCLE_COLUMN_NAMES.map((column) => `c.${column}`).join(
  ', ',
);

@Controller('v1/dashboard/duties')
@Resource('dashboard:duty-cycle')
export class DashboardDutiesController {
  constructor(
    private readonly duties: DashboardDutyService,
    private readonly gate: DashboardLayerGate,
    private readonly database: Database,
    private readonly requestContext: RequestContext,
  ) {}

  @Get()
  @Resource('dashboard:duty')
  @Action('read')
  async list(
    @Req() req: RequestLike,
    @Query() rawQuery: unknown,
  ): Promise<Record<string, unknown>> {
    const query = parseWith(DutiesQuery, rawQuery);
    return this.tx(async (tx) => {
      const layer = await this.gate.open(tx, req, {
        route: 'GET duties',
        policy: 'dashboard:duty:read',
        requiredLayer: 'N0',
        filters: query,
      });
      const tenantId = this.gate.tenantId();
      const duties = await tx.query<DutyTableRow>(
        `select * from dashboard.duty
          where tenant_id = $1
            and ($2::text is null or scope = $2)
            and ($3::boolean is null or mvp = $3)
          order by line_no nulls last, code`,
        [tenantId, query.scope ?? null, query.mvp ?? null],
      );
      const current = await tx.query<DutyCycleTableRow>(
        `select distinct on (c.duty_code) ${CYCLE_COLUMNS_C}
           from dashboard.duty_cycle c
           join dashboard.duty_state_ref s on s.code = c.state
          where c.tenant_id = $1 and s.is_terminal = false
          order by c.duty_code, c.period desc`,
        [tenantId],
      );
      const byCode = new Map(current.rows.map((row) => [row.duty_code, row]));
      const items = duties.rows.map((row) => ({
        ...dutyView(row),
        currentCycle: byCode.has(row.code)
          ? dutyCycleView(byCode.get(row.code)!)
          : null,
      }));
      await this.gate.record(tx, layer, items.length);
      return {
        items,
        total: items.length,
        meta: {
          freshness: ownStateFreshness(this.gate.now()),
          total: items.length,
        },
      };
    });
  }

  @Get(':id/cycles')
  @Action('read')
  async cycles(
    @Req() req: RequestLike,
    @Param('id') id: string,
    @Query() rawQuery: unknown,
  ): Promise<Record<string, unknown>> {
    const query = parseWith(DutyCyclesQuery, rawQuery);
    return this.tx(async (tx) => {
      const duty = await this.duty(tx, id);
      const layer = await this.gate.open(tx, req, {
        route: 'GET duties/{id}/cycles',
        policy: 'dashboard:duty-cycle:read',
        requiredLayer: 'N0',
        filters: { id, ...query },
      });
      const cycles = await tx.query<DutyCycleTableRow>(
        `select ${CYCLE_COLUMNS} from dashboard.duty_cycle
          where tenant_id = $1 and duty_code = $2 and ($3::text is null or state = $3)
          order by period desc`,
        [this.gate.tenantId(), duty.code, query.state ?? null],
      );
      const listed = paginate(cycles.rows.map(dutyCycleView), pageOf(query));
      await this.gate.record(tx, layer, listed.items.length);
      return {
        items: listed.items,
        page: listed.page,
        pageSize: listed.pageSize,
        total: listed.total,
        meta: {
          freshness: ownStateFreshness(this.gate.now()),
          page: listed.page,
          pageSize: listed.pageSize,
          total: listed.total,
        },
      };
    });
  }

  @Get(':id/cycles/:period')
  @Action('read')
  async cycle(
    @Req() req: RequestLike,
    @Param('id') id: string,
    @Param('period') period: string,
    @Res({ passthrough: true }) res: ResponseLike,
  ): Promise<Record<string, unknown>> {
    return this.tx(async (tx) => {
      const duty = await this.duty(tx, id);
      const layer = await this.gate.open(tx, req, {
        route: 'GET duties/{id}/cycles/{period}',
        policy: 'dashboard:duty-cycle:read',
        requiredLayer: 'N0',
        filters: { id, period },
      });
      this.duties.validatePeriod(duty as unknown as DutyRow, period);
      const row = await this.cycleRow(tx, duty.code, period);
      await this.gate.record(tx, layer, 1);
      res.setHeader('ETag', etagOf(row.version));
      return {
        ...dutyCycleView(row),
        duty: dutyView(duty),
        meta: { freshness: ownStateFreshness(this.gate.now()) },
      };
    });
  }

  @Post(':id/cycles/:period/start')
  @HttpCode(200)
  @Action('start')
  @Audit({ action: 'DASH_DUTY_START', entity: 'dashboard.duty_cycle' })
  async start(
    @Req() req: RequestLike,
    @Param('id') id: string,
    @Param('period') period: string,
    @Body() body: unknown,
    @Headers('if-match') ifMatch: string | string[] | undefined,
    @Res({ passthrough: true }) res: ResponseLike,
  ): Promise<Record<string, unknown>> {
    parseWith(STRICT.empty, body);
    return this.command(
      req,
      id,
      period,
      'dashboard:duty-cycle:start',
      res,
      async (tx, duty, ctx) => {
        await this.duties.start(tx, duty.id, period, headerValue(ifMatch), ctx);
      },
    );
  }

  @Post(':id/cycles/:period/prepare')
  @HttpCode(200)
  @Action('prepare')
  @Audit({ action: 'DASH_DUTY_PREPARE', entity: 'dashboard.duty_cycle' })
  async prepare(
    @Req() req: RequestLike,
    @Param('id') id: string,
    @Param('period') period: string,
    @Body() body: unknown,
    @Headers('if-match') ifMatch: string | string[] | undefined,
    @Res({ passthrough: true }) res: ResponseLike,
  ): Promise<Record<string, unknown>> {
    const dto = parseWith(STRICT.prepare, body);
    return this.command(
      req,
      id,
      period,
      'dashboard:duty-cycle:prepare',
      res,
      async (tx, duty, ctx) => {
        const cycle = await this.cycleRow(tx, duty.code, period);
        await this.duties.prepare(tx, cycle.id, dto, headerValue(ifMatch), ctx);
      },
    );
  }

  @Post(':id/cycles/:period/submit')
  @HttpCode(200)
  @Action('submit')
  @Audit({ action: 'DASH_DUTY_SUBMIT', entity: 'dashboard.duty_cycle' })
  async submit(
    @Req() req: RequestLike,
    @Param('id') id: string,
    @Param('period') period: string,
    @Body() body: unknown,
    @Headers('if-match') ifMatch: string | string[] | undefined,
    @Res({ passthrough: true }) res: ResponseLike,
  ): Promise<Record<string, unknown>> {
    const dto = parseWith(STRICT.submit, body);
    return this.command(
      req,
      id,
      period,
      'dashboard:duty-cycle:submit',
      res,
      async (tx, duty, ctx) => {
        const cycle = await this.cycleRow(tx, duty.code, period);
        await this.duties.submit(tx, cycle.id, dto, headerValue(ifMatch), ctx);
      },
    );
  }

  @Post(':id/cycles/:period/prove')
  @HttpCode(200)
  @Action('prove')
  @Audit({ action: 'DASH_DUTY_PROVE', entity: 'dashboard.duty_cycle' })
  async prove(
    @Req() req: RequestLike,
    @Param('id') id: string,
    @Param('period') period: string,
    @Body() body: unknown,
    @Headers('if-match') ifMatch: string | string[] | undefined,
    @Res({ passthrough: true }) res: ResponseLike,
  ): Promise<Record<string, unknown>> {
    const dto = parseWith(STRICT.prove, body);
    return this.command(
      req,
      id,
      period,
      'dashboard:duty-cycle:prove',
      res,
      async (tx, duty, ctx) => {
        const cycle = await this.cycleRow(tx, duty.code, period);
        await this.duties.prove(
          tx,
          cycle.id,
          dto as never,
          headerValue(ifMatch),
          ctx,
        );
      },
    );
  }

  @Post(':id/cycles/:period/archive')
  @HttpCode(200)
  @Action('archive')
  @Audit({ action: 'DASH_DUTY_ARCHIVE', entity: 'dashboard.duty_cycle' })
  async archive(
    @Req() req: RequestLike,
    @Param('id') id: string,
    @Param('period') period: string,
    @Body() body: unknown,
    @Headers('if-match') ifMatch: string | string[] | undefined,
    @Res({ passthrough: true }) res: ResponseLike,
  ): Promise<Record<string, unknown>> {
    const dto = parseWith(STRICT.archive, body);
    return this.command(
      req,
      id,
      period,
      'dashboard:duty-cycle:archive',
      res,
      async (tx, duty, ctx) => {
        const cycle = await this.cycleRow(tx, duty.code, period);
        await this.duties.archive(tx, cycle.id, dto, headerValue(ifMatch), ctx);
      },
    );
  }

  /** Comando (§7.3): dever (404) → período válido → ciclo → efeito → resposta = ciclo relido. */
  private command(
    req: RequestLike,
    id: string,
    period: string,
    policy: string,
    res: ResponseLike,
    run: (
      tx: DashboardSqlTransaction,
      duty: DutyTableRow,
      ctx: CycleContext,
    ) => Promise<void>,
  ): Promise<Record<string, unknown>> {
    return this.tx(async (tx) => {
      const duty = await this.duty(tx, id);
      this.duties.validatePeriod(duty as unknown as DutyRow, period);
      const ctx = await this.gate.context(tx, req, policy);
      await run(tx, duty, ctx);
      const row = await this.cycleRow(tx, duty.code, period);
      res.setHeader('ETag', etagOf(row.version));
      return {
        ...dutyCycleView(row),
        duty: dutyView(duty),
        meta: { freshness: ownStateFreshness(ctx.now) },
      };
    });
  }

  private async duty(
    tx: DashboardSqlTransaction,
    id: string,
  ): Promise<DutyTableRow> {
    const result = await tx.query<DutyTableRow>(
      `select * from dashboard.duty where tenant_id = $1 and id = $2::uuid`,
      [this.gate.tenantId(), id],
    );
    const row = result.rows[0];
    if (!row) {
      throw new DetranError('DASH.TENANT_MISMATCH', {
        status: 404,
        context: { dutyId: id },
      });
    }
    return row;
  }

  private async cycleRow(
    tx: DashboardSqlTransaction,
    dutyCode: string,
    period: string,
  ): Promise<DutyCycleTableRow> {
    const result = await tx.query<DutyCycleTableRow>(
      `select ${CYCLE_COLUMNS} from dashboard.duty_cycle
        where tenant_id = $1 and duty_code = $2 and period = $3`,
      [this.gate.tenantId(), dutyCode, period],
    );
    const row = result.rows[0];
    if (!row) {
      throw new DetranError('DASH.TENANT_MISMATCH', {
        status: 404,
        context: { dutyCode, period },
      });
    }
    return row;
  }

  private tx<T>(work: (tx: DashboardSqlTransaction) => Promise<T>): Promise<T> {
    return withTenantContext(
      this.database,
      this.requestContext,
      (transaction: Transaction) =>
        work(transaction as unknown as DashboardSqlTransaction),
    );
  }
}
