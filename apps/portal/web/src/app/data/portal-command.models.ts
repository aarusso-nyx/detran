// Resultado de comando e formas 2xx que o OpenAPI gerado ainda não declara (contrato CTG-0003a
// §2.3; [DIVERGE-3]/OD-P59). As formas abaixo são PROPOSTAS derivadas do texto de
// `portal-route-contract.md` §3/§5 — os campos marcados `source_pending` não têm fonte fechada;
// enquanto o backend responde `422 PORTAL.SERVICE_UNAVAILABLE`, a UI mostra o estado
// indisponível e nunca simula resultado (M15).

export interface CommandResult<T> {
  readonly body: T;
  /** Cabeçalho `ETag` da resposta, tal como recebido (`"<version>"`, com aspas), ou `null`. */
  readonly etag: string | null;
}

/** `"<version>"` — forma do ETag do contrato (OpenAPI: `ETag: "<version>"`). */
export function etagOf(version: number): string {
  return `"${version}"`;
}

export interface AttachmentUploadIntent {
  readonly attachmentId: string; // source_pending: nome do campo
  readonly uploadUrl: string; // "URL assinada" (§5)
  readonly method: 'PUT'; // source_pending
  readonly headers: Readonly<Record<string, string>>; // source_pending
  readonly expiresAt: string | null; // source_pending
}

export interface AttachmentCompleted {
  readonly attachmentId: string;
  readonly sha256: string; // "anexo com hash" (§5)
}

export interface DiligenceResponded {
  readonly requestId: string;
  readonly version: number; // source_pending ("status muda na hora", §5)
}

export interface ElevationStarted {
  readonly redirectUrl: string; // §3
  readonly resumeToken: string; // §3
  readonly elevationId: string; // source_pending: `{id}` de …/elevations/{id}/complete ([DIVERGE-14])
}

export interface ElevationCompleted {
  readonly assuranceLevel: 'simples' | 'avancada' | 'qualificada'; // "nível atualizado a partir da claim" (§3)
}
