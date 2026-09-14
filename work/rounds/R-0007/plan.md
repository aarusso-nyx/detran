# R-0007 — frente `rait-backend` (WP-B + WP-C do RAIT: rotas de comando, motor de prazos, SSE e contratos de comando)

**Status:** planejado em 2026-09-14 pelo Architect; aguarda abertura por um maestro GPT-5.6 Sol
(prompt em `prompts/00-maestro.md`). Reviewer: Opus 5 via `tools/orchestra/bridge.sh claude`
(escalar para Fable 5.1 no `delivery-review` dos grupos que mudam `policy.ts`).
**Depende de:** `rait-model` (R-0006) e `ops-agency` (R-0005) em `main`.
**Janelas previstas:** 4 (um grupo acoplado por janela; cada grupo é um PR).

## Metas

1. **Comandos por módulo** em `src/handwritten/` (rait-build-pack WP-B, tabela por módulo):
   - `rait-case`: `POST cases/{id}/commands/{admit|non-admission|remit|receive|ready|decide|return-draft|withdraw|redirect|resolve-pending}`;
     `POST pools/{id}/claim-next`; `POST inquiries/{id}/commands/{answer|extend|expire}`.
   - `rait-worklist`: `POST batches`, `…/draw`, `…/approve`, `…/items/{caseId}/{accept|impediment}`;
     `POST assignments/{id}/commands/reassign`; `PATCH clock-alerts/{id}`; `POST schedules` + `…/publish`;
     `POST units` + `…/activate`.
   - `rait-session`: `POST sessions/{id}/commands/{close-agenda|open|adjourn|convene-extraordinary}`;
     `POST agenda-items/{id}/commands/{read|view|withdraw|proclaim}`; `POST votes`; `POST minutes`, `…/sign`, `…/publish`.
   - `infraction`: `POST infractions/{id}/commands/{issue-notice|indicate-driver|declare-extinction|authority-appeal|waive-appeal}`;
     consumidores de eventos (`AIT_INTEGRADO`, `RAIT_*`, `PAGAMENTO_CONFIRMADO`); **motor de timers**
     (job idempotente sobre `@detran/inf-deadlines`, calendário, `rait-deadline-engine.md`).
   - `org`/`finance`: `POST suspension-acts`; `POST jeton-sheets` + `…/approve`; `POST exports` + `…/approve`;
     `POST collection-documents`; `POST payments/reconcile`; `POST refund-orders`; `POST debt-handoffs`
     (`PUT parameters/{key}` já existe desde R-0004 em `ops/parameter`).
   - `integrations`: `GET integrations/outbox`, `POST integrations/outbox/{id}/retry`, `POST integrations/reconciliations`.
   - `stream`: `GET /v1/inf/rait/stream` (SSE; eventos de `rait-events-sse-contract.md`).
     Cada endpoint: `@Resource('inf:rait-<recurso>') @Action('<verbo>') @Audit(...)`, guarda de estado
     (`infraction_transition_ref` / tabela de transições do caso), `If-Match`/`ETag`, `Idempotency-Key`,
     erros do `rait-error-catalog.md`, envelope `StynxError` → `DetranError` compartilhado com prefixo
     por app (`backend/domains/shared/src/errors/`; o TEAT reutiliza em R-0008).
2. **Política**: `RAIT_COMMAND_RULES` cobre 100 % dos pares recurso/ação acima; teste
   `policy-routes.spec.ts` (rota ⇔ regra, nos dois sentidos) em `backend/app/tests/`.
3. **Contratos de comando** (WP-C): `docs/framework/contracts/BP-INF-RAIT-{CASE,WORKLIST,SESSION,INFRACTION,ORG,FINANCE,INTEGRATION}-001.commands.openapi.json`
   com `requestBody` (schema, obrigatoriedade, enums por FK de referência), `responses` (200 recurso +
   `events[]`; 4xx com `code` enumerado do catálogo), headers, exemplos válidos e inválidos (ids das fixtures).
4. **Gates novos** (fecham as lacunas de `orchestra/README.md` §9): `tools/contracts/check-commands.mjs`
   (valida os `.commands.openapi.json` contra os controladores manuscritos e o catálogo de erros) ligado
   a `pnpm contracts:check`; script `contracts:clients` (`openapi-typescript` como devDependency
   raiz, saída em `packages/api-clients/` ou pasta equivalente decidida na TASK-0001) que gera sem erro.
5. Documentação: `rait-build-pack.md` §WP-B/§WP-C executados (gates reescritos com os comandos reais);
   `rait-web-frontend.md` §11 (pré-requisitos de release) atualizado; backlog.

## Tarefas

| Tarefa    | Papel        | Perfil              | Modelo/esforço | Lock                                                                          | Depende de                  | Entrega                                                                                                                                                                                   |
| --------- | ------------ | ------------------- | -------------- | ----------------------------------------------------------------------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TASK-0001 | Architect    | architect-blueprint | Terra / alto   | `MOD-shared-errors`, `MOD-tools-contracts`                                    | —                           | `DetranError` (contrato), formato dos `.commands.openapi.json`, desenho de `check-commands.mjs` e `contracts:clients`, tabela de transições do caso ([WF-RAIT-001]) e guardas por comando |
| TASK-0002 | Inspector    | inspector-tests     | Luna / médio   | `MOD-rait-case-tests`                                                         | TASK-0001                   | testes unit+integração dos comandos de `rait-case` (matriz de transição completa, `If-Match`, idempotência, erros)                                                                        |
| TASK-0003 | Engineer     | engineer-backend    | Luna / médio   | `MOD-rait-case`, `MOD-shared-policy`                                          | TASK-0002                   | comandos de `rait-case` + regras faltantes; testes verdes                                                                                                                                 |
| TASK-0004 | Inspector    | inspector-tests     | Luna / médio   | `MOD-rait-worklist-tests`, `MOD-rait-session-tests`                           | TASK-0001                   | testes de `rait-worklist` (sorteio determinístico por semente, `T-CLAIM`, escala) e `rait-session` (agenda, votos, ata)                                                                   |
| TASK-0005 | Engineer     | engineer-backend    | Luna / médio   | `MOD-rait-worklist`, `MOD-rait-session`, `MOD-shared-policy`                  | TASK-0004                   | comandos dos dois módulos; testes verdes                                                                                                                                                  |
| TASK-0006 | Inspector    | inspector-tests     | Terra / alto   | `MOD-inf-infraction-tests`                                                    | TASK-0001                   | testes do motor de timers (calendário, suspensão, teto, idempotência do job) e dos comandos da infração; consumidores de eventos                                                          |
| TASK-0007 | Engineer     | engineer-backend    | Terra / médio  | `MOD-inf-infraction`, `MOD-inf-deadlines`                                     | TASK-0006                   | comandos da infração, consumidores, job de timers; testes verdes                                                                                                                          |
| TASK-0008 | Inspector    | inspector-tests     | Luna / médio   | `MOD-rait-org-tests`, `MOD-rait-finance-tests`, `MOD-rait-integration-tests`  | TASK-0001                   | testes org/finance/integrations/SSE                                                                                                                                                       |
| TASK-0009 | Engineer     | engineer-backend    | Luna / médio   | `MOD-rait-org`, `MOD-rait-finance`, `MOD-rait-integration`, `MOD-rait-stream` | TASK-0008                   | comandos org/finance/integrations + SSE; testes verdes                                                                                                                                    |
| TASK-0010 | Engineer     | engineer-backend    | Luna / baixo   | `MOD-contracts-commands`, `MOD-tools-contracts`, `MOD-package-json`           | TASK-0003, 0005, 0007, 0009 | sete `.commands.openapi.json`, `check-commands.mjs`, `contracts:clients`; `policy-routes.spec.ts`                                                                                         |
| TASK-0011 | Owner deleg. | transcriber-docs    | Luna / baixo   | `MOD-docs`                                                                    | TASK-0010                   | build pack, `rait-web-frontend.md` §11, backlog                                                                                                                                           |

CTG-0001 = 0001…0003; CTG-0002 = 0004/0005; CTG-0003 = 0006/0007; CTG-0004 = 0008…0010. Um PR por CTG.

## Critérios de aceitação (comandos → resultado)

- `pnpm verify:decorators` → OK (todo comando com `@Resource/@Action/@Audit`).
- `pnpm --filter @detran/shared test` → verde, incluindo `policy.spec.ts` com 100 % dos pares
  `inf:rait-*:<verbo>` desta frente; `pnpm backend:test:e2e` inclui `policy-routes.spec.ts` verde.
- `pnpm --filter @detran/inf-rait-case test:unit|test:integration` (idem worklist, session,
  infraction, org, finance, integration) → verdes; `pnpm backend:test:ci` → verde.
- `pnpm contracts:check` → OK com os `.commands.openapi.json`; `pnpm contracts:clients` → gera sem erro.
- `pnpm verify:senatran-boundary` → OK (integrações só via `packages/senatran-adapter`).
- `pnpm check` → verde; `node tools/docs/kb/check.mjs` → 521/446.

## Mapa entregável → definições

| Entregável | Definição                                                                                                                                |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| comandos   | `rait-web-frontend.md` §7 (33 ações) e §11; [UC-RAIT-001…043]; [WF-RAIT-001] (caso), [WF-RAIT-003] (sessão), [WF-RAIT-004] (organização) |
| infração   | [WF-INF-003] §2 (`infraction_transition_ref`); [WF-INF-002] §9.2; ADR-0014/0016                                                          |
| prazos     | `rait-deadline-engine.md`; steering H.46/H.47; `parameter-catalogue.md`                                                                  |
| financeiro | ADR-0017; UC-RAIT-032…035; H.53                                                                                                          |
| erros      | `rait-error-catalog.md` (§1 envelope, §3–§4 por comando)                                                                                 |
| SSE        | `rait-events-sse-contract.md`                                                                                                            |
| payloads   | `rait-build-pack.md` §0 "Convenções de payload"; contratos OpenAPI gerados em `docs/framework/contracts/`                                |
| política   | `policy.ts` `RAIT_COMMAND_RULES`/`RAIT_SURFACE_RULES`; ADR-0015                                                                          |

## Riscos

- Frente longa: cada CTG é um PR mesclável por si; o maestro grava `checkpoint` ao fim de cada janela.
- `policy.ts` é lock com `teat-backend` (R-0008, onda 3): as duas frentes só tocam blocos distintos
  (`RAIT_*` × `TEAT_RULES`/`OPS_SURFACE_RULES`); a segunda a mesclar rebaseia.
- `DetranError` nasce aqui e é consumido por R-0008: publicar em `@detran/shared` no CTG-0001 e
  mesclar cedo.
- Nunca calcular prazo fora de `@detran/inf-deadlines` ([RN-RAIT-005]).

## Bloqueios

(nenhum)

## Retomada

(vazio)

## Leitura

(preenchido pelo maestro)
