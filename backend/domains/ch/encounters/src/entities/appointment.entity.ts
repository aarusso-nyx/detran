// Generated from BP-CH-ENCOUNTERS-001 v1.1.0 sha256:7931238eb7e2720ab74ab9e327a65f946e9feb0fd555a8658cbf413e7db8b48b
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
