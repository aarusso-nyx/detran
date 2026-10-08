# rounds

**Authority:** Architect (Constitution Article 6).

Governed rounds of this repository (DEVAI 2.2.0). One round per front of the implementation
backlog (`docs/meta/agents/orchestra/waves.md`, ADR-0022) or of a campaign. Evidence lives in
`record/proofs/chain.json` (machine-only); this folder holds the human-readable working papers.
`pnpm verify:state-index` checks this table against `record/proofs/compliance/closures/PC-*.json`:
a closed round names its closure, and every closure has its round here. R-0001 and R-0002 predate
the method (no closure; R-0002 has no folder).

## Campanhas

- **C-0001** — R-0001…R-0016: implementation backlog (`docs/meta/agents/orchestra/waves.md`).
- **C-0002** — consolidation, R-0017…R-0032 and S-1.5 (`work/campaigns/C-0002-consolidacao.md`
  §2). Ids are proposed until each round opens; each maestro updates its own row on closure.

| Rodada | Frente / escopo                                                    | Estado            | PRs de merge            | PC      | Maestro                   |
| ------ | ------------------------------------------------------------------ | ----------------- | ----------------------- | ------- | ------------------------- |
| R-0001 | definição, WP-0, WP-T0 (evidência seq. 1–4)                        | pré-método        | #27, #28, #29           | —       | —                         |
| R-0002 | port do PEC (sem pasta; `record/proofs/work/generic/R-0002.jsonl`) | pré-método        | source_pending          | —       | —                         |
| R-0003 | `dash-roles` — WP-D0                                               | fechada           | #32                     | PC-0001 | Fable                     |
| R-0004 | `param-store` — ADR-0021 / WP-A parâmetros                         | fechada           | #37                     | PC-0002 | Sol                       |
| R-0005 | `ops-agency` — WP-T1 (TEAT), `ops/agency` mínimo                   | fechada           | #40, #41, #42, #44      | PC-0003 | Sol                       |
| R-0006 | `rait-model` — WP-A restante (RAIT)                                | fechada           | #39, #43                | PC-0004 | Fable                     |
| R-0007 | `rait-backend` — WP-B + WP-C (RAIT)                                | fechada           | #69, #94                | PC-0011 | Sol                       |
| R-0008 | `teat-backend` — WP-T2 + WP-T3 (TEAT)                              | fechada           | #47, #48, #49, #50, #51 | PC-0005 | Fable                     |
| R-0009 | `portal-backend` — WP-P0…P3 (PORTAL)                               | fechada           | #54, #56                | PC-0006 | Fable                     |
| R-0010 | `boat-backend` — WP-B0…B3 (BOAT)                                   | fechada           | #55, #71                | PC-0008 | Sol                       |
| R-0011 | `dashboard-backend` — WP-D1…D3 (DASHBOARD)                         | fechada           | #83, #87                | PC-0009 | Fable (troca Sol → Fable) |
| R-0012 | `rait-web` — WP-D + WP-E + WP-F (RAIT)                             | fechada           | #79, #81, #85, #90, #92 | PC-0010 | Fable                     |
| R-0013 | `teat-frontends` — WP-T4…T6 (TEAT)                                 | fechada           | #70, #73, #82, #113     | PC-0013 | Sol                       |
| R-0014 | `portal-pwa` — WP-P4…P6 (PORTAL)                                   | fechada           | #60…#66                 | PC-0007 | Fable                     |
| R-0015 | `boat-mobile` — WP-B4 + WP-B5 (BOAT)                               | fechada           | #107, #116              | PC-0014 | Sol (troca Fable → Sol)   |
| R-0016 | `dashboard-console` — WP-D4 + WP-D5 (DASHBOARD)                    | fechada           | #80, #103               | PC-0012 | Fable (troca Sol → Fable) |
| R-0017 | `local-stack` — ação 4                                             | fechada           | #133, #143, #144        | PC-0018 | Sol 6                     |
| R-0018 | `index-state` — ação 3                                             | fechada           | #128, #129, #130        | PC-0020 | Opus 5.5                  |
| R-0019 | `law-corpus` — ação 2                                              | fechada           | #132, #137, #139        | PC-0016 | Sol 6                     |
| R-0020 | `devai-sensors` — ação 5                                           | aberta            | #150, #155              | —       | Codex Sol 6               |
| S-1.5  | _repositório STYNX_ — release STYNX 1.5.0 (7b/7c)                  | proposta (C-0002) | —                       | —       | governança do STYNX       |
| R-0021 | `stynx-canonical` — ação 7a                                        | fechada           | #149, #151, #153, #154  | PC-0019 | Sol 6                     |
| R-0022 | `stynx-sse-tenancy` — ação 7c                                      | proposta (C-0002) | —                       | —       | Opus 5.5                  |
| R-0023 | `authz-unification` — ação 7d                                      | proposta (C-0002) | —                       | —       | Sol 6                     |
| R-0024 | `stynx-dedup` — ação 7b                                            | proposta (C-0002) | —                       | —       | Opus 5.5                  |
| R-0025 | `rait-web-wiring` — ação 6                                         | proposta (C-0002) | —                       | —       | Sol 6                     |
| R-0026 | `dashboard-wiring` — ação 6                                        | proposta (C-0002) | —                       | —       | Opus 5.5                  |
| R-0027 | `portal-delegations` — ação 6                                      | proposta (C-0002) | —                       | —       | Sol 6                     |
| R-0028 | `boat-wiring` — ação 6                                             | proposta (C-0002) | —                       | —       | Opus 5.5                  |
| R-0029 | `teat-web-wiring` — ação 6                                         | proposta (C-0002) | —                       | —       | Sol 6                     |
| R-0030 | `user-docs` — ação 1                                               | proposta (C-0002) | —                       | —       | Opus 5.5                  |
| R-0031 | `pec-web` — ação 8                                                 | proposta (C-0002) | —                       | —       | Sol 6                     |
| R-0032 | `portal-pec` — ação 8                                              | proposta (C-0002) | —                       | —       | Opus 5.5                  |

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
