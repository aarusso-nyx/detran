# Revisão restrita — reconciliação das projeções após R-0009

Papel constitucional: **Auditor** (soft gate, Art. 18). Modo `prompt-review`,
rodada R-0010. Responda somente JSON válido, primeiro byte `{`, último byte
`}`. O Owner aprovou a opção 1 para o espelho RENAEST. A R-0009 foi integrada e
fechada; sua implementação real de Portal tornou materialmente obsoleto o
desenho aprovado por `prompt-review-21-projections-correction.json`.

Leia `docs/meta/agents/orchestra/reviewer-prompt.template.md`,
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

Verifique estritamente:

1. contrato e prompts reutilizam `PortalProjectors`, `CrashViewProjector`,
   `PortalCrashesController` e o ledger Portal existentes, sem criar
   `BoatProjectionsReplayService`, `PortalCrashProjection`,
   `boat-crash.projection.ts` ou um segundo coordenador Portal;
2. TASK-0013 volta a REDs contra a superfície real, cobre ledger atômico,
   duplicata, replay/commit tardio, schema separado de aggregate version, RLS e
   ausência de exposição cidadã quando não há vínculo canônico, sem inventar
   identidade;
3. TASK-0014 estende apenas os arquivos manuscritos Portal existentes e mantém
   Dashboard/Espelho nos pacotes aprovados, com `app.module.ts`/manifests
   serializados enquanto a R-0007 ainda retém composição;
4. TASK-0012 continua concluída como contrato/blueprints, mas registra a emenda
   corretiva pós-R-0009 sem alterar blueprint/DDL/fontes geradas Portal;
5. hashes SHA-256, `pc_id`, `prompt_composition_id`, modelos, esforços,
   dependências e status (`TASK-0013=queued`, `TASK-0014=queued`) conferem;
6. o `prompt-review-21` é tratado como invalidado pelo fato novo, e nenhum
   Engineer é liberado por esta revisão antes de novos REDs válidos e do lock
   de composição.

Um `PASS` libera apenas a nova iteração Inspector TASK-0013. `REVIEW` pede
correção localizada. `FAIL` indica contradição canônica, identidade inventada,
duplicação do Portal ou fronteira inválida.

Formato estrito:

{"mode":"prompt-review","round":"R-0010","verdict":"PASS | REVIEW | FAIL","findings":[{"severity":"high | low","item":1,"file":"work/rounds/R-0010/contracts/boat-projections.md","line":1,"claim":"fato verificável","fix":"correção localizada"}],"notes":[]}
