# Prompt-review R-0022 — efeitos da Adenda B12 (modo `prompt-review`)

> Reviewer da família oposta (Codex Sol 6, nível grande). Papel: **Auditor** (Art. 18), somente
> leitura na worktree `/Users/aarusso/Development/detran/.claude/worktrees/r-0022-stynx-sse-tenancy-c949d9`.
> Responda **apenas** com o JSON do §Saída.

Decisões do Owner sobre a conformidade real da 1.5.0 (`work/rounds/R-0022/AUTHORIZATION.md` §Adenda
B12; `docs/meta/knowledge-base/open-decisions-rait.md` §C-0002 OD-R22-43…57; `plan.md` §Adendas A6;
conformidade em `work/campaigns/C-0002-stynx-upstream-spec.md` §8.2 e `contracts/CTG-0003/0004/0005.md`,
escritos por TASK-0005). Prompts afetados: `work/rounds/R-0022/prompts/TASK-0006.md`, `TASK-0007.md`,
`TASK-0008.md`, `TASK-0019.md` (reescritos) e `TASK-0024.md`, `TASK-0025.md` (novos, Inspector), com os
respectivos `tasks/*.json`. TASK-0015 passou a `checkpoint`.

Primeiro ciclo exaustivo **restrito a esses seis prompts e JSONs**. Rubrica (cite arquivo e linha):

1. papel e Art. 10 (Engineer nunca toca teste; só Inspector cria/edita/remove);
2. tríade: os casos novos de TASK-0024/0025/0019 vermelhos antes do Engineer, sem `it.fails`/`skip`,
   com controle positivo nos critérios de ausência; os casos adendados por TASK-0025 são só os da §6 de
   CTG-0004 e cada um cita a OD que o autoriza;
3. coerência com B12/A6: outbox fora (nenhuma referência a `@stynx-nyx/outbox`/`outbox.events` em
   TASK-0007); CTG-0005 só TEAT web (nenhum arquivo de RAIT/DASHBOARD/Portal web em fronteira); OD-R22-45,
   47…57 aplicados onde cabem;
4. fronteiras de escrita fechadas e sem sobreposição entre tarefas paralelas (TASK-0024 ∥ TASK-0025 ∥
   TASK-0019; `r22-sse-tenancy.support.ts` só acréscimo); pré-condições e ordem (TASK-0006 ← 0024;
   TASK-0007 ← 0006, 0019, 0025; TASK-0008 ← 0019);
5. critérios executáveis com coleta efetiva (forma `run test --passWithNoTests=false` na web, A2.3);
6. RLS/tenancy sem dispensa; nenhum _shim_ novo nem cópia STYNX (A1/OD-R22-02);
7. PC/hash em `compositions.json` iguais aos prompts.

## Saída

```json
{
  "mode": "prompt-review",
  "round": "R-0022",
  "cycle": 7,
  "scope": [
    "TASK-0006",
    "TASK-0007",
    "TASK-0008",
    "TASK-0019",
    "TASK-0024",
    "TASK-0025"
  ],
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
