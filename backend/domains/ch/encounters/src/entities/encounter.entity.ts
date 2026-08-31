// Generated from BP-CH-ENCOUNTERS-001 v1.0.0 sha256:a45f4d9aa68b80d085d4e052deb019f227158b561404fdd7e02b5260b8347912
export interface Encounter {
  id: string;
  tenant_id: string;
  clinic_id: string;
  patient_id: string;
  appointment_id?: string | null;
  renach_process_key?: string | null;
  renach_process_type?: string | null;
  current_category?: string | null;
  requested_category?: string | null;
  status: string;
  started_at: string;
  closed_at?: string | null;
  cancelled_at?: string | null;
  cancel_reason?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
  created_at: string;
  updated_at?: string | null;
}
