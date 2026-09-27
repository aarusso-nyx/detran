-- Local-stack RAIT organization derivation from 40-fixtures-rait-org.sql.
-- All organization identifiers below are local and deterministic; no legacy RAIT
-- case, pool, member, session, minutes, ata, or document is copied.
-- Source-backed calendar values remain explicit; operational amounts stay pending.
select set_config('app.role', 'owner', false);
select set_config('app.tenant_id', '00000000-0000-7000-8000-00000000a001', false);

insert into inf.rait_holiday (id, tenant_id, name, holiday_on, scope, optional)
values
  ('00000000-0000-7000-8000-000039100001', '00000000-0000-7000-8000-00000000a001', 'Independência', '2026-09-07', 'nacional', false),
  ('00000000-0000-7000-8000-000039100002', '00000000-0000-7000-8000-00000000a001', 'Elevação de Manaus a Cidade (Lei Orgânica art. 437, II)', '2026-10-24', 'municipal', false)
on conflict (id) do update set
  name = excluded.name,
  holiday_on = excluded.holiday_on,
  scope = excluded.scope,
  optional = excluded.optional;

insert into inf.rait_pool (id, tenant_id, name, instance, circuit, strategy)
values ('00000000-0000-7000-8000-000061000001', '00000000-0000-7000-8000-00000000a001', 'JARI local — fixture fresh-local-stack', 'jari', 1, 'round_robin')
on conflict (id) do update set
  name = excluded.name,
  instance = excluded.instance,
  circuit = excluded.circuit,
  strategy = excluded.strategy;

insert into inf.rait_pool_member (id, tenant_id, pool_id, person_id, member_role, status)
values
  ('00000000-0000-7000-8000-000061010001', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000061000001', '00000000-0000-4000-8000-0000b0000008', 'relator', 'ATIVO'),
  ('00000000-0000-7000-8000-000061010002', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000061000001', '00000000-0000-4000-8000-0000b0000011', 'presidente', 'ATIVO')
on conflict (id) do update set
  pool_id = excluded.pool_id,
  person_id = excluded.person_id,
  member_role = excluded.member_role,
  status = excluded.status;

insert into inf.rait_session (
  id, tenant_id, judging_body, state, scheduled_for, convened_at, opened_at,
  closed_at, quorum_required, quorum_observed, chair_member_id, modality
)
values (
  '00000000-0000-7000-8000-000063000001',
  '00000000-0000-7000-8000-00000000a001',
  'jari',
  'ATA_ASSINADA',
  '2026-09-14T09:00:00-04:00',
  '2026-09-14T09:00:00-04:00',
  '2026-09-14T09:00:00-04:00',
  '2026-09-14T11:00:00-04:00',
  2,
  2,
  '00000000-0000-7000-8000-000061010002',
  'presencial'
)
on conflict (id) do update set
  state = excluded.state,
  scheduled_for = excluded.scheduled_for,
  convened_at = excluded.convened_at,
  opened_at = excluded.opened_at,
  closed_at = excluded.closed_at,
  quorum_required = excluded.quorum_required,
  quorum_observed = excluded.quorum_observed,
  chair_member_id = excluded.chair_member_id,
  modality = excluded.modality;

insert into inf.rait_minutes (id, tenant_id, session_id, content, generated_at, version)
values (
  '00000000-0000-7000-8000-000064000001',
  '00000000-0000-7000-8000-00000000a001',
  '00000000-0000-7000-8000-000063000001',
  '{"fixture":"fresh-local-stack","source_pending":true}'::jsonb,
  '2026-09-14T11:00:00-04:00',
  1
)
on conflict (id) do nothing;

insert into inf.rait_jeton_sheet (
  id, tenant_id, judging_body, period_start, period_end, state, generated_by,
  source_pending
)
values (
  '00000000-0000-7000-8000-000062000001',
  '00000000-0000-7000-8000-00000000a001',
  'jari',
  '2026-09-01',
  '2026-09-30',
  'gerada',
  '00000000-0000-4000-8000-0000b0000005',
  true
)
on conflict (id) do update set
  period_start = excluded.period_start,
  period_end = excluded.period_end,
  state = excluded.state,
  generated_by = excluded.generated_by,
  source_pending = excluded.source_pending;

insert into inf.rait_jeton_line (
  id, tenant_id, sheet_id, member_id, session_id, minutes_id,
  attendance_valid, items_reported, votes_cast, remunerated, over_cap,
  source_pending
)
values
  ('00000000-0000-7000-8000-000062010001', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000062000001', '00000000-0000-7000-8000-000061010001', '00000000-0000-7000-8000-000063000001', '00000000-0000-7000-8000-000064000001', true, 0, 0, false, false, true),
  ('00000000-0000-7000-8000-000062010002', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000062000001', '00000000-0000-7000-8000-000061010002', '00000000-0000-7000-8000-000063000001', '00000000-0000-7000-8000-000064000001', true, 0, 0, false, false, true)
on conflict (id) do update set
  sheet_id = excluded.sheet_id,
  member_id = excluded.member_id,
  session_id = excluded.session_id,
  minutes_id = excluded.minutes_id,
  attendance_valid = excluded.attendance_valid,
  items_reported = excluded.items_reported,
  votes_cast = excluded.votes_cast,
  remunerated = excluded.remunerated,
  over_cap = excluded.over_cap,
  source_pending = excluded.source_pending;
