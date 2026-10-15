# Prompt-review R-0022 — ciclo 2 (modo `prompt-review`, restrito às correções)

> Você é o **reviewer** da orquestra `stynx-sse-tenancy` (rodada `R-0022`), família oposta à do
> maestro (Codex Sol 6, nível grande). Papel: **Auditor** (soft gate, Art. 18). Somente leitura na
> worktree `/Users/aarusso/Development/detran/.claude/worktrees/r-0022-stynx-sse-tenancy-c949d9`.
> Responda **apenas** com o JSON do §Saída.

## Regra do ciclo

O ciclo 1 (`work/rounds/R-0022/reviews/prompt-review-1.json`) deu FAIL com 17 achados `high`. O Owner
autorizou tratar esse FAIL como corrigível e fazer até 2 ciclos restritos às correções
(`work/rounds/R-0022/AUTHORIZATION.md` §Adenda B1). Avalie **somente** se cada um dos 17 achados foi
corrigido. Achado novo sobre texto que não mudou só é admitido se for `FAIL` por definição
(contradição canônica, decisão do Owner, ADR, Constituição ou fronteira de escrita) e deve dizer por
que não foi levantado no ciclo 1. Texto **novo** introduzido pelas correções (ex.: TASK-0019,
`plan.md` §A2.1) pode receber achados, restritos ao que as correções introduziram.

## Material

- `work/rounds/R-0022/reviews/prompt-review-1.json` (os 17 achados).
- `work/rounds/R-0022/plan.md` §Adendas A2 e **A2.1** (correções).
- `work/rounds/R-0022/prompts/TASK-*.md` (19, com a nova TASK-0019), `tasks/*.json`,
  `compositions.json`, `AUTHORIZATION.md`.
- `git diff a8e7c382 -- work/rounds/R-0022` mostra tudo o que mudou desde o ciclo 1.

## Mapa achado → correção (do maestro; confira nos arquivos)

| #   | Achado (ciclo 1)                                         | Correção                                                                                                                                                                                                            |
| --- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | TASK-0007 permitia ao Engineer remover casos de teste    | "Pode tocar" só produção; "Não pode tocar" proíbe todo `*.spec.ts`; retirada passa à nova TASK-0019 (Inspector), pré-condição de 0007                                                                               |
| 2   | TASK-0008 permitia remover specs/stubs                   | idem; só a inversão C-05 do `it.fails` do _bearer_; stubs e specs do transporte vão para TASK-0019                                                                                                                  |
| 3   | TASK-0012: `it.fails` de paridade invertido pelo maestro | nenhum `it.fails` nas caracterizações de migração; todo caso válido nas duas fases (TASK-0011/0013/0016 exigem isso no contrato; TASK-0012/0014/0017 o proíbem); retirada de specs antigos só pelo Inspector do CTG |
| 4   | TASK-0002: braço sem _shim_ em `it.fails`                | A/B força as duas ordens de registro no módulo de teste; válido antes (shim) e depois (middleware); sem _flag_; nenhum `it.fails` (TASK-0001, TASK-0002, TASK-0005, TASK-0006 ajustados)                            |
| 5   | TASK-0002: B→A sem `role_app_backend` explícito          | contexto e tarefa exigem a operação sob `role_app_backend` com tenant do contexto, owner só fixtures; asserção no teste e critério `grep role_app_backend`                                                          |
| 6   | TASK-0013: leitura por busca dinâmica                    | lista fechada de 34 arquivos de produção (inventário do maestro) na leitura; proibido buscar outros                                                                                                                 |
| 7   | TASK-0003/0008 sem coleta efetiva                        | comandos por arquivo com `--passWithNoTests=false` e "≥ 1 teste coletado" nos prompts e nos `acceptance_commands`                                                                                                   |
| 8   | filtros `@detran/{…}-web`                                | comandos escritos por extenso, por app                                                                                                                                                                              |
| 9   | TASK-0012 sem os specs novos                             | nomes fixos no prompt e no plano (§A2.1); comandos por arquivo na tarefa e em TASK-0009                                                                                                                             |
| 10  | TASK-0014 sem os specs novos                             | idem, em TASK-0014 e TASK-0015                                                                                                                                                                                      |
| 11  | TASK-0017 sem os specs novos                             | idem, em TASK-0017 e TASK-0018                                                                                                                                                                                      |
| 12  | TASK-0004 sem TASK-0003                                  | pré-condições de despacho no prompt e em `tags` (`after:TASK-0002/0003/0012/0014/0017`)                                                                                                                             |
| 13  | TASK-0016 sem TASK-0013                                  | `upstream_task_id` = TASK-0013 e pré-condição no prompt                                                                                                                                                             |
| 14  | TASK-0015 sem TASK-0006                                  | pré-condições 0004, 0005, 0006, 0014                                                                                                                                                                                |
| 15  | TASK-0018 sem TASK-0015                                  | pré-condições 0004, 0005, 0015, 0017                                                                                                                                                                                |
| 16  | TASK-0007 sem `MOD-app-module`                           | lock acrescentado; TASK-0005 declara sim/não; serialização em O8                                                                                                                                                    |
| 17  | TASK-0010 só com TASK-0018                               | pré-condições 0005–0009, 0015, 0018, 0019                                                                                                                                                                           |

O schema DEVAI instalado (`task.schema.json` 1.5.6) valida as 19 tarefas; os hashes e PCs de
`compositions.json` foram recalculados sobre os prompts finais.

## Veredito

- **PASS**: os 17 corrigidos e nenhum `high` novo admissível.
- **REVIEW**: algum corrigível resta.
- **FAIL**: contradição canônica/Owner/ADR/Constituição ou fronteira violada.

## Saída (JSON, e nada mais)

```json
{
  "mode": "prompt-review",
  "round": "R-0022",
  "cycle": 2,
  "verdict": "PASS | REVIEW | FAIL",
  "resolved": [1, 2],
  "findings": [
    {
      "severity": "high | low",
      "item": 1,
      "file": "…",
      "line": 1,
      "claim": "…",
      "fix": "…",
      "refers_to_cycle1": 1
    }
  ],
  "notes": ["…"]
}
```
