-- Vocabulário do BOAT para o agregado est.crash (WF-BOAT-001, WF-BOAT-003;
-- H.42, H.43 e H.45). Referências globais, sem tenant_id e sem RLS; as tabelas
-- tenant-scoped são criadas pelo blueprint BP-EST-CRASH-001 em 70-est-crash.sql.

CREATE SCHEMA IF NOT EXISTS est;

CREATE TABLE IF NOT EXISTS est.crash_state_ref (
  code varchar(60) PRIMARY KEY,
  scope varchar(20) NOT NULL CHECK (scope IN ('local', 'national')),
  sort_order smallint NOT NULL UNIQUE,
  is_terminal boolean NOT NULL DEFAULT false,
  description text NOT NULL,
  source_ref text NOT NULL
);

COMMENT ON TABLE est.crash_state_ref IS 'WF-BOAT-001: estados locais do BOAT e espelho nacional do RENAEST.';

INSERT INTO est.crash_state_ref (code, scope, sort_order, is_terminal, description, source_ref) VALUES
  ('RASCUNHO', 'local', 10, false, 'registro iniciado', 'WF-BOAT-001'),
  ('EM_ATENDIMENTO', 'local', 20, false, 'atendimento de campo em curso', 'WF-BOAT-001'),
  ('REGISTRADO', 'local', 30, false, 'registro de campo concluído', 'WF-BOAT-001'),
  ('PENDENTE_COMPLEMENTO', 'local', 40, false, 'dados mínimos pendentes', 'WF-BOAT-001'),
  ('VALIDADO', 'local', 50, false, 'registro validado', 'WF-BOAT-001'),
  ('FECHADO', 'local', 60, false, 'encerramento local concluído', 'WF-BOAT-001'),
  ('INTEGRADO', 'local', 70, false, 'transmitido à RENAEST', 'WF-BOAT-001'),
  ('ARQUIVADO', 'local', 80, true, 'registro local arquivado', 'WF-BOAT-001'),
  ('CANCELADO', 'local', 90, true, 'rascunho cancelado', 'WF-BOAT-001'),
  ('RECEBIDO', 'national', 110, false, 'espelho: RENAEST recebeu o registro', 'WF-BOAT-001'),
  ('EM_ANALISE', 'national', 120, false, 'espelho: complemento ou correção em análise', 'WF-BOAT-001'),
  ('CONSOLIDADO', 'national', 130, true, 'espelho: consolidação nacional terminal', 'WF-BOAT-001; WF-BOAT-003'),
  ('REJEITADO', 'national', 140, true, 'espelho: rejeição nacional terminal', 'WF-BOAT-001; WF-BOAT-003')
ON CONFLICT (code) DO UPDATE SET
  scope = EXCLUDED.scope,
  sort_order = EXCLUDED.sort_order,
  is_terminal = EXCLUDED.is_terminal,
  description = EXCLUDED.description,
  source_ref = EXCLUDED.source_ref;

CREATE TABLE IF NOT EXISTS est.crash_severity_ref (
  code varchar(60) PRIMARY KEY,
  sort_order smallint NOT NULL UNIQUE,
  requires_victim boolean NOT NULL,
  source_ref text NOT NULL
);

COMMENT ON TABLE est.crash_severity_ref IS 'Enum federal de gravidade conhecido pelas fontes BOAT; H.43 deriva a gravidade do registro da pior vítima.';

INSERT INTO est.crash_severity_ref (code, sort_order, requires_victim, source_ref) VALUES
  ('SEM_VITIMA', 10, false, 'H.43; WF-BOAT-001'),
  ('COM_VITIMA_FERIDA', 20, true, 'WF-BOAT-001'),
  ('COM_VITIMA_FATAL', 30, true, 'WF-BOAT-001')
ON CONFLICT (code) DO UPDATE SET
  sort_order = EXCLUDED.sort_order,
  requires_victim = EXCLUDED.requires_victim,
  source_ref = EXCLUDED.source_ref;

CREATE TABLE IF NOT EXISTS est.scene_duty_ref (
  code varchar(20) PRIMARY KEY,
  regime varchar(20) NOT NULL CHECK (regime IN ('art176', 'art177', 'art178')),
  source_ref text NOT NULL
);

INSERT INTO est.scene_duty_ref (code, regime, source_ref) VALUES
  ('176_I', 'art176', 'WF-BOAT-001; boat-route-contract §3'),
  ('176_II', 'art176', 'WF-BOAT-001; boat-route-contract §3'),
  ('176_III', 'art176', 'WF-BOAT-001; boat-route-contract §3'),
  ('176_IV', 'art176', 'WF-BOAT-001; boat-route-contract §3'),
  ('176_V', 'art176', 'WF-BOAT-001; boat-route-contract §3'),
  ('177', 'art177', 'WF-BOAT-001; boat-route-contract §3'),
  ('178', 'art178', 'WF-BOAT-001; boat-route-contract §3')
ON CONFLICT (code) DO UPDATE SET regime = EXCLUDED.regime, source_ref = EXCLUDED.source_ref;

CREATE TABLE IF NOT EXISTS est.crash_condition_ref (
  catalog varchar(40) PRIMARY KEY CHECK (catalog IN ('crash_type', 'road_condition', 'weather_condition', 'lighting_condition', 'signage_condition')),
  values_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  source_pending boolean NOT NULL DEFAULT true,
  editable_by varchar(40) NOT NULL DEFAULT 'agency-admin',
  decision_ref text NOT NULL DEFAULT 'H.42'
);

COMMENT ON TABLE est.crash_condition_ref IS 'H.42: catálogo editável pelo agency-admin; valores do protótipo ainda source_pending, portanto não são inventados neste DDL.';

INSERT INTO est.crash_condition_ref (catalog) VALUES
  ('crash_type'),
  ('road_condition'),
  ('weather_condition'),
  ('lighting_condition'),
  ('signage_condition')
ON CONFLICT (catalog) DO UPDATE SET
  source_pending = true,
  editable_by = 'agency-admin',
  decision_ref = 'H.42';

CREATE TABLE IF NOT EXISTS est.damage_asset_kind_ref (
  code varchar(60) PRIMARY KEY,
  source_ref text NOT NULL
);

INSERT INTO est.damage_asset_kind_ref (code, source_ref) VALUES
  ('veiculo_terceiro', 'boat-route-contract §3'),
  ('mobiliario_urbano', 'boat-route-contract §3'),
  ('sinalizacao', 'boat-route-contract §3'),
  ('edificacao', 'boat-route-contract §3'),
  ('outro', 'boat-route-contract §3')
ON CONFLICT (code) DO UPDATE SET source_ref = EXCLUDED.source_ref;

CREATE TABLE IF NOT EXISTS est.crash_timer_ref (
  code varchar(60) PRIMARY KEY,
  trigger_state varchar(60) NOT NULL REFERENCES est.crash_state_ref(code),
  parameter_key varchar(120) NOT NULL,
  default_period varchar(40) NOT NULL,
  owner varchar(80) NOT NULL,
  status varchar(20) NOT NULL CHECK (status IN ('vigente', 'a_confirmar', 'proposta')),
  decision_ref text NOT NULL
);

COMMENT ON TABLE est.crash_timer_ref IS 'T-BOAT-TRANSM é parâmetro operacional mensal, não prazo legal por sinistro (WF-BOAT-001).';

INSERT INTO est.crash_timer_ref (code, trigger_state, parameter_key, default_period, owner, status, decision_ref) VALUES
  ('T-BOAT-TRANSM', 'FECHADO', 'est.renaest.transmit_period', 'monthly', 'sinistro', 'vigente', 'OD-B04/DT-017')
ON CONFLICT (code) DO UPDATE SET
  trigger_state = EXCLUDED.trigger_state,
  parameter_key = EXCLUDED.parameter_key,
  default_period = EXCLUDED.default_period,
  owner = EXCLUDED.owner,
  status = EXCLUDED.status,
  decision_ref = EXCLUDED.decision_ref;

CREATE OR REPLACE FUNCTION est.crash_severity_matches_victims(
  p_crash_record_id uuid,
  p_severity varchar
) RETURNS boolean
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  expected_severity varchar(60);
BEGIN
  SELECT COALESCE(
    (
      SELECT ref.code
      FROM est.crash_victim victim
      JOIN est.crash_severity_ref ref ON ref.code = victim.severity
      WHERE victim.crash_record_id = p_crash_record_id
      ORDER BY ref.sort_order DESC
      LIMIT 1
    ),
    'SEM_VITIMA'
  ) INTO expected_severity;

  RETURN p_severity = expected_severity;
END;
$$;

COMMENT ON FUNCTION est.crash_severity_matches_victims(uuid, varchar) IS 'H.43: a gravidade do sinistro é a pior gravidade de vítima; sem vítima é SEM_VITIMA. O check gerado a usa no fechamento.';
