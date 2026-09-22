// SessionClient — o COLEGIADO (contrato CTG-0002b §3.3/§3.4/§3.5; M9): 5 pares list/get de
// `BP-INF-RAIT-SESSION-001` (nome = `operationId`, URL literal do `paths`, ADR-0003) e 15
// métodos de comando com corpo M8 (`RaitCommandUnavailableError`) até R-0007 CTG-0004. As claims
// da sessão STYNX (ficha IU-RAIT-018) NÃO passam por aqui: são `core/session.facade.ts` (§3.4).
// Ver `case.client.ts` para as regras comuns.
import { Injectable, inject } from '@angular/core';
import { RaitCommandUnavailableError } from '../../core/error-boundary';
import type { ListQuerySpec } from '../list-query';
import type {
  CommandBody,
  CommandResult,
  CreateRaitAttendanceDto,
  CreateRaitMinutesDto,
  CreateRaitSessionDto,
  CreateRaitSubstituteDutyDto,
  CreateRaitVoteDto,
  ListPage,
  ListQuery,
  RaitAgendaItem,
  RaitAttendance,
  RaitMinutes,
  RaitSession,
  RaitSubstituteDuty,
  RaitVote,
} from '../models';
import { EtagStore, type RaitCollection } from './etag-store';
import { RaitHttp } from './rait-http';

const SESSIONS_URL = '/v1/inf/rait/sessions';
const AGENDA_ITEMS_URL = '/v1/inf/rait/agenda-items';
const ATTENDANCE_URL = '/v1/inf/rait/attendance';
const VOTES_URL = '/v1/inf/rait/votes';
const MINUTES_URL = '/v1/inf/rait/minutes';

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

@Injectable({ providedIn: 'root' })
export class SessionClient {
  private readonly http = inject(RaitHttp);
  private readonly etagStore = inject(EtagStore);

  etagOf(collection: RaitCollection, id: string): string | null {
    return this.etagStore.get(collection, id);
  }

  // --- leituras (§3.3) -------------------------------------------------------------------

  listRaitSession(query: ListQuery = {}): Promise<ListPage<RaitSession>> {
    return this.http.getList(SESSIONS_URL, query, SESSION_SPEC);
  }

  getRaitSession(id: string): Promise<RaitSession> {
    return this.http.getOne(SESSIONS_URL, 'sessions', id);
  }

  listRaitAgendaItem(query: ListQuery = {}): Promise<ListPage<RaitAgendaItem>> {
    return this.http.getList(AGENDA_ITEMS_URL, query, AGENDA_ITEM_SPEC);
  }

  getRaitAgendaItem(id: string): Promise<RaitAgendaItem> {
    return this.http.getOne(AGENDA_ITEMS_URL, 'agenda-items', id);
  }

  listRaitAttendance(query: ListQuery = {}): Promise<ListPage<RaitAttendance>> {
    return this.http.getList(ATTENDANCE_URL, query, ATTENDANCE_SPEC);
  }

  getRaitAttendance(id: string): Promise<RaitAttendance> {
    return this.http.getOne(ATTENDANCE_URL, 'attendance', id);
  }

  listRaitVote(query: ListQuery = {}): Promise<ListPage<RaitVote>> {
    return this.http.getList(VOTES_URL, query, VOTE_SPEC);
  }

  getRaitVote(id: string): Promise<RaitVote> {
    return this.http.getOne(VOTES_URL, 'votes', id);
  }

  listRaitMinutes(query: ListQuery = {}): Promise<ListPage<RaitMinutes>> {
    return this.http.getList(MINUTES_URL, query, MINUTES_SPEC);
  }

  getRaitMinutes(id: string): Promise<RaitMinutes> {
    return this.http.getOne(MINUTES_URL, 'minutes', id);
  }

  // --- comandos (§3.5; M8 — todos lançam até R-0007 CTG-0004) ----------------------------

  /** §3.5 #19 — `register:<agendaItemId>`. */
  async registerOpinion(
    _agendaItemId: string,
    _body: CommandBody &
      Pick<
        RaitAgendaItem,
        'opinion_summary' | 'opinion_analysis' | 'opinion_vote'
      >,
    _ifMatch: string | null,
  ): Promise<CommandResult<RaitAgendaItem>> {
    // todo(R-0007 CTG-0004): ligar ao cliente gerado de BP-INF-RAIT-SESSION-001.commands
    throw new RaitCommandUnavailableError('rait-opinion:register');
  }

  /** §3.5 #20 — `close:<sessionId>`. */
  async closeAgenda(
    _sessionId: string,
    _body: CommandBody,
    _ifMatch: string | null,
  ): Promise<CommandResult<RaitSession>> {
    // todo(R-0007 CTG-0004): ligar ao cliente gerado de BP-INF-RAIT-SESSION-001.commands
    throw new RaitCommandUnavailableError('rait-agenda:close');
  }

  /** §3.5 #21 — `open:<sessionId>`. */
  async openSession(
    _sessionId: string,
    _body: CommandBody,
    _ifMatch: string | null,
  ): Promise<CommandResult<RaitSession>> {
    // todo(R-0007 CTG-0004): ligar ao cliente gerado de BP-INF-RAIT-SESSION-001.commands
    throw new RaitCommandUnavailableError('rait-session:open');
  }

  /** §3.5 #22 — `adjourn:<sessionId>`. */
  async adjournSession(
    _sessionId: string,
    _body: CommandBody,
    _ifMatch: string | null,
  ): Promise<CommandResult<RaitSession>> {
    // todo(R-0007 CTG-0004): ligar ao cliente gerado de BP-INF-RAIT-SESSION-001.commands
    throw new RaitCommandUnavailableError('rait-session:adjourn');
  }

  /** §3.5 #23 — `vote:<agenda_item_id>`. */
  async vote(_body: CreateRaitVoteDto): Promise<CommandResult<RaitVote>> {
    // todo(R-0007 CTG-0004): ligar ao cliente gerado de BP-INF-RAIT-SESSION-001.commands
    throw new RaitCommandUnavailableError('rait-session:vote');
  }

  /** §3.5 #24 — `casting-vote:<agenda_item_id>` (`casting_vote: true`). */
  async castingVote(
    _body: CreateRaitVoteDto,
  ): Promise<CommandResult<RaitVote>> {
    // todo(R-0007 CTG-0004): ligar ao cliente gerado de BP-INF-RAIT-SESSION-001.commands
    throw new RaitCommandUnavailableError('rait-session:casting-vote');
  }

  /** §3.5 #25 — `view-request:<agendaItemId>`. */
  async requestView(
    _agendaItemId: string,
    _body: CommandBody,
    _ifMatch: string | null,
  ): Promise<CommandResult<RaitAgendaItem>> {
    // todo(R-0007 CTG-0004): ligar ao cliente gerado de BP-INF-RAIT-SESSION-001.commands
    throw new RaitCommandUnavailableError('rait-session:view-request');
  }

  /** §3.5 #26 — `proclaim:<agendaItemId>`. */
  async proclaim(
    _agendaItemId: string,
    _body: CommandBody,
    _ifMatch: string | null,
  ): Promise<CommandResult<RaitAgendaItem>> {
    // todo(R-0007 CTG-0004): ligar ao cliente gerado de BP-INF-RAIT-SESSION-001.commands
    throw new RaitCommandUnavailableError('rait-session:proclaim');
  }

  /** §3.5 #27 — `generate:<session_id>`. */
  async generateMinutes(
    _body: CreateRaitMinutesDto,
  ): Promise<CommandResult<RaitMinutes>> {
    // todo(R-0007 CTG-0004): ligar ao cliente gerado de BP-INF-RAIT-SESSION-001.commands
    throw new RaitCommandUnavailableError('rait-minutes:generate');
  }

  /** §3.5 #28 — `sign:<minutesId>`. */
  async signMinutes(
    _minutesId: string,
    _body: CommandBody,
    _ifMatch: string | null,
  ): Promise<CommandResult<RaitMinutes>> {
    // todo(R-0007 CTG-0004): ligar ao cliente gerado de BP-INF-RAIT-SESSION-001.commands
    throw new RaitCommandUnavailableError('rait-minutes:sign');
  }

  /** §3.5 #29 — `publish:<minutesId>`. */
  async publishMinutes(
    _minutesId: string,
    _body: CommandBody,
    _ifMatch: string | null,
  ): Promise<CommandResult<RaitMinutes>> {
    // todo(R-0007 CTG-0004): ligar ao cliente gerado de BP-INF-RAIT-SESSION-001.commands
    throw new RaitCommandUnavailableError('rait-minutes:publish');
  }

  /** §3.5 #51 (ficha; OD-R12-027) — `confirm:<session_id>/<member_id>`. */
  async confirmAttendance(
    _body: CreateRaitAttendanceDto,
  ): Promise<CommandResult<RaitAttendance>> {
    // todo(R-0007 CTG-0004): ligar ao cliente gerado de BP-INF-RAIT-SESSION-001.commands
    throw new RaitCommandUnavailableError('rait-attendance:confirm');
  }

  /** §3.5 #52 (ficha; OD-R12-027) — `summon-substitute:<session_id>`. */
  async summonSubstitute(
    _body: CreateRaitSubstituteDutyDto,
  ): Promise<CommandResult<RaitSubstituteDuty>> {
    // todo(R-0007 CTG-0004): ligar ao cliente gerado de BP-INF-RAIT-SESSION-001.commands
    throw new RaitCommandUnavailableError('rait-attendance:summon-substitute');
  }

  /** §3.5 #53 (ficha; OD-R12-027) — `register-view-vote:<agendaItemId>`. */
  async registerViewVote(
    _agendaItemId: string,
    _body: CommandBody & Pick<RaitAgendaItem, 'opinion_vote'>,
    _ifMatch: string | null,
  ): Promise<CommandResult<RaitAgendaItem>> {
    // todo(R-0007 CTG-0004): ligar ao cliente gerado de BP-INF-RAIT-SESSION-001.commands
    throw new RaitCommandUnavailableError('rait-session:register-view-vote');
  }

  /** §3.5 #54 (ficha; OD-R12-027) — `convene-extraordinary:<judging_body>` (`extraordinary: true`). */
  async conveneExtraordinary(
    _body: CreateRaitSessionDto,
  ): Promise<CommandResult<RaitSession>> {
    // todo(R-0007 CTG-0004): ligar ao cliente gerado de BP-INF-RAIT-SESSION-001.commands
    throw new RaitCommandUnavailableError('rait-session:convene-extraordinary');
  }
}
