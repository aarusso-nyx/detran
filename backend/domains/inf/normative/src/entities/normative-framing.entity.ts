// Generated from BP-INF-NORMATIVE-001 v1.1.0 sha256:41cbbec5aa5c5c6aa56495204f1b421d456abe78852bb03fd76a03715cbde6b1
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
