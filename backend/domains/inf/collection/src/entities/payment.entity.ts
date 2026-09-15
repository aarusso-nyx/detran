// Generated from BP-INF-COLLECTION-001 v1.0.0 sha256:72e0af13a687dd9bcaa3931941707644a2214b4ece8daa63d55712fee4ad0243
export interface Payment {
  id: string;
  tenant_id: string;
  document_id?: string | null;
  bank_reference: string;
  paid_on: string;
  amount: number;
  tier_applied?: string | null;
  received_at: string;
  matched_at?: string | null;
  reversed_at?: string | null;
  created_at: string;
  updated_at?: string | null;
}
