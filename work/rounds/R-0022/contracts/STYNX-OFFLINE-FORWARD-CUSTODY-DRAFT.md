# Custódia offline forward — proposta F1, sem execução

**Architect, 2026-10-13. DRAFT / NOT_ADMITTED.** Complementa D-160.13; não é DDL
do backend, inventory de apply, receipt real ou autorização para publicar/pinar 1.6.1.
Publicação alvo, projeção/equivalência revisadas e sujeito de produção continuam
desconhecidos. As duas linhas fresh existentes permanecem intactas. Os v2/v3 e a
preparação DB04 são evidências históricas separadas, nunca conversão automática.
Revisão atual é somente leitura de statements e relações lógicas: não compilou nem
executou este SQL em PostgreSQL e não comprovou enforcement/catalog/ACL/concorrência.
Formatação/diff limpos não são aceitação do DDL; os sensores futuros permanecem pendentes.

## Modelo e DDL proposto

Nomes/tipos/constraints abaixo tornam a proposta revisável. Nenhum statement deve
ser executado ou copiado para backend/database antes da emenda de execução exata.
Digests são SHA-256 canonical/dos bytes conforme D-160.13; a aplicação futura deve
validar documento fechado, origem/digests e custódia antes de INSERT. JSONB sozinho
não valida assinatura, provenance ou schema fechado. Guardar também os bytes UTF-8
originais do documento fora do banco, vinculados pelo mesmo digest canônico.
Admissão rejeita propriedades duplicadas/escape-equivalentes, ausentes ou extras
antes de JSONB; `jsonb::text` não substitui o digest canonical UTF-16 do documento.

```sql
-- F1 DRAFT ONLY: not an admitted migration or live installation plan.
CREATE TABLE integration.stynx_offline_baseline_custody (
  baseline_id text PRIMARY KEY CHECK (baseline_id ~ '^sha256:[0-9a-f]{64}$'),
  package text NOT NULL CHECK (package = '@stynx-nyx/offline-sync'),
  prior_package_version text NOT NULL CHECK (prior_package_version = '1.6.0'),
  target_package_version text NOT NULL CHECK (target_package_version = '1.6.1'),
  subject_digest text NOT NULL CHECK (subject_digest ~ '^sha256:[0-9a-f]{64}$'),
  fresh_receipt_digest text NOT NULL CHECK (fresh_receipt_digest ~ '^sha256:[0-9a-f]{64}$'),
  target_publication_digest text NOT NULL CHECK (target_publication_digest ~ '^sha256:[0-9a-f]{64}$'),
  binding_digest text NOT NULL CHECK (binding_digest ~ '^sha256:[0-9a-f]{64}$'),
  covered_prefix_length integer NOT NULL CHECK (covered_prefix_length = 8),
  last_covered_source text NOT NULL
    CHECK (last_covered_source = 'packages/offline-sync/migrations/0008_import_receipts.sql'),
  projected_prefix_digest text NOT NULL CHECK (projected_prefix_digest ~ '^sha256:[0-9a-f]{64}$'),
  document jsonb NOT NULL CHECK (jsonb_typeof(document) = 'object'),
  admitted_by name NOT NULL DEFAULT CURRENT_USER CHECK (admitted_by = 'postgres'::name),
  admitted_at timestamptz NOT NULL DEFAULT transaction_timestamp() CHECK (isfinite(admitted_at)),
  CONSTRAINT stynx_offline_baseline_fresh_fk FOREIGN KEY (package)
    REFERENCES integration.stynx_storage_installations(package) ON DELETE RESTRICT,
  CONSTRAINT stynx_offline_baseline_identity_uq
    UNIQUE (subject_digest, package, fresh_receipt_digest, target_publication_digest),
  CONSTRAINT stynx_offline_baseline_chain_uq
    UNIQUE (baseline_id, package, binding_digest, covered_prefix_length),
  CONSTRAINT stynx_offline_baseline_release_uq
    UNIQUE (baseline_id, package, binding_digest, target_publication_digest)
);

CREATE TABLE integration.stynx_offline_forward_receipts (
  receipt_id text PRIMARY KEY CHECK (receipt_id ~ '^sha256:[0-9a-f]{64}$'),
  baseline_id text NOT NULL,
  package text NOT NULL CHECK (package = '@stynx-nyx/offline-sync'),
  target_package_version text NOT NULL CHECK (target_package_version = '1.6.1'),
  target_publication_digest text NOT NULL CHECK (target_publication_digest ~ '^sha256:[0-9a-f]{64}$'),
  binding_digest text NOT NULL CHECK (binding_digest ~ '^sha256:[0-9a-f]{64}$'),
  ordinal integer NOT NULL CHECK (ordinal >= 9),
  source_path text NOT NULL CHECK (length(source_path) > 0),
  raw_source_digest text NOT NULL CHECK (raw_source_digest ~ '^sha256:[0-9a-f]{64}$'),
  bound_sql_digest text NOT NULL CHECK (bound_sql_digest ~ '^sha256:[0-9a-f]{64}$'),
  predecessor_baseline_id text,
  predecessor_receipt_id text,
  predecessor_ordinal integer NOT NULL,
  document jsonb NOT NULL CHECK (jsonb_typeof(document) = 'object'),
  executed_by name NOT NULL DEFAULT CURRENT_USER CHECK (executed_by = 'postgres'::name),
  executed_at timestamptz NOT NULL DEFAULT transaction_timestamp() CHECK (isfinite(executed_at)),
  CONSTRAINT stynx_offline_forward_release_fk
    FOREIGN KEY (baseline_id, package, binding_digest, target_publication_digest)
    REFERENCES integration.stynx_offline_baseline_custody
      (baseline_id, package, binding_digest, target_publication_digest) ON DELETE RESTRICT,
  CONSTRAINT stynx_offline_forward_ordinal_uq UNIQUE (baseline_id, ordinal),
  CONSTRAINT stynx_offline_forward_package_ordinal_uq UNIQUE (package, ordinal),
  CONSTRAINT stynx_offline_forward_source_uq UNIQUE (baseline_id, source_path),
  CONSTRAINT stynx_offline_forward_chain_uq
    UNIQUE (receipt_id, baseline_id, package, binding_digest, ordinal),
  CONSTRAINT stynx_offline_forward_predecessor_ck CHECK (
    (ordinal = 9 AND predecessor_baseline_id IS NOT NULL
      AND predecessor_baseline_id = baseline_id
      AND predecessor_receipt_id IS NULL AND predecessor_ordinal = 8)
    OR (ordinal > 9 AND predecessor_baseline_id IS NULL
      AND predecessor_receipt_id IS NOT NULL AND predecessor_ordinal = ordinal - 1)
  ),
  CONSTRAINT stynx_offline_forward_baseline_predecessor_fk
    FOREIGN KEY (predecessor_baseline_id, package, binding_digest, predecessor_ordinal)
    REFERENCES integration.stynx_offline_baseline_custody
      (baseline_id, package, binding_digest, covered_prefix_length) ON DELETE RESTRICT,
  CONSTRAINT stynx_offline_forward_receipt_predecessor_fk
    FOREIGN KEY (predecessor_receipt_id, baseline_id, package, binding_digest, predecessor_ordinal)
    REFERENCES integration.stynx_offline_forward_receipts
      (receipt_id, baseline_id, package, binding_digest, ordinal) ON DELETE RESTRICT
);
CREATE UNIQUE INDEX stynx_offline_forward_baseline_successor_uq
  ON integration.stynx_offline_forward_receipts(predecessor_baseline_id)
  WHERE predecessor_baseline_id IS NOT NULL;
CREATE UNIQUE INDEX stynx_offline_forward_receipt_successor_uq
  ON integration.stynx_offline_forward_receipts(predecessor_receipt_id)
  WHERE predecessor_receipt_id IS NOT NULL;

CREATE FUNCTION integration.stynx_offline_custody_immutable()
RETURNS trigger LANGUAGE plpgsql SET search_path = pg_catalog AS $guard$
BEGIN
  RAISE EXCEPTION 'Offline custody and forward receipts are immutable';
END;
$guard$;
CREATE TRIGGER stynx_offline_baseline_immutable
  BEFORE UPDATE OR DELETE OR TRUNCATE ON integration.stynx_offline_baseline_custody
  FOR EACH STATEMENT EXECUTE FUNCTION integration.stynx_offline_custody_immutable();
CREATE TRIGGER stynx_offline_forward_immutable
  BEFORE UPDATE OR DELETE OR TRUNCATE ON integration.stynx_offline_forward_receipts
  FOR EACH STATEMENT EXECUTE FUNCTION integration.stynx_offline_custody_immutable();
ALTER TABLE integration.stynx_offline_baseline_custody
  ENABLE ALWAYS TRIGGER stynx_offline_baseline_immutable;
ALTER TABLE integration.stynx_offline_forward_receipts
  ENABLE ALWAYS TRIGGER stynx_offline_forward_immutable;
ALTER TABLE integration.stynx_offline_baseline_custody OWNER TO postgres;
ALTER TABLE integration.stynx_offline_forward_receipts OWNER TO postgres;
ALTER FUNCTION integration.stynx_offline_custody_immutable() OWNER TO postgres;
ALTER TABLE integration.stynx_offline_baseline_custody ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration.stynx_offline_baseline_custody FORCE ROW LEVEL SECURITY;
ALTER TABLE integration.stynx_offline_forward_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration.stynx_offline_forward_receipts FORCE ROW LEVEL SECURITY;
REVOKE ALL ON integration.stynx_offline_baseline_custody,
  integration.stynx_offline_forward_receipts FROM PUBLIC, role_app_backend, role_auditor_min;
REVOKE ALL ON FUNCTION integration.stynx_offline_custody_immutable()
  FROM PUBLIC, role_app_backend, role_auditor_min;
```

## Documento forward fechado e identidade

Formato `detran-stynx-offline-forward-receipt/1`, kind literal
`forward-migration-executed`. O conjunto raiz obrigatório é exatamente:
formatVersion, kind, subject, package, baselineId, targetPackageVersion,
targetPublicationDigest, binding, bindingDigest, ordinal, source, boundSqlSha256,
predecessor, execution, evidence, recordSha256. Não há campos opcionais na raiz.
Objetos aninhados são igualmente fechados conforme esta tabela; nenhuma propriedade
desconhecida/duplicada/escape-equivalente ou número ambíguo pode desaparecer por parse.
Este é schema proposto, sem documento preenchido ou receipt criado.

| Campo                                                                      | Schema/semântica obrigatória                                                                                                                                                                                                              |
| -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `subject`                                                                  | `{clusterSystemIdentifier,databaseOid,databaseName,owner}`; identificadores de cluster/oid como strings decimais exatas, nome exato do DB, owner literal postgres. Igual ao subject do baseline aceito e à identidade SQL corrente.       |
| `package`, `baselineId`, `targetPackageVersion`, `targetPublicationDigest` | Pacote literal @stynx-nyx/offline-sync; baselineId/digest `sha256:<64 lowercase hex>`; versão literal1.6.1; identidade publicada exata vinculada ao baseline, não simples tag ou número.                                                  |
| `binding`                                                                  | `{ownerRole,appRole,readerRole,tenantTable:{schema,table,column}}`, literalmente postgres/role_app_backend/null/auth/tenants/id. Sem campos adicionais.                                                                                   |
| `bindingDigest`                                                            | SHA-256 do canonical JSON UTF-8 do binding completo.                                                                                                                                                                                      |
| `ordinal`                                                                  | Inteiro exato do inventário público admitido, maior que8; nenhuma coerção. O candidato conhecido tem só ordinal9 como suffix.                                                                                                             |
| `source`                                                                   | `{path,sha256}` idêntico ao renderer público: path original registrado, sha256 original de64 hex minúsculos, sem prefixo.                                                                                                                 |
| `boundSqlSha256`                                                           | SHA-256 de64 hex minúsculos, sem prefixo, dos bytes UTF-8 exatos `sql` retornados por aquele renderer/binding/source. Reter os bytes separadamente.                                                                                       |
| `predecessor`                                                              | União fechada `{kind:'baseline',baselineId,coveredPrefixLength:8}` para ordinal9, ou `{kind:'forward',receiptId,ordinal}` para ordinal maior, com ordinal anterior exatamente n−1. IDs são digests prefixados e pertencem à mesma cadeia. |
| `execution`                                                                | `{by,atUtc}`: by literal postgres real; atUtc é texto SQL do transaction_timestamp real em UTC com seis casas fracionárias, sem Date/clock do cliente. Não é source timestamp antigo.                                                     |
| `evidence`                                                                 | `{priorStateRecordDigest,executionPlanDigest,reviewedCandidateDigest,boundSqlArtifact:{path,sha256}}`. Digests prefixados e referências imutáveis existentes antes do receipt. Não referenciam um log futuro que contém este receiptId.   |
| `recordSha256`                                                             | SHA-256 prefixado do canonical JSON do documento inteiro, omitindo somente este campo raiz.                                                                                                                                               |

Canonical JSON segue D-160.13: legal JSON, ordenação recursiva de chaves por UTF-16,
arrays na ordem original e UTF-8, sem getters/coercion/toJSON ou valores descartados.
Não usar ordenação/representação `jsonb::text`. O registro original integral é retido
em bytes; document JSONB é a representação validada, nunca sua fonte de autenticidade.
Revisão final/commit observation ficam detached e vinculados ao recordSha256, sem
referência circular com evidence dentro do documento.

Igualdades coluna→campo verificadas antes do INSERT e na admissão/replay posterior:
receipt_id=recordSha256 recalculado; baseline_id=baselineId; package=package;
target_package_version=targetPackageVersion; target_publication_digest=
targetPublicationDigest; binding_digest=bindingDigest recalculado; ordinal=ordinal;
source_path=source.path; raw_source_digest=`sha256:`+source.sha256;
bound_sql_digest=`sha256:`+boundSqlSha256. Para predecessor baseline, os campos
predecessor_baseline_id/predecessor_ordinal vêm de baselineId/coveredPrefixLength e
predecessor_receipt_id é NULL; para forward, predecessor_receipt_id/ordinal vêm do
receipt anterior e predecessor_baseline_id é NULL. executed_by/executed_at devem
ser current_user/transaction_timestamp **reais**, iguais a execution, inclusive
formato UTC/precisão. document é exatamente o objeto fechado validado inteiro.

subject/binding/publicação precisam também coincidir com baseline e estado corrente;
evidence digests resolvem aos artefatos/provenance revisados, nunca hash alegado pelo
caller. O executor futuro precisa demonstrar construção/digest a partir dos valores
SQL reais na mesma transação, sem fallback de JSONB ou timestamp; essa integração
de execução ainda não existe/admitiu. Schema/colunas escalares não substituem essas
obrigações, e um objeto arbitrário com colunas iguais é recusado.

DEFAULT CURRENT_USER/transaction_timestamp() e isfinite **não** provam, sozinhos,
que o caller não forneceu ator/instante antigos. O futuro INSERT fixo omite sempre
admitted_by/admitted_at ou executed_by/executed_at da lista de colunas; sua interface
fechada não admite overrides desses campos. Captura os valores reais por RETURNING
em texto SQL sem Date e os compara ao current_user/transaction_timestamp observado
na mesma transação. execution.atUtc do documento forward vem dessa observação real
e deve coincidir exatamente; o instante de captura/revisão do baseline não substitui
admitted_at. Stale finite timestamp/ator fornecido ao admission interface ou dentro
de execution recusa; qualquer mismatch após INSERT exige rollback do grupo, nunca
UPDATE de receipt. F3 futuro prova esses negativos. Isso delimita o executor futuro,
não uma proteção alegada contra SQL arbitrário executado pelo próprio superowner.

## Assertions e significado obrigatório

O FK fresh vincula a linha package, mas não prova seu digest/imutabilidade: assertions
recalculam `fresh_receipt_digest` da linha original exata e verificam o grupo fresh
inteiro sem UPDATE. Baseline document precisa ser D-160.13 aceito, não a preparação
DB04. Conferir igualdade de cada coluna com o documento fechado e seus digests;
mesma chave/conteúdo repete o primeiro registro, divergência recusa sem UPSERT reparador.

Baseline cobre 1–8 por equivalência prospectiva revisada; não cria oito receipts de
execução. O primeiro receipt real é ordinal9, predecessor baseline. Os seguintes
apontam ao receipt anterior exatamente, com mesmo baseline/pacote/binding/publicação.
FK/CHECK/uniqueness impedem gaps/forks/reuso de fonte; admissão também confere paths,
ordinal máximo e raw/bound digests contra o renderer público **instalado publicado**.
Não aceitar ordinal10 só porque este draft permite representar cadeias posteriores:
o inventário fechado observado atualmente tem 9, e fonte desconhecida recusa.
F3 futuro inclui explicitamente ordinal10 recusado pela admissão mesmo sendo
estruturalmente representável, predecessor NULL/branch errado, gap, fork, fonte
repetida e documento extra/ausente/duplicado/divergente. Nenhum desses casos foi
executado por esta revisão F1.

Antes de INSERT/DDL: owner/session postgres reais, defaults/memberships seguros,
visibilidade total, prefixo e prior-state atuais sob coordenação A160-09. Assertions
de catálogo conferem definições exatas, keys/FKs/CHECKs validados/enforcement ativo,
indexes válidos, owner/RLS/FORCE, zero policies, guards ALWAYS/prosrc/proconfig/ACL e
nenhuma view/rule/partition/trigger inesperada. Nenhuma capacidade efetiva de app,
reader, auditor, PUBLIC ou parent role alcançável, incluindo grants por coluna,
grant options, defaults, schema CREATE e funções. Revogações específicas são finais
depois de qualquer DDL20 amplo. Outros superusers administrativos não são uma
fronteira que este ledger consiga excluir; não alegar proteção contra o owner.
Inventário de catálogo é version-aware: PostgreSQL18 materializa constraints NOT NULL
separadas. Conferir as propriedades/inventário esperados dessa versão sem count
global fixo herdado de PostgreSQL anterior e sem descartar constraints desconhecidas.
A falha histórica desse tipo no installer permanece evidência distinta, não repetida
nem promovida por esta proposta.

Migrations novas, binding final e novos receipts commitam na mesma transação;
qualquer erro exige rollback completo. Falha de verifier read-only pós-commit é STOP,
não rollback retroativo. Nenhum receipt sozinho prova readiness ou contexto/provider.

## Checklist da projeção alvo e liberação futura

1. Publicação final exata 1.6.1, provenance/tag/source/tarballs/exports/d.ts instalados
   e grupo fixo revalidados; source-only 7f6952ea/a04f2d55 não preenchem esses campos.
2. Renderer ordered público, determinístico e offline; source path/raw hash e bound
   sql/hash separados para cada arquivo, ordem original incluindo guards/backfills/
   grants, binding exato e reader null. Reter bytes, não dividir objectsSql fresh.
3. Prefixo raw1–8 inalterado, projeção rotulada não executada no sujeito, equivalência
   baseline por rehearsals/review e current prior verifier ou custódia independente
   com checks de dados/roles. Produção permanece sem sujeito identificado/admitido.
4. Draft SQL acima revisado como candidato exato com schema/ACL/assertions/sensores
   positivos/negativos; nenhuma criação live antes da emenda F1/F3/F2 de execução.
5. Suffix somente, owner locks/revalidação/atomicidade, no-op replay sem backfill,
   last-state snapshots e novo latest verifier READ ONLY; falha mantém STOP.
6. Política OD-C2-005, revisão independente, gates e publicação consumidor separados.
   Sem stage/commit/push/PR/merge, pin, cutover ou import por este documento.
