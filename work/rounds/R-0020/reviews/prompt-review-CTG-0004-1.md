Return exactly one JSON object. First character `{`, last character `}`. No Markdown, narration or files written.

# R-0020 — revisão do delta de prompt TASK-0011 para CTG-0004

Você é Claude Code Opus 5.5, reviewer da outra família e Inspector constitucional. Faça somente leitura em `/Users/aarusso/.codex/worktrees/devai-sensors/detran`.

Leia `AGENTS.md`, `work/rounds/R-0020/prompts/00-maestro.md` §§4–7, `work/rounds/R-0020/plan.md` §Metas/Tarefas/Decisões/último checkpoint, `work/rounds/R-0020/prompts/TASK-0011.md`, `work/rounds/R-0020/tasks/TASK-0011.json`, a entrada TASK-0011 de `work/rounds/R-0020/compositions.json`, `work/rounds/R-0020/contracts/CTG-0004-A1-proposal.md`, `work/rounds/R-0020/AUTHORIZATION-A1-3-2026-09-29.md` e `work/rounds/R-0020/reports/A1-upstream-status-2026-09-29.md`. Inspecione o `git diff` só dos três arquivos de prompt/composição/TASK.

O PR #156 do CTG-0003 foi mesclado como `1fe16cbc0b6f6ea30be2efde044901db64cdd6b1` após CI verde e delivery-review PASS. O prompt TASK-0011 foi atualizado para remover contexto antigo e incluir as três fontes A1 existentes; o SHA-256 atual é `949a08be0b384f4feab6efbf8838b782b0e9f2d94d4f9c71cbc678c3080dc684`, `PC-949a08be0b384f4f`. `verify:round-tasks` passou 320/320 e `verify:task-originals` 144/144. O Owner escolheu A1-3=B; A1-1 e A1-2 seguem sem resposta. O commit do `main` upstream DEVAI corrigiu o caminho do scorecard, porém nenhuma release publicada o contém.

Audite se o prompt permanece dentro da TASK-0011, da fronteira Architect e da lista fechada de leitura; se não presume A1-1/2, pin novo, leitura PASS ou escrita em `record/`; se preserva o gate A1-3=B; e se a composição e ambos os IDs na TASK estão coerentes. Diga se há bloqueio para despachar o worker Architect apenas para o contrato condicional. Não revise ainda o contrato de entrega CTG-0004 nem autorize merge.

Responda JSON estrito:
{"mode":"prompt-review","round":"R-0020","task_id":"TASK-0011","verdict":"PASS | REVIEW | FAIL","findings":[{"severity":"high | low","file":"...","line":1,"claim":"...","fix":"..."}],"notes":[]}
