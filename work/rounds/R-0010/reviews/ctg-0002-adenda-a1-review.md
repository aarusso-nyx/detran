# Revisão de adenda de arquitetura — CTG-0002 A-1

Papel: Auditor (soft gate), família Claude Opus, modo `prompt-review`, rodada
R-0010. Trabalhe somente em leitura na worktree. Revise exclusivamente a
adenda A-1 em `work/rounds/R-0010/contracts/CTG-0002.md` contra:

- `docs/meta/adr/ADR-0018-documents-and-signature-substrate.md`;
- `backend/domains/shared/src/documents/documents-facade.ts`;
- `docs/meta/adr/ADR-0020-read-models-and-projections.md`;
- `docs/framework/arch/boat-build-pack.md` WP-B2;
- `docs/framework/arch/boat-route-contract.md` §7;
- `docs/framework/product/transversal/dashboard/rules/RN-DASH-161.md`;
- `docs/framework/product/domains/est/boat/rules/RN-BOAT-131.md`;
- `docs/framework/product/transversal/dashboard/screens/IU-DASH-001.md` §D/E;
- `backend/database/ddl/01-schemas.sql`, `20-rls-policies.sql`, `70-est-crash.sql`;
- `docs/framework/blueprints/BP-EST-CRASH-001.json`.

Perguntas fechadas: a adenda preserva os critérios C-2-05/06/08/13/14 sem
inventar regra de produto? Reconhece corretamente os substratos ausentes e
suas fronteiras? Há decisão do Owner que bloqueie a projeção interna agora?
Há ação indispensável omitida antes de compor novos prompts Architect →
Inspector → Engineer? Não revise CTG-0001 nem outros arquivos.

Responda apenas JSON válido e compacto, primeiro byte `{`, último `}`:
`{"mode":"prompt-review","round":"R-0010","verdict":"PASS|REVIEW|FAIL","findings":[{"severity":"high|low","item":1,"file":"...","line":1,"claim":"...","fix":"..."}],"notes":["..."]}`.
`PASS` quando a adenda permite compor tarefas sem contradição canônica;
`REVIEW` se faltar correção local; `FAIL` somente por decisão do Owner/ADR/
Constituição contrariada ou fronteira material impossível.
