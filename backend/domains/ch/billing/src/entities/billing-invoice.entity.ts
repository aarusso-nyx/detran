// Generated from BP-CH-BILLING-001 v1.0.0 sha256:8814fad00febff6787905872dd30b4f54fe6c33ab4b750bd471093d1e6186fe4
export interface BillingInvoice {
  id: string;
  tenant_id: string;
  clinic_id?: string | null;
  reference_period: string;
  status: string;
  total_cents: number;
  payload: Record<string, unknown>;
  closed_at?: string | null;
  attested_at?: string | null;
  paid_at?: string | null;
  created_by: string;
  created_at: string;
  updated_at?: string | null;
}
