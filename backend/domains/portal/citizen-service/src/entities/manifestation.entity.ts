// Generated from BP-PORTAL-CITIZEN-SERVICE-001 v1.0.1 sha256:81c05ec48ec8ab36465ae1b250c4a59f59931b99835bfd1ef52f3b10520f9029
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
