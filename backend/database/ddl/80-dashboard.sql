-- Generated from BP-DASH-MONITOR-001 v1.0.0 sha256:f6f02498282fa6757196ac8b711a05e41a930f7e3980a3b9e96f62a2438e24ab

-- Regenerable-only DDL for BP-DASH-MONITOR-001; request-path writes use role_app_backend.

create schema if not exists dashboard;

create table if not exists dashboard.alert (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  indicator_code varchar(20) not null,
  track varchar(20) not null,
  state varchar(40) not null,
  severity varchar(10) not null,
  block varchar(1) not null,
  source_app varchar(20) not null,
  object_kind varchar(40) not null,
  object_ref varchar(120) not null,
  object_layer varchar(2) not null,
  owner_role varchar(40) not null,
  owner_ref uuid,
  governing_clock varchar(1),
  next_milestone_at timestamptz,
  ceiling_on date,
  detected_at timestamptz default now() not null,
  classified_at timestamptz,
  notified_at timestamptz,
  acknowledged_at timestamptz,
  treating_at timestamptz,
  verified_at timestamptz,
  closed_at timestamptz,
  escalated_at timestamptz,
  critical_at timestamptz,
  incident_at timestamptz,
  ack_channel varchar(10),
  escalation_level integer default 0 not null,
  incident_ref varchar(120),
  source_event_id uuid,
  version integer default 1 not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_alert primary key (id),
  constraint ck_dashboard_alert_indicator_code check (indicator_code ~ '^IND-DASH-[0-9]{3}$'),
  constraint ck_dashboard_alert_track check (track in ('extinction','irregularity')),
  constraint ck_dashboard_alert_state check (state in ('DETECTADO','CLASSIFICADO','NOTIFICADO','RECONHECIDO','EM_TRATAMENTO','VERIFICADO','ENCERRADO','ESCALONADO','CRITICO_EXTINCAO','INCIDENTE_REGISTRADO')),
  constraint ck_dashboard_alert_severity check (severity in ('N1','N2','N3','CRITICO')),
  constraint ck_dashboard_alert_block check (block in ('A','B','C','D')),
  constraint ck_dashboard_alert_source_app check (source_app in ('rait','pec','boat','teat','portal','senatran-adapter','dashboard','institucional','benchmark','interno','todos')),
  constraint ck_dashboard_alert_object_layer check (object_layer in ('N0','N1','N2')),
  constraint ck_dashboard_alert_governing_clock check (governing_clock is null or governing_clock in ('A','B','C','D')),
  constraint ck_dashboard_alert_extinction_states check (state not in ('CRITICO_EXTINCAO','INCIDENTE_REGISTRADO') or track = 'extinction'),
  constraint ck_dashboard_alert_ack_channel check ((acknowledged_at is null) = (ack_channel is null) and (ack_channel is null or ack_channel in ('origin','manual'))),
  constraint ck_dashboard_alert_escalation_level check (escalation_level >= 0),
  constraint ck_dashboard_alert_version_positive check (version > 0)
);
create index if not exists ix_dashboard_alert_state_severity on dashboard.alert (tenant_id, state, severity);
create index if not exists ix_dashboard_alert_indicator on dashboard.alert (tenant_id, indicator_code, state);
create index if not exists ix_dashboard_alert_object on dashboard.alert (tenant_id, object_kind, object_ref);
create index if not exists ix_dashboard_alert_owner on dashboard.alert (tenant_id, owner_role, state);
create index if not exists ix_alert_tenant_id on dashboard.alert (tenant_id);
create index if not exists ix_alert_source_event_id on dashboard.alert (source_event_id);

create table if not exists dashboard.alert_trail (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  alert_id uuid not null,
  seq integer not null,
  from_state varchar(40),
  to_state varchar(40) not null,
  actor_kind varchar(10) not null,
  actor_ref varchar(120),
  occurred_at timestamptz default now() not null,
  note text,
  root_cause_category varchar(20),
  event_id uuid,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_alert_trail primary key (id),
  constraint ck_dashboard_alert_trail_seq_positive check (seq > 0),
  constraint ck_dashboard_alert_trail_from_state check (from_state is null or from_state in ('DETECTADO','CLASSIFICADO','NOTIFICADO','RECONHECIDO','EM_TRATAMENTO','VERIFICADO','ENCERRADO','ESCALONADO','CRITICO_EXTINCAO','INCIDENTE_REGISTRADO')),
  constraint ck_dashboard_alert_trail_to_state check (to_state in ('DETECTADO','CLASSIFICADO','NOTIFICADO','RECONHECIDO','EM_TRATAMENTO','VERIFICADO','ENCERRADO','ESCALONADO','CRITICO_EXTINCAO','INCIDENTE_REGISTRADO')),
  constraint ck_dashboard_alert_trail_actor_kind check (actor_kind in ('system','user','timer')),
  constraint ck_dashboard_alert_trail_root_cause check (root_cause_category is null or root_cause_category in ('transport','acceptance','payload'))
);
create unique index if not exists ux_dashboard_alert_trail_seq on dashboard.alert_trail (tenant_id, alert_id, seq);
create index if not exists ix_alert_trail_tenant_id on dashboard.alert_trail (tenant_id);
create index if not exists ix_alert_trail_alert_id on dashboard.alert_trail (alert_id);
create index if not exists ix_alert_trail_event_id on dashboard.alert_trail (event_id);

create table if not exists dashboard.duty (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  code varchar(20) not null,
  line_no integer,
  title text not null,
  source_ref text not null,
  periodicity text not null,
  deadline_rule text,
  deadline_kind varchar(20) not null,
  consequence text not null,
  rule_ref text not null,
  scope varchar(20) not null,
  owner_role varchar(40) default 'dash-duty-owner' not null,
  owner_actor text,
  indicator_code varchar(20),
  mvp boolean default false not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_duty primary key (id),
  constraint ck_dashboard_duty_code check (code ~ '^DUTY-[A-Z0-9]+$'),
  constraint ck_dashboard_duty_line_no check (line_no is null or (line_no between 1 and 14)),
  constraint ck_dashboard_duty_deadline_kind check (deadline_kind in ('fixed_day','monthly','annual_date','continuous','per_event','undefined','historical')),
  constraint ck_dashboard_duty_scope check (scope in ('estadual','federal','historico')),
  constraint ck_dashboard_duty_indicator_code check (indicator_code is null or indicator_code ~ '^IND-DASH-[0-9]{3}$')
);
create unique index if not exists ux_dashboard_duty_code on dashboard.duty (tenant_id, code);
create unique index if not exists ux_dashboard_duty_line_no on dashboard.duty (tenant_id, line_no);
create index if not exists ix_duty_tenant_id on dashboard.duty (tenant_id);

create table if not exists dashboard.duty_cycle (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  duty_code varchar(20) not null,
  period varchar(10) not null,
  state varchar(40) not null,
  deadline_on date,
  opened_at timestamptz default now() not null,
  started_at timestamptz,
  prepared_at timestamptz,
  submitted_at timestamptz,
  proved_at timestamptz,
  archived_at timestamptz,
  late_at timestamptz,
  unfulfilled_at timestamptz,
  draft_ref varchar(120),
  evidence_protocol varchar(120),
  evidence_capture_uri text,
  evidence_hash varchar(128),
  version integer default 1 not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_duty_cycle primary key (id),
  constraint ck_dashboard_duty_cycle_code check (duty_code ~ '^DUTY-[A-Z0-9]+$'),
  constraint ck_dashboard_duty_cycle_period check (period ~ '^[0-9]{4}(-[0-9]{2}(-[0-9]{2})?)?$'),
  constraint ck_dashboard_duty_cycle_state check (state in ('JANELA_ABERTA','EM_APURACAO','PREPARADO','SUBMETIDO_PUBLICADO','COMPROVADO','ARQUIVADO','ATRASADO','NAO_CUMPRIDO')),
  constraint ck_dashboard_duty_cycle_evidence check (state not in ('COMPROVADO','ARQUIVADO') or evidence_hash is not null),
  constraint ck_dashboard_duty_cycle_version_positive check (version > 0)
);
create unique index if not exists ux_dashboard_duty_cycle_period on dashboard.duty_cycle (tenant_id, duty_code, period);
create index if not exists ix_dashboard_duty_cycle_state on dashboard.duty_cycle (tenant_id, state, deadline_on);
create index if not exists ix_duty_cycle_tenant_id on dashboard.duty_cycle (tenant_id);

create table if not exists dashboard.indicator (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  code varchar(20) not null,
  block varchar(1) not null,
  kind varchar(20) not null,
  name text not null,
  question text not null,
  source_app varchar(20) not null,
  source_ref text not null,
  threshold_rule text not null,
  owner_actor text not null,
  expected_action text not null,
  classification varchar(2) default 'P3' not null,
  latency_band varchar(40) not null,
  acceptable_latency_minutes integer,
  unavailable_strategy varchar(10),
  projection varchar(60),
  connected boolean default false not null,
  clock_code varchar(1),
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_indicator primary key (id),
  constraint ck_dashboard_indicator_code check (code ~ '^IND-DASH-[0-9]{3}$'),
  constraint ck_dashboard_indicator_block check (block in ('A','B','C','D')),
  constraint ck_dashboard_indicator_kind check (kind in ('legal-ceiling','dever-periodico','sla-operacional','saude-tecnica')),
  constraint ck_dashboard_indicator_block_kind check ((block = 'A' and kind = 'legal-ceiling') or (block = 'B' and kind = 'dever-periodico') or (block = 'C' and kind = 'sla-operacional') or (block = 'D' and kind = 'saude-tecnica')),
  constraint ck_dashboard_indicator_source_app check (source_app in ('rait','pec','boat','teat','portal','senatran-adapter','dashboard','institucional','benchmark','interno','todos')),
  constraint ck_dashboard_indicator_classification check (classification in ('P1','P2','P3')),
  constraint ck_dashboard_indicator_latency check (acceptable_latency_minutes is null or acceptable_latency_minutes > 0),
  constraint ck_dashboard_indicator_unavailable_strategy check (unavailable_strategy is null or unavailable_strategy in ('hide','mark')),
  constraint ck_dashboard_indicator_projection check (projection is null or projection in ('dashboard.prescription_risk','dashboard.production','dashboard.integration_health','dashboard.pec_deadlines','dashboard.teat_measures','dashboard.portal_service_metrics','dashboard.duty_evidence','dashboard.source_freshness','dashboard.crashes')),
  constraint ck_dashboard_indicator_clock_code check (clock_code is null or clock_code in ('A','B','C','D'))
);
create unique index if not exists ux_dashboard_indicator_code on dashboard.indicator (tenant_id, code);
create index if not exists ix_dashboard_indicator_block on dashboard.indicator (tenant_id, block, connected);
create index if not exists ix_indicator_tenant_id on dashboard.indicator (tenant_id);

create table if not exists dashboard.indicator_config (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  indicator_code varchar(20) not null,
  code varchar(80) not null,
  name varchar(160) not null,
  description text,
  formula text not null,
  granularity varchar(60) not null,
  threshold_json jsonb,
  acceptable_latency_minutes integer,
  status varchar(20) default 'draft' not null,
  published_at timestamptz,
  published_by uuid,
  version integer default 1 not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_indicator_config primary key (id),
  constraint ck_dashboard_indicator_config_indicator_code check (indicator_code ~ '^IND-DASH-[0-9]{3}$'),
  constraint ck_dashboard_indicator_config_status check (status in ('draft','published')),
  constraint ck_dashboard_indicator_config_published check (status <> 'published' or published_at is not null),
  constraint ck_dashboard_indicator_config_latency check (acceptable_latency_minutes is null or acceptable_latency_minutes > 0),
  constraint ck_dashboard_indicator_config_version_positive check (version > 0)
);
create unique index if not exists ux_dashboard_indicator_config_code on dashboard.indicator_config (tenant_id, code);
create index if not exists ix_dashboard_indicator_config_indicator on dashboard.indicator_config (tenant_id, indicator_code, status);
create index if not exists ix_indicator_config_tenant_id on dashboard.indicator_config (tenant_id);

create table if not exists dashboard.bi_panel (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  name varchar(160) not null,
  description text,
  visibility_profile varchar(2) not null,
  config_json jsonb not null,
  status varchar(20) default 'draft' not null,
  published_at timestamptz,
  published_by uuid,
  version integer default 1 not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_bi_panel primary key (id),
  constraint ck_dashboard_bi_panel_visibility_profile check (visibility_profile in ('N0','N1','N2')),
  constraint ck_dashboard_bi_panel_status check (status in ('draft','published')),
  constraint ck_dashboard_bi_panel_published check (status <> 'published' or published_at is not null),
  constraint ck_dashboard_bi_panel_version_positive check (version > 0)
);
create unique index if not exists ux_dashboard_bi_panel_name on dashboard.bi_panel (tenant_id, name);
create index if not exists ix_bi_panel_tenant_id on dashboard.bi_panel (tenant_id);

create table if not exists dashboard.generated_report (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  user_ref uuid not null,
  report_type varchar(80) not null,
  filters_json jsonb,
  layer varchar(2) not null,
  purpose varchar(40),
  requested_at timestamptz default now() not null,
  completed_at timestamptz,
  status varchar(20) default 'processing' not null,
  file_uri text,
  file_hash varchar(128),
  watermark text,
  failure_code varchar(80),
  version integer default 1 not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_generated_report primary key (id),
  constraint ck_dashboard_generated_report_status check (status in ('processing','completed','failed')),
  constraint ck_dashboard_generated_report_layer check (layer in ('N0','N1','N2')),
  constraint ck_dashboard_generated_report_completed check (status <> 'completed' or (file_uri is not null and file_hash is not null and completed_at is not null)),
  constraint ck_dashboard_generated_report_purpose_n2 check (layer <> 'N2' or purpose is not null),
  constraint ck_dashboard_generated_report_version_positive check (version > 0)
);
create index if not exists ix_dashboard_generated_report_requested on dashboard.generated_report (tenant_id, requested_at);
create index if not exists ix_dashboard_generated_report_status on dashboard.generated_report (tenant_id, status);
create index if not exists ix_generated_report_tenant_id on dashboard.generated_report (tenant_id);

create table if not exists dashboard.export_log (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  user_ref uuid not null,
  user_role varchar(40) not null,
  scope varchar(80) not null,
  filters_json jsonb not null,
  format varchar(20) not null,
  layer varchar(2) not null,
  purpose varchar(40),
  row_count integer not null,
  status varchar(20) default 'registered' not null,
  justification text,
  approved_by uuid,
  approved_at timestamptz,
  watermark text,
  suppressed_cells integer default 0 not null,
  origin varchar(120),
  requested_at timestamptz default now() not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_export_log primary key (id),
  constraint ck_dashboard_export_log_layer check (layer in ('N0','N1','N2')),
  constraint ck_dashboard_export_log_status check (status in ('registered','pending-approval','approved','rejected')),
  constraint ck_dashboard_export_log_rows check (row_count >= 0 and suppressed_cells >= 0),
  constraint ck_dashboard_export_log_purpose_n2 check (layer <> 'N2' or purpose is not null),
  constraint ck_dashboard_export_log_approved check (status <> 'approved' or (approved_by is not null and approved_at is not null))
);
create index if not exists ix_dashboard_export_log_requested on dashboard.export_log (tenant_id, requested_at);
create index if not exists ix_dashboard_export_log_status on dashboard.export_log (tenant_id, status);
create index if not exists ix_dashboard_export_log_user on dashboard.export_log (tenant_id, user_ref, requested_at);
create index if not exists ix_export_log_tenant_id on dashboard.export_log (tenant_id);

create table if not exists dashboard.source (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  source_key varchar(80) not null,
  app varchar(20) not null,
  state varchar(40) not null,
  last_seen_at timestamptz,
  last_read_at timestamptz,
  acceptable_latency_minutes integer,
  heartbeat_contract varchar(120),
  stale_since timestamptz,
  hidden boolean default false not null,
  last_event_id uuid,
  version integer default 1 not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_source primary key (id),
  constraint ck_dashboard_source_app check (app in ('rait','pec','boat','teat','portal','senatran-adapter','dashboard','institucional','benchmark','interno','todos')),
  constraint ck_dashboard_source_state check (state in ('FRESCO','ATRASADO','INDISPONIVEL','DESATUALIZADO_MARCADO')),
  constraint ck_dashboard_source_latency check (acceptable_latency_minutes is null or acceptable_latency_minutes > 0),
  constraint ck_dashboard_source_fresh_requires_heartbeat check (state <> 'FRESCO' or heartbeat_contract is not null),
  constraint ck_dashboard_source_stale_since check (state <> 'DESATUALIZADO_MARCADO' or stale_since is not null),
  constraint ck_dashboard_source_hidden check (hidden = false or state in ('INDISPONIVEL','DESATUALIZADO_MARCADO')),
  constraint ck_dashboard_source_version_positive check (version > 0)
);
create unique index if not exists ux_dashboard_source_key on dashboard.source (tenant_id, source_key);
create index if not exists ix_dashboard_source_state on dashboard.source (tenant_id, state);
create index if not exists ix_source_tenant_id on dashboard.source (tenant_id);
create index if not exists ix_source_last_event_id on dashboard.source (last_event_id);

create table if not exists dashboard.transparency_audit (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  period varchar(7) not null,
  checklist_json jsonb not null,
  result varchar(40) not null,
  audited_by uuid not null,
  audited_at timestamptz default now() not null,
  notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_transparency_audit primary key (id),
  constraint ck_dashboard_transparency_audit_period check (period ~ '^[0-9]{4}-[0-9]{2}$')
);
create unique index if not exists ux_dashboard_transparency_audit_period on dashboard.transparency_audit (tenant_id, period);
create index if not exists ix_transparency_audit_tenant_id on dashboard.transparency_audit (tenant_id);

create table if not exists dashboard.dataset (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  dataset_key varchar(80) not null,
  name varchar(160) not null,
  description text,
  classification varchar(2) default 'P3' not null,
  req_open_format boolean default false not null,
  req_machine_readable boolean default false not null,
  req_data_dictionary boolean default false not null,
  req_periodic_update_history boolean default false not null,
  req_authenticity_integrity boolean default false not null,
  req_searchable boolean default false not null,
  req_accessible boolean default false not null,
  license varchar(80),
  periodicity varchar(40),
  quality_note text,
  changelog_json jsonb default '[]'::jsonb not null,
  suppression_applied boolean default false not null,
  promoted_by uuid,
  promoted_at timestamptz,
  promotion_basis text,
  published_at timestamptz,
  version integer default 1 not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_dataset primary key (id),
  constraint ck_dashboard_dataset_classification check (classification in ('P1','P2','P3')),
  constraint ck_dashboard_dataset_promotion check (classification = 'P3' or (promoted_by is not null and promoted_at is not null and promotion_basis is not null)),
  constraint ck_dashboard_dataset_published check (published_at is null or (classification in ('P1','P2') and req_open_format and req_machine_readable and req_data_dictionary and req_periodic_update_history and req_authenticity_integrity and req_searchable and req_accessible and suppression_applied)),
  constraint ck_dashboard_dataset_version_positive check (version > 0)
);
create unique index if not exists ux_dashboard_dataset_key on dashboard.dataset (tenant_id, dataset_key);
create index if not exists ix_dataset_tenant_id on dashboard.dataset (tenant_id);

create table if not exists dashboard.monitor_projection_applied_event (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  projection_name varchar(80) not null,
  event_id uuid not null,
  event_type varchar(80) not null,
  event_schema_version integer not null,
  aggregate_version integer not null,
  occurred_at timestamptz not null,
  applied_at timestamptz default now() not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_monitor_projection_applied_event primary key (id),
  constraint ck_dashboard_monitor_projection_name check (projection_name in ('dashboard.prescription_risk','dashboard.production','dashboard.integration_health','dashboard.pec_deadlines','dashboard.teat_measures','dashboard.portal_service_metrics','dashboard.duty_evidence','dashboard.source_freshness')),
  constraint ck_dashboard_monitor_projection_versions_positive check (event_schema_version > 0 and aggregate_version > 0)
);
create unique index if not exists ux_dashboard_monitor_projection_applied_event on dashboard.monitor_projection_applied_event (tenant_id, projection_name, event_id);
create index if not exists ix_dashboard_monitor_projection_replay on dashboard.monitor_projection_applied_event (tenant_id, projection_name, applied_at);
create index if not exists ix_monitor_projection_applied_event_tenant_id on dashboard.monitor_projection_applied_event (tenant_id);
create index if not exists ix_monitor_projection_applied_event_event_id on dashboard.monitor_projection_applied_event (event_id);

create table if not exists dashboard.prescription_risk (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  case_id uuid not null,
  clock_code varchar(1) not null,
  indicator_code varchar(20) not null,
  clock_id uuid,
  instance varchar(20),
  flag varchar(40),
  days_remaining integer,
  ceiling_on date,
  received_on date,
  case_state varchar(60),
  pool_id uuid,
  timer_code varchar(20),
  ceiling_effect varchar(20),
  ceiling_reached_on date,
  extinct_state varchar(60),
  flag_changed_at timestamptz,
  last_event_id uuid not null,
  event_schema_version integer not null,
  aggregate_version integer not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_prescription_risk primary key (id),
  constraint ck_dashboard_prescription_risk_clock check (clock_code in ('A','B','C','D')),
  constraint ck_dashboard_prescription_risk_indicator check (indicator_code ~ '^IND-DASH-[0-9]{3}$'),
  constraint ck_dashboard_prescription_risk_instance check (instance is null or instance in ('jari','cetran')),
  constraint ck_dashboard_prescription_risk_versions_positive check (event_schema_version > 0 and aggregate_version > 0)
);
create unique index if not exists ux_dashboard_prescription_risk_cell on dashboard.prescription_risk (tenant_id, case_id, clock_code);
create index if not exists ix_dashboard_prescription_risk_indicator on dashboard.prescription_risk (tenant_id, indicator_code, flag, ceiling_on);
create index if not exists ix_dashboard_prescription_risk_pool on dashboard.prescription_risk (tenant_id, pool_id, clock_code);
create index if not exists ix_prescription_risk_tenant_id on dashboard.prescription_risk (tenant_id);
create index if not exists ix_prescription_risk_case_id on dashboard.prescription_risk (case_id);
create index if not exists ix_prescription_risk_clock_id on dashboard.prescription_risk (clock_id);
create index if not exists ix_prescription_risk_pool_id on dashboard.prescription_risk (pool_id);
create index if not exists ix_prescription_risk_last_event_id on dashboard.prescription_risk (last_event_id);

create table if not exists dashboard.production (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  case_id uuid not null,
  instance varchar(20),
  period_start date not null,
  from_state varchar(60),
  current_state varchar(60) not null,
  state_changed_at timestamptz not null,
  received_on date,
  decision_kind varchar(40),
  decided_on date,
  decision_published_on date,
  session_id uuid,
  agenda_outcome varchar(40),
  transitions integer default 0 not null,
  last_event_id uuid not null,
  event_schema_version integer not null,
  aggregate_version integer not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_production primary key (id),
  constraint ck_dashboard_production_instance check (instance is null or instance in ('jari','cetran','defesa')),
  constraint ck_dashboard_production_transitions check (transitions >= 0),
  constraint ck_dashboard_production_versions_positive check (event_schema_version > 0 and aggregate_version > 0)
);
create unique index if not exists ux_dashboard_production_case on dashboard.production (tenant_id, case_id);
create index if not exists ix_dashboard_production_period on dashboard.production (tenant_id, period_start, instance, current_state);
create index if not exists ix_production_tenant_id on dashboard.production (tenant_id);
create index if not exists ix_production_case_id on dashboard.production (case_id);
create index if not exists ix_production_session_id on dashboard.production (session_id);
create index if not exists ix_production_last_event_id on dashboard.production (last_event_id);

create table if not exists dashboard.integration_health (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  period_start date not null,
  system_key varchar(40) not null,
  metric varchar(60) not null,
  metric_value numeric(14,3) default 0 not null,
  sample_count integer default 0 not null,
  last_error_code varchar(80),
  last_seen_at timestamptz,
  last_event_id uuid not null,
  event_schema_version integer not null,
  aggregate_version integer not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_integration_health primary key (id),
  constraint ck_dashboard_integration_health_counts check (sample_count >= 0),
  constraint ck_dashboard_integration_health_versions_positive check (event_schema_version > 0 and aggregate_version > 0)
);
create unique index if not exists ux_dashboard_integration_health_cell on dashboard.integration_health (tenant_id, period_start, system_key, metric);
create index if not exists ix_dashboard_integration_health_system on dashboard.integration_health (tenant_id, system_key, period_start);
create index if not exists ix_integration_health_tenant_id on dashboard.integration_health (tenant_id);
create index if not exists ix_integration_health_last_event_id on dashboard.integration_health (last_event_id);

create table if not exists dashboard.pec_deadlines (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  case_id uuid not null,
  indicator_code varchar(20) not null,
  from_state varchar(60),
  to_state varchar(60) not null,
  changed_at timestamptz not null,
  due_on date,
  legal_basis text,
  last_event_id uuid not null,
  event_schema_version integer not null,
  aggregate_version integer not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_pec_deadlines primary key (id),
  constraint ck_dashboard_pec_deadlines_indicator check (indicator_code ~ '^IND-DASH-[0-9]{3}$'),
  constraint ck_dashboard_pec_deadlines_versions_positive check (event_schema_version > 0 and aggregate_version > 0)
);
create unique index if not exists ux_dashboard_pec_deadlines_cell on dashboard.pec_deadlines (tenant_id, case_id, indicator_code);
create index if not exists ix_dashboard_pec_deadlines_indicator on dashboard.pec_deadlines (tenant_id, indicator_code, to_state, due_on);
create index if not exists ix_pec_deadlines_tenant_id on dashboard.pec_deadlines (tenant_id);
create index if not exists ix_pec_deadlines_case_id on dashboard.pec_deadlines (case_id);
create index if not exists ix_pec_deadlines_last_event_id on dashboard.pec_deadlines (last_event_id);

create table if not exists dashboard.teat_measures (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  indicator_code varchar(20) not null,
  object_kind varchar(40) not null,
  object_ref varchar(120) not null,
  state varchar(60),
  started_at timestamptz,
  ended_at timestamptz,
  deadline_at timestamptz,
  integrity_ok boolean,
  detail_json jsonb default '{}'::jsonb not null,
  last_event_id uuid not null,
  event_schema_version integer not null,
  aggregate_version integer not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_teat_measures primary key (id),
  constraint ck_dashboard_teat_measures_indicator check (indicator_code ~ '^IND-DASH-[0-9]{3}$'),
  constraint ck_dashboard_teat_measures_object_kind check (object_kind in ('administrative-measure','alcohol-procedure','ait','evidence','normative-package','operational-device','numbering-reservation')),
  constraint ck_dashboard_teat_measures_versions_positive check (event_schema_version > 0 and aggregate_version > 0)
);
create unique index if not exists ux_dashboard_teat_measures_cell on dashboard.teat_measures (tenant_id, indicator_code, object_kind, object_ref);
create index if not exists ix_dashboard_teat_measures_deadline on dashboard.teat_measures (tenant_id, indicator_code, deadline_at);
create index if not exists ix_teat_measures_tenant_id on dashboard.teat_measures (tenant_id);
create index if not exists ix_teat_measures_last_event_id on dashboard.teat_measures (last_event_id);

create table if not exists dashboard.portal_service_metrics (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  indicator_code varchar(20) not null,
  object_kind varchar(20) not null,
  object_ref varchar(120) not null,
  service_key varchar(80),
  state varchar(60),
  period_start date not null,
  opened_at timestamptz not null,
  closed_at timestamptz,
  due_on date,
  extended boolean default false not null,
  score numeric(5,2),
  detail_json jsonb default '{}'::jsonb not null,
  last_event_id uuid not null,
  event_schema_version integer not null,
  aggregate_version integer not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_portal_service_metrics primary key (id),
  constraint ck_dashboard_portal_service_metrics_indicator check (indicator_code ~ '^IND-DASH-[0-9]{3}$'),
  constraint ck_dashboard_portal_service_metrics_object_kind check (object_kind in ('request','manifestation','evaluation')),
  constraint ck_dashboard_portal_service_metrics_versions_positive check (event_schema_version > 0 and aggregate_version > 0)
);
create unique index if not exists ux_dashboard_portal_service_metrics_cell on dashboard.portal_service_metrics (tenant_id, indicator_code, object_kind, object_ref);
create index if not exists ix_dashboard_portal_service_metrics_period on dashboard.portal_service_metrics (tenant_id, indicator_code, period_start, state);
create index if not exists ix_portal_service_metrics_tenant_id on dashboard.portal_service_metrics (tenant_id);
create index if not exists ix_portal_service_metrics_last_event_id on dashboard.portal_service_metrics (last_event_id);

create table if not exists dashboard.duty_evidence (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  duty_code varchar(20) not null,
  period varchar(10) not null,
  indicator_code varchar(20),
  state varchar(40) not null,
  deadline_on date,
  opened_at timestamptz,
  proved_at timestamptz,
  late boolean default false not null,
  evidence_hash varchar(128),
  last_event_id uuid not null,
  event_schema_version integer not null,
  aggregate_version integer not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_duty_evidence primary key (id),
  constraint ck_dashboard_duty_evidence_code check (duty_code ~ '^DUTY-[A-Z0-9]+$'),
  constraint ck_dashboard_duty_evidence_period check (period ~ '^[0-9]{4}(-[0-9]{2}(-[0-9]{2})?)?$'),
  constraint ck_dashboard_duty_evidence_state check (state in ('JANELA_ABERTA','EM_APURACAO','PREPARADO','SUBMETIDO_PUBLICADO','COMPROVADO','ARQUIVADO','ATRASADO','NAO_CUMPRIDO')),
  constraint ck_dashboard_duty_evidence_indicator check (indicator_code is null or indicator_code ~ '^IND-DASH-[0-9]{3}$'),
  constraint ck_dashboard_duty_evidence_versions_positive check (event_schema_version > 0 and aggregate_version > 0)
);
create unique index if not exists ux_dashboard_duty_evidence_cell on dashboard.duty_evidence (tenant_id, duty_code, period);
create index if not exists ix_dashboard_duty_evidence_state on dashboard.duty_evidence (tenant_id, state, deadline_on);
create index if not exists ix_duty_evidence_tenant_id on dashboard.duty_evidence (tenant_id);
create index if not exists ix_duty_evidence_last_event_id on dashboard.duty_evidence (last_event_id);

select auth.create_rls_policy('dashboard', 'alert');

select auth.create_rls_policy('dashboard', 'alert_trail');

select auth.create_rls_policy('dashboard', 'duty');

select auth.create_rls_policy('dashboard', 'duty_cycle');

select auth.create_rls_policy('dashboard', 'indicator');

select auth.create_rls_policy('dashboard', 'indicator_config');

select auth.create_rls_policy('dashboard', 'bi_panel');

select auth.create_rls_policy('dashboard', 'generated_report');

select auth.create_rls_policy('dashboard', 'export_log');

select auth.create_rls_policy('dashboard', 'source');

select auth.create_rls_policy('dashboard', 'transparency_audit');

select auth.create_rls_policy('dashboard', 'dataset');

select auth.create_rls_policy('dashboard', 'monitor_projection_applied_event');

select auth.create_rls_policy('dashboard', 'prescription_risk');

select auth.create_rls_policy('dashboard', 'production');

select auth.create_rls_policy('dashboard', 'integration_health');

select auth.create_rls_policy('dashboard', 'pec_deadlines');

select auth.create_rls_policy('dashboard', 'teat_measures');

select auth.create_rls_policy('dashboard', 'portal_service_metrics');

select auth.create_rls_policy('dashboard', 'duty_evidence');

select auth.install_tenant_triggers();

grant usage on schema dashboard to role_app_backend;

grant select, insert, update, delete on all tables in schema dashboard to role_app_backend;

revoke update, delete on table dashboard.alert_trail from role_app_backend;

grant usage, select on all sequences in schema dashboard to role_app_backend;
