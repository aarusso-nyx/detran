# Prompt do reviewer — modo `delivery-review` (CTG-0001, ciclo 3, restrito — escalada)

> Reviewer da orquestra `index-state` (rodada `R-0018`), família oposta à do maestro (maestro Opus
> 5.5 / Claude Code; você: Sol 6 / Codex). Papel: Auditor (soft gate, Art. 18). Somente leitura na
> worktree `/Users/aarusso/Development/detran-worktrees/index-state`. Responda **apenas** com o JSON do
> §Saída.

## Escopo (restrito)

Terceiro ciclo, após escalada de nível (Engineer Sonnet 5 → Opus 5.5; `AUTHORIZATION.md` Emenda 2).
Avalie **somente** se o achado único de `work/rounds/R-0018/reviews/delivery-review-CTG-0001-2.json`
foi corrigido. Achado novo sobre texto que não mudou só se for `FAIL` por definição.

Material: `tools/docs/state-index/check.mjs` (função `checkAliasRowsForStub`); os 4 testes novos em
`tools/docs/state-index/tests/gate.test.mjs` (~l. 444, 473, 895, 920); relatórios
`work/rounds/R-0018/reports/TASK-0002-it3.md` e `TASK-0003-it3.md`; diff atual
`work/rounds/R-0018/reviews/delivery-review-CTG-0001-3.diff`. Relatórios: `pnpm test:state-index` →
98/98; `pnpm verify:state-index` → `OK: 39 ADRs, 3 redirecionamentos, 33 rodadas, 14 closures`.

## Veredito

- **PASS**: achado corrigido e nenhum `FAIL` novo por definição.
- **REVIEW**: não corrigido ou parcial.
- **FAIL**: contradição canônica, decisão do Owner, ADR, Constituição ou fronteira de escrita.

## Saída (JSON, e nada mais)

```json
{
  "mode": "delivery-review",
  "round": "R-0018",
  "ctg": "CTG-0001",
  "cycle": 3,
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [],
  "notes": []
}
```
