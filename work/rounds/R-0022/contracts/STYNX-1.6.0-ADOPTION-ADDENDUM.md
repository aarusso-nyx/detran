# D-160 — adenda prospectiva de adoção STYNX 1.6.0 em R-0022

Papel: **Architect**, Constituição Arts. 6–10. Data: 2026-10-12.
Autoridade: `AUTHORIZATION.md` B17 e `plan.md` A7. Complementa CTG-0002/0006/0008/0009;
critérios e decisões anteriores continuam vinculantes salvo a versão explicitamente substituída.
Este é o contrato de uma retomada parcial; não é atestado de integração nem fechamento.

## D-160.1 — identidade e fontes

Base DETRAN: `9af7682479fd338b0c81bf56548d21b3021cdf76` da campanha
`orchestra/stynx-sse-tenancy`. Mudanças isoladas em `codex/detran-r22-adoption-160`;
checkout primário e PR #179 preservados. Siblings são referências somente leitura.

- [Release final 1.6.0](https://github.com/stynx-nyx/stynx/releases/tag/v1.6.0), source
  `60e53ad791a4d031ab137a344fd994fe97bcb514`, tree
  `9249c9325558da557f3f13170941efa2d148fdf8`,
  [run 38272270054](https://github.com/stynx-nyx/stynx/actions/runs/38272270054).
- Estado publicado e obrigações consumidoras consultados nos comentários
  [#317](https://github.com/stynx-nyx/stynx/issues/317#issuecomment-6134181745),
  [#318](https://github.com/stynx-nyx/stynx/issues/318#issuecomment-6134182613),
  [#320](https://github.com/stynx-nyx/stynx/issues/320#issuecomment-6134180826) e
  [#319](https://github.com/stynx-nyx/stynx/issues/319#issuecomment-6134183556).
  A verificação independente de 44/44 pacotes é evidência upstream reportada nesses registros;
  não substitui a identificação dos pacotes efetivamente instalados no DETRAN.
- Fontes de contrato lidas no source imutável acima:
  [upgrade](https://github.com/stynx-nyx/stynx/blob/60e53ad791a4d031ab137a344fd994fe97bcb514/docs/adopters/stynx/upgrade-1.6.0.md),
  [consumer storage](https://github.com/stynx-nyx/stynx/blob/60e53ad791a4d031ab137a344fd994fe97bcb514/docs/framework/contracts/consumer-storage.md),
  [offline API/V-check](https://github.com/stynx-nyx/stynx/blob/60e53ad791a4d031ab137a344fd994fe97bcb514/docs/framework/contracts/offline-sync-api.md),
  [offline import](https://github.com/stynx-nyx/stynx/blob/60e53ad791a4d031ab137a344fd994fe97bcb514/docs/framework/contracts/offline-storage-import.md),
  [outbox API](https://github.com/stynx-nyx/stynx/blob/60e53ad791a4d031ab137a344fd994fe97bcb514/docs/framework/contracts/outbox-api.md) e
  [signature ADR](https://github.com/stynx-nyx/stynx/blob/60e53ad791a4d031ab137a344fd994fe97bcb514/law/adr/ADR-SIGNATURE-0002-minimal-lta-and-profile-sets.md).
- Fonte de símbolos executáveis: tarballs finais 1.6.0 do registry, seus manifests,
  `.d.ts`, SQL e templates/manifestos digest-bound instalados. Registrar nome/versão,
  integridade e hash de cada artefato usado. O source sibling não é dependência runtime.
  Divergência entre contrato, tarball e instalação → checkpoint antes da integração afetada.

### Fontes 1.6.0 efetivamente examinadas nesta emissão

Tarballs do registry recebidos em `scratch/r22-adoption-160/published/`; SHA-256
recalculado pelo Architect em 2026-10-12. As declarações abaixo foram lidas dos tarballs
extraídos; ainda exigem comparação com a resolução `node_modules` final do consumidor.

| Pacote/arquivo                          | SHA-256                                                            |
| --------------------------------------- | ------------------------------------------------------------------ |
| `@stynx-nyx/data@1.6.0` tarball         | `82a48dd4108949546eafd15df82d5250ae2e384c96975b6bd983fc37010edbff` |
| `@stynx-nyx/outbox@1.6.0` tarball       | `7853d70917acf114c48dae8799c4a420b38ee406e429767e9bafbd7727868a40` |
| `@stynx-nyx/offline-sync@1.6.0` tarball | `08672290ee0b9364c85ff1a60a1ece4d92c934c058c66023e120a3875a53f2ba` |
| `@stynx-nyx/signature@1.6.0` tarball    | `49f667f0d135c4c2a00e50d0e51cde1f7e9bee00d223f1be112dd1a9591eba6c` |
| `data/src/storage-contract.d.ts`        | `2a415dc6dc147948faa4880838e4bd63615cb5c31b2ce0da61b936c39971a5eb` |
| `outbox/src/storage.d.ts`               | `428f1a0a9c4d50c75fd5bb7de432a111b03a099e2163d305aba006e27e928a97` |
| `outbox/src/outbox.service.d.ts`        | `97ba013a8f4a49c8e63892cd499cfe91662366f989d9581dea96e30214902380` |
| `offline-sync/src/storage.d.ts`         | `92ca39b932cad2863b81175fdd805dccd8b70011f1b6e6106331f2aa806c55dc` |
| `offline-sync/src/types.d.ts`           | `d5a461b4d7f8ecdb2fb4e2b53ecdcb31cac29f77a06d3a4a12f35d45169bfbe8` |
| `signature/src/cms-trust-verifier.d.ts` | `9ab648cfa09067f6eeabd27848aa23527482e01af4cc05cdf4b616d568b9e715` |
| `signature/src/types.d.ts`              | `887602e6fc2e6f293f8a1c84ddab909d3670cf487bb7338c2f74242a9fe85a57` |

Declaração e implementação da montagem sem controllers examinadas nesta clarificação:

- `offline-sync/src/offline-sync.module.d.ts` — SHA-256 `552fc2c0033b05a16d1f962b75b0493ea35891e1b0531333ec591970a5f42a7b`.
- `offline-sync/src/offline-sync.module.js` — SHA-256 `f3ad6aed5eeb11c23ee4e474f87ba326fbf0b31f0c3fd29fbebb214b60f99d25`.

`data/src/tokens.d.ts`, declaração examinada de `appRoleName` — SHA-256
`f03f2f26d7f252a0034c8fc226db26ba5659ec28fb5179ceee1b6d670c3b2741`.

`StorageRoleBinding`/`StorageBindingOptions` e `StorageVerificationReport` vêm de
`data/src/storage-contract.d.ts`; ambos os módulos exportam render/verifier em
`storage.d.ts`. `outbox.service.d.ts` confirma os nove métodos de controle tenant
listados em A160-04a. `offline-sync/types.d.ts` confirma `initialQueueStatus`,
`payloadHashPort`, `preApplyDetector`, `OfflineSyncItemContext.receiptId` e o resolvedor
`resolve(scope, operation)` sem argumento de agente de negócio.

`signature/types.d.ts` confirma `qualifiedPolicies` separado de `acceptedPolicies`,
perfis B-T/B-LT/B-LTA e `trustProfiles`; `cms-trust-verifier.d.ts` confirma
`archiveTsaTrustAnchorsPem` e `readinessChallenge`. Nenhum OID é escolhido aqui.
Se a representação normativa atual não guardar uma distinção exigida pela fonte aprovada,
a extensão passa por Architect antes do wiring de produção, nunca pela reutilização de
`accepted_policies` como se qualificasse o certificado automaticamente.

## D-160.2 — contrato de instalação e fronteira de atuação

**A160-01 — pin exato.** O Engineer muda a fonte única `tools/stynx-version.json`, os
manifestos do grupo fixo já usados no workspace e o lockfile para **1.6.0**. Nenhum range,
`latest`, pacote local ou 1.6.1. O pin não dispensa a caracterização anterior e posterior.

**A160-02 — storage aditivo do pacote.** Usar `renderOutboxStorage`/`renderOfflineStorage`
do pacote instalado para emitir os objetos e role bindings do inventário fechado, sem
reescrever migrações históricas nem construir uma cópia artesanal do schema. Registrar o
artefato e seu hash; conferir identidade antes de aplicação. Configurar separadamente:

- tenant table `{ schema: 'auth', table: 'tenants', column: 'id' }`;
- app role `role_app_backend`, preservando NOLOGIN/NOINHERIT/NOSUPERUSER/NOBYPASSRLS;
- owner distinto e explicitamente identificado na instalação e na conexão verificadora;
- `readerRole: null` enquanto nenhum reader específico for necessário. `role_auditor_min`
  não recebe grants de storage apenas por já existir.

O login de teste restrito é descartável, sem owner/BYPASSRLS/superuser, com somente o vínculo
necessário à identidade de app; sua existência não muda a role operacional NOLOGIN. Provar
as identidades reais e a cadeia de privilégios. Não atribuir acesso owner à app para
satisfazer o verificador. Ownership e políticas precisam permitir ao owner do verificador
visibilidade completa (`row_security_active=false`) e à app somente o contrato tenant.

A aplicação entra na ordem explícita do instalador DETRAN antes de uso dos objetos novos,
com reaplicação idempotente, sem alterar `audit.*`. Artefato que exige instrução não aceita
pelo preflight → checkpoint; não enfraquecer `apply.sh`/gate como contorno. Nesta etapa é
permitida instalação **aditiva em banco descartável exclusivo**; nenhum dado `ops.*` ou
`integration.*` é transferido, congelado, apagado ou reclassificado por este ato.

**A160-03 — verificação live.** Executar `verifyOutboxStorage`/`verifyOfflineStorage` com o
mesmo binding do render, em transação live já read-only e `current_user` do owner configurado.
Exigir `supported=true` e zero checks `fail`/`unknown`, incluindo FORCE RLS, FK para tenant,
triggers internos, memberships/SET ROLE/PUBLIC, grants e imutabilidade. Verificador é
somente leitura; sua execução não repara o banco. Registro de catálogo sozinho não é PASS.
Falha fica nomeada e bloqueia o uso consumer-owned afetado.

**A160-04 — wiring fino.** O Engineer pode compor os símbolos publicados e as portas de
produto nos inventários existentes de CTG-0006 §1.2, CTG-0008 §1 e CTG-0009 §1, seus módulos
Nest/composition root, dependências workspace explícitas e tooling de instalação acima.
Não reproduzir store, replay, concorrência, resolução, reconciliação ou criptografia
STYNX em código DETRAN. `storageMode: 'consumer-owned'` da outbox não suporta
`cutoverLegacyMessages`; não chamar essa operação contra tabela customizada. O corte
suportado/transferência owner-only, se necessário, mantém as condições OD-R22-16 e exige
plano e prova antes da execução. A via de requisição continua tenant/ator/RLS, nunca owner;
a exceção nominal de controle outbox OD-R22-41/B6 continua estrita.

### A160-04a — lane aditiva de outbox (lista fechada)

Arquivo novo de Engineer: `backend/app/src/r22-stynx-outbox.adapter.ts`:

- `R22StynxEventAppender`: porta `append(tx, envelope)` existente, delegando ao
  `OutboxService.appendInTransaction` na transação recebida, sem abrir outra transação.
  Mapeamento de CTG-0008 §2.2: `entity=type`, `entityId=aggregate.id`, chave existente,
  payload envelope e `metadata.aggregateType`; tenant do contexto SQL confiável, nunca
  do envelope, conforme C-08-09/11. Sem inventar `payload.id` antes do append.
- `R22StynxOutboxTenantControl`: delegação explícita aos símbolos publicados
  `dispatchTenantEventsDue`, `ackTenantEvent`, `listEvents`, `getEventDelivery`,
  `listEventAttempts`, `getQueueHealth`, `retryEvent`, `retireEvent`,
  `getEventRetirement`. Nenhuma troca por operação owner nem fallback permissivo.
- `R22_OUTBOX_DESTINATION_SELECTORS`: somente RENACH `ch.renach.exam-result` e RENAEST
  `SINISTRO_TRANSMISSAO_PENDENTE`/`SINISTRO_RETIFICACAO_PENDENTE`, sem dispatcher novo.

**Inativo por composição nesta etapa:** nenhum wiring de `app.module.ts`, serviço de
transmissão, rota, produtor/SSE ou `SqlTeatEventOutbox` troca para essa classe. A lane prova
os seams publicados em isolamento de integração; não prova que cessaram as escritas da
aplicação em `integration.outbox`. O protocolo existente conserva sua caracterização.
A ativação/corte exige completar os M/C de CTG-0008 e sua sequência de dependências,
inclusive a reconstrução publicada no limite de leitura de CTG-0008 §2.2/C-08-09.
O appender isolado não demonstra essa leitura/SSE integrada.

Os resultados objeto de `RenachPort`/`RenaestPort` não são bytes originais de transporte.
Não reconstruir ACK/receipt ou headers/status/responseBody para preencher evidência ausente;
adaptação real de dispatcher e atomicidade com efeitos de domínio continuam checkpoint
quando não demonstráveis pelo contrato publicado. Destino sem transporte real autorizado
não ganha fake dispatcher. A inclusão de métodos é condicionada ao `.d.ts` final instalado;
símbolo ausente/divergente é reportado, nunca implementado por cópia local.

### A160-04b — geração e instalação de storage (lista fechada)

Clarificação prospectiva de 2026-10-12, antes da atuação de Engineer nesses arquivos:

| Caminho                                     | Alteração permitida                                                                                                                                                                                                                   |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tools/generate-stynx-storage.mjs`          | Gerador determinístico dos dois render APIs instalados 1.6.0, com modo normal de geração e `--check` somente leitura que falha em ausência/divergência.                                                                               |
| `backend/database/ddl/19-stynx-outbox.sql`  | Saída derivada exclusivamente de `renderOutboxStorage`: objetos e role bindings do contrato fechado; nunca editar SQL gerado à mão.                                                                                                   |
| `backend/database/ddl/19-stynx-offline.sql` | Saída derivada exclusivamente de `renderOfflineStorage`: objetos e role bindings do contrato fechado; nunca editar SQL gerado à mão.                                                                                                  |
| `backend/database/stynx-storage.json`       | Manifesto derivado com versão/package identity, binding explícito, identidade dos templates/manifestos fornecidos pelo pacote e hashes das saídas; não é configuração normativa de confiança.                                         |
| `backend/database/apply.sh`                 | Acrescentar exatamente os dois nomes SQL ao inventário fechado/ordem e executar o gerador `--check` antes de qualquer conexão; preservar todos os preflights, transação, allowlists de banco descartável e demais recusas existentes. |
| `package.json` raiz                         | Acrescentar somente scripts de geração e verificação que chamam `node tools/generate-stynx-storage.mjs` e sua variante `--check`; restante do pin conforme A160-01.                                                                   |

Binding fixo desta instalação descartável: `ownerRole: 'postgres'`,
`appRole: 'role_app_backend'`, `readerRole: null`, tenant table
`{ schema: 'auth', table: 'tenants', column: 'id' }`. O owner `postgres` corresponde à
fronteira de manutenção já exigida pelo preflight DETRAN; isso não concede esse papel
à conexão de app nem aprova sua utilização em requisições ou ambientes externos.
Não aceitar override por variável/argumento que transforme esses artefatos em outro binding
sem uma nova revisão do contrato. O gerador não abre conexão nem executa DDL; `--check`
nunca regenera/repara seus inputs. Não acrescentar `audit.*` ou grants amplos a essas saídas.

Cada saída inclui cabeçalho de proveniência e é produzida pelo gerador; guardas/DDL históricos
ficam intactos. Se as saídas renderizadas não passam pelo parser/preflight existente, parar
no checkpoint em vez de aceitar transação aninhada, statement proibido ou inventário aberto.
A inspeção live A160-03 e os testes comportamentais permanecem exigidos; `--check` sozinho
prova apenas identidade/freshness, não grants, RLS ou suporte do banco.

### A160-04c — montagem offline sem ativação do protocolo

Alteração aditiva permitida em `backend/app/src/app.module.ts`: importar o símbolo publicado
`StynxOfflineSyncModule` e acrescentar somente
`StynxOfflineSyncModule.forRoot({ mountControllers: false })` aos imports Nest.
Não fornecer TTL literal, `store`/`context` alternativos, resolvedores/política presumida,
controllers, worker/job, aliases de provider ou consumo novo por rota/serviço de produto.

O `.d.ts` publicado declara `forRoot(options?: StynxOfflineSyncModuleOptions)` e o JS
1.6.0 examinado omite controllers quando `mountControllers=false`. A montagem instancia
providers de serviço/store da plataforma; **não substitui o store ativo DETRAN**, não
seleciona CTG9 (nenhum `policyResolver` aqui), não chama operação de reserva/sync e não
transfere dados. E6 com defaults montado sem controllers não é evidência de paridade CTG9.
O uso de operações duráveis pela aplicação espera a composição/política tenant apropriada,
os checkpoints V-check e a caracterização integral. A opção não altera DI de assinatura.

Falha já observada na linha de base de DI de assinatura, papel ou transição permanece
checkpoint com reprodução/identidade preservadas. Esta montagem não autoriza dummy provider,
remoção de guard/assertion, reparo incidental desses defeitos ou declaração de baseline verde.

### A160-04d — identidade explícita do pool de aplicação

Alteração permitida em `backend/app/src/detran-runtime.ts`, exclusivamente no objeto
retornado por `detranDataOptions()`: declarar `appRoleName: 'role_app_backend'` no nível de
`StynxDataModuleOptions`, conforme `data/src/tokens.d.ts` final 1.6.0. A opção vincula a
identidade SQL já exigida no DETRAN; não muda role, grants ou esquema e não fornece token
ou credencial. Os pools continuam usando as fontes de conexão confiáveis atuais.

O login restrito descartável deve chegar como `session_user` não privilegiado e
`current_user=role_app_backend`, via opção PostgreSQL/SET ROLE autorizado desse principal.
A observação verifica ambos e propriedades reais; o nome configurado não é prova de role.
Não usar login `postgres`/owner/superuser/BYPASSRLS seguido de SET ROLE para simular a app,
nem silenciar `ensureAppRole` ou suas recusas. A fallback local preexistente, se privilegiada,
falha fechada e é registrada, não convertida em caminho aceito.

### A160-04e — incompatibilidade do sensor de cobertura RLS

`tools/check-rls-ddl.ts` na base só reconhece sinais `auth.create_rls_policy` para tabelas
`tenant_id` não isentas. Os renderers usam suas próprias políticas fechadas. **Nenhuma
alteração desse sensor está autorizada nesta retomada.** Não acrescentar outbox/offline à
lista de isenções, inserir sinal textual falso ou chamar a helper para substituir as
políticas publicadas. Rodar o gate e registrar a incompatibilidade se reproduzida.
O parser atual também não reconhece nomes de CREATE TABLE entre aspas; um PASS por omissão
não estabelece cobertura dos objetos novos. O inventário de tabelas esperado precisa ser
confrontado com a saída, além dos verificadores live obrigatórios de A160-03.

Uma extensão futura pode representar cobertura equivalente por manifesto exato, sem
isenção, mediante contrato F1 próprio e autoria F3 do Inspector: identificar todos os
objetos tenant, admitir somente identidade/bytes do pacote e binding autorizados,
exigir ENABLE/FORCE RLS, política tenant/grants fechados e verificação live independente,
e demonstrar negativos de tabela/manifesto/política ausente, stale, alterado ou desconhecido.
Essa proposta não autoriza editar o gate agora nem proclamar sua equivalência previamente.
Enquanto o sensor não cobrir corretamente os objetos novos, a integração completa conserva
checkpoint, mesmo se os testes focados do storage passarem.

### A160-04f — contexto de instalação isolado por arquivo (rehearsal)

Após o Inspector confirmar as recusas de catálogo em `*.id` e o default efetivo
`public.gen_random_uuid()` na primeira instalação, o Engineer pode ajustar somente o
contexto de aplicação dos **dois novos** arquivos em `backend/database/apply.sh`:

1. Imediatamente antes de cada `-f` de `19-stynx-outbox.sql` ou `19-stynx-offline.sql`,
   executar `SET LOCAL search_path = pg_catalog, public` na mesma transação de aplicação.
2. Imediatamente depois de cada arquivo, restaurar `SET LOCAL search_path = public, pg_catalog`,
   que continua sendo o contexto preexistente dos demais DDL DETRAN.
3. Reproduzir em **segundo banco descartável exclusivo novo**, com seu nome e logs retidos;
   comparar catálogo/defaults e repetir os mesmos verificadores live sem alterar entradas.

Isso é uma delimitação do contexto de instalação de A160-04b, não modificação do SQL/template
publicado, reparo do primeiro banco por ALTER, relaxamento/normalização do verificador ou
mudança global de search_path. Preservar os reports RED e o primeiro banco como testemunhas;
a hipótese de resolução do default só é estabelecida por nova observação do Inspector.
A verificação pode continuar recusando outros objetos; nenhum resultado é presumido.
Mesmo um PASS completo de runtime após esse rehearsal mantém o STOP do gate RLS estático.

### A160-04g — saídas já autorizadas do blueprint normativo

A regeneração do pin revelou saídas ainda em v1.1.0 enquanto a referência já era
`BP-INF-NORMATIVE-001` **v1.2.0**, introduzida no commit de campanha
`e129b8357f174f177e84032d4925e8e36a585403` (TASK-0029/D0), ancestral da base desta retomada.
A inspeção de `backend/database/ddl/30-inf-normative.sql` e
`backend/domains/inf/normative/src/entities/signature-policy.entity.ts` confirma os campos
revisão/vigência/norma anuláveis e agência anulável de CTG-0006 A.2/C.6, sem valores de
produção novos. Os demais arquivos gerados do mesmo módulo atualizam seu header de origem.

**Disposição Architect:** reter essas saídas derivadas produzidas pelo gerador inalterado
no candidato isolado; não restaurar a geração correta aos bytes obsoletos de v1.1.0 nem
editar o gerado à mão para mascarar o drift. Isso materializa referência já autorizada,
não aprova política, amplia API por decisão nova ou declara concluída TASK-0009 parte D.
A mudança de schema gerada deve continuar explicitamente distinguida do delta de manifestos.

O checkpoint de parte D permanece: guardas manuais de imutabilidade/piso, índice de revisão
com NULLS NOT DISTINCT e remoção do índice antigo, nullable ALTER no banco existente,
revogações finais, idempotência de seed e OpenAPI regenerado exigidos por CTG-0006 C.6.
Reter os outputs nesta worktree não autoriza integrar uma parte D incompleta, transferir
normas ou ativar fluxos de assinatura; os negativos e os dados normativos NULL seguem
fail-closed. Nenhuma mudança no blueprint ou no gerador é autorizada por esta constatação.

## D-160.3 — observações de aceitação pelo Inspector

Autoria F3 exclusiva do Inspector: arquivos novos
`backend/app/tests/integration/r22-stynx-160-storage.integration.spec.ts` e
`backend/app/tests/e2e/r22-stynx-160-adoption.e2e.spec.ts`; suporte `r22-*` sob
`backend/app/tests/` apenas para identidades/tenants e preparação descartável. Se a execução
exigir outro sensor/configuração de intenção, registrar ampliação antes da edição.
Engineer não edita F1/F3; Inspector não define novos requisitos nem corrige produto.
Nenhum teste anterior é removido, enfraquecido, invertido em `it.fails` ou substituído por mock.

| Obrigação             | Observação exigida                                                                                                                                                                                                                                                        |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A160-05 SQL real      | Capturar `session_user`, `current_user`, `app.tenant_id` e `app.actor_id` na mesma transação/SQL da operação real; não aceitar propriedade de objeto como prova da role. Distinguir business `agent_id` de audit actor.                                                   |
| A160-06 isolamento    | Login restrito direto e segundo tenant autenticado; A não lê/grava/ACK/aposenta/reproduz efeitos de B. Observar também SQL/contagens antes/depois; HTTP 403 sozinho não prova ausência de escrita. Sem mock do storage/contexto/role.                                     |
| A160-07 imutabilidade | UPDATE/DELETE da história protegido recusado pela app; provas com e sem contexto; FK e FORCE RLS confirmadas no catálogo e por comportamento. Sem grant/ownership oculto por SET ROLE.                                                                                    |
| A160-08 outbox        | append/leitura/SSE/idempotência, destinos A/B, sem destino e queue health; `retireEvent` com ator/motivo/chave e recibo, lease ativo recusado, trilha preservada, agregado liberado e nenhuma claim/retry/reentrega. RETIRED nunca é ACK nem entrega externa.             |
| A160-09 offline       | Testar somente seams publicados não bloqueados: reservas nullable/colisão/replay, pending, hash e consultas de recibos/listas, preApplyDetector/handoff e contexto do item. Nenhum switch da rota/store antes da paridade integral. Registrar cada V-check separadamente. |
| A160-10 preservação   | Reexecutar C-06/C-08/C-09 aplicáveis, HTTP TEAT/BOAT, tenancy, SSE e baseline RLS; zero skip/coleção vazia. Pin verde não prova migração, e teste de pacote upstream não substitui teste consumidor.                                                                      |

Comandos novos focados (coleta obrigatória):

```sh
pnpm --filter @detran/app test:integration --passWithNoTests=false tests/integration/r22-stynx-160-storage.integration.spec.ts
pnpm --filter @detran/app test:e2e --passWithNoTests=false tests/e2e/r22-stynx-160-adoption.e2e.spec.ts
```

Os acceptance commands existentes dos CTGs e os gates retidos continuam válidos na fase
apropriada; não executar k6/mutation. Os novos sensores podem demonstrar capacidade parcial;
se um MUST falha, seu checkpoint permanece mesmo com os demais casos verdes.

## D-160.4 — ledger inicial de obrigações e bloqueios

Este ledger é **prospectivo**, sem resultados locais presumidos. A observação executada
leva SHA DETRAN, versão/integridade instalada, comando, banco descartável e artefatos de
saída com hashes; referência de relatório não ratifica automaticamente aceite F1.

| Item                     | Estado nesta emissão    | Evidência que falta para promoção                                                                                                                                                                   |
| ------------------------ | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A160-01 pin              | PENDING_LOCAL           | Pin/lock/instalação exatos e caracterização comparável.                                                                                                                                             |
| A160-02/03 storage       | PENDING_LOCAL           | Artefatos renderizados 1.6.0 + bindings + dois reports live integralmente pass.                                                                                                                     |
| A160-05/06/07 SQL/roles  | PENDING_LOCAL           | Login restrito, segundo tenant autenticado e observações SQL reais positivas/negativas.                                                                                                             |
| CTG-0008 / UPS-OBX-10/11 | PENDING_LOCAL           | Adapters, retirement, destinos, HTTP/SSE, storage e tratamento real das entregas antigas.                                                                                                           |
| CTG-0009 V-03            | BLOCKED_UPSTREAM (#317) | Contexto estruturado expected/received/deviceBatchId; não extrair de mensagens.                                                                                                                     |
| CTG-0009 V-04            | BLOCKED_UPSTREAM (#317) | Contexto de erro de domínio preservado no recibo; sem reconstrução local.                                                                                                                           |
| CTG-0009 V-07            | BLOCKED_UPSTREAM (#317) | Sinal estruturado da janela sem fonte; log não equivale ao código exigido.                                                                                                                          |
| CTG-0009 V-08            | BLOCKED_UPSTREAM (#317) | Evento de resolução produzido no substrato/mesma fronteira transacional.                                                                                                                            |
| CTG-0009 V-10            | BLOCKED_UPSTREAM (#317) | Transporte autorizado e demonstrado do agente de negócio distinto do ator autenticado.                                                                                                              |
| CTG-0009 V-13            | BLOCKED_UPSTREAM (#317) | Registro durável separado da reconciliação.                                                                                                                                                         |
| CTG-0009 V-05            | PENDING_MAPPING         | Recibo `stynx` obtido por lookup/lista publicado, preservado no replay; submit não o contém.                                                                                                        |
| CTG-0009 demais V/MUST   | PENDING_LOCAL           | Ledger integral, usage_mode e mapeamento lossless, import/migração e ACK original. Sem encerramento por amostragem.                                                                                 |
| CTG-0006 provedor        | BLOCKED_EXTERNAL        | Identidade produto/versão, PDF autorizado não sensível da cadeia real, SHA-256, chains e revogação; demonstrar exatamente uma revisão DSS e um document timestamp, nenhum posterior.                |
| CTG-0006 norma           | BLOCKED_EXTERNAL        | Por UF/espécie: revisão/vigência, source_ref, autoridade/data de aprovação, piso aprovado, níveis/PAdES/TSA/LTA/revogação/tempo, OIDs aceitos/qualificadores e âncoras públicas/fingerprints reais. |
| CTG-0006 readiness       | BLOCKED_EXTERNAL        | Challenge real por revisão, sob todas as semânticas solicitadas, âncoras archive TSA explícitas, M-06-P no pacote instalado. Sem fallback de âncoras signature TSA.                                 |
| CTG-0006 caminho bytes   | CHECKPOINT_C0           | Decisões/entrada de bytes de CTG-0006 C.0/C.5 antes de chamar o escritor em produção.                                                                                                               |
| R-0022 closure/readiness | NOT_ESTABLISHED         | Paridade integral, gates retidos e review independente. Esta adenda não fecha rodada/issues.                                                                                                        |

Os seis gaps de #317 são trabalho STYNX 1.6.1; sua correção não está nesta árvore nem no
1.6.0 instalado. Não consumir API futura, fabricar contexto/evento/registro nem reduzir
MUST para alegar progresso. A existência dos símbolos novos remove uma premissa histórica
de ausência de API, mas não promove o comportamento consumidor a PASS.

OD-R22-07/B5 decide o app como escritor único; OD-R22-08/B6 decide a estrutura, não valores;
OD-R22-66/B16 decide sourcing do piso/challenge, não OIDs/âncoras. Não reabrir essas decisões.
Fixtures real-PKI **de teste** servem apenas para comportamento e negativos; não autorizam
provedor ou norma. O bundle anteriormente referido em `/private/tmp/detran-r22-signing-discovery-20261010`
precisa ser localizado e revalidado antes de qualquer reuso; disponibilidade não é presumida.
Não pedir chaves privadas/tokens, usar dados sensíveis ou contatar custodiante sem autorização.

## D-160.5 — stop e integração

STOP no escopo afetado por versão/artefato divergente, role privilegiada no request path,
verificador fail/unknown, falta de paridade ou contorno de gap. Vazamento entre tenants →
parada imediata da rodada e relato, como o plano vigente. Mudança de baseline/campanha é
revalidada, nunca resetada. Achado de produto em main segue B9 com tríade/hotfix próprio.

Nenhum commit/PR/merge/push/publicação é executado por este contrato. Resultados seguem
review e integração normal autorizados ao maestro; evidência governada somente pelo
`pnpm exec devai evidence record` instalado/pinado, sem edição manual de `record/` ou estado.
A retomada não migra DEVAI nem altera `.devai/config`; versões/falhas da ferramenta são
registradas e encaminhadas pelo seu próprio limite de autoridade.

## D-160.6 — suplemento factual de execução (2026-10-12)

Registro pelo Architect de observações encaminhadas pelo maestro e confrontadas com os
artefatos/logs abaixo. **Não altera o contrato prospectivo, não ratifica aceite e não
promove os estados iniciais de D-160.4 a PASS.** As novas observações de runtime do
Inspector ainda estavam pendentes nesta emissão. Os logs `scratch/` são custódia de
trabalho, não evidência governada emitida por `devai evidence record`.

| Observação                            | Resultado e limite                                                                                                                                                                                                                                                                                                                                           |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Geração instalada 1.6.0               | Gerados os dois arquivos SQL e `stynx-storage.json` por A160-04b. O manifesto identifica packages 1.6.0/contract 1.0.0 e binding postgres/role_app_backend/reader null/auth.tenants(id). O Architect executou `node tools/generate-stynx-storage.mjs --check`: exit 0, `verified 3 artifacts (1.6.0)`. Isso prova freshness dos artefatos, não suporte live. |
| Aplicação aditiva normal              | `storage-160-apply.log` termina com `apply.sh: done (full=0 db=detran_r22_adoption160_20261012)`. A execução relatada pelo maestro limitou-se a esse banco descartável exclusivo; não foi reset `--full`, corte de protocolo, importação de dados ou integração de ambiente externo.                                                                         |
| Gate estático RLS                     | `pnpm verify:rls-ddl` **FAILED**, exit 1, com 13 tabelas sem sinal `auth.create_rls_policy`. O log reproduz exatamente o tipo de incompatibilidade previsto em A160-04e. `tools/check-rls-ddl.ts` permanece sem diff; as saídas geradas permanecem idênticas às do render. **Integração STOP/checkpoint.**                                                   |
| Linha de base outbox                  | Execução identificada pelo maestro como baseline 1.5.0: caracterização outbox, 30 testes PASS/1 arquivo PASS, em `baseline-outbox.log`. Não é resultado da migração 1.6.0.                                                                                                                                                                                   |
| Linha de base e2e com URLs explícitas | Execução identificada pelo maestro como baseline 1.5.0: 55 PASS/24 FAIL, 1 arquivo PASS/3 FAIL, em `baseline-e2e-explicit-runtime.log`. O log confirma DI de `SignatureService` ausente, controles que observam `current_user=postgres` em vez de `role_app_backend`, e falhas de transição offline. Não apresentar esta baseline como verde.                |
| Runtime da adoção                     | PENDING: aguarda resultados e custódia do Inspector para A160-03 e A160-05…10. Nenhum resultado positivo posterior elimina o gate estático que falhou.                                                                                                                                                                                                       |

Tabelas nomeadas no FAIL: `offline.numbering_ranges`, `offline.numbering_reservations`,
`offline.sync_conflicts`, `offline.sync_queue_items`, `outbox.acknowledgements`,
`outbox.event_acks`, `outbox.event_attempts`, `outbox.event_delivery`,
`outbox.event_retirements`, `outbox.events`, `outbox.legacy_event_map`,
`outbox.messages` e `outbox.tenant_clock`. A lista é o diagnóstico do sensor atual, não
uma declaração de inventário completo da plataforma nem prova de ausência de RLS live.

Hashes SHA-256 recalculados pelo Architect nesta emissão:

| Artefato/log                                                 | SHA-256                                                            |
| ------------------------------------------------------------ | ------------------------------------------------------------------ |
| `backend/database/ddl/19-stynx-outbox.sql`                   | `902d521fd1c2040ae179bcb53bf929ef3ac2ec27d9ff2f03b5a9e2b6e78c188f` |
| `backend/database/ddl/19-stynx-offline.sql`                  | `8a692ca66905dfaf8c099349d0a0441472104f1406d009d4c0c226665ad5bafa` |
| `backend/database/stynx-storage.json`                        | `e73c900f85e9aa027cd8a3898129130ca71b763db0d093b2979e963daf1fd260` |
| `scratch/r22-adoption-160/storage-160-apply.log`             | `34a9c5c0bb057c55d1c5f6004c8cb3229db9a370f41e6c10545e91b19282d1c7` |
| `scratch/r22-adoption-160/rls-ddl-160.log`                   | `a9f3570beca8aa0d622a6454b66e9530996dd66102bb87c7850764ed9d33d838` |
| `scratch/r22-adoption-160/baseline-outbox.log`               | `f53e0f95554d262343ba6ae54a0375d9653bd27bf9ba0602bd8a11f547d59b10` |
| `scratch/r22-adoption-160/baseline-e2e-explicit-runtime.log` | `3dc825760aba78fce48a9b00fec577e50126f55e6a7e2c7111f50cad99d0ae6f` |

Não foram alteradas assertions existentes para tornar esses resultados verdes. O maestro
relata nenhuma execução k6/mutation e nenhum commit/push/PR desta retomada até este ponto.
Esta sessão Architect apenas registra o observado; não concede contorno ao gate, não
corrige DI/papel/transição e não autoriza ativação do protocolo ou fechamento. Os checkpoints
upstream/externos, a separação de papéis e as condições de integração permanecem integrais.

### D-160.6.1 — primeiros resultados runtime do Inspector

Observação posterior ao snapshot PENDING de D-160.6, preservado como histórico:
Inspector relata **3 PASS/2 FAIL** no sensor de storage. Identidade de login restrito,
negação RLS entre tenants/sem contexto e imutabilidade de eventos passaram nesses casos;
isso não promove a obrigação integral de dois tenants autenticados, retire/lease/retry,
HTTP/SSE ou migração completa a PASS.

Os reports examinados pelo Architect mostram `supported=false` em ambos os módulos,
packageVersion 1.6.0: seis defaults UUID recusados na outbox e quatro no offline,
`expected.sha256=f716a522629b39b1e6adc0fe16e0060982461ca7b14c0809495a6ec21d23ced8`,
`actual.sha256=28a31648a45e60c1ad743dc08b59f63153b5a58c226bcf62f3c8c5f17a53706a`.
`default-diagnosis.json` identifica PostgreSQL 18.2 e `public.gen_random_uuid()` nos
dez defaults. A160-04f define apenas o rehearsal para investigar/corrigir o contexto
antes da criação em um banco novo; não transforma estes reports em PASS.

| Report/diagnóstico original                                        | SHA-256                                                            |
| ------------------------------------------------------------------ | ------------------------------------------------------------------ |
| `scratch/r22-adoption-160/inspector/outbox-storage-verifier.json`  | `2bd18c9502832c61b93f1d19a8482a9aadb6a39eab8d9a4d4552e2f6c49a5f51` |
| `scratch/r22-adoption-160/inspector/offline-storage-verifier.json` | `ea897d705f0d41d7beb9c154a2c02a955c94e7cf794bf8719a2395992ffef7de` |
| `scratch/r22-adoption-160/inspector/default-diagnosis.json`        | `4e81c6b44b197282a37d756d8c99ababf4140b748103728f8207b74ed2d06107` |

Os resultados de segunda instalação e demais runtime witnesses ainda são pendentes.
O gate RLS estático permanece FAIL/STOP independentemente deles; nenhuma conclusão
parcial substitui a aprovação de amostra do provedor, trust values ou MUST upstream.

### D-160.6.2 — snapshot final delimitado, sem ratificação de integração

Fonte: maestro e `scratch/r22-adoption-160/inspector/INSPECTOR-REPORT.md`, revisto após
o resultado de reaplicação. Observação em 2026-10-12; todos os snapshots anteriores,
inclusive os reports RED originais, permanecem históricos. Este suplemento registra
resultados e bloqueios; não altera MUST, não declara parte D completa e não promove
readiness/fechamento. Os estados iniciais de D-160.4 são referência prospectiva, não o
relato de uma execução final aprovada.

**Identidade observada:** branch `codex/detran-r22-adoption-160`, HEAD/base ainda
`9af7682479fd338b0c81bf56548d21b3021cdf76`, sem commit candidato. O manifesto F2/F3
`source-candidate-manifest.json` identifica 115 arquivos alterados/novos, excluindo F1
para evitar circularidade; seu `contentManifestSha256` declarado é
`fd1b5b904935bc7fd8e19eaf6d9a323fced48ba0bd937a145e55eb3a02fbdb7b`.
O Architect recalculou o SHA-256/tamanho de cada um dos 115 membros contra a árvore
corrente: zero divergências. Trata-se de identidade de conteúdo de uma worktree
**não commitada**, não de Git tree/commit integrado ou atestado de release.

| Observação final                     | Resultado e alcance                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pin e instalação                     | `verify:stynx-pin` confirma todas as dependências STYNX 1.6.0. Instalação final e instalação frozen reportadas PASS; artefatos de storage ainda passam `--check`. Não consome 1.6.1.                                                                                                                                                                                                                                                                                         |
| Código e higiene focados             | App typecheck PASS; `runtime-unit-160.log` contém 12 PASS/1 arquivo PASS; formatação focada de 117 arquivos reportada PASS. Não é o gate completo da rodada.                                                                                                                                                                                                                                                                                                                 |
| Segundo rehearsal novo               | `detran_r22_adoption160_2026101202`, exclusivo e descartável: aplicação normal (`full=0`) e seed `profile=fresh` concluídos. A160-04f delimita o search_path somente aos dois novos arquivos; SQL/manifestos publicados não foram normalizados ou reparados.                                                                                                                                                                                                                 |
| Verificadores live nessa instalação  | Outbox: `supported=true`, 1295 PASS, zero FAIL/UNKNOWN. Offline: `supported=true`, 2040 PASS, zero FAIL/UNKNOWN. Os reports frescos são distintos dos RED originais, que permanecem preservados; não reclassificam os anteriores.                                                                                                                                                                                                                                            |
| Novos sensores focados               | Inspector: integração 5/5 PASS; e2e 3/3 PASS; zero skip. Login restrito e identidade SQL real, dois AppModules com autenticação local A/B, append/idempotência/tenant spoof, log-only e recusa cross-tenant, retirement/lease/retry/aggregate release são observados somente dentro dos casos nomeados no relatório. Não prova cutover, transportes reais ou paridade integral.                                                                                              |
| Correção do novo sensor e2e          | A primeira repetição do sensor exigia fila inteira vazia, mas um evento pendente não relacionado foi legitimamente despachado. Inspector calibrou o alvo: registra todos os IDs retornados, exige ausência do evento aposentado, status RETIRED/attempts0 e nenhuma ACK/attempt após dispatch; a testemunha própria de aggregate release é aposentada por sua própria operação. Mantidas recusas exatas; nenhum teste antigo alterado. Falhas intermediárias ficam nos logs. |
| Caracterização antiga pós-pin        | **RED: 29 PASS/1 FAIL**, zero skip. `ageClaim` escolhe `outbox.event_delivery` pela presença da tabela, enquanto o produtor ativo permanece em `integration.outbox`; o UPDATE da fixture selecionada tem rowCount0. Esse diagnóstico não dispensa o critério nem autoriza alterar o teste nesta retomada.                                                                                                                                                                    |
| Reaplicação normal com dados         | **FAIL/BLOCKED_UPSTREAM_STORAGE: exit 3**, `19-stynx-offline.sql:143`, `identity_mode` já existe em `offline.sync_queue_items`. A saída byte-bound instalada contém ADD COLUMN sem IF NOT EXISTS. A160-02 exige reaplicação idempotente e **não foi satisfeita**. Sem SQL hack, marcador local que pule a migração ou normalização de verifier.                                                                                                                              |
| Conservação após a reaplicação falha | Snapshots antes/depois de 24 tabelas `{table,count,sha256}` byte-idênticos: `ca811fae33b369d0413e2d0dc95f023c7b4bd915018a8ca1c505958c3bae8b22`. Demonstram rollback atômico/estado observado preservado; **não idempotência PASS**.                                                                                                                                                                                                                                          |
| Gate estático                        | **FAIL/STOP** das mesmas 13 tabelas sem sinal da helper. Gate e SQL gerado inalterados. Runtime PASS não concede dispensa, e a falha de reaplicação é um bloqueio adicional independente.                                                                                                                                                                                                                                                                                    |

Os snapshots de storage/readiness são observações da primeira aplicação válida no segundo
banco; não autorizam repetir instalação nem alegar suporte completo diante do FAIL posterior.
A relação entre esses resultados é preservada: schema inicial verificável, comportamento
focado observado, reaplicação não idempotente e sensor estático incompatível são fatos distintos.

Custódia final examinada (SHA-256 recalculado pelo Architect):

| Artefato/log                                                                            | SHA-256                                                            |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `scratch/r22-adoption-160/source-candidate-manifest.json`                               | `3dc3d94aab634713f3198540e08c55fc3ea50cb9a97bff228f85a88e91410b6a` |
| `scratch/r22-adoption-160/inspector/INSPECTOR-REPORT.md`                                | `2e35df98d0bc3a705f41a6a9cf8cef7c80206103e4b88015ad804fb8a9fb67bd` |
| `scratch/r22-adoption-160/pin-160.log`                                                  | `c0434e0c9be931b3f37c4270aef9d1e75f779774101a4cd0030b4d5f0a0b8756` |
| `scratch/r22-adoption-160/final-install-160.log`                                        | `b5f35e8aca9a5dccacf85510f1205e4225892836a9ea28d46b329c82c54231c0` |
| `scratch/r22-adoption-160/frozen-install-160.log`                                       | `d6a0dc0b64b5ccf5e765a3aeacaab722b41e9312dd3730b87cf54a94ae9c636e` |
| `scratch/r22-adoption-160/app-typecheck-160.log`                                        | `34a1e437cada3622cf6a45891dd4f312d5d4ef0e1c7b6b259583ef5a12ea3999` |
| `scratch/r22-adoption-160/runtime-unit-160.log`                                         | `4a21e646e2b179505c11d34e5f66dcb6dd56ad5ab3cb3265c03399085cf2a177` |
| `scratch/r22-adoption-160/focused-format-final.log`                                     | `17aa973d3f004560237d9a95171210b0671deff23d61628eecf7322ff5938f20` |
| `scratch/r22-adoption-160/storage-160-fresh-apply.log`                                  | `3bb4643a3745edaebc971e7366a25136861c39a869b30d671d3ab94fb691df74` |
| `scratch/r22-adoption-160/storage-160-fresh-seed.log`                                   | `d97d7db6d1f130afbfc41ccc2e071317963859e39237dc24d56b6f7ba8a30b49` |
| `scratch/r22-adoption-160/storage-artifact-check-final.log`                             | `b77d0a397d7bde0d6c8ede2bf3b994b17c94d5f7c8c318eff04a3658166b95b8` |
| `scratch/r22-adoption-160/inspector/storage-fresh-2026101202.log`                       | `da6ea20e50e94fb8d2a7b79e8fa717aae4015900f9544defd8f55e21c826b7a8` |
| `scratch/r22-adoption-160/inspector/adoption-final-corrected-2026101202.log`            | `5d4081efc730baf5ee4252ba22d5cfc07441420baf9866a3606c81486fc20281` |
| `scratch/r22-adoption-160/inspector/fresh-2026101202/outbox-storage-verifier.json`      | `587f2d423fec0b875a33741d34addf00fc7ec13cd2291d8ea3d56ae7a941d31d` |
| `scratch/r22-adoption-160/inspector/fresh-2026101202/offline-storage-verifier.json`     | `d0e237bd64ff3dfffde118a250df2c803bb6bf474e7bb1697c39b52daea7349e` |
| `scratch/r22-adoption-160/inspector/fresh-2026101202/retired-dispatch-observation.json` | `578592271a99474cdd172a5883232c532ef5c4dabda5e7b6fb05f27288f5645a` |
| `scratch/r22-adoption-160/postpin-outbox-160.log`                                       | `aa446862e121b358e6db125e7a0d5c9734f86f344ec20853bf4367aa3910b6be` |
| `scratch/r22-adoption-160/storage-160-reapply.log`                                      | `1456af2cca3946cfbf7405d6e07c5659a8f4400559cdfa8299ad81e2a33a1d85` |
| `scratch/r22-adoption-160/storage-before-reapply.json`                                  | `ca811fae33b369d0413e2d0dc95f023c7b4bd915018a8ca1c505958c3bae8b22` |
| `scratch/r22-adoption-160/storage-after-reapply.json`                                   | `ca811fae33b369d0413e2d0dc95f023c7b4bd915018a8ca1c505958c3bae8b22` |

O resumo operacional do maestro `scratch/r22-adoption-160/adoption-status.json` registra
`PREPARED_UNINTEGRATED_STOP`; SHA-256 recalculado `dd7b61fb71d9ee12a4798c6b179d52697efe90ccd1cec145c415c7baadabe8d0`.

**Disposição desta retomada: integração/instalação STOP.** Permanecem pendentes, sem
ratificação: cobertura estática equivalente por processo F1/F3 próprio, correção upstream
da reaplicação de storage e caracterização existente; todos os M/C de cutover outbox/SSE,
transportes e ACK genuínos, imutabilidade do recibo de aposentadoria, paridade/importação
CTG-0009 e seus seis gaps V-check, assinatura parte D/caminho de bytes, amostra real do
provedor e valores normativos/OIDs/âncoras/challenges aprovados. Os adapters continuam
inativos; os testes novos não substituem essas obrigações.

O maestro revalidou `origin/main=897f01991a17e20253721ecf7c8592f2123a37f0` e campanha
`9af7682479fd338b0c81bf56548d21b3021cdf76` sem avanço, e informa checkout primário sujo
preservado/PR #179 intocado. Nenhum commit, push, PR, integração, deploy, publicação ou
fechamento foi executado nesta retomada. k6/mutation não executados, nunca contabilizados
como PASS. A revisão e os gates completos continuam necessários; este suplemento de F1
não é atestado independente de aceitação nem evidência emitida pela boundary DEVAI.

## D-160.7 — Extensão prospectiva: classificação estática de RLS por artefato publicado

**Papel: Architect. Estado: contrato prospectivo; implementação e sensores ainda não
aceitos.** A coordenação do maestro em 2026-10-12 retoma a preparação delimitada sob
B17, mantendo a instrução humana de continuar a adoção DETRAN em paralelo. Esta seção
amplia somente o escopo do classificador consumidor e sua prova independente. Supera
prospectivamente a proibição de editar o classificador em A160-04e; não altera o resultado
FAIL/STOP observado em D-160.6, nem concede dispensa a qualquer gate.

### A160-05 — Fronteira de edição e execução

Engineer pode alterar `tools/check-rls-ddl.ts` e, se necessário para separar leitura de
artefatos e análise lexical, criar um único helper importável
`tools/rls-ddl-coverage.mjs`. A justificativa do helper é tornar explícita a mesma prova
usada pelo CLI, sem manter uma segunda implementação exclusiva para testes. Não é
autorizado refatorar o renderer, alterar SQL/manifestos gerados, modificar a helper SQL
`auth.create_rls_policy`, ampliar exceções, alterar o inventário do instalador ou ligar
qualquer adapter. O script existente `verify:rls-ddl` continua no caminho obrigatório de
`pnpm check`, com falha não zero. Engineer pode acrescentar somente o script raiz
`test:rls-ddl` com `node --test tools/rls-ddl/tests/*.test.mjs`; nenhum gate existente é
removido ou reordenado para contornar falhas.

Inspector é o único autor de `tools/rls-ddl/tests/check.test.mjs` e de eventuais fixtures
em `tools/rls-ddl/tests/fixtures/**`. Nenhum teste existente é alterado por esta extensão.
Os sensores são black-box, executando o CLI real por Node com o loader `tsx` resolvido
do ambiente de teste. O CLI aceita zero ou um argumento posicional: raiz absoluta ou
relativa do repositório; omissão significa `process.cwd()`. Mais argumentos ou raiz
inválida recusam. Todos os caminhos DDL, pin, metadata e resolução instalada derivam
exclusivamente dessa raiz; pacotes são resolvidos a partir de
`backend/app/package.json` nessa raiz, sem fallback ao checkout de execução.

O classificador é somente leitura: não conecta a PostgreSQL, não executa SQL, não chama
subprocesso de geração, não grava artefatos e não busca rede. Ausência, erro de leitura,
parse ou resolução não vira conjunto vazio nem PASS. Diagnósticos nomeiam arquivo,
identidade de objeto e causa segura, sem imprimir credenciais. Um PASS estático informa
contagens separadas de tabelas cobertas por helper, por artefato instalado e pelas duas
exceções; não usa o número histórico 13 como inventário fechado.

### A160-05a — Inventário completo e cobertura existente

Cada arquivo `.sql` de `backend/database/ddl` continua consumido, ordenado como hoje.
O inventário reconhece `CREATE TABLE` com ou sem `IF NOT EXISTS`, nomes qualificados
com identificadores SQL ordinários ou entre aspas, e coluna real `tenant_id` também
entre aspas. Respeita parênteses aninhados, comentários de linha/bloco, literais SQL
e corpos dollar-quoted. Texto em comentário/literal/corpo de função não cria tabela
nem sinal da helper. Aspas duplicadas são decodificadas; somente identificador não
quoted é convertido para minúsculas. `"Tenant_id"` não é `tenant_id`, e
`"PORTAL"."public_hostname"` não recebe a exceção de `portal.public_hostname`.

O sensor não precisa ser um parser PostgreSQL geral. Entretanto uma construção DDL
relevante que não consegue classificar, identidade ambígua, aspas/comentário/corpo
não terminado ou criação dinâmica relevante não pode ser silenciosamente ignorada:
recusa com diagnóstico. A correção do ponto cego de nomes quoted e de CREATE sem
IF NOT EXISTS é obrigatória, inclusive fora dos dois arquivos STYNX.

Tabelas consumidoras com coluna `tenant_id` continuam exigindo uma chamada SQL efetiva
`auth.create_rls_policy('schema', 'table')` para a identidade exata. Reconhecer o sinal
existente não dispensa o contrato FORCE RLS/contexto da helper nem os sensores live.
Os únicos nomes isentos continuam `portal.public_hostname` e `portal.brand_profile`,
com sua justificativa atual. Uma tabela arbitrária não recebe cobertura porque está
em schema outbox/offline, porque tem política parecida, porque um manifesto local a
enumera ou porque seu nome contém texto de uma tabela aprovada.

### A160-05b — Prova fechada de artefato instalado

Há uma segunda origem de cobertura, distinta de isenção: os dois artefatos exatos
A160-04b para `@stynx-nyx/outbox@1.6.0` e `@stynx-nyx/offline-sync@1.6.0`, seus
destinos fixos `19-stynx-outbox.sql` e `19-stynx-offline.sql`, e
`backend/database/stynx-storage.json`. A admissão exige cumulativamente:

1. Pin exato 1.6.0 e resolução efetivamente instalada dos dois exports públicos
   `renderOutboxStorage`/`renderOfflineStorage`. Outro pacote, versão, caminho de
   destino ou seleção por argumento/variável de ambiente não é admitido. O binding
   permanece literalmente owner `postgres`, app `role_app_backend`, reader null e
   tenant `auth.tenants(id)`. Não se usa binding declarado pela metadata como autoridade.
2. Renderizar em memória pelo export instalado com esse binding fixo. Conferir versão,
   contractVersion, binding, hash do entrypoint realmente resolvido, sources e todo o
   manifesto fechado com a metadata local. Reproduzir a composição de bytes e metadata
   já definida pelo gerador A160-04b, incluindo header, objectsSql e roleBindingsSql.
   A igualdade com os dois arquivos SQL e a metadata é exata; hashes locais recalculados
   por um editor não substituem igualdade com a saída instalada. Metadata ausente,
   duplicada, extra, stale ou autoconsistente mas divergente recusa.
3. Usar somente o manifesto instalado assim autenticado para a identidade exata de
   relações/colunas. Toda tabela tenant-bearing criada pelo artefato precisa constar
   desse inventário, com relação RLS habilitada e forçada e a política de isolamento
   aplicável ao app/PUBLIC com USING e WITH CHECK que preservam o tenant corrente e
   recusam contexto ausente. Preservam-se checks adicionais publicados, como actor
   de retirement; não se reduz a expressão a um teste de substring `tenant_id`.
   Relação não tenant-bearing não vira exceção genérica: permanece no inventário
   fechado publicado e nos verificadores live, incluindo relações owner-only.
4. Não aceitar DDL fora desses artefatos que redefina as relações protegidas ou suas
   políticas/RLS/grants, nem SQL adicional anexado ao arquivo aprovado. A origem de
   cobertura pertence ao arquivo byte-bound e à identidade instalada, não a nomes
   globais reutilizáveis por qualquer DDL. Construção relevante que torne essa
   atribuição indeterminável é checkpoint, nunca autorização implícita.

Esta prova vincula o DDL consumidor ao pacote exato. Não certifica semântica arbitrária
de uma nova política SQL, catálogos/grants efetivos ou isolamento de uma conexão viva.
Os verificadores públicos read-only e os sensores independentes de tenant A/B, ausência
de contexto, login não superuser/não BYPASSRLS e SQL actor continuam necessários e
inalterados. Troca de binding ou pacote exige novo escopo F1/F3; não há opção permissiva.

### A160-05c — Matriz independente do Inspector

Fixtures usam raízes temporárias, cópias dos dois SQL/metadata/pin exatos gerados e um
link somente para a instalação real em `backend/app/node_modules`. Não fabricam pacote
mock que renderize o próprio resultado esperado. Sensor negativo pode modificar somente
sua cópia temporária. Devem provar, com status e diagnóstico do CLI:

O inventário instalado examinado contém 9 relações tenant-bearing outbox e 12 offline,
total 21; o sensor antigo que reportou 13 não reconhecia oito CREATE sem IF NOT EXISTS.
Na fixture positiva com uma tabela da helper e as duas exceções, exigir contagens
disjuntas helper=1/package=21/exempt=2, além do exit0. Esse inventário estático completo
não converte as 13 recusas históricas em PASS.

| Família                         | Testemunhas obrigatórias                                                                                                                                                                                                                           |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cobertura positiva              | Tabela consumidora ordinary/quoted coberta pela helper real; as duas exceções públicas; os dois artefatos instalados intactos com tabela quoted e CREATE sem IF NOT EXISTS contados; execução no repo real com contagens explícitas reconciliadas. |
| Cobertura recusada              | Tabela tenant-bearing ordinary/quoted desconhecida, com e sem IF NOT EXISTS; helper ausente ou apontando outra identidade/case; terceiro nome de exceção; tentativa de ocultar tenant/table em sintaxe não suportada.                              |
| Léxico                          | Helper ou CREATE falsos somente em comentário, literal ou corpo dollar-quoted não concedem cobertura; coluna/nome quoted case-sensitive e escaped quote; limites aninhados e entrada truncada/ambígua recusada quando relevante.                   |
| Integridade                     | Falta de qualquer SQL/metadata/pin/pacote; versão, destino, source, entrypoint hash, binding ou tenant-table divergente; manifesto extra/stale; SQL adulterado mesmo depois de recomputar todos os hashes locais.                                  |
| Segurança publicada             | Remoção/troca de ENABLE, FORCE, USING, WITH CHECK ou fence de tenant/contexto ausente na cópia de artefato; política permissiva adicional ou alteração de objeto protegido em outro DDL; cada caso recusa antes de alegar cobertura.               |
| Resolução e ausência de efeitos | Raiz explícita diferente de cwd realmente selecionada; argumentos extras recusados; falha de resolução não cai no pacote de outro checkout; snapshots da fixture antes/depois iguais na execução do CLI.                                           |

As recusas por byte mismatch são evidência legítima para as mutações de política:
o contrato exige preservar exatamente a política instalada, não aceitar uma política
local editada por parecer equivalente. Inspector registra RED inicial e PASS posterior
se houver, com hashes dos sensores e implementação examinada. Novos sensores e PASS
do classificador não reclassificam os logs históricos nem satisfazem A160-02/cutover.

### A160-06 — Agrupamento reviewable e checkpoints preservados

Preparar grupos coerentes não é autorização para stage/commit/push/PR/merge. O maestro
mantém as boundaries e checks da rodada e, se posteriormente autorizado a integrar,
preserva a ordem F1 prospectivo, F3 independente e F2 correspondente. A revisão pode
examinar os seguintes grupos de conteúdo separadamente, com proveniência própria:

1. Pin exato/lockfile e materialização BP-INF-NORMATIVE 1.2 já autorizada em A160-04g,
   inclusive seus outputs gerados, sem apresentar essa materialização como conclusão
   da parte D de assinatura.
2. Wiring/adapter aditivo inativo A160-04a/c/d e sensores focados do Inspector,
   distinguindo identidade SQL real de ativação/cutover ainda ausente.
3. Ferramentas/artefatos de storage, contexto de instalação A160-04b/f e classificador
   A160-05 com suas fixtures independentes. Este grupo permanece bloqueado quanto à
   estratégia de reaplicação e integração; um classificador verde não libera instalação.

Contratos/ADR/transcrição F1 acompanham o grupo correspondente como alteração de
Architect; testes permanecem autoria Inspector, implementação autoria Engineer.
Se a divisão física de commits exigir dependências cruzadas, explicitar a ordem e os
checks de cada snapshot, sem fingir que um intermediário RED é integrável. Não há
autorização de merge com required checks RED, teste alterado para passar, SQL local
reparado, consumo de API futura 1.6.1, publicação ou afirmação de cutover.

### A160-06a — Qualificação prospectiva do checkpoint de reaplicação

Leitura independente pelo Architect dos documentos imutáveis em
`60e53ad791a4d031ab137a344fd994fe97bcb514`:
`docs/framework/contracts/consumer-storage.md` diz que o consumidor possui sua
migração, usa a cadeia forward e aplica artifacts antes de uso. No parágrafo outbox,
também declara que aplicar repetidamente ambos os artefatos não altera linhas,
identidades, contadores ou evidência. `offline-storage-import.md` define o renderer
offline pela mesma convenção de artefato e distingue importação owner-only de
verificação read-only; não especifica um ledger consumidor de execução once-only.

Portanto o FAIL exit3 e os snapshots idênticos de D-160.6.2 permanecem fatos, e A160-02
continua não satisfeito. A classificação histórica `BLOCKED_UPSTREAM_STORAGE` é
preservada como disposição daquele snapshot. Nesta retomada, a atribuição definitiva
entre promessa upstream e estratégia consumidora de executar novamente todo objectsSql
fica **pendente de contrato/evidência**, não presumida. Não se declara um import
once-only suportado nem se autoriza ledger/skip marker, ALTER corretivo, IF NOT EXISTS
injetado, runner interno ou cadeia completa da plataforma. Uma estratégia futura
precisa de contrato prospectivo próprio e sensores fresh/populated/reapply, conservação,
concorrência e recuperação; não apaga nem promove a reaplicação falha existente.

## D-160.8 — Instalação fresh uma vez, ledger consumidor e fronteira de upgrade

**Papel: Architect. Estado: contrato prospectivo; sem aceitação de implementação.**
Continuação de B17, limitada à preparação da adoção publicada 1.6.0. Esta seção
substitui prospectivamente a exigência de repetir todo objectsSql de A160-02 pela
execução fresh uma vez e pela admissão de repetição abaixo. Não altera os bytes ou
resultados históricos de D-160.6 nem autoriza migração do protocolo/dados DETRAN.

### A160-07 — Fonte imutável e atribuição corrigida por adição

O Architect leu independentemente, em STYNX
`60e53ad791a4d031ab137a344fd994fe97bcb514`:

- `scripts/offline-storage-generate.mjs`, que declara literalmente: “The artifact
  is applied once to fresh storage. Existing installs use their forward migration
  chain and this explicit ownership/policy binding projection.” O gerador separa
  statements estruturais/backfill em objects e ownership/grants/policies em bindings.
- `law/adr/ADR-MOBILE-OFFLINE-0004-minor-parity-and-import.md`, D6/D6.1 e seção
  Migration and compatibility: storage fechado/verificador read-only, importação
  owner-only distinta de instalação, e migrações forward após 0004, preservando
  bytes e observações anteriores. D6 não publica um runner consumidor de DDL.
- `docs/framework/contracts/consumer-storage.md` e
  `offline-storage-import.md`: migração continua responsabilidade consumidora;
  renderer é offline, verifier não repara; roleBindings é uma projeção separada.
  A frase geral de reaplicação do parágrafo outbox não supera a indicação explícita
  once-fresh do gerador offline nem demonstra que a concatenação inteira é reentrante.

O exit3 original em `19-stynx-offline.sql:143` e a igualdade dos snapshots das 24
tabelas continuam **FAIL de reaplicação integral e prova de rollback atômico**, nunca
idempotência PASS. A classificação histórica BLOCKED_UPSTREAM_STORAGE permanece
legível no snapshot. A atribuição prospectiva para esse caso é **incompatibilidade
da estratégia consumidora de repetir o artifact fresh completo**, não prova de bug
upstream em uma operação de repetição prometida para offline.objectsSql. Isso não
declara a instalação DETRAN pronta; muda o contrato da próxima implementação e sua
prova, sem reexecutar/reclassificar logs antigos.

### A160-07a — Capacidade forward efetivamente disponível

A instalação `@stynx-nyx/offline-sync@1.6.0` inclui `migrations/0001` até `0008`.
Sua presença e seus hashes no manifesto não constituem um port de binding forward.
O código instalado de `storage.js` mantém `bindSql`/`bindStatement` privados e o
export público `renderOfflineStorage` produz somente o artifact completo fresh e
roleBindings. Não há export público de seleção/render por arquivo/migration prefix.

Os SQL raw usam `stynx_owner`, `stynx_app`, `stynx_reader` e FKs para
`tenancy.tenants(id)`; as migrações 0001/0002/0004/0006 dependem desses bindings,
0007 ainda contém owner fixo e 0008 owners/revokes fixos. A ausência desses tokens
em 0003/0005 não torna a cadeia completa custom-bound. Aplicar raw e corrigir depois
owners/FKs/grants cria uma execução intermediária diferente da publicada e não é
autorizado. O runner de `@stynx-nyx/data` percorre a plataforma, sem port público
consumidor-only; não usar runner interno, schema_migrations da plataforma, IDs que
pulam arquivos sem verificar checksum, aliases de roles ou tenant views para contornar.

Assim, o upgrade forward de storage consumidor anterior/populado com binding DETRAN
está **não implementável por seam público verificado nesta versão**. Deve recusar,
nomeando ausência de caminho bound forward, até artefato/API upstream e contrato F1/F3
próprio. Ledger local não cria essa capacidade. Não autoriza reescrever raw SQL,
copiar o binder privado, decompor/reordenar o artifact fresh ou consumir API futura.

### A160-07b — Escopo F2 fechado

Engineer pode criar `tools/stynx-storage-install.mjs` para plano/admissão de execução
com os exports instalados e `backend/database/ddl/19-stynx-storage-ledger.sql` para
o ledger consumidor owner-only `integration.stynx_storage_installations`. Pode alterar
somente o necessário em `backend/database/apply.sh` para incluir esse terceiro arquivo
no inventário fechado, executar o ledger antes do passo STYNX e substituir a execução
incondicional dos dois artefatos pela fronteira abaixo. O arquivo do ledger é DDL
novo consumidor; nenhum SQL STYNX, migração histórica, auth/audit schema ou gerador
de blueprint é editado. Os dois artefatos e `stynx-storage.json` mantêm bytes A160-04b.

O helper recebe somente a raiz do repo, usa a prova instalada A160-05b e emite/fornece
o plano de execução fixo. Não admite SQL, caminho de pacote, versão, role, binding,
schema-alvo, hash esperado, bypass, force ou adoption de schema existente por input.
Pode separar o objeto e roleBindings recebidos diretamente do export público em
memória; não altera, remove ou injeta statements dentro desses textos. A composição
psql/transaction wrapper é consumidora e deve transportar esses bytes sem execução
de metacomandos ou interpolação de fonte não validada. Não há subprocesso oculto do
renderer nem conexão criada por ele. O preflight de bytes/closed inventory continua
antes de qualquer conexão; os controles de `--full` existentes permanecem.

O ledger registra por pacote a identidade exata da instalação fresh: package/version,
contractVersion, binding completo, entrypoint/source-manifest/artifact/object/binding
digests e manifesto original suficiente para recomputar suas relações. Registra apenas
o owner SQL real e o instante dessa instalação, sem inventar data/ator anteriores.
Identidade única de pacote impede instalação silenciosa de uma segunda versão.
As linhas são append-only, com guarda contra UPDATE/DELETE e sem caminho de reset,
upsert que substitua evidência, repair ou bootstrap por argumento. A linha atesta
execução de instalação, não supported/readiness nem migração de dados de negócio.

Ledger e schema/tabela são de `postgres`, RLS habilitada/forçada, nenhuma policy de
request e nenhum privilégio de app, reader, auditor ou PUBLIC. Se grants amplos de
DDL20 atingirem a tabela dentro da transação, revogações específicas são finais após
DDL20, antes do commit; a guarda de imutabilidade permanece. Defaults, membership,
owner, flags, definição/constraints/trigger e privilégios efetivos são examinados;
uma tabela homônima existente divergente recusa, não é silenciosamente reparada.
Não modificar DDL20 para enfraquecer grants de outros objetos ou o gate RLS.

### A160-07c — Admissão owner-only e repetição

Somente manutenção explícita do consumidor, fora de request path e com writers
ordinários parados. Mesmo owner/identidade SQL real `postgres`, visibilidade total,
advisory transaction lock `(7007,1)` e transação única do instalador. Não aceitar
booleano de input como prova de identidade, nem desabilitar RLS/triggers/FKs. Preserva
`search_path=pg_catalog,public` na execução STYNX, com restauração do contexto legado.
Os dois pacotes e o ledger são admitidos como um grupo: validar ambos antes de executar
qualquer objectsSql; estado misto/parcial recusa. As três classes são fechadas:

1. **Fresh:** nenhum registro dos dois pacotes e schemas outbox/offline ausentes ou
   realmente vazios, sob owner aprovado, sem objeto/estado anterior de qualquer tipo.
   Criar cada objectsSql exatamente uma vez, aplicar roleBindings exatos e inserir
   as duas linhas somente na mesma transação bem sucedida. Falha de qualquer etapa
   reverte DDL, bindings e ledger; não há receipt de prefixo bem sucedido.
2. **Repetição da mesma instalação:** as duas linhas originais e todos os seus bytes/
   digests/bindings são idênticos aos artifacts instalados; integridade/segurança do
   ledger e storage não podem ser inferidas só da presença da tabela. Verificação
   pública read-only anterior e atual deve sustentar o catálogo/invariantes; report
   unsupported/FAIL/UNKNOWN recusa. Executar somente roleBindings, nunca objectsSql,
   backfills ou writes operacionais. Não atualizar linha/instante/ator do ledger.
   A repetição não é caminho genérico para reparar drift catalog/policy/grants.
3. **Qualquer outro estado:** schema com objetos sem ledger, ledger parcial/forjado/
   divergente, versão/binding/hash diferente, storage anterior ou objeto inesperado
   recusa antes de DDL STYNX. Não adotar automaticamente os bancos de rehearsal que
   receberam o artifact antes deste ledger, mesmo se um verifier antigo foi PASS.
   Não sobrescrever ledger nem selecionar por simples existência de tabela.

Após commit, executar os verificadores públicos em nova transação realmente read-only
do owner, sem switch que torne o verifier writable. Eles não podem compartilhar a
transação que acabou de fazer DDL. Um FAIL posterior deixa manutenção STOP; o ledger
continua prova da instalação realizada, sem promover readiness ou simular rollback do
commit anterior. Nenhum writer é retomado enquanto supported não for true sem checks
FAIL/UNKNOWN e as caracterizações consumidoras aplicáveis não passarem. Na repetição,
a verificação anterior read-only não dispensa a posterior nem o controle de exclusão.

### A160-07d — F3 independente e critérios de aceitação

Inspector autoria exclusiva de `tools/stynx-storage/tests/install.test.mjs`, eventuais
fixtures em `tools/stynx-storage/tests/fixtures/**` e
`backend/app/tests/integration/r22-stynx-storage-install.integration.spec.ts` (path
coletado por `test:integration`). Engineer pode adicionar somente o script raiz
`test:stynx-storage-install` com `node --test tools/stynx-storage/tests/*.test.mjs`.
Nenhum sensor antigo é ajustado para a instalação ficar verde.

Casos de admissão/bytes usam fixtures temporárias dos artifacts instalados reais e
resolução app independente, sem mock que apenas confirme a própria implementação.
Recusa antes de conexão precisa de diagnóstico próprio; erro de conexão não prova
recusa de binding/hash. Casos de instalação/repetição exigem PostgreSQL real em banco
novo exclusivo, lease serializado pelo maestro, URLs explícitas sem exposição e
ambiente nunca direcionado ao primário. Provas obrigatórias:

- fresh, normal apply completo e verifier read-only supported, ledger exato/owner
  real e zero história operacional fabricada; restrição efetiva app/reader/PUBLIC;
- duas execuções normais concorrentes serializadas, uma única instalação e duas
  linhas originais; repetição após escrita real tenant A/B preserva todo histórico,
  IDs, contadores, clocks, timestamps e ledger, com snapshots antes/depois e ambos
  verificadores supported; o código testemunha que objectsSql não é reexecutado;
- schema existente sem ledger, schema parcial, ledger parcial/owner/privilégios/
  definição adulterados, digest/binding/versão alterados, pacote/SQL local tamper
  inclusive hashes recalculados e populated prior-version recusados sem efeito;
- falha controlada no segundo pacote ou antes da conclusão do ledger reverte a
  instalação inteira; execução seguinte fresh válida recupera sem prefixo; não
  usar psql fake que sempre retorne sucesso como prova de atomicidade;
- ledger imutável e inacessível no request role, sem grants efetivos após DDL20;
  verifier exige conexão read-only real e unsupported não libera writers;
- confirmação de que nenhum raw forward, binder privado, platform chain, import
  port, adapter ativo ou alteração de SQL publicado foi usado.

Novo PASS satisfaz somente instalação fresh/repetição same-artifact sob este contrato.
Upgrade de uma instalação prévia continua checkpoint; importação CTG9, cutover,
assinatura/provedor, seis gaps offline e a caracterização antiga RED permanecem
obrigações distintas. Reportar os casos não executados como pendentes, nunca PASS.

### A160-08 — Preparação reviewable e política de PR da campanha

O Architect reconferiu `plan.md` §Execução OD-C2-005/Sequência final e
`AUTHORIZATION.md` §A-C2-13: commits por tarefa/CTG na campanha, nenhum PR intermediário,
uma delivery-review do diff completo e um PR final. B17 substituiu versão e permitiu
preparação isolada; não revogou esse desenho. Coordenação de outro agente para
“normal reviewable PR preparation” não é nova decisão humana que supersede Owner.

Os três grupos de A160-06 podem receber inventários, mensagens de commit propostas,
diffs separados e minuta local do PR final, com dependências e checkpoints claros.
Esta extensão não abre PR intermediário da adoção, não autoriza push da branch
isolada nem altera a campanha/PR #179. Integração futura segue a política vigente;
uma exceção a PR único exige instrução humana explícita e transcrição prospectiva
que nomeie exatamente a exceção. Até lá, preparação reviewable é local e não implica
conclusão da rodada, required checks verdes, merge/publicação ou revisão independente
já realizada. O maestro pode continuar o trabalho F2/F3 autorizado sem essa exceção.

## D-160.9 — Refinamento prospectivo de orquestração e proteção estática

**Architect; implementação/sensores sujeitos a prova, sem promoção de readiness.**
Esta extensão resolve somente a composição necessária para A160-07c e explicita
recusas já abrangidas pela proteção de identidade/contexto de A160-05. As demais
fronteiras, o checkpoint forward e a política de PR permanecem.

### A160-09 — Bridge de manutenção com transações read-only reais

`tools/stynx-storage-install.mjs` pode exportar, além do plano puro, um runner fixo
de instalação. Usar o `pg` público instalado no próprio consumidor e spawn de `psql`
sem shell, com executable/argumentos fixos equivalentes ao instalador existente.
Preserva-se o inventário fechado, preflight SQL legado, psql `-X`, ON_ERROR_STOP e
`--single-transaction`; não substituir por runner de plataforma ou executor genérico.
O plano puro continua sem efeitos. O runner só aceita raiz e a opção fechada booleana
`full`; esta última é derivada do `--full` já admitido por apply e reconferida pelas
mesmas regras de nomes/autorizações descartáveis existentes, sem novo bypass.

Conexões usam somente DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME explicitamente
selecionados por apply: porta inteira válida, nome conforme validação existente,
owner/login real `postgres`, valores de host/usuário não vazios e sem NUL/CR/LF.
Credenciais são campos de conexão/ambiente do filho, nunca URLs em argumentos ou
logs. Não admitir variável de SQL, command string, caminho de pacote/DDL, role,
binding, flags psql extras, callback arbitrário ou fallback a outro DB. Não introduzir
herança de PGOPTIONS/serviço que substitua os controles da conexão explícita.

Sequência fixa:

1. Conferir bytes/instalação/plano e inventário fechado antes de conexão ou recriação.
2. Conectar como owner ao database de manutenção **postgres** e manter session advisory
   lock `(7007,1600)` até o fim. Todos os novos entrypoints, inclusive normal/--full,
   usam esse mesmo database/key. Locks advisory são por database; usar target em um
   caminho e postgres em outro não é exclusão equivalente. A conexão de manutenção
   não mantém o lock `(7007,1)` que o filho adquirirá, evitando deadlock entre sessões.
3. Sob o lock de manutenção, realizar apenas a recriação --full já autorizada se
   solicitada; apply não pode recriar o DB antes de entrar nessa boundary. Em conexão
   target distinta, abrir transação nova realmente READ ONLY, conferir identidade e
   admissão; para repeat executar verificadores públicos e recusar unsupported. Encerrar
   essa transação antes do passo de instalação; fresh não exige verifier PASS de objetos
   ainda ausentes. Nenhum switch torna o verifier writable.
4. Executar o filho psql com transação única e xact lock `(7007,1)` no target. Revalidar
   owner e estado fresh/repeat/ledger do grupo sob esse lock, antes de objects/bindings;
   não confiar apenas na decisão anterior ou em mode vindo do ambiente. Aplicar o plano
   A160-07, controles/revogações finais e assertions. Falha retorna não zero e rollback.
5. Somente depois do sucesso/commit do filho, abrir nova transação target READ ONLY
   e executar ambos verificadores públicos. FAIL/UNKNOWN/erro mantém STOP e exit não
   zero; não afirmar que o commit anterior foi revertido. Liberar writers permanece
   condicionado a todos os critérios, nunca apenas ao exit0 do filho.
6. Sempre encerrar transações/conexões; em erro/sinal, cancelar o filho e aguardar sua
   saída antes de liberar o lock de manutenção quando o processo puder tratar o sinal.
   Não deixar filho ativo por timeout ou liberar lock enquanto verifica. Falha abrupta
   não equivale a conclusão: próxima entrada revalida ledger/catálogo e segue fail-closed.

O lock adicional serializa os novos entrypoints; não substitui writers ordinários
parados nem coordena automaticamente um instalador histórico externo que não o usa.
O xact lock legado continua obrigatório. Inspector, nos paths A160-07d, acrescenta
testemunhas de database/key iguais nos dois entrypoints, ausência de deadlock, normal/
full sob exclusão, read-only efetivo pre/post, recusa de args/env permissivos, revalidação
do estado dentro da transação filha e limpeza em erro. Prova de concorrência é PostgreSQL
real; snapshots de plano ou fake psql não a substituem.

### A160-10 — DDL ambíguo e escalada de roles

A160-05 inclui inventariar coluna tenant acrescentada por `ALTER TABLE ... ADD COLUMN`,
mesmo quando CREATE original não a tinha. ALTER com identidade não qualificada, contexto
`search_path` que torne mutação protegida ambígua, identificadores Unicode `U&"..."`,
helper com argumentos expressivos/Unicode/concatenados e SQL dinâmico opaco ou montado
por concatenação não podem ocultar tabelas/políticas/roles: recusam com diagnóstico.
Unicode string literal presente no artifact publicado byte-bound, por exemplo a lista
de whitespace de uma guarda outbox, permanece intacto e válido; não aplicar blanket ban
que rejeite o pacote exato. Fora dos dois artifacts, argumentos da helper continuam
literais ordinários exatos e Unicode-escaped literal não revisado recusa.

DO/procedures legados existentes de priority e preflight permanecem reconhecidos.
Não dispensar arquivo inteiro pelo nome nem ignorar qualquer EXECUTE dentro de DO.
Reconhecer somente as construções existentes examinadas e seu conjunto finito de
identidades/colunas, ou vinculá-las a conteúdo exato examinado; mutação/obfuscação não
herda aceitação. Se um novo constructo não puder ser classificado, checkpoint em vez
de ampliar a exceção. Nenhum desses corpos pode criar um sinal fictício da helper.

É explícita a proteção das identidades `postgres`, `role_app_backend` e
`role_auditor_min`: recusar DDL consumidor que conceda membership/capacidade de owner
ao app/reader/auditor, GRANT de role não provada segura para esses roles, ALTER ROLE
que amplie SUPERUSER/BYPASSRLS/CREATEROLE/CREATEDB/REPLICATION ou herança/SET ROLE de
capacidade privilegiada, e owner/grants/default privileges que ampliem acesso aos
objetos protegidos. `GRANT postgres TO role_app_backend` é recusa obrigatória, assim
como escalada indireta ou obfuscada que não possa ser decidida estaticamente. A criação
restrita já existente de roles operacionais NOSUPERUSER/NOBYPASSRLS/NOLOGIN/NOINHERIT
permanece aceita; não se altera política SQL para fazer o sensor passar. Verificação
live de memberships/capacidades efetivas continua independente e obrigatória.

Inspector pode ampliar exclusivamente o novo `tools/rls-ddl/tests/check.test.mjs`
para testemunhar essas recusas diretas/indiretas, ALTER ADD tenant_id, U& identifiers,
search_path e concatenação, mais positivos dos DO legados e Unicode literal publicado.
Registrar RED antes da implementação correspondente. Esses sensores reforçam a
prova prospectiva; não autorizam editar testes antigos nem dispensar gates.

## D-160.10 — Registro exato dos DO legados revisados

**Architect; alternativa de conteúdo exato de A160-10.** Leitura independente dos
arquivos DDL consumidores em 2026-10-12 identificou 53 corpos DO não pertencentes aos
artifacts STYNX. Após separar comentários/literais do código, seis corpos contêm
EXECUTE efetivo ou criação/concessão de capability de role. Todos os seis corpos
permanecem byte-idênticos ao HEAD/base da campanha
`9af7682479fd338b0c81bf56548d21b3021cdf76`; esta revisão não altera esses arquivos.

Hash definido como SHA-256 dos bytes UTF-8 **exatamente entre** o dollar delimiter
de abertura e o correspondente fechamento, incluindo newline inicial/final,
comentários, espaços e literais, sem trim, normalização de line ending ou delimiters.
Ordinal é a posição do DO no arquivo e documenta a extração; os nomes/tags são
proveniência, não uma licença para aceitar qualquer outro corpo do mesmo arquivo.

| Arquivo relativo a `backend/database/ddl/` | DO / tag de origem | Bytes do corpo | SHA-256 do corpo                                                   |
| ------------------------------------------ | ------------------ | -------------- | ------------------------------------------------------------------ |
| `01-schemas.sql`                           | 1 / `$$`           | 345            | `10ffe8528fcc2d8b4cf225342a9ae0dd9ca31e96cdcc794d24cdd5899d53b1c4` |
| `19-rait-priority-enforce.sql`             | 1 / `$roles$`      | 764            | `4a838a9d03e3cbea8e131853d2c94e2a92fa2fd6d236eac04e9f715d039d9bf3` |
| `19-rait-priority-enforce.sql`             | 2 / `$triggers$`   | 929            | `513b32af0db309e4a8942070aec55c6ad40a1957c09ed7342c8c60f1085a5b1d` |
| `19-rait-priority-pre.sql`                 | 1 / `$pre$`        | 16305          | `df4ab58ebe63768aa8b50457036e7d5a20ebb6f5cc1804eedb2843759a062496` |
| `19-rait-priority-pre.sql`                 | 2 / `$historical$` | 4815           | `d8dd099d335dd66713fe647a26d29d4b7db29a91704fdc62eb2350f622a043d9` |
| `20-rls-policies.sql`                      | 1 / `$$`           | 178            | `4723c84ba54e516ff42b3c3aa112522853780f0d57346c6b488bf5ada772d6dd` |

Revisão de efeitos delimitados:

- **Schemas/roles:** cria somente app e auditor operacional ausentes, NOLOGIN,
  NOINHERIT, NOSUPERUSER e NOBYPASSRLS, sem membership e sem alterar role existente.
  Não atesta segurança de uma role que já exista; preflights/live checks permanecem.
- **Priority roles:** cria writer restrito sem login/super/bypass/createdb/createrole/
  replication; recusa flags ou membership existentes incompatíveis. A única execução
  format é GRANT TEMPORARY no database corrente, identidade escapada por `%I`, para
  esse writer fixo. Não concede membership ao app nem owner.
- **Priority triggers:** itera somente assessment e basis em schema `inf` literal;
  `%I` recebe os dois nomes fixos. Reinstala as três guardas de imutabilidade/
  no-truncate/completude existentes, sem tocar STYNX ou roles.
- **Priority pre:** inventário literal JSON de relações/colunas `inf.rait_*`, ordenado;
  regclass vem exclusivamente desses nomes prefixados por `inf.`. Locks e conferência
  owner/shape precedem adição. ALTER dinâmico admite somente três colunas específicas
  de rait_case e answered_on de rait_inquiry, tipos fixos do inventário; demais faltas
  ou divergências recusam. FK aditiva é qualificada e não reescreve história.
- **Priority historical:** regclass recebe somente pool_member, draft e decision
  qualificados por `inf`; EXECUTE serve a locks. DDL estático limita-se às colunas/
  checks/FK nomeados, validando definições prévias e preservando fatos legados.
- **DDL20 revoke:** se o relation qualificado `est.crash_report_document` existe,
  executa apenas REVOKE UPDATE/DELETE desse relation para o app, restaurando seu
  append-only após o grant amplo. Nenhuma expansão de privilégio ocorre no corpo.

Engineer pode materializar exatamente estes seis digests em
`tools/rls-ddl-coverage.mjs`, sob o escopo já autorizado. A aceitação é pelo corpo
exato dentro de statement DO plpgsql normal (linguagem omitida ou explicitamente
plpgsql), não por basename, regex aproximada, template format semelhante ou arquivo
inteiro. Wrapper/linguagem diferente, prefixo/sufixo executável ou outro statement
continuam classificados e recusam se ambíguos; o hash não pode pular análise do resto
do arquivo. Conteúdo do corpo não emite cobertura fictícia da helper nem nova exceção
de tenant. Não existe opção de atualizar registry automaticamente pelo arquivo atual.
Uma mudança em qualquer byte de corpo com essas capabilities perde esta admissão e
exige nova revisão F1 ou classificação estática independente realmente suficiente.

`19-rait-priority-verify.sql` contém a string de privilégio `'EXECUTE'`, mas nenhum
EXECUTE procedural efetivo nem alteração de role; seus checks são read-only e não
recebem entrada neste registry. Os demais DO de constraint guards podem continuar
classificados por ALTER ADD CONSTRAINT qualificado e limitado, sem admissão genérica
de PL/pgSQL. Os artifacts STYNX mantêm a prova instalada própria, fora deste registry.

Inspector pode ampliar somente o novo `tools/rls-ddl/tests/check.test.mjs` e suas
fixtures autorizadas: copiar cada corpo aprovado integralmente e exigir positivo;
alterar um byte, inserir capability/target protegido ou trocar linguagem e exigir
recusa; anexar statement malicioso depois de um corpo aprovado e exigir recusa.
Incluir o falso EXECUTE em literal do verify como positivo sem registry. Preservar
RED anterior e prova independente dos digests; não mudar os DO de produção para
conformar ao classificador. Este registro não é execução, aceitação de instalação,
dispensa de gate, abertura de PR ou alteração da política da campanha.

## D-160.11 — Restauração do contexto owner após artifact offline

O Architect conferiu `0006_nullable_active_reservations.sql:3` instalado e
`19-stynx-offline.sql:374`: o artifact canônico contém `SET LOCAL row_security = off`
para manutenção owner com visibilidade completa. Esse GUC do owner não é ALTER
DISABLE RLS e não remove flags/policies; não concede request path privilegiado.
O consumidor não o injeta nem altera o texto publicado. O escopo fresh A160-07
permanece, e o verifier público continua exigindo transação nova realmente read-only.

Engineer pode acrescentar, **fora** dos textos canônicos, `SET LOCAL row_security = on`
depois do grupo STYNX completo e antes da continuação/finalização do plano legado,
junto à restauração de search_path. É restauração do contexto de entrada owner,
não reparo de schema nem normalização de verifier. Executar assertions finais com
semântica ordinária; transações pre/post também explicitam row_security on. Inspector
pode observar essa restauração no novo sensor de instalação já autorizado. Nenhuma
conexão app assume owner/off, nem se usa a restauração para transformar report RED
em PASS sem execução real da boundary definida.

## D-160.12 — Contrato prospectivo de admissão forward, sem pin ou execução 1.6.1

**Architect; preparação F1 somente.** Não amplia B17 para instalar/consumir 1.6.1,
não altera os arquivos F2/F3 nem a recusa atual de upgrade em A160-07a. Define as
condições para uma futura emenda de execução após publicação verificável e admissão
independente; a existência de código upstream não satisfaz essas condições.

### A160-12 — API observada em source, ainda sem prova de pacote publicado

Leitura read-only de STYNX
`a04f2d55ea8d34cb1385af34706595d69daa43a8`, commit que adiciona o seam, confirmou
`packages/offline-sync/src/index.ts` exportando `renderOfflineStorageMigrations`
e os tipos `OfflineStorageMigration`/`OfflineStorageMigrationsArtifact`.
`storage.ts` declara `options?: OfflineStorageOptions` e retorno:

```ts
{
  contractVersion: string;
  packageVersion: string;
  binding: StorageRoleBinding;
  migrations: readonly {
    source: { path: string; sha256: string };
    sql: string;
    sqlSha256: string;
  }[];
}
```

O gerador no mesmo SHA registra 0001–0009, até
`0009_numbering_reconciliations.sql`; mantém statements de cada arquivo na ordem
original, marcados object/binding. O renderer usa o binder suportado do próprio
pacote, omite reader conforme binding e calcula SHA-256 dos bytes SQL retornados.
Ele é puro: não verifica prefixo instalado, não mantém ledger, não abre transação,
não aplica SQL e não concede supported-mode. É responsabilidade consumidora admitir
estado anterior antes de escolher quaisquer migrations.

Comparação independente dos oito raw SQL históricos entre esse SHA e a publicação
1.6.0 `60e53ad791a4d031ab137a344fd994fe97bcb514`: **8/8 byte-idênticos**. Isso é
observação desses dois sources, não garantia para o futuro tarball. Não foram
verificados nesta leitura release/protected run, tarball, installed d.ts, testes
upstream, docs finais ou igualdade dos digests rendered entre versões: a 1.6.0 não
expõe esse renderer por migration. Revalidar API, pacote/source/proveniência e todo
prefixo na versão efetivamente publicada; qualquer divergência é checkpoint.

### A160-12a — Pré-condições de uma execução futura

Antes de F2, uma emenda F1 deve nomear a versão final exata publicada e seu grupo
fixo, fonte imutável/tarballs/exports instalados, binding e inventário de migrations,
formato de ledger/receipt forward e paths de implementação/sensores. Não usar source
workspace, cherry-pick upstream, import privado, API presumida ou range de versão.
Até essa emenda, permanece autorizado somente o pin exato 1.6.0 e seu caminho fresh/
same-artifact; nenhum código deste contrato forward pode ser executado.

O binding de origem e destino é idêntico, literalmente postgres/role_app_backend/
reader null/auth.tenants(id). Mudança de owner, role ou tenant identity não é upgrade
forward e exige outra decisão. Recomputar cada sqlSha256 e conferir fonte raw/shipped
contra o manifesto publicado. Paths/ordem/identidades são fechados: duplicata, buraco,
prefixo não contíguo, source desconhecido ou fonte trocada recusam. Não basta ordenar
IDs lexicalmente e pular qualquer ID encontrado numa tabela.

### A160-12b — Prefixo receipted e custódia do estado anterior

Admitir somente prefixo contíguo exato da cadeia publicada, apoiado em receipts
imutáveis confiáveis. Para cada migration forward já executada, o receipt registra
ordinal/source path, raw source SHA-256, bound SQL SHA-256, versão/contractVersion,
binding, pacote/entrypoint/cadeia de proveniência e predecessor. Esses raw/rendered
digests devem coincidir com o mesmo prefixo renderizado pelo pacote alvo; mudança
histórica recusa, mesmo que ambos os manifestos locais sejam autoconsistentes.
Receipt não pode ser substituído ou criado para simular execução anterior ausente.

Receipts por si não demonstram estado vivo. Exigir uma destas bases de catalog
custody, **sempre acompanhada dos checks atuais de rows/invariants de todos os
tenants** antes da primeira escrita:

1. Verifier público da versão anterior exata, em instalação isolada/retida de
   proveniência verificada, com owner real em transação nova READ ONLY, supported
   true e nenhum FAIL/UNKNOWN; conferir a versão, binding e digest da implementação.
2. Custódia de catálogo esperado anterior capturada independentemente e persistida
   imutavelmente, vinculada ao receipt, versão, binding e observação original.
   Comparar o catálogo vivo completo com essa custódia e conferir roles/memberships,
   grants, FORCE RLS/policies, constraints, triggers/FKs e checks de dados/invariantes
   atuais por código verificado adequado à versão anterior. Hash informado pelo
   chamador, manifest editável, catálogo coletado agora e tratado como esperado,
   booleano trusted ou um velho supported=true não são essa custódia.

Se a versão anterior/checks adequados não estiverem disponíveis, ou faltar visibilidade,
evidência ou leitura de qualquer obrigação, recusar. Não aplicar latest verifier antes
dos objetos novos e ignorar seus FAIL como se isso comprovasse o estado antigo. Nunca
tornar verifier writable ou usar settings para mascarar permissões/rows.

### A160-12c — O que o ledger fresh 1.6.0 conserva e o que falta

Na implementação F2 examinada em `tools/stynx-storage-install.mjs`, cada linha
`integration.stynx_storage_installations.identity` conserva metadata do pacote:
versão/contractVersion, binding, entrypoint SHA, full artifact/objects/roleBindings
SHA, manifesto original com catálogo/template/dependencies e hashes dos oito raw
migrations, mais sourceManifestSha256. Owner/instante pertencem à instalação fresh
real. A preservação/segurança desse ledger ainda depende dos sensores live pendentes;
esta leitura de código não é aceitação.

Esse ledger **não** conserva receipts de execução por migration, seus bound SQL
digests individuais, reports de verifier anteriores ou snapshots independentes de
catálogo vivo. A execução fresh foi objects completos seguidos de bindings, não a
sequência intercalada por arquivo do novo renderer. Não renomear essa evidência como
execução antiga de 0001–0008, nem preencher timestamps/atores/digests históricos.

Uma possível admissão futura de baseline fresh precisa de decisão F1/F3 específica:
reter/verificar o pacote 1.6.0 e seu artifact completo original contra o receipt,
conferir os oito raw sources inalterados e comprovar o catálogo/invariantes anteriores
por A160-12b. Qualquer derivação dos novos bound-prefix digests deve ser identificada
como compromisso prospectivo observado agora, com prova independente de equivalência
ao baseline, nunca como digest que teria sido receipted em 1.6.0. Enquanto essa ponte
não for definida e demonstrada, o ledger fresh atual sozinho **não satisfaz** a
admissão de prefixo forward. Não reexecutar bootstrap para produzir receipts faltantes.

Evolução futura mantém linhas fresh intactas; uma nova cadeia append-only pode
referenciá-las sem UPDATE/DELETE/reset. Sua schema/ACL/imutabilidade e conversão de
baseline ainda não são autorizadas por esta seção. Estado anterior sem nenhum receipt,
schema parcial ou estado de versão/binding desconhecido sempre recusa.

### A160-12d — Execução faltante, atomicidade e verificação final

Na futura execução autorizada, preservar A160-09: manutenção com writers parados,
owner real, session lock no database postgres `(7007,1600)`, revalidação do prefixo
sob target xact lock `(7007,1)` e transação owner única com visibilidade total.
Executar somente migrations **posteriores** ao prefixo admitido, na ordem publicada,
pelos bytes recebidos do export público. Nenhum objectsSql fresh, raw SQL reescrito,
replay dos arquivos anteriores, platform runner, reordenação, IF NOT EXISTS injetado,
remoção de backfill/guard ou marcação de ID sem checksum.

Na mesma transação, aplicar separadamente roleBindingsSql do pacote alvo, restaurar
row_security/search_path do contexto consumidor, conferir catálogo/receipt assertions
e append dos novos receipts com predecessor. Falha reverte todas as novas migrations
e receipts do grupo. Em interrupção, próxima entrada revalida exatamente o último
prefixo commitado; não existe prefixo parcialmente receipted. No-op/replay exato
não muda histórico, actor/instante/digest de receipt ou contadores operacionais.

Após commit, transação **nova READ ONLY** executa latest verifier público instalado
com binding aprovado. Unsupported/FAIL/UNKNOWN mantém STOP, sem simular rollback
do commit anterior; writers continuam parados até as caracterizações consumidoras
aplicáveis também passarem. O receipt registra execução de migration, não verdade
de source/provider, efeito de negócio, assinatura ou readiness completa.

### A160-12e — Prova futura e fronteira presente

O futuro escopo F3 independente deve cobrir pelo menos: prefixo correto/populado e
somente suffix executado; raw/rendered prefix digest drift; gap/duplicate/reordered/
unknown source; binding/version divergence; missing/untrusted receipts/catalog custody;
prior verifier ausente/unsupported e dados invariantes divergentes; manutenção owner/
locks/concorrência; falha no segundo forward com rollback do grupo/receipts; retry
seguro; snapshots de histórico/identidades/counters/bytes preservados; post verifier
READ ONLY supported e app/tenant A/B regressions. Provar defaults e binding DETRAN
em PostgreSQL real, não apenas igualdade de plano ou mock de psql.

Não se autoriza agora autoria/execução desses testes forward ou implementação F2:
os paths atuais continuam destinados ao contrato fresh 1.6.0. Esta preparação não
reclassifica RLS RED/PASS, sensores role novos ou execução fresh ainda pendente,
nem fecha os seis gaps offline, provider/trust externos, transporte/cutover ou PR
final. Os resultados atuais continuam no seu próprio escopo e custódia.

## D-160.13 — Prova separada de equivalência do baseline fresh

**Architect; especificação F1 prospectiva somente. Estado: HELD, sem identidade
publicada admitida ou prova de baseline aceita.** Concretiza a ponte pendente de
A160-12c. Não autoriza pin 1.6.1, execução de renderer/migrations, mudança F2/F3,
schema novo ou edição das duas linhas fresh originais. Os resultados source-only
upstream, mesmo PASS, não são publicação nem aceitação DETRAN.

### A160-13 — Registro de custódia e significado do prefixo

A prova é um documento fechado de formato
`detran-stynx-offline-fresh-baseline/1`, separado do receipt fresh. Campos adicionais,
duplicados, placeholders, digests malformados ou referências sem conteúdo verificável
recusam. Referências de evidência contêm path relativo, SHA-256 e identidade do
produtor/observação; não contêm URL de banco, segredo ou autoridade de provider.

| Campo obrigatório   | Conteúdo e prova                                                                                                                                                                                                                                                                                                                                                           |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `subject`           | Identidade estável observada de cluster/database e owner SQL real; binding literal A160-12a. Uma cópia/restore de banco não herda admissão sem nova conferência de identidade e estado.                                                                                                                                                                                    |
| `freshReceipt`      | Relação/key e linha offline original completa (`package`, `identity`, `installed_by`, `installed_at`), digest da linha, fonte/DDL/implementação de assertion que a conferiu e referência às duas linhas fresh do grupo. Capturar timestamp como texto SQL com precisão preservada, sem JavaScript Date; não inventar a representação lexical original da inserção.         |
| `priorPackage`      | Exato 1.6.0 publicado e retido: source/tarball/entrypoint/d.ts, artifact completo original, metadata/manifest e seus digests. Reproduzir objects/bindings/hash com o export público anterior e comparar ao receipt; conferir o algoritmo exato de sourceManifestSha256 da implementação que produziu a identidade, sem selecionar uma normalização para fazê-la coincidir. |
| `targetPublication` | Exato 1.6.1 final publicado: source/tag/release/proveniência protegida/tarballs e exports instalados/d.ts com digests. Não preencher esses campos com os SHAs source-only de A160-12 ou com versão presumida.                                                                                                                                                              |
| `coveredSources`    | Prefixo ordinal 1–8, paths exatos e raw SHA de cada fonte da instalação fresh, idênticos às fontes do renderer alvo. Significa fontes cobertas pelo artifact fresh, **não oito migrations executadas individualmente**.                                                                                                                                                    |
| `projectedPrefix`   | Campo de significado fixo `not-executed-on-subject`; oito entradas ordenadas `{ordinal,sourcePath,rawSha256,boundSqlSha256}`, bytes renderizados retidos, digest do conjunto, binding e identidade da implementação pública alvo. São observações prospectivas, nunca receipts históricos.                                                                                 |
| `priorState`        | Método A160-12b, catálogo esperado de custódia confiável, catálogo vivo e report de checks atuais de todas as rows/invariants/roles/grants/visibility, com versão/binding/identidade e READ ONLY reais. Captura atual não pode ser simultaneamente seu próprio catálogo esperado.                                                                                          |
| `equivalence`       | Relatório independente de equivalência estrutural/comportamental descrito abaixo, identidade das instalações de rehearsal, catálogos/reports/snapshots e todos os digests.                                                                                                                                                                                                 |
| `review`            | Inspector que capturou/reproduziu a prova e revisão independente aplicável da campanha sobre os mesmos bytes; referências aos reports e disposition aceita. Engineer não aprova sua própria custódia; esta especificação Architect não é essa revisão.                                                                                                                     |
| `recordSha256`      | SHA-256 do documento inteiro sem somente esse campo raiz. Legal JSON, chaves recursivamente ordenadas por UTF-16, arrays na ordem original, UTF-8; digests novos `sha256:` + 64 hex minúsculos. Digests legados dentro da linha preservam seus valores/formato originais.                                                                                                  |

Os reports embutidos revisam os digests das evidências anteriores; não incluem o
recordSha256 final no conteúdo que este mesmo registro digere. A ratificação dos
bytes completos do registro é detached, na evidência governada vinculada ao SHA
final, evitando referência circular e preservando a revisão do candidato exato.

Para demonstrar equivalência sem copiar binder privado, o futuro Inspector compara
dois rehearsals novos exclusivos: instalação fresh pelo artifact público 1.6.0
retido e instalação de referência do prefixo 1–8 pelo renderer público alvo
publicado. O verifier público **1.6.0** deve aceitar ambos sem FAIL/UNKNOWN;
catálogos completos/ACLs/binding, invariantes e casos com dados controlados devem
coincidir no escopo anterior. Revisar separadamente ordem/efeitos/guards do prefixo
e ausência de história operacional fabricada. Igualdade de schema vazio sozinha
não é equivalência comportamental. Esses rehearsals exigirão escopo F3 específico;
não executar agora nem aplicar o prefixo no banco sujeito ao upgrade.

Essa prova, quando aceita e revalidada, pode ancorar o prefixo fresh coberto 1–8.
É a concretização prospectiva da ponte de A160-12c: não exige nem permite fabricar
receipts individuais ausentes. Os receipts forward reais começam no primeiro suffix
efetivamente executado, apontando para esse anchor. Se não houver equivalência
demonstrável, conservar a recusa; não alterar raw SQL ou escolher outro esperado.

### A160-13a — Schema de persistência futura, ainda não autorizado

A futura emenda de execução deverá materializar duas estruturas append-only owner-only,
separadas de `integration.stynx_storage_installations`:

- **Custódia de baseline:** identidade `recordSha256`; pacote, digest do receipt
  fresh e identidade da publicação alvo formam a chave lógica única; documento
  original integral e owner/instante reais da admissão. Mesmo conteúdo repete a
  mesma prova; conteúdo diferente sob a mesma chave recusa, sem substituição.
- **Receipts forward:** pacote/ordinal únicos; source path/raw SHA/bound SQL SHA,
  binding/publicação, predecessor tipado baseline ou forward com digest exato,
  owner/instante reais de execução e referência integral à evidência. Nenhuma linha
  é criada para os arquivos fresh 1–8. Cadeia contígua, sem fork, gap ou reset.

Owner postgres, RLS/FORCE, guards UPDATE/DELETE/TRUNCATE e ausência de leitura/mutação
app/reader/auditor/PUBLIC, inclusive grants/defaults/memberships efetivos e revogações
finais após DDL20. Uma definição SQL exata, constraints/ACL/assertions e paths F2/F3
serão examinados na futura emenda; esta descrição não autoriza sua criação agora.
As duas linhas fresh originais nunca são atualizadas para uma nova versão.

### A160-13b — Minuta de execução exata 1.6.1 e recusas

O pacote reviewable futuro precisa preencher conjuntamente: identidade publicada
1.6.1/grupo fixo; API/SQL/source digests instalados; prova A160-13 aceita; schema exato
e paths F1/F3/F2; inventário de pin/manifests/lockfile; comandos de aceitação e
ordem/review da campanha. Só então uma emenda prospectiva poderá liberar execução.
Revalidar a prova contra estado vivo sob exclusão owner A160-09 imediatamente antes
do suffix; uma prova antiga não dispensa prior-state atual.

Na execução futura, admitir baseline ancorado mais receipts forward contíguos;
conferir cada digest/binding anterior e executar somente o suffix ausente. RoleBindings
alvo são separados, receipts e forwards commitam atomicamente, e latest verifier
roda em **nova READ ONLY** depois do commit. Preservam-se rollback/STOP, histórico,
contexto owner e coordenação dos locks descritos em A160-12d.

Recusam: publicação ausente/divergente; proof self-authored sem revisão independente;
receipt inexistente/alterado ou ledger inseguro; baseline incompleto/desconhecido;
prefixo/raw/rendered digest ou binding divergente; catálogo/rows/invariants sem
custódia/checks adequados; UNKNOWN/permissão/visibilidade; prefixo replay no sujeito;
fork/gap/receipt sintético; clock/ator/digest histórico inventado; package privado,
raw SQL reescrito, platform runner ou qualquer bypass. Não converter igualdade de
hashes fornecidos pelo chamador em confiança aprovada.

Permanecem **HELD** publicação verificável, prova real/revisão e schema/escopo de
execução. Nenhum valor normativo, amostra do provedor, OID, âncora, challenge ou trust
externo é aprovado por esse documento. Preservam-se B5/B6/B16, os checkpoints offline,
caracterização/cutover e a política de PR único; esta seção não promove readiness.

## D-160.14 — Stored bodies dinâmicos: admissão exata e recusa de opacidade

**Architect; refinamento prospectivo de A160-10, mesmos paths F2/F3.** Um corpo de
FUNCTION/PROCEDURE não pode ser ignorado por estar dollar-quoted ou por não executar
durante CREATE. Dynamic EXECUTE desconhecido/alterado recusa já na definição; CALL
posterior não o legitima. Corpos SQL/plpgsql estáticos continuam sujeitos à análise
de statements/role capabilities/contexto/objetos protegidos; texto em literal não
cria sinal da helper. Linguagem, representação de corpo ou construção relevante
opaca não suportada recusa, sem expandir admissão para qualquer procedure/function.

Revisão independente do DDL consumidor não pertencente aos dois artifacts STYNX
identificou somente duas funções existentes com EXECUTE procedural efetivo, ambas
em `11-auth-functions.sql`. As funções priority armazenadas não têm EXECUTE dinâmico;
seus EXECUTE dinâmicos pertencem aos DO já registrados em D-160.10. As duas funções
abaixo, corpo e statement completo, são byte-idênticas ao HEAD/base
`9af7682479fd338b0c81bf56548d21b3021cdf76`.

| Identidade exata                                      | Bytes do corpo | SHA-256 do corpo                                                   | Bytes do CREATE | SHA-256 do CREATE completo                                         |
| ----------------------------------------------------- | -------------- | ------------------------------------------------------------------ | --------------- | ------------------------------------------------------------------ |
| `auth.create_rls_policy(p_schema text, p_table text)` | 524            | `43d1c5fcdc6577fbb8a7900d09f3823848264d47151ea18f5bf3916af35af1c2` | 641             | `81a0969747442e9b9be35325e9fb21939badebf3fb8280cdfb44857fea1c2076` |
| `auth.install_tenant_triggers()`                      | 2495           | `68c11a65a8c6087adef4b11b0ce91716ab3bd432e0080e20266363b13341ed4a` | 2591            | `b147e07428543aa2e083c9a5e7c4af888bc661149cbad0e2c329ec1fe30984c2` |

O hash de corpo segue D-160.10. O hash CREATE cobre bytes UTF-8 do `C` de CREATE
até o `;` que termina esse statement, incluindo assinatura, RETURNS, linguagem,
opções, AS/delimiters e corpo, sem trim interno ou normalização. Ambos são exatamente
CREATE OR REPLACE FUNCTION, RETURNS void, LANGUAGE plpgsql, sem SECURITY DEFINER
ou configuração adicional. Não basta reutilizar corpo com outro nome/assinatura,
LANGUAGE, SECURITY ou prefixo/sufixo executável. Engineer pode materializar somente
estas duas entradas no helper já autorizado; o restante do arquivo continua analisado.

Efeitos revisados:

- `create_rls_policy`: forma identidade por `format('%I.%I',p_schema,p_table)` e usa
  esse nome escapado nos quatro templates fixos: ENABLE/FORCE RLS, DROP da política
  tenant_isolation e CREATE com USING/WITH CHECK de tenant corrente. Não aceita SQL
  como parâmetro. Sua definição exata preserva a helper existente; suas chamadas
  continuam exigindo literais ordinários/identidade consumidora admitida. Chamada
  que tente alterar política package-owned continua recusada por A160-05b; o hash
  da definição não concede autorização a argumentos ou tabelas arbitrários.
- `install_tenant_triggers`: inspeciona somente BASE TABLE com tenant_id nos nove
  schemas literais auth/audit/storage/integration/inf/est/ch/ops/portal, exclui
  partitions herdadas e escapa schema/table por `%I`. Cria a guarda fixa de tenant
  somente quando ausente, ou recusa divergência de função/tipo/coluna/qualifier/
  enabled state. Não enumera outbox/offline, não altera role ou apaga guarda. Sua
  chamada existente sem argumentos permanece; isso não prova segurança de catálogo
  vivo nem dispensa os checks independentes.

Não há whitelist por filename, nome parecido, regex EXECUTE format ou conteúdo
atual auto-hashed. Uma mudança de byte nesses statements perde admissão exata e
exige revisão F1 própria ou classificação estática realmente suficiente. Função
homônima redefinida depois, procedure nova, EXECUTE por concatenação/variável ou
linguagem opaca não herdam esses hashes. INSERT de texto como comando, nested DO,
ROLE/USER/membership/context mutation e objeto protegido continuam fail-closed.
Os artifacts STYNX seguem sua prova instalada byte-bound própria, sem nova exceção.

Inspector pode ampliar somente o novo `tools/rls-ddl/tests/check.test.mjs` e fixtures
autorizadas: duas definições exatas positivas; alterações de corpo, nome/assinatura,
SECURITY/language e statement anexado negativas; procedure com EXECUTE de GRANT
postgres seguida de CALL negativa; strings benignas contendo EXECUTE/helper sem
cobertura falsa positivas. Preservar os RED independentes já capturados. Não editar
helper SQL, procedimentos legados, testes antigos, renderer ou grants para conformar
ao sensor. Este refinamento não aceita a instalação nem promove os PASS focados a
readiness, e mantém pin/forward/provider/trust e política de PR nas fronteiras anteriores.

## D-160.15 — Preparação observacional instalada 1.6.0, somente DB04

**Architect, 2026-10-13; PREPARATION / NOT_BASELINE_ADMISSION.** Escopo separado e
menor que o documento fechado D-160.13: coletar custódia observacional atual da
instalação publicada 1.6.0 no banco descartável
`detran_r22_install160_2026101204`, nunca num alvo de upgrade/produção. Não há campo
de target, projectedPrefix, equivalência aceita ou receipt individual de migration.
O Architect não executa SQL; Inspector coleta somente após lease exclusivo do maestro.

Entrada prior-only congelada pelo maestro:
`scratch/r22-adoption-160/baseline-preparation/prior-package-retention.json`, SHA-256
`1bb213a150d00a07a738b173fcf9080d9b8abb26f760a50e2e4a679e8f5245eb`.
O Architect conferiu esse arquivo/hash e seus rótulos: 3 pacotes, 1255 arquivos
instalados, 74 referências de fonte, 6 referências com bytes retidos do source
imutável e 8 migrations próprias offline. A contagem/resolução foi produzida pelo
maestro; esta leitura não reexecuta a comparação de todos os arquivos. A versão
preparatória anterior acd6… não é entrada deste escopo. Drift antes/depois recusa.

### A160-15 — Lanes e captura read-only

- **F1:** esta seção. Não altera D-160.13 ou as duas linhas fresh.
- **F3/Inspector:** reproducer ad hoc e resultados somente sob
  `scratch/r22-adoption-160/baseline-preparation/`, incluindo
  `capture-installed-160.mjs`, `current-observation.json`, reports públicos outbox/
  offline, catálogo/rows/sequence snapshots e índice de hashes. Não altera testes
  existentes, assertions, fontes do instalador ou fixtures do DB.
- **F2:** nenhum código de produção ou ferramenta permanente necessário para esta
  captura. Maestro somente mantém lease/input congelado e recebe os artefatos.

O reproducer usa conexão owner explicitamente selecionada pelo maestro, sem fallback,
sem URL/segredo no output. Confere `current_database()` exatamente DB04 e session_user/
current_user postgres, captura system_identifier do cluster e oid/nome do database
como textos exatos, versão do servidor e identidade da observação. Uma transação
nova `REPEATABLE READ READ ONLY` mantém snapshot consistente; confere readonly on,
row_security on, visibilidade owner completa e sem mudança de ROLE. SET LOCAL UTC/
search_path e ROLLBACK são controles de sessão/transação, não migração. Nenhum DDL,
INSERT/UPDATE/DELETE, import, seed, instalador, novo receipt, renderer futuro ou
reparo é executado. Se DB/owner/read-only/visibilidade não corresponderem, recusa.

Capturar as duas linhas fresh originais completas, com `installed_at::text` sob UTC
e sem conversão JavaScript Date; preservar precisão SQL, identity JSON e ator real.
Registrar essa representação como texto observado agora, sem alegar ser a string
original da inserção. Conferir metadata/manifest/binding/digests contra os pacotes
públicos 1.6.0 retidos e artifacts atuais exatos, inclusive implementação de digest
do ledger; não normalizar divergência para obter igualdade.

Executar ambos verificadores públicos 1.6.0 nessa boundary read-only, reter todos
checks, supported e hashes de entrypoints/d.ts. Coletar catálogo completo e snapshots
de rows/contagens das 24 tabelas package-owned, ledger e sequência já inventariados,
sem nextval, com números bigint/timestamps/bytea representados sem perda. Declarar
query/ordem/encoding de cada digest, preservar null/ausência e não converter bigint
em Number nem timestamps em milissegundos. Reutilização de um snapshot antigo deve
ser identificada; não o rotular captura atual. Congelar bytes de source/inputs antes
e depois, encerrar com ROLLBACK e devolver lease.

`current-observation.json` usa formato
`detran-stynx-installed-baseline-preparation/1`, status literal
`PREPARATION_NOT_BASELINE_ADMISSION`, subject observado, source/input hash,
freshReceipts, priorPackage/artifact/manifest identities, referências e hashes de
reports/catalog/rows/sequence, instante da captura, produtor e limitações. Hash do
registro segue canonical JSON de A160-13, excluindo somente seu campo raiz de digest;
os reports não referenciam esse digest final dentro de conteúdo digerido por ele.
É evidência atual do disposable subject, não catálogo esperado autoaprovado ou proof
fechada de equivalência.

### A160-15a — Limite de conclusão

Pode completar agora somente a captura/retenção prior-only 1.6.0 e sua revisão
independente nesse DB04. Antes de publicação/escopo/review futuros, continuam ausentes
target identity admitida, renderer instalado alvo, projected prefix de origem pública,
rehearsal de equivalência e admissão do baseline A160-13, schema/receipts forward,
pin/upgrade e autorização de execução. Verifier PASS atual não satisfaz essas faltas.
Sem provider samples/valores de trust aprovados, permanecem também os checkpoints
externos de assinatura; nenhum deles é preenchido por esta preparação.

## D-160.16 — Projeções offline 1.6.0 aditivas e inativas

**Architect, 2026-10-13.** Fonte: CTG-0009 §2.3/§3 V-05/§5, formatter atual
`submit-batch.command.ts:159` e `ConsumptionView` público do domínio. Tipos instalados
`@stynx-nyx/offline-sync@1.6.0`: `types.d.ts` SHA-256
`d5a461b4d7f8ecdb2fb4e2b53ecdcb31cac29f77a06d3a4a12f35d45169bfbe8`,
`offline-sync.service.d.ts` SHA-256
`ad77d90324d3ab6b609327cec0dd0349baf21e8958234d7b03af4d0738c31cc9`.
Essa leitura confirma símbolos/fatos representáveis, não comportamento V-05 aceito.

### A160-16 — Lanes e superfície fechada

- **F1:** esta seção, somente contrato de tradução; nenhuma decisão Owner reaberta.
- **F3/Inspector:** novo `backend/app/src/r22-stynx-offline.mapping.spec.ts`, coletado
  pelo tier unit atual; fixtures locais no próprio novo sensor. RED primeiro, depois
  verificação contra os tipos públicos instalados. Nenhum teste antigo alterado.
- **F2/Engineer:** novo `backend/app/src/r22-stynx-offline.mapping.ts`, sem import
  runtime dos módulos/domínios; imports type-only pelos exports públicos dos pacotes
  já declarados no app. Exports fechados `R22OfflineMappingResult`,
  `R22AppliedReceiptIdentity`, `projectR22AppliedSyncReceipt` e
  `projectR22NumberingConsumptionEntry`. Helpers internos podem permanecer nesse arquivo.

Não alterar index gerado, package/lock/blueprint, provider, façade, app.module, store,
controller, dispatcher, protocolo, writer legado ou marker. Nenhuma injeção/ativação,
rota nova, query SQL, import/transfer ou execução de serviço STYNX. É preparação de
funções puras inativas e não implementação da parte 2 de CTG-0009. Tokens/P-API,
assertions, formato HTTP/SSE e decisões vigentes permanecem.

### A160-16a — Recibo aplicado com fatos reais disponíveis

`projectR22AppliedSyncReceipt` recebe `SyncItemReceipt`, seu `SyncQueueItemRecord`
canônico correspondente e `R22AppliedReceiptIdentity` com tenant/device/batch/key/
localEntityId já validados pelo consumidor. Exigir identidade coincidente, inclusive
queueItemId receipt/item e chave explícita; não derivar um ID por posição, local ID,
UUID novo ou legacy resolver. Só admite status `applied` consistente nos registros,
com `receipt.stynx.serverEntityId` real, não vazio. Ausência histórica desse fato,
IDs conflitantes, estado pending/received/conflict/rejected ou erro não traduzível
retornam checkpoint interno sem fabricar valor. O fato de uma fonte ser tipada não
dispensa essas conferências; a função pura não substitui autenticação/lookup futuro.

Para esse subconjunto aplicado, devolver os sete campos de `SyncReceiptView`:

| Campo DETRAN       | Origem exata                                                                                                                                                    |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `local_entity_id`  | localEntityId canônico, igual à identidade validada                                                                                                             |
| `idempotency_key`  | idempotencyKey explícita, coincidente; sem sintetizar chave ausente                                                                                             |
| `status`           | `applied` preservado                                                                                                                                            |
| `server_entity_id` | `receipt.stynx.serverEntityId` original; nunca queueItemId/localEntityId como fallback                                                                          |
| `error_code`       | null somente quando nenhum errorCode/reasonCode de erro está presente nesse outcome aplicado; presença não traduzível bloqueia                                  |
| `error_message`    | null conforme formatter DETRAN atual; não descartar silenciosamente errorMessage de erro presente na fonte, que bloqueia esse subconjunto                       |
| `details_json`     | host context `receipt.context` preservado como JSON, ou null quando ausente, conforme formatter; não fundir `stynx`, consumerAttributes ou contexto recalculado |

Se `item.stynx.serverEntityId` também existir, deve concordar. Valores original
appliedAt/attempts/receiptId e metadados de plataforma não são reinterpretados como
ID UUID de recibo legado ou anexados ao envelope. A projeção do ACK aplicado não
pretende reconstruir linhas cruas de GET/listas. Não aplica, incrementa tentativa,
busca outro registro, gera relógio, resolve conflito, classifica erro V-03 ou refaz
payload/context fingerprint. Replay que fornece os mesmos fatos produz a mesma
projeção sem efeitos; provar isso não certifica replay end-to-end V-05.

### A160-16b — Entrada de consumo: tradução de nomes, sem reconciliação

`projectR22NumberingConsumptionEntry` recebe uma `NumberingConsumptionEntry` e
devolve `ConsumptionView`: number exato; `applied`→`aplicado`, `claimed-locally`→
`consumido_localmente`, `available`→`disponivel`, `blocked`→`bloqueado`,
`expired`→`expirado`; serverEntityId→server_entity_id e finalizedAt→finalized_at,
preservando strings/null sem Date ou normalização. Number deve ser inteiro seguro;
não converter string/bigint por Number nem arredondar. Status ou scalar fora do tipo
publicado bloqueia. Não impor novo limite de produto ao intervalo por esta tradução.

Não alocar/consumir/devolver número, ordenar lote, completar linhas ausentes ou
construir missingOnServer/unexpectedOnServer. `ReconcileNumberingResult` não fornece
sozinho todos os campos de envelope DETRAN; composição completa e comportamento
V-13 permanecem bloqueados. Esta função representa somente uma entrada já existente.

### A160-16c — Recusas, testes e limites

`R22OfflineMappingResult<T>` é união interna mapped/value ou checkpoint/reason,
com reason fechado `source-fact-unavailable`, `identity-mismatch`,
`unsupported-outcome` ou `invalid-public-value`. Não vira código HTTP/TEAT novo,
não retorna objeto parcialmente bem sucedido como envelope completo e não inclui
payloads/segredos no diagnóstico. Inputs/context JSON devem ser preservados sem
mutação, coerção/getters/toJSON ou perda de null/ausência; se não representáveis,
checkpoint. Nenhuma tabela de erro genérica/fallback para erro desconhecido.

Inspector prova expected literals independentes: servidor original aplicado/replay,
context JSON/null, identidade canônica distinta de local ID, tenant/key/queue mismatch,
fato histórico ausente, todos os estados não admitidos, erro/context inválido,
inputs congelados sem mutação; cinco estados de consumo, null/strings de timestamp
com precisão/offset preservados, limite de safe integer e recusa de arredondamento/
status desconhecido. Rodar sensor novo e typecheck app; sem DB, mocks de serviço,
rota alternativa ou alteração de assertions existentes para essa lane.

Continuam sem tradução completa lossless: GET/listas cruas (UUID/id/sent_at e demais
campos nem sempre publicados; paginação keyset não é a lista antiga inteira),
recibo de erro/conflict/context V-03, D-04 completo, V-04/07/08/10/13, agente versus
ator, ação/ACK/transportes e paridade de consumo/reconciliação. Nenhum V/M/C é marcado
PASS só porque essas funções puras passaram. Pin 1.6.0, writer/legacy marker, OD-C2-005,
checkout primário/PR #179 e provider/trust externos mantêm as fronteiras anteriores.

Para A160-15, explicita-se ainda a captura de `identity::text`, database owner,
session_replication_role origin e transaction isolation junto aos campos já exigidos;
catálogo esperado vem do artifact/manifest 1.6.0 retido, catálogo observado é coleta
pública separada. O report de preparação não autoaprova essa comparação como baseline.
Conservar também identidade repository/HEAD/branch/candidate manifest, SHA do
pnpm-lock.yaml, Node/runtime e versão/entrypoint pg, paths realmente resolvidos e
hashes dos verificadores públicos pelo anchor fixo backend/app/package.json. Revalidar
esses inputs congelados antes/depois; não substituir uma resolução diferente por
outra instalação que apenas declare 1.6.0. São observações de proveniência deste
rehearsal descartável, não identificação de um sujeito de produção.

## D-160.17 — Preparação inativa de desfecho de domínio e projeção de recibo

**Architect, 2026-10-13; preparação consumidora, não adoção de API futura.** Leitura
read-only do source imutável STYNX
`7f6952ea6840c2df0c4f126320c79392c0d989cd`, `ADR-MOBILE-OFFLINE-0005` D1/D1.1/D3,
`types.ts` e `domain-outcome.ts`, confirmou o seam prospectivo opcional síncrono/
detached `OfflineSyncDomainOutcomeClassifier`, proteção de falhas da plataforma e
desfecho received terminal com contexto original após rollback. Source não prova
publicação, API instalada, atomicidade DETRAN ou comportamento aceito. Não copiar,
importar, executar ou pinar esses arquivos/tipos futuros.

### A160-17 — Lanes e DTOs locais

- **F1:** esta seção e D-160.18. As decisões B5/B6/B16/OD-C2-005 permanecem.
- **F3/Inspector:** novo
  `backend/app/src/r22-stynx-offline-outcome.preparation.spec.ts`, tier unit atual,
  fixtures próprias no arquivo; RED antes de F2. Não editar os sensores aceitos,
  assertions antigas ou v2/v3/evidência DB04.
- **F2/Engineer:** novo
  `backend/app/src/r22-stynx-offline-outcome.preparation.ts`. Exports fechados:
  `R22DetachedDomainFailure`, `R22OutcomeProvenance`,
  `R22RecordedFailureReceiptFacts`, `R22OutcomePreparationResult`,
  `classifyR22DomainFailure`, `projectR22RecordedFailureReceipt`,
  `countR22AcceptedReceipts`. DTOs são estruturais locais, não casts para tipos SDK
  ausentes. Pode reutilizar `outcomeFor`/`CONFLICT_DESCRIPTION` pelos exports públicos
  **existentes** de `@detran/ops-offline-sync`; não acessar import profundo, serviço,
  provider ou API futura. Não alterar tabela de desfechos do domínio ou dependências.

`R22DetachedDomainFailure` contém somente origin (`consumer-domain` ou `platform`),
code original, httpStatus opcional de proveniência real e context opcional já
validado/detached. Não recebe exception crua, transação, callback, applier ou input
de request. O producer futuro deve provar a origem real; o label local não concede
autoridade a um caller e não substitui a proteção de classe/código da plataforma.

`R22OutcomeProvenance` exige source `failed-item-after-rollback` ou
`stored-canonical-receipt`, tenantId, auditActorId, effectiveAgentId, orgUnitId,
deviceId, deviceBatchId, queueItemId, receiptId, localEntityId e idempotencyKey pública
original (string ou null explicitamente observado). São fatos originais correspondentes,
nunca inferidos por posição/local ID/clock/UUID novo. Audit actor e business agent têm
fontes distintas: não preencher effectiveAgentId com auditActorId quando falta resolver/
proveniência. Seus valores podem legitimamente coincidir; não exigir desigualdade.
ReceiptId nativo não vira UUID de recibo legado ou chave pública sintética.

### A160-17a — Tabela existente e proteção de plataforma

`classifyR22DomainFailure` somente prepara um desfecho para source
failed-item-after-rollback válido. Não aplica, persiste, cria conflito, produz marker
ou afirma rollback real. Original code não vazio/de até255 bytes, sem coerção ou
inferência por message; code ausente/malformado recusa. Preservar exatamente a tabela
atual `outcomeFor`, inclusive fallback, com estes vetores independentes:

| Code original                              | Legacy status / conflito | Candidato prospectivo                                         |
| ------------------------------------------ | ------------------------ | ------------------------------------------------------------- |
| `TEAT.SYNC_LEGACY_ITEM_NOT_APPLIED`        | received / nenhum        | received, descriptor ausente                                  |
| `TEAT.SYNC_DESTINATION_NOT_WIRED`          | received / nenhum        | received, descriptor ausente                                  |
| `TEAT.SYNC_UNSUPPORTED_ENTITY_TYPE`        | rejected / nenhum        | rejected, descriptor ausente                                  |
| `TEAT.SYNC_INTEGRITY_ERROR`                | rejected / integrity     | **checkpoint integrity-path-required**, sem candidato         |
| `TEAT.NUMBERING_RESERVATION_FOREIGN_SHIFT` | rejected / domain        | rejected + domain                                             |
| `TEAT.NUMBERING_NUMBER_ALREADY_APPLIED`    | rejected / domain        | rejected + domain                                             |
| `TEAT.NUMBERING_RESERVATION_EXPIRED`       | conflict / domain        | conflict + domain                                             |
| `TEAT.SYNC_ITEM_CONFLICT`                  | conflict / domain        | conflict + domain                                             |
| `BOAT.SYNC_DUPLICATE_NATURAL_KEY`          | conflict / nenhum        | conflict, descriptor **ausente**                              |
| `TEAT.SYNC_CONCURRENCY_SUSPECT`            | conflict / concurrency   | conflict + concurrency                                        |
| Outro code original válido de domínio      | rejected / nenhum        | rejected explícito, sem presumir equivalência do fallback SDK |

Descrição de domain/concurrency é a `CONFLICT_DESCRIPTION` consumidora existente;
não usar exception message, inventar allowedActions/IDs/hash/actor/instant ou mudar
integrity para domain. A linha integrity mantém sua classificação legada registrada,
mas exige caminho próprio publicado/instalado de hash/integridade e testemunha
independente antes de qualquer integração. Não forjar `OfflineSyncNumberingOutcome`.

Origin platform **ou** qualquer code começando `OFFLINE_SYNC` produz
protected-platform, independentemente do status HTTP ou code parecido com TEAT.
Configuration/upgrade/integrity/sequence/replay/lease/numbering não entram no override;
não os converter por uma tabela genérica. Preservar original unknown domain code
com rejected/no conflict; code ausente não vira TEAT.INTERNAL nem outro substituto.

Context original é JSON legal plain, no máximo4096 bytes UTF-8, sem top-level stynx;
ausência permanece ausência, null explícito inválido, sem getters/coercion/toJSON,
symbols/cycles/nonfinite/precision loss. Não interpretar tenant/actor/agent presentes
no JSON como autoridade, nem fundi-los com platform evidence. HttpStatus opcional não
substitui a tabela de negócio e não é inventado a partir de um erro não HTTP.

`R22OutcomePreparationResult<T>` é união fechada prepared/value,
protected-platform (sem candidato) ou checkpoint/reason. Reasons fechados:
original-code-unavailable, invalid-original-data, missing-provenance,
source-identity-mismatch, integrity-path-required, stored-replay-required.
Resultado prepared de classificação contém legacyOutcome, candidateOutcome
(`status`, conflict opcional de domain/concurrency), code/context original e
proveniência detached. Unknown fields/accessors/thenables ou tentativa de applied
para efeito falho recusam. Nenhum resultado vira resposta HTTP automaticamente.

### A160-17b — Transporte somente de fatos canônicos gravados

`R22RecordedFailureReceiptFacts` contém origin consumer-domain/platform e provenance de stored-canonical-receipt,
status original received/rejected/conflict, code/context originais, serverEntityId
original **explicitamente string ou null**, e terminalReceived/retryable opcionais
apenas quando realmente gravados. `projectR22RecordedFailureReceipt` exige expected
provenance coincidente e origem consumidora válida; não invoca classifier para replay.
Não usar candidato recém calculado para representar recibo antigo ou pending.

Devolver somente os sete campos existentes: local_entity_id e idempotency_key
originais; status original; server_entity_id original, sem fallback; error_code
original; error_message null conforme formatter DETRAN atual; details_json context
original ou null quando ausente. Não emitir marcadores/metadata adicionais. Integrity
e falha de plataforma continuam nos caminhos protegidos acima. Se algum fato exigido
não estiver disponível, checkpoint, nunca campo preenchido por conveniência.

TerminalReceived presente deve ser true em status received com retryable false;
ausência nunca vira true. Essa validação local não certifica terminal replay do SDK.
Novos candidatos received não produzem marker nem histórico; a prova de persistência/
cross-batch replay exige futura API instalada e F3 própria. Sem source canônico,
stored replay não é reconstruído por rerun do classifier/policy.

`countR22AcceptedReceipts` conta somente sete-field receipts válidos já projetados:
applied e received contam; rejected/conflict não contam. Preservar a regra existente
`status !== rejected && status !== conflict` no universo fechado desses quatro
estados; unknown/null/pending/malformado recusa. Não usar input length, acceptedItems
nativo, número de aggregates, conflitos ou duplicates como substituto.

BatchId de servidor, deviceBatchId, local ID e queue ID continuam distintos. Não
montar envelope completo de lote, status200/201, headers ou ACK bytes por esta lane;
faltam identidade/proveniência e caracterização real. Nenhum default de TTL/window,
usage_mode, identity, contexto, application time, server entity ou confiança normativa.

### A160-17c — Aceitação restrita e fronteiras

Inspector cobre os10 codes+unknown/missing, descriptors ausentes de BOAT/received,
integrity defer, platform origin/reserved prefix, provenance ausente/conflitante,
agent/actor distintos e legitimamente iguais sem fallback, code/context originais
detached/imutáveis, contexto inválido/getter/thenable, todos os sete campos/nulls,
marker presente/ausente/contraditório e contagem received/applied versus input length.
Não usa mock de código futuro nem afirma efeito/rollback/replay atômico por teste puro.
Sensor novo, typecheck e higiene focados; nenhum DB/HTTP/serviço STYNX é executado.

Permanecem sem execução futura, provider wiring, provider/trust normativo, cutover,
pin/publicação alvo, lista crua lossless, gaps V03/04/07/08/10/13 e aceitação do
protocolo integral. Preservar fontes/provas v2/v3 e legado; nenhuma alteração nos
helpers aceitos A160-16. Sem stage/commit/push/PR/merge até emenda de integração.

## D-160.18 — Proposta concreta de custódia, somente F1 draft

[STYNX-OFFLINE-FORWARD-CUSTODY-DRAFT.md](STYNX-OFFLINE-FORWARD-CUSTODY-DRAFT.md)
contém DDL **não executável nesta autorização** para tabelas separadas baseline/
forward, predecessor tipado/contíguo, no-fork, owner/RLS/ACL/ALWAYS imutabilidade,
assertions e checklist de projeção pública ordered. Não consta de backend/database,
apply inventory, tools generator ou schema instalado. Não editar as linhas fresh.

A proposta requer closed/duplicate-aware JSON antes de JSONB, digests canonical
corretos, sujeito real/prior-state/review independentes e publicação alvo admitida.
O modelo estrutural não prova esses fatos; target publication, equivalência/projeção
e sujeito de produção continuam **HELD/NOT_ADMITTED**. Futura materialização exige
emenda F1/F3/F2 exata e revisão da proposta, nunca cópia automática deste draft.

## D-160.19 — Referência final unpublished e convenções locais de preparação

**Architect, 2026-10-13; F1 somente.** O source prospectivo STYNX congelado
`546c7ec8f3faa870ca4ae9f81ed27a8febb70f21`, tree
`26132340edf16d671675cda64d1a4e42708b6987`, foi conferido read-only contra
`7f6952ea6840c2df0c4f126320c79392c0d989cd`. Continua **UNPUBLISHED** nesta
admissão DETRAN; nenhum arquivo futuro foi importado, copiado ou executado.

ADR-MOBILE-OFFLINE-0005 D1.1 agora explicita que classifier configurado exige
CTG9 policyResolver e store com supportsDomainOutcomeClassifier literalmente true;
ausência recusa configuração antes da submissão legacy/durable. Sem classifier,
defaults/custom stores/E6 permanecem. A flag declara capability, não aceitação.
O helper/interface de classificação permanecem iguais; reasonCode agora documenta
também o code original classificado. Não exige mudança da lane pura A160-17, mas
é pré-condição adicional de qualquer futura composição publicada, nunca opt-in
fabricado numa custom store ou habilitação atual de provider.

Os OpenAPI de composição CTG9/E6 mantêm os mesmos paths, mas regeneram schemas e
requestBody/responses, incluindo agentId, signals/terminalReceived e reconciliação.
Isso não certifica status/envelopes/bytes no DETRAN nem autoriza trocar seus schemas.
Digests dos bytes imutáveis examinados:

| Referência em STYNX nesse SHA                                     | SHA-256                                                            |
| ----------------------------------------------------------------- | ------------------------------------------------------------------ |
| `law/adr/ADR-MOBILE-OFFLINE-0005-acceptance-evidence.md`          | `9367d4166fb2707948ec985910e01e11e9e726c7248ea971db612ef9da10541f` |
| `docs/framework/contracts/offline-sync-api.md`                    | `79f2b7aaa41af969c797610177bb3978515e3a3912d1122fbb576598c92c74b9` |
| `docs/framework/contracts/openapi-compositions/offline-ctg9.json` | `7067eab9159bf62cc2e23191d7a24e3d41f67cf1c6b4c270effbbbd38b6e6532` |
| `docs/framework/contracts/openapi-compositions/offline-e6.json`   | `9107757b6539cf54f1aff5bb833b27f1b43a5720a02f68f58ac205281eb19175` |
| `packages/offline-sync/src/types.ts`                              | `5e2981e73274c0f4a3ce4e151de4c71d4959bef7b3a01c140fdada4f20189e3c` |
| `packages/offline-sync/src/domain-outcome.ts`                     | `35e6503d588b5b3f11ae3a72d2d4ab35ff9760f2c2959adeb9eec5b58ba11e07` |

### A160-19 — Interpretação fechada antes de F3/F2

Para evitar carregar DI pelo index público, A160-17 permite os **literais de
vocabulário consumidor** exatos de sua tabela/CONFLICT_DESCRIPTION somente no novo
arquivo inativo. Não é cópia de código STYNX ou patch no domínio. Fonte consumidora
conferida: `batch-protocol.ts` SHA-256
`71becc9c391f12c2c990a237473b81fbb18f561e0143142cc29074cdbcfd31e8`.
Lookup usa own-key/Map ou equivalente: nomes herdados `__proto__`, constructor,
toString etc são unknown codes e dão rejected/no conflict. Não reproduzir o
comportamento acidental de lookup herdado de um objeto ordinário. Inspector prova
os10 casos/descrições e fallback contra o contrato/fonte, sem mock da regra real.

Assinaturas locais: classifyR22DomainFailure(failure, provenance),
projectR22RecordedFailureReceipt(facts, expectedProvenance) e
countR22AcceptedReceipts(receipts). Classificação prepared/value contém exatamente
legacyOutcome, candidateOutcome, code, context opcional (ausência preservada) e
provenance; projeção contém os sete campos; contagem contém number. Nenhum callback,
classe de exception, service ou DTO futuro é acrescentado.

Os três DTOs externos são fechados; unknown own fields/accessors são
invalid-original-data. Context permanece objeto JSON aberto dentro das regras
A160-17, não um DTO fechado por nomes de negócio. Missing/undefined required
provenance é missing-provenance; valor presente malformado é invalid-original-data;
modo source reconhecido mas inadequado à função é stored-replay-required;
divergência de fatos de identidade no mesmo modo é source-identity-mismatch.

Ordem da classificação: descriptors/shape/origin primeiro; malformed/unknown recusa
sem getters. Origin platform bem formado produz protected-platform mesmo sem code/
provenance. Code string original válido começando literalmente OFFLINE_SYNC também
é protected-platform. Para domínio, code ausente/undefined/vazio/só whitespace é
original-code-unavailable; nonstring, mais255 bytes UTF-8 ou Unicode inválido é
invalid-original-data. Nunca trim/normalizar/substituir o code devolvido. Seguem
provenance, integrity-path-required, context e demais scalar checks. Nenhuma dessas
recusas autoriza override de plataforma ou mensagem/código fabricados.

Números finitos JSON são preservados exatamente no modelo já representado, como
A160-16; não impor rejeição geral de integer inseguro dentro de JSON opaco nem
converter string/bigint para Number. Campos tipados integer/count mantêm suas
conferências próprias. HttpStatus opcional é integer100–599 de proveniência HTTP
real; fora disso é invalid-original-data. Essa validação da preparação local não
redefine o comportamento do SDK, contrato HTTP ou inputs do produto ativo.

Os nomes exatos são legacyOutcome.conflictType e candidateOutcome.conflict.type;
não conflictKind/kind. Count recebe array denso de objetos com exatamente sete own
data fields: local_entity_id/idempotency_key/server_entity_id/error_code/error_message
string ou null; status não nulo no universo applied/received/rejected/conflict;
details_json objeto JSON legal ou null. Não acrescenta invariantes de applied/server/
erro/provenance próprios dos projectors: contagem não certifica o registro. Marker
terminalReceived ausente/undefined permite retryable boolean true ou false sem
inferir terminalidade. Marker presente exige true, status received e retryable
explicitamente false; contradição ou falta dessa relação é invalid-original-data.

Essas convenções foram compartilhadas com Engineer/Inspector antes de F3 pronta;
não reabrem Owner decisions ou ampliam paths. Target publication/equivalence,
schema live/produção, pin, integração, provider/trust e PR permanecem HELD.

## D-160.20 — Strings originais gravadas, sem limite novo por trim

**Architect; clarificação prospectiva de A160-17/A160-19 antes do próximo delta
F3/F2.** Leitura independente de `submit-batch.command.ts:101` confirma input
idempotency_key `z.string().min(1).max(160).nullish()`, sem trim; o formatter em
§receiptView preserva a string da linha e usa null somente no fallback nullish.
Preparação de fatos gravados não é admissão de novo request.

`R22OutcomeProvenance.idempotencyKey` preserva qualquer string legal original,
inclusive vazia, somente whitespace ou com whitespace nas extremidades, ou null
explicitamente observado. Não trim/normalizar, converter a null, rejeitar por
trim-nonblank ou inferir outra chave. Missing/undefined required key continua
missing-provenance; valor presente fora de string/null continua invalid-original-data;
duas strings diferentes continuam source-identity-mismatch mesmo se seu trim coincidir.
Admitir uma string vazia histórica nessa preparação não muda a validação ativa de
novo input nem prova que tal fato foi produzido pela rota atual.

`R22RecordedFailureReceiptFacts.serverEntityId` também é string legal original ou
null, inclusive string vazia/whitespace preservada. Não herda a exigência de servidor
aplicado não vazio de A160-16. Os demais campos de identidade/provenance mantêm suas
conferências anteriores; esta exceção explícita de representação não cria IDs,
fatos faltantes, canonicalidade ou default. Count segue seu schema-only já fechado.

Inspector acrescenta somente ao novo sensor A160-17 vetores independentes de
empty/whitespace key, preservação exata e mismatch sem trim, mais server string
vazia/whitespace e null. Registrar o RED novo antes da correção Engineer somente
na nova lane; preservar o checkpoint148 PASS/fonte6e5b…/F1 anterior e seus logs.
Nenhum teste antigo, helper aceito A160-16, regra ativa de domínio, DB ou API futura
é alterado. Os demais holds e a política de integração permanecem.
