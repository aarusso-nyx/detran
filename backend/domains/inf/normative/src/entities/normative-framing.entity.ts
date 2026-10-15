// Generated from BP-INF-NORMATIVE-001 v1.2.0 sha256:ce4605cd48d6677dc9c5dd6373c5e2500e57fbd2f114d497422e06914a937588
export interface NormativeFraming {
  id: string;
  tenant_id: string;
  catalog_id: string;
  framing_code: string;
  article?: string | null;
  clause?: string | null;
  description: string;
  severity?: string | null;
  penalty?: string | null;
  administrative_measure_summary?: string | null;
  approach_class: string;
  required_fields?: Record<string, unknown> | null;
  required_instrument: boolean;
  points_label?: string | null;
  requires_observation: boolean;
  requires_equipment: boolean;
  status: string;
  created_at: string;
  updated_at?: string | null;
}
