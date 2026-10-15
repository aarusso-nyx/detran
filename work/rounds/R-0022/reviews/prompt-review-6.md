# Prompt-review R-0022 — tarefa nova TASK-0023 (modo `prompt-review`)

> Reviewer da família oposta (Codex Sol 6, nível grande). Papel: **Auditor** (Art. 18), somente
> leitura na worktree `/Users/aarusso/Development/detran/.claude/worktrees/r-0022-stynx-sse-tenancy-c949d9`.
> Responda **apenas** com o JSON do §Saída.

Tarefa nova criada pela decisão do Owner B11 (`work/rounds/R-0022/AUTHORIZATION.md` §Adenda B11;
`plan.md` §Bloqueios B5): `work/rounds/R-0022/prompts/TASK-0023.md` e `tasks/TASK-0023.json` — Engineer
adapta ao middleware de contexto do core 1.5.0 (UPS-TEN-01 (b)) os trechos locais que assumiam
"`hasActiveContext()` ⇒ tenant/ator presentes" (lista fechada de 25 arquivos de produção), sem mudar
comportamento, sem editar teste e sem remover o _shim_ (CTG-0003), até a caracterização ficar verde
sobre 1.5.0. Evidência do problema: `work/rounds/R-0022/reports/pin-1.5.0-characterization.log`.

Primeiro ciclo exaustivo **restrito a este prompt e ao seu JSON**. Rubrica (cite arquivo e linha):
papel e Art. 10 (Engineer não toca teste); leitura fechada suficiente (a lista de 25 arquivos vem de
`grep hasActiveContext()` do maestro); fronteira de escrita e lock `MOD-app-module` (nenhuma outra
tarefa da rodada em curso); critérios executáveis e com coleta efetiva; fail-closed (nunca seguir com
`tenantId` indefinido); proibição de _shim_ novo/cópia STYNX (A1/OD-R22-02); coerência com a decisão
B11 e com a ordem de prova (caracterização verde sobre 1.5.0 com o _shim_ presente antes da publicação
do pin); PC/hash em `compositions.json`.

```json
{
  "mode": "prompt-review",
  "round": "R-0022",
  "cycle": 6,
  "scope": ["TASK-0023"],
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
