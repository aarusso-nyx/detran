import { Injectable } from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import type { Transaction } from '@stynx-nyx/data';
import { DetranError } from '@detran/shared';

/** Internal initial routing only. Existing active and revoked dispositions are immutable here. */
@Injectable()
export class RaitCasePoolScopeService {
  constructor(private readonly context: RequestContext) {}

  async resolve(
    tx: Pick<Transaction, 'query'>,
    tenantId: string,
    caseId: string,
    authorizationRef: string,
  ) {
    const context = this.context.snapshot();
    if (
      !this.context.hasActiveContext() ||
      context.tenantId !== tenantId ||
      !context.actorId ||
      !authorizationRef.trim()
    ) {
      throw new DetranError('RAIT.TENANT_MISMATCH', {
        status: 404,
        message: 'Recurso não encontrado.',
      });
    }
    const parent = (
      await tx.query<{ id: string; version: number }>(
        'select id,version from inf.rait_case where tenant_id=$1 and id=$2 for update',
        [tenantId, caseId],
      )
    ).rows[0];
    if (!parent) return;
    const existing = await tx.query(
      'select id from inf.rait_case_pool_scope where tenant_id=$1 and case_id=$2 order by id for update',
      [tenantId, caseId],
    );
    // Revocation and provisioning belong to their authorized operational writer, never legal intake.
    if (existing.rows.length) return;
    const candidates = await tx.query<{ id: string }>(
      `select p.id from inf.rait_pool p join inf.rait_case c on c.tenant_id=p.tenant_id and c.id=$2 where p.tenant_id=$1 and p.active and p.strategy='pull' and p.instance='defesa_previa' and c.instance=p.instance and p.unit_id is not distinct from c.unit_id order by p.id for share of p`,
      [tenantId, caseId],
    );
    if (candidates.rows.length !== 1) return;
    const poolId = candidates.rows[0]!.id;
    const sourceRef = 'pool:' + poolId;
    const inserted = (
      await tx.query<{ id: string }>(
        `insert into inf.rait_case_pool_scope(tenant_id,case_id,pool_id,active,authorization_ref,source_ref) values($1,$2,$3,true,$4,$5) on conflict(tenant_id,case_id,pool_id) do nothing returning id`,
        [tenantId, caseId, poolId, authorizationRef, sourceRef],
      )
    ).rows[0];
    if (!inserted) return;
    await tx.query(
      'select audit.write($1,$2,null,$3,$4,$5,$6,null,null,null)',
      [
        tenantId,
        context.actorId,
        'INF_RAIT_CASE_POOL_SCOPE_ACTIVATE',
        'inf.rait_case_pool_scope',
        inserted.id,
        JSON.stringify({
          caseId,
          parentVersion: parent.version,
          poolId,
          authorizationRef,
          sourceRef,
        }),
      ],
    );
  }
}
