-- Vocabulário do DASHBOARD para o estado próprio de BP-DASH-MONITOR-001
-- (WF-DASH-001 ciclo do alerta, WF-DASH-002 calendário de deveres periódicos,
-- WF-DASH-003 frescor; RN-DASH-142 classificação; RN-DASH-170 camadas;
-- dashboard-route-contract.md §2/§3; parameter-catalogue.md §DASHBOARD;
-- plan R-0011 M3 e M7; adendas A4 e A7; contrato work/rounds/R-0011/contracts/
-- CTG-0001.md §3). Referências globais, sem tenant_id e sem RLS; as tabelas
-- tenant-scoped são criadas pelo blueprint BP-DASH-MONITOR-001 em
-- 80-dashboard.sql. Os timers são vocabulário (M7/A3): armar e vencer é CTG-0002.

CREATE SCHEMA IF NOT EXISTS dashboard;

CREATE TABLE IF NOT EXISTS dashboard.alert_state_ref (
  code varchar(40) PRIMARY KEY,
  sort_order smallint NOT NULL UNIQUE,
  is_terminal boolean NOT NULL DEFAULT false,
  track_scope varchar(20) NOT NULL CHECK (track_scope IN ('both', 'extinction')),
  description text NOT NULL,
  source_ref text NOT NULL
);

COMMENT ON TABLE dashboard.alert_state_ref IS 'WF-DASH-001 §Estados: os 10 estados do ciclo do alerta; track_scope = extinction para os estados que só existem na trilha de extinção.';

INSERT INTO dashboard.alert_state_ref (code, sort_order, is_terminal, track_scope, description, source_ref) VALUES
  ('DETECTADO', 10, false, 'both', 'indicador cruza um marco de alerta (evento do app de origem ou leitura periódica)', 'WF-DASH-001 §Estados'),
  ('CLASSIFICADO', 20, false, 'both', 'sistema aplica a matriz de severidade', 'WF-DASH-001 §Estados; §Classificação'),
  ('NOTIFICADO', 30, false, 'both', 'dono do indicador notificado pela cadeia de escalonamento do app de origem', 'WF-DASH-001 §Estados'),
  ('RECONHECIDO', 40, false, 'both', 'dono (ou Operador de monitoramento em seu nome) fez ACK', 'WF-DASH-001 §Estados; UC-DASH-002'),
  ('EM_TRATAMENTO', 50, false, 'both', 'dono iniciou a ação no app de origem', 'WF-DASH-001 §Estados'),
  ('VERIFICADO', 60, false, 'both', 'sistema detectou que o indicador saiu da faixa de alerta no app de origem', 'WF-DASH-001 §Estados'),
  ('ENCERRADO', 70, true, 'both', 'ciclo fechado: Operador (irregularidade) ou sistema (extinção)', 'WF-DASH-001 §Estados'),
  ('ESCALONADO', 80, false, 'both', 'SLA de reconhecimento estourado ou marco seguinte atingido; sobe um nível na cadeia', 'WF-DASH-001 §Estados'),
  ('CRITICO_EXTINCAO', 90, false, 'extinction', 'teto legal atingido sem decisão/ato do app de origem (só trilha de extinção)', 'WF-DASH-001 §Estados; §Distinção obrigatória de UI'),
  ('INCIDENTE_REGISTRADO', 100, true, 'extinction', 'abertura automática de tarefa de apuração; nunca fechado como alerta comum', 'WF-DASH-001 §Estados; WF-RAIT-002 §4.1')
ON CONFLICT (code) DO UPDATE SET
  sort_order = EXCLUDED.sort_order,
  is_terminal = EXCLUDED.is_terminal,
  track_scope = EXCLUDED.track_scope,
  description = EXCLUDED.description,
  source_ref = EXCLUDED.source_ref;

CREATE TABLE IF NOT EXISTS dashboard.alert_transition_ref (
  seq smallint PRIMARY KEY,
  from_state varchar(40) REFERENCES dashboard.alert_state_ref(code),
  to_state varchar(40) NOT NULL REFERENCES dashboard.alert_state_ref(code),
  trigger text NOT NULL,
  actor varchar(40) NOT NULL CHECK (actor IN ('system', 'owner', 'dash-operator', 'owner|dash-operator')),
  track varchar(20) NOT NULL CHECK (track IN ('both', 'extinction', 'irregularity')),
  rule_ref text NOT NULL,
  UNIQUE (from_state, to_state, actor, track)
);

COMMENT ON TABLE dashboard.alert_transition_ref IS 'WF-DASH-001 §Transições e gatilhos: uma linha por linha da tabela (from_state nulo = [*]); VERIFICADO → ENCERRADO desdobrada em dash-operator/irregularity e system/extinction; ESCALONADO → NOTIFICADO do diagrama §Estados incluída por A8 (plan R-0011).';

INSERT INTO dashboard.alert_transition_ref (seq, from_state, to_state, trigger, actor, track, rule_ref) VALUES
  (10, NULL, 'DETECTADO', 'evento do app de origem (preferencial) ou leitura periódica do DASHBOARD (fallback declarado, WF-DASH-003)', 'system', 'both', 'WF-DASH-001'),
  (20, 'DETECTADO', 'CLASSIFICADO', 'aplicação da matriz de severidade (determinístico: tipo + nível do indicador)', 'system', 'both', 'WF-DASH-001'),
  (30, 'CLASSIFICADO', 'NOTIFICADO', 'notificação ao dono conforme a cadeia de escalonamento do app de origem', 'system', 'both', 'WF-DASH-001'),
  (40, 'CLASSIFICADO', 'CRITICO_EXTINCAO', 'teto legal atingido, indicador tipo legal-ceiling, sem decisão/ato do app de origem antes do marco', 'system', 'extinction', 'WF-DASH-001'),
  (50, 'NOTIFICADO', 'RECONHECIDO', 'ACK do dono (ou do Operador de monitoramento, em nome do dono quando o app de origem não expõe ACK próprio)', 'owner|dash-operator', 'both', 'WF-DASH-001'),
  (60, 'NOTIFICADO', 'ESCALONADO', 'SLA de reconhecimento vencido sem ACK (T-DASH-ACK-*)', 'system', 'both', 'WF-DASH-001'),
  (65, 'ESCALONADO', 'NOTIFICADO', 'reinicia notificação no próximo nível da cadeia', 'system', 'both', 'WF-DASH-001 §Estados (diagrama)'),
  (70, 'RECONHECIDO', 'EM_TRATAMENTO', 'dono confirma início de ação no app de origem', 'owner', 'both', 'WF-DASH-001'),
  (80, 'EM_TRATAMENTO', 'VERIFICADO', 'sistema detecta, por evento ou leitura do app de origem, que o indicador voltou à faixa normal', 'system', 'both', 'WF-DASH-001'),
  (90, 'EM_TRATAMENTO', 'ESCALONADO', 'indicador cruza o próximo marco de severidade antes da verificação', 'system', 'both', 'WF-DASH-001'),
  (100, 'VERIFICADO', 'ENCERRADO', 'confirmação final pelo Operador de monitoramento', 'dash-operator', 'irregularity', 'WF-DASH-001'),
  (101, 'VERIFICADO', 'ENCERRADO', 'confirmação final pelo sistema, quando o app de origem já mudou de estado', 'system', 'extinction', 'WF-DASH-001'),
  (110, 'CRITICO_EXTINCAO', 'INCIDENTE_REGISTRADO', 'abertura automática de tarefa de apuração (protocolo de WF-RAIT-002 §4.1)', 'system', 'extinction', 'WF-DASH-001')
ON CONFLICT (seq) DO UPDATE SET
  from_state = EXCLUDED.from_state,
  to_state = EXCLUDED.to_state,
  trigger = EXCLUDED.trigger,
  actor = EXCLUDED.actor,
  track = EXCLUDED.track,
  rule_ref = EXCLUDED.rule_ref;

CREATE TABLE IF NOT EXISTS dashboard.duty_state_ref (
  code varchar(40) PRIMARY KEY,
  sort_order smallint NOT NULL UNIQUE,
  is_terminal boolean NOT NULL DEFAULT false,
  description text NOT NULL,
  source_ref text NOT NULL
);

COMMENT ON TABLE dashboard.duty_state_ref IS 'WF-DASH-002 §Estados: os 8 estados do ciclo recorrente de um dever periódico.';

INSERT INTO dashboard.duty_state_ref (code, sort_order, is_terminal, description, source_ref) VALUES
  ('JANELA_ABERTA', 10, false, 'início do período de apuração', 'WF-DASH-002 §Estados'),
  ('EM_APURACAO', 20, false, 'dono do dever iniciou a coleta dos dados exigidos', 'WF-DASH-002 §Estados'),
  ('PREPARADO', 30, false, 'minuta/relatório/dataset pronto para submissão ou publicação', 'WF-DASH-002 §Estados'),
  ('SUBMETIDO_PUBLICADO', 40, false, 'envio ao órgão federal ou publicação no portal', 'WF-DASH-002 §Estados'),
  ('COMPROVADO', 50, false, 'evidência de envio/publicação arquivada (protocolo, captura, hash)', 'WF-DASH-002 §Estados'),
  ('ARQUIVADO', 60, true, 'ciclo encerrado; evidência retida para auditoria', 'WF-DASH-002 §Estados'),
  ('ATRASADO', 70, false, 'data-limite atingida sem avanço (continua exigível)', 'WF-DASH-002 §Estados; §Nota de leitura'),
  ('NAO_CUMPRIDO', 80, true, 'período seguinte aberto sem cumprimento do anterior; registrado como falha', 'WF-DASH-002 §Estados')
ON CONFLICT (code) DO UPDATE SET
  sort_order = EXCLUDED.sort_order,
  is_terminal = EXCLUDED.is_terminal,
  description = EXCLUDED.description,
  source_ref = EXCLUDED.source_ref;

CREATE TABLE IF NOT EXISTS dashboard.duty_transition_ref (
  seq smallint PRIMARY KEY,
  from_state varchar(40) REFERENCES dashboard.duty_state_ref(code),
  to_state varchar(40) NOT NULL REFERENCES dashboard.duty_state_ref(code),
  trigger text NOT NULL,
  actor varchar(40) NOT NULL CHECK (actor IN ('system', 'dash-duty-owner', 'dash-duty-owner|dash-operator')),
  rule_ref text NOT NULL,
  UNIQUE (from_state, to_state)
);

COMMENT ON TABLE dashboard.duty_transition_ref IS 'WF-DASH-002 §Transições e gatilhos: uma linha por linha da tabela (from_state nulo = [*]); "* → ATRASADO" desdobrada em JANELA_ABERTA, EM_APURACAO e PREPARADO conforme o diagrama.';

INSERT INTO dashboard.duty_transition_ref (seq, from_state, to_state, trigger, actor, rule_ref) VALUES
  (10, NULL, 'JANELA_ABERTA', 'virada de período (calendário do DASHBOARD, parametrizado por dever)', 'system', 'WF-DASH-002'),
  (20, 'JANELA_ABERTA', 'EM_APURACAO', 'dono inicia coleta de dados', 'dash-duty-owner', 'WF-DASH-002'),
  (30, 'EM_APURACAO', 'PREPARADO', 'minuta pronta', 'dash-duty-owner', 'WF-DASH-002'),
  (40, 'PREPARADO', 'SUBMETIDO_PUBLICADO', 'envio formal ou publicação', 'dash-duty-owner', 'WF-DASH-002'),
  (50, 'SUBMETIDO_PUBLICADO', 'COMPROVADO', 'evidência de envio/publicação arquivada', 'dash-duty-owner|dash-operator', 'WF-DASH-002'),
  (60, 'COMPROVADO', 'ARQUIVADO', 'fechamento do ciclo', 'system', 'WF-DASH-002'),
  (70, 'JANELA_ABERTA', 'ATRASADO', 'data-limite (quando existente) atingida sem avanço', 'system', 'WF-DASH-002'),
  (71, 'EM_APURACAO', 'ATRASADO', 'data-limite (quando existente) atingida sem avanço', 'system', 'WF-DASH-002'),
  (72, 'PREPARADO', 'ATRASADO', 'data-limite (quando existente) atingida sem SUBMETIDO_PUBLICADO', 'system', 'WF-DASH-002'),
  (80, 'ATRASADO', 'SUBMETIDO_PUBLICADO', 'cumprimento tardio', 'dash-duty-owner', 'WF-DASH-002'),
  (90, 'ATRASADO', 'NAO_CUMPRIDO', 'próximo período se abre sem cumprimento do anterior', 'system', 'WF-DASH-002')
ON CONFLICT (seq) DO UPDATE SET
  from_state = EXCLUDED.from_state,
  to_state = EXCLUDED.to_state,
  trigger = EXCLUDED.trigger,
  actor = EXCLUDED.actor,
  rule_ref = EXCLUDED.rule_ref;

CREATE TABLE IF NOT EXISTS dashboard.freshness_state_ref (
  code varchar(40) PRIMARY KEY,
  sort_order smallint NOT NULL UNIQUE,
  description text NOT NULL,
  source_ref text NOT NULL
);

COMMENT ON TABLE dashboard.freshness_state_ref IS 'WF-DASH-003 §Estados: o selo de frescor de cada painel; "oculto" é estratégia de UI (source.hidden), não estado.';

INSERT INTO dashboard.freshness_state_ref (code, sort_order, description, source_ref) VALUES
  ('FRESCO', 10, 'leitura dentro da latência aceitável declarada para o painel', 'WF-DASH-003 §Estados'),
  ('ATRASADO', 20, 'leitura mais antiga que a latência aceitável, fonte ainda respondendo', 'WF-DASH-003 §Estados'),
  ('INDISPONIVEL', 30, 'fonte parou de responder (timeout, erro, sem heartbeat)', 'WF-DASH-003 §Estados'),
  ('DESATUALIZADO_MARCADO', 40, 'último número conhecido mantido visível com marcação explícita de desatualização', 'WF-DASH-003 §Estados; §Duas estratégias')
ON CONFLICT (code) DO UPDATE SET
  sort_order = EXCLUDED.sort_order,
  description = EXCLUDED.description,
  source_ref = EXCLUDED.source_ref;

CREATE TABLE IF NOT EXISTS dashboard.severity_ref (
  code varchar(10) PRIMARY KEY,
  sort_order smallint NOT NULL UNIQUE,
  description text NOT NULL,
  source_ref text NOT NULL
);

COMMENT ON TABLE dashboard.severity_ref IS 'WF-DASH-001 §Classificação — a matriz de severidade: nível dinâmico calculado da distância até o marco/teto.';

INSERT INTO dashboard.severity_ref (code, sort_order, description, source_ref) VALUES
  ('N1', 10, 'Nível N1 (≈50% do prazo)', 'WF-DASH-001 §Classificação'),
  ('N2', 20, 'Nível N2 (≈75%)', 'WF-DASH-001 §Classificação'),
  ('N3', 30, 'Nível N3 (≈90%)', 'WF-DASH-001 §Classificação'),
  ('CRITICO', 40, 'CRÍTICO (teto atingido)', 'WF-DASH-001 §Classificação')
ON CONFLICT (code) DO UPDATE SET
  sort_order = EXCLUDED.sort_order,
  description = EXCLUDED.description,
  source_ref = EXCLUDED.source_ref;

CREATE TABLE IF NOT EXISTS dashboard.layer_ref (
  code varchar(2) PRIMARY KEY,
  sort_order smallint NOT NULL UNIQUE,
  description text NOT NULL,
  source_ref text NOT NULL
);

COMMENT ON TABLE dashboard.layer_ref IS 'RN-DASH-170: camadas de sensibilidade N0…N3; N3 é "ninguém, pelo DASHBOARD" e nunca entra em coluna de estado próprio.';

INSERT INTO dashboard.layer_ref (code, sort_order, description, source_ref) VALUES
  ('N0', 10, 'Indicadores agregados institucionais — volumes, tempos médios, taxas de cumprimento, séries anonimizadas', 'RN-DASH-170'),
  ('N1', 20, 'Operacional por fila — contagens por pool, idade de fila, backlog, alertas por família', 'RN-DASH-170'),
  ('N2', 30, 'Identificação de objeto de processo — nº do processo em risco, placa, equipamento, AIT', 'RN-DASH-170'),
  ('N3', 40, 'Dado pessoal sensível — qualquer atributo de saúde, biometria, evidência de bodycam; ninguém, pelo DASHBOARD', 'RN-DASH-170; RN-DASH-162')
ON CONFLICT (code) DO UPDATE SET
  sort_order = EXCLUDED.sort_order,
  description = EXCLUDED.description,
  source_ref = EXCLUDED.source_ref;

CREATE TABLE IF NOT EXISTS dashboard.classification_ref (
  code varchar(2) PRIMARY KEY,
  sort_order smallint NOT NULL UNIQUE,
  description text NOT NULL,
  source_ref text NOT NULL
);

COMMENT ON TABLE dashboard.classification_ref IS 'RN-DASH-142: classificação obrigatória de cada indicador; todo indicador nasce P3 (verificação 1).';

INSERT INTO dashboard.classification_ref (code, sort_order, description, source_ref) VALUES
  ('P1', 10, 'Público por dever — a lei manda publicar, independentemente de pedido', 'RN-DASH-142'),
  ('P2', 20, 'Publicável por decisão do órgão — sem dever nem vedação; a publicação cria responsabilidade de controlador', 'RN-DASH-142'),
  ('P3', 30, 'Interno por natureza — a publicação criaria risco jurídico, de segurança ou de dado pessoal', 'RN-DASH-142')
ON CONFLICT (code) DO UPDATE SET
  sort_order = EXCLUDED.sort_order,
  description = EXCLUDED.description,
  source_ref = EXCLUDED.source_ref;

CREATE TABLE IF NOT EXISTS dashboard.block_ref (
  code varchar(1) PRIMARY KEY,
  kind varchar(20) NOT NULL UNIQUE CHECK (kind IN ('legal-ceiling', 'dever-periodico', 'sla-operacional', 'saude-tecnica')),
  latency_band varchar(40) NOT NULL,
  unavailable_strategy varchar(10) NOT NULL CHECK (unavailable_strategy IN ('hide', 'mark')),
  description text NOT NULL,
  source_ref text NOT NULL
);

COMMENT ON TABLE dashboard.block_ref IS 'APP-DASHBOARD §Catálogo (blocos A–D e tipo); WF-DASH-003 §Latência aceitável (faixa por tipo, DT-030) e §Duas estratégias (ocultar para A, marcar para B/C/D). Latência exata por painel é source_pending (M13).';

INSERT INTO dashboard.block_ref (code, kind, latency_band, unavailable_strategy, description, source_ref) VALUES
  ('A', 'legal-ceiling', 'minutos a poucas horas', 'hide', 'extinção de direito / efeito jurídico automático — trilha de extinção de WF-DASH-001', 'APP-DASHBOARD §Catálogo A; WF-DASH-003'),
  ('B', 'dever-periodico', 'até 1 dia', 'mark', 'obrigação institucional recorrente amarrada a calendário — WF-DASH-002', 'APP-DASHBOARD §Catálogo B; WF-DASH-003'),
  ('C', 'sla-operacional', 'horas', 'mark', 'meta ou prazo do órgão sem efeito jurídico automático', 'APP-DASHBOARD §Catálogo C; WF-DASH-003'),
  ('D', 'saude-tecnica', 'minutos', 'mark', 'infraestrutura/integração; condição de confiabilidade dos demais indicadores', 'APP-DASHBOARD §Catálogo D; WF-DASH-003')
ON CONFLICT (code) DO UPDATE SET
  kind = EXCLUDED.kind,
  latency_band = EXCLUDED.latency_band,
  unavailable_strategy = EXCLUDED.unavailable_strategy,
  description = EXCLUDED.description,
  source_ref = EXCLUDED.source_ref;

CREATE TABLE IF NOT EXISTS dashboard.timer_ref (
  code varchar(40) PRIMARY KEY,
  owner varchar(20) NOT NULL CHECK (owner = 'dashboard'),
  duration_value numeric(10,2),
  duration_unit varchar(20) NOT NULL CHECK (duration_unit IN ('horas_uteis', 'dias_corridos', 'percentual', 'imediato', 'data_fixa', 'mensal', 'anual')),
  applies_to text NOT NULL,
  status varchar(20) NOT NULL CHECK (status IN ('vigente', 'proposta')),
  decision_ref text NOT NULL,
  legal_basis text NOT NULL,
  CHECK ((duration_unit IN ('imediato', 'data_fixa', 'mensal', 'anual')) = (duration_value IS NULL))
);

COMMENT ON TABLE dashboard.timer_ref IS 'Plan R-0011 M7/A7: timers do DASHBOARD como vocabulário (SLA de ACK por severidade, marcos 50/75/90%, viradas dos deveres com data, piso de 60 dias para 309/314). Deveres sem prazo (204, 205, 208) não ganham timer (RN-DASH-113). Armar/vencer é CTG-0002.';

INSERT INTO dashboard.timer_ref (code, owner, duration_value, duration_unit, applies_to, status, decision_ref, legal_basis) VALUES
  ('T-DASH-ACK-N1', 'dashboard', 24, 'horas_uteis', 'N1', 'vigente', 'DT-030', 'sem base legal — parâmetro do próprio DASHBOARD (dashboard.ack_sla); WF-DASH-001 NOTIFICADO → ESCALONADO'),
  ('T-DASH-ACK-N2', 'dashboard', 8, 'horas_uteis', 'N2', 'vigente', 'DT-030', 'sem base legal — parâmetro do próprio DASHBOARD (dashboard.ack_sla); WF-DASH-001 NOTIFICADO → ESCALONADO'),
  ('T-DASH-ACK-N3', 'dashboard', 2, 'horas_uteis', 'N3', 'vigente', 'DT-030', 'sem base legal — parâmetro do próprio DASHBOARD (dashboard.ack_sla); WF-DASH-001 NOTIFICADO → ESCALONADO'),
  ('T-DASH-ACK-CRITICO', 'dashboard', NULL, 'imediato', 'CRITICO', 'vigente', 'DT-030', 'sem base legal — parâmetro do próprio DASHBOARD (dashboard.ack_sla); WF-DASH-001 NOTIFICADO → ESCALONADO'),
  ('T-DASH-MARCO-50', 'dashboard', 50, 'percentual', 'indicadores com prazo numérico — marco N1 (≈50% do prazo)', 'vigente', 'WF-DASH-001 matriz de severidade; WF-RAIT-002 §4', 'escada herdada do workflow de origem (WF-DASH-001 §Classificação; WF-RAIT-002 §4; steering A.1)'),
  ('T-DASH-MARCO-75', 'dashboard', 75, 'percentual', 'indicadores com prazo numérico — marco N2 (≈75%)', 'vigente', 'WF-DASH-001 matriz de severidade; WF-RAIT-002 §4', 'escada herdada do workflow de origem (WF-DASH-001 §Classificação; WF-RAIT-002 §4; steering A.1)'),
  ('T-DASH-MARCO-90', 'dashboard', 90, 'percentual', 'indicadores com prazo numérico — marco N3 (≈90%)', 'vigente', 'WF-DASH-001 matriz de severidade; WF-RAIT-002 §4', 'escada herdada do workflow de origem (WF-DASH-001 §Classificação; WF-RAIT-002 §4; steering A.1)'),
  ('T-DASH-DUTY-201', 'dashboard', NULL, 'data_fixa', 'IND-DASH-201 — dia 20 do mês subsequente', 'vigente', 'RN-DASH-120 linha 1; WF-DASH-002 §Prazos', 'REF-CONTRAN-918 art. 26'),
  ('T-DASH-DUTY-202', 'dashboard', NULL, 'mensal', 'IND-DASH-202 — último dia do mês', 'proposta', 'OD-D10; dashboard.duty.IND-202.deadline', 'REF-CONTRAN-918 art. 27 §6º (data exata não localizada; §7º suspensão da autorização)'),
  ('T-DASH-DUTY-PNATRANS', 'dashboard', NULL, 'data_fixa', 'DUTY-PNATRANS — 30 de abril', 'vigente', 'RN-DASH-120 linha +; RN-DASH-114', 'CTB art. 326-A §12'),
  ('T-DASH-DUTY-206', 'dashboard', NULL, 'anual', 'IND-DASH-206 — 31/12 + preparação jan–fev', 'vigente', 'DT-030; dashboard.duty.annual_deadline', 'REF-LEI-13460 art. 15 (data não fixada em norma)'),
  ('T-DASH-DUTY-207', 'dashboard', NULL, 'anual', 'IND-DASH-207 — 31/12 + preparação jan–fev', 'vigente', 'DT-030; dashboard.duty.annual_deadline', 'REF-LEI-13460 art. 23 §§1º-2º (data não fixada em norma)'),
  ('T-DASH-DUTY-209', 'dashboard', NULL, 'mensal', 'IND-DASH-209 — auditoria mensal', 'vigente', 'DT-030; dashboard.transparency.audit_period', 'REF-LEI-12527 art. 8º §3º (checklist contínuo, auditado periodicamente)'),
  ('T-DASH-PENDING-FLOOR', 'dashboard', 60, 'dias_corridos', '309, 314', 'vigente', 'DT-030; dashboard.pending_age_floor_days', 'sem prazo legal localizado — idade absoluta da pendência como proxy (WF-DASH-001 §Decisões pendentes; RN-PEC-112 linha T-JES; WF-TEAT-001 SUSPEITO_CONCORRENCIA)')
ON CONFLICT (code) DO UPDATE SET
  owner = EXCLUDED.owner,
  duration_value = EXCLUDED.duration_value,
  duration_unit = EXCLUDED.duration_unit,
  applies_to = EXCLUDED.applies_to,
  status = EXCLUDED.status,
  decision_ref = EXCLUDED.decision_ref,
  legal_basis = EXCLUDED.legal_basis;

-- Cadeia de escalonamento por app de origem (plan R-0011 M18; CTG-0002 §2.3).
-- WF-DASH-001 §Transições: "a cadeia é a mesma já definida em cada workflow de
-- domínio; DASHBOARD não cria uma cadeia paralela". A cadeia `rait` transcreve
-- WF-RAIT-002 §6 (nível → ator, mapeado a códigos de auth.role_catalog /
-- roles.ts DETRAN_ROLES). Apps sem cadeia publicada (pec, teat, boat, portal,
-- senatran-adapter) recebem um único nível marcado source_pending (OD-D29):
-- role = papel de dono de área de DASH_AREA_MANAGERS (policy.ts) correspondente
-- ao app, senão dash-operator. status: vigente = transcrito de workflow
-- aprovado; source_pending = ator sem código de papel ou app sem cadeia.
-- CRITICO_EXTINCAO notifica toda a cadeia + AUDITOR (H.54,
-- dashboard.critical_extinction.notify_legal) — regra do notificador, não linha.

CREATE TABLE IF NOT EXISTS dashboard.escalation_chain_ref (
  source_app varchar(20) NOT NULL CHECK (source_app IN ('rait', 'pec', 'boat', 'teat', 'portal', 'senatran-adapter', 'dashboard', 'institucional', 'benchmark', 'interno', 'todos')),
  level smallint NOT NULL CHECK (level >= 1),
  role varchar(40) NOT NULL REFERENCES auth.role_catalog(key),
  status varchar(20) NOT NULL CHECK (status IN ('vigente', 'source_pending')),
  source_ref text NOT NULL,
  note text,
  PRIMARY KEY (source_app, level)
);

COMMENT ON TABLE dashboard.escalation_chain_ref IS 'Plan R-0011 M18: cadeia de escalonamento por app de origem, um nível por linha (WF-DASH-001 NOTIFICADO → ESCALONADO → NOTIFICADO no nível seguinte, A8). rait transcrito de WF-RAIT-002 §6; demais apps com um nível source_pending (OD-D29). role = código de auth.role_catalog (roles.ts DETRAN_ROLES).';

INSERT INTO dashboard.escalation_chain_ref (source_app, level, role, status, source_ref, note) VALUES
  ('rait', 1, 'rait-analyst', 'vigente', 'WF-RAIT-002 §6 — ALERTA_N1 → responsável direto (analista/relator)', 'responsável direto = analista (1º circuito, rait-analyst) ou relator (2º circuito, rait-rapporteur); o notificador entrega ao alert.owner_role/owner_ref quando o alerta os traz, senão a este código (CTG-0002 §6.4)'),
  ('rait', 2, 'rait-coordinator', 'vigente', 'WF-RAIT-002 §6 — ALERTA_N2 → + coordenador do pool', NULL),
  ('rait', 3, 'rait-manager', 'vigente', 'WF-RAIT-002 §6 — ALERTA_N3 → + gestor RAIT (força priorização de pauta/fila)', NULL),
  ('rait', 4, 'rait-chair', 'vigente', 'WF-RAIT-002 §6 — CRITICO → + presidente JARI/CETRAN (pode convocar sessão extraordinária)', NULL),
  ('rait', 5, 'AUDITOR', 'source_pending', 'WF-RAIT-002 §6 — PRESCRITO_OPERACIONAL → + LEGAL/auditoria (apuração)', 'LEGAL não tem código em auth.role_catalog/roles.ts; auditoria = AUDITOR (H.54: CRITICO_EXTINCAO notifica LEGAL/AUDITOR)'),
  ('pec', 1, 'GESTOR', 'source_pending', 'OD-D29 — PEC sem cadeia de escalonamento publicada; dono de área DASH_AREA_MANAGERS (policy.ts) do app', NULL),
  ('teat', 1, 'traffic-authority', 'source_pending', 'OD-D29 — TEAT sem cadeia de escalonamento publicada (WF-TEAT-001 Diretoria de Fiscalização sem código de papel); dono de área DASH_AREA_MANAGERS (policy.ts) do app', NULL),
  ('boat', 1, 'dash-operator', 'source_pending', 'OD-D29 — BOAT sem cadeia de escalonamento publicada e sem dono de área em DASH_AREA_MANAGERS', NULL),
  ('portal', 1, 'dash-operator', 'source_pending', 'OD-D29 — PORTAL sem cadeia de escalonamento publicada e sem dono de área em DASH_AREA_MANAGERS', NULL),
  ('senatran-adapter', 1, 'dash-operator', 'source_pending', 'OD-D29 — senatran-adapter sem cadeia de escalonamento publicada e sem dono de área em DASH_AREA_MANAGERS', NULL)
ON CONFLICT (source_app, level) DO UPDATE SET
  role = EXCLUDED.role,
  status = EXCLUDED.status,
  source_ref = EXCLUDED.source_ref,
  note = EXCLUDED.note;
