// Generated from BP-INF-ALCOHOL-001 v1.1.0 sha256:18decd0fa5855e93f40ce052c3ffb2ec4ad022530cd5da983fadf681a45bd246
export interface AlcoholTest {
  id: string;
  tenant_id: string;
  procedure_id: string;
  breathalyzer_id?: string | null;
  test_number?: string | null;
  tested_at: string;
  result_mg_l?: number | null;
  considered_mg_l?: number | null;
  max_error_mg_l?: number | null;
  counterproof: boolean;
  result_image_evidence_id?: string | null;
  status: string;
  created_at: string;
  updated_at?: string | null;
}
