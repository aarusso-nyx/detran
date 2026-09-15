-- Vocabulário canônico do ciclo de vida da infração (WF-INF-003, reviewed;
-- ADR-0014) e do catálogo unificado de timers (WF-INF-002 §9). Tabelas de
-- referência globais (sem tenant_id, sem RLS), lidas pelo agregado da infração
-- (blueprint BP-INF-INFRACTION-001, pendente) e pelos consumidores portal,
-- dashboard e senatran-adapter. Os blueprints gerados (ADR-0007) referenciam
-- estes códigos por chave estrangeira; o check-constraint gerado deve listar o
-- mesmo conjunto. tools/check-lifecycle-vocabulary.ts falha `pnpm check` quando
-- os códigos daqui divergem de WF-INF-003 §1.

CREATE SCHEMA IF NOT EXISTS inf;

-- WF-TEAT-001 — Estados canônicos da lavratura e processamento do AIT.
CREATE TABLE IF NOT EXISTS inf.ait_state_ref (
  code varchar(60) PRIMARY KEY,
  sort_order smallint NOT NULL UNIQUE,
  is_terminal boolean NOT NULL DEFAULT false,
  description text NOT NULL,
  legal_basis text NOT NULL
);
COMMENT ON TABLE inf.ait_state_ref IS 'WF-TEAT-001 — estados do ciclo de lavratura do AIT; [estado_origem] é notação de retorno, não estado.';

INSERT INTO inf.ait_state_ref (code, sort_order, is_terminal, description, legal_basis) VALUES
  ('RASCUNHO_OFFLINE', 10, false, 'rascunho criado no dispositivo com faixa reservada', 'WF-TEAT-001; REF-SENATRAN-997 Anexo II'),
  ('CANCELADO_RASCUNHO', 20, true, 'cancelamento do preenchimento em curso aprovado pela autoridade', 'WF-TEAT-001; REF-SENATRAN-997 Anexo II, k'),
  ('FINALIZADO_LOCAL', 30, false, 'conteúdo legal congelado localmente por ação explícita do agente', 'WF-TEAT-001; REF-SENATRAN-997 Anexo II, g'),
  ('ENFILEIRADO', 40, false, 'AIT gravado em fila local cifrada', 'WF-TEAT-001'),
  ('TRANSMITIDO', 50, false, 'lote enviado para sincronização', 'WF-TEAT-001'),
  ('RECEBIDO', 60, false, 'backend emitiu protocolo de recebimento', 'WF-TEAT-001'),
  ('SUSPEITO_CONCORRENCIA', 70, false, 'mesmo agente em dispositivos distintos no mesmo intervalo; processamento bloqueado', 'WF-TEAT-001; REF-SENATRAN-997 Anexo II, h'),
  ('VALIDANDO', 80, false, 'conteúdo e referências normativas em validação', 'WF-TEAT-001'),
  ('ACEITO', 90, false, 'autoridade de trânsito aceitou o AIT para integração', 'WF-TEAT-001'),
  ('REJEITADO', 100, false, 'autoridade rejeitou o AIT; integração bloqueada, mas pode seguir para correção solicitada', 'WF-TEAT-001'),
  ('PENDENTE_CORRECAO', 110, false, 'correção solicitada pela retaguarda ou autoridade', 'WF-TEAT-001'),
  ('CORRIGIDO', 120, false, 'correção aprovada com justificativa', 'WF-TEAT-001'),
  ('INTEGRADO', 130, false, 'integração autorizada e evento AIT_INTEGRADO emitido', 'WF-TEAT-001; ADR-0014'),
  ('PROCESSADO', 140, false, 'processamento downstream concluído', 'WF-TEAT-001'),
  ('ARQUIVADO', 150, true, 'processamento TEAT encerrado e arquivado', 'WF-TEAT-001'),
  ('SOLICITADO_CANCEL_POSFINAL', 160, false, 'pedido formal de cancelamento pós-finalização endereçado à Diretoria de Fiscalização', 'WF-TEAT-001; UC-TEAT-011'),
  ('CANCELADO_POSFINAL', 170, true, 'cancelamento pós-finalização deferido; conteúdo legal original imutável', 'WF-TEAT-001; UC-TEAT-011')
ON CONFLICT (code) DO UPDATE SET
  sort_order = EXCLUDED.sort_order, is_terminal = EXCLUDED.is_terminal, description = EXCLUDED.description,
  legal_basis = EXCLUDED.legal_basis;

-- §1 — Estados (um por fase jurídica)
CREATE TABLE IF NOT EXISTS inf.infraction_state_ref (
  code varchar(40) PRIMARY KEY,
  sort_order smallint NOT NULL UNIQUE,
  phase text NOT NULL,
  is_terminal boolean NOT NULL DEFAULT false,
  penalty_definitive boolean NOT NULL DEFAULT false,
  legal_regime text NOT NULL,
  renainf_situacao text NOT NULL,
  legal_basis text NOT NULL
);
COMMENT ON TABLE inf.infraction_state_ref IS 'WF-INF-003 §1 — estados do ciclo de vida da infração; renainf_situacao = espelho §8 (mock, validar contra contrato real).';

INSERT INTO inf.infraction_state_ref (code, sort_order, phase, is_terminal, penalty_definitive, legal_regime, renainf_situacao, legal_basis) VALUES
  ('AIT_LAVRADO', 10, 'autuacao', false, false, 'AIT integrado; consistência sob exame; NA ainda não expedida', 'AUTUACAO_ABERTA', 'CTB art. 281; Res. CONTRAN 918/2022 art. 4º'),
  ('NOTIFICADO_AUTUACAO', 20, 'ciencia_autuacao', false, false, 'prazos de defesa e de indicação de condutor correndo; sem penalidade', 'NOTIFICADO_AUTUACAO', 'Res. 918/2022 arts. 4º §2º, 5º; CTB arts. 257 §7º, 281-A'),
  ('DEFESA_EM_JULGAMENTO', 30, 'primeiro_circuito', false, false, 'caso RAIT defesa_previa aberto; decadência estendida a 360 dias se tempestiva', 'DEFESA_APRESENTADA', 'Res. 918/2022 art. 9º; WF-RAIT-001'),
  ('PENALIDADE_A_APLICAR', 40, 'aplicacao', false, false, 'defesa indeferida, não conhecida ou ausente; autoridade deve aplicar a penalidade e expedir a NP', 'DEFESA_REJEITADA', 'CTB art. 282 caput e §6º; Res. 918/2022 art. 9º §2º'),
  ('NOTIFICADO_PENALIDADE', 50, 'ciencia_penalidade', false, false, 'prazo de recurso = vencimento; desconto de 80%; sem restrição até o vencimento', 'NOTIFICADO_PENALIDADE', 'CTB arts. 282 §§4º-5º, 284; Res. 918/2022 arts. 12-13'),
  ('RECURSO_1A_INSTANCIA', 60, 'segundo_circuito_1a', false, false, 'caso RAIT jari; efeito suspensivo desde a admissão; sem restrição nem mora', 'RECURSO_JARI_APRESENTADO', 'CTB arts. 285-287; RN-RAIT-108'),
  ('AGUARDANDO_RECURSO_2A', 70, 'intervalo_recursal', false, false, 'decisão da JARI publicada; 30 dias para recurso ao CETRAN (recorrente ou autoridade)', 'JARI_PROVIDO|JARI_NEGADO', 'CTB art. 288; Res. 918/2022 art. 17'),
  ('RECURSO_2A_INSTANCIA', 80, 'segundo_circuito_2a', false, false, 'caso RAIT cetran; efeito suspensivo mantido; decisão encerra a instância', 'SEGUNDA_INSTANCIA_APRESENTADA', 'CTB arts. 289-290; RN-RAIT-111, RN-RAIT-117'),
  ('INSTANCIA_ENCERRADA', 90, 'pos_processo', true, true, 'penalidade definitiva; pontuação no RENACH; juros; restrições admitidas', 'DECISAO_FINAL', 'CTB arts. 284 §4º, 290; Res. 918/2022 arts. 18, 22-23'),
  ('ARQUIVADO', 100, 'terminal_sem_penalidade', true, false, 'AIT arquivado por NA não expedida no prazo ou por insubsistência', 'ARQUIVADO', 'CTB art. 281 §1º I-II; Res. 918/2022 art. 4º §1º'),
  ('CANCELADO_POS_INTEGRACAO', 110, 'terminal_sem_penalidade', true, false, 'cancelamento deferido pela Diretoria de Fiscalização antes da decisão de defesa', 'ARQUIVADO', 'RN-TEAT-121 (prática local)'),
  ('AIT_CANCELADO', 120, 'terminal_sem_penalidade', true, false, 'defesa prévia acolhida; registro arquivado', 'DEFESA_ACEITA', 'Res. 918/2022 art. 9º §1º'),
  ('EXTINTO_DECADENCIA', 130, 'terminal_sem_penalidade', true, false, 'NP não expedida dentro de T-DEC; direito de aplicar a penalidade extinto', 'ARQUIVADO', 'CTB art. 282 §7º'),
  ('EXTINTO_PRESCRICAO', 140, 'terminal_sem_penalidade', true, false, 'recurso não julgado em 24 meses por instância, paralisação de 3 anos ou prescrição quinquenal', 'ARQUIVADO', 'CTB art. 289-A; Lei 9.873/1999 arts. 1º-2º'),
  ('CANCELADO_DEFINITIVO', 150, 'terminal_sem_penalidade', true, false, 'decisão final favorável ao administrado; restituição se pago', 'DECISAO_FINAL', 'CTB art. 286 §2º; CTB art. 288')
ON CONFLICT (code) DO UPDATE SET
  sort_order = EXCLUDED.sort_order, phase = EXCLUDED.phase, is_terminal = EXCLUDED.is_terminal,
  penalty_definitive = EXCLUDED.penalty_definitive, legal_regime = EXCLUDED.legal_regime,
  renainf_situacao = EXCLUDED.renainf_situacao, legal_basis = EXCLUDED.legal_basis;

-- §1/§2 — Sub-estados (regiões compostas do diagrama)
CREATE TABLE IF NOT EXISTS inf.infraction_substate_ref (
  code varchar(40) PRIMARY KEY,
  parent_state varchar(40) NOT NULL REFERENCES inf.infraction_state_ref(code),
  is_initial boolean NOT NULL DEFAULT false,
  description text NOT NULL
);
COMMENT ON TABLE inf.infraction_substate_ref IS 'WF-INF-003 §1-§2 — sub-estados; ortogonais ao estado pai, nunca substituem o estado no espelho nacional.';

INSERT INTO inf.infraction_substate_ref (code, parent_state, is_initial, description) VALUES
  ('PRAZO_DEFESA_ABERTO', 'NOTIFICADO_AUTUACAO', true, 'T-DEF e T-IND correndo contra o sujeito passivo vigente'),
  ('INDICACAO_EM_PROCESSAMENTO', 'NOTIFICADO_AUTUACAO', false, 'indicação de condutor protocolada; validação e nova NA ao condutor (T-NA-IND)'),
  ('EM_ADMISSIBILIDADE_1A', 'RECURSO_1A_INSTANCIA', true, 'caso jari em triagem; ainda sem efeito suspensivo'),
  ('EM_REMESSA_JARI', 'RECURSO_1A_INSTANCIA', false, 'admitido; efeito suspensivo instaurado; T-REM10 correndo'),
  ('EM_JULGAMENTO_JARI', 'RECURSO_1A_INSTANCIA', false, 'recebido pela JARI; T-JUL-24M e T-PAR-3A correndo'),
  ('PROVIDO_1A', 'AGUARDANDO_RECURSO_2A', false, 'JARI proveu; legitimada a autoridade (recurso vinculado)'),
  ('NEGADO_1A', 'AGUARDANDO_RECURSO_2A', false, 'JARI negou ou não conheceu; legitimado o recorrente'),
  ('EM_ADMISSIBILIDADE_2A', 'RECURSO_2A_INSTANCIA', false, 'recurso do cidadão em triagem no CETRAN-AM'),
  ('EM_JULGAMENTO_CETRAN', 'RECURSO_2A_INSTANCIA', false, 'recebido pelo CETRAN-AM; segundo T-JUL-24M'),
  ('PENDENTE_PAGAMENTO', 'INSTANCIA_ENCERRADA', true, 'penalidade definitiva sem pagamento; juros e restrições'),
  ('QUITADA', 'INSTANCIA_ENCERRADA', false, 'pagamento confirmado'),
  ('EM_COBRANCA', 'INSTANCIA_ENCERRADA', false, 'handoff à dívida ativa (fora do escopo do RAIT)')
ON CONFLICT (code) DO UPDATE SET parent_state = EXCLUDED.parent_state, is_initial = EXCLUDED.is_initial, description = EXCLUDED.description;

-- §4 — Motivos de encerramento e de arquivamento (determinam o marco dos juros)
CREATE TABLE IF NOT EXISTS inf.infraction_closure_motive_ref (
  code varchar(40) PRIMARY KEY,
  applies_to_state varchar(40) NOT NULL REFERENCES inf.infraction_state_ref(code),
  interest_mark text,
  description text NOT NULL,
  legal_basis text NOT NULL
);
COMMENT ON TABLE inf.infraction_closure_motive_ref IS 'WF-INF-003 §4 motivo_encerramento e §7 motivos de ARQUIVADO.';

INSERT INTO inf.infraction_closure_motive_ref (code, applies_to_state, interest_mark, description, legal_basis) VALUES
  ('nao_interposicao_1a', 'INSTANCIA_ENCERRADA', 'vencimento da NP', 'T-NP-VENC venceu sem recurso tempestivo', 'CTB art. 290 II'),
  ('nao_interposicao_2a', 'INSTANCIA_ENCERRADA', 'vencimento da NP', 'T-R2 venceu sem recurso após decisão negativa da JARI', 'CTB art. 290 II; art. 288'),
  ('julgamento_2a', 'INSTANCIA_ENCERRADA', 'encerramento (tempestivo)', 'penalidade mantida pelo CETRAN-AM ou recurso da autoridade provido', 'CTB art. 290 I'),
  ('reconhecimento', 'INSTANCIA_ENCERRADA', 'sem juros', 'pagamento com reconhecimento (SNE 60%) e requerimento de encerramento', 'CTB arts. 284 §1º, 290 III'),
  ('desistencia', 'INSTANCIA_ENCERRADA', 'vencimento da NP', 'desistência do recurso com o prazo já vencido — não encerra por si', 'RN-RAIT-123; Res. 900/2022 art. 11'),
  ('nao_conhecimento_intempestivo', 'INSTANCIA_ENCERRADA', 'vencimento da NP', 'recurso não conhecido por intempestividade com T-NP-VENC vencido', 'CTB art. 285 §5º; CTB art. 290 II'),
  ('na_nao_expedida', 'ARQUIVADO', NULL, 'NA não expedida dentro de T-NA', 'CTB art. 281 §1º II; Res. 918/2022 art. 4º §1º'),
  ('insubsistente', 'ARQUIVADO', NULL, 'AIT inconsistente ou irregular julgado pela autoridade', 'CTB art. 281 §1º I')
ON CONFLICT (code) DO UPDATE SET applies_to_state = EXCLUDED.applies_to_state, interest_mark = EXCLUDED.interest_mark, description = EXCLUDED.description, legal_basis = EXCLUDED.legal_basis;

-- §4 — Sujeito passivo, faixa de pagamento e canal de ciência
CREATE TABLE IF NOT EXISTS inf.infraction_subject_kind_ref (
  code varchar(40) PRIMARY KEY,
  description text NOT NULL,
  legal_basis text NOT NULL
);
INSERT INTO inf.infraction_subject_kind_ref (code, description, legal_basis) VALUES
  ('proprietario', 'proprietário do veículo (PF/PJ)', 'CTB art. 257 §7º; Res. 918/2022 art. 5º'),
  ('principal_condutor', 'principal condutor cadastrado', 'CTB art. 257 §7º'),
  ('condutor_identificado', 'condutor identificado no ato ou por indicação válida', 'CTB art. 257 §3º; Res. 918/2022 arts. 5º-8º'),
  ('possuidor_equiparado', 'possuidor equiparado ao proprietário', 'Res. 900/2022 art. 2º'),
  ('embarcador', 'embarcador responsável pela infração', 'CTB art. 257 §4º; Res. 900/2022 art. 2º III'),
  ('transportador', 'transportador responsável pela infração', 'CTB art. 257 §5º; Res. 900/2022 art. 2º IV')
ON CONFLICT (code) DO UPDATE SET description = EXCLUDED.description, legal_basis = EXCLUDED.legal_basis;

CREATE TABLE IF NOT EXISTS inf.infraction_payment_tier_ref (
  code varchar(40) PRIMARY KEY,
  percent_of_fine numeric(5,2),
  description text NOT NULL,
  legal_basis text NOT NULL
);
INSERT INTO inf.infraction_payment_tier_ref (code, percent_of_fine, description, legal_basis) VALUES
  ('nenhum', NULL, 'sem pagamento', 'CTB art. 284'),
  ('desconto_80', 80.00, 'pagamento até o vencimento da NP sem reconhecimento; não renuncia ao recurso', 'CTB art. 284 §§1º-2º'),
  ('desconto_60_reconhecimento', 60.00, 'pagamento pelo SNE com reconhecimento da infração; renuncia ao recurso', 'CTB art. 284 §1º; CTB art. 290 III'),
  ('desconto_40_fora_sne', 40.00, 'desconto sem adesão do órgão ao SNE (parâmetro; conflito RN-RAIT-127)', 'Lei 14.599/2023; Res. 918/2022 art. 21'),
  ('integral_juros', 100.00, 'após o vencimento: valor integral com juros e correção', 'Res. 918/2022 art. 23 §§4º-5º'),
  ('restituido', NULL, 'valor restituído após CANCELADO_DEFINITIVO ou extinção com pagamento', 'CTB art. 286 §2º; RN-RAIT-129')
ON CONFLICT (code) DO UPDATE SET percent_of_fine = EXCLUDED.percent_of_fine, description = EXCLUDED.description, legal_basis = EXCLUDED.legal_basis;

CREATE TABLE IF NOT EXISTS inf.notification_channel_ref (
  code varchar(20) PRIMARY KEY,
  ciencia_rule text NOT NULL,
  legal_basis text NOT NULL
);
COMMENT ON TABLE inf.notification_channel_ref IS 'RN-RAIT-104 — marco de ciência por canal; os mesmos códigos do check de inf.rait_communication.channel.';
INSERT INTO inf.notification_channel_ref (code, ciencia_rule, legal_basis) VALUES
  ('sne', 'ciência na leitura ou ficta em 30 dias da disponibilização (T-SNE-CIENCIA)', 'CTB art. 282-A §2º; Res. 931/2022 art. 4º §6º'),
  ('postal', 'expedição (data de postagem); prazo impresso ≥ 30 dias da expedição', 'CTB art. 282 §1º; Res. 918/2022 art. 4º'),
  ('pessoal', 'entrega pessoal com assinatura; AIT assinado vale como NA', 'Res. 918/2022 art. 3º §5º'),
  ('edital', 'publicação do edital', 'CTB art. 282 §1º; Res. 918/2022 art. 4º §3º'),
  ('portal', 'disponibilização no Portal público (não substitui SNE/postal para o prazo legal)', 'WF-PORTAL-001'),
  ('balcao', 'ciência presencial no balcão com registro', 'Res. 900/2022 art. 6º')
ON CONFLICT (code) DO UPDATE SET ciencia_rule = EXCLUDED.ciencia_rule, legal_basis = EXCLUDED.legal_basis;

-- WF-INF-002 §9 — Catálogo unificado de timers
CREATE TABLE IF NOT EXISTS inf.infraction_timer_ref (
  code varchar(20) PRIMARY KEY,
  owner varchar(20) NOT NULL CHECK (owner IN ('infracao', 'caso', 'sessao', 'indicador', 'medida')),
  duration_value integer,
  duration_unit varchar(20) NOT NULL CHECK (duration_unit IN ('dias_corridos', 'dias_uteis', 'meses', 'anos', 'data_impressa', 'meta')),
  start_mark text NOT NULL,
  armed_in text NOT NULL,
  expiry_kind varchar(20) NOT NULL CHECK (expiry_kind IN ('transicao', 'alerta', 'marco', 'regra', 'guarda', 'indicador')),
  expiry_target varchar(40) REFERENCES inf.infraction_state_ref(code),
  alert_ladder text,
  status varchar(20) NOT NULL CHECK (status IN ('vigente', 'a_confirmar', 'proposta')),
  legal_basis text NOT NULL
);
COMMENT ON TABLE inf.infraction_timer_ref IS 'WF-INF-002 §9.2 — timers automáticos; contagem em dias corridos salvo T-DIL/T-CONV (dias úteis); vencimento em dia não útil prorroga (RN-RAIT-005).';

INSERT INTO inf.infraction_timer_ref (code, owner, duration_value, duration_unit, start_mark, armed_in, expiry_kind, expiry_target, alert_ladder, status, legal_basis) VALUES
  ('T-NA', 'infracao', 30, 'dias_corridos', 'cometimento (não flagrante: conhecimento pelo órgão — contagem pendente)', 'AIT_LAVRADO', 'transicao', 'ARQUIVADO', NULL, 'vigente', 'Res. 918/2022 art. 4º §1º; CTB art. 281 §1º II'),
  ('T-SNE-CIENCIA', 'infracao', 30, 'dias_corridos', 'disponibilização no SNE + envio da mensagem', 'qualquer notificação por SNE', 'marco', NULL, NULL, 'vigente', 'CTB art. 282-A §2º; Res. 931/2022 art. 4º §6º'),
  ('T-DEF', 'infracao', NULL, 'data_impressa', 'expedição da NA / ciência conforme canal (piso 30 dias)', 'NOTIFICADO_AUTUACAO', 'transicao', 'PENALIDADE_A_APLICAR', NULL, 'vigente', 'Res. 918/2022 art. 4º §2º; CTB art. 281-A; RN-RAIT-101'),
  ('T-IND', 'infracao', 30, 'dias_corridos', 'notificação da autuação', 'NOTIFICADO_AUTUACAO', 'regra', NULL, NULL, 'vigente', 'CTB art. 257 §§7º-8º'),
  ('T-NA-IND', 'infracao', 30, 'dias_corridos', 'protocolo da indicação de condutor', 'INDICACAO_EM_PROCESSAMENTO', 'transicao', 'ARQUIVADO', NULL, 'a_confirmar', 'Res. 918/2022 art. 5º §3º'),
  ('T-DEC', 'infracao', 180, 'dias_corridos', 'cometimento; 360 dias se defesa tempestiva', 'AIT_LAVRADO … PENALIDADE_A_APLICAR', 'transicao', 'EXTINTO_DECADENCIA', NULL, 'vigente', 'CTB art. 282 §§6º-7º; Res. 918/2022 art. 9º §§2º-3º; RN-RAIT-114'),
  ('T-NP-VENC', 'infracao', NULL, 'data_impressa', 'notificação da penalidade (ciência conforme canal; piso 30 dias)', 'NOTIFICADO_PENALIDADE', 'transicao', 'INSTANCIA_ENCERRADA', NULL, 'vigente', 'CTB art. 282 §§4º-5º e 290 II; Res. 918/2022 art. 12 IV'),
  ('T-REM10', 'infracao', 10, 'dias_corridos', 'interposição do recurso à JARI', 'EM_REMESSA_JARI', 'alerta', NULL, NULL, 'vigente', 'CTB art. 285 §2º; RN-RAIT-107'),
  ('T-JUL-24M', 'infracao', 24, 'meses', 'recebimento do recurso pelo órgão julgador (um relógio por instância)', 'EM_JULGAMENTO_JARI; EM_JULGAMENTO_CETRAN', 'transicao', 'EXTINTO_PRESCRICAO', '12/18/21/23 meses (WF-RAIT-002 §4.1)', 'vigente', 'CTB arts. 285 §6º, 289, 289-A; RN-RAIT-110…112'),
  ('T-DIL', 'caso', 15, 'dias_uteis', 'abertura da diligência (prorrogável uma vez)', 'caso RAIT em DILIGENCIA', 'transicao', NULL, NULL, 'vigente', 'Res. 900/2022 art. 9º p.ú.; RN-RAIT-004'),
  ('T-R2', 'infracao', 30, 'dias_corridos', 'publicação da decisão da JARI (Owner C.24)', 'AGUARDANDO_RECURSO_2A', 'transicao', NULL, NULL, 'vigente', 'CTB art. 288; RN-RAIT-103, RN-RAIT-130'),
  ('T-PAR-3A', 'infracao', 3, 'anos', 'último ato registrado (reinicia a cada movimentação)', 'qualquer estado pendente de julgamento', 'transicao', 'EXTINTO_PRESCRICAO', NULL, 'a_confirmar', 'Lei 9.873/1999 art. 1º §1º; RN-RAIT-113'),
  ('T-PRESC-5A', 'infracao', 5, 'anos', 'prática do ato; interrompido só pelas hipóteses do art. 2º da Lei 9.873 (sem auto-reset na NP)', 'todo o ciclo até o encerramento', 'transicao', 'EXTINTO_PRESCRICAO', '30/45/54/60 meses', 'a_confirmar', 'Lei 9.873/1999 arts. 1º-2º; Res. 918/2022 art. 36; RN-RAIT-113'),
  ('T-REG30', 'medida', 30, 'dias_corridos', 'recibo entregue na retenção com CLA recolhido', 'LIBERADO_COM_PRAZO (CTB art. 270 §2º)', 'regra', NULL, NULL, 'vigente', 'WF-TEAT-004; CTB art. 270 §§2º, 6º-7º; RN-TEAT-124'),
  ('T-REG15', 'medida', 15, 'dias_corridos', 'recibo entregue na liberação do CTB art. 271 §9º-A', 'LIBERADO_COM_PRAZO (CTB art. 271 §9º-A)', 'regra', NULL, NULL, 'vigente', 'WF-TEAT-004; CTB art. 271 §§9º-A, 9º-C-9º-D; RN-TEAT-125'),
  ('T-NOTIF10', 'medida', 10, 'dias_corridos', 'remoção efetivada sem proprietário ou condutor presente', 'EM_DEPOSITO', 'regra', NULL, NULL, 'vigente', 'WF-TEAT-004; CTB art. 271 §6º; Res. CONTRAN 1.025/2026 art. 15'),
  ('T-DEPOSITO6M', 'medida', 6, 'meses', 'entrada no centro de custódia', 'EM_DEPOSITO', 'marco', NULL, NULL, 'vigente', 'WF-TEAT-004; CTB art. 271 §10; Res. CONTRAN 1.025/2026 art. 21 §2º; RN-TEAT-128'),
  ('T-CNH5D', 'medida', 5, 'dias_corridos', 'recolhimento de CNH por alcoolemia', 'recolhimento de CNH em procedimento de alcoolemia', 'regra', NULL, NULL, 'vigente', 'WF-TEAT-004; WF-TEAT-005; Res. CONTRAN 432/2013 art. 10 §1º'),
  ('T-SNE2027', 'medida', NULL, 'meta', 'marco fixo de 01/01/2027', 'notificação de remoção', 'marco', NULL, NULL, 'vigente', 'WF-TEAT-004; Res. CONTRAN 1.025/2026 art. 15 §3º'),
  ('T-VOTO', 'caso', 20, 'dias_corridos', 'distribuição ao relator (aceite do lote)', 'caso RAIT em EM_INSTRUCAO (2º circuito)', 'alerta', NULL, NULL, 'proposta', 'WF-RAIT-003 (pendente regimento)'),
  ('T-CONV', 'sessao', 5, 'dias_uteis', 'fechamento da pauta', 'sessão em PAUTA_FECHADA', 'guarda', NULL, NULL, 'proposta', 'WF-RAIT-003 (pendente regimento)'),
  ('T-ASS', 'caso', 5, 'dias_uteis', 'minuta enviada para assinatura', 'caso RAIT em PRONTO_P_DECISAO (1º circuito)', 'alerta', NULL, NULL, 'proposta', 'WF-RAIT-004 §2 (meta operacional)'),
  ('T-CLAIM', 'caso', 2, 'dias_uteis', 'homologação do lote de sorteio', 'lote LOTE_SORTEADO', 'regra', NULL, NULL, 'proposta', 'WF-RAIT-004 §5'),
  ('SLA-30', 'indicador', 30, 'meta', 'protocolo (defesa) / entrada na JARI (dias úteis)', '1º e 2º circuitos', 'indicador', NULL, NULL, 'vigente', 'REF-DETRANAM-SERVICOS; WF-RAIT-002 §4.4')
ON CONFLICT (code) DO UPDATE SET owner = EXCLUDED.owner, duration_value = EXCLUDED.duration_value, duration_unit = EXCLUDED.duration_unit,
  start_mark = EXCLUDED.start_mark, armed_in = EXCLUDED.armed_in, expiry_kind = EXCLUDED.expiry_kind, expiry_target = EXCLUDED.expiry_target,
  alert_ladder = EXCLUDED.alert_ladder, status = EXCLUDED.status, legal_basis = EXCLUDED.legal_basis;

-- §6 — Eventos consumidos e publicados pelo agregado
CREATE TABLE IF NOT EXISTS inf.infraction_event_ref (
  code varchar(60) PRIMARY KEY,
  direction varchar(10) NOT NULL CHECK (direction IN ('consumido', 'publicado')),
  producer varchar(30) NOT NULL,
  consumers text NOT NULL,
  description text NOT NULL
);
INSERT INTO inf.infraction_event_ref (code, direction, producer, consumers, description) VALUES
  ('AIT_INTEGRADO', 'consumido', 'teat', 'infracao', 'AIT aceito e integrado (WF-TEAT-001) — cria a infração'),
  ('AIT_CANCELADO_POSFINAL', 'consumido', 'teat', 'infracao', 'Diretoria de Fiscalização defere cancelamento pós-integração'),
  ('NOTIFICACAO_EXPEDIDA', 'consumido', 'notificacao', 'infracao', 'NA, NP ou decisão expedida (canal, data de expedição, data-limite impressa)'),
  ('NOTIFICACAO_CIENCIA', 'consumido', 'notificacao', 'infracao', 'ciência efetiva ou ficta registrada por canal'),
  ('CONDUTOR_INDICADO', 'consumido', 'portal', 'infracao', 'indicação de condutor protocolada'),
  ('RAIT_CASO_PROTOCOLADO', 'consumido', 'rait', 'infracao', 'caso RAIT criado (instância defesa_previa | jari | cetran)'),
  ('RAIT_EFEITO_SUSPENSIVO_INSTAURADO', 'consumido', 'rait', 'infracao', 'recurso admitido tempestivo'),
  ('RAIT_RECURSO_RECEBIDO_JULGADOR', 'consumido', 'rait', 'infracao', 'recebimento pela JARI ou pelo CETRAN-AM — arma T-JUL-24M'),
  ('RAIT_DECISAO_PUBLICADA', 'consumido', 'rait', 'infracao', 'decisão comunicada/publicada (acolhida | indeferida | provido | negado | nao_conhecido)'),
  ('RAIT_CASO_TRANSITADO', 'consumido', 'rait', 'infracao', 'trânsito em julgado administrativo'),
  ('ENCERRADO_DESISTENCIA', 'consumido', 'rait', 'infracao', 'desistência homologada'),
  ('PAGAMENTO_CONFIRMADO', 'consumido', 'arrecadacao', 'infracao', 'pagamento conciliado (faixa)'),
  ('INFRACAO_ESTADO_ALTERADO', 'publicado', 'infracao', 'portal, dashboard, senatran-adapter', 'sempre, a cada transição'),
  ('PENALIDADE_DEFINITIVA', 'publicado', 'infracao', 'senatran-adapter (RENACH)', 'entrada em INSTANCIA_ENCERRADA'),
  ('RESTITUICAO_DEVIDA', 'publicado', 'infracao', 'arrecadacao', 'CANCELADO_DEFINITIVO ou extinção com pago=true'),
  ('TIMER_VENCIDO', 'publicado', 'infracao', 'auditoria', 'toda transição por timer, idempotente'),
  ('RISCO_PRESCRICAO_ALTERADO', 'publicado', 'infracao', 'dashboard', 'espelha RAIT_ALERTA_PRESCRICAO')
ON CONFLICT (code) DO UPDATE SET direction = EXCLUDED.direction, producer = EXCLUDED.producer, consumers = EXCLUDED.consumers, description = EXCLUDED.description;

-- §2 — Tabela de transições (guardas e efeitos), normalizada uma linha por par de estados e gatilho
CREATE TABLE IF NOT EXISTS inf.infraction_transition_ref (
  id smallint PRIMARY KEY,
  rule_ref smallint NOT NULL,
  from_state varchar(40) REFERENCES inf.infraction_state_ref(code),
  from_substate varchar(40) REFERENCES inf.infraction_substate_ref(code),
  to_state varchar(40) NOT NULL REFERENCES inf.infraction_state_ref(code),
  to_substate varchar(40) REFERENCES inf.infraction_substate_ref(code),
  trigger_kind varchar(10) NOT NULL CHECK (trigger_kind IN ('evento', 'timer', 'ato', 'sistema')),
  trigger_code varchar(120) NOT NULL,
  guard text NOT NULL,
  effects text NOT NULL,
  status varchar(20) NOT NULL CHECK (status IN ('vigente', 'a_confirmar', 'nao_modelada')),
  legal_basis text NOT NULL
);
COMMENT ON TABLE inf.infraction_transition_ref IS 'WF-INF-003 §2 — rule_ref = número da linha na tabela de transições do artefato.';

INSERT INTO inf.infraction_transition_ref (id, rule_ref, from_state, from_substate, to_state, to_substate, trigger_kind, trigger_code, guard, effects, status, legal_basis) VALUES
  (1, 1, NULL, NULL, 'AIT_LAVRADO', NULL, 'evento', 'AIT_INTEGRADO', 'AIT em INTEGRADO no TEAT', 'arma T-NA, T-DEC(180), T-PRESC-5A; registra flagrante e data de conhecimento', 'vigente', 'CTB art. 281'),
  (2, 2, 'AIT_LAVRADO', NULL, 'ARQUIVADO', NULL, 'ato', 'AUTORIDADE_JULGA_INSUBSISTENTE', 'inconsistência/irregularidade motivada', 'motivo=insubsistente; cancela timers', 'vigente', 'CTB art. 281 §1º I'),
  (3, 3, 'AIT_LAVRADO', NULL, 'ARQUIVADO', NULL, 'timer', 'T-NA', 'nenhuma NA expedida', 'motivo=na_nao_expedida; automático', 'vigente', 'Res. 918/2022 art. 4º §1º'),
  (4, 4, 'AIT_LAVRADO', NULL, 'NOTIFICADO_AUTUACAO', 'PRAZO_DEFESA_ABERTO', 'evento', 'NOTIFICACAO_EXPEDIDA(NA)', 'dentro de T-NA; data-limite impressa presente e ≥ 30 dias (AIT≡NA sem data-limite não faz correr prazo)', 'cancela T-NA; arma T-DEF (data impressa), T-IND; SNE: T-SNE-CIENCIA', 'vigente', 'Res. 918/2022 arts. 3º §5º, 4º'),
  (5, 5, 'NOTIFICADO_AUTUACAO', 'PRAZO_DEFESA_ABERTO', 'NOTIFICADO_AUTUACAO', 'INDICACAO_EM_PROCESSAMENTO', 'evento', 'CONDUTOR_INDICADO', 'dentro de T-IND; assinaturas de ambos', 'valida; registra no RENACH; nova NA ao condutor com T-NA-IND; novo T-DEF', 'vigente', 'Res. 918/2022 art. 5º'),
  (6, 5, 'NOTIFICADO_AUTUACAO', 'INDICACAO_EM_PROCESSAMENTO', 'NOTIFICADO_AUTUACAO', 'PRAZO_DEFESA_ABERTO', 'sistema', 'INDICACAO_VALIDADA', 'indicação válida ou irregular (art. 6º)', 'válida: sujeito=condutor, NA ao condutor, novo T-DEF; irregular: sujeito mantido', 'vigente', 'Res. 918/2022 arts. 5º-6º'),
  (7, 6, 'NOTIFICADO_AUTUACAO', NULL, 'DEFESA_EM_JULGAMENTO', NULL, 'evento', 'RAIT_CASO_PROTOCOLADO(defesa_previa)', 'marco de tempestividade ≤ T-DEF', 'se admitida como tempestiva: T-DEC → 360 dias', 'vigente', 'Res. 918/2022 art. 9º'),
  (8, 7, 'NOTIFICADO_AUTUACAO', NULL, 'PENALIDADE_A_APLICAR', NULL, 'timer', 'T-DEF', 'nenhuma defesa tempestiva protocolada', 'PJ sem indicação: gera novo AIT dobrado (evento)', 'vigente', 'Res. 918/2022 art. 9º §2º; CTB art. 257 §8º'),
  (9, 8, 'DEFESA_EM_JULGAMENTO', NULL, 'AIT_CANCELADO', NULL, 'evento', 'RAIT_DECISAO_PUBLICADA(acolhida)', '—', 'arquiva registro; comunica proprietário; cancela T-DEC', 'vigente', 'Res. 918/2022 art. 9º §1º'),
  (10, 9, 'DEFESA_EM_JULGAMENTO', NULL, 'PENALIDADE_A_APLICAR', NULL, 'evento', 'RAIT_DECISAO_PUBLICADA(indeferida|nao_conhecido) | ENCERRADO_DESISTENCIA', '—', '—', 'vigente', 'Res. 918/2022 art. 9º §2º; Res. 900/2022 art. 11'),
  (11, 10, 'DEFESA_EM_JULGAMENTO', NULL, 'EXTINTO_DECADENCIA', NULL, 'timer', 'T-DEC', 'NP não expedida', 'extingue o direito de aplicar a penalidade; bloqueia refazimento de NP', 'vigente', 'CTB art. 282 §7º'),
  (12, 10, 'PENALIDADE_A_APLICAR', NULL, 'EXTINTO_DECADENCIA', NULL, 'timer', 'T-DEC', 'NP não expedida', 'idem', 'vigente', 'CTB art. 282 §7º'),
  (13, 11, 'PENALIDADE_A_APLICAR', NULL, 'NOTIFICADO_PENALIDADE', NULL, 'evento', 'NOTIFICACAO_EXPEDIDA(NP)', 'dentro de T-DEC; NP com conteúdo do art. 12', 'cancela T-DEC; arma T-NP-VENC (data impressa ≥ 30 dias da ciência)', 'vigente', 'CTB art. 282; Res. 918/2022 art. 12'),
  (14, 12, 'PENALIDADE_A_APLICAR', NULL, 'INSTANCIA_ENCERRADA', 'QUITADA', 'evento', 'NOTIFICACAO_EXPEDIDA(NP, reconhecimento=true)', 'pagamento de 60% pelo SNE já confirmado', 'motivo=reconhecimento; NP sem código de barras', 'vigente', 'CTB arts. 284 §1º, 290 III'),
  (15, 13, 'NOTIFICADO_PENALIDADE', NULL, 'NOTIFICADO_PENALIDADE', NULL, 'evento', 'PAGAMENTO_CONFIRMADO', 'sem reconhecimento', 'pago=true; não encerra; restituição garantida se provido depois', 'vigente', 'CTB art. 284 §2º'),
  (16, 14, 'NOTIFICADO_PENALIDADE', NULL, 'RECURSO_1A_INSTANCIA', 'EM_ADMISSIBILIDADE_1A', 'evento', 'RAIT_CASO_PROTOCOLADO(jari)', 'marco de tempestividade ≤ T-NP-VENC; não é advertência do art. 11 §2º', 'pausa a consequência de T-NP-VENC (vencimento continua marcando o fim do desconto)', 'vigente', 'CTB art. 285'),
  (17, 15, 'NOTIFICADO_PENALIDADE', NULL, 'INSTANCIA_ENCERRADA', 'PENDENTE_PAGAMENTO', 'timer', 'T-NP-VENC', 'nenhum recurso tempestivo', 'motivo=nao_interposicao_1a', 'vigente', 'CTB art. 290 II'),
  (18, 16, 'NOTIFICADO_PENALIDADE', NULL, 'INSTANCIA_ENCERRADA', 'QUITADA', 'evento', 'PAGAMENTO_CONFIRMADO(reconhecimento) + REQUERIMENTO_ENCERRAMENTO', '—', 'motivo=reconhecimento', 'vigente', 'CTB art. 290 III'),
  (19, 17, 'RECURSO_1A_INSTANCIA', 'EM_ADMISSIBILIDADE_1A', 'RECURSO_1A_INSTANCIA', 'EM_REMESSA_JARI', 'evento', 'RAIT_EFEITO_SUSPENSIVO_INSTAURADO', 'caso ADMITIDO', 'efeito_suspensivo=true; arma T-REM10; bloqueia restrições e mora', 'vigente', 'CTB art. 285 caput e §1º; RN-RAIT-108'),
  (20, 18, 'RECURSO_1A_INSTANCIA', 'EM_REMESSA_JARI', 'RECURSO_1A_INSTANCIA', 'EM_JULGAMENTO_JARI', 'evento', 'RAIT_RECURSO_RECEBIDO_JULGADOR', '—', 'cancela T-REM10; arma T-JUL-24M (JARI), T-PAR-3A', 'vigente', 'CTB art. 285 §§2º, 6º'),
  (21, 19, 'RECURSO_1A_INSTANCIA', NULL, 'NOTIFICADO_PENALIDADE', NULL, 'evento', 'RAIT_DECISAO_PUBLICADA(nao_conhecido) na triagem', 'T-NP-VENC ainda aberto', 'sem efeito suspensivo; pode recorrer de novo', 'vigente', 'CTB art. 285 §5º'),
  (22, 19, 'RECURSO_1A_INSTANCIA', NULL, 'INSTANCIA_ENCERRADA', 'PENDENTE_PAGAMENTO', 'evento', 'RAIT_DECISAO_PUBLICADA(nao_conhecido) na triagem', 'T-NP-VENC vencido', 'intempestivo: arquivado=true, juros desde o vencimento; motivo=nao_conhecimento_intempestivo', 'vigente', 'CTB arts. 285 §5º, 290 II'),
  (23, 20, 'RECURSO_1A_INSTANCIA', NULL, 'NOTIFICADO_PENALIDADE', NULL, 'evento', 'ENCERRADO_DESISTENCIA', 'antes do julgamento; T-NP-VENC aberto', 'efeito_suspensivo=false', 'vigente', 'RN-RAIT-123'),
  (24, 20, 'RECURSO_1A_INSTANCIA', NULL, 'INSTANCIA_ENCERRADA', 'PENDENTE_PAGAMENTO', 'evento', 'ENCERRADO_DESISTENCIA', 'antes do julgamento; T-NP-VENC vencido', 'efeito_suspensivo=false; motivo=desistencia — a desistência não encerra por si, encerra o decurso do prazo', 'vigente', 'RN-RAIT-123; CTB art. 290 II'),
  (25, 21, 'RECURSO_1A_INSTANCIA', NULL, 'AGUARDANDO_RECURSO_2A', NULL, 'evento', 'RAIT_DECISAO_PUBLICADA (JARI)', 'caso em COMUNICADO', 'cancela T-JUL-24M; arma T-R2; sub-estado PROVIDO_1A | NEGADO_1A conforme resultado', 'vigente', 'CTB art. 288'),
  (26, 22, 'RECURSO_1A_INSTANCIA', NULL, 'EXTINTO_PRESCRICAO', NULL, 'timer', 'T-JUL-24M', 'recurso não julgado', 'extingue a pretensão punitiva; incidente PRESCRITO_OPERACIONAL', 'vigente', 'CTB art. 289-A'),
  (27, 22, 'RECURSO_1A_INSTANCIA', NULL, 'EXTINTO_PRESCRICAO', NULL, 'timer', 'T-PAR-3A', 'recurso não julgado; 3 anos sem movimentação', 'idem', 'a_confirmar', 'Lei 9.873/1999 art. 1º §1º'),
  (28, 23, 'AGUARDANDO_RECURSO_2A', 'PROVIDO_1A', 'RECURSO_2A_INSTANCIA', 'EM_JULGAMENTO_CETRAN', 'ato', 'RECURSO_AUTORIDADE', '≤ T-R2 contado da publicação; sem contrarrazões (DT-010)', 'novo caso cetran nasce ADMITIDO, sem triagem cidadã', 'vigente', 'CTB art. 288 §1º; RN-RAIT-130'),
  (29, 24, 'AGUARDANDO_RECURSO_2A', 'PROVIDO_1A', 'CANCELADO_DEFINITIVO', NULL, 'timer', 'T-R2', 'sem recurso da autoridade (ou declaração de não recorrer)', 'efeito_suspensivo=false; se pago=true → RESTITUICAO_DEVIDA', 'vigente', 'CTB arts. 286 §2º, 288'),
  (30, 25, 'AGUARDANDO_RECURSO_2A', 'NEGADO_1A', 'RECURSO_2A_INSTANCIA', 'EM_ADMISSIBILIDADE_2A', 'evento', 'RAIT_CASO_PROTOCOLADO(cetran)', 'marco de tempestividade ≤ T-R2', 'triagem completa; parecer da JARI anexado de ofício', 'vigente', 'CTB art. 288 caput'),
  (31, 26, 'AGUARDANDO_RECURSO_2A', 'NEGADO_1A', 'INSTANCIA_ENCERRADA', 'PENDENTE_PAGAMENTO', 'timer', 'T-R2', 'sem recurso', 'motivo=nao_interposicao_2a', 'vigente', 'CTB art. 290 II'),
  (32, 18, 'RECURSO_2A_INSTANCIA', 'EM_ADMISSIBILIDADE_2A', 'RECURSO_2A_INSTANCIA', 'EM_JULGAMENTO_CETRAN', 'evento', 'RAIT_RECURSO_RECEBIDO_JULGADOR', 'caso ADMITIDO', 'arma T-JUL-24M (CETRAN), T-PAR-3A', 'vigente', 'CTB art. 289; RN-RAIT-111'),
  (33, 27, 'RECURSO_2A_INSTANCIA', NULL, 'INSTANCIA_ENCERRADA', 'PENDENTE_PAGAMENTO', 'evento', 'RAIT_CASO_TRANSITADO (penalidade mantida)', 'negado/não conhecido o do cidadão, ou provido o da autoridade', 'motivo=julgamento_2a', 'vigente', 'CTB art. 290 I'),
  (34, 27, 'RECURSO_2A_INSTANCIA', NULL, 'AGUARDANDO_RECURSO_2A', 'NEGADO_1A', 'evento', 'RAIT_DECISAO_PUBLICADA(nao_conhecido) | ENCERRADO_DESISTENCIA', 'T-R2 ainda aberto', 'volta ao intervalo recursal', 'vigente', 'CTB art. 288'),
  (35, 27, 'RECURSO_2A_INSTANCIA', NULL, 'INSTANCIA_ENCERRADA', 'PENDENTE_PAGAMENTO', 'evento', 'RAIT_DECISAO_PUBLICADA(nao_conhecido) | ENCERRADO_DESISTENCIA', 'T-R2 vencido', 'motivo=nao_interposicao_2a ou desistencia', 'vigente', 'CTB art. 290 II'),
  (36, 28, 'RECURSO_2A_INSTANCIA', NULL, 'CANCELADO_DEFINITIVO', NULL, 'evento', 'RAIT_CASO_TRANSITADO (favorável)', 'provido o do cidadão, ou negado o da autoridade', 'restituição se pago', 'vigente', 'CTB art. 286 §2º'),
  (37, 22, 'RECURSO_2A_INSTANCIA', NULL, 'EXTINTO_PRESCRICAO', NULL, 'timer', 'T-JUL-24M', 'recurso não julgado', 'extingue a pretensão punitiva; incidente', 'vigente', 'CTB art. 289-A'),
  (38, 22, 'RECURSO_2A_INSTANCIA', NULL, 'EXTINTO_PRESCRICAO', NULL, 'timer', 'T-PAR-3A', 'recurso não julgado; 3 anos sem movimentação', 'idem', 'a_confirmar', 'Lei 9.873/1999 art. 1º §1º'),
  (39, 29, 'INSTANCIA_ENCERRADA', 'PENDENTE_PAGAMENTO', 'INSTANCIA_ENCERRADA', 'QUITADA', 'evento', 'PAGAMENTO_CONFIRMADO', '—', 'entrada: PENALIDADE_DEFINITIVA → RENACH; juros desde o encerramento (tempestivo) ou o vencimento (intempestivo); restrições liberadas', 'vigente', 'CTB art. 290; Res. 918/2022 arts. 18, 23'),
  (40, 29, 'INSTANCIA_ENCERRADA', 'PENDENTE_PAGAMENTO', 'INSTANCIA_ENCERRADA', 'EM_COBRANCA', 'sistema', 'HANDOFF_DIVIDA_ATIVA', 'fora do escopo do RAIT', '—', 'vigente', 'UC-RAIT-034'),
  (41, 30, 'INSTANCIA_ENCERRADA', NULL, 'INSTANCIA_ENCERRADA', NULL, 'ato', 'REVISAO_POS_ENCERRAMENTO', 'Decisão do Owner C.22: não há canal de revisão pós-encerramento', 'registrada apenas para memória (Lei 9.784/1999 art. 65)', 'nao_modelada', 'Owner C.22'),
  (42, 31, 'AIT_LAVRADO', NULL, 'CANCELADO_POS_INTEGRACAO', NULL, 'evento', 'AIT_CANCELADO_POSFINAL', 'antes do encerramento definitivo e da decisão de defesa', 'cancela todos os timers; conteúdo do AIT imutável', 'vigente', 'RN-TEAT-121'),
  (43, 31, 'NOTIFICADO_AUTUACAO', NULL, 'CANCELADO_POS_INTEGRACAO', NULL, 'evento', 'AIT_CANCELADO_POSFINAL', 'idem', 'idem', 'vigente', 'RN-TEAT-121'),
  (44, 31, 'DEFESA_EM_JULGAMENTO', NULL, 'CANCELADO_POS_INTEGRACAO', NULL, 'evento', 'AIT_CANCELADO_POSFINAL', 'antes da decisão de defesa', 'idem', 'vigente', 'RN-TEAT-121'),
  (45, 31, 'PENALIDADE_A_APLICAR', NULL, 'CANCELADO_POS_INTEGRACAO', NULL, 'evento', 'AIT_CANCELADO_POSFINAL', 'idem', 'idem', 'vigente', 'RN-TEAT-121'),
  (46, 31, 'NOTIFICADO_PENALIDADE', NULL, 'CANCELADO_POS_INTEGRACAO', NULL, 'evento', 'AIT_CANCELADO_POSFINAL', 'idem (invariante §5.6)', 'idem', 'vigente', 'RN-TEAT-121')
ON CONFLICT (id) DO UPDATE SET rule_ref = EXCLUDED.rule_ref, from_state = EXCLUDED.from_state, from_substate = EXCLUDED.from_substate,
  to_state = EXCLUDED.to_state, to_substate = EXCLUDED.to_substate, trigger_kind = EXCLUDED.trigger_kind, trigger_code = EXCLUDED.trigger_code,
  guard = EXCLUDED.guard, effects = EXCLUDED.effects, status = EXCLUDED.status, legal_basis = EXCLUDED.legal_basis;

GRANT USAGE ON SCHEMA inf TO role_app_backend;
GRANT SELECT ON inf.infraction_state_ref, inf.infraction_substate_ref, inf.infraction_closure_motive_ref,
  inf.infraction_subject_kind_ref, inf.infraction_payment_tier_ref, inf.notification_channel_ref,
  inf.infraction_timer_ref, inf.infraction_event_ref, inf.infraction_transition_ref
  TO role_app_backend, role_auditor_min;
