# Retentativa de serialização JSON — revisão restrita TASK-0021

Papel: Auditor. Modo prompt-review, rodada R-0010. Somente leitura. A revisão exaustiva `prompt-review-14-ops-fixture.json` devolveu REVIEW. A tentativa restrita seguinte concluiu avaliação, mas o bridge rejeitou sua saída por aspas não escapadas no JSON; portanto não existe veredito formal aceito. Refaça a conferência das sete correções de `prompt-review-14-ops-fixture.json` em `prompts/TASK-0021.md`, `tasks/TASK-0021.json`, `compositions.json`, `contracts/CTG-0002.md` adenda A-4 e `plan.md` §Tarefas/§Triagem. As fontes citadas nesses arquivos são somente leitura. Não avalie texto intocado salvo FAIL por contradição canônica, decisão Owner, ADR, Constituição ou fronteira, com justificativa explícita.

Responda com **uma única linha JSON compacta**. Sem Markdown, sem explicações, sem notas narrativas. Se PASS, use EXATAMENTE:
{"mode":"prompt-review","round":"R-0010","verdict":"PASS","findings":[],"notes":[]}
Se REVIEW ou FAIL, mantenha a mesma estrutura e inclua só achados com claim/fix curtos em texto simples, escapando aspas internas pelo JSON padrão.
