# R-0004 — frente `param-store` (ADR-0021; parte de parâmetros do WP-A do RAIT)

**Status:** as seis tasks foram concluídas, os gates locais estão verdes e os delivery reviews
finais dos dois CTGs retornaram `PASS` com Fable 5.1, sem achados remanescentes. Os highs e lows
encontrados nas tentativas anteriores foram corrigidos em emendas únicas por grupo e reavaliados.
Maestro GPT-5.6 Sol; reviewer Fable 5.1 via `tools/orchestra/bridge.sh claude fable`. Nenhum
commit, push ou PR desta rodada foi feito até este checkpoint.

## Metas

1. Blueprint `docs/framework/blueprints/BP-OPS-PARAMETER-001.json` (namespace `ops`, entidade
   `Parameter` → tabela `ops.parameter` com as colunas da ADR-0021 §Decision 1, índice único em
   `(tenant_id, coalesce(traffic_agency_id), surface, key, effective_from)`, checks de `status`,
   `scope`, `surface`), `ddlFile` `15-ops-parameter.sql`; módulo gerado `backend/domains/ops/parameter`
   montado no `AppModule`.
2. `ParameterService` manuscrito (`handwrittenProviders`): `get(key, { agencyId?, on?, required? })`
   com resolução surface → agency → tenant → default do catálogo; erro `PARAMETER_SOURCE_PENDING`
   quando `required` e `source_pending`; `PARAMETER_LEGAL_READONLY` no `update` de linha legal;
   cache por tenant invalidado por evento `PARAMETRO_ALTERADO`; comando `PUT parameters/{key}`
   (nova versão com `reason`, `decision_ref`, `effective_from`; `PARAMETER_EFFECTIVE_DATE_PAST`).
3. Gerador de seed `tools/parameters/generate-seed.mjs`: lê `docs/framework/arch/parameter-catalogue.md`
   e emite `backend/database/seed/05-parameters.sql` (uma linha por chave, `status`, `source_pending`,
   `legal_readonly`, `decision_ref`); `seed.sh` já autodetecta o novo arquivo; gate
   `verify:parameter-catalogue`
   (chaves usadas em código ⊆ catálogo; `decision_ref` existentes em `decision-closure-plan.md`,
   `open-decisions-rait.md`, `open-issues.md`, steering ou cédulas do Owner; nenhuma linha
   `legal_readonly` editável) adicionado a `pnpm check`.
4. Flags booleanas: `detranFeatureFlagSet()` em `backend/app/src/detran-runtime.ts` passa a ser
   alimentado por `backend/app/src/generated/parameter-flags.ts`, gerado do mesmo catálogo (linhas
   marcadas **F**) e importado relativamente, mantendo `teat.speed_meters`, o alias legado
   `DETRAN_FEATURE_SPEED_METERS` e os overrides `DETRAN_FEATURE_*`.
5. A compatibilidade de `inf.normative_agency_parameter` é tratada de forma fail-closed. O CRUD
   gerado atual escreve nessa tabela; portanto ela não será trocada silenciosamente por uma view.
   A retirada exige regenerar `BP-INF-NORMATIVE-001` sem a entidade e remover seus gerados numa
   mudança acoplada posterior. Esta rodada registra a pendência explícita em vez de quebrar o
   contrato existente.
6. ADR-0021 → `Accepted` com data e PR; `rait-build-pack.md` WP-A §parâmetros marcado;
   `rait-deadline-engine.md` já cita `ops.parameter`.

## Tarefas

| Tarefa    | Papel     | Perfil              | Modelo/esforço | Lock                                                                                 | Depende de           | Entrega                                                                                                                       |
| --------- | --------- | ------------------- | -------------- | ------------------------------------------------------------------------------------ | -------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| TASK-0001 | Architect | architect-blueprint | Terra / alto   | `MOD-bp-ops-parameter`, `MOD-ddl-15`, `MOD-contract-ops-parameter`                   | —                    | blueprint, gerados, contrato do `PUT /v1/ops/parameters/{key}` e critérios formais                                            |
| TASK-0002 | Inspector | inspector-tests     | Luna / médio   | `MOD-ops-parameter-tests`                                                            | TASK-0001            | testes unitários e de integração para resolução, vigência, legal/source pending, concorrência, evento e RLS                   |
| TASK-0003 | Engineer  | engineer-backend    | Luna / médio   | `MOD-ops-parameter`, `MOD-app-module`, `MOD-shared-policy`                           | TASK-0002            | serviço/comando manuscritos, wiring e política até os testes passarem                                                         |
| TASK-0004 | Architect | architect-blueprint | Terra / alto   | `MOD-parameter-catalogue-contract`                                                   | TASK-0003            | contrato de parsing/normalização, seed, decisão, flags e critérios fail-closed no catálogo                                    |
| TASK-0005 | Inspector | inspector-tests     | Luna / médio   | `MOD-tools-parameters-tests`, `MOD-app-flag-tests`                                   | TASK-0004            | testes do parser, seed determinístico, referências, chaves usadas, flags e detecção de catálogo malformado                    |
| TASK-0006 | Engineer  | engineer-backend    | Luna / médio   | `MOD-tools-parameters`, `MOD-package-json`, `MOD-seed-parameters`, `MOD-app-runtime` | TASK-0003, TASK-0005 | gerador/verificador, seed, scripts, defaults de flags e integração final; sem converter o CRUD normativo em view nesta rodada |

CTG-0001 = TASK-0001 → TASK-0002 → TASK-0003. CTG-0002 = TASK-0004 → TASK-0005 →
TASK-0006, iniciada só após CTG-0001 para preservar a dependência do store. Após TASK-0001 o
maestro executa `pnpm install` antes de disparar TASK-0002 e novamente após TASK-0003, antes dos
gates do CTG-0001, assumindo a atualização resultante de `pnpm-lock.yaml`; `--frozen-lockfile`
volta a valer no CI após o lockfile ser versionado. Em cada checkpoint o maestro grava
`reports/TASK-nnnn.md` antes da tarefa dependente. O fechamento documental é responsabilidade do
maestro Architect no §9, não uma sétima tarefa de worker.

Gates de grupo: ao fim do CTG-0001, com dependência e alias já em TASK-0003, executar `pnpm check`
e `pnpm backend:test:ci`; ao fim do CTG-0002, repetir ambos, incluindo `parameters:test` pela cadeia
de `check`.

## Critérios de aceitação (comandos → resultado)

- `pnpm blueprints:check` e `pnpm contracts:check` → sincronizados.
- `pnpm --filter @detran/ops-parameter test:unit` e
  `pnpm --filter @detran/ops-parameter test:integration` → verdes; testes de integração usam
  `DETRAN_TEST_DATABASE_URL` e banco
  isolado criado pelo maestro.
- `bash backend/database/seed.sh` em banco limpo → idempotente (duas execuções sem erro);
  `select count(*) from ops.parameter` = número de linhas do catálogo.
- `pnpm verify:parameter-catalogue` → OK; fixtures de teste provam exit 1 para chave inexistente,
  `decision_ref` órfã, linha malformada e flag sem booleano.
- `pnpm verify:rls-ddl` → OK (tabela com `tenant_id`, RLS forçada, trigger); o teste de integração
  dedicado prova isolamento cross-tenant de `ops.parameter`.
- `pnpm check` → verde; `node tools/docs/kb/check.mjs` → 521/446.

## Mapa entregável → definições

| Entregável       | Definição                                                                                                                       |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| tabela e serviço | `docs/meta/adr/ADR-0021-shared-parameter-store.md` §Decision 1–3, 6, 7                                                          |
| catálogo (seed)  | `docs/framework/arch/parameter-catalogue.md` (87 linhas; 72 `vigente`, 11 `proposta`, 4 `a_confirmar`)                          |
| erros            | `docs/framework/arch/rait-error-catalog.md` (`RAIT.PARAMETER_*`), `boat-error-catalog.md`, `dashboard-error-catalog.md`         |
| edição por papel | `UC-RAIT-043` (agency-admin, motivo, vigência, versões); `permissionGuard('<surface>:parameter:update')`                        |
| padrão de módulo | `BP-INF-AIT-001` (handwrittenProviders/moduleImports, ADR-0007 adendo), `backend/domains/inf/ait/src/ait-lifecycle.provider.ts` |
| motor de prazos  | `docs/framework/arch/rait-deadline-engine.md` §Entradas                                                                         |

## Riscos

- O lock em `policy.ts` foi dessensibilizado pela ordem de integração: `dash-roles`/R-0003 já está
  em `main`; ainda é obrigatório preservar suas regras ao acrescentar `ops:parameter:read|update`.
- Parsing do catálogo Markdown: o gerador deve falhar alto em linha malformada; preferir tabela
  com colunas fixas e teste de snapshot do seed.
- A view de compatibilidade só é válida enquanto o módulo normativo gerado não escrever na tabela
  antiga; verificar `NormativeAgencyParameterRepository` (CRUD gerado) antes de trocar por view — se
  escrever, adiar a view para a regeneração (registrar em §Bloqueios).

## Bloqueios

- Integração/PR resolvida: o PR #35 (`orchestra/dash-roles`, closure R-0003) já foi mesclado e está
  incorporado desde `bafae6d23073cf64f8bfc176f2219fb270fd28ae`. Durante o preflight, o PR #36
  avançou `origin/main`; esta worktree foi sincronizada por fast-forward para
  `d8fe83a96b0301d27015de5958507cdad4a06d75` e `pnpm check` foi repetido com o novo gate do
  bridge. A política desta rodada parte desse baseline e será revalidada antes de eventual PR de
  `param-store`.
- Compatibilidade normativa: `inf.normative_agency_parameter` continua tabela nesta rodada porque
  `BP-INF-NORMATIVE-001` ainda expõe CRUD gerado de escrita. A view exigida pela ADR-0021 fica para
  uma mudança acoplada que remova a entidade/CRUD do blueprint e os gerados; não é bloqueio para
  a nova `ops.parameter`.
- Editor da ADR-0021 Decisão 5: `DetranParameterEditor`, rota `/admin/parametros` e permissões por
  surface ficam para a frente frontend que introduzir o primeiro app consumidor; hoje não há app
  onde montar o editor. Esta rodada entrega store/contrato e somente `ops:parameter:read|update`.
- ADR-0021 Decisão 2: esta rodada implementa `RAIT.PARAMETER_SOURCE_PENDING` para o consumidor RAIT.
  Os aliases `BOAT.RETENTION_UNDEFINED` e `DASH.CELL_THRESHOLD_UNDEFINED` ficam explicitamente
  adiados até os primeiros consumidores/fronts dessas surfaces; não há fallback genérico.
- Histórico do soft gate: `reviews/prompt-review-1.json` retornou `FAIL`. Achados high: seção SHARED inexistente;
  typo real `pend.=no` e default `false (fixo)` tornam o parser proposto inalcançável; fontes de
  `decision_ref` insuficientes; comandos raiz de Vitest inexistentes; falta `pnpm install` do
  maestro após gerar o pacote; `testAliases` omitido; alegação falsa de cobertura `ops` no RLS
  smoke; fixtures Markdown malformadas incompatíveis com Prettier; e divergência entre Opus e a
  recomendação do model ladder. O Owner autorizou `prompt-review-2`, Fable e uma nova janela de
  orçamento; todos os high findings devem estar corrigidos antes de qualquer worker.
- `reviews/prompt-review-2.json` retornou `REVIEW`: o scan de literais confundia entities de
  auditoria, a instalação congelada não podia criar o importer do pacote novo, TASK-0002 não
  coletava ambos os tiers e faltava sensor prévio dos defaults/overrides no app. As correções estão
  incorporadas na composição seguinte, ainda sem workers.
- `reviews/prompt-review-3.json` retornou `REVIEW` no terceiro ciclo. Restam duas emendas de
  executabilidade, sem mudança de produto: TASK-0003 precisa poder adicionar
  `"@detran/ops-parameter": "workspace:*"` a `backend/app/package.json`, com `pnpm install` do
  maestro após CTG-0001; TASK-0006 precisa poder adicionar o alias do mesmo pacote em
  `backend/app/vitest.config.ts`. Pelo §5 do maestro, o ciclo encerra e volta ao Owner antes de
  qualquer worker.
- O Owner autorizou as duas ampliações de fronteira, a enumeração dos dez prefixos e uma quarta
  janela para `prompt-review-4` com Opus 5. Nenhuma outra emenda foi incorporada.
- `reviews/prompt-review-4.json` retornou `REVIEW`: o contrato manual planejado com sufixo
  `BP-OPS-PARAMETER-001.commands.openapi.json` seria detectado como órfão por `contracts:check`,
  que aceita somente o único `BP-OPS-PARAMETER-001.openapi.json` gerado. A correção proposta é
  renomear o manual para `BP-OPS-PARAMETER-001.commands.json` e propagar o caminho em TASK-0001,
  TASK-0002 e TASK-0003. O ciclo também registrou três lows não aplicados: antecipar o alias ao
  CTG-0001 ou delimitar `backend:test:ci`; integrar `parameters:test` ao CI; alinhar o JSON de
  aceitação de TASK-0003 com integração e formatação.
- O Owner autorizou o high e os três lows: contrato manual passa a
  `BP-OPS-PARAMETER-001.commands.json`; dependência e alias ficam juntos em TASK-0003;
  `parameters:test` entra em `check`; e o JSON de TASK-0003 inclui integração e formatação. Uma
  quinta janela com Opus 5 foi autorizada.
- `reviews/prompt-review-5.json` retornou `REVIEW`. High 1: TASK-0002/TASK-0003 precisam fixar
  antes dos testes o mapeamento `rait|collection|deadline|session→rait`, `teat|sync→teat`,
  `portal|privacy→portal`, `est→est`, `dashboard→dashboard`. High 2: o gerador deve emitir também
  `backend/app/src/generated/parameter-flags.ts`, importável relativamente pelo app, pois o
  artefato interno do pacote não possui subpath exportável. Lows preservados para autorização:
  mover o contrato manual para `docs/framework/arch/`; incluir o pacote no script raiz `build`;
  adiar explicitamente aliases BOAT/DASHBOARD de pending; preservar
  `DETRAN_FEATURE_SPEED_METERS`; e exigir que o teste do app use somente
  `detranFeatureFlagSet()`.
- Emenda autorizada pós-review-5: os dois highs e cinco lows acima foram aplicados conjuntamente.
  O contrato manual foi movido para `docs/framework/arch/ops-parameter-command-contract.md`; o
  mapeamento de surface está fechado; o app recebe artefato gerado local; o build raiz inclui o
  pacote antes do app; aliases pending BOAT/DASHBOARD estão adiados; o alias legado de speed
  meters está preservado; e o sensor do app usa somente `detranFeatureFlagSet()`.
- `reviews/prompt-review-6.json` retornou `PASS` com Fable 5.1. Não há high. Dois lows ficam
  registrados sem bloquear o gate: explicitar em TASK-0006 que `verify:parameter-catalogue`
  também entra na composição de `check`; e acrescentar em TASK-0002 sensores positivo/negativo
  do grant `ops:parameter:update`. Ambos foram incorporados durante a execução: o script agregado
  inclui o verificador e a matriz real do guard cobre `agency-admin` positivo e todos os demais
  papéis canônicos negativos.

## Triagem

- TASK-0001, disparo inicial: `sensor-error` — o worker iniciou no checkout raiz, não encontrou o
  prompt relativo e parou sem alterações. Mitigação: reutilizado com
  `workdir=/Volumes/Thiamat II/stech/detran-worktrees/param-store` e caminho absoluto do prompt;
  não conta como iteração de implementação.
- TASK-0001, geração: `plant-bug` de configuração do blueprint — bindings iniciais de `ddlFile`,
  `testAliases` e path foram corrigidos pelo Architect; o DDL stale `30-ops-parameter.sql` foi
  removido depois que o manifesto canônico passou a listar somente `15-ops-parameter.sql`.
- TASK-0001, símbolo: o CRUD gerado ocupa `ParameterService`; o provider manuscrito fica
  `OpsParameterService` no mesmo path contratado para evitar colisão. O relatório TASK-0001 é a
  referência para Inspector/Engineer downstream; sem mudança semântica.
- TASK-0002, iteração 1: `sensor-error` — os testes produzidos eram majoritariamente inspeção
  textual e não provavam o comportamento do serviço/comando, RLS cross-tenant ou grants. Mitigação:
  segunda iteração exigindo sensores executáveis com fakes de dependências, banco real para RLS e
  matriz positiva/negativa de autorização; produção permanece intocada.
- TASK-0002, iteração 2: sensores comportamentais criados, mas o caso negativo de autorização era
  tautológico e não exercitava endpoint/guard/policy. Como o limite Luna foi atingido, a correção
  foi escalada a Inspector Terra/médio da mesma família, restrito aos dois arquivos de teste.
- TASK-0003, iteração 1: `plant-bug` — revisão do maestro encontrou códigos RAIT inventados,
  identidade de versão nova possivelmente sobrescrita pela antiga, sobreposição inclusiva de
  vigência e seleção de update sem escopo/agência. Mitigação: segunda iteração do Engineer com
  testes/gerados imutáveis e critérios de correção explícitos.
- TASK-0003, integração pós-implementação: `sensor-error` — o teste exigia dois registros em
  `auth.tenants`, mas o seed canônico contém somente um tenant. Mitigação: o Inspector preservou
  o tenant da fixture e passou a usar um UUID alternativo determinístico somente como contexto
  `app.tenant_id`, sem inserir tenant/persona ou alterar produção, DDL e seeds.
- TASK-0003, inspeção de índice: `sensor-error` — o PostgreSQL serializa a expressão do índice
  com `COALESCE` em maiúsculas e o sensor procurava `coalesce` de forma case-sensitive.
  Mitigação: normalizar a definição retornada antes da asserção, preservando integralmente os
  predicados estruturais verificados.
- TASK-0003, gate E2E agregado: `plant-bug` — o blueprint registrava o controller manuscrito em
  `moduleExports`; o Nest rejeita exportar controllers porque eles não são providers do módulo.
  Como o Engineer já consumiu duas iterações, o Architect interveio no binding do blueprint:
  manteve o controller em `handwrittenControllers` e no barrel público, mas restringiu
  `moduleExports` ao `OpsParameterService`. A árvore gerada e seus hashes devem ser reconstruídos.
- TASK-0003, boot após correção do export: `plant-bug` — as portas TypeScript do serviço eram
  apagadas para `Object` no metadata de DI e a outbox não possuía providers runtime. Mitigação:
  o Engineer adicionou tokens concretos para `Database`/`RequestContext`, clock do sistema, cache
  nulo seguro enquanto as leituras não são cacheadas e adapter SQL de outbox na transação; o
  Architect registrou esses providers no blueprint. O insert da outbox inclui `tenant_id`.
- TASK-0003, primeira repetição E2E após boot: `sensor-error` — somente
  `DETRAN_TEST_DATABASE_URL` apontava para a base isolada; o runtime do app resolve
  `DATABASE_URL`, consultou outro backend e retornou `503` de rate limit distribuído. Mitigação:
  fixar ambas as variáveis na mesma base isolada; o E2E do app passou 10/10 sem mudança de código.
- TASK-0005, iteração 1: `sensor-error` — a suíte black-box retornava cedo quando os CLIs estavam
  ausentes e aceitava `MODULE_NOT_FOUND` como diagnóstico dos negativos, convertendo reds
  previstos em PASS. Também não provava a exclusão de `tests/dist/node_modules` nem comparava o
  delta determinístico contra baseline. Mitigação: segunda iteração sem bypass de ferramenta
  ausente, com diagnósticos semânticos e sensores adicionais; produção permanece intocada.
- TASK-0005, sensor stale pós-TASK-0006: `sensor-error` — o caso consultava os gerados reais do
  checkout e esperava falha permanente; assim, o gate quebrava quando os artefatos estavam
  corretamente atuais e dependia da ordem `test`/`generate`. Como o limite Luna foi atingido, a
  correção foi escalada ao Inspector Terra: gerar em raiz temporária, corromper um artefato e
  verificar essa raiz explicitamente, sem depender do estado da worktree.
- TASK-0006, revisão do maestro após iteração 2: `plant-bug` — o parser pulava a resolução de toda
  referência `H.*`, continha exceção codificada para `OD-D04…D09` e não exigia as cinco tabelas,
  contrariando o contrato fail-closed e a vedação de allowlist. Mitigação: o Architect atribuiu
  `DT-110` ao único `H.55` órfão, preservando o comportamento `warn`; a implementação foi
  escalada a Engineer Terra/alto para resolver todas as fontes/cédulas e ranges de forma genérica,
  exigir as cinco tabelas e remover os bypasses por id.
- TASK-0005, fixture sob parser estrito: `sensor-error` — a fixture mínima continha apenas RAIT e
  TEAT e ainda referenciava o inexistente `H.55`, embora o contrato exija as cinco tabelas e refs
  resolvidas. Mitigação: o Inspector escalado completa PORTAL/BOAT/DASHBOARD com linhas sintéticas
  não-F e refs existentes, preserva speed meters como única flag e troca o token órfão por DT-110.
- Preflight pós-review-5: `reviews/preflight-after-review-5.md` registra PASS para paths/imports,
  resolução Node/Vitest, `contracts:check`, `pnpm check`, `pnpm build`, simetria prompt/task e
  hashes/composition IDs. `backend:test:ci` passou por reconstrução estrutural, mas não foi
  executado: não há URL de banco no ambiente e o pacote planejado ainda não existe.
- Limite: o resultado é `READY FOR INDEPENDENT REVIEW`, não `PASS` do gate de prompts; nenhuma
  nova chamada de reviewer nem worker estava autorizada pela emenda. A revisão independente
  seguinte foi autorizada separadamente e retornou `PASS`; nenhum worker foi disparado nesta
  chamada.
- Delivery review CTG-0001, tentativa 1: `REVIEW`; a resposta continha texto antes do JSON e o
  bridge falhou fechado, mas preservou três highs verificáveis. Mitigação em uma emenda Engineer
  Terra: `OpsParameterError` passou a `StynxError`, o replay local cross-tenant foi removido em
  favor do middleware durável e `legal_readonly` passou a bloquear a chave/surface no tenant antes
  da seleção mutável; `surface` divergente é rejeitada antes da transação.
- Delivery review CTG-0001, tentativa 2: `REVIEW` válido em
  `reviews/delivery-review-CTG-0001-2.json`; high de `ETag` ausente e low de seleção de agência
  alheia. Mitigação conjunta: resposta PUT emite ETag forte da versão, `If-Match` normaliza forma
  numérica/strong/weak e falha fechado em formatos ambíguos, e candidatos de rank zero são
  excluídos. A tentativa 3 retornou `PASS` sem findings em
  `reviews/delivery-review-CTG-0001-3.json`.
- Delivery review CTG-0002, tentativa 1: `PASS` com quatro lows, mas cercas Markdown fizeram o
  bridge rejeitar o envelope. Mitigação em uma emenda Engineer/Inspector: sensor explícito de
  `legal_readonly`, colapso de sequências no nome de ambiente, unescape de pipe Markdown e campo
  `value_type` alinhado ao contrato; gerador e três gerados foram reconstruídos juntos. A tentativa
  2 retornou `PASS` sem findings em `reviews/delivery-review-CTG-0002-2.json`.
- Preflight final de simetria: o comando de integração da TASK-0002 era semanticamente equivalente,
  mas o prompt omitia o executável literal `env` presente no JSON. A forma textual foi alinhada sem
  mudar comportamento; SHA-256 e composition ID da TASK-0002 foram recalculados e propagados no
  catálogo, task/executor e relatório.

## Retomada

Checkpoint `2026-09-14` pós-evidência local:

- Concluído: bootstrap, baseline, DEVAI doctor Tier 3, leitura obrigatória, plano, seis tasks JSON,
  seis prompts/composições, seis workers, correções escaladas, gates locais e reviews finais.
- TASK-0001…TASK-0006 estão `completed`; CTG-0001 e CTG-0002 têm `PASS` independente final.
- Concluídos os commits locais `ece68c0` (CTG-0001), `a26e9d0` (CTG-0002) e `2ad067f`
  (histórico governado), além dos registros de evidência `generic` sequências 1 e 2. A cadeia está
  válida no head `5b8fcdac500fa651f7df5b7eb7bd134c13054378471e9cedeb6286564af33bce`.
- Próximo limite de autoridade: publicação da branch, criação do PR, acompanhamento do CI, merge,
  observação Auditor e fechamento da rodada. Nenhum push, PR ou merge desta rodada ocorreu.
- Últimos vereditos: `reviews/delivery-review-CTG-0001-3.json` e
  `reviews/delivery-review-CTG-0002-2.json`, ambos `PASS` sem findings, com registros de bridge e
  hashes válidos.
- Autorização de retomada: `prompt-review-2`, reviewer Fable, criação/atribuição de DTs e nova
  janela de orçamento. DT-132/DT-133 fecham as duas lacunas de catálogo e `portal.installments`
  recebeu DT-031/DT-072; nenhuma decisão de produto nova foi inferida.
- Dependência externa resolvida: PR #35 mesclado. Após avanço concorrente pelo PR #36 e
  fast-forward, HEAD e `origin/main` coincidem em
  `d8fe83a96b0301d27015de5958507cdad4a06d75` sob esta emenda local.
- Orçamento: a chamada Opus consumiu aproximadamente 2,15 M tokens de entrada em cache/leitura e
  36.223 de saída, ultrapassando sozinha o orçamento nominal de 800 k; a retomada precisa de nova
  janela.
- Janela 2: Fable consumiu 2.907.274 tokens de entrada/cache e 50.787 de saída; o teto de 800 k foi
  excedido antes de `prompt-review-3`. O Owner autorizou a janela 3 e escolheu Opus 5.
- Janela 3: Opus consumiu 1.486.689 tokens de entrada/cache e 22.169 de saída, novamente acima do
  teto nominal de 800 k; a parada foi levantada pela autorização seguinte do Owner.
- Janela 4: autorizada pelo Owner para as emendas e `prompt-review-4` com Opus 5.
- Janela 4 consumiu 5.575.260 tokens de entrada/cache e 42.522 de saída; o teto de 800 k foi
  excedido; a parada foi levantada pela autorização seguinte do Owner.
- Janela 5: autorizada pelo Owner para as quatro emendas e `prompt-review-5` com Opus 5.
- Janela 5 consumiu 4.279.202 tokens de entrada/cache e 49.408 de saída; o teto de 800 k foi
  excedido. O Owner autorizou `prompt-review-6` com Fable 5.1 e dispensou o token budget como
  condição de parada para a revisão Fable desta rodada; a ponte normalizada não expôs métricas de
  tokens. A mesma dispensa foi aplicada aos delivery reviews Fable solicitados pelo Owner.

## Leitura

- Snapshot inicial: `56627ef483cd74eeefdbff188075439e671a6cd3`; rebase linear de planejamento em
  `cf8f475eaf1951fa2ebb3c42d24f725c6581ea0e` após a entrada de `dash-roles` e depois em
  `ca5c260a967ef8ac43157e106814e83fd93592a3` para incorporar o modelo concorrente da orquestra e
  `bafae6d23073cf64f8bfc176f2219fb270fd28ae` após a closure de R-0003; avanço final por
  fast-forward em `d8fe83a96b0301d27015de5958507cdad4a06d75` para incorporar o hardening do PR #36.
- Lidos na ordem do prompt: `AGENTS.md`; `CODESTYLE.md`; `docs/meta/agents/README.md`;
  `docs/meta/agents/orchestra/{README.md,model-ladder.md,waves.md}`; WP-A parâmetros e mapa do
  `docs/framework/arch/rait-build-pack.md`; `ADR-0021-shared-parameter-store.md`; definições A
  citadas pelo mapa; `parameter-catalogue.md`; `decision-closure-plan.md`; `steering.md` §H;
  manuais `architect-blueprint`, `engineer-backend`, `engineer-frontend`, `inspector-tests` e
  `transcriber-docs`; este `plan.md`.
- Inspeções fechadas adicionais usadas para tornar os prompts executáveis: templates de tarefa,
  worker e reviewer; `task.schema.json` 2.0.0; scripts reais de `package.json`; UC-RAIT-043;
  catálogo de erros §3.9; gerador de blueprints; wiring do app; DDL/CRUD normativo existente.
