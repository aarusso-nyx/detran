// Generated from BP-CH-BILLING-001 v1.0.0 sha256:8814fad00febff6787905872dd30b4f54fe6c33ab4b750bd471093d1e6186fe4
export interface CreateBillingItemDto {
  encounter_id?: string | null;
  telehealth_session_id?: string | null;
  item_kind: string;
  exam_kind?: string | null;
  source?: string;
  reference_number?: string | null;
  payload?: Record<string, unknown>;
}
