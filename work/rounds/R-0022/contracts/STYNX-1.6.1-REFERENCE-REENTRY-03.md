# R-0022 — referência geração03 em novos subjects do cluster02

Architect/F1, 2026-10-13. Extensão técnica de 8aab/4e225/f7f6 sob a instrução humana de terminar adoption não bloqueada. Preserva todas as fontes, freezes, outputs e DBs01/02. F1 não executa SQL/SDK. Ativo agora: somente criação/identificação de três novos bancos pelo root, sob lease exclusivo; instalação/referência exige capture F3, fonte corrigida congelada e lease de execução seguinte.

## Entrada verificada e razão

Actual fd497 parou depois de applied/receipt/replay: fixture unkeyed foi corretamente received/OFFLINE_SYNC_LEGACY_ITEM_NOT_APPLIED, não pending. Outcome fc1241f3a3038a76ffc4ea69ea4d255a1003f2ee48c952b8f44c9eb2196ca3a9 e retorno Engineer6211cbce879dc67a724b109856f30eb8e5e453b07d964203d4337aac22f54772 permanecem RED/incomplete, nunca equivalência ou defeito upstream.

F3 READ ONLY02 report6ebd02fc5bd682728acd6c558a7630baf981e6db3be6dbe31ceb6c1d6ff4276a, manifest a39710ece94f7ea527603331d3a783e86660031ead5e0d3e067737946baebb66 e retorno7bb80268ccde4db5118c89f00e0f9d5697a4672e198da54c09a8d9c1f1888d4f foram lidos/rehashed por F1, incluindo todos21 records. Roles atuais incluem somente os três fixtures esperados além de initdb: role_app_backend e role_auditor_min NOLOGIN, role_r22_161_app LOGIN; todos NOINHERIT/NOSUPER/NOBYPASS/NOCREATE/NOREPLICATION. Única membership fixture: login→app, SET TRUE/INHERIT FALSE/admin FALSE. Nenhum parent privilegiado/database CREATE alcançável nem sessão abandonada foi observado. Reuso do postmaster02 é admissível somente com nova verificação real desses fatos antes de CREATE, sem ALTER/GRANT/repair global. Drift/atividade inesperada é STOP.

## Criação03 fechada

Manter cluster02 original: system_identifier7696293464811719840, postmasterPID64859, TCP127.0.0.1:65462, sockets vazios, PostgreSQL18.2, datadir absoluto `/Users/aarusso/.codex/worktrees/detran-r22-adoption-160/detran/scratch/r22-adoption-161/db-rehearsal/cluster-02/data`. Rehash quatro binaries canônicos/guard de pidfile+SQL como3c392, comparar versão/sysid/data_directory/PID/port real imediatamente antes de qualquer CREATE. Não iniciar/recriar cluster, trocar endpoint, matar sessões ou usar shared server.

Novo evidence root absoluto: `/Users/aarusso/.codex/worktrees/detran-r22-adoption-160/detran/scratch/r22-adoption-161/db-rehearsal/cluster-02/generation-03`. Root cria lease R0022-161-CLUSTER02-G03-CREATE, grantee root, registra comandos, identidades/roles/activity read-only, stdout/stderr, creation.sql, subject-manifest.json e explicit lease return. Diretório deve estar ausente; bytes inesperados/nome já existente STOP, nunca rm/drop/retry automático. Manifest03 lista exatamente os três subjects abaixo com OIDs/owner reais capturados após cada criação; não inventar OIDs, reuse de OIDs antigos ou pristine cluster-wide: apenas novos bancos são pristine e roles fixture são preexistentes observados.

Com conexão canônica fixa:

```sh
env -i PATH=/usr/bin:/bin LANG=C LC_ALL=C /Applications/Postgres.app/Contents/Versions/18/bin/psql -X -v ON_ERROR_STOP=1 -h 127.0.0.1 -p 65462 -U postgres -d postgres
```

Depois dos guards, somente três comandos fora de transação:

```sql
CREATE DATABASE detran_r22_161_g03_ref160 OWNER postgres TEMPLATE template0 ENCODING 'UTF8';
CREATE DATABASE detran_r22_161_g03_refprefix8 OWNER postgres TEMPLATE template0 ENCODING 'UTF8';
CREATE DATABASE detran_r22_161_g03_upgrade OWNER postgres TEMPLATE template0 ENCODING 'UTF8';
```

Nenhum grant/role/schema/extension/seed/storage/SDK nesta fase. Preservar seis bancos02 e todos01; não tocar seus defaults/ACLs/rows. CREATE parcial não é atômico: preservar o que ocorreu e STOP. Sem remoção, renomeação, reutilização dos bancos fresh/negative/full ou compensação.

F3 recebe lease READ ONLY depois do retorno root: verifica identidade postmaster, três OIDs/owners reais, full pristine catalog/database ACL/default privileges dos novos subjects, roles e membership/SET closure inalteradas, atividade limpa. Captura RR READ ONLY/UTC/RLSon/origin, SQL-text times e rollback/return. Fonte fixa03 só será ligada aos hashes reais dessa capture; nenhum caminho/OID/subject selector genérico, zero fallback02-original/01.

## Fonte/sensores antes da próxima execução

F2/F3 podem preparar correções fonte/testes agora, preservando fd497 e outputsSTOP. Todos21 objetivos/assertions da geração02 permanecem; expectativas de subject mudam prospectivamente para três nomes03 e hashes reais posteriores. Caso unkeyedreceived permanece distinto. Novo keyed retryable caso usa idempotencyKey real da fixture, payload hash público em ambos input e port e plain Error controlado depois de efeito real no applier; não HttpException/numbering/configuration error. Fonte prior postgres-durable.js SHA7d813ad6b1b686d72fda0c34993348638823459fa55aa33fa688994bc7bf9be6:610/998–1018 fundamenta pending, retryable e rollback do efeito. Retain receipt/context/attempts/exact error, sequence snapshots; não fabricar rows/status.

A auditoria estática dos casos também exige preservar block→close como negativo exato OFFLINE_SYNC_RESERVATION_STATE (prior244–255). Close positivo usa terceira reserva realmente reserved; reconcile dessa reserva consumed com claims vazios conserva seu estado como no-op público301–302. Mesmos métodos públicos já selecionados, nenhum novo SDK método ou fixture persona/tenant. Comparator recebe mesmas operações dos dois lados e raw IDs/times/receipts reais; não normalizar discrepâncias arbitrárias.

Fonte final03 deve retornar lease constante null, ter F3 sensores prospectivos e revisão F1/F3 completas. Só então root emite lease03 Engineer; integração exclusiva da constante exige inverse byte readback separado antes de executar. Falha preserva nova geração/cleanup/STOP, nunca rerun automático. Não admite baseline, suffix9, produção, trust/provider, integração/commit/PR ou resultado95S. Nenhuma falha anterior é apagada.
