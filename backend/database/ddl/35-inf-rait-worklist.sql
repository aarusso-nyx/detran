-- Generated from BP-INF-RAIT-WORKLIST-001 v1.0.0 sha256:a4378f112c84361ebe923b17329c2848218c3f266f9811c1b18090d9c79f0ee1

-- Regenerable-only DDL for BP-INF-RAIT-WORKLIST-001; request-path writes use role_app_backend.

create schema if not exists inf;

create table if not exists inf.rait_pool (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  name varchar(80) not null,
  instance varchar(20) not null,
  circuit integer not null,
  strategy varchar(30) not null,
  active boolean default true not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_rait_pool primary key (id),
  constraint ck_inf_rait_pool_instance check (instance in ('defesa_previa','jari','cetran')),
  constraint ck_inf_rait_pool_strategy check (strategy in ('pull','round_robin','load_balanced'))
);
create unique index if not exists ux_inf_rait_pool_instance on inf.rait_pool (tenant_id, instance);
create index if not exists ix_rait_pool_tenant_id on inf.rait_pool (tenant_id);

create table if not exists inf.rait_pool_member (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  pool_id uuid not null,
  person_id uuid not null,
  member_role varchar(20) not null,
  status varchar(20) default 'ATIVO' not null,
  mandate_starts_on date,
  mandate_ends_on date,
  late_opinion_count integer default 0 not null,
  unjustified_absence_count integer default 0 not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_rait_pool_member primary key (id),
  constraint ck_inf_rait_pool_member_role check (member_role in ('analista','relator','presidente','coordenador','secretaria')),
  constraint ck_inf_rait_pool_member_status check (status in ('ATIVO','IMPEDIDO','ADVERTIDO','AFASTADO_TEMP','MANDATO_ENCERRADO')),
  constraint ck_inf_rait_pool_member_mandate_order check (mandate_ends_on is null or mandate_starts_on is null or mandate_ends_on >= mandate_starts_on),
  constraint fk_inf_rait_pool_member_pool foreign key (pool_id) references inf.rait_pool (id)
);
create unique index if not exists ux_inf_rait_pool_member on inf.rait_pool_member (tenant_id, pool_id, person_id);
create index if not exists ix_rait_pool_member_tenant_id on inf.rait_pool_member (tenant_id);
create index if not exists ix_rait_pool_member_pool_id on inf.rait_pool_member (pool_id);
create index if not exists ix_rait_pool_member_person_id on inf.rait_pool_member (person_id);

create table if not exists inf.rait_assignment (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  case_id uuid not null,
  pool_id uuid not null,
  member_id uuid not null,
  assigned_at timestamptz default now() not null,
  assigned_by uuid,
  released_at timestamptz,
  release_reason varchar(30),
  active boolean default true not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_rait_assignment primary key (id),
  constraint ck_inf_rait_assignment_release_reason check (release_reason is null or release_reason in ('impedimento','afastamento','rebalanceamento','risco_prescricao','concluido')),
  constraint ck_inf_rait_assignment_release_consistency check ((active and released_at is null) or (not active and released_at is not null and release_reason is not null)),
  constraint fk_inf_rait_assignment_case foreign key (case_id) references inf.rait_case (id),
  constraint fk_inf_rait_assignment_pool foreign key (pool_id) references inf.rait_pool (id),
  constraint fk_inf_rait_assignment_member foreign key (member_id) references inf.rait_pool_member (id)
);
create unique index if not exists ux_inf_rait_assignment_active on inf.rait_assignment (tenant_id, case_id) where active;
create index if not exists ix_inf_rait_assignment_member on inf.rait_assignment (tenant_id, member_id) where active;
create index if not exists ix_rait_assignment_tenant_id on inf.rait_assignment (tenant_id);
create index if not exists ix_rait_assignment_case_id on inf.rait_assignment (case_id);
create index if not exists ix_rait_assignment_pool_id on inf.rait_assignment (pool_id);
create index if not exists ix_rait_assignment_member_id on inf.rait_assignment (member_id);

create table if not exists inf.rait_impediment (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  case_id uuid not null,
  member_id uuid not null,
  basis varchar(80) not null,
  declared_at timestamptz default now() not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_rait_impediment primary key (id),
  constraint fk_inf_rait_impediment_case foreign key (case_id) references inf.rait_case (id),
  constraint fk_inf_rait_impediment_member foreign key (member_id) references inf.rait_pool_member (id)
);
create unique index if not exists ux_inf_rait_impediment on inf.rait_impediment (tenant_id, case_id, member_id);
create index if not exists ix_rait_impediment_tenant_id on inf.rait_impediment (tenant_id);
create index if not exists ix_rait_impediment_case_id on inf.rait_impediment (case_id);
create index if not exists ix_rait_impediment_member_id on inf.rait_impediment (member_id);

create table if not exists inf.rait_clock (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  case_id uuid not null,
  clock_code varchar(1) not null,
  started_on date not null,
  ceiling_on date not null,
  flag varchar(30) default 'SEM_RISCO' not null,
  flag_changed_at timestamptz default now() not null,
  last_reset_at timestamptz,
  legal_basis varchar(160) not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_rait_clock primary key (id),
  constraint ck_inf_rait_clock_code check (clock_code in ('A','B','C')),
  constraint ck_inf_rait_clock_flag check (flag in ('SEM_RISCO','ALERTA_N1','ALERTA_N2','ALERTA_N3','CRITICO','PRESCRITO_OPERACIONAL')),
  constraint ck_inf_rait_clock_ceiling_after_start check (ceiling_on > started_on),
  constraint fk_inf_rait_clock_case foreign key (case_id) references inf.rait_case (id)
);
create unique index if not exists ux_inf_rait_clock_case_code on inf.rait_clock (tenant_id, case_id, clock_code);
create index if not exists ix_inf_rait_clock_flag on inf.rait_clock (tenant_id, flag, ceiling_on);
create index if not exists ix_rait_clock_tenant_id on inf.rait_clock (tenant_id);
create index if not exists ix_rait_clock_case_id on inf.rait_clock (case_id);

create table if not exists inf.rait_clock_alert (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  clock_id uuid not null,
  level varchar(30) not null,
  raised_at timestamptz default now() not null,
  notified_role varchar(40) not null,
  acknowledged_at timestamptz,
  acknowledged_by uuid,
  incident_ref varchar(80),
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_rait_clock_alert primary key (id),
  constraint ck_inf_rait_clock_alert_level check (level in ('SEM_RISCO','ALERTA_N1','ALERTA_N2','ALERTA_N3','CRITICO','PRESCRITO_OPERACIONAL')),
  constraint ck_inf_rait_clock_alert_incident_required check (level <> 'PRESCRITO_OPERACIONAL' or incident_ref is not null),
  constraint fk_inf_rait_clock_alert_clock foreign key (clock_id) references inf.rait_clock (id)
);
create unique index if not exists ux_inf_rait_clock_alert_level on inf.rait_clock_alert (tenant_id, clock_id, level);
create index if not exists ix_rait_clock_alert_tenant_id on inf.rait_clock_alert (tenant_id);
create index if not exists ix_rait_clock_alert_clock_id on inf.rait_clock_alert (clock_id);

select auth.create_rls_policy('inf', 'rait_pool');

select auth.create_rls_policy('inf', 'rait_pool_member');

select auth.create_rls_policy('inf', 'rait_assignment');

select auth.create_rls_policy('inf', 'rait_impediment');

select auth.create_rls_policy('inf', 'rait_clock');

select auth.create_rls_policy('inf', 'rait_clock_alert');

select auth.install_tenant_triggers();

grant usage on schema inf to role_app_backend;

grant select, insert, update, delete on all tables in schema inf to role_app_backend;

grant usage, select on all sequences in schema inf to role_app_backend;
