import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { SenatranClientConfig } from './config.js';

export const SENATRAN_MOCK_AUTH = {
  cpfUsuario: '12345678909',
  clientCertificateCn: 'senatran-dev-client',
} as const;

export const SENATRAN_MAGIC_KEYS = {
  unauthorizedCpfUsuario: '00000000000',
  businessErrorPlate: 'ERR2A02',
  providerErrorPlate: 'ERR5A00',
  businessErrorCpf: '00000000402',
  providerErrorCpf: '00000000500',
  providerErrorMunicipalityCode: '9999999',
  providerErrorAgencyCode: '999999',
  providerErrorAitNumber: 'A0000500',
  providerErrorState: 'ZZ',
} as const;

export const SENATRAN_SEED_FIXTURES = {
  vehicle: {
    plate: 'ABC1D23',
    chassis: '9BWZZZ377VT004251',
    renavam: '00123456780',
  },
  driver: {
    cpf: '52998224725',
    licenseNumber: '01234567890',
    renachNumber: 'RN0000000001',
    securityNumber: '000000001',
  },
  renach: {
    processNumber: 'RS123456789',
  },
  renainf: {
    aitNumber: 'A0001001',
  },
  renaest: {
    crashId: 'SN00000000001',
    protocol: 'RENAEST-SEED-0000000001',
  },
  sne: {
    enrolledPlate: 'ABC1D23',
    enrolledCpf: '52998224725',
    enrolledAgency: '204020',
    acceptedNotification: 'SNE-SEED-AUT-0001',
  },
  cdt: {
    citizenCpf: '52998224725',
    discountAitNumber: 'A0001001',
  },
} as const;

export interface SenatranSeedManifest {
  masterSeed: string;
  auth: { cpfUsuario: string; certCn: string };
  magicKeys: Array<{
    kind: string;
    value: string;
    status: number;
    meaning: string;
  }>;
  read: Record<string, unknown>;
  renach: Record<string, unknown>;
  renainf: Record<string, unknown>;
  renaest: Record<string, unknown>;
  sne: Record<string, unknown>;
  cdt: Record<string, unknown>;
  detran: Record<string, unknown>;
  counts: Record<string, number>;
}

export async function loadSenatranSeedManifest(
  path = resolve(
    dirname(fileURLToPath(import.meta.url)),
    '../../..',
    'senatran-mock/database/seed/manifest.json',
  ),
): Promise<SenatranSeedManifest> {
  const parsed = JSON.parse(await readFile(path, 'utf8')) as unknown;
  assertSenatranSeedManifest(parsed);
  return parsed;
}

export function assertSenatranSeedManifest(
  value: unknown,
): asserts value is SenatranSeedManifest {
  if (!isRecord(value))
    throw new Error('SENATRAN seed manifest must be an object');
  if (typeof value.masterSeed !== 'string') {
    throw new Error('SENATRAN seed manifest is missing masterSeed');
  }
  if (!isRecord(value.auth) || typeof value.auth.cpfUsuario !== 'string') {
    throw new Error('SENATRAN seed manifest is missing auth fixtures');
  }
  if (!Array.isArray(value.magicKeys)) {
    throw new Error('SENATRAN seed manifest is missing magicKeys');
  }
  for (const section of [
    'read',
    'renach',
    'renainf',
    'renaest',
    'sne',
    'cdt',
    'detran',
    'counts',
  ]) {
    if (!isRecord(value[section])) {
      throw new Error(`SENATRAN seed manifest is missing ${section}`);
    }
  }
}

export function findMagicKey(
  manifest: SenatranSeedManifest,
  kind: string,
  status: number,
): string {
  const fixture = manifest.magicKeys.find(
    (item) => item.kind === kind && item.status === status,
  );
  if (!fixture) throw new Error(`No SENATRAN magic key for ${kind}/${status}`);
  return fixture.value;
}

export function mockSenatranConfig(
  baseUrl = 'http://localhost:3000',
): SenatranClientConfig {
  return {
    provider: 'mock',
    baseUrl,
    cpfUsuario: SENATRAN_MOCK_AUTH.cpfUsuario,
    simulatedClientCertificateCn: SENATRAN_MOCK_AUTH.clientCertificateCn,
    features: {
      renainf: true,
      renaest: true,
      renach: true,
      sne: true,
      cdt: true,
      'wsdenatran-read': true,
      renavam: false,
    },
    timeoutMs: 10_000,
    retry: {
      maxAttempts: 3,
      baseDelayMs: 120,
      maxDelayMs: 1_000,
      jitterRatio: 0.2,
    },
    circuitBreaker: { failureThreshold: 5, halfOpenAfterMs: 30_000 },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
