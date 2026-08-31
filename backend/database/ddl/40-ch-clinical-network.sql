-- Generated from BP-CH-CLINICAL-NETWORK-001 v1.1.0 sha256:6257f652f4d63bb50c213e96f5977765a32de34bf9f211bea0c1d69d6f2a54db

-- Regenerable-only DDL for BP-CH-CLINICAL-NETWORK-001; request-path writes use role_app_backend.

create schema if not exists ch;

create table if not exists ch.clinic (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  code varchar(80) not null,
  cnpj varchar(14) not null,
  name varchar(255) not null,
  legal_name varchar(255),
  municipality_code varchar(7),
  region_code varchar(40) not null,
  address text,
  contact_email varchar(320),
  contact_phone varchar(32),
  is_active boolean default true not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_clinic primary key (id)
);
create unique index if not exists ux_ch_clinic_code on ch.clinic (tenant_id, code);
create unique index if not exists ux_ch_clinic_cnpj on ch.clinic (tenant_id, cnpj);
create index if not exists ix_clinic_tenant_id on ch.clinic (tenant_id);

create table if not exists ch.professional (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  clinic_id uuid not null,
  user_id uuid,
  person_name varchar(255) not null,
  document_cpf varchar(11),
  professional_kind varchar(40) not null,
  council_type varchar(20),
  council_number varchar(80),
  council_state varchar(2),
  email varchar(320),
  phone varchar(32),
  is_active boolean default true not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_professional primary key (id),
  constraint ck_ch_professional_kind check (professional_kind in ('MEDICO','PSICOLOGO','TECNICO_BIOMETRIA','SUPERVISOR','RECEPCAO')),
  constraint ck_ch_professional_council_type check (council_type is null or council_type in ('CRM','CRP','OUTRO')),
  constraint ck_ch_professional_required_council check ((professional_kind = 'MEDICO' and council_type = 'CRM' and council_number is not null and council_state ~ '^[A-Z]{2}$') or (professional_kind = 'PSICOLOGO' and council_type = 'CRP' and council_number is not null and council_state ~ '^[A-Z]{2}$') or professional_kind in ('TECNICO_BIOMETRIA','SUPERVISOR','RECEPCAO')),
  constraint fk_ch_professional_clinic foreign key (clinic_id) references ch.clinic (id),
  constraint fk_ch_professional_user foreign key (user_id) references auth.users (id)
);
create index if not exists ix_ch_professional_kind on ch.professional (tenant_id, professional_kind, is_active);
create unique index if not exists ux_ch_professional_council on ch.professional (tenant_id, council_type, council_number) where council_type is not null and council_number is not null;
create unique index if not exists ux_ch_professional_user on ch.professional (tenant_id, user_id) where user_id is not null;
create index if not exists ix_professional_tenant_id on ch.professional (tenant_id);
create index if not exists ix_professional_clinic_id on ch.professional (clinic_id);
create index if not exists ix_professional_user_id on ch.professional (user_id);

create table if not exists ch.biometric_station (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  clinic_id uuid not null,
  name varchar(255) not null,
  fingerprint_hash varchar(128) not null,
  camera_serial varchar(120),
  provider_code varchar(80) not null,
  device_certificate_fingerprint varchar(128) not null,
  lfd_capable boolean default true not null,
  ip_address inet,
  location_hint text,
  is_active boolean default true not null,
  last_seen_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_biometric_station primary key (id),
  constraint fk_ch_biometric_station_clinic foreign key (clinic_id) references ch.clinic (id)
);
create unique index if not exists ux_ch_biometric_station_fingerprint on ch.biometric_station (tenant_id, fingerprint_hash);
create index if not exists ix_ch_biometric_station_clinic on ch.biometric_station (tenant_id, clinic_id, is_active);
create index if not exists ix_biometric_station_tenant_id on ch.biometric_station (tenant_id);
create index if not exists ix_biometric_station_clinic_id on ch.biometric_station (clinic_id);

select auth.create_rls_policy('ch', 'clinic');

select auth.create_rls_policy('ch', 'professional');

select auth.create_rls_policy('ch', 'biometric_station');

select auth.install_tenant_triggers();

grant usage on schema ch to role_app_backend;

grant select, insert, update, delete on all tables in schema ch to role_app_backend;

grant usage, select on all sequences in schema ch to role_app_backend;
