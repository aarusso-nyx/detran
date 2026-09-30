// Generated from BP-CH-BILLING-001 v1.0.0 sha256:dbb379527f32d359e25dee36e8d7232af006c46466c5c86faef3d22de91db860
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
