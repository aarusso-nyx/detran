// Generated from BP-INF-ALCOHOL-001 v1.0.0 sha256:72c248e25fda146066eccac64123aca6ffeb1112b114ed4f1f03237d033e93ec
export interface CreateAlcoholTestDto {
  procedure_id: string;
  breathalyzer_id?: string | null;
  test_number?: string | null;
  tested_at: string;
  result_mg_l?: number | null;
  counterproof?: boolean;
  result_image_evidence_id?: string | null;
  status?: string;
}
