// Generated from BP-CH-BILLING-001 v1.0.0 sha256:8814fad00febff6787905872dd30b4f54fe6c33ab4b750bd471093d1e6186fe4
export interface BillingItem {
  id: string;
  tenant_id: string;
  encounter_id?: string | null;
  telehealth_session_id?: string | null;
  federal_price_id?: string | null;
  item_kind: string;
  exam_kind?: string | null;
  source: string;
  amount_cents: number;
  reference_number?: string | null;
  status: string;
  payment_validated_at?: string | null;
  payload: Record<string, unknown>;
  created_by: string;
  created_at: string;
  updated_at?: string | null;
}
