// CaseClient (contrato CTG-0002b §3.3/§3.5; M9): wrapper tipado sobre `RaitHttp` para os 12
// pares list/get de `BP-INF-RAIT-CASE-001` — nome do método = `operationId`, URL literal do
// `paths` (ADR-0003), `ListQuerySpec` da tabela §3.3 — e os 19 métodos de comando cuja
// assinatura o §3.5 fixa. Todo comando lança `RaitCommandUnavailableError('<M8>')` até R-0007
// CTG-0004 (M8): nenhuma requisição, nenhum `Idempotency-Key` (a coluna "chave M17" do §3.5
// diz o `<ato>:<alvo>` reservado). Os `Create*Dto` são os gerados do CRUD (ADR-0007); o contrato
// `.commands` trocará o tipo sem mudar o nome do método.
import { Injectable, inject } from '@angular/core';
import { RaitCommandUnavailableError } from '../../core/error-boundary';
import type { ListQuerySpec } from '../list-query';
import type {
  CommandBody,
  CommandResult,
  CreateRaitAdmissibilityDto,
  CreateRaitCaseDto,
  CreateRaitDecisionDto,
  CreateRaitDocumentDto,
  CreateRaitDraftDto,
  CreateRaitInquiryDto,
  CreateRaitRedirectDto,
  ListPage,
  ListQuery,
  RaitAdmissibility,
  RaitCase,
  RaitCaseEvent,
  RaitCommunication,
  RaitDeadline,
  RaitDecision,
  RaitDocument,
  RaitDraft,
  RaitInquiry,
  RaitNonAdmissionReason,
  RaitParty,
  RaitPendingContent,
  RaitPendingContentOutcome,
  RaitRedirect,
} from '../models';
import { EtagStore, type RaitCollection } from './etag-store';
import { RaitHttp } from './rait-http';

const CASES_URL = '/v1/inf/rait/cases';
const PARTIES_URL = '/v1/inf/rait/parties';
const DOCUMENTS_URL = '/v1/inf/rait/documents';
const PENDING_CONTENTS_URL = '/v1/inf/rait/pending-contents';
const REDIRECTS_URL = '/v1/inf/rait/redirects';
const ADMISSIBILITY_URL = '/v1/inf/rait/admissibility';
const DEADLINES_URL = '/v1/inf/rait/deadlines';
const INQUIRIES_URL = '/v1/inf/rait/inquiries';
const DRAFTS_URL = '/v1/inf/rait/drafts';
const DECISIONS_URL = '/v1/inf/rait/decisions';
const COMMUNICATIONS_URL = '/v1/inf/rait/communications';
const EVENTS_URL = '/v1/inf/rait/events';

const CASE_SPEC: ListQuerySpec<RaitCase> = {
  q: ['protocol_number'],
  filtro: ['state', 'instance', 'archived', 'ait_id', 'unit_id'],
};
const PARTY_SPEC: ListQuerySpec<RaitParty> = {
  q: ['person_name'],
  filtro: ['case_id', 'role'],
};
const DOCUMENT_SPEC: ListQuerySpec<RaitDocument> = {
  q: ['filename'],
  filtro: ['case_id', 'origin', 'kind'],
};
const PENDING_CONTENT_SPEC: ListQuerySpec<RaitPendingContent> = {
  q: [],
  filtro: ['case_id', 'outcome'],
};
const REDIRECT_SPEC: ListQuerySpec<RaitRedirect> = {
  q: ['protocol_number', 'counterpart_agency'],
  filtro: ['case_id', 'direction', 'reason'],
};
const ADMISSIBILITY_SPEC: ListQuerySpec<RaitAdmissibility> = {
  q: [],
  filtro: ['case_id', 'criterion'],
};
const DEADLINE_SPEC: ListQuerySpec<RaitDeadline> = {
  q: [],
  filtro: ['case_id', 'timer_code'],
};
const INQUIRY_SPEC: ListQuerySpec<RaitInquiry> = {
  q: ['subject'],
  filtro: ['case_id', 'addressee', 'outcome'],
};
const DRAFT_SPEC: ListQuerySpec<RaitDraft> = {
  q: [],
  filtro: ['case_id', 'status'],
};
const DECISION_SPEC: ListQuerySpec<RaitDecision> = {
  q: [],
  filtro: ['case_id', 'decision_kind'],
};
const COMMUNICATION_SPEC: ListQuerySpec<RaitCommunication> = {
  q: [],
  filtro: ['case_id', 'channel'],
};
const EVENT_SPEC: ListQuerySpec<RaitCaseEvent> = {
  q: ['event_type'],
  filtro: ['case_id', 'event_type'],
};

@Injectable({ providedIn: 'root' })
export class CaseClient {
  private readonly http = inject(RaitHttp);
  private readonly etagStore = inject(EtagStore);

  etagOf(collection: RaitCollection, id: string): string | null {
    return this.etagStore.get(collection, id);
  }

  // --- leituras (§3.3) -------------------------------------------------------------------

  listRaitCase(query: ListQuery = {}): Promise<ListPage<RaitCase>> {
    return this.http.getList(CASES_URL, query, CASE_SPEC);
  }

  getRaitCase(id: string): Promise<RaitCase> {
    return this.http.getOne(CASES_URL, 'cases', id);
  }

  listRaitParty(query: ListQuery = {}): Promise<ListPage<RaitParty>> {
    return this.http.getList(PARTIES_URL, query, PARTY_SPEC);
  }

  getRaitParty(id: string): Promise<RaitParty> {
    return this.http.getOne(PARTIES_URL, 'parties', id);
  }

  listRaitDocument(query: ListQuery = {}): Promise<ListPage<RaitDocument>> {
    return this.http.getList(DOCUMENTS_URL, query, DOCUMENT_SPEC);
  }

  getRaitDocument(id: string): Promise<RaitDocument> {
    return this.http.getOne(DOCUMENTS_URL, 'documents', id);
  }

  listRaitPendingContent(
    query: ListQuery = {},
  ): Promise<ListPage<RaitPendingContent>> {
    return this.http.getList(PENDING_CONTENTS_URL, query, PENDING_CONTENT_SPEC);
  }

  getRaitPendingContent(id: string): Promise<RaitPendingContent> {
    return this.http.getOne(PENDING_CONTENTS_URL, 'pending-contents', id);
  }

  listRaitRedirect(query: ListQuery = {}): Promise<ListPage<RaitRedirect>> {
    return this.http.getList(REDIRECTS_URL, query, REDIRECT_SPEC);
  }

  getRaitRedirect(id: string): Promise<RaitRedirect> {
    return this.http.getOne(REDIRECTS_URL, 'redirects', id);
  }

  listRaitAdmissibility(
    query: ListQuery = {},
  ): Promise<ListPage<RaitAdmissibility>> {
    return this.http.getList(ADMISSIBILITY_URL, query, ADMISSIBILITY_SPEC);
  }

  getRaitAdmissibility(id: string): Promise<RaitAdmissibility> {
    return this.http.getOne(ADMISSIBILITY_URL, 'admissibility', id);
  }

  listRaitDeadline(query: ListQuery = {}): Promise<ListPage<RaitDeadline>> {
    return this.http.getList(DEADLINES_URL, query, DEADLINE_SPEC);
  }

  getRaitDeadline(id: string): Promise<RaitDeadline> {
    return this.http.getOne(DEADLINES_URL, 'deadlines', id);
  }

  listRaitInquiry(query: ListQuery = {}): Promise<ListPage<RaitInquiry>> {
    return this.http.getList(INQUIRIES_URL, query, INQUIRY_SPEC);
  }

  getRaitInquiry(id: string): Promise<RaitInquiry> {
    return this.http.getOne(INQUIRIES_URL, 'inquiries', id);
  }

  listRaitDraft(query: ListQuery = {}): Promise<ListPage<RaitDraft>> {
    return this.http.getList(DRAFTS_URL, query, DRAFT_SPEC);
  }

  getRaitDraft(id: string): Promise<RaitDraft> {
    return this.http.getOne(DRAFTS_URL, 'drafts', id);
  }

  listRaitDecision(query: ListQuery = {}): Promise<ListPage<RaitDecision>> {
    return this.http.getList(DECISIONS_URL, query, DECISION_SPEC);
  }

  getRaitDecision(id: string): Promise<RaitDecision> {
    return this.http.getOne(DECISIONS_URL, 'decisions', id);
  }

  listRaitCommunication(
    query: ListQuery = {},
  ): Promise<ListPage<RaitCommunication>> {
    return this.http.getList(COMMUNICATIONS_URL, query, COMMUNICATION_SPEC);
  }

  getRaitCommunication(id: string): Promise<RaitCommunication> {
    return this.http.getOne(COMMUNICATIONS_URL, 'communications', id);
  }

  listRaitCaseEvent(query: ListQuery = {}): Promise<ListPage<RaitCaseEvent>> {
    return this.http.getList(EVENTS_URL, query, EVENT_SPEC);
  }

  getRaitCaseEvent(id: string): Promise<RaitCaseEvent> {
    return this.http.getOne(EVENTS_URL, 'events', id);
  }

  // --- comandos (§3.5; M8 — todos lançam até R-0007 CTG-0004) ----------------------------

  /** §3.5 #1 — chave M17 reservada `protocol:<ait_id>`. */
  async protocol(_body: CreateRaitCaseDto): Promise<CommandResult<RaitCase>> {
    // todo(R-0007 CTG-0004): ligar ao cliente gerado de BP-INF-RAIT-CASE-001.commands
    throw new RaitCommandUnavailableError('rait-case:protocol');
  }

  /** §3.5 #3 — `triage:<caseId>`. */
  async triage(
    _caseId: string,
    _body: CreateRaitAdmissibilityDto[],
    _ifMatch: string | null,
  ): Promise<CommandResult<RaitAdmissibility[]>> {
    // todo(R-0007 CTG-0004): ligar ao cliente gerado de BP-INF-RAIT-CASE-001.commands
    throw new RaitCommandUnavailableError('rait-case:triage');
  }

  /** §3.5 #4 — `admit:<caseId>`. */
  async admit(
    _caseId: string,
    _body: CommandBody,
    _ifMatch: string | null,
  ): Promise<CommandResult<RaitCase>> {
    // todo(R-0007 CTG-0004): ligar ao cliente gerado de BP-INF-RAIT-CASE-001.commands
    throw new RaitCommandUnavailableError('rait-case:admit');
  }

  /** §3.5 #5 — `reject:<caseId>`. */
  async reject(
    _caseId: string,
    _body: CommandBody & { non_admission_reason: RaitNonAdmissionReason },
    _ifMatch: string | null,
  ): Promise<CommandResult<RaitCase>> {
    // todo(R-0007 CTG-0004): ligar ao cliente gerado de BP-INF-RAIT-CASE-001.commands
    throw new RaitCommandUnavailableError('rait-case:reject');
  }

  /** §3.5 #6 — `remit-jari:<caseId>`. */
  async remitJari(
    _caseId: string,
    _body: CommandBody,
    _ifMatch: string | null,
  ): Promise<CommandResult<RaitCase>> {
    // todo(R-0007 CTG-0004): ligar ao cliente gerado de BP-INF-RAIT-CASE-001.commands
    throw new RaitCommandUnavailableError('rait-case:remit-jari');
  }

  /** §3.5 #7 — `receive-judging-body:<caseId>`. */
  async receiveJudgingBody(
    _caseId: string,
    _body: CommandBody,
    _ifMatch: string | null,
  ): Promise<CommandResult<RaitCase>> {
    // todo(R-0007 CTG-0004): ligar ao cliente gerado de BP-INF-RAIT-CASE-001.commands
    throw new RaitCommandUnavailableError('rait-case:receive-judging-body');
  }

  /** §3.5 #8 — `open-inquiry:<caseId>`. */
  async openInquiry(
    _caseId: string,
    _body: CreateRaitInquiryDto,
    _ifMatch: string | null,
  ): Promise<CommandResult<RaitInquiry>> {
    // todo(R-0007 CTG-0004): ligar ao cliente gerado de BP-INF-RAIT-CASE-001.commands
    throw new RaitCommandUnavailableError('rait-case:open-inquiry');
  }

  /** §3.5 #9 — `answer:<inquiryId>`. */
  async answerInquiry(
    _inquiryId: string,
    _body: CommandBody,
    _ifMatch: string | null,
  ): Promise<CommandResult<RaitInquiry>> {
    // todo(R-0007 CTG-0004): ligar ao cliente gerado de BP-INF-RAIT-CASE-001.commands
    throw new RaitCommandUnavailableError('rait-case:answer');
  }

  /** §3.5 #10 — `extend:<inquiryId>`. */
  async extendInquiry(
    _inquiryId: string,
    _body: CommandBody,
    _ifMatch: string | null,
  ): Promise<CommandResult<RaitInquiry>> {
    // todo(R-0007 CTG-0004): ligar ao cliente gerado de BP-INF-RAIT-CASE-001.commands
    throw new RaitCommandUnavailableError('rait-case:extend');
  }

  /** §3.5 #11 — `submit-draft:<caseId>`. */
  async submitDraft(
    _caseId: string,
    _body: CreateRaitDraftDto,
    _ifMatch: string | null,
  ): Promise<CommandResult<RaitDraft>> {
    // todo(R-0007 CTG-0004): ligar ao cliente gerado de BP-INF-RAIT-CASE-001.commands
    throw new RaitCommandUnavailableError('rait-case:submit-draft');
  }

  /** §3.5 #12 — `sign:<caseId>`. */
  async signDecision(
    _caseId: string,
    _body: CreateRaitDecisionDto,
    _ifMatch: string | null,
  ): Promise<CommandResult<RaitDecision>> {
    // todo(R-0007 CTG-0004): ligar ao cliente gerado de BP-INF-RAIT-CASE-001.commands
    throw new RaitCommandUnavailableError('rait-decision:sign');
  }

  /** §3.5 #13 — `return-draft:<caseId>`. */
  async returnDraft(
    _caseId: string,
    _body: CommandBody & { return_guidance: string },
    _ifMatch: string | null,
  ): Promise<CommandResult<RaitDraft>> {
    // todo(R-0007 CTG-0004): ligar ao cliente gerado de BP-INF-RAIT-CASE-001.commands
    throw new RaitCommandUnavailableError('rait-decision:return-draft');
  }

  /** §3.5 #30 — `authority-decide:<caseId>`. */
  async authorityDecide(
    _caseId: string,
    _body: CommandBody,
    _ifMatch: string | null,
  ): Promise<CommandResult<RaitCase>> {
    // todo(R-0007 CTG-0004): ligar ao cliente gerado de BP-INF-RAIT-CASE-001.commands
    throw new RaitCommandUnavailableError('rait-appeal:authority-decide');
  }

  /** §3.5 #31 — `waive:<caseId>` (chave condicional, OD-R12-027). */
  async waive(
    _caseId: string,
    _body: CommandBody,
    _ifMatch: string | null,
  ): Promise<CommandResult<RaitCase>> {
    // todo(R-0007 CTG-0004): ligar ao cliente gerado de BP-INF-RAIT-CASE-001.commands
    throw new RaitCommandUnavailableError('rait-appeal:waive');
  }

  /** §3.5 #32 — `withdraw:<caseId>`. */
  async withdraw(
    _caseId: string,
    _body: CommandBody & { withdrawal_document_id: string },
    _ifMatch: string | null,
  ): Promise<CommandResult<RaitCase>> {
    // todo(R-0007 CTG-0004): ligar ao cliente gerado de BP-INF-RAIT-CASE-001.commands
    throw new RaitCommandUnavailableError('rait-case:withdraw');
  }

  /** §3.5 #43 — `declare-extinction:<caseId>`. */
  async declareExtinction(
    _caseId: string,
    _body: CommandBody,
    _ifMatch: string | null,
  ): Promise<CommandResult<RaitCase>> {
    // todo(R-0007 CTG-0004): ligar ao cliente gerado de BP-INF-RAIT-CASE-001.commands
    throw new RaitCommandUnavailableError('rait-extinction:declare');
  }

  /** §3.5 #47 (ficha; OD-R12-027) — `attach-official:<caseId>`; `origin: 'oficio'`. */
  async attachOfficialDocument(
    _caseId: string,
    _body: CreateRaitDocumentDto,
  ): Promise<CommandResult<RaitDocument>> {
    // todo(R-0007 CTG-0004): ligar ao cliente gerado de BP-INF-RAIT-CASE-001.commands
    throw new RaitCommandUnavailableError('rait-document:attach-official');
  }

  /** §3.5 #48 (ficha; OD-R12-027) — `resolve-pending-content:<pendingId>`. */
  async resolvePendingContent(
    _pendingId: string,
    _body: CommandBody & { outcome: RaitPendingContentOutcome },
    _ifMatch: string | null,
  ): Promise<CommandResult<RaitPendingContent>> {
    // todo(R-0007 CTG-0004): ligar ao cliente gerado de BP-INF-RAIT-CASE-001.commands
    throw new RaitCommandUnavailableError('rait-case:resolve-pending-content');
  }

  /** §3.5 #49 (ficha; OD-R12-027) — `redirect:<case_id>`. */
  async redirect(
    _body: CreateRaitRedirectDto,
  ): Promise<CommandResult<RaitRedirect>> {
    // todo(R-0007 CTG-0004): ligar ao cliente gerado de BP-INF-RAIT-CASE-001.commands
    throw new RaitCommandUnavailableError('rait-case:redirect');
  }
}
