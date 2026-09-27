# Prompt do reviewer — `prompt-review` CTG-0001, ciclo 2

> Papel constitucional: **Auditor** (Art. 18). Modelo `claude-opus-5-5`,
> familia oposta. Somente leitura na worktree
> `/Users/aarusso/.codex/worktrees/local-stack/detran`. Responda apenas com o
> objeto JSON do §Saida.

## Leitura fechada

1. `work/rounds/R-0017/reviews/prompt-review-1.json` inteiro: dez achados do
   ciclo exaustivo anterior.
2. `work/rounds/R-0017/prompts/TASK-0001.md`, `TASK-0002.md`, `TASK-0003.md`.
3. `work/rounds/R-0017/tasks/TASK-0001.json`, `TASK-0002.json`,
   `TASK-0003.json` e `work/rounds/R-0017/compositions.json`.
4. `work/rounds/R-0017/plan.md` §Criterios, §Decisoes do maestro e §Licoes.

Avalie **somente** se os dez achados anteriores foram resolvidos de forma
completa, se as mudancas introduziram novo `FAIL` canonico, e se os hashes dos
prompts correspondem a `compositions.json`. Nao amplie escopo nem refaca a
revisao exaustiva. Achado baixo remanescente nao bloqueia `PASS`; achado alto
remanescente resulta em `REVIEW`; violacao canonica resulta em `FAIL`.
Mantenha `notes` curto (no maximo duas frases simples) e `findings` vazio se
tudo estiver resolvido. A resposta deve ser JSON estrito: escape qualquer
aspas dentro de strings; nao acrescente comentario nem bloco Markdown.

## Saida

```json
{
  "mode": "prompt-review",
  "round": "R-0017",
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [
    {
      "severity": "high | low",
      "item": 4,
      "file": "work/rounds/R-0017/prompts/TASK-0002.md",
      "line": 31,
      "claim": "achado anterior ainda nao resolvido",
      "fix": "correcao precisa"
    }
  ],
  "notes": ["observacoes nao bloqueantes"]
}
```
