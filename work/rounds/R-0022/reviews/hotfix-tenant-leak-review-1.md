# Delivery-review — hotfix de isolamento entre tenants (fora da R-0022; achado por R-0022 TASK-0002)

> Você é o reviewer da família oposta (Codex Sol 6, nível grande). Papel: **Auditor** (Art. 18), somente
> leitura na worktree `/Users/aarusso/Development/detran/.claude/worktrees/agent-a5611b6f7bf8e9d9e`
> (branch `fix/portal-manifestation-tenant-leak`, base `origin/main` 3347b683). Responda **apenas** com
> o JSON do §Saída.

Autorização: o Owner mandou corrigir em PR próprio contra `main` (2026-09-29). Tenancy/RLS não tem
dispensa: só PASS libera o PR.

## Defeito

Perfil `test` (AuthContextGuard legado): cidadão CIDADAO com membership só no tenant A, `POST
/v1/portal/manifestations` com `Authorization` e `X-Tenant-Id` do tenant B → 201 `anonymous:false`,
manifestação e `portal.subject` com o `cpf_hash` do cidadão gravados em B. Causa: na autenticação
oportunista (`activatePublicPortalRoute`, `backend/app/src/app.module.ts`), o guard interno grava o
principal antes de recusar o tenant; o fallback anônimo (`seedPortalPublicRequest`) semeia B pelo
cabeçalho e o controlador (`opportunisticIdentityOf`) lê o principal recusado.

## Rubrica

1. A correção fecha o vazamento em todos os caminhos de falha (retorno `false` e exceção), para os dois
   guards (`DetranLegacyAuthContextGuard`, `DetranStynxAuthContextGuard`)?
2. A limpeza de campos da requisição é completa (tudo o que `getPrincipalFromRequest` e o
   `RequestContextInterceptor` leem) e não quebra o caminho autenticado de sucesso nem as rotas
   públicas sem `Authorization`?
3. A defesa em profundidade em `opportunisticIdentityOf` (tenant do `RequestContext`) está correta e
   fail-closed?
4. O teste de regressão prova o defeito (vermelho em `main`) e a correção, sem owner na operação sob
   teste, sem dublê de RLS, com limpeza correta; controle positivo presente?
5. Contrato público inalterado (rota, status, envelope; OD-P30 "nunca 401/403" nessa rota)?
6. Algum outro caminho `@Public()` com autenticação oportunista ou tenant por cabeçalho com o mesmo
   padrão, não coberto?

Relatório do worker (resumo): novo spec 3/3 verde (vermelho antes: `anonymous:false`); cada camada da
correção sozinha fecha o caso; 5 specs e2e do Portal com as mesmas 11 falhas antes e depois (SNE/
delegação indisponíveis no banco local, preexistentes); `portal-citizen-service` unit 78/78;
`backend:rls-smoke` OK; typecheck; `verify:decorators` OK (1027 handlers); `format:check` OK. Em
produção (StynxAuthGuard com JWT), o worker raciocina que o principal só é gravado no sucesso, logo o
vazamento é do caminho legado/local — avalie essa afirmação.

## Diff (origin/main...HEAD)

```diff
diff --git a/backend/app/src/app.module.ts b/backend/app/src/app.module.ts
index 14bb7074..dcd65f28 100644
--- a/backend/app/src/app.module.ts
+++ b/backend/app/src/app.module.ts
@@ -392,6 +392,30 @@ type PortalPublicRequest = PortalPublicRequestLike & {
   originalUrl?: string;
 };

+/**
+ * Campos de identidade/tenant que os guards internos (STYNX `AuthContextGuard`
+ * legado e `StynxAuthGuard`) gravam na requisição. O legado grava o principal
+ * ANTES de validar o tenant (entitlement) e só depois recusa; sem limpeza, o
+ * principal recusado sobreviveria à semeadura anônima e seria lido por
+ * `getPrincipalFromRequest` (hotfix 2026-09-29, vazamento entre tenants).
+ */
+const OPPORTUNISTIC_AUTH_REQUEST_KEYS = [
+  'principal',
+  'principalContext',
+  'user',
+  'actor',
+  'tenantId',
+  'stynxClaims',
+  'stynxReadonly',
+  'portalPublic',
+] as const;
+
+/** Fail-closed: autenticação oportunista sem `true` não deixa rastro de identidade. */
+function discardOpportunisticIdentity(request: PortalPublicRequest): void {
+  const mutable = request as unknown as Record<string, unknown>;
+  for (const key of OPPORTUNISTIC_AUTH_REQUEST_KEYS) delete mutable[key];
+}
+
 async function activatePublicPortalRoute(
   request: PortalPublicRequest,
   authenticate: () => boolean | Promise<boolean>,
@@ -408,8 +432,10 @@ async function activatePublicPortalRoute(
       );
       if (authenticated) return true;
     } catch {
-      // credencial inválida/expirada: a manifestação segue anônima (§2.8)
+      // credencial inválida/expirada ou tenant sem direito: segue anônima (§2.8)
     }
+    // o guard interno pode ter gravado principal/tenant antes de recusar
+    discardOpportunisticIdentity(request);
   }
   // R-0009 CTG-0001 §9: tenant das rotas públicas do Portal pelo Host.
   seedPortalPublicRequest(request);
diff --git a/backend/app/tests/e2e/portal-manifestation-tenant-isolation.e2e.spec.ts b/backend/app/tests/e2e/portal-manifestation-tenant-isolation.e2e.spec.ts
new file mode 100644
index 00000000..d714c6d4
--- /dev/null
+++ b/backend/app/tests/e2e/portal-manifestation-tenant-isolation.e2e.spec.ts
@@ -0,0 +1,230 @@
+import { randomUUID } from 'node:crypto';
+import type { INestApplication } from '@nestjs/common';
+import request from 'supertest';
+import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
+
+import {
+  CPF,
+  TENANT_ID,
+  asOwner,
+  clearCitizenEnv,
+  cpfHash,
+  createPortalApp,
+  headers,
+  newClient,
+  resetLocalPortalRows,
+  seedLocalTenant,
+  setCitizen,
+} from './portal-e2e.support.js';
+
+/**
+ * Hotfix de segurança (autorizado pelo Owner em 2026-09-29, fora de R-0022):
+ * `POST /v1/portal/manifestations` é `@Public()` com autenticação
+ * OPORTUNISTA (CTG-0002 §2.8, A4(b)). Um cidadão com membership só no tenant
+ * local, enviando `X-Tenant-Id` de outro tenant (B, sem membership), era
+ * recusado pelo guard interno (entitlement) mas o principal já ficara na
+ * requisição; o app semeava o tenant B pelo cabeçalho e o controlador lia o
+ * principal recusado como cidadão identificado — gravando em B um
+ * `portal.subject` com o `cpf_hash` do cidadão de A e a manifestação ligada a
+ * ele (`anonymous:false`). Regressão: nunca identificado fora do tenant de
+ * membership.
+ *
+ * Tenant B = o tenant B de `tools/check-rls-smoke.ts`, criado como owner com
+ * `on conflict do nothing` e mantido (o `@Audit` grava `audit.events` em B,
+ * imutável e com FK para `auth.tenants`). Limpeza só das linhas criadas aqui.
+ */
+const TENANT_B = '00000000-0000-7000-8000-000000000102';
+const citizen = { cpf: CPF.prata, level: 'avancada' as const };
+
+const client = newClient();
+let app: INestApplication;
+
+/** Linhas criadas por este arquivo, por tenant, para a limpeza no `afterAll`. */
+const created: Array<{
+  tenantId: string;
+  idempotencyKey: string;
+  manifestationId?: string;
+}> = [];
+const preexistingSubject: Record<string, boolean> = {};
+
+function api() {
+  return request(app.getHttpServer());
+}
+
+async function asOwnerIn(tenantId: string): Promise<void> {
+  await asOwner(client);
+  await client.query(`select set_config('app.tenant_id', $1, false)`, [
+    tenantId,
+  ]);
+}
+
+async function subjectIdsOf(tenantId: string, hash: string) {
+  await asOwnerIn(tenantId);
+  return (
+    await client.query<{ id: string }>(
+      `select id from portal.subject where tenant_id = $1 and cpf_hash = $2`,
+      [tenantId, hash],
+    )
+  ).rows.map((row) => row.id);
+}
+
+async function manifestationRow(tenantId: string, id: string) {
+  await asOwnerIn(tenantId);
+  return (
+    await client.query<{
+      tenant_id: string;
+      anonymous: boolean;
+      subject_id: string | null;
+    }>(
+      `select tenant_id, anonymous, subject_id from portal.manifestation where id = $1`,
+      [id],
+    )
+  ).rows[0];
+}
+
+async function manifest(
+  tenantId: string,
+  body: Record<string, unknown>,
+  extra: Record<string, string> = {},
+) {
+  const requestHeaders = headers({ 'x-tenant-id': tenantId, ...extra });
+  const entry: (typeof created)[number] = {
+    tenantId,
+    idempotencyKey: requestHeaders['idempotency-key']!,
+  };
+  created.push(entry);
+  const response = await api()
+    .post('/v1/portal/manifestations')
+    .set(requestHeaders)
+    .send(body);
+  if (typeof response.body?.manifestationId === 'string') {
+    entry.manifestationId = response.body.manifestationId as string;
+  }
+  return response;
+}
+
+beforeAll(async () => {
+  process.env.DETRAN_RUNTIME_PROFILE = 'test';
+  process.env.DETRAN_LOCAL_ROLES = 'CIDADAO';
+  await client.connect();
+  await seedLocalTenant(client);
+  await resetLocalPortalRows(client);
+  await asOwnerIn(TENANT_B);
+  await client.query(
+    `insert into auth.tenants (id, slug, name) values ($1, 'sp', 'DETRAN SP')
+     on conflict (id) do nothing`,
+    [TENANT_B],
+  );
+  for (const tenantId of [TENANT_ID, TENANT_B]) {
+    preexistingSubject[tenantId] =
+      (await subjectIdsOf(tenantId, cpfHash(citizen.cpf))).length > 0;
+  }
+  app = await createPortalApp();
+}, 60_000);
+
+afterEach(() => {
+  clearCitizenEnv();
+});
+
+afterAll(async () => {
+  await app?.close();
+  const hash = cpfHash(citizen.cpf);
+  for (const entry of created) {
+    await asOwnerIn(entry.tenantId);
+    // chave persistida = `<escopo>:<Idempotency-Key>` (escopo = sujeito ou `public`)
+    await client.query(
+      `delete from portal.idempotency_record where tenant_id = $1 and key like $2`,
+      [entry.tenantId, `%:${entry.idempotencyKey}`],
+    );
+    if (entry.manifestationId) {
+      await client.query(
+        `delete from integration.outbox where tenant_id = $1 and aggregate_id = $2`,
+        [entry.tenantId, entry.manifestationId],
+      );
+      await client.query(
+        `delete from portal.manifestation where tenant_id = $1 and id = $2`,
+        [entry.tenantId, entry.manifestationId],
+      );
+    }
+  }
+  for (const tenantId of [TENANT_ID, TENANT_B]) {
+    if (preexistingSubject[tenantId]) continue;
+    await asOwnerIn(tenantId);
+    await client.query(
+      `delete from portal.subject where tenant_id = $1 and cpf_hash = $2`,
+      [tenantId, hash],
+    );
+  }
+  await client.end();
+});
+
+describe('Hotfix — isolamento de tenant na manifestação oportunista (§2.8)', () => {
+  it('dado cidadão CIDADAO com membership só no tenant local quando POST manifestations com X-Tenant-Id do tenant B então nunca identificado, nunca 500 e nenhum sujeito do cidadão gravado em B', async () => {
+    setCitizen(citizen);
+    // pré-condição: a mesma credencial é recusada em B numa rota autenticada
+    const me = await api()
+      .get('/v1/portal/identity/me')
+      .set(headers({ 'x-tenant-id': TENANT_B }));
+    expect(me.status, JSON.stringify(me.body)).toBe(403);
+
+    const response = await manifest(
+      TENANT_B,
+      { kind: 'reclamacao', text: 'cruzamento de tenant (hotfix)' },
+      { 'x-tenant-id': TENANT_B },
+    );
+    expect(response.status, JSON.stringify(response.body)).not.toBe(500);
+    expect(response.body?.anonymous, JSON.stringify(response.body)).not.toBe(
+      false,
+    );
+    if (response.status === 201) {
+      expect(response.body.anonymous).toBe(true);
+      const row = await manifestationRow(
+        TENANT_B,
+        response.body.manifestationId as string,
+      );
+      expect(row).toMatchObject({
+        tenant_id: TENANT_B,
+        anonymous: true,
+        subject_id: null,
+      });
+    }
+    if (!preexistingSubject[TENANT_B]) {
+      expect(await subjectIdsOf(TENANT_B, cpfHash(citizen.cpf))).toEqual([]);
+    }
+  });
+
+  it('dado o mesmo cidadão CIDADAO quando POST manifestations no próprio tenant então 201 com anonymous false e sujeito ligado', async () => {
+    setCitizen(citizen);
+    const response = await manifest(TENANT_ID, {
+      kind: 'sugestao',
+      text: 'controle positivo (hotfix)',
+    });
+    expect(response.status, JSON.stringify(response.body)).toBe(201);
+    expect(response.body.anonymous).toBe(false);
+    const row = await manifestationRow(
+      TENANT_ID,
+      response.body.manifestationId as string,
+    );
+    expect(row?.tenant_id).toBe(TENANT_ID);
+    expect(row?.anonymous).toBe(false);
+    expect(row?.subject_id).not.toBeNull();
+    expect(await subjectIdsOf(TENANT_ID, cpfHash(citizen.cpf))).toContain(
+      row?.subject_id,
+    );
+  });
+
+  it('dado credencial local sem claims de CPF quando POST manifestations no próprio tenant então 201 anônima', async () => {
+    clearCitizenEnv();
+    const response = await manifest(TENANT_ID, {
+      kind: 'elogio',
+      text: `sem claims (hotfix) ${randomUUID()}`,
+    });
+    expect(response.status, JSON.stringify(response.body)).toBe(201);
+    expect(response.body.anonymous).toBe(true);
+    const row = await manifestationRow(
+      TENANT_ID,
+      response.body.manifestationId as string,
+    );
+    expect(row).toMatchObject({ anonymous: true, subject_id: null });
+  });
+});
diff --git a/backend/domains/portal/citizen-service/src/handwritten/manifestations.controller.ts b/backend/domains/portal/citizen-service/src/handwritten/manifestations.controller.ts
index 31b31ee0..8f2f9c14 100644
--- a/backend/domains/portal/citizen-service/src/handwritten/manifestations.controller.ts
+++ b/backend/domains/portal/citizen-service/src/handwritten/manifestations.controller.ts
@@ -64,14 +64,20 @@ type CitizenRequest = RequestLike & PortalIdentityRequest;
 const REPLAYED_HEADER = 'Idempotency-Replayed';

 /**
- * Identidade oportunista (§2.8): principal autenticado com claims válidas e
- * papel CIDADAO → identificado; qualquer outra situação → anônimo.
+ * Identidade oportunista (§2.8): principal autenticado com claims válidas,
+ * papel CIDADAO e pertencente ao tenant efetivo da requisição → identificado;
+ * qualquer outra situação (inclusive tenant ausente) → anônimo. A checagem de
+ * tenant é defesa em profundidade (hotfix 2026-09-29): um principal de outro
+ * tenant nunca identifica sujeito no tenant semeado pelo cabeçalho.
  */
 export function opportunisticIdentityOf(
   request: RequestLike,
+  tenantId: string | undefined,
 ): PortalIdentityClaims | null {
+  if (!tenantId) return null;
   const principal = getPrincipalFromRequest(request);
   if (!principal) return null;
+  if (!(principal.tenants ?? []).includes(tenantId)) return null;
   const claims = portalIdentityClaims(principal);
   if (!claims) return null;
   return canonicalRoles(principal.roles ?? []).includes('CIDADAO')
@@ -102,7 +108,7 @@ export class PortalManifestationsController {
     @Headers() headers: PortalHeaders,
     @Res({ passthrough: true }) res: ResponseLike,
   ): Promise<ManifestationCreateResponse> {
-    const identity = opportunisticIdentityOf(request);
+    const identity = opportunisticIdentityOf(request, this.effectiveTenantId());
     const response = await this.tx((tx) =>
       this.manifestations.manifest(tx, identity, body, headers),
     );
@@ -154,6 +160,13 @@ export class PortalManifestationsController {
     return result;
   }

+  /** Tenant efetivo da requisição = o do `RequestContext` (o da transação). */
+  private effectiveTenantId(): string | undefined {
+    return this.requestContext.hasActiveContext()
+      ? this.requestContext.snapshot().tenantId
+      : undefined;
+  }
+
   /** Transação única de tenant por comando/leitura (§0). */
   private tx<T>(work: (tx: Transaction) => Promise<T>): Promise<T> {
     return withTenantContext(this.database, this.requestContext, work);
```

## Saída (JSON, e nada mais)

```json
{
  "mode": "delivery-review",
  "scope": "hotfix-portal-manifestation-tenant-leak",
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [
    {
      "severity": "high | low",
      "item": 1,
      "file": "…",
      "line": 1,
      "claim": "…",
      "fix": "…"
    }
  ],
  "notes": ["…"]
}
```
