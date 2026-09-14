# rounds

**Authority:** Architect (Constitution Article 6).

Governed rounds of this repository (DEVAI 1.4.5). One round per front of the implementation
backlog (`docs/meta/agents/orchestra/waves.md`, ADR-0022). Evidence lives in
`record/proofs/chain.json` (machine-only); this folder holds the human-readable working papers.

| Round  | Front / scope                                     | State                                         |
| ------ | ------------------------------------------------- | --------------------------------------------- |
| R-0001 | definition round, WP-0, WP-T0 (evidence seq. 1–4) | closed by merges #27, #28, #29                |
| R-0002 | PEC port                                          | see `record/proofs/work/generic/R-0002.jsonl` |
| R-0003 | `dash-roles` — WP-D0                              | merged by PR #32; closed as PC-0001           |
| R-0004 | `param-store` — ADR-0021 / WP-A parameters        | merged by PR #37; closed as PC-0002           |
| R-0005 | `ops-agency` — WP-T1 (TEAT), `ops/agency` mínimo  | planned; maestro GPT-5.6 Sol                  |
| R-0006 | `rait-model` — WP-A restante (RAIT)               | planned; maestro Fable 5.1                    |
| R-0007 | `rait-backend` — WP-B + WP-C (RAIT)               | planned; maestro GPT-5.6 Sol                  |
| R-0008 | `teat-backend` — WP-T2 + WP-T3 (TEAT)             | planned; maestro Fable 5.1                    |
| R-0009 | `portal-backend` — WP-P0…P3 (PORTAL)              | planned; maestro Fable 5.1                    |
| R-0010 | `boat-backend` — WP-B0…B3 (BOAT)                  | planned; maestro GPT-5.6 Sol                  |
| R-0011 | `dashboard-backend` — WP-D1…D3 (DASHBOARD)        | planned; maestro GPT-5.6 Sol                  |
| R-0012 | `rait-web` — WP-D + WP-E + WP-F (RAIT)            | planned; maestro Fable 5.1                    |
| R-0013 | `teat-frontends` — WP-T4…T6 (TEAT)                | planned; maestro GPT-5.6 Sol                  |
| R-0014 | `portal-pwa` — WP-P4…P6 (PORTAL)                  | planned; maestro Fable 5.1                    |
| R-0015 | `boat-mobile` — WP-B4 + WP-B5 (BOAT)              | planned; maestro Fable 5.1                    |
| R-0016 | `dashboard-console` — WP-D4 + WP-D5 (DASHBOARD)   | planned; maestro GPT-5.6 Sol                  |

## Folder convention (`R-nnnn/`)

| Path                    | Content                                                                                                       |
| ----------------------- | ------------------------------------------------------------------------------------------------------------- |
| `plan.md`               | goals, task table, acceptance commands, map deliverable → definitions, risks, §Bloqueios, §Retomada, §Leitura |
| `prompts/00-maestro.md` | the single prompt that opens the orchestra (instantiated template)                                            |
| `prompts/TASK-nnnn.md`  | worker prompts composed by the maestro                                                                        |
| `tasks/TASK-nnnn.json`  | tasks in the DEVAI `task.schema.json` (2.0.0)                                                                 |
| `compositions.json`     | prompt composition ids (`PC-<16hex>`) per task                                                                |
| `reviews/`              | reviewer prompts, verdicts (JSON) and bridge records                                                          |
| `reports/`              | worker delivery reports                                                                                       |
| `evidence-*.json`       | payloads recorded through `devai evidence record`                                                             |
| `budget.json`           | token accounting per task and reviewer call                                                                   |
| `closure.json`          | phase-closure draft for `devai round close`                                                                   |
