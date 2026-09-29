# Delivery-review — hotfix de isolamento entre tenants, ciclo 2 (restrito)

> Reviewer da família oposta (Codex Sol 6, nível grande). Papel: **Auditor** (Art. 18), somente leitura
> na worktree `/Users/aarusso/Development/detran/.claude/worktrees/agent-a5611b6f7bf8e9d9e` (branch
> `fix/portal-manifestation-tenant-leak`). Responda **apenas** com o JSON do §Saída.

Ciclo 2: avalie **somente** a correção dos dois achados `high` do ciclo 1
(`/Users/aarusso/Development/detran/.claude/worktrees/r-0022-stynx-sse-tenancy-c949d9/work/rounds/R-0022/reviews/hotfix-tenant-leak-review-1.json`)
e o texto novo introduzido por ela. Achado novo sobre texto não alterado só se for FAIL por definição,
dizendo por que não apareceu antes.

1. (item 5) Caminho Stynx com JWT de A e `X-Tenant-Id` de B: agora segue anônimo (sem 403)?
   Correção: `opportunisticTenantMatches` antes do retorno antecipado em `activatePublicPortalRoute`
   (`backend/app/src/app.module.ts`) e `DetranTenantResolver.requestedTenant`
   (`backend/app/src/detran-runtime.ts`).
2. (item 4) O teste agora exige 201 e `anonymous:true` incondicionalmente, e há cobertura do caminho
   Stynx: `backend/app/src/portal-opportunistic-auth.spec.ts` (10 casos, vermelho antes da correção no
   caminho `true`).

Relatório do worker: unitário novo 10/10 (+ `detran-runtime.spec` e `detran-full-auth-roles.guard.spec`
35/35); e2e novo 3/3 e os 5 do Portal com as mesmas 11 falhas preexistentes (SNE/leitura nacional
indisponível no banco local) antes e depois; citizen-service unit 78/78; `backend:rls-smoke` OK;
typecheck; `verify:decorators` OK; `format:check` OK. Residual declarado: divergência cabeçalho × Host
mapeado e Host não mapeado com consulta ligada continuam 403/421 no caminho anônimo (comportamento
preexistente, fora deste hotfix).

## Diff desde o ciclo 1 (f37aa006..HEAD)

```diff
diff --git a/backend/app/src/app.module.ts b/backend/app/src/app.module.ts
index dcd65f28..e236b561 100644
--- a/backend/app/src/app.module.ts
+++ b/backend/app/src/app.module.ts
@@ -23,6 +23,7 @@ import {
   RequestContext,
   RequestContextMutator,
 } from '@stynx-nyx/core';
+import { headerToString } from '@stynx-nyx/contracts';
 import { Database, StynxDataModule } from '@stynx-nyx/data';
 import { StynxHealthModule } from '@stynx-nyx/health';
 import { StynxLoggingModule } from '@stynx-nyx/logging';
@@ -416,6 +417,27 @@ function discardOpportunisticIdentity(request: PortalPublicRequest): void {
   for (const key of OPPORTUNISTIC_AUTH_REQUEST_KEYS) delete mutable[key];
 }

+/**
+ * OD-P30 (nunca 401/403 na manifestação): a identidade autenticada só vale se
+ * o tenant pedido pela requisição (`X-Tenant-Id` e/ou Host mapeado, regra de
+ * `DetranTenantResolver`) pertence ao principal; divergência (inclusive a
+ * exceção do resolver) → anônima. Sem tenant pedido, nada muda.
+ */
+function opportunisticTenantMatches(request: PortalPublicRequest): boolean {
+  let requested: string | undefined;
+  try {
+    requested = new DetranTenantResolver().requestedTenant({
+      sessionTenantId: headerToString(request.headers?.['x-tenant-id'])?.trim(),
+      host: portalHostOf(request.headers ?? {}),
+    });
+  } catch {
+    return false;
+  }
+  if (requested === undefined) return true;
+  const principal = getPrincipalFromRequest(request as unknown as RequestLike);
+  return (principal?.tenants ?? []).includes(requested);
+}
+
 async function activatePublicPortalRoute(
   request: PortalPublicRequest,
   authenticate: () => boolean | Promise<boolean>,
@@ -430,7 +452,7 @@ async function activatePublicPortalRoute(
         portalHostOf(request.headers),
         () => authenticate(),
       );
-      if (authenticated) return true;
+      if (authenticated && opportunisticTenantMatches(request)) return true;
     } catch {
       // credencial inválida/expirada ou tenant sem direito: segue anônima (§2.8)
     }
diff --git a/backend/app/src/detran-runtime.ts b/backend/app/src/detran-runtime.ts
index 1af3d1db..f5004a24 100644
--- a/backend/app/src/detran-runtime.ts
+++ b/backend/app/src/detran-runtime.ts
@@ -498,15 +498,36 @@ export class DetranTenantResolver implements TenantResolver {
     });
   }

+  /**
+   * Tenant pedido EXPLICITAMENTE pela requisição (cabeçalho `X-Tenant-Id`
+   * e/ou Host mapeado com a consulta ao Host ligada), pela mesma regra de
+   * `resolveTenant` — inclusive a exceção na divergência. `undefined` quando
+   * não há cabeçalho nem Host mapeado (hotfix 2026-09-29, §2.8/OD-P30).
+   */
+  requestedTenant(input: PortalTenantResolutionInput): string | undefined {
+    const session = input.sessionTenantId || undefined;
+    if (!session && !this.mappedTenantFor(input.host)) return undefined;
+    return this.resolveTenant(input);
+  }
+
+  private hostLookupEnabled(): boolean {
+    return (
+      process.env.DETRAN_PORTAL_HOST_RESOLUTION === 'on' ||
+      !isLocalRuntimeProfile(detranRuntimeProfile())
+    );
+  }
+
+  private mappedTenantFor(host: string | undefined): string | undefined {
+    return this.hostLookupEnabled()
+      ? this.directory.tenantIdFor(host)
+      : undefined;
+  }
+
   resolveTenant(input: PortalTenantResolutionInput): string {
     const profile = detranRuntimeProfile();
-    const hostLookup =
-      process.env.DETRAN_PORTAL_HOST_RESOLUTION === 'on' ||
-      !isLocalRuntimeProfile(profile);
+    const hostLookup = this.hostLookupEnabled();
     const session = input.sessionTenantId || undefined;
-    const mapped = hostLookup
-      ? this.directory.tenantIdFor(input.host)
-      : undefined;
+    const mapped = this.mappedTenantFor(input.host);
     if (session && mapped && session !== mapped) {
       throw new DetranError('PORTAL.SESSION_TENANT_MISMATCH', {
         status: 403,
diff --git a/backend/app/src/portal-opportunistic-auth.spec.ts b/backend/app/src/portal-opportunistic-auth.spec.ts
new file mode 100644
index 00000000..351d5e36
--- /dev/null
+++ b/backend/app/src/portal-opportunistic-auth.spec.ts
@@ -0,0 +1,197 @@
+import type { CanActivate, ExecutionContext } from '@nestjs/common';
+import { Reflector } from '@nestjs/core';
+import { Action, Public, Resource } from '@detran/shared';
+import { afterEach, beforeEach, describe, expect, it } from 'vitest';
+
+import {
+  DetranLegacyAuthContextGuard,
+  DetranStynxAuthContextGuard,
+} from './app.module.js';
+import { PORTAL_PUBLIC_ACTOR_ID } from './detran-runtime.js';
+
+/**
+ * Hotfix de segurança (Owner, 2026-09-29), iteração 2: autenticação
+ * OPORTUNISTA de `POST /v1/portal/manifestations` (CTG-0002 §2.8, OD-P30 —
+ * nunca 401/403). Os dois guards do app (`DetranStynxAuthContextGuard`,
+ * produção; `DetranLegacyAuthContextGuard`, perfis locais) com `Reflector`
+ * real e guard interno dublê que grava um principal do tenant A: com
+ * `X-Tenant-Id` do tenant B a requisição tem de sair anônima em B — sem
+ * principal/`principalContext`/`user` de A, `portalPublic.tenantId` = B e o
+ * ator nulo —, quer o guard interno aceite (`true`), recuse (`false`) ou
+ * lance. Controle positivo: `X-Tenant-Id` de A preserva o principal.
+ */
+const TENANT_A = '00000000-0000-7000-8000-000000000001';
+const TENANT_B = '00000000-0000-7000-8000-000000000102';
+const CITIZEN = '00000000-0000-4000-8000-000000000002';
+const ROUTE = '/v1/portal/manifestations';
+
+@Resource('portal:manifestation')
+class ManifestationsDouble {
+  @Public()
+  @Action('manifest')
+  manifest(): void {}
+}
+
+type PortalRequest = {
+  method: string;
+  path: string;
+  url: string;
+  headers: Record<string, string>;
+  principal?: { id: string; tenants: string[] };
+  principalContext?: { principal: unknown; tenantId?: string };
+  user?: { id: string; tenants: string[] };
+  actor?: { id: string };
+  tenantId?: string;
+  stynxClaims?: { sub: string; tenantId: string };
+  portalPublic?: { tenantId: string; actorId: string };
+};
+
+type InnerOutcome = 'true' | 'false' | 'throw';
+
+/** Dublê do guard interno: grava a identidade de A e então aceita/recusa/lança. */
+function innerGuard(outcome: InnerOutcome): CanActivate {
+  return {
+    canActivate(context: ExecutionContext): boolean {
+      const request = context.switchToHttp().getRequest<PortalRequest>();
+      const principal = {
+        id: CITIZEN,
+        roles: ['CIDADAO'],
+        permissions: [],
+        tenants: [TENANT_A],
+        claims: { cpf: '22222222222' },
+      };
+      request.stynxClaims = { sub: CITIZEN, tenantId: TENANT_A };
+      request.principal = principal;
+      request.principalContext = { principal, tenantId: TENANT_A };
+      request.user = { id: CITIZEN, tenants: [TENANT_A] };
+      request.actor = { id: CITIZEN };
+      request.tenantId = TENANT_A;
+      if (outcome === 'throw') throw new Error('tenant sem direito');
+      return outcome === 'true';
+    },
+  };
+}
+
+type GuardFactory = (inner: CanActivate) => CanActivate;
+
+const GUARDS: Array<[string, GuardFactory]> = [
+  [
+    'DetranStynxAuthContextGuard',
+    (inner) =>
+      new DetranStynxAuthContextGuard(
+        new Reflector(),
+        inner as never,
+        {} as never,
+      ),
+  ],
+  [
+    'DetranLegacyAuthContextGuard',
+    (inner) =>
+      new DetranLegacyAuthContextGuard(new Reflector(), inner as never),
+  ],
+];
+
+function portalRequest(tenantHeader?: string): PortalRequest {
+  return {
+    method: 'POST',
+    path: ROUTE,
+    url: ROUTE,
+    headers: {
+      authorization: 'Bearer citizen-of-a',
+      ...(tenantHeader ? { 'x-tenant-id': tenantHeader } : {}),
+    },
+  };
+}
+
+function execution(request: PortalRequest): ExecutionContext {
+  return {
+    getClass: () => ManifestationsDouble,
+    getHandler: () => ManifestationsDouble.prototype.manifest,
+    switchToHttp: () => ({
+      getRequest: () => request,
+      getResponse: () => ({}),
+      getNext: () => undefined,
+    }),
+    getArgs: () => [],
+    getArgByIndex: () => undefined,
+    switchToRpc: () => ({
+      getContext: () => undefined,
+      getData: () => undefined,
+    }),
+    switchToWs: () => ({
+      getClient: () => undefined,
+      getData: () => undefined,
+      getPattern: () => '',
+    }),
+    getType: () => 'http',
+  } as unknown as ExecutionContext;
+}
+
+function expectAnonymousIn(request: PortalRequest, tenantId: string): void {
+  expect(request.principal).toBeUndefined();
+  expect(request.principalContext).toBeUndefined();
+  expect(request.user).toBeUndefined();
+  expect(request.stynxClaims).toBeUndefined();
+  expect(request.tenantId).toBe(tenantId);
+  expect(request.actor).toEqual({ id: PORTAL_PUBLIC_ACTOR_ID });
+  expect(request.portalPublic).toEqual({
+    tenantId,
+    actorId: PORTAL_PUBLIC_ACTOR_ID,
+  });
+}
+
+const saved = {
+  profile: process.env.DETRAN_RUNTIME_PROFILE,
+  hostResolution: process.env.DETRAN_PORTAL_HOST_RESOLUTION,
+};
+
+beforeEach(() => {
+  process.env.DETRAN_RUNTIME_PROFILE = 'test';
+  delete process.env.DETRAN_PORTAL_HOST_RESOLUTION;
+});
+
+afterEach(() => {
+  if (saved.profile === undefined) delete process.env.DETRAN_RUNTIME_PROFILE;
+  else process.env.DETRAN_RUNTIME_PROFILE = saved.profile;
+  if (saved.hostResolution === undefined)
+    delete process.env.DETRAN_PORTAL_HOST_RESOLUTION;
+  else process.env.DETRAN_PORTAL_HOST_RESOLUTION = saved.hostResolution;
+});
+
+describe.each(GUARDS)(
+  'Hotfix — autenticação oportunista de POST manifestations (%s)',
+  (_name, guardOf) => {
+    it.each<InnerOutcome>(['true', 'false', 'throw'])(
+      'dado guard interno que grava principal do tenant A e devolve %s quando POST manifestations com X-Tenant-Id do tenant B então segue anônima em B, sem identidade de A',
+      async (outcome) => {
+        const request = portalRequest(TENANT_B);
+        const guard = guardOf(innerGuard(outcome));
+        await expect(guard.canActivate(execution(request))).resolves.toBe(true);
+        expectAnonymousIn(request, TENANT_B);
+      },
+    );
+
+    it('dado guard interno que grava principal do tenant A e devolve true quando POST manifestations com X-Tenant-Id do tenant A então o principal é preservado', async () => {
+      const request = portalRequest(TENANT_A);
+      const guard = guardOf(innerGuard('true'));
+      await expect(guard.canActivate(execution(request))).resolves.toBe(true);
+      expect(request.principal).toMatchObject({
+        id: CITIZEN,
+        tenants: [TENANT_A],
+      });
+      expect(request.principalContext).toMatchObject({ tenantId: TENANT_A });
+      expect(request.user).toMatchObject({ id: CITIZEN });
+      expect(request.tenantId).toBe(TENANT_A);
+      expect(request.portalPublic).toBeUndefined();
+    });
+
+    it('dado guard interno que grava principal do tenant A e devolve true quando POST manifestations sem X-Tenant-Id e sem Host mapeado então o comportamento autenticado não muda', async () => {
+      const request = portalRequest();
+      const guard = guardOf(innerGuard('true'));
+      await expect(guard.canActivate(execution(request))).resolves.toBe(true);
+      expect(request.principal).toMatchObject({ id: CITIZEN });
+      expect(request.tenantId).toBe(TENANT_A);
+      expect(request.portalPublic).toBeUndefined();
+    });
+  },
+);
diff --git a/backend/app/tests/e2e/portal-manifestation-tenant-isolation.e2e.spec.ts b/backend/app/tests/e2e/portal-manifestation-tenant-isolation.e2e.spec.ts
index d714c6d4..17d08522 100644
--- a/backend/app/tests/e2e/portal-manifestation-tenant-isolation.e2e.spec.ts
+++ b/backend/app/tests/e2e/portal-manifestation-tenant-isolation.e2e.spec.ts
@@ -159,7 +159,7 @@ afterAll(async () => {
 });

 describe('Hotfix — isolamento de tenant na manifestação oportunista (§2.8)', () => {
-  it('dado cidadão CIDADAO com membership só no tenant local quando POST manifestations com X-Tenant-Id do tenant B então nunca identificado, nunca 500 e nenhum sujeito do cidadão gravado em B', async () => {
+  it('dado cidadão CIDADAO com membership só no tenant local quando POST manifestations com X-Tenant-Id do tenant B então 201 anônima (OD-P30: nunca 401/403) e nenhum sujeito do cidadão gravado em B', async () => {
     setCitizen(citizen);
     // pré-condição: a mesma credencial é recusada em B numa rota autenticada
     const me = await api()
@@ -172,22 +172,17 @@ describe('Hotfix — isolamento de tenant na manifestação oportunista (§2.8)'
       { kind: 'reclamacao', text: 'cruzamento de tenant (hotfix)' },
       { 'x-tenant-id': TENANT_B },
     );
-    expect(response.status, JSON.stringify(response.body)).not.toBe(500);
-    expect(response.body?.anonymous, JSON.stringify(response.body)).not.toBe(
-      false,
+    expect(response.status, JSON.stringify(response.body)).toBe(201);
+    expect(response.body.anonymous, JSON.stringify(response.body)).toBe(true);
+    const row = await manifestationRow(
+      TENANT_B,
+      response.body.manifestationId as string,
     );
-    if (response.status === 201) {
-      expect(response.body.anonymous).toBe(true);
-      const row = await manifestationRow(
-        TENANT_B,
-        response.body.manifestationId as string,
-      );
-      expect(row).toMatchObject({
-        tenant_id: TENANT_B,
-        anonymous: true,
-        subject_id: null,
-      });
-    }
+    expect(row).toMatchObject({
+      tenant_id: TENANT_B,
+      anonymous: true,
+      subject_id: null,
+    });
     if (!preexistingSubject[TENANT_B]) {
       expect(await subjectIdsOf(TENANT_B, cpfHash(citizen.cpf))).toEqual([]);
     }
```

## Saída (JSON, e nada mais)

```json
{
  "mode": "delivery-review",
  "scope": "hotfix-portal-manifestation-tenant-leak",
  "cycle": 2,
  "verdict": "PASS | REVIEW | FAIL",
  "resolved": [1, 2],
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
