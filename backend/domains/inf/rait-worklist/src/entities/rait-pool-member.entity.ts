// Generated from BP-INF-RAIT-WORKLIST-001 v1.0.0 sha256:a4378f112c84361ebe923b17329c2848218c3f266f9811c1b18090d9c79f0ee1
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
