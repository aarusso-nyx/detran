import { Injectable, ServiceUnavailableException } from '@nestjs/common';

export interface ClinicalArtifactRequest {
  documentType:
    'REPORT' | 'REPORT_ADDENDUM' | 'EPISODE_EXPORT' | 'JUNTA_DECISION';
  contentSha256: string;
  content: Record<string, unknown>;
  signer: {
    professionalId: string;
    name: string;
    council: string;
  };
  minimumSignatureLevel: 'ADVANCED' | 'QUALIFIED';
}

export interface ClinicalArtifactReceipt {
  contentSha256: string;
  storageDocumentId: string;
  artifactSha256: string;
  signatureLevel: 'ADVANCED' | 'QUALIFIED';
  signatureFormat: 'PAdES-TSA';
  signedAt: string;
  tsaTime: string;
  certificateValidationSource: 'OCSP' | 'CRL';
  certificateValidationStatus: 'GOOD';
  certificateValidatedAt: string;
}

function isHexSha256(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9a-f]{64}$/u.test(value);
}

/** Fail-closed adapter for the platform-managed PDF/A + PAdES/TSA service. */
@Injectable()
export class PadesSigningHttpAdapter {
  async renderAndSign(
    request: ClinicalArtifactRequest,
  ): Promise<ClinicalArtifactReceipt> {
    const endpoint = process.env.DETRAN_CLINICAL_SIGNING_URL;
    const credential = process.env.DETRAN_CLINICAL_SIGNING_TOKEN;
    if (!endpoint || !credential) {
      throw new ServiceUnavailableException(
        'Clinical PAdES signing service is not configured',
      );
    }
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${credential}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) {
      throw new ServiceUnavailableException(
        `Clinical PAdES signing failed with HTTP ${response.status}`,
      );
    }
    const receipt = (await response.json()) as Partial<ClinicalArtifactReceipt>;
    if (
      receipt.contentSha256 !== request.contentSha256 ||
      !isHexSha256(receipt.artifactSha256) ||
      !receipt.storageDocumentId ||
      receipt.signatureFormat !== 'PAdES-TSA' ||
      !['ADVANCED', 'QUALIFIED'].includes(receipt.signatureLevel ?? '') ||
      !receipt.signedAt ||
      !receipt.tsaTime ||
      !['OCSP', 'CRL'].includes(receipt.certificateValidationSource ?? '') ||
      receipt.certificateValidationStatus !== 'GOOD' ||
      !receipt.certificateValidatedAt
    ) {
      throw new ServiceUnavailableException(
        'Clinical PAdES signing returned an invalid evidence receipt',
      );
    }
    return receipt as ClinicalArtifactReceipt;
  }
}
