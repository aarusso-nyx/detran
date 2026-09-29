# R-0022 — frente `stynx-sse-tenancy` (C-0002, ação 7c: pin 1.5.0, SSE com fonte única, tenancy sem _monkey-patch_, assinatura final)

> **Adenda vigente A1 (2026-09-27), em §Adendas:** R-0022 recebe assinatura, outbox e offline-sync inteiras de R-0021; não pressupor migrações parciais. A transferência não autoriza o início desta rodada.

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

> **Adenda A-C2-13 (Owner, 2026-09-29; prevalece).** Estado verificado: a S-1.5 terminou,
> `@stynx-nyx/*` **1.5.0 final** está publicado (STYNX #308/#309) e R-0021 está fechada (PC-0019).
> Esta rodada **abre já**.
>
> - **Pin:** a maior versão **1.5.x final** publicada no bootstrap, exata em todos os manifestos,
>   pela fonte única `tools/stynx-version.json` (A1). Se a 1.5.2 (#314 do STYNX) sair antes do CTG
>   que troca o pin, ela é adotada. A conformidade (tabela §7 da especificação) é conferida contra a
>   versão fixada.
> - **R-0020 parada não bloqueia esta rodada.** Os locks de R-0020 (CI, `.devai/config`, `record/`)
>   são partilhados por merge. Os gates novos de R-0020 passam a valer quando ela mesclar.
> - **Onda de pin publicada cedo:** R-0023 (O1) e R-0024 (O1–O4) empilham neste branch. Publique
>   (`git push`, sem PR) a onda do pin e a do SSE Angular assim que ficarem verdes.

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

Maestro Opus 5.5 (`claude-opus-5-5`, Claude Code 2.1.283), bootstrap de 2026-09-29. Papéis: Architect
ao planejar e revisar; Engineer ao commitar.

- **M1 — ids de modelo** (reconfirmados com chamada mínima, `claude -p --model <id>` e
  `codex exec -m <id>`; `claude --help`/`codex --help` não listam ids): Opus 5.5 = `claude-opus-5-5`,
  Sonnet 5 = `claude-sonnet-5`, Sol 6 = `gpt-6-sol` (`codex-cli` 0.157.1). Sem divergência com
  `model-ladder.md`.
- **M2 — worktree e branch.** `/Volumes/Thiamat II/stech/detran-worktrees/stynx-sse-tenancy` não
  existe nesta máquina. A rodada corre na worktree gerida pelo app
  `/Users/aarusso/Development/detran/.claude/worktrees/r-0022-stynx-sse-tenancy-c949d9`, na branch
  `orchestra/stynx-sse-tenancy` criada de `origin/main` `c325f9b5` (A-C2-13: abre sobre `origin/main`).
  Nenhuma outra worktree ou branch desta frente existia (descoberta de estado registrada em
  §Concorrência).
- **M3 — pin.** Maior 1.5.x final no registry em 2026-09-29: **1.5.0** (`latest=1.5.0` nos 25 pacotes
  `@stynx-nyx/*` consumidos; não há 1.5.1 nem 1.5.2). Se a 1.5.2 (STYNX #314) sair antes de O4, TASK-0004
  a adota. Tarballs 1.5.0 extraídos, fora do repositório, em `~/.cache/detran-r22/stynx-1.5.0/`
  (`SHA256SUMS` no mesmo diretório; ex.: tenancy `4b6c1c33…`, backend `660aac91…`, angular `cce512e6…`,
  outbox `c894be7b…`, offline-sync `d4892e4b…`, signature `813490dd…`, data `f6435ce2…`). É a fonte
  **publicada** dos contratos das migrações antes de O4 (lição 15).
- **M4 — conformidade preliminar (símbolos).** Todos os MUST de A1 e de U1–U3/UPS-TEST-01 têm símbolo
  nos `.d.ts` publicados de 1.5.0: `PublicTenantRoute`/`PublicTenantRouteOptions`,
  `TenantResolverContext.host/path`, `StynxEventStreamModule/Service`, `EventStreamSource`,
  `provideStynxEventStream`, `FakeStynxEventStreamTransport/Clock`, `SignatureRequest.minimumSignatureLevel`,
  `SignatureManifestService`, `SignatureWithdrawalVerifier`, `SignatureReadinessIndicator`,
  `OutboxService.appendInTransaction`, `OutboxEventStreamSource`, `dispatchEventsDue`/`ackEvent`/
  `cutoverLegacyMessages`, `OfflineSyncItemApplier`, `OfflineSyncConcurrencyDetector`,
  `settleNumberingReservation`, `getSyncItemReceipt`, `OfflineSyncDurableStore`. O STYNX devolveu a
  tabela §7 em `stynx/work/rounds/R-0002/conformance-1.5.0.md` (leitura, sem escrita). Conformidade
  **de comportamento** continua a cargo de TASK-0005 e dos contratos de migração; MUST divergente →
  checkpoint do CTG consumidor (OD-R22-02).
- **M5 — bancos.** PostGIS descartável exclusivo `detran-r22-postgis` (porta local 59722, mesma imagem
  do CI), banco `detran_r7_ctg1_a2` preparado por `pnpm backend:test:prepare-legacy`. Workers de
  backend em paralelo recebem, cada um, um contêiner próprio (`detran-r22-postgis-<n>`) e um arquivo de
  ambiente em `~/.cache/detran-r22/env/`; nenhum worker cria, reseta ou aplica DDL fora do seu
  contêiner.
- **M6 — tarefas em partes.** Onde o contrato de uma migração dividir o trabalho de Engineer em
  partes, o maestro despacha o **mesmo** prompt revisado com o identificador da parte; a parte não
  cria tarefa nova nem prompt novo sem prompt-review.

- **M7 — ODs levantadas pelos workers** (numeração do maestro; registro canônico em
  `open-decisions-rait.md` §C-0002 no commit da tarefa que as decidir; até a decisão, padrão
  fail-closed: preservar o comportamento atual e não despachar o que depender delas):
  OD-R22-04 (SSE RAIT sem filtro por papel/pool; TASK-0001), OD-R22-05 (DASHBOARD: `id` repetido e
  429 sem `Retry-After`; TASK-0001), OD-R22-06…14 = OD-R22-S01…S09 de `contracts/CTG-0006.md`
  (assinatura; TASK-0011). OD-R22-06…14 bloqueiam só TASK-0009 (O8). OD-R22-15…21 = P-08-1…7 de `contracts/CTG-0008.md`
  (outbox; TASK-0013): 15 bloqueia TASK-0015 parte 1; 16…19 bloqueiam a parte 2 (e, por dependência,
  TASK-0007 e TASK-0018); o corte de `integration.*` sem símbolo publicado é candidato a OD-R22-02.
  OD-R22-22…32 = P-09-1…11 de `contracts/CTG-0009.md` (offline-sync; TASK-0016); as divergências
  D-01…D-05, D-08, D-09 da 1.5.0 põem TASK-0018 em checkpoint provável (OD-R22-02). OD-R22-33: evidência de
  decisão (`verifySignatureEvidence`) sem vínculo de tenant em 1.4.0 (TASK-0012). OD-R22-34…36:
  prova HTTP do lado B, filtro `device_id` de recibos e `actor.id` não observável (TASK-0017).

## Concorrência

Descoberta de estado (2026-09-29, `origin/main` = `c325f9b5`, merge do PR #157):

- **R-0021** inteira em `main`: #149 (CTG-0001), #151 (pin 1.4.0 e verificador dinâmico), #153
  (CTG-0007), #154 (close sem selo, PC-0019). Nenhum upstream da rodada pendente de merge.
- **STYNX 1.5.0 final** publicado em 2026-09-29T00:55Z (`npm view @stynx-nyx/tenancy@1.5.0 version`
  → `1.5.0`); RC.1 e RC.2 não são usadas.
- **R-0020** (`orchestra/devai-sensors`) parada; nenhum PR aberto dela. Locks partilhados por merge no
  fim: CI, `.devai/config`, `record/`.
- **PR #158** (Owner, `docs/c0002-a-c2-13`, aberto) edita este `plan.md` (inserção no topo de
  §Execução OD-C2-005), `C-0002-consolidacao.md` §14 e os planos de R-0030/R-0031. Esta rodada não
  edita aquele trecho; o conflito, se houver, resolve-se no merge de `origin/main` da sequência final.
- **Downstream:** R-0023 (O1 já; resto empilhado aqui), R-0024 (O1–O4 empilhados depois do push de O4
  e de O6), R-0031 (não toca os adaptadores de assinatura), R-0032 O3 (eventos `ch` pelo outbox
  migrado aqui).
- Linha de base no bootstrap: `pnpm backend:rls-smoke` → `check-rls-smoke: OK (tenant isolation, 140
inf/ch tables, ops RLS, SRID-4674 round-trip, audit persistence)`
  (`reports/baseline-rls-smoke.log`); `pnpm check` em `reports/baseline-check.log`.

## Triagem

- TASK-0002: `plant-bug` (vazamento C-01-09, sem dispensa) → parada B2; `reference-gap` em C-01-01
  (braço core-antes não atende P2 em 1.4.0) e C-01-04 (UUID inválido → 403, não 400) → adendas do
  Architect pendentes.
- TASK-0014 iteração 1: `reference-gap` (leitura fechada insuficiente) → adenda A1 do CTG-0008 e
  iteração 2 com ampliação concreta.

## Adendas

### A1 — transferências integrais de R-0021 (2026-09-27)

Autoridade: plano revisto de R-0021 aprovado pelo Owner; OD-R21-01…06; campanha A11 e
especificação upstream §8.1/A1. Esta adenda prevalece sobre as metas 3, 5 e 7, TASK-0004,
TASK-0009, CTG-0006 e referências a contratos/fachadas de R-0021 ainda não produzidos.
A tabela de tarefas e os critérios anteriores permanecem como histórico; esta rodada segue
proposta, sem autorização de início por este registro.

1. R-0021 entrega caracterização e pin/gate 1.4.0, com fechamento sem selo; **nenhuma** migração
   de assinatura, despacho/outbox ou offline-sync é pressuposta. Para a abertura de R-0022,
   conferir PRs, fechamento real e critérios transferidos, sem exigir nem alegar selo de R-0021.
2. Receber as migrações **inteiras**: assinatura (incluindo composição e fachada), outbox
   (despacho RENACH e log de eventos), offline-sync (deduplicação, numeração, lote, recibos,
   aplicação transacional e conflitos). TASK-0009 deixa de ser simples remoção condicional de
   contornos: deverá ser redecomposta em tríade para a migração completa. Outbox e offline
   ganham grupos e tarefas próprios no futuro bootstrap, sem renumerar tarefas históricas.
3. Antes de produzir prompts de implementação, Architect atualiza o DAG, fronteiras, locks,
   estimativa de janelas e critérios; Inspector reaproveita e amplia a caracterização R-0021,
   verde sobre 1.4.0 antes e sobre a release alvo depois. Nenhum Engineer remove mecanismo
   genérico antes da prova dos requisitos UPS-SIG/OBX/OFS MUST da spec A1.
4. A ausência de UPS-OBX-01 não libera novo mecanismo local de log/cursor pela antiga
   OD-R22-01; bloqueia sua migração. O mapeamento fino do domínio para uma fonte SSE pública
   pode permanecer, mas não substitui capacidade genérica ausente. Regra análoga vale para
   assinatura e offline: checkpoint no CTG afetado, sem novo contorno. Grupos independentes
   continuam conforme seus pré-requisitos comprovados.
5. Pin: atualizar a fonte única `tools/stynx-version.json`, manifestos descobertos dinamicamente
   e lockfile pelo maestro; o gerador e o verificador consomem essa fonte. Não voltar à lista
   histórica fixa de 59 manifestos nem reintroduzir versão literal no gerador.
6. OD-S15-01 continua válida: desenvolvimento/testes podem consumir RC publicada; merge exige
   1.5.0 final e conformidade publicada. RC.2 mantém os arquivos próprios dos três pacotes
   iguais a 1.4.0 (hashes na spec A1); RC.3 local não comprova conformidade.
7. Leitura de entrada substituta: `work/rounds/R-0021/contracts/CTG-0001.md`, relatórios e
   fechamento efetivos, spec §8.1/A1, ADR-0018 e ADR-0036. Não presumir existência de
   `R-0021/contracts/CTG-0003.md` de migração cancelada nem de fachada já convertida.

O encerramento de R-0021 sem selo não autoriza dispensa automática do selo ou de critérios de
R-0022. A adoção de notificações continua vinculada ao produtor OD-P40, fora destas transferências.

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

- **Interação com A1 (acima):** a abertura empilhada passa a ser sobre o branch de R-0021 com o
  escopo revisto por A1. As ondas de §Execução OD-C2-005 são recalculadas no bootstrap, e as três
  migrações recebidas ganham ondas próprias sem violar os locks.

### A2 — decomposição e ondas recalculadas no bootstrap (Architect/maestro, 2026-09-29)

Autoridade: A1 itens 2–3 e A-C2-12 ("as ondas são recalculadas no bootstrap pelo Architect"),
A-C2-13 (pin 1.5.x final, abertura sobre `origin/main`). Esta adenda **não muda critérios** de
aceitação: acrescenta tarefas e grupos para as três migrações recebidas, preserva os ids históricos
e substitui a tabela de ondas de §Execução OD-C2-005. Metas 3, 5 e 7 leem-se com A1.

**Tarefas novas e redefinidas** (ids históricos preservados; novos a partir de TASK-0011):

| Tarefa    | CTG      | Papel     | Perfil              | Modelo/esforço   | Lock (`target_modules`)                                           | Depende de           | Entrega                                                                                                                                                                                                                     |
| --------- | -------- | --------- | ------------------- | ---------------- | ----------------------------------------------------------------- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TASK-0011 | CTG-0006 | Architect | architect-blueprint | Opus 5.5 / alto  | `MOD-r22-contracts-sig`                                           | —                    | `contracts/CTG-0006.md`: inventário, critérios C-06-nn de caracterização (reuso de C-01-01…06 de R-0021) e de migração a partir dos `.d.ts` publicados de 1.5.0 (UPS-SIG-01…04), mapa arquivo → destino, partes do Engineer |
| TASK-0012 | CTG-0006 | Inspector | inspector-tests     | Opus 5.5 / médio | `MOD-r22-tests-sig`                                               | TASK-0011            | specs `r22-signature-*` que codificam C-06-nn; verdes sobre 1.4.0 no que é comportamento atual; os de paridade com a API nova ficam vermelhos/`it.fails` só onde o contrato disser                                          |
| TASK-0009 | CTG-0006 | Engineer  | engineer-backend    | Opus 5.5 / médio | `MOD-shared-documents`, `MOD-ch-signing`, `MOD-app-module`\*      | TASK-0012, TASK-0005 | **redefinida por A1:** migração integral da assinatura para `@stynx-nyx/signature` 1.5.x; testes de R-0021 e de TASK-0012 verdes sem edição                                                                                 |
| TASK-0013 | CTG-0008 | Architect | architect-blueprint | Opus 5.5 / alto  | `MOD-r22-contracts-obx`                                           | —                    | `contracts/CTG-0008.md`: outbox inteira (log de eventos e despacho RENACH, UPS-OBX-01/02), DDL/armazenamento, leitores de `integration.outbox`, corte do legado, critérios C-08-nn, partes                                  |
| TASK-0014 | CTG-0008 | Inspector | inspector-tests     | Opus 5.5 / médio | `MOD-r22-tests-obx`                                               | TASK-0013            | specs `r22-outbox-*` (dois eventos do mesmo agregado, replay, cursor, isolamento, retry/ACK/ledger) sobre 1.4.0                                                                                                             |
| TASK-0015 | CTG-0008 | Engineer  | engineer-backend    | Opus 5.5 / alto  | `MOD-shared-events`, `MOD-integration-ddl`, `MOD-app-module`\*    | TASK-0014, TASK-0006 | migração integral da outbox; caracterização verde sem edição; `pnpm backend:rls-smoke` igual à linha de base                                                                                                                |
| TASK-0016 | CTG-0009 | Architect | architect-blueprint | Opus 5.5 / alto  | `MOD-r22-contracts-ofs`                                           | —                    | `contracts/CTG-0009.md`: offline-sync inteiro (UPS-OFS-01…04 e compatibilidade vinculante da spec A1), critérios C-09-nn, partes                                                                                            |
| TASK-0017 | CTG-0009 | Inspector | inspector-tests     | Opus 5.5 / médio | `MOD-r22-tests-ofs`                                               | TASK-0016            | specs `r22-offline-*` (lote > 100 itens, item legado sem chave, replay de lote fechado, TTL e janela por catálogo, HTTP TEAT/BOAT, rollback, RLS) sobre 1.4.0                                                               |
| TASK-0018 | CTG-0009 | Engineer  | engineer-backend    | Opus 5.5 / alto  | `MOD-ops-offline-sync`, `MOD-ops-offline-ddl`, `MOD-app-module`\* | TASK-0017, TASK-0015 | migração integral do offline-sync; caracterização de R-0021 e de TASK-0017 verde sem edição                                                                                                                                 |

\* `MOD-app-module` (`backend/app/src/app.module.ts` e `backend/app/src/detran-runtime.ts`) é
exclusivo: quem não precisa dele, pelo contrato, não o recebe no prompt; quem precisa, serializa.
TASK-0007 depende também de TASK-0015 (A1 item 4: com UPS-OBX-01 publicado, a fonte SSE é a fonte
publicada sobre o log migrado; não há `EventStreamSource` local sobre `integration.outbox`, e
OD-R22-01 (a) fica sem objeto). TASK-0010 depende de todas as Engineer. TASK-0005 escreve
`CTG-0003…0005.md` e a adenda de conformidade da spec; confere os contratos de migração contra os
`.d.ts` instalados e reporta divergência (o maestro a resolve por adenda numerada antes de despachar
o Engineer). TASK-0009 passa de Sonnet 5 a Opus 5.5 (migração integral, fail-closed).

**Ondas** (substituem a tabela de §Execução OD-C2-005; até 3 workers; o maestro serializa commits):

| Onda | Tarefas em paralelo               | Fronteiras de escrita (disjuntas)                                                                                                                                               | Depende de                                                                  | Push                                  |
| ---- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------- |
| O1   | TASK-0001 ∥ TASK-0011 ∥ TASK-0013 | `contracts/CTG-0001.md`, `sse-stream-contract.md`, `open-decisions-rait.md` §C-0002 × `contracts/CTG-0006.md` × `contracts/CTG-0008.md`                                         | bootstrap e prompt-review única `PASS`                                      | sim                                   |
| O2   | TASK-0002 ∥ TASK-0003 ∥ TASK-0016 | `backend/app/tests/e2e/{tenancy-context,sse-conformance,rait-stream}.e2e.spec.ts` × `apps/*/web/src/**/*.spec.ts` (SSE) × `contracts/CTG-0009.md`                               | O1                                                                          | sim                                   |
| O3   | TASK-0012 ∥ TASK-0014 ∥ TASK-0017 | arquivos `r22-signature-*` × `r22-outbox-*` × `r22-offline-*` (lista fechada por contrato)                                                                                      | O1/O2 (cada Inspector depois do seu Architect)                              | sim — toda a caracterização commitada |
| O4   | TASK-0004 (pin)                   | `tools/stynx-version.json`, manifestos descobertos, `tools/blueprints/generate.mjs` se preciso; lockfile pelo maestro                                                           | O3 commitada; checkpoint (a); caracterização inteira reexecutada após o pin | **sim, cedo (A-C2-13)**               |
| O5   | TASK-0005                         | `contracts/CTG-0003…0005.md`, adenda §8 da spec upstream                                                                                                                        | O4; checkpoint (c)                                                          | sim                                   |
| O6   | TASK-0006 ∥ TASK-0008             | `app.module.ts`/`detran-runtime.ts`/rotas públicas do Portal × serviços SSE dos 4 apps                                                                                          | O5                                                                          | **sim, cedo depois de TASK-0008**     |
| O7   | TASK-0015 (partes)                | escopo de `CTG-0008.md` (eventos compartilhados, DDL de integração, RENACH, leitores)                                                                                           | TASK-0006                                                                   | sim                                   |
| O8   | TASK-0007 ∥ TASK-0009 ∥ TASK-0018 | streams SSE × assinatura/documentos × offline-sync; `MOD-app-module` serializado entre as que o contrato marcar                                                                 | TASK-0015 (0007 e 0018), TASK-0006 (0009)                                   | sim                                   |
| O9   | TASK-0010                         | ADR nova de SSE/tenancy, ADR de divisão STYNX × DETRAN (não criada por R-0021), emendas, `sse-stream-contract.md`, `rait-events-sse-contract.md`, `detran-ui-guide.md`, índices | O6–O8                                                                       | sim; depois a sequência final         |

**A2.1 — correções do ciclo 1 da prompt-review** (Owner autorizou tratar o FAIL como corrigível,
`AUTHORIZATION.md` §Adenda B1; prevalece sobre as tabelas acima onde divergir):

- **Art. 10.** Engineer nunca cria, edita nem remove teste; exceção única: inverter o `it.fails` do
  _bearer_ do TEAT web (C-05-nn). Some a exceção da _flag_ do _shim_: o A/B de TASK-0002 força as
  duas ordens de registro no módulo de teste e é válido antes e depois (200, sem
  `RequestContextMissingError`). Nenhum `it.fails` de paridade nas caracterizações de migração: todo
  caso é válido nas duas fases.
- **TASK-0019 (nova, Inspector, Sonnet 5/médio, CTG-0004/0005, lock `MOD-r22-sse-spec-retirement`)**:
  retira os specs e dublês do mecanismo SSE local listados por TASK-0005 em "Specs a retirar
  (TASK-0019)", cada caso mapeado a um C-01-nn. Onda **O5 = TASK-0005 → TASK-0019**; TASK-0007 e
  TASK-0008 só depois dela. Nas migrações, a retirada é feita pelo Inspector do CTG (TASK-0012,
  TASK-0014, TASK-0017) pela seção "Specs a retirar" do contrato.
- **Arquivos de teste fixos das migrações:** assinatura
  `backend/domains/ch/clinical-reports/tests/unit/r22-signature-characterization.spec.ts`,
  `backend/domains/shared/src/documents/r22-document-trust-characterization.spec.ts`,
  `backend/app/tests/e2e/r22-trust-profiles.e2e.spec.ts`; outbox
  `backend/domains/shared/src/events/r22-outbox-characterization.spec.ts`,
  `backend/app/tests/integration/r22-outbox-characterization.integration.spec.ts`; offline
  `backend/domains/ops/offline-sync/tests/integration/r22-offline-characterization.integration.spec.ts`,
  `backend/app/tests/e2e/r22-offline-sync.e2e.spec.ts`. Todos com `--passWithNoTests=false` nos
  `acceptance_commands` do Inspector e do Engineer do CTG; os specs web de caracterização idem, por
  arquivo, em TASK-0003, TASK-0008 e TASK-0019.
- **Pré-condições de despacho** (no prompt e em `tags` `after:TASK-nnnn` de cada tarefa):
  0004 ← 0002, 0003, 0012, 0014, 0017; 0005 ← 0004, 0011, 0013, 0016; 0006 ← 0004, 0005;
  0016 ← 0013; 0019 ← 0004, 0005; 0008 ← 0005, 0019; 0007 ← 0005, 0006, 0015, 0019;
  0009 ← 0004, 0005, 0006, 0012; 0015 ← 0004, 0005, 0006, 0014; 0018 ← 0004, 0005, 0015, 0017;
  0010 ← 0005–0009, 0015, 0018, 0019. Com 0016 ← 0013, O1 = 0001 ∥ 0011 ∥ 0013 e O2 = 0002 ∥ 0003 ∥
  0016 ficam como estão.
- **RLS:** todo negativo de RLS (inclusive "evento de B nunca entregue a A") executa a operação sob
  `role_app_backend` com o tenant do contexto; owner só prepara e limpa fixtures.
- **TASK-0007** declara `MOD-app-module`; se `CTG-0004.md` disser que não precisa de
  `app.module.ts`, o maestro não lhe entrega o arquivo; se precisar, O8 serializa 0007, 0009 e 0018
  nesse lock.
- **TASK-0013** lê uma lista fechada de 34 arquivos de produção que citam
  `integration.outbox`/`delivery_attempt`/`inbox_receipt` (inventário do maestro), sem busca aberta.

**A2.2 — correções do ciclo 2 da prompt-review** (mesma autorização B1; prevalece onde divergir):

- **Art. 10 sem exceção.** O Engineer não inverte nenhum teste. A inversão do `it.fails` do _bearer_
  do TEAT web passa à **TASK-0020** (Inspector, Sonnet 5/baixo, CTG-0005, depois de TASK-0008);
  o critério de TASK-0008 no spec de caracterização do TEAT é "exatamente uma falha, a do `it.fails`
  do _bearer_ que passou". O push cedo do SSE Angular (A-C2-13) sai depois de TASK-0020.
- **Retirada só com correspondente.** Todo caso retirado (TASK-0019 e Inspectors de migração) tem um
  C-nn que prova o mesmo comportamento; sem correspondente, não se retira.
- **Dublês de serviço antes dos stubs.** `CTG-0005.md` fixa a API pública preservada do serviço SSE
  de cada app; TASK-0019 cria `apps/<app>/web/src/testing/<app>-sse.fake.ts` (rait, dashboard, portal),
  migra os 16 consumidores dos stubs de transporte (fachadas, páginas, componentes,
  `facade.stub.ts`) sem perder caso e só então retira os stubs. TASK-0008 pode tocar
  `apps/rait/web/src/app/data/api/rait-http.ts` (produção que importa o transporte).
- Ondas: **O5 = TASK-0005 → TASK-0019**; **O6 = TASK-0006 ∥ TASK-0008, depois TASK-0020**.

**A2.3 — forma do comando de teste web (triagem `sensor-error`, maestro, 2026-09-29).** Nos apps
web, `test` é comando embutido do pnpm e `pnpm --filter @detran/<app>-web test --passWithNoTests=false <spec>`
falha com `Unknown option: 'passWithNoTests'`. Onde os prompts (TASK-0003, TASK-0008, TASK-0019,
TASK-0020) citam essa forma, o comando executado e aceito é
`pnpm --filter @detran/<app>-web run test --passWithNoTests=false <spec>` (mesmo `vitest`, mesmos
argumentos; coleta vazia sai com exit 1, conferido). Os `acceptance_commands` foram corrigidos; os
prompts revisados ficam intactos (PCs preservados) e o despacho cita esta adenda. C-01-34 recebeu a
adenda A1 do contrato CTG-0001 (cláusula 401/403 que não era comportamento de 1.4.0; divergência
D-W-01 para CTG-0005).

`pnpm backend:rls-smoke` é comparado à linha de base ao fim de cada CTG de O6, O7 e O8. **Janelas
recalibradas:** ≈ 4 (1: bootstrap, prompt-review, O1–O3; 2: O4–O6; 3: O7–O8; 4: O9 e sequência final).

### A3 — efeito das decisões do Owner de 2026-09-29 (Architect/maestro)

Decisões transcritas em `open-decisions-rait.md` §C-0002 "R-0022 — decisões do Owner" e
`AUTHORIZATION.md` §Adenda B2/B3. Efeitos no plano (critérios inalterados, salvo os novos C-04/C-05 de
OD-R22-04/05, a escrever por TASK-0005):

- **SSE:** TASK-0005 recebe no despacho OD-R22-04/05 = corrigir; C-04/C-05 novos para filtro por
  papel/pool e nomes de evento do RAIT, `id` único e `Retry-After` do DASHBOARD.
- **Outbox:** parte 1 (OD-R22-15 (a)) e parte 2 com a transferência DETRAN idempotente
  (OD-R22-16 (a), exceção nominal à A1 item 4). CTG-0008 §8 exige que os leitores #13–#16 continuem
  legíveis entre a parte 2 e TASK-0007; com OD-R22-17 (b), **a troca de fonte desses quatro arquivos
  para `OutboxEventStreamSource` entra na parte 2 de TASK-0015** (lock de TASK-0007 cedido só para
  essa troca; enquadramento, filtros e OD-R22-04/05 continuam em TASK-0007).
- **Assinatura:** TASK-0009 segue CTG-0008 §8 (depois da parte 2); composição por DI (OD-R22-13 (a))
  dá a TASK-0009 o lock `MOD-app-module`. A prova M-06-P (OD-R22-12) exige uma tarefa nova de
  Inspector (TASK-0021) e a adenda ao critério "testes de R-0021 verdes sem edição"; TASK-0021 só é
  despachada depois de seu prompt passar por prompt-review.
- **Offline-sync:** TASK-0018 em **checkpoint OD-R22-02** (OD-R22-22/24/25/26/27/30 = checkpoint);
  pedido consolidado de 1.5.x ao STYNX (fora desta rodada, pelo Owner).

### A4 — decisões do Owner de 2026-09-29, terceira leva (Architect/maestro)

Fonte: `AUTHORIZATION.md` §Adenda B5; registro em `open-decisions-rait.md` §C-0002.

- **Critério da assinatura (OD-R22-12), texto adotado:** "Os testes de caracterização de R-0021 e de
  TASK-0012 ficam verdes sem edição pelo Engineer, **exceto** os casos que um Inspector (TASK-0021)
  retirar ou adaptar, cada um com um caso de paridade M-06-P que prova o mesmo comportamento sobre a
  API publicada; caso sem correspondente não se retira." TASK-0021 (Inspector) é criada com prompt
  próprio e prompt-review antes do despacho.
- **OD-R22-40:** espécies clínicas com LTA (laudo, adendo, exportação, decisão de junta) em
  checkpoint OD-R22-02 até stynx-nyx/stynx#318; a parte documental RAIT (sem LTA) segue.
- **OD-R22-07:** o app grava em `signed-documents`; TASK-0009 parte B só depois da decisão de
  `mimeAllowlist`/colunas, imutabilidade de `storage.objects` e convenção de chave (Architect).
- **OD-R22-38:** TASK-0022 (Engineer, CTG-0002, depois de TASK-0004) remove as dependências
  `@stynx-nyx/*` sem import, com lista conferida pelo Architect e prompt-review.
- **OD-R22-39:** smoke remoto encaminhado à R-0020 por `backlog.md` (TASK-0010).
- **OD-R22-37:** exceções 403/421 documentadas por TASK-0010 junto de OD-P30.
- **Pendente:** aprovação da estrutura da matriz de OD-R22-08.

### A5 — conflito com a #306 e matriz de OD-R22-08 (Architect/maestro, 2026-09-29)

Fonte: `AUTHORIZATION.md` §Adenda B6.

- **Texto proposto da emenda à ADR-0002** (transcrito por TASK-0010): "Exceção estreita — controle
  da outbox da plataforma. As operações `dispatchEventsDue`, `ackEvent` e `recordUnboundAck` do
  `@stynx-nyx/outbox` podem executar em papel owner/sistema porque só leem e escrevem as tabelas de
  controle da outbox, nunca dados de domínio. Condições: (1) o despacho roda em job técnico com
  ator técnico, fora do caminho de requisição; (2) o tenant de um ACK vem de contexto confiável
  (HMAC verificado), nunca do corpo; (3) qualquer despacho iniciado por operador é filtrado ao tenant
  do operador; (4) toda execução é auditada. Qualquer outro uso de owner-role no caminho de
  requisição continua proibido."
- **TASK-0015** (contrato CTG-0008, adenda do Architect antes do despacho): parte 2 passa a usar
  job técnico para o despacho (verificar em V-03 se `dispatchEventsDue` aceita filtro por tenant/
  `entity`; sem filtro, o despacho de operador vira pedido ao job, sem efeito imediato em outro
  tenant); a rota `POST v1/ch/transmissions/dispatch` preserva status/envelope e passa a solicitar o
  despacho — a mudança observável é caracterizada por Inspector antes da troca.
- **OD-R22-08:** estrutura aprovada; o DDL/blueprint da extensão de `inf.signature_policy` e o piso
  entram no contrato da assinatura (adenda do Architect a CTG-0006 antes de TASK-0009).

## Bloqueios

- **B1 — prompt-review ciclo 1 = FAIL** (Sol 6 `gpt-6-sol`, 2026-09-29,
  `reviews/prompt-review-1.json`, 17 achados `high`, todos com correção concreta). Motivo do FAIL:
  prompts de Engineer que permitem remover specs (TASK-0007, TASK-0008) e inversão de `it.fails` pelo
  maestro (TASK-0012) contrariam o Art. 10 (testes só pelo Inspector). Demais achados: `it.fails` do
  braço sem _shim_ (TASK-0002), `role_app_backend` explícito no negativo B→A, leitura não fechada em
  TASK-0013, coleta efetiva (`--passWithNoTests=false` por arquivo) nos testes web e nos specs
  `r22-*`, filtros `pnpm` com chaves, dependências não declaradas (0004←0003, 0016←0013, 0015←0006,
  0018←0015, 0010←0007/0008/0009) e `MOD-app-module` em TASK-0007. Nenhum worker foi disparado.
  Pela regra §5 do prompt do maestro, a rodada para e aguarda decisão do Owner.

- **B1 resolvido** (2026-09-29): ciclo 2 FAIL (17 resolvidos, 3 novos) → correções A2.2 → ciclo 3
  **PASS** sem achados (`reviews/prompt-review-3.json`). Workers liberados.

- **B2 — VAZAMENTO ENTRE TENANTS no comportamento atual (1.4.0), FAIL imediato e parada da rodada**
  (2026-09-29; TASK-0002, C-01-09; reproduzido pelo maestro). Cidadão com claim e _membership_ só no
  tenant A envia `POST /v1/portal/manifestations` com `X-Tenant-Id` do tenant B, sem Host mapeado:
  201, `anonymous:false`, manifestação e `portal.subject` gravados em B com o `cpf_hash` do cidadão.
  Detalhe em `reports/TASK-0002.md`. Nenhuma tarefa nova é despachada; TASK-0014 (iteração 2) e
  TASK-0017, só de caracterização e já em curso, terminam e são registradas sem commit de produto.
  Aguarda decisão do Owner.
- **B2 — decisão do Owner (2026-09-29):** "Corrija em PR próprio contra main." Hotfix na branch
  `fix/portal-manifestation-tenant-leak` (worker Opus 5.5 em worktree isolada; Inspector → Engineer),
  commits `c1cc3b55`, `f37aa006`, `5a6f2552`, `ffe773c7`; revisão Sol 6 ciclo 1 FAIL (OD-P30 no caminho
  Stynx; teste permissivo) → ciclo 2 **PASS** (`reviews/hotfix-tenant-leak-review-{1,2}.json`);
  **PR #159** aberto contra `main`, merge a critério do Owner com CI verde. Depois do merge, a rodada
  integra `main` e retoma TASK-0002 (C-01-09 verde nas duas fases).

- **B2 encerrado** (2026-09-29): PR #159 mesclado (`c4d5417c`) e integrado à branch por merge
  (`2fad7265`); C-01-09 verde sobre 1.4.0. C-01-01 e C-01-04 resolvidos por adenda A2 do CTG-0001.
  A rodada pode retomar (nova janela).

- **B3 — defeito do escritor clínico da outbox** (2026-09-29; TASK-0014 iteração 3): INSERT com
  parâmetros sem tipo em `report-lifecycle.service.ts:186` falha no PostgreSQL real; bloqueia
  C-08-01/03/04/14. Owner: hotfix em PR próprio contra `main` (Adenda B8); depois, iteração 4 de
  TASK-0014.

- **B4 — reviewer indisponível** (2026-09-29): `codex` (Sol 6) respondeu "You've hit your usage limit
  … try again at Oct 3rd, 2026 3:41 PM". Sem revisão cruzada até lá (sem dispensa, sem inverter
  família). Afeta: hotfix `fix/untyped-sql-parameters-sweep` (commits `fa7340ef`, `550e9887`, publicado,
  sem PR até a revisão) e a delivery-review final. Não afeta o trabalho das ondas (OD-C2-005: revisão só
  no fim). Achados fora da classe, pendentes de hotfix pela política B9: `FOR UPDATE` com agregado/
  `GROUP BY` em `inf/rait-session/src/handwritten/rait-session-command.service.ts:599,1310`; repositório
  gerado `ch/billing/src/repositories/billing-invoice-item.repository.ts:44,69` (BP-CH-BILLING-001,
  `where id` sem coluna `id`; correção no blueprint/gerador).

## Retomada

Checkpoint 2026-09-29 (maestro Opus 5.5, janela 1), rodada **parada por B2** (vazamento entre
tenants). Branch `orchestra/stynx-sse-tenancy` publicada.

- **Concluídas e commitadas:** TASK-0001, 0003, 0011, 0012, 0013, 0016, 0017 (`pre_merge`); TASK-0014
  com 2 iterações (C-08-01/03/04/13 e parciais 06/12/16 pendentes por leitura; `escalated`).
- **Parada:** TASK-0002 (`escalated`): `tenancy-context.e2e.spec.ts` e `r22-sse-tenancy.support.ts`
  não commitados, na worktree (C-01-09 vermelho = vazamento; C-01-01 e C-01-04 precisam de adenda);
  `sse-conformance.e2e.spec.ts` e teste HTTP do `rait-stream` não escritos.
- **Pendentes:** TASK-0004 (pin) e seguintes; nenhuma despachada.
- **Último veredito:** prompt-review ciclo 3 PASS.
- **Decisões do Owner abertas:** B2 (hotfix fora da rodada × `it.fails` corrigido em CTG-0003 ×
  parada); OD-R22-04/05 (antes de O5); OD-R22-06…36 (migrações; TASK-0018 com checkpoint provável
  OD-R22-02; corte de `integration.*` candidato a OD-R22-02).
- **Próximos passos depois da decisão B2:** adendas do Architect a C-01-01/C-01-04 (e C-01-09
  conforme a decisão); retomar TASK-0002 (sse-conformance, rait-stream HTTP); TASK-0014 iteração 3
  com as ampliações pedidas, se autorizada; O4 (pin 1.5.0) só com toda a caracterização verde e
  commitada.
- Bancos: slots 1–3 (`~/.cache/detran-r22/env/`), repreparar antes de reusar.

## Leitura

Maestro, 2026-09-29, `git rev-parse HEAD` = `c325f9b540e0b6696395f3442d7f920909ca3b76` (`origin/main`).
Lido: `prompts/00-maestro.md` e este `plan.md` inteiros; `AGENTS.md`, `CODESTYLE.md`,
`docs/meta/agents/orchestra/{model-ladder.md, worker-prompt.template.md, reviewer-prompt.template.md,
task.template.json}`, `orchestra/README.md` §9; `C-0002-consolidacao.md` §11–§13 e §14 (PR #158);
`C-0002-stynx-upstream-spec.md` §Decisões, §1–§4, §6.6, §6.11–§6.13, §7, §8, §8.1;
`work/rounds/R-0021/{AUTHORIZATION.md, closure.json, contracts/CTG-0001.md}` e a lista de relatórios;
`~/Development/stynx/work/rounds/R-0002/conformance-1.5.0.md` (só leitura); `.d.ts` publicados de
1.5.0 (busca de símbolos, M4); `tools/stynx-version.json`, `tools/check-stynx-pin.ts` (cabeçalho),
`backend/database/tests/run-backend-ci.mjs`, `prepare-rait-priority-upgraded-legacy.mjs` (ambiente),
`.github/workflows/ci.yml` (job `backend-kernel`). Código alvo lido só por inventário de caminhos e
tamanhos; a leitura detalhada fica com os Architects de O1/O2/O5 (listas fechadas nos prompts).
