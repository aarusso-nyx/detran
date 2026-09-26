# Prompt do reviewer — modo `delivery-review` (CTG-0001, ciclo 2, restrito)

> Reviewer da orquestra `index-state` (rodada `R-0018`), família oposta à do maestro (maestro Opus
> 5.5 / Claude Code; você: Sol 6 / Codex). Papel: Auditor (soft gate, Art. 18). Somente leitura na
> worktree `/Users/aarusso/Development/detran-worktrees/index-state`. Responda **apenas** com o JSON do
> §Saída.

## Escopo (restrito — ajuste R-0006)

Segundo ciclo. Avalie **somente** se os 3 achados de
`work/rounds/R-0018/reviews/delivery-review-CTG-0001.json` foram corrigidos. Achado novo sobre texto
que não mudou só se for `FAIL` por definição, dizendo por que não foi levantado no ciclo 1.

Material:

- Correções: `tools/docs/state-index/check.mjs` (iteração 2 do Engineer) e os 8 testes novos em
  `tools/docs/state-index/tests/gate.test.mjs` (iteração 2 do Inspector; nomes com C-01-05 ×3,
  C-01-15, C-01-16, C-01-09, C-01-11 ×2).
- Relatórios: `work/rounds/R-0018/reports/TASK-0002-it2.md`, `TASK-0003-it2.md`.
- Diff completo atual: `work/rounds/R-0018/reviews/delivery-review-CTG-0001-2.diff` (compare com
  `delivery-review-CTG-0001.diff` para ver o delta).
- Decisão do maestro (Architect) registrada no relatório `TASK-0002-it2.md`: ID exibido divergente em
  linha da série `law/adr` é **C-01-09** (leitura literal do contrato §6.5/§7.2).
- Os testes criam diretórios temporários (`mkdtemp`); se o sandbox negar, os relatórios registram
  `node --test` → 94/94 e `pnpm verify:state-index` → `OK: 39 ADRs, 3 redirecionamentos, 33
rodadas, 14 closures`; pode conferir o código e as asserções por leitura.

## Veredito

- **PASS**: os 3 achados corrigidos e nenhum `FAIL` novo por definição.
- **REVIEW**: algum achado não corrigido ou corrigido parcialmente.
- **FAIL**: contradição canônica, decisão do Owner, ADR, Constituição ou fronteira de escrita.

## Saída (JSON, e nada mais)

```json
{
  "mode": "delivery-review",
  "round": "R-0018",
  "ctg": "CTG-0001",
  "cycle": 2,
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [
    {
      "severity": "high | low",
      "item": 7,
      "file": "…",
      "line": 1,
      "claim": "…",
      "fix": "…"
    }
  ],
  "notes": ["…"]
}
```
