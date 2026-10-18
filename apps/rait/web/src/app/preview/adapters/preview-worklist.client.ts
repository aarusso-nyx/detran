// Adapter de prévia do `WorklistClient` (R-0033 TASK-0003; `frontend-preview-mode.md` §2, §6,
// D-06, D-07, D-11; inventário §2). Leituras: `raitUnits`, `raitPools` (os registros de
// `rait_pool` cujos ids são os valores do mapa `pools`, `rait-fixtures.md` §10), `poolMembers`,
// `raitSchedules`, `raitScheduleSlots`, `raitBatches`, `raitBatchItems`, `raitSubstituteDuties`,
// `raitBenches`, `clocks` e, desde A4/A5 (PR #184), `assignments`, `impediments` e `clockAlerts`,
// mapeadas sem inventar campo (D-06; nomes herdados `pool` → `pool_id`, `userId` → `person_id`,
// `code` → `clock_code`; `@default` do contrato gerado; `created_at`, `opened_at`,
// `flag_changed_at`, `assigned_at`, `declared_at`, `raised_at` sem coluna na seed →
// `source_pending`, `rait-fixtures.md` §10, A5 item 5). Comandos: registram a string M8 e delegam
// ao cliente real, que lança.
import { Injectable, inject } from '@angular/core';
import { WorklistClient } from '../../data/api/worklist.client';
import type { ListQuerySpec } from '../../data/list-query';
import type {
  ListPage,
  ListQuery,
  RaitAssignment,
  RaitBatch,
  RaitBatchItem,
  RaitBench,
  RaitClock,
  RaitClockAlert,
  RaitImpediment,
  RaitPool,
  RaitPoolMember,
  RaitSchedule,
  RaitScheduleSlot,
  RaitSubstituteDuty,
  RaitUnit,
} from '../../data/models';
import { PreviewActionLog } from '../preview-action-log';
import type {
  FixtureAssignment,
  FixtureBatch,
  FixtureBatchItem,
  FixtureBench,
  FixtureClock,
  FixtureClockAlert,
  FixtureImpediment,
  FixturePool,
  FixturePoolMember,
  FixtureSchedule,
  FixtureScheduleSlot,
  FixtureSubstituteDuty,
  FixtureUnit,
  RaitFixturesJson,
} from '../preview-fixtures';
import {
  PreviewFixtureReader,
  fixtureDateTime,
  sourcePending,
} from './preview-reader';

// `ListQuerySpec` — cópia literal de `data/api/worklist.client.ts` (constantes privadas do módulo).
const UNIT_SPEC: ListQuerySpec<RaitUnit> = {
  q: ['name'],
  filtro: ['judging_body', 'state'],
};
const POOL_SPEC: ListQuerySpec<RaitPool> = {
  q: ['name'],
  filtro: ['instance', 'strategy', 'active'],
};
const POOL_MEMBER_SPEC: ListQuerySpec<RaitPoolMember> = {
  q: [],
  filtro: ['pool_id', 'person_id', 'member_role', 'status', 'is_substitute'],
};
const SCHEDULE_SPEC: ListQuerySpec<RaitSchedule> = {
  q: [],
  filtro: ['pool_id', 'member_id', 'kind', 'availability'],
};
const SCHEDULE_SLOT_SPEC: ListQuerySpec<RaitScheduleSlot> = {
  q: [],
  filtro: ['schedule_id', 'slot_on', 'availability'],
};
const BATCH_SPEC: ListQuerySpec<RaitBatch> = {
  q: [],
  filtro: ['pool_id', 'kind', 'state'],
};
const BATCH_ITEM_SPEC: ListQuerySpec<RaitBatchItem> = {
  q: [],
  filtro: ['batch_id', 'case_id', 'member_id'],
};
const ASSIGNMENT_SPEC: ListQuerySpec<RaitAssignment> = {
  q: [],
  filtro: ['case_id', 'pool_id', 'member_id', 'active', 'batch_id'],
};
const IMPEDIMENT_SPEC: ListQuerySpec<RaitImpediment> = {
  q: [],
  filtro: ['case_id', 'member_id', 'kind'],
};
const SUBSTITUTE_DUTY_SPEC: ListQuerySpec<RaitSubstituteDuty> = {
  q: [],
  filtro: ['session_id', 'member_id'],
};
const BENCH_SPEC: ListQuerySpec<RaitBench> = {
  q: [],
  filtro: ['session_id', 'state'],
};
const CLOCK_SPEC: ListQuerySpec<RaitClock> = {
  q: [],
  filtro: ['case_id', 'clock_code', 'flag'],
};
const CLOCK_ALERT_SPEC: ListQuerySpec<RaitClockAlert> = {
  q: [],
  filtro: ['clock_id', 'level', 'notified_role'],
};

// `@default` dos contratos gerados (`BP-INF-RAIT-WORKLIST-001`) para colunas que a seed não traz.
/** `RaitPool.active` `@default true`. */
const POOL_DEFAULT_ACTIVE = true;
/** `RaitPool.priority_policy` `@default 'ordem_unica'`. */
const POOL_DEFAULT_PRIORITY_POLICY: RaitPool['priority_policy'] = 'ordem_unica';
/** `RaitPoolMember.late_opinion_count`/`unjustified_absence_count` `@default 0`. */
const MEMBER_DEFAULT_COUNT = 0;
/** `RaitPoolMember.is_substitute` `@default false`. */
const MEMBER_DEFAULT_SUBSTITUTE = false;
/** `RaitSchedule.version`/`RaitBatch.version` `@default 1`. */
const DEFAULT_VERSION = 1;

function toUnit(record: FixtureUnit, tenantId: string): RaitUnit {
  return {
    id: record.id,
    tenant_id: tenantId,
    name: record.name,
    judging_body: record.judgingBody,
    state: record.state,
    coordinator_member_id: record.coordinatorMemberId,
    created_at: sourcePending(),
  };
}

function toPool(record: FixturePool, tenantId: string): RaitPool {
  return {
    id: record.id,
    tenant_id: tenantId,
    name: record.name,
    instance: record.instance,
    circuit: record.circuit,
    strategy: record.strategy,
    active: POOL_DEFAULT_ACTIVE,
    priority_policy: POOL_DEFAULT_PRIORITY_POLICY,
    created_at: sourcePending(),
  };
}

function toPoolMember(
  record: FixturePoolMember,
  tenantId: string,
): RaitPoolMember {
  return {
    id: record.id,
    tenant_id: tenantId,
    pool_id: record.pool,
    person_id: record.userId,
    member_role: record.memberRole,
    status: record.status,
    mandate_starts_on: record.mandateStartsOn,
    mandate_ends_on: record.mandateEndsOn,
    late_opinion_count: record.lateOpinionCount ?? MEMBER_DEFAULT_COUNT,
    unjustified_absence_count: MEMBER_DEFAULT_COUNT,
    is_substitute: record.isSubstitute ?? MEMBER_DEFAULT_SUBSTITUTE,
    created_at: sourcePending(),
  };
}

function toSchedule(record: FixtureSchedule, tenantId: string): RaitSchedule {
  return {
    id: record.id,
    tenant_id: tenantId,
    pool_id: record.poolId,
    member_id: record.memberId,
    kind: record.kind,
    period_start: record.periodStart,
    period_end: record.periodEnd,
    availability: record.availability,
    wip_limit: record.wipLimit,
    absence_reason: record.absenceReason,
    published_at: fixtureDateTime(record.publishedAt),
    published_by: record.publishedBy,
    version: DEFAULT_VERSION,
    created_at: sourcePending(),
  };
}

function toScheduleSlot(
  record: FixtureScheduleSlot,
  tenantId: string,
): RaitScheduleSlot {
  return {
    id: record.id,
    tenant_id: tenantId,
    schedule_id: record.scheduleId,
    slot_on: record.slotOn,
    availability: record.availability,
    absence_reason: record.absenceReason,
    created_at: sourcePending(),
  };
}

function toBatch(record: FixtureBatch, tenantId: string): RaitBatch {
  return {
    id: record.id,
    tenant_id: tenantId,
    pool_id: record.poolId,
    kind: record.kind,
    week_start: record.weekStart,
    state: record.state,
    seed: record.seed,
    opened_at: sourcePending(),
    opened_by: record.openedBy,
    drawn_at: fixtureDateTime(record.drawnAt),
    accepted_at: fixtureDateTime(record.acceptedAt),
    homologated_at: fixtureDateTime(record.homologatedAt),
    homologated_by: record.homologatedBy,
    version: DEFAULT_VERSION,
    created_at: sourcePending(),
  };
}

function toBatchItem(
  record: FixtureBatchItem,
  tenantId: string,
): RaitBatchItem {
  return {
    id: record.id,
    tenant_id: tenantId,
    batch_id: record.batchId,
    case_id: record.caseId,
    position: record.position,
    member_id: record.memberId,
    claim_due_on: record.claimDueOn,
    accepted_at: fixtureDateTime(record.acceptedAt),
    declined_at: fixtureDateTime(record.declinedAt),
    decline_kind: record.declineKind,
    created_at: sourcePending(),
  };
}

function toSubstituteDuty(
  record: FixtureSubstituteDuty,
  tenantId: string,
): RaitSubstituteDuty {
  return {
    id: record.id,
    tenant_id: tenantId,
    session_id: record.sessionId,
    member_id: record.memberId,
    designated_at: fixtureDateTime(record.designatedAt),
    convened_at: fixtureDateTime(record.convenedAt),
    created_at: sourcePending(),
  };
}

function toBench(record: FixtureBench, tenantId: string): RaitBench {
  return {
    id: record.id,
    tenant_id: tenantId,
    session_id: record.sessionId,
    state: record.state,
    confirmed_count: record.confirmedCount,
    parity_observed: record.parityObserved,
    confirmed_at: fixtureDateTime(record.confirmedAt),
    insufficient_at: fixtureDateTime(record.insufficientAt),
    created_at: sourcePending(),
  };
}

function toClock(record: FixtureClock, tenantId: string): RaitClock {
  return {
    id: record.id,
    tenant_id: tenantId,
    case_id: record.caseId,
    clock_code: record.code,
    started_on: record.startedOn,
    ceiling_on: record.ceilingOn,
    flag: record.flag,
    flag_changed_at: sourcePending(),
    legal_basis: record.legalBasis,
    created_at: sourcePending(),
  };
}

function toAssignment(
  record: FixtureAssignment,
  tenantId: string,
): RaitAssignment {
  return {
    id: record.id,
    tenant_id: tenantId,
    case_id: record.caseId,
    pool_id: record.poolId,
    member_id: record.memberId,
    assigned_at: sourcePending(),
    assigned_by: record.assignedBy ?? null,
    released_at: fixtureDateTime(record.releasedAt),
    release_reason: record.releaseReason ?? null,
    active: record.active,
    created_at: sourcePending(),
  };
}

function toImpediment(
  record: FixtureImpediment,
  tenantId: string,
): RaitImpediment {
  return {
    id: record.id,
    tenant_id: tenantId,
    case_id: record.caseId,
    member_id: record.memberId,
    basis: record.basis,
    declared_at: sourcePending(),
    kind: record.kind,
    legal_basis: record.legalBasis ?? null,
    created_at: sourcePending(),
  };
}

function toClockAlert(
  record: FixtureClockAlert,
  tenantId: string,
): RaitClockAlert {
  return {
    id: record.id,
    tenant_id: tenantId,
    clock_id: record.clockId,
    level: record.level,
    raised_at: sourcePending(),
    notified_role: record.notifiedRole,
    incident_ref: record.incidentRef ?? null,
    created_at: sourcePending(),
  };
}

const units = (f: RaitFixturesJson): readonly RaitUnit[] =>
  f.raitUnits.map((record) => toUnit(record, f.tenant.id));
const pools = (f: RaitFixturesJson): readonly RaitPool[] =>
  f.raitPools.map((record) => toPool(record, f.tenant.id));
const poolMembers = (f: RaitFixturesJson): readonly RaitPoolMember[] =>
  f.poolMembers.map((record) => toPoolMember(record, f.tenant.id));
const schedules = (f: RaitFixturesJson): readonly RaitSchedule[] =>
  f.raitSchedules.map((record) => toSchedule(record, f.tenant.id));
const scheduleSlots = (f: RaitFixturesJson): readonly RaitScheduleSlot[] =>
  f.raitScheduleSlots.map((record) => toScheduleSlot(record, f.tenant.id));
const batches = (f: RaitFixturesJson): readonly RaitBatch[] =>
  f.raitBatches.map((record) => toBatch(record, f.tenant.id));
const batchItems = (f: RaitFixturesJson): readonly RaitBatchItem[] =>
  f.raitBatchItems.map((record) => toBatchItem(record, f.tenant.id));
const substituteDuties = (f: RaitFixturesJson): readonly RaitSubstituteDuty[] =>
  f.raitSubstituteDuties.map((record) => toSubstituteDuty(record, f.tenant.id));
const benches = (f: RaitFixturesJson): readonly RaitBench[] =>
  f.raitBenches.map((record) => toBench(record, f.tenant.id));
const clocks = (f: RaitFixturesJson): readonly RaitClock[] =>
  f.clocks.map((record) => toClock(record, f.tenant.id));
const assignments = (f: RaitFixturesJson): readonly RaitAssignment[] =>
  f.assignments.map((record) => toAssignment(record, f.tenant.id));
const impediments = (f: RaitFixturesJson): readonly RaitImpediment[] =>
  f.impediments.map((record) => toImpediment(record, f.tenant.id));
const clockAlerts = (f: RaitFixturesJson): readonly RaitClockAlert[] =>
  f.clockAlerts.map((record) => toClockAlert(record, f.tenant.id));

@Injectable({ providedIn: 'root' })
export class PreviewWorklistClient extends WorklistClient {
  private readonly previewReader = inject(PreviewFixtureReader);
  private readonly previewLog = inject(PreviewActionLog);

  // --- leituras ------------------------------------------------------------------------------

  override listRaitUnit(query: ListQuery = {}): Promise<ListPage<RaitUnit>> {
    return this.previewReader.list(query, UNIT_SPEC, units);
  }

  override getRaitUnit(id: string): Promise<RaitUnit> {
    return this.previewReader.get('raitUnits', id, units);
  }

  override listRaitPool(query: ListQuery = {}): Promise<ListPage<RaitPool>> {
    return this.previewReader.list(query, POOL_SPEC, pools);
  }

  override getRaitPool(id: string): Promise<RaitPool> {
    return this.previewReader.get('raitPools', id, pools);
  }

  override listRaitPoolMember(
    query: ListQuery = {},
  ): Promise<ListPage<RaitPoolMember>> {
    return this.previewReader.list(query, POOL_MEMBER_SPEC, poolMembers);
  }

  override getRaitPoolMember(id: string): Promise<RaitPoolMember> {
    return this.previewReader.get('poolMembers', id, poolMembers);
  }

  override listRaitSchedule(
    query: ListQuery = {},
  ): Promise<ListPage<RaitSchedule>> {
    return this.previewReader.list(query, SCHEDULE_SPEC, schedules);
  }

  override getRaitSchedule(id: string): Promise<RaitSchedule> {
    return this.previewReader.get('raitSchedules', id, schedules);
  }

  override listRaitScheduleSlot(
    query: ListQuery = {},
  ): Promise<ListPage<RaitScheduleSlot>> {
    return this.previewReader.list(query, SCHEDULE_SLOT_SPEC, scheduleSlots);
  }

  override getRaitScheduleSlot(id: string): Promise<RaitScheduleSlot> {
    return this.previewReader.get('raitScheduleSlots', id, scheduleSlots);
  }

  override listRaitBatch(query: ListQuery = {}): Promise<ListPage<RaitBatch>> {
    return this.previewReader.list(query, BATCH_SPEC, batches);
  }

  override getRaitBatch(id: string): Promise<RaitBatch> {
    return this.previewReader.get('raitBatches', id, batches);
  }

  override listRaitBatchItem(
    query: ListQuery = {},
  ): Promise<ListPage<RaitBatchItem>> {
    return this.previewReader.list(query, BATCH_ITEM_SPEC, batchItems);
  }

  override getRaitBatchItem(id: string): Promise<RaitBatchItem> {
    return this.previewReader.get('raitBatchItems', id, batchItems);
  }

  override listRaitAssignment(
    query: ListQuery = {},
  ): Promise<ListPage<RaitAssignment>> {
    return this.previewReader.list(query, ASSIGNMENT_SPEC, assignments);
  }

  override getRaitAssignment(id: string): Promise<RaitAssignment> {
    return this.previewReader.get('assignments', id, assignments);
  }

  override listRaitImpediment(
    query: ListQuery = {},
  ): Promise<ListPage<RaitImpediment>> {
    return this.previewReader.list(query, IMPEDIMENT_SPEC, impediments);
  }

  override getRaitImpediment(id: string): Promise<RaitImpediment> {
    return this.previewReader.get('impediments', id, impediments);
  }

  override listRaitSubstituteDuty(
    query: ListQuery = {},
  ): Promise<ListPage<RaitSubstituteDuty>> {
    return this.previewReader.list(
      query,
      SUBSTITUTE_DUTY_SPEC,
      substituteDuties,
    );
  }

  override getRaitSubstituteDuty(id: string): Promise<RaitSubstituteDuty> {
    return this.previewReader.get('raitSubstituteDuties', id, substituteDuties);
  }

  override listRaitBench(query: ListQuery = {}): Promise<ListPage<RaitBench>> {
    return this.previewReader.list(query, BENCH_SPEC, benches);
  }

  override getRaitBench(id: string): Promise<RaitBench> {
    return this.previewReader.get('raitBenches', id, benches);
  }

  override listRaitClock(query: ListQuery = {}): Promise<ListPage<RaitClock>> {
    return this.previewReader.list(query, CLOCK_SPEC, clocks);
  }

  override getRaitClock(id: string): Promise<RaitClock> {
    return this.previewReader.get('clocks', id, clocks);
  }

  override listRaitClockAlert(
    query: ListQuery = {},
  ): Promise<ListPage<RaitClockAlert>> {
    return this.previewReader.list(query, CLOCK_ALERT_SPEC, clockAlerts);
  }

  override getRaitClockAlert(id: string): Promise<RaitClockAlert> {
    return this.previewReader.get('clockAlerts', id, clockAlerts);
  }

  // --- comandos (contrato §6: registra a string M8 e delega; o cliente real lança) ------------

  override claimNext(
    ...args: Parameters<WorklistClient['claimNext']>
  ): ReturnType<WorklistClient['claimNext']> {
    this.previewLog.record('rait-case:claim-next');
    return super.claimNext(...args);
  }

  override openBatch(
    ...args: Parameters<WorklistClient['openBatch']>
  ): ReturnType<WorklistClient['openBatch']> {
    this.previewLog.record('rait-batch:open');
    return super.openBatch(...args);
  }

  override drawBatch(
    ...args: Parameters<WorklistClient['drawBatch']>
  ): ReturnType<WorklistClient['drawBatch']> {
    this.previewLog.record('rait-batch:draw');
    return super.drawBatch(...args);
  }

  override approveBatch(
    ...args: Parameters<WorklistClient['approveBatch']>
  ): ReturnType<WorklistClient['approveBatch']> {
    this.previewLog.record('rait-batch:approve');
    return super.approveBatch(...args);
  }

  override acceptBatchItem(
    ...args: Parameters<WorklistClient['acceptBatchItem']>
  ): ReturnType<WorklistClient['acceptBatchItem']> {
    this.previewLog.record('rait-batch:accept');
    return super.acceptBatchItem(...args);
  }

  override impedeBatchItem(
    ...args: Parameters<WorklistClient['impedeBatchItem']>
  ): ReturnType<WorklistClient['impedeBatchItem']> {
    this.previewLog.record('rait-batch:impede');
    return super.impedeBatchItem(...args);
  }

  override reassign(
    ...args: Parameters<WorklistClient['reassign']>
  ): ReturnType<WorklistClient['reassign']> {
    this.previewLog.record('rait-assignment:reassign');
    return super.reassign(...args);
  }

  override declareImpediment(
    ...args: Parameters<WorklistClient['declareImpediment']>
  ): ReturnType<WorklistClient['declareImpediment']> {
    this.previewLog.record('rait-impediment:declare');
    return super.declareImpediment(...args);
  }

  override registerSuspicion(
    ...args: Parameters<WorklistClient['registerSuspicion']>
  ): ReturnType<WorklistClient['registerSuspicion']> {
    this.previewLog.record('rait-impediment:suspicion');
    return super.registerSuspicion(...args);
  }

  override publishSchedule(
    ...args: Parameters<WorklistClient['publishSchedule']>
  ): ReturnType<WorklistClient['publishSchedule']> {
    this.previewLog.record('rait-schedule:publish');
    return super.publishSchedule(...args);
  }

  override registerMandate(
    ...args: Parameters<WorklistClient['registerMandate']>
  ): ReturnType<WorklistClient['registerMandate']> {
    this.previewLog.record('rait-member:mandate');
    return super.registerMandate(...args);
  }

  override constituteUnit(
    ...args: Parameters<WorklistClient['constituteUnit']>
  ): ReturnType<WorklistClient['constituteUnit']> {
    this.previewLog.record('rait-unit:constitute');
    return super.constituteUnit(...args);
  }

  override activateUnit(
    ...args: Parameters<WorklistClient['activateUnit']>
  ): ReturnType<WorklistClient['activateUnit']> {
    this.previewLog.record('rait-unit:activate');
    return super.activateUnit(...args);
  }

  override acknowledgeClockAlert(
    ...args: Parameters<WorklistClient['acknowledgeClockAlert']>
  ): ReturnType<WorklistClient['acknowledgeClockAlert']> {
    this.previewLog.record('rait-clock:acknowledge-alert');
    return super.acknowledgeClockAlert(...args);
  }

  override decideImpediment(
    ...args: Parameters<WorklistClient['decideImpediment']>
  ): ReturnType<WorklistClient['decideImpediment']> {
    this.previewLog.record('rait-impediment:decide');
    return super.decideImpediment(...args);
  }

  override updatePool(
    ...args: Parameters<WorklistClient['updatePool']>
  ): ReturnType<WorklistClient['updatePool']> {
    this.previewLog.record('rait-pool:update');
    return super.updatePool(...args);
  }
}
