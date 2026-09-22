# Prompt review 5 — R-0013 `teat-frontends`, Adenda estrutural A4

Por autorização excepcional do Owner nesta sessão, você é reviewer Codex independente, modelo
GPT-6 Astra, esforço high, em papel Auditor soft gate. Trabalhe somente em leitura na worktree
`/Volumes/Thiamat II/stech/detran-worktrees/teat-frontends`. Responda somente com o JSON pedido;
não edite arquivos, não execute Git mutável e não implemente correções.

Este review extraordinário sucede `prompt-review-4=PASS` e é limitado à contradição descoberta ao
executar TASK-0007: o Architect não pode criar `src/handwritten/**`, enquanto o checker exige o
mounting dessas rotas para ficar integralmente verde. Verifique se a Adenda A4 torna a cadeia
TASK-0007 → TASK-0008 → TASK-0009 executável sem enfraquecer os gates ou ampliar autoridade.

## Leia nesta ordem

1. `work/rounds/R-0013/plan.md`, especialmente Adenda A4 e a triagem de TASK-0007.
2. `work/rounds/R-0013/tasks/TASK-0007.json` a `TASK-0009.json`.
3. `work/rounds/R-0013/prompts/TASK-0007.md` a `TASK-0009.md`.
4. `work/rounds/R-0013/compositions.json`.
5. `tools/contracts/check-commands.mjs` e os contratos atuais de
   `BP-OPS-PROVISIONING-001`, apenas para confirmar a semântica do checker.
6. `work/rounds/R-0013/reviews/prompt-review-4.json` para preservar o baseline aceito.

## Verificações obrigatórias

- TASK-0007 mantém a proibição de handwritten e aceita somente exatamente oito `missing-route`,
  com zero achado adicional de schema, código de erro, operação ou contrato.
- TASK-0008 continua exclusivamente Inspector RED e não ganha autoridade de implementação.
- TASK-0009 recebe explicitamente o gate verde `pnpm contracts:check` após implementar e montar as
  oito rotas, sem poder editar testes, blueprint, DDL, contrato ou gerados.
- Os hashes e `prompt_composition_id` de TASK-0007 e TASK-0009 conferem byte a byte; TASK-0008 e as
  demais composições permanecem inalteradas.
- A4 não reabre achados já encerrados pelo prompt-review 4 e não enfraquece qualquer gate final.

## Veredito

`PASS`: nenhum high. `REVIEW`: high corrigível sem nova decisão estrutural. `FAIL`: contradição
canônica, constitucional, de fronteira ou plano inexequível. Liste todos os achados deste ciclo.

## Saída

```json
{
  "mode": "prompt-review",
  "round": "R-0013",
  "amendment": "A4",
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
