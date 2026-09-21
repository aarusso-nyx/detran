# Delivery review final extraordinário ciclo 4 — R-0013 / CTG-0002

Por autorização explícita do Owner, você é reviewer Codex, modelo GPT-6 Astra, esforço max, papel
Auditor soft gate. Trabalhe somente em leitura na worktree
`/Volumes/Thiamat II/stech/detran-worktrees/teat-frontends`; não edite arquivos nem use Git
mutável. Responda somente com o JSON pedido.

Esta é a última revisão autorizada. O escopo é F-008/F-009 do ciclo 3 e regressões diretas. Todos
os demais findings já passaram e só podem ser reabertos por regressão concreta.

## Leia

1. `work/rounds/R-0013/reviews/delivery-review-CTG-0002-3-extraordinary.json`.
2. O diff atual das 36 fichas corrigidas e de suas entradas no manifest.
3. As fontes fechadas citadas pelas 36 fichas, com atenção a RN-TEAT-105/RN-TEAT-116,
   `teat-frontends.md`, use cases, workflows e rules aplicáveis.

## Verifique

- F-008: `ait-print` distingue impressão no ato (assinatura manual do agente) de impressão
  diferida/reimpressão (identificação eletrônica, sem nova assinatura manual); preserva duas vias,
  confirmação intermediária, reimpressão no mesmo dia sem duplicidade, `failure_reason`, retenção
  local até o fim do dia e RN-TEAT-105/RN-TEAT-116.
- F-009: as 34 fichas antes parametrizadas agora têm contratos substantivos por tela e por fonte.
  Reproduza normalização que remova identidade, título, rota, uxCode, grupo, papéis, metadados,
  navegação, objetivo, critérios/referências e spans de código: os 51 contratos TEAT devem
  permanecer distintos. Os cinco BOAT podem permanecer uniformes por fronteira.
- `ait-reject` contém somente rejeição formal: motivo/base legal, autoridade, arquivamento,
  consultabilidade e guardas próprios; não contém saneamento, correção ou cancelamento.
- Faça amostragem substantiva dos 34 contratos contra fontes, não aceite diferença cosmética.
- Fora do escopo: nenhuma regressão em i18n, matrizes, diagrama, BOAT, navegação, deltas,
  `source_pending`, parâmetros ou bookkeeping. Os 126 hashes do manifest devem conferir.
- Gates independentes: format, KB 675/446, publish 201, parameters 34/34,
  verifier 89/18/27/0 e `git diff --check`.

## Saída

```json
{
  "mode": "delivery-review",
  "round": "R-0013",
  "ctg": "CTG-0002",
  "cycle": 4,
  "extraordinary": true,
  "final_authorized_cycle": true,
  "verdict": "PASS | REVIEW | FAIL",
  "reviewer": {
    "family": "codex",
    "model": "gpt-6-astra",
    "effort": "max",
    "authorization": "Owner exception for this session and final extraordinary cycle 4"
  },
  "findings": [],
  "notes": []
}
```
