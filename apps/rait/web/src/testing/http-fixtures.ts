// R-0012 TASK-0008 (Inspector). Fixtures HTTP centralizadas para o CTG-0002b (contrato §7):
// constantes e `fixture*` lidas de `docs/framework/arch/fixtures/rait-fixtures.json` (via
// `kb.ts` `FIXTURES_PATH`), nunca copiadas para este arquivo. Regra de ouro (`rait-fixtures.md`
// intro + §7; padrão `apps/portal/web/src/testing/http-fixtures.ts`): "nenhum valor
// inventado — cada constante cita a linha de onde veio"; ids só do JSON, nunca
// `randomUUID()` de recurso do RAIT; o tenant nunca é alterado.
//
// `FIXTURE_FILLERS` preenche só campos OBRIGATÓRIOS do contrato gerado que o JSON não traz
// (estrutural — nunca um fato de negócio). Nenhum teste afirma um valor de filler; toda
// asserção do §8 é sobre um campo que veio do JSON ou de `rait-fixtures.md` (citado abaixo).
// Onde `rait-fixtures.md` documenta um fato que o JSON não carrega (ex.: caso 01 "canal
// postal", caso 03 "archived=true", caso 05 "efeito suspensivo"), o valor vem do texto do
// documento, citado linha a linha — nunca do filler genérico.
//
// `RaitCase`/`RaitSession`/… vêm de `data/models` (TASK-0009; ainda inexistente nesta entrega —
// falha de módulo esperada, contrato §1 "os testes podem e devem falhar… por símbolos ainda
// inexistentes").
import { readFileSync } from 'node:fs';
import type {
  HttpTestingController,
  TestRequest,
} from '@angular/common/http/testing';
import type {
  CollectionDocument,
  DebtHandoff,
  Payment,
  RaitAgendaItem,
  RaitBatch,
  RaitBatchItem,
  RaitBench,
  RaitCapacityPlan,
  RaitCase,
  RaitCaseState,
  RaitClock,
  RaitDraft,
  RaitExport,
  RaitHoliday,
  RaitIncident,
  RaitJetonSheet,
  RaitPendingContent,
  RaitPool,
  RaitPoolMember,
  RaitQualitySample,
  RaitReconciliation,
  RaitRedirect,
  RefundOrder,
  RaitSchedule,
  RaitScheduleSlot,
  RaitSession,
  RaitSubstituteDuty,
  RaitSuspensionAct,
  RaitUnit,
} from '../app/data/models';
import type { ListPage, ListQuery } from '../app/data/models/list-page';
import { applyListQuery } from '../app/data/list-query';
import type { RaitRoleCode } from './route-manifest.fixture';
import { FIXTURES_PATH } from './kb';

const fixtures = JSON.parse(
  readFileSync(FIXTURES_PATH, 'utf8'),
) as RaitFixturesFile;

interface RaitFixturesFile {
  readonly today: string;
  readonly tenant: { readonly id: string; readonly slug: string };
  readonly users: readonly {
    readonly id: string;
    readonly roles: readonly string[];
  }[];
  readonly pools: Readonly<Record<string, string>>;
  readonly poolMembers: readonly Record<string, unknown>[];
  readonly cases: readonly Record<string, unknown>[];
  readonly sessions: readonly Record<string, unknown>[];
  readonly agendaItems: readonly Record<string, unknown>[];
  readonly clocks: readonly Record<string, unknown>[];
  readonly raitUnits: readonly Record<string, unknown>[];
  readonly raitSchedules: readonly Record<string, unknown>[];
  readonly raitScheduleSlots: readonly Record<string, unknown>[];
  readonly raitBatches: readonly Record<string, unknown>[];
  readonly raitBatchItems: readonly Record<string, unknown>[];
  readonly raitSubstituteDuties: readonly Record<string, unknown>[];
  readonly raitBenches: readonly Record<string, unknown>[];
  readonly raitPendingContents: readonly Record<string, unknown>[];
  readonly raitRedirects: readonly Record<string, unknown>[];
  readonly raitDrafts: readonly Record<string, unknown>[];
  readonly raitHolidays: readonly Record<string, unknown>[];
  readonly raitSuspensionActs: readonly Record<string, unknown>[];
  readonly raitJetonSheets: readonly Record<string, unknown>[];
  readonly raitIncidents: readonly Record<string, unknown>[];
  readonly raitQualitySamples: readonly Record<string, unknown>[];
  readonly raitCapacityPlans: readonly Record<string, unknown>[];
  readonly raitExports: readonly Record<string, unknown>[];
  readonly collectionDocuments: readonly Record<string, unknown>[];
  readonly payments: readonly Record<string, unknown>[];
  readonly refundOrders: readonly Record<string, unknown>[];
  readonly debtHandoffs: readonly Record<string, unknown>[];
  readonly raitReconciliations: readonly Record<string, unknown>[];
}

export const FIXTURE_TENANT_ID = fixtures.tenant.id; // rait-fixtures.json "tenant.id"
export const FIXTURE_TODAY = fixtures.today; // rait-fixtures.json "today" = '2026-09-14'

function byId<T extends Record<string, unknown>>(
  list: readonly T[],
  id: string,
  label: string,
): T {
  const found = list.find((item) => item['id'] === id);
  if (!found)
    throw new Error(`${label}: id não encontrado nas fixtures: ${id}`);
  return found;
}

/** Um id por `RaitCaseState`, o de menor NN quando o estado se repete (rait-fixtures.md §3: a
 * lista já está em ordem de NN — o primeiro encontrado por estado é o de menor NN). */
function buildCaseIds(): Readonly<Record<RaitCaseState, string>> {
  const map: Record<string, string> = {};
  for (const entry of fixtures.cases) {
    const state = entry['state'] as string;
    if (!(state in map)) map[state] = entry['id'] as string;
  }
  return map as Readonly<Record<RaitCaseState, string>>;
}
export const CASE_IDS = buildCaseIds();

/** Os 4 estados de sessão citados no contrato §7 (rait-fixtures.md §4: sessões 1-4, uma por
 * estado — nenhuma se repete, então "menor N" não se aplica). */
function buildSessionIds(): Readonly<
  Record<
    'FORMANDO_PAUTA' | 'PAUTA_FECHADA' | 'ATA_ASSINADA' | 'SESSAO_ABERTA',
    string
  >
> {
  const map: Record<string, string> = {};
  for (const entry of fixtures.sessions) {
    const state = entry['state'] as string;
    if (!(state in map)) map[state] = entry['id'] as string;
  }
  return map as Readonly<
    Record<
      'FORMANDO_PAUTA' | 'PAUTA_FECHADA' | 'ATA_ASSINADA' | 'SESSAO_ABERTA',
      string
    >
  >;
}
export const SESSION_IDS = buildSessionIds();

/** `fixtures.pools` já é `{ defesa_previa, jari, cetran } → id`. */
export const POOL_IDS: Readonly<
  Record<'defesa_previa' | 'jari' | 'cetran', string>
> = fixtures.pools as Readonly<
  Record<'defesa_previa' | 'jari' | 'cetran', string>
>;

/** Primeiro usuário de `fixtures.users` com o papel (rait-fixtures.md §1, ordem NN 01…20). */
function buildUserIds(): Readonly<Record<RaitRoleCode, string>> {
  const roles: readonly RaitRoleCode[] = [
    'rait-analyst',
    'rait-coordinator',
    'rait-secretary',
    'rait-signing-authority',
    'rait-central-authority',
    'rait-rapporteur',
    'rait-chair',
    'rait-manager',
    'rait-hr',
    'rait-finance',
    'integration-operator',
    'AUDITOR',
    'agency-admin',
  ];
  const map: Record<string, string> = {};
  for (const role of roles) {
    const user = fixtures.users.find((candidate) =>
      candidate.roles.includes(role),
    );
    if (!user)
      throw new Error(`http-fixtures: nenhum usuário com papel ${role}`);
    map[role] = user.id;
  }
  return map as Readonly<Record<RaitRoleCode, string>>;
}
export const USER_IDS = buildUserIds();

/**
 * Preenchimento estrutural de campos obrigatórios que o JSON não traz (contrato §7). Nenhum
 * teste afirma diretamente um destes valores — servem só para que o objeto satisfaça o tipo
 * gerado. Onde `rait-fixtures.md` documenta o fato (caso 01 canal postal, caso 03 archived,
 * caso 05 efeito suspensivo), a função `fixtureCase` usa o valor documentado, não este filler.
 */
export const FIXTURE_FILLERS = {
  circuit: 0,
  intake_channel: 'source_pending', // rait-fixtures.md §3 só documenta o canal do caso 01
  suspensive_effect: false,
  archived: false,
  last_movement_at: FIXTURE_TODAY,
  pending_completion: false,
  version: 1,
  created_at: FIXTURE_TODAY,
  legal_basis: 'source_pending',
  started_on: FIXTURE_TODAY,
  flag_changed_at: FIXTURE_TODAY,
  quorum_required: 0,
  position: 0,
  priority: false,
  rapporteur_member_id: USER_IDS['rait-rapporteur'],
  confirmed_count: 0,
  active: true,
  opened_at: FIXTURE_TODAY,
  requested_at: FIXTURE_TODAY,
  requested_by: USER_IDS['AUDITOR'],
  generated_at: FIXTURE_TODAY,
  designated_at: FIXTURE_TODAY,
  optional: false,
  claim_due_on: FIXTURE_TODAY,
  scope: {},
} as const;

/** `rait-fixtures.md` §3: fatos documentados fora do JSON, por NN do protocolo. */
const CASE_TEXT_FACTS: Readonly<
  Record<
    string,
    { intake_channel?: string; archived?: boolean; suspensive_effect?: boolean }
  >
> = {
  'RAIT-2026-000001': { intake_channel: 'postal' }, // "protocolado hoje, canal postal"
  'RAIT-2026-000003': { archived: true }, // "intempestivo, archived=true"
  'RAIT-2026-000005': { suspensive_effect: true }, // "efeito suspensivo"
};

export function fixtureCase(id: string): RaitCase {
  const entry = byId(fixtures.cases, id, 'fixtureCase');
  const protocol = entry['protocol'] as string;
  const facts = CASE_TEXT_FACTS[protocol] ?? {};
  return {
    id: entry['id'] as string,
    tenant_id: FIXTURE_TENANT_ID,
    ait_id: entry['aitId'] as string,
    protocol_number: protocol,
    instance: entry['instance'] as RaitCase['instance'],
    circuit: FIXTURE_FILLERS.circuit,
    state: entry['state'] as RaitCase['state'],
    intake_channel: facts.intake_channel ?? FIXTURE_FILLERS.intake_channel,
    protocolled_at: entry['protocolledOn'] as string,
    suspensive_effect:
      facts.suspensive_effect ?? FIXTURE_FILLERS.suspensive_effect,
    archived: facts.archived ?? FIXTURE_FILLERS.archived,
    last_movement_at: FIXTURE_FILLERS.last_movement_at,
    pending_completion: FIXTURE_FILLERS.pending_completion,
    version: FIXTURE_FILLERS.version,
    created_at: FIXTURE_FILLERS.created_at,
  } as RaitCase;
}

export function fixtureSession(id: string): RaitSession {
  const entry = byId(fixtures.sessions, id, 'fixtureSession');
  return {
    id: entry['id'] as string,
    tenant_id: FIXTURE_TENANT_ID,
    judging_body: entry['body'] as RaitSession['judging_body'],
    state: entry['state'] as RaitSession['state'],
    quorum_required: FIXTURE_FILLERS.quorum_required,
    created_at: FIXTURE_FILLERS.created_at,
  } as RaitSession;
}

export function fixtureAgendaItem(id: string): RaitAgendaItem {
  const entry = byId(fixtures.agendaItems, id, 'fixtureAgendaItem');
  return {
    id: entry['id'] as string,
    tenant_id: FIXTURE_TENANT_ID,
    session_id: entry['session'] as string,
    case_id: entry['caseId'] as string,
    position: FIXTURE_FILLERS.position,
    priority: FIXTURE_FILLERS.priority,
    rapporteur_member_id: FIXTURE_FILLERS.rapporteur_member_id,
    withdrawn: false,
    version: FIXTURE_FILLERS.version,
    created_at: FIXTURE_FILLERS.created_at,
    ...(entry['outcome'] !== undefined
      ? { outcome: entry['outcome'] as RaitAgendaItem['outcome'] }
      : {}),
  } as RaitAgendaItem;
}

export function fixtureClock(id: string): RaitClock {
  const entry = byId(fixtures.clocks, id, 'fixtureClock');
  return {
    id: entry['id'] as string,
    tenant_id: FIXTURE_TENANT_ID,
    case_id: entry['caseId'] as string,
    clock_code: entry['code'] as RaitClock['clock_code'],
    started_on: FIXTURE_FILLERS.started_on,
    ceiling_on: entry['ceilingOn'] as string,
    flag: entry['flag'] as RaitClock['flag'],
    flag_changed_at: FIXTURE_FILLERS.flag_changed_at,
    legal_basis: FIXTURE_FILLERS.legal_basis,
    created_at: FIXTURE_FILLERS.created_at,
  } as RaitClock;
}

export function fixturePool(id: string): RaitPool {
  const [instance] =
    Object.entries(POOL_IDS).find(([, poolId]) => poolId === id) ?? [];
  if (!instance) throw new Error(`fixturePool: id não encontrado: ${id}`);
  // rait-fixtures.md §1: "…20000001 defesa_previa (pull)", "…20000002 JARI-AM (round_robin)",
  // "…20000003 CETRAN-AM (round_robin)" — estratégia documentada; nome não é dado no texto além
  // do rótulo da instância (source_pending).
  const strategy: RaitPool['strategy'] =
    instance === 'defesa_previa' ? 'pull' : 'round_robin';
  return {
    id,
    tenant_id: FIXTURE_TENANT_ID,
    name: 'source_pending',
    instance: instance as RaitPool['instance'],
    circuit: FIXTURE_FILLERS.circuit,
    strategy,
    active: FIXTURE_FILLERS.active,
    priority_policy: 'ordem_unica', // único valor do enum gerado — não é filler de negócio
    created_at: FIXTURE_FILLERS.created_at,
  } as RaitPool;
}

export function fixturePoolMember(id: string): RaitPoolMember {
  const entry = byId(fixtures.poolMembers, id, 'fixturePoolMember');
  return {
    id: entry['id'] as string,
    tenant_id: FIXTURE_TENANT_ID,
    pool_id: entry['pool'] as string,
    person_id: entry['userId'] as string,
    member_role: entry['memberRole'] as RaitPoolMember['member_role'],
    status: 'ATIVO', // rait-fixtures.md §1: só João (NN10) é ADVERTIDO — não modelado por id aqui
    is_substitute: false,
    created_at: FIXTURE_FILLERS.created_at,
  } as RaitPoolMember;
}

export function fixtureUnit(id: string): RaitUnit {
  const entry = byId(fixtures.raitUnits, id, 'fixtureUnit');
  return {
    id: entry['id'] as string,
    tenant_id: FIXTURE_TENANT_ID,
    name: entry['name'] as string,
    judging_body: entry['judgingBody'] as RaitUnit['judging_body'],
    state: entry['state'] as RaitUnit['state'],
    created_at: FIXTURE_FILLERS.created_at,
    ...(entry['coordinatorMemberId'] !== undefined
      ? { coordinator_member_id: entry['coordinatorMemberId'] as string }
      : {}),
  } as RaitUnit;
}

export function fixtureSchedule(id: string): RaitSchedule {
  const entry = byId(fixtures.raitSchedules, id, 'fixtureSchedule');
  return {
    id: entry['id'] as string,
    tenant_id: FIXTURE_TENANT_ID,
    pool_id: POOL_IDS.defesa_previa, // rait-fixtures.md §1: escalas 001-002 são do pool de defesa
    member_id: entry['memberId'] as string,
    kind: entry['kind'] as RaitSchedule['kind'],
    period_start: entry['periodStart'] as string,
    period_end: entry['periodEnd'] as string,
    availability: entry['availability'] as RaitSchedule['availability'],
    version: FIXTURE_FILLERS.version,
    created_at: FIXTURE_FILLERS.created_at,
  } as RaitSchedule;
}

export function fixtureScheduleSlot(id: string): RaitScheduleSlot {
  const entry = byId(fixtures.raitScheduleSlots, id, 'fixtureScheduleSlot');
  return {
    id: entry['id'] as string,
    tenant_id: FIXTURE_TENANT_ID,
    schedule_id: entry['scheduleId'] as string,
    slot_on: entry['slotOn'] as string,
    availability: entry['availability'] as RaitScheduleSlot['availability'],
    created_at: FIXTURE_FILLERS.created_at,
  } as RaitScheduleSlot;
}

export function fixtureBatch(id: string): RaitBatch {
  const entry = byId(fixtures.raitBatches, id, 'fixtureBatch');
  return {
    id: entry['id'] as string,
    tenant_id: FIXTURE_TENANT_ID,
    pool_id: entry['poolId'] as string,
    kind: entry['kind'] as RaitBatch['kind'],
    week_start: entry['weekStart'] as string,
    state: entry['state'] as RaitBatch['state'],
    opened_at: FIXTURE_FILLERS.opened_at,
    ...(entry['seed'] !== undefined
      ? { seed: entry['seed'] as string | null }
      : {}),
    ...(entry['drawnAt'] !== undefined
      ? { drawn_at: entry['drawnAt'] as string }
      : {}),
  } as RaitBatch;
}

export function fixtureBatchItem(id: string): RaitBatchItem {
  const entry = byId(fixtures.raitBatchItems, id, 'fixtureBatchItem');
  return {
    id: entry['id'] as string,
    tenant_id: FIXTURE_TENANT_ID,
    batch_id: entry['batchId'] as string,
    case_id: entry['caseId'] as string,
    position: entry['position'] as number,
    created_at: FIXTURE_FILLERS.created_at,
    ...(entry['memberId'] !== undefined
      ? { member_id: entry['memberId'] as string }
      : {}),
    ...(entry['claimDueOn'] !== undefined
      ? { claim_due_on: entry['claimDueOn'] as string }
      : {}),
  } as RaitBatchItem;
}

export function fixtureBench(id: string): RaitBench {
  const entry = byId(fixtures.raitBenches, id, 'fixtureBench');
  return {
    id: entry['id'] as string,
    tenant_id: FIXTURE_TENANT_ID,
    session_id: entry['sessionId'] as string,
    state: entry['state'] as RaitBench['state'],
    confirmed_count: entry['confirmedCount'] as number,
    created_at: FIXTURE_FILLERS.created_at,
    ...(entry['confirmedAt'] !== undefined
      ? { confirmed_at: entry['confirmedAt'] as string }
      : {}),
  } as RaitBench;
}

export function fixtureSubstituteDuty(id: string): RaitSubstituteDuty {
  const entry = byId(
    fixtures.raitSubstituteDuties,
    id,
    'fixtureSubstituteDuty',
  );
  return {
    id: entry['id'] as string,
    tenant_id: FIXTURE_TENANT_ID,
    session_id: entry['sessionId'] as string,
    member_id: entry['memberId'] as string,
    designated_at: entry['designatedAt'] as string,
    created_at: FIXTURE_FILLERS.created_at,
    ...(entry['convenedAt'] !== undefined
      ? { convened_at: entry['convenedAt'] as string }
      : {}),
  } as RaitSubstituteDuty;
}

export function fixturePendingContent(id: string): RaitPendingContent {
  const entry = byId(fixtures.raitPendingContents, id, 'fixturePendingContent');
  return {
    id: entry['id'] as string,
    tenant_id: FIXTURE_TENANT_ID,
    case_id: entry['caseId'] as string,
    missing_items: {},
    due_on: entry['dueOn'] as string,
    opened_at: FIXTURE_FILLERS.opened_at,
    opened_by: USER_IDS['rait-secretary'],
    created_at: FIXTURE_FILLERS.created_at,
    ...(entry['closedAt'] !== undefined
      ? { closed_at: entry['closedAt'] as string }
      : {}),
    ...(entry['outcome'] !== undefined
      ? { outcome: entry['outcome'] as RaitPendingContent['outcome'] }
      : {}),
  } as RaitPendingContent;
}

export function fixtureRedirect(id: string): RaitRedirect {
  const entry = byId(fixtures.raitRedirects, id, 'fixtureRedirect');
  return {
    id: entry['id'] as string,
    tenant_id: FIXTURE_TENANT_ID,
    direction: entry['direction'] as RaitRedirect['direction'],
    reason: entry['reason'] as RaitRedirect['reason'],
    protocol_number: entry['protocolNumber'] as string,
    counterpart_agency: 'source_pending',
    deadline_restored: (entry['deadlineRestored'] as boolean) ?? false,
    redirected_at: FIXTURE_FILLERS.created_at,
    created_at: FIXTURE_FILLERS.created_at,
    ...(entry['caseId'] !== undefined
      ? { case_id: entry['caseId'] as string }
      : {}),
    ...(entry['originProtocolledOn'] !== undefined
      ? { origin_protocolled_on: entry['originProtocolledOn'] as string }
      : {}),
  } as RaitRedirect;
}

export function fixtureDraft(id: string): RaitDraft {
  const entry = byId(fixtures.raitDrafts, id, 'fixtureDraft');
  return {
    id: entry['id'] as string,
    tenant_id: FIXTURE_TENANT_ID,
    case_id: entry['caseId'] as string,
    version: entry['version'] as number,
    author_id: USER_IDS['rait-analyst'],
    content_hash: 'source_pending',
    status: entry['status'] as RaitDraft['status'],
    return_count: 0,
    created_at: FIXTURE_FILLERS.created_at,
  } as RaitDraft;
}

export function fixtureHoliday(id: string): RaitHoliday {
  const entry = byId(fixtures.raitHolidays, id, 'fixtureHoliday');
  return {
    id: entry['id'] as string,
    tenant_id: FIXTURE_TENANT_ID,
    name: entry['name'] as string,
    holiday_on: entry['holidayOn'] as string,
    scope: entry['scope'] as RaitHoliday['scope'],
    optional: FIXTURE_FILLERS.optional,
    created_at: FIXTURE_FILLERS.created_at,
  } as RaitHoliday;
}

export function fixtureSuspensionAct(id: string): RaitSuspensionAct {
  const entry = byId(fixtures.raitSuspensionActs, id, 'fixtureSuspensionAct');
  return {
    id: entry['id'] as string,
    tenant_id: FIXTURE_TENANT_ID,
    reason: 'source_pending',
    starts_on: entry['startsOn'] as string,
    ends_on: entry['endsOn'] as string,
    timer_codes: {},
    evidence_document_id: 'source_pending',
    signed_by: USER_IDS['rait-signing-authority'],
    signed_at: FIXTURE_FILLERS.created_at,
    state: entry['state'] as RaitSuspensionAct['state'],
    ...(entry['revokedAt'] !== undefined
      ? { revoked_at: entry['revokedAt'] as string }
      : {}),
  } as RaitSuspensionAct;
}

export function fixtureJetonSheet(id: string): RaitJetonSheet {
  const entry = byId(fixtures.raitJetonSheets, id, 'fixtureJetonSheet');
  return {
    id: entry['id'] as string,
    tenant_id: FIXTURE_TENANT_ID,
    judging_body: entry['judgingBody'] as RaitJetonSheet['judging_body'],
    period_start: entry['periodStart'] as string,
    period_end: entry['periodEnd'] as string,
    state: entry['state'] as RaitJetonSheet['state'],
    generated_at: FIXTURE_FILLERS.generated_at,
  } as RaitJetonSheet;
}

export function fixtureIncident(id: string): RaitIncident {
  const entry = byId(fixtures.raitIncidents, id, 'fixtureIncident');
  return {
    id: entry['id'] as string,
    tenant_id: FIXTURE_TENANT_ID,
    incident_ref: entry['incidentRef'] as string,
    opened_at: FIXTURE_FILLERS.opened_at,
    created_at: FIXTURE_FILLERS.created_at,
    ...(entry['clockId'] !== undefined
      ? { clock_id: entry['clockId'] as string }
      : {}),
    ...(entry['caseId'] !== undefined
      ? { case_id: entry['caseId'] as string }
      : {}),
    ...(entry['closedAt'] !== undefined
      ? { closed_at: entry['closedAt'] as string }
      : {}),
  } as RaitIncident;
}

export function fixtureQualitySample(id: string): RaitQualitySample {
  const entry = byId(fixtures.raitQualitySamples, id, 'fixtureQualitySample');
  return {
    id: entry['id'] as string,
    tenant_id: FIXTURE_TENANT_ID,
    period_start: entry['periodStart'] as string,
    period_end: entry['periodEnd'] as string,
    case_id: entry['caseId'] as string,
    sampled_at: FIXTURE_FILLERS.created_at,
    systemic: false,
    ...(entry['findingKind'] !== undefined
      ? {
          finding_kind: entry[
            'findingKind'
          ] as RaitQualitySample['finding_kind'],
        }
      : {}),
  } as RaitQualitySample;
}

export function fixtureCapacityPlan(id: string): RaitCapacityPlan {
  const entry = byId(fixtures.raitCapacityPlans, id, 'fixtureCapacityPlan');
  return {
    id: entry['id'] as string,
    tenant_id: FIXTURE_TENANT_ID,
    pool_id: entry['poolId'] as string,
    period_start: entry['periodStart'] as string,
    period_end: entry['periodEnd'] as string,
    months_over_capacity: entry['monthsOverCapacity'] as number,
    reinforcement_requested:
      (entry['reinforcementRequested'] as boolean) ?? false,
    unit_proposed: (entry['unitProposed'] as boolean) ?? false,
    registered_at: FIXTURE_FILLERS.created_at,
    ...(entry['closedAt'] !== undefined
      ? { closed_at: entry['closedAt'] as string }
      : {}),
  } as RaitCapacityPlan;
}

export function fixtureExport(id: string): RaitExport {
  const entry = byId(fixtures.raitExports, id, 'fixtureExport');
  return {
    id: entry['id'] as string,
    tenant_id: FIXTURE_TENANT_ID,
    purpose: 'source_pending',
    scope: FIXTURE_FILLERS.scope,
    requested_by: FIXTURE_FILLERS.requested_by,
    requested_at: FIXTURE_FILLERS.requested_at,
    status: entry['status'] as RaitExport['status'],
    ...(entry['rowCount'] !== undefined
      ? { row_count: entry['rowCount'] as number }
      : {}),
  } as RaitExport;
}

export function fixtureReconciliation(id: string): RaitReconciliation {
  const entry = byId(fixtures.raitReconciliations, id, 'fixtureReconciliation');
  return {
    id: entry['id'] as string,
    tenant_id: FIXTURE_TENANT_ID,
    system: entry['system'] as RaitReconciliation['system'],
    window_from: entry['windowFrom'] as string,
    window_to: entry['windowTo'] as string,
    requested_by: FIXTURE_FILLERS.requested_by,
    requested_at: FIXTURE_FILLERS.requested_at,
    status: entry['status'] as RaitReconciliation['status'],
  } as RaitReconciliation;
}

export function fixtureCollectionDocument(id: string): CollectionDocument {
  const entry = byId(
    fixtures.collectionDocuments,
    id,
    'fixtureCollectionDocument',
  );
  return {
    id: entry['id'] as string,
    tenant_id: FIXTURE_TENANT_ID,
    infraction_id: entry['infractionId'] as string,
    tier: entry['tier'] as CollectionDocument['tier'],
    status: entry['status'] as CollectionDocument['status'],
    ...(entry['validUntil'] !== undefined
      ? { valid_until: entry['validUntil'] as string }
      : {}),
  } as CollectionDocument;
}

export function fixturePayment(id: string): Payment {
  const entry = byId(fixtures.payments, id, 'fixturePayment');
  return {
    id: entry['id'] as string,
    tenant_id: FIXTURE_TENANT_ID,
    bank_reference: entry['bankReference'] as string,
    paid_on: entry['paidOn'] as string,
    ...(entry['documentId'] !== undefined
      ? { document_id: entry['documentId'] as string }
      : {}),
  } as Payment;
}

export function fixtureRefundOrder(id: string): RefundOrder {
  const entry = byId(fixtures.refundOrders, id, 'fixtureRefundOrder');
  return {
    id: entry['id'] as string,
    tenant_id: FIXTURE_TENANT_ID,
    infraction_id: entry['infractionId'] as string,
    reason: entry['reason'] as RefundOrder['reason'],
    status: entry['status'] as RefundOrder['status'],
    ...(entry['paymentId'] !== undefined
      ? { payment_id: entry['paymentId'] as string }
      : {}),
  } as RefundOrder;
}

export function fixtureDebtHandoff(id: string): DebtHandoff {
  const entry = byId(fixtures.debtHandoffs, id, 'fixtureDebtHandoff');
  return {
    id: entry['id'] as string,
    tenant_id: FIXTURE_TENANT_ID,
    infraction_id: entry['infractionId'] as string,
    status: entry['status'] as DebtHandoff['status'],
    ...(entry['cancelReason'] !== undefined
      ? { cancel_reason: entry['cancelReason'] as string }
      : {}),
  } as DebtHandoff;
}

/** `applyListQuery` sem estreitar (`spec.q`/`spec.filtro` vazios) — envelope de teste puro. */
export function fixtureListPage<T>(
  items: readonly T[],
  query: ListQuery = {},
): ListPage<T> {
  return applyListQuery(items, query, { q: [], filtro: [] });
}

/** Forma do build-pack §0.2: `If-Match: "<updated_at ISO ou version>"`. */
export function etagFor(version: number | string): string {
  return `"${version}"`;
}

export interface RaitErrorBody {
  readonly code: string;
  readonly status: number;
  readonly message: string;
  readonly context?: Record<string, unknown>;
  readonly requestId?: string;
}

/** Envelope `StynxError` do catálogo §1 (mesma forma de `portalErrorBody`). */
export function raitErrorBody(
  code: string,
  status: number,
  context?: Record<string, unknown>,
  requestId?: string,
): RaitErrorBody {
  return {
    code,
    status,
    message: code,
    ...(context ? { context } : {}),
    ...(requestId ? { requestId } : {}),
  };
}

/** `expectOne({ method: 'GET', url })`, prova ausência de query string, responde o array plano. */
export function expectGetList<T>(
  http: HttpTestingController,
  url: string,
  body: readonly T[],
): TestRequest {
  const req = http.expectOne({ method: 'GET', url });
  expect(req.request.params.keys().length).toBe(0);
  req.flush(body);
  return req;
}

/** `expectOne({ method: 'GET', url })`, responde o recurso, com `ETag` quando dado. */
export function expectGetOne<T>(
  http: HttpTestingController,
  url: string,
  body: T,
  etag?: string,
): TestRequest {
  const req = http.expectOne({ method: 'GET', url });
  expect(req.request.params.keys().length).toBe(0);
  // `TestRequest.flush` só aceita o subconjunto de tipos serializáveis do `HttpTestingController`
  // (`ArrayBuffer | Blob | string | number | Object | ... | null`); `T` genérico não é
  // restringível a essa união sem acoplar a assinatura pública ao tipo do kit de teste.
  req.flush(
    body as unknown as Parameters<TestRequest['flush']>[0],
    etag ? { headers: { ETag: etag } } : undefined,
  );
  return req;
}
