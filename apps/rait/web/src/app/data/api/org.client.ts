// OrgClient (contrato CTG-0002b §3.3/§3.5; M9): 8 pares list/get de `BP-INF-RAIT-ORG-001`
// (nome = `operationId`, URL literal do `paths`, ADR-0003) e 8 métodos de comando com corpo M8
// (`RaitCommandUnavailableError`) até R-0007 CTG-0004. Ver `case.client.ts` para as regras comuns.
import { Injectable, inject } from '@angular/core';
import { RaitCommandUnavailableError } from '../../core/error-boundary';
import type { ListQuerySpec } from '../list-query';
import type {
  CommandBody,
  CommandResult,
  CreateRaitExportDto,
  CreateRaitHolidayDto,
  CreateRaitJetonSheetDto,
  CreateRaitSuspensionActDto,
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
} from '../models';
import { EtagStore, type RaitCollection } from './etag-store';
import { RaitHttp } from './rait-http';

const HOLIDAYS_URL = '/v1/inf/rait/holidays';
const SUSPENSION_ACTS_URL = '/v1/inf/rait/suspension-acts';
const JETON_SHEETS_URL = '/v1/inf/rait/jeton-sheets';
const JETON_LINES_URL = '/v1/inf/rait/jeton-lines';
const INCIDENTS_URL = '/v1/inf/rait/incidents';
const QUALITY_SAMPLES_URL = '/v1/inf/rait/quality-samples';
const CAPACITY_PLANS_URL = '/v1/inf/rait/capacity-plans';
const EXPORTS_URL = '/v1/inf/rait/exports';

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

@Injectable({ providedIn: 'root' })
export class OrgClient {
  private readonly http = inject(RaitHttp);
  private readonly etagStore = inject(EtagStore);

  etagOf(collection: RaitCollection, id: string): string | null {
    return this.etagStore.get(collection, id);
  }

  // --- leituras (§3.3) -------------------------------------------------------------------

  listRaitHoliday(query: ListQuery = {}): Promise<ListPage<RaitHoliday>> {
    return this.http.getList(HOLIDAYS_URL, query, HOLIDAY_SPEC);
  }

  getRaitHoliday(id: string): Promise<RaitHoliday> {
    return this.http.getOne(HOLIDAYS_URL, 'holidays', id);
  }

  listRaitSuspensionAct(
    query: ListQuery = {},
  ): Promise<ListPage<RaitSuspensionAct>> {
    return this.http.getList(SUSPENSION_ACTS_URL, query, SUSPENSION_ACT_SPEC);
  }

  getRaitSuspensionAct(id: string): Promise<RaitSuspensionAct> {
    return this.http.getOne(SUSPENSION_ACTS_URL, 'suspension-acts', id);
  }

  listRaitJetonSheet(query: ListQuery = {}): Promise<ListPage<RaitJetonSheet>> {
    return this.http.getList(JETON_SHEETS_URL, query, JETON_SHEET_SPEC);
  }

  getRaitJetonSheet(id: string): Promise<RaitJetonSheet> {
    return this.http.getOne(JETON_SHEETS_URL, 'jeton-sheets', id);
  }

  listRaitJetonLine(query: ListQuery = {}): Promise<ListPage<RaitJetonLine>> {
    return this.http.getList(JETON_LINES_URL, query, JETON_LINE_SPEC);
  }

  getRaitJetonLine(id: string): Promise<RaitJetonLine> {
    return this.http.getOne(JETON_LINES_URL, 'jeton-lines', id);
  }

  listRaitIncident(query: ListQuery = {}): Promise<ListPage<RaitIncident>> {
    return this.http.getList(INCIDENTS_URL, query, INCIDENT_SPEC);
  }

  getRaitIncident(id: string): Promise<RaitIncident> {
    return this.http.getOne(INCIDENTS_URL, 'incidents', id);
  }

  listRaitQualitySample(
    query: ListQuery = {},
  ): Promise<ListPage<RaitQualitySample>> {
    return this.http.getList(QUALITY_SAMPLES_URL, query, QUALITY_SAMPLE_SPEC);
  }

  getRaitQualitySample(id: string): Promise<RaitQualitySample> {
    return this.http.getOne(QUALITY_SAMPLES_URL, 'quality-samples', id);
  }

  listRaitCapacityPlan(
    query: ListQuery = {},
  ): Promise<ListPage<RaitCapacityPlan>> {
    return this.http.getList(CAPACITY_PLANS_URL, query, CAPACITY_PLAN_SPEC);
  }

  getRaitCapacityPlan(id: string): Promise<RaitCapacityPlan> {
    return this.http.getOne(CAPACITY_PLANS_URL, 'capacity-plans', id);
  }

  listRaitExport(query: ListQuery = {}): Promise<ListPage<RaitExport>> {
    return this.http.getList(EXPORTS_URL, query, EXPORT_SPEC);
  }

  getRaitExport(id: string): Promise<RaitExport> {
    return this.http.getOne(EXPORTS_URL, 'exports', id);
  }

  // --- comandos (§3.5; M8 — todos lançam até R-0007 CTG-0004) ----------------------------

  /** §3.5 #38 — `generate:<judging_body>`. */
  async generateJetonSheet(
    _body: CreateRaitJetonSheetDto,
  ): Promise<CommandResult<RaitJetonSheet>> {
    // todo(R-0007 CTG-0004): ligar ao cliente gerado de BP-INF-RAIT-ORG-001.commands
    throw new RaitCommandUnavailableError('rait-jeton:generate');
  }

  /** §3.5 #39 — `approve:<sheetId>`. */
  async approveJetonSheet(
    _sheetId: string,
    _body: CommandBody,
    _ifMatch: string | null,
  ): Promise<CommandResult<RaitJetonSheet>> {
    // todo(R-0007 CTG-0004): ligar ao cliente gerado de BP-INF-RAIT-ORG-001.commands
    throw new RaitCommandUnavailableError('rait-jeton:approve');
  }

  /** §3.5 #44 — `create:<starts_on>`. */
  async createSuspensionAct(
    _body: CreateRaitSuspensionActDto,
  ): Promise<CommandResult<RaitSuspensionAct>> {
    // todo(R-0007 CTG-0004): ligar ao cliente gerado de BP-INF-RAIT-ORG-001.commands
    throw new RaitCommandUnavailableError('rait-suspension-act:create');
  }

  /** §3.5 #45 — `update:<key>`; sem schema gerado (`PUT /parameters/{key}` inexistente). */
  async updateParameter(
    _key: string,
    _body: CommandBody & { value: unknown; effective_from: string },
    _ifMatch: string | null,
  ): Promise<CommandResult<unknown>> {
    // todo(R-0007 CTG-0004): ligar ao cliente gerado de BP-INF-RAIT-ORG-001.commands
    throw new RaitCommandUnavailableError('rait-parameter:update');
  }

  /** §3.5 #46 — `create:<requested_by>`. */
  async createExport(
    _body: CreateRaitExportDto,
  ): Promise<CommandResult<RaitExport>> {
    // todo(R-0007 CTG-0004): ligar ao cliente gerado de BP-INF-RAIT-ORG-001.commands
    throw new RaitCommandUnavailableError('rait-export:create');
  }

  /** §3.5 #56 (ficha; OD-R12-027) — `publish:<planId>`. */
  async publishCapacityPlan(
    _planId: string,
    _body: CommandBody,
    _ifMatch: string | null,
  ): Promise<CommandResult<RaitCapacityPlan>> {
    // todo(R-0007 CTG-0004): ligar ao cliente gerado de BP-INF-RAIT-ORG-001.commands
    throw new RaitCommandUnavailableError('rait-capacity-plan:publish');
  }

  /** §3.5 #57 (ficha; OD-R12-027) — `review:<sampleId>`. */
  async reviewQualitySample(
    _sampleId: string,
    _body: CommandBody &
      Pick<RaitQualitySample, 'finding_kind' | 'finding_note' | 'systemic'>,
    _ifMatch: string | null,
  ): Promise<CommandResult<RaitQualitySample>> {
    // todo(R-0007 CTG-0004): ligar ao cliente gerado de BP-INF-RAIT-ORG-001.commands
    throw new RaitCommandUnavailableError('rait-quality-sample:review');
  }

  /** §3.5 #64 (ficha 063; OD-R12-027) — `update:<holiday_on>` (criação em lote). */
  async updateCalendar(
    _body: CreateRaitHolidayDto[],
  ): Promise<CommandResult<RaitHoliday[]>> {
    // todo(R-0007 CTG-0004): ligar ao cliente gerado de BP-INF-RAIT-ORG-001.commands
    throw new RaitCommandUnavailableError('rait-calendar:update');
  }
}
