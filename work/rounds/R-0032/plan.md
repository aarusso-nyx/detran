# R-0032 — frente `portal-pec` (ação 8 da C-0002, ADR-0034 §2: superfície do candidato P-01…P-07 no Portal, vínculo cidadão → candidato PEC, comandos cidadãos por delegação, manual do cidadão PEC)

**Status:** **proposta — C-0002 rev. 2, aguardando autorização do Owner**. Planejada em 2026-09-26
pelo Architect para executar a decisão do Owner **OD-PW-001** ("elabore um plano de implementação
completo para o módulo do cidadão/PEC disponível no portal", 2026-09-26). O Architect decidiu, para
executá-la, tirar a superfície C de R-0031 e fazer dela esta rodada própria: isso paraleliza o
trabalho e isola a questão de identidade (OD-R32-001). Fontes vinculantes:
`work/campaigns/C-0002-consolidacao.md` §2 fase F, §4 e §8; `docs/meta/adr/ADR-0034-pec-web-frontend.md`
§Decisão 2–6.
Maestro previsto: **Opus 5.5** (Claude Code). Workers pela escada Claude (Opus 5.5 grande e médio,
Sonnet 5 pequeno, com nomes vigentes em `model-ladder.md` após R-0018), por subagentes nativos.
Reviewer: **Sol 6** pela ponte `tools/orchestra/bridge.sh codex`. A alternância com R-0031, cujo
maestro é Sol 6, segue OD-C2-003; os ids são confirmados no bootstrap.
Worktree `/Volumes/Thiamat II/stech/detran-worktrees/portal-pec`, branch `orchestra/portal-pec`.
Ainda não existem `AUTHORIZATION.md`, `tasks/` nem `compositions.json`: o maestro os cria no
bootstrap.

**Concorrência:**

- **Abertura.** A rodada abre quando R-0031 `pec-web` tiver o **CTG-0001 (contratos PEC)** no
  branch publicado `origin/orchestra/pec-web` (empilhar); o PR final espera o merge de R-0031. Com isso, R-0032 passa a ser **consumidora** dos contratos
  `BP-CH-*.commands.openapi.json`, do catálogo `PEC.*`, dos clientes gerados e, a partir do
  CTG-0002 de R-0031, das fixtures `ch`.
- **Paralelismo.** Corre em paralelo aos CTG-0003…CTG-0006 de R-0031, porque os locks são
  disjuntos: `apps/pec/web` lá, `apps/portal/web` e `backend/domains/portal` aqui.
- **Upstreams por grupo** (sob OD-C2-005, presença no branch publicado basta para trabalhar; o
  merge em `main` só é exigido para o PR final):
  - CTG-0001 (arquitetura, fichas, ODs): R-0031 CTG-0001 no branch.
  - CTG-0002 (vínculo, eventos, projeções, porta do dossiê):
    - R-0031 CTG-0002 (fixtures e integração `ch`; lock `MOD-ch-modules`);
    - R-0023 `authz-unification` (política como dados; `MOD-shared-policy` é serializado com a
      frente que o detiver);
    - OD-R32-001 decidida pelo Owner em 2026-09-26: (C).
  - CTG-0003 (comandos cidadãos): R-0027 `portal-delegations` no branch (em `main` para o PR final). R-0027 é dona de
    `portal-delegation.providers.ts`, da identidade da delegação (OD-R27-001) e de
    `junta_medica` (OD-R27-002).
  - CTG-0004 (telas): R-0022 (SSE de fonte única), R-0024 (kit e
    `docs/framework/arch/frontend-wiring-pattern.md`) e o CTG-0004 de R-0030 (ajuda contextual no
    Portal; empilhe ou espere).
  - CTG-0005 (manifesto, manual, stack):
    - CTG-0001 e CTG-0003 de R-0030 (convenção, gate e manuais);
    - R-0017 `local-stack`;
    - serialização com o CTG-0006 de R-0031 no lock `MOD-local-stack`.

**Janelas previstas:** 4. O maestro recalibra no bootstrap e registra em §Decisões do maestro.
A fase F passa de "R-0031 (6)" para "R-0031 (5) → R-0032 (4), sobrepostas a partir do CTG-0002
de R-0031". O caminho crítico fica em ≈ 6 janelas, como estimado em C-0002 §3. Recalibradas para
≈ 3,5 em §Execução OD-C2-005.

## Execução OD-C2-005 (Owner, 2026-09-27)

> **Adenda A-C2-14 (Owner, 2026-09-30; prevalece).** A rodada **abre já**, empilhada em
> `origin/orchestra/pec-web`, onde R-0031 já publicou os CTG-0001 e CTG-0002 (contratos `BP-CH-*`,
> fixtures e integração `ch`) e parou em checkpoint após a O8. Executa **somente as ondas O1–O2**:
> TASK-0001 (mapa de rotas, contratos e ADR de identidade = opção (C), OD-R32-001); TASK-0002 (fichas
> `IU-PEC-P-*`, `import-manifest.json`, `portal-build-pack.md` §4); TASK-0003 (specs e e2e de
> caracterização `portal-pec-access`); TASK-0008 (specs PEC em `apps/portal/web`).
>
> - **Troca de família (Owner, 2026-09-30):** maestro e workers **Codex** (Sol 6 e escada Codex);
>   reviewer **Opus 5.5** via Claude Code. Substitui o "Maestro previsto" do cabeçalho.
> - Ao concluir a O2: push do branch `orchestra/portal-pec` (sem PR), checkpoint em §Retomada
>   ("aguardando R-0022: outbox e eventos `ch`; R-0024: kit; R-0027: delegação") e parada.
> - **Não tocar:**
>   - `backend/domains/shared/src/policy.ts` e `backend/app/src/portal-delegation.providers.ts`
>     (O4/O6);
>   - eventos `ch` e outbox, que R-0022 migra (O3);
>   - os adaptadores de assinatura de `ch/clinical-reports` e `ch/juntas`;
>   - os locks de R-0020.
> - **ADR de identidade:** confira o próximo número livre em `docs/meta/adr/README.md` imediatamente
>   antes do commit, porque R-0022 também pode criar ADRs. Rode `pnpm verify:state-index`.
> - O manual PEC dos consoles (A-C2-12) continua nas ondas finais desta rodada, não nesta abertura.

> **Adenda A-C2-12 (Architect, 2026-09-27).** Esta rodada recebe de R-0031 (TASK-0018) a parte de
> **manual PEC dos consoles**: `docs/adopters/manuais/{clinico,regulatorio}/` e as seções PEC de
> `gestor`, `auditor-dpo` e `administrador`, pela convenção de R-0030. Ela entra como tarefa de
> transcrição logo após TASK-0013 (manual do cidadão), com os mesmos locks de manual e com o critério
> de cobertura rota × manual de R-0030 estendido às rotas de `pec-web`. O PR final continua
> esperando R-0031, R-0027 e R-0030.

Esta seção aplica `work/campaigns/C-0002-consolidacao.md` §12 e **prevalece sobre qualquer menção a
um PR/merge/evidência/delivery-review por CTG neste plano**. Metas, tarefas, locks e critérios de
aceitação não mudam; muda só o momento dos gates, que rodam no fim da rodada. A exceção são os
`acceptance_commands` de cada tarefa, que continuam sendo a definição de pronto do worker.

**Ondas.** Branch única `orchestra/portal-pec`, até 3 workers na mesma worktree. O maestro serializa
os commits (um por tarefa ou por CTG) e faz push sem PR ao fim de cada onda.

| Onda | Tarefas em paralelo (CTG)                                          | Fronteiras de escrita (disjuntas)                                                                                                                                                     | Depende de                                                                              |
| ---- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| O1   | TASK-0001 (CTG-0001)                                               | `work/rounds/R-0032/{route-manifest.md,contracts/}`, ADR proposta                                                                                                                     | bootstrap e prompt-review único; CTG-0001 de R-0031 no branch                           |
| O2   | TASK-0002 (CTG-0001) ∥ TASK-0003 (CTG-0002) ∥ TASK-0008 (CTG-0004) | fichas `IU-PEC-P-*`, `import-manifest.json`, `portal-build-pack.md` §4 ∥ specs e e2e `portal-pec-access` (caracterização primeiro) ∥ `apps/portal/web/src/app/i18n/portal.pt-BR.json` | TASK-0001                                                                               |
| O3   | TASK-0004 (CTG-0002)                                               | eventos em `ch/{clinical-reports,juntas,scheduling,toxicology,restrictions}`, projetores `portal`, `BP-PORTAL-PROJECTIONS-001` e gerados                                              | TASK-0003; **CTG-0002 de R-0031 no branch** (lock `MOD-ch-modules`)                     |
| O4   | TASK-0005 (CTG-0002)                                               | `CandidateDossierQueryPort`, rotas `v1/portal/exams/{id}/*`, composição no app, `PORTAL_RULES` (`MOD-shared-policy`)                                                                  | TASK-0004; R-0023 no branch                                                             |
| O5   | TASK-0006 (CTG-0003)                                               | e2e `portal-pec-journeys` e specs de `portal-requests`/`ch-juntas`                                                                                                                    | TASK-0001, CTG-0002 concluído; **R-0027 no branch**                                     |
| O6   | TASK-0007 (CTG-0003)                                               | `portal-delegation.providers.ts`, `ch-juntas`, `ch-clinical-reports`, `70-fixtures-portal.sql`, `policy.ts`                                                                           | TASK-0006                                                                               |
| O7   | TASK-0009 (CTG-0004)                                               | specs PEC em `apps/portal/web`                                                                                                                                                        | TASK-0002, TASK-0008, CTG-0003 concluído; R-0022, R-0024 e CTG-0004 de R-0030 no branch |
| O8   | TASK-0010 (CTG-0004)                                               | `app.route-manifest.ts`, `features/exames/`, `apps/portal/web/README.md`                                                                                                              | TASK-0009                                                                               |
| O9   | TASK-0011 (CTG-0005)                                               | `tools/detran-stack.sh` (persona PEC) e runbook                                                                                                                                       | TASK-0010; serializada com a TASK-0017 de R-0031 (`MOD-local-stack`)                    |
| O10  | TASK-0012 (CTG-0005)                                               | `work/rounds/R-0032/reports/TASK-0012.md` (nenhum código)                                                                                                                             | TASK-0011; `pnpm stack:start` verde                                                     |
| O11  | TASK-0013 (CTG-0005)                                               | linhas P de `portal-web.availability.json`, seção PEC de `docs/adopters/manuais/cidadao/`                                                                                             | TASK-0012; CTG-0001 e CTG-0003 de R-0030 no branch                                      |
| O12  | TASK-0014 (CTG-0005)                                               | `portal-build-pack.md`, `pec-build-pack.md` §Superfície C, `waves.md`, `backlog.md`                                                                                                   | TASK-0013                                                                               |

As três frentes paralelas da O2 fecham o paralelismo possível: as demais tarefas formam uma cadeia
(dependência ou lock `MOD-shared-policy`/`MOD-app-e2e-portal-pec`).

**Abertura empilhada.**

- **Base de abertura.** A rodada abre em `origin/orchestra/pec-web` assim que o CTG-0001 de R-0031
  (contratos PEC) existir no branch publicado, isto é, depois do push da O3 de R-0031. Confira com
  `git cat-file -e origin/orchestra/pec-web:docs/framework/arch/pec-error-catalog.md`.
- **Revisões de R-0031.** Entram por `git merge --no-edit origin/orchestra/pec-web`; a da O6 de
  R-0031 traz as fixtures `ch` e antecede a O3 daqui.
- **Outros upstreams**, integrados por merge quando a onda chegar a eles:
  - `origin/orchestra/portal-delegations` (R-0027) antes da O5, ou `origin/main` se R-0027 já
    mesclou;
  - `origin/orchestra/user-docs` (R-0030: CTG-0004 antes da O7, CTG-0001/0003 antes da O11).
- **O que espera o merge dos upstreams:** só o PR final. R-0031, R-0027 e R-0030 precisam estar
  em `main`, e também R-0022, R-0023 e R-0024, com STYNX 1.5.0 **final** (OD-S15-01: nenhum PR com
  pin de RC). Com o upstream mesclado, o CI local é refeito sobre `main`.

**Sequência final** (na ordem de C-0002 §12):

1. `git fetch -q origin` e `git merge --no-edit origin/main`, com todos os upstreams em `main`.
2. **CI local completo:**
   - `pnpm check`;
   - `pnpm blueprints:check` (depois de `pnpm blueprints:generate`), `pnpm contracts:check` e
     `pnpm contracts:test`;
   - `pnpm verify:role-catalog`, `verify:rls-ddl`, `verify:decorators`,
     `verify:senatran-boundary`, `verify:pec-parity`, `verify:pec-superset` e
     `verify:lifecycle-vocabulary`, mais `node tools/domain-boundaries/verify.mjs`;
   - `pnpm --filter` `test:unit`/`test:integration` dos pacotes de §Critérios;
   - `seed.sh` duas vezes, `pnpm backend:test:integration`, `pnpm backend:test:e2e` e
     `pnpm backend:test:ci`;
   - `pnpm verify:parameter-catalogue` e `pnpm parameters:generate` (sem diff);
   - `pnpm --filter @detran/portal-web typecheck|lint|test|build` e o `git grep` de
     `CONDICIONADO|PENDENTE`;
   - `pnpm docs:availability:check`, `pnpm docs:user:check`, `pnpm docs:kb:check`,
     `pnpm docs:kb:publish-check` e `pnpm format:check`;
   - `pnpm stack:start` e `pnpm stack:smoke`;
   - `pnpm devai:rc:prepare`, quando aplicável.
3. **Uma delivery-review** (Sol 6) do diff inteiro (`origin/main...HEAD`), com as colunas das views
   `portal.pec_*`, o esquema dos eventos, os negativos de máscara, terceiro e tenant, e a persona
   e o CPF sintético. `REVIEW` admite correções restritas aos itens apontados, em no máximo 2
   ciclos; `FAIL` → `escalated`.
4. **Um PR** contra `main`, com o corpo pelo template, a tabela CTG → tarefas → commits e o
   resultado dos gates. O PR registra OD-R32-001 = (C) e pede decisão sobre OD-R32-002…005.
5. **CI remoto.** Falha de código volta à tarefa responsável. Merge só com CI verde e `PASS`.
6. **Publicação final:**
   - `evidence-R-0032.json` com os 5 CTGs, `devai evidence record` e `evidence verify`;
   - `devai audit observe` no SHA do merge;
   - `closure.json` (Lighthouse B1 como não cumprido), `devai round close` e `devai round seal`;
   - `waves.md`, `work/rounds/README.md` e backlog.

**Janelas recalibradas:** 4 → ≈ 3,5.

- 1ª janela: bootstrap, prompt-review de TASK-0001…0014 e O1–O2.
- 2ª janela: O3–O6.
- 3ª janela: O7–O10.
- Meia janela: O11–O12 e a sequência final.

A fase F passa a ≈ 5 janelas no caminho crítico, já que R-0032 corre sobreposta a R-0031 desde a
O3 dela. O PR final espera R-0031, R-0027 e R-0030; essa espera não está contada.

## Decisões do Owner (2026-09-26)

- **OD-R32-001 = (C), híbrida.**
  - O vínculo verificado é um `portal.entitlement` do titular, criado pelo projetor a partir do
    evento `ch` que traz o hash do CPF.
  - As projeções do Portal levam só metadados, nunca conteúdo clínico.
  - O dossiê é lido sob demanda pela porta do dono (`CandidateDossierQueryPort`), sem máscara para o
    titular (RN-PEC-153) e com auditoria nos dois lados.
  - Não se cria papel novo, e `CANDIDATO` não entra na sessão do cidadão.
  - Uma ADR nova registra o desenho; o número é conferido no bootstrap.
- **Identidade dos comandos cidadãos:** o padrão da OD-R27-001 = (a) está confirmado pelo Owner.
  Os comandos seguem pela delegação do Portal com o ator técnico `portal-delegation`, chaves
  `…-portal`, o cidadão como `onBehalfOf` e o candidato como requerente (DT-103).
- **Junta médica (OD-R27-002 = (b)):** `junta_medica` entra **nesta rodada**, de forma definitiva,
  no catálogo de serviços PEC do Portal. A rodada entrega o contrato de ingresso (a partir do
  contrato de R-0031), o vínculo, o marco de ciência e o prazo de 30 dias calculado no servidor. A
  tela P-04 reutiliza `exames/:examId/junta/nova`.
- O CTG-0002 não depende mais da decisão sobre a identidade.

## Estado de partida (verificado em 2026-09-26 sobre `a92ef731`)

- **Portal — telas.** O módulo `exames` já existe. Ele tem as rotas `exames` (T-20
  `IU-PORTAL-T20`, "Meu resultado de exame de aptidão", `consulta_exame`, nível `simples`) e
  `exames/:examId/junta/nova` (`junta_medica`, `avancada`, vínculo `exam`). A página da junta já
  delega a janela ao servidor (`422 BOARD_REQUEST_WINDOW_CLOSED { dueOn }`, `DeadlineCard`), e o
  i18n tem `portal.screens.t20.result.{apto,apto_com_restricoes,inapto_temporario,inapto}`.
  **P-04 é essa tela, reutilizada; P-02 estende T-20.**
- **Portal — manifesto de rotas.** `app.route-manifest.ts` tipa `sheet` como
  `IU-PORTAL-T${string}` e `PortalModule` já inclui `exames`.
- **Portal — backend.**
  - `GET /v1/portal/exams[/{id}]` lê `portal.exam_view` (`legal_label`, `valid_until`,
    `board_due_on`), com `PortalCitizenGuard` → `assertActLevel('consulta_exame')` →
    `assertEntitled(subject,'exam',id)` e `@Audit`.
  - O projetor `ExamViewProjector` é **esqueleto** (`consumedEvents = ['ch.exam.*']`, OD-P19): só
    toca linhas existentes, e nenhum produtor `ch.exam.*` existe.
  - O `ch` só publica `ch.renach.exam-result` e `ch.renach.junta-decision` na outbox.
  - `portal.entitlement` (`target_kind`, `relation`, `origin`, vigência) e
    `portal.act_level_policy` (ato → nível, como dado) existem (ADR-0019 §1, ADR-0024 §3–§5).
  - O hash do sujeito é `cpfHashOf` = sha256 sem chave, com o risco OD-P23.
- **Identidade.**
  - A sessão gov.br tem o papel `CIDADAO`, o único papel do Portal (ADR-0024 §3). A guarda falha
    fechada e `*` não a contorna.
  - `policy.ts` concede `ch:candidate-dossier:read` e `feedback-request` **só a `CANDIDATO`**, e
    `portal:exam:read` só a `CIDADAO`.
  - `CandidateDossierService.getOwn` casa o titular por `ch.patient.user_id = actorId` (id do
    principal). `ch.patient.national_id` guarda o CPF de 11 dígitos, único por tenant.
  - Os comandos de junta (`ch:junta:create`, `appeal`) são de `AUDITOR`, `GESTOR` e
    `GESTOR_DETRAN`: é o operador que protocola em nome do candidato (UC-PEC-004). O
    `submitted_by`/`filed_by` gravado é o operador, e DT-103 é débito conhecido.
- **Prazos.**
  - `JuntaLifecycleService` calcula os 30 dias corridos a partir de `resultKnownAt`, que chega
    pela entrada.
  - `designationDeadlineAt` (15 dias úteis) e `forwardingDeadlineAt` (20 dias úteis) também
    **chegam pela entrada**.
  - O `ch` não usa `@detran/inf-deadlines`, que tem calendário e contagem em dias úteis.
  - Nenhum marco de **ciência do resultado** é registrado (RN-PEC-112, verificação 2).
- **Toxicológico.**
  - `v1/ch/toxicology/{results,suspensions}` são somente leitura (CRUD).
  - O callback autenticado chega por `v1/ch/transmissions/callbacks/toxicology` (DT-024).
  - Não há evento consumível pelo Portal.
- **Direitos do titular.**
  - `privacidade/meus-dados` (`lgpd_declaracao`) está fechada por OD-P17: o endpoint
    `@stynx-nyx/privacy` não está montado.
  - A eliminação do prontuário está desabilitada (PEC-RETENTION-001; DT-023 respondido: a
    plataforma é a guardiã).
- **Autoridade externa.** DT-021 (P2), DT-022 ("apto com restrições") e DT-023 (plataforma
  guardiã) estão **respondidos em 2026-08-28** (`open-issues.md`, `decisions/pec.md`), com
  resíduos abertos:
  - aceitação da taxonomia pelo RENACH;
  - tabela prazo × rótulo da Portaria DETRAN-AM 005/2021;
  - códigos do Anexo XV;
  - UC-PEC-013 ainda `draft`.

  A ADR-0034 §5 manda P-01 (forma final) e P-07 nascerem bloqueados; o alcance do bloqueio é a
  OD-PW-002 de R-0031, que esta rodada consome.

- **Gates existentes:**
  - `pnpm --filter @detran/portal-web lint|test|build` no `pnpm check`;
  - `axe` por rota em TestBed (`src/app/a11y/axe.spec-helper.ts`);
  - `node tools/domain-boundaries/verify.mjs`;
  - `backend/app/tests/e2e/portal-journeys.e2e.spec.ts`.

  **Lighthouse CI não existe**: está no backlog como PORTAL B1, e R-0014 o registrou como pendente
  sem substituí-lo.

## Decisão de identidade — opções e recomendação (OD-R32-001, decidida pelo Owner em 2026-09-26: (C))

**Problema.** Os endpoints do candidato exigem `CANDIDATO` e casam o titular pelo id do principal,
mas o Portal autentica `CIDADAO` por CPF. É preciso ligar o CPF verificado pelo gov.br ao
`ch.patient`/`encounter` **sem** inverter a máscara (RN-PEC-153), **sem** replicar dado de saúde
além do necessário (RN-PEC-150/151, LGPD art. 6º, III) e **sem** papel novo (ADR-0034,
Consequências).

| Opção                                         | Como funciona                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Consequências                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **(A) Papel derivado na sessão**              | Enriquecimento de claims (grupo Cognito ou verificador) acrescenta `CANDIDATO` à sessão gov.br quando o CPF casa `ch.patient.national_id`; o Portal web chama `v1/ch/*` diretamente                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Contraria ADR-0024 §3 (`CIDADAO` é o único papel do Portal) e ADR-0019 §2/§5 (o Portal orquestra; nenhuma API interna exposta ao cidadão). O `ch` passa a responder ao cidadão com tokens internos (`encounter.status`) e o nível gov.br por ato (`act_level_policy`) fica fora da rota. O `user_id` do paciente precisa ser reescrito para o `sub` gov.br. **Rejeitada.**                                                                                                                    |
| **(B) Projeções completas**                   | O `ch` publica eventos com o conteúdo clínico e o Portal mantém cópias (`portal.pec_dossier_view` com laudos e adendos); comandos pela delegação                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Segue ADR-0020 §1 literalmente, mas **duplica dado sensível de saúde** em outro schema, com outra trilha e outra retenção (RN-PEC-150 delta 4: guarda de 20 anos só na plataforma, DT-023). Amplia a superfície de vazamento e a obrigação de eliminação coordenada. **Rejeitada para o dossiê**; aceita para metadados.                                                                                                                                                                      |
| **(C) Híbrido — recomendada**                 | (1) **Vínculo verificado** como `portal.entitlement` (`target_kind='exam'`, `relation='holder'`, `origin='pec-event'`), criado pelo projetor quando o evento `ch` traz `subjectCpfHash` = sha256 do `national_id`, que é validado biometricamente no check-in (RN-PEC-130); (2) **projeções mínimas** sem conteúdo clínico (rótulo legal, validade, prazos, estado da revisão, agendamento, toxicológico); (3) **dossiê sob demanda** por porta de consulta do dono (`CandidateDossierQueryPort`, `@detran/ch-clinical-reports`, composta no app como `PORTAL_DELEGATION_TARGETS`), chamada só depois de guarda + nível + vínculo, sem cópia; (4) **comandos por delegação** do ciclo único de pedidos (ADR-0019 §2) sob a identidade decidida em OD-R27-001 | Mantém `CIDADAO` como papel único e **nenhum papel novo**; `CANDIDATO` fica intocado. O dado clínico permanece só no `ch` (minimização) e o titular vê o dossiê **sem máscara**, auditado dos dois lados (`PORTAL_PEC_DOSSIER_READ` e `CH_CANDIDATE_DOSSIER_READ` com `onBehalfOf`). O nível por ato continua dado (OD-R32-002) e a RLS é por tenant nas duas pontas. O desvio de ADR-0020 §1 (leitura sob demanda em vez de projeção) exige **ADR nova**, restrita a dado sensível de saúde. |
| **(D) Delegação HTTP com credencial técnica** | Como (C), mas o backend do Portal chama `v1/ch/candidate-dossier` por HTTP com credencial de serviço                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Mesmo efeito de (C) com mais superfície: segredo de serviço, rede e principal técnico lendo dado sensível em nome do cidadão. Não há ganho num monólito modular (ADR-0005). **Rejeitada.**                                                                                                                                                                                                                                                                                                    |

**Recomendação do Architect: (C).** O plano é executável com ela: o CTG-0002 implementa (C) e o
CTG-0001 propõe a ADR. O Owner pode escolher outra opção; nesse caso, as tarefas 0003…0005 são
reescritas por adenda antes do despacho.

**Consequências fixadas pela recomendação:**

- **LGPD.**
  - Base legal art. 11, II, "a" (RN-PEC-151). O titular vê o próprio dossiê **não mascarado**
    (RN-PEC-153 item 1); a máscara continua valendo para `SUPORTE` e `AUDITOR` (RN-PEC-150,
    verificação 3), e a inversão é teste negativo obrigatório.
  - Todo acesso é evento auditável: quem, quando e com que nível (RN-PEC-153, verificação 1).
  - O conteúdo exposto segue OD-R32-005: resultado, dados e documentos assinados, nunca o
    instrumento psicológico.
- **Nível gov.br por ato.** As linhas de `portal.act_level_policy` são dado (OD-R32-002). Nenhum
  nível é codificado.
- **RLS e tenant.** O vínculo é intra-tenant: `ch.patient` é único por
  (`tenant_id`, `national_id`) e `portal.entitlement` também é por tenant. As novas views
  `portal.pec_*` recebem `auth.create_rls_policy`. Os negativos cobrem:
  - outro tenant;
  - outro CPF, que responde 404 disfarçando a inexistência (route contract §1.2);
  - vínculo vencido;
  - principal sem `CIDADAO`;
  - `technical-admin` com `*`.
- **Risco herdado.** OD-P23 (hash de CPF sem chave) passa a valer também para o payload `ch`. A
  mitigação fica em OD-P23, fora desta rodada: o contrato fixa o **mesmo** algoritmo, sem
  divergir.

## Mapa tela → rota → backend (P-01…P-07)

| Tela               | Rota Portal (módulo `exames`)                            | Serviço / ato (`act_level_policy`)                      | Leitura                                                                                                                                                       | Comando (delegação → dono `ch`)                                                                                                                                                                    | Estado previsto (selo)                                                                                                              |
| ------------------ | -------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| P-01               | `exames/agendamento`                                     | `consulta_exame` (vigente, `simples`)                   | `portal.pec_appointment_view` ← evento `ch.appointment.*` (data, janela, região, "local definido pelo DETRAN por sorteio"; nunca seletor)                     | solicitar ou reagendar por região e janela (UC-PEC-013, P2): **não nesta rodada**                                                                                                                  | leitura `disponivel`; ação `bloqueado_por_decisao` (DT-021 forma final; UC-PEC-013 `draft`; OD-PW-002) → selo `parcial`             |
| P-02               | `exames` (T-20, existente) e `exames/:examId` (dossiê)   | `consulta_exame`; `pec_dossie` (OD-R32-002)             | `portal.exam_view` real (rótulo legal por trilha); dossiê por `CandidateDossierQueryPort` (`GET /v1/portal/exams/{id}/dossier`)                               | `pec_ciencia_resultado` → `ch:candidate-dossier:acknowledge` (**novo**, OD-R32-003); `entrevista_devolutiva` → `POST v1/ch/candidate-dossier/{encounterId}/feedback-requests` (existe; OD-R32-004) | `disponivel`                                                                                                                        |
| P-03               | `exames/:examId/restricoes`                              | `consulta_exame`                                        | códigos aplicados pela porta do dossiê (`ch.encounter_restriction`) e `v1/ch/restrictions/codes`                                                              | —                                                                                                                                                                                                  | `parcial`: explicação por código do Anexo XV `bloqueado_por_decisao` (DT-022 resíduo; `source_pending`)                             |
| P-04               | `exames/:examId/junta/nova` (**existente, reutilizada**) | `junta_medica` (vigente, `avancada`)                    | `boardDueOn` da projeção (prazo do servidor)                                                                                                                  | `POST v1/ch/juntas/cases` pelo alvo de R-0027 ou, se OD-R27-002 o deixou fechado, pelo alvo entregue aqui (contrato de R-0031)                                                                     | `disponivel`                                                                                                                        |
| P-05               | `exames/:examId/revisao` e `exames/:examId/recurso/novo` | `consulta_exame`; `recurso_junta_especial` (OD-R32-004) | `portal.pec_review_view` ← eventos `ch.junta.*` (caso, designação, decisão, recurso, remessa; prazos do dono)                                                 | `POST v1/ch/juntas/cases/{id}/appeals` (existe), com `forwardingDeadlineAt` calculado **no servidor** (20 dias úteis, calendário de `@detran/inf-deadlines`)                                       | `disponivel`; designação e decisão da Junta Especial exibidas como "sem prazo definido em norma" (RN-PEC-112 (a))                   |
| P-06               | `exames/toxicologico`                                    | `consulta_exame`                                        | `portal.pec_tox_view` ← eventos `ch.tox.*` (último resultado recebido, coleta, validade de 90 dias, suspensão de 3 meses e liberação); o alerta é da SENATRAN | —                                                                                                                                                                                                  | `disponivel`                                                                                                                        |
| P-07               | `exames/meus-direitos`                                   | `consulta_exame`                                        | texto de direitos (RN-PEC-153 1–6) com links para P-02 (acesso), `exames/:examId/devolutiva/nova` e `privacidade/meus-dados`                                  | correção cadastral e exportação por `lgpd_declaracao` (OD-P17); eliminação e devolução **nunca** (PEC-RETENTION-001)                                                                               | sob o padrão de OD-PW-002: `bloqueado_por_decisao` (DT-023, PEC-RETENTION-001) com texto e links; se o Owner decidir (b): `parcial` |
| (auxiliar de P-02) | `exames/:examId/devolutiva/nova`                         | `entrevista_devolutiva` (OD-R32-004)                    | —                                                                                                                                                             | ver P-02                                                                                                                                                                                           | `disponivel`                                                                                                                        |

**Regras do mapa:**

- **Prazos.** Todo prazo exibido vem do servidor, como "até quando você pode agir" (§D.6). O
  cálculo é do dono: `ch`, com o calendário de `@detran/inf-deadlines` para os prazos em dias
  úteis. **Nunca** do cliente.
- **Tempo real.** O andamento chega pelo stream do Portal (`portal:stream:read`, SSE de fonte única
  de R-0022) a partir das projeções. **Não se cria stream `ch` para o cidadão.**
- **Leitura.** Nenhuma tela chama `v1/ch/*` diretamente: o frontend só consome `v1/portal/*`.

## Metas

1. **Arquitetura.**
   - ADR proposta para (C), com número livre conferido em `docs/meta/adr/README.md` no bootstrap.
   - `route-manifest.md` com o mapa acima.
   - `contracts/CTG-0002.md` (eventos, projeções, vínculo, porta, política, RLS),
     `contracts/CTG-0003.md` (comandos, ciência, prazos no servidor) e `contracts/CTG-0004.md`
     (telas).
   - OD-R32-001…005 no registro canônico (`docs/framework/arch/portal-build-pack.md` §4), com
     remissão em `pec-build-pack.md` §Questões abertas, que R-0031 cria.
   - 7 fichas `IU-PEC-P-01`…`IU-PEC-P-07` (`apps: [portal]`).
2. **Vínculo e leituras (opção C).**
   - Produtores de eventos cidadãos no `ch`, com payload mínimo e `subjectCpfHash`.
   - `ExamViewProjector` real e as projeções `portal.pec_{appointment,review,tox}_view`
     (`BP-PORTAL-PROJECTIONS-001` + DDL gerado).
   - `portal.entitlement` `holder` criado pelo evento.
   - `CandidateDossierQueryPort` e as rotas `GET /v1/portal/exams/{id}/{dossier,restrictions}`.
   - Chaves `portal:*` só para `CIDADAO`.
   - RLS e auditoria nas duas pontas.
3. **Comandos cidadãos.**
   - Alvos de delegação `junta_medica` (se ainda fechado), `entrevista_devolutiva`,
     `recurso_junta_especial` e `pec_ciencia_resultado`.
   - Linhas de catálogo e de `act_level_policy` como dado, na semente Portal, conforme
     OD-R32-002/004.
   - Requerente = candidato nos registros `ch` (DT-103).
   - Ciência registrada pelo dono (OD-R32-003).
   - Prazos de 30 dias corridos e de 20 dias úteis calculados no servidor.
4. **Telas.**
   - P-01…P-07 no módulo `exames` do Portal, pelo padrão de R-0024 sem variantes: cliente gerado,
     If-Match/Idempotency-Key, mapeamento de erros, estados, SSE canônico e guardas por política.
   - Vocabulário legal por trilha (médica: apto · apto com restrições · inapto temporário ·
     inapto; psicológica: apto · inapto temporário · inapto, e "apto com validade diminuída" como
     atributo).
   - Nenhum `CONDICIONADO`/`PENDENTE` visível.
   - Nenhum seletor de clínica ou perito.
   - Prazo como direito, com diferença explícita entre prazo preclusivo da junta e direito de
     correção LGPD (RN-PEC-153, verificação 5).
   - Nível de assinatura visível nos laudos (RN-PEC-142).
   - WCAG 2.1 AA + eMAG.
5. **Entrega.**
   - Linhas P em `docs/framework/arch/availability/portal-web.availability.json`, com o marcador de
     indisponibilidade PEC em `portal-web` definido em `contracts/CTG-0004.md`.
   - Seção "Exames de aptidão (PEC)" no manual `cidadao` (convenção de R-0030).
   - Persona PEC do cidadão e rotas PEC no smoke da stack local (R-0017).
   - `portal-build-pack.md`, `waves.md`, `backlog.md`.

## Tarefas

| Tarefa    | Papel                | Perfil              | Modelo/esforço   | Lock                                                                                                                                           | Depende de                               | Entrega                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| --------- | -------------------- | ------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TASK-0001 | Architect            | architect-blueprint | Opus 5.5 / alto  | `MOD-r32-contracts`, `MOD-adr-new`                                                                                                             | —                                        | `route-manifest.md` (mapa tela → rota → serviço/ato → projeção/porta → operação `ch` com `operationId` do contrato de R-0031 → chave de política → UC/RN/WF → selo); ADR proposta (opção C, restrita a dado sensível de saúde; referencia ADR-0019/0020/0024/0034); `contracts/CTG-0002.md` (esquema dos eventos `ch.exam/appointment/junta/tox/feedback.*` com `version`, `subjectCpfHash`, sem conteúdo clínico; colunas das views; regra do vínculo; assinatura da porta; chaves `portal:*`; negativos de RLS); `contracts/CTG-0003.md` (alvos, payloads, marco de ciência, cálculo dos prazos no dono, requerente, idempotência); `contracts/CTG-0004.md` (rotas, guardas, estados, marcador de indisponibilidade PEC, critérios D1–D6 do lado do cidadão, a11y); `contracts/CTG-0001.md` |
| TASK-0002 | Architect (transcr.) | transcriber-docs    | Sonnet 5 / baixo | `MOD-product-pec-screens-p`, `MOD-kb-manifest`, `MOD-portal-build-pack-od`                                                                     | TASK-0001                                | 7 fichas `docs/framework/product/domains/ch/pec/screens/IU-PEC-P-0{1…7}.md` (`status: draft`, `apps: [portal]`, fontes herdadas de [IU-PEC-001] §C/§D/§E); baseline de `import-manifest.json` + 7 no mesmo lote; OD-R32-001…005 em `portal-build-pack.md` §4 (texto de TASK-0001)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| TASK-0003 | Inspector            | inspector-tests     | Opus 5.5 / médio | `MOD-portal-projections-tests`, `MOD-portal-identity-tests`, `MOD-app-e2e-portal-pec`, `MOD-ch-clinical-reports-tests`                         | TASK-0001                                | **Caracterização primeiro:** matriz papel × rota `portal:*`/`ch:candidate-dossier:*` e respostas atuais de `GET /v1/portal/exams[/{id}]`, gravadas antes da troca. Depois: replay e idempotência dos projetores novos; vínculo `holder` só com `subjectCpfHash` igual (outro CPF → nenhum vínculo); porta do dossiê (titular sem máscara × `SUPORTE` mascarado; terceiro → 404; outro tenant → 404; nível insuficiente → 403 `PORTAL.ASSURANCE_INSUFFICIENT`; `*` barrado pela guarda); auditoria nas duas pontas; nenhum `CONDICIONADO`/`PENDENTE` em payload `v1/portal/*`, em `backend/app/tests/e2e/portal-pec-access.e2e.spec.ts` e specs de pacote                                                                                                                                      |
| TASK-0004 | Engineer             | engineer-backend    | Opus 5.5 / médio | `MOD-ch-events-citizen` (`ch/{clinical-reports,juntas,scheduling,toxicology,restrictions}`), `MOD-blueprints-portal`, `MOD-portal-projections` | TASK-0003                                | emissão dos eventos cidadãos na mesma transação dos fatos `ch` (outbox); `ExamViewProjector` real e projetores `pec_*` em `*.projection.ts` com `consumedEvents`; `BP-PORTAL-PROJECTIONS-001` + `pnpm blueprints:generate` (DDL, entidades, nada à mão); vínculo `holder` pelo projetor                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| TASK-0005 | Engineer             | engineer-backend    | Opus 5.5 / médio | `MOD-ch-clinical-reports-port`, `MOD-portal-projections-routes`, `MOD-app-composition`, `MOD-shared-policy`                                    | TASK-0004                                | `CandidateDossierQueryPort` (por `tenant`, `encounterId`, `subjectCpfHash`; mesmo SQL de `getOwn` sem depender de `user_id`); composição no app; rotas `GET /v1/portal/exams/{id}/dossier` e `/restrictions`; chaves `portal:*` em `PORTAL_RULES` (serializado); `pnpm contracts:openapi` + `pnpm contracts:clients`; testes de TASK-0003 verdes                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| TASK-0006 | Inspector            | inspector-tests     | Opus 5.5 / médio | `MOD-portal-requests-tests`, `MOD-app-e2e-portal-pec`, `MOD-ch-juntas-tests`                                                                   | TASK-0001, CTG-0002 concluído            | e2e de jornada contra mocks em `backend/app/tests/e2e/portal-pec-journeys.e2e.spec.ts` (ciência → pedido → delegação → comando `ch` → evento → projeção → SSE do Portal) para `pec_ciencia_resultado`, `junta_medica`, `entrevista_devolutiva` e `recurso_junta_especial`; negativos: fora da janela (422 decidido pelo servidor, `dueOn` do dono), sem vínculo (404), nível insuficiente (403), idempotência repetida, recurso sem decisão `UPHELD`; requerente = candidato; prazo de 20 dias úteis igual ao do calendário de `@detran/inf-deadlines`                                                                                                                                                                                                                                        |
| TASK-0007 | Engineer             | engineer-backend    | Opus 5.5 / médio | `MOD-app-portal-delegation`, `MOD-ch-juntas`, `MOD-ch-clinical-reports`, `MOD-seed-portal`, `MOD-shared-policy`                                | TASK-0006                                | alvos em `portal-delegation.providers.ts` (identidade da delegação conforme OD-R27-001); comando `ch:candidate-dossier:acknowledge` (contrato novo por `pnpm contracts:openapi`); requerente e `onBehalfOf` nos registros de junta e recurso; `forwardingDeadlineAt` calculado no dono quando a origem é o Portal; linhas de catálogo e `act_level_policy` em `backend/database/seed/70-fixtures-portal.sql`; `seed.sh` duas vezes                                                                                                                                                                                                                                                                                                                                                            |
| TASK-0008 | Architect (transcr.) | transcriber-docs    | Sonnet 5 / baixo | `MOD-portal-i18n`                                                                                                                              | TASK-0001                                | chaves em `apps/portal/web/src/app/i18n/portal.pt-BR.json` só sob namespaces já admitidos (`portal.screens.pec_p0n.*`, `portal.services.*`, `portal.errors.*`, `portal.forms.*`, `portal.legal.*`): títulos, estados, vocabulário legal por trilha, textos de bloqueio com o id da DT/OD, prazo como direito, diferença junta × correção LGPD; **nenhum namespace novo** (OD-PW-004 não afeta o Portal)                                                                                                                                                                                                                                                                                                                                                                                       |
| TASK-0009 | Inspector            | inspector-tests     | Opus 5.5 / médio | `MOD-portal-web-tests-pec`                                                                                                                     | TASK-0002, TASK-0008, CTG-0003 concluído | specs: tela ↔ ficha ↔ rota ↔ i18n (7/7 + auxiliar); guardas `CIDADAO` presença **e** ausência, nível e vínculo por rota; D1 (nenhum `CONDICIONADO`/`PENDENTE` no DOM; trilhas não misturadas); D2 (dossiê do titular sem máscara); D3 (nenhum controle de escolha de clínica ou perito em P-01/P-04); D4 (nível de assinatura visível); D6 (prazo do servidor, nunca calculado; 422 com `dueOn` vira banner); estados bloqueados citando o id; axe sem `serious`/`critical` por rota e estado                                                                                                                                                                                                                                                                                                 |
| TASK-0010 | Engineer             | engineer-frontend   | Opus 5.5 / médio | `MOD-portal-web-pec`                                                                                                                           | TASK-0009                                | rotas no `app.route-manifest.ts` (tipo de `sheet` aceita `IU-PEC-P${string}`); páginas e fachadas no módulo `exames` pelo padrão de R-0024; reutilização de T-20, `junta-medica.page`, `DeadlineCard`, `ServiceWizard`; P-01/P-07 no estado decidido; testes verdes; `apps/portal/web/README.md` (seção PEC)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| TASK-0011 | Engineer             | engineer-backend    | Sonnet 5 / baixo | `MOD-local-stack`                                                                                                                              | TASK-0010                                | persona PEC do cidadão na stack (`DETRAN_LOCAL_CPF` igual ao CPF sintético da fixture `ch` de R-0031; `DETRAN_LOCAL_ASSURANCE_LEVEL=avancada`); rotas `v1/portal/exams*` no smoke de R-0017; runbook; serializado com R-0031 CTG-0006                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| TASK-0012 | Inspector            | inspector-tests     | Sonnet 5 / médio | `MOD-r32-stack-smoke`                                                                                                                          | TASK-0011                                | smoke das jornadas P-02, P-04, P-05 e P-06 na stack local (requisição, resposta, evento, tela); checklist WCAG 2.1 AA + eMAG por tela em `reports/TASK-0012.md` (teclado, foco, contraste, leitor de tela, linguagem simples); nenhum código                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| TASK-0013 | Architect (transcr.) | transcriber-docs    | Sonnet 5 / médio | `MOD-availability-portal`, `MOD-user-docs-cidadao`                                                                                             | TASK-0012                                | linhas P-01…P-07 e auxiliar em `portal-web.availability.json` (esquema de R-0030; `history` com R-0032; `decision` de cada selo não disponível); seção PEC em `docs/adopters/manuais/cidadao/` (convenção de R-0030, com o comportamento real, bloqueios citados e prazos como direitos)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| TASK-0014 | Architect (transcr.) | transcriber-docs    | Sonnet 5 / baixo | `MOD-docs`                                                                                                                                     | TASK-0013                                | `portal-build-pack.md` (WP executado, gates reais, OD-P19 atualizada), `pec-build-pack.md` §Superfície C (remissão), `waves.md` §Histórico, `backlog.md` (B1 Lighthouse permanece aberto), estado das OD-R32                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |

**CTGs (commits por CTG na branch única; um PR no fim — OD-C2-005):**

| CTG      | Tarefas                   | Conteúdo                                     |
| -------- | ------------------------- | -------------------------------------------- |
| CTG-0001 | 0001 → 0002               | arquitetura, ADR proposta, fichas, ODs       |
| CTG-0002 | 0003 → 0004 → 0005        | vínculo, eventos, projeções, porta, política |
| CTG-0003 | 0006 → 0007               | comandos cidadãos, ciência, prazos           |
| CTG-0004 | 0008 → 0009 → 0010        | i18n e telas                                 |
| CTG-0005 | 0011 → 0012 → 0013 → 0014 | stack, smoke, manifesto, manual, docs        |

- A TASK-0008 pode correr junto do CTG-0002, porque os locks são disjuntos; entra no commit do
  CTG-0004.
- O CTG-0003 exige o CTG-0002 concluído na branch. O CTG-0004 exige o CTG-0002 e o CTG-0003
  concluídos na branch.
- Nenhuma tarefa de tela é despachada antes de o CTG-0003 estar concluído na branch (contratos
  antes das telas, ADR-0034 §3).

**Checkpoints do maestro (Engineer):**

- **(a) CTG-0002.** Caracterização de TASK-0003 verde antes e depois da troca. `pnpm
blueprints:generate` sem edição manual. `node tools/domain-boundaries/verify.mjs`. `pnpm
backend:test:integration`.
- **(b) CTG-0003.** `seed.sh` duas vezes sobre banco limpo (lição 9), `pnpm backend:test:e2e` e
  `pnpm contracts:check`.
- **(c) CTG-0004.** A tripla `pnpm --filter @detran/portal-web lint|test|build`, antes de liberar o
  Inspector e no fim.
- **(d) CTG-0005.** `pnpm stack:start`, o smoke de R-0017, `pnpm docs:availability:check` e
  `pnpm docs:user:check`.

## Critérios de aceitação (comandos → resultado)

- `pnpm docs:kb:check` → OK com baseline + 7; `pnpm docs:kb:publish-check` e
  `pnpm format:check` → OK.
- `pnpm blueprints:check` → sem diff depois de `pnpm blueprints:generate`.
- `pnpm contracts:check` → verde: nenhuma rota `v1/portal/*` nova e nenhuma operação `ch`
  consumida sem contrato. `pnpm contracts:test` → verde.
- `pnpm verify:role-catalog` → verde, sem papel novo em `roles.ts`.
- `pnpm verify:rls-ddl`, `pnpm verify:decorators`, `pnpm verify:senatran-boundary`,
  `pnpm verify:pec-parity`, `pnpm verify:pec-superset` e `pnpm verify:lifecycle-vocabulary` → verdes.
- `node tools/domain-boundaries/verify.mjs` → OK. Leituras cruzadas só em `*.projection.ts` com
  `consumedEvents`; a porta do dossiê é chamada ao dono, não leitura de tabela.
- `pnpm --filter @detran/portal-projections test:unit`, `… test:integration`,
  `pnpm --filter @detran/portal-identity test:unit`, `pnpm --filter @detran/portal-requests test:unit`,
  `pnpm --filter @detran/ch-clinical-reports test:unit` e `pnpm --filter @detran/ch-juntas test:unit`
  → verdes.
- `pnpm backend:test:integration`, `pnpm backend:test:e2e` (incluindo
  `portal-pec-access.e2e.spec.ts` e `portal-pec-journeys.e2e.spec.ts`) e `pnpm backend:test:ci`
  → verdes.
- `pnpm verify:parameter-catalogue` → `… 0 errors`, sem linha de namespace nova;
  `pnpm parameters:generate` → sem diff.
- `pnpm --filter @detran/portal-web typecheck|lint|test|build` → verdes. As specs de TASK-0009
  fecham tela ↔ ficha ↔ rota ↔ i18n em 7/7 mais a auxiliar, e o axe não aponta
  `serious`/`critical` em nenhuma rota PEC.
- `git grep -nE 'CONDICIONADO|PENDENTE' -- 'apps/portal/web/src/**' ':!**/*.spec.ts'` → sem saída.
- `pnpm docs:availability:check` → OK com `portal-web` sem erro (R1…R8).
  `pnpm docs:user:check` → OK, com 0 divergências de selo no perfil `cidadao`.
- Stack: `pnpm stack:start` com a persona PEC e o smoke de R-0017 passam (o maestro usa o nome
  registrado no runbook).
- `pnpm check` → verde.
- **Critério registrado, não automatizável nesta rodada:** Lighthouse PWA e a11y ≥ 90 no Portal
  (backlog PORTAL B1). Enquanto B1 não entregar ferramenta executável, o `closure.json` o lista
  como **não cumprido**. O axe e o checklist WCAG/eMAG de TASK-0012 **não** o substituem.

## Mapa entregável → definições

| Entregável          | Definição                                                                                                                                                                                                                                                                                                                                                       |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| inventário e regras | [IU-PEC-001] §C, §D e §E; `APP.md` do PEC (§Atores: candidato ≡ paciente; §Vocabulário); UC-PEC-004, 010, 011, 012, 013 e 014; RN-PEC-105, 106, 110, 112, 113, 121, 122, 130, 141, 142, 150, 151 e 153; WF-PEC-001…005; JRN-PEC-001, 002, 004, 005 e 006                                                                                                        |
| decisões            | `docs/meta/decisions/pec.md` (DT-021…025, PEC-RETENTION-001, PEC-TRUST-001); `docs/meta/knowledge-base/open-issues.md` (DT-021…024); `docs/meta/adr/ADR-0034-pec-web-frontend.md`; OD-PW-002 e OD-PW-004 (R-0031, `pec-build-pack.md`); OD-R27-001/002 (`portal-build-pack.md`)                                                                                 |
| identidade          | ADR-0005, ADR-0019, ADR-0020, ADR-0024; `backend/domains/shared/src/{roles,policy}.ts`; `backend/domains/portal/identity/src/handwritten/{citizen.guard,identity.service}.ts`; `backend/domains/ch/clinical-reports/src/candidate-dossier.{controller,service}.ts`; `backend/database/ddl/41-ch-patients.sql`                                                   |
| leituras            | `backend/domains/portal/projections/src/handwritten/{exams.controller,exam-view.projection,projectors.service,projection-contract}.ts`; `docs/framework/blueprints/BP-PORTAL-PROJECTIONS-001.json`; `backend/database/ddl/65-portal-projections.sql`; `tools/domain-boundaries/verify.mjs`                                                                      |
| comandos            | `backend/domains/portal/requests/src/handwritten/delegation/delegation.service.ts`; `backend/app/src/portal-delegation.providers.ts`; `backend/domains/ch/juntas/src/junta-{commands.controller,lifecycle.service}.ts`; contratos `BP-CH-*.commands.openapi.json` (R-0031); `backend/domains/inf/deadlines/src/{calendar,local-date}.ts`                        |
| telas               | `apps/portal/web/src/app/app.route-manifest.ts`; `features/exames/`; `features/privacidade/`; `docs/framework/product/transversal/portal/screens/IU-PORTAL-T20.md`; `docs/framework/arch/{portal-frontends,portal-route-contract,portal-error-catalog}.md`; `docs/framework/arch/frontend-wiring-pattern.md` (R-0024); `docs/framework/arch/detran-ui-guide.md` |
| i18n                | `apps/portal/web/src/app/i18n/portal.pt-BR.json` e `i18n-keys.spec.ts`; `docs/framework/arch/parameter-catalogue.md` §Namespaces i18n                                                                                                                                                                                                                           |
| fixtures            | `docs/framework/arch/pec-fixtures.md` e a semente `ch` (R-0031); `backend/database/seed/70-fixtures-portal.sql`                                                                                                                                                                                                                                                 |
| manual e manifesto  | `docs/framework/arch/user-docs-convention.md` (R-0030); `work/rounds/R-0030/availability-manifest.schema.md` §2, §3, §5 e §6                                                                                                                                                                                                                                    |
| stack               | `tools/detran-stack.sh`, runbook e smoke de R-0017                                                                                                                                                                                                                                                                                                              |

## ODs propostas (registro canônico: `docs/framework/arch/portal-build-pack.md` §4, no commit do CTG-0001)

- **OD-R32-001 — decidida pelo Owner em 2026-09-26: (C).** Vínculo cidadão (CPF gov.br) → candidato PEC. Opções (A)…(D) de §Decisão de
  identidade. **Recomendação: (C)**, com ADR nova. **Bloqueia o CTG-0002.**
- **OD-R32-002 — nível gov.br por ato PEC**, como linhas de `portal.act_level_policy` (valores do
  Owner; nada codificado). Padrão proposto:
  - consultas de resultado, agendamento, toxicológico, restrições e direitos: `simples`, como o
    `consulta_exame` vigente;
  - dossiê completo (`pec_dossie`): `avancada`, porque é dado sensível de saúde (RN-PEC-150) e
    reduz o risco de conta bronze tomada;
  - `junta_medica`: `avancada` (vigente);
  - `recurso_junta_especial`: `avancada`, por analogia a `portal.cetran_appeal_level` (H.49);
  - `entrevista_devolutiva` e `pec_ciencia_resultado`: `simples`.

  `legal_basis` de cada linha nova = `source_pending (OD-R32-002)` até a confirmação.

- **OD-R32-003 — marco de ciência do resultado**, termo inicial do prazo preclusivo de 30 dias
  (RN-PEC-112, verificação 2; art. 12). Padrão proposto: a ciência é a **primeira** entre (i) a
  ciência expressa do titular no Portal, com evidência (`pec_ciencia_resultado`), e (ii) a ciência
  presencial registrada pelo PEC (entrega ou devolutiva). A emissão do laudo ou a mera
  disponibilização **não** iniciam o prazo. Enquanto não houver ciência, a tela diz "o prazo começa
  quando você tomar ciência do resultado". O fato é registrado pelo dono (`ch`), que calcula o prazo.
- **OD-R32-004 — catálogo de serviços PEC no Portal.** Padrão proposto: incluir
  `entrevista_devolutiva` (RN-PEC-153 item 3; C-07), `recurso_junta_especial` (UC-PEC-010) e
  `pec_ciencia_resultado` e, por OD-R27-002 = (b), **`junta_medica`** com o contrato de R-0031.
- **OD-R32-005 — conteúdo do dossiê acessível ao titular** (RN-PEC-153, controvérsia (a)). Padrão
  proposto:
  - resultado por trilha, com validade e prazo de inaptidão;
  - laudos e adendos **assinados**, com nível de assinatura, sha256 e documento;
  - restrições aplicadas;
  - devolutivas.

  **Não** entram anotações técnicas nem protocolos e instrumentos psicológicos (restrição SATEPSI).
  O `SUPORTE` continua mascarado.

As ODs herdadas não são reabertas: OD-PW-002 (alcance do bloqueio; padrão: ADR-0034 §5 integral),
OD-PW-004 (namespace `pec.`; irrelevante para o Portal, que usa `portal.*`), OD-R27-001 (identidade
da delegação), OD-R27-002 (junta no catálogo), OD-P17 (`lgpd_declaracao`) e OD-P23 (hash de CPF).

## Riscos

- **Inverter a máscara** (IU-PEC-001 §D.2): é o erro mais fácil daqui. A mitigação são testes dos
  dois lados na porta (TASK-0003) e na UI (TASK-0009), com revisão explícita do reviewer.
- **Dado sensível fora do `ch`.** As projeções carregam só metadados. O contrato do CTG-0002
  enumera as colunas, e o reviewer rejeita qualquer campo clínico.
- **Prazo calculado no lugar errado.** O cálculo no cliente ou por literal é FAIL. Os dias úteis
  usam o calendário de `@detran/inf-deadlines`; os 30 dias corridos, a regra do dono. Termo inicial
  sem OD-R32-003 decidida → aplica-se o padrão, registrado na adenda.
- **Colisão com R-0027 e R-0030 em `apps/portal/web`, `portal-delegation.providers.ts` e
  `70-fixtures-portal.sql`.** Os CTG-0003/0004 empilham sobre os upstreams de §Concorrência, com
  integração por merge.
- **Colisão com R-0031 em `ch/*` e `tools/detran-stack.sh`.** O CTG-0002 só avança em `ch/*`
  depois de o CTG-0002 de R-0031 existir no branch publicado (empilhar; o PR final espera o merge de
  R-0031), e a TASK-0011 é serializada com o CTG-0006 de R-0031.
- **Fixture com CPF real** (LGPD): o CPF é sintético, com dígito verificador inválido (a guarda do
  Portal e `ch.patient` só exigem 11 dígitos), e compartilhado entre a semente `ch` (R-0031) e a
  persona da stack. O reviewer confirma.
- **Selo otimista**: P-01 e P-07 não viram `disponivel` sem decisão do Owner.

## Lições aplicadas (C-0001 e método §4)

- Relatórios versionados em `work/rounds/R-0032/reports/`. Depois de cada `git add` de grupo,
  comparar `find` com `git ls-files`.
- Critérios imutáveis: mudança só por adenda com decisão do Owner, e critério substituído conta
  como não cumprido. Nada de trocar Lighthouse por axe.
- ODs no registro canônico (`portal-build-pack.md` §4) no mesmo PR que as cita.
- Âncora da prova por CTG; `audit observe` no SHA exato; `round close` e `round seal`.
- `budget.json` obrigatório, com checkpoint a 80%.
- Caracterização antes de toda troca: matriz papel × rota e respostas de `v1/portal/exams`.
- Padrão de ligação de R-0024 sem variantes. Nenhum arquivo gerado editado à mão.
- Nenhuma integração externa real (gov.br, RENACH, PAdES, laboratório): porta, mock ou falha
  fechada. Nenhum valor normativo inventado (`source_pending` ou OD).
- Testes de roteamento com presença e ausência de `CIDADAO`, e `*` barrado pela guarda.
- A transcrição (fichas, i18n, manual, manifesto) é do Architect por `transcriber-docs`, testada
  pelo Inspector ou pelos gates, nunca pelo próprio transcriber.

## Decisões do maestro

- **M1 (2026-09-30, bootstrap).** Por autorização do Owner em `AUTHORIZATION.md`, maestro e workers são Codex: `gpt-6-sol` para o maestro/Architect grande, `gpt-5.6-terra` para nível médio e `gpt-6-luna` para nível pequeno. Architect em transcrição de esforço baixo segue o nível pequeno equivalente, sem tomar decisão nova. Reviewer da outra família: Claude Code Opus 5.5, id `claude-opus-5-5`, somente por `tools/orchestra/bridge.sh claude`. Ids conferidos em `model-ladder.md` e nas opções `-m`/`--model` das CLIs. Aplicam-se os esforços da tabela de tarefas e a escada equivalente. O limite desta sessão é O1–O2; o status inicial de proposta fica superado pela autorização registrada, sem alterar os critérios originais.
- **M2 (A-C2-14, instrução direta do Owner nesta abertura).** Na O2 desta sessão, TASK-0008 entrega specs PEC em `apps/portal/web`. A tabela anterior de §Execução e §Tarefas descreve a TASK-0008 como transcrição de i18n; esse critério anterior permanece aberto e não será declarado cumprido por specs. A mudança de entrega é registrada explicitamente para a revisão única dos prompts; o destino do critério i18n será anotado no checkpoint se o Owner não o decidir nesta sessão. TASK-0009 permanece Inspector de telas na O7, após os upstreams exigidos.
- **M3 (interpretação fail-closed de O1–O2, sem decisão nova de mérito).** As OD-R32-002…005 do §ODs propostas ainda são propostas ao Owner. Até resposta expressa: (002) nenhuma linha nova de nível é ativada; ausência da linha nega o ato conforme ADR-0024, e a base legal fica `source_pending (OD-R32-002)`; (003) sem ciência expressa ou presencial registrada pelo dono, nenhum prazo preclusivo inicia, e disponibilização/emissão não são ciência; (004) serviços novos permanecem indisponíveis/bloqueados por decisão, exceto `junta_medica` já autorizada por OD-R27-002 = (b); (005) o contrato delimita o máximo proposto do dossiê, mas não habilita novo acesso clínico até decisão do conteúdo — nenhum instrumento psicológico, anotação técnica ou cópia em `portal.*`. A O1 documenta e a O2 caracteriza guardas e negativos, sem ativar esses atos.

## Concorrência

- Bootstrap: `origin/main` = `c4d5417c`; `origin/orchestra/pec-web` = `7c0854f3`, com `BP-CH-JUNTAS-001.commands.openapi.json` e `pec-error-catalog.md`. R-0031 está após O8, com CTG-0001/0002 publicado; O1–O2 podem avançar na base empilhada. R-0020 segue em preparação local, com locks `.github/workflows/`, `.devai/config`, `law/register` e `record/` preservados. R-0022 está ativa em `orchestra/stynx-sse-tenancy`, ainda fora de `main`; O3 espera sua migração de outbox/eventos `ch`. R-0027 ainda não está em `main`; O6 espera a delegação. R-0024 libera O7+ depois do kit. PR #160 (A-C2-14) aberto no bootstrap. Revisões de R-0031 entram só por `git merge --no-edit`.
- Após o bootstrap, `origin/main` avançou a `38c79714` pelo merge do PR #160 (A-C2-14). O texto do Owner nesta sessão prevalece nos pontos de família e TASK-0008. A base empilhada R-0031 segue `7c0854f3`; o avanço de `main` será integrado por merge após o commit da O1, sem rebase.
- `MOD-adr-index` (`docs/meta/adr/README.md`, `DESIGN-DECISIONS.md`) é serializado com R-0022. O Architect propõe a ADR na O1; o maestro confere o próximo número livre imediatamente antes do commit e atualiza os dois índices em conjunto. Se R-0022 publicar antes, integra-se somente pela regra de merge autorizada e revalida-se `pnpm verify:state-index`.

## Bloqueios

- **OD-R32-006 (destino do critério i18n de TASK-0008).** A autorização A-C2-14 deslocou a entrega de TASK-0008 para specs em `apps/portal/web` na O2, preservando o critério original de chaves `portal.pt-BR.json` sem dono nesta sessão. O Owner deve decidir, antes da O7, entre tarefa Architect/transcriber nova com `MOD-portal-i18n` ou devolução do critério à TASK-0008 numa janela posterior. **TASK-0009 e TASK-0010 bloqueadas** até essa decisão, pois exigem tela ↔ ficha ↔ rota ↔ i18n 7/7; não se declara o critério original cumprido por specs.

## Triagem

- Bootstrap: `pnpm check` interrompido em `pnpm test:stack` (57/58 PASS): sensor `tools/stack/revision.test.mjs:433` usa `/pec/` sobre o comando Docker inteiro e casa o nome da worktree `portal-pec` no caminho absoluto. É `sensor-error` herdado da R-0031 (TASK-0015 corrige o regex do slot na O11 dela). Este lock permanece com R-0031; O1–O2 seguem com gates específicos e não alteram o teste.
- Preparo reversível do banco isolado `detran_r32_access`: `pnpm backend:db:apply` passou; `SEED_PROFILE=ch bash backend/database/seed.sh` falhou na transação com `rait_priority_consistency(): query returned no rows`, classificado como `plant-bug` de ordem/interação da seed upstream para investigação fora de O1–O2. `SEED_PROFILE=fresh` passou no banco próprio, seguido de `82-fixtures-ch.sql` isolado em transação, também PASS. Os testes de acesso usam apenas esse banco; nenhuma seed canônica foi editada ou gate afrouxado.

## Retomada

## Leitura

- Bootstrap na base `7c0854f314ab6253c80c71cc8de7e2ce4c3b6a7d`: `AGENTS.md`, `CODESTYLE.md`, `docs/meta/agents/{README.md,orchestra/{README.md,model-ladder.md,waves.md}}`, `work/campaigns/C-0002-consolidacao.md` §12/§15, `docs/meta/adr/ADR-0034-pec-web-frontend.md`, `work/rounds/R-0032/{plan.md,prompts/00-maestro.md}`, `work/rounds/R-0027/decision-brief-OD-R27-001-002.md`; leituras específicas das tarefas constam nos prompts.
