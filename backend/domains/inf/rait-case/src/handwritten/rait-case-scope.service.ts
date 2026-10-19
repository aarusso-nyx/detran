import { createHash } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database, type Transaction } from '@stynx-nyx/data';
import {
  DetranError,
  canonicalRoles,
  isDetranActionAllowed,
  withTenantContext,
} from '@detran/shared';
export type RaitScopePrincipal = {
  id: string;
  roles: readonly string[];
  permissions?: readonly string[];
  tenants: readonly string[];
};
export type RaitScopeRequest = {
  principal?: RaitScopePrincipal;
  headers?: Record<string, string | string[] | undefined>;
};
type Tx = Pick<Transaction, 'query'>;
type Row = Record<string, unknown>;
export type RaitReadPurpose = 'T' | 'M' | 'S' | 'O' | 'J';
const missing = (): never => {
  throw new DetranError('RAIT.TENANT_MISMATCH', {
    status: 404,
    message: 'Recurso não encontrado.',
  });
};
const invalid = (): never => {
  throw new DetranError('RAIT.VALIDATION_FAILED', {
    status: 400,
    message: 'Dados inválidos.',
  });
};
const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;
const TABLES: Record<string, string> = {
  cases: 'rait_case',
  parties: 'rait_party',
  documents: 'rait_document',
  admissibility: 'rait_admissibility',
  'pending-contents': 'rait_pending_content',
  deadlines: 'rait_deadline',
  inquiries: 'rait_inquiry',
  drafts: 'rait_draft',
  decisions: 'rait_decision',
  communications: 'rait_communication',
  events: 'rait_case_event',
  redirects: 'rait_redirect',
  assignments: 'rait_assignment',
  clocks: 'rait_clock',
  'clock-alerts': 'rait_clock_alert',
};
const FIELDS: Record<string, Record<string, readonly string[]>> = {
  cases: {
    S: [
      'id',
      'protocol_number',
      'instance',
      'circuit',
      'state',
      'unit_id',
      'protocolled_at',
      'version',
      'intake_channel',
      'admitted_at',
      'judge_body_received_at',
      'judge_body_received_on',
      'cetran_received_at',
      'cetran_received_on',
      'remitted_at',
      'decided_at',
      'communicated_at',
      'closed_at',
      'archived',
      'pending_completion',
      'last_movement_at',
    ],
    O: [
      'id',
      'protocol_number',
      'instance',
      'circuit',
      'state',
      'unit_id',
      'protocolled_at',
      'version',
      'last_movement_at',
      'pending_completion',
      'archived',
    ],
    M: [
      'id',
      'protocol_number',
      'instance',
      'circuit',
      'state',
      'unit_id',
      'protocolled_at',
      'version',
      'ait_id',
      'origin_case_id',
      'intake_channel',
      'admitted_at',
      'judge_body_received_at',
      'judge_body_received_on',
      'cetran_received_at',
      'cetran_received_on',
      'remitted_at',
      'decided_at',
      'communicated_at',
      'closed_at',
      'suspensive_effect',
      'archived',
      'non_admission_reason',
      'withdrawal_document_id',
      'last_movement_at',
      'pending_completion',
      'legal_priority',
      'agency_jurisdiction_id',
    ],
    J: [
      'id',
      'protocol_number',
      'instance',
      'circuit',
      'state',
      'unit_id',
      'protocolled_at',
      'version',
      'ait_id',
      'origin_case_id',
      'intake_channel',
      'admitted_at',
      'judge_body_received_at',
      'judge_body_received_on',
      'cetran_received_at',
      'cetran_received_on',
      'remitted_at',
      'decided_at',
      'communicated_at',
      'closed_at',
      'suspensive_effect',
      'archived',
      'non_admission_reason',
      'withdrawal_document_id',
      'last_movement_at',
      'pending_completion',
      'legal_priority',
      'agency_jurisdiction_id',
    ],
    T: [
      'id',
      'protocol_number',
      'instance',
      'state',
      'protocolled_at',
      'version',
      'suspensive_effect',
      'unit_id',
    ],
  },
  parties: {
    S: [
      'id',
      'case_id',
      'role',
      'representation_kind',
      'representation_verified',
    ],
    M: [
      'id',
      'case_id',
      'role',
      'legitimacy_basis',
      'person_name',
      'document_number',
      'representation_kind',
      'representation_verified',
      'representation_document_id',
    ],
    J: [
      'id',
      'case_id',
      'role',
      'legitimacy_basis',
      'person_name',
      'document_number',
      'representation_kind',
      'representation_verified',
      'representation_document_id',
    ],
    T: [
      'id',
      'case_id',
      'role',
      'person_name',
      'legitimacy_basis',
      'representation_kind',
      'representation_verified',
      'representation_document_id',
    ],
  },
  documents: {
    S: ['id', 'case_id', 'kind', 'origin', 'attached_at'],
    M: [
      'id',
      'case_id',
      'kind',
      'origin',
      'content_hash',
      'digitised_from_paper',
      'attached_at',
    ],
    J: [
      'id',
      'case_id',
      'kind',
      'origin',
      'content_hash',
      'digitised_from_paper',
      'attached_at',
    ],
    T: ['id', 'case_id', 'kind', 'origin', 'attached_at'],
  },
  admissibility: {
    S: ['id', 'case_id', 'criterion', 'verdict', 'evaluated_at'],
    M: [
      'id',
      'case_id',
      'criterion',
      'verdict',
      'reason',
      'evaluated_at',
      'evaluated_by',
    ],
    J: [
      'id',
      'case_id',
      'criterion',
      'verdict',
      'reason',
      'evaluated_at',
      'evaluated_by',
    ],
    T: ['id', 'case_id', 'criterion', 'verdict', 'reason', 'evaluated_at'],
  },
  'pending-contents': {
    S: ['id', 'case_id', 'due_on', 'opened_at', 'closed_at', 'outcome'],
    O: ['id', 'case_id', 'due_on', 'opened_at', 'closed_at', 'outcome'],
    M: [
      'id',
      'case_id',
      'due_on',
      'opened_at',
      'opened_by',
      'closed_at',
      'outcome',
    ],
    J: [
      'id',
      'case_id',
      'due_on',
      'opened_at',
      'opened_by',
      'closed_at',
      'outcome',
    ],
    T: ['id', 'case_id', 'due_on', 'opened_at', 'closed_at', 'outcome'],
  },
  deadlines: {
    S: [
      'id',
      'case_id',
      'timer_code',
      'start_basis',
      'started_on',
      'raw_due_on',
      'due_on',
      'business_days',
      'extension_count',
      'satisfied_at',
      'legal_basis',
    ],
    O: [
      'id',
      'case_id',
      'timer_code',
      'start_basis',
      'started_on',
      'raw_due_on',
      'due_on',
      'business_days',
      'extension_count',
      'satisfied_at',
      'legal_basis',
    ],
    M: [
      'id',
      'case_id',
      'timer_code',
      'start_basis',
      'started_on',
      'raw_due_on',
      'due_on',
      'business_days',
      'extension_count',
      'satisfied_at',
      'legal_basis',
      'suspended_by_act_id',
    ],
    J: [
      'id',
      'case_id',
      'timer_code',
      'start_basis',
      'started_on',
      'raw_due_on',
      'due_on',
      'business_days',
      'extension_count',
      'satisfied_at',
      'legal_basis',
      'suspended_by_act_id',
    ],
    T: [
      'id',
      'case_id',
      'timer_code',
      'start_basis',
      'started_on',
      'raw_due_on',
      'due_on',
      'business_days',
      'extension_count',
      'legal_basis',
    ],
  },
  inquiries: {
    S: [
      'id',
      'case_id',
      'requested_at',
      'due_on',
      'extension_count',
      'answered_at',
      'answered_on',
      'outcome',
    ],
    O: [
      'id',
      'case_id',
      'requested_at',
      'due_on',
      'extension_count',
      'answered_at',
      'answered_on',
      'outcome',
    ],
    M: [
      'id',
      'case_id',
      'addressee',
      'subject',
      'requested_at',
      'requested_by',
      'due_on',
      'extension_count',
      'answered_at',
      'answered_on',
      'outcome',
    ],
    J: [
      'id',
      'case_id',
      'addressee',
      'subject',
      'requested_at',
      'requested_by',
      'due_on',
      'extension_count',
      'answered_at',
      'answered_on',
      'outcome',
    ],
  },
  drafts: {
    S: [
      'id',
      'case_id',
      'version',
      'status',
      'submitted_at',
      'returned_at',
      'return_count',
    ],
    O: [
      'id',
      'case_id',
      'version',
      'status',
      'submitted_at',
      'returned_at',
      'return_count',
    ],
    M: [
      'id',
      'case_id',
      'version',
      'author_id',
      'document_id',
      'content_hash',
      'status',
      'submitted_at',
      'returned_at',
      'return_guidance',
      'return_count',
    ],
    J: [
      'id',
      'case_id',
      'version',
      'author_id',
      'document_id',
      'content_hash',
      'status',
      'submitted_at',
      'returned_at',
      'return_guidance',
      'return_count',
    ],
  },
  decisions: {
    S: [
      'id',
      'case_id',
      'circuit',
      'decision_kind',
      'decided_at',
      'published_at',
    ],
    O: [
      'id',
      'case_id',
      'circuit',
      'decision_kind',
      'decided_at',
      'published_at',
    ],
    M: [
      'id',
      'case_id',
      'circuit',
      'decision_kind',
      'decided_by',
      'decided_at',
      'session_id',
      'signature_kind',
      'signature_ref',
      'published_at',
    ],
    J: [
      'id',
      'case_id',
      'circuit',
      'decision_kind',
      'decided_by',
      'decided_at',
      'session_id',
      'signature_kind',
      'signature_ref',
      'published_at',
    ],
  },
  communications: {
    S: [
      'id',
      'case_id',
      'decision_id',
      'channel',
      'sent_at',
      'effective_on',
      'next_deadline_on',
      'authority_appeal_notice',
    ],
    O: [
      'id',
      'case_id',
      'channel',
      'sent_at',
      'effective_on',
      'next_deadline_on',
    ],
    M: [
      'id',
      'case_id',
      'decision_id',
      'channel',
      'sent_at',
      'effective_on',
      'next_deadline_on',
      'authority_appeal_notice',
    ],
    J: [
      'id',
      'case_id',
      'decision_id',
      'channel',
      'sent_at',
      'effective_on',
      'next_deadline_on',
      'authority_appeal_notice',
    ],
  },
  events: {
    S: ['id', 'case_id', 'event_type', 'from_state', 'to_state', 'occurred_at'],
    O: ['id', 'case_id', 'event_type', 'from_state', 'to_state', 'occurred_at'],
    M: [
      'id',
      'case_id',
      'event_type',
      'from_state',
      'to_state',
      'occurred_at',
      'actor_id',
    ],
    J: [
      'id',
      'case_id',
      'event_type',
      'from_state',
      'to_state',
      'occurred_at',
      'actor_id',
    ],
  },
  redirects: {
    S: [
      'id',
      'case_id',
      'direction',
      'protocol_number',
      'counterpart_agency',
      'origin_protocolled_on',
      'deadline_restored',
      'redirected_at',
    ],
    O: [
      'id',
      'case_id',
      'direction',
      'protocol_number',
      'deadline_restored',
      'redirected_at',
    ],
    M: [
      'id',
      'case_id',
      'direction',
      'reason',
      'protocol_number',
      'ait_number',
      'counterpart_agency',
      'counterpart_renainf_code',
      'origin_protocolled_on',
      'deadline_restored',
      'receipt_document_id',
      'redirected_at',
      'redirected_by',
    ],
    J: [
      'id',
      'case_id',
      'direction',
      'reason',
      'protocol_number',
      'ait_number',
      'counterpart_agency',
      'counterpart_renainf_code',
      'origin_protocolled_on',
      'deadline_restored',
      'receipt_document_id',
      'redirected_at',
      'redirected_by',
    ],
    T: [
      'id',
      'case_id',
      'direction',
      'protocol_number',
      'counterpart_agency',
      'origin_protocolled_on',
      'deadline_restored',
      'redirected_at',
    ],
  },
  assignments: {
    S: [
      'id',
      'case_id',
      'pool_id',
      'member_id',
      'assigned_at',
      'released_at',
      'active',
      'claim_due_at',
      'batch_id',
    ],
    O: [
      'id',
      'case_id',
      'pool_id',
      'member_id',
      'assigned_at',
      'released_at',
      'active',
      'claim_due_at',
      'batch_id',
    ],
    M: [
      'id',
      'case_id',
      'pool_id',
      'member_id',
      'assigned_at',
      'released_at',
      'active',
      'claim_due_at',
      'batch_id',
      'assigned_by',
      'release_reason',
    ],
    J: [
      'id',
      'case_id',
      'pool_id',
      'member_id',
      'assigned_at',
      'released_at',
      'active',
      'claim_due_at',
      'batch_id',
      'assigned_by',
      'release_reason',
    ],
  },
  clocks: {
    S: [
      'id',
      'case_id',
      'clock_code',
      'started_on',
      'ceiling_on',
      'flag',
      'flag_changed_at',
      'last_reset_at',
      'legal_basis',
    ],
    O: [
      'id',
      'case_id',
      'clock_code',
      'started_on',
      'ceiling_on',
      'flag',
      'flag_changed_at',
      'last_reset_at',
      'legal_basis',
    ],
    M: [
      'id',
      'case_id',
      'clock_code',
      'started_on',
      'ceiling_on',
      'flag',
      'flag_changed_at',
      'last_reset_at',
      'legal_basis',
    ],
    J: [
      'id',
      'case_id',
      'clock_code',
      'started_on',
      'ceiling_on',
      'flag',
      'flag_changed_at',
      'last_reset_at',
      'legal_basis',
    ],
  },
  'clock-alerts': {
    S: [
      'id',
      'clock_id',
      'level',
      'raised_at',
      'acknowledged_at',
      'incident_ref',
    ],
    O: [
      'id',
      'clock_id',
      'level',
      'raised_at',
      'acknowledged_at',
      'incident_ref',
    ],
    M: [
      'id',
      'clock_id',
      'level',
      'raised_at',
      'acknowledged_at',
      'incident_ref',
      'notified_role',
      'acknowledged_by',
    ],
    J: [
      'id',
      'clock_id',
      'level',
      'raised_at',
      'acknowledged_at',
      'incident_ref',
      'notified_role',
      'acknowledged_by',
    ],
  },
  'batch-items': {
    S: ['id', 'case_id', 'batch_id', 'member_id'],
    O: ['id', 'case_id', 'batch_id', 'member_id'],
    M: ['id', 'case_id', 'batch_id', 'member_id'],
    J: ['id', 'case_id', 'batch_id', 'member_id'],
  },
  impediments: { J: [] },
};
@Injectable()
export class RaitCaseScopeService {
  constructor(
    private readonly database: Database,
    private readonly context: RequestContext,
  ) {}
  transaction<T>(work: (tx: Transaction) => Promise<T>): Promise<T> {
    return withTenantContext(this.database, this.context, work);
  }
  identity(principal: RaitScopePrincipal | undefined) {
    const c = this.context.snapshot();
    if (
      !c.tenantId ||
      !principal ||
      principal.id !== c.actorId ||
      !principal.tenants.includes(c.tenantId) ||
      !UUID.test(principal.id)
    )
      return missing();
    return {
      tenantId: c.tenantId!,
      actorId: c.actorId!,
      roles: canonicalRoles([...principal.roles]),
    };
  }
  /** Complete role-purpose branches: role/action and scope are never borrowed across branches. */
  purposeSql(
    alias: string,
    principal: RaitScopePrincipal,
    resource: string,
    action = 'read',
  ): string {
    const c = alias;
    const localDay = `(current_timestamp at time zone (select timezone from auth.tenants where id=${c}.tenant_id))::date`;
    const has = (role: string) =>
      principal.roles.some((r) =>
        canonicalRoles([r]).includes(role as never),
      ) &&
      isDetranActionAllowed(
        { roles: [role], permissions: [] },
        `inf:${resource}`,
        action,
      );
    const member = (role: string, extra = '') =>
      `exists(select 1 from inf.rait_pool_member pm join inf.rait_pool p on p.tenant_id=pm.tenant_id and p.id=pm.pool_id where pm.tenant_id=${c}.tenant_id and pm.person_id=$2 and pm.status='ATIVO' and pm.member_role='${role}' and (pm.mandate_starts_on is null or pm.mandate_starts_on<=current_date) and (pm.mandate_ends_on is null or pm.mandate_ends_on>=current_date) and p.active and p.instance=${c}.instance and p.unit_id is not distinct from ${c}.unit_id ${extra})`;
    const bound = (role: string) =>
      `exists(select 1 from inf.rait_case_read_scope rs where rs.tenant_id=${c}.tenant_id and rs.actor_id=$2 and rs.role='${role}' and rs.active and btrim(rs.authorization_ref)<>'' and (rs.unit_id=${c}.unit_id or (rs.pool_id is not null and ${this.poolCaseSql(c, 'rs.pool_id')})))`;
    const own = (role: string) =>
      member(
        role,
        `and exists(select 1 from inf.rait_assignment ass where ass.tenant_id=${c}.tenant_id and ass.case_id=${c}.id and ass.member_id=pm.id and ass.pool_id=p.id and ass.active)`,
      );
    const projectedResource = Object.entries(TABLES).find(
      ([, table]) =>
        'rait-' + table.replace('rait_', '').replaceAll('_', '-') === resource,
    )?.[0];
    const can = (purpose: RaitReadPurpose) =>
      action !== 'read' ||
      !projectedResource ||
      (Boolean(FIELDS[projectedResource]?.[purpose]) &&
        (purpose !== 'T' || projectedResource !== 'documents'));
    const noOtherAssignment = `not exists(select 1 from inf.rait_assignment ax join inf.rait_pool_member mx on mx.tenant_id=ax.tenant_id and mx.id=ax.member_id where ax.tenant_id=${c}.tenant_id and ax.case_id=${c}.id and ax.active and mx.person_id<>$2)`;
    const branches: string[] = [];
    if (has('AUDITOR'))
      branches.push(`when ${c}.archived and ${bound('AUDITOR')} then 'S'`);
    if (has('rait-analyst') && can('T'))
      branches.push(
        `when ${!((resource === 'rait-case' && ['triage', 'admit', 'reject'].includes(action)) || (resource === 'rait-admissibility' && action === 'create')) ? `${c}.state in ('PROTOCOLADO','TRIAGEM_ADMISSIBILIDADE')` : 'true'} and ${member('analista')} and (${c}.state in ('PROTOCOLADO','TRIAGEM_ADMISSIBILIDADE') or ${noOtherAssignment}) then 'T'`,
      );
    if (has('rait-analyst') && can('M'))
      branches.push(`when ${own('analista')} then 'M'`);
    if (has('rait-secretary') && can('T'))
      branches.push(
        `when ${!((resource === 'rait-case' && ['triage', 'admit', 'reject'].includes(action)) || (resource === 'rait-admissibility' && action === 'create')) ? `${c}.state in ('PROTOCOLADO','TRIAGEM_ADMISSIBILIDADE')` : 'true'} and ${member('secretaria')} and (${c}.state in ('PROTOCOLADO','TRIAGEM_ADMISSIBILIDADE') or ${noOtherAssignment}) then 'T'`,
      );
    if (has('rait-secretary') && can('S'))
      branches.push(
        `when ${bound('rait-secretary')} and ${member('secretaria')} then 'S'`,
      );
    for (const role of ['rait-coordinator', 'AUDITOR'])
      if (has(role) && can('M')) branches.push(`when ${bound(role)} then 'M'`);
    if (has('rait-manager') && can('O'))
      branches.push(`when ${bound('rait-manager')} then 'O'`);
    if (has('rait-rapporteur'))
      branches.push(
        `when ${own('relator')} then 'M'`,
        `when exists(select 1 from inf.rait_agenda_item ai join inf.rait_session se on se.tenant_id=ai.tenant_id and se.id=ai.session_id join inf.rait_pool_member pm on pm.tenant_id=ai.tenant_id and pm.id=ai.rapporteur_member_id join inf.rait_pool p on p.tenant_id=pm.tenant_id and p.id=pm.pool_id where ai.tenant_id=${c}.tenant_id and ai.case_id=${c}.id and not ai.withdrawn and pm.person_id=$2 and pm.status='ATIVO' and pm.member_role='relator' and p.active and p.unit_id is not distinct from ${c}.unit_id and p.instance=${c}.instance) then 'J'`,
      );
    if (has('rait-chair'))
      branches.push(
        `when ${bound('rait-chair')} and ${member('presidente', `and ${this.poolCaseSql(c, 'p.id')}`)} then 'J'`,
      );
    if (has('rait-central-authority'))
      branches.push(
        `when ${bound('rait-central-authority')} and ${c}.instance='jari' and exists(select 1 from inf.rait_decision d where d.tenant_id=${c}.tenant_id and d.case_id=${c}.id and d.decision_kind='provido') then 'J'`,
      );
    if (has('rait-signing-authority'))
      branches.push(
        `when ${c}.state='PRONTO_P_DECISAO' and ${member('autoridade', `and pm.agency_jurisdiction_id=${c}.agency_jurisdiction_id and (pm.mandate_starts_on is null or pm.mandate_starts_on<=current_date) and (pm.mandate_ends_on is null or pm.mandate_ends_on>=current_date) and exists(select 1 from inf.rait_schedule sch join inf.rait_schedule_slot sl on sl.tenant_id=sch.tenant_id and sl.schedule_id=sch.id where sch.tenant_id=pm.tenant_id and sch.member_id=pm.id and sch.pool_id=p.id and sch.kind='escala_assinatura' and sch.published_at is not null and sch.period_start<=current_date and sch.period_end>=current_date and sl.slot_on=current_date and sl.availability in ('DISPONIVEL','EM_PLANTAO'))`)} then 'J'`,
      );
    if (!branches.length)
      return '(case when $2::uuid is not null then null::text else null::text end)';
    return `(case when exists(select 1 from auth.users u join auth.memberships m on m.user_id=u.id where u.id=$2 and u.is_active and m.tenant_id=${c}.tenant_id and m.is_active) and not exists(select 1 from inf.rait_impediment i join inf.rait_pool_member im on im.tenant_id=i.tenant_id and im.id=i.member_id where i.tenant_id=${c}.tenant_id and i.case_id=${c}.id and im.person_id=$2) then (case ${branches.join(' ')} else null end) else null end)`.replaceAll(
      'current_date',
      localDay,
    );
  }
  poolCaseSql(c: string, pool: string): string {
    return `exists(select 1 from inf.rait_pool qp where qp.tenant_id=${c}.tenant_id and qp.id=${pool} and qp.active and qp.instance=${c}.instance and qp.unit_id is not distinct from ${c}.unit_id and (exists(select 1 from inf.rait_case_pool_scope cp where cp.tenant_id=${c}.tenant_id and cp.case_id=${c}.id and cp.pool_id=qp.id and cp.active and btrim(cp.authorization_ref)<>'' and btrim(cp.source_ref)<>'') or exists(select 1 from inf.rait_assignment qa where qa.tenant_id=${c}.tenant_id and qa.case_id=${c}.id and qa.pool_id=qp.id and qa.active) or exists(select 1 from inf.rait_batch_item bi join inf.rait_batch ba on ba.tenant_id=bi.tenant_id and ba.id=bi.batch_id where bi.tenant_id=${c}.tenant_id and bi.case_id=${c}.id and ba.pool_id=qp.id and ba.state='LOTE_ACEITO')))`;
  }
  async assertCase(
    tx: Tx,
    id: string,
    principal: RaitScopePrincipal | undefined,
    action = 'read',
    resource = 'rait-case',
    lock = false,
  ) {
    const identity = this.identity(principal);
    if (!UUID.test(id)) return missing();
    if (lock) {
      const locked = await tx.query(
        'select id from inf.rait_case where tenant_id=$1 and id=$2 for update',
        [identity.tenantId, id],
      );
      if (!locked.rows[0]) return missing();
    }
    if (lock) {
      await tx.query(
        'select id from auth.memberships where tenant_id=$1 and user_id=$2 for share',
        [identity.tenantId, identity.actorId],
      );
      await tx.query(
        'select id from inf.rait_pool_member where tenant_id=$1 and person_id=$2 order by id for share',
        [identity.tenantId, identity.actorId],
      );
      await tx.query(
        'select id from inf.rait_case_read_scope where tenant_id=$1 and actor_id=$2 order by id for share',
        [identity.tenantId, identity.actorId],
      );
      await tx.query(
        'select id from inf.rait_case_pool_scope where tenant_id=$1 and case_id=$2 order by id for share',
        [identity.tenantId, id],
      );
    }
    const purpose = this.purposeSql('c', principal!, resource, action);
    const result = await tx.query<Row>(
      `select c.*, ${purpose} as _purpose from inf.rait_case c where c.tenant_id=$1 and c.id=$3 and (${purpose}) is not null`,
      [identity.tenantId, identity.actorId, id],
    );
    if (!result.rows[0]) return missing();
    return result.rows[0];
  }
  async read(
    resource: string,
    id: string | undefined,
    query: Record<string, unknown>,
    principal: RaitScopePrincipal | undefined,
  ) {
    const identity = this.identity(principal);
    const table = TABLES[resource];
    if (!table) return missing();
    const policyResource =
      resource === 'events'
        ? 'rait-case-event'
        : `rait-${table.replace('rait_', '').replaceAll('_', '-')}`;
    return this.transaction(async (tx) => {
      const purpose = this.purposeSql('c', principal!, policyResource);
      const join =
        resource === 'cases'
          ? ''
          : resource === 'clock-alerts'
            ? 'join inf.rait_clock cl on cl.tenant_id=r.tenant_id and cl.id=r.clock_id join inf.rait_case c on c.tenant_id=cl.tenant_id and c.id=cl.case_id'
            : 'join inf.rait_case c on c.tenant_id=r.tenant_id and c.id=r.case_id';
      const alias = resource === 'cases' ? 'c' : 'r';
      const values: unknown[] = [identity.tenantId, identity.actorId];
      let where = `${alias}.tenant_id=$1 and (${purpose}) is not null`;
      const available = Object.keys(FIELDS[resource] ?? {});
      const permitted = available.map((p) => `'${p}'`).join(',');
      where += permitted ? ` and (${purpose}) in (${permitted})` : ' and false';
      if (resource === 'documents') where += ` and (${purpose})<>'T'`;
      if (resource === 'parties')
        where += ` and ((${purpose})<>'T' or r.role in ('requerente','procurador'))`;
      if (['parties', 'documents'].includes(resource))
        where += ` and not ((${purpose})='S' and c.archived)`;
      if (resource === 'deadlines')
        where += ` and ((${purpose})<>'T' or r.timer_code=case c.instance when 'defesa_previa' then 'T-DEF' when 'jari' then 'T-NP-VENC' when 'cetran' then 'T-R2' end)`;
      if (id) {
        if (!UUID.test(id)) return missing();
        values.push(id);
        where += ` and ${alias}.id=$${values.length}`;
      }
      if (query.case_id) {
        if (!UUID.test(String(query.case_id))) return missing();
        values.push(query.case_id);
        where += ` and c.id=$${values.length}`;
      }
      if (resource === 'assignments')
        where += ` and exists(select 1 from inf.rait_pool p join inf.rait_pool_member pm on pm.tenant_id=p.tenant_id and pm.pool_id=p.id and pm.id=r.member_id where p.tenant_id=c.tenant_id and p.id=r.pool_id and p.instance=c.instance and p.unit_id is not distinct from c.unit_id)`;
      if (query.pool_id) {
        if (!UUID.test(String(query.pool_id))) return missing();
        values.push(query.pool_id);
        where += ` and ${this.poolCaseSql('c', '$' + values.length)}`;
        if (resource === 'assignments')
          where += ` and r.pool_id=$${values.length}`;
      }
      const limit = Math.min(500, Math.max(1, Number(query.limit) || 500));
      const offset = Math.max(0, Number(query.offset) || 0);
      values.push(limit, offset);
      const result = await tx.query<Row>(
        `select ${alias}.*, row_to_json(c) as _case, ${purpose} as _purpose from inf.${table} ${alias} ${join} where ${where} order by ${alias}.id limit $${values.length - 1} offset $${values.length}`,
        values,
      );
      const out: Row[] = [];
      for (const row of result.rows) {
        const projected = await this.project(
          tx,
          resource,
          row,
          row._purpose as RaitReadPurpose,
          identity,
        );
        if (projected) out.push(projected);
      }
      if (id && !out[0]) return missing();
      return id ? out[0] : out;
    });
  }
  async project(
    tx: Tx,
    resource: string,
    row: Row,
    purpose: RaitReadPurpose,
    identity: { tenantId: string; actorId: string },
  ): Promise<Row | null> {
    let fields = FIELDS[resource]?.[purpose];
    if (!fields) return null;
    if (purpose === 'T') {
      if (
        resource === 'parties' &&
        !['requerente', 'procurador'].includes(String(row.role))
      )
        return null;
      if (resource === 'documents') return null; // No authoritative intake-class verifier is activated by S1.
      if (resource === 'deadlines') {
        const c = row._case as Row;
        const timer = {
          defesa_previa: 'T-DEF',
          jari: 'T-NP-VENC',
          cetran: 'T-R2',
        }[String(c.instance)];
        if (row.timer_code !== timer) return null;
      }
    }
    if (
      purpose === 'S' &&
      (row._case as Row)?.archived &&
      ['parties', 'documents'].includes(resource)
    )
      return null;
    const result: Row = {};
    for (const field of fields)
      if (Object.hasOwn(row, field)) result[field] = row[field];
    // Related references never become a route around their parent.
    for (const [field, table] of Object.entries({
      representation_document_id: 'rait_document',
      withdrawal_document_id: 'rait_document',
      receipt_document_id: 'rait_document',
      document_id: 'rait_document',
      decision_id: 'rait_decision',
    }))
      if (result[field]) {
        const ref = await tx.query(
          `select id from inf.${table} where tenant_id=$1 and id=$2 and case_id=$3`,
          [
            identity.tenantId,
            result[field],
            resource === 'cases' ? row.id : row.case_id,
          ],
        );
        if (!ref.rows[0]) delete result[field];
      }
    if (result.ait_id) {
      const ait = await tx.query(
        'select id from inf.ait_ait where tenant_id=$1 and id=$2',
        [identity.tenantId, result.ait_id],
      );
      if (!ait.rows[0]) delete result.ait_id;
    }
    if (result.session_id) {
      const linked = await tx.query(
        'select id from inf.rait_agenda_item where tenant_id=$1 and case_id=$2 and session_id=$3',
        [identity.tenantId, row.case_id, result.session_id],
      );
      if (!linked.rows[0]) delete result.session_id;
    }
    if (result.batch_id) {
      const linked = await tx.query(
        'select bi.id from inf.rait_batch_item bi join inf.rait_batch ba on ba.tenant_id=bi.tenant_id and ba.id=bi.batch_id where bi.tenant_id=$1 and bi.case_id=$2 and bi.batch_id=$3 and ba.pool_id=$4',
        [identity.tenantId, row.case_id, result.batch_id, row.pool_id],
      );
      if (!linked.rows[0]) delete result.batch_id;
    }
    // No accepted S1 provider qualifies a related suspension act or organization incident.
    delete result.suspended_by_act_id;
    delete result.incident_ref;
    if (purpose === 'T') delete result.representation_document_id;
    if (result.origin_case_id) delete result.origin_case_id;
    return result;
  }
  async organizational(
    resource: string,
    table: string,
    id: string | undefined,
    query: Record<string, unknown>,
    principal: RaitScopePrincipal | undefined,
  ) {
    const identity = this.identity(principal);
    const allowed = [
      'rait_pool',
      'rait_pool_member',
      'rait_unit',
      'rait_schedule',
      'rait_schedule_slot',
      'rait_substitute_duty',
      'rait_bench',
      'rait_batch',
      'rait_batch_item',
      'rait_impediment',
    ];
    if (!allowed.includes(table)) return missing();
    const policyResource =
      'rait-' + table.replace('rait_', '').replaceAll('_', '-');
    if (
      !isDetranActionAllowed(
        {
          roles: [...principal!.roles],
          permissions: [...(principal!.permissions ?? [])],
        },
        'inf:' + policyResource,
        'read',
      )
    )
      return missing();
    return this.transaction(async (tx) => {
      const values: unknown[] = [identity.tenantId, identity.actorId];
      let join = '';
      let where = 'r.tenant_id=$1';
      if (resource === 'batch-items' || resource === 'impediments') {
        join =
          'join inf.rait_case c on c.tenant_id=r.tenant_id and c.id=r.case_id';
        where += ` and (${this.purposeSql('c', principal!, policyResource)}) is not null`;
        if (resource === 'impediments')
          where += ` and exists(select 1 from inf.rait_pool_member pm where pm.tenant_id=r.tenant_id and pm.id=r.member_id and pm.person_id=$2 and pm.status='ATIVO')`;
        if (resource === 'batch-items') {
          join +=
            ' join inf.rait_batch ba on ba.tenant_id=r.tenant_id and ba.id=r.batch_id';
          where += ` and ${this.poolCaseSql('c', 'ba.pool_id')}`;
        }
      } else if (resource === 'batches') {
        where += ` and exists(select 1 from inf.rait_batch_item bi join inf.rait_case c on c.tenant_id=bi.tenant_id and c.id=bi.case_id where bi.tenant_id=r.tenant_id and bi.batch_id=r.id and (${this.purposeSql('c', principal!, policyResource)}) is not null and ${this.poolCaseSql('c', 'r.pool_id')})`;
      }
      if (id) {
        if (!UUID.test(id)) return missing();
        values.push(id);
        where += ` and r.id=$${values.length}`;
      }
      if (query.case_id) {
        values.push(query.case_id);
        where += ` and r.case_id=$${values.length}`;
      }
      if (query.pool_id) {
        if (!UUID.test(String(query.pool_id))) return missing();
        values.push(query.pool_id);
        const parameter = '$' + values.length;
        if (resource === 'pools') where += ` and r.id=${parameter}`;
        else if (['pool-members', 'schedules', 'batches'].includes(resource))
          where += ` and r.pool_id=${parameter}`;
        else if (resource === 'units')
          where += ` and exists(select 1 from inf.rait_pool p where p.tenant_id=r.tenant_id and p.unit_id=r.id and p.id=${parameter})`;
        else if (resource === 'schedule-slots')
          where += ` and exists(select 1 from inf.rait_schedule sch where sch.tenant_id=r.tenant_id and sch.id=r.schedule_id and sch.pool_id=${parameter})`;
        else if (['impediments', 'substitute-duties'].includes(resource))
          where += ` and exists(select 1 from inf.rait_pool_member pm where pm.tenant_id=r.tenant_id and pm.id=r.member_id and pm.pool_id=${parameter})`;
        else if (resource === 'batch-items')
          where += ` and ba.pool_id=${parameter}`;
        else if (resource === 'benches')
          where += ` and exists(select 1 from inf.rait_session se join inf.rait_pool_member pm on pm.tenant_id=se.tenant_id and pm.id=se.chair_member_id where se.tenant_id=r.tenant_id and se.id=r.session_id and pm.pool_id=${parameter})`;
      }
      const rows = (
        await tx.query<Row>(
          `select r.* from inf.${table} r ${join} where ${where} and exists(select 1 from auth.users u join auth.memberships m on m.user_id=u.id where u.id=$2 and u.is_active and m.tenant_id=r.tenant_id and m.is_active) order by r.id limit 500`,
          values,
        )
      ).rows;
      const result = rows.map((row) => {
        const out: Row = {};
        for (const [k, v] of Object.entries(row))
          if (
            k !== 'tenant_id' &&
            !['snapshot', 'payload', 'grounds'].includes(k)
          )
            out[k] = v;
        return out;
      });
      if (id && !result[0]) return missing();
      return id ? result[0] : result;
    });
  }
  async authenticate(tx: Tx, principal: RaitScopePrincipal | undefined) {
    const c = this.identity(principal);
    const active = await tx.query(
      'select u.id from auth.users u join auth.memberships m on m.user_id=u.id where u.id=$2 and u.is_active and m.tenant_id=$1 and m.is_active',
      [c.tenantId, c.actorId],
    );
    if (!active.rows[0]) return missing();
    return c;
  }
  async command(
    tx: Tx,
    principal: RaitScopePrincipal | undefined,
    command: string,
    targetId: string,
    payload: Row,
  ) {
    const c = await this.authenticate(tx, principal);
    if (command === 'claim-next') {
      const result = await tx.query(
        "select pm.id from inf.rait_pool_member pm join inf.rait_pool p on p.tenant_id=pm.tenant_id and p.id=pm.pool_id where pm.tenant_id=$1 and pm.person_id=$2 and pm.pool_id=$3 and pm.member_role='analista' and pm.status='ATIVO' and p.active",
        [c.tenantId, c.actorId, targetId],
      );
      if (!principal!.roles.includes('rait-analyst') || !result.rows[0])
        return missing();
      return;
    }
    const map: Record<string, [string, string]> = {
      triage: ['rait-case', 'triage'],
      'save-admissibility': ['rait-admissibility', 'create'],
      admit: ['rait-case', 'admit'],
      'non-admission': ['rait-case', 'reject'],
      remit: ['rait-case', 'remit-jari'],
      receive: ['rait-case', 'receive-judging-body'],
      ready: ['rait-case', 'submit-draft'],
      decide: ['rait-decision', 'sign'],
      'return-draft': ['rait-decision', 'return-draft'],
      withdraw: ['rait-case', 'withdraw'],
      redirect: ['rait-case', 'redirect'],
      'resolve-pending': ['rait-case', 'resolve-pending-content'],
    };
    if (map[command]) {
      const [resource, action] = map[command]!;
      await this.assertCase(tx, targetId, principal, action, resource, true);
      for (const [key, table] of Object.entries({
        draftId: 'rait_draft',
        pendingId: 'rait_pending_content',
        receiptDocumentId: 'rait_document',
        withdrawalDocumentId: 'rait_document',
      }))
        if (payload[key]) {
          const child = await tx.query(
            `select id from inf.${table} where tenant_id=$1 and id=$2 and case_id=$3`,
            [c.tenantId, payload[key], targetId],
          );
          if (!child.rows[0]) return missing();
        }
    }
  }
  async mutate(
    resource: string,
    id: string | undefined,
    body: Row,
    principal: RaitScopePrincipal | undefined,
    remove = false,
    key?: string | string[],
  ) {
    const identity = this.identity(principal);
    const table = TABLES[resource];
    if (!table || remove) return missing();
    const policyResource = `rait-${table.replace('rait_', '').replaceAll('_', '-')}`;
    const action = remove ? 'delete' : id ? 'update' : 'create';
    return this.transaction(async (tx) => {
      let source: Row | undefined;
      if (id) {
        const r = await tx.query<Row>(
          `select * from inf.${table} where tenant_id=$1 and id=$2 for update`,
          [identity.tenantId, id],
        );
        source = r.rows[0];
        if (!source) return missing();
        await this.assertCase(
          tx,
          String(source.case_id),
          principal,
          action,
          policyResource,
          true,
        );
      }
      const caseId = body.case_id ?? source?.case_id;
      if (!caseId) return invalid();
      await this.assertCase(
        tx,
        String(caseId),
        principal,
        action,
        policyResource,
        true,
      );
      const allowed =
        resource === 'parties'
          ? [
              'case_id',
              'role',
              'legitimacy_basis',
              'person_name',
              'document_number',
              'contact_email',
              'representation_kind',
            ]
          : resource === 'documents' && id
            ? ['filename']
            : [];
      if (remove) {
        if (resource !== 'parties') return missing();
        const linked = await tx.query(
          'select id from inf.rait_party where tenant_id=$1 and id=$2 and representation_document_id is null',
          [identity.tenantId, id],
        );
        if (!linked.rows[0]) return invalid();
        await tx.query(
          'delete from inf.rait_party where tenant_id=$1 and id=$2',
          [identity.tenantId, id],
        );
        return;
      }
      if (
        !body ||
        !Object.keys(body).length ||
        Object.keys(body).some((k) => !allowed.includes(k))
      )
        return invalid();
      if (
        resource === 'parties' &&
        !id &&
        (!body.role || typeof body.person_name !== 'string')
      )
        return invalid();
      if (typeof key !== 'string' || !key.trim()) return invalid();
      const canonical = (value: unknown): unknown =>
        Array.isArray(value)
          ? value.map(canonical)
          : value && typeof value === 'object'
            ? Object.fromEntries(
                Object.entries(value)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([k, v]) => [k, canonical(v)]),
              )
            : value;
      const digest = createHash('sha256')
        .update(
          JSON.stringify({
            actor: identity.actorId,
            resource,
            id,
            body: canonical(body),
          }),
        )
        .digest('hex');
      await tx.query(
        "select pg_advisory_xact_lock(hashtextextended($1 || ':' || $2,0))",
        [identity.tenantId, key],
      );
      const prior = (
        await tx.query<{ request_fingerprint: string; response_body: Row }>(
          'select request_fingerprint,response_body from integration.idempotency_keys where tenant_id=$1 and idem_key=$2 for update',
          [identity.tenantId, key],
        )
      ).rows[0];
      if (prior) {
        if (prior.request_fingerprint !== digest)
          throw new DetranError('RAIT.IDEMPOTENCY_REPLAY', {
            status: 409,
            message: 'Conflito de repetição.',
          });
        return prior.response_body;
      }
      const entries = Object.entries(body);
      const values: unknown[] = [identity.tenantId];
      let sql: string;
      if (id) {
        values.push(id, ...entries.map((e) => e[1]));
        sql = `update inf.${table} set ${entries.map(([k], i) => `${k}=$${i + 3}`).join(',')} where tenant_id=$1 and id=$2 returning *`;
      } else {
        values.push(...entries.map((e) => e[1]));
        sql = `insert into inf.${table}(tenant_id,${entries.map((e) => e[0]).join(',')}) values(${values.map((_, i) => '$' + (i + 1)).join(',')}) returning *`;
      }
      const row = (await tx.query<Row>(sql, values)).rows[0];
      if (!row) return missing();
      const c = await this.assertCase(tx, String(row.case_id), principal);
      row._case = c;
      const response = await this.project(
        tx,
        resource,
        row,
        c._purpose as RaitReadPurpose,
        identity,
      );
      await tx.query(
        'select audit.write($1,$2,$3,$4,$5,$6,$7,null,null,null)',
        [
          identity.tenantId,
          identity.actorId,
          principal!.roles[0] ?? null,
          'INF_' + table.toUpperCase() + '_' + action.toUpperCase(),
          'inf.' + table,
          row.id,
          JSON.stringify({ operation: action }),
        ],
      );
      await tx.query(
        "insert into integration.idempotency_keys(tenant_id,idem_key,request_fingerprint,status_code,response_body,expires_at)values($1,$2,$3,200,$4,clock_timestamp()+interval '24 hours')",
        [identity.tenantId, key, digest, JSON.stringify(response)],
      );
      return response;
    });
  }
}
