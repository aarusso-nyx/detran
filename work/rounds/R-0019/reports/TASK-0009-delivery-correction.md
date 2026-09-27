Papel: Inspector
Tarefa: TASK-0009 — correção de entrega, iteração 1/2
Arquivos alterados: `tools/law/tests/verify.test.mjs`; apenas testes/helpers novos, sem alteração dos anteriores.
Comandos/resultados: Prettier autoral PASS; `node --check tools/law/tests/verify.test.mjs` PASS; `pnpm law:test` 56/56 PASS; mutações em cópia descartável fora do repositório, 19/19 GREEN→RED ao suprimir apenas o código de violação alvo. `pnpm format:check` do Inspector encontrou um prompt de revisão do maestro sem formatação, fora de sua fronteira; maestro formatou o prompt e repetiu o gate global: PASS.
Critérios: PASS — cada ramo adicional de §5 tem teste negativo direto com código de violação e caminho/ID alvo. Nenhum gap no verificador foi encontrado.

| Ramo | Código suprimido na cópia descartável | Resultado |
| --- | --- | --- |
| Termo GE duplicado, caixa ignorada | `GLOSSARY_TERM_DUPLICATE` | GREEN→RED |
| GE fora de draft | `GLOSSARY_STATUS_INVALID` | GREEN→RED |
| Proveniência GE ausente | `GLOSSARY_PROVENANCE_MISSING` | GREEN→RED |
| Invariante GE inexistente | `GLOSSARY_INVARIANT_UNRESOLVED` | GREEN→RED |
| Mapeamento JRN↔JNY trocado | `JOURNEY_DIVERGENT` | GREEN→RED |
| Título JNY divergente | `JOURNEY_DIVERGENT` | GREEN→RED |
| Título UC divergente | `USE_CASE_DIVERGENT` | GREEN→RED |
| Bundle UC errado | `USE_CASE_DIVERGENT` | GREEN→RED |
| Caso duplicado entre bundles | `BUNDLE_ID_DUPLICATE` | GREEN→RED |
| Ator fora de roles | `USE_CASE_ROLE_UNDECLARED` | GREEN→RED |
| Atores vazios | `USE_CASE_DIVERGENT` | GREEN→RED |
| JNY sem steps | `JOURNEY_CONTENT_INCOMPLETE` | GREEN→RED |
| JNY sem AC | `JOURNEY_CONTENT_INCOMPLETE` | GREEN→RED |
| JNY sem persona | `JOURNEY_CONTENT_INCOMPLETE` | GREEN→RED |
| JNY fora de draft | `JOURNEY_CONTENT_INCOMPLETE` | GREEN→RED |
| Total fonte JRN ≠ 40 | `JOURNEY_SOURCE_COUNT_DIVERGENT` | GREEN→RED |
| Total saída JNY ≠ 40 | `JOURNEY_OUTPUT_COUNT_DIVERGENT` | GREEN→RED |
| Total fonte UC ≠ 110 | `USE_CASE_SOURCE_COUNT_DIVERGENT` | GREEN→RED |
| Total bundle UC ≠ 110 | `USE_CASE_OUTPUT_COUNT_DIVERGENT` | GREEN→RED |

Fora do escopo: gate, conteúdo law/product, fonte, registro e DEVAI intactos; nenhum Git pelo worker.
OD: nenhuma.
Bloqueios: nenhum.
