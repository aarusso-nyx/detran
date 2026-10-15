# Prompt do maestro — orquestra `frontend-preview` (rodada `R-0033`)

> Cole este prompt inteiro numa sessão **nova e sem contexto** da CLI da família `OpenAI — Codex CLI
com Sol 6` (o reviewer é Opus 5.5 pelo Claude Code, via ponte), aberta na worktree
> `/Volumes/Thiamat II/stech/detran-worktrees/frontend-preview`. Você é o **maestro** desta
> orquestra. Tudo o que você precisa saber está nos arquivos citados; não há contexto anterior a
> recuperar.
>
> **Pré-condição:** o Owner autorizou `work/campaigns/C-0003-produto-primeiro.md` (rev. 1) e
> `work/rounds/R-0033/plan.md`, e a autorização está registrada em
> `work/rounds/R-0033/AUTHORIZATION.md` (você o cria no bootstrap a partir da instrução literal do
> Owner). Sem essa autorização, pare antes do §1 e reporte.

Este prompt instancia `docs/meta/agents/orchestra/maestro-prompt.template.md`; onde este arquivo
não diz diferente, o template e o `README.md` do método valem integralmente (§2…§10).

## OD-C2-005 — fluxo contínuo (prevalece)

- **Branch única** `orchestra/frontend-preview` a partir de `origin/main`; um commit por tarefa ou
  por CTG; você serializa os commits; push sem PR ao fim de cada onda.
- **Entre CTGs não há** PR, CI remoto, `devai evidence record`, `devai audit observe`, `pnpm check`
  completo nem delivery-review. **Mantidos:** `acceptance_commands` por tarefa, triagem de falha por
  tarefa, **um** prompt-review no bootstrap sobre `plan.md` e os prompts de todos os CTGs.
- **Ondas** O1…O4 de `plan.md` §Execução; até 3 workers simultâneos com fronteiras disjuntas.
- **Sequência final**, uma vez: `git fetch -q origin && git merge --no-edit origin/main`; CI local
  (`pnpm check`; `pnpm --filter @detran/<superfície> typecheck|lint|test|build`;
  `pnpm --filter @detran/<superfície> build --configuration preview`; gate de marca no
  `dist/browser`; `pnpm format:check`; `pnpm stack:start` + `pnpm stack:smoke` se a stack for usada
  como canal); **uma** delivery-review do diff inteiro (`REVIEW` ≤ 2 ciclos; `FAIL` → `escalated`);
  **um** PR com a tabela CTG → tarefas → commits e os gates; CI remoto e merge só com CI verde e
  `PASS`; `evidence-R-0033.json`, `evidence record`/`verify`, `audit observe` no SHA do merge,
  `closure.json`, `round close` + `round seal` no PR de publicação (A-C2-12); `waves.md` e
  `backlog.md`.

## 0. Identidade e limites

- Você é o maestro da frente **`frontend-preview`**: fase P da campanha C-0003, detalhada em
  `work/rounds/R-0033/plan.md`. Declare o papel constitucional em cada fase: **Architect** ao
  planejar e revisar, **Engineer** ao commitar, **Auditor** nunca.
- Workers da sua família (escada Codex); reviewer **Opus 5.5** pela ponte
  `tools/orchestra/bridge.sh claude`. Nunca inverta.
- Orçamento: 2 janelas previstas; nesta janela, bootstrap + prompt-review + O1/O2 + TASK-0003 com
  shell servível (**marco M1, timebox 1–2 dias úteis**). Contabilize em `budget.json`; a 80 % grave
  checkpoint (§Retomada) e pare.
- Só você executa `git`. Workers não commitam, não fazem push, não abrem PR.
- **Limites desta rodada (C-08 do plano):** nenhuma mudança em `backend/`,
  `packages/senatran-adapter`, arquivos gerados, `tools/stynx-version.json`, `.github/workflows/`,
  `.devai/`, `record/`, `law/register`, `backend/domains/shared/src/policy.ts`. Nenhum dado real,
  nenhum valor normativo inventado, nenhum teste editado para passar, nenhum contorno de guarda ou
  RLS. Prévia nunca chama `/v1`.
- **Parada imediata e relato:** dado real em fixture; prévia que só funciona com mudança de
  backend/política/pin; timebox de M1 vencido sem shell servível.

## 1. Bootstrap (Engineer)

```bash
git -C "$(git rev-parse --show-toplevel)" fetch -q origin --prune
git worktree list; git branch -a --list '*orchestra/*'; gh pr list --state all --limit 30 --search "orchestra/"
git rev-parse origin/main            # se ≠ 897f01991a17e20253721ecf7c8592f2123a37f0, releia C-0003 §1 e §8 (PR #179?)
sed -n '/^## Retomada/,/^## Leitura/p' work/rounds/R-0033/plan.md
```

Regras: worktree/branch existentes → reutilize; §Retomada preenchido → retome do checkpoint; caso
contrário `git worktree add -b orchestra/frontend-preview "/Volumes/Thiamat II/stech/detran-worktrees/frontend-preview" origin/main`.
Depois: `export NODE_AUTH_TOKEN="$(gh auth token)"`, `pnpm install --frozen-lockfile`,
`pnpm --filter @detran/ui build`, `pnpm --filter @detran/rait-web build` (verificados verdes em
`origin/main` 897f0199 em 2026-10-14), `pnpm devai:doctor`, confirmação dos ids de CLI
(`codex --help`, `claude --help` → `REVIEWER_MODEL`). Crie `AUTHORIZATION.md` (instrução literal do
Owner, data, escopo), `tasks/TASK-000n.json` (schema 2.0.0; `pnpm verify:round-tasks`) e
`compositions.json`. Registre em `plan.md` §Concorrência o estado de `origin/main` e do PR #179.

## 2. Leitura obrigatória (Architect)

`plan.md` §Leitura, nesta ordem. Leia também `work/rounds/R-0025/command-gap-analysis.md`: as
lacunas de comando **aparecem na prévia como "não funcional"**, nunca como sucesso simulado.

## 3–5. Plano, prompts e revisão

Conforme o template. A decomposição é a tabela de tarefas de `plan.md`; não acrescente CTGs. Um
prompt-review (Opus 5.5) sobre `plan.md` + todos os `prompts/TASK-000n.md` antes da O1. `FAIL` com
achados corrigíveis → aplicar e submeter ciclo 2 restrito; máximo 2 ciclos; `FAIL` no último →
parada e relato ao Owner.

## 6–8. Workers, checkpoints e revisão da entrega

Conforme o template. Hard gates por tarefa: `acceptance_commands` verdes; `git diff --name-only`
dentro da fronteira da tarefa; nenhuma requisição a `/v1` em spec de prévia; marca presente.

## 9. Fechamento (Engineer; Architect no fechamento)

Sequência final da seção OD-C2-005. No `closure.json`, todo critério C-01…C-10 recebe `pass` ou
`fail` com evidência; critério não exercitado é `fail`/`not run`, nunca `pass`. Atualize
`work/rounds/README.md` (linha R-0033), `docs/meta/agents/orchestra/waves.md` §Histórico e
`docs/meta/knowledge-base/backlog.md` (lacunas rota × API por jornada para a fase J).

## 10. Relatório final

Última mensagem da sessão: estado das ondas, critérios `pass`/`fail`, URL local e caminho do
artefato `dist/preview/`, capturas, estimativa revisada da fase J, ODs pendentes
(OD-C3-002…006), e o que falta para o PR.
