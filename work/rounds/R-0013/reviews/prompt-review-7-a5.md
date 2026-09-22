# Prompt review 7 — R-0013 CTG-0003, Adenda A5

Por autorização excepcional do Owner nesta sessão, você é reviewer Codex independente, modelo
GPT-6 Astra, esforço high, em papel Auditor soft gate. Trabalhe somente em leitura na worktree
`/Volumes/Thiamat II/stech/detran-worktrees/teat-frontends`. Não edite arquivos nem use Git mutável.

## Leia

1. `work/rounds/R-0013/AUTHORIZATION.md` Amendment 1 e `plan.md` A5/triagem/checkpoints 7–8.
2. `work/rounds/R-0013/corrections/CTG-0003-A5-{architect,scaffold}.md`.
3. TASK-0008/0009 JSON e prompts, `compositions.json`.
4. ADR-0028, provisioning command contract/blueprint, `CODESTYLE.md`, `apply.sh`, `seed.sh`, env R13.
5. `backend/domains/shared/src/policy.ts` em torno dos bypasses globais.
6. `work/rounds/R-0013/reviews/prompt-review-6-a4.json` e o relatório de authority audit no
   histórico do plano.

## Verifique

- A matriz aprovada está transcrita sem ampliação e exige vínculos dinâmicos além do papel.
- Provisioning é estrito antes de wildcard/global bypass; todos os papéis omitidos são negativos.
- A correção Architect fecha headers/ETag/428/412, DDL 21 e reset R13 sem abrir nomes arbitrários ou
  enfraquecer o rehearsal R7.
- O scaffold cria exatamente os onze exports fixos, compila, não possui rotas/comportamento e mantém
  exatamente oito `missing-route`; o Inspector continua independente e RED comportamental.
- Seed 29 entra nos dois perfis sem abrir inventário/transação; TASK-0008 não toca produção além
  dessa ligação de fixture expressamente autorizada.
- TASK-0009 transforma o mesmo scaffold em implementação e mantém testes/contratos/DDL/gerados
  congelados; todos os gates finais continuam obrigatórios.
- Hashes/PCs de TASK-0008/0009 conferem e as demais 16 composições permanecem válidas.

`PASS`: nenhum high. `REVIEW`: correção focal sem nova decisão. `FAIL`: autoridade ampliada,
fronteira inexequível ou enfraquecimento de gate. Retorne somente:

```json
{
  "mode": "prompt-review",
  "round": "R-0013",
  "amendment": "A5",
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
