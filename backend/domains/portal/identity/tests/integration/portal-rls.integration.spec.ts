// CTG-0001 §7 (M11; ADR-0002) — RLS cruzada entre tenants em `portal.*`, exceção por desenho de
// `portal.brand_profile`/`portal.public_hostname` (M11, DDL manuscrito 19-portal-platform.sql) e
// gatilho `enforce_tenant_id` (auth.install_tenant_triggers() estendido ao schema 'portal').
// Não depende de código manuscrito (roda contra o schema `portal` só com o DDL 19/61-65
// aplicado e as fixtures de 70-fixtures-portal.sql — backend:test:ci roda db:reset + seed.sh
// antes). Padrão de
// backend/domains/inf/notification/tests/integration/notification-db.integration.spec.ts
// (leitura obrigatória): `asTenant`/`asOwner`, tenant efêmero via randomUUID (rait-fixtures.md
// §7), leitura cruzada vazia e insert com tenant_id explícito divergente do `app.tenant_id` da
// sessão rejeitado com `42501`. A tarefa pede "um segundo tenant criado no teste" (Execução,
// item 3), que prevalece sobre a redação mais antiga de §11 C-0001-29 ("tenant local").
import { randomUUID } from 'node:crypto';
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const { Client } = pg;
const client = new Client({
  connectionString:
    process.env.DETRAN_TEST_DATABASE_URL ??
    process.env.DATABASE_URL ??
    'postgresql://postgres:postgres@localhost:5432/detran_r9',
});

const CANONICAL_TENANT = '00000000-0000-7000-8000-00000000a001';
// Tenant efêmero só para o isolamento de RLS (rait-fixtures.md §7; mesmo padrão de
// notification-db.integration.spec.ts).
const OTHER_TENANT = randomUUID();

const CROSS_TENANT_TABLES = [
  'subject',
  'request',
  'manifestation',
  'inbox_item',
  'infraction_view',
];

async function asOwner<T>(work: () => Promise<T>): Promise<T> {
  await client.query('begin');
  try {
    await client.query(`select set_config('app.role', 'owner', true)`);
    await client.query(`select set_config('app.tenant_id', $1, true)`, [
      CANONICAL_TENANT,
    ]);
    return await work();
  } finally {
    await client.query('rollback');
  }
}

async function asTenant<T>(
  tenantId: string,
  work: () => Promise<T>,
): Promise<T> {
  await client.query('begin');
  try {
    await client.query('set local role role_app_backend');
    await client.query(`select set_config('app.tenant_id', $1, true)`, [
      tenantId,
    ]);
    return await work();
  } finally {
    await client.query('rollback');
  }
}

/** `role_app_backend` sem `app.tenant_id` — rotas públicas (§9 M11). */
async function asRoleWithoutTenant<T>(work: () => Promise<T>): Promise<T> {
  await client.query('begin');
  try {
    await client.query('set local role role_app_backend');
    return await work();
  } finally {
    await client.query('rollback');
  }
}

const count = async (sql: string, params: unknown[] = []) => {
  const result = await client.query<{ count: string }>(sql, params);
  return Number(result.rows[0]?.count ?? -1);
};

describe('portal.* — RLS cruzada entre tenants (CTG-0001 §7, M11)', () => {
  beforeAll(() => client.connect());
  afterAll(async () => {
    await client.query('reset role');
    await client.end();
  });

  it('C-0001-30 — dado app.tenant_id = tenant canônico quando lido então as contagens do §10.9 nas cinco tabelas', async () => {
    const counts = await asTenant(CANONICAL_TENANT, async () => ({
      subject: await count(
        'select count(*)::text as count from portal.subject',
      ),
      request: await count(
        'select count(*)::text as count from portal.request',
      ),
      manifestation: await count(
        'select count(*)::text as count from portal.manifestation',
      ),
      inbox_item: await count(
        'select count(*)::text as count from portal.inbox_item',
      ),
      infraction_view: await count(
        'select count(*)::text as count from portal.infraction_view',
      ),
    }));
    expect(counts).toEqual({
      subject: 5,
      request: 13,
      manifestation: 9,
      inbox_item: 2,
      infraction_view: 7,
    });
  });

  it('C-0001-29 — dado um segundo tenant (criado no teste) quando lido em portal.subject, portal.request, portal.manifestation, portal.inbox_item e portal.infraction_view então 0 linhas (as fixtures são do tenant canônico)', async () => {
    await asOwner(() =>
      client.query(
        `insert into auth.tenants (id, slug, name) values ($1, $2, 'Portal RLS second tenant') on conflict (id) do nothing`,
        [OTHER_TENANT, `portal-rls-${OTHER_TENANT.slice(0, 8)}`],
      ),
    );
    for (const table of CROSS_TENANT_TABLES) {
      const theirs = await asTenant(OTHER_TENANT, () =>
        count(`select count(*)::text as count from portal.${table}`),
      );
      expect(
        theirs,
        `portal.${table} deveria estar vazio para o tenant efêmero`,
      ).toBe(0);
    }
  });

  it('C-0001-31a — dado role_app_backend sem app.tenant_id quando lido em portal.brand_profile e portal.public_hostname então lê a linha canônica (sem RLS por desenho, M11)', async () => {
    const brand = await asRoleWithoutTenant(() =>
      client.query<{ display_name: string }>(
        'select display_name from portal.brand_profile where tenant_id = $1',
        [CANONICAL_TENANT],
      ),
    );
    expect(brand.rows[0]?.display_name).toBe('DETRAN-AM (fixtures)');

    const hostname = await asRoleWithoutTenant(() =>
      client.query<{ hostname: string }>(
        'select hostname from portal.public_hostname where tenant_id = $1',
        [CANONICAL_TENANT],
      ),
    );
    expect(hostname.rows[0]?.hostname).toBe(
      'portal.detran-am.fixtures.invalid',
    );
  });

  it('C-0001-31b — dado role_app_backend sem app.tenant_id quando lido em portal.service_catalog então 0 linhas (RLS: M11 "nada mais é isento")', async () => {
    const rows = await asRoleWithoutTenant(() =>
      count('select count(*)::text as count from portal.service_catalog'),
    );
    expect(rows).toBe(0);
  });

  it('C-0001-32 — dado insert em portal.subject sem tenant_id no payload sob o tenant efêmero então enforce_tenant_id (auth.install_tenant_triggers, schema portal — M11) preenche a linha com o tenant da sessão', async () => {
    const cpfHash = '1'.repeat(64);
    await asTenant(OTHER_TENANT, async () => {
      const inserted = await client.query<{ id: string; tenant_id: string }>(
        `insert into portal.subject (cpf_hash, name, assurance_level_observed, observed_at)
         values ($1, 'RLS probe (fixture, sem tenant_id)', 'simples', now())
         returning id, tenant_id`,
        [cpfHash],
      );
      expect(
        inserted.rows[0]?.tenant_id,
        'a linha gravada (RETURNING) deveria ter recebido o tenant da sessão',
      ).toBe(OTHER_TENANT);

      const consulted = await client.query<{ tenant_id: string }>(
        'select tenant_id from portal.subject where id = $1',
        [inserted.rows[0]?.id],
      );
      expect(
        consulted.rows[0]?.tenant_id,
        'a linha consultada em seguida deveria ter o tenant da sessão',
      ).toBe(OTHER_TENANT);
    });
    // Limpeza: `asTenant` executa `work()` dentro de uma transação sempre
    // desfeita em `rollback` (finally) — a linha inserida acima não persiste.
  });

  it('C-0001-32 (caso adicional) — dado um tenant_id divergente do app.tenant_id da sessão quando inserido em portal.subject então enforce_tenant_id rejeita com 42501', async () => {
    await expect(
      asTenant(OTHER_TENANT, () =>
        client.query(
          `insert into portal.subject (tenant_id, cpf_hash, name, assurance_level_observed, observed_at)
           values ($1, $2, 'RLS probe (fixture)', 'simples', now())`,
          [CANONICAL_TENANT, '0'.repeat(64)],
        ),
      ),
    ).rejects.toMatchObject({ code: '42501' });
  });
});
