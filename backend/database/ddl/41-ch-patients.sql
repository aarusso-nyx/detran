-- Generated from BP-CH-PATIENTS-001 v1.1.0 sha256:0d66678ac2689c982108492124f246cf667b4a6004a170339d827cb56e0c95e9

-- Regenerable-only DDL for BP-CH-PATIENTS-001; request-path writes use role_app_backend.

create schema if not exists ch;

create table if not exists ch.patient (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  clinic_id uuid,
  user_id uuid,
  national_id varchar(11) not null,
  name varchar(255) not null,
  social_name varchar(255),
  birth_date date,
  gender varchar(1),
  mother_name varchar(255),
  contact_email varchar(320),
  contact_phone varchar(32),
  address text,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_patient primary key (id),
  constraint ck_ch_patient_national_id check (national_id ~ '^[0-9]{11}$'),
  constraint ck_ch_patient_gender check (gender is null or gender in ('M','F','O')),
  constraint fk_ch_patient_clinic foreign key (clinic_id) references ch.clinic (id),
  constraint fk_ch_patient_user foreign key (user_id) references auth.users (id)
);
create unique index if not exists ux_ch_patient_national_id on ch.patient (tenant_id, national_id);
create index if not exists ix_ch_patient_name on ch.patient (tenant_id, name);
create index if not exists ix_ch_patient_clinic on ch.patient (tenant_id, clinic_id);
create unique index if not exists ux_ch_patient_user on ch.patient (tenant_id, user_id) where user_id is not null;
create index if not exists ix_patient_tenant_id on ch.patient (tenant_id);
create index if not exists ix_patient_clinic_id on ch.patient (clinic_id);
create index if not exists ix_patient_user_id on ch.patient (user_id);
create index if not exists ix_patient_national_id on ch.patient (national_id);

select auth.create_rls_policy('ch', 'patient');

select auth.install_tenant_triggers();

grant usage on schema ch to role_app_backend;

grant select, insert, update, delete on all tables in schema ch to role_app_backend;

grant usage, select on all sequences in schema ch to role_app_backend;
