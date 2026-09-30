// Generated from BP-CH-BILLING-001 v1.0.0 sha256:dbb379527f32d359e25dee36e8d7232af006c46466c5c86faef3d22de91db860
export interface CreateBillingItemDto {
  encounter_id?: string | null;
  telehealth_session_id?: string | null;
  item_kind: string;
  exam_kind?: string | null;
  source?: string;
  reference_number?: string | null;
  payload?: Record<string, unknown>;
}
