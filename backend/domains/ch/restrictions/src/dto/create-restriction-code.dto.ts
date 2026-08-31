// Generated from BP-CH-RESTRICTIONS-001 v1.0.0 sha256:05527c0aea012ece64e79955246e666899d444700b824e484f1800ff151769bf
export interface CreateRestrictionCodeDto {
  code: string;
  legal_label: string;
  annex_version: string;
  source_reference: string;
  effective_from: string;
  effective_to?: string | null;
  is_active?: boolean;
}
