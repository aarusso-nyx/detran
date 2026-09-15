-- Fixtures canônicas da integração do RAIT (docs/framework/arch/rait-fixtures.md §8;
-- work/rounds/R-0006/contracts/CTG-0002-modules.md §d.1/§d.4, prefixo 0000500).
-- Idempotente (upsert por id). Aplicar com backend/database/seed.sh depois de 20-fixtures-rait.sql.
-- "Hoje" das fixtures = 2026-09-14; tenant 00000000-0000-7000-8000-00000000a001.
-- rait_reconciliation não tem nenhuma FK (ADR-0020; nada entre schemas).

select set_config('app.role', 'owner', false);
select set_config('app.tenant_id', '00000000-0000-7000-8000-00000000a001', false);

-- inf.rait_reconciliation — máquina b.7, um por status, um por sistema.
insert into inf.rait_reconciliation (id, tenant_id, system, window_from, window_to, requested_by, status, divergences_count, report_document_id, resolved_at) values ('00000000-0000-7000-8000-000050000001', '00000000-0000-7000-8000-00000000a001', 'renainf', '2026-09-01', '2026-09-14', '00000000-0000-4000-8000-0000b0000017', 'solicitada', 2, null, null) on conflict (id) do update set status = excluded.status, divergences_count = excluded.divergences_count, resolved_at = excluded.resolved_at;
insert into inf.rait_reconciliation (id, tenant_id, system, window_from, window_to, requested_by, status, divergences_count, report_document_id, resolved_at) values ('00000000-0000-7000-8000-000050000002', '00000000-0000-7000-8000-00000000a001', 'renach', '2026-08-01', '2026-08-31', '00000000-0000-4000-8000-0000b0000017', 'conciliada', 1, '00000000-0000-7000-8000-000050010001', '2026-09-02T10:00:00-04:00') on conflict (id) do update set status = excluded.status, divergences_count = excluded.divergences_count, resolved_at = excluded.resolved_at;
insert into inf.rait_reconciliation (id, tenant_id, system, window_from, window_to, requested_by, status, divergences_count, report_document_id, resolved_at) values ('00000000-0000-7000-8000-000050000003', '00000000-0000-7000-8000-00000000a001', 'sne', '2026-07-01', '2026-07-31', '00000000-0000-4000-8000-0000b0000017', 'escalada', 3, null, '2026-08-05T10:00:00-04:00') on conflict (id) do update set status = excluded.status, divergences_count = excluded.divergences_count, resolved_at = excluded.resolved_at;
