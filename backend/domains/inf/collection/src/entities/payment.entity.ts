// Generated from BP-INF-COLLECTION-001 v1.0.0 sha256:9553391da82dfaf5acf236128822deb730f18b660ab5416e12bdbb0014ca1c7f
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
