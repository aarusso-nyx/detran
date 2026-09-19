// CTG-0002 §3.2 e §14 (R-0009, TASK-0007; plan M8, M23, adenda A4) —
// composição do mapa `serviceKey → DelegationTarget` (`PORTAL_DELEGATION_TARGETS`)
// no app, no padrão de `teat-snapshots.providers.ts`.
//
// R-0007 não está em `main`: defesa, recursos, indicação, pagamento e junta
// médica são `UnavailableDelegationTarget` (`delegacao_indisponivel_r0007`);
// `lgpd_declaracao` (OD-P17) e `emissao_crlv` (R-0014, [DIVERGE-M12]) idem com
// os seus motivos; `consulta_*` resolvem na hora (`ReadServiceDelegationTarget`);
// `adesao_sne`/`cancelamento_sne` delegam a `PortalSneEnrollmentService`
// (`@detran/portal-inbox`, §6.2) — erros do serviço viram
// `PORTAL.DELEGATION_FAILED` 502 no `submit` (§3.1 passo 10). Trocar os alvos
// indisponíveis pelos comandos reais é tarefa de R-0014 (M23).
import { Global, Module } from '@nestjs/common';
import { InboxModule, PortalSneEnrollmentService } from '@detran/portal-inbox';
import {
  PORTAL_DELEGATION_TARGETS,
  ReadServiceDelegationTarget,
  UnavailableDelegationTarget,
  type DelegationInput,
  type DelegationResult,
  type DelegationTarget,
  type DelegationTargetKind,
} from '@detran/portal-requests';

/** Tokens de `unavailableReason` admitidos nesta rodada (CTG-0002 §0). */
export const PORTAL_UNAVAILABLE_REASONS = {
  delegationR0007: 'delegacao_indisponivel_r0007',
  privacyEndpoint: 'privacy_endpoint_pendente',
  signedDocumentR0014: 'documento_assinado_pendente_r0014',
} as const;

/** Comando delegado das diligências (`POST …/diligences/{did}/responses`). */
export const DILIGENCE_DELEGATION_KEY = 'inf:rait-case:answer-inquiry';

/**
 * Fatia de `PortalSneEnrollmentService` que o alvo consome (§6.2: `enroll(tx,
 * subject, identity, body)` e `cancel(tx, subject, identity, reason?)`).
 */
export interface SneEnrollmentServiceLike {
  enroll(
    tx: DelegationInput['tx'],
    subject: DelegationInput['subject'],
    identity: DelegationInput['identity'],
    body: unknown,
  ): Promise<{ id: string }>;
  cancel(
    tx: DelegationInput['tx'],
    subject: DelegationInput['subject'],
    identity: DelegationInput['identity'],
    reason?: string,
  ): Promise<{ id?: string } | undefined | void>;
}

/** §3.2 `adesao_sne` / `cancelamento_sne` → `portal:sne-enrollment:{enroll|cancel}`. */
export class SneEnrollmentDelegationTarget implements DelegationTarget {
  readonly targetKinds: readonly DelegationTargetKind[] = ['none'];

  constructor(
    readonly serviceKey: 'adesao_sne' | 'cancelamento_sne',
    private readonly enrollment: SneEnrollmentServiceLike,
  ) {}

  availability(): string | null {
    return null;
  }

  async delegate(input: DelegationInput): Promise<DelegationResult> {
    if (this.serviceKey === 'adesao_sne') {
      const enrolled = await this.enrollment.enroll(
        input.tx,
        input.subject,
        input.identity,
        input.draft,
      );
      return {
        domain: 'portal',
        command: 'portal:sne-enrollment:enroll',
        externalId: enrolled.id,
        status: 'delegated',
      };
    }
    const reason = input.draft.reason;
    const cancelled = await this.enrollment.cancel(
      input.tx,
      input.subject,
      input.identity,
      typeof reason === 'string' ? reason : undefined,
    );
    return {
      domain: 'portal',
      command: 'portal:sne-enrollment:cancel',
      externalId:
        cancelled && typeof cancelled === 'object' && 'id' in cancelled
          ? ((cancelled as { id?: string }).id ?? null)
          : null,
      status: 'delegated',
    };
  }
}

/** Mapa desta rodada (CTG-0002 §3.2). */
export function createPortalDelegationTargets(
  enrollment: SneEnrollmentServiceLike,
): Map<string, DelegationTarget> {
  const targets = new Map<string, DelegationTarget>();
  const unavailable = (
    serviceKey: string,
    reason: string,
    kinds: readonly DelegationTargetKind[],
  ): void => {
    targets.set(
      serviceKey,
      new UnavailableDelegationTarget(serviceKey, reason, kinds),
    );
  };
  const { delegationR0007, privacyEndpoint, signedDocumentR0014 } =
    PORTAL_UNAVAILABLE_REASONS;
  unavailable('defesa_previa', delegationR0007, ['ait']);
  unavailable('recurso_jari', delegationR0007, ['ait', 'case']);
  unavailable('recurso_cetran', delegationR0007, ['case']);
  unavailable('indicacao_condutor', delegationR0007, ['ait']);
  unavailable('pagamento', delegationR0007, ['ait']);
  unavailable('junta_medica', delegationR0007, ['exam']);
  unavailable(DILIGENCE_DELEGATION_KEY, delegationR0007, ['case']);
  unavailable('lgpd_declaracao', privacyEndpoint, ['none']);
  unavailable('emissao_crlv', signedDocumentR0014, ['vehicle']);
  targets.set(
    'adesao_sne',
    new SneEnrollmentDelegationTarget('adesao_sne', enrollment),
  );
  targets.set(
    'cancelamento_sne',
    new SneEnrollmentDelegationTarget('cancelamento_sne', enrollment),
  );
  targets.set(
    'consulta_multas',
    new ReadServiceDelegationTarget('consulta_multas', 'ait', ['none', 'ait']),
  );
  targets.set(
    'consulta_cnh',
    new ReadServiceDelegationTarget('consulta_cnh', 'document', ['none']),
  );
  targets.set(
    'consulta_bat',
    new ReadServiceDelegationTarget('consulta_bat', 'crash', ['crash']),
  );
  targets.set(
    'consulta_exame',
    new ReadServiceDelegationTarget('consulta_exame', 'exam', ['exam']),
  );
  return targets;
}

export const PORTAL_DELEGATION_TARGETS_PROVIDER = {
  provide: PORTAL_DELEGATION_TARGETS,
  useFactory: (
    enrollment: SneEnrollmentServiceLike,
  ): Map<string, DelegationTarget> => createPortalDelegationTargets(enrollment),
  inject: [PortalSneEnrollmentService],
};

@Global()
@Module({
  imports: [InboxModule],
  providers: [PORTAL_DELEGATION_TARGETS_PROVIDER],
  exports: [PORTAL_DELEGATION_TARGETS],
})
export class PortalDelegationTargetsModule {}
