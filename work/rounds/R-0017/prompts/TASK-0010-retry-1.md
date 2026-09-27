# Retry restrito - TASK-0010 (`transcriber-docs`)

> R-0017 `local-stack`; worktree
> `/Users/aarusso/.codex/worktrees/local-stack/detran`.
> O runner grava `work/rounds/R-0017/reports/TASK-0010-retry-1.md`.

Papel constitucional: **Architect (transcricao)**, Art. 6. Declare o papel
primeiro. A tentativa anterior parou sem produzir relatorio ou editar os
alvos apos uma leitura ampla de linhas historicas gigantes. E um
`sensor-error`, nao uma decisao de conteudo. Nao repita `sed` de intervalos
amplos em `waves.md`, `backlog.md` ou `open-decisions-rait.md`.

Leia somente `AGENTS.md`, `CODESTYLE.md`,
`docs/meta/agents/transcriber-docs.md`,
`work/rounds/R-0017/prompts/TASK-0010.md` (fronteira e criterios),
`work/rounds/R-0017/plan.md` somente os dois bullets mais recentes de
§Retomada, `work/rounds/R-0017/budget.json` apenas totais,
`work/rounds/R-0017/reports/TASK-0008-retry-1.md`,
`TASK-0009-retry-1.md`, `work/rounds/README.md` somente linha R-0017,
`docs/meta/knowledge-base/open-decisions-rait.md` somente §R-0017,
`docs/meta/knowledge-base/backlog.md` somente entradas que mencionam
R-0017 ou acao 4 de C-0002, e `docs/meta/agents/orchestra/waves.md`
somente cabecalho do Historico e linhas R-0016/R-0018. Para a tabela
historica, use `rg -n '^\\| R-001[68] ' ... | cut -c 1-300` ou leitura de
uma linha por vez; nao despeje linhas 55-75 inteiras no contexto. As
colunas de §Historico sao: Rodada, Frente, Abertura, Merge, Tarefas,
Ciclos de REVIEW, Escaladas, Tokens estimados, Ajustes ao metodo.

Pode tocar somente `docs/meta/agents/orchestra/waves.md` (acrescentar
linha R-0017), `docs/meta/knowledge-base/open-decisions-rait.md`
(§R-0017), `docs/meta/knowledge-base/backlog.md` (entrada acao 4/R-0017)
e `work/rounds/README.md` (linha R-0017). Nao toque em outras linhas
historicas, codigo, CI, testes, gerados, `record/**`, `.devai/**`,
`law/**`, `docs/meta/adr/**`, `docs/framework/product/**`,
`AGENTS.md`, `CLAUDE.md` ou rounds anteriores. Nao execute git,
instale pacotes, rode stack, mude policy/RLS/tenancy ou gates.

Fatos fechados: CTG-0001 PR #133 e CTG-0002 PR #143 mesclados,
CTG-0003 em execucao; OD-R17-001 SEFAZ mock seis rotas,
OD-R17-002 PAdES/biometria/conselho off, OD-R17-003 job manual apenas
`workflow_dispatch`, OD-R17-004 denuncia sintetica so em
`detran_local_stack`. Checkpoint (b) 42/42 e negativo exit 1; RC legado
21/21; `audit observe` do merge #143 no SHA
`f1dde3bc9029f52532865bafe14cda3cf770656b`. M1 confirmou Sol 6,
Terra/Luna e reviewer Opus 5.5. Budget dispensado pelo Owner; nao
invente contagem de tokens/ciclos, use `budget.json`/`plan.md` ou
`em apuracao`. Onze TASKs canonicas; TASK-0008/0009 concluidas com
retries, TASK-0010 em curso. Integracoes reais e PEC ficam fora.

Na linha R-0017 de `work/rounds/README.md`, use Estado `aberta`, PRs
`#133, #143`, PC `—` ate `devai round close` emitir o proximo recibo.
Esse e o vocabulario permitido por `tools/docs/state-index/check.mjs`;
nao invente `em execucao` nem `PC-0017`. Preserve o texto das ODs
decididas; A7 e esclarecimento tecnico, nao nova OD. Em `waves.md`,
adicione somente a linha R-0017 junto das rodadas numericas; linhas
R-0018/R-0019 sao intocaveis. O estado de CTG-0003 e historico, nao
fechamento da rodada.

Aceitacao: `pnpm verify:state-index`, `pnpm docs:check` e
`pnpm format:check` exit 0; diff somente nas linhas/autorizacoes
acima. Se a insercao na tabela longa nao puder ser feita com seguranca,
pare e relate a linha exata, sem reformatar a tabela inteira. Prettier
somente nos arquivos tocados. Nao invente valores; lacuna vira
`source_pending`/OD relatada ao maestro.

```markdown
Papel: Architect (transcricao)
Tarefa: TASK-0010 retry 1
Arquivos criados/alterados: <lista>
Comandos e resultados: <um por linha>
Criterios: <PASS/FAIL por item>
Fora do escopo: <lista>
OD tocadas/propostas: <ids ou nenhuma>
Bloqueios: <nenhum ou descricao>
```
