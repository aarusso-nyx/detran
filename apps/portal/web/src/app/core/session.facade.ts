// SessionFacade (portal-frontends.md §5.1; plan.md M8; contrato CTG-0003a §4): sessão gov.br via
// `StynxSessionService` + `GET /v1/portal/identity/me`. Nível de assinatura vem da claim assinada
// `assurance_level` (`state().claims`) e do `me` (portal-route-contract.md §1.3) — nunca de corpo
// nem de tabela no cliente. A matriz ato → nível é `actRequirements[]` do `me` (§3):
// `canPerform(actKey)` é fail-closed (ato desconhecido → false).
//
// `SessionFacade` é o token de injeção (classe abstrata, substituível por `useValue` nos testes —
// detran-ui-guide.md §5); `PortalSessionFacade` é a implementação. A navegação para o
// `redirectUrl` da elevação é do componente chamador: a facade não toca em `window.location`.
import {
  Injectable,
  type Signal,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { StynxSessionService } from '@stynx-nyx/angular-auth';
import { PortalClient, type CitizenAccount } from '../data/portal.client';
import type { ElevationStarted } from '../data/portal-command.models';
import { classifyError, type ClassifiedError } from './error-boundary';
import { OfflineDocumentStore } from './offline-document.store';
import { ResumeService } from './resume.service';

export type AssuranceLevel = 'simples' | 'avancada' | 'qualificada';

/** Ordem dos níveis ([RN-PORTAL-101]: o teto exigido é `avancada`; nunca `qualificada`). */
export const ASSURANCE_ORDER: Readonly<Record<AssuranceLevel, number>> = {
  simples: 1,
  avancada: 2,
  qualificada: 3,
};

export function isAssuranceLevel(value: unknown): value is AssuranceLevel {
  return value === 'simples' || value === 'avancada' || value === 'qualificada';
}

/** Caminhos de verificação da elevação (OpenAPI; [UC-PORTAL-019] fluxo 3). */
export type ElevationMethod = 'biographic' | 'biometric' | 'icp';

/**
 * Requisito de nível por ato — modelo de visão de `me.actRequirements[]`
 * (`{ actKey, minimumAssurance, allowed, reason? }`): `act` = `actKey`,
 * `level` = `minimumAssurance`; `allowed` obrigatório ([DIVERGE-16]).
 */
export interface ActRequirement {
  readonly act: string;
  readonly level: AssuranceLevel | 'none';
  readonly allowed: boolean;
  readonly reason?: string;
}

/** Representação ativa (procuração) — modelo de visão de `me.representations[]`. */
export interface Representation {
  readonly id?: string;
  readonly label: string;
  readonly scope?: 'ait' | 'all';
  readonly validUntil?: string | null;
}

export interface ElevationRequest {
  /** Teto [RN-PORTAL-101]. */
  readonly targetLevel: 'avancada';
  readonly method: ElevationMethod;
  /** Rota do app (`state.url`), ex.: `/autos/<aitId>/defesa/nova`. */
  readonly resumeRoute: string;
  /** `WizardResumeDraft` (§5.4) ou `null`. */
  readonly draft?: unknown;
}

@Injectable({
  providedIn: 'root',
  useFactory: () => inject(PortalSessionFacade),
})
export abstract class SessionFacade {
  abstract readonly active: Signal<boolean>;
  /** `GET me` cru (titular sem máscara, invariante 4). */
  abstract readonly account: Signal<CitizenAccount | null>;
  /** `me.assuranceLevel`, senão a claim `assurance_level`. */
  abstract readonly assuranceLevel: Signal<AssuranceLevel | null>;
  abstract readonly actRequirements: Signal<readonly ActRequirement[]>;
  abstract readonly representations: Signal<readonly Representation[]>;
  /** `null` até OD-P48. */
  abstract readonly representation: Signal<Representation | null>;
  abstract readonly loading: Signal<boolean>;
  abstract readonly loadError: Signal<ClassifiedError | null>;
  /** `GET /v1/portal/identity/me`; nunca lança — falha vai para `loadError`. */
  abstract load(): Promise<void>;
  abstract requirementFor(actKey: string): ActRequirement | null;
  /** `requirementFor(actKey)?.allowed === true`; ato desconhecido → `false` (fail-closed). */
  abstract canPerform(actKey: string): boolean;
  /** `ResumeService.save({ route, draft })` ANTES do POST; devolve `redirectUrl` + `resumeToken`. */
  abstract requestElevation(input: ElevationRequest): Promise<ElevationStarted>;
  /** POST …/elevations/{id}/complete { resumeToken } e depois `load()`; não consome o ResumePoint. */
  abstract completeElevation(
    elevationId: string,
    resumeToken: string,
  ): Promise<void>;
}

@Injectable({ providedIn: 'root' })
export class PortalSessionFacade extends SessionFacade {
  private readonly stynx = inject(StynxSessionService);
  private readonly client = inject(PortalClient);
  private readonly resumeService = inject(ResumeService);
  private readonly offlineStore = inject(OfflineDocumentStore);
  private readonly accountState = signal<CitizenAccount | null>(null);
  private readonly loadingState = signal(false);
  private readonly loadErrorState = signal<ClassifiedError | null>(null);
  private lastLoadFailure: unknown = null;

  readonly active = this.stynx.active;
  readonly account = this.accountState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly loadError = this.loadErrorState.asReadonly();

  /** Nível da claim assinada do access token STYNX (`assurance_level`). */
  readonly claimAssuranceLevel = computed<AssuranceLevel | null>(() => {
    const level = this.stynx.state().claims?.['assurance_level'];
    return isAssuranceLevel(level) ? level : null;
  });

  readonly assuranceLevel = computed<AssuranceLevel | null>(() => {
    if (!this.active()) return null;
    const fromMe = this.accountState()?.assuranceLevel;
    return isAssuranceLevel(fromMe) ? fromMe : this.claimAssuranceLevel();
  });

  readonly actRequirements = computed<readonly ActRequirement[]>(() =>
    (this.accountState()?.actRequirements ?? []).map((requirement) => ({
      act: requirement.actKey,
      level: requirement.minimumAssurance,
      allowed: requirement.allowed === true,
      ...(requirement.reason !== undefined
        ? { reason: requirement.reason }
        : {}),
    })),
  );

  /**
   * Representação ativa: `null` até que a seleção da representação (tela `/conta`, OD-P48)
   * exista — nenhuma fonte define qual das `me.representations[]` é a ativa por padrão.
   */
  readonly representation = signal<Representation | null>(null).asReadonly();

  readonly representations = computed<readonly Representation[]>(() =>
    (this.accountState()?.representations ?? []).map((item) => ({
      id: item.id,
      label: item.representedName ?? '',
      scope: item.scope,
      validUntil: item.validUntil,
    })),
  );

  constructor() {
    super();
    // Sessão ativa → carrega o `me`; inativa (logout) → conta e cache offline zerados. O
    // `ResumeService` não é limpo: precisa sobreviver ao redirecionamento OIDC (§4).
    effect(() => {
      if (this.active()) {
        void this.load();
      } else {
        this.accountState.set(null);
        this.offlineStore.clear();
      }
    });
  }

  /** `GET /v1/portal/identity/me`; nunca lança — a falha classificada fica em `loadError()`. */
  async load(): Promise<void> {
    this.loadingState.set(true);
    try {
      this.accountState.set(await this.client.me());
      this.loadErrorState.set(null);
      this.lastLoadFailure = null;
    } catch (failure: unknown) {
      this.accountState.set(null);
      this.lastLoadFailure = failure;
      this.loadErrorState.set(classifyError(failure));
    } finally {
      this.loadingState.set(false);
    }
  }

  requirementFor(actKey: string): ActRequirement | null {
    return (
      this.actRequirements().find(
        (requirement) => requirement.act === actKey,
      ) ?? null
    );
  }

  canPerform(actKey: string): boolean {
    return this.requirementFor(actKey)?.allowed === true;
  }

  async requestElevation(input: ElevationRequest): Promise<ElevationStarted> {
    // O ponto de retomada é gravado ANTES do POST: se a elevação falhar, nada se perde
    // ([UC-PORTAL-019] 3a).
    this.resumeService.save({
      route: input.resumeRoute,
      draft: input.draft ?? null,
    });
    const subjectId = await this.subjectId();
    const result = await this.client.elevateAssurance(subjectId, {
      targetLevel: input.targetLevel,
      method: input.method,
      resumeRoute: input.resumeRoute,
    });
    return result.body;
  }

  async completeElevation(
    elevationId: string,
    resumeToken: string,
  ): Promise<void> {
    await this.client.completeElevation(elevationId, { resumeToken });
    await this.load();
  }

  /** `<alvo>` da chave de idempotência da elevação (§2.2): `me.subjectId`. */
  private async subjectId(): Promise<string> {
    if (!this.accountState()) await this.load();
    const subjectId = this.accountState()?.subjectId;
    if (!subjectId) throw this.lastLoadFailure;
    return subjectId;
  }
}
