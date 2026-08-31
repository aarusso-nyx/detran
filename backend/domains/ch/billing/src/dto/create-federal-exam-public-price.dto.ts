// Generated from BP-CH-BILLING-001 v1.0.0 sha256:b93ad2da6d0162ec02bff11759374782a27b26980a522e4c2c681e2daa1d9d53
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
