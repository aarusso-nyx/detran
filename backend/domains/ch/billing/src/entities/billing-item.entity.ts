// Generated from BP-CH-BILLING-001 v1.0.0 sha256:b93ad2da6d0162ec02bff11759374782a27b26980a522e4c2c681e2daa1d9d53
export interface BillingItem {
  id: string;
  tenant_id: string;
  encounter_id?: string | null;
  telehealth_session_id?: string | null;
  federal_price_id?: string | null;
  item_kind: string;
  exam_kind?: string | null;
  source: string;
  amount_cents: number;
  reference_number?: string | null;
  status: string;
  payment_validated_at?: string | null;
  payload: Record<string, unknown>;
  created_by: string;
  created_at: string;
  updated_at?: string | null;
}
