-- Local-stack RAIT integration derivation from 60-fixtures-rait-integration.sql.
-- Reconciliation has no foreign keys; the requester is a fresh-profile user.
select set_config('app.role', 'owner', false);
select set_config('app.tenant_id', '00000000-0000-7000-8000-00000000a001', false);

insert into inf.rait_reconciliation (
  id, tenant_id, system, window_from, window_to, requested_by, status,
  divergences_count, report_document_id, resolved_at
)
values (
  '00000000-0000-7000-8000-000065000001',
  '00000000-0000-7000-8000-00000000a001',
  'renainf',
  '2026-09-01',
  '2026-09-14',
  '00000000-0000-4000-8000-0000b0000017',
  'solicitada',
  0,
  null,
  null
)
on conflict (id) do update set
  system = excluded.system,
  window_from = excluded.window_from,
  window_to = excluded.window_to,
  requested_by = excluded.requested_by,
  status = excluded.status,
  divergences_count = excluded.divergences_count,
  report_document_id = excluded.report_document_id,
  resolved_at = excluded.resolved_at;
