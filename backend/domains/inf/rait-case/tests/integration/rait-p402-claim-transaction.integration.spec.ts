import { randomUUID } from 'node:crypto';
import type pg from 'pg';
import { describe, expect, it } from 'vitest';
import {
  ACTOR,
  TENANT,
  withRealAppConnection,
} from './rait-case-runtime.fixture.js';

const CASE = '00000000-0000-7000-8000-000010000018';
const OTHER_TENANT = '00000000-0000-7000-8000-00000000a002';
const table = 'inf.rait_claim_legacy_qualification';

async function requireQualificationSchema(client: pg.Client) {
  const found = await client.query<{ relation: string | null }>(
    "select to_regclass('inf.rait_claim_legacy_qualification')::text as relation",
  );
  expect(
    found.rows[0]?.relation,
    'S2 schema pending: absence is not a security RED',
  ).toBe(table);
}

async function heldFixture(
  client: pg.Client,
  overrides: Record<string, unknown> = {},
) {
  const source = await client.query<{ version: number; state: string }>(
    'select version,state from inf.rait_case where tenant_id=$1 and id=$2',
    [TENANT, CASE],
  );
  expect(source.rows).toHaveLength(1);
  // This synthetic hold exercises storage constraints only. A locator/nonempty reason
  // is not admitted provenance and must never establish runtime claim eligibility.
  const assignments = await client.query<{ id: string }>(
    'select id from inf.rait_assignment where tenant_id=$1 and case_id=$2 and active order by id',
    [TENANT, CASE],
  );
  return {
    id: randomUUID(),
    tenant_id: TENANT,
    case_id: CASE,
    observed_version: source.rows[0]!.version,
    observed_state: source.rows[0]!.state,
    assignment_status: assignments.rows.length ? 'assigned' : 'unassigned',
    classification: 'hold',
    revision: 700001,
    admission_ref: null,
    distribution_ref: null,
    assignment_ref: assignments.rows[0]
      ? `sql:inf.rait_assignment:${assignments.rows[0].id}`
      : null,
    pool_scope_ref: null,
    reason: 'explicit synthetic storage-only hold; not qualified for claim',
    reviewer_id: ACTOR,
    authorization_ref: `receipt:${randomUUID()}`,
    observed_at: '2026-10-19T12:00:00.123456Z',
    ...overrides,
  };
}
async function insert(client: pg.Client, row: Record<string, unknown>) {
  const keys = Object.keys(row);
  return client.query(
    `insert into ${table} (${keys.join(',')}) values (${keys.map((_, i) => `$${i + 1}`).join(',')}) returning id`,
    keys.map((key) => row[key]),
  );
}
async function rowSnapshot(client: pg.Client, id: string) {
  return (
    await client.query<{ row: unknown }>(
      `select to_jsonb(q) as row from ${table} q where tenant_id=$1 and id=$2`,
      [TENANT, id],
    )
  ).rows;
}

// Direct PostgreSQL storage sensors. Public HTTP/DB suites independently prove the
// resolver's authentic receipt, claim stages, rollback and WIP concurrency contract.
describe('S2 legacy disposition transaction invariants (schema-pending before generation)', () => {
  const rejected: Array<[string, Record<string, unknown>, string]> = [
    ['nonpositive observed version', { observed_version: 0 }, '23514'],
    ['nonpositive revision', { revision: 0 }, '23514'],
    ['unknown classification', { classification: 'guess_eligible' }, '23514'],
    ['unknown assignment status', { assignment_status: 'unknown' }, '23514'],
    ['blank authorization', { authorization_ref: '  ' }, '23514'],
    ['hold without reason', { reason: null }, '23514'],
    ['hold with blank reason', { reason: '  ' }, '23514'],
    [
      'unassigned qualification without actual reference fields',
      {
        classification: 'qualified_unassigned',
        observed_state: 'DISTRIBUIDO',
        assignment_status: 'unassigned',
        assignment_ref: null,
      },
      '23514',
    ],
    [
      'assigned preservation without assignment ref',
      {
        classification: 'preserve_assigned',
        assignment_status: 'assigned',
        assignment_ref: null,
      },
      '23514',
    ],
    ['nonexistent case', { case_id: randomUUID() }, '23503'],
  ];
  for (const [label, override, code] of rejected)
    it(`rejects ${label} without persisting a partial disposition`, async () =>
      withRealAppConnection(async (client) => {
        await requireQualificationSchema(client);
        const row = await heldFixture(client, override);
        await client.query('savepoint invalid_disposition');
        try {
          await expect(insert(client, row)).rejects.toMatchObject({ code });
        } finally {
          await client.query('rollback to savepoint invalid_disposition');
        }
        expect(await rowSnapshot(client, row.id as string)).toEqual([]);
      }));

  it('same case/version/revision is unique while a new append-only revision is independent', async () =>
    withRealAppConnection(async (client) => {
      await requireQualificationSchema(client);
      const row = await heldFixture(client);
      expect((await insert(client, row)).rows).toEqual([{ id: row.id }]);
      await client.query('savepoint duplicate_disposition');
      try {
        await expect(
          insert(client, { ...row, id: randomUUID() }),
        ).rejects.toMatchObject({ code: '23505' });
      } finally {
        await client.query('rollback to savepoint duplicate_disposition');
      }
      expect(
        (await insert(client, { ...row, id: randomUUID(), revision: 700002 }))
          .rowCount,
      ).toBe(1);
      expect(await rowSnapshot(client, row.id as string)).toHaveLength(1);
    }));

  for (const verb of ['update', 'delete'] as const)
    it(`denies ${verb} of stored disposition and preserves exact row`, async () =>
      withRealAppConnection(async (client) => {
        await requireQualificationSchema(client);
        const row = await heldFixture(client);
        await insert(client, row);
        const before = await rowSnapshot(client, row.id as string);
        await client.query('savepoint immutable_disposition');
        try {
          await expect(
            client.query(
              verb === 'update'
                ? `update ${table} set reason='rewritten' where tenant_id=$1 and id=$2`
                : `delete from ${table} where tenant_id=$1 and id=$2`,
              [TENANT, row.id],
            ),
          ).rejects.toMatchObject({ code: '42501' });
        } finally {
          await client.query('rollback to savepoint immutable_disposition');
        }
        expect(await rowSnapshot(client, row.id as string)).toEqual(before);
      }));

  it('denies UPDATE of generator metadata updated_at and preserves the exact row', async () =>
    withRealAppConnection(async (client) => {
      await requireQualificationSchema(client);
      const row = await heldFixture(client);
      await insert(client, row);
      const before = await rowSnapshot(client, row.id as string);
      await client.query('savepoint immutable_metadata');
      try {
        await expect(
          client.query(
            `update ${table} set updated_at = clock_timestamp() where tenant_id=$1 and id=$2`,
            [TENANT, row.id],
          ),
        ).rejects.toMatchObject({ code: '42501' });
      } finally {
        await client.query('rollback to savepoint immutable_metadata');
      }
      expect(await rowSnapshot(client, row.id as string)).toEqual(before);
    }));

  it('request role sees its disposition but cannot read or insert under another tenant', async () =>
    withRealAppConnection(async (client) => {
      await requireQualificationSchema(client);
      const identity = (
        await client.query<{ role: string; bypass: boolean }>(
          'select current_role as role,rolbypassrls as bypass from pg_roles where rolname=current_role',
        )
      ).rows[0];
      expect(identity).toEqual({ role: 'role_app_backend', bypass: false });
      const row = await heldFixture(client);
      await insert(client, row);
      expect(await rowSnapshot(client, row.id as string)).toHaveLength(1);
      await client.query("select set_config('app.tenant_id',$1,true)", [
        OTHER_TENANT,
      ]);
      expect(await rowSnapshot(client, row.id as string)).toEqual([]);
      await client.query('savepoint cross_tenant_disposition');
      try {
        await expect(
          insert(client, { ...row, id: randomUUID(), revision: 700003 }),
        ).rejects.toMatchObject({ code: '42501' });
      } finally {
        await client.query('rollback to savepoint cross_tenant_disposition');
      }
    }));
});
