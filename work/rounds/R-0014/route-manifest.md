# Manifesto de rotas do Portal (M7) — fonte única para TASK-0002 (testes) e TASK-0004 (código)

Derivado de `docs/framework/arch/portal-frontends.md` §4 (rotas, telas, nível, módulo) e das
rotas auxiliares fixadas em `plan.md` M7. `access`: `anonimo` (sem guarda), `simples`
(`portalAuthGuard` + `assuranceGuard('simples')`), `avancada` (`portalAuthGuard` +
`assuranceGuard('avancada')`), `nenhum_ou_simples` (sem guarda; sessão opcional — DT-051/H.51).
`entitlement`: `entitlementGuard(kind)` sobre o parâmetro indicado. `serviceKey`:
`serviceAvailabilityGuard(serviceKey)`. Ordem dos guardas: auth → assurance → availability →
entitlement. `module` é o nome da tabela §4 (`core` carregado no bootstrap; os demais lazy em
`src/app/features/<module>/<module>.routes.ts`). Rota sem `screen` tem `sheet: null`.

| #   | path                                           | screen | sheet         | module       | access            | entitlement (param)                 | serviceKey           | journeys                      |
| --- | ---------------------------------------------- | ------ | ------------- | ------------ | ----------------- | ----------------------------------- | -------------------- | ----------------------------- |
| 1   | ``                                             | —      | —             | core         | anonimo           | —                                   | —                    | —                             |
| 2   | `carta-servicos`                               | T-25   | IU-PORTAL-T25 | catalogo     | anonimo           | —                                   | —                    | —                             |
| 3   | `carta-servicos/:serviceKey`                   | T-25   | IU-PORTAL-T25 | catalogo     | anonimo           | —                                   | —                    | —                             |
| 4   | `pontuacao/como-funciona`                      | T-15   | IU-PORTAL-T15 | catalogo     | anonimo           | —                                   | —                    | JRN-PORTAL-004                |
| 5   | `acessibilidade`                               | —      | —             | core         | anonimo           | —                                   | —                    | —                             |
| 6   | `auth/callback`                                | —      | —             | core         | anonimo           | —                                   | —                    | —                             |
| 7   | `inicio`                                       | —      | —             | core         | simples           | —                                   | —                    | —                             |
| 8   | `autos`                                        | T-14   | IU-PORTAL-T14 | autos        | simples           | —                                   | `consulta_multas`    | JRN-PORTAL-001, 004, 005      |
| 9   | `autos/:aitId`                                 | T-01   | IU-PORTAL-T01 | autos        | simples           | `ait` (`aitId`)                     | `consulta_multas`    | JRN-PORTAL-001, 002, 004, 005 |
| 10  | `autos/:aitId/defesa/nova`                     | T-02   | IU-PORTAL-T02 | defesa       | avancada          | `ait` (`aitId`)                     | `defesa_previa`      | JRN-PORTAL-001                |
| 11  | `autos/:aitId/condutor/nova`                   | T-05   | IU-PORTAL-T05 | indicacao    | avancada          | `ait` (`aitId`)                     | `indicacao_condutor` | JRN-PORTAL-002                |
| 12  | `autos/:aitId/pagamento`                       | T-13   | IU-PORTAL-T13 | pagamento    | simples           | `ait` (`aitId`)                     | `pagamento`          | JRN-PORTAL-004, 005, 010      |
| 13  | `autos/:aitId/pagamento/preservando-recurso`   | T-23   | IU-PORTAL-T23 | pagamento    | simples           | `ait` (`aitId`)                     | `pagamento`          | JRN-PORTAL-010                |
| 14  | `processos`                                    | T-06   | IU-PORTAL-T06 | processos    | simples           | —                                   | —                    | JRN-PORTAL-003                |
| 15  | `processos/:requestId`                         | T-07   | IU-PORTAL-T07 | processos    | simples           | `request` (`requestId`)             | —                    | JRN-PORTAL-001, 003           |
| 16  | `processos/:requestId/diligencia/:diligenceId` | T-11   | IU-PORTAL-T11 | processos    | simples           | `request` (`requestId`)             | —                    | JRN-PORTAL-003                |
| 17  | `processos/:requestId/desistencia`             | T-08   | IU-PORTAL-T08 | processos    | simples           | `request` (`requestId`)             | —                    | —                             |
| 18  | `processos/:requestId/decisao`                 | T-10   | IU-PORTAL-T10 | processos    | simples           | `request` (`requestId`)             | —                    | JRN-PORTAL-001, 003           |
| 19  | `processos/:requestId/jari/nova`               | T-03   | IU-PORTAL-T03 | defesa       | avancada          | `request` (`requestId`)             | `recurso_jari`       | JRN-PORTAL-001, 010           |
| 20  | `processos/:requestId/cetran/nova`             | T-04   | IU-PORTAL-T04 | defesa       | avancada          | `request` (`requestId`)             | `recurso_cetran`     | JRN-PORTAL-001                |
| 21  | `notificacoes`                                 | T-12   | IU-PORTAL-T12 | notificacoes | simples           | —                                   | —                    | JRN-PORTAL-002, 003, 005      |
| 22  | `notificacoes/preferencias`                    | —      | —             | notificacoes | simples           | —                                   | —                    | —                             |
| 23  | `sne`                                          | T-09   | IU-PORTAL-T09 | notificacoes | simples           | —                                   | `adesao_sne`         | JRN-PORTAL-005                |
| 24  | `documentos/cnh-digital`                       | T-16   | IU-PORTAL-T16 | documentos   | simples           | —                                   | `consulta_cnh`       | JRN-PORTAL-006                |
| 25  | `veiculos`                                     | —      | —             | documentos   | simples           | —                                   | —                    | —                             |
| 26  | `veiculos/:vehicleId/crlv-e`                   | T-17   | IU-PORTAL-T17 | documentos   | simples           | `vehicle` (`vehicleId`)             | `emissao_crlv`       | JRN-PORTAL-006                |
| 27  | `sinistros`                                    | T-18   | IU-PORTAL-T18 | sinistros    | simples           | —                                   | `consulta_bat`       | JRN-PORTAL-007                |
| 28  | `sinistros/:crashId`                           | T-19   | IU-PORTAL-T19 | sinistros    | simples           | `crash` (`crashId`)                 | `consulta_bat`       | JRN-PORTAL-007                |
| 29  | `exames`                                       | T-20   | IU-PORTAL-T20 | exames       | simples           | —                                   | `consulta_exame`     | JRN-PORTAL-008                |
| 30  | `exames/:examId/junta/nova`                    | —      | —             | exames       | avancada          | `exam` (`examId`)                   | `junta_medica`       | JRN-PORTAL-008                |
| 31  | `ouvidoria/nova`                               | T-21   | IU-PORTAL-T21 | atendimento  | nenhum_ou_simples | —                                   | `manifestar`         | JRN-PORTAL-009                |
| 32  | `ouvidoria/:manifestationId`                   | T-22   | IU-PORTAL-T22 | atendimento  | simples           | `manifestation` (`manifestationId`) | —                    | JRN-PORTAL-009                |
| 33  | `avaliacao/:requestId`                         | T-26   | IU-PORTAL-T26 | atendimento  | simples           | `request` (`requestId`)             | `avaliar`            | JRN-PORTAL-009                |
| 34  | `privacidade/meus-dados`                       | T-24   | IU-PORTAL-T24 | privacidade  | simples           | —                                   | `lgpd_declaracao`    | JRN-PORTAL-011                |
| 35  | `assinatura/elevacao`                          | T-27   | IU-PORTAL-T27 | assinatura   | simples           | —                                   | —                    | JRN-PORTAL-001                |
| 36  | `conta`                                        | —      | —             | core         | simples           | —                                   | —                    | —                             |
| 37  | `vinculo/por-que-nao-vejo`                     | —      | —             | core         | simples           | —                                   | —                    | —                             |
| 38  | `servico-indisponivel/:serviceKey`             | —      | —             | core         | simples           | —                                   | —                    | —                             |

Invariantes verificáveis: 38 entradas; 27 `screen` distintos (T-01…T-27, cada um em ≥ 1 rota;
T-25 em duas); nenhuma entrada com `access: 'qualificada'` ([RN-PORTAL-101]); 14 nomes de módulo
distintos (`core` + 13 lazy); toda rota com `:aitId|:requestId|:vehicleId|:crashId|:examId|:manifestationId`
tem `entitlement`; `serviceKey` ⊆ catálogo de serviços (`backend/database/seed/70-fixtures-portal.sql`:
`consulta_multas`, `defesa_previa`, `recurso_jari`, `recurso_cetran`, `indicacao_condutor`,
`pagamento`, `adesao_sne`, `cancelamento_sne`, `consulta_cnh`, `emissao_crlv`, `consulta_bat`,
`consulta_exame`, `junta_medica`, `manifestar`, `avaliar`, `lgpd_declaracao`) — A4: todo
`serviceKey` ∈ chaves de `portal.service_catalog` ∪ {`junta_medica`}; T-22 não tem `serviceKey`. Tipo TS (M7):

```ts
export type PortalAccess =
  'anonimo' | 'simples' | 'avancada' | 'nenhum_ou_simples';
export type EntitlementKind =
  'ait' | 'request' | 'vehicle' | 'crash' | 'exam' | 'manifestation';
export interface RouteManifestEntry {
  readonly path: string; // como na tabela, sem barra inicial
  readonly screen: `T-${string}` | null;
  readonly sheet: `IU-PORTAL-T${string}` | null;
  readonly module: string;
  readonly access: PortalAccess;
  readonly entitlement?: {
    readonly kind: EntitlementKind;
    readonly param: string;
  };
  readonly serviceKey?: string;
  readonly journeys: readonly string[];
}
export const PORTAL_ROUTE_MANIFEST: readonly RouteManifestEntry[];
```
