---
id: ARCH-TEAT-FRONTENDS
title: apps/teat/mobile e apps/teat/web — especificação completa dos frontends do TEAT (módulos, telas, navegação, componentes, jornadas, ações)
status: draft
apps: [teat]
updated: 2026-09-24
---

# Frontends do TEAT — talão eletrônico de campo e retaguarda

Especificação de construção dos dois frontends do TEAT (Talão Eletrônico de Autuação de
Trânsito): o **aplicativo móvel de campo** (`apps/teat/mobile`, agente e supervisor, offline-first)
e o **console web de retaguarda** (`apps/teat/web`, operador de processamento, autoridade,
Diretoria de Fiscalização, administradores, auditor, BI, operador de integração). Mesmo nível de
detalhe da especificação do RAIT (`rait-web-frontend.md`); companheiros: `teat-route-contract.md`,
`teat-error-catalog.md`, `teat-build-pack.md`.

Fontes de verdade que este documento apenas projeta em software: [APP-TEAT], [WF-TEAT-001]…
[WF-TEAT-005], [UC-TEAT-001]…[UC-TEAT-013], [RN-TEAT-001]…[RN-TEAT-144], [JRN-TEAT-001]…
[JRN-TEAT-006], [IU-TEAT-001] (deltas) e, para o inventário base de telas, a **matriz oficial de
paridade** do repositório de origem (`ux-parity/mobile-matrix.json`: 67 telas, 576 transições;
`ux-parity/web-matrix.json`: 56 telas, 163 transições; `ux-parity/journeys.json`: 9 jornadas),
que este documento **porta** para o monorepo, com os deltas de [IU-TEAT-001] absorvidos. Quando
divergirem, vale o artefato de produto; a matriz continua autoridade sobre _quais_ telas existem.

## 1. Stack, princípios e fronteiras

| Item           | Decisão                                                                                                                                                                                                                                                                                        |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework      | Angular 22 (ADR-0015), standalone, `OnPush`, signals; web com `@angular/router` lazy por feature; **mobile com router Angular** (o protótipo de origem usava máquina de estados sem router; aqui a máquina vira `app.routes.ts` + guardas, preservando as 576 transições como tabela de teste) |
| Mobile runtime | Capacitor via `@stynx-nyx/mobile-runtime` (STYNX 1.3.1): armazenamento cifrado (`MobileEncryptedStorePort`), impressora/BLE (`MobilePrinterPort`), relógio, ids, sessão; portas de teste em `mobile-test-adapters`                                                                             |
| Kit            | `@detran/ui` (shell web, feedback pt-BR, tema) — ADR-0006; no mobile só os primitivos e o tema, com shell próprio de uma mão (`FieldShell`)                                                                                                                                                    |
| Plataforma     | `@stynx-nyx/angular`, `angular-auth` (OIDC Cognito, `authGuard`, `permissionGuard`), `angular-tenancy`, `angular-i18n`, `angular-ui`; `@stynx-nyx/offline-sync` no backend                                                                                                                     |
| Bootstrap      | `provideDetranAuthenticatedApp` nos dois apps; no mobile, `provideTeatMobileRuntime()` adiciona as portas do runtime e o `ReadinessGate`                                                                                                                                                       |
| API            | somente o backend unificado (`/v1/inf/*`, `/v1/ops/*` — `teat-route-contract.md`); **nenhuma** chamada a RENAVAM/RENACH/RENAINF/RENAEST/SNE a partir do app (ADR-0003); consultas de veículo/condutor passam por `ops/snapshots` + adapter                                                     |
| Estado mobile  | signals + store local cifrado por agregado (`draft`, `queue`, `evidence`, `reservation`, `package`, `print-receipt`); toda escrita local é versionada e vai para a fila (`SyncQueueItem`) — nunca `savePlainRecord`                                                                            |
| Idioma         | pt-BR único; catálogo `i18n/teat.pt-BR.json` (`teat.*`), tokens canônicos dos workflows traduzidos só para rótulo                                                                                                                                                                              |
| Acessibilidade | WCAG 2.1 AA; mobile: alvo ≥ 48 dp, uma mão, alto contraste ao sol, luvas ([IU-TEAT-001] §D.4)                                                                                                                                                                                                  |
| Fronteiras     | o app não decide mérito nem calcula prazo legal; enquadramento, validações e valores considerados vêm do **pacote normativo** instalado (offline) e do backend (online); o app não fala com a infração (ADR-0016): emite `AIT_INTEGRADO` por meio do backend                                   |

## 2. Invariantes de interface (valem para toda tela)

1. **Recusa ≠ impossibilidade**, sempre em controles separados (AIT, termo de medida, alcoolemia) — [RN-TEAT-005], [RN-TEAT-134].
2. **Valores metrológicos em par**: medido e considerado nunca aparecem sozinhos (alcoolemia, velocidade) — [RN-TEAT-133], [RN-TEAT-138].
3. **Enum fechado nunca vira texto livre**: medidas (art. 269), constatação sem abordagem (Casos 1/2/3), tipos de evidência, motivos — [RN-TEAT-122], [RN-TEAT-108].
4. **Nada bloqueia por falta de rede** no fluxo de campo; fila e erros são visíveis — [RN-TEAT-001], AC-TEAT-005-5.
5. **Autopreenchimento é proposta** (OCR, consulta): confirmação campo a campo — [RN-TEAT-115], AC-TEAT-013-7.
6. **Finalizar é ato explícito**: nenhuma transição automática de `ait-review` para `ait-done` — [RN-TEAT-114], 997 Anexo II g).
7. **Dois gates antes de qualquer ato legal**, nesta ordem: sessão STYNX exclusiva por dispositivo e postura/homologação do dispositivo verificadas — [RN-TEAT-110], [RN-TEAT-111], [RN-TEAT-003].
8. **Pacote normativo expirado em campo sem conectividade não bloqueia a lavratura** — aviso
   visível ao agente e o ato registra o pacote que o gerou (decisão do Owner, steering E.29); só a
   **ausência** de pacote bloqueia.
9. **Chrome global de bodycam** em toda tela do serviço operacional: gravando, pausada por exceção, falha — [RN-TEAT-141]; o regime de acesso ao conteúdo fica na retaguarda ([RN-TEAT-142]).

## 3. Papéis e guardas

Papéis canônicos do TEAT já existem em `roles.ts` (nove códigos). Guardas: `authGuard`,
`tenantGuard`, `roleGuard(roles[])`, `readinessGuard` (mobile: bootstrap carregado, sessão
exclusiva, dispositivo homologado, pacote normativo válido, reserva de numeração ativa quando o
destino é um ato legal), `shiftGuard` (turno aberto). Botões seguem
`isDetranActionAllowed(principal, 'inf:ait', 'finalize')` com as chaves de `TEAT_RULES` e
`OPS_SURFACE_RULES`.

| Papel                     | Mobile                                     | Web                                                                                                                                          |
| ------------------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `field-agent`             | tudo (67 telas)                            | painel, operações (leitura), evidências (leitura)                                                                                            |
| `field-supervisor`        | tudo + resolver conflito, liberar retenção | operações, mapa, turnos, sincronização (conflitos, numeração), medidas (liberação)                                                           |
| `processing-operator`     | —                                          | fila de AIT, saneamento, medidas, alcoolemia, evidências, sincronização (leitura)                                                            |
| `traffic-authority`       | —                                          | validação, aceite/rejeição, correções, apuração de concorrência, cancelamento de rascunho, medidas (concluir/cancelar), normativos (leitura) |
| Diretoria de Fiscalização | —                                          | decisão de cancelamento pós-finalização (D-04) — **mapeada a `traffic-authority` em nível superior** até OD-T01                              |
| `agency-admin`            | —                                          | administração (órgão, unidades, convênios, competências), homologação, catálogo normativo, faixas de numeração                               |
| `technical-admin`         | —                                          | dispositivos, versões de app, pacote mobile, saúde, jobs, filas                                                                              |
| `auditor` (`AUDITOR`)     | —                                          | auditoria (eventos, timelines, consultas externas, anomalias), custódia, exportações — somente leitura                                       |
| `bi-analyst`              | —                                          | inteligência (BI)                                                                                                                            |
| `integration-operator`    | —                                          | integrações (lotes, itens, retransmissão, certificados)                                                                                      |

## 4. Mobile — módulos e inventário de telas

Oito módulos lazy em `apps/teat/mobile/src/app/features/<modulo>`, um por grupo da matriz. Rotas
`/<screenId>` (o `screenId` da matriz é a rota; `uxCode` fica em `data.uxCode` para o gate de
paridade). Entrada `auth-login`; pós-login `shift-context`; home `home`; barra inferior
`home · ait-start · measure-start · crash-start · sync` (sinistro é do BOAT e aparece como
atalho ao app BOAT quando instalado; fora disso, oculto).

| Módulo (`features/`) | Telas (uxCode — screenId)                                                                                                                                                                                                                                                                                                                                                                                         | Fonte                                         |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| `turno`              | 001 `auth-login` · 002 `auth-mfa` · 003 `device-blocked` · 004 `shift-context` · 005 `operation-select` · 006 `open-shift` · 007 `home` · 008 `close-shift` · 009 `shift-summary` · **D-01 `device-handoff`** (novo: declarar falha / handoff de sessão)                                                                                                                                                          | [JRN-TEAT-001], [JRN-TEAT-006], [UC-TEAT-012] |
| `consultas`          | 010 `vehicle-search` · 011 `vehicle-result` · 012 `vehicle-divergence` · 013 `driver-search` · 014 `driver-result` · 015 `query-failure`                                                                                                                                                                                                                                                                          | [UC-TEAT-001] p.2, [RN-TEAT-115]              |
| `ait`                | 020 `ait-start` · 021 `ait-vehicle` · 022 `ait-driver` · 023 `ait-frame` · 024 `ait-frame-detail` · 025 `ait-location` · 026 `ait-notes` · 027 `ait-validations` · 028 `ait-evidence` · 029 `ait-measures` · 030 `ait-signature` · 031 `ait-review` · 032 `ait-done` · 033 `ait-print` · 034 `ait-shift-detail` · **D-04 `ait-cancel-request`** · **D-05 `ait-speed-measurement`** (fora do MVP, rota registrada) | [UC-TEAT-001]…[004], [011], [013]             |
| `medidas`            | 040 `measure-start` · 041 `retention` · 042 `removal` · 043 `inventory` · 044 `transshipment` · 045 `measure-term` · 046 `measure-done` (D-02/D-03 guarda monitorada **fora do MVP**, rotas não registradas)                                                                                                                                                                                                      | [UC-TEAT-008], [UC-TEAT-009], [WF-TEAT-004]   |
| `alcoolemia`         | 050 `alcohol-start` · 051 `alcohol-device` · 052 `alcohol-result` · 053 `alcohol-refusal` · 054 `alcohol-signs` · 055 `alcohol-forward` · 056 `alcohol-links` · 057 `alcohol-term`                                                                                                                                                                                                                                | [UC-TEAT-007], [WF-TEAT-005]                  |
| `sinistro`           | 060–070 (`crash-*`, 11 telas) — **pertencem ao BOAT** ([APP-BOAT]); o TEAT só expõe o atalho e o vínculo `crash-ait-links`                                                                                                                                                                                                                                                                                        | [APP-BOAT]                                    |
| `sincronizacao`      | 080 `sync` · 081 `sync-item` · 082 `sync-conflict` · 083 `diagnostics` · 084 `support` · 085 `messages`                                                                                                                                                                                                                                                                                                           | [UC-TEAT-005]                                 |
| `complementares`     | C01 `approach-no-ait` · C02 `document-check` · C03 `special-inspection` · C04 `context-help` · C05 `local-settings`                                                                                                                                                                                                                                                                                               | MBFT                                          |
| chrome               | `BodycamIndicator` (não é tela)                                                                                                                                                                                                                                                                                                                                                                                   | [IU-TEAT-001] §C                              |

Total portado: 62 numeradas + 5 complementares + 2 novas (D-01, D-04) + 1 registrada e desligada
(D-05) + o boundary BOAT S-12 = **71 rotas**: 59 entradas não-BOAT, das quais 58 páginas TEAT
estão habilitadas e D-05 permanece desligada, mais 12 boundaries BOAT.

O módulo BOAT espelha o catálogo runtime de 114 chaves em `BOAT_PT_BR_CATALOG` e o mescla ao
loader mobile e ao provider web do TEAT. Os 13 marcadores
`source_pending:OD-R15-004` permanecem bloqueados como tradução e nunca são exibidos como texto.

### 4.1 Navegação (máquina de estados como rotas)

- As 576 transições da matriz viram `apps/teat/mobile/src/app/navigation/transitions.ts`
  (`{ from, action, to, condition?, type }`) e um teste que garante que toda transição tem rota
  de destino registrada e toda rota é alcançável.
- `__previous__` (retorno contextual) = `Location.back()` com pilha; nenhuma tela do fluxo de
  ato legal permite `back` após `ait-done` (o ato já está enfileirado).
- Guardas por segmento: `turno/*` só `authGuard`; `ait/*`, `medidas/*`, `alcoolemia/*` exigem
  `shiftGuard` + `readinessGuard`; `sincronizacao/*` só `authGuard`.

### 4.2 Deltas absorvidos ([IU-TEAT-001] §B)

| Tela                    | Delta implementado                                                                                                               |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `alcohol-result`        | `PairedValue` (medido / considerado) obrigatório; margem de tolerância vem da tabela metrológica do pacote                       |
| `alcohol-refusal`       | dois controles: `recusa` (gera 165-A) × `impossibilidade técnica` (não gera)                                                     |
| `alcohol-signs`         | checklist estruturado do Anexo II com exigência de conjunto; gera termo anexo (`alcohol-signs-term`)                             |
| `alcohol-forward`       | aviso fixo "finalizar o AIT não espera exame laboratorial"                                                                       |
| `alcohol-term`          | nove elementos estruturados ([RN-TEAT-136])                                                                                      |
| `ait-frame` / `-detail` | "sem abordagem" derivado do `approach_class` do enquadramento (Casos 1/2/3); justificativa só no Caso 3                          |
| `removal`               | guarda monitorada oferecida antes do reboque quando elegível — **desligada** (DT-015), rota preservada                           |
| `inventory`             | quatro campos do art. 14 §1º                                                                                                     |
| `measure-term`          | sete campos do caput; recusa de assinatura não invalida; prazo de retirada 60 dias (com o segundo prazo do CTB visível — OD-T05) |
| `ait-print`             | duas vias em tempo real, confirmação entre vias, reimpressão no dia sem duplicar; assinatura do agente exigida na via impressa   |

## 5. Web — módulos e inventário de telas

Doze módulos lazy em `apps/teat/web/src/app/features/`, rotas em português (autoridade:
`app-routing.module.ts` e `portal-navigation.ts` da origem), uma página por tela da matriz web
(`uxCode` em `data.uxCode`). Os "cadastros" genéricos gerados por blueprint da origem
(`*/cadastros/*`, 152 rotas CRUD) **não são portados como telas de produto**: viram páginas
administrativas de leitura sob `/administracao` e `/normativos`, com os mesmos guards
`permissionGuard('<recurso>:read')`.

| Módulo          | Rotas (tela — uxCode)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Papéis                                            |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `core`          | `/login` 001 · `/painel` 002 (`dashboard-home`) · `/acesso-negado` · `/conta`                                                                                                                                                                                                                                                                                                                                                                                                                                                       | todos                                             |
| `operacoes`     | `/operacoes` 005 · `/operacoes/:id` 006 · `/operacoes/painel` 003 · `/operacao/mapa` 004 · `/operacoes/turnos` 007 · `/operacoes/mensagens` 008                                                                                                                                                                                                                                                                                                                                                                                     | field, supervisor, admin                          |
| `fiscalizacao`  | `/fiscalizacao/aits` 020 (inbox) · `/fiscalizacao/aits/validacao` 021 · `/fiscalizacao/aits/saneamento` 022 · `/fiscalizacao/aits/rejeitados` 023 · `/fiscalizacao/aits/:id` 024 · `/fiscalizacao/aits/:id/sanear` 025 · `/fiscalizacao/aits/:id/rejeitar` 026 · `/fiscalizacao/aits/integracao` 027 · `/fiscalizacao/aits/:id/espelho` 028 · **`/fiscalizacao/aits/concorrencia`** (novo: apuração `SUSPEITO_CONCORRENCIA`) · **`/fiscalizacao/cancelamentos`** (novo: pedidos de cancelamento pós-finalização, D-04 lado decisor) | processing, authority, admin                      |
| `medidas`       | `/fiscalizacao/medidas` 040 · `/fiscalizacao/medidas/:id` 041 · `/fiscalizacao/medidas/remocoes` 042 · `/fiscalizacao/medidas/liberacao` 043                                                                                                                                                                                                                                                                                                                                                                                        | supervisor, processing, authority                 |
| `alcoolemia`    | `/fiscalizacao/alcoolemia` 050 · `/fiscalizacao/alcoolemia/etilometros` 051                                                                                                                                                                                                                                                                                                                                                                                                                                                         | supervisor, processing, authority                 |
| `evidencias`    | `/evidencias` 070 · `/evidencias/:id` 071 · `/evidencias/:id/custodia` 072 · `/evidencias/pacotes` 073 · **`/evidencias/acessos`** (requisições de acesso a bodycam, [RN-TEAT-142])                                                                                                                                                                                                                                                                                                                                                 | field, supervisor, processing, authority, auditor |
| `sincronizacao` | `/sincronizacao` (filas 121) · `/sincronizacao/conflitos` · `/sincronizacao/numeracao` (faixas e reservas) · `/sincronizacao/recibos`                                                                                                                                                                                                                                                                                                                                                                                               | supervisor, processing, technical-admin           |
| `auditoria`     | `/auditoria` 080 · `/auditoria/aits/:id` 081 · `/auditoria/agentes/:id` 082 · `/auditoria/consultas-externas` 083 · `/auditoria/anomalias` 084                                                                                                                                                                                                                                                                                                                                                                                      | auditor, authority, admins                        |
| `inteligencia`  | `/inteligencia/fiscalizacao` 090 · `/inteligencia/sinistros` 091 (BOAT) · `/inteligencia/qualidade` 092 · `/inteligencia/integracoes` 093                                                                                                                                                                                                                                                                                                                                                                                           | bi-analyst, authority, admins                     |
| `administracao` | `/administracao/orgaos` 100 · `/administracao/unidades` 101 · `/administracao/usuarios-agentes` 102 · `/administracao/perfis` 103 · `/administracao/dispositivos` 104 · `/administracao/competencias` 105 · `/administracao/homologacoes` · `/administracao/versoes` · `/administracao/campo/*` (equipes, viaturas, instrumentos)                                                                                                                                                                                                   | agency-admin, technical-admin                     |
| `normativos`    | `/normativos/catalogos` 110 · `/normativos/enquadramentos` 111 · `/normativos/regras` 112 · `/normativos/templates` 113 · `/normativos/pacotes-mobile` 114 · `/normativos/tabelas-metrologicas`                                                                                                                                                                                                                                                                                                                                     | authority, agency-admin, technical-admin          |
| `tecnico`       | `/tecnico/integracoes` 120 · `/tecnico/filas` 121 · `/tecnico/certificados` 122 · `/tecnico/jobs` 123 · `/tecnico/saude` 124                                                                                                                                                                                                                                                                                                                                                                                                        | integration-operator, technical-admin             |

Sinistros (060–063) pertencem ao BOAT web e não entram neste app.

## 6. Componentes

### 6.1 Núcleo mobile (`core/`)

| Componente                | Papel                                                                                                                          |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `FieldShell`              | shell de uma mão: barra inferior (5 destinos), cabeçalho com turno/unidade, `BodycamIndicator`, `OfflineQueueBadge`            |
| `ReadinessGate`           | executa `GET /v1/ops/mobile-bootstrap`, avalia `readiness.blockers[]` e roteia a `device-blocked`/`open-shift`/`home`          |
| `BootstrapStore`          | snapshot do bootstrap (contexto, catálogo, pacote normativo, reservas, capacidades) com `validUntil`; expira e reavalia        |
| `LocalActStore`           | agregados locais versionados e cifrados; cada finalização gera `SyncQueueItem` com `idempotency_key` e `content_hash` canônico |
| `SyncWorker`              | envia lotes (`device_batch_id`, `batch_sequence`), aplica recibos, abre conflitos; backoff; nunca reordena numeração           |
| `NormativePackageService` | instala e valida (`manifest_hash`) o pacote; expõe enquadramentos, regras, tabelas metrológicas, templates ao vivo offline     |
| `BodycamIndicator`        | estado `gravando` / `pausada (exceção)` / `falha`; registra falha em `diagnostics`                                             |

### 6.2 Compartilhados de domínio mobile (`shared/`)

| Componente           | Entradas / saídas                                                                                  | Regra                                          |
| -------------------- | -------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `PairedValue`        | `measured`, `considered`, `unit`, `basis`                                                          | par obrigatório ([RN-TEAT-133], [RN-TEAT-138]) |
| `ClosedEnumPicker`   | `options` do catálogo, `required`, `hint`                                                          | enum fechado, sem "outro" ([RN-TEAT-122])      |
| `ProposedValueField` | `proposed` (OCR/consulta), `confirmed`, `divergence`                                               | proposta a validar ([RN-TEAT-115])             |
| `OutcomeSelector`    | `signed` \| `refused` \| `impossible`, motivo por ramo                                             | três resultados distintos ([RN-TEAT-005])      |
| `EvidenceCapture`    | tipo (catálogo), câmera/galeria, hash local, `EvidenceLink(role)`                                  | hash antes de existir ([RN-TEAT-002])          |
| `SignatureCapture`   | assinatura em tela, testemunha opcional, geolocalização                                            | [UC-TEAT-004]                                  |
| `LocationField`      | GPS com precisão, endereço, km/sentido; edição manual marcada                                      | [UC-TEAT-001] p.5                              |
| `FramingPicker`      | busca por código/artigo no pacote; mostra `approach_class`, `required_fields`, medidas             | [RN-TEAT-108], [RN-TEAT-103]                   |
| `ValidationPanel`    | resultado das `validation_rules` do pacote (bloqueante × aviso)                                    | `ait-validations`                              |
| `PrinterDialog`      | seleciona impressora, imprime via 1 → confirma → via 2; reimpressão no dia                         | [RN-TEAT-116]                                  |
| `QueueItemCard`      | estado `pending → sent → received → applied` \| `conflict` \| `rejected`, código de erro           | [UC-TEAT-005]                                  |
| `ConflictResolver`   | cópia local × servidor; ações `manual_review`, `accept_server`, `reject`, `retry_after_correction` | supervisor; sem "device-wins" genérico         |
| `DeviceHandoffForm`  | motivo da falha, dispositivo substituto, confirmação                                               | D-01, [RN-TEAT-111]                            |
| `TermPreview`        | termo estruturado (medida, alcoolemia) com hash e assinatura                                       | [RN-TEAT-126], [RN-TEAT-136]                   |

### 6.3 Web (`shared/`)

`AitStateBadge`, `AitInbox` (fila com filtros por estado/unidade/agente), `AitDetail` (cabeçalho,
abas: dados, veículo, condutor, evidências, histórico, correções, impressões, integração),
`SanitizeForm` (campo alterado, valor anterior/novo, justificativa, limite da norma —
[RN-TEAT-006], [RN-TEAT-119]), `RejectDialog` (motivo, base legal, cancelamento ×
rejeição), `ConcurrencyReview` (registros do mesmo agente em dispositivos distintos, decisão
liberar/rejeitar), `CancelRequestDecision` (D-04: aprovar/negar com base legal, corpo decisor),
`EvidenceViewer` (metadados sempre; conteúdo de bodycam **só** por requisição aprovada),
`CustodyTimeline`, `ProbativePackageBuilder`, `NumberingRangeGrid` (faixas, reservas, consumo por
número), `ConflictQueue`, `ReceiptLookup` (por idempotency key), `NormativeCatalogEditor`,
`MobilePackagePublisher` (gerar → publicar → validar → retirar), `HomologationForm` (laudo,
publicação, notificação SENATRAN, renovação quadrienal), `DeviceGrid` (postura, tamper, versão),
`IntegrationQueue` (lotes/itens, retransmitir, resultado), `OperationMap` (Leaflet), `KpiTile`.

## 7. Jornadas por papel (resumo; detalhe em `teat-build-pack.md` WP-T4)

| Jornada                                                  | Rotas → ação → comando → efeito                                                                                                                                                                                                                                                                                                                                                                                        |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Agente — turno e AIT offline ([JRN-TEAT-001])            | `auth-login` → `auth-mfa` → bootstrap (`GET mobile-bootstrap`) → `shift-context` → `open-shift` (`POST mobile-bootstrap/shifts`) → `home` → `ait-start` … `ait-review` → **finalizar** (local; `content_hash`) → `ait-done` → `ait-print` → fila (`POST offline-sync/sync-batches`) → `sync` mostra `applied` + `receipt_protocol` → `close-shift` (`POST …/shifts/{id}/close` reconcilia numeração) → `shift-summary` |
| Agente — abordagem sem AIT / documental                  | `home` → `approach-no-ait` \| `document-check` → registro de abordagem (`ops/approaches`) → `home`                                                                                                                                                                                                                                                                                                                     |
| Agente — alcoolemia ([JRN-TEAT-003])                     | `alcohol-start` → `alcohol-device` (certificado vigente, senão bloqueia) → `alcohol-result` (par) \| `alcohol-refusal` (recusa → AIT 165-A) \| `alcohol-signs` (conjunto → termo) → `alcohol-forward` → `alcohol-links` → `alcohol-term` → fila (`alcohol-signs-term`, `ait`)                                                                                                                                          |
| Agente — retenção/remoção ([JRN-TEAT-004])               | `measure-start` → `retention` \| `removal` → `inventory` → `measure-term` → `measure-done` → fila (`administrative-measure`)                                                                                                                                                                                                                                                                                           |
| Agente — troca de dispositivo ([JRN-TEAT-006])           | `device-handoff` (D-01) → declaração de falha → novo dispositivo faz bootstrap → sessão anterior encerrada → turno recuperado; registros concorrentes ficam `SUSPEITO_CONCORRENCIA` na web                                                                                                                                                                                                                             |
| Supervisor — operação e numeração ([JRN-TEAT-002])       | web `/operacoes` → criar operação/equipe/viatura → `/sincronizacao/numeracao` → faixa (`ops/numbering-ranges`) → reserva por dispositivo → `/normativos/pacotes-mobile` publicar                                                                                                                                                                                                                                       |
| Operador — saneamento ([UC-TEAT-006])                    | `/fiscalizacao/aits/validacao` → `/aits/:id/sanear` → `request-correction` → correção → autoridade `approve-correction` → `accept`                                                                                                                                                                                                                                                                                     |
| Autoridade — aceite/rejeição/concorrência                | `/fiscalizacao/aits/validacao` → `accept` \| `reject` \| `/aits/concorrencia` liberar/rejeitar → `INTEGRADO` (evento `AIT_INTEGRADO` para a infração, ADR-0016)                                                                                                                                                                                                                                                        |
| Diretoria — cancelamento pós-finalização ([UC-TEAT-011]) | `/fiscalizacao/cancelamentos` → `review` → `decide` (aprovar → `CANCELADO_POSFINAL`, ato apenso; negar → estado de origem)                                                                                                                                                                                                                                                                                             |
| Admin — homologação e catálogo ([WF-TEAT-003])           | `/administracao/homologacoes` (renovar, cancelar por auditoria) → `/administracao/versoes` → `/normativos/catalogos` publicar/retirar → `/normativos/pacotes-mobile` gerar/publicar/validar                                                                                                                                                                                                                            |
| Auditor — custódia e bodycam ([RN-TEAT-142])             | `/evidencias/:id/custodia` → `/evidencias/acessos` (registrar → aprovar → entregar, mídia específica)                                                                                                                                                                                                                                                                                                                  |
| Operador de integração                                   | `/tecnico/integracoes` → `/tecnico/filas` → retransmitir lote/item → resultado                                                                                                                                                                                                                                                                                                                                         |

## 8. Formulários, validação e gates de transição

| Formulário / tela            | Campos obrigatórios                                                                       | Validação de forma                                                                | Gate (pré-estado → comando → pós-estado)                                                     |
| ---------------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `open-shift`                 | unidade, equipe, viatura, operação (opcional), localização                                | todos do catálogo do bootstrap                                                    | `canOpenShift` → `POST mobile-bootstrap/shifts` → `Shift.open`                               |
| `ait-vehicle`                | placa (proposta/consulta), confirmação visual, divergência                                | placa Mercosul/antiga; `visually_confirmed_by_agent`                              | —                                                                                            |
| `ait-driver`                 | condutor (consulta ou manual), `identified_by`, abordagem                                 | CPF/CNH válidos quando informados                                                 | —                                                                                            |
| `ait-frame`                  | enquadramento; justificativa só se `approach_class = caso_3`                              | `required_fields` do enquadramento; `requires_equipment` bloqueia sem instrumento | —                                                                                            |
| `ait-location`               | local, UF, município, GPS ou edição manual marcada                                        | precisão informada                                                                | —                                                                                            |
| `ait-evidence`               | tipo (catálogo), hash                                                                     | mandatory por enquadramento (ex.: placa em velocidade — [RN-TEAT-139])            | —                                                                                            |
| `ait-signature`              | resultado ∈ {assinado, recusa, impossibilidade}; motivo por ramo; testemunha opcional     | motivo obrigatório em recusa/impossibilidade                                      | —                                                                                            |
| `ait-review` → finalizar     | todas as validações bloqueantes verdes; número reservado; pacote válido                   | `ValidationPanel` sem bloqueante                                                  | `RASCUNHO_OFFLINE` → **ação explícita** → `FINALIZADO_LOCAL` → `ENFILEIRADO`                 |
| `ait-cancel-request` (D-04)  | justificativa, destinatário (`traffic-authority` \| `diretoria-fiscalizacao`), base legal | `origin_status` capturado                                                         | qualquer pós-finalização → item `ait-cancel-posfinal-request` → `SOLICITADO_CANCEL_POSFINAL` |
| `alcohol-device`             | etilômetro do catálogo com verificação vigente                                            | bloqueia sem certificado ([RN-TEAT-135])                                          | `TRIAGEM` → `ETILOMETRO_OFERECIDO`                                                           |
| `alcohol-result`             | medido, considerado (derivado da tabela), horário                                         | par; faixa 0,05/0,34 exibida                                                      | `TESTE_REALIZADO` → resultado                                                                |
| `alcohol-refusal`            | recusa × impossibilidade; descrição; testemunha                                           | ramos exclusivos                                                                  | recusa → `RECUSA_REGISTRADA`; impossibilidade → `OUTRO_MEIO_PROVA`                           |
| `measure-term`               | sete campos do caput + quatro do art. 14 §1º; prazos de retirada (dois, OD-T05)           | assinatura: assinado/recusa/impossibilidade                                       | `REMOVIDO`/`RETIDO` → termo emitido → `measure-done`                                         |
| `sync-conflict` (supervisor) | ação ∈ {`manual_review`,`accept_server`,`reject`,`retry_after_correction`}, descrição     | —                                                                                 | `open` → `POST sync-conflicts/{id}/resolve` → `resolved`/`rejected`                          |
| web `sanear`                 | campo, valor anterior/novo, justificativa                                                 | campo fora da lista de saneáveis bloqueado ([RN-TEAT-119])                        | `VALIDANDO`/`REJEITADO` → `request-correction` → `PENDENTE_CORRECAO`                         |
| web `rejeitar`               | motivo, base legal, `cancelled?`                                                          | —                                                                                 | `RECEBIDO`/`VALIDANDO`/`PENDENTE_CORRECAO` → `reject` → `REJEITADO`/`CANCELADO`              |
| web `concorrencia`           | decisão liberar/rejeitar, fundamento                                                      | —                                                                                 | `SUSPEITO_CONCORRENCIA` → `RECEBIDO` \| `REJEITADO`                                          |
| web `cancelamentos`          | decisão, nota, corpo decisor, base legal                                                  | só `diretoria-fiscalizacao` (papel OD-T01)                                        | `requested` → `review` → `decide` → `CANCELADO_POSFINAL` \| estado de origem                 |
| web `homologação`            | laudo (data, emissor independente), publicação, notificação SENATRAN, documento           | renovação quadrienal calculada                                                    | `HOMOLOGADO` → `renew` \| `cancel-by-audit`                                                  |
| web `pacote mobile`          | catálogo ativo, versão, validade                                                          | catálogo `ATIVO_CAT`                                                              | `RASCUNHO_PKG` → `publish` → `PUBLICADO_PKG` → `validate`/`retire`                           |

Erros de forma inline em pt-BR; erros de negócio vêm do backend no envelope `StynxError` com
códigos de `teat-error-catalog.md`; no mobile, erros de sincronização ficam no item da fila
(`error_code`, `error_message`) e nunca bloqueiam a próxima lavratura.

## 9. Dados, sincronização e tempo real

- **Bootstrap**: `GET /v1/ops/mobile-bootstrap?device_id&installation_id&app_version&protocol_version`
  devolve contexto (agente, dispositivo homologado, turno ativo, sessão exclusiva), catálogo
  (unidades, equipes, viaturas, operações, instrumentos), pacote normativo (id, versão,
  `manifest_hash`, `contentPath`), reservas de numeração e `readiness.blockers[]`; `validUntil`
  obriga reavaliação; `readiness.warnings[]` (ex.: `NORMATIVE_PACKAGE_EXPIRED`, E.29) não bloqueia.
- **Pacote normativo**: `GET /v1/inf/normative/mobile-packages/sync-metadata` lista os pacotes
  publicados e não expirados; `GET …/{id}/content` baixa o conteúdo assinado; validação local por
  `manifest_hash`.
- **Fila**: `SubmitSyncBatchDto` (`device_batch_id`, `batch_sequence`, `items[]{entity_type,
local_entity_id, idempotency_key, payload_hash, payload_json}`); recibos `received` →
  `applied` por item; recuperação por `GET offline-sync/receipts/{tenantId}/by-idempotency/{key}`.
- **Evidência**: intenção (`upload-intents`) → `PUT` no storage por URL assinada → `complete-upload`
  com hash aceito; ordem estrita depois do AIT `applied`.
- **Web tempo real**: SSE `/v1/ops/stream` (eventos `ait.changed`, `sync.batch.received`,
  `sync.conflict.opened`, `device.posture-changed`, `integration.item.changed`) com fallback de
  polling de 15 s; contrato em `teat-route-contract.md` §7.
- **Consultas nacionais** (veículo/condutor): `POST /v1/ops/snapshots/external-queries` → adapter;
  o app recebe o snapshot congelado e o `divergence_recorded`.

## 10. Estrutura de pastas

Estado entregue no candidato R-0013 (não uma árvore planejada): os clientes dos apps são adapters
`HttpClient` manuscritos — mobile em `data/api/*.client.ts` e web em `data/*.client.ts` — que
aplicam os contratos do backend unificado. Eles não são clientes gerados. O mobile também entrega
`core/`, `data/local/`, `data/normative/`, `data/sync/`, `navigation/`, `features/`, `shared/` e
`i18n/`; o web entrega `core/`, `data/`, `features/`, `shared/` e `i18n/`.

O bloco abaixo é o layout histórico de planejamento; não descreve paths nem clients do candidato
entregue.

```text
apps/teat/mobile/src/app/{core,data/{api,local,normative,sync},features,navigation,shared,i18n}
apps/teat/web/src/app/{core/{error-boundary},data,features,shared,i18n}
```

## 11. Dependências de backend e estado de entrega R-0013

ADR-0033 redefine o aceite dos frontends de R-0013 como **homologação de UI e
workflows**. Fluxos positivos com fixtures devem ser explícitos, sintéticos e
segregados; não comprovam autoridade para ato real. App Android de produção,
segredos/chaves, port de localização, validador AIT, ciclo de sincronização e
prova no GMS820 (modelo já homologado como equipamento) pertencem a round
posterior dedicado, R-0017 apenas candidato; issues
[#108](https://github.com/aarusso-nyx/detran/issues/108)–[#112](https://github.com/aarusso-nyx/detran/issues/112).

As superfícies de AIT, bootstrap/turno, numeração/sincronização, evidência, pacote normativo e
provisionamento foram entregues nos CTGs precedentes; CTG-0003 foi mesclado pela PR #82. Mobile e
web usam adapters `HttpClient` manuscritos, respectivamente em `data/api/*.client.ts` e
`data/*.client.ts`, para aplicar os contratos do backend unificado. Os PASS anteriores de CTG-0004a e
CTG-0004b não cobrem a adenda e permanecem candidatos sem merge, publicação ou deploy. KMS, Keystore,
criptografia/envelope/attestation de produção, bodycam real, adapters de hardware (inclusive
impressora) e serviços nacionais continuam fora do escopo comprovado por fixtures/ports; lacunas
de produto permanecem `source_pending` ou nas ODs já registradas.

## 12. Testes e critérios de pronto

Ver `rait-test-strategy.md` (vale para o TEAT) e `teat-build-pack.md`: matriz das 576 transições,
matriz de estados do AIT (`WF-TEAT-001`), reserva (`WF-TEAT-002`), pacote (`WF-TEAT-003`), medida
(`WF-TEAT-004`), alcoolemia (`WF-TEAT-005`); testes de sincronização com perda de ACK, retry,
lote parcial, conflito; testes de impressão com `FixturePrinter`; a11y de campo (alvo 48 dp,
contraste).
