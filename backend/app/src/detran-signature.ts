import { X509Certificate } from 'node:crypto';
import {
  Global,
  Inject,
  Injectable,
  Module,
  type OnApplicationBootstrap,
} from '@nestjs/common';
import { Database } from '@stynx-nyx/data';
import {
  StynxSignatureModule,
  SignatureService,
  SignatureManifestService,
  SignatureWithdrawalVerifier,
  createCmsTrustVerifier,
  type CmsTrustVerifierOptions,
} from '@stynx-nyx/signature';
import {
  SignatureTrustBootstrapState,
  SignatureTrustRuntime,
  SignedDocumentStore,
  DocumentTrustHttpAdapter,
  type ApprovedSignatureFloor,
} from '@detran/shared';

// The genuine verifier closes over these private options. No caller supplies trust.
const options: CmsTrustVerifierOptions = { trustAnchorsPem: [] };
const verifier = createCmsTrustVerifier(options);
let floors: ReadonlyMap<string, Readonly<ApprovedSignatureFloor>> = new Map();
let published = false;
const text = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;
const validDate = (value: unknown): value is Date =>
  value instanceof Date &&
  Number.isFinite(value.getTime()) &&
  value.getTime() > 0;
function detached(
  floor: Readonly<ApprovedSignatureFloor>,
): Readonly<ApprovedSignatureFloor> {
  return Object.freeze({
    ...floor,
    approvedAt: new Date(floor.approvedAt),
    trustAnchorsPem: Object.freeze([...floor.trustAnchorsPem]),
    acceptedPolicies:
      floor.acceptedPolicies === null
        ? null
        : Object.freeze([...floor.acceptedPolicies]),
  });
}
function parse(
  row: Record<string, unknown>,
): Readonly<ApprovedSignatureFloor> | null {
  if (
    !text(row.document_kind) ||
    !text(row.source_ref) ||
    !text(row.approved_by) ||
    !validDate(row.approved_at) ||
    !['ADVANCED', 'QUALIFIED'].includes(String(row.minimum_signature_level)) ||
    row.pades_level !== 'PAdES-B-LT' ||
    typeof row.tsa_required !== 'boolean' ||
    typeof row.require_lta !== 'boolean' ||
    !['ocsp', 'crl', 'ocsp-or-crl'].includes(String(row.revocation)) ||
    !['signing-time', 'trusted-timestamp'].includes(String(row.at_time)) ||
    !(
      row.accepted_policies === null ||
      (Array.isArray(row.accepted_policies) &&
        row.accepted_policies.length > 0 &&
        row.accepted_policies.every(text))
    ) ||
    !Array.isArray(row.trust_anchors_pem) ||
    !row.trust_anchors_pem.length ||
    !row.trust_anchors_pem.every(text)
  )
    return null;
  // Node's certificate parser supplies standard DER/PEM representation; it does not confer trust.
  const anchors = row.trust_anchors_pem.map((pem: string) => {
    const raw = new X509Certificate(pem).raw;
    return new X509Certificate(raw).toString();
  });
  return detached({
    documentKind: row.document_kind,
    minimumSignatureLevel:
      row.minimum_signature_level as ApprovedSignatureFloor['minimumSignatureLevel'],
    padesLevel: 'PAdES-B-LT',
    tsaRequired: row.tsa_required,
    requireLta: row.require_lta,
    revocation: row.revocation as ApprovedSignatureFloor['revocation'],
    atTime: row.at_time as ApprovedSignatureFloor['atTime'],
    acceptedPolicies: row.accepted_policies as readonly string[] | null,
    trustAnchorsPem: anchors,
    sourceRef: row.source_ref,
    approvedBy: row.approved_by,
    approvedAt: row.approved_at,
  });
}
const bootstrapState: SignatureTrustBootstrapState =
  new (class extends SignatureTrustBootstrapState {
    isAvailable(): boolean {
      return published && floors.size > 0;
    }
    getApprovedFloor(
      documentKind: string,
    ): Readonly<ApprovedSignatureFloor> | null {
      const floor = floors.get(documentKind);
      return floor ? detached(floor) : null;
    }
    async resolveSignerCertificate(
      _tenantId: string,
      _signerId: string,
    ): Promise<string> {
      // Trusted identity provenance is not the certificate attached to incoming evidence.
      throw new Error('Approved signer certificate source is unavailable');
    }
    async resolvePartyCertificate(
      _tenantId: string,
      _partyId: string,
    ): Promise<string> {
      throw new Error('Approved party certificate source is unavailable');
    }
  })();

@Injectable()
export class DetranSignatureBootstrap implements OnApplicationBootstrap {
  constructor(@Inject(Database) private readonly database: Database) {}
  async onApplicationBootstrap(): Promise<void> {
    if (published) return;
    try {
      const rows = await this.database.withSystemContext(
        'DETRAN approved signature floor bootstrap (read only)',
        () =>
          this.database.tx(
            async (tx) =>
              (
                await tx.query<
                  Record<string, unknown>
                >(`SELECT document_kind,minimum_signature_level,pades_level,
          tsa_required,require_lta,revocation,at_time,accepted_policies,trust_anchors_pem,source_ref,approved_by,approved_at
          FROM inf.signature_policy_floor_ref ORDER BY document_kind`)
              ).rows,
            { role: 'owner', readonly: true, retry: false },
          ),
      );
      const candidate = new Map<string, Readonly<ApprovedSignatureFloor>>();
      for (const row of rows) {
        const floor = parse(row);
        if (floor) {
          if (candidate.has(floor.documentKind))
            throw new Error('Duplicate floor source');
          candidate.set(floor.documentKind, floor);
        }
      }
      const anchors = [
        ...new Set(
          [...candidate.values()].flatMap((f) => [...f.trustAnchorsPem]),
        ),
      ];
      options.trustAnchorsPem = Object.freeze(anchors);
      // Approved floor anchors include signature TSA anchors by CTG A.2.1; archive trust has no substitute.
      options.tsaTrustAnchorsPem = Object.freeze([...anchors]);
      floors = candidate;
    } catch {
      floors = new Map();
      options.trustAnchorsPem = [];
      options.tsaTrustAnchorsPem = [];
    }
    published = true;
  }
}

@Global()
@Module({
  imports: [StynxSignatureModule.forRoot({ trustVerifier: verifier })],
  providers: [
    { provide: SignatureTrustBootstrapState, useValue: bootstrapState },
    SignatureTrustRuntime,
    SignedDocumentStore,
    DocumentTrustHttpAdapter,
    DetranSignatureBootstrap,
    {
      provide: SignatureManifestService,
      inject: [SignatureTrustRuntime],
      useFactory: (runtime: SignatureTrustRuntime) =>
        new SignatureManifestService({
          trustVerifier: verifier,
          resolveSignerCertificate: (tenantId, signerId) =>
            runtime.resolveSignerCertificate(tenantId, signerId),
        }),
    },
    {
      provide: SignatureWithdrawalVerifier,
      inject: [SignatureTrustRuntime],
      useFactory: (runtime: SignatureTrustRuntime) =>
        new SignatureWithdrawalVerifier({
          trustVerifier: verifier,
          resolvePartyCertificate: (tenantId, partyId) =>
            runtime.resolvePartyCertificate(tenantId, partyId),
        }),
    },
  ],
  exports: [
    StynxSignatureModule,
    SignatureTrustRuntime,
    SignedDocumentStore,
    DocumentTrustHttpAdapter,
    SignatureTrustBootstrapState,
    SignatureManifestService,
    SignatureWithdrawalVerifier,
  ],
})
export class DetranSignatureModule {}
