# Product brief — RAIT, TEAT, BOAT e PEC

Inspeção original: **2026-10-08**, base `a92ef73147304a39193d8b85d3b7b9a607a6396d`.
**Refresh documental em 2026-10-18**, contra `main`
`06b4a584cb1686b647661855d379ea3161e0666e` e os heads preservados identificados abaixo.
Foram reconferidos pins, lacunas explícitas do código, decisões de frontend PEC e estado de
integração; o restante mantém o escopo histórico da inspeção original. Não houve consulta a
ambientes implantados nem nova execução das suítes de produto para este refresh.
Resultados de teste citados são históricos, não medições do candidato atual.

**Implementado** significa que há código no repositório; não significa homologado
com um provedor real ou apto à produção. **Parcial** identifica componentes
existentes com lacunas funcionais. **Planejado** identifica especificação sem
entrega correspondente. **Não comprovado** identifica ausência de evidência de
execução no ambiente requerido. Contagens de testes abaixo são históricas e têm
escopo próprio; não são percentuais de cobertura de código.

Alguns READMEs ainda descrevem TEAT e BOAT como placeholders. Este brief privilegia
o código atual e os fechamentos das rodadas, mantendo os limites dessas entregas.

## Estado de integração no refresh

A leitura funcional deste documento refere a **main**, não à soma dos branches. O plano
C-0003/A-C2-16 antecipa prévia e jornadas; o [backlog](../backlog.md)
e [registro de rodadas](../../../../work/rounds/README.md) devem ser lidos junto com os checkpoints.
A reconciliação ampliada está no PR #189, ainda aberto na consulta de 2026-10-18.

| Frente                        | Material preservado fora de main                                                                                                                                    | Falta integrar/concluir                                                                                                                                            |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Prévia RAIT (R-0033)          | `claude/frontend-preview-5281e3` @ `aca40880`: sete tarefas completed, duas queued; prévia JW-01 e 87 capturas                                                      | Prévia Portal, sequência final de gates/review e integração; prévia não executa os comandos reais                                                                  |
| RAIT funcional (R-0025)       | `orchestra/rait-web-wiring` @ `9e69d867`: matriz e contratos, quatro tarefas completed                                                                              | 64 comandos ainda lançam `RaitCommandUnavailableError` em main; 13 alinhados, 35 ajustes e 16 endpoints faltantes na análise; `caseAccessGuard` ainda retorna true |
| PEC staff/cidadão (R-0031/32) | `orchestra/pec-web` @ `7c0854f3` e `orchestra/portal-pec` @ `3a492978`: contratos, testes/fixtures e fichas                                                         | Consoles e jornadas produtivas não entregues em main; checkpoints de teste não equivalem a runtime funcional                                                       |
| BOAT (R-0028)                 | `orchestra/boat-wiring` @ `d79b6f02`: adapters e testes de homologação                                                                                              | Integração por tela, hardware/campo e RENAEST produtivo; código de homologação não comprova produção                                                               |
| PORTAL / DASHBOARD / TEAT web | `orchestra/portal-delegations` @ `d64ec29a`, `orchestra/dashboard-wiring` @ `01e6afc2`, `orchestra/teat-web-wiring` @ `679f68db`: preparações/contratos/testes/i18n | Delegações reais e consoles ligados; main conserva indisponibilidades/L0                                                                                           |
| Plataforma                    | R-0022 parada em `codex/detran-r22-adoption-160` @ `c22ea63a`; R-0020 em checkpoint                                                                                 | Salvamento seletivo em R-0034 e hardening R-0035; pin 1.5.3 não comprova toda capacidade upstream nem aceitação de provedor                                        |

PR #179 integrou DEVAI 2.2.0 e STYNX 1.5.3. PR #187 integrou a prova de acessibilidade
do serviço junta indisponível; PR #188 integrou o checker RLS lexical e sua cobertura de
regressão. Nenhum desses merges certifica jornada produtiva. A decisão anterior de descartar
o candidato de guard bancário não é reaberta pelo inventário de branches.

## 1. Base compartilhada

Os quatro produtos utilizam um único backend NestJS, composto em
[`app.module.ts`](../../../../backend/app/src/app.module.ts), com pacotes de domínio
explícitos e PostgreSQL por schema: `inf` (infrações), `est` (sinistros), `ch`
(condutor/perícia) e `ops` (operações). Frontends ficam em `apps/`. O domínio
veicular `vam` permanece reservado; consultar dados RENAVAM não equivale a
implementar esse domínio. Referências: [README](../../../../README.md),
[ADR-0002](../../adr/ADR-0002-unified-backend-modular-monolith.md).

### Segurança, auditoria e limites de LGPD

| Mecanismo existente                                                                                                                               | Referência ao código                                                                                                                                                                         | Limite de prontidão                                                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Autenticação Cognito fora de `local-sandbox`/`test`; sessões STYNX com Redis, emissor HTTPS e chave resolvida por secret; readiness de Redis/JWKS | [`detran-runtime.ts`](../../../../backend/app/src/detran-runtime.ts), [`detran-session-policy.ts`](../../../../backend/app/src/detran-session-policy.ts)                                     | Configuração e serviços reais precisam existir; verificador local não é evidência produtiva.                                   |
| Catálogo de papéis, união de papéis e matriz de permissões por recurso/ação                                                                       | [`roles.ts`](../../../../backend/domains/shared/src/roles.ts), [`policy.ts`](../../../../backend/domains/shared/src/policy.ts)                                                               | Guarda visual não substitui autorização no backend.                                                                            |
| Tenant e ator vinculados à transação; DDL com RLS e verificação estática                                                                          | [`tenant-context.ts`](../../../../backend/domains/shared/src/tenant-context.ts), [`check-rls-ddl.ts`](../../../../tools/check-rls-ddl.ts), [DDL](../../../../backend/database/ddl/README.md) | Perfis não locais exigem identidades distintas de banco para owner, app e reader.                                              |
| Auditoria persistida via `audit.write`, com tenant, ator, ação, entidade e correlação; consulta/exportação com hashes                             | `DetranPersistedAuditSink` em [`detran-runtime.ts`](../../../../backend/app/src/detran-runtime.ts), [`pec-audit-query.service.ts`](../../../../backend/app/src/pec-audit-query.service.ts)   | Registrar eventos não comprova, sozinho, minimização de todos os payloads, retenção operacional ou conformidade LGPD integral. |
| Idempotência e rate limit persistentes, não limitados à memória de uma instância                                                                  | `DetranPersistentPipelineStore` e `DetranDurableIdempotencyBackend` em [`detran-runtime.ts`](../../../../backend/app/src/detran-runtime.ts)                                                  | Dependem do banco e da configuração do pipeline.                                                                               |
| Coleções de storage com classificação e configuração de bucket/KMS                                                                                | `detranStorageOptions` em [`detran-runtime.ts`](../../../../backend/app/src/detran-runtime.ts)                                                                                               | Infraestrutura, políticas de acesso e chaves efetivamente implantadas não foram verificadas nesta inspeção.                    |

Os blueprints em [`framework/blueprints`](../../../framework/blueprints) são a autoridade
dos modelos e dos artefatos gerados; marcações de PII e retenção são metadados de
projeto, não prova automática de cumprimento de todas as obrigações de LGPD. Este
brief não atesta bases legais externas, contratos de operadores, atendimento de
titulares ou eliminação em produção além das evidências explicitadas por produto.

A cadeia DEVAI de evidência de engenharia em
[`record/proofs/chain.json`](../../../../record/proofs/chain.json) é distinta da auditoria
dos atos de negócio no banco. A cadeia legada `.devai/state/evidence-chain.json`
permanece somente como registro histórico.

### Integração nacional

Toda chamada SENATRAN passa por
[`packages/senatran-adapter`](../../../../packages/senatran-adapter/src/ports.ts), que contém
ports RENACH, RENAINF, RENAEST, SNE, CDT e consultas WSDENATRAN. Há transportes,
mapeamentos, idempotência, timeout, retries e circuit breaker. A
[`configuração`](../../../../packages/senatran-adapter/src/config.ts) seleciona
`SENATRAN_PROVIDER=mock|real`.

Em modo real, são exigidos endpoint, CPF do usuário e certificado/chave do cliente;
TLS valida o servidor e cada superfície precisa ser habilitada explicitamente.
**A superfície transacional `renavam` está desabilitada, inclusive no modo real**;
consultas por placa/RENAVAM existem no port de leitura. Contratos e testes com mock
não demonstram homologação dos serviços nacionais.

## 2. RAIT

### Propósito, atores e fluxos

Console interno para processamento administrativo das infrações: protocolo,
defesa prévia, recursos, distribuição de trabalho, julgamento colegiado e
formalização das decisões. O fluxo de infração e o fluxo do caso administrativo
são modelados separadamente. Especificação:
[`rait-build-pack.md`](../../../framework/arch/rait-build-pack.md) e
[`rait-web-frontend.md`](../../../framework/arch/rait-web-frontend.md).

Papéis canônicos em [`RAIT_ROLES`](../../../../backend/domains/shared/src/roles.ts):

- `rait-analyst` e `rait-coordinator`: análise de defesa e coordenação das filas.
- `rait-secretary`: protocolo, distribuição e secretaria de colegiado.
- `rait-signing-authority` e `rait-central-authority`: autoridade investida e autoridade centralizada.
- `rait-rapporteur` e `rait-chair`: relatoria e presidência JARI/CETRAN.
- `rait-manager`, `rait-hr` e `rait-finance`: gestão, membros/mandatos e financeiro.
- Papéis transversais `AUDITOR`, `integration-operator` e `agency-admin`: auditoria, integração e administração conforme matriz de política.

Interessado/recorrente é parte do processo; o atendimento cidadão pertence ao
Portal, não a um mobile RAIT.

Fluxos principais existentes no backend:

1. Protocolar caso; admissibilidade/não conhecimento; encaminhar e receber no órgão competente; diligenciar, resolver pendências, desistir ou redirecionar; preparar e registrar decisão. Código: [`rait-case-command.service.ts`](../../../../backend/domains/inf/rait-case/src/handwritten/rait-case-command.service.ts) e [`rait-inquiry-command.service.ts`](../../../../backend/domains/inf/rait-case/src/handwritten/rait-inquiry-command.service.ts).
2. Publicar escala, preparar/aprovar lotes, aceitar trabalho ou declarar impedimento, sortear e redistribuir. Código: [`rait-worklist-command.service.ts`](../../../../backend/domains/inf/rait-worklist/src/handwritten/rait-worklist-command.service.ts).
3. Fechar pauta, abrir/adiar sessão, tratar leitura/vistas/retirada, votar, proclamar, gerar/assinar ata e publicar. Código: [`rait-session-command.service.ts`](../../../../backend/domains/inf/rait-session/src/handwritten/rait-session-command.service.ts). Assinatura depende do serviço de confiança, não apenas da existência do comando.

### Implementado versus não pronto

| Área                                                                                                     | Estado observado                                                                                                                                                                                                                                                                                                                                                                                              |
| -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Backend de caso, worklist, sessão, organização, integração e módulos de infração/notificação/arrecadação | **Implementado**, com composição no app. A frente R-0007 está registrada como fechada no [backlog](../backlog.md); isso não completa automaticamente os consumidores web.                                                                                                                                                                                                                                     |
| Console web                                                                                              | **Parcial**: manifesto de 74 entradas, clientes/facades, 50 páginas entregues (43 L2, layout do caso e 6 L1), 16 schemas Zod, guardas, i18n, SSE/polling e error boundary. Fonte: [fechamento R-0012](../../../../work/rounds/R-0012/closure.json). L1 significa leitura; L2 identifica páginas com interações, sem implicar jornada produtiva completa.                                                      |
| Financeiro, integrações, admin, organização/escala e jeton, auditoria/exportações na UI                  | **Não prontos**: permanecem L0/placeholders nos [módulos de frontend](../../../../apps/rait/web/src/app/features). Backend existente não é tela pronta.                                                                                                                                                                                                                                                       |
| Comandos ponta a ponta, acesso contextual ao caso e documentos                                           | **Parcial**: handoffs de comandos reais, URL assinada de upload/download, dados agregados e conteúdo de ata permanecem no [backlog](../backlog.md). O [`case.client.ts`](../../../../apps/rait/web/src/app/data/api/case.client.ts) ainda lança `RaitCommandUnavailableError` nos métodos de comando, inclusive protocolo/admissibilidade. Há 139 `todo` no resultado histórico da suíte, ligados a comandos. |
| `caseAccessGuard`                                                                                        | **Não implementado como verificação contextual**: [`case-access.guard.ts`](../../../../apps/rait/web/src/app/core/guards/case-access.guard.ts) retorna `true`. Não afirmar isolamento de pool/unidade provado por essa guarda; a política do servidor permanece autoridade.                                                                                                                                   |
| Assinatura PAdES, SSE real e E2E do console                                                              | Adaptadores/contratos existem; **integração e prontidão não comprovadas**. O backlog registra `signatureAvailable=false`, integração SSE e ausência da frente Playwright `e2e/`.                                                                                                                                                                                                                              |

### Integrações, segurança, auditoria e LGPD

RENAINF é a superfície nacional principal para infração, processo, defesa e
recurso. RENACH e consultas veiculares/RENAVAM são superfícies de apoio no
adaptador; SNE/CDT atendem notificações e serviços ao cidadão. Os módulos
[`rait-integration`](../../../../backend/domains/inf/rait-integration/src) e
[`collection`](../../../../backend/domains/inf/collection/src) existem. **Homologação real,
rotinas operacionais e telas de conciliação não estão demonstradas por esse código**.

Comandos de caso usam `If-Match`/ETag e `Idempotency-Key` em
[`rait-case-commands.controller.ts`](../../../../backend/domains/inf/rait-case/src/handwritten/rait-case-commands.controller.ts).
Os comandos auditados transacionalmente são discriminados em
[`rait-transactional-audit.interceptor.ts`](../../../../backend/app/src/rait-transactional-audit.interceptor.ts).
A confiança documental é verificada por
[`document-trust.http-adapter.ts`](../../../../backend/domains/shared/src/documents/document-trust.http-adapter.ts).
RBAC/RLS, correlação e trilha persistida seguem a base compartilhada; a guarda
contextual web pendente é um limite explícito. As fichas de tela e os blueprints
descrevem exposição de dados por papel; não há evidência aqui de uma avaliação
operacional completa de LGPD.

### Frontends, implantação e qualidade

- **Web interno:** [`apps/rait/web`](../../../../apps/rait/web/README.md), Angular 22.1.6, STYNX 1.5.3, `@detran/ui`, RxJS e Zod. Telas-chave: painel do turno, filas de defesa/recurso, protocolo, abas do caso, diligências, assinatura, pauta/sessão/votos/ata, radar e trilha de auditoria. Rotas: [`app.route-manifest.ts`](../../../../apps/rait/web/src/app/app.route-manifest.ts).
- **Mobile/campo:** não há app RAIT dedicado implementado no inventário `apps/`.
- **Dashboard:** existe radar RAIT no console compartilhado, ainda L0; ver seção 6.
- **UI/tokens:** usa o kit e os temas compartilhados da seção 6; não há um sistema independente de tokens RAIT demonstrado pelo pacote.
- **Implantação:** backend e banco compartilhados, web estático com fallback de rotas, OIDC/tenant em [`runtime-config.js`](../../../../apps/rait/web/public/runtime-config.js), conectividade com a API; console sem suporte offline. Serviços reais de documentos/assinatura e integrações são requisitos adicionais antes de alegar operação completa.
- **Qualidade:** [R-0012](../../../../work/rounds/R-0012/closure.json) registra 4.434 testes aprovados e 139 `todo`, matrizes ação × papel, lint/typecheck/build e regras que proíbem cálculo local de prazo legal. **Cobertura de linhas/branches/functions/statements: não localizada em relatório versionado. Mutation score: não localizado.** Esses números não são uma medição do HEAD atual.

## 3. TEAT

### Propósito, atores e fluxos

Fiscalização e talonário eletrônico: lavratura e ciclo do AIT, medidas
administrativas, alcoolemia, evidências e operação de agentes/dispositivos/turnos.
O sinistro é uma extensão BOAT, não uma duplicação do domínio `est`.
Especificações: [`teat-frontends.md`](../../../framework/arch/teat-frontends.md) e
[`teat-build-pack.md`](../../../framework/arch/teat-build-pack.md).

Perfis em [`TEAT_STAFF_ROLES`](../../../../backend/domains/shared/src/roles.ts): agente
(`field-agent`), supervisor (`field-supervisor`), processamento
(`processing-operator`), autoridade (`traffic-authority`), administração de órgão
(`agency-admin`), administração técnica (`technical-admin`), auditoria
(`auditor`, normalizado para `AUDITOR`), BI (`bi-analyst`) e operação de integração
(`integration-operator`). Condutor e proprietário são envolvidos no ato, não
papéis internos equivalentes aos de agente.

Fluxos principais:

1. Autenticar, carregar bootstrap/provisionamento, validar prontidão e abrir turno; consultar pacotes normativos e dados nacionais/snapshots.
2. Reservar numeração, criar/revisar AIT, tratar recusa e impossibilidade separadamente, finalizar e encaminhar processamento/cancelamento conforme autorização.
3. Registrar medidas administrativas e procedimentos de alcoolemia; anexar evidências e manter custódia.
4. Manter rascunhos/fila local, sincronizar e tratar recibos/conflitos; encerrar turno. **A demonstração de homologação não emite nem sincroniza ato oficial.**

Referências de execução: [AIT](../../../../backend/domains/inf/ait/src),
[medidas](../../../../backend/domains/inf/measures/src),
[alcoolemia](../../../../backend/domains/inf/alcohol/src),
[`local-act.store.ts`](../../../../apps/teat/mobile/src/app/data/local/local-act.store.ts) e
[`sync.worker.ts`](../../../../apps/teat/mobile/src/app/data/sync/sync.worker.ts).

### Implementado versus não pronto

| Área                                                                  | Estado observado                                                                                                                                                                                                                                                                   |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Domínios `inf` e `ops`                                                | **Implementados**: AIT, normativa, medidas, alcoolemia, agência, operação de campo, snapshots, evidência, offline-sync e provisionamento possuem pacotes/código.                                                                                                                   |
| Web e mobile                                                          | **Entrega de homologação de UI/workflows**, explicitamente definida na [ADR-0033](../../adr/ADR-0033-teat-ui-workflow-homologation-scope.md); não são prova de aptidão operacional. A configuração padrão do [mobile](../../../../apps/teat/mobile/angular.json) é `homologation`. |
| Persistência local e sincronização                                    | **Código existente**: IndexedDB com AES-GCM, chave WebCrypto e operações atômicas de reserva/primeiro rascunho; fila, cursor e recibos. **Não comprova chave protegida por hardware, perfil E2 nem sincronização oficial em dispositivo real.**                                    |
| Release de campo Android/Gertec GMS820                                | **Não pronto**: equipamento homologado pelo Owner, mas interoperabilidade do app, segredos institucionais, localização real, validação AIT, impressão e prova E2 continuam como frente posterior. [Backlog](../backlog.md), issues de produção #108–#112 ali referenciadas.        |
| Integrações nacionais reais, assinatura e provisionamento em aparelho | **Não comprovados**; negativas produtivas devem continuar bloqueando atos sem os requisitos. Fixtures são exclusivamente de homologação.                                                                                                                                           |

### Integrações, segurança, auditoria e LGPD

Consultas RENACH e veiculares/WSDENATRAN, RENAINF e SNE/CDT passam pelo adaptador.
[`teat-integrations.service.ts`](../../../../backend/app/src/teat-integrations.service.ts)
e [`teat-snapshots.providers.ts`](../../../../backend/app/src/teat-snapshots.providers.ts)
fazem a ligação de aplicação. RENAEST é responsabilidade da extensão BOAT. RENAVAM
transacional continua reservado/desabilitado.

No mobile, [`ReadinessGateService`](../../../../apps/teat/mobile/src/app/core/readiness-gate.service.ts)
verifica bootstrap, sessão/turno, provisionamento e validade; as
[guardas](../../../../apps/teat/mobile/src/app/navigation/guards) verificam sessão, tenant,
papel e turno. [`main.ts`](../../../../apps/teat/mobile/src/main.ts) liga OIDC, storage
local e clientes. A [ADR-0033](../../adr/ADR-0033-teat-ui-workflow-homologation-scope.md)
exige segregação dos dados sintéticos e bloqueio produtivo, vedando substituir
prova por coordenadas inventadas ou assinatura local sem confiança.

Backend segue RBAC/RLS/auditoria da seção 1. Custódia de evidências e regras de
sincronização têm código em [ops/evidence](../../../../backend/domains/ops/evidence/src)
e [ops/offline-sync](../../../../backend/domains/ops/offline-sync/src), com composição em
[`teat-evidence.providers.ts`](../../../../backend/app/src/teat-evidence.providers.ts) e
[`teat-sync.providers.ts`](../../../../backend/app/src/teat-sync.providers.ts).
Criptografia do armazenamento do navegador é um controle implementado; não é
certificação de proteção do dispositivo ou prova de LGPD integral em campo.

### Frontends, implantação e qualidade

- **Web staff:** [`apps/teat/web/package.json`](../../../../apps/teat/web/package.json), Angular 22.1.6, STYNX 1.5.3, `@detran/ui`, RxJS/Zod e dependência Angular service worker. Telas-chave: fiscalização/AIT, medidas, alcoolemia, evidências, operações, normativa, auditoria, BI e administração. [Rotas](../../../../apps/teat/web/src/app/app.routes.ts); as cinco páginas de sinistros estão no estágio descrito em BOAT.
- **Mobile/campo:** [`apps/teat/mobile/package.json`](../../../../apps/teat/mobile/package.json), Angular 22.1.6, STYNX mobile-runtime 1.5.3, RxJS/Zod, storage WebCrypto/IndexedDB; build Angular de homologação. Telas-chave: login/MFA, turno/prontidão, consultas, AIT, medidas, alcoolemia, fila/item/conflito de sync e resumo do turno. [Rotas](../../../../apps/teat/mobile/src/app/app.routes.ts). **Empacotamento nativo e uso oficial em campo não estão comprovados por essa build web.**
- **Dashboard:** radar TEAT no console comum, L0; BI dentro do TEAT web não deve ser confundido com entrega de monitoramento integrado.
- **UI/tokens:** temas e kit compartilhados; catálogos pt-BR próprios de cada host, com catálogo BOAT incorporado.
- **Implantação:** requisitos compartilhados mais bootstrap, agência, agentes, dispositivos, versões permitidas, pacotes normativos confiáveis, reservas de numeração e provedor de impressão/localização. Homologação deve permanecer identificada e segregada. Produção requer round e provas próprias de E2/hardware/trust; a ADR-0033 não autoriza release de campo.
- **Qualidade:** [R-0013](../../../../work/rounds/R-0013/closure.json) registra mobile 1.157/1.157 e web 594/594; revisão focal DOM/a11y 32/32 e 29/29, 576 transições e 197 condicionais negadas. A entrega posterior BOAT registra web 611/611 e focal mobile 190/190; os escopos não devem ser somados. **Cobertura de código percentual e mutation score: não localizados em relatório versionado.**

## 4. BOAT

### Propósito, atores e fluxos

Registro de sinistro/acidente de trânsito: local e condições, veículos,
envolvidos/vítimas/testemunhas, dinâmica, croqui, danos, evidências e vínculos com
AIT; fechamento, complementação/retificação e transmissão ao RENAEST.
Especificações: [`boat-frontends.md`](../../../framework/arch/boat-frontends.md) e
[`boat-build-pack.md`](../../../framework/arch/boat-build-pack.md).

Perfis: `field-agent`, `field-supervisor`, `processing-operator`,
`traffic-authority` (coordenação RENAEST), `AUDITOR`; `integration-operator` para
o painel de integração. Parceiro facultativo é visão futura, sem papel canônico
entregue. O titular participa de pedidos sobre seus dados, sem virar agente.

Fluxo backend existente: atender/registrar → adicionar envolvidos, veículos,
vítimas, condutas, danos e croqui → revisar/fechar → enfileirar transmissão →
persistir protocolo/situação nacional → complementar ou retificar com motivo.
Código: [`boat-commands.service.ts`](../../../../backend/domains/est/crash/src/handwritten/boat-commands.service.ts),
[`crash-sync-applier.ts`](../../../../backend/domains/est/crash/src/handwritten/crash-sync-applier.ts)
e [`boat-renaest-transmission.service.ts`](../../../../backend/app/src/boat-renaest-transmission.service.ts).

### Implementado versus não pronto

| Área                                                   | Estado observado                                                                                                                                                                                                                                                                                                                                         |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Backend `est/crash`                                    | **Implementado**: persistência, comandos/transições, espelho nacional, fila de transmissão e correção. Há entidades de documentos e pedidos do titular.                                                                                                                                                                                                  |
| RENAEST                                                | **Implementado contra contrato/mock**: outbox durável, tentativa/recibo/protocolo, retries e job mensal com contexto de tenant. [Job](../../../../backend/app/src/boat-renaest-job.service.ts) e [providers](../../../../backend/app/src/boat-renaest-job.providers.ts). **Homologação real não comprovada**; transmissão grava `layout_version='mock'`. |
| Relatório preliminar                                   | **Implementado** em [`boat-documents.ts`](../../../../backend/app/src/boat-documents.ts): renderização WeasyPrint, validação PDF/A e storage. O modo D1 proíbe assinatura do relatório preliminar. **Não apresentar esse documento como BAT oficial assinado.**                                                                                          |
| Extensão mobile                                        | **Estrutura parcial**: biblioteca Angular com 12 componentes de página, schemas, gates, transições, i18n e interfaces de portas nativas. As [páginas](../../../../apps/boat/mobile/src/lib/pages/boat-pages.ts) renderizam título/estado; não contêm o assistente completo de coleta integrado ao backend.                                               |
| Sinistros no TEAT web                                  | **Estrutura parcial**: cinco componentes com título/aviso, sem consultas ou comandos HTTP nos [fontes](../../../../apps/teat/web/src/app/features/sinistros/sinistros.pages.ts). Não são console operacional de sinistros pronto.                                                                                                                        |
| GPS/câmera/assinatura/storage seguro/attestation reais | **Não entregues como integração nativa por tela**: [`ports.ts`](../../../../apps/boat/mobile/src/lib/ports.ts) declara interfaces; testes usam doubles. Consumidores por tela permanecem OD-R15-006 no [backlog](../backlog.md).                                                                                                                         |
| Release em campo e pedidos do titular ponta a ponta    | **Não prontos/não comprovados**: hardware, distribuição e RENAEST/SNE/gov.br reais permanecem fora; W-05 tem handoff OD-R15-003.                                                                                                                                                                                                                         |

### Integrações, segurança, auditoria e LGPD

RENAEST é a integração principal; RENACH/consulta veicular são apoio no host TEAT,
RENAINF corresponde aos AIT vinculados. O frontend não chama SENATRAN diretamente:
[`RenaestPort`](../../../../apps/boat/mobile/src/lib/ports.ts) depende de outbox/backend.

Comandos exigem versão via `If-Match` em
[`boat-commands.controller.ts`](../../../../backend/domains/est/crash/src/handwritten/boat-commands.controller.ts);
estados inválidos e retificação sem motivo são rejeitados. Eventos duráveis são
emitidos no mesmo caminho transacional pelo serviço de comandos. O applier trata
consistência de vítimas e duplicidade de chave natural.

O [`victimAccessGuard`](../../../../apps/boat/mobile/src/lib/victim-access.guard.ts) exige
papel de campo, finalidade e sinal de auditoria, **mas é controle de apresentação**;
política e auditoria no servidor são a autoridade. `health_notes` e identificação
de vítimas requerem minimização; os schemas/blueprint de
[`BP-EST-CRASH-001`](../../../framework/blueprints/BP-EST-CRASH-001.json) e as regras da
[especificação](../../../framework/arch/boat-frontends.md) documentam sensibilidade,
retenção e mascaramento de terceiros. A existência desses metadados e da entidade
de pedido do titular não comprova atendimento integral de direitos em produção.

### Frontends, implantação e qualidade

- **Mobile:** [`@detran/boat-mobile`](../../../../apps/boat/mobile/package.json) é biblioteca `ng-packagr`, não aplicativo instalável independente. Angular 22 via peers, STYNX 1.5.3/mobile-runtime, `@detran/ui`, RxJS/Zod. Carregada pelo TEAT via [`boat-extension.ts`](../../../../apps/boat/mobile/src/lib/boat-extension.ts). Telas-chave previstas/estruturadas: início, local, condições, veículos, pessoas, vítimas, dinâmica, croqui, evidências, vínculos AIT, danos e revisão.
- **Web:** módulo sinistros do TEAT: lista, detalhe, complemento, RENAEST e pedido do titular; componentes parciais acima. Não há `apps/boat/web` entregue.
- **Campo:** depende do host TEAT e das implementações reais das portas nativas; não pronto para operação oficial.
- **Dashboard:** tela compartilhada de sinistros L0; projeções backend não completam o frontend.
- **UI/tokens:** kit compartilhado; catálogo pt-BR e componentes BOAT próprios, sem tema independente demonstrado.
- **Implantação:** backend/banco comum, host TEAT, serviços de evidência/storage, WeasyPrint e validador veraPDF/container para documentos, configuração de template/política e execução mensal RENAEST por tenant/ator. Imagem e invocação do validador estão em [`boat-documents.ts`](../../../../backend/app/src/boat-documents.ts); requisitos de renderização também em [requirements CI](../../../../.github/requirements/boat-weasyprint.txt). Hardware/segredos e homologação nacional real são dependências restantes.
- **Qualidade:** [R-0015](../../../../work/rounds/R-0015/closure.json) registra BOAT 15/15, focal TEAT mobile 190/190 e TEAT web 611/611; provas DOM/axe, matrizes por papel e ausência de HTTP nas estruturas entregues. **Cobertura de código percentual e mutation score: não localizados.** Os testes de portas com doubles não demonstram câmera/GPS/attestation reais.

## 5. PEC

### Propósito, atores e fluxos

Backend de perícia administrativa do condutor/habilitação: avaliação médica e
psicológica, identificação biométrica, laudos, restrições, juntas/recursos,
toxicologia, faturamento e guarda documental. Os 17 pacotes clínicos portados
estão em [`backend/domains/ch`](../../../../backend/domains/ch/README.md); não confundir os
29 domínios históricos citados em documentos de migração com a contagem de
pacotes implementados hoje.

Papéis preservados em [`PEC_ROLES`](../../../../backend/domains/shared/src/roles.ts):
`ADMIN`, `ADMIN_CLINICA`, `MEDICO`, `PSICOLOGO`, `RECEPCAO`,
`TECNICO_BIOMETRIA`, `AUDITOR`, `GESTOR`, `SUPERVISOR`, `GESTOR_DETRAN`, `JUNTA`,
`CETRAN`, `DPO`, `SUPORTE` e `CANDIDATO`. Permissões efetivas vêm da matriz de
política; catálogo não significa acesso irrestrito a dados clínicos.

Fluxos implementados:

1. Manter rede clínica/profissionais e candidato; agendar/distribuir atendimento; verificar presença/autoria biométrica; registrar encontro, exames médico/psicológico, restrições, laudo e aditamentos.
2. Validar elegibilidade/processo RENACH, transmitir exames e processar confirmação autenticada.
3. Solicitar junta, compor membros, decidir, recorrer, obter designação CETRAN para Junta Especial distinta e assinar decisões.
4. Receber toxicologia periódica autenticada/idempotente, registrar resultado imutável, suspensão/exceção e liberação nas condições modeladas.
5. Cobrar/conferir valores, faturar, registrar divergências; tratar controles clínicos/operacionais, teleatendimento, inconsistências, exportação e retenção.

Referências: [relatório de portabilidade](../../pec-porting-report.md),
[ADR-0013](../../adr/ADR-0013-pec-parity-closure-contract.md),
[laudos](../../../../backend/domains/ch/clinical-reports/src/report-lifecycle.service.ts),
[juntas](../../../../backend/domains/ch/juntas/src),
[toxicologia inbound](../../../../backend/app/src/pec-toxicology-inbound.service.ts).

### Implementado versus não pronto

| Área                                                | Estado observado                                                                                                                                                                                                                                                                                                                                 |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Backend clínico e paridade do legado                | **Implementado, com paridade de repositório documentada**: relatório registra 76/76 critérios executáveis, disposição de 611 specs de origem e nenhum blocker de aceite em [`pec-parity-blockers.json`](../../pec-parity-blockers.json). É resultado histórico vinculado ao snapshot do relatório, não auditoria produtiva atual.                |
| Correções do legado                                 | Relatório comprova modelo de preços/IPCA, validade médica por faixas 10/5/3, rejeição de `CONDICIONADO` e Junta Especial distinta; não reduz a terceira instância a troca de signatário.                                                                                                                                                         |
| Administração de usuário, auditoria, RENACH e SEFAZ | **Código implementado** no app e nos adaptadores; execução com serviços reais permanece requisito externo.                                                                                                                                                                                                                                       |
| PAdES-LTA/TSA/cadeia/revogação e sessões reais      | **Prontidão externa não comprovada**: exigem configuração, credenciais e probes reais. Testes locais/condicionais não equivalem a homologação.                                                                                                                                                                                                   |
| Eliminação documental                               | **Bloqueada intencionalmente** até prova real de preservação PAdES-LTA. O controle negativo é requisito implementado; não anunciar funcionalidade de eliminação disponível.                                                                                                                                                                      |
| Frontend PEC                                        | **Planejado por decisão vigente, ainda sem frontend integrado em main**: ADR-0034/OD-PW-001 comissionam 19 telas staff em R-0031 e sete telas do candidato no Portal em R-0032. [`apps/pec/web/README.md`](../../../../apps/pec/web/README.md) ainda é o slot sem `package.json` ou telas; sua frase “não planejado” é histórica e foi superada. |

### Integrações, segurança, auditoria e LGPD

RENACH: processo/elegibilidade/exames por
[`pec-renach-process.service.ts`](../../../../backend/app/src/pec-renach-process.service.ts)
e [`pec-renach-transmission.service.ts`](../../../../backend/app/src/pec-renach-transmission.service.ts),
sempre pelo adaptador SENATRAN. Callback autenticado por
[`renach-webhook.guard.ts`](../../../../backend/app/src/renach-webhook.guard.ts): HMAC sobre
bytes exatos, timestamp com janela de cinco minutos e deduplicação durável;
terminação mTLS é requisito de implantação descrito no
[README do app](../../../../backend/app/README.md). SEFAZ possui adaptador HTTP em
[`packages/sefaz-adapter`](../../../../packages/sefaz-adapter/src/http-adapter.ts), com
endpoint/credenciais/homologação externa pendentes. RENAVAM/RENAINF existem na
plataforma de integração, mas não constituem o fluxo clínico principal nem
funcionalidade PEC comprovada apenas por compartilhamento do adaptador.

Biometria: [`biometric-processing-policy.ts`](../../../../backend/domains/ch/biometrics/src/biometric-processing-policy.ts)
fixa a base de processamento **LGPD art. 11, II(a), obrigação legal**, proíbe
usar II(f) como base dessa perícia administrativa e persistir biometria bruta,
separa presença do candidato de autoria do examinador e exige contrato do
operador. Essa é a política codificada do projeto, não parecer jurídico novo.
O [`adaptador biométrico`](../../../../backend/domains/ch/biometrics/src/biometric-verification.http-adapter.ts)
exige URL, token e `DETRAN_BIOMETRIC_PROCESSOR_CONTRACT_ID`, enviando referência
opaca em vez de captura bruta.

Laudos e biometria seguem RLS e marcações de sensibilidade nos blueprints.
[`retention-lifecycle.service.ts`](../../../../backend/domains/ch/retention/src/retention-lifecycle.service.ts)
implementa casos, holds e destinações, mantendo o limite de eliminação da
ADR-0013. Auditoria possui consulta/exportação em
[`pec-audit-query.controller.ts`](../../../../backend/app/src/pec-audit-query.controller.ts).
[`detran-clinical-trust.ts`](../../../../backend/app/src/detran-clinical-trust.ts) verifica
capacidade do serviço de assinatura; disponibilidade real não foi atestada.

### Frontends, implantação e qualidade

- **Web/mobile/campo PEC:** nenhum frontend próprio entregue; não há stack UI, tokens próprios ou telas-chave implementadas a inventariar. As jornadas clínicas acima são APIs/backend, não telas disponíveis.
- **Portal e dashboard:** atendimento/ouvidoria é Portal-owned; apresentação de BI é Dashboard-owned. Não constituem um prontuário web PEC entregue. Radar PEC permanece L0 no console compartilhado.
- **Implantação:** requisitos comuns, Redis/RSA/JWKS e fator forte, Cognito, provedor biométrico contratado, confiança PAdES/TSA/revogação com capability probe, endpoints/credenciais RENACH e SEFAZ, secret do callback e terminador mTLS. Contrato: [`pec-external-environment-contract.md`](../../pec-external-environment-contract.md). Eliminação continua indisponível até cumprir a prova exigida.
- **Qualidade:** [relatório PEC](../../pec-porting-report.md) registra 76/76 critérios de aceite e 611 arquivos de origem classificados (115 comportamentais, 374 placeholders `it.todo`, 122 wrappers gerados). Disposição: 80 portados e 531 supersedidos, sem deferred/blocked. **Isso mede rastreabilidade/paridade, não cobertura de linhas. Cobertura de código percentual e mutation score: não localizados.** Suítes reais/in-house são condicionais; skip não comprova provedor real.

## 6. Inventário transversal de UI e implantação

### Kit, tokens e temas existentes

[`@detran/ui`](../../../../packages/ui/README.md) fornece shell responsivo,
topbar/sidenav, breadcrumbs, estados em português e composição com primitivas
STYNX de tabela/paginação/toast/i18n. Angular 22.1.6 e STYNX 1.5.3 estão nos
campos de dependência dos manifestos dos hosts; descrições textuais antigas podem ainda citar 1.3.1; `rxjs` e `zod` complementam estado/formulários. Não há
evidência de frontend React/Flutter para os quatro produtos neste inventário.

Tokens em [`styles/index.css`](../../../../packages/ui/styles/index.css) e
[`theme.ts`](../../../../packages/ui/src/lib/theme.ts), seletor `data-detran-theme`:

| Token                           | Light     | Dark      |
| ------------------------------- | --------- | --------- |
| `--detran-color-primary`        | `#005ca9` | `#75b7f0` |
| `--detran-color-primary-strong` | `#003f73` | `#b8dcfb` |
| `--detran-color-accent`         | `#f6c900` | `#ffdb4d` |
| `--detran-color-surface`        | `#ffffff` | `#15212b` |
| `--detran-color-surface-muted`  | `#f3f6f8` | `#21313d` |
| `--detran-color-text`           | `#172b3a` | `#edf4f8` |
| `--detran-color-danger`         | `#b42318` | `#ffb4ab` |

Existem também borda/sombra; `--stynx-color-primary` e `--stynx-color-danger`
referenciam os tokens DETRAN, e `--stynx-radius` é `6px`. Temas existem em código;
esse fato não comprova avaliação completa de contraste de todas as telas.

### Dashboard e Portal

[`apps/dashboard/web`](../../../../apps/dashboard/web/README.md): Angular 22.1.6,
STYNX 1.5.3, `@detran/ui`, RxJS/Zod. Telas: monitoramento/alertas, radares
RAIT/PEC/TEAT, integrações, deveres, comparativo, auditoria, transparência,
sinistros, indicadores/frescor, relatórios/exportações/KPIs. **Todas permanecem
L0**, renderizando indisponibilidade; falta ligação de clientes/facades para
leitura real. Backend `dashboard/monitor` existe, mas não elimina a lacuna do
console. Conferir [páginas](../../../../apps/dashboard/web/src/app/features) e
[backlog de L0 → L2](../backlog.md).

Camadas de acesso N0 (agregado), N1 (fila), N2 (objeto com finalidade) e N3
(sensível, vedado) possuem lógica em
[`policy.ts`](../../../../backend/domains/shared/src/policy.ts) e
[`layer-table.ts`](../../../../apps/dashboard/web/src/app/core/layer-table.ts).
Não apresentar supressão/mascaramento ponta a ponta de telas L0 como comprovados.

[`apps/portal/web`](../../../../apps/portal/web/README.md) é o host cidadão transversal,
com PWA, consulta/protocolo e atendimento; integrações reais e delegações têm
handoffs no backlog. [`apps/portal/mobile`](../../../../apps/portal/mobile/README.md)
é placeholder adiado para depois da fase 5, não um app cidadão nativo entregue.
Nenhum desses hosts deve ser contado como frontend clínico PEC ou mobile RAIT.

### Requisitos comuns de implantação

1. Node `>=24 <25`, pnpm `9.15.0` (faixa `>=9 <10`), acesso autenticado ao GitHub Packages e dependências fixadas. Referência: [`package.json`](../../../../package.json). Tokens de registry ficam no ambiente, nunca no código.
2. PostgreSQL com extensões/roles/schemas/políticas aplicados por [`backend/database/apply.sh`](../../../../backend/database/apply.sh). Para ambientes existentes, aplicar migrações apropriadas; `backend:db:reset` é destrutivo e não é instrução de atualização produtiva.
3. Backend compilado e iniciado conforme [`backend/app/README.md`](../../../../backend/app/README.md); selecionar `staging-like`/`production` e fornecer as três URLs de banco distintas, Cognito, Redis, emissor de sessão e secret de assinatura. Verificadores locais são limitados a local/test.
4. Storage/KMS e confiança documental configurados; renderização/validação de PDF para BOAT e provedores clínicos para PEC; APIs nacionais/financeiras com credenciais, certificados e flags específicas.
5. Hosts web com HTTPS, roteamento SPA, OIDC/tenant e encaminhamento de API/SSE. Configuração pública de frontend não deve conter segredos. Campo Android exige integrações e provas adicionais descritas em TEAT/BOAT.
6. Executar gates de formatação/typecheck, geração/contratos, fronteiras, RLS, testes unitários/integrados/e2e e readiness do ambiente. [`package.json`](../../../../package.json) e [CI](../../../../.github/workflows/ci.yml) definem comandos; presença de scripts não atesta que passaram para uma implantação futura.

### O que as métricas disponíveis permitem afirmar

| Produto | Evidência versionada usada                              | Cobertura de código | Mutation score     |
| ------- | ------------------------------------------------------- | ------------------- | ------------------ |
| RAIT    | R-0012: 4.434 pass, 139 todo; matrizes de autorização   | **Não localizada**  | **Não localizado** |
| TEAT    | R-0013: mobile 1.157 pass, web 594 pass; 576 transições | **Não localizada**  | **Não localizado** |
| BOAT    | R-0015: 15 pass na biblioteca; provas focais dos hosts  | **Não localizada**  | **Não localizado** |
| PEC     | Relatório: 76/76 critérios e 611 disposições de specs   | **Não localizada**  | **Não localizado** |

Não foi localizado relatório versionado LCOV/coverage-summary ou de mutation para
esses produtos. A política
[`law/policy/mutation-strength.json`](../../../../law/policy/mutation-strength.json)
exige seleção ligada ao candidato e relatório verificável quando mutation é
requerida; **política não é resultado**. Não atribuir 0%, 100% ou aprovação à
ausência de medição. Para publicar percentuais, é necessário executar e preservar
relatórios com SHA, escopo, denominador, exclusões, runner e configuração; os
resultados históricos de aceite acima continuam sendo evidência de seus próprios
snapshots, não medição atual do produto nem certificação de produção.
