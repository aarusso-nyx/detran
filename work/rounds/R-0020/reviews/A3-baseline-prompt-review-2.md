Return exactly one JSON object. First character `{`, last character `}`. No Markdown, narration or files written.

# R-0020 CTG-0003 — revisão cruzada da baseline A3, ciclo 2

Você é Claude Code Opus 5.5, reviewer da outra família e Auditor constitucional. Faça somente leitura em `/Users/aarusso/.codex/worktrees/devai-sensors/detran`. O ciclo 1 em `reviews/A3-baseline-prompt-review-1.json` deu REVIEW com um high e quatro lows. Verifique a correção concreta, sem reabrir a autorização Owner A3.2/A3.3 ou os demais itens do CTG-0003.

Leia `contracts/CTG-0003-baseline-A3.md`, `prompts/TASK-0027.md`, `prompts/TASK-0028.md`, os três JSONs `tasks/TASK-0026.json` a `TASK-0028.json`, suas entradas em `compositions.json`, `tools/devai/baseline.mjs` e `tools/devai/tests/baseline.test.mjs` apenas nas interfaces de medição/comparação. A adenda agora fixa `final.tasks.a3_transposition` como recibo determinístico produzido antes da comparação, com digests congelados dos três artefatos, entradas analisadas, dez hashes sidecar e argv/exit/stdout digest do verificador. `compareBaseline` permanece síncrono e puro, somente sobre abertura/final; Inspector testa a função com blocos injetados e a medição por fixture CLI. Os três digests do contrato foram conferidos pelo maestro com `shasum -a 256`. Os comandos de aceitação incluem formatação dos arquivos próprios, `devai:test`, `verify:task-originals` e baseline final real fora da worktree. TASK-0028 está `queued`, conforme schema; o ciclo 1 leu uma versão transitória `draft` já corrigida.

Cheque se os cinco achados foram resolvidos, se a regra falha fechada para bloco ausente/subconjunto/11º caminho, se os dados do recibo permitem repetir o veredito das duas baselines e se existe alguma inconsistência material nova entre contrato, prompts, JSONs, PCs e plano. `PASS` autoriza somente TASK-0027 RED.

Responda JSON estrito:
{"mode":"prompt-review","round":"R-0020","verdict":"PASS | REVIEW | FAIL","findings":[{"severity":"high | low","item":1,"file":"...","line":1,"claim":"...","fix":"..."}],"notes":[]}
