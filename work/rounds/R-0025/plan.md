# R-0025 — frente `rait-web-wiring` (ação 6 da C-0002 — RAIT web: 64 comandos, `caseAccessGuard`, SSE canônico, formulários e rotas L0)

**Status:** pré-trabalho da Sessão A autorizado pela A-C2-15; somente
TASK-0001/0002/0003/0006 liberadas. A rodada integral aguarda os upstreams.
Planejada em 2026-09-26
pelo Architect (`work/campaigns/C-0002-consolidacao.md` §2, fase D). Maestro **Sol 6** (Codex CLI),
workers da escada Codex (Sol 6 / Terra / Luna, `model-ladder.md` após R-0018), reviewer **Opus 5.5**
pela ponte `tools/orchestra/bridge.sh claude` (OD-C2-003; ids de CLI confirmados no bootstrap).
Worktree `/Users/aarusso/.codex/worktrees/rait-web-wiring/detran`, branch
`orchestra/rait-web-wiring`. Rastreio: issue #122. `AUTHORIZATION.md`, `tasks/` e `compositions.json`
foram criados no bootstrap da Sessão A, depois da autorização direta.
**Concorrência (upstreams da campanha):**

- **Abertura:** R-0024 `stynx-dedup` publicada em `origin/orchestra/stynx-dedup` (abertura
  empilhada, §Execução OD-C2-005; o PR final espera o merge em `main`) (entrega `docs/framework/arch/frontend-wiring-pattern.md`,
  cliente de comando único, costura SSE única e shell em `@detran/ui`). Transitivamente: R-0022
  (pin STYNX 1.5.0, SSE de fonte única, assinatura final) e R-0023 (`StynxAuthorizationModule` como
  fonte única; `policy.ts` como dados). Fase A (R-0017 stack local, R-0018 índices, R-0019 corpus)
  e R-0020 (sensores, `round seal`) já em `main`.
- **Lock compartilhado (C-0002 §3.5):** os dois CTGs de backend desta rodada — CTG-0002 (caso e
  sessão) e CTG-0003 (worklist e organização), ambos em `MOD-shared-policy` e
  `backend/domains/inf/rait-*` — são **serializados** entre si, com os CTGs de R-0027
  `portal-delegations` e com o CTG-0003 de R-0026 `dashboard-wiring` (produtores RAIT) que tocam os
  mesmos locks. Sob a OD-C2-005, o lock não serializa PRs: cada rodada edita no seu branch e a regra
  de convivência e a ordem de merge recomendada estão em §Execução OD-C2-005. Os demais CTGs correm livres (lock `apps/rait/web` é exclusivo desta
  rodada).
- **Manifesto de disponibilidade:** forma e caminho fixados em
  `work/rounds/R-0030/availability-manifest.schema.md` (§1 caminho canônico, §3–§4 forma e JSON
  Schema, §6 selos, §7 obrigações da fase D). Superfície desta rodada: `rait-web`. O CTG-0006
  espera por esse anexo se não estiver em `main`.

**Janelas previstas:** 5 (1 planejamento + CTG-0001; 1 CTG-0002, com TASK-0006 e TASK-0009 em
paralelo; 1 CTG-0003, com TASK-0010 em paralelo; 1 CTG-0004 (engenharia dos comandos no app); 1
CTG-0005/0006). Antes da OD-R25-001: 4.

**Análise de lacunas (OD-R25-001):** `work/rounds/R-0025/command-gap-analysis.md` (Architect,
2026-09-26) classifica os 64 comandos da UI em **13 `alinhado`**, **35 `desalinhado`** (readequação
R-02…R-36), **16 `faltante`** (endpoints F-01…F-16 criados nesta rodada) e **0 `obsoleto na UI`**,
com a marca `fail-closed-assinatura` em 3 linhas; lista o inverso (operações de backend sem uso na
UI) e propõe OD-R25-006…015. É entrada normativa de TASK-0001, TASK-0003, TASK-0006 e TASK-0009.

## Execução OD-C2-005 (Owner, 2026-09-27)

> **Adenda A-C2-15 (Owner, 2026-09-30; prevalece).** Abertura antecipada, **só análise e
> contrato**, na **sessão A** (Codex Sol 6; reviewer Opus 5.5), depois de R-0027. Tarefas liberadas:
> **TASK-0001** (matriz de comandos, delta de rotas, triagem OD-R12), **TASK-0002** (ODs no registro,
> i18n), **TASK-0003** e **TASK-0006** (contratos F-01…F-16: rotas, DTOs, transições, papéis,
> erros, DDL). Esperam: TASK-0004/0005/0007/0008 (política de R-0023, outbox de R-0022) e
> TASK-0009 em diante (padrão de R-0024).
>
> - **Base:** `origin/main`, branch `orchestra/rait-web-wiring`. Push sem PR ao fim de cada tarefa
>   liberada; checkpoint em §Retomada com o que falta e o que espera; parada.
> - **Não tocar:** `backend/app/src/app.module.ts`, `backend/app/src/detran-runtime.ts`, serviços
>   SSE, `backend/domains/shared/src/policy.ts`, `backend/domains/shared/src/documents`, outbox
>   (`integration.*`), offline-sync e pin STYNX (R-0022/R-0023); `packages/ui` e shells ou
>   núcleos dos apps (R-0024); locks de R-0020 (`.github/workflows/`, `.devai/config`,
>   `law/register`, `record/`).
> - **Reconferência na retomada:** todo contrato produzido agora é reconferido contra `origin/main`
>   quando a rodada retomar depois da R-0024. Divergência vira adenda numerada do Architect, sem
>   reescrever o já aprovado.
> - Tarefas válidas em `pnpm verify:round-tasks`; um prompt-review no bootstrap cobrindo só as tarefas
>   liberadas; `acceptance_commands` por tarefa; sem PR e sem delivery-review (OD-C2-005).

**Precedência.** Esta seção aplica `work/campaigns/C-0002-consolidacao.md` §12 e **prevalece sobre
qualquer menção a um PR/merge/evidência/delivery-review por CTG neste plano**. A rodada corre numa
branch única, `orchestra/rait-web-wiring`, com commits por tarefa ou por CTG. Entre CTGs não há PR,
CI remoto, `devai evidence record`, `devai audit observe`, `pnpm check` completo nem
delivery-review. Ficam mantidos os `acceptance_commands` de cada tarefa, os checkpoints (b)–(e) como
gates de tarefa e **um** prompt-review no bootstrap. Os critérios de aceitação não mudam; muda só o
momento em que rodam: no fim da rodada. Onde um critério ou texto cita "PR do CTG-x", "por CTG" ou
"cada merge", leia-se o PR final, a evidência única e o SHA do merge final.

**Ondas.** Derivadas da coluna "Depende de" e dos locks da tabela de tarefas. No máximo 3 workers
simultâneos na mesma worktree. O maestro serializa os commits e faz push sem PR ao fim de cada onda.

| Onda | CTGs / tarefas em paralelo                                                                                                                                                    | Fronteiras de escrita (disjuntas)                                                                                                                                                                                                  | Dependência                                                                                                 |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| O1   | CTG-0001: TASK-0001; depois TASK-0002 ∥ TASK-0009 (contrato do CTG-0004) ∥ TASK-0013 (contrato do CTG-0005)                                                                   | `MOD-r25-command-matrix`/`route-delta` → `MOD-docs-rait-od`+`MOD-rait-web-i18n` ∥ `MOD-r25-contract-ctg4` ∥ `MOD-r25-contract-ctg5`                                                                                                | TASK-0001 antes das três                                                                                    |
| O2   | CTG-0002: TASK-0003 → TASK-0004 → TASK-0005 ∥ CTG-0003 (parte Architect/Inspector): TASK-0006 → TASK-0007 ∥ CTG-0004: TASK-0010 → TASK-0011 (linhas `alinhado`/`desalinhado`) | contrato + testes + backend caso/sessão (`MOD-shared-policy`, `MOD-inf-rait-{case,session}`, `MOD-ddl-36`) ∥ `MOD-r25-contract-ctg3`, depois `MOD-inf-rait-tests` ∥ `MOD-rait-web-tests-data`, `MOD-rait-web-data-{case,worklist}` | O1; TASK-0006 após TASK-0002; TASK-0007 só após TASK-0004 (`MOD-inf-rait-tests`, `MOD-shared-policy-tests`) |
| O3   | CTG-0003: TASK-0008 ∥ CTG-0004: TASK-0012 (R-23…R-36) e linhas F-01…F-05 de TASK-0010/0011                                                                                    | `MOD-shared-policy`, `MOD-inf-rait-{worklist,org}`, `MOD-ddl-35`, `MOD-ddl-39` ∥ `MOD-rait-web-data-{session,org}`, `MOD-rait-web-tests-data`                                                                                      | TASK-0008 após TASK-0005 e TASK-0007 commitadas (mesmo lock `MOD-shared-policy`, serial)                    |
| O4   | CTG-0004 (fecho): linhas F-06…F-16 de TASK-0010/0011/0012; depois CTG-0005: TASK-0014 → TASK-0015 ∥ TASK-0016 → TASK-0017                                                     | `MOD-rait-web-*` de dados → `MOD-rait-web-tests-{core,features}`, `MOD-app-e2e-rait-stream` → `MOD-rait-web-core` ∥ `MOD-rait-web-{features,forms}` → `MOD-r25-stack-smoke`                                                        | TASK-0008 commitada; TASK-0014 após TASK-0012 e TASK-0013                                                   |
| O5   | CTG-0006: TASK-0018 → TASK-0019 ∥ TASK-0020                                                                                                                                   | `MOD-availability-rait-web`, `MOD-availability-schema` → `MOD-rait-web-tests-availability` ∥ `MOD-docs-rait-arch`, `MOD-docs`                                                                                                      | TASK-0017 (`reports/TASK-0017.md`)                                                                          |

O checkpoint (c) roda como gate de tarefa depois de TASK-0005 e de novo depois de TASK-0008, sem PR
entre os dois. Os `acceptance_commands` de TASK-0010/0011/0012 cobrem as linhas F-nn assim que o
endpoint correspondente estiver commitado na branch.

**Lock `MOD-shared-policy` partilhado na fase D (C-0002 §12).** O lock é partilhado com o CTG-0003
de R-0026 (produtores RAIT) e com o CTG-0003 de R-0027 (delegações) e deixa de serializar PRs por
CTG. Regra de convivência:

- cada rodada edita `backend/domains/shared/src/policy.ts` no seu próprio branch, sem esperar as
  outras;
- quem mesclar depois integra `origin/main` por merge, mantém os blocos das duas rodadas no formato
  de dados de R-0023 e roda de novo `pnpm --filter @detran/shared test` e `policy-routes.e2e`
  (`pnpm backend:test:e2e`);
- ordem de merge final recomendada: **R-0025 → R-0026 → R-0027**. R-0025 é a maior mudança em
  `policy.ts` (F-01…F-16, A-1…A-3, tuplas órfãs da OD-R25-015) e estende `policy-routes.e2e` a
  `inf:rait-*`. As rodadas seguintes passam a ser conferidas por essa extensão. A ordem não bloqueia
  o desenvolvimento paralelo: se outra rodada ficar pronta antes, ela mescla primeiro e R-0025 aplica
  a mesma regra.

**Abertura empilhada.** A rodada pode abrir e trabalhar sobre `origin/orchestra/stynx-dedup`
(R-0024) assim que esse branch estiver publicado com `docs/framework/arch/frontend-wiring-pattern.md`.
Novas revisões de R-0024 entram por `git merge --no-edit origin/orchestra/stynx-dedup`, nunca por
rebase de branch publicado. O checkpoint (a) e a reconferência de TASK-0001 leem a base empilhada no
lugar de `origin/main`; a reconferência se repete sobre `main` no passo 1 da sequência final. Só o
**PR final** espera o merge de R-0024 em `main`, que por sua vez exige R-0022 e R-0023 em `main`.
A rodada não troca implementação STYNX. O requisito de STYNX 1.5.0 final chega por transitividade:
R-0022 só mescla com 1.5.0 final (OD-S15-01).

**Sequência final** (C-0002 §12, na ordem):

1. `git merge --no-edit origin/main`, com R-0024 (e, transitivamente, R-0022/R-0023) em `main`.
   Conflito em `policy.ts` segue a regra de convivência acima. TASK-0018 regrava `measuredAt` e os
   selos sobre o `main` integrado se a medição anterior tiver sido feita na base empilhada.
2. CI local completo: `pnpm check`; `pnpm contracts:check`, `pnpm contracts:clients` (sem diff),
   `pnpm contracts:test`, `pnpm blueprints:check`; `pnpm --filter @detran/shared test`;
   `pnpm backend:test:ci`; `pnpm backend:test:e2e` (`policy-routes.e2e` com `inf:rait-*`);
   `pnpm --filter @detran/app test:e2e`; `pnpm --filter @detran/rait-web typecheck`, `lint`, `test`,
   `build`; `pnpm verify:parameter-catalogue`; `pnpm docs:kb:check`, `pnpm docs:kb:publish-check`;
   `pnpm format:check`; os greps dos critérios 1–2; `pnpm stack:start` + `pnpm stack:smoke`
   (`reports/TASK-0017.md` refeito se o `main` integrado mudou código tocado); `pnpm devai:rc:prepare`
   quando aplicável.
3. **Uma** delivery-review (Opus 5.5 pela ponte) sobre o diff inteiro da rodada: `REVIEW` →
   correções só nos itens apontados, no máximo 2 ciclos; `FAIL` → `escalated`.
4. **Um** PR contra `main`, com corpo pelo template e a tabela CTG → tarefas → commits e os gates.
5. CI remoto; falha de código volta à tarefa responsável; merge só com CI verde e `PASS`.
6. `evidence-R-0025.json` com os 6 CTGs, `devai evidence record` + `evidence verify`,
   `devai audit observe` no SHA do merge, `closure.json`, `devai round close` + `round seal`,
   `waves.md` e `backlog.md` atualizados.

**Janelas recalibradas:** 5 → **≈ 4**. Estimativa por onda: O1 ≈ 0,5; O2 ≈ 1; O3 ≈ 0,5–1; O4 ≈ 1;
O5 e sequência final ≈ 1. O ganho vem da remoção de 6 ciclos de PR/CI/evidência e do paralelismo
entre backend e app. O peso de CTG-0002/0003 (16 endpoints) e da readequação dos 64 comandos não
muda.

## Estado de partida (verificado em 2026-09-26 sobre `a92ef731`; o maestro remede no bootstrap)

- **Comandos:** 64 `throw new RaitCommandUnavailableError` em `apps/rait/web/src/app/data/api/`
  (`case.client.ts` 19, `worklist.client.ts` 16, `session.client.ts` 15, `org.client.ts` 8,
  `collection.client.ts` 4, `integration.client.ts` 2); classe em `core/error-boundary.ts:24`. 67
  marcadores `todo(R-0007 CTG-0004)` em `apps/rait/web/src` (64 + guarda + sentinelas de teste).
- **Contratos de comando (R-0007):** 7 arquivos, **53 operações de comando**: 44 nos cinco
  `docs/framework/contracts/BP-INF-RAIT-{CASE,SESSION,WORKLIST,ORG,INTEGRATION}-001.commands.openapi.json`
  (15 + 12 + 8 + 5 + 4) + `BP-INF-COLLECTION-001` (4) + `BP-INF-INFRACTION-001` (5). O "256" do
  briefing não se reproduz como comandos: é a ordem de grandeza das rotas HTTP dos módulos
  `backend/domains/inf/{rait-*,collection,infraction,notification}` (≈ 236 decoradores
  `@Get/@Post/@Patch/@Delete`, CRUD gerado incluso). TASK-0001 refaz as duas contagens. Tipos em
  `packages/api-clients/src/generated/*.commands.ts` (só tipos; `@detran/api-clients` não tem runtime).
- **Vocabulário:** 64 métodos FE × 64 tuplas `['rait-…']` em `RAIT_COMMAND_RULES`
  (`backend/domains/shared/src/policy.ts:1457–1541`) × 44 operações RAIT (+ 9 COLLECTION/INFRACTION).
  Oito chaves usadas pelo FE não aparecem em `backend/**/*.ts` fora de tuplas:
  `rait-decision:sign`, `rait-clock:acknowledge-alert`, `rait-member:mandate`, `rait-pool:update`,
  `rait-calendar:update`, `rait-document:attach-official`, `rait-attendance:confirm`,
  `rait-case:triage`. Destas, só `rait-decision:sign`, `rait-member:mandate` e `rait-case:triage`
  têm tupla em `policy.ts`; nenhuma tem endpoint. OD-R12-052: não há comando para
  `PROTOCOLADO → TRIAGEM_ADMISSIBILIDADE`. A análise de lacunas mostra que a divergência é maior
  que essas oito chaves: 35 métodos chamam rota existente com outro path, alvo, corpo, chave ou
  papel, e 16 não têm rota (incluindo `EM_INSTRUCAO → DILIGENCIA`, hoje inalcançável).
  `policy-routes.e2e.spec.ts` exclui `rait-*` (`inScope`, l. 105): nenhuma rota RAIT é conferida
  contra a política.
- **Guarda:** `caseAccessGuard` devolve `true` (`core/guards/case-access.guard.ts:7`, OD-R12-005).
- **SSE:** backend serve `GET /v1/inf/rait/stream` (`backend/app/src/handwritten/rait/rait-stream.controller.ts`;
  tópicos `RAIT_STREAM_TOPICS` em `rait-stream.service.ts:8`); o e2e `backend/app/tests/e2e/rait-stream.e2e.spec.ts`
  (764 B) não faz HTTP. No app, `core/sse.service.ts` + `core/stream-transport.ts` com fallback de
  polling de 15 s; na prática a UI roda em polling. Depois de R-0022/R-0024 a costura local é
  substituída pela canônica: esta rodada **só consome** a costura de `frontend-wiring-pattern.md`.
- **Formulários:** 16 `forms/*.schema.ts` com `form-gate.ts`; nenhuma página de `features/` importa `forms/`.
- **Rotas:** `app.route-manifest.ts` com 74 entradas: 45 L2, 6 L1, **13 L0**
  (`organizacao/{escala,jeton}`, `integracoes/{renainf,renach,falhas}`,
  `financeiro/{arrecadacao,restituicoes,cobranca,conciliacao}`, `auditoria/exportacoes`,
  `admin/{parametros,calendario,atos/suspensao}`). OD-R12-011 já apontava CRUD gerado para várias.
- **Testes pendentes:** 30 chamadas `it.todo` em `apps/rait/web/src` (várias em laços
  `for (const op of COMMAND_OPS)`) ≈ **139** `todo` no resumo do vitest; linha de base medida no bootstrap.
- **Dívidas R-0007 (`work/campaigns/C-0002-inspecao-2026-09-25/f-anexo-rounds-R0003-R0014.md`):** rotas
  `minutes/:id/commands/sign|publish` — os paths de
  `backend/domains/inf/rait-session/src/handwritten/rait-session-commands.controller.ts` coincidem com
  `BP-INF-RAIT-SESSION-001.commands.openapi.json` (`raitMinutesSign`, `raitMinutesPublish`); a
  divergência restante (corpo, pós-estado, exigência de assinatura) é conferida em TASK-0001.
  T-CONV inline fora de `@detran/inf-deadlines`: só registro, se afetar a UI.
- **PAdES:** sem provedor real (C-0002 §4, #125). OD-R12-043 mantém `signatureAvailable=false`.

## Metas

1. **Reconciliação (CTG-0001):** `command-matrix.md` com as 64 linhas método FE ↔ chave de política
   efetiva ↔ `operationId` ↔ verbo/path ↔ DTO ↔ pós-estado ↔ erros do `rait-error-catalog.md`,
   derivada de `command-gap-analysis.md` e classificada em `alinhado` | `desalinhado` (readequação
   R-nn) | `faltante` (endpoint F-nn deste plano) | `obsoleto` (remoção), com a marca
   `fail-closed-assinatura`. TASK-0001 confere a análise contra `origin/main` no bootstrap e só
   diverge dela por adenda. `route-delta.md` para as 13 L0 (nível-alvo, superfície de backend, OD).
   Triagem das OD-R12-001…054 (fechada por fonte / Architect / Owner / segue aberta). ODs novas
   `OD-R25-006…015` (e as que surgirem) no registro canônico no mesmo PR.
2. **Backend RAIT — endpoints faltantes e alinhamento de política (CTG-0002 e CTG-0003,
   serializados em `MOD-shared-policy`):** os 16 endpoints F-01…F-16 de
   `command-gap-analysis.md` §5, cada um com entrada manuscrita no `*.commands.openapi.json` do
   blueprint dono, controlador manuscrito em `backend/domains/inf/rait-*/src/handwritten/`, regra
   em `policy.ts` no formato de dados de R-0023, DDL quando a análise aponta (`MOD-ddl-35`,
   `MOD-ddl-36`, `MOD-ddl-39`), testes de transição, 409/412, RLS/tenant e presença/ausência por
   papel; alinhamentos A-1…A-6 (§5.3 da análise), incluindo `policy-routes.e2e` passando a cobrir
   `inf:rait-*` nos dois sentidos. Tipos regenerados por `pnpm contracts:clients`; CRUD só por
   `pnpm blueprints:generate`; nenhum gerado editado à mão. Onde a fonte não fixa valor:
   `source_pending` + OD, nunca invenção.
3. **Comandos no app (CTG-0004):** os 64 `throw` substituídos pelo cliente de comando único do
   padrão de ligação (If-Match, Idempotency-Key, mapeamento de erros, invalidação): (a) 13
   `alinhado` ligados como estão; (b) 35 `desalinhado` **readequados** ao endpoint real (R-02…R-36:
   path, alvo, corpo, chave, papel) com facades e specs ajustadas; (c) 16 `faltante` ligados às rotas
   F-nn depois que o CTG de backend correspondente estiver commitado na branch; (d) `obsoleto`: nenhum hoje — verificação
   de que não sobra método de comando sem linha na matriz. `RaitCommandUnavailableError` removida
   (grep = 0); `fail-closed-assinatura` renderizada como estado indisponível com OD-R25-004, sem
   `throw`; `it.todo` de comando viram testes reais.
4. **Guarda, SSE, formulários, rotas (CTG-0005):** `caseAccessGuard` real (guarda por política do
   padrão + leitura do caso sob RLS); SSE canônico provado ponta a ponta contra `/v1/inf/rait/stream`
   (e2e HTTP no backend); 16 schemas ligados às páginas; 13 L0 promovidas ou justificadas; smoke na
   stack local.
5. **Documentação e delta (CTG-0006):** build pack, `rait-web-frontend.md` §4/§7/§11/§13,
   `rait-web-forms.md`, README do app, backlog/#122, `waves.md`; **delta do manifesto de
   disponibilidade** da superfície `rait-web` em
   `docs/framework/arch/availability/rait-web.availability.json` (caminho canônico do §1 do anexo de
   R-0030; C-0002 §3.5 cita `docs/framework/arch/availability/rait-web.availability.json` — ver OD-R25-005); não
   manuais.

## Tarefas (proposta — o maestro deriva `tasks/*.json` e `prompts/TASK-nnnn.md` no bootstrap)

Reestruturadas em 2026-09-26 pela decisão do Owner na OD-R25-001 (antes da autorização da rodada):
17 → 20 tarefas; 5 → 6 CTGs; 4 → 5 janelas.

| Tarefa    | Papel                | Perfil              | Modelo/esforço | Lock `MOD-*`                                                                                                              | Depende de                              | Entrega                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| --------- | -------------------- | ------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TASK-0001 | Architect            | architect-blueprint | Sol 6 / alto   | `MOD-r25-command-matrix`, `MOD-r25-route-delta`                                                                           | —                                       | `command-matrix.md` (64 linhas, colunas da Meta 1) derivada de `command-gap-analysis.md`, reconferida contra `origin/main` (divergência → adenda); `route-delta.md` (13 L0); recontagem 53/≈236; triagem OD-R12-001…054; `contracts/CTG-0001.md`                                                                                                                                                                                                                                                         |
| TASK-0002 | Architect (transcr.) | transcriber-docs    | Luna / baixo   | `MOD-docs-rait-od`, `MOD-rait-web-i18n`                                                                                   | TASK-0001                               | `open-decisions-rait.md` nova seção "RAIT-WEB — R-0025": OD-R25-001 (decidida), situação das OD-R12 triadas + `OD-R25-006…015` (e novas); chaves i18n novas só nos namespaces allowlistados de `docs/framework/arch/i18n/rait.pt-BR.json`                                                                                                                                                                                                                                                                |
| TASK-0003 | Architect            | architect-blueprint | Sol 6 / alto   | `MOD-r25-contract-ctg2`                                                                                                   | TASK-0002                               | `contracts/CTG-0002.md`: F-01…F-05 (caso e sessão) e A-1…A-6 de `command-gap-analysis.md` §5.1/§5.3 — rota, `operationId`, entrada nos `BP-INF-RAIT-{CASE,SESSION}-001.commands.openapi.json` e `BP-OPS-PARAMETER-001.commands.openapi.json`, DTO, transição (fonte WF/RN/UC citada), papéis, erros do catálogo, evento/tópico, DDL (`MOD-ddl-36`, OD-R25-010), chaves no formato de R-0023, extensão de `policy-routes.e2e` a `inf:rait-*`; `source_pending` onde a fonte não fixa; critérios C-25-2-nn |
| TASK-0004 | Inspector            | inspector-tests     | Terra / médio  | `MOD-inf-rait-tests`, `MOD-shared-policy-tests`, `MOD-app-e2e-policy-routes`                                              | TASK-0003                               | Testes de comando F-01…F-05 (transição, 409/412, RLS/tenant negativos, evento), de política (presença **e** ausência por papel) e `policy-routes.e2e` com `inf:rait-*` nos dois sentidos (A-4); contrato A-5 coberto por `contracts:test`                                                                                                                                                                                                                                                                |
| TASK-0005 | Engineer             | engineer-backend    | Terra / médio  | `MOD-shared-policy`, `MOD-inf-rait-case`, `MOD-inf-rait-session`, `MOD-contracts-rait`, `MOD-ddl-36`, `MOD-contracts-ops` | TASK-0004                               | Controladores/serviços manuscritos F-01…F-05; contratos `*.commands.openapi.json` manuscritos; `policy.ts` (F-nn + A-1…A-3, OD-R25-015); A-5 (`check-commands.mjs`); A-6 se OD-R25-014 = (a) via `pnpm blueprints:generate`; `pnpm contracts:clients`; nenhum gerado editado à mão                                                                                                                                                                                                                       |
| TASK-0006 | Architect            | architect-blueprint | Sol 6 / alto   | `MOD-r25-contract-ctg3`                                                                                                   | TASK-0002                               | `contracts/CTG-0003.md`: F-06…F-16 (worklist e organização) de `command-gap-analysis.md` §5.2, na mesma forma de TASK-0003; DDL `MOD-ddl-35` (F-09, OD-R25-007) e `MOD-ddl-39` (F-15, OD-R25-011); OD-R25-009/012 aplicadas; critérios C-25-3-nn                                                                                                                                                                                                                                                         |
| TASK-0007 | Inspector            | inspector-tests     | Terra / médio  | `MOD-inf-rait-tests`, `MOD-shared-policy-tests`                                                                           | TASK-0006, TASK-0004                    | Testes de comando F-06…F-16 e de política (presença e ausência por papel); acréscimo das novas rotas ao `policy-routes.e2e` de TASK-0004                                                                                                                                                                                                                                                                                                                                                                 |
| TASK-0008 | Engineer             | engineer-backend    | Terra / médio  | `MOD-shared-policy`, `MOD-inf-rait-worklist`, `MOD-inf-rait-org`, `MOD-contracts-rait`, `MOD-ddl-35`, `MOD-ddl-39`        | TASK-0007, **CTG-0002 na branch**       | Controladores/serviços manuscritos F-06…F-16; contratos `BP-INF-RAIT-{WORKLIST,ORG}-001.commands.openapi.json`; `policy.ts`; `pnpm contracts:clients`; nenhum gerado editado à mão                                                                                                                                                                                                                                                                                                                       |
| TASK-0009 | Architect            | architect-blueprint | Sol 6 / alto   | `MOD-r25-contract-ctg4`                                                                                                   | TASK-0001                               | `contracts/CTG-0004.md`: aplicação de `frontend-wiring-pattern.md` aos 6 clientes e às facades (sem variante); tabela de readequação R-01…R-36 (assinatura pública, alvo, corpo, chave, papel) e ligação F-01…F-16 às rotas dos contratos de CTG-0002/0003; verificação de obsoletos (0); forma do estado indisponível (`fail-closed-assinatura`); invalidação pós-comando; critérios C-25-4-nn                                                                                                          |
| TASK-0010 | Inspector            | inspector-tests     | Terra / médio  | `MOD-rait-web-tests-data`                                                                                                 | TASK-0009 (linhas F-nn: TASK-0005/0008) | Specs que substituem os `it.todo` de comando e os sentinelas "sem requisição HTTP" de R-0012 (substituição declarada aqui, não enfraquecimento): verbo/path/headers/corpo lidos do OpenAPI em disco; chave exibida = chave efetiva da rota; `fail-closed-assinatura` não emite requisição; 64/64, um arquivo de spec por cliente                                                                                                                                                                         |
| TASK-0011 | Engineer             | engineer-frontend   | Terra / médio  | `MOD-rait-web-data-case`, `MOD-rait-web-data-worklist`                                                                    | TASK-0010                               | `case.client.ts`, `worklist.client.ts` e facades `case`, `protocol`, `queue`, `signing`, `radar`: alinhados, readequações R-01…R-22 e faltantes F-01, F-02, F-06…F-14 (estes após o commit do CTG de backend na branch)                                                                                                                                                                                                                                                                                  |
| TASK-0012 | Engineer             | engineer-frontend   | Terra / médio  | `MOD-rait-web-data-session`, `MOD-rait-web-data-org`                                                                      | TASK-0011                               | `session.client.ts`, `org.client.ts`, `collection.client.ts`, `integration.client.ts`; facades restantes; R-23…R-36; F-03…F-05, F-15, F-16; remoção de `RaitCommandUnavailableError`                                                                                                                                                                                                                                                                                                                     |
| TASK-0013 | Architect            | architect-blueprint | Sol 6 / alto   | `MOD-r25-contract-ctg5`                                                                                                   | TASK-0001                               | `contracts/CTG-0005.md`: `caseAccessGuard` (OD-R25-002); protocolo SSE a provar (`RAIT_STREAM_TOPICS`, `Last-Event-ID`, 204, heartbeat/OD-R12-007) sobre a costura canônica; mapa schema → página (16); páginas L0 promovidas; jornadas do smoke                                                                                                                                                                                                                                                         |
| TASK-0014 | Inspector            | inspector-tests     | Terra / médio  | `MOD-rait-web-tests-core`, `MOD-rait-web-tests-features`, `MOD-app-e2e-rait-stream`                                       | TASK-0013, TASK-0012                    | Guarda (presença/ausência; sentinela `core/guards.spec.ts:258` substituído); e2e HTTP de `/v1/inf/rait/stream` (só teste; defeito de backend = triagem `plant-bug` + OD, não correção); cada página do mapa importa e aplica o schema; nível de cada rota = `route-delta.md`                                                                                                                                                                                                                             |
| TASK-0015 | Engineer             | engineer-frontend   | Terra / médio  | `MOD-rait-web-core`                                                                                                       | TASK-0014                               | `case-access.guard.ts` real; `app.route-manifest.ts` (níveis); consumo da costura SSE canônica (remoção de resíduo local, se R-0024 não o removeu)                                                                                                                                                                                                                                                                                                                                                       |
| TASK-0016 | Engineer             | engineer-frontend   | Terra / médio  | `MOD-rait-web-features`, `MOD-rait-web-forms`                                                                             | TASK-0014                               | Formulários ligados; páginas L0 promovidas (L1 leitura, L2 leitura + comando); estados indisponíveis com OD                                                                                                                                                                                                                                                                                                                                                                                              |
| TASK-0017 | Inspector            | inspector-tests     | Luna / médio   | `MOD-r25-stack-smoke`                                                                                                     | TASK-0015, TASK-0016                    | Smoke das jornadas de TASK-0013 na stack (`pnpm stack:start` + runbook de R-0017): ≥ 1 comando por cliente com requisição, resposta e evento SSE, incluindo ≥ 1 endpoint F-nn de cada CTG de backend; `reports/TASK-0017.md`; nenhum código                                                                                                                                                                                                                                                              |
| TASK-0018 | Architect (transcr.) | transcriber-docs    | Luna / baixo   | `MOD-availability-rait-web`, `MOD-availability-schema`                                                                    | TASK-0017                               | `docs/framework/arch/availability/rait-web.availability.json` (anexo de R-0030 §3; `measuredAt` sobre o `main` integrado, `history` iniciado): 74 rotas + ações com `operationId`, selo (`disponivel`, `parcial`, `indisponivel_nesta_versao`, `bloqueado_por_decisao`) e `decision`; se for a primeira da fase D a mesclar, transcreve o §4 para `docs/framework/schemas/availability-manifest.schema.json` + linha em `docs/framework/schemas/README.md`; nenhum manual                                |
| TASK-0019 | Inspector            | inspector-tests     | Luna / médio   | `MOD-rait-web-tests-availability`                                                                                         | TASK-0018                               | Spec do app que prova R1 (rotas de `app.route-manifest.ts` = `path` do arquivo) e R3 (perfis) do anexo §6, e selo × `level` × marcador de indisponibilidade (§6.1)                                                                                                                                                                                                                                                                                                                                       |
| TASK-0020 | Architect (transcr.) | transcriber-docs    | Luna / baixo   | `MOD-docs-rait-arch`, `MOD-docs`                                                                                          | TASK-0017                               | `rait-build-pack.md`, `rait-web-frontend.md` §4/§7/§11/§13 (§7 e §11 refletem F-01…F-16 e as chaves efetivas), `rait-web-forms.md`, `apps/rait/web/README.md`, `backlog.md` (#122: checklist fechado ou OD por item), `waves.md` §Histórico                                                                                                                                                                                                                                                              |

- CTG-0001 = 0001 → 0002.
- CTG-0002 (backend: caso e sessão, F-01…F-05, A-1…A-6) = 0003 → 0004 → 0005.
- CTG-0003 (backend: worklist e organização, F-06…F-16) = 0006 → 0007 → 0008.
- **CTG-0002 e CTG-0003: lock compartilhado `MOD-shared-policy`; serializados** entre si (TASK-0008
  começa depois de TASK-0005 commitada na branch). Com R-0027 e com o CTG-0003 de R-0026 (produtores
  RAIT) vale a regra de convivência de §Execução OD-C2-005.
  TASK-0006 e TASK-0007 podem correr durante o CTG-0002 (locks de contrato e de teste disjuntos
  do Engineer; TASK-0007 espera TASK-0004 por `MOD-shared-policy-tests`).
- CTG-0004 (comandos no app) = 0009 → 0010 → 0011 → 0012. As linhas `alinhado` e `desalinhado`
  avançam sem esperar o backend; as linhas `faltante` de cada CTG de backend entram depois do commit
  dele na branch (o CTG-0004 fecha depois de TASK-0008).
- CTG-0005 (guarda, SSE, formulários, rotas, smoke) = 0013 → 0014 → 0015 ∥ 0016 → 0017.
- CTG-0006 (docs e disponibilidade) = 0018 → 0019, ∥ 0020.

Commits por CTG na branch única; um PR no fim (OD-C2-005). TASK-0003, TASK-0006, TASK-0009 e TASK-0013 podem correr em paralelo (locks
disjuntos); no máximo três tarefas simultâneas.

**Checkpoints do maestro (Engineer):**
(a) bootstrap: `docs/framework/arch/frontend-wiring-pattern.md` presente em `origin/main`; `grep`
das contagens do Estado de partida; `command-gap-analysis.md` reconferida por amostragem (≥ 1 linha
por classe e por cliente); linha de base `pnpm --filter @detran/rait-web test` com o número de
`todo` do resumo registrado em §Leitura;
(b) depois de TASK-0002: `pnpm verify:parameter-catalogue`, `pnpm docs:kb:check`;
(c) depois de TASK-0005 e de novo depois de TASK-0008: `pnpm contracts:check`,
`pnpm contracts:clients` (sem diff após o commit), `pnpm contracts:test`, `pnpm blueprints:check`,
`pnpm --filter @detran/shared test`, `pnpm backend:test:ci`, `pnpm backend:test:e2e`
(`policy-routes.e2e` com `inf:rait-*`);
(d) depois de TASK-0012: grep do critério 1 = 0 fora de `core/guards`;
(e) antes de TASK-0017: `pnpm stack:start` e `pnpm stack:status` verdes.

## Critérios de aceitação (comandos → resultado; imutáveis, C-0002 §4)

Revisados em 2026-09-26, antes da autorização, para refletir a OD-R25-001 (classes da análise de
lacunas, CTGs renumerados e critério 13 novo). Depois da autorização, só por adenda com decisão do
Owner.

1. `grep -rn "RaitCommandUnavailableError\|todo(R-0007 CTG-0004)" apps/rait/web/src` → nenhuma linha.
2. `grep -rn "it.todo" apps/rait/web/src`: cada ocorrência restante cita OD aberta (`OD-R12-nnn` ou
   `OD-R25-nnn`) do registro canônico; o `todo` do vitest cai em relação à linha de base (a); os
   dois números vão ao `closure.json`.
3. `pnpm --filter @detran/rait-web typecheck`, `lint`, `test`, `build` → verdes.
4. Spec de conformidade (TASK-0010): 64/64 linhas de `command-matrix.md` cobertas; linhas
   `alinhado`, `desalinhado` (já readequadas) e `faltante` (já com endpoint) emitem exatamente verbo e
   path de `docs/framework/contracts/*.commands.openapi.json` (ou do CRUD gerado, onde a readequação
   aponta), com `If-Match` e `Idempotency-Key`, e exibem a chave efetiva da rota; linhas
   `fail-closed-assinatura` não emitem requisição; nenhuma linha `obsoleto` resta no código.
5. Guarda: presença e ausência (403/404 → rota de negação do padrão) para cada papel de
   `rait-web-frontend.md` §3.
6. `pnpm --filter @detran/app test:e2e` → verde com o e2e HTTP de `/v1/inf/rait/stream`;
   `pnpm backend:test:ci` → verde.
7. Formulários: 16/16 schemas importados pelas páginas do mapa de TASK-0013; nível das 74 rotas =
   `route-delta.md`; nenhuma rota L0 sem OD.
8. `pnpm contracts:check`, `pnpm blueprints:check` → sem diff (contratos de comando manuscritos
   conferidos por `check-commands.mjs`; CRUD e clientes só regenerados, nunca editados);
   `pnpm contracts:test` → verde; `pnpm verify:parameter-catalogue` → `0 errors`;
   `pnpm docs:kb:check`, `pnpm docs:kb:publish-check` → OK; `pnpm format:check` → sem diffs.
9. `pnpm check` → verde.
10. Smoke (TASK-0017): jornadas executadas com `pnpm stack:start` (e `pnpm stack:smoke`, versionado
    por R-0017) com resultado por comando; o PR do CTG-0005 não abre sem `reports/TASK-0017.md`.
11. `docs/framework/arch/availability/rait-web.availability.json` válido contra o JSON Schema do anexo
    de R-0030 §4 (JSON parseável; enums conferidos); spec de TASK-0019 verde (R1, R3); selo de cada
    rota coerente com `level` do manifesto e com a classificação da matriz.
12. DEVAI: `devai evidence record` + `evidence verify` por CTG; `audit observe` no SHA de cada merge;
    `round close` e `round seal`; âncora da prova em `record/proofs/chain.json`.
13. Backend (CTG-0002 e CTG-0003): os 16 endpoints F-01…F-16 de `command-gap-analysis.md` §5 existem
    no `*.commands.openapi.json` do blueprint dono **e** no controlador manuscrito montado
    (`pnpm contracts:check` verde) **e** têm regra em `policy.ts`; `pnpm contracts:clients` não
    produz diff após o commit; `pnpm backend:test:e2e` verde com `policy-routes.e2e.spec.ts`
    cobrindo `inf:rait-*` nos dois sentidos (allowlist só com justificativa e OD); testes de cada F-nn
    provam a transição da fonte citada, 409/412 e a ausência por papel; valores sem fonte ficam
    `source_pending` com OD no registro canônico.

## Mapa entregável → definições

| Entregável             | Definição (caminhos verificados)                                                                                                                                                                                                                                                                                        |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| padrão de ligação      | `docs/framework/arch/frontend-wiring-pattern.md` (**entregável de R-0024**; lido no bootstrap)                                                                                                                                                                                                                          |
| análise de lacunas     | `work/rounds/R-0025/command-gap-analysis.md` (OD-R25-001: classes, readequações R-nn, endpoints F-nn, ODs 006–015)                                                                                                                                                                                                      |
| matriz de comandos     | `docs/framework/arch/rait-web-frontend.md` §7, §11; `backend/domains/shared/src/policy.ts` `RAIT_COMMAND_RULES`; `docs/framework/contracts/BP-INF-*.commands.openapi.json`; `docs/framework/arch/rait-error-catalog.md`                                                                                                 |
| clientes/facades       | `work/rounds/R-0012/contracts/CTG-0002b.md`; `rait-web-frontend.md` §8; ADR-0009 (contratos OpenAPI gerados)                                                                                                                                                                                                            |
| backend (F-nn, A-n)    | `docs/framework/arch/rait-build-pack.md` §0–§1; blueprints `docs/framework/blueprints/BP-INF-RAIT-*.json`; `backend/domains/inf/rait-*/src/handwritten/`; `tools/contracts/check-commands.mjs`; `backend/app/tests/e2e/policy-routes.e2e.spec.ts`; WF-RAIT-001…004, UC-RAIT-002/004/010/015/019/025/026/037/038/039/043 |
| guarda de caso         | [RN-RAIT-143]; `rait-web-frontend.md` §3; `work/rounds/R-0012/contracts/CTG-0002a.md`; OD-R12-005                                                                                                                                                                                                                       |
| SSE                    | `docs/framework/arch/rait-events-sse-contract.md` §1–§3; OD-R12-007                                                                                                                                                                                                                                                     |
| formulários            | `rait-web-frontend.md` §9; `docs/framework/arch/rait-web-forms.md`; `work/rounds/R-0012/contracts/CTG-0002c.md`                                                                                                                                                                                                         |
| níveis de rota         | `apps/rait/web/src/app/app.route-manifest.ts` (M13 de `work/rounds/R-0012/plan.md`); `rait-web-frontend.md` §4                                                                                                                                                                                                          |
| assinatura             | ADR-0018 (documentos e assinatura); ADR-0027 (signatários da ata); OD-R12-043; entrega de assinatura de R-0022                                                                                                                                                                                                          |
| prazos (leitura)       | [RN-RAIT-005]; `docs/framework/arch/rait-deadline-engine.md`; regra `rait/no-client-deadline-math` (`apps/rait/web/eslint/local-rules.js`)                                                                                                                                                                              |
| manifesto de disponib. | C-0002 §3.5; `work/rounds/R-0030/availability-manifest.schema.md` §1–§7 (planejamento de R-0030)                                                                                                                                                                                                                        |

## Decisões pendentes (ODs novas; TASK-0002 registra em `open-decisions-rait.md`)

| OD         | Pergunta                                                                                                                                                                                                                | Opções                                                                                                                                                                            | Recomendação do Architect                                                         | Decisor                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OD-R25-001 | Comandos do FE sem correspondência no backend                                                                                                                                                                           | (a) todos não executáveis; (b) criar só onde WF/RN fixam; (c) criar todos                                                                                                         | —                                                                                 | **Decidida pelo Owner em 2026-09-26:** verificar, para cada comando do frontend sem correspondência no backend, se é **desalinhamento** (a funcionalidade existe em outro endpoint/nome/verbo/path/corpo — mapear para o endpoint real) ou **falta de implementação** (não existe). Os faltantes serão ADICIONADOS como endpoints (dentro de R-0025), e as chamadas desalinhadas serão readequadas ao endpoint existente — tudo no escopo desta campanha. Resultado em `command-gap-analysis.md` (13/35/16/0); CTG-0002/0003 criam F-01…F-16, CTG-0004 readequa R-01…R-36 |
| OD-R25-002 | Origem da decisão do `caseAccessGuard` (fecha OD-R12-005)                                                                                                                                                               | (a) guarda por política do padrão + `GET /v1/inf/rait/cases/{id}` existente sob RLS (403/404 → negar); (b) endpoint dedicado                                                      | (a), sem endpoint novo                                                            | Architect                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| OD-R25-003 | e2e de navegador (Playwright, item do #122)                                                                                                                                                                             | (a) decisão comum da campanha para os 5 apps; smoke na stack aqui; (b) Playwright nesta rodada                                                                                    | (a): dependência nova pede ADR e não pode nascer app a app                        | Owner                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| OD-R25-004 | `decide`, assinatura e publicação de ata sem PAdES real                                                                                                                                                                 | (a) comando ligado à porta de assinatura STYNX de R-0022; sem provedor configurado → fail-closed (ação `bloqueado_por_decisao` citando a OD); (b) liberar `decide` sem assinatura | (a) (C-0002 §4; #125)                                                             | Owner                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| OD-R25-005 | Caminho do manifesto: C-0002 §3.5 (`docs/framework/arch/availability/rait-web.availability.json`) × anexo de R-0030 §1 (`docs/framework/arch/availability/rait-web.availability.json`, "nenhum outro caminho é aceito") | (a) caminho do anexo; (b) caminho da campanha                                                                                                                                     | (a): o gate de R-0030 lê só o caminho canônico; a campanha é corrigida por adenda | Owner (ratificar)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| OD-R25-006 | Forma de F-01 (iniciar triagem, fecha OD-R12-052)                                                                                                                                                                       | (a) comando só de transição, vereditos pelo CRUD `admissibility`; (b) comando com os 4 vereditos; (c) transição automática no protocolo                                           | (a)                                                                               | Architect (Owner ratifica)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| OD-R25-007 | F-09: decisor da suspeição no 1º circuito e prazo ("proposta: 5 dias úteis")                                                                                                                                            | (a) `rait-chair` + `rait-signing-authority` por circuito (UC-RAIT-026); (b) só `rait-chair` (ficha 016); prazo `source_pending`                                                   | (a); prazo sem timer até fonte                                                    | Owner                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| OD-R25-008 | F-05: quem confirma presença (fecha OD-R12-013)                                                                                                                                                                         | (a) secretaria (ficha 035); (b) o próprio membro (UC-RAIT-015); (c) ambos                                                                                                         | (c), com (a) nesta rodada                                                         | Owner                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| OD-R25-009 | F-06: ordem de convocação além do suplente de plantão                                                                                                                                                                   | (a) só plantonista, resto `source_pending`; (b) ordem sem fonte                                                                                                                   | (a)                                                                               | Owner                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| OD-R25-010 | F-04: armazenamento do voto-vista                                                                                                                                                                                       | (a) colunas em `rait_agenda_item`; (b) linha em `rait_vote`                                                                                                                       | (a)                                                                               | Architect                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| OD-R25-011 | F-15: estado de publicação do plano de capacidade (inexistente no DDL)                                                                                                                                                  | (a) `published_at`/`published_by`; (b) reutilizar `closed_at`                                                                                                                     | (a)                                                                               | Architect + Owner                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| OD-R25-012 | F-10: um comando `mandate` com o ato como campo × um por ato (UC-RAIT-037)                                                                                                                                              | (a) um endpoint com `act`; (b) cinco endpoints                                                                                                                                    | (a)                                                                               | Architect                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| OD-R25-013 | Não há comando que crie sessão; `convene-extraordinary` converte sessão existente                                                                                                                                       | (a) R-30 readequa à sessão existente; criação de sessão vai a backlog com OD; (b) criar `POST /sessions` sem fonte de cadência                                                    | (a)                                                                               | Owner                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| OD-R25-014 | POST duplicado CRUD × comando manuscrito (6 recursos)                                                                                                                                                                   | (a) retirar `create` do CRUD e regenerar; (b) manter e documentar                                                                                                                 | (a)                                                                               | Architect                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| OD-R25-015 | Chave canônica quando tupla de `RAIT_COMMAND_RULES` e rota divergem                                                                                                                                                     | (a) chave da rota montada; tuplas órfãs removidas no mesmo PR; (b) renomear `@Action`                                                                                             | (a)                                                                               | Architect                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |

**OD-R12 que bloqueiam ou limitam esta rodada** (TASK-0001 confirma cada uma contra os contratos atuais):
bloqueantes para ação executável — **005** (guarda), **043** (PAdES), **052** (iniciar triagem; fechada por F-01),
**026/027** (papéis e ações só de ficha), **044** (pós-estado de `return-draft`); limitantes de
leitura/forma — 002, 007, 018, 021, 022, 023, 031, 035, 037, 038, 041, 046, 048, 050, 054. Nenhuma é
fechada por inferência: sem fonte versionada, a ação fica fail-closed e a OD segue aberta.

## Riscos

- **Readequação que muda semântica:** a readequação só troca nome, path, alvo, corpo, chave ou
  papel; se a rota real tem pós-estado diferente da fonte (ex.: `return-draft`, OD-R12-044), a
  chamada é readequada e a divergência fica registrada como OD, nunca "corrigida" na UI.
- **Endpoint novo sem fonte:** F-nn cujo valor não está na fonte (prazo, ordem de suplentes, estado
  de publicação) sai com `source_pending` e OD-R25-006…015; o Inspector testa a recusa, não um valor
  inventado.
- **Dois CTGs de backend no mesmo lock:** TASK-0008 espera TASK-0005 na branch; se R-0027 ou R-0026
  mesclar antes do PR final, a sequência final integra `origin/main` e refaz o checkpoint (c).
- **Sentinelas de R-0012** (`core/guards.spec.ts:258`, "sem requisição HTTP" em `queue.facade.spec.ts`)
  codificam o stub; a substituição é do Inspector, declarada nesta tabela.
- **Colisão no lock compartilhado** com R-0027/R-0026: `policy.ts` em conflito → mantém os dois
  blocos e roda `pnpm --filter @detran/shared test` (lição do template); nunca `--force`.
- **Stream sem prova HTTP:** e2e de TASK-0014 falhando por defeito de backend → `plant-bug` em
  §Triagem + OD; a UI fica no fallback canônico, sem correção de backend fora dos CTG-0002/0003.
- **Padrão de ligação ausente ou incompleto** (R-0024): checkpoint (a) falha → parada; nenhuma
  variante local é inventada.
- **Anexo de R-0030 ausente em `main`:** TASK-0018 espera; CTG-0006 não fecha sem ele.

## Lições aplicadas (C-0001 → C-0002 §4; `waves.md` §Histórico)

- **Relatórios versionados:** `reports/` entra com `git add -f` enquanto o `.gitignore` (linha 10,
  `reports/`) não for corrigido por R-0018; depois de cada `git add`, comparar `find <dir> -type f`
  com `git ls-files <dir>` (R-0016; R-0007 perdeu 24 relatórios).
- **Critérios imutáveis:** mudança só por adenda numerada com decisão do Owner; critério
  substituído vai ao closure como **não cumprido**. Proibido repetir R-0013/R-0014 (Lighthouse → axe;
  suíte integral → focal) e o waiver SQL2 de R-0007.
- **ODs no registro canônico** (`open-decisions-rait.md`) no mesmo PR que as cria.
- **Âncora da prova:** `evidence record`/`verify` único no fim da rodada, com todos os CTGs
  (OD-C2-005); `audit observe` no SHA exato do merge;
  `round close` + `round seal`; nenhuma rodada fecha sem âncora.
- **Orçamento:** `budget.json` obrigatório; checkpoint a 80 % e parada, sem dispensa implícita.
- **Caracterização antes de troca:** a matriz papel × rota (`app.guards-matrix.*.spec.ts`) é
  regenerada e versionada antes e depois do CTG-0005; divergência não declarada é FAIL.
- **Padrão único:** só a costura de `frontend-wiring-pattern.md`; nada de serviço, interceptor ou
  cliente local novo.
- **Inspector de matriz grande** em nível médio (R-0014), um arquivo de spec por cliente, sem
  asserções por conjunto (R-0014 A15/A18).
- **Proibições:** Engineer não entrega o teste do próprio artefato; nenhum gerado editado; nenhum
  `--force`; nenhum valor normativo inventado (`source_pending`); nenhuma aritmética de prazo no
  cliente ([RN-RAIT-005]); nenhuma integração externa real.
- **Ciclos de review** a partir do segundo restritos aos itens corrigidos; contradição contrato ×
  código resolvida por adenda antes de redespachar.

## Adendas

## Decisões do maestro

- **M1 (bootstrap da Sessão A, papel Architect).** Base `origin/main` em
  `d8c5d72a4c2cdf527ded9cef4485bc399ff464c9`, branch
  `orchestra/rait-web-wiring`. Maestro e tarefas de arquitetura grandes:
  `gpt-6-sol` (alto); escada de workers: `gpt-5.6-terra` (médio) e
  `gpt-6-luna` (baixo); reviewer da outra família: `claude-opus-5-5` pela
  ponte. IDs seguem `docs/meta/agents/orchestra/model-ladder.md`; o transporte
  do reviewer será validado no prompt-review pelo maestro.
- **M2 (recorte A-C2-15).** Liberadas apenas TASK-0001/0002/0003/0006. Nesta
  sessão, os gates são `acceptance_commands` reais por tarefa,
  `pnpm verify:round-tasks`, `pnpm format:check`, `pnpm docs:kb:check` quando
  aplicável e um prompt-review restrito aos quatro prompts. A verificação dos
  contratos não autoriza editar blueprints, controladores, DDL, política ou
  testes antes da retomada. Sem PR, delivery-review, CI completo, evidência ou
  fechamento nesta sessão.
- **M3 (dependências).** TASK-0001 precede TASK-0002; TASK-0002 precede
  TASK-0003 e TASK-0006. Os contratos de TASK-0003 e TASK-0006 têm locks
  disjuntos e podem avançar juntos depois do registro canônico das ODs.

## Concorrência

## Bloqueios

## Triagem

## Retomada

## Leitura

- Bootstrap da Sessão A na branch `orchestra/rait-web-wiring`, base
  `origin/main` `d8c5d72a4c2cdf527ded9cef4485bc399ff464c9`.
  Lidos `AGENTS.md`, C-0002 §12/§14/§15/§16, este plano,
  `prompts/00-maestro.md`, `command-gap-analysis.md` e o bootstrap da Sessão A
  de R-0027 como referência de formato. O recorte autorizado está em
  `AUTHORIZATION.md`.
- Linha de base `pnpm --filter @detran/rait-web test`: primeira tentativa na
  worktree limpa falhou na resolução de `@detran/ui` porque o `dist` ignorado
  ainda não existia (127 suítes sem executar testes; nas demais, 1.783 PASS e
  5 TODO). Depois de `pnpm --filter @detran/ui build`, sem mudança de fonte,
  a repetição passou: 154 arquivos PASS, 1 skipped, 4.434 testes PASS e
  **139 TODO**. Esse é o número para comparação no critério 2.
