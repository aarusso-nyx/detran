// Generated from BP-CH-ENCOUNTERS-001 v1.0.0 sha256:a45f4d9aa68b80d085d4e052deb019f227158b561404fdd7e02b5260b8347912
export interface Appointment {
  id: string;
  tenant_id: string;
  clinic_id: string;
  patient_id: string;
  professional_id?: string | null;
  scheduled_at: string;
  status: string;
  created_by?: string | null;
  updated_by?: string | null;
  created_at: string;
  updated_at?: string | null;
}
