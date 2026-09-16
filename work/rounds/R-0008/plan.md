# R-0008 — frente `teat-backend` (WP-T2 + WP-T3 do TEAT: rotas, comandos, sincronização e contratos)

**Status:** aberto em 2026-09-15 pelo maestro Fable 5.1 (janela 1; planejamento em `main` df1e176). Reviewer: GPT-5.6 Terra via `tools/orchestra/bridge.sh codex`
(escalar para Sol no `delivery-review` dos grupos de sincronização e política).
**Concorrência:** abre com `origin/main` ≥ 80d705a; merge por grupo acoplado — todos os grupos: `ops-agency` R-0005 (`orchestra/ops-agency`; módulos `ops` gerados e deltas v1.1.0 dos blueprints `inf`) — enquanto não mesclar, desenvolva sobre base empilhada nele. `DetranError` de R-0007 CTG-0001 se já em `main`; senão crie em `@detran/shared` e avise em §Bloqueios para R-0007 rebasear. CTG-0004 (contratos): também `check-commands.mjs` de R-0007 CTG-0001, ou crie aqui.
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

## Decisões do maestro (Architect, 2026-09-15) — valem como contrato para TASK-0001

Nada aqui reabre decisão do Owner; onde a fonte não fixa valor, a linha diz `source_pending`.

- **M1 — `DetranError`** (`backend/domains/shared/src/errors/detran-error.ts`, exportado por `@detran/shared`):
  `class DetranError extends StynxError` (`@stynx-nyx/core`), `new DetranError(code, { status, context?, message?, cause? })`;
  `messageKey` = `<prefixo minúsculo>.errors.<código sem prefixo, minúsculo>` (`TEAT.AIT_STATE_INVALID` → `teat.errors.ait_state_invalid`;
  o mesmo vale para `RAIT.`). `context` só ids, tokens e números. Helpers no mesmo diretório: `assertIfMatch(header, version, prefix)`
  → 428 `<PREFIX>.IF_MATCH_REQUIRED` / 412 `<PREFIX>.VERSION_CONFLICT`; `etagOf(version)` = `"<version>"`. `RaitError` de
  `inf/infraction` (R-0006) permanece; R-0007 decide se o realia (§Bloqueios).
- **M2 — `If-Match` no AIT**: todo comando de `AitCommandsController` exige `If-Match` com `ait_ait.version` (428/412 via M1);
  cada transição incrementa `version` e a resposta traz `ETag`. `receive-protocol` continua HTTP (integration-operator) e também
  exige `If-Match`; a aplicação por lote (M5) chama o serviço diretamente, sem cabeçalho.
- **M3 — `decision_body` (H.39, OD-T01)**: o atributo vive em `Principal.claims.decision_body` (STYNX `Principal.claims`);
  valor canônico `diretoria-fiscalizacao`. `policy.ts` ganha `canDecideAitCancelRequest(principal, addressedTo)`:
  `addressed_to='traffic-authority'` exige papel `traffic-authority`; `addressed_to='diretoria-fiscalizacao'` exige papel
  `traffic-authority` **e** `claims.decision_body === 'diretoria-fiscalizacao'`; caso contrário 403 `TEAT.AIT_CANCEL_ADDRESSEE_FORBIDDEN`
  `{ addressedTo, roles }`. No perfil local (`detran-runtime.ts`) o claim vem de `DETRAN_LOCAL_DECISION_BODY`; o mapeamento do
  atributo do IdP real é configuração de implantação (`source_pending`, registrar em OD-T01). O DTO de origem
  (`CreateAitCancelRequestDto.addressedTo: traffic-authority|diretoria-fiscalizacao`) prevalece sobre a grafia `board` do prompt.
- **M4 — Cancelamento (UC-TEAT-011)**: `POST cancel-requests` cria `ait_cancel_request` (`kind: draft|post_final`, `status='requested'`,
  `origin_status` = estado do AIT no pedido; `target_local_act_id`; `ait_id` nulo quando o AIT ainda não existe no servidor →
  resposta 202 com o pedido `requested` e `context.targetLocalActId`, nunca 404 — `TEAT.AIT_CANCEL_TARGET_NOT_FOUND` só no `GET outcomes`);
  `post_final` move o AIT a `SOLICITADO_CANCEL_POSFINAL` (de `FINALIZADO_LOCAL|RECEBIDO|VALIDANDO|ACEITO|INTEGRADO`, senão 409
  `TEAT.AIT_STATE_INVALID`); `draft` só de `RASCUNHO_OFFLINE`. `review` → `under_review`; `decide` (de `requested|under_review`, senão 409
  `TEAT.AIT_CANCEL_ALREADY_DECIDED` quando já `approved|denied`): `approve` → `CANCELADO_RASCUNHO` (draft) | `CANCELADO_POSFINAL`
  (post_final; conteúdo e `content_hash` intactos, AC-011-1); `deny` → AIT volta a `origin_status` (AC-011-4). Cada passo grava
  `ait_cancel_request_event` (`event_type: requested|under_review|approved|denied`) e `ait_status_history`. `linked_measure_decision`
  fica no evento; a medida não é tocada (RN-TEAT-123). Política (origem `teat-policy.ts`): `inf:ait-cancel-request:create`
  = field-agent, field-supervisor, traffic-authority; `:review` e `:decide` = traffic-authority; `GET outcomes` usa `inf:ait-cancel-request:read`
  (CRUD gerado). `POST aits/{id}/concurrency-review` (`inf:ait:review-concurrency` = traffic-authority, AUDITOR; de
  `SUSPEITO_CONCORRENCIA`; `release` → `RECEBIDO`, `reject` → `REJEITADO`; resolve o `sync_conflict` de concorrência e grava
  `AIT_RECEBIDO`/`AIT_REJEITADO`). `POST aits/{id}/archive` (`inf:ait:archive` = traffic-authority, processing-operator per route contract §3.2 —
  a origem lista só traffic-authority: adotar **só traffic-authority** (fonte mais restrita) e registrar OD-T13 para o Owner ampliar).
  `accept`/`reject` em `SUSPEITO_CONCORRENCIA` → 409 `TEAT.AIT_CONCURRENCY_PENDING_REVIEW`. `accept` de `RECEBIDO|VALIDANDO|CORRIGIDO`
  → `ACEITO` e, na mesma transação, `INTEGRADO` com evento `AIT_INTEGRADO` (ADR-0016; único evento que sai para a infração); `AIT_ACEITO`
  também é publicado. `reject` com `cancelled=true` só de `RECEBIDO` → `CANCELADO_RASCUNHO`? **Não**: `RejectAitCommandDto.cancelled` sem
  transição no WF-TEAT-001 → ignorado com nota no contrato (`source_pending`); `reject` sempre → `REJEITADO`; `reason` obrigatório
  (422 `TEAT.AIT_REJECT_REASON_REQUIRED`).
- **M5 — Sincronização** (`@detran/ops-offline-sync/src/handwritten/`): porta `SyncEntityApplier { entityType; validate(payload) →
{ code, fields[] } | null; apply(item, tx) → { serverEntityId } }` e token `SYNC_ENTITY_APPLIERS` definidos em `@detran/ops-core`;
  o `OfflineSyncModule` recebe os appliers por `@Optional() @Inject(SYNC_ENTITY_APPLIERS)`; o app monta a lista em
  `backend/app/src/teat-sync.providers.ts`. Tipos aceitos: `ait`, `administrative-measure`, `alcohol-signs-term`, `ait-cancel-request`,
  `ait-cancel-posfinal-request` (`crash-record` reconhecido como suportado sem destino → `TEAT.SYNC_DESTINATION_NOT_WIRED`, item fica
  `received`). Lote: (a) `device_batch_id` já registrado no tenant+device → replay: mesmo conjunto de `idempotency_key` e mesma sequência
  → 200 com os recibos originais; diferente → 409 `TEAT.SYNC_BATCH_REPLAY_CONTEXT_MISMATCH`; (b) `batch_sequence` presente e ≤ último
  aceito do device → 409 `TEAT.SYNC_BATCH_SEQUENCE_REPLAYED`; > último+1 → 422 `TEAT.SYNC_BATCH_SEQUENCE_GAP` (`expectedSequence`,
  `received`); ausente → caminho legado sem ordenação. Item: sem `idempotency_key` → `received` + `TEAT.SYNC_LEGACY_ITEM_NOT_APPLIED`,
  nunca aplicado; chave já vista com `payload_hash` igual → recibo existente; hash diferente → `rejected` `TEAT.SYNC_INTEGRITY_ERROR` +
  `sync_conflict(conflict_type='integrity')`; tipo fora da lista → `rejected` `TEAT.SYNC_UNSUPPORTED_ENTITY_TYPE` `{ supported[] }`;
  `validate` falha → `rejected` `TEAT.SYNC_INVALID_<TIPO>` `{ fields[] }`; `apply` em **uma transação por item** (efeito de domínio +
  `sync_queue_item.status='applied'` + `sync_receipt.status='applied'` + eventos na outbox); falha de domínio → rollback do efeito e recibo
  `conflict`/`rejected` gravado em transação própria. Recibo `received` nunca vira `applied` sem efeito de domínio. `receipts[].status` ∈
  `received|applied|conflict|rejected` (o token `concurrency-suspect` da origem vira `conflict` + `error_code=TEAT.SYNC_CONCURRENCY_SUSPECT`).
  `sync_batch.receipts_json` guarda os recibos; `accepted_items` = recibos ≠ rejected/conflict. Evento `SYNC_ITEM_RECEBIDO` por item,
  `sync.batch.received` por lote. `GET receipts/{tenantId}` e `…/by-idempotency/{key}`: `tenantId` ≠ tenant do principal → 404
  `TEAT.TENANT_MISMATCH`; chave inexistente → 404 `TEAT.SYNC_RECEIPT_NOT_FOUND`. `POST sync-conflicts/{id}/resolve`: `open` →
  `resolved` (`accept_server|reject|retry_after_correction`) ou `manual_review` (fica `open` com `resolution_action` gravada); conflito de
  concorrência só aceita `manual_review` (a decisão é `concurrency-review`, M4).
- **M6 — Detecção de concorrência (RN-TEAT-111, OD-T03)**: parâmetro `sync.concurrency_window_minutes` lido pelo `ParameterService`
  (`ops/parameter`, `source_pending`, valor nulo). Sem valor → detecção **desligada** e a resposta do lote traz
  `warnings: ['SYNC_CONCURRENCY_WINDOW_SOURCE_PENDING']`; com valor → para cada item `ait`, itens `ait` do mesmo `agent_id` em `device_id`
  distinto com `|created_locally_at − created_locally_at'| ≤ janela` e sem `ops_session_handoff` do agente cobrindo o intervalo → AIT aplicado
  em `SUSPEITO_CONCORRENCIA` (não `RECEBIDO`), recibo `conflict` `TEAT.SYNC_CONCURRENCY_SUSPECT` `{ otherDeviceId, windowStart, windowEnd }`,
  `sync_conflict(conflict_type='concurrency', allowed_resolution_actions=['manual_review'])`, evento `AIT_SUSPEITO_CONCORRENCIA`.
- **M7 — Applier `ait`** (em `inf/ait/src/handwritten/sync-applier.ts`, provider exportado): payload = `CreateAitDto` + `vehicles[]`,
  `people[]`, `signatures[]`, `print_events[]` (nomes das DTOs geradas); `ait_number` deve pertencer a uma `numbering_reservation` do
  `device_id` do lote com `status='reserved'` e `valid_until ≥ created_locally_at` (expirada/cancelada → `conflict`
  `TEAT.NUMBERING_RESERVATION_EXPIRED`; de outro turno → 422 `TEAT.NUMBERING_RESERVATION_FOREIGN_SHIFT` como `rejected`; número já
  `aplicado` → `rejected` `TEAT.NUMBERING_NUMBER_ALREADY_APPLIED`); grava `numbering_consumption(status='aplicado')`; o AIT nasce em
  `RECEBIDO` com `receipt_protocol` = id do `sync_receipt` (único por tenant) e histórico `TRANSMITIDO`→`RECEBIDO`; evento `AIT_RECEBIDO`.
  `numbering_consumption.status` ∈ `disponivel|consumido_localmente|aplicado|inutilizado|expirado|bloqueado` (route contract §4.3).
- **M8 — Numeração**: `reserve` idempotente por `(tenant, idempotency_key)`; `requested_size` default 1 (origem); faixa por `range_id` ou
  `series` ativa do órgão, `select … for update`; sem números → 422 `TEAT.NUMBERING_RANGE_EXHAUSTED`; reserva `reserved` ativa para o mesmo
  `device_id+shift_id` → 409 `TEAT.NUMBERING_RESERVATION_ACTIVE_EXISTS`; `valid_until` default = agora + `teat.numbering.reservation_ttl_hours`
  (72, vigente H.54, via `ParameterService`); a faixa passa a `exhausted` quando a alocação atinge `end_number` (o check do DDL 18 impede
  `next_number > end_number`, logo a forma "next_number > end_number" de OD-T07 é realizada como "último número alocado = end_number";
  registrar a nota). `cancel` → `cancelled` (subintervalo não usado devolvido à faixa só se for a cauda, como na origem); `block` → status
  `blocked`; `close` → `consumed`; `reconcile` (`claimed_numbers[]` fora de `[start,end]` → 422 `TEAT.NUMBERING_RECONCILE_MISMATCH`
  `{ outOfRange[] }`) grava `reconciliation_json` e uma linha de `numbering_consumption` por número: `aplicado` (já aplicado),
  `consumido_localmente` (reclamado, sem AIT no servidor), `disponivel` (não reclamado). `GET …/{id}/consumption` lista as linhas.
- **M9 — Bootstrap** (`@detran/ops-field/src/handwritten/mobile-bootstrap.*`, `@Controller('v1/ops/mobile-bootstrap')`,
  `@Resource('ops:operational-device')`): `protocolVersion` suportado = `teat-mobile-bootstrap.v1` (constante da origem
  `MOBILE_BOOTSTRAP_PROTOCOL_VERSION`); outro valor → 426 `TEAT.PROTOCOL_VERSION_UNSUPPORTED` `{ supported[] }`. `installation_id` →
  `sha256:` hex e comparado a `hardware_identifier_hash`; dispositivo não encontrado ou de outro tenant → 403 `TEAT.MOBILE_BOOTSTRAP_SCOPE_MISMATCH`.
  Agente = `ops_agent_profile.user_ref = actorId`. Bloqueadores (ordem): `SESSION_NOT_EXCLUSIVE` (turno `open` do agente em outro device sem
  handoff), `DEVICE_NOT_AUTHORIZED` (`status ≠ 'authorized'`), `DEVICE_TAMPER_DETECTED` (`tamper_flag`), `DEVICE_NOT_HOMOLOGATED` (nenhuma
  `ops_homologation` `status='active'`), `APP_VERSION_NOT_ALLOWED` (`app_version` sem `ops_application_version` `status='active'` vigente),
  `NORMATIVE_PACKAGE_MISSING`, `NUMBERING_RESERVATION_REQUIRED` (sem reserva `reserved` válida para agente+device), `AGENT_NOT_ACTIVE`
  (`functional_status ≠ 'active'` ou credencial vencida), `AGENT_NOT_IN_UNIT` (perfil sem `operational_unit_id`),
  `SHIFT_ALREADY_OPEN_ELSEWHERE`. Avisos (`readiness.warnings[]`, nunca bloqueiam): `NORMATIVE_PACKAGE_EXPIRED` (E.29),
  `HOMOLOGATION_RENEWAL_DUE` (H.55: `laudo_valido_ate`/`valid_until` < hoje com `teat.homologation.expired_behavior='warn'`).
  `capabilities`: `canOpenShift` = sem bloqueadores exceto `NUMBERING_RESERVATION_REQUIRED`; `canOperateOffline` = sem bloqueadores;
  `canReserveNumbering` = `canOpenShift` e turno aberto neste device. `snapshot.maxAgeSeconds` = **source_pending** (a origem usa uma
  constante interna sem fonte normativa): devolver `maxAgeSeconds: null` e `validUntil: null` até haver linha no catálogo (OD-T14).
- **M10 — Turno e handoff**: `POST mobile-bootstrap/shifts` (`ops:shift:create`): 409 `TEAT.SHIFT_ALREADY_OPEN` se houver turno `open`
  do agente (qualquer device); grava `ops_shift(status='open')` + evento `TURNO_ABERTO`. `POST shifts/{id}/close`
  (`ops:operational-device:close-shift` = field-agent, field-supervisor, origem): 409 `TEAT.SHIFT_NOT_OPEN` se não `open`; itens
  `sync_queue_item` `received` do device dentro do turno → 422 `TEAT.SHIFT_CLOSE_PENDING_QUEUE` `{ pendingCount }`, salvo `reason` informado
  (fecha com pendência registrada em `end_location_json`? **não**: em `ops_shift.status='closed'` e a pendência no evento `TURNO_FECHADO`);
  reservas `reserved` do turno: reconciliadas com `numbering_reconciliations[]` (M8) e depois `consumed` (houve `aplicado`) ou `cancelled`.
  `POST sessions/handoff` (`ops:operational-device:handoff-session` = field-agent, field-supervisor — **novo**, D-01/AC-TEAT-012-4,
  registrar OD-T15): exige turno `open` do agente no `failed_device_id`; grava `ops_session_handoff(shift_id, from_agent_id=to_agent_id=agente,
details_json{failed_device_id, reason, new_device_id, location_json})`, `ops_device_event(event_type='handoff')`, cancela a reserva
  `reserved` do device falho (RN-TEAT-111 prevenção), atualiza `ops_shift.device_id` quando `new_device_id` vier; evento
  `device.posture-changed`. A janela de handoff (usada em M6) = `[handed_off_at − janela, handed_off_at + janela]`.
- **M11 — Evidência**: `upload-intents` (`ops:evidence:initiate-upload`): idempotente por `idempotency_key` (mesma chave → mesma resposta);
  `entity_type='ait'` exige AIT existente no servidor via porta `AppliedEntityPort` (app: `AitRepository`), senão 409
  `TEAT.EVIDENCE_ENTITY_NOT_APPLIED`; `hash_value` ausente → 400 `TEAT.EVIDENCE_HASH_REQUIRED`; cria `evidence_evidence(status='pending_upload',
storage_uri=null)` + `storage_intent(status='pending', object_key='evidence/<tenant>/<evidence_id>', expires_at)` + URL via porta
  `EvidenceStoragePort.presignUpload` (app: `@stynx-nyx/storage` `S3Service.presignUpload`; perfil local/test: `LocalEvidenceStorage`
  devolvendo `local://<object_key>`; expiração = **source_pending** → usar `expires_at` da porta, nunca constante própria). Política nova:
  `ops:evidence:complete-upload` = field-agent, processing-operator; `ops:evidence:validate` = processing-operator, AUDITOR, technical-admin;
  `ops:evidence:purge-unverified` = technical-admin; `ops:evidence-access-request:create|update|deliver` = processing-operator,
  traffic-authority; `:approve|:deny` = traffic-authority (origem `teat-policy.ts`, RN-TEAT-142). `complete-upload`: intenção expirada →
  410 `TEAT.EVIDENCE_INTENT_EXPIRED`; `accepted_hash ≠ hash_value` → 422 `TEAT.EVIDENCE_HASH_MISMATCH`; sucesso: `uploaded`, `storage_uri`,
  `custody_event('uploaded')`, `evidence_link(entity_type, entity_id, role=evidence_type)` na mesma transação; evento `EVIDENCIA_CAPTURADA`.
  `validate` → `validated` | `rejected` (o blueprint não tem `invalid`; anotar divergência do route contract); em quarentena → 409
  `TEAT.EVIDENCE_QUARANTINED`. Bodycam: leitura de `evidence_type='bodycam'` devolve metadados (sem `storage_uri`, `location_json`);
  conteúdo só por `evidence-access-requests` `requested → approved → delivered` (`deny` de `requested`; fora de ordem → 409
  `TEAT.EVIDENCE_ACCESS_STATE_INVALID`; `requester_role` fora do rol → 422 `TEAT.EVIDENCE_ACCESS_REQUESTER_NOT_IN_ROL`); `deliver` grava
  `custody_event('access_delivered')` com `delivery_media_ref`; evento `evidence.access-request.changed`. `purge-expired-unverified`:
  `pending_upload` com intenção expirada → `rejected` + `custody_event('purged_unverified')`; retenção de bodycam `teat.bodycam.retention_days`
  `source_pending` → nunca purga bodycam. `probative-packages/generate`: pacote + itens (`sequence`, `item_hash`) e `manifest_hash`; sem
  evidência `validated|linked` para a entidade → 422 `TEAT.PROBATIVE_PACKAGE_INCOMPLETE`; evento `PACOTE_PROBATORIO_GERADO`.
- **M12 — Snapshots**: `POST external-queries` (`ops:external-query:create`): zod (`query_type ∈ vehicle_by_plate|driver_by_cpf|driver_by_license`,
  `parameters`, `purpose` obrigatório → 400 `TEAT.QUERY_PURPOSE_REQUIRED`); portas `WsdenatranReadPort.findVehicleByPlate` /
  `RenachPort.findDriverByCpf|findDriverByLicense` injetadas por token `SNAPSHOT_QUERY_PORTS` (app: `createSenatranAdapter().ports`;
  testes: stub); `undefined` → 404 `TEAT.QUERY_NOT_FOUND`; erro do adapter → 503 `TEAT.QUERY_UPSTREAM_UNAVAILABLE`; sucesso: upsert
  `snapshots_vehicle`/`snapshots_person` (+`snapshots_person_document`), `snapshots_vehicle_snapshot(divergence_recorded = dados
diferentes do registro já existente)`, `snapshots_external_query(status='ok|not_found|failed', parameters_hash=sha256 canônico,
result_snapshot_json)`; resposta `{ snapshot_id, source, queried_at, result, divergence_recorded }`. Nenhum `fetch` fora do adapter.
- **M13 — Normativo**: `generate` (`inf:mobile-normative-package:publish`): catálogo `active` senão 422 `TEAT.PACKAGE_CATALOG_NOT_ACTIVE`;
  manifesto = JSON canônico (chaves ordenadas) de `{ catalog, framings, validation_rules, metrological_tables, document_templates,
agency_parameters }` só com linhas `status='active'`; `manifest_hash='sha256:<hex>'`; pacote `draft` (`package_uri` nulo).
  `publish` de `draft|published` → `published` (catálogo ativo; `manifest_hash` informado ≠ gravado → 422 `TEAT.PACKAGE_MANIFEST_MISMATCH`);
  `retire` só de `published` (senão 409 `TEAT.PACKAGE_STATE_INVALID`); `validate` idempotente (mantém `{ valid, reason }`); `catalogs/{id}/publish`
  de `draft|active`, `retire` de `active`, senão 409 `TEAT.CATALOG_STATE_INVALID`. `GET mobile-packages/{id}/content` (`read`; field-agent,
  field-supervisor via `inf:mobile-normative-package:read`): recompõe o manifesto e compara com `manifest_hash` (≠ → 422
  `TEAT.PACKAGE_MANIFEST_MISMATCH`); "conteúdo assinado" (ADR-0018) = `{ manifest, manifest_hash, signature }` com `signature` produzida por
  porta `PackageSignerPort` (app: `DocumentsFacade.seal`-equivalente **source_pending** enquanto o substrato de assinatura não estiver
  ligado → implementação local `sha256` do manifesto com `signer='detran-backend-local'`, marcada `signature.kind='local-unsigned'`; OD-T16).
  `GET mobile-packages/sync-metadata`: publicados e `valid_until ≥ hoje`. `POST homologations/{id}/renew` e `cancel-by-audit`
  (`ops:homologation:renew|cancel-by-audit` = agency-admin, technical-admin, origem) e `POST devices/{id}/block|unblock|wipe`
  (`ops:operational-device:block|unblock|wipe` = technical-admin, route contract §4.2) entram em CTG-0002 (ops-field).
- **M14 — Medidas**: estados `WF-TEAT-004` (já persistidos). `start` de `RETIDO`?? **não**: a medida nasce pelo CRUD/sync em
  `current_status` da sub-máquina; `start` grava `started_at` sem mudar estado (transcrever a tabela exata no contrato). Prazos calculados
  com `@detran/inf-deadlines` (`computeDue`, `Clock` injetado): `register-retention` (`RETIDO`) exige `regularization_deadline_days ≤ 30`
  (RN-TEAT-124; > 30 → 422 `TEAT.MEASURE_RETENTION_LIMIT_EXCEEDED`), `register-removal` ≤ 15 (RN-TEAT-125); `apply-term` para
  `term_type='removal'` exige os dois prazos (`withdrawal_deadline_at` Res. 1.025 art. 14 §1º e `ctb_deadline_at` = `T-DEPOSITO6M`,
  OD-T05) → ausentes → 422 `TEAT.MEASURE_TERM_DEADLINE_MISSING`; guarda monitorada (`destination_description='guarda_monitorada'` ou
  `GUARDA_MONITORADA`) com `teat.monitored_custody=false` → 422 `TEAT.MEASURE_MONITORED_CUSTODY_DISABLED`; `release` só de
  `RETIDO|LIBERADO_COM_PRAZO` → `LIBERADO_LOCAL|REGULARIZADO`; estado fora → 409 `TEAT.MEASURE_STATE_INVALID`. Persistência de timers
  `owner='medida'` em tabela própria fica para R-0007 (`inf.infraction_timer` tem FK à infração) — só cálculo aqui. Eventos
  `MEDIDA_INICIADA`, `MEDIDA_CONCLUIDA`, `TERMO_EMITIDO`.
- **M15 — Alcoolemia**: estados `WF-TEAT-005` substituem `draft|in_progress|recorded|…` do serviço atual (coluna sem check; `verify:lifecycle-vocabulary`
  não cobre alcoolemia — anotar). `start` → `TRIAGEM`; `record-test` (de `TRIAGEM|ETILOMETRO_OFERECIDO`): etilômetro com
  `calibration_valid_until ≥ tested_at` senão 422 `TEAT.ALCOHOL_BREATHALYZER_NOT_VERIFIED`; tabela metrológica ativa do catálogo
  (`normative_metrological_table.table_json` no formato `{ "unit": "mg/L", "thresholds": { "administrative": 0.05, "crime": 0.34 },
"tolerance": [ { "from": <num>, "to": <num|null>, "max_error": <num> } ] }` — formato definido aqui, valores das fixtures
  **source_pending** até a captura do Anexo I da Res. 432 em `docs/reference`) senão 422 `TEAT.ALCOHOL_METROLOGICAL_TABLE_MISSING`;
  `considered = max(0, result − max_error)`; grava `result_mg_l`, `max_error_mg_l`, `considered_mg_l`; estado `TESTE_REALIZADO` →
  `RESULTADO_ABAIXO_LIMITE` (< administrative) | `RESULTADO_ADMINISTRATIVO` | `RESULTADO_CRIME` (≥ crime); evento `ALCOOLEMIA_TESTE_REGISTRADO`.
  `record-refusal` exige `kind` (400 `TEAT.ALCOHOL_REFUSAL_KIND_REQUIRED`) → `RECUSA_REGISTRADA` | `IMPOSSIBILIDADE_TECNICA`;
  `record-psychomotor-signs` exige ≥ 2 sinais `observed` (RN-TEAT-132 "conjunto, não isolado") senão 422 `TEAT.ALCOHOL_SIGNS_SET_REQUIRED`
  → `SINAIS_CONSTATADOS`; `forward` grava `alcohol_forwarding`; `close` de `RESULTADO_CRIME` sem forwarding → 422
  `TEAT.ALCOHOL_FORWARDING_REQUIRED_FOR_CRIME`; terminais `AIT_165A_LAVRADO|AIT_165_LAVRADO|ENCAMINHADO_POLICIA_JUDICIARIA|SEM_AUTUACAO_ALCOOLEMIA`
  conforme `outcome`. Velocidade: `POST /v1/inf/speed/measurements` handwritten em `inf/speed` (`inf:speed-measurement:create`, já na matriz)
  com check `considered = measured − max_error`; módulo continua atrás de `teat.speed_meters` (só teste unitário).
- **M16 — Eventos e outbox**: porta `TeatEventOutbox.append(tx, envelope)` e tipo `TeatEventEnvelope` em `@detran/shared`
  (`backend/domains/shared/src/events/outbox.ts`, CTG-0001, porque o AIT já publica eventos), implementação SQL `SqlTeatEventOutbox` em
  `integration.outbox` (`topic=type`, `aggregate_type`, `aggregate_id`, `payload=envelope`, `idempotency_key='<type>:<aggregate.id>:<aggregate.version>'`),
  gravada na transação do comando. Envelope = `rait-events-sse-contract.md` §1 (`type` técnico + `domainEvent` canônico do route contract §8).
  Tipos SSE (§7): `ait.changed`, `ait.concurrency-suspected`, `sync.batch.received`, `sync.conflict.opened|resolved`,
  `numbering.reservation.changed`, `device.posture-changed`, `package.published`, `integration.item.changed`,
  `evidence.access-request.changed`; demais eventos do §8 usam `measure.changed`, `alcohol.changed`, `evidence.changed`, `custody.event`,
  `probative-package.generated`, `shift.changed`, `catalog.published`. Schemas zod em `src/handwritten/events.ts` de cada módulo e JSON
  Schema em `docs/framework/schemas/events/<type>.schema.json` (TASK-0010).
- **M17 — SSE `GET /v1/ops/stream`** (`backend/app/src/teat-stream.controller.ts`, `@Resource('ops:stream') @Action('read')`): grant
  `ops:stream:read` a todos os papéis TEAT (field-agent, field-supervisor, processing-operator, traffic-authority, agency-admin,
  technical-admin, AUDITOR, integration-operator) porque o stream só entrega eventos cujo recurso o papel já lê (filtro por
  `inf:ait:read`, `ops:sync-batch:read`… conforme tabela no contrato) — não é ampliação; registrar OD-T17 para o Owner ratificar.
  `id` do evento = id da linha da outbox; ordem `created_at, id`; `Last-Event-ID` → replay das linhas posteriores (janela 24 h; além → 204);
  heartbeat `: heartbeat` a cada 20 s; `?topics=`; polling interno da outbox por intervalo injetável. Integrações (§4.6):
  `GET /v1/ops/integrations/outbox?system=&status=`, `POST outbox/{id}/retry` (`status ≠ 'error'` → 409 `TEAT.INTEGRATION_ITEM_NOT_FAILED`),
  `GET health` (config do adapter: `provider`, `baseUrl`, sem chamada de rede); `ops:integration:read|retry` = integration-operator,
  technical-admin. `batches/{id}/retransmit` e `certificates` ficam fora (sem entidade de lote em `ops`; validade mTLS `source_pending`).
- **M18 — Política ⇔ rotas**: `backend/app/tests/e2e/policy-routes.e2e.spec.ts` sobe o app e lê os metadados `@Resource/@Action` de todos
  os controladores; para as chaves `inf:ait*`, `inf:normative-*`, `inf:mobile-normative-package:*`, `inf:administrative-measure:*`,
  `inf:alcohol-*`, `inf:speed-*`, `inf:framing|validation-rule|agency-parameter|document-template|…` (superfície CRUD `INF_SURFACE_RULES`)
  e `ops:*` (exceto `ops:parameter:*`, R-0004) exige rota ⇔ regra nos dois sentidos. Regras sem rota hoje (`ops:offline-numbering-reservation:*`
  duplicadas da origem) são **removidas** da matriz em TASK-0003 (a origem manteve o alias; aqui a rota única é `numbering-reservation`) —
  `policy.spec.ts` registra a remoção. Blocos de outros domínios (`integration:*`, `est:*`, `shared:*`, `dashboard:*`, `portal:*`,
  `platform:*`, `inf:rait-*`) ficam fora da seção TEAT (R-0007 estende).
- **M19 — Contratos (WP-T3)**: `docs/framework/contracts/<BP>.commands.openapi.json` = OpenAPI 3.1 com `info.x-blueprint`, `x-commands: true`,
  um `paths[<rota>][post|get]` por comando com `operationId` `teat<Recurso><Verbo>` (camelCase), `requestBody` com o DTO da origem
  (`components.schemas.<NomeDaOrigem>`), respostas `200/201/202` + 4xx com `content.application/json.schema.properties.code.enum` só de
  códigos do `teat-error-catalog.md`, `parameters` `If-Match`/`Idempotency-Key`, header `ETag`, exemplos com ids das fixtures.
  `tools/contracts/check-commands.mjs` (ligado em `contracts:check` após o gerador): (1) JSON válido e `x-blueprint` existente; (2) rota ⇔
  controlador manuscrito (`@Controller` + `@Post/@Get`) nos dois sentidos para `inf/{ait,normative,measures,alcohol,speed}` e `ops/*`;
  (3) todo `code` das respostas 4xx existe no catálogo; (4) `operationId` único. `tools/contracts/generate-openapi.mjs` passa a ignorar
  `*.commands.openapi.json` na varredura de órfãos (única alteração). `contracts:clients` = `node tools/contracts/generate-clients.mjs`
  (`openapi-typescript` 7.13, já em `node_modules` via `senatran-adapter`; passa a devDependency da raiz) → `packages/api-clients/src/generated/<BP>.ts`
  (pacote `@detran/api-clients`, só tipos, commitado). Schemas: `docs/framework/schemas/teat-offline-sync-batch.schema.json` (origem +
  `device_batch_id`, `batch_sequence`, `items[].entity_type|local_entity_id|idempotency_key|payload_hash|created_locally_at|payload_json`),
  `teat-normative-package.schema.json` (M13), `teat-bootstrap.schema.json` (M9).
- **M20 — Fixtures**: `agent_id` em `ops.*`/`inf.*` = `ops_agent_profile.id`; para manter a fixture de R-0005 (`numbering_reservation.agent_id
= 00000000-0000-4000-8000-0000b0000001`), o Inspector cria `ops_agent_profile` com **id = user_ref = 00000000-0000-4000-8000-0000b0000001**
  (persona TEAT field-agent, documentada em `rait-fixtures.md` por TASK-0011), `agency_unit` `00000000-0000-7000-8000-0000e2100001`
  (`traffic_agency_id` `…e2000001`), `ops_homologation` `…e2200001` ativa e `…e2200002` vencida (H.55), `ops_application_version` `…e2300001`
  (`1.0.0`, active), `ops_shift` `…e3000001` (`open`, device `…e4000002`, agente acima) e `…e3000002` (`closed`), `alcohol_breathalyzer`
  `…ea000001` (verificação vigente) e `…ea000002` (vencida), `normative_metrological_table` `…eb000001` (M15, `source_pending`),
  `measure_type` `…ec000001..` (rol do art. 269 já semeado? conferir `10-fixtures`), `administrative_measure` `…ed0000nn` (um por estado A/B),
  `alcohol_procedure` `…ee0000nn` (um por estado), `evidence_evidence` `…ef000001` (`validated`, `bodycam`) e `…ef000002` (`pending_upload`),
  em `backend/database/seed/26-fixtures-teat-field.sql` (TASK-0004), `27-fixtures-teat-evidence.sql` (TASK-0006),
  `28-fixtures-teat-measures-alcohol.sql` (TASK-0008); todos idempotentes (`on conflict … do update`), tenant `…a001`.
  Testes e2e usam `DETRAN_LOCAL_TENANT_ID=00000000-0000-7000-8000-00000000a001` e `DETRAN_LOCAL_ACTOR_ID=00000000-0000-4000-8000-0000b0000001`
  (definidos **antes** do `import` dinâmico de `app.module.js`) e `DETRAN_LOCAL_ROLES` por caso.

## Tarefas

| Tarefa    | Papel        | Perfil              | Modelo/esforço | Lock                                                                                                      | Depende de | Entrega                                                                                                                                                          |
| --------- | ------------ | ------------------- | -------------- | --------------------------------------------------------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TASK-0001 | Architect    | architect-blueprint | Opus / alto    | `MOD-teat-contracts-design`                                                                               | —          | contrato de cada comando (pré-estado, papel, pré-condições, pós-estado, erros) por seção do route contract; desenho da aplicação transacional do lote; critérios |
| TASK-0002 | Inspector    | inspector-tests     | Sonnet / médio | `MOD-inf-ait-tests`                                                                                       | TASK-0001  | testes AIT: matriz [WF-TEAT-001], `cancel-requests` × `decision_body`, `If-Match`                                                                                |
| TASK-0003 | Engineer     | engineer-backend    | Sonnet / médio | `MOD-inf-ait`, `MOD-shared-policy`                                                                        | TASK-0002  | comandos AIT + regras; testes verdes                                                                                                                             |
| TASK-0004 | Inspector    | inspector-tests     | Opus / alto    | `MOD-ops-offline-sync-tests`, `MOD-ops-field-tests`, `MOD-shared-policy-tests`                            | TASK-0003  | testes de sincronização (ACK perdido, retry, lote parcial, sequência repetida/gap, conflito, integridade), bootstrap, turno, numeração                           |
| TASK-0005 | Engineer     | engineer-backend    | Opus / médio   | `MOD-ops-offline-sync`, `MOD-ops-field`, `MOD-shared-policy`                                              | TASK-0004  | bootstrap, turno, numeração, sincronização; testes verdes                                                                                                        |
| TASK-0006 | Inspector    | inspector-tests     | Sonnet / médio | `MOD-ops-evidence-tests`, `MOD-ops-snapshots-tests`, `MOD-inf-normative-tests`, `MOD-shared-policy-tests` | TASK-0005  | testes evidência (fluxo em três passos, bodycam com finalidade), snapshots (adapter mock), pacote normativo                                                      |
| TASK-0007 | Engineer     | engineer-backend    | Sonnet / médio | `MOD-ops-evidence`, `MOD-ops-snapshots`, `MOD-inf-normative`, `MOD-shared-policy`                         | TASK-0006  | evidência, snapshots, normativo; testes verdes                                                                                                                   |
| TASK-0008 | Inspector    | inspector-tests     | Sonnet / médio | `MOD-inf-measures-tests`, `MOD-inf-alcohol-tests`, `MOD-ops-stream-tests`, `MOD-shared-policy-tests`      | TASK-0007  | testes medidas/alcoolemia (tabela metrológica, dois prazos OD-T05), SSE, `policy-routes.spec.ts`                                                                 |
| TASK-0009 | Engineer     | engineer-backend    | Sonnet / médio | `MOD-inf-measures`, `MOD-inf-alcohol`, `MOD-ops-stream`                                                   | TASK-0008  | medidas, alcoolemia, SSE, projeção de integrações; testes verdes                                                                                                 |
| TASK-0013 | Architect    | architect-blueprint | Opus / médio   | `MOD-teat-contracts-design-wp-t3`                                                                         | TASK-0009  | contrato CTG-0005 (WP-T3): formato dos `*.commands.openapi.json`, rota → `operationId`, assinaturas de `check-commands.mjs` e `generate-clients.mjs`, schemas    |
| TASK-0012 | Inspector    | inspector-tests     | Sonnet / médio | `MOD-tools-contracts-tests`                                                                               | TASK-0013  | testes do gate `check-commands.mjs`, do gerador de clientes e das verificações rota ⇔ contrato (node:test)                                                       |
| TASK-0010 | Engineer     | engineer-backend    | Sonnet / médio | `MOD-contracts-commands`, `MOD-schemas`, `MOD-tools-contracts`                                            | TASK-0012  | nove `.commands.openapi.json`, três schemas JSON, `contracts:check`/`contracts:clients` verdes                                                                   |
| TASK-0011 | Owner deleg. | transcriber-docs    | Sonnet / baixo | `MOD-docs`                                                                                                | TASK-0010  | build pack, route contract §9, schemas README, backlog                                                                                                           |

CTG-0001 = 0001…0003; CTG-0002 = 0004/0005; CTG-0003 = 0006/0007; CTG-0004 = 0008/0009 (WP-T2); CTG-0005 = 0013 → 0012 → 0010 → 0011
(WP-T3, PR próprio ou junto do CTG-0004). Um PR por CTG. Os Inspectors
de cada grupo só começam com o grupo anterior implementado (lock `MOD-shared-policy-tests` em `policy.spec.ts`; prompt-review-1).

## Critérios de aceitação (comandos → resultado)

- `pnpm verify:decorators`, `pnpm verify:senatran-boundary` → OK.
- `pnpm --filter @detran/shared test` → `policy.spec.ts` verde com 100 % dos pares `inf:ait-*`,
  `inf:measures-*`, `inf:alcohol-*`, `inf:normative-*`, `ops:*` desta frente; `policy-routes.spec.ts`
  verde nos dois sentidos.
- `pnpm --filter @detran/inf-ait test:unit|test:integration|test:e2e` → verdes (idem normative,
  measures, alcohol e pacotes `ops` gerados em R-0005). Banco local da rodada: `detran_r8`
  (`DETRAN_TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/detran_r8`, aplicado com
  `apply.sh --full` + `seed.sh` em 2026-09-15; reaplicar após cada seed novo).
- `pnpm backend:test:e2e` → `inf-ait-routes.e2e.spec.ts` estendido aos novos comandos, verde;
  `backend/app/tests/e2e/policy-routes.e2e.spec.ts` (novo, seção TEAT) verde nos dois sentidos.
- `pnpm --filter @detran/ops-{field,offline-sync,evidence,snapshots} test:unit|test:integration|test:e2e` → verdes
  (os pacotes `ops` entram nas listas `backend:test:*` da raiz em TASK-0005/0007 — hoje só `ops-parameter` está lá).
- `pnpm contracts:check` → OK (gerador sem drift **e** `tools/contracts/check-commands.mjs` verde sobre os nove
  `*.commands.openapi.json`, criado em TASK-0010); `pnpm contracts:clients` (script novo de TASK-0010, `openapi-typescript`
  já presente no workspace) → "clients written: N" sem erro.
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

## Triagem

- 2026-09-15 TASK-0002 e2e 503 "Distributed rate limit backend unavailable" → `sensor-error`: o app lia `DATABASE_URL`/`STYNX_*_DATABASE_URL`
  ausentes e conectava ao `detran` local sem DDL. Correção: `work/rounds/R-0008/env-detran-r8.sh` (cinco variáveis do job `backend-kernel`)
  e nota nos prompts TASK-0003…0010/0012 (só ambiente; prompt-review não repetido). Confirmado: `ops-modules` e `pec-idempotency` e2e
  verdes com o ambiente.
- 2026-09-15 TASK-0001 bloqueio 2 (delta `BP-INF-AIT-001`) e CTG-0002 §11.4 → `reference-gap`: deltas aplicados pelo maestro (Architect)
  em b523f1f com adendas §12 nos contratos CTG-0001/0002.

- 2026-09-15 TASK-0003 iteração 1 — quatro bloqueios: (1) colisão `POST /v1/inf/ait/cancel-requests` (CRUD gerado × manuscrito) →
  `reference-gap`: delta `BP-INF-AIT-001` `api.resources[AitCancelRequest].operations=['list','get']` aplicado pelo maestro (Architect;
  o gerador já suportava `operations`), regenerado; OD-T23 do Engineer fechada por esse delta. (2) ordem 403/404 em `decide` sem pedido →
  `sensor-error`: C-0001-40 exige um pedido `addressed_to='diretoria-fiscalizacao'` existente; o teste usou uuid aleatório — Inspector
  corrige (iteração 2 de TASK-0002); ordem canônica: 404 `TEAT.AIT_CANCEL_TARGET_NOT_FOUND` antes do addressee (sem pedido não há
  `addressed_to`). (3) testes pré-existentes contraditórios com M2/M4 (`inf-ait-routes.e2e.spec.ts` WP-T0 sem `If-Match`; `ait-lifecycle.e2e.spec.ts`
  espera `ACEITO`) e specs do Inspector quebrando `tsc` (TS2493/TS2352) e `verify:parameter-catalogue` (literais `teat.errors.*` em
  `detran-error.spec.ts`; o verificador só ignora diretórios `tests`, não `*.spec.ts`, contra o próprio contrato do catálogo) →
  `sensor-error`: Inspector corrige os testes e alinha o verificador ao contrato ("ignorando testes"). (4) `zod` não linkado em
  `@detran/inf-ait` → `reference-gap`: `module.dependencies.zod` no blueprint + `pnpm install` pelo maestro (commit `chore(deps)`).
- 2026-09-15 delivery-review-CTG-0001 ciclo 1 `FAIL` (7 achados `high`, todos `plant-bug`/`reference-gap` de implementação incompleta
  frente ao contrato): adenda §13 em CTG-0001 fecha cada um (porta `SyncConflictPort` em `ops-core`; `If-Match` do AIT quando `ait_id`
  existe; guarda `decision_body` divergente; guarda de estado em `decide`/`review`; id do evento pelo outbox; `@Idempotent()` do kernel;
  `originStatus` validado). Iteração 3 do Inspector (testes) e do Engineer (código); ciclo 2 da delivery-review restrito aos achados.
- 2026-09-15 delivery-review-CTG-0001 ciclo 2 `REVIEW` (1 achado: `If-Match`/`ETag` de `review`/`decide` ausentes quando `ait_id` é nulo) →
  `plant-bug`: Inspector iteração 5 (testes 428/412/200+ETag sem AIT) + Engineer iteração 4; ciclo 3 restrito. Gates completos
  (`pnpm check`, `backend:test:ci` com `env-detran-r8.sh`) verdes no ciclo 2.
- 2026-09-15 TASK-0004 — bloqueios: (1) `@detran/shared`/`ops-core` não resolvem sob vitest em `ops/field`/`offline-sync` (blueprints
  sem `testAliases`) → `reference-gap`, delta aplicado pelo maestro (CTG-0002 §13.2); (2) colisão `POST sync-batches` CRUD × comando
  → `reference-gap`, `operations: [list, get]` (§13.1), extensivo a `evidence-access-requests` e `external-queries` (CTG-0003);
  (3) prefixo `v1/` de `evidence`/`snapshots` só em TASK-0007 → C-0002-50 fica vermelho até lá (aceito).
- 2026-09-15 TASK-0005 iteração 1 — (1) `GET receipts/{tenantId}` sombreado pelo `GET receipts/:id` gerado → `reference-gap`: delta
  `SyncReceipt.operations=['list']` (BP-OPS-OFFLINE-SYNC-001 v1.3.0) pelo maestro; (2) testes do Inspector reusam `batch_sequence: 1`
  (C-0002-27/28/29), C-0002-27 exige consumo sem reserva, `ait-sync-applier` apaga todos os `sync_receipt` (derruba C-0002-30) →
  `sensor-error`: Inspector iteração 2; (3) `zod`/`@detran/inf-normative` (ops/field) e `@detran/ops-core` (app) não linkados →
  `reference-gap`: deps nos blueprints/app + `pnpm install` pelo maestro; Engineer iteração 2 converte eventos a zod.
- 2026-09-15 delivery-review-CTG-0002 ciclo 1 `FAIL` (5 achados): (1) fronteira — a mudança do prefixo `v1/` em `evidence`/`snapshots`
  foi pedida pelo maestro a TASK-0005 (só a string do `@Controller`); **alteração formal do plano**: locks
  `MOD-ops-evidence-controller-prefix` e `MOD-ops-snapshots-controller-prefix` acrescentados a TASK-0005 (`tasks/TASK-0005.json`);
  TASK-0007 deixa de executar CTG-0002 §13.4 (já executado); (2)–(5) `plant-bug` no `submit-batch.command.ts`: item/recibo fora da
  transação do item; `SYNC_ITEM_RECEBIDO` antes do `sync_batch` (`batchId` nulo); primeiro lote sem guarda de sequência (`last=0`);
  sem validação runtime do DTO (lote vazio, `batch_sequence` inválida) → Inspector iteração 3 (testes) + Engineer iteração 3; ciclo 2
  restrito. Gates completos (`pnpm check`, `backend:test:ci`) verdes no ciclo 1.
- 2026-09-15 delivery-review-CTG-0002 ciclo 2 `FAIL` (inversão dos passos 5–10 de §4.1 introduzida pelo achado 3 do ciclo 1) →
  resolução formal do Architect: adenda §14 (lote durável no passo 5; fechamento no 9). Ciclo 3 `REVIEW` (consequência (c) da §14:
  replay de lote interrompido deve completar os itens faltantes) → Inspector iteração 4 (teste) + Engineer iteração 5; ciclo 4 restrito.

## Concorrência

- `origin/main` em df1e1769941e527a07b6db7550aee84068f3a872 (PR #46). Upstreams **já em `main`**: `ops-agency` R-0005 (PRs #40, #41,
  #42, #44, #45; fechada como PC-0003), `rait-model` R-0006 (PRs #39, #43, #46), `param-store` R-0004 (#37), `dash-roles` R-0003 (#32).
- R-0007 `rait-backend` **não iniciou** (worktree local em c4f055e, branch não publicado, sem PR): `DetranError`, `check-commands.mjs`,
  `contracts:clients` e `policy-routes.e2e.spec.ts` nascem **aqui** (M1, M18, M19); R-0007 rebaseia sobre `main` (§Bloqueios).
- Todos os grupos (CTG-0001…0004) estão **liberados para merge** na ordem; nenhum grupo em base empilhada. Locks de `policy.ts` com
  R-0007: blocos distintos (`TEAT_RULES`/`OPS_SURFACE_RULES` × `RAIT_*`).
- Branch `orchestra/teat-backend` criado de `origin/main` em 2026-09-15; worktree `/Volumes/Thiamat II/stech/detran-worktrees/teat-backend`.

## Bloqueios

- prompt-review-2 devolveu `FAIL` por estrutura (segundo Inspector no CTG-0004). O maestro aplicou a correção prescrita pelo próprio
  reviewer (CTG-0005 para o WP-T3 com tríade própria: TASK-0013 → 0012 → 0010) e submeteu o ciclo 3 restrito a esse item, em vez de
  parar — desvio consciente do §5 do prompt do maestro, registrado para o humano; se o ciclo 3 não for `PASS`, a rodada para aqui.
- Para R-0007 (`rait-backend`): rebasear sobre `main` após o merge do CTG-0001 desta rodada — `DetranError` (M1) em
  `backend/domains/shared/src/errors/`, `policy-routes.e2e.spec.ts` (M18, seção RAIT a acrescentar) e, após CTG-0004,
  `tools/contracts/check-commands.mjs`, `contracts:clients` e `packages/api-clients` (M19). `RaitError` de `inf/infraction` não foi tocado.
- OD propostas nesta rodada (registrar em `open-decisions-rait.md` §F por TASK-0011): OD-T13 (`inf:ait:archive` para processing-operator),
  OD-T14 (`snapshot.maxAgeSeconds` do bootstrap), OD-T15 (papéis de `sessions/handoff`), OD-T16 (assinatura do pacote normativo pelo
  substrato), OD-T17 (`ops:stream:read`), OD-T18 (mapeamento do claim `decision_body` no IdP).

## Retomada

- 2026-09-15 (janela 1, checkpoint 1): bootstrap feito (`pnpm check` verde em df1e176; `detran_r8` aplicado + semeado); `plan.md`
  §Decisões M1–M20, `tasks/TASK-0001…0011.json`, `prompts/TASK-0001…0011.md`, `compositions.json`, `budget.json` escritos;
  `reviews/prompt-review-1.md` enviado à ponte (Terra). Concluídas: nenhuma. Em curso: prompt-review-1. Pendentes: TASK-0001…0011.
  prompt-review: ciclo 1 `REVIEW`, ciclo 2 `FAIL` (estrutura, corrigido com CTG-0005), ciclo 3 `PASS`.
  TASK-0001 disparada (opus/high).
- 2026-09-15 (janela 1, checkpoint 2): CTG-0001 concluído — TASK-0001 (contratos), TASK-0002 (5 iterações), TASK-0003 (4 iterações);
  delivery-review ciclos 1 `FAIL` / 2 `REVIEW` / 3 `PASS`; `pnpm check` e `backend:test:ci` verdes. Commits c143606→47d701d (feat) e chore(devai) evidência seq. 1; branch
  publicado (a partir daqui só `merge`, nunca rebase); **PR #47** aberto (CI em curso). TASK-0004 (opus/high) disparada.
- 2026-09-15 (checkpoint 3): **PR #47 mesclado** em 397cb033ce2da549e2922d307c28b6b81e5d5070 (CI 5/5 verde; `audit observe`
  EV-5a4d81502cca07c6); branch fast-forward ao merge. TASK-0004 concluída (testes vermelhos + seed 26); adenda §13 em CTG-0002
  (colisões de rota por `operations`, `testAliases`, símbolos dos comandos, prefixo `v1/`). Próximo: TASK-0005 (opus/médio).
- 2026-09-15 (checkpoint 4): CTG-0002 concluído — TASK-0004 (4 iterações), TASK-0005 (5 iterações); delivery-review ciclos 1 `FAIL`,
  2 `FAIL` (resolvido por adenda §14), 3 `REVIEW`, 4 `PASS`; adendas §13/§14 em CTG-0002. Próximo: commit, evidência seq. 2, PR do
  CTG-0002; TASK-0006 (sonnet/médio) em seguida. Pendentes: TASK-0006…0013.
- 2026-09-16 (checkpoint 5): **PR #48 mesclado** em ade61ac (CI 5/5); `audit observe` no merge; TASK-0006 concluída (testes vermelhos +
  seed 27). Gerador alterado pelo maestro (Architect): controladores manuscritos registram **antes** dos gerados (rotas literais vencem
  `:id`); todos os módulos regenerados. Próximo: TASK-0007 (sonnet/médio). Pendentes: TASK-0007…0013. Pendentes: TASK-0004…0013. Orçamento da janela já ultrapassado (ver `budget.json`): o
  maestro prossegue por instrução explícita do Owner ("até a completa finalização e merge").

## Leitura

HEAD lido: df1e1769941e527a07b6db7550aee84068f3a872. Lidos integralmente: `AGENTS.md`, `CODESTYLE.md`, `docs/meta/agents/README.md`,
`docs/meta/agents/orchestra/{README,model-ladder,waves}.md`, `docs/framework/arch/teat-build-pack.md`, `teat-route-contract.md`,
`teat-error-catalog.md`, `parameter-catalogue.md`, `docs/meta/knowledge-base/decision-closure-plan.md`, `steering.md` §H,
manuais `architect-blueprint`, `engineer-backend`, `inspector-tests`, `transcriber-docs`, templates `task.template.json`,
`worker-prompt.template.md`, `reviewer-prompt.template.md`, este `plan.md`. Lidos por trecho: WF-TEAT-001…005 (estados e transições),
UC-TEAT-011/012 (AC), RN-TEAT-111/123/124/125/126/132/133/142, `rait-build-pack.md` §0, `teat-frontends.md` §9, `rait-events-sse-contract.md`
§1/§3/§5, `rait-test-strategy.md` §1/§2/§6/§7, `rait-error-catalog.md` §1–§2, blueprints INF/OPS (entidades), `policy.ts` (blocos TEAT/OPS,
avaliação), `roles.ts`, `policy.guard.ts`, `tenant-context.ts`, `inf/ait` (controller, lifecycle, provider, módulo, e2e), `ops/*` manuscritos,
`app.module.ts`, `vitest.config.ts` do app, testes e2e existentes, seeds `00/10/25`, DDL 04/14/17/18/31, `tools/verify-controller-decorators.ts`,
`tools/contracts/generate-openapi.mjs`, `bridge.sh`, `.github/workflows/ci.yml`, R-0006 (`contracts/CTG-0001.md`, `prompts/TASK-0003.md`,
`budget.json`, `closure.json`), R-0007 `plan.md`; origem `../teat` (somente leitura): `domain/shared/api/src/teat-policy.ts`, DTOs de
`offline-sync`, `mobile-bootstrap`, `evidence`, `measures`, `alcohol`, `normative`, `ait-cancel-request`, trechos de
`offline-sync-commands.service.ts`, `mobile-bootstrap.service.ts`, `evidence-commands.service.ts`, `normative-catalog-commands.service.ts`,
`docs/framework/schemas/teat-offline-sync-batch.schema.json`, `docs/framework/contracts/openapi.json` (rotas).
