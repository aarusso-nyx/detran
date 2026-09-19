Papel: Inspector (Art. 6)  
Tarefa: TASK-0010 (iteração 4)  
Ambiente conferido: perfil e2e executado; teste encerrou sem processo Vitest ativo.  
Arquivos criados/alterados: `portal-journeys.support.ts`, `portal-journeys.e2e.spec.ts`, `portal-payload-lint.e2e.spec.ts`.  
Comandos executados e saída resumida: e2e final → `Tests 5 failed | 47 passed (52)`; `typecheck` → 0; `prettier --check` → OK; `pkill -f vitest` executado.  
Critérios de aceitação: PASS — A16 aplicado, seed de avaliação Prata incluído, C-4-41/43–47 corrigidos, typecheck e formatação verdes.  
Matriz C-4-nn → spec → caso:

| Critério | Spec | Caso |
|---|---|---|
| C-4-41 | portal-journeys | manifestação Prata `AVALIACAO_OFERECIDA`, cinco dimensões, 201 |
| C-4-43 | portal-journeys | GET AIT pagamento 200 |
| C-4-44 | portal-journeys | POST pagamento 422 M15; draft de id inexistente 404 request |
| C-4-45 | portal-journeys | submit M17 do mesmo id inexistente 404 request |
| C-4-46 | portal-journeys | 422 não altera `payment_json`/situação do AIT |
| C-4-47 | portal-journeys | 422 não publica tópico `*.payment.*` na outbox |

Vermelhos esperados (aguardam TASK-0011): C-4-24, C-4-25, C-4-28, C-4-29 e C-4-30 → CDT Prata indisponível: resposta observada 503 `PORTAL.NATIONAL_READ_UNAVAILABLE`, contrato requer 200.  
Fora do escopo / deixado: código de produção, mocks CDT e demais specs anteriores.  
OD tocadas ou propostas: nenhuma.  
Bloqueios: nenhum.

