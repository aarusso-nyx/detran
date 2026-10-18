// TASK-0025 Inspector. Counterfactual states use the existing R7 fixture; no new legal values.
import {
  RaitCaseCommandFixture,
  RAIT_CASE,
  RAIT_TENANT,
  RAIT_ACTOR,
  RAIT_SECRETARY,
} from './rait-case-command.fixture.js';
export {
  assertDedicatedDatabaseEnvironment,
  RAIT_TENANT,
  RAIT_ACTOR,
  RAIT_SECRETARY,
} from './rait-case-command.fixture.js';
export const JW_CASE = RAIT_CASE('02');
export const OTHER_TENANT = '00000000-0000-7000-8000-00000000a002';
// Ephemeral test record identity, never a product/persona fact.
export const FOREIGN_CASE = '71000000-0000-7000-8000-000000000071';
export const HUMAN_CRITERIA = [
  'legitimidade',
  'assinatura',
  'pedido_compativel',
] as const;
export class Jw01AdmissibilityFixture extends RaitCaseCommandFixture {
  async prepare(): Promise<void> {
    await this.prepareAdmitBinding(JW_CASE);
    // Own deterministic request keys only: keep append-only audit history intact.
    await this.owner.query(
      "delete from integration.outbox where tenant_id=$1 and idempotency_key like 'r25-jw01-%'",
      [RAIT_TENANT],
    );
    await this.owner.query(
      "delete from integration.idempotency_keys where tenant_id=$1 and idem_key like 'r25-jw01-%'",
      [RAIT_TENANT],
    );
    await this.owner.query(
      'delete from inf.rait_admissibility where tenant_id=$1 and case_id=$2',
      [RAIT_TENANT, JW_CASE],
    );
    await this.owner.query(
      "update inf.rait_case set state='PROTOCOLADO', version=1 where tenant_id=$1 and id=$2",
      [RAIT_TENANT, JW_CASE],
    );
  }
  async prepareForeign(): Promise<void> {
    // Architect-approved counterfactual RLS fixture only: not a tenant-B qualification proof.
    // Source canonical policy/timezone/time; zero-proof none is the DDL initial function branch.
    // AIT/policy/actor remain source-A references: this tests lookup RLS, never B qualification.
    await this.owner.query('begin');
    try {
      await this.owner.query("select set_config('app.tenant_id',$1,true)", [
        OTHER_TENANT,
      ]);
      // Tenant identity is a test label; timezone comes from the canonical tenant.
      await this.owner.query(
        `insert into auth.tenants (id,slug,name,short_name,cnpj,timezone,contact_email,contact_phone,state,is_active,suspended_reason,archived_at)
         select $1,'r25-jw01-foreign',name || ' — R25 fixture',short_name,null,timezone,contact_email,contact_phone,state,is_active,suspended_reason,archived_at
         from auth.tenants where id=$2 on conflict(id) do nothing`,
        [OTHER_TENANT, RAIT_TENANT],
      );
      const existing = await this.owner.query(
        'select id from inf.rait_case where id=$1',
        [FOREIGN_CASE],
      );
      if (existing.rowCount === 0) {
        await this.owner.query(
          `insert into inf.rait_case (id,tenant_id,ait_id,protocol_number,instance,circuit,state,intake_channel,protocolled_at)
           select $1,$2,c.ait_id,c.protocol_number,c.instance,c.circuit,c.state,c.intake_channel,c.protocolled_at
           from inf.rait_case c where c.tenant_id=$3 and c.id=$4`,
          [FOREIGN_CASE, OTHER_TENANT, RAIT_TENANT, JW_CASE],
        );
        await this.owner.query(
          `insert into inf.rait_priority_assessment
           (id,tenant_id,case_id,revision,outcome,assessed_at,assessed_by,qualification_on,timezone,policy_parameter_id,policy_version,policy_snapshot)
           select $1,$2,$3,1,'none',c.protocolled_at,$5,(c.protocolled_at at time zone t.timezone)::date,t.timezone,p.id,p.version,p.value_json
           from inf.rait_case c join auth.tenants t on t.id=$2
           join ops.parameter p on p.tenant_id=$4 and p.key='rait.priority.legal_bases'
             and p.status='vigente' and not p.source_pending and p.value_type='json'
           where c.tenant_id=$4 and c.id=$6`,
          [
            '71000000-0000-7000-8000-000000000072',
            OTHER_TENANT,
            FOREIGN_CASE,
            RAIT_TENANT,
            RAIT_SECRETARY,
            JW_CASE,
          ],
        );
        await this.owner.query('set local role role_rait_priority_writer');
        await this.owner.query(
          "update inf.rait_case set legal_priority='none' where tenant_id=$1 and id=$2",
          [OTHER_TENANT, FOREIGN_CASE],
        );
        await this.owner.query('reset role');
      }
      await this.owner.query('set constraints all immediate');
      await this.owner.query('commit');
      await this.owner.query("select set_config('app.tenant_id',$1,false)", [
        OTHER_TENANT,
      ]);
      const foreign = await this.owner.query(
        `select c.id from inf.rait_case c join inf.rait_priority_assessment a on a.case_id=c.id and a.tenant_id=c.tenant_id
         where c.tenant_id=$1 and c.id=$2 and c.legal_priority='none' and a.outcome='none' and a.revision=1
           and not exists(select from inf.rait_priority_basis b where b.assessment_id=a.id)`,
        [OTHER_TENANT, FOREIGN_CASE],
      );
      if (foreign.rowCount !== 1)
        throw new Error(
          'Committed consistent foreign-tenant fixture must exist',
        );
    } catch (error) {
      await this.owner.query('rollback');
      throw error;
    } finally {
      await this.owner.query('reset role');
      await this.owner.query("select set_config('app.tenant_id',$1,false)", [
        RAIT_TENANT,
      ]);
    }
  }
  async snapshot() {
    const caso = await this.owner.query(
      'select state,version,non_admission_reason,archived,suspensive_effect from inf.rait_case where id=$1',
      [JW_CASE],
    );
    const verdicts = await this.owner.query(
      'select criterion,verdict,reason,evaluated_by,evaluated_at from inf.rait_admissibility where tenant_id=$1 and case_id=$2 order by criterion',
      [RAIT_TENANT, JW_CASE],
    );
    const effects = await this.owner.query(
      `select
      (select count(*)::int from integration.outbox where tenant_id=$1 and idempotency_key like 'r25-jw01-%') as outbox,
      (select count(*)::int from audit.events where tenant_id=$1) as audit,
      (select count(*)::int from integration.idempotency_keys where tenant_id=$1 and idem_key like 'r25-jw01-%') as ledger`,
      [RAIT_TENANT],
    );
    return {
      caso: caso.rows[0],
      verdicts: verdicts.rows,
      effects: effects.rows[0],
    };
  }
  async cleanupForeign(): Promise<void> {
    // The deterministic counterfactual survives only in this disposable database.
    // Priority history is immutable: never delete/update its assessment for teardown.
  }
}
export const humanBody = (
  criterion: (typeof HUMAN_CRITERIA)[number],
  verdict = true,
) => ({
  case_id: JW_CASE,
  criterion,
  verdict,
  reason: 'Conferência da fixture canônica.',
});
export const expectedActor = RAIT_ACTOR;
