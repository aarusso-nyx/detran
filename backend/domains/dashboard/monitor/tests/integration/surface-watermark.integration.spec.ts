// CTG-0002 §9.4 contra `detran_r11` — C-0002-91 na camada `integration`
// (TASK-0014): `watermarkOf` alimentado pelos valores REAIS das fixtures —
// `auth.tenants.short_name` do tenant canônico (`00-fixtures-core.sql`:
// `DETRAN-AM`) e a `export_log` `pending-approval` de
// `81-fixtures-dashboard-state.sql` (CTG-0001 §5.3: `…0000810005 01`,
// `agency-admin`, `alerts`, `csv`, `N1`, `filters_json = {}`) — deve produzir
// a linha exata de §9.4 com esses campos. Relógio fixo (`at` de entrada).
// Nada é escrito no banco. Fica vermelho (Cannot find module) até TASK-0013
// criar `src/handwritten/surface/watermark.ts`.
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { watermarkOf } from '../../src/handwritten/surface/watermark.js';

const { Client } = pg;
const client = new Client({
  connectionString:
    process.env.DETRAN_TEST_DATABASE_URL ??
    process.env.DATABASE_URL ??
    'postgresql://postgres:postgres@localhost:5432/detran_r11',
});

const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
const EXPORT_ID = '00000000-0000-7000-8000-000081000501';
const AT = new Date('2026-09-21T12:00:00.000Z');

interface ExportRow {
  id: string;
  user_ref: string;
  user_role: string;
  scope: string;
  filters_json: Record<string, unknown>;
  layer: 'N0' | 'N1' | 'N2';
}

let shortName = '';
let exportRow: ExportRow;

beforeAll(async () => {
  await client.connect();
  await client.query(`select set_config('app.role', 'owner', false)`);
  await client.query(`select set_config('app.tenant_id', $1, false)`, [
    TENANT_ID,
  ]);
  const tenant = await client.query<{
    short_name: string | null;
    name: string;
  }>(`select short_name, name from auth.tenants where id = $1`, [TENANT_ID]);
  shortName = tenant.rows[0]!.short_name ?? tenant.rows[0]!.name;
  const exported = await client.query<ExportRow>(
    `select id, user_ref, user_role, scope, filters_json, layer
       from dashboard.export_log where tenant_id = $1 and id = $2`,
    [TENANT_ID, EXPORT_ID],
  );
  exportRow = exported.rows[0]!;
  expect(exportRow, 'fixture export_log 0501 do seed 81').toBeDefined();
});

afterAll(async () => {
  await client.end();
});

describe('CTG-0002 §9.4 — watermarkOf sobre as fixtures reais (C-0002-91 [int])', () => {
  it('C-0002-91 — dado o órgão do tenant (short_name) e a export_log 0501 então a marca d\'água é "DETRAN-AM | camada N1 | usuario <user_ref> (agency-admin) | 2026-09-21T12:00:00.000Z | recorte alerts {} | export <id>"', () => {
    expect(shortName).toBe('DETRAN-AM');
    const line = watermarkOf({
      agency: shortName,
      layer: exportRow.layer,
      userRef: exportRow.user_ref,
      userRole: exportRow.user_role,
      at: AT,
      scope: exportRow.scope,
      filters: exportRow.filters_json,
      exportId: exportRow.id,
    });
    expect(line).toBe(
      `DETRAN-AM | camada N1 | usuario ${exportRow.user_ref} (agency-admin) | 2026-09-21T12:00:00.000Z | recorte alerts {} | export ${EXPORT_ID}`,
    );
  });

  it("C-0002-91 — dado a marca d'água então cabe em export_log.watermark (text) e não contém nome, e-mail nem display_name do usuário (só user_ref + papel)", async () => {
    const line = watermarkOf({
      agency: shortName,
      layer: exportRow.layer,
      userRef: exportRow.user_ref,
      userRole: exportRow.user_role,
      at: AT,
      scope: exportRow.scope,
      filters: exportRow.filters_json,
      exportId: exportRow.id,
    });
    const user = await client.query<{ display_name: string; email: string }>(
      `select display_name, email from auth.users where id = $1`,
      [exportRow.user_ref],
    );
    expect(user.rows[0]).toBeDefined();
    expect(line).not.toContain(user.rows[0]!.display_name);
    expect(line).not.toContain(user.rows[0]!.email);
    expect(line).toContain(exportRow.user_ref);
  });
});
