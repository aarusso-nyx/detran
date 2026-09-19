-- R-0010 TASK-0013 C-2-13/C-2-14: fixture sintética sem dados pessoais.
-- Duas linhas canônicas do mesmo fato possuem UUIDs distintos, mesma tupla
-- (domainEvent, aggregate.id, aggregate.version) e schemaVersion explícita.
select set_config('app.role', 'owner', false);
select set_config('app.tenant_id', '00000000-0000-7000-8000-00000000a001', false);

insert into integration.outbox
  (id, tenant_id, topic, aggregate_type, aggregate_id, payload, idempotency_key, status, created_at, available_at)
values
  ('00000000-0000-7000-8000-000072000001', '00000000-0000-7000-8000-00000000a001', 'SINISTRO_FECHADO', 'crash-record', '00000000-0000-7000-8000-00007200a001',
   '{"id":"00000000-0000-7000-8000-000072000001","type":"crash.changed","domainEvent":"SINISTRO_FECHADO","schemaVersion":1,"occurredAt":"2026-09-16T11:00:00.000Z","tenantId":"00000000-0000-7000-8000-00000000a001","aggregate":{"kind":"crash-record","id":"00000000-0000-7000-8000-00007200a001","version":1},"data":{"state":"FECHADO","municipalityCode":"1302603","severity":"SEM_VITIMA","periodStart":"2026-09-01","identityStatus":"source_pending"}}'::jsonb,
   'boat-projection-fixture-canonical-1', 'pending', '2026-09-16T12:00:00.000Z', '2026-09-16T12:00:00.000Z'),
  ('00000000-0000-7000-8000-000072000002', '00000000-0000-7000-8000-00000000a001', 'SINISTRO_FECHADO', 'crash-record', '00000000-0000-7000-8000-00007200a001',
   '{"id":"00000000-0000-7000-8000-000072000002","type":"crash.changed","domainEvent":"SINISTRO_FECHADO","schemaVersion":1,"occurredAt":"2026-09-16T11:00:00.000Z","tenantId":"00000000-0000-7000-8000-00000000a001","aggregate":{"kind":"crash-record","id":"00000000-0000-7000-8000-00007200a001","version":1},"data":{"state":"FECHADO","municipalityCode":"1302603","severity":"SEM_VITIMA","periodStart":"2026-09-01","identityStatus":"source_pending"}}'::jsonb,
   'boat-projection-fixture-canonical-2', 'pending', '2026-09-16T12:00:00.000Z', '2026-09-16T12:00:00.000Z')
on conflict (id) do update set payload = excluded.payload;
