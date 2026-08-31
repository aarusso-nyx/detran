// Generated from BP-CH-BILLING-001 v1.0.0 sha256:b93ad2da6d0162ec02bff11759374782a27b26980a522e4c2c681e2daa1d9d53
export interface BillingDivergence {
  id: string;
  tenant_id: string;
  invoice_id?: string | null;
  item_id?: string | null;
  status: string;
  reason: string;
  resolution?: string | null;
  payload: Record<string, unknown>;
  created_by: string;
  resolved_by?: string | null;
  resolved_at?: string | null;
  created_at: string;
  updated_at?: string | null;
}
