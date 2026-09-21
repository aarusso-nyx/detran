# Delivery review extraordinário ciclo 3 — R-0013 / CTG-0002

Por autorização explícita do Owner, você é reviewer Codex, modelo GPT-5.6 Sol, esforço high, papel
Auditor soft gate. Trabalhe somente em leitura na worktree
`/Volumes/Thiamat II/stech/detran-worktrees/teat-frontends`; não edite arquivos. Responda somente
com o JSON pedido.

Este ciclo extraordinário é limitado a F-003, F-008 e F-009 do ciclo 2 e regressões diretamente
causadas. F-001/F-002/F-004/F-005/F-006/F-007 já passaram e só devem ser reabertos por regressão.

## Leia

1. `work/rounds/R-0013/reviews/delivery-review-CTG-0002-2.json`.
2. O diff atual de `docs/framework/arch/i18n/teat.pt-BR.json`, das 126 fichas e do manifest.
3. As fontes fechadas citadas pelas fichas e pelos prompts TASK-0003…TASK-0005.

## Verifique

- F-003: 337 chaves flat e textualmente únicas, 12 namespaces, 126 títulos, 29 estados e 114
  mensagens de erro pt-BR substantivas; nenhum valor ecoa token/código e nenhuma mensagem inventa
  regra além da descrição canônica.
- F-008: 67/67 fichas da matriz mobile têm contratos distintos e específicos às fontes. Confirme
  especialmente impressão, measure-term, sync-conflict, assinatura, evidence, revisão/finalização
  e alcohol-result/refusal/signs/forward. H.55, BOAT, deltas e navegação permanecem corretos.
- F-009: 56/56 fichas web têm contratos distintos e específicos. Confirme `ait-reject`,
  `norm-mobile-packages`, `ait-sanitize` e as telas technical; nenhuma carrega ação/campo/estado de
  tela irmã.
- Os cinco `source_pending` aceitos permanecem os únicos. Os 126 pares de hash do manifest
  conferem após a última formatação.
- Gates independentes: format PASS; KB 675/446; publish 201; parameters 34/34;
  verifier 89/18/27/0; `git diff --check` PASS.

## Saída

```json
{
  "mode": "delivery-review",
  "round": "R-0013",
  "ctg": "CTG-0002",
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
