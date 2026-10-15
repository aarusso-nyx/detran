# Delivery-review — hotfix FOR UPDATE com agregado/GROUP BY na sessão RAIT (fora da R-0022)

> Reviewer da família oposta (Codex Sol 6, nível grande). Papel: **Auditor** (Art. 18), somente leitura
> na worktree `/Users/aarusso/Development/detran/.claude/worktrees/agent-a8246ff27f0c2b609` (branch
> `fix/for-update-with-aggregates`, base `origin/main`). Responda **apenas** com o JSON do §Saída.

Política permanente do Owner (R-0022 `AUTHORIZATION.md` Adenda B9). Defeitos:
`rait-session-command.service.ts` ~599 (`count(*) … for update` → "FOR UPDATE is not allowed with
aggregate functions", pedido de vista) e ~1310 (`group by … for update of session, attendance` →
"not allowed with GROUP BY clause", checagem de quórum chamada por `read`, `view` e `vote`). Relatório
do worker: varredura por AST de 1934 arquivos, 140 literais com bloqueio, 7 candidatos, 2 defeitos
(5 falsos positivos por PREPARE); prova de integração com o serviço real sob `role_app_backend`
(0/2 → 2/2); `EXPLAIN` com `LockRows` abaixo do agregado; teste de concorrência com `NOWAIT` (55P03).
Limitação preexistente declarada: dois primeiros pedidos de vista simultâneos do mesmo membro não se
serializam (`max_per_member` pode ser ultrapassado), mantida sem mudança.

Rubrica: (1) a correção preserva conjunto e força dos bloqueios e o resultado das contagens (inclusive
zero presentes → `RAIT.SESSION_QUORUM_MISSING`); (2) a prova exercita o comando de produção com banco
real, sem owner na operação, e roda no CI (confira se `@detran/inf-rait-session test:integration`
integra `backend:test:integration`); (3) varredura crível; (4) nada gerado editado, nada fora do escopo;
(5) a limitação declarada merece OD?

## Diff (origin/main...HEAD)

```diff
diff --git a/backend/domains/inf/rait-session/src/handwritten/rait-session-command.service.ts b/backend/domains/inf/rait-session/src/handwritten/rait-session-command.service.ts
index b1f0bedd..cf9a849f 100644
--- a/backend/domains/inf/rait-session/src/handwritten/rait-session-command.service.ts
+++ b/backend/domains/inf/rait-session/src/handwritten/rait-session-command.service.ts
@@ -596,7 +596,7 @@ export class RaitSessionCommandService {
       fail('RAIT.VIEW_REQUEST_NOT_ALLOWED', 422, { agendaItemId: item.id });
     const used = rows<{ count: string }>(
       await tx.query(
-        'select count(*)::text as count from inf.rait_agenda_item where tenant_id = $1 and view_requested_by = $2 for update',
+        'select count(*)::text as count from (select id from inf.rait_agenda_item where tenant_id = $1 and view_requested_by = $2 for update) locked',
         [context.tenantId, context.actorId],
       ),
     )[0];
@@ -1307,13 +1307,16 @@ export class RaitSessionCommandService {
       fail('RAIT.MEMBER_IMPEDED', 422, { memberId: context.actorId });
     const quorum = rows<{ required: number; observed: number }>(
       await tx.query(
-        `select session.quorum_required as required, count(attendance.id)::integer as observed
-         from inf.rait_session session
-         join inf.rait_attendance attendance
-           on attendance.tenant_id = session.tenant_id and attendance.session_id = session.id
-        where session.tenant_id = $1 and session.id = $2 and attendance.present = true
-        group by session.quorum_required
-        for update of session, attendance`,
+        `select locked.quorum_required as required, count(locked.attendance_id)::integer as observed
+         from (
+           select session.quorum_required, attendance.id as attendance_id
+             from inf.rait_session session
+             join inf.rait_attendance attendance
+               on attendance.tenant_id = session.tenant_id and attendance.session_id = session.id
+            where session.tenant_id = $1 and session.id = $2 and attendance.present = true
+            for update of session, attendance
+         ) locked
+        group by locked.quorum_required`,
         [context.tenantId, item.session_id],
       ),
     )[0];
diff --git a/backend/domains/inf/rait-session/tests/integration/rait-session-lock-aggregate-red.integration.spec.ts b/backend/domains/inf/rait-session/tests/integration/rait-session-lock-aggregate-red.integration.spec.ts
new file mode 100644
index 00000000..323976f9
--- /dev/null
+++ b/backend/domains/inf/rait-session/tests/integration/rait-session-lock-aggregate-red.integration.spec.ts
@@ -0,0 +1,144 @@
+// Hotfix fix/for-update-with-aggregates (política B9 do Owner, R-0022): o PostgreSQL recusa
+// `FOR UPDATE` no mesmo nível de consulta que agregado ou `GROUP BY`. Estes testes exercitam o
+// `RaitSessionCommandService.execute` de produção contra o banco real: a fixture é montada como
+// owner dentro da transação, a operação corre sob `role_app_backend` e tudo termina em rollback.
+// - `read`/`vote`/`view` passam pela checagem de quórum (requireItemReadiness);
+// - `view` também conta os pedidos de vista do membro antes de gravar o novo pedido.
+import pg from 'pg';
+import { afterAll, beforeAll, describe, expect, it } from 'vitest';
+
+import { RaitSessionCommandService } from '../../src/handwritten/rait-session-command.service.js';
+
+const { Client } = pg;
+
+function requiredUrl(name: string): string {
+  const value = process.env[name];
+  if (!value) throw new Error(`${name} is required for the session lock proof`);
+  return value;
+}
+
+const DATABASE_URL = requiredUrl('STYNX_OWNER_DATABASE_URL');
+const EXPECTED_DATABASE = 'detran_r7_ctg1_a2';
+const TENANT = '00000000-0000-7000-8000-00000000a001';
+// Sessão aberta do CETRAN da fixture (quórum 2, membros …018/…019/…020 presentes).
+const OPEN_SESSION = '00000000-0000-7000-8000-000030000004';
+const CASE_ID = '00000000-0000-7000-8000-000010000011';
+const RAPPORTEUR = '00000000-0000-7000-8000-000021000019';
+const MEMBER = '00000000-0000-7000-8000-000021000020';
+const AGENDA_ITEM = '00000000-0000-7000-8000-0000310f0001';
+
+let client: InstanceType<typeof Client>;
+
+type Tx = {
+  query: (sql: string, params?: unknown[]) => Promise<{ rows: unknown[] }>;
+};
+
+function subject(
+  actorId: string,
+  fixture: () => Promise<void>,
+): RaitSessionCommandService {
+  const database = {
+    async tx<T>(work: (tx: Tx) => Promise<T>, options: { role?: string }) {
+      await client.query('begin');
+      try {
+        await client.query(`select set_config('app.role', 'owner', true)`);
+        await client.query(`select set_config('app.tenant_id', $1, true)`, [
+          TENANT,
+        ]);
+        await fixture();
+        await client.query('set local role role_app_backend');
+        await client.query(`select set_config('app.role', $1, true)`, [
+          options.role,
+        ]);
+        await client.query(`select set_config('app.actor_id', $1, true)`, [
+          actorId,
+        ]);
+        return await work({
+          query: (sql, params) => client.query(sql, params),
+        });
+      } finally {
+        await client.query('rollback');
+      }
+    },
+  };
+  const requestContext = {
+    hasActiveContext: () => true,
+    snapshot: () => ({ tenantId: TENANT, actorId }),
+  };
+  return new RaitSessionCommandService(
+    database as never,
+    requestContext as never,
+  );
+}
+
+async function insertAgendaItem(readAt: 'now()' | 'null'): Promise<void> {
+  await client.query(
+    `insert into inf.rait_agenda_item
+       (id, tenant_id, session_id, case_id, position, rapporteur_member_id,
+        opinion_summary, opinion_analysis, opinion_vote, opinion_registered_at,
+        read_at)
+     values ($1, $2, $3, $4, 1, $5, 'resumo', 'análise', 'provimento', now(),
+        ${readAt})`,
+    [AGENDA_ITEM, TENANT, OPEN_SESSION, CASE_ID, RAPPORTEUR],
+  );
+}
+
+describe('hotfix — bloqueio de linha sem agregado nos comandos de sessão', () => {
+  beforeAll(async () => {
+    expect(new URL(DATABASE_URL).pathname.slice(1)).toBe(EXPECTED_DATABASE);
+    client = new Client({ connectionString: DATABASE_URL });
+    await client.connect();
+  });
+
+  afterAll(async () => client?.end());
+
+  it('dado item com parecer em sessão aberta com quórum quando o relator lê o parecer então a checagem de quórum bloqueia e o comando conclui', async () => {
+    const service = subject(RAPPORTEUR, () => insertAgendaItem('null'));
+
+    const result = await service.execute({
+      command: 'read',
+      targetId: AGENDA_ITEM,
+      payload: {},
+      headers: { 'If-Match': 'W/"1"', 'Idempotency-Key': 'lock-proof-read' },
+    });
+
+    expect(result.data).toMatchObject({ id: AGENDA_ITEM, version: 2 });
+    expect(result.data.read_at).not.toBeNull();
+    expect(result.events).toEqual([{ type: 'rait.agenda-item.changed' }]);
+  });
+
+  it('dado item lido em sessão aberta e próxima sessão ordinária futura quando um membro presente pede vista então a contagem de vistas bloqueia e o pedido é gravado', async () => {
+    let nextSession = '';
+    const service = subject(MEMBER, async () => {
+      await insertAgendaItem('now()');
+      const next = await client.query<{ scheduled_for: string }>(
+        `insert into inf.rait_session
+           (tenant_id, judging_body, state, scheduled_for, quorum_required)
+         values ($1, 'cetran', 'FORMANDO_PAUTA',
+           clock_timestamp() + interval '7 days', 2)
+         returning scheduled_for::date::text as scheduled_for`,
+        [TENANT],
+      );
+      nextSession = next.rows[0]!.scheduled_for;
+    });
+
+    const result = await service.execute({
+      command: 'view',
+      targetId: AGENDA_ITEM,
+      payload: {},
+      headers: { 'If-Match': 'W/"1"', 'Idempotency-Key': 'lock-proof-view' },
+    });
+
+    expect(result.data).toMatchObject({
+      id: AGENDA_ITEM,
+      version: 2,
+      view_requested_by: MEMBER,
+    });
+    // node-postgres materializa `date` como meia-noite local.
+    expect(result.data.view_due_on).toBeInstanceOf(Date);
+    expect((result.data.view_due_on as Date).toLocaleDateString('sv-SE')).toBe(
+      nextSession,
+    );
+    expect(result.events).toEqual([{ type: 'rait.agenda-item.changed' }]);
+  });
+});
```

```json
{
  "mode": "delivery-review",
  "scope": "hotfix-for-update-with-aggregates",
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
