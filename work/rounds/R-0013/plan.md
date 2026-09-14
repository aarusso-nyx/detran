# R-0013 — frente `teat-frontends` (WP-T4, WP-T5, WP-T6 do TEAT: fichas, formulários, i18n, provisionamento offline e apps mobile/web)

**Status:** planejado em 2026-09-14 pelo Architect; aguarda abertura por um maestro GPT-5.6 Sol
(prompt em `prompts/00-maestro.md`). Reviewer: Opus 5 via `tools/orchestra/bridge.sh claude`
(Fable 5.1 no `delivery-review` do provisionamento).
**Concorrência:** abre com `origin/main` ≥ 80d705a; merge por grupo acoplado — CTG-0001 (reconciliação do corpus) e CTG-0002 (126 fichas, i18n, transições, diagramas): nenhum upstream. CTG-0003 (provisionamento offline: ADR, blueprint, rotas): `ops-agency` R-0005 (`orchestra/ops-agency`). CTG-0004 (apps mobile e web): `teat-backend` R-0008 (schemas e clientes) e `rait-web` R-0012 (lock `packages/ui`).
**Janelas previstas:** 5 (o maior da carteira; um PR por grupo).

## Metas

1. **Reconciliação do corpus antes das fichas** (teat-build-pack §5, PR próprio): `use-cases/INDEX.md`
   (status reais, UC-TEAT-013), `APP.md` (50 regras), OD-T06 (`no_approach_reason` classificado;
   UC-TEAT-002 reconciliado), `allows_no_approach` enum, OD-T05 (dois prazos), hipótese de cada teto
   `T-REG30`/`T-REG15`, numeração de UC-TEAT-008/009, OD-T03, OD-T07, etilômetro sem certificado
   (bloqueio adotado), testemunha/termo (WP-T1 já cobre), "68 × 67 telas". Sem regra nova; só
   consistência com as decisões H.54/H.55.
2. **Fichas e formulários** (WP-T4): `docs/framework/product/domains/inf/teat/screens/IU-TEAT-<screenId>.md`
   para as 126 telas (70 mobile + 56 web; sinistros marcadas BOAT), com objetivo, papel, dados
   (bootstrap/pacote/API), layout, componentes (`teat-frontends.md` §6), ações e comandos, estados
   vazio/erro/offline, atalhos, ergonomia, `AC-TEAT-*`; `apps/teat/mobile/src/app/forms/*.schema.ts`
   (§8); `i18n/teat.pt-BR.json` (estados [WF-TEAT-001…005], bloqueadores do bootstrap, erros,
   rótulos); `transitions.ts` com as 576 transições; diagramas de estrutura no modelo de
   `rait-web-structure-diagrams.md`. Baseline do KB sobe em 126 (+1 se UC-TEAT-013 for novo).
3. **Provisionamento offline** (WP-T5): ADR "Provisionamento operacional offline" (número livre
   seguinte; previsto ADR-0025): chave do dispositivo no Keystore, grant `OfflineOperationalGrantV1`,
   pacote assinado por KMS, envelope cifrado, revogação por época, reconciliação obrigatória;
   `BP-OPS-PROVISIONING-001` (`device_key`, `offline_authorization_grant`, `provisioning_package`,
   `provisioning_receipt`, `device_revocation`; DDL `19-ops-provisioning.sql`); rotas
   `/v1/ops/provisioning/*` (desafio, registro de chave, emissão, download, recibo, prontidão,
   revogação, reconciliação); `ReadinessGate` integrado. Fases P0–P6 da origem como plano.
4. **Apps** (WP-T6): `apps/teat/mobile` (`@detran/teat-mobile`; Capacitor via `@stynx-nyx/mobile-runtime`;
   `FieldShell`, `ReadinessGate`, `LocalActStore`, `SyncWorker`, `NormativePackageService`,
   `BodycamIndicator`; 8 módulos; 70 rotas; formulários; impressora via porta com `FixturePrinter`
   nos testes) e `apps/teat/web` (`@detran/teat-web`; `@detran/ui`; 12 módulos; 56 + 4 rotas). Scripts
   `build|test|lint|typecheck` criados nesta rodada e ligados a `pnpm check`. O módulo `sinistros`
   da web e a biblioteca de sinistro mobile são de R-0015 (BOAT): aqui só os pontos de extensão do shell.
5. Documentação: `teat-build-pack.md` §WP-T4…T6 executados (gates reais); `teat-frontends.md` §10–§12;
   ADR nova; backlog.

## Tarefas

| Tarefa    | Papel        | Perfil              | Modelo/esforço | Lock                                                          | Depende de           | Entrega                                                                                                                                              |
| --------- | ------------ | ------------------- | -------------- | ------------------------------------------------------------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| TASK-0001 | Owner deleg. | transcriber-docs    | Luna / baixo   | `MOD-product-teat`, `MOD-kb-manifest`                         | —                    | reconciliação §5 (12 itens), PR próprio                                                                                                              |
| TASK-0002 | Architect    | architect-blueprint | Terra / alto   | `MOD-teat-apps-arch`                                          | TASK-0001            | decisões dos apps (pastas §10, forma dos schemas, porta da impressora, pontos de extensão para o BOAT), lista fechada tela → ficha → rota, critérios |
| TASK-0003 | Owner deleg. | transcriber-docs    | Luna / baixo   | `MOD-product-teat-screens-mobile`                             | TASK-0002            | 70 fichas mobile; manifesto                                                                                                                          |
| TASK-0004 | Owner deleg. | transcriber-docs    | Luna / baixo   | `MOD-product-teat-screens-web`                                | TASK-0002            | 56 fichas web; diagramas de estrutura                                                                                                                |
| TASK-0005 | Engineer     | engineer-frontend   | Luna / baixo   | `MOD-teat-i18n-transitions`                                   | TASK-0002            | `i18n/teat.pt-BR.json`, `transitions.ts` (576), teste "cada tela da matriz tem ficha e rota"                                                         |
| TASK-0006 | Architect    | architect-blueprint | Terra / alto   | `MOD-adr`, `MOD-bp-ops-provisioning`, `MOD-ddl-19`            | TASK-0002            | ADR de provisionamento, blueprint, contrato das rotas, matriz de prova (pacote copiado/alterado/expirado/revogado)                                   |
| TASK-0007 | Inspector    | inspector-tests     | Terra / alto   | `MOD-ops-provisioning-tests`                                  | TASK-0006            | testes da matriz de prova; "sem chave privada no servidor" (teste de configuração)                                                                   |
| TASK-0008 | Engineer     | engineer-backend    | Terra / médio  | `MOD-ops-provisioning`, `MOD-shared-policy`, `MOD-app-module` | TASK-0007            | módulo, rotas, `ReadinessGate` (contrato consumido pelo mobile); testes verdes                                                                       |
| TASK-0009 | Inspector    | inspector-tests     | Luna / médio   | `MOD-teat-mobile-tests`, `MOD-teat-web-tests`                 | TASK-0005            | testes de roteamento por papel (70 + 60), matriz de 576 transições, TestBed dos compartilhados, `FixturePrinter`                                     |
| TASK-0010 | Engineer     | engineer-frontend   | Terra / médio  | `MOD-teat-mobile-app`, `MOD-packages-ui`                      | TASK-0008, TASK-0009 | `apps/teat/mobile` completo (8 módulos, 70 rotas, formulários, serviços); testes verdes                                                              |
| TASK-0011 | Engineer     | engineer-frontend   | Terra / médio  | `MOD-teat-web-app`, `MOD-package-json`                        | TASK-0009            | `apps/teat/web` (12 módulos, 60 rotas); `pnpm check` estendido; testes verdes                                                                        |
| TASK-0012 | Owner deleg. | transcriber-docs    | Luna / baixo   | `MOD-docs`                                                    | TASK-0010, TASK-0011 | build pack (gates reais), `teat-frontends.md`, ADR, backlog                                                                                          |

CTG-0001 = 0001; CTG-0002 = 0003…0005 (fichas/i18n); CTG-0003 = 0006…0008 (provisionamento);
CTG-0004 = 0009…0011 (apps). Um PR por CTG.

## Critérios de aceitação (comandos → resultado)

- `node tools/docs/kb/check.mjs` → baseline + 126 (+1) / 446, atualizado no mesmo commit; `pnpm docs:kb:publish-check` → OK.
- `pnpm blueprints:check`, `pnpm contracts:check`, `pnpm verify:rls-ddl`, `pnpm verify:decorators` → OK.
- `pnpm --filter @detran/ops-provisioning test:unit|test:integration|test:e2e` → verdes, incluindo os
  quatro rejeitos da matriz de prova; `pnpm --filter @detran/shared test` → `policy.spec.ts` cobre `ops:provisioning:*`.
- `pnpm --filter @detran/teat-mobile typecheck|test|build|lint` e `pnpm --filter @detran/teat-web typecheck|test|build|lint` → verdes.
- teste tela ↔ ficha ↔ rota: 126/126; matriz de transições: 576/576.
- `pnpm check`, `pnpm backend:test:ci` → verdes.

## Mapa entregável → definições

| Entregável      | Definição                                                                                                  |
| --------------- | ---------------------------------------------------------------------------------------------------------- |
| fichas          | matriz de paridade da origem (67/56 → 70/56); `teat-frontends.md` §4–§7; [IU-TEAT-001]; [JRN-TEAT-001…006] |
| formulários     | `teat-frontends.md` §8; [WF-TEAT-001…005]; [RN-TEAT-*]; `teat-error-catalog.md`                            |
| hierarquia      | `teat-frontends.md` §1–§3, §9–§12; `rait-web-structure-diagrams.md` (modelo)                               |
| provisionamento | `teat-build-pack.md` §WP-T5; plano P0–P6 e matriz de prova da origem (somente leitura); INV-OFFLINE-001    |
| bootstrap/sync  | `teat-route-contract.md` §4 e §7; schemas de R-0008                                                        |
| decisões        | steering H.39, H.54, H.55; OD-T03…T12                                                                      |

## Riscos

- Volume: 126 fichas em duas tarefas de transcrição; se a janela acabar, `checkpoint` com a lista
  das fichas concluídas (o teste tela ↔ ficha falha até completar — nunca reduzir a matriz).
- `packages/ui`: lock com `rait-web`; esta frente só abre depois de R-0012 mesclado.
- Provisionamento toca `backend/domains/ops` e `policy.ts`: na onda 6 a outra frente ativa é
  `portal-pwa`, sem lock comum.
- Impressora real, KMS real e Keystore: fora desta frente (integração); portas com fixtures.

## Concorrência

(preenchido pelo maestro no bootstrap: upstreams já em `main`, grupos liberados para merge, grupos
em base empilhada e sobre qual branch)

## Bloqueios

(nenhum)

## Retomada

(vazio)

## Leitura

(preenchido pelo maestro)
