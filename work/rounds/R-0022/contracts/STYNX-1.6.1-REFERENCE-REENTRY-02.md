# R-0022 — geração descartável02 para reentrada da referência

Architect/F1, 2026-10-13. Autoridade é a instrução humana existente para terminar
adoption não bloqueada, não o report externo. Extensão técnica de B7a-ACT/8aab/
4e225; preserva todos os bytes/evidência/DBs cluster01 e freezes anteriores.
Não exige nova decisão Owner para criar outro rehearsal descartável. F1 não
executa comandos/SQL/SDK. **Ativo agora somente criação/identificação02 pelo root**;
storage/roles/seed/reference execution aguardam capture/review/lease próprios.

## Motivo e custódia da falha01

Actual reference420f parou: fixture enviou barehex enquanto public prior
canonicalOfflineSyncPayloadHash exige sha256:<hex>; plataforma corretamente
gravou integrity attempt e não criou canonical receipt. Fingerprint comparison
também esperava formato errado. Resultadoae09c9aa6a80174a5713ab6dad8b4017be7d22854f76ddaed78e5b6446cc3e01
é HARNESS_RUNTIME_RED_NOT_PARITY_EVIDENCE, não rollback global ou equivalência.
F2 lease returnc5f41da432a61122604e75bb1b70fabe6c5fa9d26ca5455f61528feefc5fc1db
encerrou execução; F3 diagnóstico READ ONLY63440292e60e4d992d823171a4db2015c15eacc58aa254996fa91d0dcef1c071
continua exclusivo em01. Não resetar, corrigir rows, reusar business clock ou
sobrescrever outputs01. Somente disposição read-only separada relata seu estado.

Fonte2491f24fb1bce5e70503151ed9fc43b172d046b83eea7a52f03ee36c19418e93
tem correções public hash/fingerprint e lease null; ainda não autoriza rerun.
Não chamar essa falha de defeito upstream, nem esconder o RED com nova geração.

## Criação02 — passos fechados

Novo root absoluto:
`/Users/aarusso/.codex/worktrees/detran-r22-adoption-160/detran/scratch/r22-adoption-161/db-rehearsal/cluster-02`.
data/, postgres.log, creation.sql, commands/logs, creation-lease.json e
subject-manifest.json ficam somente nele; reference-proof/ futuro é novo.
Data directory deve estar ausente; todos os parents reais sem symlink. Preservar
qualquer artefato inesperado e STOP, nunca rm/reinit/incremento automático.

Root retém lease creation-only R0022-161-CLUSTER02-CREATE, grantee root, nenhum
outro SQL writer02. Read-only F3 lease01 pode continuar: roles são isoladas por
postmaster, nenhum dado/role é copiado entre clusters. Rehash realpath/version
PostgreSQL18.2 antes de comandos usando os quatro anchors B7a:
initdb d103626d91c90af601aa1e8356b383b983cbac000e3310d6c3e951db54e7337a;
pg_ctl9e13ce199a5ddf82b0d868fc82b12f016035ca2d5646b623d9c3ac69516c40cd;
postgres e5ced2a1cf0375859196ccd15172bcbdf263c6b4fde5a83da93a92d67d63732c;
psql6118e2b9d262ea230c5401382a2ff795c65ae87e99d06418a9a979075cd41591.
Port65462 deve estar livre imediatamente antes de start, sem kill/fallback.

```sh
detran161_retry_cluster_root='/Users/aarusso/.codex/worktrees/detran-r22-adoption-160/detran/scratch/r22-adoption-161/db-rehearsal/cluster-02'
env -i PATH=/usr/bin:/bin LANG=C LC_ALL=C /Applications/Postgres.app/Contents/Versions/18/bin/initdb -D "$detran161_retry_cluster_root/data" --username=postgres --encoding=UTF8 --locale=C --auth-local=trust --auth-host=trust
env -i PATH=/usr/bin:/bin LANG=C LC_ALL=C /Applications/Postgres.app/Contents/Versions/18/bin/pg_ctl -D "$detran161_retry_cluster_root/data" -l "$detran161_retry_cluster_root/postgres.log" -o '-h 127.0.0.1 -p 65462 -c unix_socket_directories=' -w start
env -i PATH=/usr/bin:/bin LANG=C LC_ALL=C /Applications/Postgres.app/Contents/Versions/18/bin/psql -X -v ON_ERROR_STOP=1 -h 127.0.0.1 -p 65462 -U postgres -d postgres
```

Antes de qualquer CREATE, conferir novo postmaster PID/pg_ctl status e identidade
SQL READ ONLY: actual data_directory literal02, port65462, listen127.0.0.1,
sockets vazios, version180002, session/current userpostgres. Comparar pidfile
local com pg_read_file('postmaster.pid') na conexão real, hash do binary/PID
command e system_identifier recém-observado. Não basta servidor responder;
occupied-port race/mismatch é STOP antes de CREATE. System identifier deve ser
real e distinto do01; não prever OIDs, PID ou sysid. Sem acesso ao shared server.

Após guard, somente os seis CREATE DATABASE seguintes, fora de transação:

```sql
CREATE DATABASE detran_r22_161_ref160 OWNER postgres TEMPLATE template0 ENCODING 'UTF8';
CREATE DATABASE detran_r22_161_refprefix8 OWNER postgres TEMPLATE template0 ENCODING 'UTF8';
CREATE DATABASE detran_r22_161_upgrade OWNER postgres TEMPLATE template0 ENCODING 'UTF8';
CREATE DATABASE detran_r22_161_fresh OWNER postgres TEMPLATE template0 ENCODING 'UTF8';
CREATE DATABASE detran_r22_161_negative OWNER postgres TEMPLATE template0 ENCODING 'UTF8';
CREATE DATABASE detran_r22_161_full OWNER postgres TEMPLATE template0 ENCODING 'UTF8';
```

Nomes repetidos são válidos em novo cluster; identidade inclui sysid/OID/endpoint/
datadir, nunca só nome. Capturar imediatamente actual OID/owner/name/sysid e
pristine catalog/roles/defaults em READ ONLY, SQL UTC/string sem Date loss.
Manifest/lease producer têm flags false para role/schema/seed/storage/SDK/pin.
Initdb templates/plpgsql não são instalação do produto. Partial CREATE não
reverte: preservar comandos/logs/DBs e STOP. Pode parar somente próprio novo
postmaster comprovado via mesmo pg_ctl -D data/ -m fast -w stop, sem remoção.

## Capture, source e execução de referência — gates seguintes

F3 recebe lease READ ONLY02 depois do root devolver creation lease, confere os
seis subjects/cluster/binaries/pristine e retorna lease. Root/F1/F3 vinculam
actual subject-manifest+review hashes em disposição de geração02 antes de SQL
installation. Não copiar fresh receipts01 nem dados/domínio/roles para02.

F2 pode preparar somente fonte/sensores agora. Após capture, adaptar fixed
reference generation para cluster02/65462/actualsysid/OIDs e novos outputs,
mantendo CLI root-only/export/mesmos12operations/fixture IDs/binding/casos e
retained prior176/public inputs. Nenhum selector/SQLflag/global fallback. Plan
revalida exclusivamente manifest02/review02; refuse velho01 mesmo se nomes/OIDs
coincidirem. Fix hashes públicos usa export canônico real, sem algoritmo local.

F3 atualiza expectativas de geração/sujeito só prospectivamente, preserva todos
17 casos/intenção/assertions e raw antigos; acrescenta wrong-old-cluster/port/
datadir, hash prefixed correto e barehash integrity negative separado. Fonte
final lease null é frozen/reviewed F1/F3. Root emite real
R0022-161-CLUSTER02-REFERENCE para Engineer; integração somente dessa constante
tem detached inverse byte readback antes de instrução root para executar.

Runtime precisa passar seus guards/full-pristine reais novamente antes de writes.
Sucesso produz **novas duas fresh rows reais02** e clocks/candidate bytes02;
referência prefix8 continua sem fake per-file receipts. Failure preserva02 e
STOP sem reset/retry automático; cleanup e detached readback de leases são
obrigatórios. Equivalence/baseline reviews, upgrade/fresh latest/--full/S live,
provider/trust/production continuam gates separados. Nova geração não relabela
nenhuma receipt histórica ou concessão de integração/PR.
