# R-0026 — frente `dashboard-wiring` (ação 6 da C-0002 — DASHBOARD: console L0 → L2 sobre `BP-DASH-MONITOR-001`)

**Status:** **proposta — C-0002 rev. 2, aguardando autorização do Owner.** Planejada em 2026-09-26
pelo Architect (`work/campaigns/C-0002-consolidacao.md` §2, fase D). Maestro **Opus 5.5** (Claude
Code), workers da escada Claude (Opus 5.5 grande/médio, Sonnet 5 pequeno), reviewer **Sol 6** pela
ponte `tools/orchestra/bridge.sh codex` (OD-C2-003; ids de CLI confirmados no bootstrap). Worktree
`/Volumes/Thiamat II/stech/detran-worktrees/dashboard-wiring`, branch `orchestra/dashboard-wiring`.
Rastreio: #123 (reconciliação), #124 (L0 → L2), #96 (produtores RAIT, OD-D17), #97 (OD-D33), #98
(OD-D35), #99 (OD-D50, job de relatórios), #100 (OD-D58). `AUTHORIZATION.md`, `tasks/` e
`compositions.json` só nascem no bootstrap, depois da autorização.
**Concorrência (upstreams da campanha):**

- **Abertura:** R-0024 `stynx-dedup` publicada em `origin/orchestra/stynx-dedup` (abertura
  empilhada, §Execução OD-C2-005; o PR final espera o merge em `main`) (`docs/framework/arch/frontend-wiring-pattern.md`,
  cliente de comando único, costura SSE e shell em `@detran/ui`); transitivamente R-0022 (SSE de
  fonte única, pin 1.5.0) e R-0023 (`StynxAuthorizationModule`; `policy.ts` como dados). Fase A e
  R-0020 em `main`.
- **Locks compartilhados (C-0002 §3.5):** o CTG-0002, se criar chave em `policy.ts`, e o CTG-0003
  (backend RAIT: `backend/domains/inf/rait-*`, `inf/deadlines`) partilham o lock com o CTG-0002
  de R-0025 `rait-web-wiring` e com os CTGs backend de R-0027 `portal-delegations`. Sob a OD-C2-005,
  o lock não serializa PRs: a regra de convivência e a ordem de merge recomendada estão em
  §Execução OD-C2-005. O CTG-0003
  interessa também a R-0027: `rait.decision.published` é consumido por
  `backend/app/src/portal-stream.service.ts`. Os demais CTGs correm livres (`apps/dashboard/web` e
  `backend/domains/dashboard/*` são exclusivos desta rodada).
- **Manifesto de disponibilidade:** forma e caminho fixados em
  `work/rounds/R-0030/availability-manifest.schema.md` (§1 caminho canônico, §3–§4 forma e JSON
  Schema, §6 selos, §7 obrigações da fase D). Superfície desta rodada: `dashboard-web`.

**Janelas previstas:** 4 (1 planejamento + CTG-0001; 1 CTG-0002 ∥ CTG-0003; 1–2 CTG-0004; CTG-0005 no fim).
Recalibradas para ≈ 3 pela OD-C2-005 (ver §Execução OD-C2-005).

## Execução OD-C2-005 (Owner, 2026-09-27)

> **Adenda A-C2-15 (Owner, 2026-09-30; prevalece).** Abertura antecipada, **só análise e
> contrato**, na **sessão B** (Claude Code Opus 5.5; reviewer Sol 6), depois de R-0028. Tarefas
> liberadas: **TASK-0001…0003** (mapas, build pack, catálogo, contrato de backend; o job de
> relatórios mira `@stynx-nyx/jobs` 1.5.x com ator técnico) e **TASK-0006** (contrato dos produtores
> de eventos RAIT, OD-R26-001 = a). No contrato de TASK-0006, a seção de transporte fica marcada
> "pendente do outbox de R-0022". Esperam: TASK-0004/0005, TASK-0007/0008 e TASK-0009 em diante.
>
> - **Base:** `origin/main`, branch `orchestra/dashboard-wiring`. Push sem PR ao fim de cada tarefa
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
branch única, `orchestra/dashboard-wiring`, com commits por tarefa ou por CTG. Entre CTGs não há PR,
CI remoto, `devai evidence record`, `devai audit observe`, `pnpm check` completo nem
delivery-review. Ficam mantidos os `acceptance_commands` de cada tarefa, os checkpoints (b)–(d) como
gates de tarefa e **um** prompt-review no bootstrap. Os critérios de aceitação não mudam; muda só o
momento em que rodam: no fim da rodada. Onde um critério cita "PR do CTG-x", "por CTG" ou "por
merge", leia-se o PR final, a evidência única e o SHA do merge final.

**Ondas.** Derivadas da coluna "Depende de" e dos locks da tabela de tarefas. No máximo 3 workers
simultâneos. O maestro serializa os commits e faz push sem PR ao fim de cada onda.

| Onda | CTGs / tarefas em paralelo                                                                                      | Fronteiras de escrita (disjuntas)                                                                                                                                                       | Dependência                                                                                         |
| ---- | --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| O1   | CTG-0001: TASK-0001; depois TASK-0002 ∥ TASK-0003 ∥ TASK-0006; TASK-0009 entra na primeira vaga                 | `MOD-r26-{read,command}-map` → `MOD-dashboard-{build-pack,route-contract,error-catalog,i18n}` ∥ `MOD-r26-contract-ctg2` ∥ `MOD-r26-contract-ctg3` → `MOD-r26-contract-ctg4`             | TASK-0001 antes das demais                                                                          |
| O2   | CTG-0002: TASK-0004 → TASK-0005 ∥ CTG-0003: TASK-0007 → TASK-0008 ∥ CTG-0004: TASK-0010 → TASK-0011 → TASK-0012 | `MOD-app-e2e-dashboard`, `MOD-dashboard-monitor(-tests)`, `MOD-contracts-dashboard` ∥ `MOD-inf-rait-{tests,backend}`, `MOD-inf-deadlines`, `MOD-dashboard-seed` ∥ `MOD-dashboard-web-*` | TASK-0004 e TASK-0007 partilham `MOD-dashboard-monitor-tests`: TASK-0007 começa depois de TASK-0004 |
| O3   | CTG-0004 (fecho): TASK-0013 (smoke)                                                                             | `MOD-r26-stack-smoke` (nenhum código)                                                                                                                                                   | TASK-0012 e TASK-0008 commitadas; checkpoint (d)                                                    |
| O4   | CTG-0005: TASK-0014 → TASK-0016 ∥ TASK-0015                                                                     | `MOD-availability-dashboard-web`, `MOD-availability-schema` → `MOD-dashboard-web-tests-availability` ∥ `MOD-dashboard-build-pack`, `MOD-docs-dashboard-arch`, `MOD-docs`                | TASK-0013 (`reports/TASK-0013.md`)                                                                  |

O checkpoint (c) roda como gate de tarefa depois de TASK-0005 e depois de TASK-0008. As telas do
CTG-0004 que usam rota nova do CTG-0002 esperam só o commit de TASK-0005 na branch.

**Lock `MOD-shared-policy` partilhado na fase D (C-0002 §12).** O lock é partilhado entre o CTG-0003
(produtores RAIT) e o CTG-0002, se criar chave. Também o usam o CTG-0002/0003 de R-0025 e o CTG-0003
de R-0027 (delegações). Sob a OD-C2-005, ele deixa de serializar PRs por CTG. Regra de convivência:

- cada rodada edita `backend/domains/shared/src/policy.ts` (e `backend/domains/inf/rait-*`) no seu
  próprio branch, sem esperar as outras;
- quem mesclar depois integra `origin/main` por merge, mantém os blocos das duas rodadas no formato
  de dados de R-0023 e roda de novo `pnpm --filter @detran/shared test` e `policy-routes.e2e`
  (`pnpm backend:test:e2e`);
- ordem de merge final recomendada: **R-0025 → R-0026 → R-0027**. R-0026 mescla depois de R-0025,
  cuja extensão de `policy-routes.e2e` a `inf:rait-*` passa a conferir as rotas RAIT tocadas aqui, e
  antes de R-0027, que consome `rait.decision.published` em `portal-stream.service.ts`;
- a ordem não bloqueia o desenvolvimento paralelo: quem ficar pronto antes mescla antes, e a outra
  rodada aplica a mesma regra.

**Abertura empilhada.** A rodada pode abrir e trabalhar sobre `origin/orchestra/stynx-dedup`
(R-0024) assim que esse branch estiver publicado com `docs/framework/arch/frontend-wiring-pattern.md`.
Novas revisões de R-0024 entram por `git merge --no-edit origin/orchestra/stynx-dedup`, nunca por
rebase de branch publicado. O checkpoint (a) lê a base empilhada no lugar de `origin/main`, inclusive
a versão de `@stynx-nyx/*` e a presença de `@stynx-nyx/jobs` (OD-R26-003). Só o **PR final** espera
o merge de R-0024 em `main`, que exige R-0022 e R-0023. O requisito de STYNX 1.5.0 final chega por
transitividade: R-0022 só mescla com 1.5.0 final (OD-S15-01). Se OD-R26-003 = (a) depender de
`@stynx-nyx/jobs` do pin 1.5.0, a sequência final confere que o pin em `main` é o final, não um RC.

**Sequência final** (C-0002 §12, na ordem):

1. `git merge --no-edit origin/main`, com R-0024 (e, transitivamente, R-0022/R-0023) em `main`.
   Conflito em `policy.ts` segue a regra de convivência acima. TASK-0014 regrava `measuredAt` e os
   selos sobre o `main` integrado se a medição anterior tiver sido feita na base empilhada.
2. CI local completo, com os comandos abaixo e os greps dos critérios 1, 2, 7, 9 e 13:
   - `pnpm check`;
   - `pnpm contracts:check`, `pnpm blueprints:check` e `pnpm contracts:test`;
   - `pnpm --filter @detran/shared test`;
   - `pnpm --filter @detran/dashboard-monitor test`;
   - `pnpm backend:test:ci`;
   - `pnpm backend:test:e2e` (`policy-routes.e2e`);
   - `pnpm --filter @detran/app test:e2e`;
   - `bash backend/database/seed.sh` duas vezes;
   - `pnpm --filter @detran/dashboard-web typecheck`, `lint`, `test` e `build`;
   - `pnpm verify:parameter-catalogue`;
   - `pnpm docs:kb:check` e `pnpm docs:kb:publish-check`;
   - `pnpm format:check`;
   - `pnpm stack:start` + `pnpm stack:smoke`, com `reports/TASK-0013.md` refeito se o `main`
     integrado mudou código tocado;
   - `pnpm devai:rc:prepare`, quando aplicável.
3. **Uma** delivery-review (Sol 6 pela ponte) sobre o diff inteiro. Com `REVIEW`, as correções se
   limitam aos itens apontados, em no máximo 2 ciclos. Com `FAIL`, a rodada vai a `escalated`.
4. **Um** PR contra `main`, com a tabela CTG → tarefas → commits e os gates.
5. CI remoto. Falha de código volta à tarefa responsável. O merge só acontece com CI verde e `PASS`.
6. Publicação final:
   - `evidence-R-0026.json` com os 5 CTGs;
   - `devai evidence record` + `evidence verify`;
   - `devai audit observe` no SHA do merge;
   - `closure.json`, `devai round close` + `round seal`;
   - `waves.md` e `backlog.md` atualizados.

**Janelas recalibradas:** 4 → **≈ 3**. Estimativa por onda: O1 ≈ 0,5; O2 ≈ 1–1,5, com os três CTGs
em paralelo e CTG-0004 (10 módulos) no caminho crítico; O3 + O4 + sequência final ≈ 1. O ganho vem
da remoção de 5 ciclos de PR/CI/evidência e da espera pelo lock partilhado.

## Decisões do Owner (2026-09-26)

- **OD-R26-001 = (a).** O CTG-0003 é **incondicional**. A própria rodada cria e publica os eventos
  RAIT `rait.clock.flag-changed`, `rait.decision.published` e `rait.case.created` (#96, OD-D17), na
  transação do comando, com varredura de bandeira. Lock `MOD-shared-policy` e backend RAIT
  serializados com R-0025 e R-0027. Os ramos "se (b)" deste plano ficam sem efeito.

- **Decididas pelo Owner nesta sessão (2026-09-29, A-C2-12; registro canônico por TASK-0002 em
  `dashboard-build-pack.md` §4):**
  - OD-R26-003 (alvo): o job de relatórios mira `@stynx-nyx/jobs` **1.5.x** com ator técnico
    (UPS-JOB), conforme o prompt da sessão B.
  - OD-R26-004 = (a): as leituras sem `GET` próprio (OD-D16-001 exportações; OD-D16-002 radares e
    P-09) ganham `GET` próprio com chave de leitura, desenhados em `contracts/CTG-0002.md`; a chave
    em `policy.ts` entra na retomada (lock partilhado, regra de convivência).
  - OD-R26-005 = (a): manifesto em `docs/framework/arch/availability/dashboard-web.availability.json`
    (anexo de R-0030 §1); a campanha é corrigida por adenda.
  - i18n de OD-D16-012: só registro nesta abertura (textos sem fonte; a semente
    `docs/framework/arch/i18n/dashboard.pt-BR.json` tem paridade testada com
    `apps/dashboard/web/src/app/i18n/dashboard.pt-BR.json` em `i18n.spec.ts`); edição da semente e
    da cópia na retomada.
    (verificado em 2026-09-26 sobre `a92ef731`; o maestro remede no bootstrap)
- **ODs de TASK-0001 decididas pelo Owner nesta sessão (2026-09-29), todas pela recomendação do
  Architect:**
  - OD-R26-009: a decisão técnica fica com o Architect — (a) estender o DTO se o blueprint de
    `indicator` admitir edição por configuração; senão (b) os três campos saem da tela.
  - OD-R26-011 = (a): `volumeJustification` sai do corpo de criação; D-17 ganha o formulário
    `aprovar-exportacao` (`justification` do aprovador).
  - OD-R26-012 = (a): schema retranscrito ao `TransparencyAuditDto`; `evidences` registrada como
    lacuna de backend.
  - OD-R26-014 = (a): D-02 ganha o botão "em tratamento" (`dashboardAlertTreat`), com a ficha
    atualizada pelo Owner.
  - OD-R26-015 = (a): a UI trata os códigos do OpenAPI; as fichas são corrigidas.
  - OD-R26-019 = (a): `bi-panel` sem consumidor nesta rodada; o manifesto marca as 5 operações
    `indisponivel_nesta_versao` com esta OD.
- **ODs de TASK-0003/0006 decididas pelo Owner nesta sessão (2026-09-29), todas pela recomendação
  do Architect:**
  - OD-R26-020: mantém o comportamento atual da marca d'água até decisão (papel do solicitante só
    com coluna nova decidida pelo Owner); identidade do ator técnico conferida na retomada.
  - OD-R26-021: até o Owner fixar formato/armazenamento, a porta de artefato falha explicitamente
    e o job grava `fail` (nunca `processing` eterno).
  - OD-R26-026: as chaves de leitura novas recebem o rol da chave provisória de OD-D16-001/002;
    ampliar grant só com nova decisão do Owner.
  - OD-R26-030: relógio D = `source_pending`; nenhum evento D; IND-DASH-105 `connected=false`;
    bloco A no máximo **6/11** (a meta de 7/11 do plano fica condicionada à escada D).
  - OD-R26-031: no teto a varredura permanece em `CRITICO` e registra o relógio no relatório da
    execução; nenhum evento de `PRESCRITO_OPERACIONAL`.
  - OD-R26-033: só a publicação da ata de sessão emite `rait.decision.published`.
  - OD-R26-037: replay verde basta para `connected=true`; o closure declara que a varredura
    periódica aguarda R-0022/R-0024.
  - OD-R26-038: a varredura só grava bandeira e evento; nenhum `rait_clock_alert` nesta rodada.
- **ODs de TASK-0003/0006 com decisor Architect** (OD-R26-022…025, 027, 028, 032, 034, 035, 036,
  039): recomendações aceitas pelo maestro como provisórias; 022 e 036 dependem do outbox de R-0022.
- **ODs de TASK-0001 com decisor Architect** (OD-R26-006, 007, 008, 010, 013, 016, 017, 018; e
  OD-D33/D35/D58 em `contracts/CTG-0001.md`): o maestro, como Architect, aceita as recomendações
  como provisórias; as ligadas a SSE, cliente e camada (007, 017, 018) são reconferidas após
  R-0024/R-0022.

- **App:** `apps/dashboard/web` (R-0016, PC-0012): 18 telas, **22 entradas** em
  `src/app/app.route-manifest.ts` (18 + 2 filhas de detalhe + `sem-permissao` + `auth/callback`),
  **todas `level: 'L0'`**; `DashboardRouteLevel = 'L0' | 'L2'` (linhas 95–96). Nenhum
  `*.client.ts` nem facade em `features/` (10 módulos: `audit`, `catalogue`, `comparison`, `crashes`,
  `duties`, `integrations`, `radar`, `reports`, `transparency`, `triage`); `HttpClient` só em
  `main.ts`, `core/error-boundary.ts`, `core/sse/stream-transport.ts`, `forms/form-gate.ts` e specs.
  9 schemas em `forms/`; `testing/command-matrix.fixture.ts` com 16 comandos × 36 papéis;
  `core/layer-table.ts` transcreve `DASHBOARD_LAYER_BY_ROLE` (OD-D16-006); SSE local
  (`core/sse/sse.service.ts`, polling 30 s) — substituído pela costura canônica de R-0022/R-0024.
  2042 testes em R-0016. `apps/dashboard/web/README.md:65` afirma que R-0011 "não tem código" (falso).
- **Backend:** `backend/domains/dashboard/monitor` ≈ 19,4 mil linhas TS fora de specs (≈ 30 mil com
  testes); `docs/framework/contracts/BP-DASH-MONITOR-001.commands.openapi.json` com **43 operações**
  (23 `GET`, 18 `POST`, 2 `PATCH`) e tipos em `packages/api-clients/src/generated/BP-DASH-MONITOR-001.commands.ts`
  — **sem consumidor**. `GET /v1/dashboard/stream` (`backend/app/src/dashboard-stream.controller.ts:75`).
  `GET generated-reports` e `GET generated-reports/{id}` já estão no contrato (OD-D16-010 fecha por fonte).
  Não há `GET exports` (OD-D16-001) nem `GET` próprio de radares/P-09 (OD-D16-002).
- **Bloco A (`legal-ceiling`) 2/11 conectados** (`backend/database/seed/80-fixtures-dashboard-catalog.sql`):
  IND-DASH-101…105 (relógios RAIT A, B-JARI, B-CETRAN, C, D; projeção `dashboard.prescription_risk`)
  `connected=false`; 106–107 (PEC) `false`; 108–109 (TEAT) `true`; 110–111 (TEAT) `false`. Causa
  dos cinco RAIT (#96, OD-D17): `rait.clock.flag-changed`, `rait.decision.published` e
  `rait.case.created` (`docs/framework/arch/rait-events-sse-contract.md` §2) não têm produtor; os
  produtores atuais são `rait.case.changed|admitted|received|withdrawn` e `rait.assignment.changed`.
  Nenhum código calcula `inf.rait_clock.flag` (só o repositório gerado a lê): a bandeira exige a
  varredura de `docs/framework/arch/rait-deadline-engine.md` §4–§5, com escadas aprovadas em
  `WF-RAIT-002` §4.1–§4.3 (steering A.1) e §Decisão H.46 (relógio D).
- **ODs abertas desta frente:** OD-D16-001…019 (`docs/meta/knowledge-base/backlog.md`, seção DASHBOARD);
  OD-D17, OD-D33, OD-D35, OD-D50, OD-D58 e demais em `docs/framework/arch/dashboard-build-pack.md` §4.
  O único `it.todo` do backend DASHBOARD está em `backend/app/tests/e2e/dashboard-domain-boundary.e2e.spec.ts:476` (OD-D58).
  `@stynx-nyx/jobs` não está instalado no pin 1.3.1 (`backend/app/src/boat-renaest-job.service.ts:58`
  explica por que o BOAT não o usou); o pin da fase D é 1.5.0 — o maestro confere no bootstrap.

## Metas

1. **Reconciliação (CTG-0001, #123):** `read-map.md` (22 rotas → `operationId` de leitura, facade,
   cliente de feature, tópicos SSE, frescor, nível-alvo, OD) e `command-map.md` (16 comandos de UI ×
   20 mutações do contrato: chave de política, schema de formulário, If-Match/Idempotency-Key, erros de
   `dashboard-error-catalog.md`). Triagem de OD-D16-001…019 e decisões de Architect para OD-D33 (#97),
   OD-D35 (#98) e OD-D58 (#100); ODs novas `OD-R26-nnn` e a triagem **no build pack §4** (registro
   canônico do app) no mesmo PR.
2. **Backend DASHBOARD (CTG-0002, #98/#99/#100):** códigos de estado por recurso ou confirmação de
   `DASH.VALIDATION_FAILED`; guarda de `DASH.ALERT_BUSINESS_ACT_FORBIDDEN` ou retirada do código (o
   `it.todo` deixa de existir); job de geração de relatórios chamando `complete`/`fail` de
   `backend/domains/dashboard/monitor/src/handwritten/surface/report.service.ts`; rotas de leitura
   faltantes só se TASK-0001 as decidir (com chave de política → lock compartilhado).
3. **Produtores RAIT (CTG-0003, #96 — OD-R26-001 = (a), decidida pelo Owner em 2026-09-26):** os três eventos publicados na
   transação do comando (outbox) com o envelope de `rait-events-sse-contract.md` §1; bandeira de
   relógio calculada pela varredura; `connected=true` no seed só para os indicadores cujo replay
   passa. Meta: bloco A de 2/11 para 7/11 (os 4 restantes são PEC/TEAT, fora desta frente).
4. **Console L0 → L2 (CTG-0004, #124):** `features/<módulo>/<módulo>.client.ts` + facades pelo padrão
   de ligação; dados reais nas 18 telas; comandos dos 9 formulários; SSE canônico e frescor; camada
   do usuário pela fonte de autorização de R-0023 (fecha ou reclassifica OD-D16-006/015/016);
   supressão primária e secundária ponta a ponta em D-13; `L1` só como nível parcial com OD.
5. **Documentação e delta (CTG-0005):** build pack §1/§2/§4, `dashboard-frontends.md` §10,
   `dashboard-route-contract.md` §6, `dashboard-error-catalog.md`, `apps/dashboard/web/README.md`
   reescrito (sem "não tem código"), `backlog.md`, `waves.md`; **delta do manifesto de
   disponibilidade** da superfície `dashboard-web` em
   `docs/framework/arch/availability/dashboard-web.availability.json` (caminho canônico do §1 do
   anexo de R-0030; C-0002 §3.5 cita `docs/framework/arch/availability/dashboard-web.availability.json` — ver OD-R26-005);
   não manuais.

## Tarefas (proposta — o maestro deriva `tasks/*.json` e `prompts/TASK-nnnn.md` no bootstrap)

| Tarefa    | Papel                | Perfil              | Modelo/esforço   | Lock `MOD-*`                                                                                                                                                                     | Depende de                                | Entrega                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| --------- | -------------------- | ------------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TASK-0001 | Architect            | architect-blueprint | Opus 5.5 / alto  | `MOD-r26-read-map`, `MOD-r26-command-map`                                                                                                                                        | —                                         | `read-map.md`, `command-map.md`; triagem OD-D16-001…019 (fechada por fonte / Architect / Owner / aberta); decisões OD-D33, OD-D35, OD-D58; nível-alvo das 22 rotas (L2; L1 ou L0 só com OD); `contracts/CTG-0001.md`                                                                                                                                                                                                                                                              |
| TASK-0002 | Architect (transcr.) | transcriber-docs    | Sonnet 5 / baixo | `MOD-dashboard-build-pack`, `MOD-dashboard-route-contract`, `MOD-dashboard-error-catalog`, `MOD-dashboard-i18n`                                                                  | TASK-0001                                 | Build pack §4 (triagem OD-D16 e `OD-R26-nnn`); route contract §6 (OD-D33); catálogo de erros (OD-D35); chaves de OD-D16-012 em `docs/framework/arch/i18n/dashboard.pt-BR.json` nos namespaces allowlistados                                                                                                                                                                                                                                                                       |
| TASK-0003 | Architect            | architect-blueprint | Opus 5.5 / alto  | `MOD-r26-contract-ctg2`                                                                                                                                                          | TASK-0001                                 | `contracts/CTG-0002.md`: códigos por recurso, guarda ou retirada de `ALERT_BUSINESS_ACT_FORBIDDEN`, job de relatórios (substrato `@stynx-nyx/jobs` do pin vigente se carregar o ator técnico; senão porta no padrão de `boat-renaest-job`, com OD), rotas de leitura decididas; critérios C-26-2-nn                                                                                                                                                                               |
| TASK-0004 | Inspector            | inspector-tests     | Opus 5.5 / médio | `MOD-app-e2e-dashboard`, `MOD-dashboard-monitor-tests`                                                                                                                           | TASK-0003                                 | e2e/unit: estado inválido por recurso; 403 ou retirada (o `it.todo` de `dashboard-domain-boundary.e2e.spec.ts` some); job (`processing` → `complete`/`fail`, idempotência, tenant); rotas novas com presença/ausência por papel                                                                                                                                                                                                                                                   |
| TASK-0005 | Engineer             | engineer-backend    | Opus 5.5 / médio | `MOD-dashboard-monitor`, `MOD-contracts-dashboard` (+ `MOD-shared-policy` se houver chave nova)                                                                                  | TASK-0004                                 | Implementação; `pnpm contracts:openapi`/`contracts:clients` quando o contrato mudar; nenhum gerado editado à mão                                                                                                                                                                                                                                                                                                                                                                  |
| TASK-0006 | Architect            | architect-blueprint | Opus 5.5 / alto  | `MOD-r26-contract-ctg3`                                                                                                                                                          | TASK-0001, OD-R26-001                     | `contracts/CTG-0003.md`: ponto de emissão de cada evento (comando e transação), payload de `rait-events-sse-contract.md` §2, varredura de bandeira (§4–§5 do motor; escadas WF-RAIT-002 §4.1–§4.3 e H.46; limiar sem fonte = `source_pending`), `docs/framework/schemas/events/rait.*.schema.json` se o padrão exigir, regra do seed `connected`                                                                                                                                  |
| TASK-0007 | Inspector            | inspector-tests     | Opus 5.5 / médio | `MOD-inf-rait-tests`, `MOD-dashboard-monitor-tests`                                                                                                                              | TASK-0006                                 | Outbox com envelope válido; escada por relógio com relógio fixo (presença e ausência de mudança); idempotência da varredura; replay nas projeções `prescription-risk`/`production`; consumo do Portal intacto (`backend/app/tests/e2e/portal-stream.e2e.spec.ts`)                                                                                                                                                                                                                 |
| TASK-0008 | Engineer             | engineer-backend    | Opus 5.5 / médio | `MOD-inf-rait-backend`, `MOD-inf-deadlines`, `MOD-dashboard-seed`                                                                                                                | TASK-0007                                 | Produtores e varredura; `connected=true` para IND-DASH-101…105 cujo replay passa; `seed.sh` provado duas vezes                                                                                                                                                                                                                                                                                                                                                                    |
| TASK-0009 | Architect            | architect-blueprint | Opus 5.5 / alto  | `MOD-r26-contract-ctg4`                                                                                                                                                          | TASK-0001                                 | `contracts/CTG-0004.md`: aplicação de `frontend-wiring-pattern.md` aos 10 módulos (sem variante); estados de tela; tópicos SSE por tela; frescor; camada por R-0023; `X-Purpose` do `LayerGate` N2; D-13; jornadas do smoke; critérios C-26-4-nn                                                                                                                                                                                                                                  |
| TASK-0010 | Inspector            | inspector-tests     | Opus 5.5 / médio | `MOD-dashboard-web-tests`                                                                                                                                                        | TASK-0009                                 | Por operação: verbo/path/headers lidos do OpenAPI em disco; facades (vazio, carregando, erro, indisponível, desatualizado, bloqueado por decisão); nível de rota = `read-map.md`; matriz papel × camada × rota regenerada (caracterização); supressão primária e secundária sobre carga no formato do contrato; SSE + frescor                                                                                                                                                     |
| TASK-0011 | Engineer             | engineer-frontend   | Opus 5.5 / médio | `MOD-dashboard-web-triage`, `MOD-dashboard-web-radar`, `MOD-dashboard-web-integrations`, `MOD-dashboard-web-duties`, `MOD-dashboard-web-catalogue`                               | TASK-0010                                 | Clientes, facades e páginas desses 5 módulos; `app.route-manifest.ts` (níveis)                                                                                                                                                                                                                                                                                                                                                                                                    |
| TASK-0012 | Engineer             | engineer-frontend   | Opus 5.5 / médio | `MOD-dashboard-web-comparison`, `MOD-dashboard-web-audit`, `MOD-dashboard-web-transparency`, `MOD-dashboard-web-crashes`, `MOD-dashboard-web-reports`, `MOD-dashboard-web-forms` | TASK-0011                                 | Idem para os outros 5 módulos; 9 formulários ligados aos comandos; remoção do SSE/camada locais substituídos                                                                                                                                                                                                                                                                                                                                                                      |
| TASK-0013 | Inspector            | inspector-tests     | Sonnet 5 / médio | `MOD-r26-stack-smoke`                                                                                                                                                            | TASK-0012 (e TASK-0008 se OD-R26-001 = a) | Smoke na stack (`pnpm stack:start` + runbook de R-0017): 18 telas com dado real, um comando por formulário, evento SSE observado, D-13 suprimida; `reports/TASK-0013.md`; nenhum código                                                                                                                                                                                                                                                                                           |
| TASK-0014 | Architect (transcr.) | transcriber-docs    | Sonnet 5 / baixo | `MOD-availability-dashboard-web`, `MOD-availability-schema`                                                                                                                      | TASK-0013                                 | `docs/framework/arch/availability/dashboard-web.availability.json` (anexo de R-0030 §3; `measuredAt` sobre o `main` integrado, `history` iniciado): 22 rotas + comandos com `operationId`, selo (`disponivel`, `parcial`, `indisponivel_nesta_versao`, `bloqueado_por_decisao`) e `decision`; se for a primeira da fase D a mesclar, transcreve o §4 para `docs/framework/schemas/availability-manifest.schema.json` + linha em `docs/framework/schemas/README.md`; nenhum manual |
| TASK-0016 | Inspector            | inspector-tests     | Sonnet 5 / médio | `MOD-dashboard-web-tests-availability`                                                                                                                                           | TASK-0014                                 | Spec do app que prova R1 (rotas de `app.route-manifest.ts` = `path` do arquivo) e R3 (perfis) do anexo §6, e selo × `level` × marcador de indisponibilidade (§6.1)                                                                                                                                                                                                                                                                                                                |
| TASK-0015 | Architect (transcr.) | transcriber-docs    | Sonnet 5 / baixo | `MOD-dashboard-build-pack`, `MOD-docs-dashboard-arch`, `MOD-docs`                                                                                                                | TASK-0013                                 | Build pack §1/§2 (WP-D5 em L2, gates reais), `dashboard-frontends.md` §10, README do app, `backlog.md` (#123/#124/#96–#100 fechadas ou com OD), `waves.md` §Histórico                                                                                                                                                                                                                                                                                                             |

- CTG-0001 = 0001 → 0002.
- CTG-0002 = 0003 → 0004 → 0005 (regra de convivência com R-0025/R-0027 **só** se tocar `MOD-shared-policy`).
- CTG-0003 = 0006 → 0007 → 0008 (**lock compartilhado** com R-0025 CTG-0002 e R-0027; regra de
  convivência de §Execução OD-C2-005, sem espera de PR).
  Se OD-R26-001 = (b), o CTG-0003 não existe: TASK-0002 registra a OD e o seed segue `connected=false`.
- CTG-0004 = 0009 → 0010 → 0011 → 0012 → 0013.
- CTG-0005 = 0014 → 0016, ∥ 0015.

Commits por CTG na branch única; um PR no fim (OD-C2-005). TASK-0003, TASK-0006 e TASK-0009 podem correr em paralelo (locks disjuntos); no
máximo três tarefas simultâneas.

**Checkpoints do maestro (Engineer):**
(a) bootstrap: `frontend-wiring-pattern.md` em `origin/main`; contagens do Estado de partida; linha
de base `pnpm --filter @detran/dashboard-web test` e `pnpm --filter @detran/dashboard-monitor test`
em §Leitura; versão de `@stynx-nyx/*` e presença de `@stynx-nyx/jobs` nos manifestos;
(b) depois de TASK-0002: `pnpm verify:parameter-catalogue`, `pnpm docs:kb:check`;
(c) depois de TASK-0005 e de TASK-0008: `pnpm contracts:check`, `pnpm blueprints:check`,
`pnpm --filter @detran/shared test`, `pnpm backend:test:ci`, `bash backend/database/seed.sh` duas vezes;
(d) antes de TASK-0013: `pnpm stack:start` e `pnpm stack:status` verdes.

## Critérios de aceitação (comandos → resultado; imutáveis, C-0002 §4)

1. `grep -rn "level: 'L0'" apps/dashboard/web/src/app/app.route-manifest.ts` → só rotas listadas em
   `read-map.md` com OD aberta (meta: 0 entre as 18 telas); nenhuma rota `L1` sem OD.
2. Cada módulo de `apps/dashboard/web/src/app/features/` tem `<módulo>.client.ts` e facade no formato
   de `frontend-wiring-pattern.md`; `grep -rn "HttpClient" apps/dashboard/web/src/app/features` só em
   arquivos que o padrão admite.
3. `pnpm --filter @detran/dashboard-web typecheck`, `lint`, `test`, `build` → verdes; nº de testes ≥
   linha de base (a).
4. Spec de conformidade (TASK-0010): cada `operationId` usado em `read-map.md`/`command-map.md` emite
   verbo e path de `BP-DASH-MONITOR-001.commands.openapi.json`; mutações com `Idempotency-Key` e
   `If-Match` onde o contrato exige (exceção `export_log`, OD-D37).
5. D-13: supressão primária e secundária provadas sobre dado no formato do contrato
   (`dashboard.cell_threshold`, OD-D02), sem `0` nem `—` isolados.
6. Matriz papel × camada × rota: gerada antes e depois; divergência só a declarada em `read-map.md`;
   N3 nunca é camada de rota.
7. `grep -rn "it.todo" backend/app/tests/e2e/dashboard-domain-boundary.e2e.spec.ts` → nenhuma linha.
8. `pnpm --filter @detran/dashboard-monitor test`, `pnpm --filter @detran/app test:e2e`,
   `pnpm backend:test:ci` → verdes; `bash backend/database/seed.sh` passa duas vezes seguidas.
9. Se OD-R26-001 = (a): `grep -rn "'rait.clock.flag-changed'\|'rait.decision.published'\|'rait.case.created'" backend/domains/inf --include=*.ts`
   encontra produtor fora de testes; IND-DASH-101…105 com `connected=true` só onde o replay passa;
   bloco A reportado no closure (esperado 7/11). Se (b): OD-R26-001 registrada e seed inalterado.
10. `pnpm contracts:check`, `pnpm blueprints:check` → sem diff; `pnpm contracts:test` → verde;
    `pnpm verify:parameter-catalogue` → `0 errors`; `pnpm docs:kb:check`, `pnpm docs:kb:publish-check`
    → OK; `pnpm format:check` → sem diffs; `pnpm check` → verde.
11. Smoke (TASK-0013) com `pnpm stack:start` (e `pnpm stack:smoke`, versionado por R-0017): o PR do
    CTG-0004 não abre sem `reports/TASK-0013.md`.
12. `docs/framework/arch/availability/dashboard-web.availability.json` válido contra o JSON Schema do
    anexo de R-0030 §4 (JSON parseável; enums conferidos); spec de TASK-0016 verde (R1, R3); selo coerente
    com `level` e com `command-map.md`.
13. `apps/dashboard/web/README.md` sem a frase "não tem código"; #123/#124 com checklist fechado ou
    OD por item.
14. DEVAI: `evidence record`/`verify` por CTG; `audit observe` por merge; `round close` + `round seal`;
    âncora da prova na cadeia.

## Mapa entregável → definições

| Entregável             | Definição (caminhos verificados)                                                                                                                                                                                                                                                                                                                                            |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| padrão de ligação      | `docs/framework/arch/frontend-wiring-pattern.md` (**entregável de R-0024**; lido no bootstrap)                                                                                                                                                                                                                                                                              |
| telas e rotas          | `docs/framework/arch/dashboard-frontends.md` §3–§10; fichas `docs/framework/product/transversal/dashboard/screens/IU-DASH-D-01…18.md`; `work/rounds/R-0016/route-manifest.md`                                                                                                                                                                                               |
| leitura e comandos     | `docs/framework/contracts/BP-DASH-MONITOR-001.commands.openapi.json`; `docs/framework/arch/dashboard-route-contract.md` §1–§5; `backend/domains/shared/src/policy.ts` (`DASHBOARD_RULES`, `dashboardLayerFor`)                                                                                                                                                              |
| erros                  | `docs/framework/arch/dashboard-error-catalog.md`; OD-D35, OD-D58                                                                                                                                                                                                                                                                                                            |
| eventos DASHBOARD      | `dashboard-route-contract.md` §6; `docs/framework/schemas/events/dashboard.{alert,duty}.changed.schema.json`; OD-D33                                                                                                                                                                                                                                                        |
| SSE e frescor          | `dashboard-route-contract.md` §5; OD-D16-013; costura canônica de R-0022/R-0024                                                                                                                                                                                                                                                                                             |
| supressão (D-13)       | [RN-DASH-161], [RN-DASH-172]; OD-D02/DT-029; `IU-DASH-D-13.md`                                                                                                                                                                                                                                                                                                              |
| relatórios (job)       | `dashboard-route-contract.md` §4; `backend/domains/dashboard/monitor/src/handwritten/surface/report.service.ts`; precedente `backend/app/src/boat-renaest-job.service.ts`; OD-D50                                                                                                                                                                                           |
| produtores RAIT        | `docs/framework/arch/rait-events-sse-contract.md` §1–§2; `docs/framework/arch/rait-deadline-engine.md` §4–§5; `docs/framework/product/domains/inf/rait/workflows/WF-RAIT-002.md` §4; projeções `backend/domains/dashboard/monitor/src/handwritten/projections/{prescription-risk,production}.projection.ts`; seed `backend/database/seed/80-fixtures-dashboard-catalog.sql` |
| manifesto de disponib. | C-0002 §3.5; `work/rounds/R-0030/availability-manifest.schema.md` §1–§7 (planejamento de R-0030)                                                                                                                                                                                                                                                                            |

## Decisões pendentes (ODs novas; TASK-0002 registra no build pack §4)

| OD         | Pergunta                                                                                                                                                                                                                          | Opções                                                                                                                                                                                                                                                              | Recomendação do Architect                                                                                                                                                                                                                                                                                                | Decisor                            |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------- |
| OD-R26-001 | **Decidida pelo Owner em 2026-09-26: (a).** Bloco A em 2/11 (#96, OD-D17): quem publica os três eventos RAIT                                                                                                                      | (a) CTG-0003 nesta rodada: produtores na transação do comando + varredura de bandeira; seed `connected` por replay aprovado; lock serializado com R-0025/R-0027; (b) indicadores seguem `DESCONECTADA` com OD e #96 vai a uma rodada de backend RAIT fora da C-0002 | **(a)**: projetores e testes de replay já existem, as escadas têm fonte aprovada (WF-RAIT-002 §4, steering A.1, H.46), o MVP exige 100 % do bloco A (DT-030) e R-0027 ganha `rait.decision.published` para o Portal; (b) deixa 5/11 desconectados sem dono e contraria o critério "nenhuma página L0 sem OD" em espírito | **Owner — bloqueante do CTG-0003** |
| OD-R26-002 | `L1` no DASHBOARD                                                                                                                                                                                                                 | (a) admitir `L1` (leitura real sem comando) só como nível parcial com OD por rota; (b) só L0/L2                                                                                                                                                                     | (a), alinhado a M13 de R-0012 e ao critério 1                                                                                                                                                                                                                                                                            | Architect                          |
| OD-R26-003 | Job de relatórios (#99)                                                                                                                                                                                                           | (a) `@stynx-nyx/jobs` do pin 1.5.0, se carregar o ator técnico ao handler; (b) porta própria no padrão BOAT                                                                                                                                                         | (a) se verificado no bootstrap; senão (b) com OD que aponta a lacuna ao STYNX                                                                                                                                                                                                                                            | Architect                          |
| OD-R26-004 | Rotas de leitura sem `GET` próprio (OD-D16-001 exportações; OD-D16-002 radares e P-09)                                                                                                                                            | (a) criar `GET` + chave de leitura no CTG-0002 (lock `MOD-shared-policy`); (b) manter a chave provisória e a leitura por `alerts`/`comparisons`                                                                                                                     | (b) nesta rodada, com as telas em L2 sobre as rotas existentes; (a) só se a leitura provisória não cobrir a ficha                                                                                                                                                                                                        | Owner                              |
| OD-R26-005 | Caminho do manifesto: C-0002 §3.5 (`docs/framework/arch/availability/dashboard-web.availability.json`) × anexo de R-0030 §1 (`docs/framework/arch/availability/dashboard-web.availability.json`, "nenhum outro caminho é aceito") | (a) caminho do anexo; (b) caminho da campanha                                                                                                                                                                                                                       | (a): o gate de R-0030 lê só o caminho canônico; a campanha é corrigida por adenda (mesma decisão de OD-R25-005)                                                                                                                                                                                                          | Owner (ratificar)                  |

As OD-D16 que o console ainda tinha como provisório executado (006 camada, 013 protocolo SSE, 015
wildcard, 016 interceptors) são reavaliadas contra R-0023/R-0024: fechadas por fonte quando o padrão
as resolver, nunca por inferência.

## Riscos

- **Envelope da carga real × view-models `source_pending`** (OD-D16-017): o campo sem forma é
  exibido como token, nunca calculado; divergência vira OD, não adaptação silenciosa.
- **Passe global** (OD-D16-005/OD-D76): se R-0023 mantiver `'*'` para `GLOBAL_ADMIN_ROLES`, a matriz
  papel × camada muda; o Inspector declara a diferença, o Owner decide.
- **Varredura de bandeira** é código novo no backend RAIT sob lock compartilhado: CTG-0003 avança no
  branch próprio e, se R-0025 mesclar antes, a sequência final integra `origin/main` por merge;
  conflito em `policy.ts` mantém os dois blocos.
- **Seed** faz parte do CI: `connected=true` sem replay verde é proibido.
- **Padrão de ligação ausente** (R-0024 não mesclada) → parada no checkpoint (a).
- **Anexo de R-0030 ausente em `main`** → TASK-0014 espera; CTG-0005 não fecha sem ele.

## Lições aplicadas (C-0001 → C-0002 §4; `waves.md` §Histórico)

- **Relatórios versionados** com `git add -f` enquanto `reports/` for ignorado e conferência
  `find` × `git ls-files` depois de cada `add` (R-0016 perdeu o módulo `features/reports/` do app para
  o mesmo padrão; o `.gitignore` já tem a negação — conferir que continua valendo).
- **Critérios imutáveis**; critério substituído vai ao closure como **não cumprido**; proibido repetir
  as substituições de R-0013/R-0014 e o waiver SQL2 de R-0007.
- **ODs no registro canônico** (build pack §4 do DASHBOARD; `open-decisions-rait.md` para OD que
  toque o RAIT) no mesmo PR; OD só em `contracts/` não conta.
- **Âncora da prova**, `round close` + `round seal`; **orçamento** com `budget.json` e parada a 80 %.
- **Caracterização antes de troca** da camada e do SSE locais pelos canônicos.
- **Padrão único** de ligação; nenhum cliente, interceptor ou SSE local novo.
- **Inspector de matriz grande** em nível médio (R-0014); sem asserção por conjunto.
- **Proibições:** Engineer não testa o próprio artefato; nenhum gerado editado; nenhum `--force`;
  nenhum valor normativo inventado; nenhuma integração externa real.
- **Ciclos de review** a partir do segundo restritos aos itens corrigidos.

## Adendas

- **A1 — dispensa do 3º ciclo de prompt-review (Owner, 2026-09-29).** Ciclo 1: `REVIEW` (7 high);
  ciclo 2: `REVIEW` com 1 high (TASK-0003 sem `dashboard-crashes.projection.ts` e
  `export.service.ts` na leitura fechada; as demais correções atendidas). O maestro corrigiu o
  achado e perguntou ao Owner; resposta nesta sessão: "Seguir sem 3º ciclo". **Desvio registrado:**
  os workers foram disparados sem veredito `PASS` final; a correção do achado do ciclo 2 foi
  verificada só pelo maestro (arquivos existem; texto em `prompts/TASK-0003.md` §Leitura 9). Esta
  dispensa não se estende a outros itens nem a outras rodadas.

## Decisões do maestro

Maestro Opus 5.5 (`claude-opus-5-5`, Claude Code 2.1.283), sessão B da A-C2-15, segunda rodada da
sequência (depois de R-0028), 2026-09-29. Papéis: Architect ao planejar e revisar; Engineer ao
commitar.

- **M1 — ids de modelo:** os mesmos de R-0028 M1, reconfirmados na mesma sessão: Opus 5.5 =
  `claude-opus-5-5`, Sonnet 5 = `claude-sonnet-5`, Sol 6 = `gpt-6-sol` (`codex-cli` 0.157.1);
  workers pelos subagentes nativos (`architect-blueprint` `model: opus`, `transcriber-docs`
  `model: sonnet`); reviewer pela ponte `tools/orchestra/bridge.sh codex gpt-6-sol …`.
- **M2 — worktree e branch.** Mesma worktree gerida pelo app da sessão
  (`/Users/aarusso/Development/detran/.claude/worktrees/maestro-r0028-r0026-5d1771`), branch
  `orchestra/dashboard-wiring` criada sobre `origin/main` `25c95252`.
- **M3 — texto da A-C2-15.** PR #161 aberto: este `plan.md` veio de `origin/docs/c0002-a-c2-15`.
- **M4 — escopo.** Só TASK-0001, 0002, 0003 e 0006 têm `tasks/*.json` e prompts; o prompt-review
  cobre só elas. Os modelos seguem a tabela §Tarefas (TASK-0002 Sonnet; as outras Opus, alto).
- **M5 — `verify:round-tasks`** varre só R-0003…R-0020: validação por arquivo com
  `pnpm exec devai check --only schema --schema law/schemas/task.schema.json --instance <task>`.
- **M6 — `@stynx-nyx/jobs` 1.5.0** conferido no registro: publicado (1.5.0 final) e com o ator
  técnico de UPS-JOB-01…04 (STYNX #295, fechada como atendida). O pin do repositório segue 1.4.0
  (troca de R-0022); por isso TASK-0004/0005 esperam.
- **M7 — faixas de OD.** Para as tarefas paralelas não colidirem: TASK-0001 usa OD-R26-006…019,
  TASK-0003 OD-R26-020…029, TASK-0006 OD-R26-030…039.
- **M9 — TASK-0002 sem i18n nesta abertura.** A linha de TASK-0002 em §Tarefas (lock
  `MOD-dashboard-i18n`, chaves de OD-D16-012 na semente) vale na retomada; nesta abertura prevalece a
  decisão do Owner de só registrar (prompt-review 1, nota): `tasks/TASK-0002.json` não leva
  `MOD-dashboard-i18n`.
- **M10 — TASK-0002 depois de TASK-0003/0006.** Para o build pack §4 receber também as ODs
  OD-R26-020…039 dos contratos CTG-0002/0003 (lição 13), TASK-0002 corre depois deles, com nota do
  maestro ampliando a leitura só às seções `## ODs novas` desses dois contratos.
- **M8 — ondas desta abertura.** O1: TASK-0001. O2: TASK-0002 ∥ TASK-0003 ∥ TASK-0006 (fronteiras
  disjuntas: `docs/framework/arch/dashboard-*` e backlog ∥ `contracts/CTG-0002.md` ∥
  `contracts/CTG-0003.md`).

## Concorrência

Bootstrap 2026-09-29, `origin/main` = `25c95252` (#166). PR aberto relevante: #161 (A-C2-15,
docs). R-0028 `orchestra/boat-wiring` publicado nesta sessão (checkpoint; sem lock comum). R-0020
`orchestra/devai-sensors`, R-0022 `orchestra/stynx-sse-tenancy`, R-0031 `orchestra/pec-web`,
R-0030 `orchestra/user-docs` em curso/checkpoint; R-0023, R-0024, R-0025, R-0027 sem branch
publicado. Nenhum arquivo desta abertura toca locks de R-0020/R-0022/R-0023/R-0024; `policy.ts` e
`backend/domains/inf/rait-*` (locks partilhados com R-0025/R-0027) não são editados agora.

## Bloqueios

## Triagem

- 2026-09-29 TASK-0002 → sem falha de aceitação. C-26-1-10 (critério de CTG-0001) acha
  `DEVER_NAO_CUMPRIDO` sem literal no backend (emissão dinâmica `DEVER_${toState}`, OD-D70); a
  transcrição aplicou a regra do próprio CTG-0001 §OD-D33 (7 tokens em §6) e abriu OD-R26-040.
  Decisão provisória do maestro (Architect): manter fora até haver literal; revisitar com OD-D70 na
  retomada. O worker rodou um `git diff --stat` de leitura (sem efeito), registrado no relatório.

## Retomada

## Leitura
