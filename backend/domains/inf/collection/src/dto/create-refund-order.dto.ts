// Generated from BP-INF-COLLECTION-001 v1.0.1 sha256:eb2537783873c7670d66ebe362abad2fe79a9d8e834a0fd30145389f995741d6
export interface CreateRefundOrderDto {
  infraction_id: string;
  payment_id: string;
  reason: string;
  base_amount: number;
  index_key: string;
  updated_amount?: number | null;
  bank_data_status?: string;
  status?: string;
  opened_at?: string;
  ordered_at?: string | null;
  paid_at?: string | null;
  document_id?: string | null;
}
