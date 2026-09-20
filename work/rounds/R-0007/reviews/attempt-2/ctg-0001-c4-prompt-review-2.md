# Prompt-review independente — CTG-0001 C4, ciclo 2

Você é o reviewer independente da família Claude, papel Auditor (soft gate),
somente leitura. Responda exclusivamente JSON válido, sem Markdown. Worktree:
`/Volumes/Thiamat II/stech/detran-worktrees/rait-backend`.

Esta revisão é do delta corretivo após o veredito REVIEW de
`reviews/attempt-2/ctg-0001-c4-prompt-review-1.json`. Preserve os oito findings
históricos e verifique se **todos** foram sanados. O prompt original dessa revisão
foi preservado em `ctg-0001-c4-prompt-review-1.original.txt`; o `.md` formatado
posteriormente não corresponde ao SHA do bridge histórico, fato documentado em
`reports/CTG-0001-C4-PLAN.md`. Verifique os hashes pela cópia original.

Leia `docs/meta/agents/orchestra/reviewer-prompt.template.md` e os itens 1–13
da rubrica, `AGENTS.md`, `CODESTYLE.md`, manuais Architect/Inspector/Engineer/
transcriber-docs, `plan.md`, `contracts/CTG-0001.md` e `CTG-0001-C4.md`, relatório
C4-PLAN, budget, compositions, tasks e prompts 0023/24/25, 0002-D1/0003-D1/
0004-D1. Consulte as fontes canônicas necessárias, incluindo RN-RAIT-141,
WF-RAIT-002 §4, WF-RAIT-004, UC-RAIT-017, EV, DDL e serviços handwritten.

Avalie especialmente se a rota sem token canônico TEAT_EVIDENCE preserva semântica;
se a dependência Clock cabe comprovadamente nos cinco providers e na allowlist;
se prioridade legal possui fonte tipada suficiente sem default inventado; se
TASK-0023 pode entregar bindings antes de RED; se sensor RLS falha fechado com
identidade correta; se hashes/PC/schema/budget e formatação são coerentes. Uma
ambiguidade material sem fonte deve ser stop condition, não autorização implícita.
Esta revisão não autoriza implementar produto ou passar gate por presunção.

Veredito: PASS se nenhum high; REVIEW para high sanável dentro da autorização;
FAIL para contradição com fonte/Owner/Constituição ou fronteira violada.

Responda apenas:

{
"mode": "prompt-review",
"round": "R-0007",
"attempt": 2,
"cycle": "CTG-0001-C4-2",
"verdict": "PASS",
"findings": [
{
"severity": "high",
"item": 1,
"file": "work/rounds/R-0007/prompts/TASK-0023.md",
"line": 1,
"claim": "exemplo; omita se nenhum",
"fix": "correção concreta"
}
],
"notes": []
}
