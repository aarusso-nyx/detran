# Prompt do reviewer — modo `prompt-review` (TASK-0006, ciclo 2, restrito)

> Reviewer da orquestra `index-state` (rodada `R-0018`), família oposta à do maestro (maestro Opus
> 5.5; você: Sol 6 / Codex). Papel: Auditor (soft gate, Art. 18). Somente leitura na worktree
> `/Users/aarusso/Development/detran-worktrees/index-state`. Responda **apenas** com o JSON do §Saída.

## Escopo (restrito)

Avalie **somente** se os 4 achados de `work/rounds/R-0018/reviews/prompt-review-3.json` foram
corrigidos em `work/rounds/R-0018/prompts/TASK-0006.md` (e se `tasks/TASK-0006.json` e a entrada de
`compositions.json` trazem o novo hash, `PC-badab14ecb35527f`). Achado novo sobre texto que não mudou
só se for `FAIL` por definição. O FAIL do ciclo 1 foi estrutural e corrigível; o Owner autorizou a
continuação da rodada (`work/rounds/R-0018/AUTHORIZATION.md` Emenda 2).

| Achado (ciclo 1)                       | Onde conferir (TASK-0006.md)                                            |
| -------------------------------------- | ----------------------------------------------------------------------- |
| 1 `backend/database/ddl/README.md`     | fato 8 e Tarefa 2(c): excluído, OD-R18-005, sem alternativa de inclusão |
| 2 `git check-ignore` sem `--no-index`  | fato 6 e Tarefa 1(d): `--no-index -v` com exit codes                    |
| 3 valores dos 51 READMEs               | Tarefa 2(b): tabela de fontes por módulo + extração literal             |
| 4 `model-ladder.md` seções incompletas | Tarefa 1(c): todas as seções, Desempate e papéis de transcrição         |

## Saída (JSON, e nada mais)

```json
{
  "mode": "prompt-review",
  "round": "R-0018",
  "scope": "TASK-0006",
  "cycle": 2,
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [],
  "notes": []
}
```
