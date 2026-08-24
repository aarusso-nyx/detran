import { readFileSync } from 'node:fs';

export const SENATRAN_SURFACES = [
  'renainf',
  'renaest',
  'renach',
  'sne',
  'cdt',
  'wsdenatran-read',
  'renavam',
] as const;

export type SenatranSurface = (typeof SENATRAN_SURFACES)[number];
export type SenatranProvider = 'mock' | 'real';
export type SenatranFeatureFlags = Readonly<Record<SenatranSurface, boolean>>;

export interface SenatranTlsConfig {
  cert: string | Buffer;
  key: string | Buffer;
  ca?: string | Buffer;
  passphrase?: string;
  servername?: string;
  rejectUnauthorized: true;
}

export interface SenatranClientConfig {
  provider: SenatranProvider;
  baseUrl: string;
  cpfUsuario: string;
  simulatedClientCertificateCn?: string;
  tls?: SenatranTlsConfig;
  features: SenatranFeatureFlags;
  timeoutMs: number;
  retry: {
    maxAttempts: number;
    baseDelayMs: number;
    maxDelayMs: number;
    jitterRatio: number;
  };
  circuitBreaker: {
    failureThreshold: number;
    halfOpenAfterMs: number;
  };
}

const mockFeatures: SenatranFeatureFlags = {
  renainf: true,
  renaest: true,
  renach: true,
  sne: true,
  cdt: true,
  'wsdenatran-read': true,
  renavam: false,
};

export function loadSenatranConfig(
  env: NodeJS.ProcessEnv = process.env,
): SenatranClientConfig {
  const provider = parseProvider(env.SENATRAN_PROVIDER);
  const timeoutMs = positiveInt(env.SENATRAN_TIMEOUT_MS, 10_000);
  const retry = {
    maxAttempts: positiveInt(env.SENATRAN_RETRY_MAX_ATTEMPTS, 3),
    baseDelayMs: nonNegativeInt(env.SENATRAN_RETRY_BASE_DELAY_MS, 120),
    maxDelayMs: nonNegativeInt(env.SENATRAN_RETRY_MAX_DELAY_MS, 1_000),
    jitterRatio: ratio(env.SENATRAN_RETRY_JITTER_RATIO, 0.2),
  };
  const circuitBreaker = {
    failureThreshold: positiveInt(env.SENATRAN_CIRCUIT_FAILURE_THRESHOLD, 5),
    halfOpenAfterMs: positiveInt(env.SENATRAN_CIRCUIT_HALF_OPEN_MS, 30_000),
  };

  if (provider === 'mock') {
    return {
      provider,
      baseUrl: normalizedUrl(
        env.SENATRAN_MOCK_BASE_URL ??
          env.SENATRAN_BASE_URL ??
          'http://localhost:3000',
      ),
      cpfUsuario: env.SENATRAN_MOCK_CPF_USUARIO ?? '12345678909',
      simulatedClientCertificateCn:
        env.SENATRAN_MOCK_CLIENT_CERT_CN ?? 'senatran-dev-client',
      features: mockFeatures,
      timeoutMs,
      retry,
      circuitBreaker,
    };
  }

  const baseUrl = required(env, 'SENATRAN_REAL_BASE_URL');
  const cpfUsuario = required(env, 'SENATRAN_REAL_CPF_USUARIO');
  const certPath = required(env, 'SENATRAN_REAL_CLIENT_CERT_PATH');
  const keyPath = required(env, 'SENATRAN_REAL_CLIENT_KEY_PATH');
  return {
    provider,
    baseUrl: normalizedUrl(baseUrl),
    cpfUsuario,
    tls: {
      cert: readFileSync(certPath),
      key: readFileSync(keyPath),
      ...(env.SENATRAN_REAL_CA_PATH
        ? { ca: readFileSync(env.SENATRAN_REAL_CA_PATH) }
        : {}),
      ...(env.SENATRAN_REAL_CLIENT_KEY_PASSPHRASE
        ? { passphrase: env.SENATRAN_REAL_CLIENT_KEY_PASSPHRASE }
        : {}),
      ...(env.SENATRAN_REAL_TLS_SERVERNAME
        ? { servername: env.SENATRAN_REAL_TLS_SERVERNAME }
        : {}),
      rejectUnauthorized: true,
    },
    features: Object.fromEntries(
      SENATRAN_SURFACES.map((surface) => [
        surface,
        surface === 'renavam'
          ? false
          : enabled(env[featureEnvName(surface)], false),
      ]),
    ) as unknown as SenatranFeatureFlags,
    timeoutMs,
    retry,
    circuitBreaker,
  };
}

export function featureEnvName(surface: SenatranSurface): string {
  return `SENATRAN_REAL_ENABLE_${surface.replaceAll('-', '_').toUpperCase()}`;
}

function parseProvider(value: string | undefined): SenatranProvider {
  const provider = value ?? 'mock';
  if (provider !== 'mock' && provider !== 'real') {
    throw new Error('SENATRAN_PROVIDER must be mock or real');
  }
  return provider;
}

function required(env: NodeJS.ProcessEnv, name: string): string {
  const value = env[name]?.trim();
  if (!value) {
    throw new Error(`SENATRAN provider=real requires ${name}`);
  }
  return value;
}

function normalizedUrl(value: string): string {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`Invalid SENATRAN base URL: ${value}`);
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('SENATRAN base URL must use http or https');
  }
  return parsed.toString().replace(/\/+$/u, '');
}

function enabled(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  if (/^(1|true|on|yes)$/iu.test(value)) return true;
  if (/^(0|false|off|no)$/iu.test(value)) return false;
  throw new Error(`Invalid SENATRAN feature-flag boolean: ${value}`);
}

function positiveInt(value: string | undefined, fallback: number): number {
  const parsed = value === undefined ? fallback : Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Expected a positive integer, received ${value}`);
  }
  return parsed;
}

function nonNegativeInt(value: string | undefined, fallback: number): number {
  const parsed = value === undefined ? fallback : Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`Expected a non-negative integer, received ${value}`);
  }
  return parsed;
}

function ratio(value: string | undefined, fallback: number): number {
  const parsed = value === undefined ? fallback : Number(value);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1) {
    throw new Error(`Expected a ratio from 0 to 1, received ${value}`);
  }
  return parsed;
}
