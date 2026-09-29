# R-0031 — frente `pec-web` (ação 8 da C-0002, ADR-0034: contratos e fixtures PEC, consoles clínico e regulatório, manual PEC)

**Status:** **proposta — C-0002 rev. 2, aguardando autorização do Owner**. Planejada em 2026-09-26
pelo Architect (`work/campaigns/C-0002-consolidacao.md` §2 fase F, §3.7; decisão do Owner
OD-C2-002 e `docs/meta/adr/ADR-0034-pec-web-frontend.md`, vinculantes). Maestro previsto: **Sol 6**
(Codex CLI), workers pela escada Codex (Sol 6 grande, Terra médio, Luna pequeno — nomes vigentes
confirmados em `model-ladder.md` após R-0018) por subagentes nativos; reviewer **Opus 5.5** pela
ponte `tools/orchestra/bridge.sh claude` (OD-C2-003; ids confirmados no bootstrap). Worktree
`/Volumes/Thiamat II/stech/detran-worktrees/pec-web`, branch `orchestra/pec-web`. Nenhum
`AUTHORIZATION.md`, `tasks/` ou `compositions.json` existe: o maestro os cria no bootstrap.
**OD-PW-001 — decidida pelo Owner em 2026-09-26: plano completo em R-0032.** A superfície C
(P-01…P-07 no Portal, ADR-0034 §2) saiu desta rodada e virou **R-0032 `portal-pec`**
(`work/rounds/R-0032/plan.md`; maestro Opus 5.5, reviewer Sol 6). R-0032 é **consumidora** dos
contratos (CTG-0001) e das fixtures (CTG-0002) desta rodada: ela abre empilhada em
`origin/orchestra/pec-web` após o CTG-0001 daqui existir no branch publicado e avança o seu CTG de
backend após o CTG-0002 daqui existir no branch; o PR final de R-0032 espera o merge desta rodada. Esta rodada não toca
`apps/portal/web`, `backend/domains/portal` nem `portal-web.availability.json`.
**Concorrência:** abre após o merge de R-0024 `stynx-dedup` (kit de app e
`docs/framework/arch/frontend-wiring-pattern.md`) e pode correr **em paralelo a R-0030**
`user-docs` (locks disjuntos). Upstreams por grupo (presença no branch para trabalhar; merge em
`main` só para o PR final, OD-C2-005): CTG-0001/0002 (backend PEC) — R-0023
`authz-unification` (política como dados; qualquer mudança em `MOD-shared-policy` é
serializada com a frente que o detiver); CTG-0004/0005 (app) — R-0022 (assinatura final e SSE de
fonte única) e R-0024; CTG-0006 (stack, manual e manifesto) — CTG-0001 e CTG-0003 de R-0030 no
branch publicado `orchestra/user-docs` (convenção, gate e manuais; empilhar) e R-0017 `local-stack` em `main`; a TASK-0017 (slot `pec`)
é serializada com a TASK-0011 de R-0032 (lock `MOD-local-stack`).
**Janelas previstas:** 5 (eram 6 com a superfície C; a campanha estimou ≈ 4 para R-0030 ∥ R-0031;
esta rodada paga a dívida de contratos, fixtures e integração antes das telas). Fase F: R-0031 (5)
com R-0032 (4) sobreposta a partir do CTG-0002 daqui, ≈ 6 janelas no caminho crítico. O maestro
recalibra no bootstrap e registra em `plan.md` §Decisões do maestro. Recalibradas para ≈ 4 em
§Execução OD-C2-005.

## Execução OD-C2-005 (Owner, 2026-09-27)

> **Adenda A-C2-13 (Owner, 2026-09-29; prevalece sobre a "Base de abertura").** A rodada **abre
> já** sobre `origin/main`, sem esperar R-0024, e executa **somente as ondas O1–O8**: contratos e
> caracterização PEC, catálogo de erros, fixtures, integração Postgres dos 17 módulos `ch`, fichas,
> i18n e parâmetros. Ao concluir a O8, o maestro faz push do branch (sem PR), grava checkpoint em
> §Retomada ("aguardando R-0024: kit e padrão de ligação") e para. A O9 (app `apps/pec/web`)
> retoma empilhada em `origin/orchestra/stynx-dedup` ou sobre `main` com R-0024 mesclada.
>
> - **Evitar conflito com R-0022:** a O3 (erros em `ch/*/src`) não toca os adaptadores de assinatura
>   de `ch/clinical-reports` e `ch/juntas`, que R-0022 migra. Se algum erro exigir mudança nesses
>   arquivos, ele fica registrado para depois da migração.
> - **R-0032:** abre empilhada em `origin/orchestra/pec-web` quando o CTG-0001 (O1–O3) for publicado.

> **Adenda A-C2-12 (Architect, 2026-09-27; prevalece sobre as ondas abaixo).** Para que R-0031 não
> fique presa ao merge de R-0030, a parte de **manual** de TASK-0018 sai desta rodada e vai para
> R-0032: `docs/adopters/manuais/{clinico,regulatorio}/` e as seções PEC de `gestor`, `auditor-dpo` e
> `administrador`. Nesta rodada, TASK-0018 entrega só `docs/framework/arch/availability/pec-web.availability.json`,
> escrito conforme `work/rounds/R-0030/availability-manifest.schema.md`. A validação por gate
> acontece quando o gate de R-0030 existir em `main`. A O13 deixa de exigir os CTGs de R-0030 no
> branch, e o PR final de R-0031 espera só **R-0022, R-0023 e R-0024** em `main` com a STYNX 1.5.0
> final. Nenhum critério de aceitação desta rodada exige o manual: o critério de manual passa a ser
> cobrado em R-0032.

Esta seção aplica `work/campaigns/C-0002-consolidacao.md` §12 e **prevalece sobre qualquer menção a
um PR/merge/evidência/delivery-review por CTG neste plano**. Metas, tarefas, locks e critérios de
aceitação não mudam; muda só o momento dos gates, que rodam no fim da rodada. A exceção são os
`acceptance_commands` de cada tarefa, que continuam sendo a definição de pronto do worker.

**Ondas.** Branch única `orchestra/pec-web`, até 3 workers na mesma worktree. O maestro serializa os
commits (um por tarefa ou por CTG) e faz push sem PR ao fim de cada onda.

| Onda | Tarefas em paralelo (CTG)                               | Fronteiras de escrita (disjuntas)                                                                                                                                                 | Depende de                                                                             |
| ---- | ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| O1   | TASK-0001 (CTG-0001)                                    | `route-manifest.md`, `BP-CH-*.commands.openapi.json`, `pec-error-catalog.md`, `pec-build-pack.md`, `contracts/CTG-0001.md`                                                        | bootstrap e prompt-review único                                                        |
| O2   | TASK-0002 (CTG-0001)                                    | `backend/app/tests/e2e/pec-commands-characterization.e2e.spec.ts`, `tools/contracts/tests/`                                                                                       | TASK-0001                                                                              |
| O3   | TASK-0003 (CTG-0001)                                    | `tools/contracts/check-commands.mjs`, erros em `backend/domains/ch/*/src`, gerados por `pnpm contracts:*`                                                                         | TASK-0002                                                                              |
| O4   | TASK-0004 (CTG-0002)                                    | `pec-fixtures.md`, `contracts/CTG-0002.md`                                                                                                                                        | TASK-0003                                                                              |
| O5   | TASK-0005 ∥ TASK-0006 (CTG-0002) ∥ TASK-0008 (CTG-0003) | `ch/{patients,…,clinical-controls}/tests/integration/` ∥ `ch/{juntas,…,process-blocks}/tests/integration/` ∥ `pec-frontends.md`, `contracts/CTG-0004.md`, `contracts/CTG-0005.md` | TASK-0004; TASK-0003 (TASK-0008 divide lock com TASK-0004, daí a O5)                   |
| O6   | TASK-0007 (CTG-0002) ∥ TASK-0009 ∥ TASK-0010 (CTG-0003) | semente `ch`, `seed.sh`, `package.json` (tiers), módulos `ch` ∥ fichas `IU-PEC-{C,R}-*` e `import-manifest.json` ∥ `i18n/pec.pt-BR.json` e `parameter-catalogue.md`               | TASK-0005, TASK-0006; TASK-0008                                                        |
| O7   | TASK-0011 (CTG-0003)                                    | testes de `tools/parameters`                                                                                                                                                      | TASK-0010                                                                              |
| O8   | TASK-0012 (CTG-0003)                                    | verificador de `tools/parameters`                                                                                                                                                 | TASK-0011                                                                              |
| O9   | TASK-0013 (CTG-0004)                                    | specs do console A em `apps/pec/web`                                                                                                                                              | TASK-0009, TASK-0012; CTG-0002 concluído; R-0022 e R-0024 no branch                    |
| O10  | TASK-0014 (CTG-0004)                                    | `apps/pec/web` (scaffold e 12 telas A), `package.json` (`check`), lockfile pelo maestro                                                                                           | TASK-0013                                                                              |
| O11  | TASK-0015 (CTG-0005) ∥ TASK-0017 (CTG-0006)             | specs do console B ∥ slot `pec` em `tools/detran-stack.sh` e runbook                                                                                                              | TASK-0014; TASK-0017 serializada com a TASK-0011 de R-0032 (`MOD-local-stack`)         |
| O12  | TASK-0016 (CTG-0005)                                    | 7 telas B em `apps/pec/web`                                                                                                                                                       | TASK-0015                                                                              |
| O13  | TASK-0018 (CTG-0006)                                    | `pec-web.availability.json`, `docs/adopters/manuais/{clinico,regulatorio}/` e seções PEC de `gestor`, `auditor-dpo`, `administrador`                                              | TASK-0016; CTG-0001 e CTG-0003 de R-0030 no branch (empilhar em `orchestra/user-docs`) |
| O14  | TASK-0019 (CTG-0006)                                    | `pec-build-pack.md`, `waves.md`, `backlog.md`                                                                                                                                     | TASK-0017, TASK-0018                                                                   |

- **O3 publica o CTG-0001.** R-0032 abre empilhada em `origin/orchestra/pec-web` a partir daí.
  Antes desse push, o maestro confere a cobertura de `route-manifest.md` contra o §Mapa de R-0032.
- **O6 publica o CTG-0002** (fixtures e personas); a partir daí o CTG-0002 de R-0032 avança.
- **Ordem da O6 dentro da onda.** TASK-0007 (`MOD-ch-modules`) e a TASK-0004 de R-0032
  (`ch/*` eventos) não correm juntas: R-0032 só entra em `ch/*` depois do push da O6.

**Abertura empilhada.**

- **Base de abertura.** A rodada abre sobre `origin/main` com R-0024 mesclado. Sem ele, empilhada
  em `origin/orchestra/stynx-dedup`, com `frontend-wiring-pattern.md` no branch. R-0023
  (`orchestra/authz-unification`) e R-0022 (`orchestra/stynx-sse-tenancy`) entram por
  `git merge --no-edit` quando as ondas que dependem deles chegarem: O1 para a política e O9 para o
  app.
- **Para a O13.** Integre `origin/orchestra/user-docs` depois do push da O8 de R-0030 (CTG-0001 e
  CTG-0003 no branch).
- **O que espera o merge dos upstreams:** só o PR final. R-0022, R-0023, R-0024 e R-0030 precisam
  estar em `main`, com STYNX 1.5.0 **final** (OD-S15-01: nenhum PR com pin de RC). R-0017 já está
  em `main`.

**Sequência final** (na ordem de C-0002 §12):

1. `git fetch -q origin` e `git merge --no-edit origin/main`, com todos os upstreams em `main`.
2. **CI local completo:**
   - `pnpm check`;
   - `pnpm contracts:check` e `pnpm contracts:test`;
   - `pnpm verify:decorators`, `verify:pec-parity`, `verify:pec-superset`,
     `verify:senatran-boundary`, `verify:role-catalog` e `verify:rls-ddl`;
   - `seed.sh` duas vezes sobre banco limpo, `pnpm backend:test:integration` e
     `pnpm backend:test:ci`;
   - `pnpm parameters:test`, `pnpm verify:parameter-catalogue` e `pnpm parameters:generate` (sem
     diff);
   - `pnpm --filter @detran/pec-web typecheck|lint|test|build`;
   - `pnpm docs:kb:check`, `pnpm docs:kb:publish-check`, `pnpm format:check`,
     `pnpm docs:availability:check` e `pnpm docs:user:check`;
   - `pnpm stack:start` e `pnpm stack:smoke`;
   - `pnpm devai:rc:prepare`, quando aplicável.
3. **Uma delivery-review** (Opus 5.5) do diff inteiro (`origin/main...HEAD`), com a lista de
   personas das fixtures. `REVIEW` admite correções restritas aos itens apontados, em no máximo 2
   ciclos; `FAIL` → `escalated`.
4. **Um PR** contra `main`, com o corpo pelo template, a tabela CTG → tarefas → commits e o
   resultado dos gates. O pedido de decisão sobre OD-PW-002 vai neste PR.
5. **CI remoto.** Falha de código volta à tarefa responsável. Merge só com CI verde e `PASS`.
6. **Publicação final:**
   - `evidence-R-0031.json` com os 6 CTGs, `devai evidence record` e `evidence verify`;
   - `devai audit observe` no SHA do merge;
   - `closure.json`, `devai round close` e `devai round seal`;
   - `waves.md`, `work/rounds/README.md` e backlog.

**Janelas recalibradas:** 5 → ≈ 4.

- 1ª janela: bootstrap, prompt-review de TASK-0001…0019 e O1–O4.
- 2ª janela: O5–O8.
- 3ª janela: O9–O12.
- 4ª janela: O13–O14 e a sequência final.

O PR final espera R-0030; essa espera não está contada.

## Estado de partida (verificado em 2026-09-26 sobre `a92ef731`)

- **Frontend:** `apps/pec/web` contém só `README.md` ("no frontend planned", Orchestration rule 7),
  superado pela ADR-0034. `apps/*/*` já está em `pnpm-workspace.yaml`.
- **Módulos:** `backend/domains/ch/` tem **17** diretórios de módulo (billing, biometrics,
  clinical-controls, clinical-network, clinical-reports, encounters, exams, inconsistencies,
  juntas, operational-controls, patients, process-blocks, restrictions, retention, scheduling,
  telehealth, toxicology). ADR-0034 e o brief dizem 18; o maestro reconta no bootstrap e usa o
  número medido (sem OD: é contagem, não decisão).
- **Contratos:** 17 `BP-CH-*-001.openapi.json` gerados (CRUD). Rotas **manuscritas sem contrato**:
  15 `backend/domains/ch/*/src/*-commands.controller.ts` (prefixos `v1/ch/billing`,
  `v1/ch/biometrics`, `v1/ch/reports`, `v1/ch/juntas`, `v1/ch/retention`, `v1/ch/appointments`, …),
  `backend/domains/ch/clinical-reports/src/candidate-dossier.controller.ts`
  (`v1/ch/candidate-dossier`) e 8 `backend/app/src/pec-*.controller.ts` (`v1/ch/transmissions`,
  `v1/ch/transmissions/callbacks`, `v1/ch/encounters` RENACH, `v1/ch/integrations/sefaz`,
  `v1/ch/admin/process-parameters`, `v1/audit/events`, `v1/admin/users`, `v1/admin/users/cognito`).
  `tools/contracts/check-commands.mjs` não lista raiz `ch` em `CONTROLLER_ROOTS` nem catálogo de
  erro PEC; os módulos `ch` lançam exceções com mensagem livre (nenhum código catalogado).
- **Testes:** 19 specs unit em `ch/*`, **0** integração com Postgres por módulo, 1 e2e
  (`backend/app/tests/e2e/pec-idempotency.e2e.spec.ts`) e 1 integração de app
  (`backend/app/tests/integration/pec-pipeline-persistence.integration.spec.ts`).
  `backend:test:unit` omite `@detran/ch-juntas` e `@detran/ch-toxicology`; `backend:test:integration`
  não tem pacote `ch`. Todos os pacotes `ch` já têm o script `test:integration`.
- **Fixtures:** nenhuma de `ch` em `backend/database/seed/` (só parâmetros em `05-parameters.sql`).
- **Política:** `backend/domains/shared/src/policy.ts` concede `candidate-dossier` `read` e
  `feedback-request` só a `CANDIDATO`; a sessão do Portal é `CIDADAO` (gov.br). A ponte de
  identidade é de R-0032 (OD-PW-001 decidida; opções e recomendação em OD-R32-001); esta rodada
  não altera as linhas `candidate-dossier` de `policy.ts`.
  Papéis PEC (`PEC_ROLES`, 15) em `roles.ts`; família de UI deriva deles, papel novo só por OD.
- **Portal:** módulo `exames` já existe (`exames`, `exames/:examId/junta/nova`). A superfície C é
  inteiramente de R-0032; aqui só se garantem os contratos e as fixtures `ch` que ela consome.
- **i18n:** `docs/framework/arch/parameter-catalogue.md` §Superfície, chave e valores de linha não
  admite o prefixo `pec.`; a única exceção de namespace é `boat.` → OD-PW-004.
- **Autoridade externa ([IU-PEC-001] §E):** DT-021, DT-022 e DT-023 constam como **respondidos
  em 2026-08-28** em `docs/meta/knowledge-base/open-issues.md` (P2; "apto com restrições" para
  `CONDICIONADO`; plataforma responsável pela guarda), com resíduos abertos em
  `docs/meta/decisions/pec.md` (aceitação da taxonomia pelo RENACH, tabela prazo × rótulo da
  Portaria DETRAN-AM 005/2021, códigos do Anexo XV; eliminação desabilitada até PAdES-LTA —
  PEC-RETENTION-001). A ADR-0034 §5 manda as telas nascerem bloqueadas; OD-PW-002 pede ao Owner o
  alcance do bloqueio.
- **Fronteiras externas:** assinatura clínica por `ch/clinical-reports/src/pades-signing.http-adapter.ts`
  (`DETRAN_CLINICAL_SIGNING_URL`, sem mock servido); biometria por
  `ch/biometrics/src/biometric-verification.http-adapter.ts`; SEFAZ por `packages/sefaz-adapter`
  (sem mock); RENACH só por `packages/senatran-adapter` (ADR-0003, `pnpm verify:senatran-boundary`).
- **Stack local:** `tools/detran-stack.sh` (versionado por R-0017) sobe portal, rait, dashboard e
  teat (portas 4200–4203 no rascunho de 2026-09-26); sem PEC.

## Metas

1. **Contratos antes das telas** (ADR-0034 §3): `BP-CH-*.commands.openapi.json` para toda rota PEC
   consumida pelas 19 telas A/B **e** pelas rotas `ch` que R-0032 consome (`candidate-dossier`,
   `juntas/cases` e `appeals`, `restrictions`, `toxicology`, `appointments`); catálogo `docs/framework/arch/pec-error-catalog.md` (códigos `PEC.*`)
   com mapeamento exceção → código precedido de caracterização; `check-commands.mjs` cobrindo
   `ch`; clientes em `packages/api-clients` por `pnpm contracts:clients`.
2. **Fixtures e integração**: `docs/framework/arch/pec-fixtures.md`; semente `ch` sintética (sem dado
   real, RN-PEC-150/151), com personas de candidato por estado de P-01…P-07 e CPF sintético
   partilhado com a persona do Portal de R-0032; integração com Postgres/RLS para os 17 módulos; `ch-juntas` e
   `ch-toxicology` nos tiers de CI.
3. **Consoles A (12) e B (7)** em `apps/pec/web` (`@detran/pec-web`), sobre o kit e o padrão de
   ligação de R-0024 sem variantes; fichas por tela; i18n; guardas por política (fonte única de
   R-0023); assinatura fail-closed com nível visível; captura biométrica por porta com
   implementação de homologação explícita; RENACH só pelo backend (adapter).
4. **Superfície C (P-01…P-07):** fora desta rodada — R-0032 `portal-pec` (OD-PW-001 decidida pelo
   Owner em 2026-09-26: plano completo em R-0032).
5. **Manual PEC** (perfis `clinico` e `regulatorio`; seções PEC de `gestor`, `auditor-dpo`,
   `administrador`) pela convenção de R-0030; manifesto `pec-web.availability.json`; slot `pec`
   na stack local; `apps/pec/web/README.md` reescrito. O manual `cidadao` e as linhas PEC de
   `portal-web.availability.json` são de R-0032.

## Tarefas

| Tarefa    | Papel                | Perfil              | Modelo/esforço | Lock                                                                | Depende de           | Entrega                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| --------- | -------------------- | ------------------- | -------------- | ------------------------------------------------------------------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TASK-0001 | Architect            | architect-blueprint | Sol 6 / alto   | `MOD-pec-contracts`, `MOD-pec-arch-docs`, `MOD-r31-contracts`       | —                    | `route-manifest.md` (19 telas A/B × rota de UI × operação backend × papéis de `policy.ts` × UC/RN/WF × bloqueio §E, mais a tabela das operações `ch` consumidas por R-0032, sem rota de UI); `docs/framework/contracts/BP-CH-*.commands.openapi.json` (com `x-blueprint`) para os controladores consumidos; `docs/framework/arch/pec-error-catalog.md`; `docs/framework/arch/pec-build-pack.md` (estado, WPs, §Questões abertas com OD-PW-001 decidida e OD-PW-002…005; §Superfície C remete a R-0032); `contracts/CTG-0001.md`                                        |
| TASK-0002 | Inspector            | inspector-tests     | Terra / médio  | `MOD-contracts-tests`, `MOD-app-tests-pec`                          | TASK-0001            | **caracterização primeiro:** `backend/app/tests/e2e/pec-commands-characterization.e2e.spec.ts` (status e corpo de erro atuais de cada rota do manifesto, gravados antes da troca); `tools/contracts/tests/check-commands.pec.test.mjs`; testes do envelope `PEC.*` pós-mapeamento                                                                                                                                                                                                                                                                                      |
| TASK-0003 | Engineer             | engineer-backend    | Terra / médio  | `MOD-contracts-tools`, `MOD-ch-errors`, `MOD-api-clients-generated` | TASK-0002            | raízes `ch` e catálogo `PEC` em `check-commands.mjs`; exceções → erros codificados sem mudar status HTTP além do contrato; `pnpm contracts:openapi` + `pnpm contracts:clients` (gerados nunca à mão)                                                                                                                                                                                                                                                                                                                                                                   |
| TASK-0004 | Architect            | architect-blueprint | Terra / alto   | `MOD-pec-arch-docs`, `MOD-r31-contracts`                            | TASK-0003            | `docs/framework/arch/pec-fixtures.md` (personas sintéticas, incluindo candidatos para cada estado de P-01…P-07 com CPF sintético partilhado com R-0032, clínicas/tenants, profissionais, encontros em cada estado, laudo e adendo, junta com a escada de prazos lida de parâmetros, recurso CETRAN, retenção `BLOCKED`, toxicologia positivo/negativo/inválido, transmissões ACK/erro); matriz de integração por módulo (ciclo de vida, isolamento de tenant, titular sem máscara × Suporte mascarado [RN-PEC-153], assinatura fail-closed) em `contracts/CTG-0002.md` |
| TASK-0005 | Inspector            | inspector-tests     | Terra / médio  | `MOD-ch-tests-clinical`                                             | TASK-0004            | `backend/domains/ch/{patients,scheduling,biometrics,encounters,exams,clinical-reports,restrictions,telehealth,clinical-controls}/tests/integration/*.integration.spec.ts`                                                                                                                                                                                                                                                                                                                                                                                              |
| TASK-0006 | Inspector            | inspector-tests     | Terra / médio  | `MOD-ch-tests-regulatory`                                           | TASK-0004            | `backend/domains/ch/{juntas,retention,toxicology,inconsistencies,billing,clinical-network,operational-controls,process-blocks}/tests/integration/*.integration.spec.ts`                                                                                                                                                                                                                                                                                                                                                                                                |
| TASK-0007 | Engineer             | engineer-backend    | Terra / médio  | `MOD-seed-ch`, `MOD-root-scripts`, `MOD-ch-modules`                 | TASK-0005, TASK-0006 | `backend/database/seed/<nn>-fixtures-ch.sql` (número livre por `ls`) e perfil em `backend/database/seed.sh` conforme os perfis de R-0017; 17 pacotes `ch` em `backend:test:integration`, `ch-juntas` e `ch-toxicology` em `backend:test:unit`; correções nos módulos até verde, sem tocar teste                                                                                                                                                                                                                                                                        |
| TASK-0008 | Architect            | architect-blueprint | Sol 6 / alto   | `MOD-pec-arch-docs`, `MOD-r31-contracts`                            | TASK-0003            | `docs/framework/arch/pec-frontends.md` (scaffold pelo kit de R-0024; módulos; 19 rotas A/B; guardas por política; estados obrigatórios, incluindo "bloqueado por decisão" com o id; requisitos §D como critérios D1–D6; assinatura fail-closed; `BiometricCapturePort` + implementação de homologação com faixa visível; RENACH só leitura de `v1/ch/transmissions`; tempo real conforme OD-PW-003; famílias de UI derivadas de `PEC_ROLES`); `contracts/CTG-0004.md` e `contracts/CTG-0005.md`                                                                        |
| TASK-0009 | Architect (transcr.) | transcriber-docs    | Luna / baixo   | `MOD-product-pec-screens`, `MOD-kb-manifest`                        | TASK-0008            | 19 fichas `docs/framework/product/domains/ch/pec/screens/IU-PEC-{C-01…C-12,R-01…R-07}.md` (`status: draft`, `apps: [pec]`, fontes herdadas do [IU-PEC-001]); baseline de `import-manifest.json` + 19 no mesmo lote (as 7 fichas P são de R-0032)                                                                                                                                                                                                                                                                                                                       |
| TASK-0010 | Architect (transcr.) | transcriber-docs    | Luna / baixo   | `MOD-pec-i18n`, `MOD-parameter-catalogue-doc`                       | TASK-0008            | `docs/framework/arch/i18n/pec.pt-BR.json` (vocabulário legal: apto · apto com restrições · inapto temporário · inapto, trilhas médica e psicológica separadas; estados; `PEC.*`; títulos; textos de bloqueio); linhas de namespace e a exceção `pec.` no `parameter-catalogue.md` conforme OD-PW-004                                                                                                                                                                                                                                                                   |
| TASK-0011 | Inspector            | inspector-tests     | Luna / baixo   | `MOD-parameters-tests`                                              | TASK-0010            | caso de teste da exceção de namespace `pec.` nos testes de `tools/parameters` (aceita só como namespace i18n, nunca como chave de parâmetro)                                                                                                                                                                                                                                                                                                                                                                                                                           |
| TASK-0012 | Engineer             | engineer-backend    | Luna / baixo   | `MOD-parameters-tools`                                              | TASK-0011            | exceção `pec.` no verificador de `tools/parameters`; `pnpm parameters:generate` sem diff nos gerados; `pnpm parameters:test` e `pnpm verify:parameter-catalogue` verdes                                                                                                                                                                                                                                                                                                                                                                                                |
| TASK-0013 | Inspector            | inspector-tests     | Terra / médio  | `MOD-pec-web-tests`                                                 | TASK-0009, TASK-0012 | specs do console A: tela ↔ ficha ↔ rota ↔ i18n (12/12); roteamento por cada papel de `PEC_ROLES` com presença e ausência; D1 (nenhum `CONDICIONADO`/`PENDENTE` no DOM), D4 (nível de assinatura), assinatura sem provedor ⇒ laudo não emitido e estado explícito; faixa de homologação na captura biométrica; C-12 com rótulos bloqueados conforme OD-PW-002; axe sem `serious`/`critical`                                                                                                                                                                             |
| TASK-0014 | Engineer             | engineer-frontend   | Sol 6 / médio  | `MOD-pec-web-app`, `MOD-root-scripts`                               | TASK-0013            | scaffold `apps/pec/web` (`@detran/pec-web`: `build                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | test | lint | typecheck`, cópia do padrão sem variantes), extensão de `pnpm check`, 12 telas A, `apps/pec/web/README.md` reescrito; lockfile pelo maestro |
| TASK-0015 | Inspector            | inspector-tests     | Terra / médio  | `MOD-pec-web-tests-reg`                                             | TASK-0014            | specs do console B (7/7): R-04 com prazos lidos de parâmetros, nunca literais; R-06 só leitura; R-07 bloqueado ([RN-PEC-141], PEC-RETENTION-001); R-03 colegiado distinto; roteamento e axe                                                                                                                                                                                                                                                                                                                                                                            |
| TASK-0016 | Engineer             | engineer-frontend   | Terra / médio  | `MOD-pec-web-regulatory`                                            | TASK-0015            | 7 telas B                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| TASK-0017 | Engineer             | engineer-backend    | Luna / baixo   | `MOD-local-stack`                                                   | TASK-0014            | slot `pec` em `tools/detran-stack.sh` (próxima porta livre, `DETRAN_LOCAL_ROLES` com papéis PEC só no perfil local) e linha no runbook de R-0017; serializado com a TASK-0011 de R-0032 (persona PEC do cidadão)                                                                                                                                                                                                                                                                                                                                                       |
| TASK-0018 | Architect (transcr.) | transcriber-docs    | Luna / médio   | `MOD-availability-pec`, `MOD-user-docs-pec`                         | TASK-0016            | `docs/framework/arch/availability/pec-web.availability.json` (marcador de indisponibilidade PEC do §6.1 do esquema); `docs/adopters/manuais/{clinico,regulatorio}/` e seções PEC nos manuais `gestor`, `auditor-dpo`, `administrador` (convenção de R-0030); `cidadao` e `portal-web` são de R-0032                                                                                                                                                                                                                                                                    |
| TASK-0019 | Architect (transcr.) | transcriber-docs    | Luna / baixo   | `MOD-docs`                                                          | TASK-0017, TASK-0018 | `pec-build-pack.md` (WPs executados, gates reais), `waves.md` §Histórico, `backlog.md`, estado das OD-PW (OD-PW-001 decidida → R-0032)                                                                                                                                                                                                                                                                                                                                                                                                                                 |

**CTGs (commits por CTG na branch única; um PR no fim — OD-C2-005):** CTG-0001 = 0001 → 0002 → 0003 (contratos, erros, clientes); CTG-0002 =
0004 → 0005 ∥ 0006 → 0007 (fixtures, integração, tiers); CTG-0003 = 0008 → 0009 ∥ 0010 → 0011 →
0012 (frontends, fichas, i18n, exceção de namespace); CTG-0004 = 0013 → 0014 (scaffold e console A);
CTG-0005 = 0015 → 0016 (console B); CTG-0006 = 0017 ∥ 0018 → 0019 (stack, manifesto, manual,
documentação). O antigo CTG de Portal (TASK-0017…0019 da versão anterior) saiu para R-0032
(OD-PW-001 decidida); a numeração foi recompactada. CTG-0003 pode correr em paralelo ao CTG-0002
(locks disjuntos) depois de o CTG-0001 concluir na branch; CTG-0004 exige CTG-0002 e CTG-0003
concluídos na branch (as telas consomem fixtures e contratos).

**Checkpoints do maestro (Engineer):** (a) CTG-0001: `pnpm contracts:check` e `pnpm contracts:test`
antes e depois da troca de exceções; a caracterização de TASK-0002 fica verde nas duas pontas
(diferença só no campo de código previsto no contrato); (b) CTG-0002: `seed.sh` duas vezes sobre
banco limpo (lição 9) e `pnpm backend:test:integration`; (c) CTG-0004: pacote novo → `pnpm install`,
`pnpm-lock.yaml` no commit do grupo, extensão de `pnpm check` com a tripla
`pnpm --filter @detran/pec-web lint|test|build` antes de liberar o Inspector; (d) CTG-0006:
`pnpm docs:availability:check` e `pnpm docs:user:check`.

## Critérios de aceitação (comandos → resultado)

- `pnpm contracts:check` → verde, com as raízes `ch` examinadas e 0 rotas manuscritas PEC
  consumidas sem contrato; `pnpm contracts:test` → verde (inclui `check-commands.pec.test.mjs`).
- `pnpm verify:decorators`, `pnpm verify:pec-parity`, `pnpm verify:pec-superset`,
  `pnpm verify:senatran-boundary`, `pnpm verify:role-catalog`, `pnpm verify:rls-ddl` → verdes.
- `node -e` sobre `package.json`: `backend:test:integration` contém os 17 `@detran/ch-*`;
  `backend:test:unit` contém `@detran/ch-juntas` e `@detran/ch-toxicology`.
- `pnpm backend:test:integration` e `pnpm backend:test:ci` → verdes; cada pacote `ch` com ≥ 1 spec
  `tests/integration/*.integration.spec.ts`.
- `pnpm parameters:test`, `pnpm verify:parameter-catalogue` (`… 0 errors`) → verdes;
  `pnpm parameters:generate` sem diff.
- `pnpm --filter @detran/pec-web typecheck|lint|test|build` → verdes; tela ↔ ficha ↔ rota ↔ i18n
  19/19; axe sem `serious`/`critical`. (Critérios do Portal e das telas P: R-0032.)
- `pnpm docs:kb:check` → OK com baseline + 19; `pnpm docs:kb:publish-check`, `pnpm format:check` → OK.
- `pnpm docs:availability:check` → `OK (…, 7 superfícies, 0 erros)`; `pnpm docs:user:check` →
  `OK (…, 9 perfis, 0 divergências de selo)`.
- Stack: `pnpm stack:start` sobe o slot `pec` e o smoke da stack de R-0017 passa (script entregue por
  R-0017; o maestro usa o nome registrado no runbook).
- `pnpm check` → verde.

## Mapa entregável → definições

| Entregável              | Definição                                                                                                                                                                                                                                                                        |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| inventário e fronteiras | [IU-PEC-001] (A, B, C, §D, §E); `docs/meta/adr/ADR-0034-pec-web-frontend.md`; ADR-0003; ADR-0012/0013 (paridade); ADR-0018 (documentos e assinatura)                                                                                                                             |
| contratos               | `backend/domains/ch/*/src/*-commands.controller.ts`; `candidate-dossier.controller.ts`; `backend/app/src/pec-*.controller.ts`; `docs/framework/contracts/BP-CH-*-001.openapi.json`; `docs/framework/blueprints/BP-CH-*-001.json`; `tools/contracts/check-commands.mjs`; ADR-0009 |
| regras e fluxos         | `docs/framework/product/domains/ch/pec/APP.md`; `use-cases/UC-PEC-001…014`; `rules/RN-PEC-*`; `workflows/WF-PEC-001…005`; `journeys/JRN-PEC-001…007`                                                                                                                             |
| decisões                | `docs/meta/decisions/pec.md` (DT-021…024, PEC-RETENTION-001); `docs/meta/knowledge-base/open-issues.md` (DT-021…023)                                                                                                                                                             |
| papéis e política       | `backend/domains/shared/src/roles.ts` (`PEC_ROLES`); `backend/domains/shared/src/policy.ts`                                                                                                                                                                                      |
| fixtures                | `backend/database/seed/`, `backend/database/seed.sh`; molde `docs/framework/arch/rait-fixtures.md`                                                                                                                                                                               |
| app                     | `docs/framework/arch/frontend-wiring-pattern.md` (R-0024); `docs/framework/arch/detran-ui-guide.md`; `apps/portal/web` (padrão de scaffold); `packages/ui`                                                                                                                       |
| consumidora (R-0032)    | `work/rounds/R-0032/plan.md` §Mapa tela → rota → backend (operações `ch` que precisam de contrato e personas de fixture)                                                                                                                                                         |
| i18n                    | `docs/framework/arch/parameter-catalogue.md` §Namespaces i18n e §Superfície, chave e valores de linha; `tools/parameters/`                                                                                                                                                       |
| manual e manifesto      | `docs/framework/arch/user-docs-convention.md` e `work/rounds/R-0030/availability-manifest.schema.md` (R-0030)                                                                                                                                                                    |
| stack                   | `tools/detran-stack.sh` e runbook de R-0017                                                                                                                                                                                                                                      |

## ODs propostas (registro canônico: `docs/framework/arch/pec-build-pack.md` §Questões abertas, no commit do CTG-0001)

- **OD-PW-001** — acesso do cidadão ao PEC no Portal. **Decidida pelo Owner em 2026-09-26: plano
  completo em R-0032** (`work/rounds/R-0032/plan.md`). A escolha do vínculo cidadão → candidato
  passou a ser OD-R32-001 (recomendação do Architect: híbrido — vínculo por evento, projeções sem
  conteúdo clínico, dossiê sob demanda pelo dono, comandos por delegação, sem papel novo). Registrar
  em `pec-build-pack.md` como decidida, com remissão.
- **OD-PW-002** — alcance do "bloqueado por decisão" (ADR-0034 §5) diante de DT-021/022/023
  respondidos com resíduos. Padrão até decisão: ADR-0034 §5 integral — P-01 (forma final), R-07,
  P-07 e os rótulos de C-12 além de "apto com restrições" nascem bloqueados, citando DT e resíduo.
  R-0032 consome esta decisão para P-01 e P-07.
- **OD-PW-003** — tempo real em C-01 (fila) e C-11 (transmissão RENACH): tópico `ch` na fonte
  única de SSE de R-0022 × fallback de polling do padrão. Padrão: fallback de polling, sem stream
  novo.
- **OD-PW-004** — namespace i18n `pec.`: exceção explícita na tabela de superfícies do
  `parameter-catalogue.md`, como `boat.`. Padrão proposto: aceitar só como namespace i18n.
- **OD-PW-005** — R-05 (credenciamento) está fora dos UC atuais. Padrão: tela com a leitura e os
  comandos existentes de `clinical-network`; ação sem UC fica `bloqueado_por_decisao`.

## Riscos

- **Troca de erros quebra clientes existentes** (`pec-idempotency`, RENACH): caracterização antes
  (TASK-0002) e mapeamento que preserva status HTTP.
- **Dado sensível em fixture** (RN-PEC-150/151, LGPD): personas sintéticas, sem CPF válido, sem
  imagem biométrica; revisão explícita do reviewer.
- **Inverter a máscara** ([IU-PEC-001] §D.2): teste de integração e de UI dos dois lados (titular
  sem máscara, Suporte com máscara).
- **Assinatura "de mentira"**: sem PAdES real a emissão falha fechada e a UI diz isso; nenhum stub
  que devolva sucesso.
- **Biometria**: a implementação de homologação é rotulada na UI e desligada fora do perfil
  local/homologação; o driver real fica fora (ADR-0034 §6).
- **Consumidora a jusante (R-0032)**: contratos incompletos para as rotas `ch` do candidato ou
  fixtures sem personas de candidato travam R-0032. O `route-manifest.md` (TASK-0001) lista essas
  operações; o maestro confere a cobertura contra o mapa de R-0032 antes dos pushes que publicam o
  CTG-0001 e o CTG-0002, e a delivery-review final a reconfirma (OD-C2-005).
- **Lock partilhado com R-0030 nos manifestos e com R-0032 na stack**: CTG-0006 empilha sobre os
  CTGs de R-0030 citados em §Concorrência e serializa `MOD-local-stack` com R-0032.
- **Volume** (17 módulos de integração + 19 telas): janelas acima da estimativa da campanha;
  checkpoint por CTG, sem cortar critério.

## Lições aplicadas (C-0001 e método §4)

- Relatórios versionados em `work/rounds/R-0031/reports/`; `find` × `git ls-files` após cada `git add`
  de grupo (o padrão `reports/` do `.gitignore` já escondeu `features/reports/` em R-0016).
- Critérios imutáveis: mudança só por adenda com decisão do Owner; substituído = não cumprido. Nada
  de trocar Lighthouse por axe nem suíte integral por testes focais.
- ODs no registro canônico (`pec-build-pack.md`) no mesmo PR que as cita.
- Âncora da prova por CTG; `audit observe` no SHA exato; `round close` e `round seal`.
- `budget.json` obrigatório; checkpoint a 80%.
- Caracterização antes de toda troca de implementação (erros PEC, tiers de teste).
- Padrão de app sem variantes: `apps/pec/web` copia o scaffold consolidado por R-0024; pacote novo
  → `pnpm install` pelo maestro e lockfile no commit.
- Nenhuma integração externa real; nenhum valor normativo inventado (prazos da escada R-04 vêm do
  catálogo de parâmetros; códigos do Anexo XV `source_pending`).
- Testes de roteamento com presença e ausência para todos os papéis de `PEC_ROLES` (`CIDADAO` é de R-0032).
- Transcrição (fichas, i18n, manual, manifesto) é Architect por `transcriber-docs`.

## Decisões do maestro

## Bloqueios

## Triagem

## Retomada

## Leitura
