# Delivery review — R-0013 / CTG-0001

Por autorização excepcional do Owner nesta sessão, você é reviewer Codex, modelo GPT-5.6 Sol,
esforço high, papel Auditor soft gate. Trabalhe somente em leitura na worktree
`/Volumes/Thiamat II/stech/detran-worktrees/teat-frontends`; não edite arquivos.

## Leia

1. `work/rounds/R-0013/prompts/TASK-0001.md`.
2. `work/rounds/R-0013/reports/TASK-0001.md` e os dois relatórios de tentativa.
3. `docs/framework/arch/teat-build-pack.md` §5.
4. O diff completo não staged dos 11 documentos TEAT alterados contra HEAD.
5. As fontes fechadas listadas no prompt, incluindo os dois blueprints somente leitura.

Ignore mudanças de bookkeeping em `work/rounds/R-0013/{plan.md,budget.json,tasks,reports,reviews}` ao
avaliar o conteúdo do worker, mas verifique que os 11 documentos modificados estão na allowlist.

## Verifique

- Cada um dos 12 itens tem fonte, destino e mudança/prova correta, sem regra, prazo ou estado
  inventado.
- INDEX reflete exatamente o frontmatter de UC-001…013; APP conta 50 regras.
- OD-T03 permanece `source_pending` sem prazo/expiração automática.
- OD-T05 mantém prazos/finalidades distintos; OD-T06 usa Caso 1/2/3; OD-T07 usa
  `next_number > end_number` sem texto contraditório.
- Certificação metrológica inválida bloqueia o teste conforme fontes; blueprints não mudaram.
- Numeração UC-008/009 e referências internas são coerentes; JRN-006 diz 67→70 corretamente.
- Gates informados pelo maestro: format PASS, KB 549/446, publish 201, diff-check PASS.

## Veredito e saída

`PASS` libera commit. `REVIEW` lista correções concretas. `FAIL` bloqueia/escalada.

```json
{
  "mode": "delivery-review",
  "round": "R-0013",
  "ctg": "CTG-0001",
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
