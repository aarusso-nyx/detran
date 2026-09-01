import {
  InMemoryCircuitBreaker,
  IntegrationAdapter,
  type IntegrationContext,
  type IntegrationTelemetry,
} from '@stynx-nyx/integration-adapter';

import type { SenatranClientConfig, SenatranSurface } from './config.js';
import {
  SenatranFeatureDisabledError,
  isRetryableSenatranError,
  toSenatranError,
} from './errors.js';
import { deterministicIdempotencyKey } from './idempotency.js';
import {
  NodeSenatranTransport,
  type SenatranTransport,
  type SenatranTransportResponse,
} from './transport.js';

export interface SenatranRequest<TBody = unknown> {
  surface: SenatranSurface;
  operation: string;
  method: 'GET' | 'POST' | 'PATCH';
  path: string;
  query?: Readonly<Record<string, string | number | boolean | undefined>>;
  body?: TBody;
  write?: boolean;
}

interface PreparedRequest extends SenatranRequest {
  idempotencyKey?: string;
}

export interface SenatranClientOptions {
  transport?: SenatranTransport;
  telemetry?: IntegrationTelemetry;
  sleep?: (milliseconds: number) => Promise<void>;
}

/** One HTTP implementation serves both providers; config owns base/auth differences. */
export class SenatranClient {
  private readonly executor: IntegrationAdapter<
    PreparedRequest,
    SenatranTransportResponse,
    unknown
  >;

  constructor(
    readonly config: SenatranClientConfig,
    options: SenatranClientOptions = {},
  ) {
    const transport = options.transport ?? new NodeSenatranTransport();
    this.executor = new IntegrationAdapter({
      name: `senatran-${config.provider}`,
      request: (input) =>
        transport.request({
          url: this.url(input),
          method: input.method,
          headers: this.headers(input),
          ...(input.body === undefined
            ? {}
            : { body: JSON.stringify(input.body) }),
          timeoutMs: config.timeoutMs,
          ...(config.tls ? { tls: config.tls } : {}),
        }),
      parseResponse: (response) => parseResponse(response),
      idempotencyKey: (input) => input.idempotencyKey,
      retryPolicy: {
        ...config.retry,
        retryable: isRetryableSenatranError,
      },
      timeoutMs: config.timeoutMs,
      circuitBreakerKey: (input, context) =>
        `${config.provider}:${input.surface}:${context.tenantId ?? 'global'}`,
      circuitBreaker: new InMemoryCircuitBreaker({
        failureThreshold: config.circuitBreaker.failureThreshold,
        openAfterMs: 0,
        halfOpenAfterMs: config.circuitBreaker.halfOpenAfterMs,
      }),
      telemetry: options.telemetry,
      sleep: options.sleep,
    });
  }

  async request<TResponse, TBody = unknown>(
    request: SenatranRequest<TBody>,
    context: IntegrationContext = {},
  ): Promise<TResponse> {
    if (!this.config.features[request.surface]) {
      throw new SenatranFeatureDisabledError(
        request.surface,
        this.config.provider,
      );
    }
    const prepared: PreparedRequest = {
      ...request,
      ...(request.write
        ? {
            idempotencyKey:
              context.metadata?.idempotencyKey?.trim() ||
              deterministicIdempotencyKey(
                request.surface,
                request.operation,
                request.body,
              ),
          }
        : {}),
    };
    return (await this.executor.execute(prepared, context)) as TResponse;
  }

  private url(input: SenatranRequest): URL {
    const url = new URL(
      `${this.config.baseUrl}/${input.path.replace(/^\/+/, '')}`,
    );
    for (const [key, value] of Object.entries(input.query ?? {})) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
    return url;
  }

  private headers(input: PreparedRequest): Record<string, string> {
    const headers: Record<string, string> = {
      accept: 'application/json',
      'x-cpf-usuario': this.config.cpfUsuario,
    };
    if (input.body !== undefined) headers['content-type'] = 'application/json';
    if (this.config.provider === 'mock') {
      const cn = this.config.simulatedClientCertificateCn;
      if (cn) headers['x-client-cert-cn'] = cn;
    }
    if (input.idempotencyKey) {
      headers['Idempotency-Key'] = input.idempotencyKey;
    }
    return headers;
  }
}

function parseResponse(response: SenatranTransportResponse): unknown {
  const body = parseJson(response.body);
  if (response.status < 200 || response.status >= 300) {
    throw toSenatranError(response.status, body);
  }
  return body;
}

function parseJson(body: string): unknown {
  if (!body) return undefined;
  try {
    return JSON.parse(body) as unknown;
  } catch (cause) {
    throw new Error('SENATRAN provider returned invalid JSON', { cause });
  }
}
