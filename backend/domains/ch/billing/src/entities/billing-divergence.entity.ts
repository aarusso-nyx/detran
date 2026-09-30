// Generated from BP-CH-BILLING-001 v1.0.0 sha256:dbb379527f32d359e25dee36e8d7232af006c46466c5c86faef3d22de91db860
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
