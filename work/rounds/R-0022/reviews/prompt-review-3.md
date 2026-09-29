# Prompt-review R-0022 — ciclo 3 (último; restrito às correções do ciclo 2)

> Você é o **reviewer** da orquestra `stynx-sse-tenancy` (rodada `R-0022`), família oposta (Codex
> Sol 6, nível grande). Papel: **Auditor** (Art. 18). Somente leitura na worktree
> `/Users/aarusso/Development/detran/.claude/worktrees/r-0022-stynx-sse-tenancy-c949d9`. Responda
> **apenas** com o JSON do §Saída.

## Regra do ciclo

Último ciclo autorizado pelo Owner (`AUTHORIZATION.md` §Adenda B1: até 2 ciclos restritos). O ciclo 2
(`reviews/prompt-review-2.json`) confirmou os 17 achados do ciclo 1 como resolvidos e levantou 3
achados `high`. Avalie **somente** se esses 3 foram corrigidos e se o texto **introduzido** por
essas correções (TASK-0020 nova, mudanças em TASK-0005, TASK-0008, TASK-0019, contexto comum,
`plan.md` §A2.2) tem achado `high`. Achado sobre texto não alterado só se for `FAIL` por definição, e
com explicação de por que não apareceu antes. Diferença desde o ciclo 2: `git diff c8f79285 --
work/rounds/R-0022` (depois do commit deste ciclo).

## Mapa achado → correção

| #   | Achado (ciclo 2)                                                          | Correção                                                                                                                                                                                                                                                                                                                            |
| --- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | TASK-0008: Engineer ainda invertia o `it.fails` do _bearer_ (Art. 10)     | Art. 10 sem exceção (contexto comum de todos os prompts); TASK-0008 não toca nenhum teste; critério dela = "exatamente uma falha, a do `it.fails` que passou"; **TASK-0020** (Inspector, depois de 0008) inverte e prova verde; `acceptance_commands` de 0008 não incluem o spec do TEAT; 0010 depende de 0020                      |
| 2   | TASK-0005: retirada com a marca "mecanismo interno" sem C-01-nn           | removida a marca em TASK-0005 e nos contratos de migração (TASK-0011/0013/0016); sem correspondente C-nn, o caso não se retira (contexto comum)                                                                                                                                                                                     |
| 3   | TASK-0019: stubs importados por specs de fachadas/páginas e `facade.stub` | TASK-0005 fixa em `CTG-0005.md` a API pública preservada do serviço SSE de cada app e a lista dos 16 consumidores (inventário no prompt); TASK-0019 cria dublês de serviço `<app>-sse.fake.ts`, migra os consumidores preservando casos e contagens, e só então retira os stubs; lê os 16 consumidores; ordem O5 = 0005 → 0019 → O6 |

## Saída (JSON, e nada mais)

```json
{
  "mode": "prompt-review",
  "round": "R-0022",
  "cycle": 3,
  "verdict": "PASS | REVIEW | FAIL",
  "resolved": [1, 2, 3],
  "findings": [
    {
      "severity": "high | low",
      "item": 1,
      "file": "…",
      "line": 1,
      "claim": "…",
      "fix": "…",
      "refers_to_cycle2": 1
    }
  ],
  "notes": ["…"]
}
```
