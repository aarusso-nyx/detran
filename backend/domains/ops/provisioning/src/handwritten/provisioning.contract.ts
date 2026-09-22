import { createHash } from 'node:crypto';
import { DetranError } from '@detran/shared';
import { z } from 'zod';

export type ProvisioningCommand<Input, Output> = {
  execute(input: Input): Promise<Output>;
};
export type ProvisioningResult = {
  body: Record<string, unknown>;
  etag: string;
};
export type Row = Record<string, unknown>;
export interface ProvisioningSql {
  query<T extends Row = Row>(
    sql: string,
    values?: unknown[],
  ): Promise<{ rows: T[] }>;
}
export type ProvisioningPrincipal = {
  subject: string;
  roles: readonly string[];
  permissions: readonly string[];
  claims?: Record<string, unknown>;
};
export type DeviceBinding = {
  deviceId: string;
  tenantId: string;
  trafficAgencyId: string;
  principalSubject: string;
  agentId: string;
  version: number;
};
export interface ProvisioningPorts {
  fixtureOnly: boolean;
  resolveDevice(
    tenantId: string,
    deviceId: string,
  ): Promise<DeviceBinding | null>;
  normativeUsable(
    id: string,
    scope?: { tenantId: string; trafficAgencyId: string; deviceId: string },
  ): Promise<boolean>;
  trustedSigningKey(id: string): Promise<boolean>;
  verifyAttestation(input: {
    challenge: string;
    proof: string;
    deviceId: string;
    publicKey: string;
  }): Promise<boolean>;
  sign(manifest: unknown): Promise<{
    digest: string;
    signature: string;
    keyId: string;
    publicChain: unknown[];
  }>;
  encrypt(input: {
    deviceId: string;
    digest: string;
    manifest: unknown;
    signature: string;
  }): Promise<{ envelopeUri: string }>;
  checkpoint?(point: string): Promise<void>;
}
export type ProvisioningInput = {
  db: ProvisioningSql;
  context: { tenantId: string; principal: ProvisioningPrincipal };
  deviceId?: string;
  packageId?: string;
  grantId?: string;
  body: unknown;
  ifMatch?: string;
  idempotencyKey?: string;
  clock: { now(): Date };
  runtimeProfile: string;
  ports: ProvisioningPorts;
  /** The STYNX adapter owns this transaction; direct domain clients own BEGIN/COMMIT. */
  transactionManaged?: boolean;
};
export type Operation =
  | 'challenge'
  | 'register'
  | 'issue'
  | 'download'
  | 'receipt'
  | 'readiness'
  | 'revoke'
  | 'reconcile';
const key = z.string().min(1).max(160);
const uuid = z.string().uuid();
const date = z.iso.datetime({ offset: true });
const common = { idempotency_key: key };
const agent = z
  .object({
    agent_id: uuid,
    registration_number: z.string().min(1),
    roles: z.array(z.enum(['field-agent', 'field-supervisor'])).min(1),
    permissions: z.array(z.string().min(1)),
  })
  .strict();
export const schemas = {
  challenge: z.object(common).strict(),
  register: z
    .object({
      ...common,
      challenge_id: uuid,
      challenge_proof: z.string(),
      public_key: z.string().min(1),
      key_fingerprint: z.string().min(1).max(256),
      attestation_evidence: z.record(z.string(), z.unknown()),
    })
    .strict(),
  issue: z
    .object({
      ...common,
      device_id: uuid,
      authorized_agents: z.array(agent).min(1),
      valid_from: date,
      valid_until: date,
      maximum_offline_seconds: z.number().int().positive(),
      maximum_acts: z.number().int().positive(),
      policy_version: z.string().min(1),
      normative_package_id: uuid,
      numbering_reservation_ids: z.array(uuid).min(1),
    })
    .strict(),
  receipt: z
    .object({
      ...common,
      receipt_type: z.enum(['exported', 'installed', 'activated']),
      manifest_digest: z.string().min(1).max(128),
      occurred_at: date,
      device_attestation: z.record(z.string(), z.unknown()).optional(),
    })
    .strict(),
  revoke: z
    .object({
      ...common,
      reason_code: z.string().min(1).max(80),
      revocation_epoch: z.number().int().nonnegative(),
      decided_at: date,
    })
    .strict(),
  reconcile: z
    .object({
      ...common,
      acts: z.array(
        z
          .object({
            idempotency_key: key,
            reserved_numbering_context: z.record(z.string(), z.unknown()),
            local_content_hash: z.string().min(1).max(128),
            device_id: uuid,
            agent_id: uuid,
            occurred_at: date,
            location_context: z.record(z.string(), z.unknown()),
            normative_package_id: uuid,
          })
          .strict(),
      ),
    })
    .strict(),
};
export function fail(
  code:
    | 'VALIDATION_FAILED'
    | 'AUTH_REQUIRED'
    | 'FORBIDDEN_ACTION'
    | 'IF_MATCH_REQUIRED'
    | 'VERSION_CONFLICT'
    | 'IDEMPOTENCY_REPLAY'
    | 'TENANT_MISMATCH',
  status: number,
): never {
  throw new DetranError(`TEAT.${code}`, { status });
}
export function canonical(value: unknown): string {
  if (value instanceof Date) return JSON.stringify(value.toISOString());
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value !== null && typeof value === 'object')
    return `{${Object.entries(value)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${JSON.stringify(k)}:${canonical(v)}`)
      .join(',')}}`;
  return JSON.stringify(value) ?? 'null';
}
export function digest(value: unknown): string {
  return createHash('sha256').update(canonical(value)).digest('hex');
}
export function etag(version: unknown): string {
  return `"${String(version)}"`;
}
export function safeMaterial(value: unknown): void {
  if (
    /private[_-]?key|refresh[_-]?token|protected[_-]?value|BEGIN[^"\n]*PRIVATE/iu.test(
      JSON.stringify(value),
    )
  )
    fail('VALIDATION_FAILED', 422);
}
