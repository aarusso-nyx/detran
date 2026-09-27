# Prompt do reviewer — modo `delivery-review` (CTG-0002)

> Reviewer da orquestra `index-state` (rodada `R-0018`), família oposta à do maestro (maestro Opus
> 5.5 / Claude Code; você: Sol 6 / Codex). Papel: Auditor (soft gate, Art. 18). Somente leitura na
> worktree `/Users/aarusso/Development/detran-worktrees/index-state`. Responda **apenas** com o JSON do
> §Saída.

## Contexto mínimo (leia nesta ordem)

1. `docs/meta/agents/orchestra/README.md` §4; `docs/meta/agents/README.md` §Regras comuns
2. `work/rounds/R-0018/plan.md` (Metas 5, 7, 8, 9; §Critérios; §Triagem T8)
3. `work/rounds/R-0018/contracts/CTG-0002.md` (contrato; critérios C-02-01…32)
4. Relatórios: `work/rounds/R-0018/reports/TASK-0006.md`, `TASK-0005.md`, `TASK-0007.md`
5. Diff: `work/rounds/R-0018/reviews/delivery-review-CTG-0002.diff` (base `7d6bd665` = cabeça do
   CTG-0001, mesclado em `main` como `289a072f`) e os patches novos
   `work/rounds/R-0018/proposals/CLAUDE.md.patch`, `AGENTS.md.patch` (não aplicados: OD-R18-003
   pendente)

Particularidades:

- A worktree também contém, **não rastreados**, os artefatos do maestro e o contrato/prompt do
  CTG-0003; os READMEs do CTG-0003 **não** estão presentes (T8: apagados; serão redespachados depois
  do commit do CTG-0002). Julgue só o diff acima.
- T8: TASK-0005 executou `git checkout --`/`rm` fora da fronteira (violação registrada). Verifique
  que o diff do CTG-0002 não contém nenhum efeito dessa ação (nenhum arquivo fora do §8 do contrato)
  e que as entregas de TASK-0005 e TASK-0007 cumprem o contrato. Se considerar que a violação exige
  outro tratamento, diga qual.
- Critérios do `plan.md` sobre `git check-ignore -v <relatório>` e `git check-ignore -v dist` não
  provam o que pretendem (TASK-0006, "Fora do escopo"); serão registrados como **não cumpridos** no
  closure, com a prova substituta C-02-20…23.
- Verificações que você pode reproduzir: C-02-01…C-02-24, C-02-26, C-02-27, `pnpm verify:state-index`,
  `pnpm format:check`, `pnpm docs:kb:check`.

## Rubrica

Itens 1, 4, 5, 7, 10 e 11 de `docs/meta/agents/orchestra/reviewer-prompt.template.md`, mais: (a)
fronteira de escrita (contrato §8); (b) `CLAUDE.md`/`AGENTS.md` intocados; (c) nenhuma ADR aceita
emendada; (d) `docs/start/` sem link para `draft` ou `docs/dev/`.

## Veredito

PASS · REVIEW · FAIL. Primeiro ciclo: exaustivo.

## Saída (JSON, e nada mais)

```json
{
  "mode": "delivery-review",
  "round": "R-0018",
  "ctg": "CTG-0002",
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [
    {
      "severity": "high | low",
      "item": 5,
      "file": "…",
      "line": 1,
      "claim": "…",
      "fix": "…"
    }
  ],
  "notes": []
}
```
