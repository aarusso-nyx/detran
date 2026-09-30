# Delivery-review — hotfix B7 (transações aninhadas em Promise.all)

> Reviewer da família oposta (Codex Sol 6). Papel: **Auditor** (Art. 18), somente leitura na worktree
> `/private/tmp/claude-501/-Users-aarusso-Development-detran--claude-worktrees-r-0022-stynx-sse-tenancy-c949d9/b1c1803b-45c2-401e-9bf3-6408f6685798/scratchpad/wtb7` (branch `fix/nested-tx-promise-all`, a partir de `main` `72bbf9c0`).
> Responda **apenas** com JSON: {"mode":"delivery-review","scope":"hotfix-nested-tx","verdict":"PASS|REVIEW|FAIL","findings":[{"severity":"high|low","file":"…","line":1,"claim":"…","fix":"…"}],"notes":["…"]}

Política do Owner B9 (DETRAN R-0022): defeito de produto em `main` → hotfix próprio, tríade com teste
vermelho antes da correção, varredura, revisão da outra família. Revise `git diff 72bbf9c0..HEAD`
(3 commits: teste vermelho 752d6bff, isolamento 7f635443, correção).

Defeito: `DashboardFreshnessService.params()` fazia `Promise.all` de duas leituras que abrem
`Database.tx`; dentro de tx ambiente os savepoints concorrem (`savepoint "stynx_sp_2" does not exist`)
e o passo 3 do sweeper era contado como `skipped`. Correção: leituras sequenciais; o mesmo padrão
latente serializado em `buildManifest` (inf/normative) e `reportInput` (boat-renaest).

Evidência do maestro: com os 3 arquivos de produção de `main`, o spec novo dá 4 falhas (savepoint);
com a correção, 5/5. Worker: suíte integration do dashboard-monitor 16/16 arquivos (437 testes);
inf/normative unit 23, integration 3; app unit 137; e2e boat-renaest-job + boat-crash-commands 26.

Rubrica: a correção é mínima e equivalente (valores, ordem de erros); o teste prova o defeito pelo motivo
certo e o isolamento (afterEach) não mascara nada; o suporte `tests/support/real-database.ts` não
contorna RLS (papel de aplicação) nem vaza para produção; a varredura da tabela do relatório é
plausível (confira `Promise.all` em backend/app/src e backend/domains); nenhuma mudança alheia.
