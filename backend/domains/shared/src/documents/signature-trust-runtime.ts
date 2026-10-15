import { X509Certificate, createHash } from 'node:crypto';
import {
  Inject,
  Injectable,
  Optional,
  ServiceUnavailableException,
} from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database } from '@stynx-nyx/data';
import type {
  SignatureTrustProfile,
  SignatureLevel,
} from '@stynx-nyx/signature';
import { DetranError } from '../errors/detran-error.js';
import type { PadesLevel } from './signature-policy.js';

export interface ApprovedSignatureFloor {
  readonly documentKind: string;
  readonly minimumSignatureLevel: SignatureLevel;
  readonly padesLevel: PadesLevel;
  readonly tsaRequired: boolean;
  readonly requireLta: boolean;
  readonly revocation: SignatureTrustProfile['revocation'];
  readonly atTime: SignatureTrustProfile['atTime'];
  readonly acceptedPolicies: readonly string[] | null;
  readonly trustAnchorsPem: readonly string[];
  readonly sourceRef: string;
  readonly approvedBy: string;
  readonly approvedAt: Date;
}

/** Administrative bootstrap snapshot. Requests cannot publish trust or identity data. */
export abstract class SignatureTrustBootstrapState {
  abstract isAvailable(): boolean;
  abstract getApprovedFloor(
    documentKind: string,
  ): Readonly<ApprovedSignatureFloor> | null;
  abstract resolveSignerCertificate(
    tenantId: string,
    signerId: string,
  ): Promise<string>;
  abstract resolvePartyCertificate(
    tenantId: string,
    partyId: string,
  ): Promise<string>;
}

export interface SignatureProfileInput {
  tenantId: string;
  trafficAgencyId: string | null;
  documentKind: string;
  at: Date;
}
export interface RecordedSignatureProfileInput {
  tenantId: string;
  policyId: string;
  documentKind: string;
  at: Date;
}
export interface ResolvedSignatureProfile {
  policyId: string;
  profile: SignatureTrustProfile;
}

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/iu;
const text = (v: unknown): v is string =>
  typeof v === 'string' && v.trim().length > 0;
const instant = (v: unknown): v is Date =>
  v instanceof Date && Number.isFinite(v.getTime()) && v.getTime() > 0;
const list = (v: unknown): v is readonly string[] =>
  Array.isArray(v) &&
  v.length > 0 &&
  v.every(text) &&
  new Set(v).size === v.length;
type PolicyRow = Record<string, unknown>;
const columns = `id,tenant_id,traffic_agency_id,document_kind,status,revision,
valid_from,valid_to,minimum_signature_level,pades_level,tsa_required,require_lta,
revocation,at_time,accepted_policies,trust_anchors_pem,source_ref,approved_by,approved_at`;

function refused(): never {
  throw new DetranError('RAIT.SIGNATURE_FAILED', {
    status: 502,
    messageKey: 'rait.errors.signature_failed',
    message: 'A evidência documental não pôde ser validada.',
  });
}
function closed(value: object, keys: readonly string[]): void {
  if (
    !value ||
    Object.keys(value).length !== keys.length ||
    Object.keys(value).some((k) => !keys.includes(k))
  )
    refused();
}
function anchor(pem: string): { fingerprint: string; pem: string } {
  const cert = new X509Certificate(pem);
  return {
    fingerprint: createHash('sha256').update(cert.raw).digest('hex'),
    pem: `-----BEGIN CERTIFICATE-----\n${cert.raw
      .toString('base64')
      .match(/.{1,64}/gu)!
      .join('\n')}\n-----END CERTIFICATE-----\n`,
  };
}

@Injectable()
export class SignatureTrustRuntime {
  constructor(
    @Inject(Database) private readonly database: Database,
    @Inject(RequestContext) private readonly requestContext: RequestContext,
    @Optional()
    @Inject(SignatureTrustBootstrapState)
    private readonly bootstrap?: SignatureTrustBootstrapState,
  ) {}

  assertConfigured(): void {
    const profile = process.env.DETRAN_RUNTIME_PROFILE;
    const urls = [
      process.env.DETRAN_DOCUMENT_TRUST_URL,
      process.env.DETRAN_DOCUMENT_TRUST_HEALTH_URL,
    ];
    try {
      if (
        !['local-sandbox', 'test', 'staging-like', 'production'].includes(
          profile ?? '',
        ) ||
        !text(process.env.DETRAN_DOCUMENT_TRUST_TOKEN) ||
        !this.bootstrap?.isAvailable()
      )
        throw new Error();
      for (const raw of urls) {
        if (!text(raw)) throw new Error();
        const url = new URL(raw);
        if (
          !['http:', 'https:'].includes(url.protocol) ||
          url.username ||
          url.password ||
          (['staging-like', 'production'].includes(profile!) &&
            url.protocol !== 'https:')
        )
          throw new Error();
      }
    } catch {
      throw new ServiceUnavailableException(
        'Document trust service is not configured',
      );
    }
  }

  private tenant(tenantId: string): void {
    if (
      !text(tenantId) ||
      !uuid.test(tenantId) ||
      !this.requestContext.hasActiveContext() ||
      this.requestContext.tenantId !== tenantId ||
      this.database.currentTenantId() !== tenantId
    )
      refused();
  }

  async resolveProfile(
    input: SignatureProfileInput,
  ): Promise<ResolvedSignatureProfile> {
    this.assertConfigured();
    try {
      closed(input, ['tenantId', 'trafficAgencyId', 'documentKind', 'at']);
      this.tenant(input.tenantId);
      if (
        !text(input.documentKind) ||
        !instant(input.at) ||
        !(
          input.trafficAgencyId === null ||
          (text(input.trafficAgencyId) && uuid.test(input.trafficAgencyId))
        )
      )
        refused();
      const rows = await this.database.tx(
        async (tx) =>
          (
            await tx.query<PolicyRow>(
              `SELECT ${columns} FROM inf.signature_policy WHERE tenant_id=$1 AND document_kind=$2
         AND status='active' AND approved_at IS NOT NULL AND valid_from<=$3
         AND (valid_to IS NULL OR $3<valid_to) ORDER BY revision DESC,id`,
              [input.tenantId, input.documentKind, input.at],
            )
          ).rows,
      );
      // An absent agency cannot silently select a statewide policy when agency policies exist.
      if (
        input.trafficAgencyId === null &&
        rows.some((r) => r.traffic_agency_id !== null)
      )
        refused();
      const agency = rows.filter(
        (r) => r.traffic_agency_id === input.trafficAgencyId,
      );
      const candidates = agency.length
        ? agency
        : rows.filter((r) => r.traffic_agency_id === null);
      candidates.sort((a, b) => Number(b.revision) - Number(a.revision));
      if (
        !candidates.length ||
        (candidates.length > 1 &&
          candidates[0]!.revision === candidates[1]!.revision)
      )
        refused();
      return this.map(candidates[0]!, input);
    } catch {
      return refused();
    }
  }

  async resolveRecordedProfile(
    input: RecordedSignatureProfileInput,
  ): Promise<ResolvedSignatureProfile> {
    this.assertConfigured();
    try {
      closed(input, ['tenantId', 'policyId', 'documentKind', 'at']);
      this.tenant(input.tenantId);
      if (
        !uuid.test(input.policyId) ||
        !text(input.documentKind) ||
        !instant(input.at)
      )
        refused();
      const rows = await this.database.tx(
        async (tx) =>
          (
            await tx.query<PolicyRow>(
              `SELECT ${columns} FROM inf.signature_policy WHERE tenant_id=$1 AND id=$2
         AND document_kind=$3 AND status='active' AND approved_at IS NOT NULL
         AND valid_from<=$4 AND (valid_to IS NULL OR $4<valid_to)`,
              [input.tenantId, input.policyId, input.documentKind, input.at],
            )
          ).rows,
      );
      if (rows.length !== 1 || rows[0]!.id !== input.policyId) refused();
      return this.map(rows[0]!, input);
    } catch {
      return refused();
    }
  }

  private map(
    row: PolicyRow,
    input: { tenantId: string; documentKind: string; at: Date },
  ): ResolvedSignatureProfile {
    const floor = this.bootstrap!.getApprovedFloor(input.documentKind);
    if (
      !floor ||
      floor.documentKind !== input.documentKind ||
      !text(floor.sourceRef) ||
      !text(floor.approvedBy) ||
      !instant(floor.approvedAt) ||
      !text(row.id) ||
      !uuid.test(row.id) ||
      row.tenant_id !== input.tenantId ||
      row.document_kind !== input.documentKind ||
      row.status !== 'active' ||
      !Number.isSafeInteger(row.revision) ||
      Number(row.revision) < 1 ||
      !instant(row.valid_from) ||
      row.valid_from > input.at ||
      !(
        row.valid_to === null ||
        (instant(row.valid_to) && input.at < row.valid_to)
      ) ||
      !text(row.source_ref) ||
      !text(row.approved_by) ||
      !instant(row.approved_at)
    )
      refused();
    const levels = ['ADVANCED', 'QUALIFIED'];
    const revocations = ['ocsp', 'crl', 'ocsp-or-crl'];
    const times = ['signing-time', 'trusted-timestamp'];
    if (
      !levels.includes(String(row.minimum_signature_level)) ||
      !levels.includes(floor.minimumSignatureLevel) ||
      row.pades_level !== 'PAdES-B-LT' ||
      row.pades_level !== floor.padesLevel ||
      typeof row.tsa_required !== 'boolean' ||
      typeof floor.tsaRequired !== 'boolean' ||
      typeof row.require_lta !== 'boolean' ||
      typeof floor.requireLta !== 'boolean' ||
      !revocations.includes(String(row.revocation)) ||
      !revocations.includes(floor.revocation) ||
      !times.includes(String(row.at_time)) ||
      !times.includes(floor.atTime) ||
      !(row.accepted_policies === null || list(row.accepted_policies)) ||
      !(floor.acceptedPolicies === null || list(floor.acceptedPolicies)) ||
      !list(row.trust_anchors_pem) ||
      !list(floor.trustAnchorsPem)
    )
      refused();
    if (
      levels.indexOf(String(row.minimum_signature_level)) <
        levels.indexOf(floor.minimumSignatureLevel) ||
      (floor.tsaRequired && !row.tsa_required) ||
      (floor.requireLta && !row.require_lta) ||
      (floor.revocation !== 'ocsp-or-crl' &&
        row.revocation !== floor.revocation) ||
      (floor.atTime === 'trusted-timestamp' && row.at_time !== floor.atTime) ||
      (floor.acceptedPolicies !== null &&
        (row.accepted_policies === null ||
          !(row.accepted_policies as readonly string[]).every((p) =>
            floor.acceptedPolicies!.includes(p),
          )))
    )
      refused();
    const permitted = new Set(
      floor.trustAnchorsPem.map((p) => anchor(p).fingerprint),
    );
    const anchors = (row.trust_anchors_pem as readonly string[]).map(anchor);
    if (anchors.some((a) => !permitted.has(a.fingerprint))) refused();
    return {
      policyId: row.id,
      profile: {
        id: row.id,
        revision: String(row.revision),
        environment: ['local-sandbox', 'test'].includes(
          process.env.DETRAN_RUNTIME_PROFILE!,
        )
          ? 'test'
          : 'production',
        minimumSignatureLevel: row.minimum_signature_level as SignatureLevel,
        requiredPadesProfile: 'PAdES-B-LT',
        requireTsa: row.tsa_required as boolean,
        requireLta: row.require_lta as boolean,
        revocation: row.revocation as SignatureTrustProfile['revocation'],
        atTime: row.at_time as SignatureTrustProfile['atTime'],
        trustAnchorsPem: anchors.map((a) => a.pem),
        ...(row.accepted_policies === null
          ? {}
          : {
              acceptedPolicies: [
                ...(row.accepted_policies as readonly string[]),
              ],
            }),
      },
    };
  }

  async resolveSignerCertificate(
    tenantId: string,
    signerId: string,
  ): Promise<string> {
    this.assertConfigured();
    try {
      this.tenant(tenantId);
      if (!text(signerId)) refused();
      const value = await this.bootstrap!.resolveSignerCertificate(
        tenantId,
        signerId,
      );
      if (!/^[a-f0-9]{64}$/u.test(value)) refused();
      return value;
    } catch {
      return refused();
    }
  }
  async resolvePartyCertificate(
    tenantId: string,
    partyId: string,
  ): Promise<string> {
    this.assertConfigured();
    try {
      this.tenant(tenantId);
      if (!text(partyId)) refused();
      const value = await this.bootstrap!.resolvePartyCertificate(
        tenantId,
        partyId,
      );
      if (!/^[a-f0-9]{64}$/u.test(value)) refused();
      return value;
    } catch {
      return refused();
    }
  }
}
