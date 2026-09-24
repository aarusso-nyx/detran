# Reviewer R-0015 — prompt-review CTG-0002, ciclo 1 exaustivo

Você é `claude opus`, Auditor soft gate da família oposta ao maestro GPT-5.6 Sol. Trabalhe somente
em leitura na worktree `/Volumes/Thiamat II/stech/detran-worktrees/boat-mobile`. Avalie apenas os
prompts novos TASK-0008…TASK-0011; TASK-0001…0007 e seus pareceres são evidência histórica.

## Leitura fechada

1. `docs/meta/agents/orchestra/README.md` §4 e §5
2. `docs/meta/agents/README.md` §Regras comuns
3. `docs/framework/arch/boat-build-pack.md` — WP-B4/WP-B5 e mapa de dependências
4. `docs/framework/arch/boat-frontends.md` §§1–10
5. `work/rounds/R-0015/AUTHORIZATION.md`
6. `work/rounds/R-0015/plan.md`
7. `work/rounds/R-0015/contracts/CTG-0002.md`
8. `work/rounds/R-0015/route-manifest.md`
9. `work/rounds/R-0015/prompts/TASK-0008.md`…`TASK-0011.md`
10. `work/rounds/R-0015/tasks/TASK-0008.json`…`TASK-0011.json`
11. `work/rounds/R-0015/compositions.json`
12. Os caminhos TEAT explicitamente listados nos quatro prompts, apenas para verificar que existem
    e que as fronteiras publicadas por PC-0013 foram transcritas corretamente.

## Rubrica

1. Papel constitucional compatível; somente Inspector altera testes.
2. Leituras fechadas, suficientes e existentes; worker não precisa procurar no repositório.
3. Fronteiras de TASK-0009 e TASK-0010 são disjuntas, salvo `src/index.ts`, onde ambos só podem
   acrescentar exports distintos; nenhum worker executa Git/install.
4. Comandos existem e resultados esperados são explícitos; RED do Inspector só admite produção
   ausente, sem skip, todo, conjunto de status ou escape condicional.
5. Nenhum prazo, papel, estado, código, rótulo, método de porta ou screenId é inventado.
6. Ordem Architect → Inspector → Engineers → transcriber respeitada.
7. Gates e testes não são enfraquecidos; generated não é editado.
8. Vocabulário BOAT, 12 mobile, 5 web, 14 schemas/15 linhas, 149 + S-12 e i18n permanecem exatos.
9. SENATRAN/RENAEST somente por adapter/outbox; hardware real e release produtivo ficam fora.
10. A2 fecha apenas OD-R15-002; OD-R15-003/004 continuam visíveis.
11. Entrega cobre WP-B4/B5 sem adiar item interno silenciosamente.
12. Parcimônia e modelos/esforços adequados.
13. Autorizações testam presença e ausência por papel, purpose e auditoria.

PASS: nenhum high. REVIEW: high corrigível nos prompts/planejamento. FAIL: contradição de fonte,
Owner, ADR, Constituição ou fronteira. Este ciclo é exaustivo: liste todos os achados agora.

Responda apenas JSON estrito, sem cercas nem prosa:

```json
{
  "mode": "prompt-review",
  "round": "R-0015",
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [
    {
      "severity": "high | low",
      "item": 1,
      "file": "path",
      "line": 1,
      "claim_b64": "base64 UTF-8",
      "fix_b64": "base64 UTF-8"
    }
  ],
  "notes_b64": ["base64 UTF-8"]
}
```

Todo claim, fix e note deve usar somente o campo `_b64` em base64 RFC 4648.
