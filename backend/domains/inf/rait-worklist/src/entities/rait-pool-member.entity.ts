// Generated from BP-INF-RAIT-WORKLIST-001 v1.1.0 sha256:972161ec1957bb785b269fd1714f3431aae529393cf58c5a2ef7fa2984a65f8f
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
  created_at: string;
  updated_at?: string | null;
}
