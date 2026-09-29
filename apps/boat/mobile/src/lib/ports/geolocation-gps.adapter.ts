import type { GpsPort } from '../ports.js';
import {
  BoatPortError,
  boatPortErrorFrom,
  type BoatHomologationAdapter,
} from './boat-port-error.js';

export interface GeolocationGpsAdapterOptions {
  readonly geolocation?: Geolocation;
  /** Sem padrão (OD-R28-016): só é repassado quando informado. */
  readonly timeoutMs?: number;
}

type GpsLocation = Awaited<ReturnType<GpsPort['locate']>>;

function positionErrorCode(error: unknown): unknown {
  if (typeof error !== 'object' || error === null) return undefined;
  return (error as { readonly code?: unknown }).code;
}

/** Porta GPS web de homologação sobre a Geolocation API do navegador. */
export class GeolocationGpsAdapter implements GpsPort, BoatHomologationAdapter {
  readonly adapterName = 'boat-web-geolocation';
  readonly mode = 'homologacao';
  readonly securityLevel = 'browser-geolocation';

  constructor(private readonly options: GeolocationGpsAdapterOptions = {}) {}

  locate(): Promise<GpsLocation> {
    const geolocation =
      'geolocation' in this.options
        ? this.options.geolocation
        : globalThis.navigator?.geolocation;
    if (geolocation === undefined || geolocation === null) {
      return Promise.reject(new BoatPortError('GpsPort', 'unavailable'));
    }
    const positionOptions: PositionOptions = {
      enableHighAccuracy: true,
      maximumAge: 0,
    };
    if (this.options.timeoutMs !== undefined) {
      positionOptions.timeout = this.options.timeoutMs;
    }
    return new Promise<GpsLocation>((resolve, reject) => {
      try {
        geolocation.getCurrentPosition(
          (position) =>
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
            }),
          (error) => {
            // jsdom não define GeolocationPositionError: mapeia pelo número.
            switch (positionErrorCode(error)) {
              case 1:
                reject(
                  new BoatPortError('GpsPort', 'permission-denied', {
                    cause: error,
                  }),
                );
                return;
              case 3:
                reject(
                  new BoatPortError('GpsPort', 'timeout', { cause: error }),
                );
                return;
              default:
                reject(
                  new BoatPortError('GpsPort', 'unavailable', { cause: error }),
                );
            }
          },
          positionOptions,
        );
      } catch (error) {
        reject(boatPortErrorFrom('GpsPort', error));
      }
    });
  }
}
