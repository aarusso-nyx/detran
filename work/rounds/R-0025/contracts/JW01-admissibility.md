# R-0025 — primeiro recorte JW-01: admissibilidade

Papel: Architect (Artigos 6/7/10). A-C3-01 e autorização do Owner em
`../AUTHORIZATION.md`. Este contrato prevalece nas linhas técnicas abaixo sobre
o pré-trabalho de setembro, preservado como histórico. Não declara jornada completa.

## Fontes e escopo

- `UC-RAIT-002`: entrada PROTOCOLADO, quatro critérios separados, tempestividade
  somente do motor; admitido ou não conhecido, sem análise de mérito.
- `contracts/CTG-0002.md` F-01 e OD-R25-006=(a): comando triage separado dos
  vereditos. OD-R25-002=(a): guard consulta GET do caso sob RLS, sem endpoint novo.
- `command-matrix.md`: R-01 checklist, R-02 rejeição; DTOs/paths reais em
  `BP-INF-RAIT-CASE-001.commands.openapi.json` e serviços manuscritos atuais.
- `frontend-wiring-pattern.md` v0: ETag, Idempotency-Key, executor, erros, SSE local.
- `rait-case-command.service.ts`: claim DISTRIBUIDO→EM_INSTRUCAO; admit/reject
  exigem TRIAGEM_ADMISSIBILIDADE. A sequência desenhada claim→triagem não executa
  este contrato. A entrada aprovada é caso PROTOCOLADO direto. OD-R25-016 registra
  a divergência remanescente da jornada, sem inventar EM_INSTRUCAO→TRIAGEM.

## Fronteira de API e persistência

1. **F-01 iniciar:** `POST /v1/inf/rait/cases/{id}/commands/triage`, operationId
   `raitCaseTriage`, corpo `{}` estrito, atores das tuplas existentes analyst/secretary,
   contexto autenticado e RLS. PROTOCOLADO→TRIAGEM_ADMISSIBILIDADE apenas;
   estado diferente é o 409 catalogado. Resposta `{data,events}` e ETag do caso.
2. **R-01 salvar:** manter `POST /v1/inf/rait/admissibility` canônico, operação
   `createRaitAdmissibility` única, agora fonte OpenAPI manuscrita. Entrada estrita:
   `{case_id, criterion, verdict, reason?}`; criterion apenas legitimidade,
   assinatura ou pedido_compativel. O cliente NÃO fornece tenant, ator,
   evaluated_at/by, versão ou tempestividade. Corpo e resposta derivados do
   contrato regenerado, sem DTO manual, `unknown as` ou cast provisório.
3. **Propriedade server:** generated CRUD atual não enriquece contexto nem protege
   tempestividade. Architect muda apenas `api.resources` de RaitAdmissibility para
   `operations: [list,get]`, registra controllers/providers manuscritos e regenera.
   POST/PATCH/DELETE gerados deixam de existir; não fica bypass de escrita direta.
   Controller manuscrito conserva o POST, delegando a serviço transacional; não
   editar nenhum gerado à mão. ADR-0041 registra esta fronteira.
4. **Quarto veredito:** F-01 calcula tempestividade com o adapter de deadlines já
   usado por admit, binding real case/ait/protocolled_at/instance e calendário;
   persiste somente o resultado do motor, ator autenticado e relógio do servidor.
   Não usa data do browser, valor fixo, prazo novo nem flag de fixture. Falta de
   insumo conserva o erro catalogado do motor, sem fabricar false/true. R-01
   recalcula o veredito server na transação antes de persistir o critério humano.
5. **Repetição:** R-01 upsert por (tenant_id,case_id,criterion), chave única já
   existente, sem novos estados ou DDL de domínio. A linha humana e a server são
   gravadas na mesma transação; actor/time vêm do contexto. Em estado fora de
   TRIAGEM_ADMISSIBILIDADE negar. Toda escrita real incrementa versão do caso;
   respostas guardam ETag atual. Salvamentos sequenciais usam o ETag retornado.
   A mesma chave/fingerprint é replay sem segunda versão/evento/auditoria.
6. **Concorrência:** If-Match do caso e Idempotency-Key em F-01 e R-01, com lock do
   caso, comparação de versão e registro idempotente na transação. Reusar o padrão
   existente; 428/412/409 e 400 por chave ausente conforme CTG-0002. Nada de aceitar
   cabeçalho ignorado. Eventos existentes `rait.case.changed` via outbox/SSE local;
   sem novo serviço SSE ou adoção do checkpoint R-0022.
7. **Admit/reject:** endpoints existentes, bodies do contrato gerado. Admit `{}`;
   reject usa `reason` e `legalBasis` exigidos pelo servidor. Reutilizar o schema de
   formulário e rótulo `rait.common.legalBasis`; texto do fundamento informado pelo
   operador, sem mapa jurídico novo inferido pelo cliente. Preservar as guardas
   de quatro critérios, assinatura, tempestividade e motivo compatível do serviço.
   Nenhum workaround muda o estado esperado ou mascara 422.
8. **Fontes OpenAPI completas antes do Inspector:** Architect enriquece no arquivo
   `docs/framework/contracts/BP-INF-RAIT-CASE-001.commands.openapi.json` as quatro
   operações `raitCaseTriage`, `createRaitAdmissibility`, `raitCaseAdmit` e
   `raitCaseNonAdmission`. Todas declaram requestBody application/json obrigatório,
   additionalProperties false, path id quando aplicável, If-Match e Idempotency-Key
   obrigatórios, respostas de sucesso `{data,events}` com header ETag e erros do
   catálogo. `raitCaseAdmit` recebe `{}` estrito; `raitCaseNonAdmission` recebe
   `{reason,legalBasis}` ambos obrigatórios, reason com o enum já canônico.
   Bodies R01 e F01 são os de §§1/2. Regenerar os clientes somente após remover
   generated create e inserir o POST manuscrito; nenhum operationId duplicado,
   requestBody never, campo server no input ou DTO manual/cast remanescente.
9. **Mapeamento exato de rejeição:** `reason = nonAdmissionReason` é o código
   de `NON_ADMISSION_REASONS` (intempestivo, ilegitimo, sem_assinatura,
   pedido_incompativel), verificado pelo servidor contra o critério false.
   `legalBasis = nonAdmissionGrounds` é o texto humano informado pelo operador,
   validado pelo schema de formulário existente. O cliente não fabrica fundamento
   a partir do código, label ou inciso. Retirar `non_admission_reason` da assinatura
   pública ativada; campos vazios/ausentes não resultam em sucesso.
10. **Decorators preservados:** POST manuscrito de admissibility conserva
    `@Resource('inf:rait-admissibility')`, `@Action('create')` e
    `@Audit({action:'INF_RAIT_ADMISSIBILITY_CREATE',entity:'inf.rait_admissibility'})`.
    A tupla existente de policy é reutilizada; nenhuma nova chave de policy.ts é
    necessária. Não mudar a autoridade de route/grant ao substituir o handler.

## Autorização e lacuna explícita

Guard real `caseAccessGuard` aguarda GET do caso com credenciais normais sob RLS;
403/404 negam navegação, outros erros também não liberam e seguem ErrorBoundary.
Não há endpoint novo de autorização ou cache local permissivo. Guard de papel e
DetranPolicyGuard permanecem reais. RN-RAIT-143 trata autoridade signatária e não
é fonte suficiente para inventar um predicado de analista por pool/unidade.

**OD-R25-017:** GET gerado atual aplica tenant RLS, não predicado demonstrado de
acesso individual a todo caso no mesmo tenant. Implementação não pode alegar
prova de escopo individual inexistente. Inspector cobre tenant cruzado, papéis
omitidos e resposta 403/404; um teste de caso fora de escopo no mesmo tenant exige
predicado canônico antes de ser tratado como PASS. A lacuna segue explícita na
revisão; não conceder grant por analogia, não usar RN-143 como regra de analista.

## Wiring e preservação de prévia

- `main.ts` deve habilitar interceptors DI existentes do kit via padrão suportado
  (`withInterceptorsFromDi`), sem provedor de autenticação paralelo.
- RaitHttp envia headers e lê ETag, preservando erro HTTP para ErrorBoundary.
- **Assinaturas públicas fixas antes dos sensores:** `CaseClient.triage(caseId:
string, body: TriageInput, ifMatch: string|null): Promise<CommandResult<RaitCase>>`;
  `CaseClient.saveAdmissibility(body: SaveAdmissibilityInput, ifMatch: string|null):
Promise<CommandResult<RaitAdmissibility>>`; `admit(caseId, body: AdmitInput,
ifMatch)` e `reject(caseId, body: RejectInput, ifMatch)` retornam
  `Promise<CommandResult<RaitCase>>`. Os aliases TriageInput, SaveAdmissibilityInput,
  AdmitInput e RejectInput são índices de `operations` das quatro operações geradas,
  `requestBody.content['application/json']`, não interfaces manuais. `triage` deixa
  de receber array: F01 é `{}`, salvar um critério é o novo método obrigatório.
- **Facade fixa:** `triage(caseId: string): Promise<CommandOutcome<RaitCase>>`;
  `saveAdmissibility(body: SaveAdmissibilityInput):
Promise<CommandOutcome<RaitAdmissibility>>`; `admit(caseId: string, body:
AdmitInput)` e `reject(caseId: string, body: RejectInput)` retornam
  `Promise<CommandOutcome<RaitCase>>`. Facade obtém ETag do caso por caseId ou
  body.case_id e passa ao cliente; página coordena os três saves sequenciais.
- **Chaves idempotentes fixas:** cliente usa a fórmula já canônica
  `idempotencyKey(act,target,{body,ifMatch})`: acts triage/admit/reject com target caseId;
  act `admissibility` com target `${body.case_id}:${body.criterion}`. A string é
  enviada em Idempotency-Key, incluindo o If-Match HTTP observado; não gerar UUID novo a cada retry idêntico. Repetição
  de payload divergente com chave explicitamente reutilizada continua 409 no server.
- **M8/inventário:** triage → `rait-case:triage`; saveAdmissibility →
  `rait-admissibility:create`; admit/reject conservam `rait-case:admit`/`rait-case:reject`.
  Acrescentar a chave canônica existente de admissibility a RAIT_COMMANDS (64→65),
  sem remover as 64 anteriores. Ampliação é de catálogo/inventário frontend, não
  grant novo. Inspector atualiza apenas contagem/inventário afetados e prova a
  presença exata da nova chave; não filtra novo método nem enfraquece zero rede.
  PreviewCaseClient implementa explicitamente os quatro overrides com o respectivo
  log + unavailable; zero chamadas a super nos métodos ativados.
- TriagePage separa iniciar de salvar; idempotência/ETag reais, tempestividade
  somente leitura. Estado PROTOCOLADO não é admitido sem F-01; não chamar F-01 em
  caso já em triagem. Não fingir sucesso de etapas ou descartar erro de uma das
  escritas. Após êxito, invalidar/atualizar slots e ETag sem depender só de SSE.
- PreviewCaseClient registra ação e lança explicitamente unavailable, sem chamar
  `super` nos métodos agora reais; novo checklist também bloqueado. Preview mantém
  zero rede e todas as asserções de não funcionalidade da R-0033.

## Sensores e substituições autorizadas

Inspector pode substituir SOMENTE linhas triage/admit/reject nos loops sentinela
M8 de `case.client.spec.ts` e `case.facade.spec.ts` por provas mais fortes de
verbo/path/corpo/headers/ETag/erro/replay, referenciando esta mudança de contrato.
Checklist é método novo obrigatório `saveAdmissibility`: acrescentar sensor e
registro M8 `rait-admissibility:create`, sem filtrar o método do inventário.
Todos os outros métodos continuam com as provas fail-closed. Tests de página
existentes não são afrouxados: novos testes HTTP roteados cobrem o recorte.
`testing/router-harness.ts` pode fornecer fixture explícita para casos dos testes
isolados legados; os testes do guard real não usam substituição da guarda.

Auth local profile não prova JWT inválido/ausente: registrar explicitamente essa
limitação; esta entrega prova HTTP, PolicyGuard atual e RLS tenant, não IdP real.
Não ampliar o harness de autenticação para simular essa prova nem converter token
local default em prova JWT. Negativas disponíveis usam a composição atual e não
substituem PolicyGuard. Teste criptográfico externo permanece not run.
I18n: reusar chaves; se chave canônica nova for indispensável, Inspector ajusta
somente contagem sourceada e paridade dessa chave, preservando o loop integral.

## Critérios do recorte (não substituem aceitação integral R-0025)

- Iniciar, três avaliações e decisão persistem por HTTP real contra banco sob RLS;
  motor fornece a quarta avaliação; quatro linhas únicas, actor/time de servidor.
- 400/403/404/409/412/428/422, outro tenant, papel omitido, replay e retries de save
  têm provas positivas/negativas. Readiness de escopo individual segue OD-R25-017.
- Gerados e OpenAPI coerentes e regeneração sem delta; nenhuma rota PATCH/DELETE
  de admissibility remanescente permite bypass; prévia continua zero rede.
- UI usa responses e ETag reais; estados de erro e campo fundamento existentes
  coerentes; sem claim/instruction/minuta/F-02 ligados nesta entrega.
- pnpm check, doctor, gates de geração/contratos/decorators/RLS/policy afetados e
  browser smoke local antes do PR; baseline e bloqueios separados. Nenhum merge,
  close ou seal autorizado. Demais critérios da rodada continuam pendentes.

## Adenda RGR — leitura de acesso versus cenário visual da prévia

A guarda real introduzida nesta rodada consulta o caso antes da página. Aplicar
`pv_estado=loading/error/forbidden` nessa consulta impede a página de renderizar
os estados exigidos por P-09 da prévia, sem ser uma negação real por papel.
Separar a consulta de controle da leitura de apresentação resolve essa colisão
sem dispensar guardas, reconhecer IDs desconhecidos ou simular comandos.

**API fixa:** `CaseClient.verifyCaseAccess(caseId: string): Promise<void>` é
leitura de controle. Implementação normal aguarda `getRaitCase(caseId)`, conserva
GET autenticado/RLS e a gravação do ETag recebido; rejeições são preservadas.
`caseAccessGuard` aguarda esse método com o mesmo tratamento de erro/negação
aprovado. Não há endpoint, grant ou predicado individual novo (OD-R25-017).

**Override apenas de preview:** `PreviewCaseClient.verifyCaseAccess` carrega a
fixture canônica pelo store existente e confirma a existência do ID em `cases`,
sem aplicar `pv_estado`. ID ausente rejeita com o erro de fixture ausente já
existente; nunca resolve incondicionalmente. Não chama backend ou método de
comando, não cria ETag sintético e não altera contexto de sessão/papel/tenant.
Somente GET assets permitido para carregar a fixture. `getRaitCase` das páginas
continua com os cinco cenários, inclusive promessa pendente, 500 e 403 visual.

A cadeia auth→role→caseAccessGuard continua exatamente a mesma; somente a porta
de leitura consultada pela última guarda muda. O cenário visual forbidden é
resposta simulada da leitura da página; negação por papel ou ID desconhecido
continua impedindo entrada. Isto não é bypass de autenticação/autorização.

Inspector primeiro: provar produção usa GET real e conserva ETag/403/404/5xx;
preview aceita ID canônico em cada um dos cinco cenários e deixa a página aplicar
P-09; ID não canônico rejeita em todos, papéis continuam negados e rede continua
zero fora de assets. `verifyCaseAccess` é classificado explicitamente como READ
no inventário de métodos; não incrementa RAIT_COMMANDS nem exclui um comando para
passar contagem. M8 permanece 65 e os quatro comandos ativados continuam bloqueados
nos overrides preview. Só após sensores aceitos Engineer implementa a separação.

## Correção de entrega — versão na identidade de tentativa e papel da auditoria

Delivery-review ciclo1 identificou replay incorreto: usar só ato/alvo/corpo faz um
novo save de conteúdo igual recuperar ETag antigo; A→B→A pode aparentar sucesso
sem persistir A. Esta correção prevalece sobre a fórmula anterior sem If-Match.
Não altera bodies OpenAPI, nomes de métodos, grants ou estados.

### Quatro operações, mesma tentativa versus nova versão

Aplica-se SOMENTE a triage, save-admissibility, admit e non-admission:

- Cliente usa a função canônica existente com `idempotencyKey(act,target,
{body,ifMatch})`, preservando os acts/targets já fixados. `ifMatch` é exatamente
  o ETag usado no header If-Match dessa requisição, não a versão calculada nem
  a resposta posterior. Mesmo corpo/ETag na repetição da mesma tentativa produz
  chave estável. Depois de sucesso e novo ETag, novo save (inclusive mesmo corpo
  ou retorno A→B→A) é outra tentativa e recebe outra chave.
- Server fingerprint desses quatro comandos contém command, targetId, payload
  canônico, o If-Match recebido e actorId do RequestContext autenticado. Tenant
  continua a chave de partição do registro de idempotência. Não obter ator do body.
- Mesma chave + mesmo payload/alvo/If-Match/ator devolve a resposta histórica
  daquela tentativa, sem segunda escrita/evento/audit. A comparação de fingerprint
  é anterior ao replay; mesma chave com If-Match ou ator divergente produz
  `RAIT.IDEMPOTENCY_REPLAY` 409, nunca replay de outra versão/ator.
- Novo save com a versão atual deve realmente persistir e atualizar versão/ETag;
  não aceitar o replay anterior como prova de nova mutação. Um retry exato de uma
  tentativa antiga pode devolver seu ETag histórico, não é recibo do estado atual.
- Fingerprints e chaves de todos os outros comandos permanecem inalterados.
  Não reescrever registros históricos nem ampliar esta correção ao protocolo.

### Auditoria de triage e save-admissibility

RequestContext atual fornece actorId/tenantId/requestId, não o papel autorizador.
O padrão existente de `protocol` já recebe o principal autenticado do request e
confere sua identidade/tenant com o contexto. Reusar essa fonte para triage/save:

- Controllers das duas operações recebem `@Req()` com principal autenticado
  existente, sem role/actor no body ou header customizado. A assinatura interna
  de `CommandInput` admite `principal?: AuthenticatedPrincipal`; triage e
  save-admissibility exigem esse valor, validam principal.id==context.actorId e
  principal.tenants contendo context.tenantId antes de replay ou mutação.
  Os demais comandos mantêm a compatibilidade anterior de input.
- `RaitAdmissibilityCommandService.execute({payload,headers,principal})` encaminha
  o principal ao comando `save-admissibility`; o controller de triage encaminha
  para execute. No controller CASE, o helper run pode receber principal opcional
  para esse encaminhamento, sem mudar bodies/assinatura HTTP das outras ações.
- Não alterar a decisão de grant: usar `isDetranActionAllowed` atual com o
  principal autenticado completo (roles e permissions) e resource/action da rota.
  Essas duas chaves não estão no mapa strict; o helper admite permissions `*`,
  chave exata ou resource wildcard e fallback GLOBAL_ADMIN_ROLES antes da matriz.
  Todos esses caminhos atuais continuam válidos, sem nova negação por só aceitar
  analyst/secretary e sem novo grant por analogia.
- Atribuição de audit, distinta de autorização: primeiro papel do principal que
  também pertença à tupla canônica da rota, pela ordem da tupla. Caso contrário,
  primeiro papel real do principal que, isoladamente e sem permissões, seja
  aceito pelo helper atual (inclui o fallback existente ADMIN, GESTOR_DETRAN,
  SUPORTE e technical-admin). Não copiar essa lista como política nova: a
  avaliação do helper é a fonte. Secretaria isolada registra secretary, nunca
  analyst hardcoded; múltiplos papéis têm escolha determinística.
- Se a autorização vier apenas de permission e nenhum papel isolado a explique,
  preservar o grant. Registrar um papel realmente presente no principal (primeiro
  da lista autenticada) ou NULL quando a lista for vazia; registrar nos detalhes
  da auditoria que a origem de autorização foi permission do principal, sem
  afirmar que aquele papel sozinho concedeu acesso. `audit.actor_role` e o
  parâmetro `audit.write p_role text` são nullable (DDL03/12), portanto NULL é
  ausência explícita, não role inventada nem motivo para negar grant válido.
- Identidade/tenant incoerentes ou `isDetranActionAllowed` falso continuam
  `RAIT.FORBIDDEN_ACTION` antes de replay/escrita. Ausência de interseção de
  role, por si só, NÃO cria nova negação. Nenhum papel/ator vem do body/header
  do browser; perfis locais continuam sem prova JWT criptográfica.

### Sensores antes da correção Engineer

Inspector prova chave estável da mesma tentativa e chave diferente com novo ETag;
três critérios salvos, resave igual após versões intermediárias e A→B→A persistem
o estado esperado. HTTP/DB prova mesma chave+novo If-Match 409, ator divergente
409, retry original positivo com uma só escrita/audit/evento; secretaria registra
role secretary nas duas operações, não analyst. Admin/fallback existente e
permission-only (inclusive roles vazias com actor_role NULL) não sofrem nova
negação. Identity mismatch falha sem efeito.
Client/facade/page e unit/integration/e2e são sensores separados; nenhum teste ou
checker é afrouxado. Só depois de RED aceito Engineer muda os quatro caminhos.

## Adenda RGR browser — token de versão do caso e erro SDK instalado

### Token de comando versus cache HTTP

O browser observou GET gerado com Express ETag fraco/opaco (`W/"..."`), corpo
`version: 1` e o F01 retornou 412 ao reenviar o cache tag como If-Match. Fonte
canônica: blueprint CASE descreve version como contador de ETag/If-Match; o
serviço de comando compara If-Match com `"${current.version}"`. São semânticas
diferentes do cache Express. Esta exceção CASE das quatro operações ativadas
prevalece sobre a suposição do padrão v0 de um único ETag de GET.

- `CaseClient.getRaitCase` preserva o GET/RLS/erro/cache-header reais e valida o
  `version` do corpo efetivamente recebido: inteiro seguro estritamente positivo.
  Derivar apenas sua representação quoted decimal (`"1"`, por exemplo), sem
  incrementar, arredondar, converter string em número ou usar default/fixture.
- Manter o token de pré-condição do caso separado do ETag HTTP bruto. Pode ser
  cache privado tipado do CaseClient; `EtagStore` existente conserva o header
  recebido para cache HTTP. `CaseClient.etagOf('cases',id)` usado pelas quatro
  operações devolve o token de comando validado; outras coleções ficam intactas.
- Header GET forte quoted decimal que coincide com o body.version pode ser
  reutilizado; header fraco/opaco/ausente não é token de comando e não prevalece
  sobre o contador server validado. Header forte numérico divergente do corpo é
  inconsistência: limpar a pré-condição e falhar fechado, não escolher cegamente.
- Versão ausente, string, zero, negativa, fracionária ou unsafe limpa qualquer
  pré-condição anterior e rejeita a leitura/ação antes de POST. Usar falha local
  tipada pelo caminho já existente de erro genérico; não fabricar status HTTP ou
  novo código jurídico. Um If-Match explícito fraco/opaco tampouco é enviado como
  precondição das quatro operações. Nenhuma versão é inventada pelo browser.
- Depois de comando, ETag canônico da resposta atualiza o token de comando e
  `CommandResult.etag`; não incrementar localmente. Caso haja body.version,
  conferir coerência. R01 retorna avaliação sem version de caso, então a fonte é
  o ETag da resposta do comando. Retry exato preserva a versão original observada,
  conforme adenda idempotente; novo save usa o novo token recebido/validado.
- Não mudar gerador, GET backend ou semântica dos demais comandos. Sensores
  precisam unir GET com ETag realista fraco + corpo version → F01/save HTTP real,
  pois mocks com header de comando artificial escondiam o defeito.

### Classificação do erro STYNX 1.5.3

Fonte instalada: `@stynx-nyx/angular` ErrorInterceptor chama
`createStynxSdkError(error.status,error.error)` e rejeita com o erro SDK. O
`classifyStynxError` público desse pacote reconhece a instância SDK real e expõe
status/code; não reconhece objeto arbitrário `{status:412}` como conflito.

- Boundary RAIT mantém suporte a HttpErrorResponse e RaitCommandUnavailableError.
  Para o erro SDK real, exigir primeiro `instanceof StynxSdkError`, importado
  da API pública de `@stynx-nyx/sdk` 1.5.3 como dependência direta explícita do app;
  depois usar o classificador público Angular e o mapeamento RAIT. Não importar internals.
- Após status/code reconhecidos, reutilizar o mapeamento RAIT do catálogo: 409,
  412 e 428 são conflict; 0 offline; 403 forbidden; demais famílias existentes
  preservadas. A chave i18n continua derivada do catálogo RAIT, nunca de message
  ou messageKey enviados pelo servidor ou do fallback ui.* do SDK.
- Context só é aceito como record seguro; fields, legalBasis e retryAfter usam
  os validadores existentes. requestId só string do responseBody canônico ou
  fonte SDK validada. Não atribuir status/code/context a Error genérico ou objeto
  parecido não reconhecido; desconhecido continua unknown. SDK não carrega header
  Retry-After original: não inventar esse header; aproveitar contexto se existir.
- Não desligar ErrorInterceptor para deixar o mock passar. Inspector deve usar
  o ErrorInterceptor real com withInterceptorsFromDi e HttpTestingController,
  inclusive 412 com RAIT.VERSION_CONFLICT e body/context/requestId; preservar
  sentinela plain-object status412→unknown e payload/messageKey hostil.

### Locks adicionais do delta browser

Inspector: ampliar `core/error-boundary.spec.ts`, ou novo
`core/error-boundary-interceptors.spec.ts`, e testes HTTP de case/RaitHttp/facade
para GET→comando com as versões válidas/inválidas e classificações reais. Provas
numéricas pré-existentes permanecem, substituindo só suposições conflitantes
explicitamente referenciadas por esta adenda, sem perda de asserções.
Engineer: `core/error-boundary.ts`, `apps/rait/web/package.json` e o importer
correspondente de `pnpm-lock.yaml` entram no lock (SDK exato 1.5.3 já transitivo),
além de CaseClient/transport/cache
já previstos. Preferir cache privado CaseClient para não ampliar EtagStore; se
separação exigir EtagStore, seu lock limita-se a armazenar as duas origens sem
misturá-las. Nenhum schema/runtime backend, framework ou versão/pin novo é necessário;
a declaração direta do mesmo SDK instalado é wiring, sem upgrade.
Inspector RED primeiro; Engineer após aceitação; browser compilado deve repetir
GET/F01/checklist/decisão e conflito traduzido. Review de delta limitado a estas
novas observações; review PASS anterior continua histórico do seu candidato.

### Refinamento de identidade SDK — substitui a proibição de dependência direta

A API Angular instalada possui fallback estrutural para status 0: um objeto ou
Error genérico pode receber essa classificação sem ser instância SDK. Portanto
ela sozinha não é porta suficiente para validar contexto/responseBody do SDK.
A escolha anterior “sem SDK direto” fica substituída por dependência direta
`@stynx-nyx/sdk` exatamente 1.5.3, já instalada transitivamente na mesma versão.

Boundary deve usar a identidade pública `error instanceof StynxSdkError` antes
de acessar contexto/responseBody como SDK ou usar o classificador para essa via.
O caminho `HttpErrorResponse` existente permanece independente. Não reconhecer
por constructor.name, Error.name, prefixo de nome, campos status/code parecidos
ou qualquer propriedade controlável do payload. Identidade de classe permanece
a fonte mesmo após minificação; nomes de símbolos não são contrato de runtime.
Erro genérico ou objeto com status0/412 e contexto fingido continua unknown e não
vaza contexto/requestId. Erro SDK real de rede, inclusive code undefined/status0,
continua offline; SDK real412 continua conflict com validação segura do envelope.

Inspector mantém RED real do interceptor e negativos genéricos status0/412,
não reclassifica o falso objeto para fazer o teste passar. Engineer frontend
importa o export público e declara a dependência; maestro/Engineer atualiza só
o importer necessário do lock, sem novo pacote/versão transitiva, pin ou framework.
