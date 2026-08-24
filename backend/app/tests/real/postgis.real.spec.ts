import pg from 'pg';
import { describe, expect, it } from 'vitest';

const { Client } = pg;
const realDatabaseUrl = process.env.DETRAN_REAL_DATABASE_URL;

describe('real DETRAN PostgreSQL contract', () => {
  it.runIf(Boolean(realDatabaseUrl))(
    'has PostGIS and forced RLS on audit.events',
    async () => {
      const client = new Client({ connectionString: realDatabaseUrl });
      await client.connect();
      try {
        const result = await client.query<{ postgis: string; forced: boolean }>(
          `select postgis_version() as postgis,
                (select relforcerowsecurity from pg_class where oid = 'audit.events'::regclass) as forced`,
        );
        expect(result.rows[0]?.postgis).toBeTruthy();
        expect(result.rows[0]?.forced).toBe(true);
      } finally {
        await client.end();
      }
    },
  );
});
