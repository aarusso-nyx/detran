// Generated from BP-CH-ENCOUNTERS-001 v1.2.1 sha256:b72b0b7aad32b908d777d9b44b885244d74a7a214c442fecc03551811f18b2fd
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
