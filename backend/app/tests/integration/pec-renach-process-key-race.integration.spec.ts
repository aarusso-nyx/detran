// Prova de concorrência da chave de processo RENACH (hotfix fora da R-0022,
// Adenda B10, OD-HF-B9-001 = (a): a chave é única por tenant — um processo
// RENACH pertence a um só paciente). Dois pacientes diferentes, a mesma chave
// devolvida pelo RENACH: T1 vincula a chave ao atendimento do paciente A e
// fica aberta; T2 vincula a mesma chave ao atendimento do paciente B; T1
// commita. Só um vínculo pode persistir e o outro recebe o 409 que o serviço
// já devolve para "chave ligada a outro atendimento". O RENACH é porta
// externa e fica como dublê (processo e elegibilidade fixos).
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { ConflictException } from '@nestjs/common';
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { PecRenachProcessService } from '../../src/pec-renach-process.service.js';
import {
  RaceSession,
  cloneDatabase,
  interleave,
  summarize,
  type RaceDatabase,
} from './race-harness.js';

let clone: RaceDatabase;
let owner: pg.Client;
let first: RaceSession;
let second: RaceSession;
const tenantId = randomUUID();
const actorA = randomUUID();
const actorB = randomUUID();
const clinicId = randomUUID();
const patientA = randomUUID();
const patientB = randomUUID();

/** O dublê do RENACH devolve sempre a mesma chave, para qualquer CPF. */
function renach(processKey: string) {
  return {
    openProcess: async () => ({
      renachNumber: processKey,
      processType: 'RENEWAL',
      openingResult: 'OPENED',
    }),
    getExamEligibility: async () => ({
      renachNumber: processKey,
      processType: 'RENEWAL',
      medicalEligible: true,
      psychologicalRequired: false,
      reasons: [],
    }),
  };
}

/** `openAndBind` abre duas transações (leitura do atendimento, vínculo); só a
 * segunda — a que checa e grava a chave — fica aberta. */
function bind(
  session: RaceSession,
  actorId: string,
  encounterId: string,
  processKey: string,
  hold?: () => Promise<void>,
) {
  let calls = 0;
  const plain = session.database(tenantId, actorId);
  const held = session.database(tenantId, actorId, hold);
  const database = {
    tx: <T>(work: (tx: never) => Promise<T>) =>
      ((calls += 1) === 2 && hold ? held : plain).tx(
        work as never,
      ) as Promise<T>,
  };
  const requestContext = {
    hasActiveContext: () => true,
    snapshot: () => ({ tenantId, actorId, requestId: randomUUID() }),
  };
  return new PecRenachProcessService(
    database as never,
    requestContext as never,
    renach(processKey) as never,
  ).openAndBind(encounterId, {
    processType: 'RENEWAL',
    currentCategory: 'B',
  });
}

async function newEncounter(patientId: string): Promise<string> {
  const encounterId = randomUUID();
  await owner.query(
    `insert into ch.encounter (id, tenant_id, clinic_id, patient_id, status)
     values ($1, $2, $3, $4, 'OPEN')`,
    [encounterId, tenantId, clinicId, patientId],
  );
  return encounterId;
}

async function holders(processKey: string) {
  const result = await owner.query<{ patient_id: string }>(
    `select patient_id from ch.encounter
      where tenant_id = $1 and renach_process_key = $2
      order by patient_id`,
    [tenantId, processKey],
  );
  return result.rows.map((row) => row.patient_id);
}

beforeAll(async () => {
  clone = await cloneDatabase();
  owner = new pg.Client({ connectionString: clone.url });
  await owner.connect();
  // Fixtures (owner, só no clone).
  await owner.query(`select set_config('app.role', 'owner', false)`);
  await owner.query(
    'insert into auth.tenants (id, slug, name) values ($1, $2, $3)',
    [tenantId, `renach-key-race-${tenantId.slice(0, 8)}`, 'RENACH key race'],
  );
  for (const userId of [actorA, actorB]) {
    await owner.query(
      `insert into auth.users (id, tenant_id, email, display_name)
       values ($1, $2, $3, 'RENACH key race')`,
      [userId, tenantId, `${userId}@detran.invalid`],
    );
  }
  await owner.query(
    `insert into ch.clinic (id, tenant_id, code, cnpj, name, region_code)
     values ($1, $2, 'RENACH-RACE', '00000000000191', 'Clínica prova', 'R1')`,
    [clinicId, tenantId],
  );
  await owner.query(
    `insert into ch.patient (id, tenant_id, clinic_id, national_id, name)
     values ($1, $2, $4, '00000000191', 'Paciente A'),
            ($3, $2, $4, '00000000272', 'Paciente B')`,
    [patientA, tenantId, patientB, clinicId],
  );
  first = await RaceSession.open(clone.url, 'renach-key-race-t1');
  second = await RaceSession.open(clone.url, 'renach-key-race-t2');
});

afterAll(async () => {
  try {
    await Promise.all(
      [first, second, owner]
        .filter(Boolean)
        .map((client) => client.end().catch(() => undefined)),
    );
  } finally {
    await clone?.drop();
  }
});

describe('chave de processo RENACH única por tenant (OD-HF-B9-001 = a)', () => {
  it('dado dois pacientes e a mesma chave quando vinculam em paralelo então só um grava e o outro recebe 409', async () => {
    const processKey = `RN-RACE-${randomUUID().slice(0, 8)}`;
    const encounterA = await newEncounter(patientA);
    const encounterB = await newEncounter(patientB);

    const outcome = await interleave({
      observer: owner,
      second,
      runFirst: (hold) => bind(first, actorA, encounterA, processKey, hold),
      runSecond: () => bind(second, actorB, encounterB, processKey),
    });

    expect(
      {
        first: summarize(outcome.first),
        second: summarize(outcome.second),
        holders: await holders(processKey),
      },
      'dois pacientes com a mesma chave RENACH gravaram em paralelo',
    ).toEqual({
      first: { status: 'fulfilled' },
      second: {
        status: 'rejected',
        code: undefined,
        httpStatus: 409,
        message: 'RENACH process key is already linked to another encounter',
      },
      holders: [patientA],
    });
    expect(outcome.secondWhileFirstOpen).toBe('blocked');
    expect(
      outcome.second.status === 'rejected' && outcome.second.reason,
    ).toBeInstanceOf(ConflictException);
  });

  it('dado a chave já gravada para um paciente quando outro paciente vincula depois do commit então é recusado com 409', async () => {
    const processKey = `RN-SEQ-${randomUUID().slice(0, 8)}`;
    const encounterA = await newEncounter(patientA);
    const encounterB = await newEncounter(patientB);

    await expect(
      bind(first, actorA, encounterA, processKey),
    ).resolves.toMatchObject({
      status: 'OPENED',
      renachProcessKey: processKey,
    });
    const late = bind(second, actorB, encounterB, processKey);
    await expect(late).rejects.toBeInstanceOf(ConflictException);
    await expect(late).rejects.toThrow(
      'RENACH process key is already linked to another encounter',
    );
    expect(await holders(processKey)).toEqual([patientA]);
  });
});

const ddl = (name: string) =>
  readFileSync(
    new URL(`../../../database/ddl/${name}`, import.meta.url),
    'utf8',
  );

describe('pré-checagem manuscrita 19-ch-encounter-renach-key.sql', () => {
  it('dado banco legado com a mesma chave em dois pacientes quando reaplica a DDL então recusa listando a chave e, resolvida a duplicata, cria o índice e retira o anterior', async () => {
    const processKey = `RN-LEGACY-${randomUUID().slice(0, 8)}`;
    // Banco legado: sem o índice novo, com o anterior (tenant, paciente, chave).
    await owner.query('drop index ch.ux_ch_encounter_renach_process_key');
    await owner.query(
      `create unique index ux_ch_encounter_renach_process
         on ch.encounter (tenant_id, patient_id, renach_process_key)
         where renach_process_key is not null`,
    );
    const legacy: string[] = [];
    for (const patientId of [patientA, patientB]) {
      const encounterId = await newEncounter(patientId);
      legacy.push(encounterId);
      await owner.query(
        `update ch.encounter
            set renach_process_key = $2, renach_process_type = 'RENEWAL',
                exam_eligible = true, eligibility_checked_at = now()
          where id = $1`,
        [encounterId, processKey],
      );
    }

    await expect(
      owner.query(ddl('19-ch-encounter-renach-key.sql')),
    ).rejects.toThrow(
      `renach_process_key=${processKey} atendimentos=2 pacientes=2`,
    );

    await owner.query(
      `update ch.encounter
          set renach_process_key = null, renach_process_type = null,
              exam_eligible = null, eligibility_checked_at = null
        where id = $1`,
      [legacy[1]],
    );
    await owner.query(ddl('19-ch-encounter-renach-key.sql'));
    await owner.query(ddl('42-ch-encounters.sql'));
    const indexes = await owner.query<{ indexname: string }>(
      `select indexname from pg_indexes
        where schemaname = 'ch' and tablename = 'encounter'
          and indexname like 'ux_ch_encounter_renach_process%'`,
    );
    expect(indexes.rows.map((row) => row.indexname)).toEqual([
      'ux_ch_encounter_renach_process_key',
    ]);
  });
});
