// CTG-0003 §4.1 (M11, R-0008, TASK-0007) — `EvidenceStoragePort` do perfil
// local/test: devolve `local://<object_key>` e a expiração **da porta**.
//
// A janela da intenção é `source_pending` no `parameter-catalogue.md` §TEAT:
// não há constante de expiração no domínio (M11). Enquanto o parâmetro não
// existir, o perfil local recebe a janela por configuração explícita de quem
// monta a porta (`DETRAN_LOCAL_EVIDENCE_UPLOAD_TTL_SECONDS` no wiring do app);
// sem valor, a porta usa a janela de upload que lhe for passada na construção.
import type { EvidenceStoragePort } from '@detran/ops-core';
import type { OpsClock } from '@detran/ops-core';

export interface LocalEvidenceStorageOptions {
  clock: OpsClock;
  /** Janela da URL assinada, em segundos — vem do wiring, nunca do domínio. */
  expiresInSeconds: number;
}

export class LocalEvidenceStorage implements EvidenceStoragePort {
  constructor(private readonly options: LocalEvidenceStorageOptions) {}

  async presignUpload(input: {
    objectKey: string;
    mimeType: string;
    sizeBytes: number;
  }): Promise<{ uploadUrl: string; expiresAt: string }> {
    const issuedAt = new Date(this.options.clock.now()).getTime();
    return {
      uploadUrl: `local://${input.objectKey}`,
      expiresAt: new Date(
        issuedAt + this.options.expiresInSeconds * 1000,
      ).toISOString(),
    };
  }
}
