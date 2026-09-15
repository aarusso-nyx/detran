// Tipo da política de assinatura (ADR-0018 §Decision 3), especificado pelo
// Architect em work/rounds/R-0006/contracts/CTG-0002-modules.md §f.2. A
// política é dado, não código: a tabela `inf.signature_policy` nasce em
// R-0008 (frente dona de `inf/normative`); aqui só o tipo do dado que a
// fachada lê.
import type { DetranRole } from '../roles.js';
import type { DocumentKind } from './document-kind.js';

/**
 * ADR-0018 Decision 3: a única exigência de nível com fonte no corpus é
 * PAdES-B-LT + TSA para decisões e atas (steering A.8). Outros níveis são
 * OD proposta — a união cresce quando a decisão existir.
 */
export type PadesLevel = 'PAdES-B-LT';

/** Conformidade validada por @stynx-nyx/pdf-a (ADR-0018 Context). */
export type PdfaConformance = 'PDF/A-2b';

export interface SignerRequirement {
  readonly role: DetranRole;
  readonly minCount: number;
}

export interface SignaturePolicy {
  readonly kind: DocumentKind;
  readonly signers: readonly SignerRequirement[];
  readonly padesLevel: PadesLevel;
  readonly tsaRequired: boolean;
  readonly pdfaRequired: boolean;
  /**
   * Nível gov.br exigido do cidadão (ADR-0018 Decision 3, por WF-PORTAL-002).
   * O vocabulário de níveis é `source_pending` (OD proposta 3): tipado como
   * string até a decisão, nulo quando o ato não é de cidadão.
   */
  readonly govBrLevel: string | null;
}
