Papel constitucional: Auditor independente, somente leitura. Revise a entrega CTG-0001 da rodada R-0021, ciclo 1 EXAUSTIVO. Modelo obrigatório claude-opus-5-5. Leia AGENTS.md, CODESTYLE.md, work/rounds/R-0021/AUTHORIZATION.md, contratos CTG-0001 e CTG-0002, execution.json, plan.md §A1/Retomada, os relatórios TASK-0001/0002/0003 e CTG-0001-gates.md, e a rubrica de docs/meta/agents/orchestra/reviewer-prompt.template.md. Compare o diff completo anexado de todos os arquivos substantivos com os critérios C-01-01…10 e C-01-20…30; não aceite critério coberto só por descrição. Verifique os cinco docs de TASK-0001, fronteiras, RLS, limpeza, tests before pin, prompt-review-3 PASS, gates e a decisão A1. Os logs .log não estão inline por tamanho, mas todos estão disponíveis em work/rounds/R-0021/reports/ e seus hashes/exit codes estão em CTG-0001-gates.md. Leia logs relevantes se necessário. Base e HEAD são e47a68014ffdd24e1f9da03c4fc9e1b78ecf381b; o diff contém todas as alterações não commitadas e todos os arquivos novos substantivos. Nenhum PR foi aberto.

Primeiro ciclo: enumere TODOS os achados de uma vez. PASS se nenhum high; REVIEW para high corrigível; FAIL para contradição canônica/Owner/ADR/Constituição ou fronteira de escrita. Achados com caminho/linha/claim/fix concretos. Não edite arquivos. Responda SOMENTE objeto JSON válido, primeira posição { e última }, sem cerca Markdown, sem prosa. Campos: mode="delivery-review", round="R-0021", coupled_task_group="CTG-0001", verdict="PASS|REVIEW|FAIL", findings=[{severity:"high|low",item:number,file:string,line:number,claim:string,fix:string}], notes=[string]. Se o template não incluir coupled_task_group, ele é metadado adicional tolerado; preserve JSON puro.

Anexo: diff completo de código, contratos, docs, relatórios Markdown, planos, prompts, task manifests e budget. Arquivos .log listados após o diff.

diff --git a/backend/app/src/r21-renach-characterization.spec.ts b/backend/app/src/r21-renach-characterization.spec.ts
new file mode 100644
index 00000000..7228abb6
--- /dev/null
+++ b/backend/app/src/r21-renach-characterization.spec.ts
@@ -0,0 +1,57 @@
+import { describe, expect, it, vi } from 'vitest'; +
+import { PecRenachTransmissionService } from './pec-renach-transmission.service.js'; +
+function subject(query: ReturnType<typeof vi.fn>) {

- const database = {
- tx: async <T>(work: (transaction: { query: typeof query }) => Promise<T>) =>
-      work({ query }),
- };
- const context = {
- hasActiveContext: () => true,
- snapshot: () => ({
-      tenantId: 'fixture-tenant-a',
-      actorId: 'fixture-actor',
-      requestId: 'fixture-request',
- }),
- };
- return new PecRenachTransmissionService(
- database as never,
- context as never,
- {
-      submitMedicalExam: vi.fn(),
- } as never,
- );
  +}
-

+describe('R-0021 RENACH caracterizado', () => {

- it('dado trabalho processing com quinze minutos quando claim ocorre então torna-o elegível sob skip locked', async () => {
- const query = vi.fn().mockResolvedValue({ rows: [] });
-
- await expect(subject(query).dispatchDue(99)).resolves.toEqual([]);
- expect(query.mock.calls[0]?.[0]).toContain(
-      "status = 'processing' and dispatched_at <= now() - interval '15 minutes'",
- );
- expect(query.mock.calls[0]?.[0]).toContain('for update skip locked');
- expect(query.mock.calls[0]?.[1]).toEqual([25]);
- });
-
- it('dado ACK de erro sem mensagem ou status inválido quando recebido então rejeita antes de persistir', async () => {
- const query = vi.fn();
- const service = subject(query);
-
- expect(() =>
-      service.recordAcknowledgement('fixture-event', Buffer.from('{}'), {
-        idempotencyKey: 'ch.report:fixture-report',
-        status: 'ERROR',
-      }),
- ).toThrow('requires a message');
- expect(() =>
-      service.recordAcknowledgement('fixture-event', Buffer.from('{}'), {
-        idempotencyKey: 'ch.report:fixture-report',
-        status: 'UNKNOWN' as 'ACKED',
-      }),
- ).toThrow('Unsupported RENACH acknowledgement status');
- expect(query).not.toHaveBeenCalled();
- });
  +});
  diff --git a/backend/app/tests/e2e/r21-offline-sync.e2e.spec.ts b/backend/app/tests/e2e/r21-offline-sync.e2e.spec.ts
  new file mode 100644
  index 00000000..968f0613
  --- /dev/null
  +++ b/backend/app/tests/e2e/r21-offline-sync.e2e.spec.ts
  @@ -0,0 +1,185 @@
  +import { createHash, randomUUID } from 'node:crypto';
  +import type { NestFactory } from '@nestjs/core';
  +import pg from 'pg';
  +import request from 'supertest';
  +import { afterAll, beforeAll, describe, expect, it } from 'vitest';
-

+const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
+const ACTOR_ID = '00000000-0000-4000-8000-0000b0000001';
+const AGENCY_ID = '00000000-0000-7000-8000-0000e2000001';
+const DEVICE_ID = '00000000-0000-7000-8000-0000e4000002';
+const connectionString = process.env.DETRAN_TEST_DATABASE_URL; +
+if (!connectionString)

- throw new Error('DETRAN_TEST_DATABASE_URL is required for R-0021 e2e');
-

+const client = new pg.Client({ connectionString });
+let app: Awaited<ReturnType<typeof NestFactory.create>>;
+const previousEnv: Record<string, string | undefined> = {}; +
+function stableJson(value: unknown): string {

- if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
- if (value && typeof value === 'object') {
- return `{${Object.entries(value as Record<string, unknown>)
-      .filter(([, item]) => item !== undefined)
-      .sort(([left], [right]) => left.localeCompare(right))
-      .map(([key, item]) => `${JSON.stringify(key)}:${stableJson(item)}`)
-      .join(',')}}`;
- }
- return JSON.stringify(value) ?? 'null';
  +}
-

+function body(localEntityId: string, itemKey: string): Record<string, unknown> {

- const offset = Number.parseInt(randomUUID().slice(0, 6), 16) % 3600;
- const occurredAt = `2031-01-01T10:${String(Math.floor(offset / 60)).padStart(2, '0')}:${String(offset % 60).padStart(2, '0')}-04:00`;
- const payload = {
- record: {
-      traffic_agency_id: AGENCY_ID,
-      crash_type: 'source_pending',
-      severity: 'SEM_VITIMA',
-      occurred_at: occurredAt,
-      recorded_at: '2031-01-01T11:00:00-04:00',
-      location_description: 'R-0021 HTTP fixture',
-      municipality_code: '1302603',
-      uf: 'AM',
-      road_condition: 'source_pending',
-      weather_condition: 'source_pending',
-      lighting_condition: 'source_pending',
-      signage_condition: 'source_pending',
-      source_local_id: localEntityId,
- },
- vehicles: [],
- people: [],
- victims: [],
- sceneDuties: [],
- damages: [],
- witnesses: [],
- sketch: null,
- evidenceLocalIds: [],
- links: [],
- };
- return {
- traffic_agency_id: AGENCY_ID,
- device_id: DEVICE_ID,
- agent_id: ACTOR_ID,
- device_batch_id: `r21-http-${randomUUID().slice(0, 8)}`,
- items: [
-      {
-        entity_type: 'crash-record',
-        local_entity_id: localEntityId,
-        idempotency_key: itemKey,
-        created_locally_at: '2026-09-14T13:05:00.000Z',
-        payload_json: payload,
-        payload_hash: `sha256:${createHash('sha256')
-          .update(stableJson(payload))
-          .digest('hex')}`,
-      },
- ],
- };
  +}
-

+function headers(idempotencyKey: string): Record<string, string> {

- return {
- authorization: 'Bearer local',
- 'x-tenant-id': TENANT_ID,
- 'idempotency-key': idempotencyKey,
- };
  +}
-

+beforeAll(async () => {

- for (const key of [
- 'DETRAN_RUNTIME_PROFILE',
- 'DETRAN_LOCAL_TENANT_ID',
- 'DETRAN_LOCAL_ACTOR_ID',
- 'DETRAN_LOCAL_ROLES',
- 'DATABASE_URL',
- 'STYNX_OWNER_DATABASE_URL',
- 'STYNX_APP_DATABASE_URL',
- 'STYNX_READER_DATABASE_URL',
- ])
- previousEnv[key] = process.env[key];
- process.env.DETRAN_RUNTIME_PROFILE = 'test';
- process.env.DETRAN_LOCAL_TENANT_ID = TENANT_ID;
- process.env.DETRAN_LOCAL_ACTOR_ID = ACTOR_ID;
- process.env.DETRAN_LOCAL_ROLES = 'field-agent';
- process.env.DATABASE_URL = connectionString;
- process.env.STYNX_OWNER_DATABASE_URL = connectionString;
- process.env.STYNX_APP_DATABASE_URL = connectionString;
- process.env.STYNX_READER_DATABASE_URL = connectionString;
- await client.connect();
- const { NestFactory: factory } = await import('@nestjs/core');
- const { AppModule } = await import('../../src/app.module.js');
- app = await factory.create(AppModule.forRoot(), { logger: false });
- await app.init();
  +});
-

+afterAll(async () => {

- await app?.close();
- await client.query(`select set_config('app.role', 'owner', false)`);
- await client.query(
- `delete from integration.outbox
-      where tenant_id = $1 and idempotency_key like 'r21-http-%'`,
- [TENANT_ID],
- );
- await client.query(
- `delete from integration.idempotency_keys
-      where tenant_id = $1 and idem_key like 'r21-http-%'`,
- [TENANT_ID],
- );
- await client.query(
- `delete from ops.sync_receipt
-      where tenant_id = $1 and idempotency_key like 'r21-http-%'`,
- [TENANT_ID],
- );
- await client.query(
- `delete from ops.sync_queue_item
-      where tenant_id = $1 and idempotency_key like 'r21-http-%'`,
- [TENANT_ID],
- );
- await client.query(
- `delete from ops.sync_batch
-      where tenant_id = $1 and device_batch_id like 'r21-http-%'`,
- [TENANT_ID],
- );
- await client.query(
- `delete from est.crash_record
-      where tenant_id = $1 and location_description = 'R-0021 HTTP fixture'`,
- [TENANT_ID],
- );
- await client.end();
- for (const [key, value] of Object.entries(previousEnv)) {
- if (value === undefined) delete process.env[key];
- else process.env[key] = value;
- }
  +});
-

+describe('CTG-0001 C-01-21 — idempotência HTTP de offline-sync', () => {

- it('dado Idempotency-Key repetida quando reenvia o mesmo lote e depois um corpo divergente então reproduz a resposta e recusa a divergência com 422', async () => {
- const idempotencyKey = `r21-http-${randomUUID()}`;
- const itemKey = `r21-http-${randomUUID()}`;
- const firstBody = body(randomUUID(), itemKey);
- const first = await request(app.getHttpServer())
-      .post('/v1/ops/offline-sync/sync-batches')
-      .set(headers(idempotencyKey))
-      .send(firstBody);
- expect(first.status, JSON.stringify(first.body)).toBe(200);
- expect(first.body.receipts[0]).toMatchObject({ status: 'applied' });
-
- const replay = await request(app.getHttpServer())
-      .post('/v1/ops/offline-sync/sync-batches')
-      .set(headers(idempotencyKey))
-      .send(firstBody);
- expect(replay.status).toBe(200);
- expect(replay.body).toEqual(first.body);
-
- const divergent = {
-      ...firstBody,
-      device_batch_id: `${firstBody.device_batch_id as string}-divergent`,
- };
- const rejected = await request(app.getHttpServer())
-      .post('/v1/ops/offline-sync/sync-batches')
-      .set(headers(idempotencyKey))
-      .send(divergent);
- expect(rejected.status).toBe(422);
- });
  +});
  diff --git a/backend/app/tests/e2e/r21-trust-profiles.e2e.spec.ts b/backend/app/tests/e2e/r21-trust-profiles.e2e.spec.ts
  new file mode 100644
  index 00000000..6cdc1398
  --- /dev/null
  +++ b/backend/app/tests/e2e/r21-trust-profiles.e2e.spec.ts
  @@ -0,0 +1,76 @@
  +import { Test } from '@nestjs/testing';
  +import { afterEach, describe, expect, it } from 'vitest';
-

+import { PadesSigningHttpAdapter } from '@detran/ch-clinical-reports'; +
+import { AppModule } from '../../src/app.module.js'; +
+const keys = [

- 'DETRAN_AUTH_MODE',
- 'DETRAN_CLINICAL_SIGNING_HEALTH_URL',
- 'DETRAN_CLINICAL_SIGNING_TOKEN',
- 'DETRAN_CLINICAL_SIGNING_URL',
- 'DETRAN_RUNTIME_PROFILE',
- 'STYNX_APP_DATABASE_URL',
- 'STYNX_COGNITO_ISSUER',
- 'STYNX_OWNER_DATABASE_URL',
- 'STYNX_READER_DATABASE_URL',
- 'STYNX_REDIS_URL',
- 'STYNX_SESSION_ISSUER',
- 'STYNX_SESSION_SIGNING_SECRET_ID',
  +] as const;
  +const original = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
-

+function configureNonLocal(): void {

- process.env.DETRAN_RUNTIME_PROFILE = 'staging-like';
- process.env.DETRAN_AUTH_MODE = 'cognito';
- process.env.STYNX_COGNITO_ISSUER = 'https://cognito.fixture.test/pool';
- process.env.STYNX_SESSION_ISSUER = 'https://sessions.fixture.test';
- process.env.STYNX_REDIS_URL = 'rediss://redis.fixture.test:6380';
- process.env.STYNX_SESSION_SIGNING_SECRET_ID = 'fixture/session-key';
- process.env.STYNX_OWNER_DATABASE_URL =
- 'postgresql://detran_owner:fixture@db.fixture.test/detran';
- process.env.STYNX_APP_DATABASE_URL =
- 'postgresql://detran_app:fixture@db.fixture.test/detran';
- process.env.STYNX_READER_DATABASE_URL =
- 'postgresql://detran_reader:fixture@db.fixture.test/detran';
- process.env.DETRAN_CLINICAL_SIGNING_URL = 'https://trust.fixture.test/sign';
- process.env.DETRAN_CLINICAL_SIGNING_HEALTH_URL =
- 'https://trust.fixture.test/health';
- process.env.DETRAN_CLINICAL_SIGNING_TOKEN = 'fixture-trust-token';
  +}
-

+afterEach(() => {

- for (const key of keys) {
- const value = original[key];
- if (value === undefined) delete process.env[key];
- else process.env[key] = value;
- }
  +});
-

+describe('R-0021 perfis de confiança', () => {

- it('dado perfil test sem serviço clínico quando a composição completa inicia então mantém serviços clínicos desligados', async () => {
- process.env.DETRAN_RUNTIME_PROFILE = 'test';
- delete process.env.DETRAN_CLINICAL_SIGNING_URL;
- delete process.env.DETRAN_CLINICAL_SIGNING_HEALTH_URL;
- delete process.env.DETRAN_CLINICAL_SIGNING_TOKEN;
-
- const module = await Test.createTestingModule({
-      imports: [AppModule.forRoot()],
- }).compile();
- await module.init();
- await module.close();
- });
-
- it('dado staging-like com endpoint clínico claro quando a composição externa é selecionada então a prontidão recusa sem fallback local', async () => {
- configureNonLocal();
- process.env.DETRAN_CLINICAL_SIGNING_URL = 'http://trust.fixture.test/sign';
-
- expect(AppModule.forRoot()).toMatchObject({ module: AppModule });
- await expect(
-      new PadesSigningHttpAdapter().checkCapabilities(),
- ).rejects.toThrow(
-      'DETRAN_CLINICAL_SIGNING_URL must use HTTPS outside local/test',
- );
- });
  +});
  diff --git a/backend/app/tests/integration/r21-renach-characterization.integration.spec.ts b/backend/app/tests/integration/r21-renach-characterization.integration.spec.ts
  new file mode 100644
  index 00000000..86eb09aa
  --- /dev/null
  +++ b/backend/app/tests/integration/r21-renach-characterization.integration.spec.ts
  @@ -0,0 +1,127 @@
  +import { randomUUID } from 'node:crypto';
  +import pg from 'pg';
  +import { afterAll, beforeAll, describe, expect, it } from 'vitest';
-

+const { Client } = pg;
+const connectionString = process.env.DETRAN_TEST_DATABASE_URL;
+const tenantA = randomUUID();
+const tenantB = randomUUID();
+const actorA = randomUUID();
+const actorB = randomUUID();
+const outboxA = randomUUID();
+const outboxB = randomUUID();
+const owner = new Client({ connectionString });
+const appA = new Client({ connectionString });
+const appB = new Client({ connectionString }); +
+async function asTenant<T>(

- client: pg.Client,
- tenantId: string,
- actorId: string,
- work: () => Promise<T>,
  +): Promise<T> {
- await client.query('begin');
- try {
- await client.query('set local role role_app_backend');
- await client.query("select set_config('app.tenant_id', $1, true)", [
-      tenantId,
- ]);
- await client.query("select set_config('app.actor_id', $1, true)", [
-      actorId,
- ]);
- const result = await work();
- await client.query('commit');
- return result;
- } catch (error) {
- await client.query('rollback');
- throw error;
- }
  +}
-

+beforeAll(async () => {

- if (!connectionString)
- throw new Error('DETRAN_TEST_DATABASE_URL is required');
- await Promise.all([owner.connect(), appA.connect(), appB.connect()]);
- await owner.query("select set_config('app.role', 'owner', false)");
- for (const [tenantId, actorId] of [
- [tenantA, actorA],
- [tenantB, actorB],
- ] as const) {
- await owner.query(
-      'insert into auth.tenants (id, slug, name) values ($1, $2, $3)',
-      [tenantId, `r21-renach-${tenantId}`, `R21 RENACH ${tenantId}`],
- );
- await owner.query(
-      "insert into auth.users (id, tenant_id, email, display_name) values ($1, $2, $3, 'R21 RENACH actor')",
-      [actorId, tenantId, `${actorId}@detran.invalid`],
- );
- }
- for (const [outboxId, tenantId] of [
- [outboxA, tenantA],
- [outboxB, tenantB],
- ] as const) {
- await owner.query(
-      `insert into integration.outbox
-        (id, tenant_id, topic, aggregate_type, aggregate_id, payload, idempotency_key)
-       values ($1, $2, 'ch.renach.exam-result', 'ch.report', $3, '{}'::jsonb, $4)`,
-      [
-        outboxId,
-        tenantId,
-        `fixture-report-${outboxId}`,
-        `r21-renach:${outboxId}`,
-      ],
- );
- }
  +});
-

+afterAll(async () => {

- try {
- await owner.query(
-      'delete from integration.outbox where id = any($1::uuid[])',
-      [[outboxA, outboxB]],
- );
- await owner.query('delete from auth.users where id = any($1::uuid[])', [
-      [actorA, actorB],
- ]);
- await owner.query('delete from auth.tenants where id = any($1::uuid[])', [
-      [tenantA, tenantB],
- ]);
- } finally {
- await Promise.all([owner.end(), appA.end(), appB.end()]);
- }
  +});
-

+describe('R-0021 isolamento persistido do RENACH', () => {

- it('dado outboxes RENACH de dois tenants quando o caminho app consulta e altera então só alcança o tenant do contexto', async () => {
- const own = await asTenant(appA, tenantA, actorA, async () =>
-      appA.query<{ id: string }>(
-        "select id from integration.outbox where topic = 'ch.renach.exam-result' order by id",
-      ),
- );
- expect(own.rows.map((row) => row.id)).toEqual([outboxA]);
-
- const foreign = await asTenant(appA, tenantA, actorA, async () =>
-      appA.query<{ id: string }>(
-        'select id from integration.outbox where id = $1',
-        [outboxB],
-      ),
- );
- expect(foreign.rows).toEqual([]);
-
- const update = await asTenant(appA, tenantA, actorA, async () =>
-      appA.query(
-        "update integration.outbox set status = 'acked' where id = $1",
-        [outboxB],
-      ),
- );
- expect(update.rowCount).toBe(0);
-
- const preserved = await asTenant(appB, tenantB, actorB, async () =>
-      appB.query<{ status: string }>(
-        'select status from integration.outbox where id = $1',
-        [outboxB],
-      ),
- );
- expect(preserved.rows).toEqual([{ status: 'pending' }]);
- });
  +});
  diff --git a/backend/domains/ch/clinical-reports/tests/unit/r21-signature-characterization.spec.ts b/backend/domains/ch/clinical-reports/tests/unit/r21-signature-characterization.spec.ts
  new file mode 100644
  index 00000000..ffe42b0d
  --- /dev/null
  +++ b/backend/domains/ch/clinical-reports/tests/unit/r21-signature-characterization.spec.ts
  @@ -0,0 +1,123 @@
  +import { afterEach, describe, expect, it, vi } from 'vitest';
-

+import { PadesSigningHttpAdapter } from '../../src/pades-signing.http-adapter.js'; +
+const keys = [

- 'DETRAN_CLINICAL_SIGNING_HEALTH_URL',
- 'DETRAN_CLINICAL_SIGNING_TOKEN',
- 'DETRAN_CLINICAL_SIGNING_URL',
- 'DETRAN_RUNTIME_PROFILE',
  +] as const;
  +const original = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  +const request = {
- documentType: 'REPORT' as const,
- contentSha256: 'a'.repeat(64),
- content: { encounterId: 'fixture-clinical-encounter' },
- signer: {
- professionalId: 'fixture-clinical-professional',
- name: 'Professional fixture',
- council: 'CRM/fixture',
- },
- minimumSignatureLevel: 'QUALIFIED' as const,
  +};
  +const receipt = {
- contentSha256: request.contentSha256,
- storageDocumentId: 'fixture-storage-document',
- artifactSha256: 'b'.repeat(64),
- signatureLevel: 'QUALIFIED',
- signatureFormat: 'PAdES-TSA',
- signedAt: '2026-09-27T12:00:00.000Z',
- tsaTime: '2026-09-27T12:00:01.000Z',
- certificateValidationSource: 'OCSP',
- certificateValidationStatus: 'GOOD',
- certificateValidatedAt: '2026-09-27T12:00:02.000Z',
  +};
-

+function configure(): void {

- process.env.DETRAN_RUNTIME_PROFILE = 'production';
- process.env.DETRAN_CLINICAL_SIGNING_URL = 'https://trust.fixture.test/sign';
- process.env.DETRAN_CLINICAL_SIGNING_HEALTH_URL =
- 'https://trust.fixture.test/health';
- process.env.DETRAN_CLINICAL_SIGNING_TOKEN = 'fixture-bearer-token';
  +}
-

+function response(body: unknown, ok = true, status = 200): Response {

- return {
- ok,
- status,
- json: vi.fn(async () => body),
- } as unknown as Response;
  +}
-

+afterEach(() => {

- vi.unstubAllGlobals();
- for (const key of keys) {
- const value = original[key];
- if (value === undefined) delete process.env[key];
- else process.env[key] = value;
- }
  +});
-

+describe('R-0021 assinatura clínica caracterizada', () => {

- it('dado recibo clínico completo quando renderiza e assina então preserva evidência e envia corpo HTTP com Bearer', async () => {
- configure();
- const fetch = vi.fn().mockResolvedValue(response(receipt));
- vi.stubGlobal('fetch', fetch);
-
- await expect(
-      new PadesSigningHttpAdapter().renderAndSign(request),
- ).resolves.toEqual(receipt);
- expect(fetch).toHaveBeenCalledWith(
-      'https://trust.fixture.test/sign',
-      expect.objectContaining({
-        method: 'POST',
-        headers: {
-          authorization: 'Bearer fixture-bearer-token',
-          'content-type': 'application/json',
-        },
-        body: JSON.stringify(request),
-      }),
- );
- });
-
- it.each([
- ['hash de conteúdo', { ...receipt, contentSha256: 'c'.repeat(64) }],
- ['hash do artefato', { ...receipt, artifactSha256: 'not-a-hash' }],
- ['storage', { ...receipt, storageDocumentId: '' }],
- ['formato', { ...receipt, signatureFormat: 'PAdES-B-LT' }],
- ['nível', { ...receipt, signatureLevel: 'BASIC' }],
- ['TSA', { ...receipt, tsaTime: '' }],
- ['certificado', { ...receipt, certificateValidationStatus: 'REVOKED' }],
- [
-      'fonte do certificado',
-      { ...receipt, certificateValidationSource: 'OTHER' },
- ],
- ])(
- 'dado recibo com %s divergente quando renderiza e assina então falha fechada',
- async (_name, invalidReceipt) => {
-      configure();
-      vi.stubGlobal(
-        'fetch',
-        vi.fn().mockResolvedValue(response(invalidReceipt)),
-      );
-
-      await expect(
-        new PadesSigningHttpAdapter().renderAndSign(request),
-      ).rejects.toThrow('invalid evidence receipt');
- },
- );
-
- it('dado backend ausente ou HTTP não-2xx quando assina então não produz recibo', async () => {
- configure();
- delete process.env.DETRAN_CLINICAL_SIGNING_TOKEN;
- await expect(
-      new PadesSigningHttpAdapter().renderAndSign(request),
- ).rejects.toThrow('is not configured');
-
- configure();
- vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response({}, false, 503)));
- await expect(
-      new PadesSigningHttpAdapter().renderAndSign(request),
- ).rejects.toThrow('HTTP 503');
- });
  +});
  diff --git a/backend/domains/ops/offline-sync/tests/integration/r21-offline-characterization.integration.spec.ts b/backend/domains/ops/offline-sync/tests/integration/r21-offline-characterization.integration.spec.ts
  new file mode 100644
  index 00000000..c7277a8c
  --- /dev/null
  +++ b/backend/domains/ops/offline-sync/tests/integration/r21-offline-characterization.integration.spec.ts
  @@ -0,0 +1,105 @@
  +import { randomUUID } from 'node:crypto';
  +import type pg from 'pg';
  +import { afterAll, beforeAll, describe, expect, it } from 'vitest';
-

+import {

- database,
- dropTenant,
- isolatedTenant,
- newClient,
- seedField,
  +} from './harness.js';
-

+const client: pg.Client = newClient();
+let tenantA: { tenantId: string; actorId: string };
+let tenantB: { tenantId: string; actorId: string };
+let tenantBQueueItemId: string; +
+beforeAll(async () => {

- await client.connect();
- tenantA = await isolatedTenant(client, 'r21-rls-a');
- tenantB = await isolatedTenant(client, 'r21-rls-b');
- await seedField(client, tenantA.tenantId, tenantA.actorId);
- await seedField(client, tenantB.tenantId, tenantB.actorId);
- await client.query(`select set_config('app.role', 'owner', false)`);
- const inserted = await client.query<{ id: string }>(
- `insert into ops.sync_queue_item
-       (id, tenant_id, traffic_agency_id, device_id, agent_id, entity_type,
-        local_entity_id, status, created_locally_at, idempotency_key,
-        payload_hash, payload_json)
-     select $1, $2, traffic_agency_id, device_id, agent_id, 'ait', $3,
-            'received', '2026-09-14T13:05:00.000Z', $4,
-            'sha256:r21-tenant-b', '{}'::jsonb
-       from ops.ops_shift where tenant_id = $2 limit 1
-     returning id`,
- [
-      randomUUID(),
-      tenantB.tenantId,
-      randomUUID(),
-      `r21-tenant-b-${randomUUID().slice(0, 8)}`,
- ],
- );
- tenantBQueueItemId = inserted.rows[0]!.id;
  +});
-

+afterAll(async () => {

- await dropTenant(client, tenantB.tenantId);
- await dropTenant(client, tenantA.tenantId);
- await client.end();
  +});
-

+describe('CTG-0001 C-01-28 — RLS de offline-sync', () => {

- it('dado tenant A sob role_app_backend quando consulta e atualiza o item real de B então não o lê, o update tem rowCount zero e B o preserva', async () => {
- const tenantADatabase = database(client, tenantA.tenantId, tenantA.actorId);
- const hiddenRows = await tenantADatabase.tx(
-      async (tx) =>
-        (
-          await (
-            tx as {
-              query<T extends Record<string, unknown>>(
-                sql: string,
-                values: readonly unknown[],
-              ): Promise<{ rows: T[] }>;
-            }
-          ).query(`select id from ops.sync_queue_item where tenant_id = $1`, [
-            tenantB.tenantId,
-          ])
-        ).rows,
- );
- expect(hiddenRows).toEqual([]);
-
- const update = await tenantADatabase.tx(async (tx) =>
-      (
-        tx as {
-          query<T extends Record<string, unknown>>(
-            sql: string,
-            values: readonly unknown[],
-          ): Promise<{ rows: T[]; rowCount: number | null }>;
-        }
-      ).query(
-        `update ops.sync_queue_item set status = 'applied' where id = $1
-         returning id`,
-        [tenantBQueueItemId],
-      ),
- );
- expect(update.rowCount).toBe(0);
- expect(update.rows).toEqual([]);
-
- const tenantBDatabase = database(client, tenantB.tenantId, tenantB.actorId);
- const preserved = await tenantBDatabase.tx(async (tx) =>
-      (
-        tx as {
-          query<T extends Record<string, unknown>>(
-            sql: string,
-            values: readonly unknown[],
-          ): Promise<{ rows: T[] }>;
-        }
-      ).query(`select id, status from ops.sync_queue_item where id = $1`, [
-        tenantBQueueItemId,
-      ]),
- );
- expect(preserved.rows).toEqual([
-      { id: tenantBQueueItemId, status: 'received' },
- ]);
- });
  +});
  diff --git a/backend/domains/shared/src/documents/r21-document-trust-characterization.spec.ts b/backend/domains/shared/src/documents/r21-document-trust-characterization.spec.ts
  new file mode 100644
  index 00000000..2c445658
  --- /dev/null
  +++ b/backend/domains/shared/src/documents/r21-document-trust-characterization.spec.ts
  @@ -0,0 +1,92 @@
  +import { afterEach, describe, expect, it, vi } from 'vitest';
-

+import { DocumentTrustHttpAdapter } from './document-trust.http-adapter.js'; +
+const keys = [

- 'DETRAN_DOCUMENT_TRUST_HEALTH_URL',
- 'DETRAN_DOCUMENT_TRUST_TOKEN',
- 'DETRAN_DOCUMENT_TRUST_URL',
- 'DETRAN_RUNTIME_PROFILE',
  +] as const;
  +const original = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
-

+function configure(profile = 'test'): void {

- process.env.DETRAN_RUNTIME_PROFILE = profile;
- process.env.DETRAN_DOCUMENT_TRUST_URL = 'http://trust.fixture.test/verify';
- process.env.DETRAN_DOCUMENT_TRUST_HEALTH_URL =
- 'http://trust.fixture.test/health';
- process.env.DETRAN_DOCUMENT_TRUST_TOKEN = 'fixture-document-token';
  +}
-

+function response(body: unknown): Response {

- return {
- ok: true,
- status: 200,
- json: vi.fn(async () => body),
- } as unknown as Response;
  +}
-

+afterEach(() => {

- vi.unstubAllGlobals();
- for (const key of keys) {
- const value = original[key];
- if (value === undefined) delete process.env[key];
- else process.env[key] = value;
- }
  +});
-

+describe('R-0021 confiança documental caracterizada', () => {

- it('dado capacidades completas quando confere prontidão então usa health autenticado', async () => {
- configure();
- const fetch = vi.fn().mockResolvedValue(
-      response({
-        documentManifest: true,
-        padesLt: true,
-        tsa: true,
-        withdrawalEvidence: true,
-        certificateValidation: ['CRL'],
-      }),
- );
- vi.stubGlobal('fetch', fetch);
-
- await expect(
-      new DocumentTrustHttpAdapter().checkCapabilities(),
- ).resolves.toBeUndefined();
- expect(fetch).toHaveBeenCalledWith(
-      'http://trust.fixture.test/health',
-      expect.objectContaining({
-        headers: { authorization: 'Bearer fixture-document-token' },
-      }),
- );
- });
-
- it('dado backend ausente, capacidades parciais ou HTTP claro em produção quando verifica então falha fechada', async () => {
- configure();
- delete process.env.DETRAN_DOCUMENT_TRUST_TOKEN;
- await expect(
-      new DocumentTrustHttpAdapter().checkCapabilities(),
- ).rejects.toThrow('is not configured');
-
- configure();
- vi.stubGlobal(
-      'fetch',
-      vi.fn().mockResolvedValue(
-        response({
-          documentManifest: true,
-          padesLt: true,
-          tsa: false,
-          withdrawalEvidence: true,
-          certificateValidation: [],
-        }),
-      ),
- );
- await expect(
-      new DocumentTrustHttpAdapter().checkCapabilities(),
- ).rejects.toThrow('lacks required capabilities');
-
- configure('production');
- await expect(
-      new DocumentTrustHttpAdapter().checkCapabilities(),
- ).rejects.toThrow('must use HTTPS');
- });
  +});
  diff --git a/docs/meta/knowledge-base/open-decisions-rait.md b/docs/meta/knowledge-base/open-decisions-rait.md
  index 3b21604b..9f49808d 100644
  --- a/docs/meta/knowledge-base/open-decisions-rait.md
  +++ b/docs/meta/knowledge-base/open-decisions-rait.md
  @@ -390,3 +390,26 @@ Nota de implementacao A7: a fixture local tambem cria/reativa somente
  leituras do smoke passem pela tenancy/RLS normal. Isso nao amplia a decisao
  OD-R17-004: nenhuma role, grupo, permissao, policy, fixture canonica ou
  banco fora de `detran_local_stack` e alterado.
-

+## C-0002 — STYNX e escopo revisto de R-0021 (2026-09-27) +
+Registro canônico das decisões já tomadas pelo **Owner**. A transcrição pelo Architect não
+reabre decisões. Fontes: plano aprovado nesta sessão; `work/rounds/R-0021/plan.md` e +`AUTHORIZATION.md`; campanha C-0002 A11; especificação upstream §8.1/A1. As recomendações
+anteriores de R-0021/R-0022 são históricas quando divergirem destas decisões. +
+| ID | Questão | Decisão do Owner e efeito | Estado |
+| --------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
+| OD-S15-01 | Escopo e consumo do STYNX 1.5.0 | Decidida em 2026-09-26: U1–U15 obrigatórios; desenvolver/testar sobre RC publicada permitido, merge só na 1.5.0 final conforme; UPS-TEN-01 opção (b), middleware anterior aos guards/interceptors; UPS-TEN-02 rejeita Host × cabeçalho divergentes. Preservada; SIG/OBX/OFS confirmados por A1. | Fechada |
+| OD-R21-01 | Lacunas de assinatura na 1.4.0 | Transferir a migração inteira para R-0022, aguardando suporte upstream; não mover contornos atrás de fachada em R-0021. UPS-SIG-01…04 MUST para a migração, com paridade provada. | Fechada |
+| OD-R21-02 | Escopo da troca de outbox | Opção (b): transferir tudo para R-0022, inclusive despacho RENACH, log de eventos e ledger. Nenhuma troca parcial em R-0021; UPS-OBX-01…02 MUST para a migração. | Fechada |
+| OD-R21-03 | Adoção de notifications | Opção (b): registrar ausência de reimplementação local e adotar junto do produtor OD-P40. Sem módulo/DDL sem consumidor em R-0021; notificação legal continua domínio DETRAN. | Fechada |
+| OD-R21-04 | Compatibilidade e migração offline-sync | Caracterizar e especificar requisitos em R-0021; transferir migração inteira para R-0022, incluindo itens antes atribuídos a R-0024. UPS-OFS-01…04 e compatibilidade da spec A1 MUST; ausência bloqueia migração, sem novos contornos. | Fechada |
+| OD-R21-05 | Conclusão com critérios transferidos | Concluir o escopo revisto e emitir `round close`, sem `round seal`; preservar os critérios históricos das migrações como não cumpridos (`fail`) e o destino R-0022. Registrar a incompatibilidade conhecida do DEVAI 1.5.6 com selo de critérios `fail`, sem contornar alterando resultados. | Fechada |
+| OD-R21-06 | Preparação, execução, revisões e orçamento R-0021 | Astra materializa os artefatos; após PASS do Opus 5.5 pela ponte, maestro em sessão limpa `gpt-6-sol`/`high`. Autoriza até quatro ciclos de revisão por item e até 2,25 milhões de tokens de entrada por janela, checkpoint em 1,8 milhão; demais gates permanecem. | Fechada | + +**Fronteira de autorização:** estas decisões não abrem R-0022, não autorizam alterações no STYNX
+e não afirmam que o upstream aceitou, publicou ou implementou os requisitos. A igualdade dos
+arquivos próprios de signature/outbox/offline-sync entre 1.4.0 e RC.2 está comprovada pelos
+artefatos e hashes da spec A1; RC.3 local não libera consumo. A conformidade futura será
+registrada a partir da publicação e das provas, sem reabrir OD-S15-01.
diff --git a/work/campaigns/C-0002-consolidacao.md b/work/campaigns/C-0002-consolidacao.md
index 4065f701..fb065529 100644
--- a/work/campaigns/C-0002-consolidacao.md
+++ b/work/campaigns/C-0002-consolidacao.md
@@ -287,3 +287,30 @@ Efeitos:

- **R-0024:** adota U8–U15 sem exceção, incluindo a avaliação e a migração do gerador de blueprints
  para `stynx generate module`.
- **S-1.5:** escopo máximo, com estimativa recalibrada no seu bootstrap.

*

+## 11. Adenda A11 — escopo revisto de R-0021 e transferências (2026-09-27) + +**Decisão do Owner:** plano de execução revisto aprovado nesta sessão; registro canônico em +`docs/meta/knowledge-base/open-decisions-rait.md` §C-0002. Esta adenda prevalece sobre A5 e
+sobre as descrições históricas de ações 7a/7c que presumam migrações concluídas em R-0021. +
+- **R-0021:** caracterização do comportamento atual, pin exato 1.4.0, gate dinâmico de versões e

- adenda A1 da especificação upstream. Migrações de assinatura (OD-R21-01), outbox inteira,
- incluindo despacho RENACH (OD-R21-02), e offline-sync inteira (OD-R21-04) passam a R-0022.
  +- **R-0022:** recebe as três migrações integrais e seus testes de paridade. Não parte de fachada,
- deduplicação ou despacho já migrados. Requisitos MUST da spec A1 ausentes bloqueiam o CTG
- consumidor, sem novo contorno. Isso substitui a atribuição histórica de extras offline a R-0024.
- Consumo de RC e merge só na 1.5.0 final continuam regidos por OD-S15-01.
  +- **Notificações:** adoção de `StynxNotificationsModule` junto do produtor OD-P40 (OD-R21-03),
- sem módulo ou DDL sem consumidor em R-0021.
  +- **Fechamento R-0021:** emitir `round close`, preservando os critérios das migrações como não
- cumpridos (`fail`); não emitir/apresentar selo de conclusão. A limitação conhecida do DEVAI
- 1.5.6 para selo com critérios `fail` é registrada, sem alterar resultados (OD-R21-05).
  +- **Preparação e execução:** Astra materializa e revisa os artefatos; após PASS independente
- do Opus 5.5 pela ponte, maestro em sessão limpa `gpt-6-sol`/`high`. Até quatro ciclos de revisão
- por item e 2,25 milhões de tokens de entrada por janela, com checkpoint em 1,8 milhão
- (OD-R21-06); demais gates e condições bloqueantes permanecem.
-

+Não abre R-0022 e não autoriza escrita, release ou execução no STYNX. A comparação publicada
+1.4.0 × RC.2 dos três pacotes está documentada com hashes na spec A1; RC.3 local não constitui
+prova de publicação. As decisões OD-S15-01 permanecem fechadas.
diff --git a/work/campaigns/C-0002-stynx-upstream-spec.md b/work/campaigns/C-0002-stynx-upstream-spec.md
index e99372a8..c1535894 100644
--- a/work/campaigns/C-0002-stynx-upstream-spec.md
+++ b/work/campaigns/C-0002-stynx-upstream-spec.md
@@ -1,5 +1,7 @@

# C-0002 — especificação upstream única para o STYNX 1.5.0 (rodada S-1.5)

+> **Leitura vigente — adenda A1 de 2026-09-27 (§8.1):** UPS-SIG-01…04, UPS-OBX-01…02 e UPS-OFS-01…04 confirmados como MUST para suas migrações integrais em R-0022. As seções anteriores preservam a proposta histórica; A1 prevalece nas divergências. Não constitui autorização ou prova de execução upstream. +

> **Adenda A3 da campanha (2026-09-26):** a migração de `dashCan` é feita em R-0024, não em R-0023.

**Autoridade:** Architect do DETRAN (Constitution Art. 6). **Status:** proposta — C-0002 rev. 2,
@@ -359,3 +361,78 @@ do Owner quando mudar escopo ou nível. Sem adendas em 2026-09-26.

O registro canônico da OD é `docs/meta/knowledge-base/open-decisions-rait.md` (seção C-0002), no PR
de CTG-0001 de R-0021, que é a primeira rodada da campanha a consumir esta especificação. +
+## 8.1. Adenda A1 — lacunas confirmadas por R-0021 (2026-09-27) + +**Papel:** Architect, Constituição Art. 7; autoridade por caminho no Art. 6. +**Autoridade da mudança:** plano revisto de R-0021 aprovado pelo Owner nesta sessão;
+OD-R21-01, OD-R21-02 e OD-R21-04 no registro canônico. Esta adenda confirma requisitos de
+consumo, sem declarar aprovação, publicação ou implementação pelo STYNX. OD-S15-01 permanece
+fechada, inclusive consumo de RC para desenvolvimento e merge somente com 1.5.0 final. +
+### Evidência e regra de consumo +
+Comparação dos tarballs publicados 1.4.0 e 1.5.0-rc.2: os arquivos próprios `.js` e `.d.ts`
+sob `package/dist/<pacote>/` são idênticos byte a byte (signature: 34; outbox: 22;
+offline-sync: 20). O restante de `dist/` contém outros pacotes e não integra essa conclusão.
+A RC.2 não resolve as lacunas abaixo. Fonte local de uma RC posterior, inclusive RC.3,
+não comprova API publicada nem conformidade. Revalidar a release consumida na abertura de R-0022. +
+| Pacote | Versão | SHA-256 do tarball |
+| ------------ | ---------- | ------------------------------------------------------------------ |
+| signature | 1.4.0 | `207def517d26b754da911052de8eb62406f3d43140a5565725722d5d6cbed1eb` |
+| signature | 1.5.0-rc.2 | `8209e1dd42ff23073d825fc5fa213078a9c9382e0f3be344c259df1134850607` |
+| outbox | 1.4.0 | `0bf68d6dfc0977925ffe2fbca297c90fc783a5698952b410942fb50e66eb9da1` |
+| outbox | 1.5.0-rc.2 | `6df718055ff04fd2708db71360ffc169a74f5060e1c5aa54586dc37857c5d356` |
+| offline-sync | 1.4.0 | `5d36d734da4551da626da5c03add852368035f506bc5e1145473a8c20bc89584` |
+| offline-sync | 1.5.0-rc.2 | `77a0076c3f5f22edee309a270c2137a02476040883f3148f8fcd140a172762af` | +
+Todos os requisitos desta adenda são **MUST para o CTG consumidor em R-0022**, inclusive
+os antes SHOULD. Falta de API pública ou de comportamento equivalente bloqueia a migração
+afetada; não autoriza novo contorno, cópia do STYNX ou redução da caracterização. Adaptadores
+finos podem traduzir nomes e envelopes e aplicar regras de negócio DETRAN; não podem reconstruir
+o mecanismo genérico ausente. As migrações de assinatura, outbox e offline-sync são transferidas +**inteiras**; R-0021 não deixa uma fachada já migrada, despacho já convertido ou deduplicação
+já substituída. Os critérios históricos transferidos permanecem não cumpridos em R-0021. +
+### Requisitos confirmados e provas exigidas +
+| ID | Nível | Comportamento exigido e prova de paridade |
+| ---------- | ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
+| UPS-SIG-01 | MUST | Pedido e resultado expressam nível mínimo ADVANCED/QUALIFIED; resultado inferior, backend ausente ou evidência inválida falham fechados. Provar assinatura válida, inválida, indisponibilidade e matriz de perfis/configurações de ADR-0018, mantendo os negativos dos adapters clínicos e de juntas. |
+| UPS-SIG-02 | MUST | Prontidão verifica as capacidades exigidas pelo consumidor (PAdES, TSA, LTA, OCSP/CRL), com erro tipado e integração de health; capacidade ausente torna o serviço não pronto. Provar presença/ausência por capacidade e restrições dos perfis sem declarar backend simulado apto em produção. |
+| UPS-SIG-03 | MUST | Manifestos canônicos de atas de sessão e lote com evidência verificável por signatário, PAdES/certificado e instante real de assinatura; preservar vínculo documento–manifesto–signatário. Provar manifesto válido, adulterado, signatário/evidência ausente e falha de confiança; digest isolado ou instante época zero não satisfazem o requisito. |
+| UPS-SIG-04 | MUST | Verificar evidência de retirada/revogação, preservando vínculo ao documento e autoria; prova válida aceita e evidência adulterada ou referente a outro documento recusa. Preservar resultados da porta `verifyWithdrawalEvidence`. |
+| UPS-OBX-01 | MUST | Oferecer append de eventos sem sobrescrever fatos distintos do mesmo agregado, deduplicação por `(tenant_id, idempotency_key)` e leitura ordenada por `(created_at, id)`, compatível com UPS-SSE-03. Provar dois eventos do mesmo agregado preservados, replay sem duplicata, cursor estável e isolamento entre tenants; distinguir log de eventos e fila de despacho. |
+| UPS-OBX-02 | MUST | Preservar despacho/ACK RENACH e ledger de tentativas com hashes de requisição/resposta e protocolo do provedor. Provar retry, resultado, ACK válido/inválido e vínculo da tentativa ao evento/tenant; migração de storage deve conservar pendências e trilha histórica, sem entrega duplicada ou perda de evento. |
+| UPS-OFS-01 | MUST | Reservar, cancelar, bloquear, fechar, reconciliar/liquidar e consultar consumo de numeração mantendo transições, números consumidos, ausência de sobreposição e TTL resolvido no catálogo do tenant/órgão (`teat.numbering.reservation_ttl_hours`), não substituído por 24 h fixas. Provar concorrência com banco real, expiração e isolamento de tenant; identidade do agente é distinta do ator autenticado quando o protocolo permite. |
+| UPS-OFS-02 | MUST | Persistir/consultar recibos e preservar idempotência de item por tenant+chave+hash e identidade do lote por tenant/dispositivo/device_batch_id, sequência e conjunto de chaves declaradas. Provar replay do ACK perdido sem novo efeito, divergência de contexto 409, sequência repetida 409, lacuna 422, integridade divergente com recibo rejeitado/conflito e mesmos envelopes públicos. |
+| UPS-OFS-03 | MUST | Porta de aplicação de item ao domínio na mesma transação de efeito, consumo, recibo e evento. Preservar TEAT e BOAT, rejeição por item e processamento parcial previsto; falha interna reverte o conjunto atômico do item. Provar rollback real, repetição sem efeito duplicado e ausência de leitura/escrita cross-tenant. |
+| UPS-OFS-04 | MUST | Detector configurável de concorrência por janela, agente e dispositivos, com exceção por handoff autorizado e resolução de conflitos equivalente. Preservar as ações e transições de resolução atuais, sem equiparar mecanicamente `device-wins`/`server-wins` às operações DETRAN. Provar suspeita nos dois atos afetados, handoff, janela ausente/desligada, resolução permitida/proibida e isolamento. | +
+### Compatibilidade offline vinculante (UPS-OFS-01…04) +
+- Preservar rotas, status HTTP, envelopes e códigos públicos existentes; a caracterização R-0021

- será a prova antes/depois, incluindo HTTP real de TEAT e BOAT. O tenant provém do contexto
- confiável; campos enviados pelo cliente não o substituem. Preservar `agent_id` de negócio e
- `actorId` auditável sem assumir igualdade; associação/autorização continuam verificadas pelo app.
  +- Lotes legados sem `batch_sequence` continuam aceitos; itens sem `idempotency_key` usam a
- chave sintética existente e ficam `received` com `TEAT.SYNC_LEGACY_ITEM_NOT_APPLIED`, sem
- aplicar ao domínio. A plataforma precisa representar esse estado, não inventar chaves para
- aplicar automaticamente o legado.
  +- A entrada atual aceita `items` com ao menos um item sem máximo de 100 no schema. O limite fixo
- de 100 da 1.4.0 não pode rejeitar lotes hoje válidos; oferecer configuração compatível e provar
- lote com mais de 100 itens. Manter limites já definidos pelo contrato público para strings,
- hashes, UUIDs e numeração; novos limites exigem decisão do Owner, não tradução silenciosa.
  +- Operações de faixa, resolução e lote preservam seus efeitos e recibos; disponibilidade de
- método com nome semelhante não é equivalência semântica. Provar replay de lote fechado e
- divergência do conjunto declarado, conflitos de hash, consulta de recibos e consumo.
  +- TTL e janela de concorrência são dados do catálogo e podem variar por escopo. A porta upstream
- deve permitir resolução por operação com relógio testável, não exigir configuração global
- fixa nem calcular novos valores de negócio. Preservar a política existente para parâmetro ausente.
-

+**Fontes locais verificadas:** `backend/domains/ops/offline-sync/src/handwritten/` (especialmente +`submit-batch.command.ts`, `submit-batch.spec.ts`, `reserve-numbering.command.ts`, +`settle-numbering.command.ts`), contratos e testes citados no inventário de R-0021, ADR-0018,
+ADR-0036 e `backend/database/ddl/04-integration-storage.sql`. O nome dos símbolos upstream
+continua proposto: a tabela §7 só será preenchida com release, API e testes efetivamente publicados.
diff --git a/work/rounds/R-0021/AUTHORIZATION.md b/work/rounds/R-0021/AUTHORIZATION.md
new file mode 100644
index 00000000..c52761d6
--- /dev/null
+++ b/work/rounds/R-0021/AUTHORIZATION.md
@@ -0,0 +1,19 @@
+# R-0021 — autorização do Owner +
+Papel: Architect. Fonte: instrução do Owner nesta conversa, seguida de aprovação expressa do plano de implementação em 2026-09-27 (America/Sao_Paulo). +
+O Owner autorizou executar R-0021 até concluir o escopo revisto, incluindo preparação Astra, workers, revisão independente, evidência, PRs e merges com checks verdes. Preparação e materialização: GPT-6 Astra. Orquestração após prompt-review PASS: `gpt-6-sol`, esforço `high`, sessão limpa. Reviewer: `claude-opus-5-5`, ponte existente. +
+## Adenda A1 — decisões vinculantes +
+- OD-R21-01: aguardar suporte upstream; transferir toda a migração de assinatura para R-0022. Não mover contornos nem montar o módulo nesta rodada.
+- OD-R21-02: transferir toda a migração de outbox para R-0022, incluindo despacho RENACH.
+- OD-R21-03: notificações serão adotadas com o produtor de OD-P40; não montar módulo sem produtor.
+- Offline-sync: exigir suporte upstream que preserve o protocolo; transferir toda a migração para R-0022. Nesta rodada, caracterização e requisitos verificáveis.
+- R-0021 entrega inventário, caracterização antes/depois, pin 1.4.0, verificador e adenda upstream. Atualizar planos consumidores sem iniciar R-0022 nem escrever no STYNX.
+- Fechar formalmente com `round close`. Critérios originais transferidos permanecem como não cumpridos (`fail`), com esta decisão como fonte. O Owner aprovou **fechar sem selo**: DEVAI 1.5.6 rejeita `round seal` com critérios `fail`. Nunca convertê-los para PASS/N/A para obter selo.
+- Revisões: até quatro ciclos por item, incluindo o primeiro. Primeiro exaustivo; seguintes somente correções. Nenhuma dispensa de FAIL constitucional, fail-open ou vazamento entre tenants.
+- Orçamento por janela: entrada até 2.250.000 tokens, checkpoint preventivo em 1.800.000, janela de 5 horas. Registrar estimativas de entrada/saída de Astra, Sol, workers e reviewer.
+- Ambiente: bancos descartáveis exclusivos da rodada e operações de preparação/reset desses bancos são autorizados; nunca bancos de outra frente. Nenhuma integração externa real. +
+Preparação física: worktree gerenciada `/Users/aarusso/.codex/worktrees/stynx-canonical/detran`; branch `orchestra/stynx-canonical`; base `e47a68014ffdd24e1f9da03c4fc9e1b78ecf381b` (R-0017 mesclada). Raiz e repositórios irmãos preservados.
diff --git a/work/rounds/R-0021/budget.json b/work/rounds/R-0021/budget.json
new file mode 100644
index 00000000..e0270006
--- /dev/null
+++ b/work/rounds/R-0021/budget.json
@@ -0,0 +1,83 @@
+{

- "round_id": "R-0021",
- "unit": "estimated_unique_input_tokens",
- "initial_input_limit": 750000,
- "authorized_multiplier": 3,
- "window_input_limit": 2250000,
- "checkpoint_input_threshold": 1800000,
- "window_hours": 5,
- "max_review_cycles_per_item": 4,
- "window_started_at": "2026-09-28T01:13:56.271872+00:00",
- "entries": [
- {
-      "id": "astra-plan",
-      "role": "architect",
-      "model": "gpt-6-astra",
-      "input_estimate": 130000,
-      "output_estimate": 12000,
-      "note": "Planejamento aprovado, an\u00e1lise publicada de RC2, estimativa inclui subagente de inspe\u00e7\u00e3o."
- },
- {
-      "id": "astra-materialization",
-      "role": "architect",
-      "model": "gpt-6-astra",
-      "input_estimate": 100000,
-      "output_estimate": 20000,
-      "note": "Reserva estimada, atualizar com prepara\u00e7\u00e3o efetiva; inclui contratos e documenta\u00e7\u00e3o delegados."
- },
- {
-      "id": "prompt-review-1",
-      "role": "auditor",
-      "model": "claude-opus-5-5",
-      "input_estimate": 65000,
-      "output_estimate": 4000,
-      "result": "REVIEW",
-      "note": "5 high e 4 low; todos endere\u00e7ados pelo Architect, sem execu\u00e7\u00e3o de workers."
- },
- {
-      "id": "prompt-review-2",
-      "role": "auditor",
-      "model": "claude-opus-5-5",
-      "input_estimate": 35000,
-      "output_estimate": 3000,
-      "result": "transport-error",
-      "note": "Conclus\u00e3o textual PASS, mas cerca Markdown rejeitada pela ponte; n\u00e3o utilizada como gate."
- },
- {
-      "id": "prompt-review-3",
-      "role": "auditor",
-      "model": "claude-opus-5-5",
-      "input_estimate": 18000,
-      "output_estimate": 1200,
-      "result": "PASS",
-      "note": "Corre\u00e7\u00f5es confirmadas, hashes conferidos, JSON aceito pela ponte."
- },
- {
-      "id": "sol-ctg0001-orchestration",
-      "role": "architect",
-      "model": "gpt-6-sol",
-      "input_estimate": 85000,
-      "output_estimate": 17000,
-      "result": "gates-pass",
-      "note": "Estimativa \u00fanica para leitura, bancos, triagem e gates do CTG-0001; bruto da sess\u00e3o n\u00e3o exposto pelo runtime."
- },
- {
-      "id": "task-0002",
-      "role": "inspector",
-      "model": "gpt-5.6-terra",
-      "input_estimate": 30000,
-      "output_estimate": 6500,
-      "result": "PASS",
-      "note": "Native worker medium; uma itera\u00e7\u00e3o restrita de limpeza de fixture. Bruto n\u00e3o exposto."
- },
- {
-      "id": "task-0003",
-      "role": "inspector",
-      "model": "gpt-5.6-terra",
-      "input_estimate": 30000,
-      "output_estimate": 6000,
-      "result": "PASS",
-      "note": "Native worker medium; uma itera\u00e7\u00e3o restrita de prova RLS. Bruto n\u00e3o exposto."
- }
- ]
  +}
  diff --git a/work/rounds/R-0021/compositions.json b/work/rounds/R-0021/compositions.json
  new file mode 100644
  index 00000000..d6751a53
  --- /dev/null
  +++ b/work/rounds/R-0021/compositions.json
  @@ -0,0 +1,122 @@
  +[
- {
- "task_id": "TASK-0001",
- "prompt_path": "work/rounds/R-0021/prompts/TASK-0001.md",
- "sha256": "0b3d3888628aac2b31467e9d172ea4fa1ff5af603e13f7c2ea6cf37fb59cae68",
- "pc_id": "PC-0b3d3888628aac2b",
- "model": "gpt-6-astra",
- "effort": "high"
- },
- {
- "task_id": "TASK-0002",
- "prompt_path": "work/rounds/R-0021/prompts/TASK-0002.md",
- "sha256": "b9433d5c16171dca822cd540f66502c901ce759a16e84c09cac4c778fcf336d3",
- "pc_id": "PC-b9433d5c16171dca",
- "model": "gpt-5.6-terra",
- "effort": "medium"
- },
- {
- "task_id": "TASK-0003",
- "prompt_path": "work/rounds/R-0021/prompts/TASK-0003.md",
- "sha256": "06b320f2c7fcc807e2fcee04bef904a089cd458e667ac853d3a9cf0ede5b1ebc",
- "pc_id": "PC-06b320f2c7fcc807",
- "model": "gpt-5.6-terra",
- "effort": "medium"
- },
- {
- "task_id": "TASK-0004",
- "prompt_path": "work/rounds/R-0021/prompts/TASK-0004.md",
- "sha256": "3a56912b734e5eed67f4148eb1545fc4e378c43616238b64880836e234430b9b",
- "pc_id": "PC-3a56912b734e5eed",
- "model": "gpt-6-luna",
- "effort": "medium"
- },
- {
- "task_id": "TASK-0005",
- "prompt_path": "work/rounds/R-0021/prompts/TASK-0005.md",
- "sha256": "5dd975fdd5965cdc11edf59e1172700fac681565f305fe451d9c952855f4f97a",
- "pc_id": "PC-5dd975fdd5965cdc",
- "model": "gpt-6-sol",
- "effort": "high"
- },
- {
- "task_id": "TASK-0006",
- "prompt_path": "work/rounds/R-0021/prompts/TASK-0006.md",
- "sha256": "be627d4beaf26f07e5213e7a6bbcdf359c39ac2094dcede522757c854bc74823",
- "pc_id": "PC-be627d4beaf26f07",
- "model": "gpt-5.6-terra",
- "effort": "medium"
- },
- {
- "task_id": "TASK-0007",
- "prompt_path": "work/rounds/R-0021/prompts/TASK-0007.md",
- "sha256": "1492e45e6ea9a322f959d0e6d519c187abdf18a6ab2eb4e44920379ab06ef749",
- "pc_id": "PC-1492e45e6ea9a322",
- "model": "gpt-6-sol",
- "effort": "medium"
- },
- {
- "task_id": "TASK-0008",
- "prompt_path": "work/rounds/R-0021/prompts/TASK-0008.md",
- "sha256": "78691d30e7f0c3d12e17e19125c53890cb40e2192e622119d3a7007f0b7a29ef",
- "pc_id": "PC-78691d30e7f0c3d1",
- "model": "gpt-6-sol",
- "effort": "high"
- },
- {
- "task_id": "TASK-0009",
- "prompt_path": "work/rounds/R-0021/prompts/TASK-0009.md",
- "sha256": "de321a6f97544d46bb833cf05f60b54e94340b500da58cad3fcb46c35562b225",
- "pc_id": "PC-de321a6f97544d46",
- "model": "gpt-5.6-terra",
- "effort": "medium"
- },
- {
- "task_id": "TASK-0010",
- "prompt_path": "work/rounds/R-0021/prompts/TASK-0010.md",
- "sha256": "ea939e217ce00016ea15b1acd9c24d04d48584f87bd2c25e70d1e79564a6984e",
- "pc_id": "PC-ea939e217ce00016",
- "model": "gpt-6-sol",
- "effort": "medium"
- },
- {
- "task_id": "TASK-0011",
- "prompt_path": "work/rounds/R-0021/prompts/TASK-0011.md",
- "sha256": "27d67b56d31ecb9448a9c56a2063dfab5b43273971a5cd99c81539db24d6689f",
- "pc_id": "PC-27d67b56d31ecb94",
- "model": "gpt-6-sol",
- "effort": "high"
- },
- {
- "task_id": "TASK-0012",
- "prompt_path": "work/rounds/R-0021/prompts/TASK-0012.md",
- "sha256": "76a3aa065cbdc6a52bdcb169f0ff786703c679fd684f7a52576e472d4eb49352",
- "pc_id": "PC-76a3aa065cbdc6a5",
- "model": "gpt-5.6-terra",
- "effort": "medium"
- },
- {
- "task_id": "TASK-0013",
- "prompt_path": "work/rounds/R-0021/prompts/TASK-0013.md",
- "sha256": "804708dc7b7af06dd3ae3cdf906d6f5ed81e2f3855450fb113fa722563411d0d",
- "pc_id": "PC-804708dc7b7af06d",
- "model": "gpt-6-sol",
- "effort": "medium"
- },
- {
- "task_id": "TASK-0014",
- "prompt_path": "work/rounds/R-0021/prompts/TASK-0014.md",
- "sha256": "eb405bc7a8d14e67d87f6175b5af4f3665694dd47e68fefa742cc3cf1cbf3b1a",
- "pc_id": "PC-eb405bc7a8d14e67",
- "model": "gpt-6-luna",
- "effort": "low"
- },
- {
- "task_id": "TASK-0015",
- "prompt_path": "work/rounds/R-0021/prompts/TASK-0015.md",
- "sha256": "45e4a2aef581690f0d953a670883eb9542d52d575972c156a44e2180956d3994",
- "pc_id": "PC-45e4a2aef581690f",
- "model": "gpt-5.6-terra",
- "effort": "medium"
- }
  +]
  diff --git a/work/rounds/R-0021/contracts/CTG-0001.md b/work/rounds/R-0021/contracts/CTG-0001.md
  new file mode 100644
  index 00000000..7334ff17
  --- /dev/null
  +++ b/work/rounds/R-0021/contracts/CTG-0001.md
  @@ -0,0 +1,165 @@
  +# CTG-0001 — inventário e caracterização preservada
-

+Papel: **Architect**, Constituição artigo 7; autoridade por caminho, artigo 6.
+Preparação TASK-0001 realizada por Astra em 2026-09-27. A adenda do Owner ao plano
+prevalece sobre o desenho histórico: assinatura, toda a outbox e toda a migração
+offline são transferidas para R-0022. Esta rodada caracteriza o comportamento
+existente, registra requisitos upstream e faz o pin 1.4.0. Não autoriza DDL,
+realocação de adapters, mudança de protocolo, remoção de implementação ou módulos novos. +
+## 1. Fontes e inventário fechado +
+O inventário de versões está em `stynx-manifests.json`: **59 manifestos**, dos quais
+48 pertencem a `tools/blueprints/generated-files.json` e 11 são manuscritos. A lista
+é a fronteira da edição inicial, não o universo de detecção do futuro gate.
+O método foi percorrer `package.json` e selecionar chaves `@stynx-nyx/` em dependencies,
+devDependencies, optionalDependencies e peerDependencies, excluindo dependências
+instaladas, VCS, governança local, build e caches. Todos declaram 1.3.1 na captura. +`CTG-0002.md` fixa o pin e a operação do gerador. +
+| Área | Código de produção a ler, sem editar | Provas existentes a executar/reutilizar |
+| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
+| Assinatura clínica | `backend/domains/ch/clinical-reports/src/pades-signing.http-adapter.ts`, `report-lifecycle.service.ts`, `encounter-closure.service.ts`; `backend/domains/ch/juntas/src/junta-signing.adapter.ts` | `backend/domains/ch/clinical-reports/tests/unit/{pades-signing.http-adapter,report-lifecycle.service,encounter-closure.service}.spec.ts` |
+| Composição e perfis | `backend/app/src/{app.module,detran-clinical-trust,detran-runtime}.ts` | `backend/app/tests/e2e/runtime-profiles.e2e.spec.ts`, `rait-case-commands.e2e.spec.ts` |
+| Documentos | `backend/domains/shared/src/documents/{documents-facade,document-trust,document-trust.http-adapter,signature-policy}.ts` | `document-trust.spec.ts`, `document-trust-batch.spec.ts`, `document-trust-batch-capability.spec.ts`, `document-trust-worklist.spec.ts`, `document-trust-session-minutes.spec.ts` no mesmo diretório |
+| Despacho RENACH | `backend/app/src/pec-renach-transmission.service.ts`, `.controller.ts`; `backend/database/ddl/04-integration-storage.sql` | `backend/app/src/pec-renach-transmission.spec.ts`, `backend/app/tests/integration/pec-pipeline-persistence.integration.spec.ts` |
+| Offline | `backend/domains/ops/offline-sync/src/handwritten/{offline-sync.controller,offline-sync.commands,submit-batch.command,reserve-numbering.command,settle-numbering.command,reconcile-numbering.command,resolve-conflict.command,concurrency-detector}.ts`; DDL 18-ops-offline-sync.sql | `src/handwritten/{submit-batch,events.schema}.spec.ts`; `tests/integration/{numbering,sync-batch,concurrency-window,resolve-conflict}.integration.spec.ts` |
+| HTTP TEAT e BOAT | `backend/app/src/app.module.ts`; `backend/domains/est/crash/src/handwritten/` | `backend/app/tests/e2e/teat-field-sync.e2e.spec.ts`, `boat-crash-commands.e2e.spec.ts` | +
+Configuração clínica: `DETRAN_CLINICAL_SIGNING_{URL,HEALTH_URL,TOKEN}`;
+confiança documental: `DETRAN_DOCUMENT_TRUST_{URL,HEALTH_URL,TOKEN}`.
+Nenhum token será incluído nos relatos. `staging-like` e `production` exigem HTTPS;
+a prontidão clínica exige PAdES, TSA, LTA e OCSP ou CRL. +
+O recibo `ClinicalArtifactReceipt` preserva contentSha256, storageDocumentId,
+artifactSha256, signatureLevel, signatureFormat, signedAt, tsaTime,
+certificateValidationSource, certificateValidationStatus e certificateValidatedAt.
+A porta clínica recebe conteúdo e signatário e faz renderização/assinatura/storage
+por HTTP; não recebe um PDF já pronto como a API STYNX. +
+RENACH opera `integration.outbox` tópico `ch.renach.exam-result`, +`integration.delivery_attempt` e `integration.inbox_receipt`. Claim usa +`for update skip locked`, inclusive reprocessamento de `processing` com +`dispatched_at` de pelo menos 15 minutos; erro agenda 15 minutos. O log de eventos
+SSE/projeções sobre `integration.outbox` permanece integralmente local. +
+## 2. Critérios verificáveis — TASK-0002 +
+Os IDs abaixo pertencem a esta caracterização, sem substituir os critérios
+históricos de migração do plano. Cada ID deve aparecer no relatório ligado a
+casos existentes ou acrescentados. Não duplicar prova equivalente já existente. +
+| ID | Presença e ausência exigidas |
+| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
+| C-01-01 | renderAndSign aceita recibo clínico completo e preserva todos os campos; comprova corpo HTTP e Bearer de fixture sem vazar segredo em erro. |
+| C-01-02 | Hash de conteúdo divergente, artifactSha256 inválido, storage ausente, formato/nível fora do enum, TSA ausente, certificado não GOOD e fonte inválida são recusados. Não inventar validações que o código atual não implementa. |
+| C-01-03 | URL/health/token ausentes, timeout, HTTP não 2xx e capacidades incompletas não produzem assinatura nem prontidão positiva. |
+| C-01-04 | Perfis local-sandbox/test preservam composição local; staging-like/production recusam configuração externa ausente/HTTP claro e não selecionam provedor local como fallback. Usar composição e prontidão reais, não só texto de arquivo. |
+| C-01-05 | Verificador documental aceita evidência completa e vincula tenant, documento, hashes, tipo e signatário; divergências retornam os códigos RAIT.SIGNATURE_FAILED ou RAIT.SIGNATURE_CERT_MISMATCH existentes. |
+| C-01-06 | Manifestos de lote e sessão e retirada mantêm operações próprias, PAdES-B-LT, TSA e evidência OCSP/CRL; capacidade ausente não é sucesso. Executar as cinco suítes existentes. |
+| C-01-07 | RENACH despacha payload mínimo com chave durável, correlação e vínculo de artefato/relatório, incluindo retificação; divergência de espécie é recusada. |
+| C-01-08 | Claim coordena por skip-locked; processing envelhecido é elegível após 15 minutos; falha registra tentativa visível e retry de 15 minutos. Provar valores e estados, não apenas existência de método. |
+| C-01-09 | ACK válido atualiza tentativa/outbox e inbox_receipt uma vez; replay do mesmo evento processado não duplica efeitos; ACK negativo preserva erro/retry. |
+| C-01-10 | Isolamento de tenant do caminho RENACH permanece aplicado; usar prova persistida existente e adicionar negativo se ausente, sem owner na operação sob teste. | +
+Novos arquivos permitidos para lacunas: `backend/domains/ch/clinical-reports/tests/unit/r21-signature-characterization.spec.ts`, +`backend/domains/shared/src/documents/r21-document-trust-characterization.spec.ts`, +`backend/app/src/r21-renach-characterization.spec.ts`, +`backend/app/tests/e2e/r21-trust-profiles.e2e.spec.ts` e +`backend/app/tests/integration/r21-renach-characterization.integration.spec.ts`.
+Não criar arquivo vazio se as provas existentes cobrem todos os critérios.
+A suíte pec-pipeline-persistence caracteriza kernel/idempotência/rate-limit;
+não comprova isolamento específico do serviço RENACH. C-01-10 exige o novo
+spec de integração com SQL real e dois tenants, usando o padrão database.tx
+sob role_app_backend do harness existente, sem alterar testes anteriores. +
+## 3. Critérios verificáveis — TASK-0003 +
+O app monta `/v1/ops/offline-sync`. Rotas manuscritas: POST sync-batches,
+numbering-reservations/reserve, numbering-reservations/:id/{cancel,block,close,reconcile},
+sync-conflicts/:id/resolve; GET numbering-reservations/:id/consumption,
+receipts/:tenantId[/by-idempotency/:key], sync-queue-items e sync-conflicts. +
+| ID | Presença e ausência exigidas |
+| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
+| C-01-20 | HTTP real do AppModule: lote TEAT válido e crash-record BOAT válido, envelope e recibos existentes; payloads inválidos retornam códigos/contextos atuais sem efeito parcial. |
+| C-01-21 | Idempotency-Key HTTP repetida com mesmo corpo reproduz resultado; corpo divergente sob mesma chave é recusado (kernel 422). Chave de item e device_batch_id são identificadores distintos, também caracterizados. |
+| C-01-22 | Replay de item/lote não duplica agregado, consumo, recibo ou eventos; mesma chave com hash divergente gera conflito; replay interrompido completa materialização conforme teste existente. |
+| C-01-23 | Numeração: reserva idempotente, reserva concorrente sem sobreposição, esgotamento, default de tamanho e TTL vindo de parâmetro; cancel/block/close/reconcile e consumo preservam estados/erros atuais. |
+| C-01-24 | Recibo por tenant/chave permite recuperar ACK perdido; chave ausente retorna TEAT.SYNC_RECEIPT_NOT_FOUND; tenant divergente TEAT.TENANT_MISMATCH sem expor conteúdo. |
+| C-01-25 | Aplicação de item, agregado, consumo, fila, recibo e eventos usam a mesma transação; falha injetada depois do efeito de domínio faz rollback. Recibo de rejeição/conflito pode ser gravado separadamente, como comportamento atual. |
+| C-01-26 | Janela de concorrência usa parâmetro real, source_pending emite warning e não cria conflito; devices concorrentes criam suspeita e handoff válido a impede. |
+| C-01-27 | Resoluções manual_review/accept_server/reject/retry_after_correction preservam estado e eventos; conflito concurrency não é resolvido por accept_server. |
+| C-01-28 | HTTP exige papel correto (403 no negativo); principal de outro tenant não lê nem altera itens/recibos/reservas/conflitos. Provar também RLS sob role_app_backend, tenant A sem leitura/escrita de B. |
+| C-01-29 | Sequência inicial e lacunas de batch_sequence preservam expectedSequence/contexto; hashes usam canonicalização existente; envelopes carregam batchId persistido. |
+| C-01-30 | BOAT mantém os casos válidos, inválidos, conflito de chave natural, warning de evidência e vínculo AIT, sem perda de atomicidade. Executar suíte existente boat-crash-commands e mapear os casos ao critério. | +
+Novos arquivos permitidos: `backend/app/tests/e2e/r21-offline-sync.e2e.spec.ts`
+e `backend/domains/ops/offline-sync/tests/integration/r21-offline-characterization.integration.spec.ts`.
+Reutilizar `tests/integration/harness.ts` de offline (database, isolatedTenant,
+seedField, dropTenant) para SQL. O harness já assume role_app_backend e
+app.tenant_id/app.actor_id dentro da transação. Owner só semeia/limpa e inspeciona
+fixtures fora da operação sob teste. A observação administrativa não substitui
+a prova de RLS do usuário. +
+Para HTTP, seguir o setup/teardown de `teat-field-sync.e2e.spec.ts` e +`boat-crash-commands.e2e.spec.ts`: env antes do import dinâmico de AppModule,
+NestFactory.create(AppModule.forRoot()), app.init(), supertest(app.getHttpServer()).
+Usar o applier real da composição. Não substituir a suíte HTTP por chamada direta
+a comando nem fabricar recibo applied. Restaurar env, fechar app/client e limpar
+somente fixtures criadas pelo próprio teste. Comentários antigos de testes que
+afirmam que rotas não existem são históricos; o código atual é a fonte de verdade. +
+## 4. Comandos e prova antes/depois +
+Maestro prepara banco descartável exclusivo e fornece DETRAN_TEST_DATABASE_URL,
+DATABASE_URL quando necessário e identidades de banco do runtime. Nenhum worker
+cria/reset/aplica DDL. Não usar o fallback localhost/detran dos harnesses. +`backend:test:ci` prepara e restaura o banco; jamais concorre com outra suíte
+no mesmo banco. O maestro executa `pnpm --filter @detran/ch-clinical-reports build` sob lock antes de TASK-0002, e repete antes da mesma prova em 1.4.0: juntas resolve clinical-reports via dist, sem alias. Workers não recompilam/instalam como tentativa de corrigir import. +
+Comandos reais, executados no root da worktree, com banco preparado pelo maestro: + +`sh
+pnpm --filter @detran/ch-clinical-reports test:unit --passWithNoTests=false
+pnpm --filter @detran/shared run test --passWithNoTests=false
+pnpm --filter @detran/ch-juntas run test --passWithNoTests=false
+pnpm --filter @detran/app test:unit --passWithNoTests=false src/pec-renach-transmission.spec.ts src/r21-renach-characterization.spec.ts
+pnpm --filter @detran/app test:e2e --passWithNoTests=false tests/e2e/runtime-profiles.e2e.spec.ts tests/e2e/r21-trust-profiles.e2e.spec.ts tests/e2e/rait-case-commands.e2e.spec.ts
+pnpm --filter @detran/app test:integration --passWithNoTests=false tests/integration/pec-pipeline-persistence.integration.spec.ts tests/integration/r21-renach-characterization.integration.spec.ts
+pnpm --filter @detran/ops-offline-sync test:unit --passWithNoTests=false
+pnpm --filter @detran/ops-offline-sync test:integration --passWithNoTests=false
+pnpm --filter @detran/app test:e2e --passWithNoTests=false tests/e2e/teat-field-sync.e2e.spec.ts tests/e2e/boat-crash-commands.e2e.spec.ts tests/e2e/r21-offline-sync.e2e.spec.ts
+` +
+Omitir apenas filtros de novos arquivos que não foram necessários/criados; +`--passWithNoTests=false` é obrigatório para impedir PASS sem coleta. A mesma
+lista efetivamente usada (sem alterações de testes) será repetida em 1.4.0.
+Relatórios registram SHA base fornecido pelo maestro, hashes dos testes, versão
+instalada, Node/pnpm, banco identificado sem senha, comandos, exit code, contagens
+pass/fail/skip e mapa critério→caso. Nenhum verde foi executado nesta preparação.
+Gate do grupo: pnpm check e pnpm backend:test:ci sob responsabilidade do maestro. +
+## 5. Publicação e lacunas confirmadas + +`../inputs/published-api-metadata.json` contém hashes SHA-256/SHA-512 dos seis
+tarballs e hashes por arquivo próprio. Os três inputs Markdown extraem os tipos
+publicados e implementação relevante. Em 1.4.0 versus 1.5.0-rc.2 são idênticos
+34 arquivos próprios JS/.d.ts de signature, 22 de outbox e 20 de offline-sync.
+Não se afirma igualdade de package.json, dependências transitivas ou de todo o
+STYNX. Essa comparação não autoriza o pin RC nem qualquer migração. +
+| Lacuna | Evidência publicada e diferença local | Destino |
+| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
+| L-01 / UPS-SIG-01 | SignatureRequest usa bytes, TSA e certificado; algorithm pades-baseline-t/pades-ltv não representa nível mínimo ADVANCED/QUALIFIED nem recibo clínico render+storage. | R-0022, suporte upstream |
+| L-02 / UPS-SIG-02 | SignatureService.sign/verify e módulo não expõem prontidão por capacidades do contrato DETRAN. MissingSignatureBackend falha, mas não substitui readiness. | R-0022 |
+| L-03 / UPS-SIG-03/04 | SequentialSigner por digest não é manifesto multi-signatário PAdES com prova por signatário nem retirada vinculada a caso/documento. | R-0022 |
+| L-04 / UPS-OBX-01 | enqueue usa upsert por tenant/entity/entityId; o log local exige múltiplos eventos imutáveis por agregado e replay SSE. | R-0022, toda a outbox |
+| L-05 / UPS-OBX-02 | OutboxRow/ack não substituem o ledger delivery_attempt/inbox_receipt com hashes, protocolo, correlação e replay local. dispatchDue/ack publicados usam system/owner: não podem ser usados no request path DETRAN sem solução upstream para escopo. | R-0022 |
+| L-06 / UPS-OFS-01/02 | OfflineSyncService só reserve/cancel/submit/openConflict/resolveConflict; não oferece block/close/reconcile/settle/consumption ou consulta de recibo por chave compatível. | R-0022 |
+| L-07 / UPS-OFS-03 | OfflineSyncStore delega operações inteiras; SubmitSyncBatchResult contém batchId/acceptedItems/duplicateItems/conflicts/items, não os recibos/envelope DETRAN. Não há porta publicada de applier/transação de domínio. | R-0022 |
+| L-08 / UPS-OFS-04 | Tipos usam orgUnitId/camelCase e estratégias device-wins/server-wins/manual-review, enquanto DETRAN usa traffic_agency_id/snake_case, ações e regras de concorrência próprias. Store custom não pode mascarar reimplementação completa. | R-0022, compatibilidade upstream obrigatória | +
+ADR de operações vigente: **ADR-0036**, não a antiga ADR-0006 ops.
+Notificações acompanham produtor OD-P40; jobs continuam fora. Dependências sem
+import são inventário, não autorização para remoções adicionais nesta preparação.
diff --git a/work/rounds/R-0021/contracts/CTG-0002.md b/work/rounds/R-0021/contracts/CTG-0002.md
new file mode 100644
index 00000000..b91a409a
--- /dev/null
+++ b/work/rounds/R-0021/contracts/CTG-0002.md
@@ -0,0 +1,109 @@
+# CTG-0002 — pin STYNX e verificador preventivo +
+Papel Architect, Constituição artigo 7. Contrato de TASK-0015 (Inspector) antes de
+TASK-0004 (Engineer). Escopo autorizado: versão 1.3.1 → **1.4.0**, fonte única,
+verificação dinâmica, testes negativos e integração aos gates. Nenhuma API de
+assinatura/outbox/offline será adotada nesta tarefa. +
+## 1. Interface e comportamento +
+- Fonte única: `tools/stynx-version.json`, conteúdo `{ "version": "1.4.0" }`.

- Deve existir, ser JSON válido e possuir version string de versão exata, sem
- range/tag/protocolo; sem fallback hardcoded. O gerador e o gate leem essa fonte.
  +- CLI: `pnpm exec tsx tools/check-stynx-pin.ts [repoRoot]`.
- Sem argumento usa process.cwd(); argumento relativo resolve pelo cwd.
- A fonte de versão é lida de `<repoRoot>/tools/stynx-version.json`, nunca do
- diretório do script quando outro repoRoot foi passado.
  +- Percorrer recursivamente `package.json` da raiz e de todos os diretórios fonte,
- incluindo manifests de docs/site, novos workspaces e arquivos gerados de fonte
- de backend/domains. Não depender do Git, lista de workspaces ou lista de 59.
  +- Não seguir symlinks. Excluir diretórios de nome exato `.git`, `node_modules`,
- `dist`, `build`, `coverage`, `.cache`, `.angular`, `.next`, `.devai`, `tmp`,
- `scratch`. Não excluir `docs`, `work`, `packages`, `apps` ou `backend`.
- As fixtures de teste temporárias ficam em os.tmpdir(), fora do repo.
  +- Inspecionar dependencies, devDependencies, optionalDependencies e
- peerDependencies. Toda chave começando por `@stynx-nyx/` exige valor string
- exatamente igual à version da fonte; rejeitar versões antigas/novas, ranges,
- tags, aliases npm, workspace/file/link/git/URL e valores não string.
  +- Manifesto sem referência STYNX é permitido. Manifesto JSON inválido ou seção
- de dependências presente mas inválida produz diagnóstico e falha; não ignorar
- silenciosamente arquivos inválidos. Repo sem referência STYNX é permitido:
- o gate fiscaliza declarações, sem inventar dependência obrigatória.
  +- Exit 0 quando todas as declarações são válidas; exit 1 para violações ou erro
- de leitura/configuração. Diagnóstico ordenado por caminho/seção/pacote e legível:
- arquivo relativo, seção, pacote, esperado e encontrado. Para erro de parsing
- ou configuração, informar caminho e causa. Nenhuma escrita/instalação/rede.
-

+## 2. Inspector primeiro: testes blackbox +
+TASK-0015 escreve somente `tools/stynx-pin/tests/*.test.mjs`, node:test, sem
+importar uma função interna do verificador. Usar spawnSync/process.execPath com +`--import <URL absoluto resolvido por import.meta.resolve('tsx')>` para executar o arquivo TS real, fixtures em mkdtemp/os.tmpdir(),
+cleanup em finally/after. O comando operacional equivalente é pnpm exec tsx.
+Antes do Engineer a ausência do CLI é RED esperado, nunca skip ou passWithNoTests.
+Rodar inicialmente `node --test tools/stynx-pin/tests/*.test.mjs`; não supor
+que scripts de package.json ainda inexistentes já estejam disponíveis. +
+| ID | Caso / resultado |
+| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
+| C-02-01 | Fonte válida e múltiplos manifests/STYNX 1.4.0 nas quatro seções: 0. Dependências não STYNX não são restringidas. |
+| C-02-02 | Um caso por seção com 1.3.1 ou versão divergente: 1 e diagnóstico arquivo/seção/pacote/esperado/encontrado. |
+| C-02-03 | Casos ^1.4.0, ~1.4.0, >=1.4.0, latest, workspace:*, file:, npm:alias, URL e valor não string: 1. |
+| C-02-04 | Novo pacote aninhado fora da lista original com versão incorreta: 1; package.json raiz e docs/site igualmente detectados. |
+| C-02-05 | Manifestos divergentes em dist/build/node_modules/.git/.devai/.cache/coverage/scratch são ignorados; equivalente em backend/domains gerado de fonte falha. |
+| C-02-06 | Fonte ausente, JSON malformado, version ausente/não string/range: 1 e caminho correto. Manifesto ou seção malformada também falha. |
+| C-02-07 | repoRoot explícito e cwd default usam a fonte da fixture, inclusive fonte alternativa exata; prova impede hardcode 1.4.0. |
+| C-02-08 | Symlink de diretório/arquivo para fora da fixture não é seguido; nenhuma escrita nos manifests. Repo sem STYNX retorna 0. | +
+Não exigir byte-for-byte da mensagem inteira nem detalhes privados de travessia.
+Asserções observam status e campos essenciais do diagnóstico. Gerador e check
+serão inspecionados no gate/review de integração, sem snapshots frágeis do código. +
+## 3. Engineer: edição permitida e gerados +
+Fonte da lista fechada: `stynx-manifests.json` neste diretório, com cada caminho,
+seção, pacote e versão anterior. Há **11 manifests manuscritos** e **48 manifests
+controlados pelo gerador**. A lista marca `manual-source` e `blueprints:generate`. +
+TASK-0004 pode editar os 11 manifests manuscritos, `package.json` raiz (scripts), +`tools/stynx-version.json`, `tools/check-stynx-pin.ts` e +`tools/blueprints/generate.mjs`. Os 48 manifests gerados só mudam por +`pnpm blueprints:generate`, não por replace/sed/edição manual.
+O gerador já tem as strings 1.3.1 nos defaults core/data; substituir pela leitura
+da fonte única mantendo demais parâmetros. O gerador usa cwd como root e aceita
+BLUEPRINTS_OUTPUT: ler a fonte do root, não do destino de geração temporário. +
+Saídas `apps/boat/mobile/dist/package.json` e `packages/ui/dist/package.json`
+são regeneradas por build, nunca editadas ou usadas como fonte do pin. Não criar
+ou incluir dist só para provar mudança. Não modificar os testes do Inspector. +`pnpm-lock.yaml`, instalação autenticada e exclusão mútua com instalação/geração
+pertencem ao maestro. O Engineer entrega diffs e comandos requeridos, sem instalar. +
+Dependências possivelmente mortas ficam como inventário para R-0022; TASK-0004 preserva todas e fixa STYNX em 1.4.0. A inspeção atual encontrou StynxI18nService importado em apps/boat/mobile/src/lib/pages/boat-pages.ts: a hipótese histórica de quatro dependências BOAT sem uso não autoriza exclusão. Nenhum cleanup nesta tarefa. +
+Maestro executa pnpm blueprints:generate sob lock ao checkpoint dependency-ready; só os 48 caminhos de geração do inventário podem mudar, apenas versão. Outro diff é reportado, não corrigido à mão. Depois instala e libera os gates do worker. +
+## 4. Scripts e aceitação +
+Criar em package.json: +
+```json
+{

- "verify:stynx-pin": "tsx tools/check-stynx-pin.ts",
- "test:stynx-pin": "node --test tools/stynx-pin/tests/*.test.mjs"
  +}
  +```
-

+Inserir ambos no `check` após format:check, sem retirar/reordenar os gates
+existentes. Com fonte e todos os manifests convergentes, ambos passam. +`pnpm blueprints:check` deve passar e segunda geração não alterar saídas. +
+| ID | Evidência de integração |
+| ------- | ------------------------------------------------------------------------------------------------------------------------------- |
+| C-02-09 | Inventário dinâmico completo sem divergência, fonte única consumida pelo gerador, nenhuma string independente 1.3.1 no gerador. |
+| C-02-10 | verify:stynx-pin e test:stynx-pin em check; negativos verdes sem mudança do Inspector pelo Engineer. |
+| C-02-11 | Instalação/lockfile 1.4.0 pelo maestro; pnpm check, backend:test:ci e build exigido verdes. |
+| C-02-12 | Mesmos testes de C-01 verdes antes em 1.3.1 e depois em 1.4.0, com SHA/hashes/ambiente documentados. | +
+Se ocorrer erro de produto detectado pela caracterização, reportar ao Architect;
+não enfraquecer asserção nem ampliar escopo de produção para fazer o pin passar.
diff --git a/work/rounds/R-0021/contracts/stynx-manifests.json b/work/rounds/R-0021/contracts/stynx-manifests.json
new file mode 100644
index 00000000..2f8d9715
--- /dev/null
+++ b/work/rounds/R-0021/contracts/stynx-manifests.json
@@ -0,0 +1,637 @@
+{

- "baselineVersion": "1.3.1",
- "targetVersion": "1.4.0",
- "count": 59,
- "manifests": [
- {
-      "path": "apps/boat/mobile/package.json",
-      "mode": "manual-source",
-      "stynxDependencies": {
-        "dependencies": {
-          "@stynx-nyx/angular": "1.3.1",
-          "@stynx-nyx/angular-i18n": "1.3.1",
-          "@stynx-nyx/angular-ui": "1.3.1",
-          "@stynx-nyx/mobile-runtime": "1.3.1"
-        }
-      }
- },
- {
-      "path": "apps/dashboard/web/package.json",
-      "mode": "manual-source",
-      "stynxDependencies": {
-        "dependencies": {
-          "@stynx-nyx/angular": "1.3.1",
-          "@stynx-nyx/angular-auth": "1.3.1",
-          "@stynx-nyx/angular-i18n": "1.3.1",
-          "@stynx-nyx/angular-tenancy": "1.3.1",
-          "@stynx-nyx/angular-ui": "1.3.1"
-        }
-      }
- },
- {
-      "path": "apps/portal/web/package.json",
-      "mode": "manual-source",
-      "stynxDependencies": {
-        "dependencies": {
-          "@stynx-nyx/angular": "1.3.1",
-          "@stynx-nyx/angular-auth": "1.3.1",
-          "@stynx-nyx/angular-i18n": "1.3.1",
-          "@stynx-nyx/angular-tenancy": "1.3.1",
-          "@stynx-nyx/angular-ui": "1.3.1"
-        }
-      }
- },
- {
-      "path": "apps/rait/web/package.json",
-      "mode": "manual-source",
-      "stynxDependencies": {
-        "dependencies": {
-          "@stynx-nyx/angular": "1.3.1",
-          "@stynx-nyx/angular-auth": "1.3.1",
-          "@stynx-nyx/angular-i18n": "1.3.1",
-          "@stynx-nyx/angular-tenancy": "1.3.1",
-          "@stynx-nyx/angular-ui": "1.3.1"
-        }
-      }
- },
- {
-      "path": "apps/teat/mobile/package.json",
-      "mode": "manual-source",
-      "stynxDependencies": {
-        "dependencies": {
-          "@stynx-nyx/angular": "1.3.1",
-          "@stynx-nyx/angular-auth": "1.3.1",
-          "@stynx-nyx/angular-i18n": "1.3.1",
-          "@stynx-nyx/angular-tenancy": "1.3.1",
-          "@stynx-nyx/angular-ui": "1.3.1",
-          "@stynx-nyx/mobile-runtime": "1.3.1"
-        }
-      }
- },
- {
-      "path": "apps/teat/web/package.json",
-      "mode": "manual-source",
-      "stynxDependencies": {
-        "dependencies": {
-          "@stynx-nyx/angular": "1.3.1",
-          "@stynx-nyx/angular-auth": "1.3.1",
-          "@stynx-nyx/angular-i18n": "1.3.1",
-          "@stynx-nyx/angular-tenancy": "1.3.1",
-          "@stynx-nyx/angular-ui": "1.3.1"
-        }
-      }
- },
- {
-      "path": "backend/app/package.json",
-      "mode": "manual-source",
-      "stynxDependencies": {
-        "dependencies": {
-          "@stynx-nyx/audit": "1.3.1",
-          "@stynx-nyx/auth": "1.3.1",
-          "@stynx-nyx/backend": "1.3.1",
-          "@stynx-nyx/contracts": "1.3.1",
-          "@stynx-nyx/core": "1.3.1",
-          "@stynx-nyx/data": "1.3.1",
-          "@stynx-nyx/feature-flags": "1.3.1",
-          "@stynx-nyx/health": "1.3.1",
-          "@stynx-nyx/idempotency": "1.3.1",
-          "@stynx-nyx/logging": "1.3.1",
-          "@stynx-nyx/pdf": "1.3.1",
-          "@stynx-nyx/pdf-a": "1.3.1",
-          "@stynx-nyx/pdf-a-vera-docker": "1.3.1",
-          "@stynx-nyx/ratelimit": "1.3.1",
-          "@stynx-nyx/sessions": "1.3.1",
-          "@stynx-nyx/signature": "1.3.1",
-          "@stynx-nyx/storage": "1.3.1",
-          "@stynx-nyx/tenancy": "1.3.1"
-        }
-      }
- },
- {
-      "path": "backend/domains/ch/billing/package.json",
-      "mode": "blueprints:generate",
-      "stynxDependencies": {
-        "dependencies": {
-          "@stynx-nyx/core": "1.3.1",
-          "@stynx-nyx/data": "1.3.1"
-        }
-      }
- },
- {
-      "path": "backend/domains/ch/biometrics/package.json",
-      "mode": "blueprints:generate",
-      "stynxDependencies": {
-        "dependencies": {
-          "@stynx-nyx/core": "1.3.1",
-          "@stynx-nyx/data": "1.3.1"
-        }
-      }
- },
- {
-      "path": "backend/domains/ch/clinical-controls/package.json",
-      "mode": "blueprints:generate",
-      "stynxDependencies": {
-        "dependencies": {
-          "@stynx-nyx/core": "1.3.1",
-          "@stynx-nyx/data": "1.3.1"
-        }
-      }
- },
- {
-      "path": "backend/domains/ch/clinical-network/package.json",
-      "mode": "blueprints:generate",
-      "stynxDependencies": {
-        "dependencies": {
-          "@stynx-nyx/core": "1.3.1",
-          "@stynx-nyx/data": "1.3.1"
-        }
-      }
- },
- {
-      "path": "backend/domains/ch/clinical-reports/package.json",
-      "mode": "blueprints:generate",
-      "stynxDependencies": {
-        "dependencies": {
-          "@stynx-nyx/core": "1.3.1",
-          "@stynx-nyx/data": "1.3.1"
-        }
-      }
- },
- {
-      "path": "backend/domains/ch/encounters/package.json",
-      "mode": "blueprints:generate",
-      "stynxDependencies": {
-        "dependencies": {
-          "@stynx-nyx/core": "1.3.1",
-          "@stynx-nyx/data": "1.3.1"
-        }
-      }
- },
- {
-      "path": "backend/domains/ch/exams/package.json",
-      "mode": "blueprints:generate",
-      "stynxDependencies": {
-        "dependencies": {
-          "@stynx-nyx/core": "1.3.1",
-          "@stynx-nyx/data": "1.3.1"
-        }
-      }
- },
- {
-      "path": "backend/domains/ch/inconsistencies/package.json",
-      "mode": "blueprints:generate",
-      "stynxDependencies": {
-        "dependencies": {
-          "@stynx-nyx/core": "1.3.1",
-          "@stynx-nyx/data": "1.3.1"
-        }
-      }
- },
- {
-      "path": "backend/domains/ch/juntas/package.json",
-      "mode": "blueprints:generate",
-      "stynxDependencies": {
-        "dependencies": {
-          "@stynx-nyx/core": "1.3.1",
-          "@stynx-nyx/data": "1.3.1"
-        }
-      }
- },
- {
-      "path": "backend/domains/ch/operational-controls/package.json",
-      "mode": "blueprints:generate",
-      "stynxDependencies": {
-        "dependencies": {
-          "@stynx-nyx/core": "1.3.1",
-          "@stynx-nyx/data": "1.3.1"
-        }
-      }
- },
- {
-      "path": "backend/domains/ch/patients/package.json",
-      "mode": "blueprints:generate",
-      "stynxDependencies": {
-        "dependencies": {
-          "@stynx-nyx/core": "1.3.1",
-          "@stynx-nyx/data": "1.3.1"
-        }
-      }
- },
- {
-      "path": "backend/domains/ch/process-blocks/package.json",
-      "mode": "blueprints:generate",
-      "stynxDependencies": {
-        "dependencies": {
-          "@stynx-nyx/core": "1.3.1",
-          "@stynx-nyx/data": "1.3.1"
-        }
-      }
- },
- {
-      "path": "backend/domains/ch/restrictions/package.json",
-      "mode": "blueprints:generate",
-      "stynxDependencies": {
-        "dependencies": {
-          "@stynx-nyx/core": "1.3.1",
-          "@stynx-nyx/data": "1.3.1"
-        }
-      }
- },
- {
-      "path": "backend/domains/ch/retention/package.json",
-      "mode": "blueprints:generate",
-      "stynxDependencies": {
-        "dependencies": {
-          "@stynx-nyx/core": "1.3.1",
-          "@stynx-nyx/data": "1.3.1"
-        }
-      }
- },
- {
-      "path": "backend/domains/ch/scheduling/package.json",
-      "mode": "blueprints:generate",
-      "stynxDependencies": {
-        "dependencies": {
-          "@stynx-nyx/core": "1.3.1",
-          "@stynx-nyx/data": "1.3.1"
-        }
-      }
- },
- {
-      "path": "backend/domains/ch/telehealth/package.json",
-      "mode": "blueprints:generate",
-      "stynxDependencies": {
-        "dependencies": {
-          "@stynx-nyx/core": "1.3.1",
-          "@stynx-nyx/data": "1.3.1"
-        }
-      }
- },
- {
-      "path": "backend/domains/ch/toxicology/package.json",
-      "mode": "blueprints:generate",
-      "stynxDependencies": {
-        "dependencies": {
-          "@stynx-nyx/core": "1.3.1",
-          "@stynx-nyx/data": "1.3.1"
-        }
-      }
- },
- {
-      "path": "backend/domains/dashboard/crashes/package.json",
-      "mode": "blueprints:generate",
-      "stynxDependencies": {
-        "dependencies": {
-          "@stynx-nyx/core": "1.3.1",
-          "@stynx-nyx/data": "1.3.1"
-        }
-      }
- },
- {
-      "path": "backend/domains/dashboard/monitor/package.json",
-      "mode": "blueprints:generate",
-      "stynxDependencies": {
-        "dependencies": {
-          "@stynx-nyx/core": "1.3.1",
-          "@stynx-nyx/data": "1.3.1"
-        }
-      }
- },
- {
-      "path": "backend/domains/est/crash/package.json",
-      "mode": "blueprints:generate",
-      "stynxDependencies": {
-        "dependencies": {
-          "@stynx-nyx/core": "1.3.1",
-          "@stynx-nyx/data": "1.3.1"
-        }
-      }
- },
- {
-      "path": "backend/domains/inf/ait/package.json",
-      "mode": "blueprints:generate",
-      "stynxDependencies": {
-        "dependencies": {
-          "@stynx-nyx/core": "1.3.1",
-          "@stynx-nyx/data": "1.3.1"
-        }
-      }
- },
- {
-      "path": "backend/domains/inf/alcohol/package.json",
-      "mode": "blueprints:generate",
-      "stynxDependencies": {
-        "dependencies": {
-          "@stynx-nyx/core": "1.3.1",
-          "@stynx-nyx/data": "1.3.1"
-        }
-      }
- },
- {
-      "path": "backend/domains/inf/collection/package.json",
-      "mode": "blueprints:generate",
-      "stynxDependencies": {
-        "dependencies": {
-          "@stynx-nyx/core": "1.3.1",
-          "@stynx-nyx/data": "1.3.1"
-        }
-      }
- },
- {
-      "path": "backend/domains/inf/infraction/package.json",
-      "mode": "blueprints:generate",
-      "stynxDependencies": {
-        "dependencies": {
-          "@stynx-nyx/core": "1.3.1",
-          "@stynx-nyx/data": "1.3.1"
-        }
-      }
- },
- {
-      "path": "backend/domains/inf/measures/package.json",
-      "mode": "blueprints:generate",
-      "stynxDependencies": {
-        "dependencies": {
-          "@stynx-nyx/core": "1.3.1",
-          "@stynx-nyx/data": "1.3.1"
-        }
-      }
- },
- {
-      "path": "backend/domains/inf/normative/package.json",
-      "mode": "blueprints:generate",
-      "stynxDependencies": {
-        "dependencies": {
-          "@stynx-nyx/core": "1.3.1",
-          "@stynx-nyx/data": "1.3.1"
-        }
-      }
- },
- {
-      "path": "backend/domains/inf/notification/package.json",
-      "mode": "blueprints:generate",
-      "stynxDependencies": {
-        "dependencies": {
-          "@stynx-nyx/core": "1.3.1",
-          "@stynx-nyx/data": "1.3.1"
-        }
-      }
- },
- {
-      "path": "backend/domains/inf/rait-case/package.json",
-      "mode": "blueprints:generate",
-      "stynxDependencies": {
-        "dependencies": {
-          "@stynx-nyx/core": "1.3.1",
-          "@stynx-nyx/data": "1.3.1"
-        }
-      }
- },
- {
-      "path": "backend/domains/inf/rait-integration/package.json",
-      "mode": "blueprints:generate",
-      "stynxDependencies": {
-        "dependencies": {
-          "@stynx-nyx/core": "1.3.1",
-          "@stynx-nyx/data": "1.3.1"
-        }
-      }
- },
- {
-      "path": "backend/domains/inf/rait-org/package.json",
-      "mode": "blueprints:generate",
-      "stynxDependencies": {
-        "dependencies": {
-          "@stynx-nyx/core": "1.3.1",
-          "@stynx-nyx/data": "1.3.1"
-        }
-      }
- },
- {
-      "path": "backend/domains/inf/rait-session/package.json",
-      "mode": "blueprints:generate",
-      "stynxDependencies": {
-        "dependencies": {
-          "@stynx-nyx/core": "1.3.1",
-          "@stynx-nyx/data": "1.3.1"
-        }
-      }
- },
- {
-      "path": "backend/domains/inf/rait-worklist/package.json",
-      "mode": "blueprints:generate",
-      "stynxDependencies": {
-        "dependencies": {
-          "@stynx-nyx/core": "1.3.1",
-          "@stynx-nyx/data": "1.3.1"
-        }
-      }
- },
- {
-      "path": "backend/domains/inf/speed/package.json",
-      "mode": "blueprints:generate",
-      "stynxDependencies": {
-        "dependencies": {
-          "@stynx-nyx/core": "1.3.1",
-          "@stynx-nyx/data": "1.3.1"
-        }
-      }
- },
- {
-      "path": "backend/domains/integration/renaest-mirror/package.json",
-      "mode": "blueprints:generate",
-      "stynxDependencies": {
-        "dependencies": {
-          "@stynx-nyx/core": "1.3.1",
-          "@stynx-nyx/data": "1.3.1"
-        }
-      }
- },
- {
-      "path": "backend/domains/ops/agency/package.json",
-      "mode": "blueprints:generate",
-      "stynxDependencies": {
-        "dependencies": {
-          "@stynx-nyx/core": "1.3.1",
-          "@stynx-nyx/data": "1.3.1"
-        }
-      }
- },
- {
-      "path": "backend/domains/ops/core/package.json",
-      "mode": "manual-source",
-      "stynxDependencies": {
-        "dependencies": {
-          "@stynx-nyx/core": "1.3.1",
-          "@stynx-nyx/data": "1.3.1"
-        }
-      }
- },
- {
-      "path": "backend/domains/ops/evidence/package.json",
-      "mode": "blueprints:generate",
-      "stynxDependencies": {
-        "dependencies": {
-          "@stynx-nyx/core": "1.3.1",
-          "@stynx-nyx/data": "1.3.1"
-        }
-      }
- },
- {
-      "path": "backend/domains/ops/example/package.json",
-      "mode": "blueprints:generate",
-      "stynxDependencies": {
-        "dependencies": {
-          "@stynx-nyx/core": "1.3.1",
-          "@stynx-nyx/data": "1.3.1"
-        }
-      }
- },
- {
-      "path": "backend/domains/ops/field/package.json",
-      "mode": "blueprints:generate",
-      "stynxDependencies": {
-        "dependencies": {
-          "@stynx-nyx/core": "1.3.1",
-          "@stynx-nyx/data": "1.3.1"
-        }
-      }
- },
- {
-      "path": "backend/domains/ops/offline-sync/package.json",
-      "mode": "blueprints:generate",
-      "stynxDependencies": {
-        "dependencies": {
-          "@stynx-nyx/core": "1.3.1",
-          "@stynx-nyx/data": "1.3.1"
-        }
-      }
- },
- {
-      "path": "backend/domains/ops/parameter/package.json",
-      "mode": "blueprints:generate",
-      "stynxDependencies": {
-        "dependencies": {
-          "@stynx-nyx/core": "1.3.1",
-          "@stynx-nyx/data": "1.3.1"
-        }
-      }
- },
- {
-      "path": "backend/domains/ops/provisioning/package.json",
-      "mode": "blueprints:generate",
-      "stynxDependencies": {
-        "dependencies": {
-          "@stynx-nyx/core": "1.3.1",
-          "@stynx-nyx/data": "1.3.1"
-        }
-      }
- },
- {
-      "path": "backend/domains/ops/snapshots/package.json",
-      "mode": "blueprints:generate",
-      "stynxDependencies": {
-        "dependencies": {
-          "@stynx-nyx/core": "1.3.1",
-          "@stynx-nyx/data": "1.3.1"
-        }
-      }
- },
- {
-      "path": "backend/domains/portal/citizen-service/package.json",
-      "mode": "blueprints:generate",
-      "stynxDependencies": {
-        "dependencies": {
-          "@stynx-nyx/core": "1.3.1",
-          "@stynx-nyx/data": "1.3.1"
-        }
-      }
- },
- {
-      "path": "backend/domains/portal/complaints/package.json",
-      "mode": "blueprints:generate",
-      "stynxDependencies": {
-        "dependencies": {
-          "@stynx-nyx/core": "1.3.1",
-          "@stynx-nyx/data": "1.3.1"
-        }
-      }
- },
- {
-      "path": "backend/domains/portal/identity/package.json",
-      "mode": "blueprints:generate",
-      "stynxDependencies": {
-        "dependencies": {
-          "@stynx-nyx/core": "1.3.1",
-          "@stynx-nyx/data": "1.3.1"
-        }
-      }
- },
- {
-      "path": "backend/domains/portal/inbox/package.json",
-      "mode": "blueprints:generate",
-      "stynxDependencies": {
-        "dependencies": {
-          "@stynx-nyx/core": "1.3.1",
-          "@stynx-nyx/data": "1.3.1"
-        }
-      }
- },
- {
-      "path": "backend/domains/portal/projections/package.json",
-      "mode": "blueprints:generate",
-      "stynxDependencies": {
-        "dependencies": {
-          "@stynx-nyx/core": "1.3.1",
-          "@stynx-nyx/data": "1.3.1"
-        }
-      }
- },
- {
-      "path": "backend/domains/portal/requests/package.json",
-      "mode": "blueprints:generate",
-      "stynxDependencies": {
-        "dependencies": {
-          "@stynx-nyx/core": "1.3.1",
-          "@stynx-nyx/data": "1.3.1"
-        }
-      }
- },
- {
-      "path": "backend/domains/shared/package.json",
-      "mode": "manual-source",
-      "stynxDependencies": {
-        "dependencies": {
-          "@stynx-nyx/backend": "1.3.1",
-          "@stynx-nyx/contracts": "1.3.1",
-          "@stynx-nyx/core": "1.3.1",
-          "@stynx-nyx/data": "1.3.1",
-          "@stynx-nyx/idempotency": "1.3.1",
-          "@stynx-nyx/ratelimit": "1.3.1"
-        }
-      }
- },
- {
-      "path": "packages/senatran-adapter/package.json",
-      "mode": "manual-source",
-      "stynxDependencies": {
-        "dependencies": {
-          "@stynx-nyx/integration-adapter": "1.3.1"
-        }
-      }
- },
- {
-      "path": "packages/ui/package.json",
-      "mode": "manual-source",
-      "stynxDependencies": {
-        "dependencies": {
-          "@stynx-nyx/angular": "1.3.1",
-          "@stynx-nyx/angular-auth": "1.3.1",
-          "@stynx-nyx/angular-i18n": "1.3.1",
-          "@stynx-nyx/angular-tenancy": "1.3.1",
-          "@stynx-nyx/angular-ui": "1.3.1"
-        }
-      }
- }
- ]
  +}
  diff --git a/work/rounds/R-0021/execution.json b/work/rounds/R-0021/execution.json
  new file mode 100644
  index 00000000..5969ca98
  --- /dev/null
  +++ b/work/rounds/R-0021/execution.json
  @@ -0,0 +1,138 @@
  +{
- "round_id": "R-0021",
- "worktree": "/Users/aarusso/.codex/worktrees/stynx-canonical/detran",
- "base_sha": "e47a68014ffdd24e1f9da03c4fc9e1b78ecf381b",
- "orchestrator": {
- "model": "gpt-6-sol",
- "effort": "high"
- },
- "reviewer": {
- "model": "claude-opus-5-5",
- "bridge": "tools/orchestra/bridge.sh"
- },
- "max_concurrent_workers": 3,
- "dependencies": {
- "TASK-0002": ["TASK-0001"],
- "TASK-0003": ["TASK-0001"],
- "TASK-0015": ["TASK-0001"],
- "TASK-0004": ["TASK-0002", "TASK-0003", "TASK-0015"],
- "TASK-0014": ["TASK-0002", "TASK-0003", "TASK-0004"]
- },
- "active_groups": ["CTG-0001", "CTG-0002", "CTG-0007"],
- "cancelled_tasks": [
- "TASK-0005",
- "TASK-0006",
- "TASK-0007",
- "TASK-0008",
- "TASK-0009",
- "TASK-0010",
- "TASK-0011",
- "TASK-0012",
- "TASK-0013"
- ],
- "write_paths": {
- "TASK-0001": [
-      "work/rounds/R-0021/contracts/**",
-      "work/rounds/R-0021/inputs/published-api-*",
-      "work/rounds/R-0021/reports/TASK-0001.md",
-      "work/campaigns/C-0002-stynx-upstream-spec.md",
-      "docs/meta/knowledge-base/open-decisions-rait.md",
-      "work/campaigns/C-0002-consolidacao.md",
-      "work/rounds/R-0022/plan.md",
-      "work/rounds/R-0022/prompts/00-maestro.md"
- ],
- "TASK-0002": [
-      "backend/domains/ch/clinical-reports/tests/unit/r21-signature-characterization.spec.ts",
-      "backend/domains/shared/src/documents/r21-document-trust-characterization.spec.ts",
-      "backend/app/src/r21-renach-characterization.spec.ts",
-      "backend/app/tests/e2e/r21-trust-profiles.e2e.spec.ts",
-      "backend/app/tests/integration/r21-renach-characterization.integration.spec.ts"
- ],
- "TASK-0003": [
-      "backend/app/tests/e2e/r21-offline-sync.e2e.spec.ts",
-      "backend/domains/ops/offline-sync/tests/integration/r21-offline-characterization.integration.spec.ts"
- ],
- "TASK-0015": ["tools/stynx-pin/tests/*.test.mjs"],
- "TASK-0004": [
-      "tools/check-stynx-pin.ts",
-      "tools/stynx-version.json",
-      "tools/blueprints/generate.mjs",
-      "package.json",
-      "apps/boat/mobile/package.json",
-      "apps/dashboard/web/package.json",
-      "apps/portal/web/package.json",
-      "apps/rait/web/package.json",
-      "apps/teat/mobile/package.json",
-      "apps/teat/web/package.json",
-      "backend/app/package.json",
-      "backend/domains/ops/core/package.json",
-      "backend/domains/shared/package.json",
-      "packages/senatran-adapter/package.json",
-      "packages/ui/package.json"
- ],
- "TASK-0014": [
-      "docs/meta/adr/ADR-0015-stynx-1-3-1-angular-22-and-rait-role-catalogue.md",
-      "docs/meta/agents/orchestra/waves.md",
-      "docs/meta/knowledge-base/backlog.md",
-      "work/rounds/README.md",
-      "work/rounds/R-0021/reports/TASK-0014.md"
- ]
- },
- "exclusive_resources": [
- "pnpm-install",
- "blueprint-generation",
- "global-gates",
- "disposable-database-per-name"
- ],
- "closure_disposition": "round-close-with-original-transferred-criteria-fail-no-seal",
- "generated_paths_by_maestro": [
- "backend/domains/ch/billing/package.json",
- "backend/domains/ch/biometrics/package.json",
- "backend/domains/ch/clinical-controls/package.json",
- "backend/domains/ch/clinical-network/package.json",
- "backend/domains/ch/clinical-reports/package.json",
- "backend/domains/ch/encounters/package.json",
- "backend/domains/ch/exams/package.json",
- "backend/domains/ch/inconsistencies/package.json",
- "backend/domains/ch/juntas/package.json",
- "backend/domains/ch/operational-controls/package.json",
- "backend/domains/ch/patients/package.json",
- "backend/domains/ch/process-blocks/package.json",
- "backend/domains/ch/restrictions/package.json",
- "backend/domains/ch/retention/package.json",
- "backend/domains/ch/scheduling/package.json",
- "backend/domains/ch/telehealth/package.json",
- "backend/domains/ch/toxicology/package.json",
- "backend/domains/dashboard/crashes/package.json",
- "backend/domains/dashboard/monitor/package.json",
- "backend/domains/est/crash/package.json",
- "backend/domains/inf/ait/package.json",
- "backend/domains/inf/alcohol/package.json",
- "backend/domains/inf/collection/package.json",
- "backend/domains/inf/infraction/package.json",
- "backend/domains/inf/measures/package.json",
- "backend/domains/inf/normative/package.json",
- "backend/domains/inf/notification/package.json",
- "backend/domains/inf/rait-case/package.json",
- "backend/domains/inf/rait-integration/package.json",
- "backend/domains/inf/rait-org/package.json",
- "backend/domains/inf/rait-session/package.json",
- "backend/domains/inf/rait-worklist/package.json",
- "backend/domains/inf/speed/package.json",
- "backend/domains/integration/renaest-mirror/package.json",
- "backend/domains/ops/agency/package.json",
- "backend/domains/ops/evidence/package.json",
- "backend/domains/ops/example/package.json",
- "backend/domains/ops/field/package.json",
- "backend/domains/ops/offline-sync/package.json",
- "backend/domains/ops/parameter/package.json",
- "backend/domains/ops/provisioning/package.json",
- "backend/domains/ops/snapshots/package.json",
- "backend/domains/portal/citizen-service/package.json",
- "backend/domains/portal/complaints/package.json",
- "backend/domains/portal/identity/package.json",
- "backend/domains/portal/inbox/package.json",
- "backend/domains/portal/projections/package.json",
- "backend/domains/portal/requests/package.json"
- ]
  +}
  diff --git a/work/rounds/R-0021/inputs/00-maestro-before-A1.md b/work/rounds/R-0021/inputs/00-maestro-before-A1.md
  new file mode 100644
  index 00000000..9cb3ef1d
  --- /dev/null
  +++ b/work/rounds/R-0021/inputs/00-maestro-before-A1.md
  @@ -0,0 +1,264 @@
  +# Prompt do maestro — orquestra `stynx-canonical` (rodada `R-0021`)
-

+> Cole este prompt inteiro numa sessão **nova e sem contexto** da CLI da família `OpenAI — Codex CLI com Sol 6`
+> (id exato do modelo confirmado com `codex --help` no bootstrap), aberta na worktree `/Volumes/Thiamat II/stech/detran-worktrees/stynx-canonical`.
+> Você é o **maestro** desta orquestra. Tudo o que você precisa saber está nos arquivos citados;
+> não há contexto anterior a recuperar. +
+## 0. Identidade e limites +
+- Você é o maestro da frente **`stynx-canonical`**: ação **7a** da campanha C-0002 (pin STYNX

- 1.3.1 → 1.4.0 e troca de reimplementações locais por `@stynx-nyx/*` já publicados), definida em
- `work/campaigns/C-0002-consolidacao.md` e `work/rounds/R-0021/plan.md`.
  +- Declare, na primeira linha da sua primeira resposta, o papel constitucional em que atua em cada
- fase: **Architect** ao planejar e revisar, **Engineer** ao commitar código, **Auditor** nunca
- (o reviewer é a outra família). Os workers declaram o papel deles no próprio prompt.
  +- Família dos seus workers: **a sua** (`codex`: Sol 6 grande, Terra médio, Luna pequeno, conforme
- `model-ladder.md` e C-0002 §4), por subagentes nativos da sua CLI.
- Família do reviewer: **a outra** (`claude`), modelo **Opus 5.5** (id confirmado com
- `claude --help` no bootstrap, ex.: `claude-opus-5-5`), sempre pela ponte
- `tools/orchestra/bridge.sh`, nível grande em toda revisão desta rodada (assinatura e RLS). Nunca inverta.
  +- Orçamento desta janela de 5 h: **frente prevista para 2 janelas; nesta janela, um planejamento de
- maestro + até 8 tarefas de worker (Sol 6/Terra/Luna) com revisões — ≈ 750 k tokens de entrada; ao
- atingir 80 % grave checkpoint**. Contabilize em
- `work/rounds/R-0021/budget.json` (uma linha por tarefa e por chamada ao reviewer, com
- estimativas de tokens de entrada e saída). Se esgotar, grave `checkpoint` (§9) e pare.
  +- Você é o único que executa `git`. Workers não commitam, não fazem push, não abrem PR.
  +- Concorrência (regra de `waves.md`): para **abrir** esta frente basta `origin/main` atualizado com
- **R-0017 (`orchestra/local-stack`) mesclada** (C-0002 §2). O que depende de upstream é o
- **merge de cada grupo acoplado**: **CTG-0001 (contratos, caracterização, adenda A1 à spec
- upstream): nenhum upstream além de R-0017. CTG-0002 (pin 1.4.0): CTG-0001 mesclado. CTG-0003
- (assinatura), CTG-0004 (outbox de despacho), CTG-0005 (offline-sync): CTG-0002 mesclado; locks
- disjuntos, correm em paralelo. CTG-0006 (notificações): OD-R21-03. CTG-0007 (docs): 0003–0005.
- S-1.5 (repositório STYNX, 1.5.0) corre em paralelo e não é upstream desta rodada; esta rodada o
- alimenta pela adenda A1 de `work/campaigns/C-0002-stynx-upstream-spec.md` §8 no PR do CTG-0001**.
- No bootstrap, registre em `plan.md` §Concorrência quais upstreams já estão em `main`
- (`git log --oneline -30 origin/main`, `gh pr list --state merged --limit 20`), quais grupos estão
- liberados para merge e quais serão desenvolvidos sobre base empilhada (§1). Grupos livres avançam
- sempre; grupos presos aguardam ou empilham, nunca bloqueiam a rodada inteira.
-

+## 1. Bootstrap (Engineer) + +**Descoberta de estado — antes de criar qualquer coisa.** Outra sessão pode ter começado esta
+frente ou uma vizinha; nunca duplique worktree, branch ou rodada. Confirme também que `R-0021`
+ainda está livre (`ls work/rounds`; C-0002 §2). + +`bash
+git -C "$(git rev-parse --show-toplevel)" fetch -q origin --prune
+git worktree list                                   # worktree /Volumes/Thiamat II/stech/detran-worktrees/stynx-canonical já existe?
+git branch -a --list '*orchestra/*'                # branches locais e remotos das frentes
+gh pr list --state all --limit 30 --search "orchestra/" # PRs abertos/mesclados por frente
+sed -n '/^## Retomada/,/^## Leitura/p' work/rounds/R-0021/plan.md   # checkpoint anterior?
+codex --help | head -40; claude --help | head -40  # ids de modelo Sol 6 / Opus 5.5
+npm view @stynx-nyx/signature@1.4.0 version        # 1.4.0 publicada
+` +
+Regras: (a) worktree e branch existentes → reutilize-os, nunca recrie; (b) `plan.md` §Retomada
+preenchido → você está **retomando**: continue do checkpoint, não replaneje; (c) branch +`orchestra/stynx-canonical` remoto sem worktree local → `git worktree add "/Volumes/Thiamat II/stech/detran-worktrees/stynx-canonical" orchestra/stynx-canonical`; (d) PR aberto
+de outra frente com lock comum ao seu grupo → registre em `plan.md` §Concorrência e trate como
+upstream (base empilhada ou espera). + +**Lições obrigatórias das rodadas fechadas** (R-0003…R-0016; detalhe em `waves.md` §Histórico):
+(1) crie `work/rounds/R-0021/AUTHORIZATION.md` no bootstrap, registrando que o Owner autorizou
+este prompt — sem ele `devai round close` responde `TASK_ROUND_INACTIVE`; (2) pacote de workspace
+novo ou dependência nova (`@stynx-nyx/outbox`, `@stynx-nyx/offline-sync`) exige `pnpm install` pelo
+maestro e commit do `pnpm-lock.yaml` antes do push (CI usa `--frozen-lockfile`); (3) toda edição de +`docs/framework/arch/parameter-catalogue.md` é seguida de `pnpm parameters:generate`, e specs nunca
+contêm chaves de parâmetro como literal (`verify:parameter-catalogue`); (4) helper `.mjs` importado por
+spec TS precisa de `.d.mts` irmão; (5) pacote novo montado no `AppModule` precisa de alias em +`backend/app/vitest.config.ts`; (6) workers não deixam `pnpm check` rodando em segundo plano — encerre
+processos perdidos pelo pid exato antes dos seus gates, nunca por padrão de nome; (7) `git add
+record/proofs` explícito em cada commit de evidência; (8) `audit observe` só no HEAD exato integrado;
+se outra rodada fechar antes, aceite a cadeia de `main`, observe o HEAD integrado e repita `round close`
+(o id de fechamento muda); (9) `seed.sh` faz parte do CI e a rodada dona das fixtures prova as duas
+execuções; (10) ciclos de revisão a partir do segundo restritos aos itens corrigidos; contradição entre
+contrato e código é resolvida pelo Architect por adenda numerada antes de redespachar. +**Lições da C-0001 (C-0002 §4):** (11) relatórios em `work/rounds/R-0021/reports/` versionados com +`git add -f` até R-0018 corrigir o `.gitignore`; depois de todo `git add`, compare +`find <dir> -type f` com `git ls-files <dir>` (R-0016: um `add` que ignora diretório não falha);
+(12) critérios de aceitação imutáveis — mudança só por adenda numerada com decisão do Owner; critério
+substituído aparece no closure como **não cumprido**; proibido repetir as trocas de R-0013/R-0014 e o
+waiver SQL2 de R-0007; (13) toda OD nova no registro canônico +`docs/meta/knowledge-base/open-decisions-rait.md` §C-0002 no mesmo PR; (14) testes de caracterização
+provados verdes **antes** de toda troca de implementação, e reexecutados depois; divergência é FAIL;
+(15) nenhuma integração externa real (PAdES/TSA, SENATRAN, SNE, VAPID…): só _mock_ ou porta;
+(16) `tmp/` não existe na worktree — nada de prompt pede leitura de `tmp/`. Só então rode o bootstrap: + +`bash
+export NODE_AUTH_TOKEN="$(gh auth token)"
+git -C "$(git rev-parse --show-toplevel)" fetch -q origin
+git status --short | wc -l            # deve ser 0
+git branch --show-current             # deve ser orchestra/stynx-canonical
+pnpm install --frozen-lockfile
+pnpm check                            # linha de base verde; se falhar, pare e reporte
+pnpm exec devai doctor --repo-root . --format human
+pnpm exec devai round plan --scaffold --round R-0021 --repo-root . --as-role architect --write --format human
+` +
+Se a worktree ou o branch não existirem, crie-os a partir de `origin/main`: +`git worktree add -b orchestra/stynx-canonical "/Volumes/Thiamat II/stech/detran-worktrees/stynx-canonical" origin/main`. + +**Base empilhada** (só para grupos que precisam de código de um upstream ainda não mesclado):
+num branch ainda não publicado, `git fetch origin && git rebase origin/orchestra/<upstream>` (ou
+crie a worktree já a partir desse upstream). Depois do primeiro push, nunca reescreva o histórico:
+integre novas revisões do upstream com `git merge --no-edit origin/orchestra/<upstream>`. Quando o
+upstream mesclar, integre `origin/main` pela regra do parágrafo seguinte. O PR contra `main` só abre
+depois de o upstream estar em `main`; um branch empilhado pode ser enviado
+(`git push -u origin orchestra/stynx-canonical`) sem PR para que outras frentes empilhem sobre ele. + +**Avanços do `main` durante a rodada.** Outras frentes mesclam enquanto você trabalha. No início de
+cada janela, em cada checkpoint (§7) e antes de cada PR (§9): `git fetch -q origin` e +`git log --oneline HEAD..origin/main`; se houver commits novos, use `git rebase origin/main` somente
+se o branch nunca foi publicado. Caso contrário, use `git merge --no-edit origin/main`. Nunca use +`--force`, `--force-with-lease` ou equivalente. Depois da integração, rode de novo os gates do
+grupo. Ao resolver conflitos: arquivo **gerado** (`backend/domains/**/src/generated`,
+contratos `*.openapi.json` gerados, `ddl/*.sql` de blueprint) → nunca edite à mão, aceite qualquer
+lado, formate o blueprint com prettier e `pnpm blueprints:generate` + `pnpm contracts:openapi`; +`record/proofs/chain.json` ou `record/proofs/work/generic/*.jsonl` → aceite a versão de `main` e
+rode `devai evidence record` de novo para os seus commits (a cadeia nunca é mesclada à mão); +`policy.ts`/`roles.ts` → mantenha os dois blocos, rode `pnpm --filter @detran/shared test`; +`pnpm-lock.yaml` → aceite `main` e `pnpm install --frozen-lockfile`, ou `pnpm install` num commit +`chore(deps)` próprio. Antes de criar um DDL novo (`outbox.*`, CTG-0004), confira o número livre com +`ls backend/database/ddl`; antes de criar uma ADR, confira o próximo número em +`docs/meta/adr/README.md` (R-0018 racionaliza o índice). Se o rebase invalidar um veredito `PASS` do
+reviewer (diff mudou de forma substantiva), peça nova `delivery-review`. +
+## 2. Leitura obrigatória (Architect) — nesta ordem, uma vez +
+1. `AGENTS.md`, `CODESTYLE.md`, `docs/meta/agents/README.md`
+2. `docs/meta/agents/orchestra/README.md`, `model-ladder.md`, `waves.md`
+3. `work/campaigns/C-0002-consolidacao.md` inteiro; `work/campaigns/C-0002-stynx-upstream-spec.md`

- inteiro (§6.11–§6.13 e §8 são desta rodada); depois o "mapa entregável → definições" do `plan.md`:
- `docs/meta/adr/ADR-0018-documents-and-signature-substrate.md`,
- `ADR-0016-infraction-and-notification-boundary.md`, `ADR-0006-ops-field-operations-port.md`,
- `ADR-0015-stynx-1-3-1-angular-22-and-rait-role-catalogue.md`, `ADR-0005-unified-backend-kernel.md`,
- `docs/framework/arch/wp0-stynx-1-3-1-migration.md`, R-0010 `contracts/CTG-0002.md` (C-2-19…C-2-23)
  +4. `docs/framework/arch/parameter-catalogue.md`, `docs/meta/knowledge-base/decision-closure-plan.md`,
- `docs/meta/knowledge-base/steering.md` §H (decisões do Owner já tomadas: não reabra nenhuma)
  +5. Os manuais de papel que usará: `docs/meta/agents/{architect-blueprint,engineer-backend,inspector-tests,transcriber-docs}.md`
  +6. `work/rounds/R-0021/plan.md` (metas, inventário por módulo e critérios já extraídos para esta frente)
  +7. API STYNX 1.4.0, **somente leitura**: `.d.ts` extraídos com
- `npm pack @stynx-nyx/{signature,outbox,offline-sync,notifications}@1.4.0 --pack-destination <scratch>`
- (nunca instalar fora dos CTGs; nunca editar `node_modules`)
-

+Anote em `plan.md` §Leitura o hash (`git rev-parse HEAD`) e a lista do que leu. Não leia além
+disso; o que faltar, os workers leem com listas fechadas. +
+## 3. Plano de decomposição (Architect) → `work/rounds/R-0021/plan.md` + `tasks/` +
+Para cada entregável escreva **tarefas** no esquema DEVAI
+(`docs/meta/agents/orchestra/task.template.json`, `tasks/TASK-nnnn.json`), obedecendo: +
+- **Tríade por módulo**: `TASK` Architect (contrato, DDL, guardas, critérios)

- → `TASK` Inspector (testes que codificam os critérios; caracterização primeiro) → `TASK` Engineer
- (implementação até os testes passarem); mesmo `coupled_task_group`, `upstream_task_id` encadeado.
- Transcrição (ADR, emendas, adenda da spec) é tarefa simples de `transcriber-docs`.
  +- **`target_modules`** com os locks do `plan.md` (`MOD-r21-contracts`, `MOD-deps-stynx-pin`,
- `MOD-app-module`, `MOD-ddl-outbox`, `MOD-ops-offline-sync`…); duas tarefas com o mesmo lock nunca
- correm juntas.
  +- **`acceptance_commands`** só com comandos que existem em `package.json` ou arquivos verificáveis;
- `verify:stynx-pin` é entregável de TASK-0004. Nunca herde comando inexistente
- (ver `orchestra/README.md` §9).
  +- **Modelo e esforço** por `model-ladder.md` (família Codex); anote no `executor`.
  +- Ordem topológica e paralelismo possível (no máximo três tarefas por vez).
-

+`plan.md` já traz metas, inventário, tabela de tarefas (TASK-0001…0014), critérios, mapa, riscos e
+ODs; ajuste só por adenda numerada. Mantenha §Bloqueios, §Retomada e §Leitura. +
+## 4. Prompts dos workers (Architect) → `prompts/TASK-nnnn.md` +
+Componha cada prompt a partir de `docs/meta/agents/orchestra/worker-prompt.template.md`
+(variante do papel), preenchendo **todas** as seções: papel, contexto da frente, leitura
+obrigatória fechada (caminhos exatos), pode/não pode tocar (diretórios exatos), tarefa (o quê),
+critérios de aceitação (comandos + resultado), proibições, entrega (formato fixo). Regras: +
+- O prompt tem de bastar: o worker não conhece esta conversa nem o resto do repositório.
+- Transfira para o prompt os trechos de definição que o worker precisa (assinaturas dos `.d.ts`

- STYNX 1.4.0, campos do recibo `ClinicalArtifactReceipt`, colunas de `integration.outbox`, rotas de
- offline-sync, códigos `RAIT.SIGNATURE_*`), em vez de mandar procurar.
  +- Nada de valor inventado: onde a definição não fixa um valor, o prompt manda usar
- `source_pending` ou abrir `OD-*`.
  +- **Fail-closed de assinatura** vai literal em TASK-0005/0006/0007: sem backend configurado →
- erro; _mock_ nunca em `staging-like`/`production`; nenhuma resposta "assinado" sem evidência.
  +- Calcule `prompt_composition_id` = `PC-` + 16 hex do sha256 do prompt final e grave em
- `compositions.json` (`{task_id, prompt_path, sha256, pc_id, model, effort}`).
-

+## 5. Revisão dos prompts (reviewer, outra família) +
+Monte `reviews/prompt-review-<n>.md` com `docs/meta/agents/orchestra/reviewer-prompt.template.md`
+em modo `prompt-review`, anexando `plan.md` e todos os `prompts/*.md`. Invoque: + +`bash
+tools/orchestra/bridge.sh claude <id-opus-5.5> work/rounds/R-0021/reviews/prompt-review-1.md work/rounds/R-0021/reviews/prompt-review-1.json "/Volumes/Thiamat II/stech/detran-worktrees/stynx-canonical"
+` +
+Leia o veredito. `REVIEW` → corrija os prompts apontados e repita (máximo 2 ciclos). `FAIL` ou
+terceiro ciclo → pare, registre em `plan.md` §Bloqueios e reporte ao humano. Só dispare workers
+com `PASS`. +
+## 6. Disparo dos workers (mesma família) +
+Para cada tarefa pronta (dependências concluídas, lock livre): dispare um subagente da sua CLI
+com o conteúdo de `prompts/TASK-nnnn.md`, modelo e esforço do `executor`, worktree +`/Volumes/Thiamat II/stech/detran-worktrees/stynx-canonical`. Se a sua CLI não tiver subagentes,
+execute você mesmo a tarefa **como se fosse o worker**, obedecendo estritamente ao prompt daquela
+tarefa (fronteira de escrita inclusive). Marque `status=in_progress` na tarefa; ao receber o
+relatório, grave-o em `reports/TASK-nnnn.md`. +
+## 7. Checkpoint por tarefa (Engineer) — hard gates +
+Rode os `acceptance_commands` da tarefa e, ao fim de cada grupo acoplado, `pnpm check` e +`pnpm backend:test:ci`. Nos CTG-0003…0005, também `pnpm backend:rls-smoke` e `pnpm verify:rls-ddl`.
+Falha → triagem em uma linha (`plant-bug | sensor-error | policy-issue | reference-gap`) em `plan.md`
+§Triagem → 1 nova tentativa com o achado no prompt → se falhar, nível acima da mesma família → se
+falhar, `escalated`. Nunca ajuste um teste para passar; nunca edite arquivo gerado. Teste de
+caracterização vermelho depois da troca é regressão do Engineer, nunca do teste. +
+## 8. Revisão da entrega (reviewer, outra família) +
+Para cada grupo acoplado concluído: `git diff --stat` + diff completo + relatórios + critérios em +`reviews/delivery-review-<ctg>.md` (modo `delivery-review`) → ponte → veredito. `PASS` libera o
+commit; `REVIEW` volta ao worker responsável (máximo 2 ciclos); `FAIL` → `escalated`. Achado de
+fail-open de assinatura ou de vazamento entre tenants não tem via de dispensa. +
+## 9. Commit, evidência, PR, merge, fechamento (Engineer; Architect no fechamento) +
+1. `git add` só dos caminhos das tarefas; commit por `CODESTYLE.md` (`<type>(<scope>): …`,

- corpo com ADR/OD citados, trailer de atribuição da sessão).
  +2. Evidência: escreva `evidence-<ctg>.json` (ação, commits, artefatos com sha256, gates) e rode
- `pnpm exec devai evidence record --kind generic --round R-0021 --repo-root . --as-role engineer --input <arquivo> --write --format human`;
- depois `evidence verify`. Commit "chore(devai): …".
  +3. Confirme que todo upstream do grupo está em `main` e rebaseie (`git rebase origin/main`;
- somente se o branch nunca foi publicado); em branch publicado, use
- `git merge --no-edit origin/main`. Rode novamente os gates, faça somente push normal com
- `git push -u origin orchestra/stynx-canonical` e então `gh pr create --base main` com o corpo pelo
- `.github/pull_request_template.md` (papel, ação e fontes, o que muda, verificação, OD tocadas,
- fora de escopo, linha final de atribuição).
  +4. Acompanhe o CI (`gh pr checks <n>`); falha de infraestrutura (pull do Docker, registro) →
- `gh run rerun <id> --failed`; falha de código → volte ao §7 na tarefa certa.
  +5. **Merge** somente com CI verde **e** `PASS` do reviewer na última entrega:
- `gh pr merge <n> --merge`. Depois: `git fetch`, sha do merge, e
- `pnpm exec devai audit observe --repo-root . --at <sha-40> --round R-0021 --as-role auditor --write --format human`.
  +6. Fechamento (DEVAI 1.5.6): `closure.json` (esquema `phase-closure`: `id`, `round_id`,
- `declaring_decision`, `closing_decision`, `batches`, `gates`, `validation_criteria`, `closed_at`,
- `merged_as`; critério não cumprido aparece como tal) e
- `pnpm exec devai round close --round R-0021 --repo-root . --input work/rounds/R-0021/closure.json --as-role architect --write --format human`;
- em seguida `pnpm exec devai round seal --round R-0021 --repo-root . --as-role architect --write --format human`
- (sintaxe conferida com `pnpm exec devai round seal --help`); nenhuma prova sem âncora na cadeia.
  +7. Atualize `docs/meta/agents/orchestra/waves.md` §Histórico (linha da rodada) e
- `docs/meta/knowledge-base/backlog.md`; commit final; apague o branch remoto após o merge.
-

+**Condições de parada** (grave `checkpoint` em `plan.md` §Retomada: tarefas concluídas, em curso,
+pendentes; último veredito; próximos passos): orçamento da janela esgotado; bloqueio por decisão +`OD-*` não coberta pelo steering §H (OD-R21-01…03 sem resposta bloqueiam só o CTG correspondente);
+todos os grupos livres concluídos e os restantes presos a upstream não mesclado; reviewer +`FAIL` após escalada. Um novo maestro retoma pelo mesmo prompt e pelo `plan.md`. +
+## 10. Relatório final (última mensagem da sessão) +
+Papel declarado; frente e rodada; PRs (número, estado); tarefas (id, papel, modelo, resultado);
+ciclos de REVIEW e escaladas; gates executados com saída resumida; evidência (sequência e head da
+cadeia); OD tocadas; lacunas levadas à spec upstream (ids UPS e adendas); o que ficou fora e por quê;
+consumo estimado (`budget.json`); ajustes que recomenda ao método (`orchestra/README.md`, +`model-ladder.md`).
diff --git a/work/rounds/R-0021/inputs/published-api-metadata.json b/work/rounds/R-0021/inputs/published-api-metadata.json
new file mode 100644
index 00000000..10e1f362
--- /dev/null
+++ b/work/rounds/R-0021/inputs/published-api-metadata.json
@@ -0,0 +1,234 @@
+{

- "capturedAt": "2026-09-27",
- "source": "GitHub Packages npm pack archives already acquired in /tmp/detran-r21-api.8hnYyq",
- "scope": "Own package JS and declaration bytes only; package.json and vendored dependencies are not claimed identical",
- "packages": [
- {
-      "name": "@stynx-nyx/signature",
-      "archives": [
-        {
-          "version": "1.4.0",
-          "archive": "stynx-nyx-signature-1.4.0.tgz",
-          "sha256": "207def517d26b754da911052de8eb62406f3d43140a5565725722d5d6cbed1eb",
-          "sha512": "08590feac8121e827954b4ef631158cf4a81bfee9a25c9a36ba3e6ed1a3aa634e8538eff5e54b48cdebf262db39693bf4941206a6a98bd8c0932da12a0a3c38c",
-          "packageName": "@stynx-nyx/signature",
-          "ownFileHashes": {
-            "package/dist/signature/src/digest.d.ts": "e029e6fcc277c632dd57b59b89a0fc652a5c7300a81633a2d97328a8603ded3c",
-            "package/dist/signature/src/digest.js": "c33b7746f67e436d6f46f6de1918c67cfb5fc5f9b83187a46115551d168d8dcf",
-            "package/dist/signature/src/errors.d.ts": "99b4e2fabb273c86ac050ec35401d9f91fdc9ea7450c44bc638997be069e5396",
-            "package/dist/signature/src/errors.js": "91f5c79ba0f3679595f77dd23feae35ec530534ee19f1eb8c1c631cb494671c9",
-            "package/dist/signature/src/govbr-sandbox.d.ts": "00d7495be7e2fb54be8d46dffe873fa0f1e4f1eeff9e6117152303d5e020a90e",
-            "package/dist/signature/src/govbr-sandbox.js": "bc00f825cfd838f96906a9823e562595dd29d4b56f577709eaa0f6799156466e",
-            "package/dist/signature/src/http-provider-client.d.ts": "5765579f92c5163689ce6d4133f9b3c0bfa5a1209b6896b2c929bc6118ef122c",
-            "package/dist/signature/src/http-provider-client.js": "06dd0bdc74bf4b0d8b2a1ae8cf63f873945e26e36f916b5d00789eda377a001b",
-            "package/dist/signature/src/index.d.ts": "ba66c1213982ba9f35286c887bdf4d32c47413c8c0f1ace9c1fe8e1882aa5824",
-            "package/dist/signature/src/index.js": "0e73765904cc11e369242b62af6723b48244dadfae960947f519a39372df2c7d",
-            "package/dist/signature/src/pades.d.ts": "276684e33363b2d4d80ee8c5dd1cc04c02f8fabe22497a825dab961724759835",
-            "package/dist/signature/src/pades.js": "1910d88f715c3c0b6ccd33156c991975aff12241c5a7cf1a2236681993cbc6d3",
-            "package/dist/signature/src/provider-backend.d.ts": "2d11d05ea0b351513fc7611b8c6a9268b0ecd2a9bad13e48d1d280da1ca3173e",
-            "package/dist/signature/src/provider-backend.js": "33a2abd6db9244987d4b634c18e110c2030b1fce32a660231e99202ae9f33e4c",
-            "package/dist/signature/src/sequential.d.ts": "505420b5fbdb84c4fea6f476eb63d749128f3b1b89361ae5f65d9ae5164509b8",
-            "package/dist/signature/src/sequential.js": "913f5d86698234a91a99f8254b1646cb47824bc98b1f28cf1e63f889571ef3d2",
-            "package/dist/signature/src/signature.module.d.ts": "6fcc96531fbd65ca310cc7ebe02faaf4cf0d90febba7fbd35911212ff25192b2",
-            "package/dist/signature/src/signature.module.js": "87ca5b925c559d1f146ab5b3998eb41834d40bd34ccfaf1de99150a8b3b67462",
-            "package/dist/signature/src/signature.service.d.ts": "f29b4697c0dd04a30d38c0921811c304b1fdf5a186fa9442ff77a59214e6259f",
-            "package/dist/signature/src/signature.service.js": "82a57b8178ecbf56018e64d3c36d788c4f447c93adbda7274622a665272e44a7",
-            "package/dist/signature/src/tokens.d.ts": "f14e3e13c2c0fdeec87075c497723fa745561f86d11bba5eba5c0f5bb918d9f3",
-            "package/dist/signature/src/tokens.js": "96e5cdea8d355ca31bef81b8d844191825b4f925ce7207e4ac9a277989136fdc",
-            "package/dist/signature/src/types.d.ts": "fda8329b4e126b20860c0306e48545169d2fa118aed49fd6f732905007f76ade",
-            "package/dist/signature/src/types.js": "b0d2bc4142d0c62d43f996aaeb64f22c4889ac853f8a3765758b505d972d0149",
-            "package/dist/signature/src/xmldsig/c14n.d.ts": "5eedcec978c227f6426b52ce69be09f21f163e90dc2b3474e699330c8e4b325e",
-            "package/dist/signature/src/xmldsig/c14n.js": "81bd018c42c98cef5027093359bd882281a13563dec9759bcdd939b4d33295ad",
-            "package/dist/signature/src/xmldsig/index.d.ts": "bee0f3869def2c020f39f674015146dc6340ef56d757c50103c6a514ca31b4e5",
-            "package/dist/signature/src/xmldsig/index.js": "0b6f6d8bd6a58fe3d8f80f3beb79f836842bae41f2acefeffdbf4f82db5b49fc",
-            "package/dist/signature/src/xmldsig/sign.d.ts": "09bcf810064399ab8796825a0b6db9f16456a2a85967e82836f6ed48d2cf8723",
-            "package/dist/signature/src/xmldsig/sign.js": "91d9d7491a035db2f323257a84ff1483f7aa7fe7c9855f274dd11a5dcfa1360e",
-            "package/dist/signature/src/xmldsig/types.d.ts": "cb72e14a04cdd5a7e6e9c81718ec8e2de601dc382199ca1171dfdee9296b2099",
-            "package/dist/signature/src/xmldsig/types.js": "f237fdbdfc5823cd06f0aabc654e7e632cb7f52c94b67d22cfa2f3be4df2cb74",
-            "package/dist/signature/src/xmldsig/verify.d.ts": "0e66c8e9c314d8d6a96483a77134d75f598327df7fac18e3e6277e24b5b96848",
-            "package/dist/signature/src/xmldsig/verify.js": "4b67c11209aad48979b4e941d4d5eede0b767f2d1b8ad8c8d76a5cfe34b7ca7f"
-          }
-        },
-        {
-          "version": "1.5.0-rc.2",
-          "archive": "stynx-nyx-signature-1.5.0-rc.2.tgz",
-          "sha256": "8209e1dd42ff23073d825fc5fa213078a9c9382e0f3be344c259df1134850607",
-          "sha512": "c3d1776ebda2b1f36d3c84488b4cbdca5423c7674e56fd454ca9401b5227310974ced8cd03253e0332508380d2d01b3f7d9e01055c1c890a102d76fde028324a",
-          "packageName": "@stynx-nyx/signature",
-          "ownFileHashes": {
-            "package/dist/signature/src/digest.d.ts": "e029e6fcc277c632dd57b59b89a0fc652a5c7300a81633a2d97328a8603ded3c",
-            "package/dist/signature/src/digest.js": "c33b7746f67e436d6f46f6de1918c67cfb5fc5f9b83187a46115551d168d8dcf",
-            "package/dist/signature/src/errors.d.ts": "99b4e2fabb273c86ac050ec35401d9f91fdc9ea7450c44bc638997be069e5396",
-            "package/dist/signature/src/errors.js": "91f5c79ba0f3679595f77dd23feae35ec530534ee19f1eb8c1c631cb494671c9",
-            "package/dist/signature/src/govbr-sandbox.d.ts": "00d7495be7e2fb54be8d46dffe873fa0f1e4f1eeff9e6117152303d5e020a90e",
-            "package/dist/signature/src/govbr-sandbox.js": "bc00f825cfd838f96906a9823e562595dd29d4b56f577709eaa0f6799156466e",
-            "package/dist/signature/src/http-provider-client.d.ts": "5765579f92c5163689ce6d4133f9b3c0bfa5a1209b6896b2c929bc6118ef122c",
-            "package/dist/signature/src/http-provider-client.js": "06dd0bdc74bf4b0d8b2a1ae8cf63f873945e26e36f916b5d00789eda377a001b",
-            "package/dist/signature/src/index.d.ts": "ba66c1213982ba9f35286c887bdf4d32c47413c8c0f1ace9c1fe8e1882aa5824",
-            "package/dist/signature/src/index.js": "0e73765904cc11e369242b62af6723b48244dadfae960947f519a39372df2c7d",
-            "package/dist/signature/src/pades.d.ts": "276684e33363b2d4d80ee8c5dd1cc04c02f8fabe22497a825dab961724759835",
-            "package/dist/signature/src/pades.js": "1910d88f715c3c0b6ccd33156c991975aff12241c5a7cf1a2236681993cbc6d3",
-            "package/dist/signature/src/provider-backend.d.ts": "2d11d05ea0b351513fc7611b8c6a9268b0ecd2a9bad13e48d1d280da1ca3173e",
-            "package/dist/signature/src/provider-backend.js": "33a2abd6db9244987d4b634c18e110c2030b1fce32a660231e99202ae9f33e4c",
-            "package/dist/signature/src/sequential.d.ts": "505420b5fbdb84c4fea6f476eb63d749128f3b1b89361ae5f65d9ae5164509b8",
-            "package/dist/signature/src/sequential.js": "913f5d86698234a91a99f8254b1646cb47824bc98b1f28cf1e63f889571ef3d2",
-            "package/dist/signature/src/signature.module.d.ts": "6fcc96531fbd65ca310cc7ebe02faaf4cf0d90febba7fbd35911212ff25192b2",
-            "package/dist/signature/src/signature.module.js": "87ca5b925c559d1f146ab5b3998eb41834d40bd34ccfaf1de99150a8b3b67462",
-            "package/dist/signature/src/signature.service.d.ts": "f29b4697c0dd04a30d38c0921811c304b1fdf5a186fa9442ff77a59214e6259f",
-            "package/dist/signature/src/signature.service.js": "82a57b8178ecbf56018e64d3c36d788c4f447c93adbda7274622a665272e44a7",
-            "package/dist/signature/src/tokens.d.ts": "f14e3e13c2c0fdeec87075c497723fa745561f86d11bba5eba5c0f5bb918d9f3",
-            "package/dist/signature/src/tokens.js": "96e5cdea8d355ca31bef81b8d844191825b4f925ce7207e4ac9a277989136fdc",
-            "package/dist/signature/src/types.d.ts": "fda8329b4e126b20860c0306e48545169d2fa118aed49fd6f732905007f76ade",
-            "package/dist/signature/src/types.js": "b0d2bc4142d0c62d43f996aaeb64f22c4889ac853f8a3765758b505d972d0149",
-            "package/dist/signature/src/xmldsig/c14n.d.ts": "5eedcec978c227f6426b52ce69be09f21f163e90dc2b3474e699330c8e4b325e",
-            "package/dist/signature/src/xmldsig/c14n.js": "81bd018c42c98cef5027093359bd882281a13563dec9759bcdd939b4d33295ad",
-            "package/dist/signature/src/xmldsig/index.d.ts": "bee0f3869def2c020f39f674015146dc6340ef56d757c50103c6a514ca31b4e5",
-            "package/dist/signature/src/xmldsig/index.js": "0b6f6d8bd6a58fe3d8f80f3beb79f836842bae41f2acefeffdbf4f82db5b49fc",
-            "package/dist/signature/src/xmldsig/sign.d.ts": "09bcf810064399ab8796825a0b6db9f16456a2a85967e82836f6ed48d2cf8723",
-            "package/dist/signature/src/xmldsig/sign.js": "91d9d7491a035db2f323257a84ff1483f7aa7fe7c9855f274dd11a5dcfa1360e",
-            "package/dist/signature/src/xmldsig/types.d.ts": "cb72e14a04cdd5a7e6e9c81718ec8e2de601dc382199ca1171dfdee9296b2099",
-            "package/dist/signature/src/xmldsig/types.js": "f237fdbdfc5823cd06f0aabc654e7e632cb7f52c94b67d22cfa2f3be4df2cb74",
-            "package/dist/signature/src/xmldsig/verify.d.ts": "0e66c8e9c314d8d6a96483a77134d75f598327df7fac18e3e6277e24b5b96848",
-            "package/dist/signature/src/xmldsig/verify.js": "4b67c11209aad48979b4e941d4d5eede0b767f2d1b8ad8c8d76a5cfe34b7ca7f"
-          }
-        }
-      ],
-      "ownFilesIdentical": true,
-      "ownFileCount": 34
- },
- {
-      "name": "@stynx-nyx/outbox",
-      "archives": [
-        {
-          "version": "1.4.0",
-          "archive": "stynx-nyx-outbox-1.4.0.tgz",
-          "sha256": "0bf68d6dfc0977925ffe2fbca297c90fc783a5698952b410942fb50e66eb9da1",
-          "sha512": "03779c73e546a294836cdbc7db6fd0224d59d30cc1c238d12c9183a27497eae4d2b886e54641df450539c0cd217168f8969b669ac43bbc49af38163e1f2c8561",
-          "packageName": "@stynx-nyx/outbox",
-          "ownFileHashes": {
-            "package/dist/outbox/src/ack-signature.d.ts": "6e67ae496baf430c0a7b04d1042a709146c5ea6889f3a91a9a4687390cf8c2f1",
-            "package/dist/outbox/src/ack-signature.js": "0430d9a109e69bfebc7116ad6bfb68192760c1062b18b5b093f0aac9aea31d55",
-            "package/dist/outbox/src/backoff.d.ts": "bf0fd4379ef1b0518cc565d0e9b8f45c5fa6d3a3ad75c81cc919fcebd039f8a5",
-            "package/dist/outbox/src/backoff.js": "47e262af493dabeb084d3e65cd372d59f6167c14042a0982bd658c2f395eb9ea",
-            "package/dist/outbox/src/constants.d.ts": "5608169fc9e1acc63721b3ca2374eba016ab3939df86ff74f154f3732bf36a0c",
-            "package/dist/outbox/src/constants.js": "593f3f4e8ee8aef7945a1214c23cbf1b3202edabfe7eaa58629f78f884ee743e",
-            "package/dist/outbox/src/errors.d.ts": "43c05711c9ba2fa6612cf305e39a61d54dd778114e87156d1b478c249a837ccb",
-            "package/dist/outbox/src/errors.js": "de87119683a00a9c0535d4480fba4ad9a16950899ff7b648c0f371a1424195ff",
-            "package/dist/outbox/src/http-outbox-dispatcher.d.ts": "86184569141a221503a2c2d8181bb073df4badd085bdb0bfc24b242f044c7f34",
-            "package/dist/outbox/src/http-outbox-dispatcher.js": "916784ea4596850e4226477381030f0720e5df467478d7a7fc4fa1c9bdd377fd",
-            "package/dist/outbox/src/index.d.ts": "87cafc674ad5dad11bcd0a30dc9bf2c23f053176c8fb8d3d13be8790d8738593",
-            "package/dist/outbox/src/index.js": "23ea95b367eb4d5142759627008e4501355dd319d73f9880c4fea72db21d52ab",
-            "package/dist/outbox/src/metrics.d.ts": "826350ea81f85da8ad9325a89c70dc882d9530ffb0df1c9ed6ced16971eaab31",
-            "package/dist/outbox/src/metrics.js": "e3641fda8fdd430ee58bfde5ff87336b00fc3ad8956dbcaccfad6811ca473347",
-            "package/dist/outbox/src/outbox.module.d.ts": "189a82c4e1e82969991cb35b6f931eb199bce0da003a255f0c730c838473abcc",
-            "package/dist/outbox/src/outbox.module.js": "6a86efe56de8974d7871dafece9cd5027f35e436943a14e66fa6ad9d09c4f01e",
-            "package/dist/outbox/src/outbox.service.d.ts": "b211e8682d7776679daac2cec97b641f488226d16cf9b0c9bda954695dea4a86",
-            "package/dist/outbox/src/outbox.service.js": "bf26f991682944742cf54f84794983f9b8023673274893c0e6d645604f96c1d9",
-            "package/dist/outbox/src/row-mapper.d.ts": "95f16a057b8fd75ee6287d8e887a036b36e7a80bdc1ab165caa15f2545024721",
-            "package/dist/outbox/src/row-mapper.js": "45c4c14088d417db33577c8607450047a13b1707815f33b4325aba01c2565a6c",
-            "package/dist/outbox/src/types.d.ts": "69e452990928a16918320ff9c2351a27ffcc04b8576abf609056fba9f266c2cb",
-            "package/dist/outbox/src/types.js": "1a64d9fe08a70138d02c54a4e6bc5f12400595f26cdf8dfa45d07cdb108be307"
-          }
-        },
-        {
-          "version": "1.5.0-rc.2",
-          "archive": "stynx-nyx-outbox-1.5.0-rc.2.tgz",
-          "sha256": "6df718055ff04fd2708db71360ffc169a74f5060e1c5aa54586dc37857c5d356",
-          "sha512": "8e83dcab9aaa5ab8d0a0be4e2375b7b8902332377867b76dd51db853da3e150931cfc6c1c666f8ef1eb10d6bbe8db060d0ee8cc5a46200b5f0ae735a384cf450",
-          "packageName": "@stynx-nyx/outbox",
-          "ownFileHashes": {
-            "package/dist/outbox/src/ack-signature.d.ts": "6e67ae496baf430c0a7b04d1042a709146c5ea6889f3a91a9a4687390cf8c2f1",
-            "package/dist/outbox/src/ack-signature.js": "0430d9a109e69bfebc7116ad6bfb68192760c1062b18b5b093f0aac9aea31d55",
-            "package/dist/outbox/src/backoff.d.ts": "bf0fd4379ef1b0518cc565d0e9b8f45c5fa6d3a3ad75c81cc919fcebd039f8a5",
-            "package/dist/outbox/src/backoff.js": "47e262af493dabeb084d3e65cd372d59f6167c14042a0982bd658c2f395eb9ea",
-            "package/dist/outbox/src/constants.d.ts": "5608169fc9e1acc63721b3ca2374eba016ab3939df86ff74f154f3732bf36a0c",
-            "package/dist/outbox/src/constants.js": "593f3f4e8ee8aef7945a1214c23cbf1b3202edabfe7eaa58629f78f884ee743e",
-            "package/dist/outbox/src/errors.d.ts": "43c05711c9ba2fa6612cf305e39a61d54dd778114e87156d1b478c249a837ccb",
-            "package/dist/outbox/src/errors.js": "de87119683a00a9c0535d4480fba4ad9a16950899ff7b648c0f371a1424195ff",
-            "package/dist/outbox/src/http-outbox-dispatcher.d.ts": "86184569141a221503a2c2d8181bb073df4badd085bdb0bfc24b242f044c7f34",
-            "package/dist/outbox/src/http-outbox-dispatcher.js": "916784ea4596850e4226477381030f0720e5df467478d7a7fc4fa1c9bdd377fd",
-            "package/dist/outbox/src/index.d.ts": "87cafc674ad5dad11bcd0a30dc9bf2c23f053176c8fb8d3d13be8790d8738593",
-            "package/dist/outbox/src/index.js": "23ea95b367eb4d5142759627008e4501355dd319d73f9880c4fea72db21d52ab",
-            "package/dist/outbox/src/metrics.d.ts": "826350ea81f85da8ad9325a89c70dc882d9530ffb0df1c9ed6ced16971eaab31",
-            "package/dist/outbox/src/metrics.js": "e3641fda8fdd430ee58bfde5ff87336b00fc3ad8956dbcaccfad6811ca473347",
-            "package/dist/outbox/src/outbox.module.d.ts": "189a82c4e1e82969991cb35b6f931eb199bce0da003a255f0c730c838473abcc",
-            "package/dist/outbox/src/outbox.module.js": "6a86efe56de8974d7871dafece9cd5027f35e436943a14e66fa6ad9d09c4f01e",
-            "package/dist/outbox/src/outbox.service.d.ts": "b211e8682d7776679daac2cec97b641f488226d16cf9b0c9bda954695dea4a86",
-            "package/dist/outbox/src/outbox.service.js": "bf26f991682944742cf54f84794983f9b8023673274893c0e6d645604f96c1d9",
-            "package/dist/outbox/src/row-mapper.d.ts": "95f16a057b8fd75ee6287d8e887a036b36e7a80bdc1ab165caa15f2545024721",
-            "package/dist/outbox/src/row-mapper.js": "45c4c14088d417db33577c8607450047a13b1707815f33b4325aba01c2565a6c",
-            "package/dist/outbox/src/types.d.ts": "69e452990928a16918320ff9c2351a27ffcc04b8576abf609056fba9f266c2cb",
-            "package/dist/outbox/src/types.js": "1a64d9fe08a70138d02c54a4e6bc5f12400595f26cdf8dfa45d07cdb108be307"
-          }
-        }
-      ],
-      "ownFilesIdentical": true,
-      "ownFileCount": 22
- },
- {
-      "name": "@stynx-nyx/offline-sync",
-      "archives": [
-        {
-          "version": "1.4.0",
-          "archive": "stynx-nyx-offline-sync-1.4.0.tgz",
-          "sha256": "5d36d734da4551da626da5c03add852368035f506bc5e1145473a8c20bc89584",
-          "sha512": "dfb1a152fc5fef7ace4dae5619b887d23a20eb36dca8536923513d851a494b9e5e927dc927a4a104bceebdb1885b747af149c5f304155212f75d868209dc3243",
-          "packageName": "@stynx-nyx/offline-sync",
-          "ownFileHashes": {
-            "package/dist/offline-sync/src/errors.d.ts": "9791ca77e188e4ab582ab64d90f8002a55134143f766cadd36d62657a9fc7321",
-            "package/dist/offline-sync/src/errors.js": "1fd9fca5ac0bc0ebe10a150425d06b2bfeaba5ba078cf8b9ba030fbf08e8b849",
-            "package/dist/offline-sync/src/in-memory-offline-sync.store.d.ts": "6e58f59962130aaba36c872109faf0b0159ff1559b61cac73951caf54413b0f1",
-            "package/dist/offline-sync/src/in-memory-offline-sync.store.js": "028edda74b8c02360f5004075647260fcf5793f1a1f78d8b1c3af84eb9af2d08",
-            "package/dist/offline-sync/src/index.d.ts": "9466724acca04ffdb427ebd514b5613408698cac03ef0106e7770e41b96c15b6",
-            "package/dist/offline-sync/src/index.js": "f5de40da142d8c50389bd401b47374b9164ada015cc68a9441790c506d1a8c79",
-            "package/dist/offline-sync/src/offline-sync.controller.d.ts": "a9fe7b2645c5aea5366485573d1db7b6808d762e86a7aad566b00e9c3c50958c",
-            "package/dist/offline-sync/src/offline-sync.controller.js": "f2a0f88014530c586e2dd4216a62d9f8e5852c1655354ad73ce9b0d543fe0483",
-            "package/dist/offline-sync/src/offline-sync.module.d.ts": "552fc2c0033b05a16d1f962b75b0493ea35891e1b0531333ec591970a5f42a7b",
-            "package/dist/offline-sync/src/offline-sync.module.js": "3d4037b4db7515beed39bbb15e5c8366110cade366be6499cc27766dc559ea6f",
-            "package/dist/offline-sync/src/offline-sync.service.d.ts": "74fa5bcf6134e20dcd5c27c8a9c9f2bdb0ea4f0b60d10f16d65af71ea5ee7c1c",
-            "package/dist/offline-sync/src/offline-sync.service.js": "177ed05e9f3a1275d06fe89c10b470bd34aa9e0f2f8d72233759acd048d4b21c",
-            "package/dist/offline-sync/src/postgres-offline-sync.store.d.ts": "17623a6cbf14d9e4afa55e3cf946e04497e261f9ab814c67e39f6f7f7c3f649a",
-            "package/dist/offline-sync/src/postgres-offline-sync.store.js": "bd4d671e6c30d9fbe3829a07694927236816aa668a7da6757a6fd0dde02a9475",
-            "package/dist/offline-sync/src/stynx-offline-sync.context.d.ts": "fcebc8134cc5adf24633a46aa8be589538a8d627496b56c95672ccf981d22d68",
-            "package/dist/offline-sync/src/stynx-offline-sync.context.js": "5de2fae32ddf41e6fd4eaeb69b7d959e3d0793f8a580b3aa5d544aedff28992d",
-            "package/dist/offline-sync/src/tokens.d.ts": "4e61e74969a88170ece0593c2a5adc7350fa5d92839c1c6d919a1faa6e1fb7ae",
-            "package/dist/offline-sync/src/tokens.js": "5bfa2f9d653cf5c05a515758302aed86305333fc6644a12da511c729e38c98cb",
-            "package/dist/offline-sync/src/types.d.ts": "6d4828e445eb75ed35a73749975b2eb7fb1d209f128f61dc01201e431eef30a4",
-            "package/dist/offline-sync/src/types.js": "b0d2bc4142d0c62d43f996aaeb64f22c4889ac853f8a3765758b505d972d0149"
-          }
-        },
-        {
-          "version": "1.5.0-rc.2",
-          "archive": "stynx-nyx-offline-sync-1.5.0-rc.2.tgz",
-          "sha256": "77a0076c3f5f22edee309a270c2137a02476040883f3148f8fcd140a172762af",
-          "sha512": "d4c7536e9c41f20e6b1fe283c7be4a982976a1bbd7c993a7ef946a498ae2cff8d5efa80e59e7d3274e9b7e1bde119011a6e210c5af092dd90ab2dc349b5856ac",
-          "packageName": "@stynx-nyx/offline-sync",
-          "ownFileHashes": {
-            "package/dist/offline-sync/src/errors.d.ts": "9791ca77e188e4ab582ab64d90f8002a55134143f766cadd36d62657a9fc7321",
-            "package/dist/offline-sync/src/errors.js": "1fd9fca5ac0bc0ebe10a150425d06b2bfeaba5ba078cf8b9ba030fbf08e8b849",
-            "package/dist/offline-sync/src/in-memory-offline-sync.store.d.ts": "6e58f59962130aaba36c872109faf0b0159ff1559b61cac73951caf54413b0f1",
-            "package/dist/offline-sync/src/in-memory-offline-sync.store.js": "028edda74b8c02360f5004075647260fcf5793f1a1f78d8b1c3af84eb9af2d08",
-            "package/dist/offline-sync/src/index.d.ts": "9466724acca04ffdb427ebd514b5613408698cac03ef0106e7770e41b96c15b6",
-            "package/dist/offline-sync/src/index.js": "f5de40da142d8c50389bd401b47374b9164ada015cc68a9441790c506d1a8c79",
-            "package/dist/offline-sync/src/offline-sync.controller.d.ts": "a9fe7b2645c5aea5366485573d1db7b6808d762e86a7aad566b00e9c3c50958c",
-            "package/dist/offline-sync/src/offline-sync.controller.js": "f2a0f88014530c586e2dd4216a62d9f8e5852c1655354ad73ce9b0d543fe0483",
-            "package/dist/offline-sync/src/offline-sync.module.d.ts": "552fc2c0033b05a16d1f962b75b0493ea35891e1b0531333ec591970a5f42a7b",
-            "package/dist/offline-sync/src/offline-sync.module.js": "3d4037b4db7515beed39bbb15e5c8366110cade366be6499cc27766dc559ea6f",
-            "package/dist/offline-sync/src/offline-sync.service.d.ts": "74fa5bcf6134e20dcd5c27c8a9c9f2bdb0ea4f0b60d10f16d65af71ea5ee7c1c",
-            "package/dist/offline-sync/src/offline-sync.service.js": "177ed05e9f3a1275d06fe89c10b470bd34aa9e0f2f8d72233759acd048d4b21c",
-            "package/dist/offline-sync/src/postgres-offline-sync.store.d.ts": "17623a6cbf14d9e4afa55e3cf946e04497e261f9ab814c67e39f6f7f7c3f649a",
-            "package/dist/offline-sync/src/postgres-offline-sync.store.js": "bd4d671e6c30d9fbe3829a07694927236816aa668a7da6757a6fd0dde02a9475",
-            "package/dist/offline-sync/src/stynx-offline-sync.context.d.ts": "fcebc8134cc5adf24633a46aa8be589538a8d627496b56c95672ccf981d22d68",
-            "package/dist/offline-sync/src/stynx-offline-sync.context.js": "5de2fae32ddf41e6fd4eaeb69b7d959e3d0793f8a580b3aa5d544aedff28992d",
-            "package/dist/offline-sync/src/tokens.d.ts": "4e61e74969a88170ece0593c2a5adc7350fa5d92839c1c6d919a1faa6e1fb7ae",
-            "package/dist/offline-sync/src/tokens.js": "5bfa2f9d653cf5c05a515758302aed86305333fc6644a12da511c729e38c98cb",
-            "package/dist/offline-sync/src/types.d.ts": "6d4828e445eb75ed35a73749975b2eb7fb1d209f128f61dc01201e431eef30a4",
-            "package/dist/offline-sync/src/types.js": "b0d2bc4142d0c62d43f996aaeb64f22c4889ac853f8a3765758b505d972d0149"
-          }
-        }
-      ],
-      "ownFilesIdentical": true,
-      "ownFileCount": 20
- }
- ]
  +}
  diff --git a/work/rounds/R-0021/inputs/published-api-offline-sync.md b/work/rounds/R-0021/inputs/published-api-offline-sync.md
  new file mode 100644
  index 00000000..f1a4e07b
  --- /dev/null
  +++ b/work/rounds/R-0021/inputs/published-api-offline-sync.md
  @@ -0,0 +1,744 @@
  +# Published API — @stynx-nyx/offline-sync 1.4.0 / 1.5.0-rc.2
-

+Extracted from archived npm tarballs; byte-identical own JS and declarations across both versions. See published-api-metadata.json for archive and per-file hashes. This is an inspection input, not a local API implementation. +
+## package/dist/offline-sync/src/errors.d.ts +
+```text
+import { HttpException } from '@nestjs/common';
+export type OfflineSyncErrorCode = 'OFFLINE_SYNC_UNAUTHENTICATED' | 'OFFLINE_SYNC_FORBIDDEN' | 'OFFLINE_SYNC_CONTEXT_OVERRIDE' | 'OFFLINE_SYNC_INVALID_INPUT' | 'OFFLINE_SYNC_RANGE_NOT_FOUND' | 'OFFLINE_SYNC_RANGE_UNAVAILABLE' | 'OFFLINE_SYNC_RESERVATION_NOT_FOUND' | 'OFFLINE_SYNC_RESERVATION_STATE' | 'OFFLINE_SYNC_QUEUE_ITEM_NOT_FOUND' | 'OFFLINE_SYNC_QUEUE_ID_REUSED' | 'OFFLINE_SYNC_CONFLICT_NOT_FOUND' | 'OFFLINE_SYNC_CONFLICT_STATE';
+export declare class OfflineSyncError extends HttpException {

- readonly code: OfflineSyncErrorCode;
- constructor(code: OfflineSyncErrorCode, status: number, message: string);
  +}
  +//# sourceMappingURL=errors.d.ts.map
  +```
-

+## package/dist/offline-sync/src/in-memory-offline-sync.store.d.ts +
+```text
+import type { CancelNumberingReservationInput, NumberingRange, NumberingReservation, OfflineSyncStore, OpenSyncConflictInput, ResolveSyncConflictInput, StoredSyncQueueItem, SubmitSyncBatchInput, SubmitSyncBatchResult, SyncConflict, TrustedOfflineSyncScope, ReserveNumberingInput } from './types';
+/** Deterministic process-local store for tests and sandbox wiring. */
+export declare class InMemoryOfflineSyncStore implements OfflineSyncStore {

- private readonly ranges;
- private readonly reservations;
- private readonly queueItems;
- private readonly payloadIndex;
- private readonly conflicts;
- seedNumberingRange(range: NumberingRange): void;
- reserveNumbering(scope: TrustedOfflineSyncScope, input: ReserveNumberingInput, _now: string, defaultValidUntil: string): Promise<NumberingReservation>;
- cancelNumberingReservation(scope: TrustedOfflineSyncScope, reservationId: string, _input: CancelNumberingReservationInput, _now: string): Promise<NumberingReservation>;
- submitSyncBatch(scope: TrustedOfflineSyncScope, input: SubmitSyncBatchInput, now: string): Promise<SubmitSyncBatchResult>;
- openConflict(scope: TrustedOfflineSyncScope, queueItemId: string, input: OpenSyncConflictInput, _now: string): Promise<SyncConflict>;
- resolveConflict(scope: TrustedOfflineSyncScope, conflictId: string, input: ResolveSyncConflictInput, now: string): Promise<SyncConflict>;
- getQueueItem(tenantId: string, queueItemId: string): StoredSyncQueueItem | undefined;
- private key;
  +}
  +//# sourceMappingURL=in-memory-offline-sync.store.d.ts.map
  +```
-

+## package/dist/offline-sync/src/index.d.ts +
+```text
+/**

- - Tenant-scoped numbering reservation and offline sync server primitives.
- -
- - @packageDocumentation
- */
  +export * from './errors';
  +export * from './in-memory-offline-sync.store';
  +export * from './offline-sync.controller';
  +export * from './offline-sync.module';
  +export * from './offline-sync.service';
  +export * from './postgres-offline-sync.store';
  +export * from './stynx-offline-sync.context';
  +export * from './tokens';
  +export * from './types';
  +//# sourceMappingURL=index.d.ts.map
  +```
-

+## package/dist/offline-sync/src/offline-sync.controller.d.ts +
+```text
+import { OfflineSyncService } from './offline-sync.service';
+import type { CancelNumberingReservationInput, ReserveNumberingInput, ResolveSyncConflictInput, SubmitSyncBatchInput } from './types';
+export declare class OfflineSyncController {

- private readonly service;
- constructor(service: OfflineSyncService);
- reserveNumbering(input: ReserveNumberingInput): Promise<import("./types").NumberingReservation>;
- cancelNumbering(id: string, input: CancelNumberingReservationInput): Promise<import("./types").NumberingReservation>;
- submitBatch(input: SubmitSyncBatchInput): Promise<import("./types").SubmitSyncBatchResult>;
- resolveConflict(id: string, input: ResolveSyncConflictInput): Promise<import("./types").SyncConflict>;
- private rejectContextOverrides;
  +}
  +//# sourceMappingURL=offline-sync.controller.d.ts.map
  +```
-

+## package/dist/offline-sync/src/offline-sync.module.d.ts +
+```text
+import { type DynamicModule } from '@nestjs/common';
+import type { StynxOfflineSyncModuleOptions } from './types';
+export declare class StynxOfflineSyncModule {

- static forRoot(options?: StynxOfflineSyncModuleOptions): DynamicModule;
- static inMemory(options?: Omit<StynxOfflineSyncModuleOptions, 'store'>): DynamicModule;
  +}
  +//# sourceMappingURL=offline-sync.module.d.ts.map
  +```
-

+## package/dist/offline-sync/src/offline-sync.service.d.ts +
+```text
+import type { CancelNumberingReservationInput, NumberingReservation, OfflineSyncContextPort, OfflineSyncStore, OpenSyncConflictInput, ReserveNumberingInput, ResolveSyncConflictInput, StynxOfflineSyncModuleOptions, SubmitSyncBatchInput, SubmitSyncBatchResult, SyncConflict } from './types';
+export declare class OfflineSyncService {

- private readonly store;
- private readonly context;
- private readonly options;
- constructor(store: OfflineSyncStore, context: OfflineSyncContextPort, options: StynxOfflineSyncModuleOptions);
- reserveNumbering(input: ReserveNumberingInput): Promise<NumberingReservation>;
- cancelNumberingReservation(reservationId: string, input?: CancelNumberingReservationInput): Promise<NumberingReservation>;
- submitSyncBatch(input: SubmitSyncBatchInput): Promise<SubmitSyncBatchResult>;
- openConflict(queueItemId: string, input: OpenSyncConflictInput): Promise<SyncConflict>;
- resolveConflict(conflictId: string, input: ResolveSyncConflictInput): Promise<SyncConflict>;
- private now;
- private assertEntityType;
- private assertText;
- private invalid;
  +}
  +//# sourceMappingURL=offline-sync.service.d.ts.map
  +```
-

+## package/dist/offline-sync/src/offline-sync.service.js +
+```text
+"use strict";
+var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {

- var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
- if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
- else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
- return c > 3 && r && Object.defineProperty(target, key, r), r;
  +};
  +var __metadata = (this && this.__metadata) || function (k, v) {
- if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
  +};
  +var __param = (this && this.__param) || function (paramIndex, decorator) {
- return function (target, key) { decorator(target, key, paramIndex); }
  +};
  +Object.defineProperty(exports, "__esModule", { value: true });
  +exports.OfflineSyncService = void 0;
  +const common_1 = require("@nestjs/common");
  +const errors_1 = require("./errors");
  +const tokens_1 = require("./tokens");
  +const sha256Pattern = /^sha256:[0-9a-f]{64}$/u;
  +let OfflineSyncService = class OfflineSyncService {
- store;
- context;
- options;
- constructor(store, context, options) {
-        this.store = store;
-        this.context = context;
-        this.options = options;
- }
- async reserveNumbering(input) {
-        this.assertText(input.orgUnitId, 'orgUnitId');
-        this.assertText(input.deviceId, 'deviceId');
-        this.assertText(input.shiftId, 'shiftId');
-        this.assertEntityType(input.entityType);
-        if (!Number.isSafeInteger(input.requestedSize) ||
-            input.requestedSize < 1 ||
-            input.requestedSize > 100) {
-            this.invalid('requestedSize must be an integer between 1 and 100.');
-        }
-        const now = this.now();
-        const validUntil = new Date(Date.parse(now) + (this.options.reservationTtlMs ?? 86_400_000)).toISOString();
-        if (input.validUntil && Date.parse(input.validUntil) <= Date.parse(now)) {
-            this.invalid('validUntil must be later than the current time.');
-        }
-        return this.store.reserveNumbering(this.context.current(), input, now, validUntil);
- }
- async cancelNumberingReservation(reservationId, input = {}) {
-        this.assertText(reservationId, 'reservationId');
-        if (input.reason !== undefined && input.reason.length > 500) {
-            this.invalid('reason must not exceed 500 characters.');
-        }
-        return this.store.cancelNumberingReservation(this.context.current(), reservationId, input, this.now());
- }
- async submitSyncBatch(input) {
-        this.assertText(input.orgUnitId, 'orgUnitId');
-        this.assertText(input.deviceId, 'deviceId');
-        this.assertText(input.deviceBatchId, 'deviceBatchId');
-        if (!Array.isArray(input.items) || input.items.length < 1 || input.items.length > 100) {
-            this.invalid('items must contain between 1 and 100 queue items.');
-        }
-        const queueIds = new Set();
-        for (const item of input.items) {
-            this.assertText(item.queueItemId, 'queueItemId');
-            this.assertEntityType(item.entityType);
-            this.assertText(item.localEntityId, 'localEntityId');
-            this.assertText(item.idempotencyKey, 'idempotencyKey');
-            if (!sha256Pattern.test(item.payloadHash)) {
-                this.invalid('payloadHash must be a canonical sha256-prefixed hexadecimal digest.');
-            }
-            if (!Number.isFinite(Date.parse(item.createdLocallyAt))) {
-                this.invalid('createdLocallyAt must be an ISO-8601 timestamp.');
-            }
-            if (!item.payloadJson ||
-                typeof item.payloadJson !== 'object' ||
-                Array.isArray(item.payloadJson)) {
-                this.invalid('payloadJson must be an object.');
-            }
-            if (queueIds.has(item.queueItemId)) {
-                this.invalid(`queueItemId ${item.queueItemId} appears more than once in the batch.`);
-            }
-            queueIds.add(item.queueItemId);
-        }
-        return this.store.submitSyncBatch(this.context.current(), input, this.now());
- }
- async openConflict(queueItemId, input) {
-        this.assertText(queueItemId, 'queueItemId');
-        this.assertText(input.conflictType, 'conflictType');
-        this.assertText(input.description, 'description');
-        return this.store.openConflict(this.context.current(), queueItemId, input, this.now());
- }
- async resolveConflict(conflictId, input) {
-        this.assertText(conflictId, 'conflictId');
-        if (!['device-wins', 'server-wins', 'manual-review'].includes(input.resolution)) {
-            this.invalid('resolution must be device-wins, server-wins or manual-review.');
-        }
-        return this.store.resolveConflict(this.context.current(), conflictId, input, this.now());
- }
- now() {
-        return (this.options.now ?? (() => new Date().toISOString()))();
- }
- assertEntityType(value) {
-        this.assertText(value, 'entityType');
-        if (value.length > 100)
-            this.invalid('entityType must not exceed 100 characters.');
- }
- assertText(value, field) {
-        if (typeof value !== 'string' || value.trim().length === 0) {
-            this.invalid(`${field} is required.`);
-        }
- }
- invalid(message) {
-        throw new errors_1.OfflineSyncError('OFFLINE_SYNC_INVALID_INPUT', 400, message);
- }
  +};
  +exports.OfflineSyncService = OfflineSyncService;
  +exports.OfflineSyncService = OfflineSyncService = __decorate([
- (0, common_1.Injectable)(),
- __param(0, (0, common_1.Inject)(tokens_1.STYNX_OFFLINE_SYNC_STORE)),
- __param(1, (0, common_1.Inject)(tokens_1.STYNX_OFFLINE_SYNC_CONTEXT)),
- __param(2, (0, common_1.Inject)(tokens_1.STYNX_OFFLINE_SYNC_OPTIONS)),
- __metadata("design:paramtypes", [Object, Object, Object])
  +], OfflineSyncService);
  +//# sourceMappingURL=offline-sync.service.js.map
  +```
-

+## package/dist/offline-sync/src/postgres-offline-sync.store.d.ts +
+```text
+import { ModuleRef } from '@nestjs/core';
+import type { CancelNumberingReservationInput, NumberingReservation, OfflineSyncStore, OpenSyncConflictInput, ReserveNumberingInput, ResolveSyncConflictInput, SubmitSyncBatchInput, SubmitSyncBatchResult, SyncConflict, TrustedOfflineSyncScope } from './types';
+export declare class PostgresOfflineSyncStore implements OfflineSyncStore {

- private readonly moduleRef;
- constructor(moduleRef: ModuleRef);
- reserveNumbering(scope: TrustedOfflineSyncScope, input: ReserveNumberingInput, now: string, defaultValidUntil: string): Promise<NumberingReservation>;
- cancelNumberingReservation(scope: TrustedOfflineSyncScope, reservationId: string, input: CancelNumberingReservationInput, now: string): Promise<NumberingReservation>;
- submitSyncBatch(scope: TrustedOfflineSyncScope, input: SubmitSyncBatchInput, now: string): Promise<SubmitSyncBatchResult>;
- openConflict(scope: TrustedOfflineSyncScope, queueItemId: string, input: OpenSyncConflictInput, now: string): Promise<SyncConflict>;
- resolveConflict(scope: TrustedOfflineSyncScope, conflictId: string, input: ResolveSyncConflictInput, now: string): Promise<SyncConflict>;
- private findQueueItemByPayload;
- private mapRange;
- private mapReservation;
- private mapQueueItem;
- private mapConflict;
- private get database();
  +}
  +//# sourceMappingURL=postgres-offline-sync.store.d.ts.map
  +```
-

+## package/dist/offline-sync/src/postgres-offline-sync.store.js +
+```text
+"use strict";
+var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {

- var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
- if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
- else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
- return c > 3 && r && Object.defineProperty(target, key, r), r;
  +};
  +var __metadata = (this && this.__metadata) || function (k, v) {
- if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
  +};
  +Object.defineProperty(exports, "__esModule", { value: true });
  +exports.PostgresOfflineSyncStore = void 0;
  +const node_crypto_1 = require("node:crypto");
  +const common_1 = require("@nestjs/common");
  +const core_1 = require("@nestjs/core");
  +const data_1 = require("@stynx-nyx/data");
  +const errors_1 = require("./errors");
  +let PostgresOfflineSyncStore = class PostgresOfflineSyncStore {
- moduleRef;
- constructor(moduleRef) {
-        this.moduleRef = moduleRef;
- }
- async reserveNumbering(scope, input, now, defaultValidUntil) {
-        return this.database.tx(async (trx) => {
-            const result = await trx.query(`select id, tenant_id, org_unit_id, entity_type, series, start_number,
-                end_number, next_number, status
-           from offline.numbering_ranges
-          where tenant_id = $1::uuid
-            and ($2::uuid is null or id = $2::uuid)
-            and ($2::uuid is not null or (
-              org_unit_id = $3
-              and entity_type = $4
-              and ($5::text is null or series = $5)
-            ))
-          order by series
-          limit 1
-          for update`, [
-                scope.tenantId,
-                input.rangeId ?? null,
-                input.orgUnitId,
-                input.entityType,
-                input.series ?? null,
-            ]);
-            const row = result.rows[0];
-            if (!row) {
-                throw new errors_1.OfflineSyncError('OFFLINE_SYNC_RANGE_NOT_FOUND', 404, 'No tenant-scoped numbering range matches this entity and organizational unit.');
-            }
-            const range = this.mapRange(row);
-            if (range.status !== 'active' ||
-                range.orgUnitId !== input.orgUnitId ||
-                range.entityType !== input.entityType) {
-                throw new errors_1.OfflineSyncError('OFFLINE_SYNC_RANGE_UNAVAILABLE', 409, 'The selected numbering range is not active for this entity and organizational unit.');
-            }
-            const endNumber = range.nextNumber + input.requestedSize - 1;
-            if (endNumber > range.endNumber) {
-                throw new errors_1.OfflineSyncError('OFFLINE_SYNC_RANGE_UNAVAILABLE', 409, 'The selected numbering range has insufficient capacity.');
-            }
-            await trx.query(`update offline.numbering_ranges
-            set next_number = $3,
-                status = case when $2 = end_number then 'exhausted' else status end,
-                updated_at = $4::timestamptz
-          where tenant_id = $1::uuid and id = $5::uuid`, [scope.tenantId, endNumber, endNumber + 1, now, range.id]);
-            const reservationId = (0, node_crypto_1.randomUUID)();
-            const inserted = await trx.query(`insert into offline.numbering_reservations (
-           id, tenant_id, range_id, org_unit_id, entity_type, series, agent_id,
-           device_id, shift_id, start_number, end_number, next_number,
-           reserved_at, valid_until, status
-         ) values (
-           $1::uuid, $2::uuid, $3::uuid, $4, $5, $6, $7, $8, $9,
-           $10, $11, $10, $12::timestamptz, $13::timestamptz, 'reserved'
-         )
-         returning id, tenant_id, range_id, org_unit_id, entity_type, series,
-                   agent_id, device_id, shift_id, start_number, end_number,
-                   next_number, valid_until, status`, [
-                reservationId,
-                scope.tenantId,
-                range.id,
-                input.orgUnitId,
-                input.entityType,
-                range.series,
-                scope.actorId,
-                input.deviceId,
-                input.shiftId,
-                range.nextNumber,
-                endNumber,
-                now,
-                input.validUntil ?? defaultValidUntil,
-            ]);
-            return this.mapReservation(inserted.rows[0]);
-        });
- }
- async cancelNumberingReservation(scope, reservationId, input, now) {
-        return this.database.tx(async (trx) => {
-            const existing = await trx.query(`select id, tenant_id, range_id, org_unit_id, entity_type, series,
-                agent_id, device_id, shift_id, start_number, end_number,
-                next_number, valid_until, status
-           from offline.numbering_reservations
-          where tenant_id = $1::uuid and id = $2::uuid
-          for update`, [scope.tenantId, reservationId]);
-            const row = existing.rows[0];
-            if (!row) {
-                throw new errors_1.OfflineSyncError('OFFLINE_SYNC_RESERVATION_NOT_FOUND', 404, `Numbering reservation ${reservationId} was not found.`);
-            }
-            if (row.status !== 'reserved') {
-                throw new errors_1.OfflineSyncError('OFFLINE_SYNC_RESERVATION_STATE', 409, `Numbering reservation ${reservationId} is ${row.status}; expected reserved.`);
-            }
-            const updated = await trx.query(`update offline.numbering_reservations
-            set status = 'cancelled', cancellation_reason = $3,
-                cancelled_by = $4, updated_at = $5::timestamptz
-          where tenant_id = $1::uuid and id = $2::uuid
-          returning id, tenant_id, range_id, org_unit_id, entity_type, series,
-                    agent_id, device_id, shift_id, start_number, end_number,
-                    next_number, valid_until, status`, [scope.tenantId, reservationId, input.reason ?? null, scope.actorId, now]);
-            return this.mapReservation(updated.rows[0]);
-        });
- }
- async submitSyncBatch(scope, input, now) {
-        return this.database.tx(async (trx) => {
-            const items = [];
-            let duplicateItems = 0;
-            for (const item of input.items) {
-                const existing = await this.findQueueItemByPayload(trx, scope.tenantId, item.payloadHash);
-                if (existing) {
-                    duplicateItems += 1;
-                    items.push(existing);
-                    continue;
-                }
-                try {
-                    const inserted = await trx.query(`insert into offline.sync_queue_items (
-               id, tenant_id, device_batch_id, org_unit_id, agent_id, device_id,
-               entity_type, local_entity_id, idempotency_key, payload_hash,
-               payload_json, created_locally_at, reserved_number, status, received_at
-             ) values (
-               $1, $2::uuid, $3, $4, $5, $6, $7, $8, $9, $10,
-               $11::jsonb, $12::timestamptz, $13, 'received', $14::timestamptz
-             )
-             on conflict (tenant_id, payload_hash) do nothing
-             returning id, tenant_id, org_unit_id, agent_id, device_id, entity_type,
-                       local_entity_id, idempotency_key, payload_hash, payload_json,
-                       created_locally_at, reserved_number, status, received_at`, [
-                        item.queueItemId,
-                        scope.tenantId,
-                        input.deviceBatchId,
-                        input.orgUnitId,
-                        scope.actorId,
-                        input.deviceId,
-                        item.entityType,
-                        item.localEntityId,
-                        item.idempotencyKey,
-                        item.payloadHash,
-                        JSON.stringify(item.payloadJson),
-                        item.createdLocallyAt,
-                        item.reservedNumber ?? null,
-                        now,
-                    ]);
-                    const insertedRow = inserted.rows[0];
-                    if (insertedRow) {
-                        items.push(this.mapQueueItem(insertedRow));
-                        continue;
-                    }
-                }
-                catch (error) {
-                    if (error.code === '23505') {
-                        throw new errors_1.OfflineSyncError('OFFLINE_SYNC_QUEUE_ID_REUSED', 409, `Queue item ${item.queueItemId} was already used with another payload hash.`);
-                    }
-                    throw error;
-                }
-                const raced = await this.findQueueItemByPayload(trx, scope.tenantId, item.payloadHash);
-                if (!raced) {
-                    throw new Error('Payload-hash conflict did not resolve to a stored queue item.');
-                }
-                duplicateItems += 1;
-                items.push(raced);
-            }
-            return {
-                batchId: input.deviceBatchId,
-                acceptedItems: input.items.length,
-                duplicateItems,
-                conflicts: items
-                    .filter((item) => item.status === 'conflict')
-                    .map((item) => item.queueItemId),
-                items,
-            };
-        });
- }
- async openConflict(scope, queueItemId, input, now) {
-        return this.database.tx(async (trx) => {
-            const queueResult = await trx.query(`update offline.sync_queue_items
-            set status = 'conflict', updated_at = $3::timestamptz
-          where tenant_id = $1::uuid and id = $2
-          returning id, tenant_id, org_unit_id, agent_id, device_id, entity_type,
-                    local_entity_id, idempotency_key, payload_hash, payload_json,
-                    created_locally_at, reserved_number, status, received_at`, [scope.tenantId, queueItemId, now]);
-            const queueItem = queueResult.rows[0];
-            if (!queueItem) {
-                throw new errors_1.OfflineSyncError('OFFLINE_SYNC_QUEUE_ITEM_NOT_FOUND', 404, `Sync queue item ${queueItemId} was not found.`);
-            }
-            const result = await trx.query(`insert into offline.sync_conflicts (
-           id, tenant_id, sync_queue_item_id, local_entity_id, payload_hash,
-           conflict_type, description, status, created_at
-         ) values ($1::uuid, $2::uuid, $3, $4, $5, $6, $7, 'open', $8::timestamptz)
-         returning id, tenant_id, sync_queue_item_id, local_entity_id, payload_hash,
-                   conflict_type, description, status, resolution, resolved_by, resolved_at`, [
-                (0, node_crypto_1.randomUUID)(),
-                scope.tenantId,
-                queueItemId,
-                queueItem.local_entity_id,
-                queueItem.payload_hash,
-                input.conflictType,
-                input.description,
-                now,
-            ]);
-            return this.mapConflict(result.rows[0]);
-        });
- }
- async resolveConflict(scope, conflictId, input, now) {
-        return this.database.tx(async (trx) => {
-            const existing = await trx.query(`select id, tenant_id, sync_queue_item_id, local_entity_id, payload_hash,
-                conflict_type, description, status, resolution, resolved_by, resolved_at
-           from offline.sync_conflicts
-          where tenant_id = $1::uuid and id = $2::uuid
-          for update`, [scope.tenantId, conflictId]);
-            const row = existing.rows[0];
-            if (!row) {
-                throw new errors_1.OfflineSyncError('OFFLINE_SYNC_CONFLICT_NOT_FOUND', 404, `Sync conflict ${conflictId} was not found.`);
-            }
-            if (row.status !== 'open') {
-                throw new errors_1.OfflineSyncError('OFFLINE_SYNC_CONFLICT_STATE', 409, `Sync conflict ${conflictId} is ${row.status}; expected open.`);
-            }
-            await trx.query(`update offline.sync_queue_items
-            set status = $3, updated_at = $4::timestamptz
-          where tenant_id = $1::uuid and id = $2`, [
-                scope.tenantId,
-                row.sync_queue_item_id,
-                input.resolution === 'server-wins' ? 'rejected' : 'applied',
-                now,
-            ]);
-            const updated = await trx.query(`update offline.sync_conflicts
-            set status = 'resolved', resolution = $3, resolved_by = $4,
-                resolved_at = $5::timestamptz,
-                description = coalesce($6, description), updated_at = $5::timestamptz
-          where tenant_id = $1::uuid and id = $2::uuid
-          returning id, tenant_id, sync_queue_item_id, local_entity_id, payload_hash,
-                    conflict_type, description, status, resolution, resolved_by, resolved_at`, [
-                scope.tenantId,
-                conflictId,
-                input.resolution,
-                scope.actorId,
-                now,
-                input.description ?? null,
-            ]);
-            return this.mapConflict(updated.rows[0]);
-        });
- }
- async findQueueItemByPayload(trx, tenantId, payloadHash) {
-        const result = await trx.query(`select id, tenant_id, org_unit_id, agent_id, device_id, entity_type,
-              local_entity_id, idempotency_key, payload_hash, payload_json,
-              created_locally_at, reserved_number, status, received_at
-         from offline.sync_queue_items
-        where tenant_id = $1::uuid and payload_hash = $2
-        limit 1`, [tenantId, payloadHash]);
-        return result.rows[0] ? this.mapQueueItem(result.rows[0]) : undefined;
- }
- mapRange(row) {
-        return {
-            id: row.id,
-            tenantId: row.tenant_id,
-            orgUnitId: row.org_unit_id,
-            entityType: row.entity_type,
-            series: row.series,
-            startNumber: Number(row.start_number),
-            endNumber: Number(row.end_number),
-            nextNumber: Number(row.next_number),
-            status: row.status,
-        };
- }
- mapReservation(row) {
-        return {
-            reservationId: row.id,
-            rangeId: row.range_id,
-            tenantId: row.tenant_id,
-            orgUnitId: row.org_unit_id,
-            entityType: row.entity_type,
-            series: row.series,
-            agentId: row.agent_id,
-            deviceId: row.device_id,
-            shiftId: row.shift_id,
-            startNumber: Number(row.start_number),
-            endNumber: Number(row.end_number),
-            nextNumber: Number(row.next_number),
-            validUntil: new Date(row.valid_until).toISOString(),
-            status: row.status,
-        };
- }
- mapQueueItem(row) {
-        return {
-            queueItemId: row.id,
-            tenantId: row.tenant_id,
-            orgUnitId: row.org_unit_id,
-            agentId: row.agent_id,
-            deviceId: row.device_id,
-            entityType: row.entity_type,
-            localEntityId: row.local_entity_id,
-            idempotencyKey: row.idempotency_key,
-            payloadHash: row.payload_hash,
-            payloadJson: row.payload_json,
-            createdLocallyAt: new Date(row.created_locally_at).toISOString(),
-            ...(row.reserved_number === null ? {} : { reservedNumber: Number(row.reserved_number) }),
-            status: row.status,
-            receivedAt: new Date(row.received_at).toISOString(),
-        };
- }
- mapConflict(row) {
-        return {
-            conflictId: row.id,
-            tenantId: row.tenant_id,
-            queueItemId: row.sync_queue_item_id,
-            localEntityId: row.local_entity_id,
-            payloadHash: row.payload_hash,
-            conflictType: row.conflict_type,
-            description: row.description,
-            status: row.status,
-            ...(row.resolution === null ? {} : { resolution: row.resolution }),
-            ...(row.resolved_by === null ? {} : { resolvedBy: row.resolved_by }),
-            ...(row.resolved_at === null ? {} : { resolvedAt: new Date(row.resolved_at).toISOString() }),
-        };
- }
- get database() {
-        return this.moduleRef.get(data_1.Database, { strict: false });
- }
  +};
  +exports.PostgresOfflineSyncStore = PostgresOfflineSyncStore;
  +exports.PostgresOfflineSyncStore = PostgresOfflineSyncStore = __decorate([
- (0, common_1.Injectable)(),
- __metadata("design:paramtypes", [core_1.ModuleRef])
  +], PostgresOfflineSyncStore);
  +//# sourceMappingURL=postgres-offline-sync.store.js.map
  +```
-

+## package/dist/offline-sync/src/stynx-offline-sync.context.d.ts +
+```text
+import { ModuleRef } from '@nestjs/core';
+import type { OfflineSyncContextPort, TrustedOfflineSyncScope } from './types';
+export declare class StynxOfflineSyncContext implements OfflineSyncContextPort {

- private readonly moduleRef;
- constructor(moduleRef: ModuleRef);
- current(): TrustedOfflineSyncScope;
  +}
  +//# sourceMappingURL=stynx-offline-sync.context.d.ts.map
  +```
-

+## package/dist/offline-sync/src/tokens.d.ts + +`text
+export declare const STYNX_OFFLINE_SYNC_OPTIONS: unique symbol;
+export declare const STYNX_OFFLINE_SYNC_STORE: unique symbol;
+export declare const STYNX_OFFLINE_SYNC_CONTEXT: unique symbol;
+//# sourceMappingURL=tokens.d.ts.map
+` +
+## package/dist/offline-sync/src/types.d.ts +
+```text
+export type OfflineSyncQueueStatus = 'received' | 'applied' | 'conflict' | 'rejected';
+export type OfflineSyncConflictResolutionStrategy = 'device-wins' | 'server-wins' | 'manual-review';
+export interface TrustedOfflineSyncScope {

- readonly tenantId: string;
- readonly actorId: string;
  +}
  +export interface OfflineSyncContextPort {
- current(): TrustedOfflineSyncScope;
  +}
  +export interface NumberingRange {
- readonly id: string;
- readonly tenantId: string;
- readonly orgUnitId: string;
- readonly entityType: string;
- readonly series: string;
- readonly startNumber: number;
- readonly endNumber: number;
- readonly nextNumber: number;
- readonly status: 'active' | 'exhausted' | 'cancelled';
  +}
  +export interface NumberingReservation {
- readonly reservationId: string;
- readonly rangeId: string;
- readonly tenantId: string;
- readonly orgUnitId: string;
- readonly entityType: string;
- readonly series: string;
- readonly agentId: string;
- readonly deviceId: string;
- readonly shiftId: string;
- readonly startNumber: number;
- readonly endNumber: number;
- readonly nextNumber: number;
- readonly validUntil: string;
- readonly status: 'reserved' | 'consumed' | 'expired' | 'cancelled';
  +}
  +export interface ReserveNumberingInput {
- readonly orgUnitId: string;
- readonly deviceId: string;
- readonly shiftId: string;
- readonly entityType: string;
- readonly requestedSize: number;
- readonly rangeId?: string;
- readonly series?: string;
- readonly validUntil?: string;
  +}
  +export interface CancelNumberingReservationInput {
- readonly reason?: string;
  +}
  +export interface SyncBatchItemInput {
- readonly queueItemId: string;
- readonly entityType: string;
- readonly localEntityId: string;
- readonly idempotencyKey: string;
- readonly payloadHash: string;
- readonly payloadJson: Record<string, unknown>;
- readonly createdLocallyAt: string;
- readonly reservedNumber?: number;
  +}
  +export interface SubmitSyncBatchInput {
- readonly orgUnitId: string;
- readonly deviceId: string;
- readonly deviceBatchId: string;
- readonly items: readonly SyncBatchItemInput[];
  +}
  +export interface StoredSyncQueueItem extends SyncBatchItemInput {
- readonly tenantId: string;
- readonly agentId: string;
- readonly orgUnitId: string;
- readonly deviceId: string;
- readonly status: OfflineSyncQueueStatus;
- readonly receivedAt: string;
  +}
  +export interface SubmitSyncBatchResult {
- readonly batchId: string;
- readonly acceptedItems: number;
- readonly duplicateItems: number;
- readonly conflicts: readonly string[];
- readonly items: readonly StoredSyncQueueItem[];
  +}
  +export interface OpenSyncConflictInput {
- readonly conflictType: string;
- readonly description: string;
  +}
  +export interface ResolveSyncConflictInput {
- readonly resolution: OfflineSyncConflictResolutionStrategy;
- readonly description?: string;
  +}
  +export interface SyncConflict {
- readonly conflictId: string;
- readonly tenantId: string;
- readonly queueItemId: string;
- readonly localEntityId: string;
- readonly payloadHash: string;
- readonly conflictType: string;
- readonly description: string;
- readonly status: 'open' | 'resolved';
- readonly resolution?: OfflineSyncConflictResolutionStrategy;
- readonly resolvedBy?: string;
- readonly resolvedAt?: string;
  +}
  +export interface OfflineSyncStore {
- reserveNumbering(scope: TrustedOfflineSyncScope, input: ReserveNumberingInput, now: string, defaultValidUntil: string): Promise<NumberingReservation>;
- cancelNumberingReservation(scope: TrustedOfflineSyncScope, reservationId: string, input: CancelNumberingReservationInput, now: string): Promise<NumberingReservation>;
- submitSyncBatch(scope: TrustedOfflineSyncScope, input: SubmitSyncBatchInput, now: string): Promise<SubmitSyncBatchResult>;
- openConflict(scope: TrustedOfflineSyncScope, queueItemId: string, input: OpenSyncConflictInput, now: string): Promise<SyncConflict>;
- resolveConflict(scope: TrustedOfflineSyncScope, conflictId: string, input: ResolveSyncConflictInput, now: string): Promise<SyncConflict>;
  +}
  +export interface StynxOfflineSyncModuleOptions {
- readonly store?: OfflineSyncStore;
- readonly context?: OfflineSyncContextPort;
- readonly mountControllers?: boolean;
- readonly now?: () => string;
- readonly reservationTtlMs?: number;
  +}
  +//# sourceMappingURL=types.d.ts.map
  +```
  diff --git a/work/rounds/R-0021/inputs/published-api-outbox.md b/work/rounds/R-0021/inputs/published-api-outbox.md
  new file mode 100644
  index 00000000..b2af53ff
  --- /dev/null
  +++ b/work/rounds/R-0021/inputs/published-api-outbox.md
  @@ -0,0 +1,742 @@
  +# Published API — @stynx-nyx/outbox 1.4.0 / 1.5.0-rc.2
-

+Extracted from archived npm tarballs; byte-identical own JS and declarations across both versions. See published-api-metadata.json for archive and per-file hashes. This is an inspection input, not a local API implementation. +
+## package/dist/outbox/src/ack-signature.d.ts +
+```text
+/**

- - Verifies an inbound outbox-ACK HMAC-SHA256 body signature.
- -
- - Expected header format: `sha256=<hex_digest>`.
- -
- - Promoted from pec's `domain/shared/api/src/webhook-signature.ts` (itself
- - ported from the deleted `apps/api/src/@core/security/webhook-signature.ts`).
- - Intended for the inbound ACK route a consuming app exposes for
- - `OutboxService.ack()` — mark that route `@Public()` (bearer auth bypassed)
- - and call this helper against the raw request body before trusting it.
- - Uses constant-time comparison to avoid timing side-channels.
- _/
  +export declare function verifyOutboxAckSignature(secret: string, rawBody: Buffer, header: string): boolean;
  +/_*
- - Computes the `sha256=<hex_digest>` header value for a given body and
- - secret. Not needed by the outbox's own ACK-verification path (the
- - _sender_ of the ACK — the external system — computes this); provided so
- - tests and local dispatcher fakes can sign a synthetic ACK request without
- - hand-rolling HMAC each time.
- */
  +export declare function signOutboxAckPayload(secret: string, rawBody: Buffer): string;
  +//# sourceMappingURL=ack-signature.d.ts.map
  +```
-

+## package/dist/outbox/src/backoff.d.ts +
+```text
+import type { OutboxBackoffPolicy } from './types';
+/**

- - Fixed-interval backoff — every retry waits the same duration regardless of
- - attempt count. Matches pec's hardcoded `now() + interval '15 minutes'`
- - exactly (default `intervalMs` is 15 minutes) and is the module's default
- - policy, so a straight port of pec's outbox behavior needs no configuration.
- */
  +export declare class FixedIntervalBackoffPolicy implements OutboxBackoffPolicy {
- private readonly intervalMs;
- constructor(intervalMs?: number);
- nextAttemptAt(_attempt: number, now?: Date): Date;
  +}
  +export interface ExponentialBackoffOptions {
- /** Delay before the first retry. Default 30s. */
- baseMs?: number;
- /** Multiplier applied per additional attempt. Default 2. */
- factor?: number;
- /** Upper bound on the computed delay, before jitter. Default 1 hour. */
- maxMs?: number;
- /** Uniform random jitter added on top of the capped delay, in [0, jitterMs). Default 5s. */
- jitterMs?: number;
  +}
  +/**
- - Exponential backoff with a cap and uniform jitter:
- - `delay = min(baseMs * factor^(attempt-1), maxMs) + random(0, jitterMs)`.
- - `attempt` is 1-indexed (the value already persisted on the row after a
- - claim/retry increments it).
- */
  +export declare class ExponentialBackoffPolicy implements OutboxBackoffPolicy {
- private readonly baseMs;
- private readonly factor;
- private readonly maxMs;
- private readonly jitterMs;
- constructor(options?: ExponentialBackoffOptions);
- nextAttemptAt(attempt: number, now?: Date): Date;
  +}
  +//# sourceMappingURL=backoff.d.ts.map
  +```
-

+## package/dist/outbox/src/constants.d.ts + +`text
+export declare const STYNX_OUTBOX_OPTIONS: unique symbol;
+export declare const STYNX_OUTBOX_DISPATCHER: unique symbol;
+export declare const STYNX_OUTBOX_BACKOFF_POLICY: unique symbol;
+export declare const STYNX_OUTBOX_METRICS: unique symbol;
+export declare const DEFAULT_OUTBOX_TABLE = "outbox.messages";
+export declare const DEFAULT_OUTBOX_ACK_TABLE = "outbox.acknowledgements";
+export declare const DEFAULT_OUTBOX_DISPATCH_BATCH_SIZE = 25;
+//# sourceMappingURL=constants.d.ts.map
+` +
+## package/dist/outbox/src/errors.d.ts +
+```text
+import { StynxError } from '@stynx-nyx/core';
+export declare class StynxOutboxError extends StynxError {
+}
+export declare class OutboxNotFoundError extends StynxOutboxError {

- constructor(context: Record<string, unknown>);
  +}
  +export declare class OutboxAlreadyEnqueuedError extends StynxOutboxError {
- constructor(context: Record<string, unknown>);
  +}
  +/**
- - Raised by `ack()` when `(entity, entityId)` matches more than one tenant's
- - row and the caller did not supply `tenantId` to disambiguate. See the
- - ACK-resolution note in the contract doc — most integrations should have
- - the external system echo back a globally unique correlation id to avoid
- - this entirely.
- */
  +export declare class OutboxAmbiguousAckError extends StynxOutboxError {
- constructor(context: Record<string, unknown>);
  +}
  +//# sourceMappingURL=errors.d.ts.map
  +```
-

+## package/dist/outbox/src/http-outbox-dispatcher.d.ts +
+```text
+import type { OutboxDispatcherPort, OutboxRow } from './types';
+export interface HttpOutboxDispatcherOptions {

- /** Absolute URL, or a function deriving one per row (e.g. by `entity`). */
- url: string | ((row: OutboxRow) => string);
- /** Static headers, or a function deriving them per row (e.g. a computed HMAC signature). */
- headers?: Record<string, string> | ((row: OutboxRow) => Record<string, string>);
- method?: 'POST' | 'PUT';
- timeoutMs?: number;
- /** Injectable for tests; defaults to the global `fetch`. */
- fetchImpl?: typeof fetch;
  +}
  +/**
- - Minimal HTTP implementation of `OutboxDispatcherPort` — the "HTTP now"
- - half of the pluggable dispatcher port. POSTs (or PUTs) the row's `payload`
- - as JSON and treats any non-2xx response, network error, or timeout as a
- - failure (`dispatchDue()` then reverts the row to `ERROR` and schedules a
- - retry through the backoff policy).
- -
- - This is intentionally thin — no retry/circuit-breaker logic lives here,
- - since `dispatchDue()` already owns retry scheduling. An app that wants
- - per-call resilience (timeouts aside) should wrap `fetchImpl` with
- - `@stynx-nyx/integration-adapter`. The EventBridge half of this port is
- - deferred to a future package; only the `OutboxDispatcherPort` interface
- - is shipped for it to implement against.
- */
  +export declare class HttpOutboxDispatcher implements OutboxDispatcherPort {
- private readonly options;
- constructor(options: HttpOutboxDispatcherOptions);
- send(row: OutboxRow): Promise<void>;
  +}
  +//# sourceMappingURL=http-outbox-dispatcher.d.ts.map
  +```
-

+## package/dist/outbox/src/index.d.ts +
+```text
+/**

- - Public exports for the transactional outbox: same-transaction `enqueue`,
- - claim-and-dispatch, pluggable dispatcher port, backoff policies, HMAC ACK
- - signature helpers, and NestJS module wiring.
- -
- - @packageDocumentation
- */
  +export * from './ack-signature';
  +export * from './backoff';
  +export * from './constants';
  +export * from './errors';
  +export * from './http-outbox-dispatcher';
  +export * from './metrics';
  +export * from './outbox.module';
  +export * from './outbox.service';
  +export * from './types';
  +//# sourceMappingURL=index.d.ts.map
  +```
-

+## package/dist/outbox/src/metrics.d.ts +
+```text
+import type { OutboxMetricsSink } from './types';
+/** Default `OutboxMetricsSink` — in-process counters, useful for tests and `stynx doctor`-style introspection. */
+export declare class InMemoryOutboxMetrics implements OutboxMetricsSink {

- private enqueued;
- private dispatched;
- private acked;
- incrementEnqueued(entity: string): void;
- incrementDispatched(entity: string, outcome: 'sent' | 'error'): void;
- incrementAcked(entity: string, outcome: 'acked' | 'error'): void;
- snapshot(): {
-        enqueued: Record<string, number>;
-        dispatched: Record<string, number>;
-        acked: Record<string, number>;
- };
  +}
  +//# sourceMappingURL=metrics.d.ts.map
  +```
-

+## package/dist/outbox/src/outbox.module.d.ts +
+```text
+import { DynamicModule } from '@nestjs/common';
+import type { OutboxModuleOptions } from './types';
+export declare class StynxOutboxModule {

- static forRoot(options?: OutboxModuleOptions): DynamicModule;
  +}
  +//# sourceMappingURL=outbox.module.d.ts.map
  +```
-

+## package/dist/outbox/src/outbox.service.d.ts +
+```text
+import { Database } from '@stynx-nyx/data';
+import type { OutboxAckInput, OutboxBackoffPolicy, OutboxDispatchOutcome, OutboxDispatcherPort, OutboxEnvelope, OutboxMetricsSink, OutboxModuleOptions, OutboxRow, OutboxSqlExecutor } from './types';
+/**

- - Transactional outbox service.
- -
- - `enqueue()` is a pure function of a caller-supplied SQL executor (a
- - `@stynx-nyx/data` `Transaction`, or any object with a compatible
- - `query()`), so a caller composes it inside its own `database.tx(...)`
- - call and gets one atomic commit across the domain write and the outbox
- - row — the generalization pec's `TransmissionsService.enqueue` did not
- - offer (pec always opened its own transaction).
- -
- - Every other method (`dispatchDue`, `ack`, `retry`, `getOne`) owns its own
- - transaction via the injected `Database`, matching pec's shape 1:1.
- */
  +export declare class OutboxService {
- private readonly database;
- private readonly options;
- private readonly dispatcher?;
- private readonly metrics?;
- private readonly table;
- private readonly ackTable;
- private readonly dispatchBatchSize;
- private readonly backoffPolicy;
- constructor(database: Database, options: OutboxModuleOptions, dispatcher?: OutboxDispatcherPort | undefined, injectedBackoffPolicy?: OutboxBackoffPolicy, metrics?: OutboxMetricsSink | undefined);
- /**
-     * Enqueues (or, for a repeat call against the same `(entity, entityId)`,
-     * touches) an outbox row inside the caller's own transaction. Tenant is
-     * read from the active `app.tenant_id` session GUC — the same value RLS
-     * itself checks — so the row can never be enqueued under a tenant the
-     * transaction isn't already scoped to.
-     */
- enqueue(trx: OutboxSqlExecutor, envelope: OutboxEnvelope): Promise<OutboxRow>;
- /** Reads one row by `(entity, entityId)`, scoped to the caller's active tenant via RLS. */
- getOne(entity: string, entityId: string): Promise<OutboxRow>;
- /**
-     * Claims up to `limit` due rows (`PENDING`/`ERROR` whose `next_attempt_at`
-     * has passed) via `FOR UPDATE SKIP LOCKED`, marks them `SENT`, and — when a
-     * dispatcher port is configured — hands each one to it. A dispatch failure
-     * reverts that row to `ERROR` and schedules its next attempt through the
-     * configured `OutboxBackoffPolicy`; it does not affect the other claimed
-     * rows. Claiming spans all tenants (system context, `owner` role) so one
-     * scheduler sweep drains the whole platform, matching the E3 "per-(tenant,
-     * aggregate) ordering" spec note — rows are claimed oldest-`created_at`
-     * first within that global sweep.
-     *
-     * With no dispatcher configured, this behaves exactly like pec's
-     * `dispatchDue`: it claims and marks `SENT` without sending anything,
-     * leaving actual delivery to the caller (or a future ack). Exposed as a
-     * plain injectable method so `@stynx-nyx/jobs` or an app-level poller can
-     * drive it on an interval — this package has no dependency on a job
-     * runner.
-     */
- dispatchDue(limit?: number): Promise<OutboxDispatchOutcome[]>;
- private claimDue;
- private recordDispatchFailure;
- /**
-     * Manually resets a row to `PENDING` for redelivery — an operator action,
-     * distinct from the automatic retry `dispatchDue()` performs on a
-     * dispatcher failure. `immediate: true` makes it eligible right away;
-     * otherwise the next attempt is scheduled through the backoff policy.
-     */
- retry(id: string, options?: {
-        immediate?: boolean;
- }): Promise<OutboxRow>;
- /**
-     * Records an inbound ACK (positive or negative) for a message, keyed by
-     * `(entity, entityId)` — the shape the external system's webhook body
-     * naturally carries. Runs under system context / `owner` role because an
-     * inbound webhook has no authenticated tenant context of its own (verify
-     * `verifyOutboxAckSignature()` against the raw body before calling this).
-     *
-     * `(entity, entityId)` alone is only unique when the external system's
-     * identifier space is; when it isn't, pass `tenantId` (e.g. echoed back by
-     * the external system as a correlation field) to disambiguate. Two or more
-     * tenants matching without a supplied `tenantId` raises
-     * `OutboxAmbiguousAckError` rather than guessing.
-     */
- ack(input: OutboxAckInput): Promise<OutboxRow>;
- private resolveAckTarget;
  +}
  +//# sourceMappingURL=outbox.service.d.ts.map
  +```
-

+## package/dist/outbox/src/outbox.service.js +
+```text
+"use strict";
+var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {

- var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
- if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
- else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
- return c > 3 && r && Object.defineProperty(target, key, r), r;
  +};
  +var __metadata = (this && this.__metadata) || function (k, v) {
- if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
  +};
  +var __param = (this && this.__param) || function (paramIndex, decorator) {
- return function (target, key) { decorator(target, key, paramIndex); }
  +};
  +Object.defineProperty(exports, "__esModule", { value: true });
  +exports.OutboxService = void 0;
  +const common_1 = require("@nestjs/common");
  +const data_1 = require("@stynx-nyx/data");
  +const backoff_1 = require("./backoff");
  +const constants_1 = require("./constants");
  +const errors_1 = require("./errors");
  +const row_mapper_1 = require("./row-mapper");
  +/**
- - Transactional outbox service.
- -
- - `enqueue()` is a pure function of a caller-supplied SQL executor (a
- - `@stynx-nyx/data` `Transaction`, or any object with a compatible
- - `query()`), so a caller composes it inside its own `database.tx(...)`
- - call and gets one atomic commit across the domain write and the outbox
- - row — the generalization pec's `TransmissionsService.enqueue` did not
- - offer (pec always opened its own transaction).
- -
- - Every other method (`dispatchDue`, `ack`, `retry`, `getOne`) owns its own
- - transaction via the injected `Database`, matching pec's shape 1:1.
- */
  +let OutboxService = class OutboxService {
- database;
- options;
- dispatcher;
- metrics;
- table;
- ackTable;
- dispatchBatchSize;
- backoffPolicy;
- constructor(database, options, dispatcher, injectedBackoffPolicy, metrics) {
-        this.database = database;
-        this.options = options;
-        this.dispatcher = dispatcher;
-        this.metrics = metrics;
-        this.table = (0, row_mapper_1.assertQualifiedIdentifier)(options.table ?? constants_1.DEFAULT_OUTBOX_TABLE, 'table');
-        this.ackTable = (0, row_mapper_1.assertQualifiedIdentifier)(options.ackTable ?? constants_1.DEFAULT_OUTBOX_ACK_TABLE, 'ackTable');
-        this.dispatchBatchSize = options.dispatchBatchSize ?? constants_1.DEFAULT_OUTBOX_DISPATCH_BATCH_SIZE;
-        this.backoffPolicy = injectedBackoffPolicy ?? options.backoffPolicy ?? new backoff_1.FixedIntervalBackoffPolicy();
- }
- /**
-     * Enqueues (or, for a repeat call against the same `(entity, entityId)`,
-     * touches) an outbox row inside the caller's own transaction. Tenant is
-     * read from the active `app.tenant_id` session GUC — the same value RLS
-     * itself checks — so the row can never be enqueued under a tenant the
-     * transaction isn't already scoped to.
-     */
- async enqueue(trx, envelope) {
-        const idempotencyKey = envelope.idempotencyKey ?? `${envelope.entity}:${envelope.entityId}`;
-        try {
-            const result = await trx.query(`insert into ${this.table} (id, tenant_id, entity, entity_id, payload, metadata, status, idempotency_key, next_attempt_at)
-         values (
-           gen_random_uuid(),
-           nullif(current_setting('app.tenant_id', true), '')::uuid,
-           $1, $2, $3::jsonb, $4::jsonb, 'PENDING', $5, null
-         )
-         on conflict (tenant_id, entity, entity_id)
-         do update set updated_at = now(), idempotency_key = excluded.idempotency_key
-         returning ${(0, row_mapper_1.outboxColumns)()}`, [
-                envelope.entity,
-                envelope.entityId,
-                JSON.stringify(envelope.payload ?? {}),
-                envelope.metadata ? JSON.stringify(envelope.metadata) : null,
-                idempotencyKey,
-            ]);
-            const row = (0, row_mapper_1.toRows)(result)[0];
-            if (!row) {
-                throw new errors_1.OutboxNotFoundError({ entity: envelope.entity, entityId: envelope.entityId });
-            }
-            this.metrics?.incrementEnqueued(envelope.entity);
-            return row;
-        }
-        catch (error) {
-            // The (tenant_id, entity, entity_id) conflict is absorbed by the
-            // upsert above; only a *different* entity reusing an explicit
-            // `idempotencyKey` can still violate the (tenant_id, idempotency_key)
-            // unique constraint. Surface that as a typed conflict.
-            if ((0, row_mapper_1.isUniqueViolation)(error)) {
-                throw new errors_1.OutboxAlreadyEnqueuedError({
-                    entity: envelope.entity,
-                    entityId: envelope.entityId,
-                    idempotencyKey,
-                });
-            }
-            throw error;
-        }
- }
- /** Reads one row by `(entity, entityId)`, scoped to the caller's active tenant via RLS. */
- async getOne(entity, entityId) {
-        return this.database.tx(async (trx) => {
-            const result = await trx.query(`select ${(0, row_mapper_1.outboxColumns)()} from ${this.table} where entity = $1 and entity_id = $2`, [entity, entityId]);
-            const row = (0, row_mapper_1.toRows)(result)[0];
-            if (!row) {
-                throw new errors_1.OutboxNotFoundError({ entity, entityId });
-            }
-            return row;
-        }, { role: 'reader', readonly: true });
- }
- /**
-     * Claims up to `limit` due rows (`PENDING`/`ERROR` whose `next_attempt_at`
-     * has passed) via `FOR UPDATE SKIP LOCKED`, marks them `SENT`, and — when a
-     * dispatcher port is configured — hands each one to it. A dispatch failure
-     * reverts that row to `ERROR` and schedules its next attempt through the
-     * configured `OutboxBackoffPolicy`; it does not affect the other claimed
-     * rows. Claiming spans all tenants (system context, `owner` role) so one
-     * scheduler sweep drains the whole platform, matching the E3 "per-(tenant,
-     * aggregate) ordering" spec note — rows are claimed oldest-`created_at`
-     * first within that global sweep.
-     *
-     * With no dispatcher configured, this behaves exactly like pec's
-     * `dispatchDue`: it claims and marks `SENT` without sending anything,
-     * leaving actual delivery to the caller (or a future ack). Exposed as a
-     * plain injectable method so `@stynx-nyx/jobs` or an app-level poller can
-     * drive it on an interval — this package has no dependency on a job
-     * runner.
-     */
- async dispatchDue(limit = this.dispatchBatchSize) {
-        const claimed = await this.claimDue(limit);
-        if (claimed.length === 0) {
-            return [];
-        }
-        if (!this.dispatcher) {
-            return claimed.map((row) => ({ row, dispatched: false }));
-        }
-        const outcomes = [];
-        for (const row of claimed) {
-            try {
-                await this.dispatcher.send(row);
-                this.metrics?.incrementDispatched(row.entity, 'sent');
-                outcomes.push({ row, dispatched: true });
-            }
-            catch (error) {
-                const message = (0, row_mapper_1.errorMessage)(error);
-                const updated = await this.recordDispatchFailure(row, message);
-                this.metrics?.incrementDispatched(row.entity, 'error');
-                outcomes.push({ row: updated, dispatched: false, error: message });
-            }
-        }
-        return outcomes;
- }
- async claimDue(limit) {
-        return this.database.withSystemContext('outbox claim', () => this.database.tx(async (trx) => {
-            const result = await trx.query(`with due as (
-               select id
-                 from ${this.table}
-                where status in ('PENDING', 'ERROR')
-                  and coalesce(next_attempt_at, created_at) <= now()
-                order by created_at asc
-                limit $1
-                for update skip locked
-             )
-             update ${this.table} o
-                set status = 'SENT',
-                    attempts = attempts + 1,
-                    last_error = null,
-                    next_attempt_at = null,
-                    updated_at = now()
-               from due
-              where o.id = due.id
-              returning ${(0, row_mapper_1.outboxColumns)('o')}`, [limit]);
-            return (0, row_mapper_1.toRows)(result);
-        }, { role: 'owner', readonly: false }));
- }
- async recordDispatchFailure(row, message) {
-        const nextAttemptAt = this.backoffPolicy.nextAttemptAt(row.attempts, new Date());
-        return this.database.withSystemContext('outbox dispatch failure', () => this.database.tx(async (trx) => {
-            const result = await trx.query(`update ${this.table}
-                set status = 'ERROR',
-                    last_error = $2,
-                    next_attempt_at = $3,
-                    updated_at = now()
-              where id = $1
-              returning ${(0, row_mapper_1.outboxColumns)()}`, [row.id, message.slice(0, 4000), nextAttemptAt]);
-            const updated = (0, row_mapper_1.toRows)(result)[0];
-            if (!updated) {
-                throw new errors_1.OutboxNotFoundError({ id: row.id });
-            }
-            return updated;
-        }, { role: 'owner', readonly: false }));
- }
- /**
-     * Manually resets a row to `PENDING` for redelivery — an operator action,
-     * distinct from the automatic retry `dispatchDue()` performs on a
-     * dispatcher failure. `immediate: true` makes it eligible right away;
-     * otherwise the next attempt is scheduled through the backoff policy.
-     */
- async retry(id, options = {}) {
-        return this.database.withSystemContext('outbox retry', () => this.database.tx(async (trx) => {
-            const current = await trx.query(`select attempts from ${this.table} where id = $1`, [id]);
-            const currentRow = (0, row_mapper_1.toRows)(current)[0];
-            if (!currentRow) {
-                throw new errors_1.OutboxNotFoundError({ id });
-            }
-            const attempts = currentRow.attempts + 1;
-            const nextAttemptAt = options.immediate
-                ? new Date()
-                : this.backoffPolicy.nextAttemptAt(attempts, new Date());
-            const result = await trx.query(`update ${this.table}
-                set attempts = $2,
-                    status = 'PENDING',
-                    last_error = null,
-                    next_attempt_at = $3,
-                    updated_at = now()
-              where id = $1
-              returning ${(0, row_mapper_1.outboxColumns)()}`, [id, attempts, nextAttemptAt]);
-            const updated = (0, row_mapper_1.toRows)(result)[0];
-            if (!updated) {
-                throw new errors_1.OutboxNotFoundError({ id });
-            }
-            return updated;
-        }, { role: 'owner', readonly: false }));
- }
- /**
-     * Records an inbound ACK (positive or negative) for a message, keyed by
-     * `(entity, entityId)` — the shape the external system's webhook body
-     * naturally carries. Runs under system context / `owner` role because an
-     * inbound webhook has no authenticated tenant context of its own (verify
-     * `verifyOutboxAckSignature()` against the raw body before calling this).
-     *
-     * `(entity, entityId)` alone is only unique when the external system's
-     * identifier space is; when it isn't, pass `tenantId` (e.g. echoed back by
-     * the external system as a correlation field) to disambiguate. Two or more
-     * tenants matching without a supplied `tenantId` raises
-     * `OutboxAmbiguousAckError` rather than guessing.
-     */
- async ack(input) {
-        return this.database.withSystemContext('outbox ack', () => this.database.tx(async (trx) => {
-            const target = await this.resolveAckTarget(trx, input);
-            const result = await trx.query(`update ${this.table}
-                set status = $2::outbox.message_status,
-                    ack_time = now(),
-                    last_error = case when $2::text = 'ERROR' then $3 else null end,
-                    updated_at = now()
-              where id = $1
-              returning ${(0, row_mapper_1.outboxColumns)()}`, [target.id, input.status, input.detail ?? null]);
-            const row = (0, row_mapper_1.toRows)(result)[0];
-            if (!row) {
-                throw new errors_1.OutboxNotFoundError({ entity: input.entity, entityId: input.entityId });
-            }
-            try {
-                await trx.query(`insert into ${this.ackTable} (id, tenant_id, message_id, ack_status, ack_message, ack_time)
-               values (gen_random_uuid(), $1, $2, $3, $4, now())
-               on conflict (message_id) do nothing`, [row.tenantId, row.id, input.status, input.detail ?? null]);
-            }
-            catch (error) {
-                if (!(0, row_mapper_1.isUniqueViolation)(error)) {
-                    throw error;
-                }
-            }
-            this.metrics?.incrementAcked(row.entity, input.status === 'ACKED' ? 'acked' : 'error');
-            return row;
-        }, { role: 'owner', readonly: false }));
- }
- async resolveAckTarget(trx, input) {
-        const params = [input.entity, input.entityId];
-        let whereTenant = '';
-        if (input.tenantId) {
-            params.push(input.tenantId);
-            whereTenant = 'and tenant_id = $3::uuid';
-        }
-        const result = await trx.query(`select id, tenant_id as "tenantId" from ${this.table} where entity = $1 and entity_id = $2 ${whereTenant}`, params);
-        const rows = (0, row_mapper_1.toRows)(result);
-        if (rows.length === 0) {
-            throw new errors_1.OutboxNotFoundError({ entity: input.entity, entityId: input.entityId });
-        }
-        const [first] = rows;
-        if (rows.length > 1 || !first) {
-            throw new errors_1.OutboxAmbiguousAckError({
-                entity: input.entity,
-                entityId: input.entityId,
-                matches: rows.length,
-            });
-        }
-        return first;
- }
  +};
  +exports.OutboxService = OutboxService;
  +exports.OutboxService = OutboxService = __decorate([
- (0, common_1.Injectable)(),
- __param(1, (0, common_1.Inject)(constants_1.STYNX_OUTBOX_OPTIONS)),
- __param(2, (0, common_1.Optional)()),
- __param(2, (0, common_1.Inject)(constants_1.STYNX_OUTBOX_DISPATCHER)),
- __param(3, (0, common_1.Optional)()),
- __param(3, (0, common_1.Inject)(constants_1.STYNX_OUTBOX_BACKOFF_POLICY)),
- __param(4, (0, common_1.Optional)()),
- __param(4, (0, common_1.Inject)(constants_1.STYNX_OUTBOX_METRICS)),
- __metadata("design:paramtypes", [data_1.Database, Object, Object, Object, Object])
  +], OutboxService);
  +//# sourceMappingURL=outbox.service.js.map
  +```
-

+## package/dist/outbox/src/row-mapper.d.ts +
+```text
+/**

- - Column projection shared by every query that returns full outbox rows.
- - Aliasing to camelCase in SQL means the driver row already matches
- - `OutboxRow` — no separate JS-side mapping step, matching pec's
- - `OUTBOX_COLUMNS` convention.
- _/
  +export declare function outboxColumns(alias?: string): string;
  +/_* Normalizes a pg-style `{ rows }` or bare-array result into a row array. */
  +export declare function toRows<T>(result: {
- rows: T[];
  +} | T[]): T[];
  +/** Validates a `schema.table` identifier used to interpolate a table name into SQL text. */
  +export declare function assertQualifiedIdentifier(value: string, name: string): string;
  +export declare function isPgError(error: unknown): error is {
- code?: string;
  +};
  +export declare function isUniqueViolation(error: unknown): boolean;
  +export declare function errorMessage(error: unknown): string;
  +//# sourceMappingURL=row-mapper.d.ts.map
  +```
-

+## package/dist/outbox/src/types.d.ts +
+```text
+/**

- - Public types for the transactional outbox: envelope, row shape, dispatcher
- - port, backoff policy, and the minimal SQL executor duck-type that lets
- - `enqueue()` accept either a `@stynx-nyx/data` `Transaction` or any other
- - object exposing a compatible `query()` method.
- _/
  +/_* Lifecycle states for one outbox row. _/
  +export type OutboxStatus = 'PENDING' | 'SENT' | 'ACKED' | 'ERROR';
  +/_*
- - Entity-agnostic envelope for one outbox message. `entity` + `entityId`
- - identify the aggregate the message represents (e.g. `'renach.encounter'`,
- - `12`); `payload` is the wire body handed to the dispatcher. A second
- - `enqueue()` call for the same `(tenantId, entity, entityId)` upserts in
- - place (matching pec's `renach_outbox` semantics) rather than appending a
- - new row, so at most one outstanding message exists per aggregate.
- */
  +export interface OutboxEnvelope {
- /** Aggregate/domain type this message represents. Free-form, dot-namespaced by convention. */
- entity: string;
- /** Aggregate identifier, scoped to `entity` (and, implicitly, tenant). */
- entityId: string;
- /** Wire payload delivered to the dispatcher. Serialized as `jsonb`. */
- payload: Record<string, unknown>;
- /**
-     * Overrides the default idempotency key (`${entity}:${entityId}`). Set this
-     * when the same `(entity, entityId)` pair may legitimately need more than
-     * one in-flight message (rare — most callers should rely on the default).
-     */
- idempotencyKey?: string;
- /**
-     * Free-form linkage back to the originating domain record (replaces pec's
-     * hardcoded `encounterId` FK). Stored as `jsonb`; not interpreted by this
-     * package.
-     */
- metadata?: Record<string, unknown>;
  +}
  +/** Persisted shape of one outbox row, as returned by every service method. */
  +export interface OutboxRow {
- id: string;
- tenantId: string;
- entity: string;
- entityId: string;
- payload: Record<string, unknown>;
- metadata: Record<string, unknown> | null;
- status: OutboxStatus;
- attempts: number;
- lastError: string | null;
- ackTime: string | null;
- nextAttemptAt: string | null;
- idempotencyKey: string;
- createdAt: string;
- updatedAt: string;
  +}
  +/** Input to `OutboxService.ack()` — normally sourced from an inbound webhook body. */
  +export interface OutboxAckInput {
- entity: string;
- entityId: string;
- status: 'ACKED' | 'ERROR';
- detail?: string;
- /**
-     * Disambiguates `(entity, entityId)` across tenants. Required when the
-     * external system does not guarantee `entityId` is globally unique;
-     * omitting it while more than one tenant holds a matching row raises
-     * `OutboxAmbiguousAckError`.
-     */
- tenantId?: string;
  +}
  +/** Result of one `dispatchDue()` claim-and-send attempt. */
  +export interface OutboxDispatchOutcome {
- row: OutboxRow;
- /** `true` when a dispatcher port was invoked and returned without throwing. */
- dispatched: boolean;
- error?: string;
  +}
  +/**
- - Pluggable transport for claimed outbox rows. `send()` should throw (or
- - reject) to signal delivery failure; `dispatchDue()` catches the rejection,
- - reverts the row to `ERROR`, and schedules the next attempt via the
- - configured `OutboxBackoffPolicy`. Ship an HTTP implementation today
- - (`HttpOutboxDispatcher`); an EventBridge implementation is deferred —
- - this port is the seam a later package hangs it on.
- */
  +export interface OutboxDispatcherPort {
- send(row: OutboxRow): Promise<void>;
  +}
  +/**
- - Computes when a failed (or manually retried) row becomes eligible again.
- - pec hardcoded `now() + 15 minutes`; this package makes that a policy so
- - consumers can choose fixed-interval (pec-compatible default) or
- - exponential-with-jitter backoff.
- */
  +export interface OutboxBackoffPolicy {
- nextAttemptAt(attempt: number, now?: Date): Date;
  +}
  +/** Minimal SQL surface `OutboxService` needs from a transaction/executor. */
  +export interface OutboxSqlExecutor {
- query<T extends object = object>(sql: string, params?: ReadonlyArray<unknown>): Promise<{
-        rows: T[];
-        rowCount?: number | null;
- }>;
  +}
  +/** Optional metrics hook; no-op by default. */
  +export interface OutboxMetricsSink {
- incrementEnqueued(entity: string): void;
- incrementDispatched(entity: string, outcome: 'sent' | 'error'): void;
- incrementAcked(entity: string, outcome: 'acked' | 'error'): void;
  +}
  +export interface OutboxModuleOptions {
- /** Qualified table name for messages. Defaults to `outbox.messages`. */
- table?: string;
- /** Qualified table name for acknowledgements. Defaults to `outbox.acknowledgements`. */
- ackTable?: string;
- dispatcher?: OutboxDispatcherPort;
- backoffPolicy?: OutboxBackoffPolicy;
- metrics?: OutboxMetricsSink;
- /** Default `limit` for `dispatchDue()` when the caller doesn't pass one. */
- dispatchBatchSize?: number;
  +}
  +//# sourceMappingURL=types.d.ts.map
  +```
  diff --git a/work/rounds/R-0021/inputs/published-api-signature.md b/work/rounds/R-0021/inputs/published-api-signature.md
  new file mode 100644
  index 00000000..2f899028
  --- /dev/null
  +++ b/work/rounds/R-0021/inputs/published-api-signature.md
  @@ -0,0 +1,778 @@
  +# Published API — @stynx-nyx/signature 1.4.0 / 1.5.0-rc.2
-

+Extracted from archived npm tarballs; byte-identical own JS and declarations across both versions. See published-api-metadata.json for archive and per-file hashes. This is an inspection input, not a local API implementation. +
+## package/dist/signature/src/digest.d.ts +
+```text
+export type Sha256Encoding = 'hex' | 'base64';
+export interface Sha256Options {

- encoding?: Sha256Encoding;
  +}
  +export declare function sha256(input: string | Buffer | Uint8Array, options?: Sha256Options): string;
  +export declare function canonicalJson(value: unknown): string;
  +export declare function sha256CanonicalJson(value: unknown, options?: Sha256Options): string;
  +export declare function canonicalXmlDigest(xml: string, options?: Sha256Options): string;
  +//# sourceMappingURL=digest.d.ts.map
  +```
-

+## package/dist/signature/src/errors.d.ts +
+```text
+export declare class SignatureError extends Error {

- constructor(message: string, options?: ErrorOptions);
  +}
  +export declare class SignatureHashMismatchError extends SignatureError {
- constructor(expected: string, actual: string);
  +}
  +export declare class SignatureCertificateValidationError extends SignatureError {
- constructor(reason?: string);
  +}
  +export declare class SignatureProviderConfigurationError extends SignatureError {
- constructor(message?: string);
  +}
  +export declare class SignatureProviderError extends SignatureError {
- constructor(message: string, options?: ErrorOptions);
  +}
  +export declare class SignatureProviderResponseError extends SignatureProviderError {
- constructor(message: string);
  +}
  +export declare class SignatureVerificationInputError extends SignatureError {
- constructor(message?: string);
  +}
  +//# sourceMappingURL=errors.d.ts.map
  +```
-

+## package/dist/signature/src/govbr-sandbox.d.ts +
+```text
+export type GovBrSandboxState = 'pending' | 'completed' | 'failed';
+export type GovBrSandboxDecision = 'approved' | 'denied';
+export interface GovBrSandboxSigner {

- sub: string;
- username: string;
- cpf?: string | null | undefined;
- email?: string | null | undefined;
  +}
  +export interface GovBrSandboxRequest {
- tenantId: string;
- signer: GovBrSandboxSigner;
- resourceType: string;
- resourceId?: string | null | undefined;
- payload: Record<string, unknown>;
- returnUrl?: string | undefined;
  +}
  +export interface GovBrSandboxEvidence {
- uniqueAssociation: true;
- signerControlHighConfidence: true;
- laterModificationDetectable: true;
- creationDataControl: 'sandbox-state-challenge';
  +}
  +export interface GovBrSandboxResult {
- id: string;
- state: string;
- challenge: string;
- provider: 'govbr-local-sandbox';
- status: GovBrSandboxState;
- signerUniqueKey: string;
- payloadHash: string;
- signatureHash: string | null;
- tamperEvidentHash: string | null;
- evidenceUri: string | null;
- evidence: GovBrSandboxEvidence | null;
- createdAt: string;
- decidedAt: string | null;
  +}
  +export declare class GovBrSandboxAdapter {
- private readonly now;
- private readonly requests;
- constructor(now?: () => Date);
- createRequest(input: GovBrSandboxRequest): GovBrSandboxResult;
- complete(state: string, decision: GovBrSandboxDecision, challenge?: string): GovBrSandboxResult;
- verify(payload: Record<string, unknown>, result: GovBrSandboxResult): boolean;
  +}
  +export declare function createGovBrSandboxAdapter(now?: () => Date): GovBrSandboxAdapter;
  +export declare function govBrSandboxCallbackUrl(basePath: string, result: GovBrSandboxResult): string;
  +//# sourceMappingURL=govbr-sandbox.d.ts.map
  +```
-

+## package/dist/signature/src/http-provider-client.d.ts +
+```text
+import type { CertificateValidationRequest, CertificateValidationResult, HttpSignatureProviderOptions, ProviderSignRequest, ProviderSignResult, ProviderVerifyRequest, VerifyResult } from './types';
+export declare class HttpSignatureProviderClient {

- private readonly options;
- private readonly adapter;
- private readonly pathPrefix;
- private readonly defaultHeaders;
- constructor(options?: HttpSignatureProviderOptions);
- validateCertificate(request: CertificateValidationRequest): Promise<CertificateValidationResult>;
- signPades(request: ProviderSignRequest): Promise<ProviderSignResult>;
- verifyPades(request: ProviderVerifyRequest): Promise<VerifyResult>;
- private execute;
- private request;
- private path;
  +}
  +//# sourceMappingURL=http-provider-client.d.ts.map
  +```
-

+## package/dist/signature/src/http-provider-client.js +
+```text
+"use strict";
+Object.defineProperty(exports, "__esModule", { value: true });
+exports.HttpSignatureProviderClient = void 0;
+const integration_adapter_1 = require("@stynx-nyx/integration-adapter");
+const errors_1 = require("./errors");
+class HttpSignatureProviderClient {

- options;
- adapter;
- pathPrefix;
- defaultHeaders;
- constructor(options = {}) {
-        this.options = options;
-        this.pathPrefix = normalizePathPrefix(options.pathPrefix ?? '/mock');
-        this.defaultHeaders = options.headers ?? {};
-        this.adapter = new integration_adapter_1.IntegrationAdapter({
-            name: 'stynx-signature-provider',
-            request: async (input) => this.request(input),
-            parseResponse: (raw) => raw,
-            retryPolicy: options.retryPolicy ?? { maxAttempts: 2, baseDelayMs: 250, maxDelayMs: 1_000 },
-            timeoutMs: options.timeoutMs ?? 15_000,
-            idempotencyKey: (input) => input.idempotencyKey,
-            circuitBreakerKey: (input) => input.circuitBreakerKey,
-            ...(options.telemetry ? { telemetry: options.telemetry } : {}),
-        });
- }
- async validateCertificate(request) {
-        const raw = await this.execute({
-            endpoint: this.options.baseUrl,
-            path: this.path('/tsa/ocsp/validate'),
-            circuitBreakerKey: 'certificate-validation',
-            body: {
-                tenantId: request.tenantId,
-                actorId: request.actorId,
-                certificate: serializeCertificate(request.certificate),
-                certificatePem: request.certificate.pem,
-                allowCrlFallback: request.allowCrlFallback,
-                crlUrl: request.crlUrl ?? this.options.crlUrl,
-                metadata: request.metadata,
-            },
-        });
-        assertBoolean(raw.good, 'good');
-        assertRevocationSource(raw.source, 'source');
-        return {
-            good: raw.good,
-            source: toRevocationSource(raw.source),
-            checkedAt: parseDate(raw.checkedAt, 'checkedAt'),
-            ...(raw.certificateChainPem ? { certificateChainPem: raw.certificateChainPem } : {}),
-            ...(raw.reason ? { reason: raw.reason } : {}),
-            ...(raw.providerEvidenceUri ? { providerEvidenceUri: raw.providerEvidenceUri } : {}),
-        };
- }
- async signPades(request) {
-        const raw = await this.execute({
-            endpoint: request.tsa.endpoint || this.options.baseUrl,
-            path: this.path('/tsa/sign'),
-            idempotencyKey: request.idempotencyKey,
-            circuitBreakerKey: 'pades-sign',
-            headers: request.tsa.headers,
-            body: {
-                tenantId: request.tenantId,
-                actorId: request.actorId,
-                pdfBase64: Buffer.from(request.document).toString('base64'),
-                documentSha256: request.documentSha256,
-                algorithm: request.algorithm,
-                digestAlgorithm: request.digestAlgorithm,
-                tsa: {
-                    policyOid: request.tsa.policyOid,
-                    timeoutMs: request.tsa.timeoutMs,
-                },
-                certificate: serializeCertificate(request.certificate),
-                certificatePem: request.certificate.pem,
-                credential: request.credential,
-                metadata: request.metadata,
-            },
-        });
-        assertString(raw.signedPdfBase64, 'signedPdfBase64');
-        return {
-            signedDocument: Buffer.from(raw.signedPdfBase64, 'base64'),
-            ...(raw.cmsSignatureBase64
-                ? { cmsSignature: Buffer.from(raw.cmsSignatureBase64, 'base64') }
-                : {}),
-            ...(raw.signatureId ? { signatureId: raw.signatureId } : {}),
-            ...(raw.signedAt ? { signedAt: parseDate(raw.signedAt, 'signedAt') } : {}),
-            ...(raw.tsaTime ? { tsaTime: parseDate(raw.tsaTime, 'tsaTime') } : {}),
-            ...(raw.certificateChainPem ? { certificateChainPem: raw.certificateChainPem } : {}),
-            revocationSource: raw.revocationSource ? toRevocationSource(raw.revocationSource) : 'none',
-            ...(raw.revocationCheckedAt
-                ? { revocationCheckedAt: parseDate(raw.revocationCheckedAt, 'revocationCheckedAt') }
-                : {}),
-            ...(raw.providerEvidenceUri ? { providerEvidenceUri: raw.providerEvidenceUri } : {}),
-        };
- }
- async verifyPades(request) {
-        const raw = await this.execute({
-            endpoint: this.options.baseUrl,
-            path: this.path('/pades/verify'),
-            circuitBreakerKey: 'pades-verify',
-            body: {
-                tenantId: request.tenantId,
-                documentBase64: Buffer.from(request.document).toString('base64'),
-                documentSha256: request.documentSha256,
-                signedDocumentBase64: request.signedDocument
-                    ? Buffer.from(request.signedDocument).toString('base64')
-                    : undefined,
-                cmsSignatureBase64: request.cmsSignature
-                    ? Buffer.from(request.cmsSignature).toString('base64')
-                    : undefined,
-                policy: request.policy,
-                metadata: request.metadata,
-            },
-        });
-        if (raw.status !== 'valid' && raw.status !== 'invalid' && raw.status !== 'unknown') {
-            throw new errors_1.SignatureProviderResponseError('status must be valid, invalid, or unknown');
-        }
-        return {
-            status: raw.status,
-            documentSha256: request.documentSha256,
-            checkedAt: parseDate(raw.checkedAt, 'checkedAt'),
-            ...(raw.signerCertificate ? { signerCertificate: raw.signerCertificate } : {}),
-            revocationSource: raw.revocationSource ? toRevocationSource(raw.revocationSource) : 'none',
-            ...(raw.revocationCheckedAt
-                ? { revocationCheckedAt: parseDate(raw.revocationCheckedAt, 'revocationCheckedAt') }
-                : {}),
-            ...(raw.certificateChainPem ? { certificateChainPem: raw.certificateChainPem } : {}),
-            reasons: raw.reasons ?? [],
-        };
- }
- async execute(input) {
-        try {
-            return (await this.adapter.execute(input));
-        }
-        catch (error) {
-            if (error instanceof errors_1.SignatureProviderError) {
-                throw error;
-            }
-            throw new errors_1.SignatureProviderError(`Signature provider call failed: ${errorMessage(error)}`, {
-                cause: error,
-            });
-        }
- }
- async request(input) {
-        const baseUrl = input.endpoint ?? this.options.baseUrl;
-        if (!baseUrl) {
-            throw new errors_1.SignatureProviderConfigurationError('Signature provider base URL is required');
-        }
-        const fetchFn = this.options.fetch ?? fetch;
-        const response = await fetchFn(new URL(input.path, ensureTrailingSlash(baseUrl)), {
-            method: 'POST',
-            headers: {
-                'content-type': 'application/json',
-                ...this.defaultHeaders,
-                ...(input.headers ?? {}),
-            },
-            body: JSON.stringify(input.body),
-        });
-        if (!response.ok) {
-            throw new errors_1.SignatureProviderError(`Signature provider returned HTTP ${response.status} for ${input.path}`);
-        }
-        return response.json();
- }
- path(suffix) {
-        return `${this.pathPrefix}${suffix}`;
- }
  +}
  +exports.HttpSignatureProviderClient = HttpSignatureProviderClient;
  +function normalizePathPrefix(value) {
- if (value === '') {
-        return '';
- }
- return value.startsWith('/') ? value.replace(/\/$/, '') : `/${value.replace(/\/$/, '')}`;
  +}
  +function ensureTrailingSlash(value) {
- return value.endsWith('/') ? value : `${value}/`;
  +}
  +function serializeCertificate(certificate) {
- return {
-        subject: certificate.subject,
-        issuer: certificate.issuer,
-        serialNumber: certificate.serialNumber,
-        notBefore: certificate.notBefore?.toISOString(),
-        notAfter: certificate.notAfter?.toISOString(),
- };
  +}
  +function toRevocationSource(source) {
- return source.toLowerCase();
  +}
  +function parseDate(value, field) {
- if (!value) {
-        return new Date();
- }
- const date = new Date(value);
- if (Number.isNaN(date.getTime())) {
-        throw new errors_1.SignatureProviderResponseError(`${field} is not a valid date`);
- }
- return date;
  +}
  +function assertString(value, field) {
- if (typeof value !== 'string' || value.length === 0) {
-        throw new errors_1.SignatureProviderResponseError(`${field} must be a non-empty string`);
- }
  +}
  +function assertBoolean(value, field) {
- if (typeof value !== 'boolean') {
-        throw new errors_1.SignatureProviderResponseError(`${field} must be a boolean`);
- }
  +}
  +function assertRevocationSource(value, field) {
- if (value !== 'OCSP' && value !== 'CRL' && value !== 'EMBEDDED' && value !== 'NONE') {
-        throw new errors_1.SignatureProviderResponseError(`${field} must be OCSP, CRL, EMBEDDED, or NONE`);
- }
  +}
  +function errorMessage(error) {
- return error instanceof Error ? error.message : String(error);
  +}
  +//# sourceMappingURL=http-provider-client.js.map
  +```
-

+## package/dist/signature/src/index.d.ts +
+```text
+import type { SignatureBackend } from './types';
+export * from './errors';
+export * from './digest';
+export * from './govbr-sandbox';
+export * from './http-provider-client';
+export * from './pades';
+export * from './provider-backend';
+export * from './sequential';
+export * from './signature.module';
+export * from './signature.service';
+export * from './tokens';
+export * from './types';
+export * from './xmldsig';
+/**

- - Creates a deterministic in-memory signature backend for tests and local demos.
- */
  +export declare function createMockSignatureBackend(now?: () => Date): SignatureBackend;
  +//# sourceMappingURL=index.d.ts.map
  +```
-

+## package/dist/signature/src/pades.d.ts +
+```text
+export interface PadesEvidenceRequest {

- payload: Uint8Array;
- verifyUrl: string;
- reason?: string | undefined;
- signedAt?: string | undefined;
- signerName?: string | undefined;
- evidenceUri?: string | undefined;
  +}
  +export interface PadesEvidenceEnvelope {
- format: 'PAdES';
- profile: 'PAdES-B-B';
- signerName: string;
- signedAt: string;
- reason: string;
- verifyUrl: string;
- payloadSha256: string;
- signatureSha256: string;
- evidenceUri: string;
  +}
  +export interface PadesEvidenceResult {
- signedDocument: Uint8Array;
- envelope: PadesEvidenceEnvelope;
- block: Uint8Array;
  +}
  +export declare class MockPadesEvidenceAdapter {
- private readonly now;
- constructor(now?: () => Date);
- sign(input: PadesEvidenceRequest): PadesEvidenceResult;
  +}
  +export declare function createMockPadesEvidenceAdapter(now?: () => Date): MockPadesEvidenceAdapter;
  +export declare function encodePadesEvidenceBlock(envelope: PadesEvidenceEnvelope): Uint8Array;
  +export declare function decodePadesEvidenceBlock(document: Uint8Array): PadesEvidenceEnvelope | null;
  +//# sourceMappingURL=pades.d.ts.map
  +```
-

+## package/dist/signature/src/provider-backend.d.ts +
+```text
+import type { SignatureBackend, SignatureProviderClient, SignatureRequest, SignatureResult, VerificationPolicy, VerifyRequest, VerifyResult } from './types';
+export declare class ProviderBackedSignatureBackend implements SignatureBackend {

- private readonly provider;
- private readonly options;
- constructor(provider: SignatureProviderClient, options?: {
-        verificationPolicy?: VerificationPolicy | undefined;
-        crlUrl?: string | undefined;
-        now?: (() => Date) | undefined;
- });
- sign(request: SignatureRequest): Promise<SignatureResult>;
- verify(request: VerifyRequest): Promise<VerifyResult>;
- private now;
  +}
  +//# sourceMappingURL=provider-backend.d.ts.map
  +```
-

+## package/dist/signature/src/sequential.d.ts +
+```text
+export interface SequentialSignerRef {

- id: string;
- subject: string;
- serial: string;
- role?: string | undefined;
  +}
  +export interface SequentialSignatureEntry {
- order: number;
- signer: SequentialSignerRef;
- digest: string;
- signedAt: string;
  +}
  +export interface SequentialEnvelope {
- schemaVersion: '1';
- payloadBase64: string;
- payloadSha256: string;
- signatures: SequentialSignatureEntry[];
- expectedSignerIds: string[];
- allowedReaderRoles: string[];
- published: boolean;
  +}
  +export interface SequentialVerifyResult {
- ok: boolean;
- order: string[];
- tampered: boolean;
- reasons: string[];
  +}
  +export interface SequentialReadResult {
- allowed: boolean;
- payload?: Uint8Array | undefined;
- reasons: string[];
  +}
  +export declare class SequentialSigner {
- private readonly options;
- constructor(options: {
-        expectedSignerIds: string[];
-        allowedReaderRoles?: string[] | undefined;
-        now?: (() => Date) | undefined;
- });
- create(payload: Uint8Array): SequentialEnvelope;
- append(envelope: SequentialEnvelope, signer: SequentialSignerRef): SequentialEnvelope;
- publish(envelope: SequentialEnvelope): SequentialEnvelope;
- verify(envelope: SequentialEnvelope): SequentialVerifyResult;
- read(envelope: SequentialEnvelope, role: string): SequentialReadResult;
  +}
  +export declare function verifySequentialEnvelope(envelope: SequentialEnvelope): SequentialVerifyResult;
  +export declare function readSequentialEnvelope(envelope: SequentialEnvelope, role: string): SequentialReadResult;
  +//# sourceMappingURL=sequential.d.ts.map
  +```
-

+## package/dist/signature/src/signature.module.d.ts +
+```text
+import { type DynamicModule } from '@nestjs/common';
+import type { StynxSignatureModuleOptions } from './types';
+export declare class StynxSignatureModule {

- static forRoot(options?: StynxSignatureModuleOptions): DynamicModule;
  +}
  +//# sourceMappingURL=signature.module.d.ts.map
  +```
-

+## package/dist/signature/src/signature.module.js +
+```text
+"use strict";
+var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {

- var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
- if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
- else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
- return c > 3 && r && Object.defineProperty(target, key, r), r;
  +};
  +var StynxSignatureModule_1;
  +Object.defineProperty(exports, "__esModule", { value: true });
  +exports.StynxSignatureModule = void 0;
  +const common_1 = require("@nestjs/common");
  +const http_provider_client_1 = require("./http-provider-client");
  +const provider_backend_1 = require("./provider-backend");
  +const signature_service_1 = require("./signature.service");
  +const tokens_1 = require("./tokens");
  +let StynxSignatureModule = StynxSignatureModule_1 = class StynxSignatureModule {
- static forRoot(options = {}) {
-        return {
-            module: StynxSignatureModule_1,
-            global: true,
-            providers: [
-                {
-                    provide: tokens_1.STYNX_SIGNATURE_OPTIONS,
-                    useValue: options,
-                },
-                {
-                    provide: tokens_1.STYNX_SIGNATURE_PROVIDER_CLIENT,
-                    useFactory: () => options.providerClient ?? new http_provider_client_1.HttpSignatureProviderClient(options.provider),
-                },
-                {
-                    provide: tokens_1.STYNX_SIGNATURE_BACKEND,
-                    useFactory: (provider) => options.backend ??
-                        new provider_backend_1.ProviderBackedSignatureBackend(provider, {
-                            verificationPolicy: options.verificationPolicy,
-                            crlUrl: options.provider?.crlUrl,
-                            now: options.now,
-                        }),
-                    inject: [tokens_1.STYNX_SIGNATURE_PROVIDER_CLIENT],
-                },
-                {
-                    provide: signature_service_1.SignatureService,
-                    useFactory: (backend) => new signature_service_1.SignatureService(backend),
-                    inject: [tokens_1.STYNX_SIGNATURE_BACKEND],
-                },
-            ],
-            exports: [
-                tokens_1.STYNX_SIGNATURE_OPTIONS,
-                tokens_1.STYNX_SIGNATURE_BACKEND,
-                tokens_1.STYNX_SIGNATURE_PROVIDER_CLIENT,
-                signature_service_1.SignatureService,
-            ],
-        };
- }
  +};
  +exports.StynxSignatureModule = StynxSignatureModule;
  +exports.StynxSignatureModule = StynxSignatureModule = StynxSignatureModule_1 = __decorate([
- (0, common_1.Module)({})
  +], StynxSignatureModule);
  +//# sourceMappingURL=signature.module.js.map
  +```
-

+## package/dist/signature/src/signature.service.d.ts +
+```text
+import type { SignatureBackend, SignatureRequest, SignatureResult, VerifyRequest, VerifyResult } from './types';
+export declare function sha256Hex(bytes: Uint8Array): string;
+export declare class SignatureService {

- private readonly backend;
- constructor(backend?: SignatureBackend);
- sign(request: SignatureRequest): Promise<SignatureResult>;
- verify(request: VerifyRequest): Promise<VerifyResult>;
  +}
  +//# sourceMappingURL=signature.service.d.ts.map
  +```
-

+## package/dist/signature/src/signature.service.js +
+```text
+"use strict";
+Object.defineProperty(exports, "__esModule", { value: true });
+exports.SignatureService = void 0;
+exports.sha256Hex = sha256Hex;
+const node_crypto_1 = require("node:crypto");
+const errors_1 = require("./errors");
+class MissingSignatureBackend {

- async sign() {
-        throw new errors_1.SignatureProviderConfigurationError();
- }
- async verify() {
-        throw new errors_1.SignatureProviderConfigurationError();
- }
  +}
  +function sha256Hex(bytes) {
- return (0, node_crypto_1.createHash)('sha256').update(bytes).digest('hex');
  +}
  +function assertDocumentHash(document, expectedSha256) {
- const actual = sha256Hex(document);
- if (actual !== expectedSha256) {
-        throw new errors_1.SignatureHashMismatchError(expectedSha256, actual);
- }
  +}
  +class SignatureService {
- backend;
- constructor(backend = new MissingSignatureBackend()) {
-        this.backend = backend;
- }
- async sign(request) {
-        assertDocumentHash(request.document, request.documentSha256);
-        return this.backend.sign({
-            ...request,
-            algorithm: request.algorithm ?? 'pades-ltv',
-            digestAlgorithm: request.digestAlgorithm ?? 'sha256',
-        });
- }
- async verify(request) {
-        assertDocumentHash(request.document, request.documentSha256);
-        if (!request.signedDocument && !request.cmsSignature) {
-            throw new errors_1.SignatureVerificationInputError();
-        }
-        return this.backend.verify(request);
- }
  +}
  +exports.SignatureService = SignatureService;
  +//# sourceMappingURL=signature.service.js.map
  +```
-

+## package/dist/signature/src/tokens.d.ts + +`text
+export declare const STYNX_SIGNATURE_OPTIONS: unique symbol;
+export declare const STYNX_SIGNATURE_BACKEND: unique symbol;
+export declare const STYNX_SIGNATURE_PROVIDER_CLIENT: unique symbol;
+//# sourceMappingURL=tokens.d.ts.map
+` +
+## package/dist/signature/src/types.d.ts +
+```text
+import type { IntegrationTelemetry, RetryPolicy } from '@stynx-nyx/integration-adapter';
+export type SignatureAlgorithm = 'pades-baseline-t' | 'pades-ltv';
+export type DigestAlgorithm = 'sha256';
+export type RevocationSource = 'ocsp' | 'crl' | 'embedded' | 'none';
+export interface SignatureCertificateRef {

- subject: string;
- issuer: string;
- serialNumber: string;
- notBefore?: Date;
- notAfter?: Date;
- pem?: string | undefined;
  +}
  +export interface SignatureCredentialRef {
- certificateId?: string | undefined;
- keyId?: string | undefined;
- providerAccountId?: string | undefined;
  +}
  +export interface TsaOptions {
- endpoint: string;
- policyOid?: string | undefined;
- timeoutMs?: number | undefined;
- headers?: Record<string, string> | undefined;
  +}
  +export interface VerificationPolicy {
- requireTimestamp?: boolean | undefined;
- requireRevocationEvidence?: boolean | undefined;
- allowCrlFallback?: boolean | undefined;
- maxClockSkewMs?: number | undefined;
  +}
  +export interface SignatureRequest {
- tenantId: string;
- actorId: string;
- document: Uint8Array;
- documentSha256: string;
- tsa: TsaOptions;
- certificate: SignatureCertificateRef;
- credential?: SignatureCredentialRef | undefined;
- algorithm?: SignatureAlgorithm | undefined;
- digestAlgorithm?: DigestAlgorithm | undefined;
- idempotencyKey?: string | undefined;
- metadata?: Record<string, string> | undefined;
  +}
  +export interface SignatureEvidence {
- signatureId: string;
- documentSha256: string;
- signedAt: Date;
- tsaTime?: Date | undefined;
- signerCertificate: SignatureCertificateRef;
- certificateChainPem?: string[] | undefined;
- revocationSource: RevocationSource;
- revocationCheckedAt?: Date | undefined;
- providerEvidenceUri?: string | undefined;
  +}
  +export interface SignatureResult {
- status: 'signed';
- signedDocument: Uint8Array;
- cmsSignature: Uint8Array;
- evidence: SignatureEvidence;
  +}
  +export interface VerifyRequest {
- tenantId: string;
- document: Uint8Array;
- documentSha256: string;
- signedDocument?: Uint8Array | undefined;
- cmsSignature?: Uint8Array | undefined;
- policy?: VerificationPolicy | undefined;
- metadata?: Record<string, string> | undefined;
  +}
  +export interface VerifyResult {
- status: 'valid' | 'invalid' | 'unknown';
- documentSha256: string;
- checkedAt: Date;
- signerCertificate?: SignatureCertificateRef | undefined;
- revocationSource: RevocationSource;
- revocationCheckedAt?: Date | undefined;
- certificateChainPem?: string[] | undefined;
- reasons: string[];
  +}
  +export interface SignatureBackend {
- sign(request: SignatureRequest): Promise<SignatureResult>;
- verify(request: VerifyRequest): Promise<VerifyResult>;
  +}
  +export interface CertificateValidationRequest {
- tenantId: string;
- actorId?: string | undefined;
- certificate: SignatureCertificateRef;
- allowCrlFallback: boolean;
- crlUrl?: string | undefined;
- metadata?: Record<string, string> | undefined;
  +}
  +export interface CertificateValidationResult {
- good: boolean;
- source: RevocationSource;
- checkedAt: Date;
- certificateChainPem?: string[] | undefined;
- reason?: string | undefined;
- providerEvidenceUri?: string | undefined;
  +}
  +export interface ProviderSignRequest {
- tenantId: string;
- actorId: string;
- document: Uint8Array;
- documentSha256: string;
- tsa: TsaOptions;
- certificate: SignatureCertificateRef;
- credential?: SignatureCredentialRef | undefined;
- algorithm: SignatureAlgorithm;
- digestAlgorithm: DigestAlgorithm;
- idempotencyKey?: string | undefined;
- metadata?: Record<string, string> | undefined;
  +}
  +export interface ProviderSignResult {
- signedDocument: Uint8Array;
- cmsSignature?: Uint8Array | undefined;
- signatureId?: string | undefined;
- signedAt?: Date | undefined;
- tsaTime?: Date | undefined;
- certificateChainPem?: string[] | undefined;
- revocationSource: RevocationSource;
- revocationCheckedAt?: Date | undefined;
- providerEvidenceUri?: string | undefined;
  +}
  +export interface ProviderVerifyRequest {
- tenantId: string;
- document: Uint8Array;
- documentSha256: string;
- signedDocument?: Uint8Array | undefined;
- cmsSignature?: Uint8Array | undefined;
- policy?: VerificationPolicy | undefined;
- metadata?: Record<string, string> | undefined;
  +}
  +export interface SignatureProviderClient {
- validateCertificate(request: CertificateValidationRequest): Promise<CertificateValidationResult>;
- signPades(request: ProviderSignRequest): Promise<ProviderSignResult>;
- verifyPades(request: ProviderVerifyRequest): Promise<VerifyResult>;
  +}
  +export interface HttpSignatureProviderOptions {
- baseUrl?: string | undefined;
- pathPrefix?: string | undefined;
- timeoutMs?: number | undefined;
- headers?: Record<string, string> | undefined;
- crlUrl?: string | undefined;
- retryPolicy?: RetryPolicy | undefined;
- telemetry?: IntegrationTelemetry | undefined;
- fetch?: typeof fetch | undefined;
  +}
  +export interface StynxSignatureModuleOptions {
- provider?: HttpSignatureProviderOptions | undefined;
- backend?: SignatureBackend | undefined;
- providerClient?: SignatureProviderClient | undefined;
- verificationPolicy?: VerificationPolicy | undefined;
- now?: (() => Date) | undefined;
  +}
  +//# sourceMappingURL=types.d.ts.map
  +```
  diff --git a/work/rounds/R-0021/plan.md b/work/rounds/R-0021/plan.md
  index 221fc66f..9000284b 100644
  --- a/work/rounds/R-0021/plan.md
  +++ b/work/rounds/R-0021/plan.md
  @@ -184,14 +184,36 @@ Todos existem em `package.json` hoje, salvo `verify:stynx-pin` (entregável de T

## Decisões do maestro

+A1 (Owner, 2026-09-27): esta seção e AUTHORIZATION.md prevalecem sobre a proposta histórica acima. O escopo autorizado é CTG-0001 (inventário/caracterização/adenda), CTG-0002 (pin/gate) e CTG-0007 (documentação/fechamento). CTG-0003/0004/0005 transferidos integralmente a R-0022; CTG-0006 é decisão sem código. TASK-0005…0013 canceladas nesta rodada, nunca concluídas por inferência. TASK-0015 é o Inspector do verificador, antes de TASK-0004. TASK-0001 é materializada na preparação Astra. TASK-0014 depende dos grupos ativos, não das tarefas canceladas. +
+Astra prepara; Sol `gpt-6-sol/high` orquestra após PASS independente. Até quatro ciclos de revisão/item; orçamento 2,25 M de entrada/janela, checkpoint 1,8 M. Critérios originais de migração ficam `fail` no closure. Fechamento sem selo expressamente aprovado. ADR-0036 é o alvo canônico do antigo ADR-0006-ops. +
+O contrato fechado do pin é `contracts/CTG-0002.md`; o grafo adicional e as dependências múltiplas vivem em `execution.json` (o esquema TASK aceita apenas um `upstream_task_id`). +

## Concorrência

+Base verificada: `e47a68014ffdd24e1f9da03c4fc9e1b78ecf381b`, R-0017 concluída (PRs #133/#143/#144/#145); nenhum PR aberto no bootstrap. Worktree gerenciada `/Users/aarusso/.codex/worktrees/stynx-canonical/detran`; branch `orchestra/stynx-canonical`. R-0020 tem checkout próprio; integrar avanços de main sem reescrever branch publicado. +
+TASK-0002 e TASK-0003 têm arquivos distintos; testes com o mesmo banco são serializados. TASK-0015 pode trabalhar em paralelo em branch/worktree separado após congelamento do candidato CTG-0001, sem commits de CTG novo em PR aberto. Instalação, geração, banco e gates globais têm lock exclusivo. Máximo três workers, limitado pela capacidade real. +

## Triagem

## Adendas

+### A1 — escopo e execução aprovados pelo Owner +
+Ver AUTHORIZATION.md e contratos. Preservar integralmente as metas e critérios históricos; nenhuma migração transferida será marcada PASS. O pin 1.4.0 e suas provas permanecem exigidos. A caracterização HTTP de offline-sync usa o harness real do app (TEAT/BOAT), e os testes de integração permanecem no pacote offline; nenhuma dependência de teste nova será inventada. Prompt de referência anterior preservado em `inputs/00-maestro-before-A1.md`. +

## Bloqueios

## Retomada

+Preparação Astra concluída e prompt-review-3 PASS aceito pela ponte (ciclo1 REVIEW, ciclo2 falha de formato). TASK0001 pre_merge; nenhuma implementação disparada pelo Astra. Handoff para Sol High com prompts/00-maestro.md e execution.json. Baseline em andamento pelo preparador, conforme reports/bootstrap.md; aguardar o resultado real antes de liberar Inspectors. Sol atualiza este checkpoint por grupo. +
+Checkpoint Sol: baseline `pnpm check` exit 0 comprovado por `/tmp/r21-baseline.done` e `reports/baseline-check.log`. Head/base `e47a68014ffdd24e1f9da03c4fc9e1b78ecf381b`; `origin/main` igual. TASK-0001 permanece `pre_merge`. TASK-0002 e TASK-0003 despachadas em paralelo a Terra/medium com bancos PostGIS exclusivos `detran_r21_task2` e `detran_r21_task3`, após build clinical-reports exit 0. TASK-0015 ainda não despachada; CTG-0001 deve congelar o candidato antes. Nenhum PR R-0021 aberto, nenhum CI remoto desta rodada, último veredito prompt-review-3 PASS. Container ativo `detran-r21-postgis` (ID `a9abf78080db`); não há processo de longa duração iniciado pelo maestro fora dele. Próximos comandos: receber relatórios TASK-0002/0003, validar critérios e gates focais, executar gates globais e delivery-review CTG-0001. +
+Checkpoint CTG-0001: TASK-0002 e TASK-0003 entregues por Terra/medium, com uma iteração focal cada (limpeza da fixture RENACH e negativo RLS inequívoco). Caracterização 1.3.1 verde; matrizes C-01 nos relatórios. `pnpm check` final exit 0; `pnpm backend:test:ci` exit 0 com mock SENATRAN da rodada (app e2e 37/37, upgrade 21/21); logs e triagem em `reports/CTG-0001-gates.md`. A primeira tentativa backend sem mock falhou como `sensor-error` e foi preservada. Base/HEAD ainda `e47a68014ffdd24e1f9da03c4fc9e1b78ecf381b`, sem PR ou CI remoto. Serviço mock vivo PID 96431, PostGIS container `a9abf78080db`; nenhum worker ativo. Próximos comandos: delivery-review CTG-0001 por Opus 5.5, correções se exigidas, commit/evidência e PR/RC exact-tree. +

## Leitura

-

+Planejamento e preparação ancorados em `e47a68014ffdd24e1f9da03c4fc9e1b78ecf381b`: AGENTS/CODESTYLE, Constituição pinned e schemas task/closure, método/model-ladder/waves/templates/bridge, campanha e spec upstream, plano/maestro R-0021 e consumidor R-0022, manuais de papéis, steering §H, ODs, ADRs e código/testes listados nos contratos. Pacotes publicados 1.4.0 e RC2 inspecionados por tarball; detalhes/hashes em inputs publicados. Cada subagente declara no relatório suas fontes adicionais.
diff --git a/work/rounds/R-0021/prompts/00-maestro.md b/work/rounds/R-0021/prompts/00-maestro.md
index 9cb3ef1d..c70c470c 100644
--- a/work/rounds/R-0021/prompts/00-maestro.md
+++ b/work/rounds/R-0021/prompts/00-maestro.md
@@ -1,264 +1,71 @@
-# Prompt do maestro — orquestra `stynx-canonical` (rodada `R-0021`)
+# Maestro R-0021 — execução após preparação Astra

-> Cole este prompt inteiro numa sessão **nova e sem contexto** da CLI da família `OpenAI — Codex CLI com Sol 6`
-> (id exato do modelo confirmado com `codex --help` no bootstrap), aberta na worktree `/Volumes/Thiamat II/stech/detran-worktrees/stynx-canonical`.
-> Você é o **maestro** desta orquestra. Tudo o que você precisa saber está nos arquivos citados;
-> não há contexto anterior a recuperar.
+Papel inicial: Architect. Você é o maestro **gpt-6-sol**, esforço **high**, em sessão limpa. Execute o escopo aprovado até seu fechamento formal. Não replaneje o que está fechado; nunca reabra decisões do Owner.

-## 0. Identidade e limites
+## Estado de entrada

-- Você é o maestro da frente **`stynx-canonical`**: ação **7a** da campanha C-0002 (pin STYNX

- 1.3.1 → 1.4.0 e troca de reimplementações locais por `@stynx-nyx/*` já publicados), definida em
- `work/campaigns/C-0002-consolidacao.md` e `work/rounds/R-0021/plan.md`.
  -- Declare, na primeira linha da sua primeira resposta, o papel constitucional em que atua em cada
- fase: **Architect** ao planejar e revisar, **Engineer** ao commitar código, **Auditor** nunca
- (o reviewer é a outra família). Os workers declaram o papel deles no próprio prompt.
  -- Família dos seus workers: **a sua** (`codex`: Sol 6 grande, Terra médio, Luna pequeno, conforme
- `model-ladder.md` e C-0002 §4), por subagentes nativos da sua CLI.
- Família do reviewer: **a outra** (`claude`), modelo **Opus 5.5** (id confirmado com
- `claude --help` no bootstrap, ex.: `claude-opus-5-5`), sempre pela ponte
- `tools/orchestra/bridge.sh`, nível grande em toda revisão desta rodada (assinatura e RLS). Nunca inverta.
  -- Orçamento desta janela de 5 h: **frente prevista para 2 janelas; nesta janela, um planejamento de
- maestro + até 8 tarefas de worker (Sol 6/Terra/Luna) com revisões — ≈ 750 k tokens de entrada; ao
- atingir 80 % grave checkpoint**. Contabilize em
- `work/rounds/R-0021/budget.json` (uma linha por tarefa e por chamada ao reviewer, com
- estimativas de tokens de entrada e saída). Se esgotar, grave `checkpoint` (§9) e pare.
  -- Você é o único que executa `git`. Workers não commitam, não fazem push, não abrem PR.
  -- Concorrência (regra de `waves.md`): para **abrir** esta frente basta `origin/main` atualizado com
- **R-0017 (`orchestra/local-stack`) mesclada** (C-0002 §2). O que depende de upstream é o
- **merge de cada grupo acoplado**: **CTG-0001 (contratos, caracterização, adenda A1 à spec
- upstream): nenhum upstream além de R-0017. CTG-0002 (pin 1.4.0): CTG-0001 mesclado. CTG-0003
- (assinatura), CTG-0004 (outbox de despacho), CTG-0005 (offline-sync): CTG-0002 mesclado; locks
- disjuntos, correm em paralelo. CTG-0006 (notificações): OD-R21-03. CTG-0007 (docs): 0003–0005.
- S-1.5 (repositório STYNX, 1.5.0) corre em paralelo e não é upstream desta rodada; esta rodada o
- alimenta pela adenda A1 de `work/campaigns/C-0002-stynx-upstream-spec.md` §8 no PR do CTG-0001**.
- No bootstrap, registre em `plan.md` §Concorrência quais upstreams já estão em `main`
- (`git log --oneline -30 origin/main`, `gh pr list --state merged --limit 20`), quais grupos estão
- liberados para merge e quais serão desenvolvidos sobre base empilhada (§1). Grupos livres avançam
- sempre; grupos presos aguardam ou empilham, nunca bloqueiam a rodada inteira.
  +- Worktree real: `/Users/aarusso/.codex/worktrees/stynx-canonical/detran`, branch `orchestra/stynx-canonical`, base `e47a68014ffdd24e1f9da03c4fc9e1b78ecf381b` (R-0017 mesclada).
  +- Astra materializou autorização, adenda, contratos, tasks, prompts, compositions, spec upstream A1 e referências consumidoras. TASK-0001 está `pre_merge`, preparada, aguardando a validação do grupo. Não redisparar.
  +- TASK-0002/0003 caracterizam 1.3.1; TASK-0015 escreve negativos do pin; TASK-0004 implementa somente pin 1.4.0/gate; TASK-0014 transcreve o resultado. TASK-0005…0013 canceladas e transferidas para R-0022.
  +- Nada foi mesclado por esta rodada ainda. Nunca confundir preparação com implementação concluída.
  +- pnpm install --frozen-lockfile da baseline já executado pela preparação. Confira `reports/bootstrap.md` para gates que efetivamente terminaram. Não invente PASS.
  +- Antes de disparar, leia o último prompt-review e confirme PASS, hashes em compositions e ausência de alteração substantiva posterior. Artefatos históricos em inputs não são instruções ativas.

-## 1. Bootstrap (Engineer)
+## Autoridade e leitura única

-**Descoberta de estado — antes de criar qualquer coisa.** Outra sessão pode ter começado esta
-frente ou uma vizinha; nunca duplique worktree, branch ou rodada. Confirme também que `R-0021`
-ainda está livre (`ls work/rounds`; C-0002 §2).
+Leia AGENTS.md, CODESTYLE.md, AUTHORIZATION.md da rodada; plan.md apenas adenda A1/Decisões/Concorrência/Retomada/Bloqueios; execution.json; contracts/CTG-0001.md e CTG-0002.md; compositions.json e budget.json; último reviews/prompt-review-N.json; docs/meta/agents/orchestra/README.md §§4–9, model-ladder.md; .github/pull_request_template.md. Caminhos relativos partem desta worktree. Prompts de worker contêm sua leitura fechada. Constituição e manual do papel continuam vinculantes. A1 do Owner prevalece sobre a proposta histórica de migração.

-`bash
-git -C "$(git rev-parse --show-toplevel)" fetch -q origin --prune
-git worktree list                                   # worktree /Volumes/Thiamat II/stech/detran-worktrees/stynx-canonical já existe?
-git branch -a --list '*orchestra/*'                # branches locais e remotos das frentes
-gh pr list --state all --limit 30 --search "orchestra/" # PRs abertos/mesclados por frente
-sed -n '/^## Retomada/,/^## Leitura/p' work/rounds/R-0021/plan.md   # checkpoint anterior?
-codex --help | head -40; claude --help | head -40  # ids de modelo Sol 6 / Opus 5.5
-npm view @stynx-nyx/signature@1.4.0 version        # 1.4.0 publicada
-`
+Declare papel por fase e mantenha sessões de papéis separadas: contratos/ADRs por Architect; testes por Inspector; código/instalação/Git por Engineer; observação por Auditor dedicado. Workers nunca usam Git. Você controla Git, locks, instalações, verificação, PRs, evidência e checkpoints. Nunca escreve teste como Engineer nem muda o contrato para justificar resultado errado.

-Regras: (a) worktree e branch existentes → reutilize-os, nunca recrie; (b) `plan.md` §Retomada
-preenchido → você está **retomando**: continue do checkpoint, não replaneje; (c) branch
\-`orchestra/stynx-canonical` remoto sem worktree local → `git worktree add "/Volumes/Thiamat II/stech/detran-worktrees/stynx-canonical" orchestra/stynx-canonical`; (d) PR aberto
-de outra frente com lock comum ao seu grupo → registre em `plan.md` §Concorrência e trate como
-upstream (base empilhada ou espera).
+## Bootstrap e recursos

-**Lições obrigatórias das rodadas fechadas** (R-0003…R-0016; detalhe em `waves.md` §Histórico):
-(1) crie `work/rounds/R-0021/AUTHORIZATION.md` no bootstrap, registrando que o Owner autorizou
-este prompt — sem ele `devai round close` responde `TASK_ROUND_INACTIVE`; (2) pacote de workspace
-novo ou dependência nova (`@stynx-nyx/outbox`, `@stynx-nyx/offline-sync`) exige `pnpm install` pelo
-maestro e commit do `pnpm-lock.yaml` antes do push (CI usa `--frozen-lockfile`); (3) toda edição de
\-`docs/framework/arch/parameter-catalogue.md` é seguida de `pnpm parameters:generate`, e specs nunca
-contêm chaves de parâmetro como literal (`verify:parameter-catalogue`); (4) helper `.mjs` importado por
-spec TS precisa de `.d.mts` irmão; (5) pacote novo montado no `AppModule` precisa de alias em
\-`backend/app/vitest.config.ts`; (6) workers não deixam `pnpm check` rodando em segundo plano — encerre
-processos perdidos pelo pid exato antes dos seus gates, nunca por padrão de nome; (7) `git add
-record/proofs` explícito em cada commit de evidência; (8) `audit observe` só no HEAD exato integrado;
-se outra rodada fechar antes, aceite a cadeia de `main`, observe o HEAD integrado e repita `round close`
-(o id de fechamento muda); (9) `seed.sh` faz parte do CI e a rodada dona das fixtures prova as duas
-execuções; (10) ciclos de revisão a partir do segundo restritos aos itens corrigidos; contradição entre
-contrato e código é resolvida pelo Architect por adenda numerada antes de redespachar.
\-**Lições da C-0001 (C-0002 §4):** (11) relatórios em `work/rounds/R-0021/reports/` versionados com
\-`git add -f` até R-0018 corrigir o `.gitignore`; depois de todo `git add`, compare
\-`find <dir> -type f` com `git ls-files <dir>` (R-0016: um `add` que ignora diretório não falha);
-(12) critérios de aceitação imutáveis — mudança só por adenda numerada com decisão do Owner; critério
-substituído aparece no closure como **não cumprido**; proibido repetir as trocas de R-0013/R-0014 e o
-waiver SQL2 de R-0007; (13) toda OD nova no registro canônico
\-`docs/meta/knowledge-base/open-decisions-rait.md` §C-0002 no mesmo PR; (14) testes de caracterização
-provados verdes **antes** de toda troca de implementação, e reexecutados depois; divergência é FAIL;
-(15) nenhuma integração externa real (PAdES/TSA, SENATRAN, SNE, VAPID…): só _mock_ ou porta;
-(16) `tmp/` não existe na worktree — nada de prompt pede leitura de `tmp/`. Só então rode o bootstrap:
+1. Confira status, HEAD, worktrees e PRs antes de criar qualquer outro checkout. Preserve todos os artefatos preparados. Reutilize a worktree existente. Atualize origin/main; se branch publicado, merge normal, nunca rebase/force.
+2. Confirme CLI/modelos disponíveis; ids fechados Sol `gpt-6-sol`, Terra `gpt-5.6-terra`, Luna `gpt-6-luna`; reviewer `claude-opus-5-5`. Falha de acesso não autoriza substituição silenciosa.
+3. Exportar NODE_AUTH_TOKEN a partir de gh auth token sem imprimir. doctor e evidence verify; scaffold R-0021 apenas se ainda ausente (não sobrescrever).
+4. Baseline `pnpm check` verde antes dos Inspectors. Se report/bootstrap já trouxer prova equivalente do mesmo código, validar e reutilizar; falha é triagem, não dispensa.
+5. Provisionar bancos descartáveis exclusivos `detran_r21_task2`, `detran_r21_task3`, `detran_r21_ci`, após verificar que não pertencem a sessão anterior ativa. Descobrir conexão local por tools/ci/run-backend-kernel-local.mjs e helpers backend/database/tests; nunca expor credenciais. Usar env explícito DETRAN_TEST_DATABASE_URL e variáveis derivadas coerentes (DB_NAME/DB_HOST/DB_PORT etc). O Owner autorizou resets desses bancos exclusivos. Não usar fallback database detran nem stack de outra sessão. Preparar DDL e seed canônicos em cada banco antes do primeiro e2e/integration, pelo caminho prepare-legacy existente quando aplicável; registrar comandos/exit. Workers não resetam bancos. Se não houver PostgreSQL/PostGIS disponível, usar stack descartável existente segundo runbook, com portas livres e isolamento.
+6. pnpm install, geração, gates globais e banco específico são locks exclusivos. backend:test:ci prepara/restaura/reset e roda upgrade destrutivo: nunca concorre com teste no mesmo banco. Processos iniciados têm PID registrado; encerrar apenas PID da própria rodada, nunca pkill por padrão.

-`bash
-export NODE_AUTH_TOKEN="$(gh auth token)"
-git -C "$(git rev-parse --show-toplevel)" fetch -q origin
-git status --short | wc -l            # deve ser 0
-git branch --show-current             # deve ser orchestra/stynx-canonical
-pnpm install --frozen-lockfile
-pnpm check                            # linha de base verde; se falhar, pare e reporte
-pnpm exec devai doctor --repo-root . --format human
-pnpm exec devai round plan --scaffold --round R-0021 --repo-root . --as-role architect --write --format human
-`
+## Ordem de execução

-Se a worktree ou o branch não existirem, crie-os a partir de `origin/main`:
\-`git worktree add -b orchestra/stynx-canonical "/Volumes/Thiamat II/stech/detran-worktrees/stynx-canonical" origin/main`.
+- CTG-0001: incluir contratos/inventário e os cinco docs de TASK-0001 (campanha, spec A1, ODs e plano/maestro R22) no PR, delivery-review e evidência. Executar `pnpm --filter @detran/ch-clinical-reports build` sob lock antes de TASK-0002 e repetir após pin. Validar TASK-0001, liberar TASK-0002 e TASK-0003 com prompts exatos e bancos distintos. Modelos Terra/medium. Conservar a lista de casos e logs verdes em 1.3.1. Cada relatório mapeia C-01-* para teste existente ou acrescentado; nenhum critério cumprido só por descrição.
+- CTG-0002: TASK-0015 Terra/medium cria apenas testes em tools/stynx-pin/tests/check.test.mjs. RED por CLI ausente é esperado, erro de harness não. Pode adiantar em branch/worktree isolado enquanto CI do CTG0001 roda; não contaminar candidato revisado nem commitar no branch de PR aberto. TASK0004 só começa após TASK0002/0003 verdes e TASK0015 pronto, respeitando upstream merge para abrir PR.
+- TASK-0004 Luna/medium implementa pin/gate conforme contrato; só você executa blueprints:generate sob lock (48 manifests gerados, pin somente), instala e grava lockfile ao checkpoint dependency-ready. Reexecutar a caracterização inteira sem editar seus testes. Testes do gate precisam passar incluindo negativos e descoberta de novo manifesto. Preservar todas as dependências; hipóteses de dependências mortas ficam como inventário para R22.
+- CTG-0007: TASK0014 Luna/low após merges anteriores. Fornecer lista fechada dos relatórios/reviews e PRs reais; hash do prompt alterado implica atualizar composition e revisar o delta antes de despachar. Autorizar apenas as escritas do prompt. Architect do maestro coordena outros índices caso necessário, sem delegar autoridade genérica.
+- Não criar módulo assinatura/outbox/offline, DDL outbox/notifications, store STYNX ou providers reais. Não executar TASK0005…0013. Não começar R22 nem editar ../stynx.

-**Base empilhada** (só para grupos que precisam de código de um upstream ainda não mesclado):
-num branch ainda não publicado, `git fetch origin && git rebase origin/orchestra/<upstream>` (ou
-crie a worktree já a partir desse upstream). Depois do primeiro push, nunca reescreva o histórico:
-integre novas revisões do upstream com `git merge --no-edit origin/orchestra/<upstream>`. Quando o
-upstream mesclar, integre `origin/main` pela regra do parágrafo seguinte. O PR contra `main` só abre
-depois de o upstream estar em `main`; um branch empilhado pode ser enviado
-(`git push -u origin orchestra/stynx-canonical`) sem PR para que outras frentes empilhem sobre ele.
+Usar subagentes nativos com modelo/esforço exatos e prompt integral. No máximo três workers com fronteiras disjuntas, respeitando a capacidade real. Se runtime não suportar escolha por subagente, executar os mesmos prompts via tools/orchestra/worker.sh (mesma família, autorização A1) e acompanhar retorno/JSONL; não trocar modelo nem executar você próprio testes e código de papéis distintos para economizar despacho. Nenhum worker recebe acesso de escrita fora da tarefa.

-**Avanços do `main` durante a rodada.** Outras frentes mesclam enquanto você trabalha. No início de
-cada janela, em cada checkpoint (§7) e antes de cada PR (§9): `git fetch -q origin` e
\-`git log --oneline HEAD..origin/main`; se houver commits novos, use `git rebase origin/main` somente
-se o branch nunca foi publicado. Caso contrário, use `git merge --no-edit origin/main`. Nunca use
\-`--force`, `--force-with-lease` ou equivalente. Depois da integração, rode de novo os gates do
-grupo. Ao resolver conflitos: arquivo **gerado** (`backend/domains/**/src/generated`,
-contratos `*.openapi.json` gerados, `ddl/*.sql` de blueprint) → nunca edite à mão, aceite qualquer
-lado, formate o blueprint com prettier e `pnpm blueprints:generate` + `pnpm contracts:openapi`;
\-`record/proofs/chain.json` ou `record/proofs/work/generic/*.jsonl` → aceite a versão de `main` e
-rode `devai evidence record` de novo para os seus commits (a cadeia nunca é mesclada à mão);
\-`policy.ts`/`roles.ts` → mantenha os dois blocos, rode `pnpm --filter @detran/shared test`;
\-`pnpm-lock.yaml` → aceite `main` e `pnpm install --frozen-lockfile`, ou `pnpm install` num commit
\-`chore(deps)` próprio. Antes de criar um DDL novo (`outbox.*`, CTG-0004), confira o número livre com
\-`ls backend/database/ddl`; antes de criar uma ADR, confira o próximo número em
\-`docs/meta/adr/README.md` (R-0018 racionaliza o índice). Se o rebase invalidar um veredito `PASS` do
-reviewer (diff mudou de forma substantiva), peça nova `delivery-review`.
+## Gates e revisão

-## 2. Leitura obrigatória (Architect) — nesta ordem, uma vez
+Worker executa comandos focais; você verifica relatório, diff e comandos de aceitação. Ao fim de cada CTG ativo: pnpm check e pnpm backend:test:ci em banco próprio. No candidato final: pnpm build, backend:rls-smoke, verify:rls-ddl, verify:decorators, verify:role-catalog, blueprints:check, contracts:check, docs:kb:check, docs:kb:publish-check, stack:smoke em stack isolada. Gate já incluído em pnpm check não precisa ser repetido se mesma árvore e ambiente. Preservar logs, exit codes, SHA/tree, tempos e banco. Sem pnpm check em background no worker.

-1. `AGENTS.md`, `CODESTYLE.md`, `docs/meta/agents/README.md`
-2. `docs/meta/agents/orchestra/README.md`, `model-ladder.md`, `waves.md`
-3. `work/campaigns/C-0002-consolidacao.md` inteiro; `work/campaigns/C-0002-stynx-upstream-spec.md`

- inteiro (§6.11–§6.13 e §8 são desta rodada); depois o "mapa entregável → definições" do `plan.md`:
- `docs/meta/adr/ADR-0018-documents-and-signature-substrate.md`,
- `ADR-0016-infraction-and-notification-boundary.md`, `ADR-0006-ops-field-operations-port.md`,
- `ADR-0015-stynx-1-3-1-angular-22-and-rait-role-catalogue.md`, `ADR-0005-unified-backend-kernel.md`,
- `docs/framework/arch/wp0-stynx-1-3-1-migration.md`, R-0010 `contracts/CTG-0002.md` (C-2-19…C-2-23)
  -4. `docs/framework/arch/parameter-catalogue.md`, `docs/meta/knowledge-base/decision-closure-plan.md`,
- `docs/meta/knowledge-base/steering.md` §H (decisões do Owner já tomadas: não reabra nenhuma)
  -5. Os manuais de papel que usará: `docs/meta/agents/{architect-blueprint,engineer-backend,inspector-tests,transcriber-docs}.md`
  -6. `work/rounds/R-0021/plan.md` (metas, inventário por módulo e critérios já extraídos para esta frente)
  -7. API STYNX 1.4.0, **somente leitura**: `.d.ts` extraídos com
- `npm pack @stynx-nyx/{signature,outbox,offline-sync,notifications}@1.4.0 --pack-destination <scratch>`
- (nunca instalar fora dos CTGs; nunca editar `node_modules`)
  +Falha → classificar plant-bug/sensor-error/policy-issue/reference-gap, reprodução focal e dono. Uma nova tentativa no mesmo nível; depois escalar mesma família. Não alterar teste para fazê-lo passar. Mudança de contrato exige adenda Architect antes do redisparo. Regressão após pin é do Engineer. Se baseline violar segurança, não afrouxar caracterização.

-Anote em `plan.md` §Leitura o hash (`git rev-parse HEAD`) e a lista do que leu. Não leia além
-disso; o que faltar, os workers leem com listas fechadas.
+Reviewer sempre Opus 5.5 via tools/orchestra/bridge.sh, somente leitura. Prompt-review PASS já entregue; delivery-review por CTG inclui contrato, diff completo BASE…HEAD mais alterações não commitadas, arquivos novos, relatórios e gates. Até **4 ciclos totais/item**. Primeiro exaustivo; seguintes só achados corrigidos. Novos FAILs canônicos devem justificar aparecimento. PASS é obrigatório. JSON inválido/erro CLI não é veredito. Não chamar FAIL de REVIEW. Registrar tentativa/modelo/tokens no budget e preservar todos os resultados.

-## 3. Plano de decomposição (Architect) → `work/rounds/R-0021/plan.md` + `tasks/`
+## Git, evidência e CI

-Para cada entregável escreva **tarefas** no esquema DEVAI
-(`docs/meta/agents/orchestra/task.template.json`, `tasks/TASK-nnnn.json`), obedecendo:
+Um PR por CTG ativo (0001,0002,0007), mais PR final de governança se necessário. Antes de cada candidato, integrar main sem force; resolver provas aceitando cadeia main e reemitindo pelos verbos, nunca hash/manual merge. Gerados são regenerados. Você é único usuário de Git; add somente caminhos da tarefa e proofs explícitos; comparar arquivos de reports existentes versus versionados. Commits Conventional Commits com fontes ADR/OD e atribuição Codex/modelo real. Não commitar tokens, env privado ou tarballs.

-- **Tríade por módulo**: `TASK` Architect (contrato, DDL, guardas, critérios)

- → `TASK` Inspector (testes que codificam os critérios; caracterização primeiro) → `TASK` Engineer
- (implementação até os testes passarem); mesmo `coupled_task_group`, `upstream_task_id` encadeado.
- Transcrição (ADR, emendas, adenda da spec) é tarefa simples de `transcriber-docs`.
  -- **`target_modules`** com os locks do `plan.md` (`MOD-r21-contracts`, `MOD-deps-stynx-pin`,
- `MOD-app-module`, `MOD-ddl-outbox`, `MOD-ops-offline-sync`…); duas tarefas com o mesmo lock nunca
- correm juntas.
  -- **`acceptance_commands`** só com comandos que existem em `package.json` ou arquivos verificáveis;
- `verify:stynx-pin` é entregável de TASK-0004. Nunca herde comando inexistente
- (ver `orchestra/README.md` §9).
  -- **Modelo e esforço** por `model-ladder.md` (família Codex); anote no `executor`.
  -- Ordem topológica e paralelismo possível (no máximo três tarefas por vez).
  +Registrar evidência por CTG: input com ação/commits/artefatos SHA256/gates; `pnpm exec devai evidence record --kind generic --round R-0021 --repo-root . --as-role engineer --input <input> --write --format human`, depois evidence verify. Gravar provas e commit separado. Abrir PR com template e body-file, acompanhar todos os required checks, nunca merge antes de PASS e CI verde. Reexecutar apenas falhas infra quando apropriado; falha código volta ao dono. Atachar PR ao chat se ferramenta disponível; incluir URLs no relatório para o preparador anexar caso CLI não tenha ferramenta.

-`plan.md` já traz metas, inventário, tabela de tarefas (TASK-0001…0014), critérios, mapa, riscos e
-ODs; ajuste só por adenda numerada. Mantenha §Bloqueios, §Retomada e §Leitura.
+Esta base usa verified-local-rc/exact-tree. Ler os scripts existentes tools/ci/prepare-local-rc.mjs, run-backend-kernel-local.mjs, publish-local-rc.mjs e ADR0028 antes de produzir a atestação; não substituir pipeline por um comando focal nem publicar evidência de outra árvore. Reusar resultados somente quando o mecanismo existente verificar a vinculação correta.

-## 4. Prompts dos workers (Architect) → `prompts/TASK-nnnn.md`
+Merge normal (`gh pr merge --merge`); depois obter SHA40 exato. Sessão Auditor dedicada executa `devai audit observe` nesse SHA, sem avaliar/corrigir sua própria produção. Provas geradas apenas pelo runtime. Guardar id e head. Não misturar próximas tarefas no branch de PR aberto.

-Componha cada prompt a partir de `docs/meta/agents/orchestra/worker-prompt.template.md`
-(variante do papel), preenchendo **todas** as seções: papel, contexto da frente, leitura
-obrigatória fechada (caminhos exatos), pode/não pode tocar (diretórios exatos), tarefa (o quê),
-critérios de aceitação (comandos + resultado), proibições, entrega (formato fixo). Regras:
+## Fechamento aprovado sem selo

-- O prompt tem de bastar: o worker não conhece esta conversa nem o resto do repositório.
-- Transfira para o prompt os trechos de definição que o worker precisa (assinaturas dos `.d.ts`

- STYNX 1.4.0, campos do recibo `ClinicalArtifactReceipt`, colunas de `integration.outbox`, rotas de
- offline-sync, códigos `RAIT.SIGNATURE_*`), em vez de mandar procurar.
  -- Nada de valor inventado: onde a definição não fixa um valor, o prompt manda usar
- `source_pending` ou abrir `OD-*`.
  -- **Fail-closed de assinatura** vai literal em TASK-0005/0006/0007: sem backend configurado →
- erro; _mock_ nunca em `staging-like`/`production`; nenhuma resposta "assinado" sem evidência.
  -- Calcule `prompt_composition_id` = `PC-` + 16 hex do sha256 do prompt final e grave em
- `compositions.json` (`{task_id, prompt_path, sha256, pc_id, model, effort}`).
  +Depois de CTGs ativos mesclados, produzir closure.json conforme schema/runtime real. Decisões D-* devem existir e referenciar AUTHORIZATION A1. `round close` aloca PC-nnnn: não escolher id por palpite. Critérios históricos das migrações transferidas são **fail**, explicando Owner A1/OD e R22, nunca PASS/N/A. Gates do escopo ativo devem estar verdes. Notificações é disposição de escopo documentada, não módulo entregue.

-## 5. Revisão dos prompts (reviewer, outra família)
+Executar `pnpm exec devai round close --round R-0021 --repo-root . --input work/rounds/R-0021/closure.json --as-role architect --write --format human`, verificar cadeia e publicar fechamento em PR com checks verdes. A autorização final do Owner é fechar **sem selo**. O DEVAI1.5.6 em assertClosePreconditions rejeita qualquer validation_criteria fail (ROUND_ARCHIVE_VALIDATION_NOT_GREEN); não fabricar record.md nem enfraquecer gate para selar. Não reivindicar seal. Registrar limitação e recibo close real. Não há necessidade de nova pergunta ao Owner sobre isso.

-Monte `reviews/prompt-review-<n>.md` com `docs/meta/agents/orchestra/reviewer-prompt.template.md`
-em modo `prompt-review`, anexando `plan.md` e todos os `prompts/*.md`. Invoque:
+Atualizar plan/retomada, índice/waves/backlog com resultado verdadeiro; evitar commits que criem ciclo infinito de observação do próprio recibo. Integrar provas finais por PR; nenhum push main. Excluir somente branches remotos já mesclados e pertencentes à rodada; preservar worktrees em uso.

-`bash
-tools/orchestra/bridge.sh claude <id-opus-5.5> work/rounds/R-0021/reviews/prompt-review-1.md work/rounds/R-0021/reviews/prompt-review-1.json "/Volumes/Thiamat II/stech/detran-worktrees/stynx-canonical"
-`
+## Orçamento, parada e comunicação

-Leia o veredito. `REVIEW` → corrija os prompts apontados e repita (máximo 2 ciclos). `FAIL` ou
-terceiro ciclo → pare, registre em `plan.md` §Bloqueios e reporte ao humano. Só dispare workers
-com `PASS`.
+budget.json: teto 2.250.000 tokens entrada/janela, checkpoint preventivo1.800.000; janela5h e até8tarefas originalmente previstas (escopo reduzido cabe). Registrar estimativas únicas e bruto quando disponível por worker/review. Não gastar teto por obrigação. Antes de esgotar, persistir estado recuperável e relatório; nunca declarar conclusão incompleta.

-## 6. Disparo dos workers (mesma família)
+Atualizar plan Retomada por CTG com tarefas/status, modelos, PR/CI, último veredito, processos vivos, base/HEAD e próximos comandos. Parar só por bloqueio externo real, FAIL/escalada irredutível ou limite autorizado; entregar todos grupos livres antes. Comunicar achados/andamento ao preparador em stdout e final; não enviar mensagens externas.

-Para cada tarefa pronta (dependências concluídas, lock livre): dispare um subagente da sua CLI
-com o conteúdo de `prompts/TASK-nnnn.md`, modelo e esforço do `executor`, worktree
\-`/Volumes/Thiamat II/stech/detran-worktrees/stynx-canonical`. Se a sua CLI não tiver subagentes,
-execute você mesmo a tarefa **como se fosse o worker**, obedecendo estritamente ao prompt daquela
-tarefa (fronteira de escrita inclusive). Marque `status=in_progress` na tarefa; ao receber o
-relatório, grave-o em `reports/TASK-nnnn.md`.
-

-## 7. Checkpoint por tarefa (Engineer) — hard gates
-

-Rode os `acceptance_commands` da tarefa e, ao fim de cada grupo acoplado, `pnpm check` e
\-`pnpm backend:test:ci`. Nos CTG-0003…0005, também `pnpm backend:rls-smoke` e `pnpm verify:rls-ddl`.
-Falha → triagem em uma linha (`plant-bug | sensor-error | policy-issue | reference-gap`) em `plan.md`
-§Triagem → 1 nova tentativa com o achado no prompt → se falhar, nível acima da mesma família → se
-falhar, `escalated`. Nunca ajuste um teste para passar; nunca edite arquivo gerado. Teste de
-caracterização vermelho depois da troca é regressão do Engineer, nunca do teste.
-

-## 8. Revisão da entrega (reviewer, outra família)
-

-Para cada grupo acoplado concluído: `git diff --stat` + diff completo + relatórios + critérios em
\-`reviews/delivery-review-<ctg>.md` (modo `delivery-review`) → ponte → veredito. `PASS` libera o
-commit; `REVIEW` volta ao worker responsável (máximo 2 ciclos); `FAIL` → `escalated`. Achado de
-fail-open de assinatura ou de vazamento entre tenants não tem via de dispensa.
-

-## 9. Commit, evidência, PR, merge, fechamento (Engineer; Architect no fechamento)
-

-1. `git add` só dos caminhos das tarefas; commit por `CODESTYLE.md` (`<type>(<scope>): …`,

- corpo com ADR/OD citados, trailer de atribuição da sessão).
  -2. Evidência: escreva `evidence-<ctg>.json` (ação, commits, artefatos com sha256, gates) e rode
- `pnpm exec devai evidence record --kind generic --round R-0021 --repo-root . --as-role engineer --input <arquivo> --write --format human`;
- depois `evidence verify`. Commit "chore(devai): …".
  -3. Confirme que todo upstream do grupo está em `main` e rebaseie (`git rebase origin/main`;
- somente se o branch nunca foi publicado); em branch publicado, use
- `git merge --no-edit origin/main`. Rode novamente os gates, faça somente push normal com
- `git push -u origin orchestra/stynx-canonical` e então `gh pr create --base main` com o corpo pelo
- `.github/pull_request_template.md` (papel, ação e fontes, o que muda, verificação, OD tocadas,
- fora de escopo, linha final de atribuição).
  -4. Acompanhe o CI (`gh pr checks <n>`); falha de infraestrutura (pull do Docker, registro) →
- `gh run rerun <id> --failed`; falha de código → volte ao §7 na tarefa certa.
  -5. **Merge** somente com CI verde **e** `PASS` do reviewer na última entrega:
- `gh pr merge <n> --merge`. Depois: `git fetch`, sha do merge, e
- `pnpm exec devai audit observe --repo-root . --at <sha-40> --round R-0021 --as-role auditor --write --format human`.
  -6. Fechamento (DEVAI 1.5.6): `closure.json` (esquema `phase-closure`: `id`, `round_id`,
- `declaring_decision`, `closing_decision`, `batches`, `gates`, `validation_criteria`, `closed_at`,
- `merged_as`; critério não cumprido aparece como tal) e
- `pnpm exec devai round close --round R-0021 --repo-root . --input work/rounds/R-0021/closure.json --as-role architect --write --format human`;
- em seguida `pnpm exec devai round seal --round R-0021 --repo-root . --as-role architect --write --format human`
- (sintaxe conferida com `pnpm exec devai round seal --help`); nenhuma prova sem âncora na cadeia.
  -7. Atualize `docs/meta/agents/orchestra/waves.md` §Histórico (linha da rodada) e
- `docs/meta/knowledge-base/backlog.md`; commit final; apague o branch remoto após o merge.
-

-**Condições de parada** (grave `checkpoint` em `plan.md` §Retomada: tarefas concluídas, em curso,
-pendentes; último veredito; próximos passos): orçamento da janela esgotado; bloqueio por decisão
\-`OD-*` não coberta pelo steering §H (OD-R21-01…03 sem resposta bloqueiam só o CTG correspondente);
-todos os grupos livres concluídos e os restantes presos a upstream não mesclado; reviewer
\-`FAIL` após escalada. Um novo maestro retoma pelo mesmo prompt e pelo `plan.md`.
-

-## 10. Relatório final (última mensagem da sessão)
-

-Papel declarado; frente e rodada; PRs (número, estado); tarefas (id, papel, modelo, resultado);
-ciclos de REVIEW e escaladas; gates executados com saída resumida; evidência (sequência e head da
-cadeia); OD tocadas; lacunas levadas à spec upstream (ids UPS e adendas); o que ficou fora e por quê;
-consumo estimado (`budget.json`); ajustes que recomenda ao método (`orchestra/README.md`,
\-`model-ladder.md`).
+Relatório final em `reports/ORCHESTRATOR-FINAL.md`: papel, escopo, PRs/URLs/estados, tarefas/modelos/resultados, reviews/escaladas, gates, prova/head/PC do fechamento, ODs e UPS, transferências com critérios fail, ausência de selo, orçamento, pendências reais. Retornar resumo autossuficiente. Continue até essa conclusão, não pare após implementar código ou abrir PR.
diff --git a/work/rounds/R-0021/prompts/TASK-0001.md b/work/rounds/R-0021/prompts/TASK-0001.md
new file mode 100644
index 00000000..4b77f726
--- /dev/null
+++ b/work/rounds/R-0021/prompts/TASK-0001.md
@@ -0,0 +1,52 @@
+# Worker TASK-0001 — Consolidar inventário, contratos e requisitos upstream +
+Papel: Architect. Perfil: `architect-blueprint`. Modelo exato `gpt-6-astra`, esforço `high`. +
+## Contexto e entrada +
+R-0021, CTG `CTG-0001`, worktree `/Users/aarusso/.codex/worktrees/stynx-canonical/detran`. Uma tarefa, um papel, um relatório. O Owner aprovou apenas caracterização, pin 1.4.0 e handoff; assinatura/outbox/offline migrarão em R-0022. Notificações aguardam produtor. Nunca leia a conversa ou presuma trabalho de outra sessão. +
+Antes de escrever, conferir contrato e insumos listados; ausente/incompatível vira bloqueio no relatório. A leitura fechada abaixo substitui leituras genéricas não pertinentes dos manuais. Não explore diretórios além dela; peça uma ampliação concreta se indispensável. +
+## Leitura obrigatória fechada +
+- `AGENTS.md`
+- `CODESTYLE.md`
+- `docs/meta/agents/architect-blueprint.md`
+- `work/rounds/R-0021/AUTHORIZATION.md`
+- `work/rounds/R-0021/contracts/CTG-0001.md`
+- `work/rounds/R-0021/contracts/CTG-0002.md` +
+## Pode tocar +
+- `work/rounds/R-0021/contracts/**`
+- `work/rounds/R-0021/inputs/published-api-*`
+- `work/rounds/R-0021/reports/TASK-0001.md` +
+- `work/campaigns/C-0002-stynx-upstream-spec.md`
+- `docs/meta/knowledge-base/open-decisions-rait.md`
+- `work/campaigns/C-0002-consolidacao.md`
+- `work/rounds/R-0022/plan.md`
+- `work/rounds/R-0022/prompts/00-maestro.md` +
+## Não pode tocar +
+Tudo fora da lista acima. Em particular Git (inclusive status/add/stash), instalações, lockfile, testes de outro worker, specs existentes não autorizadas, produto, DDL, `.devai/`, `record/`, repositórios irmãos e arquivos gerados à mão. O maestro é único escritor do Git e pnpm-lock.yaml. +
+## Tarefa e definições vinculantes +
+Preparada pelo Astra, não redisparar como implementação. Validar inventário, contratos e relatório existentes. Nenhuma migração está autorizada nesta tarefa. A aceitação final pertence ao maestro e ao reviewer do CTG-0001. +
+O contrato CTG-0001 contém as definições e critérios atuais e CTG-0002 fixa a interface do verificador; não reinterpretá-los. Sem valor canônico, registrar `source_pending` ou OD no relatório. Fail-closed de assinatura: sem backend configurado → erro; mock nunca em staging-like/production; nenhuma resposta assinado sem evidência. Nunca introduzir provider externo real, prazo, papel ou estado novo. +
+## Critérios e comandos +
+- `pnpm format:check` → exit 0, testes encontrados e sem falhas/skip. +
+Para Inspector TASK-0015, a fase RED de implementação ausente é a única exceção ao resultado verde nesta entrega; registrar separadamente, sem declarar PASS do verificador. Para TASK-0002/0003 toda caracterização deve estar verde sobre a baseline antes do pin. O maestro executa gates globais e conserva logs. Workers não iniciam/resetam bancos nem processos de longa duração; utilizam somente env e banco exclusivos entregues pelo maestro. Não executar gates que escrevem a mesma árvore ou banco em paralelo. +
+Formatar apenas arquivos próprios com prettier antes de entregar (relatório não reformatar). Nenhum teste enfraquecido, nenhum gerado editado, nenhuma constante normativa inventada. Se um critério exige ferramenta/arquivo ausente, relatar em vez de substituí-lo. +
+## Entrega +
+Retornar Markdown: Papel; Tarefa; arquivos criados/alterados; comandos e exit codes; matriz critério→arquivo/teste→PASS/FAIL/RED; fora do escopo; ODs; bloqueios; próximo passo exato. Informar duração e estimativa de tokens se disponível. O maestro salva o retorno em reports/ e preserva a saída verbatim.
diff --git a/work/rounds/R-0021/prompts/TASK-0002.md b/work/rounds/R-0021/prompts/TASK-0002.md
new file mode 100644
index 00000000..e147fbf0
--- /dev/null
+++ b/work/rounds/R-0021/prompts/TASK-0002.md
@@ -0,0 +1,107 @@
+# Worker TASK-0002 — Caracterizar assinatura, confiança e RENACH +
+Papel: Inspector. Perfil: `inspector-tests`. Modelo exato `gpt-5.6-terra`, esforço `medium`. +
+## Contexto e entrada +
+R-0021, CTG `CTG-0001`, worktree `/Users/aarusso/.codex/worktrees/stynx-canonical/detran`. Uma tarefa, um papel, um relatório. O Owner aprovou apenas caracterização, pin 1.4.0 e handoff; assinatura/outbox/offline migrarão em R-0022. Notificações aguardam produtor. Nunca leia a conversa ou presuma trabalho de outra sessão. +
+Antes de escrever, conferir contrato e insumos listados; ausente/incompatível vira bloqueio no relatório. A leitura fechada abaixo substitui leituras genéricas não pertinentes dos manuais. Não explore diretórios além dela; peça uma ampliação concreta se indispensável. +
+## Leitura obrigatória fechada +
+- `AGENTS.md`
+- `CODESTYLE.md`
+- `backend/app/src/app.module.ts`
+- `backend/app/src/detran-clinical-trust.ts`
+- `backend/app/src/detran-runtime.ts`
+- `backend/app/src/pec-renach-transmission.controller.ts`
+- `backend/app/src/pec-renach-transmission.service.ts`
+- `backend/app/src/pec-renach-transmission.spec.ts`
+- `backend/app/src/renach-webhook.guard.spec.ts`
+- `backend/app/src/renach-webhook.guard.ts`
+- `backend/app/tests/e2e/runtime-profiles.e2e.spec.ts`
+- `backend/app/tests/integration/pec-pipeline-persistence.integration.spec.ts`
+- `backend/database/ddl/04-integration-storage.sql`
+- `backend/database/ddl/20-rls-policies.sql`
+- `backend/domains/ch/clinical-reports/src/pades-signing.http-adapter.ts`
+- `backend/domains/ch/clinical-reports/tests/unit/candidate-dossier.service.spec.ts`
+- `backend/domains/ch/clinical-reports/tests/unit/encounter-closure.service.spec.ts`
+- `backend/domains/ch/clinical-reports/tests/unit/pades-signing.http-adapter.spec.ts`
+- `backend/domains/ch/clinical-reports/tests/unit/report-lifecycle.service.spec.ts`
+- `backend/domains/ch/juntas/src/junta-signing.adapter.ts`
+- `backend/domains/shared/src/documents/document-kind.ts`
+- `backend/domains/shared/src/documents/document-trust-batch-capability.spec.ts`
+- `backend/domains/shared/src/documents/document-trust-batch.spec.ts`
+- `backend/domains/shared/src/documents/document-trust-session-minutes.spec.ts`
+- `backend/domains/shared/src/documents/document-trust-worklist.spec.ts`
+- `backend/domains/shared/src/documents/document-trust.http-adapter.ts`
+- `backend/domains/shared/src/documents/document-trust.spec.ts`
+- `backend/domains/shared/src/documents/document-trust.ts`
+- `backend/domains/shared/src/documents/documents-facade.ts`
+- `backend/domains/shared/src/documents/documents.spec.ts`
+- `backend/domains/shared/src/documents/index.ts`
+- `backend/domains/shared/src/documents/signature-policy.ts`
+- `docs/framework/arch/rait-error-catalog.md`
+- `docs/framework/arch/rait-fixtures.md`
+- `docs/meta/agents/inspector-tests.md`
+- `work/rounds/R-0021/AUTHORIZATION.md`
+- `work/rounds/R-0021/contracts/CTG-0001.md`
+- `work/rounds/R-0021/contracts/CTG-0002.md`
+- `backend/app/package.json`
+- `backend/app/vitest.config.ts`
+- `backend/domains/shared/package.json`
+- `backend/domains/shared/vitest.config.ts`
+- `backend/domains/ops/offline-sync/package.json`
+- `backend/domains/ops/offline-sync/vitest.config.ts`
+- `backend/database/tests/run-backend-ci.mjs`
+- `docs/framework/arch/rait-test-strategy.md` +
+- `backend/app/tests/e2e/rait-case-commands.e2e.spec.ts`
+- `backend/domains/ch/clinical-reports/src/report-lifecycle.service.ts`
+- `backend/domains/ch/clinical-reports/src/encounter-closure.service.ts`
+- `backend/domains/ch/clinical-reports/package.json`
+- `backend/domains/ch/clinical-reports/vitest.config.ts`
+- `backend/domains/ch/juntas/package.json`
+- `backend/domains/ch/juntas/vitest.config.ts` +
+## Pode tocar +
+- `backend/domains/ch/clinical-reports/tests/unit/r21-signature-characterization.spec.ts`
+- `backend/domains/shared/src/documents/r21-document-trust-characterization.spec.ts`
+- `backend/app/src/r21-renach-characterization.spec.ts`
+- `backend/app/tests/e2e/r21-trust-profiles.e2e.spec.ts` +
+- `backend/app/tests/integration/r21-renach-characterization.integration.spec.ts` +
+## Não pode tocar +
+Tudo fora da lista acima. Em particular Git (inclusive status/add/stash), instalações, lockfile, testes de outro worker, specs existentes não autorizadas, produto, DDL, `.devai/`, `record/`, repositórios irmãos e arquivos gerados à mão. O maestro é único escritor do Git e pnpm-lock.yaml. +
+## Pré-requisito do maestro +
+Antes desta tarefa, maestro executa `pnpm --filter @detran/ch-clinical-reports build` sob lock (juntas exige dist). Repetir antes da prova pós-pin. Não ampliar aliases nem mudar testes para resolver esse import. +
+## Tarefa e definições vinculantes +
+Codificar C-01-01…10 do contrato usando as suítes existentes como evidência e acrescentando apenas cobertura ausente nos cinco arquivos permitidos. Provar comportamento atual sobre 1.3.1: recibo/evidência válido e inválido, hash divergente, backend ausente fail-closed, capacidades, HTTPS e perfis restritos; manifesto/document trust; RENACH claim, retomada após 15 minutos, ACK/erro, inbox idempotente, delivery_attempt e renach_acked. Cada critério aponta spec e nome do teste, inclusive quando preexistente. Usar relógio e provedores mock, nunca integração externa. Não implementar a fachada STYNX nem mover adapters. Se código atual contradisser requisito de segurança, registrar reprodução e bloquear o critério, não relaxar teste nem corrigir produção. O teste de perfis deve usar o comportamento atual de R-0017 (serviços clínicos desligados e fail-closed na stack quando assim configurados), sem supor que mock de assinatura está montado. HTTP real quando o critério é de rota; não substituir por chamada direta de controller. +
+O contrato CTG-0001 contém as definições e critérios atuais e CTG-0002 fixa a interface do verificador; não reinterpretá-los. Sem valor canônico, registrar `source_pending` ou OD no relatório. Fail-closed de assinatura: sem backend configurado → erro; mock nunca em staging-like/production; nenhuma resposta assinado sem evidência. Nunca introduzir provider externo real, prazo, papel ou estado novo. +
+## Critérios e comandos +
+- `pnpm --filter @detran/ch-clinical-reports test:unit --passWithNoTests=false` → exit 0, testes coletados, sem falhas/skip.
+- `pnpm --filter @detran/shared run test --passWithNoTests=false` → exit 0, testes coletados, sem falhas/skip.
+- `pnpm --filter @detran/ch-juntas run test --passWithNoTests=false` → exit 0, testes coletados, sem falhas/skip.
+- `pnpm --filter @detran/app test:unit --passWithNoTests=false src/pec-renach-transmission.spec.ts src/r21-renach-characterization.spec.ts` → exit 0, testes coletados, sem falhas/skip.
+- `pnpm --filter @detran/app test:e2e --passWithNoTests=false tests/e2e/runtime-profiles.e2e.spec.ts tests/e2e/r21-trust-profiles.e2e.spec.ts tests/e2e/rait-case-commands.e2e.spec.ts` → exit 0, testes coletados, sem falhas/skip.
+- `pnpm --filter @detran/app test:integration --passWithNoTests=false tests/integration/pec-pipeline-persistence.integration.spec.ts tests/integration/r21-renach-characterization.integration.spec.ts` → exit 0, testes coletados, sem falhas/skip.
+- `pnpm typecheck` → exit 0. +
+Para Inspector TASK-0015, a fase RED de implementação ausente é a única exceção ao resultado verde nesta entrega; registrar separadamente, sem declarar PASS do verificador. Para TASK-0002/0003 toda caracterização deve estar verde sobre a baseline antes do pin. O maestro executa gates globais e conserva logs. Workers não iniciam/resetam bancos nem processos de longa duração; utilizam somente env e banco exclusivos entregues pelo maestro. Não executar gates que escrevem a mesma árvore ou banco em paralelo. +
+Formatar apenas arquivos próprios com prettier antes de entregar (relatório não reformatar). Nenhum teste enfraquecido, nenhum gerado editado, nenhuma constante normativa inventada. Se um critério exige ferramenta/arquivo ausente, relatar em vez de substituí-lo. +
+## Entrega +
+Retornar Markdown: Papel; Tarefa; arquivos criados/alterados; comandos e exit codes; matriz critério→arquivo/teste→PASS/FAIL/RED; fora do escopo; ODs; bloqueios; próximo passo exato. Informar duração e estimativa de tokens se disponível. O maestro salva o retorno em reports/ e preserva a saída verbatim.
diff --git a/work/rounds/R-0021/prompts/TASK-0003.md b/work/rounds/R-0021/prompts/TASK-0003.md
new file mode 100644
index 00000000..e26d7324
--- /dev/null
+++ b/work/rounds/R-0021/prompts/TASK-0003.md
@@ -0,0 +1,98 @@
+# Worker TASK-0003 — Caracterizar HTTP, transações e RLS offline +
+Papel: Inspector. Perfil: `inspector-tests`. Modelo exato `gpt-5.6-terra`, esforço `medium`. +
+## Contexto e entrada +
+R-0021, CTG `CTG-0001`, worktree `/Users/aarusso/.codex/worktrees/stynx-canonical/detran`. Uma tarefa, um papel, um relatório. O Owner aprovou apenas caracterização, pin 1.4.0 e handoff; assinatura/outbox/offline migrarão em R-0022. Notificações aguardam produtor. Nunca leia a conversa ou presuma trabalho de outra sessão. +
+Antes de escrever, conferir contrato e insumos listados; ausente/incompatível vira bloqueio no relatório. A leitura fechada abaixo substitui leituras genéricas não pertinentes dos manuais. Não explore diretórios além dela; peça uma ampliação concreta se indispensável. +
+## Leitura obrigatória fechada +
+- `AGENTS.md`
+- `CODESTYLE.md`
+- `backend/app/src/app.module.ts`
+- `backend/app/src/detran-runtime.ts`
+- `backend/app/src/teat-sync.providers.ts`
+- `backend/app/tests/e2e/boat-crash-commands.e2e.spec.ts`
+- `backend/app/tests/e2e/teat-field-sync.e2e.spec.ts`
+- `backend/database/ddl/18-ops-offline-sync.sql`
+- `backend/database/ddl/20-rls-policies.sql`
+- `backend/database/seed/26-fixtures-teat-field.sql`
+- `backend/domains/ops/core/src/applied-entity.ts`
+- `backend/domains/ops/core/src/index.ts`
+- `backend/domains/ops/core/src/runtime.ts`
+- `backend/domains/ops/core/src/storage.ts`
+- `backend/domains/ops/core/src/sync-applier.ts`
+- `backend/domains/ops/core/src/sync-conflict.port.ts`
+- `backend/domains/ops/offline-sync/src/handwritten/batch-protocol.ts`
+- `backend/domains/ops/offline-sync/src/handwritten/canonical-hash.ts`
+- `backend/domains/ops/offline-sync/src/handwritten/concurrency-detector.ts`
+- `backend/domains/ops/offline-sync/src/handwritten/events.schema.spec.ts`
+- `backend/domains/ops/offline-sync/src/handwritten/events.ts`
+- `backend/domains/ops/offline-sync/src/handwritten/numbering-sql.ts`
+- `backend/domains/ops/offline-sync/src/handwritten/offline-sync.commands.ts`
+- `backend/domains/ops/offline-sync/src/handwritten/offline-sync.controller.ts`
+- `backend/domains/ops/offline-sync/src/handwritten/offline-sync.provider.ts`
+- `backend/domains/ops/offline-sync/src/handwritten/offline-sync.reads.ts`
+- `backend/domains/ops/offline-sync/src/handwritten/reconcile-numbering.command.ts`
+- `backend/domains/ops/offline-sync/src/handwritten/reserve-numbering.command.ts`
+- `backend/domains/ops/offline-sync/src/handwritten/resolve-conflict.command.ts`
+- `backend/domains/ops/offline-sync/src/handwritten/settle-numbering.command.ts`
+- `backend/domains/ops/offline-sync/src/handwritten/submit-batch.command.ts`
+- `backend/domains/ops/offline-sync/src/handwritten/submit-batch.spec.ts`
+- `backend/domains/ops/offline-sync/tests/integration/concurrency-window.integration.spec.ts`
+- `backend/domains/ops/offline-sync/tests/integration/harness.ts`
+- `backend/domains/ops/offline-sync/tests/integration/numbering.integration.spec.ts`
+- `backend/domains/ops/offline-sync/tests/integration/resolve-conflict.integration.spec.ts`
+- `backend/domains/ops/offline-sync/tests/integration/sync-batch.integration.spec.ts`
+- `backend/domains/shared/src/decorators.ts`
+- `backend/domains/shared/src/policy.ts`
+- `backend/domains/shared/src/roles.ts`
+- `docs/framework/arch/parameter-catalogue.md`
+- `docs/framework/arch/rait-fixtures.md`
+- `docs/framework/schemas/teat-offline-sync-batch.schema.json`
+- `docs/meta/adr/ADR-0036-ops-field-operations-port.md`
+- `docs/meta/agents/inspector-tests.md`
+- `work/rounds/R-0021/AUTHORIZATION.md`
+- `work/rounds/R-0021/contracts/CTG-0001.md`
+- `work/rounds/R-0021/contracts/CTG-0002.md`
+- `backend/app/package.json`
+- `backend/app/vitest.config.ts`
+- `backend/domains/shared/package.json`
+- `backend/domains/shared/vitest.config.ts`
+- `backend/domains/ops/offline-sync/package.json`
+- `backend/domains/ops/offline-sync/vitest.config.ts`
+- `backend/database/tests/run-backend-ci.mjs`
+- `docs/framework/arch/rait-test-strategy.md` +
+## Pode tocar +
+- `backend/app/tests/e2e/r21-offline-sync.e2e.spec.ts`
+- `backend/domains/ops/offline-sync/tests/integration/r21-offline-characterization.integration.spec.ts` +
+## Não pode tocar +
+Tudo fora da lista acima. Em particular Git (inclusive status/add/stash), instalações, lockfile, testes de outro worker, specs existentes não autorizadas, produto, DDL, `.devai/`, `record/`, repositórios irmãos e arquivos gerados à mão. O maestro é único escritor do Git e pnpm-lock.yaml. +
+## Tarefa e definições vinculantes +
+Codificar C-01-20…30 do contrato, completando a cobertura atual de TEAT/BOAT sem duplicar provas já existentes. Usar harness Nest real do app no novo e2e e harness SQL existente no novo integration. Cobrir envelopes/status exatos, lote legado e idempotência, sequência/retomada, hash inválido por item, numeração sem sobreposição e TTL canônico, quatro decisões de conflito, recibos, rollback de entidade/numeração/recibo/evento, persistência da recusa conforme contrato e tenant B invisível. Não adicionar limites/normalizações da API STYNX ao comportamento esperado. Não montar módulo, store ou controller STYNX. RLS deve ser demonstrado com role_app_backend e tenant context real (SQL administrativo só setup/cleanup). Restaurar ambiente e fixtures após cada arquivo; uma aplicação isolada por spec. Banco fornecido pelo maestro deve ser explicitamente descartável, nunca fallback localhost/detran. +
+O contrato CTG-0001 contém as definições e critérios atuais e CTG-0002 fixa a interface do verificador; não reinterpretá-los. Sem valor canônico, registrar `source_pending` ou OD no relatório. Fail-closed de assinatura: sem backend configurado → erro; mock nunca em staging-like/production; nenhuma resposta assinado sem evidência. Nunca introduzir provider externo real, prazo, papel ou estado novo. +
+## Critérios e comandos +
+- `pnpm --filter @detran/ops-offline-sync test:unit --passWithNoTests=false` → exit 0, testes coletados, sem falhas/skip.
+- `pnpm --filter @detran/ops-offline-sync test:integration --passWithNoTests=false` → exit 0, testes coletados, sem falhas/skip.
+- `pnpm --filter @detran/app test:e2e --passWithNoTests=false tests/e2e/teat-field-sync.e2e.spec.ts tests/e2e/boat-crash-commands.e2e.spec.ts tests/e2e/r21-offline-sync.e2e.spec.ts` → exit 0, testes coletados, sem falhas/skip.
+- `pnpm typecheck` → exit 0. +
+Para Inspector TASK-0015, a fase RED de implementação ausente é a única exceção ao resultado verde nesta entrega; registrar separadamente, sem declarar PASS do verificador. Para TASK-0002/0003 toda caracterização deve estar verde sobre a baseline antes do pin. O maestro executa gates globais e conserva logs. Workers não iniciam/resetam bancos nem processos de longa duração; utilizam somente env e banco exclusivos entregues pelo maestro. Não executar gates que escrevem a mesma árvore ou banco em paralelo. +
+Formatar apenas arquivos próprios com prettier antes de entregar (relatório não reformatar). Nenhum teste enfraquecido, nenhum gerado editado, nenhuma constante normativa inventada. Se um critério exige ferramenta/arquivo ausente, relatar em vez de substituí-lo. +
+## Entrega +
+Retornar Markdown: Papel; Tarefa; arquivos criados/alterados; comandos e exit codes; matriz critério→arquivo/teste→PASS/FAIL/RED; fora do escopo; ODs; bloqueios; próximo passo exato. Informar duração e estimativa de tokens se disponível. O maestro salva o retorno em reports/ e preserva a saída verbatim.
diff --git a/work/rounds/R-0021/prompts/TASK-0004.md b/work/rounds/R-0021/prompts/TASK-0004.md
new file mode 100644
index 00000000..fddddc90
--- /dev/null
+++ b/work/rounds/R-0021/prompts/TASK-0004.md
@@ -0,0 +1,73 @@
+# Worker TASK-0004 — Fixar STYNX 1.4.0 e integrar verificador +
+Papel: Engineer. Perfil: `engineer-backend`. Modelo exato `gpt-6-luna`, esforço `medium`. +
+## Contexto e entrada +
+R-0021, CTG `CTG-0002`, worktree `/Users/aarusso/.codex/worktrees/stynx-canonical/detran`. Uma tarefa, um papel, um relatório. O Owner aprovou apenas caracterização, pin 1.4.0 e handoff; assinatura/outbox/offline migrarão em R-0022. Notificações aguardam produtor. Nunca leia a conversa ou presuma trabalho de outra sessão. +
+Antes de escrever, conferir contrato e insumos listados; ausente/incompatível vira bloqueio no relatório. A leitura fechada abaixo substitui leituras genéricas não pertinentes dos manuais. Não explore diretórios além dela; peça uma ampliação concreta se indispensável. +
+## Leitura obrigatória fechada +
+- `AGENTS.md`
+- `CODESTYLE.md`
+- `docs/meta/agents/engineer-backend.md`
+- `package.json`
+- `pnpm-workspace.yaml`
+- `tools/blueprints/check.mjs`
+- `tools/blueprints/generate.mjs`
+- `tools/blueprints/generated-files.json`
+- `work/rounds/R-0021/AUTHORIZATION.md`
+- `work/rounds/R-0021/contracts/CTG-0001.md`
+- `work/rounds/R-0021/contracts/CTG-0002.md`
+- `tools/stynx-pin/tests/check.test.mjs` +
+- `work/rounds/R-0021/contracts/stynx-manifests.json` +
+## Pode tocar +
+- `tools/check-stynx-pin.ts`
+- `tools/stynx-version.json`
+- `tools/blueprints/generate.mjs`
+- `package.json`
+- `apps/boat/mobile/package.json` (somente dependências STYNX)
+- `apps/dashboard/web/package.json` (somente dependências STYNX)
+- `apps/portal/web/package.json` (somente dependências STYNX)
+- `apps/rait/web/package.json` (somente dependências STYNX)
+- `apps/teat/mobile/package.json` (somente dependências STYNX)
+- `apps/teat/web/package.json` (somente dependências STYNX)
+- `backend/app/package.json` (somente dependências STYNX)
+- `backend/domains/ops/core/package.json` (somente dependências STYNX)
+- `backend/domains/shared/package.json` (somente dependências STYNX)
+- `packages/senatran-adapter/package.json` (somente dependências STYNX)
+- `packages/ui/package.json` (somente dependências STYNX) +
+## Não pode tocar +
+Tudo fora da lista acima. Em particular Git (inclusive status/add/stash), instalações, lockfile, testes de outro worker, specs existentes não autorizadas, produto, DDL, `.devai/`, `record/`, repositórios irmãos e arquivos gerados à mão. O maestro é único escritor do Git e pnpm-lock.yaml. +
+## Tarefa e definições vinculantes +
+Implementar o contrato C-02 fechado e satisfazer os testes de TASK-0015 sem editá-los. Criar tools/stynx-version.json e tools/check-stynx-pin.ts; o gerador carrega a fonte única independentemente de BLUEPRINTS_OUTPUT. Declarar verify:stynx-pin e test:stynx-pin no package raiz e integrar ambos em pnpm check. Atualizar a lista fechada de manifestos do contrato, usando generator para manifestos gerados, sem mudar versões de outras bibliotecas. Preservar todas as dependências existentes e fixar STYNX em 1.4.0; remoções ficam como inventário para R-0022. A hipótese antiga de quatro deps BOAT sem uso é falsa para angular-i18n (boat-pages.ts importa StynxI18nService). Não remover nenhuma nesta tarefa. Não montar módulos nem alterar comportamento do backend. Após editar manifestos, entregar checkpoint dependency-ready ao maestro: somente ele roda pnpm install e altera pnpm-lock.yaml; então retomar os gates dependentes do install. Nenhum pnpm check em background. Se generator mudar arquivos além do pin, relatar diff e não editar saída à mão. +
+O contrato CTG-0001 contém as definições e critérios atuais e CTG-0002 fixa a interface do verificador; não reinterpretá-los. Sem valor canônico, registrar `source_pending` ou OD no relatório. Fail-closed de assinatura: sem backend configurado → erro; mock nunca em staging-like/production; nenhuma resposta assinado sem evidência. Nunca introduzir provider externo real, prazo, papel ou estado novo. +
+## Critérios e comandos +
+- `node --test tools/stynx-pin/tests/check.test.mjs` → exit 0, testes encontrados e sem falhas/skip.
+- `pnpm verify:stynx-pin` → exit 0, testes encontrados e sem falhas/skip.
+- `pnpm blueprints:check` → exit 0, testes encontrados e sem falhas/skip.
+- `pnpm typecheck` → exit 0, testes encontrados e sem falhas/skip. +
+Para Inspector TASK-0015, a fase RED de implementação ausente é a única exceção ao resultado verde nesta entrega; registrar separadamente, sem declarar PASS do verificador. Para TASK-0002/0003 toda caracterização deve estar verde sobre a baseline antes do pin. O maestro executa gates globais e conserva logs. Workers não iniciam/resetam bancos nem processos de longa duração; utilizam somente env e banco exclusivos entregues pelo maestro. Não executar gates que escrevem a mesma árvore ou banco em paralelo. +
+Formatar apenas arquivos próprios com prettier antes de entregar (relatório não reformatar). Nenhum teste enfraquecido, nenhum gerado editado, nenhuma constante normativa inventada. Se um critério exige ferramenta/arquivo ausente, relatar em vez de substituí-lo. +
+## Entrega +
+Retornar Markdown: Papel; Tarefa; arquivos criados/alterados; comandos e exit codes; matriz critério→arquivo/teste→PASS/FAIL/RED; fora do escopo; ODs; bloqueios; próximo passo exato. Informar duração e estimativa de tokens se disponível. O maestro salva o retorno em reports/ e preserva a saída verbatim. +
+## Checkpoint de geração e dependências +
+O worker entrega generator e 11 manifestos manual-source ao maestro. O maestro detém o lock e executa pnpm blueprints:generate uma única vez, depois pnpm install. Só os 48 paths blueprints:generate de contracts/stynx-manifests.json podem mudar como saída gerada, somente pin. Qualquer outro diff é bloqueio, não edição manual. Worker retoma os gates após confirmação do maestro.
diff --git a/work/rounds/R-0021/prompts/TASK-0005.md b/work/rounds/R-0021/prompts/TASK-0005.md
new file mode 100644
index 00000000..01a9ffcb
--- /dev/null
+++ b/work/rounds/R-0021/prompts/TASK-0005.md
@@ -0,0 +1,3 @@
+# TASK-0005 — CANCELADA EM R-0021 +
+Papel: Architect. AUTHORIZATION.md A1 transfere CTG-0003 integralmente a R-0022. Não executar. Nenhuma entrega de implementação autorizada; a tarefa não está completed. Critérios originais ficam não cumpridos no closure. Sem backend → erro; mock nunca staging-like/production; nenhuma resposta assinado sem evidência.
diff --git a/work/rounds/R-0021/prompts/TASK-0006.md b/work/rounds/R-0021/prompts/TASK-0006.md
new file mode 100644
index 00000000..68c290cd
--- /dev/null
+++ b/work/rounds/R-0021/prompts/TASK-0006.md
@@ -0,0 +1,3 @@
+# TASK-0006 — CANCELADA EM R-0021 +
+Papel: Inspector. AUTHORIZATION.md A1 transfere CTG-0003 integralmente a R-0022. Não executar. Nenhuma entrega de implementação autorizada; a tarefa não está completed. Critérios originais ficam não cumpridos no closure. Sem backend → erro; mock nunca staging-like/production; nenhuma resposta assinado sem evidência.
diff --git a/work/rounds/R-0021/prompts/TASK-0007.md b/work/rounds/R-0021/prompts/TASK-0007.md
new file mode 100644
index 00000000..0f699a61
--- /dev/null
+++ b/work/rounds/R-0021/prompts/TASK-0007.md
@@ -0,0 +1,3 @@
+# TASK-0007 — CANCELADA EM R-0021 +
+Papel: Engineer. AUTHORIZATION.md A1 transfere CTG-0003 integralmente a R-0022. Não executar. Nenhuma entrega de implementação autorizada; a tarefa não está completed. Critérios originais ficam não cumpridos no closure. Sem backend → erro; mock nunca staging-like/production; nenhuma resposta assinado sem evidência.
diff --git a/work/rounds/R-0021/prompts/TASK-0008.md b/work/rounds/R-0021/prompts/TASK-0008.md
new file mode 100644
index 00000000..3c63e06c
--- /dev/null
+++ b/work/rounds/R-0021/prompts/TASK-0008.md
@@ -0,0 +1,3 @@
+# TASK-0008 — CANCELADA EM R-0021 +
+Papel: Architect. AUTHORIZATION.md A1 transfere CTG-0004 integralmente a R-0022. Não executar. Nenhuma entrega de implementação autorizada; a tarefa não está completed. Critérios originais ficam não cumpridos no closure. Sem backend → erro; mock nunca staging-like/production; nenhuma resposta assinado sem evidência.
diff --git a/work/rounds/R-0021/prompts/TASK-0009.md b/work/rounds/R-0021/prompts/TASK-0009.md
new file mode 100644
index 00000000..41cd1c84
--- /dev/null
+++ b/work/rounds/R-0021/prompts/TASK-0009.md
@@ -0,0 +1,3 @@
+# TASK-0009 — CANCELADA EM R-0021 +
+Papel: Inspector. AUTHORIZATION.md A1 transfere CTG-0004 integralmente a R-0022. Não executar. Nenhuma entrega de implementação autorizada; a tarefa não está completed. Critérios originais ficam não cumpridos no closure. Sem backend → erro; mock nunca staging-like/production; nenhuma resposta assinado sem evidência.
diff --git a/work/rounds/R-0021/prompts/TASK-0010.md b/work/rounds/R-0021/prompts/TASK-0010.md
new file mode 100644
index 00000000..b16d09d5
--- /dev/null
+++ b/work/rounds/R-0021/prompts/TASK-0010.md
@@ -0,0 +1,3 @@
+# TASK-0010 — CANCELADA EM R-0021 +
+Papel: Engineer. AUTHORIZATION.md A1 transfere CTG-0004 integralmente a R-0022. Não executar. Nenhuma entrega de implementação autorizada; a tarefa não está completed. Critérios originais ficam não cumpridos no closure. Sem backend → erro; mock nunca staging-like/production; nenhuma resposta assinado sem evidência.
diff --git a/work/rounds/R-0021/prompts/TASK-0011.md b/work/rounds/R-0021/prompts/TASK-0011.md
new file mode 100644
index 00000000..5ab4c151
--- /dev/null
+++ b/work/rounds/R-0021/prompts/TASK-0011.md
@@ -0,0 +1,3 @@
+# TASK-0011 — CANCELADA EM R-0021 +
+Papel: Architect. AUTHORIZATION.md A1 transfere CTG-0005 integralmente a R-0022. Não executar. Nenhuma entrega de implementação autorizada; a tarefa não está completed. Critérios originais ficam não cumpridos no closure. Sem backend → erro; mock nunca staging-like/production; nenhuma resposta assinado sem evidência.
diff --git a/work/rounds/R-0021/prompts/TASK-0012.md b/work/rounds/R-0021/prompts/TASK-0012.md
new file mode 100644
index 00000000..d4fe83bd
--- /dev/null
+++ b/work/rounds/R-0021/prompts/TASK-0012.md
@@ -0,0 +1,3 @@
+# TASK-0012 — CANCELADA EM R-0021 +
+Papel: Inspector. AUTHORIZATION.md A1 transfere CTG-0005 integralmente a R-0022. Não executar. Nenhuma entrega de implementação autorizada; a tarefa não está completed. Critérios originais ficam não cumpridos no closure. Sem backend → erro; mock nunca staging-like/production; nenhuma resposta assinado sem evidência.
diff --git a/work/rounds/R-0021/prompts/TASK-0013.md b/work/rounds/R-0021/prompts/TASK-0013.md
new file mode 100644
index 00000000..25d0adaa
--- /dev/null
+++ b/work/rounds/R-0021/prompts/TASK-0013.md
@@ -0,0 +1,3 @@
+# TASK-0013 — CANCELADA EM R-0021 +
+Papel: Engineer. AUTHORIZATION.md A1 transfere CTG-0005 integralmente a R-0022. Não executar. Nenhuma entrega de implementação autorizada; a tarefa não está completed. Critérios originais ficam não cumpridos no closure. Sem backend → erro; mock nunca staging-like/production; nenhuma resposta assinado sem evidência.
diff --git a/work/rounds/R-0021/prompts/TASK-0014.md b/work/rounds/R-0021/prompts/TASK-0014.md
new file mode 100644
index 00000000..5a33de1a
--- /dev/null
+++ b/work/rounds/R-0021/prompts/TASK-0014.md
@@ -0,0 +1,60 @@
+# Worker TASK-0014 — Documentar pin, transferências e resultado real +
+Papel: Architect. Perfil: `transcriber-docs`. Modelo exato `gpt-6-luna`, esforço `low`. +
+## Contexto e entrada +
+R-0021, CTG `CTG-0007`, worktree `/Users/aarusso/.codex/worktrees/stynx-canonical/detran`. Uma tarefa, um papel, um relatório. O Owner aprovou apenas caracterização, pin 1.4.0 e handoff; assinatura/outbox/offline migrarão em R-0022. Notificações aguardam produtor. Nunca leia a conversa ou presuma trabalho de outra sessão. +
+Antes de escrever, conferir contrato e insumos listados; ausente/incompatível vira bloqueio no relatório. A leitura fechada abaixo substitui leituras genéricas não pertinentes dos manuais. Não explore diretórios além dela; peça uma ampliação concreta se indispensável. +
+## Leitura obrigatória fechada +
+- `AGENTS.md`
+- `CODESTYLE.md`
+- `docs/meta/adr/ADR-0015-stynx-1-3-1-angular-22-and-rait-role-catalogue.md`
+- `docs/meta/adr/ADR-0016-infraction-and-notification-boundary.md`
+- `docs/meta/adr/ADR-0018-documents-and-signature-substrate.md`
+- `docs/meta/adr/README.md`
+- `docs/meta/agents/orchestra/waves.md`
+- `docs/meta/agents/transcriber-docs.md`
+- `docs/meta/knowledge-base/backlog.md`
+- `docs/meta/knowledge-base/conventions.md`
+- `work/campaigns/C-0002-stynx-upstream-spec.md`
+- `work/rounds/R-0021/AUTHORIZATION.md`
+- `work/rounds/R-0021/contracts/CTG-0001.md`
+- `work/rounds/R-0021/contracts/CTG-0002.md`
+- `work/rounds/R-0021/plan.md` +
+## Pode tocar +
+- `docs/meta/adr/ADR-0015-stynx-1-3-1-angular-22-and-rait-role-catalogue.md`
+- `docs/meta/agents/orchestra/waves.md`
+- `docs/meta/knowledge-base/backlog.md`
+- `work/rounds/README.md`
+- `work/rounds/R-0021/reports/TASK-0014.md` +
+## Não pode tocar +
+Tudo fora da lista acima. Em particular Git (inclusive status/add/stash), instalações, lockfile, testes de outro worker, specs existentes não autorizadas, produto, DDL, `.devai/`, `record/`, repositórios irmãos e arquivos gerados à mão. O maestro é único escritor do Git e pnpm-lock.yaml. +
+## Tarefa e definições vinculantes +
+Transcrever resultados e decisões após CTG0001/0002 mesclados. Atualizar ADR0015 por emenda do pin e referências históricas sem afirmar migrações. Atualizar waves/backlog/índice de rodadas com estado real e referências aos PRs que o maestro fornecer. Não criar ADR nova sem decisão arquitetural nova; não afirmar close antes do recibo nem seal em hipótese alguma. Registrar transferências R22 e notificações OD-P40; requisitos originais não cumpridos permanecem assim. Relatórios e logs dos grupos são somente leitura, fornecidos pelo maestro em lista fechada anexada ao disparo. Código, testes e closure/evidência pertencem a outros papéis/operações; não editar. Se verify:state-index exigir atualização coordenada de outro índice, relatar arquivo exato ao Architect antes de ampliar a escrita. +
+O contrato CTG-0001 contém as definições e critérios atuais e CTG-0002 fixa a interface do verificador; não reinterpretá-los. Sem valor canônico, registrar `source_pending` ou OD no relatório. Fail-closed de assinatura: sem backend configurado → erro; mock nunca em staging-like/production; nenhuma resposta assinado sem evidência. Nunca introduzir provider externo real, prazo, papel ou estado novo. +
+## Critérios e comandos +
+- `pnpm docs:kb:check` → exit 0, testes encontrados e sem falhas/skip.
+- `pnpm docs:kb:publish-check` → exit 0, testes encontrados e sem falhas/skip.
+- `pnpm verify:state-index` → exit 0, testes encontrados e sem falhas/skip.
+- `pnpm format:check` → exit 0, testes encontrados e sem falhas/skip. +
+Para Inspector TASK-0015, a fase RED de implementação ausente é a única exceção ao resultado verde nesta entrega; registrar separadamente, sem declarar PASS do verificador. Para TASK-0002/0003 toda caracterização deve estar verde sobre a baseline antes do pin. O maestro executa gates globais e conserva logs. Workers não iniciam/resetam bancos nem processos de longa duração; utilizam somente env e banco exclusivos entregues pelo maestro. Não executar gates que escrevem a mesma árvore ou banco em paralelo. +
+Formatar apenas arquivos próprios com prettier antes de entregar (relatório não reformatar). Nenhum teste enfraquecido, nenhum gerado editado, nenhuma constante normativa inventada. Se um critério exige ferramenta/arquivo ausente, relatar em vez de substituí-lo. +
+## Entrega +
+Retornar Markdown: Papel; Tarefa; arquivos criados/alterados; comandos e exit codes; matriz critério→arquivo/teste→PASS/FAIL/RED; fora do escopo; ODs; bloqueios; próximo passo exato. Informar duração e estimativa de tokens se disponível. O maestro salva o retorno em reports/ e preserva a saída verbatim.
diff --git a/work/rounds/R-0021/prompts/TASK-0015.md b/work/rounds/R-0021/prompts/TASK-0015.md
new file mode 100644
index 00000000..2da5e808
--- /dev/null
+++ b/work/rounds/R-0021/prompts/TASK-0015.md
@@ -0,0 +1,49 @@
+# Worker TASK-0015 — Escrever negativos do verificador de pin +
+Papel: Inspector. Perfil: `inspector-tests`. Modelo exato `gpt-5.6-terra`, esforço `medium`. +
+## Contexto e entrada +
+R-0021, CTG `CTG-0002`, worktree `/Users/aarusso/.codex/worktrees/stynx-canonical/detran`. Uma tarefa, um papel, um relatório. O Owner aprovou apenas caracterização, pin 1.4.0 e handoff; assinatura/outbox/offline migrarão em R-0022. Notificações aguardam produtor. Nunca leia a conversa ou presuma trabalho de outra sessão. +
+Antes de escrever, conferir contrato e insumos listados; ausente/incompatível vira bloqueio no relatório. A leitura fechada abaixo substitui leituras genéricas não pertinentes dos manuais. Não explore diretórios além dela; peça uma ampliação concreta se indispensável. +
+## Leitura obrigatória fechada +
+- `AGENTS.md`
+- `CODESTYLE.md`
+- `docs/meta/agents/inspector-tests.md`
+- `package.json`
+- `tools/blueprints/check.mjs`
+- `tools/blueprints/generate.mjs`
+- `work/rounds/R-0021/AUTHORIZATION.md`
+- `work/rounds/R-0021/contracts/CTG-0001.md`
+- `work/rounds/R-0021/contracts/CTG-0002.md` +
+## Pode tocar +
+- `tools/stynx-pin/tests/*.test.mjs` +
+## Não pode tocar +
+Tudo fora da lista acima. Em particular Git (inclusive status/add/stash), instalações, lockfile, testes de outro worker, specs existentes não autorizadas, produto, DDL, `.devai/`, `record/`, repositórios irmãos e arquivos gerados à mão. O maestro é único escritor do Git e pnpm-lock.yaml. +
+## Tarefa e definições vinculantes +
+Escrever tools/stynx-pin/tests/check.test.mjs com node:test, fixtures temporárias via mkdtemp em os.tmpdir e cleanup. Invocar a CLI real do futuro verificador por tsx local (não mockar sua lógica). Casos C-02-* do contrato: conjunto uniforme, cada uma das quatro seções, range/caret/workspace rejeitados, novo manifest descoberto, diretórios excluídos, arquivo/config inválido e falta de versão, fonte única para gerador, diagnósticos e exit code. Fixtures de diretórios não contêm tokens nem alteram o repositório real. A tarefa tem fase RED esperada enquanto CLI/config não existem: registrar testes encontrados, quantos falham e causa de ausência (não erro de sintaxe/harness); isso não é PASS de produto. Após Engineer o maestro exige exatamente estes testes verdes, sem edições. Nenhum arquivo de produção ou script de package nesta tarefa. Nome de teste em português e vinculação C-02. +
+O contrato CTG-0001 contém as definições e critérios atuais e CTG-0002 fixa a interface do verificador; não reinterpretá-los. Sem valor canônico, registrar `source_pending` ou OD no relatório. Fail-closed de assinatura: sem backend configurado → erro; mock nunca em staging-like/production; nenhuma resposta assinado sem evidência. Nunca introduzir provider externo real, prazo, papel ou estado novo. +
+Resolver tsx no contexto do próprio arquivo de teste (`import.meta.resolve('tsx')`) e passar sua URL absoluta ao `--import`. O cwd das fixtures temporárias não pode participar da resolução do runner. +
+## Critérios e comandos +
+- `node --test tools/stynx-pin/tests/check.test.mjs` → exit 0, testes encontrados e sem falhas/skip. +
+Para Inspector TASK-0015, a fase RED de implementação ausente é a única exceção ao resultado verde nesta entrega; registrar separadamente, sem declarar PASS do verificador. Para TASK-0002/0003 toda caracterização deve estar verde sobre a baseline antes do pin. O maestro executa gates globais e conserva logs. Workers não iniciam/resetam bancos nem processos de longa duração; utilizam somente env e banco exclusivos entregues pelo maestro. Não executar gates que escrevem a mesma árvore ou banco em paralelo. +
+Formatar apenas arquivos próprios com prettier antes de entregar (relatório não reformatar). Nenhum teste enfraquecido, nenhum gerado editado, nenhuma constante normativa inventada. Se um critério exige ferramenta/arquivo ausente, relatar em vez de substituí-lo. +
+## Entrega +
+Retornar Markdown: Papel; Tarefa; arquivos criados/alterados; comandos e exit codes; matriz critério→arquivo/teste→PASS/FAIL/RED; fora do escopo; ODs; bloqueios; próximo passo exato. Informar duração e estimativa de tokens se disponível. O maestro salva o retorno em reports/ e preserva a saída verbatim.
diff --git a/work/rounds/R-0021/reports/CTG-0001-gates.md b/work/rounds/R-0021/reports/CTG-0001-gates.md
new file mode 100644
index 00000000..66da4b48
--- /dev/null
+++ b/work/rounds/R-0021/reports/CTG-0001-gates.md
@@ -0,0 +1,18 @@
+# CTG-0001 — gates e triagem antes do pin +
+Papel: Architect (coordenação dos gates); código e testes pertencem aos Inspectors identificados nos relatórios TASK-0002/0003.
+Árvore de entrada: `e47a68014ffdd24e1f9da03c4fc9e1b78ecf381b` mais os arquivos preparados e os sete specs novos. Node v24.20.0, pnpm 9.15.0, STYNX 1.3.1. PostGIS 3.4.3 em container exclusivo da rodada `a9abf78080db`. +
+| Operação | Banco / ambiente | Exit | Prova |
+| --- | --- | ---: | --- |
+| Baseline `pnpm check` antes dos Inspectors | árvore de preparação | 0 | `baseline-check.log`, SHA-256 `002039a261be0d4d1f45eae77dc63d91af86ee79a8f6bb030e354bdea0bf7144` |
+| Build `@detran/ch-clinical-reports` antes da caracterização | sem banco | 0 | `clinical-build-pre.log` |
+| `backend:test:prepare-legacy` | banco fixo do runtime no container exclusivo | 0 | `db-prepare.log`, 20 casos e DDL/seed canônicos |
+| E2e integral de TASK-0002 após satisfazer o nome de banco exigido pela suíte RAIT | `detran_r7_ctg1_a2`, container R21 | 0 | `task0002-e2e-fixed.log`, 3 arquivos/107 testes |
+| E2e integral de TASK-0003 após restaurar sua fixture | `detran_r21_task3` | 0 | `task0003-e2e-fresh.log`, 3 arquivos/50 testes |
+| Primeiro `pnpm check` do grupo | árvore anterior a duas correções focais | 143 (encerrado pelo maestro, sem veredito) | `ctg0001-check-aborted.log`; encerrado durante `blueprints:check` para não validar árvore obsoleta |
+| `pnpm check` final | árvore corrigida | 0 | `ctg0001-check.log`, SHA-256 `f5f4446b8601acad7b2e2b9943f258d5adbb940d64231e8ea62742436e353aad` |
+| Primeiro `pnpm backend:test:ci` | banco fixo, mock nacional ausente | 1 | `ctg0001-backend-ci-no-mock-fail.log`; 22 falhas em 4 arquivos e2e do Portal dependentes de mock; não há edição em código Portal |
+| `pnpm backend:test:ci` com `SENATRAN_PROVIDER=mock` e `SENATRAN_MOCK_BASE_URL=http://127.0.0.1:31021` | banco fixo, mock SENATRAN e banco `senatran` exclusivos | 0 | `ctg0001-backend-ci.log`, SHA-256 `b008d421790cebd685d15b25049225d01120ca8e50faa26c7413b09cacb6cf5c`; app e2e 37/37 arquivos; upgrade 21/21 testes | +
+Triagem: o e2e RAIT exige literalmente `detran_r7_ctg1_a2`; o runtime `backend:test:ci` usa o mesmo nome. Ele só existe dentro do container exclusivo da rodada. A suíte BOAT existente reutiliza chaves determinísticas, portanto o banco `detran_r21_task3` foi restaurado da fixture canônica antes da execução conjunta, sem mudar testes. O primeiro `backend:test:ci` foi `sensor-error` de ambiente por mock não iniciado. O serviço persistente da rodada responde em health sob PID 96431; o primeiro processo de mock iniciado por shell curto terminou antes do e2e e não foi reutilizado. Os negativos e os logs falhos foram preservados; nenhum gate foi declarado verde antes de exit 0.
diff --git a/work/rounds/R-0021/reports/TASK-0001.md b/work/rounds/R-0021/reports/TASK-0001.md
new file mode 100644
index 00000000..97e57d38
--- /dev/null
+++ b/work/rounds/R-0021/reports/TASK-0001.md
@@ -0,0 +1,63 @@
+# TASK-0001 — preparação de contratos por Astra +
+Papel: Architect (artigo 7); autoridade por caminho (artigo 6).
+Data: 2026-09-27. Worktree: `/Users/aarusso/.codex/worktrees/stynx-canonical/detran`. +
+## Entrega +
+- `contracts/CTG-0001.md`: inventário, superfície local e publicada, lacunas

- L-01…08, critérios C-01-01…10 e C-01-20…30, arquivos de teste delimitados,
- harness real e comandos antes/depois pin.
  +- `contracts/CTG-0002.md`: contrato do CLI e fonte única, negativos blackbox,
- integração do gerador/scripts/check e critérios C-02-01…12.
  +- `contracts/stynx-manifests.json`: 59 manifests com dependências exatas e modo
- de edição, 48 via gerador e 11 manuscritos.
  +- `inputs/published-api-{signature,outbox,offline-sync}.md`: tipos reais
- publicados e implementação relevante; nenhuma API presumida.
  +- `inputs/published-api-metadata.json`: hashes dos seis tarballs e de todos os
- JS/.d.ts próprios comparados, sem binários nem credenciais versionados.
-

+## Achados +
+A comparação byte a byte confirma igualdade dos arquivos JS/.d.ts próprios entre
+1.4.0 e 1.5.0-rc.2: signature 34, outbox 22 e offline-sync 20. A afirmação não
+abrange manifests e dependências transitivas. Inputs vêm exclusivamente dos
+archives já adquiridos no scratch informado pelo maestro. +
+Assinatura publicada não equivale a renderAndSign, readiness e manifesto clínico;
+outbox publicada faz upsert por agregado e dispatch/ACK sob system/owner;
+offline publicado não oferece protocolo DETRAN e porta transacional de applier.
+São requisitos para a adenda upstream e a migração transferida, sem trabalho de
+produção autorizado por esta preparação. ADR de operações atual é ADR-0036. +
+As suítes existentes já cobrem muitas combinações; os novos specs devem completar
+somente lacunas e seus relatórios mapear provas existentes. Harness HTTP utiliza
+AppModule real. RLS utiliza role_app_backend e contexto tenant, com owner apenas
+no setup/cleanup e observação administrativa. +
+## Validação e limites +
+Inventário calculado por parsing dos manifests fonte e cruzamento com +`tools/blueprints/generated-files.json`. Tarballs abertos em memória sem extração
+executável, SHA-256/SHA-512 recalculados, igualdade dos próprios arquivos verificada
+com assert. Caminhos fundamentais e scripts foram conferidos na worktree.
+Nenhum Git, instalação, código de produção, teste, banco ou evidência DEVAI foi
+alterado por esta tarefa. As provas verdes são entregas dos Inspectors/maestro;
+a preparação não as apresenta como executadas. SHA base e revisão independente
+serão anexados pelo maestro, responsável por Git e pela cadeia governada. +
+C-01-10 requer spec RENACH de integração próprio com SQL real/two tenants: a
+suíte pec-pipeline-persistence existente cobre kernel, não esse fluxo. O maestro
+aprovou o quinto arquivo `backend/app/tests/integration/r21-renach-characterization.integration.spec.ts`
+na fronteira de TASK-0002. +
+## Adendo de atribuição Architect/Astra — revisão ciclo 1 +
+Também integram TASK-0001 e a revisão/evidência/PR CTG-0001 os cinco artefatos de documentação preparados pelo Astra, com decisões Owner e handoff:
+- `work/campaigns/C-0002-stynx-upstream-spec.md`
+- `docs/meta/knowledge-base/open-decisions-rait.md`
+- `work/campaigns/C-0002-consolidacao.md`
+- `work/rounds/R-0022/plan.md`
+- `work/rounds/R-0022/prompts/00-maestro.md` +
+Contratos/prompts corrigidos pelo Architect após achados da revisão: comandos sem zero coleta, build clinical-reports pelo maestro antes de juntas, executor SQL real, geração exclusiva do maestro e preservação das dependências na troca de pin.
diff --git a/work/rounds/R-0021/reports/TASK-0002.md b/work/rounds/R-0021/reports/TASK-0002.md
new file mode 100644
index 00000000..70bb7b99
--- /dev/null
+++ b/work/rounds/R-0021/reports/TASK-0002.md
@@ -0,0 +1,69 @@
+Papel: Inspector  
+Tarefa: TASK-0002 — Caracterizar assinatura, confiança e RENACH  
+Hash aprovado: `b9433d5c16171dca822cd540f66502c901ce759a16e84c09cac4c778fcf336d3` +
+Arquivos criados: +
+- `backend/domains/ch/clinical-reports/tests/unit/r21-signature-characterization.spec.ts`
+- `backend/domains/shared/src/documents/r21-document-trust-characterization.spec.ts`
+- `backend/app/src/r21-renach-characterization.spec.ts`
+- `backend/app/tests/e2e/r21-trust-profiles.e2e.spec.ts`
+- `backend/app/tests/integration/r21-renach-characterization.integration.spec.ts` +
+Todos foram formatados com Prettier. Não houve edições fora dos cinco arquivos permitidos. +
+Comandos e resultados: +
+| Comando | Resultado |
+|---|---|
+| `pnpm --filter @detran/ch-clinical-reports test:unit --passWithNoTests=false` | exit 0; 5 arquivos, 33 testes, 0 falhas/skip |
+| `pnpm --filter @detran/shared run test --passWithNoTests=false` | exit 0; 14 arquivos, 432 testes, 0 falhas/skip |
+| `pnpm --filter @detran/ch-juntas run test --passWithNoTests=false` | exit 0; 1 arquivo, 12 testes, 0 falhas/skip |
+| `pnpm --filter @detran/app test:unit --passWithNoTests=false src/pec-renach-transmission.spec.ts src/r21-renach-characterization.spec.ts` | exit 0; 2 arquivos, 10 testes, 0 falhas/skip |
+| `pnpm --filter @detran/app test:e2e --passWithNoTests=false tests/e2e/runtime-profiles.e2e.spec.ts tests/e2e/r21-trust-profiles.e2e.spec.ts` | exit 0; 2 arquivos, 9 testes, 0 falhas/skip |
+| `pnpm --filter @detran/app test:integration --passWithNoTests=false tests/integration/pec-pipeline-persistence.integration.spec.ts tests/integration/r21-renach-characterization.integration.spec.ts` | exit 0; 2 arquivos, 3 testes, 0 falhas/skip |
+| `pnpm --filter @detran/app typecheck` | exit 0 |
+| `pnpm typecheck` | iniciado três vezes; o invocador devolveu controle aos 30 s sem exit code capturável. A verificação específica de `@detran/app` passou. | +
+Todos os comandos que acessam banco foram precedidos por `source /tmp/r21-task2-env.sh`. Nenhum banco foi criado, resetado ou migrado. +
+Matriz de critérios: +
+| Critério | Evidência | Resultado |
+|---|---|---|
+| C-01-01 | `r21-signature-characterization.spec.ts` — recibo completo, corpo HTTP e Bearer | PASS |
+| C-01-02 | `r21-signature-characterization.spec.ts` — content hash, artifact hash, storage, formato, nível, TSA, certificado e fonte inválidos | PASS |
+| C-01-03 | `r21-signature-characterization.spec.ts`; `pades-signing.http-adapter.spec.ts` — backend ausente, HTTP 503 e capacidades incompletas | PASS |
+| C-01-04 | `runtime-profiles.e2e.spec.ts`; `r21-trust-profiles.e2e.spec.ts` — perfil test sem clínica e staging-like fail-closed para HTTP claro | PASS |
+| C-01-05 | `r21-document-trust-characterization.spec.ts`; `document-trust.spec.ts` — health autenticado, backend/capacidade ausente, evidência e códigos atuais | PASS |
+| C-01-06 | `document-trust-batch*.spec.ts`, `document-trust-session-minutes.spec.ts`, `document-trust-worklist.spec.ts`, `document-trust.spec.ts` | PASS |
+| C-01-07 | `pec-renach-transmission.spec.ts` — payload mínimo, chave durável, correlação, artefato, retificação e espécie divergente | PASS |
+| C-01-08 | `pec-renach-transmission.spec.ts`; `r21-renach-characterization.spec.ts` — `skip locked`, retomada processing em 15 min, tentativa e retry em 15 min | PASS |
+| C-01-09 | `pec-renach-transmission.spec.ts`; `r21-renach-characterization.spec.ts` — ACK, inbox idempotente, erro e `renach_acked` | PASS |
+| C-01-10 | `r21-renach-characterization.integration.spec.ts` — SQL real, dois tenants, `role_app_backend`, sem owner na operação | PASS | +
+Fora do escopo: +
+- Produção, DDL, adapters, fachadas STYNX, package manifests, lockfile, relatórios, Git e bancos.
+- Nenhuma integração externa real; todos os provedores foram mockados. +
+ODs: +
+- Nenhum OD novo. +
+Bloqueios: +
+- O comando e2e integral exigido, incluindo `tests/e2e/rait-case-commands.e2e.spec.ts`, falhou no banco exclusivo de TASK-0002: a suíte legada exige literalmente `detran_r7_ctg1_a2`, enquanto o ambiente fornecido aponta outro banco descartável. A falha ocorreu no `beforeAll`; 98 testes ficaram skipped por consequência. Não alterei a suíte, o ambiente ou o banco.
+- A parte aplicável desta tarefa (`runtime-profiles` + novo spec) passou verde no banco entregue. +
+Próximo passo exato: +
+- O maestro deve repetir o comando e2e integral no ambiente destinado à suíte RAIT (`detran_r7_ctg1_a2`) ou registrar formalmente a incompatibilidade de pré-condição; depois executar o gate global e preservar os logs. +
+Duração aproximada: 5 minutos. Estimativa de tokens: indisponível. +
+## Iteração restrita após leitura do maestro +
+Papel: Inspector. O spec `r21-renach-characterization.integration.spec.ts` passou a exigir `DETRAN_TEST_DATABASE_URL` e a remover suas fixtures em ordem `integration.outbox` → `auth.users` → `auth.tenants`, fechando conexões em `finally`. Com `source /tmp/r21-task2-env.sh`, a suíte focal de integração passou: exit 0, 1 arquivo, 1 teste, sem skip. Hash final: `fe00fecec059ef3ce65aeaf02c1d8471bf4b4bd9716a1f5a71027fb422f335a3`. +
+Triagem do maestro: o comando e2e integral foi repetido no banco `detran_r7_ctg1_a2` dentro do PostGIS descartável exclusivo da rodada. Exit 0, 3 arquivos e 107 testes verdes; log `/tmp/r21-task2-e2e-fixed.log`. A falha inicial foi pré-condição de harness (`sensor-error`), não falha de produto. Nenhuma asserção foi enfraquecida.
diff --git a/work/rounds/R-0021/reports/TASK-0003.md b/work/rounds/R-0021/reports/TASK-0003.md
new file mode 100644
index 00000000..89b6a79b
--- /dev/null
+++ b/work/rounds/R-0021/reports/TASK-0003.md
@@ -0,0 +1,74 @@
+Papel: Inspector +
+Tarefa: TASK-0003 — caracterização HTTP, transações e RLS offline. +
+Arquivos criados: +
+- `backend/app/tests/e2e/r21-offline-sync.e2e.spec.ts`

- - C-01-21: replay HTTP pelo mesmo `Idempotency-Key` reproduz a resposta; corpo divergente retorna 422.
- - AppModule real, applier BOAT real, limpeza das próprias linhas e chaves de idempotência.
-

+- `backend/domains/ops/offline-sync/tests/integration/r21-offline-characterization.integration.spec.ts`

- - C-01-28: `role_app_backend` com contexto do tenant A não lê nem grava item do tenant B.
-

+Hashes: +
+- `r21-offline-sync.e2e.spec.ts`: `1fc5336d08c77714db9821a4367006c4e69e597615b30d08c856914126b7d9bb`
+- `r21-offline-characterization.integration.spec.ts`: `490ea0b6afe7fe4fd9a030f1a5a2a4a5af3c5b2be89af935bd7cf7d991bc7916` +
+Comandos executados: +
+| Comando | Exit | Resultado |
+|---|---:|---|
+| `pnpm --filter @detran/ops-offline-sync test:integration --passWithNoTests=false` | 0 | 5 arquivos, 45 testes verdes |
+| `pnpm --filter @detran/app test:e2e --passWithNoTests=false tests/e2e/r21-offline-sync.e2e.spec.ts` | 0 | 1 arquivo, 1 teste verde |
+| `pnpm --filter @detran/ops-offline-sync test:unit --passWithNoTests=false` | 0 | 2 arquivos, 33 testes verdes |
+| `pnpm typecheck` | 0 | Sem erro observado |
+| e2e conjunto TEAT + BOAT + R21 | 1 | Bloqueio descrito abaixo | +
+Matriz critério → prova → resultado: +
+| Critério | Arquivo/teste | Resultado |
+|---|---|---|
+| C-01-20 | `teat-field-sync.e2e.spec.ts`; `boat-crash-commands.e2e.spec.ts` | PASS na primeira execução de baseline |
+| C-01-21 | `r21-offline-sync.e2e.spec.ts` | PASS |
+| C-01-22 | `sync-batch.integration.spec.ts` | PASS |
+| C-01-23 | `numbering.integration.spec.ts` | PASS |
+| C-01-24 | `teat-field-sync.e2e.spec.ts`; `sync-batch.integration.spec.ts` | PASS |
+| C-01-25 | `sync-batch.integration.spec.ts` | PASS |
+| C-01-26 | `concurrency-window.integration.spec.ts` | PASS |
+| C-01-27 | `resolve-conflict.integration.spec.ts` | PASS |
+| C-01-28 | `r21-offline-characterization.integration.spec.ts`; e2e existente | PASS |
+| C-01-29 | `sync-batch.integration.spec.ts` | PASS |
+| C-01-30 | `boat-crash-commands.e2e.spec.ts` | PASS na primeira execução de baseline | +
+Fora do escopo: +
+- Nenhuma alteração em produto, DDL, fixtures compartilhadas, configuração, Git, lockfile ou relatórios.
+- Nenhum banco foi criado, resetado ou usado fora do ambiente exclusivo fornecido. +
+ODs: +
+- Nenhum novo OD. +
+Bloqueio: +
+- A reexecução conjunta de `boat-crash-commands.e2e.spec.ts` falhou com sete casos por `IDEMPOTENT_KEY_REUSE_DIFFERENT_BODY`.
+- Causa observada: a suíte BOAT reutiliza chaves HTTP determinísticas `boat-crash-e2e-N`, enquanto sua limpeza não remove as linhas correspondentes de `integration.idempotency_keys`. A primeira execução de baseline passou com 49 testes; a segunda encontra os fingerprints persistidos.
+- Não alterei a suíte BOAT, pois está fora dos dois caminhos autorizados. O novo spec R21 remove as próprias chaves `r21-http-*`. +
+Ambiente: +
+- Node `v24.20.0`
+- pnpm `9.15.0`
+- `@detran/ops-offline-sync` `0.0.1` +
+Duração aproximada: 8 minutos. Estimativa de tokens indisponível. +
+Próximo passo exato: o maestro deve registrar o bloqueio de reexecução da BOAT e decidir, em tarefa com autorização para aquele spec, a limpeza de `integration.idempotency_keys` das chaves pertencentes à suíte. +
+## Iteração restrita após leitura do maestro +
+Papel: Inspector. O negativo RLS passou a usar o ID real da fila do tenant B: sob `role_app_backend` com tenant A, SELECT não lê, UPDATE pelo ID real retorna `rowCount=0` e nenhuma linha; sob tenant B a linha permanece `received`. O insert com possíveis erros de FK foi removido. A suíte offline de integração passou: exit 0, 5 arquivos, 45 testes, sem skip. Hash final: `7d3781a9e1a42260de71620955b8d912ec7d5af76f2eb0fef714de54ac0bb260`. +
+Triagem do maestro: o banco exclusivo `detran_r21_task3` foi restaurado da fixture canônica antes da reexecução conjunta TEAT/BOAT/R21. Exit 0, 3 arquivos e 50 testes verdes; log `/tmp/r21-task3-e2e-fresh.log`. A falha anterior era `sensor-error` por chaves determinísticas deixadas por uma execução anterior da suíte BOAT; nenhum teste existente foi alterado.
diff --git a/work/rounds/R-0021/reports/UPSTREAM-ISSUES.md b/work/rounds/R-0021/reports/UPSTREAM-ISSUES.md
new file mode 100644
index 00000000..4fb248c8
--- /dev/null
+++ b/work/rounds/R-0021/reports/UPSTREAM-ISSUES.md
@@ -0,0 +1,34 @@
+# R-0021 — registro dos requisitos STYNX em GitHub issues +
+Papel ativo: Architect. O Owner solicitou explicitamente, durante a execução desta rodada: “registre todos os requisitos para o stynx upstream em GitHub issues”. +
+Foram publicados **76 requisitos UPS-*** em **18 issues de área**, mais um índice. A verificação remota confirmou os corpos publicados, os 76 checklists individuais e todos os links do índice. Nenhum código ou arquivo do repositório irmão STYNX foi alterado. Registro de requisito não constitui conformidade ou implementação upstream. +
+Índice: [STYNX #289](https://github.com/stynx-nyx/stynx/issues/289). +
+| Área | IDs | Issue |
+| --- | --- | --- |
+| TEN | UPS-TEN-01…UPS-TEN-06 | [#290](https://github.com/stynx-nyx/stynx/issues/290) |
+| SSE | UPS-SSE-01…UPS-SSE-10 | [#291](https://github.com/stynx-nyx/stynx/issues/291) |
+| NGSSE | UPS-NGSSE-01…UPS-NGSSE-10 | [#292](https://github.com/stynx-nyx/stynx/issues/292) |
+| AUTHZ | UPS-AUTHZ-01…UPS-AUTHZ-07 | [#293](https://github.com/stynx-nyx/stynx/issues/293) |
+| SES | UPS-SES-01…UPS-SES-03 | [#294](https://github.com/stynx-nyx/stynx/issues/294) |
+| JOB | UPS-JOB-01…UPS-JOB-04 | [#295](https://github.com/stynx-nyx/stynx/issues/295) |
+| TXN | UPS-TXN-01…UPS-TXN-05 | [#296](https://github.com/stynx-nyx/stynx/issues/296) |
+| IFM | UPS-IFM-01…UPS-IFM-03 | [#297](https://github.com/stynx-nyx/stynx/issues/297) |
+| NGERR | UPS-NGERR-01…UPS-NGERR-04 | [#298](https://github.com/stynx-nyx/stynx/issues/298) |
+| SHELL | UPS-SHELL-01…UPS-SHELL-04 | [#299](https://github.com/stynx-nyx/stynx/issues/299) |
+| TEST | UPS-TEST-01…UPS-TEST-04 | [#300](https://github.com/stynx-nyx/stynx/issues/300) |
+| HOOK | UPS-HOOK-01…UPS-HOOK-02 | [#301](https://github.com/stynx-nyx/stynx/issues/301) |
+| CAL | UPS-CAL-01…UPS-CAL-02 | [#302](https://github.com/stynx-nyx/stynx/issues/302) |
+| NGIDEM | UPS-NGIDEM-01 | [#303](https://github.com/stynx-nyx/stynx/issues/303) |
+| CLI | UPS-CLI-01 | [#304](https://github.com/stynx-nyx/stynx/issues/304) |
+| SIG | UPS-SIG-01…UPS-SIG-04 | [#305](https://github.com/stynx-nyx/stynx/issues/305) |
+| OBX | UPS-OBX-01…UPS-OBX-02 | [#306](https://github.com/stynx-nyx/stynx/issues/306) |
+| OFS | UPS-OFS-01…UPS-OFS-04 | [#307](https://github.com/stynx-nyx/stynx/issues/307) | +
+As issues incorporam OD-S15-01, os requisitos confirmados na adenda A1, a compatibilidade offline vinculante e a lacuna de contexto/RLS de despacho e ACK registrada em CTG-0001 L-05. Todos os níveis foram normalizados para MUST conforme a decisão vigente. As migrações de assinatura, outbox e offline-sync continuam integralmente em R-0022. +
+Fonte: `work/campaigns/C-0002-stynx-upstream-spec.md`, snapshot SHA-256 `291f18da6d2cc9d381c855d45bca3d61da59bbb424b93523bdde195b0137383d`. As issues transcrevem o conteúdo aplicável porque a publicação da adenda A1 no branch principal depende do PR desta rodada. Implementações upstream já existentes deverão anexar release publicada, símbolos reais, testes e desvios por ID antes de declarar conformidade. +
+Publicação e leitura de conferência realizadas por Astra em 2026-09-28 UTC, sob a autorização adicional do Owner. A ação não altera os contratos de implementação ou a sequência dos workers R-0021.
diff --git a/work/rounds/R-0021/reports/bootstrap.md b/work/rounds/R-0021/reports/bootstrap.md
new file mode 100644
index 00000000..15653efd
--- /dev/null
+++ b/work/rounds/R-0021/reports/bootstrap.md
@@ -0,0 +1,18 @@
+Papel: Architect (preparação), operações de ambiente registradas separadamente.
+Base: e47a68014ffdd24e1f9da03c4fc9e1b78ecf381b. Worktree gerenciada stynx-canonical.
+pnpm install --frozen-lockfile: exit 0 (log temporário /tmp/r21-bootstrap-install.log).
+pnpm exec devai doctor --repo-root . --format human: exit 0, todos os itens OK, DEVAI 1.5.6; CLIs Codex 0.157.1 e Claude 2.1.283.
+round plan --scaffold: exit 2 ROUND_ALREADY_EXISTS; o runtime usa work/rounds/R-0021 já existente, não sobrescrever. Plano/autorização preparados mantidos.
+Baseline pnpm check: ainda não concluída; será registrado resultado pelo preparador ou maestro. Nenhuma prova de caracterização foi executada.
+Nenhum código de produto/teste alterado nesta preparação. +
+Prompt-review: ciclo1 REVIEW; ciclo2 transporte inválido; ciclo3 PASS aceito, sem achados. 15 tasks validadas pelo schema instalado e hashes de todos os prompts conferidos.
+Baseline pnpm check ainda em andamento na preparação (tool session90578, log /tmp/r21-baseline-check.log). Maestro pode preparar bancos sem executar check concorrente; aguardar /tmp/r21-baseline.done antes de disparar Inspectors. Esse marcador será escrito pelo preparador com o exit code real. +
+## Continuação pelo maestro Sol +
+O preparador concluiu o baseline `pnpm check` com exit code **0** em `/tmp/r21-baseline.done`. O log completo foi preservado em `reports/baseline-check.log` (1650 linhas); nenhum segundo `pnpm check` foi iniciado durante a preparação. O maestro verificou `pnpm exec devai evidence verify --scope chain --repo-root . --show-head --format human`: exit 0, head `25f94219921c2f37f927aa55c2aa98d97e96502d753be669134e6245c1b429d1`. `pnpm --filter @detran/ch-clinical-reports build` antes do despacho: exit 0 (`/tmp/r21-clinical-build-pre.log`). `git fetch origin main`: exit 0; base e `origin/main` coincidem no despacho. +
+PostGIS descartável exclusivo `detran-r21-postgis` (container `a9abf78080db`) na porta local 59640. `pnpm backend:test:prepare-legacy` com destino fixo do runtime `detran_r7_ctg1_a2` nesse container: exit 0, 20 casos. Clones isolados `detran_r21_task2`, `detran_r21_task3`, `detran_r21_ci` criados após DDL/seed canônicos; cada um verificado com 20 casos e PostGIS 3.4.3. Os workers recebem respectivamente `/tmp/r21-task2-env.sh` e `/tmp/r21-task3-env.sh` com variáveis explícitas. Os arquivos de ambiente têm modo 600 e ficam fora do repositório. O runtime `backend:test:ci` exige literalmente `detran_r7_ctg1_a2`; o maestro o executará somente no container da rodada, sem concorrência com os bancos dos workers. +
+Baseline concluída: pnpm check exit 0 em 2026-09-28T01:35:24.046270+00:00. Log integral versionável reports/baseline-check.log; sha256 002039a261be0d4d1f45eae77dc63d91af86ee79a8f6bb030e354bdea0bf7144. Código de produto/manifests mantidos na baseline1.3.1; somente artefatos de preparação foram corrigidos durante a execução. Nenhuma atestação RC/exact-tree inferida desta baseline.
diff --git a/work/rounds/R-0021/reviews/prompt-review-1.bridge.json b/work/rounds/R-0021/reviews/prompt-review-1.bridge.json
new file mode 100644
index 00000000..214a18ad
--- /dev/null
+++ b/work/rounds/R-0021/reviews/prompt-review-1.bridge.json
@@ -0,0 +1,11 @@
+{

- "family": "claude",
- "model": "claude-opus-5-5",
- "prompt": "work/rounds/R-0021/reviews/prompt-review-1.md",
- "prompt_sha256": "85f23e3b3f81f948c9b54f0288b7a34770e8522045bfa2cd99be4253cbdc39d6",
- "output": "work/rounds/R-0021/reviews/prompt-review-1.json",
- "output_sha256": "8cd784dc14a98504ad0b75f1ae92cc7ac731194366a3a1ad39b2c00cf2b52d48",
- "cwd": "/Users/aarusso/.codex/worktrees/stynx-canonical/detran",
- "started_at": "2026-09-28T01:20:52Z",
- "ended_at": "2026-09-28T01:25:46Z"
  +}
  diff --git a/work/rounds/R-0021/reviews/prompt-review-1.json b/work/rounds/R-0021/reviews/prompt-review-1.json
  new file mode 100644
  index 00000000..bbdb5ed5
  --- /dev/null
  +++ b/work/rounds/R-0021/reviews/prompt-review-1.json
  @@ -0,0 +1,87 @@
  +{
- "mode": "prompt-review",
- "round": "R-0021",
- "verdict": "REVIEW",
- "findings": [
- {
-      "severity": "high",
-      "item": 4,
-      "file": "work/rounds/R-0021/contracts/CTG-0001.md",
-      "line": 126,
-      "claim": "The command `pnpm --filter @detran/shared test --passWithNoTests=false` always fails. `test` is a pnpm built-in command, so pnpm parses the flag itself and aborts with `ERROR Unknown option: 'passWithNoTests'`. I reproduced this in the worktree. The list in §4 is the fixed before/after list for C-02-12, so the 1.3.1 baseline can never be recorded with this command.",
-      "fix": "Change it to `pnpm --filter @detran/shared run test --passWithNoTests=false`. The form with `run` forwards the arguments to vitest; `pnpm --filter @detran/shared run test` gave 13 files and 430 tests passing. Use the same form in TASK-0002.md/json."
- },
- {
-      "severity": "high",
-      "item": 4,
-      "file": "work/rounds/R-0021/prompts/TASK-0002.md",
-      "line": 81,
-      "claim": "The TASK-0002 acceptance commands (TASK-0002.md lines 81-88 and the same list in tasks/TASK-0002.json) differ from the list in CTG-0001 §4 (lines 125-129). (a) `--passWithNoTests=false` is missing from ch-clinical-reports, shared and app test:unit, even though every vitest config sets `passWithNoTests: true`, so an empty collection counts as green. (b) The e2e command runs only r21-trust-profiles and leaves out runtime-profiles.e2e.spec.ts and rait-case-commands.e2e.spec.ts, which the contract names as existing proof for C-01-04. (c) The integration command leaves out pec-pipeline-persistence. The Inspector therefore cannot prove green on the existing suites that the criteria map to, and after the pin the maestro would be repeating a list the worker never ran. TASK-0003.md line 88 and tasks/TASK-0003.json have the same gap: `ops-offline-sync test:integration` and `test:unit` run without `--passWithNoTests=false`.",
-      "fix": "Copy CTG-0001 §4 lines 125-129 exactly into the TASK-0002 prompt and JSON, and lines 130-132 into TASK-0003, with `--passWithNoTests=false` on every vitest command and `run test` for shared. Keep `pnpm typecheck`. Recompute sha256/pc_id in compositions.json."
- },
- {
-      "severity": "high",
-      "item": 4,
-      "file": "work/rounds/R-0021/prompts/TASK-0002.md",
-      "line": 85,
-      "claim": "`pnpm --filter @detran/ch-juntas test` fails on the clean baseline. Its output is `Failed to resolve entry for package \"@detran/ch-clinical-reports\"` from `src/junta-signing.adapter.ts:2`, because there is no dist build and the juntas vitest config has no alias. No CI suite runs this command (it is not in backend:test:unit), and CTG-0001 line 119 forbids recompiling or installing to fix imports. The Inspector would therefore be blocked on an 'exit 0' criterion that has nothing to do with the characterization.",
-      "fix": "Either remove ch-juntas from the acceptance commands in TASK-0002.md/json (CTG-0001 §4 does not list it) and keep JuntaSigningAdapter covered through the clinical-reports suites, or add an explicit maestro prerequisite in the prompt and in the contract §4: `pnpm --filter @detran/ch-clinical-reports build` under lock before the baseline, repeated identically after the pin."
- },
- {
-      "severity": "high",
-      "item": 2,
-      "file": "work/rounds/R-0021/prompts/TASK-0004.md",
-      "line": 11,
-      "claim": "The Engineer's closed reading list leaves out `work/rounds/R-0021/contracts/stynx-manifests.json`. CTG-0002 §3 (line 64) says that file is the source of the closed list: which 11 manifests are manual-source and which 48 come from blueprints:generate. The write path on line 32 ('Manifestos de fonte listados em contracts/CTG-0002.md') points to a contract that lists no paths. The prompt also does not say who runs `pnpm blueprints:generate`. That operation is the exclusive `blueprint-generation` resource in execution.json and a single regeneration checkpoint under README §4.13. The prompt also does not say which generated paths may appear in the diff.",
-      "fix": "Add `work/rounds/R-0021/contracts/stynx-manifests.json` to the reading list. In the write paths of TASK-0004.md and execution.json, replace the free-text item with 'the 11 manual-source paths from stynx-manifests.json'. State that the maestro runs `pnpm blueprints:generate` under the lock at the dependency-ready checkpoint (or explicitly grants the lock to the worker). State that the only generated diff allowed is the 48 generation paths in stynx-manifests.json; any other change is reported, not edited."
- },
- {
-      "severity": "high",
-      "item": 8,
-      "file": "work/rounds/R-0021/execution.json",
-      "line": 34,
-      "claim": "Astra's preparation changed files that belong to no task's write_paths: work/campaigns/C-0002-stynx-upstream-spec.md (A1 addendum), docs/meta/knowledge-base/open-decisions-rait.md (OD-R21-01…06), work/campaigns/C-0002-consolidacao.md, and work/rounds/R-0022/{plan.md,prompts/00-maestro.md}. TASK-0001 (write_paths here and in TASK-0001.md lines 20-24) only covers contracts/inputs/report, even though its target_modules include MOD-upstream-spec and MOD-kb-open-decisions. The maestro is told to 'add somente caminhos da tarefa' (00-maestro.md:49). Following that rule, the upstream addendum and the canonical OD registry would be left out of the CTG-0001 PR, or would enter it with no role, review or evidence attributed. The upstream addendum is an A1 deliverable.",
-      "fix": "Add those five paths to the TASK-0001 write_paths in execution.json and to the 'Pode tocar' section of TASK-0001.md, record them in reports/TASK-0001.md as Architect/Astra deliverables, and state in 00-maestro.md (CTG-0001) that they go into the CTG-0001 PR and delivery-review. Update the TASK-0001 hash in compositions.json."
- },
- {
-      "severity": "low",
-      "item": 2,
-      "file": "work/rounds/R-0021/contracts/CTG-0001.md",
-      "line": 73,
-      "claim": "C-01-10 requires 'o padrão database.tx sob role_app_backend do harness existente'. `database.tx` exists only in the offline harness, which is not in TASK-0002's reading list. The app integration specs use their own executor instead (`set local role role_app_backend` plus `set_config app.tenant_id`, as in pec-pipeline-persistence). TASK-0002 also does not read rait-case-commands.e2e.spec.ts, report-lifecycle.service.ts, encounter-closure.service.ts, or the vitest.config/package.json of clinical-reports and juntas that the contract cites.",
-      "fix": "Rewrite the reference as 'padrão executor de backend/app/tests/integration/pec-pipeline-persistence.integration.spec.ts' and add the missing files to the closed reading list of TASK-0002.md."
- },
- {
-      "severity": "low",
-      "item": 6,
-      "file": "work/rounds/R-0021/prompts/TASK-0015.md",
-      "line": 33,
-      "claim": "The C-02-07 test (default cwd) will probably spawn with cwd set to the tmpdir fixture. From there, `--import tsx` resolves relative to the cwd and fails outside the repository. That would be a harness error, not the expected RED.",
-      "fix": "Tell the Inspector to pass the absolute path to tsx (`import.meta.resolve('tsx')` from the repository) in `--import`."
- },
- {
-      "severity": "low",
-      "item": 5,
-      "file": "work/rounds/R-0021/prompts/TASK-0004.md",
-      "line": 40,
-      "claim": "Removing dead dependencies (@stynx-nyx/audit in backend/app, 4 in boat/mobile) changes product manifests beyond the pin. The import search it requires is an open search, outside the closed reading list. CTG-0001 line 164 treats these dependencies as inventory only.",
-      "fix": "Either state that removal is optional and needs a specific closed search command (rg over the listed paths) plus green build/typecheck and a justification in the report, or keep the dependencies pinned at 1.4.0 and leave them as inventory for R-0022."
- },
- {
-      "severity": "low",
-      "item": 3,
-      "file": "work/rounds/R-0021/tasks/TASK-0014.json",
-      "line": 13,
-      "claim": "target_modules includes MOD-upstream-spec, but the TASK-0014 write_paths do not include the upstream spec.",
-      "fix": "Remove MOD-upstream-spec from TASK-0014 or add the path along with the reason."
- }
- ],
- "notes": [
- "Reviewed with the rubric's constraints: the Owner A1 decisions (migrations moved to R-0022, notifications with OD-P40, close with `fail`, no seal, 4 cycles, 2.25M) were not treated as pending. The cancelled tasks were not held against the plan.",
- "Checked and OK: the sha256 and pc_id of all 15 prompts match compositions.json; `prettier --check work/rounds/R-0021` passes; all tasks/*.json validate against law/schemas/task.schema.json, which is identical to the one installed with DEVAI 1.5.6.",
- "Confirmed facts: the 59 manifests in stynx-manifests.json cover every tracked package.json that declares @stynx-nyx outside dist (48 generated, 11 manual; the only other matches are ng-package.json files, not manifests). generate.mjs:370-371 contains 1.3.1. Forwarding `--passWithNoTests=false` works through test:unit/test:e2e scripts and makes an empty collection fail. The baselines for clinical-reports test:unit (23), shared (430), ops-offline-sync test:unit (33) and app pec-renach (8) are green.",
- "Dependencies in execution.json and locks are consistent: 0002 and 0003 use separate databases, 0015 runs before 0004, and 0014 runs after the active groups. The maestro correctly covers the exclusive backend:test:ci, the frozen open-PR branch, round close without seal, and transferred criteria as `fail`.",
- "Low: 00-maestro.md:26 should say explicitly that the exclusive databases get DDL and seed (as prepare-legacy does) before the e2e runs of TASK-0002/0003.",
- "After the fixes, recompute the TASK-0001/0002/0003/0004 hashes in compositions.json. Cycle 2 is limited to the items above."
- ]
  +}
  diff --git a/work/rounds/R-0021/reviews/prompt-review-1.md b/work/rounds/R-0021/reviews/prompt-review-1.md
  new file mode 100644
  index 00000000..bc92f694
  --- /dev/null
  +++ b/work/rounds/R-0021/reviews/prompt-review-1.md
  @@ -0,0 +1,25 @@
  +# Prompt-review R-0021 — ciclo 1
-

+Papel: Auditor. Modelo exigido Opus 5.5, família oposta ao preparador Astra/maestro Sol. Somente leitura. Avalie plano e todos os prompts ativos quanto à execução segura e completa do escopo Owner A1. Não implemente nem modifique arquivos. Responda SOMENTE JSON no schema abaixo. +
+## Autoridade e leitura fechada +
+Leia `work/rounds/R-0021/AUTHORIZATION.md`, `plan.md` (A1 prevalece sobre proposta histórica), `execution.json`, `contracts/CTG-0001.md`, `contracts/CTG-0002.md`, `contracts/stynx-manifests.json`, `tasks/*.json`, `compositions.json`, todos os `prompts/*.md` (0005…0013 são canceladas, não execução). Leia método `docs/meta/agents/orchestra/README.md` §§4–9 e `reviewer-prompt.template.md`, `AGENTS.md`, manuais de papéis somente para conflitos de autoridade. Para verificar comandos use package.json raiz e manifests correspondentes; para coerência das caracterizações inspecione os arquivos reais e testes citados pelos contratos. Confira adenda A1 da spec upstream e adendas R22/campanha e registro canônico OD-R21-01…06. Não ler inputs/00-maestro-before-A1.md como instrução. +
+Owner aprovou: preparar Astra e executar Sol/high; caracterização +pin1.4.0+gate+handoff; todas as migrações signature/outbox/offline transferidas R22, notificações produtorOD-P40; close com critérios transferidos fail, sem seal; 4ciclos/item,2.25Mentrada/janela. Não tratar essas decisões como pendentes nem reprovar por falta das migrações canceladas. TASK0001 está preparada pelo Architect Astra; só Inspectors escrevem testes; só Engineer implementa verificador. TASK0015 RED antes CLI é deliberado; depois todos verdes. +
+## Rubrica +
+1. Papéis, fronteiras e modelos exatos coerentes; Engineer não altera testes.
+2. Leitura fechada e suficiente, arquivos/definições reais; nenhuma busca aberta/valor inventado.
+3. Locks e dependências completos; banco e gate global não concorrem; branch de PR aberto congelado.
+4. Critérios/comandos executáveis com coleta efetiva; baseline1.3.1 antes pin, mesmos testes depois.
+5. Nenhum protocolo/fail-closed/RLS enfraquecido; produto permanece inalterado salvo pin.
+6. Testes negativos do verificador precedem implementação, generator vs manifests gerados respeitado.
+7. Diferença entre entregável adiado e cumprido preservada no closure; seal não prometido.
+8. Schema TASK instalado e hashes pós-format compatíveis; materialização e evidência por papéis.
+9. Identificar TODOS os high corrigíveis no primeiro ciclo, com file/line e correção concreta. +
+PASS = nenhum high; REVIEW = high corrigível sem contrariar decisões; FAIL = contradição canônica/constitucional/Owner ou violação de fronteira. Notas low não bloqueiam. Próximos ciclos ficam restritos aos itens corrigidos. +
+Saída exata: {"mode":"prompt-review","round":"R-0021","verdict":"PASS|REVIEW|FAIL","findings":[{"severity":"high|low","item":1,"file":"path","line":1,"claim":"...","fix":"..."}],"notes":["..."]}.
diff --git a/work/rounds/R-0021/reviews/prompt-review-2.md b/work/rounds/R-0021/reviews/prompt-review-2.md
new file mode 100644
index 00000000..ce0d7ea3
--- /dev/null
+++ b/work/rounds/R-0021/reviews/prompt-review-2.md
@@ -0,0 +1,7 @@
+# R-0021 prompt-review ciclo 2 — somente correções +
+Papel Auditor; Opus 5.5; somente leitura. Leia reviews/prompt-review-1.json e confira cada achado contra os arquivos atuais. Autoridade Owner A1 inalterada. Não reabra texto inalterado salvo FAIL canônico, explicitando motivo de não descoberta anterior. Responda somente JSON {mode:"prompt-review",round:"R-0021",verdict:"PASS|REVIEW|FAIL",findings:[{severity:"high|low",item:1,file:"...",line:1,claim:"...",fix:"..."}],notes:[]}. +
+Correções: H1 run test para shared; H2 listas CTG0001 §4 copiadas exatamente para TASK0002/0003 JSON e prompts, com false e typecheck; H3 juntas mantido com build clinical-reports explícito pelo maestro antes/depois; H4 inventory leitura,11paths manuais enumerados e geração48 exclusivamente maestro; H5 cinco docs atribuídos TASK0001/relatório/execution/maestroPR. Lows: executor SQL app e leituras faltantes incluídos; tsx URL absoluta no harness; dependências todas preservadas (encontrado import angular-i18n em boat-pages.ts); lock MOD-upstream-spec removido de TASK0014; DDL/seed antes de testes explicitado no maestro. Hashes atualizados após prettier. +
+Arquivos: work/rounds/R-0021/contracts/CTG-0001.md, CTG-0002.md, stynx-manifests.json; execution.json; prompts/00-maestro.md e TASK0001/0002/0003/0004/0015 (nomes TASK-000n.md); tasks/*.json; compositions.json; reports/TASK-0001.md. Use os caminhos reais e faça checagens focais necessárias. Não rode gate global concorrente: baseline pnpm check está em andamento no mesmo checkout, em blueprints:check.
diff --git a/work/rounds/R-0021/reviews/prompt-review-2.transport.log b/work/rounds/R-0021/reviews/prompt-review-2.transport.log
new file mode 100644
index 00000000..18336754
--- /dev/null
+++ b/work/rounds/R-0021/reviews/prompt-review-2.transport.log
@@ -0,0 +1,7 @@
+[error] stdin: SyntaxError: The input should contain exactly one expression, but the first expression is followed by the unexpected character `p`. (2:302)
+[error] 1 | ``json
+[error] > 2 | {"mode":"prompt-review","round":"R-0021","verdict":"PASS","findings":[],"notes":["Cycle 2 was limited to the cycle-1 findings. I did not reopen unchanged text: no new canonical FAIL was found. Owner A1 authority was treated as closed.","H1 resolved: CTG-0001.md:125 and TASK-0002.md:94/json both use `pnpm --filter @detran/shared run test --passWithNoTests=false`.","H2 resolved: the TASK-0002.md commands (lines 93-98) and the TASK-0002.json acceptance_commands match CTG-0001 §4 lines 124-129 exactly. The TASK-0003 prompt and json match lines 130-132. Every vitest command carries `--passWithNoTests=false`, and both tasks keep `pnpm typecheck`.","H3 resolved: juntas stays in the lists with `run test`. The build `pnpm --filter @detran/ch-clinical-reports build` is assigned to the maestro under lock, before TASK-0002 and again after the pin, in three places: CTG-0001:119, TASK-0002.md:81-83 and 00-maestro.md:31. clinical-reports has a tsconfig.build.json and currently has no dist, which is consistent with the need for this prerequisite. I did not run the build because this review is read-only.","H4 resolved: TASK-0004 reads stynx-manifests.json (line 26). The 11 manual-source paths in execution.json/TASK-0004 match exactly the entries with mode=manual-source; the root package.json is an extra path, allowed for scripts. generated_paths_by_maestro matches exactly the 48 entries with mode=blueprints:generate. Generation and install are exclusive to the maestro (TASK-0004.md:71-73, 00-maestro.md:33), and any diff outside the 48 paths is a blocker.","H5 resolved: the five docs are in the TASK-0001 write_paths in execution.json and in TASK-0001.md:26-30, recorded in reports/TASK-0001.md:54-61, and included in the CTG-0001 PR, delivery-review and evidence (00-maestro.md:31).","Low C-01-10 resolved: TASK-0002 now reads rait-case-commands.e2e.spec.ts. That spec is where the app's `database.tx` lives, under role_app_backend (lines 365-399), so the contract reference now resolves inside the closed reading list. The other missing reads were also added: report-lifecycle, encounter-closure, and the package.json/vitest.config of clinical-reports and juntas.","Low tsx resolved: TASK-0015.md:37 sets `import.meta.resolve('tsx')` with an absolute URL and keeps the fixture cwd out of resolution. Low dependencies resolved: TASK-0004.md:52 preserves every dependency. I confirmed the import `@stynx-nyx/angular-i18n` at apps/boat/mobile/src/lib/pages/boat-pages.ts:2. Low TASK-0014 resolved: target_modules is now [MOD-adr, MOD-docs]. Low DDL/seed resolved: 00-maestro.md:26.","Integrity: for all 15 prompts, the sha256, pc_id, and prompt_composition_id in tasks/*.json and in executor match compositions.json. reports/TASK-0001.md differs from prettier by one blank line before the list (line 56), but `work/rounds/*/reports/` is in .prettierignore, so it does not affect format:check.","Cosmetic, not blocking: there are stray blank lines inside lists in TASK-0001.md:25, TASK-0002.md:59/74 and TASK-0004.md:25. TASK-0004.md:52 says 'usando generator para manifestos gerados'; the checkpoint at lines 71-73 settles that the maestro is the one who runs it.","No global gate was run. The only checks were read-only file inspections, hash verification and a local prettier check."]}
+[error]     |                                                                                                                                                                                                                                                                                                              ^
+[error]   3 | ``
+[error] 4 |
+bridge: saída do reviewer não é JSON válido: work/rounds/R-0021/reviews/prompt-review-2.json
diff --git a/work/rounds/R-0021/reviews/prompt-review-3.bridge.json b/work/rounds/R-0021/reviews/prompt-review-3.bridge.json
new file mode 100644
index 00000000..1915f789
--- /dev/null
+++ b/work/rounds/R-0021/reviews/prompt-review-3.bridge.json
@@ -0,0 +1,11 @@
+{

- "family": "claude",
- "model": "claude-opus-5-5",
- "prompt": "work/rounds/R-0021/reviews/prompt-review-3.md",
- "prompt_sha256": "09927a93bec17902c5dbde2ffc6037c32074bfb059209ee9b03cb848975e9856",
- "output": "work/rounds/R-0021/reviews/prompt-review-3.json",
- "output_sha256": "f7790efcca7857fac92aba74b3736fd285f59f78bf61cb686aa3f14427897fb6",
- "cwd": "/Users/aarusso/.codex/worktrees/stynx-canonical/detran",
- "started_at": "2026-09-28T01:31:38Z",
- "ended_at": "2026-09-28T01:32:10Z"
  +}
  diff --git a/work/rounds/R-0021/reviews/prompt-review-3.json b/work/rounds/R-0021/reviews/prompt-review-3.json
  new file mode 100644
  index 00000000..83eb34b4
  --- /dev/null
  +++ b/work/rounds/R-0021/reviews/prompt-review-3.json
  @@ -0,0 +1,17 @@
  +{
- "mode": "prompt-review",
- "round": "R-0021",
- "verdict": "PASS",
- "findings": [],
- "notes": [
- "The cycle-2 verdict, taken from prompt-review-2.transport.log, stands. The only issue in that log was the Markdown fence. Its content was PASS with no findings.",
- "Integrity: all 15 prompts recompute to the sha256 and pc_id in compositions.json. The prompt_composition_id in each tasks/_.json matches its pc_id. The prompts, contracts, execution.json and reports/TASK-0001.md were last modified at 22:27:39, and tasks/_.json and compositions.json at 22:28:15. The transport log was written at 22:31:38, so nothing changed after the review.",
- "H1 fixed: CTG-0001.md:125 and TASK-0002.md:94 now use pnpm --filter @detran/shared run test --passWithNoTests=false.",
- "H2 fixed: TASK-0002.md:93-98 matches CTG-0001 lines 124-129, and TASK-0003.md:87-89 matches lines 130-132. Every vitest command carries --passWithNoTests=false.",
- "H3 fixed: juntas uses run test. The maestro runs the ch-clinical-reports build under lock before TASK-0002 and again after the pin, as stated in CTG-0001:119, TASK-0002.md:83 and 00-maestro.md:31.",
- "H4 fixed: TASK-0004.md:26 reads stynx-manifests.json. TASK-0004.md:73 makes blueprints:generate and install maestro-only and allows only the 48 generated paths. execution.json has generated_paths_by_maestro.",
- "H5 fixed: execution.json assigns all five docs to TASK-0001, and 00-maestro.md:31 includes them in the CTG-0001 PR, delivery-review and evidence.",
- "Lows fixed: TASK-0002 reads rait-case-commands.e2e.spec.ts (line 60). TASK-0015.md:37 passes the absolute tsx URL from import.meta.resolve. Dependencies are preserved. TASK-0014 target_modules is [MOD-adr, MOD-docs]. 00-maestro.md:26 puts DDL and seed before the first e2e/integration run.",
- "No global gate was run and no files were modified. The only checks were file reads and hash recomputation."
- ]
  +}
  diff --git a/work/rounds/R-0021/reviews/prompt-review-3.md b/work/rounds/R-0021/reviews/prompt-review-3.md
  new file mode 100644
  index 00000000..4692b9e0
  --- /dev/null
  +++ b/work/rounds/R-0021/reviews/prompt-review-3.md
  @@ -0,0 +1,9 @@
  +# R-0021 — confirmação de formato do veredito
-

+Papel Auditor, Opus 5.5. Somente leitura. A revisão ciclo 2 aprovou todas as correções, mas produziu uma cerca Markdown, que a ponte corretamente rejeitou. O retorno integral preservado está em work/rounds/R-0021/reviews/prompt-review-2.transport.log. Não existe arquivo JSON/veredito aceito do ciclo 2. +
+Leia esse retorno e os inputs de work/rounds/R-0021/reviews/prompt-review-2.md. Confirme que os arquivos revisados e hashes atuais continuam correspondentes e que nenhuma correção ainda está pendente. Escopo é somente os achados de reviews/prompt-review-1.json; não reabra conteúdo inalterado. Nenhum arquivo de contrato/prompt/tarefa/composition mudou após a revisão ciclo 2. Baseline pnpm check continua em andamento; não rodar gates globais. +
+Responda um objeto JSON curto e válido, sem blocos de código, cercas Markdown ou texto fora do objeto. A primeira posição da resposta deve ser o caractere { e a última }. Não inclua caracteres de crase. Não copie este prompt, apenas emita seu próprio veredito. Use propriedades com aspas duplas. +
+Schema de saída: mode = prompt-review, round = R-0021, verdict = PASS/REVIEW/FAIL, findings = array, notes = array de strings. Se PASS, findings vazio e notes com confirmação sucinta dos cinco high e lows reparados. Essa resposta será validada pela ponte e ancorada aos hashes. Não modifique arquivos.
diff --git a/work/rounds/R-0021/tasks/TASK-0001.json b/work/rounds/R-0021/tasks/TASK-0001.json
new file mode 100644
index 00000000..527e491c
--- /dev/null
+++ b/work/rounds/R-0021/tasks/TASK-0001.json
@@ -0,0 +1,44 @@
+{

- "schemaVersion": "2.0.0",
- "id": "TASK-0001",
- "round_id": "R-0021",
- "status": "pre_merge",
- "discipline": "architect",
- "discipline_specialization": "architect-blueprint",
- "title": "Consolidar invent\u00e1rio, contratos e requisitos upstream",
- "description": "Consolidar invent\u00e1rio, contratos e requisitos upstream conforme AUTHORIZATION A1 e contratos fechados.",
- "lifecycle": "supported",
- "target_modules": [
- "MOD-r21-contracts",
- "MOD-upstream-spec",
- "MOD-kb-open-decisions"
- ],
- "target_substrates": ["F1", "F5"],
- "target_invariants": [],
- "coupled_task_group": "CTG-0001",
- "coupled_pipeline_position": "architect",
- "upstream_task_id": null,
- "db_isolation": "database",
- "iteration_count": 0,
- "max_iterations": 2,
- "priority": 1,
- "tags": ["r21", "owner-a1"],
- "branch": "orchestra/stynx-canonical",
- "worktree_id": "WT-stynx-canonical",
- "prompt_composition_id": "PC-0b3d3888628aac2b",
- "acceptance_commands": [["pnpm", "format:check"]],
- "created_at": "2026-09-28T01:17:11.018441+00:00",
- "executor": {
- "kind": "agent",
- "runtime": "codex-cli",
- "model": "gpt-6-astra",
- "effort": "high",
- "selection": {
-      "mode": "exact",
-      "registry_id": "gpt-6-astra"
- },
- "prompt_composition_id": "PC-0b3d3888628aac2b",
- "max_iterations": 2,
- "capabilities": ["read", "local-write"]
- }
  +}
  diff --git a/work/rounds/R-0021/tasks/TASK-0002.json b/work/rounds/R-0021/tasks/TASK-0002.json
  new file mode 100644
  index 00000000..1c3b7f10
  --- /dev/null
  +++ b/work/rounds/R-0021/tasks/TASK-0002.json
  @@ -0,0 +1,93 @@
  +{
- "schemaVersion": "2.0.0",
- "id": "TASK-0002",
- "round_id": "R-0021",
- "status": "pre_merge",
- "discipline": "inspector",
- "discipline_specialization": "inspector-tests",
- "title": "Caracterizar assinatura, confian\u00e7a e RENACH",
- "description": "Caracterizar assinatura, confian\u00e7a e RENACH conforme AUTHORIZATION A1 e contratos fechados.",
- "lifecycle": "supported",
- "target_modules": ["MOD-r21-backend-characterization"],
- "target_substrates": ["F3"],
- "target_invariants": [],
- "coupled_task_group": "CTG-0001",
- "coupled_pipeline_position": "inspector",
- "upstream_task_id": "TASK-0001",
- "db_isolation": "database",
- "iteration_count": 0,
- "max_iterations": 2,
- "priority": 1,
- "tags": ["r21", "owner-a1"],
- "branch": "orchestra/stynx-canonical",
- "worktree_id": "WT-stynx-canonical",
- "prompt_composition_id": "PC-b9433d5c16171dca",
- "acceptance_commands": [
- [
-      "pnpm",
-      "--filter",
-      "@detran/ch-clinical-reports",
-      "test:unit",
-      "--passWithNoTests=false"
- ],
- [
-      "pnpm",
-      "--filter",
-      "@detran/shared",
-      "run",
-      "test",
-      "--passWithNoTests=false"
- ],
- [
-      "pnpm",
-      "--filter",
-      "@detran/ch-juntas",
-      "run",
-      "test",
-      "--passWithNoTests=false"
- ],
- [
-      "pnpm",
-      "--filter",
-      "@detran/app",
-      "test:unit",
-      "--passWithNoTests=false",
-      "src/pec-renach-transmission.spec.ts",
-      "src/r21-renach-characterization.spec.ts"
- ],
- [
-      "pnpm",
-      "--filter",
-      "@detran/app",
-      "test:e2e",
-      "--passWithNoTests=false",
-      "tests/e2e/runtime-profiles.e2e.spec.ts",
-      "tests/e2e/r21-trust-profiles.e2e.spec.ts",
-      "tests/e2e/rait-case-commands.e2e.spec.ts"
- ],
- [
-      "pnpm",
-      "--filter",
-      "@detran/app",
-      "test:integration",
-      "--passWithNoTests=false",
-      "tests/integration/pec-pipeline-persistence.integration.spec.ts",
-      "tests/integration/r21-renach-characterization.integration.spec.ts"
- ],
- ["pnpm", "typecheck"]
- ],
- "created_at": "2026-09-28T01:17:11.018441+00:00",
- "executor": {
- "kind": "agent",
- "runtime": "codex-cli",
- "model": "gpt-5.6-terra",
- "effort": "medium",
- "selection": {
-      "mode": "exact",
-      "registry_id": "gpt-5.6-terra"
- },
- "prompt_composition_id": "PC-b9433d5c16171dca",
- "max_iterations": 2,
- "capabilities": ["read", "local-write"]
- }
  +}
  diff --git a/work/rounds/R-0021/tasks/TASK-0003.json b/work/rounds/R-0021/tasks/TASK-0003.json
  new file mode 100644
  index 00000000..58f82516
  --- /dev/null
  +++ b/work/rounds/R-0021/tasks/TASK-0003.json
  @@ -0,0 +1,66 @@
  +{
- "schemaVersion": "2.0.0",
- "id": "TASK-0003",
- "round_id": "R-0021",
- "status": "pre_merge",
- "discipline": "inspector",
- "discipline_specialization": "inspector-tests",
- "title": "Caracterizar HTTP, transa\u00e7\u00f5es e RLS offline",
- "description": "Caracterizar HTTP, transa\u00e7\u00f5es e RLS offline conforme AUTHORIZATION A1 e contratos fechados.",
- "lifecycle": "supported",
- "target_modules": ["MOD-r21-offline-characterization"],
- "target_substrates": ["F3"],
- "target_invariants": [],
- "coupled_task_group": "CTG-0001",
- "coupled_pipeline_position": "inspector",
- "upstream_task_id": "TASK-0001",
- "db_isolation": "database",
- "iteration_count": 0,
- "max_iterations": 2,
- "priority": 1,
- "tags": ["r21", "owner-a1"],
- "branch": "orchestra/stynx-canonical",
- "worktree_id": "WT-stynx-canonical",
- "prompt_composition_id": "PC-06b320f2c7fcc807",
- "acceptance_commands": [
- [
-      "pnpm",
-      "--filter",
-      "@detran/ops-offline-sync",
-      "test:unit",
-      "--passWithNoTests=false"
- ],
- [
-      "pnpm",
-      "--filter",
-      "@detran/ops-offline-sync",
-      "test:integration",
-      "--passWithNoTests=false"
- ],
- [
-      "pnpm",
-      "--filter",
-      "@detran/app",
-      "test:e2e",
-      "--passWithNoTests=false",
-      "tests/e2e/teat-field-sync.e2e.spec.ts",
-      "tests/e2e/boat-crash-commands.e2e.spec.ts",
-      "tests/e2e/r21-offline-sync.e2e.spec.ts"
- ],
- ["pnpm", "typecheck"]
- ],
- "created_at": "2026-09-28T01:17:11.018441+00:00",
- "executor": {
- "kind": "agent",
- "runtime": "codex-cli",
- "model": "gpt-5.6-terra",
- "effort": "medium",
- "selection": {
-      "mode": "exact",
-      "registry_id": "gpt-5.6-terra"
- },
- "prompt_composition_id": "PC-06b320f2c7fcc807",
- "max_iterations": 2,
- "capabilities": ["read", "local-write"]
- }
  +}
  diff --git a/work/rounds/R-0021/tasks/TASK-0004.json b/work/rounds/R-0021/tasks/TASK-0004.json
  new file mode 100644
  index 00000000..c268f69c
  --- /dev/null
  +++ b/work/rounds/R-0021/tasks/TASK-0004.json
  @@ -0,0 +1,50 @@
  +{
- "schemaVersion": "2.0.0",
- "id": "TASK-0004",
- "round_id": "R-0021",
- "status": "queued",
- "discipline": "engineer",
- "discipline_specialization": "engineer-backend",
- "title": "Fixar STYNX 1.4.0 e integrar verificador",
- "description": "Fixar STYNX 1.4.0 e integrar verificador conforme AUTHORIZATION A1 e contratos fechados.",
- "lifecycle": "supported",
- "target_modules": [
- "MOD-deps-stynx-pin",
- "MOD-blueprints-generator",
- "MOD-root-scripts",
- "MOD-stynx-pin"
- ],
- "target_substrates": ["F2"],
- "target_invariants": [],
- "coupled_task_group": "CTG-0002",
- "coupled_pipeline_position": "engineer",
- "upstream_task_id": "TASK-0015",
- "db_isolation": "database",
- "iteration_count": 0,
- "max_iterations": 2,
- "priority": 1,
- "tags": ["r21", "owner-a1"],
- "branch": "orchestra/stynx-canonical",
- "worktree_id": "WT-stynx-canonical",
- "prompt_composition_id": "PC-3a56912b734e5eed",
- "acceptance_commands": [
- ["node", "--test", "tools/stynx-pin/tests/check.test.mjs"],
- ["pnpm", "verify:stynx-pin"],
- ["pnpm", "blueprints:check"],
- ["pnpm", "typecheck"]
- ],
- "created_at": "2026-09-28T01:17:11.018441+00:00",
- "executor": {
- "kind": "agent",
- "runtime": "codex-cli",
- "model": "gpt-6-luna",
- "effort": "medium",
- "selection": {
-      "mode": "exact",
-      "registry_id": "gpt-6-luna"
- },
- "prompt_composition_id": "PC-3a56912b734e5eed",
- "max_iterations": 2,
- "capabilities": ["read", "local-write"]
- }
  +}
  diff --git a/work/rounds/R-0021/tasks/TASK-0005.json b/work/rounds/R-0021/tasks/TASK-0005.json
  new file mode 100644
  index 00000000..10f3b3a3
  --- /dev/null
  +++ b/work/rounds/R-0021/tasks/TASK-0005.json
  @@ -0,0 +1,40 @@
  +{
- "schemaVersion": "2.0.0",
- "id": "TASK-0005",
- "round_id": "R-0021",
- "status": "cancelled",
- "discipline": "architect",
- "discipline_specialization": "architect-blueprint",
- "title": "Transferida a R-0022: CTG-0003",
- "description": "Cancelada nesta rodada por Owner A1; nunca despachar nem marcar como cumprida.",
- "lifecycle": "supported",
- "target_modules": ["MOD-r21-cancelled-0005"],
- "target_substrates": ["F1"],
- "target_invariants": [],
- "coupled_task_group": "CTG-0003",
- "coupled_pipeline_position": "architect",
- "upstream_task_id": null,
- "db_isolation": "database",
- "iteration_count": 0,
- "max_iterations": 2,
- "priority": 1,
- "tags": ["r21", "owner-a1"],
- "branch": "orchestra/stynx-canonical",
- "worktree_id": "WT-stynx-canonical",
- "prompt_composition_id": "PC-5dd975fdd5965cdc",
- "acceptance_commands": [["pnpm", "check"]],
- "created_at": "2026-09-28T01:17:11.018441+00:00",
- "executor": {
- "kind": "agent",
- "runtime": "codex-cli",
- "model": "gpt-6-sol",
- "effort": "high",
- "selection": {
-      "mode": "exact",
-      "registry_id": "gpt-6-sol"
- },
- "prompt_composition_id": "PC-5dd975fdd5965cdc",
- "max_iterations": 2,
- "capabilities": ["read", "local-write"]
- }
  +}
  diff --git a/work/rounds/R-0021/tasks/TASK-0006.json b/work/rounds/R-0021/tasks/TASK-0006.json
  new file mode 100644
  index 00000000..972f1b25
  --- /dev/null
  +++ b/work/rounds/R-0021/tasks/TASK-0006.json
  @@ -0,0 +1,40 @@
  +{
- "schemaVersion": "2.0.0",
- "id": "TASK-0006",
- "round_id": "R-0021",
- "status": "cancelled",
- "discipline": "inspector",
- "discipline_specialization": "inspector-tests",
- "title": "Transferida a R-0022: CTG-0003",
- "description": "Cancelada nesta rodada por Owner A1; nunca despachar nem marcar como cumprida.",
- "lifecycle": "supported",
- "target_modules": ["MOD-r21-cancelled-0006"],
- "target_substrates": ["F3"],
- "target_invariants": [],
- "coupled_task_group": "CTG-0003",
- "coupled_pipeline_position": "inspector",
- "upstream_task_id": null,
- "db_isolation": "database",
- "iteration_count": 0,
- "max_iterations": 2,
- "priority": 1,
- "tags": ["r21", "owner-a1"],
- "branch": "orchestra/stynx-canonical",
- "worktree_id": "WT-stynx-canonical",
- "prompt_composition_id": "PC-be627d4beaf26f07",
- "acceptance_commands": [["pnpm", "check"]],
- "created_at": "2026-09-28T01:17:11.018441+00:00",
- "executor": {
- "kind": "agent",
- "runtime": "codex-cli",
- "model": "gpt-5.6-terra",
- "effort": "medium",
- "selection": {
-      "mode": "exact",
-      "registry_id": "gpt-5.6-terra"
- },
- "prompt_composition_id": "PC-be627d4beaf26f07",
- "max_iterations": 2,
- "capabilities": ["read", "local-write"]
- }
  +}
  diff --git a/work/rounds/R-0021/tasks/TASK-0007.json b/work/rounds/R-0021/tasks/TASK-0007.json
  new file mode 100644
  index 00000000..d192f3c1
  --- /dev/null
  +++ b/work/rounds/R-0021/tasks/TASK-0007.json
  @@ -0,0 +1,40 @@
  +{
- "schemaVersion": "2.0.0",
- "id": "TASK-0007",
- "round_id": "R-0021",
- "status": "cancelled",
- "discipline": "engineer",
- "discipline_specialization": "engineer-backend",
- "title": "Transferida a R-0022: CTG-0003",
- "description": "Cancelada nesta rodada por Owner A1; nunca despachar nem marcar como cumprida.",
- "lifecycle": "supported",
- "target_modules": ["MOD-r21-cancelled-0007"],
- "target_substrates": ["F2"],
- "target_invariants": [],
- "coupled_task_group": "CTG-0003",
- "coupled_pipeline_position": "engineer",
- "upstream_task_id": null,
- "db_isolation": "database",
- "iteration_count": 0,
- "max_iterations": 2,
- "priority": 1,
- "tags": ["r21", "owner-a1"],
- "branch": "orchestra/stynx-canonical",
- "worktree_id": "WT-stynx-canonical",
- "prompt_composition_id": "PC-1492e45e6ea9a322",
- "acceptance_commands": [["pnpm", "check"]],
- "created_at": "2026-09-28T01:17:11.018441+00:00",
- "executor": {
- "kind": "agent",
- "runtime": "codex-cli",
- "model": "gpt-6-sol",
- "effort": "medium",
- "selection": {
-      "mode": "exact",
-      "registry_id": "gpt-6-sol"
- },
- "prompt_composition_id": "PC-1492e45e6ea9a322",
- "max_iterations": 2,
- "capabilities": ["read", "local-write"]
- }
  +}
  diff --git a/work/rounds/R-0021/tasks/TASK-0008.json b/work/rounds/R-0021/tasks/TASK-0008.json
  new file mode 100644
  index 00000000..4dd498b0
  --- /dev/null
  +++ b/work/rounds/R-0021/tasks/TASK-0008.json
  @@ -0,0 +1,40 @@
  +{
- "schemaVersion": "2.0.0",
- "id": "TASK-0008",
- "round_id": "R-0021",
- "status": "cancelled",
- "discipline": "architect",
- "discipline_specialization": "architect-blueprint",
- "title": "Transferida a R-0022: CTG-0004",
- "description": "Cancelada nesta rodada por Owner A1; nunca despachar nem marcar como cumprida.",
- "lifecycle": "supported",
- "target_modules": ["MOD-r21-cancelled-0008"],
- "target_substrates": ["F1"],
- "target_invariants": [],
- "coupled_task_group": "CTG-0004",
- "coupled_pipeline_position": "architect",
- "upstream_task_id": null,
- "db_isolation": "database",
- "iteration_count": 0,
- "max_iterations": 2,
- "priority": 1,
- "tags": ["r21", "owner-a1"],
- "branch": "orchestra/stynx-canonical",
- "worktree_id": "WT-stynx-canonical",
- "prompt_composition_id": "PC-78691d30e7f0c3d1",
- "acceptance_commands": [["pnpm", "check"]],
- "created_at": "2026-09-28T01:17:11.018441+00:00",
- "executor": {
- "kind": "agent",
- "runtime": "codex-cli",
- "model": "gpt-6-sol",
- "effort": "high",
- "selection": {
-      "mode": "exact",
-      "registry_id": "gpt-6-sol"
- },
- "prompt_composition_id": "PC-78691d30e7f0c3d1",
- "max_iterations": 2,
- "capabilities": ["read", "local-write"]
- }
  +}
  diff --git a/work/rounds/R-0021/tasks/TASK-0009.json b/work/rounds/R-0021/tasks/TASK-0009.json
  new file mode 100644
  index 00000000..eb5a2170
  --- /dev/null
  +++ b/work/rounds/R-0021/tasks/TASK-0009.json
  @@ -0,0 +1,40 @@
  +{
- "schemaVersion": "2.0.0",
- "id": "TASK-0009",
- "round_id": "R-0021",
- "status": "cancelled",
- "discipline": "inspector",
- "discipline_specialization": "inspector-tests",
- "title": "Transferida a R-0022: CTG-0004",
- "description": "Cancelada nesta rodada por Owner A1; nunca despachar nem marcar como cumprida.",
- "lifecycle": "supported",
- "target_modules": ["MOD-r21-cancelled-0009"],
- "target_substrates": ["F3"],
- "target_invariants": [],
- "coupled_task_group": "CTG-0004",
- "coupled_pipeline_position": "inspector",
- "upstream_task_id": null,
- "db_isolation": "database",
- "iteration_count": 0,
- "max_iterations": 2,
- "priority": 1,
- "tags": ["r21", "owner-a1"],
- "branch": "orchestra/stynx-canonical",
- "worktree_id": "WT-stynx-canonical",
- "prompt_composition_id": "PC-de321a6f97544d46",
- "acceptance_commands": [["pnpm", "check"]],
- "created_at": "2026-09-28T01:17:11.018441+00:00",
- "executor": {
- "kind": "agent",
- "runtime": "codex-cli",
- "model": "gpt-5.6-terra",
- "effort": "medium",
- "selection": {
-      "mode": "exact",
-      "registry_id": "gpt-5.6-terra"
- },
- "prompt_composition_id": "PC-de321a6f97544d46",
- "max_iterations": 2,
- "capabilities": ["read", "local-write"]
- }
  +}
  diff --git a/work/rounds/R-0021/tasks/TASK-0010.json b/work/rounds/R-0021/tasks/TASK-0010.json
  new file mode 100644
  index 00000000..d8ac2a1a
  --- /dev/null
  +++ b/work/rounds/R-0021/tasks/TASK-0010.json
  @@ -0,0 +1,40 @@
  +{
- "schemaVersion": "2.0.0",
- "id": "TASK-0010",
- "round_id": "R-0021",
- "status": "cancelled",
- "discipline": "engineer",
- "discipline_specialization": "engineer-backend",
- "title": "Transferida a R-0022: CTG-0004",
- "description": "Cancelada nesta rodada por Owner A1; nunca despachar nem marcar como cumprida.",
- "lifecycle": "supported",
- "target_modules": ["MOD-r21-cancelled-0010"],
- "target_substrates": ["F2"],
- "target_invariants": [],
- "coupled_task_group": "CTG-0004",
- "coupled_pipeline_position": "engineer",
- "upstream_task_id": null,
- "db_isolation": "database",
- "iteration_count": 0,
- "max_iterations": 2,
- "priority": 1,
- "tags": ["r21", "owner-a1"],
- "branch": "orchestra/stynx-canonical",
- "worktree_id": "WT-stynx-canonical",
- "prompt_composition_id": "PC-ea939e217ce00016",
- "acceptance_commands": [["pnpm", "check"]],
- "created_at": "2026-09-28T01:17:11.018441+00:00",
- "executor": {
- "kind": "agent",
- "runtime": "codex-cli",
- "model": "gpt-6-sol",
- "effort": "medium",
- "selection": {
-      "mode": "exact",
-      "registry_id": "gpt-6-sol"
- },
- "prompt_composition_id": "PC-ea939e217ce00016",
- "max_iterations": 2,
- "capabilities": ["read", "local-write"]
- }
  +}
  diff --git a/work/rounds/R-0021/tasks/TASK-0011.json b/work/rounds/R-0021/tasks/TASK-0011.json
  new file mode 100644
  index 00000000..16d1a143
  --- /dev/null
  +++ b/work/rounds/R-0021/tasks/TASK-0011.json
  @@ -0,0 +1,40 @@
  +{
- "schemaVersion": "2.0.0",
- "id": "TASK-0011",
- "round_id": "R-0021",
- "status": "cancelled",
- "discipline": "architect",
- "discipline_specialization": "architect-blueprint",
- "title": "Transferida a R-0022: CTG-0005",
- "description": "Cancelada nesta rodada por Owner A1; nunca despachar nem marcar como cumprida.",
- "lifecycle": "supported",
- "target_modules": ["MOD-r21-cancelled-0011"],
- "target_substrates": ["F1"],
- "target_invariants": [],
- "coupled_task_group": "CTG-0005",
- "coupled_pipeline_position": "architect",
- "upstream_task_id": null,
- "db_isolation": "database",
- "iteration_count": 0,
- "max_iterations": 2,
- "priority": 1,
- "tags": ["r21", "owner-a1"],
- "branch": "orchestra/stynx-canonical",
- "worktree_id": "WT-stynx-canonical",
- "prompt_composition_id": "PC-27d67b56d31ecb94",
- "acceptance_commands": [["pnpm", "check"]],
- "created_at": "2026-09-28T01:17:11.018441+00:00",
- "executor": {
- "kind": "agent",
- "runtime": "codex-cli",
- "model": "gpt-6-sol",
- "effort": "high",
- "selection": {
-      "mode": "exact",
-      "registry_id": "gpt-6-sol"
- },
- "prompt_composition_id": "PC-27d67b56d31ecb94",
- "max_iterations": 2,
- "capabilities": ["read", "local-write"]
- }
  +}
  diff --git a/work/rounds/R-0021/tasks/TASK-0012.json b/work/rounds/R-0021/tasks/TASK-0012.json
  new file mode 100644
  index 00000000..d347d2b2
  --- /dev/null
  +++ b/work/rounds/R-0021/tasks/TASK-0012.json
  @@ -0,0 +1,40 @@
  +{
- "schemaVersion": "2.0.0",
- "id": "TASK-0012",
- "round_id": "R-0021",
- "status": "cancelled",
- "discipline": "inspector",
- "discipline_specialization": "inspector-tests",
- "title": "Transferida a R-0022: CTG-0005",
- "description": "Cancelada nesta rodada por Owner A1; nunca despachar nem marcar como cumprida.",
- "lifecycle": "supported",
- "target_modules": ["MOD-r21-cancelled-0012"],
- "target_substrates": ["F3"],
- "target_invariants": [],
- "coupled_task_group": "CTG-0005",
- "coupled_pipeline_position": "inspector",
- "upstream_task_id": null,
- "db_isolation": "database",
- "iteration_count": 0,
- "max_iterations": 2,
- "priority": 1,
- "tags": ["r21", "owner-a1"],
- "branch": "orchestra/stynx-canonical",
- "worktree_id": "WT-stynx-canonical",
- "prompt_composition_id": "PC-76a3aa065cbdc6a5",
- "acceptance_commands": [["pnpm", "check"]],
- "created_at": "2026-09-28T01:17:11.018441+00:00",
- "executor": {
- "kind": "agent",
- "runtime": "codex-cli",
- "model": "gpt-5.6-terra",
- "effort": "medium",
- "selection": {
-      "mode": "exact",
-      "registry_id": "gpt-5.6-terra"
- },
- "prompt_composition_id": "PC-76a3aa065cbdc6a5",
- "max_iterations": 2,
- "capabilities": ["read", "local-write"]
- }
  +}
  diff --git a/work/rounds/R-0021/tasks/TASK-0013.json b/work/rounds/R-0021/tasks/TASK-0013.json
  new file mode 100644
  index 00000000..1e9f836d
  --- /dev/null
  +++ b/work/rounds/R-0021/tasks/TASK-0013.json
  @@ -0,0 +1,40 @@
  +{
- "schemaVersion": "2.0.0",
- "id": "TASK-0013",
- "round_id": "R-0021",
- "status": "cancelled",
- "discipline": "engineer",
- "discipline_specialization": "engineer-backend",
- "title": "Transferida a R-0022: CTG-0005",
- "description": "Cancelada nesta rodada por Owner A1; nunca despachar nem marcar como cumprida.",
- "lifecycle": "supported",
- "target_modules": ["MOD-r21-cancelled-0013"],
- "target_substrates": ["F2"],
- "target_invariants": [],
- "coupled_task_group": "CTG-0005",
- "coupled_pipeline_position": "engineer",
- "upstream_task_id": null,
- "db_isolation": "database",
- "iteration_count": 0,
- "max_iterations": 2,
- "priority": 1,
- "tags": ["r21", "owner-a1"],
- "branch": "orchestra/stynx-canonical",
- "worktree_id": "WT-stynx-canonical",
- "prompt_composition_id": "PC-804708dc7b7af06d",
- "acceptance_commands": [["pnpm", "check"]],
- "created_at": "2026-09-28T01:17:11.018441+00:00",
- "executor": {
- "kind": "agent",
- "runtime": "codex-cli",
- "model": "gpt-6-sol",
- "effort": "medium",
- "selection": {
-      "mode": "exact",
-      "registry_id": "gpt-6-sol"
- },
- "prompt_composition_id": "PC-804708dc7b7af06d",
- "max_iterations": 2,
- "capabilities": ["read", "local-write"]
- }
  +}
  diff --git a/work/rounds/R-0021/tasks/TASK-0014.json b/work/rounds/R-0021/tasks/TASK-0014.json
  new file mode 100644
  index 00000000..178363e2
  --- /dev/null
  +++ b/work/rounds/R-0021/tasks/TASK-0014.json
  @@ -0,0 +1,45 @@
  +{
- "schemaVersion": "2.0.0",
- "id": "TASK-0014",
- "round_id": "R-0021",
- "status": "queued",
- "discipline": "architect",
- "discipline_specialization": "transcriber-docs",
- "title": "Documentar pin, transfer\u00eancias e resultado real",
- "description": "Documentar pin, transfer\u00eancias e resultado real conforme AUTHORIZATION A1 e contratos fechados.",
- "lifecycle": "supported",
- "target_modules": ["MOD-adr", "MOD-docs"],
- "target_substrates": ["F1", "F5"],
- "target_invariants": [],
- "coupled_task_group": "CTG-0007",
- "coupled_pipeline_position": "architect",
- "upstream_task_id": "TASK-0004",
- "db_isolation": "database",
- "iteration_count": 0,
- "max_iterations": 2,
- "priority": 1,
- "tags": ["r21", "owner-a1"],
- "branch": "orchestra/stynx-canonical",
- "worktree_id": "WT-stynx-canonical",
- "prompt_composition_id": "PC-eb405bc7a8d14e67",
- "acceptance_commands": [
- ["pnpm", "docs:kb:check"],
- ["pnpm", "docs:kb:publish-check"],
- ["pnpm", "verify:state-index"],
- ["pnpm", "format:check"]
- ],
- "created_at": "2026-09-28T01:17:11.018441+00:00",
- "executor": {
- "kind": "agent",
- "runtime": "codex-cli",
- "model": "gpt-6-luna",
- "effort": "low",
- "selection": {
-      "mode": "exact",
-      "registry_id": "gpt-6-luna"
- },
- "prompt_composition_id": "PC-eb405bc7a8d14e67",
- "max_iterations": 2,
- "capabilities": ["read", "local-write"]
- }
  +}
  diff --git a/work/rounds/R-0021/tasks/TASK-0015.json b/work/rounds/R-0021/tasks/TASK-0015.json
  new file mode 100644
  index 00000000..f493228a
  --- /dev/null
  +++ b/work/rounds/R-0021/tasks/TASK-0015.json
  @@ -0,0 +1,42 @@
  +{
- "schemaVersion": "2.0.0",
- "id": "TASK-0015",
- "round_id": "R-0021",
- "status": "queued",
- "discipline": "inspector",
- "discipline_specialization": "inspector-tests",
- "title": "Escrever negativos do verificador de pin",
- "description": "Escrever negativos do verificador de pin conforme AUTHORIZATION A1 e contratos fechados.",
- "lifecycle": "supported",
- "target_modules": ["MOD-stynx-pin-tests"],
- "target_substrates": ["F3"],
- "target_invariants": [],
- "coupled_task_group": "CTG-0002",
- "coupled_pipeline_position": "inspector",
- "upstream_task_id": "TASK-0001",
- "db_isolation": "database",
- "iteration_count": 0,
- "max_iterations": 2,
- "priority": 1,
- "tags": ["r21", "owner-a1"],
- "branch": "orchestra/stynx-canonical",
- "worktree_id": "WT-stynx-canonical",
- "prompt_composition_id": "PC-45e4a2aef581690f",
- "acceptance_commands": [
- ["node", "--test", "tools/stynx-pin/tests/check.test.mjs"]
- ],
- "created_at": "2026-09-28T01:17:11.018441+00:00",
- "executor": {
- "kind": "agent",
- "runtime": "codex-cli",
- "model": "gpt-5.6-terra",
- "effort": "medium",
- "selection": {
-      "mode": "exact",
-      "registry_id": "gpt-5.6-terra"
- },
- "prompt_composition_id": "PC-45e4a2aef581690f",
- "max_iterations": 2,
- "capabilities": ["read", "local-write"]
- }
  +}
  diff --git a/work/rounds/R-0022/plan.md b/work/rounds/R-0022/plan.md
  index 03db03b9..f00fb9b1 100644
  --- a/work/rounds/R-0022/plan.md
  +++ b/work/rounds/R-0022/plan.md
  @@ -1,5 +1,7 @@

# R-0022 — frente `stynx-sse-tenancy` (C-0002, ação 7c: pin 1.5.0, SSE com fonte única, tenancy sem _monkey-patch_, assinatura final)

+> **Adenda vigente A1 (2026-09-27), em §Adendas:** R-0022 recebe assinatura, outbox e offline-sync inteiras de R-0021; não pressupor migrações parciais. A transferência não autoriza o início desta rodada. +
**Status:** **proposta — C-0002 rev. 2, aguardando autorização do Owner**. Planejada em 2026-09-26 pelo
Architect a partir de `work/campaigns/C-0002-consolidacao.md` §2 (fase C) e de
`work/campaigns/C-0002-stynx-upstream-spec.md` (§3, §4, §6.11, §6.12). Reaproveita o rascunho da
@@ -200,6 +202,44 @@ OD-P30 (autenticação oportunista), OD-R21-01 (contornos de assinatura atrás d

## Adendas

+### A1 — transferências integrais de R-0021 (2026-09-27) +
+Autoridade: plano revisto de R-0021 aprovado pelo Owner; OD-R21-01…06; campanha A11 e
+especificação upstream §8.1/A1. Esta adenda prevalece sobre as metas 3, 5 e 7, TASK-0004,
+TASK-0009, CTG-0006 e referências a contratos/fachadas de R-0021 ainda não produzidos.
+A tabela de tarefas e os critérios anteriores permanecem como histórico; esta rodada segue
+proposta, sem autorização de início por este registro. +
+1. R-0021 entrega caracterização e pin/gate 1.4.0, com fechamento sem selo; **nenhuma** migração

- de assinatura, despacho/outbox ou offline-sync é pressuposta. Para a abertura de R-0022,
- conferir PRs, fechamento real e critérios transferidos, sem exigir nem alegar selo de R-0021.
  +2. Receber as migrações **inteiras**: assinatura (incluindo composição e fachada), outbox
- (despacho RENACH e log de eventos), offline-sync (deduplicação, numeração, lote, recibos,
- aplicação transacional e conflitos). TASK-0009 deixa de ser simples remoção condicional de
- contornos: deverá ser redecomposta em tríade para a migração completa. Outbox e offline
- ganham grupos e tarefas próprios no futuro bootstrap, sem renumerar tarefas históricas.
  +3. Antes de produzir prompts de implementação, Architect atualiza o DAG, fronteiras, locks,
- estimativa de janelas e critérios; Inspector reaproveita e amplia a caracterização R-0021,
- verde sobre 1.4.0 antes e sobre a release alvo depois. Nenhum Engineer remove mecanismo
- genérico antes da prova dos requisitos UPS-SIG/OBX/OFS MUST da spec A1.
  +4. A ausência de UPS-OBX-01 não libera novo mecanismo local de log/cursor pela antiga
- OD-R22-01; bloqueia sua migração. O mapeamento fino do domínio para uma fonte SSE pública
- pode permanecer, mas não substitui capacidade genérica ausente. Regra análoga vale para
- assinatura e offline: checkpoint no CTG afetado, sem novo contorno. Grupos independentes
- continuam conforme seus pré-requisitos comprovados.
  +5. Pin: atualizar a fonte única `tools/stynx-version.json`, manifestos descobertos dinamicamente
- e lockfile pelo maestro; o gerador e o verificador consomem essa fonte. Não voltar à lista
- histórica fixa de 59 manifestos nem reintroduzir versão literal no gerador.
  +6. OD-S15-01 continua válida: desenvolvimento/testes podem consumir RC publicada; merge exige
- 1.5.0 final e conformidade publicada. RC.2 mantém os arquivos próprios dos três pacotes
- iguais a 1.4.0 (hashes na spec A1); RC.3 local não comprova conformidade.
  +7. Leitura de entrada substituta: `work/rounds/R-0021/contracts/CTG-0001.md`, relatórios e
- fechamento efetivos, spec §8.1/A1, ADR-0018 e ADR-0036. Não presumir existência de
- `R-0021/contracts/CTG-0003.md` de migração cancelada nem de fachada já convertida.
-

+O encerramento de R-0021 sem selo não autoriza dispensa automática do selo ou de critérios de
+R-0022. A adoção de notificações continua vinculada ao produtor OD-P40, fora destas transferências. +

## Bloqueios

## Retomada

diff --git a/work/rounds/R-0022/prompts/00-maestro.md b/work/rounds/R-0022/prompts/00-maestro.md
index bf839a47..0564af6f 100644
--- a/work/rounds/R-0022/prompts/00-maestro.md
+++ b/work/rounds/R-0022/prompts/00-maestro.md
@@ -1,5 +1,7 @@

# Prompt do maestro — orquestra `stynx-sse-tenancy` (rodada `R-0022`)

+> **Adenda de leitura A1 — 2026-09-27:** este prompt não inicia R-0022. Quando a rodada for autorizada, aplicar primeiro a adenda A1 de seu `plan.md` e a spec upstream §8.1; elas prevalecem sobre os pressupostos históricos abaixo. +

> Cole este prompt inteiro numa sessão **nova e sem contexto** da CLI da família `Anthropic — Claude Code com Opus 5.5`
> (id exato do modelo confirmado com `claude --help` no bootstrap), aberta na worktree `/Volumes/Thiamat II/stech/detran-worktrees/stynx-sse-tenancy`.
> Você é o **maestro** desta orquestra. Tudo o que você precisa saber está nos arquivos citados;
> @@ -267,3 +269,34 @@ ciclos de REVIEW e escaladas; gates executados com saída resumida (inclusive `b
 e depois); evidência (sequência e head da cadeia); OD tocadas; conformidade real da 1.5.0 (ids UPS
 consumidos e ausentes); o que ficou fora e por quê; consumo estimado (`budget.json`); ajustes que
 recomenda ao método (`orchestra/README.md`, `model-ladder.md`).

-

+## 11. Adenda A1 — entrada após o escopo revisto de R-0021 (2026-09-27) +
+Antes do bootstrap, ler `work/rounds/R-0022/plan.md` §Adendas A1, +`work/campaigns/C-0002-consolidacao.md` §11/A11 e +`work/campaigns/C-0002-stynx-upstream-spec.md` §8.1/A1. A transferência foi aprovada pelo Owner,
+mas **não abre R-0022** nem autoriza ações no repositório STYNX. +
+- Conferir os PRs, relatórios e fechamento reais de R-0021: caracterização, pin 1.4.0 e gate de

- versões; migrações de assinatura, outbox e offline-sync inteiras transferidas, critérios
- históricos não cumpridos e fechamento sem selo autorizado. Não exigir selo de R-0021 como
- pré-requisito e não registrar migrações parciais como entregues.
  +- Redecompor a assinatura (antiga TASK-0009/CTG-0006) e adicionar tríades de outbox e
- offline-sync antes de revisar prompts. Registrar dependências com tenancy/SSE e locks de
- app, armazenamento, testes, instalação e banco. Preservar ids históricos; tarefas novas
- recebem ids seguintes livres no bootstrap. Recalibrar prazo/orçamento sem iniciar trabalho
- antes da autorização da rodada.
  +- Contratos partem dos artefatos publicados e dos testes de R-0021; não pressupor fachada,
- despacho RENACH ou deduplicação já migrados, nem o contrato CTG-0003 cancelado de R-0021.
- `contracts/CTG-0001.md`, relatórios e fechamento são a entrada real. A ADR de operações é
- ADR-0036. O pin usa `tools/stynx-version.json` e descoberta dinâmica de manifestos.
  +- UPS-SIG-01…04, UPS-OBX-01…02 e UPS-OFS-01…04, incluindo compatibilidade offline da spec A1,
- são MUST para a migração consumidora. Item ausente bloqueia esse CTG; a antiga alternativa
- de implementar novo contorno local não está autorizada. Preservar prova antes/depois com
- RLS e HTTP reais, incluindo TEAT/BOAT, rollback e replay. Notificações aguardam OD-P40.
  +- OD-S15-01 permanece fechada: RC publicada permite desenvolvimento/teste, nunca merge;
- merge exige 1.5.0 final conforme. A RC.2 não altera os arquivos próprios dos três pacotes;
- árvore local da RC.3 não vale como prova. Verificar a release efetivamente consumida.
-

+Esta adenda não muda os critérios de selo de R-0022 nem transfere a ela automaticamente o
+orçamento ampliado ou a autorização operacional concedidos a R-0021.

Anexo: hashes dos logs preservados
002039a261be0d4d1f45eae77dc63d91af86ee79a8f6bb030e354bdea0bf7144 work/rounds/R-0021/reports/baseline-check.log
c594ce83127771b065980fd66b3f2e58905303ee06de0895ec2fbbc2a96ef609 work/rounds/R-0021/reports/clinical-build-pre.log
92c0ca2c5db10664475fdc3404cef5346c8c3d18b7021ed7c293e0fa1f315dd0 work/rounds/R-0021/reports/ctg0001-backend-ci-no-mock-fail.log
b008d421790cebd685d15b25049225d01120ca8e50faa26c7413b09cacb6cf5c work/rounds/R-0021/reports/ctg0001-backend-ci.log
e978f5e179a29c7ed80aa0878ef040ee89dd976c894f98b72575693793d099d8 work/rounds/R-0021/reports/ctg0001-check-aborted.log
f5f4446b8601acad7b2e2b9943f258d5adbb940d64231e8ea62742436e353aad work/rounds/R-0021/reports/ctg0001-check.log
239a34c143381914e1e16fef186ca68b281c213bbf9732b13a475fd5ba5d10fb work/rounds/R-0021/reports/db-prepare.log
e75b4052b1a20be11eb77cbe74f29bde9fb9d6d02717cbf6d01b002f2c975ce3 work/rounds/R-0021/reports/senatran-build.log
cd7a3bef1e761b92e265f983e949d9afd7a4ff934c7b87a9a082b22f4d510ac8 work/rounds/R-0021/reports/senatran-db-reset.log
c1b33dfcd2284f8f72d501b0dfc7247b8933a16fbb20b358ab9bed1df40c4eb7 work/rounds/R-0021/reports/senatran-mock.log
286133ab7a4bf5f5565d9aa2c939801ad787653e77cd1d0d67aee519d046d84b work/rounds/R-0021/reports/task0002-e2e-fixed.log
b821f5ebe97c36fe2412ff56a4727b808c777eb73910ee85972cb88b0231cf0b work/rounds/R-0021/reports/task0003-e2e-fresh.log
