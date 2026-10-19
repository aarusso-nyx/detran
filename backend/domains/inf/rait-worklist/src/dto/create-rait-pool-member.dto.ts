// Generated from BP-INF-RAIT-WORKLIST-001 v1.5.2 sha256:dbdb30cf6d6e61f8180f89ece1cf3a2b22b13e3bb2d41e3480c7d13f917688f5
export interface CreateRaitPoolMemberDto {
  pool_id: string;
  person_id: string;
  member_role: string;
  status?: string;
  mandate_starts_on?: string | null;
  mandate_ends_on?: string | null;
  late_opinion_count?: number;
  unjustified_absence_count?: number;
  is_substitute?: boolean;
  jurisdiction?: string | null;
  agency_jurisdiction_id?: string | null;
  representation_block?: string | null;
  institutional_seat_ref?: string | null;
  appointment_act_ref?: string | null;
  institutional_valid_from?: string | null;
  institutional_valid_to?: string | null;
}
