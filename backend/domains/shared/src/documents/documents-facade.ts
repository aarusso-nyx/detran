// Assinatura da fachada de documentos (ADR-0018 §Decision 1 e 4),
// especificada pelo Architect em
// work/rounds/R-0006/contracts/CTG-0002-modules.md §f.3. Só tipos e
// interface: nenhuma implementação, nenhuma dependência nova (a montagem de
// `@stynx-nyx/pdf`, `@stynx-nyx/signature` e `@stynx-nyx/storage` nasce com
// os comandos em R-0007). Nenhum domínio chama renderer ou provedor de
// assinatura diretamente — todos passam por esta fachada.
import type { DetranRole } from '../roles.js';
import type { DocumentKind } from './document-kind.js';
import type { PdfaConformance } from './signature-policy.js';

/** ADR-0018 Decision 4: documento armazenado é imutável. */
export interface RenderedDocument {
  readonly documentId: string;
  readonly kind: DocumentKind;
  readonly storageKey: string;
  /** SHA-256 em 64 hex (ADR-0018 Decision 4). */
  readonly contentHash: string;
  readonly pdfaConformance: PdfaConformance | null;
  readonly supersedesDocumentId: string | null;
}

export interface SignedDocument extends RenderedDocument {
  readonly signatureRef: string;
}

export interface SealedDocument extends SignedDocument {
  readonly pdfaConformance: PdfaConformance;
  readonly sealedAt: string;
}

export interface DocumentSigner {
  readonly role: DetranRole;
  readonly personId: string;
  /** Certificado apresentado; RAIT.SIGNATURE_CERT_MISMATCH quando não confere. */
  readonly certificateRef: string | null;
}

export interface DocumentsFacade {
  render(
    templateKey: string,
    data: Record<string, unknown>,
  ): Promise<RenderedDocument>;
  sign(documentId: string, signer: DocumentSigner): Promise<SignedDocument>;
  seal(documentId: string): Promise<SealedDocument>;
}

/**
 * Três códigos já existentes no catálogo (rait-error-catalog.md §3.5-§3.6),
 * levantados pela fachada (ADR-0018 §Consequências) — nenhum código novo
 * nasce desta especificação.
 */
export const DOCUMENT_ERROR_CODES = {
  SIGNATURE_FAILED: 'RAIT.SIGNATURE_FAILED',
  SIGNATURE_CERT_MISMATCH: 'RAIT.SIGNATURE_CERT_MISMATCH',
  DOCUMENT_HASH_MISMATCH: 'RAIT.DOCUMENT_HASH_MISMATCH',
} as const;

export type DocumentErrorCode =
  (typeof DOCUMENT_ERROR_CODES)[keyof typeof DOCUMENT_ERROR_CODES];
