# Correcao do delivery-review CTG-0003 - TASK-0010

> R-0017 `local-stack`; worktree `/Users/aarusso/.codex/worktrees/local-stack/detran`.
> O runner grava `work/rounds/R-0017/reports/TASK-0010-delivery-fix.md`.

Papel constitucional: **Architect (transcricao)**, Art. 6. Declare o papel primeiro. O delivery-review CTG-0003 ciclo 1 retornou REVIEW com apenas dois achados high no backlog. Corrija somente esses achados, sem rever o restante da entrega.

Leia apenas `AGENTS.md`, `CODESTYLE.md`, `docs/meta/agents/transcriber-docs.md`, `work/rounds/R-0017/reviews/delivery-review-CTG-0003.json`, `work/rounds/R-0017/plan.md` linhas 210-214 (risco SEFAZ) e 449-453 (RAIT serve), `apps/rait/web/angular.json` linhas 62-73 (somente leitura), e `docs/meta/knowledge-base/backlog.md` apenas as entradas vizinhas da linha R-0017. Nao procure outros arquivos.

Pode editar **somente** `docs/meta/knowledge-base/backlog.md`, acrescentando duas entradas abertas junto da entrada R-0017 atual; preserve essa entrada e todas as demais. Primeira entrada: reparo futuro da referencia `serve.buildTarget` em `apps/rait/web/angular.json`, cujo valor atual e `portal-web:build:production`/`portal-web:build:development`; o tooling da stack recebeu workaround no CTG-0001, mas o app permanece incorreto. Dono Architect/Engineer-frontend em rodada futura a planejar, sem nomear rodada que nao foi escolhida. Segunda entrada: ADR propria ainda ausente de `packages/sefaz-adapter`, registrada em §Riscos do plano; fora do escopo de R-0017, dono Architect em rodada futura a planejar. Nao crie ADR nem edite Angular.

Nao execute git, stack, db-reset ou instalacao. Nao toque em codigo, CI, testes, `record/**`, `.devai/**`, `law/**`, ADRs, rounds anteriores, `AGENTS.md`, `CLAUDE.md` ou outros registros. Nao reabra ODs do Owner, nao enfraqueca gates. Execute `pnpm exec prettier --check docs/meta/knowledge-base/backlog.md`, `pnpm docs:kb:check` e `pnpm format:check`; relate exit codes. Se algo falhar fora da unica fronteira, pare e reporte.

Entregue relatorio com papel, arquivo e linhas alteradas, os dois achados sanados, comandos/resultados, ODs, fora de escopo e bloqueios.
