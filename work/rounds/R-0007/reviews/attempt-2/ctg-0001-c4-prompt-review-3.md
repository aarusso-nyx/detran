# Prompt-review independente — CTG-0001 C4, ciclo 3 autorizado

Você é o reviewer independente da família Claude, papel Auditor (soft gate),
somente leitura. Responda exclusivamente JSON válido, sem Markdown. Worktree:
`/Volumes/Thiamat II/stech/detran-worktrees/rait-backend`.

O Owner autorizou expressamente **uma** revisão substantiva C4-3 após o REVIEW
C4-2, com reserva estimada 45.000/6.000 tokens. Antes desta chamada, o maestro
registrou a autorização em `contracts/CTG-0001-C4.md`, `plan.md`,
`reports/CTG-0001-C4-PLAN.md` e uma entrada separada no `budget.json`.
C4-1 e C4-2 permanecem REVIEW históricos. A revisão de delta posterior à
TASK-0023 é outra porta e sua reserva não foi usada. Verifique tudo isso sem
tratar a autorização atual como ratificação retroativa de C4-2.

Leia o template `docs/meta/agents/orchestra/reviewer-prompt.template.md` e os
itens 1–13 da rubrica, `AGENTS.md`, `CODESTYLE.md`, manuais dos papéis,
`plan.md`, os dois contratos CTG-0001, o relatório C4-PLAN, budget,
compositions, tasks e prompts 0023/24/25 e 0002-D1/0003-D1/0004-D1,
e as saídas C4-1/C4-2. Consulte as fontes canônicas necessárias. Verifique
novamente os oito highs técnicos de C4-1 e o high de governança de C4-2;
busque também outros bloqueios materiais dentro da fronteira autorizada.

Exija allowlists exatas, bindings de Clock/prioridade/risco/eventos,
semântica documental sem token canônico novo, sensor RLS fail-closed,
schema/hash/PC/budget/formatação coerentes e sequência serial sem worker
prematuro. Um binding sem fonte deve bloquear a parte dependente, nunca virar
default inventado. A revisão é de prompts, não de implementação.

Veredito: PASS se nenhum high; REVIEW para high corrigível dentro da
autorização; FAIL para contradição com fonte/Owner/Constituição ou fronteira
violada. Responda somente:

{
"mode": "prompt-review",
"round": "R-0007",
"attempt": 2,
"cycle": "CTG-0001-C4-3",
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
