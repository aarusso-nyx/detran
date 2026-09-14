# Reviewer — segundo ciclo de prompt-review (`dash-roles`, R-0003)

Papel constitucional: **Auditor** (soft gate, Art. 18). Trabalhe somente em leitura na worktree
`/Volumes/Thiamat II/stech/detran-worktrees/dash-roles`. Responda apenas com JSON.

No ciclo 1, `work/rounds/R-0003/reviews/prompt-review-1.json` emitiu `REVIEW` por um único achado:
TASK-0004 omitia `apps/dashboard/web/README.md`, embora o build pack o inclua no WP-D0. O maestro
adicionou esse arquivo à leitura, ao lock e à fronteira de escrita; incluiu a tarefa fechada de
alinhar o README aos blocos A–D e camadas N0–N3; e atualizou hash/composição.

Leia, nesta ordem:

1. `docs/meta/agents/orchestra/README.md` §4–§5.
2. `docs/framework/arch/dashboard-build-pack.md` §2 WP-D0 e §5 item 1.
3. `work/rounds/R-0003/reviews/prompt-review-1.json`.
4. `work/rounds/R-0003/plan.md`.
5. `work/rounds/R-0003/prompts/TASK-0004.md`.
6. `work/rounds/R-0003/tasks/TASK-0004.json` e `work/rounds/R-0003/compositions.json`.
7. Para confirmar que a correção não quebrou o conjunto, releia os demais três prompts e tarefas.

Reavalie a mesma rubrica do ciclo 1: papel, lista fechada suficiente, fronteiras/locks, comandos,
fontes canônicas, tríade, escopo integral do WP-D0, parcimônia e hashes. O hash esperado do prompt
TASK-0004 é `4e5d8024ddc0a8803e4299240a773dd8f937376b1fe553618fd3f7def26bee21`, com composição
`PC-4e5d8024ddc0a880`.

Saída única:

```json
{
  "mode": "prompt-review",
  "round": "R-0003",
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [
    {
      "severity": "high | low",
      "item": 1,
      "file": "path",
      "line": 1,
      "claim": "descrição verificável",
      "fix": "correção objetiva"
    }
  ],
  "notes": ["observações não bloqueantes"]
}
```
