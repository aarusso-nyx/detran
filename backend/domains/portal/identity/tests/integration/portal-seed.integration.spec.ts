// CTG-0001 §10.9 (M22) — contagens exatas e invariantes das fixtures canônicas de
// `70-fixtures-portal.sql` depois de `DB_NAME=detran_r9 DB_PASSWORD=postgres bash
// backend/database/seed.sh` rodado duas vezes seguidas (critério de aceitação da tarefa,
// confirmado sem erro antes deste arquivo existir — a idempotência dos upserts por id garante
// que nenhuma duplicata sobrevive a uma segunda execução; as asserções de unicidade abaixo
// verificam isso pelo próprio conteúdo, não repetindo o seed.sh dentro do teste). Não depende de
// código manuscrito.
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

beforeAll(async () => {
  await client.connect();
  await client.query(`select set_config('app.role', 'owner', false)`);
  await client.query(`select set_config('app.tenant_id', $1, false)`, [
    CANONICAL_TENANT,
  ]);
});

afterAll(async () => {
  await client.end();
});

const one = async <T>(sql: string, params: unknown[] = []): Promise<T> => {
  const result = await client.query<Record<string, T>>(sql, params);
  const row = result.rows[0] as Record<string, T> | undefined;
  const key = Object.keys(row ?? {})[0] as string;
  return row?.[key] as T;
};

describe('70-fixtures-portal.sql — contagens e invariantes (CTG-0001 §10.9, M22)', () => {
  it('C-0001-33 — dado o seed rodado (duas vezes) então as contagens do §10.9 e nenhuma duplicata (cpf_hash, service_key, act_key+effective_from, protocol.number, source_event_id)', async () => {
    const counts: Record<string, number> = {};
    for (const table of [
      'subject',
      'representation',
      'entitlement',
      'act_level_policy',
      'request',
      'request_draft',
      'protocol',
      'manifestation',
      'manifestation_extension',
      'service_catalog',
      'inbox_item',
      'acknowledgement_evidence',
      'sne_enrollment',
      'push_subscription',
      'infraction_view',
      'points_view',
    ]) {
      counts[table] = Number(
        await one<string>(
          `select count(*)::text as n from portal.${table} where tenant_id = $1`,
          [CANONICAL_TENANT],
        ),
      );
    }
    expect(counts).toEqual({
      subject: 5,
      representation: 1,
      entitlement: 13, // A22 (R-0014 CTG-0004 §3): entitlement vehicle da Prata (UUIDv5 do chassi)
      act_level_policy: 21,
      request: 13,
      request_draft: 1,
      protocol: 5,
      manifestation: 9,
      manifestation_extension: 1,
      service_catalog: 15,
      inbox_item: 2,
      acknowledgement_evidence: 0,
      sne_enrollment: 1,
      push_subscription: 0,
      infraction_view: 7,
      points_view: 1,
    });

    expect(
      Number(
        await one<string>(
          `select count(distinct (tenant_id, cpf_hash))::text as n from portal.subject where tenant_id = $1`,
          [CANONICAL_TENANT],
        ),
      ),
    ).toBe(5);
    expect(
      Number(
        await one<string>(
          `select count(distinct service_key)::text as n from portal.service_catalog where tenant_id = $1`,
          [CANONICAL_TENANT],
        ),
      ),
    ).toBe(15);
    expect(
      Number(
        await one<string>(
          `select count(distinct (act_key, effective_from))::text as n from portal.act_level_policy where tenant_id = $1`,
          [CANONICAL_TENANT],
        ),
      ),
    ).toBe(21);
    expect(
      Number(
        await one<string>(
          `select count(distinct number)::text as n from portal.protocol where tenant_id = $1`,
          [CANONICAL_TENANT],
        ),
      ),
    ).toBe(5);
    expect(
      Number(
        await one<string>(
          `select count(distinct source_event_id)::text as n from portal.inbox_item where tenant_id = $1`,
          [CANONICAL_TENANT],
        ),
      ),
    ).toBe(2);
  });

  it('C-0001-34 — dado act_level_policy então nenhuma linha minimum_assurance="qualificada" e manifestar tem minimum_assurance="none" (RN-PORTAL-101 (c); H.51)', async () => {
    const qualificada = Number(
      await one<string>(
        `select count(*)::text as n from portal.act_level_policy where tenant_id = $1 and minimum_assurance = 'qualificada'`,
        [CANONICAL_TENANT],
      ),
    );
    expect(qualificada).toBe(0);

    const manifestar = await client.query<{ minimum_assurance: string }>(
      `select minimum_assurance from portal.act_level_policy where tenant_id = $1 and act_key = 'manifestar'`,
      [CANONICAL_TENANT],
    );
    expect(manifestar.rows[0]?.minimum_assurance).toBe('none');
  });

  it('C-0001-35 — dado service_catalog então 9 available / 2 partially_available / 4 unavailable e toda unavailable tem unavailable_reason "delegacao_indisponivel_r0007"', async () => {
    const byAvailability = await client.query<{
      availability: string;
      n: string;
    }>(
      `select availability, count(*)::text as n from portal.service_catalog where tenant_id = $1 group by availability`,
      [CANONICAL_TENANT],
    );
    const counts = Object.fromEntries(
      byAvailability.rows.map((row) => [row.availability, Number(row.n)]),
    );
    expect(counts).toEqual({
      available: 9,
      partially_available: 2,
      unavailable: 4,
    });

    const unavailableReasons = await client.query<{
      unavailable_reason: string | null;
    }>(
      `select unavailable_reason from portal.service_catalog where tenant_id = $1 and availability = 'unavailable'`,
      [CANONICAL_TENANT],
    );
    expect(unavailableReasons.rows).toHaveLength(4);
    for (const row of unavailableReasons.rows) {
      expect(row.unavailable_reason).toBe('delegacao_indisponivel_r0007');
    }
  });

  it('C-0001-36 — dado request então 13 estados distintos e exatamente 5 protocolos, um por estado ≥ PROTOCOLADO exceto DESISTIDO', async () => {
    const distinctStates = Number(
      await one<string>(
        `select count(distinct state)::text as n from portal.request where tenant_id = $1`,
        [CANONICAL_TENANT],
      ),
    );
    expect(distinctStates).toBe(13);

    const protocolled = await client.query<{ state: string }>(
      `select r.state from portal.request r
         join portal.protocol p on p.request_id = r.id and p.tenant_id = r.tenant_id
        where r.tenant_id = $1`,
      [CANONICAL_TENANT],
    );
    expect(protocolled.rows).toHaveLength(5);
    const protocolledStates = protocolled.rows.map((row) => row.state).sort();
    expect(protocolledStates).toEqual(
      [
        'PROTOCOLADO',
        'EM_ANDAMENTO_NO_ORGAO',
        'RESULTADO_DISPONIVEL',
        'AVALIACAO_OFERECIDA',
        'CONCLUIDO',
      ].sort(),
    );
    expect(protocolledStates).not.toContain('DESISTIDO');
  });

  it('C-0001-37 — dado manifestation então 9 estados distintos, uma anônima com subject_id nulo, e agency_due_on = received_at + 30 dias corridos em todas', async () => {
    const distinctStates = Number(
      await one<string>(
        `select count(distinct state)::text as n from portal.manifestation where tenant_id = $1`,
        [CANONICAL_TENANT],
      ),
    );
    expect(distinctStates).toBe(9);

    const anonymous = await client.query<{
      subject_id: string | null;
      anonymous: boolean;
    }>(
      `select subject_id, anonymous from portal.manifestation where tenant_id = $1 and anonymous = true`,
      [CANONICAL_TENANT],
    );
    expect(anonymous.rows).toHaveLength(1);
    expect(anonymous.rows[0]?.subject_id).toBeNull();

    const mismatched = Number(
      await one<string>(
        `select count(*)::text as n from portal.manifestation
          where tenant_id = $1 and agency_due_on <> (received_at::date + interval '30 days')::date`,
        [CANONICAL_TENANT],
      ),
    );
    expect(mismatched).toBe(0);
  });
});
