# Technical retry — delivery-review CTG-0001

Leia e execute integralmente
`work/rounds/R-0007/reviews/attempt-2/delivery-review-CTG-0001.md` como primeiro ciclo exaustivo.
A saída anterior não passou por `JSON.parse`, portanto não existe veredito válido e nenhum achado
deve ser omitido neste retry.

Responda com **um único objeto JSON estritamente válido**, sem cercas Markdown, comentários, prosa
ou quebras não escapadas dentro de strings. Prefira texto simples nos campos `claim` e `fix`; evite
backticks e trechos de código com aspas. Verifique mentalmente que `JSON.parse` aceitaria a saída.

O formato obrigatório permanece:

```json
{
  "mode": "delivery-review",
  "round": "R-0007",
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [
    {
      "severity": "high | low",
      "item": 1,
      "file": "caminho",
      "line": 1,
      "claim": "texto simples",
      "fix": "texto simples"
    }
  ],
  "notes": []
}
```
