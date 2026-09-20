# Revisão exaustiva dos prompts adicionais de CTG-0002

Papel: **Auditor**, soft gate da Constituição DEVAI Art. 18. Modo:
`prompt-review`; rodada `R-0010`; família oposta ao maestro. Trabalhe somente
em leitura nesta worktree. Responda apenas um objeto JSON válido, compacto, sem
fence Markdown: o primeiro byte é `{` e o último `}`.

Leia nesta ordem:

1. `docs/meta/agents/orchestra/README.md` §§4–5,
   `docs/meta/agents/README.md` e
   `docs/meta/agents/orchestra/reviewer-prompt.template.md` (rubrica e veredito).
2. `work/rounds/R-0010/plan.md`, em especial a adenda A-1 de CTG-0002 e a
   sequência das tríades. Leia `work/rounds/R-0010/contracts/CTG-0002.md`
   §§5–6 e adenda A-1.
3. `docs/framework/arch/boat-build-pack.md` §WP-B2 e mapa de entregáveis,
   `docs/framework/arch/boat-route-contract.md` §§3–7,
   `docs/meta/adr/ADR-0018-*.md` e `docs/meta/adr/ADR-0020-*.md`.
4. Os nove prompts `work/rounds/R-0010/prompts/TASK-0012.md` …
   `TASK-0020.md`, os nove JSONs correspondentes em `tasks/`, e
   `work/rounds/R-0010/compositions.json`. Os prompts anteriores
   `TASK-0001.md` … `TASK-0011.md` são referência para dependências,
   sobreposição de fronteiras e sequência; o foco do veredito são os nove
   prompts novos.

Faça o primeiro ciclo **exaustivo** segundo a rubrica do template: papel,
fontes fechadas suficientes, fronteiras e locks, critérios executáveis, tokens
canônicos, ordem Architect → Inspector → Engineer, gates preservados,
ADR/decisões do Owner, parcimônia e matriz de autorização. Verifique em
particular se o domínio dono das projeções controla seus blueprints/DDL e
projetores; replay é idempotente e resistente a commit tardio; `source_pending`
não vira rota cidadã; dashboard usa supressão primária e secundária; PDF/A
exige validação real e decisão Architect sobre espécie/template/política antes
da implementação; o lock de ADR-0018 com R-0007 é resolvido antes de escrita;
e o job mensal opera com contexto tenant/RLS autorizado. `pnpm install` e
`pnpm-lock.yaml` são exclusivos do maestro. Nenhum Engineer edita testes ou
artefatos gerados à mão. Não peça ao Engineer que invente regra de produto.

Formato exato:

```json
{
  "mode": "prompt-review",
  "round": "R-0010",
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [
    {
      "severity": "high | low",
      "item": 4,
      "file": "work/rounds/R-0010/prompts/TASK-0012.md",
      "line": 31,
      "claim": "fato verificável",
      "fix": "correção localizada"
    }
  ],
  "notes": []
}
```

`PASS` se nenhum high; `REVIEW` se high corrigível; `FAIL` se houver
contradição com definição canônica, ADR, decisão do Owner, Constituição ou
violação de fronteira. Liste todos os achados deste primeiro ciclo de uma vez.
