Papel: Engineer  
Tarefa: TASK-0007 retry 1

Arquivos criados/alterados:
- `tools/detran-stack.sh`
- `tools/stack/smoke.mjs`
- `tools/stack/ch-fixture.sh`

Comandos e resultados:
- `pnpm test:stack` — PASS, 48/48.
- `pnpm exec prettier --check tools/stack/smoke.mjs` — PASS.
- `pnpm format:check` — iniciado duas vezes; não concluiu dentro do limite de execução de 30s do runner.
- `node tools/stack/smoke.mjs` com backend parado — exit não-zero, gravou relatório final com `backend_unreachable`; nenhuma fixture ou reinício.
- `DB_NAME=not_detran_local_stack bash tools/detran-stack.sh fixture-ch` — recusa antes de SQL.
- `node --check tools/stack/smoke.mjs` e `bash -n` dos scripts — PASS.

C-02-04/05/06:
- C-02-04: PASS offline de estrutura; live não executado. A CLI agora prepara fixture CH, troca personas, usa proxy e exige os três 503/mensagens reais.
- C-02-05: FAIL/pending live. A CLI valida IDs, tenant e camada N1; porém `70-fixtures-portal.sql` não contém uma linha `portal.complaint`, apesar de o contrato exigir essa fixture.
- C-02-06: PASS offline para preflight negativo e evidência agregada; checkpoint live não executado.

Guarda outro banco:
- Comando: `DB_NAME=not_detran_local_stack bash tools/detran-stack.sh fixture-ch`
- Exit: não-zero.
- Mensagem: `detran-stack: stack database is restricted to DB_NAME=detran_local_stack`

Processos ao final: nenhum iniciado.

Bloqueios e adenda/OD proposta:
- Propor adenda para corrigir a referência de C-02-05 ou incluir uma fixture `portal.complaint` concreta no perfil local; sem isso, Portal não pode provar leitura não-vazia pelo ID exigido.