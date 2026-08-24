export type SenatranErrorCategory =
  'VALIDATION' | 'AUTH' | 'NOT_FOUND' | 'PROVIDER' | 'BUSINESS';

export interface SenatranErrorEnvelope {
  returnCode: number;
  message: string;
}

export class SenatranAdapterError extends Error {
  readonly name = 'SenatranAdapterError';

  constructor(
    message: string,
    readonly category: SenatranErrorCategory,
    readonly status: number,
    readonly returnCode: number,
    readonly providerCode?: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
  }

  get retryable(): boolean {
    return this.category === 'PROVIDER';
  }
}

export class SenatranFeatureDisabledError extends Error {
  readonly name = 'SenatranFeatureDisabledError';

  constructor(
    readonly surface: string,
    readonly provider: string,
  ) {
    super(
      `SENATRAN surface ${surface} is disabled for provider ${provider}; enable the explicit real-target feature flag only after homologation`,
    );
  }
}

export function toSenatranError(
  status: number,
  body: unknown,
): SenatranAdapterError {
  const envelope = errorEnvelope(body, status);
  const category = categoryFor(status, envelope.returnCode);
  return new SenatranAdapterError(
    envelope.message,
    category,
    status,
    envelope.returnCode,
    providerCode(envelope.message),
  );
}

export function isRetryableSenatranError(error: unknown): boolean {
  if (error instanceof SenatranFeatureDisabledError) return false;
  if (error instanceof SenatranAdapterError) return error.retryable;
  return true;
}

function errorEnvelope(body: unknown, status: number): SenatranErrorEnvelope {
  if (isRecord(body)) {
    const returnCode =
      typeof body.returnCode === 'number' ? body.returnCode : status;
    const message =
      typeof body.message === 'string'
        ? body.message
        : `SENATRAN request failed (${status})`;
    return { returnCode, message };
  }
  return {
    returnCode: status,
    message: `SENATRAN request failed (${status})`,
  };
}

function categoryFor(
  status: number,
  returnCode: number,
): SenatranErrorCategory {
  const code = returnCode || status;
  if (code === 400 || code === 422) return 'VALIDATION';
  if (code === 401 || code === 403) return 'AUTH';
  if (code === 404) return 'NOT_FOUND';
  if (code === 402 || (code >= 409 && code < 500)) return 'BUSINESS';
  return 'PROVIDER';
}

function providerCode(message: string): string | undefined {
  return /^([A-Z][A-Z0-9_.-]+)\s*(?:—|-)/u.exec(message)?.[1];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
