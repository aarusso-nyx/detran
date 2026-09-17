// R-0014 TASK-0008 (Inspector). Transcrição literal da tabela §6.2 do contrato
// `work/rounds/R-0014/contracts/CTG-0003a.md` (14 `FormGate`, `forms/*.schema.ts`, ainda
// inexistentes — TASK-0009). Usado pelos specs `forms/*.schema.spec.ts` (C-3a-97: cada
// `<NOME>_GATE` deve ser deep-equal à linha correspondente desta tabela).
export const DEFESA_PREVIA_GATE_FIXTURE = {
  serviceKey: 'defesa_previa',
  actKey: 'defesa_previa',
  minimumAssurance: 'avancada',
  precondition: {
    state: 'NOTIFICADO_AUTUACAO',
    timer: 'T-DEF',
    note: 'AIT em NOTIFICADO_AUTUACAO com T-DEF aberto (fora do prazo: protocola e avisa)',
    violation: null,
    warning: 'PORTAL.REQUEST_OUT_OF_DEADLINE',
  },
  command: 'submit',
  effect: 'PROTOCOLADO → inf:rait-case:protocol (instance=defesa_previa)',
} as const;

export const RECURSO_JARI_GATE_FIXTURE = {
  serviceKey: 'recurso_jari',
  actKey: 'recurso_jari',
  minimumAssurance: 'avancada',
  precondition: {
    state: null,
    timer: 'T-NP-VENC',
    note: 'NP com T-NP-VENC aberto (intempestivo: avisa sem efeito suspensivo)',
    violation: null,
    warning: 'PORTAL.REQUEST_OUT_OF_DEADLINE',
  },
  command: 'submit',
  effect: 'PROTOCOLADO → inf:rait-case:protocol (instance=jari)',
} as const;

export const RECURSO_CETRAN_GATE_FIXTURE = {
  serviceKey: 'recurso_cetran',
  actKey: 'recurso_cetran',
  minimumAssurance: 'avancada',
  precondition: {
    state: null,
    timer: 'T-R2',
    note: 'T-R2 aberto (vencido bloqueia com explicação)',
    violation: 'PORTAL.APPEAL_CETRAN_WINDOW_CLOSED',
    warning: null,
  },
  command: 'submit',
  effect: 'PROTOCOLADO → inf:rait-case:protocol (instance=cetran)',
} as const;

export const INDICACAO_CONDUTOR_GATE_FIXTURE = {
  serviceKey: 'indicacao_condutor',
  actKey: 'indicacao_condutor',
  minimumAssurance: 'avancada',
  precondition: {
    state: null,
    timer: 'T-IND',
    note: 'T-IND aberto',
    violation: 'PORTAL.INDICATION_WINDOW_CLOSED',
    warning: null,
  },
  command: 'submit',
  effect: 'PROTOCOLADO → inf:infraction:indicate-driver',
} as const;

export const PAGAMENTO_GATE_FIXTURE = {
  serviceKey: 'pagamento',
  actKey: 'pagamento',
  minimumAssurance: 'simples',
  precondition: {
    state: null,
    timer: null,
    note: 'faixa disponível para a fase (80/60/40); 60% só com SNE; 40% exige declaracao_reconhecimento + versão do texto',
    violation: 'PORTAL.PAYMENT_TIER_NOT_AVAILABLE',
    warning: null,
  },
  command: 'submit',
  effect:
    'inf:collection:issue → { documentId, barcode | pixCopyPaste, amount, validUntil }',
} as const;

export const DESISTENCIA_GATE_FIXTURE = {
  serviceKey: null,
  actKey: null,
  minimumAssurance: 'simples',
  precondition: {
    state: null,
    timer: null,
    note: 'forma escrita · antes do julgamento (pautado hoje bloqueia)',
    violation: 'PORTAL.WITHDRAWAL_AFTER_JUDGMENT',
    warning: null,
  },
  command: 'withdraw',
  effect:
    'DESISTIDO (antes do protocolo) | inf:rait-case:withdraw → ENCERRADO_DESISTENCIA',
} as const;

export const RESPOSTA_DILIGENCIA_GATE_FIXTURE = {
  serviceKey: null,
  actKey: null,
  minimumAssurance: 'simples',
  precondition: {
    state: 'open',
    timer: null,
    note: 'diligência open; prazo visível; prorrogação uma vez',
    violation: 'PORTAL.DILIGENCE_NOT_OPEN',
    warning: null,
  },
  command: 'respond_diligence',
  effect: 'inf:rait-case:answer-inquiry',
} as const;

export const ADESAO_SNE_GATE_FIXTURE = {
  serviceKey: 'adesao_sne',
  actKey: 'adesao_sne',
  minimumAssurance: 'simples',
  precondition: {
    state: null,
    timer: null,
    note: 'contato obrigatório (sem e-mail/celular bloqueia)',
    violation: 'PORTAL.SNE_CONTACT_REQUIRED',
    warning: null,
  },
  command: 'submit',
  effect: 'SnePort.enrollCitizen → ADERIDO_SNE',
} as const;

export const PREFERENCIAS_GATE_FIXTURE = {
  serviceKey: null,
  actKey: null,
  minimumAssurance: 'simples',
  precondition: {
    state: null,
    timer: null,
    note: '—',
    violation: null,
    warning: null,
  },
  command: 'update_preferences',
  effect: '@stynx-nyx/preferences (PUT preferences, If-Match)',
} as const;

export const MANIFESTACAO_GATE_FIXTURE = {
  serviceKey: 'manifestar',
  actKey: 'manifestar',
  minimumAssurance: 'none',
  precondition: {
    state: null,
    timer: null,
    note: 'sem motivo determinante; anônimo admitido',
    violation: null,
    warning: null,
  },
  command: 'manifest',
  effect:
    'MANIFESTACAO_REGISTRADA → comprovante imediato { protocol, receivedAt }',
} as const;

export const AVALIACAO_GATE_FIXTURE = {
  serviceKey: 'avaliar',
  actKey: 'avaliar',
  minimumAssurance: 'simples',
  precondition: {
    state: 'RESULTADO_DISPONIVEL | ENCERRADA',
    timer: null,
    note: 'após RESULTADO_DISPONIVEL/ENCERRADA',
    violation: 'PORTAL.EVALUATION_NOT_OFFERED',
    warning: null,
  },
  command: 'evaluate',
  effect: 'AVALIADA; alimenta citizen-service',
} as const;

export const MEUS_DADOS_GATE_FIXTURE = {
  serviceKey: 'lgpd_declaracao',
  actKey: 'lgpd_declaracao',
  minimumAssurance: 'simples',
  precondition: {
    state: null,
    timer: null,
    note: 'declaração completa exige avançada',
    violation: 'PORTAL.PRIVACY_SCOPE_REQUIRES_ASSURANCE',
    warning: null,
  },
  command: 'submit',
  effect: '@stynx-nyx/privacy (/privacy/exports)',
} as const;

export const ELEVACAO_GATE_FIXTURE = {
  serviceKey: null,
  actKey: null,
  minimumAssurance: 'simples',
  precondition: {
    state: null,
    timer: null,
    note: 'redirect gov.br com resume; prazo legal não pausa (AC-4a)',
    violation: null,
    warning: null,
  },
  command: 'elevate',
  effect: 'NIVEL_ASSINATURA_ELEVADO',
} as const;

export const JUNTA_MEDICA_GATE_FIXTURE = {
  serviceKey: 'junta_medica',
  actKey: 'junta_medica',
  minimumAssurance: 'avancada',
  precondition: {
    state: null,
    timer: null, // código do timer: source_pending
    note: '30 dias do conhecimento',
    violation: 'PORTAL.BOARD_REQUEST_WINDOW_CLOSED',
    warning: null,
  },
  command: 'submit',
  effect: 'delegação PEC (ch:...:request-board)',
} as const;
