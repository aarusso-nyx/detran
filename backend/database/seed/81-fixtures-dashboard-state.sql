-- Fixtures de ESTADO do DASHBOARD (CTG-0001 §5.3; plan R-0011 M8/A5, Inspector
-- TASK-0002 — fronteira disjunta de `80-fixtures-dashboard-catalog.sql`,
-- Engineer TASK-0003, que traz os 42 `indicator` e as 15 `duty`). Forma de
-- `72-fixtures-boat-projections.sql` (set_config de role/tenant,
-- `on conflict (id) do update`). Tenant de fixtures
-- `00000000-0000-7000-8000-00000000a001`; usuários de `00-fixtures-core.sql`;
-- `object_ref` de `alert` reaproveita ids já semeados por outros domínios
-- (nunca id inventado sem fixture): o caso `00000000-0000-7000-8000-000010000002`
-- de `20-fixtures-rait.sql` (trilha extinction) e a manifestação
-- `00000000-0000-7000-8000-000070700001` de `70-fixtures-portal.sql` (trilha
-- irregularity) — 81 deve rodar depois desses dois na lista de `seed.sh`
-- (TASK-0003 decide a posição exata; não há FK entre os schemas que force a
-- ordem, só a "leitura" documental do CTG-0001 §5.3). Datas fixas em 2026-09
-- (nunca now()). Idempotente: `seed.sh` roda este arquivo duas vezes.
--
-- DEPENDÊNCIA (CTG-0001 §5.3): "códigos de indicador e de dever existentes no
-- catálogo" pressupõe `80-fixtures-dashboard-catalog.sql` (TASK-0003, ainda
-- não escrito nesta entrega) carregado antes. Não há FK entre `dashboard.alert`/
-- `dashboard.duty_cycle` e `dashboard.indicator`/`dashboard.duty` (só regex
-- CHECK nas colunas `indicator_code`/`duty_code` — ver `80-dashboard.sql`),
-- então este arquivo aplica sozinho sem erro mesmo antes de 80 existir; a
-- consistência semântica (códigos existentes) só é provada depois que 80
-- estiver presente (ver `tests/integration/seeds.integration.spec.ts`).
select set_config('app.role', 'owner', false);
select set_config('app.tenant_id', '00000000-0000-7000-8000-00000000a001', false);

-- dashboard.alert — 18 = 10 estados × trilha extinction + 8 estados × trilha
-- irregularity (CRITICO_EXTINCAO/INCIDENTE_REGISTRADO só existem na trilha de
-- extinção — ck_dashboard_alert_extinction_states). Coluna extinction:
-- IND-DASH-101 (bloco A), governing_clock 'A', object_kind 'case', object_layer
-- 'N2', source_app 'rait', owner_role 'rait-manager' (05-role-catalog.sql).
-- Coluna irregularity: IND-DASH-301 (bloco C), object_kind 'manifestation',
-- object_layer 'N1', source_app 'portal', owner_role 'dash-duty-owner' (literal de
-- CTG-0001 §5.3; não é uma chave de `05-role-catalog.sql` — ver OD-D26 no
-- relatório de entrega, mantido literal por "não reinterprete").
insert into dashboard.alert (
  id, tenant_id, indicator_code, track, state, severity, block, source_app,
  object_kind, object_ref, object_layer, owner_role, governing_clock,
  next_milestone_at, ceiling_on, detected_at, classified_at, notified_at,
  acknowledged_at, treating_at, verified_at, closed_at, escalated_at,
  critical_at, incident_at, ack_channel, escalation_level, incident_ref, version
) values
  -- DETECTADO
  ('00000000-0000-7000-8000-000081000101', '00000000-0000-7000-8000-00000000a001', 'IND-DASH-101', 'extinction', 'DETECTADO', 'N1', 'A', 'rait', 'case', '00000000-0000-7000-8000-000010000002', 'N2', 'rait-manager', 'A', '2027-03-09T08:00:00-04:00', '2027-03-09', '2026-09-10T08:00:00-04:00', null, null, null, null, null, null, null, null, null, null, 0, null, 1),
  ('00000000-0000-7000-8000-000081000102', '00000000-0000-7000-8000-00000000a001', 'IND-DASH-301', 'irregularity', 'DETECTADO', 'N1', 'C', 'portal', 'manifestation', '00000000-0000-7000-8000-000070700001', 'N1', 'dash-duty-owner', null, null, null, '2026-09-10T08:05:00-04:00', null, null, null, null, null, null, null, null, null, null, 0, null, 1),
  -- CLASSIFICADO
  ('00000000-0000-7000-8000-000081000103', '00000000-0000-7000-8000-00000000a001', 'IND-DASH-101', 'extinction', 'CLASSIFICADO', 'N1', 'A', 'rait', 'case', '00000000-0000-7000-8000-000010000002', 'N2', 'rait-manager', 'A', '2027-03-09T08:00:00-04:00', '2027-03-09', '2026-09-09T08:00:00-04:00', '2026-09-09T08:15:00-04:00', null, null, null, null, null, null, null, null, null, 0, null, 1),
  ('00000000-0000-7000-8000-000081000104', '00000000-0000-7000-8000-00000000a001', 'IND-DASH-301', 'irregularity', 'CLASSIFICADO', 'N1', 'C', 'portal', 'manifestation', '00000000-0000-7000-8000-000070700001', 'N1', 'dash-duty-owner', null, null, null, '2026-09-09T08:05:00-04:00', '2026-09-09T08:20:00-04:00', null, null, null, null, null, null, null, null, null, 0, null, 1),
  -- NOTIFICADO
  ('00000000-0000-7000-8000-000081000105', '00000000-0000-7000-8000-00000000a001', 'IND-DASH-101', 'extinction', 'NOTIFICADO', 'N2', 'A', 'rait', 'case', '00000000-0000-7000-8000-000010000002', 'N2', 'rait-manager', 'A', '2027-03-09T08:00:00-04:00', '2027-03-09', '2026-09-08T08:00:00-04:00', '2026-09-08T08:15:00-04:00', '2026-09-08T08:30:00-04:00', null, null, null, null, null, null, null, null, 0, null, 1),
  ('00000000-0000-7000-8000-000081000106', '00000000-0000-7000-8000-00000000a001', 'IND-DASH-301', 'irregularity', 'NOTIFICADO', 'N2', 'C', 'portal', 'manifestation', '00000000-0000-7000-8000-000070700001', 'N1', 'dash-duty-owner', null, null, null, '2026-09-08T08:05:00-04:00', '2026-09-08T08:20:00-04:00', '2026-09-08T08:35:00-04:00', null, null, null, null, null, null, null, null, 0, null, 1),
  -- RECONHECIDO (ack_channel: origin na extinction, manual na irregularity)
  ('00000000-0000-7000-8000-000081000107', '00000000-0000-7000-8000-00000000a001', 'IND-DASH-101', 'extinction', 'RECONHECIDO', 'N2', 'A', 'rait', 'case', '00000000-0000-7000-8000-000010000002', 'N2', 'rait-manager', 'A', '2027-03-09T08:00:00-04:00', '2027-03-09', '2026-09-07T08:00:00-04:00', '2026-09-07T08:15:00-04:00', '2026-09-07T08:30:00-04:00', '2026-09-07T09:00:00-04:00', null, null, null, null, null, null, 'origin', 0, null, 1),
  ('00000000-0000-7000-8000-000081000108', '00000000-0000-7000-8000-00000000a001', 'IND-DASH-301', 'irregularity', 'RECONHECIDO', 'N2', 'C', 'portal', 'manifestation', '00000000-0000-7000-8000-000070700001', 'N1', 'dash-duty-owner', null, null, null, '2026-09-07T08:05:00-04:00', '2026-09-07T08:20:00-04:00', '2026-09-07T08:35:00-04:00', '2026-09-07T09:05:00-04:00', null, null, null, null, null, null, 'manual', 0, null, 1),
  -- EM_TRATAMENTO
  ('00000000-0000-7000-8000-000081000109', '00000000-0000-7000-8000-00000000a001', 'IND-DASH-101', 'extinction', 'EM_TRATAMENTO', 'N2', 'A', 'rait', 'case', '00000000-0000-7000-8000-000010000002', 'N2', 'rait-manager', 'A', '2027-03-09T08:00:00-04:00', '2027-03-09', '2026-09-06T08:00:00-04:00', '2026-09-06T08:15:00-04:00', '2026-09-06T08:30:00-04:00', '2026-09-06T09:00:00-04:00', '2026-09-06T10:00:00-04:00', null, null, null, null, null, 'origin', 0, null, 1),
  ('00000000-0000-7000-8000-000081000110', '00000000-0000-7000-8000-00000000a001', 'IND-DASH-301', 'irregularity', 'EM_TRATAMENTO', 'N2', 'C', 'portal', 'manifestation', '00000000-0000-7000-8000-000070700001', 'N1', 'dash-duty-owner', null, null, null, '2026-09-06T08:05:00-04:00', '2026-09-06T08:20:00-04:00', '2026-09-06T08:35:00-04:00', '2026-09-06T09:05:00-04:00', '2026-09-06T10:05:00-04:00', null, null, null, null, null, 'manual', 0, null, 1),
  -- VERIFICADO
  ('00000000-0000-7000-8000-000081000111', '00000000-0000-7000-8000-00000000a001', 'IND-DASH-101', 'extinction', 'VERIFICADO', 'N2', 'A', 'rait', 'case', '00000000-0000-7000-8000-000010000002', 'N2', 'rait-manager', 'A', '2027-03-09T08:00:00-04:00', '2027-03-09', '2026-09-05T08:00:00-04:00', '2026-09-05T08:15:00-04:00', '2026-09-05T08:30:00-04:00', '2026-09-05T09:00:00-04:00', '2026-09-05T10:00:00-04:00', '2026-09-05T14:00:00-04:00', null, null, null, null, 'origin', 0, null, 1),
  ('00000000-0000-7000-8000-000081000112', '00000000-0000-7000-8000-00000000a001', 'IND-DASH-301', 'irregularity', 'VERIFICADO', 'N2', 'C', 'portal', 'manifestation', '00000000-0000-7000-8000-000070700001', 'N1', 'dash-duty-owner', null, null, null, '2026-09-05T08:05:00-04:00', '2026-09-05T08:20:00-04:00', '2026-09-05T08:35:00-04:00', '2026-09-05T09:05:00-04:00', '2026-09-05T10:05:00-04:00', '2026-09-05T14:05:00-04:00', null, null, null, null, 'manual', 0, null, 1),
  -- ENCERRADO (system/extinction; dash-operator/irregularity)
  ('00000000-0000-7000-8000-000081000113', '00000000-0000-7000-8000-00000000a001', 'IND-DASH-101', 'extinction', 'ENCERRADO', 'N2', 'A', 'rait', 'case', '00000000-0000-7000-8000-000010000002', 'N2', 'rait-manager', 'A', null, '2027-03-09', '2026-09-04T08:00:00-04:00', '2026-09-04T08:15:00-04:00', '2026-09-04T08:30:00-04:00', '2026-09-04T09:00:00-04:00', '2026-09-04T10:00:00-04:00', '2026-09-04T14:00:00-04:00', '2026-09-04T16:00:00-04:00', null, null, null, 'origin', 0, null, 1),
  ('00000000-0000-7000-8000-000081000114', '00000000-0000-7000-8000-00000000a001', 'IND-DASH-301', 'irregularity', 'ENCERRADO', 'N2', 'C', 'portal', 'manifestation', '00000000-0000-7000-8000-000070700001', 'N1', 'dash-duty-owner', null, null, null, '2026-09-04T08:05:00-04:00', '2026-09-04T08:20:00-04:00', '2026-09-04T08:35:00-04:00', '2026-09-04T09:05:00-04:00', '2026-09-04T10:05:00-04:00', '2026-09-04T14:05:00-04:00', '2026-09-04T16:05:00-04:00', null, null, null, 'manual', 0, null, 1),
  -- ESCALONADO (via NOTIFICADO → ESCALONADO; severity N3, escalation_level 1)
  ('00000000-0000-7000-8000-000081000115', '00000000-0000-7000-8000-00000000a001', 'IND-DASH-101', 'extinction', 'ESCALONADO', 'N3', 'A', 'rait', 'case', '00000000-0000-7000-8000-000010000002', 'N2', 'rait-manager', 'A', '2027-03-09T08:00:00-04:00', '2027-03-09', '2026-09-03T08:00:00-04:00', '2026-09-03T08:15:00-04:00', '2026-09-03T08:30:00-04:00', null, null, null, null, '2026-09-03T20:30:00-04:00', null, null, null, 1, null, 1),
  ('00000000-0000-7000-8000-000081000116', '00000000-0000-7000-8000-00000000a001', 'IND-DASH-301', 'irregularity', 'ESCALONADO', 'N3', 'C', 'portal', 'manifestation', '00000000-0000-7000-8000-000070700001', 'N1', 'dash-duty-owner', null, null, null, '2026-09-03T08:05:00-04:00', '2026-09-03T08:20:00-04:00', '2026-09-03T08:35:00-04:00', null, null, null, null, '2026-09-03T20:35:00-04:00', null, null, null, 1, null, 1),
  -- CRITICO_EXTINCAO (só extinction — via CLASSIFICADO → CRITICO_EXTINCAO)
  ('00000000-0000-7000-8000-000081000117', '00000000-0000-7000-8000-00000000a001', 'IND-DASH-101', 'extinction', 'CRITICO_EXTINCAO', 'CRITICO', 'A', 'rait', 'case', '00000000-0000-7000-8000-000010000002', 'N2', 'rait-manager', 'A', null, '2026-09-02', '2026-09-01T08:00:00-04:00', '2026-09-01T08:15:00-04:00', null, null, null, null, null, null, '2026-09-02T08:00:00-04:00', null, null, 0, null, 1),
  -- INCIDENTE_REGISTRADO (só extinction — via CRITICO_EXTINCAO → INCIDENTE_REGISTRADO)
  ('00000000-0000-7000-8000-000081000118', '00000000-0000-7000-8000-00000000a001', 'IND-DASH-101', 'extinction', 'INCIDENTE_REGISTRADO', 'CRITICO', 'A', 'rait', 'case', '00000000-0000-7000-8000-000010000002', 'N2', 'rait-manager', 'A', null, '2026-08-31', '2026-08-30T08:00:00-04:00', '2026-08-30T08:15:00-04:00', null, null, null, null, null, null, '2026-08-31T08:00:00-04:00', '2026-08-31T09:00:00-04:00', null, 0, 'INCIDENTE-2026-000001', 1)
on conflict (id) do update set
  indicator_code = excluded.indicator_code, track = excluded.track, state = excluded.state,
  severity = excluded.severity, block = excluded.block, source_app = excluded.source_app,
  object_kind = excluded.object_kind, object_ref = excluded.object_ref, object_layer = excluded.object_layer,
  owner_role = excluded.owner_role, governing_clock = excluded.governing_clock,
  next_milestone_at = excluded.next_milestone_at, ceiling_on = excluded.ceiling_on,
  detected_at = excluded.detected_at, classified_at = excluded.classified_at, notified_at = excluded.notified_at,
  acknowledged_at = excluded.acknowledged_at, treating_at = excluded.treating_at, verified_at = excluded.verified_at,
  closed_at = excluded.closed_at, escalated_at = excluded.escalated_at, critical_at = excluded.critical_at,
  incident_at = excluded.incident_at, ack_channel = excluded.ack_channel, escalation_level = excluded.escalation_level,
  incident_ref = excluded.incident_ref, version = excluded.version;

-- dashboard.alert_trail — seq 1 = [*] → DETECTADO (actor_kind system) em todo
-- alerta; uma linha por transição até o estado da fixture, pares
-- (from_state, to_state) sempre um dos 13 de `alert_transition_ref` (CTG-0001
-- §3.2). `actor_ref` = id/papel (nunca nome, RN-DASH-171).
insert into dashboard.alert_trail (
  id, tenant_id, alert_id, seq, from_state, to_state, actor_kind, actor_ref, occurred_at, note, root_cause_category
) values
  -- 01 DETECTADO/extinction
  ('00000000-0000-7000-8000-000081002001', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000081000101', 1, null, 'DETECTADO', 'system', 'rait-outbox', '2026-09-10T08:00:00-04:00', null, null),
  -- 02 DETECTADO/irregularity
  ('00000000-0000-7000-8000-000081002002', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000081000102', 1, null, 'DETECTADO', 'system', 'portal-outbox', '2026-09-10T08:05:00-04:00', null, null),
  -- 03 CLASSIFICADO/extinction
  ('00000000-0000-7000-8000-000081002003', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000081000103', 1, null, 'DETECTADO', 'system', 'rait-outbox', '2026-09-09T08:00:00-04:00', null, null),
  ('00000000-0000-7000-8000-000081002004', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000081000103', 2, 'DETECTADO', 'CLASSIFICADO', 'system', null, '2026-09-09T08:15:00-04:00', null, null),
  -- 04 CLASSIFICADO/irregularity
  ('00000000-0000-7000-8000-000081002005', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000081000104', 1, null, 'DETECTADO', 'system', 'portal-outbox', '2026-09-09T08:05:00-04:00', null, null),
  ('00000000-0000-7000-8000-000081002006', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000081000104', 2, 'DETECTADO', 'CLASSIFICADO', 'system', null, '2026-09-09T08:20:00-04:00', null, null),
  -- 05 NOTIFICADO/extinction
  ('00000000-0000-7000-8000-000081002007', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000081000105', 1, null, 'DETECTADO', 'system', 'rait-outbox', '2026-09-08T08:00:00-04:00', null, null),
  ('00000000-0000-7000-8000-000081002008', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000081000105', 2, 'DETECTADO', 'CLASSIFICADO', 'system', null, '2026-09-08T08:15:00-04:00', null, null),
  ('00000000-0000-7000-8000-000081002009', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000081000105', 3, 'CLASSIFICADO', 'NOTIFICADO', 'system', null, '2026-09-08T08:30:00-04:00', null, null),
  -- 06 NOTIFICADO/irregularity
  ('00000000-0000-7000-8000-000081002010', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000081000106', 1, null, 'DETECTADO', 'system', 'portal-outbox', '2026-09-08T08:05:00-04:00', null, null),
  ('00000000-0000-7000-8000-000081002011', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000081000106', 2, 'DETECTADO', 'CLASSIFICADO', 'system', null, '2026-09-08T08:20:00-04:00', null, null),
  ('00000000-0000-7000-8000-000081002012', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000081000106', 3, 'CLASSIFICADO', 'NOTIFICADO', 'system', null, '2026-09-08T08:35:00-04:00', null, null),
  -- 07 RECONHECIDO/extinction (ack origin)
  ('00000000-0000-7000-8000-000081002013', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000081000107', 1, null, 'DETECTADO', 'system', 'rait-outbox', '2026-09-07T08:00:00-04:00', null, null),
  ('00000000-0000-7000-8000-000081002014', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000081000107', 2, 'DETECTADO', 'CLASSIFICADO', 'system', null, '2026-09-07T08:15:00-04:00', null, null),
  ('00000000-0000-7000-8000-000081002015', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000081000107', 3, 'CLASSIFICADO', 'NOTIFICADO', 'system', null, '2026-09-07T08:30:00-04:00', null, null),
  ('00000000-0000-7000-8000-000081002016', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000081000107', 4, 'NOTIFICADO', 'RECONHECIDO', 'system', 'rait-manager', '2026-09-07T09:00:00-04:00', 'ACK automático pela origem (ack_channel=origin)', null),
  -- 08 RECONHECIDO/irregularity (ack manual — nota na trilha, CTG-0001 §5.3)
  ('00000000-0000-7000-8000-000081002017', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000081000108', 1, null, 'DETECTADO', 'system', 'portal-outbox', '2026-09-07T08:05:00-04:00', null, null),
  ('00000000-0000-7000-8000-000081002018', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000081000108', 2, 'DETECTADO', 'CLASSIFICADO', 'system', null, '2026-09-07T08:20:00-04:00', null, null),
  ('00000000-0000-7000-8000-000081002019', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000081000108', 3, 'CLASSIFICADO', 'NOTIFICADO', 'system', null, '2026-09-07T08:35:00-04:00', null, null),
  ('00000000-0000-7000-8000-000081002020', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000081000108', 4, 'NOTIFICADO', 'RECONHECIDO', 'user', 'dash-operator', '2026-09-07T09:05:00-04:00', 'ACK manual pelo Operador de monitoramento em nome do dono (ack_channel=manual)', null),
  -- 09 EM_TRATAMENTO/extinction
  ('00000000-0000-7000-8000-000081002021', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000081000109', 1, null, 'DETECTADO', 'system', 'rait-outbox', '2026-09-06T08:00:00-04:00', null, null),
  ('00000000-0000-7000-8000-000081002022', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000081000109', 2, 'DETECTADO', 'CLASSIFICADO', 'system', null, '2026-09-06T08:15:00-04:00', null, null),
  ('00000000-0000-7000-8000-000081002023', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000081000109', 3, 'CLASSIFICADO', 'NOTIFICADO', 'system', null, '2026-09-06T08:30:00-04:00', null, null),
  ('00000000-0000-7000-8000-000081002024', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000081000109', 4, 'NOTIFICADO', 'RECONHECIDO', 'system', 'rait-manager', '2026-09-06T09:00:00-04:00', null, null),
  ('00000000-0000-7000-8000-000081002025', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000081000109', 5, 'RECONHECIDO', 'EM_TRATAMENTO', 'user', 'rait-manager', '2026-09-06T10:00:00-04:00', null, null),
  -- 10 EM_TRATAMENTO/irregularity
  ('00000000-0000-7000-8000-000081002026', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000081000110', 1, null, 'DETECTADO', 'system', 'portal-outbox', '2026-09-06T08:05:00-04:00', null, null),
  ('00000000-0000-7000-8000-000081002027', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000081000110', 2, 'DETECTADO', 'CLASSIFICADO', 'system', null, '2026-09-06T08:20:00-04:00', null, null),
  ('00000000-0000-7000-8000-000081002028', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000081000110', 3, 'CLASSIFICADO', 'NOTIFICADO', 'system', null, '2026-09-06T08:35:00-04:00', null, null),
  ('00000000-0000-7000-8000-000081002029', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000081000110', 4, 'NOTIFICADO', 'RECONHECIDO', 'user', 'dash-operator', '2026-09-06T09:05:00-04:00', null, null),
  ('00000000-0000-7000-8000-000081002030', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000081000110', 5, 'RECONHECIDO', 'EM_TRATAMENTO', 'user', 'dash-duty-owner', '2026-09-06T10:05:00-04:00', null, null),
  -- 11 VERIFICADO/extinction
  ('00000000-0000-7000-8000-000081002031', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000081000111', 1, null, 'DETECTADO', 'system', 'rait-outbox', '2026-09-05T08:00:00-04:00', null, null),
  ('00000000-0000-7000-8000-000081002032', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000081000111', 2, 'DETECTADO', 'CLASSIFICADO', 'system', null, '2026-09-05T08:15:00-04:00', null, null),
  ('00000000-0000-7000-8000-000081002033', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000081000111', 3, 'CLASSIFICADO', 'NOTIFICADO', 'system', null, '2026-09-05T08:30:00-04:00', null, null),
  ('00000000-0000-7000-8000-000081002034', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000081000111', 4, 'NOTIFICADO', 'RECONHECIDO', 'system', 'rait-manager', '2026-09-05T09:00:00-04:00', null, null),
  ('00000000-0000-7000-8000-000081002035', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000081000111', 5, 'RECONHECIDO', 'EM_TRATAMENTO', 'user', 'rait-manager', '2026-09-05T10:00:00-04:00', null, null),
  ('00000000-0000-7000-8000-000081002036', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000081000111', 6, 'EM_TRATAMENTO', 'VERIFICADO', 'system', null, '2026-09-05T14:00:00-04:00', null, null),
  -- 12 VERIFICADO/irregularity
  ('00000000-0000-7000-8000-000081002037', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000081000112', 1, null, 'DETECTADO', 'system', 'portal-outbox', '2026-09-05T08:05:00-04:00', null, null),
  ('00000000-0000-7000-8000-000081002038', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000081000112', 2, 'DETECTADO', 'CLASSIFICADO', 'system', null, '2026-09-05T08:20:00-04:00', null, null),
  ('00000000-0000-7000-8000-000081002039', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000081000112', 3, 'CLASSIFICADO', 'NOTIFICADO', 'system', null, '2026-09-05T08:35:00-04:00', null, null),
  ('00000000-0000-7000-8000-000081002040', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000081000112', 4, 'NOTIFICADO', 'RECONHECIDO', 'user', 'dash-operator', '2026-09-05T09:05:00-04:00', null, null),
  ('00000000-0000-7000-8000-000081002041', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000081000112', 5, 'RECONHECIDO', 'EM_TRATAMENTO', 'user', 'dash-duty-owner', '2026-09-05T10:05:00-04:00', null, null),
  ('00000000-0000-7000-8000-000081002042', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000081000112', 6, 'EM_TRATAMENTO', 'VERIFICADO', 'system', null, '2026-09-05T14:05:00-04:00', null, null),
  -- 13 ENCERRADO/extinction (VERIFICADO → ENCERRADO por system)
  ('00000000-0000-7000-8000-000081002043', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000081000113', 1, null, 'DETECTADO', 'system', 'rait-outbox', '2026-09-04T08:00:00-04:00', null, null),
  ('00000000-0000-7000-8000-000081002044', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000081000113', 2, 'DETECTADO', 'CLASSIFICADO', 'system', null, '2026-09-04T08:15:00-04:00', null, null),
  ('00000000-0000-7000-8000-000081002045', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000081000113', 3, 'CLASSIFICADO', 'NOTIFICADO', 'system', null, '2026-09-04T08:30:00-04:00', null, null),
  ('00000000-0000-7000-8000-000081002046', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000081000113', 4, 'NOTIFICADO', 'RECONHECIDO', 'system', 'rait-manager', '2026-09-04T09:00:00-04:00', null, null),
  ('00000000-0000-7000-8000-000081002047', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000081000113', 5, 'RECONHECIDO', 'EM_TRATAMENTO', 'user', 'rait-manager', '2026-09-04T10:00:00-04:00', null, null),
  ('00000000-0000-7000-8000-000081002048', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000081000113', 6, 'EM_TRATAMENTO', 'VERIFICADO', 'system', null, '2026-09-04T14:00:00-04:00', null, null),
  ('00000000-0000-7000-8000-000081002049', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000081000113', 7, 'VERIFICADO', 'ENCERRADO', 'system', null, '2026-09-04T16:00:00-04:00', 'confirmação pelo sistema (origem já mudou de estado)', null),
  -- 14 ENCERRADO/irregularity (VERIFICADO → ENCERRADO por dash-operator)
  ('00000000-0000-7000-8000-000081002050', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000081000114', 1, null, 'DETECTADO', 'system', 'portal-outbox', '2026-09-04T08:05:00-04:00', null, null),
  ('00000000-0000-7000-8000-000081002051', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000081000114', 2, 'DETECTADO', 'CLASSIFICADO', 'system', null, '2026-09-04T08:20:00-04:00', null, null),
  ('00000000-0000-7000-8000-000081002052', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000081000114', 3, 'CLASSIFICADO', 'NOTIFICADO', 'system', null, '2026-09-04T08:35:00-04:00', null, null),
  ('00000000-0000-7000-8000-000081002053', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000081000114', 4, 'NOTIFICADO', 'RECONHECIDO', 'user', 'dash-operator', '2026-09-04T09:05:00-04:00', null, null),
  ('00000000-0000-7000-8000-000081002054', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000081000114', 5, 'RECONHECIDO', 'EM_TRATAMENTO', 'user', 'dash-duty-owner', '2026-09-04T10:05:00-04:00', null, null),
  ('00000000-0000-7000-8000-000081002055', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000081000114', 6, 'EM_TRATAMENTO', 'VERIFICADO', 'system', null, '2026-09-04T14:05:00-04:00', null, null),
  ('00000000-0000-7000-8000-000081002056', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000081000114', 7, 'VERIFICADO', 'ENCERRADO', 'user', 'dash-operator', '2026-09-04T16:05:00-04:00', 'confirmação final pelo Operador de monitoramento', null),
  -- 15 ESCALONADO/extinction (via NOTIFICADO → ESCALONADO, SLA vencido)
  ('00000000-0000-7000-8000-000081002057', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000081000115', 1, null, 'DETECTADO', 'system', 'rait-outbox', '2026-09-03T08:00:00-04:00', null, null),
  ('00000000-0000-7000-8000-000081002058', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000081000115', 2, 'DETECTADO', 'CLASSIFICADO', 'system', null, '2026-09-03T08:15:00-04:00', null, null),
  ('00000000-0000-7000-8000-000081002059', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000081000115', 3, 'CLASSIFICADO', 'NOTIFICADO', 'system', null, '2026-09-03T08:30:00-04:00', null, null),
  ('00000000-0000-7000-8000-000081002060', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000081000115', 4, 'NOTIFICADO', 'ESCALONADO', 'timer', 'T-DASH-ACK-N1', '2026-09-03T20:30:00-04:00', 'SLA de reconhecimento vencido sem ACK', null),
  -- 16 ESCALONADO/irregularity
  ('00000000-0000-7000-8000-000081002061', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000081000116', 1, null, 'DETECTADO', 'system', 'portal-outbox', '2026-09-03T08:05:00-04:00', null, null),
  ('00000000-0000-7000-8000-000081002062', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000081000116', 2, 'DETECTADO', 'CLASSIFICADO', 'system', null, '2026-09-03T08:20:00-04:00', null, null),
  ('00000000-0000-7000-8000-000081002063', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000081000116', 3, 'CLASSIFICADO', 'NOTIFICADO', 'system', null, '2026-09-03T08:35:00-04:00', null, null),
  ('00000000-0000-7000-8000-000081002064', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000081000116', 4, 'NOTIFICADO', 'ESCALONADO', 'timer', 'T-DASH-ACK-N1', '2026-09-03T20:35:00-04:00', 'SLA de reconhecimento vencido sem ACK', null),
  -- 17 CRITICO_EXTINCAO/extinction (via CLASSIFICADO → CRITICO_EXTINCAO, sem decisão da origem)
  ('00000000-0000-7000-8000-000081002065', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000081000117', 1, null, 'DETECTADO', 'system', 'rait-outbox', '2026-09-01T08:00:00-04:00', null, null),
  ('00000000-0000-7000-8000-000081002066', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000081000117', 2, 'DETECTADO', 'CLASSIFICADO', 'system', null, '2026-09-01T08:15:00-04:00', null, null),
  ('00000000-0000-7000-8000-000081002067', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000081000117', 3, 'CLASSIFICADO', 'CRITICO_EXTINCAO', 'system', null, '2026-09-02T08:00:00-04:00', 'teto legal atingido sem decisão/ato do app de origem', null),
  -- 18 INCIDENTE_REGISTRADO/extinction (via CRITICO_EXTINCAO → INCIDENTE_REGISTRADO)
  ('00000000-0000-7000-8000-000081002068', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000081000118', 1, null, 'DETECTADO', 'system', 'rait-outbox', '2026-08-30T08:00:00-04:00', null, null),
  ('00000000-0000-7000-8000-000081002069', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000081000118', 2, 'DETECTADO', 'CLASSIFICADO', 'system', null, '2026-08-30T08:15:00-04:00', null, null),
  ('00000000-0000-7000-8000-000081002070', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000081000118', 3, 'CLASSIFICADO', 'CRITICO_EXTINCAO', 'system', null, '2026-08-31T08:00:00-04:00', 'teto legal atingido sem decisão/ato do app de origem', null),
  ('00000000-0000-7000-8000-000081002071', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000081000118', 4, 'CRITICO_EXTINCAO', 'INCIDENTE_REGISTRADO', 'system', null, '2026-08-31T09:00:00-04:00', 'abertura automática de tarefa de apuração (WF-RAIT-002 §4.1)', null)
on conflict (id) do update set
  alert_id = excluded.alert_id, seq = excluded.seq, from_state = excluded.from_state, to_state = excluded.to_state,
  actor_kind = excluded.actor_kind, actor_ref = excluded.actor_ref, occurred_at = excluded.occurred_at,
  note = excluded.note, root_cause_category = excluded.root_cause_category;

-- dashboard.duty_cycle — um por duty_state_ref (8), CTG-0001 §5.3 (tabela
-- estado × duty_code × period). evidence_hash obrigatório em COMPROVADO e
-- ARQUIVADO (ck_dashboard_duty_cycle_evidence).
insert into dashboard.duty_cycle (
  id, tenant_id, duty_code, period, state, deadline_on, opened_at, started_at,
  prepared_at, submitted_at, proved_at, archived_at, late_at, unfulfilled_at,
  draft_ref, evidence_protocol, evidence_capture_uri, evidence_hash, version
) values
  ('00000000-0000-7000-8000-000081000301', '00000000-0000-7000-8000-00000000a001', 'DUTY-01', '2026-09', 'JANELA_ABERTA', '2026-10-20', '2026-09-01T08:00:00-04:00', null, null, null, null, null, null, null, null, null, null, null, 1),
  ('00000000-0000-7000-8000-000081000302', '00000000-0000-7000-8000-00000000a001', 'DUTY-02', '2026-09', 'EM_APURACAO', '2026-09-30', '2026-09-01T08:00:00-04:00', '2026-09-05T08:00:00-04:00', null, null, null, null, null, null, null, null, null, null, 1),
  ('00000000-0000-7000-8000-000081000303', '00000000-0000-7000-8000-00000000a001', 'DUTY-07', '2025', 'PREPARADO', '2026-12-31', '2025-01-01T08:00:00-04:00', '2025-01-10T08:00:00-04:00', '2025-02-01T08:00:00-04:00', null, null, null, null, null, 'DRAFT-DUTY-07-2025', null, null, null, 1),
  ('00000000-0000-7000-8000-000081000304', '00000000-0000-7000-8000-00000000a001', 'DUTY-10', '2026', 'SUBMETIDO_PUBLICADO', '2026-12-31', '2026-01-01T08:00:00-04:00', '2026-01-15T08:00:00-04:00', '2026-02-01T08:00:00-04:00', '2026-02-15T08:00:00-04:00', null, null, null, null, null, 'PROT-DUTY-10-2026', null, null, 1),
  ('00000000-0000-7000-8000-000081000305', '00000000-0000-7000-8000-00000000a001', 'DUTY-01', '2026-08', 'COMPROVADO', '2026-09-20', '2026-08-01T08:00:00-04:00', '2026-08-05T08:00:00-04:00', '2026-08-10T08:00:00-04:00', '2026-08-18T08:00:00-04:00', '2026-08-20T08:00:00-04:00', null, null, null, null, null, 'https://fixtures.detran-am.invalid/duty/duty-01/2026-08', 'sha256-fixture-duty01-2026-08', 1),
  ('00000000-0000-7000-8000-000081000306', '00000000-0000-7000-8000-00000000a001', 'DUTY-01', '2026-07', 'ARQUIVADO', '2026-08-20', '2026-07-01T08:00:00-04:00', '2026-07-05T08:00:00-04:00', '2026-07-10T08:00:00-04:00', '2026-07-18T08:00:00-04:00', '2026-07-20T08:00:00-04:00', '2026-08-05T08:00:00-04:00', null, null, null, null, 'https://fixtures.detran-am.invalid/duty/duty-01/2026-07', 'sha256-fixture-duty01-2026-07', 1),
  ('00000000-0000-7000-8000-000081000307', '00000000-0000-7000-8000-00000000a001', 'DUTY-02', '2026-08', 'ATRASADO', '2026-08-31', '2026-08-01T08:00:00-04:00', null, null, null, null, null, '2026-09-01T08:00:00-04:00', null, null, null, null, null, 1),
  ('00000000-0000-7000-8000-000081000308', '00000000-0000-7000-8000-00000000a001', 'DUTY-02', '2026-07', 'NAO_CUMPRIDO', '2026-07-31', '2026-07-01T08:00:00-04:00', null, null, null, null, null, '2026-07-31T20:00:00-04:00', '2026-08-01T08:00:00-04:00', null, null, null, null, 1)
on conflict (id) do update set
  duty_code = excluded.duty_code, period = excluded.period, state = excluded.state, deadline_on = excluded.deadline_on,
  opened_at = excluded.opened_at, started_at = excluded.started_at, prepared_at = excluded.prepared_at,
  submitted_at = excluded.submitted_at, proved_at = excluded.proved_at, archived_at = excluded.archived_at,
  late_at = excluded.late_at, unfulfilled_at = excluded.unfulfilled_at, draft_ref = excluded.draft_ref,
  evidence_protocol = excluded.evidence_protocol, evidence_capture_uri = excluded.evidence_capture_uri,
  evidence_hash = excluded.evidence_hash, version = excluded.version;

-- dashboard.source — as quatro, uma por freshness_state_ref (CTG-0001 §5.3).
-- acceptable_latency_minutes nulo em todas (M13, source_pending).
insert into dashboard.source (
  id, tenant_id, source_key, app, state, last_seen_at, last_read_at,
  acceptable_latency_minutes, heartbeat_contract, stale_since, hidden, version
) values
  ('00000000-0000-7000-8000-000081000401', '00000000-0000-7000-8000-00000000a001', 'rait.outbox', 'rait', 'FRESCO', '2026-09-15T08:00:00-04:00', '2026-09-15T08:00:00-04:00', null, 'source.heartbeat', null, false, 1),
  ('00000000-0000-7000-8000-000081000402', '00000000-0000-7000-8000-00000000a001', 'teat.offline-sync', 'teat', 'ATRASADO', '2026-09-10T08:00:00-04:00', '2026-09-10T08:00:00-04:00', null, 'source.heartbeat', null, false, 1),
  ('00000000-0000-7000-8000-000081000403', '00000000-0000-7000-8000-00000000a001', 'pec.deadlines', 'pec', 'INDISPONIVEL', '2026-08-20T08:00:00-04:00', null, null, null, null, true, 1),
  ('00000000-0000-7000-8000-000081000404', '00000000-0000-7000-8000-00000000a001', 'boat.crashes', 'boat', 'DESATUALIZADO_MARCADO', '2026-09-05T00:00:00-04:00', '2026-09-14T08:00:00-04:00', null, null, '2026-09-05T00:00:00-04:00', false, 1)
on conflict (id) do update set
  source_key = excluded.source_key, app = excluded.app, state = excluded.state, last_seen_at = excluded.last_seen_at,
  last_read_at = excluded.last_read_at, acceptable_latency_minutes = excluded.acceptable_latency_minutes,
  heartbeat_contract = excluded.heartbeat_contract, stale_since = excluded.stale_since, hidden = excluded.hidden,
  version = excluded.version;

-- dashboard.export_log — uma, pending-approval, row_count acima do limiar do
-- catálogo (parameter-catalogue.md `dashboard.export.approval_rows` = 5000,
-- vigente — não é literal em código, é um dado de fixture SQL: permitido).
-- user_ref/user_role de `00-fixtures-core.sql` (Paulo Teixeira, agency-admin).
insert into dashboard.export_log (
  id, tenant_id, user_ref, user_role, scope, filters_json, format, layer,
  purpose, row_count, status, justification, approved_by, approved_at,
  watermark, suppressed_cells, origin, requested_at
) values (
  '00000000-0000-7000-8000-000081000501', '00000000-0000-7000-8000-00000000a001',
  '00000000-0000-4000-8000-0000b0000016', 'agency-admin', 'alerts', '{}', 'csv', 'N1',
  null, 5001, 'pending-approval', 'exportação de alertas para auditoria trimestral (fixture)', null, null,
  null, 0, null, '2026-09-15T09:00:00-04:00'
)
on conflict (id) do update set
  user_ref = excluded.user_ref, user_role = excluded.user_role, scope = excluded.scope,
  filters_json = excluded.filters_json, format = excluded.format, layer = excluded.layer,
  purpose = excluded.purpose, row_count = excluded.row_count, status = excluded.status,
  justification = excluded.justification, approved_by = excluded.approved_by, approved_at = excluded.approved_at,
  watermark = excluded.watermark, suppressed_cells = excluded.suppressed_cells, origin = excluded.origin,
  requested_at = excluded.requested_at;
