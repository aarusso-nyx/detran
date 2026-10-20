import { Inject, Injectable, Optional } from '@nestjs/common';
import { evaluateRaitRisk, type RaitRiskSnapshot } from '@detran/inf-deadlines';
import { DetranError } from '@detran/shared';
import {
  RAIT_RISK_SNAPSHOT_FACTORY,
  raitLockRiskRelations,
  raitLockRiskParents,
  type RaitRiskSnapshotFactory,
  type RaitRiskTx,
} from './rait-risk.port.js';
import {
  RaitCaseScopeService,
  type RaitScopePrincipal,
} from './rait-case-scope.service.js';
import {
  RaitOperationClock,
  type RaitOperationClockSnapshot,
} from './rait-operation-clock.js';
@Injectable()
export class RaitCaseRiskService {
  constructor(
    private readonly scope: RaitCaseScopeService,
    private readonly clock: RaitOperationClock,
    @Optional()
    @Inject(RAIT_RISK_SNAPSHOT_FACTORY)
    private readonly factory?: RaitRiskSnapshotFactory,
  ) {}
  async operation(tx: RaitRiskTx, tenantId: string) {
    const tenant = (
      await tx.query<{ timezone: string }>(
        'select timezone from auth.tenants where id=$1 for share',
        [tenantId],
      )
    ).rows[0];
    if (!tenant) throw new DetranError('RAIT.TENANT_MISMATCH', { status: 404 });
    try {
      return this.clock.capture(tenant.timezone);
    } catch {
      throw new DetranError('RAIT.RISK_SOURCE_UNAVAILABLE', { status: 503 });
    }
  }
  async snapshot(
    tx: RaitRiskTx,
    tenantId: string,
    caseId: string,
    operation: RaitOperationClockSnapshot,
  ): Promise<RaitRiskSnapshot> {
    try {
      if (!this.factory) throw Error('Missing risk factory');
      const source = await this.factory
        .create(tx, operation)
        .read(tenantId, caseId);
      const snapshot = evaluateRaitRisk(source.input);
      for (const clock of snapshot.clocks) {
        if (
          clock.applicability === 'applicable' &&
          clock.flag === 'PRESCRITO_OPERACIONAL'
        ) {
          const matches = source.incidentQualifications.filter(
            (i) => i.clockCode === clock.clockCode,
          );
          if (
            matches.length !== 1 ||
            matches[0]!.status !== 'qualified' ||
            !matches[0]!.sourceVersions.length ||
            matches[0]!.sourceVersions.some(
              (v) => !/^rrv1:[a-f0-9]{64}$/.test(v),
            )
          )
            throw Error('Missing qualified incident');
        }
      }
      return snapshot;
    } catch {
      throw new DetranError('RAIT.RISK_SOURCE_UNAVAILABLE', { status: 503 });
    }
  }
  async read(id: string, principal: RaitScopePrincipal | undefined) {
    try {
      return await this.scope.transaction(async (tx) => {
        const who = await this.scope.authenticate(tx, principal);
        await raitLockRiskRelations(tx);
        await this.scope.assertCase(
          tx,
          id,
          principal,
          'read',
          'rait-case',
          true,
        );
        await raitLockRiskParents(tx, who.tenantId, [id]);
        return {
          data: await this.snapshot(
            tx,
            who.tenantId,
            id,
            await this.operation(tx, who.tenantId),
          ),
        };
      });
    } catch (error) {
      const e = error as { code?: string; status?: number };
      if (
        e.code === 'RAIT.TENANT_MISMATCH' ||
        e.code === 'RAIT.FORBIDDEN_CASE_SCOPE'
      )
        throw new DetranError(e.code, {
          status: e.code === 'RAIT.TENANT_MISMATCH' ? 404 : 403,
        });
      throw error;
    }
  }
}
