import { afterEach, describe, expect, it, vi } from 'vitest';
import { isBoatPortError } from './boat-port-error.js';
import { GeolocationGpsAdapter } from './geolocation-gps.adapter.js';

type Success = (position: unknown) => void;
type Failure = (error: unknown) => void;

function geolocationDouble(
  behaviour: (success: Success, failure: Failure) => void,
) {
  const getCurrentPosition = vi.fn(
    (success: Success, failure: Failure, _options?: unknown) =>
      behaviour(success, failure),
  );
  return {
    getCurrentPosition,
    geolocation: { getCurrentPosition } as unknown as Geolocation,
  };
}

async function rejection(promise: Promise<unknown>): Promise<unknown> {
  try {
    await promise;
  } catch (error) {
    return error;
  }
  throw new Error('a promessa deveria ter sido rejeitada');
}

afterEach(() => vi.unstubAllGlobals());

describe('GeolocationGpsAdapter', () => {
  it('dado geolocation que responde quando locate é chamado então resolve latitude, longitude e accuracy copiados de coords', async () => {
    const { geolocation, getCurrentPosition } = geolocationDouble((success) =>
      success({ coords: { latitude: -1.5, longitude: -48.25, accuracy: 7 } }),
    );
    const result = await new GeolocationGpsAdapter({ geolocation }).locate();
    expect(result).toEqual({ latitude: -1.5, longitude: -48.25, accuracy: 7 });
    expect(getCurrentPosition).toHaveBeenCalledTimes(1);
    expect(getCurrentPosition.mock.calls[0]?.[2]).toEqual({
      enableHighAccuracy: true,
      maximumAge: 0,
    });
  });

  it('dado timeoutMs informado quando locate é chamado então repassa timeout às opções do navegador', async () => {
    const { geolocation, getCurrentPosition } = geolocationDouble((success) =>
      success({ coords: { latitude: 1, longitude: 2, accuracy: 3 } }),
    );
    await new GeolocationGpsAdapter({ geolocation, timeoutMs: 4000 }).locate();
    expect(getCurrentPosition.mock.calls[0]?.[2]).toEqual({
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 4000,
    });
  });

  it('dado geolocation padrão do navegador quando locate é chamado então lê navigator.geolocation na chamada, não no construtor', async () => {
    const adapter = new GeolocationGpsAdapter();
    const { geolocation } = geolocationDouble((success) =>
      success({ coords: { latitude: 9, longitude: 8, accuracy: 7 } }),
    );
    vi.stubGlobal('navigator', { geolocation });
    await expect(adapter.locate()).resolves.toEqual({
      latitude: 9,
      longitude: 8,
      accuracy: 7,
    });
  });

  it('dado erro com code 1 quando locate é chamado então rejeita com permission-denied e nunca resolve', async () => {
    const failure = { code: 1, message: 'negado' };
    const { geolocation } = geolocationDouble((_success, fail) =>
      fail(failure),
    );
    const error = await rejection(
      new GeolocationGpsAdapter({ geolocation }).locate(),
    );
    expect(isBoatPortError(error)).toBe(true);
    expect(error).toMatchObject({ port: 'GpsPort', code: 'permission-denied' });
  });

  it('dado erro com code 2 quando locate é chamado então rejeita com unavailable', async () => {
    const { geolocation } = geolocationDouble((_success, fail) =>
      fail({ code: 2 }),
    );
    const error = await rejection(
      new GeolocationGpsAdapter({ geolocation }).locate(),
    );
    expect(error).toMatchObject({ port: 'GpsPort', code: 'unavailable' });
  });

  it('dado erro com code 3 quando locate é chamado então rejeita com timeout', async () => {
    const { geolocation } = geolocationDouble((_success, fail) =>
      fail({ code: 3 }),
    );
    const error = await rejection(
      new GeolocationGpsAdapter({ geolocation }).locate(),
    );
    expect(error).toMatchObject({ port: 'GpsPort', code: 'timeout' });
  });

  it('dado geolocation ausente quando locate é chamado então rejeita com unavailable sem inventar coordenada', async () => {
    const error = await rejection(
      new GeolocationGpsAdapter({ geolocation: undefined }).locate(),
    );
    expect(isBoatPortError(error)).toBe(true);
    expect(error).toMatchObject({ port: 'GpsPort', code: 'unavailable' });
  });

  it('dado navigator sem geolocation quando locate é chamado então rejeita com unavailable', async () => {
    vi.stubGlobal('navigator', {});
    const error = await rejection(new GeolocationGpsAdapter().locate());
    expect(error).toMatchObject({ port: 'GpsPort', code: 'unavailable' });
  });

  it('dado o adaptador de homologação quando inspecionado então traz rótulo explícito e identificável', () => {
    const adapter = new GeolocationGpsAdapter();
    expect(adapter.adapterName).toBe('boat-web-geolocation');
    expect(adapter.mode).toBe('homologacao');
    expect(adapter.securityLevel).toBe('browser-geolocation');
  });
});
