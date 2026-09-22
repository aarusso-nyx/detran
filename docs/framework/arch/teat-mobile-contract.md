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

| tarefa    | papel            | caminhos graváveis exatos                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| --------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TASK-0011 | Scaffold         | `package.json`, `angular.json`, `eslint.config.js`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.spec.json`, `vitest.config.ts`, `src/test-setup.ts`, `src/main.ts`, `src/index.html`, `src/styles.css`, `src/app/app.component.ts`, `src/app/app.routes.ts`                                                                                                                                                                                                                                                                                                                                            |
| TASK-0012 | Inspector        | todo e somente `src/**/*.spec.ts` e `src/testing/**`; nunca arquivo de produção                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| TASK-0013 | Feature Engineer | os 70 arquivos de componente enumerados no manifesto; `src/app/app.routes.ts`, `src/app/navigation/transitions.ts`, `src/app/navigation/guards/auth.guard.ts`, `tenant.guard.ts`, `role.guard.ts`, `readiness.guard.ts`, `shift.guard.ts`, `src/app/core/bootstrap.store.ts`, `readiness-gate.service.ts`, `src/app/core/field-shell.component.ts`, `src/app/data/api/mobile-bootstrap.client.ts`, `ops-snapshots.client.ts`, `offline-sync.client.ts`, `ait.client.ts`, `measures.client.ts`, `alcohol.client.ts`, `normative.client.ts`, `provisioning.client.ts`, e os 14 schemas enumerados na seção 3 |

O Inspector pode ler, mas não editar, cada caminho de produção. O Feature Engineer
pode ler, mas nunca editar, `src/**/*.spec.ts` nem `src/testing/**`. A única posse
sequencial, não concorrente, é `src/app/app.routes.ts`: TASK-0011 cria o shell vazio;
depois de encerrado seu handoff, TASK-0013 recebe a única autoridade para preencher
as rotas. Não há `**` de Scaffold ou Feature e, fora dessa passagem explícita de
hand-off, os conjuntos não se sobrepõem. `app.component.ts` é somente shell vazio;
`field-shell.component.ts` é a implementação de runtime do Feature Engineer.

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
