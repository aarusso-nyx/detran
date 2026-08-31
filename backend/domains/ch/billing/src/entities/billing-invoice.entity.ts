// Generated from BP-CH-BILLING-001 v1.0.0 sha256:b93ad2da6d0162ec02bff11759374782a27b26980a522e4c2c681e2daa1d9d53
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
