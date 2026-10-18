// Generated from BP-CH-ENCOUNTERS-001 v1.2.1 sha256:0eae9fa8ccfb086eba21de22f3a9d379e0256092be9e903b2c7feea4c664ec92
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
