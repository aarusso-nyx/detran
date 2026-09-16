-- TASK-0003: BOAT fixtures, deterministic and idempotent.
-- Uses only the canonical tenant and traffic agency from 00-fixtures-core.sql/25-fixtures-teat.sql.
select set_config('app.role', 'owner', false);
select set_config('app.tenant_id', '00000000-0000-7000-8000-00000000a001', false);

insert into est.crash_record (
  id, tenant_id, traffic_agency_id, crash_type, severity, state,
  national_status, occurred_at, recorded_at, location_description,
  municipality_code, uf, road_condition, weather_condition,
  lighting_condition, signage_condition, source_system, source_local_id
)
select
  f.id, '00000000-0000-7000-8000-00000000a001',
  '00000000-0000-7000-8000-0000e2000001', 'source_pending', f.severity,
  f.state, f.national_status, f.occurred_at,
  '2026-09-14T11:00:00-04:00'::timestamptz, 'fixture BOAT ' || f.state,
  '1302603', 'AM', 'source_pending', 'source_pending', 'source_pending',
  'source_pending', 'boat-fixture', f.source_local_id
from (values
  ('00000000-0000-7000-8000-0000a1000001'::uuid, 'RASCUNHO', null, 'SEM_VITIMA', '2026-09-14T10:00:00-04:00'::timestamptz, 'r10-draft'),
  ('00000000-0000-7000-8000-0000a1000002'::uuid, 'EM_ATENDIMENTO', null, 'SEM_VITIMA', '2026-09-14T10:01:00-04:00'::timestamptz, 'r10-attending'),
  ('00000000-0000-7000-8000-0000a1000003'::uuid, 'REGISTRADO', null, 'COM_VITIMA_FERIDA', '2026-09-14T10:02:00-04:00'::timestamptz, 'r10-registered-victim'),
  ('00000000-0000-7000-8000-0000a1000004'::uuid, 'PENDENTE_COMPLEMENTO', null, 'COM_VITIMA_FERIDA', '2026-09-14T10:03:00-04:00'::timestamptz, 'r10-pending-victim'),
  ('00000000-0000-7000-8000-0000a1000005'::uuid, 'VALIDADO', null, 'SEM_VITIMA', '2026-09-14T10:04:00-04:00'::timestamptz, 'r10-validated'),
  ('00000000-0000-7000-8000-0000a1000006'::uuid, 'FECHADO', null, 'SEM_VITIMA', '2026-09-14T10:05:00-04:00'::timestamptz, 'r10-closed'),
  ('00000000-0000-7000-8000-0000a1000007'::uuid, 'INTEGRADO', 'RECEBIDO', 'SEM_VITIMA', '2026-09-14T10:06:00-04:00'::timestamptz, 'r10-integrated'),
  ('00000000-0000-7000-8000-0000a1000008'::uuid, 'ARQUIVADO', 'CONSOLIDADO', 'SEM_VITIMA', '2026-09-14T10:07:00-04:00'::timestamptz, 'r10-archived'),
  ('00000000-0000-7000-8000-0000a1000009'::uuid, 'CANCELADO', null, 'SEM_VITIMA', '2026-09-14T10:08:00-04:00'::timestamptz, 'r10-cancelled'),
  ('00000000-0000-7000-8000-0000a1000010'::uuid, 'INTEGRADO', 'EM_ANALISE', 'SEM_VITIMA', '2026-09-14T10:09:00-04:00'::timestamptz, 'r10-rectifiable'),
  ('00000000-0000-7000-8000-0000a1000011'::uuid, 'INTEGRADO', 'REJEITADO', 'SEM_VITIMA', '2026-09-14T10:10:00-04:00'::timestamptz, 'r10-rejected-terminal'),
  ('00000000-0000-7000-8000-0000a1000012'::uuid, 'INTEGRADO', 'CONSOLIDADO', 'SEM_VITIMA', '2026-09-14T10:11:00-04:00'::timestamptz, 'r10-consolidated-terminal'),
  ('00000000-0000-7000-8000-0000a1000013'::uuid, 'FECHADO', null, 'SEM_VITIMA', '2026-09-14T10:12:00-04:00'::timestamptz, 'r10-no-victim')
) as f(id, state, national_status, severity, occurred_at, source_local_id)
on conflict (id) do update set
  tenant_id = excluded.tenant_id, traffic_agency_id = excluded.traffic_agency_id,
  crash_type = excluded.crash_type, severity = excluded.severity,
  state = excluded.state, national_status = excluded.national_status,
  occurred_at = excluded.occurred_at, recorded_at = excluded.recorded_at,
  location_description = excluded.location_description,
  municipality_code = excluded.municipality_code, uf = excluded.uf,
  road_condition = excluded.road_condition,
  weather_condition = excluded.weather_condition,
  lighting_condition = excluded.lighting_condition,
  signage_condition = excluded.signage_condition,
  source_system = excluded.source_system, source_local_id = excluded.source_local_id;

insert into est.crash_person (
  id, tenant_id, crash_record_id, name, document_number, role
) values (
  '00000000-0000-7000-8000-0000a2000001',
  '00000000-0000-7000-8000-00000000a001',
  '00000000-0000-7000-8000-0000a1000003', 'Pessoa vítima fixture',
  'CPF-FIXTURE-0001', 'condutor'
)
on conflict (id) do update set
  tenant_id = excluded.tenant_id, crash_record_id = excluded.crash_record_id,
  name = excluded.name, document_number = excluded.document_number,
  role = excluded.role;

insert into est.crash_victim (
  id, tenant_id, crash_record_id, crash_person_id, severity,
  death_at_scene, medical_care, hospital_destination, health_notes
) values (
  '00000000-0000-7000-8000-0000a3000001',
  '00000000-0000-7000-8000-00000000a001',
  '00000000-0000-7000-8000-0000a1000003',
  '00000000-0000-7000-8000-0000a2000001', 'COM_VITIMA_FERIDA',
  false, true, 'hospital fixture', 'fixture health data'
)
on conflict (id) do update set
  tenant_id = excluded.tenant_id, crash_record_id = excluded.crash_record_id,
  crash_person_id = excluded.crash_person_id, severity = excluded.severity,
  death_at_scene = excluded.death_at_scene, medical_care = excluded.medical_care,
  hospital_destination = excluded.hospital_destination,
  health_notes = excluded.health_notes;

insert into est.crash_person (
  id, tenant_id, crash_record_id, name, document_number, role
) values (
  '00000000-0000-7000-8000-0000a2000002',
  '00000000-0000-7000-8000-00000000a001',
  '00000000-0000-7000-8000-0000a1000004', 'Pessoa vítima pendente fixture',
  'CPF-FIXTURE-0002', 'passageiro'
)
on conflict (id) do update set
  tenant_id = excluded.tenant_id, crash_record_id = excluded.crash_record_id,
  name = excluded.name, document_number = excluded.document_number,
  role = excluded.role;

insert into est.crash_victim (
  id, tenant_id, crash_record_id, crash_person_id, severity,
  death_at_scene, medical_care, hospital_destination, health_notes
) values (
  '00000000-0000-7000-8000-0000a3000002',
  '00000000-0000-7000-8000-00000000a001',
  '00000000-0000-7000-8000-0000a1000004',
  '00000000-0000-7000-8000-0000a2000002', 'COM_VITIMA_FERIDA',
  false, true, 'hospital fixture pendente', 'fixture health data pendente'
)
on conflict (id) do update set
  tenant_id = excluded.tenant_id, crash_record_id = excluded.crash_record_id,
  crash_person_id = excluded.crash_person_id, severity = excluded.severity,
  death_at_scene = excluded.death_at_scene, medical_care = excluded.medical_care,
  hospital_destination = excluded.hospital_destination,
  health_notes = excluded.health_notes;

-- The first receipt and its later rectification exercise the non-terminal
-- RENAEST path from WF-BOAT-003. `rectification_reason` is the generated
-- schema's persisted marker for the rectification; its `national_status` is
-- the adapter mirror and is never selected by BOAT locally.
insert into est.crash_renaest_submission (
  id, tenant_id, crash_record_id, protocol, national_status, layout_version,
  submitted_at, rectification_kind, rectification_reason
) values
  (
    '00000000-0000-7000-8000-0000a4000001',
    '00000000-0000-7000-8000-00000000a001',
    '00000000-0000-7000-8000-0000a1000007',
    'R10-RENAEST-INITIAL-0001', 'RECEBIDO', 'fixture-v1',
    '2026-09-14T11:30:00-04:00'::timestamptz, null, null
  ),
  (
    '00000000-0000-7000-8000-0000a4000002',
    '00000000-0000-7000-8000-00000000a001',
    '00000000-0000-7000-8000-0000a1000010',
    'R10-RENAEST-RECTIFY-0001', 'EM_ANALISE', 'fixture-v1',
    '2026-09-14T12:00:00-04:00'::timestamptz, 'correction',
    'retificacao fixture do protocolo R10-RENAEST-RECTIFY-0001'
  )
on conflict (id) do update set
  tenant_id = excluded.tenant_id, crash_record_id = excluded.crash_record_id,
  protocol = excluded.protocol, national_status = excluded.national_status,
  layout_version = excluded.layout_version, submitted_at = excluded.submitted_at,
  rectification_kind = excluded.rectification_kind,
  rectification_reason = excluded.rectification_reason;
