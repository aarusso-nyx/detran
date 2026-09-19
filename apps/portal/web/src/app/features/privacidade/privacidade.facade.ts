// PrivacidadeFacade (contrato CTG-0003c §3.7; T-24; [RN-PORTAL-118/120/121]; [UC-PORTAL-018];
// [DIVERGE-21]; OD-P17/OD-P95): os dados do titular vêm do `me` (`SessionFacade.account()`, sem
// máscara) e do `heldDataSummary[]` (forma livre); a confirmação de tratamento é imediata
// (`has_data`/`no_data`/`unknown`); o ato `lgpd_declaracao` é o ciclo comum (`ServiceWizard` com
// `MeusDadosSchema`), com alvo sem recurso; a permissão por escopo é fail-closed pela matriz do
// servidor (`canPerform('lgpd_declaracao:<scope>')`); a disponibilidade vem do catálogo
// (`partially_available` nesta rodada). Nenhum prazo (15 dias) é conhecido pelo cliente.
import { Injectable, computed, inject, signal } from '@angular/core';
import { ResumeService } from '../../core/resume.service';
import {
  ServiceCatalogFacade,
  type ServiceAvailability,
} from '../../core/service-catalog.facade';
import { SessionFacade } from '../../core/session.facade';
import type { CitizenAccount } from '../../data/portal.client';
import type { MeusDadosBody } from '../../forms/meus-dados.schema';
import type {
  WizardResumeDraft,
  WizardTarget,
} from '../../shared/service-wizard.store';
import { resumePointFor } from '../../shared/wizard-resume';

/** confirmacao | declaracao_completa | correcao | eliminacao. */
export type LgpdScope = MeusDadosBody['scope'];
export type DataConfirmation = 'has_data' | 'no_data' | 'unknown';

const SERVICE_KEY = 'lgpd_declaracao';
/** O escopo básico usa o ato-base; os demais têm `actKey` próprio (`lgpd_declaracao:<scope>`). */
const BASE_SCOPE: LgpdScope = 'confirmacao';

const TARGET: WizardTarget = {
  serviceKey: SERVICE_KEY,
  targetKind: 'none',
  targetId: null,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

@Injectable()
export class PrivacidadeFacade {
  private readonly session = inject(SessionFacade);
  private readonly catalog = inject(ServiceCatalogFacade);
  private readonly resumeService = inject(ResumeService);

  private readonly availabilityState = signal<ServiceAvailability | null>(null);
  private readonly resumeState = signal<WizardResumeDraft | null>(null);
  private readonly loadingState = signal(false);

  /** `SessionFacade.account()` — titular sem máscara. */
  readonly account = computed<CitizenAccount | null>(() =>
    this.session.account(),
  );
  /** `me.heldDataSummary` (forma livre; OD-P95). */
  readonly heldData = computed<readonly Record<string, unknown>[]>(() => {
    const summary = this.session.account()?.heldDataSummary;
    return Array.isArray(summary) ? summary.filter(isRecord) : [];
  });
  readonly confirmation = computed<DataConfirmation>(() => {
    if (!this.account()) return 'unknown';
    return this.heldData().length > 0 ? 'has_data' : 'no_data';
  });
  /** `ServiceCatalogFacade.availability('lgpd_declaracao')`. */
  readonly availability = this.availabilityState.asReadonly();
  readonly target = signal<WizardTarget>(TARGET).asReadonly();
  readonly resume = this.resumeState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly loadError = computed(() => this.session.loadError());

  /** Fail-closed: `canPerform('lgpd_declaracao:<scope>')`; `confirmacao` → `canPerform('lgpd_declaracao')`. */
  canRequest(scope: LgpdScope): boolean {
    const actKey =
      scope === BASE_SCOPE ? SERVICE_KEY : `${SERVICE_KEY}:${scope}`;
    return this.session.canPerform(actKey);
  }

  /** `SessionFacade.load()` se ainda sem conta; disponibilidade do serviço; ponto de retomada. */
  async load(resumeRoute: string): Promise<void> {
    this.loadingState.set(true);
    try {
      if (!this.session.account()) await this.session.load();
      this.resumeState.set(
        resumePointFor(this.resumeService, resumeRoute, TARGET),
      );
      try {
        this.availabilityState.set(
          await this.catalog.availability(SERVICE_KEY),
        );
      } catch {
        this.availabilityState.set(null);
      }
    } finally {
      this.loadingState.set(false);
    }
  }
}
