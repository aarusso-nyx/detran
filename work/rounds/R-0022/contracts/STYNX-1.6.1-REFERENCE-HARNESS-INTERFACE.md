# R-0022 — interface fixa do harness público de referência

Architect/F1, 2026-10-13. Refinamento técnico da lane D já ativada por
UNBLOCKED-EXECUTION-SCOPE8aabcf5a; não muda esse freeze, os schemas6cda ou leases.
Sem DB/pin/SDK execution pelo Architect. F3 RED precede F2 source no path já listado.

`tools/stynx-storage-reference.mjs` tem único export puro
`createStorageReferencePlan(root)`. Root é repository-root exato; nenhum input
options/SQL/binding/subject/time/approval/selector. CLI recebe apenas esse root e
executa orchestration privada somente após lease e selected-runtime guards.
Import top-level só builtins/helpers consumidores puros, nenhum SDK.

Retorno fechado exatamente `{formatVersion,targetPlan,subjects,fixtures,operations}`:

- formatVersion literal `detran-stynx-storage-reference-plan/1`.
- targetPlan é o resultado real de createStorageTargetPlan com as três refs reais
  publication/projection/priorRuntime e baseline:null/baselineReview:null; não
  reimplementa o plano ou cria baseline/review de teste para passar.
- subjects é array ordenado de três entradas `{purpose,subject,endpoint}`.
  purpose é prior-fresh, ordered-prefix, upgrade-source, nessa ordem. subject
  tem exatamente os quatro campos B3 (clusterSystemIdentifier,databaseOid,
  databaseName,owner): sysid7696248909089426150/ownerpostgres e respectivamente
  detran_r22_161_ref160/16384, detran_r22_161_refprefix8/16385,
  detran_r22_161_upgrade/16386. endpoint `{host:'127.0.0.1',port:65461}`.
- fixtures é `{source,tenantA,tenantB,actorA,actorB,businessClock,restrictedLogin,
appRole,readerRole}`. source ref é r22-sse-tenancy.support.ts SHA84a21cec completo
  do scope; IDs exatos101/102/201/202 desse arquivo, sem novo modelo de persona.
  restrictedLogin role_r22_161_app, appRole role_app_backend, readerRole:null.
  businessClock é `{mode:'capture-once-sql-utc',recordPath,
reservationValidForMs:86400000}`; recordPath fixo
  scratch/r22-adoption-161/db-rehearsal/cluster-01/reference-proof/business-clock.json.
  Não contém timestamp inventado ou clock do client.
- operations é array ordenado dos IDs abaixo, exatamente, não callbacks/SQL.

| ID                              | Fase e sujeitos                                                       |
| ------------------------------- | --------------------------------------------------------------------- |
| revalidate-subjects-and-lease   | actual SQL identity/pristine + global role lease, três subjects       |
| capture-business-clock          | uma observação SQL UTC real retida antes de ambos reference cases     |
| bootstrap-common-auth           | roles/setup/fixture IDs idênticos A/B/upgrade, inventory separada     |
| install-prior-fresh             | public prior artifacts+bindings, duas true fresh rows A/upgrade       |
| install-public-prefix-eight     | public target bound1–8 + prior bindings em B, zero fake receipts      |
| verify-prior-before             | public prior outbox/offline/catalog em novas READ ONLY tx A/B/upgrade |
| start-real-public-contexts      | actual retained prior Nest/Data/Offline/Outbox DI A/B/upgrade         |
| exercise-controlled-behavior    | casos/métodos §4 scope; input source reviewed e idêntico A/B          |
| capture-raw-and-compare         | snapshots íntegros/bijeção predeclarada, não strip campos arbitrários |
| verify-prior-after              | public prior outbox/offline, zero FAIL/UNKNOWN A/B/upgrade            |
| retain-baseline-inputs          | prova atual/equivalence, ainda sem approval/receipt sintético         |
| close-contexts-and-return-lease | finally fecha pools/contextos, zero sessões órfãs, lease devolvida    |

Erro de input/root/artifact/plan usa Error.code
`R22_STORAGE_REFERENCE_PLAN_INVALID`; runtime violations usam
`R22_STORAGE_REFERENCE_REFUSED`, sem fallback/download tardio/repair. Plano puro
não se conecta, gera clock, atesta equivalência nem concede lease. F3 schema
fixtures são NOT_ADMISSION. Root CLI privado revalida todos os gates atuais.

Clock: após lease, capturar uma vez `clock_timestamp()` por SQL em UTC com seis
dígitos e reter valor original/subject/users/source SQL. Ambos contexts usam esse
mesmo instante pelo public options.now, nunca para SQL installed/admitted/executed
timestamps. ValidUntil fixture = instante capturado +86400000ms, parâmetro explícito
de teste, não TTL normativa produto. Antes de casos de reserva, provar actual SQL
clock ainda anterior ao validUntil; stale record é STOP, não atualizar evidência
anterior/replay para fazer passar. Capture/reuse é registrada; não criar duas
horas independentes para A/B. Outras TTL checks usam política fixture declarada
separadamente, preservando regra normativa do consumidor.

Seeds públicos closed no child: exact retained @stynx-nyx/{outbox,offline-sync,data},
@nestjs/{core,common} e `pg` público já retido via data; paths/hashes vêm closure/
graph reais, sem active-workspace fallback ou SDK client factory. Reflect-metadata
segue edges admitidos Nest. Module/loader/env guards e apenas TCP PG leased são
os do scope; misses/dynamic disposition não ampliados por esse seed explícito.

Outbox public module exact options:
`{storageMode:'consumer-owned',dispatchableEntities:{},destinations:[]}`. Nenhum
dispatcher/scheduler/network send. Startup selecionado explicitamente permitido:
OutboxService.onModuleInit executa seu **public administrative owner READ ONLY
ownership/role guard** via Database.withSystemContext. Registrar consulta/role
e seu momento de bootstrap; não é request transaction nem permissão genérica
para withSystemContext. Depois, domain requests passam somente por restricted
login/app role/withRequestContext; durable commands nunca dentro de outer tx.

Native pg Client faz admin/bootstrap/readonly verification sob owner separado;
não simula Database/ModuleRef. Pool configs explícitas usam real retained tokens.
Reader pool existe por shape do DataModule, mas não atende request como escape.
Não chamar migrations runner ou qualquer serviço HTTP. New factory/service method
fora da lista de scope exige review técnico F1 antes de execução, não nova pergunta
Owner por mecânica. Bootstrap de produção não usa auth minimal de referência.

Probe atual: a lease CUSTODY-PROBE continua exclusivamente Inspector/negative.
Harness source e F3 pure sensors podem avançar; nenhum SQL/SDK harness durante
essa lease. Depois de devolvida, root registra a lease global de referência e
readonly identity atual antes de executar source/harness revistos.

Clarificação probe: tamper live usa supported DDL/ACL/role em savepoints, nunca
UPDATE direto de pg_catalog.pg_trigger. Canonical actual RI mapping e disabled
RI/constraint negatives são live; function/event/index/opposite relation swaps
impossíveis via supported ALTER ficam source/predicate-only, não exploit claim.
