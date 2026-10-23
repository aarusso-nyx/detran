# rounds

> **Current boundary — 2026-10-23:** S1 integrated; S2 approved via #205,
> implemented in draft #211, not integrated. R-0025/JW-01 remain open.
> [RAIT progress proposal](../../docs/meta/knowledge-base/rait-progress-plan-2026-10-23.md) separates integration/validation blockers
> from proposed parallel S3 packet preparation. S3 runtime and #211 merge remain paused.
> Preserve local, recovery and separate scorecard work.

**Authority:** Architect (Constitution Article 6).

Governed rounds of this repository (DEVAI 2.6.3). One round per front of the implementation
backlog (`docs/meta/agents/orchestra/waves.md`, ADR-0022) or of a campaign. Evidence lives in
`record/proofs/chain.json` (machine-only); this folder holds the human-readable working papers.
`pnpm verify:state-index` checks this table against `record/proofs/compliance/closures/PC-*.json`:
a closed round names its closure, and every closure has its round here. R-0001 and R-0002 predate
the method (no closure; R-0002 has no folder).

## Estado de main e checkpoints preservados (2026-10-18)

Base conferida: `main` = `06b4a584`; heads remotos conferidos na mesma data.
Esta tabela separa fechamento formal de trabalho iniciado fora de main. `aberta`
usa o vocabulário do gate: a rodada começou e não fechou; pode estar em checkpoint,
sem execução ativa, aceitação ou merge. O escopo distingue esses checkpoints. Autorizações e
TASKs ainda ausentes daqui são consultáveis no head do branch, sem copiá-las para a
store histórica. A [reconciliação do backlog](../../docs/meta/knowledge-base/backlog.md#reconciliação-em-2026-10-18--fila-de-execução-atual)
lista heads, tarefas, entregas, decisões e pendências por frente. PCs, provas e TASKs
históricos não foram alterados para corrigir a projeção de status.

## Campanhas

- **C-0001** — R-0001…R-0016: implementation backlog (`docs/meta/agents/orchestra/waves.md`).
- **C-0002** — consolidation, R-0017…R-0032 and S-1.5 (`work/campaigns/C-0002-consolidacao.md`
  §2). Ids are proposed until each round opens; each maestro updates its own row on closure.
- **C-0003** — product first (preview → vertical journeys → platform seams → hardening),
  R-0033…R-0035 plus the C-0002 rounds re-sequenced by A-C2-16
  (`work/campaigns/C-0003-produto-primeiro.md` §4). Proposed 2026-10-14 after the Owner stopped
  R-0022; R-0033 subsequently authorized and checkpointed on the preserved preview branch.

| Rodada | Frente / escopo                                                                                                             | Estado            | PRs de merge                                           | PC      | Maestro                                             |
| ------ | --------------------------------------------------------------------------------------------------------------------------- | ----------------- | ------------------------------------------------------ | ------- | --------------------------------------------------- |
| R-0001 | definição, WP-0, WP-T0 (evidência seq. 1–4)                                                                                 | pré-método        | #27, #28, #29                                          | —       | —                                                   |
| R-0002 | port do PEC (sem pasta; `record/proofs/work/generic/R-0002.jsonl`)                                                          | pré-método        | source_pending                                         | —       | —                                                   |
| R-0003 | `dash-roles` — WP-D0                                                                                                        | fechada           | #32                                                    | PC-0001 | Fable                                               |
| R-0004 | `param-store` — ADR-0021 / WP-A parâmetros                                                                                  | fechada           | #37                                                    | PC-0002 | Sol                                                 |
| R-0005 | `ops-agency` — WP-T1 (TEAT), `ops/agency` mínimo                                                                            | fechada           | #40, #41, #42, #44                                     | PC-0003 | Sol                                                 |
| R-0006 | `rait-model` — WP-A restante (RAIT)                                                                                         | fechada           | #39, #43                                               | PC-0004 | Fable                                               |
| R-0007 | `rait-backend` — WP-B + WP-C (RAIT)                                                                                         | fechada           | #69, #94                                               | PC-0011 | Sol                                                 |
| R-0008 | `teat-backend` — WP-T2 + WP-T3 (TEAT)                                                                                       | fechada           | #47, #48, #49, #50, #51                                | PC-0005 | Fable                                               |
| R-0009 | `portal-backend` — WP-P0…P3 (PORTAL)                                                                                        | fechada           | #54, #56                                               | PC-0006 | Fable                                               |
| R-0010 | `boat-backend` — WP-B0…B3 (BOAT)                                                                                            | fechada           | #55, #71                                               | PC-0008 | Sol                                                 |
| R-0011 | `dashboard-backend` — WP-D1…D3 (DASHBOARD)                                                                                  | fechada           | #83, #87                                               | PC-0009 | Fable (troca Sol → Fable)                           |
| R-0012 | `rait-web` — WP-D + WP-E + WP-F (RAIT)                                                                                      | fechada           | #79, #81, #85, #90, #92                                | PC-0010 | Fable                                               |
| R-0013 | `teat-frontends` — WP-T4…T6 (TEAT)                                                                                          | fechada           | #70, #73, #82, #113                                    | PC-0013 | Sol                                                 |
| R-0014 | `portal-pwa` — WP-P4…P6 (PORTAL)                                                                                            | fechada           | #60…#66                                                | PC-0007 | Fable                                               |
| R-0015 | `boat-mobile` — WP-B4 + WP-B5 (BOAT)                                                                                        | fechada           | #107, #116                                             | PC-0014 | Sol (troca Fable → Sol)                             |
| R-0016 | `dashboard-console` — WP-D4 + WP-D5 (DASHBOARD)                                                                             | fechada           | #80, #103                                              | PC-0012 | Fable (troca Sol → Fable)                           |
| R-0017 | `local-stack` — ação 4                                                                                                      | fechada           | #133, #143, #144                                       | PC-0018 | Sol 6                                               |
| R-0018 | `index-state` — ação 3                                                                                                      | fechada           | #128, #129, #130                                       | PC-0020 | Opus 5.5                                            |
| R-0019 | `law-corpus` — ação 2                                                                                                       | fechada           | #132, #137, #139                                       | PC-0016 | Sol 6                                               |
| R-0020 | `devai-sensors` — ação 5; checkpoint em branch                                                                              | aberta            | #150, #155                                             | —       | Codex Sol 6                                         |
| S-1.5  | _repositório STYNX_ — release STYNX 1.5.0 (7b/7c)                                                                           | proposta (C-0002) | —                                                      | —       | governança do STYNX                                 |
| R-0021 | `stynx-canonical` — ação 7a                                                                                                 | fechada           | #149, #151, #153, #154                                 | PC-0019 | Sol 6                                               |
| R-0022 | `stynx-sse-tenancy` — ação 7c; parada 2026-10-14 no checkpoint `codex/detran-r22-adoption-160` `c22ea63a`, sem PR (A-C2-16) | parada            | —                                                      | —       | Opus 5.5                                            |
| R-0023 | `authz-unification` — ação 7d; checkpoint em branch                                                                         | aberta            | —                                                      | —       | Sol 6                                               |
| R-0024 | `stynx-dedup` — ação 7b                                                                                                     | proposta (C-0002) | —                                                      | —       | Opus 5.5                                            |
| R-0025 | `rait-web-wiring` — admissibilidade #193 e escopo/replay S1 #203 integrados; audit YELLOW; S2 #205 aprovada; #211 draft     | aberta            | #193, #194, #196–#201, #203                            | —       | Sol 6                                               |
| R-0026 | `dashboard-wiring` — ação 6; checkpoint em branch                                                                           | aberta            | —                                                      | —       | Opus 5.5                                            |
| R-0027 | `portal-delegations` — ação 6; checkpoint em branch                                                                         | aberta            | —                                                      | —       | Sol 6                                               |
| R-0028 | `boat-wiring` — ação 6; checkpoint em branch                                                                                | aberta            | —                                                      | —       | Opus 5.5                                            |
| R-0029 | `teat-web-wiring` — ação 6; checkpoint em branch                                                                            | aberta            | —                                                      | —       | Sol 6                                               |
| R-0030 | `user-docs` — ação 1; checkpoint em branch                                                                                  | aberta            | —                                                      | —       | Opus 5.5                                            |
| R-0031 | `pec-web` — ação 8; checkpoint em branch                                                                                    | aberta            | —                                                      | —       | Sol 6                                               |
| R-0032 | `portal-pec` — ação 8; checkpoint em branch                                                                                 | aberta            | —                                                      | —       | Opus 5.5                                            |
| R-0033 | `frontend-preview` — RAIT/JW-01 e Portal; pós-merge concluído, fechada e selada                                             | fechada           | [#191](https://github.com/aarusso-nyx/detran/pull/191) | PC-0021 | Codex (W3; histórico Fable 5.1; review Claude PASS) |
| R-0034 | `platform-seams` — C-0003 fase S (salvamento da R-0022)                                                                     | proposta (C-0003) | —                                                      | —       | Sol 6                                               |
| R-0035 | `hardening-certification` — C-0003 fase H                                                                                   | proposta (C-0003) | —                                                      | —       | Opus 5.5                                            |
| R-0036 | `scorecard-evaluation` — 43 itens medidos; integração e atestação aprovadas; fechada e selada                               | fechada           | [#202](https://github.com/aarusso-nyx/detran/pull/202) | PC-0022 | Codex                                               |
| R-0037 | `C1` — dependências de execução integradas por PR #206; CI pós-integração aprovada                                          | fechada           | [#206](https://github.com/aarusso-nyx/detran/pull/206) | PC-0023 | Codex                                               |
| R-0038 | `C2` — ferramentas e Angular integrados por PR #208; CI pós-integração aprovada                                             | fechada           | [#208](https://github.com/aarusso-nyx/detran/pull/208) | PC-0024 | Codex                                               |
| R-0039 | `C3/C4` — normalização suplementar integrada; lacunas preservadas                                                           | fechada           | [#209](https://github.com/aarusso-nyx/detran/pull/209) | PC-0025 | Codex                                               |
| R-0041 | C5-C8 security specification and governance controls                                                                        | aberta            | —                                                      | —       | Codex                                               |

## Folder convention (`R-nnnn/`)

| Path                    | Content                                                                                                                                                         |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `plan.md`               | goals, task table, acceptance commands, map deliverable → definitions, risks, §Bloqueios, §Retomada, §Leitura                                                   |
| `prompts/00-maestro.md` | the single prompt that opens the orchestra (instantiated template)                                                                                              |
| `prompts/TASK-nnnn.md`  | worker prompts composed by the maestro                                                                                                                          |
| `tasks/TASK-nnnn.json`  | tasks in the DEVAI `task.schema.json` (2.0.0)                                                                                                                   |
| `compositions.json`     | prompt composition ids (`PC-<16hex>`) per task                                                                                                                  |
| `reviews/`              | reviewer prompts, verdicts (JSON) and bridge records                                                                                                            |
| `reports/`              | worker delivery reports — tracked by git since R-0018 CTG-0002 (`.gitignore` re-includes `work/rounds/*/reports/`); excluded from Prettier as verbatim evidence |
| `evidence-*.json`       | payloads recorded through `devai evidence record`                                                                                                               |
| `budget.json`           | token accounting per task and reviewer call                                                                                                                     |
| `closure.json`          | phase-closure draft for `devai round close`                                                                                                                     |

Seal: `devai round seal` (R-0020) seals R-0003…R-0016, R-0018 and R-0019;
R-0017 was sealed in its own round. The seal artefact and path are defined by R-0020.
