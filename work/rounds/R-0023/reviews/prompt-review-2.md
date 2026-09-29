# R-0023 O1 — ciclo de correção da prompt-review única

Papel: **Auditor**. Você é o mesmo reviewer Claude Code Opus 5.5, somente
leitura. Este é o ciclo 2 da **mesma** prompt-review do bootstrap, não uma
revisão nova de escopo. Leia `reviews/prompt-review-1.json`, depois somente
as alterações em `prompts/TASK-0001.md`, `prompts/TASK-0002.md` e
`plan.md` relativas aos achados 1–12. Confira `tasks/TASK-0001.json`,
`tasks/TASK-0002.json` e `compositions.json` apenas para verificar os hashes
atualizados. A saída é exclusivamente o mesmo JSON do ciclo 1, com
`mode: "prompt-review"`, `round: "R-0023"`, `verdict`, `findings` e `notes`.

**Serialização obrigatória:** JSON RFC 8259 válido, sem Markdown, sem
comentários e sem quebras de linha dentro de strings. Se não houver achados,
retorne exatamente
`{"mode":"prompt-review","round":"R-0023","verdict":"PASS","findings":[],"notes":[]}`.
Não explique cada correção em `notes`; use `notes: []` também em `REVIEW` ou
`FAIL` e descreva somente os achados restantes em `findings` com strings
curtas sem backticks.

Avalie somente a correção dos achados anteriores. Um achado novo em texto
inalterado só é admitido se for `FAIL` por contradição canônica, com explicação
de por que não apareceu no ciclo 1. A data 2026-09-30 é expressamente a data
de autorização indicada pelo Owner no prompt desta sessão, ainda que o relógio
do host marque 2026-09-29; preserve a declaração do Owner. `pnpm check` da
linha de base segue em execução e será registrado antes do despacho.

Em especial, confira se o contrato exigido pelo novo prompt jamais atribui
`allow` a guardas ou camadas internas não avaliadas, e se combinações de
principal não materializáveis são identificadas sem fabricar célula. A
autorização é apenas O1; os textos históricos de O2–O5 serão harmonizados na
retomada, conforme a própria OD-S15-01 do plano.
