// Porta de delegação por serviço (work/rounds/R-0009/contracts/CTG-0002.md
// §3.2; plan R-0009 M8, M23). O pacote só conhece a porta: o mapa
// `serviceKey → DelegationTarget` chega pelo token `PORTAL_DELEGATION_TARGETS`
// composto pelo app (`backend/app/src/portal-delegation.providers.ts`), no
// padrão de `SNAPSHOT_QUERY_PORTS` (teat-snapshots.providers.ts). Nesta
// rodada (R-0007 ausente) os alvos de defesa/recurso/indicação/pagamento/
// junta/LGPD/CRLV são `UnavailableDelegationTarget`: `availability()` devolve
// o token de `unavailableReason` e `POST requests` responde 422 antes de
// existir pedido. `ReadServiceDelegationTarget` (consulta_*) resolve na hora:
// `not_applicable` + `immediateResult` (RESULTADO_DISPONIVEL → AVALIACAO_OFERECIDA
// na mesma transação, T-AVAL-CONVITE imediato).
import { Inject, Injectable } from '@nestjs/common';
import {
  PortalError,
  type PortalClockLike,
  type PortalIdentityClaims,
  type PortalSqlTransaction,
  type PortalSubjectRecord,
} from '@detran/portal-identity';

import type { Request } from '../../entities/request.entity.js';

export const PORTAL_DELEGATION_TARGETS = Symbol('PORTAL_DELEGATION_TARGETS');

export type DelegationTargetKind =
  'ait' | 'case' | 'vehicle' | 'exam' | 'crash' | 'none';

export interface DelegationProtocol {
  number: string;
  issuedAt: Date;
  receiptHash: string;
}

export interface DelegationInput {
  tx: PortalSqlTransaction;
  /** Linha de `portal.request` já em `PROTOCOLADO` (entidade gerada). */
  request: Request;
  /** `payload_json` do rascunho vigente — NÃO validado pelo Portal (§3.1). */
  draft: Record<string, unknown>;
  identity: PortalIdentityClaims;
  subject: PortalSubjectRecord;
  protocol: DelegationProtocol;
  clock: PortalClockLike;
  tenantTz: string;
}

export interface DelegationResult {
  /** `portal.request.delegation_domain` (varchar(20)). */
  domain: string | null;
  /** `delegation_command` (varchar(80)), ex.: `portal:sne-enrollment:enroll`. */
  command: string | null;
  externalId: string | null;
  status: 'delegated' | 'not_applicable';
  /** Alvos de leitura: RESULTADO_DISPONIVEL na mesma transação (§3.1 passo 10). */
  immediateResult?: boolean;
}

export interface DelegationTarget {
  readonly serviceKey: string;
  /** `null` = disponível; token de `unavailableReason` (§0) = indisponível. */
  availability(): string | null;
  /** `targetKind` admitidos pelo serviço (route contract §5.1 / M7). */
  readonly targetKinds: readonly DelegationTargetKind[];
  delegate(input: DelegationInput): Promise<DelegationResult>;
}

export interface DelegationTargetMap {
  get(serviceKey: string): DelegationTarget | undefined;
}

export class UnavailableDelegationTarget implements DelegationTarget {
  constructor(
    readonly serviceKey: string,
    readonly unavailableReason: string,
    readonly targetKinds: readonly DelegationTargetKind[],
  ) {}

  availability(): string | null {
    return this.unavailableReason;
  }

  /** Nunca alcançado: `POST requests` barra antes (§2.3 passo 5). */
  async delegate(): Promise<DelegationResult> {
    throw new PortalError('PORTAL.SERVICE_UNAVAILABLE', {
      status: 422,
      context: {
        unavailableReason: this.unavailableReason,
        alternativeChannelNote: null,
      },
    });
  }
}

/** `consulta_*`: leitura interna do Portal, resultado imediato. */
export class ReadServiceDelegationTarget implements DelegationTarget {
  constructor(
    readonly serviceKey: string,
    readonly readResource: string,
    readonly targetKinds: readonly DelegationTargetKind[],
  ) {}

  availability(): string | null {
    return null;
  }

  async delegate({ request }: DelegationInput): Promise<DelegationResult> {
    return {
      domain: 'portal',
      command: `portal:${this.readResource}:read`,
      externalId: request.target_id ?? null,
      status: 'not_applicable',
      immediateResult: true,
    };
  }
}

@Injectable()
export class RequestDelegationService {
  constructor(
    @Inject(PORTAL_DELEGATION_TARGETS)
    private readonly targets: DelegationTargetMap,
  ) {}

  /** Serviço no catálogo sem alvo é defeito de composição (500). */
  targetFor(serviceKey: string): DelegationTarget {
    const target = this.targets.get(serviceKey);
    if (!target) {
      throw new PortalError('PORTAL.INTERNAL', {
        status: 500,
        context: { serviceKey },
      });
    }
    return target;
  }

  delegate(
    serviceKey: string,
    input: DelegationInput,
  ): Promise<DelegationResult> {
    return this.targetFor(serviceKey).delegate(input);
  }
}
