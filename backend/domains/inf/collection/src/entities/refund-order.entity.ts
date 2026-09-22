// Generated from BP-INF-COLLECTION-001 v1.0.2 sha256:10fb057463797bde8609b1b2a33435d80259cd90c69c2e991c5f42e355f924cd
export interface RefundOrder {
  id: string;
  tenant_id: string;
  infraction_id: string;
  payment_id: string;
  reason: string;
  base_amount: number;
  index_key: string;
  updated_amount?: number | null;
  bank_data_status: string;
  status: string;
  opened_at: string;
  ordered_at?: string | null;
  paid_at?: string | null;
  document_id?: string | null;
  created_at: string;
  updated_at?: string | null;
}
