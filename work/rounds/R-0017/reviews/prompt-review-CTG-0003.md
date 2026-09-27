# Prompt-review CTG-0003 - R-0017

Papel: Auditor externo (Claude Opus 5.5), Art. 18 DEVAI. Somente leitura na
worktree `/Users/aarusso/.codex/worktrees/local-stack/detran`; nao edite,
nao execute `git`, nao dispare workers. Responda apenas JSON valido com
`mode`, `round`, `verdict`, `findings` e `notes` (esquema abaixo).

Leia em ordem: `docs/meta/agents/orchestra/README.md` §4-5,
`docs/meta/agents/orchestra/reviewer-prompt.template.md`,
`work/rounds/R-0017/plan.md` (§Metas 6-7, §Tarefas, §Retomada),
`work/rounds/R-0017/prompts/TASK-0008.md`, `TASK-0009.md`, `TASK-0010.md`,
seus tres `tasks/TASK-*.json`, `compositions.json`,
`work/rounds/R-0017/contracts/CTG-0001.md` (portas/config),
`CTG-0002.md` (seed/smoke/externos), `.github/workflows/ci.yml` somente
gatilhos e jobs existentes, `docs/meta/knowledge-base/open-decisions-rait.md`
§R-0017 e `work/rounds/README.md` linha R-0017. Nao leia outras frentes.

Avalie exaustivamente se os prompts permitem trabalhar sem contexto desta
conversa; papeis Art. 6, leituras fechadas, fronteiras disjuntas, comandos
existentes, hashes PC, nenhum valor inventado/OD reaberta, nenhum teste ou
check obrigatorio afrouxado, nenhuma credencial real, aderencia a OD-R17-003
(job apenas `workflow_dispatch`). Em TASK-0008, `runtime-config.js` existe
em Portal/RAIT/Dashboard e TEAT mobile, nao em TEAT web. Em TASK-0009,
`stack:start` nao recompila `@detran/ui` nem `@detran/boat-mobile` e a
stack gerencia seu proprio PostGIS na porta 5432; o job nao deve criar
servico concorrente. Em TASK-0010, `PC-*` de fechamento ainda nao existe;
nao se pode inventar esse ID antes do `round close`.

Rubrica de `reviewer-prompt.template.md`: primeiro ciclo exaustivo,
`PASS` se nenhum high; `REVIEW` por high corrigivel; `FAIL` por violacao
canonica/Owner/ADR/Constituicao/fronteira. Cite arquivo e linha para cada
achado. Lows sao notas. PCs esperados: TASK-0008
`PC-7e1bd5688745a251`, TASK-0009 `PC-c48788ac3e508a63`, TASK-0010
`PC-c5fba4e27d0c0650`.

A ponte do primeiro ensaio recebeu JSON invalido porque aspas internas de
`claim` nao foram escapadas. Nesta tentativa, use frases sem aspas duplas
dentro de strings ou escape-as; a resposta precisa ser um unico objeto JSON
parseavel. O achado conhecido sobre o token de Estado foi corrigido para
`aberta`, fonte `tools/docs/state-index/check.mjs`.

Retorne somente:

```json
{
  "mode": "prompt-review",
  "round": "R-0017",
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [
    {
      "severity": "high | low",
      "item": 1,
      "file": "work/rounds/R-0017/prompts/TASK-0008.md",
      "line": 1,
      "claim": "...",
      "fix": "..."
    }
  ],
  "notes": []
}
```
