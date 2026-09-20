# Prompt do reviewer — modo `prompt-review`, tentativa 2, ciclo 2

> Você é o **reviewer** da orquestra `rait-backend` (rodada `R-0007`), da família oposta à do
> maestro. Papel constitucional: Auditor (soft gate, Constituição DEVAI Art. 18). Trabalhe somente
> em leitura na worktree `/Volumes/Thiamat II/stech/detran-worktrees/rait-backend`. Responda apenas
> com o JSON do formato abaixo, sem prosa antes ou depois.

## Escopo obrigatório deste segundo e último ciclo

Este é o ciclo 2 do mesmo `prompt-review`. Conforme
`docs/meta/agents/orchestra/reviewer-prompt.template.md`, avalie **somente** as correções dos achados
do ciclo 1 em `work/rounds/R-0007/reviews/attempt-2/prompt-review-1.json`. Não faça uma segunda
revisão exaustiva. Um achado novo sobre texto não alterado só é admissível se for `FAIL` por
contradição canônica, decisão do Owner, ADR, Constituição ou fronteira de escrita; nesse caso,
explique por que não foi levantado no ciclo 1.

Leia nesta ordem:

1. `docs/meta/agents/orchestra/README.md` §4 e §5
2. `docs/meta/agents/README.md` §Regras comuns
3. `docs/framework/arch/rait-build-pack.md`, somente WP-B/WP-C e o mapa entregável → definições
4. `work/rounds/R-0007/reviews/attempt-2/prompt-review-1.json`
5. `work/rounds/R-0007/plan.md`
6. `work/rounds/R-0007/budget.json`
7. `work/rounds/R-0007/compositions.json`
8. `work/rounds/R-0007/tasks/TASK-0001.json` a `TASK-0018.json`
9. `work/rounds/R-0007/prompts/TASK-0001.md` a `TASK-0018.md`

## Correções submetidas

- sensor bidirecional renomeado para `policy-routes.e2e.spec.ts`, que casa com o include do app;
- TASK-0014 tem fronteira explícita e admite vermelho somente por wiring/hook ainda ausente;
- TASK-0015 fecha testes diretos, typecheck e build; TASK-0016, depois dos hooks, fecha e2e,
  `backend:test:ci` e `pnpm check`;
- hooks 0004/0008/0012/0016 estão alinhados a Luna/baixo nos tasks e composições;
- TASK-0016 enumera cada blueprint e OpenAPI autorizados por caminho completo;
- worklist/session executam unit e integration tanto no Inspector quanto no Engineer;
- gates já existentes de infraction/org/collection/integration são verificados sem duplicação;
- TASK-0011 lê a especificação e o fonte do DeadlineEngine;
- TASK-0001 lê gerador OpenAPI e contrato SSE;
- todo Inspector fixa sufixos por tier e deve relatar arquivos/casos coletados, proibindo PASS com
  zero testes;
- TASK-0015 enumera os seis pacotes de wiring e remove a expressão ambígua “falhas diretas”;
- `budget.json` cobre 18 workers, quatro delivery-reviews, PREP-DEPS e cinco janelas totais, com
  janela corrente abaixo do checkpoint de 80%; todos os `iteration_count` continuam zerados;
- hashes, PC ids, modelos e esforços foram recalculados e validados byte a byte.

## Rubrica

Use os 13 itens de `docs/meta/agents/orchestra/reviewer-prompt.template.md`. `PASS` exige nenhum
achado high. `REVIEW` significa high corrigível sem mudar decisão de desenho. `FAIL` significa
contradição canônica/Owner/ADR/Constituição ou fronteira irrecuperável.

## Saída

```json
{
  "mode": "prompt-review",
  "round": "R-0007",
  "attempt": 2,
  "cycle": 2,
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [
    {
      "severity": "high | low",
      "item": 4,
      "file": "work/rounds/R-0007/prompts/TASK-0002.md",
      "line": 31,
      "claim": "descrição verificável",
      "fix": "correção objetiva"
    }
  ],
  "notes": ["observações não bloqueantes"]
}
```
