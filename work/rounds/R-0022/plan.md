# R-0022 — frente `stynx-sse-tenancy` (C-0002, ação 7c: pin 1.5.0, SSE com fonte única, tenancy sem _monkey-patch_, assinatura final)

**Status:** **proposta — C-0002 rev. 2, aguardando autorização do Owner**. Planejada em 2026-09-26 pelo
Architect a partir de `work/campaigns/C-0002-consolidacao.md` §2 (fase C) e de
`work/campaigns/C-0002-stynx-upstream-spec.md` (§3, §4, §6.11, §6.12). Reaproveita o rascunho da
revisão 1 (rascunho não versionado) com ids, ordem, maestros e
dependências corrigidos. Nenhum `AUTHORIZATION.md`, `tasks/` ou `compositions.json` existe: o maestro
os produz no bootstrap. Maestro **Opus 5.5** (Claude Code); reviewer **Sol 6** via
`tools/orchestra/bridge.sh codex …` (ids confirmados no bootstrap), nível grande em toda revisão.
Worktree `/Volumes/Thiamat II/stech/detran-worktrees/stynx-sse-tenancy`, branch
`orchestra/stynx-sse-tenancy`.
**Concorrência com upstreams da campanha:** a rodada inteira pode abrir **empilhada** em
`origin/orchestra/stynx-canonical` (R-0021); o PR final espera o merge de R-0021 (OD-C2-005, que
subsume a adenda A-C2-11 em §Adendas). **Upstream externo:** STYNX **1.5.0 publicado** no registry pela rodada **S-1.5** (repositório
STYNX), com os itens MUST de UPS-TEN, UPS-SSE, UPS-NGSSE e UPS-TEST-01 (OD-C2-004). CTG-0001
(caracterização) é desenvolvido e provado sobre **1.4.0** enquanto a 1.5.0 não sai; o PR final não
abre antes da publicação da 1.5.0 final. R-0023 e R-0024 empilham sobre o branch publicado desta
rodada; os PRs finais delas esperam o merge desta. As rodadas de
ligação (R-0025…R-0029) vêm depois e **não** tocam SSE: consomem o que esta rodada entrega.
**Janelas previstas:** 3 (1: bootstrap + CTG-0001; 2: CTG-0002 + CTG-0003 + CTG-0004; 3: CTG-0005 +
CTG-0006 condicional + CTG-0007 + fechamento); recalibradas em §Execução OD-C2-005.

## Execução OD-C2-005 (Owner, 2026-09-27)

Esta seção **prevalece sobre qualquer menção a um PR/merge/evidência/delivery-review por CTG neste
plano** (C-0002 §12). A rodada corre na branch única `orchestra/stynx-sse-tenancy`, com um commit por
tarefa ou por CTG. Entre CTGs não há PR, CI remoto, `devai evidence record`, `audit observe`,
`pnpm check` completo nem delivery-review. Os critérios de aceitação não mudam; muda só o momento:
os `acceptance_commands` de cada tarefa rodam ao fim da tarefa (definição de pronto do worker), e os
critérios formulados "por CTG", "ao fim de cada CTG" ou "no sha de cada merge" rodam **uma vez**, na
sequência final (`pnpm check` no fim da rodada; uma evidência com todos os CTGs; `audit observe` no
sha do merge único). A comparação de `pnpm backend:rls-smoke` com a linha de base continua após cada
CTG de O5 e O6 (Meta 2), como comando de aceitação.

**Ondas** (até 3 workers simultâneos na mesma worktree; o maestro serializa os commits; push sem PR
ao fim de cada onda):

| Onda | CTGs / tarefas em paralelo                                                               | Fronteiras de escrita (disjuntas)                                                                                                                                                                                                                       | Depende de                                                                                           |
| ---- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| O1   | CTG-0001: TASK-0001                                                                      | `work/rounds/R-0022/contracts/`, `docs/framework/arch/sse-stream-contract.md`, `open-decisions-rait.md` §C-0002                                                                                                                                         | bootstrap e prompt-review única com `PASS`                                                           |
| O2   | CTG-0001: TASK-0002 ∥ TASK-0003                                                          | `backend/app/tests/**` × `apps/*/*/src/**/*.spec.ts`                                                                                                                                                                                                    | O1                                                                                                   |
| O3   | CTG-0002: TASK-0004                                                                      | manifestos da lista de R-0021, `tools/blueprints/generate.mjs`; `pnpm-lock.yaml` pelo maestro                                                                                                                                                           | O2 **commitada** (caracterização verde sobre 1.4.0); 1.5.0 (RC ou final) no registry, checkpoint (a) |
| O4   | CTG-0003 (contrato): TASK-0005                                                           | `work/rounds/R-0022/contracts/CTG-0003…0006.md`, spec upstream §8                                                                                                                                                                                       | O3 e caracterização reexecutada verde após o bump; checkpoint (c)                                    |
| O5   | CTG-0003: TASK-0006 ∥ CTG-0005: TASK-0008                                                | `backend/app/src/{app.module,detran-runtime}.ts` e rotas públicas do Portal × serviços SSE de `apps/{rait,dashboard,portal,teat}/web/src/app/core/**`                                                                                                   | O4                                                                                                   |
| O6   | CTG-0004: TASK-0007 ∥ CTG-0006: TASK-0009 (condicional) (∥ TASK-0008, se ainda em curso) | `backend/app/src/{teat,portal,dashboard}-stream.*` e `backend/app/src/handwritten/rait/rait-stream.*` × escopo de `MOD-shared-documents` e `app.module.ts`; se TASK-0007 precisar de `app.module.ts` (fábricas do poller), serializa atrás de TASK-0009 | TASK-0006 (as duas: dependência de TASK-0007 e lock `MOD-app-module` de TASK-0009)                   |
| O7   | CTG-0007: TASK-0010                                                                      | ADR nova e emendas, `sse-stream-contract.md`, `rait-events-sse-contract.md`, `detran-ui-guide.md`, `waves.md`, `backlog.md`                                                                                                                             | O5 e O6 (TASK-0009 incluída, porque a ADR de divisão registra a assinatura)                          |

A ordem de prova fica: o commit do CTG-0001 precede o commit de TASK-0004 (caracterização commitada
antes de qualquer troca), e a caracterização é reexecutada verde depois do bump, com o _shim_ ainda
presente, antes de O5.

**Abertura empilhada.**

- **Base:** enquanto R-0021 não estiver em `main`, a worktree nasce de
  `origin/orchestra/stynx-canonical`
  (`git worktree add -b orchestra/stynx-sse-tenancy "/Volumes/Thiamat II/stech/detran-worktrees/stynx-sse-tenancy" origin/orchestra/stynx-canonical`);
  depois disso, de `origin/main`. Revisões de R-0021 entram por `git merge --no-edit`, nunca por
  rebase de branch publicado.
- **Pode ser feito antes do merge de R-0021:** a rodada inteira, O1…O7. Do CTG-0002 em diante, o
  desenvolvimento sobre `1.5.0-rc.N` é permitido (OD-S15-01).
- **Espera o merge de R-0021:** só o PR final. Ele também exige a STYNX 1.5.0 **final** publicada,
  o pin `1.5.0` final em todos os manifestos e a tabela de conformidade §7 preenchida (OD-S15-01,
  OD-R22-02).
- **Caracterização sobre `main` (regra de A-C2-11, mantida):** antes do PR final, o maestro roda de
  novo a caracterização numa worktree temporária destacada no commit do CTG-0001, integrado
  localmente a `origin/main` por merge não publicado. Os comandos são `pnpm --filter @detran/app test:e2e`,
  `pnpm backend:rls-smoke` e `pnpm --filter @detran/{rait,dashboard,portal,teat}-web test`. O
  resultado vai para §Concorrência. Um teste que precise mudar por efeito documentado de R-0021 exige
  adenda numerada do Architect antes da edição. Sem justificativa em R-0021, a divergência é
  `plant-bug` de R-0021, nunca ajuste de teste.
- **Downstream:** R-0023 (inteira) e R-0024 (CTGs de frontend) empilham sobre
  `origin/orchestra/stynx-sse-tenancy`. O push de O3 (pin) libera o CTG-0002 em diante de R-0023; o
  push de O5 (SSE Angular) libera o CTG-0003 de R-0024.

**Sequência final** (C-0002 §12, nesta ordem):

1. `git fetch -q origin` e `git merge --no-edit origin/main`, com R-0021 já em `main`; caracterização
   sobre `main` (acima); se a rodada correu em RC, pin `1.5.0` final, `pnpm install` e commit do
   lockfile.
2. CI local completo: `pnpm check`; `pnpm backend:test:ci`; `pnpm --filter @detran/app test:e2e`;
   `pnpm backend:rls-smoke` (igual à linha de base do CTG-0001) e `pnpm verify:rls-ddl`;
   `pnpm verify:stynx-pin`; `pnpm verify:decorators` e `pnpm verify:role-catalog`;
   `pnpm --filter @detran/{rait,dashboard,portal,teat}-web test`, `typecheck`, `lint` e `build`;
   `pnpm contracts:check`, `pnpm docs:kb:check`, `pnpm docs:kb:publish-check`, `pnpm format:check`;
   as verificações de arquivo (`grep`/`ls`) dos critérios; `pnpm devai:rc:prepare` quando aplicável.
3. **Uma** delivery-review (Sol 6, nível grande, pela ponte) sobre o diff inteiro da rodada:
   `REVIEW` → correções restritas, no máximo 2 ciclos; `FAIL` → `escalated`. Não há waiver em
   tenancy/SSE.
4. **Um** PR contra `main`, pelo template, com a tabela CTG → tarefas → commits e os gates.
5. CI remoto; falha de código volta à tarefa responsável; merge só com CI verde e `PASS`.
6. Publicação: `evidence-R-0022.json` com os 7 CTGs, `devai evidence record` e `evidence verify`,
   `devai audit observe` no sha do merge, `closure.json`, `devai round close`, `devai round seal`,
   `waves.md` e `backlog.md`.

**Janelas recalibradas:** 3 → **≈ 2,5**. Janela 1: bootstrap, prompt-review única, O1 e O2, sem
esperar R-0021. Janela 2: O3…O5. Janela 3 (meia): O6, O7 e a sequência final. O ganho vem de trocar
7 ciclos de PR/CI/review por 1 e de tirar o CTG-0001 do caminho crítico. O prazo real continua
preso à 1.5.0 final (S-1.5) e ao merge de R-0021, não ao trabalho da rodada.

## Decisões do Owner — OD-S15-01 (2026-09-26)

Decisão registrada em `work/campaigns/C-0002-stynx-upstream-spec.md` §Decisões do Owner. Efeito nesta
rodada:

- Desenvolver sobre `1.5.0-rc.N` é permitido. O merge de cada CTG exige o pin `1.5.0` final e a
  tabela de conformidade preenchida.
- A correção de tenancy consome o **middleware de contexto do core** (UPS-TEN-01 (b)). O _patch_ de
  protótipo e `seedPortalPublicRequest` saem por completo.
- Em rota pública, um conflito Host × `X-Tenant-Id` é **rejeitado**. O Inspector acrescenta o
  negativo (Host A + cabeçalho B → rejeição) à caracterização do CTG de tenancy.
- Todos os itens `UPS-*` de U1–U3 e UPS-TEST-01 são MUST: não existe ramo "SHOULD ausente".

## Metas

1. **Conformidade da 1.5.0.** Na abertura, o maestro confere a tabela §7 da especificação upstream
   devolvida por S-1.5 contra os `.d.ts` **publicados** de 1.5.0 e registra a conformidade real por
   adenda (§8 da spec). Contratos desta rodada nascem só dos símbolos publicados.
2. **Caracterização antes da troca** (Inspector), verde sobre 1.4.0 e sobre 1.5.0 antes de qualquer
   remoção:
   - **tenancy/RLS:** A/B de ordem de interceptores (a ADR-0005 §8 cita o A/B de 2026-08-31, que não
     existe mais como spec nomeado); negativos (sem _membership_ → 403, cabeçalho ≠ claim → 403, UUID
     inválido → 400, Host A + `X-Tenant-Id` B em rota pública → contexto A ou rejeição, nunca B);
     autenticação oportunista de `POST /v1/portal/manifestations`; ator nominal OD-P27; linha de base
     `pnpm backend:rls-smoke` guardada no relatório e repetida após cada CTG;
   - **SSE backend:** tabela de conformidade sobre os 4 fluxos (enquadramento, heartbeat com agendador
     falso, `Last-Event-ID`, 204 > 24 h, id desconhecido, **evento do tenant B nunca entregue a A**,
     `Last-Event-ID` de B tratado como desconhecido, filtro por política, _ticks_ serializados;
     429/`: dropped` só DASHBOARD); `rait-stream.e2e.spec.ts` ganha teste HTTP (hoje 764 bytes, só
     funções);
   - **SSE Angular:** por app, estados, backoff, polling, 401/403 → `stopped`, 429 + `Retry-After`,
     `Last-Event-ID`, 204, deduplicação; teste-alvo "TEAT web envia _bearer_ e `X-Tenant-Id`" marcado
     `it.fails` (defeito conhecido) que o CTG-0005 inverte.
3. **Pin 1.4.0 → 1.5.0** na lista de manifestos fixada por R-0021, em `tools/blueprints/generate.mjs`
   e no lockfile; `pnpm verify:stynx-pin` (entregue por R-0021) passa a exigir 1.5.0.
4. **Tenancy:** remoção de `patchTenantContextInterceptorOrdering`
   (`backend/app/src/app.module.ts:203-290`) e de `request.portalPublic`
   (`detran-runtime.ts:557`, `seedPortalPublicRequest`:575, chamada em `app.module.ts:415`); rotas
   `@Public()` do Portal pelo mecanismo publicado (UPS-TEN-02/03); `DetranTenantResolver`
   (`detran-runtime.ts:489`) recebe o Host pelo contexto (UPS-TEN-04) e `portalRequestHostStorage`
   (`detran-runtime.ts:468`) sai quando não restar consumidor; ADR-0005 §8 emendada ("shim retirado em
   1.5.0").
5. **SSE backend com fonte única:** `backend/app/src/{teat,portal,dashboard}-stream.{controller,service}.ts`
   e `backend/app/src/handwritten/rait/rait-stream.{controller,service}.ts` (≈ 1.570 l. sem specs)
   passam ao serviço STYNX; ficam locais só os filtros de negócio (mapa tipo → recurso, escopo do
   sujeito do Portal, finalidade/camada do DASHBOARD), a projeção sem `tenantId`/PII e a
   `EventStreamSource` sobre `integration.outbox` (se UPS-OBX-01 não publicado, OD-R22-01). Escopo de
   tenant explícito por conexão em todos (hoje TEAT e RAIT dependem do ALS propagado pelo temporizador).
6. **SSE Angular com fonte única:** RAIT (`apps/rait/web/src/app/core/{sse.service,stream-transport}.ts`),
   DASHBOARD (`apps/dashboard/web/src/app/core/sse/*`), Portal (`apps/portal/web/src/app/core/realtime.service.ts`)
   e TEAT web (`apps/teat/web/src/app/core/sse.service.ts`) delegam a `provideStynxEventStream` com a
   configuração atual de cada app (OD-R22-03); saem _parsers_, transportes e dublês locais (≈ 1.650 l.).
   TEAT web deixa de usar `EventSource` sem _bearer_ (defeito). O serviço fino por app que sobrar é o que
   R-0024 consolida em `@detran/ui`.
7. **Assinatura final (condicional):** remoção dos contornos que R-0021 manteve atrás da porta da
   fachada (OD-R21-01) para as lacunas UPS-SIG agora publicadas; lacuna não publicada → contorno fica,
   desvio atualizado na ADR de divisão STYNX × DETRAN.
8. **Documentação:** contrato SSE comum `docs/framework/arch/sse-stream-contract.md` (novo;
   `rait-events-sse-contract.md` §3 passa a apontar para ele), ADR nova "SSE e tenancy pela plataforma
   STYNX", emenda ADR-0005 §8 e ADR-0015 (pin 1.5.0), `detran-ui-guide.md` §SSE, linha da ADR de divisão
   STYNX × DETRAN (R-0021), `waves.md`, `backlog.md`, ODs no registro canônico.

## Tarefas

| Tarefa    | Papel                | Perfil              | Modelo/esforço   | Lock                                                                                  | Depende de           | Entrega                                                                                                                                                                                                                                                                                                                                                     |
| --------- | -------------------- | ------------------- | ---------------- | ------------------------------------------------------------------------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TASK-0001 | Architect            | architect-blueprint | Opus 5.5 / alto  | `MOD-r22-contracts`, `MOD-kb-open-decisions`                                          | —                    | `contracts/CTG-0001.md`: inventário das 4+4 costuras SSE e da tenancy (arquivo, linhas, comportamento a preservar, divergências), lista fechada de perfis de tenancy e de fluxos, critérios C-01-nn (presença e ausência); `docs/framework/arch/sse-stream-contract.md` (contrato de fio comum, rascunho); OD-R22-01…03 em `open-decisions-rait.md` §C-0002 |
| TASK-0002 | Inspector            | inspector-tests     | Opus 5.5 / médio | `MOD-app-tests-tenancy`, `MOD-app-tests-sse`                                          | TASK-0001            | `backend/app/tests/e2e/tenancy-context.e2e.spec.ts` (A/B com o _shim_ desligado por _flag_ só de teste; negativos da meta 2); `backend/app/tests/e2e/sse-conformance.e2e.spec.ts` (tabela sobre os 4 fluxos); teste HTTP em `rait-stream.e2e.spec.ts`; saída de `pnpm backend:rls-smoke` no relatório                                                       |
| TASK-0003 | Inspector            | inspector-tests     | Sonnet 5 / médio | `MOD-web-tests-sse`                                                                   | TASK-0001            | spec de caracterização da costura SSE em cada app (rait, dashboard, portal, teat/web) com os casos da meta 2; `it.fails` do _bearer_ no TEAT web com o motivo                                                                                                                                                                                               |
| TASK-0004 | Engineer             | engineer-backend    | Sonnet 5 / médio | `MOD-deps-stynx-pin`, `MOD-blueprints-generator`                                      | TASK-0002, TASK-0003 | pin 1.5.0 em todos os manifestos da lista e em `generate.mjs`; `verify:stynx-pin` exigindo 1.5.0; `pnpm blueprints:check` sem diff além da versão; lockfile pelo maestro; nenhuma mudança de comportamento (caracterização verde com o _shim_ ainda presente)                                                                                               |
| TASK-0005 | Architect            | architect-blueprint | Opus 5.5 / alto  | `MOD-r22-contracts`, `MOD-upstream-spec`                                              | TASK-0004            | `contracts/CTG-0003.md`…`CTG-0006.md` a partir dos `.d.ts` publicados (símbolos reais, mapa arquivo → remoção, configuração por app, critérios C-0n-nn); adenda na spec §8 com a conformidade real                                                                                                                                                          |
| TASK-0006 | Engineer             | engineer-backend    | Opus 5.5 / alto  | `MOD-app-module`, `MOD-app-runtime`, `MOD-portal-public-routes`                       | TASK-0005            | remoção do _patch_ e de `portalPublic`; rotas públicas do Portal no mecanismo publicado; resolver com Host do contexto; TASK-0002 verde **sem edição** (salvo a remoção da _flag_ do _shim_, prevista em C-03-nn)                                                                                                                                           |
| TASK-0007 | Engineer             | engineer-backend    | Opus 5.5 / médio | `MOD-app-sse-backend`                                                                 | TASK-0006            | 4 fluxos sobre o serviço STYNX; filtros e fonte locais; escopo explícito; `sse-conformance` e as 4 suítes `*-stream.e2e.spec.ts` verdes sem edição                                                                                                                                                                                                          |
| TASK-0008 | Engineer             | engineer-frontend   | Opus 5.5 / médio | `MOD-rait-web-sse`, `MOD-dashboard-web-sse`, `MOD-portal-web-sse`, `MOD-teat-web-sse` | TASK-0005            | cada app delegando a `provideStynxEventStream`; remoção de _parsers_/transportes/dublês locais (dublês de `@stynx-nyx/angular/testing`); `it.fails` do TEAT web invertido para `it` (única mudança de teste permitida, prevista em C-05-nn)                                                                                                                 |
| TASK-0009 | Engineer             | engineer-backend    | Sonnet 5 / médio | `MOD-shared-documents`, `MOD-app-module`                                              | TASK-0005            | **condicional** a UPS-SIG publicada: remoção do contorno correspondente atrás da fachada; testes de fail-closed de R-0021 verdes sem edição; sem item publicado → `cancelled` com registro                                                                                                                                                                  |
| TASK-0010 | Architect (transcr.) | transcriber-docs    | Sonnet 5 / baixo | `MOD-docs`, `MOD-adr`                                                                 | TASK-0007, TASK-0008 | ADR nova (número conferido em `docs/meta/adr/README.md`), emendas ADR-0005 §8 e ADR-0015, `sse-stream-contract.md` final, `rait-events-sse-contract.md` §3, `detran-ui-guide.md` §SSE, ADR de divisão STYNX × DETRAN (linhas SSE/tenancy/assinatura), `waves.md` §Histórico, `backlog.md`                                                                   |

CTG-0001 = 0001 → 0002 ∥ 0003 (fronteiras disjuntas: `backend/app/tests/**` × `apps/*/*/src/**/*.spec.ts`).
CTG-0002 = 0004 (pin). CTG-0003 = 0005 → 0006 (tenancy). CTG-0004 = 0007 (SSE backend; contrato em
0005). CTG-0005 = 0008 (SSE Angular; pode correr em paralelo ao CTG-0004, locks disjuntos). CTG-0006 =
0009 (condicional). CTG-0007 = 0010. Commits por CTG na branch única; um PR no fim (OD-C2-005).

**Tríade e ordem de prova.** TASK-0002/0003 provados verdes sobre 1.4.0 (saída no relatório — âncora
da caracterização), commitados antes do bump, reexecutados verdes após o bump (CTG-0002, _shim_ ainda
presente) e só então começam as remoções. O Engineer nunca altera teste de caracterização; contradição
teste × contrato → adenda numerada do Architect.

**Checkpoints do maestro (Engineer):** (a) antes de TASK-0004, `npm view @stynx-nyx/tenancy@1.5.0 version`
— sem 1.5.0 publicado, checkpoint e parada (OD-R22-02); (b) após TASK-0004, `pnpm install` e commit do
lockfile; alias em `backend/app/vitest.config.ts` para subpath novo do STYNX importado por spec;
(c) antes de TASK-0005, leitura dos `.d.ts` instalados de 1.5.0 — item MUST ausente bloqueia só o CTG
consumidor.

## Critérios de aceitação (comandos → resultado)

Todos existem em `package.json` hoje, salvo `verify:stynx-pin` (entregue por R-0021, upstream desta rodada).

- `pnpm --filter @detran/app test:e2e` → verde, com `tenancy-context.e2e.spec.ts` e
  `sse-conformance.e2e.spec.ts` presentes e sem `skip`; saída verde sobre 1.4.0 citada no relatório de TASK-0002.
- `pnpm backend:rls-smoke` → OK, mesma saída da linha de base de CTG-0001; `pnpm verify:rls-ddl` → OK.
- `pnpm backend:test:ci` → verde.
- `pnpm verify:decorators` → OK (os 4 fluxos continuam `@Get` com metadado de recurso/ação visível);
  `pnpm verify:role-catalog` → OK.
- `pnpm verify:stynx-pin` → OK, todos os manifestos em `1.5.0`, 0 divergências.
- `pnpm --filter @detran/rait-web test`, `pnpm --filter @detran/dashboard-web test`,
  `pnpm --filter @detran/portal-web test`, `pnpm --filter @detran/teat-web test` → verdes; o teste de
  _bearer_ do TEAT web deixa de ser `it.fails` só no CTG-0005. `… typecheck|lint|build` dos 4 apps → verdes.
- Verificações de arquivo (após CTG-0003/0004/0005):
  `grep -c "TenantContextInterceptor.prototype" backend/app/src/app.module.ts` → `0`;
  `grep -rn "portalPublic" backend/app/src` → vazio;
  `grep -rln "text/event-stream" backend/app/src` → vazio;
  `grep -rln "new EventSource(" apps/*/*/src` → vazio;
  `ls apps/rait/web/src/app/core/stream-transport.ts apps/dashboard/web/src/app/core/sse/stream-transport.ts` → inexistentes.
- `pnpm contracts:check` → OK (rotas SSE e públicas inalteradas); `pnpm docs:kb:check`,
  `pnpm docs:kb:publish-check`, `pnpm format:check` → OK.
- `pnpm check` → verde ao fim de cada CTG.
- DEVAI: `pnpm exec devai evidence record` por CTG e `evidence verify` OK; `audit observe` no sha de
  cada merge; no fechamento `devai round close` **e** `devai round seal`, com a âncora na cadeia.

## Mapa entregável → definições

| Entregável           | Definição                                                                                                                                                                                                  |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| conformidade 1.5.0   | `work/campaigns/C-0002-stynx-upstream-spec.md` §3, §4, §6.6, §6.11, §6.12, §7, §8; OD-C2-004                                                                                                               |
| tenancy              | ADR-0005 §8; `backend/app/src/app.module.ts:203-290,415`; `detran-runtime.ts:468,489,557,575`; R-0009 CTG-0001 §8/§9 (M11) e CTG-0002 §2.8 (OD-P30); OD-P27                                                |
| SSE backend          | `docs/framework/arch/rait-events-sse-contract.md` §1, §3, §5; os 8 arquivos `*-stream.*` citados; `backend/app/src/app.module.ts:871-885` (fábricas do poller); `boat-route-contract.md` (tipos `crash.*`) |
| SSE Angular          | DIVERGE-1; `docs/framework/arch/detran-ui-guide.md`; contratos de front de R-0012 (RAIT), R-0013 (TEAT web), R-0014 (Portal), R-0016 (DASHBOARD)                                                           |
| pin                  | ADR-0015; `wp0-stynx-1-3-1-migration.md`; `tools/check-stynx-pin.ts` (R-0021)                                                                                                                              |
| assinatura           | ADR-0018 §1; ADR de divisão STYNX × DETRAN e contratos CTG-0003 de R-0021                                                                                                                                  |
| negativos de tenancy | ADR-0005; `tools/check-rls-smoke.ts`; `backend/app/tests/e2e/policy-routes.e2e.spec.ts` (leitura de rotas por `ModulesContainer`)                                                                          |

## Riscos

- **Regressão de isolamento de tenant é crítica.** A remoção do _patch_ toca toda requisição. Reviewer
  grande (Sol 6) em toda delivery-review; **nenhum waiver** substitui PASS em CTG-0003/0004 (antiexemplo:
  waiver SQL2 de R-0007). Vazamento entre tenants → `FAIL`, rodada parada, triagem `plant-bug` ou
  `policy-issue`.
- **Escopo do _tick_ SSE:** TEAT e RAIT dependem do ALS propagado por `setInterval`; o escopo explícito
  pode revelar consulta sem tenant. O teste "evento de B nunca entregue a A" roda com RLS real
  (`backend:test:ci`), nunca com dublê.
- **API publicada ≠ proposta:** contratos só depois da 1.5.0 e dos `.d.ts` publicados (TASK-0005). MUST
  ausente → checkpoint (OD-R22-02), nunca _shim_ novo nem cópia local do código STYNX.
- **Mudança de comportamento disfarçada:** intervalos de polling/backoff por app são requisito dos
  contratos de cada app; preservados (OD-R22-03). A única mudança prevista é o _bearer_ no TEAT web.
- **Atraso de S-1.5** trava o caminho crítico (C-0002 §3): o maestro não antecipa remoções; grava
  checkpoint após CTG-0001.
- Gerados (`packages/api-clients/src/generated/**`, DDL de blueprint) nunca editados à mão.

## Lições aplicadas (C-0001; `waves.md` §Histórico)

- **Relatórios versionados:** `work/rounds/R-0022/reports/` com `git add -f` até R-0018 corrigir o
  `.gitignore`; depois de cada `git add`, comparar `find <dir> -type f` com `git ls-files <dir>` (R-0016).
- **Critérios imutáveis:** mudança só por adenda numerada com decisão do Owner; critério substituído
  aparece no closure como não cumprido, nunca PASS.
- **ODs no registro canônico:** `open-decisions-rait.md` §C-0002 no commit do CTG-0001 (entra no PR
  final).
- **Âncora da prova:** `audit observe` no sha exato do merge; `round close` + `round seal` com a âncora;
  se outra rodada fechar antes, aceitar a cadeia de `main`, observar o HEAD integrado e repetir `round close`.
- **Orçamento:** `budget.json` desde o bootstrap; 80 % da janela → checkpoint e parada.
- **Caracterização antes da troca**, com presença e ausência; matriz de negativos de RLS/tenancy
  gerada e versionada antes e depois (C-0002 §4).
- Dependência nova: `pnpm install` e lockfile pelo maestro antes de liberar Inspector/Engineer.

## Decisões pendentes do Owner

| OD        | Pergunta                                                                                                                                   | Opções                                                                                                                                         | Recomendação do Architect                                                                    |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| OD-R22-01 | Fonte SSE se UPS-OBX-01 (outbox como log) não for publicado                                                                                | (a) `EventStreamSource` local sobre `integration.outbox` (mapeamento de dados, sem enquadramento nem cursor próprios); (b) adiar o SSE backend | (a): a fonte é plugável por contrato (UPS-SSE-03); o genérico sai de qualquer forma          |
| OD-R22-02 | Item MUST da spec ausente da 1.5.0 publicada                                                                                               | (a) checkpoint e parada do CTG consumidor até 1.5.x; (b) manter o código local com desvio em ADR e seguir                                      | (a) para UPS-TEN e UPS-SSE/NGSSE; (b) só para SHOULD/MAY                                     |
| OD-R22-03 | Parâmetros do cliente SSE por app (polling 15 s RAIT/TEAT, 30 s DASHBOARD, 60 s Portal; backoff 1→30 s RAIT/DASHBOARD, sem backoff Portal) | (a) preservar como configuração de cada app; (b) unificar num valor da plataforma                                                              | (a): os valores vêm dos contratos de cada app; unificar é decisão de produto fora da ação 7c |

Decisões já tomadas e respeitadas: OD-C2-004 (1.5.0), OD-C2-001 (ordem), OD-P27 (ator nominal),
OD-P30 (autenticação oportunista), OD-R21-01 (contornos de assinatura atrás da fachada, se aprovada).

## Decisões do maestro

## Concorrência

## Triagem

## Adendas

**A-C2-11 (Owner, 2026-09-27): abertura antecipada do CTG-0001.** Esta rodada pode **abrir antes
do merge de R-0021**, somente para o CTG-0001, que é caracterização pura de tenancy/RLS e SSE sobre o
comportamento atual.

- **Base:** o CTG-0001 nasce **empilhado** em `origin/orchestra/stynx-canonical` (R-0021), ou em
  `origin/main` se R-0021 ainda não tiver publicado o branch. As revisões de R-0021 são integradas por
  `git merge --no-edit`, nunca por rebase de branch publicado.
- **O que pode ser feito antes do merge de R-0021:** TASK-0001 (contrato e inventário), TASK-0002 e
  TASK-0003 (testes de caracterização), a prompt-review e a delivery-review do CTG-0001.
- **O que espera o merge de R-0021:** o PR do CTG-0001 contra `main`. Depois do merge, o maestro
  integra `origin/main`, roda de novo toda a caracterização e grava o resultado em §Concorrência.
  Qualquer teste que precise mudar por efeito documentado de R-0021 (troca do despacho RENACH, pin
  1.4.0) exige adenda numerada do Architect **antes** da edição, e a delivery-review é refeita
  restrita a essa mudança. Sem justificativa em R-0021, a divergência é tratada como regressão de
  R-0021 (triagem `plant-bug`, comunicada a R-0021), nunca como ajuste de teste.
- **O que não muda:** os CTG-0002 em diante continuam exigindo R-0021 em `main` e STYNX 1.5.0 final
  para o merge (OD-S15-01). O desenvolvimento sobre `1.5.0-rc.N` continua permitido.
- **Locks:** o CTG-0001 toca só `backend/app/tests/**` e `apps/*/*/src/**/*.spec.ts`; nenhum lock é
  comum com R-0021. Se R-0021 alterar algum desses caminhos, o conflito é resolvido por merge no
  empilhamento.
- **Subsumida por OD-C2-005 (2026-09-27):** a rodada inteira pode abrir empilhada, não só o CTG-0001.
  Deixam de existir o PR e a delivery-review próprios do CTG-0001. Continuam valendo a reexecução da
  caracterização sobre `main` antes do PR final e a regra "caracterização commitada antes de qualquer
  troca" dentro da branch (§Execução OD-C2-005).

## Bloqueios

## Retomada

## Leitura
