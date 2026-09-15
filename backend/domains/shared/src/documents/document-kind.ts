// Catálogo de tipos de documento legal (ADR-0018 §Decision 2), especificado
// pelo Architect em work/rounds/R-0006/contracts/CTG-0002-modules.md §f.1
// (Art. 10: o Architect especifica, o Engineer escreve). Os 12 tokens são
// canônicos — não são traduzidos nem abreviados (CODESTYLE §TypeScript).

/** ADR-0018 Decision 2: um template versionado por tipo de documento. */
export const DOCUMENT_KINDS = [
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
] as const;

export type DocumentKind = (typeof DOCUMENT_KINDS)[number];
