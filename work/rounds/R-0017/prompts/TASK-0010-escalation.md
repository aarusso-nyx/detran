# Escalada restrita - TASK-0010 (`transcriber-docs`)

> R-0017 `local-stack`; worktree `/Users/aarusso/.codex/worktrees/local-stack/detran`.
> O runner grava `work/rounds/R-0017/reports/TASK-0010-escalation.md`.

Papel constitucional: **Architect (transcricao)**, Art. 6. Declare o papel primeiro. A tentativa inicial Luna/baixo parou na leitura de uma linha historica longa; o retry editou backlog e indice, mas nao completou `waves.md` nem rodou gates. O maestro inseriu a linha R-0017 em `waves.md` com patch ancorado na linha R-0018, sem mudar as demais. Esta escalada Terra/alto deve ratificar o conjunto e concluir a verificacao, nao reiniciar a transcricao.

Leia apenas `AGENTS.md`, `CODESTYLE.md`, `docs/meta/agents/transcriber-docs.md`, `work/rounds/R-0017/prompts/TASK-0010.md`, `work/rounds/R-0017/reports/TASK-0010-retry-1.md`, as linhas R-0017 de `work/rounds/README.md`, `docs/meta/knowledge-base/backlog.md` e `docs/meta/agents/orchestra/waves.md`, e a secao R-0017 de `docs/meta/knowledge-base/open-decisions-rait.md`. Para `waves.md`, use `rg '^\| R-0017 '`, nunca despeje o intervalo historico inteiro. Consulte `work/rounds/R-0017/plan.md` apenas para fatos ou ODs que precisarem de confirmacao.

Pode tocar somente `docs/meta/agents/orchestra/waves.md` (linha R-0017), `docs/meta/knowledge-base/open-decisions-rait.md` (secao R-0017), `docs/meta/knowledge-base/backlog.md` (entrada R-0017) e `work/rounds/README.md` (linha R-0017). Preserve todas as outras linhas. Se a secao OD ja estiver correta, ratifique-a sem edicao. Nao toque em codigo, CI, testes, `record/**`, `.devai/**`, `law/**`, ADRs, rounds anteriores, `AGENTS.md` ou `CLAUDE.md`; nao execute git, stack, `db-reset` ou instalacao.

Fatos fechados: PR #133 CTG-0001 e PR #143 CTG-0002 mesclados; CTG-0003 em curso. OD-R17-001: mock local SEFAZ das seis rotas; OD-R17-002: PAdES/biometria/conselho explicitamente off; OD-R17-003: CI `stack-smoke` manual em `workflow_dispatch`; OD-R17-004: denuncia sintetica exclusiva de `detran_local_stack`, fonte antiga permanece criterio historico nao cumprido. Checkpoint (b) positivo 42/42 e negativo exit 1; RC legado 21/21. M1 confirmou Sol 6, Terra/Luna e Opus 5.5. Limite de tokens dispensado pelo Owner; nao invente consumo. Integracoes reais e PEC fora do escopo.

O indice deve continuar `aberta`, PRs `#133, #143`, PC `—` ate o fechamento emitir recibo. A linha `waves.md` deve ser historico em andamento, nao afirmar selo ou fechamento. Na secao OD, A7 e esclarecimento tecnico, nao nova decisao. Complete somente eventuais lacunas demonstraveis.

Na propria linha R-0017 de `waves.md`, inclua explicitamente M1 (Sol 6, Terra/Luna e Opus 5.5), OD-R17-001…004 e a cadeia de evidencia ja ancorada do CTG-0002 (head `ace64626229b849171c8bc4fa538946afe901e5b1c8991f073c55e375f4f9c4b` naquele checkpoint), sem sugerir que CTG-0003 esteja fechado. Formate com Prettier somente `waves.md` e `work/rounds/README.md`; a correcao esperada altera apenas as linhas R-0017 (alinhamento de colunas). Se o formatador apontar outra linha, pare e reporte.

Execute `pnpm verify:state-index`, `pnpm docs:check` e `pnpm format:check`; relate exit code e resumo de cada um. Se um gate falhar, classifique a causa e corrija apenas dentro da fronteira; nao afrouxe gates ou criterios. O build ignorado de `docs/site/build` pode contaminar `pnpm check`, que nao e parte da sua aceitacao; nao rode `pnpm check` nesta tarefa. Entregue relatorio com papel, arquivos tocados/ratificados, comandos e resultados, criterio PASS/FAIL por item, ODs, fora de escopo e bloqueios.
