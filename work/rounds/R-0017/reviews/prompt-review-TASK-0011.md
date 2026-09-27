# Reviewer — `prompt-review` TASK-0011

> Familia oposta, `claude-opus-5-5`, papel Auditor (Art. 18), somente
> leitura na worktree `/Users/aarusso/.codex/worktrees/local-stack/detran`.
> Responda somente um objeto JSON estrito; strings sem quebras literais.

Leia apenas `docs/meta/agents/orchestra/README.md` §4–6,
`work/rounds/R-0017/plan.md` A6/A7 e ultima Triagem,
`work/rounds/R-0017/contracts/CTG-0002.md` C-02-02…06,
`work/rounds/R-0017/reviews/delivery-review-CTG-0002.json`,
`work/rounds/R-0017/tasks/TASK-0011.json` e
`work/rounds/R-0017/prompts/TASK-0011.md`.

Verifique: papel Inspector exclusivo de testes; fronteira de leitura/escrita
fechada; sensores que observam CLI e processo, nao so regex; nenhum Docker
real; nenhum teste relaxado; comandos existentes; vermelho esperado antes
do Engineer; PC e modelo/effort corretos. O prompt trata os achados altos
do ciclo 1 sem decidir novos valores de produto. `PASS` sem achado high,
`REVIEW` com high corrigivel, `FAIL` so contradicao canonica ou violacao de
fronteira. Primeiro ciclo exaustivo; cite arquivo e linha.

```json
{
  "mode": "prompt-review",
  "round": "R-0017",
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [
    {
      "severity": "high | low",
      "item": 1,
      "file": "work/rounds/R-0017/prompts/TASK-0011.md",
      "line": 1,
      "claim": "descricao verificavel",
      "fix": "correcao precisa"
    }
  ],
  "notes": ["observacoes curtas"]
}
```
