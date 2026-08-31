import { createHash } from 'node:crypto';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';

export interface CouncilVerificationRequest {
  councilType: 'CRM' | 'CRP';
  councilNumber: string;
  councilState: string;
  professionalName: string;
}

export interface CouncilVerificationReceipt {
  professionalName: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  providerCheckedAt: string;
  responseSha256: string;
}

@Injectable()
export class CouncilVerificationHttpAdapter {
  async verify(
    request: CouncilVerificationRequest,
  ): Promise<CouncilVerificationReceipt> {
    const endpoint = process.env.DETRAN_COUNCIL_VERIFICATION_URL;
    const credential = process.env.DETRAN_COUNCIL_VERIFICATION_TOKEN;
    if (!endpoint || !credential) {
      throw new ServiceUnavailableException(
        'Professional council verification service is not configured',
      );
    }
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${credential}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      throw new ServiceUnavailableException(
        `Professional council verification failed with HTTP ${response.status}`,
      );
    }
    const raw = await response.text();
    let value: unknown;
    try {
      value = JSON.parse(raw);
    } catch {
      throw new ServiceUnavailableException(
        'Professional council verification returned malformed JSON',
      );
    }
    if (!value || typeof value !== 'object') {
      throw new ServiceUnavailableException(
        'Professional council verification returned an invalid receipt',
      );
    }
    const receipt = value as {
      active?: unknown;
      status?: unknown;
      professionalName?: unknown;
      checkedAt?: unknown;
    };
    if (
      typeof receipt.active !== 'boolean' ||
      (receipt.professionalName !== undefined &&
        receipt.professionalName !== null &&
        typeof receipt.professionalName !== 'string') ||
      (receipt.checkedAt !== undefined && typeof receipt.checkedAt !== 'string')
    ) {
      throw new ServiceUnavailableException(
        'Professional council verification returned an invalid receipt',
      );
    }
    const checkedAt = receipt.checkedAt ?? new Date().toISOString();
    if (Number.isNaN(new Date(checkedAt).valueOf())) {
      throw new ServiceUnavailableException(
        'Professional council verification returned an invalid check time',
      );
    }
    const normalizedStatus = String(receipt.status ?? '').toUpperCase();
    const status = receipt.active
      ? 'ACTIVE'
      : normalizedStatus.includes('SUSP')
        ? 'SUSPENDED'
        : 'INACTIVE';
    return {
      professionalName:
        typeof receipt.professionalName === 'string'
          ? receipt.professionalName
          : null,
      status,
      providerCheckedAt: checkedAt,
      responseSha256: createHash('sha256').update(raw).digest('hex'),
    };
  }
}
