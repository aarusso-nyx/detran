-- Fixtures canônicas do Portal (work/rounds/R-0009/contracts/CTG-0001.md §10; M22 do
-- work/rounds/R-0009/plan.md, com as adendas A1/A2 aplicadas). Idempotente (upsert por id ou
-- por chave natural quando a tabela não tem `id`). Aplicar com backend/database/seed.sh depois
-- de apply.sh. "Hoje" das fixtures = 2026-09-14; tenant canônico
-- 00000000-0000-7000-8000-00000000a001.
--
-- Esquema de ids (CTG-0001 §10.1): 00000000-0000-7000-8000-00007TT000nn, TT = tabela (hex),
-- nn = linha (hex). ff = alvos externos sem fixture canônica neste repositório.
--
-- DIVERGÊNCIAS DDL real × contrato aplicadas aqui (registradas no relatório de entrega da
-- tarefa; o DDL real manda nas colunas — nota do maestro §1 do prompt TASK-0003):
--   D1  portal.brand_profile: chave primária é `tenant_id` (sem coluna `id` própria, sem
--       `created_at`) — DDL manuscrito 19-portal-platform.sql, não o BP-PORTAL-CITIZEN-SERVICE-001
--       do contrato §7.4. Upsert por `on conflict (tenant_id)`.
--   D2  portal.representation.instrument_document_id é `not null` no DDL 61 gerado (o contrato
--       §7.1 pede `null`); usa-se um placeholder `…ff900001` (mesma convenção de "alvo externo
--       sem fixture canônica" do §10.1).
--   D3  portal.entitlement não tem a coluna `representation_id` do contrato §7.1 no DDL 61
--       gerado: a linha …70200009 fica só com `relation='representative'`/`origin='representation'`,
--       sem o vínculo explícito de coluna.
--   D4  portal.request: `service_key` e `minimum_assurance` são `not null` no DDL 62 gerado (o
--       contrato permite null antes da seleção/submissão). Usa-se `service_key='consulta_multas'`
--       (mesma chave da linha seguinte do mesmo sujeito) e `minimum_assurance='none'` nas cinco
--       linhas iniciais (IDENTIFICADO, SERVICO_SELECIONADO, ELEGIBILIDADE_VERIFICADA, INELEGIVEL,
--       PEDIDO_EM_COMPOSICAO) em vez de null.
--   D5  portal.request_draft: o DDL 62 gerado tem `version integer not null` (check > 0), não a
--       coluna `schema_version text` do contrato §7.2 — usa-se `version=1`.
--   D6  portal.inbox_item.read_on é `date` no DDL 63 gerado (contrato §7.3 pede `timestamptz`);
--       usa-se só a data (sem hora) na linha …70c00002.
--   D7  portal.manifestation: o DDL 64 gerado não tem a coluna `info_requested_on` do contrato
--       §7.4 (só `info_due_on`); omitida na linha …70700004. `protocol` é `not null` no DDL
--       gerado (o contrato permite null em `MANIFESTACAO_REGISTRADA`) — a linha …70700001 recebe
--       o próximo protocolo da sequência compartilhada (`…000000e`) em vez de null.
--   D8  portal.sne_enrollment não tem a coluna `version` do contrato §7.3 no DDL 63 gerado —
--       omitida.
--   D9  portal.act_level_policy.decision_ref é `varchar(40)`: quatro citações do contrato §5
--       (linhas 03, 07, 14, 18) excedem 40 caracteres e foram encurtadas mantendo a referência
--       primária (a citação completa permanece em `legal_basis`, que é `text`).
--   D10 portal.infraction_view.last_event_id/last_event_version são `not null` no DDL 65 gerado
--       (o contrato §7.5 os declara `null` até existir projetor real) — usa-se o uuid nulo
--       `00000000-0000-0000-0000-000000000000` e versão 0 como sentinela de "nunca projetado"
--       (M16: produtores reais em R-0010/OD-P19).
--   D11 portal.service_catalog: `title`, `legal_deadline` e a parte "Base" de
--       `normative_reference` de 13 dos 15 serviços vêm de [WF-PORTAL-001] §Catálogo, fora da
--       lista de leitura obrigatória fechada desta tarefa (TASK-0003). O próprio contrato §10.7
--       frisa que os textos de fixture "são dados de teste, não valores de produto" e que o
--       conteúdo real é OD-P26 (já proposta por TASK-0001) — por isso os três campos recebem
--       rótulos de fixture claramente marcados (`… (fixture)`) e `'source_pending (OD-P26)'` em
--       vez de um prazo/base legal inventado. `manifestar` e `avaliar` usam o texto do contrato
--       (`legal_deadline` dado literalmente em §10.7; título "Registrar manifestação" citado em
--       §13).
--   D12 portal.public_hostname.deadline_owned_by/inbox_item.kind seguem a Adenda A2(b) e o DDL
--       real (`citizen|agency`, inglês) em vez do texto não corrigido de M15/§7.3 (`cidadao`).

select set_config('app.role', 'owner', false);
select set_config('app.tenant_id', '00000000-0000-7000-8000-00000000a001', false);

-- 10.2 portal.subject (5)
insert into portal.subject (id, tenant_id, cpf_hash, name, govbr_level_observed, assurance_level_observed, observed_at, version)
values
  ('00000000-0000-7000-8000-000070000001', '00000000-0000-7000-8000-00000000a001', '534a4a8eafcd8489af32356d5a7a25f88c70cfe0448539a7c42964c1b897a359', 'Cidadão Bronze (fixture)', 'bronze', 'simples', '2026-09-14T12:00:00-04:00', 1),
  ('00000000-0000-7000-8000-000070000002', '00000000-0000-7000-8000-00000000a001', 'd5996b25e580c95b90cfc8a69898b31ee8edb66bea003ac99801b8cab34c2bb4', 'Cidadã Prata (fixture)', 'prata', 'avancada', '2026-09-14T12:00:00-04:00', 1),
  ('00000000-0000-7000-8000-000070000003', '00000000-0000-7000-8000-00000000a001', '90bdb56dba0745a3236c1c38f185878fcdce441ee4e5ab171dfe0e08a6170016', 'Cidadão Ouro (fixture)', 'ouro', 'avancada', '2026-09-14T12:00:00-04:00', 1),
  ('00000000-0000-7000-8000-000070000004', '00000000-0000-7000-8000-00000000a001', '34ce32f4cacdd770d6bb0977e066f74724b170f3ccf7002baa802170711f99df', 'Cidadã Qualificada (fixture)', 'qualificada', 'qualificada', '2026-09-14T12:00:00-04:00', 1),
  ('00000000-0000-7000-8000-000070000005', '00000000-0000-7000-8000-00000000a001', 'a96fb099c9fe2b2866c515ce063539186c7103dd14b9df1a91741a7afd7f94fd', 'Procurador (fixture)', 'ouro', 'avancada', '2026-09-14T12:00:00-04:00', 1)
on conflict (id) do update set
  cpf_hash = excluded.cpf_hash, name = excluded.name, govbr_level_observed = excluded.govbr_level_observed,
  assurance_level_observed = excluded.assurance_level_observed, observed_at = excluded.observed_at, version = excluded.version;

-- 10.3 portal.representation (1) — D2: instrument_document_id not null no DDL real (placeholder)
insert into portal.representation (id, tenant_id, representative_subject_id, represented_cpf_hash, represented_name, instrument_document_id, scope, valid_until, state, refusal_reason)
values (
  '00000000-0000-7000-8000-000070100001', '00000000-0000-7000-8000-00000000a001',
  '00000000-0000-7000-8000-000070000005', 'd5996b25e580c95b90cfc8a69898b31ee8edb66bea003ac99801b8cab34c2bb4',
  'Cidadã Prata (fixture)', '00000000-0000-7000-8000-0000ff900001', 'ait', '2027-09-14', 'PROCURACAO_VALIDADA', null
)
on conflict (id) do update set
  represented_cpf_hash = excluded.represented_cpf_hash, represented_name = excluded.represented_name,
  instrument_document_id = excluded.instrument_document_id, scope = excluded.scope,
  valid_until = excluded.valid_until, state = excluded.state, refusal_reason = excluded.refusal_reason;

-- 10.3 portal.entitlement (12) — D3: sem coluna representation_id no DDL real
insert into portal.entitlement (id, tenant_id, subject_id, target_kind, target_id, relation, origin, valid_from, valid_until)
values
  ('00000000-0000-7000-8000-000070200001', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000070000001', 'ait', '00000000-0000-7000-8000-0000f0000001', 'owner', 'infraction', '2026-01-01', null),
  ('00000000-0000-7000-8000-000070200002', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000070000002', 'ait', '00000000-0000-7000-8000-0000f0000002', 'owner', 'infraction', '2026-01-01', null),
  ('00000000-0000-7000-8000-000070200003', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000070000002', 'ait', '00000000-0000-7000-8000-0000f0000003', 'owner', 'infraction', '2026-01-01', null),
  ('00000000-0000-7000-8000-000070200004', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000070000002', 'ait', '00000000-0000-7000-8000-0000f0000005', 'owner', 'infraction', '2026-01-01', null),
  ('00000000-0000-7000-8000-000070200005', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000070000002', 'ait', '00000000-0000-7000-8000-0000f0000010', 'owner', 'infraction', '2026-01-01', null),
  ('00000000-0000-7000-8000-000070200006', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000070000003', 'ait', '00000000-0000-7000-8000-0000f0000006', 'owner', 'infraction', '2026-01-01', null),
  ('00000000-0000-7000-8000-000070200007', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000070000003', 'ait', '00000000-0000-7000-8000-0000f0000012', 'owner', 'infraction', '2026-01-01', null),
  ('00000000-0000-7000-8000-000070200008', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000070000004', 'ait', '00000000-0000-7000-8000-0000f0000009', 'driver', 'infraction', '2026-01-01', null),
  ('00000000-0000-7000-8000-000070200009', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000070000005', 'ait', '00000000-0000-7000-8000-0000f0000002', 'representative', 'representation', '2026-01-01', '2027-09-14'),
  ('00000000-0000-7000-8000-00007020000a', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000070000003', 'vehicle', '00000000-0000-7000-8000-00007ff00001', 'owner', 'renavam', '2026-01-01', null),
  ('00000000-0000-7000-8000-00007020000b', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000070000003', 'exam', '00000000-0000-7000-8000-00007ff00002', 'interested_party', 'manual', '2026-01-01', null),
  ('00000000-0000-7000-8000-00007020000c', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000070000004', 'crash', '00000000-0000-7000-8000-00007ff00003', 'interested_party', 'manual', '2026-01-01', null),
  ('00000000-0000-7000-8000-00007020000d', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000070000002', 'vehicle', 'a1204f2f-07f6-551a-9e82-0e28038d3049', 'owner', 'renavam', '2026-01-01', null)
on conflict (id) do update set
  target_kind = excluded.target_kind, target_id = excluded.target_id, relation = excluded.relation,
  origin = excluded.origin, valid_from = excluded.valid_from, valid_until = excluded.valid_until;

-- 10.4 portal.act_level_policy (21) — D9: decision_ref encurtado para caber em varchar(40) em
-- 4 linhas (03, 07, 14, 18); legal_basis mantém a citação completa (text, sem limite).
insert into portal.act_level_policy (id, tenant_id, act_key, minimum_assurance, legal_basis, decision_ref, enabled, effective_from, effective_to)
values
  ('00000000-0000-7000-8000-000070300001', '00000000-0000-7000-8000-00000000a001', 'consulta_multas', 'simples', 'Decreto 10.543/2020 art. 4º, I, "b"', 'RN-PORTAL-101 linha 1', true, '2026-01-01', null),
  ('00000000-0000-7000-8000-000070300002', '00000000-0000-7000-8000-00000000a001', 'consulta_cnh', 'simples', 'Decreto 10.543/2020 art. 4º, I, "b"', 'RN-PORTAL-101 linha 1', true, '2026-01-01', null),
  ('00000000-0000-7000-8000-000070300003', '00000000-0000-7000-8000-00000000a001', 'emissao_crlv', 'simples', 'Decreto 10.543/2020 art. 4º, I, "b" (consulta; emissão condicionada a quitação — Res. CONTRAN 809/2020 art. 4º, não é nível)', 'RN-PORTAL-101 linha 1', true, '2026-01-01', null),
  ('00000000-0000-7000-8000-000070300004', '00000000-0000-7000-8000-00000000a001', 'pagamento', 'simples', 'Decreto 10.543/2020 art. 4º, I, "a" e "c" (guia; transação em si fora do Decreto — linha 11)', 'RN-PORTAL-101 linha 10', true, '2026-01-01', null),
  ('00000000-0000-7000-8000-000070300005', '00000000-0000-7000-8000-00000000a001', 'adesao_sne', 'avancada', 'Decreto 10.543/2020 art. 4º, II, "d" e "f" (subsunção)', 'RN-PORTAL-101 linha 9', true, '2026-01-01', null),
  ('00000000-0000-7000-8000-000070300006', '00000000-0000-7000-8000-00000000a001', 'cancelamento_sne', 'avancada', 'Decreto 10.543/2020 art. 4º, II, "d" e "f" (subsunção) — idem adesao_sne', 'RN-PORTAL-101 linha 9', true, '2026-01-01', null),
  ('00000000-0000-7000-8000-000070300007', '00000000-0000-7000-8000-00000000a001', 'lgpd_declaracao', 'simples', 'Decreto 10.543/2020 art. 4º, I, "b"; LGPD art. 19, I (escopo confirmacao)', 'WF-PORTAL-001 §Catálogo', true, '2026-01-01', null),
  ('00000000-0000-7000-8000-000070300008', '00000000-0000-7000-8000-00000000a001', 'acompanhar_manifestacao', 'simples', 'Decreto 10.543/2020 art. 2º, §ú, III (ouvidoria fora do Decreto); nível simples por decisão do Owner', 'H.51; WF-PORTAL-004 §Decisão 2026-09-13', true, '2026-01-01', null),
  ('00000000-0000-7000-8000-000070300009', '00000000-0000-7000-8000-00000000a001', 'defesa_previa', 'avancada', 'Decreto 10.543/2020 art. 4º, II, "h"; PN DETRAN-AM 001/2025 art. 3º, VI', 'RN-PORTAL-101 linha 6; H.50', true, '2026-01-01', null),
  ('00000000-0000-7000-8000-00007030000a', '00000000-0000-7000-8000-00000000a001', 'recurso_jari', 'avancada', 'Decreto 10.543/2020 art. 4º, II, "h"; PN DETRAN-AM 001/2025 art. 3º, VI — idem defesa_previa', 'RN-PORTAL-101 linha 6; H.50', true, '2026-01-01', null),
  ('00000000-0000-7000-8000-00007030000b', '00000000-0000-7000-8000-00000000a001', 'recurso_cetran', 'avancada', 'Decreto 10.543/2020 art. 4º, II, "h"; PN 001/2025 art. 3º VI por adoção administrativa (CETRAN-AM é órgão externo)', 'H.49 (portal.cetran_appeal_level); H.50', true, '2026-01-01', null),
  ('00000000-0000-7000-8000-00007030000c', '00000000-0000-7000-8000-00000000a001', 'indicacao_condutor', 'avancada', 'Decreto 10.543/2020 art. 4º, II, "f" (subsunção; CTB art. 257 §7º c/c Res. 918 art. 5º); PN 001/2025 art. 3º VI', 'RN-PORTAL-101 linha 5; H.50', true, '2026-01-01', null),
  ('00000000-0000-7000-8000-00007030000d', '00000000-0000-7000-8000-00000000a001', 'procuracao', 'avancada', 'PN DETRAN-AM 001/2025 art. 3º, V; Res. CONTRAN 900 art. 2º §2º', 'RN-PORTAL-101 §Fonte institucional; H.50', true, '2026-01-01', null),
  ('00000000-0000-7000-8000-00007030000e', '00000000-0000-7000-8000-00000000a001', 'junta_medica', 'avancada', 'Decreto 10.543/2020 art. 4º, II (requerimento em procedimento administrativo); Res. CONTRAN 927/2022 art. 12', 'WF-PORTAL-001 §Catálogo; OD-P19', true, '2026-01-01', null),
  ('00000000-0000-7000-8000-00007030000f', '00000000-0000-7000-8000-00000000a001', 'lgpd_declaracao:declaracao_completa', 'avancada', 'Decreto 10.543/2020 art. 4º, II; LGPD art. 19, II', 'WF-PORTAL-001 §Catálogo', true, '2026-01-01', null),
  ('00000000-0000-7000-8000-000070300010', '00000000-0000-7000-8000-00000000a001', 'lgpd_declaracao:correcao', 'avancada', 'Decreto 10.543/2020 art. 4º, II, "f"; LGPD art. 18, III', 'plan.md M5', true, '2026-01-01', null),
  ('00000000-0000-7000-8000-000070300011', '00000000-0000-7000-8000-00000000a001', 'lgpd_declaracao:eliminacao', 'avancada', 'Decreto 10.543/2020 art. 4º, II, "f"; LGPD art. 18, VI', 'plan.md M5', true, '2026-01-01', null),
  ('00000000-0000-7000-8000-000070300012', '00000000-0000-7000-8000-00000000a001', 'manifestar', 'none', 'Decreto 10.543/2020 art. 2º, §ú, III; Lei 13.460 arts. 10 §1º e 11', 'RN-PORTAL-101 linha 3; RN-PORTAL-109', true, '2026-01-01', null),
  ('00000000-0000-7000-8000-000070300013', '00000000-0000-7000-8000-00000000a001', 'consulta_bat', 'simples', 'Decreto 10.543/2020 art. 4º, I, "b" (dado próprio; terceiro sujeito à LGPD art. 13)', 'WF-PORTAL-001 §Catálogo', true, '2026-01-01', null),
  ('00000000-0000-7000-8000-000070300014', '00000000-0000-7000-8000-00000000a001', 'consulta_exame', 'simples', 'Decreto 10.543/2020 art. 4º, I, "b"', 'WF-PORTAL-001 §Catálogo', true, '2026-01-01', null),
  ('00000000-0000-7000-8000-000070300015', '00000000-0000-7000-8000-00000000a001', 'avaliar', 'simples', 'Lei 13.460/2017 art. 23; Decreto 10.543 art. 4º I, "b"', 'WF-PORTAL-001 §Catálogo', true, '2026-01-01', null)
on conflict (id) do update set
  act_key = excluded.act_key, minimum_assurance = excluded.minimum_assurance, legal_basis = excluded.legal_basis,
  decision_ref = excluded.decision_ref, enabled = excluded.enabled, effective_from = excluded.effective_from,
  effective_to = excluded.effective_to;

-- 10.5 portal.request (13, uma por estado) — D4: service_key/minimum_assurance not null no DDL
-- real; as cinco linhas iniciais usam 'consulta_multas'/'none' em vez de null (ver cabeçalho).
insert into portal.request (
  id, tenant_id, state, service_key, subject_id, target_kind, target_id, channel,
  delegation_domain, delegation_command, delegation_external_id, delegation_status, delegation_error,
  minimum_assurance, version, withdrawn_at
)
values
  ('00000000-0000-7000-8000-000070400001', '00000000-0000-7000-8000-00000000a001', 'IDENTIFICADO', 'consulta_multas', '00000000-0000-7000-8000-000070000001', 'none', null, 'portal', null, null, null, 'not_applicable', null, 'none', 1, null),
  ('00000000-0000-7000-8000-000070400002', '00000000-0000-7000-8000-00000000a001', 'SERVICO_SELECIONADO', 'consulta_multas', '00000000-0000-7000-8000-000070000001', 'none', null, 'portal', null, null, null, 'not_applicable', null, 'none', 1, null),
  ('00000000-0000-7000-8000-000070400003', '00000000-0000-7000-8000-00000000a001', 'ELEGIBILIDADE_VERIFICADA', 'consulta_multas', '00000000-0000-7000-8000-000070000001', 'none', null, 'portal', null, null, null, 'not_applicable', null, 'none', 1, null),
  ('00000000-0000-7000-8000-000070400004', '00000000-0000-7000-8000-00000000a001', 'INELEGIVEL', 'indicacao_condutor', '00000000-0000-7000-8000-000070000002', 'ait', '00000000-0000-7000-8000-0000f0000010', 'portal', null, null, null, 'not_applicable', null, 'none', 1, null),
  ('00000000-0000-7000-8000-000070400005', '00000000-0000-7000-8000-00000000a001', 'PEDIDO_EM_COMPOSICAO', 'adesao_sne', '00000000-0000-7000-8000-000070000002', 'none', null, 'portal', null, null, null, 'pending', null, 'none', 1, null),
  ('00000000-0000-7000-8000-000070400006', '00000000-0000-7000-8000-00000000a001', 'AGUARDANDO_NIVEL_ASSINATURA', 'adesao_sne', '00000000-0000-7000-8000-000070000001', 'none', null, 'portal', null, null, null, 'pending', null, 'avancada', 1, null),
  ('00000000-0000-7000-8000-000070400007', '00000000-0000-7000-8000-00000000a001', 'AGUARDANDO_PAGAMENTO', 'emissao_crlv', '00000000-0000-7000-8000-000070000003', 'vehicle', '00000000-0000-7000-8000-00007ff00001', 'portal', null, null, null, 'pending', null, 'simples', 1, null),
  ('00000000-0000-7000-8000-000070400008', '00000000-0000-7000-8000-00000000a001', 'PROTOCOLADO', 'adesao_sne', '00000000-0000-7000-8000-000070000003', 'none', null, 'portal', null, null, null, 'failed', 'fixture: falha simulada', 'avancada', 1, null),
  ('00000000-0000-7000-8000-000070400009', '00000000-0000-7000-8000-00000000a001', 'EM_ANDAMENTO_NO_ORGAO', 'adesao_sne', '00000000-0000-7000-8000-000070000004', 'none', null, 'portal', 'portal', 'portal:sne-enrollment:enroll', null, 'delegated', null, 'avancada', 1, null),
  ('00000000-0000-7000-8000-00007040000a', '00000000-0000-7000-8000-00000000a001', 'RESULTADO_DISPONIVEL', 'consulta_exame', '00000000-0000-7000-8000-000070000003', 'exam', '00000000-0000-7000-8000-00007ff00002', 'portal', null, null, null, 'delegated', null, 'simples', 1, null),
  ('00000000-0000-7000-8000-00007040000b', '00000000-0000-7000-8000-00000000a001', 'AVALIACAO_OFERECIDA', 'consulta_bat', '00000000-0000-7000-8000-000070000004', 'crash', '00000000-0000-7000-8000-00007ff00003', 'portal', null, null, null, 'delegated', null, 'simples', 1, null),
  ('00000000-0000-7000-8000-00007040000c', '00000000-0000-7000-8000-00000000a001', 'CONCLUIDO', 'adesao_sne', '00000000-0000-7000-8000-000070000002', 'none', null, 'portal', null, null, '00000000-0000-7000-8000-000070e00001', 'delegated', null, 'avancada', 1, null),
  ('00000000-0000-7000-8000-00007040000d', '00000000-0000-7000-8000-00000000a001', 'DESISTIDO', 'emissao_crlv', '00000000-0000-7000-8000-000070000003', 'vehicle', '00000000-0000-7000-8000-00007ff00001', 'portal', null, null, null, 'not_applicable', null, 'simples', 1, '2026-09-10T12:00:00-04:00')
on conflict (id) do update set
  state = excluded.state, service_key = excluded.service_key, target_kind = excluded.target_kind,
  target_id = excluded.target_id, delegation_domain = excluded.delegation_domain,
  delegation_command = excluded.delegation_command, delegation_external_id = excluded.delegation_external_id,
  delegation_status = excluded.delegation_status, delegation_error = excluded.delegation_error,
  minimum_assurance = excluded.minimum_assurance, version = excluded.version, withdrawn_at = excluded.withdrawn_at;

-- 10.5 portal.request_draft (1) — D5: coluna real é `version`, não `schema_version`
insert into portal.request_draft (id, tenant_id, request_id, version, payload_json, saved_at)
values ('00000000-0000-7000-8000-000070500001', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000070400005', 1, '{}'::jsonb, '2026-09-14T12:00:00-04:00')
on conflict (id) do update set version = excluded.version, payload_json = excluded.payload_json, saved_at = excluded.saved_at;

-- 10.5 portal.protocol (5) — receipt_hash = sha256('{"number":"<number>","requestId":"<id>"}')
insert into portal.protocol (id, tenant_id, request_id, number, issued_at, channel, receipt_hash)
values
  ('00000000-0000-7000-8000-000070600001', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000070400008', 'AM-FIXTURES-2026-0000001', '2026-09-01T12:00:00-04:00', 'portal', '5b4b748cc458ec75e90ae517fe0332f0b9e4fc5ed3fd0edbbd2ebdf8a8c5ef4d'),
  ('00000000-0000-7000-8000-000070600002', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000070400009', 'AM-FIXTURES-2026-0000002', '2026-09-02T12:00:00-04:00', 'portal', 'b5295fd0496afced3949c9042d1ebc1f2bdecd4a09dadbee4c8545bfd976a4fc'),
  ('00000000-0000-7000-8000-000070600003', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-00007040000a', 'AM-FIXTURES-2026-0000003', '2026-09-03T12:00:00-04:00', 'portal', 'e6b5a4bc63fec636bf29c30c058b866f8a92124d432785fcc9a528c8f5068a24'),
  ('00000000-0000-7000-8000-000070600004', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-00007040000b', 'AM-FIXTURES-2026-0000004', '2026-09-04T12:00:00-04:00', 'portal', '0f86f8c810923e76c33cec5654066fa0b3196bcd1c0e775804da146b36bd784d'),
  ('00000000-0000-7000-8000-000070600005', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-00007040000c', 'AM-FIXTURES-2026-0000005', '2026-09-05T12:00:00-04:00', 'portal', '9a3cd1e8027855af2b2f30500162f0eb7f1e0b6972aa318675fbbfec739f515d')
on conflict (id) do update set number = excluded.number, issued_at = excluded.issued_at, receipt_hash = excluded.receipt_hash;

-- 10.6 portal.manifestation (9) — D7: protocol not null no DDL real; texto livre (`text`) é
-- dado de teste ("Texto da manifestação (fixture)"), nunca conteúdo real de um cidadão.
insert into portal.manifestation (
  id, tenant_id, state, kind, confidential, anonymous, subject_id, text, protocol,
  received_at, agency_due_on, info_due_on, decision_text, decided_at, acknowledged_at, version
)
values
  ('00000000-0000-7000-8000-000070700001', '00000000-0000-7000-8000-00000000a001', 'MANIFESTACAO_REGISTRADA', 'reclamacao', false, true, null, 'Texto da manifestação (fixture)', 'AM-FIXTURES-2026-000000e', '2026-09-14T12:00:00-04:00', '2026-10-14', null, null, null, null, 1),
  ('00000000-0000-7000-8000-000070700002', '00000000-0000-7000-8000-00000000a001', 'COMPROVANTE_EMITIDO', 'denuncia', true, false, '00000000-0000-7000-8000-000070000001', 'Texto da manifestação (fixture)', 'AM-FIXTURES-2026-0000006', '2026-09-13T12:00:00-04:00', '2026-10-13', null, null, null, null, 1),
  ('00000000-0000-7000-8000-000070700003', '00000000-0000-7000-8000-00000000a001', 'EM_ANALISE', 'sugestao', false, false, '00000000-0000-7000-8000-000070000002', 'Texto da manifestação (fixture)', 'AM-FIXTURES-2026-0000007', '2026-09-01T12:00:00-04:00', '2026-10-01', null, null, null, null, 1),
  ('00000000-0000-7000-8000-000070700004', '00000000-0000-7000-8000-00000000a001', 'INFORMACAO_SOLICITADA_AO_AGENTE', 'reclamacao', false, false, '00000000-0000-7000-8000-000070000002', 'Texto da manifestação (fixture)', 'AM-FIXTURES-2026-0000008', '2026-08-25T12:00:00-04:00', '2026-09-24', '2026-09-21', null, null, null, 1),
  ('00000000-0000-7000-8000-000070700005', '00000000-0000-7000-8000-00000000a001', 'DECISAO_FINAL_ELABORADA', 'solicitacao', false, false, '00000000-0000-7000-8000-000070000003', 'Texto da manifestação (fixture)', 'AM-FIXTURES-2026-0000009', '2026-08-20T12:00:00-04:00', '2026-09-19', null, 'fixture', '2026-09-10T12:00:00-04:00', null, 1),
  ('00000000-0000-7000-8000-000070700006', '00000000-0000-7000-8000-00000000a001', 'CIENCIA_AO_USUARIO', 'elogio', false, false, '00000000-0000-7000-8000-000070000003', 'Texto da manifestação (fixture)', 'AM-FIXTURES-2026-000000a', '2026-08-10T12:00:00-04:00', '2026-09-09', null, 'fixture', '2026-09-01T12:00:00-04:00', null, 1),
  ('00000000-0000-7000-8000-000070700007', '00000000-0000-7000-8000-00000000a001', 'ENCERRADA', 'reclamacao', false, false, '00000000-0000-7000-8000-000070000004', 'Texto da manifestação (fixture)', 'AM-FIXTURES-2026-000000b', '2026-07-20T12:00:00-04:00', '2026-08-19', null, 'fixture', '2026-09-05T12:00:00-04:00', '2026-09-10T12:00:00-04:00', 1),
  ('00000000-0000-7000-8000-000070700008', '00000000-0000-7000-8000-00000000a001', 'AVALIACAO_OFERECIDA', 'reclamacao', false, false, '00000000-0000-7000-8000-000070000002', 'Texto da manifestação (fixture)', 'AM-FIXTURES-2026-000000c', '2026-07-10T12:00:00-04:00', '2026-08-09', null, 'fixture', '2026-08-01T12:00:00-04:00', '2026-08-05T12:00:00-04:00', 1),
  ('00000000-0000-7000-8000-000070700009', '00000000-0000-7000-8000-00000000a001', 'AVALIADA', 'sugestao', false, false, '00000000-0000-7000-8000-000070000001', 'Texto da manifestação (fixture)', 'AM-FIXTURES-2026-000000d', '2026-06-15T12:00:00-04:00', '2026-07-15', null, 'fixture', '2026-07-01T12:00:00-04:00', '2026-07-10T12:00:00-04:00', 1)
on conflict (id) do update set
  state = excluded.state, kind = excluded.kind, confidential = excluded.confidential, anonymous = excluded.anonymous,
  subject_id = excluded.subject_id, protocol = excluded.protocol, received_at = excluded.received_at,
  agency_due_on = excluded.agency_due_on, info_due_on = excluded.info_due_on, decision_text = excluded.decision_text,
  decided_at = excluded.decided_at, acknowledged_at = excluded.acknowledged_at, version = excluded.version;

-- 10.6 portal.manifestation_extension (1)
insert into portal.manifestation_extension (id, tenant_id, manifestation_id, timer, justification, extended_on, new_due_on)
values ('00000000-0000-7000-8000-000070800001', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000070700007', 'T-OUV-RESPOSTA', 'fixture: prorrogação justificada', '2026-08-15', '2026-09-18')
on conflict (id) do update set justification = excluded.justification, extended_on = excluded.extended_on, new_due_on = excluded.new_due_on;

-- 10.7 portal.service_catalog (15: 9 available / 2 partially_available / 4 unavailable) — D11:
-- title/legal_deadline/normative_reference(Base) de 13 serviços são texto de fixture claramente
-- marcado (ver cabeçalho); manifestar/avaliar usam o texto dado pelo contrato §10.7/§13.
insert into portal.service_catalog (
  id, tenant_id, service_key, route, category, title, summary, requirements_json, delivery_channel,
  legal_deadline, cost, accessibility_note, responsible_party, normative_reference, availability,
  unavailable_reason, alternative_channel_note, minimum_assurance, version, effective_from
)
values
  ('00000000-0000-7000-8000-000070900001', '00000000-0000-7000-8000-00000000a001', 'consulta_multas', '/servicos/consulta-multas', 'inf', 'Consulta de multas (fixture)', 'Consulta de multas (fixture)', '["Conta gov.br"]'::jsonb, 'portal', 'source_pending (OD-P26)', 'gratuito', 'Conforme declaração de acessibilidade (RN-PORTAL-113)', 'DETRAN-AM', 'minimo=simples; base=source_pending (OD-P26)', 'available', null, null, 'simples', 1, '2026-01-01'),
  ('00000000-0000-7000-8000-000070900002', '00000000-0000-7000-8000-00000000a001', 'consulta_cnh', '/servicos/consulta-cnh', 'ch', 'Consulta da CNH (fixture)', 'Consulta da CNH (fixture)', '["Conta gov.br"]'::jsonb, 'portal', 'source_pending (OD-P26)', 'gratuito', 'Conforme declaração de acessibilidade (RN-PORTAL-113)', 'DETRAN-AM', 'minimo=simples; base=source_pending (OD-P26)', 'available', null, null, 'simples', 1, '2026-01-01'),
  ('00000000-0000-7000-8000-000070900003', '00000000-0000-7000-8000-00000000a001', 'emissao_crlv', '/servicos/emissao-crlv', 'est', 'Emissão do CRLV-e (fixture)', 'Emissão do CRLV-e (fixture)', '["Conta gov.br"]'::jsonb, 'portal', 'source_pending (OD-P26)', 'source_pending', 'Conforme declaração de acessibilidade (RN-PORTAL-113)', 'DETRAN-AM', 'minimo=simples; base=source_pending (OD-P26)', 'available', null, null, 'simples', 1, '2026-01-01'),
  ('00000000-0000-7000-8000-000070900004', '00000000-0000-7000-8000-00000000a001', 'adesao_sne', '/servicos/adesao-sne', 'inf', 'Adesão ao SNE (fixture)', 'Adesão ao SNE (fixture)', '["Conta gov.br", "Nível avançado (prata, ouro ou e-Notariado)"]'::jsonb, 'portal', 'source_pending (OD-P26)', 'gratuito', 'Conforme declaração de acessibilidade (RN-PORTAL-113)', 'DETRAN-AM', 'minimo=avancada; base=source_pending (OD-P26)', 'available', null, null, 'avancada', 1, '2026-01-01'),
  ('00000000-0000-7000-8000-000070900005', '00000000-0000-7000-8000-00000000a001', 'cancelamento_sne', '/servicos/cancelamento-sne', 'inf', 'Cancelamento da adesão ao SNE (fixture)', 'Cancelamento da adesão ao SNE (fixture)', '["Conta gov.br", "Nível avançado (prata, ouro ou e-Notariado)"]'::jsonb, 'portal', 'source_pending (OD-P26)', 'gratuito', 'Conforme declaração de acessibilidade (RN-PORTAL-113)', 'DETRAN-AM', 'minimo=avancada; base=source_pending (OD-P26)', 'available', null, null, 'avancada', 1, '2026-01-01'),
  ('00000000-0000-7000-8000-000070900006', '00000000-0000-7000-8000-00000000a001', 'consulta_bat', '/servicos/consulta-bat', 'est', 'Consulta do BAT (fixture)', 'Consulta do BAT (fixture)', '["Conta gov.br"]'::jsonb, 'portal', 'source_pending (OD-P26)', 'gratuito', 'Conforme declaração de acessibilidade (RN-PORTAL-113)', 'DETRAN-AM', 'minimo=simples; base=source_pending (OD-P26)', 'available', null, null, 'simples', 1, '2026-01-01'),
  ('00000000-0000-7000-8000-000070900007', '00000000-0000-7000-8000-00000000a001', 'consulta_exame', '/servicos/consulta-exame', 'ch', 'Consulta de exame (fixture)', 'Consulta de exame (fixture)', '["Conta gov.br"]'::jsonb, 'portal', 'source_pending (OD-P26)', 'gratuito', 'Conforme declaração de acessibilidade (RN-PORTAL-113)', 'DETRAN-AM', 'minimo=simples; base=source_pending (OD-P26)', 'available', null, null, 'simples', 1, '2026-01-01'),
  ('00000000-0000-7000-8000-000070900008', '00000000-0000-7000-8000-00000000a001', 'manifestar', '/servicos/manifestar', 'transversal', 'Registrar manifestação', 'Registrar manifestação', '[]'::jsonb, 'portal', 'resposta em 30 dias, prorrogável 1x — Lei 13.460 art. 16', 'gratuito', 'Conforme declaração de acessibilidade (RN-PORTAL-113)', 'DETRAN-AM', 'minimo=none; base=Lei 13.460/2017 art. 10 §1º e 11', 'available', null, null, 'none', 1, '2026-01-01'),
  ('00000000-0000-7000-8000-000070900009', '00000000-0000-7000-8000-00000000a001', 'avaliar', '/servicos/avaliar', 'transversal', 'Avaliar atendimento (fixture)', 'Avaliar atendimento (fixture)', '["Conta gov.br"]'::jsonb, 'portal', 'sem prazo próprio', 'gratuito', 'Conforme declaração de acessibilidade (RN-PORTAL-113)', 'DETRAN-AM', 'minimo=simples; base=Lei 13.460/2017 art. 23', 'available', null, null, 'simples', 1, '2026-01-01'),
  ('00000000-0000-7000-8000-00007090000a', '00000000-0000-7000-8000-00000000a001', 'pagamento', '/servicos/pagamento', 'inf', 'Pagamento de multas (fixture)', 'Pagamento de multas (fixture)', '["Conta gov.br"]'::jsonb, 'portal', 'source_pending (OD-P26)', 'valor da multa', 'Conforme declaração de acessibilidade (RN-PORTAL-113)', 'DETRAN-AM', 'minimo=simples; base=source_pending (OD-P26)', 'partially_available', null, 'Somente guia PIX/boleto; cartão e parcelamento indisponíveis (OD-P05)', 'simples', 1, '2026-01-01'),
  ('00000000-0000-7000-8000-00007090000b', '00000000-0000-7000-8000-00000000a001', 'lgpd_declaracao', '/servicos/lgpd-declaracao', 'transversal', 'Declaração LGPD (fixture)', 'Declaração LGPD (fixture)', '["Conta gov.br"]'::jsonb, 'portal', 'source_pending (OD-P26)', 'gratuito', 'Conforme declaração de acessibilidade (RN-PORTAL-113)', 'DETRAN-AM', 'minimo=simples; base=source_pending (OD-P26)', 'partially_available', null, 'Somente confirmação de tratamento; declaração completa pendente (OD-P17)', 'simples', 1, '2026-01-01'),
  ('00000000-0000-7000-8000-00007090000c', '00000000-0000-7000-8000-00000000a001', 'defesa_previa', '/servicos/defesa-previa', 'inf', 'Defesa prévia (fixture)', 'Defesa prévia (fixture)', '["Conta gov.br", "Nível avançado (prata, ouro ou e-Notariado)"]'::jsonb, 'portal', 'source_pending (OD-P26)', 'gratuito', 'Conforme declaração de acessibilidade (RN-PORTAL-113)', 'DETRAN-AM', 'minimo=avancada; base=source_pending (OD-P26)', 'unavailable', 'delegacao_indisponivel_r0007', 'Atendimento presencial ([REF-DETRANAM-SERVICOS])', 'avancada', 1, '2026-01-01'),
  ('00000000-0000-7000-8000-00007090000d', '00000000-0000-7000-8000-00000000a001', 'recurso_jari', '/servicos/recurso-jari', 'inf', 'Recurso à JARI (fixture)', 'Recurso à JARI (fixture)', '["Conta gov.br", "Nível avançado (prata, ouro ou e-Notariado)"]'::jsonb, 'portal', 'source_pending (OD-P26)', 'gratuito', 'Conforme declaração de acessibilidade (RN-PORTAL-113)', 'DETRAN-AM', 'minimo=avancada; base=source_pending (OD-P26)', 'unavailable', 'delegacao_indisponivel_r0007', 'Atendimento presencial ([REF-DETRANAM-SERVICOS])', 'avancada', 1, '2026-01-01'),
  ('00000000-0000-7000-8000-00007090000e', '00000000-0000-7000-8000-00000000a001', 'recurso_cetran', '/servicos/recurso-cetran', 'inf', 'Recurso ao CETRAN (fixture)', 'Recurso ao CETRAN (fixture)', '["Conta gov.br", "Nível avançado (prata, ouro ou e-Notariado)"]'::jsonb, 'portal', 'source_pending (OD-P26)', 'gratuito', 'Conforme declaração de acessibilidade (RN-PORTAL-113)', 'DETRAN-AM', 'minimo=avancada; base=source_pending (OD-P26)', 'unavailable', 'delegacao_indisponivel_r0007', 'Atendimento presencial ([REF-DETRANAM-SERVICOS])', 'avancada', 1, '2026-01-01'),
  ('00000000-0000-7000-8000-00007090000f', '00000000-0000-7000-8000-00000000a001', 'indicacao_condutor', '/servicos/indicacao-condutor', 'inf', 'Indicação de condutor (fixture)', 'Indicação de condutor (fixture)', '["Conta gov.br", "Nível avançado (prata, ouro ou e-Notariado)"]'::jsonb, 'portal', 'source_pending (OD-P26)', 'gratuito', 'Conforme declaração de acessibilidade (RN-PORTAL-113)', 'DETRAN-AM', 'minimo=avancada; base=source_pending (OD-P26)', 'unavailable', 'delegacao_indisponivel_r0007', 'Atendimento presencial ([REF-DETRANAM-SERVICOS])', 'avancada', 1, '2026-01-01')
on conflict (id) do update set
  route = excluded.route, category = excluded.category, title = excluded.title, summary = excluded.summary,
  requirements_json = excluded.requirements_json, legal_deadline = excluded.legal_deadline, cost = excluded.cost,
  normative_reference = excluded.normative_reference, availability = excluded.availability,
  unavailable_reason = excluded.unavailable_reason, alternative_channel_note = excluded.alternative_channel_note,
  minimum_assurance = excluded.minimum_assurance, version = excluded.version, effective_from = excluded.effective_from;

-- 10.8 plataforma (DDL manuscrito 19-portal-platform.sql) — D1: brand_profile tem tenant_id
-- como chave primária (sem coluna id própria, sem created_at) no DDL real.
insert into portal.brand_profile (tenant_id, display_name, short_name, legal_name, primary_color, support_url, privacy_url, accessibility_url, service_contact, locale, time_zone)
values (
  '00000000-0000-7000-8000-00000000a001', 'DETRAN-AM (fixtures)', 'DETRAN-AM', 'DETRAN-AM (fixtures)', '#1351B4',
  'https://portal.detran-am.fixtures.invalid/suporte', 'https://portal.detran-am.fixtures.invalid/privacidade',
  'https://portal.detran-am.fixtures.invalid/acessibilidade', 'ouvidoria@detran-am.fixtures.invalid', 'pt-BR', 'America/Manaus'
)
on conflict (tenant_id) do update set
  display_name = excluded.display_name, short_name = excluded.short_name, legal_name = excluded.legal_name,
  primary_color = excluded.primary_color, support_url = excluded.support_url, privacy_url = excluded.privacy_url,
  accessibility_url = excluded.accessibility_url, service_contact = excluded.service_contact,
  locale = excluded.locale, time_zone = excluded.time_zone;

insert into portal.public_hostname (id, hostname, tenant_id, enabled)
values ('00000000-0000-7000-8000-000070b00001', 'portal.detran-am.fixtures.invalid', '00000000-0000-7000-8000-00000000a001', true)
on conflict (id) do update set hostname = excluded.hostname, tenant_id = excluded.tenant_id, enabled = excluded.enabled;

-- 10.8 portal.inbox_item (2) — D6: read_on é `date` no DDL real (sem hora) e
-- deadline_owned_by segue a Adenda A2(b)/DDL real (`citizen`, não `cidadao`).
insert into portal.inbox_item (
  id, tenant_id, subject_id, kind, action_required, source, source_event_id, subject_line, summary,
  ait_id, request_id, available_on, read_on, fictitious_acknowledgement_on, deadline_due_on, deadline_owned_by
)
values
  ('00000000-0000-7000-8000-000070c00001', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000070000002', 'SNE', true, 'sne', '00000000-0000-7000-8000-000071b00001', 'Notificação de autuação disponível', 'fixture', '00000000-0000-7000-8000-0000f0000002', null, '2026-09-01', null, '2026-10-01', '2026-10-01', 'citizen'),
  ('00000000-0000-7000-8000-000070c00002', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000070000002', 'PROCESSO', false, 'portal', '00000000-0000-7000-8000-000071b00002', 'Pedido em andamento', 'fixture', null, '00000000-0000-7000-8000-000070400009', '2026-09-10', '2026-09-11', null, null, null)
on conflict (id) do update set
  kind = excluded.kind, action_required = excluded.action_required, source = excluded.source,
  subject_line = excluded.subject_line, ait_id = excluded.ait_id, request_id = excluded.request_id,
  available_on = excluded.available_on, read_on = excluded.read_on,
  fictitious_acknowledgement_on = excluded.fictitious_acknowledgement_on,
  deadline_due_on = excluded.deadline_due_on, deadline_owned_by = excluded.deadline_owned_by;

-- 10.8 portal.sne_enrollment (1) — D8: sem coluna `version` no DDL real
insert into portal.sne_enrollment (id, tenant_id, subject_id, state, channel, email, phone, consent_text_version, effects_ack, since, cancelled_at, cancel_reason)
values (
  '00000000-0000-7000-8000-000070e00001', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000070000002',
  'ADERIDO_SNE', 'email', 'prata@fixtures.invalid', null, '1',
  '{"ciencia_ficta_30_dias":true,"desconto_60":true,"canal_eletronico":true,"validade_pos_cancelamento":true}'::jsonb,
  '2026-08-01T12:00:00-04:00', null, null
)
on conflict (id) do update set
  state = excluded.state, channel = excluded.channel, email = excluded.email, phone = excluded.phone,
  consent_text_version = excluded.consent_text_version, effects_ack = excluded.effects_ack,
  since = excluded.since, cancelled_at = excluded.cancelled_at, cancel_reason = excluded.cancel_reason;

-- 10.8 portal.infraction_view (7, uma por situation) — D10: last_event_id/last_event_version
-- são not null no DDL real; usa-se o sentinela de "nunca projetado" (uuid nulo, versão 0).
insert into portal.infraction_view (
  id, tenant_id, ait_id, subject_cpf_hash, ait_number, plate, occurred_at, framing_label, amount,
  situation, deadlines_json, points_status, actions_json, notices_json, payment_json,
  last_event_id, last_event_version
)
values
  ('00000000-0000-7000-8000-000070f00001', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-0000f0000002', 'd5996b25e580c95b90cfc8a69898b31ee8edb66bea003ac99801b8cab34c2bb4', 'FIX-0000001', 'FIX2E01', '2026-05-01T12:00:00-04:00', 'fixture', 195.23, 'aguardando_defesa', '[]'::jsonb, 'none', '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, '00000000-0000-0000-0000-000000000000', 0),
  ('00000000-0000-7000-8000-000070f00002', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-0000f0000003', 'd5996b25e580c95b90cfc8a69898b31ee8edb66bea003ac99801b8cab34c2bb4', 'FIX-0000002', 'FIX2E02', '2026-05-02T12:00:00-04:00', 'fixture', 195.23, 'em_defesa', '[]'::jsonb, 'em_disputa', '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, '00000000-0000-0000-0000-000000000000', 0),
  ('00000000-0000-7000-8000-000070f00003', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-0000f0000005', 'd5996b25e580c95b90cfc8a69898b31ee8edb66bea003ac99801b8cab34c2bb4', 'FIX-0000003', 'FIX2E03', '2026-05-03T12:00:00-04:00', 'fixture', 195.23, 'penalidade_aplicada', '[]'::jsonb, 'definitivo', '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, '00000000-0000-0000-0000-000000000000', 0),
  ('00000000-0000-7000-8000-000070f00004', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-0000f0000006', '90bdb56dba0745a3236c1c38f185878fcdce441ee4e5ab171dfe0e08a6170016', 'FIX-0000004', 'FIX2E04', '2026-05-04T12:00:00-04:00', 'fixture', 195.23, 'em_recurso', '[]'::jsonb, 'em_disputa', '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, '00000000-0000-0000-0000-000000000000', 0),
  ('00000000-0000-7000-8000-000070f00005', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-0000f0000009', '34ce32f4cacdd770d6bb0977e066f74724b170f3ccf7002baa802170711f99df', 'FIX-0000005', 'FIX2E05', '2026-05-05T12:00:00-04:00', 'fixture', 195.23, 'encerrada', '[]'::jsonb, 'definitivo', '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, '00000000-0000-0000-0000-000000000000', 0),
  ('00000000-0000-7000-8000-000070f00006', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-0000f0000012', '90bdb56dba0745a3236c1c38f185878fcdce441ee4e5ab171dfe0e08a6170016', 'FIX-0000006', 'FIX2E06', '2026-05-06T12:00:00-04:00', 'fixture', 195.23, 'cancelada', '[]'::jsonb, 'none', '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, '00000000-0000-0000-0000-000000000000', 0),
  ('00000000-0000-7000-8000-000070f00007', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-0000f0000010', 'd5996b25e580c95b90cfc8a69898b31ee8edb66bea003ac99801b8cab34c2bb4', 'FIX-0000007', 'FIX2E07', '2026-05-07T12:00:00-04:00', 'fixture', 195.23, 'arquivada', '[]'::jsonb, 'none', '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, '00000000-0000-0000-0000-000000000000', 0)
on conflict (id) do update set
  subject_cpf_hash = excluded.subject_cpf_hash, ait_number = excluded.ait_number, plate = excluded.plate,
  occurred_at = excluded.occurred_at, framing_label = excluded.framing_label, amount = excluded.amount,
  situation = excluded.situation, points_status = excluded.points_status,
  last_event_id = excluded.last_event_id, last_event_version = excluded.last_event_version;

-- 10.8 portal.points_view (1)
insert into portal.points_view (id, tenant_id, subject_cpf_hash, definitive_points, disputed_points, by_vehicle_json, last_12_months_json, last_event_id, cached_at)
values ('00000000-0000-7000-8000-000071000001', '00000000-0000-7000-8000-00000000a001', 'd5996b25e580c95b90cfc8a69898b31ee8edb66bea003ac99801b8cab34c2bb4', 3, 4, '[]'::jsonb, '[]'::jsonb, null, '2026-09-14T12:00:00-04:00')
on conflict (id) do update set definitive_points = excluded.definitive_points, disputed_points = excluded.disputed_points, cached_at = excluded.cached_at;
