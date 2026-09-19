// Generated from BP-INF-ALCOHOL-001 v1.2.0 sha256:f54fa6e2f04e73d65b7b187ded6fe373d6b14c80f840688310d1f09b9420e20f
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
