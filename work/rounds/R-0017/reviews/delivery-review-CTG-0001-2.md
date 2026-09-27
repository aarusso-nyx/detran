# Reviewer — `delivery-review` CTG-0001, ciclo 2

> Frente `local-stack`, R-0017. Papel constitucional: **Auditor** (Art. 18),
> modelo `claude-opus-5-5` da familia oposta. Somente leitura em
> `/Users/aarusso/.codex/worktrees/local-stack/detran`. Responda apenas JSON
> estrito no formato abaixo, sem Markdown.

## Fontes fechadas

1. `work/rounds/R-0017/reviews/delivery-review-CTG-0001.json` inteiro:
   oito achados altos e quatro baixos do primeiro ciclo.
2. `work/rounds/R-0017/contracts/CTG-0001.md` inteiro, inclusive Adendas 1
   e 2; `work/rounds/R-0017/plan.md` secoes Criterios/Adendas/Triagem.
3. `work/rounds/R-0017/reports/TASK-0002-delivery-fix.md` e
   `TASK-0003-delivery-fix.md`; `tools/stack/characterization.test.mjs`,
   `tools/stack/revision.test.mjs`, `tools/detran-stack.sh` e
   `tools/stack/senatran-mock.compose.yml`.
4. O diff do codigo corrigido contra `HEAD` so para `tools/detran-stack.sh`,
   `tools/stack/`, `backend/database/apply.sh` e `package.json`. Nao inclua
   outras frentes. O commit `470730d60fa5a07fab486d6570a1ed2457c35f0e`
   foi a adocao verbatim anterior a revisao.

`pnpm test:stack` foi repetido independentemente pelo maestro: 42/42,
nenhum skip/todo. `pnpm check` esta em andamento; nao o trate como PASS
ate haver saida final. O branch ainda nao integrou `origin/main`, portanto
o check adicional de R-0018 sera verificado apos o merge.

## Rubrica restrita

Verifique **somente** a resolucao dos doze achados do ciclo 1 e qualquer
regressao diretamente causada pelas correcoes. Para cada achado, confira
comportamento, contrato e sensor, nao apenas a presenca de texto. Em
especial: overrides rejeitados antes de runtime; ambiente `env -i` sem
credenciais externas; validacao de perfil/provider/URL; --no-mock persistido
e sem probe; cleanup dos PIDs e mock em falha; nome Compose `app` e override;
status real com URLs da tabela; caracterizacao sem DDL; versao Compose
comportamental; papeis completos; timeout DB parametrizado; pureza de config.

`PASS` se os achados altos anteriores estao sanados e nenhum alto novo foi
introduzido diretamente pela correcao. `REVIEW` para alto corrigivel sem
mudar decisao do Owner; `FAIL` so para contradicao canonica ou violacao de
fronteira. Achados baixos nao bloqueiam. Cite arquivo e linha para qualquer
achado ainda aberto. Nao reabra itens nao tocados do ciclo 1.

## Saida

```json
{
  "mode": "delivery-review",
  "round": "R-0017",
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [
    {
      "severity": "high | low",
      "item": 2,
      "file": "tools/detran-stack.sh",
      "line": 100,
      "claim": "descricao verificavel",
      "fix": "correcao precisa"
    }
  ],
  "notes": ["observacoes nao bloqueantes"]
}
```
