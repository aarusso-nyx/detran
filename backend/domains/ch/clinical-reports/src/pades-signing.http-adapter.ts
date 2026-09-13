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

interface ClinicalTrustConfiguration {
  signingUrl: string;
  healthUrl: string;
  token: string;
}

function isNonLocalProfile(): boolean {
  const profile =
    process.env.DETRAN_RUNTIME_PROFILE ??
    (process.env.NODE_ENV === 'test' ? 'test' : 'local-sandbox');
  return profile === 'staging-like' || profile === 'production';
}

function validatedUrl(
  name: string,
  value: string,
  requireHttps: boolean,
): string {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new ServiceUnavailableException(`${name} is not a valid URL`);
  }
  if (requireHttps && parsed.protocol !== 'https:') {
    throw new ServiceUnavailableException(
      `${name} must use HTTPS outside local/test`,
    );
  }
  return value;
}

export function clinicalTrustConfiguration(): ClinicalTrustConfiguration {
  const signingUrl = process.env.DETRAN_CLINICAL_SIGNING_URL;
  const healthUrl = process.env.DETRAN_CLINICAL_SIGNING_HEALTH_URL;
  const token = process.env.DETRAN_CLINICAL_SIGNING_TOKEN;
  if (!signingUrl || !healthUrl || !token) {
    throw new ServiceUnavailableException(
      'Clinical PAdES signing service is not configured; trust readiness is unavailable',
    );
  }
  const requireHttps = isNonLocalProfile();
  return {
    signingUrl: validatedUrl(
      'DETRAN_CLINICAL_SIGNING_URL',
      signingUrl,
      requireHttps,
    ),
    healthUrl: validatedUrl(
      'DETRAN_CLINICAL_SIGNING_HEALTH_URL',
      healthUrl,
      requireHttps,
    ),
    token,
  };
}

/** Fail-closed adapter for the platform-managed PDF/A + PAdES/TSA service. */
@Injectable()
export class PadesSigningHttpAdapter {
  async checkCapabilities(): Promise<void> {
    const configuration = clinicalTrustConfiguration();
    const response = await fetch(configuration.healthUrl, {
      headers: { authorization: `Bearer ${configuration.token}` },
      signal: AbortSignal.timeout(5_000),
    });
    if (!response.ok) {
      throw new ServiceUnavailableException(
        `Clinical trust readiness failed with HTTP ${response.status}`,
      );
    }
    const capabilities = (await response.json()) as {
      pades?: unknown;
      tsa?: unknown;
      lta?: unknown;
      certificateValidation?: unknown;
    };
    if (
      capabilities.pades !== true ||
      capabilities.tsa !== true ||
      capabilities.lta !== true ||
      !Array.isArray(capabilities.certificateValidation) ||
      !capabilities.certificateValidation.some((source) =>
        ['OCSP', 'CRL'].includes(String(source)),
      )
    ) {
      throw new ServiceUnavailableException(
        'Clinical trust service lacks required PAdES-TSA/LTA/OCSP-or-CRL capabilities',
      );
    }
  }

  async renderAndSign(
    request: ClinicalArtifactRequest,
  ): Promise<ClinicalArtifactReceipt> {
    const configuration = clinicalTrustConfiguration();
    const response = await fetch(configuration.signingUrl, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${configuration.token}`,
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
