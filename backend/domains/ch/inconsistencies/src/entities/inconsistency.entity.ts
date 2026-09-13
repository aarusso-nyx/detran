// Generated from BP-CH-INCONSISTENCIES-001 v1.0.0 sha256:8d41845822fa8f12974a6647c408a271a91454cc1edf96a2d24a695385b1f72e
export interface Inconsistency {
  id: string;
  tenant_id: string;
  encounter_id?: string | null;
  source_system: string;
  severity: string;
  status: string;
  detection_reason: string;
  detection_payload: Record<string, unknown>;
  correction: Record<string, unknown>;
  resolution_note?: string | null;
  notified_at?: string | null;
  corrected_at?: string | null;
  reprocessed_at?: string | null;
  closed_at?: string | null;
  due_at: string;
  created_by: string;
  updated_by?: string | null;
  created_at: string;
  updated_at?: string | null;
}
