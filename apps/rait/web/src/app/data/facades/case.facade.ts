// CaseFacade (contrato CTG-0002b §4.2/§4.3; M9): módulo caso (11 abas) e autoridade/provimentos.
// Leituras por `CaseClient`/`WorklistClient` em slots com cache/TTL (`createReadStore`,
// `createListFacade`); invalidação por SSE: `case.changed` → slots do `caseId`;
// `assignment.changed`/`clock.flag-changed` → `caso`/`relogios` do `caseId` (tabela §4.2).
// Comandos: mesmo nome e argumentos do cliente (§3.5), `ifMatch` lido de `client.etagOf`, todos
// M8 (`RaitCommandUnavailableError`) até R-0007 CTG-0004. Nenhum prazo/ordem calculado aqui
// ([RN-RAIT-005], [RN-RAIT-141]); `provimentos` é um join de leituras CRUD (dados, não regra).
import { Injectable, computed, inject, signal } from '@angular/core';
import type { RaitStreamEvent } from '../../core/sse.service';
import { CaseClient } from '../api/case.client';
import { WorklistClient } from '../api/worklist.client';
import { RaitClock } from '../clock';
import type {
  CommandBody,
  CreateRaitAdmissibilityDto,
  CreateRaitDecisionDto,
  CreateRaitDocumentDto,
  CreateRaitDraftDto,
  CreateRaitImpedimentDto,
  CreateRaitInquiryDto,
  ListPage,
  ListQuery,
  RaitAdmissibility,
  RaitCase,
  RaitCaseEvent,
  RaitClock as RaitClockResource,
  RaitCommunication,
  RaitDeadline,
  RaitDecision,
  RaitDocument,
  RaitDraft,
  RaitImpediment,
  RaitInquiry,
  RaitNonAdmissionReason,
  RaitParty,
} from '../models';
import { createCommandRunner, type CommandOutcome } from './command';
import { createListFacade, type ListFacade } from './list.facade';
import { createReadStore } from './read-store';
import { bindStream, caseIdOf, refreshIfLoaded } from './stream';

const CASE_ID_FIELD = 'case_id';
/** Ficha 027: recursos providos na JARI, comunicados (`outcome=provido`). */
const PROVIDED_APPEALS_FILTER: Readonly<Record<string, string>> = {
  instance: 'jari',
  state: 'COMUNICADO',
};
const PROVIDED_DECISION_KIND = 'provido';
const APPEAL_TIMER_CODE = 'T-R2';

function withCase(caseId: string): ListQuery {
  return { filtro: { [CASE_ID_FIELD]: caseId } };
}

function loadedForCase<T>(list: ListFacade<T>, caseId: string): boolean {
  return list.key() !== null && list.query().filtro?.[CASE_ID_FIELD] === caseId;
}

@Injectable({ providedIn: 'root' })
export class CaseFacade {
  private readonly cases = inject(CaseClient);
  private readonly worklist = inject(WorklistClient);
  private readonly clock = inject(RaitClock);

  readonly caso = createReadStore<RaitCase>(this.clock);
  readonly partes = createListFacade<RaitParty>(
    (query) => this.cases.listRaitParty(query),
    this.clock,
  );
  readonly prazos = createListFacade<RaitDeadline>(
    (query) => this.cases.listRaitDeadline(query),
    this.clock,
  );
  readonly relogios = createListFacade<RaitClockResource>(
    (query) => this.worklist.listRaitClock(query),
    this.clock,
  );
  readonly documentos = createListFacade<RaitDocument>(
    (query) => this.cases.listRaitDocument(query),
    this.clock,
  );
  readonly diligencias = createListFacade<RaitInquiry>(
    (query) => this.cases.listRaitInquiry(query),
    this.clock,
  );
  readonly minutas = createListFacade<RaitDraft>(
    (query) => this.cases.listRaitDraft(query),
    this.clock,
  );
  readonly admissibilidade = createListFacade<RaitAdmissibility>(
    (query) => this.cases.listRaitAdmissibility(query),
    this.clock,
  );
  readonly comunicacoes = createListFacade<RaitCommunication>(
    (query) => this.cases.listRaitCommunication(query),
    this.clock,
  );
  readonly eventos = createListFacade<RaitCaseEvent>(
    (query) => this.cases.listRaitCaseEvent(query),
    this.clock,
  );
  readonly impedimentos = createListFacade<RaitImpediment>(
    (query) => this.worklist.listRaitImpediment(query),
    this.clock,
  );
  readonly decisao = createListFacade<RaitDecision>(
    (query) => this.cases.listRaitDecision(query),
    this.clock,
  );

  private readonly providedDecisions = signal<
    ReadonlyMap<string, RaitDecision>
  >(new Map());
  private readonly appealDeadlines = signal<ReadonlyMap<string, RaitDeadline>>(
    new Map(),
  );
  /** Ficha 027: casos COMUNICADO da JARI com decisão `provido` (join `decisao`). */
  readonly provimentos = createListFacade<RaitCase>(
    (query) => this.loadProvidedAppealsPage(query),
    this.clock,
  );
  /** Decisão `provido` por `case_id` dos `provimentos`. */
  readonly provimentosDecisao = computed(() => this.providedDecisions());
  /** Prazo `T-R2` por `case_id` dos `provimentos` (só o que o servidor calculou). */
  readonly provimentosPrazo = computed(() => this.appealDeadlines());

  readonly command = createCommandRunner();

  private readonly caseLists: readonly ListFacade<unknown>[] = [
    this.partes,
    this.prazos,
    this.relogios,
    this.documentos,
    this.diligencias,
    this.minutas,
    this.admissibilidade,
    this.comunicacoes,
    this.eventos,
    this.impedimentos,
    this.decisao,
  ];

  constructor() {
    bindStream({
      types: ['case.changed', 'assignment.changed', 'clock.flag-changed'],
      onEvent: (event) => this.onStreamEvent(event),
      slots: [this.caso, ...this.caseLists, this.provimentos],
    });
  }

  // --- leituras (§4.3) -------------------------------------------------------------------

  loadCase(caseId: string): Promise<void> {
    return this.caso.load(caseId, () => this.cases.getRaitCase(caseId));
  }

  loadParties(caseId: string): Promise<void> {
    return this.partes.load(withCase(caseId));
  }

  loadDeadlines(caseId: string): Promise<void> {
    return this.prazos.load(withCase(caseId));
  }

  loadClocks(caseId: string): Promise<void> {
    return this.relogios.load(withCase(caseId));
  }

  loadDocuments(caseId: string): Promise<void> {
    return this.documentos.load(withCase(caseId));
  }

  loadInquiries(caseId: string): Promise<void> {
    return this.diligencias.load(withCase(caseId));
  }

  loadDrafts(caseId: string): Promise<void> {
    return this.minutas.load(withCase(caseId));
  }

  loadAdmissibility(caseId: string): Promise<void> {
    return this.admissibilidade.load(withCase(caseId));
  }

  loadCommunications(caseId: string): Promise<void> {
    return this.comunicacoes.load(withCase(caseId));
  }

  loadEvents(caseId: string): Promise<void> {
    return this.eventos.load(withCase(caseId));
  }

  loadImpediments(caseId: string): Promise<void> {
    return this.impedimentos.load(withCase(caseId));
  }

  loadDecisions(caseId: string): Promise<void> {
    return this.decisao.load(withCase(caseId));
  }

  loadProvidedAppeals(query: ListQuery = {}): Promise<void> {
    return this.provimentos.load({
      ...query,
      filtro: { ...PROVIDED_APPEALS_FILTER, ...(query.filtro ?? {}) },
    });
  }

  /** Resolver do layout de `/casos/:id` (ficha 006): caso + partes + relógios + prazos. */
  async loadCaseBundle(caseId: string): Promise<void> {
    await Promise.all([
      this.loadCase(caseId),
      this.loadParties(caseId),
      this.loadClocks(caseId),
      this.loadDeadlines(caseId),
    ]);
  }

  private async loadProvidedAppealsPage(
    query: ListQuery,
  ): Promise<ListPage<RaitCase>> {
    const [cases, decisions, deadlines] = await Promise.all([
      this.cases.listRaitCase({ ...query, page: 1, pageSize: undefined }),
      this.cases.listRaitDecision({
        filtro: { decision_kind: PROVIDED_DECISION_KIND },
      }),
      this.cases.listRaitDeadline({
        filtro: { timer_code: APPEAL_TIMER_CODE },
      }),
    ]);
    const decisionByCase = new Map<string, RaitDecision>();
    for (const decision of decisions.items) {
      if (!decisionByCase.has(decision.case_id)) {
        decisionByCase.set(decision.case_id, decision);
      }
    }
    const deadlineByCase = new Map<string, RaitDeadline>();
    for (const deadline of deadlines.items) {
      if (!deadlineByCase.has(deadline.case_id)) {
        deadlineByCase.set(deadline.case_id, deadline);
      }
    }
    this.providedDecisions.set(decisionByCase);
    this.appealDeadlines.set(deadlineByCase);
    return pageOf(
      cases.items.filter((item) => decisionByCase.has(item.id)),
      query,
    );
  }

  // --- SSE (§4.2) --------------------------------------------------------------------------

  private onStreamEvent(event: RaitStreamEvent): void {
    const caseId = caseIdOf(event);
    if (caseId === null) return;
    if (event.type === 'case.changed') {
      this.refreshCase(caseId);
      for (const list of this.caseLists) this.refreshList(list, caseId);
      if (this.provimentos.key() !== null) {
        this.provimentos.invalidate();
        refreshIfLoaded(this.provimentos);
      }
      return;
    }
    this.refreshCase(caseId);
    if (event.type === 'clock.flag-changed')
      this.refreshList(this.relogios, caseId);
  }

  private refreshCase(caseId: string): void {
    if (this.caso.key() !== caseId) return;
    this.caso.invalidate(caseId);
    void this.caso.refresh();
  }

  private refreshList(list: ListFacade<unknown>, caseId: string): void {
    if (!loadedForCase(list, caseId)) return;
    list.invalidate();
    void list.refresh();
  }

  // --- comandos (§3.5; M8) -----------------------------------------------------------------

  triage(
    caseId: string,
    body: CreateRaitAdmissibilityDto[],
  ): Promise<CommandOutcome<RaitAdmissibility[]>> {
    return this.command.run('rait-case:triage', () =>
      this.cases.triage(caseId, body, this.cases.etagOf('cases', caseId)),
    );
  }

  admit(caseId: string, body: CommandBody): Promise<CommandOutcome<RaitCase>> {
    return this.command.run('rait-case:admit', () =>
      this.cases.admit(caseId, body, this.cases.etagOf('cases', caseId)),
    );
  }

  reject(
    caseId: string,
    body: CommandBody & { non_admission_reason: RaitNonAdmissionReason },
  ): Promise<CommandOutcome<RaitCase>> {
    return this.command.run('rait-case:reject', () =>
      this.cases.reject(caseId, body, this.cases.etagOf('cases', caseId)),
    );
  }

  openInquiry(
    caseId: string,
    body: CreateRaitInquiryDto,
  ): Promise<CommandOutcome<RaitInquiry>> {
    return this.command.run('rait-case:open-inquiry', () =>
      this.cases.openInquiry(caseId, body, this.cases.etagOf('cases', caseId)),
    );
  }

  answerInquiry(
    inquiryId: string,
    body: CommandBody,
  ): Promise<CommandOutcome<RaitInquiry>> {
    return this.command.run('rait-case:answer', () =>
      this.cases.answerInquiry(
        inquiryId,
        body,
        this.cases.etagOf('inquiries', inquiryId),
      ),
    );
  }

  extendInquiry(
    inquiryId: string,
    body: CommandBody,
  ): Promise<CommandOutcome<RaitInquiry>> {
    return this.command.run('rait-case:extend', () =>
      this.cases.extendInquiry(
        inquiryId,
        body,
        this.cases.etagOf('inquiries', inquiryId),
      ),
    );
  }

  submitDraft(
    caseId: string,
    body: CreateRaitDraftDto,
  ): Promise<CommandOutcome<RaitDraft>> {
    return this.command.run('rait-case:submit-draft', () =>
      this.cases.submitDraft(caseId, body, this.cases.etagOf('cases', caseId)),
    );
  }

  signDecision(
    caseId: string,
    body: CreateRaitDecisionDto,
  ): Promise<CommandOutcome<RaitDecision>> {
    return this.command.run('rait-decision:sign', () =>
      this.cases.signDecision(caseId, body, this.cases.etagOf('cases', caseId)),
    );
  }

  returnDraft(
    caseId: string,
    body: CommandBody & { return_guidance: string },
  ): Promise<CommandOutcome<RaitDraft>> {
    return this.command.run('rait-decision:return-draft', () =>
      this.cases.returnDraft(caseId, body, this.cases.etagOf('cases', caseId)),
    );
  }

  attachOfficialDocument(
    caseId: string,
    body: CreateRaitDocumentDto,
  ): Promise<CommandOutcome<RaitDocument>> {
    return this.command.run('rait-document:attach-official', () =>
      this.cases.attachOfficialDocument(caseId, body),
    );
  }

  declareImpediment(
    body: CreateRaitImpedimentDto,
  ): Promise<CommandOutcome<RaitImpediment>> {
    return this.command.run('rait-impediment:declare', () =>
      this.worklist.declareImpediment(body),
    );
  }

  registerSuspicion(
    body: CreateRaitImpedimentDto,
  ): Promise<CommandOutcome<RaitImpediment>> {
    return this.command.run('rait-impediment:suspicion', () =>
      this.worklist.registerSuspicion(body),
    );
  }

  decideImpediment(
    impedimentId: string,
    body: CommandBody & { decided_by: string },
  ): Promise<CommandOutcome<RaitImpediment>> {
    return this.command.run('rait-impediment:decide', () =>
      this.worklist.decideImpediment(
        impedimentId,
        body,
        this.worklist.etagOf('impediments', impedimentId),
      ),
    );
  }

  authorityDecide(
    caseId: string,
    body: CommandBody,
  ): Promise<CommandOutcome<RaitCase>> {
    return this.command.run('rait-appeal:authority-decide', () =>
      this.cases.authorityDecide(
        caseId,
        body,
        this.cases.etagOf('cases', caseId),
      ),
    );
  }

  waive(caseId: string, body: CommandBody): Promise<CommandOutcome<RaitCase>> {
    return this.command.run('rait-appeal:waive', () =>
      this.cases.waive(caseId, body, this.cases.etagOf('cases', caseId)),
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

/** Página a partir de itens já estreitados por join (sem reordenar). */
export function pageOf<T>(items: readonly T[], query: ListQuery): ListPage<T> {
  const pageSize = query.pageSize ?? items.length;
  const page = Math.max(1, query.page ?? 1);
  const start = (page - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    total: items.length,
    page,
    pageSize,
  };
}
