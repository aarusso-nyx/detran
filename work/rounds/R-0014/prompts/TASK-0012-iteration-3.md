# TASK-0012 — iteração 3 (restrita, Codex Terra/médio): `portal-frontends.md` §10 no estado ao fim de R-0014

> Worker da orquestra `portal-pwa`, rodada `R-0014`, CLI do Codex, worktree
> `/Volumes/Thiamat II/stech/detran/.claude/worktrees/r-0009-maestro-execution-33aaac`. Uma
> tarefa; sua **última mensagem é o relatório**. Nunca `git`, nunca código/testes/gerados, nunca
> `work/rounds/**`. Ninguém responde durante a execução.

Papel: **Architect (transcrição)**. `work/rounds/R-0014/reviews/delivery-review-CTG-0005.json`
(leia) devolveu REVIEW com um achado: a tabela de `docs/framework/arch/portal-frontends.md` §10
(l. 244–251) ainda diz "pendente (WP-P1/P2)" para o domínio `portal` e as projeções, entregues em
R-0009 (PC-0006, PRs #54/#56/#57), e o parágrafo "Estado ao fim de R-0014" (l. 256–260) não é
coerente com a tabela.

Leitura (fechada): `plan.md` §Decisões M15, §Adendas A12(a), A14, A19(b), §Retomada checkpoint 8;
`docs/framework/arch/portal-build-pack.md` §2 (WP-P1…P6 executados) e §4 (OD-P15/P16/P17/P19/P26/
P88/P102/P103…P108); `work/rounds/R-0009/plan.md` §Retomada (o que R-0009 entregou: domínio
`portal`, projeções, SSE, fixtures `portal.service_catalog`); `contracts/CTG-0004.md` §2–§5;
`docs/meta/knowledge-base/backlog.md` (itens R-0014); `portal-frontends.md` §10 (inteiro).

Correção (só `portal-frontends.md` §10): reescrever a tabela "Dependência | Situação ao fim de
R-0014" com uma linha por dependência e a fonte entre parênteses — domínio `portal` e projeções:
**entregues em R-0009 (PC-0006)**; comandos delegados do `inf`: pendentes (R-0007;
`delegacao_indisponivel_r0007`, M15); gov.br federado: pendente (OD-P15, IdP simulado nos perfis
`test`/`local`); adapter `CdtPort`/`SnePort`: **usados pelo Portal contra o `senatran-mock`**
(CTG-0004 §2–§4; homologação real pendente OD-P16); projeções BOAT/PEC: pendentes (OD-P19; hoje
fixtures `crash_view`/`exam_view`); Carta de Serviços: dados em `portal.service_catalog` (fixture,
OD-P26); push: inscrição M9 entregue, VAPID pendente (OD-P88); decisões abertas: DT-026/031
respondidas (OD-P03/P05, flags), DT-050 (OD-P01, PN 001/2025), CETRAN-AM. Depois, o parágrafo
"Estado ao fim de R-0014" coerente com a tabela; **OD-P102**: escreva o que A12(a) fixa — a regra
`status 0 → offline` vive só no `ErrorBoundary`; OD-P102 fica como unificação futura sem
duplicação a absorver (não "fechada", salvo se o backlog a listar como fechada — mantenha os dois
coerentes; cite a fonte).

Validação: `node tools/docs/kb/check.mjs` → OK; `pnpm docs:kb:publish-check` → OK;
`node_modules/.bin/prettier --check docs/framework/arch/portal-frontends.md` → OK.

Entrega (última mensagem, formato da TASK-0012, "Tarefa: TASK-0012 (iteração 3)").
