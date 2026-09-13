import { Injectable, ServiceUnavailableException } from '@nestjs/common';

import {
  PEC_BIOMETRIC_PROCESSING_POLICY,
  type PecBiometricProcessingPurpose,
} from './biometric-processing-policy.js';

export interface BiometricVerificationRequest {
  providerCode: string;
  stationId: string;
  deviceCertificateFingerprint: string;
  captureReference: string;
  modality: 'FINGERPRINT' | 'FACE';
  kind: 'CHECKIN' | 'MEDICAL' | 'PSYCH';
  subjectReference: { patientId?: string; professionalId?: string };
}

export interface BiometricVerificationReceipt {
  passed: boolean;
  score: number | null;
  lfdScore: number | null;
  evidenceDocumentId: string;
  evidenceSha256: string;
  reason: string | null;
}

@Injectable()
export class BiometricVerificationHttpAdapter {
  async verify(
    request: BiometricVerificationRequest,
  ): Promise<BiometricVerificationReceipt> {
    const endpoint = process.env.DETRAN_BIOMETRIC_VERIFICATION_URL;
    const credential = process.env.DETRAN_BIOMETRIC_VERIFICATION_TOKEN;
    const processorContractId =
      process.env.DETRAN_BIOMETRIC_PROCESSOR_CONTRACT_ID;
    if (!endpoint || !credential || !processorContractId) {
      throw new ServiceUnavailableException(
        'Biometric verification provider and processor contract are not configured',
      );
    }
    const processingPurpose = this.processingPurpose(request);
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${credential}`,
        'content-type': 'application/json',
        'x-processing-contract-id': processorContractId,
        'x-processing-legal-basis': PEC_BIOMETRIC_PROCESSING_POLICY.legalBasis,
        'x-processing-purpose': processingPurpose,
      },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      throw new ServiceUnavailableException(
        `Biometric verification failed with HTTP ${response.status}`,
      );
    }
    const receipt =
      (await response.json()) as Partial<BiometricVerificationReceipt>;
    const validScore = (score: unknown) =>
      score === null ||
      (typeof score === 'number' && score >= 0 && score <= 100);
    if (
      typeof receipt.passed !== 'boolean' ||
      !validScore(receipt.score) ||
      !validScore(receipt.lfdScore) ||
      !receipt.evidenceDocumentId ||
      !receipt.evidenceSha256?.match(/^[0-9a-f]{64}$/u) ||
      (receipt.reason !== null && typeof receipt.reason !== 'string')
    ) {
      throw new ServiceUnavailableException(
        'Biometric provider returned an invalid evidence receipt',
      );
    }
    return receipt as BiometricVerificationReceipt;
  }

  private processingPurpose(
    request: BiometricVerificationRequest,
  ): PecBiometricProcessingPurpose {
    if (request.kind === 'CHECKIN' && request.subjectReference.patientId) {
      return PEC_BIOMETRIC_PROCESSING_POLICY.purposes.candidatePresence;
    }
    if (request.kind !== 'CHECKIN' && request.subjectReference.professionalId) {
      return PEC_BIOMETRIC_PROCESSING_POLICY.purposes.examinerAuthorship;
    }
    if (request.kind !== 'CHECKIN' && request.subjectReference.patientId) {
      return PEC_BIOMETRIC_PROCESSING_POLICY.purposes.candidatePresence;
    }
    throw new ServiceUnavailableException(
      'Biometric verification request has no valid processing purpose',
    );
  }
}
