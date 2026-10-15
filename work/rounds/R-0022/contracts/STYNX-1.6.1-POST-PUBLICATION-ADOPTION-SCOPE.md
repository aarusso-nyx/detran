# STYNX 1.6.1 — escopo preparado para adoção após publicação

**Architect / F1, 2026-10-13. PREPARED / EXECUTION HELD.** Esta minuta separada
prepara a próxima emenda de execução de R-0022. Não altera contratos aceitos, não
admite publicação, não permite pin, renderer alvo, testes novos, SQL ou banco agora.
O próximo trabalho autorizado é revisão desta minuta e fechamento do inventário de
paths. A execução condicional abaixo exige emenda concreta sobre os mesmos inputs.

## Autoridade e entrada exata

A autoridade humana permanece o plano aprovado de adoção DETRAN e a instrução de
12/out, turno `01a132b8-f47a-76a3-a358-00c7816dd74f` no chat STYNX
`01a123cf-5329-7942-80a8-59200e78497d`:

> Proceed with the 1.6.1 plan. Fix the offline-sync gaps and evidence collection
> first, then get as many scorecard cells green as practical. No k6 or mutation
> tests. Keep DETRAN adoption moving in parallel.

B17 de `AUTHORIZATION.md`, A7 de `plan.md` e D-160.12/13 continuam limitando a
execução atual a 1.6.0 publicado. Reports, RC, instruções de coordenação e esta
minuta não são nova autoridade de publicação/integração. Sem k6/mutation; ausências
não são PASS. OD-C2-005 mantém um PR final da campanha, sem PR intermediário.
Stage, commit, push, PR, merge, deploy e fechamento permanecem fora desta etapa;
exigem a emenda de integração e todos os checks obrigatórios verdes. Não há novo
budget, waiver, prazo de exceção ou alteração de decisões Owner nesta minuta.

Entrada verificada em `2026-10-13T05:16:50Z`, host local, timezone
`America/Sao_Paulo`, checkout exclusivo
`/Users/aarusso/.codex/worktrees/detran-r22-adoption-160/detran`, origin
`https://github.com/aarusso-nyx/detran.git`, branch
`codex/detran-r22-adoption-160`, HEAD
`9af7682479fd338b0c81bf56548d21b3021cdf76`, tree
`aec680e768de3e852572649bc1af0c6387a93cb8`. Candidato sujo/não commitado; não é
proof governada. Architect escreve somente este arquivo; Engineer faz inventário
read-only; Inspector revisa somente esta minuta e grava novo report de planejamento.
Primary, PR #179, sibling STYNX e arquivos aceitos são somente leitura.

Os cinco entregáveis aceitos em `scratch/r22-adoption-160/` são:

| Arquivo                                | SHA-256                                                            |
| -------------------------------------- | ------------------------------------------------------------------ |
| `checkpoint-report-v4.md`              | `d59b55c1c64a93330192b416f4187fc8af27c76354cf60e648537c6c207710e8` |
| `source-candidate-manifest-v4.json`    | `03cbdbd998e12d88811ac542130a70d751f933630f33abd34e31b3b3fbbdde8c` |
| `checkpoint-evidence-manifest-v4.json` | `523043581d10def10ee78909913c437807a814c4a9b457ff4d02beb267f922bc` |
| `available-test-fixtures-v4.json`      | `b319a5d2322326a4ef2b13b4bb3e30ae90f4442544327aeef3e38255c5181a7f` |
| `adoption-status-v4.json`              | `3e95241b41f78040ac2444aaa748f8deb4ff2e218ff2f5a2f1798170dca67c6c` |

Os 133 arquivos source, 94 evidências e sete fixtures foram revalidados byte a
byte. Source content digest:
`4bd32f93ab2b967483486fda517ae29545872357c0794cbadcef6e234dfcc041`.
Preservar todos, inclusive os manifests históricos; anexar futuras evidências em
novo diretório, sem regenerar v4. F1 aceito:
`STYNX-1.6.0-ADOPTION-ADDENDUM.md` SHA
`647c152f64380b6331fdd0d7cac2faf34de27e9a145f0fce5ba780382e2f50c7`;
draft `STYNX-OFFLINE-FORWARD-CUSTODY-DRAFT.md` SHA
`b5e982ec2e33b7ee96a6180c2c4f892b678f05383ff90161e2d3e3d1574a283d`.
Referências relativas nesta minuta partem deste checkout; os dois F1 ficam neste
mesmo diretório de contracts.

1.6.0 instalado é a versão publicada retida, source
`60e53ad791a4d031ab137a344fd994fe97bcb514`. A referência prospectiva informada é
`788dd0d503e384f6a5b40f1519faab6da3b2d67b`, tree
`2407fd95bd4bb0b51f1e73b67b89345152d9d881`, **UNPUBLISHED**. RC de 15 nodes em
andamento não preenche identidade publicada. Nenhum campo alvo é presumido aqui.

## Evidência preservada e limite de conclusão

v4 conserva resultados independentes delimitados: classifier estático 160,
installer-plan 19, installer live 14, mapping puro 68 e outcome puro 155, todos
PASS nos respectivos candidatos congelados. Os verifiers públicos live anteriores
registraram outbox 1295 e offline 2040 checks PASS. Não foram repetidos nesta etapa.
DTOs inativos não provam transporte, replay durável, rollback de domínio ou cutover.
Custody draft recebeu revisão estática, sem compilação/execução SQL. DB04 recebeu
somente observação prior-state; não é baseline admitido nem sujeito de produção.

Preservar REDs anteriores, inclusive reaplicação indevida de artifact fresh com
rollback das 24 tabelas e caracterização outbox 29 PASS/1 FAIL. Esta minuta não
resolve esse FAIL nem permite mudar assert para acomodar presença de tabela.
Installer postcommit-fault STOP, sinais e `--full` ainda carecem de prova própria.
V03/V04/V07/V08/V10/V13, leitura/raw/history integral, agent/action/event,
reconciliation/import, envelopes/HTTP/ACK/SSE e cutover continuam abertos.

Provider de assinatura/custodian e amostras públicas reais continuam desconhecidos;
OIDs, anchors, floors, revisão/aprovador e challenge aprovados estão ausentes.
Fixtures sintéticas não aprovam trust. Produção não tem sujeito identificado.
Esses bloqueios são separados do rehearsal descartável; nenhum recebe valor padrão.

## Sequência condicional e gate de grupo

### P0 — publicação e admissão determinística, antes de instalação cara

Após publicação real, coletar em novo evidence root identidade imutável da release,
tag/commit/tree, execução/proveniência protegida, lista exata de packages publicados,
registry name/version/tarball/integrity e digests dos bytes. Conferir que a referência
admitida é a publicada final; divergência de source requer novo review, mesmo com
mesmo número SemVer. Reter tarballs sem segredos, conferir integrity antes de extrair,
recusar paths inseguros/symlinks inesperados e validar `package.json`, exports,
d.ts e JS público. Nenhum `latest`, range, alias, pacote local ou private binder.
`gitHead` do registry pode estar ausente: não fabricar campo; exigir ligação
source–tarball pela proveniência protegida verificável ou recusar por falta de
custódia. Roster upstream, 26 nomes diretos consumidores e closure transitiva são
inventários distintos; não presumir que um conte o outro.

Comparar export público de ordered migrations e suas declarações com D-160.12:
binding explícito, ordem, source path/raw SHA, bound SQL/SQL SHA, package e contract
version. Conferir byte a byte raw 0001–0008 contra a retenção publicada 1.6.0 e
inventariar o suffix real. A expectativa de 0009 não autoriza ordinal extra;
qualquer mudança de prefixo/API/ordem bloqueia esta minuta até revisão F1.
Não executar renderer alvo antes da futura emenda admitir pacote/API exatos.

Fechar P0 em duas subetapas para evitar ciclo: P0a admite somente os bytes
publicados/source/tarball/API/closure por inspeção; P0b requer pequena emenda F1 de
projeção pura, com F3 independente, para observar exports públicos renderizadores
em contexto de retenção isolado consumidor. Path proposto da observação:
`scratch/r22-adoption-161/package-admission/project-published-storage.mjs`; sensor
proposto `tools/stynx-storage/tests/published-admission.test.mjs`. Sem DB, pin
uniforme consumidor, writes de artifacts ativos ou bootstrap; binding fixo, inputs
exatos e outputs/digests retidos. Import graph/efeitos devem ser revisados antes de
executar. P0b continua HELD agora. Sua projeção pura e a equivalência outbox
independente alimentam a decisão do grupo; P1/storage execution só vêm depois.

**Gate obrigatório antes de pin consumidor ou execução de storage:** fechar uma decisão técnica F1 de
admissão do grupo e versão efetiva de storage, com mecanismo e assertions testáveis.
Hoje `tools/stynx-version.json` e checker exigem versão uniforme; o installer compara
identidade completa do plano com as duas linhas fresh 1.6.0. Pin uniforme 1.6.1
diverge dessas linhas mesmo quando SQL outbox é idêntico. O draft offline sozinho
não resolve essa divergência. Não selecionar implicitamente modo fresh, regravar
linhas ou tratar metadata divergente como igualdade.

A decisão deve inventariar todo o grupo publicado e escolher explicitamente a
política de versões runtime/storage. Manter outbox 1.6.0 em grupo misto exigiria
emenda explícita da regra uniforme; não é default. Admitir runtime/outbox 1.6.1
exige evidência independente do baseline outbox, catálogo/manifest/SQL/bindings alvo,
compatibilidade e um registro imutável separado de evolução/admissão de versão.
As duas linhas fresh originais continuam 1.6.0. SQL alterado exige contrato de
migração próprio; SQL idêntico não elimina a admissão de nova versão. A emenda
deve definir repeat efetivo e recusa de estado parcial/misturado; o installer atual
não implementa esse mecanismo. Até fechá-lo, P1–P5 permanecem HELD.

### P1 — emenda fechada, sensores e candidato pinado

Antes da primeira mutação F3/F2, reter snapshot completo dos bytes dos 133 arquivos
v4 e dos cinco entregáveis/manifests originais em
`scratch/r22-adoption-161/prior-candidate-v4/`, content-addressed e sem sobrescrita.
Reconstrução vincula base Git exata `9af7682479fd338b0c81bf56548d21b3021cdf76`
retida/verificável mais overlay raw dos 133 paths; archive manifest declara
path/tamanho/SHA e disposition explícita de deleções/symlinks, sem seguir link para
conteúdo externo. Reter este novo pack de planejamento separadamente com seus hashes.
Inspector verifica independentemente cada path/tamanho/SHA contra v4 e a capacidade
de reconstruir todos os arquivos. Manifest de hashes não é arquivo de bytes;
tarballs STYNX não preservam manifests/generated edits do consumidor. A futura
emenda autoriza essa retenção antes de qualquer mudança, inclusive sensores em
paths existentes. Esta minuta não executa a cópia. Evidências v4 continuam retidas
e conferidas pelos 94 digests, sem alteração dos records aceitos.

Architect fecha os paths, schemas, package group, suffix permitido, formatos de
documentos e critérios abaixo; Inspector escreve sensores independentes antes de
Engineer implementar. Só então atualizar pin/manifest por geradores existentes,
lockfile e frozen install. Conferir inventário completo de dependências STYNX,
resolução pelo anchor `backend/app/package.json`, versões/tarballs/exports realmente
instalados e ausência de deep imports. Primeiro determinar suporte a geração
scoped e inventário esperado de outputs; não autorizar implicitamente full generator
por um template de comando. Se apenas geração completa for suportada, registrar
seu escopo/outputs na emenda antes de executá-la. Drift fora do inventário aprovado
é checkpoint, sem edição manual de outputs. Cheap checks: pin positivo e
negativos, frozen install, typecheck, format/lint afetados, geração determinística,
RLS/package byte-binding, plan/admission sem conexão. Só depois iniciar rehearsals.

### P2 — duas referências novas e equivalência do prefixo

Reservar dois bancos novos exclusivos: A recebe artifact fresh público 1.6.0 retido;
B recebe somente prefixo 0001–0008 do renderer público alvo admitido. Nomes,
identidade do cluster, leases e comandos exatos de criação entram na futura emenda
antes de CREATE. Capturar OID/owner reais por SQL imediatamente após criação,
antes de install/seed/target execution, e vincular o sujeito capturado à emenda;
nunca prever/fabricar OID. Esta minuta não declara banco existente/arrendado.
Setup helper-owned auth é igual
em ambos, com `auth.tenants`, owner `postgres`, app `role_app_backend`, reader null.
Nunca executar prefixo em DB04 ou em população a atualizar.

Rodar verifier público **1.6.0** antes e depois das mesmas operações reais dos
serviços **1.6.0** nos dois bancos: sessões restritas A/B, identidade SQL real,
tenant/no-context fences, idempotência, queue/history, conflitos/receipts e sequences.
Não usar owner no request path. Guardar catálogos completos/ACLs, raw snapshots e
reports de todas as rows/invariants, zero FAIL/UNKNOWN. Declarar antes dos testes a
comparação semântica cross-DB de IDs/timestamps gerados, preservando os raw valores;
não apagar diferenças arbitrariamente. Equality de schema vazio é insuficiente.
Comparar o catálogo completo dos packages; inventariar separadamente auth/setup e
ledger consumidor legítimo de A, sem exigir igualdade artificial de bancos inteiros
ou criar receipts fake em B para fazê-los coincidir.
Comparar byte/order/efeitos dos statements separadamente. A equivalência aceita
significa prefixo coberto pelo fresh, nunca oito execuções históricas individuais.

### P3 — sujeito prior-only, baseline e schema de custódia

Escopo futuro mínimo de upgrade: outro banco descartável, instalado pelo artifact
1.6.0 exato e populado por serviços 1.6.0, com duas linhas fresh originais válidas.
Recusar vazio, unreceipted, partial, outros baselines/versões e restore com identidade
não admitida. Fresh target bootstrap e população de produção não estão neste escopo.
DB04/retention v4 continuam evidência prior-only; não relabelar seu record como target
admission. Recapturar o sujeito atual em transação nova REPEATABLE READ READ ONLY:
cluster system identifier/database OID/name/owner, current/session user, RLS/origin,
receipt SQL text com seis dígitos e JSONB lógico original, catálogo vivo e invariantes.
Preservar precisão SQL sem JS Date; expected catalog vem da custódia pública retida,
nunca da própria observação que se pretende aprovar.

Materializar somente após emenda o draft b5e982ec e suas assertions: tabelas separadas
`integration.stynx_offline_baseline_custody` e
`integration.stynx_offline_forward_receipts`, sem alterar
`integration.stynx_storage_installations`. Documento baseline fechado D-160.13;
forward fechado pelo draft, com subject/package/baseline/target/binding/ordinal,
source raw digest, bound SQL digest, predecessor tipado, execution/evidence e
recordSha256. Parsing rejeita duplicados, extras e ausências antes de JSONB; digest
canonical UTF-16 keys/UTF-8 e arrays ordenados, sem substituir por `jsonb::text`.
Conferir toda igualdade column/document e referências detached sem ciclo de digest.

Owner/ACL/RLS assertions abrangem owner real, ENABLE+FORCE, nenhuma policy,
nenhum acesso efetivo app/auditor/PUBLIC, memberships/defaults/columns/functions,
ALWAYS UPDATE/DELETE/TRUNCATE guards e final DDL20 revokes. Catálogo PostgreSQL 18
inclui NOT NULL constraints por versão, sem contagem fixa antiga. INSERT fixo omite
by/at fornecidos, compara RETURNING com CURRENT_USER/transaction_timestamp reais
da mesma transação e preserva texto UTC microssegundos. DEFAULT sozinho não é prova.
Baseline anchor prospectivo cobre 1–8; não inserir receipts individuais 1–8.

### P4 — suffix real, locks, rollback e repeat

Emenda deve coordenar todas as entrypoints pela manutenção de sessão existente em
database `postgres`, key `(7007,1600)`, e transação target key `(7007,1)`; nunca
segurar a mesma key em conexões distintas. Preverificadores em novas transações
genuinamente READ ONLY, release do lock em finally e teste concorrente real. Validar
somente DB_HOST/PORT/USER/PASSWORD/NAME explícitos pelo boundary apply; não aceitar
SQL, path, binding ou bypass genérico. Sem token/URL/password em evidência.

Na única transação owner, revalidar sujeito/custódia/current state, executar somente
suffix faltante admitido em ordem original via API pública bound; persistir baseline
e receipts reais atomicamente. Não replay fresh objects, platform runner ou raw SQL
rewrites. Primeiro receipt ordinal 9 aponta baseline prefix8; posteriores exigem
predecessor forward contíguo no mesmo chain/binding/publication, sem fork/reset.
Admissão fechada recusa 10 se só 9 publicado/admitido, mesmo que DDL represente 10.
Falha em qualquer statement/receipt/assertion reverte grupo inteiro; snapshots
exatos de história, receipts originais, sequences e catálogo anterior demonstram
rollback. Aplicar roleBindings separadamente e restaurar contexto row_security e
search_path fora dos bytes canônicos. Repeat usa chain exato e bindings/verifier,
sem repetir migrations ou produzir nova história. Alteração do plano recusa.
Não presumir rollback de `nextval`/`setval`: auditar o suffix publicado para efeitos
de sequence e provar ausência de mudança nas sequences históricas. Se o plano
produzir efeito não transacional, parar e exigir emenda de semântica/disposition;
não declarar atomicidade que PostgreSQL não fornece.
O suffix admitido e fixtures de falha não podem consumir/resetar sequences
existentes; auditar também triggers. Drift é STOP, sem `setval` compensatório.

Na primeira escrita deste escopo, DDL novo de custódia, baseline recém-admitido,
registro de admissão do grupo alvo, suffix, receipts e bindings finais pertencem
à mesma transação atômica. Não instalar schema/baseline em uma fase anterior por
conveniência. Qualquer alternativa exigiria decisão explícita na emenda sobre
disposition e snapshots; esta minuta não afirma rollback de catálogo anterior à
entrada real da transação. Baseline/schema já existentes e admitidos em outro
estado válido são fatos de entrada preservados no repeat. Snapshots de rollback
sempre vinculam a fase/estado efetivo de entrada, não um banco vazio presumido.

A seleção de estado deve ser fechada: fresh1.6.0 válido sem baseline aceito exige
prova/admissão do baseline; fresh1.6.0 com baseline aceito e sem forward executa só
suffix admitido; fresh1.6.0 original com forward9 íntegro é repeat bindings-only.
Unknown/mixed/empty recusa. No primeiro estado, verifier prior 1.6.0 prova o baseline;
após suffix, usar latest publicado pre/post no repeat, nunca exigir catálogo prior
que a migration alterou legitimamente. Em todos, conferir fresh identities originais
e cadeia de custódia. Nenhum estado seleciona fresh1.6.1 contra rows fresh1.6.0.

Reter bytes canônicos externos dos documentos antes do COMMIT com disposition
candidate; depois registrar observação detached de commit ou rollback. Filesystem
write não é atômico com COMMIT SQL. Em falha de transporte/resultado desconhecido,
manter STOP e reler estado vivo sob locks antes de decidir; não inferir receipt nem
reexecutar prefixo. O vínculo final compara documento persistido, bytes retidos e
receipt SQL com identidade exata, sem fabricar observação de commit.

### P5 — pós-commit e aceitação delimitada

Após commit, verifier público alvo em **nova READ ONLY**, todos os tenants/checks,
supported true e nenhum FAIL/UNKNOWN. Snapshot prova originais fresh intactos e
história anterior preservada; receipt novo prova somente suffix executado. Injetar
falha pós-commit real do latest verifier/state em sujeito negativo descartável:
resultado STOP explícito, não rollback fictício/sucesso; conservar
evidência committed e exigir avaliação read-only antes de qualquer repeat. Cobrir
sinais/liberação de lock e admissão de `--full` sem destruir sujeito; caminho destrutivo
só em lease descartável específico. Se ficar pending, não promovê-lo a PASS.
Não substituir esse experimento por mock verifier ou hook de produção. Se não
houver fault isolável concretamente autorizado, manter a prova STOP pendente.

## Paths e responsabilidades para a futura emenda

| Lane                      | Paths fechados de partida e limite                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| F1 Architect              | Este arquivo agora. Emenda de execução nova e ADR específico futuro; não modificar F1 aceito para ratificar retroativamente. Fechar mecanismo do grupo/outbox antes de delegar execução.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| F2 Engineer, condicional  | `tools/stynx-version.json`, `tools/check-stynx-pin.ts`, `tools/blueprints/generate.mjs`, `package.json`, `pnpm-lock.yaml` e package manifests enumerados no inventário aprovado; outputs do generator somente. Storage: `tools/generate-stynx-storage.mjs`, `tools/stynx-storage-install.mjs`, `tools/rls-ddl-coverage.mjs`, `tools/check-rls-ddl.ts`, `backend/database/apply.sh`, `backend/database/stynx-storage.json`, os dois `19-stynx-{outbox,offline}.sql`. Novo `backend/database/ddl/19-stynx-offline-custody.sql` é path proposto, ainda fora do inventory. Ledger fresh existente somente assertion, sem reescrita de rows. Mudança adicional de composição/API exige lista própria. |
| F3 Inspector, condicional | `tools/stynx-pin/tests/check.test.mjs`, `tools/stynx-storage/tests/install.test.mjs`, `tools/rls-ddl/tests/check.test.mjs`; novos `backend/app/tests/integration/r22-stynx-161-forward-custody.integration.spec.ts` e `backend/app/tests/integration/r22-stynx-161-reference-equivalence.integration.spec.ts`, coletados pelo config atual `tests/integration/**/*.integration.spec.ts`. Novo evidence root `scratch/r22-adoption-161/`. Não remover/relaxar testes existentes.                                                                                                                                                                                                                  |
| Auditor                   | Revisão independente exata dos documentos/candidato/evidências, sem autoria F2/F3 nem ratificação por report do Engineer.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |

Inventário read-only do Engineer:
`scratch/r22-adoption-160/post-publication-scope/engineer-inventory.md`, SHA
`d97f28e087ce756fe09e74c18abe8fe1e06881d9ce81e8495a85435602910332`.
Lista exata de 59 manifests, 151 referências diretas e 26 nomes de packages, todos
1.6.0; o release group/transitive closure pode ser maior. Essa lista/hash é a base
da emenda, não um glob. Generator e RLS loader hoje recusam versão diferente de
1.6.0; plano CLI somente imprime JSON e não oferece modo forward.

Paths novos propostos para fechar na emenda são
`tools/stynx-storage-forward.mjs` (admissão/canonical/plan de suffix, sem CLI SQL
genérica) e `backend/database/stynx-storage-target.json` (projeção alvo separada da
custódia prior). O registro imutável de group/outbox ainda exige decisão de schema,
path e assertions no gate P0; não inventar que o draft offline o contém. Os bytes
originais generated1.6.0 permanecem retidos por v4/retention mesmo se futuros outputs
gerados representarem target; identidade de fresh não passa a apontar output novo.
Os paths propostos não são permissão atual; a emenda incorporará inventário,
manifest/generated disposition e registro do grupo. Sem edição geral por wildcard.
Helpers inativos mapping/outcome aceitos permanecem intactos nesta preparação.

## Matriz mínima de prova futura

| Área           | Positivo obrigatório                                                                                         | Negativos/refusas obrigatórios                                                                                                                                                      |
| -------------- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Publicação/pin | tarball/integrity/exports/source e grupo exatos; frozen install e geração determinística                     | unpublished/source-only, registry drift, ranges/aliases/deep imports, wrong version/export/source/SQL/raw digest, extra/ausente package, prefix reorder/change                      |
| Equivalência   | referências A/B com verifier prior e operações restritas antes/depois; raw e semantic comparisons declarados | catálogo esperado autocriado da observação, diferenças omitidas, owner request path, cross/no tenant, receipt/sequence/history divergente                                           |
| Custódia       | documento/columns/digests/subject exatos; anchor8 separado; timestamp real                                   | duplicate/extra/missing JSON, canonical/hash drift, stale supplied timestamp, placeholder, wrong binding/cluster/OID/publication/fresh row, unreceipted/partial/empty/prior unknown |
| Chain/schema   | ordinal9 baseline tipado; constraints/ACL/RLS/ALWAYS completos PG18                                          | ambos/nenhum predecessor e NULL branches, gap/fork/reset/duplicate, cross-chain/publication, ordinal10 não admitido, UPDATE/DELETE/TRUNCATE, trigger/policy/ACL/catalog tamper      |
| Execução       | suffix-only atomically receipted, repeat preserva bytes/história, concorrência serializada                   | falha real no suffix/receipt rollback, digest drift após plano, lock race/deadlock, signal, postcommit failure STOP, `--full` não admitido                                          |
| Gate integrado | pin/blueprints/contracts/RLS/type/lint/tests obrigatórios no candidato exato                                 | qualquer RED/UNKNOWN, skip/coleção vazia, old29/1 oculto, API behavior/cutover presumido por storage PASS                                                                           |

Adicionar vetores explícitos de group admission: positivo completo/no-op outbox
com evidência independente e repeat efetivo; negativos wrong-outbox, digest alvo
divergente e grupo parcial, sem escolher replay fresh. Canonicalização tem vetores
positivos/negativos próprios: UTF-16 versus locale/codepoint, ordem de arrays,
duplicados nested com chaves escaped equivalentes, Unicode inválido, input cuja
leitura perderia precisão e omissão somente de `recordSha256` raiz. Não normalizar
fatos originais nem descartar hashes nested para obter igualdade.

Negativos live de ACL/trigger/RLS são locais ao banco e transacionais. Roles,
memberships e defaults de role são globais ao cluster: não alterar `postgres`,
`role_app_backend` ou logins existentes para simular escalada em lease de banco.
Usar SET ROLE local para mismatch, sensores offline/catalog e, se necessário,
cluster descartável isolado autorizado separadamente; essa prova não é inventada.

## Entry check e próxima ação autorizada

Antes de retomar, conferir `pwd`, origin, branch/HEAD/tree, AGENTS/Constitution,
AUTHORIZATION/plan e owners concorrentes; revalidar 133/94/7 entradas e os cinco
hashes v4 acima. Arquivo novo não entra retroativamente em v4. Revalidar também
os dois F1 SHA e a publicação ainda HELD; parar com source/remote/candidate drift
até reconciliar identidade. Não rodar pin, renderer alvo, testes ou SQL para fazer
entry check desta etapa.

**Próxima ação executável agora:** Inspector revisa este arquivo exato e publica
novo report de planejamento; Engineer conclui inventário read-only; Architect
fecha findings somente nesta minuta. Após publicação real, o primeiro passo
condicional é P0 e decisão explícita de group/outbox, seguido de emenda de execução
com pacote, paths, leases e sensores concretos. Até lá, baseline/forward admission,
produção, provider trust, full migration e integração permanecem HELD.
