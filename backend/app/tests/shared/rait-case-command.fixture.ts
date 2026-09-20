import pg from 'pg';

const { Client } = pg;

export const RAIT_TENANT = '00000000-0000-7000-8000-00000000a001';
const RAIT_OTHER_TENANT = '00000000-0000-7000-8000-00000000a002';
export const RAIT_ACTOR = '00000000-0000-4000-8000-0000b0000001';
export const RAIT_SECRETARY = '00000000-0000-4000-8000-0000b0000005';
export const RAIT_RAPPORTEUR = '00000000-0000-4000-8000-0000b0000008';
export const RAIT_AUTHORITY = '00000000-0000-4000-8000-0000b0000006';
export const RAIT_CASE = (suffix: string) =>
  `00000000-0000-7000-8000-0000100000${suffix}`;
export const RAIT_INQUIRY = '00000000-0000-7000-8000-000015000001';
export const RAIT_POOL = '00000000-0000-7000-8000-000020000001';
export const RAIT_AIT = '00000000-0000-7000-8000-0000f0000005';
const ADMIT_CASE = RAIT_CASE('02');
const ADMIT_INFRACTION = '00000000-0000-7000-8000-0000d0000002';
const ADMIT_T_DEF = '00000000-0000-7000-8000-0000d1000005';
const ADMIT_TIMER_OVERRIDE = '71000000-0000-7000-8000-000000000020';
const ADMIT_TIMER_DUPLICATE = '71000000-0000-7000-8000-000000000021';
const ADMIT_CETRAN_SECRETARY_MEMBER = '71000000-0000-7000-8000-000000000022';
const ADMIT_CETRAN_POOL = '00000000-0000-7000-8000-000020000003';
const DECIDE_JURISDICTION = '71000000-0000-7000-8000-000000000050';
const DECIDE_AUTHORITY_MEMBER = '71000000-0000-7000-8000-000000000051';
const DECIDE_AUTHORITY_SCHEDULE = '71000000-0000-7000-8000-000000000052';
const DECIDE_AUTHORITY_SLOT = '71000000-0000-7000-8000-000000000053';
const CLAIM_ACTOR_SLOT = '71000000-0000-7000-8000-000000000054';
const DECIDE_AUTHORITY_SLOT_UTC = '71000000-0000-7000-8000-000000000055';
const CLAIM_ACTOR_SLOT_UTC = '71000000-0000-7000-8000-000000000056';
const DECIDE_POOL = '00000000-0000-7000-8000-000020000002';

/**
 * Capture the E2E operation instant once and derive its America/Manaus civil
 * day. Fixture schedules cover that day and the next, so crossing one local
 * midnight during the suite stays explicit; a longer run fails rather than
 * changing availability behind the command under test.
 */
const OPERATION_INSTANT = new Date();
const OPERATION_DAY = (() => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Manaus',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(OPERATION_INSTANT);
  const value = Object.fromEntries(
    parts
      .filter(({ type }) => type !== 'literal')
      .map(({ type, value }) => [type, value]),
  );
  return `${value.year!}-${value.month!}-${value.day!}`;
})();
const UTC_OPERATION_DAY = OPERATION_INSTANT.toISOString().slice(0, 10);

export type AdmitBindingScenario = {
  instance?: 'defesa_previa' | 'jari' | 'cetran';
  channel?: string;
  protocolledAt?: string;
  timezone?: string;
  timer?: 'armed' | 'missing' | 'closed' | 'multiple';
  dueOn?: string;
};

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required for RAIT command e2e`);
  return value;
}

export function assertDedicatedDatabaseEnvironment(): void {
  const expected = 'detran_r7_ctg1_a2';
  for (const name of [
    'DETRAN_TEST_DATABASE_URL',
    'DATABASE_URL',
    'STYNX_OWNER_DATABASE_URL',
    'STYNX_APP_DATABASE_URL',
    'STYNX_READER_DATABASE_URL',
  ]) {
    const parsed = new URL(required(name));
    if (parsed.pathname.slice(1) !== expected)
      throw new Error(`${name} must target ${expected}`);
  }
  if (process.env.DETRAN_RUNTIME_PROFILE !== 'test')
    throw new Error('DETRAN_RUNTIME_PROFILE=test is required');
}

export type EvidenceScenario =
  | 'empty'
  | 'valid-optional'
  | 'invalid-optional'
  | 'mandatory-cross-tenant'
  | 'mandatory-invalid'
  | 'mandatory-all-valid'
  | 'valid-plus-invalid-mandatory'
  | 'wrong-entity'
  | 'blank-storage'
  | 'packaged-valid';

const scenarioNumber: Record<EvidenceScenario, string> = {
  empty: '01',
  'valid-optional': '02',
  'invalid-optional': '03',
  'mandatory-cross-tenant': '04',
  'mandatory-invalid': '05',
  'mandatory-all-valid': '06',
  'valid-plus-invalid-mandatory': '07',
  'wrong-entity': '08',
  'blank-storage': '09',
  'packaged-valid': '10',
};

export class RaitCaseCommandFixture {
  readonly owner = new Client({
    connectionString: required('STYNX_OWNER_DATABASE_URL'),
  });

  async connect(): Promise<void> {
    await this.owner.connect();
    await this.owner.query("select set_config('app.role', 'owner', false)");
    await this.owner.query("select set_config('app.tenant_id', $1, false)", [
      RAIT_TENANT,
    ]);
  }

  async close(): Promise<void> {
    await this.resetMutableState();
    await this.clearEvidence();
    await this.owner.end();
  }

  async resetMutableState(): Promise<void> {
    await this.disableAuditFailure();
    await this.owner.query(
      `delete from inf.rait_decision where tenant_id = $1 and case_id = $2`,
      [RAIT_TENANT, RAIT_CASE('09')],
    );
    await this.owner.query(
      `delete from inf.rait_withdrawal_attestation
        where tenant_id = $1 and case_id = $2`,
      [RAIT_TENANT, RAIT_CASE('07')],
    );
    await this.owner.query(
      `delete from inf.rait_assignment
        where tenant_id = $1 and assigned_by = $2`,
      [RAIT_TENANT, RAIT_ACTOR],
    );
    await this.owner.query(
      `update inf.rait_assignment
          set active = case when id = '00000000-0000-7000-8000-000022000006'::uuid
                            then false else true end,
              released_at = case when id = '00000000-0000-7000-8000-000022000006'::uuid
                                 then '2026-09-03T16:00:00Z'::timestamptz else null end,
              release_reason = case when id = '00000000-0000-7000-8000-000022000006'::uuid
                                    then 'concluido' else null end
        where tenant_id = $1 and id::text like '00000000-0000-7000-8000-0000220000%'`,
      [RAIT_TENANT],
    );
    await this.owner.query(
      `update inf.rait_case set agency_jurisdiction_id = null
        where tenant_id = $1 and id = $2`,
      [RAIT_TENANT, RAIT_CASE('09')],
    );
    await this.owner.query(
      `delete from inf.rait_schedule_slot where tenant_id = $1 and id = any($2::uuid[])`,
      [RAIT_TENANT, [CLAIM_ACTOR_SLOT, CLAIM_ACTOR_SLOT_UTC]],
    );
    await this.owner.query(
      `delete from inf.rait_schedule_slot where tenant_id = $1 and id = any($2::uuid[])`,
      [RAIT_TENANT, [DECIDE_AUTHORITY_SLOT, DECIDE_AUTHORITY_SLOT_UTC]],
    );
    await this.owner.query(
      `delete from inf.rait_schedule where tenant_id = $1 and id = $2`,
      [RAIT_TENANT, DECIDE_AUTHORITY_SCHEDULE],
    );
    await this.owner.query(
      `delete from inf.rait_pool_member where tenant_id = $1 and id = $2`,
      [RAIT_TENANT, DECIDE_AUTHORITY_MEMBER],
    );
    await this.owner.query(
      `delete from ops.agency_jurisdiction where tenant_id = $1 and id = $2`,
      [RAIT_TENANT, DECIDE_JURISDICTION],
    );
    await this.owner.query(
      `delete from inf.rait_deadline
        where tenant_id = $1 and case_id = $2 and timer_code = 'T-REM10'`,
      [RAIT_TENANT, RAIT_CASE('05')],
    );
    await this.owner.query(
      `insert into inf.rait_deadline
         (id, tenant_id, case_id, timer_code, start_basis, started_on,
          raw_due_on, due_on, business_days, extension_count, legal_basis)
       values ('00000000-0000-7000-8000-000014000001',$1,$2,'T-REM10',
               'interposição do recurso','2026-09-08','2026-09-18',
               '2026-09-18',false,0,'CTB art. 285 §2º')`,
      [RAIT_TENANT, RAIT_CASE('05')],
    );
    await this.owner.query(
      `delete from inf.infraction_timer
        where tenant_id = $1 and id = any($2::uuid[])`,
      [RAIT_TENANT, [ADMIT_TIMER_OVERRIDE, ADMIT_TIMER_DUPLICATE]],
    );
    await this.owner.query(
      `delete from inf.rait_pool_member where tenant_id = $1 and id = $2`,
      [RAIT_TENANT, ADMIT_CETRAN_SECRETARY_MEMBER],
    );
    await this.owner.query(
      `update inf.infraction_timer
          set status = 'armado', started_on = '2026-09-01',
              raw_due_on = '2026-09-30', due_on = '2026-09-30',
              satisfied_at = null, expired_at = null
        where tenant_id = $1 and id = $2`,
      [RAIT_TENANT, ADMIT_T_DEF],
    );
    await this.owner.query(
      `update auth.tenants set timezone = 'America/Manaus' where id = $1`,
      [RAIT_TENANT],
    );
    await this.owner.query(
      `delete from inf.rait_admissibility
        where tenant_id = $1 and id::text like '71000000-%'`,
      [RAIT_TENANT],
    );
    await this.owner.query(
      `update inf.rait_case
          set ait_id = '00000000-0000-7000-8000-0000f0000010'
        where tenant_id = $1 and id = $2`,
      [RAIT_TENANT, RAIT_CASE('10')],
    );
    await this.owner.query(
      `update inf.rait_case set origin_case_id = null
        where tenant_id = $1 and id = $2`,
      [RAIT_TENANT, RAIT_CASE('05')],
    );
    await this.owner.query(
      `update inf.notice set document_id = null
        where tenant_id = $1
          and infraction_id = '00000000-0000-7000-8000-0000d0000005'
          and kind in ('NA','NP')`,
      [RAIT_TENANT],
    );
    await this.owner.query(
      `delete from integration.idempotency_keys where tenant_id = $1`,
      [RAIT_TENANT],
    );
    await this.owner.query(
      `delete from integration.outbox
        where tenant_id = $1 and idempotency_key like 'r7-c3-%'`,
      [RAIT_TENANT],
    );
    await this.owner.query(
      `update inf.rait_case
          set state = case id
            when $2 then 'TRIAGEM_ADMISSIBILIDADE'
            when $3 then 'AGUARDANDO_REMESSA_JARI'
            when $4 then 'DISTRIBUIDO'
            when $5 then 'EM_INSTRUCAO'
            when $6 then 'DILIGENCIA'
            when $7 then 'PRONTO_P_DECISAO'
            else state end,
              version = 1,
              admitted_at = case when id = $3 then '2026-09-09T14:00:00Z'::timestamptz else admitted_at end,
              remitted_at = null,
              judge_body_received_at = null,
              judge_body_received_on = null,
              cetran_received_at = null,
              cetran_received_on = null,
              decided_at = null,
              closed_at = null,
              withdrawal_document_id = null
        where tenant_id = $1 and id = any($8::uuid[])`,
      [
        RAIT_TENANT,
        RAIT_CASE('02'),
        RAIT_CASE('05'),
        RAIT_CASE('06'),
        RAIT_CASE('07'),
        RAIT_CASE('08'),
        RAIT_CASE('09'),
        [
          RAIT_CASE('02'),
          RAIT_CASE('05'),
          RAIT_CASE('06'),
          RAIT_CASE('07'),
          RAIT_CASE('08'),
          RAIT_CASE('09'),
        ],
      ],
    );
    await this.owner.query(
      `update inf.rait_case
          set instance = 'defesa_previa', circuit = 1,
              intake_channel = 'portal'
        where tenant_id = $1 and id = $2`,
      [RAIT_TENANT, ADMIT_CASE],
    );
    await this.owner.query(
      `update inf.rait_inquiry
          set answered_at = null, answered_on = null, outcome = null,
              extension_count = 0, due_on = '2026-09-23'
        where tenant_id = $1 and id = $2`,
      [RAIT_TENANT, RAIT_INQUIRY],
    );
    await this.owner.query(
      `update inf.rait_deadline
          set due_on = '2026-09-23', raw_due_on = '2026-09-23',
              extension_count = 0, satisfied_at = null
        where tenant_id = $1 and case_id = $2 and timer_code = 'T-DIL'`,
      [RAIT_TENANT, RAIT_CASE('08')],
    );
    await this.owner.query(
      `update inf.rait_draft
          set status = 'rascunho', submitted_at = null, returned_at = null,
              return_guidance = null, return_count = 0, document_id = null
        where tenant_id = $1
          and id = '00000000-0000-7000-8000-000038000001'`,
      [RAIT_TENANT],
    );
    await this.owner.query(
      `update inf.rait_draft
          set status = 'submetida', submitted_at = '2026-08-19T14:00:00Z',
              returned_at = null, return_guidance = null, return_count = 0,
              document_id = '00000000-0000-7000-8000-000012000009'
        where tenant_id = $1
          and id = '00000000-0000-7000-8000-000038000002'`,
      [RAIT_TENANT],
    );
  }

  async enableAuditFailure(): Promise<void> {
    await this.disableAuditFailure();
    await this.owner.query(
      `create sequence audit.r7_c3_audit_fail_probe_seq start 1`,
    );
    await this.owner.query(
      `create function audit.r7_c3_force_write_failure() returns trigger
       language plpgsql as $fixture$
       begin
         perform nextval('audit.r7_c3_audit_fail_probe_seq');
         raise exception 'R7_C3_FORCED_AUDIT_WRITE_FAILURE';
       end
       $fixture$`,
    );
    await this.owner.query(
      `create trigger r7_c3_force_write_failure
         before insert on audit.events for each row
         execute function audit.r7_c3_force_write_failure()`,
    );
  }

  async auditFailureWasInvoked(): Promise<boolean> {
    const result = await this.owner.query<{ is_called: boolean }>(
      `select is_called from audit.r7_c3_audit_fail_probe_seq`,
    );
    return result.rows[0]?.is_called === true;
  }

  async disableAuditFailure(): Promise<void> {
    await this.owner.query(
      `drop trigger if exists r7_c3_force_write_failure on audit.events`,
    );
    await this.owner.query(
      `drop function if exists audit.r7_c3_force_write_failure()`,
    );
    await this.owner.query(
      `drop sequence if exists audit.r7_c3_audit_fail_probe_seq`,
    );
  }

  async prepareAdmitBinding(
    caseId: string,
    scenario: AdmitBindingScenario = {},
  ): Promise<void> {
    await this.prepareCommand('admit', caseId);
    const instance = scenario.instance ?? 'defesa_previa';
    const timerCode =
      instance === 'defesa_previa'
        ? 'T-DEF'
        : instance === 'jari'
          ? 'T-NP-VENC'
          : 'T-R2';
    const timer = scenario.timer ?? 'armed';
    const dueOn = scenario.dueOn ?? '2026-09-30';

    await this.owner.query(
      `update inf.rait_case
          set state = 'TRIAGEM_ADMISSIBILIDADE', version = 1
        where tenant_id = $1 and id = $2`,
      [RAIT_TENANT, caseId],
    );

    await this.owner.query(
      `update auth.tenants set timezone = $2 where id = $1`,
      [RAIT_TENANT, scenario.timezone ?? 'America/Manaus'],
    );
    if (
      scenario.channel &&
      !['balcao', 'portal', 'sne', 'postal'].includes(scenario.channel)
    ) {
      await this.owner.query(
        `update inf.rait_case set intake_channel = $3
          where tenant_id = $1 and id = $2`,
        [RAIT_TENANT, caseId, scenario.channel],
      );
    }

    if (instance === 'defesa_previa') {
      await this.owner.query(
        `update inf.infraction_timer
            set status = $3::varchar, started_on = '2026-09-01',
                raw_due_on = $4::date, due_on = $4::date,
                satisfied_at = case when $3::varchar = 'satisfeito'
                  then '2026-09-14T12:00:00Z'::timestamptz else null end,
                expired_at = null
          where tenant_id = $1 and id = $2`,
        [
          RAIT_TENANT,
          ADMIT_T_DEF,
          timer === 'armed' || timer === 'multiple' ? 'armado' : 'satisfeito',
          dueOn,
        ],
      );
    } else if (timer !== 'missing') {
      await this.insertAdmitTimer(
        ADMIT_TIMER_OVERRIDE,
        timerCode,
        timer === 'closed' ? 'satisfeito' : 'armado',
        dueOn,
        instance,
        '2026-09-01',
      );
    }

    if (timer === 'multiple') {
      await this.insertAdmitTimer(
        ADMIT_TIMER_DUPLICATE,
        timerCode,
        'armado',
        dueOn,
        instance,
        '2026-09-02',
      );
    }
  }

  async prepareProtocolScope(
    instance: 'defesa_previa' | 'jari' | 'cetran',
  ): Promise<void> {
    if (instance !== 'cetran') return;
    await this.owner.query(
      `insert into inf.rait_pool_member
         (id, tenant_id, pool_id, person_id, member_role, status, is_substitute)
       select $1, $2, pool.id, $3, 'secretaria', 'ATIVO', false
         from inf.rait_pool pool
        where pool.tenant_id = $2 and pool.id = $4
          and pool.instance = 'cetran' and pool.active
          and pool.unit_id is null
       on conflict (id) do update
         set pool_id = excluded.pool_id,
             person_id = excluded.person_id,
             member_role = excluded.member_role,
             status = excluded.status,
             is_substitute = excluded.is_substitute`,
      [
        ADMIT_CETRAN_SECRETARY_MEMBER,
        RAIT_TENANT,
        RAIT_SECRETARY,
        ADMIT_CETRAN_POOL,
      ],
    );
  }

  private async insertAdmitTimer(
    id: string,
    timerCode: string,
    status: string,
    dueOn: string,
    instance: 'defesa_previa' | 'jari' | 'cetran',
    startedOn: string,
  ): Promise<void> {
    await this.owner.query(
      `insert into inf.infraction_timer
         (id, tenant_id, infraction_id, timer_code, instance, start_basis,
          started_on, raw_due_on, due_on, business_days, status,
          satisfied_at, legal_basis)
       values ($1,$2,$3,$4::varchar,$5::varchar,'fixture-ctg-10.9',
               $6::date,$7::date,$7::date,false,$8::varchar,
               case when $8::varchar = 'satisfeito'
                    then '2026-09-14T12:00:00Z'::timestamptz else null end,
               'CTG-0001 §10.9')`,
      [
        id,
        RAIT_TENANT,
        ADMIT_INFRACTION,
        timerCode,
        instance === 'defesa_previa' ? null : instance,
        startedOn,
        dueOn,
        status,
      ],
    );
  }

  async prepareCommand(
    command: string,
    caseId = RAIT_CASE('02'),
  ): Promise<void> {
    await this.resetMutableState();
    if (command === 'admit' || command === 'non-admission') {
      await this.owner.query(
        `insert into inf.rait_admissibility
           (id, tenant_id, case_id, criterion, verdict, evaluated_by)
         select
           ('71000000-0000-7000-8000-00000000000' || ordinal)::uuid,
           $1, $3, criterion,
           case when $2 = 'non-admission' and criterion = 'tempestividade'
                then false else true end,
           $4
         from unnest(array[
           'tempestividade','legitimidade','assinatura','pedido_compativel'
         ]) with ordinality as criteria(criterion, ordinal)
         on conflict (tenant_id, case_id, criterion) do update
           set verdict = excluded.verdict,
               evaluated_by = excluded.evaluated_by`,
        [RAIT_TENANT, command, caseId, RAIT_ACTOR],
      );
    }
    if (command === 'remit') {
      await this.owner.query(
        `delete from inf.rait_deadline
          where tenant_id = $1 and case_id = $2 and timer_code = 'T-REM10'`,
        [RAIT_TENANT, RAIT_CASE('05')],
      );
      await this.owner.query(
        `update inf.rait_case set state = 'ADMITIDO', version = 1
          where tenant_id = $1 and id = $2`,
        [RAIT_TENANT, RAIT_CASE('05')],
      );
      await this.evidenceScenario('valid-optional');
      await this.owner.query(
        `update inf.rait_case set ait_id = $3 where tenant_id = $1 and id = $2`,
        [RAIT_TENANT, RAIT_CASE('10'), RAIT_AIT],
      );
      await this.owner.query(
        `update inf.rait_case set origin_case_id = $2
          where tenant_id = $1 and id = $3`,
        [RAIT_TENANT, RAIT_CASE('10'), RAIT_CASE('05')],
      );
      await this.owner.query(
        `update inf.notice
            set document_id = case kind
              when 'NA' then '71000000-0000-7000-8000-000000000031'::uuid
              else '71000000-0000-7000-8000-000000000032'::uuid end
          where tenant_id = $1
            and infraction_id = '00000000-0000-7000-8000-0000d0000005'
            and kind in ('NA','NP')`,
        [RAIT_TENANT],
      );
      await this.owner.query(
        `insert into inf.rait_admissibility
           (id, tenant_id, case_id, criterion, verdict, evaluated_by)
         select ('71000000-0000-7000-8000-00000000004' || ordinal)::uuid,
                $1, $2, criterion, true, $3
           from unnest(array['tempestividade','legitimidade','assinatura',
                             'pedido_compativel'])
                with ordinality as criteria(criterion, ordinal)
         on conflict (tenant_id, case_id, criterion) do update
           set verdict = true, evaluated_by = excluded.evaluated_by`,
        [RAIT_TENANT, RAIT_CASE('05'), RAIT_ACTOR],
      );
    }
    if (command === 'ready') {
      await this.owner.query(
        `update inf.rait_draft
            set status = 'submetida', submitted_at = '2026-09-14T12:00:00Z',
                document_id = '00000000-0000-7000-8000-000012000007'
          where tenant_id = $1 and id = '00000000-0000-7000-8000-000038000001'`,
        [RAIT_TENANT],
      );
    }
    if (command === 'decide' || command === 'return-draft') {
      await this.owner.query(
        `update inf.rait_draft
            set status = 'submetida', return_count = 0,
                returned_at = null, return_guidance = null,
                submitted_at = '2026-09-14T12:00:00Z',
                document_id = '00000000-0000-7000-8000-000012000009'
          where tenant_id = $1
            and id = '00000000-0000-7000-8000-000038000002'`,
        [RAIT_TENANT],
      );
    }
    if (command === 'decide') {
      await this.owner.query(
        `insert into ops.agency_jurisdiction
           (id, tenant_id, traffic_agency_id, name, external_code)
         values ($1,$2,'00000000-0000-7000-8000-0000e2000001',
                 'Fixture decisão CTG-0001', 'R7-C3-DECIDE')`,
        [DECIDE_JURISDICTION, RAIT_TENANT],
      );
      await this.owner.query(
        `insert into inf.rait_pool_member
           (id, tenant_id, pool_id, person_id, member_role, status,
            is_substitute, agency_jurisdiction_id)
         values ($1,$2,$3,$4,'autoridade','ATIVO',false,$5)`,
        [
          DECIDE_AUTHORITY_MEMBER,
          RAIT_TENANT,
          DECIDE_POOL,
          RAIT_AUTHORITY,
          DECIDE_JURISDICTION,
        ],
      );
      await this.owner.query(
        `insert into inf.rait_schedule
           (id, tenant_id, pool_id, member_id, kind, period_start, period_end,
            availability, published_at, published_by)
         values ($1,$2,$3,$4,'escala_assinatura',$6::date,$6::date + 1,
                 'DISPONIVEL','2026-09-15T12:00:00Z',$5)`,
        [
          DECIDE_AUTHORITY_SCHEDULE,
          RAIT_TENANT,
          DECIDE_POOL,
          DECIDE_AUTHORITY_MEMBER,
          RAIT_SECRETARY,
          OPERATION_DAY,
        ],
      );
      await this.owner.query(
        `insert into inf.rait_schedule_slot
           (id, tenant_id, schedule_id, slot_on, availability)
         values ($1,$3,$4,$5::date,'DISPONIVEL'),
                ($2,$3,$4,$5::date + 1,'DISPONIVEL')`,
        [
          DECIDE_AUTHORITY_SLOT,
          DECIDE_AUTHORITY_SLOT_UTC,
          RAIT_TENANT,
          DECIDE_AUTHORITY_SCHEDULE,
          OPERATION_DAY,
        ],
      );
      await this.owner.query(
        `update inf.rait_case set agency_jurisdiction_id = $3
          where tenant_id = $1 and id = $2`,
        [RAIT_TENANT, RAIT_CASE('09'), DECIDE_JURISDICTION],
      );
      await this.owner.query(
        `insert into inf.rait_deadline
           (id, tenant_id, case_id, timer_code, start_basis, started_on,
            raw_due_on, due_on, business_days, legal_basis)
         values ('71000000-0000-7000-8000-000000000010', $1, $2,
                 'T-DEC', 'fixture-c3', '2026-09-01', '2026-12-31',
                 '2026-12-31', false, 'CTG-0001 §10.5')
         on conflict (tenant_id, case_id, timer_code) do update
           set started_on = excluded.started_on,
               raw_due_on = excluded.raw_due_on,
               due_on = excluded.due_on,
               satisfied_at = null`,
        [RAIT_TENANT, RAIT_CASE('09')],
      );
    }
    if (command === 'withdraw') {
      await this.owner.query(
        `update inf.rait_party set representation_verified = true
          where tenant_id = $1 and case_id = $2 and role = 'requerente'`,
        [RAIT_TENANT, RAIT_CASE('07')],
      );
    }
    if (command === 'resolve-pending') {
      await this.owner.query(
        `update inf.rait_case set state = 'TRIAGEM_ADMISSIBILIDADE', version = 1,
                                  pending_completion = true
          where tenant_id = $1 and id = $2`,
        [RAIT_TENANT, RAIT_CASE('01')],
      );
      await this.owner.query(
        `update inf.rait_pending_content
            set closed_at = null, outcome = null, due_on = '2026-12-31'
          where tenant_id = $1
            and id = '00000000-0000-7000-8000-000036000001'`,
        [RAIT_TENANT],
      );
    }
    if (command === 'claim-next') {
      const claimSlots = [
        [CLAIM_ACTOR_SLOT, OPERATION_DAY],
        ...(UTC_OPERATION_DAY === OPERATION_DAY
          ? []
          : [[CLAIM_ACTOR_SLOT_UTC, UTC_OPERATION_DAY]]),
      ];
      for (const [slotId, slotOn] of claimSlots)
        await this.owner.query(
          `insert into inf.rait_schedule_slot
             (id, tenant_id, schedule_id, slot_on, availability)
           values ($1,$2,'00000000-0000-7000-8000-000027000001',
                   $3::date,'DISPONIVEL')
           on conflict (tenant_id, schedule_id, slot_on) do update
             set availability = excluded.availability`,
          [slotId, RAIT_TENANT, slotOn],
        );
      await this.owner.query(
        `update inf.rait_assignment
            set active = false, released_at = '2026-09-15T12:00:00Z',
                release_reason = 'rebalanceamento'
          where tenant_id = $1
            and member_id = '00000000-0000-7000-8000-000021000001'`,
        [RAIT_TENANT],
      );
      await this.owner.query(
        `update inf.rait_schedule
            set period_start = $3::date, period_end = $3::date + 1,
                wip_limit = 2, availability = 'DISPONIVEL'
          where tenant_id = $1 and id = $2`,
        [RAIT_TENANT, '00000000-0000-7000-8000-000027000001', OPERATION_DAY],
      );
    }
  }

  async clearEvidence(): Promise<void> {
    await this.owner.query("select set_config('app.tenant_id', $1, false)", [
      RAIT_TENANT,
    ]);
    await this.owner.query(
      `delete from ops.evidence_link
        where id::text like '70000000-%'
           or evidence_id::text like '70000000-%'`,
    );
    await this.owner.query(
      `delete from ops.evidence_evidence where id::text like '70000000-%'`,
    );
    await this.owner.query("select set_config('app.tenant_id', $1, false)", [
      RAIT_OTHER_TENANT,
    ]);
    await this.owner.query(
      `delete from ops.evidence_evidence where id::text like '70000000-%'`,
    );
    await this.owner.query("select set_config('app.tenant_id', $1, false)", [
      RAIT_TENANT,
    ]);
  }

  async evidenceScenario(scenario: EvidenceScenario): Promise<void> {
    await this.clearEvidence();
    if (scenario === 'empty') return;
    const n = scenarioNumber[scenario];
    const rows =
      scenario === 'mandatory-all-valid' ||
      scenario === 'valid-plus-invalid-mandatory'
        ? 2
        : 1;
    for (let index = 1; index <= rows; index += 1) {
      const suffix = `${n}${index}`.padStart(4, '0');
      const evidenceId = `70000000-0000-7000-8000-00000000${suffix}`;
      const linkId = `70000000-0000-7000-8000-00000001${suffix}`;
      const crossTenant = scenario === 'mandatory-cross-tenant';
      const invalid =
        scenario === 'mandatory-invalid' ||
        (scenario === 'valid-plus-invalid-mandatory' && index === 2) ||
        scenario === 'invalid-optional';
      const mandatory = ![
        'valid-optional',
        'invalid-optional',
        'packaged-valid',
        'wrong-entity',
        'blank-storage',
      ].includes(scenario);
      if (crossTenant) {
        await this.owner.query(
          "select set_config('app.tenant_id', $1, false)",
          [RAIT_OTHER_TENANT],
        );
      }
      await this.owner.query(
        `insert into ops.evidence_evidence
           (id, tenant_id, traffic_agency_id, evidence_type, origin,
            storage_uri, mime_type, size_bytes, hash_algorithm, hash_value,
            captured_at, status)
         values ($1,$2,'00000000-0000-7000-8000-0000e2000001','imagem','teat',
                 $3,'image/jpeg',128,$4,$5,'2026-09-14T12:00:00Z',$6)`,
        [
          evidenceId,
          crossTenant ? RAIT_OTHER_TENANT : RAIT_TENANT,
          scenario === 'blank-storage' ? '' : `s3://r7-c3/${suffix}`,
          scenario === 'blank-storage' ? '' : 'sha256',
          `r7-c3-${scenario}-${index}`,
          scenario === 'packaged-valid'
            ? 'packaged'
            : invalid
              ? 'uploaded'
              : 'validated',
        ],
      );
      if (crossTenant) {
        await this.owner.query(
          "select set_config('app.tenant_id', $1, false)",
          [RAIT_TENANT],
        );
      }
      await this.owner.query(
        `insert into ops.evidence_link
           (id, tenant_id, evidence_id, entity_type, entity_id, role, mandatory)
         values ($1,$2,$3,$4,$5,'registro', $6)`,
        [
          linkId,
          RAIT_TENANT,
          evidenceId,
          scenario === 'wrong-entity' ? 'inf.rait_case' : 'inf.ait_ait',
          RAIT_AIT,
          mandatory,
        ],
      );
    }
  }
}
