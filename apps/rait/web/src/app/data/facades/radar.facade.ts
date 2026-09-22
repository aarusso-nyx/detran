// RadarFacade (contrato CTG-0002b §4.2/§4.3; M9): gestao/radar, gestao/radar/:caseId,
// gestao/incidentes. `radar` = relógios com bandeira ≠ SEM_RISCO (ficha 039 "flag>=ALERTA_N1")
// na ordem recebida ([RN-RAIT-141]) + join caso (`radarCasos`); `drilldown` =
// `RadarCaseBundle` (getRaitCase + clocks/alerts/assignments/events do caso); `incidentes` +
// join relógio (bandeira) e caso (ficha 044). Joins leem a primeira página do cliente (≤ 50;
// OD-R12-018). SSE: `clock.flag-changed` → `radar`, `incidentes`, `drilldown` do `caseId`;
// `assignment.changed` → `drilldown` do `caseId`. Comandos M8 até R-0007 CTG-0004.
import { Injectable, computed, inject, signal } from '@angular/core';
import type { RaitStreamEvent } from '../../core/sse.service';
import { CaseClient } from '../api/case.client';
import { OrgClient } from '../api/org.client';
import { WorklistClient } from '../api/worklist.client';
import { RaitClock } from '../clock';
import type {
  CommandBody,
  ListPage,
  ListQuery,
  RaitAssignment,
  RaitCase,
  RaitClock as RaitClockResource,
  RaitClockAlert,
  RaitIncident,
  RaitReleaseReason,
} from '../models';
import type { RadarCaseBundle } from './bundles';
import { createCommandRunner, type CommandOutcome } from './command';
import { createListFacade } from './list.facade';
import { createReadStore } from './read-store';
import { bindStream, caseIdOf, refreshIfLoaded } from './stream';

const NO_RISK_FLAG = 'SEM_RISCO';

function pageOf<T>(items: readonly T[], base: ListPage<unknown>): ListPage<T> {
  return {
    items,
    total: items.length,
    page: base.page,
    pageSize: base.pageSize,
  };
}

@Injectable({ providedIn: 'root' })
export class RadarFacade {
  private readonly cases = inject(CaseClient);
  private readonly worklist = inject(WorklistClient);
  private readonly org = inject(OrgClient);
  private readonly clock = inject(RaitClock);

  readonly radar = createListFacade<RaitClockResource>(
    (query) => this.loadRadarPage(query),
    this.clock,
  );
  readonly drilldown = createReadStore<RadarCaseBundle>(this.clock);
  readonly incidentes = createListFacade<RaitIncident>(
    (query) => this.loadIncidentsPage(query),
    this.clock,
  );
  readonly command = createCommandRunner();

  private readonly radarCaseMap = signal<ReadonlyMap<string, RaitCase>>(
    new Map(),
  );
  private readonly incidentClockMap = signal<
    ReadonlyMap<string, RaitClockResource>
  >(new Map());
  /** Casos dos relógios do `radar` e dos `incidentes` (join por `case_id`). */
  readonly radarCasos = computed(() => this.radarCaseMap());
  /** Relógios (bandeira) dos `incidentes` (join por `clock_id`). */
  readonly incidentesRelogio = computed(() => this.incidentClockMap());

  constructor() {
    bindStream({
      types: ['clock.flag-changed', 'assignment.changed'],
      onEvent: (event) => this.onStreamEvent(event),
      slots: [this.radar, this.drilldown, this.incidentes],
    });
  }

  // --- leituras (§4.3) -------------------------------------------------------------------

  loadRadar(query: ListQuery = {}): Promise<void> {
    return this.radar.load(query);
  }

  loadDrilldown(caseId: string): Promise<void> {
    return this.drilldown.load(caseId, () => this.readDrilldown(caseId));
  }

  loadIncidents(query: ListQuery = {}): Promise<void> {
    return this.incidentes.load(query);
  }

  private async loadRadarPage(
    query: ListQuery,
  ): Promise<ListPage<RaitClockResource>> {
    const clocks = await this.worklist.listRaitClock(query);
    const items = clocks.items.filter((item) => item.flag !== NO_RISK_FLAG);
    const cases = await this.cases.listRaitCase();
    this.radarCaseMap.set(new Map(cases.items.map((item) => [item.id, item])));
    return pageOf(items, clocks);
  }

  private async readDrilldown(caseId: string): Promise<RadarCaseBundle> {
    const filtro = { case_id: caseId };
    const [item, clocks, alerts, assignments, events] = await Promise.all([
      this.cases.getRaitCase(caseId),
      this.worklist.listRaitClock({ filtro }),
      this.worklist.listRaitClockAlert(),
      this.worklist.listRaitAssignment({ filtro }),
      this.cases.listRaitCaseEvent({ filtro }),
    ]);
    const clockIds = new Set(clocks.items.map((clockItem) => clockItem.id));
    return {
      case: item,
      clocks: clocks.items,
      alerts: alerts.items.filter((alert) => clockIds.has(alert.clock_id)),
      assignments: assignments.items,
      events: events.items,
    };
  }

  private async loadIncidentsPage(
    query: ListQuery,
  ): Promise<ListPage<RaitIncident>> {
    const incidents = await this.org.listRaitIncident(query);
    const [clocks, cases] = await Promise.all([
      this.worklist.listRaitClock(),
      this.cases.listRaitCase(),
    ]);
    this.incidentClockMap.set(
      new Map(clocks.items.map((item) => [item.id, item])),
    );
    this.radarCaseMap.set(new Map(cases.items.map((item) => [item.id, item])));
    return incidents;
  }

  // --- SSE (§4.2) --------------------------------------------------------------------------

  private onStreamEvent(event: RaitStreamEvent): void {
    const caseId = caseIdOf(event);
    if (caseId !== null && this.drilldown.key() === caseId) {
      this.drilldown.invalidate(caseId);
      refreshIfLoaded(this.drilldown);
    }
    if (event.type !== 'clock.flag-changed') return;
    for (const slot of [this.radar, this.incidentes]) {
      if (slot.key() === null) continue;
      slot.invalidate();
      refreshIfLoaded(slot);
    }
  }

  // --- comandos (§3.5; M8) -----------------------------------------------------------------

  reassign(
    assignmentId: string,
    body: CommandBody & {
      release_reason: RaitReleaseReason;
      member_id: string;
    },
  ): Promise<CommandOutcome<RaitAssignment>> {
    return this.command.run('rait-assignment:reassign', () =>
      this.worklist.reassign(
        assignmentId,
        body,
        this.worklist.etagOf('assignments', assignmentId),
      ),
    );
  }

  acknowledgeClockAlert(
    alertId: string,
    body: CommandBody,
  ): Promise<CommandOutcome<RaitClockAlert>> {
    return this.command.run('rait-clock:acknowledge-alert', () =>
      this.worklist.acknowledgeClockAlert(
        alertId,
        body,
        this.worklist.etagOf('clock-alerts', alertId),
      ),
    );
  }

  declareExtinction(
    caseId: string,
    body: CommandBody,
  ): Promise<CommandOutcome<RaitCase>> {
    return this.command.run('rait-extinction:declare', () =>
      this.cases.declareExtinction(
        caseId,
        body,
        this.cases.etagOf('cases', caseId),
      ),
    );
  }
}
