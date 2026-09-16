# Prompt do reviewer — modo `prompt-review` (`prompt-review` | `delivery-review`)

> Você é o **reviewer** da orquestra `portal-backend` (rodada `R-0009`), modelo da família
> **oposta** à do maestro. Você não escreve código nem prompts: você julga. Papel constitucional:
> Auditor (soft gate, Constituição DEVAI Art. 18). Trabalhe somente em leitura na worktree
> `/Volumes/Thiamat II/stech/detran-worktrees/portal-backend`. Responda **apenas** com o JSON do §Saída, sem prosa antes ou depois.

## Contexto mínimo (leia nesta ordem)

1. `docs/meta/agents/orchestra/README.md` §4 (correção formal) e §5 (parcimônia)
2. `docs/meta/agents/README.md` §Regras comuns
3. `docs/framework/arch/portal-build-pack.md` — apenas a seção do WP `WP-P0…P3` e o "mapa entregável → definições"
4. `work/rounds/R-0009/plan.md`
5. Modo `prompt-review`: todos os arquivos em `work/rounds/R-0009/prompts/`.
   Modo `delivery-review`: `work/rounds/R-0009/reports/*.md`, o diff anexado abaixo e os
   arquivos por ele tocados.

## Rubrica (cada item é verificável; cite arquivo e linha)

| #   | Item                                                                                                                       | Aplica a |
| --- | -------------------------------------------------------------------------------------------------------------------------- | -------- |
| 1   | Papel constitucional declarado e compatível com o que a tarefa toca (Art. 6, 10)                                           | ambos    |
| 2   | Leitura obrigatória fechada e suficiente: o worker consegue executar sem procurar nada fora da lista                       | prompt   |
| 3   | Fronteira de escrita disjunta entre tarefas simultâneas; `target_modules` corretos; nada de `git` para workers             | prompt   |
| 4   | Critérios de aceitação são comandos existentes (`package.json`) ou arquivos verificáveis, com resultado esperado explícito | ambos    |
| 5   | Nenhum valor inventado: prazos, papéis, estados, erros, rótulos vêm de documento canônico ou viram `source_pending`/`OD-*` | ambos    |
| 6   | Tríade respeitada (Architect → Inspector → Engineer) e testes escritos antes da implementação                              | ambos    |
| 7   | Gates não enfraquecidos (nenhum teste relaxado, nenhum `skip`, nenhum arquivo gerado editado à mão)                        | delivery |
| 8   | Vocabulário canônico (tokens de estado, timer, papel, erro) e i18n só na camada de rótulo                                  | ambos    |
| 9   | Fronteira nacional: nada fala com SENATRAN fora de `packages/senatran-adapter` (ADR-0003)                                  | delivery |
| 10  | ADR e OD citados onde a decisão foi tomada; decisões do steering §H respeitadas, não reabertas                             | ambos    |
| 11  | Entrega completa em relação ao critério: nada "deixado para depois" sem registro em §Fora de escopo                        | delivery |
| 12  | Parcimônia: o prompt não manda ler o repositório inteiro; esforço e modelo condizem com `model-ladder.md`                  | prompt   |
| 13  | Matrizes de autorização testam grants positivos e negativas exaustivas para papéis canônicos omitidos; nada por analogia   | ambos    |

## Veredito

- **PASS**: nenhum achado de severidade `high`; achados `low` viram notas.
- **REVIEW**: pelo menos um achado `high` corrigível pelo maestro ou pelo worker sem mudar o plano.
- **FAIL**: o plano ou a entrega contradiz uma definição canônica, uma decisão do Owner, uma ADR ou
  a Constituição; ou a fronteira de escrita foi violada.

Ciclos: o **primeiro** ciclo de cada item é **exaustivo** — liste todos os achados de uma vez. Nos ciclos
seguintes do mesmo item, avalie **somente** as correções dos achados anteriores; um achado novo sobre
texto que não mudou só é admitido se for `FAIL` por definição (contradição canônica, decisão do Owner,
ADR, Constituição ou fronteira de escrita) e deve dizer explicitamente por que não foi levantado antes
(ajuste R-0006).

## Saída (JSON, e nada mais)

```json
{
  "mode": "prompt-review",
  "round": "R-0009",
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [
    {
      "severity": "high | low",
      "item": 4,
      "file": "work/rounds/R-0009/prompts/TASK-0002.md",
      "line": 31,
      "claim": "critério cita `pnpm --filter @detran/rait-web test`, pacote inexistente",
      "fix": "usar `pnpm --filter @detran/ui test` até o app existir"
    }
  ],
  "notes": ["observações não bloqueantes"]
}
```

## Material anexado pelo maestro

Primeiro ciclo (exaustivo). Julgue o plano e os dez prompts. Ciclo seguinte fica restrito aos itens corrigidos.
Contexto factual para o item 4: os pacotes `@detran/portal-{identity,requests,inbox,citizen-service,projections}` ainda não existem — são gerados por TASK-0002 com os scripts padrão do gerador (`typecheck`, `test:unit`, `test:integration`, `test:e2e`); `pnpm --filter @detran/api-clients typecheck` existe; o DB `detran_r9` é criado por TASK-0002.
Contexto para o item 3: TASK-0001 ∥ TASK-0002 (locks disjuntos: ADR + contrato × blueprints + DDL); TASK-0003 ∥ TASK-0005; o restante é sequencial.

### work/rounds/R-0009/plan.md

```markdown
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
  `portal:stream:read`. `portal:appeal:{create,read-own}` (linhas existentes) são **removidas** e substituídas por
  `portal:request:*` (ADR-0019: o caso é do RAIT) — o Engineer verifica que nenhum controlador as usa (`grep`).
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

## Tarefas

| Tarefa    | Papel                   | Perfil              | Modelo/esforço | Lock                                                                                                         | Depende de           | Entrega                                                                                                                                                                                                                                                |
| --------- | ----------------------- | ------------------- | -------------- | ------------------------------------------------------------------------------------------------------------ | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| TASK-0001 | Architect               | architect-blueprint | Opus / alto    | `MOD-adr`, `MOD-r9-contracts-ctg1`                                                                           | —                    | ADR-0024 gov.br via Cognito; contrato `contracts/CTG-0001.md` (claims, guarda, matriz ato→nível, máquinas [WF-PORTAL-001/002/004], fixtures, critérios C-0001-nn, layout)                                                                              |
| TASK-0002 | Architect               | architect-blueprint | Opus / alto    | `MOD-bp-portal`, `MOD-ddl-61-65`, `MOD-ddl-14`, `MOD-ddl-1x`, `MOD-blueprints-generated`                     | —                    | cinco blueprints + gerados; DDL 19 (plataforma), 14 (timers portal), 11 (schema portal nos triggers); `apply.sh`; DB `detran_r9` aplicado                                                                                                              |
| TASK-0003 | Inspector               | inspector-tests     | Sonnet / médio | `MOD-portal-tests-ctg1`, `MOD-seed-70`, `MOD-app-e2e-portal-identity`                                        | TASK-0001, TASK-0002 | testes C-0001-nn: guarda fail-closed (unit + e2e com IdP simulado), matriz de nível, máquinas (13 e 9 estados), RLS `portal.*`, `70-fixtures-portal.sql` + `seed.sh` duas vezes                                                                        |
| TASK-0004 | Engineer                | engineer-backend    | Opus / médio   | `MOD-portal-identity-hw`, `MOD-app-runtime-auth`, `MOD-app-module`, `MOD-check-rls-ddl`                      | TASK-0003            | claims no runtime, `PortalCitizenGuard`, `assertActLevel`, `GET me`, `GET brand`, `GET services[/key]`, `TenantResolver` por Host, wiring dos 5 pacotes (`AppModule`, vitest, scripts); C-0001 verdes                                                  |
| TASK-0005 | Architect               | architect-blueprint | Opus / alto    | `MOD-r9-contracts-ctg2`                                                                                      | TASK-0001, TASK-0002 | contrato `contracts/CTG-0002.md`: bloco por rota (§3–§9), delegação (M8), idempotência (M9), projetores (M16), SSE (M18), matriz `portal:*` ⇔ rotas (M19), eventos (M21), critérios C-0002-nn                                                          |
| TASK-0006 | Inspector               | inspector-tests     | Opus / alto    | `MOD-portal-tests-ctg2`, `MOD-shared-policy-spec`, `MOD-app-e2e-portal-routes`                               | TASK-0004, TASK-0005 | testes C-0002-nn: rotas (vínculo 404, idempotência, protocolo antes da validação, `SERVICE_UNAVAILABLE` com motivo, `DELEGATION_FAILED` com alvo falso, `todo` R-0007), replay das projeções, SSE, `policy.spec` `portal:*`, `policy-routes` estendido |
| TASK-0007 | Engineer                | engineer-backend    | Opus / médio   | `MOD-portal-requests-hw`, `MOD-portal-identity-hw`, `MOD-shared-policy`                                      | TASK-0006            | `PORTAL_RULES` completo em `policy.ts` (M19); rotas §3 (elevações, representações, preferências) e §5 (pedidos, delegação, idempotência, protocolo); testes do seu escopo verdes                                                                       |
| TASK-0008 | Engineer                | engineer-backend    | Opus / médio   | `MOD-portal-inbox-hw`, `MOD-portal-citizen-service-hw`, `MOD-portal-projections-hw`, `MOD-app-portal-stream` | TASK-0007            | rotas §4, §6, §7, §8; projetores e replay (M16); cache nacional (M17); SSE (M18); testes restantes de C-0002 verdes; `policy-routes` verde                                                                                                             |
| TASK-0009 | Engineer                | engineer-backend    | Sonnet / baixo | `MOD-contracts-commands-portal`, `MOD-schemas-portal`                                                        | TASK-0008            | `docs/framework/contracts/BP-PORTAL-*.commands.openapi.json` (§5.1, 4xx do catálogo, `Idempotency-Key`, exemplos com fixtures), `docs/framework/schemas/portal-request-draft.schema.json`; `contracts:check`/`contracts:clients` verdes                |
| TASK-0010 | Architect (transcrição) | transcriber-docs    | Sonnet / baixo | `MOD-docs-portal`                                                                                            | TASK-0009            | `portal-build-pack.md` §WP-P0…P3 executados (+ correções §9 do método), ADR-0019 "Implementação: PR #n", `portal-route-contract.md` §11 conferido, OD-P14…P21 em `open-decisions` do Portal, backlog                                                   |

CTG-0001 = TASK-0001…0004 (identidade + modelo + fixtures; sem upstream). CTG-0002 = TASK-0005…0010 (rotas +
projeções + contratos + docs; upstream R-0007 só para delegações reais, tratadas por M8/M23). Um PR por CTG.
Paralelismo: TASK-0001 ∥ TASK-0002; TASK-0003 ∥ TASK-0005; o restante em cadeia (locks `policy.ts` e app).

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

## Triagem

(uma linha por falha de gate: `TASK — gate — plant-bug | sensor-error | policy-issue | reference-gap — achado — ação`)

## Retomada

**Retomada 2026-09-16 (maestro Fable 5.1)** por instrução explícita do Owner (`AUTHORIZATION.md`). Bootstrap
concluído: rebase sobre `0996391`; `pnpm install --frozen-lockfile` OK; `pnpm check` verde (linha de base,
≈8 min); `devai doctor` verde; rodada R-0009 já registrada no DEVAI (0 tarefas; `round plan --scaffold` responde
`ROUND_ALREADY_EXISTS`, esperado desde PR #31). Decisões M1–M23 fechadas; 10 tarefas em 2 CTG.

Estado das tarefas: (atualizado pelo maestro a cada checkpoint)

| Tarefa    | Estado | Nota |
| --------- | ------ | ---- |
| TASK-0001 | queued | —    |
| TASK-0002 | queued | —    |
| TASK-0003 | queued | —    |
| TASK-0004 | queued | —    |
| TASK-0005 | queued | —    |
| TASK-0006 | queued | —    |
| TASK-0007 | queued | —    |
| TASK-0008 | queued | —    |
| TASK-0009 | queued | —    |
| TASK-0010 | queued | —    |

Último veredito do reviewer: nenhum. Próximos passos: prompts → `prompt-review-1` → disparo de TASK-0001 ∥ TASK-0002.

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
```

### work/rounds/R-0009/prompts/TASK-0001.md

````markdown
# Prompt de worker — `TASK-0001` (`architect-blueprint`)

> Você é um worker da orquestra `portal-backend`, rodada `R-0009`, na worktree
> `/Volumes/Thiamat II/stech/detran-worktrees/portal-backend`. Você executa **uma** tarefa, dentro de
> uma fronteira de escrita, e entrega um relatório. Você **nunca** executa `git` (nem `add`, nem
> `commit`, nem `stash`), nunca instala pacotes (não rode `pnpm install`), nunca edita arquivos
> gerados, nunca altera testes. Se algo impedir a tarefa, pare e escreva o bloqueio no relatório.

## Papel

Papel constitucional (Art. 6): **Architect**. Declare-o na primeira linha da sua resposta.
Manual do perfil: `docs/meta/agents/architect-blueprint.md` — leia-o primeiro. Nesta tarefa você **não**
escreve blueprint, DDL, código nem teste (o blueprint é TASK-0002, em paralelo): você escreve a **ADR-0024**
e o **contrato `CTG-0001.md`** que o Inspector (TASK-0003) transcreve em testes e o Engineer (TASK-0004) em código.

## Contexto da frente (o que você precisa saber, já resumido)

WP-P0…P3 do Portal (`docs/framework/arch/portal-build-pack.md`). Nada do domínio `portal` existe no backend além
de `portal/complaints` (PEC, intocável — M2). O maestro fechou as decisões **M1–M23** em
`work/rounds/R-0009/plan.md` §Decisões: elas **são o contrato de partida** — você as detalha; não as reabre. Onde
uma M-decisão e um documento canônico divergirem, prevalece o canônico e você registra a divergência no relatório
(triagem do maestro). Grupo CTG-0001 = identidade federada (claims, guarda, matriz ato→nível) + modelo (cinco
blueprints, TASK-0002) + fixtures. As rotas de `portal-route-contract.md` §3–§9 são CTG-0002 (TASK-0005): aqui só
`GET me`, `GET brand`, `GET services`, `GET services/{serviceKey}` (as quatro que TASK-0004 implementa para provar a
guarda e o catálogo).

## Leitura obrigatória (lista fechada — não leia além dela)

- `AGENTS.md`; `CODESTYLE.md`; `docs/meta/agents/architect-blueprint.md`
- `work/rounds/R-0009/plan.md` (inteiro: Metas, Decisões M1–M23, Tarefas, Critérios, Mapa, Riscos, Concorrência)
- `work/rounds/R-0008/contracts/CTG-0001.md` (só §1 e §6 — formato de contrato adotado: blocos monoespaçados, não tabelas)
- `docs/framework/arch/portal-build-pack.md` §1, §2 (WP-P0, WP-P1), §4 (OD-P), §5
- `docs/meta/adr/ADR-0019-citizen-identity-and-request-lifecycle.md` (inteira); `docs/meta/adr/ADR-0005-*.md` (só §Decision, papel `CIDADAO`);
  `docs/meta/adr/README.md` (índice: confirme que ADR-0024 é o próximo número livre; se não for, use o próximo livre e diga no relatório)
- `docs/meta/adr/ADR-0023-minimum-ops-agency-context.md` (só como modelo de formato/tamanho de ADR curta)
- `docs/framework/arch/portal-route-contract.md` §1 (regras), §2 (público), §3 (só `GET me`), §11 (mapeamento de origem)
- `docs/framework/arch/portal-error-catalog.md` §1, §2, §7
- `docs/framework/arch/parameter-catalogue.md` §PORTAL (linhas `portal.*`, `privacy.*`) e §"Verificador fail-closed"
- `docs/meta/knowledge-base/steering.md` §H itens 49, 50, 51, 52, 53, 54
- `docs/framework/product/transversal/portal/workflows/WF-PORTAL-001.md` §Estados, §Transições, §Catálogo de serviços, §Prazos;
  `WF-PORTAL-002.md` §Estados, §Transições, §Matriz "ato → nível"; `WF-PORTAL-003.md` §Estados, §Prazos;
  `WF-PORTAL-004.md` §Estados, §Transições, §Prazos, §Decisão 2026-09-13
- `docs/framework/product/transversal/portal/rules/RN-PORTAL-101.md`, `RN-PORTAL-104.md`, `RN-PORTAL-108.md`,
  `RN-PORTAL-109.md`, `RN-PORTAL-112.md`, `RN-PORTAL-118.md` (§Regra de cada um)
- `docs/framework/product/transversal/portal/use-cases/UC-PORTAL-019.md` §Critérios de aceitação (elevação de nível)
- `docs/reference/legal/detran-am/REF-DETRANAM-PORTARIA-NORMATIVA-001-2025.md` (se existir com esse nome; senão o arquivo
  cujo id é `[REF-DETRANAM-PORTARIA-NORMATIVA-001-2025]` em `docs/reference/legal/detran-am/` — só a matriz de atos/níveis)
- `backend/domains/shared/src/roles.ts` (papéis canônicos, `CIDADAO`); `backend/domains/shared/src/policy.ts` (linhas 1590–1610:
  montagem e as duas linhas `portal:appeal:*`; e `GLOBAL_ADMIN_ROLES`); `backend/domains/shared/src/decorators.ts` (`Public`,
  `Resource`, `Action`, `Audit`); `backend/domains/shared/src/errors/detran-error.ts` (inteiro); `backend/domains/shared/src/tenant-context.ts`
- `backend/app/src/detran-runtime.ts` linhas 55–135 (perfis) e 296–400 (`DetranLocalTokenVerifier`, `detranTokenVerifier`, `DetranTenantResolver`)
- `backend/database/ddl/05-role-catalog.sql` (linha `CIDADAO`); `backend/database/seed/00-fixtures-core.sql` (cabeçalho + tenant + 3 primeiros usuários);
  `backend/database/seed/30-fixtures-infraction.sql` (ids das infrações/AITs canônicos, cabeçalho e primeiras 30 linhas)
- `backend/app/tests/e2e/inf-ait-routes.e2e.spec.ts` linhas 1–110 (padrão de e2e com perfil `test`, `DETRAN_LOCAL_ROLES`, tenant local)
- `tools/verify-controller-decorators.ts` (regras: `@Public`, `@Resource`, `@Action`, `@Audit` em mutações)

## Pode tocar

- `docs/meta/adr/ADR-0024-govbr-federation-via-cognito.md` (novo) e a linha correspondente em `docs/meta/adr/README.md`.
- `work/rounds/R-0009/contracts/CTG-0001.md` (novo).

## Não pode tocar

Tudo o mais: código, testes, blueprints, DDL, seeds, `docs/**` (exceto os dois arquivos acima), `plan.md`, `tasks/`,
`prompts/`. Além disso: `docs/framework/product/**` (corpus de produto), `record/`, `.devai/`, arquivos com cabeçalho
"Generated from BP-…".

## Tarefa (o quê, não o como)

### A. ADR-0024 — "gov.br federado via Cognito: níveis de assinatura como claim, CPF como sujeito de negócio"

Formato das ADRs existentes (Status / Context / Decision / Consequences, inglês como ADR-0019/0023, ≤ 90 linhas).
Status: `Accepted on 2026-09-16 by Owner decision (steering H.50, H.49, H.51) on the Architect's proposal`. Conteúdo
mínimo (tudo de M3/M4/M5 + fontes): (1) IdP OIDC gov.br federado no pool Cognito do cidadão; nenhuma credencial
armazenada; (2) mapeamento selo → `assurance_level` **feito no IdP** (attribute mapping) e transportado como claim
assinada: bronze → `simples`; **prata ou ouro → `avancada`** (H.50 — decisão do Owner contra a PN DETRAN-AM
001/2025 art. 1º, que só admite ouro; **risco registrado**: ato atacável até portaria admitindo prata, pedido
incluído na carta ao DETRAN-AM); e-Notariado/ICP-Brasil → `qualificada`; (3) CPF como `sub` de negócio (claim
`cpf`), grupo `CIDADAO`, representação como atributo de dados (`portal.representation`), nunca como grupo;
(4) guarda fail-closed `PORTAL.ASSURANCE_NOT_VERIFIED` (M4); (5) matriz ato → nível como **dados**
(`portal.act_level_policy`, M5), fonte por linha; (6) perfis `local-sandbox`/`test` com IdP simulado por
variáveis `DETRAN_LOCAL_ASSURANCE_LEVEL`/`DETRAN_LOCAL_CPF`; nomes de claim configuráveis
`STYNX_COGNITO_ASSURANCE_CLAIM`/`STYNX_COGNITO_CPF_CLAIM`; (7) consequências: OD-P15 (credenciais institucionais
gov.br, `source_pending`, homologação R-0014), OD-P02 revisado (registrar que H.50 fecha a questão com risco),
elevação de nível (`UC-PORTAL-019`) = redirect + `resumeToken` sem estado além do token (CTG-0002).

### B. Contrato `work/rounds/R-0009/contracts/CTG-0001.md`, nesta ordem

1. **Cabeçalho**: rodada, grupo, fontes, consumidores (TASK-0003 Inspector, TASK-0004 Engineer), lista de M-decisões aplicadas.
2. **Claims e principal** (M3): forma exata de `portalIdentityClaims(principal)` → `{ cpf, assuranceLevel, govbrLevel? } | null`
   (regras: `cpf` = 11 dígitos após remover não dígitos, senão inválido; `assurance_level` só os três tokens; qualquer outra coisa → `null`);
   variáveis de ambiente por perfil; o que `DetranLocalTokenVerifier` acrescenta em `principal.claims`; o que **não** muda em
   `detran-runtime.ts` (nada de Cognito real nesta rodada).
3. **Guarda `PortalCitizenGuard`** (M4) — bloco monoespaçado: ordem das verificações, erro por verificação (código, status, `context`),
   interação com `DetranPolicyGuard` (a guarda de identidade roda **depois** da autenticação STYNX e **antes** da política? Decida e
   fixe: a guarda é `@UseGuards` de controlador, logo roda na cadeia do Nest após os guards globais — descreva a consequência para
   `technical-admin` com `*`: passa a política mas **falha** a guarda sem claims), e o ponto de extensão para `assertActLevel`.
4. **`assertActLevel`** (M4/M5): assinatura, leitura de `portal.act_level_policy` (vigência: `enabled=true` e
   `effective_from <= hoje < coalesce(effective_to, 'infinity')`, `hoje` pelo `Clock` injetado, nunca `Date.now()`), ordem dos níveis,
   erros exatos e `context` (`elevationMethods` fixo `['biographic','biometric','icp']`, `resumeRoute` = parâmetro do chamador).
5. **Matriz ato → nível** (M5) transcrita linha a linha com `legal_basis` e `decision_ref` por linha (Decreto 10.543/2020 art. 4º
   incisos; PN 001/2025; H.49; H.50; H.51) — é a fixture de `act_level_policy`.
6. **Máquinas de estado** transcritas em blocos `from → to : comando|evento : guarda`: `WF-PORTAL-001` (13 estados; M7 — inclua a
   lista de estados **não** admitidos por comando para `PORTAL.REQUEST_STATE_INVALID`), `WF-PORTAL-002` (14 estados — só os que
   têm persistência: `representation.state`; os demais são estados de sessão/UX, diga isso), `WF-PORTAL-003` (`sne_enrollment.state`
   e o ciclo por notificação como **projeção**, não máquina própria), `WF-PORTAL-004` (9 estados; M13).
7. **Entidades** (M6, M7, M12, M13, M15, M16, M11): para cada tabela, colunas com tipo SQL, nulidade, checks (conjuntos exatos),
   índices únicos, FKs (só dentro do schema `portal`; alvos de outros domínios sem FK), e a **descrição** que TASK-0002 copia para o
   blueprint (cita workflow e seção). TASK-0002 corre em paralelo a partir de M-decisões: onde você precisar **divergir** de uma
   M-decisão, marque `[DIVERGE-Mn]` para o maestro reconciliar antes do Inspector.
8. **Rotas deste grupo** (4): `GET /v1/portal/identity/me` (`portal:identity:read`, `@Audit PORTAL_IDENTITY_READ`, resposta do §3
   do contrato de rotas com os campos que existem nesta rodada — `preferences` e `heldDataSummary` como `[]`/`null` com nota), `GET /v1/portal/brand`,
   `GET /v1/portal/services`, `GET /v1/portal/services/{serviceKey}` (`@Public()`; `serviceKey` inexistente → 404 `PORTAL.NOT_FOUND { kind: 'service' }`).
   Fixe controlador/arquivo, decoradores, resposta campo a campo com fonte.
9. **Resolução de tenant pelo Host** (M11): algoritmo de `DetranTenantResolver` estendido, erros 421/403, comportamento no perfil local
   (mantém `LOCAL_TENANT_ID`; `public_hostname` só é consultada fora do perfil local **ou** quando `DETRAN_PORTAL_HOST_RESOLUTION=on`
   — essa variável é a única forma de o e2e provar o caminho; registre-a).
10. **Fixtures** (M22): ids exatos (`00000000-0000-7000-8000-0000700000nn` e derivados), colunas obrigatórias de cada linha, o estado que
    cada linha representa, mapa CPF fixture → sujeito; ids das infrações/AITs de `30-fixtures-infraction.sql` usados nos `entitlement`.
11. **Critérios para o Inspector**: lista numerada `C-0001-nn` — cada item = "dado <fixture/env> quando <ação> então <efeito|código>",
    com tier (`unit|integration|e2e`) e arquivo de teste alvo: `backend/domains/portal/identity/src/handwritten/citizen.guard.spec.ts`,
    `backend/domains/portal/identity/src/handwritten/act-level.spec.ts`, `backend/domains/portal/requests/src/handwritten/guards/request.transitions.spec.ts`,
    `backend/domains/portal/citizen-service/src/handwritten/guards/manifestation.transitions.spec.ts`,
    `backend/domains/portal/identity/tests/integration/portal-rls.integration.spec.ts` (leitura cruzada entre tenants em
    `portal.subject`, `portal.request`, `portal.manifestation`, `portal.inbox_item` → vazio; `brand_profile`/`public_hostname` legíveis sem tenant),
    `backend/domains/portal/identity/tests/integration/portal-seed.integration.spec.ts` (contagens das fixtures após `seed.sh`),
    `backend/app/tests/e2e/portal-identity.e2e.spec.ts` (login com IdP simulado: `DETRAN_LOCAL_ROLES=CIDADAO` sem
    `DETRAN_LOCAL_ASSURANCE_LEVEL` → 403 `PORTAL.ASSURANCE_NOT_VERIFIED`; com `avancada` + `DETRAN_LOCAL_CPF` → 200 `GET me`;
    `DETRAN_LOCAL_ROLES=field-agent` → 403 `PORTAL.IDENTITY_NOT_CITIZEN`; `technical-admin` sem claims → 403 `ASSURANCE_NOT_VERIFIED`;
    `GET brand`/`GET services` sem `Authorization` → 200; contagem 9/2/4 de `GET services`).
12. **Layout para o Engineer** (TASK-0004): arquivos a criar em `backend/domains/portal/identity/src/handwritten/` (`citizen.guard.ts`,
    `act-level.ts`, `identity-claims.ts`, `me.controller.ts`, `public.controller.ts`, `errors.ts` = `PortalError extends DetranError`
    com prefixo `PORTAL`, `index.ts`), entradas `handwrittenExports`/`handwrittenControllers`/`handwrittenProviders` a acrescentar
    no bloco `module` de `BP-PORTAL-IDENTITY-001` (seguido de `pnpm blueprints:generate && pnpm contracts:openapi`), wiring em
    `backend/app/src/app.module.ts` (cinco módulos), `backend/app/vitest.config.ts` (cinco aliases), `backend/app/package.json`
    (cinco deps `workspace:*`), scripts da raiz `package.json` (`build`, `backend:test:unit|integration|e2e` com os cinco pacotes),
    `tools/check-rls-ddl.ts` (allowlist M11), `backend/domains/shared/src/policy.ts` — TASK-0004 toca a política **só** para
    acrescentar `['portal:identity:read', ['CIDADAO']]` e remover as duas linhas `portal:appeal:*`; o bloco `PORTAL_RULES` completo
    é TASK-0007 (M19). Diga isso explicitamente no layout.
13. **Divergências** encontradas (documento × M-decisão) e **OD propostas** (OD-P14…P21 já reservadas em `plan.md`; novas a partir de OD-P22).

## Definições que valem como contrato (copiadas das fontes; não reinterprete)

- Papéis canônicos (`roles.ts`): o Portal usa **só** `CIDADAO`; `GLOBAL_ADMIN_ROLES` = `ADMIN`, `GESTOR_DETRAN`, `SUPORTE`,
  `technical-admin` (permissão `*` em `isDetranActionAllowed`). Toda matriz de grants lista positivos e negativos para **todos** os
  papéis canônicos omitidos (orchestra/README.md §4.8).
- Níveis: `simples`, `avancada`, `qualificada` (route contract §11: `custom:teat_assurance_level low/substantial/high` da origem
  vira a claim `assurance_level`); `none` só existe na matriz ato→nível (H.51). `PORTAL.ASSURANCE_QUALIFIED_NEVER_REQUIRED` 500
  quando uma política exige `qualificada` (RN-PORTAL-101).
- Erros (catálogo §1, §2, §7): `PORTAL.AUTH_REQUIRED` 401, `PORTAL.IDENTITY_NOT_CITIZEN` 403, `PORTAL.ASSURANCE_NOT_VERIFIED` 403,
  `PORTAL.ASSURANCE_INSUFFICIENT` 403 `{ actKey, required, current, elevationMethods[], resumeRoute }`,
  `PORTAL.TENANT_UNRESOLVED` 421, `PORTAL.SESSION_TENANT_MISMATCH` 403, `PORTAL.NOT_FOUND` 404 `{ kind }`,
  `PORTAL.VALIDATION_FAILED` 400 `{ fields[] }`, `PORTAL.IF_MATCH_REQUIRED` 428, `PORTAL.VERSION_CONFLICT` 412, `PORTAL.INTERNAL` 500.
  `messageKey` derivada por `DetranError`: `portal.errors.<código minúsculo>`.
- Estados `WF-PORTAL-001` (13): `IDENTIFICADO`, `SERVICO_SELECIONADO`, `ELEGIBILIDADE_VERIFICADA`, `INELEGIVEL`, `PEDIDO_EM_COMPOSICAO`,
  `AGUARDANDO_NIVEL_ASSINATURA`, `AGUARDANDO_PAGAMENTO`, `PROTOCOLADO`, `EM_ANDAMENTO_NO_ORGAO`, `RESULTADO_DISPONIVEL`,
  `AVALIACAO_OFERECIDA`, `CONCLUIDO`, `DESISTIDO`. Estados `WF-PORTAL-004` (9): `MANIFESTACAO_REGISTRADA`, `COMPROVANTE_EMITIDO`,
  `EM_ANALISE`, `INFORMACAO_SOLICITADA_AO_AGENTE`, `DECISAO_FINAL_ELABORADA`, `CIENCIA_AO_USUARIO`, `ENCERRADA`, `AVALIACAO_OFERECIDA`,
  `AVALIADA`. `WF-PORTAL-003`: `NAO_ADERIDO_SNE`, `ADERIDO_SNE`. `WF-PORTAL-002` persistidos: `PROCURACAO_APRESENTADA`,
  `PROCURACAO_VALIDADA`, `PROCURACAO_RECUSADA`.
- Parâmetros (catálogo §PORTAL): `portal.act_level_policy` (json, vigente, H.50), `portal.govbr_seal_mapping` (json, vigente, H.50),
  `portal.cetran_appeal_level` = `advanced` (H.54), `portal.ombudsman_level` (H.54), `portal.card_payment=false` (proposta, OD-P05),
  `portal.installments=false`, `portal.waiver_40_term=false` (OD-P03), `privacy.public_regime_days` (`source_pending`, OD-P08),
  `portal.read_cache_ttl_minutes=15` (H.54), `portal.mobile_shell=false`, `portal.ombudsman_taxonomy` (H.54). Nenhum spec pode conter
  essas chaves como literal (`verify:parameter-catalogue`); o contrato diz ao Inspector para ler pelo `ParameterService` ou por constante do código.
- Tenant local (`detran-runtime.ts`): `LOCAL_TENANT_ID = 00000000-0000-7000-8000-000000000001`, `LOCAL_ACTOR_ID = …4000-8000-000000000002`;
  tenant canônico das fixtures `00000000-0000-7000-8000-00000000a001`, `slug am-fixtures`, `agency-admin` canônico `…b0000016`.
- Fixtures "hoje" = 2026-09-14. Ids do Portal: prefixo `00000000-0000-7000-8000-0000700` (M22).

## Critérios de aceitação (todos precisam passar)

- `pnpm format:check` → "All matched files use Prettier code style!" (rode `node_modules/.bin/prettier --write` nos dois arquivos antes).
- `node tools/docs/kb/check.mjs` → sem novos problemas (a ADR não tem front-matter de KB; o índice `docs/meta/adr/README.md` referencia o arquivo).
- `docs/meta/adr/ADR-0024-govbr-federation-via-cognito.md` existe, ≤ 90 linhas, cita H.49/H.50/H.51, OD-P02, OD-P15, RN-PORTAL-101.
- `work/rounds/R-0009/contracts/CTG-0001.md` contém as 13 seções acima, com ≥ 30 critérios `C-0001-nn` e todas as colunas das tabelas de M6/M7/M12/M13/M15/M16/M11.

## Regras que não admitem exceção

1. Nenhum valor inventado: prazo, papel, estado, código de erro, rótulo ou parâmetro sem fonte nas definições acima vira
   `source_pending` ou uma questão `OD-*` no relatório; nunca constante silenciosa.
2. Código gerado não se edita (ADR-0007). Você não gera nada nesta tarefa.
3. Tokens de estado, timer, papel e erro vêm dos catálogos citados; a UI só traduz rótulos.
4. Nada fala com SENATRAN fora de `packages/senatran-adapter` (ADR-0003).
5. Fixtures canônicas (`backend/database/seed/`); não crie tenants nem personas fora do prefixo M22.
6. Prettier: `node_modules/.bin/prettier --write <arquivos que tocou>` antes de entregar.
7. Não reabra decisão do Owner (steering §H) nem M-decisão: divergência é `[DIVERGE-Mn]` no contrato + linha no relatório.

## Entrega (relatório em Markdown, este formato, nada além dele)

```markdown
Papel: <Art. 6>
Tarefa: TASK-0001
Arquivos criados/alterados: <lista com caminho>
Comandos executados e saída resumida: <um por linha, com o resultado>
Critérios de aceitação: <cada um com PASS/FAIL>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids, ou "nenhuma">
Divergências [DIVERGE-Mn]: <lista ou "nenhuma">
Bloqueios: <ou "nenhum">
```
````

````

### work/rounds/R-0009/prompts/TASK-0002.md

```markdown
# Prompt de worker — `TASK-0002` (`architect-blueprint`)

> Você é um worker da orquestra `portal-backend`, rodada `R-0009`, na worktree
> `/Volumes/Thiamat II/stech/detran-worktrees/portal-backend`. Você executa **uma** tarefa, dentro de
> uma fronteira de escrita, e entrega um relatório. Você **nunca** executa `git` (nem `add`, nem
> `commit`, nem `stash`), nunca instala pacotes (não rode `pnpm install` — o maestro instala os pacotes
> novos depois da sua entrega), nunca edita arquivos gerados à mão, nunca altera testes. Se algo impedir a
> tarefa, pare e escreva o bloqueio no relatório.

## Papel

Papel constitucional (Art. 6): **Architect**. Declare-o na primeira linha da sua resposta.
Manual do perfil: `docs/meta/agents/architect-blueprint.md` — leia-o primeiro. Nesta tarefa você escreve
**blueprints** e **DDL manuscrito nas faixas `0x/1x`**, regenera com o gerador e aplica em banco limpo. Nada de
código manuscrito, nada de teste, nada de contrato de comandos (é TASK-0001/0005).

## Contexto da frente (o que você precisa saber, já resumido)

WP-P1 do Portal (`docs/framework/arch/portal-build-pack.md`). O domínio `portal` não tem módulo além de
`portal/complaints` (PEC, DDL 60 — **intocável**, M2). O maestro fechou as decisões **M1–M23** em
`work/rounds/R-0009/plan.md` §Decisões: as tabelas, colunas, checks e índices de **M5, M6, M7, M8 (protocolo,
`idempotency_record`), M11, M12, M13, M14, M15, M16, M17 (`national_read_cache`)** são o seu contrato de partida.
TASK-0001 (contrato CTG-0001) corre **em paralelo** e pode marcar `[DIVERGE-Mn]`; o maestro reconcilia depois —
você segue as M-decisões. Os pacotes gerados são montados no app por TASK-0004 (não por você). A numeração de DDL
foi conferida pelo maestro em 2026-09-16: `19`, `61`, `62`, `63`, `64`, `65` estão livres (`ls backend/database/ddl`
— confira de novo antes de criar; se um número foi ocupado por outra frente, use o próximo livre da mesma faixa e diga
no relatório).

## Leitura obrigatória (lista fechada — não leia além dela)

- `AGENTS.md`; `CODESTYLE.md` (§Backend SQL: DDL manuscrito só em `0x/1x`); `docs/meta/agents/architect-blueprint.md`
- `work/rounds/R-0009/plan.md` (Metas, Decisões M1–M23, Tarefas, Critérios, Riscos)
- `docs/framework/arch/portal-build-pack.md` §2 WP-P1 (tabela de blueprints) e §5
- `docs/meta/adr/ADR-0019-citizen-identity-and-request-lifecycle.md` §Decision e §Ownership table; `ADR-0020-read-models-and-projections.md` (inteira)
- `docs/framework/blueprints/README.md`; `docs/framework/blueprints/module-blueprint.schema.json` (inteiro)
- `docs/framework/blueprints/BP-INF-NOTIFICATION-001.json` (modelo completo: `module` com `ddlFile`, `dependencies`, `testAliases`,
  `handwrittenExports`; `database.entities` com `fields`, `indexes`, `checks`, `foreignKeys`; `api.resources` com `operations`; `auth`; `audit`)
- `docs/framework/blueprints/BP-PORTAL-COMPLAINTS-001.json` (namespace `portal`, `ddlFile` 60 — só para copiar convenções; não altere)
- `tools/blueprints/generate.mjs` (inteiro — o que o gerador emite por entidade, `operations`, `handwrittenControllers/Providers`,
  DDL: `create_rls_policy` para **toda** entidade, `install_tenant_triggers`, grants); `tools/blueprints/check.mjs`
- `backend/database/ddl/11-auth-functions.sql` (inteiro), `14-inf-lifecycle-vocabulary.sql` (bloco `infraction_timer_ref`: tabela + INSERT),
  `02-auth.sql` (só `auth.tenants`), `04-integration-storage.sql` (só `integration.outbox`), `60-portal-complaints.sql`, `15-ops-parameter.sql`
  (só como exemplo de DDL manuscrito em `1x` com checks e comentários)
- `backend/database/apply.sh` (ordem de aplicação); `backend/database/seed.sh`
- `tools/check-rls-ddl.ts` (inteiro — você **não** o edita; entenda o que ele exige do DDL 19); `tools/check-lifecycle-vocabulary.ts`
  linhas 116–170 (timers: `seeded but not in workflow` **não** é erro)
- `backend/domains/inf/notification/package.json`, `vitest.config.ts`, `tsconfig.json`, `tsconfig.build.json` (o que o gerador produz por pacote)
- `backend/domains/inf/deadlines/src/index.ts` (só a lista de exports — `addCalendarDays` existe)
- `docs/framework/product/transversal/portal/workflows/WF-PORTAL-001.md` §Estados; `WF-PORTAL-003.md` §Estados; `WF-PORTAL-004.md` §Estados, §Prazos
- `docs/framework/arch/portal-route-contract.md` §2 (campos de `brand` e `services`), §11
- `docs/framework/arch/portal-error-catalog.md` §2 (`SERVICE_UNAVAILABLE`, `unavailableReason`)
- `work/rounds/R-0008/env-detran-r8.sh` (modelo de variáveis do banco da rodada)

## Pode tocar

- `docs/framework/blueprints/BP-PORTAL-IDENTITY-001.json`, `BP-PORTAL-REQUESTS-001.json`, `BP-PORTAL-INBOX-001.json`,
  `BP-PORTAL-CITIZEN-SERVICE-001.json`, `BP-PORTAL-PROJECTIONS-001.json` (novos).
- Arquivos gerados **somente via** `pnpm blueprints:generate` e `pnpm contracts:openapi` (novos diretórios
  `backend/domains/portal/{identity,requests,inbox,citizen-service,projections}/`, `backend/database/ddl/6{1,2,3,4,5}-portal-*.sql`,
  `docs/framework/contracts/BP-PORTAL-*.openapi.json`, `tools/blueprints/generated-files.json`, `packages/api-clients/src/generated/BP-PORTAL-*.ts`
  se `contracts:openapi`/`contracts:clients` os gerar — rode `pnpm contracts:clients` depois de `contracts:openapi`).
- DDL manuscrito: `backend/database/ddl/19-portal-platform.sql` (novo), `backend/database/ddl/14-inf-lifecycle-vocabulary.sql`
  (só o check de `owner` e novas linhas no INSERT de `infraction_timer_ref`), `backend/database/ddl/11-auth-functions.sql`
  (só a lista de schemas de `install_tenant_triggers`), `backend/database/apply.sh` (só se a ordem exigir — por padrão aplica `ddl/*.sql` em ordem lexicográfica; confirme).
- `work/rounds/R-0009/env-detran-r9.sh` (novo, modelo de R-0008 com `detran_r9`).

## Não pode tocar

Código manuscrito (`src/handwritten/**` de qualquer pacote), testes, seeds (`backend/database/seed/**`), `policy.ts`, `roles.ts`,
`backend/app/**`, `package.json` da raiz, `pnpm-lock.yaml`, `tools/*.ts`, `docs/**` fora de `docs/framework/blueprints/` e dos
contratos gerados, `plan.md`, `tasks/`, `prompts/`, `contracts/`. Além disso: `docs/framework/product/**`, `record/`, `.devai/`,
`docs/meta/adr/`, `BP-PORTAL-COMPLAINTS-001.json` e `60-portal-complaints.sql`.

## Tarefa (o quê, não o como)

1. **Cinco blueprints** (M1), `schemaVersion` e formato de `BP-INF-NOTIFICATION-001.json`; `module.namespace = "portal"`;
   `module.version = "1.0.0"`; `module.ddlFile` = `61-portal-identity.sql`, `62-portal-requests.sql`, `63-portal-inbox.sql`,
   `64-portal-citizen-service.sql`, `65-portal-projections.sql`; `module.name` = `Identity`, `Requests`, `Inbox`, `CitizenService`,
   `Projections` (o gerador deriva `@detran/portal-<kebab>` e `<Pascal>Module` — confira no gerador e registre os nomes resultantes);
   `dependencies`: `@detran/shared` (implícito? confira no gerador; se não, declare) e, onde M-decisão manda, `@detran/inf-deadlines`
   (`citizen-service`, M13/M14), `@detran/ops-parameter` (`projections`, M17), `zod`; `testAliases` coerentes (padrão do modelo);
   **sem** `handwrittenExports`/`handwrittenControllers`/`handwrittenProviders` (os Engineers acrescentam essas entradas ao bloco
   `module` quando criam `src/handwritten/`, e regeneram — assim `pnpm typecheck` fica verde já na sua entrega);
   `description` de módulo e de **cada entidade** citando workflow e seção (ADR-0019 §n, [WF-PORTAL-00n] §Estados…);
   `api.basePath = "/v1/portal/<pacote>/"`, `api.resources` com **`"operations": []`** para toda entidade (M1 — nenhuma rota CRUD gerada);
   `auth.source = "PORTAL_RULES"`; `audit.enabled = true`.
   Entidades (colunas, checks, índices, FKs exatamente como as M-decisões; toda entidade com `tenant_id`; `version integer default 1`
   onde há `If-Match`; `created_at`/`updated_at` como no modelo):
   - `BP-PORTAL-IDENTITY-001`: `Subject` (`subject`), `Representation` (`representation`), `ActLevelPolicy` (`act_level_policy`),
     `Entitlement` (`entitlement`) — M5, M6.
   - `BP-PORTAL-REQUESTS-001`: `Request` (`request`), `RequestDraft` (`request_draft`: `request_id`, `version`, `payload_json`,
     `saved_at`; único `(tenant_id, request_id, version)`), `RequestAttachment` (`request_attachment`: `request_id`, `filename`,
     `mime_type`, `size_bytes`, `sha256`, `upload_state` ∈ `intended|completed|rejected`, `storage_ref`), `Protocol` (`protocol`: M8;
     `number` único por tenant; `request_id` único), `ConsequenceAck` (`consequence_ack`: `request_id`, `text_version`, `accepted_at`,
     `kind` ∈ `desistencia|renuncia_40|indicacao|sne`), `Evaluation` (`evaluation`: `subject_kind` ∈ `request|manifestation`,
     `subject_id`, `scores_json` (5 notas), `comment`, `submitted_at`; único `(tenant_id, subject_kind, subject_id)`),
     `IdempotencyRecord` (`idempotency_record`, M9) — M7, M8, M9. A sequência `portal.protocol_seq` **não** é entidade: vai no DDL
     manuscrito 19 (o gerador não emite sequences) — registre isso na descrição de `Protocol`.
   - `BP-PORTAL-INBOX-001`: `InboxItem` (`inbox_item`), `AcknowledgementEvidence` (`acknowledgement_evidence`), `SneEnrollment`
     (`sne_enrollment`), `PushSubscription` (`push_subscription`) — M15.
   - `BP-PORTAL-CITIZEN-SERVICE-001`: `Manifestation` (`manifestation`), `ManifestationExtension` (`manifestation_extension`),
     `ServiceCatalog` (`service_catalog`) — M12, M13. (`brand_profile` e `public_hostname` **não** são entidades de blueprint: M11.)
   - `BP-PORTAL-PROJECTIONS-001`: `InfractionView` (`infraction_view`), `ProcessTimeline` (`process_timeline`), `PointsView`
     (`points_view`), `CrashView` (`crash_view`), `ExamView` (`exam_view`), `ProjectionAppliedEvent` (`projection_applied_event`), `NationalReadCache` (`national_read_cache`, M17) — M16, M17.
2. **DDL manuscrito `19-portal-platform.sql`** (M11): `create schema if not exists portal;` (idempotente — o 60 também cria),
   `portal.public_hostname` (`id uuid pk`, `hostname text unique`, `tenant_id uuid not null references auth.tenants(id)`,
   `enabled boolean not null default true`, `created_at`), `portal.brand_profile` (`tenant_id uuid pk references auth.tenants(id)`,
   `display_name`, `short_name`, `legal_name`, `primary_color`, `support_url`, `privacy_url`, `accessibility_url`, `service_contact`,
   `locale`, `time_zone`, `updated_at`), **sem** `auth.create_rls_policy` e com comentário `-- RLS exempt by design (portal-route-contract.md §11; plan R-0009 M11)`;
   `create sequence if not exists portal.protocol_seq;` grants a `role_app_backend` (como o gerador faz). **Atenção**: `tools/check-rls-ddl.ts`
   vai acusar as duas tabelas com `tenant_id` sem RLS até TASK-0004 acrescentar a allowlist — isso é esperado; registre no relatório o
   resultado exato de `pnpm verify:rls-ddl` (deve listar **exatamente** `portal.brand_profile` e `portal.public_hostname`, nada mais).
   Se preferir evitar o vermelho temporário: **não** — a decisão M11 é allowlist explícita, não renomear a coluna.
3. **DDL 14** (M14): estender o check de `owner` com `'portal'` e acrescentar ao INSERT (mesma sintaxe, mesmo `ON CONFLICT`) as linhas
   `T-OUV-RESPOSTA`, `T-OUV-INFO`, `T-LGPD-ACESSO`, `T-AVAL-CONVITE` com os valores de M14 e `legal_basis` de `WF-PORTAL-004` §Prazos /
   `WF-PORTAL-001` §Prazos. `expiry_target` nulo (não é estado de infração).
4. **DDL 11** (M11): incluir `'portal'` na lista de schemas de `auth.install_tenant_triggers()`.
5. **Regenerar**: `pnpm blueprints:generate && pnpm contracts:openapi && pnpm contracts:clients` (se `contracts:clients` exigir
   pacote instalado e falhar por isso, registre; não instale nada). Formate os blueprints com Prettier.
6. **Banco da rodada**: crie `work/rounds/R-0009/env-detran-r9.sh` (cópia do modelo R-0008 com `detran_r9`) e rode
   `DB_NAME=detran_r9 DB_PASSWORD=postgres bash backend/database/apply.sh --full` e depois `DB_NAME=detran_r9 DB_PASSWORD=postgres bash backend/database/seed.sh`
   (os seeds existentes, sem o do Portal — que é TASK-0003 — precisam continuar carregando). Registre a saída.
7. **Relatório**: nomes exatos dos pacotes/módulos gerados, lista de arquivos gerados, divergências entre M-decisão e o que o gerador
   permite (ex.: tipos de coluna, `default` de jsonb), e o que ficou para TASK-0004 (`handwritten/index.ts`, aliases, scripts).

## Definições que valem como contrato (copiadas das fontes; não reinterprete)

- Estados `WF-PORTAL-001` (13, check de `request.state`): `IDENTIFICADO`, `SERVICO_SELECIONADO`, `ELEGIBILIDADE_VERIFICADA`, `INELEGIVEL`,
  `PEDIDO_EM_COMPOSICAO`, `AGUARDANDO_NIVEL_ASSINATURA`, `AGUARDANDO_PAGAMENTO`, `PROTOCOLADO`, `EM_ANDAMENTO_NO_ORGAO`,
  `RESULTADO_DISPONIVEL`, `AVALIACAO_OFERECIDA`, `CONCLUIDO`, `DESISTIDO`.
- Estados `WF-PORTAL-004` (9, check de `manifestation.state`): `MANIFESTACAO_REGISTRADA`, `COMPROVANTE_EMITIDO`, `EM_ANALISE`,
  `INFORMACAO_SOLICITADA_AO_AGENTE`, `DECISAO_FINAL_ELABORADA`, `CIENCIA_AO_USUARIO`, `ENCERRADA`, `AVALIACAO_OFERECIDA`, `AVALIADA`.
- `sne_enrollment.state` ∈ `NAO_ADERIDO_SNE|ADERIDO_SNE` (`WF-PORTAL-003`); `representation.state` ∈
  `PROCURACAO_APRESENTADA|PROCURACAO_VALIDADA|PROCURACAO_RECUSADA` (`WF-PORTAL-002`).
- Níveis: `act_level_policy.minimum_assurance` ∈ `none|simples|avancada|qualificada`; `subject.assurance_level_observed` ∈
  `simples|avancada|qualificada`; `subject.govbr_level_observed` ∈ `bronze|prata|ouro|qualificada` ou nulo.
- `service_catalog.availability` ∈ `available|partially_available|unavailable`; check `availability <> 'unavailable' or unavailable_reason is not null`;
  `manifestation.kind` ∈ `reclamacao|denuncia|sugestao|elogio|solicitacao` (H.52); `inbox_item.kind` ∈ `acao_necessaria|informativo`,
  `source` ∈ `sne|portal`; `entitlement.target_kind` ∈ `ait|case|vehicle|license|crash|exam`, `relation` ∈ `owner|driver|representative|interested_party`,
  `origin` ∈ `renavam|renach|infraction|representation|manual`; `request.target_kind` ∈ `ait|case|vehicle|exam|none`,
  `delegation_status` ∈ `pending|delegated|failed|not_applicable`; `infraction_view.situation` ∈
  `aguardando_defesa|em_defesa|penalidade_aplicada|em_recurso|encerrada|cancelada|arquivada`, `points_status` ∈ `em_disputa|definitivo|none`;
  `manifestation_extension.timer` ∈ `T-OUV-RESPOSTA|T-OUV-INFO`; `national_read_cache.kind` ∈ `cnh|vehicles|clearance`.
- Timers M14 (`infraction_timer_ref`): `('T-OUV-RESPOSTA','portal',30,'dias_corridos','recebimento da manifestação','MANIFESTACAO_REGISTRADA','marco',NULL,NULL,'vigente','Lei 13.460/2017 art. 16 caput; WF-PORTAL-004')`,
  `('T-OUV-INFO','portal',20,'dias_corridos','solicitação de informação ao agente','INFORMACAO_SOLICITADA_AO_AGENTE','marco',NULL,NULL,'vigente','Lei 13.460/2017 art. 16 §ú; WF-PORTAL-004')`,
  `('T-LGPD-ACESSO','portal',NULL,'dias_corridos','requerimento de acesso a dados pessoais (valor = privacy.public_regime_days, source_pending OD-P08)','lgpd_declaracao','marco',NULL,NULL,'proposta','Lei 13.709/2018 art. 19; WF-PORTAL-004')`,
  `('T-AVAL-CONVITE','portal',NULL,'dias_corridos','mesmo evento do resultado (imediato)','RESULTADO_DISPONIVEL','marco',NULL,NULL,'vigente','Lei 14.129/2021 art. 21 V; Lei 13.460/2017 art. 23; WF-PORTAL-001')`.
- Tenant canônico das fixtures `00000000-0000-7000-8000-00000000a001`; tenant local `00000000-0000-7000-8000-000000000001`.
- `role_app_backend` é o papel de aplicação; RLS por `auth.create_rls_policy(schema, table)`; triggers por `auth.install_tenant_triggers()`.

## Critérios de aceitação (todos precisam passar)

- `pnpm blueprints:check` → OK (gerados idênticos aos blueprints).
- `pnpm contracts:check` → OK (se falhar só em `generate-clients.mjs --check` por pacote não instalado, registre o erro literal — o maestro decide).
- `pnpm verify:lifecycle-vocabulary` → OK.
- `pnpm verify:rls-ddl` → falha listando **exatamente** `portal.brand_profile` e `portal.public_hostname` (esperado até TASK-0004) — registre a saída literal.
- `DB_NAME=detran_r9 DB_PASSWORD=postgres bash backend/database/apply.sh --full` → termina sem erro; `bash backend/database/seed.sh` → `seed.sh: done (db=detran_r9)`.
- `pnpm typecheck` → verde para todos os pacotes, inclusive os cinco novos (sem `handwrittenExports`, o gerado é autossuficiente). Se `typecheck` dos pacotes novos falhar por dependência não instalada (`Cannot find module '@detran/...'`), registre a saída literal — o maestro roda `pnpm install`.
- `pnpm format:check` → verde.

## Regras que não admitem exceção

1. Nenhum valor inventado: coluna, check, timer ou enum sem fonte nas M-decisões/definições acima vira pergunta no relatório, não coluna.
2. Código gerado não se edita (ADR-0007): muda o blueprint, regenera, entrega junto.
3. Tokens de estado, timer, papel e erro vêm dos catálogos citados.
4. Nada fala com SENATRAN fora de `packages/senatran-adapter` (ADR-0003).
5. Não crie seeds nem fixtures (TASK-0003).
6. Prettier: `node_modules/.bin/prettier --write <arquivos que tocou>` antes de entregar (blueprints, DDL manuscrito não é formatado pelo Prettier — confira `.prettierignore`).
7. Não rode `pnpm check` em segundo plano nem deixe processos `node`/`vitest` vivos ao entregar.

## Entrega (relatório em Markdown, este formato, nada além dele)

```markdown
Papel: <Art. 6>
Tarefa: TASK-0002
Arquivos criados/alterados: <lista com caminho>
Comandos executados e saída resumida: <um por linha, com o resultado>
Critérios de aceitação: <cada um com PASS/FAIL>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids, ou "nenhuma">
Divergências [DIVERGE-Mn]: <lista ou "nenhuma">
Bloqueios: <ou "nenhum">
````

````

### work/rounds/R-0009/prompts/TASK-0003.md

```markdown
# Prompt de worker — `TASK-0003` (`inspector-tests`)

> Você é um worker da orquestra `portal-backend`, rodada `R-0009`, na worktree
> `/Volumes/Thiamat II/stech/detran-worktrees/portal-backend`. Você executa **uma** tarefa, dentro de
> uma fronteira de escrita, e entrega um relatório. Você **nunca** executa `git` (nem `add`, nem
> `commit`, nem `stash`), nunca instala pacotes (não rode `pnpm install`), nunca edita arquivos
> gerados à mão, nunca altera testes para passarem. Se algo impedir a tarefa, pare e escreva o bloqueio no relatório.

## Papel

Papel constitucional (Art. 6): **Inspector**. Declare-o na primeira linha da sua resposta.
Manual do perfil: `docs/meta/agents/inspector-tests.md` — leia-o primeiro; ele define o que você
pode e não pode tocar e o formato da entrega.

## Contexto da frente (o que você precisa saber, já resumido)

WP-P0…P3 do Portal (`docs/framework/arch/portal-build-pack.md`), rodada R-0009. As decisões **M1–M23** de
`work/rounds/R-0009/plan.md` §Decisões e os contratos `work/rounds/R-0009/contracts/CTG-000n.md` são o contrato: você
transcreve, não reinterpreta. O domínio `portal` tem cinco pacotes gerados por TASK-0002 (`@detran/portal-identity`,
`@detran/portal-requests`, `@detran/portal-inbox`, `@detran/portal-citizen-service`, `@detran/portal-projections`;
DDL 61…65, DDL manuscrito 19/14/11) e `portal/complaints` (PEC, intocável). Banco da rodada: `source work/rounds/R-0009/env-detran-r9.sh`
(`detran_r9`, já com DDL aplicado). Erros: `PortalError extends DetranError` (prefixo `PORTAL.`, catálogo
`docs/framework/arch/portal-error-catalog.md`). Perfil de teste: `DETRAN_RUNTIME_PROFILE=test`, `DETRAN_LOCAL_ROLES`,
`DETRAN_LOCAL_ASSURANCE_LEVEL`, `DETRAN_LOCAL_CPF` (M3), tenant local `00000000-0000-7000-8000-000000000001`.

Você codifica os critérios **C-0001-nn** do contrato `CTG-0001.md` (TASK-0001) em testes que **ficam vermelhos** até
TASK-0004 implementar, e escreve as fixtures canônicas do Portal (`70-fixtures-portal.sql`). Os pacotes gerados ainda não
têm `src/handwritten/` — os seus specs importam os símbolos com os caminhos fixados no contrato §12 (Layout) e falham por
módulo ausente até o Engineer entregar; isso é esperado. O reviewer da outra família (`codex gpt-5.6-terra`) julga a sua
entrega pela rubrica de `docs/meta/agents/orchestra/reviewer-prompt.template.md` (item 13: matrizes de autorização com
positivos e negativos exaustivos).

## Leitura obrigatória (lista fechada — não leia além dela)

- `AGENTS.md`; `CODESTYLE.md` §Tests; `docs/meta/agents/inspector-tests.md`
- `work/rounds/R-0009/plan.md` §Decisões (M3–M7, M11–M16, M22), §Critérios de aceitação
- `work/rounds/R-0009/contracts/CTG-0001.md` (inteiro — é a sua fonte principal)
- `docs/framework/arch/rait-test-strategy.md` §1, §2, §6; `docs/framework/arch/rait-fixtures.md` §1 (convenção de ids)
- `docs/framework/arch/portal-error-catalog.md` §1, §2, §7
- `backend/database/seed/00-fixtures-core.sql` (cabeçalho, tenant, usuários `b0000001…b0000003`, `b0000016`), `30-fixtures-infraction.sql`
  (ids dos AITs/infrações que o contrato §10 cita), `60-fixtures-rait-integration.sql` (padrão de upsert por id), `05-parameters.sql` (linhas `portal.*`)
- `backend/database/seed.sh`; `backend/database/ddl/19-portal-platform.sql`, `61-portal-identity.sql`, `62-portal-requests.sql`,
  `63-portal-inbox.sql`, `64-portal-citizen-service.sql`, `65-portal-projections.sql` (colunas e checks reais — gerados por TASK-0002)
- `backend/app/tests/e2e/inf-ait-routes.e2e.spec.ts` (inteiro: padrão de e2e — `NestFactory.create(AppModule.forRoot())`, `pg`,
  `set_config('app.role','owner')`, tenant/usuário locais, `headers()`, limpeza de env em `afterAll`)
- `backend/app/tests/e2e/policy-routes.e2e.spec.ts` linhas 1–60 (limpeza de env entre arquivos: `fileParallelism: false`)
- `backend/domains/inf/ait/tests/integration/inf-rls.integration.spec.ts` (padrão de teste de RLS cruzada entre tenants)
- `backend/domains/inf/infraction/tests/unit/infraction-transitions.matrix.spec.ts` (padrão de teste de matriz de transições)
- `backend/domains/shared/src/policy.spec.ts` linhas 1–80 (padrão de matriz de grants com negativos exaustivos por `DETRAN_ROLES`)
- `backend/domains/shared/src/roles.ts` (`DETRAN_ROLES`); `backend/app/vitest.config.ts` (aliases: os cinco `@detran/portal-*` são
  acrescentados por TASK-0004 — o seu e2e importa só `AppModule`)
- `backend/domains/inf/notification/vitest.config.ts` (o gerado inclui `src/**/*.spec.ts`, `tests/unit`, `tests/integration/**/*.integration.spec.ts`)
- `tools/parameters/verify.mjs` linhas 1–40 (regra: nenhum literal `portal.*` de dois pontos em specs)

## Pode tocar

- `backend/domains/portal/identity/src/handwritten/citizen.guard.spec.ts`, `act-level.spec.ts`, `identity-claims.spec.ts` (novos)
- `backend/domains/portal/requests/src/handwritten/guards/request.transitions.spec.ts` (novo)
- `backend/domains/portal/citizen-service/src/handwritten/guards/manifestation.transitions.spec.ts` (novo)
- `backend/domains/portal/identity/tests/integration/portal-rls.integration.spec.ts`, `portal-seed.integration.spec.ts` (novos)
- `backend/app/tests/e2e/portal-identity.e2e.spec.ts` (novo)
- `backend/database/seed/70-fixtures-portal.sql` (novo)
- `backend/domains/portal/*/vitest.config.ts` **só** se precisar incluir um diretório novo (o gerado já inclui `src/**/*.spec.ts` e `tests/**`; confira antes)

## Não pode tocar

Código de produção (`src/**` fora de `*.spec.ts`), blueprints, DDL, `policy.ts`, `roles.ts`, `backend/app/src/**`, `package.json`
de qualquer pacote, `tools/**`, `docs/**`, seeds existentes (`00…60`).

Além disso: `docs/framework/product/**` (corpus de produto), `record/`, `.devai/`, `docs/meta/adr/`, arquivos com cabeçalho
"Generated from BP-…", `plan.md`, `tasks/`, `prompts/`, `contracts/`, `pnpm-lock.yaml`.

## Tarefa (o quê, não o como)

1. **Fixtures `70-fixtures-portal.sql`** (M22 + contrato §10): idempotente (`on conflict (id) do update`), `set_config('app.role','owner')`
   e tenant canônico no cabeçalho, ids `00000000-0000-7000-8000-0000700000nn` (sujeitos), `…70001000nn` (representações/entitlements),
   `…70002000nn` (pedidos, um por estado — 13), `…70003000nn` (protocolos), `…70004000nn` (manifestações — 9), `…70005000nn` (inbox, SNE),
   `…70006000nn` (projeções), `act_level_policy` (M5, todas as linhas com `legal_basis` e `decision_ref`), `service_catalog` (M12, 15 linhas 9/2/4),
   `brand_profile` + `public_hostname` (tenant canônico). Toda coluna obrigatória do DDL real preenchida; nada fora do que o contrato fixa.
   Prove: `DB_NAME=detran_r9 DB_PASSWORD=postgres bash backend/database/seed.sh` **duas vezes** seguidas sem erro.
2. **Unit** (vermelhos até TASK-0004): `citizen.guard.spec.ts` (todas as combinações do contrato §3: sem `CIDADAO`, sem claim, claim fora do enum,
   CPF inválido, `technical-admin` sem claims, cidadão válido — código/status/`context` exatos); `act-level.spec.ts` (§4: cada linha da matriz M5
   × níveis `simples|avancada|qualificada`, vigência por `Clock` fixo, ato sem linha, política `qualificada` → 500); `identity-claims.spec.ts`
   (§2: parsing das claims); `request.transitions.spec.ts` (§6: toda transição permitida e **toda** proibida por comando → `PORTAL.REQUEST_STATE_INVALID`
   com `allowed[]`); `manifestation.transitions.spec.ts` (§6, 9 estados).
3. **Integration** (`detran_r9`): `portal-rls.integration.spec.ts` (leitura cruzada entre o tenant canônico e um segundo tenant criado no teste →
   vazio em `portal.subject`, `portal.request`, `portal.manifestation`, `portal.inbox_item`, `portal.infraction_view`; `brand_profile`/`public_hostname`
   legíveis sem `app.tenant_id`; trigger `enforce_tenant_id` ativo em `portal.subject` — insert sem tenant sob `app.role<>owner` → erro `42501`);
   `portal-seed.integration.spec.ts` (contagens exatas após `seed.sh`: 5 sujeitos, 13 pedidos, 9 manifestações, 15 serviços com 9/2/4, linhas de `act_level_policy`).
4. **E2E** `portal-identity.e2e.spec.ts` (§11): sobe o `AppModule`; casos do contrato (403 `ASSURANCE_NOT_VERIFIED` sem claim; 200 `GET /v1/portal/identity/me`
   com `CIDADAO` + `avancada` + CPF fixture — corpo campo a campo do §8; 403 `IDENTITY_NOT_CITIZEN` com `field-agent`; `technical-admin` sem claims → 403;
   `GET /v1/portal/brand` e `GET /v1/portal/services` sem `Authorization` → 200 e contagem 9/2/4; `GET /v1/portal/services/inexistente` → 404 `PORTAL.NOT_FOUND`
   `{ kind: 'service' }`; Host não mapeado com `DETRAN_PORTAL_HOST_RESOLUTION=on` → 421). Restaure toda variável de ambiente em `afterAll`.
5. Nomes: "dado <fixture> quando <ação> então <efeito|código>". Relógio fixo em tudo que envolve vigência/prazo.
6. Relatório: matriz `C-0001-nn → arquivo → it(...)`; critérios sem teste possível (e por quê) explícitos.

## Definições que valem como contrato (copiadas das fontes; não reinterprete)

- Papéis canônicos: `DETRAN_ROLES` de `roles.ts`; o Portal usa só `CIDADAO`; `GLOBAL_ADMIN_ROLES` = `ADMIN`, `GESTOR_DETRAN`, `SUPORTE`,
  `technical-admin` (política `*`), mas a guarda de identidade **não** os isenta (M4).
- Erros e `context` exatos: contrato §3, §4, §8, §9 (catálogo §1, §2, §7).
- Estados: contrato §6 (13 de `WF-PORTAL-001`, 9 de `WF-PORTAL-004`, 2 de `WF-PORTAL-003`, 3 persistidos de `WF-PORTAL-002`).
- Fixtures: contrato §10 (ids, CPFs `11111111111`…`55555555555`, níveis por sujeito, ids de AIT/infração de `30-fixtures-infraction.sql`).
- Tenant local do e2e `00000000-0000-7000-8000-000000000001` (`slug local-e2e`, criado pelo próprio e2e como em `inf-ait-routes`); tenant canônico
  `00000000-0000-7000-8000-00000000a001`.

## Critérios de aceitação (todos precisam passar)

- `pnpm format:check` → verde.
- `DB_NAME=detran_r9 DB_PASSWORD=postgres bash backend/database/seed.sh` (2×) → `seed.sh: done (db=detran_r9)` nas duas execuções.
- `pnpm typecheck` → os specs novos podem falhar **só** por importar módulos de `src/handwritten/` ainda inexistentes (registre a saída literal por arquivo);
  nenhum outro erro de tipo.
- `source work/rounds/R-0009/env-detran-r9.sh && pnpm --filter @detran/portal-identity test:integration` → `portal-rls` e `portal-seed` **verdes**
  (não dependem de código manuscrito).
- `node tools/parameters/verify.mjs --check-usage` → OK (nenhum literal de parâmetro nos specs).

Formato de cada critério: comando exato → resultado esperado.

## Regras que não admitem exceção

1. Nenhum valor inventado: prazo, papel, estado, código de erro, rótulo ou parâmetro sem fonte nas
   definições acima vira `source_pending` no catálogo (`docs/framework/arch/parameter-catalogue.md`)
   ou uma questão `OD-*` no relatório; nunca constante silenciosa.
2. Código gerado não se edita (ADR-0007); comportamento manuscrito vai em `src/handwritten/` ou
   nos arquivos listados em "Pode tocar".
3. Tokens de estado, timer, papel e erro vêm dos catálogos citados; a UI só traduz rótulos.
4. Nada fala com SENATRAN fora de `packages/senatran-adapter` (ADR-0003).
5. Fixtures canônicas (`backend/database/seed/`); não crie tenants nem personas próprias fora do prefixo M22.
6. Prettier: `node_modules/.bin/prettier --write <arquivos que tocou>` antes de entregar.
7. Specs nunca contêm chaves do catálogo de parâmetros como literal (`portal.*`, `privacy.*`, `collection.*` — `verify:parameter-catalogue`).
8. Nunca `it.skip`; `it.todo` só com `OD-*` ou R-0007 citados no nome. Nunca deixe `pnpm check`/`vitest` em segundo plano ao entregar.

## Entrega (relatório em Markdown, este formato, nada além dele)

```markdown
Papel: <Art. 6>
Tarefa: TASK-0003
Arquivos criados/alterados: <lista com caminho>
Comandos executados e saída resumida: <um por linha, com o resultado>
Critérios de aceitação: <cada um com PASS/FAIL>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids, ou "nenhuma">
Bloqueios: <ou "nenhum">
````

````

### work/rounds/R-0009/prompts/TASK-0004.md

```markdown
# Prompt de worker — `TASK-0004` (`engineer-backend`)

> Você é um worker da orquestra `portal-backend`, rodada `R-0009`, na worktree
> `/Volumes/Thiamat II/stech/detran-worktrees/portal-backend`. Você executa **uma** tarefa, dentro de
> uma fronteira de escrita, e entrega um relatório. Você **nunca** executa `git` (nem `add`, nem
> `commit`, nem `stash`), nunca instala pacotes (não rode `pnpm install`), nunca edita arquivos
> gerados à mão, nunca altera testes para passarem. Se algo impedir a tarefa, pare e escreva o bloqueio no relatório.

## Papel

Papel constitucional (Art. 6): **Engineer**. Declare-o na primeira linha da sua resposta.
Manual do perfil: `docs/meta/agents/engineer-backend.md` — leia-o primeiro; ele define o que você
pode e não pode tocar e o formato da entrega.

## Contexto da frente (o que você precisa saber, já resumido)

WP-P0…P3 do Portal (`docs/framework/arch/portal-build-pack.md`), rodada R-0009. As decisões **M1–M23** de
`work/rounds/R-0009/plan.md` §Decisões e os contratos `work/rounds/R-0009/contracts/CTG-000n.md` são o contrato: você
transcreve, não reinterpreta. O domínio `portal` tem cinco pacotes gerados por TASK-0002 (`@detran/portal-identity`,
`@detran/portal-requests`, `@detran/portal-inbox`, `@detran/portal-citizen-service`, `@detran/portal-projections`;
DDL 61…65, DDL manuscrito 19/14/11) e `portal/complaints` (PEC, intocável). Banco da rodada: `source work/rounds/R-0009/env-detran-r9.sh`
(`detran_r9`, já com DDL aplicado). Erros: `PortalError extends DetranError` (prefixo `PORTAL.`, catálogo
`docs/framework/arch/portal-error-catalog.md`). Perfil de teste: `DETRAN_RUNTIME_PROFILE=test`, `DETRAN_LOCAL_ROLES`,
`DETRAN_LOCAL_ASSURANCE_LEVEL`, `DETRAN_LOCAL_CPF` (M3), tenant local `00000000-0000-7000-8000-000000000001`.

Você implementa até os testes de TASK-0003 (`C-0001-nn`) passarem, **sem alterá-los**. Escopo fechado: claims no runtime,
guarda, nível por ato, quatro rotas (`GET me`, `GET brand`, `GET services`, `GET services/{serviceKey}`), resolução de tenant
pelo Host, wiring dos cinco pacotes no app, allowlist de RLS. As demais rotas são CTG-0002 (não as crie). A política ganha
**só** `portal:identity:read` (e perde `portal:appeal:*`); o bloco `PORTAL_RULES` completo é TASK-0007.

## Leitura obrigatória (lista fechada — não leia além dela)

- `AGENTS.md`; `CODESTYLE.md`; `docs/meta/agents/engineer-backend.md`
- `work/rounds/R-0009/plan.md` §Decisões (M1–M6, M11, M12, M19 só a frase sobre `portal:appeal:*`), §Critérios
- `work/rounds/R-0009/contracts/CTG-0001.md` (inteiro); `work/rounds/R-0009/reports/TASK-0003.md` (matriz critério → teste)
- `docs/meta/adr/ADR-0024-govbr-federation-via-cognito.md`
- Os specs de TASK-0003 (leia-os: `backend/domains/portal/identity/src/handwritten/*.spec.ts`, `backend/domains/portal/{requests,citizen-service}/src/handwritten/guards/*.spec.ts`,
  `backend/domains/portal/identity/tests/integration/*.spec.ts`, `backend/app/tests/e2e/portal-identity.e2e.spec.ts`)
- `docs/framework/arch/portal-route-contract.md` §1, §2, §3 (`GET me`); `docs/framework/arch/portal-error-catalog.md` §1, §2, §7
- `backend/domains/shared/src/{decorators.ts, policy.ts (linhas 1585–1610 e GLOBAL_ADMIN_ROLES), policy.guard.ts, tenant-context.ts, errors/detran-error.ts, errors/index.ts, index.ts}`
- `backend/app/src/detran-runtime.ts` (inteiro); `backend/app/src/app.module.ts` (inteiro); `backend/app/vitest.config.ts`; `backend/app/package.json`; `package.json` da raiz (scripts `build`, `backend:test:*`)
- `backend/domains/portal/identity/src/**` (gerado por TASK-0002: entidades, repositórios, serviços, módulo, `index.ts`); `docs/framework/blueprints/BP-PORTAL-IDENTITY-001.json` (bloco `module`)
- `backend/domains/inf/ait/src/handwritten/` (padrão de comando/controlador manuscrito com `@Resource/@Action/@Audit`, `DetranError`), `backend/domains/inf/ait/src/ait.module.ts`
- `backend/domains/inf/notification/src/handwritten/index.ts` (padrão de `handwrittenExports`)
- `backend/domains/ops/parameter/src/handwritten/parameter.service.ts` (assinatura de leitura de parâmetro, se precisar)
- `tools/check-rls-ddl.ts`; `tools/verify-controller-decorators.ts`; `tools/blueprints/generate.mjs` linhas 220–260 (`handwrittenControllers/Providers/Exports`)
- `backend/database/ddl/19-portal-platform.sql`, `61-portal-identity.sql`, `64-portal-citizen-service.sql` (colunas reais)

## Pode tocar

- `backend/domains/portal/identity/src/handwritten/**` (novo: `citizen.guard.ts`, `act-level.ts`, `identity-claims.ts`, `errors.ts`, `me.controller.ts`, `public.controller.ts`, `index.ts`, e o que o contrato §12 listar)
- `docs/framework/blueprints/BP-PORTAL-IDENTITY-001.json` e `BP-PORTAL-CITIZEN-SERVICE-001.json` — **só** o bloco `module` (`handwrittenExports`, `handwrittenControllers`, `handwrittenProviders`, `dependencies`), seguido de `pnpm blueprints:generate && pnpm contracts:openapi`
- `backend/app/src/detran-runtime.ts` (claims locais M3; `DetranTenantResolver` por Host M11), `backend/app/src/app.module.ts` (montar os cinco módulos), `backend/app/vitest.config.ts` (cinco aliases), `backend/app/package.json` (cinco deps `workspace:*`)
- `package.json` da raiz: scripts `build`, `backend:test:unit`, `backend:test:integration`, `backend:test:e2e` (acrescentar os cinco pacotes no padrão existente)
- `backend/domains/shared/src/policy.ts`: **só** acrescentar `['portal:identity:read', ['CIDADAO']]` e remover as duas linhas `portal:appeal:*`; `backend/domains/shared/src/policy.spec.ts` **só** se um teste existente citar `portal:appeal:*` (ajuste mínimo, diga no relatório)
- `tools/check-rls-ddl.ts`: allowlist `RLS_EXEMPT_BY_DESIGN` com exatamente `portal.public_hostname` e `portal.brand_profile` (M11), com comentário citando `portal-route-contract.md` §11

## Não pode tocar

Testes (`*.spec.ts`, `tests/**`), seeds, DDL, arquivos gerados (`Generated from BP-…`), `roles.ts`, outros blocos de `policy.ts`,
`packages/**`, `backend/domains/portal/{requests,inbox,citizen-service,projections}/src/handwritten/**` (CTG-0002 — exceto se o contrato §12
mandar criar `guards/*.transitions.ts` para os specs de TASK-0003: então **só** esses arquivos de tabela de transição, sem comandos).

Além disso: `docs/framework/product/**` (corpus de produto), `record/`, `.devai/`, `docs/meta/adr/`, arquivos com cabeçalho
"Generated from BP-…", `plan.md`, `tasks/`, `prompts/`, `contracts/`, `pnpm-lock.yaml`.

## Tarefa (o quê, não o como)

1. Implementar o contrato §2–§4, §8, §9 e §12 (layout) até `C-0001-nn` passarem. Guarda e `assertActLevel` exatamente como o contrato; `PortalError`
   com códigos do catálogo; `@Audit` em `GET me` (M20); `@Public()` nas três rotas públicas.
2. Wiring: cinco módulos no `AppModule`, aliases no vitest do app, deps no `package.json` do app, scripts da raiz. Não rode `pnpm install`:
   o maestro já instalou os pacotes depois de TASK-0002; se um import falhar por pacote não instalado, registre e pare.
3. Se um teste de TASK-0003 contradisser o contrato, **não** o altere: registre a contradição (arquivo, linha, o que o contrato diz) no relatório
   e implemente o contrato. O maestro triará.
4. Prove os gates abaixo; registre a saída literal dos que falharem.

## Definições que valem como contrato (copiadas das fontes; não reinterprete)

- Contrato `CTG-0001.md` §2–§4 (claims, guarda, nível), §8 (rotas), §9 (tenant por Host), §12 (layout). M3, M4, M11, M19 (só `portal:identity:read`).
- Decoradores: `@Controller('v1/portal/...')`, `@Resource('portal:<recurso>')`, `@Action('<verbo>')`, `@Audit({ action: 'PORTAL_<RECURSO>_<VERBO>', entity: 'portal.<tabela>' })`; `@Public()` sem `@Resource`.
- `DetranError`/`PortalError`: `new PortalError('PORTAL.<CODE>', { status, context })`; `context` só ids, tokens e números.

## Critérios de aceitação (todos precisam passar)

- `pnpm --filter @detran/portal-identity test:unit` → todos verdes.
- `pnpm --filter @detran/portal-requests test:unit` e `pnpm --filter @detran/portal-citizen-service test:unit` → verdes (specs de transição).
- `source work/rounds/R-0009/env-detran-r9.sh && pnpm --filter @detran/portal-identity test:integration` → verdes.
- `source work/rounds/R-0009/env-detran-r9.sh && pnpm --filter @detran/app test:e2e` → todos os arquivos verdes (inclusive `portal-identity.e2e.spec.ts` e os existentes).
- `pnpm --filter @detran/shared test` → verde.
- `pnpm verify:decorators` → OK; `pnpm verify:rls-ddl` → OK (allowlist só com as duas tabelas); `pnpm blueprints:check` → OK; `pnpm contracts:check` → OK.
- `pnpm check` → verde (rode em primeiro plano, uma vez, ao final).

Formato de cada critério: comando exato → resultado esperado.

## Regras que não admitem exceção

1. Nenhum valor inventado: prazo, papel, estado, código de erro, rótulo ou parâmetro sem fonte nas
   definições acima vira `source_pending` no catálogo (`docs/framework/arch/parameter-catalogue.md`)
   ou uma questão `OD-*` no relatório; nunca constante silenciosa.
2. Código gerado não se edita (ADR-0007); comportamento manuscrito vai em `src/handwritten/` ou
   nos arquivos listados em "Pode tocar".
3. Tokens de estado, timer, papel e erro vêm dos catálogos citados; a UI só traduz rótulos.
4. Nada fala com SENATRAN fora de `packages/senatran-adapter` (ADR-0003).
5. Fixtures canônicas (`backend/database/seed/`); não crie tenants nem personas próprias fora do prefixo M22.
6. Prettier: `node_modules/.bin/prettier --write <arquivos que tocou>` antes de entregar.
7. Specs nunca contêm chaves do catálogo de parâmetros como literal (`portal.*`, `privacy.*`, `collection.*` — `verify:parameter-catalogue`).
8. Nunca `it.skip`; `it.todo` só com `OD-*` ou R-0007 citados no nome. Nunca deixe `pnpm check`/`vitest` em segundo plano ao entregar.

## Entrega (relatório em Markdown, este formato, nada além dele)

```markdown
Papel: <Art. 6>
Tarefa: TASK-0004
Arquivos criados/alterados: <lista com caminho>
Comandos executados e saída resumida: <um por linha, com o resultado>
Critérios de aceitação: <cada um com PASS/FAIL>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids, ou "nenhuma">
Bloqueios: <ou "nenhum">
````

````

### work/rounds/R-0009/prompts/TASK-0005.md

```markdown
# Prompt de worker — `TASK-0005` (`architect-blueprint`)

> Você é um worker da orquestra `portal-backend`, rodada `R-0009`, na worktree
> `/Volumes/Thiamat II/stech/detran-worktrees/portal-backend`. Você executa **uma** tarefa, dentro de
> uma fronteira de escrita, e entrega um relatório. Você **nunca** executa `git` (nem `add`, nem
> `commit`, nem `stash`), nunca instala pacotes (não rode `pnpm install`), nunca edita arquivos
> gerados à mão, nunca altera testes para passarem. Se algo impedir a tarefa, pare e escreva o bloqueio no relatório.

## Papel

Papel constitucional (Art. 6): **Architect**. Declare-o na primeira linha da sua resposta.
Manual do perfil: `docs/meta/agents/architect-blueprint.md` — leia-o primeiro; ele define o que você
pode e não pode tocar e o formato da entrega.

## Contexto da frente (o que você precisa saber, já resumido)

WP-P0…P3 do Portal (`docs/framework/arch/portal-build-pack.md`), rodada R-0009. As decisões **M1–M23** de
`work/rounds/R-0009/plan.md` §Decisões e os contratos `work/rounds/R-0009/contracts/CTG-000n.md` são o contrato: você
transcreve, não reinterpreta. O domínio `portal` tem cinco pacotes gerados por TASK-0002 (`@detran/portal-identity`,
`@detran/portal-requests`, `@detran/portal-inbox`, `@detran/portal-citizen-service`, `@detran/portal-projections`;
DDL 61…65, DDL manuscrito 19/14/11) e `portal/complaints` (PEC, intocável). Banco da rodada: `source work/rounds/R-0009/env-detran-r9.sh`
(`detran_r9`, já com DDL aplicado). Erros: `PortalError extends DetranError` (prefixo `PORTAL.`, catálogo
`docs/framework/arch/portal-error-catalog.md`). Perfil de teste: `DETRAN_RUNTIME_PROFILE=test`, `DETRAN_LOCAL_ROLES`,
`DETRAN_LOCAL_ASSURANCE_LEVEL`, `DETRAN_LOCAL_CPF` (M3), tenant local `00000000-0000-7000-8000-000000000001`.

Você escreve o contrato **CTG-0002.md**: um bloco monoespaçado por rota de `portal-route-contract.md` §3–§9 (menos as quatro
já entregues em CTG-0001), a delegação (M8), a idempotência (M9), o vínculo (M10), a caixa (M15), os projetores e o replay (M16),
o cache nacional (M17), o SSE (M18), a matriz `portal:*` ⇔ rotas (M19), os eventos (M21) e os critérios `C-0002-nn` para o Inspector
(TASK-0006) e o layout para os Engineers (TASK-0007: identidade §3 + pedidos §5 + `policy.ts`; TASK-0008: §4, §6, §7, §8, §9, projetores).
Os blueprints e o DDL já existem (TASK-0002) e o CTG-0001 já está implementado (TASK-0004): você contrata **sobre o que existe**
— colunas reais, nomes reais de serviços/repositórios gerados. Nada de código nem teste.

## Leitura obrigatória (lista fechada — não leia além dela)

- `AGENTS.md`; `CODESTYLE.md`; `docs/meta/agents/architect-blueprint.md`
- `work/rounds/R-0009/plan.md` (Decisões M7–M10, M12–M21, M23; Tarefas; Critérios; Concorrência)
- `work/rounds/R-0009/contracts/CTG-0001.md` (inteiro — formato e definições já fechadas: claims, guarda, nível, entidades, fixtures)
- `work/rounds/R-0008/contracts/CTG-0004.md` §SSE e §policy-routes (formato de contrato de fluxo SSE e de matriz política ⇔ rotas)
- `docs/framework/arch/portal-route-contract.md` (inteiro); `docs/framework/arch/portal-error-catalog.md` (inteiro)
- `docs/framework/arch/rait-events-sse-contract.md` §1 (envelope), §3 (fluxo SSE), §5 (contrato de teste)
- `docs/meta/adr/ADR-0019-*.md` §Decision 2–5; `ADR-0020-*.md` (inteira); `ADR-0016-*.md` §Decision (eventos `NOTIFICACAO_*`, `NOTIFICACAO_CIENCIA`); `ADR-0017-*.md` §Decision (`PAGAMENTO_CONFIRMADO`); `ADR-0018-*.md` §Decision (recibo assinado)
- `docs/framework/product/transversal/portal/workflows/WF-PORTAL-001.md` §Transições, §Catálogo; `WF-PORTAL-003.md` (inteiro); `WF-PORTAL-004.md` §Transições, §Prazos
- `docs/framework/product/transversal/portal/use-cases/UC-PORTAL-00{1,2,4,6,7,9}.md`, `UC-PORTAL-01{0,1,2,5,6,7}.md` (§Critérios de aceitação de cada um)
- `docs/framework/product/transversal/portal/rules/RN-PORTAL-10{5,6,9}.md`, `RN-PORTAL-11{2,6,7,8}.md`, `RN-PORTAL-12{6,8}.md` (§Regra)
- `docs/framework/arch/parameter-catalogue.md` §PORTAL; `docs/meta/knowledge-base/steering.md` §H itens 50–54
- `docs/framework/blueprints/BP-PORTAL-{IDENTITY,REQUESTS,INBOX,CITIZEN-SERVICE,PROJECTIONS}-001.json` (entidades e colunas reais)
- `backend/database/ddl/1{4,9}-*.sql` (timers `portal`; plataforma), `6{1,2,3,4,5}-portal-*.sql`, `04-integration-storage.sql` (`integration.outbox`), `59-inf-notification.sql` (tabelas de aviso/ciência que os eventos citam), `38-inf-infraction.sql` (só `infraction_state_ref` — tokens que o projetor traduz; ver também `14-inf-lifecycle-vocabulary.sql` bloco `infraction_state_ref`)
- `backend/database/seed/70-fixtures-portal.sql`, `30-fixtures-infraction.sql` (cabeçalho e ids), `50-fixtures-collection.sql` (cabeçalho e ids)
- `backend/domains/portal/identity/src/handwritten/*.ts` (TASK-0004: guarda, erros, claims — reutilize), `backend/domains/portal/*/src/{index.ts, *.module.ts, repositories/*.ts}` (assinaturas geradas)
- `backend/domains/shared/src/{policy.ts (blocos TEAT_RULES/DASHBOARD_RULES e montagem), decorators.ts, events/outbox.ts, events/sql-outbox.ts, errors/if-match.ts, documents/index.ts}`
- `backend/app/src/{teat-stream.controller.ts, teat-stream.service.ts, teat-snapshots.providers.ts, app.module.ts}`; `backend/app/tests/e2e/{policy-routes,teat-stream}.e2e.spec.ts` (cabeçalhos e helpers)
- `backend/domains/inf/infraction/src/handwritten/events.ts` (padrão zod de evento); `backend/domains/inf/notification/src/handwritten/acknowledgement-mark.ts` (marco de ciência)
- `backend/domains/ops/parameter/src/handwritten/parameter.service.ts` (API de leitura de parâmetro); `backend/domains/inf/deadlines/src/index.ts` (exports)
- `packages/senatran-adapter/src/ports.ts` (`CdtPort`, `RenachPort`, `WsdenatranReadPort`, `SnePort`), `packages/senatran-adapter/src/domain.ts` (`CitizenLicense`, `CitizenCollection`, `PaymentQuote`)
- `tools/verify-controller-decorators.ts`; `tools/contracts/generate-openapi.mjs` e `tools/contracts/check-commands.mjs` (o que TASK-0009 precisa herdar: `operationId` por comando)

## Pode tocar

- `work/rounds/R-0009/contracts/CTG-0002.md` (novo).

## Não pode tocar

Tudo o mais: código, testes, blueprints, DDL, seeds, `docs/**`.

Além disso: `docs/framework/product/**` (corpus de produto), `record/`, `.devai/`, `docs/meta/adr/`, arquivos com cabeçalho
"Generated from BP-…", `plan.md`, `tasks/`, `prompts/`, `contracts/`, `pnpm-lock.yaml`.

## Tarefa (o quê, não o como)

Escreva `CTG-0002.md`, nesta ordem:

1. **Cabeçalho**: rodada, grupo, fontes, consumidores (TASK-0006/0007/0008/0009), M-decisões aplicadas, divisão de escopo entre TASK-0007 e TASK-0008.
2. **Rotas** — um bloco por rota de §3 (exceto `GET me`), §4, §5, §6, §7, §8, §9 com **todos** os campos: rota, pacote/arquivo
   (`src/handwritten/...`), `@Resource`/`@Action`/`@Audit{action, entity}`, chave de política e papel (`CIDADAO`; público onde M19 diz),
   guardas (`PortalCitizenGuard`, `assertActLevel(actKey)`, vínculo M10), DTO zod (campos, obrigatoriedade, enums do §5.1), cabeçalhos
   (`If-Match`, `Idempotency-Key`, `ETag`), pré-estado, pré-condições, pós-estado e efeitos (linhas gravadas, `version`), erros (código,
   status, `context` exato), eventos (M21), resposta campo a campo com fonte, `operationId` previsto (`portal<Recurso><Verbo>`).
   Rotas cuja fonte de dados não existe nesta rodada (delegações RAIT/infração/pagamento, PEC, BOAT, privacy, documentos assinados)
   respondem exatamente como M8/M12/M17 (`SERVICE_UNAVAILABLE` com `unavailableReason` fixado; `NATIONAL_READ_UNAVAILABLE`); liste-as numa tabela própria.
3. **Delegação** (M8): algoritmo de `submit` passo a passo (transação única: protocolo → estado → alvo → estado/pendência), porta
   `DelegationTarget`, mapa `serviceKey → alvo`, `UnavailableDelegationTarget`, caminho `DELEGATION_FAILED` (502, protocolo mantido),
   forma do recibo canônico e do `receipt_hash`, geração do número de protocolo.
4. **Idempotência** (M9): tabela `idempotency_record`, fingerprint (sha256 do JSON canônico com chaves ordenadas), reuso igual/diferente, escopo por sujeito.
5. **Vínculo** (M10): função `assertEntitled(tx, subject, targetKind, targetId)`, representação vigente, 404 × 422.
6. **Caixa e SNE** (M15): `read` com evidência de ciência e `NOTIFICACAO_CIENCIA` idempotentes; adesão/cancelamento (`SNE_ALREADY_ENROLLED`/`SNE_NOT_ENROLLED`,
   `SNE_CONTACT_REQUIRED`, consentimento com os quatro efeitos); `fictitious_acknowledgement_on` = `available_on` + duração de `T-SNE-CIENCIA` (lida do catálogo, nunca `30` literal).
7. **Projeções e replay** (M16): por projeção — eventos fonte, forma do envelope consumido (`integration.outbox`: `topic`, `aggregate_type`, `payload`),
   função `applyEvent(event, tx)`, idempotência por `projection_applied_event`, mapa `INFRACTION_SITUATION_MAP` **completo** (todo token de
   `inf.infraction_state_ref` → `situation` cidadã; tokens sem tradução → `[OD-P20]` listados), `actions[]` por situação (defend/indicate_driver/pay/appeal_jari/appeal_cetran
   com `available` e `reason` pelo catálogo e pela fase), replay (`rebuild(tenantId, projection)`), e o teste de replay (aplicar → apagar → reaplicar → igual).
8. **Cache nacional** (M17): token `PORTAL_NATIONAL_READ_PORTS`, mapa rota → operação da porta (nomes exatos de `ports.ts`), TTL pelo parâmetro,
   resposta com `cachedAt`, falha com/sem cache, o que devolve `SERVICE_UNAVAILABLE` (documentos assinados).
9. **SSE** (M18): tipos, envelope, escopo por sujeito, replay 24 h, heartbeat, arquivo/controlador/serviço, poller.
10. **Política** (M19): bloco `PORTAL_RULES` literal (array pronto para colar), rotas públicas, remoção de `portal:appeal:*` (já feita em CTG-0001 — confirme),
    matriz rotas ⇔ regras nos dois sentidos com as exceções (`@Public()`, `portal:complaint:*` do PEC), e o `inScope` para `policy-routes.e2e.spec.ts`.
11. **Eventos** (M21): `type` → `aggregate.kind` → `data` (só ids, tokens, datas) por evento; schema zod.
12. **Fixtures adicionais** que os testes de rotas precisam além de `70-fixtures-portal.sql` (se houver: outbox de eventos de exemplo para replay —
    prefira fixtures **em código de teste** a seeds novos; se precisar de seed, diga qual arquivo e ids, prefixo `…70007000nn`).
13. **Critérios para o Inspector**: `C-0002-nn` numerados — "dado <fixture> quando <rota> então <efeito|código>", tier e arquivo alvo:
    `backend/domains/portal/requests/src/handwritten/**/*.spec.ts` (delegação, idempotência, transições, protocolo), `backend/domains/portal/requests/tests/integration/portal-requests.integration.spec.ts`,
    `backend/domains/portal/inbox/src/handwritten/*.spec.ts`, `backend/domains/portal/inbox/tests/integration/portal-inbox.integration.spec.ts`,
    `backend/domains/portal/citizen-service/src/handwritten/*.spec.ts`, `backend/domains/portal/projections/src/handwritten/*.projection.spec.ts`,
    `backend/domains/portal/projections/tests/integration/portal-projections-replay.integration.spec.ts`, `backend/app/src/portal-stream.service.spec.ts`,
    `backend/app/tests/e2e/portal-routes.e2e.spec.ts`, `backend/app/tests/e2e/portal-stream.e2e.spec.ts`, `backend/domains/shared/src/policy.spec.ts` (bloco `portal:*`),
    `backend/app/tests/e2e/policy-routes.e2e.spec.ts` (escopo `portal:*`). Inclua obrigatoriamente: vínculo ausente → 404; idempotência com corpo diferente → 409;
    protocolo gravado **antes** de qualquer validação de conteúdo — fixe explicitamente, com fonte ([UC-PORTAL-001], Lei 14.129 art. 27 IV,
    `portal-route-contract.md` §5 `submit`): a forma zod do corpo do próprio `submit` (assinatura, `consequenceAck`) é validada antes por ser do
    comando; a validade **semântica** do rascunho é do domínio dono — `submit` com rascunho semanticamente inválido protocola e a delegação
    devolve a pendência (`DELEGATION_FAILED`, protocolo mantido);
    `SERVICE_UNAVAILABLE` com motivo em cada serviço indisponível; `DELEGATION_FAILED` com alvo falso injetado; `it.todo` da delegação real citando R-0007;
    replay de cada projeção; `NOTIFICACAO_CIENCIA` idempotente; SSE com replay por `Last-Event-ID`; matriz `portal:*` positivos e negativos exaustivos.
14. **Layout para os Engineers**: arquivos por pacote, entradas `module.handwritten*` a acrescentar em cada blueprint (+ regenerar), `backend/app/src/portal-stream.*`,
    `backend/app/src/portal-national-read.providers.ts`, `backend/app/src/portal-delegation.providers.ts` (mapa de alvos), wiring no `AppModule`, `policy.ts`.
15. **Divergências** e **OD propostas** (OD-P16…P21 reservadas; novas a partir de OD-P22).

## Definições que valem como contrato (copiadas das fontes; não reinterprete)

- Tudo de `CTG-0001.md` (claims, guarda, níveis, entidades, fixtures, erros) permanece válido e não se repete: cite por §.
- Máquina `WF-PORTAL-001` e `WF-PORTAL-004`: `CTG-0001.md` §6. Catálogo 9/2/4: M12. Delegações indisponíveis: M8/M23 (`unavailableReason='delegacao_indisponivel_r0007'`).
- Erros do catálogo §3–§6 com `context` exato (`PORTAL.REQUEST_STATE_INVALID { state, allowed[] }`, `PORTAL.IDEMPOTENT_KEY_REUSE_DIFFERENT_BODY { key }`,
  `PORTAL.DELEGATION_FAILED { protocol, retryPolicy }`, `PORTAL.ENTITLEMENT_REQUIRED { targetKind, howToProve }`, `PORTAL.INELIGIBLE { reason, alternative, serviceKey }`,
  `PORTAL.SERVICE_UNAVAILABLE { unavailableReason, alternativeChannelNote }`, `PORTAL.SNE_*`, `PORTAL.NATIONAL_READ_UNAVAILABLE { cachedAt, retryAfter }`,
  `PORTAL.MANIFESTATION_KIND_INVALID { allowed[] }`, `PORTAL.MANIFESTATION_STATE_INVALID { state }`, `PORTAL.EVALUATION_ALREADY_SUBMITTED`, `PORTAL.EVALUATION_NOT_OFFERED { state }`).
- Eventos publicados/consumidos: `portal-route-contract.md` §10; envelope SSE: `rait-events-sse-contract.md` §1.
- Parâmetros: `portal.read_cache_ttl_minutes` (H.54), `portal.card_payment=false`, `portal.installments=false`, `portal.waiver_40_term=false`,
  `collection.discount_40_outside_sne=false` (H.53) — lidos pelo `ParameterService`, nunca literais em specs.
- Portas nacionais: só `packages/senatran-adapter` (`CdtPort.getCitizenLicense`, `CdtPort.listCitizenVehicles`, `CdtPort.getPaymentQuote`, `SnePort.*` — confirme os nomes em `ports.ts`).

## Critérios de aceitação (todos precisam passar)

- `pnpm format:check` → verde (formate o contrato com Prettier).
- `node tools/docs/kb/check.mjs` → sem novos problemas.
- `work/rounds/R-0009/contracts/CTG-0002.md` contém as 15 seções, um bloco por rota de §3–§9 (≥ 35 blocos), o array `PORTAL_RULES` literal,
  o `INFRACTION_SITUATION_MAP` completo e ≥ 60 critérios `C-0002-nn`.

Formato de cada critério: comando exato → resultado esperado.

## Regras que não admitem exceção

1. Nenhum valor inventado: prazo, papel, estado, código de erro, rótulo ou parâmetro sem fonte nas
   definições acima vira `source_pending` no catálogo (`docs/framework/arch/parameter-catalogue.md`)
   ou uma questão `OD-*` no relatório; nunca constante silenciosa.
2. Código gerado não se edita (ADR-0007); comportamento manuscrito vai em `src/handwritten/` ou
   nos arquivos listados em "Pode tocar".
3. Tokens de estado, timer, papel e erro vêm dos catálogos citados; a UI só traduz rótulos.
4. Nada fala com SENATRAN fora de `packages/senatran-adapter` (ADR-0003).
5. Fixtures canônicas (`backend/database/seed/`); não crie tenants nem personas próprias fora do prefixo M22.
6. Prettier: `node_modules/.bin/prettier --write <arquivos que tocou>` antes de entregar.
7. Specs nunca contêm chaves do catálogo de parâmetros como literal (`portal.*`, `privacy.*`, `collection.*` — `verify:parameter-catalogue`).
8. Nunca `it.skip`; `it.todo` só com `OD-*` ou R-0007 citados no nome. Nunca deixe `pnpm check`/`vitest` em segundo plano ao entregar.

## Entrega (relatório em Markdown, este formato, nada além dele)

```markdown
Papel: <Art. 6>
Tarefa: TASK-0005
Arquivos criados/alterados: <lista com caminho>
Comandos executados e saída resumida: <um por linha, com o resultado>
Critérios de aceitação: <cada um com PASS/FAIL>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids, ou "nenhuma">
Bloqueios: <ou "nenhum">
````

````

### work/rounds/R-0009/prompts/TASK-0006.md

```markdown
# Prompt de worker — `TASK-0006` (`inspector-tests`)

> Você é um worker da orquestra `portal-backend`, rodada `R-0009`, na worktree
> `/Volumes/Thiamat II/stech/detran-worktrees/portal-backend`. Você executa **uma** tarefa, dentro de
> uma fronteira de escrita, e entrega um relatório. Você **nunca** executa `git` (nem `add`, nem
> `commit`, nem `stash`), nunca instala pacotes (não rode `pnpm install`), nunca edita arquivos
> gerados à mão, nunca altera testes para passarem. Se algo impedir a tarefa, pare e escreva o bloqueio no relatório.

## Papel

Papel constitucional (Art. 6): **Inspector**. Declare-o na primeira linha da sua resposta.
Manual do perfil: `docs/meta/agents/inspector-tests.md` — leia-o primeiro; ele define o que você
pode e não pode tocar e o formato da entrega.

## Contexto da frente (o que você precisa saber, já resumido)

WP-P0…P3 do Portal (`docs/framework/arch/portal-build-pack.md`), rodada R-0009. As decisões **M1–M23** de
`work/rounds/R-0009/plan.md` §Decisões e os contratos `work/rounds/R-0009/contracts/CTG-000n.md` são o contrato: você
transcreve, não reinterpreta. O domínio `portal` tem cinco pacotes gerados por TASK-0002 (`@detran/portal-identity`,
`@detran/portal-requests`, `@detran/portal-inbox`, `@detran/portal-citizen-service`, `@detran/portal-projections`;
DDL 61…65, DDL manuscrito 19/14/11) e `portal/complaints` (PEC, intocável). Banco da rodada: `source work/rounds/R-0009/env-detran-r9.sh`
(`detran_r9`, já com DDL aplicado). Erros: `PortalError extends DetranError` (prefixo `PORTAL.`, catálogo
`docs/framework/arch/portal-error-catalog.md`). Perfil de teste: `DETRAN_RUNTIME_PROFILE=test`, `DETRAN_LOCAL_ROLES`,
`DETRAN_LOCAL_ASSURANCE_LEVEL`, `DETRAN_LOCAL_CPF` (M3), tenant local `00000000-0000-7000-8000-000000000001`.

Você codifica os critérios **C-0002-nn** de `CTG-0002.md` (TASK-0005) em testes que ficam vermelhos até TASK-0007/0008 implementarem.
CTG-0001 já está implementado e verde (TASK-0004): reutilize a guarda, os erros e as fixtures. A matriz `portal:*` em `policy.spec.ts` e o
escopo `portal:*` em `policy-routes.e2e.spec.ts` são seus. O reviewer da outra família julga pela rubrica (item 13: grants positivos e
negativos exaustivos para todos os papéis canônicos omitidos).

## Leitura obrigatória (lista fechada — não leia além dela)

- `AGENTS.md`; `CODESTYLE.md` §Tests; `docs/meta/agents/inspector-tests.md`
- `work/rounds/R-0009/plan.md` §Decisões (M7–M10, M12–M21, M23), §Critérios
- `work/rounds/R-0009/contracts/CTG-0002.md` (inteiro — fonte principal); `work/rounds/R-0009/contracts/CTG-0001.md` §6, §10 (máquinas, fixtures)
- `work/rounds/R-0009/reports/TASK-0004.md` (o que existe em `portal/identity/src/handwritten/`)
- `docs/framework/arch/rait-test-strategy.md` §1, §2, §6; `docs/framework/arch/rait-events-sse-contract.md` §5
- `docs/framework/arch/portal-error-catalog.md` (inteiro)
- `backend/database/seed/70-fixtures-portal.sql`, `30-fixtures-infraction.sql` (ids), `50-fixtures-collection.sql` (ids)
- `backend/database/ddl/6{1,2,3,4,5}-portal-*.sql`, `04-integration-storage.sql` (`integration.outbox`)
- `backend/app/tests/e2e/{inf-ait-routes,policy-routes,teat-stream,portal-identity}.e2e.spec.ts` (padrões: app real, env, `inScope`, SSE por `supertest`/`http`)
- `backend/app/src/teat-stream.service.spec.ts` (padrão de teste de serviço de stream com poller falso)
- `backend/domains/shared/src/policy.spec.ts` (padrão de matriz; onde inserir o bloco `portal:*`); `backend/domains/shared/src/roles.ts`
- `backend/domains/inf/infraction/tests/unit/infraction-transitions.matrix.spec.ts`; `backend/domains/ops/offline-sync/tests/integration/*.integration.spec.ts` (padrão de integração com `pg` e transação)
- `backend/domains/portal/identity/src/handwritten/*.ts` (símbolos reais: guarda, erros, claims)
- `backend/domains/portal/*/vitest.config.ts`; `backend/app/vitest.config.ts`
- `tools/parameters/verify.mjs` linhas 1–40 (nenhum literal `portal.*`/`collection.*` em specs)

## Pode tocar

- Novos specs listados no contrato §13: `backend/domains/portal/requests/src/handwritten/**/*.spec.ts`, `backend/domains/portal/requests/tests/integration/*.integration.spec.ts`,
  `backend/domains/portal/inbox/src/handwritten/*.spec.ts`, `backend/domains/portal/inbox/tests/integration/*.integration.spec.ts`,
  `backend/domains/portal/citizen-service/src/handwritten/*.spec.ts`, `backend/domains/portal/citizen-service/tests/integration/*.integration.spec.ts`,
  `backend/domains/portal/projections/src/handwritten/*.spec.ts`, `backend/domains/portal/projections/tests/integration/*.integration.spec.ts`,
  `backend/app/src/portal-stream.service.spec.ts`, `backend/app/tests/e2e/portal-routes.e2e.spec.ts`, `backend/app/tests/e2e/portal-stream.e2e.spec.ts`
- `backend/domains/shared/src/policy.spec.ts` (acrescentar o bloco `portal:*`; nunca remover asserções)
- `backend/app/tests/e2e/policy-routes.e2e.spec.ts` (estender `inScope` e exceções ao escopo `portal:*` conforme contrato §10; nunca relaxar o escopo TEAT)
- `backend/database/seed/71-fixtures-portal-events.sql` **só** se o contrato §12 pedir seed (prefixo `…70007000nn`)

## Não pode tocar

Código de produção, blueprints, DDL, `policy.ts`, `roles.ts`, `backend/app/src/**` (exceto o spec acima), `package.json`, `tools/**`, `docs/**`,
seeds existentes, `portal-identity.e2e.spec.ts` e os specs de TASK-0003 (já verdes — não os altere).

Além disso: `docs/framework/product/**` (corpus de produto), `record/`, `.devai/`, `docs/meta/adr/`, arquivos com cabeçalho
"Generated from BP-…", `plan.md`, `tasks/`, `prompts/`, `contracts/`, `pnpm-lock.yaml`.

## Tarefa (o quê, não o como)

1. Um `it` por critério `C-0002-nn`, nome "dado <fixture> quando <rota> então <efeito|código>", tier e arquivo do contrato §13.
2. E2E `portal-routes.e2e.spec.ts`: sobe o `AppModule` real (perfil `test`, `CIDADAO` + claims por env), usa as fixtures de `70-fixtures-portal.sql` **via** sujeitos criados
   pelo `GET me` (CPF fixture) e ids das fixtures; cobre cada rota do contrato §2 com sucesso, papel negado, `If-Match` ausente (428) onde exigido, guarda de estado (409),
   regras (422 com `code`), vínculo ausente (404), idempotência (mesmo corpo → mesma resposta; corpo diferente → 409), `SERVICE_UNAVAILABLE` com `unavailableReason`
   por serviço indisponível, `DELEGATION_FAILED` com alvo falso injetado (o contrato §3 diz como injetar — provavelmente um provider de teste sobrescrito via
   `Test.createTestingModule` ou variável de ambiente; siga o contrato), e `it.todo('… delegação real ao RAIT — R-0007')`.
3. Projeções: unit por projetor (`applyEvent` com envelopes de exemplo do contrato §7; `INFRACTION_SITUATION_MAP` cobre todos os tokens listados) e integração
   de replay (aplicar N eventos gravados em `integration.outbox` no teste → apagar a projeção → `rebuild` → linhas iguais; idempotência: reaplicar o mesmo `event.id` não duplica).
4. SSE: `portal-stream.service.spec.ts` (filtragem por sujeito, tipos, replay por cursor) e `portal-stream.e2e.spec.ts` (handshake, `Last-Event-ID`, heartbeat) no padrão TEAT.
5. Política: bloco `portal:*` em `policy.spec.ts` — para **cada** chave de M19, positivo para `CIDADAO` e negativo para **todos** os demais `DETRAN_ROLES`
   (exceto os de `GLOBAL_ADMIN_ROLES`, declarados explicitamente como exceção esperada de `isDetranActionAllowed`); `portal:appeal:*` ausente.
   `policy-routes.e2e.spec.ts`: escopo `portal:*` nos dois sentidos com as exceções do contrato §10.
6. Relatório: matriz `C-0002-nn → arquivo → it(...)`; o que não pôde ser testado e por quê; env restaurado em `afterAll` de cada arquivo.

## Definições que valem como contrato (copiadas das fontes; não reinterprete)

- Contrato `CTG-0002.md` §2–§13; `CTG-0001.md` §6, §10. Erros e `context`: catálogo do Portal.
- `DETRAN_ROLES` de `roles.ts`; `GLOBAL_ADMIN_ROLES` = `ADMIN`, `GESTOR_DETRAN`, `SUPORTE`, `technical-admin`.
- Envelope SSE: `rait-events-sse-contract.md` §1; tipos do Portal: `inbox.item`, `request.changed`, `decision.published`, `payment.confirmed`.
- Tenant local `00000000-0000-7000-8000-000000000001`; canônico `00000000-0000-7000-8000-00000000a001`; CPFs fixture `11111111111`…`55555555555`.

## Critérios de aceitação (todos precisam passar)

- `pnpm format:check` → verde.
- `pnpm typecheck` → os specs novos podem falhar **só** por símbolos de `src/handwritten/` ainda inexistentes (registre a saída literal por arquivo).
- `pnpm --filter @detran/shared test` → o bloco `portal:*` **falha** (regras ainda ausentes) e todo o resto continua verde — registre.
- `node tools/parameters/verify.mjs --check-usage` → OK.
- Se criou seed: `DB_NAME=detran_r9 DB_PASSWORD=postgres bash backend/database/seed.sh` (2×) → OK.

Formato de cada critério: comando exato → resultado esperado.

## Regras que não admitem exceção

1. Nenhum valor inventado: prazo, papel, estado, código de erro, rótulo ou parâmetro sem fonte nas
   definições acima vira `source_pending` no catálogo (`docs/framework/arch/parameter-catalogue.md`)
   ou uma questão `OD-*` no relatório; nunca constante silenciosa.
2. Código gerado não se edita (ADR-0007); comportamento manuscrito vai em `src/handwritten/` ou
   nos arquivos listados em "Pode tocar".
3. Tokens de estado, timer, papel e erro vêm dos catálogos citados; a UI só traduz rótulos.
4. Nada fala com SENATRAN fora de `packages/senatran-adapter` (ADR-0003).
5. Fixtures canônicas (`backend/database/seed/`); não crie tenants nem personas próprias fora do prefixo M22.
6. Prettier: `node_modules/.bin/prettier --write <arquivos que tocou>` antes de entregar.
7. Specs nunca contêm chaves do catálogo de parâmetros como literal (`portal.*`, `privacy.*`, `collection.*` — `verify:parameter-catalogue`).
8. Nunca `it.skip`; `it.todo` só com `OD-*` ou R-0007 citados no nome. Nunca deixe `pnpm check`/`vitest` em segundo plano ao entregar.

## Entrega (relatório em Markdown, este formato, nada além dele)

```markdown
Papel: <Art. 6>
Tarefa: TASK-0006
Arquivos criados/alterados: <lista com caminho>
Comandos executados e saída resumida: <um por linha, com o resultado>
Critérios de aceitação: <cada um com PASS/FAIL>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids, ou "nenhuma">
Bloqueios: <ou "nenhum">
````

````

### work/rounds/R-0009/prompts/TASK-0007.md

```markdown
# Prompt de worker — `TASK-0007` (`engineer-backend`)

> Você é um worker da orquestra `portal-backend`, rodada `R-0009`, na worktree
> `/Volumes/Thiamat II/stech/detran-worktrees/portal-backend`. Você executa **uma** tarefa, dentro de
> uma fronteira de escrita, e entrega um relatório. Você **nunca** executa `git` (nem `add`, nem
> `commit`, nem `stash`), nunca instala pacotes (não rode `pnpm install`), nunca edita arquivos
> gerados à mão, nunca altera testes para passarem. Se algo impedir a tarefa, pare e escreva o bloqueio no relatório.

## Papel

Papel constitucional (Art. 6): **Engineer**. Declare-o na primeira linha da sua resposta.
Manual do perfil: `docs/meta/agents/engineer-backend.md` — leia-o primeiro; ele define o que você
pode e não pode tocar e o formato da entrega.

## Contexto da frente (o que você precisa saber, já resumido)

WP-P0…P3 do Portal (`docs/framework/arch/portal-build-pack.md`), rodada R-0009. As decisões **M1–M23** de
`work/rounds/R-0009/plan.md` §Decisões e os contratos `work/rounds/R-0009/contracts/CTG-000n.md` são o contrato: você
transcreve, não reinterpreta. O domínio `portal` tem cinco pacotes gerados por TASK-0002 (`@detran/portal-identity`,
`@detran/portal-requests`, `@detran/portal-inbox`, `@detran/portal-citizen-service`, `@detran/portal-projections`;
DDL 61…65, DDL manuscrito 19/14/11) e `portal/complaints` (PEC, intocável). Banco da rodada: `source work/rounds/R-0009/env-detran-r9.sh`
(`detran_r9`, já com DDL aplicado). Erros: `PortalError extends DetranError` (prefixo `PORTAL.`, catálogo
`docs/framework/arch/portal-error-catalog.md`). Perfil de teste: `DETRAN_RUNTIME_PROFILE=test`, `DETRAN_LOCAL_ROLES`,
`DETRAN_LOCAL_ASSURANCE_LEVEL`, `DETRAN_LOCAL_CPF` (M3), tenant local `00000000-0000-7000-8000-000000000001`.

Você implementa, até os testes de TASK-0006 do seu escopo passarem **sem alterá-los**: o bloco `PORTAL_RULES` completo em `policy.ts` (M19),
as rotas §3 (elevações, representações, preferências) em `portal/identity` e as rotas §5 (pedidos) em `portal/requests` com protocolo imediato,
delegação por porta (`UnavailableDelegationTarget` para RAIT/infração/pagamento/PEC/privacy — M8/M23), idempotência (M9), vínculo (M10) e eventos (M21).
TASK-0008 (depois de você) faz §4, §6, §7, §8, §9 e os projetores — não os crie; se um teste do seu pacote depender de algo de lá, registre.

## Leitura obrigatória (lista fechada — não leia além dela)

- `AGENTS.md`; `CODESTYLE.md`; `docs/meta/agents/engineer-backend.md`
- `work/rounds/R-0009/plan.md` §Decisões (M7–M10, M19, M21, M23)
- `work/rounds/R-0009/contracts/CTG-0002.md` §1–§5, §10, §11, §13 (os seus critérios), §14 (layout); `CTG-0001.md` §2–§6 (guarda, nível, máquinas)
- `work/rounds/R-0009/reports/TASK-0006.md` (matriz critério → teste)
- Os specs do seu escopo: `backend/domains/portal/requests/**/*.spec.ts`, `backend/domains/portal/identity/**/*.spec.ts`, `backend/domains/shared/src/policy.spec.ts` (bloco `portal:*`),
  `backend/app/tests/e2e/portal-routes.e2e.spec.ts` (os `describe` de §3 e §5), `backend/app/tests/e2e/policy-routes.e2e.spec.ts`
- `docs/framework/arch/portal-route-contract.md` §1, §3, §5, §10; `docs/framework/arch/portal-error-catalog.md` §1–§3, §7
- `backend/domains/portal/{identity,requests}/src/**` (gerado + manuscrito de TASK-0004); blueprints `BP-PORTAL-{IDENTITY,REQUESTS}-001.json` (bloco `module`)
- `backend/domains/shared/src/{policy.ts, policy.spec.ts (bloco portal), decorators.ts, errors/if-match.ts, events/outbox.ts, events/sql-outbox.ts, tenant-context.ts}`
- `backend/domains/inf/ait/src/handwritten/` (padrão de comando: `parse` zod, `guard`, `apply` em `Database.tx`, eventos na outbox), `backend/domains/inf/infraction/src/handwritten/events.ts`
- `backend/domains/ops/offline-sync/src/handwritten/` (padrão de porta por token `@Inject` + `@Optional`), `backend/app/src/teat-sync.providers.ts` (composição de portas no app)
- `backend/app/src/app.module.ts`; `backend/database/ddl/6{1,2}-portal-*.sql`, `19-portal-platform.sql` (`protocol_seq`)

## Pode tocar

- `backend/domains/portal/requests/src/handwritten/**` (novo), `backend/domains/portal/identity/src/handwritten/**` (acrescentar §3; não quebrar TASK-0004)
- `docs/framework/blueprints/BP-PORTAL-{IDENTITY,REQUESTS}-001.json` — só o bloco `module` (`handwritten*`, `dependencies`), seguido de `pnpm blueprints:generate && pnpm contracts:openapi`
- `backend/domains/shared/src/policy.ts` — só o bloco `PORTAL_RULES` (M19) e sua montagem; nenhum outro bloco
- `backend/app/src/portal-delegation.providers.ts` (novo, mapa de alvos) e `backend/app/src/app.module.ts` (só o wiring desse provider)

## Não pode tocar

Testes, seeds, DDL, gerados, `roles.ts`, outros blocos de `policy.ts`, `backend/domains/portal/{inbox,citizen-service,projections}/**`,
`backend/app/src/portal-stream.*`, `packages/**`, `tools/**`, `docs/**` fora dos dois blueprints.

Além disso: `docs/framework/product/**` (corpus de produto), `record/`, `.devai/`, `docs/meta/adr/`, arquivos com cabeçalho
"Generated from BP-…", `plan.md`, `tasks/`, `prompts/`, `contracts/`, `pnpm-lock.yaml`.

## Tarefa (o quê, não o como)

1. `PORTAL_RULES` literal do contrato §10 em `policy.ts`, montado como os demais blocos; `pnpm --filter @detran/shared test` verde.
2. Rotas §3 e §5 exatamente como os blocos do contrato §2 (controlador por recurso, um comando por arquivo, `parse`/`guard`/`apply`/`events`);
   `PortalCitizenGuard` + `assertActLevel` + `assertEntitled`; `If-Match`/`Idempotency-Key` como M9; protocolo imediato (M8) com `portal.protocol_seq`;
   `RequestDelegationService` + porta `PORTAL_DELEGATION_TARGETS` (+ `UnavailableDelegationTarget`), composição em `portal-delegation.providers.ts`;
   eventos M21 na outbox na mesma transação.
3. Se um teste contradisser o contrato: não altere o teste; registre (arquivo, linha, o que o contrato diz) e implemente o contrato.
4. Gates abaixo; saída literal dos que falharem. Testes de §4/§6/§7/§8/§9 e de projeções ficam vermelhos (TASK-0008) — liste-os como "fora do escopo, TASK-0008".

## Definições que valem como contrato (copiadas das fontes; não reinterprete)

- Contrato `CTG-0002.md` (rotas §3/§5, delegação, idempotência, vínculo, política, eventos, layout). Decoradores e erros como em TASK-0004.
- `technical-admin` passa a política (`*`) mas não a guarda de identidade (M4).

## Critérios de aceitação (todos precisam passar)

- `pnpm --filter @detran/shared test` → verde (bloco `portal:*` incluído).
- `pnpm --filter @detran/portal-requests test:unit` e `pnpm --filter @detran/portal-identity test:unit` → verdes.
- `source work/rounds/R-0009/env-detran-r9.sh && pnpm --filter @detran/portal-requests test:integration && pnpm --filter @detran/portal-identity test:integration` → verdes.
- `source work/rounds/R-0009/env-detran-r9.sh && pnpm --filter @detran/app test:e2e -- tests/e2e/portal-routes.e2e.spec.ts` → os `describe` de §3 e §5 verdes; os demais vermelhos listados.
- `pnpm verify:decorators` → OK; `pnpm blueprints:check` → OK; `pnpm contracts:check` → OK; `pnpm typecheck` → verde.
- `pnpm check` → verde (uma vez, em primeiro plano, ao final).

Formato de cada critério: comando exato → resultado esperado.

## Regras que não admitem exceção

1. Nenhum valor inventado: prazo, papel, estado, código de erro, rótulo ou parâmetro sem fonte nas
   definições acima vira `source_pending` no catálogo (`docs/framework/arch/parameter-catalogue.md`)
   ou uma questão `OD-*` no relatório; nunca constante silenciosa.
2. Código gerado não se edita (ADR-0007); comportamento manuscrito vai em `src/handwritten/` ou
   nos arquivos listados em "Pode tocar".
3. Tokens de estado, timer, papel e erro vêm dos catálogos citados; a UI só traduz rótulos.
4. Nada fala com SENATRAN fora de `packages/senatran-adapter` (ADR-0003).
5. Fixtures canônicas (`backend/database/seed/`); não crie tenants nem personas próprias fora do prefixo M22.
6. Prettier: `node_modules/.bin/prettier --write <arquivos que tocou>` antes de entregar.
7. Specs nunca contêm chaves do catálogo de parâmetros como literal (`portal.*`, `privacy.*`, `collection.*` — `verify:parameter-catalogue`).
8. Nunca `it.skip`; `it.todo` só com `OD-*` ou R-0007 citados no nome. Nunca deixe `pnpm check`/`vitest` em segundo plano ao entregar.

## Entrega (relatório em Markdown, este formato, nada além dele)

```markdown
Papel: <Art. 6>
Tarefa: TASK-0007
Arquivos criados/alterados: <lista com caminho>
Comandos executados e saída resumida: <um por linha, com o resultado>
Critérios de aceitação: <cada um com PASS/FAIL>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids, ou "nenhuma">
Bloqueios: <ou "nenhum">
````

````

### work/rounds/R-0009/prompts/TASK-0008.md

```markdown
# Prompt de worker — `TASK-0008` (`engineer-backend`)

> Você é um worker da orquestra `portal-backend`, rodada `R-0009`, na worktree
> `/Volumes/Thiamat II/stech/detran-worktrees/portal-backend`. Você executa **uma** tarefa, dentro de
> uma fronteira de escrita, e entrega um relatório. Você **nunca** executa `git` (nem `add`, nem
> `commit`, nem `stash`), nunca instala pacotes (não rode `pnpm install`), nunca edita arquivos
> gerados à mão, nunca altera testes para passarem. Se algo impedir a tarefa, pare e escreva o bloqueio no relatório.

## Papel

Papel constitucional (Art. 6): **Engineer**. Declare-o na primeira linha da sua resposta.
Manual do perfil: `docs/meta/agents/engineer-backend.md` — leia-o primeiro; ele define o que você
pode e não pode tocar e o formato da entrega.

## Contexto da frente (o que você precisa saber, já resumido)

WP-P0…P3 do Portal (`docs/framework/arch/portal-build-pack.md`), rodada R-0009. As decisões **M1–M23** de
`work/rounds/R-0009/plan.md` §Decisões e os contratos `work/rounds/R-0009/contracts/CTG-000n.md` são o contrato: você
transcreve, não reinterpreta. O domínio `portal` tem cinco pacotes gerados por TASK-0002 (`@detran/portal-identity`,
`@detran/portal-requests`, `@detran/portal-inbox`, `@detran/portal-citizen-service`, `@detran/portal-projections`;
DDL 61…65, DDL manuscrito 19/14/11) e `portal/complaints` (PEC, intocável). Banco da rodada: `source work/rounds/R-0009/env-detran-r9.sh`
(`detran_r9`, já com DDL aplicado). Erros: `PortalError extends DetranError` (prefixo `PORTAL.`, catálogo
`docs/framework/arch/portal-error-catalog.md`). Perfil de teste: `DETRAN_RUNTIME_PROFILE=test`, `DETRAN_LOCAL_ROLES`,
`DETRAN_LOCAL_ASSURANCE_LEVEL`, `DETRAN_LOCAL_CPF` (M3), tenant local `00000000-0000-7000-8000-000000000001`.

Você implementa o restante de CTG-0002 até **todos** os testes de TASK-0006 passarem sem alterá-los: rotas §4 (autuações, projeção) e §7
(documentos, veículos, sinistros, exames — cache nacional M17) em `portal/projections`; §6 (caixa, ciência SNE, adesão/cancelamento, push) em
`portal/inbox`; §8 (manifestações, avaliações, prazo da Carta) em `portal/citizen-service`; §9 SSE em `backend/app/src/portal-stream.*` (M18);
os cinco projetores e o replay (M16); `policy-routes.e2e.spec.ts` verde. `PORTAL_RULES` já existe (TASK-0007) — não toque em `policy.ts`;
se faltar uma regra, registre (é triagem do maestro).

## Leitura obrigatória (lista fechada — não leia além dela)

- `AGENTS.md`; `CODESTYLE.md`; `docs/meta/agents/engineer-backend.md`
- `work/rounds/R-0009/plan.md` §Decisões (M12–M18, M20, M21)
- `work/rounds/R-0009/contracts/CTG-0002.md` §2 (rotas §4, §6, §7, §8, §9), §6–§9, §11, §13, §14; `CTG-0001.md` §6 (máquina da manifestação)
- `work/rounds/R-0009/reports/TASK-0006.md`, `work/rounds/R-0009/reports/TASK-0007.md`
- Os specs do seu escopo: `backend/domains/portal/{inbox,citizen-service,projections}/**/*.spec.ts`, `backend/app/src/portal-stream.service.spec.ts`,
  `backend/app/tests/e2e/{portal-routes,portal-stream,policy-routes}.e2e.spec.ts`
- `docs/framework/arch/portal-route-contract.md` §4, §6, §7, §8, §9, §10; `docs/framework/arch/portal-error-catalog.md` §4, §5, §6; `docs/framework/arch/rait-events-sse-contract.md` §1, §3
- `backend/domains/portal/{inbox,citizen-service,projections}/src/**` (gerado); `backend/domains/portal/{identity,requests}/src/handwritten/` (guarda, erros, vínculo, idempotência — reutilize)
- Blueprints `BP-PORTAL-{INBOX,CITIZEN-SERVICE,PROJECTIONS}-001.json` (bloco `module`)
- `backend/app/src/{teat-stream.controller.ts, teat-stream.service.ts, teat-snapshots.providers.ts, app.module.ts}`
- `backend/domains/shared/src/{events/outbox.ts, events/sql-outbox.ts, decorators.ts}`; `backend/domains/ops/parameter/src/handwritten/parameter.service.ts`
- `backend/domains/inf/deadlines/src/index.ts` (`addCalendarDays`); `backend/domains/inf/notification/src/handwritten/acknowledgement-mark.ts`
- `packages/senatran-adapter/src/{ports.ts, domain.ts, index.ts}` (`createSenatranAdapter`, portas)
- `backend/database/ddl/1{4,9}-*.sql`, `6{3,4,5}-portal-*.sql`, `04-integration-storage.sql`

## Pode tocar

- `backend/domains/portal/{inbox,citizen-service,projections}/src/handwritten/**` (novos)
- Blueprints `BP-PORTAL-{INBOX,CITIZEN-SERVICE,PROJECTIONS}-001.json` — só o bloco `module`, seguido de `pnpm blueprints:generate && pnpm contracts:openapi`
- `backend/app/src/portal-stream.controller.ts`, `portal-stream.service.ts`, `portal-national-read.providers.ts` (novos); `backend/app/src/app.module.ts` (só o wiring desses)

## Não pode tocar

Testes, seeds, DDL, gerados, `policy.ts`, `roles.ts`, `backend/domains/portal/{identity,requests}/**` (exceto importar), `packages/**`, `tools/**`, `docs/**` fora dos três blueprints.

Além disso: `docs/framework/product/**` (corpus de produto), `record/`, `.devai/`, `docs/meta/adr/`, arquivos com cabeçalho
"Generated from BP-…", `plan.md`, `tasks/`, `prompts/`, `contracts/`, `pnpm-lock.yaml`.

## Tarefa (o quê, não o como)

1. Rotas §4, §6, §7, §8, §9 como os blocos do contrato; projetores `*.projection.ts` com cabeçalho `// Source events:` e `INFRACTION_SITUATION_MAP` do contrato §7;
   `rebuild` por replay da outbox; idempotência por `projection_applied_event`; cache nacional pelo token `PORTAL_NATIONAL_READ_PORTS` composto com
   `createSenatranAdapter().ports` em `portal-national-read.providers.ts` (nunca `fetch`); TTL pelo `ParameterService`; SSE no padrão TEAT.
2. `NOTIFICACAO_CIENCIA` e `INBOX_LIDO` idempotentes; `fictitious_acknowledgement_on` a partir do catálogo de timers (`T-SNE-CIENCIA`), nunca `30` literal;
   manifestação nunca recusada; `agency_due_on` por `addCalendarDays`.
3. Teste contradizendo o contrato: não altere; registre e implemente o contrato.
4. Gates abaixo; saída literal dos que falharem.

## Definições que valem como contrato (copiadas das fontes; não reinterprete)

- Contrato `CTG-0002.md` (§6–§9, §11, rotas dos §4/§6/§7/§8/§9). Decoradores e erros como em TASK-0004/0007. `@Audit` também nas leituras de dado pessoal (M20).

## Critérios de aceitação (todos precisam passar)

- `source work/rounds/R-0009/env-detran-r9.sh && pnpm backend:test:ci` → verde (unit + integration + e2e de todos os pacotes, inclusive `policy-routes` e `portal-stream`).
- `pnpm verify:decorators` → OK; `pnpm verify:senatran-boundary` → OK; `pnpm verify:parameter-catalogue` → OK; `pnpm blueprints:check` → OK; `pnpm contracts:check` → OK.
- `pnpm check` → verde (uma vez, em primeiro plano, ao final).

Formato de cada critério: comando exato → resultado esperado.

## Regras que não admitem exceção

1. Nenhum valor inventado: prazo, papel, estado, código de erro, rótulo ou parâmetro sem fonte nas
   definições acima vira `source_pending` no catálogo (`docs/framework/arch/parameter-catalogue.md`)
   ou uma questão `OD-*` no relatório; nunca constante silenciosa.
2. Código gerado não se edita (ADR-0007); comportamento manuscrito vai em `src/handwritten/` ou
   nos arquivos listados em "Pode tocar".
3. Tokens de estado, timer, papel e erro vêm dos catálogos citados; a UI só traduz rótulos.
4. Nada fala com SENATRAN fora de `packages/senatran-adapter` (ADR-0003).
5. Fixtures canônicas (`backend/database/seed/`); não crie tenants nem personas próprias fora do prefixo M22.
6. Prettier: `node_modules/.bin/prettier --write <arquivos que tocou>` antes de entregar.
7. Specs nunca contêm chaves do catálogo de parâmetros como literal (`portal.*`, `privacy.*`, `collection.*` — `verify:parameter-catalogue`).
8. Nunca `it.skip`; `it.todo` só com `OD-*` ou R-0007 citados no nome. Nunca deixe `pnpm check`/`vitest` em segundo plano ao entregar.

## Entrega (relatório em Markdown, este formato, nada além dele)

```markdown
Papel: <Art. 6>
Tarefa: TASK-0008
Arquivos criados/alterados: <lista com caminho>
Comandos executados e saída resumida: <um por linha, com o resultado>
Critérios de aceitação: <cada um com PASS/FAIL>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids, ou "nenhuma">
Bloqueios: <ou "nenhum">
````

````

### work/rounds/R-0009/prompts/TASK-0009.md

```markdown
# Prompt de worker — `TASK-0009` (`engineer-backend`)

> Você é um worker da orquestra `portal-backend`, rodada `R-0009`, na worktree
> `/Volumes/Thiamat II/stech/detran-worktrees/portal-backend`. Você executa **uma** tarefa, dentro de
> uma fronteira de escrita, e entrega um relatório. Você **nunca** executa `git` (nem `add`, nem
> `commit`, nem `stash`), nunca instala pacotes (não rode `pnpm install`), nunca edita arquivos
> gerados à mão, nunca altera testes para passarem. Se algo impedir a tarefa, pare e escreva o bloqueio no relatório.

## Papel

Papel constitucional (Art. 6): **Engineer**. Declare-o na primeira linha da sua resposta.
Manual do perfil: `docs/meta/agents/engineer-backend.md` — leia-o primeiro; ele define o que você
pode e não pode tocar e o formato da entrega.

## Contexto da frente (o que você precisa saber, já resumido)

WP-P0…P3 do Portal (`docs/framework/arch/portal-build-pack.md`), rodada R-0009. As decisões **M1–M23** de
`work/rounds/R-0009/plan.md` §Decisões e os contratos `work/rounds/R-0009/contracts/CTG-000n.md` são o contrato: você
transcreve, não reinterpreta. O domínio `portal` tem cinco pacotes gerados por TASK-0002 (`@detran/portal-identity`,
`@detran/portal-requests`, `@detran/portal-inbox`, `@detran/portal-citizen-service`, `@detran/portal-projections`;
DDL 61…65, DDL manuscrito 19/14/11) e `portal/complaints` (PEC, intocável). Banco da rodada: `source work/rounds/R-0009/env-detran-r9.sh`
(`detran_r9`, já com DDL aplicado). Erros: `PortalError extends DetranError` (prefixo `PORTAL.`, catálogo
`docs/framework/arch/portal-error-catalog.md`). Perfil de teste: `DETRAN_RUNTIME_PROFILE=test`, `DETRAN_LOCAL_ROLES`,
`DETRAN_LOCAL_ASSURANCE_LEVEL`, `DETRAN_LOCAL_CPF` (M3), tenant local `00000000-0000-7000-8000-000000000001`.

WP-P3: você transcreve as rotas **implementadas** (TASK-0004/0007/0008) em contratos de comando `docs/framework/contracts/BP-PORTAL-*.commands.openapi.json`
verificados por `tools/contracts/check-commands.mjs` (`pnpm contracts:check`) e consumidos por `pnpm contracts:clients` (`@detran/api-clients`), e o schema
`docs/framework/schemas/portal-request-draft.schema.json` (um `oneOf` por `serviceKey` do §5.1). Nada de decisão: o que não estiver nos blocos do contrato
`CTG-0002.md` ou no código vira OD no relatório.

## Leitura obrigatória (lista fechada — não leia além dela)

- `AGENTS.md`; `CODESTYLE.md`; `docs/meta/agents/engineer-backend.md`; `docs/meta/agents/transcriber-docs.md` §Regras de transcrição (item 5: `operationId`, 4xx, exemplos com fixtures)
- `work/rounds/R-0009/plan.md` §Metas 4, §Decisões M8, M9, M12
- `work/rounds/R-0009/contracts/CTG-0002.md` §2 (blocos de rota: `operationId`, DTO, cabeçalhos, erros, resposta), §4 (idempotência)
- `work/rounds/R-0008/contracts/CTG-0005.md` §1–§4 (formato dos `*.commands.openapi.json` adotado, gate `check-commands.mjs`, gerador de clientes)
- `docs/framework/contracts/BP-INF-AIT-001.commands.openapi.json` (modelo completo), `docs/framework/contracts/README.md` (se existir)
- `tools/contracts/check-commands.mjs`, `tools/contracts/generate-clients.mjs`, `tools/contracts/generate-openapi.mjs` (o que é gerado × manual)
- `docs/framework/schemas/teat-offline-sync-batch.schema.json` (modelo de schema JSON), `docs/framework/schemas/README.md`
- `docs/framework/arch/portal-route-contract.md` §5.1; `docs/framework/arch/portal-error-catalog.md` (inteiro)
- Controladores manuscritos: `backend/domains/portal/*/src/handwritten/**/*.controller.ts`, `backend/app/src/portal-stream.controller.ts`; DTOs zod dos comandos
- `backend/database/seed/70-fixtures-portal.sql` (ids para os exemplos)
- `packages/api-clients/src/generated/BP-INF-AIT-001.ts` (forma do cliente gerado), `packages/api-clients/package.json`

## Pode tocar

- `docs/framework/contracts/BP-PORTAL-IDENTITY-001.commands.openapi.json`, `BP-PORTAL-REQUESTS-001.commands.openapi.json`, `BP-PORTAL-INBOX-001.commands.openapi.json`,
  `BP-PORTAL-CITIZEN-SERVICE-001.commands.openapi.json`, `BP-PORTAL-PROJECTIONS-001.commands.openapi.json` (novos)
- `docs/framework/schemas/portal-request-draft.schema.json` (novo) e a linha correspondente em `docs/framework/schemas/README.md` (se o README indexa os schemas)
- `packages/api-clients/src/generated/BP-PORTAL-*.ts` **somente via** `pnpm contracts:clients`

## Não pode tocar

Código, testes, blueprints, DDL, seeds, `*.openapi.json` gerados (sem `.commands.`), `docs/**` fora dos arquivos acima.

Além disso: `docs/framework/product/**` (corpus de produto), `record/`, `.devai/`, `docs/meta/adr/`, arquivos com cabeçalho
"Generated from BP-…", `plan.md`, `tasks/`, `prompts/`, `contracts/`, `pnpm-lock.yaml`.

## Tarefa (o quê, não o como)

1. Um `.commands.openapi.json` por pacote com todas as rotas manuscritas do pacote (o do `projections` inclui §4 e §7; o SSE `GET /v1/portal/stream` entra no de `inbox`
   como `text/event-stream`), `operationId` `portal<Recurso><Verbo>` do contrato, `parameters` (`If-Match`, `Idempotency-Key` com descrição da chave determinística
   `<ato>:<alvo>:<fingerprint>`), `requestBody` por `serviceKey` (§5.1 via `oneOf` + `discriminator` quando o gate permitir), respostas 2xx e **cada** 4xx/5xx do bloco
   com o `code` do catálogo no exemplo, exemplos com ids das fixtures `70-fixtures-portal.sql`.
2. `portal-request-draft.schema.json`: JSON Schema draft 2020-12, `oneOf` por `serviceKey` com os corpos do §5.1 (campos, enums), `$id` no padrão dos schemas existentes.
3. `pnpm contracts:check` e `pnpm contracts:clients` verdes; `pnpm --filter @detran/api-clients typecheck` verde.
4. Divergências entre rota implementada e contrato de rotas (`portal-route-contract.md`) → lista no relatório com OD proposta (não corrija código nem docs).

## Definições que valem como contrato (copiadas das fontes; não reinterprete)

- Blocos do contrato `CTG-0002.md` §2 (DTO, cabeçalhos, erros, resposta, `operationId`); catálogo de erros do Portal; §5.1 do contrato de rotas.

## Critérios de aceitação (todos precisam passar)

- `pnpm contracts:check` → OK.
- `pnpm contracts:clients` → gera `packages/api-clients/src/generated/BP-PORTAL-*.ts`; `pnpm --filter @detran/api-clients typecheck` → verde.
- `pnpm format:check` → verde.
- `pnpm check` → verde (uma vez, ao final).

Formato de cada critério: comando exato → resultado esperado.

## Regras que não admitem exceção

1. Nenhum valor inventado: prazo, papel, estado, código de erro, rótulo ou parâmetro sem fonte nas
   definições acima vira `source_pending` no catálogo (`docs/framework/arch/parameter-catalogue.md`)
   ou uma questão `OD-*` no relatório; nunca constante silenciosa.
2. Código gerado não se edita (ADR-0007); comportamento manuscrito vai em `src/handwritten/` ou
   nos arquivos listados em "Pode tocar".
3. Tokens de estado, timer, papel e erro vêm dos catálogos citados; a UI só traduz rótulos.
4. Nada fala com SENATRAN fora de `packages/senatran-adapter` (ADR-0003).
5. Fixtures canônicas (`backend/database/seed/`); não crie tenants nem personas próprias fora do prefixo M22.
6. Prettier: `node_modules/.bin/prettier --write <arquivos que tocou>` antes de entregar.
7. Specs nunca contêm chaves do catálogo de parâmetros como literal (`portal.*`, `privacy.*`, `collection.*` — `verify:parameter-catalogue`).
8. Nunca `it.skip`; `it.todo` só com `OD-*` ou R-0007 citados no nome. Nunca deixe `pnpm check`/`vitest` em segundo plano ao entregar.

## Entrega (relatório em Markdown, este formato, nada além dele)

```markdown
Papel: <Art. 6>
Tarefa: TASK-0009
Arquivos criados/alterados: <lista com caminho>
Comandos executados e saída resumida: <um por linha, com o resultado>
Critérios de aceitação: <cada um com PASS/FAIL>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids, ou "nenhuma">
Bloqueios: <ou "nenhum">
````

````

### work/rounds/R-0009/prompts/TASK-0010.md

```markdown
# Prompt de worker — `TASK-0010` (`transcriber-docs`)

> Você é um worker da orquestra `portal-backend`, rodada `R-0009`, na worktree
> `/Volumes/Thiamat II/stech/detran-worktrees/portal-backend`. Você executa **uma** tarefa, dentro de
> uma fronteira de escrita, e entrega um relatório. Você **nunca** executa `git` (nem `add`, nem
> `commit`, nem `stash`), nunca instala pacotes (não rode `pnpm install`), nunca edita arquivos
> gerados à mão, nunca altera testes para passarem. Se algo impedir a tarefa, pare e escreva o bloqueio no relatório.

## Papel

Papel constitucional (Art. 6): **Architect (transcrição)**. Declare-o na primeira linha da sua resposta.
Manual do perfil: `docs/meta/agents/transcriber-docs.md` — leia-o primeiro; ele define o que você
pode e não pode tocar e o formato da entrega.

## Contexto da frente (o que você precisa saber, já resumido)

WP-P0…P3 do Portal (`docs/framework/arch/portal-build-pack.md`), rodada R-0009. As decisões **M1–M23** de
`work/rounds/R-0009/plan.md` §Decisões e os contratos `work/rounds/R-0009/contracts/CTG-000n.md` são o contrato: você
transcreve, não reinterpreta. O domínio `portal` tem cinco pacotes gerados por TASK-0002 (`@detran/portal-identity`,
`@detran/portal-requests`, `@detran/portal-inbox`, `@detran/portal-citizen-service`, `@detran/portal-projections`;
DDL 61…65, DDL manuscrito 19/14/11) e `portal/complaints` (PEC, intocável). Banco da rodada: `source work/rounds/R-0009/env-detran-r9.sh`
(`detran_r9`, já com DDL aplicado). Erros: `PortalError extends DetranError` (prefixo `PORTAL.`, catálogo
`docs/framework/arch/portal-error-catalog.md`). Perfil de teste: `DETRAN_RUNTIME_PROFILE=test`, `DETRAN_LOCAL_ROLES`,
`DETRAN_LOCAL_ASSURANCE_LEVEL`, `DETRAN_LOCAL_CPF` (M3), tenant local `00000000-0000-7000-8000-000000000001`.

Última tarefa da rodada: você transcreve o que foi entregue (CTG-0001 e CTG-0002) nos documentos de arquitetura e conhecimento. Nada de decisão nova:
toda lacuna vira OD. Os números de PR são fornecidos pelo maestro no fim deste prompt (§Dados do maestro).

## Leitura obrigatória (lista fechada — não leia além dela)

- `AGENTS.md`; `docs/meta/agents/transcriber-docs.md`; `docs/meta/knowledge-base/conventions.md`
- `work/rounds/R-0009/plan.md` (Metas 5, Decisões M2, M8, M11, M12, M14, M16, M17, M23, Concorrência), `work/rounds/R-0009/reports/TASK-000{1..9}.md` (OD propostas e divergências)
- `work/rounds/R-0009/contracts/CTG-0001.md` §13, `CTG-0002.md` §15 (divergências e OD)
- `docs/framework/arch/portal-build-pack.md` (inteiro); `docs/meta/agents/orchestra/README.md` §9 (correções pendentes nos build packs)
- `docs/meta/adr/ADR-0019-*.md`, `ADR-0024-*.md`, `docs/meta/adr/README.md`
- `docs/framework/arch/portal-route-contract.md` §11; `docs/framework/arch/portal-error-catalog.md` (só para citar códigos)
- `docs/meta/knowledge-base/open-decisions-rait.md` (formato das OD-T do R-0008, §F) — as OD do Portal vão para uma seção nova no mesmo formato **no build pack §4** (tabela OD-P), pois não existe `open-decisions-portal.md`
- `docs/meta/knowledge-base/backlog.md` (§"Pacote PORTAL" e §"Handoffs de engenharia")
- `docs/meta/knowledge-base/decision-closure-plan.md` (linhas PORTAL: OD-P01…P13 — atualize o estado das fechadas nesta rodada: OD-P13)

## Pode tocar

- `docs/framework/arch/portal-build-pack.md` (§1 estado, §2 WP-P0…P3 marcados executados com PR e o que ficou fora, §3 nota sobre R-0007, §4 OD-P14…P21 + revisões de P02/P13, correções de comandos de gate)
- `docs/meta/adr/ADR-0019-*.md` (só acrescentar "Implementation: PR #n (R-0009)" no Status, padrão das ADRs já implementadas — confira ADR-0016)
- `docs/framework/arch/portal-route-contract.md` (só §11 e o `updated` do front-matter, se um mapeamento mudou — ex.: `junta_medica` fora do catálogo desta rodada)
- `docs/meta/knowledge-base/backlog.md` (linhas do Portal: entregue, pendências R-0007/R-0014, OD)
- `docs/meta/knowledge-base/decision-closure-plan.md` (linha OD-P13 → fechada; OD-P02 → fechada por H.50 com risco)
- `docs/meta/knowledge-base/import-manifest.json` **só** se `docs:kb:check` exigir e o aumento for explicado no relatório

## Não pode tocar

Código, testes, blueprints, DDL, seeds, workflows/regras/casos de uso do corpus, ADR-0024 (já escrita), `waves.md` (é do maestro), `plan.md`.

Além disso: `docs/framework/product/**` (corpus de produto), `record/`, `.devai/`, `docs/meta/adr/`, arquivos com cabeçalho
"Generated from BP-…", `plan.md`, `tasks/`, `prompts/`, `contracts/`, `pnpm-lock.yaml`.

## Tarefa (o quê, não o como)

1. Build pack: §1 "Estado de partida" ganha "Estado em 2026-09-16 (R-0009)"; §2 WP-P0…P3 com "Executado em R-0009 (PR #a, #b)" + o que ficou fora (delegações reais R-0007,
   SNE real/privacy/documentos assinados R-0014, `junta_medica`); §3 diagrama inalterado + nota; §4 OD-P14…P21 (texto das OD vindo dos relatórios/contratos, decisor, premissa adotada);
   correções de comandos inexistentes citados pelo build pack (`orchestra/README.md` §9) substituídos pelos reais de `package.json`.
2. ADR-0019 status; route contract §11; backlog; closure plan.
3. Gates abaixo. Relatório com lista fonte → arquivo.

## Definições que valem como contrato (copiadas das fontes; não reinterprete)

- OD-P14 (unificar `portal/complaints` PEC × `manifestation`, M2), OD-P15 (credenciais gov.br), OD-P16 (adesão SNE real via adapter), OD-P17 (privacy endpoint),
  OD-P18 (balcão da ouvidoria — DASHBOARD R-0011), OD-P19 (`junta_medica`/PEC e projetores BOAT/PEC), OD-P20 (tokens sem tradução cidadã), OD-P21 (operações ausentes nas portas nacionais) —
  textos finais nos relatórios/contratos; se um deles não foi levantado, registre "não aberta nesta rodada" em vez de inventar conteúdo.

## Dados do maestro

(preenchido pelo maestro antes do disparo: números dos PRs de CTG-0001 e CTG-0002, sha dos merges, lista final de OD com texto)

## Critérios de aceitação (todos precisam passar)

- `pnpm format:check` → verde.
- `node tools/docs/kb/check.mjs` → OK sem aumento de baseline (ou aumento explicado).
- `pnpm docs:kb:publish-check` → OK.

Formato de cada critério: comando exato → resultado esperado.

## Regras que não admitem exceção

1. Nenhum valor inventado: prazo, papel, estado, código de erro, rótulo ou parâmetro sem fonte nas
   definições acima vira `source_pending` no catálogo (`docs/framework/arch/parameter-catalogue.md`)
   ou uma questão `OD-*` no relatório; nunca constante silenciosa.
2. Código gerado não se edita (ADR-0007); comportamento manuscrito vai em `src/handwritten/` ou
   nos arquivos listados em "Pode tocar".
3. Tokens de estado, timer, papel e erro vêm dos catálogos citados; a UI só traduz rótulos.
4. Nada fala com SENATRAN fora de `packages/senatran-adapter` (ADR-0003).
5. Fixtures canônicas (`backend/database/seed/`); não crie tenants nem personas próprias fora do prefixo M22.
6. Prettier: `node_modules/.bin/prettier --write <arquivos que tocou>` antes de entregar.
7. Specs nunca contêm chaves do catálogo de parâmetros como literal (`portal.*`, `privacy.*`, `collection.*` — `verify:parameter-catalogue`).
8. Nunca `it.skip`; `it.todo` só com `OD-*` ou R-0007 citados no nome. Nunca deixe `pnpm check`/`vitest` em segundo plano ao entregar.

## Entrega (relatório em Markdown, este formato, nada além dele)

```markdown
Papel: <Art. 6>
Tarefa: TASK-0010
Arquivos criados/alterados: <lista com caminho>
Comandos executados e saída resumida: <um por linha, com o resultado>
Critérios de aceitação: <cada um com PASS/FAIL>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids, ou "nenhuma">
Bloqueios: <ou "nenhum">
````

```

```
