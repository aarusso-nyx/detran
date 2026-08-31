// Generated from BP-CH-PATIENTS-001 v1.0.0 sha256:fd85a6f24243cbbe4dc9776184762d2ce9698f1b3d0a6b3dad88bbc31ba43d65
export interface Patient {
  id: string;
  tenant_id: string;
  clinic_id?: string | null;
  national_id: string;
  name: string;
  social_name?: string | null;
  birth_date?: string | null;
  gender?: string | null;
  mother_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  address?: string | null;
  created_at: string;
  updated_at?: string | null;
}
