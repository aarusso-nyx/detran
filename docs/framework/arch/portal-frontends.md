---
id: ARCH-PORTAL-FRONTENDS
title: apps/portal/web — especificação completa do portal do cidadão (módulos, telas, rotas, componentes, jornadas, ações)
status: draft
apps: [portal]
updated: 2026-09-17
---

# Portal do cidadão — `apps/portal/web`

Especificação de construção do PWA público do DETRAN-AM para condutores, proprietários e
procuradores: consultar e apelar de multas, indicar condutor, pagar, aderir ao SNE, obter CNH-e e
CRLV-e, acessar o próprio BAT e o resultado de exame, ouvidoria, avaliação e direitos LGPD. O
`apps/portal/mobile` fica adiado (decisão da Fase 4: primeiro o PWA). Mesmo nível de detalhe das
especificações do RAIT e do TEAT; companheiros: `portal-route-contract.md`,
`portal-error-catalog.md`, `portal-build-pack.md`.

Fontes de verdade: [APP-PORTAL], [WF-PORTAL-001] (ciclo comum e catálogo de 15 serviços),
[WF-PORTAL-002] (identidade e nível por ato), [WF-PORTAL-003] (notificações e SNE),
[WF-PORTAL-004] (ouvidoria e avaliação), [UC-PORTAL-001]…[UC-PORTAL-019], [RN-PORTAL-101]…[128],
[JRN-PORTAL-001]…[011], [IU-PORTAL-001] (27 telas); fronteiras ADR-0019 (domínio `portal`) e
ADR-0020 (projeções); referência de implementação: o portal do repositório de origem (`../teat/apps/portal`,
27 rotas, 9 telas reais e 15 stubs de catálogo) e seu `portal-screen-catalog.md`. Quando divergirem,
vale o artefato de produto.

## 1. Stack, princípios e fronteiras

| Item           | Decisão                                                                                                                                                                                                                                                                                                                                           |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework      | Angular 22 (ADR-0015), standalone, `OnPush`, signals; PWA (service worker, manifesto, instalável); **modo offline só para CNH-e e CRLV-e** ([UC-PORTAL-011] AC-4, [JRN-PORTAL-006]) via cache cifrado do documento                                                                                                                                |
| Kit            | `@detran/ui` (feedback pt-BR, tema, primitivos STYNX) — o shell é próprio (`CitizenShell`: cabeçalho com marca do órgão, navegação de 5 destinos, rodapé com Carta de Serviços, canal presencial e acessibilidade); nenhum componente do RAIT ou do TEAT é reutilizado ([RN-RAIT-134])                                                            |
| Identidade     | Cognito federado ao **gov.br OIDC** (ADR-0019); papel `CIDADAO`; representação por procuração como atributo da sessão, não papel; nível de assinatura como claim assinada (`assurance_level`: `simples` \| `avancada` \| `qualificada`), nunca aceito do cliente                                                                                  |
| Marca e tenant | tenant resolvido pelo `Host` no servidor (`platform.public_hostname`); `GET /v1/portal/brand` público; `runtime-config.js` só com `tenantId`, `oidcAuthority`, `clientId`                                                                                                                                                                         |
| API            | somente `/v1/portal/*` (`portal-route-contract.md`), mesma origem; **nenhuma** chamada a sistemas nacionais, ao RAIT ou ao TEAT a partir do browser; o Portal lê **projeções** (ADR-0020) e emite **comandos delegados** (ADR-0019)                                                                                                               |
| Estado         | signals + facades por feature; sem NgRx; rascunhos de pedido persistidos no servidor (`portal/requests` em `PEDIDO_EM_COMPOSICAO`), não em `localStorage`                                                                                                                                                                                         |
| Idioma         | pt-BR, linguagem cidadã; catálogo `apps/portal/web/src/app/i18n/portal.pt-BR.json` com o **mapa de tradução** dos estados internos (RAIT/PEC/BOAT → situação cidadã) como única fonte; só os namespaces `portal.<namespace>` declarados na allowlist do `parameter-catalogue.md` §Namespaces i18n são reconhecidos pelo verificador de parâmetros |
| Acessibilidade | WCAG 2.1 AA + eMAG (DT-028) em todas as 27 telas; guia e boleto acessíveis mediante solicitação ([RN-PORTAL-114]); skip link, `aria-live` em estados, sem remoção de foco                                                                                                                                                                         |
| Fronteiras     | o Portal nunca decide mérito, nunca calcula prazo legal, nunca registra veículo/CNH/sinistro: exibe, compõe e protocola; prazos chegam calculados e rotulados ("seu prazo" × "prazo do órgão")                                                                                                                                                    |

## 2. Invariantes de interface (valem para toda tela)

1. **Estado interno nunca vaza**: tokens do RAIT/PEC/BOAT são traduzidos pelo mapa; o token cru fica em `data-token` para suporte ([IU-PORTAL-001] §E.1, [UC-PORTAL-005] AC-3).
2. **Prazo é sempre data calculada e rotulada** ("seu prazo até 14/10/2026" × "prazo do órgão"), com dono (`citizen` \| `agency`) ([UC-PORTAL-005] AC-2/4).
3. **Valor e desconto lado a lado**; só a faixa de 40% encerra defesa e recurso, com advertência inequívoca antes do clique ([RN-PORTAL-128], [UC-PORTAL-015]).
4. **Titular vê o próprio dado sem máscara**; máscara é controle de terceiro ([RN-PORTAL-118]).
5. **Nenhum ato exige assinatura qualificada**; o teto é a avançada, e o nível é atributo do ato ([RN-PORTAL-101]).
6. **Canal digital nunca é o único**: toda tela de ato mostra a alternativa presencial ([RN-PORTAL-105]).
7. **Protocolo é imediato, sempre**, antes de qualquer validação de conteúdo ([RN-PORTAL-111], `T-PROTOCOLO`).
8. **Nunca "acesso negado" seco**: inelegibilidade e nível insuficiente explicam o motivo e o caminho ([WF-PORTAL-001], [UC-PORTAL-019] AC-1).
9. **Uso único e exigência de uma só vez**: formulário pré-preenchido com o que o órgão sabe; nunca pede NA, AIT, NP ou documento do órgão ([RN-PORTAL-106], [RN-PORTAL-107]).
10. **Consequência antes do ato**: desistência, indicação irregular, adesão ao SNE (quatro efeitos), renúncia da faixa de 40% ([UC-PORTAL-004/006/007/015]).
11. **Recebimento irrecusável** na ouvidoria; sem motivo determinante ([RN-PORTAL-109]).
12. **Dois canais eletrônicos distintos** (SNE × Portal) e `canal_entrada` registrado ([RN-PORTAL-124]).

## 3. Identidade, papéis e guardas

| Sujeito                    | Como entra                                 | O que vê                                                                          |
| -------------------------- | ------------------------------------------ | --------------------------------------------------------------------------------- |
| anônimo                    | sem login                                  | `/`, `/carta-servicos`, `/pontuacao/como-funciona`, `/acessibilidade`             |
| `CIDADAO` (nível simples)  | gov.br via Cognito                         | consultas, documentos, SNE, pagamento (guia), ouvidoria, avaliação, meus dados    |
| `CIDADAO` (nível avançada) | elevação guiada ([UC-PORTAL-019])          | + defesa, recursos, indicação de condutor, junta médica, declaração LGPD completa |
| procurador / representante | `CIDADAO` + representação validada por ato | os mesmos atos em nome do representado, com o vínculo exibido                     |

Guardas: `authGuard` (sessão), `assuranceGuard(level)` por rota de ato (redireciona a
`/assinatura/elevacao?retomar=<rota>`; nunca bloqueia sem explicar), `entitlementGuard`
(vínculo CPF ↔ AIT/processo/veículo/CNH/sinistro; falha → tela "por que não vejo isto" com
caminho para a ouvidoria), `serviceAvailabilityGuard(serviceKey)` (catálogo diz `unavailable`
com motivo e canal alternativo → tela de indisponibilidade, nunca 404). A matriz ato → nível vem do
servidor (`GET /v1/portal/me` → `actRequirements[]`), nunca de tabela no cliente.

## 4. Módulos e mapa de rotas

Doze módulos lazy em `src/app/features/`. Rotas portuguesas do portal de origem, corrigidas para o
catálogo (`/nova` nos atos; `:vehicleId` no CRLV-e). Cada rota lista tela ([IU-PORTAL-001]),
nível exigido, resolver e caso de uso.

```text
/                                        home pública → catálogo + entrada gov.br          (anônimo)
/carta-servicos                          T-25  Carta de Serviços por serviço                (anônimo)   resolver: GET portal/services
/carta-servicos/:serviceKey              T-25  detalhe do serviço (11 campos, RN-108)       (anônimo)
/pontuacao/como-funciona                 T-15  conteúdo público versionado                  (anônimo)
/acessibilidade                          —     declaração WCAG 2.1 AA + eMAG                (anônimo)
/auth/callback                           —     retorno OIDC
/inicio                                  —     painel do cidadão: ações pendentes, prazos    simples     resolver: me, notificações não lidas, autos com ação
/autos                                   T-14  minhas multas e pontuação                    simples     resolver: GET portal/aits (projeção)
/autos/:aitId                            T-01  detalhe da autuação (defender · indicar · pagar juntos) simples  resolver: GET portal/aits/:id
/autos/:aitId/defesa/nova                T-02  assistente de defesa prévia                  avançada    UC-001
/autos/:aitId/condutor/nova              T-05  assistente de indicação de condutor          avançada    UC-004
/autos/:aitId/pagamento                  T-13  comparação de pagamento (80 · 60 · 40 com renúncia) simples UC-015
/autos/:aitId/pagamento/preservando-recurso T-23 pagar sem abrir mão do recurso            simples     UC-015 AC-5
/processos                               T-06  meus processos (ordenável por urgência)      simples     resolver: GET portal/requests
/processos/:requestId                    T-07  detalhe e linha do tempo ("com você" × "com o órgão") simples  UC-005
/processos/:requestId/diligencia/:id     T-11  resposta a diligência (contador)            simples     UC-009
/processos/:requestId/desistencia        T-08  confirmação de desistência                   simples (forma escrita = assinatura eletrônica) UC-006
/processos/:requestId/decisao            T-10  decisão (resultado → resumo → próximo passo) simples     UC-008
/processos/:requestId/jari/nova          T-03  assistente de recurso à JARI                 avançada    UC-002
/processos/:requestId/cetran/nova        T-04  assistente de recurso ao CETRAN              avançada    UC-003
/notificacoes                            T-12  caixa de entrada (SNE × canal próprio)       simples     UC-007, WF-003
/notificacoes/preferencias               —     canal preferencial                           simples
/sne                                     T-09  adesão ao SNE (quatro efeitos)               simples→avançada UC-007
/documentos/cnh-digital                  T-16  CNH-e (offline, QR)                          simples     UC-011
/veiculos                                —     meus veículos                                simples
/veiculos/:vehicleId/crlv-e              T-17  CRLV-e (quitação antes da tentativa)         simples     UC-012
/sinistros                               T-18  buscar meu boletim                           simples     UC-013
/sinistros/:crashId                      T-19  detalhe do sinistro (titular sem máscara)    simples     UC-013
/exames                                  T-20  resultado de exame de aptidão                simples     UC-014
/exames/:examId/junta/nova               —     requerer junta médica/psicológica            avançada    WF-PEC-002
/ouvidoria/nova                          T-21  nova manifestação (anônimo admitido)         nenhum/simples (DT-051) UC-016
/ouvidoria/:manifestationId              T-22  acompanhar manifestação (dois relógios)      simples     UC-016
/avaliacao/:requestId                    T-26  avaliação do serviço                         simples     UC-017
/privacidade/meus-dados                  T-24  meus dados (LGPD): confirmar, declarar, corrigir simples→avançada UC-018
/assinatura/elevacao                     T-27  elevação de nível (retoma o ato)             simples     UC-019
/conta                                   —     sessão, representação ativa, sair
```

| Módulo         | Rotas                                                         | Backend (ADR-0019/0018)                                   |
| -------------- | ------------------------------------------------------------- | --------------------------------------------------------- |
| `core`         | `/`, `/auth/callback`, `/inicio`, `/conta`, `/acessibilidade` | `portal/identity`, `portal/brand`                         |
| `catalogo`     | `/carta-servicos*`, `/pontuacao/como-funciona`                | `portal.service_catalog` (dados, não código)              |
| `autos`        | `/autos*` (T-14, T-01)                                        | projeção `portal.infraction_view`                         |
| `defesa`       | T-02, T-03, T-04                                              | `portal/requests` → delegação `inf:rait-case:protocol`    |
| `indicacao`    | T-05                                                          | `portal/requests` → `inf:infraction:indicate-driver`      |
| `pagamento`    | T-13, T-23                                                    | `portal/requests` → `inf:collection:issue` (ADR-0017)     |
| `processos`    | T-06, T-07, T-08, T-10, T-11                                  | `portal/requests` + projeção `portal.process_timeline`    |
| `notificacoes` | T-12, preferências, T-09                                      | `portal/inbox`, `preferences`, `SnePort` via notificação  |
| `documentos`   | T-16, T-17, `/veiculos`                                       | leituras via adapter cacheadas (RENACH, RENAVAM), coleção |
| `sinistros`    | T-18, T-19                                                    | projeção do BOAT                                          |
| `exames`       | T-20, junta                                                   | projeção do PEC; delegação `ch:...:request-board`         |
| `atendimento`  | T-21, T-22, T-26                                              | `portal/citizen-service`                                  |
| `privacidade`  | T-24                                                          | `portal/identity` + `@stynx-nyx/privacy`                  |
| `assinatura`   | T-27                                                          | `portal/identity` (redirect gov.br + `resume` token)      |

## 5. Componentes

### 5.1 Núcleo (`core/`)

| Componente             | Papel                                                                                                                                                                 |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CitizenShell`         | cabeçalho com marca do tenant, navegação (Início · Autos · Processos · Atualizações · Documentos), rodapé (Carta, presencial, acessibilidade, privacidade), skip link |
| `BrandService`         | `GET /v1/portal/brand`; estado `unavailable` mostra marca neutra sem quebrar                                                                                          |
| `SessionFacade`        | sessão gov.br, `assuranceLevel`, representação ativa, `actRequirements[]`                                                                                             |
| `ResumeService`        | guarda a rota e o rascunho ao redirecionar para elevação e retoma onde parou ([UC-PORTAL-019] AC-4)                                                                   |
| `ErrorBoundary`        | `PORTAL.*` → mensagem cidadã + próximo passo; `ENTITLEMENT_*` → "por que não vejo isto"                                                                               |
| `OfflineDocumentStore` | cache cifrado de CNH-e/CRLV-e com validade; modo bateria crítica ([UC-PORTAL-011] AC-4)                                                                               |

### 5.2 Compartilhados de domínio (`shared/`)

| Componente               | Entradas / saídas                                                                                                               | Regra                                     |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| `CitizenStatusBadge`     | `situation` (`em_analise` · `aguardando_decisao` · `em_diligencia` · `decidido` · `encerrado`), `token` interno em `data-token` | tradução única ([RN-PORTAL-112])          |
| `DeadlineCard`           | `dueOn`, `ownedBy: citizen                                                                                                      | agency`, `label`, `daysLeft`              | data calculada e rotulada        |
| `ActionTriplet`          | ações defender · indicar · pagar com `available`/`reason` cada                                                                  | sempre juntas (T-01)                      |
| `ServiceWizard`          | passos (elegibilidade → composição → assinatura → protocolo), rascunho servidor, canal presencial                               | ciclo comum [WF-PORTAL-001]               |
| `PrefilledField`         | valor do órgão (somente leitura) + "corrigir" quando permitido                                                                  | uso único ([RN-PORTAL-106])               |
| `AttachmentUploader`     | tipos aceitos, tamanho, hash, checklist que **exclui** documentos do órgão                                                      | [UC-PORTAL-001] AC-3                      |
| `ConsequenceDialog`      | texto do efeito jurídico, versão do texto, confirmação por escrito                                                              | desistência, renúncia 40%, indicação, SNE |
| `SignatureStep`          | nível exigido vs. atual; assina no gov.br (avançada) ou upload assinado; `resume`                                               | [RN-PORTAL-104], [UC-PORTAL-004]          |
| `PaymentComparison`      | 80 · 60 (SNE) · 40 (renúncia) lado a lado; juros após vencimento; parcelamento                                                  | [RN-PORTAL-125…128]                       |
| `ProtocolReceipt`        | número, data-hora, canal, download                                                                                              | [RN-PORTAL-111]                           |
| `ProcessTimeline`        | eventos `visibility=citizen`, "com você" × "com o órgão", diligência com contador                                               | [UC-PORTAL-005]                           |
| `NotificationList`       | `kind: acao_necessaria                                                                                                          | informativo`, origem `sne                 | portal`, ciência ficta calculada | [RN-PORTAL-124] |
| `SneConsent`             | quatro efeitos, ciência ficta 30 dias, cancelar a qualquer tempo, versão do termo                                               | [RN-PORTAL-123]                           |
| `DigitalDocumentCard`    | dados, QR verificável, validade como data, offline, compartilhar/imprimir                                                       | [RN-PORTAL-115], [RN-PORTAL-117]          |
| `ClearanceStatus`        | quitação por rubrica antes da tentativa; débito × restrição; recurso suspensivo não bloqueia                                    | [RN-PORTAL-116], DT-027                   |
| `OwnDataPanel`           | dado sem máscara, categoria (documento · cópia · consulta), origem                                                              | [RN-PORTAL-117], [RN-PORTAL-118]          |
| `ManifestationForm`      | tipo (5), descrição livre, sigilo, anexos, comprovante imediato                                                                 | [RN-PORTAL-109]                           |
| `EvaluationForm`         | 5 dimensões da lei + comentário; aviso de publicação                                                                            | [RN-PORTAL-110]                           |
| `AlternativeChannelNote` | endereço/horário do presencial para o mesmo ato                                                                                 | [RN-PORTAL-105]                           |
| `AssuranceExplainer`     | "qual nível falta e como obter" com os três caminhos                                                                            | [UC-PORTAL-019]                           |

## 6. Jornadas (rota → ação → comando → efeito)

| Jornada                            | Sequência                                                                                                                                                                                                                                                                                                |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [JRN-PORTAL-001] recorre até o fim | `/autos` → `/autos/:id` → `/assinatura/elevacao` (se simples) → `/autos/:id/defesa/nova` (`POST requests` + `submit` → `inf:rait-case:protocol`) → `/processos/:id` → `/processos/:id/decisao` → `/processos/:id/jari/nova` → decisão → `/processos/:id/cetran/nova` (parecer da JARI anexado de ofício) |
| [JRN-PORTAL-002] indica condutor   | `/autos/:id` → `/autos/:id/condutor/nova` (dados do condutor, dois caminhos de assinatura, consequência antes) → `submit` → `inf:infraction:indicate-driver` → `/notificacoes` (condutor indicado notificado)                                                                                            |
| [JRN-PORTAL-003] acompanha         | `/processos` → `/notificacoes` (diligência: `acao_necessaria`) → `/processos/:id/diligencia/:d` (`POST …/responses`) → `/processos/:id/decisao`                                                                                                                                                          |
| [JRN-PORTAL-004] consulta multas   | `/autos` (CPF basta) → `/pontuacao/como-funciona` → `/autos/:id` → `/autos/:id/pagamento`                                                                                                                                                                                                                |
| [JRN-PORTAL-005] adere ao SNE      | `/autos/:id` → `/autos/:id/pagamento` (60% só com SNE) → `/sne` (`POST sne/enrollment`) → `/notificacoes`                                                                                                                                                                                                |
| [JRN-PORTAL-006] blitz offline     | `/documentos/cnh-digital` → `/veiculos/:v/crlv-e` (cache cifrado; QR verificável; bateria crítica)                                                                                                                                                                                                       |
| [JRN-PORTAL-007] BAT próprio       | `/sinistros` (vínculo) → `/sinistros/:id` (titular sem máscara; saúde de terceiro protegida)                                                                                                                                                                                                             |
| [JRN-PORTAL-008] exame de aptidão  | `/exames` (rótulo legal, validade calculada) → junta com prazo de 30 dias                                                                                                                                                                                                                                |
| [JRN-PORTAL-009] ouvidoria         | `/ouvidoria/nova` (`POST manifestations`, comprovante imediato) → `/ouvidoria/:id` (30+30, 20+20) → `/avaliacao/:id`                                                                                                                                                                                     |
| [JRN-PORTAL-010] paga e recorre    | `/autos/:id/pagamento` → `/autos/:id/pagamento/preservando-recurso` (`inf:collection:issue`, sem renúncia) → `/processos/:id/jari/nova`                                                                                                                                                                  |
| [JRN-PORTAL-011] meus dados        | `/privacidade/meus-dados` (confirmação imediata; declaração completa protocolada com o prazo do regime público; correção como ação)                                                                                                                                                                      |

## 7. Formulários, validação e gates

| Formulário                   | Campos obrigatórios                                                                        | Validação de forma                                                        | Gate (nível · pré-condição · comando · efeito)                                                                           |
| ---------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Defesa prévia (T-02)         | fatos, fundamentos; anexos opcionais (nunca NA/AIT/NP)                                     | um AIT por requerimento; anexo PDF/JPEG/PNG ≤ 10 MB; rascunho no servidor | avançada · AIT em `NOTIFICADO_AUTUACAO` com `T-DEF` aberto (fora do prazo: protocola e avisa) · `submit` → `PROTOCOLADO` |
| Recurso à JARI (T-03)        | fundamentos, provas                                                                        | idem; já pagou não impede                                                 | avançada · NP com `T-NP-VENC` aberto (intempestivo: avisa sem efeito suspensivo) · `submit`                              |
| Recurso ao CETRAN (T-04)     | texto adicional (opcional); parecer da JARI anexado de ofício                              | —                                                                         | avançada · `T-R2` aberto (vencido bloqueia com explicação) · `submit`                                                    |
| Indicação de condutor (T-05) | CPF, CNH, UF, categoria, nome do condutor; assinatura de ambos (gov.br ou upload assinado) | CPF/CNH válidos; consequência confirmada                                  | avançada · `T-IND` aberto · `submit` → `inf:infraction:indicate-driver`                                                  |
| Pagamento (T-13/T-23)        | faixa (80/60/40), meio (PIX/débito/boleto/cartão)                                          | 60% só com SNE; 40% exige `declaracao_reconhecimento` + versão do texto   | simples · `inf:collection:issue`; PIX/boleto gerados pelo módulo de arrecadação; Portal não é arrecadador                |
| Desistência (T-08)           | confirmação por escrito, motivo (opcional)                                                 | —                                                                         | forma escrita · antes do julgamento (pautado hoje bloqueia) · `withdraw` → `ENCERRADO_DESISTENCIA`                       |
| Resposta a diligência (T-11) | resposta, anexos                                                                           | prazo visível; prorrogação uma vez                                        | simples · diligência `open` · `POST …/responses`                                                                         |
| Adesão ao SNE (T-09)         | e-mail, celular, aceite dos quatro efeitos                                                 | contato obrigatório (sem e-mail/celular bloqueia)                         | simples→avançada · `POST sne/enrollment` (adapter `SnePort.enrollCitizen`)                                               |
| Preferências                 | canal preferencial                                                                         | —                                                                         | `PUT preferences`                                                                                                        |
| Manifestação (T-21)          | tipo, descrição; sigilo; anônimo admitido                                                  | sem motivo determinante                                                   | nenhum/simples (DT-051) · `POST manifestations` → comprovante imediato                                                   |
| Avaliação (T-26)             | 5 dimensões, comentário                                                                    | —                                                                         | após `RESULTADO_DISPONIVEL`/`ENCERRADA` · `POST evaluations`                                                             |
| Meus dados (T-24)            | escopo (confirmação · declaração completa · correção · eliminação)                         | declaração completa exige avançada                                        | `POST privacy/requests` (`@stynx-nyx/privacy`)                                                                           |
| Elevação (T-27)              | caminho (biográfica · biométrica · ICP-Brasil)                                             | —                                                                         | redirect gov.br com `resume`; prazo legal não pausa (AC-4a)                                                              |
| Junta médica                 | motivo                                                                                     | 30 dias do conhecimento                                                   | avançada · delegação PEC                                                                                                 |

Erros de forma inline; erros de negócio pelo envelope com códigos de `portal-error-catalog.md`,
sempre com próximo passo e canal alternativo.

## 8. Dados, cache e tempo real

- Leituras: projeções (`portal.infraction_view`, `portal.process_timeline`, `portal.points_view`,
  `portal.inbox_item`) e leituras nacionais cacheadas pelo servidor; nenhuma tabela do RAIT.
- Rascunhos: `portal/requests` em `PEDIDO_EM_COMPOSICAO`; um rascunho por ato e AIT.
- Tempo real: SSE `/v1/portal/stream` (`inbox.item`, `request.changed`, `decision.published`) com
  fallback de polling de 60 s; push web via `@stynx-nyx/notifications` quando o cidadão optar.
- Offline: só CNH-e/CRLV-e (cache cifrado com validade); qualquer outra rota mostra estado
  "sem conexão" sem prometer envio posterior.
- Arquivos: upload por URL assinada do storage (ADR-0018); download de recibo, decisão e documentos.

## 9. Estrutura de pastas

```text
apps/portal/web/src/
  app/core/        shell, sessão, marca, guardas, `ErrorBoundary`, offline e runtime
  app/shared/      componentes reutilizáveis, wizard, diálogos, recibo e canal alternativo
  app/forms/       14 schemas zod, `form-gate.ts` e anexos
  app/data/        `portal.client.ts`, modelos de leitura/comando e idempotência
  app/features/*/  módulos lazy: catálogo, autos, defesa, indicação, pagamento, processos,
                    notificações, documentos, sinistros, exames, atendimento, privacidade e assinatura
  app/i18n/        catálogo plano `portal.pt-BR.json` e fallback
  app/a11y/        helper `axe` e invariantes de acessibilidade
  app/screens/     páginas por tela e seus componentes de rota
  testing/**       stubs, fixtures e harness HTTP/router dos specs
```

Caminho completo: `apps/portal/web/src/app/i18n/portal.pt-BR.json`; só os namespaces
declarados na allowlist do `parameter-catalogue.md` §Namespaces i18n (allowlist do
verificador) são reconhecidos por `verify:parameter-catalogue --check-usage`.

## 10. Dependências de backend (pré-requisitos de release)

| Dependência                                                                                            | Situação ao fim de R-0014                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Domínio `portal` (identity, requests, inbox, citizen-service) — ADR-0019                               | entregue em R-0009 (PC-0006) (`work/rounds/R-0009/plan.md` §Retomada; `portal-build-pack.md` §2, WP-P1)                                                                      |
| Projeções `portal.*` — ADR-0020                                                                        | entregues em R-0009 (PC-0006) (`work/rounds/R-0009/plan.md` §Retomada; `portal-build-pack.md` §2, WP-P2)                                                                     |
| Comandos delegados no `inf` (`rait-case:protocol`, `infraction:indicate-driver`, `collection:issue`)   | pendentes de R-0007; as rotas devolvem `delegacao_indisponivel_r0007` (`work/rounds/R-0014/plan.md` M15; `portal-build-pack.md` §2, WP-P2)                                   |
| gov.br federado no Cognito + claim de nível assinada                                                   | pendente; somente IdP simulado nos perfis `test`/`local` (`portal-build-pack.md` §4, OD-P15)                                                                                 |
| Adapter: `SnePort`, `CdtPort` (multas, veículos, CNH, cotação, reconhecimento), RENACH/RENAVAM leitura | usados pelo Portal contra o `senatran-mock`; homologação real permanece pendente (`work/rounds/R-0014/contracts/CTG-0004.md` §2–§4; `portal-build-pack.md` §4, OD-P16)       |
| Projeções BOAT (BAT) e PEC (exames)                                                                    | pendentes; hoje há somente as fixtures `crash_view` e `exam_view` (`portal-build-pack.md` §4, OD-P19)                                                                        |
| Carta de Serviços como dados (`portal.service_catalog`, 11 campos)                                     | dados em `portal.service_catalog` como fixture; carga institucional permanece pendente (`portal-build-pack.md` §4, OD-P26)                                                   |
| Push                                                                                                   | inscrição entregue no padrão M9 de R-0009 (`work/rounds/R-0014/contracts/CTG-0004.md` §5, A19(b)); chave VAPID e envio pendentes (`portal-build-pack.md` §4, OD-P88)         |
| Portaria estadual de níveis (DT-050), instrumento da renúncia (DT-026), cartão (DT-031)                | DT-026 e DT-031 respondidas e mantidas por flags; OD-P01 tem a PN DETRAN-AM 001/2025, restando CETRAN-AM (`portal-build-pack.md` §4, OD-P01/OD-P03/OD-P05)                   |
| Tratamento de `status 0`                                                                               | `status 0 → offline` vive só no `ErrorBoundary`; OD-P102 segue como unificação futura, sem duplicação a absorver (`work/rounds/R-0014/plan.md` A12(a); `backlog.md` OD-P102) |

Enquanto uma dependência não existe, o serviço aparece no catálogo como `unavailable` com motivo
e canal alternativo (constraint do catálogo), nunca como 404.

Estado ao fim de R-0014: domínio `portal` e projeções foram entregues em R-0009 (PC-0006), e
WP-P4…P6 concluíram o Portal contra o `senatran-mock`. As delegações reais permanecem em R-0007
com `delegacao_indisponivel_r0007`; OD-P15 (gov.br real), OD-P16 (homologação real do adapter),
OD-P17 (privacy), OD-P19 (BOAT/PEC) e OD-P88 (VAPID) seguem pendentes. CTG-0004 cobre CNH-e,
veículos e quitação contra o mock; `SnePort` e `CdtPort` são usados nesse caminho, e a inscrição push foi entregue (`work/rounds/R-0014/contracts/CTG-0004.md` §5; envio e VAPID `source_pending`, OD-P88). Pela A12(a), a regra `status 0 → offline` fica exclusivamente no
`ErrorBoundary`; OD-P102 permanece como unificação futura, sem regra duplicada a absorver
(`docs/meta/knowledge-base/backlog.md`, OD-P102).
