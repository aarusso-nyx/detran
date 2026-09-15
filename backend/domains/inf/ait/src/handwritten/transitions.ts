// Espelho de [WF-TEAT-001] por comando (CTG-0001 §3, tabela `from -> to :
// comando : guarda`). Documentação executável: usada pelos testes de
// catálogo (ex.: cobertura de `AIT_STATE_INVALID`) e como referência única
// para quem for portar a matriz de estados para outra camada (frontend,
// contratos). Nunca é lida pelo `AitLifecycleService` em runtime — a guarda
// real vive em cada comando (`assertAllowed`/`requireStatus`).
export interface AitTransitionRef {
  from: string | null;
  to: string;
  command: string;
  guard: string;
}

export const AIT_TRANSITIONS: readonly AitTransitionRef[] = [
  {
    from: null,
    to: 'RASCUNHO_OFFLINE',
    command: 'create',
    guard: 'catálogo+enquadramento ativos',
  },
  {
    from: 'RASCUNHO_OFFLINE',
    to: 'RASCUNHO_OFFLINE',
    command: 'vehicles',
    guard: '—',
  },
  {
    from: 'RASCUNHO_OFFLINE',
    to: 'RASCUNHO_OFFLINE',
    command: 'people',
    guard: '—',
  },
  {
    from: 'RASCUNHO_OFFLINE',
    to: 'RASCUNHO_OFFLINE',
    command: 'science',
    guard: 'assinatura coerente (RN-TEAT-005)',
  },
  {
    from: 'FINALIZADO_LOCAL',
    to: 'FINALIZADO_LOCAL',
    command: 'science',
    guard: 'assinatura coerente (RN-TEAT-005)',
  },
  {
    from: 'RASCUNHO_OFFLINE',
    to: 'CANCELADO_RASCUNHO',
    command: 'cancel-decide',
    guard: 'kind=draft e decisão approve',
  },
  {
    from: 'RASCUNHO_OFFLINE',
    to: 'FINALIZADO_LOCAL',
    command: 'finalize',
    guard: 'conteúdo mínimo + número reservado',
  },
  {
    from: 'FINALIZADO_LOCAL',
    to: 'FINALIZADO_LOCAL',
    command: 'print-events',
    guard: 'dia da lavratura (RN-TEAT-116)',
  },
  {
    from: 'ENFILEIRADO',
    to: 'ENFILEIRADO',
    command: 'print-events',
    guard: 'dia da lavratura (RN-TEAT-116)',
  },
  {
    from: 'FINALIZADO_LOCAL',
    to: 'ENFILEIRADO',
    command: 'queue-transmission',
    guard: '—',
  },
  {
    from: 'ENFILEIRADO',
    to: 'TRANSMITIDO',
    command: '(lote enviado)',
    guard: 'dispositivo, fora do servidor',
  },
  {
    from: 'TRANSMITIDO',
    to: 'RECEBIDO',
    command: 'receive-protocol',
    guard: 'receipt_protocol único no tenant',
  },
  {
    from: 'ENFILEIRADO',
    to: 'RECEBIDO',
    command: 'receive-protocol',
    guard: 'receipt_protocol único no tenant',
  },
  {
    from: '(applier de lote)',
    to: 'RECEBIDO',
    command: 'sync ait',
    guard: 'CTG-0002 §4 (M7)',
  },
  {
    from: 'RECEBIDO',
    to: 'SUSPEITO_CONCORRENCIA',
    command: '(detector M6)',
    guard: 'CTG-0002 §4.7',
  },
  {
    from: 'SUSPEITO_CONCORRENCIA',
    to: 'RECEBIDO',
    command: 'concurrency-review',
    guard: 'decision=release',
  },
  {
    from: 'SUSPEITO_CONCORRENCIA',
    to: 'REJEITADO',
    command: 'concurrency-review',
    guard: 'decision=reject',
  },
  {
    from: 'RECEBIDO',
    to: 'VALIDANDO',
    command: '(validação)',
    guard: 'source_pending — CTG-0001 §11.2',
  },
  {
    from: 'VALIDANDO',
    to: 'PENDENTE_CORRECAO',
    command: 'request-correction',
    guard: '—',
  },
  {
    from: 'REJEITADO',
    to: 'PENDENTE_CORRECAO',
    command: 'request-correction',
    guard: '—',
  },
  {
    from: 'PENDENTE_CORRECAO',
    to: 'PENDENTE_CORRECAO',
    command: 'corrections',
    guard: 'campo saneável (RN-TEAT-006)',
  },
  {
    from: 'PENDENTE_CORRECAO',
    to: 'CORRIGIDO',
    command: 'corrections/approve',
    guard: 'correção pertence ao AIT',
  },
  { from: 'RECEBIDO', to: 'ACEITO', command: 'accept', guard: '—' },
  { from: 'VALIDANDO', to: 'ACEITO', command: 'accept', guard: '—' },
  { from: 'CORRIGIDO', to: 'ACEITO', command: 'accept', guard: '—' },
  {
    from: 'ACEITO',
    to: 'INTEGRADO',
    command: 'accept (2ª etapa)',
    guard: 'mesma transação (ADR-0016)',
  },
  {
    from: 'RECEBIDO',
    to: 'REJEITADO',
    command: 'reject',
    guard: 'reason obrigatório',
  },
  {
    from: 'VALIDANDO',
    to: 'REJEITADO',
    command: 'reject',
    guard: 'reason obrigatório',
  },
  {
    from: 'PENDENTE_CORRECAO',
    to: 'REJEITADO',
    command: 'reject',
    guard: 'reason obrigatório',
  },
  {
    from: 'INTEGRADO',
    to: 'PROCESSADO',
    command: '(downstream)',
    guard: 'source_pending — CTG-0001 §11.2',
  },
  { from: 'PROCESSADO', to: 'ARQUIVADO', command: 'archive', guard: '—' },
  {
    from: 'FINALIZADO_LOCAL',
    to: 'SOLICITADO_CANCEL_POSFINAL',
    command: 'cancel-requests',
    guard: 'kind=post_final',
  },
  {
    from: 'RECEBIDO',
    to: 'SOLICITADO_CANCEL_POSFINAL',
    command: 'cancel-requests',
    guard: 'kind=post_final',
  },
  {
    from: 'VALIDANDO',
    to: 'SOLICITADO_CANCEL_POSFINAL',
    command: 'cancel-requests',
    guard: 'kind=post_final',
  },
  {
    from: 'ACEITO',
    to: 'SOLICITADO_CANCEL_POSFINAL',
    command: 'cancel-requests',
    guard: 'kind=post_final',
  },
  {
    from: 'INTEGRADO',
    to: 'SOLICITADO_CANCEL_POSFINAL',
    command: 'cancel-requests',
    guard: 'kind=post_final',
  },
  {
    from: 'SOLICITADO_CANCEL_POSFINAL',
    to: 'CANCELADO_POSFINAL',
    command: 'cancel-decide',
    guard: 'approve; conteúdo imutável',
  },
  {
    from: 'SOLICITADO_CANCEL_POSFINAL',
    to: '<origin_status>',
    command: 'cancel-decide',
    guard: 'deny; AC-TEAT-011-4',
  },
];

/** Terminais (`ait_state_ref.is_terminal = true`, DDL 14). */
export const AIT_TERMINAL_STATES = [
  'CANCELADO_RASCUNHO',
  'ARQUIVADO',
  'CANCELADO_POSFINAL',
] as const;
