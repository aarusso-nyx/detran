# Prompt do reviewer — modo `prompt-review` (ciclo 2, restrito)

> Você é o **reviewer** da orquestra `index-state` (rodada `R-0018`), família oposta à do maestro
> (maestro Opus 5.5 / Claude Code; você: Sol 6 / Codex). Papel: Auditor (soft gate, Art. 18).
> Somente leitura na worktree `/Users/aarusso/Development/detran-worktrees/index-state`. Responda
> **apenas** com o JSON do §Saída.

## Escopo (restrito — ajuste R-0006)

Este é o **segundo** ciclo. Avalie **somente** se cada um dos 8 achados de
`work/rounds/R-0018/reviews/prompt-review-1.json` foi corrigido. Um achado novo sobre texto que não
mudou só é admitido se for `FAIL` por definição (contradição canônica, decisão do Owner, ADR,
Constituição ou fronteira de escrita) e deve dizer por que não foi levantado no ciclo 1.

Correções a conferir:

| Achado (ciclo 1)             | Onde conferir                                                                                                    |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| 1–4 ordem de leitura         | `prompts/TASK-000{1,2,3,4}.md` §Leitura obrigatória, item 0                                                      |
| 5 `waves.md` em TASK-0001    | `prompts/TASK-0001.md` §Leitura obrigatória, item 2a                                                             |
| 6 fronteira de TASK-0004     | `prompts/TASK-0004.md` §Pode tocar (último item) e §Não pode tocar                                               |
| 7 `node --test` em TASK-0003 | `tasks/TASK-0003.json` `acceptance_commands` (globs; Node 24 os expande)                                         |
| 8 caracterização → contrato  | `plan.md` §Decisões do maestro M4; `prompts/TASK-0003.md` §Tarefa item 4; `prompts/TASK-0004.md` §Leitura item 2 |

Também conferir: `compositions.json` com os hashes dos prompts atuais; `plan.md` §Bloqueios B1;
`AUTHORIZATION.md` Emenda 1 (decisão do Owner que autoriza este ciclo).

## Veredito

- **PASS**: os 8 achados corrigidos e nenhum `FAIL` novo por definição.
- **REVIEW**: algum achado do ciclo 1 não corrigido ou corrigido de forma incompleta.
- **FAIL**: contradição canônica, decisão do Owner, ADR, Constituição ou fronteira de escrita.

## Saída (JSON, e nada mais)

```json
{
  "mode": "prompt-review",
  "round": "R-0018",
  "cycle": 2,
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
  "notes": ["…"]
}
```
