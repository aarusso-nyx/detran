# Revisão restrita — correções da reconciliação pós-R-0009

Papel constitucional: **Auditor** (soft gate, Art. 18). Modo `prompt-review`,
rodada R-0010. Responda somente JSON válido, primeiro byte `{`, último byte
`}`. O Owner aprovou a opção 1 para o espelho RENAEST. Examine somente a
correção dos nove achados de
`reviews/prompt-review-22-projections-post-r0009.json` e contradições
diretamente introduzidas pela correção. Não reabra decisões anteriores sem
contradição canônica verificável.

Leia `docs/meta/agents/orchestra/reviewer-prompt.template.md`,
`work/rounds/R-0010/reviews/prompt-review-22-projections-post-r0009.json`,
`work/rounds/R-0009/closure.json`,
`docs/framework/blueprints/BP-PORTAL-PROJECTIONS-001.json`,
`backend/domains/portal/projections/src/handwritten/projectors.service.ts`,
`backend/domains/portal/projections/src/handwritten/crash-view.projection.ts`,
`backend/domains/portal/projections/src/handwritten/crashes.controller.ts`,
`backend/domains/portal/projections/src/handwritten/index.ts`,
`backend/domains/portal/projections/src/projections.module.ts`,
`work/rounds/R-0010/contracts/boat-projections.md`, os prompts e JSONs
`TASK-0012`…`TASK-0014`, suas entradas em
`work/rounds/R-0010/compositions.json`, os testes atuais
`backend/app/tests/integration/boat-projections.integration.spec.ts`,
`backend/app/tests/e2e/boat-projections.e2e.spec.ts` e
`tools/domain-boundaries/tests/verify-domain-boundaries.test.mjs`, mais
`work/rounds/R-0010/reports/TASK-0013-progress.md`.

Verifique estritamente que os nove achados foram corrigidos, incluindo:

1. deduplicação factual cobre as duas linhas reais da outbox por
   `(event.name, aggregate.id, aggregate.version)` sem enfraquecer o ledger por
   `event_id`;
2. Portal mapeia os aggregate kinds `crash-record` e
   `crash-renaest-submission`, lista os tópicos reais e substitui a janela
   incremental de `tick` por anti-join no ledger, preservando `inf.%`/`rait.%`;
3. a separação `schemaVersion`/`aggregate.version` é comportamental no Portal e
   persistida somente nos novos consumidores;
4. TASK-0014 não pode tocar `app.module.ts` nem `package.json` raiz durante o
   lock R-0007; o gate usa comandos diretos e o registro do script fica para o
   maestro após liberação;
5. TASK-0013 importa Dashboard/Espelho sem depender da composition root, usa
   seed 72 e não exige ramo cidadão positivo enquanto o vínculo canônico está
   `source_pending`;
6. hashes SHA-256, `pc_id`, `prompt_composition_id`, modelos, esforços,
   dependências e status conferem.

Um `PASS` libera apenas a nova iteração Inspector TASK-0013. `REVIEW` pede
correção localizada. `FAIL` indica contradição canônica, identidade inventada,
duplicação do Portal ou fronteira inválida.

Formato estrito:

{"mode":"prompt-review","round":"R-0010","verdict":"PASS | REVIEW | FAIL","findings":[{"severity":"high | low","item":1,"file":"work/rounds/R-0010/contracts/boat-projections.md","line":1,"claim":"fato verificável","fix":"correção localizada"}],"notes":[]}
