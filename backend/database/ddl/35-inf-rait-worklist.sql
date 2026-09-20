-- Generated from BP-INF-RAIT-WORKLIST-001 v1.4.1 sha256:fc1505677703646b1e55dc6283e1e0cce5331627fd5b9bd0ed732c1a77c00430

-- Regenerable-only DDL for BP-INF-RAIT-WORKLIST-001; request-path writes use role_app_backend.

create schema if not exists inf;

create table if not exists inf.rait_unit (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  name varchar(80) not null,
  judging_body varchar(10) not null,
  state varchar(30) default 'TURMA_ATIVA' not null,
  coordinator_member_id uuid,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_rait_unit primary key (id),
  constraint ck_inf_rait_unit_body check (judging_body in ('jari','cetran')),
  constraint ck_inf_rait_unit_state check (state in ('TURMA_ATIVA','TURMA_EM_CONSTITUICAO','TURMA_SUSPENSA'))
);
create unique index if not exists ux_inf_rait_unit_name on inf.rait_unit (tenant_id, judging_body, name);
create index if not exists ix_inf_rait_unit_state on inf.rait_unit (tenant_id, state);
create index if not exists ix_rait_unit_tenant_id on inf.rait_unit (tenant_id);
create index if not exists ix_rait_unit_coordinator_member_id on inf.rait_unit (coordinator_member_id);

create table if not exists inf.rait_pool (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  name varchar(80) not null,
  instance varchar(20) not null,
  circuit integer not null,
  strategy varchar(30) not null,
  active boolean default true not null,
  unit_id uuid,
  priority_policy varchar(30) default 'ordem_unica' not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_rait_pool primary key (id),
  constraint ck_inf_rait_pool_instance check (instance in ('defesa_previa','jari','cetran')),
  constraint ck_inf_rait_pool_strategy check (strategy in ('pull','round_robin','load_balanced')),
  constraint ck_inf_rait_pool_priority_policy check (priority_policy in ('ordem_unica')),
  constraint fk_inf_rait_pool_unit foreign key (unit_id) references inf.rait_unit (id)
);
create unique index if not exists ux_inf_rait_pool_instance on inf.rait_pool (tenant_id, instance) where unit_id is null;
create unique index if not exists ux_inf_rait_pool_instance_unit on inf.rait_pool (tenant_id, instance, unit_id) where unit_id is not null;
create index if not exists ix_rait_pool_tenant_id on inf.rait_pool (tenant_id);
create index if not exists ix_rait_pool_unit_id on inf.rait_pool (unit_id);

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
  is_substitute boolean default false not null,
  jurisdiction varchar(80),
  agency_jurisdiction_id uuid,
  representation_block varchar(30),
  institutional_seat_ref varchar(120),
  appointment_act_ref varchar(160),
  institutional_valid_from date,
  institutional_valid_to date,
  institutional_identity_hash varchar(64),
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_rait_pool_member primary key (id),
  constraint ck_inf_rait_pool_member_role check (member_role in ('analista','relator','presidente','coordenador','secretaria','autoridade')),
  constraint ck_inf_rait_pool_member_status check (status in ('ATIVO','IMPEDIDO','ADVERTIDO','AFASTADO_TEMP','MANDATO_ENCERRADO')),
  constraint ck_inf_rait_pool_member_mandate_order check (mandate_ends_on is null or mandate_starts_on is null or mandate_ends_on >= mandate_starts_on),
  constraint ck_inf_rait_pool_member_authority_jurisdiction check (member_role <> 'autoridade' or agency_jurisdiction_id is not null),
  constraint ck_inf_rait_pool_member_representation_block check (representation_block is null or representation_block in ('executivo_estadual','municipal_rodoviario','sociedade_civil')),
  constraint ck_inf_rait_pool_member_institutional_identity check (representation_block is null or (institutional_seat_ref is not null and btrim(institutional_seat_ref) <> '' and appointment_act_ref is not null and btrim(appointment_act_ref) <> '' and institutional_valid_from is not null and mandate_starts_on is not null and institutional_identity_hash is not null)),
  constraint ck_inf_rait_pool_member_institutional_validity_order check (institutional_valid_to is null or institutional_valid_from is null or institutional_valid_to >= institutional_valid_from),
  constraint ck_inf_rait_pool_member_institutional_identity_hash check (institutional_identity_hash is null or institutional_identity_hash ~ '^[0-9a-f]{64}$'),
  constraint fk_inf_rait_pool_member_pool foreign key (pool_id) references inf.rait_pool (id),
  constraint fk_inf_rait_pool_member_agency_jurisdiction foreign key (agency_jurisdiction_id) references ops.agency_jurisdiction (id)
);
alter table inf.rait_pool_member add column if not exists representation_block varchar(30);
alter table inf.rait_pool_member add column if not exists institutional_seat_ref varchar(120);
alter table inf.rait_pool_member add column if not exists appointment_act_ref varchar(160);
alter table inf.rait_pool_member add column if not exists institutional_valid_from date;
alter table inf.rait_pool_member add column if not exists institutional_valid_to date;
alter table inf.rait_pool_member add column if not exists institutional_identity_hash varchar(64);
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'ck_inf_rait_pool_member_representation_block' and conrelid = 'inf.rait_pool_member'::regclass) then
    alter table inf.rait_pool_member add constraint ck_inf_rait_pool_member_representation_block check (representation_block is null or representation_block in ('executivo_estadual','municipal_rodoviario','sociedade_civil'));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'ck_inf_rait_pool_member_institutional_identity' and conrelid = 'inf.rait_pool_member'::regclass) then
    alter table inf.rait_pool_member add constraint ck_inf_rait_pool_member_institutional_identity check (representation_block is null or (institutional_seat_ref is not null and btrim(institutional_seat_ref) <> '' and appointment_act_ref is not null and btrim(appointment_act_ref) <> '' and institutional_valid_from is not null and mandate_starts_on is not null and institutional_identity_hash is not null));
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'ck_inf_rait_pool_member_institutional_validity_order' and conrelid = 'inf.rait_pool_member'::regclass) then
    alter table inf.rait_pool_member add constraint ck_inf_rait_pool_member_institutional_validity_order check (institutional_valid_to is null or institutional_valid_from is null or institutional_valid_to >= institutional_valid_from);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'ck_inf_rait_pool_member_institutional_identity_hash' and conrelid = 'inf.rait_pool_member'::regclass) then
    alter table inf.rait_pool_member add constraint ck_inf_rait_pool_member_institutional_identity_hash check (institutional_identity_hash is null or institutional_identity_hash ~ '^[0-9a-f]{64}$');
  end if;
end $$;
create unique index if not exists ux_inf_rait_pool_member on inf.rait_pool_member (tenant_id, pool_id, person_id);
create index if not exists ix_inf_rait_pool_member_agency_jurisdiction on inf.rait_pool_member (tenant_id, agency_jurisdiction_id);
create unique index if not exists ux_inf_rait_pool_member_tenant_id on inf.rait_pool_member (tenant_id, id);
create unique index if not exists ux_inf_rait_pool_member_institutional_seat on inf.rait_pool_member (tenant_id, pool_id, institutional_seat_ref, institutional_valid_from) where institutional_seat_ref is not null;
create index if not exists ix_rait_pool_member_tenant_id on inf.rait_pool_member (tenant_id);
create index if not exists ix_rait_pool_member_pool_id on inf.rait_pool_member (pool_id);
create index if not exists ix_rait_pool_member_person_id on inf.rait_pool_member (person_id);
create index if not exists ix_rait_pool_member_agency_jurisdiction_id on inf.rait_pool_member (agency_jurisdiction_id);
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'ux_inf_rait_pool_member_tenant_id' and conrelid = 'inf.rait_pool_member'::regclass) then
    alter table inf.rait_pool_member add constraint ux_inf_rait_pool_member_tenant_id unique using index ux_inf_rait_pool_member_tenant_id;
  end if;
end $$;

create table if not exists inf.rait_schedule (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  pool_id uuid not null,
  member_id uuid not null,
  kind varchar(30) not null,
  period_start date not null,
  period_end date not null,
  availability varchar(30) default 'DISPONIVEL' not null,
  wip_limit integer,
  absence_reason varchar(30),
  published_at timestamptz,
  published_by uuid,
  version integer default 1 not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_rait_schedule primary key (id),
  constraint ck_inf_rait_schedule_kind check (kind in ('escala_semanal','plantao_risco','escala_assinatura','escala_balcao')),
  constraint ck_inf_rait_schedule_availability check (availability in ('DISPONIVEL','EM_PLANTAO','AUSENTE_PROGRAMADO')),
  constraint ck_inf_rait_schedule_period_order check (period_end >= period_start),
  constraint ck_inf_rait_schedule_absence_reason check (absence_reason is null or absence_reason in ('ferias','licenca','curso','sessao_externa')),
  constraint ck_inf_rait_schedule_absence_reason_required check (availability <> 'AUSENTE_PROGRAMADO' or absence_reason is not null),
  constraint ck_inf_rait_schedule_wip_limit_non_negative check (wip_limit is null or wip_limit >= 0),
  constraint ck_inf_rait_schedule_version_positive check (version > 0),
  constraint fk_inf_rait_schedule_pool foreign key (pool_id) references inf.rait_pool (id),
  constraint fk_inf_rait_schedule_member foreign key (member_id) references inf.rait_pool_member (id)
);
alter table inf.rait_schedule add column if not exists version integer default 1 not null;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'ck_inf_rait_schedule_version_positive' and conrelid = 'inf.rait_schedule'::regclass) then
    alter table inf.rait_schedule add constraint ck_inf_rait_schedule_version_positive check (version > 0);
  end if;
end $$;
create unique index if not exists ux_inf_rait_schedule_member_period on inf.rait_schedule (tenant_id, member_id, kind, period_start);
create index if not exists ix_inf_rait_schedule_pool_period on inf.rait_schedule (tenant_id, pool_id, period_start);
create index if not exists ix_rait_schedule_tenant_id on inf.rait_schedule (tenant_id);
create index if not exists ix_rait_schedule_pool_id on inf.rait_schedule (pool_id);
create index if not exists ix_rait_schedule_member_id on inf.rait_schedule (member_id);

create table if not exists inf.rait_schedule_slot (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  schedule_id uuid not null,
  slot_on date not null,
  availability varchar(30) default 'DISPONIVEL' not null,
  absence_reason varchar(30),
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_rait_schedule_slot primary key (id),
  constraint ck_inf_rait_schedule_slot_availability check (availability in ('DISPONIVEL','EM_PLANTAO','AUSENTE_PROGRAMADO')),
  constraint ck_inf_rait_schedule_slot_absence_reason check (absence_reason is null or absence_reason in ('ferias','licenca','curso','sessao_externa')),
  constraint ck_inf_rait_schedule_slot_absence_reason_required check (availability <> 'AUSENTE_PROGRAMADO' or absence_reason is not null),
  constraint fk_inf_rait_schedule_slot_schedule foreign key (schedule_id) references inf.rait_schedule (id)
);
create unique index if not exists ux_inf_rait_schedule_slot_day on inf.rait_schedule_slot (tenant_id, schedule_id, slot_on);
create index if not exists ix_rait_schedule_slot_tenant_id on inf.rait_schedule_slot (tenant_id);
create index if not exists ix_rait_schedule_slot_schedule_id on inf.rait_schedule_slot (schedule_id);

create table if not exists inf.rait_batch (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  pool_id uuid not null,
  kind varchar(20) default 'semanal' not null,
  week_start date not null,
  state varchar(20) default 'LOTE_ABERTO' not null,
  seed varchar(64),
  opened_at timestamptz default now() not null,
  opened_by uuid,
  drawn_at timestamptz,
  accepted_at timestamptz,
  minutes_document_id uuid,
  homologated_at timestamptz,
  homologated_by uuid,
  version integer default 1 not null,
  approval_signature_ref varchar(160),
  approval_receipt_hash varchar(64),
  approval_verified_at timestamptz,
  approval_signer_person_id uuid,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_rait_batch primary key (id),
  constraint ck_inf_rait_batch_kind check (kind in ('semanal','extraordinario')),
  constraint ck_inf_rait_batch_state check (state in ('LOTE_ABERTO','LOTE_SORTEADO','LOTE_ACEITO')),
  constraint ck_inf_rait_batch_seed_required check (state = 'LOTE_ABERTO' or seed is not null),
  constraint ck_inf_rait_batch_draw_consistency check ((state = 'LOTE_ABERTO' and drawn_at is null) or (state in ('LOTE_SORTEADO','LOTE_ACEITO') and drawn_at is not null)),
  constraint ck_inf_rait_batch_accept_consistency check ((state = 'LOTE_ACEITO' and accepted_at is not null) or (state <> 'LOTE_ACEITO' and accepted_at is null)),
  constraint ck_inf_rait_batch_homologation_complete check (homologated_at is null or homologated_by is not null),
  constraint ck_inf_rait_batch_version_positive check (version > 0),
  constraint ck_inf_rait_batch_approval_receipt_hash check (approval_receipt_hash is null or approval_receipt_hash ~ '^[0-9a-f]{64}$'),
  constraint fk_inf_rait_batch_pool foreign key (pool_id) references inf.rait_pool (id)
);
alter table inf.rait_batch add column if not exists version integer default 1 not null;
alter table inf.rait_batch add column if not exists approval_signature_ref varchar(160);
alter table inf.rait_batch add column if not exists approval_receipt_hash varchar(64);
alter table inf.rait_batch add column if not exists approval_verified_at timestamptz;
alter table inf.rait_batch add column if not exists approval_signer_person_id uuid;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'ck_inf_rait_batch_version_positive' and conrelid = 'inf.rait_batch'::regclass) then
    alter table inf.rait_batch add constraint ck_inf_rait_batch_version_positive check (version > 0);
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'ck_inf_rait_batch_approval_receipt_hash' and conrelid = 'inf.rait_batch'::regclass) then
    alter table inf.rait_batch add constraint ck_inf_rait_batch_approval_receipt_hash check (approval_receipt_hash is null or approval_receipt_hash ~ '^[0-9a-f]{64}$');
  end if;
end $$;
create unique index if not exists ux_inf_rait_batch_pool_week on inf.rait_batch (tenant_id, pool_id, week_start) where kind = 'semanal';
create index if not exists ix_inf_rait_batch_state on inf.rait_batch (tenant_id, pool_id, state);
create unique index if not exists ux_inf_rait_batch_tenant_id on inf.rait_batch (tenant_id, id);
create index if not exists ix_rait_batch_tenant_id on inf.rait_batch (tenant_id);
create index if not exists ix_rait_batch_pool_id on inf.rait_batch (pool_id);
create index if not exists ix_rait_batch_minutes_document_id on inf.rait_batch (minutes_document_id);
create index if not exists ix_rait_batch_approval_signer_person_id on inf.rait_batch (approval_signer_person_id);

create table if not exists inf.rait_batch_draw_snapshot (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  batch_id uuid not null,
  snapshot_version varchar(20) not null,
  snapshot jsonb not null,
  snapshot_hash varchar(64) not null,
  origin varchar(30) default 'server_draw' not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_rait_batch_draw_snapshot primary key (id),
  constraint ck_inf_rait_batch_draw_snapshot_hash check (snapshot_hash ~ '^[0-9a-f]{64}$'),
  constraint ck_inf_rait_batch_draw_snapshot_origin check (origin = 'server_draw'),
  constraint ck_inf_rait_batch_draw_snapshot_version check (snapshot_version = 'draw-v1'),
  constraint fk_inf_rait_batch_draw_snapshot_batch foreign key (tenant_id, batch_id) references inf.rait_batch (tenant_id, id)
);
create unique index if not exists ux_inf_rait_batch_draw_snapshot_batch on inf.rait_batch_draw_snapshot (tenant_id, batch_id);
create unique index if not exists ux_inf_rait_batch_draw_snapshot_hash on inf.rait_batch_draw_snapshot (tenant_id, batch_id, snapshot_hash);
create index if not exists ix_rait_batch_draw_snapshot_tenant_id on inf.rait_batch_draw_snapshot (tenant_id);
create index if not exists ix_rait_batch_draw_snapshot_batch_id on inf.rait_batch_draw_snapshot (batch_id);

create table if not exists inf.rait_batch_minutes_manifest (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  batch_id uuid not null,
  document_id uuid not null,
  content_hash varchar(64) not null,
  snapshot_hash varchar(64) not null,
  snapshot_version varchar(20) not null,
  document_kind varchar(40) default 'BATCH_DISTRIBUTION_MINUTES' not null,
  expected_signer_person_id uuid not null,
  manifest_hash varchar(64),
  manifest_version varchar(40),
  prepared_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_rait_batch_minutes_manifest primary key (id),
  constraint ck_inf_rait_batch_minutes_manifest_content_hash check (content_hash ~ '^[0-9a-f]{64}$'),
  constraint ck_inf_rait_batch_minutes_manifest_snapshot_hash check (snapshot_hash ~ '^[0-9a-f]{64}$'),
  constraint ck_inf_rait_batch_minutes_manifest_kind check (document_kind = 'BATCH_DISTRIBUTION_MINUTES'),
  constraint ck_inf_rait_batch_minutes_manifest_version check (snapshot_version = 'draw-v1'),
  constraint ck_inf_rait_batch_minutes_manifest_manifest_hash check (manifest_hash is null or manifest_hash ~ '^[0-9a-f]{64}$'),
  constraint ck_inf_rait_batch_minutes_manifest_preparation_complete check ((manifest_hash is null and manifest_version is null and prepared_at is null) or (manifest_hash is not null and manifest_version is not null and btrim(manifest_version) <> '' and prepared_at is not null)),
  constraint fk_inf_rait_batch_minutes_manifest_batch foreign key (tenant_id, batch_id) references inf.rait_batch (tenant_id, id),
  constraint fk_inf_rait_batch_minutes_manifest_snapshot foreign key (tenant_id, batch_id, snapshot_hash) references inf.rait_batch_draw_snapshot (tenant_id, batch_id, snapshot_hash)
);
alter table inf.rait_batch_minutes_manifest add column if not exists manifest_hash varchar(64);
alter table inf.rait_batch_minutes_manifest add column if not exists manifest_version varchar(40);
alter table inf.rait_batch_minutes_manifest add column if not exists prepared_at timestamptz;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'ck_inf_rait_batch_minutes_manifest_manifest_hash' and conrelid = 'inf.rait_batch_minutes_manifest'::regclass) then
    alter table inf.rait_batch_minutes_manifest add constraint ck_inf_rait_batch_minutes_manifest_manifest_hash check (manifest_hash is null or manifest_hash ~ '^[0-9a-f]{64}$');
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'ck_inf_rait_batch_minutes_manifest_preparation_complete' and conrelid = 'inf.rait_batch_minutes_manifest'::regclass) then
    alter table inf.rait_batch_minutes_manifest add constraint ck_inf_rait_batch_minutes_manifest_preparation_complete check ((manifest_hash is null and manifest_version is null and prepared_at is null) or (manifest_hash is not null and manifest_version is not null and btrim(manifest_version) <> '' and prepared_at is not null));
  end if;
end $$;
create unique index if not exists ux_inf_rait_batch_minutes_manifest_batch on inf.rait_batch_minutes_manifest (tenant_id, batch_id);
create unique index if not exists ux_inf_rait_batch_minutes_manifest_document on inf.rait_batch_minutes_manifest (tenant_id, document_id);
create unique index if not exists ux_inf_rait_batch_minutes_manifest_batch_document on inf.rait_batch_minutes_manifest (tenant_id, batch_id, document_id);
create unique index if not exists ux_inf_rait_batch_minutes_manifest_hash on inf.rait_batch_minutes_manifest (tenant_id, batch_id, manifest_hash) where manifest_hash is not null;
create index if not exists ix_rait_batch_minutes_manifest_tenant_id on inf.rait_batch_minutes_manifest (tenant_id);
create index if not exists ix_rait_batch_minutes_manifest_batch_id on inf.rait_batch_minutes_manifest (batch_id);
create index if not exists ix_rait_batch_minutes_manifest_document_id on inf.rait_batch_minutes_manifest (document_id);
create index if not exists ix_rait_batch_minutes_manifest_expected_signer_person_id on inf.rait_batch_minutes_manifest (expected_signer_person_id);
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'ux_inf_rait_batch_minutes_manifest_batch' and conrelid = 'inf.rait_batch_minutes_manifest'::regclass) then
    alter table inf.rait_batch_minutes_manifest add constraint ux_inf_rait_batch_minutes_manifest_batch unique using index ux_inf_rait_batch_minutes_manifest_batch;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'ux_inf_rait_batch_minutes_manifest_document' and conrelid = 'inf.rait_batch_minutes_manifest'::regclass) then
    alter table inf.rait_batch_minutes_manifest add constraint ux_inf_rait_batch_minutes_manifest_document unique using index ux_inf_rait_batch_minutes_manifest_document;
  end if;
end $$;

create table if not exists inf.rait_batch_item (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  batch_id uuid not null,
  case_id uuid not null,
  position integer not null,
  member_id uuid,
  claim_due_on date,
  accepted_at timestamptz,
  declined_at timestamptz,
  decline_kind varchar(20),
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_rait_batch_item primary key (id),
  constraint ck_inf_rait_batch_item_decline_kind check (decline_kind is null or decline_kind in ('impedimento','suspeicao')),
  constraint ck_inf_rait_batch_item_decline_complete check ((declined_at is null and decline_kind is null) or (declined_at is not null and decline_kind is not null)),
  constraint ck_inf_rait_batch_item_outcome_exclusive check (accepted_at is null or declined_at is null),
  constraint ck_inf_rait_batch_item_claim_needs_member check (claim_due_on is null or member_id is not null),
  constraint fk_inf_rait_batch_item_batch foreign key (batch_id) references inf.rait_batch (id),
  constraint fk_inf_rait_batch_item_case foreign key (case_id) references inf.rait_case (id),
  constraint fk_inf_rait_batch_item_member foreign key (member_id) references inf.rait_pool_member (id)
);
create unique index if not exists ux_inf_rait_batch_item_case on inf.rait_batch_item (tenant_id, batch_id, case_id);
create unique index if not exists ux_inf_rait_batch_item_position on inf.rait_batch_item (tenant_id, batch_id, position);
create index if not exists ix_rait_batch_item_tenant_id on inf.rait_batch_item (tenant_id);
create index if not exists ix_rait_batch_item_batch_id on inf.rait_batch_item (batch_id);
create index if not exists ix_rait_batch_item_case_id on inf.rait_batch_item (case_id);
create index if not exists ix_rait_batch_item_member_id on inf.rait_batch_item (member_id);

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
  claim_due_at timestamptz,
  batch_id uuid,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_rait_assignment primary key (id),
  constraint ck_inf_rait_assignment_release_reason check (release_reason is null or release_reason in ('impedimento','afastamento','rebalanceamento','risco_prescricao','concluido')),
  constraint ck_inf_rait_assignment_release_consistency check ((active and released_at is null) or (not active and released_at is not null and release_reason is not null)),
  constraint fk_inf_rait_assignment_case foreign key (case_id) references inf.rait_case (id),
  constraint fk_inf_rait_assignment_pool foreign key (pool_id) references inf.rait_pool (id),
  constraint fk_inf_rait_assignment_member foreign key (member_id) references inf.rait_pool_member (id),
  constraint fk_inf_rait_assignment_batch foreign key (batch_id) references inf.rait_batch (id)
);
create unique index if not exists ux_inf_rait_assignment_active on inf.rait_assignment (tenant_id, case_id) where active;
create index if not exists ix_inf_rait_assignment_member on inf.rait_assignment (tenant_id, member_id) where active;
create index if not exists ix_rait_assignment_tenant_id on inf.rait_assignment (tenant_id);
create index if not exists ix_rait_assignment_case_id on inf.rait_assignment (case_id);
create index if not exists ix_rait_assignment_pool_id on inf.rait_assignment (pool_id);
create index if not exists ix_rait_assignment_member_id on inf.rait_assignment (member_id);
create index if not exists ix_rait_assignment_batch_id on inf.rait_assignment (batch_id);

create table if not exists inf.rait_impediment (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  case_id uuid not null,
  member_id uuid not null,
  basis varchar(80) not null,
  declared_at timestamptz default now() not null,
  kind varchar(20) default 'impedimento' not null,
  legal_basis varchar(160),
  decided_by uuid,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_rait_impediment primary key (id),
  constraint ck_inf_rait_impediment_kind check (kind in ('impedimento','suspeicao')),
  constraint fk_inf_rait_impediment_case foreign key (case_id) references inf.rait_case (id),
  constraint fk_inf_rait_impediment_member foreign key (member_id) references inf.rait_pool_member (id)
);
create unique index if not exists ux_inf_rait_impediment on inf.rait_impediment (tenant_id, case_id, member_id);
create index if not exists ix_rait_impediment_tenant_id on inf.rait_impediment (tenant_id);
create index if not exists ix_rait_impediment_case_id on inf.rait_impediment (case_id);
create index if not exists ix_rait_impediment_member_id on inf.rait_impediment (member_id);

create table if not exists inf.rait_substitute_duty (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  session_id uuid not null,
  member_id uuid not null,
  designated_at timestamptz default now() not null,
  designated_by uuid,
  convened_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_rait_substitute_duty primary key (id),
  constraint fk_inf_rait_substitute_duty_member foreign key (member_id) references inf.rait_pool_member (id)
);
create unique index if not exists ux_inf_rait_substitute_duty on inf.rait_substitute_duty (tenant_id, session_id, member_id);
create index if not exists ix_rait_substitute_duty_tenant_id on inf.rait_substitute_duty (tenant_id);
create index if not exists ix_rait_substitute_duty_session_id on inf.rait_substitute_duty (session_id);
create index if not exists ix_rait_substitute_duty_member_id on inf.rait_substitute_duty (member_id);

create table if not exists inf.rait_bench (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  session_id uuid not null,
  state varchar(30) default 'BANCA_PREVISTA' not null,
  confirmed_count integer default 0 not null,
  parity_observed boolean,
  confirmed_at timestamptz,
  insufficient_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_rait_bench primary key (id),
  constraint ck_inf_rait_bench_state check (state in ('BANCA_PREVISTA','BANCA_CONFIRMADA','BANCA_INSUFICIENTE')),
  constraint ck_inf_rait_bench_confirmed_complete check (state <> 'BANCA_CONFIRMADA' or confirmed_at is not null),
  constraint ck_inf_rait_bench_insufficient_complete check (state <> 'BANCA_INSUFICIENTE' or insufficient_at is not null),
  constraint ck_inf_rait_bench_confirmed_count_non_negative check (confirmed_count >= 0)
);
create unique index if not exists ux_inf_rait_bench_session on inf.rait_bench (tenant_id, session_id);
create index if not exists ix_rait_bench_tenant_id on inf.rait_bench (tenant_id);
create index if not exists ix_rait_bench_session_id on inf.rait_bench (session_id);

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
  constraint ck_inf_rait_clock_code check (clock_code in ('A','B','C','D')),
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

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'fk_inf_rait_batch_minutes_manifest' and conrelid = 'inf.rait_batch'::regclass) then
    alter table inf.rait_batch add constraint fk_inf_rait_batch_minutes_manifest
      foreign key (tenant_id, id, minutes_document_id) references inf.rait_batch_minutes_manifest (tenant_id, batch_id, document_id);
  end if;
end $$;

create or replace function inf.reject_immutable_blueprint_row()
returns trigger language plpgsql as $$ begin
  raise exception 'Immutable blueprint row cannot be changed' using errcode = '42501';
end $$;

drop trigger if exists rait_batch_draw_snapshot_immutable on inf.rait_batch_draw_snapshot;
create trigger rait_batch_draw_snapshot_immutable before update or delete on inf.rait_batch_draw_snapshot
  for each row execute function inf.reject_immutable_blueprint_row();
drop trigger if exists rait_batch_draw_snapshot_no_truncate on inf.rait_batch_draw_snapshot;
drop trigger if exists rait_batch_draw_snapshot_immutable_truncate on inf.rait_batch_draw_snapshot;
create trigger rait_batch_draw_snapshot_no_truncate before truncate on inf.rait_batch_draw_snapshot
  for each statement execute function inf.reject_immutable_blueprint_row();

drop trigger if exists rait_batch_minutes_manifest_immutable on inf.rait_batch_minutes_manifest;
create trigger rait_batch_minutes_manifest_immutable before update or delete on inf.rait_batch_minutes_manifest
  for each row execute function inf.reject_immutable_blueprint_row();
drop trigger if exists rait_batch_minutes_manifest_no_truncate on inf.rait_batch_minutes_manifest;
drop trigger if exists rait_batch_minutes_manifest_immutable_truncate on inf.rait_batch_minutes_manifest;
create trigger rait_batch_minutes_manifest_no_truncate before truncate on inf.rait_batch_minutes_manifest
  for each statement execute function inf.reject_immutable_blueprint_row();

select auth.create_rls_policy('inf', 'rait_unit');

select auth.create_rls_policy('inf', 'rait_pool');

select auth.create_rls_policy('inf', 'rait_pool_member');

select auth.create_rls_policy('inf', 'rait_schedule');

select auth.create_rls_policy('inf', 'rait_schedule_slot');

select auth.create_rls_policy('inf', 'rait_batch');

select auth.create_rls_policy('inf', 'rait_batch_draw_snapshot');

select auth.create_rls_policy('inf', 'rait_batch_minutes_manifest');

select auth.create_rls_policy('inf', 'rait_batch_item');

select auth.create_rls_policy('inf', 'rait_assignment');

select auth.create_rls_policy('inf', 'rait_impediment');

select auth.create_rls_policy('inf', 'rait_substitute_duty');

select auth.create_rls_policy('inf', 'rait_bench');

select auth.create_rls_policy('inf', 'rait_clock');

select auth.create_rls_policy('inf', 'rait_clock_alert');

select auth.install_tenant_triggers();

grant usage on schema inf to role_app_backend;

grant select, insert, update, delete on all tables in schema inf to role_app_backend;

grant usage, select on all sequences in schema inf to role_app_backend;
