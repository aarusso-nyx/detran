// Adapter de prévia do `SessionClient` (R-0033 TASK-0003; `frontend-preview-mode.md` §2, §6,
// D-06, D-07, D-11; inventário §2). Leituras: `sessions` e `agendaItems` de `rait-fixtures.json`,
// e, desde A4/A5 (PR #184), `attendance`, `votes` e `minutes`, mapeadas sem inventar campo (D-06;
// nomes herdados `body` → `judging_body`, `session` → `session_id`; `@default` do contrato gerado
// `BP-INF-RAIT-SESSION-001`; `created_at` sem coluna na seed → `source_pending`,
// `rait-fixtures.md` §10). Comandos: registram a string M8 e delegam ao cliente real, que lança.
import { Injectable, inject } from '@angular/core';
import { SessionClient } from '../../data/api/session.client';
import type { ListQuerySpec } from '../../data/list-query';
import type {
  ListPage,
  ListQuery,
  RaitAgendaItem,
  RaitAttendance,
  RaitMinutes,
  RaitSession,
  RaitVote,
} from '../../data/models';
import { PreviewActionLog } from '../preview-action-log';
import type {
  FixtureAgendaItem,
  FixtureAttendance,
  FixtureMinutes,
  FixtureSession,
  FixtureVote,
  RaitFixturesJson,
} from '../preview-fixtures';
import {
  PreviewFixtureReader,
  fixtureDateTime,
  sourcePending,
} from './preview-reader';

// `ListQuerySpec` — cópia literal de `data/api/session.client.ts` (constantes privadas do módulo).
const SESSION_SPEC: ListQuerySpec<RaitSession> = {
  q: [],
  filtro: ['judging_body', 'state', 'extraordinary'],
};
const AGENDA_ITEM_SPEC: ListQuerySpec<RaitAgendaItem> = {
  q: [],
  filtro: [
    'session_id',
    'case_id',
    'rapporteur_member_id',
    'priority',
    'withdrawn',
  ],
};
const ATTENDANCE_SPEC: ListQuerySpec<RaitAttendance> = {
  q: [],
  filtro: ['session_id', 'member_id', 'present'],
};
const VOTE_SPEC: ListQuerySpec<RaitVote> = {
  q: [],
  filtro: ['agenda_item_id', 'member_id', 'vote', 'casting_vote'],
};
const MINUTES_SPEC: ListQuerySpec<RaitMinutes> = {
  q: [],
  filtro: ['session_id'],
};

// `@default` do contrato gerado para colunas que a seed não traz.
/**
 * `RaitSession.extraordinary`/`short_notice_ack`, `RaitAgendaItem.withdrawn`,
 * `RaitAttendance.is_chair_substitute`, `RaitVote.casting_vote` `@default false`.
 */
const DEFAULT_FALSE = false;
/** `RaitSession.modality` `@default 'presencial'`. */
const SESSION_DEFAULT_MODALITY: RaitSession['modality'] = 'presencial';
/** `RaitSession.version`/`RaitAgendaItem.version`/`RaitMinutes.version` `@default 1`. */
const DEFAULT_VERSION = 1;

function toSession(record: FixtureSession, tenantId: string): RaitSession {
  return {
    id: record.id,
    tenant_id: tenantId,
    judging_body: record.body,
    state: record.state,
    scheduled_for: fixtureDateTime(record.scheduledFor),
    agenda_closed_at: fixtureDateTime(record.agendaClosedAt),
    convened_at: fixtureDateTime(record.convenedAt),
    opened_at: fixtureDateTime(record.openedAt),
    closed_at: fixtureDateTime(record.closedAt),
    quorum_required: record.quorumRequired,
    quorum_observed: record.quorumObserved ?? null,
    chair_member_id: record.chairMemberId,
    extraordinary: DEFAULT_FALSE,
    modality: SESSION_DEFAULT_MODALITY,
    short_notice_ack: DEFAULT_FALSE,
    version: DEFAULT_VERSION,
    created_at: sourcePending(),
  };
}

function toAgendaItem(
  record: FixtureAgendaItem,
  tenantId: string,
): RaitAgendaItem {
  return {
    id: record.id,
    tenant_id: tenantId,
    session_id: record.session,
    case_id: record.caseId,
    position: record.position,
    priority: record.priority,
    rapporteur_member_id: record.rapporteurMemberId,
    opinion_summary: record.opinionSummary,
    opinion_analysis: record.opinionAnalysis,
    opinion_vote: record.opinionVote,
    opinion_registered_at: fixtureDateTime(record.opinionRegisteredAt),
    read_at: fixtureDateTime(record.readAt),
    proclaimed_at: fixtureDateTime(record.proclaimedAt),
    outcome: record.outcome ?? null,
    withdrawn: DEFAULT_FALSE,
    version: DEFAULT_VERSION,
    created_at: sourcePending(),
  };
}

function toAttendance(
  record: FixtureAttendance,
  tenantId: string,
): RaitAttendance {
  return {
    id: record.id,
    tenant_id: tenantId,
    session_id: record.sessionId,
    member_id: record.memberId,
    present: record.present,
    is_chair: record.isChair,
    is_chair_substitute: DEFAULT_FALSE,
    absence_justified: record.absenceJustified ?? null,
    created_at: sourcePending(),
  };
}

function toVote(record: FixtureVote, tenantId: string): RaitVote {
  return {
    id: record.id,
    tenant_id: tenantId,
    agenda_item_id: record.agendaItemId,
    member_id: record.memberId,
    vote: record.vote,
    casting_vote: DEFAULT_FALSE,
    cast_at: fixtureDateTime(record.castAt),
    created_at: sourcePending(),
  };
}

function toMinutes(record: FixtureMinutes, tenantId: string): RaitMinutes {
  return {
    id: record.id,
    tenant_id: tenantId,
    session_id: record.sessionId,
    content: record.content,
    generated_at: fixtureDateTime(record.generatedAt),
    signed_at: fixtureDateTime(record.signedAt),
    signed_by: record.signedBy ?? null,
    signature_kind: record.signatureKind ?? null,
    signature_ref: record.signatureRef ?? null,
    document_hash: record.documentHash ?? null,
    published_at: fixtureDateTime(record.publishedAt),
    version: DEFAULT_VERSION,
    created_at: sourcePending(),
  };
}

const sessions = (f: RaitFixturesJson): readonly RaitSession[] =>
  f.sessions.map((record) => toSession(record, f.tenant.id));
const agendaItems = (f: RaitFixturesJson): readonly RaitAgendaItem[] =>
  f.agendaItems.map((record) => toAgendaItem(record, f.tenant.id));
const attendance = (f: RaitFixturesJson): readonly RaitAttendance[] =>
  f.attendance.map((record) => toAttendance(record, f.tenant.id));
const votes = (f: RaitFixturesJson): readonly RaitVote[] =>
  f.votes.map((record) => toVote(record, f.tenant.id));
const minutes = (f: RaitFixturesJson): readonly RaitMinutes[] =>
  f.minutes.map((record) => toMinutes(record, f.tenant.id));

@Injectable({ providedIn: 'root' })
export class PreviewSessionClient extends SessionClient {
  private readonly previewReader = inject(PreviewFixtureReader);
  private readonly previewLog = inject(PreviewActionLog);

  // --- leituras ------------------------------------------------------------------------------

  override listRaitSession(
    query: ListQuery = {},
  ): Promise<ListPage<RaitSession>> {
    return this.previewReader.list(query, SESSION_SPEC, sessions);
  }

  override getRaitSession(id: string): Promise<RaitSession> {
    return this.previewReader.get('sessions', id, sessions);
  }

  override listRaitAgendaItem(
    query: ListQuery = {},
  ): Promise<ListPage<RaitAgendaItem>> {
    return this.previewReader.list(query, AGENDA_ITEM_SPEC, agendaItems);
  }

  override getRaitAgendaItem(id: string): Promise<RaitAgendaItem> {
    return this.previewReader.get('agendaItems', id, agendaItems);
  }

  override listRaitAttendance(
    query: ListQuery = {},
  ): Promise<ListPage<RaitAttendance>> {
    return this.previewReader.list(query, ATTENDANCE_SPEC, attendance);
  }

  override getRaitAttendance(id: string): Promise<RaitAttendance> {
    return this.previewReader.get('attendance', id, attendance);
  }

  override listRaitVote(query: ListQuery = {}): Promise<ListPage<RaitVote>> {
    return this.previewReader.list(query, VOTE_SPEC, votes);
  }

  override getRaitVote(id: string): Promise<RaitVote> {
    return this.previewReader.get('votes', id, votes);
  }

  override listRaitMinutes(
    query: ListQuery = {},
  ): Promise<ListPage<RaitMinutes>> {
    return this.previewReader.list(query, MINUTES_SPEC, minutes);
  }

  override getRaitMinutes(id: string): Promise<RaitMinutes> {
    return this.previewReader.get('minutes', id, minutes);
  }

  // --- comandos (contrato §6: registra a string M8 e delega; o cliente real lança) ------------

  override registerOpinion(
    ...args: Parameters<SessionClient['registerOpinion']>
  ): ReturnType<SessionClient['registerOpinion']> {
    this.previewLog.record('rait-opinion:register');
    return super.registerOpinion(...args);
  }

  override closeAgenda(
    ...args: Parameters<SessionClient['closeAgenda']>
  ): ReturnType<SessionClient['closeAgenda']> {
    this.previewLog.record('rait-agenda:close');
    return super.closeAgenda(...args);
  }

  override openSession(
    ...args: Parameters<SessionClient['openSession']>
  ): ReturnType<SessionClient['openSession']> {
    this.previewLog.record('rait-session:open');
    return super.openSession(...args);
  }

  override adjournSession(
    ...args: Parameters<SessionClient['adjournSession']>
  ): ReturnType<SessionClient['adjournSession']> {
    this.previewLog.record('rait-session:adjourn');
    return super.adjournSession(...args);
  }

  override vote(
    ...args: Parameters<SessionClient['vote']>
  ): ReturnType<SessionClient['vote']> {
    this.previewLog.record('rait-session:vote');
    return super.vote(...args);
  }

  override castingVote(
    ...args: Parameters<SessionClient['castingVote']>
  ): ReturnType<SessionClient['castingVote']> {
    this.previewLog.record('rait-session:casting-vote');
    return super.castingVote(...args);
  }

  override requestView(
    ...args: Parameters<SessionClient['requestView']>
  ): ReturnType<SessionClient['requestView']> {
    this.previewLog.record('rait-session:view-request');
    return super.requestView(...args);
  }

  override proclaim(
    ...args: Parameters<SessionClient['proclaim']>
  ): ReturnType<SessionClient['proclaim']> {
    this.previewLog.record('rait-session:proclaim');
    return super.proclaim(...args);
  }

  override generateMinutes(
    ...args: Parameters<SessionClient['generateMinutes']>
  ): ReturnType<SessionClient['generateMinutes']> {
    this.previewLog.record('rait-minutes:generate');
    return super.generateMinutes(...args);
  }

  override signMinutes(
    ...args: Parameters<SessionClient['signMinutes']>
  ): ReturnType<SessionClient['signMinutes']> {
    this.previewLog.record('rait-minutes:sign');
    return super.signMinutes(...args);
  }

  override publishMinutes(
    ...args: Parameters<SessionClient['publishMinutes']>
  ): ReturnType<SessionClient['publishMinutes']> {
    this.previewLog.record('rait-minutes:publish');
    return super.publishMinutes(...args);
  }

  override confirmAttendance(
    ...args: Parameters<SessionClient['confirmAttendance']>
  ): ReturnType<SessionClient['confirmAttendance']> {
    this.previewLog.record('rait-attendance:confirm');
    return super.confirmAttendance(...args);
  }

  override summonSubstitute(
    ...args: Parameters<SessionClient['summonSubstitute']>
  ): ReturnType<SessionClient['summonSubstitute']> {
    this.previewLog.record('rait-attendance:summon-substitute');
    return super.summonSubstitute(...args);
  }

  override registerViewVote(
    ...args: Parameters<SessionClient['registerViewVote']>
  ): ReturnType<SessionClient['registerViewVote']> {
    this.previewLog.record('rait-session:register-view-vote');
    return super.registerViewVote(...args);
  }

  override conveneExtraordinary(
    ...args: Parameters<SessionClient['conveneExtraordinary']>
  ): ReturnType<SessionClient['conveneExtraordinary']> {
    this.previewLog.record('rait-session:convene-extraordinary');
    return super.conveneExtraordinary(...args);
  }
}
