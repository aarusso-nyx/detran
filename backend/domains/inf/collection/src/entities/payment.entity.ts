// Generated from BP-INF-COLLECTION-001 v1.0.2 sha256:10fb057463797bde8609b1b2a33435d80259cd90c69c2e991c5f42e355f924cd
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
