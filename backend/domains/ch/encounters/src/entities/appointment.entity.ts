// Generated from BP-CH-ENCOUNTERS-001 v1.2.0 sha256:91731d0164806f1b137025d46dbb65f5fc8ac203fbc84cf8c9affcf81be9a4b5
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
