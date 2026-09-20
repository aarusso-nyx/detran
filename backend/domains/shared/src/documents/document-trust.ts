export interface VerifiedDraftManifest {
  documentId: string;
  contentHash: string;
  kind: 'DECISAO_DEFESA';
  sections: readonly ['fatos', 'fundamentos', 'dispositivo'];
}

export interface VerifiedSignatureEvidence {
  signatureRef: string;
  documentId: string;
  contentHash: string;
  signerPersonId: string;
  documentKind: 'DECISAO_DEFESA';
  padesLevel: 'PAdES-B-LT';
  tsaAt: string;
  certificateValidationSource: 'OCSP' | 'CRL';
  certificateValidationStatus: 'GOOD';
  certificateValidatedAt: string;
}

/**
 * Receipt returned by the document-trust service for a distribution-minutes
 * signature. This is deliberately distinct from a defence-decision receipt:
 * the immutable draw snapshot is part of the evidence that is attested.
 */
export interface VerifiedBatchMinutesEvidence {
  tenantId: string;
  batchId: string;
  signatureRef: string;
  documentId: string;
  contentHash: string;
  snapshotHash: string;
  documentKind: 'BATCH_DISTRIBUTION_MINUTES';
  signerPersonId: string;
  padesLevel: 'PAdES-B-LT';
  tsaAt: string;
  tsaValidationStatus: 'GOOD';
  certificateValidationSource: 'OCSP' | 'CRL';
  certificateValidationStatus: 'GOOD';
  certificateValidatedAt: string;
}

/**
 * Server-owned manifestation used to bind a distribution minutes document to
 * one immutable draw snapshot.  Callers never provide the document or hashes:
 * the document-trust boundary derives them from the aggregate.
 */
export interface PreparedBatchMinutesManifest {
  tenantId: string;
  aggregateId: string;
  documentId: string;
  contentHash: string;
  snapshotHash: string;
  manifestHash: string;
  documentKind: 'BATCH_DISTRIBUTION_MINUTES';
  manifestVersion: string;
  preparedAt: string;
}

/**
 * Server-owned manifestation for an immutable session minutes snapshot.  It
 * deliberately carries the session and minutes identities separately: unlike
 * a distribution batch, the multi-signature set is part of the session
 * evidence contract.
 */
export interface PreparedSessionMinutesManifest {
  tenantId: string;
  aggregateId: string;
  documentId: string;
  contentHash: string;
  snapshotHash: string;
  manifestHash: string;
  documentKind: 'SESSION_MINUTES';
  manifestVersion: 'session-minutes-v1';
  preparedAt: string;
}

export interface VerifiedSessionMinutesEvidence {
  tenantId: string;
  sessionId: string;
  minutesId: string;
  signatureRef: string;
  documentId: string;
  contentHash: string;
  snapshotHash: string;
  documentKind: 'SESSION_MINUTES';
  signerPersonId: string;
  padesLevel: 'PAdES-B-LT';
  tsaAt: string;
  tsaValidationStatus: 'GOOD';
  certificateValidationSource: 'OCSP' | 'CRL';
  certificateValidationStatus: 'GOOD';
  certificateValidatedAt: string;
}

export interface VerifiedWithdrawalEvidence {
  tenantId: string;
  caseId: string;
  documentId: string;
  contentHash: string;
  signerPartyId: string;
  verificationMethod: 'physical_verified' | 'digital_verified';
  evidenceRef: string;
  verifiedAt: string;
}

/** Runtime injection token for the platform document-trust boundary. */
export abstract class DocumentTrustVerifier {
  prepareSessionMinutesManifest(input: {
    tenantId: string;
    sessionId: string;
    minutesId: string;
    snapshotHash: string;
    snapshotVersion: 'session-minutes-v1';
    requiredSignerPersonIds: readonly string[];
    idempotencyKey: string;
  }): Promise<PreparedSessionMinutesManifest> {
    return Promise.reject(
      new Error(`Session-minutes trust is unavailable for ${input.sessionId}`),
    );
  }

  getSessionMinutesManifest(input: {
    tenantId: string;
    sessionId: string;
    minutesId: string;
    snapshotHash: string;
  }): Promise<PreparedSessionMinutesManifest> {
    return Promise.reject(
      new Error(`Session-minutes trust is unavailable for ${input.sessionId}`),
    );
  }

  verifySessionMinutesEvidence(input: {
    tenantId: string;
    sessionId: string;
    minutesId: string;
    signatureRef: string;
    documentId: string;
    contentHash: string;
    snapshotHash: string;
    expectedSignerPersonId: string;
  }): Promise<VerifiedSessionMinutesEvidence> {
    return Promise.reject(
      new Error(`Session-minutes trust is unavailable for ${input.minutesId}`),
    );
  }

  abstract prepareBatchMinutesManifest(input: {
    tenantId: string;
    batchId: string;
    snapshotHash: string;
    snapshotVersion: 'draw-v1';
    idempotencyKey: string;
  }): Promise<PreparedBatchMinutesManifest>;

  abstract getBatchMinutesManifest(input: {
    tenantId: string;
    batchId: string;
    snapshotHash: string;
  }): Promise<PreparedBatchMinutesManifest>;

  abstract verifyDraftManifest(input: {
    tenantId: string;
    documentId: string;
    contentHash: string;
  }): Promise<VerifiedDraftManifest>;

  abstract verifySignatureEvidence(input: {
    tenantId: string;
    signatureRef: string;
    documentId: string;
    contentHash: string;
    expectedSignerPersonId: string;
  }): Promise<VerifiedSignatureEvidence>;

  abstract verifyBatchMinutesEvidence(input: {
    tenantId: string;
    batchId: string;
    signatureRef: string;
    documentId: string;
    contentHash: string;
    snapshotHash: string;
    expectedSignerPersonId: string;
  }): Promise<VerifiedBatchMinutesEvidence>;

  abstract verifyWithdrawalEvidence(input: {
    tenantId: string;
    caseId: string;
    documentId: string;
    contentHash: string;
    eligiblePartyIds: readonly string[];
  }): Promise<VerifiedWithdrawalEvidence>;
}
