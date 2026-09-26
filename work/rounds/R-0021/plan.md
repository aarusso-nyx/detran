# R-0021 — frente `stynx-canonical` (C-0002, ação 7a: pin 1.4.0 e módulos canônicos STYNX)

**Status:** **proposta — C-0002 rev. 2, aguardando autorização do Owner**. Planejada em 2026-09-26 pelo
Architect a partir de `work/campaigns/C-0002-consolidacao.md` §2 (fase C) e da inspeção (d)
(`work/campaigns/C-0002-inspecao-2026-09-25/d-stynx.md`, versionada com a campanha; fatos transcritos aqui e em
`work/campaigns/C-0002-stynx-upstream-spec.md`). Nenhum `AUTHORIZATION.md`, `tasks/` ou
`compositions.json` existe: o maestro os produz no bootstrap. Maestro **Sol 6** (Codex); reviewer
**Opus 5.5** via `tools/orchestra/bridge.sh claude …` (ids de CLI confirmados no bootstrap). Worktree
`/Volumes/Thiamat II/stech/detran-worktrees/stynx-canonical`, branch `orchestra/stynx-canonical`.
**Concorrência com upstreams da campanha:** abre após o merge de **R-0017** (`local-stack`: stack e
`stack:smoke` para o smoke das trocas). Corre em paralelo a **S-1.5** (repositório STYNX, 1.5.0):
esta rodada **não depende** da 1.5.0 e **alimenta** a especificação upstream com as lacunas que
encontrar (adenda no CTG-0001, antes de S-1.5 congelar o escopo). R-0022 depende desta rodada mesclada.
Nenhum lock comum com R-0018/R-0019/R-0020 além de `docs/meta/adr/README.md` (integrar `main` por merge).
**Janelas previstas:** 2 (1: bootstrap + CTG-0001 + CTG-0002; 2: CTG-0003…CTG-0007 + fechamento);
recalibrar no bootstrap.

## Metas

1. **Pin 1.3.1 → 1.4.0** em todos os manifestos que declaram `@stynx-nyx/*` (59 `package.json` de
   fonte em 2026-09-26, mais `apps/boat/mobile/dist/package.json` e `packages/ui/dist/package.json`,
   que são gerados; a inspeção (d) contou 69 com outro critério — o contrato fixa a lista por
   comando), em `tools/blueprints/generate.mjs:370-371` e no `pnpm-lock.yaml`; gate novo
   `pnpm verify:stynx-pin` (versão única, parametrizada). **1.4.0 = 1.3.1 em API** (CHANGELOGs 1.4.0
   só registram DEVAI 1.5.0, changeset 1565d4e): nenhuma mudança de comportamento esperada.
2. **Assinatura e documentos (ADR-0018 §1, fail-closed):** `@stynx-nyx/signature` (hoje declarado e
   nunca importado) montado uma vez em `backend/app` (`StynxSignatureModule.forRoot`), consumido só
   pela fachada `@detran/shared/documents`; `PadesSigningHttpAdapter`
   (`backend/domains/ch/clinical-reports/src/pades-signing.http-adapter.ts`, 162 l.; herdado por
   `ch/juntas/src/junta-signing.adapter.ts`) e `DocumentTrustHttpAdapter`
   (`backend/domains/shared/src/documents/document-trust.http-adapter.ts`, 478 l.) saem dos domínios.
   Nenhum domínio importa provedor de assinatura. O que o STYNX não cobre (UPS-SIG-01…04) fica **atrás
   da porta da fachada, na composição do app**, com desvio em ADR, até R-0022 (1.5.0) — nunca
   reimplementado.
3. **Outbox:** a fila de despacho RENACH (`backend/app/src/pec-renach-transmission.service.ts`, 519 l.:
   _claim_, despacho, ACK, _retry_ sobre `integration.outbox` tópico `ch.renach.exam-result`) passa a
   `@stynx-nyx/outbox` (`OutboxService.enqueue/dispatchDue/ack/retry`, `HttpOutboxDispatcher` ou
   porta `OutboxDispatcherPort` do DETRAN que grava `integration.delivery_attempt`). O log de eventos
   (SSE, projeções: `SqlTeatEventOutbox`, `backend/domains/shared/src/events/{outbox,sql-outbox}.ts`)
   **fica** até UPS-OBX-01 (semântica _upsert_ por agregado do STYNX é incompatível com log de
   eventos) — escopo sujeito a OD-R21-02.
4. **Offline-sync:** `StynxOfflineSyncModule.forRoot({ store, context, mountControllers: false })` com
   `OfflineSyncStore` do DETRAN sobre as tabelas `ops.*` já existentes
   (`backend/database/ddl/18-ops-offline-sync.sql`, gerado de `BP-OPS-OFFLINE-SYNC-001` — **sem DDL
   nova**) e `OfflineSyncContextPort` sobre o `RequestContext`; o controlador DETRAN
   (`/v1/ops/offline-sync/*`, `@Resource/@Action`) é mantido e delega reservar/cancelar/lote/conflito
   ao `OfflineSyncService`. Extras sem equivalente (UPS-OFS-01…04) ficam, com desvio em ADR.
5. **Notificações:** decisão explícita por OD-R21-03 — `inf/notification` (notificação legal NA/NP) e
   `portal.inbox_item`/evidência de ciência são domínio; não há hoje entrega push/e-mail local a
   trocar (OD-P40, OD-P88). Sem reimplementação local, nada é removido; a adoção de
   `StynxNotificationsModule` acompanha o produtor de OD-P40.
6. **Dependências mortas (B1):** `@stynx-nyx/audit` (declarado, nunca importado; o app usa
   `StynxAuditModule` de `@stynx-nyx/backend`) e as 4 dependências STYNX sem import de
   `apps/boat/mobile` — removidas ou justificadas no contrato.
7. **Jobs fora:** `@stynx-nyx/jobs` **não** é adotado nesta rodada — justificativa registrada em
   R-0010 `contracts/CTG-0002.md` C-2-21; o requisito vai ao STYNX (UPS-JOB-01…04) e a troca é de R-0024.
8. **Caracterização antes de toda troca** (C-0002 §4): testes que fixam o comportamento atual de cada
   módulo, verdes sobre 1.3.1 **e** sobre 1.4.0 antes de qualquer remoção.
9. **Documentação:** ADR nova "Divisão STYNX × DETRAN" (tabela canônica pacote → uso → desvio
   aprovado → item UPS), emendas ADR-0018 (implementação), ADR-0016 (outbox), ADR-0006 ops
   (offline-sync), ADR-0015 (pin 1.4.0); adenda §8 da especificação upstream; `waves.md`, `backlog.md`.

## Inventário por módulo (entrada do contrato de TASK-0001)

| Módulo                    | Inventário local (verificado 2026-09-26)                                                                                                                                                                                                                                                                                                  | API STYNX 1.4.0 equivalente                                                                                                                                                                                                                                                                                                              | Lacunas → spec                                                               | Caracterização antes                                                                                                                                                                                                                   | Impacto DDL/RLS/contratos                                                                                                                                                                                          | Remoção                                                                                                          |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| Assinatura                | `pades-signing.http-adapter.ts` (render+assina+armazena por HTTP, recibo validado, `checkCapabilities`); consumidores `report-lifecycle.service.ts`, `encounter-closure.service.ts`, `junta-signing.adapter.ts`, `backend/app/src/detran-clinical-trust.ts`, `app.module.ts:56,717`; env `DETRAN_CLINICAL_SIGNING_{URL,HEALTH_URL,TOKEN}` | `StynxSignatureModule.forRoot({ provider \| backend \| providerClient, verificationPolicy })`, `SignatureService.sign/verify` (default `MissingSignatureBackend` lança `SignatureProviderConfigurationError`), `createMockSignatureBackend`; render/PDF-A/armazenamento por `@stynx-nyx/pdf`, `pdf-a`, `storage` (já montados para BOAT) | UPS-SIG-01 (nível), UPS-SIG-02 (prontidão por capacidade)                    | `pades-signing.http-adapter.spec.ts`, `report-lifecycle.service.spec.ts`, `encounter-closure.service.spec.ts`, `backend/app/tests/e2e/runtime-profiles.e2e.spec.ts`, `rait-case-commands.e2e.spec.ts` + novos (fail-closed por perfil) | sem DDL; recibo (`ClinicalArtifactReceipt`) preservado campo a campo; códigos `RAIT.SIGNATURE_*`                                                                                                                   | adapter sai de `ch/clinical-reports`; `JuntaSigningAdapter` passa a porta da fachada                             |
| Verificação de documentos | `document-trust.http-adapter.ts` (manifestos de ata de sessão e de lote, verificação de evidência e de retirada); env `DETRAN_DOCUMENT_TRUST_{URL,HEALTH_URL,TOKEN}`; 5 specs em `shared/src/documents/`                                                                                                                                  | `SignatureService.verify`, `SequentialSigner` (só _digest_)                                                                                                                                                                                                                                                                              | UPS-SIG-03 (manifesto multi-signatário com evidência), UPS-SIG-04 (retirada) | as 5 specs de `document-trust*`                                                                                                                                                                                                        | sem DDL                                                                                                                                                                                                            | verificação simples via STYNX; manifestos ficam atrás de `DocumentTrustVerifier` na composição do app até R-0022 |
| Outbox (despacho)         | `pec-renach-transmission.service.ts` sobre `integration.outbox`/`delivery_attempt`/`inbox_receipt`; `encounter-closure.service.ts:272` lê `outbox.topic`                                                                                                                                                                                  | `StynxOutboxModule.forRoot({ table, ackTable, dispatcher, backoffPolicy })`, `OutboxService`, `verifyOutboxAckSignature`; migração STYNX `packages/data/migrations/platform/0018_outbox.sql` (`outbox.messages`, `outbox.acknowledgements`, FK `tenancy.tenants`)                                                                        | UPS-OBX-02 (_ledger_ com _hashes_)                                           | testes RENACH existentes + novos (claim, 15 min de reprocesso, ACK idempotente, `inbox_receipt`)                                                                                                                                       | **DDL nova** `outbox.*` traduzida para o kernel DETRAN (FK `auth.tenants`, `auth.create_rls_policy`, GUC `app.tenant_id` já lido por `auth.current_tenant()`), migração de linhas pendentes, `pnpm verify:rls-ddl` | SQL de claim/ACK do serviço RENACH                                                                               |
| Outbox (log de eventos)   | `SqlTeatEventOutbox` + ~40 arquivos que gravam/leem `integration.outbox` (SSE, projeções)                                                                                                                                                                                                                                                 | nenhum (upsert por agregado)                                                                                                                                                                                                                                                                                                             | UPS-OBX-01                                                                   | —                                                                                                                                                                                                                                      | —                                                                                                                                                                                                                  | fica (R-0022)                                                                                                    |
| Offline-sync              | `backend/domains/ops/offline-sync/src/handwritten/*` (2.903 l. sem specs): `submit-batch.command.ts` (1.025), numeração (reserve/settle/reconcile/cancel/block/close), conflitos, recibos, eventos, `concurrency-detector.ts`                                                                                                             | `StynxOfflineSyncModule`, `OfflineSyncService`, `OfflineSyncStore`, `OfflineSyncContextPort`, `mountControllers: false`                                                                                                                                                                                                                  | UPS-OFS-01…04                                                                | 4 suítes `tests/integration/*` (numbering, sync-batch, concurrency-window, resolve-conflict), `submit-batch.spec.ts`, `events.schema.spec.ts` + nova suíte HTTP das rotas `/v1/ops/offline-sync/*`                                     | sem DDL (store sobre `ops.*`); rotas e envelopes inalterados                                                                                                                                                       | lógica de reservar/cancelar/lote/conflito que o serviço STYNX assume                                             |
| Notificações              | `inf/notification` (domínio NA/NP, 142 l. manuscritas); `portal/inbox` (inbox legal, `push-subscription.*`)                                                                                                                                                                                                                               | `StynxNotificationsModule` (in-app PG, push _stub_, SES/SNS), `NotificationInboxService`; migração `0018_notifications.sql`                                                                                                                                                                                                              | —                                                                            | —                                                                                                                                                                                                                                      | adoção exigiria DDL `notifications.*`                                                                                                                                                                              | nenhuma (OD-R21-03)                                                                                              |
| Dependências mortas       | `@stynx-nyx/audit` em `backend/app/package.json`; `apps/boat/mobile` (4 deps STYNX, 0 imports)                                                                                                                                                                                                                                            | —                                                                                                                                                                                                                                                                                                                                        | —                                                                            | `pnpm build`, `pnpm typecheck`                                                                                                                                                                                                         | manifestos, lockfile                                                                                                                                                                                               | remoção                                                                                                          |

## Tarefas

| Tarefa    | Papel                | Perfil              | Modelo/esforço | Lock                                                                                 | Depende de                      | Entrega                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| --------- | -------------------- | ------------------- | -------------- | ------------------------------------------------------------------------------------ | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TASK-0001 | Architect            | architect-blueprint | Sol 6 / alto   | `MOD-r21-contracts`, `MOD-upstream-spec`, `MOD-kb-open-decisions`                    | —                               | `contracts/CTG-0001.md`: inventário fechado por módulo (tabela acima com linhas, env, rotas, testes), mapa de símbolos a partir dos `.d.ts` 1.4.0 (`npm pack @stynx-nyx/<p>@1.4.0` no _scratchpad_, sem instalar), lacunas L-nn com o id UPS, critérios C-01-nn de caracterização (presença e ausência), lista fechada de manifestos do pin; adenda A1 em `work/campaigns/C-0002-stynx-upstream-spec.md` §8 (confirma/remove/acrescenta UPS-SIG/OBX/OFS); OD-R21-01…03 e OD-S15-01 em `open-decisions-rait.md` §C-0002 |
| TASK-0002 | Inspector            | inspector-tests     | Terra / médio  | `MOD-app-tests-signature`, `MOD-app-tests-outbox`                                    | TASK-0001                       | caracterização backend: assinatura (recibo válido/ inválido, capacidades, 503 sem configuração, HTTPS fora de local/test, perfis `staging-like`/`production` nunca com _mock_), confiança de documentos, despacho RENACH (claim, reprocesso após 15 min, ACK/erro, `inbox_receipt` idempotente, `delivery_attempt`, `renach_acked`); verdes sobre 1.3.1 com a saída no relatório                                                                                                                                       |
| TASK-0003 | Inspector            | inspector-tests     | Terra / médio  | `MOD-ops-offline-sync-tests`                                                         | TASK-0001                       | suíte HTTP de caracterização das rotas `/v1/ops/offline-sync/*` (status, envelopes de erro, idempotência de lote, numeração, conflitos, recibos) em `backend/domains/ops/offline-sync/tests/integration/`; verde sobre 1.3.1                                                                                                                                                                                                                                                                                           |
| TASK-0004 | Engineer             | engineer-backend    | Luna / médio   | `MOD-deps-stynx-pin`, `MOD-blueprints-generator`, `MOD-root-scripts`                 | TASK-0002, TASK-0003            | pin 1.4.0 na lista do contrato e em `generate.mjs` (fonte única lida pelo gerador); `tools/check-stynx-pin.ts` + script `verify:stynx-pin` ligado a `pnpm check`; remoção das dependências mortas; `pnpm blueprints:check` sem diff além da versão; lockfile pelo maestro                                                                                                                                                                                                                                              |
| TASK-0005 | Architect            | architect-blueprint | Sol 6 / alto   | `MOD-r21-contracts`                                                                  | TASK-0004                       | `contracts/CTG-0003.md` (assinatura): implementação da fachada no app sobre `SignatureService` + `pdf`/`pdf-a`/`storage`; perfil → backend (`test`/`local-sandbox` → `createMockSignatureBackend` só nos tiers unit/integration e na stack local; `staging-like`/`production` → provedor HTTP, _boot_ falha sem configuração); mapeamento campo a campo do recibo; porta para as lacunas UPS-SIG; critérios C-03-nn                                                                                                    |
| TASK-0006 | Inspector            | inspector-tests     | Terra / médio  | `MOD-app-tests-signature`                                                            | TASK-0005                       | testes da fachada e do fail-closed (sem backend → `RAIT.SIGNATURE_FAILED`/503, nunca "assinado"; _hash_ divergente → `RAIT.DOCUMENT_HASH_MISMATCH`); teste de fronteira: nenhum `backend/domains/**/src` importa `*http-adapter` de assinatura nem `fetch` para `DETRAN_*SIGNING*`/`DOCUMENT_TRUST`                                                                                                                                                                                                                    |
| TASK-0007 | Engineer             | engineer-backend    | Sol 6 / médio  | `MOD-app-module`, `MOD-shared-documents`, `MOD-ch-clinical-reports`, `MOD-ch-juntas` | TASK-0006                       | `StynxSignatureModule` montado; fachada ligada; adapters fora dos domínios; testes de TASK-0002/0006 verdes **sem edição**                                                                                                                                                                                                                                                                                                                                                                                             |
| TASK-0008 | Architect            | architect-blueprint | Sol 6 / alto   | `MOD-r21-contracts`, `MOD-ddl-outbox`                                                | TASK-0004                       | `contracts/CTG-0004.md` (outbox de despacho): DDL `outbox.*` (número livre em `backend/database/ddl`), RLS, _grants_ de `role_app_backend`, migração das linhas pendentes do tópico RENACH, porta `OutboxDispatcherPort` do DETRAN (grava `delivery_attempt`), rota de ACK; critérios C-04-nn                                                                                                                                                                                                                          |
| TASK-0009 | Inspector            | inspector-tests     | Terra / médio  | `MOD-app-tests-outbox`                                                               | TASK-0008                       | negativos de RLS de `outbox.*` (tenant B invisível), migração idempotente, ACK de outro tenant rejeitado                                                                                                                                                                                                                                                                                                                                                                                                               |
| TASK-0010 | Engineer             | engineer-backend    | Sol 6 / médio  | `MOD-app-renach`, `MOD-ddl-outbox`, `MOD-ch-clinical-reports`                        | TASK-0009                       | `StynxOutboxModule` montado; `pec-renach-transmission.service.ts` sobre `OutboxService`; `encounter-closure.service.ts` lê o novo estado; testes verdes sem edição                                                                                                                                                                                                                                                                                                                                                     |
| TASK-0011 | Architect            | architect-blueprint | Sol 6 / alto   | `MOD-r21-contracts`                                                                  | TASK-0004                       | `contracts/CTG-0005.md` (offline-sync): classificação dos 11 arquivos manuscritos em {trocado pelo serviço STYNX, adaptador (`store`/`context`), lacuna UPS-OFS, domínio}; _store_ sobre `ops.*`; critérios C-05-nn                                                                                                                                                                                                                                                                                                    |
| TASK-0012 | Inspector            | inspector-tests     | Terra / médio  | `MOD-ops-offline-sync-tests`                                                         | TASK-0011                       | testes do _store_ DETRAN contra o contrato `OfflineSyncStore` (RLS real, dois tenants)                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| TASK-0013 | Engineer             | engineer-backend    | Sol 6 / médio  | `MOD-ops-offline-sync`                                                               | TASK-0012                       | `StynxOfflineSyncModule` montado com `mountControllers: false`; controlador DETRAN delegando; remoção do que o serviço assume; suítes de TASK-0003/0012 e as 4 existentes verdes sem edição                                                                                                                                                                                                                                                                                                                            |
| TASK-0014 | Architect (transcr.) | transcriber-docs    | Luna / baixo   | `MOD-adr`, `MOD-docs`, `MOD-upstream-spec`                                           | TASK-0007, TASK-0010, TASK-0013 | ADR nova (número conferido em `docs/meta/adr/README.md`), emendas ADR-0018/0016/0006-ops/0015, registro da decisão de notificações (OD-R21-03), `waves.md` §Histórico, `backlog.md`, adenda de fechamento na spec (lacunas finais)                                                                                                                                                                                                                                                                                     |

CTG-0001 = 0001 → 0002 ∥ 0003 (fronteiras disjuntas: `backend/app/tests/**` e
`backend/domains/{ch,shared}/**/tests|*.spec.ts` × `backend/domains/ops/offline-sync/tests/**`).
CTG-0002 = 0004. CTG-0003 = 0005 → 0006 → 0007. CTG-0004 = 0008 → 0009 → 0010. CTG-0005 = 0011 →
0012 → 0013. CTG-0006 = decisão de notificações (sem tarefa de código salvo OD-R21-03 (a): então
Architect → Inspector → Engineer acrescentados por adenda). CTG-0007 = 0014. CTG-0003, -0004 e -0005
têm locks disjuntos e podem correr em paralelo (máx. 3). **Um PR por CTG**; o seguinte nasce empilhado
no anterior ainda não mesclado, nunca com commits novos no branch de um PR aberto.

**Ordem de prova.** Os testes de caracterização (TASK-0002/0003) são provados verdes sobre 1.3.1
(saída citada no relatório — âncora), mesclados, reexecutados verdes após o bump (CTG-0002) e só então
começam as trocas. O Engineer nunca altera teste de caracterização; contradição teste × contrato →
adenda numerada do Architect.

**Checkpoints do maestro (Engineer):** (a) após TASK-0004 e após cada CTG que acrescenta
`@stynx-nyx/outbox` ou `@stynx-nyx/offline-sync` a `backend/app/package.json`: `pnpm install`, commit do
lockfile e alias em `backend/app/vitest.config.ts` antes de liberar o Inspector; (b) antes de TASK-0001,
confirmar 1.4.0 publicado (`npm view @stynx-nyx/signature@1.4.0 version`).

## Critérios de aceitação (comandos → resultado)

Todos existem em `package.json` hoje, salvo `verify:stynx-pin` (entregável de TASK-0004).

- `pnpm verify:stynx-pin` → OK, todos os manifestos da lista do contrato em `1.4.0`, 0 divergências.
- `pnpm --filter @detran/app test:e2e` → verde (inclui `runtime-profiles.e2e.spec.ts` e os testes
  novos de fail-closed, sem `skip`).
- `pnpm --filter @detran/ch-clinical-reports test:unit`, `pnpm --filter @detran/ch-juntas test`,
  `pnpm --filter @detran/shared test` → verdes.
- `pnpm --filter @detran/ops-offline-sync test:integration` → verde (4 suítes existentes + a nova).
- `pnpm backend:test:ci` → verde (PostgreSQL real, RLS).
- `pnpm backend:rls-smoke` → OK; `pnpm verify:rls-ddl` → OK (inclui `outbox.*`).
- `pnpm verify:decorators` → OK (rotas de offline-sync e ACK mantêm `@Resource/@Action`);
  `pnpm verify:role-catalog` → OK.
- `pnpm blueprints:check` → OK; `pnpm contracts:check` → OK (nenhuma rota pública mudou).
- Verificações de arquivo: `grep -rln "PadesSigningHttpAdapter\|DocumentTrustHttpAdapter" backend/domains --include='*.ts'`
  → vazio fora de testes; `grep -rn "@stynx-nyx/signature" backend/app/src` → ≥ 1 import;
  `grep -n "from integration.outbox" backend/app/src/pec-renach-transmission.service.ts` → vazio.
- `pnpm build`, `pnpm typecheck`, `pnpm format:check`, `pnpm docs:kb:check`, `pnpm docs:kb:publish-check` → OK.
- `pnpm check` → verde ao fim de cada CTG.
- DEVAI: `pnpm exec devai evidence record` por CTG e `evidence verify` OK; `audit observe` no sha de
  cada merge; no fechamento `devai round close` **e** `devai round seal`, âncora na cadeia.

## Mapa entregável → definições

| Entregável            | Definição                                                                                                                                                                                                         |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| pin                   | ADR-0015; `docs/framework/arch/wp0-stynx-1-3-1-migration.md`; OD-C2-004; `tools/blueprints/generate.mjs:370-371`                                                                                                  |
| assinatura/documentos | ADR-0018 §Decision 1–5 e Emenda 1; `backend/domains/shared/src/documents/{documents-facade,document-trust,signature-policy}.ts`; `rait-error-catalog.md` §3.5–§3.6 (códigos `RAIT.SIGNATURE_*`)                   |
| outbox                | ADR-0016 §2; `backend/database/ddl/04-integration-storage.sql`, `20-rls-policies.sql`, `11-auth-functions.sql` (`auth.current_tenant`); `packages/data/migrations/platform/0018_outbox.sql` do STYNX (referência) |
| offline-sync          | ADR-0006 (ops); `docs/framework/arch/teat-build-pack.md`; `BP-OPS-OFFLINE-SYNC-001` (DDL 18)                                                                                                                      |
| notificações          | ADR-0016 §3, ADR-0019 §3; `portal-build-pack.md` OD-P40, OD-P88                                                                                                                                                   |
| jobs (fora)           | R-0010 `contracts/CTG-0002.md` C-2-21…C-2-23                                                                                                                                                                      |
| upstream              | `work/campaigns/C-0002-stynx-upstream-spec.md` §6.11–§6.13, §8                                                                                                                                                    |

## Riscos

- **Assinatura em silêncio (crítico).** Troca não pode abrir caminho para documento "assinado" sem
  prova: `SignatureService` sem backend lança; _mock_ nunca selecionável em `staging-like`/`production`
  (teste de _boot_). Nenhuma integração real (PAdES/TSA, #125): provedor só por _mock_ ou porta.
  Achado de fail-open → `FAIL`, sem dispensa.
- **Protocolo de fio diferente.** O `HttpSignatureProviderClient` do STYNX fala o protocolo STYNX, não
  o `renderAndSign` do serviço de plataforma DETRAN; como não há provedor real, só o _mock_/stack local
  muda. Registrar em ADR.
- **Outbox com dois papéis.** `integration.outbox` é fila de despacho e log de eventos; trocar o log
  quebraria SSE e projeções (upsert por agregado). OD-R21-02.
- **Offline-sync é o caminho do TEAT mobile.** Semântica divergente do `submitSyncBatch` do STYNX →
  lacuna UPS-OFS e manutenção do local; nunca adaptação que mude resposta HTTP.
- **Escopo da 1.5.0 congelado antes das lacunas.** Se S-1.5 fechar antes da adenda A1, a lacuna vai a
  1.5.x e o contorno local persiste após R-0022 com desvio registrado.
- Arquivos gerados (DDL de blueprint, `packages/api-clients/src/generated/**`) nunca editados à mão.

## Lições aplicadas (C-0001; `waves.md` §Histórico)

- **Relatórios versionados:** `work/rounds/R-0021/reports/` com `git add -f` até R-0018 corrigir o
  `.gitignore`; após cada `git add`, comparar `find <dir> -type f` com `git ls-files <dir>` (R-0016).
- **Critérios imutáveis:** mudança só por adenda numerada com decisão do Owner; critério substituído
  aparece no closure como não cumprido. Proibido repetir R-0013/R-0014 (axe por Lighthouse, focal por
  integral) e o waiver SQL2 de R-0007.
- **ODs no registro canônico** (`open-decisions-rait.md` §C-0002) no PR do CTG-0001.
- **Âncora da prova:** `audit observe` no sha exato do merge; `round close` + `round seal` com a âncora.
- **Orçamento:** `budget.json` desde o bootstrap; 80 % da janela → checkpoint e parada.
- **Caracterização antes da troca**, com presença e ausência (negativos de RLS e de fail-closed).
- **Leitura fechada:** `tmp/` não existe na worktree; os prompts transcrevem os fatos daqui e da spec.

## Decisões pendentes do Owner

| OD        | Pergunta                                                                                                       | Opções                                                                                                                                                     | Recomendação do Architect                                                               |
| --------- | -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| OD-R21-01 | Lacuna de assinatura sem equivalente STYNX 1.4.0 (nível, manifesto multi-signatário, prontidão por capacidade) | (a) contorno existente movido para a composição do app atrás da porta da fachada, com desvio em ADR, até R-0022; (b) bloquear CTG-0003 até 1.5.0           | (a): cumpre ADR-0018 §1 já (domínio sem provedor) sem reimplementar nada                |
| OD-R21-02 | Escopo da troca de outbox                                                                                      | (a) só fila de despacho (RENACH) agora, log de eventos em R-0022 com UPS-OBX-01; (b) tudo em R-0022                                                        | (a): a fila tem equivalente direto (o `OutboxService` nasceu da `renach_outbox` do PEC) |
| OD-R21-03 | `@stynx-nyx/notifications`                                                                                     | (a) montar agora (in-app + push _stub_, DDL `notifications.*`) sem produtor; (b) registrar "sem reimplementação local"; adoção junto do produtor de OD-P40 | (b): montar sem consumidor cria código morto; nada local a trocar                       |

## Decisões do maestro

## Concorrência

## Triagem

## Adendas

## Bloqueios

## Retomada

## Leitura
