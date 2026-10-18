// Adapter de prévia do `OrgClient` (R-0033 TASK-0003; `frontend-preview-mode.md` §2, §6, D-06,
// D-11; inventário §2). Leituras: `raitHolidays`, `raitSuspensionActs`, `raitJetonSheets`,
// `raitJetonLines`, `raitIncidents`, `raitQualitySamples`, `raitCapacityPlans` e `raitExports` de
// `rait-fixtures.json` (seeds 40–60, fora da paridade de `rait-fixtures.md` §10), mapeadas sem
// inventar campo (D-06; `@default` do contrato gerado `BP-INF-RAIT-ORG-001`; textos e datas
// obrigatórios sem coluna → `source_pending`). Comandos: registram a string M8 e delegam ao
// cliente real, que lança.
import { Injectable, inject } from '@angular/core';
import { OrgClient } from '../../data/api/org.client';
import type { ListQuerySpec } from '../../data/list-query';
import type {
  ListPage,
  ListQuery,
  RaitCapacityPlan,
  RaitExport,
  RaitHoliday,
  RaitIncident,
  RaitJetonLine,
  RaitJetonSheet,
  RaitQualitySample,
  RaitSuspensionAct,
} from '../../data/models';
import { PreviewActionLog } from '../preview-action-log';
import type {
  FixtureCapacityPlan,
  FixtureExport,
  FixtureHoliday,
  FixtureIncident,
  FixtureJetonLine,
  FixtureJetonSheet,
  FixtureQualitySample,
  FixtureSuspensionAct,
  RaitFixturesJson,
} from '../preview-fixtures';
import {
  PreviewFixtureReader,
  fixtureDateTime,
  sourcePending,
} from './preview-reader';

// `ListQuerySpec` — cópia literal de `data/api/org.client.ts` (constantes privadas do módulo).
const HOLIDAY_SPEC: ListQuerySpec<RaitHoliday> = {
  q: ['name'],
  filtro: ['scope', 'holiday_on'],
};
const SUSPENSION_ACT_SPEC: ListQuerySpec<RaitSuspensionAct> = {
  q: ['reason'],
  filtro: ['state'],
};
const JETON_SHEET_SPEC: ListQuerySpec<RaitJetonSheet> = {
  q: [],
  filtro: ['judging_body', 'state'],
};
const JETON_LINE_SPEC: ListQuerySpec<RaitJetonLine> = {
  q: [],
  filtro: ['sheet_id', 'member_id', 'session_id'],
};
const INCIDENT_SPEC: ListQuerySpec<RaitIncident> = {
  q: ['incident_ref'],
  filtro: ['case_id', 'clock_id'],
};
const QUALITY_SAMPLE_SPEC: ListQuerySpec<RaitQualitySample> = {
  q: [],
  filtro: ['case_id', 'reviewer_member_id', 'finding_kind', 'systemic'],
};
const CAPACITY_PLAN_SPEC: ListQuerySpec<RaitCapacityPlan> = {
  q: [],
  filtro: ['pool_id'],
};
const EXPORT_SPEC: ListQuerySpec<RaitExport> = {
  q: ['purpose'],
  filtro: ['status', 'requested_by'],
};

// `@default` do contrato gerado `BP-INF-RAIT-ORG-001` para colunas que a fixture não traz.
/** `optional`, `systemic`, `attendance_valid`, `remunerated`, `over_cap`, `reinforcement_requested`, `unit_proposed`: `@default false`. */
const DEFAULT_FALSE = false;
/** `RaitJetonLine.items_reported`/`votes_cast` `@default 0`. */
const DEFAULT_ZERO = 0;
/** `RaitJetonLine.source_pending` `@default true`. */
const JETON_LINE_DEFAULT_SOURCE_PENDING = true;
/**
 * `RaitSuspensionAct.timer_codes` `@default '[]'::jsonb`; o contrato gerado tipa a coluna `jsonb`
 * como mapa — o valor de fio continua o array vazio do `@default`.
 */
const SUSPENSION_DEFAULT_TIMER_CODES =
  [] as unknown as RaitSuspensionAct['timer_codes'];
/** `RaitExport.scope` `@default '{}'::jsonb`. */
const EXPORT_DEFAULT_SCOPE: RaitExport['scope'] = {};

function toHoliday(record: FixtureHoliday, tenantId: string): RaitHoliday {
  return {
    id: record.id,
    tenant_id: tenantId,
    name: record.name,
    holiday_on: record.holidayOn,
    scope: record.scope,
    optional: record.optional ?? DEFAULT_FALSE,
    created_at: sourcePending(),
  };
}

function toSuspensionAct(
  record: FixtureSuspensionAct,
  tenantId: string,
): RaitSuspensionAct {
  return {
    id: record.id,
    tenant_id: tenantId,
    reason: sourcePending(),
    starts_on: record.startsOn,
    ends_on: record.endsOn,
    timer_codes: SUSPENSION_DEFAULT_TIMER_CODES,
    evidence_document_id: sourcePending(),
    signed_by: sourcePending(),
    signed_at: sourcePending(),
    state: record.state,
    revoked_at: fixtureDateTime(record.revokedAt),
    created_at: sourcePending(),
  };
}

function toJetonSheet(
  record: FixtureJetonSheet,
  tenantId: string,
): RaitJetonSheet {
  return {
    id: record.id,
    tenant_id: tenantId,
    judging_body: record.judgingBody,
    period_start: record.periodStart,
    period_end: record.periodEnd,
    state: record.state,
    generated_at: sourcePending(),
    source_pending: record.sourcePending,
    created_at: sourcePending(),
  };
}

function toJetonLine(
  record: FixtureJetonLine,
  tenantId: string,
): RaitJetonLine {
  return {
    id: record.id,
    tenant_id: tenantId,
    sheet_id: record.sheetId,
    member_id: record.memberId,
    session_id: record.sessionId,
    attendance_valid: record.attendanceValid,
    items_reported: DEFAULT_ZERO,
    votes_cast: DEFAULT_ZERO,
    absence_kind: record.absenceKind ?? null,
    remunerated: DEFAULT_FALSE,
    over_cap: DEFAULT_FALSE,
    source_pending: JETON_LINE_DEFAULT_SOURCE_PENDING,
    created_at: sourcePending(),
  };
}

function toIncident(record: FixtureIncident, tenantId: string): RaitIncident {
  return {
    id: record.id,
    tenant_id: tenantId,
    incident_ref: record.incidentRef,
    clock_id: record.clockId,
    case_id: record.caseId,
    opened_at: sourcePending(),
    closed_at: fixtureDateTime(record.closedAt),
    created_at: sourcePending(),
  };
}

function toQualitySample(
  record: FixtureQualitySample,
  tenantId: string,
): RaitQualitySample {
  return {
    id: record.id,
    tenant_id: tenantId,
    period_start: record.periodStart,
    period_end: record.periodEnd,
    case_id: record.caseId,
    sampled_at: sourcePending(),
    finding_kind: record.findingKind ?? null,
    systemic: record.systemic ?? DEFAULT_FALSE,
    created_at: sourcePending(),
  };
}

function toCapacityPlan(
  record: FixtureCapacityPlan,
  tenantId: string,
): RaitCapacityPlan {
  return {
    id: record.id,
    tenant_id: tenantId,
    pool_id: record.poolId,
    period_start: record.periodStart,
    period_end: record.periodEnd,
    months_over_capacity: record.monthsOverCapacity,
    reinforcement_requested: record.reinforcementRequested ?? DEFAULT_FALSE,
    unit_proposed: record.unitProposed ?? DEFAULT_FALSE,
    registered_at: sourcePending(),
    closed_at: fixtureDateTime(record.closedAt),
    created_at: sourcePending(),
  };
}

function toExport(record: FixtureExport, tenantId: string): RaitExport {
  return {
    id: record.id,
    tenant_id: tenantId,
    purpose: sourcePending(),
    scope: EXPORT_DEFAULT_SCOPE,
    requested_by: sourcePending(),
    requested_at: sourcePending(),
    row_count: record.rowCount ?? null,
    status: record.status,
    generated_at: fixtureDateTime(record.generatedAt),
    created_at: sourcePending(),
  };
}

const holidays = (f: RaitFixturesJson): readonly RaitHoliday[] =>
  f.raitHolidays.map((record) => toHoliday(record, f.tenant.id));
const suspensionActs = (f: RaitFixturesJson): readonly RaitSuspensionAct[] =>
  f.raitSuspensionActs.map((record) => toSuspensionAct(record, f.tenant.id));
const jetonSheets = (f: RaitFixturesJson): readonly RaitJetonSheet[] =>
  f.raitJetonSheets.map((record) => toJetonSheet(record, f.tenant.id));
const jetonLines = (f: RaitFixturesJson): readonly RaitJetonLine[] =>
  f.raitJetonLines.map((record) => toJetonLine(record, f.tenant.id));
const incidents = (f: RaitFixturesJson): readonly RaitIncident[] =>
  f.raitIncidents.map((record) => toIncident(record, f.tenant.id));
const qualitySamples = (f: RaitFixturesJson): readonly RaitQualitySample[] =>
  f.raitQualitySamples.map((record) => toQualitySample(record, f.tenant.id));
const capacityPlans = (f: RaitFixturesJson): readonly RaitCapacityPlan[] =>
  f.raitCapacityPlans.map((record) => toCapacityPlan(record, f.tenant.id));
const exportsOf = (f: RaitFixturesJson): readonly RaitExport[] =>
  f.raitExports.map((record) => toExport(record, f.tenant.id));

@Injectable({ providedIn: 'root' })
export class PreviewOrgClient extends OrgClient {
  private readonly previewReader = inject(PreviewFixtureReader);
  private readonly previewLog = inject(PreviewActionLog);

  // --- leituras ------------------------------------------------------------------------------

  override listRaitHoliday(
    query: ListQuery = {},
  ): Promise<ListPage<RaitHoliday>> {
    return this.previewReader.list(query, HOLIDAY_SPEC, holidays);
  }

  override getRaitHoliday(id: string): Promise<RaitHoliday> {
    return this.previewReader.get('raitHolidays', id, holidays);
  }

  override listRaitSuspensionAct(
    query: ListQuery = {},
  ): Promise<ListPage<RaitSuspensionAct>> {
    return this.previewReader.list(query, SUSPENSION_ACT_SPEC, suspensionActs);
  }

  override getRaitSuspensionAct(id: string): Promise<RaitSuspensionAct> {
    return this.previewReader.get('raitSuspensionActs', id, suspensionActs);
  }

  override listRaitJetonSheet(
    query: ListQuery = {},
  ): Promise<ListPage<RaitJetonSheet>> {
    return this.previewReader.list(query, JETON_SHEET_SPEC, jetonSheets);
  }

  override getRaitJetonSheet(id: string): Promise<RaitJetonSheet> {
    return this.previewReader.get('raitJetonSheets', id, jetonSheets);
  }

  override listRaitJetonLine(
    query: ListQuery = {},
  ): Promise<ListPage<RaitJetonLine>> {
    return this.previewReader.list(query, JETON_LINE_SPEC, jetonLines);
  }

  override getRaitJetonLine(id: string): Promise<RaitJetonLine> {
    return this.previewReader.get('raitJetonLines', id, jetonLines);
  }

  override listRaitIncident(
    query: ListQuery = {},
  ): Promise<ListPage<RaitIncident>> {
    return this.previewReader.list(query, INCIDENT_SPEC, incidents);
  }

  override getRaitIncident(id: string): Promise<RaitIncident> {
    return this.previewReader.get('raitIncidents', id, incidents);
  }

  override listRaitQualitySample(
    query: ListQuery = {},
  ): Promise<ListPage<RaitQualitySample>> {
    return this.previewReader.list(query, QUALITY_SAMPLE_SPEC, qualitySamples);
  }

  override getRaitQualitySample(id: string): Promise<RaitQualitySample> {
    return this.previewReader.get('raitQualitySamples', id, qualitySamples);
  }

  override listRaitCapacityPlan(
    query: ListQuery = {},
  ): Promise<ListPage<RaitCapacityPlan>> {
    return this.previewReader.list(query, CAPACITY_PLAN_SPEC, capacityPlans);
  }

  override getRaitCapacityPlan(id: string): Promise<RaitCapacityPlan> {
    return this.previewReader.get('raitCapacityPlans', id, capacityPlans);
  }

  override listRaitExport(
    query: ListQuery = {},
  ): Promise<ListPage<RaitExport>> {
    return this.previewReader.list(query, EXPORT_SPEC, exportsOf);
  }

  override getRaitExport(id: string): Promise<RaitExport> {
    return this.previewReader.get('raitExports', id, exportsOf);
  }

  // --- comandos (contrato §6: registra a string M8 e delega; o cliente real lança) ------------

  override generateJetonSheet(
    ...args: Parameters<OrgClient['generateJetonSheet']>
  ): ReturnType<OrgClient['generateJetonSheet']> {
    this.previewLog.record('rait-jeton:generate');
    return super.generateJetonSheet(...args);
  }

  override approveJetonSheet(
    ...args: Parameters<OrgClient['approveJetonSheet']>
  ): ReturnType<OrgClient['approveJetonSheet']> {
    this.previewLog.record('rait-jeton:approve');
    return super.approveJetonSheet(...args);
  }

  override createSuspensionAct(
    ...args: Parameters<OrgClient['createSuspensionAct']>
  ): ReturnType<OrgClient['createSuspensionAct']> {
    this.previewLog.record('rait-suspension-act:create');
    return super.createSuspensionAct(...args);
  }

  override updateParameter(
    ...args: Parameters<OrgClient['updateParameter']>
  ): ReturnType<OrgClient['updateParameter']> {
    this.previewLog.record('rait-parameter:update');
    return super.updateParameter(...args);
  }

  override createExport(
    ...args: Parameters<OrgClient['createExport']>
  ): ReturnType<OrgClient['createExport']> {
    this.previewLog.record('rait-export:create');
    return super.createExport(...args);
  }

  override publishCapacityPlan(
    ...args: Parameters<OrgClient['publishCapacityPlan']>
  ): ReturnType<OrgClient['publishCapacityPlan']> {
    this.previewLog.record('rait-capacity-plan:publish');
    return super.publishCapacityPlan(...args);
  }

  override reviewQualitySample(
    ...args: Parameters<OrgClient['reviewQualitySample']>
  ): ReturnType<OrgClient['reviewQualitySample']> {
    this.previewLog.record('rait-quality-sample:review');
    return super.reviewQualitySample(...args);
  }

  override updateCalendar(
    ...args: Parameters<OrgClient['updateCalendar']>
  ): ReturnType<OrgClient['updateCalendar']> {
    this.previewLog.record('rait-calendar:update');
    return super.updateCalendar(...args);
  }
}
