// Generated from BP-CH-SCHEDULING-001 v1.0.0 sha256:fdbac09747b1d01ea1aa90821a792d537064443364d6a193ca6df5575d591513
export interface AppointmentAssignmentDraw {
  id: string;
  tenant_id: string;
  appointment_id: string;
  track: string;
  region_code: string;
  requested_at: string;
  seed_hex: string;
  considered_pool: Record<string, unknown>;
  selected_clinic_id: string;
  selected_professional_id: string;
  reroll_of?: string | null;
  reroll_reason?: string | null;
  superseded_at?: string | null;
  drawn_by: string;
  created_at: string;
  updated_at?: string | null;
}
