-- Fresh-only RAIT fixture. The case is contemporaneous with the priority policy
-- and is qualified in the same transaction that inserts it; legacy case history
-- remains exclusively in 20-fixtures-rait.sql and is never rewritten here.
select set_config('app.role', 'owner', false);
select set_config('app.tenant_id', '00000000-0000-7000-8000-00000000a001', false);

insert into inf.rait_pool (id, tenant_id, name, instance, circuit, strategy)
values (
  '00000000-0000-7000-8000-000051000001',
  '00000000-0000-7000-8000-00000000a001',
  'Defesa prévia — fixture fresh',
  'defesa_previa',
  1,
  'pull'
)
on conflict (id) do nothing;

insert into inf.rait_pool_member (id, tenant_id, pool_id, person_id, member_role, status)
values (
  '00000000-0000-7000-8000-000051010001',
  '00000000-0000-7000-8000-00000000a001',
  '00000000-0000-7000-8000-000051000001',
  '00000000-0000-4000-8000-0000b0000005',
  'secretaria',
  'ATIVO'
)
on conflict (id) do nothing;

-- The psql variable records whether this execution inserted the case. The
-- qualification therefore stays in this transaction but is never invoked for
-- an existing case on reapplication.
set local role role_app_backend;
with inserted_case as (
  insert into inf.rait_case (
  id,
  tenant_id,
  ait_id,
  protocol_number,
  instance,
  circuit,
  state,
  intake_channel,
  protocolled_at,
  last_movement_at
)
values (
  '00000000-0000-7000-8000-000051020001',
  '00000000-0000-7000-8000-00000000a001',
  '00000000-0000-7000-8000-0000f0000001',
  'RAIT-FRESH-2026-000001',
  'defesa_previa',
  1,
  'PROTOCOLADO',
  'balcao',
  '2026-09-14T09:00:00-04:00',
  '2026-09-14T09:00:00-04:00'
  )
  on conflict (id) do nothing
  returning id
)
select exists (select from inserted_case) as rait_fresh_case_inserted
\gset

\if :rait_fresh_case_inserted
select inf.rait_record_initial_priority(
  '00000000-0000-7000-8000-000051020001',
  '00000000-0000-4000-8000-0000b0000005',
  '2026-09-14T09:00:00-04:00',
  '[]'::jsonb
);
\endif
reset role;
