// Generated from BP-CH-REPORTS-001 v1.3.0 sha256:223e3b4e60807d8ac51bcd6d9e1294a65ca305509b8ff1dc2f93649c7f3aa1a5
export interface RegistrationBlockNotice {
  id: string;
  tenant_id: string;
  report_id: string;
  source_addendum_id?: string | null;
  encounter_id: string;
  professional_id: string;
  track: string;
  result: string;
  legal_result_label: string;
  inaptitude_until?: string | null;
  recipients: Record<string, unknown>;
  channel: string;
  status: string;
  delivered_at: string;
  created_by: string;
  created_at: string;
  updated_at?: string | null;
}
