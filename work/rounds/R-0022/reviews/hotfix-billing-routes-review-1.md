# Delivery-review — hotfix: nenhuma rota gerada para BillingInvoiceItem (fora da R-0022)

> Reviewer da família oposta (Codex Sol 6, nível grande). Papel: **Auditor** (Art. 18), somente leitura
> na worktree `/Users/aarusso/Development/detran/.claude/worktrees/agent-abf6ecbb0cf22f3dd` (branch
> `fix/generated-billing-invoice-item-routes`, empilhada sobre o #167). Responda **apenas** com o JSON.

Política B9 do Owner; decisão do Architect (maestro): o contrato OpenAPI não declara rota de
`billing-invoice-item`, o `BillingLifecycleService` vincula itens à fatura por SQL próprio, e o `POST`
gerado falhava sempre (23502, `linked_by`) e contornaria a guarda do lifecycle → `api.resources`
declara `BillingInvoiceItem` com `operations: []`. Gerador inalterado (já aceita lista vazia, padrão de
`CrashLink`). Regeneração: controller sem handlers; os demais 27 arquivos do blueprint só mudam o hash
do cabeçalho; nenhum outro blueprint muda. Prova: teste unitário sobre os metadados de rota do
`BillingModule` (vermelho: GET e POST registrados; verde: nenhuma). Resultados: `ch-billing` unit
14/14, `blueprints:check`, `contracts:check` (inalterado), `verify:generated-sql` 1218, `verify:decorators`,
`verify:role-catalog`, `rls-smoke`, `typecheck`, `format:check`.

Rubrica: (1) decisão coerente com contrato e lifecycle; (2) origem corrigida, gerados só pelo gerador,
só os arquivos esperados; (3) prova suficiente; (4) repositório/serviço gerados sem uso — aceitável.

## Diff relevante (blueprint, controller, teste; demais arquivos só o hash do cabeçalho)

```diff
diff --git a/backend/domains/ch/billing/src/controllers/billing-divergence.controller.ts b/backend/domains/ch/billing/src/controllers/billing-divergence.controller.ts
index f3135169..7c0d9c05 100644
--- a/backend/domains/ch/billing/src/controllers/billing-divergence.controller.ts
+++ b/backend/domains/ch/billing/src/controllers/billing-divergence.controller.ts
@@ -1,4 +1,4 @@
-// Generated from BP-CH-BILLING-001 v1.0.0 sha256:8814fad00febff6787905872dd30b4f54fe6c33ab4b750bd471093d1e6186fe4
+// Generated from BP-CH-BILLING-001 v1.0.0 sha256:dbb379527f32d359e25dee36e8d7232af006c46466c5c86faef3d22de91db860
 import {
   Body,
   Controller,
diff --git a/backend/domains/ch/billing/src/controllers/billing-invoice-item.controller.ts b/backend/domains/ch/billing/src/controllers/billing-invoice-item.controller.ts
index 4d406020..4f9b3e25 100644
--- a/backend/domains/ch/billing/src/controllers/billing-invoice-item.controller.ts
+++ b/backend/domains/ch/billing/src/controllers/billing-invoice-item.controller.ts
@@ -1,4 +1,4 @@
-// Generated from BP-CH-BILLING-001 v1.0.0 sha256:8814fad00febff6787905872dd30b4f54fe6c33ab4b750bd471093d1e6186fe4
+// Generated from BP-CH-BILLING-001 v1.0.0 sha256:dbb379527f32d359e25dee36e8d7232af006c46466c5c86faef3d22de91db860
 import {
   Body,
   Controller,
@@ -16,16 +16,4 @@ import { BillingInvoiceItemService } from '../services/billing-invoice-item.serv
 @Resource('ch:billing-invoice-item')
 export class BillingInvoiceItemController {
   constructor(private readonly service: BillingInvoiceItemService) {}
-  @Get() @Action('read') list() {
-    return this.service.findAll();
-  }
-  @Post()
-  @Action('create')
-  @Audit({
-    action: 'CH_BILLING_INVOICE_ITEM_CREATE',
-    entity: 'ch.billing_invoice_item',
-  })
-  create(@Body() dto: CreateBillingInvoiceItemDto) {
-    return this.service.create(dto);
-  }
 }
diff --git a/backend/domains/ch/billing/src/controllers/billing-invoice.controller.ts b/backend/domains/ch/billing/src/controllers/billing-invoice.controller.ts
index 55c63e5a..34558f08 100644
--- a/backend/domains/ch/billing/src/controllers/billing-invoice.controller.ts
+++ b/backend/domains/ch/billing/src/controllers/billing-invoice.controller.ts
@@ -1,4 +1,4 @@
-// Generated from BP-CH-BILLING-001 v1.0.0 sha256:8814fad00febff6787905872dd30b4f54fe6c33ab4b750bd471093d1e6186fe4
+// Generated from BP-CH-BILLING-001 v1.0.0 sha256:dbb379527f32d359e25dee36e8d7232af006c46466c5c86faef3d22de91db860
 import {
   Body,
   Controller,
diff --git a/backend/domains/ch/billing/src/controllers/billing-item.controller.ts b/backend/domains/ch/billing/src/controllers/billing-item.controller.ts
index cc707459..c054a71f 100644
--- a/backend/domains/ch/billing/src/controllers/billing-item.controller.ts
+++ b/backend/domains/ch/billing/src/controllers/billing-item.controller.ts
@@ -1,4 +1,4 @@
-// Generated from BP-CH-BILLING-001 v1.0.0 sha256:8814fad00febff6787905872dd30b4f54fe6c33ab4b750bd471093d1e6186fe4
+// Generated from BP-CH-BILLING-001 v1.0.0 sha256:dbb379527f32d359e25dee36e8d7232af006c46466c5c86faef3d22de91db860
 import {
   Body,
   Controller,
diff --git a/backend/domains/ch/billing/src/controllers/federal-exam-public-price.controller.ts b/backend/domains/ch/billing/src/controllers/federal-exam-public-price.controller.ts
index 01b32547..66ef47cb 100644
--- a/backend/domains/ch/billing/src/controllers/federal-exam-public-price.controller.ts
+++ b/backend/domains/ch/billing/src/controllers/federal-exam-public-price.controller.ts
@@ -1,4 +1,4 @@
-// Generated from BP-CH-BILLING-001 v1.0.0 sha256:8814fad00febff6787905872dd30b4f54fe6c33ab4b750bd471093d1e6186fe4
+// Generated from BP-CH-BILLING-001 v1.0.0 sha256:dbb379527f32d359e25dee36e8d7232af006c46466c5c86faef3d22de91db860
 import {
   Body,
   Controller,
diff --git a/backend/domains/ch/billing/tests/unit/billing-invoice-item-routes.spec.ts b/backend/domains/ch/billing/tests/unit/billing-invoice-item-routes.spec.ts
new file mode 100644
index 00000000..e1a7ee63
--- /dev/null
+++ b/backend/domains/ch/billing/tests/unit/billing-invoice-item-routes.spec.ts
@@ -0,0 +1,84 @@
+import {
+  METHOD_METADATA,
+  MODULE_METADATA,
+  PATH_METADATA,
+} from '@nestjs/common/constants.js';
+import { RequestMethod } from '@nestjs/common';
+import { describe, expect, it } from 'vitest';
+
+import { BillingModule } from '../../src/billing.module.js';
+
+/**
+ * Hotfix fix/generated-billing-invoice-item-routes (decisão do Architect):
+ * `BillingInvoiceItem` não expõe rota gerada. O vínculo item → fatura é
+ * exclusivo de `BillingLifecycleService.closeInvoice`, que grava `linked_by`
+ * sob a guarda do ciclo de vida; o `POST v1/ch/billing/billing-invoice-item`
+ * gerado falhava sempre com 23502 (`linked_by` não gravável, sem padrão) e
+ * contornaria essa guarda. Lê os mesmos metadados (`controllers` do módulo,
+ * `path`/`method` dos handlers) que o `RouterExplorer` do Nest usa para
+ * registrar rotas, sem subir a aplicação nem o banco.
+ */
+
+interface MountedRoute {
+  controller: string;
+  handler: string;
+  method: string;
+  path: string;
+}
+
+function joinPath(...parts: unknown[]): string {
+  return parts
+    .flatMap((part) => (Array.isArray(part) ? part : [part]))
+    .map((part) => String(part ?? '').replace(/^\/+|\/+$/gu, ''))
+    .filter(Boolean)
+    .join('/');
+}
+
+function mountedRoutes(module: object): MountedRoute[] {
+  const controllers = (Reflect.getMetadata(
+    MODULE_METADATA.CONTROLLERS,
+    module,
+  ) ?? []) as (Function & { name: string; prototype: object })[];
+  const routes: MountedRoute[] = [];
+  for (const controller of controllers) {
+    const prefix: unknown = Reflect.getMetadata(PATH_METADATA, controller);
+    for (const handler of Object.getOwnPropertyNames(controller.prototype)) {
+      if (handler === 'constructor') continue;
+      const fn = (controller.prototype as Record<string, unknown>)[handler];
+      if (typeof fn !== 'function') continue;
+      const path: unknown = Reflect.getMetadata(PATH_METADATA, fn);
+      if (path === undefined) continue;
+      const method = Reflect.getMetadata(METHOD_METADATA, fn) as
+        RequestMethod | undefined;
+      routes.push({
+        controller: controller.name,
+        handler,
+        method: RequestMethod[method ?? RequestMethod.GET],
+        path: joinPath(prefix, path),
+      });
+    }
+  }
+  return routes;
+}
+
+describe('BillingModule — rotas de billing-invoice-item', () => {
+  it('dado o BillingModule gerado quando as rotas são registradas então nenhuma rota …/billing-invoice-item existe (vínculo só por closeInvoice)', () => {
+    const routes = mountedRoutes(BillingModule);
+    // Sanidade: a leitura de metadados enxerga as rotas reais do módulo.
+    expect(routes.map((route) => `${route.method} ${route.path}`)).toContain(
+      'GET v1/ch/billing/invoices',
+    );
+
+    const invoiceItemRoutes = routes.filter(
+      (route) =>
+        route.path.includes('billing-invoice-item') ||
+        route.controller === 'BillingInvoiceItemController',
+    );
+    expect(
+      invoiceItemRoutes.map(
+        (route) =>
+          `${route.method} ${route.path} (${route.controller}.${route.handler})`,
+      ),
+    ).toEqual([]);
+  });
+});
diff --git a/docs/framework/blueprints/BP-CH-BILLING-001.json b/docs/framework/blueprints/BP-CH-BILLING-001.json
index 3a408124..33c1aa8b 100644
--- a/docs/framework/blueprints/BP-CH-BILLING-001.json
+++ b/docs/framework/blueprints/BP-CH-BILLING-001.json
@@ -384,6 +384,10 @@
         "path": "divergences",
         "resource": "invoice",
         "operations": ["list", "get"]
+      },
+      {
+        "entity": "BillingInvoiceItem",
+        "operations": []
       }
     ]
   }
```

```json
{
  "mode": "delivery-review",
  "scope": "hotfix-generated-billing-invoice-item-routes",
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
