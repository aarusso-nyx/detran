// Generated from BP-CH-BILLING-001 v1.0.0 sha256:dbb379527f32d359e25dee36e8d7232af006c46466c5c86faef3d22de91db860
export interface FederalExamPublicPrice {
  id: string;
  tenant_id: string;
  exam_kind: string;
  amount_cents: number;
  effective_from: string;
  effective_to?: string | null;
  ipca_reference_year: number;
  index_name: string;
  federal_source_reference: string;
  published_at: string;
  created_by: string;
  created_at: string;
  updated_at?: string | null;
}
