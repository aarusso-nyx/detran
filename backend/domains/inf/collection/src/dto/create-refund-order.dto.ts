// Generated from BP-INF-COLLECTION-001 v1.0.0 sha256:9553391da82dfaf5acf236128822deb730f18b660ab5416e12bdbb0014ca1c7f
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
