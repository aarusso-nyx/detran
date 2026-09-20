// Teste de tipos da fachada de documentos especificada em
// work/rounds/R-0006/contracts/CTG-0002-modules.md §f (ADR-0018 §Decision 1-4). A fachada em si
// é escrita pelo Engineer em TASK-0007 (Art. 10: o Architect especifica, o Engineer escreve) —
// este arquivo fica vermelho nesta entrega (módulo ausente) e prova, quando os arquivos
// existirem, que os 12 tokens de DocumentKind, a forma de SignaturePolicy, a assinatura dos três
// métodos de DocumentsFacade e as três chaves de DOCUMENT_ERROR_CODES batem com a especificação.
import { describe, expect, expectTypeOf, it } from 'vitest';

import type { DetranRole } from '../roles.js';
import {
  DOCUMENT_ERROR_CODES,
  DOCUMENT_KINDS,
  type DocumentErrorCode,
  type DocumentKind,
  type DocumentsFacade,
  type DocumentSigner,
  type PadesLevel,
  type PdfaConformance,
  type RenderedDocument,
  type SealedDocument,
  type SignaturePolicy,
  type SignedDocument,
  type SignerRequirement,
} from '../documents/index.js';

describe('DocumentKind (ADR-0018 §Decision 2 — 13 tokens canônicos, sem tradução)', () => {
  it('dado o catálogo DOCUMENT_KINDS quando lido então tem exatamente os 13 tokens, na ordem da especificação', () => {
    expect(DOCUMENT_KINDS).toEqual([
      'AIT',
      'NA',
      'NP',
      'EDITAL',
      'DECISAO_DEFESA',
      'PARECER',
      'ATA',
      'ATA_SORTEIO',
      'DOCUMENTO_ARRECADACAO',
      'ORDEM_RESTITUICAO',
      'COMPROVANTE_PROTOCOLO',
      'CERTIDAO',
      'RELATORIO_PRELIMINAR_SINISTRO',
    ]);
    expect(DOCUMENT_KINDS).toHaveLength(13);
  });

  it('dado o tipo DocumentKind quando comparado então é a união literal dos 12 tokens de DOCUMENT_KINDS', () => {
    expectTypeOf<DocumentKind>().toEqualTypeOf<
      (typeof DOCUMENT_KINDS)[number]
    >();
    expectTypeOf<'AIT'>().toMatchTypeOf<DocumentKind>();
    expectTypeOf<'CERTIDAO'>().toMatchTypeOf<DocumentKind>();
  });
});

describe('SignaturePolicy (ADR-0018 §Decision 3 — política é dado, não código)', () => {
  it('dado o tipo SignerRequirement quando comparado então exige role (DetranRole) e minCount (number)', () => {
    expectTypeOf<SignerRequirement>().toMatchTypeOf<{
      readonly role: DetranRole;
      readonly minCount: number;
    }>();
  });

  it('dado o tipo SignaturePolicy quando comparado então tem kind, signers, padesLevel, tsaRequired, pdfaRequired e govBrLevel', () => {
    expectTypeOf<SignaturePolicy>().toMatchTypeOf<{
      readonly kind: DocumentKind;
      readonly signers: readonly SignerRequirement[];
      readonly padesLevel: PadesLevel;
      readonly tsaRequired: boolean;
      readonly pdfaRequired: boolean;
      readonly govBrLevel: string | null;
    }>();
  });

  it('dado o tipo PadesLevel quando comparado então inclui ausência aprovada e PAdES-B-LT', () => {
    expectTypeOf<PadesLevel>().toEqualTypeOf<'NONE' | 'PAdES-B-LT'>();
  });
});

describe('DocumentsFacade (ADR-0018 §Decision 1 e 4 — render/sign/seal, tenant fora da assinatura)', () => {
  it('dado o tipo DocumentsFacade quando comparado então render/sign/seal têm exatamente a assinatura da especificação', () => {
    expectTypeOf<DocumentsFacade['render']>().parameters.toEqualTypeOf<
      [templateKey: string, data: Record<string, unknown>]
    >();
    expectTypeOf<DocumentsFacade['render']>().returns.toEqualTypeOf<
      Promise<RenderedDocument>
    >();
    expectTypeOf<DocumentsFacade['sign']>().parameters.toEqualTypeOf<
      [documentId: string, signer: DocumentSigner]
    >();
    expectTypeOf<DocumentsFacade['sign']>().returns.toEqualTypeOf<
      Promise<SignedDocument>
    >();
    expectTypeOf<DocumentsFacade['seal']>().parameters.toEqualTypeOf<
      [documentId: string]
    >();
    expectTypeOf<DocumentsFacade['seal']>().returns.toEqualTypeOf<
      Promise<SealedDocument>
    >();
    expectTypeOf<DocumentsFacade['read']>().returns.toEqualTypeOf<
      Promise<Uint8Array>
    >();
  });

  it('dado o tipo RenderedDocument quando comparado então tem documentId, kind, storageKey, contentHash, pdfaConformance e supersedesDocumentId', () => {
    expectTypeOf<RenderedDocument>().toMatchTypeOf<{
      readonly documentId: string;
      readonly kind: DocumentKind;
      readonly storageKey: string;
      readonly contentHash: string;
      readonly pdfaConformance: PdfaConformance | null;
      readonly supersedesDocumentId: string | null;
    }>();
  });

  it('dado o tipo SealedDocument quando comparado então aceita selo técnico sem assinatura', () => {
    expectTypeOf<SealedDocument>().toMatchTypeOf<
      RenderedDocument & {
        readonly signatureRef: string | null;
        readonly pdfaConformance: PdfaConformance;
        readonly sealedAt: string;
      }
    >();
  });
});

describe('DOCUMENT_ERROR_CODES (ADR-0018 §Consequências — códigos já existentes no catálogo)', () => {
  it('dado o catálogo DOCUMENT_ERROR_CODES quando lido então tem exatamente as três chaves do catálogo (rait-error-catalog.md §3.5-§3.6)', () => {
    expect(DOCUMENT_ERROR_CODES).toEqual({
      SIGNATURE_FAILED: 'RAIT.SIGNATURE_FAILED',
      SIGNATURE_CERT_MISMATCH: 'RAIT.SIGNATURE_CERT_MISMATCH',
      DOCUMENT_HASH_MISMATCH: 'RAIT.DOCUMENT_HASH_MISMATCH',
    });
    expect(Object.keys(DOCUMENT_ERROR_CODES)).toHaveLength(3);
  });

  it('dado o tipo DocumentErrorCode quando comparado então é a união dos três valores de DOCUMENT_ERROR_CODES', () => {
    expectTypeOf<DocumentErrorCode>().toEqualTypeOf<
      (typeof DOCUMENT_ERROR_CODES)[keyof typeof DOCUMENT_ERROR_CODES]
    >();
  });
});
