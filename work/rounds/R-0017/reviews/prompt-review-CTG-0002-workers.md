# Prompt-review — R-0017 CTG-0002 / TASK-0005…0007

Papel: Auditor externo (Constitution Article 7), familia Claude Opus 5.5.
Somente leitura em `/Users/aarusso/.codex/worktrees/local-stack/detran`.
Nao escreva arquivos nem execute `git`.

## Leitura fechada

1. `docs/meta/agents/orchestra/README.md` §4–5 e
   `docs/meta/agents/orchestra/reviewer-prompt.template.md`.
2. `work/rounds/R-0017/plan.md` §Metas 3–5, §Tarefas, §Checkpoints, §A4 e
   §Decisoes; `contracts/CTG-0002.md` no mesmo diretorio da rodada.
3. `prompts/TASK-0005.md`, `prompts/TASK-0006.md`, `prompts/TASK-0007.md`,
   `tasks/TASK-0005.json`, `tasks/TASK-0006.json`, `tasks/TASK-0007.json`,
   `compositions.json` sob `work/rounds/R-0017/`.
4. Para conferir a realidade: `backend/database/seed.sh`,
   `backend/domains/inf/rait-case/tests/integration/rait-seed-profiles.integration.spec.ts`,
   `tools/detran-stack.sh`, `tools/stack/revision.test.mjs`,
   `packages/sefaz-adapter/src/{domain,http-adapter}.ts`,
   `backend/app/src/app.module.ts` apenas SEFAZ/CH,
   `backend/domains/shared/src/{roles,policy}.ts` e os controllers/services
   CH que CTG-0002 cita.

## Rubrica

Ciclo de confirmacao: `reviews/prompt-review-CTG-0002-workers-2.json`
marcou REVIEW por dois highs. TASK-0006 nao exige mais o runner RC que
requer worktree limpa/publicada; o spec de seed roda diretamente no scratch.
TASK-0007 sucede TASK-0006, nao exige smoke live como comando isolado e
deixa checkpoint (b) ao maestro. `tsx` carrega o adapter TS real; o
Inspector distingue 503 do adapter por mensagem fixa. Confirme essas
correcoes e os PCs `PC-bb017ff951cec692`, `PC-95cc7a37908fe373` e
`PC-208a69381c3766dc`, sem reabrir achados resolvidos.

Confira hashes/PCs das tres tarefas, modelos e
esforcos do plano, sequencia Architect→Inspector→Engineer e fronteiras de
escrita disjuntas. O Inspector pode criar sensores vermelhos mas nao
enfraquecer CTG-0001 fora A4; Engineer seed nao pode tocar testes ou perfis
historicos; Engineer stack nao pode tocar backend ou testes. Confira se
escopos permitem todos os C-02, em especial seis rotas pelo adapter real,
`localhost`/IPv4, quatro leituras por proxy, tres 503 CH que alcancem o
adapter, seguranca/cleanup e checkpoint (b). Aponte qualquer requisito
impossivel ou lacuna que faria a entrega parecer verde sem prova. Nao
reabra ODs do Owner; nenhuma integracao externa real ou PEC fixture.

`PASS` = sem high; `REVIEW` = high corrigivel sem mudar decisao do Owner;
`FAIL` = contradicao de decisao/fonte/Constituicao. Cite linha e correcao.

## Saida

Responda somente com **um objeto JSON valido**. Primeiro caractere `{`,
ultimo `}`; nenhum bloco Markdown nem prosa. Chaves obrigatorias: `mode`
igual a `prompt-review`, `round` igual a `R-0017`, `verdict` em
`PASS|REVIEW|FAIL`, `findings` array de objetos com `severity`, `item`,
`file`, `line`, `claim`, `fix`, e `notes` array. Escape aspas internas nas
strings, sem trailing commas.
