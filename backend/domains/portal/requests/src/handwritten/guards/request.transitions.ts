// Espelho de [WF-PORTAL-001] §Transições para `portal.request.state`
// (work/rounds/R-0009/contracts/CTG-0001.md §6.1; plan R-0009 M7 e adenda
// A1(c); OD-P13 fechado — 13 tokens fixos em código). Tabela pura + guarda de
// estado por comando, sem rota, sem banco e sem relógio: os comandos de
// CTG-0002 (`PortalRequestsService`, TASK-0007) chamam `assertTransition`
// dentro da transação. Nenhuma reinterpretação: `allowed[]` copiado do
// bloco "estados NÃO admitidos por comando" do §6.1.
//
// Erro: `DetranError` de `@detran/shared` com código do catálogo do Portal
// (`PORTAL.REQUEST_STATE_INVALID`, portal-error-catalog.md §3) — mesma forma
// de `PortalError extends DetranError`; a subclasse vive em
// `@detran/portal-identity`, que este pacote só passa a importar quando
// TASK-0005 declarar `moduleImports: IdentityModule` (M24).
import { DetranError } from '@detran/shared';

/** Os 13 tokens fixos de `portal.request.state` (§0/§6.1, OD-P13). */
export const REQUEST_STATES = [
  'IDENTIFICADO',
  'SERVICO_SELECIONADO',
  'ELEGIBILIDADE_VERIFICADA',
  'INELEGIVEL',
  'PEDIDO_EM_COMPOSICAO',
  'AGUARDANDO_NIVEL_ASSINATURA',
  'AGUARDANDO_PAGAMENTO',
  'PROTOCOLADO',
  'EM_ANDAMENTO_NO_ORGAO',
  'RESULTADO_DISPONIVEL',
  'AVALIACAO_OFERECIDA',
  'CONCLUIDO',
  'DESISTIDO',
] as const;
export type RequestState = (typeof REQUEST_STATES)[number];

/** Terminais (§6.1): nenhum comando é admitido. */
export const REQUEST_TERMINAL_STATES: readonly RequestState[] = [
  'CONCLUIDO',
  'DESISTIDO',
];

export interface RequestTransition {
  /** `null` = criação. */
  from: RequestState | null;
  to: RequestState;
  /** Comando cidadão ou evento/ato interno que dispara a linha. */
  command: string;
  /** Guarda em prosa, copiada do §6.1. */
  guard: string;
}

export const REQUEST_TRANSITIONS: readonly RequestTransition[] = [
  {
    from: null,
    to: 'PEDIDO_EM_COMPOSICAO',
    command: 'create',
    guard:
      'catálogo available|partially_available (unavailable → 422 SERVICE_UNAVAILABLE, M8); vínculo (M10) quando targetId; IDENTIFICADO → SERVICO_SELECIONADO → ELEGIBILIDADE_VERIFICADA em memória na mesma transação; INELEGIVEL = 422 PORTAL.INELIGIBLE sem linha persistida',
  },
  {
    from: 'IDENTIFICADO',
    to: 'SERVICO_SELECIONADO',
    command: 'create',
    guard: 'em memória (M7): nunca gravado por comando',
  },
  {
    from: 'SERVICO_SELECIONADO',
    to: 'ELEGIBILIDADE_VERIFICADA',
    command: 'create',
    guard: 'em memória (M7): vínculo verificado',
  },
  {
    from: 'SERVICO_SELECIONADO',
    to: 'INELEGIVEL',
    command: 'create',
    guard: 'em memória (M7): 422 PORTAL.INELIGIBLE, sem linha persistida',
  },
  {
    from: 'ELEGIBILIDADE_VERIFICADA',
    to: 'PEDIDO_EM_COMPOSICAO',
    command: 'create',
    guard: 'em memória (M7): primeira linha persistida',
  },
  {
    from: 'PEDIDO_EM_COMPOSICAO',
    to: 'PEDIDO_EM_COMPOSICAO',
    command: 'draft',
    guard: 'If-Match (M9)',
  },
  {
    from: 'PEDIDO_EM_COMPOSICAO',
    to: 'AGUARDANDO_NIVEL_ASSINATURA',
    command: 'submit',
    guard:
      'assertActLevel lançou ASSURANCE_INSUFFICIENT: estado persistido E 403 devolvido (M7)',
  },
  {
    from: 'PEDIDO_EM_COMPOSICAO',
    to: 'AGUARDANDO_PAGAMENTO',
    command: 'submit',
    guard: "nível ok ∧ service_key='emissao_crlv' ∧ débito",
  },
  {
    from: 'PEDIDO_EM_COMPOSICAO',
    to: 'PROTOCOLADO',
    command: 'submit',
    guard:
      'nível ok ∧ sem pré-condição financeira; protocolo gravado ANTES da validação do rascunho (T-PROTOCOLO, M8)',
  },
  {
    from: 'AGUARDANDO_NIVEL_ASSINATURA',
    to: 'AGUARDANDO_PAGAMENTO',
    command: 'submit',
    guard: 're-submissão após elevação (UC-PORTAL-019 AC-4; A1(c))',
  },
  {
    from: 'AGUARDANDO_NIVEL_ASSINATURA',
    to: 'PROTOCOLADO',
    command: 'submit',
    guard: 're-submissão após elevação (UC-PORTAL-019 AC-4; A1(c))',
  },
  {
    from: 'AGUARDANDO_PAGAMENTO',
    to: 'PROTOCOLADO',
    command: 'PAGAMENTO_CONFIRMADO',
    guard: 'evento de inf/collection (ADR-0017); CTG-0002',
  },
  {
    from: 'PROTOCOLADO',
    to: 'EM_ANDAMENTO_NO_ORGAO',
    command: 'delegate',
    guard:
      "mesma transação do submit; falha → estado permanece PROTOCOLADO, delegation_status='failed', 502 DELEGATION_FAILED (M8)",
  },
  {
    from: 'EM_ANDAMENTO_NO_ORGAO',
    to: 'RESULTADO_DISPONIVEL',
    command: 'evento do destino',
    guard: 'projeção (M16), CTG-0002',
  },
  {
    from: 'RESULTADO_DISPONIVEL',
    to: 'AVALIACAO_OFERECIDA',
    command: 'evento do destino',
    guard: 'T-AVAL-CONVITE imediato (WF §Prazos)',
  },
  {
    from: 'AVALIACAO_OFERECIDA',
    to: 'CONCLUIDO',
    command: 'evaluate',
    guard: 'resposta do cidadão',
  },
  {
    from: 'AVALIACAO_OFERECIDA',
    to: 'CONCLUIDO',
    command: 'expire',
    guard: 'janela do convite sem valor na fonte → source_pending (OD-P24)',
  },
  {
    from: 'PEDIDO_EM_COMPOSICAO',
    to: 'DESISTIDO',
    command: 'withdraw',
    guard: 'If-Match; withdrawn_at = clock.now()',
  },
  {
    from: 'AGUARDANDO_NIVEL_ASSINATURA',
    to: 'DESISTIDO',
    command: 'withdraw',
    guard: 'idem',
  },
  {
    from: 'AGUARDANDO_PAGAMENTO',
    to: 'DESISTIDO',
    command: 'withdraw',
    guard: 'idem',
  },
];

/**
 * Estados admitidos por comando cidadão (§6.1 "estados NÃO admitidos por
 * comando"): a lista `allowed` devolvida no `context` do 409.
 */
export const REQUEST_ALLOWED_STATES_BY_COMMAND: Readonly<
  Record<string, readonly RequestState[]>
> = {
  draft: ['PEDIDO_EM_COMPOSICAO'],
  submit: ['PEDIDO_EM_COMPOSICAO', 'AGUARDANDO_NIVEL_ASSINATURA'],
  withdraw: [
    'PEDIDO_EM_COMPOSICAO',
    'AGUARDANDO_NIVEL_ASSINATURA',
    'AGUARDANDO_PAGAMENTO',
  ],
  evaluate: ['AVALIACAO_OFERECIDA'],
};

export interface RequestStateSnapshot {
  state: string;
}

export interface RequestTrigger {
  command: string;
}

/**
 * Guarda de estado por comando: lança `409 PORTAL.REQUEST_STATE_INVALID
 * { state, allowed }` fora de `allowed[]`; comando desconhecido nunca é
 * admitido (`allowed = []`). Devolve as linhas da tabela que o comando pode
 * percorrer a partir do estado atual (o destino depende da guarda do comando).
 */
export function assertTransition(
  current: RequestStateSnapshot,
  trigger: RequestTrigger,
): readonly RequestTransition[] {
  const allowed = REQUEST_ALLOWED_STATES_BY_COMMAND[trigger.command] ?? [];
  if (!(allowed as readonly string[]).includes(current.state)) {
    throw new DetranError('PORTAL.REQUEST_STATE_INVALID', {
      status: 409,
      context: { state: current.state, allowed: [...allowed] },
      message: 'O pedido não está em um estado que admita este comando.',
    });
  }
  return REQUEST_TRANSITIONS.filter(
    (row) => row.from === current.state && row.command === trigger.command,
  );
}
