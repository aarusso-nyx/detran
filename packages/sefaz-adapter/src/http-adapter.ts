import type {
  DebtLookupInput,
  DebtLookupOutput,
  IssueGuideInput,
  IssueGuideOutput,
  PaymentStatusOutput,
  RectificationInput,
  RectificationOutput,
  RefundInput,
  RefundOutput,
  RefundStatusOutput,
  SefazPaymentPort,
} from './domain.js';
import { SefazAdapterError, type SefazErrorCategory } from './errors.js';

export interface SefazHttpAdapterOptions {
  baseUrl: string;
  timeoutMs?: number;
  pathPrefix?: string;
  retryDelayMs?: number;
}

export class SefazHttpAdapter implements SefazPaymentPort {
  private readonly baseUrl: string;
  private readonly pathPrefix: string;
  private readonly timeoutMs: number;
  private readonly retryDelayMs: number;

  constructor(options: SefazHttpAdapterOptions) {
    if (!/^https?:\/\//u.test(options.baseUrl)) {
      throw new Error('SEFAZ base URL must use http or https');
    }
    this.baseUrl = options.baseUrl.replace(/\/+$/u, '');
    const prefix = (options.pathPrefix ?? '').trim().replace(/^\/+|\/+$/gu, '');
    this.pathPrefix = prefix ? `/${prefix}` : '';
    this.timeoutMs = options.timeoutMs ?? 10_000;
    this.retryDelayMs = options.retryDelayMs ?? 120;
  }

  lookupDebt(input: DebtLookupInput): Promise<DebtLookupOutput> {
    return this.request('POST', '/sefaz/payments/lookup', input);
  }
  issueGuide(input: IssueGuideInput): Promise<IssueGuideOutput> {
    return this.request('POST', '/sefaz/guides', input);
  }
  getPaymentStatus(reference: string): Promise<PaymentStatusOutput> {
    return this.request(
      'GET',
      `/sefaz/payments/${encodeURIComponent(reference)}`,
    );
  }
  submitRectification(input: RectificationInput): Promise<RectificationOutput> {
    return this.request('POST', '/sefaz/rectifications', input);
  }
  submitRefundRequest(input: RefundInput): Promise<RefundOutput> {
    return this.request('POST', '/sefaz/refunds', input);
  }
  getRefundStatus(refundId: string): Promise<RefundStatusOutput> {
    return this.request(
      'GET',
      `/sefaz/refunds/${encodeURIComponent(refundId)}`,
    );
  }

  private async request<T>(
    method: 'GET' | 'POST',
    path: string,
    body?: unknown,
  ): Promise<T> {
    let lastError: unknown;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        return await this.fetchOnce<T>(method, path, body);
      } catch (error) {
        lastError = error;
        if (
          !(error instanceof SefazAdapterError) ||
          !error.retryable ||
          attempt === 2
        ) {
          throw error;
        }
        if (this.retryDelayMs > 0) {
          await new Promise((resolve) =>
            setTimeout(resolve, this.retryDelayMs * 2 ** attempt),
          );
        }
      }
    }
    throw lastError;
  }

  private async fetchOnce<T>(
    method: 'GET' | 'POST',
    path: string,
    body?: unknown,
  ): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await fetch(`${this.baseUrl}${this.pathPrefix}${path}`, {
        method,
        headers: {
          accept: 'application/json',
          ...(body === undefined ? {} : { 'content-type': 'application/json' }),
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        signal: controller.signal,
      });
      const payload = (await response.json()) as unknown;
      if (!response.ok) throw this.providerError(payload, response.status);
      return payload as T;
    } catch (error) {
      if (error instanceof SefazAdapterError) throw error;
      if ((error as { name?: string }).name === 'AbortError') {
        throw new SefazAdapterError(
          'SEFAZ request timed out',
          'TIMEOUT',
          'timeout',
          true,
        );
      }
      throw new SefazAdapterError(
        error instanceof Error ? error.message : 'SEFAZ transport failure',
        'TRANSPORT_ERROR',
        'transport_error',
        true,
      );
    } finally {
      clearTimeout(timer);
    }
  }

  private providerError(payload: unknown, status: number): SefazAdapterError {
    const envelope = payload as {
      error?: {
        category?: string;
        code?: string;
        message?: string;
        retryable?: boolean;
        providerStatus?: number;
      };
      requestId?: string;
    };
    const detail = envelope?.error;
    return new SefazAdapterError(
      detail?.message ?? `SEFAZ provider returned HTTP ${status}`,
      (detail?.category ?? 'PROVIDER_ERROR') as SefazErrorCategory,
      detail?.code ?? `http_${status}`,
      detail?.retryable ?? status >= 500,
      detail?.providerStatus ?? status,
      envelope?.requestId,
    );
  }
}
