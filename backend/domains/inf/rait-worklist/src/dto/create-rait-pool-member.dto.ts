// Generated from BP-INF-RAIT-WORKLIST-001 v1.5.1 sha256:d64b808c363287ff59a68d90dcc41991994d835a49117d5a16e61314f2edd48b
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
