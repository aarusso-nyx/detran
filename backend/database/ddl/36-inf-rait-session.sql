-- Generated from BP-INF-RAIT-SESSION-001 v1.2.2 sha256:0a9063935f0017c3da8110a51763354850095992f1a56199395ef7eda620a45b

-- Regenerable-only DDL for BP-INF-RAIT-SESSION-001; request-path writes use role_app_backend.

create schema if not exists inf;

create table if not exists inf.rait_session (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  judging_body varchar(10) not null,
  state varchar(30) default 'FORMANDO_PAUTA' not null,
  scheduled_for timestamptz,
  agenda_closed_at timestamptz,
  convened_at timestamptz,
  opened_at timestamptz,
  closed_at timestamptz,
  quorum_required integer not null,
  quorum_observed integer,
  chair_member_id uuid,
  adjourned_reason varchar(60),
  extraordinary boolean default false not null,
  short_notice_ack_by uuid,
  modality varchar(20) default 'presencial' not null,
  short_notice_ack boolean default false not null,
  version integer default 1 not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_rait_session primary key (id),
  constraint ck_inf_rait_session_body check (judging_body in ('jari','cetran')),
  constraint ck_inf_rait_session_state check (state in ('FORMANDO_PAUTA','PAUTA_FECHADA','CONVOCACAO_ENVIADA','SESSAO_ABERTA','SESSAO_ADIADA','RELATORIA_LIDA','SUSTENTACAO_ORAL','VOTACAO','DESEMPATE_PRESIDENTE','DECISAO_PROCLAMADA','ATA_LAVRADA','ATA_ASSINADA')),
  constraint ck_inf_rait_session_quorum_positive check (quorum_required > 0),
  constraint ck_inf_rait_session_open_needs_quorum check (opened_at is null or (quorum_observed is not null and quorum_observed >= quorum_required)),
  constraint ck_inf_rait_session_adjourned_reason check (state <> 'SESSAO_ADIADA' or adjourned_reason is not null),
  constraint ck_inf_rait_session_modality check (modality in ('presencial','virtual','hibrida')),
  constraint ck_inf_rait_session_short_notice_ack check (short_notice_ack_by is null or short_notice_ack),
  constraint ck_inf_rait_session_version_positive check (version > 0)
);
alter table inf.rait_session add column if not exists version integer default 1 not null;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'ck_inf_rait_session_version_positive' and conrelid = 'inf.rait_session'::regclass) then
    alter table inf.rait_session add constraint ck_inf_rait_session_version_positive check (version > 0);
  end if;
end $$;
create index if not exists ix_inf_rait_session_body_state on inf.rait_session (tenant_id, judging_body, state);
create unique index if not exists ux_inf_rait_session_tenant_id on inf.rait_session (tenant_id, id);
create index if not exists ix_rait_session_tenant_id on inf.rait_session (tenant_id);
create index if not exists ix_rait_session_chair_member_id on inf.rait_session (chair_member_id);
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'ux_inf_rait_session_tenant_id' and conrelid = 'inf.rait_session'::regclass) then
    alter table inf.rait_session add constraint ux_inf_rait_session_tenant_id unique using index ux_inf_rait_session_tenant_id;
  end if;
end $$;

create table if not exists inf.rait_agenda_item (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  session_id uuid not null,
  case_id uuid not null,
  position integer not null,
  priority boolean default false not null,
  rapporteur_member_id uuid not null,
  opinion_summary text,
  opinion_analysis text,
  opinion_vote varchar(20),
  opinion_registered_at timestamptz,
  read_at timestamptz,
  proclaimed_at timestamptz,
  outcome varchar(20),
  withdrawn boolean default false not null,
  withdrawn_reason varchar(40),
  view_requested_by uuid,
  view_due_on date,
  version integer default 1 not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_rait_agenda_item primary key (id),
  constraint ck_inf_rait_agenda_item_opinion_vote check (opinion_vote is null or opinion_vote in ('provimento','nao_provimento','nao_conhecimento')),
  constraint ck_inf_rait_agenda_item_outcome check (outcome is null or outcome in ('provido','negado','nao_conhecido')),
  constraint ck_inf_rait_agenda_item_opinion_complete check (opinion_registered_at is null or (opinion_summary is not null and opinion_analysis is not null and opinion_vote is not null)),
  constraint ck_inf_rait_agenda_item_withdrawn_reason check (withdrawn = false or withdrawn_reason is not null),
  constraint ck_inf_rait_agenda_item_view_complete check ((view_requested_by is null and view_due_on is null) or (view_requested_by is not null and view_due_on is not null)),
  constraint ck_inf_rait_agenda_item_version_positive check (version > 0),
  constraint fk_inf_rait_agenda_item_session foreign key (session_id) references inf.rait_session (id),
  constraint fk_inf_rait_agenda_item_case foreign key (case_id) references inf.rait_case (id),
  constraint fk_inf_rait_agenda_item_rapporteur foreign key (rapporteur_member_id) references inf.rait_pool_member (id)
);
alter table inf.rait_agenda_item add column if not exists version integer default 1 not null;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'ck_inf_rait_agenda_item_version_positive' and conrelid = 'inf.rait_agenda_item'::regclass) then
    alter table inf.rait_agenda_item add constraint ck_inf_rait_agenda_item_version_positive check (version > 0);
  end if;
end $$;
create unique index if not exists ux_inf_rait_agenda_item_case on inf.rait_agenda_item (tenant_id, session_id, case_id);
create unique index if not exists ux_inf_rait_agenda_item_position on inf.rait_agenda_item (tenant_id, session_id, position);
create unique index if not exists ux_inf_rait_agenda_item_tenant_id on inf.rait_agenda_item (tenant_id, id);
create index if not exists ix_rait_agenda_item_tenant_id on inf.rait_agenda_item (tenant_id);
create index if not exists ix_rait_agenda_item_session_id on inf.rait_agenda_item (session_id);
create index if not exists ix_rait_agenda_item_case_id on inf.rait_agenda_item (case_id);
create index if not exists ix_rait_agenda_item_rapporteur_member_id on inf.rait_agenda_item (rapporteur_member_id);
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'ux_inf_rait_agenda_item_tenant_id' and conrelid = 'inf.rait_agenda_item'::regclass) then
    alter table inf.rait_agenda_item add constraint ux_inf_rait_agenda_item_tenant_id unique using index ux_inf_rait_agenda_item_tenant_id;
  end if;
end $$;

create table if not exists inf.rait_attendance (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  session_id uuid not null,
  member_id uuid not null,
  present boolean default false not null,
  is_chair boolean default false not null,
  is_chair_substitute boolean default false not null,
  arrived_at timestamptz,
  left_at timestamptz,
  absence_justified boolean,
  representation_block varchar(30),
  membership_kind varchar(20),
  mandate_starts_on_snapshot date,
  mandate_ends_on_snapshot date,
  institutional_seat_ref varchar(120),
  appointment_act_ref varchar(160),
  institutional_valid_from date,
  institutional_valid_to date,
  composition_snapshot_hash varchar(64),
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_rait_attendance primary key (id),
  constraint ck_inf_rait_attendance_representation_block check (representation_block is null or representation_block in ('executivo_estadual','municipal_rodoviario','sociedade_civil')),
  constraint ck_inf_rait_attendance_membership_kind check (membership_kind is null or membership_kind in ('titular','suplente')),
  constraint ck_inf_rait_attendance_composition_snapshot check (representation_block is null or (membership_kind is not null and mandate_starts_on_snapshot is not null and institutional_seat_ref is not null and btrim(institutional_seat_ref) <> '' and appointment_act_ref is not null and btrim(appointment_act_ref) <> '' and institutional_valid_from is not null and composition_snapshot_hash is not null)),
  constraint ck_inf_rait_attendance_mandate_order check (mandate_ends_on_snapshot is null or mandate_starts_on_snapshot is null or mandate_ends_on_snapshot >= mandate_starts_on_snapshot),
  constraint ck_inf_rait_attendance_institutional_validity_order check (institutional_valid_to is null or institutional_valid_from is null or institutional_valid_to >= institutional_valid_from),
  constraint ck_inf_rait_attendance_composition_snapshot_hash check (composition_snapshot_hash is null or composition_snapshot_hash ~ '^[0-9a-f]{64}$'),
  constraint fk_inf_rait_attendance_session foreign key (session_id) references inf.rait_session (id),
  constraint fk_inf_rait_attendance_member foreign key (member_id) references inf.rait_pool_member (id)
);
alter table inf.rait_attendance add column if not exists representation_block varchar(30);
alter table inf.rait_attendance add column if not exists membership_kind varchar(20);
alter table inf.rait_attendance add column if not exists mandate_starts_on_snapshot date;
alter table inf.rait_attendance add column if not exists mandate_ends_on_snapshot date;
alter table inf.rait_attendance add column if not exists institutional_seat_ref varchar(120);
alter table inf.rait_attendance add column if not exists appointment_act_ref varchar(160);
alter table inf.rait_attendance add column if not exists institutional_valid_from date;
alter table inf.rait_attendance add column if not exists institutional_valid_to date;
alter table inf.rait_attendance add column if not exists composition_snapshot_hash varchar(64);
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'ck_inf_rait_attendance_representation_block' and conrelid = 'inf.rait_attendance'::regclass) then
    alter table inf.rait_attendance add constraint ck_inf_rait_attendance_representation_block check (representation_block is null or representation_block in ('executivo_estadual','municipal_rodoviario','sociedade_civil'));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'ck_inf_rait_attendance_membership_kind' and conrelid = 'inf.rait_attendance'::regclass) then
    alter table inf.rait_attendance add constraint ck_inf_rait_attendance_membership_kind check (membership_kind is null or membership_kind in ('titular','suplente'));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'ck_inf_rait_attendance_composition_snapshot' and conrelid = 'inf.rait_attendance'::regclass) then
    alter table inf.rait_attendance add constraint ck_inf_rait_attendance_composition_snapshot check (representation_block is null or (membership_kind is not null and mandate_starts_on_snapshot is not null and institutional_seat_ref is not null and btrim(institutional_seat_ref) <> '' and appointment_act_ref is not null and btrim(appointment_act_ref) <> '' and institutional_valid_from is not null and composition_snapshot_hash is not null));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'ck_inf_rait_attendance_mandate_order' and conrelid = 'inf.rait_attendance'::regclass) then
    alter table inf.rait_attendance add constraint ck_inf_rait_attendance_mandate_order check (mandate_ends_on_snapshot is null or mandate_starts_on_snapshot is null or mandate_ends_on_snapshot >= mandate_starts_on_snapshot);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'ck_inf_rait_attendance_institutional_validity_order' and conrelid = 'inf.rait_attendance'::regclass) then
    alter table inf.rait_attendance add constraint ck_inf_rait_attendance_institutional_validity_order check (institutional_valid_to is null or institutional_valid_from is null or institutional_valid_to >= institutional_valid_from);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'ck_inf_rait_attendance_composition_snapshot_hash' and conrelid = 'inf.rait_attendance'::regclass) then
    alter table inf.rait_attendance add constraint ck_inf_rait_attendance_composition_snapshot_hash check (composition_snapshot_hash is null or composition_snapshot_hash ~ '^[0-9a-f]{64}$');
  end if;
end $$;
create unique index if not exists ux_inf_rait_attendance on inf.rait_attendance (tenant_id, session_id, member_id);
create index if not exists ix_rait_attendance_tenant_id on inf.rait_attendance (tenant_id);
create index if not exists ix_rait_attendance_session_id on inf.rait_attendance (session_id);
create index if not exists ix_rait_attendance_member_id on inf.rait_attendance (member_id);

create table if not exists inf.rait_vote (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  agenda_item_id uuid not null,
  member_id uuid not null,
  vote varchar(20) not null,
  casting_vote boolean default false not null,
  cast_at timestamptz default now() not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_rait_vote primary key (id),
  constraint ck_inf_rait_vote_value check (vote in ('provimento','nao_provimento','nao_conhecimento','abstencao')),
  constraint fk_inf_rait_vote_item foreign key (agenda_item_id) references inf.rait_agenda_item (id),
  constraint fk_inf_rait_vote_member foreign key (member_id) references inf.rait_pool_member (id)
);
create unique index if not exists ux_inf_rait_vote_member on inf.rait_vote (tenant_id, agenda_item_id, member_id);
create index if not exists ix_rait_vote_tenant_id on inf.rait_vote (tenant_id);
create index if not exists ix_rait_vote_agenda_item_id on inf.rait_vote (agenda_item_id);
create index if not exists ix_rait_vote_member_id on inf.rait_vote (member_id);

create table if not exists inf.rait_oral_argument (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  agenda_item_id uuid not null,
  requested_by_party_id uuid,
  requested_at timestamptz default now() not null,
  granted boolean,
  denial_basis varchar(120),
  held_at timestamptz,
  duration_minutes integer,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_rait_oral_argument primary key (id),
  constraint fk_inf_rait_oral_argument_item foreign key (agenda_item_id) references inf.rait_agenda_item (id)
);
create unique index if not exists ux_inf_rait_oral_argument_item on inf.rait_oral_argument (tenant_id, agenda_item_id);
create index if not exists ix_rait_oral_argument_tenant_id on inf.rait_oral_argument (tenant_id);
create index if not exists ix_rait_oral_argument_agenda_item_id on inf.rait_oral_argument (agenda_item_id);
create index if not exists ix_rait_oral_argument_requested_by_party_id on inf.rait_oral_argument (requested_by_party_id);

create table if not exists inf.rait_minutes (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  session_id uuid not null,
  content jsonb not null,
  generated_at timestamptz default now() not null,
  signed_at timestamptz,
  signed_by uuid,
  signature_kind varchar(20),
  signature_ref text,
  document_hash varchar(128),
  published_at timestamptz,
  version integer default 1 not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_rait_minutes primary key (id),
  constraint ck_inf_rait_minutes_signature_kind check (signature_kind is null or signature_kind = 'PAdES-TSA'),
  constraint ck_inf_rait_minutes_signed_complete check (signed_at is null or (signed_by is not null and signature_kind is not null and signature_ref is not null)),
  constraint ck_inf_rait_minutes_published_needs_signature check (published_at is null or signed_at is not null),
  constraint ck_inf_rait_minutes_version_positive check (version > 0),
  constraint fk_inf_rait_minutes_session foreign key (session_id) references inf.rait_session (id)
);
alter table inf.rait_minutes add column if not exists version integer default 1 not null;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'ck_inf_rait_minutes_version_positive' and conrelid = 'inf.rait_minutes'::regclass) then
    alter table inf.rait_minutes add constraint ck_inf_rait_minutes_version_positive check (version > 0);
  end if;
end $$;
create unique index if not exists ux_inf_rait_minutes_session on inf.rait_minutes (tenant_id, session_id);
create unique index if not exists ux_inf_rait_minutes_tenant_id on inf.rait_minutes (tenant_id, id);
create index if not exists ix_rait_minutes_tenant_id on inf.rait_minutes (tenant_id);
create index if not exists ix_rait_minutes_session_id on inf.rait_minutes (session_id);
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'ux_inf_rait_minutes_tenant_id' and conrelid = 'inf.rait_minutes'::regclass) then
    alter table inf.rait_minutes add constraint ux_inf_rait_minutes_tenant_id unique using index ux_inf_rait_minutes_tenant_id;
  end if;
end $$;

create table if not exists inf.rait_session_minutes_snapshot (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  session_id uuid not null,
  snapshot_version varchar(30) default 'session-minutes-v1' not null,
  snapshot jsonb not null,
  snapshot_hash varchar(64) not null,
  origin varchar(40) default 'server_session_records' not null,
  captured_at timestamptz not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_rait_session_minutes_snapshot primary key (id),
  constraint ck_inf_rait_session_minutes_snapshot_version check (snapshot_version = 'session-minutes-v1'),
  constraint ck_inf_rait_session_minutes_snapshot_hash check (snapshot_hash ~ '^[0-9a-f]{64}$'),
  constraint ck_inf_rait_session_minutes_snapshot_origin check (origin = 'server_session_records'),
  constraint fk_inf_rait_session_minutes_snapshot_session foreign key (tenant_id, session_id) references inf.rait_session (tenant_id, id)
);
create unique index if not exists ux_inf_rait_session_minutes_snapshot_session on inf.rait_session_minutes_snapshot (tenant_id, session_id);
create unique index if not exists ux_inf_rait_session_minutes_snapshot_hash on inf.rait_session_minutes_snapshot (tenant_id, session_id, snapshot_hash);
create index if not exists ix_rait_session_minutes_snapshot_tenant_id on inf.rait_session_minutes_snapshot (tenant_id);
create index if not exists ix_rait_session_minutes_snapshot_session_id on inf.rait_session_minutes_snapshot (session_id);
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'ux_inf_rait_session_minutes_snapshot_session' and conrelid = 'inf.rait_session_minutes_snapshot'::regclass) then
    alter table inf.rait_session_minutes_snapshot add constraint ux_inf_rait_session_minutes_snapshot_session unique using index ux_inf_rait_session_minutes_snapshot_session;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'ux_inf_rait_session_minutes_snapshot_hash' and conrelid = 'inf.rait_session_minutes_snapshot'::regclass) then
    alter table inf.rait_session_minutes_snapshot add constraint ux_inf_rait_session_minutes_snapshot_hash unique using index ux_inf_rait_session_minutes_snapshot_hash;
  end if;
end $$;

create table if not exists inf.rait_session_minutes_manifest (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  session_id uuid not null,
  minutes_id uuid not null,
  document_id uuid not null,
  content_hash varchar(64) not null,
  snapshot_hash varchar(64) not null,
  manifest_hash varchar(64) not null,
  document_kind varchar(40) default 'SESSION_MINUTES' not null,
  manifest_version varchar(40) not null,
  prepared_at timestamptz not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_rait_session_minutes_manifest primary key (id),
  constraint ck_inf_rait_session_minutes_manifest_content_hash check (content_hash ~ '^[0-9a-f]{64}$'),
  constraint ck_inf_rait_session_minutes_manifest_snapshot_hash check (snapshot_hash ~ '^[0-9a-f]{64}$'),
  constraint ck_inf_rait_session_minutes_manifest_hash check (manifest_hash ~ '^[0-9a-f]{64}$'),
  constraint ck_inf_rait_session_minutes_manifest_kind check (document_kind = 'SESSION_MINUTES'),
  constraint ck_inf_rait_session_minutes_manifest_version check (btrim(manifest_version) <> ''),
  constraint fk_inf_rait_session_minutes_manifest_minutes foreign key (tenant_id, minutes_id) references inf.rait_minutes (tenant_id, id),
  constraint fk_inf_rait_session_minutes_manifest_snapshot foreign key (tenant_id, session_id, snapshot_hash) references inf.rait_session_minutes_snapshot (tenant_id, session_id, snapshot_hash)
);
create unique index if not exists ux_inf_rait_session_minutes_manifest_minutes on inf.rait_session_minutes_manifest (tenant_id, minutes_id);
create unique index if not exists ux_inf_rait_session_minutes_manifest_document on inf.rait_session_minutes_manifest (tenant_id, document_id);
create unique index if not exists ux_inf_rait_session_minutes_manifest_evidence on inf.rait_session_minutes_manifest (tenant_id, minutes_id, document_id, content_hash, snapshot_hash, manifest_hash);
create index if not exists ix_rait_session_minutes_manifest_tenant_id on inf.rait_session_minutes_manifest (tenant_id);
create index if not exists ix_rait_session_minutes_manifest_session_id on inf.rait_session_minutes_manifest (session_id);
create index if not exists ix_rait_session_minutes_manifest_minutes_id on inf.rait_session_minutes_manifest (minutes_id);
create index if not exists ix_rait_session_minutes_manifest_document_id on inf.rait_session_minutes_manifest (document_id);
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'ux_inf_rait_session_minutes_manifest_minutes' and conrelid = 'inf.rait_session_minutes_manifest'::regclass) then
    alter table inf.rait_session_minutes_manifest add constraint ux_inf_rait_session_minutes_manifest_minutes unique using index ux_inf_rait_session_minutes_manifest_minutes;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'ux_inf_rait_session_minutes_manifest_document' and conrelid = 'inf.rait_session_minutes_manifest'::regclass) then
    alter table inf.rait_session_minutes_manifest add constraint ux_inf_rait_session_minutes_manifest_document unique using index ux_inf_rait_session_minutes_manifest_document;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'ux_inf_rait_session_minutes_manifest_evidence' and conrelid = 'inf.rait_session_minutes_manifest'::regclass) then
    alter table inf.rait_session_minutes_manifest add constraint ux_inf_rait_session_minutes_manifest_evidence unique using index ux_inf_rait_session_minutes_manifest_evidence;
  end if;
end $$;

create table if not exists inf.rait_minutes_required_signer (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  minutes_id uuid not null,
  person_id uuid not null,
  signer_role varchar(20) not null,
  signer_basis varchar(40) not null,
  agenda_item_id uuid,
  derived_at timestamptz not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_rait_minutes_required_signer primary key (id),
  constraint ck_inf_rait_minutes_required_signer_role check (signer_role in ('presidente','relator')),
  constraint ck_inf_rait_minutes_required_signer_basis check (signer_basis in ('effective_chair','item_rapporteur')),
  constraint ck_inf_rait_minutes_required_signer_item check ((signer_role = 'presidente' and agenda_item_id is null) or (signer_role = 'relator' and agenda_item_id is not null)),
  constraint fk_inf_rait_minutes_required_signer_minutes foreign key (tenant_id, minutes_id) references inf.rait_minutes (tenant_id, id),
  constraint fk_inf_rait_minutes_required_signer_item foreign key (tenant_id, agenda_item_id) references inf.rait_agenda_item (tenant_id, id)
);
create unique index if not exists ux_inf_rait_minutes_required_signer_person on inf.rait_minutes_required_signer (tenant_id, minutes_id, person_id);
create index if not exists ix_rait_minutes_required_signer_tenant_id on inf.rait_minutes_required_signer (tenant_id);
create index if not exists ix_rait_minutes_required_signer_minutes_id on inf.rait_minutes_required_signer (minutes_id);
create index if not exists ix_rait_minutes_required_signer_person_id on inf.rait_minutes_required_signer (person_id);
create index if not exists ix_rait_minutes_required_signer_agenda_item_id on inf.rait_minutes_required_signer (agenda_item_id);
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'ux_inf_rait_minutes_required_signer_person' and conrelid = 'inf.rait_minutes_required_signer'::regclass) then
    alter table inf.rait_minutes_required_signer add constraint ux_inf_rait_minutes_required_signer_person unique using index ux_inf_rait_minutes_required_signer_person;
  end if;
end $$;

create table if not exists inf.rait_minutes_signature_receipt (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  minutes_id uuid not null,
  document_id uuid not null,
  signer_person_id uuid not null,
  signature_ref text not null,
  receipt_digest varchar(64) not null,
  content_hash varchar(64) not null,
  snapshot_hash varchar(64) not null,
  manifest_hash varchar(64) not null,
  signature_level varchar(20) default 'PAdES-B-LT' not null,
  tsa_status varchar(10) not null,
  certificate_status varchar(10) not null,
  revocation_method varchar(4) not null,
  signed_at timestamptz not null,
  validated_at timestamptz not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_rait_minutes_signature_receipt primary key (id),
  constraint ck_inf_rait_minutes_signature_receipt_digest check (receipt_digest ~ '^[0-9a-f]{64}$'),
  constraint ck_inf_rait_minutes_signature_receipt_content_hash check (content_hash ~ '^[0-9a-f]{64}$'),
  constraint ck_inf_rait_minutes_signature_receipt_snapshot_hash check (snapshot_hash ~ '^[0-9a-f]{64}$'),
  constraint ck_inf_rait_minutes_signature_receipt_manifest_hash check (manifest_hash ~ '^[0-9a-f]{64}$'),
  constraint ck_inf_rait_minutes_signature_receipt_level check (signature_level = 'PAdES-B-LT'),
  constraint ck_inf_rait_minutes_signature_receipt_tsa check (tsa_status = 'GOOD'),
  constraint ck_inf_rait_minutes_signature_receipt_certificate check (certificate_status = 'GOOD'),
  constraint ck_inf_rait_minutes_signature_receipt_revocation check (revocation_method in ('OCSP','CRL')),
  constraint fk_inf_rait_minutes_signature_receipt_signer foreign key (tenant_id, minutes_id, signer_person_id) references inf.rait_minutes_required_signer (tenant_id, minutes_id, person_id),
  constraint fk_inf_rait_minutes_signature_receipt_manifest foreign key (tenant_id, minutes_id, document_id, content_hash, snapshot_hash, manifest_hash) references inf.rait_session_minutes_manifest (tenant_id, minutes_id, document_id, content_hash, snapshot_hash, manifest_hash)
);
create unique index if not exists ux_inf_rait_minutes_signature_receipt_signer on inf.rait_minutes_signature_receipt (tenant_id, minutes_id, document_id, signer_person_id);
create unique index if not exists ux_inf_rait_minutes_signature_receipt_digest on inf.rait_minutes_signature_receipt (tenant_id, receipt_digest);
create index if not exists ix_rait_minutes_signature_receipt_tenant_id on inf.rait_minutes_signature_receipt (tenant_id);
create index if not exists ix_rait_minutes_signature_receipt_minutes_id on inf.rait_minutes_signature_receipt (minutes_id);
create index if not exists ix_rait_minutes_signature_receipt_document_id on inf.rait_minutes_signature_receipt (document_id);
create index if not exists ix_rait_minutes_signature_receipt_signer_person_id on inf.rait_minutes_signature_receipt (signer_person_id);

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'fk_inf_rait_attendance_session_tenant' and conrelid = 'inf.rait_attendance'::regclass) then
    alter table inf.rait_attendance add constraint fk_inf_rait_attendance_session_tenant
      foreign key (tenant_id, session_id) references inf.rait_session (tenant_id, id);
  end if;
end $$;

create unique index if not exists ux_inf_rait_pool_member_tenant_id on inf.rait_pool_member (tenant_id, id);

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'fk_inf_rait_attendance_member_tenant' and conrelid = 'inf.rait_attendance'::regclass) then
    alter table inf.rait_attendance add constraint fk_inf_rait_attendance_member_tenant
      foreign key (tenant_id, member_id) references inf.rait_pool_member (tenant_id, id);
  end if;
end $$;

create or replace function inf.reject_immutable_blueprint_row()
returns trigger language plpgsql as $$ begin
  raise exception 'Immutable blueprint row cannot be changed' using errcode = '42501';
end $$;

drop trigger if exists rait_vote_immutable on inf.rait_vote;
create trigger rait_vote_immutable before update or delete on inf.rait_vote
  for each row execute function inf.reject_immutable_blueprint_row();
drop trigger if exists rait_vote_no_truncate on inf.rait_vote;
drop trigger if exists rait_vote_immutable_truncate on inf.rait_vote;
create trigger rait_vote_no_truncate before truncate on inf.rait_vote
  for each statement execute function inf.reject_immutable_blueprint_row();

drop trigger if exists rait_minutes_immutable on inf.rait_minutes;
create trigger rait_minutes_immutable before update of id, tenant_id, session_id, content, generated_at, document_hash or delete on inf.rait_minutes
  for each row execute function inf.reject_immutable_blueprint_row();
drop trigger if exists rait_minutes_no_truncate on inf.rait_minutes;
drop trigger if exists rait_minutes_immutable_truncate on inf.rait_minutes;
create trigger rait_minutes_no_truncate before truncate on inf.rait_minutes
  for each statement execute function inf.reject_immutable_blueprint_row();

drop trigger if exists rait_session_minutes_snapshot_immutable on inf.rait_session_minutes_snapshot;
create trigger rait_session_minutes_snapshot_immutable before update or delete on inf.rait_session_minutes_snapshot
  for each row execute function inf.reject_immutable_blueprint_row();
drop trigger if exists rait_session_minutes_snapshot_no_truncate on inf.rait_session_minutes_snapshot;
drop trigger if exists rait_session_minutes_snapshot_immutable_truncate on inf.rait_session_minutes_snapshot;
create trigger rait_session_minutes_snapshot_no_truncate before truncate on inf.rait_session_minutes_snapshot
  for each statement execute function inf.reject_immutable_blueprint_row();

drop trigger if exists rait_session_minutes_manifest_immutable on inf.rait_session_minutes_manifest;
create trigger rait_session_minutes_manifest_immutable before update or delete on inf.rait_session_minutes_manifest
  for each row execute function inf.reject_immutable_blueprint_row();
drop trigger if exists rait_session_minutes_manifest_no_truncate on inf.rait_session_minutes_manifest;
drop trigger if exists rait_session_minutes_manifest_immutable_truncate on inf.rait_session_minutes_manifest;
create trigger rait_session_minutes_manifest_no_truncate before truncate on inf.rait_session_minutes_manifest
  for each statement execute function inf.reject_immutable_blueprint_row();

drop trigger if exists rait_minutes_required_signer_immutable on inf.rait_minutes_required_signer;
create trigger rait_minutes_required_signer_immutable before update or delete on inf.rait_minutes_required_signer
  for each row execute function inf.reject_immutable_blueprint_row();
drop trigger if exists rait_minutes_required_signer_no_truncate on inf.rait_minutes_required_signer;
drop trigger if exists rait_minutes_required_signer_immutable_truncate on inf.rait_minutes_required_signer;
create trigger rait_minutes_required_signer_no_truncate before truncate on inf.rait_minutes_required_signer
  for each statement execute function inf.reject_immutable_blueprint_row();

drop trigger if exists rait_minutes_signature_receipt_immutable on inf.rait_minutes_signature_receipt;
create trigger rait_minutes_signature_receipt_immutable before update or delete on inf.rait_minutes_signature_receipt
  for each row execute function inf.reject_immutable_blueprint_row();
drop trigger if exists rait_minutes_signature_receipt_no_truncate on inf.rait_minutes_signature_receipt;
drop trigger if exists rait_minutes_signature_receipt_immutable_truncate on inf.rait_minutes_signature_receipt;
create trigger rait_minutes_signature_receipt_no_truncate before truncate on inf.rait_minutes_signature_receipt
  for each statement execute function inf.reject_immutable_blueprint_row();

select auth.create_rls_policy('inf', 'rait_session');

select auth.create_rls_policy('inf', 'rait_agenda_item');

select auth.create_rls_policy('inf', 'rait_attendance');

select auth.create_rls_policy('inf', 'rait_vote');

select auth.create_rls_policy('inf', 'rait_oral_argument');

select auth.create_rls_policy('inf', 'rait_minutes');

select auth.create_rls_policy('inf', 'rait_session_minutes_snapshot');

select auth.create_rls_policy('inf', 'rait_session_minutes_manifest');

select auth.create_rls_policy('inf', 'rait_minutes_required_signer');

select auth.create_rls_policy('inf', 'rait_minutes_signature_receipt');

select auth.install_tenant_triggers();

grant usage on schema inf to role_app_backend;

grant select, insert, update, delete on all tables in schema inf to role_app_backend;

grant usage, select on all sequences in schema inf to role_app_backend;
