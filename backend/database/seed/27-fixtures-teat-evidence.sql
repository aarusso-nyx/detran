-- TASK-0006 (R-0008, CTG-0003 §9 / M20): fixtures de evidência, custódia,
-- bodycam, snapshots congelados e catálogo/pacote normativo do grupo
-- evidência/normativo. Determinísticas e idempotentes (`on conflict (id) do
-- update`), no tenant canônico 00000000-0000-7000-8000-00000000a001 e no
-- órgão 00000000-0000-7000-8000-0000e2000001. "Hoje" das fixtures =
-- 2026-09-14 (00-fixtures-core.sql), fuso -04:00 (America/Manaus).
--
-- Reutilizadas sem cópia (CTG-0003 §9, nota final): inf.normative_catalog
-- …e0000001 (corrigido abaixo para status='active' — OD-T35), normative_framing
-- …e1000001/…e1000002, normative_mobile_package …e7000001 (published),
-- ait_ait …f0000001 (INTEGRADO, alvo do evidence_link), ops_operational_device
-- …e4000002.
select set_config('app.role', 'owner', false);
select set_config('app.tenant_id', '00000000-0000-7000-8000-00000000a001', false);

-- OD-T35 (CTG-0003 §13 item 12): a fixture de 10-fixtures-inf-ait.sql grava
-- inf.normative_catalog.status = 'published', fora do conjunto draft|active|
-- retired de [WF-TEAT-003]. Sem essa correção, `mobile-packages/generate`
-- sobre o catálogo …e0000001 devolveria sempre 422
-- TEAT.PACKAGE_CATALOG_NOT_ACTIVE. Corrigido aqui, idempotente.
update inf.normative_catalog
   set status = 'active'
 where id = '00000000-0000-7000-8000-0000e0000001'
   and tenant_id = '00000000-0000-7000-8000-00000000a001';

-- ops.evidence_evidence: quatro estados de custódia.
-- …ef000001 bodycam validada (conteúdo restrito por RN-TEAT-142: storage_uri e
-- location_json só saem para quem tem uma evidence_access_request 'delivered').
-- …ef000002 foto aguardando upload, intenção …ef100001 já vencida.
-- …ef000003 foto carregada (uploaded), intenção …ef100002 vigente.
-- …ef000004 em quarentena (sem rota nesta rodada; só pré-condição de bloqueio).
insert into ops.evidence_evidence (id, tenant_id, traffic_agency_id, evidence_type, origin, storage_uri, mime_type, size_bytes, hash_algorithm, hash_value, captured_by_user_ref, agent_id, device_id, captured_at, location_json, status, metadata_json)
values
 ('00000000-0000-7000-8000-0000ef000001','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','bodycam','campo','evidence/00000000-0000-7000-8000-00000000a001/00000000-0000-7000-8000-0000ef000001','video/mp4',5242880,'sha256','sha256:fb517525e4db0c44027f342617250edf975383e949b8d1fab2670b3120c8b038','00000000-0000-4000-8000-0000b0000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e4000002','2026-09-10T10:00:00-04:00','{"latitude":-3.1019,"longitude":-60.0250,"accuracy_m":6}'::jsonb,'validated','{"fixture":"C-0003-14"}'::jsonb),
 ('00000000-0000-7000-8000-0000ef000002','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','foto','campo','evidence/00000000-0000-7000-8000-00000000a001/00000000-0000-7000-8000-0000ef000002','image/jpeg',204800,'sha256','sha256:531986dca23b52cea07f5b3a736b452efea3ff325033daa19fb218741cb4875d','00000000-0000-4000-8000-0000b0000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e4000002','2026-09-13T09:00:00-04:00',null,'pending_upload',null),
 ('00000000-0000-7000-8000-0000ef000003','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','foto','campo','evidence/00000000-0000-7000-8000-00000000a001/00000000-0000-7000-8000-0000ef000003','image/jpeg',307200,'sha256','sha256:dc52f4c835d7687f4abd3556182e0383bc09264328a03f20eec1b8368a26488e','00000000-0000-4000-8000-0000b0000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e4000002','2026-09-14T09:00:00-04:00',null,'uploaded',null),
 ('00000000-0000-7000-8000-0000ef000004','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','foto','campo','evidence/00000000-0000-7000-8000-00000000a001/00000000-0000-7000-8000-0000ef000004','image/jpeg',102400,'sha256','sha256:a8949cf99ae3fc2328f8acf858aefca10282ab574addc442698fed3e9929cc98','00000000-0000-4000-8000-0000b0000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e4000002','2026-09-12T09:00:00-04:00',null,'quarantined',null)
on conflict (id) do update set tenant_id=excluded.tenant_id, traffic_agency_id=excluded.traffic_agency_id, evidence_type=excluded.evidence_type, origin=excluded.origin, storage_uri=excluded.storage_uri, mime_type=excluded.mime_type, size_bytes=excluded.size_bytes, hash_algorithm=excluded.hash_algorithm, hash_value=excluded.hash_value, captured_by_user_ref=excluded.captured_by_user_ref, agent_id=excluded.agent_id, device_id=excluded.device_id, captured_at=excluded.captured_at, location_json=excluded.location_json, status=excluded.status, metadata_json=excluded.metadata_json;

-- ops.storage_intent: …ef100001 vencida (evidência …ef000002, foto ainda sem
-- upload); …ef100002 vigente (evidência …ef000003, já concluída — mantida
-- 'pending' de propósito: o comando complete-upload é quem a leva a
-- 'completed', e este fixture não presume o efeito do comando).
insert into ops.storage_intent (id, tenant_id, evidence_id, idempotency_key, local_evidence_id, object_key, expires_at, status)
values
 ('00000000-0000-7000-8000-0000ef100001','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000ef000002','intent-002','00000000-0000-7000-8000-0000ef100011','evidence/00000000-0000-7000-8000-00000000a001/00000000-0000-7000-8000-0000ef000002','2026-09-01T00:00:00-04:00','pending'),
 ('00000000-0000-7000-8000-0000ef100002','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000ef000003','intent-003','00000000-0000-7000-8000-0000ef100012','evidence/00000000-0000-7000-8000-00000000a001/00000000-0000-7000-8000-0000ef000003','2026-12-31T23:59:59-04:00','pending')
on conflict (id) do update set tenant_id=excluded.tenant_id, evidence_id=excluded.evidence_id, idempotency_key=excluded.idempotency_key, local_evidence_id=excluded.local_evidence_id, object_key=excluded.object_key, expires_at=excluded.expires_at, status=excluded.status;

-- ops.evidence_link: bodycam …ef000001 ligada ao AIT INTEGRADO …f0000001
-- (10-fixtures-inf-ait.sql), role='bodycam', mandatory=true.
insert into ops.evidence_link (id, tenant_id, evidence_id, entity_type, entity_id, role, mandatory)
values ('00000000-0000-7000-8000-0000ef200001','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000ef000001','ait','00000000-0000-7000-8000-0000f0000001','bodycam',true)
on conflict (id) do update set tenant_id=excluded.tenant_id, evidence_id=excluded.evidence_id, entity_type=excluded.entity_type, entity_id=excluded.entity_id, role=excluded.role, mandatory=excluded.mandatory;

-- ops.evidence_custody_event: cadeia inicial da bodycam …ef000001.
insert into ops.evidence_custody_event (id, tenant_id, evidence_id, event_type, event_at, user_ref, system_name, details_json)
values ('00000000-0000-7000-8000-0000ef300001','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000ef000001','uploaded','2026-09-10T10:05:00-04:00','00000000-0000-4000-8000-0000b0000001','detran-backend','{"fixture":"27"}'::jsonb)
on conflict (id) do update set tenant_id=excluded.tenant_id, evidence_id=excluded.evidence_id, event_type=excluded.event_type, event_at=excluded.event_at, user_ref=excluded.user_ref, system_name=excluded.system_name, details_json=excluded.details_json;

-- ops.evidence_access_request: …ef400001 pendente (requested, magistrado);
-- …ef400002 aprovada (approved, ministerio-publico), pronta para `deliver`
-- (C-0003-13). decided_by_user_ref = …b0000006 (Fábio Nogueira,
-- 00-fixtures-core.sql), persona de traffic-authority.
insert into ops.evidence_access_request (id, tenant_id, evidence_id, requester_name, requester_role, investigation_ref, purpose, legal_basis, status, decided_by_user_ref)
values
 ('00000000-0000-7000-8000-0000ef400001','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000ef000001','Dra. Marina Castelo Branco','magistrado','PROC-2026-000123','Instrução de processo administrativo de trânsito',null,'requested',null),
 ('00000000-0000-7000-8000-0000ef400002','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000ef000001','Dr. Heitor Souza Lima','ministerio-publico','INQ-2026-000045','Apuração de infração penal de trânsito','Art. 13 da Portaria Normativa 003/2026-DP/DETRAN/AM','approved','00000000-0000-4000-8000-0000b0000006')
on conflict (id) do update set tenant_id=excluded.tenant_id, evidence_id=excluded.evidence_id, requester_name=excluded.requester_name, requester_role=excluded.requester_role, investigation_ref=excluded.investigation_ref, purpose=excluded.purpose, legal_basis=excluded.legal_basis, status=excluded.status, decided_by_user_ref=excluded.decided_by_user_ref;

-- ops.snapshots_person: condutor congelado via RENACH.
insert into ops.snapshots_person (id, tenant_id, person_type, name, cpf, source)
values ('00000000-0000-7000-8000-0000ef500001','00000000-0000-7000-8000-00000000a001','natural','Condutor Fixture Renach','11122233344','renach')
on conflict (id) do update set tenant_id=excluded.tenant_id, person_type=excluded.person_type, name=excluded.name, cpf=excluded.cpf, source=excluded.source;

-- ops.snapshots_vehicle: veículo congelado via WSDENATRAN.
insert into ops.snapshots_vehicle (id, tenant_id, plate, renavam, make_model, source)
values ('00000000-0000-7000-8000-0000ef600001','00000000-0000-7000-8000-00000000a001','BRA2E19','00123456789','Fixture Sedan 1.6','wsdenatran')
on conflict (id) do update set tenant_id=excluded.tenant_id, plate=excluded.plate, renavam=excluded.renavam, make_model=excluded.make_model, source=excluded.source;

-- ops.snapshots_vehicle_snapshot: sem divergência com o registro congelado acima.
insert into ops.snapshots_vehicle_snapshot (id, tenant_id, vehicle_id, plate_snapshot, make_model_snapshot, data_source, divergence_recorded, payload_json)
values ('00000000-0000-7000-8000-0000ef700001','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000ef600001','BRA2E19','Fixture Sedan 1.6','wsdenatran',false,'{"plate":"BRA2E19","makeModelDescription":"Fixture Sedan 1.6"}'::jsonb)
on conflict (id) do update set tenant_id=excluded.tenant_id, vehicle_id=excluded.vehicle_id, plate_snapshot=excluded.plate_snapshot, make_model_snapshot=excluded.make_model_snapshot, data_source=excluded.data_source, divergence_recorded=excluded.divergence_recorded, payload_json=excluded.payload_json;

-- inf.normative_catalog: um segundo catálogo em draft (C-0003-20: generate
-- sobre catálogo não ativo → 422 TEAT.PACKAGE_CATALOG_NOT_ACTIVE).
insert into inf.normative_catalog (id, tenant_id, traffic_agency_id, name, catalog_type, version, valid_from, status, normative_source)
values ('00000000-0000-7000-8000-0000e0000002','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','Catálogo CONTRAN — revisão 2026.2 (fixtures, rascunho)','enquadramentos','2026.2','2026-09-01','draft','CTB; Res. CONTRAN 918/2022')
on conflict (id) do update set tenant_id=excluded.tenant_id, traffic_agency_id=excluded.traffic_agency_id, name=excluded.name, catalog_type=excluded.catalog_type, version=excluded.version, valid_from=excluded.valid_from, status=excluded.status, normative_source=excluded.normative_source;

-- inf.normative_metrological_table: tabela ativa do catálogo …e0000001.
-- table_json marcado source_pending: o conteúdo do Anexo I da Res. 432 é
-- CTG-0004 §3, fora desta tarefa (CTG-0003 §9); nenhum limiar é inventado
-- aqui, apenas a existência da linha `active` que M13 exige no manifesto.
insert into inf.normative_metrological_table (id, tenant_id, catalog_id, table_name, version, table_json, valid_from, status)
values ('00000000-0000-7000-8000-0000eb000001','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e0000001','Etilômetro — tabela de erro máximo admissível','2026.1','{"source_pending":true,"unit":null,"thresholds":null,"tolerance":null}'::jsonb,'2026-01-01','active')
on conflict (id) do update set tenant_id=excluded.tenant_id, catalog_id=excluded.catalog_id, table_name=excluded.table_name, version=excluded.version, table_json=excluded.table_json, valid_from=excluded.valid_from, status=excluded.status;

-- inf.normative_validation_rule: regra ativa do catálogo …e0000001, entra no
-- manifesto (§3).
insert into inf.normative_validation_rule (id, tenant_id, catalog_id, rule_code, description, rule_type, severity, status)
values ('00000000-0000-7000-8000-0000e1100001','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e0000001','VR-PLACA-OBRIGATORIA','Placa do veículo é obrigatória para o enquadramento com abordagem','required-field','bloqueante','active')
on conflict (id) do update set tenant_id=excluded.tenant_id, catalog_id=excluded.catalog_id, description=excluded.description, rule_type=excluded.rule_type, severity=excluded.severity, status=excluded.status;

-- inf.normative_document_template: modelo ativo do órgão …e2000001, entra no
-- manifesto (§3).
insert into inf.normative_document_template (id, tenant_id, traffic_agency_id, document_kind, name, version, template_body, valid_from, status)
values ('00000000-0000-7000-8000-0000e1200001','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','ait','Modelo de talão eletrônico (fixtures)','2026.1','Auto de Infração de Trânsito nº {{ait_number}}','2026-01-01','active')
on conflict (id) do update set tenant_id=excluded.tenant_id, traffic_agency_id=excluded.traffic_agency_id, document_kind=excluded.document_kind, name=excluded.name, version=excluded.version, template_body=excluded.template_body, valid_from=excluded.valid_from, status=excluded.status;

-- Default D1 do relatório preliminar BOAT: documento informativo distinto do
-- BAT oficial, PDF/A-2b obrigatório e sem assinatura na política inicial.
insert into inf.normative_document_template (id, tenant_id, traffic_agency_id, document_kind, domain_scope, name, version, template_body, valid_from, status)
values ('00000000-0000-7000-8000-0000e1200013','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','relatorio_preliminar_sinistro','est','est.crash.report.preliminary','1.0.0','<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Relatório preliminar de sinistro</title><style>@page{size:A4;margin:20mm}body{font-family:sans-serif}dt{font-weight:bold}</style></head><body><h1>Relatório preliminar de sinistro</h1><dl><dt>Identificador</dt><dd>{{id}}</dd><dt>Órgão</dt><dd>{{traffic_agency_id}}</dd><dt>Estado</dt><dd>{{state}}</dd><dt>Ocorrência</dt><dd>{{occurred_at}}</dd><dt>Local</dt><dd>{{location_description}}</dd></dl><p>Relatório preliminar de sinistro. Documento informativo sujeito a complementação e validação. Não constitui Boletim de Acidente de Trânsito (BAT) oficial.</p></body></html>','2026-09-20','active')
on conflict (id) do update set tenant_id=excluded.tenant_id, traffic_agency_id=excluded.traffic_agency_id, document_kind=excluded.document_kind, domain_scope=excluded.domain_scope, name=excluded.name, version=excluded.version, template_body=excluded.template_body, valid_from=excluded.valid_from, status=excluded.status;

insert into inf.signature_policy (id, tenant_id, traffic_agency_id, document_kind, required_signers_json, pades_level, tsa_required, pdfa_required, govbr_level, status)
values ('00000000-0000-7000-8000-0000e1400013','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','relatorio_preliminar_sinistro','[]'::jsonb,'NONE',false,true,null,'active')
on conflict (id) do update set tenant_id=excluded.tenant_id, traffic_agency_id=excluded.traffic_agency_id, document_kind=excluded.document_kind, required_signers_json=excluded.required_signers_json, pades_level=excluded.pades_level, tsa_required=excluded.tsa_required, pdfa_required=excluded.pdfa_required, govbr_level=excluded.govbr_level, status=excluded.status;

-- inf.normative_agency_parameter: parâmetro ativo do órgão …e2000001, entra
-- no manifesto (§3).
insert into inf.normative_agency_parameter (id, tenant_id, traffic_agency_id, key, value_json, value_type, valid_from, status)
values ('00000000-0000-7000-8000-0000e1300001','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','teat.talao.serie_padrao','"F"'::jsonb,'string','2026-01-01','active')
on conflict (id) do update set tenant_id=excluded.tenant_id, traffic_agency_id=excluded.traffic_agency_id, value_json=excluded.value_json, value_type=excluded.value_type, valid_from=excluded.valid_from, status=excluded.status;

-- inf.normative_mobile_package: pacote `draft` do catálogo …e0000001, versão
-- distinta de …e7000001 (published). manifest_hash/package_uri são valores de
-- fixture (a coluna é not null); o Engineer recalcula no comando `generate`
-- real — este é só o pré-estado para `publish`/`retire`/`validate` sobre um
-- draft (C-0003-23/24/26).
insert into inf.normative_mobile_package (id, tenant_id, traffic_agency_id, catalog_id, package_version, manifest_hash, package_uri, status)
values ('00000000-0000-7000-8000-0000e7000002','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','00000000-0000-7000-8000-0000e0000001','2026.2-draft','sha256:0000000000000000000000000000000000000000000000000000000000000000','/v1/inf/normative/mobile-packages/00000000-0000-7000-8000-0000e7000002/content','draft')
on conflict (id) do update set tenant_id=excluded.tenant_id, traffic_agency_id=excluded.traffic_agency_id, catalog_id=excluded.catalog_id, package_version=excluded.package_version, manifest_hash=excluded.manifest_hash, package_uri=excluded.package_uri, status=excluded.status;
