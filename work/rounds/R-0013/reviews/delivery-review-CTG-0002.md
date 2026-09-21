# Delivery review — R-0013 / CTG-0002

Por autorização excepcional do Owner nesta sessão, você é reviewer Codex, modelo GPT-5.6 Sol,
esforço high, papel Auditor soft gate. Trabalhe somente em leitura na worktree
`/Volumes/Thiamat II/stech/detran-worktrees/teat-frontends`; não edite arquivos nem use Git com
efeito mutável. Responda somente com o JSON pedido.

## Leia

1. `work/rounds/R-0013/prompts/TASK-0002.md` a `TASK-0006.md`.
2. `work/rounds/R-0013/reports/TASK-0002.md` a `TASK-0006.md`.
3. O diff completo não staged contra HEAD, excluindo somente bookkeeping do round ao julgar o
   produto.
4. As fontes fechadas citadas nos prompts, especialmente as três matrizes, `teat-frontends.md`,
   `teat-error-catalog.md`, OD-P46 e o catálogo de parâmetros.

## Verifique

- As três matrizes são byte-for-byte e hashes/proveniência conferem; `.prettierignore` exclui
  somente essas capturas imutáveis.
- Há exatamente 70 fichas mobile e 56 web permitidas, sem extras; cada ficha respeita identidade,
  uxCode, rota, papéis e navegação da matriz, os deltas D-01/D-04/D-05 e a fronteira BOAT.
- Não há regra, prazo, estado, payload ou texto legal inventado; lacunas são explicitamente
  `source_pending`; prazos vêm do backend e measured/considered permanecem juntos.
- O diagrama representa 56 telas + quatro rotas operacionais, sem transformar as quatro rotas em
  fichas de produto.
- O manifest contém exatamente as 126 entradas novas, totaliza 746 fontes e 675 artefatos, sem
  omissão ou hash inconsistente.
- O catálogo pt-BR usa somente as 12 namespaces OD-P46, cobre as 126 fichas por 123 IDs únicos,
  usa `{x}` e não `{{x}}`; a allowlist tem uma linha por namespace para ambos os apps.
- Somente os três gerados autorizados mudaram após o gerador. Aceite as contagens live comprovadas
  pelo preflight e gates: 34 testes, 89 entradas, 18 flags e 27 namespaces.
- Gates independentes do maestro: format PASS; KB 675/446; publish 201; parameters 34/34;
  verifier 89/18/27/0; diff-check PASS.

## Veredito e saída

`PASS` libera commit. `REVIEW` lista todas as correções concretas. `FAIL` bloqueia/escalada.

```json
{
  "mode": "delivery-review",
  "round": "R-0013",
  "ctg": "CTG-0002",
  "verdict": "PASS | REVIEW | FAIL",
  "reviewer": {
    "family": "codex",
    "model": "gpt-5.6-sol",
    "effort": "high",
    "authorization": "Owner exception for this session"
  },
  "findings": [],
  "notes": []
}
```
