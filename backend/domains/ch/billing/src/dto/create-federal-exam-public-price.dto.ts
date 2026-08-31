// Generated from BP-CH-BILLING-001 v1.0.0 sha256:8814fad00febff6787905872dd30b4f54fe6c33ab4b750bd471093d1e6186fe4
export interface CreateFederalExamPublicPriceDto {
  exam_kind: string;
  amount_cents: number;
  effective_from: string;
  effective_to?: string | null;
  ipca_reference_year: number;
  index_name?: string;
  federal_source_reference: string;
  published_at: string;
}
