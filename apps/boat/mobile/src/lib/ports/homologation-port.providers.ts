import type { Provider } from '@angular/core';
import {
  BOAT_ATTESTATION_PORT,
  BOAT_CAMERA_PORT,
  BOAT_ENCRYPTED_STORE_PORT,
  BOAT_GPS_PORT,
  BOAT_SIGNATURE_PORT,
  BOAT_SKETCH_PORT,
} from '../ports.js';
import { BoatBrowserEncryptedStoreAdapter } from './browser-encrypted-store.adapter.js';
import { CanvasSignatureAdapter } from './canvas-signature.adapter.js';
import { DrawingJsonSketchAdapter } from './drawing-json-sketch.adapter.js';
import { FileCaptureCameraAdapter } from './file-capture-camera.adapter.js';
import { GeolocationGpsAdapter } from './geolocation-gps.adapter.js';
import { HomologationAttestationAdapter } from './homologation-attestation.adapter.js';

/**
 * Liga os seis tokens de porta às implementações web de homologação
 * (CTG-0002 §Providers). Nada é registrado por padrão: o host inclui estes
 * providers em componente ou rota.
 */
export function provideBoatHomologationPorts(): Provider[] {
  return [
    { provide: BOAT_GPS_PORT, useFactory: () => new GeolocationGpsAdapter() },
    {
      provide: BOAT_CAMERA_PORT,
      useFactory: () => new FileCaptureCameraAdapter(),
    },
    {
      provide: BOAT_SIGNATURE_PORT,
      useFactory: () => new CanvasSignatureAdapter(),
    },
    {
      provide: BOAT_SKETCH_PORT,
      useFactory: () => new DrawingJsonSketchAdapter(),
    },
    {
      provide: BOAT_ENCRYPTED_STORE_PORT,
      useFactory: () => new BoatBrowserEncryptedStoreAdapter(),
    },
    {
      provide: BOAT_ATTESTATION_PORT,
      useFactory: () => new HomologationAttestationAdapter(),
    },
  ];
}
