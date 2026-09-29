import { webcrypto } from 'node:crypto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { isBoatPortError } from './boat-port-error.js';
import { HomologationAttestationAdapter } from './homologation-attestation.adapter.js';

async function settle(promise: Promise<unknown>): Promise<{
  resolved: boolean;
  value: unknown;
}> {
  try {
    return { resolved: true, value: await promise };
  } catch (error) {
    return { resolved: false, value: error };
  }
}

function expectUnattested(outcome: { resolved: boolean; value: unknown }) {
  expect(outcome.resolved).toBe(false);
  expect(isBoatPortError(outcome.value)).toBe(true);
  expect(outcome.value).toMatchObject({
    port: 'AttestationPort',
    code: 'unattested',
  });
  expect(outcome.value).not.toHaveProperty('deviceId');
  expect(outcome.value).not.toHaveProperty('attestation');
}

afterEach(() => vi.unstubAllGlobals());

describe('HomologationAttestationAdapter (OD-R28-002)', () => {
  it('dado ambiente padrão quando attest é chamado várias vezes então toda chamada rejeita com unattested e nunca resolve', async () => {
    const adapter = new HomologationAttestationAdapter();
    for (let attempt = 0; attempt < 5; attempt += 1) {
      expectUnattested(await settle(adapter.attest()));
    }
  });

  it('dado APIs de credencial e de criptografia presentes quando attest é chamado então rejeita com unattested sem ler o dispositivo', async () => {
    const get = vi.fn(async () => ({ id: 'dispositivo-x' }));
    const create = vi.fn(async () => ({ id: 'dispositivo-y' }));
    const generateKey = vi.fn();
    const sign = vi.fn();
    vi.stubGlobal('navigator', { credentials: { get, create } });
    vi.stubGlobal('crypto', { subtle: { generateKey, sign } });
    expectUnattested(
      await settle(new HomologationAttestationAdapter().attest()),
    );
    expect(get).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
    expect(generateKey).not.toHaveBeenCalled();
    expect(sign).not.toHaveBeenCalled();
  });

  it('dado APIs do navegador ausentes quando attest é chamado então rejeita com unattested e não com unavailable', async () => {
    vi.stubGlobal('navigator', undefined);
    vi.stubGlobal('crypto', undefined);
    expectUnattested(
      await settle(new HomologationAttestationAdapter().attest()),
    );
  });

  it('dado APIs do navegador que lançam erro quando attest é chamado então rejeita com unattested', async () => {
    vi.stubGlobal('navigator', {
      get credentials(): never {
        throw new DOMException('falha', 'NotSupportedError');
      },
    });
    vi.stubGlobal('crypto', {
      get subtle(): never {
        throw new Error('falha');
      },
    });
    expectUnattested(
      await settle(new HomologationAttestationAdapter().attest()),
    );
  });

  it('dado WebCrypto real do Node presente quando attest é chamado então nenhum ramo entrega deviceId ou attestation', async () => {
    vi.stubGlobal('crypto', webcrypto);
    const outcome = await settle(new HomologationAttestationAdapter().attest());
    expectUnattested(outcome);
  });

  it('dado o adaptador de homologação quando inspecionado então declara-se não atestado antes de qualquer chamada', () => {
    const adapter = new HomologationAttestationAdapter();
    expect(adapter.adapterName).toBe('boat-homologation-attestation');
    expect(adapter.mode).toBe('homologacao');
    expect(adapter.securityLevel).toBe('none');
    expect(adapter.attestationStatus).toBe('unattested');
  });

  it('dado o retorno de attest quando examinado então é sempre uma promessa', () => {
    const promise = new HomologationAttestationAdapter().attest();
    expect(promise).toBeInstanceOf(Promise);
    return settle(promise).then(expectUnattested);
  });
});
