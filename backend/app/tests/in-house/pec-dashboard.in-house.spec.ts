import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  inHouseConfiguration,
  inHouseEnabled,
  type InHouseConfiguration,
} from './config.js';

const { Client } = pg;

describe.skipIf(!inHouseEnabled)('PEC Dashboard in-house read model', () => {
  let configuration: InHouseConfiguration;
  let client: InstanceType<typeof Client>;

  beforeAll(async () => {
    configuration = inHouseConfiguration();
    client = new Client({ connectionString: configuration.readerDatabaseUrl });
    await client.connect();
    await client.query('begin read only');
    await client.query("select set_config('app.tenant_id', $1, true)", [
      configuration.tenantId,
    ]);
  });

  afterAll(async () => {
    if (client) {
      await client.query('rollback');
      await client.end();
    }
  });

  it('exposes only cryptographically verified report facts', async () => {
    const result = await client.query<{
      invalid_hashes: string;
      invalid_signatures: string;
    }>(`select count(*) filter (where content_sha256 !~ '^[0-9a-f]{64}$' or artifact_sha256 !~ '^[0-9a-f]{64}$')::text as invalid_hashes,
              count(*) filter (where signature_format <> 'PAdES-TSA' or certificate_validation_status <> 'GOOD')::text as invalid_signatures
         from ch.report`);
    expect(result.rows[0]).toEqual({
      invalid_hashes: '0',
      invalid_signatures: '0',
    });
  });

  it('does not invent statutory deadlines for Junta Especial', async () => {
    const result = await client.query<{ invalid_deadlines: string }>(
      `select count(*) filter (where designation_deadline_at is not null or decision_deadline_at is not null)::text as invalid_deadlines
         from ch.junta_board where instance = 'SPECIAL'`,
    );
    expect(result.rows[0]?.invalid_deadlines).toBe('0');
  });

  it('keeps toxicology indicators linked to immutable source results', async () => {
    const result = await client.query<{
      orphaned: string;
      stale_source: string;
    }>(
      `select count(*) filter (where r.id is null)::text as orphaned,
              count(*) filter (where r.result <> 'POSITIVE' or s.starts_at <> r.occurred_at)::text as stale_source
         from ch.toxicology_suspension s
         left join ch.periodic_toxicology_result r
           on r.id = s.source_positive_result_id and r.tenant_id = s.tenant_id`,
    );
    expect(result.rows[0]).toEqual({ orphaned: '0', stale_source: '0' });
  });

  it('provides a measurable source freshness watermark', async () => {
    const result = await client.query<{ source_freshness_at: Date | null }>(
      `select greatest(max(report.created_at), max(toxicology.received_at)) as source_freshness_at
         from ch.report report
         full join ch.periodic_toxicology_result toxicology on false`,
    );
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]).toHaveProperty('source_freshness_at');
  });
});
