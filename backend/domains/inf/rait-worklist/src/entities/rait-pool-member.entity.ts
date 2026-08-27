// Generated from BP-INF-RAIT-WORKLIST-001 v1.0.0 sha256:2297f42351909b6ac68f4a18e7c8b535508fa219dfdaa0f9b087f1ca3b745234
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
  created_at: string;
  updated_at?: string | null;
}
