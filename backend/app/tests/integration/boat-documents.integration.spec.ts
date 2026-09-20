import { createHash } from 'node:crypto';
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  BOAT_NOTICE,
  BoatDocumentsFacade,
  SqlBoatDocumentRepository,
  StynxBoatObjectStorage,
} from '../../src/boat-documents.js';

const { Client } = pg;
const connectionString =
  process.env.DETRAN_TEST_DATABASE_URL ??
  process.env.DATABASE_URL ??
  'postgresql://postgres:postgres@localhost:5432/detran';
const tenantA = '00000000-0000-7000-8000-00000000a001';
const tenantB = '00000000-0000-7000-8000-00000000a002';
const crashId = '00000000-0000-7000-8000-0000a1000003';
const client = new Client({ connectionString });

beforeAll(async () => {
  await client.connect();
  await client.query(`select set_config('app.role', 'owner', false)`);
});

afterAll(async () => {
  await client.end();
});

describe('D-13-02/D-13-07 — persistência documental BOAT', () => {
  it('mantém RLS forçado e concede ao app apenas SELECT/INSERT', async () => {
    const relation = await client.query<{
      relrowsecurity: boolean;
      relforcerowsecurity: boolean;
      has_policy: boolean;
      can_select: boolean;
      can_insert: boolean;
      can_update: boolean;
      can_delete: boolean;
    }>(
      `select c.relrowsecurity,
              c.relforcerowsecurity,
              exists (
                select 1 from pg_policies p
                 where p.schemaname = 'est'
                   and p.tablename = 'crash_report_document'
                   and p.policyname = 'tenant_isolation'
              ) as has_policy,
              has_table_privilege('role_app_backend', 'est.crash_report_document', 'SELECT') as can_select,
              has_table_privilege('role_app_backend', 'est.crash_report_document', 'INSERT') as can_insert,
              has_table_privilege('role_app_backend', 'est.crash_report_document', 'UPDATE') as can_update,
              has_table_privilege('role_app_backend', 'est.crash_report_document', 'DELETE') as can_delete
         from pg_class c
         join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'est' and c.relname = 'crash_report_document'`,
    );
    expect(relation.rows).toEqual([
      {
        relrowsecurity: true,
        relforcerowsecurity: true,
        has_policy: true,
        can_select: true,
        can_insert: true,
        can_update: false,
        can_delete: false,
      },
    ]);
  });

  it('persiste pela fachada/repositório, usa o adapter STYNX e sobrevive a reinício integral', async () => {
    const policy = await client.query<{ id: string }>(
      `select id::text
         from inf.signature_policy
        where tenant_id = $1::uuid
          and document_kind = 'relatorio_preliminar_sinistro'`,
      [tenantA],
    );
    const policyId = policy.rows[0]?.id;
    expect(policyId).toBeTruthy();
    const bytes = Buffer.from('%PDF-1.7\nintegration-stynx\n%%EOF');
    const contentHash = createHash('sha256').update(bytes).digest('hex');
    const validation = {
      valid: true,
      declared: { version: 'A-2' as const, conformance: 'b' as const },
      rulesetVersion: 'veraPDF-1.30.1-profile-6.4.2',
      validatedAt: '2026-09-20T12:34:56.000Z',
      durationMs: 17,
      errors: [],
    };
    const requestContext = {
      hasActiveContext: () => true,
      snapshot: () => ({ tenantId: tenantA, actorId: 'actor-integration' }),
    };
    const database = {
      tx: async (work: (tx: unknown) => Promise<unknown>) =>
        work({
          query: (sql: string, values?: readonly unknown[]) =>
            client.query(sql, values as unknown[] | undefined),
        }),
    };
    const repository = new SqlBoatDocumentRepository(
      database as never,
      requestContext as never,
    );
    const objects = new Map<string, Uint8Array>();
    let uploadCalls = 0;
    let downloadCalls = 0;
    const storageService = {
      presignUpload: async ({ key }: { key: string }) => ({
        url: `https://stynx-storage.test/upload/${encodeURIComponent(key)}`,
        method: 'PUT',
        headers: {},
      }),
      presignDownload: async ({ key }: { key: string }) => ({
        url: `https://stynx-storage.test/download/${encodeURIComponent(key)}`,
      }),
    };
    const storage = new StynxBoatObjectStorage(storageService as never);
    const previousFetch = globalThis.fetch;
    globalThis.fetch = async (input, init) => {
      const url = String(input);
      const key = decodeURIComponent(url.slice(url.lastIndexOf('/') + 1));
      if (url.includes('/upload/')) {
        uploadCalls += 1;
        objects.set(
          key,
          new Uint8Array(await new Response(init?.body ?? null).arrayBuffer()),
        );
        return new Response(null, { status: 200 });
      }
      downloadCalls += 1;
      const stored = objects.get(key);
      return stored
        ? new Response(Uint8Array.from(stored).buffer, { status: 200 })
        : new Response(null, { status: 404 });
    };
    const renderer = {
      render: async () => ({
        bytes,
        contentType: 'application/pdf' as const,
        sha256: contentHash,
        pageCount: 1,
        templateId: 'est.crash.report.preliminary',
        templateVersion: '1.0.0',
        metadata: {
          profile: 'pdf-a',
          pdfaValidation: JSON.stringify(validation),
        },
      }),
    };
    const catalog = {
      resolve: async () => ({
        templateBody: `<p>{{id}}</p><p>${BOAT_NOTICE}</p>`,
        templateVersion: '1.0.0',
        policyId: policyId!,
      }),
    };
    let id = '';
    try {
      const facade = new BoatDocumentsFacade(
        requestContext as never,
        catalog,
        renderer,
        repository,
        storage,
      );
      const rendered = await facade.render('est.crash.report.preliminary', {
        id: crashId,
        traffic_agency_id: tenantA,
      });
      id = rendered.documentId;
      await facade.seal(id);
      expect(uploadCalls).toBe(1);

      const restarted = new BoatDocumentsFacade(
        requestContext as never,
        { resolve: async () => Promise.reject(new Error('unused')) },
        renderer,
        new SqlBoatDocumentRepository(
          database as never,
          requestContext as never,
        ),
        new StynxBoatObjectStorage(storageService as never),
      );
      expect(Buffer.from(await restarted.read(id))).toEqual(bytes);
      expect(downloadCalls).toBe(1);

      const persisted = await client.query<{
        pdfa_validation: typeof validation;
        template_version: string;
        policy_id: string;
        content_hash: string;
        byte_size: number;
        storage_key: string;
        sealed_at: string;
      }>(
        `select pdfa_validation, template_version, policy_id::text,
                content_hash, byte_size, storage_key, sealed_at::text
           from est.crash_report_document where id = $1::uuid`,
        [id],
      );
      expect(persisted.rows[0]).toMatchObject({
        pdfa_validation: validation,
        template_version: '1.0.0',
        policy_id: policyId,
        content_hash: contentHash,
        byte_size: bytes.byteLength,
      });
      expect(persisted.rows[0]?.storage_key).toBe(rendered.storageKey);
      expect(persisted.rows[0]?.sealed_at).toBeTruthy();
      expect((await repository.find(id))?.validation).toEqual(validation);

      await client.query('begin');
      await client.query('set local role role_app_backend');
      await client.query(`select set_config('app.tenant_id', $1, true)`, [
        tenantB,
      ]);
      const crossTenant = await client.query(
        'select id from est.crash_report_document where id = $1::uuid',
        [id],
      );
      expect(crossTenant.rows).toHaveLength(0);
      await client.query('rollback');

      await client.query('begin');
      await client.query('set local role role_app_backend');
      await client.query(`select set_config('app.tenant_id', $1, true)`, [
        tenantA,
      ]);
      await expect(
        client.query(
          `update est.crash_report_document set storage_key = 'mutated' where id = $1::uuid`,
          [id],
        ),
      ).rejects.toMatchObject({ code: '42501' });
      await client.query('rollback');
    } finally {
      globalThis.fetch = previousFetch;
      await client.query(`select set_config('app.role', 'owner', false)`);
      if (id)
        await client.query(
          'delete from est.crash_report_document where id = $1::uuid',
          [id],
        );
    }
  });
});
