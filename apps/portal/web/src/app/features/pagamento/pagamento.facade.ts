// PagamentoFacade (contrato CTG-0003b §3.4; T-13/T-23): carrega o AIT (o `payment` com as faixas que
// o SERVIDOR calculou — nada se calcula aqui), a disponibilidade do serviço `pagamento`
// (`partially_available` → banner na página; `unavailable` já foi decidido pela guarda), resolve o
// alvo `{ pagamento, ait, aitId }` e o ponto de retomada — `ResumeService` ou pedido aberto em
// composição (sem novo `POST`); pedido aberto em estado posterior → `existingRequestId`.
// `deadlines` = `deadlines[]` do AIT, sem transformação. Provida na página; sem cache local.
import { Injectable, computed, inject, signal } from '@angular/core';
import {
  presentError,
  type ErrorPresentation,
} from '../../core/error-boundary';
import { ResumeService } from '../../core/resume.service';
import {
  ServiceCatalogFacade,
  type ServiceAvailability,
} from '../../core/service-catalog.facade';
import { PortalClient } from '../../data/portal.client';
import type {
  AitDeadline,
  AitDetail,
  PaymentInfo,
} from '../../data/portal-read.models';
import { readStatusFor, type ReadStatus } from '../../data/read-status';
import type {
  WizardResumeDraft,
  WizardTarget,
} from '../../shared/service-wizard.store';
import {
  resumeFromOpenRequest,
  resumePointFor,
} from '../../shared/wizard-resume';

export interface PagamentoLoadParams {
  readonly aitId: string;
  /** `state.url` da tela (ponto de retomada do `ResumeService`). */
  readonly resumeRoute?: string;
}

const SERVICE_KEY = 'pagamento';

@Injectable()
export class PagamentoFacade {
  private readonly client = inject(PortalClient);
  private readonly resumeService = inject(ResumeService);
  private readonly catalog = inject(ServiceCatalogFacade);

  private readonly statusState = signal<ReadStatus>('idle');
  private readonly errorState = signal<ErrorPresentation | null>(null);
  private readonly targetState = signal<WizardTarget | null>(null);
  private readonly resumeState = signal<WizardResumeDraft | null>(null);
  private readonly existingRequestIdState = signal<string | null>(null);
  private readonly deadlinesState = signal<readonly AitDeadline[]>([]);
  private readonly availabilityState = signal<ServiceAvailability | null>(null);
  private readonly aitState = signal<AitDetail | null>(null);

  readonly status = this.statusState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly target = this.targetState.asReadonly();
  readonly resume = this.resumeState.asReadonly();
  readonly existingRequestId = this.existingRequestIdState.asReadonly();
  readonly deadlines = this.deadlinesState.asReadonly();
  /** `ServiceCatalogFacade.availability('pagamento')`: `partially_available` → banner (§3.4 g). */
  readonly availability = this.availabilityState.asReadonly();
  readonly ait = this.aitState.asReadonly();
  /** `AitDetail.payment` como o servidor mandou (faixas, valores, datas prontos). */
  readonly payment = computed<PaymentInfo | null>(
    () => this.aitState()?.payment ?? null,
  );
  readonly serviceKey = SERVICE_KEY;

  async load(params: PagamentoLoadParams): Promise<void> {
    this.statusState.set('loading');
    this.errorState.set(null);
    this.targetState.set(null);
    this.resumeState.set(null);
    this.existingRequestIdState.set(null);
    const availability = this.catalog.availability(SERVICE_KEY).then(
      (value) => this.availabilityState.set(value),
      () => this.availabilityState.set(null),
    );
    try {
      const ait = await this.client.getAit(params.aitId);
      this.aitState.set(ait);
      this.deadlinesState.set(ait.deadlines ?? []);
      const target: WizardTarget = {
        serviceKey: SERVICE_KEY,
        targetKind: 'ait',
        targetId: params.aitId,
      };
      const resume = params.resumeRoute
        ? resumePointFor(this.resumeService, params.resumeRoute, target)
        : null;
      if (resume) {
        this.resumeState.set(resume);
      } else if (ait.openRequestId) {
        const open = await resumeFromOpenRequest(
          this.client,
          ait.openRequestId,
          target,
        );
        if (open === 'existing_request') {
          this.existingRequestIdState.set(ait.openRequestId);
        } else if (open) {
          this.resumeState.set(open);
        }
      }
      this.targetState.set(target);
      this.statusState.set('ready');
    } catch (error: unknown) {
      const presentation = presentError(error, {
        entitlement: { kind: 'ait', id: params.aitId },
      });
      this.errorState.set(presentation);
      this.statusState.set(readStatusFor(presentation));
    }
    await availability;
  }
}
