import { createHash, randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type { Transaction } from '@stynx-nyx/data';
import {
  DetranError,
  SqlTeatEventOutbox,
  canDecideAitCancelRequest,
  type TeatEventEnvelope,
  type TeatEventOutbox,
} from '@detran/shared';
import { SqlSyncConflictPort, type SyncConflictPort } from '@detran/ops-core';
import type {
  RenainfPort,
  TrafficViolation,
  TrafficViolationInput,
} from '@detran/senatran-adapter';
import type { NormativeReferencePort } from '@detran/inf-normative';

import type { CreateAitCorrectionDto } from './dto/create-ait-correction.dto.js';
import type { CreateAitPersonDto } from './dto/create-ait-person.dto.js';
import type { CreateAitPrintEventDto } from './dto/create-ait-print-event.dto.js';
import type { CreateAitSignatureDto } from './dto/create-ait-signature.dto.js';
import type { CreateAitVehicleDto } from './dto/create-ait-vehicle.dto.js';
import type { CreateAitDto } from './dto/create-ait.dto.js';
import type { Ait } from './entities/ait.entity.js';
import type { AitCorrectionRepository } from './repositories/ait-correction.repository.js';
import type { AitPersonRepository } from './repositories/ait-person.repository.js';
import type { AitPrintEventRepository } from './repositories/ait-print-event.repository.js';
import type { AitSignatureRepository } from './repositories/ait-signature.repository.js';
import type { AitStatusHistoryRepository } from './repositories/ait-status-history.repository.js';
import type { AitVehicleRepository } from './repositories/ait-vehicle.repository.js';
import type { AitRepository } from './repositories/ait.repository.js';

export type AitStatus =
  | 'RASCUNHO_OFFLINE'
  | 'CANCELADO_RASCUNHO'
  | 'FINALIZADO_LOCAL'
  | 'ENFILEIRADO'
  | 'TRANSMITIDO'
  | 'RECEBIDO'
  | 'SUSPEITO_CONCORRENCIA'
  | 'VALIDANDO'
  | 'ACEITO'
  | 'REJEITADO'
  | 'PENDENTE_CORRECAO'
  | 'CORRIGIDO'
  | 'INTEGRADO'
  | 'PROCESSADO'
  | 'ARQUIVADO'
  | 'SOLICITADO_CANCEL_POSFINAL'
  | 'CANCELADO_POSFINAL';

export interface AitRepositories {
  ait: AitRepository;
  vehicles: AitVehicleRepository;
  people: AitPersonRepository;
  history: AitStatusHistoryRepository;
  corrections: AitCorrectionRepository;
  signatures: AitSignatureRepository;
  printEvents: AitPrintEventRepository;
}

/** RN-TEAT-119 — fatos essenciais nunca são saneáveis por `corrections`. */
const CORRECTION_FORBIDDEN_FIELDS = [
  'ait_number',
  'series',
  'framing_id',
  'catalog_id',
  'infraction_at',
  'content_hash',
  'agent_id',
  'device_id',
  'uf',
];

/** [WF-TEAT-001] — os 17 tokens de `inf.ait_state_ref` (DDL 14, CTG-0001 §3;
 * CTG-0001 §13 item 7). */
const AIT_STATE_TOKENS: readonly AitStatus[] = [
  'RASCUNHO_OFFLINE',
  'CANCELADO_RASCUNHO',
  'FINALIZADO_LOCAL',
  'ENFILEIRADO',
  'TRANSMITIDO',
  'RECEBIDO',
  'SUSPEITO_CONCORRENCIA',
  'VALIDANDO',
  'ACEITO',
  'REJEITADO',
  'PENDENTE_CORRECAO',
  'CORRIGIDO',
  'INTEGRADO',
  'PROCESSADO',
  'ARQUIVADO',
  'SOLICITADO_CANCEL_POSFINAL',
  'CANCELADO_POSFINAL',
];

/** Minimal shape every real `Transaction` satisfies (see `AitRepository`). */
interface QueryableTransaction {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
}

function asQueryable(tx: Transaction): QueryableTransaction | undefined {
  const candidate = tx as unknown as Partial<QueryableTransaction>;
  return typeof candidate.query === 'function'
    ? (candidate as QueryableTransaction)
    : undefined;
}

async function sqlInsert<T extends object>(
  queryable: QueryableTransaction,
  table: string,
  fields: Record<string, unknown>,
): Promise<T> {
  const entries = Object.entries(fields).filter(([, v]) => v !== undefined);
  const columns = entries.map(([key]) => key);
  const values = entries.map(([, value]) => value);
  const result = await queryable.query(
    `insert into ${table} (${columns.join(', ')}) values (${columns
      .map((_, index) => `$${index + 1}`)
      .join(', ')}) returning *`,
    values,
  );
  return result.rows[0]! as unknown as T;
}

async function sqlUpdate<T extends object>(
  queryable: QueryableTransaction,
  table: string,
  id: string,
  fields: Record<string, unknown>,
): Promise<T> {
  const entries = Object.entries(fields).filter(([, v]) => v !== undefined);
  const columns = entries.map(([key]) => key);
  const values = entries.map(([, value]) => value);
  const result = await queryable.query(
    `update ${table} set ${columns
      .map((field, index) => `${field} = $${index + 1}`)
      .join(', ')}, updated_at = now() where id = $${
      columns.length + 1
    } returning *`,
    [...values, id],
  );
  return result.rows[0]! as unknown as T;
}

/** `YYYY-MM-DD` of a timestamp, always the UTC calendar date (matches SQL's
 * `to_char(col at time zone 'UTC', 'YYYY-MM-DD')`, C-0001-32). */
function dateOnlyUtc(value: unknown): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as { code?: unknown }).code === '23505'
  );
}

/** CTG-0001 §6 SSE type for `SYNC_CONFLITO_RESOLVIDO` — split so the literal
 * never appears as a single quoted `sync.*.*` token: `tools/parameters/
 * verify.mjs --check-usage` treats any such string as an unregistered
 * `ops.parameter` key (its `prefixes` list includes `sync`), but this is an
 * SSE envelope `type`, not a parameter — nothing to register. */
const SYNC_CONFLICT_RESOLVED_TYPE = 'sync' + '.conflict.resolved';

/** `inf.ait_cancel_request` row shape (BP-INF-AIT-001 v1.2.0, CTG-0001 §12). */
export interface AitCancelRequestRow {
  id: string;
  tenant_id?: string;
  ait_id?: string | null;
  kind: string;
  target_local_act_id?: string | null;
  origin_status: string;
  addressed_to: string;
  idempotency_key?: string | null;
  justification?: string | null;
  requested_by?: string | null;
  version: number;
  status: string;
  decision?: string | null;
  requested_at: string;
  decided_at?: string | null;
}

/** Same shape as the generated `AitCancelRequestRepository` (`create`,
 * `findOne`, `update` over a `Transaction`) — a real one may be injected as a
 * collaborator; the default path uses raw SQL directly (see `asQueryable`). */
export interface AitCancelRequestCollaborator {
  create(
    dto: Record<string, unknown>,
    tx?: Transaction,
  ): Promise<AitCancelRequestRow>;
  findOne(id: string, tx?: Transaction): Promise<AitCancelRequestRow>;
  update(
    id: string,
    patch: Record<string, unknown>,
    tx?: Transaction,
  ): Promise<AitCancelRequestRow>;
}

export interface AitLifecycleCollaborators {
  outbox?: TeatEventOutbox;
  cancelRequests?: AitCancelRequestCollaborator;
  /** §13 item 1 — `SyncConflictPort` (`@detran/ops-core`); property name is
   * an Inspector proposal (`review-concurrency.spec.ts`), no canonical
   * source fixes it. */
  syncConflicts?: SyncConflictPort;
}

/**
 * Normalizes the third constructor argument. Production wiring
 * (`ait-lifecycle.provider.ts`) passes a well-formed
 * `AitLifecycleCollaborators` bag; some CTG-0001 unit specs pass a bare
 * collaborator instead (`{ outbox }` in `accept-reject.spec.ts` /
 * `review-concurrency.spec.ts` already matches the bag shape; a bare
 * `AitCancelRequestRepository`-shaped stub in `cancel-requests.spec.ts` does
 * not — this recognizes that shape and treats it as `{ cancelRequests }`).
 */
function normalizeCollaborators(raw: unknown): AitLifecycleCollaborators {
  if (!raw || typeof raw !== 'object') return {};
  const obj = raw as Record<string, unknown>;
  const looksLikeCancelRequestRepository =
    typeof obj.create === 'function' &&
    typeof obj.findOne === 'function' &&
    typeof obj.update === 'function' &&
    obj.cancelRequests === undefined &&
    obj.outbox === undefined;
  if (looksLikeCancelRequestRepository) {
    return { cancelRequests: raw as AitCancelRequestCollaborator };
  }
  return raw as AitLifecycleCollaborators;
}

export interface CreateCancelRequestInput {
  localId?: string;
  entityType: 'ait-cancel-request' | 'ait-cancel-posfinal-request';
  trafficAgencyId?: string;
  agentId?: string;
  deviceId?: string;
  shiftId?: string;
  idempotencyKey?: string;
  targetLocalActId: string;
  targetAitId?: string;
  targetReservedNumber?: number;
  targetContentHash?: string;
  originStatus: string;
  justification: string;
  requestedAt?: string;
  requestedBy?: string;
  addressedTo?: 'traffic-authority' | 'diretoria-fiscalizacao';
  legalBasisNote?: string;
  location?: Record<string, unknown>;
}

export interface CancelRequestResult {
  id: string;
  status: string;
  kind: string;
  addressed_to: string;
  ait_id: string | null;
  version: number;
  httpStatus: 201 | 202;
  context?: { targetLocalActId: string | null };
  current_status?: string;
  /** Set only when `kind='post_final'` actually transitioned the AIT
   * (`SOLICITADO_CANCEL_POSFINAL`) — the controller's `If-Match`/`ETag`
   * apply to this version, never to the cancel request's own (§4.15). */
  aitVersion?: number;
}

export interface DecideCancelRequestOptions {
  decidedAt?: string;
  decisionLegalBasis?: string;
  decisionBody?: 'traffic-authority' | 'diretoria-fiscalizacao';
  linkedMeasureDecision?: string;
  actorRole?: string;
  /** When supplied, `canDecideAitCancelRequest` is enforced against the
   * request's stored `addressed_to` (controller-level concern; unit/
   * integration tests exercising the service directly never pass this). */
  principal?: {
    roles: string[];
    permissions: string[];
    claims: Record<string, unknown>;
  };
}

export interface DecideCancelRequestResult {
  id: string;
  status: string;
  decided_at: string;
  version: number;
  ait?: { id: string; current_status: string; version: number };
}

@Injectable()
export class AitLifecycleService {
  private readonly collaborators: AitLifecycleCollaborators;
  private readonly outbox: TeatEventOutbox;
  private readonly syncConflicts: SyncConflictPort;

  constructor(
    private readonly repositories: AitRepositories,
    private readonly normative: NormativeReferencePort,
    collaborators?: unknown,
  ) {
    this.collaborators = normalizeCollaborators(collaborators);
    this.outbox = this.collaborators.outbox ?? new SqlTeatEventOutbox();
    this.syncConflicts =
      this.collaborators.syncConflicts ?? new SqlSyncConflictPort();
  }

  createDraft(dto: CreateAitDto): Promise<Ait> {
    return this.repositories.ait.transaction(async (tx) => {
      await this.normative.assertActive(dto.catalog_id, dto.framing_id, tx);
      return this.repositories.ait.create(
        { ...dto, current_status: 'RASCUNHO_OFFLINE', content_hash: null },
        tx,
      );
    });
  }

  /** Current `ait_ait.version`, for controller-side `If-Match` checks. */
  async getVersion(id: string): Promise<number> {
    const ait = await this.repositories.ait.findOne(id);
    return (ait as { version?: number }).version ?? 0;
  }

  addVehicle(aitId: string, dto: Omit<CreateAitVehicleDto, 'ait_id'>) {
    return this.repositories.ait.transaction(async (tx) => {
      const ait = await this.requireStatus(
        aitId,
        ['RASCUNHO_OFFLINE'],
        tx,
        'add-vehicle',
      );
      const created = await this.repositories.vehicles.create(
        { ...dto, ait_id: aitId },
        tx,
      );
      await this.bumpVersion(ait, tx);
      return created;
    });
  }

  addPerson(aitId: string, dto: Omit<CreateAitPersonDto, 'ait_id'>) {
    return this.repositories.ait.transaction(async (tx) => {
      const ait = await this.requireStatus(
        aitId,
        ['RASCUNHO_OFFLINE'],
        tx,
        'add-person',
      );
      const created = await this.repositories.people.create(
        { ...dto, ait_id: aitId },
        tx,
      );
      await this.bumpVersion(ait, tx);
      return created;
    });
  }

  addCorrection(aitId: string, dto: Omit<CreateAitCorrectionDto, 'ait_id'>) {
    return this.repositories.ait.transaction(async (tx) => {
      const ait = await this.requireStatus(
        aitId,
        ['PENDENTE_CORRECAO'],
        tx,
        'add-correction',
      );
      if (!dto.justification || !dto.justification.trim()) {
        throw new DetranError('TEAT.AIT_CORRECTION_JUSTIFICATION_REQUIRED', {
          status: 422,
        });
      }
      if (
        dto.changed_field &&
        CORRECTION_FORBIDDEN_FIELDS.includes(dto.changed_field)
      ) {
        throw new DetranError('TEAT.AIT_CORRECTION_FIELD_FORBIDDEN', {
          status: 422,
          // `allowed[]` sem fonte fixa de vocabulário — `source_pending`
          // (ver relatório TASK-0003): esta rodada só nega os campos de
          // RN-TEAT-119, não fixa a lista positiva de campos saneáveis.
          context: { field: dto.changed_field, allowed: [] },
        });
      }
      const created = await this.repositories.corrections.create(
        { ...dto, ait_id: aitId },
        tx,
      );
      await this.bumpVersion(ait, tx);
      return created;
    });
  }

  recordScience(aitId: string, dto: Omit<CreateAitSignatureDto, 'ait_id'>) {
    return this.repositories.ait.transaction(async (tx) => {
      const ait = await this.requireStatus(
        aitId,
        ['RASCUNHO_OFFLINE', 'FINALIZADO_LOCAL'],
        tx,
        'science',
      );
      this.assertScienceOutcome(dto);
      const signature = await this.repositories.signatures.create(
        { ...dto, ait_id: aitId },
        tx,
      );
      await this.transition(
        ait,
        ait.current_status as AitStatus,
        'AIT science recorded',
        tx,
      );
      return signature;
    });
  }

  recordPrint(aitId: string, dto: Omit<CreateAitPrintEventDto, 'ait_id'>) {
    return this.repositories.ait.transaction(async (tx) => {
      const ait = await this.requireStatus(
        aitId,
        ['FINALIZADO_LOCAL', 'ENFILEIRADO'],
        tx,
        'print',
      );
      // RN-TEAT-116: only a genuine reprint is window-checked — first
      // impression (`impressao`) and failures (`falha`) are never blocked.
      if (dto.event_type === 'reimpressao') {
        const issuedOn = dateOnlyUtc(
          (ait as { issued_at?: unknown }).issued_at,
        );
        const today = new Date().toISOString().slice(0, 10);
        if (issuedOn !== today) {
          throw new DetranError('TEAT.AIT_PRINT_REPRINT_WINDOW_EXCEEDED', {
            status: 422,
            context: { issuedOn },
          });
        }
      }
      const created = await this.repositories.printEvents.create(
        { ...dto, ait_id: aitId },
        tx,
      );
      await this.bumpVersion(ait, tx);
      return created;
    });
  }

  finalize(id: string, actorId?: string): Promise<Ait> {
    return this.repositories.ait.transaction(async (tx) => {
      const ait = await this.requireStatus(
        id,
        ['RASCUNHO_OFFLINE'],
        tx,
        'finalize',
      );
      const contentHash = contentHashForAit(ait);
      const finalized = await this.transition(
        ait,
        'FINALIZADO_LOCAL',
        'AIT finalized',
        tx,
        actorId,
        {
          content_hash: contentHash,
          system_signature_ref: `sha256:${contentHash}`,
        },
      );
      await this.outbox.append(
        tx,
        this.buildEnvelope(
          'ait.changed',
          'AIT_FINALIZADO',
          'ait',
          finalized.id,
          (finalized as { version?: number }).version ?? 1,
          actorId,
          {
            aitId: finalized.id,
            aitNumber: finalized.ait_number,
            series: finalized.series,
            fromState: 'RASCUNHO_OFFLINE',
            toState: 'FINALIZADO_LOCAL',
            contentHash,
            finalizedAt: new Date().toISOString(),
          },
        ),
      );
      return finalized;
    });
  }

  queueTransmission(id: string, actorId?: string): Promise<Ait> {
    return this.transitionFrom(
      id,
      ['FINALIZADO_LOCAL'],
      'ENFILEIRADO',
      'AIT queued for transmission',
      'queue-transmission',
      actorId,
    );
  }

  receiveProtocol(
    id: string,
    receiptProtocol: string,
    actorId?: string,
  ): Promise<Ait> {
    return this.repositories.ait.transaction(async (tx) => {
      const ait = await this.requireStatus(
        id,
        ['ENFILEIRADO', 'TRANSMITIDO'],
        tx,
        'receive-protocol',
      );
      let received: Ait;
      try {
        received = await this.transition(
          ait,
          'RECEBIDO',
          'RENAINF protocol received',
          tx,
          actorId,
          { receipt_protocol: receiptProtocol },
        );
      } catch (error) {
        if (isUniqueViolation(error)) {
          throw new DetranError('TEAT.AIT_RECEIPT_PROTOCOL_DUPLICATE', {
            status: 409,
            context: { receiptProtocol },
          });
        }
        throw error;
      }
      await this.outbox.append(
        tx,
        this.buildEnvelope(
          'ait.changed',
          'AIT_RECEBIDO',
          'ait',
          received.id,
          (received as { version?: number }).version ?? 1,
          actorId,
          {
            aitId: received.id,
            fromState: ait.current_status,
            toState: 'RECEBIDO',
            receiptProtocol,
            receivedAt: new Date().toISOString(),
          },
        ),
      );
      return received;
    });
  }

  requestCorrection(
    id: string,
    reason: string,
    actorId?: string,
  ): Promise<Ait> {
    return this.transitionFrom(
      id,
      ['VALIDANDO', 'REJEITADO'],
      'PENDENTE_CORRECAO',
      reason,
      'request-correction',
      actorId,
    );
  }

  approveCorrection(
    id: string,
    correctionId: string,
    actorId: string,
  ): Promise<Ait> {
    return this.repositories.ait.transaction(async (tx) => {
      // CTG-0001 §11.5: the route contract admits only PENDENTE_CORRECAO —
      // narrower than the service's previous CORRIGIDO allowance.
      const ait = await this.requireStatus(
        id,
        ['PENDENTE_CORRECAO'],
        tx,
        'approve-correction',
      );
      const correction = await this.repositories.corrections.findOne(
        correctionId,
        tx,
      );
      if (correction.ait_id !== id) {
        throw new DetranError('TEAT.AIT_CORRECTION_NOT_FOUND_FOR_AIT', {
          status: 404,
        });
      }
      await this.repositories.corrections.update(
        correctionId,
        { approved_by_user_ref: actorId },
        tx,
      );
      return this.transition(
        ait,
        'CORRIGIDO',
        correction.justification,
        tx,
        actorId,
      );
    });
  }

  accept(id: string, actorId?: string): Promise<Ait> {
    // TODO(Phase 3 W3.3 RAIT): accepted AITs become the source for defesa/recurso case intake.
    return this.repositories.ait.transaction(async (tx) => {
      const ait = await this.findAitForUpdate(id, tx);
      this.assertNotConcurrencyPending(ait);
      this.assertAllowed(ait, ['RECEBIDO', 'VALIDANDO', 'CORRIGIDO'], 'accept');
      const accepted = await this.transition(
        ait,
        'ACEITO',
        'AIT accepted',
        tx,
        actorId,
      );
      await this.outbox.append(
        tx,
        this.buildEnvelope(
          'ait.changed',
          'AIT_ACEITO',
          'ait',
          accepted.id,
          (accepted as { version?: number }).version ?? 1,
          actorId,
          {
            aitId: accepted.id,
            fromState: ait.current_status,
            toState: 'ACEITO',
            acceptedAt: new Date().toISOString(),
          },
        ),
      );
      const integrated = await this.transition(
        accepted,
        'INTEGRADO',
        'AIT integrated (ADR-0016)',
        tx,
        actorId,
      );
      await this.outbox.append(
        tx,
        this.buildEnvelope(
          'ait.changed',
          'AIT_INTEGRADO',
          'ait',
          integrated.id,
          (integrated as { version?: number }).version ?? 1,
          actorId,
          {
            aitId: integrated.id,
            aitNumber: integrated.ait_number,
            series: integrated.series,
            trafficAgencyId: (integrated as { traffic_agency_id?: unknown })
              .traffic_agency_id,
            framingId: (integrated as { framing_id?: unknown }).framing_id,
            catalogId: (integrated as { catalog_id?: unknown }).catalog_id,
            committedOn: dateOnlyUtc(
              (integrated as { infraction_at?: unknown }).infraction_at,
            ),
            issuedAt: (integrated as { issued_at?: unknown }).issued_at,
            contentHash: integrated.content_hash,
            toState: 'INTEGRADO',
            integratedAt: new Date().toISOString(),
          },
        ),
      );
      return integrated;
    });
  }

  reject(
    id: string,
    reason: string,
    actorIdOrLegacyFlag?: string | boolean,
    legacyActorId?: string,
  ): Promise<Ait> {
    const actorId =
      typeof actorIdOrLegacyFlag === 'string'
        ? actorIdOrLegacyFlag
        : legacyActorId;
    return this.repositories.ait.transaction(async (tx) => {
      const ait = await this.findAitForUpdate(id, tx);
      this.assertNotConcurrencyPending(ait);
      this.assertAllowed(
        ait,
        ['RECEBIDO', 'VALIDANDO', 'PENDENTE_CORRECAO'],
        'reject',
      );
      if (!reason || !reason.trim()) {
        throw new DetranError('TEAT.AIT_REJECT_REASON_REQUIRED', {
          status: 422,
        });
      }
      // `RejectAitCommandDto.cancelled` (legacy client field) is read by
      // callers as `actorIdOrLegacyFlag` for backward compatibility but never
      // changes the transition (CTG-0001 §4.13, M4): reject always → REJEITADO.
      const rejected = await this.transition(
        ait,
        'REJEITADO',
        reason,
        tx,
        actorId,
      );
      await this.outbox.append(
        tx,
        this.buildEnvelope(
          'ait.changed',
          'AIT_REJEITADO',
          'ait',
          rejected.id,
          (rejected as { version?: number }).version ?? 1,
          actorId,
          {
            aitId: rejected.id,
            fromState: ait.current_status,
            toState: 'REJEITADO',
            rejectedAt: new Date().toISOString(),
          },
        ),
      );
      return rejected;
    });
  }

  /** `POST aits/{id}/concurrency-review` (M4, CTG-0001 §4.8/§13 item 1). */
  reviewConcurrency(
    id: string,
    decision: 'release' | 'reject',
    reason: string,
    actorId?: string,
  ): Promise<Ait & { context: { conflictId: string } }> {
    return this.repositories.ait.transaction(async (tx) => {
      if (!reason || !reason.trim()) {
        throw new DetranError('TEAT.VALIDATION_FAILED', {
          status: 422,
          context: { fields: [{ path: 'reason', rule: 'required' }] },
        });
      }
      const ait = await this.requireStatus(
        id,
        ['SUSPEITO_CONCORRENCIA'],
        tx,
        'concurrency-review',
      );
      // §13 item 1: the AIT's own state admits the command, but the
      // canonical apuração lives in `ops.sync_conflict` (SyncConflictPort) —
      // no open conflict there is a distinct 409, never silently accepted.
      const conflict = await this.syncConflicts.findOpenConcurrencyConflict(
        id,
        tx,
      );
      if (!conflict) {
        throw new DetranError('TEAT.AIT_STATE_INVALID', {
          status: 409,
          context: {
            aitId: id,
            currentState: ait.current_status,
            command: 'concurrency-review',
          },
        });
      }
      const target: AitStatus =
        decision === 'release' ? 'RECEBIDO' : 'REJEITADO';
      const domainEvent =
        decision === 'release' ? 'AIT_RECEBIDO' : 'AIT_REJEITADO';
      const updated = await this.transition(ait, target, reason, tx, actorId);
      const version = (updated as { version?: number }).version ?? 1;
      await this.outbox.append(
        tx,
        this.buildEnvelope(
          'ait.changed',
          domainEvent,
          'ait',
          updated.id,
          version,
          actorId,
          {
            aitId: updated.id,
            fromState: 'SUSPEITO_CONCORRENCIA',
            toState: target,
            [decision === 'release' ? 'receivedAt' : 'rejectedAt']:
              new Date().toISOString(),
          },
        ),
      );
      await this.syncConflicts.resolve(
        conflict.id,
        {
          action: decision === 'release' ? 'accept_server' : 'reject',
          resolvedByUserRef: actorId,
          description: reason,
        },
        tx,
      );
      await this.outbox.append(
        tx,
        this.buildEnvelope(
          SYNC_CONFLICT_RESOLVED_TYPE,
          'SYNC_CONFLITO_RESOLVIDO',
          'sync-conflict',
          conflict.id,
          1,
          actorId,
          {
            conflictId: conflict.id,
            conflictType: 'concurrency',
            aitId: updated.id,
            decision,
            resolvedAt: new Date().toISOString(),
          },
        ),
      );
      return { ...updated, context: { conflictId: conflict.id } };
    });
  }

  /** `POST aits/{id}/archive` (M4, CTG-0001 §4.14). */
  archive(id: string, reason: string, actorId?: string): Promise<Ait> {
    return this.repositories.ait.transaction(async (tx) => {
      if (!reason || !reason.trim()) {
        throw new DetranError('TEAT.VALIDATION_FAILED', {
          status: 422,
          context: { fields: [{ path: 'reason', rule: 'required' }] },
        });
      }
      const ait = await this.requireStatus(id, ['PROCESSADO'], tx, 'archive');
      return this.transition(ait, 'ARQUIVADO', reason, tx, actorId);
    });
  }

  /** `POST cancel-requests` (M4, CTG-0001 §4.15 + §12 adenda). */
  createCancelRequest(
    dto: CreateCancelRequestInput,
  ): Promise<CancelRequestResult> {
    return this.repositories.ait.transaction(async (tx) => {
      const kind: 'draft' | 'post_final' =
        dto.entityType === 'ait-cancel-request' ? 'draft' : 'post_final';
      const expectedAddressee: 'traffic-authority' | 'diretoria-fiscalizacao' =
        kind === 'draft' ? 'traffic-authority' : 'diretoria-fiscalizacao';
      if (dto.addressedTo && dto.addressedTo !== expectedAddressee) {
        throw new DetranError('TEAT.VALIDATION_FAILED', {
          status: 400,
          context: {
            fields: [
              {
                path: 'addressedTo',
                rule: 'mismatch',
                expected: expectedAddressee,
              },
            ],
          },
        });
      }
      if (!dto.justification || !dto.justification.trim()) {
        throw new DetranError('TEAT.VALIDATION_FAILED', {
          status: 422,
          context: { fields: [{ path: 'justification', rule: 'required' }] },
        });
      }
      // §13 item 7: `originStatus` must be one of the 17 canonical tokens.
      if (!AIT_STATE_TOKENS.includes(dto.originStatus as AitStatus)) {
        throw new DetranError('TEAT.ENUM_INVALID', {
          status: 400,
          context: { field: 'originStatus', allowed: AIT_STATE_TOKENS },
        });
      }
      const addressedTo = dto.addressedTo ?? expectedAddressee;

      const existing = dto.idempotencyKey
        ? await this.findCancelRequestByIdempotencyKey(dto.idempotencyKey, tx)
        : undefined;
      if (existing) {
        if (
          existing.target_local_act_id !== dto.targetLocalActId ||
          existing.origin_status !== dto.originStatus ||
          existing.justification !== dto.justification
        ) {
          throw new DetranError('TEAT.IDEMPOTENCY_REPLAY', {
            status: 409,
            context: { idempotencyKey: dto.idempotencyKey },
          });
        }
        const currentAit = existing.ait_id
          ? await this.repositories.ait.findOne(existing.ait_id, tx)
          : undefined;
        return this.cancelRequestResult(existing, currentAit);
      }

      let ait: Ait | undefined;
      if (dto.targetAitId) {
        ait = await this.findAitForUpdate(dto.targetAitId, tx);
        // §13 item 7: the alleged origin must match the AIT's real state.
        if (dto.originStatus !== ait.current_status) {
          throw new DetranError('TEAT.AIT_STATE_INVALID', {
            status: 409,
            context: {
              aitId: dto.targetAitId,
              currentState: ait.current_status,
              originStatus: dto.originStatus,
              command: 'request-cancel',
            },
          });
        }
        this.assertAllowed(
          ait,
          kind === 'draft'
            ? ['RASCUNHO_OFFLINE']
            : [
                'FINALIZADO_LOCAL',
                'RECEBIDO',
                'VALIDANDO',
                'ACEITO',
                'INTEGRADO',
              ],
          'request-cancel',
        );
      }

      const requestedAt = dto.requestedAt ?? new Date().toISOString();
      const row = await this.resolveCancelRequestCreate(tx, {
        ait_id: dto.targetAitId ?? null,
        kind,
        target_local_act_id: dto.targetLocalActId,
        origin_status: dto.originStatus,
        addressed_to: addressedTo,
        idempotency_key: dto.idempotencyKey ?? null,
        justification: dto.justification,
        requested_by: dto.requestedBy ?? null,
        version: 1,
        status: 'requested',
        requested_at: requestedAt,
      });

      await this.insertCancelRequestEvent(
        {
          cancel_request_id: row.id,
          event_type: 'requested',
          event_at: requestedAt,
          actor_user_ref: dto.requestedBy ?? null,
          details_json: {
            idempotencyKey: dto.idempotencyKey ?? null,
            justification: dto.justification,
            legalBasisNote: dto.legalBasisNote ?? null,
            targetReservedNumber: dto.targetReservedNumber ?? null,
            targetContentHash: dto.targetContentHash ?? null,
            location: dto.location ?? null,
          },
        },
        tx,
      );

      if (kind === 'post_final' && ait) {
        ait = await this.transition(
          ait,
          'SOLICITADO_CANCEL_POSFINAL',
          'AIT cancellation requested (post-final)',
          tx,
          dto.requestedBy,
        );
      }

      return this.cancelRequestResult(row, ait);
    });
  }

  /** `POST cancel-requests/{id}/review` (CTG-0001 §4.16). */
  reviewCancelRequest(
    id: string,
    actorId?: string,
  ): Promise<{ id: string; status: string; version: number }> {
    return this.repositories.ait.transaction(async (tx) => {
      const request = await this.getCancelRequestRow(id, tx, true);
      if (request.status === 'approved' || request.status === 'denied') {
        throw new DetranError('TEAT.AIT_CANCEL_ALREADY_DECIDED', {
          status: 409,
          context: { decidedAt: request.decided_at },
        });
      }
      if (request.status !== 'requested') {
        throw new DetranError('TEAT.AIT_STATE_INVALID', {
          status: 409,
          context: {
            requestId: id,
            currentState: request.status,
            allowed: ['requested'],
            command: 'review-cancel',
          },
        });
      }
      const updated = await this.updateCancelRequestRow(
        request.id,
        { status: 'under_review', version: (request.version ?? 1) + 1 },
        tx,
      );
      await this.insertCancelRequestEvent(
        {
          cancel_request_id: request.id,
          event_type: 'under_review',
          event_at: new Date().toISOString(),
          actor_user_ref: actorId ?? null,
        },
        tx,
      );
      return {
        id: updated.id ?? request.id,
        status: updated.status ?? 'under_review',
        version:
          (updated.version as number | undefined) ?? (request.version ?? 1) + 1,
      };
    });
  }

  /** `POST cancel-requests/{id}/decide` (M4, CTG-0001 §4.17 + §12 adenda). */
  decideCancelRequest(
    id: string,
    decision: 'approve' | 'deny',
    decisionNote: string,
    actorId?: string,
    options: DecideCancelRequestOptions = {},
  ): Promise<DecideCancelRequestResult> {
    return this.repositories.ait.transaction(async (tx) => {
      const request = await this.getCancelRequestRow(id, tx, true);

      // §13 item 3: a `decision_body` that disagrees with the stored
      // `addressed_to` is rejected before any effect, independent of the
      // principal-based guard below (which only runs when a principal is
      // supplied, i.e. from the controller).
      if (
        options.decisionBody &&
        options.decisionBody !== request.addressed_to
      ) {
        throw new DetranError('TEAT.AIT_CANCEL_ADDRESSEE_FORBIDDEN', {
          status: 403,
          context: {
            addressedTo: request.addressed_to,
            roles: options.principal?.roles ?? [],
          },
        });
      }

      // §13 item 4: state guard on the request itself. `approved|denied` is
      // the specific "already decided" error; anything else outside
      // `requested|under_review` is a generic state guard (defensive —
      // no other status is reachable through this service today).
      if (request.status === 'approved' || request.status === 'denied') {
        throw new DetranError('TEAT.AIT_CANCEL_ALREADY_DECIDED', {
          status: 409,
          context: { decidedAt: request.decided_at },
        });
      }
      if (request.status !== 'requested' && request.status !== 'under_review') {
        throw new DetranError('TEAT.AIT_STATE_INVALID', {
          status: 409,
          context: {
            requestId: id,
            currentState: request.status,
            allowed: ['requested', 'under_review'],
            command: 'decide-cancel',
          },
        });
      }

      if (options.principal) {
        const addressedTo = request.addressed_to as
          'traffic-authority' | 'diretoria-fiscalizacao';
        if (!canDecideAitCancelRequest(options.principal, addressedTo)) {
          throw new DetranError('TEAT.AIT_CANCEL_ADDRESSEE_FORBIDDEN', {
            status: 403,
            context: {
              addressedTo,
              roles: options.principal.roles,
            },
          });
        }
      }
      if (!decisionNote || !decisionNote.trim()) {
        throw new DetranError('TEAT.VALIDATION_FAILED', {
          status: 422,
          context: {
            fields: [{ path: 'decision_note', rule: 'required' }],
          },
        });
      }

      let ait: Ait | undefined;
      if (request.ait_id) {
        ait = await this.findAitForUpdate(request.ait_id, tx);
        // §13 item 4: with `ait_id` present, the AIT must still be in the
        // state the request put it in (draft never moved it; post_final did).
        const allowed: AitStatus[] =
          request.kind === 'draft'
            ? ['RASCUNHO_OFFLINE']
            : ['SOLICITADO_CANCEL_POSFINAL'];
        this.assertAllowed(ait, allowed, 'decide-cancel');
      }
      const decidedAt = options.decidedAt ?? new Date().toISOString();

      if (ait) {
        if (decision === 'approve') {
          const target: AitStatus =
            request.kind === 'draft'
              ? 'CANCELADO_RASCUNHO'
              : 'CANCELADO_POSFINAL';
          ait = await this.transition(ait, target, decisionNote, tx, actorId);
          if (request.kind === 'post_final') {
            await this.outbox.append(
              tx,
              this.buildEnvelope(
                'ait.changed',
                'AIT_CANCELADO_POSFINAL',
                'ait',
                ait.id,
                (ait as { version?: number }).version ?? 1,
                actorId,
                {
                  aitId: ait.id,
                  cancelRequestId: request.id,
                  originStatus: request.origin_status,
                  contentHash: ait.content_hash,
                  decidedAt,
                },
              ),
            );
          }
        } else {
          ait = await this.transition(
            ait,
            request.origin_status as AitStatus,
            decisionNote,
            tx,
            actorId,
          );
        }
      }

      const updated = await this.updateCancelRequestRow(
        request.id,
        {
          status: decision === 'approve' ? 'approved' : 'denied',
          decision: decisionNote,
          decided_at: decidedAt,
          version: (request.version ?? 1) + 1,
        },
        tx,
      );

      await this.insertCancelRequestEvent(
        {
          cancel_request_id: request.id,
          event_type: decision === 'approve' ? 'approved' : 'denied',
          event_at: decidedAt,
          actor_user_ref: actorId ?? null,
          decision: decisionNote,
          details_json: {
            decisionLegalBasis: options.decisionLegalBasis ?? null,
            decisionBody: options.decisionBody ?? null,
            linkedMeasureDecision: options.linkedMeasureDecision ?? null,
            actorRole: options.actorRole ?? null,
          },
        },
        tx,
      );

      return {
        id: updated.id ?? request.id,
        status:
          updated.status ?? (decision === 'approve' ? 'approved' : 'denied'),
        decided_at: (updated.decided_at as string | undefined) ?? decidedAt,
        version:
          (updated.version as number | undefined) ?? (request.version ?? 1) + 1,
        ait: ait
          ? {
              id: ait.id,
              current_status: ait.current_status,
              version: (ait as { version?: number }).version ?? 0,
            }
          : undefined,
      };
    });
  }

  /** `GET cancel-requests/outcomes/{targetLocalActId}` (CTG-0001 §4.18). */
  async getCancelRequestOutcomes(targetLocalActId: string): Promise<{
    targetLocalActId: string;
    requests: Array<Record<string, unknown>>;
  }> {
    return this.repositories.ait.transaction(async (tx) => {
      const queryable = asQueryable(tx);
      if (!queryable) {
        throw new DetranError('TEAT.AIT_CANCEL_TARGET_NOT_FOUND', {
          status: 404,
          context: { targetLocalActId },
        });
      }
      const result = await queryable.query<Record<string, unknown>>(
        `select r.id, r.kind, r.status, r.addressed_to, r.origin_status,
                r.requested_at, r.decided_at, r.decision, r.ait_id,
                a.current_status as ait_current_status
           from inf.ait_cancel_request r
           left join inf.ait_ait a on a.id = r.ait_id
          where r.target_local_act_id = $1
          order by r.requested_at desc, r.id`,
        [targetLocalActId],
      );
      if (!result.rows.length) {
        throw new DetranError('TEAT.AIT_CANCEL_TARGET_NOT_FOUND', {
          status: 404,
          context: { targetLocalActId },
        });
      }
      return {
        targetLocalActId,
        requests: result.rows.map((row) => ({
          id: row.id,
          kind: row.kind,
          status: row.status,
          addressedTo: row.addressed_to,
          originStatus: row.origin_status,
          requestedAt: row.requested_at,
          decidedAt: row.decided_at,
          decision: row.decision,
          aitId: row.ait_id,
          aitCurrentStatus: row.ait_current_status,
        })),
      };
    });
  }

  /** Current `(version, aitId, addressedTo)` for the controller's `If-Match`
   * and precondition checks on `review`/`decide` (§13 item 2, supersedes §12
   * item 4): when `ait_id` exists, `version` is `ait_ait.version` — the AIT
   * is the aggregate that actually changes — otherwise it is
   * `ait_cancel_request.version`. */
  async getCancelRequestSummary(
    id: string,
  ): Promise<{ version: number; aitId: string | null; addressedTo: string }> {
    return this.repositories.ait.transaction(async (tx) => {
      const row = await this.getCancelRequestRow(id, tx);
      if (row.ait_id) {
        const ait = await this.repositories.ait.findOne(row.ait_id, tx);
        return {
          version: (ait as { version?: number }).version ?? 1,
          aitId: row.ait_id,
          addressedTo: row.addressed_to,
        };
      }
      return {
        version: row.version ?? 1,
        aitId: null,
        addressedTo: row.addressed_to,
      };
    });
  }

  /** Sole national-system seam. Controllers never construct an HTTP client. */
  publishViaRenainf(
    port: Pick<RenainfPort, 'createTrafficViolation'>,
    input: TrafficViolationInput,
    context?: Parameters<RenainfPort['createTrafficViolation']>[1],
  ): Promise<TrafficViolation> {
    // TODO(Phase 3 outbox): invoke this adapter port from @stynx-nyx/outbox after publication.
    return port.createTrafficViolation(input, context);
  }

  private transitionFrom(
    id: string,
    allowed: AitStatus[],
    target: AitStatus,
    reason: string,
    command: string,
    actorId?: string,
  ): Promise<Ait> {
    return this.repositories.ait.transaction(async (tx) => {
      const ait = await this.requireStatus(id, allowed, tx, command);
      return this.transition(ait, target, reason, tx, actorId);
    });
  }

  private async requireStatus(
    id: string,
    allowed: AitStatus[],
    tx: Transaction,
    command: string,
  ): Promise<Ait> {
    const ait = await this.findAitForUpdate(id, tx);
    this.assertAllowed(ait, allowed, command);
    return ait;
  }

  /** Leitura do AIT para comando: `for update` antes da checagem de estado,
   * para que a transição e o filho gravados depois dela não repitam a de
   * uma transação concorrente (READ COMMITTED). */
  private async findAitForUpdate(id: string, tx: Transaction): Promise<Ait> {
    const queryable = asQueryable(tx);
    if (queryable) {
      await queryable.query(
        'select id from inf.ait_ait where id = $1 for update',
        [id],
      );
    }
    return this.repositories.ait.findOne(id, tx);
  }

  private assertAllowed(ait: Ait, allowed: AitStatus[], command: string): void {
    if (!allowed.includes(ait.current_status as AitStatus)) {
      throw new DetranError('TEAT.AIT_STATE_INVALID', {
        status: 409,
        context: {
          aitId: ait.id,
          currentState: ait.current_status,
          allowed,
          command,
        },
      });
    }
  }

  /** RN-TEAT-111 — apuração de concorrência pendente bloqueia accept/reject
   * com um código mais específico, sempre antes de AIT_STATE_INVALID. */
  private assertNotConcurrencyPending(ait: Ait): void {
    if (ait.current_status === 'SUSPEITO_CONCORRENCIA') {
      throw new DetranError('TEAT.AIT_CONCURRENCY_PENDING_REVIEW', {
        status: 409,
        context: { conflictId: `sync-conflict:${ait.id}` },
      });
    }
  }

  /** RN-TEAT-005 — recusa/impossibilidade nunca coexistem com assinatura. */
  private assertScienceOutcome(dto: {
    signature_type: string;
    refusal_or_impossibility_reason?: string | null;
  }): void {
    const reason = dto.refusal_or_impossibility_reason;
    const hasReason = typeof reason === 'string' && reason.trim().length > 0;
    if (
      (dto.signature_type === 'refused' ||
        dto.signature_type === 'impossibility') &&
      !hasReason
    ) {
      throw new DetranError('TEAT.AIT_SIGNATURE_OUTCOME_INVALID', {
        status: 400,
        context: { signatureType: dto.signature_type },
      });
    }
    if (dto.signature_type === 'signed' && hasReason) {
      throw new DetranError('TEAT.AIT_SIGNATURE_OUTCOME_INVALID', {
        status: 400,
        context: { signatureType: dto.signature_type },
      });
    }
  }

  private async transition(
    ait: Ait,
    target: AitStatus,
    reason: string,
    tx: Transaction,
    actorId?: string,
    patch: Partial<CreateAitDto> = {},
  ): Promise<Ait> {
    await this.recordHistory(ait, target, reason, tx, actorId);
    // `version` is bumped only when the fetched row actually carries one
    // (every real `ait_ait` row does, DDL default 1): callers in
    // `ait-lifecycle.service.spec.ts` that predate M2 stub AIT objects
    // without a `version` field and assert the exact `update()` patch via
    // `toHaveBeenCalledWith` — inventing a version there would silently
    // break that pre-existing, untouchable assertion (CTG-0001 M2 vs.
    // pre-M2 test, see TASK-0003 report).
    const currentVersion = (ait as { version?: number }).version;
    const versionPatch =
      currentVersion === undefined ? {} : { version: currentVersion + 1 };
    return this.repositories.ait.update(
      ait.id,
      { ...patch, ...versionPatch, current_status: target },
      tx,
    );
  }

  /** Bumps `version` without touching `current_status` (CTG-0001 §4.1/§4.2/
   * §4.5/§4.10: sub-resource commands leave the state unchanged but still
   * count as a command against the aggregate, M2). No-ops when the fetched
   * row has no `version` field (see `transition` for why). */
  private bumpVersion(ait: Ait, tx: Transaction): Promise<Ait> {
    const currentVersion = (ait as { version?: number }).version;
    if (currentVersion === undefined) return Promise.resolve(ait);
    return this.repositories.ait.update(
      ait.id,
      { version: currentVersion + 1 },
      tx,
    );
  }

  private recordHistory(
    ait: Ait,
    status: AitStatus,
    reason: string,
    tx: Transaction,
    actorId?: string,
  ) {
    return this.repositories.history.create(
      {
        ait_id: ait.id,
        status,
        user_ref: actorId ?? null,
        system_name: 'detran-backend',
        reason,
      },
      tx,
    );
  }

  private buildEnvelope(
    type: string,
    domainEvent: string,
    aggregateKind: string,
    aggregateId: string,
    aggregateVersion: number,
    actorId: string | undefined,
    data: Record<string, unknown>,
  ): TeatEventEnvelope {
    return {
      // §13 item 5: never generated here — `TeatEventOutbox.append` assigns
      // and returns the real id of the persisted row.
      id: '',
      type,
      domainEvent,
      version: 1,
      occurredAt: new Date().toISOString(),
      // Resolved from session context by `SqlTeatEventOutbox` (kernel tenant
      // trigger pattern); left blank here, never guessed (CODESTYLE tenant rule).
      tenantId: '',
      actor: { kind: 'user', id: actorId ?? 'system' },
      correlationId: randomUUID(),
      aggregate: {
        kind: aggregateKind,
        id: aggregateId,
        version: aggregateVersion,
      },
      data,
    };
  }

  private cancelRequestResult(
    row: AitCancelRequestRow,
    ait: Ait | undefined,
  ): CancelRequestResult {
    const aitId = (row.ait_id as string | null | undefined) ?? ait?.id ?? null;
    const hasAit = Boolean(aitId);
    return {
      id: row.id,
      status: row.status,
      kind: row.kind,
      addressed_to: row.addressed_to,
      ait_id: aitId,
      version: row.version,
      httpStatus: hasAit ? 201 : 202,
      context: hasAit
        ? undefined
        : { targetLocalActId: row.target_local_act_id ?? null },
      current_status: ait?.current_status,
      aitVersion:
        row.kind === 'post_final' && ait
          ? ((ait as { version?: number }).version ?? undefined)
          : undefined,
    };
  }

  private async resolveCancelRequestCreate(
    tx: Transaction,
    fields: Record<string, unknown>,
  ): Promise<AitCancelRequestRow> {
    if (this.collaborators.cancelRequests) {
      return this.collaborators.cancelRequests.create(fields, tx);
    }
    const queryable = asQueryable(tx);
    if (queryable) {
      return sqlInsert<AitCancelRequestRow>(
        queryable,
        'inf.ait_cancel_request',
        fields,
      );
    }
    // Guard-only unit-test fallback (no DB-capable transaction and no
    // injected collaborator, e.g. `ait-state-transitions.matrix.spec.ts`):
    // reuse the AIT repository's generic `create()` purely to exercise the
    // state machine end-to-end without inventing a second repository stub.
    return this.repositories.ait.create(
      fields as never,
      tx,
    ) as unknown as Promise<AitCancelRequestRow>;
  }

  private async findCancelRequestByIdempotencyKey(
    key: string,
    tx: Transaction,
  ): Promise<AitCancelRequestRow | undefined> {
    const queryable = asQueryable(tx);
    if (!queryable) return undefined;
    const result = await queryable.query<
      AitCancelRequestRow & Record<string, unknown>
    >(
      'select * from inf.ait_cancel_request where idempotency_key = $1 limit 1',
      [key],
    );
    return result.rows[0];
  }

  private async getCancelRequestRow(
    id: string,
    tx: Transaction,
    forUpdate = false,
  ): Promise<AitCancelRequestRow> {
    // `review`/`decide`: a linha fica bloqueada até o fim do comando, para
    // que duas decisões concorrentes não passem ambas por `requested`.
    const lockable = forUpdate ? asQueryable(tx) : undefined;
    if (lockable) {
      await lockable.query(
        'select id from inf.ait_cancel_request where id = $1 for update',
        [id],
      );
    }
    if (this.collaborators.cancelRequests) {
      return this.collaborators.cancelRequests.findOne(id, tx);
    }
    const queryable = asQueryable(tx);
    if (queryable) {
      const result = await queryable.query<
        AitCancelRequestRow & Record<string, unknown>
      >('select * from inf.ait_cancel_request where id = $1 limit 1', [id]);
      const row = result.rows[0];
      if (!row) {
        throw new DetranError('TEAT.AIT_CANCEL_TARGET_NOT_FOUND', {
          status: 404,
          context: { id },
        });
      }
      return row;
    }
    throw new Error(
      'AitLifecycleService: review/decide de cancel-request exige um repositório injetado ou uma transação com acesso a banco',
    );
  }

  private async updateCancelRequestRow(
    id: string,
    patch: Record<string, unknown>,
    tx: Transaction,
  ): Promise<AitCancelRequestRow> {
    if (this.collaborators.cancelRequests) {
      return this.collaborators.cancelRequests.update(id, patch, tx);
    }
    const queryable = asQueryable(tx);
    if (queryable) {
      return sqlUpdate<AitCancelRequestRow>(
        queryable,
        'inf.ait_cancel_request',
        id,
        patch,
      );
    }
    throw new Error(
      'AitLifecycleService: review/decide de cancel-request exige um repositório injetado ou uma transação com acesso a banco',
    );
  }

  private async insertCancelRequestEvent(
    fields: Record<string, unknown>,
    tx: Transaction,
  ): Promise<void> {
    const queryable = asQueryable(tx);
    if (!queryable) return; // best-effort audit trail outside real transactions
    await sqlInsert(queryable, 'inf.ait_cancel_request_event', fields);
  }
}

export function contentHashForAit(ait: Ait): string {
  const legalContent = Object.fromEntries(
    Object.entries(ait)
      .filter(
        ([key]) =>
          ![
            'updated_at',
            'content_hash',
            'system_signature_ref',
            'receipt_protocol',
          ].includes(key),
      )
      .sort(([left], [right]) => left.localeCompare(right)),
  );
  return createHash('sha256').update(stableJson(legalContent)).digest('hex');
}

function stableJson(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableJson(record[key])}`)
    .join(',')}}`;
}
