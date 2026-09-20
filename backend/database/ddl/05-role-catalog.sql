-- Canonical DETRAN role catalogue (Owner decision 2026-09-12; ADR-0015).
-- The `dashboard` family was added by the Owner decision of 2026-09-13
-- (steering.md H.38, OD-D01) and carries `dash-operator`/`dash-duty-owner`.
-- Mirrors backend/domains/shared/src/roles.ts (DETRAN_ROLES) one-to-one:
-- tools/check-role-catalog.ts fails `pnpm check` when the two drift.
-- auth.roles.key (per-tenant role rows, STYNX auth model) must reference a
-- catalogue key, so no tenant can invent a role outside the canonical set.
-- Catalogue rows are global reference data (no tenant_id, no RLS).

CREATE TABLE IF NOT EXISTS auth.role_catalog (
  key text PRIMARY KEY,
  family text NOT NULL
    CONSTRAINT role_catalog_family_check
    CHECK (family IN ('pec', 'teat', 'rait', 'dashboard', 'citizen')),
  name text NOT NULL,
  description text NOT NULL,
  apps text[] NOT NULL,
  is_staff boolean NOT NULL DEFAULT true,
  source text NOT NULL,
  introduced_on date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp()
);

COMMENT ON TABLE auth.role_catalog IS
  'Catálogo canônico de papéis (RBAC) do ecossistema DETRAN. Fonte: backend/domains/shared/src/roles.ts; docs/framework/product/shared/actors.md.';

-- Family set is re-established on every run so that a database created before
-- a family was added (here: `dashboard`, 2026-09-13) accepts the new rows
-- without a manual migration. CREATE TABLE IF NOT EXISTS above is a no-op on an
-- existing catalogue, so the constraint has to be replaced explicitly. The
-- column-level CHECK of a fresh database carries the same name, which makes the
-- DROP/ADD pair idempotent in both directions.
ALTER TABLE auth.role_catalog
  DROP CONSTRAINT IF EXISTS role_catalog_family_check;
ALTER TABLE auth.role_catalog
  ADD CONSTRAINT role_catalog_family_check
  CHECK (family IN ('pec', 'teat', 'rait', 'dashboard', 'citizen'));

INSERT INTO auth.role_catalog (key, family, name, description, apps, is_staff, source, introduced_on) VALUES
  -- PEC (ch) — códigos preservados verbatim (roles.ts PEC_ROLES)
  ('ADMIN', 'pec', 'Administrador', 'Administração global do PEC: dados mestres, clínicas, usuários e parâmetros de processo.', ARRAY['pec'], true, 'APP-PEC §Atores', '2026-08-24'),
  ('ADMIN_CLINICA', 'pec', 'Administrador da clínica', 'Gestão da clínica credenciada: usuários, profissionais, agenda e faturamento.', ARRAY['pec'], true, 'APP-PEC §Atores', '2026-08-24'),
  ('MEDICO', 'pec', 'Médico perito examinador', 'Exame de aptidão física e mental; assina e encerra atendimentos e laudos.', ARRAY['pec'], true, 'APP-PEC §Atores', '2026-08-24'),
  ('PSICOLOGO', 'pec', 'Psicólogo', 'Avaliação psicológica; assina e encerra atendimentos e laudos.', ARRAY['pec'], true, 'APP-PEC §Atores', '2026-08-24'),
  ('RECEPCAO', 'pec', 'Recepção', 'Acolhimento, cadastro de candidatos, agendamento e check-in.', ARRAY['pec'], true, 'APP-PEC §Atores', '2026-08-24'),
  ('TECNICO_BIOMETRIA', 'pec', 'Técnico biométrico', 'Captura biométrica e check-in; exceções biométricas sob aprovação do supervisor.', ARRAY['pec'], true, 'APP-PEC §Atores', '2026-08-24'),
  ('AUDITOR', 'pec', 'Auditor / corregedor', 'Consulta de trilha de auditoria, cadeia de custódia e exportações; não edita. Papel único para PEC, TEAT e RAIT.', ARRAY['pec','teat','rait','boat'], true, 'APP-PEC §Atores; APP-TEAT §Atores', '2026-08-24'),
  ('GESTOR', 'pec', 'Gestor', 'Gestão operacional do PEC: eventos, RENACH, conselhos e relatórios.', ARRAY['pec'], true, 'APP-PEC §Atores', '2026-08-24'),
  ('SUPERVISOR', 'pec', 'Supervisor clínico', 'Supervisão da clínica: aprovações duplas, bloqueios de processo, exceções biométricas.', ARRAY['pec'], true, 'APP-PEC §Atores', '2026-08-24'),
  ('GESTOR_DETRAN', 'pec', 'Gestor DETRAN', 'Visão cross-tenant do órgão; administrador global de negócio.', ARRAY['pec','teat','rait','portal','dashboard'], true, 'shared/actors.md §Transversais', '2026-08-24'),
  ('JUNTA', 'pec', 'Junta médica', 'Colegiado clínico de segunda opinião; decide recursos da junta.', ARRAY['pec'], true, 'APP-PEC §Atores', '2026-08-24'),
  ('CETRAN', 'pec', 'CETRAN (recursal ch)', 'Instância recursal da decisão da junta médica — distinto do CETRAN recursal de infrações (rait-*).', ARRAY['pec'], true, 'APP-PEC §Atores', '2026-08-24'),
  ('DPO', 'pec', 'Encarregado de dados (DPO)', 'Aprova exportações nominais em massa e atende titulares (LGPD).', ARRAY['pec','rait'], true, 'APP-PEC §Atores; steering F.32', '2026-08-24'),
  ('SUPORTE', 'pec', 'Suporte', 'Suporte técnico-operacional com acesso administrativo amplo.', ARRAY['pec'], true, 'APP-PEC §Atores; steering F.32', '2026-08-24'),
  ('CANDIDATO', 'pec', 'Candidato', 'Pessoa em processo de habilitação; acesso ao próprio processo.', ARRAY['pec','portal'], false, 'APP-PEC §Atores', '2026-08-24'),
  -- TEAT (inf/ops) — 8 papéis granulares (steering F.30); `auditor` é alias de AUDITOR
  ('field-agent', 'teat', 'Agente de trânsito', 'Lavra o AIT, registra abordagem, coleta evidências, aplica medida administrativa, conduz etilômetro, opera offline.', ARRAY['teat','boat'], true, 'APP-TEAT §Atores', '2026-08-24'),
  ('field-supervisor', 'teat', 'Supervisor de campo', 'Gerencia turno, equipe e viatura; reserva numeração; resolve conflitos de sincronização.', ARRAY['teat','boat'], true, 'APP-TEAT §Atores', '2026-08-24'),
  ('processing-operator', 'teat', 'Operador de processamento', 'Tramita o AIT após recebimento: validação, correção, medidas e evidências na retaguarda.', ARRAY['teat','rait'], true, 'APP-TEAT §Atores', '2026-08-24'),
  ('traffic-authority', 'teat', 'Autoridade de trânsito (TEAT)', 'Aceita/rejeita o AIT, aprova correções, conclui medidas; inicia o ciclo WF-INF-003.', ARRAY['teat'], true, 'APP-TEAT §Atores', '2026-08-24'),
  ('agency-admin', 'teat', 'Administrador do órgão', 'Parametriza órgão, unidades, convênios, competência territorial, homologação e catálogo normativo; parâmetros operacionais do RAIT.', ARRAY['teat','rait'], true, 'APP-TEAT §Atores; UC-RAIT-043', '2026-08-24'),
  ('technical-admin', 'teat', 'Administrador técnico', 'Sincronização offline, incidentes técnicos, pacote normativo mobile; administrador global técnico.', ARRAY['teat'], true, 'APP-TEAT §Atores', '2026-08-24'),
  ('bi-analyst', 'teat', 'Analista de BI', 'Consome projeções e relatórios operacionais.', ARRAY['teat','dashboard'], true, 'APP-TEAT §Atores', '2026-08-24'),
  ('integration-operator', 'teat', 'Operador de integração', 'Acompanha e retransmite falhas de integração com sistemas nacionais e estaduais (RENAVAM, RENACH, RENAINF, RENAEST, SNE).', ARRAY['teat','rait'], true, 'APP-TEAT §Atores; UC-RAIT-031', '2026-08-24'),
  -- RAIT (inf) — 10 papéis granulares (Owner 2026-09-12; shared/actors.md §Papéis granulares RAIT)
  ('rait-analyst', 'rait', 'Analista / revisor da defesa prévia', 'Puxa casos da fila coletiva, faz triagem de admissibilidade, instrui, abre diligências e redige a minuta (não assina).', ARRAY['rait'], true, 'shared/actors.md §Papéis granulares RAIT; JRN-RAIT-001', '2026-09-12'),
  ('rait-coordinator', 'rait', 'Coordenador / subcoordenador da defesa prévia', 'Dono do pool defesa_previa: escala, limite WIP, reatribuição, plantão de risco, amostragem de qualidade, plano de capacidade.', ARRAY['rait'], true, 'shared/actors.md §Papéis granulares RAIT; WF-RAIT-004 §3-4', '2026-09-12'),
  ('rait-secretary', 'rait', 'Secretaria (órgão e colegiados)', 'Intake multicanal e digitalização, pendências, remessas, desistências, sorteio em lote, banca, ata, publicação, jeton e arquivo.', ARRAY['rait'], true, 'shared/actors.md §Papéis granulares RAIT; JRN-RAIT-003', '2026-09-12'),
  ('rait-signing-authority', 'rait', 'Autoridade de trânsito signatária', 'Autoridade investida que decide a defesa prévia na sua circunscrição e assina com PAdES; pode devolver a minuta uma vez.', ARRAY['rait'], true, 'shared/actors.md §Papéis granulares RAIT; RN-RAIT-143; UC-RAIT-016', '2026-09-12'),
  ('rait-central-authority', 'rait', 'Autoridade centralizada do recurso vinculado', 'Decide, dentro de T-R2, recorrer ao CETRAN-AM contra provimento da JARI, ou declarar que não recorre.', ARRAY['rait'], true, 'shared/actors.md §Papéis granulares RAIT; RN-RAIT-130; UC-RAIT-008', '2026-09-12'),
  ('rait-rapporteur', 'rait', 'Membro / conselheiro relator', 'Titular ou suplente da JARI-AM ou do CETRAN-AM: aceita lote, declara impedimento, redige parecer e voto, vota em sessão, pede vista.', ARRAY['rait'], true, 'shared/actors.md §Papéis granulares RAIT; JRN-RAIT-002', '2026-09-12'),
  ('rait-chair', 'rait', 'Presidente da JARI-AM / CETRAN-AM', 'Homologa sorteios, monta e fecha a pauta, confirma a banca, abre e conduz a sessão, desempata, proclama, convoca extraordinária, aprova o jeton.', ARRAY['rait'], true, 'shared/actors.md §Papéis granulares RAIT; WF-RAIT-003', '2026-09-12'),
  ('rait-manager', 'rait', 'Gestor RAIT', 'Radar de prescrição, produção e metas, capacidade, constituição de turmas, incidentes e extinções; leitura de integrações.', ARRAY['rait','dashboard'], true, 'shared/actors.md §Papéis granulares RAIT; JRN-RAIT-004', '2026-09-12'),
  ('rait-hr', 'rait', 'RH / gabinete', 'Mandatos dos membros (nomeação, posse, recondução, perda) e apoio à folha de jeton.', ARRAY['rait'], true, 'shared/actors.md §Papéis granulares RAIT; UC-RAIT-037', '2026-09-12'),
  ('rait-finance', 'rait', 'Financeiro / tesouraria', 'Documentos de arrecadação por fase, restituições, cobrança e dívida ativa, conciliação bancária.', ARRAY['rait'], true, 'shared/actors.md §Papéis granulares RAIT; UC-RAIT-032…035', '2026-09-12'),
  -- DASHBOARD — 2 papéis granulares (Owner 2026-09-13; steering H.38, OD-D01; shared/actors.md §Papéis granulares DASHBOARD)
  ('dash-operator', 'dashboard', 'Operador de monitoramento', 'Triagem do turno, ciência (ack) em nome do dono e encerramento de alertas da trilha de irregularidade após verificação; nunca pratica ato de negócio (RN-DASH-101). Camada máxima N1.', ARRAY['dashboard'], true, 'shared/actors.md §Papéis granulares DASHBOARD; steering H.38', '2026-09-13'),
  ('dash-duty-owner', 'dashboard', 'Dono de dever periódico', 'Abre, prepara, submete e comprova os ciclos do calendário de deveres periódicos (WF-DASH-002); atribuído ao ouvidor, ao financeiro e ao coordenador de RENAEST. Camada máxima N1.', ARRAY['dashboard'], true, 'shared/actors.md §Papéis granulares DASHBOARD; steering H.38', '2026-09-13'),
  -- Cidadão
  ('CIDADAO', 'citizen', 'Cidadão', 'Condutor, proprietário ou procurador no Portal público: consulta, indicação, defesa e recurso próprios.', ARRAY['portal'], false, 'shared/actors.md §Cidadãos e partes', '2026-08-24')
ON CONFLICT (key) DO UPDATE SET
  family = EXCLUDED.family,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  apps = EXCLUDED.apps,
  is_staff = EXCLUDED.is_staff,
  source = EXCLUDED.source,
  introduced_on = EXCLUDED.introduced_on,
  updated_at = clock_timestamp()
WHERE ROW(
  role_catalog.family,
  role_catalog.name,
  role_catalog.description,
  role_catalog.apps,
  role_catalog.is_staff,
  role_catalog.source,
  role_catalog.introduced_on
) IS DISTINCT FROM ROW(
  EXCLUDED.family,
  EXCLUDED.name,
  EXCLUDED.description,
  EXCLUDED.apps,
  EXCLUDED.is_staff,
  EXCLUDED.source,
  EXCLUDED.introduced_on
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_auth_roles_catalog'
  ) THEN
    ALTER TABLE auth.roles
      ADD CONSTRAINT fk_auth_roles_catalog
      FOREIGN KEY (key) REFERENCES auth.role_catalog(key)
      ON UPDATE CASCADE ON DELETE RESTRICT;
  END IF;
END
$$;

GRANT SELECT ON auth.role_catalog TO role_app_backend;
GRANT SELECT ON auth.role_catalog TO role_auditor_min;
