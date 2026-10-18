// Adapter de prévia do `CaseClient` (R-0033 TASK-0003; `frontend-preview-mode.md` §2, §6, D-06,
// D-07, D-11, D-15; inventário §2). Leituras: `cases`, `raitPendingContents`, `raitRedirects` e
// `raitDrafts` de `rait-fixtures.json` e, desde A4/A5 (PR #184), `parties`, `documents`,
// `admissibility`, `deadlines`, `inquiries`, `decisions`, `communications` e `caseEvents`,
// mapeadas para os tipos de `data/models` sem inventar campo (D-06: camelCase → snake_case;
// `tenant_id` = tenant da fixture; `@default` do contrato gerado `BP-INF-RAIT-CASE-001`; opcional
// ausente; `created_at`, `opened_at`, `attached_at`, `evaluated_at`, `decided_at` sem coluna na
// seed → `source_pending`, `rait-fixtures.md` §10, A5 item 5). Comandos: registram a string M8
// (contrato §6) e delegam ao cliente real, que lança `RaitCommandUnavailableError` (nunca sucesso).
import { Injectable, inject } from '@angular/core';
import { CaseClient } from '../../data/api/case.client';
import type { ListQuerySpec } from '../../data/list-query';
import type {
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
  RaitParty,
  RaitPendingContent,
  RaitRedirect,
} from '../../data/models';
import { PreviewActionLog } from '../preview-action-log';
import type {
  FixtureAdmissibility,
  FixtureCase,
  FixtureCaseEvent,
  FixtureCommunication,
  FixtureDeadline,
  FixtureDecision,
  FixtureDocument,
  FixtureDraft,
  FixtureInquiry,
  FixtureParty,
  FixturePendingContent,
  FixtureRedirect,
  RaitFixturesJson,
} from '../preview-fixtures';
import {
  PreviewFixtureReader,
  fixtureDateTime,
  sourcePending,
} from './preview-reader';

// `ListQuerySpec` — cópia literal de `data/api/case.client.ts` (constantes privadas do módulo).
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

/** Contrato gerado `RaitCase`: `pending_completion` `@default false`, `version` `@default 1`. */
const CASE_DEFAULT_PENDING_COMPLETION = false;
const CASE_DEFAULT_VERSION = 1;
/** `@default false` de `suspensive_effect` e `archived` quando a linha da seed não os traz. */
const CASE_DEFAULT_FLAG = false;

function toCase(record: FixtureCase, tenantId: string): RaitCase {
  return {
    id: record.id,
    tenant_id: tenantId,
    ait_id: record.aitId,
    origin_case_id: record.originCaseId ?? null,
    protocol_number: record.protocol,
    instance: record.instance,
    circuit: record.circuit,
    state: record.state,
    intake_channel: record.intakeChannel,
    protocolled_at: fixtureDateTime(record.protocolledAt),
    admitted_at: fixtureDateTime(record.admittedAt),
    judge_body_received_at: fixtureDateTime(record.judgeBodyReceivedAt),
    cetran_received_at: fixtureDateTime(record.cetranReceivedAt),
    remitted_at: fixtureDateTime(record.remittedAt),
    decided_at: fixtureDateTime(record.decidedAt),
    communicated_at: fixtureDateTime(record.communicatedAt),
    closed_at: fixtureDateTime(record.closedAt),
    suspensive_effect: record.suspensiveEffect ?? CASE_DEFAULT_FLAG,
    archived: record.archived ?? CASE_DEFAULT_FLAG,
    non_admission_reason: record.nonAdmissionReason ?? null,
    last_movement_at: fixtureDateTime(record.lastMovementAt),
    pending_completion: CASE_DEFAULT_PENDING_COMPLETION,
    version: CASE_DEFAULT_VERSION,
    created_at: sourcePending(),
  };
}

function toPendingContent(
  record: FixturePendingContent,
  tenantId: string,
): RaitPendingContent {
  return {
    id: record.id,
    tenant_id: tenantId,
    case_id: record.caseId,
    missing_items: record.missingItems,
    due_on: record.dueOn,
    opened_at: sourcePending(),
    opened_by: record.openedBy,
    closed_at: fixtureDateTime(record.closedAt),
    outcome: record.outcome,
    created_at: sourcePending(),
  };
}

function toRedirect(record: FixtureRedirect, tenantId: string): RaitRedirect {
  return {
    id: record.id,
    tenant_id: tenantId,
    case_id: record.caseId,
    direction: record.direction,
    reason: record.reason,
    protocol_number: record.protocolNumber,
    ait_number: record.aitNumber,
    counterpart_agency: record.counterpartAgency,
    counterpart_renainf_code: record.counterpartRenainfCode,
    origin_protocolled_on: record.originProtocolledOn,
    deadline_restored: record.deadlineRestored,
    redirected_at: fixtureDateTime(record.redirectedAt),
    redirected_by: record.redirectedBy,
    created_at: sourcePending(),
  };
}

function toDraft(record: FixtureDraft, tenantId: string): RaitDraft {
  return {
    id: record.id,
    tenant_id: tenantId,
    case_id: record.caseId,
    version: record.version,
    author_id: record.authorId,
    document_id: record.documentId ?? null,
    content_hash: record.contentHash,
    status: record.status,
    submitted_at: fixtureDateTime(record.submittedAt),
    returned_at: fixtureDateTime(record.returnedAt),
    return_guidance: record.returnGuidance,
    return_count: record.returnCount,
    created_at: sourcePending(),
  };
}

// `@default` do contrato gerado `BP-INF-RAIT-CASE-001` para colunas que a seed 20 não traz.
/** `RaitParty.representation_verified` `@default false`. */
const PARTY_DEFAULT_REPRESENTATION_VERIFIED = false;
/** `RaitDeadline.extension_count`/`RaitInquiry.extension_count` `@default 0`. */
const DEFAULT_EXTENSION_COUNT = 0;

function toParty(record: FixtureParty, tenantId: string): RaitParty {
  return {
    id: record.id,
    tenant_id: tenantId,
    case_id: record.caseId,
    role: record.role,
    legitimacy_basis: record.legitimacyBasis ?? null,
    person_name: record.personName,
    document_number: record.documentNumber,
    contact_email: record.contactEmail ?? null,
    representation_verified: PARTY_DEFAULT_REPRESENTATION_VERIFIED,
    created_at: sourcePending(),
  };
}

function toDocument(record: FixtureDocument, tenantId: string): RaitDocument {
  return {
    id: record.id,
    tenant_id: tenantId,
    case_id: record.caseId,
    kind: record.kind,
    origin: record.origin,
    storage_key: record.storageKey,
    filename: record.filename,
    content_hash: record.contentHash,
    digitised_from_paper: record.digitisedFromPaper,
    attached_at: sourcePending(),
    attached_by: record.attachedBy ?? null,
    created_at: sourcePending(),
  };
}

function toAdmissibility(
  record: FixtureAdmissibility,
  tenantId: string,
): RaitAdmissibility {
  return {
    id: record.id,
    tenant_id: tenantId,
    case_id: record.caseId,
    criterion: record.criterion,
    verdict: record.verdict,
    reason: record.reason ?? null,
    evaluated_at: sourcePending(),
    evaluated_by: record.evaluatedBy,
    created_at: sourcePending(),
  };
}

function toDeadline(record: FixtureDeadline, tenantId: string): RaitDeadline {
  return {
    id: record.id,
    tenant_id: tenantId,
    case_id: record.caseId,
    timer_code: record.timerCode,
    start_basis: record.startBasis,
    started_on: record.startedOn,
    raw_due_on: record.rawDueOn,
    due_on: record.dueOn,
    business_days: record.businessDays,
    extension_count: DEFAULT_EXTENSION_COUNT,
    legal_basis: record.legalBasis,
    created_at: sourcePending(),
  };
}

function toInquiry(record: FixtureInquiry, tenantId: string): RaitInquiry {
  return {
    id: record.id,
    tenant_id: tenantId,
    case_id: record.caseId,
    addressee: record.addressee,
    subject: record.subject,
    requested_at: fixtureDateTime(record.requestedAt),
    requested_by: record.requestedBy,
    due_on: record.dueOn,
    extension_count: DEFAULT_EXTENSION_COUNT,
    created_at: sourcePending(),
  };
}

function toDecision(record: FixtureDecision, tenantId: string): RaitDecision {
  return {
    id: record.id,
    tenant_id: tenantId,
    case_id: record.caseId,
    circuit: record.circuit,
    decision_kind: record.decisionKind,
    grounds: record.grounds,
    decided_by: record.decidedBy,
    decided_at: sourcePending(),
    session_id: record.sessionId ?? null,
    signature_kind: record.signatureKind ?? null,
    signature_ref: record.signatureRef ?? null,
    published_at: fixtureDateTime(record.publishedAt),
    created_at: sourcePending(),
  };
}

function toCommunication(
  record: FixtureCommunication,
  tenantId: string,
): RaitCommunication {
  return {
    id: record.id,
    tenant_id: tenantId,
    case_id: record.caseId,
    decision_id: record.decisionId ?? null,
    channel: record.channel,
    sent_at: fixtureDateTime(record.sentAt),
    effective_on: record.effectiveOn ?? null,
    next_deadline_on: record.nextDeadlineOn ?? null,
    authority_appeal_notice: record.authorityAppealNotice,
    content_ref: record.contentRef,
    created_at: sourcePending(),
  };
}

function toCaseEvent(
  record: FixtureCaseEvent,
  tenantId: string,
): RaitCaseEvent {
  return {
    id: record.id,
    tenant_id: tenantId,
    case_id: record.caseId,
    event_type: record.eventType,
    from_state: record.fromState ?? null,
    to_state: record.toState ?? null,
    occurred_at: fixtureDateTime(record.occurredAt),
    actor_id: record.actorId ?? null,
    payload: record.payload ?? null,
    created_at: sourcePending(),
  };
}

const cases = (fixtures: RaitFixturesJson): readonly RaitCase[] =>
  fixtures.cases.map((record) => toCase(record, fixtures.tenant.id));
const pendingContents = (
  fixtures: RaitFixturesJson,
): readonly RaitPendingContent[] =>
  fixtures.raitPendingContents.map((record) =>
    toPendingContent(record, fixtures.tenant.id),
  );
const redirects = (fixtures: RaitFixturesJson): readonly RaitRedirect[] =>
  fixtures.raitRedirects.map((record) =>
    toRedirect(record, fixtures.tenant.id),
  );
const drafts = (fixtures: RaitFixturesJson): readonly RaitDraft[] =>
  fixtures.raitDrafts.map((record) => toDraft(record, fixtures.tenant.id));
const parties = (fixtures: RaitFixturesJson): readonly RaitParty[] =>
  fixtures.parties.map((record) => toParty(record, fixtures.tenant.id));
const documents = (fixtures: RaitFixturesJson): readonly RaitDocument[] =>
  fixtures.documents.map((record) => toDocument(record, fixtures.tenant.id));
const admissibility = (
  fixtures: RaitFixturesJson,
): readonly RaitAdmissibility[] =>
  fixtures.admissibility.map((record) =>
    toAdmissibility(record, fixtures.tenant.id),
  );
const deadlines = (fixtures: RaitFixturesJson): readonly RaitDeadline[] =>
  fixtures.deadlines.map((record) => toDeadline(record, fixtures.tenant.id));
const inquiries = (fixtures: RaitFixturesJson): readonly RaitInquiry[] =>
  fixtures.inquiries.map((record) => toInquiry(record, fixtures.tenant.id));
const decisions = (fixtures: RaitFixturesJson): readonly RaitDecision[] =>
  fixtures.decisions.map((record) => toDecision(record, fixtures.tenant.id));
const communications = (
  fixtures: RaitFixturesJson,
): readonly RaitCommunication[] =>
  fixtures.communications.map((record) =>
    toCommunication(record, fixtures.tenant.id),
  );
const caseEvents = (fixtures: RaitFixturesJson): readonly RaitCaseEvent[] =>
  fixtures.caseEvents.map((record) => toCaseEvent(record, fixtures.tenant.id));

@Injectable({ providedIn: 'root' })
export class PreviewCaseClient extends CaseClient {
  private readonly previewReader = inject(PreviewFixtureReader);
  private readonly previewLog = inject(PreviewActionLog);

  // --- leituras ------------------------------------------------------------------------------

  override listRaitCase(query: ListQuery = {}): Promise<ListPage<RaitCase>> {
    return this.previewReader.list(query, CASE_SPEC, cases);
  }

  override getRaitCase(id: string): Promise<RaitCase> {
    return this.previewReader.get('cases', id, cases);
  }

  override listRaitParty(query: ListQuery = {}): Promise<ListPage<RaitParty>> {
    return this.previewReader.list(query, PARTY_SPEC, parties);
  }

  override getRaitParty(id: string): Promise<RaitParty> {
    return this.previewReader.get('parties', id, parties);
  }

  override listRaitDocument(
    query: ListQuery = {},
  ): Promise<ListPage<RaitDocument>> {
    return this.previewReader.list(query, DOCUMENT_SPEC, documents);
  }

  override getRaitDocument(id: string): Promise<RaitDocument> {
    return this.previewReader.get('documents', id, documents);
  }

  override listRaitPendingContent(
    query: ListQuery = {},
  ): Promise<ListPage<RaitPendingContent>> {
    return this.previewReader.list(
      query,
      PENDING_CONTENT_SPEC,
      pendingContents,
    );
  }

  override getRaitPendingContent(id: string): Promise<RaitPendingContent> {
    return this.previewReader.get('raitPendingContents', id, pendingContents);
  }

  override listRaitRedirect(
    query: ListQuery = {},
  ): Promise<ListPage<RaitRedirect>> {
    return this.previewReader.list(query, REDIRECT_SPEC, redirects);
  }

  override getRaitRedirect(id: string): Promise<RaitRedirect> {
    return this.previewReader.get('raitRedirects', id, redirects);
  }

  override listRaitAdmissibility(
    query: ListQuery = {},
  ): Promise<ListPage<RaitAdmissibility>> {
    return this.previewReader.list(query, ADMISSIBILITY_SPEC, admissibility);
  }

  override getRaitAdmissibility(id: string): Promise<RaitAdmissibility> {
    return this.previewReader.get('admissibility', id, admissibility);
  }

  override listRaitDeadline(
    query: ListQuery = {},
  ): Promise<ListPage<RaitDeadline>> {
    return this.previewReader.list(query, DEADLINE_SPEC, deadlines);
  }

  override getRaitDeadline(id: string): Promise<RaitDeadline> {
    return this.previewReader.get('deadlines', id, deadlines);
  }

  override listRaitInquiry(
    query: ListQuery = {},
  ): Promise<ListPage<RaitInquiry>> {
    return this.previewReader.list(query, INQUIRY_SPEC, inquiries);
  }

  override getRaitInquiry(id: string): Promise<RaitInquiry> {
    return this.previewReader.get('inquiries', id, inquiries);
  }

  override listRaitDraft(query: ListQuery = {}): Promise<ListPage<RaitDraft>> {
    return this.previewReader.list(query, DRAFT_SPEC, drafts);
  }

  override getRaitDraft(id: string): Promise<RaitDraft> {
    return this.previewReader.get('raitDrafts', id, drafts);
  }

  override listRaitDecision(
    query: ListQuery = {},
  ): Promise<ListPage<RaitDecision>> {
    return this.previewReader.list(query, DECISION_SPEC, decisions);
  }

  override getRaitDecision(id: string): Promise<RaitDecision> {
    return this.previewReader.get('decisions', id, decisions);
  }

  override listRaitCommunication(
    query: ListQuery = {},
  ): Promise<ListPage<RaitCommunication>> {
    return this.previewReader.list(query, COMMUNICATION_SPEC, communications);
  }

  override getRaitCommunication(id: string): Promise<RaitCommunication> {
    return this.previewReader.get('communications', id, communications);
  }

  override listRaitCaseEvent(
    query: ListQuery = {},
  ): Promise<ListPage<RaitCaseEvent>> {
    return this.previewReader.list(query, EVENT_SPEC, caseEvents);
  }

  override getRaitCaseEvent(id: string): Promise<RaitCaseEvent> {
    return this.previewReader.get('caseEvents', id, caseEvents);
  }

  // --- comandos (contrato §6: registra a string M8 e delega; o cliente real lança) ------------

  override protocol(
    ...args: Parameters<CaseClient['protocol']>
  ): ReturnType<CaseClient['protocol']> {
    this.previewLog.record('rait-case:protocol');
    return super.protocol(...args);
  }

  override triage(
    ...args: Parameters<CaseClient['triage']>
  ): ReturnType<CaseClient['triage']> {
    this.previewLog.record('rait-case:triage');
    return super.triage(...args);
  }

  override admit(
    ...args: Parameters<CaseClient['admit']>
  ): ReturnType<CaseClient['admit']> {
    this.previewLog.record('rait-case:admit');
    return super.admit(...args);
  }

  override reject(
    ...args: Parameters<CaseClient['reject']>
  ): ReturnType<CaseClient['reject']> {
    this.previewLog.record('rait-case:reject');
    return super.reject(...args);
  }

  override remitJari(
    ...args: Parameters<CaseClient['remitJari']>
  ): ReturnType<CaseClient['remitJari']> {
    this.previewLog.record('rait-case:remit-jari');
    return super.remitJari(...args);
  }

  override receiveJudgingBody(
    ...args: Parameters<CaseClient['receiveJudgingBody']>
  ): ReturnType<CaseClient['receiveJudgingBody']> {
    this.previewLog.record('rait-case:receive-judging-body');
    return super.receiveJudgingBody(...args);
  }

  override openInquiry(
    ...args: Parameters<CaseClient['openInquiry']>
  ): ReturnType<CaseClient['openInquiry']> {
    this.previewLog.record('rait-case:open-inquiry');
    return super.openInquiry(...args);
  }

  override answerInquiry(
    ...args: Parameters<CaseClient['answerInquiry']>
  ): ReturnType<CaseClient['answerInquiry']> {
    this.previewLog.record('rait-case:answer');
    return super.answerInquiry(...args);
  }

  override extendInquiry(
    ...args: Parameters<CaseClient['extendInquiry']>
  ): ReturnType<CaseClient['extendInquiry']> {
    this.previewLog.record('rait-case:extend');
    return super.extendInquiry(...args);
  }

  override submitDraft(
    ...args: Parameters<CaseClient['submitDraft']>
  ): ReturnType<CaseClient['submitDraft']> {
    this.previewLog.record('rait-case:submit-draft');
    return super.submitDraft(...args);
  }

  override signDecision(
    ...args: Parameters<CaseClient['signDecision']>
  ): ReturnType<CaseClient['signDecision']> {
    this.previewLog.record('rait-decision:sign');
    return super.signDecision(...args);
  }

  override returnDraft(
    ...args: Parameters<CaseClient['returnDraft']>
  ): ReturnType<CaseClient['returnDraft']> {
    this.previewLog.record('rait-decision:return-draft');
    return super.returnDraft(...args);
  }

  override authorityDecide(
    ...args: Parameters<CaseClient['authorityDecide']>
  ): ReturnType<CaseClient['authorityDecide']> {
    this.previewLog.record('rait-appeal:authority-decide');
    return super.authorityDecide(...args);
  }

  override waive(
    ...args: Parameters<CaseClient['waive']>
  ): ReturnType<CaseClient['waive']> {
    this.previewLog.record('rait-appeal:waive');
    return super.waive(...args);
  }

  override withdraw(
    ...args: Parameters<CaseClient['withdraw']>
  ): ReturnType<CaseClient['withdraw']> {
    this.previewLog.record('rait-case:withdraw');
    return super.withdraw(...args);
  }

  override declareExtinction(
    ...args: Parameters<CaseClient['declareExtinction']>
  ): ReturnType<CaseClient['declareExtinction']> {
    this.previewLog.record('rait-extinction:declare');
    return super.declareExtinction(...args);
  }

  override attachOfficialDocument(
    ...args: Parameters<CaseClient['attachOfficialDocument']>
  ): ReturnType<CaseClient['attachOfficialDocument']> {
    this.previewLog.record('rait-document:attach-official');
    return super.attachOfficialDocument(...args);
  }

  override resolvePendingContent(
    ...args: Parameters<CaseClient['resolvePendingContent']>
  ): ReturnType<CaseClient['resolvePendingContent']> {
    this.previewLog.record('rait-case:resolve-pending-content');
    return super.resolvePendingContent(...args);
  }

  override redirect(
    ...args: Parameters<CaseClient['redirect']>
  ): ReturnType<CaseClient['redirect']> {
    this.previewLog.record('rait-case:redirect');
    return super.redirect(...args);
  }
}
