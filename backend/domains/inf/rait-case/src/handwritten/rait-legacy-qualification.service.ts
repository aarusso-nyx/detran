import { Inject, Injectable, Optional } from '@nestjs/common';
import { DetranError } from '@detran/shared';
import {
  RAIT_RISK_PROVENANCE_READER,
  raitQualify,
  raitSourceRows,
  type RaitRiskProvenanceReader,
  type RaitRiskTx,
} from './rait-risk.port.js';
const denied = (): never => {
  throw new DetranError('RAIT.CLAIM_LEGACY_UNVERIFIED', { status: 409 });
};
@Injectable()
export class RaitLegacyQualificationService {
  constructor(
    @Optional()
    @Inject(RAIT_RISK_PROVENANCE_READER)
    private readonly provenance?: RaitRiskProvenanceReader,
  ) {}
  async resolve(
    tx: RaitRiskTx,
    tenantId: string,
    parent: { id: string; version: number; state: string },
    poolId: string,
  ) {
    try {
      if (!this.provenance) return denied();
      const rows = (
        await tx.query<Record<string, unknown>>(
          'select id,reviewer_id,observed_version,observed_state,classification,assignment_status,admission_ref,distribution_ref,pool_scope_ref,assignment_ref,authorization_ref from inf.rait_claim_legacy_qualification where tenant_id=$1 and case_id=$2 order by observed_version desc,revision desc',
          [tenantId, parent.id],
        )
      ).rows;
      const item = rows[0];
      if (
        !item ||
        item.observed_version !== parent.version ||
        item.observed_state !== parent.state
      )
        return denied();
      if (
        !/^receipt:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(
          String(item.authorization_ref),
        )
      )
        return denied();
      const sourceTables: Record<string, string> = {
        admission_ref: 'inf.rait_case_event',
        distribution_ref: 'inf.rait_case_event',
        pool_scope_ref: 'inf.rait_case_pool_scope',
        assignment_ref: 'inf.rait_assignment',
      };
      for (const [key, table] of Object.entries(sourceTables)) {
        if (
          item[key] !== null &&
          item[key] !== undefined &&
          !String(item[key]).startsWith('sql:' + table + ':')
        )
          return denied();
      }
      const assignment = (
        await tx.query<{ id: string }>(
          'select id from inf.rait_assignment where tenant_id=$1 and case_id=$2 and active order by id for share',
          [tenantId, parent.id],
        )
      ).rows;
      const refs = [
        'sql:inf.rait_case:' + parent.id,
        'sql:inf.rait_claim_legacy_qualification:' + String(item.id),
        'sql:auth.users:' + String(item.reviewer_id),
        'sql:inf.rait_pool:' + poolId,
      ];
      for (const key of [
        'admission_ref',
        'distribution_ref',
        'pool_scope_ref',
        'assignment_ref',
      ])
        if (item[key]) refs.push(String(item[key]));
      if (
        item.classification === 'qualified_unassigned' &&
        (assignment.length || item.assignment_status !== 'unassigned')
      )
        return denied();
      if (
        item.classification === 'preserve_assigned' &&
        (!assignment.length || item.assignment_status !== 'assigned')
      )
        return denied();
      const audit = (
        await tx.query<{ event_id: string; at: string }>(
          `select event_id::text,to_char(occurred_at at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"') at from audit.events where tenant_id=$1 and entity_id=$2 and action='INF_RAIT_CASE_ADMIT' order by event_id desc limit 1`,
          [tenantId, parent.id],
        )
      ).rows[0];
      if (!audit && item.classification === 'qualified_unassigned')
        return denied();
      if (audit && item.admission_ref)
        refs.push('sql:audit.events:' + audit.event_id + '@' + audit.at);
      const sources = await raitSourceRows(tx, tenantId, refs);
      for (const source of sources) {
        if (
          [
            'inf.rait_case_event',
            'inf.rait_case_pool_scope',
            'inf.rait_assignment',
          ].includes(source.table) &&
          source.fields.case_id !== parent.id
        )
          return denied();
        if (
          source.table === 'inf.rait_case_pool_scope' &&
          (source.fields.pool_id !== poolId || source.fields.active !== true)
        )
          return denied();
      }
      const admission = sources.find((s) => s.sourceRef === item.admission_ref),
        distribution = sources.find(
          (s) => s.sourceRef === item.distribution_ref,
        );
      if (
        item.classification === 'qualified_unassigned' &&
        (!admission ||
          admission.fields.to_state !== 'ADMITIDO' ||
          !distribution ||
          distribution.fields.from_state !== 'ADMITIDO' ||
          distribution.fields.to_state !== 'DISTRIBUIDO')
      )
        return denied();
      const sourceVersions = await raitQualify(
        tx,
        this.provenance,
        'legacy',
        tenantId,
        parent.id,
        [...new Set(refs)],
      );
      return { classification: String(item.classification), sourceVersions };
    } catch {
      return denied();
    }
  }
}
