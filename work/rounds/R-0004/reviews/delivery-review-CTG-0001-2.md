# Delivery review 2 — CTG-0001 — R-0004

Você é o reviewer independente **Fable 5.1**, família oposta ao maestro. Papel constitucional:
**Auditor** (soft gate, Constituição DEVAI Art. 18). Trabalhe somente em leitura na worktree
`/Volumes/Thiamat II/stech/detran-worktrees/param-store`. Não altere arquivos.

Revise integralmente o mesmo escopo e a mesma rubrica de
`work/rounds/R-0004/reviews/delivery-review-CTG-0001.md`, após a emenda motivada pela primeira
tentativa. Confirme especialmente:

1. `OpsParameterError` usa o `StynxError` oficial e o filtro STYNX entrega status, código e contexto
   canônicos no HTTP;
2. não resta cache de replay local entre tenants; a idempotência durável vem de `@Action('update')`
   por `Idempotent()` e do store PostgreSQL registrado no app;
3. `surface` é derivada da chave e um payload divergente falha antes da transação;
4. qualquer linha `legal_readonly=true` da mesma chave/surface/tenant bloqueia o PUT antes da
   seleção mutável por escopo/agência, com SQL parametrizado e RLS;
5. os testes negativos novos realmente exercitam os quatro pontos acima.

Evidência nova do maestro: unit 51/51, typecheck, integração PostgreSQL/RLS 1/1,
`contracts:check`, decorators, RLS-DDL e formatação passaram.

`PASS`: nenhum high. `REVIEW`: ao menos um high corrigível. `FAIL`: contradição de autoridade,
ADR ou Constituição.

Sua resposta inteira deve ser **um único objeto JSON válido**. O primeiro caractere deve ser `{` e
o último `}`. Não use cercas Markdown, introdução nem conclusão.

{
"mode": "delivery-review",
"round": "R-0004",
"coupled_task_group": "CTG-0001",
"verdict": "PASS | REVIEW | FAIL",
"findings": [
{
"severity": "high | low",
"item": 1,
"file": "path",
"line": 1,
"claim": "descrição verificável",
"fix": "correção concreta"
}
],
"notes": []
}
