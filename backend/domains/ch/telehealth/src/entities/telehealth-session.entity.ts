// Generated from BP-CH-TELEHEALTH-001 v1.0.0 sha256:1702fef12182de18153031eed0b113c29e2eaa1406ccd4477fea59340ea96206
export interface TelehealthSession {
  id: string;
  tenant_id: string;
  encounter_id: string;
  professional_id: string;
  appointment_id?: string | null;
  provider: string;
  external_session_id: string;
  lfd_required: boolean;
  lfd_passed: boolean;
  status: string;
  started_at: string;
  completed_at?: string | null;
  conclusion: Record<string, unknown>;
  created_by: string;
  created_at: string;
  updated_at?: string | null;
}
