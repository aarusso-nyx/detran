# Revisão independente do delta TASK-0023 — CTG-0001 C4

Você é o reviewer independente da família Claude, papel Auditor (soft gate),
somente leitura. Responda exclusivamente um objeto JSON válido. Worktree:
`/Volumes/Thiamat II/stech/detran-worktrees/rait-backend`.

Esta é a revisão de delta reservada após TASK-0023, **distinta** das revisões
de prompt C4-1/2/3. C4-3 foi PASS; TASK-0023 Architect Astra/medium executou
uma vez (1/1) e entregou somente o apêndice `## Bindings C4 fechados por TASK-0023`
em `contracts/CTG-0001-C4.md` e `reports/CTG-0001-C4-BINDINGS.md`. O estado é
`completed_incomplete`, com B-LEGAL-PRIORITY e B-CLOCK-WIRING BLOCKED antes
de RED. Não trate a matriz como implementação ou gate de entrega.

Leia o template e itens 1–13 de
`docs/meta/agents/orchestra/reviewer-prompt.template.md`, AGENTS.md,
CODESTYLE.md, manual Architect, `plan.md`, contrato CTG-0001 original e C4,
relatório BINDINGS, relatório TASK-0022-D1, prompt/task TASK-0023 e as tasks
dependentes 0024/0025/0002-D1/0003-D1/0004-D1; budget e compositions.
Verifique os bindings na fonte canônica citada por linha, especialmente RN141,
WF2/4, DDL34/35, deadline-engine, services handwritten, BP/module gerado e
as allowlists de app/hooks. A revisão é do delta, não de código executado.

Julgue: se os 14 comandos e cada finding histórico têm fonte, prova e status
honestos; se B-LEGAL-PRIORITY e B-CLOCK-WIRING são lacunas reais ou há binding
autorizado que o Architect deixou de usar; se a matriz introduz regra/produto
novo sem Owner; se o apêndice respeitou a allowlist; se TASK-0023 1/1 está
contabilizada corretamente; se TASK-0024/25 podem prosseguir como trabalhos
independentes apesar de `completed_incomplete` upstream, ou se a dependência
formal requer adendo/decisão antes de dispatch. Identifique o próximo passo
governado exato, sem presumir autorização para ciclo 5, sexto provider,
DDL/enum novo, módulo gerado manualmente ou alteração de escopo.

Veredito: PASS sem high no delta e com bloqueios explicitamente preservados;
REVIEW para high corrigível dentro da autorização atual; FAIL para conflito
com fonte/Owner/Constituição. Um PASS aqui não remove os dois BLOCKED nem
autoriza RED. Responda apenas:

{
"mode": "prompt-review",
"round": "R-0007",
"attempt": 2,
"cycle": "CTG-0001-C4-DELTA-1",
"verdict": "PASS",
"findings": [
{
"severity": "high",
"item": 1,
"file": "work/rounds/R-0007/reports/CTG-0001-C4-BINDINGS.md",
"line": 1,
"claim": "exemplo; omita se nenhum",
"fix": "correção concreta"
}
],
"notes": []
}
