# Prompt-review R-0022 — tarefas novas TASK-0021 e TASK-0022 (modo `prompt-review`)

> Reviewer da família oposta (Codex Sol 6, nível grande). Papel: **Auditor** (Art. 18), somente
> leitura na worktree `/Users/aarusso/Development/detran/.claude/worktrees/r-0022-stynx-sse-tenancy-c949d9`.
> Responda **apenas** com o JSON do §Saída.

Duas tarefas novas, criadas por decisões do Owner de 2026-09-29 (`work/rounds/R-0022/AUTHORIZATION.md`
§Adendas B5/B6; `plan.md` §Adendas A4/A5; registro `docs/meta/knowledge-base/open-decisions-rait.md`
§C-0002 "R-0022 — decisões do Owner"):

- `work/rounds/R-0022/prompts/TASK-0021.md` — Inspector, provas de paridade M-06-P da assinatura (parte 1
  antes de TASK-0009, vermelhas; parte 2 depois, retirada da classe P e adaptação do _fixture_), pela
  OD-R22-12 (adenda de critério adotada pelo Owner).
- `work/rounds/R-0022/prompts/TASK-0022.md` — Engineer, remoção de 10 dependências `@stynx-nyx/*`
  declaradas sem import (OD-R22-38), lista fechada conferida pelo maestro.

Primeiro ciclo exaustivo **restrito a estes dois prompts** e aos seus `tasks/*.json`. Os 20 prompts
anteriores têm PASS (`reviews/prompt-review-3.json`) e não estão em revisão.

Rubrica (cite arquivo e linha): papel e Art. 10 (Engineer não toca teste; Inspector não toca
produção); leitura fechada suficiente; fronteira de escrita e locks (TASK-0021 × TASK-0012/TASK-0009;
TASK-0022 × TASK-0004); critérios executáveis com coleta efetiva (`--passWithNoTests=false`,
`run test` nos apps web — `plan.md` A2.3) e comandos existentes nos `package.json`; nenhum valor
inventado; coerência com as decisões do Owner (OD-R22-06/07/12/13/14/33/38/40); PC/hash em
`compositions.json`.

Saída (JSON, e nada mais):

```json
{
  "mode": "prompt-review",
  "round": "R-0022",
  "cycle": 4,
  "scope": ["TASK-0021", "TASK-0022"],
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [
    {
      "severity": "high | low",
      "item": 1,
      "file": "…",
      "line": 1,
      "claim": "…",
      "fix": "…"
    }
  ],
  "notes": ["…"]
}
```
