import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const { Client } = pg;
const tenantId = '00000000-0000-7000-8000-00000000a001';
const fixtureRecordId = '00000000-0000-7000-8000-0000a1000003';
const fixtureAgencyId = '00000000-0000-7000-8000-0000e2000001';
const repositoryRoot = fileURLToPath(
  new URL('../../../../../../', import.meta.url),
);
const client = new Client({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? '5432'),
  user: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'detran_r10',
});

const tenantTables = [
  'crash_record',
  'crash_vehicle',
  'crash_person',
  'crash_victim',
  'crash_scene_duty',
  'crash_damage',
  'crash_witness',
  'crash_sketch',
  'crash_link',
  'crash_renaest_submission',
  'crash_subject_request',
] as const;

async function asTenant<T>(
  currentTenantId: string,
  work: () => Promise<T>,
): Promise<T> {
  await client.query('begin');
  try {
    await client.query('set local role role_app_backend');
    await client.query("select set_config('app.tenant_id', $1, true)", [
      currentTenantId,
    ]);
    return await work();
  } finally {
    await client.query('rollback');
  }
}

async function insertRecord(
  id: string,
  overrides: Partial<{
    severity: string;
    state: string;
    nationalStatus: string | null;
    occurredAt: string;
    recordedAt: string;
    sourceLocalId: string;
  }> = {},
) {
  const values = {
    severity: 'SEM_VITIMA',
    state: 'RASCUNHO',
    nationalStatus: null,
    occurredAt: '2026-09-15T10:00:00-04:00',
    recordedAt: '2026-09-15T11:00:00-04:00',
    sourceLocalId: `integration-${id}`,
    ...overrides,
  };
  return client.query(
    `insert into est.crash_record (
       id, tenant_id, traffic_agency_id, crash_type, severity, state,
       national_status, occurred_at, recorded_at, location_description,
       municipality_code, uf, road_condition, weather_condition,
       lighting_condition, signage_condition, source_system, source_local_id
     ) values (
       $1, $2, $3, 'source_pending', $4, $5, $6, $7, $8,
       'fixture override', '1302603', 'AM', 'source_pending',
       'source_pending', 'source_pending', 'source_pending', 'boat-integration', $9
     )`,
    [
      id,
      tenantId,
      fixtureAgencyId,
      values.severity,
      values.state,
      values.nationalStatus,
      values.occurredAt,
      values.recordedAt,
      values.sourceLocalId,
    ],
  );
}

describe('contrato persistente BOAT est/crash', () => {
  beforeAll(() => client.connect());
  afterAll(async () => {
    await client.query('reset role');
    await client.end();
  });

  it('dado o blueprint quando comparado ao contrato então C-1-01 e C-1-02 permanecem íntegros', () => {
    const blueprint = JSON.parse(
      readFileSync(
        new URL(
          '../../../../../../docs/framework/blueprints/BP-EST-CRASH-001.json',
          import.meta.url,
        ),
        'utf8',
      ),
    ) as { module: { namespace: string }; database: { entities: unknown[] } };
    expect(blueprint.module.namespace).toBe('est');
    expect(blueprint.database.entities).toHaveLength(11);
    const ddl = readFileSync(
      new URL(
        '../../../../../../backend/database/ddl/70-est-crash.sql',
        import.meta.url,
      ),
      'utf8',
    );
    expect(ddl).toMatch(
      /^-- Generated from BP-EST-CRASH-001 v1\.0\.0 sha256:[0-9a-f]{64}/,
    );
  });

  it('dado o blueprint quando os campos PII são lidos então C-1-08 e C-1-09 preservam a classificação e a retenção', () => {
    const blueprint = JSON.parse(
      readFileSync(
        new URL(
          '../../../../../../docs/framework/blueprints/BP-EST-CRASH-001.json',
          import.meta.url,
        ),
        'utf8',
      ),
    ) as {
      database: { entities: Array<{ fields: Array<Record<string, unknown>> }> };
    };
    const fields = blueprint.database.entities.flatMap(
      (entity) => entity.fields,
    );
    expect(fields.some((field) => field.name === 'evaded')).toBe(false);
    for (const field of ['plate', 'name', 'document_number']) {
      const definition = fields.find(
        (candidate) => candidate.name === field && candidate.pii,
      );
      expect(definition?.pii).toBe('high');
      expect(definition?.retention).toBe('est.retention.bat_years');
    }
    for (const field of [
      'crash_person_id',
      'severity',
      'death_at_scene',
      'medical_care',
      'hospital_destination',
      'health_notes',
    ]) {
      const definition = fields.find(
        (candidate) => candidate.name === field && candidate.pii,
      );
      expect(definition?.pii).toBe('sensitive-health');
      expect(definition?.retention).toBe('est.retention.health_fields_years');
    }
  });

  it('dadas as tabelas de domínio quando lidas pelo catálogo então C-1-03 força RLS, política e gatilho de tenant em todas', async () => {
    const result = await client.query<{
      tableName: string;
      rowSecurity: boolean;
      forceRowSecurity: boolean;
      policyCount: string;
      triggerCount: string;
    }>(
      `select classes.relname as "tableName", classes.relrowsecurity as "rowSecurity",
              classes.relforcerowsecurity as "forceRowSecurity",
              count(distinct policies.policyname)::text as "policyCount",
              count(distinct triggers.tgname) filter (where not triggers.tgisinternal)::text as "triggerCount"
         from pg_class classes
         join pg_namespace namespaces on namespaces.oid = classes.relnamespace
         left join pg_policies policies on policies.schemaname = 'est'
           and policies.tablename = classes.relname and policies.policyname = 'tenant_isolation'
         left join pg_trigger triggers on triggers.tgrelid = classes.oid
           and triggers.tgname = 'enforce_tenant_id'
        where namespaces.nspname = 'est' and classes.relname = any($1::text[])
        group by classes.relname, classes.relrowsecurity, classes.relforcerowsecurity
        order by classes.relname`,
      [tenantTables],
    );
    expect(result.rows.map((row) => row.tableName)).toEqual(
      [...tenantTables].sort(),
    );
    for (const row of result.rows) {
      expect(row.rowSecurity).toBe(true);
      expect(row.forceRowSecurity).toBe(true);
      expect(row.policyCount).toBe('1');
      expect(row.triggerCount).toBe('1');
    }
  });

  it('dados os catálogos de condição quando são lidos então C-1-10 mantém source_pending sem valores inventados', async () => {
    const conditions = await client.query<{
      catalog: string;
      sourcePending: boolean;
      editableBy: string;
      values: unknown[];
    }>(
      `select catalog, source_pending as "sourcePending", editable_by as "editableBy",
              values_json as values
         from est.crash_condition_ref
        order by catalog`,
    );
    expect(conditions.rows).toHaveLength(5);
    for (const condition of conditions.rows) {
      expect(condition.sourcePending).toBe(true);
      expect(condition.editableBy).toBe('agency-admin');
      expect(condition.values).toEqual([]);
    }
  });

  it('dado o vocabulário aplicado quando T-BOAT-TRANSM é consultado então C-1-11 preserva o gatilho e a decisão vigentes', async () => {
    const timer = await client.query<{ count: string }>(
      `select count(*)::text as count from est.crash_timer_ref
        where code = 'T-BOAT-TRANSM' and trigger_state = 'FECHADO'
          and parameter_key = 'est.renaest.transmit_period'
          and default_period = 'monthly' and owner = 'sinistro'
          and status = 'vigente' and decision_ref = 'OD-B04/DT-017'`,
    );
    expect(timer.rows[0]?.count).toBe('1');
  });

  it('dado occurred_at posterior a recorded_at quando o registro é inserido então C-1-05 rejeita ck_est_crash_record_occurred_before_recorded', async () => {
    await expect(
      asTenant(tenantId, () =>
        insertRecord('00000000-0000-7000-8000-0000a5000001', {
          occurredAt: '2026-09-14T12:00:00-04:00',
          recordedAt: '2026-09-14T11:00:00-04:00',
        }),
      ),
    ).rejects.toMatchObject({
      code: '23514',
      constraint: 'ck_est_crash_record_occurred_before_recorded',
    });
  });

  it('dado estado local fora dos nove tokens quando o registro é inserido então C-1-04 o rejeita', async () => {
    await expect(
      asTenant(tenantId, () =>
        insertRecord('00000000-0000-7000-8000-0000a5000002', {
          state: 'ESTADO_INEXISTENTE',
        }),
      ),
    ).rejects.toMatchObject({
      code: '23514',
      constraint: 'ck_est_crash_record_local_state',
    });
  });

  it('dada situação nacional fora do espelho RENAEST quando o registro é inserido então C-1-04 a rejeita', async () => {
    await expect(
      asTenant(tenantId, () =>
        insertRecord('00000000-0000-7000-8000-0000a5000003', {
          nationalStatus: 'NACIONAL_INEXISTENTE',
        }),
      ),
    ).rejects.toMatchObject({
      code: '23514',
      constraint: 'ck_est_crash_record_national_status',
    });
  });

  it('dado kind fora de ait ou measure quando o vínculo é inserido então C-1-07 o rejeita', async () => {
    await expect(
      asTenant(tenantId, () =>
        client.query(
          `insert into est.crash_link (id, tenant_id, crash_record_id, kind, target_id)
           values ('00000000-0000-7000-8000-0000a5000011', $1, $2, 'outro',
                   '00000000-0000-7000-8000-0000a5000012')`,
          [tenantId, fixtureRecordId],
        ),
      ),
    ).rejects.toMatchObject({
      code: '23514',
      constraint: 'ck_est_crash_link_kind',
    });
  });

  it('dado target externo quando vínculos ait e measure são inseridos então C-1-07 aceita ambos sem FK rígida', async () => {
    const rows = await asTenant(tenantId, async () => {
      await client.query(
        `insert into est.crash_link (id, tenant_id, crash_record_id, kind, target_id)
         values
           ('00000000-0000-7000-8000-0000a5000021', $1, $2, 'ait', '00000000-0000-7000-8000-0000a5000022'),
           ('00000000-0000-7000-8000-0000a5000023', $1, $2, 'measure', '00000000-0000-7000-8000-0000a5000024')`,
        [tenantId, fixtureRecordId],
      );
      return client.query<{ count: string }>(
        `select count(*)::text as count from est.crash_link
          where id in ('00000000-0000-7000-8000-0000a5000021',
                       '00000000-0000-7000-8000-0000a5000023')`,
      );
    });
    expect(rows.rows[0]?.count).toBe('2');
  });

  it('dado source_local de fixture com chave natural distinta quando repetido no mesmo tenant então o índice de origem rejeita a repetição', async () => {
    await expect(
      asTenant(tenantId, () =>
        client.query(
          `insert into est.crash_record (
             id, tenant_id, traffic_agency_id, crash_type, severity, state,
             occurred_at, recorded_at, location_description, municipality_code, uf,
             road_condition, weather_condition, lighting_condition, signage_condition,
             source_system, source_local_id
           ) select '00000000-0000-7000-8000-0000a5000031', tenant_id,
                    traffic_agency_id, crash_type, severity, state,
                    '2026-09-15T12:00:00-04:00'::timestamptz,
                    '2026-09-15T13:00:00-04:00'::timestamptz,
                    location_description, municipality_code, uf,
                    road_condition, weather_condition, lighting_condition,
                    signage_condition, source_system, source_local_id
               from est.crash_record where id = $1`,
          [fixtureRecordId],
        ),
      ),
    ).rejects.toMatchObject({
      code: '23505',
      constraint: 'ux_est_crash_record_source_local',
    });
  });

  it('dada a mesma chave natural com source_local diferente quando repetida no mesmo tenant então o índice natural a rejeita', async () => {
    await expect(
      asTenant(tenantId, () =>
        client.query(
          `insert into est.crash_record (
             id, tenant_id, traffic_agency_id, crash_type, severity, state,
             occurred_at, recorded_at, location_description, municipality_code, uf,
             road_condition, weather_condition, lighting_condition, signage_condition,
             source_system, source_local_id
           ) select '00000000-0000-7000-8000-0000a5000032', tenant_id,
                    traffic_agency_id, crash_type, severity, state, occurred_at,
                    recorded_at, location_description, municipality_code, uf,
                    road_condition, weather_condition, lighting_condition,
                    signage_condition, 'boat-natural-duplicate',
                    'same-natural-different-source'
               from est.crash_record where id = $1`,
          [fixtureRecordId],
        ),
      ),
    ).rejects.toMatchObject({
      code: '23505',
      constraint: 'ux_est_crash_record_natural_key',
    });
  });

  it('dada situação nacional fora do espelho RENAEST quando a submissão é inserida então o CHECK da tabela de submissão a rejeita', async () => {
    await expect(
      asTenant(tenantId, () =>
        client.query(
          `insert into est.crash_renaest_submission (
             id, tenant_id, crash_record_id, protocol, national_status, layout_version
           ) values (
             '00000000-0000-7000-8000-0000a5000033', $1, $2,
             'R10-RENAEST-INVALID-NATIONAL-0001', 'FECHADO', 'fixture-v1'
           )`,
          [tenantId, fixtureRecordId],
        ),
      ),
    ).rejects.toMatchObject({
      code: '23514',
      constraint: 'ck_est_crash_renaest_submission_national_status',
    });
  });

  it('dado rectification_kind fora de complement ou correction quando a submissão é inserida então o CHECK da tabela a rejeita', async () => {
    await expect(
      asTenant(tenantId, () =>
        client.query(
          `insert into est.crash_renaest_submission (
             id, tenant_id, crash_record_id, protocol, national_status, layout_version,
             rectification_kind
           ) values (
             '00000000-0000-7000-8000-0000a5000034', $1, $2,
             'R10-RENAEST-INVALID-RECTIFICATION-0001', 'EM_ANALISE', 'fixture-v1',
             'invalid'
           )`,
          [tenantId, fixtureRecordId],
        ),
      ),
    ).rejects.toMatchObject({
      code: '23514',
      constraint: 'ck_est_crash_renaest_submission_rectification_kind',
    });
  });

  it('dada submissão EM_ANALISE com rectification_kind complement quando inserida então o escopo RENAEST aceita a exceção válida', async () => {
    const submission = await asTenant(tenantId, async () => {
      await client.query(
        `insert into est.crash_renaest_submission (
           id, tenant_id, crash_record_id, protocol, national_status, layout_version,
           rectification_kind
         ) values (
           '00000000-0000-7000-8000-0000a5000035', $1, $2,
           'R10-RENAEST-VALID-COMPLEMENT-0001', 'EM_ANALISE', 'fixture-v1',
           'complement'
         )`,
        [tenantId, fixtureRecordId],
      );
      return client.query<{ count: string }>(
        `select count(*)::text as count from est.crash_renaest_submission
          where id = '00000000-0000-7000-8000-0000a5000035'
            and national_status = 'EM_ANALISE'
            and rectification_kind = 'complement'`,
      );
    });
    expect(submission.rows[0]?.count).toBe('1');
  });

  it('dado protocolo RENAEST de fixture quando repetido no mesmo tenant então a chave natural da submissão é rejeitada', async () => {
    await expect(
      asTenant(tenantId, () =>
        client.query(
          `insert into est.crash_renaest_submission (
             id, tenant_id, crash_record_id, protocol, national_status, layout_version
           ) values (
             '00000000-0000-7000-8000-0000a5000032', $1, $2,
             'R10-RENAEST-INITIAL-0001', 'RECEBIDO', 'fixture-v1'
           )`,
          [tenantId, fixtureRecordId],
        ),
      ),
    ).rejects.toMatchObject({ code: '23505' });
  });

  it('dado fechamento com pior vítima divergente quando o estado muda para FECHADO então C-1-06 o rejeita', async () => {
    await expect(
      asTenant(tenantId, async () => {
        const recordId = '00000000-0000-7000-8000-0000a5000041';
        await insertRecord(recordId, { state: 'REGISTRADO' });
        await client.query(
          `insert into est.crash_person (id, tenant_id, crash_record_id, role)
           values ('00000000-0000-7000-8000-0000a5000042', $1, $2, 'pedestre')`,
          [tenantId, recordId],
        );
        await client.query(
          `insert into est.crash_victim (id, tenant_id, crash_record_id, crash_person_id, severity)
           values ('00000000-0000-7000-8000-0000a5000043', $1, $2,
                   '00000000-0000-7000-8000-0000a5000042', 'COM_VITIMA_FATAL')`,
          [tenantId, recordId],
        );
        await client.query(
          `update est.crash_record set state = 'FECHADO' where id = $1`,
          [recordId],
        );
      }),
    ).rejects.toMatchObject({
      code: '23514',
      constraint: 'ck_est_crash_record_closed_severity',
    });
  });

  it('dados SEM_VITIMA sem vítima e COM_VITIMA_FATAL com pior vítima quando fechados então C-1-06 aceita as exceções válidas', async () => {
    const closed = await asTenant(tenantId, async () => {
      const noVictimId = '00000000-0000-7000-8000-0000a5000051';
      const fatalId = '00000000-0000-7000-8000-0000a5000052';
      await insertRecord(noVictimId, {
        state: 'REGISTRADO',
        occurredAt: '2026-09-15T10:01:00-04:00',
      });
      await insertRecord(fatalId, {
        state: 'REGISTRADO',
        severity: 'COM_VITIMA_FATAL',
        occurredAt: '2026-09-15T10:02:00-04:00',
      });
      await client.query(
        `insert into est.crash_person (id, tenant_id, crash_record_id, role)
         values ('00000000-0000-7000-8000-0000a5000053', $1, $2, 'pedestre')`,
        [tenantId, fatalId],
      );
      await client.query(
        `insert into est.crash_victim (id, tenant_id, crash_record_id, crash_person_id, severity)
         values ('00000000-0000-7000-8000-0000a5000054', $1, $2,
                 '00000000-0000-7000-8000-0000a5000053', 'COM_VITIMA_FATAL')`,
        [tenantId, fatalId],
      );
      await client.query(
        `update est.crash_record set state = 'FECHADO' where id = any($1::uuid[])`,
        [[noVictimId, fatalId]],
      );
      return client.query<{ state: string }>(
        `select state from est.crash_record where id = any($1::uuid[]) order by id`,
        [[noVictimId, fatalId]],
      );
    });
    expect(closed.rows.map((row) => row.state)).toEqual(['FECHADO', 'FECHADO']);
  });

  it('dadas fixtures de tenant A quando lidas por role_app_backend no tenant B então C-1-13 retorna zero linhas', async () => {
    const ownRecords = await asTenant(tenantId, () =>
      client.query<{ count: string }>(
        "select count(*)::text as count from est.crash_record where source_system = 'boat-fixture'",
      ),
    );
    expect(Number(ownRecords.rows[0]?.count)).toBeGreaterThan(0);

    const otherTenantId = '00000000-0000-7000-8000-00000000a099';
    for (const table of tenantTables) {
      const result = await asTenant(otherTenantId, () =>
        client.query<{ count: string }>(
          `select count(*)::text as count from est.${table}`,
        ),
      );
      expect(result.rows[0]?.count).toBe('0');
    }
  });

  it('dado role_app_backend no tenant B quando tenta gravar uma linha de tenant A então C-1-03 e C-1-13 rejeitam o cruzamento', async () => {
    await expect(
      asTenant('00000000-0000-7000-8000-00000000a099', () =>
        insertRecord('00000000-0000-7000-8000-0000a5000061'),
      ),
    ).rejects.toMatchObject({ code: '42501' });
  });

  it('dado o banco aplicado quando seed.sh roda duas vezes então mantêm fixtures, chaves naturais e retificação idempotentes', async () => {
    const env = {
      ...process.env,
      DB_NAME: process.env.DB_NAME ?? 'detran_r10',
    };
    execFileSync('bash', ['backend/database/seed.sh'], {
      cwd: repositoryRoot,
      env,
      stdio: 'pipe',
    });
    execFileSync('bash', ['backend/database/seed.sh'], {
      cwd: repositoryRoot,
      env,
      stdio: 'pipe',
    });

    const result = await client.query<{
      records: string;
      localStates: string;
      nationalStates: string;
      victims: string;
      submissions: string;
      rectifications: string;
    }>(
      `select
         (select count(*)::text from est.crash_record where source_system = 'boat-fixture') as records,
         (select count(distinct state)::text from est.crash_record where source_system = 'boat-fixture') as "localStates",
         (select count(distinct national_status)::text from est.crash_record
           where source_system = 'boat-fixture' and national_status is not null) as "nationalStates",
         (select count(distinct (tenant_id, uf, municipality_code, occurred_at, traffic_agency_id))::text
            from est.crash_record where source_system = 'boat-fixture') as "naturalKeys",
         (select count(*)::text from est.crash_victim
           where id in ('00000000-0000-7000-8000-0000a3000001', '00000000-0000-7000-8000-0000a3000002')) as victims,
         (select count(*)::text from est.crash_renaest_submission
           where id in ('00000000-0000-7000-8000-0000a4000001', '00000000-0000-7000-8000-0000a4000002')) as submissions,
         (select count(*)::text from est.crash_renaest_submission
           where id = '00000000-0000-7000-8000-0000a4000002'
             and national_status = 'EM_ANALISE'
             and rectification_kind = 'correction'
             and rectification_reason is not null) as rectifications`,
    );
    expect(result.rows[0]).toEqual({
      records: '13',
      localStates: '9',
      nationalStates: '4',
      naturalKeys: '13',
      victims: '2',
      submissions: '2',
      rectifications: '1',
    });
  });
});
