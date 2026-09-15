// Generated from BP-INF-COLLECTION-001 v1.0.1 sha256:eb2537783873c7670d66ebe362abad2fe79a9d8e834a0fd30145389f995741d6
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
