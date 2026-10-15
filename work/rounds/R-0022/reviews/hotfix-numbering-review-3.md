# Delivery-review — hotfix de numeração e turno offline, ciclo 3 (restrito ao item 3)

> Reviewer da família oposta (Codex Sol 6, nível grande). Papel: **Auditor** (Art. 18), somente leitura
> na worktree `/Users/aarusso/Development/detran/.claude/worktrees/agent-adc1a23de1909fe73`. Responda
> **apenas** com o JSON.

Avalie só a correção do `high` do ciclo 2
(`/Users/aarusso/Development/detran/.claude/worktrees/r-0022-stynx-sse-tenancy-c949d9/work/rounds/R-0022/reviews/hotfix-numbering-review-2.json`,
item 3: `shift_id` NULL escapa do índice) e o texto novo (`git diff 48931a3f..HEAD`): fonte
`work/rounds/R-0008/contracts/CTG-0002.md` §5.10 (`shift_id` obrigatório) → check constraint
`ck_ops_numbering_reservation_reserved_shift` (`status <> 'reserved' or shift_id is not null`) no
blueprint com pré-checagem gerada, antes do índice; violação 23514 → 422 `TEAT.VALIDATION_FAILED`
(`shift_id` required) no interceptor; e2e POST/PATCH com `shift_id` null; pré-checagem em clone;
fixture r21 com turno. Resultados informados: provas 14/14, pacotes, e2e 51 + 22, gates.

````diff
diff --git a/backend/app/src/unique-violation.interceptor.ts b/backend/app/src/unique-violation.interceptor.ts
index 204ecf30..39cfd976 100644
--- a/backend/app/src/unique-violation.interceptor.ts
+++ b/backend/app/src/unique-violation.interceptor.ts
@@ -3,7 +3,8 @@
 //
 // Os comandos (`open-shift`, `reserve-numbering`) já devolvem o código próprio; as rotas CRUD
 // geradas e `FieldOperationsController` gravam direto pela porta de repositório e, sem esta
-// tradução, a violação `23505` chegava ao cliente como 500. O mapa é fechado: só os índices
+// tradução, a violação `23505` chegava ao cliente como 500. A restrição de turno obrigatório
+// da reserva (`23514`) segue o mesmo caminho. O mapa é fechado: só os índices e a restrição
 // listados são traduzidos, e qualquer outro erro segue intocado para os filtros do app.
 import type {
   CallHandler,
@@ -30,7 +31,10 @@ export interface RejectedWrite {
 }

 interface UniqueRule {
+  /** `23505` (índice único) ou `23514` (restrição `check`). */
+  sqlState: '23505' | '23514';
   code: string;
+  status: number;
   message: string;
   /** Contexto do catálogo, lido na linha ativa que já ocupa a chave. */
   context(query: Query, write: RejectedWrite): Promise<Record<string, unknown>>;
@@ -69,6 +73,8 @@ async function keyOf(
 /** Índice → recusa de negócio (teat-error-catalog.md). */
 export const ACTIVE_UNIQUE_RULES: Readonly<Record<string, UniqueRule>> = {
   ux_ops_shift_tenant_id_agent_id_open: {
+    sqlState: '23505',
+    status: 409,
     code: 'TEAT.SHIFT_ALREADY_OPEN',
     message: 'Já existe turno aberto para o agente.',
     async context(query, write) {
@@ -86,6 +92,8 @@ export const ACTIVE_UNIQUE_RULES: Readonly<Record<string, UniqueRule>> = {
     },
   },
   ux_numbering_reservation_tenant_id_device_id_shift_id_reserved: {
+    sqlState: '23505',
+    status: 409,
     code: 'TEAT.NUMBERING_RESERVATION_ACTIVE_EXISTS',
     message: 'Já existe reserva vigente para o dispositivo e turno.',
     async context(query, write) {
@@ -105,10 +113,20 @@ export const ACTIVE_UNIQUE_RULES: Readonly<Record<string, UniqueRule>> = {
       return { reservationId: row ? String(row.id) : null };
     },
   },
+  // §5.10 (CTG-0002): reserva `reserved` exige turno.
+  ck_ops_numbering_reservation_reserved_shift: {
+    sqlState: '23514',
+    status: 422,
+    code: 'TEAT.VALIDATION_FAILED',
+    message: 'Dados inválidos para o comando.',
+    async context() {
+      return { fields: [{ path: 'shift_id', rule: 'required' }] };
+    },
+  },
 };

 interface PgUniqueViolation {
-  code: '23505';
+  code: '23505' | '23514';
   constraint: string;
 }

@@ -121,7 +139,10 @@ export function uniqueViolationOf(
     const candidate = current as Partial<PgUniqueViolation> & {
       cause?: unknown;
     };
-    if (candidate.code === '23505' && typeof candidate.constraint === 'string')
+    if (
+      (candidate.code === '23505' || candidate.code === '23514') &&
+      typeof candidate.constraint === 'string'
+    )
       return candidate as PgUniqueViolation;
     current = candidate.cause;
   }
@@ -164,7 +185,7 @@ export class UniqueViolationInterceptor implements NestInterceptor {
   ): Promise<never> {
     const violation = uniqueViolationOf(error);
     const rule = violation ? ACTIVE_UNIQUE_RULES[violation.constraint] : null;
-    if (!violation || !rule) throw error;
+    if (!violation || !rule || rule.sqlState !== violation.code) throw error;
     const context = await withTenantContext(
       this.database,
       this.requestContext,
@@ -183,7 +204,7 @@ export class UniqueViolationInterceptor implements NestInterceptor {
         ),
     ).catch(() => ({}));
     throw new DetranError(rule.code, {
-      status: 409,
+      status: rule.status,
       context,
       message: rule.message,
       cause: error,
diff --git a/backend/app/tests/e2e/ops-active-uniqueness-routes.e2e.spec.ts b/backend/app/tests/e2e/ops-active-uniqueness-routes.e2e.spec.ts
index 6e9570dd..c1470747 100644
--- a/backend/app/tests/e2e/ops-active-uniqueness-routes.e2e.spec.ts
+++ b/backend/app/tests/e2e/ops-active-uniqueness-routes.e2e.spec.ts
@@ -42,6 +42,7 @@ const ids = {
   range: randomUUID(),
   reservationReserved: randomUUID(),
   reservationCancelled: randomUUID(),
+  reservationCancelledNoShift: randomUUID(),
 };

 function headers(role: string): Record<string, string> {
@@ -158,6 +159,23 @@ beforeAll(async () => {
       `uniq-cancelled-${ids.range.slice(0, 8)}`,
     ],
   );
+  // Reserva liquidada sem turno: estado admitido (a exigência de turno vale para `reserved`).
+  await client.query(
+    `insert into ops.numbering_reservation
+       (id, tenant_id, range_id, traffic_agency_id, agent_id, device_id, shift_id,
+        idempotency_key, start_number, end_number, valid_until, status)
+     values ($1, $2, $3, $4, $5, $6, null, $7, 2029000013, 2029000014,
+             '2026-12-31T23:59:59-04:00', 'cancelled')`,
+    [
+      ids.reservationCancelledNoShift,
+      TENANT_ID,
+      ids.range,
+      AGENCY_ID,
+      ids.agent,
+      ids.device,
+      `uniq-cancelled-no-shift-${ids.range.slice(0, 8)}`,
+    ],
+  );

   const { NestFactory: factory } = await import('@nestjs/core');
   const { AppModule } = await import('../../src/app.module.js');
@@ -264,4 +282,66 @@ describe('rotas CRUD de ops — unicidade de turno aberto e de reserva ativa', (
     });
     expect(await activeReservations()).toBe(1);
   });
+
+  // Ciclo 2 da revisão: o índice único trata NULL como distinto, então uma reserva `reserved`
+  // sem turno escaparia da unicidade por dispositivo e turno. §5.10 do CTG-0002 exige
+  // `shift_id` na reserva: `reserved` sem turno é recusada (422 `TEAT.VALIDATION_FAILED`,
+  // `fields: [{ path: 'shift_id', rule: 'required' }]`), nunca gravada.
+  const reservedWithoutShift = () =>
+    count(
+      `select count(*)::integer as count from ops.numbering_reservation
+        where tenant_id = $1 and device_id = $2 and shift_id is null
+          and status = 'reserved'`,
+      [TENANT_ID, ids.device],
+    );
+
+  it('dado um dispositivo quando POST /v1/ops/offline-sync/numbering-reservations cria duas reservas reserved com shift_id null então as duas recebem 422 TEAT.VALIDATION_FAILED em shift_id e nenhuma reserva sem turno nasce', async () => {
+    for (const [index, start] of [2029000015, 2029000017].entries()) {
+      const response = await request(app.getHttpServer())
+        .post('/v1/ops/offline-sync/numbering-reservations')
+        .set(headers('technical-admin'))
+        .send({
+          range_id: ids.range,
+          traffic_agency_id: AGENCY_ID,
+          agent_id: ids.agent,
+          device_id: ids.device,
+          shift_id: null,
+          idempotency_key: `uniq-null-${index}-${randomUUID().slice(0, 8)}`,
+          start_number: start,
+          end_number: start + 1,
+          valid_until: '2026-12-31T23:59:59-04:00',
+          status: 'reserved',
+        });
+      expect(response.status, JSON.stringify(response.body)).toBe(422);
+      expect(response.body).toMatchObject({
+        code: 'TEAT.VALIDATION_FAILED',
+        context: { fields: [{ path: 'shift_id', rule: 'required' }] },
+      });
+    }
+    expect(await reservedWithoutShift()).toBe(0);
+  });
+
+  it('dado reservas do dispositivo quando PATCH /v1/ops/offline-sync/numbering-reservations/:id tira o turno de uma reserved ou reativa uma cancelada sem turno então 422 TEAT.VALIDATION_FAILED em shift_id e nada muda', async () => {
+    const detach = await request(app.getHttpServer())
+      .patch(
+        `/v1/ops/offline-sync/numbering-reservations/${ids.reservationReserved}`,
+      )
+      .set(headers('technical-admin'))
+      .send({ shift_id: null });
+    const reactivate = await request(app.getHttpServer())
+      .patch(
+        `/v1/ops/offline-sync/numbering-reservations/${ids.reservationCancelledNoShift}`,
+      )
+      .set(headers('technical-admin'))
+      .send({ status: 'reserved' });
+    for (const response of [detach, reactivate]) {
+      expect(response.status, JSON.stringify(response.body)).toBe(422);
+      expect(response.body).toMatchObject({
+        code: 'TEAT.VALIDATION_FAILED',
+        context: { fields: [{ path: 'shift_id', rule: 'required' }] },
+      });
+    }
+    expect(await reservedWithoutShift()).toBe(0);
+    expect(await activeReservations()).toBe(1);
+  });
 });
diff --git a/backend/app/tests/e2e/r21-offline-sync.e2e.spec.ts b/backend/app/tests/e2e/r21-offline-sync.e2e.spec.ts
index 32495b17..0bb60f00 100644
--- a/backend/app/tests/e2e/r21-offline-sync.e2e.spec.ts
+++ b/backend/app/tests/e2e/r21-offline-sync.e2e.spec.ts
@@ -132,8 +132,9 @@ beforeAll(async () => {
   await client.query(
     `insert into ops.numbering_reservation
        (id, tenant_id, range_id, traffic_agency_id, agent_id, device_id,
-        idempotency_key, start_number, end_number, valid_until, status)
-     values ($1, $2, $3, $4, $5, $6, $7, 2027000001, 2027000001,
+        shift_id, idempotency_key, start_number, end_number, valid_until,
+        status)
+     values ($1, $2, $3, $4, $5, $6, $7, $8, 2027000001, 2027000001,
              '2026-12-31T23:59:59-04:00', 'reserved')`,
     [
       tenantBReservationId,
@@ -142,6 +143,8 @@ beforeAll(async () => {
       randomUUID(),
       randomUUID(),
       randomUUID(),
+      // §5.10: reserva `reserved` sempre tem turno.
+      randomUUID(),
       `r21-http-b-reservation-${randomUUID().slice(0, 8)}`,
     ],
   );
diff --git a/backend/app/tests/integration/offline-unique-index-precheck.integration.spec.ts b/backend/app/tests/integration/offline-unique-index-precheck.integration.spec.ts
index 74df8b2d..c0fe2769 100644
--- a/backend/app/tests/integration/offline-unique-index-precheck.integration.spec.ts
+++ b/backend/app/tests/integration/offline-unique-index-precheck.integration.spec.ts
@@ -40,6 +40,8 @@ const SHIFT_INDEX = 'ux_ops_shift_tenant_id_agent_id_open';
 const RESERVATION_INDEX =
   'ux_numbering_reservation_tenant_id_device_id_shift_id_reserved';
 const PROCEDURE = 'backend/database/ddl/README.md';
+// Ciclo 2 da revisão: reserva `reserved` exige turno (§5.10) — check com pré-checagem.
+const SHIFT_REQUIRED_CHECK = 'ck_ops_numbering_reservation_reserved_shift';

 type PgClient = InstanceType<typeof Client>;

@@ -77,6 +79,7 @@ let tenantId: string;
 let field: Awaited<ReturnType<typeof seedField>>;
 const extraShift = randomUUID();
 const reservations = [randomUUID(), randomUUID()];
+const shiftless = randomUUID();

 async function owner(): Promise<void> {
   await seeder.query(`select set_config('app.role', 'owner', false)`);
@@ -197,4 +200,61 @@ describe('hotfix — pré-checagem de duplicatas antes dos índices únicos parc
     expect(await indexExists(SHIFT_INDEX)).toBe(true);
     expect(await indexExists(RESERVATION_INDEX)).toBe(true);
   }, 180_000);
+
+  it('dado uma reserva reserved sem turno num banco anterior à regra quando a DDL é aplicada então ela falha com mensagem que nomeia a regra, o tenant, o dispositivo, a reserva e o procedimento, e a regra não é criada', async () => {
+    await owner();
+    await seeder.query(
+      `alter table ops.numbering_reservation drop constraint if exists ${SHIFT_REQUIRED_CHECK}`,
+    );
+    await seeder.query(
+      `insert into ops.numbering_reservation
+         (id, tenant_id, range_id, traffic_agency_id, agent_id, device_id,
+          shift_id, idempotency_key, start_number, end_number, valid_until,
+          status)
+       values ($1, $2, $3, $4, $5, $6, null, $7, 2026000009, 2026000009,
+               '2026-12-31T23:59:59-04:00', 'reserved')`,
+      [
+        shiftless,
+        tenantId,
+        field.rangeId,
+        field.agencyId,
+        field.agentId,
+        field.otherDeviceId,
+        `ux-precheck-${shiftless.slice(0, 8)}`,
+      ],
+    );
+
+    const applied = applyDdl();
+
+    expect(applied.status).not.toBe(0);
+    expect(applied.output).toContain(SHIFT_REQUIRED_CHECK);
+    expect(applied.output).toContain(tenantId);
+    expect(applied.output).toContain(field.otherDeviceId);
+    expect(applied.output).toContain(shiftless);
+    expect(applied.output).toContain(PROCEDURE);
+    const present = await seeder.query<{ count: number }>(
+      `select count(*)::integer as count from pg_constraint
+        where conname = $1`,
+      [SHIFT_REQUIRED_CHECK],
+    );
+    expect(present.rows[0]!.count).toBe(0);
+  }, 180_000);
+
+  it('dado a reserva sem turno liquidada pela operação quando a DDL é aplicada então ela conclui e a regra existe', async () => {
+    await owner();
+    await seeder.query(
+      `update ops.numbering_reservation set status = 'cancelled' where id = $1`,
+      [shiftless],
+    );
+
+    const applied = applyDdl();
+
+    expect(applied.status, applied.output).toBe(0);
+    const present = await seeder.query<{ count: number }>(
+      `select count(*)::integer as count from pg_constraint
+        where conname = $1`,
+      [SHIFT_REQUIRED_CHECK],
+    );
+    expect(present.rows[0]!.count).toBe(1);
+  }, 180_000);
 });
diff --git a/backend/database/ddl/18-ops-offline-sync.sql b/backend/database/ddl/18-ops-offline-sync.sql
index b5014b11..8c8f31ac 100644
--- a/backend/database/ddl/18-ops-offline-sync.sql
+++ b/backend/database/ddl/18-ops-offline-sync.sql
@@ -1,4 +1,4 @@
--- Generated from BP-OPS-OFFLINE-SYNC-001 v1.3.0 sha256:ff9d218be3314b511ef2cdab143c94785c99ffe446405136e001f85f8978c1ad
+-- Generated from BP-OPS-OFFLINE-SYNC-001 v1.3.0 sha256:56d0c4dd4d9f1a20f38bbcc7372af113898d34e435e79b5cccc2ab1e077d0479

 -- Regenerable-only DDL for BP-OPS-OFFLINE-SYNC-001; request-path writes use role_app_backend.

@@ -41,8 +41,27 @@ create table if not exists ops.numbering_reservation (
   created_at timestamptz default now() not null,
   updated_at timestamptz,
   constraint pk_numbering_reservation primary key (id),
+  constraint ck_ops_numbering_reservation_reserved_shift check (status <> 'reserved' or shift_id is not null),
   constraint fk_ops_numbering_reservation_range foreign key (range_id) references ops.ait_numbering_range (id)
 );
+do $$
+declare
+  violations text;
+begin
+  if not exists (select 1 from pg_constraint where conname = 'ck_ops_numbering_reservation_reserved_shift' and conrelid = 'ops.numbering_reservation'::regclass) then
+    select string_agg(format('tenant_id=%s device_id=%s id=%s', tenant_id, device_id, id), '; ')
+      into violations
+      from ops.numbering_reservation where not (status <> 'reserved' or shift_id is not null);
+    if violations is not null then
+      raise exception 'Restricao ops.numbering_reservation.ck_ops_numbering_reservation_reserved_shift nao pode ser criada: linhas que a violam (status <> ''reserved'' or shift_id is not null): %. Resolva-as pelo procedimento "Duplicatas antes de indice unico parcial" de backend/database/ddl/README.md e reaplique a DDL.', violations;
+    end if;
+  end if;
+end $$;
+do $$ begin
+  if not exists (select 1 from pg_constraint where conname = 'ck_ops_numbering_reservation_reserved_shift' and conrelid = 'ops.numbering_reservation'::regclass) then
+    alter table ops.numbering_reservation add constraint ck_ops_numbering_reservation_reserved_shift check (status <> 'reserved' or shift_id is not null);
+  end if;
+end $$;
 create index if not exists ix_numbering_reservation_tenant_id_agent_id_device_id_status on ops.numbering_reservation (tenant_id, agent_id, device_id, status);
 create unique index if not exists ux_numbering_reservation_tenant_id_idempotency_key on ops.numbering_reservation (tenant_id, idempotency_key) where idempotency_key is not null;
 do $$
diff --git a/backend/database/ddl/README.md b/backend/database/ddl/README.md
index d741d32e..1f6cfc98 100644
--- a/backend/database/ddl/README.md
+++ b/backend/database/ddl/README.md
@@ -92,18 +92,24 @@ simple, automatically updatable compatibility view exposing the columns used by

 ## Duplicatas antes de índice único parcial

-Os índices únicos parciais de "uma linha ativa" são precedidos, na DDL gerada,
-por um bloco de pré-checagem (`precheck: true` no índice do blueprint):
+Os índices únicos parciais de "uma linha ativa" e a restrição de turno
+obrigatório da reserva são precedidos, na DDL gerada, por um bloco de
+pré-checagem (`precheck` no índice ou na `check` do blueprint). A restrição vem
+antes do índice na DDL 18: sem reserva `reserved` sem turno, o agrupamento da
+pré-checagem do índice e a unicidade do índice tratam as mesmas linhas.

-| Índice                                                               | DDL                           | Invariante                                             |
-| -------------------------------------------------------------------- | ----------------------------- | ------------------------------------------------------ |
-| `ops.ux_ops_shift_tenant_id_agent_id_open`                           | `13-ops-field-operations.sql` | um turno `open` por agente e tenant (CTG-0002 §5.4)    |
-| `ops.ux_numbering_reservation_tenant_id_device_id_shift_id_reserved` | `18-ops-offline-sync.sql`     | uma reserva `reserved` por dispositivo e turno (§5.10) |
+| Índice                                                               | DDL                           | Invariante                                                          |
+| -------------------------------------------------------------------- | ----------------------------- | ------------------------------------------------------------------- |
+| `ops.ux_ops_shift_tenant_id_agent_id_open`                           | `13-ops-field-operations.sql` | um turno `open` por agente e tenant (CTG-0002 §5.4)                 |
+| `ops.ux_numbering_reservation_tenant_id_device_id_shift_id_reserved` | `18-ops-offline-sync.sql`     | uma reserva `reserved` por dispositivo e turno (§5.10)              |
+| `ops.ck_ops_numbering_reservation_reserved_shift` (check)            | `18-ops-offline-sync.sql`     | reserva `reserved` sempre tem turno (§5.10: `shift_id` obrigatório) |

 Se o banco já tiver linhas que o índice recusaria, `apply.sh` falha (a
 transação única é desfeita e nada é aplicado) com a mensagem
 `Indice unico <índice> nao pode ser criado: duplicatas em <tabela> (<filtro>): <chaves> linhas=<n>`,
-que lista cada tenant e agente (ou tenant, dispositivo e turno) duplicado. A
+que lista cada tenant e agente (ou tenant, dispositivo e turno) duplicado; a
+restrição falha com `Restricao <restrição> nao pode ser criada: linhas que a violam (...)`,
+listando tenant, dispositivo e id de cada reserva `reserved` sem turno. A
 DDL só detecta: **qual linha manter é decisão da operação**, nunca da DDL.

 Procedimento, antes de reaplicar:
@@ -119,10 +125,15 @@ Procedimento, antes de reaplicar:
           array_agg(id order by reserved_at) as reservations
      from ops.numbering_reservation where status = 'reserved'
     group by tenant_id, device_id, shift_id having count(*) > 1;
+
+   select tenant_id, device_id, id
+     from ops.numbering_reservation
+    where status = 'reserved' and shift_id is null;
    ```

 2. Leve cada grupo ao responsável operacional do órgão (supervisão de campo),
-   que decide qual turno segue aberto e qual reserva segue vigente.
+   que decide qual turno segue aberto, qual reserva segue vigente e o destino
+   de cada reserva `reserved` sem turno.
 3. Aplique a decisão pelos comandos de produção, nunca por `update` direto:
    turno excedente → `POST /v1/ops/mobile-bootstrap/shifts/{id}/close` (com
    `reason`); reserva excedente →
diff --git a/docs/framework/blueprints/BP-OPS-OFFLINE-SYNC-001.json b/docs/framework/blueprints/BP-OPS-OFFLINE-SYNC-001.json
index 5f6e87ce..cd0fbcec 100644
--- a/docs/framework/blueprints/BP-OPS-OFFLINE-SYNC-001.json
+++ b/docs/framework/blueprints/BP-OPS-OFFLINE-SYNC-001.json
@@ -248,6 +248,14 @@
             "precheck": true
           }
         ],
+        "checks": [
+          {
+            "name": "ck_ops_numbering_reservation_reserved_shift",
+            "expression": "status <> 'reserved' or shift_id is not null",
+            "additive": true,
+            "precheck": { "columns": ["tenant_id", "device_id", "id"] }
+          }
+        ],
         "foreignKeys": [
           {
             "name": "fk_ops_numbering_reservation_range",
diff --git a/tools/blueprints/generate.mjs b/tools/blueprints/generate.mjs
index 50d26ce7..96e7b34c 100644
--- a/tools/blueprints/generate.mjs
+++ b/tools/blueprints/generate.mjs
@@ -188,6 +188,31 @@ begin
   end if;
 end $$;`;
 }
+/**
+ * `precheck: { columns }` numa restrição `check` aditiva: antes do `alter table
+ * … add constraint`, um bloco que procura as linhas existentes que a violam e,
+ * havendo, falha listando `columns` de cada uma e o procedimento de
+ * `backend/database/ddl/README.md`. Só detecta; a correção é da operação. Com
+ * a restrição já presente o bloco não varre a tabela.
+ */
+function checkPrecheckSql(module, entity, check) {
+  const table = `${module.namespace}.${entity.table}`;
+  const columns = check.precheck.columns ?? ['id'];
+  const labels = columns.map((column) => `${column}=%s`).join(' ');
+  return `do $$
+declare
+  violations text;
+begin
+  if not exists (select 1 from pg_constraint where conname = '${check.name}' and conrelid = '${table}'::regclass) then
+    select string_agg(format('${labels}', ${columns.join(', ')}), '; ')
+      into violations
+      from ${table} where not (${check.expression});
+    if violations is not null then
+      raise exception 'Restricao ${table}.${check.name} nao pode ser criada: linhas que a violam (${check.expression.replaceAll("'", "''")}): %. Resolva-as pelo procedimento "Duplicatas antes de indice unico parcial" de backend/database/ddl/README.md e reaplique a DDL.', violations;
+    end if;
+  end if;
+end $$;`;
+}
 function tableSql(module, entity) {
   const fields = entityFields(entity);
   const columns = fields.map(
@@ -215,7 +240,9 @@ function tableSql(module, entity) {
     ...(entity.checks ?? [])
       .filter((check) => check.additive)
       .map(
-        (check) => `do $$ begin
+        (
+          check,
+        ) => `${check.precheck ? `${checkPrecheckSql(module, entity, check)}\n` : ''}do $$ begin
   if not exists (select 1 from pg_constraint where conname = '${check.name}' and conrelid = '${module.namespace}.${entity.table}'::regclass) then
     alter table ${module.namespace}.${entity.table} add constraint ${check.name} check (${check.expression})${check.notValid ? ' not valid' : ''};
   end if;
````

```json
{
  "mode": "delivery-review",
  "scope": "hotfix-offline-numbering-shift-races",
  "cycle": 3,
  "verdict": "PASS | REVIEW | FAIL",
  "resolved": [3],
  "findings": [],
  "notes": ["…"]
}
```
