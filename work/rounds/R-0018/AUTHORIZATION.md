# Autorização — R-0018 `index-state`

status: active

GRANTED

Owner Antonio A. Russo autorizou explicitamente, em 2026-09-26, na sessão do maestro, a abertura
da rodada R-0018 e a execução de `work/rounds/R-0018/prompts/00-maestro.md` e de
`work/rounds/R-0018/plan.md` (C-0002 rev. 2, ação 3). Pré-condições conferidas em `origin/main`
`220a4020`: campanha C-0002, ADR-0034 com a linha em `docs/meta/adr/README.md`, e o plano e o
prompt desta rodada versionados.

Maestro: Opus 5.5 (Claude Code, `claude-opus-5-5`). Workers da mesma família por subagentes
nativos: Opus 5.5 (`architect-blueprint`) e Sonnet 5 (`transcriber-docs`, `inspector-tests`,
`engineer-backend`). Reviewer: Sol 6 (`codex gpt-6-sol`) pela ponte
`tools/orchestra/bridge.sh codex`.

A autorização não inclui aplicar os patches de `CLAUDE.md`/`AGENTS.md` (OD-R18-003), nem decidir
OD-R18-001 (série `law/adr`) ou OD-R18-002 (aceitação da ADR-0022): essas decisões ficam com o
Owner e são registradas em `plan.md` §Decisões do maestro quando tomadas.

## Emenda 1 — ciclo 2 do prompt-review após FAIL estrutural

Owner Antonio A. Russo autorizou, em 2026-09-26, depois do FAIL do `prompt-review-1` (oito
achados `high` estruturais, nenhum de contradição canônica ou decisão do Owner; `plan.md` B1), um
`prompt-review-2` restrito aos itens corrigidos e, com `PASS`, o disparo do CTG-0001. Um novo
`FAIL` ou `REVIEW` depois desse ciclo para a rodada e volta ao Owner. A emenda não altera escopo,
critérios, papéis nem famílias.

## Emenda 2 — execução até a conclusão; escalada de delivery-review

Owner Antonio A. Russo, em 2026-09-26, reabriu a sessão do maestro com "permissão total para
conseguir atingir o seu objetivo que é a conclusão completa do Round-R-0018". Com base nisso, o
maestro aplica a escalada do método (`orchestra/README.md` §6) quando um item esgota os dois ciclos
de revisão: nova iteração no **nível acima da mesma família** (Sonnet 5 → Opus 5.5) e um ciclo de
revisão restrito ao item, registrado em `plan.md` §Triagem. A emenda não autoriza decidir
OD-R18-001…004 nem aplicar os patches de `CLAUDE.md`/`AGENTS.md`, que continuam dependendo de
resposta explícita do Owner. A mesma instrução é o registro de que o limiar de orçamento por janela
(80 %, `budget.json`) não interrompe a rodada; o consumo continua contabilizado.
