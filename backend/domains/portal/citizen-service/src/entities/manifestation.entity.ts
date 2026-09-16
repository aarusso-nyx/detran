// Generated from BP-PORTAL-CITIZEN-SERVICE-001 v1.0.0 sha256:adb8933e9c3c31077273c68bff12efa5e0bfefa8843cdc29798c6d43fa63a246
export interface Manifestation {
  id: string;
  tenant_id: string;
  state: string;
  kind: string;
  confidential: boolean;
  anonymous: boolean;
  subject_id?: string | null;
  text: string;
  protocol: string;
  received_at: string;
  agency_due_on: string;
  info_due_on?: string | null;
  decision_text?: string | null;
  decided_at?: string | null;
  acknowledged_at?: string | null;
  version: number;
  created_at: string;
  updated_at?: string | null;
}
