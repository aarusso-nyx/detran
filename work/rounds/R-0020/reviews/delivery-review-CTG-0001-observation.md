# Auditor — revisão da observação pós-merge do CTG-0001 de R-0020

Você é Claude Code `claude-opus-5-5`, reviewer da família oposta, papel
constitucional **Auditor**. Trabalhe somente em leitura na worktree
`/Users/aarusso/.codex/worktrees/devai-sensors/detran`. Não execute verbos
`--write` nem edite arquivos. Responda apenas JSON puro, sem cerca Markdown.

O [PR #150](https://github.com/aarusso-nyx/detran/pull/150) do CTG-0001 foi
mesclado com CI verde e delivery-review PASS no SHA exato
`2a0f7ce2bb713499c53b673a5a2516041518db92`. O maestro ensaiou em clone
descartável e executou `devai audit observe --at` nesse SHA. A execução local
gerou `EV-66cbf1e5a90c4e04`, cinco artefatos sob
`.devai/state/audit-observations/2a0f7ce2bb713499c53b673a5a2516041518db92/`
e uma atualização de `record/proofs/chain.json`. `evidence verify --scope chain`
deu `valid`, head
`64d5e95b9831934596a0a8209d3e553d185fd2e9ee54dc47b4a12a60d7444951`.

O Owner autorizou nesta retomada até quatro ciclos de review por item e orçamento
de 2250000 tokens por janela, checkpoint 1800000. Essa decisão está em
`AUTHORIZATION-RETAKE-2026-09-28.md`, `budget.json` e `plan.md` M11. Ela não
modifica critérios, gates ou a exigência de PASS e CI verde antes do merge.

## Leitura e escopo

1. Leia `.devai/pin/constitution.md`, `AGENTS.md`,
   `docs/meta/agents/orchestra/reviewer-prompt.template.md`,
   `work/rounds/R-0020/plan.md`, o contrato CTG-0001 e
   `reviews/delivery-review-CTG-0001-2.json`.
2. Verifique o commit local `d4c3a3bb` e o diff completo de
   `origin/main..HEAD` (inclui o checkpoint `e5500a9a`), mais as alterações
   staged de autorização suplementar e plano. Confira que a observação está
   vinculada ao SHA mesclado exato e foi emitida por DEVAI, sem edição manual.
3. Leia `status.json`, `assessment.json`, `backlog.json`, `scorecard.json` e,
   seletivamente, `inventory.json`; verifique a âncora correspondente em
   `record/proofs/chain.json`. O inventário grande está no disco, sem necessidade
   de transcrição integral.
4. Verifique que nenhum PC, `record.md` ou `close-state.jsonl` histórico mudou,
   que R-0017 permanece selada e que a R-0020 não foi declarada fechada. A
   observação não promove readiness (`readiness_promoting: false`).
5. Julgue somente esta entrega pós-merge e a autorização suplementar. O PR #151
   da R-0021 está aberto e toca `record/proofs/chain.json`: registre esse lock,
   mas não atribua ao presente diff mudanças ainda não mescladas.

Use a rubrica do template, com arquivo/linha para achados. `PASS` sem high;
`REVIEW` para high corrigível; `FAIL` só por contradição canônica ou violação de
fronteira. Formato exato:

```json
{
  "mode": "delivery-review",
  "round": "R-0020",
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [
    {
      "severity": "high | low",
      "item": 4,
      "file": "work/rounds/R-0020/plan.md",
      "line": 1,
      "claim": "...",
      "fix": "..."
    }
  ],
  "notes": []
}
```
