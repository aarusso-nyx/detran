# Prompt do reviewer — modo `delivery-review` (`prompt-review` | `delivery-review`)

> Você é o **reviewer** da orquestra `teat-backend` (rodada `R-0008`), modelo da família
> **oposta** à do maestro. Você não escreve código nem prompts: você julga. Papel constitucional:
> Auditor (soft gate, Constituição DEVAI Art. 18). Trabalhe somente em leitura na worktree
> `/Volumes/Thiamat II/stech/detran-worktrees/teat-backend`. Responda **apenas** com o JSON do §Saída, sem prosa antes ou depois.

## Contexto mínimo (leia nesta ordem)

1. `docs/meta/agents/orchestra/README.md` §4 (correção formal) e §5 (parcimônia)
2. `docs/meta/agents/README.md` §Regras comuns
3. `docs/framework/arch/teat-build-pack.md` — apenas a seção do WP `WP-T2` e o "mapa entregável → definições"
4. `work/rounds/R-0008/plan.md`
5. Modo `prompt-review`: todos os arquivos em `work/rounds/R-0008/prompts/`.
   Modo `delivery-review`: `work/rounds/R-0008/reports/*.md`, o diff anexado abaixo e os
   arquivos por ele tocados.

## Rubrica (cada item é verificável; cite arquivo e linha)

| #   | Item                                                                                                                       | Aplica a |
| --- | -------------------------------------------------------------------------------------------------------------------------- | -------- |
| 1   | Papel constitucional declarado e compatível com o que a tarefa toca (Art. 6, 10)                                           | ambos    |
| 2   | Leitura obrigatória fechada e suficiente: o worker consegue executar sem procurar nada fora da lista                       | prompt   |
| 3   | Fronteira de escrita disjunta entre tarefas simultâneas; `target_modules` corretos; nada de `git` para workers             | prompt   |
| 4   | Critérios de aceitação são comandos existentes (`package.json`) ou arquivos verificáveis, com resultado esperado explícito | ambos    |
| 5   | Nenhum valor inventado: prazos, papéis, estados, erros, rótulos vêm de documento canônico ou viram `source_pending`/`OD-*` | ambos    |
| 6   | Tríade respeitada (Architect → Inspector → Engineer) e testes escritos antes da implementação                              | ambos    |
| 7   | Gates não enfraquecidos (nenhum teste relaxado, nenhum `skip`, nenhum arquivo gerado editado à mão)                        | delivery |
| 8   | Vocabulário canônico (tokens de estado, timer, papel, erro) e i18n só na camada de rótulo                                  | ambos    |
| 9   | Fronteira nacional: nada fala com SENATRAN fora de `packages/senatran-adapter` (ADR-0003)                                  | delivery |
| 10  | ADR e OD citados onde a decisão foi tomada; decisões do steering §H respeitadas, não reabertas                             | ambos    |
| 11  | Entrega completa em relação ao critério: nada "deixado para depois" sem registro em §Fora de escopo                        | delivery |
| 12  | Parcimônia: o prompt não manda ler o repositório inteiro; esforço e modelo condizem com `model-ladder.md`                  | prompt   |
| 13  | Matrizes de autorização testam grants positivos e negativas exaustivas para papéis canônicos omitidos; nada por analogia   | ambos    |

## Veredito

- **PASS**: nenhum achado de severidade `high`; achados `low` viram notas.
- **REVIEW**: pelo menos um achado `high` corrigível pelo maestro ou pelo worker sem mudar o plano.
- **FAIL**: o plano ou a entrega contradiz uma definição canônica, uma decisão do Owner, uma ADR ou
  a Constituição; ou a fronteira de escrita foi violada.

Ciclos: o **primeiro** ciclo de cada item é **exaustivo** — liste todos os achados de uma vez. Nos ciclos
seguintes do mesmo item, avalie **somente** as correções dos achados anteriores; um achado novo sobre
texto que não mudou só é admitido se for `FAIL` por definição (contradição canônica, decisão do Owner,
ADR, Constituição ou fronteira de escrita) e deve dizer explicitamente por que não foi levantado antes
(ajuste R-0006).

## Saída (JSON, e nada mais)

```json
{
  "mode": "delivery-review",
  "round": "R-0008",
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [
    {
      "severity": "high | low",
      "item": 4,
      "file": "work/rounds/R-0008/prompts/TASK-0002.md",
      "line": 31,
      "claim": "critério cita `pnpm --filter @detran/rait-web test`, pacote inexistente",
      "fix": "usar `pnpm --filter @detran/ui test` até o app existir"
    }
  ],
  "notes": ["observações não bloqueantes"]
}
```

## Material anexado pelo maestro

## Nota do maestro — delivery-review CTG-0003, ciclo 2 (restrito aos 4 achados do ciclo 1)

Veredito anterior: `REVIEW` (`reviews/delivery-review-CTG-0003.json`). Correções (adenda §14, anexa): (1) `complete-upload` valida o DTO inteiro antes da transação (400 `TEAT.VALIDATION_FAILED` `fields[]`), divergência de entidade → 409 `TEAT.EVIDENCE_ENTITY_NOT_APPLIED`, chave ≠ intenção → 409 `TEAT.IDEMPOTENCY_REPLAY`; 5 casos unit novos; (2) `GET mobile-packages/{id}/content` devolve `ETag: "<manifest_hash>"` e 304 em `If-None-Match` (RFC 9110 §13.1.2), guarda de integridade antes; e2e novo; (3) `traffic_agency_id` nunca é o tenant: corpo → `ops_agent_profile` do principal → `catalog.traffic_agency_id` (só generate) → 422 fail-closed; 7 casos unit + integration com asserção `≠ tenantId`; (4) gates finais registrados em `reports/TASK-0007.md` (§Gates finais) e `plan.md`: `pnpm check` exit 0 e `backend:test:ci` exit 0 no ciclo 1; nova rodada completa em execução no envio (registrada antes do commit). Gates da iteração 3: ops-evidence 41/5, ops-snapshots 10/2, inf-normative 21/3, inf-ait 24, app e2e 74/74, shared 165/165, decorators 858, blueprints/contracts/format ok. Avalie **somente** as quatro correções. Anexos: §14; relatório TASK-0007 (com §Gates finais); diff acumulado (contra HEAD b7ad1cf) dos arquivos relevantes.

## Anexo — CTG-0003 §14

```markdown
## 14. Adenda do maestro (Architect, 2026-09-16, após delivery-review-CTG-0003 ciclo 1 — `REVIEW`, 4 achados)

1. **`complete-upload` valida o DTO inteiro** (§4.2): `storage_intent_id` uuid, `idempotency_key` 1..160, `entity_type` = `'ait'`,
   `entity_id` uuid, `accepted_hash` `^sha256:[a-f0-9]{64}$` — ausência/forma → 400 `TEAT.VALIDATION_FAILED` `fields[{ path, rule }]`;
   `entity_type`/`entity_id` divergentes da intenção gravada → 409 `TEAT.EVIDENCE_ENTITY_NOT_APPLIED` `{ evidenceId, entityType, entityId }`;
   `idempotency_key` ≠ da intenção → 409 `TEAT.IDEMPOTENCY_REPLAY` `{ idempotencyKey }`.
2. **`GET mobile-packages/{id}/content`** (§6.5): resposta traz `ETag: "<manifest_hash>"`; requisição com `If-None-Match` igual ao
   `manifest_hash` gravado (e válido) → **304** sem corpo; a guarda de integridade continua antes de qualquer resposta.
3. **`traffic_agency_id` (substitui OD-T57 em §13)**: nunca se persiste o id do tenant como órgão. Ordem de resolução em
   `external-queries` e `mobile-packages/generate`: corpo (`traffic_agency_id` opcional na DTO) → `ops_agent_profile.traffic_agency_id`
   do principal (`user_ref = actorId`) → `catalog.traffic_agency_id` (só `generate`) → sem fonte → 422 `TEAT.VALIDATION_FAILED`
   `fields[{ path: 'traffic_agency_id', rule: 'required' }]` (fail-closed).
4. **Relatórios** citam a saída final dos gates completos (`pnpm check`, `backend:test:ci`) — nesta entrega: ambos exit 0 após a
   iteração 2 (registrado em `reports/TASK-0007.md` e `plan.md`).
```

## Anexo — `reports/TASK-0007.md`

```markdown
Papel: Engineer (Art. 6)
Tarefa: TASK-0007 (iteração 1)
Arquivos criados/alterados: ops/evidence/src/handwritten/* (runtime, manifest, events, bodycam-projection, local-evidence-storage, 10 comandos, service, provider, evidence-access.controller; evidence-custody.controller reescrito; service/provider antigos removidos); ops/snapshots/src/handwritten/* (runtime, external-query command/provider, events; frozen-snapshot.controller reescrito); inf/normative/src/handwritten/* (runtime, manifest, package-signer, events, 5 comandos, 2 queries, service, provider) + normative-commands.controller/lifecycle reescritos; ops/core/src/storage.ts; policy.ts (§7); app teat-evidence/teat-snapshots providers + app.module; package.json (inf-normative integration); blueprints (bloco module) + gerados.
Comandos executados e saída resumida: ops-evidence unit 36/36, integration 5/5; ops-snapshots unit 7/7, integration 2/2; inf-normative unit 17/17, integration 3/3; inf-ait integration 24/24; app e2e 72/72; app integration 11/11; shared 164/165 (contradição WP-T0 × CTG-0003 §7); backend:test:integration/e2e verdes; typecheck ok; blueprints/contracts/decorators(858)/boundary/format/parameter-catalogue ok.
Critérios de aceitação: todos PASS exceto shared test (1 caso WP-T0 contraditório) e backend:test:unit (pelo mesmo elo).
Fora do escopo / deixado: zod não introduzido (sem link); snapshots sem dependência real do adapter (tipagem estrutural); versões dos blueprints mantidas; projeção de bodycam só nas leituras manuscritas; EVIDENCE_TYPE_NOT_IN_CATALOG desligado (OD-T31); quarantined/archived/superseded sem comando (OD-T30).
OD tocadas ou propostas: OD-T51…OD-T59 (ver contrato CTG-0003 §13 — decisões do maestro).
Bloqueios: shared test (OD-T51); `git status` executado uma vez (leitura); outro processo rodou blueprints:generate na mesma worktree concorrentemente (árvore convergiu).
Tokens do subagente: 89.973 reportados (3 chamadas registradas; 69 min) — contagem do harness aparentemente parcial.

## Iteração 2

OD-T52 (guarda sempre), OD-T53 (regex 64 hex), eventos zod nos três pacotes (vocabulários movidos a evidence-runtime.ts para quebrar ciclo ESM). unit 36/7/17; integration 5/2/3; inf-ait 24; app e2e 73/73; shared 165/165; decorators 858; blueprints/contracts/format ok. Tokens: 682.265 brutos (148 chamadas, 20 min) no agente aninhado.

## Gates finais (maestro, após iteração 2)

`pnpm check` → exit 0; `pnpm backend:test:ci` → exit 0 (shared 165/165; ops-evidence 36/5; ops-snapshots 7/2; inf-normative 17/3; inf-ait 24; app e2e 73/73). Delivery-review CTG-0003 ciclo 1: REVIEW (4 achados → adenda §14; iteração 3 do Inspector e do Engineer).
```

## Anexo — diff

```diff
diff --git a/backend/app/tests/e2e/teat-evidence-normative.e2e.spec.ts b/backend/app/tests/e2e/teat-evidence-normative.e2e.spec.ts
new file mode 100644
index 0000000..94a753b
--- /dev/null
+++ b/backend/app/tests/e2e/teat-evidence-normative.e2e.spec.ts
@@ -0,0 +1,427 @@
+import { randomUUID } from 'node:crypto';
+import type { NestFactory } from '@nestjs/core';
+import pg from 'pg';
+import request from 'supertest';
+import { afterAll, beforeAll, describe, expect, it } from 'vitest';
+
+/**
+ * CTG-0003 §4/§6/§10 (R-0008, TASK-0006) — C-0003-39…45: as rotas de
+ * evidência, custódia, bodycam e pacote normativo sob o app unificado, com a
+ * guarda de política nos dois sentidos (papel mínimo → 200/201, papel fora
+ * da regra → 403) e a fronteira de rota `v1/ops/…`/`v1/inf/…` (§1).
+ *
+ * A maioria dessas rotas ainda não existe hoje (nascem em TASK-0007, §11);
+ * até lá cada caso falha pelo comportamento ausente — 404 onde se espera
+ * 200/201/403. O controlador `evidence-custody.controller.ts` e
+ * `frozen-snapshot.controller.ts` já montam sob `v1/ops/*` (nota do maestro,
+ * confirmado por leitura direta do arquivo) — C-0003-45 cobre essa fronteira
+ * por enumeração das rotas registradas, não por tentativa de requisição.
+ *
+ * O perfil local resolve `DETRAN_LOCAL_TENANT_ID`/`DETRAN_LOCAL_ACTOR_ID` no
+ * carregamento do módulo, então as duas variáveis são definidas **antes** do
+ * `await import('../../src/app.module.js')` (mesmo padrão de
+ * `teat-field-sync.e2e.spec.ts`).
+ */
+
+const { Client } = pg;
+
+const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
+const ACTOR_ID = '00000000-0000-4000-8000-0000b0000001';
+const EVIDENCE_BODYCAM_VALIDATED = '00000000-0000-7000-8000-0000ef000001';
+const EVIDENCE_QUARANTINED = '00000000-0000-7000-8000-0000ef000004';
+const ACCESS_REQUEST_APPROVED = '00000000-0000-7000-8000-0000ef400002';
+const CATALOG_ACTIVE = '00000000-0000-7000-8000-0000e0000001';
+
+const connectionString =
+  process.env.DETRAN_TEST_DATABASE_URL ??
+  process.env.DATABASE_URL ??
+  'postgresql://postgres:postgres@localhost:5432/detran';
+const client = new Client({ connectionString });
+
+let app: Awaited<ReturnType<typeof NestFactory.create>>;
+let startedAt: string;
+const previousEnv: Record<string, string | undefined> = {};
+/** Pacotes e enquadramentos criados pelos casos de C-0003-43b/c (OD-T52); removidos no afterAll. */
+const createdPackageIds: string[] = [];
+const createdFramingIds: string[] = [];
+
+/**
+ * O kernel aplica `@Idempotent()` a toda ação não-leitura (CTG-0001 §13
+ * item 6): corpo divergente sob a mesma `Idempotency-Key` devolve 422. Cada
+ * requisição leva uma chave nova.
+ */
+function headers(role: string): Record<string, string> {
+  process.env.DETRAN_LOCAL_ROLES = role;
+  return {
+    authorization: 'Bearer local',
+    'x-tenant-id': TENANT_ID,
+    'idempotency-key': randomUUID(),
+  };
+}
+
+function server() {
+  return app.getHttpServer();
+}
+
+beforeAll(async () => {
+  for (const key of [
+    'DETRAN_RUNTIME_PROFILE',
+    'DETRAN_LOCAL_TENANT_ID',
+    'DETRAN_LOCAL_ACTOR_ID',
+    'DETRAN_LOCAL_ROLES',
+  ]) {
+    previousEnv[key] = process.env[key];
+  }
+  process.env.DETRAN_RUNTIME_PROFILE = 'test';
+  process.env.DETRAN_LOCAL_TENANT_ID = TENANT_ID;
+  process.env.DETRAN_LOCAL_ACTOR_ID = ACTOR_ID;
+  process.env.DETRAN_LOCAL_ROLES = 'field-agent';
+
+  await client.connect();
+  await client.query(`select set_config('app.role', 'owner', false)`);
+  const now = await client.query<{ now: string }>('select now()::text as now');
+  startedAt = now.rows[0]!.now;
+
+  const { NestFactory: factory } = await import('@nestjs/core');
+  const { AppModule } = await import('../../src/app.module.js');
+  app = await factory.create(AppModule.forRoot(), {
+    logger: false,
+    abortOnError: false,
+  });
+  await app.init();
+});
+
+afterAll(async () => {
+  await app?.close();
+  await client.query(`select set_config('app.role', 'owner', false)`);
+  // Devolve as fixtures de 27-fixtures-teat-evidence.sql ao estado semeado.
+  await client.query(
+    `delete from ops.storage_intent where tenant_id = $1 and created_at > $2`,
+    [TENANT_ID, startedAt],
+  );
+  await client.query(
+    `delete from ops.evidence_evidence
+       where tenant_id = $1 and created_at > $2
+         and id not in ($3, $4)`,
+    [TENANT_ID, startedAt, EVIDENCE_BODYCAM_VALIDATED, EVIDENCE_QUARANTINED],
+  );
+  await client.query(
+    `update ops.evidence_access_request set status = 'approved', delivery_media_ref = null, delivered_at = null
+      where id = $1`,
+    [ACCESS_REQUEST_APPROVED],
+  );
+  if (createdFramingIds.length > 0) {
+    await client.query(
+      `delete from inf.normative_framing where id = any($1::uuid[])`,
+      [createdFramingIds],
+    );
+  }
+  if (createdPackageIds.length > 0) {
+    await client.query(
+      `delete from inf.normative_mobile_package where id = any($1::uuid[])`,
+      [createdPackageIds],
+    );
+  }
+  await client.query(`select set_config('app.tenant_id', $1, false)`, [
+    TENANT_ID,
+  ]);
+  await client.end();
+  for (const [key, value] of Object.entries(previousEnv)) {
+    if (value === undefined) delete process.env[key];
+    else process.env[key] = value;
+  }
+});
+
+describe('CTG-0003 §4.1 — upload-intents: papel mínimo × papel fora da regra (C-0003-39)', () => {
+  it('C-0003-39 — dado DETRAN_LOCAL_ROLES=field-agent quando POST /v1/ops/evidence/upload-intents então 200', async () => {
+    const response = await request(server())
+      .post('/v1/ops/evidence/upload-intents')
+      .set(headers('field-agent'))
+      .send({
+        traffic_agency_id: '00000000-0000-7000-8000-0000e2000001',
+        local_evidence_id: '00000000-0000-7000-8000-0000ef900010',
+        idempotency_key: `e2e-upload-${randomUUID().slice(0, 8)}`,
+        entity_type: 'ait',
+        entity_id: '00000000-0000-7000-8000-0000f0000001',
+        evidence_type: 'foto',
+        origin: 'campo',
+        mime_type: 'image/jpeg',
+        size_bytes: 204800,
+        hash_algorithm: 'sha256',
+        hash_value: `sha256:${randomUUID().replace(/-/g, '').padEnd(64, '0')}`,
+        filename: 'e2e-foto.jpg',
+      });
+    expect(response.status).toBe(200);
+  });
+
+  it('C-0003-39 — dado DETRAN_LOCAL_ROLES=field-supervisor quando POST /v1/ops/evidence/upload-intents então 403', async () => {
+    const response = await request(server())
+      .post('/v1/ops/evidence/upload-intents')
+      .set(headers('field-supervisor'))
+      .send({});
+    expect(response.status).toBe(403);
+  });
+});
+
+describe('CTG-0003 §4.3 — validate: papel mínimo × papel fora da regra (C-0003-40)', () => {
+  it('C-0003-40 — dado DETRAN_LOCAL_ROLES=processing-operator quando POST /v1/ops/evidence/{id}/validate então 200', async () => {
+    const response = await request(server())
+      .post(`/v1/ops/evidence/${EVIDENCE_BODYCAM_VALIDATED}/validate`)
+      .set(headers('processing-operator'))
+      .send({ decision: 'valid' });
+    expect(response.status).toBe(200);
+  });
+
+  it('C-0003-40 — dado DETRAN_LOCAL_ROLES=field-agent quando POST /v1/ops/evidence/{id}/validate então 403', async () => {
+    const response = await request(server())
+      .post(`/v1/ops/evidence/${EVIDENCE_BODYCAM_VALIDATED}/validate`)
+      .set(headers('field-agent'))
+      .send({ decision: 'valid' });
+    expect(response.status).toBe(403);
+  });
+});
+
+describe('CTG-0003 §4.7 — purge-expired-unverified: papel mínimo × papel fora da regra (C-0003-41)', () => {
+  it('C-0003-41 — dado DETRAN_LOCAL_ROLES=technical-admin quando POST /v1/ops/evidence/maintenance/purge-expired-unverified então 200', async () => {
+    const response = await request(server())
+      .post('/v1/ops/evidence/maintenance/purge-expired-unverified')
+      .set(headers('technical-admin'))
+      .send({});
+    expect(response.status).toBe(200);
+  });
+
+  it('C-0003-41 — dado DETRAN_LOCAL_ROLES=AUDITOR quando POST /v1/ops/evidence/maintenance/purge-expired-unverified então 403', async () => {
+    const response = await request(server())
+      .post('/v1/ops/evidence/maintenance/purge-expired-unverified')
+      .set(headers('AUDITOR'))
+      .send({});
+    expect(response.status).toBe(403);
+  });
+});
+
+describe('CTG-0003 §4.10 — evidence-access-requests/{id}/approve: papel mínimo × papel fora da regra (C-0003-42)', () => {
+  it('C-0003-42 — dado DETRAN_LOCAL_ROLES=traffic-authority quando POST /v1/ops/evidence-access-requests/{id}/approve sobre o pedido …ef400002 (já approved) então 409 TEAT.EVIDENCE_ACCESS_STATE_INVALID (papel mínimo alcança o comando; a guarda de estado é quem barra)', async () => {
+    const response = await request(server())
+      .post(
+        `/v1/ops/evidence-access-requests/${ACCESS_REQUEST_APPROVED}/approve`,
+      )
+      .set(headers('traffic-authority'))
+      .send({ legal_basis: 'Art. 13 da Portaria 003/2026' });
+    expect(response.status).toBe(409);
+    expect(response.body.code).toBe('TEAT.EVIDENCE_ACCESS_STATE_INVALID');
+  });
+
+  it('C-0003-42 — dado DETRAN_LOCAL_ROLES=processing-operator quando POST /v1/ops/evidence-access-requests/{id}/approve então 403', async () => {
+    const response = await request(server())
+      .post(
+        `/v1/ops/evidence-access-requests/${ACCESS_REQUEST_APPROVED}/approve`,
+      )
+      .set(headers('processing-operator'))
+      .send({ legal_basis: 'Art. 13 da Portaria 003/2026' });
+    expect(response.status).toBe(403);
+  });
+});
+
+describe('CTG-0003 §6.5/§6.6 — mobile-packages sync-metadata e content (C-0003-43)', () => {
+  it('C-0003-43a — dado DETRAN_LOCAL_ROLES=field-agent quando GET /v1/inf/normative/mobile-packages/sync-metadata então 200', async () => {
+    const response = await request(server())
+      .get('/v1/inf/normative/mobile-packages/sync-metadata')
+      .set(headers('field-agent'));
+    expect(response.status).toBe(200);
+  });
+
+  /**
+   * OD-T52 (adenda CTG-0003 §13, 2026-09-16): a guarda de integridade do
+   * `content` corre **sempre** — não há exceção por proveniência. A fixture
+   * `…e7000001` tem `manifest_hash` placeholder e nunca bate com a
+   * recomposição, então este caso gera o pacote pelo próprio backend
+   * (`generate` → `publish` → `content`) em vez de usar a fixture, que
+   * continua servindo só `sync-metadata`.
+   */
+  it('C-0003-43b — dado um pacote gerado e publicado pelo backend quando GET /v1/inf/normative/mobile-packages/{id}/content então 200 com manifest_hash igual ao gerado e signature.kind=local-unsigned', async () => {
+    const generateResponse = await request(server())
+      .post('/v1/inf/normative/mobile-packages/generate')
+      .set(headers('agency-admin'))
+      .send({
+        catalog_id: CATALOG_ACTIVE,
+        package_version: `e2e-content-${randomUUID().slice(0, 8)}`,
+      });
+    expect(generateResponse.status).toBe(201);
+    const packageId = generateResponse.body.id as string;
+    const generatedHash = generateResponse.body.manifest_hash as string;
+    createdPackageIds.push(packageId);
+
+    const publishResponse = await request(server())
+      .post(`/v1/inf/normative/mobile-packages/${packageId}/publish`)
+      .set(headers('agency-admin'))
+      .send({});
+    expect(publishResponse.status).toBe(200);
+
+    const contentResponse = await request(server())
+      .get(`/v1/inf/normative/mobile-packages/${packageId}/content`)
+      .set(headers('field-agent'));
+    expect(contentResponse.status).toBe(200);
+    expect(contentResponse.body).toMatchObject({
+      manifest_hash: generatedHash,
+      signature: expect.objectContaining({ kind: 'local-unsigned' }),
+    });
+  });
+
+  it('C-0003-43c — dado o catálogo alterado (novo enquadramento ativo) depois da geração então GET .../content então 422 TEAT.PACKAGE_MANIFEST_MISMATCH', async () => {
+    const generateResponse = await request(server())
+      .post('/v1/inf/normative/mobile-packages/generate')
+      .set(headers('agency-admin'))
+      .send({
+        catalog_id: CATALOG_ACTIVE,
+        package_version: `e2e-mismatch-${randomUUID().slice(0, 8)}`,
+      });
+    expect(generateResponse.status).toBe(201);
+    const packageId = generateResponse.body.id as string;
+    createdPackageIds.push(packageId);
+
+    const publishResponse = await request(server())
+      .post(`/v1/inf/normative/mobile-packages/${packageId}/publish`)
+      .set(headers('agency-admin'))
+      .send({});
+    expect(publishResponse.status).toBe(200);
+
+    // Altera o catálogo sob o pacote já gerado: um novo enquadramento ativo
+    // muda o manifesto recomposto sem tocar em manifest_hash gravado.
+    const extraFramingId = randomUUID();
+    createdFramingIds.push(extraFramingId);
+    await client.query(`select set_config('app.role', 'owner', false)`);
+    await client.query(`select set_config('app.tenant_id', $1, false)`, [
+      TENANT_ID,
+    ]);
+    await client.query(
+      `insert into inf.normative_framing
+         (id, tenant_id, catalog_id, framing_code, description, approach_class, status)
+       values ($1, $2, $3, $4, 'Enquadramento extra do e2e (C-0003-43c)', 'caso_1', 'active')`,
+      [
+        extraFramingId,
+        TENANT_ID,
+        CATALOG_ACTIVE,
+        `E2E-${extraFramingId.slice(0, 8)}`,
+      ],
+    );
+
+    const contentResponse = await request(server())
+      .get(`/v1/inf/normative/mobile-packages/${packageId}/content`)
+      .set(headers('field-agent'));
+    expect(contentResponse.status).toBe(422);
+    expect(contentResponse.body.code).toBe('TEAT.PACKAGE_MANIFEST_MISMATCH');
+  });
+});
+
+/**
+ * CTG-0003 §6.5/§14.2 (adenda do maestro, 2026-09-16, delivery-review ciclo 1
+ * achado §14.2) — TASK-0006 iteração 3: `GET .../content` carrega
+ * `ETag: "<manifest_hash>"`; `If-None-Match` igual devolve 304 sem corpo;
+ * `If-None-Match` diferente devolve 200 de novo. Mesmo desenho de pacote do
+ * C-0003-43b (gerado pelo backend, nunca a fixture `…e7000001`).
+ */
+describe('CTG-0003 §14.2 — mobile-packages/{id}/content: ETag e If-None-Match', () => {
+  it('dado um pacote gerado e publicado então GET .../content traz ETag: "<manifest_hash>"; If-None-Match igual devolve 304 sem corpo; If-None-Match diferente devolve 200', async () => {
+    const generateResponse = await request(server())
+      .post('/v1/inf/normative/mobile-packages/generate')
+      .set(headers('agency-admin'))
+      .send({
+        catalog_id: CATALOG_ACTIVE,
+        package_version: `e2e-etag-${randomUUID().slice(0, 8)}`,
+      });
+    expect(generateResponse.status).toBe(201);
+    const packageId = generateResponse.body.id as string;
+    createdPackageIds.push(packageId);
+
+    const publishResponse = await request(server())
+      .post(`/v1/inf/normative/mobile-packages/${packageId}/publish`)
+      .set(headers('agency-admin'))
+      .send({});
+    expect(publishResponse.status).toBe(200);
+
+    const first = await request(server())
+      .get(`/v1/inf/normative/mobile-packages/${packageId}/content`)
+      .set(headers('field-agent'));
+    expect(first.status).toBe(200);
+    const etag = first.headers.etag as string;
+    expect(etag).toBe(`"${first.body.manifest_hash}"`);
+
+    const notModified = await request(server())
+      .get(`/v1/inf/normative/mobile-packages/${packageId}/content`)
+      .set(headers('field-agent'))
+      .set('if-none-match', etag);
+    expect(notModified.status).toBe(304);
+    expect(notModified.body).toEqual({});
+
+    const changed = await request(server())
+      .get(`/v1/inf/normative/mobile-packages/${packageId}/content`)
+      .set(headers('field-agent'))
+      .set('if-none-match', '"sha256:outro-hash-qualquer"');
+    expect(changed.status).toBe(200);
+    expect(changed.body.manifest_hash).toBe(first.body.manifest_hash);
+  });
+});
+
+describe('CTG-0003 §6.2 — mobile-packages/generate: papel mínimo × papel fora da regra (C-0003-44)', () => {
+  it('C-0003-44 — dado DETRAN_LOCAL_ROLES=agency-admin quando POST /v1/inf/normative/mobile-packages/generate então 201', async () => {
+    const response = await request(server())
+      .post('/v1/inf/normative/mobile-packages/generate')
+      .set(headers('agency-admin'))
+      .send({
+        catalog_id: CATALOG_ACTIVE,
+        package_version: `e2e-${randomUUID().slice(0, 8)}`,
+      });
+    expect(response.status).toBe(201);
+    createdPackageIds.push(response.body.id as string);
+  });
+
+  it('C-0003-44 — dado DETRAN_LOCAL_ROLES=field-agent quando POST /v1/inf/normative/mobile-packages/generate então 403', async () => {
+    const response = await request(server())
+      .post('/v1/inf/normative/mobile-packages/generate')
+      .set(headers('field-agent'))
+      .send({ catalog_id: CATALOG_ACTIVE, package_version: 'e2e-denied' });
+    expect(response.status).toBe(403);
+  });
+});
+
+describe('CTG-0003 §1 — fronteira de rota v1/ops/* (C-0003-45)', () => {
+  /**
+   * Mesmo padrão de `teat-field-sync.e2e.spec.ts` C-0002-50: a forma da
+   * propriedade mudou entre versões do Express (`router` na 5, `_router` na
+   * 4), então as duas são aceitas.
+   */
+  function mountedPaths(): string[] {
+    const instance = app.getHttpAdapter().getInstance() as {
+      router?: { stack?: { route?: { path?: string } }[] };
+      _router?: { stack?: { route?: { path?: string } }[] };
+    };
+    const stack = instance.router?.stack ?? instance._router?.stack ?? [];
+    return stack
+      .map((layer) => layer.route?.path)
+      .filter((path): path is string => typeof path === 'string');
+  }
+
+  it('C-0003-45 — dado o app montado quando as rotas manuscritas de ops/evidence e ops/snapshots são enumeradas então todas começam por v1/ops/ (nenhuma rota /ops/evidence* ou /ops/snapshots* sem o prefixo)', () => {
+    const offending = mountedPaths().filter(
+      (path) =>
+        (path.startsWith('/ops/evidence') ||
+          path.startsWith('/ops/snapshots') ||
+          path === '/ops/evidence' ||
+          path === '/ops/snapshots') &&
+        !path.startsWith('/v1/'),
+    );
+    expect(
+      offending,
+      `rotas manuscritas de evidence/snapshots fora de /v1/ops/ (§1): ${offending.join(', ')}`,
+    ).toEqual([]);
+  });
+
+  it('C-0003-45 — dado as rotas de evidence e snapshots já montadas então todas começam efetivamente por /v1/ops/', () => {
+    const evidenceOrSnapshots = mountedPaths().filter(
+      (path) => path.includes('ops/evidence') || path.includes('ops/snapshots'),
+    );
+    for (const path of evidenceOrSnapshots) {
+      expect(path.startsWith('/v1/ops/')).toBe(true);
+    }
+  });
+});
diff --git a/backend/domains/inf/normative/src/handwritten/generate-package.command.spec.ts b/backend/domains/inf/normative/src/handwritten/generate-package.command.spec.ts
new file mode 100644
index 0000000..0a3e133
--- /dev/null
+++ b/backend/domains/inf/normative/src/handwritten/generate-package.command.spec.ts
@@ -0,0 +1,336 @@
+import { describe, expect, it, vi } from 'vitest';
+
+/**
+ * CTG-0003 §3/§6.2 e §10 (R-0008, TASK-0006) — C-0003-20…22: `POST
+ * /v1/inf/normative/mobile-packages/generate` (M13).
+ * `handwritten/generate-package.command.ts` nasce em TASK-0007 (CTG-0003
+ * §11). Nome esperado do export: `GeneratePackageCommand`, construtor
+ * `(deps)`, método `execute`.
+ *
+ * Fixtures: `normative_catalog` `…e0000001` (`active`, corrigido por
+ * `27-fixtures-teat-evidence.sql` — OD-T35) e `…e0000002` (`draft`);
+ * `normative_framing`/`normative_metrological_table`/`normative_validation_rule`/
+ * `normative_document_template`/`normative_agency_parameter` `active` do
+ * catálogo `…e0000001`.
+ *
+ * Canônico (CTG-0003 §3): manifesto = JSON canônico (chaves ordenadas) das
+ * seis coleções, só linhas `status='active'`; `manifest_hash='sha256:'+sha256hex`.
+ */
+
+const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
+const AGENCY_ID = '00000000-0000-7000-8000-0000e2000001';
+const CATALOG_ACTIVE = '00000000-0000-7000-8000-0000e0000001';
+const CATALOG_DRAFT = '00000000-0000-7000-8000-0000e0000002';
+
+function repository(rows: Record<string, unknown>[] = []) {
+  const store = [...rows];
+  return {
+    rows: store,
+    list: vi.fn(async () => [...store]),
+    listWhere: vi.fn(
+      async (predicate: (row: Record<string, unknown>) => boolean) =>
+        store.filter(predicate),
+    ),
+    find: vi.fn(async (id: string) => store.find((row) => row.id === id)),
+    findOne: vi.fn(async (id: string) => store.find((row) => row.id === id)),
+    create: vi.fn(async (values: Record<string, unknown>) => {
+      const row = { id: `row-${store.length + 1}`, ...values };
+      store.push(row);
+      return row;
+    }),
+  };
+}
+
+interface Deps {
+  database: { tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> };
+  requestContext: {
+    hasActiveContext(): boolean;
+    snapshot(): { tenantId: string; actorId: string };
+  };
+  repositories: Record<string, ReturnType<typeof repository>>;
+  clock: { now(): string };
+}
+
+function activeCatalogRows() {
+  return {
+    catalogs: repository([
+      {
+        id: CATALOG_ACTIVE,
+        tenant_id: TENANT_ID,
+        status: 'active',
+        name: 'Catálogo CONTRAN',
+        version: '2026.1',
+      },
+      {
+        id: CATALOG_DRAFT,
+        tenant_id: TENANT_ID,
+        status: 'draft',
+        name: 'Catálogo CONTRAN — revisão 2026.2',
+        version: '2026.2',
+      },
+    ]),
+    framings: repository([
+      {
+        id: '00000000-0000-7000-8000-0000e1000001',
+        catalog_id: CATALOG_ACTIVE,
+        status: 'active',
+        framing_code: '7455-0',
+      },
+      {
+        id: '00000000-0000-7000-8000-0000e1000002',
+        catalog_id: CATALOG_ACTIVE,
+        status: 'active',
+        framing_code: '5541-0',
+      },
+    ]),
+    metrologicalTables: repository([
+      {
+        id: '00000000-0000-7000-8000-0000eb000001',
+        catalog_id: CATALOG_ACTIVE,
+        status: 'active',
+      },
+    ]),
+    validationRules: repository([
+      {
+        id: '00000000-0000-7000-8000-0000e1100001',
+        catalog_id: CATALOG_ACTIVE,
+        status: 'active',
+      },
+    ]),
+    documentTemplates: repository([
+      {
+        id: '00000000-0000-7000-8000-0000e1200001',
+        traffic_agency_id: AGENCY_ID,
+        status: 'active',
+      },
+    ]),
+    agencyParameters: repository([
+      {
+        id: '00000000-0000-7000-8000-0000e1300001',
+        traffic_agency_id: AGENCY_ID,
+        status: 'active',
+      },
+    ]),
+    packages: repository(),
+  };
+}
+
+/**
+ * CTG-0003 §14.3: `agencyOfPrincipal` consulta `ops.ops_agent_profile` sob a
+ * transação. Por padrão o stub devolve a agência da fixture (`…e2000001`,
+ * perfil `…b0000001`) para não quebrar os casos que não envolvem resolução
+ * de órgão; `agencyProfileRows` no override troca o resultado.
+ */
+function defaultTx(agencyProfileRows: Record<string, unknown>[]) {
+  return {
+    async tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> {
+      return work({
+        query: vi.fn(async (sql: string) =>
+          typeof sql === 'string' && sql.includes('ops_agent_profile')
+            ? { rows: agencyProfileRows }
+            : { rows: [] },
+        ),
+      });
+    },
+  };
+}
+
+function deps(overrides: Partial<Deps> = {}): Deps {
+  return {
+    database:
+      overrides.database ?? defaultTx([{ traffic_agency_id: AGENCY_ID }]),
+    requestContext: overrides.requestContext ?? {
+      hasActiveContext: () => true,
+      snapshot: () => ({
+        tenantId: TENANT_ID,
+        actorId: '00000000-0000-4000-8000-0000b0000001',
+      }),
+    },
+    repositories: overrides.repositories ?? activeCatalogRows(),
+    clock: overrides.clock ?? { now: () => '2026-09-14T14:00:00.000Z' },
+  };
+}
+
+function input(
+  overrides: Record<string, unknown> = {},
+): Record<string, unknown> {
+  return {
+    catalog_id: CATALOG_ACTIVE,
+    package_version: `2026.1-${Math.random().toString(36).slice(2, 8)}`,
+    ...overrides,
+  };
+}
+
+const importModule = (specifier: string): Promise<unknown> =>
+  import(/* @vite-ignore */ specifier);
+
+async function generatePackage(
+  dependencies: Deps,
+  body: Record<string, unknown>,
+): Promise<Record<string, unknown>> {
+  let loaded: Record<string, unknown>;
+  try {
+    loaded = (await importModule('./generate-package.command.js')) as Record<
+      string,
+      unknown
+    >;
+  } catch (cause) {
+    throw new Error(
+      'inf/normative/src/handwritten/generate-package.command.ts ainda não existe (TASK-0007, CTG-0003 §11)',
+      { cause },
+    );
+  }
+  const exported =
+    (loaded.GeneratePackageCommand as unknown) ??
+    Object.values(loaded).find((value) => typeof value === 'function');
+  if (typeof exported !== 'function') {
+    throw new Error(
+      'generate-package.command.ts não exporta um comando construtível (CTG-0003 §11)',
+    );
+  }
+  const Command = exported as new (
+    dependencies: unknown,
+  ) => Record<string, unknown>;
+  const command = new Command(dependencies);
+  const method = ['execute', 'handle', 'run']
+    .map((name) => command[name])
+    .find((value) => typeof value === 'function');
+  if (typeof method !== 'function') {
+    throw new Error(
+      'generate-package.command.ts não expõe execute|handle|run (CTG-0003 §6.2)',
+    );
+  }
+  return (await (method as (value: unknown) => Promise<unknown>).call(
+    command,
+    body,
+  )) as Record<string, unknown>;
+}
+
+describe('CTG-0003 §6.2 — mobile-packages/generate: catálogo ativo e manifesto (C-0003-20…22)', () => {
+  it('C-0003-20 — dado o catálogo …e0000002 (draft) quando generate então 422 TEAT.PACKAGE_CATALOG_NOT_ACTIVE com { catalogId, currentState }', async () => {
+    const dependencies = deps();
+    await expect(
+      generatePackage(dependencies, input({ catalog_id: CATALOG_DRAFT })),
+    ).rejects.toMatchObject({
+      code: 'TEAT.PACKAGE_CATALOG_NOT_ACTIVE',
+      status: 422,
+      context: expect.objectContaining({
+        catalogId: CATALOG_DRAFT,
+        currentState: 'draft',
+      }),
+    });
+  });
+
+  it('C-0003-21 — dado o catálogo ativo quando generate (duas vezes) então o manifest_hash é determinístico', async () => {
+    const dependencies = deps();
+    const first = await generatePackage(
+      dependencies,
+      input({ package_version: '2026.1-a' }),
+    );
+    const second = await generatePackage(
+      dependencies,
+      input({ package_version: '2026.1-b' }),
+    );
+    expect(first.manifest_hash).toEqual(expect.stringMatching(/^sha256:/));
+    expect(second.manifest_hash).toBe(first.manifest_hash);
+  });
+
+  it('C-0003-22 — dado generate então o manifesto contém apenas linhas status=active das seis coleções: uma linha retired a mais não muda o manifest_hash', async () => {
+    const baseline = deps();
+    const baselineResponse = await generatePackage(
+      baseline,
+      input({ package_version: '2026.1-baseline' }),
+    );
+
+    const repositoriesWithRetired = activeCatalogRows();
+    repositoriesWithRetired.framings.rows.push({
+      id: 'framing-inactive',
+      catalog_id: CATALOG_ACTIVE,
+      status: 'retired',
+      framing_code: '0000-0',
+    });
+    const withRetired = deps({ repositories: repositoriesWithRetired });
+    const withRetiredResponse = await generatePackage(
+      withRetired,
+      input({ package_version: '2026.1-with-retired' }),
+    );
+
+    expect(withRetiredResponse.manifest_hash).toBe(
+      baselineResponse.manifest_hash,
+    );
+    expect(baselineResponse.status).toBe('draft');
+  });
+});
+
+/**
+ * CTG-0003 §14 item 3 (adenda do maestro, 2026-09-16, delivery-review ciclo 1
+ * achado §14.3, substitui OD-T57) — TASK-0006 iteração 3: `mobile-packages/generate`
+ * sem `traffic_agency_id` no corpo resolve por `ops_agent_profile` do
+ * principal e, na ausência dele, por `catalog.traffic_agency_id`; sem
+ * nenhuma fonte, 422 fail-closed; nunca o id do tenant.
+ *
+ * Escrito em paralelo à iteração 3 do Engineer: `generate-package.command.ts`
+ * já traz `resolveAgency()` (corpo → perfil → catálogo → 422) lida antes de
+ * fechar os casos abaixo.
+ */
+describe('CTG-0003 §14.3 — mobile-packages/generate: resolução de traffic_agency_id', () => {
+  it('dado o corpo sem traffic_agency_id e o principal com perfil então o pacote gravado usa o órgão do perfil (…e2000001), nunca o tenant_id', async () => {
+    const dependencies = deps();
+    const body = input();
+    expect(body.traffic_agency_id).toBeUndefined();
+    const response = await generatePackage(dependencies, body);
+    const saved = dependencies.repositories.packages.rows.find(
+      (row) => row.id === response.id,
+    );
+    expect(saved?.traffic_agency_id).toBe(AGENCY_ID);
+    expect(saved?.traffic_agency_id).not.toBe(TENANT_ID);
+  });
+
+  it('dado traffic_agency_id explícito no corpo então prevalece sobre o perfil do principal', async () => {
+    const EXPLICIT_AGENCY = '00000000-0000-7000-8000-0000e2000099';
+    const dependencies = deps();
+    const response = await generatePackage(
+      dependencies,
+      input({ traffic_agency_id: EXPLICIT_AGENCY }),
+    );
+    const saved = dependencies.repositories.packages.rows.find(
+      (row) => row.id === response.id,
+    );
+    expect(saved?.traffic_agency_id).toBe(EXPLICIT_AGENCY);
+  });
+
+  it('dado sem corpo e sem perfil, mas o catálogo tem traffic_agency_id então o pacote usa o órgão do catálogo', async () => {
+    const CATALOG_AGENCY = '00000000-0000-7000-8000-0000e2000088';
+    const repositories = activeCatalogRows();
+    const catalog = repositories.catalogs.rows.find(
+      (row) => row.id === CATALOG_ACTIVE,
+    );
+    if (catalog) catalog.traffic_agency_id = CATALOG_AGENCY;
+    const dependencies = deps({
+      database: defaultTx([]),
+      repositories,
+    });
+    const response = await generatePackage(dependencies, input());
+    const saved = dependencies.repositories.packages.rows.find(
+      (row) => row.id === response.id,
+    );
+    expect(saved?.traffic_agency_id).toBe(CATALOG_AGENCY);
+  });
+
+  it('dado sem corpo, sem perfil do principal e sem traffic_agency_id no catálogo então 422 TEAT.VALIDATION_FAILED com fields=[{ path: "traffic_agency_id", rule: "required" }], e nenhum pacote persistido', async () => {
+    const dependencies = deps({ database: defaultTx([]) });
+    await expect(generatePackage(dependencies, input())).rejects.toMatchObject({
+      code: 'TEAT.VALIDATION_FAILED',
+      status: 422,
+      context: expect.objectContaining({
+        fields: expect.arrayContaining([
+          expect.objectContaining({
+            path: 'traffic_agency_id',
+            rule: 'required',
+          }),
+        ]),
+      }),
+    });
+    expect(dependencies.repositories.packages.rows).toEqual([]);
+  });
+});
diff --git a/backend/domains/inf/normative/src/handwritten/generate-package.command.ts b/backend/domains/inf/normative/src/handwritten/generate-package.command.ts
new file mode 100644
index 0000000..ba1d23a
--- /dev/null
+++ b/backend/domains/inf/normative/src/handwritten/generate-package.command.ts
@@ -0,0 +1,136 @@
+// CTG-0003 §3 e §6.2 (M13, R-0008, TASK-0007) — `POST
+// /v1/inf/normative/mobile-packages/generate`.
+//
+// Gerar rascunho não publica: §8 só nomeia `PACOTE_MOBILE_PUBLICADO`, então
+// nenhum envelope sai daqui.
+import { randomUUID } from 'node:crypto';
+
+import { DetranError } from '@detran/shared';
+
+import { buildManifest, manifestHashOf } from './manifest.js';
+import {
+  agencyOfPrincipal,
+  catalogNotActive,
+  inTenantTransaction,
+  insertRow,
+  readRow,
+  readRows,
+  stringOf,
+  tenantMismatch,
+  tenantScope,
+  validationFailed,
+  type NormativeDeps,
+  type NormativeRow,
+} from './normative-runtime.js';
+
+export interface GeneratePackageInput {
+  catalog_id: string;
+  package_version: string;
+  valid_until?: string;
+  traffic_agency_id?: string;
+}
+
+export interface GeneratePackageResult {
+  id: string;
+  status: 'draft';
+  package_version: string;
+  manifest_hash: string;
+  catalog_id: string;
+  valid_until: string | null;
+}
+
+export class GeneratePackageCommand {
+  constructor(private readonly deps: NormativeDeps) {}
+
+  async execute(input: GeneratePackageInput): Promise<GeneratePackageResult> {
+    const catalogId = stringOf(input?.catalog_id ?? '').trim();
+    const packageVersion = stringOf(input?.package_version ?? '').trim();
+    const fields = [
+      ...(catalogId ? [] : [{ path: 'catalog_id', rule: 'required' }]),
+      ...(packageVersion && packageVersion.length <= 80
+        ? []
+        : [{ path: 'package_version', rule: 'required' }]),
+    ];
+    if (fields.length > 0) throw validationFailed(fields);
+
+    const catalog = await readRow(this.deps, 'catalogs', catalogId);
+    if (!catalog) throw tenantMismatch({ catalogId });
+    const currentState = stringOf(catalog.status);
+    if (currentState !== 'active')
+      throw catalogNotActive(catalogId, currentState);
+
+    const { actorId } = tenantScope(this.deps);
+    const agencyId = await this.resolveAgency(input, catalog, actorId);
+    const manifest = await buildManifest(this.deps, catalog, agencyId);
+    const manifestHash = manifestHashOf(manifest);
+    const validUntil = input?.valid_until
+      ? stringOf(input.valid_until).slice(0, 10)
+      : null;
+
+    const existing = (
+      await readRows(
+        this.deps,
+        'packages',
+        (row) => stringOf(row.package_version) === packageVersion,
+      )
+    )[0];
+    if (existing) {
+      if (stringOf(existing.manifest_hash) === manifestHash)
+        throw new DetranError('TEAT.IDEMPOTENCY_REPLAY', {
+          status: 409,
+          context: { packageVersion },
+          message: 'Já existe pacote com esta versão e o mesmo manifesto.',
+        });
+      throw validationFailed([{ path: 'package_version', rule: 'unique' }]);
+    }
+
+    const id = randomUUID();
+    return inTenantTransaction(this.deps, async (tx) => {
+      await insertRow(this.deps, tx, 'packages', {
+        id,
+        traffic_agency_id: agencyId,
+        catalog_id: catalogId,
+        package_version: packageVersion,
+        manifest_hash: manifestHash,
+        // §11.11: a coluna é `not null` e o conteúdo mora nesta rota.
+        package_uri: `/v1/inf/normative/mobile-packages/${id}/content`,
+        published_at: null,
+        valid_until: validUntil,
+        status: 'draft',
+      });
+
+      return {
+        id,
+        status: 'draft' as const,
+        package_version: packageVersion,
+        manifest_hash: manifestHash,
+        catalog_id: catalogId,
+        valid_until: validUntil,
+      };
+    });
+  }
+
+  /**
+   * §14.3 — a DTO da §6.2 não carrega o órgão e
+   * `normative_mobile_package.traffic_agency_id` é `not null`. Ordem fixada:
+   * corpo → perfil do principal (`ops_agent_profile.user_ref = actorId`) →
+   * `catalog.traffic_agency_id`. Sem nenhuma das três fontes, 422: o id do
+   * tenant nunca é usado como órgão, e nenhum identificador é inventado.
+   */
+  private async resolveAgency(
+    input: GeneratePackageInput,
+    catalog: NormativeRow,
+    actorId: string,
+  ): Promise<string> {
+    const fromBody = stringOf(input?.traffic_agency_id ?? '').trim();
+    if (fromBody) return fromBody;
+
+    const fromProfile = await agencyOfPrincipal(this.deps, actorId);
+    if (fromProfile) return fromProfile;
+
+    const fromCatalog = stringOf(catalog.traffic_agency_id ?? '').trim();
+    if (fromCatalog) return fromCatalog;
+
+    throw validationFailed([{ path: 'traffic_agency_id', rule: 'required' }]);
+  }
+}
diff --git a/backend/domains/inf/normative/src/handwritten/normative-runtime.ts b/backend/domains/inf/normative/src/handwritten/normative-runtime.ts
new file mode 100644
index 0000000..9f499dc
--- /dev/null
+++ b/backend/domains/inf/normative/src/handwritten/normative-runtime.ts
@@ -0,0 +1,336 @@
+// CTG-0003 §6 (M13, R-0008, TASK-0007) — dependências e utilidades dos
+// comandos manuscritos do catálogo e do pacote normativo.
+//
+// As leituras que compõem o manifesto acontecem **antes** da transação de
+// escrita: a porta de repositório abre a própria transação quando existe (é o
+// que os harnesses fazem), e misturar as duas coisas partiria o ciclo de
+// escrita no meio.
+import { createHash } from 'node:crypto';
+
+import { DetranError, withTenantContext } from '@detran/shared';
+import type { RequestContext } from '@stynx-nyx/core';
+import type { Database, Transaction } from '@stynx-nyx/data';
+
+export type NormativeRow = Record<string, unknown>;
+
+export interface NormativeRowStore {
+  list?(): Promise<NormativeRow[]>;
+  listWhere?(
+    predicate: (row: NormativeRow) => boolean,
+  ): Promise<NormativeRow[]>;
+  find?(id: string): Promise<NormativeRow | undefined>;
+  findOne?(id: string): Promise<NormativeRow | undefined>;
+  create?(values: NormativeRow): Promise<NormativeRow>;
+  update?(
+    id: string,
+    patch: NormativeRow,
+    tx?: unknown,
+  ): Promise<NormativeRow | undefined>;
+}
+
+/** Porta de selo do pacote (CTG-0002 §4.8; semântica em CTG-0003 §3). */
+export interface PackageSignature {
+  signature: string;
+  signer: string;
+  kind: 'local-unsigned' | 'sealed';
+}
+
+export interface PackageSigner {
+  sign(manifestHash: string): Promise<PackageSignature>;
+}
+
+export interface NormativeEventEnvelope {
+  id: string;
+  type: string;
+  domainEvent: string;
+  version: number;
+  occurredAt: string;
+  tenantId: string;
+  actor: { kind: 'user' | 'system' | 'timer'; id: string };
+  correlationId: string;
+  aggregate: { kind: string; id: string; version: number };
+  data: Record<string, unknown>;
+}
+
+export interface NormativeOutbox {
+  append(
+    tx: Transaction,
+    envelope: NormativeEventEnvelope,
+  ): Promise<{ id: string }>;
+}
+
+export interface NormativeClock {
+  now(): string;
+  today?(): string;
+}
+
+export interface NormativeDeps {
+  database: Pick<Database, 'tx'>;
+  requestContext: Pick<RequestContext, 'hasActiveContext' | 'snapshot'>;
+  repositories: Record<string, NormativeRowStore | undefined>;
+  packageSigner?: PackageSigner;
+  outbox?: NormativeOutbox;
+  clock: NormativeClock;
+}
+
+export const NORMATIVE_TABLES = {
+  catalogs: 'inf.normative_catalog',
+  framings: 'inf.normative_framing',
+  metrologicalTables: 'inf.normative_metrological_table',
+  validationRules: 'inf.normative_validation_rule',
+  documentTemplates: 'inf.normative_document_template',
+  agencyParameters: 'inf.normative_agency_parameter',
+  packages: 'inf.normative_mobile_package',
+} as const;
+
+export type NormativeTableName = keyof typeof NORMATIVE_TABLES;
+
+interface SqlQueryable {
+  query<T extends Record<string, unknown> = Record<string, unknown>>(
+    sql: string,
+    values?: readonly unknown[],
+  ): Promise<{ rows: T[] }>;
+}
+
+function sqlOf(tx: unknown): SqlQueryable | undefined {
+  const candidate = tx as Partial<SqlQueryable> | null | undefined;
+  return candidate && typeof candidate.query === 'function'
+    ? (candidate as SqlQueryable)
+    : undefined;
+}
+
+function storeOf(
+  deps: NormativeDeps,
+  table: NormativeTableName,
+): NormativeRowStore | undefined {
+  return deps.repositories[table];
+}
+
+function assertColumns(values: NormativeRow): string[] {
+  const columns = Object.keys(values);
+  if (columns.some((column) => !/^[a-z_]+$/.test(column)))
+    throw new Error('Coluna inválida em escrita de inf');
+  return columns;
+}
+
+export function tenantScope(deps: NormativeDeps): {
+  tenantId: string;
+  actorId: string;
+} {
+  if (!deps.requestContext.hasActiveContext())
+    throw new Error('Um comando normativo exige contexto de requisição');
+  const snapshot = deps.requestContext.snapshot();
+  const tenantId = snapshot.tenantId ?? '';
+  const actorId = snapshot.actorId ?? '';
+  if (!tenantId || !actorId)
+    throw new Error('Um comando normativo exige tenantId e actorId');
+  return { tenantId, actorId };
+}
+
+export function inTenantTransaction<T>(
+  deps: NormativeDeps,
+  work: (tx: Transaction) => Promise<T>,
+): Promise<T> {
+  return withTenantContext(deps.database, deps.requestContext, work);
+}
+
+/** Leitura fora da transação de escrita (ver o cabeçalho deste arquivo). */
+export function readRow(
+  deps: NormativeDeps,
+  table: NormativeTableName,
+  id: string,
+): Promise<NormativeRow | undefined> {
+  const store = storeOf(deps, table);
+  if (typeof store?.find === 'function') return store.find(id);
+  if (typeof store?.findOne === 'function') return store.findOne(id);
+  return inTenantTransaction(deps, async (tx) => {
+    const sql = sqlOf(tx);
+    if (!sql) return undefined;
+    const result = await sql.query(
+      `select * from ${NORMATIVE_TABLES[table]} where id = $1`,
+      [id],
+    );
+    return result.rows[0];
+  });
+}
+
+export function readRows(
+  deps: NormativeDeps,
+  table: NormativeTableName,
+  predicate: (row: NormativeRow) => boolean = () => true,
+): Promise<NormativeRow[]> {
+  const store = storeOf(deps, table);
+  if (typeof store?.listWhere === 'function') return store.listWhere(predicate);
+  if (typeof store?.list === 'function')
+    return store.list().then((rows) => rows.filter(predicate));
+  return inTenantTransaction(deps, async (tx) => {
+    const sql = sqlOf(tx);
+    if (!sql) return [];
+    const result = await sql.query(
+      `select * from ${NORMATIVE_TABLES[table]} order by id`,
+    );
+    return result.rows.filter(predicate);
+  });
+}
+
+export async function insertRow(
+  deps: NormativeDeps,
+  tx: unknown,
+  table: NormativeTableName,
+  values: NormativeRow,
+): Promise<NormativeRow> {
+  const store = storeOf(deps, table);
+  if (typeof store?.create === 'function') return store.create(values);
+  const sql = sqlOf(tx);
+  if (!sql)
+    throw new Error(`Sem porta nem transação para escrever em ${table}`);
+  const columns = assertColumns(values);
+  const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
+  const result = await sql.query(
+    `insert into ${NORMATIVE_TABLES[table]} (${columns.join(', ')})
+     values (${placeholders}) returning *`,
+    columns.map((column) => normalize(values[column])),
+  );
+  return (result.rows[0] ?? values) as NormativeRow;
+}
+
+export async function patchRow(
+  deps: NormativeDeps,
+  tx: unknown,
+  table: NormativeTableName,
+  id: string,
+  patch: NormativeRow,
+): Promise<NormativeRow | undefined> {
+  const store = storeOf(deps, table);
+  if (typeof store?.update === 'function') return store.update(id, patch, tx);
+  const sql = sqlOf(tx);
+  if (!sql) throw new Error(`Sem porta nem transação para atualizar ${table}`);
+  const columns = assertColumns(patch);
+  const assignments = columns
+    .map((column, index) => `${column} = $${index + 2}`)
+    .join(', ');
+  const result = await sql.query(
+    `update ${NORMATIVE_TABLES[table]}
+        set ${assignments}, updated_at = now()
+      where id = $1 returning *`,
+    [id, ...columns.map((column) => normalize(patch[column]))],
+  );
+  return result.rows[0];
+}
+
+function normalize(value: unknown): unknown {
+  if (value === null || value === undefined) return null;
+  if (typeof value === 'object' && !(value instanceof Date))
+    return JSON.stringify(value);
+  return value;
+}
+
+/**
+ * §14.3 — órgão do principal, lido de `ops.ops_agent_profile` pelo `user_ref`
+ * do contexto, sob RLS. Sem perfil, devolve `undefined`: o chamador decide, e
+ * nunca se inventa um órgão (o id do tenant **não** é órgão).
+ */
+export async function agencyOfPrincipal(
+  deps: NormativeDeps,
+  actorId: string,
+): Promise<string | undefined> {
+  return inTenantTransaction(deps, async (tx) => {
+    const sql = sqlOf(tx);
+    if (!sql) return undefined;
+    const result = await sql.query<{ traffic_agency_id: string }>(
+      `select traffic_agency_id from ops.ops_agent_profile
+        where user_ref = $1
+        order by created_at
+        limit 1`,
+      [actorId],
+    );
+    const agencyId = result.rows[0]?.traffic_agency_id;
+    return agencyId ? String(agencyId) : undefined;
+  });
+}
+
+export function stringOf(value: unknown): string {
+  return typeof value === 'string' ? value : String(value ?? '');
+}
+
+export function isoOf(value: unknown): string {
+  if (value instanceof Date) return value.toISOString();
+  return stringOf(value);
+}
+
+export function dateOf(value: unknown): string {
+  return isoOf(value).slice(0, 10);
+}
+
+export function todayOf(clock: NormativeClock): string {
+  return clock.today?.() ?? clock.now().slice(0, 10);
+}
+
+export function sha256Hex(payload: string): string {
+  return createHash('sha256').update(payload, 'utf8').digest('hex');
+}
+
+export function validationFailed(
+  fields: readonly { path: string; rule: string }[],
+): DetranError {
+  return new DetranError('TEAT.VALIDATION_FAILED', {
+    status: 422,
+    context: { fields: [...fields] },
+    message: 'Requisição inválida para a regra do comando.',
+  });
+}
+
+export function tenantMismatch(context: Record<string, unknown>): DetranError {
+  return new DetranError('TEAT.TENANT_MISMATCH', {
+    status: 404,
+    context,
+    message: 'Recurso inexistente no tenant do contexto.',
+  });
+}
+
+export function packageStateInvalid(
+  packageId: string,
+  currentState: string,
+  allowed: readonly string[],
+): DetranError {
+  return new DetranError('TEAT.PACKAGE_STATE_INVALID', {
+    status: 409,
+    context: { packageId, currentState, allowed: [...allowed] },
+    message: 'Pacote normativo fora do estado admitido pelo comando.',
+  });
+}
+
+export function catalogStateInvalid(
+  catalogId: string,
+  currentState: string,
+  allowed: readonly string[],
+): DetranError {
+  return new DetranError('TEAT.CATALOG_STATE_INVALID', {
+    status: 409,
+    context: { catalogId, currentState, allowed: [...allowed] },
+    message: 'Catálogo normativo fora do estado admitido pelo comando.',
+  });
+}
+
+export function catalogNotActive(
+  catalogId: string,
+  currentState: string,
+): DetranError {
+  return new DetranError('TEAT.PACKAGE_CATALOG_NOT_ACTIVE', {
+    status: 422,
+    context: { catalogId, currentState },
+    message: 'O catálogo do pacote não está ativo.',
+  });
+}
+
+export function manifestMismatch(
+  packageId: string,
+  expected: string,
+  received: string,
+): DetranError {
+  return new DetranError('TEAT.PACKAGE_MANIFEST_MISMATCH', {
+    status: 422,
+    context: { packageId, expected, received },
+    message: 'Manifesto do pacote divergente do gravado.',
+  });
+}
diff --git a/backend/domains/inf/normative/src/normative-commands.controller.ts b/backend/domains/inf/normative/src/normative-commands.controller.ts
index 5387bcd..59f2481 100644
--- a/backend/domains/inf/normative/src/normative-commands.controller.ts
+++ b/backend/domains/inf/normative/src/normative-commands.controller.ts
@@ -1,72 +1,161 @@
-import { Body, Controller, Param, Post } from '@nestjs/common';
+// CTG-0003 §6 (M13, R-0008, TASK-0007) — comandos e consultas do catálogo e
+// do pacote normativo sob `v1/inf/normative`.
+//
+// As rotas literais (`mobile-packages/sync-metadata`, `.../generate`,
+// `.../{id}/content`) vencem o `:id` do CRUD gerado porque o gerador registra
+// os controladores manuscritos antes (adenda CTG-0003 §12 item 1).
+import {
+  Body,
+  Controller,
+  Get,
+  Headers,
+  HttpCode,
+  Param,
+  Post,
+  Res,
+} from '@nestjs/common';
 import { Action, Audit, Resource } from '@detran/shared';

-import { NormativeLifecycleService } from './normative-lifecycle.service.js';
+import type { GeneratePackageInput } from './handwritten/generate-package.command.js';
+import { NormativeCommandsService } from './handwritten/normative-commands.service.js';
+import type {
+  PublishCatalogInput,
+  RetireCatalogInput,
+} from './handwritten/publish-catalog.command.js';
+import type {
+  PublishPackageInput,
+  RetirePackageInput,
+} from './handwritten/publish-package.command.js';
+import type { ValidatePackageInput } from './handwritten/validate-package.command.js';
+
+/**
+ * Superfície mínima da resposta HTTP usada pelo 304 da §14.2 — evita amarrar
+ * o módulo de domínio ao tipo concreto do adaptador HTTP.
+ */
+interface HttpResponseLike {
+  setHeader(name: string, value: string): unknown;
+  status(code: number): unknown;
+}
+
+/**
+ * `If-None-Match` do RFC 9110 §13.1.2: lista separada por vírgula, `*`,
+ * aspas e o prefixo fraco `W/` são todos aceitos na comparação.
+ */
+function matchesEtag(
+  ifNoneMatch: string | undefined,
+  manifestHash: string,
+): boolean {
+  if (!ifNoneMatch) return false;
+  return ifNoneMatch
+    .split(',')
+    .map((candidate) =>
+      candidate.trim().replace(/^W\//iu, '').replace(/"/gu, ''),
+    )
+    .some((candidate) => candidate === '*' || candidate === manifestHash);
+}

 @Controller('v1/inf/normative')
 @Resource('inf:normative-catalog')
 export class NormativeCommandsController {
-  constructor(private readonly lifecycle: NormativeLifecycleService) {}
+  constructor(private readonly commands: NormativeCommandsService) {}

   @Post('catalogs/:id/publish')
+  @HttpCode(200)
   @Action('publish')
   @Audit({
     action: 'INF_NORMATIVE_CATALOG_PUBLISH',
     entity: 'inf.normative_catalog',
   })
-  publishCatalog(
-    @Param('id') id: string,
-    @Body() body: { published_at?: string },
-  ) {
-    return this.lifecycle.publishCatalog(id, body.published_at);
+  publishCatalog(@Param('id') id: string, @Body() body: PublishCatalogInput) {
+    return this.commands.publishCatalog(id, body ?? {});
   }

   @Post('catalogs/:id/retire')
+  @HttpCode(200)
   @Action('retire')
   @Audit({
     action: 'INF_NORMATIVE_CATALOG_RETIRE',
     entity: 'inf.normative_catalog',
   })
-  retireCatalog(@Param('id') id: string, @Body() body: { valid_to?: string }) {
-    return this.lifecycle.retireCatalog(id, body.valid_to);
+  retireCatalog(@Param('id') id: string, @Body() body: RetireCatalogInput) {
+    return this.commands.retireCatalog(id, body ?? {});
+  }
+
+  @Get('mobile-packages/sync-metadata')
+  @Resource('inf:mobile-normative-package')
+  @Action('read')
+  syncMetadata() {
+    return this.commands.packageSyncMetadata();
+  }
+
+  @Post('mobile-packages/generate')
+  @Resource('inf:mobile-normative-package')
+  @Action('publish')
+  @Audit({
+    action: 'INF_NORMATIVE_PACKAGE_GENERATE',
+    entity: 'inf.normative_mobile_package',
+  })
+  generatePackage(@Body() body: GeneratePackageInput) {
+    return this.commands.generate(body);
+  }
+
+  /**
+   * §6.5 e §14.2: a resposta carrega `ETag: "<manifest_hash>"`; um
+   * `If-None-Match` igual ao hash devolve 304 sem corpo. A guarda de
+   * integridade do manifesto corre antes de qualquer resposta — inclusive
+   * antes do 304 —, porque quem revalida precisa saber que o pacote deixou de
+   * bater com o catálogo.
+   */
+  @Get('mobile-packages/:id/content')
+  @Resource('inf:mobile-normative-package')
+  @Action('read')
+  async packageContent(
+    @Param('id') id: string,
+    @Headers('if-none-match') ifNoneMatch: string | undefined,
+    @Res({ passthrough: true }) response: HttpResponseLike,
+  ) {
+    const content = await this.commands.packageContent(id);
+    response.setHeader('ETag', `"${content.manifest_hash}"`);
+    if (matchesEtag(ifNoneMatch, content.manifest_hash)) {
+      response.status(304);
+      return undefined;
+    }
+    return content;
   }

   @Post('mobile-packages/:id/publish')
+  @HttpCode(200)
   @Resource('inf:mobile-normative-package')
   @Action('publish')
   @Audit({
     action: 'INF_NORMATIVE_PACKAGE_PUBLISH',
     entity: 'inf.normative_mobile_package',
   })
-  publishPackage(@Param('id') id: string) {
-    return this.lifecycle.publishPackage(id);
+  publishPackage(@Param('id') id: string, @Body() body: PublishPackageInput) {
+    return this.commands.publishPackage(id, body ?? {});
   }

   @Post('mobile-packages/:id/retire')
+  @HttpCode(200)
   @Resource('inf:mobile-normative-package')
   @Action('retire')
   @Audit({
     action: 'INF_NORMATIVE_PACKAGE_RETIRE',
     entity: 'inf.normative_mobile_package',
   })
-  retirePackage(
-    @Param('id') id: string,
-    @Body() body: { valid_until?: string },
-  ) {
-    return this.lifecycle.retirePackage(id, body.valid_until);
+  retirePackage(@Param('id') id: string, @Body() body: RetirePackageInput) {
+    return this.commands.retirePackage(id, body ?? {});
   }

   @Post('mobile-packages/:id/validate')
+  @HttpCode(200)
   @Resource('inf:mobile-normative-package')
   @Action('validate')
   @Audit({
     action: 'INF_NORMATIVE_PACKAGE_VALIDATE',
     entity: 'inf.normative_mobile_package',
   })
-  validatePackage(
-    @Param('id') id: string,
-    @Body() body: { package_version: string; manifest_hash: string },
-  ) {
-    return this.lifecycle.validatePackage(id, body);
+  validatePackage(@Param('id') id: string, @Body() body: ValidatePackageInput) {
+    return this.commands.validatePackage(id, body);
   }
 }
diff --git a/backend/domains/ops/evidence/src/handwritten/complete-upload.command.spec.ts b/backend/domains/ops/evidence/src/handwritten/complete-upload.command.spec.ts
new file mode 100644
index 0000000..cc94877
--- /dev/null
+++ b/backend/domains/ops/evidence/src/handwritten/complete-upload.command.spec.ts
@@ -0,0 +1,414 @@
+import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
+
+/**
+ * CTG-0003 §4.2 e §10 (R-0008, TASK-0006) — C-0003-06, C-0003-07 e a fração de
+ * `complete-upload` de C-0003-08: `POST
+ * /v1/ops/evidence/{id}/complete-upload` (M11). `handwritten/complete-upload.command.ts`
+ * nasce em TASK-0007. Ids das fixtures: `27-fixtures-teat-evidence.sql`
+ * (`…ef000002` pending_upload + intenção `…ef100001` vencida em
+ * 2026-09-01, `…ef000004` quarantined). Relógio fixo em 2026-09-14 (CTG-0003
+ * §9).
+ *
+ * Nome esperado do export: `CompleteUploadCommand`, construtor `(deps)`,
+ * método `execute`.
+ */
+
+const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
+const ACTOR_ID = '00000000-0000-4000-8000-0000b0000001';
+const EVIDENCE_PENDING = '00000000-0000-7000-8000-0000ef000002';
+const STORAGE_INTENT_EXPIRED = '00000000-0000-7000-8000-0000ef100001';
+const EVIDENCE_QUARANTINED = '00000000-0000-7000-8000-0000ef000004';
+const NOW = '2026-09-14T14:00:00.000Z';
+const HASH_VALUE =
+  'sha256:531986dca23b52cea07f5b3a736b452efea3ff325033daa19fb218741cb4875d';
+
+function repository(rows: Record<string, unknown>[] = []) {
+  const store = [...rows];
+  return {
+    rows: store,
+    find: vi.fn(async (id: string) => store.find((row) => row.id === id)),
+    findOne: vi.fn(async (id: string) => store.find((row) => row.id === id)),
+    update: vi.fn(async (id: string, patch: Record<string, unknown>) => {
+      const row = store.find((entry) => entry.id === id);
+      if (row) Object.assign(row, patch);
+      return row;
+    }),
+    create: vi.fn(async (values: Record<string, unknown>) => {
+      const row = { id: `row-${store.length + 1}`, ...values };
+      store.push(row);
+      return row;
+    }),
+  };
+}
+
+interface Deps {
+  database: { tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> };
+  requestContext: {
+    hasActiveContext(): boolean;
+    snapshot(): { tenantId: string; actorId: string };
+  };
+  repositories: Record<string, ReturnType<typeof repository>>;
+  outbox: { append: ReturnType<typeof vi.fn> };
+  clock: { now(): string };
+}
+
+function deps(overrides: Partial<Deps> = {}): Deps {
+  return {
+    database: overrides.database ?? {
+      async tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> {
+        return work({ query: vi.fn(async () => ({ rows: [] })) });
+      },
+    },
+    requestContext: overrides.requestContext ?? {
+      hasActiveContext: () => true,
+      snapshot: () => ({ tenantId: TENANT_ID, actorId: ACTOR_ID }),
+    },
+    repositories: {
+      evidence: repository([
+        {
+          id: EVIDENCE_PENDING,
+          tenant_id: TENANT_ID,
+          status: 'pending_upload',
+          hash_value: HASH_VALUE,
+        },
+        {
+          id: EVIDENCE_QUARANTINED,
+          tenant_id: TENANT_ID,
+          status: 'quarantined',
+          hash_value:
+            'sha256:a8949cf99ae3fc2328f8acf858aefca10282ab574addc442698fed3e9929cc98',
+        },
+      ]),
+      storageIntents: repository([
+        {
+          id: STORAGE_INTENT_EXPIRED,
+          tenant_id: TENANT_ID,
+          evidence_id: EVIDENCE_PENDING,
+          expires_at: '2026-09-01T00:00:00-04:00',
+          status: 'pending',
+        },
+      ]),
+      evidenceLinks: repository(),
+      custodyEvents: repository(),
+      ...(overrides.repositories ?? {}),
+    },
+    outbox: overrides.outbox ?? {
+      append: vi.fn(async () => ({ id: 'outbox-row-1' })),
+    },
+    clock: overrides.clock ?? { now: () => NOW },
+  };
+}
+
+const importModule = (specifier: string): Promise<unknown> =>
+  import(/* @vite-ignore */ specifier);
+
+async function completeUpload(
+  dependencies: Deps,
+  evidenceId: string,
+  body: Record<string, unknown>,
+): Promise<Record<string, unknown>> {
+  let loaded: Record<string, unknown>;
+  try {
+    loaded = (await importModule('./complete-upload.command.js')) as Record<
+      string,
+      unknown
+    >;
+  } catch (cause) {
+    throw new Error(
+      'ops/evidence/src/handwritten/complete-upload.command.ts ainda não existe (TASK-0007, CTG-0003 §11)',
+      { cause },
+    );
+  }
+  const exported =
+    (loaded.CompleteUploadCommand as unknown) ??
+    Object.values(loaded).find((value) => typeof value === 'function');
+  if (typeof exported !== 'function') {
+    throw new Error(
+      'complete-upload.command.ts não exporta um comando construtível (CTG-0003 §11)',
+    );
+  }
+  const Command = exported as new (
+    dependencies: unknown,
+  ) => Record<string, unknown>;
+  const command = new Command(dependencies);
+  const method = ['execute', 'handle', 'run']
+    .map((name) => command[name])
+    .find((value) => typeof value === 'function');
+  if (typeof method !== 'function') {
+    throw new Error(
+      'complete-upload.command.ts não expõe execute|handle|run (CTG-0003 §4.2)',
+    );
+  }
+  return (await (
+    method as (id: string, value: unknown) => Promise<unknown>
+  ).call(command, evidenceId, body)) as Record<string, unknown>;
+}
+
+beforeEach(() => {
+  vi.useFakeTimers();
+  vi.setSystemTime(new Date(NOW));
+});
+
+afterEach(() => {
+  vi.useRealTimers();
+});
+
+describe('CTG-0003 §4.2 — complete-upload: intenção vencida, hash divergente e quarentena (C-0003-06…08)', () => {
+  it('C-0003-06 — dada a evidência …ef000002 com a intenção …ef100001 expirada quando complete-upload então 410 TEAT.EVIDENCE_INTENT_EXPIRED com { storageIntentId, expiresAt }, relógio fixo em 2026-09-14', async () => {
+    const dependencies = deps();
+    await expect(
+      completeUpload(dependencies, EVIDENCE_PENDING, {
+        storage_intent_id: STORAGE_INTENT_EXPIRED,
+        idempotency_key: 'complete-001',
+        entity_type: 'ait',
+        entity_id: '00000000-0000-7000-8000-0000f0000001',
+        accepted_hash: HASH_VALUE,
+      }),
+    ).rejects.toMatchObject({
+      code: 'TEAT.EVIDENCE_INTENT_EXPIRED',
+      status: 410,
+      context: expect.objectContaining({
+        storageIntentId: STORAGE_INTENT_EXPIRED,
+        expiresAt: expect.any(String),
+      }),
+    });
+  });
+
+  it('C-0003-07 — dado complete-upload com accepted_hash ≠ hash_value então 422 TEAT.EVIDENCE_HASH_MISMATCH com { declaredHash, acceptedHash }', async () => {
+    const dependencies = deps({
+      repositories: {
+        evidence: repository([
+          {
+            id: EVIDENCE_PENDING,
+            tenant_id: TENANT_ID,
+            status: 'pending_upload',
+            hash_value: HASH_VALUE,
+          },
+        ]),
+        storageIntents: repository([
+          {
+            id: STORAGE_INTENT_EXPIRED,
+            tenant_id: TENANT_ID,
+            evidence_id: EVIDENCE_PENDING,
+            expires_at: '2027-01-01T00:00:00-04:00',
+            status: 'pending',
+          },
+        ]),
+        evidenceLinks: repository(),
+        custodyEvents: repository(),
+      },
+    });
+    await expect(
+      completeUpload(dependencies, EVIDENCE_PENDING, {
+        storage_intent_id: STORAGE_INTENT_EXPIRED,
+        idempotency_key: 'complete-002',
+        entity_type: 'ait',
+        entity_id: '00000000-0000-7000-8000-0000f0000001',
+        accepted_hash:
+          'sha256:1111111111111111111111111111111111111111111111111111111111111111',
+      }),
+    ).rejects.toMatchObject({
+      code: 'TEAT.EVIDENCE_HASH_MISMATCH',
+      status: 422,
+      context: expect.objectContaining({
+        declaredHash: HASH_VALUE,
+        acceptedHash: expect.any(String),
+      }),
+    });
+  });
+
+  it('C-0003-08a — dada a evidência …ef000004 (quarantined) quando complete-upload então 409 TEAT.EVIDENCE_QUARANTINED, e esse código precede a guarda de estado', async () => {
+    const dependencies = deps();
+    await expect(
+      completeUpload(dependencies, EVIDENCE_QUARANTINED, {
+        storage_intent_id: STORAGE_INTENT_EXPIRED,
+        idempotency_key: 'complete-003',
+        entity_type: 'ait',
+        entity_id: '00000000-0000-7000-8000-0000f0000001',
+        accepted_hash:
+          'sha256:a8949cf99ae3fc2328f8acf858aefca10282ab574addc442698fed3e9929cc98',
+      }),
+    ).rejects.toMatchObject({
+      code: 'TEAT.EVIDENCE_QUARANTINED',
+      status: 409,
+    });
+  });
+});
+
+/**
+ * CTG-0003 §14 item 1 (adenda do maestro, 2026-09-16, delivery-review ciclo 1
+ * achado §14.1) — TASK-0006 iteração 3: `complete-upload` valida o DTO
+ * inteiro (não só `accepted_hash`/`storage_intent_id`), detecta
+ * `entity_type`/`entity_id` divergentes da intenção e `idempotency_key`
+ * fora da intenção gravada.
+ *
+ * Escrito em paralelo à iteração 3 do Engineer: no momento em que este
+ * arquivo foi finalizado, `complete-upload.command.ts` já traz `parse()`
+ * (400 `TEAT.VALIDATION_FAILED` para forma do DTO) e `assertMatchesIntent()`
+ * (409 `TEAT.EVIDENCE_ENTITY_NOT_APPLIED`/`TEAT.IDEMPOTENCY_REPLAY`), e
+ * `evidence-runtime.ts` já distingue `validationFailed(fields, 400)` de forma
+ * de `validationFailed(fields)` (422, default) de regra de negócio —
+ * fechando a divergência de status do achado. O par `entity_type`/
+ * `entity_id` declarado na intenção é gravado por `initiate-upload` em
+ * `evidence.metadata_json.upload_entity_type`/`upload_entity_id` (mesma
+ * decisão de OD-T55); os mocks abaixo replicam esse formato. Mantido como
+ * teste de regressão desta tarefa (TASK-0006 iteração 3), não como
+ * suposição — a implementação real foi lida antes de fechar os casos.
+ */
+describe('CTG-0003 §14.1 — complete-upload: DTO completo, divergência de entidade e replay de chave', () => {
+  const VALID_ENTITY_ID = '00000000-0000-7000-8000-0000f0000001';
+  const OTHER_ENTITY_ID = '00000000-0000-7000-8000-0000f0000099';
+
+  function fullBody(overrides: Record<string, unknown> = {}) {
+    return {
+      storage_intent_id: STORAGE_INTENT_EXPIRED,
+      idempotency_key: 'intent-002',
+      entity_type: 'ait',
+      entity_id: VALID_ENTITY_ID,
+      accepted_hash: HASH_VALUE,
+      ...overrides,
+    };
+  }
+
+  function depsWithFutureIntent(): Deps {
+    return deps({
+      repositories: {
+        evidence: repository([
+          {
+            id: EVIDENCE_PENDING,
+            tenant_id: TENANT_ID,
+            status: 'pending_upload',
+            hash_value: HASH_VALUE,
+            metadata_json: {
+              upload_entity_type: 'ait',
+              upload_entity_id: VALID_ENTITY_ID,
+            },
+          },
+        ]),
+        storageIntents: repository([
+          {
+            id: STORAGE_INTENT_EXPIRED,
+            tenant_id: TENANT_ID,
+            evidence_id: EVIDENCE_PENDING,
+            // idempotency_key gravado na intenção (§4.1): a mesma coluna que
+            // `ux_storage_intent_tenant_id_idempotency_key` já indexa.
+            idempotency_key: 'intent-002',
+            expires_at: '2027-01-01T00:00:00-04:00',
+            status: 'pending',
+          },
+        ]),
+        evidenceLinks: repository(),
+        custodyEvents: repository(),
+      },
+    });
+  }
+
+  function assertNothingChanged(dependencies: Deps): void {
+    expect(
+      dependencies.repositories.evidence.rows.find(
+        (row) => row.id === EVIDENCE_PENDING,
+      )?.status,
+    ).toBe('pending_upload');
+    expect(dependencies.repositories.custodyEvents.rows).toEqual([]);
+    expect(dependencies.repositories.evidenceLinks.rows).toEqual([]);
+  }
+
+  it('dado idempotency_key ausente então 400 TEAT.VALIDATION_FAILED com fields contendo { path: "idempotency_key", rule: "required" }, e nada persistido', async () => {
+    const dependencies = depsWithFutureIntent();
+    const body = fullBody();
+    delete (body as Record<string, unknown>).idempotency_key;
+    await expect(
+      completeUpload(dependencies, EVIDENCE_PENDING, body),
+    ).rejects.toMatchObject({
+      code: 'TEAT.VALIDATION_FAILED',
+      status: 400,
+      context: expect.objectContaining({
+        fields: expect.arrayContaining([
+          expect.objectContaining({
+            path: 'idempotency_key',
+            rule: 'required',
+          }),
+        ]),
+      }),
+    });
+    assertNothingChanged(dependencies);
+  });
+
+  it('dado entity_type ≠ "ait" então 400 TEAT.VALIDATION_FAILED com fields contendo { path: "entity_type", rule: "enum" }, e nada persistido', async () => {
+    const dependencies = depsWithFutureIntent();
+    await expect(
+      completeUpload(
+        dependencies,
+        EVIDENCE_PENDING,
+        fullBody({ entity_type: 'boat' }),
+      ),
+    ).rejects.toMatchObject({
+      code: 'TEAT.VALIDATION_FAILED',
+      status: 400,
+      context: expect.objectContaining({
+        fields: expect.arrayContaining([
+          expect.objectContaining({ path: 'entity_type', rule: 'enum' }),
+        ]),
+      }),
+    });
+    assertNothingChanged(dependencies);
+  });
+
+  it('dado entity_id inválido (não uuid) então 400 TEAT.VALIDATION_FAILED com fields contendo { path: "entity_id", rule: "uuid" }, e nada persistido', async () => {
+    const dependencies = depsWithFutureIntent();
+    await expect(
+      completeUpload(
+        dependencies,
+        EVIDENCE_PENDING,
+        fullBody({ entity_id: 'not-a-uuid' }),
+      ),
+    ).rejects.toMatchObject({
+      code: 'TEAT.VALIDATION_FAILED',
+      status: 400,
+      context: expect.objectContaining({
+        fields: expect.arrayContaining([
+          expect.objectContaining({ path: 'entity_id', rule: 'uuid' }),
+        ]),
+      }),
+    });
+    assertNothingChanged(dependencies);
+  });
+
+  it('dado entity_type/entity_id divergentes da intenção gravada então 409 TEAT.EVIDENCE_ENTITY_NOT_APPLIED com { evidenceId, entityType, entityId }, e nada persistido', async () => {
+    const dependencies = depsWithFutureIntent();
+    await expect(
+      completeUpload(
+        dependencies,
+        EVIDENCE_PENDING,
+        fullBody({ entity_id: OTHER_ENTITY_ID }),
+      ),
+    ).rejects.toMatchObject({
+      code: 'TEAT.EVIDENCE_ENTITY_NOT_APPLIED',
+      status: 409,
+      context: expect.objectContaining({
+        evidenceId: EVIDENCE_PENDING,
+        entityType: 'ait',
+        entityId: OTHER_ENTITY_ID,
+      }),
+    });
+    assertNothingChanged(dependencies);
+  });
+
+  it('dado idempotency_key ≠ da intenção gravada então 409 TEAT.IDEMPOTENCY_REPLAY com { idempotencyKey }, e nada persistido', async () => {
+    const dependencies = depsWithFutureIntent();
+    await expect(
+      completeUpload(
+        dependencies,
+        EVIDENCE_PENDING,
+        fullBody({ idempotency_key: 'outra-chave-diferente' }),
+      ),
+    ).rejects.toMatchObject({
+      code: 'TEAT.IDEMPOTENCY_REPLAY',
+      status: 409,
+      context: expect.objectContaining({
+        idempotencyKey: 'outra-chave-diferente',
+      }),
+    });
+    assertNothingChanged(dependencies);
+  });
+});
diff --git a/backend/domains/ops/evidence/src/handwritten/complete-upload.command.ts b/backend/domains/ops/evidence/src/handwritten/complete-upload.command.ts
new file mode 100644
index 0000000..0a28a0d
--- /dev/null
+++ b/backend/domains/ops/evidence/src/handwritten/complete-upload.command.ts
@@ -0,0 +1,253 @@
+// CTG-0003 §4.2 (M11, R-0008, TASK-0007) — `POST /v1/ops/evidence/{id}/complete-upload`.
+//
+// Uma transação: `evidence` passa a `uploaded`, a intenção fecha, a cadeia de
+// custódia ganha `uploaded` e o vínculo com a entidade nasce. Precedência das
+// guardas: forma do DTO (400, §14.1) → quarentena → coerência com a intenção
+// gravada (§14.1) → intenção vencida → hash → estado (§4.2, C-0003-06…08).
+import { DetranError } from '@detran/shared';
+
+import {
+  appendEvent,
+  findRow,
+  insertRow,
+  inTenantTransaction,
+  isoOf,
+  patchRow,
+  quarantined,
+  scopeOf,
+  stateTransitionFailed,
+  stringOf,
+  tenantMismatch,
+  validationFailed,
+  type EvidenceDeps,
+} from './evidence-runtime.js';
+import { evidenceCapturedEvent, evidenceLinkedEvent } from './events.js';
+
+export interface CompleteUploadInput {
+  storage_intent_id: string;
+  idempotency_key: string;
+  entity_type: string;
+  entity_id: string;
+  accepted_hash: string;
+}
+
+const UUID_PATTERN =
+  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
+const HASH_PATTERN = /^sha256:[a-f0-9]{64}$/i;
+/** `entity_type` da §4.2: a única entidade aplicável nesta rodada. */
+const SUPPORTED_ENTITY_TYPE = 'ait';
+
+export interface CompleteUploadResult {
+  id: string;
+  status: 'uploaded';
+  storage_uri: string;
+  link_id: string;
+  custody_event_id: string;
+}
+
+export class CompleteUploadCommand {
+  constructor(private readonly deps: EvidenceDeps) {}
+
+  async execute(
+    evidenceId: string,
+    input: CompleteUploadInput,
+  ): Promise<CompleteUploadResult> {
+    const scope = scopeOf(this.deps);
+    // §14.1: o DTO inteiro é validado **antes** da transação.
+    const parsed = parse(input);
+    const { acceptedHash, storageIntentId } = parsed;
+
+    return inTenantTransaction(this.deps, async (tx) => {
+      const evidence = await findRow(this.deps, tx, 'evidence', evidenceId);
+      if (!evidence) throw tenantMismatch({ evidenceId });
+      if (evidence.status === 'quarantined') throw quarantined(evidenceId);
+
+      const intent = await findRow(
+        this.deps,
+        tx,
+        'storageIntents',
+        storageIntentId,
+      );
+      if (!intent) throw tenantMismatch({ storageIntentId });
+      assertMatchesIntent(evidenceId, evidence, intent, parsed);
+
+      const expiresAt = isoOf(intent.expires_at);
+      if (new Date(expiresAt).getTime() < new Date(scope.occurredAt).getTime())
+        throw new DetranError('TEAT.EVIDENCE_INTENT_EXPIRED', {
+          status: 410,
+          context: { storageIntentId, expiresAt },
+          message: 'Intenção de upload vencida; renove mantendo o mesmo id.',
+        });
+
+      const declaredHash = stringOf(evidence.hash_value);
+      if (declaredHash !== acceptedHash)
+        throw new DetranError('TEAT.EVIDENCE_HASH_MISMATCH', {
+          status: 422,
+          context: { declaredHash, acceptedHash },
+          message: 'O hash aceito não confere com o declarado na intenção.',
+        });
+
+      if (evidence.status !== 'pending_upload') throw stateTransitionFailed();
+
+      const objectKey = stringOf(intent.object_key || evidence.storage_uri);
+      await patchRow(this.deps, tx, 'evidence', evidenceId, {
+        status: 'uploaded',
+        storage_uri: objectKey,
+      });
+      await patchRow(this.deps, tx, 'storageIntents', storageIntentId, {
+        status: 'completed',
+        accepted_hash: acceptedHash,
+      });
+
+      const custodyEvent = await insertRow(this.deps, tx, 'custodyEvents', {
+        evidence_id: evidenceId,
+        event_type: 'uploaded',
+        event_at: scope.occurredAt,
+        user_ref: scope.actorId,
+        system_name: 'detran-backend',
+        details_json: { storageIntentId, acceptedHash },
+      });
+
+      const role = stringOf(evidence.evidence_type);
+      const link = await insertRow(this.deps, tx, 'evidenceLinks', {
+        evidence_id: evidenceId,
+        entity_type: parsed.entityType,
+        entity_id: parsed.entityId,
+        role,
+        mandatory: false,
+      });
+
+      await appendEvent(
+        this.deps,
+        tx,
+        evidenceCapturedEvent(scope, {
+          evidenceId,
+          entityType: parsed.entityType,
+          entityId: parsed.entityId,
+          evidenceType: role,
+          hashValue: declaredHash,
+          capturedAt: evidence.captured_at ? isoOf(evidence.captured_at) : null,
+          uploadedAt: scope.occurredAt,
+        }),
+      );
+      await appendEvent(
+        this.deps,
+        tx,
+        evidenceLinkedEvent(
+          scope,
+          {
+            evidenceId,
+            linkId: stringOf(link.id),
+            entityType: parsed.entityType,
+            entityId: parsed.entityId,
+            role,
+          },
+          // Segundo fato do mesmo agregado nesta transação: versão 2, senão o
+          // envelope colide com `EVIDENCIA_CAPTURADA` na chave da outbox.
+          2,
+        ),
+      );
+
+      return {
+        id: evidenceId,
+        status: 'uploaded',
+        storage_uri: objectKey,
+        link_id: stringOf(link.id),
+        custody_event_id: stringOf(custodyEvent.id),
+      };
+    });
+  }
+}
+
+interface ParsedCompleteUpload {
+  storageIntentId: string;
+  idempotencyKey: string;
+  entityType: string;
+  entityId: string;
+  acceptedHash: string;
+}
+
+/** §14.1 — forma do DTO; qualquer desvio é 400 `TEAT.VALIDATION_FAILED`. */
+function parse(input: CompleteUploadInput): ParsedCompleteUpload {
+  const storageIntentId = stringOf(input?.storage_intent_id ?? '').trim();
+  const idempotencyKey = stringOf(input?.idempotency_key ?? '').trim();
+  const entityType = stringOf(input?.entity_type ?? '').trim();
+  const entityId = stringOf(input?.entity_id ?? '').trim();
+  const acceptedHash = stringOf(input?.accepted_hash ?? '').trim();
+
+  const fields: { path: string; rule: string }[] = [];
+  if (!storageIntentId)
+    fields.push({ path: 'storage_intent_id', rule: 'required' });
+  else if (!UUID_PATTERN.test(storageIntentId))
+    fields.push({ path: 'storage_intent_id', rule: 'uuid' });
+  if (!idempotencyKey || idempotencyKey.length > 160)
+    fields.push({ path: 'idempotency_key', rule: 'required' });
+  if (!entityType) fields.push({ path: 'entity_type', rule: 'required' });
+  else if (entityType !== SUPPORTED_ENTITY_TYPE)
+    fields.push({ path: 'entity_type', rule: 'enum' });
+  if (!entityId) fields.push({ path: 'entity_id', rule: 'required' });
+  else if (!UUID_PATTERN.test(entityId))
+    fields.push({ path: 'entity_id', rule: 'uuid' });
+  if (!acceptedHash) fields.push({ path: 'accepted_hash', rule: 'required' });
+  else if (!HASH_PATTERN.test(acceptedHash))
+    fields.push({ path: 'accepted_hash', rule: 'pattern' });
+
+  if (fields.length > 0) throw validationFailed(fields, 400);
+  return {
+    storageIntentId,
+    idempotencyKey,
+    entityType,
+    entityId,
+    acceptedHash,
+  };
+}
+
+/**
+ * §14.1 — a conclusão tem de ser da mesma intenção que a abriu.
+ *
+ * A DDL 17 não tem coluna de entidade em `ops.storage_intent` nem em
+ * `ops.evidence_evidence`: o par `entity_type`/`entity_id` declarado na
+ * intenção é gravado por `initiate-upload` em `evidence.metadata_json` (mesma
+ * coluna de `filename`/`upload_request_hash`, OD-T55 ratificada na adenda
+ * §13; nomes conforme a proposta do Inspector). Quando a linha não registra o
+ * par — evidência semeada por fixture, anterior a esta regra — não há termo
+ * de comparação e a guarda não corre.
+ */
+function assertMatchesIntent(
+  evidenceId: string,
+  evidence: Record<string, unknown>,
+  intent: Record<string, unknown>,
+  parsed: ParsedCompleteUpload,
+): void {
+  const metadata =
+    evidence.metadata_json && typeof evidence.metadata_json === 'object'
+      ? (evidence.metadata_json as Record<string, unknown>)
+      : {};
+  const recordedEntityType = stringOf(
+    metadata.entity_type ?? metadata.upload_entity_type ?? '',
+  );
+  const recordedEntityId = stringOf(
+    metadata.entity_id ?? metadata.upload_entity_id ?? '',
+  );
+  if (
+    (recordedEntityType && recordedEntityType !== parsed.entityType) ||
+    (recordedEntityId && recordedEntityId !== parsed.entityId)
+  )
+    throw new DetranError('TEAT.EVIDENCE_ENTITY_NOT_APPLIED', {
+      status: 409,
+      context: {
+        evidenceId,
+        entityType: parsed.entityType,
+        entityId: parsed.entityId,
+      },
+      message: 'A entidade informada não é a da intenção de upload.',
+    });
+
+  const recordedKey = stringOf(intent.idempotency_key ?? '');
+  if (recordedKey && recordedKey !== parsed.idempotencyKey)
+    throw new DetranError('TEAT.IDEMPOTENCY_REPLAY', {
+      status: 409,
+      context: { idempotencyKey: parsed.idempotencyKey },
+      message: 'Chave de idempotência diferente da intenção de upload.',
+    });
+}
diff --git a/backend/domains/ops/evidence/src/handwritten/evidence-runtime.ts b/backend/domains/ops/evidence/src/handwritten/evidence-runtime.ts
new file mode 100644
index 0000000..efd1922
--- /dev/null
+++ b/backend/domains/ops/evidence/src/handwritten/evidence-runtime.ts
@@ -0,0 +1,381 @@
+// CTG-0003 §4 (M11, R-0008, TASK-0007) — dependências e utilidades comuns aos
+// comandos manuscritos de evidência e custódia.
+//
+// Os comandos nunca escrevem SQL de tabela fora da transação do comando: a
+// porta `EvidenceRowStore` é a superfície mínima por tabela (a mesma de
+// `OpsTenantRepository` e a que os harnesses de teste implementam, CTG-0002
+// §4 / `@detran/ops-core`). Quando a porta não expõe a operação — é o caso do
+// wiring de produção, que injeta só leitura — a escrita acontece por SQL
+// parametrizado **na transação em curso**, que é o que o invariante "mesma
+// transação" da §4.2 exige.
+import { randomUUID } from 'node:crypto';
+
+import {
+  asQueryable,
+  type OpsClock,
+  type SqlQueryable,
+} from '@detran/ops-core';
+import type { AppliedEntityPort, EvidenceStoragePort } from '@detran/ops-core';
+import {
+  DetranError,
+  withTenantContext,
+  type TeatEventOutbox,
+} from '@detran/shared';
+import type { RequestContext } from '@stynx-nyx/core';
+import type { Database, Transaction } from '@stynx-nyx/data';
+
+export type EvidenceRow = Record<string, unknown>;
+
+/**
+ * Vocabulário de modelagem de `evidence_custody_event.event_type` (§11.8 —
+ * onze tokens, sem check na coluna) e rol fechado do art. 13 para
+ * `evidence_access_request.requester_role` (RN-TEAT-142, check
+ * `ck_ops_evidence_access_requester_role`). Moram aqui, e não no comando que
+ * os consome, porque `handwritten/events.ts` também precisa deles para os
+ * esquemas zod — e o comando importa `events.ts`.
+ */
+export const CUSTODY_EVENT_TYPES = [
+  'uploaded',
+  'validated',
+  'rejected',
+  'linked',
+  'packaged',
+  'access_approved',
+  'access_denied',
+  'access_delivered',
+  'purged_unverified',
+  'quarantined',
+  'restored',
+] as const;
+
+export type CustodyEventType = (typeof CUSTODY_EVENT_TYPES)[number];
+
+export function isCustodyEventType(value: string): value is CustodyEventType {
+  return (CUSTODY_EVENT_TYPES as readonly string[]).includes(value);
+}
+
+export const EVIDENCE_ACCESS_REQUESTER_ROLES = [
+  'magistrado',
+  'ministerio-publico',
+  'defensoria-publica',
+  'autoridade-policial',
+  'autoridade-administrativa',
+] as const;
+
+export type EvidenceAccessRequesterRole =
+  (typeof EVIDENCE_ACCESS_REQUESTER_ROLES)[number];
+
+export function isEvidenceAccessRequesterRole(
+  value: string,
+): value is EvidenceAccessRequesterRole {
+  return (EVIDENCE_ACCESS_REQUESTER_ROLES as readonly string[]).includes(value);
+}
+
+export function requesterNotInRol(requesterRole: string): DetranError {
+  return new DetranError('TEAT.EVIDENCE_ACCESS_REQUESTER_NOT_IN_ROL', {
+    status: 422,
+    context: { requesterRole, allowed: [...EVIDENCE_ACCESS_REQUESTER_ROLES] },
+    message: 'Requerente fora do rol do art. 13 da Portaria.',
+  });
+}
+
+/** Superfície mínima de uma tabela de `ops` usada pelos comandos. */
+export interface EvidenceRowStore {
+  list?(): Promise<EvidenceRow[]>;
+  find?(id: string): Promise<EvidenceRow | undefined>;
+  findOne?(id: string): Promise<EvidenceRow | undefined>;
+  create?(values: EvidenceRow): Promise<EvidenceRow>;
+  update?(
+    id: string,
+    patch: EvidenceRow,
+    tx?: unknown,
+  ): Promise<EvidenceRow | undefined>;
+}
+
+export interface EvidenceDeps {
+  database: Pick<Database, 'tx'>;
+  requestContext: Pick<RequestContext, 'hasActiveContext' | 'snapshot'>;
+  repositories: Record<string, EvidenceRowStore | undefined>;
+  appliedEntityPorts?: readonly AppliedEntityPort[];
+  evidenceStorage?: EvidenceStoragePort;
+  outbox?: TeatEventOutbox;
+  clock: OpsClock;
+}
+
+export interface EvidenceScope {
+  tenantId: string;
+  actorId: string;
+  occurredAt: string;
+}
+
+/** Tabelas tocadas pelos comandos desta tarefa (CTG-0003 §4). */
+export const EVIDENCE_TABLES = {
+  evidence: 'ops.evidence_evidence',
+  storageIntents: 'ops.storage_intent',
+  evidenceLinks: 'ops.evidence_link',
+  custodyEvents: 'ops.evidence_custody_event',
+  probativePackages: 'ops.evidence_probative_package',
+  probativePackageItems: 'ops.evidence_probative_package_item',
+  accessRequests: 'ops.evidence_access_request',
+} as const;
+
+export type EvidenceTableName = keyof typeof EVIDENCE_TABLES;
+
+export function tenantScope(deps: EvidenceDeps): {
+  tenantId: string;
+  actorId: string;
+} {
+  if (!deps.requestContext.hasActiveContext())
+    throw new Error('Um comando de evidência exige contexto de requisição');
+  const snapshot = deps.requestContext.snapshot();
+  const tenantId = snapshot.tenantId ?? '';
+  const actorId = snapshot.actorId ?? '';
+  if (!tenantId || !actorId)
+    throw new Error('Um comando de evidência exige tenantId e actorId');
+  return { tenantId, actorId };
+}
+
+export function scopeOf(deps: EvidenceDeps): EvidenceScope {
+  const { tenantId, actorId } = tenantScope(deps);
+  return { tenantId, actorId, occurredAt: deps.clock.now() };
+}
+
+/** `withTenantContext` (role `app`, RLS na volta) — nunca conexão de owner. */
+export function inTenantTransaction<T>(
+  deps: EvidenceDeps,
+  work: (tx: Transaction) => Promise<T>,
+): Promise<T> {
+  return withTenantContext(deps.database, deps.requestContext, work);
+}
+
+function storeOf(
+  deps: EvidenceDeps,
+  table: EvidenceTableName,
+): EvidenceRowStore | undefined {
+  return deps.repositories[table];
+}
+
+function sqlOf(tx: unknown): SqlQueryable | undefined {
+  return asQueryable(tx as Transaction);
+}
+
+function assertColumns(values: EvidenceRow): string[] {
+  const columns = Object.keys(values);
+  if (columns.some((column) => !/^[a-z_]+$/.test(column)))
+    throw new Error('Coluna inválida em escrita de ops');
+  return columns;
+}
+
+export async function findRow(
+  deps: EvidenceDeps,
+  tx: unknown,
+  table: EvidenceTableName,
+  id: string,
+): Promise<EvidenceRow | undefined> {
+  const store = storeOf(deps, table);
+  if (typeof store?.find === 'function') return store.find(id);
+  if (typeof store?.findOne === 'function') return store.findOne(id);
+  const sql = sqlOf(tx);
+  if (!sql) return undefined;
+  const result = await sql.query(
+    `select * from ${EVIDENCE_TABLES[table]} where id = $1`,
+    [id],
+  );
+  return result.rows[0];
+}
+
+export async function listRows(
+  deps: EvidenceDeps,
+  tx: unknown,
+  table: EvidenceTableName,
+): Promise<EvidenceRow[]> {
+  const store = storeOf(deps, table);
+  if (typeof store?.list === 'function') return store.list();
+  const sql = sqlOf(tx);
+  if (!sql) return [];
+  const result = await sql.query(
+    `select * from ${EVIDENCE_TABLES[table]} order by created_at desc`,
+  );
+  return result.rows;
+}
+
+/**
+ * Leitura por coluna: a porta de repositório só sabe `list`/`find`, então o
+ * filtro acontece em memória quando ela existe e vira `where` parametrizado
+ * quando a escrita é da transação (wiring de produção).
+ */
+export async function findRowsWhere(
+  deps: EvidenceDeps,
+  tx: unknown,
+  table: EvidenceTableName,
+  column: string,
+  value: unknown,
+): Promise<EvidenceRow[]> {
+  if (!/^[a-z_]+$/.test(column)) throw new Error('Coluna inválida em filtro');
+  const store = storeOf(deps, table);
+  if (typeof store?.list === 'function')
+    return (await store.list()).filter((row) => row[column] === value);
+  const sql = sqlOf(tx);
+  if (!sql) return [];
+  const result = await sql.query(
+    `select * from ${EVIDENCE_TABLES[table]} where ${column} = $1`,
+    [value],
+  );
+  return result.rows;
+}
+
+export async function insertRow(
+  deps: EvidenceDeps,
+  tx: unknown,
+  table: EvidenceTableName,
+  values: EvidenceRow,
+): Promise<EvidenceRow> {
+  const store = storeOf(deps, table);
+  if (typeof store?.create === 'function') return store.create(values);
+  const sql = sqlOf(tx);
+  if (!sql)
+    throw new Error(`Sem porta nem transação para escrever em ${table}`);
+  const columns = assertColumns(values);
+  const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
+  const result = await sql.query(
+    `insert into ${EVIDENCE_TABLES[table]} (${columns.join(', ')})
+     values (${placeholders}) returning *`,
+    columns.map((column) => normalize(values[column])),
+  );
+  return (result.rows[0] ?? values) as EvidenceRow;
+}
+
+export async function patchRow(
+  deps: EvidenceDeps,
+  tx: unknown,
+  table: EvidenceTableName,
+  id: string,
+  patch: EvidenceRow,
+): Promise<EvidenceRow | undefined> {
+  const store = storeOf(deps, table);
+  if (typeof store?.update === 'function') return store.update(id, patch, tx);
+  const sql = sqlOf(tx);
+  if (!sql) throw new Error(`Sem porta nem transação para atualizar ${table}`);
+  const columns = assertColumns(patch);
+  const assignments = columns
+    .map((column, index) => `${column} = $${index + 2}`)
+    .join(', ');
+  const result = await sql.query(
+    `update ${EVIDENCE_TABLES[table]}
+        set ${assignments}, updated_at = now()
+      where id = $1 returning *`,
+    [id, ...columns.map((column) => normalize(patch[column]))],
+  );
+  return result.rows[0];
+}
+
+/** `jsonb` recebe JSON textual; os demais valores vão como estão. */
+function normalize(value: unknown): unknown {
+  if (value === null || value === undefined) return null;
+  if (typeof value === 'object' && !(value instanceof Date))
+    return JSON.stringify(value);
+  return value;
+}
+
+export function newId(): string {
+  return randomUUID();
+}
+
+export function stringOf(value: unknown): string {
+  return typeof value === 'string' ? value : String(value ?? '');
+}
+
+export function isoOf(value: unknown): string {
+  if (value instanceof Date) return value.toISOString();
+  return stringOf(value);
+}
+
+export function objectKeyOf(tenantId: string, evidenceId: string): string {
+  return `evidence/${tenantId}/${evidenceId}`;
+}
+
+/** CTG-0003 §13 item 5 (OD-T29): estado inválido de evidência é 422. */
+export function stateTransitionFailed(): DetranError {
+  return validationFailed([{ path: 'status', rule: 'transition' }]);
+}
+
+/**
+ * §14.1: forma de DTO sai como **400**; regra de domínio violada (guarda de
+ * estado, OD-T29) continua **422**.
+ */
+export function validationFailed(
+  fields: readonly { path: string; rule: string }[],
+  status: 400 | 422 = 422,
+): DetranError {
+  return new DetranError('TEAT.VALIDATION_FAILED', {
+    status,
+    context: { fields: [...fields] },
+    message: 'Requisição inválida para a regra do comando.',
+  });
+}
+
+export function tenantMismatch(context: Record<string, unknown>): DetranError {
+  return new DetranError('TEAT.TENANT_MISMATCH', {
+    status: 404,
+    context,
+    message: 'Recurso inexistente no tenant do contexto.',
+  });
+}
+
+export function quarantined(evidenceId: string): DetranError {
+  return new DetranError('TEAT.EVIDENCE_QUARANTINED', {
+    status: 409,
+    context: { evidenceId },
+    message: 'Evidência em quarentena.',
+  });
+}
+
+/**
+ * A porta responde "a entidade já foi aplicada no servidor?" (CTG-0002 §4.8).
+ * Sem porta para o tipo, a resposta é "não aplicada": nunca se presume o
+ * contrário.
+ */
+export async function assertEntityApplied(
+  deps: EvidenceDeps,
+  tx: Transaction,
+  entityType: string,
+  entityId: string,
+): Promise<void> {
+  const port = deps.appliedEntityPorts?.find(
+    (candidate) => candidate.entityType === entityType,
+  );
+  const applied = port ? await port.isApplied(entityId, tx) : false;
+  if (applied) return;
+  throw new DetranError('TEAT.EVIDENCE_ENTITY_NOT_APPLIED', {
+    status: 409,
+    context: { entityType, entityId },
+    message: 'Entidade ainda não aplicada no servidor.',
+  });
+}
+
+/**
+ * Ordem do próximo fato de custódia do agregado — a versão do envelope
+ * (`outboxIdempotencyKey`, CTG-0001 §2). Contada antes da escrita do evento.
+ */
+export async function nextCustodyVersion(
+  deps: EvidenceDeps,
+  tx: unknown,
+  evidenceId: string,
+): Promise<number> {
+  const existing = await findRowsWhere(
+    deps,
+    tx,
+    'custodyEvents',
+    'evidence_id',
+    evidenceId,
+  );
+  return existing.length + 1;
+}
+
+export async function appendEvent(
+  deps: EvidenceDeps,
+  tx: Transaction,
+  envelope: Parameters<TeatEventOutbox['append']>[1],
+): Promise<void> {
+  await deps.outbox?.append(tx, envelope);
+}
diff --git a/backend/domains/ops/evidence/src/handwritten/initiate-upload.command.ts b/backend/domains/ops/evidence/src/handwritten/initiate-upload.command.ts
new file mode 100644
index 0000000..df6cadb
--- /dev/null
+++ b/backend/domains/ops/evidence/src/handwritten/initiate-upload.command.ts
@@ -0,0 +1,312 @@
+// CTG-0003 §4.1 (M11, R-0008, TASK-0007) — `POST /v1/ops/evidence/upload-intents`.
+//
+// A intenção é idempotente por `idempotency_key` (índice único
+// `ux_storage_intent_tenant_id_idempotency_key`): a repetição com o mesmo
+// corpo devolve a **mesma** resposta; com corpo diferente, 409
+// `TEAT.IDEMPOTENCY_REPLAY`. A expiração vem sempre da porta
+// `EvidenceStoragePort`, nunca de constante do domínio (M11).
+import { DetranError } from '@detran/shared';
+
+import {
+  assertEntityApplied,
+  findRow,
+  findRowsWhere,
+  insertRow,
+  inTenantTransaction,
+  isoOf,
+  newId,
+  objectKeyOf,
+  stringOf,
+  tenantScope,
+  validationFailed,
+  type EvidenceDeps,
+  type EvidenceRow,
+} from './evidence-runtime.js';
+import { sha256Hex, stableJson } from './manifest.js';
+
+/** `mime_type` aceito pela coleção `evidence` do substrato de storage. */
+const ALLOWED_MIME_TYPES = [
+  'image/jpeg',
+  'image/png',
+  'application/pdf',
+  'video/mp4',
+] as const;
+
+const MAX_SIZE_BYTES = 52_428_800;
+/** §4.1; OD-T53 (adenda §13): o digest tem 64 hex, sem exceção. */
+const HASH_PATTERN = /^sha256:[a-f0-9]{64}$/i;
+const UUID_PATTERN =
+  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
+
+export interface InitiateUploadInput {
+  traffic_agency_id: string;
+  local_evidence_id: string;
+  idempotency_key: string;
+  entity_type: string;
+  entity_id: string;
+  evidence_type: string;
+  origin: string;
+  mime_type: string;
+  size_bytes: number;
+  hash_algorithm: string;
+  hash_value: string;
+  filename: string;
+  captured_by_user_ref?: string;
+  agent_id?: string;
+  device_id?: string;
+  captured_at?: string;
+  location_json?: Record<string, unknown>;
+  metadata_json?: Record<string, unknown>;
+}
+
+export interface InitiateUploadResult {
+  storage_intent_id: string;
+  upload_url: string;
+  expires_at: string;
+  evidence_id: string;
+}
+
+interface ParsedInput extends InitiateUploadInput {
+  requestHash: string;
+}
+
+export class InitiateUploadCommand {
+  constructor(private readonly deps: EvidenceDeps) {}
+
+  async execute(input: InitiateUploadInput): Promise<InitiateUploadResult> {
+    const parsed = parse(input);
+    const { tenantId, actorId } = tenantScope(this.deps);
+
+    return inTenantTransaction(this.deps, async (tx) => {
+      const replay = await this.findByIdempotencyKey(
+        tx,
+        parsed.idempotency_key,
+      );
+      if (replay) return this.replayOf(tx, replay, parsed);
+
+      await assertEntityApplied(
+        this.deps,
+        tx,
+        parsed.entity_type,
+        parsed.entity_id,
+      );
+      await this.assertHashIsFree(tx, parsed.hash_value);
+
+      const evidenceId = newId();
+      const objectKey = objectKeyOf(tenantId, evidenceId);
+      const presigned = await this.presign(parsed, objectKey);
+
+      await insertRow(this.deps, tx, 'evidence', {
+        id: evidenceId,
+        traffic_agency_id: parsed.traffic_agency_id,
+        evidence_type: parsed.evidence_type,
+        origin: parsed.origin,
+        // §13 item 3 (OD-T32): a coluna é `not null`; a chave já decidida é a
+        // do objeto, e `status='pending_upload'` é quem diz que nada chegou.
+        storage_uri: objectKey,
+        mime_type: parsed.mime_type,
+        size_bytes: parsed.size_bytes,
+        hash_algorithm: parsed.hash_algorithm,
+        hash_value: parsed.hash_value,
+        captured_by_user_ref: parsed.captured_by_user_ref ?? actorId,
+        agent_id: parsed.agent_id ?? null,
+        device_id: parsed.device_id ?? null,
+        captured_at: parsed.captured_at ?? this.deps.clock.now(),
+        location_json: parsed.location_json ?? null,
+        metadata_json: metadataOf(parsed),
+        status: 'pending_upload',
+      });
+
+      const intent = await insertRow(this.deps, tx, 'storageIntents', {
+        evidence_id: evidenceId,
+        idempotency_key: parsed.idempotency_key,
+        local_evidence_id: parsed.local_evidence_id,
+        object_key: objectKey,
+        expires_at: presigned.expiresAt,
+        status: 'pending',
+      });
+
+      return {
+        storage_intent_id: stringOf(intent.id),
+        upload_url: presigned.uploadUrl,
+        expires_at: presigned.expiresAt,
+        evidence_id: evidenceId,
+      };
+    });
+  }
+
+  private presign(
+    parsed: ParsedInput,
+    objectKey: string,
+  ): Promise<{ uploadUrl: string; expiresAt: string }> {
+    const storage = this.deps.evidenceStorage;
+    if (!storage)
+      throw new Error('EvidenceStoragePort não está ligada ao comando');
+    return storage.presignUpload({
+      objectKey,
+      mimeType: parsed.mime_type,
+      sizeBytes: parsed.size_bytes,
+      hashValue: parsed.hash_value,
+    });
+  }
+
+  private async findByIdempotencyKey(
+    tx: unknown,
+    idempotencyKey: string,
+  ): Promise<EvidenceRow | undefined> {
+    const intents = await findRowsWhere(
+      this.deps,
+      tx,
+      'storageIntents',
+      'idempotency_key',
+      idempotencyKey,
+    );
+    return intents[0];
+  }
+
+  /**
+   * §4.1 nota final: `(tenant_id, hash_value)` é único, então um segundo
+   * conteúdo idêntico com outra chave é replay da intenção que já detém o
+   * hash — nunca uma segunda linha.
+   */
+  private async assertHashIsFree(
+    tx: unknown,
+    hashValue: string,
+  ): Promise<void> {
+    const owner = (
+      await findRowsWhere(this.deps, tx, 'evidence', 'hash_value', hashValue)
+    )[0];
+    if (!owner) return;
+    const intents = await findRowsWhere(
+      this.deps,
+      tx,
+      'storageIntents',
+      'evidence_id',
+      owner.id,
+    );
+    throw idempotencyReplay(stringOf(intents[0]?.idempotency_key ?? ''));
+  }
+
+  private async replayOf(
+    tx: unknown,
+    intent: EvidenceRow,
+    parsed: ParsedInput,
+  ): Promise<InitiateUploadResult> {
+    const evidence = await findRow(
+      this.deps,
+      tx,
+      'evidence',
+      stringOf(intent.evidence_id),
+    );
+    if (fingerprintOf(evidence) !== parsed.requestHash)
+      throw idempotencyReplay(parsed.idempotency_key);
+    const presigned = await this.presign(parsed, stringOf(intent.object_key));
+    return {
+      storage_intent_id: stringOf(intent.id),
+      upload_url: presigned.uploadUrl,
+      expires_at: presigned.expiresAt,
+      evidence_id: stringOf(intent.evidence_id),
+    };
+  }
+}
+
+function idempotencyReplay(idempotencyKey: string): DetranError {
+  return new DetranError('TEAT.IDEMPOTENCY_REPLAY', {
+    status: 409,
+    context: { idempotencyKey },
+    message: 'Chave de idempotência já usada com outro pedido.',
+  });
+}
+
+/**
+ * `filename`, a impressão digital do pedido e a entidade declarada moram em
+ * `metadata_json`: a DDL 17 não tem coluna para nenhum dos três, e sem a
+ * impressão não há como distinguir "mesma chave, mesmo corpo" de "mesma
+ * chave, corpo diferente" (§4.1, OD-T55 ratificada na adenda §13; a entidade
+ * é o termo de comparação da §14.1).
+ */
+function metadataOf(parsed: ParsedInput): Record<string, unknown> {
+  return {
+    ...(parsed.metadata_json ?? {}),
+    filename: parsed.filename,
+    upload_request_hash: parsed.requestHash,
+    // §14.1: `complete-upload` compara a entidade declarada com a da
+    // intenção, e `ops.storage_intent` não tem coluna para o par. Os nomes
+    // são os propostos pelo Inspector em TASK-0006 iteração 3.
+    entity_type: parsed.entity_type,
+    entity_id: parsed.entity_id,
+  };
+}
+
+function fingerprintOf(evidence: EvidenceRow | undefined): string {
+  const metadata = evidence?.metadata_json;
+  if (!metadata || typeof metadata !== 'object') return '';
+  return stringOf(
+    (metadata as Record<string, unknown>).upload_request_hash ?? '',
+  );
+}
+
+function parse(input: InitiateUploadInput): ParsedInput {
+  const hashValue = stringOf(input?.hash_value ?? '').trim();
+  if (!hashValue)
+    throw new DetranError('TEAT.EVIDENCE_HASH_REQUIRED', {
+      status: 400,
+      context: { field: 'hash_value' },
+      message: 'O hash do conteúdo é obrigatório na intenção de upload.',
+    });
+
+  const fields: { path: string; rule: string }[] = [];
+  const requireUuid = (path: keyof InitiateUploadInput): void => {
+    const value = stringOf(input[path] ?? '');
+    if (!UUID_PATTERN.test(value)) fields.push({ path, rule: 'uuid' });
+  };
+  const requireText = (
+    path: keyof InitiateUploadInput,
+    maxLength: number,
+  ): void => {
+    const value = stringOf(input[path] ?? '').trim();
+    if (!value || value.length > maxLength)
+      fields.push({ path, rule: 'required' });
+  };
+
+  requireUuid('traffic_agency_id');
+  // Adenda CTG-0003 §12 item 3: a DDL 17 é canônica (`uuid not null`).
+  requireUuid('local_evidence_id');
+  requireUuid('entity_id');
+  requireText('idempotency_key', 160);
+  requireText('entity_type', 80);
+  requireText('evidence_type', 60);
+  requireText('origin', 60);
+  requireText('filename', 180);
+  if (!HASH_PATTERN.test(hashValue))
+    fields.push({ path: 'hash_value', rule: 'pattern' });
+  if (stringOf(input.hash_algorithm ?? '') !== 'sha256')
+    fields.push({ path: 'hash_algorithm', rule: 'enum' });
+  if (
+    !(ALLOWED_MIME_TYPES as readonly string[]).includes(
+      stringOf(input.mime_type),
+    )
+  )
+    fields.push({ path: 'mime_type', rule: 'enum' });
+  const sizeBytes = Number(input.size_bytes);
+  if (
+    !Number.isInteger(sizeBytes) ||
+    sizeBytes < 1 ||
+    sizeBytes > MAX_SIZE_BYTES
+  )
+    fields.push({ path: 'size_bytes', rule: 'range' });
+  if (fields.length > 0) throw validationFailed(fields);
+
+  const parsed: InitiateUploadInput = {
+    ...input,
+    hash_value: hashValue,
+    size_bytes: sizeBytes,
+    captured_at: input.captured_at ? isoOf(input.captured_at) : undefined,
+  };
+  return { ...parsed, requestHash: requestHashOf(parsed) };
+}
+
+function requestHashOf(input: InitiateUploadInput): string {
+  const { idempotency_key: _key, ...rest } = input;
+  return sha256Hex(stableJson(rest));
+}
diff --git a/backend/domains/ops/snapshots/src/handwritten/external-query.command.spec.ts b/backend/domains/ops/snapshots/src/handwritten/external-query.command.spec.ts
new file mode 100644
index 0000000..659bb3c
--- /dev/null
+++ b/backend/domains/ops/snapshots/src/handwritten/external-query.command.spec.ts
@@ -0,0 +1,406 @@
+import { describe, expect, it, vi } from 'vitest';
+
+/**
+ * CTG-0003 §5.1/§5.2 e §10 (R-0008, TASK-0006) — C-0003-15…19: `POST/GET
+ * /v1/ops/snapshots/external-queries` (M12). `handwritten/external-query.command.ts`
+ * nasce em TASK-0007 (CTG-0003 §11). Nome esperado do export:
+ * `ExternalQueryCommand`, construtor `(deps)`, métodos `execute` (create) e
+ * `list` (leitura).
+ *
+ * Canônico (CTG-0003 §5.1, ADR-0003): as portas `WsdenatranReadPort`/`RenachPort`
+ * chegam por `SNAPSHOT_QUERY_PORTS`; nenhum `fetch` sai daqui — o stub prova
+ * (C-0003-35, em `tests/integration/`). Fixtures: `snapshots_vehicle`
+ * `…ef600001` (plate `BRA2E19`, `make_model='Fixture Sedan 1.6'`).
+ */
+
+const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
+const AGENCY_ID = '00000000-0000-7000-8000-0000e2000001';
+const ACTOR_ID = '00000000-0000-4000-8000-0000b0000001';
+const VEHICLE_ID = '00000000-0000-7000-8000-0000ef600001';
+
+function repository(rows: Record<string, unknown>[] = []) {
+  const store = [...rows];
+  return {
+    rows: store,
+    list: vi.fn(async () => [...store]),
+    find: vi.fn(async (id: string) => store.find((row) => row.id === id)),
+    findOne: vi.fn(async (id: string) => store.find((row) => row.id === id)),
+    findBy: vi.fn(
+      async (predicate: (row: Record<string, unknown>) => boolean) =>
+        store.find(predicate),
+    ),
+    create: vi.fn(async (values: Record<string, unknown>) => {
+      const row = { id: `row-${store.length + 1}`, ...values };
+      store.push(row);
+      return row;
+    }),
+    update: vi.fn(async (id: string, patch: Record<string, unknown>) => {
+      const row = store.find((entry) => entry.id === id);
+      if (row) Object.assign(row, patch);
+      return row;
+    }),
+  };
+}
+
+interface VehicleRecord {
+  plate?: string;
+  makeModelDescription?: string;
+  [key: string]: unknown;
+}
+
+interface Ports {
+  wsdenatranRead: { findVehicleByPlate: ReturnType<typeof vi.fn> };
+  renach: {
+    findDriverByCpf: ReturnType<typeof vi.fn>;
+    findDriverByLicense: ReturnType<typeof vi.fn>;
+  };
+}
+
+interface Deps {
+  database: { tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> };
+  requestContext: {
+    hasActiveContext(): boolean;
+    snapshot(): { tenantId: string; actorId: string };
+  };
+  repositories: Record<string, ReturnType<typeof repository>>;
+  ports: Ports;
+  clock: { now(): string };
+}
+
+/**
+ * CTG-0003 §14.3: `agencyOfPrincipal` consulta
+ * `select traffic_agency_id from ops.ops_agent_profile where user_ref = $1`
+ * sob a transação. O stub por padrão devolve a agência da fixture
+ * (`…e2000001`, perfil `…b0000001`) para não quebrar os casos que não
+ * envolvem resolução de órgão; `agencyProfileRows` no override troca o
+ * resultado (ex.: `[]` para o principal sem perfil, C-0003 §14.3 fail-closed).
+ */
+function defaultTx(agencyProfileRows: Record<string, unknown>[]) {
+  return {
+    async tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> {
+      return work({
+        query: vi.fn(async (sql: string) =>
+          typeof sql === 'string' && sql.includes('ops_agent_profile')
+            ? { rows: agencyProfileRows }
+            : { rows: [] },
+        ),
+      });
+    },
+  };
+}
+
+function deps(overrides: Partial<Deps> = {}): Deps {
+  return {
+    database:
+      overrides.database ?? defaultTx([{ traffic_agency_id: AGENCY_ID }]),
+    requestContext: overrides.requestContext ?? {
+      hasActiveContext: () => true,
+      snapshot: () => ({ tenantId: TENANT_ID, actorId: ACTOR_ID }),
+    },
+    repositories: {
+      vehicles: repository([
+        {
+          id: VEHICLE_ID,
+          tenant_id: TENANT_ID,
+          plate: 'BRA2E19',
+          make_model: 'Fixture Sedan 1.6',
+          source: 'wsdenatran',
+        },
+      ]),
+      persons: repository(),
+      personDocuments: repository(),
+      vehicleSnapshots: repository(),
+      externalQueries: repository(),
+      ...(overrides.repositories ?? {}),
+    },
+    ports: overrides.ports ?? {
+      wsdenatranRead: {
+        findVehicleByPlate: vi.fn(
+          async (): Promise<VehicleRecord | undefined> => undefined,
+        ),
+      },
+      renach: {
+        findDriverByCpf: vi.fn(async () => undefined),
+        findDriverByLicense: vi.fn(async () => undefined),
+      },
+    },
+    clock: overrides.clock ?? { now: () => '2026-09-14T14:00:00.000Z' },
+  };
+}
+
+function input(
+  overrides: Record<string, unknown> = {},
+): Record<string, unknown> {
+  return {
+    query_type: 'vehicle_by_plate',
+    parameters: { plate: 'BRA2E19' },
+    purpose: 'fiscalizacao-de-transito',
+    agent_id: ACTOR_ID,
+    ...overrides,
+  };
+}
+
+const importModule = (specifier: string): Promise<unknown> =>
+  import(/* @vite-ignore */ specifier);
+
+async function loadCommand(
+  dependencies: Deps,
+): Promise<Record<string, unknown>> {
+  let loaded: Record<string, unknown>;
+  try {
+    loaded = (await importModule('./external-query.command.js')) as Record<
+      string,
+      unknown
+    >;
+  } catch (cause) {
+    throw new Error(
+      'ops/snapshots/src/handwritten/external-query.command.ts ainda não existe (TASK-0007, CTG-0003 §11)',
+      { cause },
+    );
+  }
+  const exported =
+    (loaded.ExternalQueryCommand as unknown) ??
+    Object.values(loaded).find((value) => typeof value === 'function');
+  if (typeof exported !== 'function') {
+    throw new Error(
+      'external-query.command.ts não exporta um comando construtível (CTG-0003 §11)',
+    );
+  }
+  const Command = exported as new (
+    dependencies: unknown,
+  ) => Record<string, unknown>;
+  return new Command(dependencies);
+}
+
+async function createQuery(
+  dependencies: Deps,
+  body: Record<string, unknown>,
+): Promise<Record<string, unknown>> {
+  const command = await loadCommand(dependencies);
+  const method = ['execute', 'create', 'handle']
+    .map((name) => command[name])
+    .find((value) => typeof value === 'function');
+  if (typeof method !== 'function') {
+    throw new Error(
+      'external-query.command.ts não expõe execute|create|handle (CTG-0003 §5.1)',
+    );
+  }
+  return (await (method as (value: unknown) => Promise<unknown>).call(
+    command,
+    body,
+  )) as Record<string, unknown>;
+}
+
+async function listQueries(
+  dependencies: Deps,
+): Promise<Record<string, unknown>[]> {
+  const command = await loadCommand(dependencies);
+  const method = ['list', 'read']
+    .map((name) => command[name])
+    .find((value) => typeof value === 'function');
+  if (typeof method !== 'function') {
+    throw new Error(
+      'external-query.command.ts não expõe list|read (CTG-0003 §5.2)',
+    );
+  }
+  const result = (await (method as () => Promise<unknown>).call(command)) as {
+    items?: Record<string, unknown>[];
+  };
+  return Array.isArray(result) ? result : (result.items ?? []);
+}
+
+describe('CTG-0003 §5.1 — external-queries: forma, portas e efeito (C-0003-15…18)', () => {
+  it('C-0003-15 — dado external-queries sem purpose então 400 TEAT.QUERY_PURPOSE_REQUIRED', async () => {
+    const dependencies = deps();
+    const body = input();
+    delete body.purpose;
+    await expect(createQuery(dependencies, body)).rejects.toMatchObject({
+      code: 'TEAT.QUERY_PURPOSE_REQUIRED',
+      status: 400,
+    });
+  });
+
+  it('dado query_type inválido então 400 TEAT.ENUM_INVALID', async () => {
+    const dependencies = deps();
+    await expect(
+      createQuery(dependencies, input({ query_type: 'foo' })),
+    ).rejects.toMatchObject({
+      code: 'TEAT.ENUM_INVALID',
+      status: 400,
+    });
+  });
+
+  it('C-0003-16 — dado o stub de WsdenatranReadPort.findVehicleByPlate devolvendo undefined então 404 TEAT.QUERY_NOT_FOUND e uma snapshots_external_query status=not_found', async () => {
+    const dependencies = deps();
+    await expect(createQuery(dependencies, input())).rejects.toMatchObject({
+      code: 'TEAT.QUERY_NOT_FOUND',
+      status: 404,
+      context: expect.objectContaining({ queryType: 'vehicle_by_plate' }),
+    });
+    expect(dependencies.repositories.externalQueries.rows).toContainEqual(
+      expect.objectContaining({ status: 'not_found' }),
+    );
+  });
+
+  it('C-0003-17 — dado o stub lançando então 503 TEAT.QUERY_UPSTREAM_UNAVAILABLE e uma snapshots_external_query status=failed', async () => {
+    const dependencies = deps({
+      ports: {
+        wsdenatranRead: {
+          findVehicleByPlate: vi.fn(async () => {
+            throw new Error('upstream unavailable');
+          }),
+        },
+        renach: {
+          findDriverByCpf: vi.fn(async () => undefined),
+          findDriverByLicense: vi.fn(async () => undefined),
+        },
+      },
+    });
+    await expect(createQuery(dependencies, input())).rejects.toMatchObject({
+      code: 'TEAT.QUERY_UPSTREAM_UNAVAILABLE',
+      status: 503,
+      context: expect.objectContaining({ queryType: 'vehicle_by_plate' }),
+    });
+    expect(dependencies.repositories.externalQueries.rows).toContainEqual(
+      expect.objectContaining({ status: 'failed' }),
+    );
+  });
+
+  it('C-0003-18a — dado um VehicleRecord com make_model diferente do já congelado então divergence_recorded=true', async () => {
+    const dependencies = deps({
+      ports: {
+        wsdenatranRead: {
+          findVehicleByPlate: vi.fn(async () => ({
+            plate: 'BRA2E19',
+            makeModelDescription: 'Outro Modelo 2.0',
+          })),
+        },
+        renach: {
+          findDriverByCpf: vi.fn(async () => undefined),
+          findDriverByLicense: vi.fn(async () => undefined),
+        },
+      },
+    });
+    const response = await createQuery(dependencies, input());
+    expect(response.divergence_recorded).toBe(true);
+  });
+
+  it('C-0003-18b — dado um VehicleRecord idêntico ao já congelado então divergence_recorded=false', async () => {
+    const dependencies = deps({
+      ports: {
+        wsdenatranRead: {
+          findVehicleByPlate: vi.fn(async () => ({
+            plate: 'BRA2E19',
+            makeModelDescription: 'Fixture Sedan 1.6',
+          })),
+        },
+        renach: {
+          findDriverByCpf: vi.fn(async () => undefined),
+          findDriverByLicense: vi.fn(async () => undefined),
+        },
+      },
+    });
+    const response = await createQuery(dependencies, input());
+    expect(response.divergence_recorded).toBe(false);
+  });
+});
+
+describe('CTG-0003 §5.2 — GET external-queries: sem dado pessoal exposto (C-0003-19)', () => {
+  it('C-0003-19 — dado GET external-queries então nenhum item traz parameters, só parameters_hash', async () => {
+    const dependencies = deps({
+      repositories: {
+        vehicles: repository(),
+        persons: repository(),
+        personDocuments: repository(),
+        vehicleSnapshots: repository(),
+        externalQueries: repository([
+          {
+            id: 'query-1',
+            tenant_id: TENANT_ID,
+            traffic_agency_id: AGENCY_ID,
+            query_type: 'vehicle_by_plate',
+            parameters_hash: 'sha256:abc',
+            purpose: 'fiscalizacao-de-transito',
+            queried_at: '2026-09-14T10:00:00-04:00',
+            status: 'ok',
+            user_ref: ACTOR_ID,
+          },
+        ]),
+      },
+    });
+    const items = await listQueries(dependencies);
+    expect(items).toHaveLength(1);
+    for (const item of items) {
+      expect(item.parameters).toBeUndefined();
+      expect(item.parameters_hash).toBe('sha256:abc');
+    }
+  });
+});
+
+/**
+ * CTG-0003 §14 item 3 (adenda do maestro, 2026-09-16, delivery-review ciclo 1
+ * achado §14.3, substitui OD-T57) — TASK-0006 iteração 3: `external-queries`
+ * sem `traffic_agency_id` no corpo resolve pelo `ops_agent_profile` do
+ * principal; sem nenhuma fonte, 422 fail-closed; nunca o id do tenant.
+ *
+ * Escrito em paralelo à iteração 3 do Engineer: `external-query.command.ts`
+ * já traz `resolveAgency()` (corpo → `agencyOfPrincipal` → 422) lida antes de
+ * fechar os casos abaixo.
+ */
+describe('CTG-0003 §14.3 — external-queries: resolução de traffic_agency_id', () => {
+  function depsWithResolvedVehicle(overrides: Partial<Deps> = {}): Deps {
+    return deps({
+      ports: {
+        wsdenatranRead: {
+          findVehicleByPlate: vi.fn(async () => ({
+            plate: 'BRA2E19',
+            makeModelDescription: 'Fixture Sedan 1.6',
+          })),
+        },
+        renach: {
+          findDriverByCpf: vi.fn(async () => undefined),
+          findDriverByLicense: vi.fn(async () => undefined),
+        },
+      },
+      ...overrides,
+    });
+  }
+
+  it('dado o corpo sem traffic_agency_id e o principal com perfil então a linha gravada usa o órgão do perfil (…e2000001), nunca o tenant_id', async () => {
+    const dependencies = depsWithResolvedVehicle();
+    const body = input();
+    expect(body.traffic_agency_id).toBeUndefined();
+    await createQuery(dependencies, body);
+    const saved = dependencies.repositories.externalQueries.rows[0];
+    expect(saved?.traffic_agency_id).toBe(AGENCY_ID);
+    expect(saved?.traffic_agency_id).not.toBe(TENANT_ID);
+  });
+
+  it('dado traffic_agency_id explícito no corpo então prevalece sobre o perfil do principal', async () => {
+    const EXPLICIT_AGENCY = '00000000-0000-7000-8000-0000e2000099';
+    const dependencies = depsWithResolvedVehicle();
+    await createQuery(
+      dependencies,
+      input({ traffic_agency_id: EXPLICIT_AGENCY }),
+    );
+    const saved = dependencies.repositories.externalQueries.rows[0];
+    expect(saved?.traffic_agency_id).toBe(EXPLICIT_AGENCY);
+  });
+
+  it('dado o corpo sem traffic_agency_id e o principal sem ops_agent_profile (tenant isolado) então 422 TEAT.VALIDATION_FAILED com fields=[{ path: "traffic_agency_id", rule: "required" }], e nada persistido', async () => {
+    const dependencies = deps({ database: defaultTx([]) });
+    await expect(createQuery(dependencies, input())).rejects.toMatchObject({
+      code: 'TEAT.VALIDATION_FAILED',
+      status: 422,
+      context: expect.objectContaining({
+        fields: expect.arrayContaining([
+          expect.objectContaining({
+            path: 'traffic_agency_id',
+            rule: 'required',
+          }),
+        ]),
+      }),
+    });
+    expect(dependencies.repositories.externalQueries.rows).toEqual([]);
+  });
+});
diff --git a/backend/domains/ops/snapshots/src/handwritten/external-query.command.ts b/backend/domains/ops/snapshots/src/handwritten/external-query.command.ts
new file mode 100644
index 0000000..5c300f9
--- /dev/null
+++ b/backend/domains/ops/snapshots/src/handwritten/external-query.command.ts
@@ -0,0 +1,442 @@
+// CTG-0003 §5.1 e §5.2 (M12, R-0008, TASK-0007) — `POST/GET
+// /v1/ops/snapshots/external-queries`.
+//
+// A consulta sai por `SNAPSHOT_QUERY_PORTS`; nenhum `fetch` nasce aqui
+// (ADR-0003, C-0003-35). Toda tentativa é escriturada em
+// `ops.snapshots_external_query`, inclusive as que falham — a auditoria da
+// consulta é o efeito, e por isso a linha de `not_found`/`failed` é gravada
+// em transação própria antes da exceção. As leituras de congelamento
+// acontecem antes da transação de escrita, que fica com um único ciclo.
+import { DetranError } from '@detran/shared';
+
+import {
+  agencyOfPrincipal,
+  findRowsWhere,
+  insertRow,
+  inTenantTransaction,
+  listRows,
+  parametersHashOf,
+  patchRow,
+  stringOf,
+  tenantScope,
+  validationFailed,
+  type DriverRecord,
+  type SnapshotRow,
+  type SnapshotsDeps,
+  type VehicleRecord,
+} from './snapshots-runtime.js';
+
+export const EXTERNAL_QUERY_TYPES = [
+  'vehicle_by_plate',
+  'driver_by_cpf',
+  'driver_by_license',
+] as const;
+
+export type ExternalQueryType = (typeof EXTERNAL_QUERY_TYPES)[number];
+
+/**
+ * `snapshots_external_query.external_system_id` é `not null` e nenhum
+ * blueprint `ops` define uma tabela de sistemas externos: os identificadores
+ * por porta são os fixados em CTG-0003 §13 item 10 (OD-T34).
+ */
+const EXTERNAL_SYSTEM_IDS: Record<ExternalQueryType, string> = {
+  vehicle_by_plate: '00000000-0000-7000-8000-0000ef800001',
+  driver_by_cpf: '00000000-0000-7000-8000-0000ef800002',
+  driver_by_license: '00000000-0000-7000-8000-0000ef800002',
+};
+
+const SOURCE_BY_TYPE: Record<ExternalQueryType, 'wsdenatran' | 'renach'> = {
+  vehicle_by_plate: 'wsdenatran',
+  driver_by_cpf: 'renach',
+  driver_by_license: 'renach',
+};
+
+/** Campos congelados comparados campo a campo (§5.1, `divergence_recorded`). */
+const VEHICLE_COMPARED_FIELDS = [
+  'plate',
+  'renavam',
+  'chassis',
+  'uf',
+  'make_model',
+] as const;
+
+const PERSON_COMPARED_FIELDS = ['name', 'cpf', 'birth_date'] as const;
+
+export interface CreateExternalQueryInput {
+  query_type: string;
+  parameters: Record<string, unknown>;
+  purpose: string;
+  traffic_agency_id?: string;
+  agent_id?: string;
+  device_id?: string;
+}
+
+export interface CreateExternalQueryResult {
+  snapshot_id: string;
+  source: string;
+  queried_at: string;
+  result: VehicleRecord | DriverRecord;
+  divergence_recorded: boolean;
+}
+
+export interface ExternalQueryListItem {
+  id: string;
+  query_type: string;
+  purpose: string;
+  queried_at: string;
+  status: string;
+  parameters_hash: string;
+  user_ref: string;
+  agent_id: string | null;
+  device_id: string | null;
+}
+
+export interface ExternalQueryListFilters {
+  query_type?: string;
+  purpose?: string;
+  agent_id?: string;
+  from?: string;
+  to?: string;
+}
+
+interface ParsedQuery {
+  queryType: ExternalQueryType;
+  parameters: Record<string, unknown>;
+  purpose: string;
+  parametersHash: string;
+  trafficAgencyId?: string;
+  agentId: string | null;
+  deviceId: string | null;
+}
+
+export class ExternalQueryCommand {
+  constructor(private readonly deps: SnapshotsDeps) {}
+
+  async execute(
+    input: CreateExternalQueryInput,
+  ): Promise<CreateExternalQueryResult> {
+    const parsed = parse(input);
+    const { actorId } = tenantScope(this.deps);
+    const queriedAt = this.deps.clock.now();
+    const source = SOURCE_BY_TYPE[parsed.queryType];
+    const trafficAgencyId = await this.resolveAgency(parsed, actorId);
+    const base = this.queryRow(parsed, queriedAt, actorId, trafficAgencyId);
+
+    let record: VehicleRecord | DriverRecord | undefined;
+    try {
+      record = await this.callPort(parsed);
+    } catch (cause) {
+      await this.record({
+        ...base,
+        status: 'failed',
+        result_summary: codeOf(cause),
+      });
+      throw new DetranError('TEAT.QUERY_UPSTREAM_UNAVAILABLE', {
+        status: 503,
+        context: { queryType: parsed.queryType },
+        message: 'Sistema nacional indisponível para a consulta.',
+        cause,
+      });
+    }
+
+    if (!record) {
+      await this.record({ ...base, status: 'not_found' });
+      throw new DetranError('TEAT.QUERY_NOT_FOUND', {
+        status: 404,
+        context: { queryType: parsed.queryType },
+        message: 'Consulta sem registro no sistema nacional.',
+      });
+    }
+
+    const found = record;
+    const frozen =
+      parsed.queryType === 'vehicle_by_plate'
+        ? vehicleRow(found as VehicleRecord, parsed, source)
+        : personRow(found as DriverRecord, parsed, source);
+    const existing = await this.findFrozen(parsed, frozen);
+    const divergenceRecorded = existing
+      ? comparedFieldsOf(parsed).some(
+          (field) =>
+            normalizeField(existing[field]) !== normalizeField(frozen[field]),
+        )
+      : false;
+
+    return inTenantTransaction(this.deps, async (tx) => {
+      const query = await insertRow(this.deps, tx, 'externalQueries', {
+        ...base,
+        status: 'ok',
+        result_summary: source,
+        result_snapshot_json: found as unknown as Record<string, unknown>,
+      });
+
+      const table =
+        parsed.queryType === 'vehicle_by_plate' ? 'vehicles' : 'persons';
+      const stored = existing
+        ? ((await patchRow(
+            this.deps,
+            tx,
+            table,
+            stringOf(existing.id),
+            frozen,
+          )) ?? existing)
+        : await insertRow(this.deps, tx, table, frozen);
+
+      if (parsed.queryType !== 'vehicle_by_plate') {
+        const driver = found as DriverRecord;
+        if (driver.licenseNumber)
+          await insertRow(this.deps, tx, 'personDocuments', {
+            person_id: stringOf(stored.id),
+            document_type: 'cnh',
+            document_number: stringOf(driver.licenseNumber),
+            issuing_uf: driver.licenseState ?? null,
+            valid_until: driver.licenseExpiresAt ?? null,
+            license_category: driver.currentCategory ?? null,
+            status: driver.licenseStatus ?? null,
+            source,
+          });
+        return {
+          snapshot_id: stringOf(stored.id),
+          source,
+          queried_at: queriedAt,
+          result: found,
+          divergence_recorded: divergenceRecorded,
+        };
+      }
+
+      const vehicle = found as VehicleRecord;
+      const snapshot = await insertRow(this.deps, tx, 'vehicleSnapshots', {
+        vehicle_id: stringOf(stored.id),
+        plate_snapshot: stringOf(frozen.plate),
+        renavam_snapshot: vehicle.renavam ?? null,
+        make_model_snapshot: vehicle.makeModelDescription ?? null,
+        species_snapshot: null,
+        category_snapshot: null,
+        color_snapshot: null,
+        data_source: source,
+        external_query_id: stringOf(query.id),
+        divergence_recorded: divergenceRecorded,
+        payload_json: vehicle as unknown as Record<string, unknown>,
+      });
+
+      return {
+        snapshot_id: stringOf(snapshot.id),
+        source,
+        queried_at: queriedAt,
+        result: found,
+        divergence_recorded: divergenceRecorded,
+      };
+    });
+  }
+
+  /** §5.2 — `parameters` nunca sai na leitura: só o hash. */
+  async list(
+    filters: ExternalQueryListFilters = {},
+  ): Promise<{ items: ExternalQueryListItem[]; nextCursor: null }> {
+    const rows = await inTenantTransaction(this.deps, (tx) =>
+      listRows(this.deps, tx, 'externalQueries'),
+    );
+    const items = rows
+      .filter((row) => matches(row, filters))
+      .map((row) => ({
+        id: stringOf(row.id),
+        query_type: stringOf(row.query_type),
+        purpose: stringOf(row.purpose),
+        queried_at: isoOf(row.queried_at),
+        status: stringOf(row.status),
+        parameters_hash: stringOf(row.parameters_hash),
+        user_ref: stringOf(row.user_ref),
+        agent_id: row.agent_id ? stringOf(row.agent_id) : null,
+        device_id: row.device_id ? stringOf(row.device_id) : null,
+      }));
+    return { items, nextCursor: null };
+  }
+
+  private callPort(
+    parsed: ParsedQuery,
+  ): Promise<VehicleRecord | DriverRecord | undefined> {
+    const ports = this.deps.ports;
+    if (parsed.queryType === 'vehicle_by_plate')
+      return ports.wsdenatranRead.findVehicleByPlate(
+        stringOf(parsed.parameters.plate),
+      );
+    if (parsed.queryType === 'driver_by_cpf')
+      return ports.renach.findDriverByCpf(stringOf(parsed.parameters.cpf));
+    return ports.renach.findDriverByLicense(
+      stringOf(parsed.parameters.license_number),
+    );
+  }
+
+  private findFrozen(
+    parsed: ParsedQuery,
+    frozen: SnapshotRow,
+  ): Promise<SnapshotRow | undefined> {
+    const table =
+      parsed.queryType === 'vehicle_by_plate' ? 'vehicles' : 'persons';
+    const column = table === 'vehicles' ? 'plate' : 'cpf';
+    const value = stringOf(frozen[column] ?? '');
+    if (!value) return Promise.resolve(undefined);
+    return inTenantTransaction(this.deps, async (tx) => {
+      const rows = await findRowsWhere(this.deps, tx, table, column, value);
+      return rows[0];
+    });
+  }
+
+  /**
+   * §14.3 — o órgão vem do corpo ou do perfil do principal; nunca do id do
+   * tenant. Sem fonte, a consulta não é escriturada (fail-closed).
+   */
+  private async resolveAgency(
+    parsed: ParsedQuery,
+    actorId: string,
+  ): Promise<string> {
+    if (parsed.trafficAgencyId) return parsed.trafficAgencyId;
+    const fromProfile = await agencyOfPrincipal(this.deps, actorId);
+    if (fromProfile) return fromProfile;
+    throw validationFailed(
+      [{ path: 'traffic_agency_id', rule: 'required' }],
+      422,
+    );
+  }
+
+  private queryRow(
+    parsed: ParsedQuery,
+    queriedAt: string,
+    actorId: string,
+    trafficAgencyId: string,
+  ): SnapshotRow {
+    return {
+      traffic_agency_id: trafficAgencyId,
+      user_ref: actorId,
+      agent_id: parsed.agentId,
+      device_id: parsed.deviceId,
+      external_system_id: EXTERNAL_SYSTEM_IDS[parsed.queryType],
+      query_type: parsed.queryType,
+      parameters_hash: parsed.parametersHash,
+      purpose: parsed.purpose,
+      queried_at: queriedAt,
+      protocol: null,
+    };
+  }
+
+  private async record(values: SnapshotRow): Promise<void> {
+    await inTenantTransaction(this.deps, async (tx) => {
+      await insertRow(this.deps, tx, 'externalQueries', values);
+    });
+  }
+}
+
+function comparedFieldsOf(parsed: ParsedQuery): readonly string[] {
+  return parsed.queryType === 'vehicle_by_plate'
+    ? VEHICLE_COMPARED_FIELDS
+    : PERSON_COMPARED_FIELDS;
+}
+
+function vehicleRow(
+  record: VehicleRecord,
+  parsed: ParsedQuery,
+  source: string,
+): SnapshotRow {
+  return {
+    plate: stringOf(record.plate ?? parsed.parameters.plate ?? ''),
+    renavam: record.renavam ?? null,
+    chassis: record.chassis ?? null,
+    uf: record.jurisdictionState ?? null,
+    make_model: record.makeModelDescription ?? null,
+    source,
+  };
+}
+
+function personRow(
+  record: DriverRecord,
+  parsed: ParsedQuery,
+  source: string,
+): SnapshotRow {
+  const cpf = stringOf(record.cpf ?? parsed.parameters.cpf ?? '');
+  return {
+    person_type: 'natural',
+    name: record.name ?? null,
+    cpf: cpf || null,
+    birth_date: record.birthDate ?? null,
+    mother_name: record.motherName ?? null,
+    source,
+  };
+}
+
+function normalizeField(value: unknown): string {
+  if (value === null || value === undefined) return '';
+  if (value instanceof Date) return value.toISOString();
+  return String(value);
+}
+
+function isoOf(value: unknown): string {
+  if (value instanceof Date) return value.toISOString();
+  return stringOf(value);
+}
+
+function codeOf(cause: unknown): string {
+  const candidate = cause as { code?: unknown } | null;
+  return typeof candidate?.code === 'string'
+    ? candidate.code
+    : 'upstream_error';
+}
+
+function matches(row: SnapshotRow, filters: ExternalQueryListFilters): boolean {
+  if (filters.query_type && row.query_type !== filters.query_type) return false;
+  if (filters.purpose && row.purpose !== filters.purpose) return false;
+  if (filters.agent_id && stringOf(row.agent_id) !== filters.agent_id)
+    return false;
+  const queriedAt = isoOf(row.queried_at);
+  if (filters.from && queriedAt < filters.from) return false;
+  if (filters.to && queriedAt > filters.to) return false;
+  return true;
+}
+
+function parse(input: CreateExternalQueryInput): ParsedQuery {
+  const purpose = stringOf(input?.purpose ?? '').trim();
+  if (!purpose)
+    throw new DetranError('TEAT.QUERY_PURPOSE_REQUIRED', {
+      status: 400,
+      context: { field: 'purpose' },
+      message: 'A finalidade da consulta é obrigatória.',
+    });
+
+  const queryType = stringOf(input?.query_type ?? '');
+  if (!(EXTERNAL_QUERY_TYPES as readonly string[]).includes(queryType))
+    throw new DetranError('TEAT.ENUM_INVALID', {
+      status: 400,
+      context: { field: 'query_type', allowed: [...EXTERNAL_QUERY_TYPES] },
+      message: 'Tipo de consulta externa fora do conjunto admitido.',
+    });
+
+  const parameters =
+    input?.parameters && typeof input.parameters === 'object'
+      ? (input.parameters as Record<string, unknown>)
+      : {};
+  const fields: { path: string; rule: string }[] = [];
+  if (queryType === 'vehicle_by_plate') {
+    const plate = stringOf(parameters.plate ?? '').trim();
+    if (plate.length < 7 || plate.length > 8)
+      fields.push({ path: 'parameters.plate', rule: 'length' });
+  } else if (queryType === 'driver_by_cpf') {
+    const cpf = stringOf(parameters.cpf ?? '').trim();
+    if (!/^\d{11}$/.test(cpf))
+      fields.push({ path: 'parameters.cpf', rule: 'pattern' });
+  } else {
+    const license = stringOf(parameters.license_number ?? '').trim();
+    if (!license)
+      fields.push({ path: 'parameters.license_number', rule: 'required' });
+  }
+  if (fields.length > 0) throw validationFailed(fields);
+
+  return {
+    queryType: queryType as ExternalQueryType,
+    parameters,
+    purpose,
+    parametersHash: parametersHashOf(parameters),
+    trafficAgencyId: input.traffic_agency_id
+      ? stringOf(input.traffic_agency_id)
+      : undefined,
+    agentId: input.agent_id ? stringOf(input.agent_id) : null,
+    deviceId: input.device_id ? stringOf(input.device_id) : null,
+  };
+}
diff --git a/backend/domains/ops/snapshots/src/handwritten/snapshots-runtime.ts b/backend/domains/ops/snapshots/src/handwritten/snapshots-runtime.ts
new file mode 100644
index 0000000..4d9962b
--- /dev/null
+++ b/backend/domains/ops/snapshots/src/handwritten/snapshots-runtime.ts
@@ -0,0 +1,282 @@
+// CTG-0003 §5 (M12, R-0008, TASK-0007) — dependências e utilidades do comando
+// de consulta externa. Nenhum cliente HTTP mora aqui: toda consulta sai por
+// `SNAPSHOT_QUERY_PORTS` (`packages/senatran-adapter`, ADR-0003).
+import { createHash } from 'node:crypto';
+
+import {
+  asQueryable,
+  type OpsClock,
+  type SqlQueryable,
+} from '@detran/ops-core';
+import { DetranError, withTenantContext } from '@detran/shared';
+import type { RequestContext } from '@stynx-nyx/core';
+import type { Database, Transaction } from '@stynx-nyx/data';
+
+export type SnapshotRow = Record<string, unknown>;
+
+export interface SnapshotRowStore {
+  list?(): Promise<SnapshotRow[]>;
+  find?(id: string): Promise<SnapshotRow | undefined>;
+  findOne?(id: string): Promise<SnapshotRow | undefined>;
+  create?(values: SnapshotRow): Promise<SnapshotRow>;
+  update?(
+    id: string,
+    patch: SnapshotRow,
+    tx?: unknown,
+  ): Promise<SnapshotRow | undefined>;
+}
+
+/**
+ * Fatia de leitura de `WsdenatranReadPort`/`RenachPort` e a forma de
+ * `VehicleRecord`/`DriverRecord` (`packages/senatran-adapter/src/domain.ts`),
+ * declaradas estruturalmente: `createSenatranAdapter().ports` as satisfaz sem
+ * que `@detran/ops-snapshots` passe a depender do pacote do adapter — a
+ * fronteira do ADR-0003 continua sendo o adapter, e nenhum cliente HTTP entra
+ * neste módulo.
+ */
+export interface VehicleRecord {
+  plate?: string;
+  chassis?: string;
+  renavam?: string;
+  jurisdictionState?: string;
+  makeModelCode?: string;
+  makeModelDescription?: string;
+  ownerDocument?: string;
+  ownerName?: string;
+}
+
+export interface DriverRecord {
+  cpf?: string;
+  name?: string;
+  birthDate?: string;
+  licenseNumber?: string;
+  currentCategory?: string;
+  licenseState?: string;
+  licenseStatus?: string;
+  licenseExpiresAt?: string;
+  motherName?: string;
+}
+
+export interface SnapshotQueryPorts {
+  wsdenatranRead: {
+    findVehicleByPlate(plate: string): Promise<VehicleRecord | undefined>;
+  };
+  renach: {
+    findDriverByCpf(cpf: string): Promise<DriverRecord | undefined>;
+    findDriverByLicense(
+      licenseNumber: string,
+    ): Promise<DriverRecord | undefined>;
+  };
+}
+
+export interface SnapshotsDeps {
+  database: Pick<Database, 'tx'>;
+  requestContext: Pick<RequestContext, 'hasActiveContext' | 'snapshot'>;
+  repositories: Record<string, SnapshotRowStore | undefined>;
+  ports: SnapshotQueryPorts;
+  clock: OpsClock;
+}
+
+export const SNAPSHOT_TABLES = {
+  vehicles: 'ops.snapshots_vehicle',
+  persons: 'ops.snapshots_person',
+  personDocuments: 'ops.snapshots_person_document',
+  vehicleSnapshots: 'ops.snapshots_vehicle_snapshot',
+  externalQueries: 'ops.snapshots_external_query',
+} as const;
+
+export type SnapshotTableName = keyof typeof SNAPSHOT_TABLES;
+
+export function tenantScope(deps: SnapshotsDeps): {
+  tenantId: string;
+  actorId: string;
+} {
+  if (!deps.requestContext.hasActiveContext())
+    throw new Error('Um comando de snapshots exige contexto de requisição');
+  const snapshot = deps.requestContext.snapshot();
+  const tenantId = snapshot.tenantId ?? '';
+  const actorId = snapshot.actorId ?? '';
+  if (!tenantId || !actorId)
+    throw new Error('Um comando de snapshots exige tenantId e actorId');
+  return { tenantId, actorId };
+}
+
+export function inTenantTransaction<T>(
+  deps: SnapshotsDeps,
+  work: (tx: Transaction) => Promise<T>,
+): Promise<T> {
+  return withTenantContext(deps.database, deps.requestContext, work);
+}
+
+function storeOf(
+  deps: SnapshotsDeps,
+  table: SnapshotTableName,
+): SnapshotRowStore | undefined {
+  return deps.repositories[table];
+}
+
+function sqlOf(tx: unknown): SqlQueryable | undefined {
+  return asQueryable(tx as Transaction);
+}
+
+function assertColumns(values: SnapshotRow): string[] {
+  const columns = Object.keys(values);
+  if (columns.some((column) => !/^[a-z_]+$/.test(column)))
+    throw new Error('Coluna inválida em escrita de ops');
+  return columns;
+}
+
+export async function listRows(
+  deps: SnapshotsDeps,
+  tx: unknown,
+  table: SnapshotTableName,
+): Promise<SnapshotRow[]> {
+  const store = storeOf(deps, table);
+  if (typeof store?.list === 'function') return store.list();
+  const sql = sqlOf(tx);
+  if (!sql) return [];
+  const result = await sql.query(
+    `select * from ${SNAPSHOT_TABLES[table]} order by created_at desc`,
+  );
+  return result.rows;
+}
+
+export async function findRowsWhere(
+  deps: SnapshotsDeps,
+  tx: unknown,
+  table: SnapshotTableName,
+  column: string,
+  value: unknown,
+): Promise<SnapshotRow[]> {
+  if (!/^[a-z_]+$/.test(column)) throw new Error('Coluna inválida em filtro');
+  const store = storeOf(deps, table);
+  if (typeof store?.list === 'function')
+    return (await store.list()).filter((row) => row[column] === value);
+  const sql = sqlOf(tx);
+  if (!sql) return [];
+  const result = await sql.query(
+    `select * from ${SNAPSHOT_TABLES[table]} where ${column} = $1`,
+    [value],
+  );
+  return result.rows;
+}
+
+export async function insertRow(
+  deps: SnapshotsDeps,
+  tx: unknown,
+  table: SnapshotTableName,
+  values: SnapshotRow,
+): Promise<SnapshotRow> {
+  const store = storeOf(deps, table);
+  if (typeof store?.create === 'function') return store.create(values);
+  const sql = sqlOf(tx);
+  if (!sql)
+    throw new Error(`Sem porta nem transação para escrever em ${table}`);
+  const columns = assertColumns(values);
+  const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
+  const result = await sql.query(
+    `insert into ${SNAPSHOT_TABLES[table]} (${columns.join(', ')})
+     values (${placeholders}) returning *`,
+    columns.map((column) => normalize(values[column])),
+  );
+  return (result.rows[0] ?? values) as SnapshotRow;
+}
+
+export async function patchRow(
+  deps: SnapshotsDeps,
+  tx: unknown,
+  table: SnapshotTableName,
+  id: string,
+  patch: SnapshotRow,
+): Promise<SnapshotRow | undefined> {
+  const store = storeOf(deps, table);
+  if (typeof store?.update === 'function') return store.update(id, patch, tx);
+  const sql = sqlOf(tx);
+  if (!sql) throw new Error(`Sem porta nem transação para atualizar ${table}`);
+  const columns = assertColumns(patch);
+  const assignments = columns
+    .map((column, index) => `${column} = $${index + 2}`)
+    .join(', ');
+  const result = await sql.query(
+    `update ${SNAPSHOT_TABLES[table]}
+        set ${assignments}, updated_at = now()
+      where id = $1 returning *`,
+    [id, ...columns.map((column) => normalize(patch[column]))],
+  );
+  return result.rows[0];
+}
+
+function normalize(value: unknown): unknown {
+  if (value === null || value === undefined) return null;
+  if (typeof value === 'object' && !(value instanceof Date))
+    return JSON.stringify(value);
+  return value;
+}
+
+/**
+ * §14.3 — órgão do principal, lido de `ops.ops_agent_profile` pelo
+ * `user_ref` do contexto, sob RLS (a linha só é visível dentro do tenant).
+ * Sem perfil, devolve `undefined`: o chamador decide, e nunca se inventa um
+ * órgão (o id do tenant **não** é órgão).
+ */
+export async function agencyOfPrincipal(
+  deps: SnapshotsDeps,
+  actorId: string,
+): Promise<string | undefined> {
+  return inTenantTransaction(deps, async (tx) => {
+    const sql = sqlOf(tx);
+    if (!sql) return undefined;
+    const result = await sql.query<{ traffic_agency_id: string }>(
+      `select traffic_agency_id from ops.ops_agent_profile
+        where user_ref = $1
+        order by created_at
+        limit 1`,
+      [actorId],
+    );
+    const agencyId = result.rows[0]?.traffic_agency_id;
+    return agencyId ? String(agencyId) : undefined;
+  });
+}
+
+export function stringOf(value: unknown): string {
+  return typeof value === 'string' ? value : String(value ?? '');
+}
+
+export function stableJson(value: unknown): string {
+  return JSON.stringify(sortDeep(value));
+}
+
+function sortDeep(value: unknown): unknown {
+  if (Array.isArray(value)) return value.map((entry) => sortDeep(entry));
+  if (value && typeof value === 'object' && !(value instanceof Date)) {
+    const source = value as Record<string, unknown>;
+    return Object.fromEntries(
+      Object.keys(source)
+        .sort()
+        .map((key) => [key, sortDeep(source[key])]),
+    );
+  }
+  return value;
+}
+
+/** `parameters_hash = 'sha256:' + sha256hex(<JSON canônico dos parâmetros>)`. */
+export function parametersHashOf(parameters: unknown): string {
+  return `sha256:${createHash('sha256')
+    .update(stableJson(parameters), 'utf8')
+    .digest('hex')}`;
+}
+
+/**
+ * Forma dos `parameters` sai como **400** (§5.1); regra de domínio sem fonte
+ * — o órgão da §14.3 — sai como **422**.
+ */
+export function validationFailed(
+  fields: readonly { path: string; rule: string }[],
+  status: 400 | 422 = 400,
+): DetranError {
+  return new DetranError('TEAT.VALIDATION_FAILED', {
+    status,
+    context: { fields: [...fields] },
+    message: 'Requisição inválida para a regra do comando.',
+  });
+}

```
