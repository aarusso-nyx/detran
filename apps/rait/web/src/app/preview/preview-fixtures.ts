// Fonte única dos adapters da prévia (R-0033 TASK-0003; `frontend-preview-mode.md` §1 item 3, §2,
// D-06, D-07, D-18; `rait-fixtures.md` §10): a fixture canônica
// `docs/framework/arch/fixtures/rait-fixtures.json`, copiada byte a byte para
// `assets/preview/rait-fixtures.json` pelo `angular.json` (configuração `preview`) e lida UMA vez
// por documento (`PreviewFixtureStore.load()`, memoizado; a leitura é o único `GET` permitido pelo
// interceptor). `RaitFixturesJson` tipa as coleções pelo mínimo que os adapters leem (campos da
// JSON em camelCase, tokens tipados pelos tipos gerados de `data/models`); as coleções que os
// adapters não leem (`users`, `aits`) ficam tipadas só pelo `id` (`PreviewFixtureRecord`). Nenhum valor é
// fabricado aqui: o que a JSON não traz vira `PREVIEW_SOURCE_PENDING` (texto) ou bloqueia o
// registro (número/token obrigatório), nos adapters.
import { HttpClient } from '@angular/common/http';
import { Injectable, InjectionToken, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type {
  CollectionDocument,
  DebtHandoff,
  RaitAdmissibility,
  RaitAgendaItem,
  RaitAssignment,
  RaitBatch,
  RaitBatchItem,
  RaitBench,
  RaitCase,
  RaitCaseEvent,
  RaitClock,
  RaitClockAlert,
  RaitCommunication,
  RaitDeadline,
  RaitDecision,
  RaitDocument,
  RaitDraft,
  RaitExport,
  RaitHoliday,
  RaitImpediment,
  RaitInquiry,
  RaitJetonLine,
  RaitJetonSheet,
  RaitMinutes,
  RaitParty,
  RaitPendingContent,
  RaitPool,
  RaitPoolMember,
  RaitQualitySample,
  RaitReconciliation,
  RaitRedirect,
  RaitSchedule,
  RaitScheduleSlot,
  RaitSession,
  RaitSuspensionAct,
  RaitUnit,
  RaitVote,
  RefundOrder,
} from '../data/models';

/** D-06 (5): texto obrigatório sem fonte canônica. */
export const PREVIEW_SOURCE_PENDING = 'source_pending';

/** `tenant.id` de `rait-fixtures.json` (`rait-fixtures.md` §1): o único tenant da prévia. */
export const PREVIEW_TENANT_ID = '00000000-0000-7000-8000-00000000a001';

/** URL relativa do asset (D-18; `angular.json` `assets` → `assets/preview`). */
export const PREVIEW_FIXTURES_URL = 'assets/preview/rait-fixtures.json';

export interface PreviewFixtureRecord {
  readonly id: string;
}

export interface FixtureCase extends PreviewFixtureRecord {
  readonly protocol: string;
  readonly aitId: string;
  readonly instance: RaitCase['instance'];
  readonly state: RaitCase['state'];
  readonly circuit: number;
  readonly intakeChannel: string;
  readonly protocolledAt: string;
  readonly lastMovementAt: string;
  readonly originCaseId?: string;
  readonly archived?: boolean;
  readonly suspensiveEffect?: boolean;
  readonly nonAdmissionReason?: RaitCase['non_admission_reason'];
  readonly admittedAt?: string;
  readonly judgeBodyReceivedAt?: string;
  readonly cetranReceivedAt?: string;
  readonly remittedAt?: string;
  readonly decidedAt?: string;
  readonly communicatedAt?: string;
  readonly closedAt?: string;
}

export interface FixturePendingContent extends PreviewFixtureRecord {
  readonly caseId: string;
  readonly dueOn: string;
  /** `jsonb` da seed (array), tipado como o campo `jsonb` do contrato gerado. */
  readonly missingItems: RaitPendingContent['missing_items'];
  readonly openedBy: string;
  readonly closedAt: string | null;
  readonly outcome: RaitPendingContent['outcome'];
}

export interface FixtureRedirect extends PreviewFixtureRecord {
  readonly direction: RaitRedirect['direction'];
  readonly reason: RaitRedirect['reason'];
  readonly protocolNumber: string;
  readonly caseId: string | null;
  readonly aitNumber: string | null;
  readonly counterpartAgency: string;
  readonly counterpartRenainfCode: string | null;
  readonly originProtocolledOn: string | null;
  readonly deadlineRestored: boolean;
  readonly redirectedAt: string;
  readonly redirectedBy: string;
}

export interface FixtureDraft extends PreviewFixtureRecord {
  readonly caseId: string;
  readonly version: number;
  readonly status: RaitDraft['status'];
  readonly authorId: string;
  readonly contentHash: string;
  readonly submittedAt: string | null;
  readonly returnedAt: string | null;
  readonly returnGuidance: string | null;
  readonly returnCount: number;
  readonly documentId?: string;
}

export interface FixtureParty extends PreviewFixtureRecord {
  readonly caseId: string;
  readonly role: RaitParty['role'];
  readonly legitimacyBasis?: RaitParty['legitimacy_basis'];
  readonly personName: string;
  readonly documentNumber: string;
  readonly contactEmail?: string | null;
}

export interface FixtureDocument extends PreviewFixtureRecord {
  readonly caseId: string;
  readonly kind: string;
  readonly origin: RaitDocument['origin'];
  readonly storageKey: string;
  readonly filename: string;
  readonly contentHash: string;
  readonly digitisedFromPaper: boolean;
  readonly attachedBy?: string | null;
}

export interface FixtureAdmissibility extends PreviewFixtureRecord {
  readonly caseId: string;
  readonly criterion: RaitAdmissibility['criterion'];
  readonly verdict: boolean;
  readonly reason?: string | null;
  readonly evaluatedBy: string;
}

export interface FixtureDeadline extends PreviewFixtureRecord {
  readonly caseId: string;
  readonly timerCode: RaitDeadline['timer_code'];
  readonly startBasis: string;
  readonly startedOn: string;
  readonly rawDueOn: string;
  readonly dueOn: string;
  readonly businessDays: boolean;
  readonly legalBasis: string;
}

export interface FixtureInquiry extends PreviewFixtureRecord {
  readonly caseId: string;
  readonly addressee: RaitInquiry['addressee'];
  readonly subject: string;
  readonly requestedAt: string;
  readonly requestedBy: string;
  readonly dueOn: string;
}

export interface FixtureDecision extends PreviewFixtureRecord {
  readonly caseId: string;
  readonly circuit: number;
  readonly decisionKind: RaitDecision['decision_kind'];
  readonly grounds: string;
  readonly decidedBy: string;
  readonly sessionId?: string | null;
  readonly signatureKind?: string | null;
  readonly signatureRef?: string | null;
  readonly publishedAt?: string | null;
}

export interface FixtureCommunication extends PreviewFixtureRecord {
  readonly caseId: string;
  readonly decisionId?: string | null;
  readonly channel: RaitCommunication['channel'];
  readonly sentAt: string;
  readonly effectiveOn?: string | null;
  readonly nextDeadlineOn?: string | null;
  readonly authorityAppealNotice: boolean;
  readonly contentRef: string;
}

export interface FixtureCaseEvent extends PreviewFixtureRecord {
  readonly caseId: string;
  readonly eventType: string;
  readonly fromState?: string | null;
  readonly toState?: string | null;
  readonly occurredAt: string;
  readonly actorId?: string | null;
  /** `jsonb` da seed, tipado como o campo `jsonb` do contrato gerado. */
  readonly payload?: RaitCaseEvent['payload'];
}

export interface FixtureAssignment extends PreviewFixtureRecord {
  readonly caseId: string;
  readonly poolId: string;
  readonly memberId: string;
  readonly assignedBy?: string | null;
  readonly active: boolean;
  readonly releasedAt?: string | null;
  readonly releaseReason?: RaitAssignment['release_reason'];
}

export interface FixtureImpediment extends PreviewFixtureRecord {
  readonly caseId: string;
  readonly memberId: string;
  readonly basis: string;
  readonly kind: RaitImpediment['kind'];
  readonly legalBasis?: string | null;
}

export interface FixtureClockAlert extends PreviewFixtureRecord {
  readonly clockId: string;
  readonly level: RaitClockAlert['level'];
  readonly notifiedRole: string;
  readonly incidentRef?: string | null;
}

export interface FixtureAttendance extends PreviewFixtureRecord {
  readonly sessionId: string;
  readonly memberId: string;
  readonly present: boolean;
  readonly isChair: boolean;
  readonly absenceJustified?: boolean | null;
}

export interface FixtureVote extends PreviewFixtureRecord {
  readonly agendaItemId: string;
  readonly memberId: string;
  readonly vote: RaitVote['vote'];
  readonly castAt: string;
}

export interface FixtureMinutes extends PreviewFixtureRecord {
  readonly sessionId: string;
  /** `jsonb` da seed, tipado como o campo `jsonb` do contrato gerado. */
  readonly content: RaitMinutes['content'];
  readonly generatedAt: string;
  readonly signedAt?: string | null;
  readonly signedBy?: string | null;
  readonly signatureKind?: string | null;
  readonly signatureRef?: string | null;
  readonly documentHash?: string | null;
  readonly publishedAt?: string | null;
}

export interface FixturePool extends PreviewFixtureRecord {
  readonly name: string;
  readonly instance: RaitPool['instance'];
  readonly circuit: number;
  readonly strategy: RaitPool['strategy'];
}

export interface FixturePoolMember extends PreviewFixtureRecord {
  readonly pool: string;
  readonly userId: string;
  readonly memberRole: RaitPoolMember['member_role'];
  readonly status: RaitPoolMember['status'];
  readonly mandateStartsOn: string | null;
  readonly mandateEndsOn: string | null;
  readonly lateOpinionCount?: number;
  readonly isSubstitute?: boolean;
}

export interface FixtureUnit extends PreviewFixtureRecord {
  readonly name: string;
  readonly judgingBody: RaitUnit['judging_body'];
  readonly state: RaitUnit['state'];
  readonly coordinatorMemberId: string | null;
}

export interface FixtureSchedule extends PreviewFixtureRecord {
  readonly memberId: string;
  readonly poolId: string;
  readonly kind: RaitSchedule['kind'];
  readonly periodStart: string;
  readonly periodEnd: string;
  readonly availability: RaitSchedule['availability'];
  readonly wipLimit: number | null;
  readonly absenceReason: RaitSchedule['absence_reason'];
  readonly publishedAt: string;
  readonly publishedBy: string;
}

export interface FixtureScheduleSlot extends PreviewFixtureRecord {
  readonly scheduleId: string;
  readonly slotOn: string;
  readonly availability: RaitScheduleSlot['availability'];
  readonly absenceReason: RaitScheduleSlot['absence_reason'];
}

export interface FixtureBatch extends PreviewFixtureRecord {
  readonly poolId: string;
  readonly kind: RaitBatch['kind'];
  readonly weekStart: string;
  readonly state: RaitBatch['state'];
  readonly seed: string | null;
  readonly openedBy: string;
  readonly drawnAt: string | null;
  readonly acceptedAt: string | null;
  readonly homologatedAt: string | null;
  readonly homologatedBy: string | null;
}

export interface FixtureBatchItem extends PreviewFixtureRecord {
  readonly batchId: string;
  readonly caseId: string;
  readonly position: number;
  readonly memberId: string | null;
  readonly claimDueOn: string | null;
  readonly acceptedAt: string | null;
  readonly declinedAt: string | null;
  readonly declineKind: RaitBatchItem['decline_kind'];
}

export interface FixtureSubstituteDuty extends PreviewFixtureRecord {
  readonly sessionId: string;
  readonly memberId: string;
  readonly designatedAt: string;
  readonly convenedAt: string | null;
}

export interface FixtureBench extends PreviewFixtureRecord {
  readonly sessionId: string;
  readonly state: RaitBench['state'];
  readonly confirmedCount: number;
  readonly parityObserved: boolean | null;
  readonly confirmedAt: string | null;
  readonly insufficientAt: string | null;
}

export interface FixtureClock extends PreviewFixtureRecord {
  readonly caseId: string;
  readonly code: RaitClock['clock_code'];
  readonly flag: RaitClock['flag'];
  readonly ceilingOn: string;
  readonly startedOn: string;
  readonly legalBasis: string;
}

export interface FixtureSession extends PreviewFixtureRecord {
  readonly body: RaitSession['judging_body'];
  readonly state: RaitSession['state'];
  readonly scheduledFor: string;
  readonly quorumRequired: number;
  readonly chairMemberId: string;
  readonly agendaClosedAt?: string;
  readonly convenedAt?: string;
  readonly openedAt?: string;
  readonly closedAt?: string;
  readonly quorumObserved?: number;
}

export interface FixtureAgendaItem extends PreviewFixtureRecord {
  readonly session: string;
  readonly caseId: string;
  readonly position: number;
  readonly priority: boolean;
  readonly rapporteurMemberId: string;
  readonly opinionSummary: string;
  readonly opinionAnalysis: string;
  readonly opinionVote: RaitAgendaItem['opinion_vote'];
  readonly opinionRegisteredAt: string;
  readonly outcome?: RaitAgendaItem['outcome'];
  readonly readAt?: string;
  readonly proclaimedAt?: string;
}

export interface FixtureHoliday extends PreviewFixtureRecord {
  readonly name: string;
  readonly holidayOn: string;
  readonly scope: RaitHoliday['scope'];
  readonly optional?: boolean;
}

export interface FixtureSuspensionAct extends PreviewFixtureRecord {
  readonly state: RaitSuspensionAct['state'];
  readonly startsOn: string;
  readonly endsOn: string;
  readonly revokedAt?: string;
}

export interface FixtureJetonSheet extends PreviewFixtureRecord {
  readonly judgingBody: RaitJetonSheet['judging_body'];
  readonly periodStart: string;
  readonly periodEnd: string;
  readonly state: RaitJetonSheet['state'];
  readonly sourcePending: boolean;
}

export interface FixtureJetonLine extends PreviewFixtureRecord {
  readonly sheetId: string;
  readonly memberId: string;
  readonly sessionId: string;
  readonly attendanceValid: boolean;
  readonly absenceKind?: RaitJetonLine['absence_kind'];
}

export interface FixtureIncident extends PreviewFixtureRecord {
  readonly incidentRef: string;
  readonly clockId: string;
  readonly caseId: string;
  readonly closedAt?: string;
}

export interface FixtureQualitySample extends PreviewFixtureRecord {
  readonly caseId: string;
  readonly periodStart: string;
  readonly periodEnd: string;
  readonly findingKind?: RaitQualitySample['finding_kind'];
  readonly systemic?: boolean;
}

export interface FixtureCapacityPlan extends PreviewFixtureRecord {
  readonly poolId: string;
  readonly periodStart: string;
  readonly periodEnd: string;
  readonly monthsOverCapacity: number;
  readonly closedAt?: string;
  readonly reinforcementRequested?: boolean;
  readonly unitProposed?: boolean;
}

export interface FixtureExport extends PreviewFixtureRecord {
  readonly status: RaitExport['status'];
  readonly rowCount?: number;
  readonly generatedAt?: string;
}

export interface FixtureReconciliation extends PreviewFixtureRecord {
  readonly system: RaitReconciliation['system'];
  readonly windowFrom: string;
  readonly windowTo: string;
  readonly status: RaitReconciliation['status'];
}

export interface FixtureCollectionDocument extends PreviewFixtureRecord {
  readonly infractionId: string;
  readonly tier: CollectionDocument['tier'];
  readonly status: CollectionDocument['status'];
  readonly validUntil: string;
  readonly supersedesDocumentId?: string;
}

export interface FixturePayment extends PreviewFixtureRecord {
  readonly documentId?: string;
  readonly bankReference: string;
  readonly paidOn: string;
  readonly reversedAt?: string;
}

export interface FixtureRefundOrder extends PreviewFixtureRecord {
  readonly infractionId: string;
  readonly paymentId: string;
  readonly reason: RefundOrder['reason'];
  readonly status: RefundOrder['status'];
}

export interface FixtureDebtHandoff extends PreviewFixtureRecord {
  readonly infractionId: string;
  readonly status: DebtHandoff['status'];
  readonly cancelReason?: DebtHandoff['cancel_reason'];
}

/** As 49 coleções de `rait-fixtures.json` (`rait-fixtures.md` §10), mais `today`/`tenant`/mapas. */
export interface RaitFixturesJson {
  readonly today: string;
  readonly tenant: {
    readonly id: string;
    readonly slug: string;
    readonly timezone: string;
  };
  readonly users: readonly PreviewFixtureRecord[];
  readonly roles: Readonly<Record<string, string>>;
  readonly pools: Readonly<Record<string, string>>;
  readonly poolMembers: readonly FixturePoolMember[];
  readonly raitPools: readonly FixturePool[];
  readonly aits: readonly PreviewFixtureRecord[];
  readonly cases: readonly FixtureCase[];
  readonly parties: readonly FixtureParty[];
  readonly documents: readonly FixtureDocument[];
  readonly admissibility: readonly FixtureAdmissibility[];
  readonly assignments: readonly FixtureAssignment[];
  readonly caseEvents: readonly FixtureCaseEvent[];
  readonly deadlines: readonly FixtureDeadline[];
  readonly inquiries: readonly FixtureInquiry[];
  readonly decisions: readonly FixtureDecision[];
  readonly communications: readonly FixtureCommunication[];
  readonly impediments: readonly FixtureImpediment[];
  readonly sessions: readonly FixtureSession[];
  readonly agendaItems: readonly FixtureAgendaItem[];
  readonly attendance: readonly FixtureAttendance[];
  readonly votes: readonly FixtureVote[];
  readonly minutes: readonly FixtureMinutes[];
  readonly clocks: readonly FixtureClock[];
  readonly clockAlerts: readonly FixtureClockAlert[];
  readonly raitUnits: readonly FixtureUnit[];
  readonly raitSchedules: readonly FixtureSchedule[];
  readonly raitScheduleSlots: readonly FixtureScheduleSlot[];
  readonly raitBatches: readonly FixtureBatch[];
  readonly raitBatchItems: readonly FixtureBatchItem[];
  readonly raitSubstituteDuties: readonly FixtureSubstituteDuty[];
  readonly raitBenches: readonly FixtureBench[];
  readonly raitPendingContents: readonly FixturePendingContent[];
  readonly raitRedirects: readonly FixtureRedirect[];
  readonly raitDrafts: readonly FixtureDraft[];
  readonly raitHolidays: readonly FixtureHoliday[];
  readonly raitSuspensionActs: readonly FixtureSuspensionAct[];
  readonly raitJetonSheets: readonly FixtureJetonSheet[];
  readonly raitJetonLines: readonly FixtureJetonLine[];
  readonly raitIncidents: readonly FixtureIncident[];
  readonly raitQualitySamples: readonly FixtureQualitySample[];
  readonly raitCapacityPlans: readonly FixtureCapacityPlan[];
  readonly raitExports: readonly FixtureExport[];
  readonly collectionDocuments: readonly FixtureCollectionDocument[];
  readonly payments: readonly FixturePayment[];
  readonly refundOrders: readonly FixtureRefundOrder[];
  readonly debtHandoffs: readonly FixtureDebtHandoff[];
  readonly raitReconciliations: readonly FixtureReconciliation[];
}

/** Padrão: `GET assets/preview/rait-fixtures.json` (os specs leem o arquivo do disco). */
export const PREVIEW_FIXTURE_LOADER = new InjectionToken<
  () => Promise<RaitFixturesJson>
>('PREVIEW_FIXTURE_LOADER', {
  providedIn: 'root',
  factory: () => {
    const http = inject(HttpClient);
    return () =>
      firstValueFrom(http.get<RaitFixturesJson>(PREVIEW_FIXTURES_URL));
  },
});

@Injectable({ providedIn: 'root' })
export class PreviewFixtureStore {
  private readonly loader = inject(PREVIEW_FIXTURE_LOADER);
  private loaded: Promise<RaitFixturesJson> | null = null;

  /** Memoizado: uma leitura por documento. */
  load(): Promise<RaitFixturesJson> {
    this.loaded ??= this.loader();
    return this.loaded;
  }
}
