// Generated from BP-CH-PATIENTS-001 v1.1.0 sha256:0d66678ac2689c982108492124f246cf667b4a6004a170339d827cb56e0c95e9
export interface Patient {
  id: string;
  tenant_id: string;
  clinic_id?: string | null;
  user_id?: string | null;
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
