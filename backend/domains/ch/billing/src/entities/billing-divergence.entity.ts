// Generated from BP-CH-BILLING-001 v1.0.0 sha256:8814fad00febff6787905872dd30b4f54fe6c33ab4b750bd471093d1e6186fe4
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
