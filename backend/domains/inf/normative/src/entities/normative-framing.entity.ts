// Generated from BP-INF-NORMATIVE-001 v1.1.0 sha256:79161caba1463941727a4a6ad952f010c399cca7df3febfa1cf881ac14c7ca52
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
