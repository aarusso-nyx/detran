# Revisão de prompt da retentativa A-2 de TASK-0006

Papel: Auditor (soft gate da Constituição DEVAI Art. 18). Modo
`prompt-review`, rodada R-0010. Somente leitura; responda exclusivamente
objeto JSON válido, sem fence Markdown, primeiro byte `{`, último `}`.

Leia `docs/meta/agents/orchestra/reviewer-prompt.template.md` e avalie pela
rubrica completa **apenas a alteração A-2** em:

- `work/rounds/R-0010/contracts/CTG-0002.md` §Adenda A-2;
- `work/rounds/R-0010/prompts/TASK-0006.md` e
  `work/rounds/R-0010/tasks/TASK-0006.json`;
- `backend/app/tests/e2e/teat-field-sync.e2e.spec.ts` C-0002-44;
- `backend/domains/ops/offline-sync/src/handwritten/submit-batch.spec.ts`
  C-0002-13, prova existente do fallback sem destino;
- `work/rounds/R-0008/contracts/CTG-0002.md` §5.1/§5.13 e
  `work/rounds/R-0010/contracts/CTG-0002.md` §3/C-2-09.

O gate atual em banco isolado passou unit/integration e 120/121 app E2E.
C-0002-44 envia `{crash:{local_protocol:'BOAT-0001'}}`, payload BOAT inválido,
mas ainda espera `received`/`TEAT.SYNC_DESTINATION_NOT_WIRED` da era sem
applier. Com o applier montado, o recibo é
`rejected`/`BOAT.SYNC_INVALID_CRASH_RECORD`. O prompt permite ao Inspector
ajustar somente esse sensor, mantendo ou reforçando HTTP 200, autorização,
estrutura do lote, rollback e teste de fallback de implantação. Nenhum teste
foi editado ainda. Verifique também que os comandos de aceitação existem e
que a fronteira de escrita é exata. Isto é revisão de escopo de sensor, não
aceitação de um resultado de teste alterado.

Formato:

```json
{
  "mode": "prompt-review",
  "round": "R-0010",
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [
    {
      "severity": "high | low",
      "item": 4,
      "file": "work/rounds/R-0010/prompts/TASK-0006.md",
      "line": 31,
      "claim": "fato verificável",
      "fix": "correção localizada"
    }
  ],
  "notes": []
}
```
