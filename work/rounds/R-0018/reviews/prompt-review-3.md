# Prompt do reviewer — modo `prompt-review` (ciclo 1 para TASK-0006)

> Reviewer da orquestra `index-state` (rodada `R-0018`), família oposta à do maestro (maestro Opus
> 5.5 / Claude Code; você: Sol 6 / Codex). Papel: Auditor (soft gate, Art. 18). Somente leitura na
> worktree `/Users/aarusso/Development/detran-worktrees/index-state`. Responda **apenas** com o JSON do
> §Saída.

## Contexto mínimo (leia nesta ordem)

1. `docs/meta/agents/orchestra/README.md` §4 e §5; `docs/meta/agents/README.md` §Regras comuns
2. `work/rounds/R-0018/plan.md` (Metas 5-9, §Tarefas TASK-0005…0011, §Decisões M1–M5)
3. `work/rounds/R-0018/prompts/00-maestro.md` §0 (locks e proibições), §3, §4
4. O prompt em revisão: `work/rounds/R-0018/prompts/TASK-0006.md`; a tarefa
   `work/rounds/R-0018/tasks/TASK-0006.json`; a entrada TASK-0006 de `compositions.json`
5. Para conferir fatos citados: `docs/meta/agents/orchestra/{waves,model-ladder}.md`,
   `docs/framework/arch/*-build-pack.md`, `docs/start/index.md`, `BUILD-PLAN.md`, `.gitignore`,
   `.prettierignore`, `CLAUDE.md`, `AGENTS.md`, READMEs citados, `git`/`gh` (leitura)

Escopo: **somente** o prompt TASK-0006 (Architect, contratos do CTG-0002 e do CTG-0003). Os prompts
TASK-0005, 0007…0011 serão escritos depois dos contratos e revisados em outro ciclo — a ausência deles
não é achado. O CTG-0001 já foi entregue (delivery-review PASS) e não está em revisão.

## Rubrica

Itens 1, 2, 3, 4, 5, 6, 10 e 12 de `docs/meta/agents/orchestra/reviewer-prompt.template.md`
(papel; leitura fechada e suficiente; fronteira; critérios executáveis; nada inventado; tríade;
ADR/OD; parcimônia e modelo).

## Veredito

PASS (nenhum `high`) · REVIEW (`high` corrigível) · FAIL (contradição canônica, Owner, ADR,
Constituição, fronteira). Primeiro ciclo: exaustivo.

## Saída (JSON, e nada mais)

```json
{
  "mode": "prompt-review",
  "round": "R-0018",
  "scope": "TASK-0006",
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [
    {
      "severity": "high | low",
      "item": 2,
      "file": "…",
      "line": 1,
      "claim": "…",
      "fix": "…"
    }
  ],
  "notes": []
}
```
