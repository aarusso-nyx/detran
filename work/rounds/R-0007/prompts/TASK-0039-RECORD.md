# TASK-0039 — registro normalizado da preparação Engineer fresh/legacy

Este arquivo documenta após o despacho direto do OWNER/maestro as instruções
executadas. **Não é o byte stream original da mensagem ao worker** e não
redefine o limite histórico. Papel Engineer Art. 6, Terra/High, worktree
`orchestra/rait-backend`, um escritor. Leitura vinculante: AGENTS.md,
manual Engineer, ADR-0024, contrato C4-OD e checkpoint TASK-0038.

Allowlist exclusiva: `backend/database/seed.sh` e novo
`backend/database/seed/21-fixtures-rait-fresh.sql`. Separar perfil fresh padrão
de perfil legacy-upgrade explícito, listas fechadas, uma conexão/transação
`psql -X ON_ERROR_STOP --single-transaction`; gate de 20 legados antes de
escrita. Fresh cria caso contemporâneo com política vigente, secretário/pool
válidos e qualificação oficial none no mesmo instante do protocolo;
reaplicação idempotente. Não tocar seed20, DDL19, parâmetros, histórico,
outros produto/testes, banco principal, record, sibling. Testar em scratch
descartável explicitamente nomeado; relatar hashes, contagens e rollback.

Resultado: fresh 2x PASS em scratch, 1 case/1 assessment none/0 bases,
assessed_at=protocolled_at; legacy-upgrade recusado 0/20 antes de escrita.
Correção pontual posterior alinhou assessed_at a protocolled_at. Scratch
removido. Perfil legacy-upgrade também executado pelo maestro no banco
dedicado autorizado com exit 0. Revisão independente posterior PASS do hash
final. Sem commit/push/merge.
