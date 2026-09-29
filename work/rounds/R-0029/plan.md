# R-0029 — frente `teat-web-wiring` (ação 6 da C-0002 — TEAT web produtivo no lugar da página genérica JSON)

**Status:** **Sessão A autorizada por A-C2-15; bootstrap CTG-0001 em preparação** (ver `AUTHORIZATION.md`); OD-R29-001 decidida = (a) em 2026-09-26
(escopo de homologação da ADR-0033 sobre o TEAT web). Planejada em 2026-09-26 pelo Architect
(`work/campaigns/C-0002-consolidacao.md` §2, fase D). Maestro **Sol 6** (Codex CLI), workers da escada
Codex (Sol 6 / Terra / Luna vigentes) por subagentes nativos, reviewer **Opus 5.5** pela ponte
`tools/orchestra/bridge.sh claude` (C-0002 §4; ids de CLI confirmados no bootstrap). Worktree
`/Users/aarusso/.codex/worktrees/teat-web-wiring/detran` na Sessão A, branch `orchestra/teat-web-wiring`.
Sem issue (#108–#112 cobrem só o mobile): TASK-0002 redige a issue da frente.
`AUTHORIZATION.md`, `tasks/` e `compositions.json` da Sessão A foram criados no bootstrap; o restante da rodada espera a retomada.
**Concorrência:** abre após o merge de **R-0024 `stynx-dedup`** (`docs/framework/arch/frontend-wiring-pattern.md`,
entregável de R-0024 — **ainda não existe em 2026-09-26**; ausente → a rodada não abre). **Lock
compartilhado com R-0028 `boat-wiring`** (decisão do coordenador): `apps/teat/web/src/app/features/sinistros/`
(`MOD-teat-web-sinistros`) pertence a R-0028; o shell do TEAT web (`app.routes.ts`, `app.config.ts`,
`app.homologation.routes.ts`, `core/`, `data/`, `shared/` — `MOD-teat-web-shell`) pertence a esta rodada.
Os CTGs que tocam `MOD-teat-web-shell` (CTG-0002 em diante) só começam **depois** de o CTG-0004 de
R-0028 (telas web do BOAT) existir no branch publicado `orchestra/boat-wiring` (empilhar); o PR final
espera o merge de R-0028. Eles integram `sinistros` sem alterá-lo. CTG-0001 corre livre pela A-C2-15.
R-0021 está mesclada; R-0024 (dedup; candidato `angular-audit` para o cliente de auditoria) ainda
não está em `main` nesta abertura antecipada. Esquema do delta: `work/rounds/R-0030/availability-manifest.schema.md` (R-0030).
**Janelas previstas:** 4 (recalibradas para ≈ 3 em §Execução OD-C2-005).

## Execução OD-C2-005 (Owner, 2026-09-27)

> **Adenda A-C2-15 (Owner, 2026-09-30; prevalece).** Abertura antecipada, **só análise**, na
> **sessão A** (Codex Sol 6; reviewer Opus 5.5), por último. Tarefas liberadas: **TASK-0001**
> (matriz de rotas, classificação `ligada`/`somente-leitura`/`fail-closed-OD`, contratos com
> OD-R29-001 = a) e **TASK-0002** (ODs, i18n e fichas novas). Esperam: TASK-0003 em diante (shell
> migrado para o kit por R-0024).
>
> - **Base:** `origin/main`, branch `orchestra/teat-web-wiring`. Push sem PR ao fim de cada tarefa
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

Esta seção aplica `work/campaigns/C-0002-consolidacao.md` §12 e **prevalece sobre qualquer menção a
um PR/merge/evidência/delivery-review por CTG neste plano**. Metas, tarefas, locks e critérios de
aceitação não mudam; muda só o momento dos gates, que rodam no fim da rodada. A exceção são os
`acceptance_commands` de cada tarefa, que continuam sendo a definição de pronto do worker.

**Ondas.** Branch única `orchestra/teat-web-wiring`, até 3 workers na mesma worktree. O maestro
serializa os commits (um por tarefa ou por CTG) e faz push sem PR ao fim de cada onda.

| Onda | Tarefas em paralelo (CTG)                               | Fronteiras de escrita (disjuntas)                                                                                                                        | Depende de                                                                        |
| ---- | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| O1   | TASK-0001 (CTG-0001)                                    | `work/rounds/R-0029/{route-matrix.md,contracts/}`                                                                                                        | bootstrap e prompt-review único                                                   |
| O2   | TASK-0002 (CTG-0001)                                    | `teat-build-pack.md` §4, catálogo i18n do TEAT web, fichas novas, `work/rounds/R-0029/issue-body.md`                                                     | TASK-0001                                                                         |
| O3   | TASK-0003 (CTG-0002)                                    | specs do shell em `apps/teat/web/src/app` (caracterização primeiro)                                                                                      | TASK-0002; **CTG-0004 de R-0028 no branch** (empilhar em `orchestra/boat-wiring`) |
| O4   | TASK-0004 (CTG-0002)                                    | `MOD-teat-web-shell` (`app.routes.ts`, `app.config.ts`, `app.homologation.routes.ts`, `core/`, `data/`, `shared/`); nunca `features/sinistros/`          | TASK-0003                                                                         |
| O5   | TASK-0005 (CTG-0003) ∥ TASK-0008 (CTG-0004)             | specs de `features/{fiscalizacao,measures,alcohol,evidence,normative}` ∥ specs de `features/{operations,admin,technical,audit,bi,entry}` e sincronização | TASK-0004                                                                         |
| O6   | TASK-0006 ∥ TASK-0007 (CTG-0003) ∥ TASK-0009 (CTG-0004) | `features/{fiscalizacao,measures,alcohol}` ∥ `features/{evidence,normative}` ∥ `features/operations` e módulo novo de sincronização                      | TASK-0005; TASK-0008                                                              |
| O7   | TASK-0010 (CTG-0004)                                    | `features/{admin,technical,audit,bi,entry}` e `/conta`; entra assim que um worker da O6 liberar                                                          | TASK-0008                                                                         |
| O8   | TASK-0011 (CTG-0005)                                    | `work/rounds/R-0029/reports/TASK-0011.md` (nenhum código)                                                                                                | TASK-0006, 0007, 0009, 0010; `pnpm stack:start` e `stack:status` verdes           |
| O9   | TASK-0012 (CTG-0005)                                    | `teat-web.availability.json`, `teat-frontends.md`, `teat-build-pack.md`, `teat-web-contract.md`, `apps/teat/web/README.md`, `waves.md`, backlog          | TASK-0011                                                                         |

A árvore de rotas é fixada na O4. As ondas O5–O7 não tocam o shell; se um módulo pedir rota nova
fora da matriz, é adenda do Architect, não edição paralela do shell.

**Abertura empilhada.**

- **Base de abertura.** O1–O2 (CTG-0001) abrem sobre `origin/main`, com R-0024 mesclado. Sem ele,
  abrem sobre `origin/orchestra/stynx-dedup`, com `frontend-wiring-pattern.md` presente no branch.
- **CTG-0002 em diante (lock `apps/teat/web`).** Empilhe em `origin/orchestra/boat-wiring` depois
  que o CTG-0004 de R-0028 existir no branch publicado
  (`git log origin/orchestra/boat-wiring -- apps/teat/web/src/app/features/sinistros`). Se o branch
  desta rodada ainda não foi publicado, crie-o já sobre esse upstream; senão, use
  `git merge --no-edit origin/orchestra/boat-wiring`.
- **O que espera o merge do upstream:** só o PR final. R-0028 e R-0024 precisam estar em `main`,
  com o pin STYNX 1.5.0 **final** herdado de R-0022 (nenhum PR mescla com pin de RC, OD-S15-01).
  O critério `git diff --name-only origin/main -- apps/teat/web/src/app/features/sinistros` → vazio
  só é avaliado depois desse merge.

**Sequência final** (na ordem de C-0002 §12):

1. `git fetch -q origin` e `git merge --no-edit origin/main`, com R-0028 e R-0024 já em `main`.
2. **CI local completo:**
   - `pnpm check`;
   - `pnpm --filter @detran/teat-web typecheck|lint|test|build` e
     `pnpm --filter @detran/teat-web exec ng build --configuration production`;
   - `pnpm --filter @detran/teat-mobile test` e `pnpm --filter @detran/boat-mobile test`;
   - `pnpm --filter @detran/app test:e2e` e `pnpm backend:test:ci`;
   - `pnpm contracts:check`, `pnpm verify:parameter-catalogue`, `pnpm docs:kb:check`,
     `pnpm docs:kb:publish-check` e `pnpm format:check`;
   - os `test`/`git grep` de §Critérios;
   - `pnpm devai:rc:prepare`, quando aplicável.
3. **Uma delivery-review** (Opus 5.5) do diff inteiro (`origin/main...HEAD`). `REVIEW` admite
   correções restritas aos itens apontados, em no máximo 2 ciclos; `FAIL` → `escalated`.
4. **Um PR** contra `main`, com o corpo pelo template, a tabela CTG → tarefas → commits e o
   resultado dos gates.
5. **CI remoto.** Falha de código volta à tarefa responsável. Merge só com CI verde e `PASS`.
6. **Publicação final:**
   - `evidence-R-0029.json` com os 5 CTGs, `devai evidence record` e `evidence verify`;
   - `devai audit observe` no SHA do merge;
   - `closure.json`, `devai round close` e `devai round seal`;
   - `waves.md` e backlog.

**Janelas recalibradas:** 4 → ≈ 3. A 1ª janela cobre bootstrap, prompt-review e O1–O2; O3 começa
quando R-0028 publicar a O4 dela. A 2ª cobre O3–O6, e a 3ª cobre O7–O9 e a sequência final. A
espera por R-0028 não está contada.

## Decisões do Owner (2026-09-26)

- **OD-R29-001 = (a), decidida em conjunto com OD-R28-001.** O caminho real para o backend é
  implementado atrás do gateway e provado na stack local e em e2e. O TEAT web mantém a homologação
  como configuração padrão, e as rotas levam o selo `homologacao` até a ADR de release. A ADR-0033
  não é ampliada. O CTG-0002 em diante está liberado; o critério "sem stubs de comando" (C-0002 §5) é exigível nesta
  rodada.

## Estado de partida (verificado em 2026-09-26 sobre `a92ef731`)

- **Página genérica:** `@detran/teat-web` monta 52 rotas `productRoute({...})` (`data/route-contract.ts`)
  em 11 módulos (`features/{admin 6, alcohol 2, audit 5, bi 4, entry 2, evidence 4, fiscalizacao 9,
measures 4, normative 5, operations 6, technical 5}`), mais `sinistros` (BOAT, R-0028) e 3 rotas
  operacionais (`acesso-negado`, `conta`, `erro`); todas as de produto carregam o mesmo
  `ProductPageComponent` (`shared/product-page.component.ts`), que renderiza o recurso com
  `JSON.stringify` (`:344`) num `<p role="status">`; só `login` e aceite de AIT têm interação.
  Contrato: `teat-web-contract.md` §Manifesto (61 rotas, 56 fichas + BOAT; 549 pares do oráculo).
- **Camada de dados:** 10 clientes manuscritos `data/*.client.ts` sobre `HttpEndpointClient` (um GET
  por módulo, `endpointFor()`); única mutação `AitClient.accept` (If-Match + Idempotency-Key);
  nenhum importa `@detran/api-clients`. Arquivo com espaço no nome **`data/kernel STYNX.client.ts`**,
  chave `'kernel STYNX'` no registro (`web-client.registry.ts`) × `'kernel-stynx'` nas rotas
  (`features/audit/audit.routes.ts:20-55`) e no spec `app.runtime-foundations.spec.ts:669`.
- **Divergência de rotas:** `teat-frontends.md` §5 fixa 12 módulos com paths em português
  (`/fiscalizacao/aits/concorrencia`, `/fiscalizacao/cancelamentos`, `/evidencias/acessos`,
  `/sincronizacao/{,conflitos,numeracao,recibos}`, `/administracao/{homologacoes,versoes,campo/*}`,
  `/normativos/tabelas-metrologicas`, `/conta`); o código usa `/ux/web/<slug>` (`teat-web-contract.md:125+`)
  e **nenhuma** das rotas novas existe. `teat-frontends.md:154` diz que sinistros "não entram neste
  app" (contradiz o código e `boat-frontends.md:28`). `teat-build-pack.md:50` ainda diz "Frontends: só README".
- **Homologação (ADR-0033 — verificado):** a ADR vale para CTG-0004a/0004b/0005 de R-0013 e cobre
  **mobile e web** ("demonstram a experiência mobile/web"; §Fronteira 2: não chamar "endpoints de
  mutação produtivos"; §5: nenhuma inferência de autorização para produção). A adenda de
  `teat-build-pack.md:11-26` confirma: "somente builds de **homologação** Android/mobile e web";
  `apps/teat/web/angular.json` `defaultConfiguration: "homologation"` (`main.homologation.ts`,
  `shared/homologation-http.interceptor.ts` bloqueia HTTP remoto); há configuração `production`.
  Nenhuma decisão do Owner autoriza TEAT web produtivo → **OD-R29-001** (bloqueante do CTG-0002+).
- **Backend pronto:** `inf/ait` (R-0008: `ait-commands.controller.ts`, 14 POST; `handwritten/ait-cancel-requests.controller.ts`, 4)
  e `ops/*` (`agency`, `evidence`, `field`, `offline-sync`, `parameter`, `provisioning`, `snapshots`);
  stream `GET /v1/ops/stream` (`backend/app/src/teat-stream.controller.ts`), integrações
  `/v1/ops/integrations/{outbox,health}`. Contratos (comandos/CRUD): `BP-INF-AIT-001` 18/42,
  `BP-OPS-FIELD-001` 17/65, `BP-OPS-OFFLINE-SYNC-001` 12/28, `BP-OPS-EVIDENCE-001` 13/32,
  `BP-OPS-SNAPSHOTS-001` 2/22, `BP-OPS-PROVISIONING-001` 8/10, `BP-OPS-BOOTSTRAP-001` 8; clientes
  gerados em `packages/api-clients/src/generated/`. Operações-chave: `teatAitReviewConcurrency`,
  `teatAitCancelRequestReview|Decide`, `teatSyncConflictList|Resolve`, `teatSyncQueueItemList`,
  `teatSyncReceiptList|ByIdempotency`, `teatNumberingReservation*`, `teatEvidenceAccessRequest{Create,Approve,Deny,Deliver}`,
  `teatOperationalDevice{Block,Unblock,Wipe}`, `teatHomologation{Renew,CancelByAudit}`.
- **Política:** `TEAT_RULES` (`backend/domains/shared/src/policy.ts:522`) e `OPS_SURFACE_RULES` (`:944`)
  já cobrem as ações (ex.: `inf:ait:review-concurrency`, `inf:ait-cancel-request:decide`,
  `ops:sync-conflict:resolve`, `ops:evidence-access-request:approve`); 9 papéis web em `core/roles.ts`.
  Esta rodada **não** edita `policy.ts`; lacuna de chave vira OD (sem lock `MOD-shared-policy`).
- **i18n e formulários:** semente `docs/framework/arch/i18n/teat.pt-BR.json` (528 chaves) × catálogo
  web (356; faltam sobretudo `teat.navigation`, `teat.forms`, `teat.shell`); nenhum schema de formulário
  web (só `teat-bootstrap`, `teat-offline-sync-batch`, `teat-normative-package` em `docs/framework/schemas`).
- **Fichas:** `docs/framework/product/domains/inf/teat/screens/` — 56 `UX-WEB`, 68 `UX-MOB`, `IU-TEAT-001`;
  as rotas novas de §5 não têm ficha própria (TASK-0001 decide: ficha nova por transcrição ou OD).
- **ODs:** registro canônico `docs/framework/arch/teat-build-pack.md` §4 (OD-T01…T12; OD-T03 janela
  de concorrência `source_pending`; OD-T07 reserva expirada; OD-T08 bodycam/acesso, DT-014).

## Metas

1. **Matriz de rotas** (CTG-0001): cada rota (52 + novas de §5; `sinistros` só referenciada) com ficha,
   `uxCode`, path canônico (OD-R29-002), módulo, papéis e chave de política, operações de leitura e
   comando (contrato lido do disco), componentes de `teat-frontends.md` §6, schema de formulário, tópicos
   SSE, comportamento em homologação e no caminho real; ODs e issue no registro canônico.
2. **Fundação** (CTG-0002): camada de dados sobre os clientes gerados e o padrão de R-0024; árvore de
   rotas pela matriz; **renomeação de `data/kernel STYNX.client.ts`** para `data/kernel-stynx.client.ts`
   com chave única `'kernel-stynx'` (ou remoção, se R-0024 o tiver trocado por `@stynx-nyx/angular-audit`);
   `ProductPageComponent` e o `JSON.stringify` de renderização eliminados; modo homologação preservado.
3. **Módulos de infração/evidência** (CTG-0003): fiscalização (inclui concorrência e cancelamentos),
   medidas, alcoolemia, evidências (inclui acessos), normativos (inclui tabelas metrológicas).
4. **Módulos operacionais** (CTG-0004): operações, **sincronização** (filas, conflitos, numeração,
   recibos), administração (inclui homologações, versões, campo), técnico, auditoria, inteligência, conta.
5. **Smoke, delta e docs** (CTG-0005): jornadas por papel na stack; `docs/framework/arch/availability/teat-web.availability.json`;
   `teat-frontends.md`, `teat-build-pack.md`, `teat-web-contract.md`, README.

## Tarefas (proposta — o maestro deriva `tasks/*.json` e `prompts/TASK-nnnn.md` no bootstrap)

| Tarefa    | Papel                | Perfil              | Modelo/esforço | Lock                                          | Depende de                                 | Entrega                                                                                                                                                                                                                                                                                                                   |
| --------- | -------------------- | ------------------- | -------------- | --------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TASK-0001 | Architect            | architect-blueprint | Sol 6 / alto   | `MOD-r29-route-matrix`                        | —                                          | `route-matrix.md` (meta 1); proposta de OD-R29-001…004 com opções; classificação de cada rota `ligada` / `somente-leitura` / `fail-closed-OD`; `contracts/CTG-0002.md`…`CTG-0004.md` (critérios C-29-n-nn, oráculo de papéis presença **e** ausência, componentes §6.3, schemas de formulário)                            |
| TASK-0002 | Architect (transcr.) | transcriber-docs    | Luna / baixo   | `MOD-teat-build-pack-od`, `MOD-teat-web-i18n` | TASK-0001                                  | `teat-build-pack.md` §4: `OD-R29-nnn`; chaves da semente `teat.pt-BR.json` copiadas ao catálogo web (só existentes; texto sem fonte = OD); fichas novas das rotas de §5 se TASK-0001 as exigir (`artifactIdCount` no mesmo lote); corpo da issue da frente                                                                |
| TASK-0003 | Inspector            | inspector-tests     | Terra / médio  | `MOD-teat-web-tests-shell`                    | TASK-0002                                  | caracterização prévia (oráculo de 549 pares e modo homologação verdes antes da troca); specs: árvore de rotas = matriz, clientes = operações do OpenAPI lido do disco, `kernel STYNX` ausente, nenhum `JSON.stringify` de renderização, homologação continua bloqueando HTTP remoto e rotulando `HOMOLOGAÇÃO — SIMULAÇÃO` |
| TASK-0004 | Engineer             | engineer-frontend   | Terra / médio  | `MOD-teat-web-shell`                          | TASK-0003                                  | camada de dados, rename `kernel-stynx`, árvore de rotas, remoção do componente genérico, configuração `production` ligada ao backend (se OD-R29-001 = a)                                                                                                                                                                  |
| TASK-0005 | Inspector            | inspector-tests     | Terra / médio  | `MOD-teat-web-tests-inf`                      | TASK-0004                                  | specs dos módulos da meta 3: leitura, comandos (`teatAitReviewConcurrency`, `teatAitCancelRequest*`, aceite/rejeição, acesso a evidência), estados, formulários, SSE, papéis presença/ausência; OD-T03/OD-T08 fail-closed                                                                                                 |
| TASK-0006 | Engineer             | engineer-frontend   | Terra / médio  | `MOD-teat-web-features-inf`                   | TASK-0005                                  | `features/{fiscalizacao,measures,alcohol}`                                                                                                                                                                                                                                                                                |
| TASK-0007 | Engineer             | engineer-frontend   | Terra / médio  | `MOD-teat-web-features-evidence-normative`    | TASK-0005                                  | `features/{evidence,normative}` (acessos, tabelas metrológicas)                                                                                                                                                                                                                                                           |
| TASK-0008 | Inspector            | inspector-tests     | Terra / médio  | `MOD-teat-web-tests-ops`                      | TASK-0004                                  | specs dos módulos da meta 4 (sincronização: conflitos, numeração/reservas, recibos por idempotência; dispositivos block/unblock/wipe; homologações renew/cancel); OD-T07 fail-closed                                                                                                                                      |
| TASK-0009 | Engineer             | engineer-frontend   | Terra / médio  | `MOD-teat-web-features-ops-sync`              | TASK-0008                                  | `features/operations` e módulo novo de sincronização                                                                                                                                                                                                                                                                      |
| TASK-0010 | Engineer             | engineer-frontend   | Terra / médio  | `MOD-teat-web-features-admin`                 | TASK-0008                                  | `features/{admin,technical,audit,bi,entry}` e `/conta`                                                                                                                                                                                                                                                                    |
| TASK-0011 | Inspector            | inspector-tests     | Luna / médio   | `MOD-r29-stack-smoke`                         | TASK-0006, TASK-0007, TASK-0009, TASK-0010 | smoke por papel na stack local (`pnpm stack:start`): uma leitura e um comando por módulo, com requisição, resposta e evento SSE; modo homologação conferido em paralelo; `reports/TASK-0011.md`; nenhum código                                                                                                            |
| TASK-0012 | Architect (transcr.) | transcriber-docs    | Luna / baixo   | `MOD-docs-teat`, `MOD-r29-availability`       | TASK-0011                                  | `docs/framework/arch/availability/teat-web.availability.json` (selo por rota conforme OD-R29-001); `teat-frontends.md` §5/§11 e `:154`; `teat-build-pack.md:50` e WP-T4/T6; `teat-web-contract.md` §Manifesto; `apps/teat/web/README.md` (fim de "placeholder"); `waves.md` §Histórico; backlog                           |

- CTG-0001 = 0001 → 0002 (livre). CTG-0002 = 0003 → 0004 (**após** o CTG-0004 de R-0028 existir no
  branch publicado — empilhar; o PR final espera o merge; OD-R29-001 já decidida = (a)).
- CTG-0003 = 0005 → 0006 ∥ 0007. CTG-0004 = 0008 → 0009 ∥ 0010 (CTG-0003 ∥ CTG-0004 após o CTG-0002,
  na branch única; no máximo três tarefas por vez).
- CTG-0005 = 0011 → 0012. Commits por CTG na branch única; um PR no fim (OD-C2-005).

**Checkpoints do maestro (Engineer):** (a) bootstrap: `test -f docs/framework/arch/frontend-wiring-pattern.md`;
`test -f "apps/teat/web/src/app/data/kernel STYNX.client.ts"` (se ausente, R-0024 já tratou: registre e
ajuste TASK-0004); linha de base `pnpm --filter @detran/teat-web test` (contagem em §Leitura);
(b) antes de TASK-0003: decisão do Owner em OD-R29-001 registrada em §Adendas e o CTG-0004 de R-0028
no branch publicado (`git log origin/orchestra/boat-wiring -- apps/teat/web/src/app/features/sinistros`,
ou `origin/main` se já mesclado), integrado a esta branch; senão, checkpoint;
(c) antes de TASK-0011: `pnpm stack:start` e `pnpm stack:status` verdes.

## Critérios de aceitação (comandos → resultado)

- `test ! -e "apps/teat/web/src/app/data/kernel STYNX.client.ts"` → sucesso;
  `git grep -n "kernel STYNX" -- apps/teat/web` → nenhuma linha.
- `git grep -n "ProductPageComponent" -- apps/teat/web/src` → nenhuma linha;
  `test ! -e apps/teat/web/src/app/shared/product-page.component.ts` → sucesso.
- `git grep -n "JSON.stringify" -- apps/teat/web/src/app ':!*.spec.ts'` → nenhuma linha de renderização
  (serialização de corpo HTTP, se houver, listada em `route-matrix.md`).
- Rotas novas presentes pela forma canônica de OD-R29-002 (sincronização 4, concorrência, cancelamentos,
  acessos, tabelas metrológicas, homologações, versões, campo, conta): spec de TASK-0003 com a matriz
  inteira (N/N rotas, N fixado por TASK-0001).
- `pnpm --filter @detran/teat-web typecheck`, `lint`, `test`, `build` → verdes; oráculo de papéis
  (549 pares ou o número da matriz) verde; modo homologação: HTTP remoto bloqueado e selo visível.
- Se OD-R29-001 = (a): `pnpm --filter @detran/teat-web exec ng build --configuration production` → verde.
- `pnpm --filter @detran/teat-mobile test` e `pnpm --filter @detran/boat-mobile test` → verdes e
  inalterados; `git diff --name-only origin/main -- apps/teat/web/src/app/features/sinistros` → vazio.
- `pnpm --filter @detran/app test:e2e` (inclui `teat-*.e2e.spec.ts`) e `pnpm backend:test:ci` → verdes,
  sem código de backend alterado; `pnpm contracts:check` → sem diff.
- `pnpm verify:parameter-catalogue` → `0 errors`; `pnpm docs:kb:check`, `pnpm docs:kb:publish-check`,
  `pnpm format:check` → OK.
- `docs/framework/arch/availability/teat-web.availability.json` válido (JSON; esquema de R-0030); smoke de TASK-0011 por módulo.
- `pnpm check` → verde. DEVAI: `evidence record`/`verify` por CTG, `audit observe` no SHA de cada
  merge, `round close` + `round seal` com âncora.

## Mapa entregável → definições

| Entregável        | Definição                                                                                                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| matriz de rotas   | `teat-frontends.md` §3, §5, §6, §7; `teat-web-contract.md` §Manifesto e §Gates; fichas `docs/framework/product/domains/inf/teat/screens/*` (`UX-WEB`); `teat-route-contract.md` |
| operações         | `BP-INF-AIT-001`, `BP-OPS-{FIELD,OFFLINE-SYNC,EVIDENCE,SNAPSHOTS,PROVISIONING,BOOTSTRAP,AGENCY}-001` (`docs/framework/contracts`); `teat-error-catalog.md`                      |
| política          | `policy.ts` `TEAT_RULES`/`OPS_SURFACE_RULES`; `apps/teat/web/src/app/core/{roles,guards}.ts`                                                                                    |
| formulários/i18n  | `teat-frontends.md` §8; `docs/framework/arch/i18n/teat.pt-BR.json`; `parameter-catalogue.md` (namespaces `teat.*`)                                                              |
| homologação       | ADR-0033; `teat-build-pack.md` §Adenda R-0013; `teat-web-contract.md` §Adenda ADR-0033                                                                                          |
| padrão de ligação | `docs/framework/arch/frontend-wiring-pattern.md` (R-0024)                                                                                                                       |
| delta             | `work/rounds/R-0030/availability-manifest.schema.md`                                                                                                                            |

## Decisões pendentes (propostas; TASK-0002 registra em `teat-build-pack.md` §4)

| OD         | Pergunta                                                                                                                                                                                                          | Opções                                                                                                                                                                                                                                                       | Recomendação do Architect                                                          | Decisor   |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- | --------- |
| OD-R29-001 | **Decidida pelo Owner em 2026-09-26: (a).** A ADR-0033 restringe o TEAT web à homologação (dados sintéticos, sem mutação produtiva). A C-0002 pede "TEAT web produtivo". Autoriza-se ligar o web ao backend real? | (a) caminho real na configuração `production`, provado na stack local e em e2e, homologação continua padrão, selo `homologacao` até ADR de release; (b) só homologação: telas reais sobre portas sintéticas; (c) ADR nova autorizando o TEAT web em produção | (a); decidir junto com OD-R28-001                                                  | Owner     |
| OD-R29-002 | Path canônico: português de `teat-frontends.md` §5 × `/ux/web/<slug>` de `teat-web-contract.md` (PC-0013)                                                                                                         | (a) paths em português com redirecionamento dos `/ux/web/*`; (b) manter `/ux/web/*` e acrescentar as rotas novas nesse padrão                                                                                                                                | (b) nesta rodada (oráculo de 549 pares vigente); (a) só com adenda ao contrato web | Architect |
| OD-R29-003 | Rotas novas de §5 sem ficha `UX-WEB`                                                                                                                                                                              | (a) fichas novas por transcrição da §5; (b) rota `fail-closed-OD`                                                                                                                                                                                            | (a) onde a §5 e o contrato de backend bastam; (b) no resto                         | Architect |
| OD-R29-004 | Lacunas de i18n (seed 528 × web 356) sem texto de fonte                                                                                                                                                           | (a) marcador `source_pending` nunca exibido; (b) redigir                                                                                                                                                                                                     | (a) (nenhum valor inventado)                                                       | Architect |

**Condicionamento (histórico; OD-R29-001 = (a) decidida):** sem decisão em OD-R29-001, só o CTG-0001 corria; com (b), o maestro grava adenda
numerada reduzindo as metas 2–4 ao modo homologação e o critério "sem página genérica JSON" permanece;
o critério C-0002 §5 "sem stubs de comando" entra no closure como não cumprido, nunca reescrito.

## Riscos

- **Tamanho:** ~60 rotas; o CTG-0003 e o CTG-0004 correm em paralelo só após o CTG-0002.
- **Oráculo de R-0013** (549 pares, 565 testes web): a troca de componente não pode apagar asserções;
  o Inspector caracteriza antes e substitui com justificativa declarada.
- **Lock com R-0028:** atraso do CTG-0004 de R-0028 prende o CTG-0002 daqui; CTG-0001 avança.
- **`kernel STYNX`:** R-0024 pode ter substituído o cliente por `@stynx-nyx/angular-audit`; a
  renomeação vira verificação de ausência.
- **Valores `source_pending`** (OD-T03 janela de concorrência, OD-T07 reserva expirada): UI fail-closed.

## Lições aplicadas (C-0001; C-0002 §4)

- Relatórios versionados (`git add -f` até R-0018); `find` × `git ls-files` após cada `git add` (R-0016).
- Critérios imutáveis; vetadas as substituições de R-0013/R-0014 (não trocar suíte integral por focal).
- ODs no registro canônico (`teat-build-pack.md` §4) no mesmo PR.
- Âncora da prova, `round close` + `round seal`; `budget.json` com parada a 80 %.
- Caracterização antes da troca (TASK-0003); nenhum Engineer entrega o próprio teste.
- Nenhuma integração externa real (SENATRAN, RENAEST, biometria), nenhum valor normativo inventado,
  nenhum `--force`, nenhum arquivo gerado editado; `policy.ts` intocado.

## Adendas

## Decisões do maestro

- **M1 — ids e escopo da Sessão A (Architect, 2026-09-29).** Escada canônica de `docs/meta/agents/orchestra/model-ladder.md`: maestro/Architect `gpt-6-sol` (Codex CLI 0.157.1 local), médio `gpt-5.6-terra`, transcrição `gpt-6-luna`, reviewer de outra família `claude-opus-5-5` (Claude Code 2.1.283 local). Estes são os IDs publicados pela escada; nenhum disparo ou prova de aceitação de ID de modelo ocorreu neste bootstrap. A autorização direta local chegou em 2026-09-29; a adenda A-C2-15 tem data de fonte 2026-09-30 (`AUTHORIZATION.md`). Somente TASK-0001 e TASK-0002 são materializadas agora; TASK-0003+ aguardam R-0024. Um prompt-review cobrirá apenas essas duas tarefas. O Owner manteve OD-R29-001 = (a).
- **M2 — forma do contrato.** `acceptance_commands` são arrays argv sem shell. `compositions.json` vincula SHA-256 dos prompts finais e `PC-` + primeiros 16 hex. As tarefas têm schema `2.0.0`, dependência TASK-0001 → TASK-0002, locks disjuntos e fronteiras estritas. Critérios de CTG-0002+ serão escritos como contratos por TASK-0001, sem despachar sua implementação nesta sessão.
- **M3 — modelo de TASK-0001.** A escada sugere Terra para `architect-blueprint`; nesta tarefa, Sol 6 com esforço alto cobre a matriz ampliada de 61 × 9 pares de referência, as rotas novas e três CTGs com operações de consulta e comando. O custo está reservado em `budget.json`. TASK-0002 permanece Luna baixo.
- **M4 — prompt-review da Sessão A.** Um processo restrito a TASK-0001/0002, em dois ciclos via bridge Claude Opus 5.5: `reviews/prompt-review-1.json` = `REVIEW` (contratos de consulta ausentes do prompt e três ajustes de escopo/registro); correções aplicadas; `reviews/prompt-review-2.json` = `PASS` com um achado baixo residual sobre o lock declarado do backlog. O lock e a tabela do plano foram corrigidos depois do PASS, sem mudar os prompts. Não há delivery-review nesta sessão.

## Concorrência

- `origin/main`/HEAD `e78a6931739fc2fc081ac32c2b32b6099f0b15cf` é a base limpa desta worktree. Os PRs #161 (A-C2-15), #160 (A-C2-14) e #159 (hotfix) já estão em `main`; `origin/orchestra/boat-wiring` e `origin/orchestra/stynx-sse-tenancy` existem. `docs/framework/arch/frontend-wiring-pattern.md` de R-0024 não está em `main`; só o CTG-0001 analítico segue livre pela A-C2-15. CTG-0002+ espera R-0024 e o CTG-0004 de R-0028 no branch publicado, antes da base empilhada. Nenhum lock ou arquivo de R-0020/R-0022/R-0023/R-0024 é tocado nesta sessão.
- `docs/meta/knowledge-base/backlog.md` tem locks concorrentes de R-0020/23/24, portanto o corpo da issue fica em `work/rounds/R-0029/issue-body.md`. O catálogo i18n do TEAT web pode receber mudanças de R-0024; suas chaves e valores serão reconferidos contra `origin/main` na retomada, sem descartar o lote desta sessão.

## Bloqueios

## Triagem

## Retomada

- Bootstrap da Sessão A e prompt-review concluídos; TASK-0001 e TASK-0002 enfileiradas. Próximo passo: despachar TASK-0001, depois TASK-0002; rodar aceitação por tarefa, publicar por push sem PR e atualizar este checkpoint. TASK-0003+ espera R-0024; contratos da Sessão A serão reconferidos contra `origin/main` na retomada e divergências receberão adenda numerada.

## Leitura

- Base lida em `e78a6931739fc2fc081ac32c2b32b6099f0b15cf`: `AGENTS.md`; C-0002 §12/14/15/16; este plano e `prompts/00-maestro.md`; `docs/meta/agents/orchestra/{task.template.json,worker-prompt.template.md,model-ladder.md}`; `law/schemas/task.schema.json`; exemplos de tarefas, composições e orçamento de R-0021; `docs/framework/arch/{teat-build-pack.md,teat-frontends.md,teat-web-contract.md,teat-error-catalog.md,i18n/teat.pt-BR.json}`; catálogo i18n do app e amostra de ficha TEAT; `docs/meta/agents/{architect-blueprint,transcriber-docs}.md`. Contratos OpenAPI e restante das fichas são leitura fechada do worker TASK-0001, não foram declarados lidos pelo bootstrap.
- Baseline informado pelo maestro da sessão principal: `pnpm --filter @detran/teat-web test` — **4 arquivos, 611 testes PASS**, após build das dependências. Este worker de bootstrap não repetiu a suíte.
