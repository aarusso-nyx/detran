-- Generated from BP-CH-ENCOUNTERS-001 v1.0.0 sha256:856ef95ad10256551df6d941644741a6c8521555366f02c422508f242704addd

-- Regenerable-only DDL for BP-CH-ENCOUNTERS-001; request-path writes use role_app_backend.

create schema if not exists ch;

create table if not exists ch.appointment (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  clinic_id uuid not null,
  patient_id uuid not null,
  professional_id uuid,
  scheduled_at timestamptz not null,
  status varchar(24) default 'SCHEDULED' not null,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_appointment primary key (id),
  constraint ck_ch_appointment_status check (status in ('SCHEDULED','CHECKED_IN','DONE','NO_SHOW','CANCELLED')),
  constraint fk_ch_appointment_clinic foreign key (clinic_id) references ch.clinic (id),
  constraint fk_ch_appointment_patient foreign key (patient_id) references ch.patient (id),
  constraint fk_ch_appointment_professional foreign key (professional_id) references ch.professional (id)
);
create unique index if not exists ux_ch_appointment_slot on ch.appointment (tenant_id, clinic_id, patient_id, scheduled_at);
create index if not exists ix_ch_appointment_schedule on ch.appointment (tenant_id, scheduled_at);
create index if not exists ix_ch_appointment_patient on ch.appointment (tenant_id, patient_id, scheduled_at);
create index if not exists ix_appointment_tenant_id on ch.appointment (tenant_id);
create index if not exists ix_appointment_clinic_id on ch.appointment (clinic_id);
create index if not exists ix_appointment_patient_id on ch.appointment (patient_id);
create index if not exists ix_appointment_professional_id on ch.appointment (professional_id);

create table if not exists ch.encounter (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  clinic_id uuid not null,
  patient_id uuid not null,
  appointment_id uuid,
  renach_process_key text,
  status varchar(32) default 'OPEN' not null,
  started_at timestamptz default now() not null,
  closed_at timestamptz,
  cancelled_at timestamptz,
  cancel_reason text,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_encounter primary key (id),
  constraint ck_ch_encounter_status check (status in ('OPEN','IN_PROGRESS','READY_FOR_SIGNATURE','SIGNED','CLOSED','CANCELLED')),
  constraint ck_ch_encounter_cancelled check (status <> 'CANCELLED' or (cancelled_at is not null and cancel_reason is not null and length(trim(cancel_reason)) > 0)),
  constraint ck_ch_encounter_closed check (status <> 'CLOSED' or closed_at is not null),
  constraint fk_ch_encounter_clinic foreign key (clinic_id) references ch.clinic (id),
  constraint fk_ch_encounter_patient foreign key (patient_id) references ch.patient (id),
  constraint fk_ch_encounter_appointment foreign key (appointment_id) references ch.appointment (id)
);
create index if not exists ix_ch_encounter_status on ch.encounter (tenant_id, status);
create index if not exists ix_ch_encounter_patient on ch.encounter (tenant_id, patient_id);
create unique index if not exists ux_ch_encounter_renach_process on ch.encounter (tenant_id, patient_id, renach_process_key) where renach_process_key is not null;
create index if not exists ix_encounter_tenant_id on ch.encounter (tenant_id);
create index if not exists ix_encounter_clinic_id on ch.encounter (clinic_id);
create index if not exists ix_encounter_patient_id on ch.encounter (patient_id);
create index if not exists ix_encounter_appointment_id on ch.encounter (appointment_id);

select auth.create_rls_policy('ch', 'appointment');

select auth.create_rls_policy('ch', 'encounter');

select auth.install_tenant_triggers();

grant usage on schema ch to role_app_backend;

grant select, insert, update, delete on all tables in schema ch to role_app_backend;

grant usage, select on all sequences in schema ch to role_app_backend;
