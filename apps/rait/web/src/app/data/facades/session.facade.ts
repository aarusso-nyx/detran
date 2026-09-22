// SessionFacade (contrato CTG-0002b §4.2/§4.3; M9): módulo colegiado — distinta de
// `core/session.facade.ts` (`RaitSessionFacade`, claims STYNX). Leituras por `SessionClient`,
// `WorklistClient` e `CaseClient` em slots com cache/TTL; joins por id (`getRaitCase`) ou por
// lista filtrada, sempre na ordem recebida ([RN-RAIT-141]); "member=me" (ficha 030) sem fonte
// de identidade → sem filtro por membro (OD-R12-021); joins leem a primeira página do cliente
// (≤ 50; OD-R12-018). SSE (tabela §4.2): `session.changed` → `sessoes`, `sessao` do
// `sessionId`; `agenda-item.changed` → `sessao` do `sessionId`, `vistas`, `pautaCandidatos`;
// `batch.changed` → `lotes`, `lote` do `batchId`, `relatoria`; `clock.flag-changed` →
// `pautaCandidatos`, `extraordinaria`. 20 comandos M8 até R-0007 CTG-0004.
import { Injectable, computed, inject, signal } from '@angular/core';
import type { RaitStreamEvent } from '../../core/sse.service';
import { CaseClient } from '../api/case.client';
import { SessionClient } from '../api/session.client';
import { WorklistClient } from '../api/worklist.client';
import { RaitClock } from '../clock';
import type {
  CommandBody,
  CreateRaitAttendanceDto,
  CreateRaitBatchDto,
  CreateRaitMinutesDto,
  CreateRaitSessionDto,
  CreateRaitSubstituteDutyDto,
  CreateRaitVoteDto,
  ListPage,
  ListQuery,
  RaitAgendaItem,
  RaitAttendance,
  RaitBatch,
  RaitBatchItem,
  RaitCase,
  RaitClock as RaitClockResource,
  RaitDeclineKind,
  RaitJudgingBody,
  RaitMinutes,
  RaitSession,
  RaitSubstituteDuty,
  RaitVote,
} from '../models';
import type { BatchBundle, SessionBundle } from './bundles';
import { createCommandRunner, type CommandOutcome } from './command';
import { createListFacade } from './list.facade';
import { createReadStore, type ReadStore } from './read-store';
import {
  batchIdOf,
  bindStream,
  refreshIfLoaded,
  sessionIdOf,
  type RefreshableSlot,
} from './stream';

const READY_FOR_DECISION = 'PRONTO_P_DECISAO';
const DISTRIBUTED = 'DISTRIBUIDO';
const CRITICAL_FLAG = 'CRITICO';

function mergeFilter(
  query: ListQuery,
  filtro: Readonly<Record<string, string>>,
): ListQuery {
  return { ...query, filtro: { ...filtro, ...(query.filtro ?? {}) } };
}

function pageOf<T>(items: readonly T[], base: ListPage<unknown>): ListPage<T> {
  return {
    items,
    total: items.length,
    page: base.page,
    pageSize: base.pageSize,
  };
}

function invalidateAndRefresh(
  slot: RefreshableSlot & { invalidate(): void },
): void {
  if (slot.key() === null) return;
  slot.invalidate();
  refreshIfLoaded(slot);
}

function isPresent<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

@Injectable({ providedIn: 'root' })
export class SessionFacade {
  private readonly sessions = inject(SessionClient);
  private readonly worklist = inject(WorklistClient);
  private readonly cases = inject(CaseClient);
  private readonly clock = inject(RaitClock);

  readonly sessoes = createListFacade<RaitSession>(
    (query) => this.sessions.listRaitSession(query),
    this.clock,
  );
  readonly sessao: ReadStore<SessionBundle> = createReadStore<SessionBundle>(
    this.clock,
  );
  readonly lotes = createListFacade<RaitBatch>(
    (query) => this.loadBatchesPage(query),
    this.clock,
  );
  readonly lote: ReadStore<BatchBundle> = createReadStore<BatchBundle>(
    this.clock,
  );
  readonly relatoria = createListFacade<RaitBatchItem>(
    (query) => this.loadRapporteurItemsPage(query),
    this.clock,
  );
  readonly pautaCandidatos = createListFacade<RaitCase>(
    (query) => this.loadAgendaCandidatesPage(query),
    this.clock,
  );
  readonly vistas = createListFacade<RaitAgendaItem>(
    (query) => this.loadViewsPage(query),
    this.clock,
  );
  readonly extraordinaria = createListFacade<RaitClockResource>(
    (query) => this.loadCriticalClocksPage(query),
    this.clock,
  );
  readonly semRelator = createListFacade<RaitCase>(
    (query) => this.cases.listRaitCase(query),
    this.clock,
  );
  readonly itemDoCaso: ReadStore<RaitAgendaItem | null> =
    createReadStore<RaitAgendaItem | null>(this.clock);
  readonly suplentes = createListFacade<RaitSubstituteDuty>(
    (query) => this.worklist.listRaitSubstituteDuty(query),
    this.clock,
  );
  readonly command = createCommandRunner();

  private readonly candidateClocks = signal<
    ReadonlyMap<string, readonly RaitClockResource[]>
  >(new Map());
  private readonly criticalCases = signal<ReadonlyMap<string, RaitCase>>(
    new Map(),
  );
  /** Relógios por `case_id` dos `pautaCandidatos` (bandeiras; ficha 032). */
  readonly pautaCandidatosRelogios = computed(() => this.candidateClocks());
  /** Casos (instância do órgão) dos relógios de `extraordinaria` (ficha 038). */
  readonly extraordinariaCasos = computed(() => this.criticalCases());

  constructor() {
    bindStream({
      types: [
        'session.changed',
        'agenda-item.changed',
        'batch.changed',
        'clock.flag-changed',
      ],
      onEvent: (event) => this.onStreamEvent(event),
      slots: [
        this.sessoes,
        this.sessao,
        this.lotes,
        this.lote,
        this.relatoria,
        this.pautaCandidatos,
        this.vistas,
        this.extraordinaria,
        this.semRelator,
        this.itemDoCaso,
        this.suplentes,
      ],
    });
  }

  // --- leituras (§4.3) -------------------------------------------------------------------

  loadSessions(orgao: RaitJudgingBody, query: ListQuery = {}): Promise<void> {
    return this.sessoes.load(mergeFilter(query, { judging_body: orgao }));
  }

  loadSession(sessionId: string): Promise<void> {
    return this.sessao.load(sessionId, () => this.readSessionBundle(sessionId));
  }

  loadBatches(orgao: RaitJudgingBody, query: ListQuery = {}): Promise<void> {
    return this.lotes.load(mergeFilter(query, { instance: orgao }));
  }

  loadBatch(batchId: string): Promise<void> {
    return this.lote.load(batchId, () => this.readBatchBundle(batchId));
  }

  loadRapporteurItems(orgao: RaitJudgingBody): Promise<void> {
    return this.relatoria.load({ filtro: { instance: orgao } });
  }

  loadAgendaCandidates(orgao: RaitJudgingBody): Promise<void> {
    return this.pautaCandidatos.load({
      filtro: { state: READY_FOR_DECISION, instance: orgao },
    });
  }

  loadViews(orgao: RaitJudgingBody): Promise<void> {
    return this.vistas.load({ filtro: { judging_body: orgao } });
  }

  loadCriticalClocks(orgao: RaitJudgingBody): Promise<void> {
    return this.extraordinaria.load({
      filtro: { flag: CRITICAL_FLAG, instance: orgao },
    });
  }

  loadUnassigned(orgao: RaitJudgingBody): Promise<void> {
    return this.semRelator.load({
      filtro: { instance: orgao, state: DISTRIBUTED },
    });
  }

  /** Ficha 031: primeiro item de pauta não retirado do caso, ou `null`. */
  loadAgendaItemOfCase(caseId: string): Promise<void> {
    return this.itemDoCaso.load(
      caseId,
      async () => {
        const page = await this.sessions.listRaitAgendaItem({
          filtro: { case_id: caseId },
        });
        return page.items.find((item) => !item.withdrawn) ?? null;
      },
      { emptyWhen: (value) => value === null },
    );
  }

  loadSubstituteDuties(sessionId: string): Promise<void> {
    return this.suplentes.load({ filtro: { session_id: sessionId } });
  }

  private async readSessionBundle(sessionId: string): Promise<SessionBundle> {
    const filtro = { session_id: sessionId };
    const [session, items, attendance, benches, minutes] = await Promise.all([
      this.sessions.getRaitSession(sessionId),
      this.sessions.listRaitAgendaItem({ filtro }),
      this.sessions.listRaitAttendance({ filtro }),
      this.worklist.listRaitBench({ filtro }),
      this.sessions.listRaitMinutes({ filtro }),
    ]);
    const votePages = await Promise.all(
      items.items.map((item) =>
        this.sessions.listRaitVote({ filtro: { agenda_item_id: item.id } }),
      ),
    );
    const cases = await this.casesById(items.items.map((item) => item.case_id));
    return {
      session,
      items: items.items,
      attendance: attendance.items,
      votes: votePages.flatMap((page) => page.items),
      bench: benches.items[0] ?? null,
      minutes: minutes.items[0] ?? null,
      cases,
    };
  }

  private async readBatchBundle(batchId: string): Promise<BatchBundle> {
    const [batch, items] = await Promise.all([
      this.worklist.getRaitBatch(batchId),
      this.worklist.listRaitBatchItem({ filtro: { batch_id: batchId } }),
    ]);
    const caseIds = [...new Set(items.items.map((item) => item.case_id))];
    const [cases, impedimentPages] = await Promise.all([
      this.casesById(caseIds),
      Promise.all(
        caseIds.map((caseId) =>
          this.worklist.listRaitImpediment({ filtro: { case_id: caseId } }),
        ),
      ),
    ]);
    return {
      batch,
      items: items.items,
      impediments: impedimentPages.flatMap((page) => page.items),
      cases,
    };
  }

  /** `listRaitPool filtro { instance: orgao }` → `listRaitBatch filtro { pool_id }`. */
  private async loadBatchesPage(
    query: ListQuery,
  ): Promise<ListPage<RaitBatch>> {
    const { instance, ...filtro } = query.filtro ?? {};
    const pools = await this.worklist.listRaitPool({
      filtro: { instance: instance ?? '' },
    });
    const pool = pools.items[0] ?? null;
    const page = await this.worklist.listRaitBatch({
      ...query,
      filtro: { ...filtro, ...(pool ? { pool_id: pool.id } : {}) },
    });
    return pool === null ? pageOf([], page) : page;
  }

  /** Ficha 030: lotes do órgão → itens de cada lote (ordem recebida). */
  private async loadRapporteurItemsPage(
    query: ListQuery,
  ): Promise<ListPage<RaitBatchItem>> {
    const batches = await this.loadBatchesPage(query);
    const pages = await Promise.all(
      batches.items.map((batch) =>
        this.worklist.listRaitBatchItem({ filtro: { batch_id: batch.id } }),
      ),
    );
    return pageOf(
      pages.flatMap((page) => page.items),
      batches,
    );
  }

  /** Ficha 032: candidatos à pauta + relógios por caso (bandeiras). */
  private async loadAgendaCandidatesPage(
    query: ListQuery,
  ): Promise<ListPage<RaitCase>> {
    const page = await this.cases.listRaitCase(query);
    const clockPages = await Promise.all(
      page.items.map((item) =>
        this.worklist.listRaitClock({ filtro: { case_id: item.id } }),
      ),
    );
    this.candidateClocks.set(
      new Map(
        page.items.map((item, index) => [item.id, clockPages[index].items]),
      ),
    );
    return page;
  }

  /** Ficha 037: sessões do órgão → itens com pedido de vista. */
  private async loadViewsPage(
    query: ListQuery,
  ): Promise<ListPage<RaitAgendaItem>> {
    const sessions = await this.sessions.listRaitSession(query);
    const pages = await Promise.all(
      sessions.items.map((session) =>
        this.sessions.listRaitAgendaItem({
          filtro: { session_id: session.id },
        }),
      ),
    );
    return pageOf(
      pages
        .flatMap((page) => page.items)
        .filter((item) => isPresent(item.view_requested_by)),
      sessions,
    );
  }

  /** Ficha 038 (fila F-J-3): relógios CRITICO + join caso da instância do órgão. */
  private async loadCriticalClocksPage(
    query: ListQuery,
  ): Promise<ListPage<RaitClockResource>> {
    const { instance, ...filtro } = query.filtro ?? {};
    const [clocks, cases] = await Promise.all([
      this.worklist.listRaitClock({ ...query, filtro }),
      this.cases.listRaitCase({ filtro: { instance: instance ?? '' } }),
    ]);
    const byId = new Map(cases.items.map((item) => [item.id, item]));
    this.criticalCases.set(byId);
    return pageOf(
      clocks.items.filter((item) => byId.has(item.case_id)),
      clocks,
    );
  }

  private async casesById(
    ids: readonly string[],
  ): Promise<ReadonlyMap<string, RaitCase>> {
    const unique = [...new Set(ids)];
    const fetched = await Promise.all(
      unique.map((id) => this.cases.getRaitCase(id)),
    );
    return new Map(fetched.map((item) => [item.id, item]));
  }

  // --- SSE (§4.2) --------------------------------------------------------------------------

  private onStreamEvent(event: RaitStreamEvent): void {
    switch (event.type) {
      case 'session.changed':
        invalidateAndRefresh(this.sessoes);
        this.refreshKeyed(this.sessao, sessionIdOf(event));
        return;
      case 'agenda-item.changed':
        this.refreshKeyed(this.sessao, sessionIdOf(event));
        invalidateAndRefresh(this.vistas);
        invalidateAndRefresh(this.pautaCandidatos);
        return;
      case 'batch.changed':
        invalidateAndRefresh(this.lotes);
        this.refreshKeyed(this.lote, batchIdOf(event));
        invalidateAndRefresh(this.relatoria);
        return;
      case 'clock.flag-changed':
        invalidateAndRefresh(this.pautaCandidatos);
        invalidateAndRefresh(this.extraordinaria);
        return;
      default:
        return;
    }
  }

  private refreshKeyed(slot: ReadStore<unknown>, key: string | null): void {
    if (key === null || slot.key() !== key) return;
    slot.invalidate(key);
    refreshIfLoaded(slot);
  }

  // --- comandos (§3.5; M8) -----------------------------------------------------------------

  openBatch(body: CreateRaitBatchDto): Promise<CommandOutcome<RaitBatch>> {
    return this.command.run('rait-batch:open', () =>
      this.worklist.openBatch(body),
    );
  }

  drawBatch(
    batchId: string,
    body: CommandBody,
  ): Promise<CommandOutcome<RaitBatch>> {
    return this.command.run('rait-batch:draw', () =>
      this.worklist.drawBatch(
        batchId,
        body,
        this.worklist.etagOf('batches', batchId),
      ),
    );
  }

  approveBatch(
    batchId: string,
    body: CommandBody,
  ): Promise<CommandOutcome<RaitBatch>> {
    return this.command.run('rait-batch:approve', () =>
      this.worklist.approveBatch(
        batchId,
        body,
        this.worklist.etagOf('batches', batchId),
      ),
    );
  }

  acceptBatchItem(
    batchId: string,
    caseId: string,
    body: CommandBody,
  ): Promise<CommandOutcome<RaitBatchItem>> {
    return this.command.run('rait-batch:accept', () =>
      this.worklist.acceptBatchItem(
        batchId,
        caseId,
        body,
        this.worklist.etagOf('batches', batchId),
      ),
    );
  }

  impedeBatchItem(
    batchId: string,
    caseId: string,
    body: CommandBody & { decline_kind: RaitDeclineKind },
  ): Promise<CommandOutcome<RaitBatchItem>> {
    return this.command.run('rait-batch:impede', () =>
      this.worklist.impedeBatchItem(
        batchId,
        caseId,
        body,
        this.worklist.etagOf('batches', batchId),
      ),
    );
  }

  registerOpinion(
    agendaItemId: string,
    body: CommandBody &
      Pick<
        RaitAgendaItem,
        'opinion_summary' | 'opinion_analysis' | 'opinion_vote'
      >,
  ): Promise<CommandOutcome<RaitAgendaItem>> {
    return this.command.run('rait-opinion:register', () =>
      this.sessions.registerOpinion(
        agendaItemId,
        body,
        this.sessions.etagOf('agenda-items', agendaItemId),
      ),
    );
  }

  closeAgenda(
    sessionId: string,
    body: CommandBody,
  ): Promise<CommandOutcome<RaitSession>> {
    return this.command.run('rait-agenda:close', () =>
      this.sessions.closeAgenda(
        sessionId,
        body,
        this.sessions.etagOf('sessions', sessionId),
      ),
    );
  }

  openSession(
    sessionId: string,
    body: CommandBody,
  ): Promise<CommandOutcome<RaitSession>> {
    return this.command.run('rait-session:open', () =>
      this.sessions.openSession(
        sessionId,
        body,
        this.sessions.etagOf('sessions', sessionId),
      ),
    );
  }

  adjournSession(
    sessionId: string,
    body: CommandBody,
  ): Promise<CommandOutcome<RaitSession>> {
    return this.command.run('rait-session:adjourn', () =>
      this.sessions.adjournSession(
        sessionId,
        body,
        this.sessions.etagOf('sessions', sessionId),
      ),
    );
  }

  vote(body: CreateRaitVoteDto): Promise<CommandOutcome<RaitVote>> {
    return this.command.run('rait-session:vote', () =>
      this.sessions.vote(body),
    );
  }

  castingVote(body: CreateRaitVoteDto): Promise<CommandOutcome<RaitVote>> {
    return this.command.run('rait-session:casting-vote', () =>
      this.sessions.castingVote(body),
    );
  }

  requestView(
    agendaItemId: string,
    body: CommandBody,
  ): Promise<CommandOutcome<RaitAgendaItem>> {
    return this.command.run('rait-session:view-request', () =>
      this.sessions.requestView(
        agendaItemId,
        body,
        this.sessions.etagOf('agenda-items', agendaItemId),
      ),
    );
  }

  proclaim(
    agendaItemId: string,
    body: CommandBody,
  ): Promise<CommandOutcome<RaitAgendaItem>> {
    return this.command.run('rait-session:proclaim', () =>
      this.sessions.proclaim(
        agendaItemId,
        body,
        this.sessions.etagOf('agenda-items', agendaItemId),
      ),
    );
  }

  generateMinutes(
    body: CreateRaitMinutesDto,
  ): Promise<CommandOutcome<RaitMinutes>> {
    return this.command.run('rait-minutes:generate', () =>
      this.sessions.generateMinutes(body),
    );
  }

  signMinutes(
    minutesId: string,
    body: CommandBody,
  ): Promise<CommandOutcome<RaitMinutes>> {
    return this.command.run('rait-minutes:sign', () =>
      this.sessions.signMinutes(
        minutesId,
        body,
        this.sessions.etagOf('minutes', minutesId),
      ),
    );
  }

  publishMinutes(
    minutesId: string,
    body: CommandBody,
  ): Promise<CommandOutcome<RaitMinutes>> {
    return this.command.run('rait-minutes:publish', () =>
      this.sessions.publishMinutes(
        minutesId,
        body,
        this.sessions.etagOf('minutes', minutesId),
      ),
    );
  }

  confirmAttendance(
    body: CreateRaitAttendanceDto,
  ): Promise<CommandOutcome<RaitAttendance>> {
    return this.command.run('rait-attendance:confirm', () =>
      this.sessions.confirmAttendance(body),
    );
  }

  summonSubstitute(
    body: CreateRaitSubstituteDutyDto,
  ): Promise<CommandOutcome<RaitSubstituteDuty>> {
    return this.command.run('rait-attendance:summon-substitute', () =>
      this.sessions.summonSubstitute(body),
    );
  }

  registerViewVote(
    agendaItemId: string,
    body: CommandBody & Pick<RaitAgendaItem, 'opinion_vote'>,
  ): Promise<CommandOutcome<RaitAgendaItem>> {
    return this.command.run('rait-session:register-view-vote', () =>
      this.sessions.registerViewVote(
        agendaItemId,
        body,
        this.sessions.etagOf('agenda-items', agendaItemId),
      ),
    );
  }

  conveneExtraordinary(
    body: CreateRaitSessionDto,
  ): Promise<CommandOutcome<RaitSession>> {
    return this.command.run('rait-session:convene-extraordinary', () =>
      this.sessions.conveneExtraordinary(body),
    );
  }
}
