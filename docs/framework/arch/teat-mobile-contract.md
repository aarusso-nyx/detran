---
id: ARCH-TEAT-MOBILE-CONTRACT
title: Contrato executável do aplicativo móvel TEAT
status: draft
apps: [teat]
updated: 2026-09-24
---

# Contrato executável do aplicativo móvel TEAT

Papel: Architect.

Este contrato é a fronteira para os workers de implementação. Ele não cria regra
de produto: transpõe a matriz de paridade, as folhas IU, o catálogo de parâmetros,
o contrato de rota e o contrato de provisionamento fechados nesta rodada.

## Adenda de escopo R-0013 — homologação de UI/workflows (ADR-0033)

As cláusulas abaixo prevalecem sobre qualquer positivo anterior de finalização
produtiva neste documento. R-0013 não entrega app de campo. O perfil produtivo
continua fail-closed sem E2, localização real, validador agregado e serviços
institucionais; o futuro round dedicado está nas issues #108–#112. Não reduzir
71 rotas, 576 transições, RBAC, acessibilidade, estados ou os gates integrais.

O token opcional `TEAT_HOMOLOGATION_AIT` é **ausente por padrão** e sua interface
fechada é `HomologationAitPort { profile: 'homologation'; start(input?,
context?): Promise<{kind:'demonstrated';localEntityId:string}>;
review(input?,context?): Promise<{kind:'demonstrated';localEntityId:string}> }`.
Somente a composição explícita da build de homologação pode instalá-lo; nenhuma
claim, query string, rota ou dado remoto ativa esse modo. O port guarda somente
um cenário sintético segregado, não usa clientes HTTP, `LocalActStore` produtivo,
`SyncWorker`, `PrinterDialog`, numeração ou assinatura oficiais. `ait-start` e
`ait-review` oferecem ações DOM reais: com esse port, usam `MobilePageRuntime` e
exibem `data-profile="homologation"`, marcador visível `HOMOLOGAÇÃO — SIMULAÇÃO`
e `data-state="demonstrated"` na conclusão demonstrativa. Sem o port, exibem
bloqueio quando as provas produtivas faltam; nenhum draft/queue parcial é criado.
Erro/rejeição do port produz estado de erro, nunca sucesso. A palavra
`demonstrated` não é `persisted`, `finalized` ou recibo jurídico.

O build padrão de R-0013 usa `src/main.homologation.ts` por configuração Angular
explícita; `src/main.ts` continua sem o port e representa o caminho comum
fail-closed para a futura composição produtiva. A entrada de homologação aplica
`homologationHttpBlockInterceptor`, que permite apenas asset local e rejeita
todo HTTP de backend/remoto; seu IndexedDB usa nome separado. Essa entrada não
instala o OIDC produtivo: sessão e tenant de demonstração são sintéticos,
somente em memória, e não leem auth storage nem redirecionam ao IdP. Um
`TEAT_GUARD_CONTEXT` sintético explícito permite navegar as jornadas de UI com
os guardas reais, inclusive negação quando o papel é omitido; seus dados não
constituem grant, turno, numeração ou homologação operacional do dispositivo.
O perfil oferece seletor visível de persona sintética em memória para acessar
rotas de cada papel canônico; a seleção nunca muda claims OIDC, não persiste
identidade e só afeta o contexto demonstrativo. O mesmo `roleGuard` continua
negando qualquer papel ausente da rota, inclusive antes da seleção.
A presença do port deve ser visível também no `AppComponent`, não apenas nas páginas AIT.

### Correção de alcançabilidade de workflows na homologação

O mero import das 576 transições e a renderização de shells não demonstram um
workflow. A UI homologada deve ligar ações DOM ao `dispatchTransition` do
manifesto, sem alterar `from/action/to/condition/type/notes`. Condição textual
não é automaticamente verdadeira: uma aresta condicionada só pode disparar
depois de um fato sintético explícito e observável na UI; negação mantém a rota
e mostra erro. A navegação não persiste ou sincroniza ato oficial.

Na cadeia AIT `ait-start → ait-vehicle → ait-driver → ait-frame →
ait-frame-detail → ait-location → ait-notes → ait-validations → ait-evidence →
ait-measures → ait-signature → ait-review → ait-done`, cada `Continuar` só ocorre
após validação da etapa demonstrativa. Os sete schemas AIT existentes
(`vehicle`, `driver`, `frame`, `location`, `evidence`, `signature`, `review`)
validam entradas DOM reais; as quatro etapas sem schema exigem confirmação
explícita, e `ait-validations` expõe as pendências antes da revisão. `ait-start`
recebe escolha expressa de abordagem; `ait-review` mostra resumo/hash do cenário
e exige ação final explícita, sem `submit(undefined)`. O port de homologação
mantém somente um agregado em memória, marca valor/número/assinatura como
sintéticos, bloqueia avanço/review se etapa obrigatória faltar ou schema falhar,
e só então devolve `demonstrated` e navega à tela final. O perfil comum conserva
seu bloqueio produtivo e nunca recebe esse agregado.

`sync`, `sync-item` e `sync-conflict` precisam de cenário offline demonstrativo
segregado: fila, falha, retry e conflito visíveis por controles DOM, sem invocar
`SyncWorker`, `OfflineSyncClient` ou endpoint. O cenário nunca reclassifica um
item sintético como recibo oficial. Inspector cobre por RouterOutlet o caminho
positivo, erros/condições negadas, RBAC e ausência de HTTP/store/print oficiais.

O perfil também oferece `TEAT_MOBILE_HOMOLOGATION_SHIFT`, estado **somente em
memória** com fases `pre-shift` (turno/sessão `null/null`, sem reserva nem direito
offline) e `open` (turno sintético aberto). Login e MFA usam formulários e
credenciais declaradamente sintéticos, sem IdP, storage de autenticação ou
`AuthBootstrapCoordinator`; o MFA demonstrativo conduz ao pré-turno. O formulário
de abertura validado muda a fase pelo port e conduz a `/home`, sem chamar
`MobileBootstrapClient.openShift`. As rotas B de pré-turno e B+S operacional
continuam sujeitas aos guardas reais; mudar a fase não concede autoridade de
campo. Um port ausente mantém o caminho produtivo inalterado. Os controles
visíveis, inclusive as 97 ações únicas da matriz, são traduzidos pelo
`TeatI18n` injetado a partir do catálogo canônico; o índice de transição
preserva ramos homônimos sem inventar condição positiva.

Inspector deve reescrever os três oráculos legados que exigiam `persisted` e
`finalized` produtivos sem validador para positivar **somente** o port explícito,
e acrescentar negativos de ausência do port e ausência de efeitos oficiais.
Os três REDs de `ait-start` continuam negativos de autenticação/autoridade/fonte
de localização no perfil produtivo, agora com botão DOM obrigatório. Nenhum
teste é pulado, convertido em `todo` ou enfraquecido sem caso negativo substituto.

## 1. Invariantes de runtime

- O cliente de dados é exclusivamente o backend unificado: `MobileBootstrapClient`,
  `OpsSnapshotsClient`, `OfflineSyncClient`, `AitClient`, `MeasuresClient`,
  `AlcoholClient`, `NormativeClient` e `ProvisioningClient`; toda consulta nacional
  chega como snapshot de `OpsSnapshotsClient`, portanto passa pelo
  `packages/senatran-adapter` no backend. O aplicativo não contém URL nem base
  nacional.
- Todo texto visível usa somente os namespaces `teat.shell`, `teat.common`,
  `teat.states`, `teat.errors`, `teat.screens`, `teat.forms`, `teat.legal`,
  `teat.sync`, `teat.readiness`, `teat.navigation`, `teat.a11y` e
  `teat.provisioning` do catálogo `i18n/teat.pt-BR.json` (OD-P46).
- O bootstrap raiz usa `provideDetranAuthenticatedApp`, `provideHttpClient` e
  `provideRouter`; a sessão, tenancy e i18n são as implementações STYNX 1.3.1,
  não providers locais equivalentes. Configuração OIDC/tenant ausente ou inválida,
  sessão inativa, claims sem papéis canônicos ou bootstrap remoto ausente negam o
  fluxo. Um único `BootstrapStore` root-scoped atende toda a aplicação; providers
  por rota que recriem ou esvaziem esse estado são proibidos.
- Ordem imutável de guardas: `authGuard`, `tenantGuard`, `roleGuard`,
  `readinessGuard` quando a rota exige bootstrap, depois `shiftGuard` quando
  exige turno. `readinessGuard` verifica sessão exclusiva e postura/homologação
  antes do pacote normativo e da reserva de numeração quando o destino cria ato
  legal. A homologação expirada é `warn-and-record` (H.55), não bloqueio; pacote
  ausente bloqueia. Nenhum prazo legal ou decisão de mérito é calculado no cliente.
- `traffic-authority` é a autoridade canônica de H.39. `decision_body` é dado
  recebido, nunca uma substituição de papel calculada pelo cliente. Defaults H.54
  são vigentes; `sync.concurrency_window_minutes` permanece `source_pending`.
- D-05 é rota registrada com `featureEnabled: false`; publica estado técnico
  `unavailable` e não carrega feature. As onze rotas `crash-*` são pontos de extensão BOAT: têm
  rota e contrato de paridade, mas sua feature é resolvida pelo BOAT quando
  instalado.
- Para `sync-conflict`, `ARCH-TEAT-FRONTENDS` §3 e §8 prevalece sobre a folha
  `IU-TEAT-sync-conflict.md`: somente `field-supervisor` pode resolver conflito.
  A permissão adicional do `field-agent` na folha é inconsistência de fonte
  registrada como `OD-TEAT-MOBILE-SYNC-CONFLICT-ROLE`; ela não amplia RBAC.

### 1.1 Contratos comportamentais fail-closed

Estes são requisitos de execução, não meras existências de arquivo. Cada caso é
uma prova independente obrigatória ao Inspector; ausência de estado, adapter,
porta, resposta ou chave canônica nega a ação e não pode retornar sucesso fictício.

1. **Entrada, bootstrap, guardas e contexto.** `/auth-login` é a única entrada sem
   guarda TEAT: ela delega o início da sessão ao provider OIDC STYNX e não tenta
   ler bootstrap antes da autenticação. `/auth-mfa` é continuação controlada pela
   sessão STYNX ainda não ativa e também não exige `TEAT_GUARD_CONTEXT` pronto.
   Depois de `StynxSessionService.active() === true`, o coordenador root observa
   sessão, tenancy e `MobileStynxSessionPort.currentSession()`, chama
   `BootstrapStore.refresh(...)` e `ProvisioningClient.readiness(deviceId)`, e só
   então encaminha para `shift-context`, `device-blocked` ou `home`. Qualquer
   ausência/rejeição mantém estado `blocked`; não existe snapshot inicial vazio
   promovido a sucesso. Os cinco `CanMatchFn` das rotas protegidas são:
   `authGuard` exige principal STYNX autenticado; `tenantGuard`, contexto de tenant;
   `roleGuard`, o resultado do oráculo da seção 6; `readinessGuard`, um snapshot
   válido de readiness; e `shiftGuard`, turno aberto. Cada um devolve negação sem
   estado verificável, inclusive principal ausente, tenant ausente, papel omitido,
   bootstrap ausente/expirado, blocker presente ou turno não aberto. Os papéis e
   o tenant vêm exclusivamente da sessão STYNX autenticada: papéis são a união
   canônica das claims `cognito:groups` e `roles`, e o tenant é o contexto resolvido
   pelo provider STYNX de tenancy. O bootstrap operacional não inventa papel,
   principal ou tenant, e `[]` não é substituto de claims ausentes. A sequência
   nunca é abreviada e `roleGuard` chama o oráculo cartesiano efetivo, não cópia ou
   helper isolado. O token root expõe accessors/signals e cada invocação do guarda
   lê o valor atual; uma factory que captura uma fotografia na criação do injector
   é proibida.
   O callback OIDC é exatamente `/auth-mfa`, o mesmo path configurado em
   `redirectUrl`; `/auth-login` é somente a tela que dispara
   `StynxSessionService.login()` por evento real de UI. O evento de inicialização
   de `/auth-mfa` aguarda `completeLogin(window.location.href)` resolver e somente
   então chama `AuthBootstrapCoordinator.start()`: chamadas concorrentes ou
   bootstrap iniciado antes do callback são proibidos. O coordenador observa o
   signal de sessão durante toda a vida do injector; transição de ativo para
   inativo limpa o store automaticamente, sem exigir chamada manual da página.
   Ao concluir, navega para `home` somente com bootstrap `ready` e turno aberto,
   para `shift-context` quando `ready` sem turno aberto e para `device-blocked`
   quando o estado é `blocked`; navegação não ocorre enquanto `loading`.
2. **Adapters de backend.** Os oito clients são adapters tipados sobre `HttpClient`
   ou cliente gerado para o backend unificado e só constroem rotas `/v1/inf/*` e
   `/v1/ops/*` do contrato de rotas. Comandos POST preservam `Idempotency-Key`;
   precondições preservam `If-Match`; resposta, status e código `StynxError` são
   retornados ao chamador sem `catch` que os converta em sucesso. Nenhum adapter
   chama sistema nacional, URL nacional, mock nem dados locais como resposta remota.
3. **Persistência e sincronização.** `LocalActStore` usa
   `MobileEncryptedStorePort` e persiste por agregado `draft`, `queue`, `evidence`,
   `reservation`, `package` e `print-receipt`. Toda escrita local é durável e
   versionada; atos sincronizáveis recebem `idempotency_key`, `payload_hash` e
   item `SyncQueueItem`. No AIT, telas de preenchimento persistem `draft` e
   `evidence` sem item de fila elegível à sincronização; somente a finalização
   explícita e validada em `ait-review` cria o único item AIT `pending` completo.
   Armazenamento em memória/planilha/`localStorage` simples é proibido.
   `SyncWorker` lê somente a fila e o cursor persistidos, submete
   `SubmitSyncBatchDto` com `device_batch_id`, `batch_sequence` e os itens
   contratuais, grava o recibo por item (`received` →
   `applied`) e recupera por idempotência. Falha fica no item com código canônico;
   jamais apaga ato, duplica comando ou bloqueia nova lavratura por si só. O
   construtor de produção aceita somente `MobileEncryptedStorePort`; adapter
   legado, porta key-value simples, cursor opcional ou fallback de receipt/cursor
   em memória são proibidos.
   A primeira execução sem cursor cria e persiste `{ deviceBatchId:
MobileIdPort.uuid('sync-batch'), batchSequence: 1 }` antes do POST. Rede,
   rejeição ou resposta inválida preservam esse cursor para retry idêntico; apenas
   uma resposta 200 cujos receipts foram persistidos avança sequência e batch.
   Recovery converte o receipt wire snake_case para o modelo local e somente
   `StynxError` com `status === 404` e código
   `TEAT.SYNC_RECEIPT_NOT_FOUND` significa ausência; qualquer outro 404/código ou
   erro propaga sem fallback local silencioso.
4. **Pacote normativo.** `NormativePackageService` baixa apenas metadata/conteúdo
   do backend, valida o conteúdo pelo `manifest_hash` e só torna o pacote utilizável
   depois de persistido cifradamente. Pacote ausente, hash divergente ou conteúdo
   não verificável produz blocker; pacote expirado produz warning registrado e não
   bloqueia (H.55). `validUntil` exige nova avaliação; não há valor default para
   `source_pending` nem cálculo de prazo legal local.
5. **Telas, módulos e i18n.** Os oito módulos lazy possuem e exportam suas próprias
   rotas, sem importar, filtrar ou fechar ciclo com `app.routes.ts`; a raiz os
   importa somente por `loadChildren`. Cada rota habilitada instancia o componente
   daquela linha, nunca um alias ou placeholder comum. Cada uma das 58 páginas TEAT
   habilitadas não-BOAT executa sua leitura/ação aplicável através de referências ao objeto de
   schema e à instância real do client/store, nunca seus nomes em `string`.
   Páginas cuja ação permanece `source_pending` exibem estado bloqueado e não
   chamam adapter; esse comportamento explícito é preferível a fabricar endpoint.
   Metadata genérica, título e status sem integração executável não constituem
   página. D-05 não carrega sua página; as onze entradas BOAT são boundaries, não
   páginas TEAT.
   Todo texto visível, inclusive fallback, erro e estado indisponível,
   passa pelo runtime STYNX de i18n com as chaves permitidas da seção 1; texto
   literal no template ou componente falha. O catálogo é carregado em runtime, não
   somente copiado para o app. `TeatI18n` é injetado e delega ao runtime STYNX;
   `new TeatI18n()`, catálogo local como runtime ou objeto tradutor ad hoc falham.
   `load` e `submit` são acionados por `ngOnInit`/evento do template, mantêm estado
   observável `idle | loading | loaded | submitting | persisted | blocked | error`
   e apresentam exclusivamente chaves traduzidas pelo `TeatI18n` STYNX. Construir
   o binding não conta como leitura nem ação. Operação local recebe contexto
   completo de sessão, pacote normativo, reserva, identidade, idempotência, versão,
   relógio e hash; se a folha não fecha qualquer desses valores, a ação devolve
   `blocked/source_pending` antes de escrever. Payload genérico com identidade vazia
   ou `source_pending` persistido como fato é proibido.
6. **FieldShell e falhas.** `FieldShell` é a única ErrorBoundary da aplicação e
   compartilha um estado root com o `ErrorHandler` Angular e o handler de erro do
   Router; logo `capture` é chamado por exceções reais de componente, ação e
   navegação, não somente por teste direto. Ela
   captura erro de rota/ação, preserva somente código, status e contexto de tokens,
   classifica `StynxError` pelo catálogo TEAT e mostra a chave canônica de erro. Erro
   de formulário fica inline; blocker de postura/sessão abre o fluxo de dispositivo;
   erro de fila fica no `QueueItemCard`; erro desconhecido é `TEAT.INTERNAL`. A
   ocorrência é registrada no estado diagnóstico local sem segredo ou payload de
   ato. A boundary não pode relançar silenciosamente, apresentar texto literal nem
   transformar erro em êxito.
7. **Readiness.** O único decisor é `ReadinessGateService`, que deriva `allowed`, `blockers`, `warnings`
   e `validUntil` da resposta tipada de bootstrap/provisionamento: sessão exclusiva,
   postura/autorização do dispositivo, homologação, pacote, reserva de numeração e
   turno. A rota legal só abre se não houver blocker e todos os requisitos do seu
   destino estiverem presentes; warnings são exibidos e registrados. A decisão de
   homologação expirada mantém o ato possível, mas não mascara bloqueadores reais.
   A entrada é o tipo fechado da resposta bootstrap/provisionamento, nunca
   `Record<string, boolean | string>`; campo obrigatório ausente ou malformado
   bloqueia. Todo warning retornado é persistido no diagnóstico antes de permitir.
   `readinessGuard` somente monta `ReadinessInput` a partir do contexto atual e
   devolve a decisão desse serviço; repetir um subconjunto das condições no guarda
   é proibido.
   `bootstrap.snapshot.validUntil` é a validade do próprio snapshot: data ausente,
   inválida ou `now >= validUntil` adiciona `bootstrap-snapshot-expired` aos
   blockers, independentemente da validade do pacote normativo. O warning E.29 do
   pacote expirado continua não bloqueante (ADR-0031); H.55 trata da homologação
   do software. O provider root de
   `ReadinessWarningSink` grava cada warning uma vez no mesmo estado diagnóstico
   sanitizado da ErrorBoundary; factory no-op é proibida.
8. **Transições.** Além da igualdade content-addressed da seção 4, o executor
   despacha cada transição pelo par `from`/`action`, exige condição satisfeita e
   navega ao `to` registrado. Somente `__previous__` chama `Location.back()`;
   depois de `ait-done`, a ação de retorno não pode reabrir edição do ato. Como a
   fonte não define um destino seguro substituto, esse caso `__previous__` só usa
   histórico quando o executor prova que o destino anterior não é tela editável;
   sem essa prova, nega fail-closed e sinaliza `source_pending`, sem alterar a matriz.
   Destino,
   ação ou condição ausente nega a navegação.
9. **Forms, impressora e bodycam.** Os 14 schemas executam todas as proibições e
   validações da seção 3 antes de chamar client; prova negativa deve demonstrar que
   payload inválido não produz comando. A porta de produção de impressão usa
   a `MobilePrinterPort` real de `@stynx-nyx/mobile-runtime`, registra sucesso/falha
   em `print-events` com `If-Match` e `Idempotency-Key` fornecidos pelo caller, sem duplicar AIT e
   preserva o mesmo número na reimpressão controlada. `BodycamIndicator` é chrome
   global em serviço operacional com estados gravando, pausa excepcional e falha;
   conteúdo de bodycam não é exposto pelo app sem o fluxo de custódia autorizado.
   `FixturePrinter` e doubles são somente adapters de teste, nunca runtime. O
   estado de bodycam vem de um adapter operacional observável; ausência do adapter
   produz `failure`, nunca um estado fixo usado como implementação.
10. **D-05 e BOAT.** D-05 permanece rota registrada e disabled: a tentativa
    publica estado técnico de indisponibilidade, não carrega feature nem envia comando. Cada
    `crash-*` é resolvido pela extensão BOAT; sem extensão instalada o atalho não
    aparece e navegação direta nega/faz fallback explícito, nunca renderiza
    placeholder TEAT. A fonte não fornece a chave i18n do fallback/indisponibilidade;
    essa chave permanece `source_pending`, mas não autoriza texto literal.
    A entrada D-05 possui zero `loadComponent`, zero `loadChildren`, zero resolver
    de feature e zero client; sua tentativa de navegação publica apenas estado
    técnico `unavailable` e é cancelada fail-closed, preservando a URL segura
    anterior. O mesmo vale para BOAT ausente ou cujo `load` rejeite: não há redirect
    para D-05, `TEAT.INTERNAL`, texto genérico, componente local ou `UrlTree`
    inventado. Em carga direta sem URL anterior segura, o fluxo retorna à entrada
    autenticada já configurada, sem afirmar mensagem de indisponibilidade. Até a
    chave acessível ser aprovada, o estado técnico é verificável, mas apresentação
    acessível continua explicitamente bloqueada.

### 1.2 Assinaturas públicas e fixtures de prova

As assinaturas nesta seção pertencem aos arquivos da allowlist §5.1. São a API
pública mínima que Inspector e Engineer compartilham; os tipos de payload marcados
`DTO` são os DTOs já nomeados no contrato de rotas, sem cast, `any` ou campo novo.

#### BootstrapStore, contexto e guardas

```ts
type MobileBootstrapQuery = Readonly<{
  device_id: string;
  installation_id?: string;
  app_version: string;
  protocol_version?: string;
}>;
type BootstrapSnapshot = Readonly<{
  protocolVersion: string;
  requestedProtocolVersion: string;
  snapshot: Readonly<{
    capturedAt: string;
    validUntil: string | null;
    maxAgeSeconds: number | null;
    authority: unknown;
  }>;
  context: Readonly<{
    tenantId: string;
    trafficAgencyId: string;
    agent: Readonly<{ id: string; operationalUnitId: string; status: string }>;
    device: Readonly<{
      id: string;
      status: string;
      homologated: boolean;
      tamperDetected: boolean;
      appVersion: string;
    }>;
    activeShift: Readonly<{ id: string; status: string }> | null;
    session: Readonly<{
      id: string;
      startedAt: string;
      exclusive: boolean;
    }> | null;
  }>;
  catalog: Readonly<{
    operationalUnits: readonly unknown[];
    teams: readonly unknown[];
    patrolVehicles: readonly unknown[];
    operations: readonly unknown[];
    measurementInstruments: readonly unknown[];
  }>;
  normativePackage: Readonly<{
    id: string;
    catalogId: string;
    version: string;
    manifestHash: string;
    status: string;
    publishedAt: string;
    validUntil: string;
  }>;
  numberingReservations: readonly unknown[];
  readiness: Readonly<{
    preShiftReady: boolean;
    offlineReady: boolean;
    blockers: readonly string[];
  }>;
  capabilities: Readonly<{
    canOpenShift: boolean;
    canOperateOffline: boolean;
    canReserveNumbering: boolean;
  }>;
}>;
type ProvisioningReadinessResponse = Readonly<{
  device_id: string;
  ready: boolean;
  remaining_acts: number;
  remaining_numbering_count: number;
  blockers: readonly Readonly<{ code: string; resource: string }>[];
  evaluated_at: string;
}>;
type ReadinessInput = Readonly<{
  bootstrap: BootstrapSnapshot | undefined;
  provisioning: ProvisioningReadinessResponse | undefined;
  now: string;
}>;
type ReadinessResult = Readonly<{
  allowed: boolean;
  blockers: readonly string[];
  warnings: readonly string[];
  validUntil?: string;
}>;
type BootstrapState =
  | Readonly<{ status: 'anonymous' }>
  | Readonly<{ status: 'loading'; query: MobileBootstrapQuery }>
  | Readonly<{
      status: 'ready';
      bootstrap: BootstrapSnapshot;
      provisioning: ProvisioningReadinessResponse;
    }>
  | Readonly<{ status: 'blocked'; code: string }>;

interface BootstrapStore {
  readonly state: Signal<BootstrapState>;
  snapshot(): BootstrapSnapshot | undefined;
  provisioningSnapshot(): ProvisioningReadinessResponse | undefined;
  refresh(input: MobileBootstrapQuery): Promise<
    Readonly<{
      bootstrap: BootstrapSnapshot;
      provisioning: ProvisioningReadinessResponse;
    }>
  >;
  clear(): void;
}
interface ReadinessGateService {
  evaluate(input: ReadinessInput): ReadinessResult;
}
interface ReadinessWarningSink {
  record(code: string): void;
}
export const TEAT_READINESS_WARNING_SINK: InjectionToken<ReadinessWarningSink>;

interface GuardContext {
  principal(): Principal | undefined;
  tenantId(): string | undefined;
  allowedRoles(): readonly DetranRole[];
  bootstrap(): BootstrapSnapshot | undefined;
  provisioning(): ProvisioningReadinessResponse | undefined;
}
export const TEAT_GUARD_CONTEXT: InjectionToken<GuardContext>;

interface AuthBootstrapCoordinator {
  readonly state: Signal<BootstrapState>;
  start(): Promise<BootstrapState>;
  clearOnSessionEnd(): void;
}
```

`context.activeShift` e `context.session` são chaves wire obrigatórias e
formam um par. Antes da abertura do turno, ambas valem `null`; durante o turno,
ambas são objetos vinculados ao mesmo turno. Omissão ou par misto é inválido e
o bootstrap deve falhar fechado antes de publicar estado operacional ou
instalar reserva local.

`authGuard` injeta a sessão STYNX e lê `principal()`; `tenantGuard` lê `tenantId()`;
`roleGuard` lê `principal().roles` e `allowedRoles()`; `readinessGuard` lê
`bootstrap()`, `provisioning()`, `blockers` e `validUntil`; `shiftGuard` lê
`bootstrap.context.activeShift`. `TEAT_GUARD_CONTEXT` é exportado por
`core/bootstrap.store.ts` como `InjectionToken<GuardContext>` e cada um dos cinco
`CanMatchFn` o lê com `inject(TEAT_GUARD_CONTEXT)`. Cada guarda retorna
`boolean | UrlTree`: `true` somente quando sua própria prova é positiva; ausência
de fixture/estado devolve `false` ou `UrlTree` de negação. Nenhum guarda consulta
`localStorage`, assume `true` ou recupera estado de outro guarda.

Em produção, a factory root de `TEAT_GUARD_CONTEXT` injeta
`StynxSessionService`, `TenantContextService` e o singleton `BootstrapStore`, mas
seus accessors fecham sobre os serviços/signals, não sobre valores capturados na
criação do injector. `principal()` existe somente
quando `StynxSessionService.active()` é verdadeiro; seus `roles` são a interseção
ordenada da união `state().claims['cognito:groups']` +
`state().claims['roles']` com `TEAT_STAFF_ROLES`. `tenantId` vem do contexto de
tenancy STYNX configurado no bootstrap e precisa coincidir com
`bootstrap.context.tenantId`; ausência ou divergência devolve contexto negado.
`bootstrap.context.agent.id` identifica o agente operacional, mas não cria
principal nem papel. A factory não tem defaults de identidade.

`AuthBootstrapCoordinator.start()` exige sessão STYNX ativa e obtém
`deviceId`, `appVersion`, `agentId`, `tenantId` e `shiftId` do
`MobileStynxSessionPort.currentSession()`. Ele rejeita divergência entre sessão,
tenancy e resposta bootstrap, usa `deviceId`/`appVersion` para
`MobileBootstrapQuery`, chama também `ProvisioningClient.readiness(deviceId)` e
publica os dois resultados em uma única transição atômica para `ready`.
`installation_id` e `protocol_version` não são inferidos: ficam omitidos quando o
adapter não os fornece. Logout/expiração chama `clearOnSessionEnd()` e torna
imediatamente todos os accessors negados. A adaptação Angular da sessão STYNX para
`MobileStynxSessionPort` fica em `core/bootstrap.store.ts`; ela não lê
`localStorage` nem inventa identidade.

O coordenador é criado no bootstrap root, registra uma observação reativa sobre
`StynxSessionService.active` e executa `clearOnSessionEnd()` automaticamente na
primeira emissão inativa após uma sessão ativa. `start()` é idempotente enquanto
`loading`, não abre segunda dupla de requests e não pode ser chamado pela tela de
callback antes de `await session.completeLogin(window.location.href)`. Depois da
transição atômica, usa o `Router` root: `ready` com turno aberto → `/home`; `ready`
sem turno aberto → `/shift-context`; `blocked` → `/device-blocked`. Falha de
navegação permanece erro observável na ErrorBoundary, não sucesso do coordenador.

Fixtures públicas obrigatórias (funções retornam os tipos acima, não objetos
parciais/cast): `fixtureAuthenticatedFieldAgent()`, `fixtureNoPrincipal()`,
`fixtureTenantContext()`, `fixtureNoTenantContext()`, `fixtureRoleDenied()`,
`fixtureBootstrapReady()`, `fixtureBootstrapBlocked(code)`,
`fixtureOpenShift()`, `fixtureNoOpenShift()`, `fixtureGrantReady()` e
`fixtureGrantBlocked(code)`. `fixtureBootstrapReady` possui sessão exclusiva,
dispositivo autorizado/homologado sem tamper, pacote com `manifestHash`, reserva e
turno aberto; `fixtureGrantReady` retorna o `ProvisioningReadinessResponse` do
contrato com `ready: true`, blockers vazios e contagens não negativas. As variantes
blocked preservam o mesmo shape e inserem um blocker canônico, logo são adequadas
para prova positiva e negativa sem inventar API.

O Inspector instala cada fixture exclusivamente pelo provider Angular
`{ provide: TEAT_GUARD_CONTEXT, useValue: fixture...() }`; testes BOAT usam
`{ provide: TEAT_BOAT_EXTENSION, useValue: fixtureBoatExtension(...) }`. Produção
fornece esses mesmos tokens por factory de runtime; não existe token, flag ou ramo
`TEST_*` em produção. Além das fixtures isoladas, há prova integrada com signals:
o mesmo injector começa negado, recebe sessão/bootstrap/provisionamento, permite a
rota protegida e volta a negar após logout, sem recriar token ou store.

#### Bootstrap raiz STYNX

`src/main.ts` executa `bootstrapApplication(AppComponent, ...)` com, no mínimo,
`provideHttpClient()`, `provideRouter(TEAT_ROUTES)` e
`provideDetranAuthenticatedApp(...)`. O provider autenticado configura
`sessionMode: 'bearer'`, OIDC, tenancy e `loadCatalog` dinâmico de
`i18n/teat.pt-BR.json`. O mesmo grafo root fornece os oito clients HTTP, o adapter
de `MobileStynxSessionPort`, `MobileEncryptedStorePort`, o adapter real de
`MobilePrinterPort`, `BootstrapStore`, `AuthBootstrapCoordinator`,
`ReadinessGateService`, o estado da ErrorBoundary e o adapter de estado bodycam;
provider ausente é erro de bootstrap, não dependência opcional. `AppComponent` monta um único `FieldShell`, o
`BodycamIndicator` no chrome operacional e o `RouterOutlet`; o alerta de erros com
chave aprovada vive nesse shell. D-05/BOAT publicam somente estado técnico até sua
chave acessível deixar de ser `source_pending`.

OIDC configura `redirectUrl: ${origin}/auth-mfa` e
`loginRedirectRoute: '/auth-login'`; esses valores têm funções distintas e não
podem apontar ambos para `/auth-login`. `AuthLoginPageComponent` possui controle
acionável cujo handler chama `StynxSessionService.login()`. A inicialização real de
`AuthMfaPageComponent` chama `completeLogin(window.location.href)`, aguarda a
Promise e só então chama o coordenador. Instanciar a classe sem acionar lifecycle
ou invocar métodos apenas pelo teste não constitui integração de UI.

`/auth-login` chama somente a API de início de login do provider STYNX;
`/auth-mfa` é o callback configurado e somente continua o desafio oferecido pelo mesmo provider. Os nomes
concretos desses dois métodos no STYNX são verificados contra seus tipos instalados
pelo Inspector e não são rebatizados por facade fictícia. Depois de sessão ativa,
o `AuthBootstrapCoordinator` executa a sequência descrita acima. Nenhuma dessas
duas rotas de entrada recebe `authGuard`, `tenantGuard`, `roleGuard` ou
`readinessGuard`; todas as demais rotas preservam ordem e RBAC do manifesto.

`core/runtime-config.ts` lê `tenantId`, `oidcAuthority` e `clientId` de
`window.__DETRAN_RUNTIME_CONFIG__`, sem segredo, seguindo o bootstrap DETRAN
autenticado existente. A fonte fechada não fornece valores TEAT desses campos nem
um redirect OIDC adicional: os valores permanecem `source_pending`; vazio, tipo
inválido ou origem ausente falham fechado antes de iniciar sessão. O contrato não
autoriza valor default, endpoint ou credencial inventados.

#### Oito clients de backend unificado

Todos retornam `Promise<T>` e rejeitam com o `StynxError` recebido. Cada comando
recebe do chamador um argumento `headers` distinto do DTO:
`CommandHeaders = Readonly<{ 'Idempotency-Key': string }>` ou
`ConditionalCommandHeaders = Readonly<{ 'Idempotency-Key': string;
'If-Match': string }>`; quando a linha diz ambos, o segundo tipo é obrigatório.
Chave vazia, header omitido, constante compartilhada, default, UUID gerado pelo
client ou extração oportunista do body rejeitam antes do HTTP. O adapter preserva
literalmente os valores fornecidos pelo chamador. Caminho `source_pending` significa
que o client deve expor `unsupported(): Promise<never>` e rejeitar, não construir
uma URL por analogia.
Cada um dos oito clients é classe exportada com construtor exato
`constructor(private readonly http: HttpClient)`; todo método faz a chamada
observável de `HttpClient` e retorna `firstValueFrom(...)`, nunca `Observable`,
stub ou resultado síncrono.

```ts
declare class MobileBootstrapClient {
  constructor(http: HttpClient);
}
declare class OpsSnapshotsClient {
  constructor(http: HttpClient);
}
declare class OfflineSyncClient {
  constructor(http: HttpClient);
}
declare class AitClient {
  constructor(http: HttpClient);
}
declare class MeasuresClient {
  constructor(http: HttpClient);
}
declare class AlcoholClient {
  constructor(http: HttpClient);
}
declare class NormativeClient {
  constructor(http: HttpClient);
}
declare class ProvisioningClient {
  constructor(http: HttpClient);
}
```

As assinaturas seguem o OpenAPI gerado, não um double simplificado.
`openShift`, `closeShift`, `handoffSession`, os dois comandos de
`MeasuresClient`, `startProcedure` e `validatePackage` terminam em
`headers: CommandHeaders`. `finalize`, `recordScience`, `recordPrintEvent` e
`queueTransmission` terminam em `headers: ConditionalCommandHeaders`, pois as
quatro operações geradas exigem `If-Match`; `requestCancel` recebe
`CommandHeaders` no ramo draft e `ConditionalCommandHeaders` quando
`targetAitId` torna o pedido pós-final. Os cinco comandos condicionais de
provisioning também terminam em `ConditionalCommandHeaders`. Argumentos de path e
DTO permanecem antes de `headers`. Reads não recebem esses headers, e operação cuja
fonte não os declarou não os ganha por analogia.

| client                  | método público                                                                                                                                     | verbo e path literal                                                                                                                                                                                        | input/headers                                                                                                                                                                                | retorno/erro                                                                                                                                                                                             |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `MobileBootstrapClient` | `getBootstrap`, `openShift`, `closeShift`, `handoffSession`                                                                                        | `GET /v1/ops/mobile-bootstrap`; `POST /v1/ops/mobile-bootstrap/shifts`; `POST /v1/ops/mobile-bootstrap/shifts/{id}/close`; `POST /v1/ops/mobile-bootstrap/sessions/handoff`                                 | `MobileBootstrapQuery`; `OpenMobileShiftDto` + `device_id`; `CloseMobileShiftDto`; `{ failed_device_id, reason, new_device_id?, location_json? }`; `Idempotency-Key` em cada POST de comando | `BootstrapSnapshot`; `Shift`; `Shift`; encerramento de sessão; `StynxError`                                                                                                                              |
| `OpsSnapshotsClient`    | `externalQuery`                                                                                                                                    | `POST /v1/ops/snapshots/external-queries`                                                                                                                                                                   | `{ query_type: vehicle_by_plate\|driver_by_cpf\|driver_by_license, parameters, purpose }`; sem header adicional declarado                                                                    | snapshot congelado `{ snapshot_id, source, queried_at, result, divergence_recorded }`; `TEAT.QUERY_UPSTREAM_UNAVAILABLE` ou `TEAT.QUERY_NOT_FOUND`                                                       |
| `OfflineSyncClient`     | `submitBatch`, `receiptByIdempotency`, `resolveConflict`                                                                                           | `POST /v1/ops/offline-sync/sync-batches`; `GET /v1/ops/offline-sync/receipts/{tenantId}/by-idempotency/{key}`; `POST /v1/ops/offline-sync/sync-conflicts/{id}/resolve`                                      | `SubmitSyncBatchDto`; ids de path; `ResolveSyncConflictDto`; headers não declarados no contrato                                                                                              | batch/receipts; recibo durável; `resolved\|rejected`; `StynxError`                                                                                                                                       |
| `AitClient`             | `finalize`, `recordScience`, `recordPrintEvent`, `queueTransmission`, `requestCancel`                                                              | `POST /v1/inf/ait/aits/{id}/finalize`; `POST /v1/inf/ait/aits/{id}/science`; `POST /v1/inf/ait/aits/{id}/print-events`; `POST /v1/inf/ait/aits/{id}/queue-transmission`; `POST /v1/inf/ait/cancel-requests` | DTOs gerados; `If-Match` + `Idempotency-Key` nos quatro comandos sobre AIT; cancelamento draft usa `Idempotency-Key`, pós-final usa também `If-Match`                                        | respostas e `ETag` literais do OpenAPI; `StynxError`                                                                                                                                                     |
| `MeasuresClient`        | `startAdministrativeMeasure`, `releaseRetention`, `unsupported`                                                                                    | `POST /v1/inf/measures/administrative-measures/{id}/start`; `POST /v1/inf/measures/retentions/{id}/release`; demais caminhos elididos em §6 são `source_pending`                                            | `StartMeasureCommandDto`; `ReleaseRetentionCommandDto`; `Idempotency-Key` para comando                                                                                                       | `started`; `LIBERADO_*\|REGULARIZADO`; `unsupported(): Promise<never>` rejeita                                                                                                                           |
| `AlcoholClient`         | `startProcedure`, `unsupported`                                                                                                                    | `POST /v1/inf/alcohol/procedures/{id}/start`; caminhos com `…` em §6 são `source_pending`                                                                                                                   | `StartAlcoholProcedureCommandDto`; `Idempotency-Key` para comando                                                                                                                            | `TRIAGEM`; `unsupported(): Promise<never>` rejeita                                                                                                                                                       |
| `NormativeClient`       | `syncMetadata`, `packageContent`, `validatePackage`                                                                                                | `GET /v1/inf/normative/mobile-packages/sync-metadata`; `GET /v1/inf/normative/mobile-packages/{id}/content`; `POST /v1/inf/normative/mobile-packages/{id}/validate`                                         | package id; `ValidateMobileNormativePackageCommandDto`; `Idempotency-Key` para comando                                                                                                       | metadata; conteúdo assinado; `VALIDADO_PKG`; `StynxError`                                                                                                                                                |
| `ProvisioningClient`    | `createKeyChallenge`, `registerDeviceKey`, `issuePackage`, `downloadPackageContent`, `recordReceipt`, `readiness`, `revokeGrant`, `reconcileGrant` | os oito paths e verbos literais de `BP-OPS-PROVISIONING-001.commands.openapi.json`                                                                                                                          | requests do OpenAPI; `If-Match` + `Idempotency-Key` em todos os POST exceto `createKeyChallenge` que exige somente `Idempotency-Key`; GET sem esses headers                                  | responses nomeadas pelo OpenAPI; `TEAT.AUTH_REQUIRED`, `TEAT.FORBIDDEN_ACTION`, `TEAT.IF_MATCH_REQUIRED`, `TEAT.VERSION_CONFLICT`, `TEAT.IDEMPOTENCY_REPLAY`, `TEAT.VALIDATION_FAILED` conforme operação |

Para `ProvisioningClient`, os oito pares método/path são:
`createKeyChallenge(deviceId, request, commandHeaders)` →
`POST /v1/ops/provisioning/devices/{deviceId}/key-challenges`;
`registerDeviceKey(deviceId, request, conditionalHeaders)` →
`POST /v1/ops/provisioning/devices/{deviceId}/keys`;
`issuePackage(request, conditionalHeaders)` → `POST /v1/ops/provisioning/packages`;
`downloadPackageContent(id)` → `GET /v1/ops/provisioning/packages/{id}/content`;
`recordReceipt(id, request, conditionalHeaders)` →
`POST /v1/ops/provisioning/packages/{id}/receipts`;
`readiness(deviceId)` → `GET /v1/ops/provisioning/devices/{deviceId}/readiness`;
`revokeGrant(id, request, conditionalHeaders)` →
`POST /v1/ops/provisioning/grants/{id}/revoke`; e
`reconcileGrant(id, request, conditionalHeaders)` →
`POST /v1/ops/provisioning/grants/{id}/reconcile`. Os nomes `request` remetem aos
schemas OpenAPI fechados; não autorizam body vazio ou campo inventado.

Os oito clients e todos os callers acima pertencem ao injector root. O Inspector
resolve cada token a partir do mesmo injector usado por `AppComponent`, executa um
comando real com `HttpTestingController` e prova que os headers chegaram ao wire.
Instanciar classes manualmente só no teste unitário não prova DI de produção.

#### LocalActStore, SyncWorker e pacote normativo

```ts
type QueueReceiptStatus = 'received' | 'applied' | 'conflict' | 'rejected';
type LocalEntityType =
  | 'ait'
  | 'administrative-measure'
  | 'alcohol-signs-term'
  | 'ait-cancel-request'
  | 'ait-cancel-posfinal-request'
  | 'crash-record';
type LocalAct = Readonly<{
  entityType: LocalEntityType;
  localEntityId: string;
  version: number;
  idempotencyKey: string;
  payloadHash: string;
  payloadJson: unknown;
  createdLocallyAt?: string;
}>;
type QueueReceipt = Readonly<{
  localEntityId: string;
  idempotencyKey: string;
  status: QueueReceiptStatus;
  serverEntityId?: string;
  errorCode?: string;
  errorMessage?: string;
}>;
type SubmitSyncBatchDto = Readonly<{
  traffic_agency_id: string;
  device_id: string;
  agent_id: string;
  device_batch_id: string;
  batch_sequence?: number;
  items: readonly Readonly<{
    entity_type: LocalEntityType;
    local_entity_id: string;
    server_entity_id?: string;
    idempotency_key?: string;
    payload_hash: string;
    created_locally_at?: string;
    payload_json?: Readonly<Record<string, unknown>>;
  }>[];
}>;
type SubmitSyncBatchResponse = Readonly<{
  batchId: string;
  batch_sequence?: number | null;
  accepted_items: number;
  receipts: readonly Readonly<{
    local_entity_id: string;
    idempotency_key?: string;
    status: QueueReceiptStatus;
    server_entity_id?: string;
    error_code?: string | null;
    error_message?: string | null;
  }>[];
  warnings?: readonly 'SYNC_CONCURRENCY_WINDOW_SOURCE_PENDING'[];
}>;
type SyncCursor = Readonly<{
  deviceBatchId: string;
  batchSequence: number;
}>;

declare class LocalActStore {
  constructor(store: MobileEncryptedStorePort);
  putDraft(draft: MobileEntityDraft<LocalEntityType>): Promise<void>;
  draft(
    localEntityId: string,
  ): Promise<MobileEntityDraft<LocalEntityType> | undefined>;
  putQueueItem(item: MobileSyncQueueItem<LocalEntityType>): Promise<void>;
  pending(): Promise<readonly MobileSyncQueueItem<LocalEntityType>[]>;
  putEvidence(evidence: MobileEvidenceDraft): Promise<void>;
  putReservation(reservation: MobileNumberingReservation): Promise<void>;
  putPackage(value: InstalledNormativePackage): Promise<void>;
  putPrintReceipt(receipt: MobilePrintReceipt): Promise<void>;
  applyReceipts(receipts: readonly QueueReceipt[]): Promise<void>;
  receiptByIdempotency(key: string): Promise<QueueReceipt | undefined>;
  cursor(): Promise<SyncCursor | undefined>;
  saveCursor(cursor: SyncCursor): Promise<void>;
}
declare class SyncWorker {
  constructor(
    store: LocalActStore,
    client: OfflineSyncClient,
    bootstrap: BootstrapStore,
    ids: MobileIdPort,
  );
  submitNext(): Promise<SubmitSyncBatchResponse>;
  recoverReceipt(
    tenantId: string,
    idempotencyKey: string,
  ): Promise<QueueReceipt | undefined>;
}
type InstalledNormativePackage = Readonly<{
  id: string;
  version: string;
  manifestHash: string;
  validUntil: string;
  manifest: Readonly<Record<string, unknown>>;
  signature: Readonly<{
    value: string;
    signer: string;
    kind: 'local-unsigned';
  }>;
}>;
declare class NormativePackageService {
  constructor(
    store: MobileEncryptedStorePort,
    client: NormativeClient,
    bootstrap: BootstrapStore,
  );
  install(
    id: string,
    input: Readonly<{
      packageVersion: string;
      headers: CommandHeaders;
    }>,
  ): Promise<InstalledNormativePackage>;
  usable(now: string): Promise<InstalledNormativePackage | undefined>;
  revalidate(now: string): Promise<'usable' | 'warning-expired' | 'blocked'>;
}
```

As coleções literais são `draft`, `queue`, `evidence`, `reservation`, `package`,
`print-receipt`, `sync-receipt` e `sync-cursor`; todas usam o mesmo
`MobileEncryptedStorePort` de produção. Escrita por chave é atômica e não aceita
`localEntityId` já persistido com payload/hash/idempotência distintos. Não existe
segundo store nominal restrito a acts.

Cada `put*` executa leitura, comparação e eventual escrita na mesma transação
`readwrite` do IndexedDB. Replay byte/semanticamente equivalente é idempotente e
não regrava; colisão preserva o registro anterior e rejeita com
`local-store-identity-conflict`. Para `draft`, a identidade comparada é
`localId + entityType + idempotencyKey + localContentHash + status`; para `queue`,
`queueItemId + localEntityId + idempotencyKey + payloadHash`; para receipt,
`localEntityId + idempotencyKey + status + serverEntityId`. Evidence, reservation,
package e print receipt usam respectivamente seus IDs canônicos e todo campo de
hash/versão/status presente no tipo. `applyReceipts` faz a mesma comparação por
item e nunca sobrescreve receipt divergente. Falha no meio da transação faz abort,
sem estado parcial; essa garantia pertence ao adapter IndexedDB/WebCrypto de
produção, não somente ao fixture.

`SyncWorker` obtém `traffic_agency_id`, `device_id` e `agent_id` do snapshot
bootstrap `ready`; transforma cada `MobileSyncQueueItem` nos nomes snake_case do
`SubmitSyncBatchDto` acima e nunca envia o snapshot inteiro. `OfflineSyncClient`
desserializa o envelope `SubmitSyncBatchResponse`; o worker mapeia `receipts`
snake_case para `QueueReceipt`, chama `applyReceipts` antes de concluir e não toca
item ausente em receipt parcial. Cursor e `device_batch_id` são persistidos antes
do primeiro POST. Rejeição/rede reutiliza exatamente ambos; depois de resposta 200
persistida, o próximo cursor usa `batchSequence + 1` e novo id produzido por
`MobileIdPort.uuid('sync-batch')`. Na ausência inicial de cursor, o worker cria
sequência `1`, persiste-a e relê o mesmo valor antes do primeiro POST; se o POST
falhar, não gera novo UUID nem altera sequência. Ausência de identidade bootstrap
ou campo obrigatório rejeita antes do HTTP. `OfflineSyncClient` mapeia o receipt
wire `local_entity_id`, `idempotency_key`, `server_entity_id`, `error_code` e
`error_message` para os campos camelCase de `QueueReceipt`; o worker nunca recebe
wire cru no recovery. `recoverReceipt` usa o path literal do client, persiste a
resposta antes de devolvê-la e converte em `undefined` exclusivamente um
`StynxError` com status 404 **e** código `TEAT.SYNC_RECEIPT_NOT_FOUND`; qualquer
outro erro, inclusive 404 com código distinto, propaga. Cache/local receipt não
mascara erro remoto.

`NormativeClient.packageContent` retorna o envelope OpenAPI
`{ manifest, manifest_hash, signature }`; `validatePackage` recebe
`{ package_version, manifest_hash }` e `CommandHeaders` do caller e retorna
`{ valid, reason }`. `install` exige que id, versão, hash e `validUntil` coincidam
com o pacote autoritativo do `BootstrapStore`, re-hasheia `manifest`, exige
`valid === true` e só então persiste. Como verificação criptográfica da assinatura
`local-unsigned` permanece `source_pending`, a implementação não a chama de
assinatura verificada; divergência/ausência bloqueia. `usable` re-hasheia após
reinício; `revalidate` devolve `warning-expired` para E.29/ADR-0031 e `blocked` para qualquer
outro blocker, sem fabricar data.

#### Dispatch de transição, ErrorBoundary e diagnósticos

```ts
type Transition = Readonly<{
  from: string;
  action: string;
  to: string;
  condition: string;
  type: string;
  notes: string;
}>;
type DispatchResult =
  | Readonly<{ kind: 'navigated'; to: string }>
  | Readonly<{ kind: 'back' }>
  | Readonly<{
      kind: 'denied';
      reason:
        | 'missing-transition'
        | 'condition-unsatisfied'
        | 'unregistered-destination'
        | 'unsafe-previous';
    }>;
interface NavigationHistory {
  previousScreen(): string | undefined;
  isEditableActScreen(screenId: string): boolean;
}
declare function dispatchTransition(
  input: Readonly<{
    from: string;
    action: string;
    conditionSatisfied: boolean;
  }>,
  router: Router,
  location: Location,
  history: NavigationHistory,
): Promise<DispatchResult>;
type DiagnosticEntry = Readonly<{
  code: string;
  status?: number;
  context: Readonly<Record<string, string>>;
  source: 'route' | 'action';
  occurredAt: string;
}>;
declare class FieldShell {
  capture(error: unknown, source: DiagnosticEntry['source']): DiagnosticEntry;
  diagnostics(): readonly DiagnosticEntry[];
}
declare class TeatErrorBoundaryState {
  readonly current: Signal<DiagnosticEntry | undefined>;
  capture(error: unknown, source: DiagnosticEntry['source']): DiagnosticEntry;
  clear(): void;
  diagnostics(): readonly DiagnosticEntry[];
}
declare class TeatErrorHandler implements ErrorHandler {
  handleError(error: unknown): void;
}
```

`dispatchTransition` pesquisa a lista hash-validada da seção 4 pelo par exato
`from`/`action`; condição não vazia exige `conditionSatisfied`. Para destino
registrado chama `Router.navigateByUrl('/' + to)` e retorna `navigated`; somente
`to === '__previous__'` chama `Location.back()` e retorna `back`. Quando `from` é
`ait-done`, porém, o executor consulta `NavigationHistory`: se o anterior estiver
ausente ou `isEditableActScreen(previous) === true`, retorna
`{ kind: 'denied', reason: 'unsafe-previous' }` sem navegar. A fonte não define
um destino substituto; ele permanece `source_pending` e não pode ser inventado.
Não encontrar
linha/destino/condição devolve `denied` sem chamar Router ou Location. `capture`
no `FieldShell` mapeia `StynxError` conhecido para o código TEAT recebido, converte
desconhecido em `TEAT.INTERNAL`, remove valores que não sejam tokens de contexto e
acrescenta entrada diagnóstica; não lança, não retorna sucesso e não serializa
payload de ato. `FieldShell`, `TeatErrorHandler` e o handler de erro do Router
injetam a mesma instância root de `TeatErrorBoundaryState`; o template observa
`current` e anuncia o erro com `role="alert"`/`aria-live`. A persistência/exportação física de `DiagnosticEntry` é
`source_pending`; a API em memória é suficiente para provar classificação e
apresentação sem inventar endpoint.

#### Produção: impressão, bodycam, módulos, i18n e extensão

```ts
type PrintResult = Readonly<{
  eventType: string;
  printerIdentifier?: string;
  receiptHash?: string;
  failureReason?: string;
}>;
type PrintAttempt = Readonly<{
  aitId: string;
  aitVersion: string;
  eventIdempotencyKey: string;
  session: MobileSessionContext;
  draft: MobileEntityDraft<'ait'>;
  contentHash: string;
}>;
declare class PrinterDialog {
  constructor(printer: MobilePrinterPort, ait: AitClient, store: LocalActStore);
  print(input: PrintAttempt): Promise<PrintResult>;
}
type BodycamState = 'recording' | 'paused-exception' | 'failure';
interface BodycamStatePort {
  readonly state: Signal<BodycamState>;
}
export const TEAT_BODYCAM_STATE: InjectionToken<BodycamStatePort>;
declare class BodycamIndicator {
  readonly state: InputSignal<BodycamState>;
}
interface TeatI18n {
  translate(
    key: string,
    params?: Readonly<Record<string, string | number>>,
  ): string;
}
interface BoatExtensionPort {
  installed(): boolean;
  load(route: string): Promise<unknown>;
}
export const TEAT_BOAT_EXTENSION: InjectionToken<BoatExtensionPort>;
export const BOAT_PT_BR_CATALOG: Readonly<Record<string, string>>;
type BoatRouteResolution =
  | Readonly<{ kind: 'loaded'; component: unknown }>
  | Readonly<{ kind: 'unavailable' }>;
declare function resolveBoatRoute(
  path: string,
  extension: BoatExtensionPort,
): Promise<BoatRouteResolution>;
type DisabledRouteResolution =
  Readonly<{ kind: 'unavailable' }> | Readonly<{ kind: 'not-disabled' }>;
declare function resolveDisabledRoute(path: string): DisabledRouteResolution;
export const TEAT_ROUTES: Routes;
```

`BodycamIndicator` declara `readonly state = input.required<BodycamState>()`.
`AppComponent` liga `[state]` ao signal do provider `TEAT_BODYCAM_STATE`, nunca a
uma constante. O adapter concreto de hardware/bodycam permanece
`source_pending`; até ele existir, o provider de integração reporta somente
`failure` e registra diagnóstico, sem simular `recording`. O input `state` sempre
recebe um dos três estados e não oferece método de ler conteúdo; esse conteúdo só usa a entrega
de custódia registrada. Cada módulo expõe `Routes` não vazio contendo exatamente
as linhas de seu grupo do manifesto e cada página expõe componente standalone
distinto. `TeatI18n.translate` rejeita chave fora dos namespaces autorizados e
nenhum componente exibe literal. `TeatI18n` exige `StynxI18nService` por DI;
falha de resolução propaga e é capturada pela ErrorBoundary, sem `try/catch`,
translator `{ translate: key => key }` ou catálogo local de fallback. Para D-05, o módulo AIT expõe a rota com
`featureEnabled: false` e retorna estado disabled sem invocar client. Para BOAT,
`installed() === false` impede o atalho e `load` não é chamado; navegação direta
recebe negação/fallback sem placeholder. A chave de texto para esses dois estados é
`source_pending`; portanto o estado técnico/redirect pode ser provado, mas a UI
não pode ser declarada pronta nem receber texto/`aria-label` inventado antes de a
chave ser aprovada. O gate deve falhar fechado nesse ponto em vez de contar um
container vazio como fallback acessível.

O catálogo `src/app/i18n/boat.pt-BR.json` é espelhado byte a byte pela biblioteca BOAT como
`BOAT_PT_BR_CATALOG` e mesclado ao loader mobile e ao provider web do TEAT sem substituir chaves.
As 13 chaves com valor `source_pending:OD-R15-004` permanecem bloqueadas e nunca são exibidas
como tradução.

`PrinterDialog` chama o `MobilePrinterPort.printReceipt` real de
`@stynx-nyx/mobile-runtime` com `session`, `draft` e `contentHash`, persiste o
`MobilePrintReceipt` em `print-receipt` e chama
`AitClient.recordPrintEvent(aitId, dto, { 'If-Match': aitVersion,
'Idempotency-Key': eventIdempotencyKey })`. O DTO usa `event_type`,
`printer_identifier`, `receipt_hash` e, em falha, `failure_reason`. A tentativa
fornece a chave e a versão; nem dialog nem client as geram. Reimpressão recebe nova
chave de evento e o mesmo `aitId`/número, sem criar AIT. Um adapter de Inspector
implementa a interface exata e um teste de integração usa o provider de produção;
objeto com método ad hoc `print(aitId)` não satisfaz o oráculo.

`resolveBoatRoute` aceita somente os doze paths `crash-*` do manifesto. Para path
fora desse conjunto devolve `{ kind: 'unavailable' }` sem chamar `installed` ou
`load`; para path BOAT com `installed() === false`, devolve o mesmo resultado sem
chamar `load`; somente para BOAT instalado chama `load(path)` uma vez e devolve
`{ kind: 'loaded', component }`. Rejeição de `load` propaga como rejeição, nunca
vira componente TEAT. `resolveDisabledRoute` reconhece somente
`/ait-speed-measurement`: devolve `{ kind: 'unavailable' }` para ele e
`{ kind: 'not-disabled' }` para qualquer outro path; não possui dependência de
client e nunca pode chamá-lo.

`TEAT_ROUTES`, em `app.routes.ts`, possui somente os oito mounts lazy por
`loadChildren`; cada módulo é dono de suas entradas concretas, guardas e
`loadComponent`, sem importar `TEAT_ROUTES`. O módulo AIT usa
`resolveDisabledRoute` antes de qualquer carga de D-05 e, para `unavailable`,
publica somente estado técnico na ErrorBoundary, cancela a navegação e preserva a
URL segura anterior, sem importar feature de velocidade. A rota D-05 não declara
`loadComponent`, `loadChildren` nem resolver de feature. Cada entrada `crash-*` do módulo sinistro usa
o próprio `readinessGuard` (na posição normal dos cinco guardas) para consultar
`TEAT_BOAT_EXTENSION` e negar quando `installed()` é falso; não se adiciona sexto
guarda. Quando verdadeiro, usa `resolveBoatRoute` como resolvedor/load boundary.
Quando falso, em rejeição de `load` ou em navegação direta, publica estado
`unavailable` na mesma
`TeatErrorBoundaryState` observada pelo `FieldShell`. Assim não há
placeholder: BOAT só fornece componente carregado e D-05 só fornece estado
indisponível; a resolução é uma superfície pública diretamente invocável pelo
Inspector.

Nenhum desses caminhos usa `TEAT.INTERNAL` como mensagem substituta nem redireciona
BOAT para D-05. Com URL segura anterior, a navegação permanece nela; em carga
direta, o bootstrap retorna à entrada autenticada configurada. Até existir chave
i18n aprovada, não se cria alerta textual, `aria-label`, componente ou placeholder
local: a apresentação acessível continua blocker conhecido.

Como a chave i18n acessível desses dois estados permanece `source_pending`, o
Inspector mantém o caso RED/blocked para apresentação acessível até a decisão de
produto; ele ainda prova agora que não houve load, comando, placeholder ou literal.

## 2. Manifesto de 71 rotas

`allowedRoles` é o conjunto completo permitido em cada linha; todos os demais
papéis canônicos de `TEAT_STAFF_ROLES` são negados. Nas duas entradas `E`, o rol é
validado pelo coordenador ao concluir autenticação, não por `canMatch` antes de a
sessão existir. `E` significa entrada STYNX sem guarda TEAT; `R` significa somente
`auth, tenant, role`; `B` acrescenta `readiness`; `S` acrescenta `shift` (logo,
`B+S` preserva a ordem da seção 1). Caminho de componente é também a posse de
produção do Feature Engineer.

| rota                     | uxCode           | folha fonte                        | guardas       | allowedRoles                      | componente                                                                                |
| ------------------------ | ---------------- | ---------------------------------- | ------------- | --------------------------------- | ----------------------------------------------------------------------------------------- |
| `/auth-login`            | `UX-MOB-001`     | `IU-TEAT-auth-login.md`            | E             | `field-agent`, `field-supervisor` | `features/turno/pages/auth-login.page.ts#AuthLoginPageComponent`                          |
| `/auth-mfa`              | `UX-MOB-002`     | `IU-TEAT-auth-mfa.md`              | E             | `field-agent`, `field-supervisor` | `features/turno/pages/auth-mfa.page.ts#AuthMfaPageComponent`                              |
| `/device-blocked`        | `UX-MOB-003`     | `IU-TEAT-device-blocked.md`        | R             | `field-agent`, `field-supervisor` | `features/turno/pages/device-blocked.page.ts#DeviceBlockedPageComponent`                  |
| `/shift-context`         | `UX-MOB-004`     | `IU-TEAT-shift-context.md`         | B             | `field-agent`, `field-supervisor` | `features/turno/pages/shift-context.page.ts#ShiftContextPageComponent`                    |
| `/operation-select`      | `UX-MOB-005`     | `IU-TEAT-operation-select.md`      | B             | `field-agent`, `field-supervisor` | `features/turno/pages/operation-select.page.ts#OperationSelectPageComponent`              |
| `/open-shift`            | `UX-MOB-006`     | `IU-TEAT-open-shift.md`            | B             | `field-agent`, `field-supervisor` | `features/turno/pages/open-shift.page.ts#OpenShiftPageComponent`                          |
| `/home`                  | `UX-MOB-007`     | `IU-TEAT-home.md`                  | B+S           | `field-agent`, `field-supervisor` | `features/turno/pages/home.page.ts#HomePageComponent`                                     |
| `/close-shift`           | `UX-MOB-008`     | `IU-TEAT-close-shift.md`           | B+S           | `field-agent`, `field-supervisor` | `features/turno/pages/close-shift.page.ts#CloseShiftPageComponent`                        |
| `/shift-summary`         | `UX-MOB-009`     | `IU-TEAT-shift-summary.md`         | B             | `field-agent`, `field-supervisor` | `features/turno/pages/shift-summary.page.ts#ShiftSummaryPageComponent`                    |
| `/device-handoff`        | `source_pending` | `ARCH-TEAT-FRONTENDS §4 (D-01)`    | B             | `field-agent`, `field-supervisor` | `features/turno/pages/device-handoff.page.ts#DeviceHandoffPageComponent`                  |
| `/vehicle-search`        | `UX-MOB-010`     | `IU-TEAT-vehicle-search.md`        | B+S           | `field-agent`, `field-supervisor` | `features/consultas/pages/vehicle-search.page.ts#VehicleSearchPageComponent`              |
| `/vehicle-result`        | `UX-MOB-011`     | `IU-TEAT-vehicle-result.md`        | B+S           | `field-agent`, `field-supervisor` | `features/consultas/pages/vehicle-result.page.ts#VehicleResultPageComponent`              |
| `/vehicle-divergence`    | `UX-MOB-012`     | `IU-TEAT-vehicle-divergence.md`    | B+S           | `field-agent`, `field-supervisor` | `features/consultas/pages/vehicle-divergence.page.ts#VehicleDivergencePageComponent`      |
| `/driver-search`         | `UX-MOB-013`     | `IU-TEAT-driver-search.md`         | B+S           | `field-agent`, `field-supervisor` | `features/consultas/pages/driver-search.page.ts#DriverSearchPageComponent`                |
| `/driver-result`         | `UX-MOB-014`     | `IU-TEAT-driver-result.md`         | B+S           | `field-agent`, `field-supervisor` | `features/consultas/pages/driver-result.page.ts#DriverResultPageComponent`                |
| `/query-failure`         | `UX-MOB-015`     | `IU-TEAT-query-failure.md`         | B+S           | `field-agent`, `field-supervisor` | `features/consultas/pages/query-failure.page.ts#QueryFailurePageComponent`                |
| `/ait-start`             | `UX-MOB-020`     | `IU-TEAT-ait-start.md`             | B+S           | `field-agent`, `field-supervisor` | `features/ait/pages/ait-start.page.ts#AitStartPageComponent`                              |
| `/ait-vehicle`           | `UX-MOB-021`     | `IU-TEAT-ait-vehicle.md`           | B+S           | `field-agent`, `field-supervisor` | `features/ait/pages/ait-vehicle.page.ts#AitVehiclePageComponent`                          |
| `/ait-driver`            | `UX-MOB-022`     | `IU-TEAT-ait-driver.md`            | B+S           | `field-agent`, `field-supervisor` | `features/ait/pages/ait-driver.page.ts#AitDriverPageComponent`                            |
| `/ait-frame`             | `UX-MOB-023`     | `IU-TEAT-ait-frame.md`             | B+S           | `field-agent`, `field-supervisor` | `features/ait/pages/ait-frame.page.ts#AitFramePageComponent`                              |
| `/ait-frame-detail`      | `UX-MOB-024`     | `IU-TEAT-ait-frame-detail.md`      | B+S           | `field-agent`, `field-supervisor` | `features/ait/pages/ait-frame-detail.page.ts#AitFrameDetailPageComponent`                 |
| `/ait-location`          | `UX-MOB-025`     | `IU-TEAT-ait-location.md`          | B+S           | `field-agent`, `field-supervisor` | `features/ait/pages/ait-location.page.ts#AitLocationPageComponent`                        |
| `/ait-notes`             | `UX-MOB-026`     | `IU-TEAT-ait-notes.md`             | B+S           | `field-agent`, `field-supervisor` | `features/ait/pages/ait-notes.page.ts#AitNotesPageComponent`                              |
| `/ait-validations`       | `UX-MOB-027`     | `IU-TEAT-ait-validations.md`       | B+S           | `field-agent`, `field-supervisor` | `features/ait/pages/ait-validations.page.ts#AitValidationsPageComponent`                  |
| `/ait-evidence`          | `UX-MOB-028`     | `IU-TEAT-ait-evidence.md`          | B+S           | `field-agent`, `field-supervisor` | `features/ait/pages/ait-evidence.page.ts#AitEvidencePageComponent`                        |
| `/ait-measures`          | `UX-MOB-029`     | `IU-TEAT-ait-measures.md`          | B+S           | `field-agent`, `field-supervisor` | `features/ait/pages/ait-measures.page.ts#AitMeasuresPageComponent`                        |
| `/ait-signature`         | `UX-MOB-030`     | `IU-TEAT-ait-signature.md`         | B+S           | `field-agent`, `field-supervisor` | `features/ait/pages/ait-signature.page.ts#AitSignaturePageComponent`                      |
| `/ait-review`            | `UX-MOB-031`     | `IU-TEAT-ait-review.md`            | B+S           | `field-agent`, `field-supervisor` | `features/ait/pages/ait-review.page.ts#AitReviewPageComponent`                            |
| `/ait-done`              | `UX-MOB-032`     | `IU-TEAT-ait-done.md`              | B+S           | `field-agent`, `field-supervisor` | `features/ait/pages/ait-done.page.ts#AitDonePageComponent`                                |
| `/ait-print`             | `UX-MOB-033`     | `IU-TEAT-ait-print.md`             | B+S           | `field-agent`, `field-supervisor` | `features/ait/pages/ait-print.page.ts#AitPrintPageComponent`                              |
| `/ait-shift-detail`      | `UX-MOB-034`     | `IU-TEAT-ait-shift-detail.md`      | B+S           | `field-agent`, `field-supervisor` | `features/ait/pages/ait-shift-detail.page.ts#AitShiftDetailPageComponent`                 |
| `/ait-cancel-request`    | `D-04`           | `IU-TEAT-ait-cancel-request.md`    | B+S           | `field-agent`, `field-supervisor` | `features/ait/pages/ait-cancel-request.page.ts#AitCancelRequestPageComponent`             |
| `/ait-speed-measurement` | `D-05`           | `IU-TEAT-ait-speed-measurement.md` | B+S, disabled | `field-agent`, `field-supervisor` | `features/ait/pages/ait-speed-measurement.page.ts#AitSpeedMeasurementPageComponent`       |
| `/measure-start`         | `UX-MOB-040`     | `IU-TEAT-measure-start.md`         | B+S           | `field-agent`, `field-supervisor` | `features/medidas/pages/measure-start.page.ts#MeasureStartPageComponent`                  |
| `/retention`             | `UX-MOB-041`     | `IU-TEAT-retention.md`             | B+S           | `field-agent`, `field-supervisor` | `features/medidas/pages/retention.page.ts#RetentionPageComponent`                         |
| `/removal`               | `UX-MOB-042`     | `IU-TEAT-removal.md`               | B+S           | `field-agent`, `field-supervisor` | `features/medidas/pages/removal.page.ts#RemovalPageComponent`                             |
| `/inventory`             | `UX-MOB-043`     | `IU-TEAT-inventory.md`             | B+S           | `field-agent`, `field-supervisor` | `features/medidas/pages/inventory.page.ts#InventoryPageComponent`                         |
| `/transshipment`         | `UX-MOB-044`     | `IU-TEAT-transshipment.md`         | B+S           | `field-agent`, `field-supervisor` | `features/medidas/pages/transshipment.page.ts#TransshipmentPageComponent`                 |
| `/measure-term`          | `UX-MOB-045`     | `IU-TEAT-measure-term.md`          | B+S           | `field-agent`, `field-supervisor` | `features/medidas/pages/measure-term.page.ts#MeasureTermPageComponent`                    |
| `/measure-done`          | `UX-MOB-046`     | `IU-TEAT-measure-done.md`          | B+S           | `field-agent`, `field-supervisor` | `features/medidas/pages/measure-done.page.ts#MeasureDonePageComponent`                    |
| `/alcohol-start`         | `UX-MOB-050`     | `IU-TEAT-alcohol-start.md`         | B+S           | `field-agent`, `field-supervisor` | `features/alcoolemia/pages/alcohol-start.page.ts#AlcoholStartPageComponent`               |
| `/alcohol-device`        | `UX-MOB-051`     | `IU-TEAT-alcohol-device.md`        | B+S           | `field-agent`, `field-supervisor` | `features/alcoolemia/pages/alcohol-device.page.ts#AlcoholDevicePageComponent`             |
| `/alcohol-result`        | `UX-MOB-052`     | `IU-TEAT-alcohol-result.md`        | B+S           | `field-agent`, `field-supervisor` | `features/alcoolemia/pages/alcohol-result.page.ts#AlcoholResultPageComponent`             |
| `/alcohol-refusal`       | `UX-MOB-053`     | `IU-TEAT-alcohol-refusal.md`       | B+S           | `field-agent`, `field-supervisor` | `features/alcoolemia/pages/alcohol-refusal.page.ts#AlcoholRefusalPageComponent`           |
| `/alcohol-signs`         | `UX-MOB-054`     | `IU-TEAT-alcohol-signs.md`         | B+S           | `field-agent`, `field-supervisor` | `features/alcoolemia/pages/alcohol-signs.page.ts#AlcoholSignsPageComponent`               |
| `/alcohol-forward`       | `UX-MOB-055`     | `IU-TEAT-alcohol-forward.md`       | B+S           | `field-agent`, `field-supervisor` | `features/alcoolemia/pages/alcohol-forward.page.ts#AlcoholForwardPageComponent`           |
| `/alcohol-links`         | `UX-MOB-056`     | `IU-TEAT-alcohol-links.md`         | B+S           | `field-agent`, `field-supervisor` | `features/alcoolemia/pages/alcohol-links.page.ts#AlcoholLinksPageComponent`               |
| `/alcohol-term`          | `UX-MOB-057`     | `IU-TEAT-alcohol-term.md`          | B+S           | `field-agent`, `field-supervisor` | `features/alcoolemia/pages/alcohol-term.page.ts#AlcoholTermPageComponent`                 |
| `/crash-start`           | `UX-MOB-060`     | `IU-TEAT-crash-start.md`           | B+S, BOAT     | `field-agent`, `field-supervisor` | `features/sinistro/sinistro.routes.ts#CrashStartBoundaryComponent`                        |
| `/crash-location`        | `UX-MOB-061`     | `IU-TEAT-crash-location.md`        | B+S, BOAT     | `field-agent`, `field-supervisor` | `features/sinistro/sinistro.routes.ts#CrashLocationBoundaryComponent`                     |
| `/crash-conditions`      | `UX-MOB-062`     | `IU-TEAT-crash-conditions.md`      | B+S, BOAT     | `field-agent`, `field-supervisor` | `features/sinistro/sinistro.routes.ts#CrashConditionsBoundaryComponent`                   |
| `/crash-vehicles`        | `UX-MOB-063`     | `IU-TEAT-crash-vehicles.md`        | B+S, BOAT     | `field-agent`, `field-supervisor` | `features/sinistro/sinistro.routes.ts#CrashVehiclesBoundaryComponent`                     |
| `/crash-people`          | `UX-MOB-064`     | `IU-TEAT-crash-people.md`          | B+S, BOAT     | `field-agent`, `field-supervisor` | `features/sinistro/sinistro.routes.ts#CrashPeopleBoundaryComponent`                       |
| `/crash-victims`         | `UX-MOB-065`     | `IU-TEAT-crash-victims.md`         | B+S, BOAT     | `field-agent`, `field-supervisor` | `features/sinistro/sinistro.routes.ts#CrashVictimsBoundaryComponent`                      |
| `/crash-dynamics`        | `UX-MOB-066`     | `IU-TEAT-crash-dynamics.md`        | B+S, BOAT     | `field-agent`, `field-supervisor` | `features/sinistro/sinistro.routes.ts#CrashDynamicsBoundaryComponent`                     |
| `/crash-sketch`          | `UX-MOB-067`     | `IU-TEAT-crash-sketch.md`          | B+S, BOAT     | `field-agent`, `field-supervisor` | `features/sinistro/sinistro.routes.ts#CrashSketchBoundaryComponent`                       |
| `/crash-evidence`        | `UX-MOB-068`     | `IU-TEAT-crash-evidence.md`        | B+S, BOAT     | `field-agent`, `field-supervisor` | `features/sinistro/sinistro.routes.ts#CrashEvidenceBoundaryComponent`                     |
| `/crash-ait-links`       | `UX-MOB-069`     | `IU-TEAT-crash-ait-links.md`       | B+S, BOAT     | `field-agent`, `field-supervisor` | `features/sinistro/sinistro.routes.ts#CrashAitLinksBoundaryComponent`                     |
| `/crash-damages`         | `source_pending` | `IU-BOAT-S-12.md`                  | B+S, BOAT     | `field-agent`, `field-supervisor` | `features/sinistro/sinistro.routes.ts#CrashDamagesBoundaryComponent`                      |
| `/crash-review`          | `UX-MOB-070`     | `IU-TEAT-crash-review.md`          | B+S, BOAT     | `field-agent`, `field-supervisor` | `features/sinistro/sinistro.routes.ts#CrashReviewBoundaryComponent`                       |
| `/sync`                  | `UX-MOB-080`     | `IU-TEAT-sync.md`                  | B+S           | `field-agent`, `field-supervisor` | `features/sincronizacao/pages/sync.page.ts#SyncPageComponent`                             |
| `/sync-item`             | `UX-MOB-081`     | `IU-TEAT-sync-item.md`             | B+S           | `field-agent`, `field-supervisor` | `features/sincronizacao/pages/sync-item.page.ts#SyncItemPageComponent`                    |
| `/sync-conflict`         | `UX-MOB-082`     | `IU-TEAT-sync-conflict.md`         | B+S           | `field-supervisor`                | `features/sincronizacao/pages/sync-conflict.page.ts#SyncConflictPageComponent`            |
| `/diagnostics`           | `UX-MOB-083`     | `IU-TEAT-diagnostics.md`           | B+S           | `field-agent`, `field-supervisor` | `features/sincronizacao/pages/diagnostics.page.ts#DiagnosticsPageComponent`               |
| `/support`               | `UX-MOB-084`     | `IU-TEAT-support.md`               | B+S           | `field-agent`, `field-supervisor` | `features/sincronizacao/pages/support.page.ts#SupportPageComponent`                       |
| `/messages`              | `UX-MOB-085`     | `IU-TEAT-messages.md`              | B+S           | `field-agent`, `field-supervisor` | `features/sincronizacao/pages/messages.page.ts#MessagesPageComponent`                     |
| `/approach-no-ait`       | `UX-MOB-C01`     | `IU-TEAT-approach-no-ait.md`       | B+S           | `field-agent`, `field-supervisor` | `features/complementares/pages/approach-no-ait.page.ts#ApproachNoAitPageComponent`        |
| `/document-check`        | `UX-MOB-C02`     | `IU-TEAT-document-check.md`        | B+S           | `field-agent`, `field-supervisor` | `features/complementares/pages/document-check.page.ts#DocumentCheckPageComponent`         |
| `/special-inspection`    | `UX-MOB-C03`     | `IU-TEAT-special-inspection.md`    | B+S           | `field-agent`, `field-supervisor` | `features/complementares/pages/special-inspection.page.ts#SpecialInspectionPageComponent` |
| `/context-help`          | `UX-MOB-C04`     | `IU-TEAT-context-help.md`          | R             | `field-agent`, `field-supervisor` | `features/complementares/pages/context-help.page.ts#ContextHelpPageComponent`             |
| `/local-settings`        | `UX-MOB-C05`     | `IU-TEAT-local-settings.md`        | B             | `field-agent`, `field-supervisor` | `features/complementares/pages/local-settings.page.ts#LocalSettingsPageComponent`         |

OD-R15-005 registra que S-12 não possui `uxCode` autoritativo publicado; por isso o manifesto
usa literalmente `source_pending` e não cria `UX-MOB-071`.

### 2.1 Binding comportamental das 58 páginas TEAT habilitadas

`MobilePageRuntime` não retorna nomes. Ele injeta as instâncias root e devolve uma
união fechada cujo `schema`, `client` e `store` são objetos executáveis:

```ts
type PageExecutionResult =
  | Readonly<{ kind: 'loaded'; value: unknown }>
  | Readonly<{ kind: 'persisted'; localEntityId: string }>
  | Readonly<{ kind: 'submitted'; value: unknown }>
  | Readonly<{ kind: 'blocked'; reason: 'source_pending' | 'not-ready' }>;

type CommandContext = Readonly<{
  session: MobileSessionContext;
  localEntityId: string;
  entityType: LocalEntityType;
  version: number;
  idempotencyKey: string;
  payloadHash: string;
  createdLocallyAt: string;
  normativePackageId: string;
  normativePackageVersion: string;
  reservationId?: string;
  reservedNumber?: number;
  ifMatch?: string;
}>;

type PageBinding = Readonly<{
  screenId: string;
  schema?: ZodType<unknown>;
  client?:
    | MobileBootstrapClient
    | OpsSnapshotsClient
    | OfflineSyncClient
    | AitClient
    | MeasuresClient
    | AlcoholClient
    | NormativeClient
    | ProvisioningClient;
  store?: LocalActStore;
  load(): Promise<PageExecutionResult>;
  submit?(
    input: unknown,
    context: CommandContext,
  ): Promise<PageExecutionResult>;
}>;
```

Construção da página apenas resolve o binding; HTTP/persistência ocorre em
`load` explícito ou ação do usuário. `CommandContext` carrega ids, versão,
`Idempotency-Key`, `If-Match`, sessão STYNX, pacote normativo, reserva, horário e
hash já adquiridos; runtime/page/client não geram nem deixam vazios esses valores.
Para criação offline, `localEntityId`, `idempotencyKey`, `createdLocallyAt` e
`payloadHash` vêm respectivamente de `MobileIdPort`, chave de evento entregue pelo
fluxo, `MobileClockPort` e `MobileCryptoPort`; sessão, pacote e reserva vêm dos
stores root já validados. Se qualquer dependência estiver ausente, `submit` retorna
`blocked/not-ready` antes de `putDraft`/`putQueueItem`; se a fonte não define a
operação, retorna `blocked/source_pending`. Nunca persiste string vazia,
`source_pending` como identidade nem objeto genérico `{ id, payload }`.
A tabela abaixo é exaustiva para as 58 páginas TEAT habilitadas; D-05 completa as 59 entradas
não-BOAT e segue exclusivamente o estado disabled da §1.2:

| screenIds                                                                                                                                                                  | objeto executável e comportamento mínimo autorizado                                                                                                         |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `auth-login`, `auth-mfa`                                                                                                                                                   | provider STYNX real + `AuthBootstrapCoordinator`; inicia/continua autenticação e, após sessão ativa, executa bootstrap reativo                              |
| `device-blocked`, `shift-context`, `operation-select`, `home`, `shift-summary`                                                                                             | `BootstrapStore`; lê o signal atual e bloqueia quando não `ready`                                                                                           |
| `open-shift`, `close-shift`, `device-handoff`                                                                                                                              | schemas aplicáveis + `MobileBootstrapClient`; valida e envia comando com headers do `CommandContext`                                                        |
| `vehicle-search`, `driver-search`                                                                                                                                          | `OpsSnapshotsClient.externalQuery`; finalidade e parâmetros vêm do formulário, sem consulta nacional direta                                                 |
| `vehicle-result`, `vehicle-divergence`, `driver-result`, `query-failure`                                                                                                   | resultado congelado retornado por `OpsSnapshotsClient`; ausência de snapshot bloqueia                                                                       |
| `ait-start`, `ait-vehicle`, `ait-driver`, `ait-frame`, `ait-frame-detail`, `ait-location`, `ait-notes`, `ait-validations`, `ait-evidence`, `ait-measures`, `ait-signature` | schema quando listado na §3 + `LocalActStore`; valida e persiste draft/evidence versionados, sem enfileirar AIT parcial nem inventar comando remoto ausente |
| `ait-review`                                                                                                                                                               | `aitReviewSchema` + `LocalActStore`; valida o agregado e a ação explícita, finaliza localmente e enfileira uma vez                                          |
| `ait-done`, `ait-shift-detail`                                                                                                                                             | `LocalActStore`; lê draft/receipt do mesmo ato, sem mutação legal                                                                                           |
| `ait-print`                                                                                                                                                                | `PrinterDialog` real conforme §1.2; persiste receipt e evento no mesmo AIT                                                                                  |
| `ait-cancel-request`                                                                                                                                                       | `aitCancelRequestSchema` + `LocalActStore`; persiste/enfileira o tipo correto; quando há `targetAitId`, `AitClient.requestCancel` usa headers condicionais  |
| `measure-start`, `retention`                                                                                                                                               | schema aplicável + `MeasuresClient.startAdministrativeMeasure`/`releaseRetention`, com headers do caller                                                    |
| `removal`, `inventory`, `transshipment`, `measure-term`                                                                                                                    | `measureTermSchema` quando aplicável + `LocalActStore`; persiste medida offline; endpoint remoto elidido continua `source_pending`                          |
| `measure-done`                                                                                                                                                             | `LocalActStore`; lê termo/receipt sem fabricar conclusão remota                                                                                             |
| `alcohol-start`                                                                                                                                                            | `AlcoholClient.startProcedure` com headers do caller                                                                                                        |
| `alcohol-device`, `alcohol-result`, `alcohol-refusal`, `alcohol-signs`, `alcohol-forward`, `alcohol-links`, `alcohol-term`                                                 | schema aplicável + `LocalActStore`; persiste termo/estado offline; comandos remotos elididos continuam `source_pending`                                     |
| `sync`, `sync-item`                                                                                                                                                        | `SyncWorker`/`LocalActStore`; submete ou lê fila/receipt duráveis                                                                                           |
| `sync-conflict`                                                                                                                                                            | `syncConflictSchema` + `OfflineSyncClient.resolveConflict`; somente `field-supervisor` e payload OpenAPI válido                                             |
| `diagnostics`                                                                                                                                                              | `TeatErrorBoundaryState`, `BootstrapStore` e `LocalActStore`; leitura sanitizada, sem export físico inventado                                               |
| `support`, `messages`                                                                                                                                                      | nenhum endpoint está fechado; `submit` devolve `blocked/source_pending` e não faz HTTP                                                                      |
| `approach-no-ait`, `document-check`, `special-inspection`                                                                                                                  | `LocalActStore`; somente estado local previsto pela matriz; operação remota não documentada fica bloqueada                                                  |
| `context-help`                                                                                                                                                             | conteúdo i18n canônico; zero client e zero mutação                                                                                                          |
| `local-settings`                                                                                                                                                           | apenas preferências expressamente fornecidas pelo runtime; persistência/configuração não especificada fica `blocked/source_pending`                         |

A coluna anterior identifica as dependências; a matriz de efeitos abaixo é
igualmente obrigatória e elimina retorno `loaded`/`persisted` sem efeito:

| grupo                                           | efeito de `load`                                                                      | efeito de `submit`/evento                                                                                                             |
| ----------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| entrada auth                                    | lê o signal STYNX e apresenta estado por chave i18n                                   | botão login chama `login()`; init callback aguarda `completeLogin(url)` e depois `coordinator.start()`                                |
| contexto (`device-blocked` até `shift-summary`) | lê `BootstrapStore.state()` e bloqueia fora de `ready`                                | somente transição registrada; abertura/fechamento chama `MobileBootstrapClient` com DTO/headers completos                             |
| consultas                                       | pesquisa chama `OpsSnapshotsClient.externalQuery`; resultados leem snapshot congelado | finalidade/formulário vêm da UI; telas de resultado apenas transitam, sem segunda consulta                                            |
| AIT                                             | lê draft/evidence/pacote/reserva pelo mesmo `localEntityId`                           | valida schema; `ait-review` grava draft `finalized` e `MobileSyncQueueItem<'ait'>` completos; print/cancel usam dialog/client literal |
| medidas                                         | lê agregado/termo/receipt identificado                                                | comandos fechados usam `MeasuresClient`; demais persistem draft/queue completos ou bloqueiam `source_pending`                         |
| alcoolemia                                      | lê procedimento/draft identificado                                                    | `alcohol-start` usa client; demais validam e persistem agregado/queue completos ou bloqueiam comando remoto ausente                   |
| sync/diagnóstico                                | lê cursor, fila, item, receipt e diagnóstico duráveis                                 | `sync` chama worker, conflito chama client com RBAC; export/ação não fechada bloqueia                                                 |
| complementares                                  | lê draft somente com identidade completa; help usa i18n STYNX                         | persiste somente estado expressamente previsto; support/messages/settings e mutação remota ausente bloqueiam sem tocar store/client   |

Cada componente liga esses métodos ao lifecycle/evento real: `ngOnInit` dispara
somente o `load` autorizado; botões/form submit chamam `submit`; o template observa
o signal `idle | loading | loaded | submitting | persisted | blocked | error` e
traduz sua chave com `TeatI18n`. Chamar métodos diretamente em uma instância sem
provar o binding do evento não fecha a página. Em todo efeito local, o objeto
persistido é `MobileEntityDraft`/`MobileSyncQueueItem` integral com sessão,
identidade, pacote, reserva, versão, idempotência, hash e horário do
`CommandContext`; objeto genérico, cast ou campos vazios falham.

O Inspector importa cada componente, aciona `load` ou `submit` e observa pelo menos
um efeito do objeto real (request HTTP, escrita cifrada, transição de sessão ou
negação `source_pending`). Comparar strings `schemaId`/`clientId`, procurar tokens
na fonte ou retornar o próprio contrato não satisfaz o oráculo.

## 3. Form schemas e renderização

O schema local é Zod, serializa apenas o payload aceito pelo cliente respectivo e
não adiciona regra de negócio. Nenhum schema possui campo de tenant, prazo legal,
decisão de mérito ou papel sintetizado. `ait-review` requer ação explícita; pares
medido/considerado e recusa/impossibilidade permanecem estruturalmente distintos.

| arquivo/schema                            | campos obrigatórios                                                                       | campos opcionais | validação de forma                                                                                                                 | gate, transição e comando                                                                    |
| ----------------------------------------- | ----------------------------------------------------------------------------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `data/local/open-shift.schema.ts`         | unidade, equipe, viatura, localização                                                     | operação         | todos os valores vêm do catálogo do bootstrap                                                                                      | `canOpenShift` → `POST mobile-bootstrap/shifts` → `Shift.open`                               |
| `data/local/ait-vehicle.schema.ts`        | placa (proposta/consulta), confirmação visual, divergência                                | `source_pending` | placa Mercosul/antiga; `visually_confirmed_by_agent`                                                                               | `source_pending`                                                                             |
| `data/local/ait-driver.schema.ts`         | condutor (consulta ou manual), `identified_by`, abordagem                                 | `source_pending` | CPF/CNH válidos quando informados                                                                                                  | `source_pending`                                                                             |
| `data/local/ait-frame.schema.ts`          | enquadramento; justificativa obrigatória somente quando `approach_class = caso_3`         | `source_pending` | justificativa proibida/ausente fora de `caso_3`; `required_fields` do enquadramento; `requires_equipment` bloqueia sem instrumento | `source_pending`                                                                             |
| `data/local/ait-location.schema.ts`       | local, UF, município, GPS ou edição manual marcada                                        | `source_pending` | precisão informada                                                                                                                 | `source_pending`                                                                             |
| `data/local/ait-evidence.schema.ts`       | tipo do catálogo, hash                                                                    | `source_pending` | mandatory por enquadramento, por exemplo placa em velocidade (`RN-TEAT-139`)                                                       | `source_pending`                                                                             |
| `data/local/ait-signature.schema.ts`      | resultado ∈ {assinado, recusa, impossibilidade}; motivo por ramo                          | testemunha       | motivo obrigatório em recusa/impossibilidade                                                                                       | `source_pending`                                                                             |
| `data/local/ait-review.schema.ts`         | todas as validações bloqueantes verdes, número reservado, pacote válido                   | `source_pending` | `ValidationPanel` sem bloqueante                                                                                                   | `RASCUNHO_OFFLINE` → **ação explícita** → `FINALIZADO_LOCAL` → `ENFILEIRADO`                 |
| `data/local/ait-cancel-request.schema.ts` | justificativa, destinatário (`traffic-authority` \| `diretoria-fiscalizacao`), base legal | `source_pending` | `origin_status` capturado                                                                                                          | qualquer pós-finalização → item `ait-cancel-posfinal-request` → `SOLICITADO_CANCEL_POSFINAL` |
| `data/local/alcohol-device.schema.ts`     | etilômetro do catálogo com verificação vigente                                            | `source_pending` | bloqueia sem certificado (`RN-TEAT-135`)                                                                                           | `TRIAGEM` → `ETILOMETRO_OFERECIDO`                                                           |
| `data/local/alcohol-result.schema.ts`     | medido, considerado (derivado da tabela), horário                                         | `source_pending` | par; faixa 0,05/0,34 exibida                                                                                                       | `TESTE_REALIZADO` → resultado                                                                |
| `data/local/alcohol-refusal.schema.ts`    | recusa × impossibilidade, descrição, testemunha                                           | `source_pending` | ramos exclusivos                                                                                                                   | recusa → `RECUSA_REGISTRADA`; impossibilidade → `OUTRO_MEIO_PROVA`                           |
| `data/local/measure-term.schema.ts`       | sete campos do caput, quatro do art. 14 §1º, prazos de retirada (dois, OD-T05)            | `source_pending` | assinatura: assinado/recusa/impossibilidade                                                                                        | `REMOVIDO`/`RETIDO` → termo emitido → `measure-done`                                         |
| `data/local/sync-conflict.schema.ts`      | ação ∈ {`manual_review`, `accept_server`, `reject`, `retry_after_correction`}, descrição  | `source_pending` | `source_pending`                                                                                                                   | `open` → `POST sync-conflicts/{id}/resolve` → `resolved`/`rejected`                          |

`source_pending` é literal: a fonte fechada não fornece detalhe adicional, e o
Feature Engineer não pode preenchê-lo por inferência. A tabela acima é a fonte
autossuficiente de implementação para esses 14 schemas.

## 4. Importação fechada das 576 transições

Fonte única: `docs/framework/product/domains/inf/teat/ux-parity/mobile-matrix.json`;
ponteiro JSON: `/transitions`; SHA-256 do arquivo fonte:
`a3175e63c270cff8757953b8a9d7ffe82c69e618b5cec25abf33a0d247d71013`.

`navigation/transitions.ts` importa literalmente os 576 objetos desse ponteiro, na
mesma ordem, preservando em cada objeto `from`, `action`, `to`, `condition`, `type`
e `notes`. Não é permitido resumir, deduplicar, normalizar ou inventar transição.
O import falha se o hash divergir, se `transitions.length !== 576`, se alguma chave
não estiver presente ou se `from`/`to` não corresponderem ao manifesto; `to` igual a
`__previous__` é o único destino virtual e usa `Location.back()`, exceto quando
`from === 'ait-done'`: nesse caso aplica obrigatoriamente a prova de histórico da
§1.2 e nega fail-closed se o destino anterior estiver ausente ou puder reabrir
edição. Assim, cada uma das 576 transições da fonte acima é importada pelo
contrato, não uma aproximação.

## 5. Posse de caminhos: TASK-0011 a TASK-0013

As raízes abaixo são relativas a `apps/teat/mobile/`. Não existe posse implícita
por diretório; cada item é o conjunto fechado do respectivo worker.

| tarefa    | papel            | caminhos graváveis exatos                                                                                                                                                                                                                                       |
| --------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TASK-0011 | Scaffold         | `package.json`, `angular.json`, `eslint.config.js`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.spec.json`, `vitest.config.ts`, `src/test-setup.ts`, `src/main.ts`, `src/index.html`, `src/styles.css`, `src/app/app.component.ts`, `src/app/app.routes.ts` |
| TASK-0012 | Inspector        | todo e somente `src/**/*.spec.ts` e `src/testing/**`; nunca arquivo de produção                                                                                                                                                                                 |
| TASK-0013 | Feature Engineer | somente cada path da allowlist fechada §5.1                                                                                                                                                                                                                     |

O Inspector pode ler, mas não editar, cada caminho de produção. O Feature Engineer
pode ler, mas nunca editar, `src/**/*.spec.ts` nem `src/testing/**`. A posse
sequencial, não concorrente, abrange `src/main.ts`, `src/app/app.component.ts` e
`src/app/app.routes.ts`: TASK-0011 cria o scaffold e, depois de encerrado seu
handoff, TASK-0013 recebe a autoridade exclusiva para completar bootstrap, shell e
mounts lazy. Não há `**` de Scaffold ou Feature e, fora dessa passagem explícita,
os conjuntos não se sobrepõem. `field-shell.component.ts` continua a implementação
de ErrorBoundary/runtime montada por `app.component.ts`.

### 5.1 Allowlist fechada de produção — TASK-0013

Todos os paths desta lista são relativos a `apps/teat/mobile/`; nenhum diretório,
glob ou arquivo implícito é gravável. A coluna `componente` do manifesto contém
71 entradas: 59 paths de entradas não-BOAT distintas — 58 páginas habilitadas e D-05 desligada —
e doze classes boundary no único
path `features/sinistro/sinistro.routes.ts`. Não existe
`features/sinistro/pages/*.page.ts`; os nomes de classe após `#` não criam paths
adicionais. Isso é parte desta allowlist, não autorização por `features/`.

| superfície                     | paths graváveis exatos                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| bootstrap, navegação e guardas | `src/main.ts`; `src/app/app.component.ts`; `src/app/app.routes.ts`; `src/app/core/runtime-config.ts`; `src/app/navigation/transitions.ts`; `src/app/navigation/guards/auth.guard.ts`; `src/app/navigation/guards/tenant.guard.ts`; `src/app/navigation/guards/role.guard.ts`; `src/app/navigation/guards/readiness.guard.ts`; `src/app/navigation/guards/shift.guard.ts`                                                                                                                                                                                                                                                                                                                                                                                                       |
| core e i18n de runtime         | `src/app/core/bootstrap.store.ts`; `src/app/core/readiness-gate.service.ts`; `src/app/core/field-shell.component.ts`; `src/app/core/i18n.service.ts`; `src/app/core/bodycam-indicator.component.ts`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| persistência, sync e normativo | `src/app/data/local/local-act.store.ts`; `src/app/data/sync/sync.worker.ts`; `src/app/data/normative/normative-package.service.ts`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| oito clients unificados        | `src/app/data/api/mobile-bootstrap.client.ts`; `src/app/data/api/ops-snapshots.client.ts`; `src/app/data/api/offline-sync.client.ts`; `src/app/data/api/ait.client.ts`; `src/app/data/api/measures.client.ts`; `src/app/data/api/alcohol.client.ts`; `src/app/data/api/normative.client.ts`; `src/app/data/api/provisioning.client.ts`                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| oito módulos lazy              | `src/app/features/turno/turno.routes.ts`; `src/app/features/consultas/consultas.routes.ts`; `src/app/features/ait/ait.routes.ts`; `src/app/features/medidas/medidas.routes.ts`; `src/app/features/alcoolemia/alcoolemia.routes.ts`; `src/app/features/sinistro/sinistro.routes.ts`; `src/app/features/sincronizacao/sincronizacao.routes.ts`; `src/app/features/complementares/complementares.routes.ts`                                                                                                                                                                                                                                                                                                                                                                       |
| shared de campo                | `src/app/shared/mobile-page.component.ts`; `src/app/shared/mobile-printer.port.ts`; `src/app/shared/paired-value.component.ts`; `src/app/shared/closed-enum-picker.component.ts`; `src/app/shared/proposed-value-field.component.ts`; `src/app/shared/outcome-selector.component.ts`; `src/app/shared/evidence-capture.component.ts`; `src/app/shared/signature-capture.component.ts`; `src/app/shared/location-field.component.ts`; `src/app/shared/framing-picker.component.ts`; `src/app/shared/validation-panel.component.ts`; `src/app/shared/printer-dialog.component.ts`; `src/app/shared/queue-item-card.component.ts`; `src/app/shared/conflict-resolver.component.ts`; `src/app/shared/device-handoff-form.component.ts`; `src/app/shared/term-preview.component.ts` |
| catálogo de runtime            | `src/app/i18n/teat.pt-BR.json`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| schemas locais                 | os 14 paths completos da primeira coluna da tabela §3                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| entradas não-BOAT              | os 59 paths completos da coluna `componente` do manifesto §2, sem `#Component`: 58 páginas TEAT habilitadas e D-05 desligada; as doze classes BOAT pertencem ao path já listado `src/app/features/sinistro/sinistro.routes.ts`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |

O handoff do Scaffold para o Feature Engineer transfere explicitamente
`src/main.ts`, `src/app/app.component.ts` e `src/app/app.routes.ts`; nenhuma outra
configuração é recebida. O Feature Engineer não recebe teste, `src/testing/`
ou qualquer path não listado. Mesmo um arquivo exigido para concluir uma feature
é negado até ser incluído por alteração arquitetural explícita.

As APIs §1.2 não autorizam arquivo adicional: `BootstrapStore` fica em
`core/bootstrap.store.ts`; `GuardContext` nos cinco arquivos de guardas;
`LocalActStore`, `SyncWorker` e `NormativePackageService` nos três paths da linha
de persistência; `dispatchTransition` em `navigation/transitions.ts`; `FieldShell`
e os handlers em `core/field-shell.component.ts`; o binding da
`MobilePrinterPort` STYNX e `PrinterDialog` nos shared; `BodycamIndicator` e sua
porta em core; `TeatI18n` em `core/i18n.service.ts`; e
`BoatExtensionPort` em `features/sinistro/sinistro.routes.ts`. Portanto toda
classe/interface pública necessária já pertence a path da allowlist.

## 6. Oráculos obrigatórios para implementação

1. O manifesto contém exatamente 71 linhas de rota; S-12 usa `source_pending` e
   `IU-BOAT-S-12.md`, sem UX-MOB-071; D-01
   é `source_pending`, D-04 é `D-04` e D-05 é `D-05` desligada.
2. O oráculo cartesiano é `for each route × TEAT_STAFF_ROLES`: permitir somente
   `allowedRoles` da linha e negar todos os omitidos; em `sync-conflict`, o
   `field-agent` é negado pela precedência arquitetural registrada na seção 1.
3. O teste de paridade lê a fonte fechada do §4, confirma hash, cardinalidade 576,
   igualdade ordenada e alcance de todo destino concreto registrado; BOAT continua
   extensão e não é removido da matriz.
4. A prova de entrada navega para `/auth-login` sem contexto TEAT, clica o controle
   real e observa `login()`. Em seguida navega pelo callback configurado
   `/auth-mfa`, prova pelo lifecycle que `completeLogin(url)` resolve antes de
   qualquer bootstrap, ativa sessão/tenant/mobile-session no mesmo injector,
   observa `GET mobile-bootstrap` + `GET provisioning/.../readiness` e a navegação
   `ready` para `home` ou `shift-context`; resposta blocked navega para
   `device-blocked`. Logout/expiração limpa automaticamente e volta a negar sem
   chamar `clearOnSessionEnd()` pelo teste nem reconstruir injector. Nenhum mock
   pode instalar `TEAT_GUARD_CONTEXT` pronto nesse teste.
5. Readiness vem da resposta de provisionamento/bootstrap e é decidido uma única
   vez por `ReadinessGateService`; o teste injeta um spy nesse serviço e comprova
   que `readinessGuard` usa exatamente seu resultado. Warnings são mostrados e
   registrados no `TeatErrorBoundaryState` pelo warning sink root, blockers impedem
   a rota. O teste cobre `snapshot.validUntil` futuro, ausente, inválido e expirado,
   separadamente de `normativePackage.validUntil`, e rejeita sink no-op. Nada
   transforma `source_pending` em valor nem muda H.39, H.54 ou H.55.
6. Para cada guarda efetivo, o Inspector prova uma entrada válida que permite e
   uma entrada ausente/inválida que nega. Para `roleGuard`, executa o cartesiano da
   regra 2; helper não usado pelo guarda não satisfaz. Para `B+S`, comprova a ordem.
7. Os oito clients são resolvidos do injector root. `HttpTestingController` prova
   request e response tipados reais, inclusive `If-Match` nas quatro operações AIT,
   ramo condicional de cancelamento, headers normativo/impressão/provisioning e
   propagação do mesmo `StynxError`. Double com assinatura menor que o client real
   falha em typecheck. URL fora de `/v1/inf/` ou `/v1/ops/`, sucesso fabricado ou
   chamada nacional falha.
8. O oráculo sync importa os tipos gerados, começa também sem cursor, comprova que
   o primeiro cursor `{ uuid('sync-batch'), 1 }` foi persistido antes do POST,
   reinicia o store, executa o worker e compara o body completo ao `SubmitSyncBatchDto`:
   três identidades, `device_batch_id`, sequência e item snake_case. Responde com
   envelope `{ batchId, batch_sequence, accepted_items, receipts, warnings? }`,
   prova persistência parcial, retry com mesmo UUID/sequência após erro e avanço
   atômico para novo batch após 200. Recovery prova o mapeamento snake_case completo,
   persiste o receipt e converte somente 404 + `TEAT.SYNC_RECEIPT_NOT_FOUND` em
   ausência; outro 404 e qualquer erro propagam. Array nu de receipts, `bootstrap`
   no body, `Map` ou campos camelCase no wire falham.
9. O oráculo offline usa o adapter IndexedDB/WebCrypto de produção, fecha sua
   instância, abre outra sobre o mesmo banco e chave não exportável entre escrita e
   leitura e comprova separadamente `draft`, `queue`, `evidence`, `reservation`,
   `package`, `print-receipt`, `sync-receipt` e `sync-cursor`. Para cada coleção,
   verifica identidade/hash/versão. Para cada `put*` repete valor idêntico e prova
   no-op; depois tenta mesma chave com identidade/hash/idempotência/status divergente,
   exige `local-store-identity-conflict` e relê bytes/valor anterior intactos. O
   teste inspeciona o registro IndexedDB e comprova que payload não está em texto
   claro; fixture em memória não fecha este oráculo.
10. O oráculo normativo usa `NormativeClient` com assinatura real: conteúdo
    `{ manifest, manifest_hash, signature }`, validação com
    `{ package_version, manifest_hash }` e `CommandHeaders`. Cobre válido, ausente,
    hash divergente, `valid:false`, reinício e expirado; somente o primeiro é
    utilizável, expirado registra warning sem bloquear.
11. Para os oito módulos, a prova carrega a rota lazy e instancia cada componente.
    Para cada linha das duas tabelas da §2.1, dispara `ngOnInit` e o evento real de
    UI, observa transições do signal e o request HTTP, escrita cifrada de
    `MobileEntityDraft`/`MobileSyncQueueItem` completo, sessão ou negação
    `source_pending` correspondente. Também remove, um por vez, sessão, pacote,
    reserva, identidade, idempotência, versão, horário e hash e prova que nenhum
    store/client é chamado. String de client/schema, objeto genérico `{ id,
payload }`, cast, retorno de metadata e busca textual não passam. Cada texto
    observado vem do provider STYNX; ausência dele falha, sem translator ad hoc.
12. O oráculo da ErrorBoundary provoca erro conhecido/desconhecido por ação, erro
    real de componente e `NavigationError`; comprova que o mesmo estado root chega
    ao `FieldShell`, com classificação, chave i18n, contexto sanitizado e alerta
    acessível. Invocar `capture` diretamente como única prova não passa.
13. Para os 14 schemas, há prova negativa por validação expressa na seção 3 e prova
    de que nenhum adapter/store é chamado ao falhar. `source_pending` não vira
    validação permissiva nem valor inventado.
14. O oráculo de impressão resolve `MobilePrinterPort`, `AitClient` e store pelo
    injector de produção; prova input STYNX exato, receipt durável, `If-Match`,
    idempotência distinta por tentativa, sucesso/falha e reimpressão do mesmo AIT.
    O de bodycam altera o signal do adapter pelos três estados e prova ausência de
    conteúdo; constante `failure` não passa.
15. D-05 prova ausência estrutural e dinâmica de `loadComponent`, `loadChildren`,
    resolver, import e client. BOAT prova extensão ausente/presente/rejeitada
    através dos cinco guardas e da ErrorBoundary real: ausência/rejeição não chama
    loader local, não redireciona a D-05 e preserva URL segura; presença carrega
    somente o componente externo. Enquanto a chave acessível permanece
    `source_pending`, o teste de apresentação continua RED/blocked; `TEAT.INTERNAL`,
    container vazio, literal ou placeholder não contam como verde.
16. Esses oráculos são provas de comportamento das superfícies efetivas, não testes
    de existência de classe, arquivo, array, metadata, regex de fonte ou helper
    isolado.
