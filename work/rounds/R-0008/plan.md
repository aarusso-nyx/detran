# R-0008 — frente `teat-backend` (WP-T2 + WP-T3 do TEAT: rotas, comandos, sincronização e contratos)

**Status:** planejado em 2026-09-14 pelo Architect; aguarda abertura por um maestro Fable 5.1
(prompt em `prompts/00-maestro.md`). Reviewer: GPT-5.6 Terra via `tools/orchestra/bridge.sh codex`
(escalar para Sol no `delivery-review` dos grupos de sincronização e política).
**Depende de:** `ops-agency` (R-0005) em `main`; `DetranError` de `rait-backend` (R-0007 CTG-0001)
se já mesclado — senão, esta frente o cria em `@detran/shared` e R-0007 rebaseia.
**Janelas previstas:** 4.

## Metas

1. **AIT completo** (`teat-route-contract.md` §3): `AitCommandsController` ganha `concurrency-review`,
   `cancel-requests` (`addressed_to=board` exige atributo `decision_body` em `traffic-authority`,
   steering H.39), `If-Match` via `ait_ait.version`; tokens de [WF-TEAT-001].
2. **Campo** (§4): `/v1/ops/mobile-bootstrap`, `sessions/handoff` (turno), numeração e sincronização
   `/v1/ops/offline-sync/*` (aplicação transacional por `entity_type`, recibos, conflitos, detecção de
   concorrência com `sync.concurrency_window_minutes` `source_pending` → comportamento "sem valor =
   sem detecção, com aviso"), evidência (intenção → upload → conclusão; `ops:evidence:complete-upload|validate`
   voltam à política), acesso a bodycam ([RN-TEAT-142]), snapshots (consultas via `packages/senatran-adapter`).
3. **Normativo** (§5): gerar/publicar/validar/retirar pacote; conteúdo assinado (ADR-0018).
4. **Medidas e alcoolemia** (§6): comandos com cálculo do valor considerado pela
   `normative_metrological_table`; velocidade atrás da flag `teat.speed_meters`.
5. **SSE** `/v1/ops/stream` (§7) e eventos publicados (§8, só `AIT_INTEGRADO` sai para a infração — ADR-0016);
   projeção de integrações.
6. **Política**: `TEAT_RULES`/`OPS_SURFACE_RULES` ⇔ rotas em ambos os sentidos, `policy-routes.spec.ts`
   (estender o de R-0007 ou criar); `ops:homologation`/`application-version` já lidos.
7. **Contratos** (WP-T3): `docs/framework/contracts/BP-INF-{AIT,NORMATIVE,MEASURES,ALCOHOL}-001.commands.openapi.json`
   e `BP-OPS-{FIELD,OFFLINE-SYNC,EVIDENCE,SNAPSHOTS}-001.commands.openapi.json` + bootstrap (um
   `operationId` por comando; DTOs com os nomes da origem; 4xx com `code` do `teat-error-catalog.md`;
   headers; exemplos com ids das fixtures); `docs/framework/schemas/teat-offline-sync-batch.schema.json`
   (`device_batch_id`, `batch_sequence`), `teat-normative-package.schema.json`, `teat-bootstrap.schema.json`;
   verificados por `contracts:check` (`check-commands.mjs` de R-0007; se ainda não existir, criar aqui).
8. Documentação: `teat-build-pack.md` §WP-T2/§WP-T3 executados; `teat-route-contract.md` §9 fechado;
   `docs/framework/schemas/README.md` deixa de ser stub; backlog.

## Tarefas

| Tarefa    | Papel        | Perfil              | Modelo/esforço | Lock                                                                              | Depende de                  | Entrega                                                                                                                                                          |
| --------- | ------------ | ------------------- | -------------- | --------------------------------------------------------------------------------- | --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TASK-0001 | Architect    | architect-blueprint | Opus / alto    | `MOD-teat-contracts-design`                                                       | —                           | contrato de cada comando (pré-estado, papel, pré-condições, pós-estado, erros) por seção do route contract; desenho da aplicação transacional do lote; critérios |
| TASK-0002 | Inspector    | inspector-tests     | Sonnet / médio | `MOD-inf-ait-tests`                                                               | TASK-0001                   | testes AIT: matriz [WF-TEAT-001], `cancel-requests` × `decision_body`, `If-Match`                                                                                |
| TASK-0003 | Engineer     | engineer-backend    | Sonnet / médio | `MOD-inf-ait`, `MOD-shared-policy`                                                | TASK-0002                   | comandos AIT + regras; testes verdes                                                                                                                             |
| TASK-0004 | Inspector    | inspector-tests     | Opus / alto    | `MOD-ops-offline-sync-tests`, `MOD-ops-field-tests`                               | TASK-0001                   | testes de sincronização (ACK perdido, retry, lote parcial, sequência repetida/gap, conflito, integridade), bootstrap, turno, numeração                           |
| TASK-0005 | Engineer     | engineer-backend    | Opus / médio   | `MOD-ops-offline-sync`, `MOD-ops-field`, `MOD-shared-policy`                      | TASK-0004                   | bootstrap, turno, numeração, sincronização; testes verdes                                                                                                        |
| TASK-0006 | Inspector    | inspector-tests     | Sonnet / médio | `MOD-ops-evidence-tests`, `MOD-ops-snapshots-tests`, `MOD-inf-normative-tests`    | TASK-0001                   | testes evidência (fluxo em três passos, bodycam com finalidade), snapshots (adapter mock), pacote normativo                                                      |
| TASK-0007 | Engineer     | engineer-backend    | Sonnet / médio | `MOD-ops-evidence`, `MOD-ops-snapshots`, `MOD-inf-normative`, `MOD-shared-policy` | TASK-0006                   | evidência, snapshots, normativo; testes verdes                                                                                                                   |
| TASK-0008 | Inspector    | inspector-tests     | Sonnet / médio | `MOD-inf-measures-tests`, `MOD-inf-alcohol-tests`, `MOD-ops-stream-tests`         | TASK-0001                   | testes medidas/alcoolemia (tabela metrológica, dois prazos OD-T05), SSE, `policy-routes.spec.ts`                                                                 |
| TASK-0009 | Engineer     | engineer-backend    | Sonnet / médio | `MOD-inf-measures`, `MOD-inf-alcohol`, `MOD-ops-stream`                           | TASK-0008                   | medidas, alcoolemia, SSE, projeção de integrações; testes verdes                                                                                                 |
| TASK-0010 | Engineer     | engineer-backend    | Sonnet / baixo | `MOD-contracts-commands`, `MOD-schemas`                                           | TASK-0003, 0005, 0007, 0009 | nove `.commands.openapi.json`, três schemas JSON, `contracts:check`/`contracts:clients` verdes                                                                   |
| TASK-0011 | Owner deleg. | transcriber-docs    | Sonnet / baixo | `MOD-docs`                                                                        | TASK-0010                   | build pack, route contract §9, schemas README, backlog                                                                                                           |

CTG-0001 = 0001…0003; CTG-0002 = 0004/0005; CTG-0003 = 0006/0007; CTG-0004 = 0008…0010. Um PR por CTG.

## Critérios de aceitação (comandos → resultado)

- `pnpm verify:decorators`, `pnpm verify:senatran-boundary` → OK.
- `pnpm --filter @detran/shared test` → `policy.spec.ts` verde com 100 % dos pares `inf:ait-*`,
  `inf:measures-*`, `inf:alcohol-*`, `inf:normative-*`, `ops:*` desta frente; `policy-routes.spec.ts`
  verde nos dois sentidos.
- `pnpm --filter @detran/inf-ait test:unit|test:integration|test:e2e` → verdes (idem normative,
  measures, alcohol e pacotes `ops` gerados em R-0005).
- `pnpm backend:test:e2e` → `inf-ait-routes.e2e.spec.ts` estendido aos novos comandos, verde.
- `pnpm contracts:check` → OK (nove contratos de comando); `pnpm contracts:clients` → sem erro.
- `pnpm backend:test:ci` → verde; `pnpm check` → verde; `node tools/docs/kb/check.mjs` → 521/446.

## Mapa entregável → definições

| Entregável    | Definição                                                                               |
| ------------- | --------------------------------------------------------------------------------------- |
| rotas         | `teat-route-contract.md` §1–§9; DTOs da origem preservados ali                          |
| estados       | [WF-TEAT-001…005]; `inf.ait_state_ref` (R-0005)                                         |
| sincronização | [WF-TEAT-002]; [UC-TEAT-012]; AC-TEAT-012-*; OD-T03/T07 (H.54; janela `source_pending`) |
| evidência     | [RN-TEAT-142]; INV-EVIDENCE-001; OD-T08 (bodycam: chrome e metadados desde já)          |
| homologação   | steering H.55 (`teat.homologation.expired_behavior=warn`)                               |
| cancelamento  | [UC-TEAT-011]; steering H.39 (`decision_body`)                                          |
| erros         | `teat-error-catalog.md`                                                                 |
| payloads      | `rait-build-pack.md` §0; `teat-frontends.md` §9                                         |

## Riscos

- `policy.ts` compartilhado com `rait-backend` (R-0007): blocos distintos; rebase da segunda a mesclar.
- Sem `sync.concurrency_window_minutes` (DT-016): o detector fica desligado com aviso, nunca com
  valor inventado.
- Bodycam: só chrome/metadados; retenção `teat.bodycam.retention_days` `source_pending` (DT-049).
- Guarda monitorada e medidores acoplados: rotas registradas e desligadas por flag (`teat.monitored_custody`, `teat.speed_meters`).

## Bloqueios

(nenhum)

## Retomada

(vazio)

## Leitura

(preenchido pelo maestro)
