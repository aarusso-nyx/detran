# Delivery-review — hotfix do gerador de repositórios (chave da tabela) (fora da R-0022)

> Reviewer da família oposta (Codex Sol 6, nível grande). Papel: **Auditor** (Art. 18), somente leitura
> na worktree `/Users/aarusso/Development/detran/.claude/worktrees/agent-a1329ee439e1ab8eb` (branch
> `fix/generated-billing-invoice-item-key`, base `origin/main`). Responda **apenas** com o JSON do §Saída.

Política permanente do Owner (R-0022 `AUTHORIZATION.md` Adenda B9). Defeito: `tools/blueprints/generate.mjs`
emitia `where id = $1`/`returning id` fixos, ignorando `entity.primaryKey`; `ch.billing_invoice_item`
(PK `(tenant_id, invoice_id, item_id)`, sem `id`) ficou com `findOne`/`update`/`remove` e as rotas
`GET/PATCH/DELETE /v1/ch/billing/billing-invoice-item/:id` sempre em 500 (42703; fora do contrato
OpenAPI). Correção na origem: `addressKey(entity)`; chave simples → coluna da chave (248 entidades
com `id`, saída idêntica byte a byte); chave composta → só `list`/`create`, e erro de geração se o
blueprint pedir `get/update/delete`. Gerados regenerados por `pnpm blueprints:generate` (3 arquivos).
Prova: `tools/check-generated-sql.ts` (`verify:generated-sql`, primeiro passo de
`backend:test:integration`, sem fallback de banco): 3/1221 falham antes, 1218/1218 depois. Resultados:
`blueprints:check`, `contracts:check`, `ch-billing` unit 13/13, `rls-smoke`, `typecheck`,
`verify:decorators`, `format:check`. Fora do escopo declarado: `POST` gerado dessa entidade falha com
23502 (`linked_by` obrigatório sem escrita) e contornaria a guarda do lifecycle.

Rubrica: (1) correção na origem, sem edição à mão de gerado; gerados coerentes com blueprint e hash;
(2) nenhuma mudança observável para as 248 entidades; contrato OpenAPI e clientes inalterados;
(3) o verificador é correto, fail-closed, roda no CI com banco, e o tempo é aceitável; (4) o
fora-de-escopo do `POST` deve bloquear este PR ou pode seguir em hotfix próprio?

## Diff (origin/main...HEAD)

```diff
diff --git a/backend/domains/ch/billing/src/controllers/billing-invoice-item.controller.ts b/backend/domains/ch/billing/src/controllers/billing-invoice-item.controller.ts
index 002ecd9e..4d406020 100644
--- a/backend/domains/ch/billing/src/controllers/billing-invoice-item.controller.ts
+++ b/backend/domains/ch/billing/src/controllers/billing-invoice-item.controller.ts
@@ -19,9 +19,6 @@ export class BillingInvoiceItemController {
   @Get() @Action('read') list() {
     return this.service.findAll();
   }
-  @Get(':id') @Action('read') get(@Param('id') id: string) {
-    return this.service.findOne(id);
-  }
   @Post()
   @Action('create')
   @Audit({
@@ -31,25 +28,4 @@ export class BillingInvoiceItemController {
   create(@Body() dto: CreateBillingInvoiceItemDto) {
     return this.service.create(dto);
   }
-  @Patch(':id')
-  @Action('update')
-  @Audit({
-    action: 'CH_BILLING_INVOICE_ITEM_UPDATE',
-    entity: 'ch.billing_invoice_item',
-  })
-  update(
-    @Param('id') id: string,
-    @Body() dto: Partial<CreateBillingInvoiceItemDto>,
-  ) {
-    return this.service.update(id, dto);
-  }
-  @Delete(':id')
-  @Action('delete')
-  @Audit({
-    action: 'CH_BILLING_INVOICE_ITEM_DELETE',
-    entity: 'ch.billing_invoice_item',
-  })
-  remove(@Param('id') id: string) {
-    return this.service.remove(id);
-  }
 }
diff --git a/backend/domains/ch/billing/src/repositories/billing-invoice-item.repository.ts b/backend/domains/ch/billing/src/repositories/billing-invoice-item.repository.ts
index d5af091b..1bb5b5c3 100644
--- a/backend/domains/ch/billing/src/repositories/billing-invoice-item.repository.ts
+++ b/backend/domains/ch/billing/src/repositories/billing-invoice-item.repository.ts
@@ -1,5 +1,5 @@
 // Generated from BP-CH-BILLING-001 v1.0.0 sha256:8814fad00febff6787905872dd30b4f54fe6c33ab4b750bd471093d1e6186fe4
-import { Injectable, NotFoundException } from '@nestjs/common';
+import { Injectable } from '@nestjs/common';
 import { RequestContext } from '@stynx-nyx/core';
 import { Database, type Transaction } from '@stynx-nyx/data';
 import { withTenantContext } from '@detran/shared';
@@ -35,49 +35,9 @@ export class BillingInvoiceItemRepository {
         ).rows,
     );
   }
-  async findOne(
-    id: string,
-    transaction?: Transaction,
-  ): Promise<BillingInvoiceItem> {
-    const result = await this.execute(transaction, (tx) =>
-      tx.query<BillingInvoiceItem & Record<string, unknown>>(
-        'select * from ch.billing_invoice_item where id = $1 limit 1',
-        [id],
-      ),
-    );
-    const row = result.rows[0];
-    if (!row)
-      throw new NotFoundException('BillingInvoiceItem ' + id + ' not found');
-    return row;
-  }
-  create(
+  async create(
     dto: CreateBillingInvoiceItemDto,
     transaction?: Transaction,
-  ): Promise<BillingInvoiceItem> {
-    return this.write('insert', undefined, dto, transaction);
-  }
-  update(
-    id: string,
-    dto: Partial<CreateBillingInvoiceItemDto>,
-    transaction?: Transaction,
-  ): Promise<BillingInvoiceItem> {
-    return this.write('update', id, dto, transaction);
-  }
-  async remove(id: string, transaction?: Transaction): Promise<void> {
-    const result = await this.execute(transaction, (tx) =>
-      tx.query(
-        'delete from ch.billing_invoice_item where id = $1 returning id',
-        [id],
-      ),
-    );
-    if (!result.rows[0])
-      throw new NotFoundException('BillingInvoiceItem ' + id + ' not found');
-  }
-  private async write(
-    operation: 'insert' | 'update',
-    id: string | undefined,
-    dto: Partial<CreateBillingInvoiceItemDto>,
-    transaction?: Transaction,
   ): Promise<BillingInvoiceItem> {
     const entries = Object.entries(dto).filter(
       ([, value]) => value !== undefined,
@@ -95,21 +55,11 @@ export class BillingInvoiceItemRepository {
       ') values (' +
       columns.map((_, index) => '$' + (index + 1)).join(', ') +
       ') returning *';
-    const updateSql =
-      'update ch.billing_invoice_item set ' +
-      columns.map((field, index) => field + ' = $' + (index + 1)).join(', ') +
-      ', updated_at = now() where id = $' +
-      (columns.length + 1) +
-      ' returning *';
     const result = await this.execute(transaction, (tx) =>
-      tx.query<BillingInvoiceItem & Record<string, unknown>>(
-        operation === 'insert' ? insertSql : updateSql,
-        operation === 'insert' ? values : [...values, id],
-      ),
+      tx.query<BillingInvoiceItem & Record<string, unknown>>(insertSql, values),
     );
     const row = result.rows[0];
-    if (!row)
-      throw new NotFoundException('BillingInvoiceItem ' + id + ' not found');
+    if (!row) throw new Error('BillingInvoiceItem insert returned no row');
     return row;
   }
   private execute<T>(
diff --git a/backend/domains/ch/billing/src/services/billing-invoice-item.service.ts b/backend/domains/ch/billing/src/services/billing-invoice-item.service.ts
index ee1eb97f..d40b6090 100644
--- a/backend/domains/ch/billing/src/services/billing-invoice-item.service.ts
+++ b/backend/domains/ch/billing/src/services/billing-invoice-item.service.ts
@@ -10,19 +10,7 @@ export class BillingInvoiceItemService {
   findAll(): Promise<BillingInvoiceItem[]> {
     return this.repository.findAll();
   }
-  findOne(id: string): Promise<BillingInvoiceItem> {
-    return this.repository.findOne(id);
-  }
   create(dto: CreateBillingInvoiceItemDto): Promise<BillingInvoiceItem> {
     return this.repository.create(dto);
   }
-  update(
-    id: string,
-    dto: Partial<CreateBillingInvoiceItemDto>,
-  ): Promise<BillingInvoiceItem> {
-    return this.repository.update(id, dto);
-  }
-  remove(id: string): Promise<void> {
-    return this.repository.remove(id);
-  }
 }
diff --git a/package.json b/package.json
index 6fd48461..8da14d37 100644
--- a/package.json
+++ b/package.json
@@ -46,8 +46,9 @@
     "stack:smoke": "node tools/stack/smoke.mjs",
     "test:stack": "node --test tools/stack/*.test.mjs",
     "backend:rls-smoke": "tsx tools/check-rls-smoke.ts",
+    "verify:generated-sql": "tsx tools/check-generated-sql.ts",
     "backend:test:unit": "pnpm --filter @detran/shared test && pnpm --filter @detran/est-crash test:unit && pnpm --filter @detran/sefaz-adapter test:unit && pnpm --filter @detran/portal-complaints test:unit && pnpm --filter @detran/ch-clinical-network test:unit && pnpm --filter @detran/ch-patients test:unit && pnpm --filter @detran/ch-encounters test:unit && pnpm --filter @detran/ch-biometrics test:unit && pnpm --filter @detran/ch-exams test:unit && pnpm --filter @detran/ch-clinical-controls test:unit && pnpm --filter @detran/ch-inconsistencies test:unit && pnpm --filter @detran/ch-operational-controls test:unit && pnpm --filter @detran/ch-clinical-reports test:unit && pnpm --filter @detran/ch-process-blocks test:unit && pnpm --filter @detran/ch-telehealth test:unit && pnpm --filter @detran/ch-billing test:unit && pnpm --filter @detran/ch-scheduling test:unit && pnpm --filter @detran/ch-restrictions test:unit && pnpm --filter @detran/ch-retention test:unit && pnpm --filter @detran/inf-normative test:unit && pnpm --filter @detran/inf-ait test:unit && pnpm --filter @detran/inf-measures test:unit && pnpm --filter @detran/inf-alcohol test:unit && pnpm --filter @detran/inf-rait-case test:unit && pnpm --filter @detran/inf-rait-worklist test:unit && pnpm --filter @detran/inf-rait-session test:unit && pnpm --filter @detran/inf-speed test:unit && pnpm --filter @detran/ops-parameter test:unit && pnpm --filter @detran/ops-agency test:unit && pnpm --filter @detran/ops-field test:unit && pnpm --filter @detran/ops-snapshots test:unit && pnpm --filter @detran/ops-evidence test:unit && pnpm --filter @detran/ops-offline-sync test:unit && pnpm --filter @detran/ops-provisioning test:unit && pnpm --filter @detran/app test:unit && pnpm --filter @detran/inf-deadlines test && pnpm --filter @detran/inf-infraction test:unit && pnpm --filter @detran/inf-notification test:unit && pnpm --filter @detran/inf-collection test:unit && pnpm --filter @detran/inf-rait-org test:unit && pnpm --filter @detran/inf-rait-integration test:unit && pnpm --filter @detran/portal-identity test:unit && pnpm --filter @detran/portal-requests test:unit && pnpm --filter @detran/portal-inbox test:unit && pnpm --filter @detran/portal-citizen-service test:unit && pnpm --filter @detran/portal-projections test:unit && pnpm --filter @detran/dashboard-monitor test:unit",
-    "backend:test:integration": "pnpm --filter @detran/app test:integration && pnpm --filter @detran/est-crash test:integration && pnpm --filter @detran/inf-ait test:integration && pnpm --filter @detran/inf-measures test:integration && pnpm --filter @detran/inf-alcohol test:integration && pnpm --filter @detran/ops-parameter test:integration && pnpm --filter @detran/ops-agency test:integration && pnpm --filter @detran/ops-field test:integration && pnpm --filter @detran/ops-snapshots test:integration && pnpm --filter @detran/ops-evidence test:integration && pnpm --filter @detran/ops-offline-sync test:integration && pnpm --filter @detran/ops-provisioning test:integration && pnpm --filter @detran/inf-normative test:integration && pnpm --filter @detran/inf-infraction test:integration && pnpm --filter @detran/inf-notification test:integration && pnpm --filter @detran/inf-collection test:integration && pnpm --filter @detran/inf-rait-case test:integration --exclude '**/rait-priority-upgrade.integration.spec.ts' --passWithNoTests=false && pnpm --filter @detran/inf-rait-worklist test:integration && pnpm --filter @detran/inf-rait-session test:integration && pnpm --filter @detran/inf-rait-org test:integration && pnpm --filter @detran/inf-rait-integration test:integration && pnpm --filter @detran/portal-identity test:integration && pnpm --filter @detran/portal-requests test:integration && pnpm --filter @detran/portal-inbox test:integration && pnpm --filter @detran/portal-citizen-service test:integration && pnpm --filter @detran/portal-projections test:integration && pnpm --filter @detran/dashboard-monitor test:integration",
+    "backend:test:integration": "pnpm verify:generated-sql && pnpm --filter @detran/app test:integration && pnpm --filter @detran/est-crash test:integration && pnpm --filter @detran/inf-ait test:integration && pnpm --filter @detran/inf-measures test:integration && pnpm --filter @detran/inf-alcohol test:integration && pnpm --filter @detran/ops-parameter test:integration && pnpm --filter @detran/ops-agency test:integration && pnpm --filter @detran/ops-field test:integration && pnpm --filter @detran/ops-snapshots test:integration && pnpm --filter @detran/ops-evidence test:integration && pnpm --filter @detran/ops-offline-sync test:integration && pnpm --filter @detran/ops-provisioning test:integration && pnpm --filter @detran/inf-normative test:integration && pnpm --filter @detran/inf-infraction test:integration && pnpm --filter @detran/inf-notification test:integration && pnpm --filter @detran/inf-collection test:integration && pnpm --filter @detran/inf-rait-case test:integration --exclude '**/rait-priority-upgrade.integration.spec.ts' --passWithNoTests=false && pnpm --filter @detran/inf-rait-worklist test:integration && pnpm --filter @detran/inf-rait-session test:integration && pnpm --filter @detran/inf-rait-org test:integration && pnpm --filter @detran/inf-rait-integration test:integration && pnpm --filter @detran/portal-identity test:integration && pnpm --filter @detran/portal-requests test:integration && pnpm --filter @detran/portal-inbox test:integration && pnpm --filter @detran/portal-citizen-service test:integration && pnpm --filter @detran/portal-projections test:integration && pnpm --filter @detran/dashboard-monitor test:integration",
     "backend:test:e2e": "pnpm --filter @detran/app test:e2e && pnpm --filter @detran/ops-agency test:e2e && pnpm --filter @detran/ops-field test:e2e && pnpm --filter @detran/ops-snapshots test:e2e && pnpm --filter @detran/ops-evidence test:e2e && pnpm --filter @detran/ops-offline-sync test:e2e && pnpm --filter @detran/ops-provisioning test:e2e && pnpm --filter @detran/inf-ait test:e2e && pnpm --filter @detran/portal-identity test:e2e && pnpm --filter @detran/portal-requests test:e2e && pnpm --filter @detran/portal-inbox test:e2e && pnpm --filter @detran/portal-citizen-service test:e2e && pnpm --filter @detran/portal-projections test:e2e && pnpm --filter @detran/dashboard-monitor test:e2e",
     "backend:test:real": "pnpm --filter @detran/app test:real",
     "backend:test:in-house": "pnpm --filter @detran/app test:in-house",
diff --git a/tools/blueprints/generate.mjs b/tools/blueprints/generate.mjs
index afc3b7ab..559aa7d5 100644
--- a/tools/blueprints/generate.mjs
+++ b/tools/blueprints/generate.mjs
@@ -254,7 +254,27 @@ function entity(bp, sha, item) {
     )
     .join('\n')}\n}`;
 }
+// The generated CRUD surface addresses one row through a single `:id` route
+// parameter. The key column is the blueprint's declared `primaryKey` minus
+// `tenant_id` (supplied by the tenant context and RLS, never by the caller).
+// An entity whose remaining key is composite cannot be addressed that way, so
+// its key-addressed operations (get/update/delete) are not generated; the
+// generator used to assume an `id` column for every entity (hotfix
+// fix/generated-billing-invoice-item-key, ch.billing_invoice_item).
+function addressKey(entity) {
+  if (!Array.isArray(entity.primaryKey) || !entity.primaryKey.length)
+    throw new Error(`${entity.table}: blueprint entity without primaryKey`);
+  const columns = entity.primaryKey.filter((column) => column !== 'tenant_id');
+  for (const column of columns)
+    if (!entityFields(entity).some((field) => field.name === column))
+      throw new Error(
+        `${entity.table}: primaryKey column ${column} is not a declared field`,
+      );
+  return columns.length === 1 ? columns[0] : undefined;
+}
+const KEYED_OPERATIONS = ['get', 'update', 'delete'];
 function repository(bp, sha, entity, module) {
+  const key = addressKey(entity);
   const name = `${entity.name}Repository`;
   const dtoName = `Create${entity.name}Dto`;
   const writable = entity.fields
@@ -269,7 +289,7 @@ function repository(bp, sha, entity, module) {
     .join(', ');
   return [
     header(bp, sha),
-    `import { Injectable, NotFoundException } from '@nestjs/common';`,
+    `import { Injectable${key ? ', NotFoundException' : ''} } from '@nestjs/common';`,
     `import { RequestContext } from '@stynx-nyx/core';`,
     `import { Database, type Transaction } from '@stynx-nyx/data';`,
     `import { withTenantContext } from '@detran/shared';`,
@@ -285,25 +305,43 @@ function repository(bp, sha, entity, module) {
     `  constructor(private readonly database: Database, private readonly requestContext: RequestContext) {}`,
     `  transaction<T>(work: (transaction: Transaction) => Promise<T>): Promise<T> { return withTenantContext(this.database, this.requestContext, work); }`,
     `  findAll(transaction?: Transaction): Promise<${entity.name}[]> { return this.execute(transaction, async (tx) => (await tx.query<${entity.name} & Record<string, unknown>>('select * from ${module.namespace}.${entity.table} order by created_at desc limit 500')).rows); }`,
-    `  async findOne(id: string, transaction?: Transaction): Promise<${entity.name}> { const result = await this.execute(transaction, (tx) => tx.query<${entity.name} & Record<string, unknown>>('select * from ${module.namespace}.${entity.table} where id = $1 limit 1', [id])); const row = result.rows[0]; if (!row) throw new NotFoundException('${entity.name} ' + id + ' not found'); return row; }`,
-    `  create(dto: ${dtoName}, transaction?: Transaction): Promise<${entity.name}> { return this.write('insert', undefined, dto, transaction); }`,
-    `  update(id: string, dto: Partial<${dtoName}>, transaction?: Transaction): Promise<${entity.name}> { return this.write('update', id, dto, transaction); }`,
-    `  async remove(id: string, transaction?: Transaction): Promise<void> { const result = await this.execute(transaction, (tx) => tx.query('delete from ${module.namespace}.${entity.table} where id = $1 returning id', [id])); if (!result.rows[0]) throw new NotFoundException('${entity.name} ' + id + ' not found'); }`,
-    `  private async write(operation: 'insert' | 'update', id: string | undefined, dto: Partial<${dtoName}>, transaction?: Transaction): Promise<${entity.name}> { const entries = Object.entries(dto).filter(([, value]) => value !== undefined); if (!entries.length || entries.some(([field]) => !WRITABLE_FIELDS.has(field))) throw new Error('Invalid ${entity.name} write fields'); const columns = entries.map(([field]) => field); const values = entries.map(([, value]) => value); const insertSql = 'insert into ${module.namespace}.${entity.table} (' + columns.join(', ') + ') values (' + columns.map((_, index) => '$' + (index + 1)).join(', ') + ') returning *'; const updateSql = 'update ${module.namespace}.${entity.table} set ' + columns.map((field, index) => field + ' = $' + (index + 1)).join(', ') + ', updated_at = now() where id = $' + (columns.length + 1) + ' returning *'; const result = await this.execute(transaction, (tx) => tx.query<${entity.name} & Record<string, unknown>>(operation === 'insert' ? insertSql : updateSql, operation === 'insert' ? values : [...values, id])); const row = result.rows[0]; if (!row) throw new NotFoundException('${entity.name} ' + id + ' not found'); return row; }`,
+    ...(key
+      ? [
+          `  async findOne(id: string, transaction?: Transaction): Promise<${entity.name}> { const result = await this.execute(transaction, (tx) => tx.query<${entity.name} & Record<string, unknown>>('select * from ${module.namespace}.${entity.table} where ${key} = $1 limit 1', [id])); const row = result.rows[0]; if (!row) throw new NotFoundException('${entity.name} ' + id + ' not found'); return row; }`,
+          `  create(dto: ${dtoName}, transaction?: Transaction): Promise<${entity.name}> { return this.write('insert', undefined, dto, transaction); }`,
+          `  update(id: string, dto: Partial<${dtoName}>, transaction?: Transaction): Promise<${entity.name}> { return this.write('update', id, dto, transaction); }`,
+          `  async remove(id: string, transaction?: Transaction): Promise<void> { const result = await this.execute(transaction, (tx) => tx.query('delete from ${module.namespace}.${entity.table} where ${key} = $1 returning ${key}', [id])); if (!result.rows[0]) throw new NotFoundException('${entity.name} ' + id + ' not found'); }`,
+          `  private async write(operation: 'insert' | 'update', id: string | undefined, dto: Partial<${dtoName}>, transaction?: Transaction): Promise<${entity.name}> { const entries = Object.entries(dto).filter(([, value]) => value !== undefined); if (!entries.length || entries.some(([field]) => !WRITABLE_FIELDS.has(field))) throw new Error('Invalid ${entity.name} write fields'); const columns = entries.map(([field]) => field); const values = entries.map(([, value]) => value); const insertSql = 'insert into ${module.namespace}.${entity.table} (' + columns.join(', ') + ') values (' + columns.map((_, index) => '$' + (index + 1)).join(', ') + ') returning *'; const updateSql = 'update ${module.namespace}.${entity.table} set ' + columns.map((field, index) => field + ' = $' + (index + 1)).join(', ') + ', updated_at = now() where ${key} = $' + (columns.length + 1) + ' returning *'; const result = await this.execute(transaction, (tx) => tx.query<${entity.name} & Record<string, unknown>>(operation === 'insert' ? insertSql : updateSql, operation === 'insert' ? values : [...values, id])); const row = result.rows[0]; if (!row) throw new NotFoundException('${entity.name} ' + id + ' not found'); return row; }`,
+        ]
+      : [
+          `  async create(dto: ${dtoName}, transaction?: Transaction): Promise<${entity.name}> { const entries = Object.entries(dto).filter(([, value]) => value !== undefined); if (!entries.length || entries.some(([field]) => !WRITABLE_FIELDS.has(field))) throw new Error('Invalid ${entity.name} write fields'); const columns = entries.map(([field]) => field); const values = entries.map(([, value]) => value); const insertSql = 'insert into ${module.namespace}.${entity.table} (' + columns.join(', ') + ') values (' + columns.map((_, index) => '$' + (index + 1)).join(', ') + ') returning *'; const result = await this.execute(transaction, (tx) => tx.query<${entity.name} & Record<string, unknown>>(insertSql, values)); const row = result.rows[0]; if (!row) throw new Error('${entity.name} insert returned no row'); return row; }`,
+        ]),
     `  private execute<T>(transaction: Transaction | undefined, work: (transaction: SqlTransaction) => Promise<T>): Promise<T> { if (transaction) return work(transaction as SqlTransaction); return withTenantContext(this.database, this.requestContext, (tx) => work(tx as SqlTransaction)); }`,
     '}',
   ].join('\n');
 }
 function service(bp, sha, entity) {
-  return `${header(bp, sha)}\nimport { Injectable } from '@nestjs/common';\nimport { ${entity.name}Repository } from '../repositories/${kebab(entity.name)}.repository.js';\nimport type { ${entity.name} } from '../entities/${kebab(entity.name)}.entity.js';\nimport type { Create${entity.name}Dto } from '../dto/create-${kebab(entity.name)}.dto.js';\n\n@Injectable()\nexport class ${entity.name}Service {\n  constructor(private readonly repository: ${entity.name}Repository) {}\n  findAll(): Promise<${entity.name}[]> { return this.repository.findAll(); }\n  findOne(id: string): Promise<${entity.name}> { return this.repository.findOne(id); }\n  create(dto: Create${entity.name}Dto): Promise<${entity.name}> { return this.repository.create(dto); }\n  update(id: string, dto: Partial<Create${entity.name}Dto>): Promise<${entity.name}> { return this.repository.update(id, dto); }\n  remove(id: string): Promise<void> { return this.repository.remove(id); }\n}`;
+  const keyed = addressKey(entity) !== undefined;
+  return `${header(bp, sha)}\nimport { Injectable } from '@nestjs/common';\nimport { ${entity.name}Repository } from '../repositories/${kebab(entity.name)}.repository.js';\nimport type { ${entity.name} } from '../entities/${kebab(entity.name)}.entity.js';\nimport type { Create${entity.name}Dto } from '../dto/create-${kebab(entity.name)}.dto.js';\n\n@Injectable()\nexport class ${entity.name}Service {\n  constructor(private readonly repository: ${entity.name}Repository) {}\n  findAll(): Promise<${entity.name}[]> { return this.repository.findAll(); }\n${keyed ? `  findOne(id: string): Promise<${entity.name}> { return this.repository.findOne(id); }\n` : ''}  create(dto: Create${entity.name}Dto): Promise<${entity.name}> { return this.repository.create(dto); }\n${keyed ? `  update(id: string, dto: Partial<Create${entity.name}Dto>): Promise<${entity.name}> { return this.repository.update(id, dto); }\n  remove(id: string): Promise<void> { return this.repository.remove(id); }\n` : ''}}`;
 }
 function controller(bp, sha, entity, module) {
   const api = (bp.api?.resources ?? []).find(
     (resource) => resource.entity === entity.name,
   );
-  const operations = new Set(
-    api?.operations ?? ['list', 'get', 'create', 'update', 'delete'],
-  );
+  const keyed = addressKey(entity) !== undefined;
+  const declared = api?.operations ?? [
+    'list',
+    'create',
+    ...(keyed ? KEYED_OPERATIONS : []),
+  ];
+  const unaddressable = keyed
+    ? []
+    : declared.filter((operation) => KEYED_OPERATIONS.includes(operation));
+  if (unaddressable.length)
+    throw new Error(
+      `${bp.id} ${entity.name}: operations ${unaddressable.join(', ')} need a single-column key (primaryKey minus tenant_id)`,
+    );
+  const operations = new Set(declared);
   const resource = `${module.namespace}:${api?.resource ?? kebab(entity.name)}`;
   const route = [
     String(bp.api?.basePath ?? '')
diff --git a/tools/check-generated-sql.ts b/tools/check-generated-sql.ts
new file mode 100644
index 00000000..d8a3a061
--- /dev/null
+++ b/tools/check-generated-sql.ts
@@ -0,0 +1,267 @@
+/**
+ * verify:generated-sql — prepares every SQL statement issued by the generated
+ * blueprint repositories against the test database.
+ *
+ * Each repository listed in tools/blueprints/generated-files.json is
+ * transpiled in memory, its runtime imports are replaced by inert stubs and
+ * each generated operation (findAll, findOne, create, update, remove) is
+ * driven with a recording transaction. Every captured statement is then
+ * `PREPARE`d inside a rolled-back transaction, so a column used in a
+ * `where`/`set`/`order by`/`returning` clause that does not exist in the
+ * applied DDL fails here instead of on the request path.
+ *
+ * Requires DETRAN_TEST_DATABASE_URL (no fallback) pointing at a database with
+ * the canonical DDL applied. It is part of backend:test:integration, not of the
+ * database-free `pnpm check`.
+ */
+import fs from 'node:fs';
+import path from 'node:path';
+
+import pg from 'pg';
+import ts from 'typescript';
+
+interface CapturedStatement {
+  file: string;
+  line: number;
+  operation: string;
+  sql: string;
+}
+
+interface RecordingTransaction {
+  query(
+    sql: string,
+    values?: readonly unknown[],
+  ): Promise<{ rows: Record<string, unknown>[] }>;
+}
+
+type RepositoryInstance = Record<string, unknown>;
+type RepositoryClass = new (
+  database: unknown,
+  requestContext: unknown,
+) => RepositoryInstance;
+
+const root = process.cwd();
+const connectionString = process.env.DETRAN_TEST_DATABASE_URL;
+if (!connectionString) {
+  console.error(
+    'verify:generated-sql requires DETRAN_TEST_DATABASE_URL (no fallback).',
+  );
+  process.exit(2);
+}
+
+const KEY_PLACEHOLDER = '00000000-0000-4000-8000-000000000000';
+const KEYED_OPERATIONS = ['findOne', 'update', 'remove'] as const;
+
+class StubNotFoundException extends Error {}
+
+const stubs: Record<string, Record<string, unknown>> = {
+  '@nestjs/common': {
+    Injectable: () => () => undefined,
+    NotFoundException: StubNotFoundException,
+  },
+  '@stynx-nyx/core': { RequestContext: class RequestContext {} },
+  '@stynx-nyx/data': { Database: class Database {} },
+  '@detran/shared': {
+    withTenantContext: () => {
+      throw new Error('generated repository escaped the recording transaction');
+    },
+  },
+};
+
+function stubRequire(specifier: string): Record<string, unknown> {
+  const stub = stubs[specifier];
+  if (!stub)
+    throw new Error(`unexpected runtime import in repository: ${specifier}`);
+  return stub;
+}
+
+function stringLiterals(
+  source: ts.SourceFile,
+): { text: string; line: number }[] {
+  const found: { text: string; line: number }[] = [];
+  const visit = (node: ts.Node): void => {
+    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node))
+      found.push({
+        text: node.text,
+        line:
+          source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1,
+      });
+    ts.forEachChild(node, visit);
+  };
+  visit(source);
+  return found;
+}
+
+function lineOf(
+  literals: { text: string; line: number }[],
+  sql: string,
+): number {
+  let best: { text: string; line: number } | undefined;
+  for (const literal of literals)
+    if (
+      literal.text.length >= 8 &&
+      sql.includes(literal.text) &&
+      (!best || literal.text.length > best.text.length)
+    )
+      best = literal;
+  return best?.line ?? 0;
+}
+
+function loadRepository(relative: string): {
+  classes: [string, RepositoryClass][];
+  writable: string[];
+  literals: { text: string; line: number }[];
+} {
+  const file = path.join(root, relative);
+  const code = fs.readFileSync(file, 'utf8');
+  const source = ts.createSourceFile(
+    file,
+    code,
+    ts.ScriptTarget.ES2022,
+    true,
+    ts.ScriptKind.TS,
+  );
+  const output = ts.transpileModule(code, {
+    fileName: file,
+    compilerOptions: {
+      module: ts.ModuleKind.CommonJS,
+      target: ts.ScriptTarget.ES2022,
+      experimentalDecorators: true,
+      emitDecoratorMetadata: false,
+    },
+  }).outputText;
+  const exported: Record<string, unknown> = {};
+  const moduleObject = { exports: exported };
+  const probe = `${output}\nmodule.exports.__generatedSqlWritableFields = typeof WRITABLE_FIELDS === 'undefined' ? undefined : [...WRITABLE_FIELDS];`;
+  new Function('require', 'exports', 'module', probe)(
+    stubRequire,
+    exported,
+    moduleObject,
+  );
+  const writable = moduleObject.exports.__generatedSqlWritableFields;
+  if (!Array.isArray(writable))
+    throw new Error(`${relative}: WRITABLE_FIELDS not found`);
+  const classes = Object.entries(moduleObject.exports).filter(
+    (entry): entry is [string, RepositoryClass] =>
+      entry[0].endsWith('Repository') && typeof entry[1] === 'function',
+  );
+  if (!classes.length) throw new Error(`${relative}: no repository class`);
+  return {
+    classes,
+    writable: writable.map(String),
+    literals: stringLiterals(source),
+  };
+}
+
+async function capture(relative: string): Promise<CapturedStatement[]> {
+  const { classes, writable, literals } = loadRepository(relative);
+  const statements: CapturedStatement[] = [];
+  for (const [, Repository] of classes) {
+    const repository = new Repository({}, {});
+    const dto = Object.fromEntries(
+      writable.map((field) => [field, KEY_PLACEHOLDER]),
+    );
+    const run = async (
+      operation: string,
+      call: (tx: RecordingTransaction) => Promise<unknown>,
+    ): Promise<void> => {
+      const tx: RecordingTransaction = {
+        query: async (sql) => {
+          statements.push({
+            file: relative,
+            line: lineOf(literals, sql),
+            operation,
+            sql,
+          });
+          return { rows: [{}] };
+        },
+      };
+      await call(tx);
+    };
+    const method = (name: string) => {
+      const value = repository[name];
+      return typeof value === 'function'
+        ? (value as (...args: unknown[]) => Promise<unknown>).bind(repository)
+        : undefined;
+    };
+    const findAll = method('findAll');
+    const create = method('create');
+    if (!findAll || !create)
+      throw new Error(`${relative}: findAll/create missing`);
+    await run('findAll', (tx) => findAll(tx));
+    if (writable.length) await run('create', (tx) => create(dto, tx));
+    for (const name of KEYED_OPERATIONS) {
+      const keyed = method(name);
+      if (!keyed) continue;
+      if (name === 'update') {
+        if (writable.length)
+          await run(name, (tx) => keyed(KEY_PLACEHOLDER, dto, tx));
+      } else await run(name, (tx) => keyed(KEY_PLACEHOLDER, tx));
+    }
+  }
+  return statements;
+}
+
+const manifest = JSON.parse(
+  fs.readFileSync(
+    path.join(root, 'tools/blueprints/generated-files.json'),
+    'utf8',
+  ),
+) as string[];
+const repositories = manifest.filter((file) => file.endsWith('.repository.ts'));
+if (!repositories.length)
+  throw new Error('no generated repositories in the manifest');
+
+const statements: CapturedStatement[] = [];
+for (const relative of repositories)
+  statements.push(...(await capture(relative)));
+
+const client = new pg.Client({ connectionString });
+await client.connect();
+const failures: (CapturedStatement & { error: string })[] = [];
+const verbose = process.argv.includes('--verbose');
+if (verbose) {
+  console.log('| file:line | operation | statement | result |');
+  console.log('| --- | --- | --- | --- |');
+}
+try {
+  await client.query('begin');
+  for (const statement of statements) {
+    await client.query('savepoint generated_sql');
+    try {
+      await client.query(`prepare generated_sql as ${statement.sql}`);
+      await client.query('deallocate generated_sql');
+      await client.query('release savepoint generated_sql');
+      if (verbose)
+        console.log(
+          `| ${statement.file}:${statement.line} | ${statement.operation} | \`${statement.sql}\` | ok |`,
+        );
+    } catch (error) {
+      await client.query('rollback to savepoint generated_sql');
+      const detail = error as { code?: string; message?: string };
+      failures.push({
+        ...statement,
+        error: `${detail.code ?? '?'} ${detail.message ?? String(error)}`,
+      });
+    }
+  }
+} finally {
+  await client.query('rollback').catch(() => undefined);
+  await client.end();
+}
+
+if (failures.length) {
+  console.error(
+    `verify:generated-sql failed: ${failures.length} of ${statements.length} generated statements do not prepare against the applied DDL`,
+  );
+  console.error('| file:line | operation | statement | error |');
+  console.error('| --- | --- | --- | --- |');
+  for (const failure of failures)
+    console.error(
+      `| ${failure.file}:${failure.line} | ${failure.operation} | \`${failure.sql}\` | ${failure.error} |`,
+    );
+  process.exit(1);
+}
+console.log(
+  `verify:generated-sql passed: ${statements.length} statements from ${repositories.length} generated repositories prepare against the applied DDL`,
+);
```

```json
{
  "mode": "delivery-review",
  "scope": "hotfix-generated-billing-invoice-item-key",
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
