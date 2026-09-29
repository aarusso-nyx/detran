Return exactly one JSON object. First character `{`, last character `}`. No Markdown, narration or files written.

# R-0020 CTG-0003 — revisão de entrega do comparador A3, ciclo 1

Você é Claude Code Opus 5.5, reviewer da outra família e Auditor constitucional, somente leitura em `/Users/aarusso/.codex/worktrees/devai-sensors/detran`. Este item revisa a correção da baseline, não as decisões Owner A3.2/A3.3. O prompt-review formal `reviews/A3-baseline-prompt-review-2.json` deu PASS; TASK-0027 escreveu RED e TASK-0028 implementou GREEN.

Leia `contracts/CTG-0003-baseline-A3.md`, `reports/TASK-0027.md`, `reports/TASK-0028.md`, `tools/devai/baseline.mjs` (medição A3, comparação de tasks e `main`), `tools/devai/tests/baseline.test.mjs` (casos A3), os dois índices R-0007 em `_legacy-originals`, `reports/A3-migration-before-after.json`, `baseline.json` e `/tmp/detran-task0028-baseline-UUNjti/baseline-final.json`. A medição real saiu 0: `tasks PASS`, 335 válidas, 0 inválidas, dez sidecars, verificador exit 0 e nenhum eixo FAIL; geral REVIEW por fontes já pendentes. `pnpm devai:test` passou 169/169 e `verify:task-originals` passou 144 vínculos. Essas são alegações para auditar, não substitutos da leitura.

Cheque: (1) `compareBaseline` continua pura e reexecutável só das duas medições; (2) falta parcial, 11º caminho, fonte/sidecar/índice/relatório/destino alterados e verificador negativo não viram PASS; (3) os três SHA congelados e D1 posterior contra abertura estão certos; (4) bloco de medição realmente contém bytes/hash/entradas da mesma árvore, sem escrita ou fonte externa não autorizada; (5) as outras sete dimensões e critérios de TASK comuns/novos não foram afrouxados; (6) testes novos exercitam as recusas sem abandonar as assertivas antigas. Se achar falha, cite arquivo/linha e correção concreta. `PASS` libera a revisão final do CTG-0003 e gates/commits/PR, não implica merge.

Responda JSON estrito:
{"mode":"delivery-review","round":"R-0020","verdict":"PASS | REVIEW | FAIL","findings":[{"severity":"high | low","item":1,"file":"...","line":1,"claim":"...","fix":"..."}],"notes":[]}
