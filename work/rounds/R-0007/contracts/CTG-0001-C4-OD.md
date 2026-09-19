# CTG-0001 C4 — adendo proposto após decisões do Owner

Papel: Architect (Art. 6), gpt-6-astra/medium. Data: 2026-09-16.
Status V3: **correção documental TASK-0023, continuação 2/2; revisão independente pendente**. Worktree exclusivo:
`/Volumes/Thiamat II/stech/detran-worktrees/rait-backend`.

## Precedência V3 e histórico

A seção final “Fechamento V3” é a referência vigente desta correção autorizada
pelo Owner. Substitui instruções operacionais conflitantes V1/V2 nestes quatro
documentos: CTG-0001-C4.md, CTG-0001-C4-OD.md,
CTG-0001-C4-BINDINGS.md e CTG-0001-C4-OD-PLAN.md. As seções históricas abaixo
preservam a análise e os resultados anteriores, sem constituir uma allowlist
alternativa. Permanecem as decisões Owner ADR-0024/0025 e todos os requisitos
não conflitantes dos 14 comandos. A primeira execução completed_incomplete não
vira PASS; esta é a única continuação autorizada, não um reinício de TASK-0023.
V3 fecha o desenho documental, sem afirmar implementação, aplicação SQL ou PASS
de runtime. Após esta correção, todo trabalho dependente exige delta-review
independente com JSON válido PASS e hashes exatos do candidato congelado.

## Emenda Owner posterior — autoridade vigente antes do despacho

ADR-0024/OD-016 agora fecham a política de comprovação: idade pela data de
nascimento em documento/CNH; PCD por documento anexado e validado pelo
`rait-secretary` no protocolo; ausência de comprovação é `none` por default
ao concluir o protocolo. `null` é não apurado pré-protocolo e não entra em
`claim-next`. Provas apresentadas ou invalidadas depois do protocolo não
alteram a qualificação do ordenamento, que é definitiva nesse ato. A
autorização histórica ao `rait-coordinator` de revogar/corrigir essa
qualificação pós-protocolo está suspensa sob a política atual, não eliminada
do desenho. O Owner atestou validação jurídica
dessas novas decisões e, em complemento posterior, da igualdade de nível
PCD = 80+. Não se presume parecer consultado pelo Architect nem quitação
de outros gates LEGAL.

Complemento vigente do Owner: preservar o mecanismo auditável de
correção/revogação excepcional pelo `rait-coordinator` para eventual alteração
por portaria. A política atual continua vedando seu uso para requalificar o
ordenamento após o protocolo; capacidade técnica não equivale a permissão
operacional. Qualquer ativação futura requer norma e política autorizada,
versionada e auditável. Para idade, a referência é o **ato de qualificação**,
inclusive no fluxo postal; a postagem ECT mantém papel cronológico e de
tempestividade, não define a idade.

As seções candidatas abaixo sobre outcome `unassessed`/`none`, revisões,
`rationale` para `none`, invalidação e backfill foram escritas antes destas
emendas. São material de análise, **não contrato executável**: reconciliar o
modelo com a definitividade vigente e com a capacidade futura preservada,
sem abrir uso presente, antes de blueprint, schema, fixtures positivas ou RED.
Não inferir `none` de `null` legado sem inventário e regra de migração revisada.
O marco da idade postal foi decidido; resta vinculá-lo à especificação e sensores.

## Autoridade e histórico preservado

O Owner autorizou registrar ADR-0024/0025 e preparar o ciclo corretivo delimitado.
Essa autorização não constitui dispatch adicional, execução RED/GREEN, commit,
PR ou merge. As decisões são fontes vinculantes; sua implementação ainda exige
contrato operacional reconciliado, revisão independente válida e autorização
dos limites adicionais. Este documento é proposta de adendo, não substituição
silenciosa do contrato C4 vigente ou dos prompts históricos.

TASK-0023 consumiu 1/1 e terminou `completed_incomplete` (budget registra
`completed-blocked`). O delta-review e seu único retry técnico terminaram com
JSON inválido, sem veredito válido. A reserva remanescente não autoriza retries.
TASK-0020/0021 conservam 3/4; a proposta usa somente a iteração 4 ainda pendente.
Não existe iteração 5 nem reinício de contagem por novo ID. Nenhum contador,
status executável ou budget é modificado nesta preparação.

## Referência fechada e lacunas técnicas

ADR-0024 fecha a política: risco vigente primeiro; PCD = 80+ > 60+ > ausência de
prioridade comprovada; desempate `protocolled_at ASC`, `id ASC`; preservar todas
as bases comprovadas e usar o maior nível. `null` significa não apurado e exclui
do claim-next até saneamento. A exigência jurídica anterior para default/
definitividade e igualdade PCD = 80+ foi encerrada por atestações específicas
do Owner; isso não substitui fechamento técnico nem outros gates LEGAL.

O desenho de persistência ainda precisa fechar valores canônicos, estado apurado
sem prioridade, evidências de cada base, coexistência de bases, origem e validação
dos dados e migração reversível/segura. DDL34 tem somente `legal_priority
varchar(30)` nullable: não presumir que esse campo preserve `priority_basis` ou
múltiplas provas. O parâmetro `rait.priority.legal_bases` na seed é JSONB contendo
uma string placeholder, não catálogo tipado. Exigir contrato de dados explícito
antes de schema/SQL/testes; não converter automaticamente nulos em sem prioridade,
não fabricar provas nem reinterpretar strings históricas sem mapeamento verificável.
Dados não reconhecidos continuam não apurados e inelegíveis, com saneamento
rastreável. A proposta técnica abaixo delimita representação e tokens candidatos;
não os promove a fonte de negócio nem autoriza migração.

### Modelo de persistência candidato e limites verificados

Inspeção read-only: `tools/blueprints/generate.mjs:98–123` suporta campos, CHECKs,
FKs compostas e índices únicos/parciais; `:187–204` gera CRUD se `operations` não
for explicitamente `[]`; `:340–391` gera cinco arquivos por entidade, índice,
módulo, DDL, policies RLS e triggers de tenant. Cada alteração do BP muda o hash
nos headers de todos os seus artefatos. O gerador não gera migration ALTER de
tabela existente, constraint trigger de consistência entre linhas, nem proteção
append-only: os repositórios gerados possuem update/remove e o DDL concede CRUD.
`backend/database/apply.sh` reaplica DDLs; CREATE TABLE IF NOT EXISTS não migra
uma tabela existente. Nenhum desses comandos foi executado nesta preparação.

Proposta relacional preferida para revisão: **duas novas relações internas**,
sem CRUD HTTP, após `rait_document` na ordem das entidades do BP case:

| Relação/campo                           | Tipo/constraint candidata                                         | Finalidade                                                                      |
| --------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `inf.rait_priority_assessment.id`       | uuid PK                                                           | Identidade da apuração                                                          |
| `tenant_id`, `case_id`                  | uuid NOT NULL; FK composta para rait_case                         | Escopo do caso                                                                  |
| `revision`                              | integer NOT NULL CHECK > 0; UNIQUE (tenant_id, case_id, revision) | Revisão serializada sob lock do caso                                            |
| `outcome`                               | varchar(20) NOT NULL CHECK IN ('unassessed','none','priority')    | Estado de apuração, inclusive invalidação explícita                             |
| `assessed_at`, `assessed_by`            | timestamptz, uuid NOT NULL                                        | Instante oficial e ator autenticado                                             |
| `policy_version`                        | integer NOT NULL CHECK > 0                                        | Versão do parâmetro usado                                                       |
| `rationale`                             | text NOT NULL CHECK btrim(rationale) <> ''                        | Fundamentação da apuração, especialmente resultado none                         |
| `inf.rait_priority_basis.id`            | uuid PK                                                           | Registro de uma base e sua prova                                                |
| `tenant_id`, `case_id`, `assessment_id` | uuid NOT NULL; FK composta para assessment                        | Prova pertence à mesma apuração/caso/tenant                                     |
| `basis_code`                            | varchar(30) NOT NULL                                              | Candidatos pcd, age_80_plus, age_60_plus; validação contra parâmetro versionado |
| `document_id`                           | uuid NOT NULL; FK composta para rait_document                     | Referência à prova existente do mesmo caso/tenant                               |
| `verified_at`, `verified_by`            | timestamptz, uuid NOT NULL                                        | Verificação identificável, sem fabricar atestado                                |

O gerador adiciona created_at/updated_at. Índices únicos candidatos necessários:
`rait_case (tenant_id,id)`, `rait_document (tenant_id,case_id,id)`, assessment
`(tenant_id,case_id,id)` e basis `(tenant_id,assessment_id,basis_code,document_id)`.
FK assessment `(tenant_id,case_id)` referencia rait_case `(tenant_id,id)`;
FK basis `(tenant_id,case_id,assessment_id)` referencia assessment
`(tenant_id,case_id,id)`; FK basis `(tenant_id,case_id,document_id)` referencia
rait_document `(tenant_id,case_id,id)`. Os índices podem preceder as novas tabelas
na ordem de geração. FKs atuais fora desse recorte não são silenciosamente alteradas.
Uma base pode ter várias provas; duas bases podem apontar o mesmo documento.
Não há UNIQUE apenas por base que descarte provas, nem apagamento das revisões
anteriores como política de saneamento.

Proposta de parâmetro tipado (representação técnica de ADR-0024): objeto com
`schemaVersion: 1`, `basisRanks: {pcd: 2, age_80_plus: 2, age_60_plus: 1}` e
`noneRank: 0`. Os números codificam somente ordem relativa, não novo peso de
negócio. Versão da linha ops.parameter identifica a configuração auditada.
Schema valida forma exata e precedência aprovada; string placeholder, valores
ausentes, versão desconhecida ou ordem divergente bloqueiam. Chaves não autorizam
novas condições de elegibilidade. Não criar tabelas de catálogo paralelas.

`legal_priority` existente permanece **projeção**, não fonte das provas: tokens
candidatos `level_2`, `level_1`, `none`, ou NULL para não apurado. Rank usa parâmetro
validado e MAX das bases da revisão corrente; não ordenação lexical. Revisão
corrente é a maior revision sob o mesmo tenant/caso; falta de apuração ou outcome
unassessed implica NULL/inelegibilidade. outcome none exige zero bases e apuração
explícita motivada; outcome priority exige ao menos uma base verificada. A projeção
deve coincidir com a revisão corrente, e inconsistência bloqueia claim-next; null
nunca é promovido automaticamente. Essas regras entre linhas não cabem em CHECK
PostgreSQL simples: fechar enforcement transacional e proteção contra alterações
diretas antes de afirmar integridade. O modelo não depende de FK circular no caso.

Apuração, provas, projeção, versão do caso e auditoria existente devem mudar numa
única transação withTenantContext/role_app_backend, com lock do caso, idempotência
e rollback. Auditoria guarda identidades das revisões/bases e versão de política;
conteúdo clínico/documental não vai a eventos/outbox. Histórico de apuração não
substitui audit.events nem autoriza um novo tipo de evento ou grant.

**STOP PERSISTENCE-AUTHORITY (política fechada; binding técnico aberto):**
o `rait-secretary` valida a prova no protocolo; idade usa data de nascimento
de documento/CNH, PCD exige documento anexado e validado, e sem prova é `none`
por default. Não há prova nova, invalidação ou requalificação posterior para
ordenamento sob a política atual. O mecanismo de revisão pelo coordenador
permanece como capacidade condicionada a futura portaria/política versionada.
Faltam comando/boundary transacional, identidade da prova e bloqueio de uso
posterior sob a política atual, inclusive por CRUD genérico. A opção document_id obrigatório
é candidata, não exigência legal inventada; confirmar se toda prova admitida
pode ser materializada em rait_document. Sem isso, não autorizar writer,
novo endpoint/grant, fixture positiva ou backfill factual.

**STOP PERSISTENCE-ENFORCEMENT:** o gerador não oferece proteção append-only ou
constraint trigger. `operations: []` fecha HTTP, mas não os métodos update/delete
dos repositories nem o grant SQL. Deve-se definir enforcement revisado para
histórico/projeção/bases sob todos os caminhos de escrita antes de implementação;
nenhuma edição manual no DDL gerado ou enfraquecimento de integridade é permitida.

**STOP UPGRADE-PATH:** adicionar índices/constraints na definição CREATE existente
não migra dados/tabelas já criados. Falta delimitar uma via oficial de migration
incremental, seus paths, autoria e teste de upgrade. Não editar gerador/apply.sh
nem presumir reset/full como migração. Banco novo não prova upgrade seguro.

Backfill candidato: inventário read-only por tenant dos valores históricos e
documentos/provas existentes; snapshot verificável dos dados; mapping revisado
somente de fatos comprovados; execução idempotente auditada em transação por caso.
Nulos permanecem não apurados; valores históricos sem prova não são convertidos em
none ou em prioridade verificada. Preservar valor original no inventário de migração
restrito antes de invalidar projeção ambígua; política de retenção/local de arquivo
deve ser delimitada. Sem evidência suficiente, quarentena/saneamento, não inferência.
Provar upgrade em cópia isolada e recuperação sem apagar histórico legítimo.

Impacto candidato: 88 → **90 relações tenant**, rait-case 15 → **17**, adições
nominais `inf.rait_priority_assessment` e `inf.rait_priority_basis`. TASK-0025 deve
receber adendo revisado para provar RLS/FORCE/policies/tenant triggers nas 90,
FKs negativas cross-tenant/cross-case e ausência de CRUD HTTP para as duas novas.
O atual 88 permanece vigente até adoção/revisão explícita do modelo.

ADR-0025 substitui expressamente a restrição anterior de cinco providers por seis.
Proposta de binding técnico a fechar/revisar: classe `RaitOperationClock` no novo
arquivo `rait-operation-clock.ts`, registrada como sexto handwrittenProvider pelo
BP e injetada explicitamente em `RaitDeadlineEngineFactory`. O nome é proposta
de implementação, não decisão de negócio. Preservar a porta Clock oficial de
`@detran/inf-deadlines`, sem FixedClock de testes em produção.

Um instante é capturado por operação; dele deriva o dia civil no timezone IANA
do tenant ativo em `auth.tenants`, lido na mesma transação. Factory, motor,
resolve-pending/decide/expire e demais consumidores temporais do contrato usam o
mesmo snapshot. Não chamar independentemente now/today de relógio mutável em cada
consumidor; não usar timezone ambiente/default silencioso. Ausência do provider,
snapshot inválido ou timezone ausente/vazio/inválido falha antes de escrita.
Preservar codec DATE e fronteira `due_on < hoje`, extensão e timer atual de C4.

## Sequência proposta e separação de papéis

1. Architect Astra/medium transcreve ADR-0024 na RN-RAIT-141 ainda draft e fecha
   especificação do parâmetro/persistência/backfill. Status draft permanece;
   não promove fonte legal nem escreve seed ou código. Campo/tabela adicional
   exige desenho explícito e revisão da população gerada antes de implementação.
2. Após autorização explícita de dispatch e aumento de teto de 1 para 2,
   TASK-0023 executa uma correção Architect Astra/medium: apêndice de reconciliação,
   matriz dos 14 comandos, vocabulário, referências, seis providers e allowlists.
   Preserve o resultado bloqueado anterior como histórico, sem reescrevê-lo em PASS.
3. Uma nova rodada independente de delta-review, limite proposto 1, valida
   contrato/prompts/allowlists concretos e hashes; sem retry adicional implícito.
   JSON inválido, REVIEW ou FAIL não libera execução dependente.
4. Architect de blueprint prepara fonte do sexto provider e modelo de dados
   previamente fechado; outputs somente pela geração oficial. Nenhuma edição
   manual de módulo/DDL/DTO/contrato gerado. Mudança material após revisão exige
   nova revisão contabilizada antes do uso.
5. TASK-0024 (Architect) e TASK-0025 (Inspector) preservam suas correções estreitas
   e ordem C4. Preflight valida KB, RLS e ambiente dedicado antes do RED.
6. Inspector Sol/high executa TASK-0020 iteração 4: RED contratual real, todos
   os cenários abaixo e regressões C4; congela hashes dos sensores.
7. Engineer Sol/high executa TASK-0021 iteração 4: GREEN apenas em código/seed
   previstos; não altera sensores, referências nem blueprint. Se geração depende
   do novo arquivo provider, Architect regenera/verifica em sessão posterior,
   preservando exatamente a fonte previamente revisada.
8. Architect Astra/medium executa TASK-0022-C4: regeneração/reprodutibilidade e
   gates integrais no mesmo candidato, sem corrigir código/testes/KB. Seguem
   delivery-review independente e gate jurídico. Nenhuma entrega/merge inferida.

## Allowlists propostas (caminhos relativos ao worktree)

Estas são fronteiras para futuros prompts revisados, não permissão atual de escrita.
As allowlists fechadas D1/C4 continuam válidas somente para suas tarefas/papéis;
este delta não abre diretórios por glob.

Architect transcrição e bindings:

- `docs/framework/product/domains/inf/rait/rules/RN-RAIT-141.md` (confirmar draft).
- `docs/framework/arch/parameter-catalogue.md` (somente `rait.priority.legal_bases`).
- `work/rounds/R-0007/contracts/CTG-0001-C4-OD.md` (fechar desenho técnico proposto).
- `work/rounds/R-0007/contracts/CTG-0001-C4.md` (novo apêndice de reconciliação).
- `work/rounds/R-0007/reports/CTG-0001-C4-BINDINGS.md` (adendo preservando histórico).

Architect blueprint, somente após desenho/review:

- `docs/framework/blueprints/BP-INF-RAIT-CASE-001.json` (Clock e persistência aprovada).
- `backend/domains/inf/rait-case/src/rait-case.module.ts` (geração oficial somente).
- `backend/domains/inf/rait-case/src/entities/rait-case.entity.ts` (geração somente).
- `backend/domains/inf/rait-case/src/dto/create-rait-case.dto.ts` (geração somente).
- `backend/database/ddl/34-inf-rait-case.sql` (geração somente).
- `docs/framework/contracts/BP-INF-RAIT-CASE-001.openapi.json` (geração somente).
- `tools/blueprints/generated-files.json` (manifesto oficial somente).

Para o modelo candidato de duas entidades, acrescentar os paths nominais:

- `backend/domains/inf/rait-case/src/entities/rait-priority-assessment.entity.ts`.
- `backend/domains/inf/rait-case/src/dto/create-rait-priority-assessment.dto.ts`.
- `backend/domains/inf/rait-case/src/repositories/rait-priority-assessment.repository.ts`.
- `backend/domains/inf/rait-case/src/services/rait-priority-assessment.service.ts`.
- `backend/domains/inf/rait-case/src/controllers/rait-priority-assessment.controller.ts`.
- `backend/domains/inf/rait-case/src/entities/rait-priority-basis.entity.ts`.
- `backend/domains/inf/rait-case/src/dto/create-rait-priority-basis.dto.ts`.
- `backend/domains/inf/rait-case/src/repositories/rait-priority-basis.repository.ts`.
- `backend/domains/inf/rait-case/src/services/rait-priority-basis.service.ts`.
- `backend/domains/inf/rait-case/src/controllers/rait-priority-basis.controller.ts`.
- `backend/domains/inf/rait-case/src/index.ts`.

Os controllers internos devem resultar sem operações, declarando `operations: []`
explicitamente no BP. Esses paths são exclusivamente gerados; a proteção contra
mutação indevida dos registros ainda está bloqueada conforme STOP acima.

O hash do BP afeta ainda os cinco artefatos de cada uma das 15 entidades atuais.
População finita exata, sem wildcard de diretório: prefixo
`backend/domains/inf/rait-case/src/`, produto cartesiano dos nomes
`rait-case`, `rait-party`, `rait-document`, `rait-pending-content`, `rait-redirect`,
`rait-admissibility`, `rait-deadline`, `rait-inquiry`, `rait-inquiry-document`,
`rait-pending-document`, `rait-withdrawal-attestation`, `rait-draft`,
`rait-decision`, `rait-communication`, `rait-case-event`, com os cinco formatos
`entities/<nome>.entity.ts`, `dto/create-<nome>.dto.ts`,
`repositories/<nome>.repository.ts`, `services/<nome>.service.ts`,
`controllers/<nome>.controller.ts`. São 75 paths existentes, cujas alterações
fora da modelagem aprovada devem limitar-se ao header de proveniência. O manifesto
atual lista também package.json, tsconfig.json, tsconfig.build.json e vitest.config.ts
desse pacote; sem mudança de configuração prevista, seus bytes devem permanecer.
Antes de dispatch, expandir/congelar essa lista e hashes no prompt de geração.

Essa lista é candidata, não garantia de que o desenho caiba nela. Nova entidade,
saída adicional ou migração separada requer lista nominal revisada antes de escrita;
não executar gerador que modifique população não delimitada. Não alterar DDL02,
DDL35, policies/grants ou schema compartilhado para acomodar a mudança.

Engineer, acréscimos estreitos à allowlist exata de TASK-0003-D1/C4:

- `backend/domains/inf/rait-case/src/handwritten/rait-operation-clock.ts` (novo).
- `backend/domains/inf/rait-case/src/handwritten/rait-case-command.service.ts`
  (factory já reside neste arquivo; injeção e snapshot).
- `backend/domains/inf/rait-case/src/handwritten/rait-inquiry-command.service.ts`.
- `backend/database/seed/05-parameters.sql` (somente chave legal_bases e versão;
  conforme especificação revisada, sem sobrescrever configuração real silenciosamente).
- `backend/database/seed/20-fixtures-rait.sql` (apenas dados coerentes com o
  vocabulário/provas aprovados, sem substituir fixtures Inspector ou sensores).

Inspector: allowlist exata de TASK-0002-D1 permanece; delta específico em:

- `backend/domains/inf/rait-case/tests/unit/rait-case-di-c4.spec.ts`.
- `backend/domains/inf/rait-case/tests/unit/rait-case-behavioral-matrix.spec.ts`.
- `backend/domains/inf/rait-case/tests/integration/rait-case-runtime.integration.spec.ts`.
- `backend/domains/inf/rait-case/tests/integration/rait-case-runtime.fixture.ts`.
- `backend/app/tests/e2e/rait-case-commands.e2e.spec.ts`.
- `backend/app/tests/shared/rait-case-command.fixture.ts`.

TASK-0024 permanece restrita a
`docs/framework/product/domains/inf/rait/use-cases/UC-RAIT-017.md`, e TASK-0025 a
`backend/domains/inf/ait/tests/integration/inf-rls.integration.spec.ts`.
As duas novas relações candidatas exigem revisão nominal 88 → 90 e rait-case
15 → 17 antes de TASK-0025; o total não pode ser ajustado automaticamente para
fazer passar. A implementação do sensor atual ainda espera 85: preservar histórico
e provar separadamente as três adições C4 e as duas adições deste modelo.

## Provas obrigatórias e gates

Prioridade: null pré-protocolo excluído mesmo com risco alto; `none` default após
protocolo elegível; documento/CNH suporta faixas etárias e documento PCD exige
validação no ato pela secretaria; idade usa o ato de qualificação, inclusive
postal; provas tardias/invalidadas não requalificam sob a política atual e o
mecanismo preservado não pode contorná-la;
PCD empata com 80+ e desempata por protocolo/id; ambos precedem 60+; 60+ precede
ausência comprovada; risco prevalece entre candidatos elegíveis; multibase conserva
todas as evidências e usa maior nível sem duplicar candidato. Provar saneamento,
dados legados/inválidos, parâmetro placeholder rejeitado, rollback e isolamento.
Integração chama serviços reais e PostgreSQL; SQL de fixture não prova implementação.

Clock: instante único com double que cruza meia-noite entre chamadas, fusos IANA
distintos, codec DATE real, véspera/dia/dia posterior e evento anterior à extensão.
DI positiva resolve grafo Nest real; negativas retiram individualmente os seis:
RaitCaseCommandService, RaitInquiryCommandService, RaitDeadlineEngineFactory,
RaitDocumentTrustVerifier, DocumentTrustHttpAdapter e RaitOperationClock proposto.
Preservar negativas separadas de Database/RequestContext, Clock inválido e timezone.
Provar zero escrita em falhas e hashes sensores intactos após GREEN.

Manter todos os gates C4: Prettier, KB, RLS dedicado, typechecks, sensores D1,
blueprints:check, contracts:check, verify:rls-ddl, verify:lifecycle-vocabulary,
verify:decorators, pnpm check, backend:test:ci, DEVAI doctor e cadeia. Node 24.15.0,
STYNX 1.3.1, banco exclusivo detran_r7_ctg1_a2 e URLs explícitas; confirmar identidades
sem credenciais, role_app_backend, número positivo de testes. Sem skip, fallback,
passWithNoTests, redução de asserções ou mudança de baseline 446. Um escritor por
vez, banco serializado, siblings somente leitura. Falha de infraestrutura não é RED.

## Condições de parada

Modelo de dados, tokens, evidências ou migração não fechados: parar antes de schema
ou sensor positivo que presuma política nova. Fonte/base em movimento, path fora da
allowlist, revisão sem PASS válido, limite esgotado ou sensor alterado por Engineer:
bloquear etapa dependente. A autorização de preparo não consome nem amplia limites.

## Fechamento técnico proposto V2 — preparação de 2026-09-16

Esta seção substitui as propostas e STOPs técnicos acima para **revisão documental**.
Não registra execução de TASK-0023 iteração 2, PASS independente, migração ou
ampliação de budget. O conteúdo anterior é histórico; seus bloqueios de desenho
são respondidos abaixo e seus prompts antigos não são executáveis para este delta.
As escolhas novas de fronteira/infraestrutura são propostas explícitas à revisão.

### Persistência e ato de qualificação

A representação fechada para revisão é: `legal_priority` NULL (não apurado),
`none`, `level_1` ou `level_2`. Não existe ordenação textual. As duas relações
propostas permanecem; assessment tem outcome somente `none|priority`, revision
inteira positiva, case/tenant, assessed_at/by, qualification_on (DATE), timezone
IANA, policy_parameter_id, policy_version, policy_snapshot JSONB, reason nullable
na revisão 1 e obrigatório nas posteriores. Não se grava assessment fictício
`unassessed`: ausência de assessment conserva NULL. A política corrente fixa
revision=1; o modelo mantém revisions posteriores sem permitir seu uso hoje.

Basis preserva todas as bases e provas, com case/tenant/assessment, basis_code
`pcd|age_60_plus|age_80_plus`, verified_at/by, source_kind
`attached_document|presented_document|presented_cnh`, source_ref não vazio,
document_id nullable, birth_date DATE nullable, evidence_hash nullable.
Para PCD exige source_kind=attached_document, document_id e hash verificável do
anexo; documento do mesmo caso/tenant validado pela secretaria. Para idade exige
birth_date válida, source_ref identificável e atestação da secretaria sobre
documento/CNH efetivamente apresentado; anexo é facultativo, nunca exigência nova
de upload. Quando document_id existe, FK composta obriga mesmo caso/tenant.
source_ref é referência restrita da prova/atestação, não texto clínico em eventos.
Ausência de prova produz none sem prova negativa e sem justificativa obrigatória.
Assessed_by/verified_by vêm do RequestContext autenticado, nunca do corpo.

Preservar índices/FKs compostas propostos acima. Para unicidade de prova usar
(tenant_id,assessment_id,basis_code,source_kind,source_ref); não usar document_id
nullable como identidade. Idade é anos civis completos na qualification_on derivada
do snapshot Clock no fuso do tenant; nascimento futuro/inválido rejeita. A faixa
60+ é atendida no aniversário de 60 e 80+ no de 80; preservar ambas quando
comprovadas e usar MAX. Não recalcular com envelhecimento ou data de postagem.
Assessment conserva snapshot de política e marco temporal mesmo se parâmetro
mudar depois. Claims usam a qualificação histórica, não reclassificam casos.

Boundary definido: adaptar o **POST existente /v1/inf/rait/cases** para o controller
handwritten com `@Action('protocol')` já autorizado exclusivamente a
rait-secretary em policy.ts. Retirar `create` das operations do case no blueprint,
evitando rota duplicada; manter leituras/update/delete existentes sujeitos às
proteções abaixo. O contrato do POST passa a criar caso, referências de documentos,
qualificação, bases, projeção, ledger e audit na **mesma transação**. Não há endpoint
separado de qualificação nem estado intermediário persistido para casos novos.
A mudança do binding do POST e de seu corpo deve constar no OpenAPI de comandos
novo, revisão e sensores de compatibilidade; é expansão proposta do escopo C4.

Implementar método `protocol` no RaitCaseCommandService, separado da rotina que
exige caso já existente. Corpo: campos de intake já existentes, documentos do ato
e provas discriminadas pela source_kind; tenant, actor, rank, version,
assessment timestamps e policy não são aceitos do cliente. Documento/CNH
apresentado é atestado pela secretaria; PCD exige anexo validado no mesmo ato.
Não aceitar data de qualificação retroativa; protocolled_at postal conserva ECT.
Idempotency-Key obrigatório; criação não exige If-Match de recurso inexistente;
resposta mantém envelope de comando e ETag da versão inicial. Replay usa ledger
existente; chave/corpo divergente falha antes de escrita. Os 14 comandos C4
continuam preservados; protocol é binding adicional de intake, não renumeração
dos testes já devidos. Não inventar evento SSE: usar audit de protocolo e somente
eventos já previstos no contrato original para criação, quando existentes.

### Política versionada e proteção no banco

Formato exato de `rait.priority.legal_bases`:
`{"schemaVersion":1,"policyCode":"ADR-0024-2026-09-16","basisRanks":{"pcd":2,"age_80_plus":2,"age_60_plus":1},"noneRank":0,"postProtocolRevision":"forbidden"}`.
Identidade do parâmetro + versão + snapshot são persistidos em assessment; copiar
somente configuração vigente aplicável ao tenant/órgão, rejeitar ambiguidade,
placeholder string, status/source_pending inválidos e formato extra/desconhecido.
O catálogo continua fonte da seed: alterar saída gerada apenas por
tools/parameters/generate-seed.mjs, com os artefatos derivados abaixo.
Configuração de agency-admin não libera revisão: implementação V1 aceita
exatamente policyCode acima e `forbidden`. Um `allowed` inserido no parâmetro
falha fechado. Futuro uso exige portaria e política autorizada, novo contrato
versionado/revisado e implementação explícita de seu validador.

Manter método interno `revisePriority`, recebendo expectedRevision, reason e
novas bases, verificando coordenador/tenant/caso, política reconhecida e lock.
Na versão atual retorna FORBIDDEN_ACTION **antes de qualquer mutação**, inclusive
coordenador; não expor endpoint/grant novo. Reserva arquitetural não é stub de
sucesso: serialização, modelo append-only e assinatura do método permanecem, mas
não existe caminho operacional positivo V1. Teste unitário negativo de chamada
direta, integração de tentativa SQL e teste de parâmetro adulterado são obrigatórios.

Proteção SQL é explícita, não depende de operations=[] nem de GUC de bypass:
novo role técnico `role_rait_priority_writer`, NOLOGIN/NOBYPASSRLS, não proprietário
das tabelas, sem membership concedida ao app; RLS/FORCE nele, sem owner-context.
Função estreita `inf.rait_record_initial_priority` SECURITY DEFINER pertencente a
esse role, search_path fixo e nomes qualificados, EXECUTE revogado de PUBLIC,
concedido a role_app_backend; valida tenant atual e membership secretaria do
actorId fornecido pela aplicação,
caso novo desta transação, versão de política exata, provas, derivação etária,
unicidade revision=1 e scope, e grava assessment/bases/projeção. Sem SQL dinâmico,
flags fornecidas pelo chamador ou overload de revisão habilitado. O app continua
usando role_app_backend; função recebe evidências, nunca rank/outcome arbitrário.
Fronteira de confiança: PolicyGuard/RequestContext autenticam o ator na aplicação;
o contexto tenant do banco usa GUC e não fornece uma identidade autenticada de
ator independente. A função pode verificar membership do actorId recebido, mas
não comprovar que uma sessão SQL com credencial app representa esse usuário.
Não introduzir GUC “trusted actor” fictício. Um portador da credencial app pode
invocar a função com ID de secretário válido e fatos fabricados; restringir a
função protege invariantes/histórico, não autentica a origem desses fatos.
Sensores HTTP devem negar spoofing no payload; SQL testa ausência/membership
inválida/tenant cruzado e invariantes, sem declarar resistência a impersonação
de ator por credencial app comprometida. Esta limitação é parte explícita da
revisão: se for exigida autenticação independente no banco, o desenho deve ser
REVIEW/FAIL até protocolo de credenciais confiáveis revisado, fora deste delta.
Assessment/basis não admitem UPDATE/DELETE nem pelo writer; triggers rejeitam
mutação e TRUNCATE, e app tem apenas SELECT nas duas. INSERT é só writer.
Índice único da revision e lock do caso impedem duas apurações concorrentes.

No case, trigger impede INSERT com projeção fornecida e UPDATE de legal_priority
por role diferente do writer; constraint trigger diferido garante em COMMIT
equivalência case/assessment/MAX bases e exatamente uma apuração em todo INSERT
novo. A identificação de caso novo é o evento INSERT da transação, não comparação
de timestamps nem campo preenchível pelo cliente. FK RESTRICT conserva case e
documentos referenciados; trigger protege identidade/hash da prova anexada e
assessment. Alterações posteriores em documento não requalificam o caso.
Case legado sem assessment fica inelegível; sua atualização ordinária não exige
fabricar assessment, mas nunca libera escrita direta de projeção. Função inicial
não aceita caso previamente commitado. Testes diretos com role_app_backend e
tentativas por repositórios gerados comprovam proteção após o último grant.

O desempate cronológico também é imutável: definir protocolled_at no INSERT
atômico de protocolo e rejeitar todo UPDATE que altere protocolled_at ou id
(comparação IS DISTINCT FROM de OLD/NEW), inclusive em caso legado, por app,
writer ou comandos de domínio. Não há exceção de correção cronológica autorizada
nas fontes desta preparação; o mecanismo futuro de revisão de prioridade não
autoriza alterar essas chaves. Eventual exceção exige regra já autorizada,
identificada e novo contrato revisado antes de implementação, nunca bypass
genérico do trigger. Não prometer resistência contra superuser que desabilite
triggers; o enforcement cobre os roles operacionais e repositórios previstos.

No blueprint, marcar protocolled_at como writable:false; o gerador já aplica
esse atributo tanto ao DTO quanto ao WRITABLE_FIELDS do repositório. O protocolo
handwritten mantém seu campo de intake explícito e INSERT controlado. A omissão
do DTO sozinha não protege payload extra: exigir rejeição no repositório/HTTP e
trigger SQL BEFORE UPDATE para os valores persistidos, independente dos grants
globais de UPDATE. Proteger id no mesmo trigger porque compõe o desempate;
nenhum REVOKE de coluna isolado substitui isso enquanto houver grant de tabela.
A migração não reescreve datas/IDs legados. Para postal, preservar o valor ECT
escolhido no protocolo; assessed_at/qualification_on continuam o marco separado
de idade. Reaplicar apply completo não pode reabrir essas escritas.

Sensor negativo adicional: após protocolo postal e não postal, tentar antecipar
e postergar protocolled_at via PATCH gerado, repository.update e SQL direto
role_app_backend; tentar alterar id por SQL e pela fronteira HTTP. Cobrir
secretário e coordenador no HTTP e caso legado no SQL; todos falham sem alterar
ordem, versão, assessment, ledger ou auditoria de sucesso. Provar valores
originais e ordem claim-next intactos, com rollback de escrita precedente na
mesma transação; repetir após reexecução de apply. O caso postal mantém ECT e
idade pelo ato mesmo quando os dois marcos caem em lados opostos do aniversário.

### Via oficial de upgrade proposta e recuperação

Não editar o gerador nem DDL34 manualmente. Introduzir três scripts SQL manuais,
invocados explicitamente por apply.sh em ordem fixa, no mesmo modo normal e full:

1. `backend/database/ddl/19-rait-priority-pre.sql`, imediatamente
   antes de DDL34: se tabelas antigas existem, adquirir lock e adicionar colunas/
   índices compostos necessários via ALTER idempotente e comparação de catálogo.
   Em banco novo, no-op. Nenhum backfill de qualificação ou mudança de legal_priority.
2. DDL34 gerado cria as duas tabelas; os demais DDLs continuam; DDL20 termina seus
   grants globais como hoje.
3. `backend/database/ddl/19-rait-priority-enforce.sql`, **depois**
   de DDL20: dentro da transação única V3, cria role/funções/triggers, revoga grants globais
   de escrita das duas relações e instala grants mínimos/restrições definitivos.
   Reexecução reaplica hardening; grants intermediários não são confirmados.
4. `backend/database/ddl/19-rait-priority-verify.sql`: assertivas
   de catálogo, equivalência schema fresco/upgrade, privileges, RLS/FORCE,
   functions/search_path/ownership, e constraints; falha encerra apply sem abrir
   tráfego. apply.sh só anuncia sucesso depois dessas assertivas.

Cada script aborta em forma de schema desconhecida; IF NOT EXISTS sozinho não
aceita drift. Prefixo pre também cobre adições C4 anteriores ausentes em banco
base (datas de recebimento/resposta e snapshot de jurisdição): comparar BP/DDL
base e candidato, fechar lista nominal de ALTER no próprio SQL revisado.
Novas tabelas internas C4 anteriores são criadas pelo DDL gerado. DDL20 não é
editado, e não se confia em REVOKE anterior a ele. Migração é uma via proposta
oficial a revisar, não uma via já instalada no repositório.

Acervo: preservar valores históricos **in situ**, inclusive strings desconhecidas
e NULL; novo CHECK global em legal_priority não pode inviabilizar o upgrade.
O trigger aplica vocabulário somente a apurações novas, e claim exige assessment
válido antes de ler rank. Nenhum SQL de inventário converte null em none.
Inventário read-only por tenant agrupa valores e vínculos; relatórios públicos
contêm contagens e hashes, sem DOB/conteúdo documental. Backup restrito criptografado
do banco e manifesto de checksums no ambiente de ensaio/operador precedem execução.
Não versionar dump/dados reais no Git ou reports.

Não haverá backfill factual automático V1. Saneamento de legado exige prova de
qualificação contemporânea já existente e decisão separada de migração de dados;
casos sem prova permanecem inelegíveis, mesmo com risco alto. Esse bloqueio é
resultado definido do upgrade, não TODO de classificação. Não permitir secretary
usar protocol/revisePriority para requalificar registro legado. Impacto operacional
é o inventário de casos em quarentena, a ser aprovado antes de migração real.

Ensaio futuro em detran_r7_ctg1_a2: snapshot da base anterior, upgrade **sem --full**,
verificação de preservação linha/valor, enforcement, repetição idempotente e falha
injetada. Depois, em execução serial separada, esquema fresco e comparação.
Backup/restore devem provar rollback completo antes de aceitar tráfego novo.
Não existe down destrutivo após novas qualificações: reverter app mantendo schema
e negar writes incompatíveis, ou forward-fix revisado; restore só antes de reabrir
tráfego, para não apagar atos legítimos. Zero banco executado nesta preparação.

### Delta fechado de paths e responsabilidades

Além das allowlists D1 de cada papel, paths novos/alterados exclusivos deste delta:

- Architect: BP case, DDL34 e saídas oficiais já enumeradas acima; novo
  `docs/framework/contracts/manual/rait-priority-intake.commands.openapi.json`;
  `backend/database/apply.sh` e os três SQL manuais ddl/19 acima, dentro da
  fronteira 0x/1x do manual Architect; ordem explícita conforme V3.
- Engineer: `backend/domains/inf/rait-case/src/handwritten/rait-case-commands.controller.ts`,
  `rait-case-command.service.ts`, `rait-operation-clock.ts`,
  `rait-inquiry-command.service.ts` no mesmo diretório; novo
  `rait-priority.schema.ts` no mesmo diretório; seed20 apenas fixtures suas.
  Não escrever SQL/manual schema nem seed05 gerada.
- Architect de parâmetros: `docs/framework/arch/parameter-catalogue.md` e,
  somente em TASK-0030 após RED Inspector TASK-0026 e parser Engineer TASK-0027,
  saída oficial `backend/database/seed/05-parameters.sql`,
  `backend/app/src/generated/parameter-flags.ts`,
  `backend/domains/ops/parameter/src/generated/parameter-catalogue.ts`.
- Inspector: seis sensores/fixtures já enumerados; adicional
  `backend/domains/inf/rait-case/tests/integration/rait-priority-upgrade.integration.spec.ts`;
  sensor AIT de TASK-0025 continua único path dessa tarefa.
- Transcrição Architect: RN-RAIT-141, mantendo draft e autoridade ADR-0024;
  TASK-0024 preserva seu único path UC-RAIT-017.

Os 75 paths gerados existentes são o produto cartesiano fechado anterior
(15 nomes × 5 formatos), e os dez novos são nominais; essa especificação
determinística não é glob. Case entity/DTO/repository/controller/service podem
mudar semanticamente somente pelos campos/operations desta seção; demais
entidades mudam headers, índices ou FKs explicitados. Index, module, DDL34,
OpenAPI BP case e generated-files.json completam a população. Package/tsconfig/
vitest permanecem sem alteração adicional. Nenhuma nova relação de catálogo,
ledger ou migration tenant: inventário final 90, case17.

A transcrição de parâmetro exige geração posterior; não executar gerador nesta
preparação. Seed05 é gerada (header conferido), portanto a antiga permissão de
edição manual pelo Engineer está expressamente revogada por esta proposta.

### Critérios de revisão e ordem futura

Revisor deve julgar juntos adendo V2, C4, bindings, relatório, RN/catalogue e
prompt `C4-OD-V2-PROPOSED.md`. Os STOPs de authority/enforcement/upgrade acima
agora têm desenho concreto; revisão pode rejeitá-lo sem alterar histórico.
Solicitar uma revisão independente válida só após congelamento de hashes.
Nenhum PASS anterior cobre esta ampliação; não afirmar prontidão de execução.

Depois da autorização de limites: revisão proposta → preparação oficial BP/SQL/
parâmetro e KB → Inspector escreve sensores RED/upgrade/RLS → Engineer implementa
GREEN → Architect regenera/verifica mesmos inputs → gates integrais → revisão de
entrega. RED de banco ausente/DDL não aplicado é infraestrutura, não prova funcional.
SQL novo precisa de revisão sobre seus bytes antes da aplicação de ensaio; mudança
material do desenho reabre review contabilizado. TASK-0023 já consumida continua
histórica; esta preparação não é disfarçada de nova execução nem reinicia ciclos.

Provas adicionais: protocol conforme matriz exaustiva V3; ausência de prova cria
none atomicamente; falha de validação/audit desfaz caso e assessment; caso novo sem
assessment não commita; PCD sem anexo negado; idade com documento apresentado sem
upload aceita; aniversário 60/80, postal com idade distinta entre ECT e ato;
NULL/string legado preservados e excluídos; revisão por coordinator e alteração do
parâmetro para allowed negadas; INSERT/UPDATE/DELETE/TRUNCATE diretos negados após
apply completo; FK cross-case/tenant; adulteração de documento/hash negada; replay
e dois protocolos simultâneos; seis providers/Clock e todos os 14 comandos prévios.

## Fechamento V3 — cinco frentes, oito findings

### 1. SQL manual permitido, atomicidade e recuperação

TASK-0029 (Architect) prepara exclusivamente os três paths manuais
`backend/database/ddl/19-rait-priority-pre.sql`,
`backend/database/ddl/19-rait-priority-enforce.sql` e
`backend/database/ddl/19-rait-priority-verify.sql`, e a ordem em
`backend/database/apply.sh`, além do BP/outputs já delimitados. Nenhum path
`backend/database/migrations/` é autorizado. O discovery ordinário exclui
nominalmente esses três arquivos e `20-rls-policies.sql`. A lista ordenada mantém
todos os demais DDLs na ordem atual, insere pre imediatamente antes de
`34-inf-rait-case.sql`, acrescenta DDL20 depois de todos os DDLs ordinários,
enforce imediatamente após DDL20 e verify como último arquivo. Cada arquivo
consta exatamente uma vez; duplicata, ausência, path desconhecido ou posição
incorreta aborta antes de conectar para aplicação.

O shell prepara uma única lista de argumentos `-f` e chama **uma única sessão**
`psql -X -v ON_ERROR_STOP=1 --single-transaction`, com conexão explícita ao banco
autorizado, seguida de `-c 'SELECT pg_advisory_xact_lock(7007, 1)'` e todos os
`-f` na ordem acima. O lock transacional precede qualquer DDL, serializa applies
no mesmo banco e só se libera no COMMIT/ROLLBACK final. Não usar lock de sessão,
psql por arquivo, pipeline que esconda exit code ou retry que aceite fase parcial.
Rejeitar comandos top-level BEGIN/START TRANSACTION/COMMIT/END/ROLLBACK, troca de
conexão, includes não inventariados e comandos incompatíveis com transação nos
arquivos; BEGIN/END de corpo PL/pgSQL não são controle top-level. A inspeção deve
entender essa distinção: um grep isolado não é prova de compatibilidade.

No pre, antes de alterar as relações existentes de case/document/history,
adquirir locks de tabela ACCESS EXCLUSIVE em ordem nominal estável; mantê-los
até verify e COMMIT. O advisory lock coordena migradores, não bloqueia sozinho
requests. Locks de tabela bloqueiam acessos concorrentes às relações protegidas;
DDL e grants intermediários só se tornam visíveis juntos no commit. Não afirmar
indisponibilidade total de tráfego: requests em outras relações podem continuar.
Um apply falho deixa o estado anterior integral, não grants DDL20 parcialmente
confirmados. Em upgrade pré-hardening, o estado anterior pode ainda ser amplo;
falha nunca autoriza ativar o novo intake/worker. A liberação operacional exige
apply concluído, verify PASS e gates funcionais. Não prometer que rollback torna
um esquema legado já inseguro seguro.

`--full` executa DROP/CREATE DATABASE fora dessa transação, somente em banco de
ensaio descartável explicitamente autorizado. A transação única começa na nova
conexão após CREATE. Falha deixa esse banco recém-criado sem aplicação parcial;
não restaura o banco destruído por --full. Upgrade é `apply.sh` **sem --full**,
preserva dados/configuração e prova rollback ao snapshot anterior. Reset fresco
não prova upgrade. Seeds não pertencem à transação DDL; `seed.sh` não é chamado
implicitamente por apply e não integra a alegação de atomicidade. Em upgrade
não executar seeds globais: preservar configurações ativas, versões e valores
desconhecidos; placeholder existente continua bloqueando a operação até uma
correção de dados separadamente autorizada. A seed05 gerada usa ON CONFLICT DO
NOTHING, que não transforma configuração antiga em política válida.

Inspeção desta correção: apply atual abre psql por arquivo; DDL00 instala
pgcrypto/uuid-ossp/citext/postgis; DDL01/05 e funções têm blocos PL/pgSQL BEGIN.
Não foi localizado COMMIT/ROLLBACK top-level, VACUUM, CREATE INDEX CONCURRENTLY,
CREATE DATABASE ou ALTER SYSTEM nos DDLs atuais. Isso é compatibilidade estática
provisória: scripts de extensão instalados, SQL novo e locks reais precisam do
ensaio PostgreSQL na versão efetiva. Se qualquer byte não for transacional,
TASK-0029 bloqueia e reporta o comando; não divide silenciosamente a transação.
DDL20 permanece intacto e enforce deve sempre sucedê-lo.

TASK-0028 (Inspector) escreve primeiro o sensor de upgrade/atomicidade em
`backend/domains/inf/rait-case/tests/integration/rait-priority-upgrade.integration.spec.ts`.
Injetar erro SQL após pre, após DDL34, após DDL20 e após enforce, usando cópia
isolada dos arquivos e o apply real em subprocesso; nunca editar fontes para
injetar erro nem oferecer bypass de produção. Para cada ponto exigir exit não
zero, ausência de anúncio de sucesso, e igualdade antes/depois de dados legados,
schema, ACLs, roles/funções/triggers e configurações. Excluir da comparação
somente metadados não semânticos explicitamente justificados. Outra sessão
role_app_backend observa que nenhum grant intermediário fica utilizável; segunda
aplicação espera o advisory lock. Provar falha em verify e falha de constraint
diferida no COMMIT, sem sucesso antecipado. Provar reaplicação idempotente,
hardening após DDL20 e equivalência estrutural fresh/upgrade (colunas, constraints,
índices, RLS/FORCE, políticas, triggers, ownership/search_path/ACLs), conservando
dados legados e sem comparar OIDs ou conteúdo de seed como equivalência estrutural.

### 2. Parâmetro: referência, sensor, parser e geração separados

Architect mantém a referência em `docs/framework/arch/parameter-catalogue.md`;
seu contrato é o objeto exato V2 acima, sem mudar outras chaves. TASK-0026
(Inspector) escreve apenas `tools/parameters/tests/generator.test.mjs`: RED
reproduzível para objeto JSON real, JSON inválido rejeitado, regressão de defaults
string/número/boolean e preservação semântica das demais chaves, metadados e
proveniência. Fixtures temporárias são construídas pelo sensor sem alterar o
catálogo ou parser. Congelar hash do sensor antes de TASK-0027.

TASK-0027 (Engineer) altera apenas `tools/parameters/parser.mjs`, satisfaz o RED
sem editar catálogo/teste/gerador/saídas, e demonstra sensor intacto. TASK-0030
(Architect) executa `pnpm parameters:generate` após GREEN do parser e materializa
somente `backend/database/seed/05-parameters.sql`,
`backend/app/src/generated/parameter-flags.ts` e
`backend/domains/ops/parameter/src/generated/parameter-catalogue.ts`.
Repetir geração deve produzir os mesmos bytes. Engineer nunca escreve seed05
manualmente. Drift atual permanece pendente até essa etapa, sem PASS antecipado.

### 3. Sequência nominal e gate independente pós-TASK-0023

TASK-0023 continuação 2/2 → **delta-review independente pós-TASK-0023** →
TASK-0026 RED parser → TASK-0027 GREEN parser → TASK-0028 RED upgrade →
TASK-0029 blueprint/SQL/apply → TASK-0030 geração parâmetros → TASK-0024 KB →
TASK-0025 RLS → preflight → TASK-0020 iteração 4 → hashes sensores → TASK-0021
iteração 4 → TASK-0022 gates → delivery-review. Um escritor e banco serializados.
O RED de TASK-0028 distingue falha contratual de pré-requisito de infraestrutura;
não aplica SQL candidato antes de revisão de seus bytes e autorização do ensaio.
TASK-0029 disponibiliza SQL revisável; execução de teste DB posterior a esse
checkpoint é distinta de autoria do sensor.

Antes de qualquer dispatch, o coordenador materializa para 0026–0030 os registros
`work/rounds/R-0007/tasks/TASK-0026.json` até `TASK-0030.json`, prompts de mesmos
IDs, coupled_task_group=CTG-0001, target_modules, locks, dependências, allowlists,
reserva e limites. Esses registros não são escritos por esta continuação
documental. Locks mínimos exclusivos: 0026 MOD-parameter-sensors (F3), 0027
MOD-parameter-parser (F2), 0028 MOD-rait-priority-upgrade-tests (F3), 0029
MOD-rait-priority-schema (F1/modelagem e geração autorizada), 0030
MOD-parameter-generated (geração oficial). A trava global de escritor serial
impede colisão com 0020/0021/0022, mesmo quando há outputs compartilhados.

O coordenador congela manifesto SHA-256 dos quatro documentos, prompts, tarefas,
plano, orçamento e fontes Owner/catálogo/BP efetivamente consumidos pelo revisor.
O revisor é instância independente do autor; registra seu orçamento/limite próprio
antes da chamada. JSON inválido é ausência de veredito; REVIEW/FAIL não libera
etapas. Somente PASS válido referente a esses hashes libera blueprint, SQL,
parâmetros, TASK-0024, TASK-0025 e RED. Mudança material posterior invalida o gate
do candidato alterado e exige revisão contabilizada. Não reutilizar o PASS de
prompt anterior à correção, nem o FAIL V2, como PASS pós-TASK-0023.

Referências fechadas comuns: `AGENTS.md`, `CODESTYLE.md`,
`.devai/pin/constitution.md`, `work/rounds/R-0007/contracts/CTG-0001.md`,
`work/rounds/R-0007/contracts/CTG-0001-C4.md`, este adendo,
`work/rounds/R-0007/reports/CTG-0001-C4-BINDINGS.md` e
`work/rounds/R-0007/reports/CTG-0001-C4-OD-PLAN.md`.
Architect lê `docs/meta/agents/architect-blueprint.md`; Inspector lê
`docs/meta/agents/inspector-tests.md` e
`work/rounds/R-0007/prompts/TASK-0002-D1.md`; Engineer lê
`docs/meta/agents/engineer-backend.md` e
`work/rounds/R-0007/prompts/TASK-0003-D1.md`; transcrição KB lê
`docs/meta/agents/transcriber-docs.md`. Os prompts de cada etapa devem listar
nominalmente suas fontes adicionais e outputs, sem “manual Art.6” ou contrato
abreviado não resolvido. Herança D1 não autoriza ler/escrever qualquer arquivo.

### 4. Matriz nominal exaustiva de protocol

Fonte canônica: `backend/domains/shared/src/roles.ts`, DETRAN_ROLES (36 códigos).
Action: `inf:rait-case:protocol`; boundary POST existente. Cada código negado
abaixo recebe teste HTTP separado com identidade autenticada contendo somente
esse papel; não condensar em amostra representativa. O sensor compara o conjunto
nominal com DETRAN_ROLES e falha se surgir papel sem decisão explícita.

| Papel canônico         | protocol isoladamente                         |
| ---------------------- | --------------------------------------------- |
| ADMIN                  | negado                                        |
| ADMIN_CLINICA          | negado                                        |
| MEDICO                 | negado                                        |
| PSICOLOGO              | negado                                        |
| RECEPCAO               | negado                                        |
| TECNICO_BIOMETRIA      | negado                                        |
| AUDITOR                | negado                                        |
| GESTOR                 | negado                                        |
| SUPERVISOR             | negado                                        |
| GESTOR_DETRAN          | negado                                        |
| JUNTA                  | negado                                        |
| CETRAN                 | negado                                        |
| DPO                    | negado                                        |
| SUPORTE                | negado                                        |
| CANDIDATO              | negado                                        |
| field-agent            | negado                                        |
| field-supervisor       | negado                                        |
| processing-operator    | negado                                        |
| traffic-authority      | negado                                        |
| agency-admin           | negado                                        |
| technical-admin        | negado                                        |
| bi-analyst             | negado                                        |
| integration-operator   | negado                                        |
| rait-analyst           | negado                                        |
| rait-coordinator       | negado                                        |
| rait-secretary         | permitido somente com vínculo dinâmico válido |
| rait-signing-authority | negado                                        |
| rait-central-authority | negado                                        |
| rait-rapporteur        | negado                                        |
| rait-chair             | negado                                        |
| rait-manager           | negado                                        |
| rait-hr                | negado                                        |
| rait-finance           | negado                                        |
| dash-operator          | negado                                        |
| dash-duty-owner        | negado                                        |
| CIDADAO                | negado                                        |

`policy.ts` permite atalhos de permissions wildcard/recurso/chave e de
GLOBAL_ADMIN_ROLES antes da action específica. Portanto a entrada protocol do
catálogo não basta para negar administradores ou identidade com permission sem
secretary. Exceção V3 estrita à proibição D1 de editar policy compartilhada:
TASK-0021 (Engineer) pode editar `backend/domains/shared/src/policy.ts` somente
para uma guarda de resource=`inf:rait-case`, action=`protocol` que exige
rait-secretary **antes de ambos os atalhos**, seguindo a ordem de proteção já
usada para `ch:retention:review`. Preservar todas as demais regras e ações.
TASK-0020 (Inspector) pode acrescentar os sensores correspondentes em
`backend/domains/shared/src/policy.spec.ts`, além dos paths HTTP D1.
TASK-0021 também implementa no método protocol de
`backend/domains/inf/rait-case/src/handwritten/rait-case-command.service.ts`
guarda explícita exigindo rait-secretary no RequestContext e vínculo dinâmico
válido, antes de escrever. Não alterar roles.ts nem o override global
das outras ações. União de papéis permanece: administrador que também possui
rait-secretary pode operar **por esse papel**, com vínculo válido; administrador
isolado nunca. Todos os demais papéis em conjunto, sem secretary, também negam.
Negativas adicionais nominais: identidade sem secretary com permission `*`,
permission `inf:rait-case:*` ou permission `inf:rait-case:protocol`, isoladamente
e combinadas com ADMIN. Cobrir tanto a função de política canônica quanto o
HTTP real; atalhos não podem reabrir protocol. Positivo secretário conserva
união de papéis, mas permission sozinha nunca substitui vínculo dinâmico.

Positivo exige pessoa do actorId autenticado igual ao person_id de membro ATIVO,
member_role secretaria, pool ativo do tenant e instância do intake e unidade
exata por IS NOT DISTINCT FROM (NULL não é curinga). Negativas independentes:
secretary sem membro, membro inativo, papel de membro errado, outra pessoa,
pool inativo, outra unidade, outra instância e vínculo de tenant cruzado; contexto
tenant ausente; actorId ausente, adulterado ou substituído por outro usuário.
Corpo com actor/actorId/assessed_by/verified_by, tenant ou policy/rank é rejeitado,
mesmo que coincida com a identidade autenticada. input.context não substitui
RequestContext; header de ator inventado não altera a sessão autenticada.
Papel negado retorna FORBIDDEN_ACTION/403; vínculo negado usa
FORBIDDEN_CASE_SCOPE/403; autenticação ausente preserva o status do pipeline real.
Todos os casos negativos comprovam zero caso/assessment/bases/ledger/audit de
sucesso. Schema inválido preserva a precedência de validação C4.

Inspector cobre em
`backend/app/tests/e2e/rait-case-commands.e2e.spec.ts` (pipeline HTTP real),
`backend/domains/inf/rait-case/tests/unit/rait-case-behavioral-matrix.spec.ts` e
`backend/domains/inf/rait-case/tests/integration/rait-case-runtime.integration.spec.ts`.
SQL com role_app_backend testa actorId nulo, inexistente, sem membership ou
cross-tenant e invariantes. SQL não autentica independentemente o ID de um
secretário válido fornecido por quem possui a credencial app: manter expressa a
fronteira de confiança V2, sem alegar que membership impede essa impersonação.

### 5. Aceitação futura por tarefa — comandos não executados nesta correção

Todos os comandos abaixo são critérios futuros; paths de sensores novos só
existirão após suas tarefas. Exigir Node 24.15.0, URLs explícitas validadas,
current_database=detran_r7_ctg1_a2 e role_app_backend no caminho de request,
sem expor segredos. Nunca confundir zero testes ou infraestrutura ausente com RED.
Todos os comandos Vitest filtrados passam `--passWithNoTests=false` explicitamente,
pois configurações atuais podem permitir coleta vazia. Relatório exige contagem
positiva e nomes dos cenários esperados; exit 0 sem esses cenários bloqueia.

| Tarefa / comando exato                                                                                                                                                                                                                                                                               | Resultado esperado                                                                                                                                         |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TASK-0026: `node --test tools/parameters/tests/generator.test.mjs`                                                                                                                                                                                                                                   | RED contratual do objeto JSON; regressões anteriores preservadas; hash do sensor congelado                                                                 |
| TASK-0027: `pnpm parameters:test`                                                                                                                                                                                                                                                                    | GREEN objeto/JSON inválido/demais defaults; nenhum byte do sensor alterado                                                                                 |
| TASK-0028 e ensaio pós-0029: `pnpm --filter @detran/inf-rait-case test:integration --passWithNoTests=false tests/integration/rait-priority-upgrade.integration.spec.ts`                                                                                                                              | RED classificado antes da implementação; depois PASS com casos nominais fresh, upgrade repetido, quatro falhas injetadas, verify/COMMIT, locks e hardening |
| TASK-0029 preparação: `bash -n backend/database/apply.sh`                                                                                                                                                                                                                                            | exit 0; inspeção/sensor confirma uma sessão, ordem e unicidade                                                                                             |
| TASK-0029 geração: `pnpm blueprints:generate && pnpm contracts:openapi && pnpm blueprints:check && pnpm contracts:check`                                                                                                                                                                             | somente população nominal autorizada; segunda geração idêntica; seis providers e 17 entidades case                                                         |
| Ensaio upgrade autorizado: `DB_NAME=detran_r7_ctg1_a2 bash backend/database/apply.sh`                                                                                                                                                                                                                | PASS sem reset, preservação de NULL/strings/datas/IDs/configs; repetir mesmo comando conserva schema/ACLs/dados                                            |
| Ensaio fresh separado e autorizado: `DB_NAME=detran_r7_ctg1_a2 bash backend/database/apply.sh --full`                                                                                                                                                                                                | somente após backup/evidência do upgrade; novo schema equivale estruturalmente ao upgrade; não prova recuperação de DROP                                   |
| TASK-0030: `pnpm parameters:generate && pnpm parameters:test && pnpm verify:parameter-catalogue`                                                                                                                                                                                                     | três derivados oficiais coerentes; repetir generate não altera bytes; nenhum update de configuração ativa no banco                                         |
| TASK-0024: `pnpm docs:kb:check`                                                                                                                                                                                                                                                                      | exit 0, baseline 446 e F-J-0 preservados                                                                                                                   |
| TASK-0025: `pnpm --filter @detran/inf-ait test:integration --passWithNoTests=false tests/integration/inf-rls.integration.spec.ts`                                                                                                                                                                    | PASS, 90 relações tenant/17 case, cinco adições nominais verificadas, RLS/FORCE/policies/triggers e identidade real                                        |
| TASK-0020/0021: `pnpm --filter @detran/inf-rait-case test:unit --passWithNoTests=false tests/unit/rait-case-di-c4.spec.ts tests/unit/rait-case-behavioral-matrix.spec.ts`                                                                                                                            | RED depois GREEN: seis omissões individuais DI, Clock snapshot/fuso, matriz protocol e 14 comandos                                                         |
| TASK-0020/0021: `pnpm --filter @detran/inf-rait-case test:integration --passWithNoTests=false tests/integration/rait-case-runtime.integration.spec.ts`                                                                                                                                               | RED depois GREEN: serviços reais, imutabilidade protocolled_at/id incluindo legado/postal, rollback/replay e efeitos integrais                             |
| TASK-0020/0021: `pnpm --filter @detran/app test:e2e --passWithNoTests=false tests/e2e/rait-case-commands.e2e.spec.ts`                                                                                                                                                                                | RED depois GREEN: 36 papéis, spoofing/payload, HTTP/repository/SQL sem mutação, seis providers e marcos temporais                                          |
| TASK-0020/0021: `pnpm --filter @detran/shared test --passWithNoTests=false src/policy.spec.ts`                                                                                                                                                                                                       | RED depois GREEN: protocol nega admin e os três atalhos permission sem secretary; união com secretary preservada; demais ações inalteradas                 |
| TASK-0021: `pnpm --filter @detran/inf-rait-case typecheck && pnpm --filter @detran/app typecheck`                                                                                                                                                                                                    | exit 0, sensores intactos                                                                                                                                  |
| TASK-0022: `pnpm blueprints:check && pnpm contracts:check && pnpm verify:rls-ddl && pnpm verify:lifecycle-vocabulary && pnpm verify:decorators && pnpm check && pnpm backend:test:ci && pnpm devai:doctor && pnpm exec devai evidence verify --scope chain --repo-root . --show-head --format human` | todos PASS no mesmo candidato congelado, sem skip/fallback/passWithNoTests; delivery-review ainda separado                                                 |

Aplicação/seed/banco real não são autorizados por esta tabela. Os ensaios mutantes
exigem identidade e autorização do banco dedicado, bytes SQL revisados e registro
de evidência. O ensaio fresh deve vir depois da preservação dos resultados e
snapshot do upgrade; os dois não correm em paralelo. Imutabilidade inclui repetir
as tentativas após apply completo: antecipar/postergar protocolled_at, alterar id
via HTTP/repository/SQL, sem alterar versão, ordem, assessment ou audit de sucesso.

## Delta de sequência V3 — TASK-0028 → TASK-0029 → TASK-0030

Data: 2026-09-16. Architect Art. 6. Correção documental delimitada pela
autorização OWNER registrada no topo de `work/rounds/R-0007/plan.md`.
Esta seção final prevalece **somente** sobre dependências conflitantes dessa
sequência no V3, inclusive índice, prompts, matriz F1–F8 e relatório de plano.
Preserva as demais decisões, allowlists, papéis, locks e gates. O PASS documental
V3 anterior vale para seus próprios hashes; este delta exige uma revisão
independente com JSON válido e PASS do candidato exato antes de qualquer
despacho TASK-0029. FAIL, REVIEW ou saída inválida não liberam a sequência.

### Estado constatado e sensor ainda incompleto

O checkpoint TASK-0028 permanece na mesma iteração **1/1**. O sensor atual
`backend/domains/inf/rait-case/tests/integration/rait-priority-upgrade.integration.spec.ts`
tem SHA-256 `6f34cb98928ee061e5ecaa828ec6eef8160fef66d4b1bb8c275fb9c3202b78f9`.
O resultado registrado foi **1 FAIL contratual estático pré-SQL**, pela ausência
de `--single-transaction` no apply vigente, **8 testes DB filtrados e zero
conexão DB**; coleta de nove testes, typecheck e Prettier passaram. Isso é RED
estático genuíno, não RED DB, PASS DB ou conclusão integral de TASK-0028.
Faltam sensores explícitos fresh versus upgrade e de string legada desconhecida;
os três SQL de TASK-0029 ainda não existem. O gate integral continua BLOCKED.

### Sequência acíclica e condições de liberação

1. **Completar e congelar TASK-0028, mesma iteração 1/1.** Inspector completa
   os sensores fresh versus upgrade e a fixture de string legada desconhecida,
   comprovando preservação do legado/configuração e ausência de qualificação
   factual inventada, conforme o contrato vigente. Preserva rollback, erro no
   commit, concorrência, reaplicação, ACL e imutabilidade. O harness congelado
   deve funcionar antes e depois da chegada dos três SQL reais: sondas
   sintéticas só na cópia estática pré-SQL; ensaio DB usa somente bytes reais
   revisados. Inventário fechado de 49 DDLs mais os três previstos, sem tolerar
   extras ou exigir nova edição do sensor para aceitar o candidato. Exigir
   coleta positiva nominal, typecheck, Prettier, reprodução do RED estático
   contratual e manifesto SHA-256 do sensor completo antes de 0029.
2. **TASK-0029, somente PREPARAÇÃO.** Após PASS independente deste delta,
   sensor completo congelado, RED estático genuíno e identidade/isolamento
   verificados de `detran_r7_ctg1_a2`, pode preparar BP, contrato manual, DDL34
   e os 85 outputs pela geração oficial, manifesto/índice/módulo já permitidos,
   três SQL manuais ddl/19 e `apply.sh`, estritamente na allowlist V3.
   O principal de request deve ser `role_app_backend`, sem superuser/BYPASSRLS;
   conexão administrativa não substitui esse principal. **PASS DB não é
   pré-condição da preparação 0029**, pois depende do SQL ainda inexistente.
   Ausência de infraestrutura não vira RED. Essa liberação não permite apply,
   seed ou qualquer ensaio mutante DB, nem declara TASK-0028 concluída.
3. **Congelar candidato e revisar SQL independentemente.** Depois da geração
   oficial e verificações de 0029, congelar por SHA-256 os bytes exatos de SQL
   e apply, incluindo DDL34, os três ddl/19 e todos os DDLs consumidos, com
   manifesto dos outputs e sensor. Revisão independente obrigatória desses
   bytes deve emitir PASS válido antes de **qualquer DB apply**, inclusive
   subprocesso do harness. O PASS deste delta documental não substitui essa
   revisão SQL. Mudança material invalida o PASS afetado e bloqueia apply até
   revisão do novo candidato; sensor alterado perde o congelamento.
4. **Gate integral TASK-0028 sobre o candidato revisado.** Retomar a mesma
   iteração, sem reset, para executar o ensaio autorizado no banco dedicado,
   em série, com os sensores congelados e SQL/apply revisados. Exigir PASS
   nominal de upgrade e reaplicação, preservação da string legada desconhecida,
   rollback após pre/DDL34/DDL20/enforce/verify e commit diferido, concorrência,
   ACL/hardening e imutabilidade. Preservar snapshots/resultados do upgrade
   antes do fresh descartável e comprovar equivalência fresh versus upgrade.
   Seeds permanecem separados; a autorização específica do banco não permite
   outros bancos nem alteração de roles globais. Verificar novamente identidade,
   isolamento e hashes antes do ensaio; ausência deles mantém BLOCKED.
5. **Somente então TASK-0030 e posteriores.** Preparação 0029 isoladamente
   não libera 0030. Exigir PASS integral DB de 0028 sobre o mesmo candidato,
   além de TASK-0027 GREEN, sensor 0026 intacto e todos os gates V3 já vigentes.
   Seguem 0030 → 0024 → 0025 → preflight → 0020/0021 iteração 4 → 0022 →
   delivery-review. Falha ou cobertura faltante bloqueia dependentes; nenhum
   filtro, coleta zero, skip ou ausência de infraestrutura satisfaz o gate DB.

Os checkpoints de autoria/RED estático, preparação SQL, revisão SQL e PASS DB
são etapas de aceitação, não novas tarefas ou arestas de retorno no grafo:
0028 produz o sensor antes de 0029; seu ensaio posterior valida 0029 antes de 0030. O campo único `upstream_task_id` não substitui esses gates adicionais.
Permanecem escritor único e banco serializado, TASK-0020/0021 **3/4** e
TASK-0023 **2/2**, com todo histórico preservado. Este delta não reinicia
contadores, amplia orçamento ou autoriza worker, geração, SQL ou DB agora.
Preserva integralmente política jurídica Owner/ADR-0024, Clock/ADR-0025,
90/17, 14 comandos, seis providers, RLS e F1–F8. Nenhum bypass silencioso,
commit, publicação ou integração é autorizado.

## Delta documental V3 — OpenAPI manual separado

Data: 2026-09-16. Architect Art. 6. Pela autorização OWNER no topo de
`work/rounds/R-0007/plan.md`, o path manual único é
`docs/framework/contracts/manual/rait-priority-intake.commands.openapi.json`.
Substitui o path antigo diretamente em contracts/ nas referências operacionais;
reports históricos preservam o reference-gap. Nenhum JSON manual é criado neste
delta. `tools/contracts/generate-openapi.mjs` e toda a fronteira de tooling
permanecem intocados; o checker segue rejeitando órfãos na raiz. Não há
ampliação de allowlist de tooling nem novo contrato gerado disfarçado.

A especificação executável de validação e os consumidores exatos estão em
`docs/framework/contracts/manual/README.md`; a distinção gerado/manual também
consta em `docs/framework/contracts/README.md`. O gate manual exige arquivo
existente/não vazio, parse/resolução real pelo CLI instalado e checagens
positivas de paths, operações e respostas, incluindo POST /v1/inf/rait/cases.
O comando obrigatório, da raiz desta worktree, é:

```bash
pnpm --filter @detran/senatran-adapter exec openapi-typescript '/Volumes/Thiamat II/stech/detran-worktrees/rait-backend/docs/framework/contracts/manual/rait-priority-intake.commands.openapi.json' > /dev/null
```

Executar também o bloco completo do README manual: Redocly `struct:error` e
`no-unresolved-refs:error` via API instalada, presença/conteúdo positivo e
`pnpm contracts:check` inalterado. Exigir exit 0 de cada comando, contagens
positivas, revisão semântica do POST e SHA-256 do JSON. Arquivo ausente,
parse/resolução inválida, superfície vazia ou gate gerado falhando bloqueiam.
Não interpretar saída descartada como dispensa de validação, nem usar somente
JSON.parse, CLI isolado ou mudança de diretório como prova de validade
estrutural OpenAPI. O lint estrito novo cobre somente o manual, não os
gerados legados. A validação futura é
PENDENTE; o PASS anterior do checker gerado não valida o arquivo futuro.

Os dois gates são obrigatórios antes da conclusão preparatória TASK-0029 e
em todas as aceitações posteriores: revisão SQL, ensaio DB, TASK-0030,
TASK-0024/0025, preflight, TASK-0020/0021, TASK-0022 e delivery-review, sobre
os bytes atuais. Reconciliar índice, prompts, allowlists, tarefas/compositions
e readset antes da única revisão independente deste delta; PASS anterior do
delta de sequência cobre somente seus próprios hashes. A revisão nova e
supervisor preflight pertencem ao coordenador, sem dispatch automático.

Preservada a decisão OWNER específica: apenas criar
`role_rait_priority_writer` NOLOGIN, NOSUPERUSER, NOBYPASSRLS, NOCREATEDB,
NOCREATEROLE e NOREPLICATION, sem membership ao app ou alteração de outros
roles. Criação/permissões na mesma transação revisada; role existente
incompatível causa STOP. Essa exceção supera somente a vedação anterior
desse novo role. Ownership postgres no baseline versus aarusso no admin
continua risco a resolver/provar, sem relaxar equivalência fresh/upgrade.
Política legal/ADR-0024, Clock/ADR-0025, RLS, F1–F8, 90/17, seis providers
e 14 comandos continuam. TASK-0028 e TASK-0029 permanecem **1/1**, sem reset.
Sensor 0028 congelado SHA-256
`aab9bde147c33fd047ee9e8fa5f1d7b4a9acb8298a34bc5d6d05dadc7d6e9577`.
Escritor único, banco serializado, revisão independente dos bytes SQL antes
de qualquer apply e PASS integral DB antes de 0030 continuam obrigatórios.

## SQL review1 corrective sequence

Data: 2026-09-16. Architect Art. 6, Astra/Medium. Autoridade: bloco OWNER
GOAL SQL1 CORRECTION de `work/rounds/R-0007/plan.md`. Este adendo prevalece
somente nas dependências conflitantes da sequência 0028/0029/0030 e no
recorte de rank abaixo. Preserva o histórico e todos os demais gates V3.
Seu estado é **preparado para prompt-review independente**, sem dispatch.

Fonte integral: `work/rounds/R-0007/reviews/attempt-2/ctg-0001-c4-od-v3-review-sql-1.json`,
veredito REVIEW válido, candidato
`a889a9b7266f36e3c0194f75f838b4facc1b7ecc6bbea07f8c824c21b2c83689`,
189 inputs, três high e dois low. Parecer, manifesto, snapshots, raw e bridge
SQL1 permanecem imutáveis. Os achados SQL1-F1/F2/F3 abaixo não renumeram
nem substituem a matriz histórica F1–F8.

### Triagem e limites da correção

- SQL1-F1: o catálogo fonte já contém o objeto ADR-0024 e TASK-0027 corrigiu
  o parser, mas `backend/database/seed/05-parameters.sql` ainda contém a
  string antiga. O gate anterior impedia gerar a entrada necessária ao próprio
  ensaio. Corrigir a sequência e gerar oficialmente; nunca editar seed à mão.
- SQL1-F2: o sensor 0028 congelado em
  `aab9bde147c33fd047ee9e8fa5f1d7b4a9acb8298a34bc5d6d05dadc7d6e9577`
  não insere caso novo nem chama `inf.rait_record_initial_priority` no caminho
  positivo. A continuação Inspector fortalece cobertura na mesma iteração 1/1;
  o hash antigo continua prova histórica, não freeze do próximo candidato.
- SQL1-F3: o serviço usa `item.legal_priority DESC` textual. Separar sensor
  Inspector TASK-0034 e correção Engineer TASK-0035, ambos Sol/High, com limite
  próprio 1/1 materializado pelo Maestro. São o recorte novo autorizado do
  finding SQL1; não reiniciam nem substituem TASK-0020/0021 3/4.

### Ordem obrigatória antes do banco

1. Maestro reconcilia prompts, registros, composições, locks, orçamento e
   readset deste delta, inclusive TASK-0034/0035. Supervisor preflight e
   **prompt-review independente PASS válido dos hashes exatos** precedem
   qualquer writer técnico. REVIEW, FAIL, JSON inválido ou input ausente
   bloqueiam; nenhum PASS anterior é transferido ao candidato alterado.
2. Inspector Sol/High continua TASK-0028 **na mesma iteração checkpoint 1/1**,
   exclusivamente em
   `backend/domains/inf/rait-case/tests/integration/rait-priority-upgrade.integration.spec.ts`.
   Acrescenta INSERT novo e qualificação na mesma transação como
   `role_app_backend`, com `app.tenant_id`, membership válida e comprovação
   de current_user/current_role sem superuser/BYPASSRLS. Cobrir separadamente
   none sem bases, age_60_plus, age_80_plus e PCD com anexo/hash válido;
   verificar projeção, revision=1, assessment/bases append-only e COMMIT
   bem-sucedido. Acrescentar negativas de marcador pg_temp falsificado e
   requalificação pós-protocolo, comprovando ausência de efeitos indevidos.
   Preservar todos os sensores de upgrade, rollback, hardening, concorrência,
   legado e fresh/upgrade. Nesta autoria: coleta/sintaxe/formatação estáticas,
   **zero DB**, novo SHA congelado antes de SQL2; resultados DB pendentes.
3. TASK-0034 Inspector escreve somente
   `backend/domains/inf/rait-case/tests/unit/rait-case-command-contract.spec.ts`.
   Reutilizar `caseRuntime` e captura `runtime.queries` para exercer claim-next
   real e exigir CASE explícito: level_2=2, level_1=1, ELSE 0, DESC, depois
   protocolled_at ASC e id ASC. NULL/string legada recebem rank defensivo 0;
   isso não lhes concede elegibilidade. Exigir RED contratual observado contra
   a consulta vigente e congelar o sensor; falha de coleta/infra não é RED.
   Prova PostgreSQL futura da ordenação deve usar a consulta real capturada,
   quando viável no ensaio autorizado, e nunca duplicar somente a expressão
   desejada num fake para declarar comportamento do serviço. A prova completa
   da fila, risco e elegibilidade continua devida em TASK-0020/0021.
4. TASK-0035 Engineer, apenas após RED/freeze de 0034, altera exclusivamente
   `backend/domains/inf/rait-case/src/handwritten/rait-case-command.service.ts`,
   substituindo a ordenação lexical pelo CASE acima no claim-next existente.
   Preservar filtros, escopo, locks, transação, desempates e demais comandos.
   Reexecutar o sensor para GREEN com contagem positiva e hash intacto;
   não editar testes, Clock, intake, shared, AppModule, lockfile ou gerados.
   A correção não despacha TASK-0021 4/4 nem adquire o lock compartilhado R-0010.
   Qualquer necessidade além deste recorte é reference-gap, não expansão tácita.
5. TASK-0030 Architect Astra/Medium pode então iniciar sua única iteração
   **0/1 → 1/1**, com TASK-0027 GREEN e sensor 0026 intacto, para executar
   `pnpm parameters:generate` exclusivamente nos três derivados já permitidos:
   `backend/database/seed/05-parameters.sql`,
   `backend/app/src/generated/parameter-flags.ts` e
   `backend/domains/ops/parameter/src/generated/parameter-catalogue.ts`.
   `pnpm parameters:test`, `pnpm verify:parameter-catalogue` e segunda geração
   byte-idêntica devem passar. Confirmar objeto JSON exato ADR-0024, não string,
   e ON CONFLICT DO NOTHING preservado. Registrar `in_progress` e checkpoint
   preparatório; **não completed**. Não executar seed ou DB. Esta antecipação
   substitui somente o gate de início de 0030; sua conclusão continua exigindo
   PASS DB integral. Parser, catálogo, sensor e saídas adicionais são proibidos.
6. Congelar novo candidato e obter **SQL review2 independente PASS** antes
   de qualquer reconciliação de fixture ou execução DB. Manifesto inclui todos
   os inputs anteriores pertinentes, SQL/apply/DDL reais, os três derivados,
   sensores recongelados, serviço corrigido e bytes/receita de fixture propostos,
   além dos prompts/contrato e evidências RED/GREEN. SQL1 REVIEW permanece
   aberto até observação nova; geração verde e prompt-review não são SQL PASS.
   SQL19 e DDL05 não são alterados por esta correção; necessidade de alterá-los
   interrompe o recorte para reconciliação/revisão explícita.

Comando unit futuro para 0034/0035, com coleta nominal positiva:
`DETRAN_TEST_TIER=unit pnpm --filter @detran/inf-rait-case exec vitest run --config vitest.config.ts --passWithNoTests=false tests/unit/rait-case-command-contract.spec.ts`.
Exigir Prettier nos paths de cada autor e relatar typecheck/build bloqueados
pelo Clock ausente sem corrigir essa fronteira nem fabricar PASS integral.

### Fixture dedicada, aceitação DB e liberação posterior

Somente após PASS SQL2 no candidato exato, Maestro coordena reconciliação
auditável da fixture em `detran_r7_ctg1_a2`, dedicado/descartável autorizado,
admin `aarusso`. Antes de alterar, registrar identidade/ownership, snapshot,
hashes e contagens da linha antiga e plano exato de substituição/versionamento
da fixture; conferir resultado e preservar evidência anterior. A receita deve
ser explícita e revisada em SQL2; se faltar, STOP reference-gap. Não aplicar
seed global para esconder configuração divergente: ON CONFLICT DO NOTHING
não corrige placeholder existente. Nenhuma sobrescrita silenciosa de parâmetro
ativo, backfill factual, seed dentro da transação DDL ou outro banco autorizado.
Confirmar uma única janela vigente aplicável e objeto JSON exato reconhecido.

Preservar a preflight fail-closed dos onze INSERTs canônicos (DDL05: um;
DDL14: dez): baseline deve coincidir com suas fontes. Divergência bloqueia,
sem relaxar comparação nem introduzir crescimento de catálogo neste recorte.
O low SQL1 de Clock permanece tarefa posterior e impede alegar build/runtime
PASS; o low de catálogo exige essa confirmação antes do ensaio. A exceção Owner
do único `role_rait_priority_writer` continua exatamente nos atributos/permissões
já aprovados; nenhum outro role é alterado. Provar ownership postgres/aarusso
e equivalência fresh/upgrade, sem usar admin como principal de request.

Retomar TASK-0028 na mesma 1/1, sensor congelado e SQL2 hashes conferidos, com
o comando integral de integração vigente, sem filtro de nome, skip ou coleta
zero. Exigir todos os cenários anteriores mais os novos positivos/negativos,
preservar snapshot do upgrade antes do fresh descartável e demonstrar rollback,
reapply, locks, ACL/RLS, imutabilidade e equivalência. Mudança de bytes exige
revisão correspondente antes de novo ensaio; nenhum retry/reset automático.
Somente **PASS DB integral** permite concluir TASK-0030 e seguir 0024 → 0025 →
preflight → 0020/0021 iteração 4 → 0022 → delivery-review. Geração pré-DB não
libera nenhuma dessas etapas. Os gates OpenAPI manual/gerado continuam exigidos.

Política legal/Clock, F1–F8, 90/17, seis providers, 14 comandos mais protocolo,
TASK-0020/0021 3/4, TASK-0023 2/2, TASK-0028/0029 1/1 permanecem. Escritor único,
banco serializado e fronteiras de R-0010 preservados. Maestro é responsável
pelos artefatos operacionais e evidência DEVAI; esta autoria limita-se ao presente
contrato e ao relatório de sequência. Não executa produto, geração, SQL, DB,
commit, push, PR ou merge e não declara encerramento de R-0007.

## Exceção posterior do OWNER — SQL2, 2026-09-17

ADR-0026 prevalece **somente** sobre as condições anteriores que exigem
veredito independente `PASS` de SQL2 antes do ensaio dedicado. O parecer SQL2
real é `REVIEW` válido; o OWNER aceita o candidato
`1fb5e9a0ea7182d252aeb570abb18df093078a2e2d0e8fb0464725a85e9e5943`
com dispensa do high relativo à elegibilidade automática de prioridade legada
`NULL`/desconhecida. Não alterar o JSON do revisor nem declarar conformidade com
ADR-0024 nesse ponto. TASK-0036/0037 não serão executadas para este candidato.

Todos os outros gates desta seção permanecem: preflight e reconciliação
auditável da fixture, hash dos bytes de produto, TASK-0028 DB integral com
coleta positiva, segurança, rollback, imutabilidade e equivalência, depois
TASK-0030 e tarefas subsequentes. O relatório e PR devem identificar
explicitamente `OWNER-ACCEPTED-WITH-WAIVER` e o risco residual.
