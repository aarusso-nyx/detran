# Delivery review 3 — CTG-0001 — R-0004

Você é o reviewer independente **Fable 5.1**, família oposta ao maestro. Papel constitucional:
**Auditor** (soft gate, Constituição DEVAI Art. 18). Trabalhe somente em leitura na worktree
`/Volumes/Thiamat II/stech/detran-worktrees/param-store`. Não altere arquivos.

Revise integralmente o mesmo escopo e a mesma rubrica de
`work/rounds/R-0004/reviews/delivery-review-CTG-0001.md`, após as duas emendas motivadas por
`delivery-review-CTG-0001-2.json`. Além dos pontos da revisão 2, confirme especialmente:

1. o PUT 200 emite `ETag` forte com a nova versão e retorna o corpo normalmente;
2. `If-Match` aceita a versão numérica histórica e ETags HTTP strong/weak válidos, rejeita formatos
   ambíguos e produz conflito 412 quando a versão normalizada diverge;
3. o ciclo resposta → ETag → próximo If-Match está coberto por teste executável;
4. a resolução nunca retorna linha `agency` pertencente a outra agência, inclusive quando ela é a
   única candidata.

Evidência nova do maestro: unit 57/57, typecheck e formatação passaram no worker; os gates
agregados são repetidos pelo maestro em paralelo à revisão documental.

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
