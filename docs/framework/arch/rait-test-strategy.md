---
id: ARCH-RAIT-TESTS
title: Estratégia de testes do RAIT — tiers, matriz obrigatória e gates de CI
status: draft
apps: [rait]
updated: 2026-09-13
---

# Estratégia de testes do RAIT

Define **o que cada tier cobre**, **o que é obrigatório por tipo de mudança** e **o que bloqueia
o CI**. Usa a infraestrutura que já existe: vitest 4 com tiers `unit | integration | e2e | real`
(`DETRAN_TEST_TIER`, gerado por blueprint), Postgres com RLS no job `backend-kernel`, gates
`tools/check-*.ts`, e `pnpm check`. Fixtures canônicas: `rait-fixtures.md`.

## 1. Tiers

| Tier          | Onde                                      | Banco                          | Cobre                                                                                                    | Roda em                                         |
| ------------- | ----------------------------------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `unit`        | `src/**/*.spec.ts`, `tests/unit/`         | nenhum (`Database` stubado)    | guardas de estado, validação de forma, `DeadlineEngine` com relógio fixo, política, mapeamento de erros  | todo PR (`pnpm backend:test:unit`)              |
| `integration` | `tests/integration/*.integration.spec.ts` | Postgres real, RLS forçada     | comando ponta a ponta no módulo (transação, eventos na outbox, RLS, triggers de tenant)                  | todo PR (`backend-kernel`)                      |
| `e2e`         | `tests/e2e/*.e2e.spec.ts`                 | Postgres real + app Nest       | HTTP → guarda de política → comando → resposta/erro; SSE                                                 | todo PR (`backend-kernel`)                      |
| `real`        | `tests/real/*.real.spec.ts`               | serviços reais (PostGIS, mock) | contratos com senatran-mock, assinatura, storage e, para BOAT, renderização, conversão e validação PDF/A | manual / noturno (`backend:test:real`)          |
| frontend      | `apps/rait/web/**/*.spec.ts`              | jsdom + fixtures JSON          | componentes (TestBed), roteamento por papel, facades, mapeamento de erros                                | todo PR (`pnpm --filter @detran/rait-web test`) |
| gates         | `tools/check-*.ts`, `docs/kb`             | —                              | decoradores, RLS no DDL, catálogo de papéis, vocabulário, fronteira SENATRAN, contratos, KB              | `pnpm check`                                    |

Todo teste com prazo usa relógio injetado (`Clock`/`vi.useFakeTimers`), calendário de feriados
das fixtures e datas fixas em ISO. Testes de tier `unit` nunca abrem conexão.

## 2. Matriz obrigatória por tipo de mudança

| Mudança                             | Testes obrigatórios                                                                                                                                                                                                                                                                                                                               |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Comando com guarda de estado (WP-B) | unit: (a) cada pré-estado permitido → pós-estado; (b) cada estado não permitido → `409 *_STATE_INVALID`; (c) cada regra de negócio → `422` com o `code` exato; (d) `If-Match` ausente → 428, divergente → 412; (e) eventos emitidos (nome, payload). integration: transação e outbox. e2e: 403 para um papel sem a chave, 200 para o papel mínimo |
| Regra em `policy.ts`                | `policy.spec.ts`: par recurso/ação permitido para cada papel listado e negado para pelo menos um papel RAIT fora da lista; contagem de chaves atualizada                                                                                                                                                                                          |
| Timer / `DeadlineEngine`            | unit com tabela de casos de `rait-deadline-engine.md` §7 (dias corridos, dias úteis, feriado no vencimento, data impressa, SNE ficta, suspensão, idempotência do vencimento); integration: job de vencimento gera transição + `TIMER_VENCIDO` uma única vez                                                                                       |
| Blueprint / DDL (WP-A)              | `blueprints:check`, `verify:rls-ddl`, `verify:lifecycle-vocabulary`; integration: `apply.sh --full` + `seed.sh` em banco limpo; teste de check constraint (estado inválido rejeitado)                                                                                                                                                             |
| Evento / SSE                        | unit: schema do payload (zod) para cada evento do contrato; e2e: assinatura do stream com `Last-Event-ID` recebe replay ordenado                                                                                                                                                                                                                  |
| Endpoint de leitura / lista         | e2e: paginação (limite 500), ordem única do backend, RLS cruzada (tenant B não vê tenant A)                                                                                                                                                                                                                                                       |
| Componente compartilhado (frontend) | TestBed: renderização com fixture, estados vazio/carregando/erro, acessibilidade básica (roles/labels), teclado quando aplicável                                                                                                                                                                                                                  |
| Rota (frontend)                     | roteamento: papel mínimo entra, papel sem acesso é redirecionado a "sem permissão", módulo pendente mostra "indisponível nesta versão"                                                                                                                                                                                                            |
| Formulário (WP-E)                   | schema: cada campo obrigatório/condicional, cada validação de forma, mapeamento `fields[]` → campo                                                                                                                                                                                                                                                |
| Integração (adapter/outbox)         | unit com adapter mock: 503 enfileira, 502 marca `FAILED` com `upstreamCode`, retry idempotente; `verify:senatran-boundary`                                                                                                                                                                                                                        |

## 3. Cobertura por máquina de estados

Cada tabela de transições vira **um arquivo de teste de matriz**, gerado a partir da tabela
canônica para que a cobertura seja auditável:

- Caso (`WF-RAIT-001`): `tests/unit/case-transitions.matrix.spec.ts` — itera as transições da §6.6
  da especificação do frontend e as guardas do módulo.
- Sessão (`WF-RAIT-003`): `tests/unit/session-transitions.matrix.spec.ts`.
- Infração (`WF-INF-003`): lê `inf.infraction_transition_ref` (via fixture JSON exportada do DDL) e
  exige um teste por `id` com `status='vigente'`; transições `a_confirmar` têm teste marcado com
  o `OD-nnn` correspondente e comportamento "alerta, não transição".
- Lote (`WF-RAIT-004` §5), banca (§6), turma (§7), disponibilidade (§3): um `describe` por máquina.

Critério: nenhuma linha `vigente` sem teste; o Inspector mantém a tabela "transição → teste" no
PR.

## 4. Política, RLS e LGPD

- `policy.spec.ts`: para cada `RAIT_COMMAND_RULES[i]`, permitido para os papéis listados e negado
  para `rait-analyst` quando não listado (o papel mais comum é o melhor controle negativo).
- RLS: teste integration por módulo que insere como tenant A e lê como tenant B → 0 linhas; rota
  de leitura com id de outro tenant → 404 (`RAIT.TENANT_MISMATCH`).
- LGPD: teste e2e que o `context` de erro e as listas nunca carregam texto livre de petição nem
  documento de terceiro (`RN-RAIT-134`, `RN-RAIT-137`); exportação nominal acima do limiar → 422.

## 5. Contratos

- `contracts:check` cobre CRUD gerado; os `*.commands.openapi.json` ganham teste que compara
  `operationId`s com os controllers em `src/handwritten/` (`tools/check-command-contracts.ts`,
  a criar em WP-C).
- Cliente gerado (`openapi-typescript`) compila no frontend: teste de tipo (`tsd`/`expectTypeOf`)
  para o payload de cada comando.

## 6. Dados de teste

- Somente fixtures canônicas (`backend/database/seed/*.sql`, `docs/framework/arch/fixtures/*.json`).
  Ids fixos (`00000000-0000-7000-8000-…`), um por estado/persona, listados em `rait-fixtures.md`.
- Testes que precisam de variação criam a partir da fixture com `override` explícito no nome do
  teste; nunca `randomUUID()` para entidades de domínio (só para isolamento de tenant em
  integration, como já faz `audit-persistence.integration.spec.ts`).
- Datas: "hoje" = `2026-09-14` nas fixtures; calendário de feriados de 2026 (nacional + AM + Manaus) em
  `docs/framework/arch/fixtures/calendar-2026.json`.

## 7. Gates de CI (bloqueantes)

| Job                 | Comandos                                                                                            | Novo nesta rodada                                                                                                                                                   |
| ------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `foundation`        | `pnpm check`, `docs:check`, `docs:security`, `devai doctor`                                         | `verify:role-catalog`, `verify:lifecycle-vocabulary` já dentro de `check`                                                                                           |
| `backend-kernel`    | `backend:db:reset`, `verify:decorators`, `backend:rls-smoke`, `blueprints:check`, `backend:test:ci` | acrescentar `bash backend/database/seed.sh` após o reset (WP-A) e `backend:test:matrix` (WP-B)                                                                      |
| frontend (novo)     | `pnpm --filter @detran/rait-web typecheck && test && build`                                         | WP-F cria o job                                                                                                                                                     |
| `evidence-gate`     | `devai evidence verify`                                                                             | —                                                                                                                                                                   |
| `boat-pdf-a` (novo) | `pnpm --filter @detran/app test:real`                                                               | TASK-0017 cria job bloqueante de PR: provisiona Chromium, o conversor PDF/A-2b aprovado e a imagem veraPDF por digest; cobre bytes positivos e inválidos sem `skip` |

Nunca: reduzir `testTimeout`, adicionar `passWithNoTests` a tiers com testes, `it.skip` sem `OD-nnn`.

O `e2e` BOAT confirma HTTP, política, tenant/RLS e falha fechada com runner injetável; não prova
conformidade. O `real` executa o caminho de produção e falha quando Chromium, Docker, a imagem
por digest ou o conversor aprovado não estiverem disponíveis. TASK-0017 também ajusta o timeout
do tier `real` para cobrir o launch do Chromium, a conversão e o timeout do veraPDF; o Inspector
nunca reduz timeout nem troca uma indisponibilidade por `skip`.

## 8. Definição de pronto de um teste

Nome "dado/quando/então"; fixture por id; relógio fixo; asserção no `code` do erro (não só no
status); eventos verificados por nome e payload; sem `console.log`; roda isolado e em qualquer ordem.
