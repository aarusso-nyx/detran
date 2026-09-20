import { Injectable } from '@nestjs/common';
import {
  DocumentTrustHttpAdapter,
  DocumentTrustVerifier,
  type PreparedBatchMinutesManifest,
  type VerifiedBatchMinutesEvidence,
  type VerifiedDraftManifest,
  type VerifiedSignatureEvidence,
  type VerifiedWithdrawalEvidence,
} from '@detran/shared';

export { DocumentTrustHttpAdapter };

/** RAIT-local provider over the shared, fail-closed document trust adapter. */
@Injectable()
export class RaitDocumentTrustVerifier extends DocumentTrustVerifier {
  constructor(private readonly adapter: DocumentTrustHttpAdapter) {
    super();
  }

  verifyDraftManifest(input: {
    tenantId: string;
    documentId: string;
    contentHash: string;
  }): Promise<VerifiedDraftManifest> {
    return this.adapter.verifyDraftManifest(input);
  }

  verifySignatureEvidence(input: {
    tenantId: string;
    signatureRef: string;
    documentId: string;
    contentHash: string;
    expectedSignerPersonId: string;
  }): Promise<VerifiedSignatureEvidence> {
    return this.adapter.verifySignatureEvidence(input);
  }

  prepareBatchMinutesManifest(input: {
    tenantId: string;
    batchId: string;
    snapshotHash: string;
    snapshotVersion: 'draw-v1';
    idempotencyKey: string;
  }): Promise<PreparedBatchMinutesManifest> {
    return this.adapter.prepareBatchMinutesManifest(input);
  }

  getBatchMinutesManifest(input: {
    tenantId: string;
    batchId: string;
    snapshotHash: string;
  }): Promise<PreparedBatchMinutesManifest> {
    return this.adapter.getBatchMinutesManifest(input);
  }

  verifyBatchMinutesEvidence(input: {
    tenantId: string;
    batchId: string;
    signatureRef: string;
    documentId: string;
    contentHash: string;
    snapshotHash: string;
    expectedSignerPersonId: string;
  }): Promise<VerifiedBatchMinutesEvidence> {
    return this.adapter.verifyBatchMinutesEvidence(input);
  }

  verifyWithdrawalEvidence(input: {
    tenantId: string;
    caseId: string;
    documentId: string;
    contentHash: string;
    eligiblePartyIds: readonly string[];
  }): Promise<VerifiedWithdrawalEvidence> {
    return this.adapter.verifyWithdrawalEvidence(input);
  }
}
