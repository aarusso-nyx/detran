#!/usr/bin/env bash
set -Eeuo pipefail

# Ephemeral C-02-04 data. This is intentionally not part of a seed profile.
STACK_DB_NAME='detran_local_stack'
REQUESTED_DB_NAME="${DB_NAME:-$STACK_DB_NAME}"
DB_CONTAINER="${DETRAN_DB_CONTAINER:-detran-local-stack-postgres}"

die() {
  echo "detran-stack: $*" >&2
  exit 1
}

# Keep this guard byte-for-byte aligned with tools/detran-stack.sh. It is
# evaluated before the sole psql invocation below.
[[ "$REQUESTED_DB_NAME" == "$STACK_DB_NAME" ]] ||
  die "stack database is restricted to DB_NAME=$STACK_DB_NAME"

command -v docker >/dev/null 2>&1 || die 'command not found: docker'
docker exec -i "$DB_CONTAINER" psql -X -v ON_ERROR_STOP=1 -U postgres \
  -d "$STACK_DB_NAME" <<'SQL'
begin;
select set_config('app.role', 'owner', true);
select set_config('app.tenant_id', '00000000-0000-7000-8000-00000000a001', true);

insert into ch.clinic (id, tenant_id, code, cnpj, name, region_code, is_active)
values ('00000000-0000-7000-8000-0000c2040001',
        '00000000-0000-7000-8000-00000000a001', 'CH-SMOKE-TEST',
        '00000000000191', 'Clínica Smoke Teste', 'AM-MANAUS', true)
on conflict (id) do update set is_active = true, name = excluded.name;

insert into ch.professional
  (id, tenant_id, clinic_id, user_id, person_name, document_cpf,
   professional_kind, council_type, council_number, council_state, is_active)
values ('00000000-0000-7000-8000-0000c2040002',
        '00000000-0000-7000-8000-00000000a001',
        '00000000-0000-7000-8000-0000c2040001',
        '00000000-0000-4000-8000-0000b0000002', 'Médico Smoke Teste',
        '00000000002', 'MEDICO', 'CRM', 'TEST-204', 'AM', true)
on conflict (id) do update set clinic_id = excluded.clinic_id,
  user_id = excluded.user_id, is_active = true;

insert into ch.patient (id, tenant_id, clinic_id, national_id, name)
values ('00000000-0000-7000-8000-0000c2040003',
        '00000000-0000-7000-8000-00000000a001',
        '00000000-0000-7000-8000-0000c2040001', '00000000204',
        'Paciente Smoke Teste')
on conflict (id) do update set clinic_id = excluded.clinic_id;

insert into ch.biometric_station
  (id, tenant_id, clinic_id, name, fingerprint_hash, provider_code,
   device_certificate_fingerprint, lfd_capable, is_active)
values ('00000000-0000-7000-8000-0000c2040004',
        '00000000-0000-7000-8000-00000000a001',
        '00000000-0000-7000-8000-0000c2040001', 'Estação Smoke Teste',
        repeat('a', 64), 'smoke-provider', repeat('b', 64), true, true)
on conflict (id) do update set clinic_id = excluded.clinic_id, is_active = true;

insert into ch.appointment
  (id, tenant_id, clinic_id, patient_id, professional_id, scheduled_at, status)
values ('00000000-0000-7000-8000-0000c2040005',
        '00000000-0000-7000-8000-00000000a001',
        '00000000-0000-7000-8000-0000c2040001',
        '00000000-0000-7000-8000-0000c2040003',
        '00000000-0000-7000-8000-0000c2040002',
        '2030-01-01T10:00:00Z', 'SCHEDULED')
on conflict (id) do update set status = 'SCHEDULED';

insert into ch.encounter
  (id, tenant_id, clinic_id, patient_id, appointment_id, status)
values ('00000000-0000-7000-8000-0000c2040006',
        '00000000-0000-7000-8000-00000000a001',
        '00000000-0000-7000-8000-0000c2040001',
        '00000000-0000-7000-8000-0000c2040003',
        '00000000-0000-7000-8000-0000c2040005', 'OPEN')
on conflict (id) do update set status = 'OPEN';

insert into ch.medical_exam
  (id, tenant_id, encounter_id, professional_id, statutory_valid_until,
   valid_until, data, result)
values ('00000000-0000-7000-8000-0000c2040007',
        '00000000-0000-7000-8000-00000000a001',
        '00000000-0000-7000-8000-0000c2040006',
        '00000000-0000-7000-8000-0000c2040002', '2031-01-01',
        '2031-01-01', '{"fixture":"ch-smoke-204"}'::jsonb, 'APTO')
on conflict (id) do update set result = 'APTO', data = excluded.data;

insert into ch.biometric_check
  (id, tenant_id, encounter_id, clinic_id, station_id, subject_professional_id,
   kind, modality, score, lfd_score, passed, evidence_document_id,
   evidence_sha256, created_by)
values ('00000000-0000-7000-8000-0000c2040008',
        '00000000-0000-7000-8000-00000000a001',
        '00000000-0000-7000-8000-0000c2040006',
        '00000000-0000-7000-8000-0000c2040001',
        '00000000-0000-7000-8000-0000c2040004',
        '00000000-0000-7000-8000-0000c2040002', 'MEDICAL', 'FINGERPRINT',
        99.00, 99.00, true, '00000000-0000-7000-8000-0000c2040009',
        repeat('c', 64), '00000000-0000-4000-8000-0000b0000002')
on conflict (id) do update set passed = true, score = 99.00, lfd_score = 99.00;

commit;
SQL
