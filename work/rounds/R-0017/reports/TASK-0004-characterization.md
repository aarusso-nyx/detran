# TASK-0004 — caracterização de seed no banco descartável

Papel: Architect (Constitution Article 7). Data: 2026-09-27.

Ambiente isolado: container temporário `detran-r17-ctg2-probe`, imagem
`postgis/postgis@sha256:44126d872ac91993766c341e369c539e8196614321765d36a6f1bab0419a5fa5`,
`--platform linux/amd64`, porta `127.0.0.1:55433`, sem volume nomeado. O
container não existia antes do ensaio; `docker stop` o removeu (`--rm`).
Nenhum serviço externo real ou banco preexistente foi usado.

1. `backend/database/apply.sh --full` com `DB_NAME=detran_local_stack`,
   `DETRAN_LOCAL_STACK_FULL_AUTHORIZED=1` e conexão ao container descartável:
   exit 0, `apply.sh: done (full=1 db=detran_local_stack)`.
2. `SEED_PROFILE=fresh bash backend/database/seed.sh` no mesmo banco: exit 0,
   17 arquivos listados, `seed.sh: done (profile=fresh db=detran_local_stack)`.
3. `psql -X -q -v ON_ERROR_STOP=1 --single-transaction -f
   backend/database/seed/40-fixtures-rait-org.sql -f
   backend/database/seed/60-fixtures-rait-integration.sql`: exit 3, transação
   revertida. Saída determinante:

   ```text
   psql:backend/database/seed/40-fixtures-rait-org.sql:27: ERROR:  insert or update on table "rait_jeton_line" violates foreign key constraint "fk_inf_rait_jeton_line_member"
   DETAIL:  Key (member_id)=(00000000-0000-7000-8000-000021000008) is not present in table "rait_pool_member".
   ```

4. `psql -X -q -v ON_ERROR_STOP=1 --single-transaction -f
   backend/database/seed/60-fixtures-rait-integration.sql` isolado, após o
   rollback do passo 3: exit 0. Logo, a primeira falha da combinação ocorre
   em 40, não em 60; isto não prova que 60 é suficiente para o perfil novo.

O contrato CTG-0002 deve derivar fixtures RAIT locais compatíveis com a base
`21-fixtures-rait-fresh.sql`, sem alterar os perfis `fresh` e
`legacy-upgrade` nem copiar referências de membros dos 20 casos legados.
