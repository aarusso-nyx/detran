// SessionFacade (portal-frontends.md §5.1; plan.md M8): sessão gov.br via `StynxSessionService`
// + `GET /v1/portal/identity/me`. Nível de assinatura vem da claim assinada `assurance_level`
// (`state().claims`) e do `me` (portal-route-contract.md §1.3) — nunca de corpo nem de tabela no
// cliente. A matriz ato → nível é `actRequirements[]` do `me` (§3).
//
// `SessionFacade` é o token de injeção (classe abstrata: só os quatro signals, substituível por
// `useValue` nos testes — detran-ui-guide.md §5); `PortalSessionFacade` é a implementação.
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

/**
 * Requisito de nível por ato — modelo de visão de `me.actRequirements[]`
 * (`{ actKey, minimumAssurance, allowed, reason? }`): `act` = `actKey`,
 * `level` = `minimumAssurance`.
 */
export interface ActRequirement {
  readonly act: string;
  readonly level: AssuranceLevel | 'none';
  readonly allowed?: boolean;
  readonly reason?: string;
}

/** Representação ativa (procuração) — modelo de visão de `me.representations[]`. */
export interface Representation {
  readonly label: string;
  readonly id?: string;
  readonly representedCpf?: string;
  readonly scope?: 'ait' | 'all';
  readonly validUntil?: string | null;
}

@Injectable({
  providedIn: 'root',
  useFactory: () => inject(PortalSessionFacade),
})
export abstract class SessionFacade {
  abstract readonly active: Signal<boolean>;
  abstract readonly assuranceLevel: Signal<AssuranceLevel | null>;
  abstract readonly actRequirements: Signal<readonly ActRequirement[]>;
  abstract readonly representation: Signal<Representation | null>;
}

@Injectable({ providedIn: 'root' })
export class PortalSessionFacade extends SessionFacade {
  private readonly stynx = inject(StynxSessionService);
  private readonly client = inject(PortalClient);
  private readonly account = signal<CitizenAccount | null>(null);

  readonly active = this.stynx.active;

  /** Nível da claim assinada do access token STYNX (`assurance_level`). */
  readonly claimAssuranceLevel = computed<AssuranceLevel | null>(() => {
    const level = this.stynx.state().claims?.['assurance_level'];
    return isAssuranceLevel(level) ? level : null;
  });

  readonly assuranceLevel = computed<AssuranceLevel | null>(() => {
    if (!this.active()) return null;
    const fromMe = this.account()?.assuranceLevel;
    return isAssuranceLevel(fromMe) ? fromMe : this.claimAssuranceLevel();
  });

  readonly actRequirements = computed<readonly ActRequirement[]>(() =>
    (this.account()?.actRequirements ?? []).map((requirement) => ({
      act: requirement.actKey,
      level: requirement.minimumAssurance,
      allowed: requirement.allowed,
      reason: requirement.reason,
    })),
  );

  /**
   * Representação ativa: `null` até que a seleção da representação (tela `/conta`, spec §4)
   * exista — nenhuma fonte define qual das `me.representations[]` é a ativa por padrão.
   */
  readonly representation = signal<Representation | null>(null).asReadonly();

  readonly representations = computed<readonly Representation[]>(() =>
    (this.account()?.representations ?? []).map((item) => ({
      id: item.id,
      label: item.representedName ?? '',
      scope: item.scope,
      validUntil: item.validUntil,
    })),
  );

  constructor() {
    super();
    effect(() => {
      if (this.active()) {
        void this.loadAccount();
      } else {
        this.account.set(null);
      }
    });
  }

  /** Recarrega `GET /v1/portal/identity/me` (após elevação de nível, por exemplo). */
  async loadAccount(): Promise<void> {
    try {
      this.account.set(await this.client.me());
    } catch {
      this.account.set(null);
    }
  }
}
