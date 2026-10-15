import { createHash, X509Certificate } from 'node:crypto';
import {
  Inject,
  Injectable,
  Optional,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  SignatureService,
  SignatureManifestService,
  SignatureWithdrawalVerifier,
  type SignatureTrustProfile,
  type SignatureTrustProof,
  type VerifyResult,
} from '@stynx-nyx/signature';
import {
  SignedDocumentStore,
  type StoredSignatureEvidence,
} from './signed-document-store.js';
import { SignatureTrustRuntime } from './signature-trust-runtime.js';

import { DetranError } from '../errors/detran-error.js';
import {
  DocumentTrustVerifier,
  type PreparedBatchMinutesManifest,
  type PreparedSessionMinutesManifest,
  type VerifiedBatchMinutesEvidence,
  type VerifiedDraftManifest,
  type VerifiedSessionMinutesEvidence,
  type VerifiedSignatureEvidence,
  type VerifiedWithdrawalEvidence,
} from './document-trust.js';

interface Configuration {
  verifyUrl: string;
  healthUrl: string;
  token: string;
}

function configuration(): Configuration {
  const verifyUrl = process.env.DETRAN_DOCUMENT_TRUST_URL;
  const healthUrl = process.env.DETRAN_DOCUMENT_TRUST_HEALTH_URL;
  const token = process.env.DETRAN_DOCUMENT_TRUST_TOKEN;
  if (!verifyUrl || !healthUrl || !token)
    throw new ServiceUnavailableException(
      'Document trust service is not configured',
    );
  const strict = ['production', 'staging-like'].includes(
    process.env.DETRAN_RUNTIME_PROFILE ?? '',
  );
  for (const [name, value] of [
    ['DETRAN_DOCUMENT_TRUST_URL', verifyUrl],
    ['DETRAN_DOCUMENT_TRUST_HEALTH_URL', healthUrl],
  ] as const) {
    let url: URL;
    try {
      url = new URL(value);
    } catch {
      throw new ServiceUnavailableException(`${name} is not a valid URL`);
    }
    if (strict && url.protocol !== 'https:')
      throw new ServiceUnavailableException(`${name} must use HTTPS`);
  }
  return { verifyUrl, healthUrl, token };
}

function signatureFailure(
  code:
    | 'RAIT.BATCH_SEED_TAMPERED'
    | 'RAIT.SIGNATURE_FAILED'
    | 'RAIT.SIGNATURE_CERT_MISMATCH',
): never {
  const certificateMismatch = code === 'RAIT.SIGNATURE_CERT_MISMATCH';
  const batchTampered = code === 'RAIT.BATCH_SEED_TAMPERED';
  throw new DetranError(code, {
    status: certificateMismatch || batchTampered ? 422 : 502,
    messageKey: `rait.errors.${
      batchTampered
        ? 'batch_seed_tampered'
        : certificateMismatch
          ? 'signature_cert_mismatch'
          : 'signature_failed'
    }`,
    message: 'A evidência documental não pôde ser validada.',
  });
}

async function request(
  url: string,
  init: RequestInit,
): Promise<Record<string, unknown>> {
  const response = await fetch(url, init);
  if (!response.ok)
    throw new ServiceUnavailableException(
      `Document trust service failed with HTTP ${response.status}`,
    );
  return (await response.json()) as Record<string, unknown>;
}

const sha256 = (bytes: Uint8Array) =>
  createHash('sha256').update(bytes).digest('hex');
const validDate = (value: unknown): value is Date =>
  value instanceof Date &&
  Number.isFinite(value.getTime()) &&
  value.getTime() > 0;
function evidenceProof(
  result: VerifyResult,
  evidence: StoredSignatureEvidence,
  profile: SignatureTrustProfile,
  expectedCertificate: string,
): SignatureTrustProof {
  const proof = result.trustProof;
  const cert = new X509Certificate(evidence.certificate.pem!);
  const fingerprint = sha256(cert.raw);
  if (
    fingerprint !== expectedCertificate ||
    evidence.signerCertificateSha256 !== expectedCertificate
  )
    signatureFailure('RAIT.SIGNATURE_CERT_MISMATCH');
  if (
    !proof ||
    result.status !== 'valid' ||
    result.verifierKind !== 'stynx-cms' ||
    result.documentSha256 !== evidence.originalDocumentSha256 ||
    result.signatureLevel !== proof.achievedLevel ||
    !validDate(result.checkedAt) ||
    proof.verifierKind !== 'stynx-cms' ||
    proof.profileId !== evidence.policyId ||
    proof.profileId !== profile.id ||
    proof.profileRevision !== evidence.trustProfileRevision ||
    proof.profileRevision !== profile.revision ||
    !['ADVANCED', 'QUALIFIED'].includes(proof.achievedLevel) ||
    (profile.minimumSignatureLevel === 'QUALIFIED' &&
      proof.achievedLevel !== 'QUALIFIED') ||
    proof.padesProfile !== profile.requiredPadesProfile ||
    proof.padesProfile !== 'PAdES-B-LT' ||
    proof.originalDocumentSha256 !== sha256(evidence.originalDocument) ||
    proof.originalDocumentSha256 !== evidence.originalDocumentSha256 ||
    proof.signedDocumentSha256 !== sha256(evidence.signedDocument) ||
    proof.signedDocumentSha256 !== evidence.signedDocumentSha256 ||
    proof.cmsSha256 !== sha256(evidence.cmsSignature) ||
    proof.cmsSha256 !== evidence.cmsSha256 ||
    proof.signerCertificateSha256 !== fingerprint ||
    cert.subject !== evidence.certificate.subject ||
    cert.issuer !== evidence.certificate.issuer ||
    cert.serialNumber !== evidence.certificate.serialNumber ||
    (result.signerCertificate !== undefined &&
      (!result.signerCertificate?.pem ||
        sha256(new X509Certificate(result.signerCertificate.pem).raw) !==
          fingerprint)) ||
    !Array.isArray(proof.chainSha256) ||
    !proof.chainSha256.length ||
    !proof.chainSha256.every((v) => /^[a-f0-9]{64}$/u.test(v)) ||
    !validDate(proof.signedAt) ||
    !validDate(proof.tsaAt) ||
    !validDate(proof.certificateValidatedAt) ||
    !['ocsp', 'crl'].includes(proof.revocationSource) ||
    (profile.revocation !== 'ocsp-or-crl' &&
      proof.revocationSource !== profile.revocation) ||
    result.revocationSource !== proof.revocationSource ||
    (result.revocationCheckedAt !== undefined &&
      (!validDate(result.revocationCheckedAt) ||
        result.revocationCheckedAt.getTime() !==
          proof.certificateValidatedAt.getTime())) ||
    typeof proof.verificationRef !== 'string' ||
    !proof.verificationRef.trim() ||
    proof.verificationRef !== evidence.recorded.verificationRef ||
    proof.achievedLevel !== evidence.recorded.achievedLevel ||
    proof.padesProfile !== evidence.recorded.padesProfile ||
    proof.revocationSource !== evidence.recorded.revocationSource ||
    !validDate(evidence.recorded.signedAt) ||
    proof.signedAt.getTime() !== evidence.recorded.signedAt.getTime() ||
    !validDate(evidence.recorded.tsaAt) ||
    proof.tsaAt.getTime() !== evidence.recorded.tsaAt.getTime() ||
    !validDate(evidence.recorded.certificateValidatedAt) ||
    proof.certificateValidatedAt.getTime() !==
      evidence.recorded.certificateValidatedAt.getTime() ||
    (profile.requireLta && (proof.lta !== true || !validDate(proof.archiveAt)))
  )
    signatureFailure('RAIT.SIGNATURE_FAILED');
  return proof;
}
function translatedFailure(error: unknown): never {
  if (
    error instanceof DetranError &&
    ['RAIT.SIGNATURE_CERT_MISMATCH', 'RAIT.BATCH_SEED_TAMPERED'].includes(
      error.code,
    )
  )
    throw error;
  return signatureFailure('RAIT.SIGNATURE_FAILED');
}
function projectedProof(proof: SignatureTrustProof) {
  return {
    padesLevel: 'PAdES-B-LT' as const,
    tsaAt: proof.tsaAt.toISOString(),
    certificateValidationSource: (proof.revocationSource === 'ocsp'
      ? 'OCSP'
      : 'CRL') as 'OCSP' | 'CRL',
    certificateValidationStatus: 'GOOD' as const,
    certificateValidatedAt: proof.certificateValidatedAt.toISOString(),
  };
}

@Injectable()
export class DocumentTrustHttpAdapter extends DocumentTrustVerifier {
  constructor(
    @Optional()
    @Inject(SignatureService)
    private readonly signatures?: SignatureService,
    @Optional()
    @Inject(SignatureManifestService)
    private readonly manifests?: SignatureManifestService,
    @Optional()
    @Inject(SignatureWithdrawalVerifier)
    private readonly withdrawals?: SignatureWithdrawalVerifier,
    @Optional()
    @Inject(SignedDocumentStore)
    private readonly documents?: SignedDocumentStore,
    @Optional()
    @Inject(SignatureTrustRuntime)
    private readonly runtime?: SignatureTrustRuntime,
  ) {
    super();
  }
  async checkCapabilities(): Promise<void> {
    if (!this.runtime || !this.signatures)
      throw new ServiceUnavailableException(
        'Signature runtime bindings are unavailable',
      );
    this.runtime.assertConfigured();
    // The public SDK requires a concrete trust profile for readiness. This legacy
    // profile-free API cannot truthfully attest capabilities for an unknown operation.
    throw new ServiceUnavailableException(
      'A concrete signature trust profile is required',
    );
  }

  async prepareSessionMinutesManifest(input: {
    tenantId: string;
    sessionId: string;
    minutesId: string;
    snapshotHash: string;
    snapshotVersion: 'session-minutes-v1';
    requiredSignerPersonIds: readonly string[];
    idempotencyKey: string;
  }): Promise<PreparedSessionMinutesManifest> {
    if (!this.runtime || !this.documents || !this.manifests)
      throw new ServiceUnavailableException(
        'Manifest runtime bindings are unavailable',
      );
    this.runtime.assertConfigured();
    // C02: no committed server-owned original PDF source is available for this operation.
    void input;
    return signatureFailure('RAIT.SIGNATURE_FAILED');
  }

  async getSessionMinutesManifest(input: {
    tenantId: string;
    sessionId: string;
    minutesId: string;
    snapshotHash: string;
  }): Promise<PreparedSessionMinutesManifest> {
    if (!this.runtime || !this.documents || !this.manifests)
      throw new ServiceUnavailableException(
        'Manifest runtime bindings are unavailable',
      );
    this.runtime.assertConfigured();
    try {
      const stored = await this.documents.readManifest({
        kind: 'session-minutes' as const,
        ...input,
      });
      const m = stored.manifest;
      if (
        m.kind !== 'session-minutes' ||
        m.tenantId !== input.tenantId ||
        m.aggregateId !== input.sessionId ||
        m.snapshotSha256 !== input.snapshotHash ||
        m.documentKind !== 'SESSION_MINUTES' ||
        m.manifestVersion !== '1' ||
        !validDate(stored.preparedAt)
      )
        signatureFailure('RAIT.SIGNATURE_FAILED');
      return {
        tenantId: input.tenantId,
        aggregateId: input.sessionId,
        documentId: stored.sourceObjectId,
        contentHash: m.documentSha256,
        snapshotHash: m.snapshotSha256,
        manifestHash: m.manifestSha256,
        documentKind: 'SESSION_MINUTES',
        manifestVersion: 'session-minutes-v1',
        preparedAt: stored.preparedAt.toISOString(),
      };
    } catch (error) {
      return translatedFailure(error);
    }
  }

  async verifySessionMinutesEvidence(input: {
    tenantId: string;
    sessionId: string;
    minutesId: string;
    signatureRef: string;
    documentId: string;
    contentHash: string;
    snapshotHash: string;
    expectedSignerPersonId: string;
  }): Promise<VerifiedSessionMinutesEvidence> {
    if (!this.runtime || !this.documents || !this.signatures || !this.manifests)
      throw new ServiceUnavailableException(
        'Manifest signature runtime bindings are unavailable',
      );
    this.runtime.assertConfigured();
    try {
      const address = {
        kind: 'session-minutes' as const,
        tenantId: input.tenantId,
        sessionId: input.sessionId,
        minutesId: input.minutesId,
        snapshotHash: input.snapshotHash,
      };
      const stored = await this.documents.readManifest(address);
      if (stored.manifest.snapshotSha256 !== input.snapshotHash)
        signatureFailure('RAIT.SIGNATURE_FAILED');
      if (
        stored.sourceObjectId !== input.documentId ||
        stored.manifest.documentSha256 !== input.contentHash ||
        stored.manifest.documentKind !== 'SESSION_MINUTES' ||
        stored.manifest.tenantId !== input.tenantId ||
        stored.manifest.aggregateId !== input.sessionId ||
        !stored.manifest.signers.some(
          (s) =>
            s.signatureId === input.signatureRef &&
            s.signerId === input.expectedSignerPersonId,
        )
      )
        signatureFailure('RAIT.SIGNATURE_FAILED');
      const manifestResult = await this.documents.verifyManifest(address);
      if (manifestResult.status !== 'valid')
        signatureFailure('RAIT.SIGNATURE_FAILED');
      const evidence = await this.documents.readEvidence({
        tenantId: input.tenantId,
        evidenceId: input.signatureRef,
        documentId: input.documentId,
        documentKind: 'SESSION_MINUTES',
        signerId: input.expectedSignerPersonId,
      });
      if (
        evidence.id !== input.signatureRef ||
        evidence.tenantId !== input.tenantId ||
        evidence.documentId !== input.documentId ||
        evidence.documentKind !== 'SESSION_MINUTES' ||
        evidence.signerId !== input.expectedSignerPersonId ||
        evidence.originalDocumentSha256 !== input.contentHash
      )
        signatureFailure('RAIT.SIGNATURE_FAILED');
      const resolved = await this.runtime.resolveRecordedProfile({
        tenantId: input.tenantId,
        policyId: evidence.policyId,
        documentKind: evidence.documentKind,
        at: evidence.recorded.signedAt,
      });
      if (
        resolved.policyId !== evidence.policyId ||
        resolved.profile.revision !== evidence.trustProfileRevision
      )
        signatureFailure('RAIT.SIGNATURE_FAILED');
      const expected = await this.runtime.resolveSignerCertificate(
        input.tenantId,
        input.expectedSignerPersonId,
      );
      const readiness = await this.signatures.checkReadiness(resolved.profile);
      if (readiness.ok !== true || readiness.verifierKind !== 'stynx-cms')
        signatureFailure('RAIT.SIGNATURE_FAILED');
      const result = await this.signatures.verify({
        tenantId: input.tenantId,
        document: evidence.originalDocument,
        documentSha256: evidence.originalDocumentSha256,
        signedDocument: evidence.signedDocument,
        cmsSignature: evidence.cmsSignature,
        certificate: evidence.certificate,
        minimumSignatureLevel: resolved.profile.minimumSignatureLevel,
        trustProfile: resolved.profile,
      });
      const proof = evidenceProof(result, evidence, resolved.profile, expected);
      return {
        tenantId: input.tenantId,
        sessionId: input.sessionId,
        minutesId: input.minutesId,
        signatureRef: evidence.id,
        signerPersonId: evidence.signerId,
        documentId: evidence.documentId,
        contentHash: evidence.originalDocumentSha256,
        snapshotHash: input.snapshotHash,
        documentKind: 'SESSION_MINUTES',
        tsaValidationStatus: 'GOOD',
        ...projectedProof(proof),
      };
    } catch (error) {
      return translatedFailure(error);
    }
  }

  async prepareBatchMinutesManifest(input: {
    tenantId: string;
    batchId: string;
    snapshotHash: string;
    snapshotVersion: 'draw-v1';
    idempotencyKey: string;
  }): Promise<PreparedBatchMinutesManifest> {
    if (!this.runtime || !this.documents || !this.manifests)
      throw new ServiceUnavailableException(
        'Manifest runtime bindings are unavailable',
      );
    this.runtime.assertConfigured();
    // C02: no committed server-owned original PDF source is available for this operation.
    void input;
    return signatureFailure('RAIT.SIGNATURE_FAILED');
  }

  async getBatchMinutesManifest(input: {
    tenantId: string;
    batchId: string;
    snapshotHash: string;
  }): Promise<PreparedBatchMinutesManifest> {
    if (!this.runtime || !this.documents || !this.manifests)
      throw new ServiceUnavailableException(
        'Manifest runtime bindings are unavailable',
      );
    this.runtime.assertConfigured();
    try {
      const stored = await this.documents.readManifest({
        kind: 'batch-minutes' as const,
        ...input,
      });
      const m = stored.manifest;
      if (
        m.kind !== 'batch-minutes' ||
        m.tenantId !== input.tenantId ||
        m.aggregateId !== input.batchId ||
        m.snapshotSha256 !== input.snapshotHash ||
        m.documentKind !== 'BATCH_DISTRIBUTION_MINUTES' ||
        m.manifestVersion !== '1' ||
        !validDate(stored.preparedAt)
      )
        signatureFailure('RAIT.SIGNATURE_FAILED');
      return {
        tenantId: input.tenantId,
        aggregateId: input.batchId,
        documentId: stored.sourceObjectId,
        contentHash: m.documentSha256,
        snapshotHash: m.snapshotSha256,
        manifestHash: m.manifestSha256,
        documentKind: 'BATCH_DISTRIBUTION_MINUTES',
        manifestVersion: 'draw-v1',
        preparedAt: stored.preparedAt.toISOString(),
      };
    } catch (error) {
      return translatedFailure(error);
    }
  }

  async verifyDraftManifest(input: {
    tenantId: string;
    documentId: string;
    contentHash: string;
  }): Promise<VerifiedDraftManifest> {
    const config = configuration();
    const receipt = await request(config.verifyUrl, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${config.token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ kind: 'draft-manifest', ...input }),
      signal: AbortSignal.timeout(15_000),
    });
    if (
      receipt.documentId !== input.documentId ||
      receipt.contentHash !== input.contentHash ||
      receipt.kind !== 'DECISAO_DEFESA' ||
      !Array.isArray(receipt.sections) ||
      receipt.sections.length !== 3 ||
      !['fatos', 'fundamentos', 'dispositivo'].every(
        (section, index) =>
          (receipt.sections as unknown[] | undefined)?.[index] === section,
      )
    )
      signatureFailure('RAIT.SIGNATURE_FAILED');
    return receipt as unknown as VerifiedDraftManifest;
  }

  async verifySignatureEvidence(input: {
    tenantId: string;
    signatureRef: string;
    documentId: string;
    contentHash: string;
    expectedSignerPersonId: string;
  }): Promise<VerifiedSignatureEvidence> {
    if (!this.runtime || !this.documents || !this.signatures)
      throw new ServiceUnavailableException(
        'Signature runtime bindings are unavailable',
      );
    this.runtime.assertConfigured();
    try {
      const evidence = await this.documents.readEvidence({
        tenantId: input.tenantId,
        evidenceId: input.signatureRef,
        documentId: input.documentId,
        documentKind: 'DECISAO_DEFESA',
        signerId: input.expectedSignerPersonId,
      });
      if (
        evidence.id !== input.signatureRef ||
        evidence.tenantId !== input.tenantId ||
        evidence.documentId !== input.documentId ||
        evidence.documentKind !== 'DECISAO_DEFESA' ||
        evidence.signerId !== input.expectedSignerPersonId ||
        evidence.originalDocumentSha256 !== input.contentHash
      )
        signatureFailure('RAIT.SIGNATURE_FAILED');
      const resolved = await this.runtime.resolveRecordedProfile({
        tenantId: input.tenantId,
        policyId: evidence.policyId,
        documentKind: evidence.documentKind,
        at: evidence.recorded.signedAt,
      });
      if (
        resolved.policyId !== evidence.policyId ||
        resolved.profile.revision !== evidence.trustProfileRevision
      )
        signatureFailure('RAIT.SIGNATURE_FAILED');
      const expected = await this.runtime.resolveSignerCertificate(
        input.tenantId,
        input.expectedSignerPersonId,
      );
      const readiness = await this.signatures.checkReadiness(resolved.profile);
      if (readiness.ok !== true || readiness.verifierKind !== 'stynx-cms')
        signatureFailure('RAIT.SIGNATURE_FAILED');
      const result = await this.signatures.verify({
        tenantId: input.tenantId,
        document: evidence.originalDocument,
        documentSha256: evidence.originalDocumentSha256,
        signedDocument: evidence.signedDocument,
        cmsSignature: evidence.cmsSignature,
        certificate: evidence.certificate,
        minimumSignatureLevel: resolved.profile.minimumSignatureLevel,
        trustProfile: resolved.profile,
      });
      const proof = evidenceProof(result, evidence, resolved.profile, expected);
      return {
        signatureRef: evidence.id,
        signerPersonId: evidence.signerId,
        documentId: evidence.documentId,
        contentHash: evidence.originalDocumentSha256,
        documentKind: 'DECISAO_DEFESA',
        ...projectedProof(proof),
      };
    } catch (error) {
      return translatedFailure(error);
    }
  }

  async verifyBatchMinutesEvidence(input: {
    tenantId: string;
    batchId: string;
    signatureRef: string;
    documentId: string;
    contentHash: string;
    snapshotHash: string;
    expectedSignerPersonId: string;
  }): Promise<VerifiedBatchMinutesEvidence> {
    if (!this.runtime || !this.documents || !this.signatures || !this.manifests)
      throw new ServiceUnavailableException(
        'Manifest signature runtime bindings are unavailable',
      );
    this.runtime.assertConfigured();
    try {
      const address = {
        kind: 'batch-minutes' as const,
        tenantId: input.tenantId,
        batchId: input.batchId,
        snapshotHash: input.snapshotHash,
      };
      const stored = await this.documents.readManifest(address);
      if (stored.manifest.snapshotSha256 !== input.snapshotHash)
        signatureFailure('RAIT.BATCH_SEED_TAMPERED');
      if (
        stored.sourceObjectId !== input.documentId ||
        stored.manifest.documentSha256 !== input.contentHash ||
        stored.manifest.documentKind !== 'BATCH_DISTRIBUTION_MINUTES' ||
        stored.manifest.tenantId !== input.tenantId ||
        stored.manifest.aggregateId !== input.batchId ||
        !stored.manifest.signers.some(
          (s) =>
            s.signatureId === input.signatureRef &&
            s.signerId === input.expectedSignerPersonId,
        )
      )
        signatureFailure('RAIT.SIGNATURE_FAILED');
      const manifestResult = await this.documents.verifyManifest(address);
      if (manifestResult.status !== 'valid')
        signatureFailure('RAIT.SIGNATURE_FAILED');
      const evidence = await this.documents.readEvidence({
        tenantId: input.tenantId,
        evidenceId: input.signatureRef,
        documentId: input.documentId,
        documentKind: 'BATCH_DISTRIBUTION_MINUTES',
        signerId: input.expectedSignerPersonId,
      });
      if (
        evidence.id !== input.signatureRef ||
        evidence.tenantId !== input.tenantId ||
        evidence.documentId !== input.documentId ||
        evidence.documentKind !== 'BATCH_DISTRIBUTION_MINUTES' ||
        evidence.signerId !== input.expectedSignerPersonId ||
        evidence.originalDocumentSha256 !== input.contentHash
      )
        signatureFailure('RAIT.SIGNATURE_FAILED');
      const resolved = await this.runtime.resolveRecordedProfile({
        tenantId: input.tenantId,
        policyId: evidence.policyId,
        documentKind: evidence.documentKind,
        at: evidence.recorded.signedAt,
      });
      if (
        resolved.policyId !== evidence.policyId ||
        resolved.profile.revision !== evidence.trustProfileRevision
      )
        signatureFailure('RAIT.SIGNATURE_FAILED');
      const expected = await this.runtime.resolveSignerCertificate(
        input.tenantId,
        input.expectedSignerPersonId,
      );
      const readiness = await this.signatures.checkReadiness(resolved.profile);
      if (readiness.ok !== true || readiness.verifierKind !== 'stynx-cms')
        signatureFailure('RAIT.SIGNATURE_FAILED');
      const result = await this.signatures.verify({
        tenantId: input.tenantId,
        document: evidence.originalDocument,
        documentSha256: evidence.originalDocumentSha256,
        signedDocument: evidence.signedDocument,
        cmsSignature: evidence.cmsSignature,
        certificate: evidence.certificate,
        minimumSignatureLevel: resolved.profile.minimumSignatureLevel,
        trustProfile: resolved.profile,
      });
      const proof = evidenceProof(result, evidence, resolved.profile, expected);
      return {
        tenantId: input.tenantId,
        batchId: input.batchId,
        signatureRef: evidence.id,
        signerPersonId: evidence.signerId,
        documentId: evidence.documentId,
        contentHash: evidence.originalDocumentSha256,
        snapshotHash: input.snapshotHash,
        documentKind: 'BATCH_DISTRIBUTION_MINUTES',
        tsaValidationStatus: 'GOOD',
        ...projectedProof(proof),
      };
    } catch (error) {
      return translatedFailure(error);
    }
  }

  async verifyWithdrawalEvidence(input: {
    tenantId: string;
    caseId: string;
    documentId: string;
    contentHash: string;
    eligiblePartyIds: readonly string[];
  }): Promise<VerifiedWithdrawalEvidence> {
    if (!this.runtime || !this.documents || !this.withdrawals)
      throw new ServiceUnavailableException(
        'Withdrawal runtime bindings are unavailable',
      );
    this.runtime.assertConfigured();
    try {
      await this.documents.readWithdrawalEvidence({
        tenantId: input.tenantId,
        documentId: input.documentId,
        contentHash: input.contentHash,
        eligiblePartyIds: input.eligiblePartyIds,
      });
      // C03 remains closed until an independent authoritative withdrawal species exists.
      return signatureFailure('RAIT.SIGNATURE_FAILED');
    } catch (error) {
      return translatedFailure(error);
    }
  }
}
