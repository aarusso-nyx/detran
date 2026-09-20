import { Injectable, ServiceUnavailableException } from '@nestjs/common';

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

@Injectable()
export class DocumentTrustHttpAdapter extends DocumentTrustVerifier {
  async checkCapabilities(): Promise<void> {
    const config = configuration();
    const receipt = await request(config.healthUrl, {
      headers: { authorization: `Bearer ${config.token}` },
      signal: AbortSignal.timeout(5_000),
    });
    if (
      receipt.documentManifest !== true ||
      receipt.padesLt !== true ||
      receipt.tsa !== true ||
      receipt.withdrawalEvidence !== true ||
      !Array.isArray(receipt.certificateValidation) ||
      !receipt.certificateValidation.some((source) =>
        ['OCSP', 'CRL'].includes(String(source)),
      )
    )
      throw new ServiceUnavailableException(
        'Document trust service lacks required capabilities',
      );
  }

  private async checkBatchMinutesCapabilities(
    config: Configuration,
  ): Promise<void> {
    const receipt = await request(config.healthUrl, {
      headers: { authorization: `Bearer ${config.token}` },
      signal: AbortSignal.timeout(5_000),
    });
    if (
      receipt.batchDistributionMinutes !== true ||
      receipt.padesLt !== true ||
      receipt.tsa !== true ||
      !Array.isArray(receipt.certificateValidation) ||
      !receipt.certificateValidation.some((source) =>
        ['OCSP', 'CRL'].includes(String(source)),
      )
    )
      throw new ServiceUnavailableException(
        'Document trust service lacks batch-minutes capabilities',
      );
  }

  private async checkSessionMinutesCapabilities(
    config: Configuration,
  ): Promise<void> {
    const receipt = await request(config.healthUrl, {
      headers: { authorization: `Bearer ${config.token}` },
      signal: AbortSignal.timeout(5_000),
    });
    if (
      receipt.sessionMinutes !== true ||
      receipt.multipleReceipts !== true ||
      receipt.recoverableManifest !== true ||
      receipt.padesLt !== true ||
      receipt.tsa !== true ||
      !Array.isArray(receipt.certificateValidation) ||
      !receipt.certificateValidation.some((source) =>
        ['OCSP', 'CRL'].includes(String(source)),
      )
    )
      signatureFailure('RAIT.SIGNATURE_FAILED');
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
    const config = configuration();
    await this.checkSessionMinutesCapabilities(config);
    const receipt = await request(config.verifyUrl, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${config.token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ kind: 'session-minutes-manifest', ...input }),
      signal: AbortSignal.timeout(15_000),
    });
    return validateSessionMinutesManifest(receipt, input);
  }

  async getSessionMinutesManifest(input: {
    tenantId: string;
    sessionId: string;
    minutesId: string;
    snapshotHash: string;
  }): Promise<PreparedSessionMinutesManifest> {
    const config = configuration();
    await this.checkSessionMinutesCapabilities(config);
    const receipt = await request(config.verifyUrl, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${config.token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ kind: 'get-session-minutes-manifest', ...input }),
      signal: AbortSignal.timeout(15_000),
    });
    return validateSessionMinutesManifest(receipt, input);
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
    const config = configuration();
    await this.checkSessionMinutesCapabilities(config);
    const receipt = await request(config.verifyUrl, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${config.token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ kind: 'session-minutes-evidence', ...input }),
      signal: AbortSignal.timeout(15_000),
    });
    if (
      receipt.tenantId !== input.tenantId ||
      receipt.sessionId !== input.sessionId ||
      receipt.minutesId !== input.minutesId ||
      receipt.signatureRef !== input.signatureRef ||
      receipt.documentId !== input.documentId ||
      receipt.contentHash !== input.contentHash ||
      receipt.snapshotHash !== input.snapshotHash ||
      receipt.documentKind !== 'SESSION_MINUTES' ||
      receipt.signerPersonId !== input.expectedSignerPersonId ||
      receipt.padesLevel !== 'PAdES-B-LT' ||
      receipt.tsaValidationStatus !== 'GOOD' ||
      typeof receipt.tsaAt !== 'string' ||
      !receipt.tsaAt
    )
      signatureFailure('RAIT.SIGNATURE_FAILED');
    if (
      receipt.certificateValidationStatus !== 'GOOD' ||
      !['OCSP', 'CRL'].includes(String(receipt.certificateValidationSource)) ||
      typeof receipt.certificateValidatedAt !== 'string' ||
      !receipt.certificateValidatedAt
    )
      signatureFailure('RAIT.SIGNATURE_CERT_MISMATCH');
    return receipt as unknown as VerifiedSessionMinutesEvidence;
  }

  async prepareBatchMinutesManifest(input: {
    tenantId: string;
    batchId: string;
    snapshotHash: string;
    snapshotVersion: 'draw-v1';
    idempotencyKey: string;
  }): Promise<PreparedBatchMinutesManifest> {
    const config = configuration();
    await this.checkBatchMinutesCapabilities(config);
    const receipt = await request(config.verifyUrl, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${config.token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        kind: 'prepare-batch-minutes-manifest',
        ...input,
      }),
      signal: AbortSignal.timeout(15_000),
    });
    return validateBatchMinutesManifest(receipt, input);
  }

  async getBatchMinutesManifest(input: {
    tenantId: string;
    batchId: string;
    snapshotHash: string;
  }): Promise<PreparedBatchMinutesManifest> {
    const config = configuration();
    await this.checkBatchMinutesCapabilities(config);
    const receipt = await request(config.verifyUrl, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${config.token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ kind: 'get-batch-minutes-manifest', ...input }),
      signal: AbortSignal.timeout(15_000),
    });
    return validateBatchMinutesManifest(receipt, input);
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
    const config = configuration();
    const receipt = await request(config.verifyUrl, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${config.token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ kind: 'signature-evidence', ...input }),
      signal: AbortSignal.timeout(15_000),
    });
    if (
      receipt.signerPersonId !== input.expectedSignerPersonId ||
      receipt.certificateValidationStatus !== 'GOOD' ||
      !['OCSP', 'CRL'].includes(String(receipt.certificateValidationSource)) ||
      typeof receipt.certificateValidatedAt !== 'string' ||
      !receipt.certificateValidatedAt
    )
      signatureFailure('RAIT.SIGNATURE_CERT_MISMATCH');
    if (
      receipt.signatureRef !== input.signatureRef ||
      receipt.documentId !== input.documentId ||
      receipt.contentHash !== input.contentHash ||
      receipt.documentKind !== 'DECISAO_DEFESA' ||
      receipt.padesLevel !== 'PAdES-B-LT' ||
      typeof receipt.tsaAt !== 'string' ||
      !receipt.tsaAt
    )
      signatureFailure('RAIT.SIGNATURE_FAILED');
    return receipt as unknown as VerifiedSignatureEvidence;
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
    const config = configuration();
    await this.checkBatchMinutesCapabilities(config);
    const receipt = await request(config.verifyUrl, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${config.token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ kind: 'batch-minutes-evidence', ...input }),
      signal: AbortSignal.timeout(15_000),
    });
    if (receipt.snapshotHash !== input.snapshotHash)
      signatureFailure('RAIT.BATCH_SEED_TAMPERED');
    if (
      receipt.signerPersonId !== input.expectedSignerPersonId ||
      receipt.certificateValidationStatus !== 'GOOD' ||
      !['OCSP', 'CRL'].includes(String(receipt.certificateValidationSource)) ||
      typeof receipt.certificateValidatedAt !== 'string' ||
      !receipt.certificateValidatedAt
    )
      signatureFailure('RAIT.SIGNATURE_CERT_MISMATCH');
    if (
      receipt.tenantId !== input.tenantId ||
      receipt.batchId !== input.batchId ||
      receipt.signatureRef !== input.signatureRef ||
      typeof receipt.signatureRef !== 'string' ||
      !receipt.signatureRef.trim() ||
      receipt.documentId !== input.documentId ||
      receipt.contentHash !== input.contentHash ||
      receipt.documentKind !== 'BATCH_DISTRIBUTION_MINUTES' ||
      receipt.padesLevel !== 'PAdES-B-LT' ||
      typeof receipt.tsaAt !== 'string' ||
      !receipt.tsaAt ||
      receipt.tsaValidationStatus !== 'GOOD'
    )
      signatureFailure('RAIT.SIGNATURE_FAILED');
    return receipt as unknown as VerifiedBatchMinutesEvidence;
  }

  async verifyWithdrawalEvidence(input: {
    tenantId: string;
    caseId: string;
    documentId: string;
    contentHash: string;
    eligiblePartyIds: readonly string[];
  }): Promise<VerifiedWithdrawalEvidence> {
    const config = configuration();
    await this.checkCapabilities();
    const receipt = await request(config.verifyUrl, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${config.token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ kind: 'withdrawal-evidence', ...input }),
      signal: AbortSignal.timeout(15_000),
    });
    if (
      receipt.tenantId !== input.tenantId ||
      receipt.caseId !== input.caseId ||
      receipt.documentId !== input.documentId ||
      receipt.contentHash !== input.contentHash ||
      typeof receipt.signerPartyId !== 'string' ||
      !input.eligiblePartyIds.includes(receipt.signerPartyId) ||
      !['physical_verified', 'digital_verified'].includes(
        String(receipt.verificationMethod),
      ) ||
      typeof receipt.evidenceRef !== 'string' ||
      !receipt.evidenceRef.trim() ||
      typeof receipt.verifiedAt !== 'string' ||
      !receipt.verifiedAt
    )
      signatureFailure('RAIT.SIGNATURE_FAILED');
    return receipt as unknown as VerifiedWithdrawalEvidence;
  }
}

function validateBatchMinutesManifest(
  receipt: Record<string, unknown>,
  input: { tenantId: string; batchId: string; snapshotHash: string },
): PreparedBatchMinutesManifest {
  const hash = (value: unknown) =>
    typeof value === 'string' && /^[a-f0-9]{64}$/u.test(value);
  if (
    receipt.tenantId !== input.tenantId ||
    receipt.aggregateId !== input.batchId ||
    receipt.snapshotHash !== input.snapshotHash ||
    !hash(receipt.contentHash) ||
    !hash(receipt.manifestHash) ||
    typeof receipt.documentId !== 'string' ||
    !receipt.documentId ||
    receipt.documentKind !== 'BATCH_DISTRIBUTION_MINUTES' ||
    typeof receipt.manifestVersion !== 'string' ||
    !receipt.manifestVersion.trim() ||
    typeof receipt.preparedAt !== 'string' ||
    !receipt.preparedAt
  )
    signatureFailure('RAIT.SIGNATURE_FAILED');
  return receipt as unknown as PreparedBatchMinutesManifest;
}

function validateSessionMinutesManifest(
  receipt: Record<string, unknown>,
  input: { tenantId: string; sessionId: string; snapshotHash: string },
): PreparedSessionMinutesManifest {
  const hash = (value: unknown) =>
    typeof value === 'string' && /^[a-f0-9]{64}$/u.test(value);
  if (
    receipt.tenantId !== input.tenantId ||
    receipt.aggregateId !== input.sessionId ||
    receipt.snapshotHash !== input.snapshotHash ||
    !hash(receipt.contentHash) ||
    !hash(receipt.manifestHash) ||
    typeof receipt.documentId !== 'string' ||
    !receipt.documentId ||
    receipt.documentKind !== 'SESSION_MINUTES' ||
    receipt.manifestVersion !== 'session-minutes-v1' ||
    typeof receipt.preparedAt !== 'string' ||
    !receipt.preparedAt
  )
    signatureFailure('RAIT.SIGNATURE_FAILED');
  return receipt as unknown as PreparedSessionMinutesManifest;
}
