import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  inHouseConfiguration,
  inHouseEnabled,
  type InHouseConfiguration,
} from './config.js';

const { Client } = pg;
const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../..',
);

describe.skipIf(!inHouseEnabled)('PEC real in-house environment', () => {
  let configuration: InHouseConfiguration;
  let accessToken: string | undefined;

  beforeAll(() => {
    configuration = inHouseConfiguration();
  });

  afterAll(async () => {
    if (!accessToken) return;
    await fetch(`${configuration.apiBaseUrl}/sessions/logout`, {
      method: 'POST',
      headers: { authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(10_000),
    });
  });

  async function ensureSession(): Promise<string> {
    if (accessToken) return accessToken;
    const response = await fetch(`${configuration.apiBaseUrl}/sessions`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-tenant-id': configuration.tenantId,
      },
      body: JSON.stringify({
        cognitoToken: configuration.cognitoAccessToken,
        deviceMeta: { suite: 'pec-real-environment' },
      }),
      signal: AbortSignal.timeout(15_000),
    });
    expect(response.ok, await response.text()).toBe(true);
    const bundle = (await response.json()) as { accessToken?: unknown };
    expect(typeof bundle.accessToken).toBe('string');
    accessToken = String(bundle.accessToken);
    return accessToken;
  }

  it('uses PostGIS and forced RLS through a non-owner reader role', async () => {
    const client = new Client({
      connectionString: configuration.readerDatabaseUrl,
    });
    await client.connect();
    try {
      const result = await client.query<{
        bypass_rls: boolean;
        missing_forced_rls: string;
        postgis: string;
        superuser: boolean;
      }>(`select postgis_version() as postgis,
                current_setting('is_superuser')::boolean as superuser,
                (select rolbypassrls from pg_roles where rolname = current_user) as bypass_rls,
                (select count(*) from pg_class c join pg_namespace n on n.oid = c.relnamespace
                  where n.nspname = 'ch' and c.relkind = 'r' and not c.relforcerowsecurity)::text as missing_forced_rls`);
      expect(result.rows[0]?.postgis).toBeTruthy();
      expect(result.rows[0]?.superuser).toBe(false);
      expect(result.rows[0]?.bypass_rls).toBe(false);
      expect(result.rows[0]?.missing_forced_rls).toBe('0');
    } finally {
      await client.end();
    }
  });

  it('exchanges a strong-factor Cognito token for a STYNX session', async () => {
    await expect(ensureSession()).resolves.toMatch(/^[^.]+\.[^.]+\.[^.]+$/u);
  });

  it('loads every generated CH OpenAPI 3.1 contract and sweeps collection reads', async () => {
    const contractsDirectory = path.join(
      repositoryRoot,
      'docs/framework/contracts',
    );
    const names = (await readdir(contractsDirectory)).filter((name) =>
      /^BP-CH-.*\.openapi\.json$/u.test(name),
    );
    expect(names.length).toBeGreaterThan(0);

    const collectionPaths = new Set<string>();
    for (const name of names) {
      const contract = JSON.parse(
        await readFile(path.join(contractsDirectory, name), 'utf8'),
      ) as { openapi?: unknown; paths?: Record<string, { get?: unknown }> };
      expect(contract.openapi).toBe('3.1.0');
      for (const [route, operations] of Object.entries(contract.paths ?? {})) {
        if (operations.get && !route.includes('{')) collectionPaths.add(route);
      }
    }

    const token = await ensureSession();
    const failures: string[] = [];
    for (const route of collectionPaths) {
      const response = await fetch(`${configuration.apiBaseUrl}${route}`, {
        headers: {
          authorization: `Bearer ${token}`,
          'x-tenant-id': configuration.tenantId,
        },
        signal: AbortSignal.timeout(15_000),
      });
      if (response.status >= 500) failures.push(`${route}: ${response.status}`);
    }
    expect(failures).toEqual([]);
  });

  it('proves the real clinical trust endpoint advertises preservation', async () => {
    const response = await fetch(configuration.clinicalTrustHealthUrl, {
      headers: { authorization: `Bearer ${configuration.clinicalTrustToken}` },
      signal: AbortSignal.timeout(10_000),
    });
    expect(response.ok, await response.text()).toBe(true);
    const capabilities = (await response.json()) as {
      certificateValidation?: unknown;
      lta?: unknown;
      pades?: unknown;
      tsa?: unknown;
    };
    expect(capabilities).toMatchObject({ pades: true, tsa: true, lta: true });
    expect(capabilities.certificateValidation).toEqual(
      expect.arrayContaining([expect.stringMatching(/^(OCSP|CRL)$/u)]),
    );
  });
});
