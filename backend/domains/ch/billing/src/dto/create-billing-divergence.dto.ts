// Generated from BP-CH-BILLING-001 v1.0.0 sha256:8814fad00febff6787905872dd30b4f54fe6c33ab4b750bd471093d1e6186fe4
export interface CreateBillingDivergenceDto {
  invoice_id?: string | null;
  item_id?: string | null;
  reason: string;
  payload?: Record<string, unknown>;
}
