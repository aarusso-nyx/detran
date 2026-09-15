-- TASK-0008: TEAT fixtures; deterministic and idempotent.
-- Storage reserved|consumed|expired|cancelled corresponde a RESERVADA|CONSUMIDA|EXPIRADA|CANCELADA (WF-TEAT-002; blueprint fixa reserved).
select set_config('app.role', 'owner', false);
select set_config('app.tenant_id', '00000000-0000-7000-8000-00000000a001', false);

-- Um AIT determinístico por estado: a seleção da tabela de referência faz a
-- fixture falhar fechada se o vocabulário não estiver aplicado.
insert into inf.ait_ait (id, tenant_id, traffic_agency_id, ait_number, series, agent_id, shift_id, device_id, framing_id, catalog_id, infraction_at, issued_at, issuance_mode, constatation_type, had_approach, location_description, uf, municipality_code, current_status, content_hash, receipt_protocol)
select ('00000000-0000-7000-8000-0000f8' || lpad(s.sort_order::text, 6, '0'))::uuid, a.tenant_id, a.traffic_agency_id,
       'TEAT-' || lpad(s.sort_order::text, 3, '0'), a.series, a.agent_id,
       a.shift_id, a.device_id, a.framing_id, a.catalog_id, a.infraction_at,
       a.issued_at, a.issuance_mode, a.constatation_type, a.had_approach,
       a.location_description, a.uf, a.municipality_code, s.code,
       case when s.code in ('FINALIZADO_LOCAL','ENFILEIRADO','TRANSMITIDO','RECEBIDO','SUSPEITO_CONCORRENCIA','VALIDANDO','ACEITO','REJEITADO','PENDENTE_CORRECAO','CORRIGIDO','INTEGRADO','PROCESSADO','ARQUIVADO','SOLICITADO_CANCEL_POSFINAL','CANCELADO_POSFINAL') then 'sha256:task-0008-' || lower(s.code) else null end,
       case when s.code in ('RECEBIDO','SUSPEITO_CONCORRENCIA','VALIDANDO','ACEITO','REJEITADO','PENDENTE_CORRECAO','CORRIGIDO','INTEGRADO','PROCESSADO','ARQUIVADO','SOLICITADO_CANCEL_POSFINAL','CANCELADO_POSFINAL') then 'TEAT-0008-' || lpad(s.sort_order::text, 3, '0') else null end
from inf.ait_state_ref s
join inf.ait_ait a on a.id = '00000000-0000-7000-8000-0000f0000001'
on conflict (id) do update set tenant_id=excluded.tenant_id, traffic_agency_id=excluded.traffic_agency_id, ait_number=excluded.ait_number, series=excluded.series, agent_id=excluded.agent_id, shift_id=excluded.shift_id, device_id=excluded.device_id, framing_id=excluded.framing_id, catalog_id=excluded.catalog_id, infraction_at=excluded.infraction_at, issued_at=excluded.issued_at, issuance_mode=excluded.issuance_mode, constatation_type=excluded.constatation_type, had_approach=excluded.had_approach, location_description=excluded.location_description, uf=excluded.uf, municipality_code=excluded.municipality_code, current_status=excluded.current_status, content_hash=excluded.content_hash, receipt_protocol=excluded.receipt_protocol;

insert into ops.ops_operational_device (id, tenant_id, traffic_agency_id, hardware_identifier_hash, model, manufacturer, os_name, os_version, status, app_version, tamper_flag)
values
 ('00000000-0000-7000-8000-0000e4000002','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','sha256:teat-device-authorized','Field X','DETRAN','android','14','authorized','1.0.0',false),
 ('00000000-0000-7000-8000-0000e4000003','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','sha256:teat-device-blocked','Field X','DETRAN','android','14','blocked','1.0.0',false),
 ('00000000-0000-7000-8000-0000e4000004','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','sha256:teat-device-tampered','Field X','DETRAN','android','14','authorized','1.0.0',true)
on conflict (id) do update set tenant_id=excluded.tenant_id, traffic_agency_id=excluded.traffic_agency_id, hardware_identifier_hash=excluded.hardware_identifier_hash, model=excluded.model, manufacturer=excluded.manufacturer, os_name=excluded.os_name, os_version=excluded.os_version, status=excluded.status, app_version=excluded.app_version, tamper_flag=excluded.tamper_flag;

-- WP-T2/source_pending: postura não autorizada distinta de blocked não vira fixture sem token persistido.

insert into ops.ait_numbering_range (id,tenant_id,traffic_agency_id,series,start_number,end_number,next_number,status,usage_mode)
-- usage_mode não tem vocabulário fechado; source_pending evita inventar um token operacional.
values ('00000000-0000-7000-8000-0000e5000001','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','F',2026000001,2026001000,2026000001,'active','source_pending')
on conflict (id) do update set tenant_id=excluded.tenant_id, traffic_agency_id=excluded.traffic_agency_id, series=excluded.series, start_number=excluded.start_number, end_number=excluded.end_number, next_number=excluded.next_number, status=excluded.status, usage_mode=excluded.usage_mode;

insert into ops.numbering_reservation (id,tenant_id,range_id,traffic_agency_id,agent_id,device_id,shift_id,idempotency_key,start_number,end_number,reserved_at,valid_until,status)
values
 ('00000000-0000-7000-8000-0000e6000001','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e5000001','00000000-0000-7000-8000-0000e2000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e4000002','00000000-0000-7000-8000-0000e3000001','teat-reserved',2026000001,2026000001,'2026-09-14T10:00:00-04:00','2026-12-31T23:59:59-04:00','reserved'),
 ('00000000-0000-7000-8000-0000e6000002','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e5000001','00000000-0000-7000-8000-0000e2000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e4000002','00000000-0000-7000-8000-0000e3000001','teat-consumed',2026000002,2026000002,'2026-09-14T10:00:00-04:00','2026-12-31T23:59:59-04:00','consumed'),
 ('00000000-0000-7000-8000-0000e6000003','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e5000001','00000000-0000-7000-8000-0000e2000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e4000002','00000000-0000-7000-8000-0000e3000001','teat-expired',2026000003,2026000003,'2026-01-01T10:00:00-04:00','2026-01-02T23:59:59-04:00','expired'),
 ('00000000-0000-7000-8000-0000e6000004','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e5000001','00000000-0000-7000-8000-0000e2000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e4000002','00000000-0000-7000-8000-0000e3000001','teat-cancelled',2026000004,2026000004,'2026-09-01T10:00:00-04:00','2026-12-31T23:59:59-04:00','cancelled')
on conflict (id) do update set tenant_id=excluded.tenant_id, range_id=excluded.range_id, traffic_agency_id=excluded.traffic_agency_id, agent_id=excluded.agent_id, device_id=excluded.device_id, shift_id=excluded.shift_id, idempotency_key=excluded.idempotency_key, start_number=excluded.start_number, end_number=excluded.end_number, reserved_at=excluded.reserved_at, valid_until=excluded.valid_until, status=excluded.status;

insert into inf.normative_mobile_package (id,tenant_id,traffic_agency_id,catalog_id,package_version,manifest_hash,package_uri,published_at,valid_until,status)
values ('00000000-0000-7000-8000-0000e7000001','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','00000000-0000-7000-8000-0000e0000001','2026.1','sha256:teat-normative-2026-1','https://fixtures.invalid/teat/2026.1','2026-09-14T10:00:00-04:00','2026-12-31','published')
on conflict (id) do update set tenant_id=excluded.tenant_id, traffic_agency_id=excluded.traffic_agency_id, catalog_id=excluded.catalog_id, package_version=excluded.package_version, manifest_hash=excluded.manifest_hash, package_uri=excluded.package_uri, published_at=excluded.published_at, valid_until=excluded.valid_until, status=excluded.status;
