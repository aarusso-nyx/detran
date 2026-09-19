// DefesaFacade (contrato CTG-0003b §3.4; T-02/T-03/T-04): carrega o CONTEXTO do ato — o AIT (T-02)
// ou o pedido de origem (T-03/T-04) —, resolve o alvo do wizard e o ponto de retomada, e concentra
// os estados da tela; não duplica o estado do wizard (`ServiceWizardStore`). T-03/T-04: o alvo é o
// caso do RAIT ligado ao pedido de origem (`request.delegation.externalId`, [DIVERGE-4]); sem ele
// (caso nascido no balcão, OD-P29) ou com `actions.canAppeal === false` → inelegível (a página mostra
// `portal.screens.t0n.state.ineligible`); a página NUNCA decide prazo (o servidor responde
// `APPEAL_CETRAN_WINDOW_CLOSED`/`REQUEST_OUT_OF_DEADLINE`). Provida na página; sem cache local.
// A disponibilidade do serviço já foi decidida pela guarda da rota (M8); o banner "parcial" só
// existe no pagamento (§3.4 g), por isso `availability` fica `null` aqui.
import { Injectable, computed, inject, signal } from '@angular/core';
import {
  presentError,
  type ErrorPresentation,
} from '../../core/error-boundary';
import { ResumeService } from '../../core/resume.service';
import type { ServiceAvailability } from '../../core/service-catalog.facade';
import { PortalClient } from '../../data/portal.client';
import type {
  AitDeadline,
  AitDetail,
  RequestDetail,
  TimelineDeadline,
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

export type DefesaScreen = 'T-02' | 'T-03' | 'T-04';

export type DefesaLoadParams =
  | {
      readonly screen: 'T-02';
      readonly aitId: string;
      /** `state.url` da tela (ponto de retomada do `ResumeService`). */
      readonly resumeRoute?: string;
    }
  | {
      readonly screen: 'T-03' | 'T-04';
      readonly requestId: string;
      readonly resumeRoute?: string;
    };

/** Motivo pelo qual o pedido de origem não admite a instância seguinte (token → `data-reason`). */
export type AppealIneligibility = 'sem_caso_delegado' | 'recurso_nao_admitido';

const SERVICE_KEY_BY_SCREEN: Readonly<Record<DefesaScreen, string>> = {
  'T-02': 'defesa_previa',
  'T-03': 'recurso_jari',
  'T-04': 'recurso_cetran',
};

@Injectable()
export class DefesaFacade {
  private readonly client = inject(PortalClient);
  private readonly resumeService = inject(ResumeService);

  private readonly statusState = signal<ReadStatus>('idle');
  private readonly errorState = signal<ErrorPresentation | null>(null);
  private readonly targetState = signal<WizardTarget | null>(null);
  private readonly resumeState = signal<WizardResumeDraft | null>(null);
  private readonly existingRequestIdState = signal<string | null>(null);
  private readonly deadlinesState = signal<
    readonly AitDeadline[] | readonly TimelineDeadline[]
  >([]);
  private readonly availabilityState = signal<ServiceAvailability | null>(null);
  private readonly ineligibilityState = signal<AppealIneligibility | null>(
    null,
  );
  private readonly aitState = signal<AitDetail | null>(null);
  private readonly originState = signal<RequestDetail | null>(null);
  private readonly screenState = signal<DefesaScreen>('T-02');

  /** Contexto (AIT/pedido de origem). */
  readonly status = this.statusState.asReadonly();
  readonly error = this.errorState.asReadonly();
  /** `null` enquanto o contexto não resolve (ou quando é inelegível). */
  readonly target = this.targetState.asReadonly();
  /** Consumido uma vez ([UC-PORTAL-019] AC-4 / pedido aberto em composição). */
  readonly resume = this.resumeState.asReadonly();
  /** `openRequestId` em estado além da composição → link `/processos/<id>`. */
  readonly existingRequestId = this.existingRequestIdState.asReadonly();
  /** → DeadlineCard visível em todos os passos ([UC-PORTAL-019] 4a). */
  readonly deadlines = this.deadlinesState.asReadonly();
  /** Sempre `null` nesta facade (ver cabeçalho). */
  readonly availability = this.availabilityState.asReadonly();
  /** T-03/T-04: origem sem caso delegado ou sem recurso admitido ([DIVERGE-4]). */
  readonly ineligibility = this.ineligibilityState.asReadonly();
  readonly ineligible = computed(() => this.ineligibilityState() !== null);
  readonly ait = this.aitState.asReadonly();
  readonly origin = this.originState.asReadonly();
  readonly screen = this.screenState.asReadonly();
  readonly serviceKey = computed(
    () => SERVICE_KEY_BY_SCREEN[this.screenState()],
  );

  /** Chamado uma vez pela página com os parâmetros da rota; resolve quando o contexto resolve. */
  async load(params: DefesaLoadParams): Promise<void> {
    this.screenState.set(params.screen);
    this.statusState.set('loading');
    this.errorState.set(null);
    this.targetState.set(null);
    this.resumeState.set(null);
    this.existingRequestIdState.set(null);
    this.ineligibilityState.set(null);
    try {
      if (params.screen === 'T-02') {
        await this.loadAit(params.aitId, params.resumeRoute);
      } else {
        await this.loadOrigin(
          params.screen,
          params.requestId,
          params.resumeRoute,
        );
      }
    } catch (error: unknown) {
      const presentation = presentError(
        error,
        params.screen === 'T-02'
          ? { entitlement: { kind: 'ait', id: params.aitId } }
          : { entitlement: { kind: 'request', id: params.requestId } },
      );
      this.errorState.set(presentation);
      this.statusState.set(readStatusFor(presentation));
    }
  }

  private async loadAit(aitId: string, resumeRoute?: string): Promise<void> {
    const ait = await this.client.getAit(aitId);
    this.aitState.set(ait);
    this.deadlinesState.set(ait.deadlines ?? []);
    const target: WizardTarget = {
      serviceKey: SERVICE_KEY_BY_SCREEN['T-02'],
      targetKind: 'ait',
      targetId: aitId,
    };
    const resume = resumeRoute
      ? resumePointFor(this.resumeService, resumeRoute, target)
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
  }

  private async loadOrigin(
    screen: 'T-03' | 'T-04',
    requestId: string,
    resumeRoute?: string,
  ): Promise<void> {
    const { body } = await this.client.getRequest(requestId);
    this.originState.set(body);
    this.deadlinesState.set(body.deadlines ?? []);
    const externalId = body.request?.delegation?.externalId ?? null;
    if (externalId === null) {
      this.ineligibilityState.set('sem_caso_delegado');
      this.statusState.set('error');
      return;
    }
    if (body.actions?.canAppeal !== true) {
      this.ineligibilityState.set('recurso_nao_admitido');
      this.statusState.set('error');
      return;
    }
    const target: WizardTarget = {
      serviceKey: SERVICE_KEY_BY_SCREEN[screen],
      targetKind: 'case',
      targetId: externalId,
    };
    const resume = resumeRoute
      ? resumePointFor(this.resumeService, resumeRoute, target)
      : null;
    if (resume) this.resumeState.set(resume);
    this.targetState.set(target);
    this.statusState.set('ready');
  }
}
