import { PreviewStateService } from '../preview-state.service';
import type {
  RaitCaseRead,
  RaitPartyRead,
  RaitDocumentRead,
  RaitPendingContentRead,
  RaitRedirectRead,
  RaitAdmissibilityRead,
  RaitDeadlineRead,
  RaitInquiryRead,
  RaitDraftRead,
  RaitDecisionRead,
  RaitCommunicationRead,
  RaitCaseEventRead,
} from '../../data/api/case.client';
// Adapter de prévia do `CaseClient` (R-0033 TASK-0003; `frontend-preview-mode.md` §2, §6, D-06,
// D-07, D-11, D-15; inventário §2). Leituras: `cases`, `raitPendingContents`, `raitRedirects` e
// `raitDrafts` de `rait-fixtures.json` e, desde A4/A5 (PR #184), `parties`, `documents`,
// `admissibility`, `deadlines`, `inquiries`, `decisions`, `communications` e `caseEvents`,
// mapeadas para os tipos de `data/models` sem inventar campo (D-06: camelCase → snake_case;
// `tenant_id` = tenant da fixture; `@default` do contrato gerado `BP-INF-RAIT-CASE-001`; opcional
// ausente; `created_at`, `opened_at`, `attached_at`, `evaluated_at`, `decided_at` sem coluna na
// seed → `source_pending`, `rait-fixtures.md` §10, A5 item 5). Comandos registram a string M8.
// Os quatro métodos ativados em JW-01 lançam indisponibilidade diretamente; os demais ainda
// delegam ao cliente real indisponível. Nenhum comando da prévia executa rede ou simula sucesso.
import { Injectable, inject } from '@angular/core';
import { CaseClient } from '../../data/api/case.client';
import { RaitCommandUnavailableError } from '../../core/error-boundary';
import type { ListQuerySpec } from '../../data/list-query';
import { PreviewFixtureStore } from '../preview-fixtures';
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
const CASE_SPEC: ListQuerySpec<RaitCaseRead> = {
  q: ['protocol_number'],
  filtro: ['state', 'instance', 'archived', 'ait_id', 'unit_id'],
};
const PARTY_SPEC: ListQuerySpec<RaitPartyRead> = {
  q: ['person_name'],
  filtro: ['case_id', 'role'],
};
const DOCUMENT_SPEC: ListQuerySpec<RaitDocumentRead> = {
  q: ['filename'],
  filtro: ['case_id', 'origin', 'kind'],
};
const PENDING_CONTENT_SPEC: ListQuerySpec<RaitPendingContentRead> = {
  q: [],
  filtro: ['case_id', 'outcome'],
};
const REDIRECT_SPEC: ListQuerySpec<RaitRedirectRead> = {
  q: ['protocol_number', 'counterpart_agency'],
  filtro: ['case_id', 'direction', 'reason'],
};
const ADMISSIBILITY_SPEC: ListQuerySpec<RaitAdmissibilityRead> = {
  q: [],
  filtro: ['case_id', 'criterion'],
};
const DEADLINE_SPEC: ListQuerySpec<RaitDeadlineRead> = {
  q: [],
  filtro: ['case_id', 'timer_code'],
};
const INQUIRY_SPEC: ListQuerySpec<RaitInquiryRead> = {
  q: ['subject'],
  filtro: ['case_id', 'addressee', 'outcome'],
};
const DRAFT_SPEC: ListQuerySpec<RaitDraftRead> = {
  q: [],
  filtro: ['case_id', 'status'],
};
const DECISION_SPEC: ListQuerySpec<RaitDecisionRead> = {
  q: [],
  filtro: ['case_id', 'decision_kind'],
};
const COMMUNICATION_SPEC: ListQuerySpec<RaitCommunicationRead> = {
  q: [],
  filtro: ['case_id', 'channel'],
};
const EVENT_SPEC: ListQuerySpec<RaitCaseEventRead> = {
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
  private readonly fixtureStore = inject(PreviewFixtureStore);

  // --- leituras ------------------------------------------------------------------------------

  override listRaitCase(
    query: ListQuery = {},
  ): Promise<ListPage<RaitCaseRead>> {
    return this.previewReader.list(query, CASE_SPEC, (fixtures) =>
      cases(fixtures).map((record) =>
        projectRaitCase(record, this.projectionPurpose(fixtures, record.id)),
      ),
    );
  }

  override getRaitCase(id: string): Promise<RaitCaseRead> {
    return this.previewReader.get('cases', id, (fixtures) =>
      cases(fixtures).map((record) =>
        projectRaitCase(record, this.projectionPurpose(fixtures, record.id)),
      ),
    );
  }

  override async verifyCaseAccess(caseId: string): Promise<void> {
    const fixtures = await this.fixtureStore.load();
    if (!fixtures.cases.some((record) => record.id === caseId)) {
      throw new Error(`rait-preview-fixture-missing:cases:${caseId}`);
    }
  }

  override listRaitParty(
    query: ListQuery = {},
  ): Promise<ListPage<RaitPartyRead>> {
    return this.previewReader.list(query, PARTY_SPEC, (fixtures) =>
      parties(fixtures).map((record) =>
        projectRaitParty(
          record,
          this.projectionPurpose(fixtures, record.case_id),
        ),
      ),
    );
  }

  override getRaitParty(id: string): Promise<RaitPartyRead> {
    return this.previewReader.get('parties', id, (fixtures) =>
      parties(fixtures).map((record) =>
        projectRaitParty(
          record,
          this.projectionPurpose(fixtures, record.case_id),
        ),
      ),
    );
  }

  override listRaitDocument(
    query: ListQuery = {},
  ): Promise<ListPage<RaitDocumentRead>> {
    return this.previewReader.list(query, DOCUMENT_SPEC, (fixtures) =>
      documents(fixtures).map((record) =>
        projectRaitDocument(
          record,
          this.projectionPurpose(fixtures, record.case_id),
        ),
      ),
    );
  }

  override getRaitDocument(id: string): Promise<RaitDocumentRead> {
    return this.previewReader.get('documents', id, (fixtures) =>
      documents(fixtures).map((record) =>
        projectRaitDocument(
          record,
          this.projectionPurpose(fixtures, record.case_id),
        ),
      ),
    );
  }

  override listRaitPendingContent(
    query: ListQuery = {},
  ): Promise<ListPage<RaitPendingContentRead>> {
    return this.previewReader.list(query, PENDING_CONTENT_SPEC, (fixtures) =>
      pendingContents(fixtures).map((record) =>
        projectRaitPendingContent(
          record,
          this.projectionPurpose(fixtures, record.case_id),
        ),
      ),
    );
  }

  override getRaitPendingContent(id: string): Promise<RaitPendingContentRead> {
    return this.previewReader.get('raitPendingContents', id, (fixtures) =>
      pendingContents(fixtures).map((record) =>
        projectRaitPendingContent(
          record,
          this.projectionPurpose(fixtures, record.case_id),
        ),
      ),
    );
  }

  override listRaitRedirect(
    query: ListQuery = {},
  ): Promise<ListPage<RaitRedirectRead>> {
    return this.previewReader.list(query, REDIRECT_SPEC, (fixtures) =>
      redirects(fixtures).map((record) =>
        projectRaitRedirect(
          record,
          this.projectionPurpose(fixtures, record.case_id),
        ),
      ),
    );
  }

  override getRaitRedirect(id: string): Promise<RaitRedirectRead> {
    return this.previewReader.get('raitRedirects', id, (fixtures) =>
      redirects(fixtures).map((record) =>
        projectRaitRedirect(
          record,
          this.projectionPurpose(fixtures, record.case_id),
        ),
      ),
    );
  }

  override listRaitAdmissibility(
    query: ListQuery = {},
  ): Promise<ListPage<RaitAdmissibilityRead>> {
    return this.previewReader.list(query, ADMISSIBILITY_SPEC, (fixtures) =>
      admissibility(fixtures).map((record) =>
        projectRaitAdmissibility(
          record,
          this.projectionPurpose(fixtures, record.case_id),
        ),
      ),
    );
  }

  override getRaitAdmissibility(id: string): Promise<RaitAdmissibilityRead> {
    return this.previewReader.get('admissibility', id, (fixtures) =>
      admissibility(fixtures).map((record) =>
        projectRaitAdmissibility(
          record,
          this.projectionPurpose(fixtures, record.case_id),
        ),
      ),
    );
  }

  override listRaitDeadline(
    query: ListQuery = {},
  ): Promise<ListPage<RaitDeadlineRead>> {
    return this.previewReader.list(query, DEADLINE_SPEC, (fixtures) =>
      deadlines(fixtures).map((record) =>
        projectRaitDeadline(
          record,
          this.projectionPurpose(fixtures, record.case_id),
        ),
      ),
    );
  }

  override getRaitDeadline(id: string): Promise<RaitDeadlineRead> {
    return this.previewReader.get('deadlines', id, (fixtures) =>
      deadlines(fixtures).map((record) =>
        projectRaitDeadline(
          record,
          this.projectionPurpose(fixtures, record.case_id),
        ),
      ),
    );
  }

  override listRaitInquiry(
    query: ListQuery = {},
  ): Promise<ListPage<RaitInquiryRead>> {
    return this.previewReader.list(query, INQUIRY_SPEC, (fixtures) =>
      inquiries(fixtures).map((record) =>
        projectRaitInquiry(
          record,
          this.projectionPurpose(fixtures, record.case_id),
        ),
      ),
    );
  }

  override getRaitInquiry(id: string): Promise<RaitInquiryRead> {
    return this.previewReader.get('inquiries', id, (fixtures) =>
      inquiries(fixtures).map((record) =>
        projectRaitInquiry(
          record,
          this.projectionPurpose(fixtures, record.case_id),
        ),
      ),
    );
  }

  override listRaitDraft(
    query: ListQuery = {},
  ): Promise<ListPage<RaitDraftRead>> {
    return this.previewReader.list(query, DRAFT_SPEC, (fixtures) =>
      drafts(fixtures).map((record) =>
        projectRaitDraft(
          record,
          this.projectionPurpose(fixtures, record.case_id),
        ),
      ),
    );
  }

  override getRaitDraft(id: string): Promise<RaitDraftRead> {
    return this.previewReader.get('raitDrafts', id, (fixtures) =>
      drafts(fixtures).map((record) =>
        projectRaitDraft(
          record,
          this.projectionPurpose(fixtures, record.case_id),
        ),
      ),
    );
  }

  override listRaitDecision(
    query: ListQuery = {},
  ): Promise<ListPage<RaitDecisionRead>> {
    return this.previewReader.list(query, DECISION_SPEC, (fixtures) =>
      decisions(fixtures).map((record) =>
        projectRaitDecision(
          record,
          this.projectionPurpose(fixtures, record.case_id),
        ),
      ),
    );
  }

  override getRaitDecision(id: string): Promise<RaitDecisionRead> {
    return this.previewReader.get('decisions', id, (fixtures) =>
      decisions(fixtures).map((record) =>
        projectRaitDecision(
          record,
          this.projectionPurpose(fixtures, record.case_id),
        ),
      ),
    );
  }

  override listRaitCommunication(
    query: ListQuery = {},
  ): Promise<ListPage<RaitCommunicationRead>> {
    return this.previewReader.list(query, COMMUNICATION_SPEC, (fixtures) =>
      communications(fixtures).map((record) =>
        projectRaitCommunication(
          record,
          this.projectionPurpose(fixtures, record.case_id),
        ),
      ),
    );
  }

  override getRaitCommunication(id: string): Promise<RaitCommunicationRead> {
    return this.previewReader.get('communications', id, (fixtures) =>
      communications(fixtures).map((record) =>
        projectRaitCommunication(
          record,
          this.projectionPurpose(fixtures, record.case_id),
        ),
      ),
    );
  }

  override listRaitCaseEvent(
    query: ListQuery = {},
  ): Promise<ListPage<RaitCaseEventRead>> {
    return this.previewReader.list(query, EVENT_SPEC, (fixtures) =>
      caseEvents(fixtures).map((record) =>
        projectRaitCaseEvent(
          record,
          this.projectionPurpose(fixtures, record.case_id),
        ),
      ),
    );
  }

  override getRaitCaseEvent(id: string): Promise<RaitCaseEventRead> {
    return this.previewReader.get('caseEvents', id, (fixtures) =>
      caseEvents(fixtures).map((record) =>
        projectRaitCaseEvent(
          record,
          this.projectionPurpose(fixtures, record.case_id),
        ),
      ),
    );
  }

  // --- comandos (contrato §6: registra M8 e mantém indisponibilidade explícita) ---------------

  override protocol(
    ...args: Parameters<CaseClient['protocol']>
  ): ReturnType<CaseClient['protocol']> {
    this.previewLog.record('rait-case:protocol');
    return super.protocol(...args);
  }

  override async triage(
    ..._args: Parameters<CaseClient['triage']>
  ): ReturnType<CaseClient['triage']> {
    this.previewLog.record('rait-case:triage');
    throw new RaitCommandUnavailableError('rait-case:triage');
  }

  override async saveAdmissibility(
    ..._args: Parameters<CaseClient['saveAdmissibility']>
  ): ReturnType<CaseClient['saveAdmissibility']> {
    this.previewLog.record('rait-admissibility:create');
    throw new RaitCommandUnavailableError('rait-admissibility:create');
  }

  override async admit(
    ..._args: Parameters<CaseClient['admit']>
  ): ReturnType<CaseClient['admit']> {
    this.previewLog.record('rait-case:admit');
    throw new RaitCommandUnavailableError('rait-case:admit');
  }

  override async reject(
    ..._args: Parameters<CaseClient['reject']>
  ): ReturnType<CaseClient['reject']> {
    this.previewLog.record('rait-case:reject');
    throw new RaitCommandUnavailableError('rait-case:reject');
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

function projectRaitCase(
  record: RaitCase,
  purpose: 'S' | 'O' | 'M' | 'J' | 'T',
): RaitCaseRead {
  if (purpose === 'O')
    return {
      id: record.id,
      protocol_number: record.protocol_number,
      instance: record.instance,
      circuit: record.circuit,
      state: record.state,
      unit_id: record.unit_id,
      protocolled_at: record.protocolled_at,
      version: record.version,
      last_movement_at: record.last_movement_at,
      pending_completion: record.pending_completion,
      archived: record.archived,
    };
  if (purpose === 'M')
    return {
      id: record.id,
      protocol_number: record.protocol_number,
      instance: record.instance,
      circuit: record.circuit,
      state: record.state,
      unit_id: record.unit_id,
      protocolled_at: record.protocolled_at,
      version: record.version,
      ait_id: record.ait_id,
      origin_case_id: record.origin_case_id,
      intake_channel: record.intake_channel,
      admitted_at: record.admitted_at,
      judge_body_received_at: record.judge_body_received_at,
      judge_body_received_on: record.judge_body_received_on,
      cetran_received_at: record.cetran_received_at,
      cetran_received_on: record.cetran_received_on,
      remitted_at: record.remitted_at,
      decided_at: record.decided_at,
      communicated_at: record.communicated_at,
      closed_at: record.closed_at,
      suspensive_effect: record.suspensive_effect,
      archived: record.archived,
      non_admission_reason: record.non_admission_reason,
      withdrawal_document_id: record.withdrawal_document_id,
      last_movement_at: record.last_movement_at,
      pending_completion: record.pending_completion,
      legal_priority: record.legal_priority,
      agency_jurisdiction_id: record.agency_jurisdiction_id,
    };
  if (purpose === 'J')
    return {
      id: record.id,
      protocol_number: record.protocol_number,
      instance: record.instance,
      circuit: record.circuit,
      state: record.state,
      unit_id: record.unit_id,
      protocolled_at: record.protocolled_at,
      version: record.version,
      ait_id: record.ait_id,
      origin_case_id: record.origin_case_id,
      intake_channel: record.intake_channel,
      admitted_at: record.admitted_at,
      judge_body_received_at: record.judge_body_received_at,
      judge_body_received_on: record.judge_body_received_on,
      cetran_received_at: record.cetran_received_at,
      cetran_received_on: record.cetran_received_on,
      remitted_at: record.remitted_at,
      decided_at: record.decided_at,
      communicated_at: record.communicated_at,
      closed_at: record.closed_at,
      suspensive_effect: record.suspensive_effect,
      archived: record.archived,
      non_admission_reason: record.non_admission_reason,
      withdrawal_document_id: record.withdrawal_document_id,
      last_movement_at: record.last_movement_at,
      pending_completion: record.pending_completion,
      legal_priority: record.legal_priority,
      agency_jurisdiction_id: record.agency_jurisdiction_id,
    };
  if (purpose === 'T')
    return {
      id: record.id,
      protocol_number: record.protocol_number,
      instance: record.instance,
      state: record.state,
      protocolled_at: record.protocolled_at,
      version: record.version,
      suspensive_effect: record.suspensive_effect,
      unit_id: record.unit_id,
    };
  return {
    id: record.id,
    protocol_number: record.protocol_number,
    instance: record.instance,
    circuit: record.circuit,
    state: record.state,
    unit_id: record.unit_id,
    protocolled_at: record.protocolled_at,
    version: record.version,
    intake_channel: record.intake_channel,
    admitted_at: record.admitted_at,
    judge_body_received_at: record.judge_body_received_at,
    judge_body_received_on: record.judge_body_received_on,
    cetran_received_at: record.cetran_received_at,
    cetran_received_on: record.cetran_received_on,
    remitted_at: record.remitted_at,
    decided_at: record.decided_at,
    communicated_at: record.communicated_at,
    closed_at: record.closed_at,
    archived: record.archived,
    pending_completion: record.pending_completion,
    last_movement_at: record.last_movement_at,
  };
}

function projectRaitParty(
  record: RaitParty,
  purpose: 'S' | 'O' | 'M' | 'J' | 'T',
): RaitPartyRead {
  if (purpose === 'M')
    return {
      id: record.id,
      case_id: record.case_id,
      role: record.role,
      legitimacy_basis: record.legitimacy_basis,
      person_name: record.person_name,
      document_number: record.document_number,
      representation_kind: record.representation_kind,
      representation_verified: record.representation_verified,
      representation_document_id: record.representation_document_id,
    };
  if (purpose === 'J')
    return {
      id: record.id,
      case_id: record.case_id,
      role: record.role,
      legitimacy_basis: record.legitimacy_basis,
      person_name: record.person_name,
      document_number: record.document_number,
      representation_kind: record.representation_kind,
      representation_verified: record.representation_verified,
      representation_document_id: record.representation_document_id,
    };
  if (purpose === 'T')
    return {
      id: record.id,
      case_id: record.case_id,
      role: record.role,
      person_name: record.person_name,
      legitimacy_basis: record.legitimacy_basis,
      representation_kind: record.representation_kind,
      representation_verified: record.representation_verified,
      representation_document_id: record.representation_document_id,
    };
  return {
    id: record.id,
    case_id: record.case_id,
    role: record.role,
    representation_kind: record.representation_kind,
    representation_verified: record.representation_verified,
  };
}

function projectRaitDocument(
  record: RaitDocument,
  purpose: 'S' | 'O' | 'M' | 'J' | 'T',
): RaitDocumentRead {
  if (purpose === 'M')
    return {
      id: record.id,
      case_id: record.case_id,
      kind: record.kind,
      origin: record.origin,
      filename: record.filename,
      content_hash: record.content_hash,
      digitised_from_paper: record.digitised_from_paper,
      attached_at: record.attached_at,
    };
  if (purpose === 'J')
    return {
      id: record.id,
      case_id: record.case_id,
      kind: record.kind,
      origin: record.origin,
      filename: record.filename,
      content_hash: record.content_hash,
      digitised_from_paper: record.digitised_from_paper,
      attached_at: record.attached_at,
    };
  if (purpose === 'T')
    return {
      id: record.id,
      case_id: record.case_id,
      kind: record.kind,
      origin: record.origin,
      attached_at: record.attached_at,
      digitised_from_paper: record.digitised_from_paper,
    };
  return {
    id: record.id,
    case_id: record.case_id,
    kind: record.kind,
    origin: record.origin,
    attached_at: record.attached_at,
  };
}

function projectRaitPendingContent(
  record: RaitPendingContent,
  purpose: 'S' | 'O' | 'M' | 'J' | 'T',
): RaitPendingContentRead {
  if (purpose === 'O')
    return {
      id: record.id,
      case_id: record.case_id,
      due_on: record.due_on,
      opened_at: record.opened_at,
      closed_at: record.closed_at,
      outcome: record.outcome,
    };
  if (purpose === 'M')
    return {
      id: record.id,
      case_id: record.case_id,
      due_on: record.due_on,
      opened_at: record.opened_at,
      opened_by: record.opened_by,
      closed_at: record.closed_at,
      outcome: record.outcome,
    };
  if (purpose === 'J')
    return {
      id: record.id,
      case_id: record.case_id,
      due_on: record.due_on,
      opened_at: record.opened_at,
      opened_by: record.opened_by,
      closed_at: record.closed_at,
      outcome: record.outcome,
    };
  return {
    id: record.id,
    case_id: record.case_id,
    due_on: record.due_on,
    opened_at: record.opened_at,
    closed_at: record.closed_at,
    outcome: record.outcome,
  };
}

function projectRaitRedirect(
  record: RaitRedirect,
  purpose: 'S' | 'O' | 'M' | 'J' | 'T',
): RaitRedirectRead {
  if (purpose === 'O')
    return {
      id: record.id,
      case_id: record.case_id,
      direction: record.direction,
      protocol_number: record.protocol_number,
      deadline_restored: record.deadline_restored,
      redirected_at: record.redirected_at,
    };
  if (purpose === 'M')
    return {
      id: record.id,
      case_id: record.case_id,
      direction: record.direction,
      reason: record.reason,
      protocol_number: record.protocol_number,
      ait_number: record.ait_number,
      counterpart_agency: record.counterpart_agency,
      counterpart_renainf_code: record.counterpart_renainf_code,
      origin_protocolled_on: record.origin_protocolled_on,
      deadline_restored: record.deadline_restored,
      receipt_document_id: record.receipt_document_id,
      redirected_at: record.redirected_at,
      redirected_by: record.redirected_by,
    };
  if (purpose === 'J')
    return {
      id: record.id,
      case_id: record.case_id,
      direction: record.direction,
      reason: record.reason,
      protocol_number: record.protocol_number,
      ait_number: record.ait_number,
      counterpart_agency: record.counterpart_agency,
      counterpart_renainf_code: record.counterpart_renainf_code,
      origin_protocolled_on: record.origin_protocolled_on,
      deadline_restored: record.deadline_restored,
      receipt_document_id: record.receipt_document_id,
      redirected_at: record.redirected_at,
      redirected_by: record.redirected_by,
    };
  return {
    id: record.id,
    case_id: record.case_id,
    direction: record.direction,
    protocol_number: record.protocol_number,
    counterpart_agency: record.counterpart_agency,
    origin_protocolled_on: record.origin_protocolled_on,
    deadline_restored: record.deadline_restored,
    redirected_at: record.redirected_at,
  };
}

function projectRaitAdmissibility(
  record: RaitAdmissibility,
  purpose: 'S' | 'O' | 'M' | 'J' | 'T',
): RaitAdmissibilityRead {
  if (purpose === 'M')
    return {
      id: record.id,
      case_id: record.case_id,
      criterion: record.criterion,
      verdict: record.verdict,
      reason: record.reason,
      evaluated_at: record.evaluated_at,
      evaluated_by: record.evaluated_by,
    };
  if (purpose === 'J')
    return {
      id: record.id,
      case_id: record.case_id,
      criterion: record.criterion,
      verdict: record.verdict,
      reason: record.reason,
      evaluated_at: record.evaluated_at,
      evaluated_by: record.evaluated_by,
    };
  if (purpose === 'T')
    return {
      id: record.id,
      case_id: record.case_id,
      criterion: record.criterion,
      verdict: record.verdict,
      reason: record.reason,
      evaluated_at: record.evaluated_at,
    };
  return {
    id: record.id,
    case_id: record.case_id,
    criterion: record.criterion,
    verdict: record.verdict,
    evaluated_at: record.evaluated_at,
  };
}

function projectRaitDeadline(
  record: RaitDeadline,
  purpose: 'S' | 'O' | 'M' | 'J' | 'T',
): RaitDeadlineRead {
  if (purpose === 'O')
    return {
      id: record.id,
      case_id: record.case_id,
      timer_code: record.timer_code,
      start_basis: record.start_basis,
      started_on: record.started_on,
      raw_due_on: record.raw_due_on,
      due_on: record.due_on,
      business_days: record.business_days,
      extension_count: record.extension_count,
      satisfied_at: record.satisfied_at,
      legal_basis: record.legal_basis,
    };
  if (purpose === 'M')
    return {
      id: record.id,
      case_id: record.case_id,
      timer_code: record.timer_code,
      start_basis: record.start_basis,
      started_on: record.started_on,
      raw_due_on: record.raw_due_on,
      due_on: record.due_on,
      business_days: record.business_days,
      extension_count: record.extension_count,
      satisfied_at: record.satisfied_at,
      legal_basis: record.legal_basis,
      suspended_by_act_id: record.suspended_by_act_id,
    };
  if (purpose === 'J')
    return {
      id: record.id,
      case_id: record.case_id,
      timer_code: record.timer_code,
      start_basis: record.start_basis,
      started_on: record.started_on,
      raw_due_on: record.raw_due_on,
      due_on: record.due_on,
      business_days: record.business_days,
      extension_count: record.extension_count,
      satisfied_at: record.satisfied_at,
      legal_basis: record.legal_basis,
      suspended_by_act_id: record.suspended_by_act_id,
    };
  if (purpose === 'T')
    return {
      id: record.id,
      case_id: record.case_id,
      timer_code: record.timer_code,
      start_basis: record.start_basis,
      started_on: record.started_on,
      raw_due_on: record.raw_due_on,
      due_on: record.due_on,
      business_days: record.business_days,
      extension_count: record.extension_count,
      legal_basis: record.legal_basis,
    };
  return {
    id: record.id,
    case_id: record.case_id,
    timer_code: record.timer_code,
    start_basis: record.start_basis,
    started_on: record.started_on,
    raw_due_on: record.raw_due_on,
    due_on: record.due_on,
    business_days: record.business_days,
    extension_count: record.extension_count,
    satisfied_at: record.satisfied_at,
    legal_basis: record.legal_basis,
  };
}

function projectRaitInquiry(
  record: RaitInquiry,
  purpose: 'S' | 'O' | 'M' | 'J' | 'T',
): RaitInquiryRead {
  if (purpose === 'O')
    return {
      id: record.id,
      case_id: record.case_id,
      requested_at: record.requested_at,
      due_on: record.due_on,
      extension_count: record.extension_count,
      answered_at: record.answered_at,
      answered_on: record.answered_on,
      outcome: record.outcome,
    };
  if (purpose === 'M')
    return {
      id: record.id,
      case_id: record.case_id,
      addressee: record.addressee,
      subject: record.subject,
      requested_at: record.requested_at,
      requested_by: record.requested_by,
      due_on: record.due_on,
      extension_count: record.extension_count,
      answered_at: record.answered_at,
      answered_on: record.answered_on,
      outcome: record.outcome,
    };
  if (purpose === 'J')
    return {
      id: record.id,
      case_id: record.case_id,
      addressee: record.addressee,
      subject: record.subject,
      requested_at: record.requested_at,
      requested_by: record.requested_by,
      due_on: record.due_on,
      extension_count: record.extension_count,
      answered_at: record.answered_at,
      answered_on: record.answered_on,
      outcome: record.outcome,
    };
  return {
    id: record.id,
    case_id: record.case_id,
    requested_at: record.requested_at,
    due_on: record.due_on,
    extension_count: record.extension_count,
    answered_at: record.answered_at,
    answered_on: record.answered_on,
    outcome: record.outcome,
  };
}

function projectRaitDraft(
  record: RaitDraft,
  purpose: 'S' | 'O' | 'M' | 'J' | 'T',
): RaitDraftRead {
  if (purpose === 'O')
    return {
      id: record.id,
      case_id: record.case_id,
      version: record.version,
      status: record.status,
      submitted_at: record.submitted_at,
      returned_at: record.returned_at,
      return_count: record.return_count,
    };
  if (purpose === 'M')
    return {
      id: record.id,
      case_id: record.case_id,
      version: record.version,
      author_id: record.author_id,
      document_id: record.document_id,
      content_hash: record.content_hash,
      status: record.status,
      submitted_at: record.submitted_at,
      returned_at: record.returned_at,
      return_guidance: record.return_guidance,
      return_count: record.return_count,
    };
  if (purpose === 'J')
    return {
      id: record.id,
      case_id: record.case_id,
      version: record.version,
      author_id: record.author_id,
      document_id: record.document_id,
      content_hash: record.content_hash,
      status: record.status,
      submitted_at: record.submitted_at,
      returned_at: record.returned_at,
      return_guidance: record.return_guidance,
      return_count: record.return_count,
    };
  return {
    id: record.id,
    case_id: record.case_id,
    version: record.version,
    status: record.status,
    submitted_at: record.submitted_at,
    returned_at: record.returned_at,
    return_count: record.return_count,
  };
}

function projectRaitDecision(
  record: RaitDecision,
  purpose: 'S' | 'O' | 'M' | 'J' | 'T',
): RaitDecisionRead {
  if (purpose === 'O')
    return {
      id: record.id,
      case_id: record.case_id,
      circuit: record.circuit,
      decision_kind: record.decision_kind,
      decided_at: record.decided_at,
      published_at: record.published_at,
    };
  if (purpose === 'M')
    return {
      id: record.id,
      case_id: record.case_id,
      circuit: record.circuit,
      decision_kind: record.decision_kind,
      grounds: record.grounds,
      decided_by: record.decided_by,
      decided_at: record.decided_at,
      session_id: record.session_id,
      signature_kind: record.signature_kind,
      signature_ref: record.signature_ref,
      published_at: record.published_at,
    };
  if (purpose === 'J')
    return {
      id: record.id,
      case_id: record.case_id,
      circuit: record.circuit,
      decision_kind: record.decision_kind,
      grounds: record.grounds,
      decided_by: record.decided_by,
      decided_at: record.decided_at,
      session_id: record.session_id,
      signature_kind: record.signature_kind,
      signature_ref: record.signature_ref,
      published_at: record.published_at,
    };
  return {
    id: record.id,
    case_id: record.case_id,
    circuit: record.circuit,
    decision_kind: record.decision_kind,
    decided_at: record.decided_at,
    published_at: record.published_at,
  };
}

function projectRaitCommunication(
  record: RaitCommunication,
  purpose: 'S' | 'O' | 'M' | 'J' | 'T',
): RaitCommunicationRead {
  if (purpose === 'O')
    return {
      id: record.id,
      case_id: record.case_id,
      channel: record.channel,
      sent_at: record.sent_at,
      effective_on: record.effective_on,
      next_deadline_on: record.next_deadline_on,
    };
  if (purpose === 'M')
    return {
      id: record.id,
      case_id: record.case_id,
      decision_id: record.decision_id,
      channel: record.channel,
      sent_at: record.sent_at,
      effective_on: record.effective_on,
      next_deadline_on: record.next_deadline_on,
      authority_appeal_notice: record.authority_appeal_notice,
    };
  if (purpose === 'J')
    return {
      id: record.id,
      case_id: record.case_id,
      decision_id: record.decision_id,
      channel: record.channel,
      sent_at: record.sent_at,
      effective_on: record.effective_on,
      next_deadline_on: record.next_deadline_on,
      authority_appeal_notice: record.authority_appeal_notice,
    };
  return {
    id: record.id,
    case_id: record.case_id,
    decision_id: record.decision_id,
    channel: record.channel,
    sent_at: record.sent_at,
    effective_on: record.effective_on,
    next_deadline_on: record.next_deadline_on,
    authority_appeal_notice: record.authority_appeal_notice,
  };
}

function projectRaitCaseEvent(
  record: RaitCaseEvent,
  purpose: 'S' | 'O' | 'M' | 'J' | 'T',
): RaitCaseEventRead {
  if (purpose === 'O')
    return {
      id: record.id,
      case_id: record.case_id,
      event_type: record.event_type,
      from_state: record.from_state,
      to_state: record.to_state,
      occurred_at: record.occurred_at,
    };
  if (purpose === 'M')
    return {
      id: record.id,
      case_id: record.case_id,
      event_type: record.event_type,
      from_state: record.from_state,
      to_state: record.to_state,
      occurred_at: record.occurred_at,
      actor_id: record.actor_id,
    };
  if (purpose === 'J')
    return {
      id: record.id,
      case_id: record.case_id,
      event_type: record.event_type,
      from_state: record.from_state,
      to_state: record.to_state,
      occurred_at: record.occurred_at,
      actor_id: record.actor_id,
    };
  return {
    id: record.id,
    case_id: record.case_id,
    event_type: record.event_type,
    from_state: record.from_state,
    to_state: record.to_state,
    occurred_at: record.occurred_at,
  };
}
