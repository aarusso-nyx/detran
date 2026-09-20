# Delivery review extraordinário ciclo 3 — R-0013 / CTG-0001

Por autorização explícita do Owner, você é reviewer Codex, modelo GPT-5.6 Sol, esforço high, papel
Auditor soft gate. Trabalhe somente em leitura na worktree
`/Volumes/Thiamat II/stech/detran-worktrees/teat-frontends`; não edite arquivos.

Esta exceção é limitada ao finding F-003 do ciclo 2 e a regressões diretamente causadas pela sua
correção.

## Leia

1. `work/rounds/R-0013/reviews/delivery-review-CTG-0001-2.json`.
2. `work/rounds/R-0013/prompts/TASK-0001.md`.
3. O diff e o conteúdo atual completo de
   `docs/framework/product/domains/inf/teat/workflows/WF-TEAT-002.md`.
4. `docs/framework/arch/teat-build-pack.md` §5 item 9 e `docs/meta/knowledge-base/steering.md` §H
   para OD-T07.

## Verifique

- A transição de expiração declara que o subintervalo não utilizado retorna à faixa como
  `disponivel` durante a reconciliação, sob OD-T07, sem fonte pendente.
- `ATIVA→ESGOTADA` continua exatamente em `next_number > end_number` sob OD-T07.
- A única pendência restante é o risco técnico de constraints de exclusão de intervalo; ela não
  reabre o comportamento de negócio adotado.
- Nenhuma regressão direta. Gates independentes: format PASS, KB 549/446, publish 201 e diff-check
  PASS.

## Saída

```json
{
  "mode": "delivery-review",
  "round": "R-0013",
  "ctg": "CTG-0001",
  "cycle": 3,
  "extraordinary": true,
  "verdict": "PASS | REVIEW | FAIL",
  "reviewer": {
    "family": "codex",
    "model": "gpt-5.6-sol",
    "effort": "high",
    "authorization": "Owner exception for this session and extraordinary cycle 3"
  },
  "findings": [],
  "notes": []
}
```
