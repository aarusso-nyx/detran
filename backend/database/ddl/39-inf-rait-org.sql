-- Generated from BP-INF-RAIT-ORG-001 v1.0.0 sha256:4f035821c870a58065e91330193c1d2d97076255109085c6a40e5b30690a8ba5

-- Regenerable-only DDL for BP-INF-RAIT-ORG-001; request-path writes use role_app_backend.

create schema if not exists inf;

create table if not exists inf.rait_holiday (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  name varchar(120) not null,
  holiday_on date not null,
  scope varchar(20) not null,
  optional boolean default false not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_rait_holiday primary key (id),
  constraint ck_inf_rait_holiday_scope check (scope in ('nacional','estadual','municipal'))
);
create unique index if not exists ux_inf_rait_holiday_date_scope on inf.rait_holiday (tenant_id, holiday_on, scope);
create index if not exists ix_inf_rait_holiday_date on inf.rait_holiday (tenant_id, holiday_on);
create index if not exists ix_rait_holiday_tenant_id on inf.rait_holiday (tenant_id);

create table if not exists inf.rait_suspension_act (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  reason text not null,
  legal_basis text,
  starts_on date not null,
  ends_on date not null,
  timer_codes jsonb default '[]'::jsonb not null,
  evidence_document_id uuid not null,
  signed_by uuid not null,
  signed_at timestamptz default now() not null,
  state varchar(20) default 'vigente' not null,
  reviewed_at timestamptz,
  reviewed_by uuid,
  revoked_at timestamptz,
  revoked_reason text,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_rait_suspension_act primary key (id),
  constraint ck_inf_rait_suspension_act_state check (state in ('vigente','revogado','encerrado')),
  constraint ck_inf_rait_suspension_act_period_order check (ends_on >= starts_on),
  constraint ck_inf_rait_suspension_act_timer_codes_array check (jsonb_typeof(timer_codes) = 'array'),
  constraint ck_inf_rait_suspension_act_review_complete check (reviewed_at is null or reviewed_by is not null),
  constraint ck_inf_rait_suspension_act_revoked_complete check (state <> 'revogado' or (revoked_at is not null and revoked_reason is not null))
);
create index if not exists ix_inf_rait_suspension_act_period on inf.rait_suspension_act (tenant_id, starts_on, ends_on);
create index if not exists ix_inf_rait_suspension_act_state on inf.rait_suspension_act (tenant_id, state);
create index if not exists ix_rait_suspension_act_tenant_id on inf.rait_suspension_act (tenant_id);
create index if not exists ix_rait_suspension_act_evidence_document_id on inf.rait_suspension_act (evidence_document_id);

create table if not exists inf.rait_jeton_sheet (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  judging_body varchar(10) not null,
  period_start date not null,
  period_end date not null,
  state varchar(20) default 'gerada' not null,
  generated_at timestamptz default now() not null,
  generated_by uuid,
  reviewed_at timestamptz,
  reviewed_by uuid,
  homologated_at timestamptz,
  homologated_by uuid,
  sent_at timestamptz,
  document_id uuid,
  source_pending boolean default true not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_rait_jeton_sheet primary key (id),
  constraint ck_inf_rait_jeton_sheet_body check (judging_body in ('jari','cetran')),
  constraint ck_inf_rait_jeton_sheet_state check (state in ('gerada','conferida','homologada','enviada')),
  constraint ck_inf_rait_jeton_sheet_period_order check (period_end >= period_start),
  constraint ck_inf_rait_jeton_sheet_review_complete check (state = 'gerada' or (reviewed_at is not null and reviewed_by is not null)),
  constraint ck_inf_rait_jeton_sheet_homologation_complete check (state not in ('homologada','enviada') or (homologated_at is not null and homologated_by is not null)),
  constraint ck_inf_rait_jeton_sheet_sent_complete check (state <> 'enviada' or sent_at is not null)
);
create unique index if not exists ux_inf_rait_jeton_sheet_period on inf.rait_jeton_sheet (tenant_id, judging_body, period_start);
create index if not exists ix_inf_rait_jeton_sheet_state on inf.rait_jeton_sheet (tenant_id, state);
create index if not exists ix_rait_jeton_sheet_tenant_id on inf.rait_jeton_sheet (tenant_id);
create index if not exists ix_rait_jeton_sheet_document_id on inf.rait_jeton_sheet (document_id);

create table if not exists inf.rait_jeton_line (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  sheet_id uuid not null,
  member_id uuid not null,
  session_id uuid not null,
  minutes_id uuid,
  attendance_valid boolean default false not null,
  items_reported integer default 0 not null,
  votes_cast integer default 0 not null,
  absence_kind varchar(20),
  remunerated boolean default false not null,
  over_cap boolean default false not null,
  unit_value numeric(12,2),
  amount numeric(12,2),
  source_pending boolean default true not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_rait_jeton_line primary key (id),
  constraint ck_inf_rait_jeton_line_absence_kind check (absence_kind is null or absence_kind in ('justificada','injustificada')),
  constraint ck_inf_rait_jeton_line_absence_exclusive check (absence_kind is null or not attendance_valid),
  constraint ck_inf_rait_jeton_line_counts_non_negative check (items_reported >= 0 and votes_cast >= 0),
  constraint ck_inf_rait_jeton_line_remunerated_needs_attendance check (not remunerated or attendance_valid),
  constraint ck_inf_rait_jeton_line_value_pending check ((source_pending and unit_value is null and amount is null) or (not source_pending and unit_value is not null and amount is not null)),
  constraint fk_inf_rait_jeton_line_sheet foreign key (sheet_id) references inf.rait_jeton_sheet (id),
  constraint fk_inf_rait_jeton_line_member foreign key (member_id) references inf.rait_pool_member (id),
  constraint fk_inf_rait_jeton_line_session foreign key (session_id) references inf.rait_session (id),
  constraint fk_inf_rait_jeton_line_minutes foreign key (minutes_id) references inf.rait_minutes (id)
);
create unique index if not exists ux_inf_rait_jeton_line_member_session on inf.rait_jeton_line (tenant_id, sheet_id, member_id, session_id);
create index if not exists ix_inf_rait_jeton_line_member on inf.rait_jeton_line (tenant_id, member_id);
create index if not exists ix_rait_jeton_line_tenant_id on inf.rait_jeton_line (tenant_id);
create index if not exists ix_rait_jeton_line_sheet_id on inf.rait_jeton_line (sheet_id);
create index if not exists ix_rait_jeton_line_member_id on inf.rait_jeton_line (member_id);
create index if not exists ix_rait_jeton_line_session_id on inf.rait_jeton_line (session_id);
create index if not exists ix_rait_jeton_line_minutes_id on inf.rait_jeton_line (minutes_id);

create table if not exists inf.rait_incident (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  incident_ref varchar(80) not null,
  clock_id uuid,
  case_id uuid,
  opened_at timestamptz default now() not null,
  opened_by uuid,
  responsible_id uuid,
  cause_analysis text,
  outcome text,
  legal_notified_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_rait_incident primary key (id),
  constraint ck_inf_rait_incident_ref_format check (incident_ref ~ '^INC-[0-9]{4}-[0-9]{4}$'),
  constraint ck_inf_rait_incident_target check (clock_id is not null or case_id is not null),
  constraint ck_inf_rait_incident_closed_complete check (closed_at is null or (responsible_id is not null and cause_analysis is not null and outcome is not null)),
  constraint fk_inf_rait_incident_clock foreign key (clock_id) references inf.rait_clock (id),
  constraint fk_inf_rait_incident_case foreign key (case_id) references inf.rait_case (id),
  constraint fk_inf_rait_incident_responsible foreign key (responsible_id) references inf.rait_pool_member (id)
);
create unique index if not exists ux_inf_rait_incident_ref on inf.rait_incident (tenant_id, incident_ref);
create index if not exists ix_inf_rait_incident_open on inf.rait_incident (tenant_id, opened_at) where closed_at is null;
create index if not exists ix_rait_incident_tenant_id on inf.rait_incident (tenant_id);
create index if not exists ix_rait_incident_clock_id on inf.rait_incident (clock_id);
create index if not exists ix_rait_incident_case_id on inf.rait_incident (case_id);
create index if not exists ix_rait_incident_responsible_id on inf.rait_incident (responsible_id);

create table if not exists inf.rait_quality_sample (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  period_start date not null,
  period_end date not null,
  case_id uuid not null,
  decision_id uuid,
  reviewer_member_id uuid,
  sampled_at timestamptz default now() not null,
  reviewed_at timestamptz,
  finding_kind varchar(20),
  finding_note text,
  systemic boolean default false not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_rait_quality_sample primary key (id),
  constraint ck_inf_rait_quality_sample_period_order check (period_end >= period_start),
  constraint ck_inf_rait_quality_sample_finding_kind check (finding_kind is null or finding_kind in ('fundamento','prova','coerencia','linguagem')),
  constraint ck_inf_rait_quality_sample_finding_needs_review check (finding_kind is null or reviewed_at is not null),
  constraint ck_inf_rait_quality_sample_systemic_needs_finding check (not systemic or finding_kind is not null),
  constraint fk_inf_rait_quality_sample_case foreign key (case_id) references inf.rait_case (id),
  constraint fk_inf_rait_quality_sample_decision foreign key (decision_id) references inf.rait_decision (id),
  constraint fk_inf_rait_quality_sample_reviewer foreign key (reviewer_member_id) references inf.rait_pool_member (id)
);
create unique index if not exists ux_inf_rait_quality_sample_case on inf.rait_quality_sample (tenant_id, period_start, case_id);
create index if not exists ix_inf_rait_quality_sample_period on inf.rait_quality_sample (tenant_id, period_start, period_end);
create index if not exists ix_rait_quality_sample_tenant_id on inf.rait_quality_sample (tenant_id);
create index if not exists ix_rait_quality_sample_case_id on inf.rait_quality_sample (case_id);
create index if not exists ix_rait_quality_sample_decision_id on inf.rait_quality_sample (decision_id);
create index if not exists ix_rait_quality_sample_reviewer_member_id on inf.rait_quality_sample (reviewer_member_id);

create table if not exists inf.rait_capacity_plan (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  pool_id uuid not null,
  period_start date not null,
  period_end date not null,
  arrival_estimate integer,
  capacity_estimate integer,
  queue_observed integer,
  months_over_capacity integer default 0 not null,
  measures text,
  reinforcement_requested boolean default false not null,
  unit_proposed boolean default false not null,
  registered_at timestamptz default now() not null,
  registered_by uuid,
  closed_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_rait_capacity_plan primary key (id),
  constraint ck_inf_rait_capacity_plan_period_order check (period_end >= period_start),
  constraint ck_inf_rait_capacity_plan_counts_non_negative check ((arrival_estimate is null or arrival_estimate >= 0) and (capacity_estimate is null or capacity_estimate >= 0) and (queue_observed is null or queue_observed >= 0) and months_over_capacity >= 0),
  constraint ck_inf_rait_capacity_plan_closed_needs_measure check (closed_at is null or measures is not null or reinforcement_requested),
  constraint fk_inf_rait_capacity_plan_pool foreign key (pool_id) references inf.rait_pool (id)
);
create unique index if not exists ux_inf_rait_capacity_plan_pool_period on inf.rait_capacity_plan (tenant_id, pool_id, period_start);
create index if not exists ix_inf_rait_capacity_plan_period on inf.rait_capacity_plan (tenant_id, period_start, period_end);
create index if not exists ix_rait_capacity_plan_tenant_id on inf.rait_capacity_plan (tenant_id);
create index if not exists ix_rait_capacity_plan_pool_id on inf.rait_capacity_plan (pool_id);

create table if not exists inf.rait_export (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  purpose text not null,
  scope jsonb default '{}'::jsonb not null,
  requested_by uuid not null,
  requested_at timestamptz default now() not null,
  row_count integer,
  status varchar(20) default 'solicitada' not null,
  dpo_approved_by uuid,
  dpo_approved_at timestamptz,
  generated_at timestamptz,
  document_id uuid,
  content_hash varchar(64),
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_rait_export primary key (id),
  constraint ck_inf_rait_export_status check (status in ('solicitada','aguardando_dpo','gerada')),
  constraint ck_inf_rait_export_row_count_non_negative check (row_count is null or row_count >= 0),
  constraint ck_inf_rait_export_dpo_complete check (dpo_approved_at is null or dpo_approved_by is not null),
  constraint ck_inf_rait_export_content_hash_format check (content_hash is null or content_hash ~ '^[0-9a-f]{64}$'),
  constraint ck_inf_rait_export_generated_complete check (status <> 'gerada' or (generated_at is not null and content_hash is not null and document_id is not null))
);
create index if not exists ix_inf_rait_export_status on inf.rait_export (tenant_id, status, requested_at);
create index if not exists ix_rait_export_tenant_id on inf.rait_export (tenant_id);
create index if not exists ix_rait_export_document_id on inf.rait_export (document_id);

select auth.create_rls_policy('inf', 'rait_holiday');

select auth.create_rls_policy('inf', 'rait_suspension_act');

select auth.create_rls_policy('inf', 'rait_jeton_sheet');

select auth.create_rls_policy('inf', 'rait_jeton_line');

select auth.create_rls_policy('inf', 'rait_incident');

select auth.create_rls_policy('inf', 'rait_quality_sample');

select auth.create_rls_policy('inf', 'rait_capacity_plan');

select auth.create_rls_policy('inf', 'rait_export');

select auth.install_tenant_triggers();

grant usage on schema inf to role_app_backend;

grant select, insert, update, delete on all tables in schema inf to role_app_backend;

grant usage, select on all sequences in schema inf to role_app_backend;
