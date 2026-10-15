# ADR-0040: Custódia fresh/forward da STYNX 1.6.1 publicada em R-0022

## Status

Proposed — decisão técnica preparada pelo Architect em 2026-10-13 sob o plano
humano de continuação da adoção, com registro de implementação local atualizado
em 2026-10-14. O status formal permanece Proposed; os resultados delimitados
abaixo não declaram adoção integral, cutover, readiness ou fechamento de R-0022.

## Contexto

A publicação final STYNX1.6.1 está vinculada ao commit
`3e3da1f7ceb6dd4a7dd2f9d6e0dc704437e262a0`, tree
`e2ce9989249d1bc13403dc21f5a421b24178ef29`, run38445937806. StageA observou
os artifacts públicos exatos após admissão independente de source/tar/closure.
Outbox objects/bindings/catalog são iguais aos de1.6.0; full manifest/version
diferem. Offline preserva raw sources1–8 e publica bound suffix9. Isso não permite
reescrever receipts fresh1.6.0 como1.6.1 nem reaplicar bootstrap no upgrade.

O installer histórico de 1.6.0 usa psql --single-transaction com COMMIT automático no EOF.
Esse seam não permite construir documentos JS canônicos de fatos SQL reais da
mesma transação, reter seus bytes e conferir INSERT/RETURNING antes de COMMIT.

## Decisão preparada

1. Uniformizar runtime no grupo publicado1.6.1 somente após os gates próprios.
   Conservar os dois receipts fresh originais, inclusive identidade/version e
   timestamp. Fresh1.6.1 usa os dois artifacts completos e dois receipts reais;
   upgrade de fresh1.6.0 usa baseline8 separado e somente bound suffix9 real.
   Nenhum dos modos fabrica per-file history para sources cobertas pelo bootstrap.
2. Usar custody consumer-owned separada: baseline offline, forward receipt9 e
   target group admission. No upgrade, group prova outbox no-storage-change por
   igualdade pública independente, preservando diferença de metadata. Fresh não
   contém baseline/forward. Repeats íntegros executam somente bindings; partial,
   unreceipted, unknown, gap/fork/digest drift recusam antes da primeira escrita.
3. Exigir documentos fechados, duplicate-aware, canonical UTF16/UTF8, igualdade
   total documento/colunas e review real separado do producer. Baseline final
   review e commit observation são detached para evitar ciclos. Schema/PK/FK ou
   boolean accepted não substituem provenance, state verifier ou review.
4. Adotar um target pg.Client transaction de Node sobre a inventory fixa, com
   xact lock(7007,1), mantendo maintenance session lock(7007,1600) em conexão
   distinta. Preservar ordem/bytes e todos os guards legacy. Capturar current_user
   e transaction_timestamp SQL UTC real, construir/INSERT/RETURNING/conferir,
   reter bytes candidate e só então COMMIT explícito. Nenhuma seam de SQL/path/
   binding/callback livre. Verifiers públicos pre/post em novas READ ONLY tx.
5. Criar schema/records/artifacts ou suffix/bindings em uma única primeira
   transação. Falha pré-COMMIT prova rollback contra a entrada real; falha
   pós-COMMIT é STOP. COMMIT desconhecido exige locked live re-read, sem inferir
   rollback/replay ou reconstituir receipt. Filesystem candidate não é atomic com
   DB COMMIT. Guards consumer custody ALWAYS são distintos dos guards publicados.
6. Separar F1/F3/F2 e ativar fases concretas, independent RED antes da implementação.
   Os seis sujeitos do cluster descartável isolado são rehearsal; nenhuma
   produção, request path owner, API inédita ou provider/trust fabricado.

## Consequências e gates

O contrato executável é
[STYNX-1.6.1-ADOPTION-EXECUTION-AMENDMENT](../../../work/rounds/R-0022/contracts/STYNX-1.6.1-ADOPTION-EXECUTION-AMENDMENT.md),
incluindo as ativações específicas. StageA, criação/readback e a preparação B8
foram etapas anteriores. As fases executadas depois delas estão delimitadas no
registro local abaixo; uma preparação ou um PASS de um gate não aceita os demais.

Integração final exige produtor/sensor CI portátil revisado, índices de ADR
sincronizados em `docs/meta/adr/README.md` e `DESIGN-DECISIONS.md`, checks verdes
e fronteira de campanha OD-C2-005. A reconciliação documental de 2026-10-14 atualiza
os dois índices sem promover o status desta ADR nem mudar decisões do Owner.
ADR-0039 e os artifacts aceitos permanecem preservados. HTTP/SSE/legacy writers,
caracterização existente e ausência de provider samples/approved trust continuam
separados da adoção de storage. Nenhum commit/push/PR/merge/publicação decorre daqui.

## Registro de implementação local — 2026-10-14

O pin no source de trabalho é `1.6.1` (`tools/stynx-version.json`). A entrada pública
é `backend/database/apply.sh` → `runStorageApply`, com release consumer-owned
revisada, inventário fixo de 73 DDLs e isolamento do harness privado. A release08
é `sha256:de0d247a6b5edd448282bdad23b8cc9072dd325baccb335a617ab62e76f268c3`.
Depois de todas as escritas, o mesmo target transaction restaura UTC/RLS/contexto
protegido e entra em READ ONLY antes dos verifiers públicos de candidate e COMMIT.
Esse comportamento foi observado; não é um verifier simulado ou um GUC fabricado.

Resultados locais, com readbacks independentes encerrados:

- Baseline de fresh1.6.0 e upgrade package-only em g03/OID18767: os receipts
  originais e seus tempos SQL/UTC permanecem preservados. A equivalência e o
  review de baseline pertencem a esse sujeito, não a um upgrade full-consumer.
- Fresh público, repeat, full com OID recapturado e repeat da substituição no
  servidor descartável próprio: candidate/post e readbacks independentes
  confirmados. Os estados de negócio, receipts, grupo, três sequences e roles
  permanecem exatos; renovações finitas de OIDs de catálogo e permutações de ACL
  foram classificadas explicitamente. Não se afirma identidade do catálogo bruto.
- Concorrência pública fresh/repeat no novo OID127442: A obteve o bridge,
  B aguardou bloqueada por A e só obteve o grant depois da liberação; ambos
  terminaram committed-verified. O negócio estava vazio. Esse gate não prova
  preservação concorrente de histórico populado de tenants A/B.
- SQL S sintético TEST_ONLY: recusas de FK entre tenants, imutabilidade em origin
  e replica, ACL declarada e ROLLBACK, com igualdade completa pre/post observada.
  Disponibilidade do piso em conexão owner READ ONLY não é bootstrap real do app.
- CMS público com PKI TEST_ONLY e seis cenários de holder/Nest em filhos frescos
  passaram em seus escopos. Não são amostra de provedor ou aprovação de confiança.
  Os cohorts O86, settings22 e Outbox32 têm limites próprios; os dois últimos
  são extrações puras TEST_ONLY, sem SQL/SDK/HTTP.

As observações Linux locais usam guest amd64 emulado e retêm seus diagnósticos.
Produtor/projetor portáteis e wiring de CI nativo estão preparados; isso não é
execução nativa de CI. Repeats de artifacts STYNX usam bindings; o DDL consumidor
canônico também é executado e explica as renovações finitas observadas no catálogo.

Evidência local rehashed nesta reconciliação, preservada sob
`scratch/r22-adoption-161/` (não é publicação nem nova linha na cadeia):

| Registro                                                                                                                                                                | SHA-256                                                            |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `db-rehearsal/cluster-02/generation-03/baseline-input-review/INSPECTOR-FINAL-BASELINE-REVIEW.json`                                                                      | `df3da3727db16d62577fdc7a87b42a16058758f632c68126553f7597c1ec62e3` |
| `public-installer-preparation/owned-linux-fresh-preparation/inspector-fullreset08-committed-readback/INSPECTOR-FULLRESET08-LIFECYCLE-SUMMARY.json`                      | `48ba95c54b110fe239fbfd8fc873a9ee48fdc7cd22ea482b75bd993ecd689318` |
| `public-installer-preparation/owned-linux-fresh-preparation/inspector-replacement-repeat09-committed-readback/INSPECTOR-REPLACEMENT-REPEAT09-PRESERVATION-SUMMARY.json` | `e7e0abe27c25c90af5353510f10d64707eeb21ac26615dba11ecd5fe71f846a0` |
| `public-installer-preparation/concurrency-probe-06/architect-final-bounded-concurrency-signoff-01/ARCHITECT-FINAL-BOUNDED-LOCAL-CONCURRENCY-SIGNOFF.json`               | `12c13e0872670573023f351435da33bad713689c2170e2b0032c89e11d4f23c3` |
| `public-installer-preparation/owned-linux-fresh-preparation/inspector-s-replica-acl-probe-protocol-02/INSPECTOR-ACTUAL-S-REPLICA-ACL-PROBE-DISPOSITION.json`            | `f8424e9d2476f967899e2cab3e6e8b83d1b0261733c847370cedae037520b419` |
| `inspector-remaining-gates-after-probe06/INSPECTOR-ACTUAL-CRYPTO-HOLDER-STATUS-SUPPLEMENT.json`                                                                         | `07406631a1776643fd516d1ef710a60747093a8672d8f7c829716ff576784983` |
| `ordinary-integration-counterpart-map-01/INSPECTOR-ORDINARY-COUNTERPART-PREPARATION-AND22-RESULT.json`                                                                  | `da66a7a215ec8bc9e2378192e2056feb216c9372587695fbfb702aeca64f16c7` |
| `ordinary-integration-counterpart-map-01/outbox-negative-preparation-01/INSPECTOR-OUTBOX32-EXACT-TEST-RESULT.json`                                                      | `cac09c56c3e200250c605173b52f4897c6385a5888f3b18847c83d84e287b6e2` |

Continuam pendentes: histórico populado e counterparts dos 23 testes ordinários;
falha genuína no segundo pacote, signal/unknown COMMIT e postcommit STOP;
composição ativa Outbox/reader e critérios de história antes do corte; execução
nativa de CI e checks do candidato final. A preparação populada está desativada,
seu grafo é parcial e nenhuma autoridade live decorre desses sources.

Continuam separados os limites da API pública 1.6.1 (ACK ordinário/proveniência
atômica, deadline explícito passado/igual e consultas/história exigidas), C02/C03,
amostra real de provedor e piso/valores/âncoras/condições de confiança aprovados.
Fixtures sintéticas e observações owner não encerram esses gates. Decisões do
Owner, limiares, testes originais e OD-C2-005 permanecem inalterados.
