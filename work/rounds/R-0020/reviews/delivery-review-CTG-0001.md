# Revisão da entrega — CTG-0001 da R-0020 `devai-sensors`

Você é o reviewer da outra família: **Claude Code Opus 5.5**, papel constitucional
**Auditor**. Trabalhe somente em leitura na worktree
`/Users/aarusso/.codex/worktrees/devai-sensors/detran`. Responda apenas JSON no
formato abaixo, sem cerca Markdown. A entrega é CTG-0001: TASK-0001 Architect →
TASK-0002 Inspector → TASK-0003 Engineer. O maestro e os workers são Codex.

## Leitura fechada

1. `docs/meta/agents/orchestra/README.md` §4–§5 e
   `docs/meta/agents/orchestra/reviewer-prompt.template.md` (rubrica e veredito).
2. `work/rounds/R-0020/plan.md` (critérios e triagem) e
   `work/rounds/R-0020/contracts/CTG-0001.md` (C-01-01…10, C-01-T1/T2).
3. `work/rounds/R-0020/reports/TASK-0001.md`, `TASK-0002.md`, `TASK-0003.md`;
   `work/rounds/R-0020/reviews/prompt-review-2.json` (prompt-review PASS).
4. `tools/devai/tests/baseline.test.mjs`, `tools/devai/baseline.mjs`, `package.json`,
   `work/rounds/R-0020/baseline.md` e, para conferir valores brutos,
   `work/rounds/R-0020/baseline.json`.
5. Diff completo da entrega está **staged**, ainda sem commit: execute somente
   `git diff --cached --stat` e `git diff --cached` nesta worktree. O diff inclui
   scaffold, relatórios e prompts dos CTGs futuros já aprovados no prompt-review;
   julgue a entrega de CTG-0001 e registre qualquer contradição grave que apareça
   nos arquivos comuns. Os 14 arquivos em `reports/` foram conferidos contra
   `git ls-files`.

## Evidência de aceitação apresentada pelo maestro

- Baseline oficial executada em clone descartável limpo no HEAD
  `c848723c1ee9053233b7e08732c5b80bbe06d625`, anterior à primeira
  implementação publicada da R-0020. JSON SHA-256:
  `a2f056562c63514cb9e4e6aa986b9fa941e369e694b0b3c0b1df3e408ca86fe3`;
  Markdown SHA-256: `f65220db9268d72a05a577ca4371606815f62b2560236b4d25ffecc21f617602`.
- Segunda medição do mesmo clone e fontes: JSON e Markdown idênticos byte a byte.
  Estado Git do clone antes/depois: limpo. O medidor recusa flags DEVAI de escrita
  e verifica estado antes/depois de cada invocação.
- 25 membros DEVAI; 15 `ok: true`, 10 recusas/falhas brutas preservadas. Scorecard:
  45 células, 0 PASS, 43 UNKNOWN, 2 N/A. Sensores: 59 kinds, 49 de efeito read.
  Rodadas: R-0003…R-0019 enumeradas, 16 com PC no HEAD de abertura; R-0017
  inativa/sem PC então. Provas: 119 linhas, 67 ancoradas, 52 órfãs listadas.
  Tarefas: 151 válidas, 143 inválidas, 0 ilegíveis. PRs e commits F2/F3 sem
  fonte canônica permanecem `source_pending`.
- Teste Inspector RED antes da implementação; após implementação,
  `pnpm devai:test` 13/13 PASS. `pnpm check` exit 0 (inclui format, stack,
  blueprints, contratos, typecheck, builds e testes). `pnpm format:check`
  repetido após última edição do plano: PASS. `git diff --cached --check`: PASS.
- Tentativa 1 do Engineer tinha validação parcial de TASK e não consultava
  `round status`; tentativa 2 corrigiu essas rotas, mas não interpretava
  `result.value`. A escalada para Sol 6 corrigiu o parser. Esta triagem está
  registrada em `plan.md` e no relatório TASK-0003. Nenhum teste foi relaxado.

## Rubrica e veredito

Use os itens 1, 4–7, 10–11 da rubrica do template, com arquivo e linha nos
achados. Primeiro ciclo **exaustivo** do delivery-review deste CTG: liste todos
os achados corrigíveis de severidade high. `PASS` se não houver high; `REVIEW`
se houver high corrigível dentro do contrato; `FAIL` apenas por contradição
canônica, decisão do Owner, ADR, Constituição ou fronteira de escrita.

Formato exato de saída:

```json
{
  "mode": "delivery-review",
  "round": "R-0020",
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [
    {
      "severity": "high | low",
      "item": 4,
      "file": "tools/devai/baseline.mjs",
      "line": 1,
      "claim": "...",
      "fix": "..."
    }
  ],
  "notes": []
}
```
