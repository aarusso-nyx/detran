# rounds

**Authority:** Architect (Constitution Article 6).

Governed rounds of this repository (DEVAI 1.4.5). One round per front of the implementation
backlog (`docs/meta/agents/orchestra/waves.md`, ADR-0022). Evidence lives in
`record/proofs/chain.json` (machine-only); this folder holds the human-readable working papers.

| Round  | Front / scope                                     | State                                         |
| ------ | ------------------------------------------------- | --------------------------------------------- |
| R-0001 | definition round, WP-0, WP-T0 (evidence seq. 1–4) | closed by merges #27, #28, #29                |
| R-0002 | PEC port                                          | see `record/proofs/work/generic/R-0002.jsonl` |
| R-0003 | `dash-roles` — WP-D0                              | planned; maestro Fable 5.1                    |
| R-0004 | `param-store` — ADR-0021 / WP-A parameters        | planned; maestro GPT-5.6 Sol                  |

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
