// Espelho de [WF-PORTAL-004] §Transições para `portal.manifestation.state`
// (work/rounds/R-0009/contracts/CTG-0001.md §6.4; plan R-0009 M13; 9 tokens).
// Tabela pura + guarda de estado por comando, sem rota, sem banco e sem
// relógio: `PortalManifestationService` (CTG-0002, TASK-0008) chama
// `assertTransition` dentro da transação. `allowed[]` copiado do bloco
// "estados NÃO admitidos por comando" do §6.4.
//
// Erro: `DetranError` de `@detran/shared` com código do catálogo do Portal
// (`PORTAL.MANIFESTATION_STATE_INVALID`, portal-error-catalog.md §6) — mesma
// forma de `PortalError extends DetranError`; a subclasse vive em
// `@detran/portal-identity`, importada quando TASK-0005 declarar
// `moduleImports: IdentityModule` (M24).
import { DetranError } from '@detran/shared';

/** Os 9 tokens de `portal.manifestation.state` (§0/§6.4). */
export const MANIFESTATION_STATES = [
  'MANIFESTACAO_REGISTRADA',
  'COMPROVANTE_EMITIDO',
  'EM_ANALISE',
  'INFORMACAO_SOLICITADA_AO_AGENTE',
  'DECISAO_FINAL_ELABORADA',
  'CIENCIA_AO_USUARIO',
  'ENCERRADA',
  'AVALIACAO_OFERECIDA',
  'AVALIADA',
] as const;
export type ManifestationState = (typeof MANIFESTATION_STATES)[number];

/**
 * Terminais (§6.4): AVALIADA; ENCERRADA só sai por `offer_evaluation` na
 * mesma transação do `acknowledge` — logo, observável, também terminal.
 */
export const MANIFESTATION_TERMINAL_STATES: readonly ManifestationState[] = [
  'AVALIADA',
  'ENCERRADA',
];

export interface ManifestationTransition {
  /** `null` = criação. */
  from: ManifestationState | null;
  to: ManifestationState;
  /** Comando cidadão, comando interno (sem rota, OD-P18) ou evento. */
  command: string;
  /** Guarda em prosa, copiada do §6.4. */
  guard: string;
}

export const MANIFESTATION_TRANSITIONS: readonly ManifestationTransition[] = [
  {
    from: null,
    to: 'MANIFESTACAO_REGISTRADA',
    command: 'manifest',
    guard:
      'nunca recusa (RN-PORTAL-109 1); só kind validado (400 MANIFESTATION_KIND_INVALID); anônimo admitido (H.51)',
  },
  {
    from: 'MANIFESTACAO_REGISTRADA',
    to: 'COMPROVANTE_EMITIDO',
    command: 'issue_receipt',
    guard:
      'MESMA transação do manifest; protocol, received_at, agency_due_on = +30 dias corridos',
  },
  {
    from: 'COMPROVANTE_EMITIDO',
    to: 'EM_ANALISE',
    command: 'analyze',
    guard: 'interno (sem rota, OD-P18)',
  },
  {
    from: 'EM_ANALISE',
    to: 'INFORMACAO_SOLICITADA_AO_AGENTE',
    command: 'request_info',
    guard: 'interno; info_due_on = hoje + 20 dias corridos',
  },
  {
    from: 'INFORMACAO_SOLICITADA_AO_AGENTE',
    to: 'EM_ANALISE',
    command: 'receive_info',
    guard: 'interno',
  },
  {
    from: 'EM_ANALISE',
    to: 'DECISAO_FINAL_ELABORADA',
    command: 'decide',
    guard: 'interno; decision_text, decided_at',
  },
  {
    from: 'DECISAO_FINAL_ELABORADA',
    to: 'CIENCIA_AO_USUARIO',
    command: 'notify_user',
    guard: "interno (inbox_item source='portal')",
  },
  {
    from: 'CIENCIA_AO_USUARIO',
    to: 'ENCERRADA',
    command: 'acknowledge',
    guard:
      'POST manifestations/{id}/acknowledge; acknowledged_at; único comando cidadão',
  },
  {
    from: 'ENCERRADA',
    to: 'AVALIACAO_OFERECIDA',
    command: 'offer_evaluation',
    guard: 'MESMA transação do acknowledge (M13)',
  },
  {
    from: 'AVALIACAO_OFERECIDA',
    to: 'AVALIADA',
    command: 'evaluate',
    guard: 'POST evaluations (CTG-0002)',
  },
  {
    from: 'AVALIACAO_OFERECIDA',
    to: 'ENCERRADA',
    command: 'expire_evaluation',
    guard:
      'janela sem valor na fonte → source_pending (OD-P24); não bloqueia nada',
  },
];

/**
 * Estados admitidos por comando (§6.4 "estados NÃO admitidos por comando"):
 * a lista `allowed` devolvida no `context` do 409. `issue_receipt`,
 * `offer_evaluation` e `expire_evaluation` não são comandos autônomos
 * (mesma transação ou timer) e por isso não constam aqui.
 */
export const MANIFESTATION_ALLOWED_STATES_BY_COMMAND: Readonly<
  Record<string, readonly ManifestationState[]>
> = {
  acknowledge: ['CIENCIA_AO_USUARIO'],
  evaluate: ['AVALIACAO_OFERECIDA'],
  analyze: ['COMPROVANTE_EMITIDO'],
  request_info: ['EM_ANALISE'],
  decide: ['EM_ANALISE'],
  receive_info: ['INFORMACAO_SOLICITADA_AO_AGENTE'],
  notify_user: ['DECISAO_FINAL_ELABORADA'],
};

export interface ManifestationStateSnapshot {
  state: string;
}

export interface ManifestationTrigger {
  command: string;
}

/**
 * Guarda de estado por comando: lança `409 PORTAL.MANIFESTATION_STATE_INVALID
 * { state, allowed }` fora de `allowed[]`; comando desconhecido nunca é
 * admitido. Devolve a linha da tabela que o comando percorre.
 */
export function assertTransition(
  current: ManifestationStateSnapshot,
  trigger: ManifestationTrigger,
): ManifestationTransition {
  const allowed =
    MANIFESTATION_ALLOWED_STATES_BY_COMMAND[trigger.command] ?? [];
  const row = MANIFESTATION_TRANSITIONS.find(
    (candidate) =>
      candidate.from === current.state && candidate.command === trigger.command,
  );
  if (!(allowed as readonly string[]).includes(current.state) || !row) {
    throw new DetranError('PORTAL.MANIFESTATION_STATE_INVALID', {
      status: 409,
      context: { state: current.state, allowed: [...allowed] },
      message: 'A manifestação não está em um estado que admita este comando.',
    });
  }
  return row;
}
