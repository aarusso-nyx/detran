export type SefazErrorCategory =
  | 'NOT_FOUND'
  | 'PROVIDER_ERROR'
  | 'BUSINESS_ERROR'
  | 'TRANSPORT_ERROR'
  | 'TIMEOUT'
  | 'MALFORMED_RESPONSE';

export class SefazAdapterError extends Error {
  constructor(
    message: string,
    readonly category: SefazErrorCategory,
    readonly code: string,
    readonly retryable: boolean,
    readonly providerStatus?: number,
    readonly requestId?: string,
  ) {
    super(message);
    this.name = 'SefazAdapterError';
  }
}
