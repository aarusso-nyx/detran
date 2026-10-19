import { PreviewStateService } from '../preview-state.service';
import type {
  RaitUnitRead,
  RaitPoolRead,
  RaitPoolMemberRead,
  RaitScheduleRead,
  RaitScheduleSlotRead,
  RaitBatchRead,
  RaitBatchItemRead,
  RaitAssignmentRead,
  RaitImpedimentRead,
  RaitSubstituteDutyRead,
  RaitBenchRead,
  RaitClockRead,
  RaitClockAlertRead,
} from '../../data/api/worklist.client';
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
const UNIT_SPEC: ListQuerySpec<RaitUnitRead> = {
  q: ['name'],
  filtro: ['judging_body', 'state'],
};
const POOL_SPEC: ListQuerySpec<RaitPoolRead> = {
  q: ['name'],
  filtro: ['instance', 'strategy', 'active'],
};
const POOL_MEMBER_SPEC: ListQuerySpec<RaitPoolMemberRead> = {
  q: [],
  filtro: ['pool_id', 'person_id', 'member_role', 'status', 'is_substitute'],
};
const SCHEDULE_SPEC: ListQuerySpec<RaitScheduleRead> = {
  q: [],
  filtro: ['pool_id', 'member_id', 'kind', 'availability'],
};
const SCHEDULE_SLOT_SPEC: ListQuerySpec<RaitScheduleSlotRead> = {
  q: [],
  filtro: ['schedule_id', 'slot_on', 'availability'],
};
const BATCH_SPEC: ListQuerySpec<RaitBatchRead> = {
  q: [],
  filtro: ['pool_id', 'kind', 'state'],
};
const BATCH_ITEM_SPEC: ListQuerySpec<RaitBatchItemRead> = {
  q: [],
  filtro: ['batch_id', 'case_id', 'member_id'],
};
const ASSIGNMENT_SPEC: ListQuerySpec<RaitAssignmentRead> = {
  q: [],
  filtro: ['case_id', 'pool_id', 'member_id', 'active', 'batch_id'],
};
const IMPEDIMENT_SPEC: ListQuerySpec<RaitImpedimentRead> = {
  q: [],
  filtro: ['case_id', 'member_id', 'kind'],
};
const SUBSTITUTE_DUTY_SPEC: ListQuerySpec<RaitSubstituteDutyRead> = {
  q: [],
  filtro: ['session_id', 'member_id'],
};
const BENCH_SPEC: ListQuerySpec<RaitBenchRead> = {
  q: [],
  filtro: ['session_id', 'state'],
};
const CLOCK_SPEC: ListQuerySpec<RaitClockRead> = {
  q: [],
  filtro: ['case_id', 'clock_code', 'flag'],
};
const CLOCK_ALERT_SPEC: ListQuerySpec<RaitClockAlertRead> = {
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
  private readonly projectionState = inject(PreviewStateService);

  /** Fictional display projection only; never a production scope or appointment grant. */
  private projectionPurpose(
    fixtures: RaitFixturesJson,
    caseId?: string | null,
  ): 'S' | 'O' | 'M' | 'J' | 'T' {
    const item = fixtures.cases.find((candidate) => candidate.id === caseId);
    if (item?.archived) return 'S';
    const role = this.projectionState.role();
    if (role === 'rait-manager') return 'O';
    if (role === 'rait-secretary') return 'S';
    if (role === 'rait-analyst') {
      return item &&
        ['PROTOCOLADO', 'TRIAGEM_ADMISSIBILIDADE'].includes(item.state)
        ? 'T'
        : 'M';
    }
    if (role === 'rait-coordinator' || role === 'AUDITOR') return 'M';
    if (
      [
        'rait-rapporteur',
        'rait-chair',
        'rait-signing-authority',
        'rait-central-authority',
      ].includes(role)
    )
      return 'J';
    return 'S';
  }

  private readonly previewReader = inject(PreviewFixtureReader);
  private readonly previewLog = inject(PreviewActionLog);

  // --- leituras ------------------------------------------------------------------------------

  override listRaitUnit(
    query: ListQuery = {},
  ): Promise<ListPage<RaitUnitRead>> {
    return this.previewReader.list(query, UNIT_SPEC, (fixtures) =>
      units(fixtures).map((record) =>
        projectRaitUnit(record, this.projectionPurpose(fixtures, undefined)),
      ),
    );
  }

  override getRaitUnit(id: string): Promise<RaitUnitRead> {
    return this.previewReader.get('raitUnits', id, (fixtures) =>
      units(fixtures).map((record) =>
        projectRaitUnit(record, this.projectionPurpose(fixtures, undefined)),
      ),
    );
  }

  override listRaitPool(
    query: ListQuery = {},
  ): Promise<ListPage<RaitPoolRead>> {
    return this.previewReader.list(query, POOL_SPEC, (fixtures) =>
      pools(fixtures).map((record) =>
        projectRaitPool(record, this.projectionPurpose(fixtures, undefined)),
      ),
    );
  }

  override getRaitPool(id: string): Promise<RaitPoolRead> {
    return this.previewReader.get('raitPools', id, (fixtures) =>
      pools(fixtures).map((record) =>
        projectRaitPool(record, this.projectionPurpose(fixtures, undefined)),
      ),
    );
  }

  override listRaitPoolMember(
    query: ListQuery = {},
  ): Promise<ListPage<RaitPoolMemberRead>> {
    return this.previewReader.list(query, POOL_MEMBER_SPEC, (fixtures) =>
      poolMembers(fixtures).map((record) =>
        projectRaitPoolMember(
          record,
          this.projectionPurpose(fixtures, undefined),
        ),
      ),
    );
  }

  override getRaitPoolMember(id: string): Promise<RaitPoolMemberRead> {
    return this.previewReader.get('poolMembers', id, (fixtures) =>
      poolMembers(fixtures).map((record) =>
        projectRaitPoolMember(
          record,
          this.projectionPurpose(fixtures, undefined),
        ),
      ),
    );
  }

  override listRaitSchedule(
    query: ListQuery = {},
  ): Promise<ListPage<RaitScheduleRead>> {
    return this.previewReader.list(query, SCHEDULE_SPEC, (fixtures) =>
      schedules(fixtures).map((record) =>
        projectRaitSchedule(
          record,
          this.projectionPurpose(fixtures, undefined),
        ),
      ),
    );
  }

  override getRaitSchedule(id: string): Promise<RaitScheduleRead> {
    return this.previewReader.get('raitSchedules', id, (fixtures) =>
      schedules(fixtures).map((record) =>
        projectRaitSchedule(
          record,
          this.projectionPurpose(fixtures, undefined),
        ),
      ),
    );
  }

  override listRaitScheduleSlot(
    query: ListQuery = {},
  ): Promise<ListPage<RaitScheduleSlotRead>> {
    return this.previewReader.list(query, SCHEDULE_SLOT_SPEC, (fixtures) =>
      scheduleSlots(fixtures).map((record) =>
        projectRaitScheduleSlot(
          record,
          this.projectionPurpose(fixtures, undefined),
        ),
      ),
    );
  }

  override getRaitScheduleSlot(id: string): Promise<RaitScheduleSlotRead> {
    return this.previewReader.get('raitScheduleSlots', id, (fixtures) =>
      scheduleSlots(fixtures).map((record) =>
        projectRaitScheduleSlot(
          record,
          this.projectionPurpose(fixtures, undefined),
        ),
      ),
    );
  }

  override listRaitBatch(
    query: ListQuery = {},
  ): Promise<ListPage<RaitBatchRead>> {
    return this.previewReader.list(query, BATCH_SPEC, (fixtures) =>
      batches(fixtures).map((record) =>
        projectRaitBatch(record, this.projectionPurpose(fixtures, undefined)),
      ),
    );
  }

  override getRaitBatch(id: string): Promise<RaitBatchRead> {
    return this.previewReader.get('raitBatches', id, (fixtures) =>
      batches(fixtures).map((record) =>
        projectRaitBatch(record, this.projectionPurpose(fixtures, undefined)),
      ),
    );
  }

  override listRaitBatchItem(
    query: ListQuery = {},
  ): Promise<ListPage<RaitBatchItemRead>> {
    return this.previewReader.list(query, BATCH_ITEM_SPEC, (fixtures) =>
      batchItems(fixtures).map((record) =>
        projectRaitBatchItem(
          record,
          this.projectionPurpose(fixtures, record.case_id),
        ),
      ),
    );
  }

  override getRaitBatchItem(id: string): Promise<RaitBatchItemRead> {
    return this.previewReader.get('raitBatchItems', id, (fixtures) =>
      batchItems(fixtures).map((record) =>
        projectRaitBatchItem(
          record,
          this.projectionPurpose(fixtures, record.case_id),
        ),
      ),
    );
  }

  override listRaitAssignment(
    query: ListQuery = {},
  ): Promise<ListPage<RaitAssignmentRead>> {
    return this.previewReader.list(query, ASSIGNMENT_SPEC, (fixtures) =>
      assignments(fixtures).map((record) =>
        projectRaitAssignment(
          record,
          this.projectionPurpose(fixtures, record.case_id),
        ),
      ),
    );
  }

  override getRaitAssignment(id: string): Promise<RaitAssignmentRead> {
    return this.previewReader.get('assignments', id, (fixtures) =>
      assignments(fixtures).map((record) =>
        projectRaitAssignment(
          record,
          this.projectionPurpose(fixtures, record.case_id),
        ),
      ),
    );
  }

  override listRaitImpediment(
    query: ListQuery = {},
  ): Promise<ListPage<RaitImpedimentRead>> {
    return this.previewReader.list(query, IMPEDIMENT_SPEC, (fixtures) =>
      impediments(fixtures).map((record) =>
        projectRaitImpediment(
          record,
          this.projectionPurpose(fixtures, record.case_id),
        ),
      ),
    );
  }

  override getRaitImpediment(id: string): Promise<RaitImpedimentRead> {
    return this.previewReader.get('impediments', id, (fixtures) =>
      impediments(fixtures).map((record) =>
        projectRaitImpediment(
          record,
          this.projectionPurpose(fixtures, record.case_id),
        ),
      ),
    );
  }

  override listRaitSubstituteDuty(
    query: ListQuery = {},
  ): Promise<ListPage<RaitSubstituteDutyRead>> {
    return this.previewReader.list(query, SUBSTITUTE_DUTY_SPEC, (fixtures) =>
      substituteDuties(fixtures).map((record) =>
        projectRaitSubstituteDuty(
          record,
          this.projectionPurpose(fixtures, undefined),
        ),
      ),
    );
  }

  override getRaitSubstituteDuty(id: string): Promise<RaitSubstituteDutyRead> {
    return this.previewReader.get('raitSubstituteDuties', id, (fixtures) =>
      substituteDuties(fixtures).map((record) =>
        projectRaitSubstituteDuty(
          record,
          this.projectionPurpose(fixtures, undefined),
        ),
      ),
    );
  }

  override listRaitBench(
    query: ListQuery = {},
  ): Promise<ListPage<RaitBenchRead>> {
    return this.previewReader.list(query, BENCH_SPEC, (fixtures) =>
      benches(fixtures).map((record) =>
        projectRaitBench(record, this.projectionPurpose(fixtures, undefined)),
      ),
    );
  }

  override getRaitBench(id: string): Promise<RaitBenchRead> {
    return this.previewReader.get('raitBenches', id, (fixtures) =>
      benches(fixtures).map((record) =>
        projectRaitBench(record, this.projectionPurpose(fixtures, undefined)),
      ),
    );
  }

  override listRaitClock(
    query: ListQuery = {},
  ): Promise<ListPage<RaitClockRead>> {
    return this.previewReader.list(query, CLOCK_SPEC, (fixtures) =>
      clocks(fixtures).map((record) =>
        projectRaitClock(
          record,
          this.projectionPurpose(fixtures, record.case_id),
        ),
      ),
    );
  }

  override getRaitClock(id: string): Promise<RaitClockRead> {
    return this.previewReader.get('clocks', id, (fixtures) =>
      clocks(fixtures).map((record) =>
        projectRaitClock(
          record,
          this.projectionPurpose(fixtures, record.case_id),
        ),
      ),
    );
  }

  override listRaitClockAlert(
    query: ListQuery = {},
  ): Promise<ListPage<RaitClockAlertRead>> {
    return this.previewReader.list(query, CLOCK_ALERT_SPEC, (fixtures) =>
      clockAlerts(fixtures).map((record) =>
        projectRaitClockAlert(
          record,
          this.projectionPurpose(fixtures, undefined),
        ),
      ),
    );
  }

  override getRaitClockAlert(id: string): Promise<RaitClockAlertRead> {
    return this.previewReader.get('clockAlerts', id, (fixtures) =>
      clockAlerts(fixtures).map((record) =>
        projectRaitClockAlert(
          record,
          this.projectionPurpose(fixtures, undefined),
        ),
      ),
    );
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

function projectRaitUnit(
  record: RaitUnit,
  _purpose: 'S' | 'O' | 'M' | 'J' | 'T',
): RaitUnitRead {
  return {
    id: record.id,
    name: record.name,
    judging_body: record.judging_body,
    state: record.state,
    coordinator_member_id: record.coordinator_member_id,
    created_at: record.created_at,
    updated_at: record.updated_at,
  };
}

function projectRaitPool(
  record: RaitPool,
  _purpose: 'S' | 'O' | 'M' | 'J' | 'T',
): RaitPoolRead {
  return {
    id: record.id,
    name: record.name,
    instance: record.instance,
    circuit: record.circuit,
    strategy: record.strategy,
    active: record.active,
    unit_id: record.unit_id,
    priority_policy: record.priority_policy,
    created_at: record.created_at,
    updated_at: record.updated_at,
  };
}

function projectRaitPoolMember(
  record: RaitPoolMember,
  _purpose: 'S' | 'O' | 'M' | 'J' | 'T',
): RaitPoolMemberRead {
  return {
    id: record.id,
    pool_id: record.pool_id,
    person_id: record.person_id,
    member_role: record.member_role,
    status: record.status,
    mandate_starts_on: record.mandate_starts_on,
    mandate_ends_on: record.mandate_ends_on,
    late_opinion_count: record.late_opinion_count,
    unjustified_absence_count: record.unjustified_absence_count,
    is_substitute: record.is_substitute,
    jurisdiction: record.jurisdiction,
    agency_jurisdiction_id: record.agency_jurisdiction_id,
    representation_block: record.representation_block,
    institutional_seat_ref: record.institutional_seat_ref,
    appointment_act_ref: record.appointment_act_ref,
    institutional_valid_from: record.institutional_valid_from,
    institutional_valid_to: record.institutional_valid_to,
    institutional_identity_hash: record.institutional_identity_hash,
    created_at: record.created_at,
    updated_at: record.updated_at,
  };
}

function projectRaitSchedule(
  record: RaitSchedule,
  _purpose: 'S' | 'O' | 'M' | 'J' | 'T',
): RaitScheduleRead {
  return {
    id: record.id,
    pool_id: record.pool_id,
    member_id: record.member_id,
    kind: record.kind,
    period_start: record.period_start,
    period_end: record.period_end,
    availability: record.availability,
    wip_limit: record.wip_limit,
    absence_reason: record.absence_reason,
    published_at: record.published_at,
    published_by: record.published_by,
    version: record.version,
    created_at: record.created_at,
    updated_at: record.updated_at,
  };
}

function projectRaitScheduleSlot(
  record: RaitScheduleSlot,
  _purpose: 'S' | 'O' | 'M' | 'J' | 'T',
): RaitScheduleSlotRead {
  return {
    id: record.id,
    schedule_id: record.schedule_id,
    slot_on: record.slot_on,
    availability: record.availability,
    absence_reason: record.absence_reason,
    created_at: record.created_at,
    updated_at: record.updated_at,
  };
}

function projectRaitBatch(
  record: RaitBatch,
  _purpose: 'S' | 'O' | 'M' | 'J' | 'T',
): RaitBatchRead {
  return {
    id: record.id,
    pool_id: record.pool_id,
    kind: record.kind,
    week_start: record.week_start,
    state: record.state,
    seed: record.seed,
    opened_at: record.opened_at,
    opened_by: record.opened_by,
    drawn_at: record.drawn_at,
    accepted_at: record.accepted_at,
    minutes_document_id: record.minutes_document_id,
    homologated_at: record.homologated_at,
    homologated_by: record.homologated_by,
    version: record.version,
    approval_signature_ref: record.approval_signature_ref,
    approval_receipt_hash: record.approval_receipt_hash,
    approval_verified_at: record.approval_verified_at,
    approval_signer_person_id: record.approval_signer_person_id,
    created_at: record.created_at,
    updated_at: record.updated_at,
  };
}

function projectRaitBatchItem(
  record: RaitBatchItem,
  purpose: 'S' | 'O' | 'M' | 'J' | 'T',
): RaitBatchItemRead {
  if (purpose === 'O')
    return {
      id: record.id,
      case_id: record.case_id,
      batch_id: record.batch_id,
      member_id: record.member_id,
    };
  if (purpose === 'M')
    return {
      id: record.id,
      case_id: record.case_id,
      batch_id: record.batch_id,
      member_id: record.member_id,
    };
  if (purpose === 'J')
    return {
      id: record.id,
      case_id: record.case_id,
      batch_id: record.batch_id,
      member_id: record.member_id,
    };
  return {
    id: record.id,
    case_id: record.case_id,
    batch_id: record.batch_id,
    member_id: record.member_id,
  };
}

function projectRaitAssignment(
  record: RaitAssignment,
  purpose: 'S' | 'O' | 'M' | 'J' | 'T',
): RaitAssignmentRead {
  if (purpose === 'O')
    return {
      id: record.id,
      case_id: record.case_id,
      pool_id: record.pool_id,
      member_id: record.member_id,
      assigned_at: record.assigned_at,
      released_at: record.released_at,
      active: record.active,
      claim_due_at: record.claim_due_at,
      batch_id: record.batch_id,
    };
  if (purpose === 'M')
    return {
      id: record.id,
      case_id: record.case_id,
      pool_id: record.pool_id,
      member_id: record.member_id,
      assigned_at: record.assigned_at,
      released_at: record.released_at,
      active: record.active,
      claim_due_at: record.claim_due_at,
      batch_id: record.batch_id,
      assigned_by: record.assigned_by,
      release_reason: record.release_reason,
    };
  if (purpose === 'J')
    return {
      id: record.id,
      case_id: record.case_id,
      pool_id: record.pool_id,
      member_id: record.member_id,
      assigned_at: record.assigned_at,
      released_at: record.released_at,
      active: record.active,
      claim_due_at: record.claim_due_at,
      batch_id: record.batch_id,
      assigned_by: record.assigned_by,
      release_reason: record.release_reason,
    };
  return {
    id: record.id,
    case_id: record.case_id,
    pool_id: record.pool_id,
    member_id: record.member_id,
    assigned_at: record.assigned_at,
    released_at: record.released_at,
    active: record.active,
    claim_due_at: record.claim_due_at,
    batch_id: record.batch_id,
  };
}

function projectRaitImpediment(
  record: RaitImpediment,
  _purpose: 'S' | 'O' | 'M' | 'J' | 'T',
): RaitImpedimentRead {
  return {
    id: record.id,
    case_id: record.case_id,
    member_id: record.member_id,
    basis: record.basis,
    declared_at: record.declared_at,
    kind: record.kind,
    legal_basis: record.legal_basis,
    decided_by: record.decided_by,
    created_at: record.created_at,
    updated_at: record.updated_at,
  };
}

function projectRaitSubstituteDuty(
  record: RaitSubstituteDuty,
  _purpose: 'S' | 'O' | 'M' | 'J' | 'T',
): RaitSubstituteDutyRead {
  return {
    id: record.id,
    session_id: record.session_id,
    member_id: record.member_id,
    designated_at: record.designated_at,
    designated_by: record.designated_by,
    convened_at: record.convened_at,
    created_at: record.created_at,
    updated_at: record.updated_at,
  };
}

function projectRaitBench(
  record: RaitBench,
  _purpose: 'S' | 'O' | 'M' | 'J' | 'T',
): RaitBenchRead {
  return {
    id: record.id,
    session_id: record.session_id,
    state: record.state,
    confirmed_count: record.confirmed_count,
    parity_observed: record.parity_observed,
    confirmed_at: record.confirmed_at,
    insufficient_at: record.insufficient_at,
    created_at: record.created_at,
    updated_at: record.updated_at,
  };
}

function projectRaitClock(
  record: RaitClock,
  purpose: 'S' | 'O' | 'M' | 'J' | 'T',
): RaitClockRead {
  if (purpose === 'O')
    return {
      id: record.id,
      case_id: record.case_id,
      clock_code: record.clock_code,
      started_on: record.started_on,
      ceiling_on: record.ceiling_on,
      flag: record.flag,
      flag_changed_at: record.flag_changed_at,
      last_reset_at: record.last_reset_at,
      legal_basis: record.legal_basis,
    };
  if (purpose === 'M')
    return {
      id: record.id,
      case_id: record.case_id,
      clock_code: record.clock_code,
      started_on: record.started_on,
      ceiling_on: record.ceiling_on,
      flag: record.flag,
      flag_changed_at: record.flag_changed_at,
      last_reset_at: record.last_reset_at,
      legal_basis: record.legal_basis,
    };
  if (purpose === 'J')
    return {
      id: record.id,
      case_id: record.case_id,
      clock_code: record.clock_code,
      started_on: record.started_on,
      ceiling_on: record.ceiling_on,
      flag: record.flag,
      flag_changed_at: record.flag_changed_at,
      last_reset_at: record.last_reset_at,
      legal_basis: record.legal_basis,
    };
  return {
    id: record.id,
    case_id: record.case_id,
    clock_code: record.clock_code,
    started_on: record.started_on,
    ceiling_on: record.ceiling_on,
    flag: record.flag,
    flag_changed_at: record.flag_changed_at,
    last_reset_at: record.last_reset_at,
    legal_basis: record.legal_basis,
  };
}

function projectRaitClockAlert(
  record: RaitClockAlert,
  purpose: 'S' | 'O' | 'M' | 'J' | 'T',
): RaitClockAlertRead {
  if (purpose === 'O')
    return {
      id: record.id,
      clock_id: record.clock_id,
      level: record.level,
      raised_at: record.raised_at,
      acknowledged_at: record.acknowledged_at,
      incident_ref: record.incident_ref,
    };
  if (purpose === 'M')
    return {
      id: record.id,
      clock_id: record.clock_id,
      level: record.level,
      raised_at: record.raised_at,
      acknowledged_at: record.acknowledged_at,
      incident_ref: record.incident_ref,
      notified_role: record.notified_role,
      acknowledged_by: record.acknowledged_by,
    };
  if (purpose === 'J')
    return {
      id: record.id,
      clock_id: record.clock_id,
      level: record.level,
      raised_at: record.raised_at,
      acknowledged_at: record.acknowledged_at,
      incident_ref: record.incident_ref,
      notified_role: record.notified_role,
      acknowledged_by: record.acknowledged_by,
    };
  return {
    id: record.id,
    clock_id: record.clock_id,
    level: record.level,
    raised_at: record.raised_at,
    acknowledged_at: record.acknowledged_at,
    incident_ref: record.incident_ref,
  };
}
