# Revisão restrita das correções de prompt-review-7

Papel: Auditor; modo `prompt-review`; rodada R-0010. Leia
`work/rounds/R-0010/reviews/prompt-review-7.json`,
`work/rounds/R-0010/contracts/CTG-0001.md` §Adenda A-1,
`work/rounds/R-0010/prompts/TASK-0003.md` e
`work/rounds/R-0010/tasks/TASK-0003.json`. Avalie **somente** as duas correções
high e a nota low do veredito anterior. A adenda agora limita o teste desta
tentativa à matriz de política; fonte de identidade e erro ficam
`source_pending`/OD, sem rota cidadã ativa até definição. O prompt explicita
`test:integration` no critério, coloca testes DB no include desse tier e lê o
manifesto de gerados.

Use a rubrica de `docs/meta/agents/orchestra/reviewer-prompt.template.md`.
Responda somente um objeto JSON válido, compacto, sem Markdown, com `mode`,
`round`, `verdict`, `findings` e `notes`. O primeiro byte deve ser `{` e o
último `}`. `PASS` se não houver high remanescente; `REVIEW` para high corrigível;
`FAIL` para contradição canônica, ADR, decisão do Owner ou Constituição.
