---
id: ARCH-RAIT-BUILD-PACK
title: Pacote de construção do RAIT — definições para a orquestra de agentes (modelo de dados, rotas, payloads, telas, formulários, hierarquia)
status: draft
apps: [rait]
updated: 2026-09-12
---

# Pacote de construção do RAIT

Índice único das definições que amparam uma orquestra de agentes menores (Terra/Opus/Sonnet) na
produção dos seis entregáveis A–F abaixo. Cada pacote de trabalho (WP) diz **o que ler**, **o que
produzir**, **em que papel da Constituição** (Art. 6) e **qual gate** fecha. Nada aqui substitui os
artefatos de produto: quando divergirem, vale `docs/framework/product/`.

## 0. Substrato e regras de todos os pacotes

| Item               | Definição                                                                                                                                                                                                                               |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Plataforma         | STYNX **1.3.1**, Angular **22.x**, NestJS 11, DEVAI **1.4.5**, Node 24, pnpm 9 (ADR-0013)                                                                                                                                               |
| Governança         | DEVAI (`pnpm devai:doctor`, `pnpm exec devai evidence record` a cada PR); PR-only; nunca enfraquecer gates; declarar papel Art. 6 no início de cada tarefa                                                                              |
| Geração            | módulos CRUD só por blueprint (`docs/framework/blueprints/*.json` → `pnpm blueprints:generate`; ADR-0007); comportamento (comandos, guardas, timers) em arquivos não gerados sob `src/handwritten/` exportados via `handwrittenExports` |
| Contratos          | OpenAPI gerado (`pnpm contracts:openapi`; ADR-0009); comandos documentados no mesmo contrato por extensão manual versionada (`docs/framework/contracts/BP-INF-RAIT-*.commands.openapi.json`, novo, verificado por `contracts:check`)    |
| Fronteira nacional | nenhuma chamada direta a SENATRAN/RENAINF/RENACH/SNE fora de `packages/senatran-adapter` (ADR-0003; `verify:senatran-boundary`)                                                                                                         |
| Vocabulário        | tokens canônicos: caso `WF-RAIT-001`, sessão `WF-RAIT-003`, organização `WF-RAIT-004`, infração `WF-INF-003` (persistido em `14-inf-lifecycle-vocabulary.sql`), timers `WF-INF-002` §9.2                                                |
| Papéis             | `RAIT_ROLES` em `roles.ts`; chaves `inf:rait-<recurso>:<ação>` em `policy.ts` (ADR-0013); `auth.role_catalog`                                                                                                                           |
| Erros              | `rait-error-catalog.md` — todo `throw` cita um código; envelope `StynxError`                                                                                                                                                            |
| Gate global        | `pnpm check` (format, kb, publish-check, blueprints, contracts, typecheck, ui test/build, decorators, rls-ddl, role-catalog, lifecycle-vocabulary, senatran boundary/contracts) + `pnpm backend:test:ci`                                |

### Convenções de payload (aplicam-se a C)

1. **Envelopes**: leitura devolve o recurso ou `{ items, total, page, pageSize }` (máx. 500 por
   página); erro devolve `StynxError` (§1 do catálogo de erros).
2. **Concorrência**: todo comando exige `If-Match: "<updated_at ISO ou version>"`; resposta traz
   `ETag`. Ausente → `428 RAIT.IF_MATCH_REQUIRED`; divergente → `412 RAIT.VERSION_CONFLICT`.
3. **Idempotência**: comandos de criação e transições aceitam `Idempotency-Key` (kernel
   `@stynx-nyx/idempotency`); replay com payload diferente → `409 RAIT.IDEMPOTENCY_REPLAY`.
4. **Tempo**: `timestamptz` em ISO-8601 UTC; datas civis (`*_on`) em `YYYY-MM-DD`; nunca prazos
   calculados no cliente (`RN-RAIT-005`).
5. **Enums**: exatamente os tokens dos contratos/DDL; `400 RAIT.ENUM_INVALID` fora deles.
6. **Comandos**: `POST /v1/inf/rait/<coleção>/{id}/commands/<verbo>` com corpo `{ reason?,
legalBasis?, …campos do comando }`; resposta `200` com o recurso pós-transição e `events[]`
   emitidos.
7. **Identidade**: `tenant_id` nunca no payload (vem do contexto STYNX/RLS); ids `uuid`.
8. **Auditoria**: todo comando tem `@Audit({ action: 'INF_RAIT_<RECURSO>_<VERBO>', entity })`
   (`verify:decorators`).

## 1. Pacotes de trabalho

### WP-0 — Migração do substrato (Engineer)

| Ler                                                                                            | Produzir                                                                                                                                                                                 | Gate                                                                  |
| ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `wp0-stynx-1-3-1-migration.md`; ADR-0013; `packages/ui/package.json`; `backend/*/package.json` | pins `@stynx-nyx/*@1.3.1`; `@detran/ui` peer `>=22 <23`, Angular/ng-packagr 22 dev; `pnpm-lock.yaml`; ajustes de tipos se houver; `AGENTS.md`/`README.md` sem a ressalva "pins em 1.1.1" | `pnpm check`, `pnpm backend:test:ci`, `pnpm --filter @detran/ui test` |

### WP-A — Complementos do modelo de dados (Architect → Engineer)

Entregável **A**. Ler: ADR-0012 §Consequências, `WF-INF-003` §1-§6, `WF-INF-002` §9.2,
`WF-RAIT-004` §10 (deltas do worklist), `14-inf-lifecycle-vocabulary.sql`, `05-role-catalog.sql`,
`module-blueprint.schema.json`, blueprints RAIT existentes.

| Blueprint (novo/alterado)                     | Entidades                                                                                                                                                                                                                                                                                                                                                                                                                                               | Observações                                                                                                        |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `BP-INF-INFRACTION-001` (novo)                | `infraction` (state FK `infraction_state_ref`, substate, subject_kind, `efeito_suspensivo`, `pago`, `faixa`, `pontuacao_registrada`, `motivo_encerramento`, `bandeira_risco`, `ait_id`), `infraction_notice` (NA/NP/decisão: canal FK, expedição, ciência, data-limite impressa), `infraction_timer` (code FK `infraction_timer_ref`, started_on, due_on, ceiling_on, status, suspended_by_act), `infraction_event` (append-only), `infraction_payment` | depende de `@detran/inf-ait`, `@detran/inf-rait-case`; check de `state` = mesmo conjunto de `infraction_state_ref` |
| `BP-INF-RAIT-WORKLIST-001` v1.1.0             | + `rait_unit` (turma: estado `TURMA_*`, coordenador), `rait_schedule`/`rait_schedule_slot` (escala, plantão, `WIP`), `rait_batch`/`rait_batch_item` (lote de sorteio, semente, ata, `T-CLAIM`), `rait_substitute_duty` (plantão de suplência), `rait_impediment.kind` + `decided_by`, `rait_bench` (banca da sessão)                                                                                                                                    | `WF-RAIT-004` §10                                                                                                  |
| `BP-INF-RAIT-SESSION-001` v1.1.0              | `rait_session.modality`, `short_notice_ack`; `rait_agenda_item.view_requested_by/view_due_on`; `rait_minutes.published_at`                                                                                                                                                                                                                                                                                                                              | OD-102, OD-103, OD-106                                                                                             |
| `BP-INF-RAIT-CASE-001` v1.1.0                 | `rait_case.legal_priority`, `unit_id`, `version`; `rait_pending_content`; `rait_redirect`; `rait_draft` (minuta versionada, autor)                                                                                                                                                                                                                                                                                                                      | UC-RAIT-027/028; IU-RAIT-001 §3                                                                                    |
| `BP-INF-RAIT-ORG-001` (novo)                  | `rait_parameter` (versionado, `legal_readonly`, `source_pending`), `rait_holiday`, `rait_suspension_act`, `rait_jeton_sheet`/`rait_jeton_line`, `rait_incident`, `rait_quality_sample`, `rait_capacity_plan`, `rait_export`                                                                                                                                                                                                                             | UC-RAIT-022/025/036/038/042/043                                                                                    |
| `BP-INF-RAIT-FINANCE-001` (novo)              | `rait_collection_document`, `rait_payment`, `rait_refund_order`, `rait_debt_handoff`                                                                                                                                                                                                                                                                                                                                                                    | UC-RAIT-032…035; faixas FK `infraction_payment_tier_ref`                                                           |
| `BP-INF-RAIT-INTEGRATION-001` (novo, leitura) | projeções da `integration.outbox` por sistema (`renainf`, `renach`, `sne`), `rait_reconciliation`                                                                                                                                                                                                                                                                                                                                                       | ADR-0003                                                                                                           |

Também em WP-A: manter os novos DDL gerados na lista de `backend/database/apply.sh` (os `34…37` já
foram incluídos em 2026-09-13) e acrescentar fixtures por estado em `backend/database/seed/`. Gate: `pnpm blueprints:check`, `verify:rls-ddl`,
`verify:lifecycle-vocabulary`, `backend:db:apply` em banco limpo.

### WP-B — Rotas faltantes no backend (Engineer; Architect revisa guardas)

Entregável **B**. Ler: `rait-web-frontend.md` §7 (33 ações) e §11, `rait-error-catalog.md`,
`RAIT_COMMAND_RULES` em `policy.ts`, `WF-RAIT-001` (transições do caso), `WF-RAIT-003`,
`WF-INF-003` §2 (`infraction_transition_ref`). Produzir, em `src/handwritten/` de cada módulo:

| Módulo        | Endpoints de comando                                                                                                                                                                                                                             |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| rait-case     | `POST cases/{id}/commands/{admit\|non-admission\|remit\|receive\|ready\|decide\|return-draft\|withdraw\|redirect\|resolve-pending}`; `POST pools/{id}/claim-next`; `POST inquiries/{id}/commands/{answer\|extend\|expire}`                       |
| rait-worklist | `POST batches`, `…/draw`, `…/approve`, `…/items/{caseId}/{accept\|impediment}`; `POST assignments/{id}/commands/reassign`; `PATCH clock-alerts/{id}` (acknowledge); `POST schedules` + `…/publish`; `POST units` + `…/activate`                  |
| rait-session  | `POST sessions/{id}/commands/{close-agenda\|open\|adjourn\|convene-extraordinary}`; `POST agenda-items/{id}/commands/{read\|view\|withdraw\|proclaim}`; `POST votes`; `POST minutes`, `…/sign`, `…/publish`                                      |
| infraction    | `POST infractions/{id}/commands/{issue-notice\|indicate-driver\|declare-extinction\|authority-appeal\|waive-appeal}`; consumidores de eventos (`AIT_INTEGRADO`, `RAIT_*`, `PAGAMENTO_CONFIRMADO`); motor de timers (job idempotente, calendário) |
| org / finance | `PUT parameters/{key}`; `POST suspension-acts`; `POST jeton-sheets` + `…/approve`; `POST exports` + `…/approve`; `POST collection-documents`; `POST payments/reconcile`; `POST refund-orders`; `POST debt-handoffs`                              |
| integrations  | `GET integrations/outbox`, `POST integrations/outbox/{id}/retry`, `POST integrations/reconciliations`                                                                                                                                            |
| stream        | `GET /v1/inf/rait/stream` (SSE; eventos §8 da especificação) sobre `integration.outbox`/notifications do kernel                                                                                                                                  |

Cada endpoint: `@Resource('inf:rait-<recurso>') @Action('<verbo>') @Audit(...)`, guarda de estado
com `infraction_transition_ref`/tabela de transições do caso, `If-Match`, erros do catálogo,
testes unit + integration (tiers do vitest gerado). Gate: `verify:decorators`, `contracts:check`,
`backend:test:ci`, matriz de política cobre 100% dos pares recurso/ação (`policy.spec.ts`).

### WP-C — Formato de todos os payloads (Engineer, Sonnet-friendly)

Entregável **C**. Ler: contratos OpenAPI gerados, §0 "Convenções de payload", `rait-error-catalog.md`
§1, comandos de WP-B, formulários da especificação §9. Produzir
`docs/framework/contracts/BP-INF-RAIT-*.commands.openapi.json` (um por módulo) com, para cada
comando: `requestBody` (schema, obrigatoriedade, enums por FK de referência), `responses` (200
recurso + `events[]`; 4xx com `code` enumerado do catálogo), headers (`If-Match`,
`Idempotency-Key`, `ETag`), exemplos válidos e inválidos. Gate: `contracts:check` estendido para
os arquivos `.commands.openapi.json`; `openapi-typescript` gera clientes sem erro.

### WP-D — Telas e componentes de todas as jornadas (Owner/UX → Engineer)

Entregável **D**. Ler: `IU-RAIT-001`, `rait-web-frontend.md` §4-§6, `rait-web-structure-diagrams.md`
(D2-D5), `rait-web-journeys/JW-01…12`. Produzir, por rota da §4, uma ficha de tela
(`docs/framework/product/domains/inf/rait/screens/IU-RAIT-<rota>.md`, ids `IU-RAIT-002…`): objetivo,
papel, resolver/dados, layout (top-level e nested), componentes compartilhados usados (§5.2),
ações e comandos, estados de carregamento/vazio/erro (códigos do catálogo), atalhos, LGPD (campos
suprimidos por papel), critérios de aceitação ligados aos `AC-RAIT-*`. Gate: `pnpm docs:kb:check`
(tokens canônicos, brackets resolvem), revisão do Owner (status `reviewed`).

### WP-E — Formulários, campos, validações e gates de transição (Engineer)

Entregável **E**. Ler: especificação §9 (16 formulários), `rait-error-catalog.md` (mapeamento erro
→ campo), regras `RN-RAIT-*` citadas, `infraction_transition_ref` e a tabela de transições do caso.
Produzir `apps/rait/web/src/app/forms/<formulario>.schema.ts` (Zod ou `FormGroup` tipado) por
formulário com: campo, tipo, obrigatoriedade condicional, máscara, validação de forma (cliente) e
o código de erro de negócio esperado do servidor, e o **gate de transição** (pré-estado, papel,
pré-condições, comando, pós-estado) como tabela no cabeçalho do arquivo e em
`docs/framework/arch/rait-web-forms.md` (consolidado). Gate: testes unitários dos schemas; nenhum
prazo legal calculado no cliente (`RN-RAIT-005`, lint rule).

### WP-F — Hierarquia de componentes/rotas e mapeamento nos módulos (Engineer)

Entregável **F**. Ler: especificação §2, §4, §5, §12; diagramas D1-D5, D7. Produzir o esqueleto
de `apps/rait/web` (Angular 22, `provideDetranAuthenticatedApp`): `app.routes.ts` com a árvore
exata da §4 (títulos, `canMatch` por papel, resolvers), uma pasta por módulo em `features/`,
`shared/` com os 22 componentes de domínio (assinatura de inputs/outputs da §5.2), `data/api/*`
clientes gerados, `core/` (shell, SSE, atalhos, error boundary), `i18n/pt-BR.json` com
`rait.errors.*` do catálogo; páginas de módulos pendentes renderizam "indisponível nesta versão".
Gate: `ng build` sem warnings de rota; teste de roteamento cobre cada rota da §4 com o papel
mínimo; `pnpm --filter @detran/rait-web test`.

## 2. Ordem e paralelismo sugeridos

```text
WP-0 ──► WP-A ──► WP-B ──► WP-C ──┐
              └──► WP-D ──► WP-E ──┼──► WP-F ──► integração (SSE, assinatura, integrações)
```

WP-A e WP-D podem correr em paralelo após WP-0; WP-B depende de WP-A (entidades) e WP-C de WP-B;
WP-E depende de WP-C e WP-D; WP-F consolida. Agentes menores (Sonnet) servem para WP-C, WP-D e
WP-E, que são transcrição fiel de definições já fechadas; WP-A e WP-B pedem Opus/Terra (decisões
de modelagem e guardas de estado).

## 3. Mapa entregável → documentos de definição

| Entregável | Definições que o amparam                                                                                                                                                                                                                                                  |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A          | ADR-0012, ADR-0013, `WF-INF-003`, `WF-INF-002` §9, `WF-RAIT-004` §10, `14-inf-lifecycle-vocabulary.sql`, `05-role-catalog.sql`, blueprints existentes, `module-blueprint.schema.json`                                                                                     |
| B          | `rait-web-frontend.md` §7/§8/§11, `rait-error-catalog.md`, `policy.ts` (`RAIT_COMMAND_RULES`), `WF-RAIT-001…003`, `infraction_transition_ref`, `UC-RAIT-001…043`                                                                                                          |
| C          | contratos OpenAPI gerados, §0 convenções, `rait-error-catalog.md` §1, `rait-web-frontend.md` §9                                                                                                                                                                           |
| D          | `IU-RAIT-001`, `rait-web-frontend.md` §4-§6, `rait-web-structure-diagrams.md`, `rait-web-journeys/`, `JRN-RAIT-001…004`                                                                                                                                                   |
| E          | `rait-web-frontend.md` §9, `rait-error-catalog.md` §3-§4, `RN-RAIT-001…143`, tabelas de transição (caso, sessão, infração)                                                                                                                                                |
| F          | `rait-web-frontend.md` §2, §4, §5, §12, §13; diagramas D1-D7; ADR-0006; ADR-0013                                                                                                                                                                                          |
| todos      | `docs/meta/knowledge-base/open-decisions-rait.md` — o que está aberto e a premissa adotada (nunca inventar um valor: parâmetro "pendente de fonte")                                                                                                                       |
| todos      | manuais por perfil (`docs/meta/agents/`), `CODESTYLE.md`, `rait-test-strategy.md`, `rait-fixtures.md` + `backend/database/seed/`, `rait-deadline-engine.md`, `rait-events-sse-contract.md`, `detran-ui-guide.md`, `rait-i18n-glossary.md`, `wp0-stynx-1-3-1-migration.md` |

## 4. Definições de pronto por pacote

- Código gerado nunca editado à mão; provenance header presente.
- Cada PR: papel declarado, `pnpm check` verde, `pnpm exec devai evidence record`, sem tokens.
- Nenhuma tela, rota, comando ou erro fora dos documentos deste pacote; a mudança começa pelo
  documento (Owner/Architect) e só depois pelo código.
- Toda questão de `open-decisions-rait.md` tocada pelo pacote aparece como parâmetro "pendente de
  fonte" ou como premissa citada no código, nunca como constante silenciosa.

## 5. Fronteiras transversais (ADR-0014…0018, aceitas pelo Owner em 2026-09-13)

| ADR      | Módulo(s) que nascem                                                           | Entra em                   |
| -------- | ------------------------------------------------------------------------------ | -------------------------- |
| ADR-0014 | `inf/infraction`, `inf/notification`, `@detran/inf-deadlines`                  | WP-A, WP-B                 |
| ADR-0015 | `inf/collection` + port bancário mock                                          | WP-A, WP-B                 |
| ADR-0016 | facade `@detran/shared/documents`, `signature_policy`, templates               | WP-0 (montagem), WP-A      |
| ADR-0017 | `portal/identity`, `portal/requests`, `portal/inbox`, `portal/citizen-service` | pacote do Portal (a criar) |
| ADR-0018 | projeções por consumidor + gate `verify:domain-boundaries`                     | WP-P (novo, após WP-B)     |

Com a aceitação, os módulos acima entram no escopo dos pacotes indicados; os blueprints são
criados pelo Architect-blueprint na ordem ADR-0014 e 0016, depois 0015 e 0018, e 0017 por último.
