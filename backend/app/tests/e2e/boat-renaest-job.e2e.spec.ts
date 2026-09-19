import { readFile } from 'node:fs/promises';
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const isolatedDatabaseUrl = process.env.DETRAN_TEST_DATABASE_URL;
const client = isolatedDatabaseUrl
  ? new pg.Client({ connectionString: isolatedDatabaseUrl })
  : undefined;

describe('substrato e isolamento do job T-BOAT-TRANSM', () => {
  beforeAll(async () => {
    if (client) await client.connect();
  });

  afterAll(async () => {
    if (client) await client.end();
  });

  it('dado o DDL 75 quando aplicado então as tabelas do job têm RLS forçado', async () => {
    if (!client) {
      const ddl = await readFile(
        new URL(
          '../../../database/ddl/75-boat-renaest-job.sql',
          import.meta.url,
        ),
        'utf8',
      );
      expect(ddl).toContain('FORCE ROW LEVEL SECURITY');
      expect(ddl).toContain('jobs.discover_active_boat_renaest_tenants');
      return;
    }

    const result = await client.query<{
      relname: string;
      relrowsecurity: boolean;
      relforcerowsecurity: boolean;
    }>(
      `select c.relname, c.relrowsecurity, c.relforcerowsecurity
         from pg_class c
         join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'jobs'
          and c.relname = any($1::text[])
        order by c.relname`,
      [
        'boat_renaest_execution',
        'boat_renaest_identity',
        'boat_renaest_identity_event',
      ],
    );
    expect(result.rows).toHaveLength(3);
    expect(
      result.rows.every((row) => row.relrowsecurity && row.relforcerowsecurity),
    ).toBe(true);
  });

  it('dado o papel role_app_backend quando a superfície administrativa é consultada então não recebe EXECUTE de provisionamento ou descoberta', async () => {
    if (!client) {
      const ddl = await readFile(
        new URL(
          '../../../database/ddl/75-boat-renaest-job.sql',
          import.meta.url,
        ),
        'utf8',
      );
      expect(ddl).toContain(
        'REVOKE ALL ON FUNCTION jobs.discover_active_boat_renaest_tenants() FROM PUBLIC',
      );
      expect(ddl).toContain(
        'REVOKE ALL ON FUNCTION jobs.provision_boat_renaest_identity(uuid, uuid, uuid) FROM PUBLIC',
      );
      return;
    }

    const result = await client.query<{
      routine_name: string;
      grantee: string;
    }>(
      `select routine_name, grantee
         from information_schema.role_routine_grants
        where specific_schema = 'jobs'
          and routine_name = any($1::text[])
          and grantee = 'role_app_backend'`,
      [
        'discover_active_boat_renaest_tenants',
        'provision_boat_renaest_identity',
        'revoke_boat_renaest_identity',
      ],
    );
    expect(result.rows).toEqual([]);
  });

  it('dado a descoberta administrativa quando sua definição é inspecionada então ela não acessa est ou integration', async () => {
    if (!client) {
      const ddl = await readFile(
        new URL(
          '../../../database/ddl/75-boat-renaest-job.sql',
          import.meta.url,
        ),
        'utf8',
      );
      const discovery = ddl.slice(
        ddl.indexOf(
          'CREATE OR REPLACE FUNCTION jobs.discover_active_boat_renaest_tenants',
        ),
      );
      expect(discovery).not.toMatch(/\b(est|integration)\./u);
      return;
    }

    const result = await client.query<{ definition: string }>(
      `select pg_get_functiondef(
         'jobs.discover_active_boat_renaest_tenants()'::regprocedure
       ) as definition`,
    );
    expect(result.rows[0]?.definition).not.toMatch(/\b(est|integration)\./u);
  });
});
