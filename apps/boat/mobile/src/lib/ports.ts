import { InjectionToken } from '@angular/core';

export interface GpsPort {
  locate(): Promise<
    Readonly<{ latitude: number; longitude: number; accuracy: number }>
  >;
}
export interface CameraPort {
  capture(): Promise<Readonly<{ assetId: string; sha256: string }>>;
}
export interface SignaturePort {
  capture(): Promise<Readonly<{ signature: string; signedAt: string }>>;
}
export interface SketchPort {
  save(drawing: string): Promise<Readonly<{ drawing: string }>>;
}
export interface MobileEncryptedStorePort {
  get(key: string): Promise<string | undefined>;
  set(key: string, value: string): Promise<void>;
}
export interface AttestationPort {
  attest(): Promise<Readonly<{ deviceId: string; attestation: string }>>;
}

export const BOAT_PORTS = [
  'GpsPort',
  'CameraPort',
  'SignaturePort',
  'SketchPort',
  'MobileEncryptedStorePort',
  'AttestationPort',
] as const;

export const BOAT_GPS_PORT = new InjectionToken<GpsPort>('BOAT_GPS_PORT');
export const BOAT_CAMERA_PORT = new InjectionToken<CameraPort>(
  'BOAT_CAMERA_PORT',
);
export const BOAT_SIGNATURE_PORT = new InjectionToken<SignaturePort>(
  'BOAT_SIGNATURE_PORT',
);
export const BOAT_SKETCH_PORT = new InjectionToken<SketchPort>(
  'BOAT_SKETCH_PORT',
);
export const BOAT_ENCRYPTED_STORE_PORT =
  new InjectionToken<MobileEncryptedStorePort>('BOAT_ENCRYPTED_STORE_PORT');
export const BOAT_ATTESTATION_PORT = new InjectionToken<AttestationPort>(
  'BOAT_ATTESTATION_PORT',
);

export interface RenaestOutboxPort {
  submit(input: Readonly<{ id: string }>): Promise<void>;
}

/** RENAEST is reached only through the backend outbox/adapter boundary. */
export class RenaestPort {
  constructor(
    private readonly adapter: Readonly<{ outbox: RenaestOutboxPort }>,
  ) {}

  async submitCrash(
    input: Readonly<{ id: string }>,
  ): Promise<Readonly<{ id: string }>> {
    await this.adapter.outbox.submit(input);
    return { id: input.id };
  }
}
