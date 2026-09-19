// ServiceWizardStore (contrato CTG-0003a §5.4; [WF-PORTAL-001] ciclo comum; T02/T05 §4–§6):
// estado do wizard de um ato — provido no `ServiceWizardComponent` (um por instância) e lido pela
// feature via injector do componente. `start()` = `createRequest`; `save()` = `schema.safeParse`
// (forma só orienta, M12) → `saveDraft` com `If-Match`; `sign()` = `submitRequest` (nunca sem o
// `ack` quando há `consequence`, invariante 10); `resumeFrom()` restaura sem novo `POST`
// ([UC-PORTAL-019] AC-4). Rascunho SÓ no servidor; offline = `portal.states.offline`, sem fila nem
// promessa de envio posterior (spec §8). Nenhuma lógica de prazo, elegibilidade ou nível aqui.
import {
  Injectable,
  type OutputEmitterRef,
  type Signal,
  computed,
  inject,
  signal,
} from '@angular/core';
import { StynxI18nService, StynxToastService } from '@detran/ui';
import type { ZodType } from 'zod';
import {
  OFFLINE_KEY,
  classifyError,
  presentError,
  type ErrorPresentation,
} from '../core/error-boundary';
import { ResumeService } from '../core/resume.service';
import { etagOf, type ElevationStarted } from '../data/portal-command.models';
import {
  PortalClient,
  type DraftSaved,
  type RequestCreateBody,
  type RequestCreated,
  type RequestDraftBody,
  type RequestSubmitted,
} from '../data/portal.client';
import type { FormGate } from '../forms/form-gate';
import type {
  ConsequenceAck,
  LegalDocument,
} from './consequence-dialog.component';
import type { SignatureChoice } from './signature-step.component';

export type WizardStep =
  'elegibilidade' | 'composicao' | 'assinatura' | 'protocolo';

export const WIZARD_STEPS: readonly WizardStep[] = [
  'elegibilidade',
  'composicao',
  'assinatura',
  'protocolo',
];

export type WizardStatus =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'saving'
  | 'submitting'
  | 'ineligible'
  | 'unavailable'
  | 'offline'
  | 'error'
  | 'done';

export interface WizardTarget {
  readonly serviceKey: string;
  readonly targetKind: RequestCreateBody['targetKind'];
  readonly targetId: string | null;
}

export interface WizardResumeDraft {
  readonly requestId: string;
  readonly serviceKey: string;
  readonly targetKind: RequestCreateBody['targetKind'];
  readonly targetId: string | null;
  readonly step: WizardStep;
  readonly etag: string | null;
  readonly values: Record<string, unknown> | null;
}

/**
 * Recibo mostrado no passo `protocolo`: o 200 de `submit` (`RequestSubmitted`) ou, em
 * `502 DELEGATION_FAILED`, o protocolo de `context.protocol` — emitido, mas ainda não delegado
 * ([RN-PORTAL-111] 1): estado `PROTOCOLADO` (WF-PORTAL-001), delegação e versão desconhecidas.
 */
export interface WizardReceipt {
  readonly requestId: string;
  readonly state: RequestSubmitted['state'] | 'PROTOCOLADO';
  readonly protocol: RequestSubmitted['protocol'];
  readonly delegation: RequestSubmitted['delegation'] | null;
  readonly version: number | null;
}

/** O que o `ServiceWizardComponent` entrega ao store: inputs, modelo e saídas. */
export interface WizardHost {
  readonly target: Signal<WizardTarget>;
  readonly schema: Signal<ZodType>;
  readonly gate: Signal<FormGate>;
  readonly resumeRoute: Signal<string>;
  readonly consequence: Signal<LegalDocument | null>;
  readonly values: Signal<Record<string, unknown> | null> & {
    set(value: Record<string, unknown> | null): void;
  };
  readonly created: OutputEmitterRef<RequestCreated>;
  readonly draftSaved: OutputEmitterRef<DraftSaved>;
  readonly submitted: OutputEmitterRef<RequestSubmitted>;
  readonly ineligible: OutputEmitterRef<ErrorPresentation>;
  readonly failed: OutputEmitterRef<ErrorPresentation>;
  readonly stepChanged: OutputEmitterRef<WizardStep>;
  readonly elevationRequested: OutputEmitterRef<ElevationStarted>;
}

const VALIDATION_FAILED = 'PORTAL.VALIDATION_FAILED';

function isOffline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine === false;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

@Injectable()
export class ServiceWizardStore {
  private readonly client = inject(PortalClient);
  private readonly resumeService = inject(ResumeService);
  private readonly toast = inject(StynxToastService);
  private readonly i18n = inject(StynxI18nService);
  private host: WizardHost | null = null;

  private readonly statusState = signal<WizardStatus>('idle');
  private readonly stepState = signal<WizardStep>(WIZARD_STEPS[0]);
  private readonly requestIdState = signal<string | null>(null);
  private readonly etagState = signal<string | null>(null);
  private readonly prefilledState = signal<Readonly<Record<string, unknown>>>(
    {},
  );
  private readonly requirementsState = signal<readonly string[]>([]);
  private readonly minimumAssuranceState = signal<
    RequestCreated['minimumAssurance'] | null
  >(null);
  private readonly errorState = signal<ErrorPresentation | null>(null);
  private readonly receiptState = signal<WizardReceipt | null>(null);

  readonly status = this.statusState.asReadonly();
  readonly step = this.stepState.asReadonly();
  readonly requestId = this.requestIdState.asReadonly();
  readonly etag = this.etagState.asReadonly();
  /** → `PrefilledField`. */
  readonly prefilled = this.prefilledState.asReadonly();
  /** → checklist do `AttachmentUploader`. */
  readonly requirements = this.requirementsState.asReadonly();
  /** → `SignatureStep.required`. */
  readonly minimumAssurance = this.minimumAssuranceState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly receipt = this.receiptState.asReadonly();
  readonly busy = computed(() => {
    const status = this.statusState();
    return (
      status === 'loading' || status === 'saving' || status === 'submitting'
    );
  });

  /** Chamado uma vez pelo componente hospedeiro. */
  attach(host: WizardHost): void {
    this.host = host;
  }

  /** `createRequest` — passo 1 → 2 no 201. */
  async start(): Promise<void> {
    const host = this.attached();
    if (this.goOfflineIfNeeded()) return;
    const target = host.target();
    this.statusState.set('loading');
    this.errorState.set(null);
    try {
      const result = await this.client.createRequest({
        serviceKey: target.serviceKey,
        targetKind: target.targetKind,
        ...(target.targetId ? { targetId: target.targetId } : {}),
        channel: 'portal',
      });
      this.requestIdState.set(result.body.requestId);
      this.etagState.set(result.etag ?? etagOf(result.body.version));
      this.prefilledState.set(
        isRecord(result.body.prefilled) ? result.body.prefilled : {},
      );
      this.requirementsState.set(result.body.requirements ?? []);
      this.minimumAssuranceState.set(result.body.minimumAssurance);
      this.statusState.set('ready');
      this.goTo('composicao');
      host.created.emit(result.body);
    } catch (error: unknown) {
      const presentation = this.present(error);
      this.errorState.set(presentation);
      switch (presentation.code) {
        case 'PORTAL.INELIGIBLE':
          this.statusState.set('ineligible');
          host.ineligible.emit(presentation);
          return;
        case 'PORTAL.SERVICE_UNAVAILABLE':
          this.statusState.set('unavailable');
          return;
        default:
          this.statusState.set(
            this.isOfflineError(error) ? 'offline' : 'error',
          );
          host.failed.emit(presentation);
      }
    }
  }

  /** `schema.safeParse(values)` → inválido: `fields` sem requisição; válido: `saveDraft`. */
  async save(): Promise<void> {
    const host = this.attached();
    if (this.goOfflineIfNeeded()) return;
    const parsed = host.schema().safeParse(host.values() ?? {});
    if (!parsed.success) {
      this.errorState.set(this.validationPresentation(parsed.error.issues));
      return;
    }
    const requestId = this.requestIdState();
    if (!requestId) return;
    this.statusState.set('saving');
    this.errorState.set(null);
    try {
      const result = await this.client.saveDraft(
        requestId,
        host.target().serviceKey,
        parsed.data as RequestDraftBody,
        this.etagState(),
      );
      this.etagState.set(result.etag ?? etagOf(result.body.version));
      this.statusState.set('ready');
      host.draftSaved.emit(result.body);
      this.toast.push(
        this.i18n.translate('portal.common.toast.draft_saved'),
        'success',
      );
    } catch (error: unknown) {
      const presentation = this.present(error);
      this.errorState.set(presentation);
      this.statusState.set(this.isOfflineError(error) ? 'offline' : 'ready');
      host.failed.emit(presentation);
    }
  }

  goTo(step: WizardStep): void {
    if (this.stepState() === step) return;
    this.stepState.set(step);
    this.host?.stepChanged.emit(step);
  }

  /** `submitRequest`; com `consequence` definido, nunca sem o `ack` (o diálogo é etapa própria). */
  async sign(
    signature: SignatureChoice,
    ack: ConsequenceAck | null,
  ): Promise<void> {
    const host = this.attached();
    if (host.consequence() !== null && ack === null) return;
    if (this.goOfflineIfNeeded()) return;
    const requestId = this.requestIdState();
    if (!requestId) return;
    const target = host.target();
    this.goTo('assinatura');
    this.statusState.set('submitting');
    this.errorState.set(null);
    try {
      const result = await this.client.submitRequest(
        requestId,
        target.serviceKey,
        target.targetId,
        { signature, ...(ack ? { consequenceAck: ack } : {}) },
      );
      this.etagState.set(result.etag ?? etagOf(result.body.version));
      this.receiptState.set({
        requestId: result.body.requestId,
        state: result.body.state,
        protocol: result.body.protocol,
        delegation: result.body.delegation,
        version: result.body.version,
      });
      this.statusState.set('done');
      this.goTo('protocolo');
      host.submitted.emit(result.body);
    } catch (error: unknown) {
      this.failSign(host, requestId, error);
    }
  }

  /** Restaura `requestId`, `etag`, `step` e `values` sem chamar `createRequest`. */
  resumeFrom(point: WizardResumeDraft): void {
    const host = this.attached();
    this.requestIdState.set(point.requestId);
    this.etagState.set(point.etag);
    host.values.set(point.values);
    this.errorState.set(null);
    this.statusState.set('ready');
    this.goTo(point.step);
  }

  /** Ponto de retomada do wizard ([UC-PORTAL-019] AC-4) no passo dado. */
  resumeDraft(step: WizardStep): WizardResumeDraft | null {
    const host = this.host;
    const requestId = this.requestIdState();
    if (!host || !requestId) return null;
    const target = host.target();
    return {
      requestId,
      serviceKey: target.serviceKey,
      targetKind: target.targetKind,
      targetId: target.targetId,
      step,
      etag: this.etagState(),
      values: host.values(),
    };
  }

  private failSign(host: WizardHost, requestId: string, error: unknown): void {
    const presentation = this.present(error);
    switch (presentation.code) {
      case 'PORTAL.ASSURANCE_INSUFFICIENT': {
        // Nada se perde: rota + rascunho guardados ANTES da elevação (T-27 retoma o ato).
        this.resumeService.save({
          route: host.resumeRoute(),
          draft: this.resumeDraft('assinatura'),
        });
        this.errorState.set(presentation);
        this.statusState.set('ready');
        return;
      }
      case 'PORTAL.DELEGATION_FAILED': {
        // Protocolo é imediato ([RN-PORTAL-111] 1): recibo mantido, aviso de encaminhamento.
        const protocol = presentation.context['protocol'];
        this.receiptState.set({
          requestId,
          state: 'PROTOCOLADO',
          protocol: isRecord(protocol) ? protocol : {},
          delegation: null,
          version: null,
        });
        this.errorState.set(presentation);
        this.statusState.set('done');
        this.goTo('protocolo');
        return;
      }
      default:
        this.errorState.set(presentation);
        this.statusState.set(this.isOfflineError(error) ? 'offline' : 'ready');
        host.failed.emit(presentation);
    }
  }

  private present(error: unknown): ErrorPresentation {
    const host = this.host;
    return presentError(error, {
      resumeRoute: host?.resumeRoute(),
      serviceKey: host?.target().serviceKey,
    });
  }

  private isOfflineError(error: unknown): boolean {
    return classifyError(error).status === 0 && isOffline();
  }

  /** Offline: estado próprio, sem requisição enfileirada nem promessa de envio (spec §8). */
  private goOfflineIfNeeded(): boolean {
    if (!isOffline()) return false;
    this.statusState.set('offline');
    this.errorState.set({
      code: null,
      status: 0,
      messageKey: OFFLINE_KEY,
      messageParams: {},
      severity: 'error',
      nextStep: 'retry',
      nextStepRoute: null,
      alternativeChannel: true,
      fields: [],
      retryAfter: null,
      context: {},
      requestId: null,
    });
    return true;
  }

  /** Forma inválida: `portal.errors.validation_failed` + campos para a diretiva (sem requisição). */
  private validationPresentation(
    issues: readonly { readonly path: readonly PropertyKey[] }[],
  ): ErrorPresentation {
    const fields = Array.from(
      new Set(issues.map((issue) => issue.path.map(String).join('.'))),
    ).filter((field) => field.length > 0);
    return presentError({
      status: 400,
      error: {
        code: VALIDATION_FAILED,
        status: 400,
        message: VALIDATION_FAILED,
        context: { fields },
      },
    });
  }

  private attached(): WizardHost {
    if (!this.host) {
      throw new Error(
        'ServiceWizardStore: nenhum ServiceWizardComponent anexado',
      );
    }
    return this.host;
  }
}
