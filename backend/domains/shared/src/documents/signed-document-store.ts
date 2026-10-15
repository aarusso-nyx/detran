import { X509Certificate, createHash } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import { Inject, Injectable } from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database } from '@stynx-nyx/data';
import { S3Service } from '@stynx-nyx/storage';
import {
  SignatureService,
  SignatureManifestService,
  SignatureWithdrawalVerifier,
  type SignatureCertificateRef,
  type SignatureTrustProof,
  type SignatureTrustProfile,
  type SignatureManifest,
  type ManifestPreparation,
  type ManifestSignerArtifact,
} from '@stynx-nyx/signature';
import { DetranError } from '../errors/detran-error.js';
import { DOCUMENT_KINDS } from './document-kind.js';
import { SignatureTrustRuntime } from './signature-trust-runtime.js';

export interface SignatureEvidenceAddress {
  tenantId: string;
  evidenceId: string;
  documentId: string;
  documentKind: string;
  signerId: string;
}
export interface SignatureEvidenceWrite {
  tenantId: string;
  trafficAgencyId: string | null;
  documentId: string;
  documentKind: string;
  signerId: string;
  originalDocument: Uint8Array;
  signedDocument: Uint8Array;
  cmsSignature: Uint8Array;
  certificate: SignatureCertificateRef;
}
export interface StoredSignatureEvidence {
  id: string;
  tenantId: string;
  documentId: string;
  documentKind: string;
  signerId: string;
  policyId: string;
  trustProfileRevision: string;
  originalObjectId: string;
  signedObjectId: string;
  originalDocument: Uint8Array;
  signedDocument: Uint8Array;
  cmsSignature: Uint8Array;
  certificate: SignatureCertificateRef;
  originalDocumentSha256: string;
  signedDocumentSha256: string;
  cmsSha256: string;
  signerCertificateSha256: string;
  recorded: Pick<
    SignatureTrustProof,
    | 'achievedLevel'
    | 'padesProfile'
    | 'revocationSource'
    | 'signedAt'
    | 'tsaAt'
    | 'certificateValidatedAt'
    | 'verificationRef'
  >;
}
export interface WrittenSignatureEvidence {
  evidenceId: string;
  originalObjectId: string;
  signedObjectId: string;
  policyId: string;
  trustProof: SignatureTrustProof;
}
export type SignatureManifestAddress =
  | {
      kind: 'session-minutes';
      tenantId: string;
      sessionId: string;
      minutesId: string;
      snapshotHash: string;
    }
  | {
      kind: 'batch-minutes';
      tenantId: string;
      batchId: string;
      snapshotHash: string;
    };
export interface StoredSignatureManifest {
  id: string;
  readonly sourceObjectId: string;
  manifest: SignatureManifest;
  sourceDocument: Uint8Array;
  snapshot: Uint8Array;
  preparedAt: Date;
}
type Row = Record<string, unknown>;
const hash = (bytes: Uint8Array) =>
  createHash('sha256').update(bytes).digest('hex');
const text = (v: unknown): v is string =>
  typeof v === 'string' && v.trim().length > 0;
const uuid = (v: unknown): v is string =>
  typeof v === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/iu.test(v);
const hex = (v: unknown): v is string =>
  typeof v === 'string' && /^[0-9a-f]{64}$/u.test(v);
const date = (v: unknown): v is Date =>
  v instanceof Date && Number.isFinite(v.getTime()) && v.getTime() > 0;
const bytes = (v: unknown): v is Uint8Array =>
  v instanceof Uint8Array && v.byteLength > 0;
const kinds = new Set<string>([
  ...DOCUMENT_KINDS,
  'SESSION_MINUTES',
  'BATCH_DISTRIBUTION_MINUTES',
]);
const evidenceColumns = `id,tenant_id,document_id,document_kind,signer_id,original_object_id,signed_object_id,
 cms_signature,cms_sha256,original_document_sha256,signed_document_sha256,signer_certificate_sha256,
 signer_certificate_pem,signature_policy_id,trust_profile_revision,verifier_kind,achieved_level,pades_profile,
 revocation_source,signed_at,tsa_at,certificate_validated_at,verification_ref`;
function refused(): never {
  throw new DetranError('RAIT.SIGNATURE_FAILED', {
    status: 502,
    messageKey: 'rait.errors.signature_failed',
    message: 'A evidência documental não pôde ser validada.',
  });
}
function closed(input: object, keys: readonly string[]): void {
  if (
    !input ||
    Object.keys(input).length !== keys.length ||
    Object.keys(input).some((k) => !keys.includes(k))
  )
    refused();
}
function certificate(value: SignatureCertificateRef): X509Certificate {
  if (!value || !text(value.pem)) refused();
  const cert = new X509Certificate(value.pem);
  if (
    cert.subject !== value.subject ||
    cert.issuer !== value.issuer ||
    cert.serialNumber !== value.serialNumber
  )
    refused();
  return cert;
}

@Injectable()
export class SignedDocumentStore {
  // A SQL failure cannot undo S3 PUT. Preserve the actual orphan keys for internal reconciliation.
  private readonly orphanedUploads: string[][] = [];
  constructor(
    @Inject(Database) private readonly database: Database,
    @Inject(RequestContext) private readonly requestContext: RequestContext,
    @Inject(S3Service) private readonly s3: S3Service,
    @Inject(SignatureService) private readonly signatures: SignatureService,
    @Inject(SignatureManifestService)
    private readonly manifests: SignatureManifestService,
    @Inject(SignatureWithdrawalVerifier)
    private readonly withdrawals: SignatureWithdrawalVerifier,
    @Inject(SignatureTrustRuntime)
    private readonly runtime: SignatureTrustRuntime,
  ) {}
  private tenant(tenantId: string): void {
    if (
      !uuid(tenantId) ||
      !this.requestContext.hasActiveContext() ||
      this.requestContext.tenantId !== tenantId ||
      this.database.currentTenantId() !== tenantId ||
      !text(this.requestContext.actorId)
    )
      refused();
  }
  private document(documentId: string, documentKind: string): void {
    if (
      !text(documentId) ||
      !/^[A-Za-z0-9._-]+$/u.test(documentId) ||
      !kinds.has(documentKind)
    )
      refused();
  }
  private proof(
    value: SignatureTrustProof | undefined,
    input: SignatureEvidenceWrite,
    profile: SignatureTrustProfile,
    expected: string,
  ): SignatureTrustProof {
    if (
      !value ||
      value.verifierKind !== 'stynx-cms' ||
      value.profileId !== profile.id ||
      value.profileRevision !== profile.revision ||
      value.padesProfile !== profile.requiredPadesProfile ||
      !['ADVANCED', 'QUALIFIED'].includes(value.achievedLevel) ||
      (profile.minimumSignatureLevel === 'QUALIFIED' &&
        value.achievedLevel !== 'QUALIFIED') ||
      value.originalDocumentSha256 !== hash(input.originalDocument) ||
      value.signedDocumentSha256 !== hash(input.signedDocument) ||
      value.cmsSha256 !== hash(input.cmsSignature) ||
      value.signerCertificateSha256 !== expected ||
      value.signerCertificateSha256 !==
        hash(certificate(input.certificate).raw) ||
      !Array.isArray(value.chainSha256) ||
      !value.chainSha256.length ||
      !value.chainSha256.every(hex) ||
      !date(value.signedAt) ||
      !date(value.tsaAt) ||
      !date(value.certificateValidatedAt) ||
      !text(value.verificationRef) ||
      !['ocsp', 'crl'].includes(value.revocationSource) ||
      (profile.revocation !== 'ocsp-or-crl' &&
        value.revocationSource !== profile.revocation) ||
      (profile.requireLta && (value.lta !== true || !date(value.archiveAt)))
    )
      refused();
    return value;
  }
  async writeVerifiedEvidence(
    input: SignatureEvidenceWrite,
  ): Promise<WrittenSignatureEvidence> {
    this.runtime.assertConfigured();
    const uploaded: string[] = [];
    try {
      closed(input, [
        'tenantId',
        'trafficAgencyId',
        'documentId',
        'documentKind',
        'signerId',
        'originalDocument',
        'signedDocument',
        'cmsSignature',
        'certificate',
      ]);
      this.tenant(input.tenantId);
      this.document(input.documentId, input.documentKind);
      if (
        !text(input.signerId) ||
        !bytes(input.originalDocument) ||
        !bytes(input.signedDocument) ||
        !bytes(input.cmsSignature)
      )
        refused();
      certificate(input.certificate);
      const { policyId, profile } = await this.runtime.resolveProfile({
        tenantId: input.tenantId,
        trafficAgencyId: input.trafficAgencyId,
        documentKind: input.documentKind,
        at: new Date(),
      });
      const expected = await this.runtime.resolveSignerCertificate(
        input.tenantId,
        input.signerId,
      );
      const readiness = await this.signatures.checkReadiness(profile);
      if (!readiness.ok || readiness.verifierKind !== 'stynx-cms') refused();
      const result = await this.signatures.verify({
        tenantId: input.tenantId,
        document: input.originalDocument,
        documentSha256: hash(input.originalDocument),
        signedDocument: input.signedDocument,
        cmsSignature: input.cmsSignature,
        certificate: input.certificate,
        minimumSignatureLevel: profile.minimumSignatureLevel,
        trustProfile: profile,
      });
      if (
        result.status !== 'valid' ||
        result.verifierKind !== 'stynx-cms' ||
        result.documentSha256 !== hash(input.originalDocument) ||
        result.signatureLevel !== result.trustProof?.achievedLevel
      )
        refused();
      const trustProof = this.proof(
        result.trustProof,
        input,
        profile,
        expected,
      );
      const original = await this.upload(
        input.tenantId,
        input.documentId,
        input.documentKind,
        input.originalDocument,
        uploaded,
      );
      const signed = await this.upload(
        input.tenantId,
        input.documentId,
        input.documentKind,
        input.signedDocument,
        uploaded,
      );
      return await this.database.tx(async (tx) => {
        const object = async (
          key: string,
          document: Uint8Array,
        ): Promise<string> => {
          const existing = (
            await tx.query<Row>(
              `SELECT id,checksum_sha256,byte_size,content_type,classification,collection FROM storage.objects WHERE tenant_id=$1 AND object_key=$2`,
              [input.tenantId, key],
            )
          ).rows;
          if (existing.length) {
            const r = existing[0]!;
            if (
              existing.length !== 1 ||
              !uuid(r.id) ||
              r.checksum_sha256 !== hash(document) ||
              Number(r.byte_size) !== document.length ||
              r.content_type !== 'application/pdf' ||
              r.classification !== 'confidential' ||
              r.collection !== 'signed-documents'
            )
              refused();
            return r.id;
          }
          const rows = (
            await tx.query<Row>(
              `INSERT INTO storage.objects(tenant_id,collection,object_key,content_type,byte_size,checksum_sha256,classification)
           VALUES($1,'signed-documents',$2,'application/pdf',$3,$4,'confidential') RETURNING id`,
              [input.tenantId, key, document.length, hash(document)],
            )
          ).rows;
          if (rows.length !== 1 || !uuid(rows[0]!.id)) refused();
          return rows[0]!.id;
        };
        const originalObjectId = await object(original, input.originalDocument),
          signedObjectId = await object(signed, input.signedDocument);
        const rows = (
          await tx.query<Row>(
            `INSERT INTO storage.signature_evidence
         (tenant_id,document_id,document_kind,signer_id,original_object_id,signed_object_id,cms_signature,cms_sha256,
         original_document_sha256,signed_document_sha256,signer_certificate_sha256,signer_certificate_pem,
         signature_policy_id,trust_profile_revision,verifier_kind,achieved_level,pades_profile,revocation_source,
         signed_at,tsa_at,certificate_validated_at,verification_ref,created_by)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,'stynx-cms',$15,$16,$17,$18,$19,$20,$21,$22) RETURNING id`,
            [
              input.tenantId,
              input.documentId,
              input.documentKind,
              input.signerId,
              originalObjectId,
              signedObjectId,
              Buffer.from(input.cmsSignature),
              trustProof.cmsSha256,
              trustProof.originalDocumentSha256,
              trustProof.signedDocumentSha256,
              trustProof.signerCertificateSha256,
              input.certificate.pem,
              policyId,
              profile.revision,
              trustProof.achievedLevel,
              trustProof.padesProfile,
              trustProof.revocationSource,
              trustProof.signedAt,
              trustProof.tsaAt,
              trustProof.certificateValidatedAt,
              trustProof.verificationRef,
              this.requestContext.actorId,
            ],
          )
        ).rows;
        if (rows.length !== 1 || !uuid(rows[0]!.id)) refused();
        return {
          evidenceId: rows[0]!.id,
          originalObjectId,
          signedObjectId,
          policyId,
          trustProof,
        };
      });
    } catch {
      if (uploaded.length) this.orphanedUploads.push([...uploaded]);
      return refused();
    }
  }
  private async upload(
    tenantId: string,
    documentId: string,
    documentKind: string,
    document: Uint8Array,
    uploaded: string[],
  ): Promise<string> {
    if (
      !bytes(document) ||
      document.length > 50 * 1024 * 1024 ||
      !Buffer.from(document.subarray(0, 5)).equals(Buffer.from('%PDF-'))
    )
      refused();
    const checksum = hash(document),
      key = `${tenantId}/signed-documents/${documentKind}/${documentId}/${checksum}.pdf`;
    let existing = false;
    try {
      const head = await this.s3.headObject(key);
      if (
        head.metadata?.sha256 !== checksum ||
        head.contentType !== 'application/pdf' ||
        head.contentLength !== document.length
      )
        refused();
      existing = true;
    } catch (error) {
      const e = error as {
        name?: string;
        $metadata?: { httpStatusCode?: number };
      };
      if (
        !(e?.name === 'NotFound' || e?.name === 'NoSuchKey') ||
        (e.$metadata?.httpStatusCode !== undefined &&
          e.$metadata.httpStatusCode !== 404)
      )
        throw error;
    }
    if (!existing) {
      const signed = await this.s3.presignUpload({
        key,
        contentType: 'application/pdf',
        checksumSha256: checksum,
      });
      const reply = await fetch(signed.url, {
        method: signed.method,
        headers: signed.headers,
        body: Buffer.from(document),
        signal: AbortSignal.timeout(15000),
      });
      if (!reply.ok) refused();
      uploaded.push(key);
      const head = await this.s3.headObject(key);
      if (
        head.metadata?.sha256 !== checksum ||
        head.contentType !== 'application/pdf' ||
        head.contentLength !== document.length
      )
        refused();
    }
    return key;
  }
  private async readObject(
    tenantId: string,
    id: string,
    checksum: string,
  ): Promise<Uint8Array> {
    if (!uuid(id) || !hex(checksum)) refused();
    const rows = await this.database.tx(
      async (tx) =>
        (
          await tx.query<Row>(
            `SELECT id,tenant_id,collection,object_key,content_type,byte_size,checksum_sha256,classification
     FROM storage.objects WHERE tenant_id=$1 AND id=$2`,
            [tenantId, id],
          )
        ).rows,
    );
    const r = rows[0];
    if (
      rows.length !== 1 ||
      !r ||
      r.tenant_id !== tenantId ||
      r.id !== id ||
      r.collection !== 'signed-documents' ||
      r.content_type !== 'application/pdf' ||
      r.classification !== 'confidential' ||
      r.checksum_sha256 !== checksum ||
      !text(r.object_key) ||
      !r.object_key.startsWith(`${tenantId}/signed-documents/`) ||
      !Number.isSafeInteger(Number(r.byte_size)) ||
      Number(r.byte_size) <= 0 ||
      Number(r.byte_size) > 50 * 1024 * 1024
    )
      refused();
    const head = await this.s3.headObject(r.object_key);
    if (
      head.metadata?.sha256 !== checksum ||
      head.contentLength !== Number(r.byte_size) ||
      head.contentType !== 'application/pdf'
    )
      refused();
    const url = await this.s3.presignDownloadForTenant({
      key: r.object_key,
      tenantId,
    });
    const reply = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!reply.ok) refused();
    const value = new Uint8Array(await reply.arrayBuffer());
    if (value.length !== Number(r.byte_size) || hash(value) !== checksum)
      refused();
    return value;
  }
  async readEvidence(
    input: SignatureEvidenceAddress,
  ): Promise<StoredSignatureEvidence> {
    this.runtime.assertConfigured();
    try {
      closed(input, [
        'tenantId',
        'evidenceId',
        'documentId',
        'documentKind',
        'signerId',
      ]);
      this.tenant(input.tenantId);
      if (
        !uuid(input.evidenceId) ||
        !text(input.documentId) ||
        !text(input.signerId) ||
        !kinds.has(input.documentKind)
      )
        refused();
      const rows = await this.database.tx(
        async (tx) =>
          (
            await tx.query<Row>(
              `SELECT ${evidenceColumns} FROM storage.signature_evidence
       WHERE tenant_id=$1 AND id=$2 AND document_id=$3 AND document_kind=$4 AND signer_id=$5`,
              [
                input.tenantId,
                input.evidenceId,
                input.documentId,
                input.documentKind,
                input.signerId,
              ],
            )
          ).rows,
      );
      if (rows.length !== 1) refused();
      const r = rows[0]!;
      if (
        r.id !== input.evidenceId ||
        r.tenant_id !== input.tenantId ||
        r.document_id !== input.documentId ||
        r.document_kind !== input.documentKind ||
        r.signer_id !== input.signerId ||
        !uuid(r.original_object_id) ||
        !uuid(r.signed_object_id) ||
        !uuid(r.signature_policy_id) ||
        !text(r.trust_profile_revision) ||
        !text(r.signer_certificate_pem) ||
        !bytes(r.cms_signature) ||
        !hex(r.cms_sha256) ||
        hash(r.cms_signature) !== r.cms_sha256 ||
        !hex(r.original_document_sha256) ||
        !hex(r.signed_document_sha256) ||
        !hex(r.signer_certificate_sha256) ||
        r.verifier_kind !== 'stynx-cms' ||
        !['ADVANCED', 'QUALIFIED'].includes(String(r.achieved_level)) ||
        !['PAdES-B-T', 'PAdES-B-LT', 'PAdES-B-LTA'].includes(
          String(r.pades_profile),
        ) ||
        !['ocsp', 'crl'].includes(String(r.revocation_source)) ||
        !date(r.signed_at) ||
        !date(r.tsa_at) ||
        !date(r.certificate_validated_at) ||
        !text(r.verification_ref)
      )
        refused();
      const c = new X509Certificate(r.signer_certificate_pem);
      if (hash(c.raw) !== r.signer_certificate_sha256) refused();
      return {
        id: r.id as string,
        tenantId: input.tenantId,
        documentId: input.documentId,
        documentKind: input.documentKind,
        signerId: input.signerId,
        policyId: r.signature_policy_id,
        trustProfileRevision: r.trust_profile_revision,
        originalObjectId: r.original_object_id,
        signedObjectId: r.signed_object_id,
        originalDocument: await this.readObject(
          input.tenantId,
          r.original_object_id,
          r.original_document_sha256,
        ),
        signedDocument: await this.readObject(
          input.tenantId,
          r.signed_object_id,
          r.signed_document_sha256,
        ),
        cmsSignature: new Uint8Array(r.cms_signature),
        certificate: {
          subject: c.subject,
          issuer: c.issuer,
          serialNumber: c.serialNumber,
          pem: r.signer_certificate_pem,
        },
        originalDocumentSha256: r.original_document_sha256,
        signedDocumentSha256: r.signed_document_sha256,
        cmsSha256: r.cms_sha256,
        signerCertificateSha256: r.signer_certificate_sha256,
        recorded: {
          achievedLevel:
            r.achieved_level as SignatureTrustProof['achievedLevel'],
          padesProfile: r.pades_profile as SignatureTrustProof['padesProfile'],
          revocationSource:
            r.revocation_source as SignatureTrustProof['revocationSource'],
          signedAt: new Date(r.signed_at),
          tsaAt: new Date(r.tsa_at),
          certificateValidatedAt: new Date(r.certificate_validated_at),
          verificationRef: r.verification_ref,
        },
      };
    } catch {
      return refused();
    }
  }
  async readWithdrawalEvidence(input: {
    tenantId: string;
    documentId: string;
    contentHash: string;
    eligiblePartyIds: readonly string[];
  }): Promise<StoredSignatureEvidence> {
    this.runtime.assertConfigured();
    try {
      closed(input, [
        'tenantId',
        'documentId',
        'contentHash',
        'eligiblePartyIds',
      ]);
      this.tenant(input.tenantId);
      // C03 has no independently approved withdrawal operation-kind source yet.
      // An ordinary signed decision with the same party/hash is not withdrawal evidence.
      return refused();
    } catch {
      return refused();
    }
  }
  async readManifest(
    input: SignatureManifestAddress,
  ): Promise<StoredSignatureManifest> {
    this.runtime.assertConfigured();
    try {
      this.tenant(input.tenantId);
      if (input.kind === 'session-minutes')
        closed(input, [
          'kind',
          'tenantId',
          'sessionId',
          'minutesId',
          'snapshotHash',
        ]);
      else if (input.kind === 'batch-minutes')
        closed(input, ['kind', 'tenantId', 'batchId', 'snapshotHash']);
      else refused();
      if (!hex(input.snapshotHash)) refused();
      const aggregate =
        input.kind === 'session-minutes' ? input.sessionId : input.batchId;
      if (
        !text(aggregate) ||
        (input.kind === 'session-minutes' && !text(input.minutesId))
      )
        refused();
      const rows = await this.database.tx(
        async (tx) =>
          (
            await tx.query<Row>(
              `SELECT id,tenant_id,kind,aggregate_id,document_id,source_object_id,snapshot,snapshot_sha256,
       manifest_sha256,signer_count,manifest_json,created_at FROM storage.signature_manifest WHERE tenant_id=$1 AND kind=$2 AND aggregate_id=$3
       AND snapshot_sha256=$4 ORDER BY signer_count DESC`,
              [input.tenantId, input.kind, aggregate, input.snapshotHash],
            )
          ).rows,
      );
      return await this.manifestRows(rows, input);
    } catch {
      return refused();
    }
  }
  private async manifestRows(
    rows: Row[],
    input: SignatureManifestAddress,
  ): Promise<StoredSignatureManifest> {
    if (!rows.length) refused();
    const r = rows[0]!,
      original = rows.find((row) => row.signer_count === 0);
    const m = r.manifest_json as SignatureManifest;
    if (
      !uuid(r.id) ||
      !original ||
      !date(original.created_at) ||
      !m ||
      m.kind !== input.kind ||
      m.tenantId !== input.tenantId ||
      m.aggregateId !==
        (input.kind === 'session-minutes' ? input.sessionId : input.batchId) ||
      (input.kind === 'session-minutes' &&
        (m.sessionId !== input.sessionId || m.minutesId !== input.minutesId)) ||
      (input.kind === 'batch-minutes' && m.batchId !== input.batchId) ||
      m.snapshotSha256 !== input.snapshotHash ||
      r.tenant_id !== input.tenantId ||
      r.kind !== m.kind ||
      r.aggregate_id !== m.aggregateId ||
      r.document_id !== m.documentId ||
      !uuid(r.source_object_id) ||
      !bytes(r.snapshot) ||
      hash(r.snapshot) !== input.snapshotHash ||
      !hex(m.documentSha256) ||
      !hex(m.manifestSha256) ||
      r.manifest_sha256 !== m.manifestSha256 ||
      !Array.isArray(m.signers) ||
      r.signer_count !== m.signers.length ||
      !Number.isSafeInteger(r.signer_count) ||
      original.source_object_id !== r.source_object_id ||
      original.snapshot_sha256 !== r.snapshot_sha256
    )
      refused();
    const stable = (manifest: SignatureManifest) =>
      Object.fromEntries(
        Object.entries(manifest).filter(
          ([key]) => !['signers', 'manifestSha256', 'sealSha256'].includes(key),
        ),
      );
    const history = new Map<number, SignatureManifest>();
    if (rows.length !== m.signers.length + 1) refused();
    for (const row of rows) {
      const manifest = row.manifest_json as SignatureManifest;
      if (
        !uuid(row.id) ||
        row.tenant_id !== input.tenantId ||
        row.kind !== m.kind ||
        row.aggregate_id !== m.aggregateId ||
        row.document_id !== m.documentId ||
        row.source_object_id !== r.source_object_id ||
        row.snapshot_sha256 !== m.snapshotSha256 ||
        !bytes(row.snapshot) ||
        hash(row.snapshot) !== m.snapshotSha256 ||
        !Number.isSafeInteger(row.signer_count) ||
        Number(row.signer_count) < 0 ||
        history.has(Number(row.signer_count)) ||
        !manifest ||
        !Array.isArray(manifest.signers) ||
        manifest.signers.length !== row.signer_count ||
        row.manifest_sha256 !== manifest.manifestSha256 ||
        !isDeepStrictEqual(stable(manifest), stable(m))
      )
        refused();
      history.set(Number(row.signer_count), manifest);
    }
    for (let count = 0; count <= m.signers.length; count++)
      if (!history.has(count)) refused();
    const sourceDocument = await this.readObject(
      input.tenantId,
      r.source_object_id,
      m.documentSha256,
    );
    const snapshot = new Uint8Array(r.snapshot);
    await this.rebuild(
      m,
      sourceDocument,
      snapshot,
      r.source_object_id,
      history,
    );
    return {
      id: r.id,
      sourceObjectId: r.source_object_id,
      manifest: m,
      sourceDocument,
      snapshot,
      preparedAt: new Date(original.created_at),
    };
  }
  private async artifact(
    tenantId: string,
    entry: { signatureId: string; signerId: string },
    m: SignatureManifest,
    sourceObjectId: string,
  ): Promise<ManifestSignerArtifact> {
    const e = await this.readEvidence({
      tenantId,
      evidenceId: entry.signatureId,
      documentId: sourceObjectId,
      documentKind: m.documentKind,
      signerId: entry.signerId,
    });
    if (e.originalDocumentSha256 !== m.documentSha256) refused();
    const resolved = await this.runtime.resolveRecordedProfile({
      tenantId,
      policyId: e.policyId,
      documentKind: e.documentKind,
      at: e.recorded.signedAt,
    });
    if (resolved.profile.revision !== e.trustProfileRevision) refused();
    return {
      signerId: e.signerId,
      signatureId: e.id,
      signedDocument: e.signedDocument,
      cmsSignature: e.cmsSignature,
      certificate: e.certificate,
      trustProfile: resolved.profile,
    };
  }
  private preparation(
    m: SignatureManifest,
    document: Uint8Array,
    snapshot: Uint8Array,
  ): ManifestPreparation {
    const preparedAt = new Date(m.preparedAt);
    if (!date(preparedAt)) refused();
    return {
      tenantId: m.tenantId,
      aggregateId: m.aggregateId,
      documentId: m.documentId,
      documentKind: m.documentKind,
      document,
      documentSha256: m.documentSha256,
      snapshot,
      snapshotSha256: m.snapshotSha256,
      requiredSignerIds: m.requiredSignerIds,
      preparedAt,
    };
  }
  private async rebuild(
    m: SignatureManifest,
    document: Uint8Array,
    snapshot: Uint8Array,
    sourceObjectId: string,
    history: ReadonlyMap<number, SignatureManifest>,
  ): Promise<void> {
    const original = history.get(0)!;
    const p = this.preparation(original, document, snapshot);
    let rebuilt =
      m.kind === 'session-minutes'
        ? this.manifests.prepareSession({
            ...p,
            sessionId: m.sessionId!,
            minutesId: m.minutesId!,
          })
        : this.manifests.prepareBatch({ ...p, batchId: m.batchId! });
    if (!isDeepStrictEqual(rebuilt, original)) refused();
    for (const [index, entry] of m.signers.entries()) {
      rebuilt = await this.manifests.appendVerifiedSigner(
        rebuilt,
        await this.artifact(m.tenantId, entry, m, sourceObjectId),
        { sourceDocument: document, snapshot },
      );
      if (!isDeepStrictEqual(rebuilt, history.get(index + 1))) refused();
    }
    if (!isDeepStrictEqual(rebuilt, m)) refused();
  }
  async prepareSessionManifest(
    input: ManifestPreparation & {
      sessionId: string;
      minutesId: string;
      idempotencyKey: string | null;
    },
  ): Promise<StoredSignatureManifest> {
    this.runtime.assertConfigured();
    try {
      closed(input, [
        'tenantId',
        'aggregateId',
        'documentId',
        'documentKind',
        'document',
        'documentSha256',
        'snapshot',
        'snapshotSha256',
        'requiredSignerIds',
        'preparedAt',
        'sessionId',
        'minutesId',
        'idempotencyKey',
      ]);
      this.tenant(input.tenantId);
      this.document(input.documentId, input.documentKind);
      if (
        input.aggregateId !== input.sessionId ||
        input.documentKind !== 'SESSION_MINUTES'
      )
        refused();
      const { idempotencyKey, ...publicInput } = input;
      return await this.persistManifest(
        this.manifests.prepareSession(publicInput),
        input.document,
        input.snapshot,
        idempotencyKey,
      );
    } catch {
      return refused();
    }
  }
  async prepareBatchManifest(
    input: ManifestPreparation & {
      batchId: string;
      idempotencyKey: string | null;
    },
  ): Promise<StoredSignatureManifest> {
    this.runtime.assertConfigured();
    try {
      closed(input, [
        'tenantId',
        'aggregateId',
        'documentId',
        'documentKind',
        'document',
        'documentSha256',
        'snapshot',
        'snapshotSha256',
        'requiredSignerIds',
        'preparedAt',
        'batchId',
        'idempotencyKey',
      ]);
      this.tenant(input.tenantId);
      this.document(input.documentId, input.documentKind);
      if (
        input.aggregateId !== input.batchId ||
        input.documentKind !== 'BATCH_DISTRIBUTION_MINUTES'
      )
        refused();
      const { idempotencyKey, ...publicInput } = input;
      return await this.persistManifest(
        this.manifests.prepareBatch(publicInput),
        input.document,
        input.snapshot,
        idempotencyKey,
      );
    } catch {
      return refused();
    }
  }
  private async persistManifest(
    m: SignatureManifest,
    document: Uint8Array,
    snapshot: Uint8Array,
    idempotencyKey: string | null,
  ): Promise<StoredSignatureManifest> {
    if (
      !bytes(document) ||
      !bytes(snapshot) ||
      hash(document) !== m.documentSha256 ||
      hash(snapshot) !== m.snapshotSha256 ||
      !(idempotencyKey === null || text(idempotencyKey))
    )
      refused();
    const uploaded: string[] = [];
    try {
      const key = await this.upload(
        m.tenantId,
        m.documentId,
        m.documentKind,
        document,
        uploaded,
      );
      return await this.database.tx(async (tx) => {
        let objects = (
          await tx.query<Row>(
            `SELECT id,checksum_sha256 FROM storage.objects WHERE tenant_id=$1 AND object_key=$2`,
            [m.tenantId, key],
          )
        ).rows;
        if (!objects.length)
          objects = (
            await tx.query<Row>(
              `INSERT INTO storage.objects(tenant_id,collection,object_key,content_type,byte_size,checksum_sha256,classification)
          VALUES($1,'signed-documents',$2,'application/pdf',$3,$4,'confidential') RETURNING id,checksum_sha256`,
              [m.tenantId, key, document.length, hash(document)],
            )
          ).rows;
        if (
          objects.length !== 1 ||
          !uuid(objects[0]!.id) ||
          objects[0]!.checksum_sha256 !== m.documentSha256
        )
          refused();
        const rows = (
          await tx.query<Row>(
            `INSERT INTO storage.signature_manifest(tenant_id,kind,aggregate_id,document_id,source_object_id,snapshot,snapshot_sha256,
          manifest_sha256,signer_count,manifest_json,idempotency_key,created_by)
          VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11,$12) RETURNING id,created_at`,
            [
              m.tenantId,
              m.kind,
              m.aggregateId,
              m.documentId,
              objects[0]!.id,
              Buffer.from(snapshot),
              m.snapshotSha256,
              m.manifestSha256,
              m.signers.length,
              JSON.stringify(m),
              idempotencyKey,
              this.requestContext.actorId,
            ],
          )
        ).rows;
        if (
          rows.length !== 1 ||
          !uuid(rows[0]!.id) ||
          !date(rows[0]!.created_at)
        )
          refused();
        return {
          id: rows[0]!.id,
          sourceObjectId: objects[0]!.id,
          manifest: m,
          sourceDocument: new Uint8Array(document),
          snapshot: new Uint8Array(snapshot),
          preparedAt: new Date(rows[0]!.created_at),
        };
      });
    } catch {
      if (uploaded.length) this.orphanedUploads.push([...uploaded]);
      return refused();
    }
  }
  async appendManifestSigner(input: {
    tenantId: string;
    manifestId: string;
    evidenceId: string;
  }): Promise<StoredSignatureManifest> {
    this.runtime.assertConfigured();
    try {
      closed(input, ['tenantId', 'manifestId', 'evidenceId']);
      this.tenant(input.tenantId);
      if (!uuid(input.manifestId) || !uuid(input.evidenceId)) refused();
      const rows = await this.database.tx(
        async (tx) =>
          (
            await tx.query<Row>(
              `SELECT kind,aggregate_id,manifest_json FROM storage.signature_manifest WHERE tenant_id=$1 AND id=$2`,
              [input.tenantId, input.manifestId],
            )
          ).rows,
      );
      if (rows.length !== 1) refused();
      const m = rows[0]!.manifest_json as SignatureManifest;
      const address: SignatureManifestAddress =
        m.kind === 'session-minutes'
          ? {
              kind: m.kind,
              tenantId: input.tenantId,
              sessionId: m.sessionId!,
              minutesId: m.minutesId!,
              snapshotHash: m.snapshotSha256,
            }
          : {
              kind: 'batch-minutes',
              tenantId: input.tenantId,
              batchId: m.batchId!,
              snapshotHash: m.snapshotSha256,
            };
      const current = await this.readManifest(address);
      if (current.id !== input.manifestId) refused();
      const evidenceRows = await this.database.tx(
        async (tx) =>
          (
            await tx.query<Row>(
              `SELECT signer_id FROM storage.signature_evidence WHERE tenant_id=$1 AND id=$2`,
              [input.tenantId, input.evidenceId],
            )
          ).rows,
      );
      if (evidenceRows.length !== 1 || !text(evidenceRows[0]!.signer_id))
        refused();
      const artifact = await this.artifact(
        input.tenantId,
        { signatureId: input.evidenceId, signerId: evidenceRows[0]!.signer_id },
        m,
        current.sourceObjectId,
      );
      const next = await this.manifests.appendVerifiedSigner(
        current.manifest,
        artifact,
        { sourceDocument: current.sourceDocument, snapshot: current.snapshot },
      );
      const stored = await this.persistManifest(
        next,
        current.sourceDocument,
        current.snapshot,
        null,
      );
      return { ...stored, preparedAt: current.preparedAt };
    } catch {
      return refused();
    }
  }
  async verifyManifest(
    input: SignatureManifestAddress,
  ): ReturnType<SignatureManifestService['verifyManifest']> {
    this.runtime.assertConfigured();
    try {
      const stored = await this.readManifest(input),
        signers: ManifestSignerArtifact[] = [];
      for (const entry of stored.manifest.signers)
        signers.push(
          await this.artifact(
            input.tenantId,
            entry,
            stored.manifest,
            stored.sourceObjectId,
          ),
        );
      return await this.manifests.verifyManifest({
        manifest: stored.manifest,
        sourceDocument: stored.sourceDocument,
        snapshot: stored.snapshot,
        signers,
      });
    } catch {
      return refused();
    }
  }
}
