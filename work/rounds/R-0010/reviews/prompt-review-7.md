# Revisão restrita — correção de TASK-0003 após a primeira execução

Papel: Auditor. Modo `prompt-review`, rodada R-0010. Leia
`docs/meta/agents/orchestra/reviewer-prompt.template.md`,
`work/rounds/R-0010/reviews/prompt-review-6.json`,
`work/rounds/R-0010/plan.md` §Triagem,
`work/rounds/R-0010/reports/TASK-0003-attempt-0.md`,
`work/rounds/R-0010/contracts/CTG-0001.md`,
`work/rounds/R-0010/prompts/TASK-0003.md`,
`backend/domains/shared/src/roles.ts` e
`docs/framework/arch/boat-route-contract.md` §3.

O veredito anterior para os prompts foi PASS. A execução revelou um
`reference-gap`: o Inspector não tinha DDL, blueprint nem seed script em sua
lista fechada e deixou fixtures e critérios C-1-nn sem teste. A tentativa 1
acrescenta essas fontes e exige a matriz completa. A adenda A-1 traduz
“Portal (titular)” para o papel canônico existente `CIDADAO`, com verificação
de titularidade, sem novo papel ou grant de leitura de vítima.

Avalie somente a suficiência e segurança dessas mudanças para redespachar o
Inspector. Um `high` corrigível dá REVIEW; contradição com fonte canônica,
decisão do Owner, ADR ou Constituição dá FAIL; nenhum high dá PASS. Cite
arquivo e linha para cada achado.

Responda somente um objeto JSON válido, compacto, sem cerca Markdown, com
`mode`, `round`, `verdict`, `findings` e `notes`. O primeiro byte deve ser `{`
e o último `}`.
