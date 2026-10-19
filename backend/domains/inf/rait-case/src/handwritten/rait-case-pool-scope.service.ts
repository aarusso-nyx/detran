import { Injectable } from '@nestjs/common';
import type { Transaction } from '@stynx-nyx/data';
@Injectable()
export class RaitCasePoolScopeService {
  async resolve(
    tx: Pick<Transaction, 'query'>,
    tenantId: string,
    caseId: string,
    authorizationRef: string,
  ) {
    const candidates = await tx.query<{ id: string }>(
      `select p.id from inf.rait_pool p join inf.rait_case c on c.tenant_id=p.tenant_id and c.id=$2 where p.tenant_id=$1 and p.active and p.strategy='pull' and p.instance='defesa_previa' and c.instance=p.instance and p.unit_id is not distinct from c.unit_id order by p.id for share of p`,
      [tenantId, caseId],
    );
    if (candidates.rows.length !== 1) return;
    await tx.query(
      `insert into inf.rait_case_pool_scope(tenant_id,case_id,pool_id,active,authorization_ref,source_ref) values($1,$2,$3,true,$4,$5) on conflict(tenant_id,case_id,pool_id) do update set active=true,authorization_ref=excluded.authorization_ref,source_ref=excluded.source_ref`,
      [
        tenantId,
        caseId,
        candidates.rows[0]!.id,
        authorizationRef,
        'pool:' + candidates.rows[0]!.id,
      ],
    );
  }
}
