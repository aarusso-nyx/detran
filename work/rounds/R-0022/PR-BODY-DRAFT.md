# Rascunho do PR de registro da parada de R-0022 (OD-C3-006)

Rascunho preparado na worktree de handoff `claude/detran-r22-handoff-03f872`. O push e a
abertura do PR ainda dependem de autorização explícita do Owner no chat; este arquivo só
registra o texto a usar.

## Título

`docs(round): register R-0022 stop at checkpoint c22ea63a (OD-C3-006)`

## Corpo

Registro da parada da rodada R-0022 `stynx-sse-tenancy`, decidida pelo Owner em 2026-10-14
(C-0002 A-C2-16; C-0003 §11 passo 0). Só documentação e evidência; **nenhum código**.

**Decisão.** OD-C3-006, decidida (a) em 2026-10-14: o PR de registro da parada abre a partir da
worktree de handoff, sem código, revisado pela outra família. A rodada parou no checkpoint
`c22ea63a` de `codex/detran-r22-adoption-160` (85 commits sobre `origin/main` `897f0199`, sem PR).
O salvamento do código do checkpoint fica para R-0034 `platform-seams` (C-0003 fase S), fora
deste PR.

**Conteúdo.**

- `work/campaigns/C-0003-produto-primeiro.md`, `work/rounds/R-0033/`, índice de rodadas, registro
  OD-C3 e backlog: já nos commits `18b26b4c` e `13d684e1` desta branch (parada e campanha
  substituta; OD-C3-002…006 decididas).
- `work/rounds/R-0022/` (291 arquivos) copiado tal qual do checkpoint `c22ea63a`:
  `AUTHORIZATION.md` (adendas até B17), `plan.md` (decisões M1…, A7, log de progresso),
  `budget.json`, `compositions.json`, `contracts/` (79), `prompts/` (29), `reports/` (44),
  `reviews/` (106) e `tasks/` (29). Dos 291, só `plan.md` e `prompts/00-maestro.md` já existiam
  em `main`; `plan.md` recebe apenas acréscimos do maestro (nenhuma linha de conteúdo removida).
- `scratch/r22-adoption-160/` (9 arquivos): relatórios de checkpoint v13…v16 e seus manifestos de
  evidência, mais `available-test-fixtures-v7.json`. Os manifestos referenciam por sha256
  arquivos de `scratch/r22-adoption-161/`, que permanecem **só no checkpoint** e não entram aqui.
- `work/rounds/R-0022/PR-BODY-DRAFT.md`: este rascunho.

**Fora do PR, de propósito.** Nenhuma alteração em `record/`, `.devai/`, `.github/workflows/`,
código, `tools/stynx-version.json`, `.gitignore` ou `.prettierignore`. O checkpoint altera os dois
últimos (reinclusões de fixtures de `r22-adoption-161` e exclusão de `scratch/r22-adoption-160/`
do Prettier); essas mudanças **não** foram copiadas, e os arquivos deste PR passam no Prettier
com a configuração de `main`.

**CTG.** Não se aplica: PR de registro, sem CTG, sem fechamento nem selagem de R-0022. A rodada
continua `parada` no índice; `closure.json`/`record.md` não existem.

**Verificação da evidência.** Manifesto v16 (`checkpoint-evidence-manifest-v16.json`): os 11
`refs` conferidos por sha256 e tamanho em bytes com `python3 -I` contra os blobs — 4 contra o
índice desta branch (`scratch/r22-adoption-160/`), 7 contra a árvore do checkpoint
(`scratch/r22-adoption-161/`). 11/11 iguais.

**Gates executados localmente** (worktree de handoff, deps instaladas, `NODE_AUTH_TOKEN` do `gh`):

| Gate                                                    | Resultado                                               |
| ------------------------------------------------------- | ------------------------------------------------------- |
| `pnpm exec prettier --check` nos 300 arquivos copiados  | PASS (184 `.md`; demais respeitam `.prettierignore`)    |
| `node tools/docs/state-index/check.mjs`                 | PASS (39 ADRs, 36 rodadas, 20 closures)                 |
| `node tools/devai/render-rounds-index.mjs --check`      | PASS                                                    |
| `node tools/devai/verify-round-tasks.mjs --repo-root .` | PASS (320 tarefas, inclui as 29 de R-0022)              |
| `pnpm -s docs:kb:check`                                 | PASS (773 artefatos)                                    |
| `pnpm -s docs:kb:publish-check`                         | PASS (201 arquivos; material raw/interno excluído)      |
| `pnpm -s verify:law-corpus`                             | PASS                                                    |
| `pnpm check` completo                                   | FAIL em `test:stack` (7 casos), pré-existente em `main` |

**`pnpm check`.** A cadeia parou em `pnpm test:stack`: 7 casos de `tools/stack/contract.test.mjs` e
`revision.test.mjs`. Causa alheia a este PR: `contract.test.mjs:17` deriva a raiz do repositório de
`new URL(...).pathname`, que mantém `%20`, e o caminho local `/Volumes/Thiamat II/…` tem espaço
(`ENOENT lstat '/Volumes/Thiamat%20II/…/tools/stack/smoke.mjs'`). Reproduzido em `main` `897f0199`
limpo, na mesma máquina. Os runners do CI não têm espaço no caminho. Os demais passos da cadeia,
executados em separado na mesma ordem (de `law:test` a `rait-web build`): PASS. Um único timeout
isolado em `portal-web` (T-13 comparação lado a lado, 5 s) ficou verde na reexecução completa
(118 arquivos, 1314 testes). Correção do teste de caminho fica para PR próprio, com código.

**Revisão.** Pela outra família (OD-C3-006). Merge só com CI verde.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
