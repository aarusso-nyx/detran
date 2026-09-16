-- TASK-0004 (R-0008, CTG-0002 §9 / M20): fixtures de campo, turno, handoff e
-- sincronização do TEAT. Determinísticas e idempotentes (`on conflict (id) do update`),
-- no tenant canônico 00000000-0000-7000-8000-00000000a001 e no órgão
-- 00000000-0000-7000-8000-0000e2000001. "Hoje" das fixtures = 2026-09-14
-- (00-fixtures-core.sql), fuso -04:00 (America/Manaus).
--
-- Reutiliza sem copiar o que 25-fixtures-teat.sql já semeia: os dispositivos
-- …e4000002 (authorized), …e4000003 (blocked) e …e4000004 (tamper), a faixa
-- …e5000001, as reservas …e6000001…e6000004 e o pacote normativo …e7000001.
-- O dispositivo …e4000001 (10-fixtures-inf-ait.sql) continua **sem** linha em
-- ops.ops_operational_device de propósito: é o caso negativo canônico de
-- TEAT.MOBILE_BOOTSTRAP_SCOPE_MISMATCH (CTG-0002 §9).
--
-- Tokens de estado: ops_shift open|closed e ops_homologation active vêm do
-- blueprint; numbering_consumption 'aplicado' é do route contract §4.3
-- (CTG-0002 §3). Nada aqui inventa token: onde a fonte não fixa valor a coluna
-- recebe 'source_pending', como já faz 25-fixtures-teat.sql em `usage_mode`.
select set_config('app.role', 'owner', false);
select set_config('app.tenant_id', '00000000-0000-7000-8000-00000000a001', false);

-- Unidade operacional do órgão (BP-OPS-AGENCY-001): destino de
-- ops_agent_profile.operational_unit_id e de catalog.operationalUnits[] no bootstrap.
insert into ops.agency_unit (id, tenant_id, traffic_agency_id, name, external_code)
values ('00000000-0000-7000-8000-0000e2100001','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','Unidade Operacional Centro','UOP-CENTRO')
on conflict (id) do update set tenant_id=excluded.tenant_id, traffic_agency_id=excluded.traffic_agency_id, name=excluded.name, external_code=excluded.external_code;

-- Perfis funcionais. O id do agente apto é o mesmo uuid da persona de
-- 00-fixtures-core.sql (M20): id = user_ref = …b0000001, de modo que
-- DETRAN_LOCAL_ACTOR_ID case com ops_agent_profile.user_ref sem tradução.
-- As matrículas diferem porque ux_ops_agent_profile_… é único por
-- (tenant_id, traffic_agency_id, registration_number).
insert into ops.ops_agent_profile (id, tenant_id, traffic_agency_id, user_ref, operational_unit_id, registration_number, credential_number, functional_status, credential_valid_until, trained_at)
values
 ('00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e2100001','MAT-000001','CRED-000001','active','2027-12-31','2026-01-15T09:00:00-04:00'),
 ('00000000-0000-4000-8000-0000b0000002','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','00000000-0000-4000-8000-0000b0000002','00000000-0000-7000-8000-0000e2100001','MAT-000002','CRED-000002','inactive','2027-12-31','2026-01-15T09:00:00-04:00')
on conflict (id) do update set tenant_id=excluded.tenant_id, traffic_agency_id=excluded.traffic_agency_id, user_ref=excluded.user_ref, operational_unit_id=excluded.operational_unit_id, registration_number=excluded.registration_number, credential_number=excluded.credential_number, functional_status=excluded.functional_status, credential_valid_until=excluded.credential_valid_until, trained_at=excluded.trained_at;

-- Homologações: uma vigente e uma com laudo vencido. A vencida continua
-- status='active' de propósito — com teat.homologation.expired_behavior='warn'
-- (H.55, 05-parameters.sql) ela produz o aviso HOMOLOGATION_RENEWAL_DUE e
-- nunca o bloqueador DEVICE_NOT_HOMOLOGATED (CTG-0002 §5.3).
insert into ops.ops_homologation (id, tenant_id, traffic_agency_id, homologation_number, scope, issued_at, valid_until, document_uri, status, laudo_emitido_em, laudo_valido_ate, emissor_independente, descricao_publicada_em, descricao_publicacao_local, senatran_notificado_em)
values
 ('00000000-0000-7000-8000-0000e2200001','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','HOM-2025-0001','Talão eletrônico — emissão de AIT em campo','2025-12-01','2029-12-31','https://fixtures.invalid/teat/homologacao/2025-0001','active','2025-12-01','2029-12-31','Instituto Independente de Ensaios','2025-12-10','Diário Oficial do Estado','2025-12-15'),
 ('00000000-0000-7000-8000-0000e2200002','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','HOM-2021-0002','Talão eletrônico — laudo quadrienal vencido','2021-12-01','2029-12-31','https://fixtures.invalid/teat/homologacao/2021-0002','active','2021-12-01','2025-12-31','Instituto Independente de Ensaios','2021-12-10','Diário Oficial do Estado','2021-12-15')
on conflict (id) do update set tenant_id=excluded.tenant_id, traffic_agency_id=excluded.traffic_agency_id, homologation_number=excluded.homologation_number, scope=excluded.scope, issued_at=excluded.issued_at, valid_until=excluded.valid_until, document_uri=excluded.document_uri, status=excluded.status, laudo_emitido_em=excluded.laudo_emitido_em, laudo_valido_ate=excluded.laudo_valido_ate, emissor_independente=excluded.emissor_independente, descricao_publicada_em=excluded.descricao_publicada_em, descricao_publicacao_local=excluded.descricao_publicacao_local, senatran_notificado_em=excluded.senatran_notificado_em;

-- Versão de aplicativo permitida: 1.0.0, a mesma que ops_operational_device
-- …e4000002 declara em 25-fixtures-teat.sql. valid_to nulo = sem vencimento.
insert into ops.ops_application_version (id, tenant_id, app_type, version, build_number, status, homologation_id, altera_funcionalidade, valid_from, valid_to)
values ('00000000-0000-7000-8000-0000e2300001','00000000-0000-7000-8000-00000000a001','mobile','1.0.0','1000','active','00000000-0000-7000-8000-0000e2200001',false,'2026-01-01',null)
on conflict (id) do update set tenant_id=excluded.tenant_id, app_type=excluded.app_type, version=excluded.version, build_number=excluded.build_number, status=excluded.status, homologation_id=excluded.homologation_id, altera_funcionalidade=excluded.altera_funcionalidade, valid_from=excluded.valid_from, valid_to=excluded.valid_to;

-- Catálogo do bootstrap (CTG-0002 §6): equipe, viatura, operação e instrumento.
insert into ops.ops_team (id, tenant_id, traffic_agency_id, operational_unit_id, name, supervisor_agent_id, status)
values ('00000000-0000-7000-8000-0000e2400001','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','00000000-0000-7000-8000-0000e2100001','Equipe Alfa',null,'active')
on conflict (id) do update set tenant_id=excluded.tenant_id, traffic_agency_id=excluded.traffic_agency_id, operational_unit_id=excluded.operational_unit_id, name=excluded.name, supervisor_agent_id=excluded.supervisor_agent_id, status=excluded.status;

insert into ops.ops_patrol_vehicle (id, tenant_id, traffic_agency_id, prefix, plate, vehicle_type, status)
values ('00000000-0000-7000-8000-0000e2500001','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','VTR-0001','BRA2E19','automovel','active')
on conflict (id) do update set tenant_id=excluded.tenant_id, traffic_agency_id=excluded.traffic_agency_id, prefix=excluded.prefix, plate=excluded.plate, vehicle_type=excluded.vehicle_type, status=excluded.status;

insert into ops.ops_operation (id, tenant_id, traffic_agency_id, name, operation_type, description, planned_start_at, planned_end_at, status, objectives)
values ('00000000-0000-7000-8000-0000e2600001','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','Operação Lei Seca — Centro','fiscalizacao','Operação planejada das fixtures','2026-09-20T18:00:00-04:00','2026-09-20T23:00:00-04:00','planned','Fiscalização de alcoolemia')
on conflict (id) do update set tenant_id=excluded.tenant_id, traffic_agency_id=excluded.traffic_agency_id, name=excluded.name, operation_type=excluded.operation_type, description=excluded.description, planned_start_at=excluded.planned_start_at, planned_end_at=excluded.planned_end_at, status=excluded.status, objectives=excluded.objectives;

insert into ops.ops_measurement_instrument (id, tenant_id, traffic_agency_id, instrument_type, serial_number, brand, model, inmetro_model_approval, verification_certificate_number, initial_verification_at, last_verification_at, verification_valid_until, status)
values ('00000000-0000-7000-8000-0000e2700001','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','etilometro','ETL-000001','Fixtures','MOD-1','INMETRO-0001','CERT-0001','2026-06-30','2026-06-30','2027-06-30','approved')
on conflict (id) do update set tenant_id=excluded.tenant_id, traffic_agency_id=excluded.traffic_agency_id, instrument_type=excluded.instrument_type, serial_number=excluded.serial_number, brand=excluded.brand, model=excluded.model, inmetro_model_approval=excluded.inmetro_model_approval, verification_certificate_number=excluded.verification_certificate_number, initial_verification_at=excluded.initial_verification_at, last_verification_at=excluded.last_verification_at, verification_valid_until=excluded.verification_valid_until, status=excluded.status;

-- Turnos: …e3000001 aberto no dispositivo …e4000002 (é o shift_id que as
-- reservas …e6000001…e6000004 de 25-fixtures-teat.sql já apontam) e
-- …e3000002 fechado.
insert into ops.ops_shift (id, tenant_id, traffic_agency_id, agent_id, device_id, operational_unit_id, team_id, patrol_vehicle_id, operation_id, started_at, ended_at, start_location_json, end_location_json, status, offline_periods_count)
values
 ('00000000-0000-7000-8000-0000e3000001','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e4000002','00000000-0000-7000-8000-0000e2100001','00000000-0000-7000-8000-0000e2400001','00000000-0000-7000-8000-0000e2500001','00000000-0000-7000-8000-0000e2600001','2026-09-14T08:00:00-04:00',null,'{"latitude":-3.1019,"longitude":-60.0250,"accuracy_m":8}'::jsonb,null,'open',0),
 ('00000000-0000-7000-8000-0000e3000002','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e4000002','00000000-0000-7000-8000-0000e2100001','00000000-0000-7000-8000-0000e2400001','00000000-0000-7000-8000-0000e2500001',null,'2026-09-13T08:00:00-04:00','2026-09-13T17:00:00-04:00','{"latitude":-3.1019,"longitude":-60.0250,"accuracy_m":8}'::jsonb,'{"latitude":-3.1019,"longitude":-60.0250,"accuracy_m":8}'::jsonb,'closed',0)
on conflict (id) do update set tenant_id=excluded.tenant_id, traffic_agency_id=excluded.traffic_agency_id, agent_id=excluded.agent_id, device_id=excluded.device_id, operational_unit_id=excluded.operational_unit_id, team_id=excluded.team_id, patrol_vehicle_id=excluded.patrol_vehicle_id, operation_id=excluded.operation_id, started_at=excluded.started_at, ended_at=excluded.ended_at, start_location_json=excluded.start_location_json, end_location_json=excluded.end_location_json, status=excluded.status, offline_periods_count=excluded.offline_periods_count;

-- Declaração de incidente de dispositivo (AC-TEAT-012-4): é o que distingue
-- handoff autorizado de sessão concorrente anômala em CTG-0002 §4.7 e §5.3.
insert into ops.ops_session_handoff (id, tenant_id, shift_id, from_agent_id, to_agent_id, handed_off_at, details_json)
values ('00000000-0000-7000-8000-0000e3100001','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e3000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-4000-8000-0000b0000001','2026-09-14T12:00:00-04:00','{"failed_device_id":"00000000-0000-7000-8000-0000e4000003","reason":"Falha de bateria do coletor em campo","new_device_id":"00000000-0000-7000-8000-0000e4000002"}'::jsonb)
on conflict (id) do update set tenant_id=excluded.tenant_id, shift_id=excluded.shift_id, from_agent_id=excluded.from_agent_id, to_agent_id=excluded.to_agent_id, handed_off_at=excluded.handed_off_at, details_json=excluded.details_json;

-- Lote aceito com sequência 1: é o "último aceito" que fixa
-- expectedSequence = 2 nos casos SYNC_BATCH_SEQUENCE_REPLAYED/GAP (§4.1).
insert into ops.sync_batch (id, tenant_id, traffic_agency_id, agent_id, device_id, device_batch_id, batch_sequence, submitted_at, accepted_items, receipts_json)
values ('00000000-0000-7000-8000-0000e8000001','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e4000002','batch-001',1,'2026-09-14T11:00:00-04:00',1,'{"item_ids":["00000000-0000-7000-8000-0000e9000001"]}'::jsonb)
on conflict (id) do update set tenant_id=excluded.tenant_id, traffic_agency_id=excluded.traffic_agency_id, agent_id=excluded.agent_id, device_id=excluded.device_id, device_batch_id=excluded.device_batch_id, batch_sequence=excluded.batch_sequence, submitted_at=excluded.submitted_at, accepted_items=excluded.accepted_items, receipts_json=excluded.receipts_json;

-- Itens da fila: um aplicado (chave 'item-001') e um legado sem chave estável
-- (chave derivada `legacy:<device_id>:<local_entity_id>`, §4.2), que nunca é
-- aplicado e carrega TEAT.SYNC_LEGACY_ITEM_NOT_APPLIED.
insert into ops.sync_queue_item (id, tenant_id, traffic_agency_id, device_id, agent_id, entity_type, local_entity_id, server_entity_id, status, attempts, created_locally_at, sent_at, received_at, idempotency_key, payload_hash, payload_json, error_code, error_message)
values
 ('00000000-0000-7000-8000-0000e9000001','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','00000000-0000-7000-8000-0000e4000002','00000000-0000-4000-8000-0000b0000001','ait','00000000-0000-7000-8000-0000ed000001','00000000-0000-7000-8000-0000f8000060','applied',1,'2026-09-14T10:30:00-04:00','2026-09-14T11:00:00-04:00','2026-09-14T11:00:01-04:00','item-001','sha256:teat-item-001','{"ait":{"ait_number":"2026000002"}}'::jsonb,null,null),
 ('00000000-0000-7000-8000-0000e9000002','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','00000000-0000-7000-8000-0000e4000002','00000000-0000-4000-8000-0000b0000001','ait','00000000-0000-7000-8000-0000ed000002',null,'received',1,'2026-09-14T10:45:00-04:00','2026-09-14T11:00:00-04:00','2026-09-14T11:00:01-04:00','legacy:00000000-0000-7000-8000-0000e4000002:00000000-0000-7000-8000-0000ed000002','sha256:teat-item-002','{"ait":{"ait_number":"2026000005"}}'::jsonb,'TEAT.SYNC_LEGACY_ITEM_NOT_APPLIED',null)
on conflict (id) do update set tenant_id=excluded.tenant_id, traffic_agency_id=excluded.traffic_agency_id, device_id=excluded.device_id, agent_id=excluded.agent_id, entity_type=excluded.entity_type, local_entity_id=excluded.local_entity_id, server_entity_id=excluded.server_entity_id, status=excluded.status, attempts=excluded.attempts, created_locally_at=excluded.created_locally_at, sent_at=excluded.sent_at, received_at=excluded.received_at, idempotency_key=excluded.idempotency_key, payload_hash=excluded.payload_hash, payload_json=excluded.payload_json, error_code=excluded.error_code, error_message=excluded.error_message;

-- Recibo `applied` do item 'item-001': é o alvo de
-- GET receipts/{tenantId}/by-idempotency/{key} (recuperação de ACK perdido, §5.13).
insert into ops.sync_receipt (id, tenant_id, sync_queue_item_id, idempotency_key, entity_type, local_entity_id, server_entity_id, accepted_hash, status, reason_code, applied_at, details_json)
values ('00000000-0000-7000-8000-0000ea100001','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e9000001','item-001','ait','00000000-0000-7000-8000-0000ed000001','00000000-0000-7000-8000-0000f8000060','sha256:teat-item-001','applied',null,'2026-09-14T11:00:01-04:00',null)
on conflict (id) do update set tenant_id=excluded.tenant_id, sync_queue_item_id=excluded.sync_queue_item_id, idempotency_key=excluded.idempotency_key, entity_type=excluded.entity_type, local_entity_id=excluded.local_entity_id, server_entity_id=excluded.server_entity_id, accepted_hash=excluded.accepted_hash, status=excluded.status, reason_code=excluded.reason_code, applied_at=excluded.applied_at, details_json=excluded.details_json;

-- Conflito de concorrência aberto: allowed_resolution_actions = ['manual_review']
-- apenas (§4.7 e §5.13) — accept_server/reject/retry_after_correction em
-- sync-conflicts/{id}/resolve devolvem 409 TEAT.SYNC_ITEM_CONFLICT.
insert into ops.sync_conflict (id, tenant_id, sync_queue_item_id, conflict_type, reason_code, local_hash, server_hash, retryable, allowed_resolution_actions, description, status)
values ('00000000-0000-7000-8000-0000eb100001','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e9000002','concurrency','TEAT.SYNC_CONCURRENCY_SUSPECT',null,null,false,'["manual_review"]'::jsonb,'Mesmo agente em dispositivos distintos dentro da janela (RN-TEAT-111).','open')
on conflict (id) do update set tenant_id=excluded.tenant_id, sync_queue_item_id=excluded.sync_queue_item_id, conflict_type=excluded.conflict_type, reason_code=excluded.reason_code, local_hash=excluded.local_hash, server_hash=excluded.server_hash, retryable=excluded.retryable, allowed_resolution_actions=excluded.allowed_resolution_actions, description=excluded.description, status=excluded.status;

-- Consumo aplicado do número 2026000002, o da reserva `consumed` …e6000002:
-- prova de que um número aplicado nunca é reatribuído
-- (TEAT.NUMBERING_NUMBER_ALREADY_APPLIED, §4.6 passo 4).
insert into ops.numbering_consumption (id, tenant_id, reservation_id, range_id, number, local_entity_id, idempotency_key, server_entity_id, finalized_at, reconciled_at, status, details_json)
values ('00000000-0000-7000-8000-0000ec100001','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e6000002','00000000-0000-7000-8000-0000e5000001',2026000002,'00000000-0000-7000-8000-0000ed000001','item-001','00000000-0000-7000-8000-0000f8000060','2026-09-14T10:30:00-04:00','2026-09-14T11:00:01-04:00','aplicado',null)
on conflict (id) do update set tenant_id=excluded.tenant_id, reservation_id=excluded.reservation_id, range_id=excluded.range_id, number=excluded.number, local_entity_id=excluded.local_entity_id, idempotency_key=excluded.idempotency_key, server_entity_id=excluded.server_entity_id, finalized_at=excluded.finalized_at, reconciled_at=excluded.reconciled_at, status=excluded.status, details_json=excluded.details_json;
