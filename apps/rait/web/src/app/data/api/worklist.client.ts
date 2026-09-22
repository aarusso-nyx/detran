// WorklistClient (contrato CTG-0002b §3.3/§3.5; M9): 13 pares list/get de
// `BP-INF-RAIT-WORKLIST-001` (nome = `operationId`, URL literal do `paths`, ADR-0003) e 16
// métodos de comando com corpo M8 (`RaitCommandUnavailableError`) até R-0007 CTG-0004. Ver
// `case.client.ts` para as regras comuns.
import { Injectable, inject } from '@angular/core';
import { RaitCommandUnavailableError } from '../../core/error-boundary';
import type { ListQuerySpec } from '../list-query';
import type {
  CommandBody,
  CommandResult,
  CreateRaitBatchDto,
  CreateRaitImpedimentDto,
  CreateRaitPoolMemberDto,
  CreateRaitScheduleDto,
  CreateRaitUnitDto,
  ListPage,
  ListQuery,
  RaitAssignment,
  RaitBatch,
  RaitBatchItem,
  RaitBench,
  RaitClock,
  RaitClockAlert,
  RaitDeclineKind,
  RaitImpediment,
  RaitPool,
  RaitPoolMember,
  RaitReleaseReason,
  RaitSchedule,
  RaitScheduleSlot,
  RaitSubstituteDuty,
  RaitUnit,
} from '../models';
import { EtagStore, type RaitCollection } from './etag-store';
import { RaitHttp } from './rait-http';

const UNITS_URL = '/v1/inf/rait/units';
const POOLS_URL = '/v1/inf/rait/pools';
const POOL_MEMBERS_URL = '/v1/inf/rait/pool-members';
const SCHEDULES_URL = '/v1/inf/rait/schedules';
const SCHEDULE_SLOTS_URL = '/v1/inf/rait/schedule-slots';
const BATCHES_URL = '/v1/inf/rait/batches';
const BATCH_ITEMS_URL = '/v1/inf/rait/batch-items';
const ASSIGNMENTS_URL = '/v1/inf/rait/assignments';
const IMPEDIMENTS_URL = '/v1/inf/rait/impediments';
const SUBSTITUTE_DUTIES_URL = '/v1/inf/rait/substitute-duties';
const BENCHES_URL = '/v1/inf/rait/benches';
const CLOCKS_URL = '/v1/inf/rait/clocks';
const CLOCK_ALERTS_URL = '/v1/inf/rait/clock-alerts';

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

@Injectable({ providedIn: 'root' })
export class WorklistClient {
  private readonly http = inject(RaitHttp);
  private readonly etagStore = inject(EtagStore);

  etagOf(collection: RaitCollection, id: string): string | null {
    return this.etagStore.get(collection, id);
  }

  // --- leituras (§3.3) -------------------------------------------------------------------

  listRaitUnit(query: ListQuery = {}): Promise<ListPage<RaitUnit>> {
    return this.http.getList(UNITS_URL, query, UNIT_SPEC);
  }

  getRaitUnit(id: string): Promise<RaitUnit> {
    return this.http.getOne(UNITS_URL, 'units', id);
  }

  listRaitPool(query: ListQuery = {}): Promise<ListPage<RaitPool>> {
    return this.http.getList(POOLS_URL, query, POOL_SPEC);
  }

  getRaitPool(id: string): Promise<RaitPool> {
    return this.http.getOne(POOLS_URL, 'pools', id);
  }

  listRaitPoolMember(query: ListQuery = {}): Promise<ListPage<RaitPoolMember>> {
    return this.http.getList(POOL_MEMBERS_URL, query, POOL_MEMBER_SPEC);
  }

  getRaitPoolMember(id: string): Promise<RaitPoolMember> {
    return this.http.getOne(POOL_MEMBERS_URL, 'pool-members', id);
  }

  listRaitSchedule(query: ListQuery = {}): Promise<ListPage<RaitSchedule>> {
    return this.http.getList(SCHEDULES_URL, query, SCHEDULE_SPEC);
  }

  getRaitSchedule(id: string): Promise<RaitSchedule> {
    return this.http.getOne(SCHEDULES_URL, 'schedules', id);
  }

  listRaitScheduleSlot(
    query: ListQuery = {},
  ): Promise<ListPage<RaitScheduleSlot>> {
    return this.http.getList(SCHEDULE_SLOTS_URL, query, SCHEDULE_SLOT_SPEC);
  }

  getRaitScheduleSlot(id: string): Promise<RaitScheduleSlot> {
    return this.http.getOne(SCHEDULE_SLOTS_URL, 'schedule-slots', id);
  }

  listRaitBatch(query: ListQuery = {}): Promise<ListPage<RaitBatch>> {
    return this.http.getList(BATCHES_URL, query, BATCH_SPEC);
  }

  getRaitBatch(id: string): Promise<RaitBatch> {
    return this.http.getOne(BATCHES_URL, 'batches', id);
  }

  listRaitBatchItem(query: ListQuery = {}): Promise<ListPage<RaitBatchItem>> {
    return this.http.getList(BATCH_ITEMS_URL, query, BATCH_ITEM_SPEC);
  }

  getRaitBatchItem(id: string): Promise<RaitBatchItem> {
    return this.http.getOne(BATCH_ITEMS_URL, 'batch-items', id);
  }

  listRaitAssignment(query: ListQuery = {}): Promise<ListPage<RaitAssignment>> {
    return this.http.getList(ASSIGNMENTS_URL, query, ASSIGNMENT_SPEC);
  }

  getRaitAssignment(id: string): Promise<RaitAssignment> {
    return this.http.getOne(ASSIGNMENTS_URL, 'assignments', id);
  }

  listRaitImpediment(query: ListQuery = {}): Promise<ListPage<RaitImpediment>> {
    return this.http.getList(IMPEDIMENTS_URL, query, IMPEDIMENT_SPEC);
  }

  getRaitImpediment(id: string): Promise<RaitImpediment> {
    return this.http.getOne(IMPEDIMENTS_URL, 'impediments', id);
  }

  listRaitSubstituteDuty(
    query: ListQuery = {},
  ): Promise<ListPage<RaitSubstituteDuty>> {
    return this.http.getList(
      SUBSTITUTE_DUTIES_URL,
      query,
      SUBSTITUTE_DUTY_SPEC,
    );
  }

  getRaitSubstituteDuty(id: string): Promise<RaitSubstituteDuty> {
    return this.http.getOne(SUBSTITUTE_DUTIES_URL, 'substitute-duties', id);
  }

  listRaitBench(query: ListQuery = {}): Promise<ListPage<RaitBench>> {
    return this.http.getList(BENCHES_URL, query, BENCH_SPEC);
  }

  getRaitBench(id: string): Promise<RaitBench> {
    return this.http.getOne(BENCHES_URL, 'benches', id);
  }

  listRaitClock(query: ListQuery = {}): Promise<ListPage<RaitClock>> {
    return this.http.getList(CLOCKS_URL, query, CLOCK_SPEC);
  }

  getRaitClock(id: string): Promise<RaitClock> {
    return this.http.getOne(CLOCKS_URL, 'clocks', id);
  }

  listRaitClockAlert(query: ListQuery = {}): Promise<ListPage<RaitClockAlert>> {
    return this.http.getList(CLOCK_ALERTS_URL, query, CLOCK_ALERT_SPEC);
  }

  getRaitClockAlert(id: string): Promise<RaitClockAlert> {
    return this.http.getOne(CLOCK_ALERTS_URL, 'clock-alerts', id);
  }

  // --- comandos (§3.5; M8 — todos lançam até R-0007 CTG-0004) ----------------------------

  /** §3.5 #2 — `claim-next:<poolId>`. `ifMatch` opcional: o pool é o alvo, não o recurso
   * criado (a atribuição nasce do comando); o spec C-2B-12/24 chama sem o terceiro argumento. */
  async claimNext(
    _poolId: string,
    _body: CommandBody,
    _ifMatch: string | null = null,
  ): Promise<CommandResult<RaitAssignment>> {
    // todo(R-0007 CTG-0004): ligar ao cliente gerado de BP-INF-RAIT-WORKLIST-001.commands
    throw new RaitCommandUnavailableError('rait-case:claim-next');
  }

  /** §3.5 #14 — `open:<pool_id>`. */
  async openBatch(
    _body: CreateRaitBatchDto,
  ): Promise<CommandResult<RaitBatch>> {
    // todo(R-0007 CTG-0004): ligar ao cliente gerado de BP-INF-RAIT-WORKLIST-001.commands
    throw new RaitCommandUnavailableError('rait-batch:open');
  }

  /** §3.5 #15 — `draw:<batchId>`. */
  async drawBatch(
    _batchId: string,
    _body: CommandBody,
    _ifMatch: string | null,
  ): Promise<CommandResult<RaitBatch>> {
    // todo(R-0007 CTG-0004): ligar ao cliente gerado de BP-INF-RAIT-WORKLIST-001.commands
    throw new RaitCommandUnavailableError('rait-batch:draw');
  }

  /** §3.5 #16 — `approve:<batchId>`. */
  async approveBatch(
    _batchId: string,
    _body: CommandBody,
    _ifMatch: string | null,
  ): Promise<CommandResult<RaitBatch>> {
    // todo(R-0007 CTG-0004): ligar ao cliente gerado de BP-INF-RAIT-WORKLIST-001.commands
    throw new RaitCommandUnavailableError('rait-batch:approve');
  }

  /** §3.5 #17 — `accept:<batchId>/<caseId>`. */
  async acceptBatchItem(
    _batchId: string,
    _caseId: string,
    _body: CommandBody,
    _ifMatch: string | null,
  ): Promise<CommandResult<RaitBatchItem>> {
    // todo(R-0007 CTG-0004): ligar ao cliente gerado de BP-INF-RAIT-WORKLIST-001.commands
    throw new RaitCommandUnavailableError('rait-batch:accept');
  }

  /** §3.5 #18 — `impede:<batchId>/<caseId>`. */
  async impedeBatchItem(
    _batchId: string,
    _caseId: string,
    _body: CommandBody & { decline_kind: RaitDeclineKind },
    _ifMatch: string | null,
  ): Promise<CommandResult<RaitBatchItem>> {
    // todo(R-0007 CTG-0004): ligar ao cliente gerado de BP-INF-RAIT-WORKLIST-001.commands
    throw new RaitCommandUnavailableError('rait-batch:impede');
  }

  /** §3.5 #33 — `reassign:<assignmentId>`. */
  async reassign(
    _assignmentId: string,
    _body: CommandBody & {
      release_reason: RaitReleaseReason;
      member_id: string;
    },
    _ifMatch: string | null,
  ): Promise<CommandResult<RaitAssignment>> {
    // todo(R-0007 CTG-0004): ligar ao cliente gerado de BP-INF-RAIT-WORKLIST-001.commands
    throw new RaitCommandUnavailableError('rait-assignment:reassign');
  }

  /** §3.5 #34 — `declare:<case_id>`. */
  async declareImpediment(
    _body: CreateRaitImpedimentDto,
  ): Promise<CommandResult<RaitImpediment>> {
    // todo(R-0007 CTG-0004): ligar ao cliente gerado de BP-INF-RAIT-WORKLIST-001.commands
    throw new RaitCommandUnavailableError('rait-impediment:declare');
  }

  /** §3.5 #35 — `suspicion:<case_id>`. */
  async registerSuspicion(
    _body: CreateRaitImpedimentDto,
  ): Promise<CommandResult<RaitImpediment>> {
    // todo(R-0007 CTG-0004): ligar ao cliente gerado de BP-INF-RAIT-WORKLIST-001.commands
    throw new RaitCommandUnavailableError('rait-impediment:suspicion');
  }

  /** §3.5 #36 — `publish:<pool_id>`. */
  async publishSchedule(
    _body: CreateRaitScheduleDto,
  ): Promise<CommandResult<RaitSchedule>> {
    // todo(R-0007 CTG-0004): ligar ao cliente gerado de BP-INF-RAIT-WORKLIST-001.commands
    throw new RaitCommandUnavailableError('rait-schedule:publish');
  }

  /** §3.5 #37 — `mandate:<person_id>`. */
  async registerMandate(
    _body: CreateRaitPoolMemberDto,
  ): Promise<CommandResult<RaitPoolMember>> {
    // todo(R-0007 CTG-0004): ligar ao cliente gerado de BP-INF-RAIT-WORKLIST-001.commands
    throw new RaitCommandUnavailableError('rait-member:mandate');
  }

  /** §3.5 #40 — `constitute:<name>`. */
  async constituteUnit(
    _body: CreateRaitUnitDto,
  ): Promise<CommandResult<RaitUnit>> {
    // todo(R-0007 CTG-0004): ligar ao cliente gerado de BP-INF-RAIT-WORKLIST-001.commands
    throw new RaitCommandUnavailableError('rait-unit:constitute');
  }

  /** §3.5 #41 — `activate:<unitId>`. */
  async activateUnit(
    _unitId: string,
    _body: CommandBody,
    _ifMatch: string | null,
  ): Promise<CommandResult<RaitUnit>> {
    // todo(R-0007 CTG-0004): ligar ao cliente gerado de BP-INF-RAIT-WORKLIST-001.commands
    throw new RaitCommandUnavailableError('rait-unit:activate');
  }

  /** §3.5 #42 — `acknowledge-alert:<alertId>`. */
  async acknowledgeClockAlert(
    _alertId: string,
    _body: CommandBody,
    _ifMatch: string | null,
  ): Promise<CommandResult<RaitClockAlert>> {
    // todo(R-0007 CTG-0004): ligar ao cliente gerado de BP-INF-RAIT-WORKLIST-001.commands
    throw new RaitCommandUnavailableError('rait-clock:acknowledge-alert');
  }

  /** §3.5 #50 (ficha; OD-R12-027) — `decide:<impedimentId>`. */
  async decideImpediment(
    _impedimentId: string,
    _body: CommandBody & { decided_by: string },
    _ifMatch: string | null,
  ): Promise<CommandResult<RaitImpediment>> {
    // todo(R-0007 CTG-0004): ligar ao cliente gerado de BP-INF-RAIT-WORKLIST-001.commands
    throw new RaitCommandUnavailableError('rait-impediment:decide');
  }

  /** §3.5 #55 (ficha; OD-R12-027) — `update:<poolId>`. */
  async updatePool(
    _poolId: string,
    _body: CommandBody & Pick<RaitPool, 'strategy' | 'active'>,
    _ifMatch: string | null,
  ): Promise<CommandResult<RaitPool>> {
    // todo(R-0007 CTG-0004): ligar ao cliente gerado de BP-INF-RAIT-WORKLIST-001.commands
    throw new RaitCommandUnavailableError('rait-pool:update');
  }
}
