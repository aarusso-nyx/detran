# Delivery review ciclo 2 — R-0013 / CTG-0002

Por autorização excepcional do Owner nesta sessão, você é reviewer Codex, modelo GPT-5.6 Sol,
esforço high, papel Auditor soft gate. Trabalhe somente em leitura na worktree
`/Volumes/Thiamat II/stech/detran-worktrees/teat-frontends`; não edite arquivos. Responda somente
com o JSON pedido.

Este ciclo reavalia integralmente F-001…F-009 do ciclo 1 e regressões diretamente causadas.

## Leia

1. `work/rounds/R-0013/reviews/delivery-review-CTG-0002.json`.
2. `work/rounds/R-0013/prompts/TASK-0002.md` a `TASK-0006.md`.
3. O diff atual completo das 126 fichas, diagrama, catálogo i18n e manifest contra HEAD.
4. As matrizes e fontes fechadas citadas pelos prompts e pelas fichas corrigidas.

## Verifique

- F-001: os 126 pares de hash do manifest conferem com os bytes finais formatados.
- F-002: existem 126 chaves flat `teat.screens.<screenId>.title`, todas com títulos pt-BR
  canônicos, inclusive os três deltas.
- F-003: todas as 337 chaves são flat sob as 12 namespaces; há 114 códigos de erro e folhas reais
  de estados/readiness/sync/forms/legal/navigation/a11y/provisioning, sem placeholders vazios.
- F-004: o diagrama representa nominalmente as 56 telas e as quatro rotas operacionais sem fichas.
- F-005: as 16 superfícies de sinistro declaram propriedade BOAT e limitam TEAT a vínculo/extensão.
- F-006: a sequência completa de transições da matriz é preservada, inclusive repetições.
- F-007: os três deltas usam `/<screenId>` e navegação `source_pending` sem alvos inventados.
- F-008: mobile tem contratos/ACs específicos onde as fontes fecham comportamento; confira
  especialmente assinatura (três resultados, motivos, testemunha, AC-TEAT-004-1…5), H.55,
  revisão/finalização, impressão, medidas, alcoolemia, sync e evidências.
- F-009: web tem contratos específicos; confira `ait-sanitize`, `ait-reject` e
  `norm-mobile-packages` contra as fontes, além de uma amostra abrangente dos demais grupos.
- `source_pending` residual limita-se às cinco lacunas reais declaradas. Nenhuma regra, prazo,
  payload ou texto legal foi inventado e nenhuma regressão foi introduzida.
- Gates independentes do maestro: format PASS; KB 675/446; publish 201; parameters 34/34;
  verifier 89/18/27/0; diff-check PASS.

## Saída

`PASS` somente sem finding bloqueante; `REVIEW` lista correções concretas; `FAIL` bloqueia.

```json
{
  "mode": "delivery-review",
  "round": "R-0013",
  "ctg": "CTG-0002",
  "cycle": 2,
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
