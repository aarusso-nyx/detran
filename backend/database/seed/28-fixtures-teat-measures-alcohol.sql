-- TASK-0008 (R-0008, CTG-0004 §10): fixtures de medidas administrativas,
-- alcoolemia e velocidade. Deterministic and idempotent (on conflict do
-- update), tenant 00000000-0000-7000-8000-00000000a001, "hoje" = 2026-09-14.
select set_config('app.role', 'owner', false);
select set_config('app.tenant_id', '00000000-0000-7000-8000-00000000a001', false);

-- inf.measure_type: rol do art. 269. 10-fixtures-inf-ait.sql não semeia
-- nenhuma linha desta tabela (CTG-0004 §14 item 12, OD-T44) — o rol completo
-- do art. 269 fica source_pending até o Owner fechar o catálogo; as quatro
-- linhas abaixo bastam para os comandos que este contrato testa.
insert into inf.measure_type (id, tenant_id, code, name, status)
values
 ('00000000-0000-7000-8000-0000ec000001','00000000-0000-7000-8000-00000000a001','retencao','Retenção do veículo','active'),
 ('00000000-0000-7000-8000-0000ec000002','00000000-0000-7000-8000-00000000a001','remocao','Remoção do veículo','active'),
 ('00000000-0000-7000-8000-0000ec000003','00000000-0000-7000-8000-00000000a001','recolhimento_cnh','Recolhimento da CNH','active'),
 ('00000000-0000-7000-8000-0000ec000004','00000000-0000-7000-8000-00000000a001','recolhimento_crlv','Recolhimento do CRLV','active')
on conflict (id) do update set tenant_id=excluded.tenant_id, code=excluded.code, name=excluded.name, status=excluded.status;

-- inf.tow_provider: um ativo, um inativo (C-0004-06).
insert into inf.tow_provider (id, tenant_id, traffic_agency_id, name, status)
values
 ('00000000-0000-7000-8000-0000ec100001','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','Fixture Reboque Ativo','active'),
 ('00000000-0000-7000-8000-0000ec100002','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','Fixture Reboque Inativo','inactive')
on conflict (id) do update set tenant_id=excluded.tenant_id, traffic_agency_id=excluded.traffic_agency_id, name=excluded.name, status=excluded.status;

-- inf.yard: um ativo, um inativo (C-0004-06).
insert into inf.yard (id, tenant_id, traffic_agency_id, name, status)
values
 ('00000000-0000-7000-8000-0000ec200001','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','Fixture Pátio Ativo','active'),
 ('00000000-0000-7000-8000-0000ec200002','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','Fixture Pátio Inativo','inactive')
on conflict (id) do update set tenant_id=excluded.tenant_id, traffic_agency_id=excluded.traffic_agency_id, name=excluded.name, status=excluded.status;

-- inf.administrative_measure: uma por token do check
-- ck_inf_administrative_measure_current_status (CTG-0004 §1) — doze linhas.
-- ait_id = …f0000001 (10-fixtures-inf-ait.sql, INTEGRADO); agent_id =
-- …b0000001; shift_id = …e3000001 (aberto); device_id = …e4000002
-- (authorized), todos de 00/25/26-fixtures.
insert into inf.administrative_measure (id, tenant_id, traffic_agency_id, measure_type_id, ait_id, agent_id, shift_id, device_id, started_at, reason, current_status)
values
 ('00000000-0000-7000-8000-0000ed000001','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','00000000-0000-7000-8000-0000ec000001','00000000-0000-7000-8000-0000f0000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e3000001','00000000-0000-7000-8000-0000e4000002','2026-09-14T09:00:00-04:00','Fixture — RETIDO (CTG-0004 §1)','RETIDO'),
 ('00000000-0000-7000-8000-0000ed000002','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','00000000-0000-7000-8000-0000ec000001','00000000-0000-7000-8000-0000f0000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e3000001','00000000-0000-7000-8000-0000e4000002','2026-09-14T09:00:00-04:00','Fixture — LIBERADO_LOCAL (CTG-0004 §1)','LIBERADO_LOCAL'),
 ('00000000-0000-7000-8000-0000ed000003','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','00000000-0000-7000-8000-0000ec000001','00000000-0000-7000-8000-0000f0000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e3000001','00000000-0000-7000-8000-0000e4000002','2026-09-14T09:00:00-04:00','Fixture — LIBERADO_COM_PRAZO (CTG-0004 §1)','LIBERADO_COM_PRAZO'),
 ('00000000-0000-7000-8000-0000ed000004','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','00000000-0000-7000-8000-0000ec000001','00000000-0000-7000-8000-0000f0000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e3000001','00000000-0000-7000-8000-0000e4000002','2026-09-14T09:00:00-04:00','Fixture — REGULARIZADO (CTG-0004 §1)','REGULARIZADO'),
 ('00000000-0000-7000-8000-0000ed000005','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','00000000-0000-7000-8000-0000ec000002','00000000-0000-7000-8000-0000f0000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e3000001','00000000-0000-7000-8000-0000e4000002','2026-09-14T09:00:00-04:00','Fixture — CONVERTIDO_REMOCAO (CTG-0004 §1)','CONVERTIDO_REMOCAO'),
 ('00000000-0000-7000-8000-0000ed000006','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','00000000-0000-7000-8000-0000ec000002','00000000-0000-7000-8000-0000f0000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e3000001','00000000-0000-7000-8000-0000e4000002','2026-09-14T09:00:00-04:00','Fixture — REMOVIDO (CTG-0004 §1)','REMOVIDO'),
 ('00000000-0000-7000-8000-0000ed000007','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','00000000-0000-7000-8000-0000ec000002','00000000-0000-7000-8000-0000f0000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e3000001','00000000-0000-7000-8000-0000e4000002','2026-09-14T09:00:00-04:00','Fixture — EM_DEPOSITO (CTG-0004 §1)','EM_DEPOSITO'),
 ('00000000-0000-7000-8000-0000ed000008','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','00000000-0000-7000-8000-0000ec000002','00000000-0000-7000-8000-0000f0000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e3000001','00000000-0000-7000-8000-0000e4000002','2026-09-14T09:00:00-04:00','Fixture — GUARDA_MONITORADA (CTG-0004 §1)','GUARDA_MONITORADA'),
 ('00000000-0000-7000-8000-0000ed000009','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','00000000-0000-7000-8000-0000ec000002','00000000-0000-7000-8000-0000f0000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e3000001','00000000-0000-7000-8000-0000e4000002','2026-09-14T09:00:00-04:00','Fixture — VIOLACAO_MONITORAMENTO (CTG-0004 §1)','VIOLACAO_MONITORAMENTO'),
 ('00000000-0000-7000-8000-0000ed000010','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','00000000-0000-7000-8000-0000ec000002','00000000-0000-7000-8000-0000f0000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e3000001','00000000-0000-7000-8000-0000e4000002','2026-09-14T09:00:00-04:00','Fixture — NOTIFICADO (CTG-0004 §1)','NOTIFICADO'),
 ('00000000-0000-7000-8000-0000ed000011','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','00000000-0000-7000-8000-0000ec000002','00000000-0000-7000-8000-0000f0000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e3000001','00000000-0000-7000-8000-0000e4000002','2026-09-14T09:00:00-04:00','Fixture — RESTITUIDO (CTG-0004 §1)','RESTITUIDO'),
 ('00000000-0000-7000-8000-0000ed000012','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','00000000-0000-7000-8000-0000ec000002','00000000-0000-7000-8000-0000f0000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e3000001','00000000-0000-7000-8000-0000e4000002','2026-09-14T09:00:00-04:00','Fixture — LEILAO (CTG-0004 §1)','LEILAO')
on conflict (id) do update set tenant_id=excluded.tenant_id, traffic_agency_id=excluded.traffic_agency_id, measure_type_id=excluded.measure_type_id, ait_id=excluded.ait_id, agent_id=excluded.agent_id, shift_id=excluded.shift_id, device_id=excluded.device_id, started_at=excluded.started_at, reason=excluded.reason, current_status=excluded.current_status;

-- inf.measure_retention: retenção com prazo da medida …ed000003
-- (LIBERADO_COM_PRAZO). regularization_deadline_at = computeDue('T-REG30',
-- 2026-09-14) = 2026-10-14 (quarta-feira, dia útil — sem prorrogação;
-- inf.infraction_timer_ref, T-REG30, DDL 14). vehicle_snapshot_id =
-- …ef600001 (27-fixtures-teat-evidence.sql).
insert into inf.measure_retention (id, tenant_id, measure_id, vehicle_snapshot_id, retention_reason, regularization_deadline_at, regularization_deadline_days)
values ('00000000-0000-7000-8000-0000ed100001','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000ed000003','00000000-0000-7000-8000-0000ef600001','Fixture — retenção com prazo de regularização (CTG-0004 §10)','2026-10-14T00:00:00-04:00',30)
on conflict (id) do update set tenant_id=excluded.tenant_id, measure_id=excluded.measure_id, vehicle_snapshot_id=excluded.vehicle_snapshot_id, retention_reason=excluded.retention_reason, regularization_deadline_at=excluded.regularization_deadline_at, regularization_deadline_days=excluded.regularization_deadline_days;

-- inf.alcohol_breathalyzer: verificação vigente (…ea000001) e vencida
-- (…ea000002) — C-0004-14.
insert into inf.alcohol_breathalyzer (id, tenant_id, traffic_agency_id, serial_number, model, manufacturer, last_calibration_at, calibration_valid_until, status)
values
 ('00000000-0000-7000-8000-0000ea000001','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','ETL-FIX-0001','Fixture Model','Fixtures Ltda','2026-06-30','2027-06-30','active'),
 ('00000000-0000-7000-8000-0000ea000002','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','ETL-FIX-0002','Fixture Model','Fixtures Ltda','2025-06-30','2025-12-31','active')
on conflict (id) do update set tenant_id=excluded.tenant_id, traffic_agency_id=excluded.traffic_agency_id, serial_number=excluded.serial_number, model=excluded.model, manufacturer=excluded.manufacturer, last_calibration_at=excluded.last_calibration_at, calibration_valid_until=excluded.calibration_valid_until, status=excluded.status;

-- inf.normative_metrological_table …eb000001: nasceu em
-- 27-fixtures-teat-evidence.sql (CTG-0003 §9) como placeholder
-- ({"source_pending":true,"unit":null,"thresholds":null,"tolerance":null}) —
-- aquele arquivo é seed existente e não pode ser tocado por esta tarefa
-- ("Não pode tocar: seeds existentes"). CTG-0004 §3.1 fixa o FORMATO aqui;
-- os limiares são normativos ([WF-TEAT-005] §Limiares, RN-TEAT-133:
-- administrativo >= 0,05 mg/L, crime >= 0,34 mg/L) e NÃO são
-- source_pending. Só os valores de `tolerance` (max_error por faixa) são
-- source_pending: o Anexo I da Res. CONTRAN 432/2013 não foi capturado em
-- docs/reference (docs/reference/legal/contran/REF-CONTRAN-432.md não traz a
-- tabela numérica). Este insert faz on conflict do update sobre a MESMA
-- linha semeada em 27-fixtures (seed.sh aplica os arquivos em ordem
-- numérica; 28 corre depois de 27) — não é edição do arquivo 27.
insert into inf.normative_metrological_table (id, tenant_id, catalog_id, table_name, version, table_json, valid_from, status)
values (
  '00000000-0000-7000-8000-0000eb000001',
  '00000000-0000-7000-8000-00000000a001',
  '00000000-0000-7000-8000-0000e0000001',
  'Etilômetro — tabela de erro máximo admissível',
  '2026.1',
  -- tolerance: faixas e max_error de exemplo (CTG-0004 §3.1) — SOURCE_PENDING,
  -- Anexo I da Res. 432/2013 não capturado; nenhum teste depende destes
  -- valores numéricos específicos, só da faixa a que 0,30 mg/L pertence.
  '{"unit":"mg/L","thresholds":{"administrative":0.05,"crime":0.34},"tolerance":[{"from":0.00,"to":0.40,"max_error":0.04},{"from":0.40,"to":null,"max_error":0.05}]}'::jsonb,
  '2026-01-01',
  'active'
)
on conflict (id) do update set tenant_id=excluded.tenant_id, catalog_id=excluded.catalog_id, table_name=excluded.table_name, version=excluded.version, table_json=excluded.table_json, valid_from=excluded.valid_from, status=excluded.status;

-- inf.alcohol_procedure: uma por token de [WF-TEAT-005] — quinze linhas
-- (CTG-0004 §10, §14 item 4/13: a coluna não tem check; outcome='' em todas
-- porque a coluna é not null e nenhuma fonte define um token "sem
-- desfecho"). procedure_type='etilometro' é o único vocabulário plausível
-- para este pacote de teste; a DDL não tem check e nenhum documento fixa a
-- lista — SOURCE_PENDING (nenhum critério do Inspector depende do valor).
insert into inf.alcohol_procedure (id, tenant_id, traffic_agency_id, agent_id, shift_id, procedure_at, procedure_type, outcome, status)
values
 ('00000000-0000-7000-8000-0000ee000001','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e3000001','2026-09-14T09:00:00-04:00','etilometro','','ABORDAGEM'),
 ('00000000-0000-7000-8000-0000ee000002','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e3000001','2026-09-14T09:00:00-04:00','etilometro','','TRIAGEM'),
 ('00000000-0000-7000-8000-0000ee000003','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e3000001','2026-09-14T09:00:00-04:00','etilometro','','ETILOMETRO_OFERECIDO'),
 ('00000000-0000-7000-8000-0000ee000004','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e3000001','2026-09-14T09:00:00-04:00','etilometro','','TESTE_REALIZADO'),
 ('00000000-0000-7000-8000-0000ee000005','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e3000001','2026-09-14T09:00:00-04:00','etilometro','','RESULTADO_ABAIXO_LIMITE'),
 ('00000000-0000-7000-8000-0000ee000006','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e3000001','2026-09-14T09:00:00-04:00','etilometro','','RESULTADO_ADMINISTRATIVO'),
 ('00000000-0000-7000-8000-0000ee000007','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e3000001','2026-09-14T09:00:00-04:00','etilometro','','RESULTADO_CRIME'),
 ('00000000-0000-7000-8000-0000ee000008','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e3000001','2026-09-14T09:00:00-04:00','etilometro','','RECUSA_REGISTRADA'),
 ('00000000-0000-7000-8000-0000ee000009','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e3000001','2026-09-14T09:00:00-04:00','etilometro','','IMPOSSIBILIDADE_TECNICA'),
 ('00000000-0000-7000-8000-0000ee000010','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e3000001','2026-09-14T09:00:00-04:00','etilometro','','OUTRO_MEIO_PROVA'),
 ('00000000-0000-7000-8000-0000ee000011','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e3000001','2026-09-14T09:00:00-04:00','etilometro','','SINAIS_CONSTATADOS'),
 ('00000000-0000-7000-8000-0000ee000012','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e3000001','2026-09-14T09:00:00-04:00','etilometro','','AIT_165A_LAVRADO'),
 ('00000000-0000-7000-8000-0000ee000013','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e3000001','2026-09-14T09:00:00-04:00','etilometro','','AIT_165_LAVRADO'),
 ('00000000-0000-7000-8000-0000ee000014','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e3000001','2026-09-14T09:00:00-04:00','etilometro','','ENCAMINHADO_POLICIA_JUDICIARIA'),
 ('00000000-0000-7000-8000-0000ee000015','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e3000001','2026-09-14T09:00:00-04:00','etilometro','','SEM_AUTUACAO_ALCOOLEMIA')
on conflict (id) do update set tenant_id=excluded.tenant_id, traffic_agency_id=excluded.traffic_agency_id, agent_id=excluded.agent_id, shift_id=excluded.shift_id, procedure_at=excluded.procedure_at, procedure_type=excluded.procedure_type, outcome=excluded.outcome, status=excluded.status;

-- inf.alcohol_forwarding: encaminhamento já registrado do caso
-- RESULTADO_CRIME (…ee000007) — C-0004-23 (close com forwarding já
-- existente).
insert into inf.alcohol_forwarding (id, tenant_id, procedure_id, forwarding_type, destination, forwarded_at)
values ('00000000-0000-7000-8000-0000ee100001','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000ee000007','policia_judiciaria','Delegacia Fixture','2026-09-14T10:00:00-04:00')
on conflict (id) do update set tenant_id=excluded.tenant_id, procedure_id=excluded.procedure_id, forwarding_type=excluded.forwarding_type, destination=excluded.destination, forwarded_at=excluded.forwarded_at;

-- inf.speed_meter / inf.speed_meter_certificate: medidor acoplado com
-- certificado vigente (C-0004-27 usa a versão vencida via override no
-- teste, nunca uma segunda fixture inventada).
insert into inf.speed_meter (id, tenant_id, model, serial_number, agency_identifier, meter_type, inmetro_model_approval, has_ocr)
values ('00000000-0000-7000-8000-0000ef900001','00000000-0000-7000-8000-00000000a001','Fixture Radar','RAD-FIX-0001','AGE-FIX-0001','movel_acoplado','INMETRO-FIX-0001',true)
on conflict (id) do update set tenant_id=excluded.tenant_id, model=excluded.model, serial_number=excluded.serial_number, agency_identifier=excluded.agency_identifier, meter_type=excluded.meter_type, inmetro_model_approval=excluded.inmetro_model_approval, has_ocr=excluded.has_ocr;

insert into inf.speed_meter_certificate (id, tenant_id, meter_id, kind, certificate_number, issuer, issued_on, valid_until)
values ('00000000-0000-7000-8000-0000efa00001','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000ef900001','periodica','CERT-FIX-0001','Fixtures Inmetro','2026-06-30','2027-06-30')
on conflict (id) do update set tenant_id=excluded.tenant_id, meter_id=excluded.meter_id, kind=excluded.kind, certificate_number=excluded.certificate_number, issuer=excluded.issuer, issued_on=excluded.issued_on, valid_until=excluded.valid_until;
