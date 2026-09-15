// Generated from BP-INF-COLLECTION-001 v1.0.0 sha256:72e0af13a687dd9bcaa3931941707644a2214b4ece8daa63d55712fee4ad0243
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
