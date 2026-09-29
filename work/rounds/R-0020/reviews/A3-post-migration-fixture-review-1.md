Return exactly one JSON object. Its first character must be `{` and its last character `}`. Do not use Markdown fences or prose outside JSON.

# R-0020 CTG-0003 — revisão cruzada da compatibilidade de fixtures pós-migração, ciclo 1

Você é Claude Code Opus 5.5, reviewer da outra família e Auditor constitucional. Faça somente leitura em `/Users/aarusso/.codex/worktrees/devai-sensors/detran`. Este é um item de revisão distinto do RGR PC-B encerrado em `reviews/A3.5-RGR-fixture-review-4.json` com PASS sobre `normalize-a32.test.mjs` SHA-256 `ffae33935a7fdab9778cc676dad0699dc7e9262604b8d487c0171ace2aa43bee`. Não refaça as decisões normativas; revise só o delta de fixture necessário após projeção A3.

Leia `contracts/CTG-0003-A3.md`, `contracts/CTG-0003-A3.5-archive-guard.md`, `reports/TASK-0009.md`, os quatro testes alterados `tools/devai/tests/{normalize-a32,normalize-a33,normalize-tasks,verify-archival-pc-guard}.test.mjs` e o diff exato `/tmp/r20-ctg3-fixture-compatibility.patch` (SHA-256 `7741d8afa7cca1606c583f31a58f7559754f344630108ddbd727128a103c07e0`). O diff foi extraído de uma cópia pré-delta, não é commit; se o arquivo em `/tmp` não estiver acessível, registre isso como limitação e compare as versões pelos hashes do relatório/arquivos disponíveis, sem inventar comparação.

Contexto verificado pelo maestro: clone descartável pós-migração `/tmp/r20-ctg3-rehearsal.ghBpbv/repo` recebeu 144 TASKs e guarda PC-B `applied`; schema 317/317 e vínculos 144/144 passaram. `pnpm check` avançou até `devai:test`, onde 14 de 153 testes falharam porque as fixtures liam `R-0007/tasks/TASK-0004-S1.json` e outros nomes históricos já movidos para `_legacy-originals/*.json.raw`. Inspector alterou apenas quatro suítes, para ler o sidecar raw quando presente e usar TASK direta antes da migração, conferindo SHA de fonte congelada. Em cópia isolada pós-migração e na worktree pré-migração, a suíte DEVAI completa passou 153/153; Prettier dirigido passou. O clone original pós-migração não foi editado pelo Inspector. Essas medições são alegações a auditar, não prova de correção por si só.

Verifique: (1) fallback não aceita bytes de fonte incorretos nem omite hash; (2) os onze PCs e D1/T1/S2/S3 continuam caracterizados, sem remover ou afrouxar asserções; (3) teste de trilha geral vincula sidecar à canônica quando usa o arquivo pós-migração; (4) compatibilidade dos dois estados, sem modificar produção, manifesto, PC, TASK histórica ou cadeia; (5) se qualquer mudança no teste SHA `ffae3393...` invalida o PASS anterior, indique exatamente qual assertiva e por quê. `PASS` libera apenas a repetição do check global no clone e a revisão de entrega posterior; não aplica a migração na árvore real nem autoriza seal/PR.

Responda somente JSON estrito:

{"mode":"prompt-review","round":"R-0020","verdict":"PASS | REVIEW | FAIL","findings":[{"severity":"high | low","item":1,"file":"...","line":1,"claim":"...","fix":"..."}],"notes":[]}
