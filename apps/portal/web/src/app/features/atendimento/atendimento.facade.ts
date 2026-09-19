// AtendimentoFacade (contrato CTG-0003c §3.6; T-21/T-22/T-26; [RN-PORTAL-109/110]; [UC-PORTAL-016/017];
// H.51; [DIVERGE-18/19/20]): registro da manifestação (`POST manifestations` — sem sessão o corpo
// leva `anonymous: true`; `attachmentIds` sempre `[]`; recebimento irrecusável: a única falha de
// forma é `MANIFESTATION_KIND_INVALID` → campo `kind`), acompanhamento (`GET manifestations/{id}`,
// vínculo `manifestation`; o ÚNICO relógio exibido é `deadlines.agencyDueOn`), ciência (`POST
// …/acknowledge`, `ETag` guardado) e avaliação (`POST evaluations` para pedido ou manifestação),
// mais o pedido avaliado em T-26 (`GET requests/{id}`, par 2). Erros só pelo `ErrorBoundary`.
import { Injectable, inject, signal } from '@angular/core';
import {
  presentError,
  type ErrorPresentation,
} from '../../core/error-boundary';
import { SessionFacade } from '../../core/session.facade';
import { PortalClient } from '../../data/portal.client';
import type {
  EvaluationCreateBody,
  EvaluationCreated,
  ManifestationAcknowledged,
  ManifestationCreateBody,
  ManifestationCreated,
  ManifestationDetail,
  RequestDetail,
} from '../../data/portal-read.models';
import { readStatusFor, type ReadStatus } from '../../data/read-status';
import type { CommandStatus } from '../processos/processos.facade';

export type { CommandStatus } from '../processos/processos.facade';

const SERVICE_UNAVAILABLE_CODE = 'PORTAL.SERVICE_UNAVAILABLE';
/** A única falha de forma admitida ([RN-PORTAL-109] 1): `{ allowed[] }` → campo `kind` marcado. */
const KIND_INVALID_CODE = 'PORTAL.MANIFESTATION_KIND_INVALID';
const KIND_FIELD = 'kind';

function commandStatusOf(presentation: ErrorPresentation): CommandStatus {
  if (presentation.code === SERVICE_UNAVAILABLE_CODE) return 'unavailable';
  const status = readStatusFor(presentation);
  if (status === 'unavailable') return 'unavailable';
  return status === 'offline' ? 'offline' : 'error';
}

@Injectable()
export class AtendimentoFacade {
  private readonly client = inject(PortalClient);
  private readonly session = inject(SessionFacade);

  // T-21
  private readonly createStatusState = signal<CommandStatus>('idle');
  private readonly createErrorState = signal<ErrorPresentation | null>(null);
  private readonly createdState = signal<ManifestationCreated | null>(null);
  // T-22
  private readonly detailStatusState = signal<ReadStatus>('idle');
  private readonly detailState = signal<ManifestationDetail | null>(null);
  private readonly detailErrorState = signal<ErrorPresentation | null>(null);
  private readonly etagState = signal<string | null>(null);
  private readonly ackStatusState = signal<CommandStatus>('idle');
  private readonly ackErrorState = signal<ErrorPresentation | null>(null);
  // T-26 (e convite inline em T-22)
  private readonly evaluationStatusState = signal<CommandStatus>('idle');
  private readonly evaluationErrorState = signal<ErrorPresentation | null>(
    null,
  );
  private readonly evaluationState = signal<EvaluationCreated | null>(null);
  private readonly requestStatusState = signal<ReadStatus>('idle');
  private readonly requestState = signal<RequestDetail | null>(null);
  private readonly requestErrorState = signal<ErrorPresentation | null>(null);
  private detailSequence = 0;
  private requestSequence = 0;

  readonly createStatus = this.createStatusState.asReadonly();
  readonly createError = this.createErrorState.asReadonly();
  /** Comprovante imediato. */
  readonly created = this.createdState.asReadonly();
  readonly detailStatus = this.detailStatusState.asReadonly();
  readonly detail = this.detailState.asReadonly();
  readonly detailError = this.detailErrorState.asReadonly();
  /** `ETag` do acknowledge (§2.3); só guardado. */
  readonly etag = this.etagState.asReadonly();
  readonly ackStatus = this.ackStatusState.asReadonly();
  readonly ackError = this.ackErrorState.asReadonly();
  readonly evaluationStatus = this.evaluationStatusState.asReadonly();
  readonly evaluationError = this.evaluationErrorState.asReadonly();
  readonly evaluation = this.evaluationState.asReadonly();
  readonly requestStatus = this.requestStatusState.asReadonly();
  /** `PortalClient.getRequest` (par 2) — o pedido avaliado em T-26. */
  readonly request = this.requestState.asReadonly();
  readonly requestError = this.requestErrorState.asReadonly();

  /** POST manifestations; sem sessão `anonymous: true` (H.51); `attachmentIds` sempre `[]`. */
  async create(
    body: ManifestationCreateBody,
  ): Promise<ManifestationCreated | null> {
    this.createStatusState.set('submitting');
    this.createErrorState.set(null);
    const anonymous = this.session.active() ? body.anonymous === true : true;
    try {
      const result = await this.client.createManifestation({
        ...body,
        attachmentIds: [],
        anonymous,
      });
      this.createdState.set(result.body);
      this.createStatusState.set('done');
      return result.body;
    } catch (error: unknown) {
      const presentation = presentError(error);
      this.createErrorState.set(
        presentation.code === KIND_INVALID_CODE
          ? { ...presentation, fields: [KIND_FIELD] }
          : presentation,
      );
      this.createStatusState.set(commandStatusOf(presentation));
      return null;
    }
  }

  /** GET manifestations/{id}; entitlement { kind: 'manifestation', id }. */
  async loadDetail(manifestationId: string): Promise<void> {
    this.detailStatusState.set('loading');
    this.detailErrorState.set(null);
    const sequence = ++this.detailSequence;
    try {
      const detail = await this.client.getManifestation(manifestationId);
      if (sequence !== this.detailSequence) return;
      this.detailState.set(detail);
      this.detailStatusState.set('ready');
    } catch (error: unknown) {
      if (sequence !== this.detailSequence) return;
      const presentation = presentError(error, {
        entitlement: { kind: 'manifestation', id: manifestationId },
      });
      this.detailState.set(null);
      this.detailErrorState.set(presentation);
      this.detailStatusState.set(readStatusFor(presentation));
    }
  }

  /** POST …/acknowledge; 200 → `etag` guardado + `loadDetail()`; 409 → 'error' (reload) + releitura. */
  async acknowledge(
    manifestationId: string,
  ): Promise<ManifestationAcknowledged | null> {
    this.ackStatusState.set('submitting');
    this.ackErrorState.set(null);
    try {
      const result =
        await this.client.acknowledgeManifestation(manifestationId);
      this.etagState.set(result.etag);
      this.ackStatusState.set('done');
      void this.loadDetail(manifestationId);
      return result.body;
    } catch (error: unknown) {
      const presentation = presentError(error, {
        entitlement: { kind: 'manifestation', id: manifestationId },
      });
      this.ackErrorState.set(presentation);
      this.ackStatusState.set(commandStatusOf(presentation));
      if (presentation.nextStep === 'reload')
        void this.loadDetail(manifestationId);
      return null;
    }
  }

  /** POST evaluations ([DIVERGE-18]: pedido ou manifestação). */
  async evaluate(
    body: EvaluationCreateBody,
  ): Promise<EvaluationCreated | null> {
    this.evaluationStatusState.set('submitting');
    this.evaluationErrorState.set(null);
    try {
      const result = await this.client.createEvaluation(body);
      this.evaluationState.set(result.body);
      this.evaluationStatusState.set('done');
      return result.body;
    } catch (error: unknown) {
      const presentation = presentError(error, {
        entitlement: { kind: body.subjectKind, id: body.subjectId },
      });
      this.evaluationErrorState.set(presentation);
      this.evaluationStatusState.set(commandStatusOf(presentation));
      return null;
    }
  }

  /** GET requests/{id} (par 2) — contexto de T-26. */
  async loadRequest(requestId: string): Promise<void> {
    this.requestStatusState.set('loading');
    this.requestErrorState.set(null);
    const sequence = ++this.requestSequence;
    try {
      const result = await this.client.getRequest(requestId);
      if (sequence !== this.requestSequence) return;
      this.requestState.set(result.body);
      this.requestStatusState.set('ready');
    } catch (error: unknown) {
      if (sequence !== this.requestSequence) return;
      const presentation = presentError(error, {
        entitlement: { kind: 'request', id: requestId },
      });
      this.requestState.set(null);
      this.requestErrorState.set(presentation);
      this.requestStatusState.set(readStatusFor(presentation));
    }
  }
}
