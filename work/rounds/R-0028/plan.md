# R-0028 — frente `boat-wiring` (ação 6 da C-0002 — BOAT: telas ligadas a `est/crash`, portas nativas atrás de interfaces)

**Status:** **proposta — C-0002 rev. 2, aguardando autorização do Owner**. Planejada em 2026-09-26 pelo
Architect (`work/campaigns/C-0002-consolidacao.md` §2, fase D). Maestro **Opus 5.5** (Claude Code),
workers da escada Claude (Opus 5.5 grande/médio, Sonnet 5 pequeno) por subagentes nativos, reviewer
**Sol 6** pela ponte `tools/orchestra/bridge.sh codex` (C-0002 §4; id de CLI confirmado no bootstrap).
Worktree `/Volumes/Thiamat II/stech/detran-worktrees/boat-wiring`, branch `orchestra/boat-wiring`.
Rastreio: #118 (OD-R15-003/005), #119 (OD-R15-004), #120 (RENAEST real — **fora**), #109 (Capacitor —
**fora**); a ligação de dados/formulários e OD-R15-006 não têm issue: TASK-0002 redige a issue da frente.
Nenhum `AUTHORIZATION.md`, `tasks/` ou `compositions.json` existe: o maestro os cria no bootstrap.
**Concorrência:** abre após o merge de **R-0024 `stynx-dedup`** (padrão de ligação
`docs/framework/arch/frontend-wiring-pattern.md`, entregável de R-0024 — **ainda não existe em
2026-09-26**; ausente no bootstrap → a rodada não abre). **Lock compartilhado com R-0029
`teat-web-wiring`** (decisão do coordenador): o módulo web do BOAT vive em
`apps/teat/web/src/app/features/sinistros/` (`MOD-teat-web-sinistros`) e é carregado pelo shell do
TEAT web (`app.routes.ts`, `app.config.ts`, `core/` — `MOD-teat-web-shell`). O CTG-0004 desta rodada
(web) **existe no branch publicado** `orchestra/boat-wiring` antes de R-0029 alterar shell ou rotas;
R-0029 empilha a árvore de rotas sobre ele, e o PR final de R-0029 espera o merge desta rodada.
Esta rodada **não** toca `MOD-teat-web-shell`, salvo o import já existente de `sinistros.routes`
(qualquer mudança nele é adenda e aviso a R-0029). O shell mobile do TEAT
(`apps/teat/mobile/src/app/features/sinistro/`, `MOD-teat-mobile-sinistro`) não tem outra frente na C-0002.
Esquema do delta: `work/rounds/R-0030/availability-manifest.schema.md` (R-0030).
**Janelas previstas:** 3 (recalibradas para ≈ 2,5 em §Execução OD-C2-005).

## Execução OD-C2-005 (Owner, 2026-09-27)

> **Adenda A-C2-15 (Owner, 2026-09-30; prevalece).** Abertura antecipada na **sessão B** (Claude
> Code Opus 5.5; reviewer Sol 6), **primeira da sequência**. Tarefas liberadas: **TASK-0001/0002**
> (matriz de vínculo, desenho do gateway e das 6 portas, ODs) e **TASK-0003/0004** (specs e
> implementação das portas de homologação em `apps/boat/mobile/src/lib/ports/`, sem `@capacitor/*`,
> atestação nunca `true`). Esperam: TASK-0005 em diante (páginas, gateway e telas web dependem do
> padrão de R-0024 e do SSE de R-0022).
>
> - **Base:** `origin/main`, branch `orchestra/boat-wiring`. Push sem PR ao fim de cada tarefa
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

**Ondas.** Branch única `orchestra/boat-wiring`, até 3 workers na mesma worktree. O maestro
serializa os commits (um por tarefa ou por CTG) e faz push sem PR ao fim de cada onda.

| Onda | Tarefas em paralelo (CTG)                                          | Fronteiras de escrita (disjuntas)                                                                                                                       | Depende de                                                       |
| ---- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| O1   | TASK-0001 (CTG-0001)                                               | `work/rounds/R-0028/{binding-matrix.md,contracts/}`                                                                                                     | bootstrap e prompt-review único                                  |
| O2   | TASK-0002 (CTG-0001) ∥ TASK-0003 (CTG-0002) ∥ TASK-0008 (CTG-0004) | `boat-build-pack.md` §4 e backlog ∥ specs de portas em `apps/boat/mobile/src/lib` ∥ specs em `apps/teat/web/src/app/features/sinistros/`                | TASK-0001                                                        |
| O3   | TASK-0004 (CTG-0002)                                               | `apps/boat/mobile/src/lib/ports/` e providers exportados                                                                                                | TASK-0003                                                        |
| O4   | TASK-0005 (CTG-0003) ∥ TASK-0009 (CTG-0004)                        | specs de páginas e componentes em `apps/boat/mobile/src/lib` ∥ `sinistros.pages.ts`/`sinistros.routes.ts` (nunca `MOD-teat-web-shell`)                  | TASK-0004; TASK-0008 e TASK-0004                                 |
| O5   | TASK-0006 ∥ TASK-0007 (CTG-0003)                                   | `apps/boat/mobile/src/lib/{pages,shared}/` ∥ `BoatCrashGateway` (arquivo fixado por TASK-0001) e `apps/teat/mobile/src/app/features/sinistro/`          | TASK-0005                                                        |
| O6   | TASK-0010 (CTG-0005)                                               | `work/rounds/R-0028/reports/TASK-0010.md` (nenhum código)                                                                                               | TASK-0007, TASK-0009; `pnpm stack:start` e `stack:status` verdes |
| O7   | TASK-0011 (CTG-0005)                                               | `docs/framework/arch/availability/boat.availability.json`, `boat-build-pack.md`, `boat-frontends.md`, `apps/boat/mobile/README.md`, `waves.md`, backlog | TASK-0010                                                        |

O CTG-0004 (web) fecha na O4, logo depois do CTG-0002. O push da O4 é o que libera R-0029 para
empilhar sobre o shell do TEAT web.

**Abertura empilhada.**

- **Base de abertura.** Com R-0024 em `main`, a rodada abre sobre `origin/main`. Sem ele, abre
  empilhada em `origin/orchestra/stynx-dedup` assim que o padrão existir no branch publicado
  (`git cat-file -e origin/orchestra/stynx-dedup:docs/framework/arch/frontend-wiring-pattern.md`).
  Novas revisões do upstream entram por `git merge --no-edit origin/orchestra/stynx-dedup`.
- **O que espera o merge do upstream:** só o PR final. R-0024 precisa estar em `main`, com o pin
  STYNX 1.5.0 **final** herdado de R-0022. Pode-se desenvolver sobre `1.5.0-rc.N`, mas nenhum PR
  mescla com pin de RC (OD-S15-01).
- **Jusante.** R-0029 empilha em `origin/orchestra/boat-wiring` depois do push da O4 (CTG-0004 no
  branch publicado). Esta rodada mescla antes de R-0029. O lock `apps/teat/web` deixa de serializar
  PRs: o conflito vira de merge no fim (§12).

**Sequência final** (na ordem de C-0002 §12):

1. `git fetch -q origin` e `git merge --no-edit origin/main`, com R-0024 já em `main`.
2. **CI local completo:**
   - `pnpm check`; `pnpm test:boat-transitions`;
   - `pnpm --filter @detran/boat-mobile typecheck|lint|test|build`,
     `pnpm --filter @detran/teat-web typecheck|lint|test|build` e
     `pnpm --filter @detran/teat-mobile typecheck|lint|test|build`;
   - `pnpm --filter @detran/est-crash test:unit` e `test:integration`,
     `pnpm --filter @detran/app test:e2e` e `pnpm backend:test:ci`;
   - `pnpm contracts:check`, `pnpm verify:parameter-catalogue`, `pnpm docs:kb:check`,
     `pnpm docs:kb:publish-check` e `pnpm format:check`;
   - os `grep`/`git grep` de §Critérios e o `git diff --name-only origin/main` do shell (vazio);
   - `pnpm devai:rc:prepare`, quando aplicável.
3. **Uma delivery-review** (Sol 6) do diff inteiro (`origin/main...HEAD`). `REVIEW` admite
   correções restritas aos itens apontados, em no máximo 2 ciclos; `FAIL` → `escalated`.
4. **Um PR** contra `main`, com o corpo pelo template, a tabela CTG → tarefas → commits e o
   resultado dos gates.
5. **CI remoto.** Falha de código volta à tarefa responsável. Merge só com CI verde e `PASS`.
6. **Publicação final:**
   - `evidence-R-0028.json` com os 5 CTGs, `devai evidence record` e `evidence verify`;
   - `devai audit observe` no SHA do merge;
   - `closure.json`, `devai round close` e `devai round seal`;
   - `waves.md` e backlog.

**Janelas recalibradas:** 3 → ≈ 2,5. A 1ª janela cobre bootstrap, prompt-review e O1–O4 (7
tarefas). A 2ª cobre O5–O7, e a sequência final pede ≈ 0,5. O ganho vem de 5 ciclos
PR/CI/evidência/review que viram 1.

## Decisões do Owner (2026-09-26)

- **OD-R28-001 = (a), decidida em conjunto com OD-R29-001.** O caminho real para o backend é
  implementado atrás do gateway e provado na stack local e em e2e. Os hosts TEAT mantêm a homologação
  como configuração padrão, e as rotas levam o selo `homologacao` até a ADR de release. A ADR-0033
  não é ampliada. O critério "sem stubs de comando" (C-0002 §5) é exigível nesta rodada.

- **ODs de TASK-0001 decididas pelo Owner nesta sessão (2026-09-29, A-C2-12; registro canônico por
  TASK-0002 em `boat-build-pack.md` §4), todas pela recomendação do Architect:**
  - OD-R28-007 = (a): guarda web própria pelos papéis de `crash-victim:read` ∩ papéis da rota.
  - OD-R28-008: `agency-admin` negativo nas leituras de sinistro até decisão de produto.
  - OD-R28-010: `field-supervisor` negativo em finalizar e relatório até decisão de produto.
  - OD-R28-011 = (b): W-05 somente leitura e fail-closed nesta rodada.
  - OD-R28-013 = (a): S-06/W-05 fail-closed até o Owner confirmar H.44/H.45 para o BOAT.
  - OD-R28-014 = (a): nenhum ato exige atestação nesta rodada.
  - OD-R28-016 = (a): provisório técnico (sem timeout de GPS, `accept="image/*"`, SHA-256 hex
    minúsculo); valores normativos do órgão depois.
  - OD-R28-017: nenhuma tela expõe `archive`/`cancel` até decisão de produto.
- **ODs de TASK-0001 com decisor Architect** (OD-R28-002/003 fechadas no contrato; 004, 005, 006,
  009, 012, 015, 018, 019): o maestro, como Architect, aceita as recomendações de
  `binding-matrix.md` §ODs novas como provisórias; as de gateway/SSE/modo (005, 015, 019) são
  reconferidas após R-0024/R-0022.

## Estado de partida (verificado em 2026-09-26 sobre `a92ef731`)

- **Estrutura:** `apps/boat` tem um único pacote, `apps/boat/mobile` (`@detran/boat-mobile`), biblioteca
  ng-packagr (scripts `build|test|lint|typecheck`), consumida por **dois hosts**:
  `apps/teat/mobile` (`src/main.ts` → `createBoatExtension`, `TEAT_BOAT_EXTENSION`;
  `features/sinistro/sinistro.routes.ts` com 12 `Crash*BoundaryComponent` → `resolveBoatRoute`) e
  `apps/teat/web` (`app.config.ts` importa `BOAT_PT_BR_CATALOG`; `features/sinistros/sinistros.routes.ts`,
  `client: '@detran/boat-mobile'`). `pnpm check` roda `pnpm test:boat-transitions`,
  `pnpm --filter @detran/boat-mobile build` antes de `pnpm typecheck`, e lint/test/build do pacote.
  Nenhum arquivo da biblioteca importa `@detran/api-clients` nem `HttpClient`.
- **Telas só com título:** 12 mobile em `apps/boat/mobile/src/lib/pages/boat-pages.ts` (template único
  `BOAT_PAGE_TEMPLATE`: `<h1>` + `<p role="status">`); 5 web em
  `apps/teat/web/src/app/features/sinistros/sinistros.pages.ts` (`CrashesListPage`, `CrashDetailPage`,
  `CrashComplementPage`, `RenaestIntegrationPage`, `SubjectRequestPage`, só h1 + frase legal).
- **Componentes vazios:** 8 `<section [attr.aria-label]="label"></section>` em
  `src/lib/shared/boat-shared.components.ts` (SeverityPicker, ConditionsQuad, InvolvedList, VictimCard,
  SceneDutyChecklist, DamageWitnessForm, CrashLinksPanel, MinimumDataChecklist), `<button>` vazio
  (PreliminaryReportButton) e `<canvas>` vazio (`shared/sketch-editor.component.ts`).
- **Portas só interfaces** (`src/lib/ports.ts`): `GpsPort`, `CameraPort`, `SignaturePort`, `SketchPort`,
  `MobileEncryptedStorePort`, `AttestationPort` com tokens `BOAT_{GPS,CAMERA,SIGNATURE,SKETCH,ENCRYPTED_STORE,ATTESTATION}_PORT`;
  providers só em teste (`boat-r0015.spec.ts:74-79`); nenhuma página consome porta (OD-R15-006). Há
  implementação reaproveitável do armazenamento cifrado no host mobile:
  `apps/teat/mobile/src/app/data/local/local-act.store.ts:136` (`BrowserEncryptedStoreAdapter`).
- **Já prontos na biblioteca:** 14 schemas zod (`forms/schemas.ts`) e `BOAT_GATES` (`forms/gates.ts`);
  transições (`navigation/transitions.ts`); `victim-access.guard.ts`; i18n de 114 chaves idêntica a
  `docs/framework/arch/i18n/boat.pt-BR.json`, 13 com o marcador `source_pending:OD-R15-004` (nunca exibidas).
- **Backend pronto** (`backend/domains/est/crash`, BP-EST-CRASH-001, R-0010): 13 operações em
  `docs/framework/contracts/BP-EST-CRASH-001.commands.openapi.json` sob `/v1/est/crash/records/{id}/…`
  (`boatCrashRecordStart`, `Record`, `Complement`, `Validate`, `Close`, `Cancel`, `Archive`, `Transmit`,
  `Rectify`, `RenaestRead`, `Duty`, `SatelliteAdd`, `Report`); CRUD em `BP-EST-CRASH-001.openapi.json`;
  clientes gerados `packages/api-clients/src/generated/BP-EST-CRASH-001{,.commands}.ts`;
  `CrashSyncApplier` (`entityType='crash-record'`, registrado em `backend/app/src/teat-sync.providers.ts:57`);
  SSE sem endpoint próprio: tópicos `crash.changed`/`crash.renaest.changed` em `GET /v1/ops/stream`
  (`backend/app/src/teat-stream.service.ts:56-57`); e2e `backend/app/tests/e2e/boat-crash-commands.e2e.spec.ts`.
- **R-0015 (PC-0014):** WP-B4/B5 "executados" com critério reescrito (adenda A5; `boat-build-pack.md`
  §WP-B5: "apenas o binding completo de campos/forms fica em handoff futuro"). Esta rodada **é** esse
  handoff e reclassifica o texto do build pack sem reescrever o histórico de R-0015.
- **Homologação (ADR-0033):** os dois hosts são builds de homologação por padrão
  (`apps/teat/web/angular.json` `defaultConfiguration: "homologation"`; adenda R-0013 de
  `teat-build-pack.md:11-26`: "BOAT e D-05 continuam indisponíveis no recorte contratado"). A ADR-0033
  vincula R-0013 e não autoriza caminho produtivo. Ver **OD-R28-001**.
- **Docs contraditórios:** `boat-frontends.md:158` ("`est/crash` inexistente (só README)"), `:28` ×
  `teat-frontends.md:154` (sinistros no TEAT web ou não); `apps/boat/mobile/README.md` promete Capacitor.
- **ODs:** registro canônico `docs/framework/arch/boat-build-pack.md` §4 (OD-B01…B13); OD-R15-003…006
  vivem só em `work/rounds/R-0015/route-manifest.md:39-48` e `plan.md` (lição C-0001: migrar).
  Relevantes: OD-B06 (gravidade), OD-B08 (RENAEST, #120), OD-B11 (catálogos H.42), OD-B13 (cancelamento),
  DT-049 (PII/retenção: S-06 e W-05 não vão a produção antes — `boat-frontends.md` §10).

## Metas

1. **Matriz de ligação** (CTG-0001): 17 telas × ficha `IU-BOAT-S-01…S-12`/`W-01…W-05` × rota × schema
   × gates × operação × estados × tópico SSE × OD; 10 componentes × dados; 6 portas × implementação
   web/homologação; interface `BoatCrashGateway` (online: cliente gerado; offline: fila `crash-record`
   fornecida pelo host). ODs migradas/novas no registro canônico.
2. **Portas** (CTG-0002): implementação web/homologação de cada porta atrás do token, sem Capacitor
   (#109) — GPS (Geolocation API), câmera (captura de arquivo/mídia), assinatura e croqui (canvas),
   armazenamento cifrado (WebCrypto, padrão de `BrowserEncryptedStoreAdapter`), atestação (resultado
   explícito "não atestado — homologação", nunca sucesso silencioso; ADR-0033 §3).
3. **Mobile** (CTG-0003): 12 telas e 10 componentes ligados a schemas/gates/gateway/estados; hosts do
   TEAT mobile fornecem gateway e portas.
4. **Web** (CTG-0004): 5 telas de `sinistros` ligadas (lista, detalhe, complemento, RENAEST (leitura e
   retificação, mock), pedido do titular), antes das mudanças de shell de R-0029.
5. **Smoke, delta e docs** (CTG-0005): jornadas na stack; `docs/framework/arch/availability/boat.availability.json`; build pack,
   `boat-frontends.md`, READMEs, backlog, `waves.md`.

## Tarefas (proposta — o maestro deriva `tasks/*.json` e `prompts/TASK-nnnn.md` no bootstrap)

| Tarefa    | Papel                | Perfil              | Modelo/esforço   | Lock                                                  | Depende de           | Entrega                                                                                                                                                                                                                                                                                                                                                               |
| --------- | -------------------- | ------------------- | ---------------- | ----------------------------------------------------- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TASK-0001 | Architect            | architect-blueprint | Opus 5.5 / alto  | `MOD-r28-binding-matrix`                              | —                    | `binding-matrix.md` (meta 1; operação por tela a partir do contrato lido do disco); desenho de `BoatCrashGateway` e das 6 implementações de porta; política de modo (homologação × caminho real) conforme OD-R28-001; tratamento de S-06/W-05 sob DT-049 (fail-closed); `contracts/CTG-0002.md`…`CTG-0004.md` com critérios C-28-n-nn; lista de correções documentais |
| TASK-0002 | Architect (transcr.) | transcriber-docs    | Sonnet 5 / baixo | `MOD-boat-build-pack-od`, `MOD-kb-backlog`            | TASK-0001            | `boat-build-pack.md` §4: OD-R15-003…006 migradas (texto e estado) e `OD-R28-nnn` novas; corpo da issue da frente; backlog                                                                                                                                                                                                                                             |
| TASK-0003 | Inspector            | inspector-tests     | Sonnet 5 / médio | `MOD-boat-mobile-tests-ports`                         | TASK-0001            | specs por porta: sucesso, recusa de permissão, indisponível, rótulo de homologação; atestação nunca `true` em homologação; nenhum import `@capacitor/*`                                                                                                                                                                                                               |
| TASK-0004 | Engineer             | engineer-frontend   | Opus 5.5 / médio | `MOD-boat-mobile-ports`                               | TASK-0003            | implementações web/homologação em `src/lib/ports/` + providers exportados; `ports.ts` inalterado na forma                                                                                                                                                                                                                                                             |
| TASK-0005 | Inspector            | inspector-tests     | Sonnet 5 / médio | `MOD-boat-mobile-tests-pages`                         | TASK-0004            | specs das 12 telas e 10 componentes: campos ↔ schema, gates, submissão emite a operação da matriz via gateway (verbo/path do OpenAPI lido do disco), estados (vazio, carregando, erro, offline, bloqueado por OD), `victimAccessGuard` presença **e** ausência, 13 chaves `source_pending:OD-R15-004` nunca renderizadas, axe sem `serious`/`critical`                |
| TASK-0006 | Engineer             | engineer-frontend   | Opus 5.5 / médio | `MOD-boat-mobile-pages`                               | TASK-0005            | páginas e componentes ligados (fim de `BOAT_PAGE_TEMPLATE` e das `<section>` vazias; croqui funcional sobre `SketchPort`)                                                                                                                                                                                                                                             |
| TASK-0007 | Engineer             | engineer-frontend   | Opus 5.5 / médio | `MOD-boat-mobile-gateway`, `MOD-teat-mobile-sinistro` | TASK-0005            | `BoatCrashGateway` online (`@detran/api-clients` gerado, If-Match/Idempotency-Key pelo padrão de R-0024) e offline (fila `crash-record` do host); providers de gateway e portas nos boundaries de `apps/teat/mobile/src/app/features/sinistro/`                                                                                                                       |
| TASK-0008 | Inspector            | inspector-tests     | Sonnet 5 / médio | `MOD-teat-web-sinistros-tests`                        | TASK-0001            | specs das 5 telas web: leitura CRUD, comandos `Complement`/`Rectify`/`RenaestRead`, SSE `crash.changed` pela costura canônica, W-05 fail-closed (DT-049), papéis presença/ausência                                                                                                                                                                                    |
| TASK-0009 | Engineer             | engineer-frontend   | Opus 5.5 / médio | `MOD-teat-web-sinistros`                              | TASK-0008, TASK-0004 | `sinistros.pages.ts`/`sinistros.routes.ts` ligados; nenhum arquivo de `MOD-teat-web-shell` alterado                                                                                                                                                                                                                                                                   |
| TASK-0010 | Inspector            | inspector-tests     | Sonnet 5 / médio | `MOD-r28-stack-smoke`                                 | TASK-0007, TASK-0009 | smoke na stack local (`pnpm stack:start`, runbook de R-0017): start → record → validate → close → transmit (RENAEST mock) → complement, pelo caminho real e pelo de homologação; `reports/TASK-0010.md`; nenhum código                                                                                                                                                |
| TASK-0011 | Architect (transcr.) | transcriber-docs    | Sonnet 5 / baixo | `MOD-docs-boat`, `MOD-r28-availability`               | TASK-0010            | `docs/framework/arch/availability/boat.availability.json` (17 rotas; selo conforme OD-R28-001); `boat-build-pack.md` §WP-B4/B5 (nota de reclassificação datada, sem apagar a de R-0015); `boat-frontends.md` §9/§10 e `:28`; `apps/boat/mobile/README.md` (sem promessa de Capacitor); `waves.md` §Histórico; backlog                                                 |

- CTG-0001 = 0001 → 0002. CTG-0002 = 0003 → 0004. CTG-0003 = 0005 → 0006 ∥ 0007.
- CTG-0004 = 0008 → 0009 (**publicado no branch**, push da onda O4, antes de qualquer CTG de R-0029
  que toque `MOD-teat-web-shell`; esta rodada mescla antes de R-0029).
- CTG-0005 = 0010 → 0011. Commits por CTG na branch única; um PR no fim (OD-C2-005); no máximo três
  tarefas por vez; TASK-0008 ∥ TASK-0003.

**Checkpoints do maestro (Engineer):** (a) bootstrap: `test -f docs/framework/arch/frontend-wiring-pattern.md`;
linha de base `pnpm --filter @detran/boat-mobile test` e `pnpm --filter @detran/teat-web test`
(contagens em §Leitura); (b) antes do PR final: `gh pr list --state open --search "orchestra/teat-web-wiring"`
— se R-0029 já tiver PR tocando shell, coordenar pela §Concorrência (esta rodada mescla primeiro);
(c) antes de TASK-0010: `pnpm stack:start` e `pnpm stack:status` verdes.

## Critérios de aceitação (comandos → resultado)

- `grep -c "BOAT_PAGE_TEMPLATE" apps/boat/mobile/src/lib/pages/boat-pages.ts` → `0`;
  `grep -rn '<section \[attr.aria-label\]="label"></section>' apps/boat/mobile/src/lib` → nenhuma linha.
- `grep -rlE "provide: BOAT_(GPS|CAMERA|SIGNATURE|SKETCH|ENCRYPTED_STORE|ATTESTATION)_PORT" apps/boat/mobile/src/lib`
  → ao menos um arquivo **não** `*.spec.ts` por token (6/6).
- `git grep -n "@capacitor" -- apps/boat apps/teat` → nenhuma linha (#109).
- `pnpm test:boat-transitions`; `pnpm --filter @detran/boat-mobile typecheck`, `lint`, `test`, `build`
  → verdes; `pnpm --filter @detran/teat-web typecheck|lint|test|build` e
  `pnpm --filter @detran/teat-mobile typecheck|lint|test|build` → verdes.
- Specs de TASK-0005/0008: 17/17 telas com operação da matriz coberta; 13 chaves `source_pending:OD-R15-004`
  nunca renderizadas (salvo #119 decidida, então o texto autorizado entra por adenda); axe sem
  `serious`/`critical` nas 17 telas.
- `pnpm --filter @detran/est-crash test:unit` e `test:integration`; `pnpm --filter @detran/app test:e2e`
  (inclui `boat-crash-commands.e2e.spec.ts`) → verdes; `pnpm backend:test:ci` → verde, sem código de
  backend alterado.
- `pnpm contracts:check` → sem diff; `pnpm verify:parameter-catalogue` → `0 errors`;
  `pnpm docs:kb:check`, `pnpm docs:kb:publish-check`, `pnpm format:check` → OK.
- `git diff --name-only origin/main -- apps/teat/web/src/app/app.routes.ts apps/teat/web/src/app/app.config.ts apps/teat/web/src/app/core`
  → vazio no PR final (OD-C2-005).
- `docs/framework/arch/availability/boat.availability.json` válido (JSON; esquema de R-0030); smoke de TASK-0010 com resultado por passo.
- `pnpm check` → verde. DEVAI: `evidence record`/`verify` por CTG, `audit observe` no SHA de cada
  merge, `round close` + `round seal` com âncora.

## Mapa entregável → definições

| Entregável        | Definição                                                                                                                                                                                                                     |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| matriz de ligação | `boat-frontends.md` §4–§9; fichas `docs/framework/product/domains/est/boat/screens/IU-BOAT-*.md` (17 + índice); `work/rounds/R-0015/route-manifest.md`; `boat-route-contract.md`; `BP-EST-CRASH-001{,.commands}.openapi.json` |
| formulários       | `apps/boat/mobile/src/lib/forms/{schemas,gates}.ts`; `boat-frontends.md` §8; `boat-error-catalog.md`                                                                                                                          |
| portas            | `apps/boat/mobile/src/lib/ports.ts`; `boat-build-pack.md` §WP-B5; ADR-0033 §Fronteira; `local-act.store.ts:136`                                                                                                               |
| sincronização/SSE | `boat-frontends.md` §9; `teat-route-contract.md` §4.3; `teat-stream.service.ts:56-57`; `frontend-wiring-pattern.md` (R-0024)                                                                                                  |
| textos            | OD-R15-004 (#119); OD-R15-003/005 (#118); `teat-mobile-contract.md:963`, `teat-web-contract.md:113`                                                                                                                           |
| delta             | `work/rounds/R-0030/availability-manifest.schema.md`                                                                                                                                                                          |

## Decisões pendentes (propostas; TASK-0002 registra em `boat-build-pack.md` §4)

| OD         | Pergunta                                                                                                                                                                                                           | Opções                                                                                                                                                                                                                                                                 | Recomendação do Architect                                                                                                                   | Decisor   |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| OD-R28-001 | **Decidida pelo Owner em 2026-09-26: (a).** Os hosts TEAT são homologação (ADR-0033; adenda R-0013: "BOAT … indisponível no recorte"). O BOAT ligado ao backend real pode ser ativado fora do modo de homologação? | (a) implementar o caminho real atrás do gateway, provado na stack local e em e2e, com os hosts mantendo a homologação como padrão e selo `homologacao`; (b) ligar só aos ports de homologação (dados sintéticos); (c) autorizar build produtiva do TEAT web com o BOAT | (a): cumpre "sem stubs de comando" (C-0002 §5) sem ampliar a ADR-0033; (c) exige ADR do Owner. Mesma pergunta de OD-R29-001 — decidir junto | Owner     |
| OD-R28-002 | Implementação da atestação sem hardware                                                                                                                                                                            | (a) porta web retorna `unattested` explícito e a UI bloqueia o ato que exigir atestação; (b) omitir                                                                                                                                                                    | (a) (ADR-0033 §3: nada de mock silencioso)                                                                                                  | Architect |
| OD-R28-003 | `BrowserEncryptedStoreAdapter` duplicado entre TEAT mobile e BOAT                                                                                                                                                  | (a) cópia na biblioteca com teste de paridade; (b) mover para `@detran/ui`/pacote comum (toca R-0024)                                                                                                                                                                  | (a) nesta rodada; (b) candidata a R-0024/posterior                                                                                          | Architect |

## Riscos

- **Escopo de homologação** (OD-R28-001 = (a), decidida): o caminho real não pode vazar para a
  configuração padrão; o Inspector prova que a build padrão continua em homologação.
- **Lock do TEAT web** com R-0029: atraso do CTG-0004 bloqueia R-0029 no shell; o maestro prioriza o
  CTG-0004 logo após o CTG-0002.
- **PII de vítima** (DT-049): S-06 e W-05 ficam fail-closed se a retenção não estiver decidida.
- **Textos `source_pending`** (#119): nunca inventados; a tela usa o fallback já testado.
- **Pacote de biblioteca** consumido por dois hosts: build da biblioteca antes do `typecheck` (ordem do `check`).

## Lições aplicadas (C-0001; C-0002 §4)

- Relatórios versionados (`git add -f` até R-0018); `find` × `git ls-files` após cada `git add` (R-0016).
- Critérios imutáveis; a reescrita de WP-B4/B5 em R-0015 (adenda A5) é o contraexemplo: aqui, critério
  não cumprido entra no closure como tal.
- ODs no registro canônico (`boat-build-pack.md` §4) no mesmo PR; OD-R15-* hoje só em `route-manifest.md`.
- Âncora da prova, `round close` + `round seal`; `budget.json` com parada a 80 %.
- Caracterização antes da troca: os testes estruturais de R-0015 (`boat-r0015.spec.ts`,
  `boat-forms-r0015.spec.ts`) ficam verdes ou são substituídos pelo Inspector com justificativa.
- Nenhum Capacitor (#109), nenhum RENAEST real (#120), nenhum valor normativo inventado, nenhum `--force`,
  nenhum arquivo gerado editado; nenhum Engineer entrega o próprio teste.

## Adendas

- **A1 — 3º ciclo de prompt-review (Owner, 2026-09-29).** Os ciclos 1 e 2 deram `REVIEW` (9 high;
  depois 1 high). Pela regra do §5 do prompt do maestro, o 3º ciclo exigia parada e consulta. O
  Owner respondeu nesta sessão "3º ciclo restrito", limitado ao único achado do ciclo 2. Ciclo 3:
  `PASS` (`reviews/prompt-review-3.json`), com 1 low (a regex não exige o `|` de fechamento da
  1ª célula; a comparação por conjunto já detecta ausência e duplicata; mantido como nota para não
  alterar prompt aprovado). O rótulo "OD-R28-004" usado na pergunta foi só de sessão: é decisão de
  processo, não OD de produto, e não entra no registro canônico; a numeração de ODs novas fica com
  TASK-0001/0002.

- **A2 — tipo de `getRandomValues` em CTG-0002 (Architect/maestro, 2026-09-29).** A assinatura
  exata do contrato (`<T extends ArrayBufferView>(array: T) => T`) não compila o dublê
  `vi.fn(getRandomValues)` do spec de armazenamento. Aceito o superconjunto `BoatRandomValues`
  adotado por TASK-0004 (continua aceitando a assinatura do contrato; o adaptador só preenche o IV).
  CTG-0002 não é reescrito; esta adenda prevalece sobre o tipo citado nele.

## Decisões do maestro

Maestro Opus 5.5 (`claude-opus-5-5`, Claude Code 2.1.283), sessão B da A-C2-15, bootstrap de
2026-09-29 (Owner datou a autorização de 2026-09-30). Papéis: Architect ao planejar e revisar;
Engineer ao commitar.

- **M1 — ids de modelo** (reconfirmados com chamada mínima `claude -p --model <id>` e
  `codex exec -m <id>`; `claude --help`/`codex --help` não listam ids): Opus 5.5 = `claude-opus-5-5`,
  Sonnet 5 = `claude-sonnet-5`, Sol 6 = `gpt-6-sol` (`codex-cli` 0.157.1). Workers pelos subagentes
  nativos do projeto (`.claude/agents/*.md`: `architect-blueprint`/`engineer-frontend` com
  `model: opus`, `inspector-tests`/`transcriber-docs` com `model: sonnet`). Reviewer pela ponte
  `tools/orchestra/bridge.sh codex gpt-6-sol …`.
- **M2 — worktree e branch.** `/Volumes/Thiamat II/stech/detran-worktrees/boat-wiring` não existe
  nesta máquina. A rodada corre na worktree gerida pelo app
  `/Users/aarusso/Development/detran/.claude/worktrees/maestro-r0028-r0026-5d1771`, branch
  `orchestra/boat-wiring` criada sobre `origin/main` `38c79714` (A-C2-15: base `origin/main`, sem
  empilhar em `stynx-dedup`, que não existe).
- **M3 — texto da A-C2-15.** PR #161 aberto no bootstrap: este `plan.md` foi trazido de
  `origin/docs/c0002-a-c2-15` (única diferença para `main`: a adenda A-C2-15 em §Execução) e o
  prompt do Owner vale como texto da adenda.
- **M4 — escopo das tarefas.** Só TASK-0001…0004 têm `tasks/*.json` e prompts; TASK-0005…0011
  ficam como proposta na tabela de §Tarefas até a retomada. O prompt-review cobre só as quatro.
- **M5 — `verify:round-tasks`.** `tools/devai/verify-round-tasks.mjs` só varre R-0003…R-0020; as
  tarefas desta rodada são validadas por arquivo com
  `pnpm exec devai check --only schema --schema law/schemas/task.schema.json --instance <task>`
  (mesmo validador que o script usa), além de `pnpm verify:round-tasks` verde para o conjunto
  coberto. O script não é alterado aqui (fora da fronteira).
- **M6 — `src/index.ts` da biblioteca.** Exports aditivos das portas em
  `apps/boat/mobile/src/index.ts` não tocam shell nem núcleo de app (R-0024): é o barril público da
  biblioteca BOAT, dentro do lock `MOD-boat-mobile-ports`.
- **M8 — RED esperado de TASK-0003.** Os `acceptance_commands` de TASK-0003 incluem
  `typecheck`; no checkpoint do maestro ele é aceito só com erros `TS2307` para os arquivos de
  implementação de `CTG-0002.md` (prompt-review 1, item 6). O verde integral é exigido em TASK-0004.
- **M7 — issue da frente.** TASK-0002 só redige `issue-body.md`; abrir a issue no GitHub é ato
  externo e fica para o maestro na retomada, com confirmação do Owner.

## Concorrência

Bootstrap 2026-09-29, `origin/main` = `38c79714` (#160 A-C2-14). PR aberto: só #161 (A-C2-15,
docs). Branches em curso: R-0020 `orchestra/devai-sensors` (`ebf308e7`, parada no CTG-0004),
R-0022 `orchestra/stynx-sse-tenancy` (`64d1f915`), R-0023 (sem branch publicado ainda), R-0031
`orchestra/pec-web` (`7c0854f3`), R-0030 `orchestra/user-docs` (`a9e19915`), R-0032 (sem branch
publicado ainda); R-0021 `orchestra/stynx-canonical` fechada. R-0024 `stynx-dedup` não existe:
`docs/framework/arch/frontend-wiring-pattern.md` ausente em todo branch. R-0029
`orchestra/teat-web-wiring` não existe: nenhum conflito de shell. Nenhum arquivo desta sessão cai
em lock de R-0020/R-0022/R-0023/R-0024.

## Bloqueios

## Triagem

- 2026-09-29 TASK-0004 → `sensor-error`: 2 specs de TASK-0003 não carregavam sob vitest+jsdom
  (`new URL(…, import.meta.url)` reescrito para `http://`); implementação correta (82/82). Nova
  tentativa de TASK-0003 com o achado (iteração 2): caminhos por `import.meta.dirname`, sem mudar
  asserção → 104/104. Nenhuma escalada.

## Retomada

**Checkpoint 2026-09-29 (sessão B, A-C2-15) — branch `orchestra/boat-wiring` publicado, sem PR.**

- **Concluídas (commits na branch):** bootstrap `21e930ed`; TASK-0001 `d9ae3ad5` (matriz de
  vínculo, `contracts/CTG-0002…0004.md`); TASK-0003 `5751e83a` + iteração 2 `3dc39e09` (9 specs de
  portas); TASK-0002 `5e511d04` (OD-R15-003…006 e OD-R28-001…019 em `boat-build-pack.md` §4,
  `issue-body.md`, backlog); TASK-0004 `41771ff7` (6 portas de homologação + providers).
  Gates de tarefa verdes: `@detran/boat-mobile` test (12 arquivos, 104 testes)/typecheck/lint/build,
  `test:boat-transitions`, `@detran/teat-mobile typecheck`, C-28-2-01…14, `docs:kb:check`.
- **Prompt-review:** 3 ciclos (REVIEW, REVIEW, PASS; o 3º autorizado pelo Owner, adenda A1).
- **Esperam:** TASK-0005…0009 (padrão `frontend-wiring-pattern.md` de R-0024; SSE canônico de
  R-0022 para TASK-0008/0009); TASK-0010 (stack e TASK-0007/0009); TASK-0011 (TASK-0010 e esquema
  de R-0030 em `main`). Prompts e `tasks/*.json` dessas tarefas ainda não existem (M4): o maestro da
  retomada os deriva de `contracts/CTG-0003.md`/`CTG-0004.md` e roda um prompt-review sobre eles.
- **Contratos a reconferir contra `origin/main` na retomada após R-0024 (A-C2-15):**
  `contracts/CTG-0003.md` (gateway, modo OD-R28-019, providers nos boundaries) e
  `contracts/CTG-0004.md` (telas web, SSE OD-R28-015); também OD-R28-005 (OpenAPI) e as ODs de
  papéis (007…010) contra `policy.ts` de R-0023. Divergência → adenda numerada do Architect.
- **Pendências do maestro:** abrir a issue da frente a partir de `issue-body.md` (com confirmação
  do Owner, M7); integrar `origin/main` por merge na retomada (inclui #161 A-C2-15, cujo
  `plan.md` foi trazido aqui).
- **Orçamento:** `budget.json` ≈ 98 % da janela estimada de 700 k (limiar de 80 % cruzado durante
  TASK-0002/0004); a retomada abre janela nova.

## Leitura
