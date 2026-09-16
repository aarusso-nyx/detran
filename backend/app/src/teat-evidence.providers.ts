// CTG-0003 §4.1 e §11 (M11, R-0008, TASK-0007) — composição de
// `EvidenceStoragePort` no app.
//
// Perfil local/test: `LocalEvidenceStorage`, que devolve
// `local://<object_key>` e a janela de upload do próprio substrato de storage
// (`detranStorageOptions()`), nunca uma constante do domínio (M11). Fora
// dele: `@stynx-nyx/storage` `S3Service.presignUpload`. A janela de expiração
// é sempre a que a porta devolve.
//
// `APPLIED_ENTITY_PORTS` já é provido por `TeatSyncModule` (CTG-0002 §4.8) e
// é consumido daqui pelos comandos de evidência.
import { Global, Module, Optional } from '@nestjs/common';
import { S3Service } from '@stynx-nyx/storage';
import {
  EVIDENCE_STORAGE_PORT,
  systemOpsClock,
  type EvidenceStoragePort,
} from '@detran/ops-core';
import { LocalEvidenceStorage } from '@detran/ops-evidence';

import {
  detranRuntimeProfile,
  detranStorageOptions,
  isLocalRuntimeProfile,
} from './detran-runtime.js';

/** Janela de upload do substrato STYNX (`S3Service`, padrão publicado). */
const STYNX_DEFAULT_UPLOAD_EXPIRES_IN_SECONDS = 300;

export class S3EvidenceStorage implements EvidenceStoragePort {
  constructor(private readonly s3: S3Service) {}

  async presignUpload(input: {
    objectKey: string;
    mimeType: string;
    sizeBytes: number;
    hashValue?: string;
  }): Promise<{ uploadUrl: string; expiresAt: string }> {
    const presigned = await this.s3.presignUpload({
      key: input.objectKey,
      contentType: input.mimeType,
      checksumSha256: (input.hashValue ?? '').replace(/^sha256:/iu, ''),
    });
    const issuedAt = new Date(systemOpsClock.now()).getTime();
    return {
      uploadUrl: presigned.url,
      expiresAt: new Date(
        issuedAt + presigned.expiresInSeconds * 1000,
      ).toISOString(),
    };
  }
}

export const TEAT_EVIDENCE_STORAGE_PROVIDER = {
  provide: EVIDENCE_STORAGE_PORT,
  inject: [{ token: S3Service, optional: true }],
  useFactory: (s3?: S3Service): EvidenceStoragePort => {
    if (!isLocalRuntimeProfile(detranRuntimeProfile()) && s3)
      return new S3EvidenceStorage(s3);
    return new LocalEvidenceStorage({
      clock: systemOpsClock,
      expiresInSeconds:
        detranStorageOptions().uploadExpiresInSeconds ??
        STYNX_DEFAULT_UPLOAD_EXPIRES_IN_SECONDS,
    });
  },
};

@Global()
@Module({
  providers: [TEAT_EVIDENCE_STORAGE_PROVIDER],
  exports: [EVIDENCE_STORAGE_PORT],
})
export class TeatEvidencePortsModule {
  constructor(@Optional() private readonly s3?: S3Service) {
    void this.s3;
  }
}
