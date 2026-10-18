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
  `idempotencyKey(act,target,body)`: acts triage/admit/reject com target caseId;
  act `admissibility` com target `${body.case_id}:${body.criterion}`. A string é
  enviada em Idempotency-Key; não gerar UUID novo a cada retry idêntico. Repetição
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
