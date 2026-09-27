# Prompt-review — R-0017 CTG-0002 / TASK-0004

Papel: Auditor externo (Constitution Article 7), família Claude Opus 5.5.
Somente leitura na worktree
`/Users/aarusso/.codex/worktrees/local-stack/detran`. Não escreva arquivos,
não execute `git` e responda **somente** com o JSON abaixo.

## Contexto e leitura fechada

1. `docs/meta/agents/orchestra/README.md` §4–5,
   `docs/meta/agents/orchestra/reviewer-prompt.template.md` (rubrica).
2. `work/rounds/R-0017/plan.md` §Metas 3–5, §Tarefas, §Checkpoints, §Adenda A4 e
   §Decisoes do maestro; `docs/meta/knowledge-base/open-decisions-rait.md`
   §R-0017 (OD-R17-001/002/003 decididas pelo Owner).
3. `work/rounds/R-0017/reports/TASK-0004-characterization.md`,
   `work/rounds/R-0017/contracts/CTG-0001.md` §Config/Matriz/Criterios,
   `work/rounds/R-0017/tasks/TASK-0004.json` e
   `work/rounds/R-0017/prompts/TASK-0004.md`.
4. Apenas para conferir fontes citadas pelo prompt: `backend/database/seed.sh`,
   cabecalhos de `backend/database/seed/{21-fixtures-rait-fresh,40-fixtures-rait-org,60-fixtures-rait-integration}.sql`,
   `packages/sefaz-adapter/src/{http-adapter,domain}.ts` e os quatro OpenAPI
   de leitura listados no prompt.

## Rubrica

Ciclo de confirmacao: a tentativa anterior retornou `PASS` mas com prosa
antes do JSON, logo a bridge rejeitou o formato. Dois lows apontaram a
localizacao incorreta da linha 199 e a ausencia de `revision.test.mjs` na
leitura fechada; ambos foram corrigidos. Confira essas correcoes, o PC
`PC-edef98f28fee211b` e eventuais regressoes. Nao reabra achados resolvidos.

Julgue se a TASK-0004
tem papel Architect e fronteira disjunta; leitura fechada suficiente; seis
rotas e DTOs SEFAZ corretos; falha real de FK caracterizada sem relaxar
`fresh`/`legacy-upgrade`; OD-R17-001/002/003 respeitadas; rotas de smoke
apenas candidatas ate prova de policy/fixture; 503 dos externos realmente
alcançam o adapter; criterios C-02-nn verificaveis; nenhuma integracao real,
credencial real, fixture PEC ou alteracao de RLS/policy; esforco/modelo
proporcionais.

Confira a substituicao estreita de C-01-07/11 pela A4 e a instrucao de
preservar os demais sensores. Verifique o PC `PC-edef98f28fee211b` contra
o arquivo final.

`PASS` = nenhum achado high; `REVIEW` = high corrigivel sem mudar plano;
`FAIL` = contradicao com decisao do Owner, fonte canonica, Constituicao ou
fronteira de escrita. Cite linha e correcao concreta. Notas low nao bloqueiam.

## Saida JSON unica

O primeiro caractere da resposta deve ser `{` e o ultimo `}`. Nunca inclua
bloco de codigo ou cercas Markdown. Retorne JSON estrito, sem prosa externa. Escape toda aspa interna
em strings com `\"`; prefira claims e fixes curtos sem citacoes literais.
Cada finding deve ter claim/fix em uma unica linha JSON. Nao use trailing
commas. Se nao houver achados, use `"findings": []`.

A resposta tem chaves `mode`, `round`, `verdict`, `findings` e `notes`.
Use `mode=prompt-review`, `round=R-0017`; cada finding tem `severity`,
`item`, `file`, `line`, `claim` e `fix`. Responda com o objeto JSON somente.
