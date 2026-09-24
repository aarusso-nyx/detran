# TASK-0008 attempt 1 — blocked before writes

Papel constitucional: **Inspector**.

O Inspector foi interrompido antes de escrever testes, fixture, policy ou qualquer produção. Cinco
lacunas fail-closed foram confirmadas por auditoria independente:

1. o fixture 29 não está nas listas fechadas de `backend/database/seed.sh`;
2. `apply.sh` desconhece DDL 21 e restringe `--full` ao rehearsal histórico R7;
3. o typecheck verde é impossível antes dos onze módulos handwritten, embora o plano reconheça esse
   RED intermediário;
4. as fontes não contêm matriz completa operação → atores canônicos/vínculos dinâmicos;
5. o contrato omite os headers de concorrência/idempotência e respostas correlatas exigidos.

Uma consulta `git status --short` somente leitura foi executada pelo worker antes de observar a
vedação. Não houve mutação. Reset e seed foram fail-closed; nenhum banco foi alterado.
