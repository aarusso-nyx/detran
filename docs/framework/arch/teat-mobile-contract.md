---
id: ARCH-TEAT-MOBILE-CONTRACT
title: Contrato executável do aplicativo móvel TEAT
status: draft
apps: [teat]
updated: 2026-09-22
---

# Contrato executável do aplicativo móvel TEAT

Papel: Architect.

Este contrato é a fronteira para os workers de implementação. Ele não cria regra
de produto: transpõe a matriz de paridade, as folhas IU, o catálogo de parâmetros,
o contrato de rota e o contrato de provisionamento fechados nesta rodada.

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
- Ordem imutável de guardas: `authGuard`, `tenantGuard`, `roleGuard`,
  `readinessGuard` quando a rota exige bootstrap, depois `shiftGuard` quando
  exige turno. `readinessGuard` verifica sessão exclusiva e postura/homologação
  antes do pacote normativo e da reserva de numeração quando o destino cria ato
  legal. A homologação expirada é `warn-and-record` (H.55), não bloqueio; pacote
  ausente bloqueia. Nenhum prazo legal ou decisão de mérito é calculado no cliente.
- `traffic-authority` é a autoridade canônica de H.39. `decision_body` é dado
  recebido, nunca uma substituição de papel calculada pelo cliente. Defaults H.54
  são vigentes; `sync.concurrency_window_minutes` permanece `source_pending`.
- D-05 é rota registrada com `featureEnabled: false`; exibe indisponibilidade e
  não carrega feature. As onze rotas `crash-*` são pontos de extensão BOAT: têm
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

1. **Guardas e contexto.** Os cinco `CanMatchFn` efetivos são os únicos guardas:
   `authGuard` exige principal STYNX autenticado; `tenantGuard`, contexto de tenant;
   `roleGuard`, o resultado do oráculo da seção 6; `readinessGuard`, um snapshot
   válido de readiness; e `shiftGuard`, turno aberto. Cada um devolve negação sem
   estado verificável, inclusive principal ausente, tenant ausente, papel omitido,
   bootstrap ausente/expirado, blocker presente ou turno não aberto. A sequência
   nunca é abreviada e `roleGuard` chama o oráculo cartesiano efetivo, não cópia ou
   helper isolado.
2. **Adapters de backend.** Os oito clients são adapters tipados sobre `HttpClient`
   ou cliente gerado para o backend unificado e só constroem rotas `/v1/inf/*` e
   `/v1/ops/*` do contrato de rotas. Comandos POST preservam `Idempotency-Key`;
   precondições preservam `If-Match`; resposta, status e código `StynxError` são
   retornados ao chamador sem `catch` que os converta em sucesso. Nenhum adapter
   chama sistema nacional, URL nacional, mock nem dados locais como resposta remota.
3. **Persistência e sincronização.** `LocalActStore` usa
   `MobileEncryptedStorePort` e persiste por agregado `draft`, `queue`, `evidence`,
   `reservation`, `package` e `print-receipt`. Toda escrita local recebe versão,
   `idempotency_key`, `payload_hash` e item `SyncQueueItem`; armazenamento em
   memória/planilha/`localStorage` simples é proibido. `SyncWorker` lê somente a
   fila persistida, submete `SubmitSyncBatchDto` com `device_batch_id`,
   `batch_sequence` e os itens contratuais, grava o recibo por item (`received` →
   `applied`) e recupera por idempotência. Falha fica no item com código canônico;
   jamais apaga ato, duplica comando ou bloqueia nova lavratura por si só.
4. **Pacote normativo.** `NormativePackageService` baixa apenas metadata/conteúdo
   do backend, valida o conteúdo pelo `manifest_hash` e só torna o pacote utilizável
   depois de persistido cifradamente. Pacote ausente, hash divergente ou conteúdo
   não verificável produz blocker; pacote expirado produz warning registrado e não
   bloqueia (H.55). `validUntil` exige nova avaliação; não há valor default para
   `source_pending` nem cálculo de prazo legal local.
5. **Telas, módulos e i18n.** Os oito módulos lazy exportam as rotas de suas
   linhas do manifesto e cada uma instancia o componente daquela linha, nunca um
   alias ou placeholder comum. A página consome sua folha fonte, schema e client
   aplicáveis. Todo texto visível, inclusive fallback, erro e estado indisponível,
   passa pelo runtime STYNX de i18n com as chaves permitidas da seção 1; texto
   literal no template ou componente falha. O catálogo é carregado em runtime, não
   somente copiado para o app.
6. **FieldShell e falhas.** `FieldShell` é a única ErrorBoundary da aplicação:
   captura erro de rota/ação, preserva somente código, status e contexto de tokens,
   classifica `StynxError` pelo catálogo TEAT e mostra a chave canônica de erro. Erro
   de formulário fica inline; blocker de postura/sessão abre o fluxo de dispositivo;
   erro de fila fica no `QueueItemCard`; erro desconhecido é `TEAT.INTERNAL`. A
   ocorrência é registrada no estado diagnóstico local sem segredo ou payload de
   ato. A boundary não pode relançar silenciosamente, apresentar texto literal nem
   transformar erro em êxito.
7. **Readiness.** `ReadinessGateService` deriva `allowed`, `blockers`, `warnings`
   e `validUntil` da resposta tipada de bootstrap/provisionamento: sessão exclusiva,
   postura/autorização do dispositivo, homologação, pacote, reserva de numeração e
   turno. A rota legal só abre se não houver blocker e todos os requisitos do seu
   destino estiverem presentes; warnings são exibidos e registrados. A decisão de
   homologação expirada mantém o ato possível, mas não mascara bloqueadores reais.
8. **Transições.** Além da igualdade content-addressed da seção 4, o executor
   despacha cada transição pelo par `from`/`action`, exige condição satisfeita e
   navega ao `to` registrado. Somente `__previous__` chama `Location.back()`;
   depois de `ait-done`, a ação de retorno não pode reabrir edição do ato. Destino,
   ação ou condição ausente nega a navegação.
9. **Forms, impressora e bodycam.** Os 14 schemas executam todas as proibições e
   validações da seção 3 antes de chamar client; prova negativa deve demonstrar que
   payload inválido não produz comando. A porta de produção de impressão usa
   `MobilePrinterPort`, registra sucesso/falha em `print-events` sem duplicar AIT e
   preserva o mesmo número na reimpressão controlada. `BodycamIndicator` é chrome
   global em serviço operacional com estados gravando, pausa excepcional e falha;
   conteúdo de bodycam não é exposto pelo app sem o fluxo de custódia autorizado.
   `FixturePrinter` e doubles são somente adapters de teste, nunca runtime.
10. **D-05 e BOAT.** D-05 permanece rota acessível, registrada e disabled: ela
    mostra estado de indisponibilidade, não carrega feature nem envia comando. Cada
    `crash-*` é resolvido pela extensão BOAT; sem extensão instalada o atalho não
    aparece e navegação direta nega/faz fallback explícito, nunca renderiza
    placeholder TEAT. A fonte não fornece a chave i18n do fallback/indisponibilidade;
    essa chave permanece `source_pending`, mas não autoriza texto literal.

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
    validUntil: string;
    maxAgeSeconds: number;
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
    activeShift?: Readonly<{ id: string; status: string }>;
    session: Readonly<{ id: string; startedAt: string; exclusive: boolean }>;
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

interface BootstrapStore {
  snapshot(): BootstrapSnapshot | undefined;
  refresh(input: MobileBootstrapQuery): Promise<BootstrapSnapshot>;
  clear(): void;
}

interface GuardContext {
  principal: Principal | undefined;
  tenantId: string | undefined;
  allowedRoles: readonly DetranRole[];
  bootstrap: BootstrapSnapshot | undefined;
  provisioning: ProvisioningReadinessResponse | undefined;
}
```

`authGuard` injeta a sessão STYNX e lê `principal`; `tenantGuard` lê `tenantId`;
`roleGuard` lê `principal.roles` e `allowedRoles`; `readinessGuard` lê
`bootstrap`, `provisioning`, `blockers` e `validUntil`; `shiftGuard` lê
`bootstrap.context.activeShift`. Cada `CanMatchFn` recebe `GuardContext` via
providers/injeção e retorna `boolean | UrlTree`: `true` somente quando sua própria
prova é positiva; ausência de fixture/estado devolve `false` ou `UrlTree` de
negação. Nenhum guarda consulta `localStorage`, assume `true` ou recupera estado de
outro guarda.

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

#### Oito clients de backend unificado

Todos retornam `Promise<T>` e rejeitam com o `StynxError` recebido. `headers` é
`Readonly<{ 'Idempotency-Key'?: string; 'If-Match'?: string }>`; quando a linha diz
ambos, ambos são obrigatórios. Caminho `source_pending` significa que o client deve
expor `unsupported(): Promise<never>` e rejeitar, não construir uma URL por analogia.

| client                  | método público                                                                                                                                     | verbo e path literal                                                                                                                                                                                        | input/headers                                                                                                                                                                                | retorno/erro                                                                                                                                                                                             |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `MobileBootstrapClient` | `getBootstrap`, `openShift`, `closeShift`, `handoffSession`                                                                                        | `GET /v1/ops/mobile-bootstrap`; `POST /v1/ops/mobile-bootstrap/shifts`; `POST /v1/ops/mobile-bootstrap/shifts/{id}/close`; `POST /v1/ops/mobile-bootstrap/sessions/handoff`                                 | `MobileBootstrapQuery`; `OpenMobileShiftDto` + `device_id`; `CloseMobileShiftDto`; `{ failed_device_id, reason, new_device_id?, location_json? }`; `Idempotency-Key` em cada POST de comando | `BootstrapSnapshot`; `Shift`; `Shift`; encerramento de sessão; `StynxError`                                                                                                                              |
| `OpsSnapshotsClient`    | `externalQuery`                                                                                                                                    | `POST /v1/ops/snapshots/external-queries`                                                                                                                                                                   | `{ query_type: vehicle_by_plate\|driver_by_cpf\|driver_by_license, parameters, purpose }`; sem header adicional declarado                                                                    | snapshot congelado `{ snapshot_id, source, queried_at, result, divergence_recorded }`; `TEAT.QUERY_UPSTREAM_UNAVAILABLE` ou `TEAT.QUERY_NOT_FOUND`                                                       |
| `OfflineSyncClient`     | `submitBatch`, `receiptByIdempotency`, `resolveConflict`                                                                                           | `POST /v1/ops/offline-sync/sync-batches`; `GET /v1/ops/offline-sync/receipts/{tenantId}/by-idempotency/{key}`; `POST /v1/ops/offline-sync/sync-conflicts/{id}/resolve`                                      | `SubmitSyncBatchDto`; ids de path; `ResolveSyncConflictDto`; headers não declarados no contrato                                                                                              | batch/receipts; recibo durável; `resolved\|rejected`; `StynxError`                                                                                                                                       |
| `AitClient`             | `finalize`, `recordScience`, `recordPrintEvent`, `queueTransmission`, `requestCancel`                                                              | `POST /v1/inf/ait/aits/{id}/finalize`; `POST /v1/inf/ait/aits/{id}/science`; `POST /v1/inf/ait/aits/{id}/print-events`; `POST /v1/inf/ait/aits/{id}/queue-transmission`; `POST /v1/inf/ait/cancel-requests` | DTOs homônimos do contrato; `CreateAitCancelRequestDto`; `Idempotency-Key` para POST de comando                                                                                              | estados/efeitos literais do §3.2; `StynxError`                                                                                                                                                           |
| `MeasuresClient`        | `startAdministrativeMeasure`, `releaseRetention`, `unsupported`                                                                                    | `POST /v1/inf/measures/administrative-measures/{id}/start`; `POST /v1/inf/measures/retentions/{id}/release`; demais caminhos elididos em §6 são `source_pending`                                            | `StartMeasureCommandDto`; `ReleaseRetentionCommandDto`; `Idempotency-Key` para comando                                                                                                       | `started`; `LIBERADO_*\|REGULARIZADO`; `unsupported(): Promise<never>` rejeita                                                                                                                           |
| `AlcoholClient`         | `startProcedure`, `unsupported`                                                                                                                    | `POST /v1/inf/alcohol/procedures/{id}/start`; caminhos com `…` em §6 são `source_pending`                                                                                                                   | `StartAlcoholProcedureCommandDto`; `Idempotency-Key` para comando                                                                                                                            | `TRIAGEM`; `unsupported(): Promise<never>` rejeita                                                                                                                                                       |
| `NormativeClient`       | `syncMetadata`, `packageContent`, `validatePackage`                                                                                                | `GET /v1/inf/normative/mobile-packages/sync-metadata`; `GET /v1/inf/normative/mobile-packages/{id}/content`; `POST /v1/inf/normative/mobile-packages/{id}/validate`                                         | package id; `ValidateMobileNormativePackageCommandDto`; `Idempotency-Key` para comando                                                                                                       | metadata; conteúdo assinado; `VALIDADO_PKG`; `StynxError`                                                                                                                                                |
| `ProvisioningClient`    | `createKeyChallenge`, `registerDeviceKey`, `issuePackage`, `downloadPackageContent`, `recordReceipt`, `readiness`, `revokeGrant`, `reconcileGrant` | os oito paths e verbos literais de `BP-OPS-PROVISIONING-001.commands.openapi.json`                                                                                                                          | requests do OpenAPI; `If-Match` + `Idempotency-Key` em todos os POST exceto `createKeyChallenge` que exige somente `Idempotency-Key`; GET sem esses headers                                  | responses nomeadas pelo OpenAPI; `TEAT.AUTH_REQUIRED`, `TEAT.FORBIDDEN_ACTION`, `TEAT.IF_MATCH_REQUIRED`, `TEAT.VERSION_CONFLICT`, `TEAT.IDEMPOTENCY_REPLAY`, `TEAT.VALIDATION_FAILED` conforme operação |

Para `ProvisioningClient`, os oito pares método/path são:
`createKeyChallenge(deviceId)` → `POST /v1/ops/provisioning/devices/{deviceId}/key-challenges`;
`registerDeviceKey(deviceId)` → `POST /v1/ops/provisioning/devices/{deviceId}/keys`;
`issuePackage()` → `POST /v1/ops/provisioning/packages`;
`downloadPackageContent(id)` → `GET /v1/ops/provisioning/packages/{id}/content`;
`recordReceipt(id)` → `POST /v1/ops/provisioning/packages/{id}/receipts`;
`readiness(deviceId)` → `GET /v1/ops/provisioning/devices/{deviceId}/readiness`;
`revokeGrant(id)` → `POST /v1/ops/provisioning/grants/{id}/revoke`; e
`reconcileGrant(id)` → `POST /v1/ops/provisioning/grants/{id}/reconcile`.

#### LocalActStore, SyncWorker e pacote normativo

```ts
type QueueReceiptStatus = 'received' | 'applied' | 'conflict' | 'rejected';
type LocalEntityType =
  | 'ait'
  | 'administrative-measure'
  | 'alcohol-signs-term'
  | 'ait-cancel-request'
  | 'ait-cancel-posfinal-request';
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

interface LocalActStore {
  put(act: LocalAct): Promise<void>;
  get(localEntityId: string): Promise<LocalAct | undefined>;
  pending(): Promise<readonly LocalAct[]>;
  applyReceipts(receipts: readonly QueueReceipt[]): Promise<void>;
  receiptByIdempotency(key: string): Promise<QueueReceipt | undefined>;
}
interface SyncWorker {
  submitNext(): Promise<readonly QueueReceipt[]>;
  recoverReceipt(
    tenantId: string,
    idempotencyKey: string,
  ): Promise<QueueReceipt | undefined>;
}
type InstalledNormativePackage = Readonly<{
  id: string;
  manifestHash: string;
  validUntil: string;
  content: unknown;
}>;
interface NormativePackageService {
  install(id: string): Promise<InstalledNormativePackage>;
  usable(now: string): Promise<InstalledNormativePackage | undefined>;
  revalidate(now: string): Promise<'usable' | 'warning-expired' | 'blocked'>;
}
```

`put` é atômico no store cifrado e não aceita `localEntityId` já persistido com
payload/hash/idempotência distintos. `submitNext` retorna somente receipts do
servidor e chama `applyReceipts` antes de concluir; receipt parcial não muda itens
ausentes. `recoverReceipt` usa o path literal do `OfflineSyncClient`, e retry usa o
mesmo `device_batch_id`/sequência recuperáveis do item persistido; se esses valores
não existirem, rejeita. `install` só resolve após conteúdo e `manifestHash`
conferirem; `usable` devolve `undefined` para ausência/divergência; `revalidate`
devolve `warning-expired` para expiração H.55 e `blocked` para qualquer outro
blocker. A representação de bytes/assinatura do envelope é `source_pending` e não
pode ser simulada como verificada.

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
        | 'unregistered-destination';
    }>;
interface TransitionDispatcher {
  dispatchTransition(
    input: Readonly<{
      from: string;
      action: string;
      conditionSatisfied: boolean;
    }>,
  ): Promise<DispatchResult>;
}
type DiagnosticEntry = Readonly<{
  code: string;
  status?: number;
  context: Readonly<Record<string, string>>;
  source: 'route' | 'action';
  occurredAt: string;
}>;
interface MobileErrorBoundary {
  capture(error: unknown, source: DiagnosticEntry['source']): DiagnosticEntry;
  diagnostics(): readonly DiagnosticEntry[];
}
```

`dispatchTransition` pesquisa a lista hash-validada da seção 4 pelo par exato
`from`/`action`; condição não vazia exige `conditionSatisfied`. Para destino
registrado chama `Router.navigateByUrl('/' + to)` e retorna `navigated`; somente
`to === '__previous__'` chama `Location.back()` e retorna `back`. Não encontrar
linha/destino/condição devolve `denied` sem chamar Router ou Location. `capture`
no `FieldShell` mapeia `StynxError` conhecido para o código TEAT recebido, converte
desconhecido em `TEAT.INTERNAL`, remove valores que não sejam tokens de contexto e
acrescenta entrada diagnóstica; não lança, não retorna sucesso e não serializa
payload de ato. A persistência/exportação física de `DiagnosticEntry` é
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
interface MobilePrinterPort {
  print(aitId: string): Promise<PrintResult>;
}
type BodycamState = 'recording' | 'paused-exception' | 'failure';
interface BodycamIndicator {
  state(): BodycamState;
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
```

`PrinterDialog` chama `MobilePrinterPort.print`, depois
`AitClient.recordPrintEvent`; êxito e falha conservam o `aitId`/numeração e a
falha produz `failure_reason`, sem criar outro AIT. `FixturePrinter` não satisfaz
`MobilePrinterPort` de produção. `BodycamIndicator.state()` sempre retorna um dos
três estados e não oferece método de ler conteúdo; esse conteúdo só usa a entrega
de custódia registrada. Cada módulo expõe `Routes` não vazio contendo exatamente
as linhas de seu grupo do manifesto e cada página expõe componente standalone
distinto. `TeatI18n.translate` rejeita chave fora dos namespaces autorizados e
nenhum componente exibe literal. Para D-05, o módulo AIT expõe a rota com
`featureEnabled: false` e retorna estado disabled sem invocar client. Para BOAT,
`installed() === false` impede o atalho e `load` não é chamado; navegação direta
recebe negação/fallback sem placeholder. A chave de texto para esses dois estados é
`source_pending`, por isso o Inspector prova o estado e a ausência de literal, não
uma frase ou chave inventada.

## 2. Manifesto de 70 rotas

`allowedRoles` é o conjunto completo permitido em cada linha; todos os demais
papéis canônicos de `TEAT_STAFF_ROLES` são negados. `R` significa somente
`auth, tenant, role`; `B` acrescenta `readiness`; `S` acrescenta `shift` (logo,
`B+S` preserva a ordem da seção 1). Caminho de componente é também a posse de
produção do Feature Engineer.

| rota                     | uxCode           | folha fonte                        | guardas       | allowedRoles                      | componente                                                                                |
| ------------------------ | ---------------- | ---------------------------------- | ------------- | --------------------------------- | ----------------------------------------------------------------------------------------- |
| `/auth-login`            | `UX-MOB-001`     | `IU-TEAT-auth-login.md`            | R             | `field-agent`, `field-supervisor` | `features/turno/pages/auth-login.page.ts#AuthLoginPageComponent`                          |
| `/auth-mfa`              | `UX-MOB-002`     | `IU-TEAT-auth-mfa.md`              | R             | `field-agent`, `field-supervisor` | `features/turno/pages/auth-mfa.page.ts#AuthMfaPageComponent`                              |
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
| `/crash-start`           | `UX-MOB-060`     | `IU-TEAT-crash-start.md`           | B+S, BOAT     | `field-agent`, `field-supervisor` | `features/sinistro/pages/crash-start.page.ts#CrashStartPageComponent`                     |
| `/crash-location`        | `UX-MOB-061`     | `IU-TEAT-crash-location.md`        | B+S, BOAT     | `field-agent`, `field-supervisor` | `features/sinistro/pages/crash-location.page.ts#CrashLocationPageComponent`               |
| `/crash-conditions`      | `UX-MOB-062`     | `IU-TEAT-crash-conditions.md`      | B+S, BOAT     | `field-agent`, `field-supervisor` | `features/sinistro/pages/crash-conditions.page.ts#CrashConditionsPageComponent`           |
| `/crash-vehicles`        | `UX-MOB-063`     | `IU-TEAT-crash-vehicles.md`        | B+S, BOAT     | `field-agent`, `field-supervisor` | `features/sinistro/pages/crash-vehicles.page.ts#CrashVehiclesPageComponent`               |
| `/crash-people`          | `UX-MOB-064`     | `IU-TEAT-crash-people.md`          | B+S, BOAT     | `field-agent`, `field-supervisor` | `features/sinistro/pages/crash-people.page.ts#CrashPeoplePageComponent`                   |
| `/crash-victims`         | `UX-MOB-065`     | `IU-TEAT-crash-victims.md`         | B+S, BOAT     | `field-agent`, `field-supervisor` | `features/sinistro/pages/crash-victims.page.ts#CrashVictimsPageComponent`                 |
| `/crash-dynamics`        | `UX-MOB-066`     | `IU-TEAT-crash-dynamics.md`        | B+S, BOAT     | `field-agent`, `field-supervisor` | `features/sinistro/pages/crash-dynamics.page.ts#CrashDynamicsPageComponent`               |
| `/crash-sketch`          | `UX-MOB-067`     | `IU-TEAT-crash-sketch.md`          | B+S, BOAT     | `field-agent`, `field-supervisor` | `features/sinistro/pages/crash-sketch.page.ts#CrashSketchPageComponent`                   |
| `/crash-evidence`        | `UX-MOB-068`     | `IU-TEAT-crash-evidence.md`        | B+S, BOAT     | `field-agent`, `field-supervisor` | `features/sinistro/pages/crash-evidence.page.ts#CrashEvidencePageComponent`               |
| `/crash-ait-links`       | `UX-MOB-069`     | `IU-TEAT-crash-ait-links.md`       | B+S, BOAT     | `field-agent`, `field-supervisor` | `features/sinistro/pages/crash-ait-links.page.ts#CrashAitLinksPageComponent`              |
| `/crash-review`          | `UX-MOB-070`     | `IU-TEAT-crash-review.md`          | B+S, BOAT     | `field-agent`, `field-supervisor` | `features/sinistro/pages/crash-review.page.ts#CrashReviewPageComponent`                   |
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
`__previous__` é o único destino virtual e usa `Location.back()`. Assim, cada uma
das 576 transições da fonte acima é importada pelo contrato, não uma aproximação.

## 5. Posse de caminhos: TASK-0011 a TASK-0013

As raízes abaixo são relativas a `apps/teat/mobile/`. Não existe posse implícita
por diretório; cada item é o conjunto fechado do respectivo worker.

| tarefa    | papel            | caminhos graváveis exatos                                                                                                                                                                                                                                       |
| --------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TASK-0011 | Scaffold         | `package.json`, `angular.json`, `eslint.config.js`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.spec.json`, `vitest.config.ts`, `src/test-setup.ts`, `src/main.ts`, `src/index.html`, `src/styles.css`, `src/app/app.component.ts`, `src/app/app.routes.ts` |
| TASK-0012 | Inspector        | todo e somente `src/**/*.spec.ts` e `src/testing/**`; nunca arquivo de produção                                                                                                                                                                                 |
| TASK-0013 | Feature Engineer | somente cada path da allowlist fechada §5.1                                                                                                                                                                                                                     |

O Inspector pode ler, mas não editar, cada caminho de produção. O Feature Engineer
pode ler, mas nunca editar, `src/**/*.spec.ts` nem `src/testing/**`. A única posse
sequencial, não concorrente, é `src/app/app.routes.ts`: TASK-0011 cria o shell vazio;
depois de encerrado seu handoff, TASK-0013 recebe a única autoridade para preencher
as rotas. Não há `**` de Scaffold ou Feature e, fora dessa passagem explícita de
hand-off, os conjuntos não se sobrepõem. `app.component.ts` é somente shell vazio;
`field-shell.component.ts` é a implementação de runtime do Feature Engineer.

### 5.1 Allowlist fechada de produção — TASK-0013

Todos os paths desta lista são relativos a `apps/teat/mobile/`; nenhum diretório,
glob ou arquivo implícito é gravável. Os 70 paths de páginas são exatamente a
coluna `componente` do manifesto, sem o sufixo `#Component`; isso é parte desta
allowlist, não uma autorização por `features/`.

| superfície                     | paths graváveis exatos                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| bootstrap, navegação e guardas | `src/app/app.routes.ts`; `src/app/navigation/transitions.ts`; `src/app/navigation/guards/auth.guard.ts`; `src/app/navigation/guards/tenant.guard.ts`; `src/app/navigation/guards/role.guard.ts`; `src/app/navigation/guards/readiness.guard.ts`; `src/app/navigation/guards/shift.guard.ts`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| core e i18n de runtime         | `src/app/core/bootstrap.store.ts`; `src/app/core/readiness-gate.service.ts`; `src/app/core/field-shell.component.ts`; `src/app/core/i18n.service.ts`; `src/app/core/bodycam-indicator.component.ts`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| persistência, sync e normativo | `src/app/data/local/local-act.store.ts`; `src/app/data/sync/sync.worker.ts`; `src/app/data/normative/normative-package.service.ts`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| oito clients unificados        | `src/app/data/api/mobile-bootstrap.client.ts`; `src/app/data/api/ops-snapshots.client.ts`; `src/app/data/api/offline-sync.client.ts`; `src/app/data/api/ait.client.ts`; `src/app/data/api/measures.client.ts`; `src/app/data/api/alcohol.client.ts`; `src/app/data/api/normative.client.ts`; `src/app/data/api/provisioning.client.ts`                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| oito módulos lazy              | `src/app/features/turno/turno.routes.ts`; `src/app/features/consultas/consultas.routes.ts`; `src/app/features/ait/ait.routes.ts`; `src/app/features/medidas/medidas.routes.ts`; `src/app/features/alcoolemia/alcoolemia.routes.ts`; `src/app/features/sinistro/sinistro.routes.ts`; `src/app/features/sincronizacao/sincronizacao.routes.ts`; `src/app/features/complementares/complementares.routes.ts`                                                                                                                                                                                                                                                                                                                                                                       |
| shared de campo                | `src/app/shared/mobile-page.component.ts`; `src/app/shared/mobile-printer.port.ts`; `src/app/shared/paired-value.component.ts`; `src/app/shared/closed-enum-picker.component.ts`; `src/app/shared/proposed-value-field.component.ts`; `src/app/shared/outcome-selector.component.ts`; `src/app/shared/evidence-capture.component.ts`; `src/app/shared/signature-capture.component.ts`; `src/app/shared/location-field.component.ts`; `src/app/shared/framing-picker.component.ts`; `src/app/shared/validation-panel.component.ts`; `src/app/shared/printer-dialog.component.ts`; `src/app/shared/queue-item-card.component.ts`; `src/app/shared/conflict-resolver.component.ts`; `src/app/shared/device-handoff-form.component.ts`; `src/app/shared/term-preview.component.ts` |
| catálogo de runtime            | `src/app/i18n/teat.pt-BR.json`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| schemas locais                 | os 14 paths completos da primeira coluna da tabela §3                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| páginas                        | os 70 paths completos da coluna `componente` do manifesto §2, sem `#Component`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |

O Feature Engineer não recebe `app.component.ts`, configuração, teste, `src/testing/`
ou qualquer path não listado. Mesmo um arquivo exigido para concluir uma feature
é negado até ser incluído por alteração arquitetural explícita.

As APIs §1.2 não autorizam arquivo adicional: `BootstrapStore` fica em
`core/bootstrap.store.ts`; `GuardContext` nos cinco arquivos de guardas;
`LocalActStore`, `SyncWorker` e `NormativePackageService` nos três paths da linha
de persistência; `TransitionDispatcher` em `navigation/transitions.ts`;
`MobileErrorBoundary` em `core/field-shell.component.ts`; `MobilePrinterPort` nos
shared; `BodycamIndicator` em core; `TeatI18n` em `core/i18n.service.ts`; e
`BoatExtensionPort` em `features/sinistro/sinistro.routes.ts`. Portanto toda
classe/interface pública necessária já pertence a path da allowlist.

## 6. Oráculos obrigatórios para implementação

1. O manifesto contém exatamente 70 linhas de rota; 67 têm uxCode da matriz, D-01
   é `source_pending`, D-04 é `D-04` e D-05 é `D-05` desligada.
2. O oráculo cartesiano é `for each route × TEAT_STAFF_ROLES`: permitir somente
   `allowedRoles` da linha e negar todos os omitidos; em `sync-conflict`, o
   `field-agent` é negado pela precedência arquitetural registrada na seção 1.
3. O teste de paridade lê a fonte fechada do §4, confirma hash, cardinalidade 576,
   igualdade ordenada e alcance de todo destino concreto registrado; BOAT continua
   extensão e não é removido da matriz.
4. Readiness vem da resposta de provisionamento/bootstrap; warnings são mostrados
   e registrados, blockers impedem a rota. Nada no app transforma `source_pending`
   em valor, nem muda a decisão de H.39, H.54 ou H.55.
5. Para cada guarda efetivo, o Inspector prova uma entrada válida que permite e
   uma entrada ausente/inválida que nega. Para `roleGuard`, a prova executa o
   oráculo cartesiano da regra 2; um helper não usado pela guarda não satisfaz este
   oráculo. Para rota `B+S`, a prova mostra que `readinessGuard` precede
   `shiftGuard`.
6. Para cada um dos oito adapters, um double de `HttpClient`/cliente gerado prova
   método, prefixo unificado, headers obrigatórios quando o comando os exige,
   desserialização tipada e propagação do mesmo `StynxError`. Uma URL fora de
   `/v1/inf/` ou `/v1/ops/`, sucesso fabricado ou chamada nacional falha.
7. O oráculo offline reinicia o store entre escrita e leitura e comprova que o ato,
   versão, hash, idempotência e fila sobrevivem; simula recibo parcial, retry e
   erro, e prova ausência de duplicidade, apagamento ou bloqueio indevido. Store
   somente em memória não satisfaz a prova.
8. O oráculo normativo cobre conteúdo válido, ausente, hash divergente e expirado:
   somente o primeiro é utilizável; ausente/divergente bloqueiam; expirado emite e
   registra warning sem bloquear. Também prova reavaliação após `validUntil`.
9. Para os oito módulos, as provas carregam a rota lazy e comprovam a instância do
   componente de cada linha do manifesto; a mesma classe/alias/placeholder em duas
   linhas falha. Cada página com formulário exercita seu schema e a ação/client
   correspondente; cada texto observado é uma chave do catálogo carregado.
10. O oráculo da ErrorBoundary lança um `StynxError` conhecido e um erro desconhecido
    em ação e rota, e comprova classificação, chave i18n, contexto sanitizado e
    registro diagnóstico; não pode haver throw não tratado, literal visível ou
    resultado de sucesso.
11. Para os 14 schemas, há uma prova negativa por validação expressa na seção 3 e
    prova de que nenhum adapter é chamado ao falhar. `source_pending` não pode ser
    convertido em validação permissiva nem em valor inventado.
12. O oráculo de produção de impressão usa uma implementação não-`FixturePrinter`
    de `MobilePrinterPort` e prova evento de êxito/falha e reimpressão sem novo AIT;
    o de bodycam prova os três estados de chrome e que conteúdo não autorizado não
    é renderizado.
13. D-05 tem prova de rota acessível que mostra indisponibilidade e prova de zero
    carga/chamada de feature. Cada rota BOAT tem prova com extensão presente e
    ausente; a segunda não mostra placeholder TEAT e não torna o atalho visível.
14. Esses oráculos são provas de comportamento das superfícies efetivas, não testes
    de existência de classe, arquivo, array, metadata ou helper isolado.
