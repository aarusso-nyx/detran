import { beforeAll, describe, expect, it } from 'vitest';

import {
  createSenatranAdapter,
  type SenatranAdapter,
} from '../../src/index.js';
import { SenatranAdapterError } from '../../src/errors.js';
import {
  SENATRAN_MAGIC_KEYS,
  SENATRAN_SEED_FIXTURES,
  loadSenatranSeedManifest,
  mockSenatranConfig,
} from '../../src/test-kit.js';
import { expectReadProviderBehavior } from '../shared/read-provider.behavior.js';

describe('senatran-adapter contract against the live in-repo mock', () => {
  let adapter: SenatranAdapter;

  beforeAll(async () => {
    const baseUrl = process.env.SENATRAN_MOCK_BASE_URL;
    if (!baseUrl)
      throw new Error('SENATRAN_MOCK_BASE_URL is required for the e2e tier');
    const config = mockSenatranConfig(baseUrl);
    adapter = createSenatranAdapter({
      ...config,
      retry: { ...config.retry, baseDelayMs: 0, maxDelayMs: 0, jitterRatio: 0 },
    });
    const response = await fetch(`${baseUrl}/health`);
    if (!response.ok)
      throw new Error(`senatran-mock health failed: ${response.status}`);
  });

  it('loads the exact seed manifest used by the running mock', async () => {
    const manifest = await loadSenatranSeedManifest();
    expect(manifest.auth.cpfUsuario).toBe('12345678909');
    expect(manifest.counts.sinistrosRenaest).toBe(7);
  });

  it('passes the shared read-provider behavior', async () => {
    await expectReadProviderBehavior(adapter.ports, {
      cpf: SENATRAN_SEED_FIXTURES.driver.cpf,
      plate: SENATRAN_SEED_FIXTURES.vehicle.plate,
    });
  });

  it('exposes generated exact typing for arbitrary WSDenatran read paths', async () => {
    const response = await adapter.ports.wsdenatranRead.read(
      '/veiculos/renavam/{renavam}',
      { renavam: SENATRAN_SEED_FIXTURES.vehicle.renavam },
    );
    expect(response.veiculo?.[0]?.placa).toBe(
      SENATRAN_SEED_FIXTURES.vehicle.plate,
    );
  });

  it('maps RENACH driver validation into English domain fields', async () => {
    const result = await adapter.ports.renach.validateDriverLicense({
      cpf: SENATRAN_SEED_FIXTURES.driver.cpf,
      licenseNumber: SENATRAN_SEED_FIXTURES.driver.licenseNumber,
      securityNumber: SENATRAN_SEED_FIXTURES.driver.securityNumber,
    });
    expect(result.valid).toBe(true);
    expect(result.driver.name).toBeTruthy();
    expect(result.driver.licenseNumber).toBe(
      SENATRAN_SEED_FIXTURES.driver.licenseNumber,
    );
  });

  it('recovers the existing RENACH process on ALREADY_OPEN', async () => {
    const result = await adapter.ports.renach.openProcess({
      cpf: SENATRAN_SEED_FIXTURES.driver.cpf,
      processType: 'FIRST_LICENSE',
    });
    expect(result.openingResult).toBe('ALREADY_OPEN');
    expect(result.renachNumber).toBe(
      SENATRAN_SEED_FIXTURES.renach.processNumber,
    );
  });

  it('reads RENAEST, SNE and CDT through their separate ports', async () => {
    const [crash, enrollment, payment] = await Promise.all([
      adapter.ports.renaest.getCrash(SENATRAN_SEED_FIXTURES.renaest.crashId),
      adapter.ports.sne.getVehicleEnrollment(
        SENATRAN_SEED_FIXTURES.sne.enrolledPlate,
      ),
      adapter.ports.cdt.getPaymentQuote(
        SENATRAN_SEED_FIXTURES.cdt.discountAitNumber,
      ),
    ]);
    expect(crash.protocol).toBe(SENATRAN_SEED_FIXTURES.renaest.protocol);
    expect(enrollment.enrolled).toBe(true);
    expect(payment.discountPercent).toBe(40);
  });

  it('maps mock business errors to BUSINESS without retry', async () => {
    const error = await adapter.ports.wsdenatranRead
      .findVehicleByPlate(SENATRAN_MAGIC_KEYS.businessErrorPlate)
      .catch((cause: unknown) => cause);
    expect(error).toBeInstanceOf(SenatranAdapterError);
    expect(error).toMatchObject({ category: 'BUSINESS', returnCode: 402 });
  });

  it('maps exhausted mock 500s to PROVIDER', async () => {
    const error = await adapter.ports.wsdenatranRead
      .findVehicleByPlate(SENATRAN_MAGIC_KEYS.providerErrorPlate)
      .catch((cause: unknown) => cause);
    expect(error).toBeInstanceOf(SenatranAdapterError);
    expect(error).toMatchObject({ category: 'PROVIDER', returnCode: 500 });
  });
});
