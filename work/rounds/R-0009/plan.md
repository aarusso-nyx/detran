# R-0009 — frente `portal-backend` (WP-P0…P3 do PORTAL: identidade federada, modelo, rotas, projeções e contratos)

**Status:** planejado em 2026-09-14 pelo Architect; bootstrap iniciado em 2026-09-16 pelo maestro Fable 5.1,
suspenso pelo Owner e **retomado em 2026-09-16 por instrução explícita do Owner** ("prossiga até o completo
encerramento do round com o merge correspondente"; ver `AUTHORIZATION.md`). Reviewer: GPT-5.6 Terra via `tools/orchestra/bridge.sh codex`.
**Concorrência:** abre já; merge por grupo acoplado — CTG-0001 (identidade federada + modelo + projeções + fixtures): nenhum upstream. CTG-0002 (rotas, delegações, contratos): `rait-backend` R-0007 só para as delegações reais de defesa/indicação/pagamento — até lá as rotas delegadas devolvem `SERVICE_UNAVAILABLE` com motivo (build pack §3) e o grupo mescla com o teste de delegação real marcado `todo` citando R-0007. Já em `main` desde R-0008 (reutilizar, nunca recriar): `DetranError` (`backend/domains/shared/src/errors/`), `tools/contracts/check-commands.mjs` em `pnpm contracts:check`, `pnpm contracts:clients` → `@detran/api-clients`, `backend/app/tests/e2e/policy-routes.e2e.spec.ts` (estender com `portal:*`).
**Janelas previstas:** 3.

## Metas

1. **Identidade federada** (WP-P0, ADR-0019 §1): ADR curta "gov.br via Cognito" (número livre
   seguinte; previsto ADR-0024): IdP OIDC gov.br no pool do cidadão; selo → `assurance_level`
   (bronze = simples; **prata ou ouro = avançada**, steering H.50, decisão do Owner contra a PN
   001/2025 — registrar o risco na ADR); qualificada por e-Notariado/ICP; CPF como `sub` de
   negócio; grupo `CIDADAO`; representação como atributo. Configuração do pool em `backend/app`
   (`detran-runtime.ts`, perfis `test`/`local` com IdP simulado); guarda que rejeita claim ausente
   (`PORTAL.ASSURANCE_NOT_VERIFIED`, fail-closed).
2. **Modelo** (WP-P1): `BP-PORTAL-IDENTITY-001` (`subject`, `representation`, `act_level_policy`
   com a matriz do Decreto 10.543 + PN 001/2025 como **dados** com fonte, `entitlement`),
   `BP-PORTAL-REQUESTS-001` (`request` máquina [WF-PORTAL-001] com 13 estados fixos em código —
   OD-P13, `request_draft`, `request_attachment`, `protocol`, `consequence_ack`, `evaluation`),
   `BP-PORTAL-INBOX-001` (`inbox_item`, `acknowledgement_evidence`, `sne_enrollment`,
   `push_subscription`), `BP-PORTAL-CITIZEN-SERVICE-001` (`manifestation` [WF-PORTAL-004],
   `manifestation_extension`, `service_catalog` com 11 campos e check de motivo, `brand_profile`,
   `public_hostname` — os dois últimos sem RLS por desenho, listados na exceção de `verify:rls-ddl`);
   **reconciliar com `backend/domains/portal/complaints`** (`BP-PORTAL-COMPLAINTS-001`, DDL 60):
   a TASK-0002 decide absorver em `citizen-service` ou manter, sem duplicar a manifestação. DDL
   `61-portal-identity.sql`, `62-portal-requests.sql`, `63-portal-inbox.sql`, `64-portal-citizen-service.sql`.
   Projeções (ADR-0020): `portal.infraction_view`, `portal.process_timeline`, `portal.points_view`,
   `portal.crash_view` (BOAT; projetor real em R-0010), `portal.exam_view` (PEC). Timers `owner='portal'`
   (`T-PROTOCOLO`, `T-OUV-RESPOSTA` 30+30, `T-OUV-INFO` 20+20, `T-AVAL-CONVITE`, `T-SNE-CIENCIA` 30,
   `T-LGPD-ACESSO` parâmetro `privacy.public_regime_days` `source_pending`). Fixtures: um cidadão por
   nível, uma representação, um pedido por estado, uma manifestação por estado, catálogo 9/2/4.
3. **Rotas** (WP-P2, `portal-route-contract.md` §2–§10): controladores `/v1/portal/*`; serviço de
   delegação em uma transação (protocolo → comando do domínio dono → `EM_ANDAMENTO_NO_ORGAO`;
   falha após protocolo vira pendência interna); projetores das cinco projeções por eventos
   (idempotentes em `event.id`); evidência de ciência SNE (`NOTIFICACAO_CIENCIA`); adesão/cancelamento
   SNE via `inf/notification`; leituras nacionais cacheadas com `cachedAt` (TTL 15 min, H.54);
   SSE `/v1/portal/stream`; regras `portal:*` para `CIDADAO` em `policy.ts`; flags
   `portal.card_payment=off` (DT-031) e desconto 40 % (H.53).
4. **Contratos** (WP-P3): `docs/framework/contracts/BP-PORTAL-*.commands.openapi.json` com corpos
   por `serviceKey` (§5.1), 4xx do `portal-error-catalog.md`, `Idempotency-Key` determinística
   documentada, exemplos com fixtures; `docs/framework/schemas/portal-request-draft.schema.json` por ato.
5. Documentação: `portal-build-pack.md` §WP-P0…P3 executados; ADR-0019 "Implementação: PR #n";
   `portal-route-contract.md` §11 conferido; backlog.

## Decisões do maestro (Architect, 2026-09-16) — valem como contrato para TASK-0001, TASK-0002 e TASK-0005

Nada aqui reabre decisão do Owner (steering §H.49–H.54); onde a fonte não fixa valor, a linha diz `source_pending`.

- **M1 — Cinco pacotes de workspace** sob `backend/domains/portal/`: `identity` (`@detran/portal-identity`,
  `BP-PORTAL-IDENTITY-001`, DDL `61-portal-identity.sql`), `requests` (`@detran/portal-requests`,
  `BP-PORTAL-REQUESTS-001`, `62-portal-requests.sql`), `inbox` (`@detran/portal-inbox`, `BP-PORTAL-INBOX-001`,
  `63-portal-inbox.sql`), `citizen-service` (`@detran/portal-citizen-service`, `BP-PORTAL-CITIZEN-SERVICE-001`,
  `64-portal-citizen-service.sql`) e `projections` (`@detran/portal-projections`, `BP-PORTAL-PROJECTIONS-001`,
  `65-portal-projections.sql` — as cinco projeções de ADR-0020 como entidades pequenas + projetores manuscritos,
  ADR-0020 §Consequências). Namespace `portal`; `api.basePath` `/v1/portal/<pacote>/`; **toda entidade com
  `operations: []`** — nenhuma rota CRUD gerada: as rotas cidadãs de `portal-route-contract.md` são todas
  manuscritas (`src/handwritten/`), reutilizando repositórios/serviços gerados. `auth.source: "PORTAL_RULES"`.
- **M2 — `portal/complaints` permanece intacto** (`BP-PORTAL-COMPLAINTS-001`, DDL 60): é o canal de reclamação
  portado do PEC (papéis `CANDIDATO|DPO|AUDITOR|GESTOR_DETRAN|SUPORTE`, gate `verify:pec-parity`). A manifestação
  da Lei 13.460 ([WF-PORTAL-004]) é `portal.manifestation` em `citizen-service` — entidade distinta, nunca duas
  tabelas para a mesma manifestação porque `complaint` não é manifestação de ouvidoria. Unificação futura vira
  OD-P14 (Owner, após parity/freeze do PEC), registrada por TASK-0010.
- **M3 — Claims da identidade federada**: o principal carrega `claims.assurance_level ∈ {simples, avancada,
qualificada}` e `claims.cpf` (11 dígitos, `sub` de negócio). Perfil `local-sandbox`/`test`
  (`DetranLocalTokenVerifier`): os dois vêm de `DETRAN_LOCAL_ASSURANCE_LEVEL` e `DETRAN_LOCAL_CPF` (mesmo padrão de
  `DETRAN_LOCAL_DECISION_BODY`); ausentes → claim ausente → guarda fail-closed. Perfil Cognito: o verificador STYNX
  copia o payload do JWT em `principal.claims`; os nomes das claims vêm de `STYNX_COGNITO_ASSURANCE_CLAIM` (default
  `custom:assurance_level`) e `STYNX_COGNITO_CPF_CLAIM` (default `custom:cpf`), lidos por `detran-runtime.ts`
  numa função `portalIdentityClaims(principal)` exportada por `@detran/portal-identity` (não por `@detran/shared`).
  O mapeamento selo gov.br → nível é feito no IdP (attribute mapping do pool) e documentado na ADR-0024:
  bronze → `simples`; **prata ou ouro → `avancada`** (H.50, contra a PN 001/2025 — risco registrado na ADR);
  e-Notariado/ICP-Brasil → `qualificada`. Credenciais institucionais do cliente OIDC gov.br: `source_pending`
  (OD-P15, homologação em R-0014 WP-P6).
- **M4 — Guarda `PortalCitizenGuard`** (`@detran/portal-identity/src/handwritten/citizen.guard.ts`, aplicada por
  `@UseGuards` em todo controlador manuscrito `/v1/portal/*` não público): sem sessão → 401
  `PORTAL.AUTH_REQUIRED` (STYNX já responde antes); papel `CIDADAO` ausente → 403 `PORTAL.IDENTITY_NOT_CITIZEN`;
  `assurance_level` ausente/fora do enum ou `cpf` ausente/inválido → 403 `PORTAL.ASSURANCE_NOT_VERIFIED` (fail-closed,
  nunca degrada para `simples`). `technical-admin`/`*` **não** contorna a guarda (ela não é política, é identidade).
  Nível por ato: `assertActLevel(tx, principal, actKey)` lê `portal.act_level_policy` (`enabled=true`, vigência) e
  compara pela ordem `simples < avancada < qualificada`; insuficiente → 403 `PORTAL.ASSURANCE_INSUFFICIENT`
  `{ actKey, required, current, elevationMethods: ['biographic','biometric','icp'], resumeRoute }`; política exigindo
  `qualificada` → 500 `PORTAL.ASSURANCE_QUALIFIED_NEVER_REQUIRED` (RN-PORTAL-101); ato sem linha → 500 idem código
  `PORTAL.INTERNAL` `{ actKey }` (nunca liberar por ausência).
- **M5 — Matriz ato → nível como dados** (`portal.act_level_policy`, seed em `70-fixtures-portal.sql`, tenant
  canônico): `consulta_multas`, `consulta_cnh`, `emissao_crlv`, `pagamento`, `adesao_sne`, `cancelamento_sne`,
  `lgpd_declaracao` (escopo `confirmacao`), `acompanhar_manifestacao` = `simples`; `defesa_previa`, `recurso_jari`,
  `recurso_cetran` (H.49, `portal.cetran_appeal_level=advanced`), `indicacao_condutor`, `procuracao`
  (`representations`), `junta_medica`, `lgpd_declaracao` (escopo `declaracao_completa|correcao|eliminacao`) =
  `avancada`; `manifestar` = `none` (anônimo, H.51). Fonte de cada linha: coluna `legal_basis` (Decreto 10.543/2020
  art. 4º; PN DETRAN-AM 001/2025; H.49/H.50/H.51). `act_key` é o `serviceKey` do §5.1 do contrato de rotas quando
  existe; os demais são os tokens acima. Colunas: `act_key`, `minimum_assurance` (`none|simples|avancada|qualificada`),
  `legal_basis`, `decision_ref`, `enabled`, `effective_from`, `effective_to`.
- **M6 — `portal.subject`**: `cpf_hash` (sha256 hex do CPF, único por tenant), `name` (sem CPF em claro nem
  `cpf_last4`: o titular vê o CPF pela claim, nunca pela tabela — RN-PORTAL-112), `govbr_level_observed`
  (`bronze|prata|ouro|qualificada|null`), `assurance_level_observed`, `observed_at`, `version`. Criado sob demanda
  no primeiro `GET me` (upsert por `cpf_hash`); nunca guarda token nem credencial. `portal.representation`:
  `representative_subject_id`, `represented_cpf_hash`, `represented_name`, `instrument_document_id`, `scope`
  (`ait|all`), `valid_until`, `state` (`PROCURACAO_APRESENTADA|PROCURACAO_VALIDADA|PROCURACAO_RECUSADA`,
  [WF-PORTAL-002]), `refusal_reason`. `portal.entitlement`: `subject_id`, `target_kind`
  (`ait|case|vehicle|license|crash|exam`), `target_id` (uuid, sem FK — outro domínio), `relation`
  (`owner|driver|representative|interested_party`), `origin` (`renavam|renach|infraction|representation|manual`),
  `valid_from`, `valid_until`; índice único `(tenant_id, subject_id, target_kind, target_id, relation)`.
- **M7 — `portal.request`** ([WF-PORTAL-001], 13 estados **fixos em código**, OD-P13 fechado: `@stynx-nyx/flow`
  não é usado; avaliado e descartado nesta rodada por manter a máquina auditável no domínio): `state` com check dos
  13 tokens; `service_key` FK lógica para `portal.service_catalog.service_key`; `subject_id`; `target_kind`
  (`ait|case|vehicle|exam|none`), `target_id`; `channel` (`portal`); `delegation_domain`, `delegation_command`
  (ex.: `inf:rait-case:protocol`), `delegation_external_id`, `delegation_status`
  (`pending|delegated|failed|not_applicable`), `delegation_error`; `minimum_assurance`; `version`; `withdrawn_at`.
  Transições permitidas (tabela `REQUEST_TRANSITIONS` em `src/handwritten/guards/request.transitions.ts`):
  `create` → `PEDIDO_EM_COMPOSICAO` (o servidor executa IDENTIFICADO → SERVICO_SELECIONADO →
  ELEGIBILIDADE_VERIFICADA na mesma transação; `INELEGIVEL` é resposta 422 `PORTAL.INELIGIBLE`, sem linha
  persistida); `draft` em `PEDIDO_EM_COMPOSICAO`; `submit` de `PEDIDO_EM_COMPOSICAO` → verifica nível →
  `AGUARDANDO_NIVEL_ASSINATURA` (só quando insuficiente; resposta 403 `ASSURANCE_INSUFFICIENT` e o pedido fica
  nesse estado) | `AGUARDANDO_PAGAMENTO` (só `emissao_crlv` com débito) | `PROTOCOLADO` → delegação →
  `EM_ANDAMENTO_NO_ORGAO`; `withdraw` de `PEDIDO_EM_COMPOSICAO|AGUARDANDO_NIVEL_ASSINATURA|AGUARDANDO_PAGAMENTO` →
  `DESISTIDO`; eventos de destino → `RESULTADO_DISPONIVEL` → `AVALIACAO_OFERECIDA` → `CONCLUIDO`. Comando fora do
  estado → 409 `PORTAL.REQUEST_STATE_INVALID` `{ state, allowed[] }`.
- **M8 — Protocolo imediato e delegação** (`RequestDelegationService`, `portal/requests/src/handwritten/delegation/`):
  `submit` grava `portal.protocol` (`number` = `<tenant-slug-upper>-<AAAA>-<sequencial 7 dígitos>` por sequência
  `portal.protocol_seq` do DDL 62, `issued_at`, `channel`, `receipt_hash` sha256 do JSON canônico do recibo) **antes**
  de qualquer validação de conteúdo do rascunho e antes da delegação, na mesma transação que muda o estado para
  `PROTOCOLADO`; em seguida chama a porta `PORTAL_DELEGATION_TARGETS` (token de `@detran/portal-requests`,
  mapa `serviceKey → DelegationTarget { delegate(request, tx) → { externalId } }`). Nesta rodada (R-0007 ausente)
  os alvos `defesa_previa`, `recurso_jari`, `recurso_cetran`, `indicacao_condutor`, `pagamento`, `junta_medica`
  são `UnavailableDelegationTarget` que devolvem `PORTAL.SERVICE_UNAVAILABLE` 422 `{ unavailableReason:
'delegacao_indisponivel_r0007', alternativeChannelNote }` **na verificação de elegibilidade** (`POST requests`),
  antes de existir pedido — o catálogo marca esses serviços `unavailable` com `unavailableReason` (M12). O caminho
  "protocolo → falha da delegação → `PORTAL.DELEGATION_FAILED` 502 com protocolo mantido e `delegation_status='failed'`"
  é implementado e testado com um alvo falso injetado no teste (`todo` do teste de delegação real cita R-0007).
  `adesao_sne`/`cancelamento_sne`: `inf/notification` (R-0008) não tem comando de adesão ao SNE, e `SnePort` só
  pode ser chamada por `packages/senatran-adapter`; nesta rodada a adesão grava `portal.sne_enrollment` (M15), publica
  `SNE_ADESAO_SOLICITADA`/`SNE_CANCELAMENTO_SOLICITADO` e responde `ADERIDO_SNE`/`NAO_ADERIDO_SNE`; o envio real ao
  SNE nacional via adapter é OD-P16 (`source_pending`, R-0014 WP-P6).
  `lgpd_declaracao` delega a `@stynx-nyx/privacy` (`/privacy/exports`) — nesta rodada devolve `SERVICE_UNAVAILABLE`
  com `unavailableReason: 'privacy_endpoint_pendente'` (OD-P17) porque o app não monta o módulo `privacy` do STYNX.
- **M9 — Idempotência** (`Idempotency-Key` determinística `<ato>:<alvo>:<fingerprint>`): `POST requests`,
  `POST requests/{id}/submit`, `POST …/diligences/{did}/responses`, `POST manifestations`, `POST evaluations`,
  `POST sne/enrollment` exigem o cabeçalho (ausente → 400 `PORTAL.VALIDATION_FAILED` `{ fields: ['Idempotency-Key'] }`);
  a chave é gravada em `portal.idempotency_record` (DDL 62: `key`, `subject_id`, `route`, `body_sha256`,
  `response_json`, `status`, `created_at`, único `(tenant_id, key)`); reuso com mesmo corpo → resposta gravada (mesmo
  status); corpo diferente → 409 `PORTAL.IDEMPOTENT_KEY_REUSE_DIFFERENT_BODY` `{ key }`. `If-Match` (428/412 via
  `assertIfMatch` de `@detran/shared`, prefixo `PORTAL`) em `PUT requests/{id}/draft`, `PUT preferences`,
  `POST requests/{id}/withdraw`.
- **M10 — Vínculo**: toda leitura de `aits/{id}`, `requests/{id}`, `vehicles/{id}/*`, `crashes/{id}`, `exams/{id}`
  e todo `POST requests` com `targetId` consultam `portal.entitlement` do sujeito da sessão (ou de um representado
  com `representation.state='PROCURACAO_VALIDADA'` vigente); ausência → 404 `PORTAL.NOT_FOUND` `{ kind }` (mesma
  resposta para inexistente). `POST requests` sobre alvo sem vínculo → 422 `PORTAL.ENTITLEMENT_REQUIRED`
  `{ targetKind, howToProve }` **somente** quando o alvo existe na projeção e o serviço admite comprovação
  (`indicacao_condutor`, `defesa_previa` por procuração); caso contrário 404. Origem dos vínculos nesta rodada:
  fixtures + projetor de `INFRACAO_ESTADO_ALTERADO` (proprietário/condutor do evento → `entitlement origin='infraction'`).
- **M11 — Tenant pelo Host**: `portal.public_hostname` (`hostname` único global, `tenant_id`, `enabled`) e
  `portal.brand_profile` (`tenant_id` único, 10 campos do §2) são **DDL manuscrito `19-portal-platform.sql`**
  (faixa `1x`, CODESTYLE), sem `auth.create_rls_policy` **por desenho** (o Host é resolvido antes de existir
  contexto de tenant; a marca é pública): `tools/check-rls-ddl.ts` ganha a allowlist explícita
  `RLS_EXEMPT_BY_DESIGN = ['portal.public_hostname', 'portal.brand_profile']` com o comentário citando
  `portal-route-contract.md` §11 — nada mais é isento. `DetranTenantResolver` passa a consultar `public_hostname`
  pelo `Host` quando `X-Tenant-Id` está ausente e o perfil não é local (`PORTAL.TENANT_UNRESOLVED` 421 se não mapear);
  `X-Tenant-Id` presente e ≠ tenant do Host → 403 `PORTAL.SESSION_TENANT_MISMATCH`. `auth.install_tenant_triggers()`
  (DDL 11, manuscrito) passa a incluir o schema `'portal'` na lista de schemas (hoje `portal.complaint` não recebe o
  trigger — lacuna herdada, corrigida aqui pelo Architect).
- **M12 — Carta de Serviços** (`portal.service_catalog`: `service_key` único, `route`, `category`, `title`, `summary`,
  `requirements_json`, `delivery_channel`, `legal_deadline`, `cost`, `accessibility_note`, `responsible_party`,
  `normative_reference` — os 11 campos de RN-PORTAL-108 —, `availability` (`available|partially_available|unavailable`),
  `unavailable_reason` (check: obrigatório quando `unavailable`), `alternative_channel_note`, `minimum_assurance`,
  `version`, `effective_from`): fixture com os 15 serviços de [WF-PORTAL-001], contagem 9/2/4 fixada assim —
  **9 `available`**: `consulta_multas`, `consulta_cnh`, `emissao_crlv` (consulta; emissão condicionada à quitação,
  M17), `adesao_sne`, `cancelamento_sne`, `consulta_bat`, `consulta_exame`, `manifestar`, `avaliar`;
  **2 `partially_available`**: `pagamento` (só guia PIX/boleto, `portal.card_payment=false`, `limitations[]`),
  `lgpd_declaracao` (só escopo `confirmacao`; declaração completa pendente, OD-P17);
  **4 `unavailable` com motivo**: `defesa_previa`, `recurso_jari`, `recurso_cetran`, `indicacao_condutor`
  (`unavailable_reason='delegacao_indisponivel_r0007'`, `alternative_channel_note` = atendimento presencial, fonte
  [REF-DETRANAM-SERVICOS]). `junta_medica` fica **fora** do catálogo desta rodada (delegação PEC sem comando; OD-P19)
  — o §5.1 do contrato de rotas continua listando-a e o build pack registra a pendência. `GET services` é `@Public()`.
- **M13 — Manifestação** ([WF-PORTAL-004], `portal.manifestation`): `state` (9 tokens do workflow), `kind`
  (`reclamacao|denuncia|sugestao|elogio|solicitacao`, H.52), `confidential`, `anonymous`, `subject_id` nulo quando
  anônimo (H.51: anônimo para manifestar, `simples` para acompanhar), `text`, `protocol`, `received_at`,
  `agency_due_on` (= `received_at` + 30 dias corridos via `addCalendarDays` de `@detran/inf-deadlines`),
  `info_due_on` (20 dias, interno, nulo até `INFORMACAO_SOLICITADA_AO_AGENTE`), `decision_text`, `decided_at`,
  `acknowledged_at`, `version`; `portal.manifestation_extension` (`manifestation_id`, `timer` (`T-OUV-RESPOSTA|T-OUV-INFO`),
  `justification` obrigatória, `extended_on`, `new_due_on`; **uma** por timer — índice único). `POST manifestations`
  nunca recusa (RN-PORTAL-109): validação de forma só do `kind` (400 `PORTAL.MANIFESTATION_KIND_INVALID`); cria
  `MANIFESTACAO_REGISTRADA` e, na mesma transação, `COMPROVANTE_EMITIDO` (`{ protocol, receivedAt }`). Transições
  do órgão (`EM_ANALISE`, `INFORMACAO_SOLICITADA_AO_AGENTE`, `DECISAO_FINAL_ELABORADA`, `CIENCIA_AO_USUARIO`) **não
  têm rota nesta rodada** (o balcão da ouvidoria é DASHBOARD/R-0011, OD-P18): existem só como transições da tabela
  `MANIFESTATION_TRANSITIONS` e como serviço interno testável. `acknowledge` só de `CIENCIA_AO_USUARIO`
  (409 `PORTAL.MANIFESTATION_STATE_INVALID`) → `ENCERRADA` → `AVALIACAO_OFERECIDA` na mesma transação.
- **M14 — Timers `owner='portal'`** em `inf.infraction_timer_ref` (DDL 14, manuscrito; check de `owner` estendido
  com `'portal'`): `T-OUV-RESPOSTA` (30 `dias_corridos`, `marco`, `vigente`, Lei 13.460 art. 16), `T-OUV-INFO`
  (20 `dias_corridos`, `marco`, `vigente`, art. 16 §ú), `T-LGPD-ACESSO` (`duration_value` nulo, `duration_unit`
  `'dias_corridos'`, `status='proposta'`, `legal_basis` LGPD art. 19; valor real = parâmetro
  `privacy.public_regime_days`, `source_pending` OD-P08), `T-AVAL-CONVITE` (nulo, `marco`, imediato no mesmo evento
  do resultado, Lei 14.129 art. 21 V). `T-PROTOCOLO` é invariante (imediato, sem exceção), não timer: prova-se por
  teste (M8). `T-SNE-CIENCIA` já existe (`owner='infracao'`) e é **lido**, nunca duplicado. `backend/domains/inf/deadlines`
  **não é tocado** (R-0007): o portal mantém `portal-timers.ts` (espelho tipado só dos quatro códigos acima) em
  `@detran/portal-citizen-service`.
- **M15 — Caixa do cidadão** (`portal.inbox_item`: `subject_id`, `kind` (`acao_necessaria|informativo`), `source`
  (`sne|portal`), `source_event_id` (único por tenant), `subject_line`, `summary`, `ait_id`, `request_id`,
  `available_on`, `read_on`, `fictitious_acknowledgement_on` (só `source='sne'`: `available_on` + 30 dias, lido do
  timer `T-SNE-CIENCIA`), `deadline_due_on`, `deadline_owned_by`; `portal.acknowledgement_evidence`: `inbox_item_id`,
  `displayed_sha256`, `acknowledged_at`, `signature_ref`; `portal.sne_enrollment`: `subject_id` único,
  `state` (`NAO_ADERIDO_SNE|ADERIDO_SNE`), `channel`, `email`, `phone`, `consent_text_version`, `effects_ack`
  (jsonb dos quatro efeitos), `since`, `cancelled_at`, `cancel_reason`; `portal.push_subscription`: `subject_id`,
  `endpoint` único, `keys_json`, `created_at`). `POST inbox/{id}/read`: grava `read_on`; se `source='sne'` grava
  `acknowledgement_evidence` e publica `NOTIFICACAO_CIENCIA` na outbox (`SqlTeatEventOutbox` de `@detran/shared`,
  `topic='portal'`), idempotente (segunda leitura não duplica evidência nem evento). Consumo real por
  `inf/notification` (ciência efetiva do aviso) é do módulo dono; aqui só a publicação.
- **M16 — Projeções** (`@detran/portal-projections`, ADR-0020): tabelas `portal.infraction_view` (`ait_id` único
  por tenant, `subject_cpf_hash`, `ait_number`, `plate`, `occurred_at`, `framing_label`, `amount`, `situation`
  (`aguardando_defesa|em_defesa|penalidade_aplicada|em_recurso|encerrada|cancelada|arquivada`), `deadlines_json`,
  `points_status` (`em_disputa|definitivo|none`), `actions_json`, `notices_json`, `payment_json`, `last_event_id`,
  `last_event_version`, `updated_at`), `portal.process_timeline` (`request_id`, `case_id`, `entries_json` com
  `visibility='citizen'`, `deadlines_json`, `decision_json`, `last_event_id`), `portal.points_view` (`subject_cpf_hash`
  único, `definitive_points`, `disputed_points`, `by_vehicle_json`, `last_12_months_json`, `last_event_id`,
  `cached_at`), `portal.crash_view` (`crash_id`, `subject_cpf_hash`, `state_label`, `summary_json`, `third_party_fields_suppressed`,
  `last_event_id`), `portal.exam_view` (`exam_id`, `subject_cpf_hash`, `legal_label`, `valid_until`, `board_due_on`,
  `last_event_id`). Projetores em `src/handwritten/<nome>.projection.ts` com cabeçalho `// Source events:` (gate
  futuro `verify:domain-boundaries`, ADR-0020 §4): `infraction_view` ← `INFRACAO_ESTADO_ALTERADO`,
  `NOTIFICACAO_EXPEDIDA`, `NOTIFICACAO_CIENCIA`, `PAGAMENTO_CONFIRMADO`; `process_timeline` ← `RAIT_CASO_*`,
  `RAIT_DECISAO_PUBLICADA`, `rait.inquiry.changed`; `points_view` ← `PENALIDADE_DEFINITIVA`; `crash_view` e
  `exam_view` só a tabela + projetor esqueleto (`applyEvent` que registra `last_event_id`; produtores reais em
  R-0010/PEC — OD-P19). Idempotência por `event.id` (tabela `portal.projection_applied_event`: `event_id` único,
  `projection`, `applied_at`); replay = reaplicar a janela da outbox (`integration.outbox` `topic in ('inf','rait')`)
  em ordem `created_at`; teste de replay: aplicar N eventos, apagar a projeção, reaplicar → mesma linha. A tradução
  estado interno → `situation` cidadã é uma tabela única `INFRACTION_SITUATION_MAP` em `infraction-view.projection.ts`
  (chave = token de `inf.infraction_state_ref`; tokens sem linha → `situation='em_defesa'`? **não**: falha do projetor
  com `PORTAL.INTERNAL` e registro em `last_error`, nunca rótulo inventado — tokens sem mapa viram OD-P20 no relatório).
- **M17 — Leituras nacionais cacheadas** (`GET documents/cnh`, `GET vehicles`, `GET vehicles/{id}/clearance`,
  `POST vehicles/{id}/crlv-e`): só por `packages/senatran-adapter` (`CdtPort`, `RenachPort`, `RenavamReadPort` —
  os nomes exatos vêm de `packages/senatran-adapter/src/ports.ts`; se uma operação não existir na porta, a rota
  devolve 503 `PORTAL.NATIONAL_READ_UNAVAILABLE` `{ cachedAt: null, retryAfter }` e o relatório registra OD-P21 —
  nunca `fetch` próprio). Cache: `portal.national_read_cache` (DDL 65, pacote `projections` — ADR-0020 §5, leituras nacionais cacheadas pelo dono da projeção: `subject_id`, `kind`
  (`cnh|vehicles|clearance`), `target_id`, `payload_json`, `cached_at`, único `(tenant_id, subject_id, kind, target_id)`),
  TTL = parâmetro `portal.read_cache_ttl_minutes` lido pelo `ParameterService` de `@detran/ops-parameter`; as portas chegam pelo token `PORTAL_NATIONAL_READ_PORTS` (`{ cdt, renach, wsdenatranRead }`) definido em `@detran/portal-projections` e composto em `backend/app/src/portal-national-read.providers.ts` com `createSenatranAdapter().ports` (padrão de `teat-snapshots.providers.ts`); as rotas §4 e §7 vivem em `portal/projections/src/handwritten/`
  (nunca literal `15`); resposta sempre com `cachedAt`; fonte indisponível com cache → 200 com `cachedAt` antigo;
  sem cache → 503. `POST vehicles/{id}/crlv-e` e `GET documents/cnh` com `documentBytes`: `SERVICE_UNAVAILABLE`
  `{ unavailableReason: 'documento_assinado_pendente_r0014' }` (ADR-0018; emissão real é WP-P6).
- **M18 — SSE `GET /v1/portal/stream`** em `backend/app/src/portal-stream.controller.ts` + `portal-stream.service.ts`
  no padrão de `teat-stream.*` (`@Get` com resposta manual, `@Resource('portal:stream')`, `@Action('read')`,
  replay 24 h por `Last-Event-ID`, heartbeat): tipos `inbox.item`, `request.changed`, `decision.published`,
  `payment.confirmed`; escopo = sujeito da sessão (`cpf_hash` do envelope); envelope de
  `rait-events-sse-contract.md` §1. Fallback polling é do cliente (R-0014).
- **M19 — Política `portal:*`** (bloco `PORTAL_RULES` em `policy.ts`, só `CIDADAO` salvo indicado; negativos
  exaustivos para todos os demais papéis canônicos no `policy.spec.ts`; `technical-admin`/`*` continua admin global
  em `isDetranActionAllowed` — o teste declara isso como exceção esperada): `portal:identity:{read,elevate,represent,update}`,
  `portal:ait:read`, `portal:request:{create,compose,submit,withdraw,read,respond,evaluate}`,
  `portal:inbox:{read,acknowledge}`, `portal:sne-enrollment:{read,enroll,cancel}`, `portal:push-subscription:create`,
  `portal:document:read`, `portal:vehicle:{read,issue}`, `portal:crash:read`, `portal:exam:read`,
  `portal:manifestation:{manifest,read,acknowledge}` (`manifest` também **anônimo** → rota `@Public()` com guarda
  própria que aceita sessão ausente; H.51), `portal:evaluation:evaluate`, `portal:service-charter:read`,
  `portal:stream:read`. `portal:appeal:{create,read-own}` (linhas existentes) são **removidas** em CTG-0002 (TASK-0007) e substituídas por
  `portal:request:*` (ADR-0019: o caso é do RAIT); a asserção existente de `policy.spec.ts` sobre `portal:appeal:create` é
  substituída pelo Inspector (TASK-0006) por `portal:request:create`. Em CTG-0001, TASK-0004 só acrescenta
  `['portal:identity:read', ['CIDADAO']]` (asserções por TASK-0003).
  Rotas públicas (`@Public()`): `GET brand`, `GET services`, `GET services/{key}`, `GET content/points-explainer`,
  `POST manifestations`. `backend/app/tests/e2e/policy-routes.e2e.spec.ts` ganha o escopo `portal:*` (rotas ⇔
  regras nos dois sentidos, exceções: rotas públicas e `portal:complaint:*` do PEC).
- **M20 — Auditoria**: mutações com `@Audit({ action: 'PORTAL_<RECURSO>_<VERBO>', entity: 'portal.<tabela>' })`;
  leituras de dado pessoal (`me`, `documents/cnh`, `crashes/*`, `exams/*`, `vehicles/*`) também com `@Audit`
  (`action: 'PORTAL_<RECURSO>_READ'`, RN-PORTAL-118); o verificador aceita `@Audit` em `@Get` (só exige em mutações).
- **M21 — Eventos publicados** (§10 do contrato de rotas) pela outbox `SqlTeatEventOutbox` (`@detran/shared`,
  `topic='portal'`, `aggregate.kind` = `portal.<tabela>`): `SOLICITACAO_CRIADA`, `SOLICITACAO_PROTOCOLADA`,
  `SOLICITACAO_DESISTIDA`, `SOLICITACAO_CONCLUIDA`, `NIVEL_ASSINATURA_ELEVADO`, `REPRESENTACAO_VALIDADA`,
  `INBOX_LIDO`, `NOTIFICACAO_CIENCIA`, `MANIFESTACAO_REGISTRADA`, `MANIFESTACAO_ENCERRADA`, `AVALIACAO_REGISTRADA`,
  `SNE_ADESAO_SOLICITADA`, `SNE_CANCELAMENTO_SOLICITADO`; `data` só ids, tokens e datas (schema zod por evento em
  `src/handwritten/events.ts` de cada pacote, padrão de `inf/infraction/src/handwritten/events.ts`).
- **M22 — Fixtures** (`backend/database/seed/70-fixtures-portal.sql`, prefixo de id `0000700`, tenant canônico,
  "hoje" 2026-09-14): sujeitos `…70000001` (bronze/`simples`, CPF fixture `11111111111`), `…70000002`
  (prata/`avancada`, `22222222222`), `…70000003` (ouro/`avancada`, `33333333333`), `…70000004` (qualificada,
  `44444444444`), `…70000005` procurador (`55555555555`) com `representation` validada sobre `…70000002` (`scope='ait'`);
  entitlements sobre os AITs/infrações das fixtures de `30-fixtures-infraction.sql` (ids copiados de lá);
  um `request` por estado (13 linhas, `service_key` coerente com o estado), um `protocol` por pedido protocolado;
  uma `manifestation` por estado (9), `service_catalog` 15 linhas (M12), `act_level_policy` (M5), `brand_profile` e
  `public_hostname` (`portal.detran-am.fixtures.invalid`) para o tenant canônico **e** para o tenant local do e2e
  (`00000000-0000-7000-8000-000000000001`, `slug local-e2e` — criado pelo e2e; o seed cria só o canônico), `inbox_item`
  2 (um `sne`, um `portal`), `sne_enrollment` (`…70000002` aderido), projeções: uma linha de `infraction_view` por
  `situation` (7) e uma de `points_view`. O e2e cria seus próprios sujeitos via API (upsert do `GET me`).
- **M23 — CTG-0002 sem base empilhada**: R-0007 não está em `main`; as delegações reais ficam `todo` citando R-0007
  (regra do prompt §0). Se R-0007 mesclar durante a rodada, **não** se amplia o escopo: registra-se em §Concorrência e
  no backlog a tarefa de trocar `UnavailableDelegationTarget` pelos comandos reais (R-0014 ou rodada de correção).

- **M24 — Wiring manuscrito declarado pelo Architect** (Art. 6/10: o Engineer não edita blueprints em `docs/`): o Architect
  declara, no bloco `module` de cada blueprint, `handwrittenExports: ["handwritten/index"]`, `handwrittenControllers` e
  `handwrittenProviders` com os símbolos fixos abaixo, e `moduleImports`/`moduleExports`; os Engineers criam **exatamente**
  esses símbolos em `src/handwritten/` (arquivo = `target`). Quem declara: **TASK-0002** só para `identity` (CTG-0001);
  **TASK-0005** para `requests`, `inbox`, `citizen-service`, `projections` (CTG-0002, depois de CTG-0001 estar verde e
  commitado). Entre a regeneração pelo Architect e a implementação pelo Engineer do mesmo CTG, `pnpm typecheck` dos pacotes
  declarados fica vermelho por módulo ausente — estado intermediário esperado dentro do CTG; os gates de fim de CTG são os
  que precisam estar verdes. Os quatro pacotes de CTG-0002 são montados no `AppModule` já em CTG-0001 (TASK-0004) como
  módulos puramente gerados (sem rotas).
  - `identity`: controllers `PortalPublicController` (`handwritten/public.controller`), `PortalMeController` (`handwritten/me.controller`),
    `PortalAssuranceController` (`handwritten/assurance.controller`), `PortalRepresentationsController` (`handwritten/representations.controller`),
    `PortalPreferencesController` (`handwritten/preferences.controller`); providers (classes `@Injectable()`) `PortalIdentityService`
    (`handwritten/identity.service`: claims, upsert do sujeito, `assertActLevel`, `assertEntitled`), `PortalCitizenGuard` (`handwritten/citizen.guard`);
    `moduleExports: ["PortalIdentityService", "PortalCitizenGuard"]`.
  - `requests`: controller `PortalRequestsController` (`handwritten/requests.controller`); providers `PortalRequestsService`
    (`handwritten/requests.service`), `RequestDelegationService` (`handwritten/delegation/delegation.service`), `PortalIdempotencyService`
    (`handwritten/idempotency.service`); `moduleImports: [{ package: "@detran/portal-identity", symbol: "IdentityModule" }]`;
    `moduleExports: ["PortalIdempotencyService"]`.
  - `inbox`: controllers `PortalInboxController` (`handwritten/inbox.controller`), `PortalSneEnrollmentController` (`handwritten/sne-enrollment.controller`);
    providers `PortalInboxService` (`handwritten/inbox.service`), `PortalSneEnrollmentService` (`handwritten/sne-enrollment.service`);
    `moduleImports`: `IdentityModule`, `RequestsModule` (`@detran/portal-requests`, idempotência).
  - `citizen-service`: controllers `PortalManifestationsController` (`handwritten/manifestations.controller`), `PortalEvaluationsController`
    (`handwritten/evaluations.controller`), `PortalServiceCharterController` (`handwritten/service-charter.controller`); providers
    `PortalManifestationService` (`handwritten/manifestation.service`), `PortalEvaluationService` (`handwritten/evaluation.service`);
    `moduleImports`: `IdentityModule`, `RequestsModule`.
  - `projections`: controllers `PortalAitsController` (`handwritten/aits.controller`), `PortalDocumentsController` (`handwritten/documents.controller`:
    `documents/cnh`, `vehicles`, `vehicles/{id}/clearance`, `vehicles/{id}/crlv-e`), `PortalCrashesController` (`handwritten/crashes.controller`),
    `PortalExamsController` (`handwritten/exams.controller`); providers `PortalProjectors` (`handwritten/projectors.service`: os cinco projetores + `rebuild`),
    `PortalNationalReadsService` (`handwritten/national-reads.service`); `moduleImports`: `IdentityModule`; `moduleExports: ["PortalProjectors"]`.
    Os nomes exatos dos módulos gerados (`IdentityModule`, `RequestsModule`, `InboxModule`, `CitizenServiceModule`, `ProjectionsModule`) são os que o
    gerador deriva de `module.name`; TASK-0002 confirma e registra. Controladores adicionais **não** são criados: rotas novas entram nos
    controladores acima.

## Tarefas

| Tarefa    | Papel                   | Perfil              | Modelo/esforço | Lock                                                                                                         | Depende de                                  | Entrega                                                                                                                                                                                                                                                                                                 |
| --------- | ----------------------- | ------------------- | -------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TASK-0001 | Architect               | architect-blueprint | Opus / alto    | `MOD-adr`, `MOD-r9-contracts-ctg1`                                                                           | —                                           | ADR-0024 gov.br via Cognito; contrato `contracts/CTG-0001.md` (claims, guarda, matriz ato→nível, máquinas [WF-PORTAL-001/002/004], fixtures, critérios C-0001-nn, layout)                                                                                                                               |
| TASK-0002 | Architect               | architect-blueprint | Opus / alto    | `MOD-bp-portal`, `MOD-ddl-61-65`, `MOD-ddl-14`, `MOD-ddl-1x`, `MOD-blueprints-generated`                     | —                                           | cinco blueprints (entidades; wiring manuscrito M24 só em `identity`) + gerados; DDL 19 (plataforma), 14 (timers portal), 11 (schema portal nos triggers); DB `detran_r9` aplicado                                                                                                                       |
| TASK-0003 | Inspector               | inspector-tests     | Sonnet / médio | `MOD-portal-tests-ctg1`, `MOD-seed-70`, `MOD-app-e2e-portal-identity`                                        | TASK-0001, TASK-0002                        | testes C-0001-nn: guarda fail-closed (unit + e2e com IdP simulado), matriz de nível, máquinas (13 e 9 estados), RLS `portal.*`, `70-fixtures-portal.sql` + `seed.sh` duas vezes                                                                                                                         |
| TASK-0004 | Engineer                | engineer-backend    | Opus / médio   | `MOD-portal-identity-hw`, `MOD-app-runtime-auth`, `MOD-app-module`, `MOD-check-rls-ddl`, `MOD-shared-policy` | TASK-0003                                   | claims no runtime, `PortalCitizenGuard`, `assertActLevel`, `GET me`, `GET brand`, `GET services[/key]`, `TenantResolver` por Host, wiring dos 5 pacotes no app (`AppModule`, vitest, scripts), `policy.ts` só `portal:identity:read`; C-0001 verdes                                                     |
| TASK-0005 | Architect               | architect-blueprint | Opus / alto    | `MOD-r9-contracts-ctg2`, `MOD-bp-portal`, `MOD-blueprints-generated`                                         | TASK-0004 (CTG-0001 verde e commitado, M24) | wiring M24 dos 4 blueprints de CTG-0002 + regeneração; contrato `contracts/CTG-0002.md`: bloco por rota (§3–§9), delegação (M8), idempotência (M9), projetores (M16), SSE (M18), matriz `portal:*` ⇔ rotas (M19), eventos (M21), critérios C-0002-nn                                                    |
| TASK-0006 | Inspector               | inspector-tests     | Opus / alto    | `MOD-portal-tests-ctg2`, `MOD-shared-policy-spec`, `MOD-app-e2e-portal-routes`                               | TASK-0004, TASK-0005                        | testes C-0002-nn: rotas (vínculo 404, idempotência, protocolo antes da validação, `SERVICE_UNAVAILABLE` com motivo, `DELEGATION_FAILED` com alvo falso, `todo` R-0007), replay das projeções, SSE, `policy.spec` `portal:*`, `policy-routes` estendido                                                  |
| TASK-0007 | Engineer                | engineer-backend    | Opus / médio   | `MOD-portal-requests-hw`, `MOD-portal-identity-hw`, `MOD-shared-policy`                                      | TASK-0006                                   | `PORTAL_RULES` completo em `policy.ts` (M19); rotas §3 (elevações, representações, preferências) e §5 (pedidos, delegação, idempotência, protocolo); testes do seu escopo verdes                                                                                                                        |
| TASK-0008 | Engineer                | engineer-backend    | Opus / médio   | `MOD-portal-inbox-hw`, `MOD-portal-citizen-service-hw`, `MOD-portal-projections-hw`, `MOD-app-portal-stream` | TASK-0007                                   | rotas §4, §6, §7, §8; projetores e replay (M16); cache nacional (M17); SSE (M18); testes restantes de C-0002 verdes; `policy-routes` verde                                                                                                                                                              |
| TASK-0009 | Architect (transcrição) | transcriber-docs    | Sonnet / baixo | `MOD-contracts-commands-portal`, `MOD-schemas-portal`                                                        | TASK-0008                                   | `docs/framework/contracts/BP-PORTAL-*.commands.openapi.json` (§5.1, 4xx do catálogo, `Idempotency-Key`, exemplos com fixtures), `docs/framework/schemas/portal-request-draft.schema.json`; `contracts:check` verde; `pnpm contracts:clients` (gerado em `packages/`) é checkpoint do maestro (Engineer) |
| TASK-0010 | Architect (transcrição) | transcriber-docs    | Sonnet / baixo | `MOD-docs-portal`                                                                                            | TASK-0009                                   | `portal-build-pack.md` §WP-P0…P3 executados (+ correções §9 do método), ADR-0019 "Implementação: PR #n", `portal-route-contract.md` §11 conferido, OD-P14…P21 em `open-decisions` do Portal, backlog                                                                                                    |

CTG-0001 = TASK-0001…0004 (identidade + modelo + fixtures; sem upstream). CTG-0002 = TASK-0005…0010 (rotas +
projeções + contratos + docs; upstream R-0007 só para delegações reais, tratadas por M8/M23). Um PR por CTG.
Paralelismo: TASK-0001 ∥ TASK-0002; o restante em cadeia (TASK-0005 só depois de CTG-0001 verde e commitado — M24).
Arquivos e2e por fronteira: `portal-identity.e2e.spec.ts` (TASK-0003/0004), `portal-requests.e2e.spec.ts` (§3 + §5, TASK-0006/0007),
`portal-routes.e2e.spec.ts` (§4, §6, §7, §8) e `portal-stream.e2e.spec.ts` (§9) (TASK-0006/0008) — cada gate de Engineer termina verde no seu arquivo.

## Critérios de aceitação (comandos → resultado)

- `pnpm blueprints:check`, `pnpm contracts:check`, `pnpm contracts:clients` → OK.
- `pnpm verify:rls-ddl` → OK (exceções `brand_profile`/`public_hostname` declaradas no verificador,
  nunca removendo a verificação das demais); `pnpm backend:rls-smoke` → OK.
- `DB_NAME=detran_r9 DB_PASSWORD=postgres bash backend/database/apply.sh --full` + `seed.sh` duas vezes → OK.
- `pnpm backend:test:e2e` → login com IdP simulado e `PORTAL.ASSURANCE_NOT_VERIFIED` fail-closed verdes.
- `pnpm --filter @detran/shared test` → `policy.spec.ts` cobre `portal:*`; `policy-routes.spec.ts` verde.
- `pnpm backend:test:ci`, `pnpm check` → verdes; `node tools/docs/kb/check.mjs` → OK (baseline mantida ou aumento explicado).
- `pnpm --filter @detran/portal-<pacote> typecheck|test:unit|test:integration` → verdes por pacote (scripts gerados).
- `pnpm verify:decorators`, `pnpm verify:lifecycle-vocabulary`, `pnpm verify:parameter-catalogue` → OK.

## Mapa entregável → definições

| Entregável | Definição                                                                                                     |
| ---------- | ------------------------------------------------------------------------------------------------------------- |
| identidade | ADR-0019 §1; [WF-PORTAL-002]; steering H.49/H.50/H.51; [REF-DETRANAM-PORTARIA-NORMATIVA-001-2025]; OD-P01/P02 |
| modelo     | `portal-build-pack.md` §WP-P1; [WF-PORTAL-001…004]; `portal-route-contract.md` §11 (entidades da origem)      |
| rotas      | `portal-route-contract.md` §2–§10; `portal-error-catalog.md`; ADR-0016/0017/0018; comandos do RAIT (R-0007)   |
| projeções  | ADR-0020; `dashboard-route-contract.md` §6 (mesmo padrão `*.projection.ts`)                                   |
| parâmetros | `parameter-catalogue.md` (`portal.*`, `privacy.public_regime_days`, `collection.discount_40_outside_sne`)     |
| payloads   | `portal-route-contract.md` §5.1; `rait-build-pack.md` §0                                                      |

## Riscos

- `portal/complaints` já existe (DDL 60, `BP-PORTAL-COMPLAINTS-001`): decidir na TASK-0002; nunca
  duas tabelas para a mesma manifestação.
- Federação gov.br real depende de credenciais institucionais: nesta frente só IdP simulado nos
  perfis `test`/`local`; a homologação é R-0014 (WP-P6).
- `policy.ts` lock com `boat-backend` (R-0010): blocos `portal:*` × `est:*`; rebase da segunda.

## Concorrência

Registrado pelo maestro (Fable 5.1) em 2026-09-16 (bootstrap parcial) e atualizado na retomada do mesmo dia:

- `origin/main` = `0996391` (PR #53, refresh dos planos R-0009…R-0016). Já em `main`: R-0003 (#32/#35), R-0004
  (#37/#38), R-0005 (#40–#42/#44/#45), R-0006 (#39/#43/#46), R-0008 (#47–#52). Nenhum PR aberto de outra frente.
  Branch `orchestra/portal-backend` rebaseado sobre `0996391` antes do primeiro push (permitido: nunca publicado).
- **R-0007 `rait-backend` não está em `main`**: worktree local `orchestra/rait-backend` em `df1e176` com trabalho
  não commitado (outra sessão), sem remoto e sem PR. CTG-0002 segue M8/M23: rotas delegadas devolvem
  `PORTAL.SERVICE_UNAVAILABLE` com motivo; teste de delegação real `todo` citando R-0007.
- **R-0010 `boat-backend` ativa em paralelo** (worktree `orchestra/boat-backend` em `0996391`, bootstrap em curso,
  `pnpm check` observado rodando naquela worktree em 2026-09-16). Lock comum: `backend/domains/shared/src/policy.ts`
  (bloco `est:*` × bloco `PORTAL_RULES`) e `policy.spec.ts`. Regra: quem mescla por segundo integra `origin/main`
  com merge normal, mantém os dois blocos e roda `pnpm --filter @detran/shared test`. Nenhum DDL nem blueprint em
  comum (`est` × `portal`).
- **CTG-0001** (identidade + modelo + projeções + fixtures): sem upstream → livre para merge.
- **CTG-0002** (rotas + delegações + contratos): upstream R-0007 ausente → M8/M23; sem base empilhada.

## Bloqueios

(nenhum)

**Desvio registrado (2026-09-16):** `prompt-review-1` devolveu `FAIL` por seis achados `high` de fronteira de escrita
(Engineer editando blueprints em `docs/` e `policy.spec.ts`; TASK-0009 como Engineer em `docs/`; gate contraditório de
TASK-0007). Nenhum achado contradiz definição canônica, decisão do Owner ou ADR: são correções de estrutura. Pela instrução
explícita do Owner (`AUTHORIZATION.md`, "prossiga até o completo encerramento") e pelo precedente de R-0008 (waves.md
§Histórico), o maestro corrigiu os seis itens (M24, TASK-0009 → Architect transcrição, e2e por fronteira) e submeteu
`prompt-review-2` restrito aos itens corrigidos, em vez de parar e reportar. `prompt-review-2` devolveu `FAIL` por três
inconsistências residuais entre a tabela de tarefas e os prompts (duas substituições da tabela não aplicadas; uma frase de
contexto em TASK-0004) — corrigidas e submetidas em `prompt-review-3` (terceiro ciclo, restrito aos três itens), também por
decisão do maestro sob a instrução do Owner. Registrado aqui e no relatório final.

## Triagem

(uma linha por falha de gate: `TASK — gate — plant-bug | sensor-error | policy-issue | reference-gap — achado — ação`)

## Retomada

**Retomada 2026-09-16 (maestro Fable 5.1)** por instrução explícita do Owner (`AUTHORIZATION.md`). Bootstrap
concluído: rebase sobre `0996391`; `pnpm install --frozen-lockfile` OK; `pnpm check` verde (linha de base,
≈8 min); `devai doctor` verde; rodada R-0009 já registrada no DEVAI (0 tarefas; `round plan --scaffold` responde
`ROUND_ALREADY_EXISTS`, esperado desde PR #31). Decisões M1–M23 fechadas; 10 tarefas em 2 CTG.

Estado das tarefas: (atualizado pelo maestro a cada checkpoint)

| Tarefa    | Estado      | Nota                                              |
| --------- | ----------- | ------------------------------------------------- |
| TASK-0001 | in_progress | disparada 2026-09-16 após PASS de prompt-review-3 |
| TASK-0002 | in_progress | idem, em paralelo                                 |
| TASK-0003 | queued      | —                                                 |
| TASK-0004 | queued      | —                                                 |
| TASK-0005 | queued      | —                                                 |
| TASK-0006 | queued      | —                                                 |
| TASK-0007 | queued      | —                                                 |
| TASK-0008 | queued      | —                                                 |
| TASK-0009 | queued      | —                                                 |
| TASK-0010 | queued      | —                                                 |

Último veredito do reviewer: `prompt-review-3` PASS (após FAIL/FAIL de estrutura, ver §Bloqueios). Próximos passos: relatórios de TASK-0001/0002 → checkpoint → TASK-0003.

## Leitura

HEAD no início da leitura: `9d7abeade469d97f6c5e259e2d51b231bb9e68f0` (= `0996391` + checkpoint rebaseado).
Lido uma vez pelo maestro (2026-09-16): `AGENTS.md`, `CODESTYLE.md`, `docs/meta/agents/README.md`,
`docs/meta/agents/orchestra/{README,model-ladder,waves}.md`, `docs/framework/arch/portal-build-pack.md`,
`docs/meta/adr/ADR-0019`, `ADR-0020`, `docs/framework/arch/portal-route-contract.md`,
`docs/framework/arch/portal-error-catalog.md`, `docs/framework/arch/parameter-catalogue.md` (§PORTAL e §gramática),
`docs/meta/knowledge-base/steering.md` §H, `docs/meta/knowledge-base/decision-closure-plan.md` (linhas PORTAL),
`docs/framework/product/transversal/portal/workflows/WF-PORTAL-00{1,2,3,4}.md` (§Estados, §Transições, §Prazos,
§Catálogo), `docs/meta/agents/{architect-blueprint,engineer-backend,inspector-tests,transcriber-docs}.md`,
`docs/meta/agents/orchestra/{worker-prompt,reviewer-prompt}.template.md`, `task.template.json`,
`work/rounds/R-0009/plan.md`, `work/rounds/R-0008/{plan.md §Decisões, prompts/TASK-0001.md, tasks/TASK-0001.json,
AUTHORIZATION.md, budget.json, compositions.json}`; código: `backend/domains/shared/src/{policy.ts (blocos portal,
DASH, montagem), roles.ts, decorators.ts (Public), errors/detran-error.ts, events/index.ts}`,
`backend/app/src/detran-runtime.ts` (verificador local, Cognito, tenant resolver), `backend/app/src/teat-stream.controller.ts`
(cabeçalho), `backend/app/tests/e2e/{policy-routes,inf-ait-routes}.e2e.spec.ts` (cabeçalhos), `backend/domains/portal/complaints`
(layout, `package.json`), `backend/database/ddl/{02-auth,04-integration-storage (outbox),11-auth-functions,
14-inf-lifecycle-vocabulary (timers),60-portal-complaints}.sql`, `backend/database/seed/{00-fixtures-core (cabeçalho),
05-parameters (portal), 60-fixtures-rait-integration (cabeçalho)}.sql`, `backend/database/seed.sh`,
`tools/{check-rls-ddl,check-lifecycle-vocabulary,verify-controller-decorators}.ts`, `tools/blueprints/generate.mjs`
(controlador, módulo, DDL), `docs/framework/blueprints/{module-blueprint.schema.json, BP-INF-NOTIFICATION-001.json}`,
`backend/domains/inf/deadlines/src/{types,timer-catalog,local-date}.ts` (exports), `package.json` (scripts),
`@stynx-nyx/auth` (`cognito-token-verifier.js`: `claims: payload`).
