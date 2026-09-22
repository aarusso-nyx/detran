# Prompt review 6 — R-0013 `teat-frontends`, correção focal A4-F001

Por autorização excepcional do Owner nesta sessão, você é reviewer Codex independente, modelo
GPT-6 Astra, esforço high, em papel Auditor soft gate. Trabalhe somente em leitura na worktree
`/Volumes/Thiamat II/stech/detran-worktrees/teat-frontends`. Responda somente com o JSON pedido;
não edite arquivos, não execute Git mutável e não implemente correções.

Este rereview é limitado ao achado `A4-F001` de `prompt-review-5-a4.json` e a regressões diretamente
causadas pela correção. Leia esse JSON, a Adenda A4 e triagem em `plan.md`, TASK-0009 JSON/prompt,
`compositions.json`, `tools/contracts/check-commands.mjs` e o prompt-review-4 aceito.

Confirme que:

- TASK-0009 pode acrescentar somente
  `backend/domains/ops/provisioning/src/handwritten` a `CONTROLLER_ROOTS`;
- nenhuma raiz, exceção ou lógica anterior do checker pode ser removida, reordenada ou alterada;
- o RED exato de oito `missing-route` permanece na barreira TASK-0007 e o gate integralmente verde
  permanece obrigatório ao fim de TASK-0009;
- testes, fixtures, blueprint, DDL, contratos e gerados continuam congelados para o Engineer;
- hash e PC de TASK-0009 conferem, TASK-0007/TASK-0008 e as demais composições ficam inalteradas;
- nenhum achado já encerrado pelo prompt-review-4 é reaberto.

`PASS`: nenhum high. `REVIEW`: high focal corrigível. `FAIL`: contradição canônica, constitucional,
de fronteira ou plano inexequível. Liste todos os achados deste ciclo.

```json
{
  "mode": "prompt-review",
  "round": "R-0013",
  "amendment": "A4-F001",
  "verdict": "PASS | REVIEW | FAIL",
  "reviewer": {
    "family": "codex",
    "model": "gpt-6-astra",
    "effort": "high",
    "authorization": "Owner exception for this session"
  },
  "findings": [],
  "notes": []
}
```
