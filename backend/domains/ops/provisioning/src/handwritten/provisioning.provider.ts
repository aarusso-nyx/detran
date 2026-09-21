import type { Provider } from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database } from '@stynx-nyx/data';
import {
  getPrincipalFromRequest,
  withTenantContext,
  type RequestLike,
} from '@detran/shared';
import {
  digest,
  fail,
  type Operation,
  type ProvisioningInput,
  type ProvisioningPorts,
  type ProvisioningSql,
} from './provisioning.contract.js';
import { executeProvisioning } from './provisioning.engine.js';

export const OPS_PROVISIONING_TOKEN = Symbol('OPS_PROVISIONING_PROVIDER');

/** Cryptographic fixtures are selected only after the runtime boundary is checked. */
export function provisioningPorts(
  db: ProvisioningSql,
  profile: string,
  now: () => Date,
  authenticatedContext?: ProvisioningInput['context'],
): ProvisioningPorts {
  const fixture = profile === 'test' || profile === 'local-sandbox';
  const fixtureOnly = () => {
    if (!fixture) fail('VALIDATION_FAILED', 422);
  };
  return {
    fixtureOnly: fixture,
    async resolveDevice(tenantId, deviceId) {
      if (
        !authenticatedContext?.principal.subject ||
        authenticatedContext.tenantId !== tenantId
      )
        return null;
      const row = (
        await db.query(
          'select * from ops.ops_operational_device where tenant_id=$1 and id=$2',
          [tenantId, deviceId],
        )
      ).rows[0];
      if (!row) return null;
      const version = (
        await db.query(
          'select coalesce(max(version),1) as version from ops.device_key where tenant_id=$1 and device_id=$2',
          [tenantId, deviceId],
        )
      ).rows[0];
      return {
        tenantId,
        deviceId,
        trafficAgencyId: String(row.traffic_agency_id),
        agentId: String(authenticatedContext.principal.claims?.agent_id ?? ''),
        principalSubject: authenticatedContext.principal.subject,
        version: Number(version?.version ?? 1),
      };
    },
    async normativeUsable(id, scope) {
      if (
        !authenticatedContext?.principal.subject ||
        (scope && scope.tenantId !== authenticatedContext.tenantId)
      )
        return false;
      const agency =
        scope?.trafficAgencyId ??
        authenticatedContext.principal.claims?.traffic_agency_id;
      if (typeof agency !== 'string' || !agency) return false;
      const row = (
        await db.query(
          `select p.id from inf.normative_mobile_package p
           join inf.normative_catalog c on c.id=p.catalog_id and c.tenant_id=p.tenant_id and c.traffic_agency_id=p.traffic_agency_id
           where p.id=$1 and p.tenant_id=$2 and p.traffic_agency_id=$3
             and p.status='published' and (p.valid_until is null or p.valid_until >= $4::date)
             and c.status='active' and c.valid_from <= $4::date and (c.valid_to is null or c.valid_to >= $4::date)
             and length(trim(p.package_version))>0 and length(trim(c.version))>0`,
          [
            id,
            authenticatedContext.tenantId,
            agency,
            now().toISOString().slice(0, 10),
          ],
        )
      ).rows[0];
      return !!row;
    },
    async trustedSigningKey(id) {
      return fixture && id === 'fixture-kid-a';
    },
    async verifyAttestation(input) {
      fixtureOnly();
      return (
        input.proof ===
        `fixture-proof:${input.challenge}:${input.deviceId}:${input.publicKey}`
      );
    },
    async sign(manifest) {
      fixtureOnly();
      const value = digest(manifest);
      return {
        digest: value,
        signature: 'fixture-signature:' + value,
        keyId: 'fixture-kid-a',
        publicChain: ['fixture-public-chain'],
      };
    },
    async encrypt(input) {
      fixtureOnly();
      return {
        envelopeUri: `fixture://ops-provisioning/${input.deviceId}/${input.digest}`,
      };
    },
  };
}
export class ProvisioningRuntime {
  constructor(
    private readonly database: Database,
    private readonly context: RequestContext,
  ) {}
  execute(
    operation: Operation,
    request: RequestLike,
    input: Partial<ProvisioningInput>,
  ) {
    const principal = getPrincipalFromRequest(request);
    if (!principal) fail('AUTH_REQUIRED', 401);
    const snapshot = this.context.snapshot();
    if (!snapshot.tenantId || !snapshot.actorId) fail('AUTH_REQUIRED', 401);
    return withTenantContext(
      this.database,
      this.context,
      async (transaction) => {
        const db = transaction as unknown as ProvisioningSql;
        const runtimeProfile =
          process.env.DETRAN_RUNTIME_PROFILE ?? 'production';
        const clock = { now: () => new Date() };
        const authenticatedContext = {
          tenantId: snapshot.tenantId!,
          principal: {
            subject: principal.id,
            roles: principal.roles,
            permissions: principal.permissions,
            claims: principal.claims,
          },
        };
        return executeProvisioning(operation, {
          ...input,
          db,
          context: authenticatedContext,
          clock,
          runtimeProfile,
          ports: provisioningPorts(
            db,
            runtimeProfile,
            clock.now,
            authenticatedContext,
          ),
          transactionManaged: true,
        });
      },
    );
  }
}
export const OPS_PROVISIONING_PROVIDER: Provider = {
  provide: OPS_PROVISIONING_TOKEN,
  useFactory: (database: Database, context: RequestContext) =>
    new ProvisioningRuntime(database, context),
  inject: [Database, RequestContext],
};
