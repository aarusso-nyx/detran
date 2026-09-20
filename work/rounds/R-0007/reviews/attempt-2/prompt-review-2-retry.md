# Prompt do reviewer — modo `prompt-review`, tentativa 2, ciclo 2, retry técnico

> Você é o **reviewer** da orquestra `rait-backend` (rodada `R-0007`), Claude Opus da família
> oposta à do maestro. Papel constitucional: Auditor (soft gate, Constituição DEVAI Art. 18).
> Trabalhe somente em leitura na worktree
> `/Volumes/Thiamat II/stech/detran-worktrees/rait-backend`. Responda apenas com um objeto JSON válido,
> sem markdown ou prosa antes/depois. Escape todas as aspas que aparecerem em strings JSON.

## Natureza deste retry

A primeira chamada do ciclo 2 não produziu JSON válido e a ponte a rejeitou; portanto não houve
veredito válido nem abertura de terceiro ciclo. Leia
`work/rounds/R-0007/reviews/attempt-2/prompt-review-2-invalid.md`. O único fragmento recuperável da
saída apontava a impossibilidade de TASK-0015 atualizar dependências sem instalar/atualizar links.
Essa inconsistência foi corrigida com PREP-WIRING exclusivo do maestro antes de TASK-0015.

Este continua sendo o ciclo 2 do mesmo `prompt-review`. Conforme
`docs/meta/agents/orchestra/reviewer-prompt.template.md`, avalie somente as correções dos achados de
`work/rounds/R-0007/reviews/attempt-2/prompt-review-1.json` e a correção PREP-WIRING acima. Um achado
novo sobre texto não alterado só é admissível se for `FAIL` por contradição canônica, decisão do
Owner, ADR, Constituição ou fronteira de escrita, explicando por que não apareceu no ciclo 1.

## Leitura fechada

1. `docs/meta/agents/orchestra/README.md` §4 e §5
2. `docs/meta/agents/README.md` §Regras comuns
3. `docs/framework/arch/rait-build-pack.md`, somente WP-B/WP-C e mapa entregável → definições
4. `work/rounds/R-0007/reviews/attempt-2/prompt-review-1.json`
5. `work/rounds/R-0007/reviews/attempt-2/prompt-review-2-invalid.md`
6. `work/rounds/R-0007/plan.md`
7. `work/rounds/R-0007/budget.json`
8. `work/rounds/R-0007/compositions.json`
9. `work/rounds/R-0007/tasks/TASK-0001.json` a `TASK-0018.json`
10. `work/rounds/R-0007/prompts/TASK-0001.md` a `TASK-0018.md`

Verifique em particular que PREP-WIRING roda `pnpm --filter @detran/app add` com seis pins
`workspace:*`, deixa somente o pnpm atualizar manifesto/lock/links, ocorre depois de TASK-0014 e
antes de TASK-0015, e que TASK-0015 já não pode tocar nem instalar esses artefatos.

Use os 13 itens de `docs/meta/agents/orchestra/reviewer-prompt.template.md`. `PASS` exige nenhum
achado high. `REVIEW` significa high corrigível sem mudar decisão de desenho. `FAIL` significa
contradição canônica/Owner/ADR/Constituição ou fronteira irrecuperável.

Responda exatamente neste formato JSON:

```json
{
  "mode": "prompt-review",
  "round": "R-0007",
  "attempt": 2,
  "cycle": 2,
  "technical_retry": true,
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [],
  "notes": []
}
```
