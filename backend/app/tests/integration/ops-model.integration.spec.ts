import { randomUUID } from 'node:crypto';
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const { Client } = pg;
const connectionString =
  process.env.DETRAN_TEST_DATABASE_URL ??
  process.env.DATABASE_URL ??
  'postgresql://postgres:postgres@localhost:5432/detran';
const tenantA = '00000000-0000-7000-8000-000000000301';
const tenantB = '00000000-0000-7000-8000-000000000302';
const trafficAgency = '00000000-0000-4000-8000-000000000303';
const client = new Client({ connectionString });

const opsTables = [
  'agency_unit',
  'agency_jurisdiction',
  'agency_competence',
  'ops_agent_profile',
  'ops_operational_device',
  'ops_homologation',
  'ops_application_version',
  'ops_device_event',
  'ops_operation',
  'ops_team',
  'ops_team_agent',
  'ops_patrol_vehicle',
  'ops_measurement_instrument',
  'ops_shift',
  'ops_approach',
  'ops_session_handoff',
  'snapshots_person',
  'snapshots_person_document',
  'snapshots_vehicle',
  'snapshots_vehicle_snapshot',
  'snapshots_external_query',
  'evidence_evidence',
  'evidence_link',
  'evidence_custody_event',
  'evidence_probative_package',
  'evidence_probative_package_item',
  'evidence_access_request',
  'storage_intent',
  'ait_numbering_range',
  'numbering_reservation',
  'numbering_consumption',
  'sync_batch',
  'sync_queue_item',
  'sync_receipt',
  'sync_conflict',
] as const;

beforeAll(async () => {
  await client.connect();
});

afterAll(async () => {
  await client.end();
});

describe('modelo de dados ops', () => {
  it('dado as tabelas ops geradas quando inspecionadas então todas tenant-scoped têm RLS completo', async () => {
    const result = await client.query<{
      table_name: string;
      rls_enabled: boolean;
      rls_forced: boolean;
      has_policy: boolean;
      has_trigger: boolean;
    }>(
      `select c.relname as table_name,
              c.relrowsecurity as rls_enabled,
              c.relforcerowsecurity as rls_forced,
              exists (select 1 from pg_policies p where p.schemaname = 'ops' and p.tablename = c.relname and p.policyname = 'tenant_isolation') as has_policy,
              exists (select 1 from pg_trigger t where t.tgrelid = c.oid and t.tgname = 'enforce_tenant_id' and not t.tgisinternal) as has_trigger
         from pg_class c
         join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'ops' and c.relkind = 'r' and c.relname = any($1::text[])
        order by c.relname`,
      [opsTables],
    );
    expect(result.rows.map((row) => row.table_name)).toEqual(
      [...opsTables].sort(),
    );
    expect(
      result.rows.every(
        (row) =>
          row.rls_enabled &&
          row.rls_forced &&
          row.has_policy &&
          row.has_trigger,
      ),
    ).toBe(true);
  });

  it('dado as relações intra-blueprint quando consultadas então as FKs geradas existem', async () => {
    const expected = [
      ['ops_application_version', 'ops_homologation'],
      ['ops_device_event', 'ops_operational_device'],
      ['ops_device_event', 'ops_agent_profile'],
      ['ops_shift', 'ops_agent_profile'],
      ['ops_shift', 'ops_operational_device'],
      ['ops_shift', 'ops_team'],
      ['ops_shift', 'ops_patrol_vehicle'],
      ['ops_shift', 'ops_operation'],
      ['ops_approach', 'ops_shift'],
      ['ops_session_handoff', 'ops_shift'],
      ['snapshots_person_document', 'snapshots_person'],
      ['snapshots_vehicle_snapshot', 'snapshots_vehicle'],
      ['snapshots_vehicle_snapshot', 'snapshots_external_query'],
      ['evidence_link', 'evidence_evidence'],
      ['evidence_custody_event', 'evidence_evidence'],
      ['evidence_probative_package_item', 'evidence_probative_package'],
      ['evidence_probative_package_item', 'evidence_evidence'],
      ['evidence_access_request', 'evidence_evidence'],
      ['storage_intent', 'evidence_evidence'],
      ['numbering_reservation', 'ait_numbering_range'],
      ['numbering_consumption', 'numbering_reservation'],
      ['numbering_consumption', 'ait_numbering_range'],
      ['sync_receipt', 'sync_queue_item'],
      ['sync_conflict', 'sync_queue_item'],
      ['agency_competence', 'agency_unit'],
      ['agency_competence', 'agency_jurisdiction'],
    ];
    const result = await client.query<{ child: string; parent: string }>(
      `select child.relname as child, parent.relname as parent
         from pg_constraint constraint_row
         join pg_class child on child.oid = constraint_row.conrelid
         join pg_class parent on parent.oid = constraint_row.confrelid
         join pg_namespace namespace_row on namespace_row.oid = child.relnamespace
        where namespace_row.nspname = 'ops' and constraint_row.contype = 'f'`,
    );
    const actual = result.rows.map((row) => `${row.child}:${row.parent}`);
    expect(
      expected.every(([child, parent]) =>
        actual.includes(`${child}:${parent}`),
      ),
    ).toBe(true);
  });

  it('dado uma sync_queue_item quando a mesma chave é repetida no tenant então a segunda inserção é rejeitada', async () => {
    await client.query(`select set_config('app.role', 'owner', false)`);
    const idempotencyKey = `ops-inspector-${randomUUID()}`;
    const first = await client.query<{ id: string }>(
      `insert into ops.sync_queue_item
         (tenant_id, traffic_agency_id, device_id, agent_id, entity_type, local_entity_id, created_locally_at, idempotency_key, payload_hash, payload_json)
       values ($1, $2, $3, $4, 'inspector-test', $5, now(), $6, $7, '{}'::jsonb)
       returning id`,
      [
        tenantA,
        trafficAgency,
        randomUUID(),
        randomUUID(),
        randomUUID(),
        idempotencyKey,
        'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      ],
    );
    await expect(
      client.query(
        `insert into ops.sync_queue_item
           (tenant_id, traffic_agency_id, device_id, agent_id, entity_type, local_entity_id, created_locally_at, idempotency_key, payload_hash, payload_json)
         values ($1, $2, $3, $4, 'inspector-test', $5, now(), $6, $7, '{}'::jsonb)`,
        [
          tenantA,
          trafficAgency,
          randomUUID(),
          randomUUID(),
          randomUUID(),
          idempotencyKey,
          'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        ],
      ),
    ).rejects.toMatchObject({ code: '23505' });
    await client.query('delete from ops.sync_queue_item where id = $1', [
      first.rows[0]?.id,
    ]);
  });

  it('dado uma evidência quando o mesmo hash é repetido no tenant então a segunda inserção é rejeitada', async () => {
    await client.query(`select set_config('app.role', 'owner', false)`);
    const evidenceId = randomUUID();
    const hashValue = `${randomUUID().replaceAll('-', '')}${randomUUID().replaceAll('-', '')}`;
    await client.query(
      `insert into ops.evidence_evidence
         (id, tenant_id, traffic_agency_id, evidence_type, origin, storage_uri, mime_type, size_bytes, hash_algorithm, hash_value, captured_at, status)
       values ($1, $2, $3, 'photo', 'mobile', 'storage://ops-inspector/evidence', 'image/jpeg', 1, 'sha256', $4, now(), 'pending_upload')`,
      [evidenceId, tenantA, trafficAgency, hashValue],
    );
    await expect(
      client.query(
        `insert into ops.evidence_evidence
           (tenant_id, traffic_agency_id, evidence_type, origin, storage_uri, mime_type, size_bytes, hash_algorithm, hash_value, captured_at, status)
         values ($1, $2, 'photo', 'mobile', 'storage://ops-inspector/evidence-duplicate', 'image/jpeg', 1, 'sha256', $3, now(), 'pending_upload')`,
        [tenantA, trafficAgency, hashValue],
      ),
    ).rejects.toMatchObject({ code: '23505' });
    await client.query('delete from ops.evidence_evidence where id = $1', [
      evidenceId,
    ]);
  });

  it('dado unidade de outro tenant quando lida com contexto do tenant A então a leitura fica vazia', async () => {
    await client.query(`select set_config('app.role', 'owner', false)`);
    const id = randomUUID();
    await client.query(
      `insert into ops.agency_unit (id, tenant_id, traffic_agency_id, name) values ($1, $2, $3, 'Unidade cross-tenant')`,
      [id, tenantB, trafficAgency],
    );
    await client.query('begin');
    try {
      await client.query('set local role role_app_backend');
      await client.query(`select set_config('app.tenant_id', $1, true)`, [
        tenantA,
      ]);
      const result = await client.query(
        'select id from ops.agency_unit where id = $1',
        [id],
      );
      expect(result.rows).toHaveLength(0);
      await client.query('rollback');
    } catch (error) {
      await client.query('rollback');
      throw error;
    } finally {
      await client.query(`select set_config('app.role', 'owner', false)`);
      await client.query('delete from ops.agency_unit where id = $1', [id]);
    }
  });

  it('dado o contrato Architect quando se exige estado fechado de shift então reporta reference-gap', async () => {
    const result = await client.query<{ check_definition: string | null }>(
      `select pg_get_constraintdef(oid) as check_definition
         from pg_constraint
        where conrelid = 'ops.ops_shift'::regclass and contype = 'c' and conname like '%status%'`,
    );
    expect(result.rows).toHaveLength(0);
  });

  it('dado agency_unit, agency_jurisdiction e agency_competence quando vinculados então unidade, circunscrição e competência permanecem no tenant e agência', async () => {
    const unit = randomUUID();
    const jurisdiction = randomUUID();
    const competence = randomUUID();
    await client.query(`select set_config('app.role', 'owner', false)`);
    await client.query(
      `insert into ops.agency_unit (id, tenant_id, traffic_agency_id, name) values ($1, $2, $3, 'Unidade canônica')`,
      [unit, tenantA, trafficAgency],
    );
    await client.query(
      `insert into ops.agency_jurisdiction (id, tenant_id, traffic_agency_id, name) values ($1, $2, $3, 'Circunscrição canônica')`,
      [jurisdiction, tenantA, trafficAgency],
    );
    await client.query(
      `insert into ops.agency_competence (id, tenant_id, traffic_agency_id, agency_unit_id, agency_jurisdiction_id) values ($1, $2, $3, $4, $5)`,
      [competence, tenantA, trafficAgency, unit, jurisdiction],
    );
    const result = await client.query<{
      agency_unit_id: string;
      agency_jurisdiction_id: string;
      traffic_agency_id: string;
    }>(
      `select agency_unit_id, agency_jurisdiction_id, traffic_agency_id from ops.agency_competence where id = $1`,
      [competence],
    );
    expect(result.rows[0]).toEqual({
      agency_unit_id: unit,
      agency_jurisdiction_id: jurisdiction,
      traffic_agency_id: trafficAgency,
    });
    await client.query('delete from ops.agency_competence where id = $1', [
      competence,
    ]);
    await client.query('delete from ops.agency_jurisdiction where id = $1', [
      jurisdiction,
    ]);
    await client.query('delete from ops.agency_unit where id = $1', [unit]);
  });
});
