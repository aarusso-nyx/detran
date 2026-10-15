# STYNX 1.6.1 — emenda de execução por etapas

**Architect / F1, 2026-10-13. Stage A autorizado abaixo; pin/DB HELD.** A
instrução humana de 12/out para continuar adoção DETRAN é a autoridade existente;
não se pede nova permissão Owner por causa da publicação. Esta emenda registra o
escopo concreto em lanes F1/F3/F2. Reports externos não concedem privilégios.
Sem k6/mutation, integração, stage/commit/push/PR/merge, deploy ou produção.
OD-C2-005 e os checks obrigatórios continuam vigentes.

## Identidade publicada e baseline preservado

Target publicado: `1.6.1`, commit
`3e3da1f7ceb6dd4a7dd2f9d6e0dc704437e262a0`, tree
`e2ce9989249d1bc13403dc21f5a421b24178ef29`, run `38445937806` SUCCESS.
Root informou conferência GitHub independente do run/head e release final. A
verificação upstream final dos 44 packages está em
`/Users/aarusso/.local/share/stynx/1.6.1/auditor/publication-38445937806-final-readback/verification.json`,
SHA-256 `46815c17be9dbcd2080a3a0c08db958bd42390d8766c64ef40bebd5017074318`.
Architect conferiu bytes/hash e campos commit/tree/run/version desse documento;
isso não substitui conferência consumidor de tarballs/exports/closure em Stage A.
Não adotar os SHAs unpublished anteriores como publicação final.

Checkout exclusivo:
`/Users/aarusso/.codex/worktrees/detran-r22-adoption-160/detran`, branch
`codex/detran-r22-adoption-160`, HEAD
`9af7682479fd338b0c81bf56548d21b3021cdf76`, tree
`aec680e768de3e852572649bc1af0c6387a93cb8`.
Source v4: 133 paths, content digest
`4bd32f93ab2b967483486fda517ae29545872357c0794cbadcef6e234dfcc041`;
94 evidências, sete fixtures e cinco entregáveis aceitos continuam imutáveis.
Scope de planejamento aceito47735acb, addendum647c152f e custody draftb5e982ec
não serão editados. Primary/PR179 e siblings são somente leitura.

## Stage A — retenção, P0a e projeção pública pura

**Freeze de escopo A:** apenas os paths/ligações abaixo; sem DB, pin, alteração
de node_modules/lockfile/manifests ativos, generators ativos ou wiring. Engineer
produz arquivos novos de retenção/projeção; Inspector os verifica independentemente.
Architect só escreve esta emenda. Uma execução futura Stage B depende dos fatos
observados e do contrato fechado adiante, não é autorizada por este freeze A.

| Raiz/path novo                                                             | Conteúdo e lane                                                                                                                                                                                             |
| -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `scratch/r22-adoption-161/prior-candidate-v4/`                             | F2 archive/base Git retida + raw overlay133 + cinco originais, manifest de paths/modos/tamanhos/SHA e disposition de deleções/symlinks; F3 verificação independente/reconstrução.                           |
| `scratch/r22-adoption-161/planning-custody/`                               | F2 retenção separada do pack scope/inventário/reviews/impactos e desta emenda no freeze A; F3 manifest/hash de bytes. Não anexar esses novos paths ao v4.                                                   |
| `scratch/r22-adoption-161/package-admission/`                              | F2 evidência publicada retida, tarballs exatos, safe extraction, closed dependency runtime isolado, hashes/source/exports/public d.ts/JS, observações dos renderers e comparações; F3 revisão independente. |
| `scratch/r22-adoption-161/package-admission/project-published-storage.mjs` | F2 programa pequeno de observação pública pura, depois de F3 admitir inputs/import graph; escreve somente outputs nesta raiz.                                                                               |
| `scratch/r22-adoption-161/package-admission/INSPECTOR-STAGE-A-REPORT.md`   | F3 disposition/hash dos inputs, archive e projeções; não é aceitação DB.                                                                                                                                    |

### A1 — archive antes de qualquer mutação do candidato aceito

Reter bytes completos dos 133 paths indicados em
`scratch/r22-adoption-160/source-candidate-manifest-v4.json` e os cinco originais
`checkpoint-report-v4.md`, `source-candidate-manifest-v4.json`,
`checkpoint-evidence-manifest-v4.json`, `available-test-fixtures-v4.json`,
`adoption-status-v4.json`. Reter/verificar a base Git9af e sua tree; reconstrução
base+overlay deve reproduzir cada path/tamanho/SHA do manifest. Manifest de hash
sozinho e tarballs STYNX não retêm o consumidor não commitado. Registrar modos e
deleções/symlinks explicitamente; não seguir links para conteúdo externo.
Archive não se reabre para trocar bytes: conservar manifest digest e verificar
reconstrução independente antes de qualquer F3/F2 mudança posterior em source.
Os 94 evidence paths continuam retidos e revalidados; copiar bytes necessários
para custódia sem reemitir/reescrever os records aceitos.

Planning-custody retém scope47735acb e seu review25b0b844, inventoryd97f28e0,
`post-publication-scope/direct-pin-inventory.json`, os dois novos impactos D4.1 e
os manifests/readbacks de publicação usados. Paths relativos desses inputs partem
de `scratch/r22-adoption-160/`, salvo scope/emenda em contracts e readback absoluto
acima. Incluir esta emenda no hash exato do freeze A, sem digest circular embutido;
se outra seção for adicionada depois, o snapshot A continua histórico imutável.
F3 confere também cinco top hashes, todos133/94/7 e os F1 originais contra v4.
Nenhuma mudança em arquivo aceito é necessária para A1/P0a/P0b.

### A2 — P0a: source/tarball/API/closure exatos

Inventário fechado dentro de package-admission:
`protected-publication-verification.json`, `registry/<slug>-1.6.1.json`,
`tarballs/<slug>-1.6.1.tgz`, `extracted/<slug>-1.6.1/package/`,
`retention-manifest.json`, `public-api-static-assessment.md`.
Slug remove `@` e troca `/` por `-`; nomes vêm somente do roster/closure admitidos,
nunca de path arbitrário. Runtime isolado fica em `runtime/`; observações A3 em
`projection/`. F3 report do Stage A tem o path fixo da tabela acima.

Reter o readback publicado e inventariar roster44, direct consumer26/151pins/59
manifests e closure resolvida como conjuntos distintos. Conferir integrity/SHA256
dos tarballs de cada package efetivamente carregado e seus deps; package versão
exata1.6.1 e provenance source3e3da1f7. `gitHead` ausente não é fabricado: exigir
ligação protegida source–tarball verificável. Recusar alias/range/local replacement,
unsafe extraction, path traversal, unexpected symlinks, export/private deep import
ou pacote transitive sem identidade retida. Sem imprimir token/segredo.

Contexto isolado pode instalar dependências estritamente na raiz package-admission
com lifecycle scripts desabilitados e lockfile próprio retido; não alterar workspace
install/lockfile. Antes de importar SDK, F3 confere graph/exports/d.ts/JS e side
effects do entrypoint público. Qualquer subprocesso/DB/network side effect do
renderer exige STOP; não executar um private binder para contornar admission.
Tarball/provenance desconhecido ou closure irresolvida bloqueia projeção.

### A3 — P0b: observação pública pura, somente após A2 verificado

Importar somente exports públicos admitidos de outbox/offline-sync no runtime
isolado; registrar Node/runtime/resolved paths/versions/hashes. Chamadas permitidas:
`renderOutboxStorage`, `renderOfflineStorage`,
`renderOfflineStorageMigrations`, com binding literal owner`postgres`, app
`role_app_backend`, reader null, tenant`auth.tenants(id)`. Não invocar verifier
live, store, module/app graph, service, migration/SQL executor ou memory model.
Verificar declarations e comportamento de binding antes de aceitar resultado.

Reter outputs integrais, source/raw/bound/objects/bindings/catalog/manifest digests,
ordem e versões. Repetir a projeção pura para determinismo sem ampliar inputs.
Conferir raw0001–0008 contra retenção publicada1.6.0 e suffix real admitível;
qualquer alteração de prefixo/ordem recusa a ponte prevista. Comparar outbox
objects/bindings/catalog/source com artifact prior retido separadamente da metadata
packageVersion/entrypoint nova; não declarar identidade completa igual por SQL
igual. Fonte e SQL bound têm digests distintos. Não aplicar prefixo ou full fresh
artifact. F3 rehash/review dos mesmos outputs e do programa precede sua disposition.

## Gate depois de Stage A — decisão técnica explícita, execução ainda HELD

A escolha de versão é **runtime uniforme1.6.1**; as duas linhas fresh originais
permanecem evidência1.6.0, sem update/delete/relabel. O mecanismo escolhido é um
registro imutável separado de admissão do grupo alvo, mais baseline offline e
receipts forward efetivamente executados. Não haverá pin misto implícito, comparação
do novo fresh plan com linhas antigas como se fossem iguais ou fresh replay.

O contrato concreto desse registro e dos modes será fechado nesta emenda após
observações A3: no-op outbox exige equivalência independente exata de storage/
binding/catalog/invariants, apesar de metadata de versão/entrypoint diferente.
Se outbox storage mudar, falta uma migração pública admitida e Stage B para;
nenhum registro de versão transforma mudança de SQL em no-op. APIs/catálogos
observados não são presumidos neste freeze. Engineer não implementa seleção de
modo/schema/admission, nem altera pin, até F1/F3 fecharem Stage B.

Stage B deverá nomear schema/DDL/program/assertions/sensores exatos para target
group admission, baseline/forward, effective repeat, owner/ACL/RLS/ALWAYS guards,
canonical closed docs, typed predecessors, actual timestamps, prior/latest verifier
state e transaction/locks. Preservar draftb5e982ec como referência sem editá-lo.
Stage B F3 é independente antes de F2; rehearsals usam apenas novos bancos
descartáveis com leases concretos, sem produção. Snapshot/retenção A1 deve estar
aceito antes da primeira mutação. A publicação não fecha provider/profile/trust
ausentes; esse bloqueio externo não impede A1/A2/A3 ou trabalho storage independente.

**Próxima ação agora:** Inspector verifica retenção/inputs A1/A2 e Engineer realiza
somente A3 após essa disposition; retornar hashes/observações a Architect para
fechar Stage B. Pin e qualquer conexão DB permanecem HELD neste freeze A.

## Stage A3 — refinamento F3 anterior à autoria da projeção

Adição prospectiva ao freeze A8d0d8ea8, cujos bytes devem permanecer retidos no pack
de planejamento. Não reinterpreta uma projeção já executada como teste prévio.
Depois de A1 aceito, F3 pode criar somente
`tools/stynx-storage/tests/published-admission.test.mjs`. F3 captura RED contra
ausência do script/programa F2; depois Engineer escreve
`scratch/r22-adoption-161/package-admission/project-published-storage.mjs` e F3
verifica o mesmo contrato. Nenhum outro source/test/product path é aberto aqui.
Execução SDK nos casos positivos/negativos só após A2 e runtime graph aceitos.

CLI fechado: `node project-published-storage.mjs <admission-root>`, exatamente
um root posicional, sem flags/selectors/SQL/binding arbitrários. Root real é
package-admission; roots temporários de fixtures são permitidos apenas contendo
cópias verificadas dos mesmos artifacts reais e graph, sem mocks de pacote.
Erros determinísticos retornam nonzero, sem outputs parcialmente aceitos; sucesso
retém JSON integral em `projection/public-storage-projection.json` e summary/digest
estáveis, somente nessa raiz. stdout não contém secrets/SQL integral por padrão.

O manifest P0a tem conjunto raiz fechado `formatVersion,kind,phase,targetVersion,
publication,consumer,packages,limits`. `publication` contém candidate/tree/run e
protectedVerification `{path,sha256,packageCount}`; `consumer` contém currentVersion,
directNames, directPins `{manifest,section,package,version}`, lockfile
`{path,sha256,resolvedStynxNames}`, targetMetadataClosure e
targetInstalledClosureVerified false. Cada package contém name/version/direct,
registryMetadata `{path,sha256,bytes,observedAt}`, dist `{integrity,shasum,tarball}`,
archive `{path,sha256,bytes}`, extraction `{root,regularFiles:[{path,bytes,sha256}],
linksRejected:true}`, packageManifest `{path,sha256}`, publicTargets `{field,path}`,
stynxDependencies `{section,name,version}` e gitHead null|string. `limits` tem
sdkExecuted/pinChanged/databaseAccessed/testsRun/targetInstalled false. Valores
false são descrição de P0a, nunca booleans suficientes para admitir execução.
Registry body full packument é permitido: selecionar versão exata1.6.1 e comparar
ao roster protegido, sem depender de endpoint registry não suportado.

Antes de import, revalidar os bytes efetivos contra manifest **e** tarballs/proof
protegido; recomputar manifest local de arquivo adulterado não o admite. Revalidar
paths/links/package/export/versão/public source custody e closure real. Reter em
`runtime/closure-manifest.json` o graph público resolvido completo, caminhos reais,
package manifests e arquivo carregável com SHA/bytes, Node/loader e lockfile
isolado; graph contém dependências third-party reais, não somente nomes STYNX.
F3 confere a closure separadamente antes de rodar SDK. P0a preserva seu false
histórico, sem ser reescrito para simular instalação consumidor.

Resultado de projeção tem raiz fechada formatVersion/publication/binding/inputs/
outbox/offline/offlineMigrations/digests. Publicação vincula candidate/tree/run e
SHA do protected verification; inputs vinculam retention/runtime-closure digests;
binding é o literal de A3. Os três resultados preservam campos/SQL exatos dos
respectivos exports públicos admitidos, sem versão ou catálogo inventado. Digests
vinculam objetos/bindings/manifest e cada source/raw/bound SQL; raw e bound nunca
se confundem. Repetições com mesmos inputs são byte-determinísticas. Datas de
observação ficam em report separado, não contaminam o JSON determinístico.

Sensor F3 observa sucesso real com package artifacts admitidos, nove migrations
na ordem efetiva conferida, prefixo raw1–8 igual ao prior, digests exatos, fixed
binding e public exports, outputs restritos e determinismo. Negativos relevantes:
wrong publication/version/roster, bytes/entrypoint/tarball/integrity drift, alteração
com manifest local recalculado, export privado/ausente, closure incompleta,
traversal/link, malformed/extra/missing/duplicate fields, root/flags inválidos e
output fora da raiz. Cada negativo usa artifacts reais copiados e delta declarado;
não fabricar pacote/renderer. F3 distingue RED de ausência do programa de futura
falha real de guard. Sem SDK ou DB não autorizados para produzir RED.

Após F3 aceitar a projeção, Engineer/Inspector retornam os fatos outbox/prefix/suffix
e hashes ao Architect; somente então fechar Stage B de group/version/storage.

### A3a — Declarações peer publicadas e identidades selecionadas

A recusa de ranges em A2 aplica-se a pins consumidores e identidades selecionadas/
resolvidas, não reescreve declarações de compatibilidade do pacote publicado.
Peers publicados `pdf → signature ^1.6.1`, `pdf-a → logging ^1.6.1` e
`pdf-a-vera-docker → logging ^1.6.1` permanecem bytes originais retidos. Resolver
esses peers para identidades exatas1.6.1 do roster protegido; F3 confere resolução,
sem mismatch/peer ausente e sem converter peer range em permissão para versão
futura. Dependência selecionada fora do roster/closure admitidos continua recusada.
Nomes de campos de publication no manifest A3 são `candidate`, `tree`,
`workflowRun`, `protectedVerification`; “run” no texto é abreviação, não outro campo.

## Stage B — DRAFT de instalação/admissão efetiva, NÃO ATIVADO

Esta seção pode ser revisada em paralelo; não autoriza autoria F3/F2 de storage,
pin, generator ativo ou DB antes da ativação F1 vinculada a A3/F3 e leases reais.
Stage A15b41707 permanece retido separadamente. A1 teve reconstrução independente
reportada PASS; P0a reteve27 packages/4926 arquivos, manifest
`56e2e6438b8ef505eca99357e8e219e30ceb170f68f7b5779fff6f997c8a98ac` e assessment
`cbffd071ae26fe996071178f0c17dcbed431e066ef01d4288406b61a3515ed22`.
Prefixo raw1–8 foi conferido byte-identical ao prior; suffix raw conhecido é
`packages/offline-sync/migrations/0009_numbering_reconciliations.sql`, SHA
`7167a3d32e5048c56b453bb6cc5868a5c1c67f2aeab721a2832f13e4af1ca1fd`.
Outbox JS/catalog são iguais e template muda packageVersion; igualdade dos artifacts
bound A3 e catálogo live ainda não foi observada. Não promover esses fatos estáticos
a no-op ou runtime acceptance.

### B1 — Seleção fechada de estados, fresh e upgrade distintos

Runtime/dependências consumidores serão uniformemente1.6.1. O loader de storage
passa a distinguir identidade histórica fresh de estado efetivo admitido; não
relaxa comparação por campos ignorados. Decisões de modo vêm somente do catálogo,
receipts/documentos verificados e inputs publicados fixos, nunca flag de bypass.

| Entrada efetiva                                                           | Plano permitido depois de ativado                                             | Evidência persistida                                                                                           |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Storage e ledger ausentes/pristine, sujeito novo admitido                 | `fresh-1.6.1`: full public objects de outbox+offline uma vez; bindings finais | Duas linhas fresh reais1.6.1 no ledger existente e target group mode`fresh-1.6.1`; zero baseline/forward rows. |
| Duas linhas fresh reais1.6.0, storage prior aceito, nenhum target group   | `upgrade-fresh-1.6.0`: prova baseline8; só bound suffix9                      | Originais1.6.0 intactos; baseline separado, receipt9 real e target group mode`upgrade-fresh-1.6.0`.            |
| Grupo fresh1.6.1 íntegro ou grupo upgraded íntegro, schema latest aceito  | `repeat-1.6.1`: bindings-only                                                 | Nenhuma nova linha fresh/group/baseline/forward; fatos originais preservados.                                  |
| Baseline admitido previamente mas sem grupo/head, ou outro estado parcial | Refuse neste escopo; não inferir execução faltante                            | Só poderá ser admitido com disposition específica de origem/transação, não reparado automaticamente.           |
| Empty/unreceipted/partial/mixed/divergent/unknown/versão não prevista     | Refuse antes da primeira escrita                                              | Nenhuma schema adoption, receipt rewrite ou fresh replay.                                                      |

Ausência total/pristine é a branch fresh explícita; “empty” recusado significa
população/ledger parcialmente presente ou upgrade sem baseline, não um banco novo
admitido. Fresh target cobre fontes1–9 pelo artifact inteiro; não afirma nove
migrations individuais executadas. Upgrade cobre1–8 por equivalência e registra
somente9 realmente executado. Original fresh group tem exatamente dois packages.
Catalog partial, extras ou um só receipt sempre recusam. Banco com original1.6.1
receipts e group ausente também é partial, não é automaticamente adotado.

`apply.sh` normal deve suportar a branch fresh explícita para CI/new DB, e repeat
correspondente; não se deixa CI dependente de uma exceção manual de old ledger.
`--full` mantém nomes/flags existentes e só faz nova instalação fresh após recriação
autorizada, nunca converte original1.6.0 em receipt1.6.1. Nenhuma produção é admitida.
Legacy marker/writers/HTTP/SSE continuam iguais. Old29/1 RED não é resolvido por
storage branch ou alteração de expectativa; required checks continuam bloqueantes.

### B2 — Schema separado de admissão do grupo

Path proposto de DDL consumidor:
`backend/database/ddl/19-stynx-offline-custody.sql`. Contém as duas tabelas do
draftb5e982ec, preservadas semanticamente, e a tabela nova abaixo. O draft aceito
permanece intacto. Engineer materializa bytes exatos e assertions; F3 verifica
constraints/catalog/ACL independentemente antes de aceitar. SQL não foi executado.

```sql
CREATE TABLE integration.stynx_storage_target_admissions (
  admission_id text PRIMARY KEY CHECK (admission_id ~ '^sha256:[0-9a-f]{64}$'),
  mode text NOT NULL CHECK (mode IN ('fresh-1.6.1','upgrade-fresh-1.6.0')),
  target_package_version text NOT NULL CHECK (target_package_version = '1.6.1'),
  fresh_package_version text NOT NULL CHECK (fresh_package_version IN ('1.6.0','1.6.1')),
  subject_digest text NOT NULL CHECK (subject_digest ~ '^sha256:[0-9a-f]{64}$'),
  target_publication_digest text NOT NULL CHECK (target_publication_digest ~ '^sha256:[0-9a-f]{64}$'),
  binding_digest text NOT NULL CHECK (binding_digest ~ '^sha256:[0-9a-f]{64}$'),
  outbox_package text NOT NULL CHECK (outbox_package = '@stynx-nyx/outbox'),
  offline_package text NOT NULL CHECK (offline_package = '@stynx-nyx/offline-sync'),
  outbox_fresh_receipt_digest text NOT NULL CHECK (outbox_fresh_receipt_digest ~ '^sha256:[0-9a-f]{64}$'),
  offline_fresh_receipt_digest text NOT NULL CHECK (offline_fresh_receipt_digest ~ '^sha256:[0-9a-f]{64}$'),
  offline_baseline_id text,
  offline_forward_receipt_id text,
  offline_last_ordinal integer,
  document jsonb NOT NULL CHECK (jsonb_typeof(document) = 'object'),
  admitted_by name NOT NULL DEFAULT CURRENT_USER CHECK (admitted_by = 'postgres'::name),
  admitted_at timestamptz NOT NULL DEFAULT transaction_timestamp() CHECK (isfinite(admitted_at)),
  CONSTRAINT stynx_target_version_uq UNIQUE (target_package_version),
  CONSTRAINT stynx_target_outbox_fresh_fk FOREIGN KEY (outbox_package)
    REFERENCES integration.stynx_storage_installations(package) ON DELETE RESTRICT,
  CONSTRAINT stynx_target_offline_fresh_fk FOREIGN KEY (offline_package)
    REFERENCES integration.stynx_storage_installations(package) ON DELETE RESTRICT,
  CONSTRAINT stynx_target_mode_ck CHECK (
    (mode = 'fresh-1.6.1' AND fresh_package_version = '1.6.1'
      AND offline_baseline_id IS NULL AND offline_forward_receipt_id IS NULL
      AND offline_last_ordinal IS NULL)
    OR
    (mode = 'upgrade-fresh-1.6.0' AND fresh_package_version = '1.6.0'
      AND offline_baseline_id IS NOT NULL AND offline_forward_receipt_id IS NOT NULL
      AND offline_last_ordinal IS NOT NULL AND offline_last_ordinal = 9)
  ),
  CONSTRAINT stynx_target_baseline_fk
    FOREIGN KEY (offline_baseline_id,offline_package,binding_digest,target_publication_digest)
    REFERENCES integration.stynx_offline_baseline_custody
      (baseline_id,package,binding_digest,target_publication_digest) ON DELETE RESTRICT,
  CONSTRAINT stynx_target_head_fk
    FOREIGN KEY (offline_forward_receipt_id,offline_baseline_id,offline_package,binding_digest,offline_last_ordinal)
    REFERENCES integration.stynx_offline_forward_receipts
      (receipt_id,baseline_id,package,binding_digest,ordinal) ON DELETE RESTRICT
);
```

Owner`postgres`; ENABLE+FORCE RLS; zero policies; zero effective access to PUBLIC,
app, reader, auditor or reachable parent role. Owner-only immutable trigger function
`integration.stynx_storage_target_admissions_immutable()` uses LANGUAGE plpgsql,
SECURITY INVOKER, `SET search_path=pg_catalog`, body only unconditional RAISE.
One statement trigger BEFORE UPDATE/DELETE/TRUNCATE, ENABLE ALWAYS. Explicit final
REVOKEs on table/function follow DDL20. Catalog assertions reject unknown columns,
defaults, identities/generated expressions, indexes/constraints/triggers/rules,
ownership, ACL/default/membership/security options and weakened guards. PG18 NOT NULL
inventory is version-aware; no unknown constraints discarded or fixed legacy count.
FKs prove references, not document/digest identity: fixed admission recomputes all
fresh-row identities and verifies same-chain publication/binding/head9 explicitly.
No UPSERT, UPDATE, guard disabling or owner-request path. Other superowners are
administrative authority, not a trust boundary this table can exclude.

### B3 — Closed canonical target-group document and acyclic custody

Root keys exactly `formatVersion,kind,mode,subject,targetPackageVersion,
targetPublication,binding,bindingDigest,freshReceipts,outbox,offline,admission,
evidence,recordSha256`. Literals: formatVersion
`detran-stynx-storage-target-group/1`, kind`target-group-admission`, version1.6.1;
mode from B1. No optional root/extra/duplicate keys. `ref` below means closed
`{path,sha256}`, relative retained path and prefixed SHA256; no arbitrary URL/secret.

| Field                 | Exact nested schema and validation                                                                                                                                                                                                                                                                                                     |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| subject               | `{clusterSystemIdentifier,databaseOid,databaseName,owner}`; decimal strings, actual SQL identity, owner postgres.                                                                                                                                                                                                                      |
| targetPublication     | `{version,commit,tree,workflowRun,verification,packageAdmission,projection}`; literals from publication above; last three are refs to immutable protected readback/P0a/A3. Its canonical SHA is target_publication_digest.                                                                                                             |
| binding               | `{ownerRole,appRole,readerRole,tenantTable:{schema,table,column}}`, fixed postgres/role_app_backend/null/auth/tenants/id; bindingDigest recomputed.                                                                                                                                                                                    |
| freshReceipts         | `{outbox,offline}`, each `{package,version,rowDigest,rowArtifact}`; exact version from mode, rowArtifact ref contains full original package/identity/installed_by and SQL text timestamp. rowDigest canonicalizes that closed row record; no JS Date or claim of original insertion lexeme. Re-read actual immutable rows and compare. |
| outbox, fresh mode    | `{mode:'fresh-artifact',artifact}`; artifact ref is exact public target full artifact.                                                                                                                                                                                                                                                 |
| outbox, upgrade mode  | `{mode:'no-storage-change',priorArtifact,targetArtifact,equivalence}`; refs, verified bound objects/bindings/catalog and prior/live invariants; metadata/entrypoint version differences retained separately.                                                                                                                           |
| offline, fresh mode   | `{mode:'fresh-artifact',artifact,coveredSources,migrationExecution:'none'}`; artifact ref, ordered coveredSources entries `{ordinal,sourcePath,rawSha256}`1–9; no baseline/head/per-file execution assertion.                                                                                                                          |
| offline, upgrade mode | `{mode:'forward',baselineId,forwardReceiptId,lastOrdinal:9,targetArtifact,orderedArtifact}`; prefixed IDs refer actual admitted records; artifact refs are A3 exact public outputs.                                                                                                                                                    |
| admission             | `{by,atUtc}` actual postgres/current transaction_timestamp SQL UTC six fractional digits, never client Date or stale caller override.                                                                                                                                                                                                  |
| evidence              | `{priorState,equivalence,executionPlan,reviewedCandidate}` refs; prior/equivalence may be null only in fresh mode (pristine actual subject instead in executionPlan). All non-null refs exist before INSERT.                                                                                                                           |
| recordSha256          | Prefixed canonical document digest omitting only this root field; UTF-16 recursive key sort, arrays unchanged, UTF-8/legal JSON, strict duplicate-aware validation before JSONB.                                                                                                                                                       |

Column-to-field equality is total: ID=recordSha256; mode/version/fresh version from
mode; subject/publication/binding digests recalculated; package/digests from both
freshReceipts; upgrade baseline/head/ordinal from offline and all three NULL in
fresh; document equals validated object; by/at equal actual SQL admission values.
INSERT interface never accepts by/at override: query actual values in the same
transaction, construct document, omit defaulted columns, RETURNING text compare.
Original fresh identity remains its actual historical format, not canonicalized
into a new packageVersion. Full original row record schema is exactly
`{package,identity,installed_by,installed_at_sql,installed_at_utc}`; text reflects
current SQL rendering, UTC field has six digits; retain both without claiming
the original insertion spelling. identity must equal retained prior/target artifact
metadata for the selected mode, including entrypoint/full SQL/manifest identities.

Group references baseline/head; forward document never references final group ID.
Forward evidence uses only pre-existing plan/candidate/prior-state/SQL artifact
digests. Baseline D-160.13 and forward draft closed formats remain distinct;
targetPublication object/digest is identical across them and group. Publication/
projection artifacts precede custody. No self/future-digest reference cycles.
Postcommit verifier/review/commit observation are detached, bound to final IDs;
group admission document does not assert a future postcommit PASS.

### B4 — Prior verifier custody, references and transaction boundaries

Before pin, retain **complete** prior1.6.0 public verifier runtime/closure under
`scratch/r22-adoption-161/prior-runtime/`: package/third-party files, versions,
resolved public entrypoints, Node/loader/lock identities, tar/provenance linkage and
independent graph review. No reliance on pnpm links that target install replaces;
three prior STYNX tarballs alone are insufficient. No private verifier or copied
binder. Prior verifier is used on fresh1.6.0 and target prefix1–8 references before/
after controlled actual1.6.0 service operations. Latest public verifier is used on
fresh1.6.1/upgraded/repeat states; prior verifier is not forced onto latest schema.

Reference A/B are separate new leased databases, same helper-owned auth setup and
fixed binding. Compare complete package catalog and controlled data/behavior with
predeclared semantic ID/time comparator; retain raw snapshots. Auth/consumer ledger
differences are inventoried separately; B receives no fake1–8 receipts. Subject for
upgrade is another new populated1.6.0 installation with actual two fresh rows;
DB04 observation is not baseline admission or production upgrade authority.

One maintenance session lock in database postgres `(7007,1600)` spans readonly
pre-state, target transaction and readonly post-state. Target transaction keeps
`(7007,1)`; never hold identical key on different connections. Only fixed DB env
validated by apply; no SQL/path/binding/adopt/bypass flag. Fresh transaction creates
exact full artifacts/two fresh rows/new custody schema/group/bindings atomically.
Upgrade creates custody schema/baseline/suffix9/receipt9/group/bindings atomically;
does not replay fresh objects or 1–8. Final role grants/revokes and context restoration
are outside canonical SQL bytes but inside that transaction. No platform runner/raw
SQL rewriting. Repeat executes bindings only, preserving all evidence rows.

New schema/receipt/catalog failures roll back to actual entry snapshot. Public
verifiers run in new genuinely READ ONLY transactions; no FAIL/UNKNOWN allowed.
Postcommit failure is STOP, never fictional rollback; unknown commit outcome
requires locked live re-read before deciding, not inferred replay. Retain canonical
document bytes before COMMIT with candidate/rolled-back disposition; filesystem is
not atomic with DB COMMIT. No existing sequence consumption/reset in admitted suffix
or fault fixtures, including trigger effects; sequence drift STOP, no setval repair.

### B5 — F1/F3/F2 paths, guards and activation prerequisites

F2 candidate paths after activation: `tools/stynx-storage-forward.mjs` for closed
canonical/admission/plan; `tools/stynx-storage-install.mjs` fixed orchestration;
`tools/generate-stynx-storage.mjs`, `tools/rls-ddl-coverage.mjs`,
`tools/check-rls-ddl.ts`, `backend/database/apply.sh`; generated target artifacts
`backend/database/stynx-storage.json`, `stynx-storage-target.json`,
`stynx-offline-forward.json`, `ddl/19-stynx-outbox.sql`, `19-stynx-offline.sql`,
and new custody DDL path B2. Existing fresh ledger DDL bytes/shape/guards and rows
remain unchanged. Active fresh SQL inventory must dispatch by B1; merely adding
full artifacts to ordinary reapplicable inventory is prohibited. RLS classifier
must prove installed byte-bound target artifacts and all tenant relations without
weakening legacy helper coverage/exemptions/roles/opaque-body guards.

Pin paths: `tools/stynx-version.json`, the exact59 manifest list in retained
inventoryd97f28e0 and `pnpm-lock.yaml`. Root package.json scripts only if needed for
named new checks; no new runtime wiring. Generator has `--check` and supported
BLUEPRINTS_DIR/BLUEPRINTS_OUTPUT environment controls. Actual48 blueprints own48
generated manifests;50 is total domain/shared count, including handwritten
ops/core and shared, not generator count. This corrects the held draft's earlier
50+9 ownership assumption. Full output preview must use BLUEPRINTS_OUTPUT fixed to
`scratch/r22-adoption-161/generated-preview/`, with unchanged blueprint inputs.
Only48 generated manifest deltas are expected from the pin; every other emitted
file must remain byte-identical. Unknown drift is STOP. Do not hand-edit generated
manifests, blueprints or DTO/entity outputs. Other11 manifests follow explicit
ownership. Frozen install, exact
consumer closure and cheap pin/type/format/lint/generated/RLS checks precede DB.

F3 paths after activation: `tools/stynx-storage/tests/forward-admission.test.mjs`,
existing install/pin/RLS sensor files, new
`backend/app/tests/integration/r22-stynx-161-forward-custody.integration.spec.ts`
and `r22-stynx-161-reference-equivalence.integration.spec.ts` in that same directory.
Independent RED precedes F2; use real published prior/target artifacts, no SDK
mocks. Live sensors use disposable leases only; role-global mutation needs an
isolated cluster, not an ordinary DB lease. No required assertions weakened.

Required positive/negative coverage: fresh1.6.1/repeat and populated prior upgrade/
repeat; two true fresh rows and their immutability; group wrong mode/NULL branch/
partial/cross-head/binding/publication/outbox/no-op failures; duplicate-aware JSON/
UTF16/array/root-hash precision vectors; actual by/time override refusal; baseline
proof refs/current prior verifier/equivalence, unknown10/gap/fork/source/digest drift;
actual SQL failure atomic rollback, readonly post-verifier STOP, concurrent lock
wait/repeat, signals/unknown COMMIT disposition and authorized --full fresh. Query
real catalog/RLS/ACL/ALWAYS guards including PG18 NOT NULL; no catalog repair.

Local StageA sensor/program must have explicit final integration disposition:
portable hermetic production counterpart retaining assertions, or local archive
plus independent hermetic counterpart. No scratch-dependent test silently committed
into required glob, silent deletion/skip or gate weakening. Production tool/sensor
paths for that counterpart must be closed by F1 before integration; current local
StageA observations remain valid bounded evidence.

**Activation still missing:** admitted A3 exact output/graph/source hashes and F3
report, complete prior-runtime custody, closed baseline input/parser/program schema
review, scoped output inventory, independent RED inventory and exact disposable
names/cluster/creation commands/leases (actual OIDs captured after CREATE before
install/seed). F1 will append an activation record binding those artifacts before
implementation or DB execution. No execution permit follows from this draft.

## Stage A3b — disposition restrita dos imports opcionais/lazy

Este refinamento é Stage A; não ativa Stage B. Evidência runtime retida:
static-module-graph SHA
`716cfa56cdd8c2203edc472ea03fcc215110070a42d839b1854b66a19997e66e`,
module-boundary-disposition SHA
`04da818d6fb898998dd8f6b97fab40c498a99939d82ac49c1e6efba14118ce6c`,
closure-manifest SHA
`4c6a967ecdfa0cf096ce43ed081aa865997f4a177a5fefb6cc2906e103653405`.
Architect conferiu os15 hashes de arquivos dos sites e leu seus contextos/helpers;
Inspector ainda deve conferir a closure/disposition independente antes de A3.
Não afirmar zero dynamic/unresolved edges nem closure universal de todos os métodos.

Admitir somente para import público + três chamadas puras A3, nos bytes exatos do
descriptor04da818d e graph716cfa56:

| Sites retidos                                                          | Disposition limitada                                                                                                                                                                                                                            |
| ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nest `load-package.util.js:9` e `load-adapter.js:9` nonliteral helpers | Declarações de funções; seus consumidores serializer/ValidationPipe/Nest factory não são instanciados/chamados pelos renderers. Não invocar loaders, adapters ou factories.                                                                     |
| `load-esm/index.js:2` nonliteral import                                | Função exportada não chamada; caller `@nestjs/common/pipes/file/file-type.validator.js` SHA172517d481bb97f55b5b29c34efc7e037ac509bd034398afc5ecdcad31bac287 chama loadEsm somente em isValid, proibido em A3. Não executar validator/file-type. |
| Nest `optional-require.js:6`, `nest-application.js:19,20`              | Dois requests literais opcionais de websocket/microservice são tentados no import e capturados pelo helperc8a109da. Ausência real é retida; não fabricar dependência stub nem omitir esses edges. Não instanciar NestApplication.               |
| `class-serializer.interceptor.js:25,27`, `validation.pipe.js:43,47`    | Requests class-transformer/class-validator dentro de constructor/métodos não executados em A3; missing é conhecido, não aprovação de serializers/validation.                                                                                    |
| `nest-application.js:128`, `nest-factory.js:58,175`                    | Microservice/HTTP adapter factories não chamadas por import + renderer. Não admitir bootstrap/wiring.                                                                                                                                           |
| `pg/lib/native/client.js:7`                                            | pg-native permanece ausente e não usado; `pg/lib/index.js` SHA3fad6e6d3d976edbabe0cbc9e1d39f4340bcb719bbbb186a0d3a24f3dbd4a94c expõe getter lazy e branch NODE_PG_FORCE_NATIVE, ambos proibidos nesta observação.                               |
| `@redis/client/.../utils/digest.js:8`                                  | xxhash import somente em função digest não chamada; não usar Redis client/digest.                                                                                                                                                               |

Descriptor vincula path/line/column/full-fileSHA dos quatro sites nonliteral e11
missing, mais hashes dos helpers relacionados; não é filename exemption. Mudança
de arquivo/site/caller, dependência opcional que passe a resolver em outro local,
novo edge ou chamada lazy fora do escopo exige STOP/review, não allowlist genérica.
Resolver/cache de imports efetivos deve permanecer no graph/runtime admitidos;
recusar fallback para workspace/global/outside-root ou bytes sem custódia.

Subprocesso de observação usa Node/loader identificado, sem NODE_OPTIONS/NODE_PATH
herdados e sem NODE_PG_FORCE_NATIVE ativo. Nenhum preload custom, native getter,
DI/module/service/store/factory/network/DB/process invocation. F3 inclui negativo
de ambiente/native/preload não admitido e drift de boundary/closure; não precisa
instalar optional packages para esconder findings. Import observado não pode mudar
esse runtime/manifest histórico. Após review independente + RED A3 existentes,
Engineer pode implementar somente o script de projeção puro autorizado; renderer
observation ainda não é aceitação live ou activation de Stage B.

## Stage A3c — convenções fechadas de output/loader e retenção prior

Output A3 literal formatVersion`detran-stynx-public-storage-projection/1`.
publication é `{candidate,tree,workflowRun,protectedVerification:{path,sha256}}`;
inputs é `{retentionManifestSha256,runtimeClosureManifestSha256}`; digests é
`{outbox:{objectsSqlSha256,roleBindingsSqlSha256,manifestSha256},offline:{objectsSqlSha256,roleBindingsSqlSha256,manifestSha256},offlineMigrations:[{sourcePath,rawSqlSha256,boundSqlSha256}]}`.
Hashes próprios de A3 são64 hex minúsculos sem prefixo; public raw/bound retornados
ficam originais. Custody posterior usa refs prefixados explicitamente. Manifest
digest usa canonical keys UTF-16/arrays originais, sem timestamps no output.

Programa usa fresh Node child fixo, env fechado e hooks síncronos builtin de
resolver/load: hash de arquivo antes de eval, paths/bytes/closure reais verificados,
Node semantics preservadas, escape flag irreversível em load desconhecido/outside
mesmo se SDK capturar erro. Somente os dois requests Nest opcionais exatos de A3b
podem terminar em missing capturado. Nenhum stub/private SDK import, lazy native,
preload ou dynamic site adicional é admitido. F3 confere essas recusas e não troca
o SDK por mock. Esta convenção fecha o seam A3; não executa pacote nesta emenda.

**Retenção prior adicional Stage A, sem execução SDK:** Engineer pode escrever
somente em `scratch/r22-adoption-161/prior-runtime/` um runtime1.6.0 completo
retido, `retention-manifest.json`, `closure-manifest.json`, `static-module-graph.json`,
programas locais de captura estática e logs de hash; Inspector escreve
`INSPECTOR-PRIOR-RUNTIME-REVIEW.md` nessa raiz. Copiar bytes atualmente instalados
e/ou obter tarballs exatos1.6.0 com pnpm-lock/proveniência pública retida, sem
lifecycle scripts, deep/private source, install ativo ou substituir dependências
por versões alvo. Capturar realpaths/exports/arquivo carregável/Node/loader/lock,
integrais packages/deps third-party e relações de symlinks internas. Rejeitar escapes;
nenhum consumer pin/node_modules ativo muda. Conferência F3 deve demonstrar closure
isolada e source/tar/integrity dos roots públicos prior antes de pin. Missing
dependency/provenance é HELD, não fake pacote nem booleans autoaprovadores.
Não invocar prior verifier/store/renderer nem DB nesta retenção Stage A.

## Stage B6 — schemas de entrada/parser e ownership fechados, ainda DRAFT

Ownership F1 independente em
`scratch/r22-adoption-161/planning-custody/stage-b-draft/generated-ownership-inventory.json`,
SHA`5b38f0198aaf070825340f4a7b7aa1e9c52e03d0658c50ac3519743518265e0d`.
Vincula os59 paths exatos aos hashes v4:48 gerados com path/SHA de cada blueprint
e11 handwritten (seis apps, backend/app, ops/core, shared, senatran-adapter e ui).
Inclui SHA do generator e do inventory59 original7953e6af. Nenhum generator rodou.
O preview acima pode emitir todos os artifacts, mas a cópia ativa é limitada aos48
manifests previstos; os outros outputs precisam permanecer iguais. Se check revelar
novo drift, voltar à F1 antes de ampliar paths. Blueprint source não é aberto.

Programa consumidor proposto `tools/stynx-storage-forward.mjs` exporta somente
`parseStorageCustodyDocument(text,kind)` e
`createStorageTargetPlan(root,inputs)` como seams puros, sem DB/SQL callback ou
binding livre. kind fechado baseline|forward|group; text é string UTF-8 JSON íntegra.
Inputs do plano são `{publication,projection,priorRuntime,baseline,baselineReview}`:
publication/projection/priorRuntime são refs verificadas; baseline é null em fresh
ou documento baseline validado; baselineReview é detached ref vinculada ao digest
final do baseline, null em fresh. State/SQL identity vêm do runner fixo, nunca desse
input caller. Plano puro não seleciona modo por flag nem prova DB; runner aplica
B1 a fatos SQL atuais. Exact interfaces F3 verificam sucesso e refusas antes de F2.

Parser faz validação lexical duplicate-aware antes de JSON.parse/JSONB: duplicados
em qualquer depth, inclusive escape-equivalent keys, extras/ausências, UTF-8/Unicode
inválidos, coerção/getter/toJSON e números fora dos tipos exatos recusam. Ordinals,
counts/bytes são safe integers nos ranges declarados; timestamps/cluster/OID são
strings, nunca números/Date. Não impor novo limite a payload produto: esses são
documentos de custódia fechados. Raw original identity deve igualar metadata pública
retida, não uma normalização escolhida pelo caller. Canonical record digest omite
somente recordSha256 raiz; nested hash fields permanecem. Nenhum tipo arbitrário
JSONB object satisfaz apenas por ter colunas escalares correspondentes.

Baseline tem raiz exatamente `formatVersion,subject,freshReceipt,priorPackage,
targetPublication,coveredSources,projectedPrefix,priorState,equivalence,review,
recordSha256`, formatVersion`detran-stynx-offline-fresh-baseline/1`. Specializations
abaixo concretizam D-160.13 sem alterar seu sentido ou arquivo aceito. ref é B3;
digest próprio é prefixado SHA256; raw/bound public hash mantém64 hex sem prefixo.

| Campo baseline    | Estrutura fechada                                                                                                                                                                                                                                                                                                                                                     |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| subject           | Mesmo objeto B3; observado vivo sob lock e READ ONLY, não herdado de clone/DB04.                                                                                                                                                                                                                                                                                      |
| freshReceipt      | `{relation,package,row,rowDigest,assertion,group}`; relation literal integration.stynx_storage_installations; package offline-sync; row é o full original record B3 versão1.6.0; assertion ref; group `{outbox,offline}` cada `{rowDigest,rowArtifact}`. Digests e rows conferidos contra ambos receipts SQL reais.                                                   |
| priorPackage      | `{version,sourceCommit,sourceTree,tarball,entrypoint,declaration,artifact,manifestDigest,objectsSqlSha256,roleBindingsSqlSha256,runtimeClosure}`; version1.6.0/source60e53ad; tarball `{path,sha256,integrity,bytes}`, demais refs salvo os três digests; entrypoint/declaration são públicos reais; artifact inteiro corresponde ao fresh original.                  |
| targetPublication | **Exatamente objeto B3**, mesmos bytes canônicos/version/commit/tree/run/refs; target_publication_digest de baseline, forward e group é SHA canonical desse objeto inteiro, nunca SHA só da tag ou outro subset.                                                                                                                                                      |
| coveredSources    | Oito entradas ordenadas `{ordinal,sourcePath,rawSha256}`, paths/raw idênticos ao artifact fresh prior e prefixo alvo. Não são execution receipts.                                                                                                                                                                                                                     |
| projectedPrefix   | `{meaning,binding,implementation,migrations,digest}`; meaning literal not-executed-on-subject; binding B3; implementation `{packageVersion,entrypoint,publicationDigest}`; entrypoint ref público alvo; migrations oito entradas `{ordinal,sourcePath,rawSha256,boundSqlSha256,boundSqlArtifact}` com ref de bytes bound; digest canonical de `{binding,migrations}`. |
| priorState        | `{method,record,expectedCatalog,actualCatalog,rowInvariants,verifierReports}`; method literal prior-public-verifier neste escopo; quatro refs; reports array outbox/offline `{package,version,report}` versão1.6.0/report ref. Expected é custódia pública retida, não actual autocertificado.                                                                        |
| equivalence       | `{referenceA,referenceB,report,rawSnapshots,comparator}`; referências A/B cada `{subject,installation,priorVerifierBefore,priorVerifierAfter}` refs salvo subject; rawSnapshots array refs; comparator ref predeclarado. Report é independente, structural/behavioral1–8; nenhuma operação prefix no subject upgrade.                                                 |
| review            | `{inspector,independent}`, cada `{actor,report}`; actors reais da role/session distinta e report refs que conferem inputs anteriores, sem digest final deste mesmo record embutido. Ratificação do baseline final é detached baselineReview.                                                                                                                          |
| recordSha256      | Canonical integral omite somente este campo; baseline_id. Duplicados/placeholder/ref não resolvida recusam.                                                                                                                                                                                                                                                           |

Forward tem exatamente root/nested schema do draftb5e982ec, source/raw/bound/head
from actual ordered renderer e predecessor baseline8. Sua evidence não inclui
digest futuro do group; group pode apontar forward/head sem ciclo. Baseline review
detached deve referir recordSha256 final e ator/report/proveniência independente
real; Engineer não aprova a própria prova. Todo ref resolve a conteúdo retido e
hash/produtor verificável; string alegando aprovação não basta. GROUP schema B3
continua fechado por mode e ref; mutual publication digest é requisito explícito.

Final hermetic counterpart de StageA fica em
`tools/project-published-stynx-storage.mjs` e
`tools/stynx-storage/tests/published-admission.test.mjs`: mover/derivar o programa
puro sob F2 após F3, preservando todas as assertions, sem SDK mocks. CLI recebe um
root do fixture/admission; CI usa contexto real instalado/pinado1.6.1 e retention/
manifest gerado verificável contra lock/proveniência, nunca path local absoluto.
Artifacts de release enormes não precisam ser commitados; CI deve produzi-los pelo
mesmo contract antes dos testes e reter hashes. Não skip quando ausentes. StageA
script/logs originais permanecem evidence local histórica; counterpart portátil
tem fonte e identidade própria, aceita antes de entrar no required glob.
Root scripts/CI preflight só podem adicionar geração/admissão explícita; não mexer
em required-check filters, thresholds ou remover casos. Interface/producer CI exato
e artifact inputs ainda exigem F1/F3 revisão antes da ativação/integracão; B6 não
autoriza automaticamente workflow edit nem target SDK execução fora de Stage A.

## Stage A4 — correções prospectivas antes da autoria do driver

**formatVersion de projeção é o número1**, conforme sensor independente inicial32
RED e família de manifests A; a proposta string provisória de A3c é superseded
antes de qualquer driver F2. Demais root/nested keys publication/inputs/digests de
A3c ficam iguais. Não houve implementação escolhendo o teste a posteriori.

“Não instanciar factory” em A3b significa não executar bootstrap, factory methods,
store/service/application lifecycle ou cliente de IO. O import público revisado
normalmente constrói objetos inertes NestFactoryStatic, logger e decorators; esse
efeito conhecido do barrel é admitido nos hashes exatos. Não afirmar zero
construtores JS no import ou usar isto para admitir NestFactory.create/init/listen.

Closure4c6a967e é histórico **não admitido**: F3 encontrou17 arquivos instalados
omitidos. Correção conservou bytes antigos em history/a2-recorded-files-30075 e
reteve16 arquivos pino nestedfixture originais do tarball +npm hidden lock. Closure
nova SHA`5a1817a1112f0893558242f00774122d6ddfff32f774753d387285381b378899`,
resolved-packages SHA
`e8e592cc85e8e932c5648160da542d60272fc1410bd5e381a3be6b209430d4ef`;
30091 arquivos de package +1 hidden lock =30092 instalados regulares. Hidden lock
SHA`727dfd3e32f520c83cea42ab2cee91c74757d58028376ef83cc64108b5a0dc34`.
Graph716cfa56/descriptor04da818d e todos os módulos carregáveis permanecem iguais;
F3 deve confirmar inventário completo corrigido antes de qualquer SDK. Novo input
digest não converte old4c6 em PASS nem permite ignorar arquivos não alcançados.

Final topology closure para review F3 é
`f372c94bb51ce4939b0e4d4069434b4e0e7ac68ac7136f9e648273fa4b108fde`:
mesmos30092 regular files +9 binLinks internos declarados, não executados, com
`{path,target,resolvedPath,bytes,sha256,disposition:'nonexecuted-npm-bin-link'}`.
Nenhum link fora do runtime ou bin invocado é admitido. Bytes5a1817a1 permanecem
em history/a2-regular-files-30092; e8e592cc/graph716cfa56/descriptor04da818d
permanecem iguais. F3 deve conferir regular files **e** links desta identidade
final; o texto não chama esse novo input de PASS antes da disposition independente.

## Stage A5 — formato CJS não especificado, sem normalização

Primeira execução independente do observer registrou29 PASS/4 FAIL e a diagnostic
focus confirmou `nextLoad.format === undefined` no public outbox index, antes de
sua avaliação/antes de qualquer renderer concluído. Preservar esses REDs, sem
atribuir defeito ao SDK. Evidência Node local:
`package-admission/node-loader-evidence/manifest.json`, SHA
`71d1e77d3dc95a8901df03a7356b5fb6cce55c34f4260b9e5aaef4123431e5a2`.
Node24.20.0 executable SHA9d050fd4; embedded CJS loader SHA
`a3e3ee095d409597bf224522411607aa7d2f4747cf42b5329179bf3b4b5528ed`,
customization_hooks SHA
`02cf07c29fd2c4701ccc19395d5d0b11968aee34a9aefb37b5684f7248c457f7`,
helpers SHA`3d6d6d7c7257610dcee83c76f29d6314ba56af5560faf50650a025fd9a56bbb3`.
Esses sources mostram defaultLoad retornando context.format intacto, detecção
depois do load chain, .js com package.type ausente passando undefined, e condições
CJS require recebidas sem alteração. Não é necessário outro SDK attempt só para
deduzir contexto já fundamentado no source do executável exato.

Depois de novo F3 source-witness RED, F2 pode admitir **somente** resultado undefined
em arquivo .js byte-bound do graph, com nearest package.json real retido, own key
`type` ausente, context.format também undefined e condições require/CJS, sem import.
Return original nextLoad result unchanged: não escrever format='commonjs' nem
normalizar unknown/null. Mantêm-se source hash antes de avaliação, nearest-context
hash, graph/path/env/escape guards e detecção Node posterior. Nearest context não
é simplesmente package dono por nome: derivar a mesma fronteira de package que
Node alcança para aquele arquivo, usando records completos retidos/verificados.
Public outbox package.json SHA
`1b6d9f960465b9c876e8b9c02257f0d5cdb7010797aa5a608b24a647666ad636`
de fato não tem own type. Isso não admite package manifest ausente ou alterado.

Seam F3 fechado dentro do embedded child:
`isCanonicalUnspecifiedCjsFormat(file,nearestPackage,context,result): boolean`.
Função pura sem SDK/IO/closure helper externo. file tem
`{relativePath,expectedSha256,actualSha256,nearestPackageJsonPath,nearestPackageJsonSha256}`;
nearestPackage tem `{relativePath,actualSha256,manifest}`. Expected/context vêm do
sealed index, actual hashes dos bytes reais verificados; nenhuma assertion boolean
fornecida pelo caller os substitui. Só true com .js normalized descendant de nearest
package, paths iguais aos records, hashes64 válidos/iguais, own type ausente,
context/result.format estritamente undefined, conditions inclui require e não
import. Known commonjs/module/json continuam no caminho original, independentemente
desse predicado. Outer loader ainda verifica returned source hash e conserva result.

Inspector adiciona source sensor no arquivo existente antes de F2: TypeScript AST
localiza unicamente a função nomeada no embedded source e avalia só esse helper
consumidor com arquivo/manifest reais e deltas declarados. Ausência helper produz
RED; require versus import, undefined/null/unknown, own type presente e context
manifest/hash/path ausentes/adulterados têm outcomes distintos. Não avaliar SDK,
fabricar módulo SDK, adicionar flag diagnóstica ou testar string regex de código.
Essa prova de predicado não substitui os testes black-box reais preservados.

Output operacional `projection/import-observation.json` é permitido, separado do
documento determinístico eight-root: loaded/resolved modules/optional misses,
contexto de loader observado e source/hash provenance, sem SQL/secret. Se registrar
undefined em JSON, usar representação explícita sem alegar alteração de formato.
Nenhuma conclusão de storage/live/adoption vem desse metadata.

## Stage A6 — disposition da custódia prior, não execução

Prior closure SHA
`55454077278d8c60ac6abcb8b829fcc8bbcaa88efe09e1a2f0e07eb26f879f5d`, retention
SHA`c597aa0ae326054a3bd9294f9e95410b9d23d2e3da19ae0238b388ba1be8a894`.
176 contextos/packages/archives;11 STYNX1.6.0;21618 tar files +3 shims retidos +3
inputs =21624 regular files;455 links internos. Graph2435 files/6426 literal edges/
5 dynamic/6 missing, não closure dinâmica universal. Conferência F3 independente
de paths/archives/graph/links/proveniência continua pré-requisito antes de pin.

Os três extras são **installer-derived**, não payload upstream: offline storage
shim SHAed58c050ed6eb2554af4f1171052b1845f570283f5f991157efe88e995917b7d;
outbox shim SHA1e75f1f5188774f4783f4266481f76014044f0b9b65a74e16b340efe806e5d4d;
sessions uuid shim SHA301629831476027891d8481e91cd81202f65b73b692b8d4d6ae14640ce21185f.
tar-payload-check SHA82de6ed61fa7493717d6aebd47263e51f35754369acdc3c8a060eefae86c1648
vincula cada shim a bin declaration/target original interno e seus hashes. Admitir
retenção explícita **não executável neste escopo**; não corrigir/excluir bytes,
alegar que vêm do tar ou conceder permissão bin. Nenhum missing tar file foi
reportado. Esse modelo de custódia é aceitável para revisão F3; readiness de prior
verifier exige revisão de import/lazy contexts e futura ativação, não nasce do count.

## Stage B7 — UTC, producer portátil e criação isolada, ainda HELD

Antes de capturar/recapturar fresh rows, usar transaction-local TimeZone UTC em
pre-readonly/main/post-readonly e guardar installed_at::text mais to_char UTC com
seis casas. Mesma representação estável no repeat; não alegar insertion lexeme
original. Não alterar valor persistido nem usar JS Date para identidade. Defaults
SQL/RETURNING e actual current_user/transaction_timestamp de B3 permanecem exigidos.

Counterpart CI não copia seals macOS/absoluteNode paths nem confia em manifest
recalculado como fonte de trust. Paths adicionais propostos F2:
`tools/prepare-published-stynx-admission.mjs`,
`tools/stynx-storage/fixtures/published-1.6.1/verification.json`,
`runtime-package.json`, `runtime-package-lock.json` no mesmo fixture diretório.
Fixture verification é a cópia **real** SHA46815c17 acima, não SDK/mock/provider
sample; runtime manifests/lock são bytes admitidos de A2, verificáveis contra
tar/integrities. F3 deriva/revisa fixtures antes de F2 tool. Producer CLI único
`node tools/prepare-published-stynx-admission.mjs <admission-root>`: versão/publicação
fixas, cria contexto isolado por lock, ignore-scripts/strict-peer-deps, retém
registry/tar/SRI e graph/files/Node real da plataforma. Sem active install/DB.
Observer portátil mantém contrato A3/predicado/escape guards e inputs públicos;
Node/platform identity tem admissão própria, não equivale automaticamente ao macOS.
Source sensor prova que recomputar manifest não admite tar/file/edge adulterado.

CI deve preparar esse contexto antes de required glob e reter evidências. F2
`.github/workflows/ci.yml` pode receber somente esse preflight/retention quando
ativado/revisado, sem check filters/threshold changes; nenhum edit é autorizado
agora. Manifests/producer reais, source hashes, Linux/Node input disposition e
assertions F3 devem estar fechados antes de integrar sensor glob. Falta de input
recusa, não skip/download tardio no meio do teste. Este controle não bloqueia A3
local já autorizado, mas continua obrigatório antes de CI/final campaign integration.

### B7a — criação-only depois de A3, separada da instalação

Proposta de rehearsal: cluster novo exclusivo sob
`scratch/r22-adoption-161/db-rehearsal/cluster-01/`, data/ e sockets/ internos,
log `postgres.log`, port65461, listen somente127.0.0.1. Binários resolvidos do
Postgres.app initdb/pg_ctl/postgres/psql devem ter realpath/version/SHA capturados;
exigir port livre, paths novos/sem symlink, versão suportada e ausência de outra
lease. Não parar/reusar servidor compartilhado ou DB04. Sem Owner question nova:
a ativação creation-only será registro F1 específico após A3, com os hashes e
preflight concretos. Até lá, nenhum comando abaixo é executável por esta minuta.

Comandos fechados desse futuro registro usam somente os binários admitidos e
paths absolutos resolvidos desse cluster:

```text
initdb -D <cluster-01/data> --username=postgres --encoding=UTF8 --locale=C --auth-local=trust --auth-host=trust
pg_ctl -D <cluster-01/data> -l <cluster-01/postgres.log> -o "-h 127.0.0.1 -p 65461 -k <cluster-01/sockets>" -w start
psql -X -v ON_ERROR_STOP=1 -h 127.0.0.1 -p 65461 -U postgres -d postgres
```

Trust auth é exclusivamente desse cluster local descartável, sem interface externa;
não muda HBA/roles de servidor existente. Role/ACL negatives exigem lease exclusiva
de todo cluster, nunca concorrência com outro sujeito de rehearsal. Criação de
roles/domains, seed e storage continua fora da activation creation-only.

SQL creation-only é CREATE DATABASE com OWNER postgres, TEMPLATE template0 e
ENCODING UTF8 para nomes exatamente `detran_r22_161_ref160`,
`detran_r22_161_refprefix8`, `detran_r22_161_upgrade`,
`detran_r22_161_fresh`, `detran_r22_161_negative`, `detran_r22_161_full`.
Não aceitar nomes caller arbitrários. Após CREATE, antes de qualquer install/seed,
capturar SQL cluster system_identifier, database OID/name/owner, version e
session/current user em subject-manifest retido. Nunca prever OIDs.

Só então F1 pode ativar instalação/rehearsals B com subjects reais/leases/F3 RED/
prior custody/A3 exact artifacts. `--full` futuro limita-se ao DB separado
detran_r22_161_full neste cluster observado, flag
`DETRAN_R22_161_FULL_AUTHORIZED=1`, lock/cluster identity conferidos; os três guards
históricos de --full ficam iguais. Recriação tem novo OID/subject capturado antes
de seed; não reivindica preservação das rows que explicitamente destruiu nesse
fixture exclusivo. Fresh principal/upgrade/references permanecem intactos.

## A7 — resultado Stage A aceito, 2026-10-13T20:11:30Z

F3 encerrou a lease de source/readback46d6; bytes desse freeze permanecem retidos.
Stage A bounded PASS: report
`scratch/r22-adoption-161/package-admission/INSPECTOR-STAGE-A-REPORT.md`, SHA
`77e892cc2af0a08a41f48a46dafaa09068b1e2f500eb78792cb847a0c4f21f3c`.
Suite52 PASS/0 FAIL/0 skip, log
`9652a7d96feb5b16886e959ba9a4c787cbd759975a3f528cf3e89e3c90c82752`;
driver`fee708d8829ea1e7bfb742ad20c5e46339db48a4539654882b9272343e320d50`,
sensor`eb90f13cbf3619422dce8c37e00d3ad689b10caa50da07e8fb4ae89dc450ec7c`,
closuref372c94b. Initial absence REDs e29/4 loader RED permanecem distintos.
Negativos por seal imutável não provam isoladamente toda camada parser profunda;
source helper/context e file/CLI/env/link guards têm witnesses próprios. Não há
declaração de sandbox universal para código hostil.

Original-root projection SHA
`944f0041700de5e2c31ebf0e71b7999df999d76cc6645b3bec38ddfc0f692388`,498873 bytes;
import observation`64f8bc1274fe707e6ad8901b059b248c452fb145a918a64b7ec7548724fbf453`;
custody`0e6cb95f77d87abf757d961a52acf58a4a46efb5c1c53976b476da7ea0836434`;
facts`028556b0aa9b7c1c9eead06e2add4fb00167176e08b3823b5adf1bd482efad56`.
F3 conferiu1757 actual loaded/resolved files, dois optional misses exatos e outputs
integrais. Architect também leu os JSONs e conferiu SQL digests/comparação prior,
sem executar SDK. Outbox objects
`2bd6d328e67f1b467a0c5f019d41afb839e8bacbb0caadfe6f641a23b85e64db`, bindings
`eb33110094642f510a3731f0124ee700c4d109af4147c8ad93bcd17039334a2d`, catálogo
`fd572ca55725faa086d85c876950a8add39fa817f7ea16f609144536919e6ae5` iguais ao
prior; packageVersion/full manifest são diferentes. Isso fecha evidência pura para
o mecanismo no-storage-change B3, ainda sem admitir estado live/group.

Ordered9 reais, raw prefix1–8 byte-identical; sole suffix raw7167a3d3 e bound
`e03be4b98bff78e229104958f1b483473794ea7007c722488911075694585de7`.
Nenhuma migration foi aplicada. Suffix contém só nova relation/indexes/RLS/policy/
grants/historyguard; não contém historical DML/nextval/setval/row_security SET.
Package historyguard mantém enabled mode/row semantics publicados; consumer custody
ALWAYS statement guard é separado. Não mudar trigger canônico para satisfazer teste.

Prior retention F3 PASS report
`60ab16b13a57bc0253aa266a48c8aed19714e96fa6ab5f38d634caa47665e4c4` aceita
bytes/176 contexts/tars/455links e três shims não executados. Count21624 é o capture;
actual total21625 inclui input1bb213a1 adicional separadamente fechado. Cinco
dynamic/seis missing continuam registrados. Sem prior SDK/verifier/DB executado;
retention não é prontidão universal de método prior. StageB pin/storage/seed/roles/
live equivalence, portableCI e provider/trust continuam HELD.

## B7a-ACT — ativação exclusiva de criação/identificação do cluster

**ATIVO somente creation-only**, sob autoridade Owner existente e aceite bounded
Stage A acima. Lease de coordenação `R0022-161-CLUSTER01-CREATE`, Root Engineer
executor exclusivo; Inspector pode realizar readback de identidades/catálogos
somente READ ONLY. Architect não executa DB. Nenhuma outra lane/servidor pode
mutar esse cluster durante essa lease. Lease termina após criação/readback retido;
instalação exige nova activation F1 sobre subjects reais, não sucessão implícita.

Raiz absoluta exclusiva:
`/Users/aarusso/.codex/worktrees/detran-r22-adoption-160/detran/scratch/r22-adoption-161/db-rehearsal/cluster-01`.
Permitir data/, postgres.log, creation.sql, comandos/logs, creation-lease.json e
subject-manifest.json somente nessa raiz nova. Criar parent db-rehearsal se ausente,
cluster-01 por mkdir que falha se já existe; sem symlink/external path. Mode700 no
cluster root/data. Nenhum delete/reuse/recreate de datadir existente.

Preflight retido
`planning-custody/stage-b-draft/postgres-binary-preflight.json` SHA
`9d651384c6291c9c7f9e6defea1f92be7c4e245e1463db1d3325a601eb3c7955`
sob scratch/r22-adoption-161: quatro PostgreSQL18.2 binários canônicos. Rehash,
realpath/version e port livre65461 **imediatamente** antes da criação; source
preflight antigo não reserva port. Divergência/falha encerra avanço, sem kill de
processo alheio ou fallback para servidor compartilhado.

| Binário absoluto em `/Applications/Postgres.app/Contents/Versions/18/bin/` | SHA-256                                                            |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| initdb                                                                     | `d103626d91c90af601aa1e8356b383b983cbac000e3310d6c3e951db54e7337a` |
| pg_ctl                                                                     | `9e13ce199a5ddf82b0d868fc82b12f016035ca2d5646b623d9c3ac69516c40cd` |
| postgres                                                                   | `e5ced2a1cf0375859196ccd15172bcbdf263c6b4fde5a83da93a92d67d63732c` |
| psql                                                                       | `6118e2b9d262ea230c5401382a2ff795c65ae87e99d06418a9a979075cd41591` |

Comandos exatos de startup (variável só abrevia a raiz literal acima):

```sh
detran161_cluster_root='/Users/aarusso/.codex/worktrees/detran-r22-adoption-160/detran/scratch/r22-adoption-161/db-rehearsal/cluster-01'
env -i PATH=/usr/bin:/bin LANG=C LC_ALL=C /Applications/Postgres.app/Contents/Versions/18/bin/initdb -D "$detran161_cluster_root/data" --username=postgres --encoding=UTF8 --locale=C --auth-local=trust --auth-host=trust
env -i PATH=/usr/bin:/bin LANG=C LC_ALL=C /Applications/Postgres.app/Contents/Versions/18/bin/pg_ctl -D "$detran161_cluster_root/data" -l "$detran161_cluster_root/postgres.log" -o '-h 127.0.0.1 -p 65461 -c unix_socket_directories=' -w start
env -i PATH=/usr/bin:/bin LANG=C LC_ALL=C /Applications/Postgres.app/Contents/Versions/18/bin/psql -X -v ON_ERROR_STOP=1 -h 127.0.0.1 -p 65461 -U postgres -d postgres
```

UNIX sockets ficam desabilitados: filename proposto interno teria134 bytes; todos
os clients usam TCP127.0.0.1. Essa correção técnica supersede -k de B7a, sem socket
externo/host extra. Closed env evita PGHOSTADDR/PGSERVICE/PGOPTIONS e preloads
herdados. Trust HBA só existe nesse novo cluster local descartável.

**Depois de start, antes de qualquer CREATE DATABASE**, conferir postmaster PID
novo/local/pg_ctl status e READ ONLY SQL data_directory/port/listen/serverversion/
session_user/current_user/system_identifier contra datadir/PID/binary recém-criados.
Pode ler postmaster.pid por filesystem e `pg_read_file('postmaster.pid')` no novo
owner session para igualdade. data_directory real deve ser a data/ literal acima,
port65461, listen127.0.0.1, PostgreSQL18.2 e real postgres. Mismatch/port race STOP
antes de CREATE; não basta haver um servidor respondendo. Capturar evidência dessa
conferência. Nenhuma transação app/role context é usada.

Só após esse guard, SQL permitido, em autocommit (não hidden owner transaction):

```sql
CREATE DATABASE detran_r22_161_ref160 OWNER postgres TEMPLATE template0 ENCODING 'UTF8';
CREATE DATABASE detran_r22_161_refprefix8 OWNER postgres TEMPLATE template0 ENCODING 'UTF8';
CREATE DATABASE detran_r22_161_upgrade OWNER postgres TEMPLATE template0 ENCODING 'UTF8';
CREATE DATABASE detran_r22_161_fresh OWNER postgres TEMPLATE template0 ENCODING 'UTF8';
CREATE DATABASE detran_r22_161_negative OWNER postgres TEMPLATE template0 ENCODING 'UTF8';
CREATE DATABASE detran_r22_161_full OWNER postgres TEMPLATE template0 ENCODING 'UTF8';
```

Após CREATE, capturar em novas transações REPEATABLE READ READ ONLY, TimeZone UTC,
cluster system_identifier decimal text, actual database OIDs/name/owner, current/
session user, transaction_read_only/row_security/replication role, server version,
port/data directory/PID/start instant e catálogo pristine de cada DB. OIDs nunca
preditos. Reter raw SQL text/UTC6 e subject-manifest/command/log hashes; F3 readback
independente antes de devolver sujeitos à F1. Sem package verifier/renderer/store.

**Limite:** zero schema/extension/domain/role/membership/defaultACL creation ou
alteration, zero seed/custody/storage SQL, zero pin/active package changes; DB04,
shared cluster, primary/PR179 e provider/trust continuam intocados. Bootstrap
standard cluster/template objects de initdb não são product installation.
Partial failure preserva todos os bytes/DBs/logs, STOP sem inferir rollback de
CREATE DATABASE. Pode parar somente o novo postmaster cujo PID/datadir foram
comprovados, pelo mesmo pg_ctl `-D <essa data> -m fast -w stop`; nunca rm/recreate
ou kill de servidor alheio. Sucesso não ativa B1–B6 nem --full.

## B8 — sujeitos reais, transaction seam e ativação pura F3 antes de F2

Esta extensão sucede o freeze77eae69d, sem promover retrospectivamente criação
a instalação. A criação e readback independente terminaram; lease
`R0022-161-CLUSTER01-CREATE` devolvida. Report real
`scratch/r22-adoption-161/db-rehearsal/cluster-01/INSPECTOR-CREATION-READBACK.md`,
SHA`6ad3558eff1fc75edfb9c1b0695332f080edd8b98fc0c672ab1f749e27321da4`,
e JSON `inspector-creation-readback.json`,
SHA`67920115a49246e30ef0186cdeaff40d14d6a42a9e2047c2884b38701076a7bf`,
conferem os manifests181168a6/3960d5b4 intactos. Foram seis transações finais
REPEATABLE READ READ ONLY/UTC/RLS on com ROLLBACK, mais duas calibrações read-only
explicitadas no report. Nenhum SDK, role/schema/extension/seed/storage/pin mudou.

Sujeitos exatos sob cluster-01/data, TCP127.0.0.1:65461, Unix sockets desabilitados,
system_identifier string`7696248909089426150`, postmaster observado10989,
PostgreSQL18.2/server_version_num180002, owner postgres:

| Database                  | OID SQL string | Uso delimitado                                         |
| ------------------------- | -------------- | ------------------------------------------------------ |
| detran_r22_161_ref160     | 16384          | Referência fresh pública1.6.0                          |
| detran_r22_161_refprefix8 | 16385          | Referência ordered prefix1–8, sem receipts individuais |
| detran_r22_161_upgrade    | 16386          | Fresh real1.6.0 populado, depois suffix9               |
| detran_r22_161_fresh      | 16387          | Fresh real1.6.1 e repeat                               |
| detran_r22_161_negative   | 16388          | Negativos/rollback/STOP isolados                       |
| detran_r22_161_full       | 16389          | Único novo sujeito elegível ao futuro --full           |

Todos estão pristine: apenas public/plpgsql bootstrap, sem objetos aplicação ou
storage. OIDs não são previstos nem transferíveis após recriação. Novo start
revalida actual PID/data_directory/port/sysid; mudança não permite usar o PID antigo
como substituto da identidade SQL. Subject owner/cluster/OID/name devem coincidir
em cada locked admission. Esses nomes não autorizam produção nem DB04 antigo.

### B8a — decisão fechada de transação, sem autorização de execução implícita

Escolhido **Node-owned target pg.Client transaction**. O antigo psql
--single-transaction autoCOMMIT no EOF não é o seam de execução StageB. Não se
implementa protocolo psql interativo. `tools/stynx-storage-install.mjs` mantém
CLI dry-plan root-only e `runStorageInstall(root,{full})`; `apply.sh` continua
aceitando somente --full ou nenhum argumento. Não há argumento SQL/path/binding,
callback arbitrário, modo adopt, baseline livre ou bypass.

O runner fixo usa um Client de manutenção no DB postgres com session lock
(7007,1600), e um Client do sujeito com BEGIN + xact lock(7007,1). Preserva a
closed inventory/ordem de SQL, todas as onze comparações legacy e refusas existentes
de psql metacommands, transaction control, comandos não transacionais, arquivos
desconhecidos/ausentes. Executa bytes admitidos por query em ordem, não concatena
SQL de caller nem reescreve artifacts públicos. Se a adaptação ao Client revelar
comando incompatível, STOP; não descartar comandos para prosseguir.

Sequência main exata: BEGIN/locks e context local UTC/RLS → re-read identity/state
→ actual current_user/session_user/transaction_timestamp SQL UTC seis dígitos →
DDL/canonical artifact ou sole suffix9 conforme modo → actual fresh rows SQL text
→ documentos JS canônicos a partir dos fatos da mesma transação → INSERTs fixos
omitindo actor/time defaults → RETURNING em SQL text e igualdade total → retenção
durável dos bytes candidate → COMMIT explícito → novo READ ONLY latest verifier
e commit observation detached. Fresh faz duas linhas reais1.6.1; upgrade nunca
altera as duas originais1.6.0. Context row_security=on e search_path legacy são
restaurados fora dos bytes públicos antes do restante da inventory.

Novo custody schema + baseline recém-admitido + suffix9 + forward9 + target group

- bindings/revokes compartilham a mesma primeira transação de escrita no upgrade.
  Fresh compartilha schema + ambos artifacts + duas fresh rows + group + bindings.
  Não há preinstallation silenciosa do schema. Existing accepted repeat preserva
  schema/linhas anteriores. Pre/post public verifiers usam transações novas
  genuinamente READ ONLY, nunca a main transaction. Falha antes de COMMIT exige
  ROLLBACK e prova against actual entry snapshot; falha pós-COMMIT é STOP. Exceção
  ou sinal durante COMMIT não prova rollback: retain commit-unknown e locked live
  re-read completo, sem prefix replay, compensating SQL ou receipt inferido.

Baseline não ganha campo admission novo. Sua row SQL admitida usa DEFAULTs e
RETURNING separado `{baselineId,admittedBy,admittedAtSql,admittedAtUtc}`; o instante
real confere transaction_timestamp main. Forward/group possuem execution/admission
já fechados e igualdade total. Nenhum override stale actor/time é aceito na seam.
installed_at/admitted_at/executed_at usam ::text UTC e to_char UTC seis dígitos;
pg Date e jsonb::text não são fontes de identidade/canonical digest.

### B8b — interfaces puras e refs fixas para autoria independente

Agora se fecha `tools/stynx-storage-forward.mjs` com somente dois exports públicos:

- `parseStorageCustodyDocument(text,kind)`; kind baseline|forward|group. Retorna
  `{document,canonicalJson,recordSha256}`. canonicalJson é o documento completo
  validado em JSON canônico, incluindo recordSha256; o cálculo desse campo omite
  somente a chave raiz homônima. Refusa por Error.code
  `R22_STORAGE_CUSTODY_INVALID`, sem corrigir/coagir/documento parcial.
- `createStorageTargetPlan(root,inputs)`; inputs tem exatamente
  `{publication,projection,priorRuntime,baseline,baselineReview}`. Cada não-null é
  ref B3 de arquivo retido; baseline e baselineReview são ambos null ou ambos refs.
  publication aponta protected-publication-verification.json, projection o JSON
  público944f0041, priorRuntime closure55454077. Não aceita documento/boolean de
  aprovação ad hoc, actor/time/DB config nem seletor de modo. Baseline preenchido
  precisa passar parser, todas as refs/proveniência e review detached descrita B8c.
  Recusa por Error.code `R22_STORAGE_TARGET_PLAN_INVALID`.

Plano retorna exatamente `{formatVersion,targetPublication,
targetPublicationDigest,binding,bindingDigest,artifacts,priorRuntime,baseline,
baselineReview}`; formatVersion literal `detran-stynx-storage-target-plan/1`.
Publication/binding são B3 e seus digests recomputados. artifacts é
`{outbox,offline,ordered}`: outbox/offline cada
`{ref,objectsSqlSha256,roleBindingsSqlSha256,manifestSha256}`; ordered
`{ref,migrations}` com nove entradas `{ordinal,sourcePath,rawSqlSha256,boundSqlSha256}`
na ordem pública. ref dos três aponta o JSON A3 inteiro retido; valores conferem
retention/public returns, não são hashes fornecidos sem recomputação. priorRuntime
é a ref validada; baseline é null ou `{ref,recordSha256}`; baselineReview null ou
ref validada. Plano não atesta DB nem escolhe modo; locked runner faz B1 apenas
após catálogo/current verifier e igualdade de todas as rows/documentos.

Refs resolvem paths relativos ao root exato e hashes prefixed sha256. Ref fora do
root, traversal/absolute/URL, link escapando ou arquivo ausente/tampered recusa.
Internal links já inventariados das closures não viram permissão de escape geral.
Nenhum ref pode apontar documento que transitivamente depende do próprio digest,
de future group/commit/postcommit review ou outro ciclo. Validar DAG/produtor antes
de usar como trust. O parser só prova schema/hash; o plano adicionalmente prova
inputs reais e reviewed identity. Test fixture de schema não é baseline admitido.

Canonical/parser vectors obrigatórios: decoded unpaired Unicode, invalid UTF-8
no ingresso arquivo, duplicate nested escape-equivalent keys, extra/missing keys,
unsafe/nonfinite numbers e lexical integer precision loss; UTF16 vs locale/codepoint
sorting, ordered arrays, só root hash omitido e nested hash preservado. Campos
numéricos de custódia aceitam somente o inteiro matemático exato safe-integer
declarado; lexeme arredondado para inteiro não satisfaz. Subject/OID/time continuam
strings. Isso não cria limite novo de payload/context produto.

### B8c — revisão real de baseline, ordenação e custody filesystem

Antes do hash final baseline, review.inspector é ator real
`/root/inspector_adoption_160` na role Inspector, e review.independent é ator real
`/root/architect_adoption_160` na role Architect. Cada report ref vincula os inputs
prior-state/equivalence/projection já retidos que efetivamente leu; os dois são
distintos do producer F2 `/root` ou `/root/engineer_outbox_160`. São revisões de
inputs, sem alegar o digest futuro do baseline. Não é audit formal por CTG ou
abertura de Auditor antecipado; OD-C2-005 permanece.

Depois de montar/validar baseline final, Inspector emite review detached real,
F1 revalida e registra seu SHA exato antes da admissão. Schema desse documento:
`{formatVersion,kind,baselineId,subjectDigest,targetPublicationDigest,
inputReviews,reviewer,disposition,recordSha256}`; literals
`detran-stynx-offline-baseline-review/1`, `baseline-final-review`, accepted;
inputReviews `{inspector,independent}` são as mesmas refs baseline.review;
reviewer `{role,session}` literalmente Inspector e /root/inspector_adoption_160.
Digests correspondem ao baseline final/subject/publication canônicos. Canonical
hash omite somente root recordSha256. A alegação accepted sozinha não autoriza:
runner exige ref/SHA desse report real previamente vinculados no input activation
F1. Producer não cria approval em nome dos reviewers. Revisão final é detached:
baseline não aponta esse review, evitando ciclo. Nenhum report concreto ou digest
futuro é inventado nesta extensão; upgrade continua aguardando essa prova real.

Discovery de runtime inputs é fixa em
`scratch/r22-adoption-161/db-rehearsal/cluster-01/admitted-inputs.json`, futuro
arquivo de activation F1/root retido após F3 review, sem CLI override. Root keys
exatamente `{formatVersion,subjectManifest,creationReview,publication,projection,
priorRuntime,baselineInputs}`; formatVersion1; os seis primeiros refs nos artifacts
reais acima; baselineInputs array fechado por subject `{databaseName,databaseOid,
baseline,baselineReview}` para upgrade, sem entry produzida até prova completa.
Ref/SHA do arquivo inteiro fica vinculada pela activation F1 anterior à execução;
recalcular arquivo não concede trust. Fresh não usa baseline. Proíbe fallback em
arquivo user-supplied/default fora desse path. Final portable CI terá input
discovery própria revisada; arquivo local não é fixture CI portátil.

Custody outputs locais só em
`scratch/r22-adoption-161/db-rehearsal/cluster-01/subjects/<databaseName>/runs/<runId>/`,
databaseName um dos seis nomes/OID admitidos. runId é diretório novo criado por
mkdtemp prefixo `attempt-`, registrado antes do BEGIN, nunca overwrite/reuso.
Paths fechados: `entry-state.json`, `transaction-facts.json`, `execution-plan.json`,
`candidate/baseline.json`, `candidate/baseline-row-custody.json`,
`candidate/forward-9.json`, `candidate/group.json`, `candidate/fresh-rows.json`,
`candidate/manifest.json`, `outcome.json`, `locked-readback.json`,
`postcommit-verifiers.json`, `commit-observation.json`. Ausência de baseline/forward
em fresh é explícita no candidate manifest, nunca arquivo fake. candidate manifest
lista path/bytes/SHA dos arquivos realmente criados e suas IDs; retain/fsync antes
de COMMIT. `outcome.json` detached registra candidate|rolled-back|commit-unknown|
committed-stop|committed-verified; não muda bytes candidate ou documento SQL.
Reports detalhados podem ser filhos de `reports/` com inventory/hash no manifesto
detached. Main/log timestamp é observação, não admission timestamp.

Se COMMIT desconhecido, lock continua e locked-readback verifica cardinalidade,
catálogo, full document/digest/column equality e original rows atuais; não escreve
receipt faltante por inferência. SQL rolled-back e arquivos candidate permanecem
retidos com disposition, não apresentados como execução aceita. Arquivo FS não é
atomic commit com DB; detached observation estabelece qual ID existe realmente.

### B8d — cardinalidades e refusas antes de qualquer escrita

Fatos SQL são internos ao runner, re-read sob lock, nunca trust boolean no plano.
Ausência de qualquer componente fresco quando há storage parcial/unreceipted,
custody relation faltante/extra/alterada ou conjunto zero-row previamente criado
sem admissão é STOP. Pristine branch exige ausência total de package storage,
fresh ledger e três custody relations; objetos helper-owned de bootstrap não
contam como storage pristine, mas precisam de inventory própria admitida.

Fresh admitido/repeat fresh: exatamente duas fresh rows1.6.1 e um group fresh,
zero baseline e zero forward rows. Upgrade admitido/repeat upgrade: exatamente
duas fresh rows1.6.0, um baseline8, um forward9 e um group upgrade apontando os
mesmos IDs/subject/publication/binding. Pre-upgrade permitido tem exatamente as
duas originais1.6.0 e nenhuma custody relation; baseline proof é externa revisada
até a primeira escrita atômica. Nenhum baseline-only/forward-only/group-only ou
schema-only estado é adotado. Extras, ordinal10/gap/fork, zero/null branch errada,
wrong outbox/full target manifest/entrypoint, alvo diferente com SQL igual, row
timestamp/by/document divergence e refs não resolvidas recusam. Repeats comparam
todos os campos/bytes canônicos e actual SQL times, não só PK/count; nenhuma nova
row, fresh replay ou schema repair.

Old ledger-drop negative tem que alcançar a mesma condição unreceipted anterior.
F3 pode preparar somente fixture negativa sem custody FKs ou partir de pristine
unadmitted fixture correspondente; não basta considerar PASS porque DROP agora
falhou por FK antes da assertion original. Keep original assertions/intent e
reter setup delta explícito. Não remover constraints/proteções do produto.

Futuro --full neste cluster exige ambos apply e runner: literal
DETRAN_R22_161_FULL_AUTHORIZED=1, único databaseName detran_r22_161_full, host/port/
sysid/data_directory admitidos e lease exclusiva. Os outros cinco novos nomes
servem a normal rehearsal, não --full. Guards históricos permanecem iguais.
Recriação intencional recaptura novo OID/owner antes de qualquer schema/seed;
OID16389 histórico não é inventado como OID futuro. Nenhum --full é ativado agora.

### B8e — ativação limitada e próxima ação concreta

**ATIVADO AGORA:** Inspector pode escrever/rodar apenas sensores puros/source de
`tools/stynx-storage/tests/forward-admission.test.mjs`. Usa artifacts reais A3/
prior retidos e vectors closed JSON/canonical/column mapping/schema/plan. Candidate
documents construídos para teste são explicitamente fixture, nunca baseline
review/admission real. Sem SDK import, DB, pin ou shared role mutation. RED real
por módulo/DDL ausente antecede F2. Existing StageA sensors não são reescritos.

Depois de RED independente retido e comunicado, Engineer pode criar apenas
`tools/stynx-storage-forward.mjs` e
`backend/database/ddl/19-stynx-offline-custody.sql`, materializando B2/b5/B6/B8 e
igualdade total/closed parser/plan; pode rodar esses sensores puros/type/hygiene.
DDL é arquivo candidato, não entra em apply inventory nem é executado neste passo.
F3 faz review/source assertions das constraints/ACL/RLS/ALWAYS/PG18 e guards,
incluindo typed NULL predecessor/fork e unknown10 admission refusal.

Main runner authoring/SQL execution/bootstrap/reference behavioral sensors/pin
continuam separados, a ativar em extensão concreta depois de revisar pure RED/
GREEN e fechar selected prior methods/controlled1–8 comparator, fixed input
activation e leases de instalação. Node seam B8a é decisão arquitetural para essa
próxima lane, não permissão de executar agora. Public prior render/verify/catalog
exports foram lidos nas d.ts retidas; graph5dynamic/6missing ainda exige disposition
selected-method explícita antes do primeiro import. Nenhum service constructor,
HTTP/Nest bootstrap, Express View require, platform migration runner, Redis/native
PG ou optional adapter passa a estar autorizado por custody60ab16b1.

Próxima ação autorizada: F3 independent pure RED e review do novo schema candidato,
depois F2 nos dois paths acima. CI producer/counterpart admission continua requisito
antes de required-glob integration, sem bloquear esta lane local. Provider samples/
approved trust e production subject continuam externos/ausentes; não são fabricados
para liberar storage. No stage/commit/push/PR/merge/cutover segue desta extensão.

### B8f — derivação packageAdmission e nível de revalidação prior

Ref targetPublication.packageAdmission é derivada do path fixo
`retention-manifest.json` no admission-root que contém `projection/`; seu SHA real
é56e2e6438b8ef505eca99357e8e219e30ceb170f68f7b5779fff6f997c8a98ac.
Não acrescenta seletor aos cinco inputs B8b. Roots copiados de fixtures mantêm
esses paths relativos e bytes; não alegam ser o sujeito real por serem parseáveis.

createStorageTargetPlan rehashes closure prior55454077 e suas refs diretas
installedCapture/packageProvenance/tarPayloadCheck/staticGraph/
priorPublishedRootCustody, além da retentionc597aa0a e report independente60ab16b1
retidos no prior-runtime. Confere a inventory installed-capture inteira: bytes/
size de todos os regular files, links internos/topologia e ausência de extras ou
missing. Contagem21624 capture não oculta o input1bb213 separately inventoried;
actual21625 é a união explícita, sem wildcard exemption. Archives176 conferem os
hashes metadata/provenance retidos; não se reextrai toda tarball a cada plano.
Tar-payload equivalence já tem report independente pinned; não se inventa nova
execução desse audit. Não importa SDK/CLI/bin shims nem avalia modules para isso.
Graph custody5dynamic/6missing permanece honesta, sem ser universal import permit.

Consequential choices estão também preparadas em
`docs/meta/adr/ADR-0040-r22-stynx-1-6-1-forward-custody.md` (Proposed). Final lane F1
inclui sincronizar `docs/meta/adr/README.md` e `DESIGN-DECISIONS.md` antes da
integração, sem mudar os índices v4 neste passo puro. ADR0039 aceita permanece
byte-identical. ADR0040 registra a decisão, não amplia B8e ou antecipa resultados.
