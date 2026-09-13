// Generated from BP-CH-SCHEDULING-001 v1.0.0 sha256:fdbac09747b1d01ea1aa90821a792d537064443364d6a193ca6df5575d591513
export interface ProfessionalSchedule {
  id: string;
  tenant_id: string;
  professional_id: string;
  clinic_id: string;
  weekday: unknown;
  start_time: unknown;
  end_time: unknown;
  valid_from: string;
  valid_to?: string | null;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at?: string | null;
}
