# Prompt review 4 — R-0013 `teat-frontends`, Adenda estrutural A3

Por autorização excepcional do Owner nesta sessão, você é reviewer Codex, modelo GPT-5.6 Sol,
esforço high, em papel Auditor soft gate. Trabalhe somente em leitura na worktree
`/Volumes/Thiamat II/stech/detran-worktrees/teat-frontends`. Responda somente com o JSON pedido;
não edite nenhum arquivo.

Este review sucede `prompt-review-3=FAIL` e a autorização explícita do Owner para a Adenda A3.
A revisão é limitada aos dois achados pós-rebase e a regressões diretamente causadas pela correção.

## Leia nesta ordem

1. `work/rounds/R-0013/reviews/prompt-review-3.json`.
2. `work/rounds/R-0013/plan.md`, especialmente Adenda A3.
3. `work/rounds/R-0013/tasks/TASK-0007.json` a `TASK-0009.json`.
4. `work/rounds/R-0013/prompts/TASK-0007.md` a `TASK-0009.md`.
5. `work/rounds/R-0013/compositions.json`.
6. `docs/meta/adr/README.md` e os nomes `docs/meta/adr/ADR-*.md` para confirmar o próximo número.

## Verificações obrigatórias

- ADR-0028 é o próximo identificador livre e não há ADR ativo de provisionamento ainda.
- Toda a superfície ativa do plano, metadata e prompts TASK-0007…0009 usa exatamente
  `docs/meta/adr/ADR-0028-provisionamento-operacional-offline.md`; menções a ADR-0025 são apenas
  histórico explícito da migração/revisão.
- Toda a superfície ativa usa exatamente `backend/database/ddl/21-ops-provisioning.sql`; não há
  referência operacional residual a DDL 19.
- Hash/PC de todos os 18 prompts continua válido e TASK-0007…0009 concordam com compositions.
- A alteração não reabre nenhum dos sete achados aceitos no review 3.

## Veredito

`PASS`: nenhum high. `REVIEW`: high corrigível sem nova decisão estrutural. `FAIL`: contradição
canônica, constitucional, de fronteira ou plano inexequível. Liste todos os achados deste ciclo.

## Saída

```json
{
  "mode": "prompt-review",
  "round": "R-0013",
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
