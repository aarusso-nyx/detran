// Generated from BP-INF-RAIT-WORKLIST-001 v1.4.1 sha256:fc1505677703646b1e55dc6283e1e0cce5331627fd5b9bd0ed732c1a77c00430
export interface RaitPoolMember {
  id: string;
  tenant_id: string;
  pool_id: string;
  person_id: string;
  member_role: string;
  status: string;
  mandate_starts_on?: string | null;
  mandate_ends_on?: string | null;
  late_opinion_count: number;
  unjustified_absence_count: number;
  is_substitute: boolean;
  jurisdiction?: string | null;
  agency_jurisdiction_id?: string | null;
  representation_block?: string | null;
  institutional_seat_ref?: string | null;
  appointment_act_ref?: string | null;
  institutional_valid_from?: string | null;
  institutional_valid_to?: string | null;
  institutional_identity_hash?: string | null;
  created_at: string;
  updated_at?: string | null;
}
